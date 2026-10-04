/* Miau-Memory – KS.Logic: reine Spiellogik ohne DOM.
   Layout, Deck, Zuglogik mit „Super gemerkt“, Tipps, Welt-Rotation, Sternenglas, Einstellungen, Sätze.
   Läuft im Browser (klassisches Skript) und in Node (Unit-Tests). */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var L = (KS.Logic = {});

  /* ---------- Stammdaten ---------- */

  L.CAT_IDS = ['minka', 'kruemel', 'flocke', 'tiger', 'puenktchen', 'socke', 'momo', 'lotte', 'schnurri', 'sternchen', 'rosi', 'wuschel'];

  /** Ähnlichkeitsgruppen (Konzept 5.2): in Stufe 1 und 2 höchstens eine Katze pro Gruppe */
  L.SIMILAR = [['kruemel', 'socke'], ['flocke', 'puenktchen'], ['tiger', 'schnurri'], ['minka', 'wuschel', 'lotte']];

  L.LEVELS = [
    { level: 1, pairs: 3, distinct: true },
    { level: 2, pairs: 4, distinct: true },
    { level: 3, pairs: 6, distinct: false },
    { level: 4, pairs: 8, distinct: false },
  ];

  L.WORLDS = ['livingroom', 'garden', 'night', 'winter', 'beach', 'autumn', 'clouds'];

  L.MILESTONES = [10, 25, 50, 100, 200, 500];

  L.levelInfo = function (level) {
    var i = Math.max(1, Math.min(4, Math.round(+level || 1))) - 1;
    return L.LEVELS[i];
  };

  /* ---------- Layout (Konzept 12.7) ---------- */

  /**
   * Wählt Spalten und Zeilen so, dass die Verstecke möglichst groß werden.
   * n Karten, Fläche W×H. Karten im Seitenverhältnis 200:230, Abstand ~6 % der Kartenbreite.
   * Unvollständige letzte Reihen bekommen einen leichten Malus und werden zentriert.
   */
  L.layoutGrid = function (n, W, H, opts) {
    opts = opts || {};
    var aspect = opts.aspect || 230 / 200;
    var gap = opts.gap === undefined ? 0.06 : opts.gap;
    var malus = opts.malus === undefined ? 0.07 : opts.malus;
    var maxW = opts.maxW || Infinity;
    if (!(n > 0) || !(W > 0) || !(H > 0)) {
      return { cols: 0, rows: 0, w: 0, h: 0, gap: 0, x: 0, y: 0, width: 0, height: 0, cards: [] };
    }
    var best = null;
    for (var cols = 1; cols <= n; cols++) {
      var rows = Math.ceil(n / cols);
      if ((rows - 1) * cols >= n) continue; // leere Reihe
      var w1 = W / (cols + (cols - 1) * gap);
      var w2 = H / (aspect * (rows + (rows - 1) * gap));
      var w = Math.min(w1, w2, maxW);
      var last = n - (rows - 1) * cols;
      var score = w * (last < cols ? 1 - malus * (1 - last / cols) * 2 : 1);
      if (!best || score > best.score + 1e-9) best = { cols: cols, rows: rows, w: w, score: score };
    }
    var cw = best.w;
    var ch = cw * aspect;
    var g = cw * gap;
    var gridW = best.cols * cw + (best.cols - 1) * g;
    var gridH = best.rows * ch + (best.rows - 1) * g;
    var x0 = (W - gridW) / 2;
    var y0 = (H - gridH) / 2;
    var cards = [];
    for (var i = 0; i < n; i++) {
      var row = Math.floor(i / best.cols);
      var col = i % best.cols;
      var inRow = row === best.rows - 1 ? n - row * best.cols : best.cols;
      var shift = ((best.cols - inRow) * (cw + g)) / 2;
      cards.push({ x: x0 + shift + col * (cw + g), y: y0 + row * (ch + g), w: cw, h: ch, row: row, col: col });
    }
    return { cols: best.cols, rows: best.rows, w: cw, h: ch, gap: g, x: x0, y: y0, width: gridW, height: gridH, cards: cards };
  };

  /** Höhe der Spielleiste: ~12 % der Fensterhöhe, mindestens 64 px (Knöpfe) plus Rand */
  L.barHeight = function (H) {
    return Math.round(Math.max(76, Math.min(118, H * 0.12)));
  };

  /* ---------- Katzenauswahl und Deck (Konzept 4, 5.2) ---------- */

  function groupOf(id) {
    for (var i = 0; i < L.SIMILAR.length; i++) if (L.SIMILAR[i].indexOf(id) >= 0) return i;
    return -1;
  }
  L.groupOf = groupOf;

  /** Zieht die Katzen einer Runde. rng: KS.U.rng(...) */
  L.pickCats = function (level, ids, rng) {
    var info = L.levelInfo(level);
    ids = ids || L.CAT_IDS;
    var pool = rng.shuffle(ids);
    if (!info.distinct) return pool.slice(0, info.pairs);
    var used = {};
    var out = [];
    for (var i = 0; i < pool.length && out.length < info.pairs; i++) {
      var g = groupOf(pool[i]);
      if (g >= 0 && used[g]) continue;
      if (g >= 0) used[g] = true;
      out.push(pool[i]);
    }
    return out;
  };

  /** Deck: jede Katze zweimal, zufällig verteilt */
  L.makeDeck = function (level, ids, rng) {
    var cats = L.pickCats(level, ids, rng);
    var deck = rng.shuffle(cats.concat(cats));
    return { cats: cats, deck: deck };
  };

  /* ---------- Zuglogik (Konzept 3.3, 9.1) ---------- */

  L.newRound = function (deck) {
    return {
      cards: deck.map(function (cat) { return { cat: cat, open: false, found: false, seen: false }; }),
      first: -1,
      firstWasNew: false,
      pending: null, // [a, b] bei einem Fehlpaar, bis closeMiss()
      pairs: 0,
      totalPairs: deck.length / 2,
      stars: 0,
      bonus: 0,
      missStreak: 0,
      misses: 0,
      flips: 0,
      log: [], // [{a, b, cat, bonus}] in Fundreihenfolge
    };
  };

  /**
   * Deckt Karte i auf.
   * Rückgabe: {type: 'none'} | {type: 'first', index} | {type: 'match', a, b, cat, bonus, lucky, done}
   *           | {type: 'miss', a, b, streak}
   */
  L.flip = function (round, i) {
    var card = round.cards[i];
    if (!card || card.open || card.found || round.pending) return { type: 'none' };
    card.open = true;
    round.flips++;
    var wasSeen = card.seen;
    card.seen = true;
    if (round.first < 0) {
      round.first = i;
      round.firstWasNew = !wasSeen;
      return { type: 'first', index: i };
    }
    var a = round.first;
    var b = i;
    round.first = -1;
    var ca = round.cards[a];
    if (ca.cat === card.cat) {
      ca.found = card.found = true;
      var bonus = wasSeen; // Die zweite Karte war schon einmal offen → Platz gemerkt
      var lucky = !wasSeen && round.firstWasNew;
      round.pairs++;
      round.stars += bonus ? 2 : 1;
      if (bonus) round.bonus++;
      round.missStreak = 0;
      round.log.push({ a: a, b: b, cat: card.cat, bonus: bonus });
      return { type: 'match', a: a, b: b, cat: card.cat, bonus: bonus, lucky: lucky, done: round.pairs === round.totalPairs };
    }
    round.pending = [a, b];
    round.missStreak++;
    round.misses++;
    return { type: 'miss', a: a, b: b, streak: round.missStreak };
  };

  /** Schließt ein Fehlpaar wieder */
  L.closeMiss = function (round) {
    if (!round.pending) return null;
    var p = round.pending;
    round.cards[p[0]].open = false;
    round.cards[p[1]].open = false;
    round.pending = null;
    return p;
  };

  /** Welche Wirkung hat ein Tipp auf eine Karte im Zustand phase? (Konzept 13.2) */
  L.tapAction = function (phase, card) {
    if (card && (card.open || card.found)) return 'cat';
    if (phase === 'play') return 'open';
    if (phase === 'resolving' || phase === 'intro' || phase === 'preview') return 'wiggle';
    return 'none';
  };

  /** Tipp: ein noch nicht gefundenes Paar. Ist schon eine Karte offen, deren Zwilling. */
  L.hintPair = function (round, rng) {
    var c = round.cards;
    if (round.first >= 0) {
      for (var j = 0; j < c.length; j++) if (j !== round.first && c[j].cat === c[round.first].cat) return [round.first, j];
    }
    var cats = [];
    c.forEach(function (card) { if (!card.found && !card.open && cats.indexOf(card.cat) < 0) cats.push(card.cat); });
    // nur Paare, bei denen beide Karten geschlossen sind
    cats = cats.filter(function (cat) {
      return c.filter(function (x) { return x.cat === cat && !x.found && !x.open; }).length === 2;
    });
    if (!cats.length) return null;
    var cat = rng.pick(cats);
    var out = [];
    c.forEach(function (card, i) { if (card.cat === cat) out.push(i); });
    return out;
  };

  /** Anzahl Tipps für die Einstellung (−1 = unbegrenzt) */
  L.hintsFor = function (setting) {
    return setting < 0 ? Infinity : setting;
  };

  /* ---------- Welt-Rotation (Konzept 7.4) ---------- */

  /** Nie dieselbe Welt wie zuletzt, bevorzugt die, die am längsten nicht dran war. */
  L.pickWorld = function (worlds, history, rng) {
    worlds = worlds || L.WORLDS;
    history = Array.isArray(history) ? history : [];
    var last = history.length ? history[history.length - 1] : null;
    var cands = worlds.filter(function (w) { return w !== last; });
    if (!cands.length) cands = worlds.slice();
    var bestAge = Infinity;
    var ties = [];
    cands.forEach(function (w) {
      var idx = history.lastIndexOf(w); // −1 = noch nie gespielt → bevorzugt
      if (idx < bestAge) { bestAge = idx; ties = [w]; }
      else if (idx === bestAge) ties.push(w);
    });
    return rng.pick(ties);
  };

  L.recordWorld = function (history, world, max) {
    var h = (Array.isArray(history) ? history : []).filter(function (w) { return L.WORLDS.indexOf(w) >= 0; });
    h.push(world);
    max = max || 30;
    return h.slice(-max);
  };

  /* ---------- Sterne (Konzept 9.1) ---------- */

  L.addStars = function (total, add) {
    total = Math.max(0, Math.floor(+total || 0));
    add = Math.max(0, Math.floor(+add || 0));
    var after = total + add;
    return {
      total: after,
      milestones: L.MILESTONES.filter(function (m) { return total < m && after >= m; }),
    };
  };

  /** Füllstand des Sternenglases 0..1: bis zum nächsten Meilenstein wird das Glas voll */
  L.jarLevel = function (total) {
    total = Math.max(0, total | 0);
    var prev = 0;
    for (var i = 0; i < L.MILESTONES.length; i++) {
      var m = L.MILESTONES[i];
      if (total < m) return (total - prev) / (m - prev);
      prev = m;
    }
    return 1;
  };

  /* ---------- Einstellungen (Konzept 12.5) ---------- */

  L.OPTIONS = {
    preview: [0, 2, 4],
    missDelay: [1.2, 1.8, 2.5, 3.5],
    hints: [0, 3, 5, -1],
    level: [1, 2, 3, 4],
    sound: ['all', 'nomusic', 'off'],
  };

  L.DEFAULT_SETTINGS = {
    childName: '',
    volume: 0.8,
    music: true,
    ambience: true,
    speech: true,
    onlineVoice: false,
    sayNames: false,
    tellMore: false,
    preview: 2,
    missDelay: 1.8,
    hints: 3,
    level: 1,
    sound: 'all',
  };

  /** Name nur mit Buchstaben, Leerzeichen, Bindestrich, höchstens 20 Zeichen */
  L.cleanName = function (s) {
    s = String(s || '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\- ]/g, '').replace(/\s+/g, ' ').trim();
    return s.slice(0, 20).trim();
  };

  L.sanitizeSettings = function (obj) {
    var d = L.DEFAULT_SETTINGS;
    var o = obj && typeof obj === 'object' ? obj : {};
    var out = {};
    function bool(k) { out[k] = typeof o[k] === 'boolean' ? o[k] : d[k]; }
    function opt(k) { out[k] = L.OPTIONS[k].indexOf(o[k]) >= 0 ? o[k] : d[k]; }
    out.childName = L.cleanName(o.childName);
    var v = +o.volume;
    out.volume = isFinite(v) && o.volume !== null && o.volume !== '' ? Math.max(0, Math.min(1, v)) : d.volume;
    ['music', 'ambience', 'speech', 'onlineVoice', 'sayNames', 'tellMore'].forEach(bool);
    ['preview', 'missDelay', 'hints', 'level', 'sound'].forEach(opt);
    return out;
  };

  /** Ton-Knopf: alles an → Musik aus → alles aus → … */
  L.nextSoundMode = function (mode) {
    var m = L.OPTIONS.sound;
    return m[(m.indexOf(mode) + 1) % m.length];
  };

  /* ---------- Sätze (Konzept 11.7) ---------- */

  var NUM = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
    'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig'];
  L.numberWord = function (n) {
    return n >= 0 && n < NUM.length ? NUM[n] : String(n);
  };
  L.cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  L.PRAISE = ['Super!', 'Toll!', 'Juhu!', 'Klasse!', 'Prima!', 'Spitze!', 'Hurra!'];
  L.MISS_LINES = ['Oh, die sind nicht gleich.', "Fast! Versuch's nochmal.", 'Wo ist der Zwilling?'];

  L.SAY = {
    start: 'Die Kätzchen verstecken sich! Finde immer zwei gleiche.',
    lucky: 'Glück gehabt!',
    bonus: 'Super gemerkt!',
    hint: 'Schau mal hier!',
    help: 'Brauchst du Hilfe? Drück die Pfote!',
    won: 'Hurra! Du hast alle Kätzchen gefunden!',
    playroom: 'Die Kätzchen wollen mit dir spielen!',
    go: "Los geht's!",
  };

  /**
   * Lob beim Paar. count = wie viele Paare in diesem Spiel schon gelobt wurden (0, 1, 2 …).
   * Mit Kindername etwa jedes dritte Lob: „Super, {Kind}!“
   */
  L.praise = function (rng, catName, childName, count) {
    var name = L.cleanName(childName);
    var first = name && count % 3 === 2 ? 'Super, ' + name + '!' : rng.pick(L.PRAISE);
    var second = rng.chance(0.5) ? 'Zweimal ' + catName + '!' : 'Du hast ' + catName + ' gefunden!';
    return first + ' ' + second;
  };

  /** Satz bei einem Fehlpaar – nur manchmal (~30 %), sonst null */
  L.missLine = function (rng) {
    return rng.chance(0.3) ? rng.pick(L.MISS_LINES) : null;
  };

  L.starsLine = function (n) {
    return n === 1 ? 'Ein Stern!' : L.cap(L.numberWord(n)) + ' Sterne!';
  };

  L.milestoneLine = function (m) {
    return 'Wow! Schon ' + m + ' Sterne!';
  };

  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);

/* Miau-Memory – KS.Game: Zustandsautomat, Deck, Layout, Züge, Feier, Tipps, Sterne.
   Zustände (Konzept 13.2): idle → intro → preview → play ⇄ resolving → won */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;
  var L = KS.Logic;

  var G = {
    phase: 'idle',
    cards: [],
    timers: null,
  };

  function A() { return KS.Audio; }
  function S() { return KS.App ? KS.App.settings : L.DEFAULT_SETTINGS; }
  function say(text, prio, o) {
    if (!text || !KS.Speech) return;
    o = o || {};
    o.priority = prio || 1;
    KS.Speech.say(text, o);
  }
  function now() { return Date.now(); }

  /* ---------- Start ---------- */

  G.start = function (o) {
    o = o || {};
    G.stop();
    var st = S();
    G.timers = new U.Timers();
    G.level = o.level || st.level || 1;
    G.seed = o.seed !== undefined && o.seed !== null ? +o.seed : Math.floor(Math.random() * 1e9);
    G.rng = U.rng(G.seed);
    var hist = U.store.get('worlds', []);
    G.world = o.world && L.WORLDS.indexOf(o.world) >= 0 ? o.world : L.pickWorld(L.WORLDS, hist, G.rng);
    U.store.set('worlds', L.recordWorld(hist, G.world));
    G.sceneInfo = KS.Scenes.show(G.world, { seed: G.seed, variant: o.variant });
    G.deck = L.makeDeck(G.level, L.CAT_IDS, G.rng);
    G.round = L.newRound(G.deck.deck);
    G.hintsTotal = L.hintsFor(st.hints);
    G.hintsLeft = G.hintsTotal;
    G.helpSaid = false;
    G.praiseCount = 0;
    G.lastInput = now();
    G.sleeping = false;
    G.nextWiggle = now() + 4000;
    G.nextAmbientMeow = now() + 20000 + Math.random() * 20000;

    G.hud = new KS.UI.Hud({
      pairs: G.round.totalPairs,
      onHome: function () { KS.App.go('title'); },
      onHint: G.hint,
      onSound: function () { KS.App.cycleSound(); },
    });
    G.hud.setHints(G.hintsLeft, G.hintsTotal);
    G.hud.setSound(st.sound);

    var stage = U.$('#stage');
    G.board = U.el('div', { class: 'board' });
    stage.appendChild(G.board);
    var hider = G.sceneInfo.hider;
    G.cards = G.deck.deck.map(function (cat, i) {
      var c = new KS.Card({ type: hider.type, variant: hider.variant, cat: cat, index: i });
      c.el.addEventListener('pointerdown', function (e) { G.onDown(c, e); });
      c.el.addEventListener('pointerup', function (e) { G.onUp(c, e); });
      c.el.addEventListener('pointercancel', function () { c._down = null; });
      G.board.appendChild(c.el);
      return c;
    });
    G.layout(false);
    G.onResize = function () {
      clearTimeout(G._rz);
      G._rz = setTimeout(function () {
        if (G.hud) G.hud.layout();
        G.layout(true);
      }, 120);
    };
    root.addEventListener('resize', G.onResize);
    G.timers.every(500, G.tick);
    // Streicheln zählt als Eingabe: eine gestreichelte Katze schläft nicht ein
    KS.CatView.onActivity = G.onActivity;

    if (A()) A().music(G.sceneInfo.music);
    if (A()) A().ambience(G.sceneInfo.ambience);
    G.intro();
    return G;
  };

  G.onActivity = function () { G.lastInput = now(); };

  G.stop = function () {
    if (G.timers) G.timers.clear();
    clearTimeout(G._rz);
    if (KS.CatView && KS.CatView.onActivity === G.onActivity) KS.CatView.onActivity = null;
    if (G.onResize) root.removeEventListener('resize', G.onResize);
    G.onResize = null;
    G.cards.forEach(function (c) { c.destroy(); });
    G.cards = [];
    if (G.board && G.board.parentNode) G.board.parentNode.removeChild(G.board);
    G.board = null;
    if (G.hud) G.hud.destroy();
    G.hud = null;
    G.phase = 'idle';
  };

  /* ---------- Layout (Konzept 12.7) ---------- */

  G.area = function () {
    var W = root.innerWidth, H = root.innerHeight;
    var bar = G.hud && G.hud.height ? G.hud.height : L.barHeight(H);
    var m = Math.max(10, Math.min(W, H) * 0.025);
    return { x: m, y: bar + m * 0.5, w: W - 2 * m, h: H - bar - m * 1.5 };
  };

  G.layout = function (glide) {
    var a = G.area();
    var lay = (G.lay = L.layoutGrid(G.cards.length, a.w, a.h, { maxW: 420 }));
    G.cards.forEach(function (c, i) {
      var p = lay.cards[i];
      c.row = p.row;
      c.col = p.col;
      c.setBox(a.x + p.x, a.y + p.y, p.w, p.h, glide);
    });
    if (KS.CatView) setTimeout(KS.CatView.invalidate, glide ? 650 : 0);
  };

  /* ---------- Intro und Guck-Phase (Konzept 3.2) ---------- */

  G.intro = function () {
    G.phase = 'intro';
    var step = Math.max(60, Math.min(110, 900 / G.cards.length));
    G.cards.forEach(function (c, i) {
      c.dropIn(i * step);
      G.timers.after(i * step + 470, function () {
        if (A()) A().sfx('plop', { pitch: 1 + i * 0.07, vol: 0.55 });
      });
    });
    G.timers.after(G.cards.length * step + 800, function () {
      var p = S().preview;
      if (p > 0) G.preview(p);
      else G.duck();
    });
  };

  G.preview = function (sec) {
    G.phase = 'preview';
    G.cards.forEach(function (c) { c.peek(true); });
    if (A()) A().sfx('whoosh', { vol: 0.35 });
    // Miau-Chor: leicht versetzt, höchstens sechs Stimmen
    var chorus = U.rng(G.seed + 1).shuffle(G.cards).slice(0, 6);
    chorus.forEach(function (c, i) {
      G.timers.after(380 + i * 150 + Math.random() * 120, function () {
        if (G.phase === 'preview') c.catView.meow(null, { vol: 0.45 });
      });
    });
    G.timers.after(sec * 1000 + 450, G.duck);
  };

  G.duck = function () {
    say(L.SAY.start, 2);
    var wave = 0;
    if (G.phase === 'preview') {
      G.cards.forEach(function (c, i) {
        G.timers.after(400 + i * 75, function () {
          c.peek(false);
          if (A() && i % 2 === 0) A().sfx('plop', { pitch: 1.4 - i * 0.03, vol: 0.35 });
        });
      });
      wave = 400 + G.cards.length * 75 + 350;
    }
    G.timers.after(wave, function () {
      G.phase = 'play';
      G.lastInput = now();
    });
  };

  /* ---------- Eingaben ---------- */

  G.onDown = function (card, e) {
    if (e.button !== undefined && e.button > 0) return;
    G.touch();
    var i = card.index;
    var action = L.tapAction(G.phase, G.round.cards[i]);
    if (G.phase === 'preview' && action === 'wiggle') action = 'peekcat';
    if (action === 'open') {
      G.flip(card);
    } else if (action === 'wiggle') {
      card.wiggle(false);
      if (A()) A().sfx('rustle', { vol: 0.25 });
    } else if (action === 'cat' || action === 'peekcat') {
      card._down = { t: now(), x: e.clientX, y: e.clientY };
    }
  };

  G.onUp = function (card, e) {
    var d = card._down;
    card._down = null;
    if (!d) return;
    var moved = U.dist(d.x, d.y, e.clientX, e.clientY);
    if (moved < 16 && now() - d.t < 500) card.catView.tap();
  };

  /** Jede Eingabe: Ruhe-Timer zurücksetzen, schlafende Katzen wecken */
  G.touch = function () {
    G.lastInput = now();
    if (G.sleeping) {
      G.sleeping = false;
      G.cards.forEach(function (c, i) {
        if (c.catView.sleeping) G.timers.after(i * 60, function () { c.catView.wake(false); });
      });
    }
  };

  /* ---------- Züge (Konzept 3.3) ---------- */

  G.flip = function (card) {
    var res = L.flip(G.round, card.index);
    if (res.type === 'none') return res;
    card.open();
    if (A()) A().hider(card.type);
    var cv = card.catView;
    G.timers.after(260, function () { cv.surprised(420); });
    G.timers.after(560, function () {
      if (!card.isOpen()) return;
      cv.meow();
      if (S().sayNames) say(cv.data.name + '!', 1);
    });
    if (res.type === 'first') return res;
    G.phase = 'resolving';
    G.timers.after(950, function () {
      if (res.type === 'match') G.match(res);
      else G.miss(res);
    });
    return res;
  };

  G.isAdjacent = function (a, b) {
    var ca = G.cards[a], cb = G.cards[b];
    return (ca.row === cb.row && Math.abs(ca.col - cb.col) === 1) || (ca.col === cb.col && Math.abs(ca.row - cb.row) === 1);
  };

  /** Zwillinge gefunden (Konzept 6.3) */
  G.match = function (res) {
    G.phase = 'play';
    var ca = G.cards[res.a], cb = G.cards[res.b];
    ca.setFound();
    cb.setFound();
    ca.catView.jump();
    cb.catView.jump();
    // schlafende Katzen wachen mit auf
    G.touch();
    var pa = ca.headPoint(), pb = cb.headPoint();
    if (KS.FX) {
      KS.FX.heartStream(pa, pb, { adjacent: G.isAdjacent(res.a, res.b) });
      KS.FX.burst(pa.x, pa.y);
      KS.FX.burst(pb.x, pb.y);
      KS.FX.confetti(pa.x, pa.y, { count: 18 });
      KS.FX.confetti(pb.x, pb.y, { count: 18 });
    }
    if (A()) A().sfx('match');
    // Sprachlob
    var cat = KS.Cats.byId[res.cat];
    var lines = [];
    var praise = L.praise(G.rng, cat.name, S().childName, G.praiseCount++);
    if (res.bonus) lines.push(praise, L.SAY.bonus);
    else if (res.lucky && G.rng.chance(0.35)) lines.push(L.SAY.lucky, 'Zweimal ' + cat.name + '!');
    else lines.push(praise);
    if (S().tellMore) lines.push(cat.more);
    G.timers.after(250, function () { say(lines.join(' '), 3); });
    // Stern fliegt in die Sternenleiste
    var idx = G.round.pairs - 1;
    var mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
    var bonus = res.bonus;
    G.timers.after(550, function () {
      if (!G.hud || !KS.FX) return;
      if (A()) A().sfx('whoosh', { vol: 0.3, pitch: 1.4 });
      KS.FX.sparkle(mid.x, mid.y, 10, { radius: 20 });
      KS.FX.starFlight(mid, G.hud.slotPoint(idx), { duration: 0.9 }).then(function () {
        if (!G.hud) return;
        G.hud.fillSlot(idx);
        if (A()) A().sfx('ding', { pitch: 1 + idx * 0.06 });
        if (bonus) {
          KS.FX.starFlight(G.hud.slotPoint(idx), G.hud.bonusPoint(idx), { rainbow: true, duration: 0.5, lift: 40, scale: 0.7, endScale: 0.3 }).then(function () {
            if (!G.hud) return;
            G.hud.bonusSlot(idx);
            if (A()) A().sfx('bonus');
          });
        }
        if (res.done) G.timers.after(bonus ? 1500 : 1000, G.win);
      });
    });
    if (res.done) G.phase = 'done';
  };

  /** Kein Paar: neugieriger Blick, „Hm?“, dann wegducken (Konzept 3.3) */
  G.miss = function (res) {
    var ca = G.cards[res.a], cb = G.cards[res.b];
    var ms = S().missDelay * 1000;
    var pa = ca.headPoint(), pb = cb.headPoint();
    ca.catView.lookTarget = { x: pb.x, y: pb.y, until: now() + ms };
    cb.catView.lookTarget = { x: pa.x, y: pa.y, until: now() + ms };
    ca.catView.el.style.setProperty('--tilt', (pb.x > pa.x ? 8 : -8) + 'deg');
    cb.catView.el.style.setProperty('--tilt', (pa.x > pb.x ? 8 : -8) + 'deg');
    ca.catView.flash('tilt', Math.min(ms, 1400));
    cb.catView.flash('tilt', Math.min(ms, 1400));
    if (A()) A().sfx('hm');
    var line = L.missLine(G.rng);
    if (line) G.timers.after(300, function () { say(line, 1); });
    if (res.streak >= 5) {
      if (G.hud && G.hintsLeft > 0) G.hud.pulseHint(true);
      if (!G.helpSaid && G.hintsLeft > 0) {
        G.helpSaid = true;
        G.timers.after(900, function () { say(L.SAY.help, 2); });
      }
    }
    G.timers.after(ms, function () {
      L.closeMiss(G.round);
      ca.close();
      cb.close();
      if (A()) A().sfx('plop', { pitch: 0.9, vol: 0.5 });
      G.timers.after(120, function () { if (A()) A().hider(ca.type, { close: true, vol: 0.5 }); });
      G.timers.after(300, function () {
        if (G.phase === 'resolving') G.phase = 'play';
      });
    });
  };

  /* ---------- Tipps (Konzept 9.2) ---------- */

  G.hint = function () {
    if (G.phase !== 'play' && G.phase !== 'resolving') return;
    G.touch();
    if (G.hintsLeft <= 0) {
      if (G.hud) U.pulseClass(G.hud.hint, 'is-wiggle', 500);
      return;
    }
    var pair = L.hintPair(G.round, G.rng);
    if (!pair) return;
    G.hintsLeft--;
    G.hud.setHints(G.hintsLeft, G.hintsTotal);
    G.hud.pulseHint(false);
    var a = G.cards[pair[0]], b = G.cards[pair[1]];
    [a, b].forEach(function (c) {
      if (!c.isOpen()) {
        c.wiggle(true);
        c.showTail(1500);
      } else {
        c.catView.flash('hop', 460);
      }
    });
    if (KS.FX) KS.FX.glitterTrail(a.headPoint(), b.headPoint());
    if (A()) A().sfx('sparkle', { vol: 0.6 });
    say(L.SAY.hint, 2);
  };

  /* ---------- Leben im Hintergrund (Konzept 6.2) ---------- */

  G.tick = function () {
    if (G.phase !== 'play' && G.phase !== 'resolving') return;
    var t = now();
    var closed = G.cards.filter(function (c) { return !c.isOpen() && !c.found; });
    var found = G.cards.filter(function (c) { return c.found; });
    // Nach 25 s Ruhe schlafen die gefundenen Katzen ein
    if (!G.sleeping && t - G.lastInput > 25000) {
      G.sleeping = true;
      found.forEach(function (c, i) { G.timers.after(i * 400, function () { if (G.sleeping) c.catView.sleep(); }); });
      if (closed.length) U.random.pick(closed).wiggle(true);
      G.nextWiggle = t + 6000;
    }
    // „Da raschelt was“: gelegentlich wackelt ein geschlossenes Versteck
    if (t > G.nextWiggle && closed.length && !U.reducedMotion()) {
      var c = U.random.pick(closed);
      c.wiggle(G.sleeping);
      if (A()) A().sfx('rustle', { vol: 0.12 });
      G.nextWiggle = t + (G.sleeping ? 6000 : 3000 + Math.random() * 3000);
    }
    // Sehr selten miaut eine gefundene Katze leise
    if (t > G.nextAmbientMeow && found.length && !G.sleeping) {
      U.random.pick(found).catView.meow(null, { vol: 0.35 });
      G.nextAmbientMeow = t + 20000 + Math.random() * 20000;
    }
  };

  /* ---------- Ende (Konzept 3.4, 8) ---------- */

  G.win = function () {
    if (G.phase === 'won') return;
    G.phase = 'won';
    var result = {
      level: G.level,
      world: G.world,
      cats: G.deck.cats.slice(),
      stars: G.round.stars,
      pairs: G.round.pairs,
      bonus: G.round.bonus,
      log: G.round.log.slice(),
    };
    if (KS.App) KS.App.won(result);
  };

  /* ---------- Debug (nur mit ?debug) ---------- */

  G.debugSolve = function (o) {
    o = o || {};
    var delay = o.delay || 1300;
    return new Promise(function (resolve) {
      function waitPlay(fn) {
        if (G.phase === 'won') return resolve(true);
        if (G.phase === 'play') return fn();
        setTimeout(function () { waitPlay(fn); }, 100);
      }
      function next() {
        waitPlay(function () {
          var r = G.round;
          var i = r.cards.findIndex(function (c) { return !c.found && !c.open; });
          if (i < 0) return setTimeout(next, 200);
          var j = r.cards.findIndex(function (c, k) { return k !== i && !c.found && c.cat === r.cards[i].cat; });
          if (o.misses && G.rng.chance(0.3)) {
            var wrong = r.cards.findIndex(function (c, k) { return k !== i && !c.found && !c.open && c.cat !== r.cards[i].cat; });
            if (wrong >= 0) j = wrong;
          }
          G.flip(G.cards[i]);
          setTimeout(function () {
            G.flip(G.cards[j]);
            setTimeout(next, delay);
          }, 350);
        });
      }
      next();
    });
  };

  KS.Game = G;
})(typeof window !== 'undefined' ? window : globalThis);

/* Miau-Memory – KS.UI: Icons, Knöpfe, Halte-Knöpfe, Spielleiste (Konzept 12.2–12.4).
   Titel, Gewonnen-Szene und Eltern-Bereich stehen weiter unten. */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;
  var OUT = '#4B3A5A';

  /* =====================================================================
     Icons (viewBox 0 0 64 64, weiß auf farbigem Knopf)
     ===================================================================== */

  var W = 'fill="#FFFFFF" stroke="' + OUT + '" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';
  var ICONS = {
    home: '<path d="M10 31L32 12L54 31" fill="none" stroke="' + OUT + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M10 31L32 12L54 31" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M17 30V50Q17 53 20 53H44Q47 53 47 50V30L32 18Z" ' + W + '/><path d="M27 53V41Q27 38 30 38H34Q37 38 37 41V53" fill="#FFB3C6" stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"/>',
    hint: '<circle cx="27" cy="27" r="15" ' + W + '/><circle cx="27" cy="27" r="9" fill="#DFF3FF"/>' +
      '<path d="M38 38L52 52" stroke="' + OUT + '" stroke-width="10" stroke-linecap="round"/><path d="M38 38L52 52" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>' +
      '<g fill="#FF8FB1"><ellipse cx="27" cy="30" rx="4.2" ry="3.6"/><circle cx="21.5" cy="24.5" r="1.9"/><circle cx="25" cy="21.5" r="1.9"/><circle cx="29" cy="21.5" r="1.9"/><circle cx="32.5" cy="24.5" r="1.9"/></g>',
    soundAll: '<path d="M12 26H20L31 17V47L20 38H12Z" ' + W + '/><path d="M38 24Q43 32 38 40M44 19Q53 32 44 45" fill="none" stroke="' + OUT + '" stroke-width="8" stroke-linecap="round"/><path d="M38 24Q43 32 38 40M44 19Q53 32 44 45" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>',
    soundNoMusic: '<path d="M12 26H20L31 17V47L20 38H12Z" ' + W + '/><path d="M38 24Q43 32 38 40" fill="none" stroke="' + OUT + '" stroke-width="8" stroke-linecap="round"/><path d="M38 24Q43 32 38 40" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>' +
      '<g transform="translate(40 14)"><ellipse cx="6" cy="20" rx="5" ry="4" ' + W + '/><path d="M11 20V4L18 7" fill="none" stroke="' + OUT + '" stroke-width="3" stroke-linecap="round"/><path d="M0 2L20 26" stroke="' + OUT + '" stroke-width="7" stroke-linecap="round"/><path d="M0 2L20 26" stroke="#FF6F91" stroke-width="3.5" stroke-linecap="round"/></g>',
    soundOff: '<path d="M12 26H20L31 17V47L20 38H12Z" ' + W + '/><path d="M39 25L51 39M51 25L39 39" stroke="' + OUT + '" stroke-width="9" stroke-linecap="round"/><path d="M39 25L51 39M51 25L39 39" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>',
    gear: '<path d="M32 10L37 11L38 17L43 19L48 15L52 19L48 24L50 29L56 30V35L50 37L48 41L52 46L48 50L43 46L38 48L37 54H31L30 48L25 46L20 50L16 46L20 41L18 37L12 35V30L18 28L20 24L16 19L20 15L25 19L30 17L31 11Z" ' + W + '/><circle cx="34" cy="32" r="7" fill="#C9D6E8" stroke="' + OUT + '" stroke-width="3"/>',
    fullscreen: '<path d="M14 26V14H26M38 14H50V26M50 38V50H38M26 50H14V38" fill="none" stroke="' + OUT + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 26V14H26M38 14H50V26M50 38V50H38M26 50H14V38" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    paw: '<g ' + W + '><ellipse cx="32" cy="40" rx="12" ry="10.5"/><ellipse cx="16.5" cy="27" rx="5" ry="6.2"/><ellipse cx="25.5" cy="18" rx="5" ry="6.5"/><ellipse cx="38.5" cy="18" rx="5" ry="6.5"/><ellipse cx="47.5" cy="27" rx="5" ry="6.2"/></g>' +
      '<g fill="#FFB3C6"><ellipse cx="32" cy="41" rx="6" ry="4.5"/></g>',
    replay: '<path d="M46 22A17 17 0 1 0 49 36" fill="none" stroke="' + OUT + '" stroke-width="11" stroke-linecap="round"/><path d="M46 22A17 17 0 1 0 49 36" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M50 10L50 26L35 22Z" fill="#FFFFFF" stroke="' + OUT + '" stroke-width="3.2" stroke-linejoin="round"/>',
    yarn: '<circle cx="30" cy="34" r="17" fill="#FF8FB1" stroke="' + OUT + '" stroke-width="3.2"/><path d="M16 26Q30 34 44 24M14 36Q30 44 46 34M20 47Q30 30 38 18M27 51Q36 36 46 42" fill="none" stroke="#FFD1DF" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M45 42Q52 50 58 46" fill="none" stroke="' + OUT + '" stroke-width="6" stroke-linecap="round"/><path d="M45 42Q52 50 58 46" fill="none" stroke="#FF8FB1" stroke-width="2.5" stroke-linecap="round"/>',
    fish: '<path d="M10 32C18 20 34 18 44 28L54 20V44L44 36C34 46 18 44 10 32Z" fill="#FFB36B" stroke="' + OUT + '" stroke-width="3.2" stroke-linejoin="round"/><circle cx="21" cy="30" r="3" fill="' + OUT + '"/><path d="M30 26Q33 32 30 38" fill="none" stroke="' + OUT + '" stroke-width="2.5" stroke-linecap="round"/>',
    close: '<path d="M20 20L44 44M44 20L20 44" stroke="' + OUT + '" stroke-width="11" stroke-linecap="round"/><path d="M20 20L44 44M44 20L20 44" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round"/>',
    check: '<path d="M16 33L28 45L49 20" fill="none" stroke="' + OUT + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 33L28 45L49 20" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>',
    star: '<path d="' + (KS.CatArt ? KS.CatArt.starPath(32, 34, 22, 0.5) : '') + '" fill="#FFD24A" stroke="' + OUT + '" stroke-width="3.2" stroke-linejoin="round"/>',
  };

  function icon(name) {
    return '<svg class="ico" viewBox="0 0 64 64" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /** Runder Bonbon-Knopf. color: raspberry | mint | sun | sky | lilac */
  function button(o) {
    var b = U.el('button', { class: 'btn btn-' + (o.color || 'sky') + (o.cls ? ' ' + o.cls : ''), type: 'button', 'aria-label': o.label || '' });
    b.innerHTML = icon(o.icon) + (o.hold ? ringSvg() : '');
    if (o.size) b.style.setProperty('--s', o.size + 'px');
    if (o.onTap) {
      b.addEventListener('pointerdown', function (e) {
        e.stopPropagation();
        b.classList.add('is-pressed');
      });
      var up = function () { b.classList.remove('is-pressed'); };
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (KS.Audio) KS.Audio.sfx('pop', { vol: 0.5 });
        o.onTap(e);
      });
    }
    if (o.hold) holdable(b, o.hold, o.onHold, o.onShort);
    return b;
  }

  function ringSvg() {
    return '<svg class="hold-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" pathLength="100"/></svg>';
  }

  /** Halten statt Tippen (Eltern-Funktionen): Ring füllt sich über ms, kurzer Tipp → onShort */
  function holdable(el, ms, onHold, onShort) {
    var t0 = 0, timer = 0, active = false;
    el.style.setProperty('--hold', ms + 'ms');
    function start(e) {
      e.preventDefault();
      e.stopPropagation();
      if (active) return;
      active = true;
      t0 = Date.now();
      el.classList.add('is-holding', 'is-pressed');
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
      timer = setTimeout(function () {
        active = false;
        el.classList.remove('is-holding', 'is-pressed');
        if (KS.Audio) KS.Audio.sfx('ding', { vol: 0.5 });
        onHold();
      }, ms);
    }
    function stop() {
      if (!active) return;
      active = false;
      clearTimeout(timer);
      el.classList.remove('is-holding', 'is-pressed');
      if (Date.now() - t0 < 350 && onShort) onShort();
    }
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
    el.addEventListener('lostpointercapture', stop);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  /* =====================================================================
     Spielleiste (Konzept 12.4)
     ===================================================================== */

  var STAR_OUTLINE = '<svg class="slot-empty" viewBox="0 0 64 64"><path d="' + (KS.CatArt ? KS.CatArt.starPath(32, 34, 26, 0.5) : '') + '" fill="rgba(255,255,255,0.55)" stroke="#B3A2C4" stroke-width="3.5" stroke-linejoin="round" stroke-dasharray="6 5"/></svg>';
  var STAR_FULL = '<svg class="slot-full" viewBox="0 0 64 64"><path d="' + (KS.CatArt ? KS.CatArt.starPath(32, 34, 27, 0.5) : '') + '" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/><path d="' + (KS.CatArt ? KS.CatArt.starPath(32, 34, 27, 0.5) : '') + '" fill="url(#ks-gold)" stroke="' + OUT + '" stroke-width="3.2" stroke-linejoin="round"/><circle cx="25" cy="27" r="3.5" fill="#FFFDF0"/></svg>';
  var STAR_RAINBOW = '<svg class="slot-bonus" viewBox="0 0 64 64">' +
    '<path d="' + (KS.CatArt ? KS.CatArt.starPath(32, 34, 27, 0.5) : '') + '" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round"/><path d="' + (KS.CatArt ? KS.CatArt.starPath(32, 34, 27, 0.5) : '') + '" fill="url(#ks-rainbow)" stroke="' + OUT + '" stroke-width="3.5" stroke-linejoin="round"/></svg>';

  function Hud(o) {
    var self = this;
    this.o = o;
    var el = (this.el = U.el('div', { class: 'hud' }));
    var left = U.el('div', { class: 'hud-side hud-left' });
    var mid = (this.mid = U.el('div', { class: 'hud-stars' }));
    var right = U.el('div', { class: 'hud-side hud-right' });
    this.home = button({ icon: 'home', color: 'raspberry', label: 'Zum Titel (1 Sekunde halten)', hold: 1000, onHold: o.onHome, onShort: function () { U.pulseClass(self.home, 'is-wiggle', 500); } });
    left.appendChild(this.home);
    this.slots = [];
    for (var i = 0; i < (o.pairs || 0); i++) {
      var s = U.el('div', { class: 'slot', html: STAR_OUTLINE + STAR_FULL + STAR_RAINBOW });
      mid.appendChild(s);
      this.slots.push(s);
    }
    if (o.onHint) {
      this.hint = button({ icon: 'hint', color: 'sun', cls: 'btn-hint', label: 'Tipp', onTap: o.onHint });
      this.hintDots = U.el('div', { class: 'hint-dots' });
      this.hint.appendChild(this.hintDots);
      right.appendChild(this.hint);
    }
    if (o.onSound) {
      this.sound = button({ icon: 'soundAll', color: 'sky', label: 'Ton', onTap: o.onSound });
      right.appendChild(this.sound);
    }
    if (o.extra) o.extra.forEach(function (b) { right.insertBefore(b, right.firstChild); });
    el.appendChild(left);
    el.appendChild(mid);
    el.appendChild(right);
    U.$('#ui').appendChild(el);
    this.layout();
  }

  Hud.prototype = {
    layout: function () {
      var H = root.innerHeight, W = root.innerWidth;
      var bar = KS.Logic.barHeight(H);
      var btn = Math.max(64, Math.min(84, bar - 18));
      root.document.documentElement.style.setProperty('--btn', btn + 'px');
      var n = this.slots.length;
      var buttons = this.el.querySelectorAll('.btn').length;
      var free = W - buttons * (btn + 14) - 40;
      var twoRow = n > 0 && free < n * 30;
      var size;
      if (twoRow) {
        // zu eng (z. B. Handy hochkant): Sterne in eine zweite Reihe unter die Knöpfe
        size = Math.max(24, Math.min(44, (W - 32) / (n * 1.16)));
        bar = btn + 22 + size + 12;
      } else {
        size = Math.max(20, Math.min(bar * 0.62, free / (Math.max(1, n) * 1.12)));
      }
      this.el.classList.toggle('is-2row', twoRow);
      this.height = bar;
      root.document.documentElement.style.setProperty('--bar', bar + 'px');
      this.mid.style.setProperty('--slot', size.toFixed(1) + 'px');
    },
    slotPoint: function (i) {
      var s = this.slots[Math.min(i, this.slots.length - 1)];
      var r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width };
    },
    bonusPoint: function (i) {
      var r = this.slots[Math.min(i, this.slots.length - 1)].getBoundingClientRect();
      return { x: r.right - r.width * 0.12, y: r.top + r.height * 0.12 };
    },
    fillSlot: function (i) {
      var s = this.slots[i];
      if (!s) return;
      s.classList.add('is-full');
      U.pulseClass(s, 'is-pop', 600);
    },
    bonusSlot: function (i) {
      var s = this.slots[i];
      if (s) s.classList.add('is-bonus');
    },
    setHints: function (left, total) {
      if (!this.hint) return;
      var dots = '';
      if (total === Infinity) dots = '<i class="inf">∞</i>';
      else for (var i = 0; i < total; i++) dots += '<i class="' + (i < left ? 'on' : 'off') + '"></i>';
      this.hintDots.innerHTML = dots;
      this.hint.classList.toggle('is-empty', left <= 0);
      this.hint.style.display = total === 0 ? 'none' : '';
    },
    pulseHint: function (on) {
      if (this.hint) this.hint.classList.toggle('is-pulse', !!on);
    },
    setSound: function (mode) {
      if (!this.sound) return;
      var name = mode === 'off' ? 'soundOff' : mode === 'nomusic' ? 'soundNoMusic' : 'soundAll';
      this.sound.querySelector('.ico').outerHTML = icon(name);
    },
    destroy: function () {
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    },
  };

  /* =====================================================================
     Logo aus runden Blasenbuchstaben (Konzept 12.3)
     ===================================================================== */

  // Mittellinien der Buchstaben (Höhe 100, Grundlinie y=100), Breite
  var GLYPHS = {
    M: { w: 84, d: 'M0 100V14L42 64L84 14V100' },
    i: { w: 0, d: 'M0 52V100M0 18V18.5' },
    a: { w: 46, d: 'M46 54V100M46 77C46 62 36 52 23 52C9 52 0 63 0 77C0 91 9 101 23 101C36 101 46 91 46 77' },
    u: { w: 46, d: 'M0 52V78C0 92 9 101 23 101C37 101 46 92 46 78V52M46 78V100' },
    '-': { w: 30, d: 'M0 74H30' },
    e: { w: 46, d: 'M3 76H46C46 62 36 52 23 52C9 52 0 63 0 77C0 91 10 101 23 101C30 101 35 99 39 96' },
    m: { w: 78, d: 'M0 100V54M0 72C0 60 8 52 19 52C31 52 39 60 39 72V100M39 72C39 60 47 52 58 52C70 52 78 60 78 72V100' },
    o: { w: 48, d: 'M24 52C10 52 0 63 0 77C0 91 10 101 24 101C38 101 48 91 48 77C48 63 38 52 24 52Z' },
    r: { w: 30, d: 'M0 100V54M0 74C0 60 12 52 30 54' },
    y: { w: 46, d: 'M0 52V76C0 90 9 98 23 98C37 98 46 90 46 76V52M46 76V112C46 128 36 136 22 136C12 136 5 132 1 126' },
  };
  var LOGO_COLS = ['#FF6F91', '#FFC93C', '#3CCFA0', '#5AB9EA', '#B89CFF'];

  var GK = 1.32; // Buchstaben größer als die Strichbreite, damit Öffnungen (e, a) offen bleiben
  function scaleD(d) {
    return d.replace(/-?\d+(\.\d+)?/g, function (m) { return String(Math.round(parseFloat(m) * GK * 10) / 10); });
  }

  function logoSvg(text) {
    var x = 20, gap = 44;
    var parts = '';
    var ci = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var g0 = GLYPHS[ch];
      if (!g0) continue;
      var g = { w: g0.w * GK, d: scaleD(g0.d) };
      var col = ch === '-' ? '#FF9EC4' : LOGO_COLS[ci++ % LOGO_COLS.length];
      var ears = '';
      if (i === 0 && ch === 'M') {
        // Katzenohren auf dem ersten M
        ears = '<g transform="scale(' + GK + ')"><path d="M-10 6L-6 -40L28 -4Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="7" stroke-linejoin="round"/>' +
          '<path d="M-1 -2L1 -24L17 -6Z" fill="#FFB3C6"/>' +
          '<path d="M94 6L90 -40L56 -4Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="7" stroke-linejoin="round"/>' +
          '<path d="M85 -2L83 -24L67 -6Z" fill="#FFB3C6"/></g>';
      }
      parts += '<g class="lg-letter" style="animation-delay:' + (i * 0.11).toFixed(2) + 's"><g transform="translate(' + x + ' 50)">' + ears +
        '<path d="' + g.d + '" fill="none" stroke="' + OUT + '" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + g.d + '" fill="none" stroke="#FFFFFF" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + g.d + '" fill="none" stroke="' + col + '" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + g.d + '" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 400" stroke-dashoffset="-6" opacity="0.8" transform="translate(-4 -4)"/>' +
        (ch === 'M' && i === 0 ? '<g transform="scale(' + GK + ') translate(42 44)"><ellipse cx="-11" cy="8" rx="4" ry="5" fill="' + OUT + '"/><ellipse cx="11" cy="8" rx="4" ry="5" fill="' + OUT + '"/><circle cx="-12" cy="6" r="1.6" fill="#FFFFFF"/><circle cx="10" cy="6" r="1.6" fill="#FFFFFF"/><path d="M-5 17Q0 21 5 17" stroke="' + OUT + '" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>' : '') +
        '</g></g>';
      x += g.w + gap;
    }
    var w = x - gap + 20;
    return '<svg class="logo" viewBox="-10 0 ' + Math.round(w + 20) + ' 250" aria-label="Miau-Memory">' + parts + '</svg>';
  }

  /* =====================================================================
     Titel (Konzept 3.1)
     ===================================================================== */

  var LEVEL_GRIDS = [[3, 2], [4, 2], [4, 3], [4, 4]];

  function levelIcon(level) {
    var g = LEVEL_GRIDS[level - 1];
    var cols = g[0], rows = g[1];
    var cell = 44 / Math.max(cols, rows + 0.4);
    var gw = cols * cell, gh = rows * cell;
    var x0 = 32 - gw / 2, y0 = 32 - gh / 2;
    var out = '';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = x0 + c * cell + cell * 0.12, y = y0 + r * cell + cell * 0.18, w = cell * 0.76, h = cell * 0.66;
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + (cell * 0.16).toFixed(1) + '" fill="#FFFFFF" stroke="' + OUT + '" stroke-width="2.2"/>' +
          '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (h * 0.3).toFixed(1) + '" rx="' + (cell * 0.14).toFixed(1) + '" fill="#FFE3B0"/>';
      }
    }
    return '<svg class="ico" viewBox="0 0 64 64">' + out + '</svg>';
  }

  function jarSvg(total) {
    var lvl = KS.Logic.jarLevel(total);
    var full = total > 0 && lvl === 0 ? 1 : lvl;
    var stars = '';
    var count = Math.round(full * 16);
    var rng = U.rng(total + 7);
    for (var i = 0; i < count; i++) {
      var row = Math.floor(i / 4), col = i % 4;
      var x = 22 + col * 13 + (row % 2) * 6 + rng.range(-2, 2);
      var y = 96 - row * 12 + rng.range(-2, 2);
      stars += '<path d="' + KS.CatArt.starPath(x, y, 7, 0.5, rng.range(-0.4, 0.4)) + '" fill="url(#ks-gold)" stroke="' + OUT + '" stroke-width="1.6" stroke-linejoin="round"/>';
    }
    return '<svg class="jar" viewBox="0 0 90 120">' +
      '<rect x="22" y="6" width="46" height="14" rx="5" fill="#FF9EC4" stroke="' + OUT + '" stroke-width="3"/>' +
      '<path d="M26 20H64V28C76 34 82 46 82 62V96C82 108 74 114 62 114H28C16 114 8 108 8 96V62C8 46 14 34 26 28Z" fill="rgba(220,240,255,0.55)" stroke="' + OUT + '" stroke-width="3"/>' +
      '<clipPath id="ks-jarclip"><path d="M26 20H64V28C76 34 82 46 82 62V96C82 108 74 114 62 114H28C16 114 8 108 8 96V62C8 46 14 34 26 28Z"/></clipPath>' +
      '<g clip-path="url(#ks-jarclip)">' + stars + '</g>' +
      '<path d="M16 60C16 48 20 40 28 36" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>' +
      '</svg>';
  }

  var Title = {
    el: null,
    views: [],
    show: function () {
      var App = KS.App;
      var info = KS.Scenes.show('title', { seed: Math.floor(Math.random() * 1e9) });
      App.music(info.music);
      if (KS.Audio) KS.Audio.ambience([]);
      var el = (Title.el = U.el('div', { class: 'screen title-screen' }));
      el.appendChild(U.el('div', { class: 'title-logo', html: logoSvg('Miau-Memory') }));
      // großer Spielknopf mit Pfote
      var play = button({
        icon: 'paw', color: 'raspberry', cls: 'btn-play', label: 'Spielen',
        onTap: function () {
          App.gesture();
          if (KS.Speech) KS.Speech.say(KS.Logic.SAY.go, { priority: 3, keep: true });
          App.go('game', { level: App.settings.level });
        },
      });
      el.appendChild(U.el('div', { class: 'title-play' }, [play]));
      // Stufenwahl
      var lv = U.el('div', { class: 'title-levels' });
      [1, 2, 3, 4].forEach(function (level) {
        var b = button({
          icon: 'paw', color: ['mint', 'sky', 'sun', 'lilac'][level - 1], cls: 'btn-level', label: 'Stufe ' + level,
          onTap: function () {
            App.setSetting('level', level);
            U.$$('.btn-level', lv).forEach(function (x) { x.classList.toggle('is-on', x === b); });
            U.pulseClass(b, 'is-pop', 500);
          },
        });
        b.innerHTML = levelIcon(level);
        if (App.settings.level === level) b.classList.add('is-on');
        lv.appendChild(b);
      });
      el.appendChild(lv);
      // Sternenglas
      var jar = U.el('div', { class: 'title-jar' });
      jar.innerHTML = jarSvg(App.stars) + '<div class="num">' + App.stars + '</div>';
      el.appendChild(jar);
      // Ecke: Vollbild und Zahnrad (2 s halten)
      var corner = U.el('div', { class: 'title-corner' });
      // Als installierte App läuft das Spiel schon im Vollbild, dann braucht es den Knopf nicht
      if (!KS.App.installed()) corner.appendChild(button({ icon: 'fullscreen', color: 'sky', cls: 'btn-small', label: 'Vollbild', onTap: toggleFullscreen }));
      corner.appendChild(button({ icon: 'gear', color: 'lilac', cls: 'btn-small', label: 'Eltern-Bereich (2 Sekunden halten)', hold: 2000, onHold: function () { Parents.open(); }, onShort: function (b) { U.pulseClass(corner.lastChild, 'is-wiggle', 500); } }));
      el.appendChild(corner);
      // Katzen schauen über den unteren Rand
      var peek = U.el('div', { class: 'title-peekers' });
      var ids = U.rng().shuffle(KS.Logic.CAT_IDS).slice(0, root.innerWidth < 700 ? 3 : 4);
      Title.views = [];
      ids.forEach(function (id, i) {
        var box = U.el('div', { class: 'peeker', style: '--i:' + i });
        var svg = KS.CatArt.svg(id);
        box.appendChild(svg);
        peek.appendChild(box);
        var view = new KS.CatView(svg.querySelector('.cat'));
        Title.views.push(view);
        tapToCat(box, view);
      });
      el.appendChild(peek);
      U.$('#ui').appendChild(el);
    },
    hide: function () {
      Title.views.forEach(function (v) { v.destroy(); });
      Title.views = [];
      if (Title.el && Title.el.parentNode) Title.el.parentNode.removeChild(Title.el);
      Title.el = null;
      Parents.close();
    },
    refreshJar: function () {
      var j = Title.el && U.$('.title-jar', Title.el);
      if (j) j.innerHTML = jarSvg(KS.App.stars) + '<div class="num">' + KS.App.stars + '</div>';
    },
  };

  /** Tippen auf eine Katze außerhalb des Spielfelds (Titel, Gewonnen, Spielzimmer) */
  function tapToCat(el, view) {
    var down = null;
    el.addEventListener('pointerdown', function (e) {
      KS.App.gesture();
      down = { t: Date.now(), x: e.clientX, y: e.clientY };
    });
    el.addEventListener('pointerup', function (e) {
      if (!down) return;
      var d = down;
      down = null;
      if (U.dist(d.x, d.y, e.clientX, e.clientY) < 16 && Date.now() - d.t < 500) view.tap();
    });
    el.addEventListener('pointercancel', function () { down = null; });
  }

  function toggleFullscreen() {
    var d = root.document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) {
        var ex = d.exitFullscreen || d.webkitExitFullscreen;
        var p = ex && ex.call(d);
        if (p && p.catch) p.catch(function () {});
      } else {
        var el = d.documentElement;
        var rq = el.requestFullscreen || el.webkitRequestFullscreen;
        var p2 = rq && rq.call(el);
        if (p2 && p2.catch) p2.catch(function () {});
      }
    } catch (e) { /* Vollbild ist optional */ }
  }

  /* =====================================================================
     Gewonnen-Szene (Konzept 8)
     ===================================================================== */

  var Won = {
    el: null,
    views: [],
    timers: null,
    show: function (res) {
      Won.hide();
      var App = KS.App;
      var t = (Won.timers = new U.Timers());
      var el = (Won.el = U.el('div', { class: 'screen won-screen' }));
      el.appendChild(U.el('div', { class: 'won-dim' }));
      el.appendChild(U.el('div', { class: 'won-rays' }));
      // Katzen der Runde springen nacheinander in eine Reihe (bei 8 im Bogen)
      var row = U.el('div', { class: 'won-cats' + (res.cats.length > 6 ? ' is-arc' : '') });
      var n = res.cats.length;
      Won.views = [];
      var arcH = n > 6 ? Math.min(root.innerHeight * 0.1, 90) : 0;
      res.cats.forEach(function (id, i) {
        var k = n > 1 ? i / (n - 1) : 0.5;
        var lift = Math.sin(k * Math.PI) * arcH;
        var box = U.el('div', { class: 'won-cat', style: '--i:' + i + ';--n:' + n + ';--lift:' + lift.toFixed(1) + 'px' });
        var svg = KS.CatArt.svg(id);
        var dancer = U.el('div', { class: 'won-dancer' });
        dancer.appendChild(svg);
        box.appendChild(dancer);
        row.appendChild(box);
        var v = new KS.CatView(svg.querySelector('.cat'));
        Won.views.push(v);
        tapToCat(box, v);
        t.after(300 + i * 220, function () {
          box.classList.add('is-in');
          if (KS.Audio) KS.Audio.sfx('boing', { pitch: 1 + i * 0.05, vol: 0.4 });
        });
        t.after(300 + n * 220 + 500 + i * 110, function () {
          dancer.classList.add('is-dance');
          v.add('happy');
          if (i % 2 === 0) v.add('wave');
        });
      });
      el.appendChild(row);
      // große Sternanzeige
      var big = U.el('div', { class: 'won-count', html: STAR_FULL + '<div class="num">0</div>' });
      el.appendChild(big);
      // Sternenglas-Symbol in der Ecke
      var jar = U.el('div', { class: 'won-jar', html: jarSvg(res.total - res.stars) + '<div class="num">' + (res.total - res.stars) + '</div>' });
      el.appendChild(jar);
      var btns = U.el('div', { class: 'won-btns' });
      btns.appendChild(button({ icon: 'home', color: 'raspberry', cls: 'btn-mid', label: 'Titel', onTap: function () { App.go('title'); } }));
      btns.appendChild(button({ icon: 'replay', color: 'mint', cls: 'btn-big', label: 'Nochmal', onTap: function () { App.go('game', { level: res.level }); } }));
      btns.appendChild(button({ icon: 'yarn', color: 'lilac', cls: 'btn-mid', label: 'Spielzimmer', onTap: function () { App.go('playroom', { cats: res.cats }); } }));
      el.appendChild(btns);
      U.$('#ui').appendChild(el);
      el.getBoundingClientRect();
      el.classList.add('is-in');
      var board = U.$('.board');
      if (board) board.classList.add('is-dim');

      if (KS.Speech) KS.Speech.say(KS.Logic.SAY.won, { priority: 3 });
      if (KS.Audio) {
        KS.Audio.sfx('fanfare');
        KS.Audio.duckMusic(0.4, 6);
      }
      if (KS.FX) {
        KS.FX.confettiRain(3.5);
        var W = root.innerWidth, H = root.innerHeight;
        [0, 1, 2, 3].forEach(function (k) {
          t.after(700 + k * 900, function () {
            if (KS.Audio) KS.Audio.sfx('whoosh', { vol: 0.18, pitch: 1.7 });
            KS.FX.firework(W * (0.2 + 0.6 * Math.random()), H * (0.15 + 0.2 * Math.random()), {
              onPop: function () { if (KS.Audio) KS.Audio.sfx('firework', { vol: 0.5 }); },
            });
          });
        });
      }
      // Sterne zählen
      t.after(2200 + n * 120, function () { Won.count(res, big, jar, btns); });
    },

    count: function (res, big, jar, btns) {
      var t = Won.timers;
      var hud = KS.Game.hud;
      var list = [];
      var logs = res.log || [];
      logs.forEach(function (l, i) { list.push({ from: hud ? hud.slotPoint(i) : null, rainbow: false }); });
      logs.forEach(function (l, i) { if (l.bonus) list.push({ from: hud ? hud.bonusPoint(i) : null, rainbow: true }); });
      var numEl = U.$('.num', big);
      var count = 0;
      var target = function () {
        var r = big.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height * 0.52 };
      };
      function next(i) {
        if (!Won.el) return;
        if (i >= list.length) return done();
        var item = list[i];
        var from = item.from || { x: root.innerWidth / 2, y: 40 };
        if (hud && !item.rainbow) {
          var slot = hud.slots[i];
          if (slot) slot.classList.add('is-spent');
        }
        KS.FX.starFlight(from, target(), { rainbow: item.rainbow, duration: 0.6, lift: 60, scale: 0.7, endScale: 1.2 }).then(function () {
          if (!Won.el) return;
          count++;
          numEl.textContent = count;
          U.pulseClass(big, 'is-bump', 380);
          if (item.rainbow) big.classList.add('is-rainbow');
          if (KS.Audio) KS.Audio.sfx(item.rainbow ? 'bonus' : 'ding', { pitch: 1 + count * 0.05 });
          var go = false;
          var proceed = function () { if (!go) { go = true; t.after(120, function () { next(i + 1); }); } };
          if (KS.Speech && KS.Speech.say(KS.Logic.cap(KS.Logic.numberWord(count)) + '!', { priority: 3, onEnd: proceed })) {
            t.after(1600, proceed);
          } else {
            t.after(620, proceed);
          }
        });
      }
      function done() {
        if (KS.Speech) KS.Speech.say(KS.Logic.starsLine(res.stars), { priority: 3 });
        if (KS.Audio) KS.Audio.sfx('match');
        U.pulseClass(big, 'is-bump', 500);
        t.after(900, function () {
          btns.classList.add('is-in');
          // Sterne wandern ins Sternenglas
          var from = target();
          var jr = jar.getBoundingClientRect();
          var to = { x: jr.left + jr.width * 0.4, y: jr.top + jr.height * 0.45 };
          var k = Math.min(res.stars, 6);
          for (var i = 0; i < k; i++) {
            (function (i) {
              t.after(i * 140, function () {
                KS.FX.starFlight(from, to, { duration: 0.7, scale: 0.6, endScale: 0.3, lift: 80 }).then(function () {
                  if (i === k - 1 && Won.el) {
                    jar.innerHTML = jarSvg(res.total) + '<div class="num">' + res.total + '</div>';
                    U.pulseClass(jar, 'is-bump', 500);
                    if (KS.Audio) KS.Audio.sfx('ding', { pitch: 1.5 });
                    if (res.milestones && res.milestones.length) {
                      var m = res.milestones[res.milestones.length - 1];
                      t.after(500, function () {
                        KS.FX.sparkle(to.x, to.y, 24, { radius: 60 });
                        KS.FX.confetti(to.x, to.y, { count: 30 });
                        if (KS.Audio) KS.Audio.sfx('fanfare', { vol: 0.6 });
                        if (KS.Speech) KS.Speech.say(KS.Logic.milestoneLine(m), { priority: 3 });
                      });
                    }
                  }
                });
              });
            })(i);
          }
          if (!k) btns.classList.add('is-in');
        });
      }
      next(0);
    },

    hide: function () {
      if (Won.timers) Won.timers.clear();
      Won.views.forEach(function (v) { v.destroy(); });
      Won.views = [];
      if (Won.el && Won.el.parentNode) Won.el.parentNode.removeChild(Won.el);
      Won.el = null;
    },
  };

  /* =====================================================================
     Eltern-Bereich (Konzept 12.5)
     ===================================================================== */

  var Parents = {
    el: null,
    open: function () {
      if (Parents.el) return;
      var App = KS.App;
      var s = App.settings;
      if (KS.FX) KS.FX.clear();
      var el = (Parents.el = U.el('div', { class: 'parents', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Eltern-Bereich' }));
      var box = U.el('div', { class: 'parents-box' });
      el.appendChild(box);
      var close = button({ icon: 'close', color: 'raspberry', cls: 'btn-small parents-close', label: 'Schließen', onTap: Parents.close });
      box.appendChild(close);
      box.appendChild(U.el('h2', { text: 'Eltern-Bereich' }));

      function section(title, content) {
        var sec = U.el('section', {}, [U.el('h3', { text: title })]);
        content.forEach(function (c) { sec.appendChild(c); });
        box.appendChild(sec);
      }
      function toggle(key, label) {
        var id = 'p-' + key;
        var input = U.el('input', { type: 'checkbox', id: id });
        input.checked = !!s[key];
        input.addEventListener('change', function () { App.setSetting(key, input.checked); });
        return U.el('label', { class: 'p-toggle', for: id }, [input, U.el('span', { class: 'p-switch' }), U.el('span', { text: label })]);
      }
      function choice(key, label, options) {
        var wrap = U.el('div', { class: 'p-choice' }, [U.el('span', { class: 'p-label', text: label })]);
        var grp = U.el('div', { class: 'p-seg', role: 'radiogroup' });
        options.forEach(function (o) {
          var b = U.el('button', { type: 'button', class: 'p-opt' + (App.settings[key] === o[0] ? ' is-on' : ''), text: o[1], role: 'radio' });
          b.addEventListener('click', function () {
            App.setSetting(key, o[0]);
            U.$$('.p-opt', grp).forEach(function (x) { x.classList.toggle('is-on', x === b); });
          });
          grp.appendChild(b);
        });
        wrap.appendChild(grp);
        return wrap;
      }

      // Name
      var name = U.el('input', { type: 'text', class: 'p-text', maxlength: '20', autocomplete: 'off', spellcheck: 'false', placeholder: 'z. B. der Vorname', value: s.childName });
      name.addEventListener('input', function () { App.setSetting('childName', name.value); });
      name.addEventListener('blur', function () { name.value = App.settings.childName; });
      section('Name des Kindes', [U.el('p', { class: 'p-hint', text: 'Wird beim Loben verwendet („Super, …!“) und nur auf diesem Gerät gespeichert.' }), name]);

      // Ton
      var vol = U.el('input', { type: 'range', min: '0', max: '100', step: '5', class: 'p-range', value: String(Math.round(s.volume * 100)) });
      vol.addEventListener('input', function () { App.setSetting('volume', +vol.value / 100); });
      vol.addEventListener('change', function () { if (KS.Audio) KS.Audio.sfx('ding'); });
      section('Ton', [U.el('div', { class: 'p-choice' }, [U.el('span', { class: 'p-label', text: 'Lautstärke' }), vol]), toggle('music', 'Musik'), toggle('ambience', 'Umgebungsgeräusche')]);

      // Sprache
      var voiceInfo = U.el('p', { class: 'p-hint' });
      function updateVoice() {
        var v = KS.Speech && KS.Speech.voiceName ? KS.Speech.voiceName() : '';
        voiceInfo.textContent = v ? 'Stimme: ' + v : 'Keine passende deutsche Stimme gefunden – das Spiel bleibt dann still.';
      }
      updateVoice();
      var test = U.el('button', { type: 'button', class: 'p-btn', text: 'Stimme testen' });
      test.addEventListener('click', function () {
        if (KS.Speech) KS.Speech.say('Hallo! Die Kätzchen verstecken sich. Finde immer zwei gleiche.', { priority: 3, force: true });
        setTimeout(updateVoice, 300);
      });
      var online = toggle('onlineVoice', 'Online-Stimmen erlauben');
      online.querySelector('input').addEventListener('change', function () {
        if (KS.Speech && KS.Speech.refresh) KS.Speech.refresh();
        updateVoice();
      });
      var onlineHint = U.el('p', { class: 'p-hint', text: 'Online-Stimmen (z. B. „Google Deutsch“ oder „… Natural“) klingen oft schöner, senden die gesprochenen Sätze aber an Google bzw. Microsoft – auch den Namen des Kindes. Ohne diesen Schalter werden nur Stimmen verwendet, die auf dem Gerät arbeiten.' });
      section('Sprache', [toggle('speech', 'Sprachausgabe'), toggle('sayNames', 'Katzennamen schon beim Aufdecken'), toggle('tellMore', '„Mehr erzählen“ (Farben und Muster)'), online, onlineHint, voiceInfo, test]);

      // Spiel
      section('Spiel', [
        choice('preview', 'Guck-Phase am Anfang', [[0, 'aus'], [2, '2 s'], [4, '4 s']]),
        choice('missDelay', 'Anzeigedauer bei Fehlpaar', [[1.2, '1,2 s'], [1.8, '1,8 s'], [2.5, '2,5 s'], [3.5, '3,5 s']]),
        choice('hints', 'Tipps pro Spiel', [[0, '0'], [3, '3'], [5, '5'], [-1, 'unbegrenzt']]),
      ]);

      // Sterne zurücksetzen mit Bestätigung im Spiel selbst
      var starLine = U.el('p', { class: 'p-hint', text: 'Im Sternenglas: ' + App.stars + ' Sterne.' });
      var reset = U.el('button', { type: 'button', class: 'p-btn p-danger', text: 'Sterne zurücksetzen …' });
      var confirm = U.el('div', { class: 'p-confirm' }, [
        U.el('span', { text: 'Wirklich alle Sterne löschen?' }),
        U.el('button', { type: 'button', class: 'p-btn p-danger', text: 'Ja, löschen', onclick: function () {
          App.resetStars();
          starLine.textContent = 'Im Sternenglas: 0 Sterne.';
          confirm.classList.remove('is-open');
          Title.refreshJar();
        } }),
        U.el('button', { type: 'button', class: 'p-btn', text: 'Abbrechen', onclick: function () { confirm.classList.remove('is-open'); } }),
      ]);
      reset.addEventListener('click', function () { confirm.classList.add('is-open'); });
      section('Sterne', [starLine, reset, confirm]);

      // Anleitung
      var guide = U.el('div', { class: 'p-guide', html:
        '<p><b>So geht’s:</b> Verstecke antippen, gleiche Katzen finden. Katzen lassen sich antippen (Miau), dreimal schnell kitzeln und streicheln (über den Kopf wischen oder mit der Maus darüberfahren). Kein Zeitdruck, keine verlorenen Punkte.</p>' +
        '<p><b>Halten statt Tippen:</b> Das Haus oben links 1 Sekunde halten beendet ein Spiel. Dieses Zahnrad 2 Sekunden halten öffnet den Eltern-Bereich.</p>' +
        '<p><b>Tasten:</b> F11 = Vollbild, Esc = Dialog schließen.</p>' +
        '<p><b>Datenschutz:</b> Alles bleibt auf diesem Gerät. Es werden keine Daten gesendet, es gibt keine Werbung und keine Links nach außen. Gespeichert werden nur Einstellungen, Sterne und die zuletzt gespielten Welten.</p>' });
      section('Anleitung für Eltern', [guide]);

      U.$('#ui').appendChild(el);
      el.addEventListener('pointerdown', function (e) { if (e.target === el) Parents.close(); });
      el.getBoundingClientRect();
      el.classList.add('is-in');
    },
    close: function () {
      if (!Parents.el) return;
      var el = Parents.el;
      Parents.el = null;
      el.classList.remove('is-in');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
    },
  };

  KS.UI = {
    icon: icon,
    button: button,
    holdable: holdable,
    Hud: Hud,
    Title: Title,
    Won: Won,
    Parents: Parents,
    tapToCat: tapToCat,
    logoSvg: logoSvg,
    jarSvg: jarSvg,
    toggleFullscreen: toggleFullscreen,
    closeDialogs: function () { Parents.close(); },
    ICONS: ICONS,
    STAR_FULL: STAR_FULL,
    STAR_RAINBOW: STAR_RAINBOW,
  };
})(typeof window !== 'undefined' ? window : globalThis);

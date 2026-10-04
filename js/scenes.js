/* Miau-Memory – KS.Scenes: sieben Welten plus Titel und Spielzimmer (Konzept 7.1, 7.4, 12.1).
   Jede Szene: statisches SVG in Fenstergröße (per Seed reproduzierbar) + kleine animierte Ebenen (HTML, nur transform/opacity).
   Deko am Rand und oben, die Mitte hinter dem Spielfeld bleibt ruhig, dazu eine weiche Vignette. */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;

  var SO = 'stroke="#4B3A5A" stroke-opacity="0.28" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var buildNo = 0;

  function n(v) { return Math.round(v * 10) / 10; }

  /* =====================================================================
     Bau-Kontext
     ===================================================================== */

  function Ctx(W, H, rng) {
    this.W = W;
    this.H = H;
    this.r = rng;
    this.p = 'sc' + ++buildNo + '-';
    this.defs = '';
    this.layers = '';
    this.fg = ''; // Vordergrund: liegt über den animierten Ebenen
    this.m = Math.min(W, H);
    this.portrait = H > W;
  }
  Ctx.prototype = {
    id: function (name) { return this.p + name; },
    url: function (name) { return 'url(#' + this.p + name + ')'; },
    lin: function (name, stops, x1, y1, x2, y2) {
      var s = '<linearGradient id="' + this.p + name + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 === undefined ? 0 : x2) + '" y2="' + (y2 === undefined ? 1 : y2) + '">';
      stops.forEach(function (st, i) {
        var o = Array.isArray(st) ? st : [i / Math.max(1, stops.length - 1), st];
        s += '<stop offset="' + o[0] + '" stop-color="' + o[1] + '"' + (o[2] !== undefined ? ' stop-opacity="' + o[2] + '"' : '') + '/>';
      });
      this.defs += s + '</linearGradient>';
      return this.url(name);
    },
    rad: function (name, stops, cx, cy, r) {
      var s = '<radialGradient id="' + this.p + name + '" cx="' + (cx === undefined ? 0.5 : cx) + '" cy="' + (cy === undefined ? 0.5 : cy) + '" r="' + (r || 0.5) + '">';
      stops.forEach(function (st, i) {
        var o = Array.isArray(st) ? st : [i / Math.max(1, stops.length - 1), st];
        s += '<stop offset="' + o[0] + '" stop-color="' + o[1] + '"' + (o[2] !== undefined ? ' stop-opacity="' + o[2] + '"' : '') + '/>';
      });
      this.defs += s + '</radialGradient>';
      return this.url(name);
    },
    /** animierte Ebene: eigenes kleines SVG in einem div */
    layer: function (x, y, w, h, inner, cls, style) {
      this.layers += '<div class="sc-layer ' + (cls || '') + '" style="left:' + n(x) + 'px;top:' + n(y) + 'px;width:' + n(w) + 'px;height:' + n(h) + 'px;' + (style || '') + '">' +
        '<svg viewBox="0 0 ' + n(w) + ' ' + n(h) + '" width="' + n(w) + '" height="' + n(h) + '" overflow="visible">' + inner + '</svg></div>';
    },
  };

  /* =====================================================================
     Bausteine
     ===================================================================== */

  var B = {};

  /** Flauschige Wolke, Mittelpunkt unten (x, y), Breite ~ 160·s */
  B.cloud = function (x, y, s, fill, shade, outline) {
    var k = s || 1;
    function p(dx, dy) { return n(x + dx * k) + ' ' + n(y + dy * k); }
    var d = 'M' + p(-78, 0) + 'C' + p(-96, 0) + ' ' + p(-96, -30) + ' ' + p(-70, -32) + 'C' + p(-70, -58) + ' ' + p(-34, -66) + ' ' + p(-20, -46) +
      'C' + p(-10, -76) + ' ' + p(34, -80) + ' ' + p(40, -46) + 'C' + p(58, -62) + ' ' + p(90, -50) + ' ' + p(80, -26) +
      'C' + p(100, -24) + ' ' + p(100, 0) + ' ' + p(78, 0) + 'Z';
    var s2 = '<path d="' + d + '" fill="' + (fill || '#FFFFFF') + '"' + (outline === false ? '' : ' ' + SO) + '/>';
    if (shade) s2 += '<path d="M' + p(-78, 0) + 'C' + p(-40, -10) + ' ' + p(40, -10) + ' ' + p(78, 0) + 'Z" fill="' + shade + '" opacity="0.7"/>';
    return s2;
  };

  /** Runder Laubbaum */
  B.tree = function (x, y, s, crown, dark, trunk) {
    var k = s || 1;
    function p(dx, dy) { return n(x + dx * k) + ' ' + n(y + dy * k); }
    return '<path d="M' + p(-8, 0) + 'L' + p(-6, -60) + 'L' + p(6, -60) + 'L' + p(8, 0) + 'Z" fill="' + (trunk || '#9C6B45') + '" ' + SO + '/>' +
      '<circle cx="' + n(x) + '" cy="' + n(y - 92 * k) + '" r="' + n(48 * k) + '" fill="' + crown + '" ' + SO + '/>' +
      '<circle cx="' + n(x - 30 * k) + '" cy="' + n(y - 70 * k) + '" r="' + n(30 * k) + '" fill="' + crown + '" ' + SO + '/>' +
      '<circle cx="' + n(x + 30 * k) + '" cy="' + n(y - 72 * k) + '" r="' + n(30 * k) + '" fill="' + crown + '" ' + SO + '/>' +
      '<circle cx="' + n(x) + '" cy="' + n(y - 80 * k) + '" r="' + n(34 * k) + '" fill="' + crown + '"/>' +
      '<circle cx="' + n(x - 16 * k) + '" cy="' + n(y - 108 * k) + '" r="' + n(14 * k) + '" fill="#FFFFFF" opacity="0.25"/>' +
      (dark ? '<path d="M' + p(-44, -76) + 'C' + p(-30, -52) + ' ' + p(30, -52) + ' ' + p(44, -76) + 'C' + p(40, -58) + ' ' + p(-40, -58) + ' ' + p(-44, -76) + 'Z" fill="' + dark + '" opacity="0.5"/>' : '');
  };

  /** Tanne (optional verschneit) */
  B.fir = function (x, y, s, col, snow) {
    var k = s || 1;
    function p(dx, dy) { return n(x + dx * k) + ' ' + n(y + dy * k); }
    var out = '<rect x="' + n(x - 6 * k) + '" y="' + n(y - 16 * k) + '" width="' + n(12 * k) + '" height="' + n(16 * k) + '" fill="#8A5A3B" ' + SO + '/>';
    [[0, 44, 110], [-34, 36, 84], [-64, 26, 58]].forEach(function (t) {
      var yy = t[0] - 12, w = t[1];
      out += '<path d="M' + p(-w, yy) + 'Q' + p(0, yy + 10) + ' ' + p(w, yy) + 'L' + p(4, yy - t[2] * 0.62) + 'Q' + p(0, yy - t[2] * 0.66) + ' ' + p(-4, yy - t[2] * 0.62) + 'Z" fill="' + col + '" ' + SO + '/>';
      if (snow) out += '<path d="M' + p(-w * 0.55, yy - t[2] * 0.28) + 'Q' + p(0, yy - t[2] * 0.18) + ' ' + p(w * 0.55, yy - t[2] * 0.28) + 'L' + p(4, yy - t[2] * 0.6) + 'Q' + p(0, yy - t[2] * 0.66) + ' ' + p(-4, yy - t[2] * 0.6) + 'Z" fill="#FFFFFF" opacity="0.95"/>';
    });
    return out;
  };

  B.grass = function (x, y, s, col) {
    var k = s || 1;
    return '<path d="M' + n(x - 10 * k) + ' ' + n(y) + 'Q' + n(x - 8 * k) + ' ' + n(y - 12 * k) + ' ' + n(x - 12 * k) + ' ' + n(y - 20 * k) +
      'Q' + n(x - 2 * k) + ' ' + n(y - 12 * k) + ' ' + n(x) + ' ' + n(y - 4 * k) + 'Q' + n(x + 2 * k) + ' ' + n(y - 18 * k) + ' ' + n(x + 2 * k) + ' ' + n(y - 26 * k) +
      'Q' + n(x + 8 * k) + ' ' + n(y - 14 * k) + ' ' + n(x + 6 * k) + ' ' + n(y - 4 * k) + 'Q' + n(x + 10 * k) + ' ' + n(y - 12 * k) + ' ' + n(x + 16 * k) + ' ' + n(y - 16 * k) +
      'Q' + n(x + 12 * k) + ' ' + n(y - 6 * k) + ' ' + n(x + 12 * k) + ' ' + n(y) + 'Z" fill="' + col + '"/>';
  };

  B.tulip = function (x, y, s, col) {
    var k = s || 1;
    function p(dx, dy) { return n(x + dx * k) + ' ' + n(y + dy * k); }
    return '<path d="M' + p(0, 0) + 'L' + p(0, -40) + '" stroke="#4E9E52" stroke-width="' + n(4 * k) + '" stroke-linecap="round"/>' +
      '<path d="M' + p(0, -14) + 'C' + p(-12, -18) + ' ' + p(-14, -30) + ' ' + p(-12, -34) + 'C' + p(-4, -30) + ' ' + p(0, -24) + ' ' + p(0, -14) + 'Z" fill="#6CC070"/>' +
      '<path d="M' + p(-9, -52) + 'C' + p(-10, -40) + ' ' + p(-6, -36) + ' ' + p(0, -36) + 'C' + p(6, -36) + ' ' + p(10, -40) + ' ' + p(9, -52) + 'L' + p(4, -47) + 'L' + p(0, -55) + 'L' + p(-4, -47) + 'Z" fill="' + col + '" ' + SO + '/>';
  };

  B.daisy = function (x, y, s, center) {
    var k = s || 1;
    var out = '<path d="M' + n(x) + ' ' + n(y) + 'L' + n(x) + ' ' + n(y - 26 * k) + '" stroke="#4E9E52" stroke-width="' + n(3 * k) + '" stroke-linecap="round"/>';
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      out += '<ellipse cx="' + n(x + Math.cos(a) * 6 * k) + '" cy="' + n(y - 30 * k + Math.sin(a) * 6 * k) + '" rx="' + n(4 * k) + '" ry="' + n(2.4 * k) + '" transform="rotate(' + n(a * 57.3) + ' ' + n(x + Math.cos(a) * 6 * k) + ' ' + n(y - 30 * k + Math.sin(a) * 6 * k) + ')" fill="#FFFFFF"/>';
    }
    return out + '<circle cx="' + n(x) + '" cy="' + n(y - 30 * k) + '" r="' + n(3.6 * k) + '" fill="' + (center || '#FFC93C') + '"/>';
  };

  B.star = function (x, y, r, col, rot) {
    return '<path d="' + KS.CatArt.starPath(x, y, r, 0.48, rot || 0) + '" fill="' + col + '"/>';
  };

  B.heart = function (x, y, s, col) {
    return '<path d="' + KS.CatArt.heartPath(x, y, s) + '" fill="' + col + '"/>';
  };

  B.pawPrint = function (x, y, s, col, rot) {
    var k = s || 1;
    return '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + (rot || 0) + ') scale(' + k + ')" fill="' + col + '">' +
      '<ellipse cx="0" cy="4" rx="7" ry="6"/><ellipse cx="-7.5" cy="-4" rx="2.8" ry="3.4"/><ellipse cx="-2.6" cy="-8.5" rx="2.8" ry="3.6"/><ellipse cx="2.6" cy="-8.5" rx="2.8" ry="3.6"/><ellipse cx="7.5" cy="-4" rx="2.8" ry="3.4"/></g>';
  };

  /** Hügel über die ganze Breite: Wellenlinie auf Höhe y */
  B.hills = function (c, y, amp, col, seedShift, bumps) {
    var W = c.W, H = c.H;
    var r = c.r;
    var k = bumps || 3;
    var d = 'M-20 ' + n(H + 20) + 'L-20 ' + n(y);
    var seg = (W + 40) / k;
    for (var i = 0; i < k; i++) {
      var x0 = -20 + i * seg;
      var h = amp * (0.6 + r.next() * 0.6) * (i % 2 === (seedShift || 0) ? 1 : 0.55);
      d += 'Q' + n(x0 + seg / 2) + ' ' + n(y - h * 2) + ' ' + n(x0 + seg) + ' ' + n(y);
    }
    return '<path d="' + d + 'L' + n(W + 20) + ' ' + n(H + 20) + 'Z" fill="' + col + '"/>';
  };

  /** Schmetterling (für animierte Ebene, Mitte 30/24) */
  B.butterfly = function (col, col2) {
    return '<g class="bf-wings">' +
      '<path d="M30 24C20 6 4 6 6 18C8 28 20 28 30 24Z" fill="' + col + '" ' + SO + '/>' +
      '<path d="M30 24C40 6 56 6 54 18C52 28 40 28 30 24Z" fill="' + col + '" ' + SO + '/>' +
      '<path d="M30 25C22 32 12 40 14 32C16 26 24 26 30 25Z" fill="' + col2 + '" ' + SO + '/>' +
      '<path d="M30 25C38 32 48 40 46 32C44 26 36 26 30 25Z" fill="' + col2 + '" ' + SO + '/>' +
      '<circle cx="16" cy="16" r="3" fill="#FFFFFF" opacity="0.7"/><circle cx="44" cy="16" r="3" fill="#FFFFFF" opacity="0.7"/></g>' +
      '<ellipse cx="30" cy="25" rx="2.6" ry="9" fill="#4B3A5A"/><path d="M29 17Q26 10 22 8M31 17Q34 10 38 8" stroke="#4B3A5A" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  };

  /** Heißluftballon (Ebene 90×130) */
  B.balloon = function (c1, c2) {
    return '<path d="M45 8C18 8 6 30 8 50C10 70 30 84 38 96H52C60 84 80 70 82 50C84 30 72 8 45 8Z" fill="' + c1 + '" ' + SO + '/>' +
      '<path d="M45 8C34 8 28 30 30 50C32 70 38 84 40 96H50C52 84 58 70 60 50C62 30 56 8 45 8Z" fill="' + c2 + '"/>' +
      '<path d="M45 8C18 8 6 30 8 50C10 70 30 84 38 96H52C60 84 80 70 82 50C84 30 72 8 45 8Z" fill="none" ' + SO + '/>' +
      '<ellipse cx="30" cy="30" rx="6" ry="10" fill="#FFFFFF" opacity="0.35"/>' +
      '<path d="M39 96L37 110M51 96L53 110" stroke="#8A6A55" stroke-width="2"/>' +
      '<rect x="34" y="108" width="22" height="16" rx="4" fill="#C98F57" ' + SO + '/><path d="M34 114H56" stroke="#A8743F" stroke-width="2"/>';
  };

  /* =====================================================================
     Welten
     ===================================================================== */

  var WORLDS = {};

  /* ---------- 1. Gemütliches Wohnzimmer ---------- */
  WORLDS.livingroom = {
    name: 'Wohnzimmer',
    hider: 'box',
    variants: function (r) {
      var walls = [
        { wall: '#FBE3EA', pat: '#F5CAD7' }, { wall: '#DFF3EA', pat: '#C3E6D6' }, { wall: '#E0EEFB', pat: '#C6DDF4' },
        { wall: '#FDF1D2', pat: '#F5E0AA' }, { wall: '#ECE3FA', pat: '#D9CCF4' },
      ];
      var w = r.pick(walls);
      return {
        wall: w.wall, pat: w.pat, pattern: r.pick(['dots', 'stripes', 'hearts']),
        rug: r.pick([['#FFB3C6', '#FF8FB1'], ['#A9D8F5', '#7FC0EA'], ['#BFE3C4', '#95CFA0'], ['#FFD8A8', '#FFBE75']]),
        evening: r.chance(0.35),
        hiderVariant: r.pick(['light', 'dark']),
      };
    },
    music: { key: 'F', bpm: 88, inst: 'musicbox', prog: 'I-vi-IV-V' },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var floorY = H * (c.portrait ? 0.62 : 0.66);
      var s = '';
      var wall = v.evening ? U.mix(v.wall, '#6B5A8C', 0.25) : v.wall;
      var pat = v.evening ? U.mix(v.pat, '#6B5A8C', 0.25) : v.pat;
      // Tapete mit Muster
      var pid = c.id('wp');
      var tile = '';
      if (v.pattern === 'dots') tile = '<circle cx="12" cy="12" r="4" fill="' + pat + '"/><circle cx="36" cy="36" r="4" fill="' + pat + '"/>';
      else if (v.pattern === 'stripes') tile = '<rect x="0" y="0" width="16" height="48" fill="' + pat + '" opacity="0.7"/>';
      else tile = '<path d="' + KS.CatArt.heartPath(12, 10, 10) + '" fill="' + pat + '"/><path d="' + KS.CatArt.heartPath(36, 34, 10) + '" fill="' + pat + '"/>';
      c.defs += '<pattern id="' + pid + '" width="48" height="48" patternUnits="userSpaceOnUse">' + tile + '</pattern>';
      s += '<rect width="' + W + '" height="' + floorY + '" fill="' + wall + '"/><rect width="' + W + '" height="' + floorY + '" fill="url(#' + pid + ')"/>';
      // Fußleiste und Dielen
      var floorGrad = c.lin('floor', [v.evening ? '#C99A6E' : '#E6BD8C', v.evening ? '#A87A52' : '#D4A574']);
      s += '<rect y="' + n(floorY) + '" width="' + W + '" height="' + n(H - floorY) + '" fill="' + floorGrad + '"/>';
      var plank = Math.max(26, (H - floorY) / 7);
      for (var yy = floorY + plank; yy < H; yy += plank) s += '<path d="M0 ' + n(yy) + 'H' + W + '" stroke="#B9875A" stroke-width="2" opacity="0.45"/>';
      for (var row = 0, y2 = floorY; y2 < H; y2 += plank, row++) {
        for (var xx = (row % 2) * 90 + r.int(0, 60); xx < W; xx += 180) s += '<path d="M' + n(xx) + ' ' + n(y2 + 2) + 'V' + n(y2 + plank - 2) + '" stroke="#B9875A" stroke-width="2" opacity="0.35"/>';
      }
      s += '<rect y="' + n(floorY - 14) + '" width="' + W + '" height="16" fill="#FFFFFF" opacity="0.9"/><path d="M0 ' + n(floorY + 2) + 'H' + W + '" stroke="#4B3A5A" stroke-opacity="0.2" stroke-width="2"/>';
      // Großer runder Teppich unter dem Spielfeld
      s += '<ellipse cx="' + n(W / 2) + '" cy="' + n(floorY + (H - floorY) * 0.55) + '" rx="' + n(W * 0.46) + '" ry="' + n((H - floorY) * 0.42) + '" fill="' + v.rug[1] + '"/>';
      s += '<ellipse cx="' + n(W / 2) + '" cy="' + n(floorY + (H - floorY) * 0.55) + '" rx="' + n(W * 0.42) + '" ry="' + n((H - floorY) * 0.34) + '" fill="' + v.rug[0] + '"/>';
      s += '<ellipse cx="' + n(W / 2) + '" cy="' + n(floorY + (H - floorY) * 0.55) + '" rx="' + n(W * 0.34) + '" ry="' + n((H - floorY) * 0.24) + '" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round" opacity="0.8"/>';

      // Fenster mit Vorhängen (links oben)
      var fw = Math.max(130, Math.min(W * 0.17, 260)), fh = fw * 1.25;
      var fx = W * 0.05, fy = H * 0.14;
      var skyA = v.evening ? '#2E3A74' : '#8FD0F5', skyB = v.evening ? '#7E6BC4' : '#D8F0FF';
      var winSky = c.lin('win', [skyA, skyB]);
      s += '<rect x="' + n(fx - 8) + '" y="' + n(fy - 8) + '" width="' + n(fw + 16) + '" height="' + n(fh + 16) + '" rx="10" fill="#FFFFFF" ' + SO + '/>';
      s += '<rect x="' + n(fx) + '" y="' + n(fy) + '" width="' + n(fw) + '" height="' + n(fh) + '" rx="4" fill="' + winSky + '"/>';
      if (v.evening) {
        s += '<circle cx="' + n(fx + fw * 0.68) + '" cy="' + n(fy + fh * 0.3) + '" r="' + n(fw * 0.12) + '" fill="#FFF3C4"/><circle cx="' + n(fx + fw * 0.74) + '" cy="' + n(fy + fh * 0.27) + '" r="' + n(fw * 0.11) + '" fill="' + skyA + '"/>';
        for (var i = 0; i < 6; i++) s += B.star(fx + r.range(0.1, 0.9) * fw, fy + r.range(0.1, 0.8) * fh, r.range(2, 4), '#FFF3C4');
      } else {
        s += B.cloud(fx + fw * 0.4, fy + fh * 0.4, fw / 320, '#FFFFFF', null, false);
        s += B.cloud(fx + fw * 0.8, fy + fh * 0.7, fw / 420, '#FFFFFF', null, false);
      }
      s += '<path d="M' + n(fx + fw / 2) + ' ' + n(fy) + 'V' + n(fy + fh) + 'M' + n(fx) + ' ' + n(fy + fh / 2) + 'H' + n(fx + fw) + '" stroke="#FFFFFF" stroke-width="8"/>';
      s += '<rect x="' + n(fx - 14) + '" y="' + n(fy + fh + 6) + '" width="' + n(fw + 28) + '" height="12" rx="6" fill="#FFFFFF" ' + SO + '/>';
      // Vorhänge als animierte Ebenen
      var curtain = v.evening ? '#B7A3E8' : r.pick(['#FF9EC4', '#FFC93C', '#7FC0EA', '#A8E0C0']);
      var cw = fw * 0.34, ch = fh + 40;
      var cur = '<path d="M0 0H' + n(cw) + 'C' + n(cw * 0.7) + ' ' + n(ch * 0.4) + ' ' + n(cw * 0.9) + ' ' + n(ch * 0.8) + ' ' + n(cw * 0.6) + ' ' + n(ch) + 'H0Z" fill="' + curtain + '" ' + SO + '/>' +
        '<path d="M' + n(cw * 0.3) + ' 4V' + n(ch - 4) + 'M' + n(cw * 0.6) + ' 4C' + n(cw * 0.5) + ' ' + n(ch * 0.4) + ' ' + n(cw * 0.6) + ' ' + n(ch * 0.7) + ' ' + n(cw * 0.45) + ' ' + n(ch - 4) + '" stroke="#FFFFFF" stroke-width="3" opacity="0.35" fill="none"/>';
      c.layer(fx - 18, fy - 22, cw, ch, cur, 'sc-anim sc-sway', '--dur:7s;transform-origin:0 0');
      c.layer(fx + fw + 18 - cw, fy - 22, cw, ch, '<g transform="matrix(-1 0 0 1 ' + n(cw) + ' 0)">' + cur + '</g>', 'sc-anim sc-sway', '--dur:8s;--a:-2.5deg;transform-origin:100% 0');
      s += '<rect x="' + n(fx - 30) + '" y="' + n(fy - 26) + '" width="' + n(fw + 60) + '" height="10" rx="5" fill="#C98F57" ' + SO + '/>';
      // Sonnenstrahl mit tanzendem Staub (nur am Tag)
      if (!v.evening) {
        var beam = c.lin('beam', [['0', '#FFFBE6', 0.55], ['1', '#FFFBE6', 0]], 0, 0, 1, 1);
        s += '<path d="M' + n(fx) + ' ' + n(fy) + 'L' + n(fx + fw) + ' ' + n(fy) + 'L' + n(fx + fw + W * 0.3) + ' ' + n(H) + 'L' + n(fx + W * 0.12) + ' ' + n(H) + 'Z" fill="' + beam + '" opacity="0.8"/>';
        c.fx = { kind: 'dust', opts: { box: { x: fx, y: fy, w: fw + W * 0.2, h: H - fy } } };
      }

      // Bilderrahmen: Fisch, Wollknäuel, Maus (oben Mitte/rechts)
      var frames = [
        function (x, y, w, h) { return '<path d="M' + n(x + w * 0.2) + ' ' + n(y + h * 0.5) + 'C' + n(x + w * 0.35) + ' ' + n(y + h * 0.28) + ' ' + n(x + w * 0.6) + ' ' + n(y + h * 0.28) + ' ' + n(x + w * 0.72) + ' ' + n(y + h * 0.46) + 'L' + n(x + w * 0.86) + ' ' + n(y + h * 0.32) + 'V' + n(y + h * 0.68) + 'L' + n(x + w * 0.72) + ' ' + n(y + h * 0.54) + 'C' + n(x + w * 0.6) + ' ' + n(y + h * 0.72) + ' ' + n(x + w * 0.35) + ' ' + n(y + h * 0.72) + ' ' + n(x + w * 0.2) + ' ' + n(y + h * 0.5) + 'Z" fill="#FFB36B" ' + SO + '/><circle cx="' + n(x + w * 0.34) + '" cy="' + n(y + h * 0.47) + '" r="' + n(w * 0.04) + '" fill="#4B3A5A"/>'; },
        function (x, y, w, h) { var rr = w * 0.26; return '<circle cx="' + n(x + w / 2) + '" cy="' + n(y + h / 2) + '" r="' + n(rr) + '" fill="#FF8FB1" ' + SO + '/><path d="M' + n(x + w / 2 - rr) + ' ' + n(y + h / 2) + 'Q' + n(x + w / 2) + ' ' + n(y + h / 2 - rr * 0.6) + ' ' + n(x + w / 2 + rr) + ' ' + n(y + h / 2) + 'M' + n(x + w / 2 - rr * 0.7) + ' ' + n(y + h / 2 + rr * 0.6) + 'Q' + n(x + w / 2) + ' ' + n(y + h / 2) + ' ' + n(x + w / 2 + rr * 0.8) + ' ' + n(y + h / 2 + rr * 0.4) + '" stroke="#FFD1DF" stroke-width="3" fill="none"/>'; },
        function (x, y, w, h) { return '<ellipse cx="' + n(x + w * 0.5) + '" cy="' + n(y + h * 0.58) + '" rx="' + n(w * 0.26) + '" ry="' + n(h * 0.16) + '" fill="#C9C3D6" ' + SO + '/><circle cx="' + n(x + w * 0.34) + '" cy="' + n(y + h * 0.42) + '" r="' + n(w * 0.09) + '" fill="#FFC2D2" ' + SO + '/><circle cx="' + n(x + w * 0.3) + '" cy="' + n(y + h * 0.56) + '" r="' + n(w * 0.025) + '" fill="#4B3A5A"/><path d="M' + n(x + w * 0.76) + ' ' + n(y + h * 0.6) + 'Q' + n(x + w * 0.9) + ' ' + n(y + h * 0.5) + ' ' + n(x + w * 0.86) + ' ' + n(y + h * 0.36) + '" stroke="#C9C3D6" stroke-width="3" fill="none" stroke-linecap="round"/>'; },
      ];
      var fwid = Math.max(70, Math.min(W * 0.075, 120));
      var fcols = ['#FFD24A', '#FF9EC4', '#7FC0EA'];
      var fpos = c.portrait ? [[0.62, 0.05], [0.8, 0.11]] : [[0.44, 0.06], [0.58, 0.1], [0.72, 0.05]];
      fpos.forEach(function (fp, i) {
        var x = W * fp[0], y = H * fp[1] + 6, w = fwid, h = fwid * 0.8;
        s += '<rect x="' + n(x - 7) + '" y="' + n(y - 7) + '" width="' + n(w + 14) + '" height="' + n(h + 14) + '" rx="8" fill="' + fcols[i] + '" ' + SO + '/>';
        s += '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="3" fill="#FFFDF7"/>';
        s += frames[i](x, y, w, h);
      });

      // Kratzbaum (rechts)
      var kx = W * 0.93, kb = floorY + (H - floorY) * 0.25, kh = Math.min(H * 0.55, 420);
      s += '<rect x="' + n(kx - 50) + '" y="' + n(kb - 16) + '" width="100" height="22" rx="8" fill="#B9A38A" ' + SO + '/>';
      s += '<rect x="' + n(kx - 12) + '" y="' + n(kb - kh) + '" width="24" height="' + n(kh - 10) + '" fill="#E7CFA0" ' + SO + '/>';
      for (var sy = kb - kh + 8; sy < kb - 16; sy += 8) s += '<path d="M' + n(kx - 12) + ' ' + n(sy) + 'L' + n(kx + 12) + ' ' + n(sy + 4) + '" stroke="#C9A96E" stroke-width="2"/>';
      s += '<rect x="' + n(kx - 58) + '" y="' + n(kb - kh * 0.55) + '" width="116" height="18" rx="9" fill="#A993C9" ' + SO + '/>';
      s += '<rect x="' + n(kx - 46) + '" y="' + n(kb - kh - 12) + '" width="92" height="18" rx="9" fill="#A993C9" ' + SO + '/>';
      s += '<path d="M' + n(kx + 40) + ' ' + n(kb - kh * 0.55 + 16) + 'V' + n(kb - kh * 0.3) + '" stroke="#8C7B9E" stroke-width="2"/><circle cx="' + n(kx + 40) + '" cy="' + n(kb - kh * 0.3 + 8) + '" r="9" fill="#FF6F91" ' + SO + '/>';

      // Zimmerpflanze (links unten)
      var px = W * 0.05, pb = H * 0.98;
      s += '<path d="M' + n(px - 30) + ' ' + n(pb - 60) + 'H' + n(px + 30) + 'L' + n(px + 24) + ' ' + n(pb) + 'H' + n(px - 24) + 'Z" fill="#6FA8DC" ' + SO + '/>';
      [[-50, -150, -40], [0, -170, 0], [44, -140, 35], [-30, -110, -60], [30, -105, 60]].forEach(function (l) {
        s += '<path d="M' + n(px) + ' ' + n(pb - 60) + 'Q' + n(px + l[0] * 0.3) + ' ' + n(pb - 60 + l[1] * 0.5) + ' ' + n(px + l[0]) + ' ' + n(pb - 60 + l[1] * 0.8) + '" stroke="#4E9E52" stroke-width="4" fill="none"/>';
        s += '<ellipse cx="' + n(px + l[0]) + '" cy="' + n(pb - 60 + l[1] * 0.8) + '" rx="22" ry="34" transform="rotate(' + l[2] + ' ' + n(px + l[0]) + ' ' + n(pb - 60 + l[1] * 0.8) + ')" fill="#6CC070" ' + SO + '/>';
      });

      // Goldfischglas auf Tischchen (links, auf dem Boden)
      var gx = W * 0.14, gy = floorY + 4;
      if (!c.portrait || W > 700) {
        s += '<rect x="' + n(gx - 40) + '" y="' + n(gy - 70) + '" width="80" height="12" rx="6" fill="#D6A36A" ' + SO + '/><path d="M' + n(gx - 30) + ' ' + n(gy - 58) + 'L' + n(gx - 34) + ' ' + n(gy + 20) + 'M' + n(gx + 30) + ' ' + n(gy - 58) + 'L' + n(gx + 34) + ' ' + n(gy + 20) + '" stroke="#B98A55" stroke-width="7" stroke-linecap="round"/>';
        s += '<circle cx="' + n(gx) + '" cy="' + n(gy - 104) + '" r="36" fill="#CDEBFA" opacity="0.85" ' + SO + '/><path d="M' + n(gx - 33) + ' ' + n(gy - 110) + 'Q' + n(gx) + ' ' + n(gy - 104) + ' ' + n(gx + 33) + ' ' + n(gy - 110) + 'A36 36 0 0 1 ' + n(gx - 33) + ' ' + n(gy - 110) + 'Z" fill="#8FD0F5" opacity="0.6"/><ellipse cx="' + n(gx - 14) + '" cy="' + n(gy - 122) + '" rx="6" ry="10" fill="#FFFFFF" opacity="0.6"/>';
        c.layer(gx - 26, gy - 104, 52, 24, '<g class="sc-fishbody"><path d="M6 12C12 4 26 4 32 10L40 4V20L32 14C26 20 12 20 6 12Z" fill="#FF9A3D" stroke="#4B3A5A" stroke-opacity="0.4" stroke-width="2"/><circle cx="13" cy="11" r="2" fill="#4B3A5A"/></g>', 'sc-anim sc-swim', '--dur:6s');
      }
      // Stehlampe (rechts neben dem Kratzbaum), abends an
      var lx = W * 0.82, lb = floorY + 10;
      if (!c.portrait) {
        if (v.evening) s += '<circle cx="' + n(lx) + '" cy="' + n(lb - 230) + '" r="140" fill="' + c.rad('lamp', [['0', '#FFE9A8', 0.7], ['1', '#FFE9A8', 0]]) + '"/>';
        s += '<path d="M' + n(lx) + ' ' + n(lb - 220) + 'V' + n(lb) + '" stroke="#8C7B9E" stroke-width="6"/><ellipse cx="' + n(lx) + '" cy="' + n(lb) + '" rx="26" ry="7" fill="#8C7B9E"/>';
        s += '<path d="M' + n(lx - 34) + ' ' + n(lb - 210) + 'L' + n(lx - 22) + ' ' + n(lb - 258) + 'H' + n(lx + 22) + 'L' + n(lx + 34) + ' ' + n(lb - 210) + 'Z" fill="' + (v.evening ? '#FFE08A' : '#FFD1DF') + '" ' + SO + '/>';
      }
      if (v.evening) s += '<rect width="' + W + '" height="' + H + '" fill="#3A2F6B" opacity="0.12"/>';
      c.ambience = v.evening ? ['fire'] : ['clock'];
      return s;
    },
  };

  /* ---------- 2. Sommergarten ---------- */
  WORLDS.garden = {
    name: 'Sommergarten',
    hider: 'pot',
    variants: function (r) {
      var time = r.pick(['morning', 'noon', 'sunset']);
      return { time: time, flowers: r.pick([['#FF6F91', '#FFC93C'], ['#B89CFF', '#FF9EC4'], ['#FF8A5B', '#FFE066']]), hiderVariant: r.pick(['dots', 'hearts', 'stripes']) };
    },
    music: { key: 'C', bpm: 104, inst: 'marimba', prog: 'I-IV-V-I', pluck: true },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var skies = { morning: ['#FFD6E4', '#BFE3FF'], noon: ['#7CC8F2', '#D6F0FF'], sunset: ['#FFB38A', '#FFD9C2'] };
      var sk = skies[v.time];
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', [sk[0], sk[1]]) + '"/>';
      var horizon = H * (c.portrait ? 0.5 : 0.55);
      // Sonne mit langsam drehenden Strahlen
      var sr = Math.max(46, c.m * 0.07);
      var sx = W * 0.86, sy = H * (v.time === 'sunset' ? 0.36 : 0.2);
      var rays = '';
      for (var i = 0; i < 12; i++) {
        var a = (i / 12) * Math.PI * 2;
        rays += '<path d="M' + n(sr * 2 + Math.cos(a) * sr * 1.3) + ' ' + n(sr * 2 + Math.sin(a) * sr * 1.3) + 'L' + n(sr * 2 + Math.cos(a + 0.12) * sr * 1.85) + ' ' + n(sr * 2 + Math.sin(a + 0.12) * sr * 1.85) + 'L' + n(sr * 2 + Math.cos(a - 0.12) * sr * 1.85) + ' ' + n(sr * 2 + Math.sin(a - 0.12) * sr * 1.85) + 'Z" fill="#FFE27A" opacity="0.8"/>';
      }
      c.layer(sx - sr * 2, sy - sr * 2, sr * 4, sr * 4, rays, 'sc-anim sc-spin', '--dur:60s');
      s += '<circle cx="' + n(sx) + '" cy="' + n(sy) + '" r="' + n(sr * 1.6) + '" fill="' + c.rad('sunglow', [['0', '#FFF6C4', 0.9], ['1', '#FFF6C4', 0]]) + '"/>';
      s += '<circle cx="' + n(sx) + '" cy="' + n(sy) + '" r="' + n(sr) + '" fill="' + (v.time === 'sunset' ? '#FFB347' : '#FFD84A') + '" ' + SO + '/>';
      // ziehende Wolken
      for (var k = 0; k < 3; k++) {
        var cwid = c.m * r.range(0.22, 0.32);
        c.layer(W * (0.1 + k * 0.3) + r.range(-40, 40), H * r.range(0.04, 0.2), cwid, cwid * 0.5, B.cloud(cwid / 2, cwid * 0.48, cwid / 190, '#FFFFFF', '#EAF4FF'), 'sc-anim sc-drift', '--dur:' + r.int(28, 44) + 's;--dx:' + r.int(40, 90) + 'px');
      }
      // zwei Hügelreihen mit runden Bäumen
      s += B.hills(c, horizon, H * 0.06, v.time === 'sunset' ? '#A9CF8A' : '#A8DC8C', 0, 3);
      s += B.tree(W * 0.08, horizon + 4, c.m / 420, '#7CC873', '#5DAA5A');
      s += B.tree(W * 0.94, horizon + 10, c.m / 460, '#6FBE6A', '#55A052');
      if (!c.portrait) {
        s += B.tree(W * 0.3, horizon - 8, c.m / 700, '#8BD27F');
        s += B.tree(W * 0.7, horizon - 4, c.m / 640, '#86CE7A');
      }
      s += B.hills(c, horizon + H * 0.08, H * 0.05, v.time === 'sunset' ? '#8FC474' : '#8ED177', 1, 4);
      // Rasen
      s += '<rect y="' + n(horizon + H * 0.1) + '" width="' + W + '" height="' + n(H) + '" fill="' + c.lin('lawn', ['#86CC6F', '#6DB85C']) + '"/>';
      // weißer Gartenzaun mit Tulpen und Gänseblümchen
      var fy = horizon + H * 0.12;
      var ph = Math.max(40, H * 0.08), pw = Math.max(18, W * 0.018);
      var fence = '<rect x="0" y="' + n(fy - ph * 0.62) + '" width="' + W + '" height="' + n(ph * 0.12) + '" fill="#FFFFFF" ' + SO + '/><rect x="0" y="' + n(fy - ph * 0.28) + '" width="' + W + '" height="' + n(ph * 0.12) + '" fill="#FFFFFF" ' + SO + '/>';
      for (var x = 8; x < W; x += pw * 1.9) {
        fence += '<path d="M' + n(x) + ' ' + n(fy) + 'V' + n(fy - ph * 0.8) + 'L' + n(x + pw / 2) + ' ' + n(fy - ph) + 'L' + n(x + pw) + ' ' + n(fy - ph * 0.8) + 'V' + n(fy) + 'Z" fill="#FFFFFF" ' + SO + '/>';
      }
      s += fence;
      for (var fl = 0; fl < W; fl += r.range(34, 60)) {
        s += r.chance(0.55) ? B.tulip(fl, fy + 6, r.range(0.8, 1.1), r.pick(v.flowers)) : B.daisy(fl, fy + 6, r.range(0.8, 1.1));
      }
      // Grasbüschel unten
      for (var g = 0; g < W; g += r.range(40, 90)) s += B.grass(g, H - r.range(0, H * 0.05), r.range(1, 1.6), '#5DAA4E');
      // Vogelhaus (links), Gießkanne (rechts unten)
      var bx = W * 0.06, by = H * 0.52;
      if (!c.portrait) {
        s += '<rect x="' + n(bx - 4) + '" y="' + n(by) + '" width="8" height="' + n(fy - by) + '" fill="#9C6B45" ' + SO + '/>';
        s += '<rect x="' + n(bx - 28) + '" y="' + n(by - 46) + '" width="56" height="46" rx="4" fill="#FFB36B" ' + SO + '/><path d="M' + n(bx - 36) + ' ' + n(by - 42) + 'L' + n(bx) + ' ' + n(by - 72) + 'L' + n(bx + 36) + ' ' + n(by - 42) + 'Z" fill="#E8574A" ' + SO + '/><circle cx="' + n(bx) + '" cy="' + n(by - 24) + '" r="8" fill="#5A4636"/>';
      }
      var wx = W * 0.92, wy = H * 0.94;
      s += '<path d="M' + n(wx - 30) + ' ' + n(wy) + 'L' + n(wx - 26) + ' ' + n(wy - 44) + 'H' + n(wx + 26) + 'L' + n(wx + 30) + ' ' + n(wy) + 'Z" fill="#5AB9EA" ' + SO + '/><path d="M' + n(wx + 26) + ' ' + n(wy - 36) + 'L' + n(wx + 58) + ' ' + n(wy - 62) + '" stroke="#5AB9EA" stroke-width="8" stroke-linecap="round"/><path d="M' + n(wx - 20) + ' ' + n(wy - 44) + 'Q' + n(wx) + ' ' + n(wy - 76) + ' ' + n(wx + 20) + ' ' + n(wy - 44) + '" stroke="#4A9FD0" stroke-width="5" fill="none"/>';
      // Schmetterlinge
      var bcol = [['#FFB3C6', '#FFD24A'], ['#B89CFF', '#7FD3F5'], ['#FFC93C', '#FF9A5A'], ['#9EE6C8', '#FF9EC4']];
      var nb = c.portrait ? 2 : r.int(3, 4);
      for (var b = 0; b < nb; b++) {
        var bc = bcol[b % bcol.length];
        c.layer(W * r.range(0.05, 0.9), H * r.range(0.15, 0.5), 60, 50, B.butterfly(bc[0], bc[1]), 'sc-anim sc-flutter', '--dur:' + r.int(14, 22) + 's;--dx:' + r.int(-160, 160) + 'px;--dy:' + r.int(-70, 70) + 'px;animation-delay:-' + r.int(0, 10) + 's');
      }
      // große Blumen am Rand wiegen sich
      var fk = c.m / 600;
      [[0.02, 0.99], [0.06, 1.0], [0.95, 1.0], [0.985, 0.98]].forEach(function (fp, i) {
        var fw2 = 60 * fk, fh2 = 110 * fk;
        var col = v.flowers[i % v.flowers.length];
        var inner = i % 2 ? B.tulip(fw2 / 2, fh2, fk * 1.7, col) : B.daisy(fw2 / 2, fh2, fk * 1.9, col);
        c.layer(W * fp[0] - fw2 / 2, H * fp[1] - fh2, fw2, fh2, inner, 'sc-anim sc-sway', '--dur:' + (2.6 + i * 0.4).toFixed(1) + 's;--a:' + (i % 2 ? -5 : 5) + 'deg;transform-origin:50% 100%;animation-delay:-' + i + 's');
      });
      // selten eine Biene
      var bee = '<g class="sc-beebody"><ellipse cx="22" cy="16" rx="12" ry="9" fill="#FFD24A" ' + SO + '/><path d="M18 8V24M25 8V24" stroke="#4B3A5A" stroke-width="3.5" opacity="0.8"/><circle cx="33" cy="15" r="5" fill="#4B3A5A"/><circle cx="34.5" cy="13.5" r="1.4" fill="#FFFFFF"/>' +
        '<g class="bf-wings"><ellipse cx="20" cy="5" rx="7" ry="5" fill="#E8F6FF" opacity="0.9" ' + SO + '/><ellipse cx="27" cy="4" rx="6" ry="4.5" fill="#E8F6FF" opacity="0.9" ' + SO + '/></g></g>';
      c.layer(-60, H * 0.3, 44, 30, bee, 'sc-anim sc-bee', '--dur:26s;--dx:' + n(W + 120) + 'px');
      c.ambience = ['birds', 'bee'];
      c.fx = v.time === 'morning' ? { kind: 'petals' } : null;
      return s;
    },
  };

  /* ---------- 3. Sternennacht ---------- */
  WORLDS.night = {
    name: 'Sternennacht',
    hider: 'basket',
    variants: function (r) {
      return {
        moon: r.pick(['full', 'half', 'crescent']),
        sky: r.pick([['#1E2A5E', '#4B3A8C', '#3FA9B5'], ['#23265E', '#5B3B8F', '#4F8FC0'], ['#1B3159', '#3E4A99', '#43B7A8']]),
        aurora: r.chance(0.2),
        hiderVariant: r.pick(['navy', 'lilac', 'teal']),
      };
    },
    music: { key: 'G', bpm: 70, inst: 'celesta', prog: 'I-IV-I-V', meter: 3, pad: true },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', [['0', v.sky[0]], ['0.6', v.sky[1]], ['1', v.sky[2]]]) + '"/>';
      var horizon = H * (c.portrait ? 0.56 : 0.6);
      // Polarlicht (selten)
      if (v.aurora) {
        c.layer(0, H * 0.08, W, H * 0.3, '<path d="M0 ' + n(H * 0.18) + 'C' + n(W * 0.2) + ' ' + n(H * 0.02) + ' ' + n(W * 0.4) + ' ' + n(H * 0.26) + ' ' + n(W * 0.6) + ' ' + n(H * 0.1) + 'S' + n(W * 0.9) + ' ' + n(H * 0.16) + ' ' + n(W) + ' ' + n(H * 0.06) + 'V' + n(H * 0.2) + 'C' + n(W * 0.8) + ' ' + n(H * 0.28) + ' ' + n(W * 0.6) + ' ' + n(H * 0.22) + ' ' + n(W * 0.45) + ' ' + n(H * 0.3) + 'S' + n(W * 0.1) + ' ' + n(H * 0.24) + ' 0 ' + n(H * 0.3) + 'Z" fill="#7CF0C0" opacity="0.28"/>', 'sc-anim sc-glowpulse', '--dur:9s');
      }
      // funkelnde Sterne in drei Gruppen
      for (var gi = 0; gi < 3; gi++) {
        var st = '';
        for (var i = 0; i < (c.portrait ? 14 : 22); i++) {
          var x = r.range(0, W), y = r.range(0, horizon * 0.95);
          st += r.chance(0.3) ? B.star(x, y, r.range(3, 6), '#FFF3C4', r.range(0, 1)) : '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r.range(1, 2.4)) + '" fill="#FFFFFF"/>';
        }
        c.layer(0, 0, W, horizon, st, 'sc-anim sc-twinkle', '--dur:' + (3 + gi * 1.3).toFixed(1) + 's;animation-delay:-' + gi + 's');
      }
      // Mond mit Schein
      var mr = Math.max(34, c.m * 0.055);
      var mx = W * 0.8, my = H * 0.2;
      s += '<circle cx="' + n(mx) + '" cy="' + n(my) + '" r="' + n(mr * 3) + '" fill="' + c.rad('moonglow', [['0', '#FFF6D0', 0.45], ['1', '#FFF6D0', 0]]) + '"/>';
      if (v.moon === 'full') {
        s += '<circle cx="' + n(mx) + '" cy="' + n(my) + '" r="' + n(mr) + '" fill="#FFF3C4" ' + SO + '/>';
        s += '<circle cx="' + n(mx - mr * 0.3) + '" cy="' + n(my - mr * 0.2) + '" r="' + n(mr * 0.18) + '" fill="#F2E3A6"/><circle cx="' + n(mx + mr * 0.3) + '" cy="' + n(my + mr * 0.3) + '" r="' + n(mr * 0.12) + '" fill="#F2E3A6"/>';
      } else if (v.moon === 'half') {
        s += '<path d="M' + n(mx) + ' ' + n(my - mr) + 'A' + n(mr) + ' ' + n(mr) + ' 0 0 1 ' + n(mx) + ' ' + n(my + mr) + 'Q' + n(mx + mr * 0.12) + ' ' + n(my) + ' ' + n(mx) + ' ' + n(my - mr) + 'Z" fill="#FFF3C4" ' + SO + '/>';
      } else {
        // Sichel: äußerer Bogen und innerer, flacherer Bogen
        s += '<path d="M' + n(mx - mr * 0.2) + ' ' + n(my - mr * 0.98) + 'A' + n(mr) + ' ' + n(mr) + ' 0 1 1 ' + n(mx - mr * 0.2) + ' ' + n(my + mr * 0.98) + 'A' + n(mr * 0.8) + ' ' + n(mr * 0.8) + ' 0 1 0 ' + n(mx - mr * 0.2) + ' ' + n(my - mr * 0.98) + 'Z" fill="#FFF3C4" ' + SO + '/>';
        s += '<circle cx="' + n(mx + mr * 0.45) + '" cy="' + n(my - mr * 0.1) + '" r="' + n(mr * 0.07) + '" fill="#4B3A5A"/><path d="M' + n(mx + mr * 0.3) + ' ' + n(my + mr * 0.25) + 'q' + n(mr * 0.1) + ' ' + n(mr * 0.1) + ' ' + n(mr * 0.2) + ' 0" stroke="#4B3A5A" stroke-width="2" fill="none" stroke-linecap="round"/>';
      }
      // Sternschnuppe (gelegentlich)
      c.layer(W * 0.15, H * 0.06, 160, 60, '<path d="M4 4L150 52" stroke="url(#' + c.id('shoot') + ')" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="52" r="4" fill="#FFFFFF"/>', 'sc-anim sc-shoot', '--dur:13s');
      c.defs += '<linearGradient id="' + c.id('shoot') + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>';
      // Hügel, Häuschen mit warmen Fenstern, Tannen
      s += B.hills(c, horizon, H * 0.05, '#2F3F78', 0, 3);
      var hx = W * (c.portrait ? 0.2 : 0.14), hy = horizon + 6;
      var hk = c.m / 520;
      function hp(dx, dy) { return n(hx + dx * hk) + ' ' + n(hy + dy * hk); }
      s += '<path d="M' + hp(-60, 0) + 'L' + hp(-60, -70) + 'L' + hp(60, -70) + 'L' + hp(60, 0) + 'Z" fill="#6E5A9E" ' + SO + '/>' +
        '<path d="M' + hp(-74, -66) + 'L' + hp(0, -128) + 'L' + hp(74, -66) + 'Z" fill="#8E4F7A" ' + SO + '/>' +
        '<rect x="' + hp(30, -118).split(' ')[0] + '" y="' + hp(30, -118).split(' ')[1] + '" width="' + n(16 * hk) + '" height="' + n(30 * hk) + '" fill="#6E5A9E"/>' +
        '<circle cx="' + hp(-28, -40).split(' ')[0] + '" cy="' + hp(-28, -40).split(' ')[1] + '" r="' + n(40 * hk) + '" fill="' + c.rad('winglow', [['0', '#FFD86B', 0.6], ['1', '#FFD86B', 0]]) + '"/>' +
        '<rect x="' + hp(-40, -52).split(' ')[0] + '" y="' + hp(-40, -52).split(' ')[1] + '" width="' + n(24 * hk) + '" height="' + n(22 * hk) + '" rx="3" fill="#FFD86B" ' + SO + '/>' +
        '<rect x="' + hp(14, -52).split(' ')[0] + '" y="' + hp(14, -52).split(' ')[1] + '" width="' + n(24 * hk) + '" height="' + n(22 * hk) + '" rx="3" fill="#FFD86B" ' + SO + '/>' +
        '<path d="M' + hp(-28, -52) + 'L' + hp(-28, -30) + 'M' + hp(26, -52) + 'L' + hp(26, -30) + '" stroke="#C9A24A" stroke-width="2"/>';
      [0.03, 0.3, 0.72, 0.9, 0.97].forEach(function (fx0, i) {
        if (c.portrait && (i === 1 || i === 2)) return;
        s += B.fir(W * fx0, horizon + r.range(10, 30), c.m / r.range(380, 520), '#1E3B55');
      });
      s += B.hills(c, horizon + H * 0.1, H * 0.04, '#26335F', 1, 4);
      s += '<rect y="' + n(horizon + H * 0.12) + '" width="' + W + '" height="' + H + '" fill="#232E57"/>';
      // weiches Licht in der Mitte, damit Katzen gut sichtbar sind
      s += '<ellipse cx="' + n(W / 2) + '" cy="' + n(H * 0.62) + '" rx="' + n(W * 0.55) + '" ry="' + n(H * 0.45) + '" fill="' + c.rad('centerglow', [['0', '#8A7FD0', 0.35], ['1', '#8A7FD0', 0]]) + '"/>';
      // Lichterkette oben quer
      var bulbs = '';
      var sag = H * 0.05;
      var ly = H * 0.035;
      bulbs += '<path d="M0 ' + n(ly) + 'Q' + n(W * 0.25) + ' ' + n(ly + sag * 2) + ' ' + n(W * 0.5) + ' ' + n(ly) + 'Q' + n(W * 0.75) + ' ' + n(ly + sag * 2) + ' ' + W + ' ' + n(ly) + '" stroke="#2A2340" stroke-width="2.5" fill="none"/>';
      var bc = ['#FFD24A', '#FF6F91', '#5AB9EA', '#3CCFA0', '#B89CFF'];
      var lights = '';
      for (var li = 0; li < 18; li++) {
        var t = (li + 0.5) / 18;
        var seg = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        var bxx = t * W, byy = ly + sag * 4 * seg * (1 - seg) + 6;
        lights += '<circle cx="' + n(bxx) + '" cy="' + n(byy + 6) + '" r="12" fill="' + bc[li % 5] + '" opacity="0.35"/><ellipse cx="' + n(bxx) + '" cy="' + n(byy + 6) + '" rx="5" ry="7" fill="' + bc[li % 5] + '"/>';
      }
      s += bulbs;
      c.layer(0, 0, W, ly + sag * 2 + 30, lights, 'sc-anim sc-glowpulse', '--dur:3.4s');
      // Vordergrund: leuchtende Pilze, Nachtblumen, Laterne
      var f = '';
      var gk = c.m / 560;
      function glowShroom(x, y, k, col) {
        return '<circle cx="' + n(x) + '" cy="' + n(y - 22 * k) + '" r="' + n(34 * k) + '" fill="' + c.rad('gs' + Math.round(x), [['0', col, 0.5], ['1', col, 0]]) + '"/>' +
          '<path d="M' + n(x - 5 * k) + ' ' + n(y) + 'Q' + n(x - 6 * k) + ' ' + n(y - 14 * k) + ' ' + n(x - 3 * k) + ' ' + n(y - 18 * k) + 'H' + n(x + 3 * k) + 'Q' + n(x + 6 * k) + ' ' + n(y - 14 * k) + ' ' + n(x + 5 * k) + ' ' + n(y) + 'Z" fill="#E8E2F5"/>' +
          '<path d="M' + n(x - 16 * k) + ' ' + n(y - 16 * k) + 'Q' + n(x - 15 * k) + ' ' + n(y - 34 * k) + ' ' + n(x) + ' ' + n(y - 35 * k) + 'Q' + n(x + 15 * k) + ' ' + n(y - 34 * k) + ' ' + n(x + 16 * k) + ' ' + n(y - 16 * k) + 'Z" fill="' + col + '"/>' +
          '<circle cx="' + n(x - 6 * k) + '" cy="' + n(y - 26 * k) + '" r="' + n(2.4 * k) + '" fill="#FFFFFF" opacity="0.8"/><circle cx="' + n(x + 6 * k) + '" cy="' + n(y - 29 * k) + '" r="' + n(1.8 * k) + '" fill="#FFFFFF" opacity="0.8"/>';
      }
      [[0.03, 0.97, 1.3, '#7CF0E0'], [0.08, 0.99, 0.9, '#B89CFF'], [0.95, 0.96, 1.2, '#FF9EC4'], [0.9, 0.99, 0.8, '#7CF0E0'], [0.5, 1.0, 0.8, '#B89CFF']].forEach(function (m) {
        f += glowShroom(W * m[0], H * m[1], gk * m[2] * 1.6, m[3]);
      });
      for (var nf = 0; nf < 10; nf++) {
        var nx = r.pick([r.range(0, 0.14), r.range(0.86, 1)]) * W, ny = H * r.range(0.9, 1);
        f += '<path d="M' + n(nx) + ' ' + n(ny) + 'V' + n(ny - 18 * gk) + '" stroke="#3E7A6A" stroke-width="' + n(2.5 * gk) + '"/>' + B.star(nx, ny - 20 * gk, 6 * gk, r.pick(['#FFF3B0', '#FFD1DF', '#C9F5FF']), r.range(0, 1));
      }
      // Laterne am Pfahl (rechts)
      var lx = W * 0.97, ly = H * 0.62;
      if (!c.portrait) {
        f += '<path d="M' + n(lx) + ' ' + n(H) + 'V' + n(ly) + '" stroke="#2A2340" stroke-width="' + n(7 * gk) + '"/>';
        f += '<circle cx="' + n(lx) + '" cy="' + n(ly + 16 * gk) + '" r="' + n(70 * gk) + '" fill="' + c.rad('lantern', [['0', '#FFD86B', 0.55], ['1', '#FFD86B', 0]]) + '"/>';
        f += '<path d="M' + n(lx - 14 * gk) + ' ' + n(ly) + 'H' + n(lx + 14 * gk) + 'L' + n(lx + 11 * gk) + ' ' + n(ly + 30 * gk) + 'H' + n(lx - 11 * gk) + 'Z" fill="#FFE08A" stroke="#2A2340" stroke-width="' + n(3 * gk) + '"/><path d="M' + n(lx - 18 * gk) + ' ' + n(ly) + 'L' + n(lx) + ' ' + n(ly - 14 * gk) + 'L' + n(lx + 18 * gk) + ' ' + n(ly) + 'Z" fill="#2A2340"/>';
      }
      c.fg += f;
      c.fx = { kind: 'fireflies' };
      c.ambience = ['crickets', 'owl'];
      c.stageClass = 'is-night';
      return s;
    },
  };

  /* ---------- 4. Winterwunderland ---------- */
  WORLDS.winter = {
    name: 'Winterwunderland',
    hider: 'gift',
    variants: function (r) {
      return { evening: r.chance(0.4), hiderVariant: r.pick(['redgold', 'bluesilver', 'greenred']) };
    },
    music: { key: 'D', bpm: 92, inst: 'glock', prog: 'I-vi-ii-V', bells: true },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var sky = v.evening ? [['0', '#1F2B63'], ['0.7', '#4A4F9C'], ['1', '#8F86C9']] : [['0', '#9CD3F5'], ['1', '#E4F4FF']];
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', sky) + '"/>';
      var horizon = H * (c.portrait ? 0.54 : 0.58);
      if (v.evening) {
        c.layer(0, H * 0.04, W, H * 0.34, '<path d="M0 ' + n(H * 0.2) + 'C' + n(W * 0.25) + ' ' + n(H * 0.04) + ' ' + n(W * 0.5) + ' ' + n(H * 0.26) + ' ' + n(W * 0.75) + ' ' + n(H * 0.08) + 'S' + n(W) + ' ' + n(H * 0.1) + ' ' + n(W) + ' ' + n(H * 0.1) + 'V' + n(H * 0.22) + 'C' + n(W * 0.7) + ' ' + n(H * 0.3) + ' ' + n(W * 0.5) + ' ' + n(H * 0.24) + ' ' + n(W * 0.3) + ' ' + n(H * 0.32) + 'S0 ' + n(H * 0.3) + ' 0 ' + n(H * 0.3) + 'Z" fill="' + c.lin('aur', [['0', '#7CF0C0', 0.45], ['0.5', '#B89CFF', 0.35], ['1', '#FF9EC4', 0.3]], 0, 0, 1, 0) + '"/>', 'sc-anim sc-glowpulse', '--dur:10s');
        for (var i = 0; i < 30; i++) s += '<circle cx="' + n(r.range(0, W)) + '" cy="' + n(r.range(0, horizon * 0.8)) + '" r="' + n(r.range(1, 2.2)) + '" fill="#FFFFFF" opacity="0.8"/>';
      } else {
        for (var k = 0; k < 2; k++) {
          var cw = c.m * r.range(0.24, 0.32);
          c.layer(W * (0.25 + k * 0.4), H * r.range(0.05, 0.16), cw, cw * 0.5, B.cloud(cw / 2, cw * 0.48, cw / 190, '#FFFFFF', '#E6F0FA'), 'sc-anim sc-drift', '--dur:' + r.int(30, 46) + 's;--dx:' + r.int(40, 80) + 'px');
        }
      }
      // Schneehügel
      s += B.hills(c, horizon, H * 0.06, v.evening ? '#C9D3F0' : '#EEF5FD', 0, 3);
      [0.04, 0.18, 0.8, 0.95].forEach(function (x0) {
        s += B.fir(W * x0, horizon + r.range(6, 26), c.m / r.range(360, 480), v.evening ? '#2E6B6A' : '#3E8E7E', true);
      });
      s += B.hills(c, horizon + H * 0.08, H * 0.05, v.evening ? '#DDE4F7' : '#F7FBFF', 1, 4);
      s += '<rect y="' + n(horizon + H * 0.1) + '" width="' + W + '" height="' + H + '" fill="' + (v.evening ? '#E3E8F8' : '#FBFDFF') + '"/>';
      for (var sh = 0; sh < 8; sh++) s += '<ellipse cx="' + n(r.range(0, W)) + '" cy="' + n(r.range(horizon + H * 0.15, H)) + '" rx="' + n(r.range(60, 160)) + '" ry="' + n(r.range(8, 16)) + '" fill="#CFE0F5" opacity="0.5"/>';
      // Holzhütte mit Rauch und Eiszapfen (rechts)
      var hx = W * (c.portrait ? 0.8 : 0.86), hy = horizon + H * 0.06, hk = c.m / 560;
      function hp(dx, dy) { return n(hx + dx * hk) + ' ' + n(hy + dy * hk); }
      s += '<rect x="' + n(hx - 70 * hk) + '" y="' + n(hy - 80 * hk) + '" width="' + n(140 * hk) + '" height="' + n(80 * hk) + '" fill="#B7794A" ' + SO + '/>';
      for (var lg = 1; lg < 5; lg++) s += '<path d="M' + hp(-70, -lg * 16) + 'H' + hp(70, -lg * 16).split(' ')[0] + '" stroke="#8E5A33" stroke-width="2.5"/>';
      s += '<rect x="' + n(hx + 30 * hk) + '" y="' + n(hy - 150 * hk) + '" width="' + n(18 * hk) + '" height="' + n(40 * hk) + '" fill="#9A6A48" ' + SO + '/>';
      s += '<path d="M' + hp(-86, -76) + 'L' + hp(0, -140) + 'L' + hp(86, -76) + 'Z" fill="#FFFFFF" ' + SO + '/>';
      for (var ic = -70; ic <= 70; ic += 14) s += '<path d="M' + hp(ic, -76) + 'L' + hp(ic + 3, -62 + (ic % 28 === 0 ? 4 : 0)) + 'L' + hp(ic + 6, -76) + 'Z" fill="#DDF1FF"/>';
      s += '<rect x="' + n(hx - 16 * hk) + '" y="' + n(hy - 46 * hk) + '" width="' + n(32 * hk) + '" height="' + n(46 * hk) + '" rx="4" fill="#7A4A2C"/><rect x="' + n(hx - 58 * hk) + '" y="' + n(hy - 58 * hk) + '" width="' + n(28 * hk) + '" height="' + n(24 * hk) + '" rx="3" fill="#FFD86B" ' + SO + '/>';
      c.layer(hx + 24 * hk, hy - 230 * hk, 60 * hk, 90 * hk, '<circle cx="' + n(30 * hk) + '" cy="' + n(70 * hk) + '" r="' + n(10 * hk) + '" fill="#FFFFFF" opacity="0.8"/>', 'sc-anim sc-smoke', '--dur:4s');
      c.layer(hx + 24 * hk, hy - 230 * hk, 60 * hk, 90 * hk, '<circle cx="' + n(30 * hk) + '" cy="' + n(70 * hk) + '" r="' + n(12 * hk) + '" fill="#FFFFFF" opacity="0.8"/>', 'sc-anim sc-smoke', '--dur:4s;animation-delay:-2s');
      // Schneemann (links)
      var sx = W * (c.portrait ? 0.12 : 0.1), sy = horizon + H * 0.14, sk = c.m / 520;
      function sp(dx, dy) { return n(sx + dx * sk) + ' ' + n(sy + dy * sk); }
      s += '<ellipse cx="' + n(sx) + '" cy="' + n(sy) + '" rx="' + n(54 * sk) + '" ry="' + n(8 * sk) + '" fill="#CFE0F5"/>';
      s += '<circle cx="' + n(sx) + '" cy="' + n(sy - 40 * sk) + '" r="' + n(44 * sk) + '" fill="#FFFFFF" ' + SO + '/><circle cx="' + n(sx) + '" cy="' + n(sy - 104 * sk) + '" r="' + n(32 * sk) + '" fill="#FFFFFF" ' + SO + '/><circle cx="' + n(sx) + '" cy="' + n(sy - 152 * sk) + '" r="' + n(24 * sk) + '" fill="#FFFFFF" ' + SO + '/>';
      s += '<circle cx="' + n(sx - 8 * sk) + '" cy="' + n(sy - 156 * sk) + '" r="' + n(3 * sk) + '" fill="#4B3A5A"/><circle cx="' + n(sx + 8 * sk) + '" cy="' + n(sy - 156 * sk) + '" r="' + n(3 * sk) + '" fill="#4B3A5A"/>';
      s += '<path d="M' + sp(0, -150) + 'L' + sp(22, -146) + 'L' + sp(0, -144) + 'Z" fill="#FF8A3D"/><path d="M' + sp(-7, -140) + 'Q' + sp(0, -135) + ' ' + sp(7, -140) + '" stroke="#4B3A5A" stroke-width="' + n(2 * sk) + '" fill="none" stroke-linecap="round"/>';
      s += '<ellipse cx="' + n(sx - 14 * sk) + '" cy="' + n(sy - 148 * sk) + '" rx="' + n(5 * sk) + '" ry="' + n(3 * sk) + '" fill="#FFB3C6"/><ellipse cx="' + n(sx + 14 * sk) + '" cy="' + n(sy - 148 * sk) + '" rx="' + n(5 * sk) + '" ry="' + n(3 * sk) + '" fill="#FFB3C6"/>';
      s += '<path d="M' + sp(-26, -128) + 'Q' + sp(0, -118) + ' ' + sp(26, -128) + 'L' + sp(26, -120) + 'Q' + sp(0, -110) + ' ' + sp(-26, -120) + 'Z" fill="#E8434F" ' + SO + '/><path d="M' + sp(14, -122) + 'L' + sp(20, -94) + 'L' + sp(30, -96) + 'L' + sp(24, -124) + 'Z" fill="#E8434F" ' + SO + '/>';
      s += '<path d="M' + sp(-30, -104) + 'L' + sp(-64, -128) + 'M' + sp(-54, -121) + 'L' + sp(-60, -136) + 'M' + sp(30, -104) + 'L' + sp(64, -126) + '" stroke="#8A5A3B" stroke-width="' + n(4 * sk) + '" stroke-linecap="round"/>';
      s += '<circle cx="' + n(sx) + '" cy="' + n(sy - 96 * sk) + '" r="' + n(3.5 * sk) + '" fill="#4B3A5A"/><circle cx="' + n(sx) + '" cy="' + n(sy - 82 * sk) + '" r="' + n(3.5 * sk) + '" fill="#4B3A5A"/>';
      // Schlitten
      if (!c.portrait) {
        var lx = W * 0.2, ly = H * 0.95;
        s += '<path d="M' + n(lx - 60) + ' ' + n(ly) + 'H' + n(lx + 50) + 'Q' + n(lx + 74) + ' ' + n(ly) + ' ' + n(lx + 70) + ' ' + n(ly - 18) + '" stroke="#8A5A3B" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="' + n(lx - 56) + '" y="' + n(ly - 30) + '" width="104" height="16" rx="6" fill="#E8434F" ' + SO + '/><path d="M' + n(lx - 40) + ' ' + n(ly - 14) + 'V' + n(ly) + 'M' + n(lx + 30) + ' ' + n(ly - 14) + 'V' + n(ly) + '" stroke="#8A5A3B" stroke-width="5"/>';
      }
      c.fx = { kind: 'snow' };
      c.ambience = ['wind', 'sleigh'];
      if (v.evening) c.stageClass = 'is-night';
      return s;
    },
  };

  /* ---------- 5. Sonnenstrand ---------- */
  WORLDS.beach = {
    name: 'Sonnenstrand',
    hider: 'shell',
    variants: function (r) {
      return { sunset: r.chance(0.35), umbrella: r.pick([['#FF6F91', '#FFFFFF'], ['#5AB9EA', '#FFFFFF'], ['#FFC93C', '#FF8A5B']]), hiderVariant: r.pick(['peach', 'rose', 'lilac']) };
    },
    music: { key: 'A', bpm: 96, inst: 'ukulele', prog: 'I-IV-I-V', swing: 0.18, marimba: true },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var sky = v.sunset ? [['0', '#7F6BC4'], ['0.45', '#FF9EB0'], ['1', '#FFD08A']] : [['0', '#6EC6F2'], ['1', '#D4F1FF']];
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', sky) + '"/>';
      var sea = H * (c.portrait ? 0.4 : 0.42), sand = H * (c.portrait ? 0.56 : 0.6);
      // Sonne
      var sr = Math.max(40, c.m * 0.065);
      var sx = W * 0.72, sy = v.sunset ? sea - sr * 0.3 : H * 0.16;
      s += '<circle cx="' + n(sx) + '" cy="' + n(sy) + '" r="' + n(sr * 2.2) + '" fill="' + c.rad('sun', [['0', v.sunset ? '#FFE0A8' : '#FFF6C4', 0.8], ['1', '#FFF6C4', 0]]) + '"/>';
      s += '<circle cx="' + n(sx) + '" cy="' + n(sy) + '" r="' + n(sr) + '" fill="' + (v.sunset ? '#FF9A5A' : '#FFD84A') + '"/>';
      // Möwen und Segelboot
      c.layer(W * 0.2, H * 0.1, 140, 60, '<path d="M10 30Q24 16 36 30Q48 16 62 30" stroke="#4B3A5A" stroke-opacity="0.6" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M80 18Q90 8 98 18Q106 8 116 18" stroke="#4B3A5A" stroke-opacity="0.5" stroke-width="3" fill="none" stroke-linecap="round"/>', 'sc-anim sc-drift', '--dur:16s;--dx:120px');
      // Meer (hinter Wellen)
      s += '<rect y="' + n(sea) + '" width="' + W + '" height="' + n(sand - sea + 30) + '" fill="' + c.lin('sea', v.sunset ? ['#6E8FD6', '#4FB3C8'] : ['#3FA9E0', '#5FD0D6']) + '"/>';
      c.layer(W * 0.58, sea - 46, 60, 60, '<path d="M30 6V44" stroke="#8A6A55" stroke-width="2.5"/><path d="M31 8L52 40H31Z" fill="#FFFFFF" ' + SO + '/><path d="M29 14L12 40H29Z" fill="#FFD1DF" ' + SO + '/><path d="M8 44H54L48 54H14Z" fill="#E8574A" ' + SO + '/>', 'sc-anim sc-drift', '--dur:40s;--dx:-160px');
      // Glitzern auf dem Wasser
      var gl = '';
      for (var i = 0; i < 16; i++) gl += '<path d="M' + n(r.range(0, W)) + ' ' + n(r.range(6, sand - sea - 30)) + 'h' + n(r.range(10, 26)) + '" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>';
      c.layer(0, sea, W, sand - sea, gl, 'sc-anim sc-twinkle', '--dur:2.6s');
      // drei Wellenschichten
      var waveCols = v.sunset ? ['#7FA3E0', '#8FC7E6', '#B6E4EE'] : ['#5CC2EA', '#86DDEB', '#BDEFF2'];
      [0, 1, 2].forEach(function (i) {
        var wy = sea + (sand - sea) * (0.25 + i * 0.25);
        var per = 120 + i * 20, amp = 6 + i * 2;
        var d = 'M0 ' + amp;
        for (var x = 0; x <= W + per * 2; x += per) d += 'Q' + n(x + per / 4) + ' 0 ' + n(x + per / 2) + ' ' + amp + 'T' + n(x + per) + ' ' + amp;
        d += 'V60H0Z';
        c.layer(-per, wy - amp, W + per * 2, 60, '<path d="' + d + '" fill="' + waveCols[i] + '"/>', 'sc-anim sc-wave', '--dur:' + (7 + i * 2) + 's;--dx:' + per + 'px' + (i % 2 ? ';animation-direction:reverse' : ''));
      });
      // Sand
      s += '<path d="M0 ' + n(sand) + 'Q' + n(W * 0.3) + ' ' + n(sand - 18) + ' ' + n(W * 0.6) + ' ' + n(sand + 4) + 'T' + W + ' ' + n(sand - 6) + 'V' + H + 'H0Z" fill="' + c.lin('sand', ['#FBE3B2', '#F3CF8F']) + '"/>';
      c.layerSandTop = sand;
      for (var d2 = 0; d2 < 40; d2++) s += '<circle cx="' + n(r.range(0, W)) + '" cy="' + n(r.range(sand + 10, H)) + '" r="' + n(r.range(1.2, 2.6)) + '" fill="#E3B877" opacity="0.6"/>';
      var f = '';
      // Palme (links)
      var px = W * 0.05, pb = H * 0.9, pk = c.m / 480;
      function pp(dx, dy) { return n(px + dx * pk) + ' ' + n(pb + dy * pk); }
      f += '<path d="M' + pp(-10, 0) + 'C' + pp(-6, -100) + ' ' + pp(20, -200) + ' ' + pp(50, -260) + 'L' + pp(64, -254) + 'C' + pp(36, -196) + ' ' + pp(12, -100) + ' ' + pp(12, 0) + 'Z" fill="#C98F57" ' + SO + '/>';
      for (var sgm = 1; sgm < 8; sgm++) f += '<path d="M' + pp(-8 + sgm * 7, -sgm * 33) + 'L' + pp(12 + sgm * 7, -sgm * 33 + 4) + '" stroke="#A8743F" stroke-width="' + n(3 * pk) + '"/>';
      [[-110, -40], [-60, -110], [40, -120], [110, -60], [120, 10], [-100, 20]].forEach(function (fr) {
        f += '<path d="M' + pp(56, -258) + 'Q' + pp(56 + fr[0] * 0.5, -258 + fr[1] - 40) + ' ' + pp(56 + fr[0], -258 + fr[1] + 40) + 'Q' + pp(56 + fr[0] * 0.45, -258 + fr[1] * 0.4) + ' ' + pp(56, -258) + 'Z" fill="#5DBB63" ' + SO + '/>';
      });
      f += '<circle cx="' + pp(48, -244).split(' ')[0] + '" cy="' + pp(48, -244).split(' ')[1] + '" r="' + n(10 * pk) + '" fill="#8A5A3B"/><circle cx="' + pp(64, -240).split(' ')[0] + '" cy="' + pp(64, -240).split(' ')[1] + '" r="' + n(10 * pk) + '" fill="#8A5A3B"/>';
      // Sonnenschirm (rechts)
      var ux = W * 0.93, uy = H * 0.97, uk = c.m / 520;
      f += '<path d="M' + n(ux) + ' ' + n(uy) + 'L' + n(ux - 30 * uk) + ' ' + n(uy - 200 * uk) + '" stroke="#FFFFFF" stroke-width="' + n(6 * uk) + '" stroke-linecap="round"/>';
      var cx0 = ux - 30 * uk, cy0 = uy - 200 * uk;
      var umb = '';
      for (var us = 0; us < 6; us++) {
        var a0 = Math.PI + (us / 6) * Math.PI, a1 = Math.PI + ((us + 1) / 6) * Math.PI;
        umb += '<path d="M' + n(cx0) + ' ' + n(cy0 - 30 * uk) + 'L' + n(cx0 + Math.cos(a0) * 110 * uk) + ' ' + n(cy0 + 10 * uk + Math.sin(a0) * 20 * uk) + 'Q' + n(cx0 + Math.cos((a0 + a1) / 2) * 100 * uk) + ' ' + n(cy0 + 22 * uk) + ' ' + n(cx0 + Math.cos(a1) * 110 * uk) + ' ' + n(cy0 + 10 * uk + Math.sin(a1) * 20 * uk) + 'Z" fill="' + v.umbrella[us % 2] + '" ' + SO + '/>';
      }
      f += umb + '<circle cx="' + n(cx0) + '" cy="' + n(cy0 - 32 * uk) + '" r="' + n(6 * uk) + '" fill="' + v.umbrella[0] + '" ' + SO + '/>';
      // Sandburg mit Zinnen, Tor und Fähnchen
      var bx = W * (c.portrait ? 0.8 : 0.84), by = H * 0.8, bk = c.m / 520;
      if (!c.portrait || W > 700) {
        var sandA = '#F3CF8F', sandB = '#E9BD76';
        var tower = function (x0, w0, h0) {
          var t = '<rect x="' + n(bx + x0 * bk) + '" y="' + n(by - h0 * bk) + '" width="' + n(w0 * bk) + '" height="' + n(h0 * bk) + '" fill="' + sandA + '" ' + SO + '/>';
          for (var z = 0; z < 3; z++) t += '<rect x="' + n(bx + (x0 + z * w0 / 3 + w0 / 12) * bk) + '" y="' + n(by - (h0 + 8) * bk) + '" width="' + n(w0 / 6 * bk) + '" height="' + n(10 * bk) + '" fill="' + sandA + '" ' + SO + '/>';
          return t + '<path d="M' + n(bx + (x0 + 6) * bk) + ' ' + n(by - h0 * bk * 0.55) + 'h' + n((w0 - 12) * bk) + '" stroke="' + sandB + '" stroke-width="' + n(3 * bk) + '"/>';
        };
        f += '<ellipse cx="' + n(bx) + '" cy="' + n(by + 2) + '" rx="' + n(92 * bk) + '" ry="' + n(10 * bk) + '" fill="' + sandB + '" opacity="0.7"/>';
        f += tower(-80, 40, 78) + tower(40, 40, 78) + '<rect x="' + n(bx - 44 * bk) + '" y="' + n(by - 52 * bk) + '" width="' + n(88 * bk) + '" height="' + n(52 * bk) + '" fill="' + sandA + '" ' + SO + '/>';
        f += tower(-24, 48, 104);
        f += '<path d="M' + n(bx - 12 * bk) + ' ' + n(by) + 'V' + n(by - 20 * bk) + 'Q' + n(bx) + ' ' + n(by - 34 * bk) + ' ' + n(bx + 12 * bk) + ' ' + n(by - 20 * bk) + 'V' + n(by) + 'Z" fill="#C99A5B"/>';
        f += '<circle cx="' + n(bx - 60 * bk) + '" cy="' + n(by - 56 * bk) + '" r="' + n(5 * bk) + '" fill="#C99A5B"/><circle cx="' + n(bx + 60 * bk) + '" cy="' + n(by - 56 * bk) + '" r="' + n(5 * bk) + '" fill="#C99A5B"/>';
        f += '<path d="M' + n(bx) + ' ' + n(by - 112 * bk) + 'V' + n(by - 150 * bk) + '" stroke="#8A6A55" stroke-width="' + n(2.5 * bk) + '"/><path d="M' + n(bx) + ' ' + n(by - 150 * bk) + 'L' + n(bx + 26 * bk) + ' ' + n(by - 142 * bk) + 'L' + n(bx) + ' ' + n(by - 134 * bk) + 'Z" fill="#FF6F91" ' + SO + '/>';
        f += B.star(bx - 70 * bk, by - 30 * bk, 7 * bk, '#FF9A5A', 0.3);
      }
      // Seesterne und Muscheln
      for (var ss = 0; ss < 5; ss++) {
        var xx = r.pick([r.range(0.02, 0.14), r.range(0.86, 0.98), r.range(0.2, 0.8)]) * W, yy = r.range(0.84, 0.97) * H;
        var sk2 = c.m / 700;
        f += r.chance(0.5) ? '<path d="' + KS.CatArt.starPath(xx, yy, r.range(14, 20) * sk2, 0.5, r.range(0, 1)) + '" fill="' + r.pick(['#FF8A5B', '#FF6F91', '#FFB347']) + '" ' + SO + '/>' :
          '<path d="M' + n(xx - 14 * sk2) + ' ' + n(yy) + 'Q' + n(xx) + ' ' + n(yy - 26 * sk2) + ' ' + n(xx + 14 * sk2) + ' ' + n(yy) + 'Z" fill="#FFD1DF" ' + SO + '/><path d="M' + n(xx) + ' ' + n(yy) + 'L' + n(xx) + ' ' + n(yy - 16 * sk2) + 'M' + n(xx) + ' ' + n(yy) + 'L' + n(xx - 7 * sk2) + ' ' + n(yy - 12 * sk2) + 'M' + n(xx) + ' ' + n(yy) + 'L' + n(xx + 7 * sk2) + ' ' + n(yy - 12 * sk2) + '" stroke="#F29AB8" stroke-width="2"/>';
      }
      c.fg += f;
      // Krabbe läuft gelegentlich seitlich vorbei
      c.layer(-80, H - 70, 70, 50, '<g class="sc-crabbody"><ellipse cx="35" cy="30" rx="20" ry="13" fill="#FF6F61" ' + SO + '/><path d="M18 24Q6 14 10 6Q18 8 18 18M52 24Q64 14 60 6Q52 8 52 18" fill="#FF6F61" ' + SO + '/><path d="M28 18V10M42 18V10" stroke="#4B3A5A" stroke-width="2"/><circle cx="28" cy="9" r="3.5" fill="#FFFFFF" stroke="#4B3A5A" stroke-width="1.5"/><circle cx="42" cy="9" r="3.5" fill="#FFFFFF" stroke="#4B3A5A" stroke-width="1.5"/><circle cx="28" cy="9.5" r="1.5" fill="#4B3A5A"/><circle cx="42" cy="9.5" r="1.5" fill="#4B3A5A"/><path d="M20 38L14 46M26 41L22 48M44 41L48 48M50 38L56 46" stroke="#E0503F" stroke-width="3" stroke-linecap="round"/></g>', 'sc-anim sc-crab', '--dur:24s;--dx:' + n(W + 160) + 'px');
      c.ambience = ['sea', 'gull'];
      return s;
    },
  };

  /* ---------- 6. Herbstwald ---------- */
  WORLDS.autumn = {
    name: 'Herbstwald',
    hider: 'pumpkin',
    variants: function (r) {
      return { fog: r.chance(0.35), leaves: r.pick([['#F28C28', '#E8574A', '#F6C445'], ['#E86A3A', '#F6B03C', '#C9502F'], ['#F6C445', '#F28C28', '#D9772B']]), hiderVariant: r.pick(['orange', 'golden', 'coral']) };
    },
    music: { key: 'Eb', bpm: 84, inst: 'musicbox', prog: 'I-iii-vi-IV', pad: true },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var sky = v.fog ? [['0', '#F3E6D6'], ['1', '#FBF3E8']] : [['0', '#FFD58A'], ['0.6', '#FFE9B8'], ['1', '#FFF4D8']];
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', sky) + '"/>';
      var horizon = H * (c.portrait ? 0.54 : 0.58);
      if (!v.fog) s += '<circle cx="' + n(W * 0.7) + '" cy="' + n(H * 0.18) + '" r="' + n(c.m * 0.12) + '" fill="' + c.rad('sun', [['0', '#FFF3C4', 0.9], ['1', '#FFF3C4', 0]]) + '"/>';
      s += B.hills(c, horizon, H * 0.05, v.fog ? '#E7D2B8' : '#E9B97A', 0, 3);
      // Laubbäume hinten
      var pos = c.portrait ? [0.08, 0.92] : [0.04, 0.22, 0.4, 0.62, 0.8, 0.97];
      pos.forEach(function (x0, i) {
        var k = c.m / r.range(300, 420) * (i === 0 || i === pos.length - 1 ? 1.1 : 0.75);
        s += B.tree(W * x0, horizon + r.range(0, 20), k, v.leaves[i % 3], U.darken(v.leaves[i % 3], 0.2), '#8A5A3B');
      });
      if (v.fog) s += '<rect width="' + W + '" height="' + n(horizon + 40) + '" fill="#FFFFFF" opacity="0.35"/>';
      s += B.hills(c, horizon + H * 0.07, H * 0.04, v.fog ? '#D9BE98' : '#D9A460', 1, 4);
      s += '<rect y="' + n(horizon + H * 0.09) + '" width="' + W + '" height="' + H + '" fill="' + c.lin('ground', ['#D39A5A', '#C28650']) + '"/>';
      // Eichhörnchen auf einem Ast (schaut hervor)
      var tx = W * (c.portrait ? 0.9 : 0.95), ty = H * 0.3;
      s += '<path d="M' + n(W + 10) + ' ' + n(ty + 30) + 'Q' + n(tx - 20) + ' ' + n(ty + 30) + ' ' + n(tx - 90) + ' ' + n(ty + 10) + '" stroke="#8A5A3B" stroke-width="14" stroke-linecap="round" fill="none"/>';
      c.layer(tx - 80, ty - 44, 70, 60, '<path d="M50 50C68 44 72 16 56 8C46 4 40 14 46 24C52 34 44 44 38 46Z" fill="#E08A3E" ' + SO + '/><ellipse cx="30" cy="40" rx="16" ry="14" fill="#E89A4E" ' + SO + '/><circle cx="22" cy="26" r="12" fill="#E89A4E" ' + SO + '/><path d="M16 16L14 8L22 14Z" fill="#E89A4E" ' + SO + '/><circle cx="18" cy="25" r="2.4" fill="#4B3A5A"/><circle cx="12" cy="30" r="2" fill="#4B3A5A"/><ellipse cx="22" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.8"/>', 'sc-anim sc-peek', '--dur:9s');
      // Pilze, Igel, Laubhaufen, Holzschild
      function shroom(x, y, k) {
        return '<path d="M' + n(x - 8 * k) + ' ' + n(y) + 'Q' + n(x - 9 * k) + ' ' + n(y - 22 * k) + ' ' + n(x - 6 * k) + ' ' + n(y - 26 * k) + 'H' + n(x + 6 * k) + 'Q' + n(x + 9 * k) + ' ' + n(y - 22 * k) + ' ' + n(x + 8 * k) + ' ' + n(y) + 'Z" fill="#FFF4E0" ' + SO + '/>' +
          '<path d="M' + n(x - 26 * k) + ' ' + n(y - 24 * k) + 'Q' + n(x - 24 * k) + ' ' + n(y - 52 * k) + ' ' + n(x) + ' ' + n(y - 54 * k) + 'Q' + n(x + 24 * k) + ' ' + n(y - 52 * k) + ' ' + n(x + 26 * k) + ' ' + n(y - 24 * k) + 'Z" fill="#E8434F" ' + SO + '/>' +
          '<circle cx="' + n(x - 10 * k) + '" cy="' + n(y - 38 * k) + '" r="' + n(4 * k) + '" fill="#FFFFFF"/><circle cx="' + n(x + 8 * k) + '" cy="' + n(y - 44 * k) + '" r="' + n(3.4 * k) + '" fill="#FFFFFF"/><circle cx="' + n(x + 14 * k) + '" cy="' + n(y - 31 * k) + '" r="' + n(2.6 * k) + '" fill="#FFFFFF"/>';
      }
      var gk = c.m / 520;
      s += shroom(W * 0.05, H * 0.96, gk * 1.2) + shroom(W * 0.1, H * 0.98, gk * 0.8) + shroom(W * 0.96, H * 0.9, gk);
      // Igel
      var ix = W * (c.portrait ? 0.88 : 0.9), iy = H * 0.98, ik = gk * 1.1;
      function ip(dx, dy) { return n(ix + dx * ik) + ' ' + n(iy + dy * ik); }
      var spikes = 'M' + ip(-40, 0);
      for (var sp = 0; sp <= 8; sp++) {
        var a = Math.PI + (sp / 8) * Math.PI;
        spikes += 'L' + ip(Math.cos(a) * 44, Math.sin(a) * 34) + 'L' + ip(Math.cos(a + 0.2) * 32, Math.sin(a + 0.2) * 24);
      }
      s += '<path d="' + spikes + 'Z" fill="#8A6246" ' + SO + '/><ellipse cx="' + ip(-34, -8).split(' ')[0] + '" cy="' + ip(-34, -8).split(' ')[1] + '" rx="' + n(16 * ik) + '" ry="' + n(10 * ik) + '" fill="#E8C9A0" ' + SO + '/><circle cx="' + ip(-48, -9).split(' ')[0] + '" cy="' + ip(-48, -9).split(' ')[1] + '" r="' + n(3 * ik) + '" fill="#4B3A5A"/><circle cx="' + ip(-32, -12).split(' ')[0] + '" cy="' + ip(-32, -12).split(' ')[1] + '" r="' + n(2.4 * ik) + '" fill="#4B3A5A"/>';
      // Laubhaufen
      [[0.2, 0.97], [0.75, 0.98]].forEach(function (lp) {
        if (c.portrait && lp[0] === 0.2) return;
        var lx = W * lp[0], ly = H * lp[1];
        s += '<ellipse cx="' + n(lx) + '" cy="' + n(ly) + '" rx="' + n(70 * gk) + '" ry="' + n(26 * gk) + '" fill="' + v.leaves[0] + '"/>';
        for (var lf = 0; lf < 9; lf++) s += '<ellipse cx="' + n(lx + r.range(-60, 60) * gk) + '" cy="' + n(ly + r.range(-22, 6) * gk) + '" rx="' + n(12 * gk) + '" ry="' + n(6 * gk) + '" transform="rotate(' + r.int(-60, 60) + ' ' + n(lx) + ' ' + n(ly) + ')" fill="' + r.pick(v.leaves) + '" ' + SO + '/>';
      });
      // Holzschild mit Katzenpfote
      if (!c.portrait) {
        var sx = W * 0.08, sy = H * 0.72;
        s += '<rect x="' + n(sx - 5) + '" y="' + n(sy) + '" width="10" height="' + n(H * 0.2) + '" fill="#8A5A3B" ' + SO + '/><rect x="' + n(sx - 44) + '" y="' + n(sy - 36) + '" width="88" height="54" rx="8" fill="#C98F57" ' + SO + '/>' + B.pawPrint(sx, sy - 8, 1.6, '#7A4A2C');
      }
      if (v.fog) {
        c.layer(0, H * 0.4, W, H * 0.3, '<rect width="' + W + '" height="' + n(H * 0.3) + '" fill="url(#' + c.id('fogband') + ')"/>', 'sc-anim sc-drift', '--dur:30s;--dx:60px');
        c.defs += '<linearGradient id="' + c.id('fogband') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>';
      }
      c.fx = { kind: 'leaves' };
      c.ambience = ['wind', 'rustle'];
      return s;
    },
  };

  /* ---------- 7. Wolkenland ---------- */
  WORLDS.clouds = {
    name: 'Wolkenland',
    hider: 'cloud',
    variants: function (r) {
      var skies = [['#FFD6E8', '#E3D6FF', '#CDE8FF'], ['#E3D6FF', '#FFE0EC', '#FFF3D6'], ['#CDE8FF', '#E8DCFF', '#FFE0EC']];
      return { sky: r.pick(skies), rainbowX: r.pick([0.25, 0.5, 0.75]), balloons: r.shuffle([['#FF6F91', '#FFD1DF'], ['#5AB9EA', '#D6F0FF'], ['#FFC93C', '#FFF1C2'], ['#3CCFA0', '#D4F7EA']]), hiderVariant: r.pick(['lilac', 'pink', 'sky']) };
    },
    music: { key: 'Bb', bpm: 100, inst: 'celesta', prog: 'I-V-vi-IV', bell: true },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', [['0', v.sky[0]], ['0.55', v.sky[1]], ['1', v.sky[2]]]) + '"/>';
      // Regenbogen
      var rx = W * v.rainbowX, ry = H * 0.9, rr = Math.min(Math.max(W, H) * 0.5, H * 0.78);
      ['#FF8FA3', '#FFB86B', '#FFE27A', '#9EE6A8', '#8FD0F5', '#C3A8FF'].forEach(function (col, i) {
        var rad = rr - i * rr * 0.055;
        s += '<path d="M' + n(rx - rad) + ' ' + n(ry) + 'A' + n(rad) + ' ' + n(rad) + ' 0 0 1 ' + n(rx + rad) + ' ' + n(ry) + '" stroke="' + col + '" stroke-width="' + n(rr * 0.056) + '" fill="none" opacity="0.55"/>';
      });
      // ziehende Wolken am Himmel
      for (var dk = 0; dk < 3; dk++) {
        var dw = c.m * r.range(0.18, 0.28);
        c.layer(W * (0.08 + dk * 0.32) + r.range(-30, 30), H * r.range(0.14, 0.4), dw, dw * 0.5, B.cloud(dw / 2, dw * 0.48, dw / 190, '#FFFFFF', '#F1E8FF'), 'sc-anim sc-drift', '--dur:' + r.int(26, 42) + 's;--dx:' + r.int(50, 110) + 'px');
      }
      // Wolkenschloss
      var cx0 = v.rainbowX > 0.5 ? W * 0.12 : W * 0.88, cy0 = H * 0.5, ck = c.m / 520;
      function cp(dx, dy) { return n(cx0 + dx * ck) + ' ' + n(cy0 + dy * ck); }
      var castle = '';
      [[-60, 34, 110], [60, 34, 110], [0, 46, 150]].forEach(function (t) {
        castle += '<rect x="' + n(cx0 + (t[0] - t[1] / 2) * ck) + '" y="' + n(cy0 - t[2] * ck) + '" width="' + n(t[1] * ck) + '" height="' + n(t[2] * ck) + '" fill="#FFF3FA" ' + SO + '/>' +
          '<path d="M' + cp(t[0] - t[1] / 2 - 6, -t[2]) + 'L' + cp(t[0], -t[2] - 44) + 'L' + cp(t[0] + t[1] / 2 + 6, -t[2]) + 'Z" fill="' + (t[0] ? '#C3A8FF' : '#FF9EC4') + '" ' + SO + '/>' +
          '<rect x="' + n(cx0 + (t[0] - 7) * ck) + '" y="' + n(cy0 - (t[2] - 30) * ck) + '" width="' + n(14 * ck) + '" height="' + n(20 * ck) + '" rx="' + n(7 * ck) + '" fill="#8FD0F5"/>' +
          '<path d="M' + cp(t[0], -t[2] - 44) + 'V' + cp(t[0], -t[2] - 62).split(' ')[1] + '" stroke="#8C7B9E" stroke-width="2"/><path d="M' + cp(t[0], -t[2] - 62) + 'L' + cp(t[0] + 16, -t[2] - 56) + 'L' + cp(t[0], -t[2] - 50) + 'Z" fill="#FFD24A"/>';
      });
      castle += '<rect x="' + n(cx0 - 80 * ck) + '" y="' + n(cy0 - 60 * ck) + '" width="' + n(160 * ck) + '" height="' + n(60 * ck) + '" fill="#FFF3FA" ' + SO + '/><path d="M' + cp(-16, 0) + 'V' + cp(-16, -30).split(' ')[1] + 'Q' + cp(0, -46) + ' ' + cp(16, -30) + 'V' + cp(16, 0).split(' ')[1] + 'Z" fill="#C3A8FF"/>';
      s += castle + B.cloud(cx0, cy0 + 20 * ck, ck * 1.4, '#FFFFFF', '#F1E8FF');
      // Wolkenboden
      var fy = H * 0.84;
      for (var x = -60; x < W + 60; x += r.range(120, 180)) s += B.cloud(x, fy + r.range(20, 60), r.range(0.9, 1.4) * c.m / 700, '#FFFFFF', '#EFE6FF');
      s += '<rect y="' + n(fy + 40) + '" width="' + W + '" height="' + H + '" fill="#FFFFFF"/>';
      for (var x2 = -40; x2 < W + 60; x2 += r.range(90, 140)) s += B.cloud(x2, H + 10, r.range(0.8, 1.2) * c.m / 600, '#FFFFFF', '#F4EEFF');
      // schwebende Ballons
      var nb = c.portrait ? 2 : 3;
      for (var b = 0; b < nb; b++) {
        var bx = b === 0 ? W * r.range(0.02, 0.1) : b === 1 ? W * r.range(0.84, 0.92) : W * r.range(0.35, 0.6);
        var by = H * (b === 2 ? r.range(0.08, 0.14) : r.range(0.16, 0.34));
        var bs = (b === 2 ? 0.7 : 1) * Math.max(0.8, c.m / 700);
        c.layer(bx, by, 90 * bs, 130 * bs, '<g transform="scale(' + bs.toFixed(2) + ')">' + B.balloon(v.balloons[b][0], v.balloons[b][1]) + '</g>', 'sc-anim sc-bob', '--dur:' + r.int(5, 8) + 's;--dy:' + r.int(10, 20) + 'px;animation-delay:-' + r.int(0, 5) + 's');
      }
      // Papierdrachen
      if (!c.portrait) {
        c.layer(W * 0.62, H * 0.2, 90, 150, '<path d="M45 4L76 40L45 90L14 40Z" fill="#FF9EC4" ' + SO + '/><path d="M45 4V90M14 40H76" stroke="#FFFFFF" stroke-width="2.5"/><path d="M45 90Q36 110 48 120Q58 132 44 146" stroke="#8C7B9E" stroke-width="2" fill="none"/><path d="M42 108l-8 -4v8zM48 128l8 -4v8z" fill="#FFD24A"/>', 'sc-anim sc-sway', '--dur:4s;--a:6deg;transform-origin:50% 0');
      }
      c.fx = { kind: 'glitter' };
      c.ambience = ['wind', 'chimes'];
      return s;
    },
  };

  /* ---------- Titel und Spielzimmer ---------- */
  var SPECIAL = {};

  SPECIAL.title = {
    music: { key: 'C', bpm: 96, inst: 'musicbox', prog: 'I-vi-IV-V' },
    variants: function () { return {}; },
    build: function (c) {
      var W = c.W, H = c.H, r = c.r;
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.lin('sky', [['0', '#FFD9E8'], ['0.5', '#E8DDFF'], ['1', '#CDEBFF']]) + '"/>';
      for (var k = 0; k < 4; k++) {
        var cw = c.m * r.range(0.2, 0.34);
        c.layer(W * (0.02 + k * 0.26) + r.range(-30, 30), H * r.range(0.04, 0.3), cw, cw * 0.5, B.cloud(cw / 2, cw * 0.48, cw / 190, '#FFFFFF', '#F3EAFF'), 'sc-anim sc-drift', '--dur:' + r.int(24, 40) + 's;--dx:' + r.int(40, 90) + 'px');
      }
      s += B.hills(c, H * 0.72, H * 0.06, '#C9EFC4', 0, 3);
      s += B.hills(c, H * 0.8, H * 0.05, '#A9E4A2', 1, 4);
      s += '<rect y="' + n(H * 0.84) + '" width="' + W + '" height="' + H + '" fill="#9ADB92"/>';
      for (var f = 0; f < W; f += r.range(40, 70)) s += r.chance(0.5) ? B.tulip(f, H * r.range(0.86, 0.98), r.range(0.8, 1.1), r.pick(['#FF6F91', '#FFC93C', '#B89CFF'])) : B.daisy(f, H * r.range(0.86, 0.98), r.range(0.8, 1));
      c.fx = { kind: 'glitter' };
      c.ambience = [];
      return s;
    },
  };

  SPECIAL.playroom = {
    music: { key: 'G', bpm: 112, inst: 'marimba', prog: 'I-IV-V-I' },
    variants: function (r) { return { wall: r.pick(['#FFE7D1', '#E6F2FF', '#F3E6FF']) }; },
    build: function (c, v) {
      var W = c.W, H = c.H, r = c.r;
      var floorY = H * 0.52;
      c.floorY = floorY;
      var s = '<rect width="' + W + '" height="' + n(floorY) + '" fill="' + v.wall + '"/>';
      for (var x = 20; x < W; x += 60) s += '<path d="M' + x + ' 0V' + n(floorY) + '" stroke="#FFFFFF" stroke-width="14" opacity="0.5"/>';
      s += '<rect y="' + n(floorY) + '" width="' + W + '" height="' + n(H - floorY) + '" fill="' + c.lin('floor', ['#F0C99B', '#E2B27E']) + '"/>';
      s += '<rect y="' + n(floorY - 12) + '" width="' + W + '" height="14" fill="#FFFFFF"/>';
      var plank = Math.max(30, (H - floorY) / 6);
      for (var yy = floorY + plank; yy < H; yy += plank) s += '<path d="M0 ' + n(yy) + 'H' + W + '" stroke="#C99A62" stroke-width="2" opacity="0.4"/>';
      // Fenster mit Fensterbank (Mitte oben)
      var fw = Math.min(W * 0.3, 360), fh = Math.min(floorY * 0.6, fw * 0.75);
      var fx = W / 2 - fw / 2, fy = floorY * 0.14;
      s += '<rect x="' + n(fx - 10) + '" y="' + n(fy - 10) + '" width="' + n(fw + 20) + '" height="' + n(fh + 20) + '" rx="12" fill="#FFFFFF" ' + SO + '/><rect x="' + n(fx) + '" y="' + n(fy) + '" width="' + n(fw) + '" height="' + n(fh) + '" rx="6" fill="' + c.lin('win', ['#8FD0F5', '#DDF2FF']) + '"/>';
      s += B.cloud(fx + fw * 0.35, fy + fh * 0.45, fw / 400, '#FFFFFF', null, false) + B.tree(fx + fw * 0.8, fy + fh + 6, fw / 700, '#7CC873');
      s += '<path d="M' + n(fx + fw / 2) + ' ' + n(fy) + 'V' + n(fy + fh) + '" stroke="#FFFFFF" stroke-width="8"/>';
      s += '<rect x="' + n(fx - 30) + '" y="' + n(fy + fh + 8) + '" width="' + n(fw + 60) + '" height="18" rx="9" fill="#FFFFFF" ' + SO + '/>';
      c.sill = { x: fx, y: fy + fh + 8, w: fw };
      // Kratzbaum (links)
      var kx = W * 0.1, kb = floorY + (H - floorY) * 0.3, kh = Math.min(H * 0.5, 380);
      s += '<rect x="' + n(kx - 56) + '" y="' + n(kb - 14) + '" width="112" height="24" rx="10" fill="#B9A38A" ' + SO + '/><rect x="' + n(kx - 13) + '" y="' + n(kb - kh) + '" width="26" height="' + n(kh - 10) + '" fill="#E7CFA0" ' + SO + '/>';
      for (var sy = kb - kh + 8; sy < kb - 14; sy += 8) s += '<path d="M' + n(kx - 13) + ' ' + n(sy) + 'L' + n(kx + 13) + ' ' + n(sy + 4) + '" stroke="#C9A96E" stroke-width="2"/>';
      s += '<rect x="' + n(kx - 64) + '" y="' + n(kb - kh * 0.52) + '" width="128" height="20" rx="10" fill="#FF9EC4" ' + SO + '/><rect x="' + n(kx - 52) + '" y="' + n(kb - kh - 14) + '" width="104" height="20" rx="10" fill="#FF9EC4" ' + SO + '/>';
      s += '<path d="M' + n(kx + 46) + ' ' + n(kb - kh * 0.52 + 18) + 'V' + n(kb - kh * 0.3) + '" stroke="#8C7B9E" stroke-width="2"/><circle cx="' + n(kx + 46) + '" cy="' + n(kb - kh * 0.3 + 9) + '" r="10" fill="#FFC93C" ' + SO + '/>';
      // Kissen (rechts)
      var kx2 = W * 0.86, ky2 = floorY + (H - floorY) * 0.35;
      s += '<ellipse cx="' + n(kx2) + '" cy="' + n(ky2) + '" rx="' + n(Math.min(120, W * 0.1)) + '" ry="34" fill="#B89CFF" ' + SO + '/><ellipse cx="' + n(kx2) + '" cy="' + n(ky2 - 6) + '" rx="' + n(Math.min(100, W * 0.085)) + '" ry="22" fill="#D2C2FF"/>';
      // Spielzeugkiste (rechts hinten)
      var bx = W * 0.72, by = floorY + 10;
      s += '<rect x="' + n(bx - 70) + '" y="' + n(by - 70) + '" width="140" height="80" rx="10" fill="#5AB9EA" ' + SO + '/><rect x="' + n(bx - 76) + '" y="' + n(by - 84) + '" width="152" height="22" rx="8" fill="#7FCBF2" ' + SO + '/>';
      s += '<circle cx="' + n(bx - 30) + '" cy="' + n(by - 92) + '" r="16" fill="#FF6F91" ' + SO + '/><path d="M' + n(bx + 10) + ' ' + n(by - 90) + 'l30 -24" stroke="#FFC93C" stroke-width="7" stroke-linecap="round"/><circle cx="' + n(bx + 42) + '" cy="' + n(by - 116) + '" r="7" fill="#FF6F91"/>';
      s += B.pawPrint(bx, by - 30, 1.6, '#FFFFFF');
      // Bilder
      s += '<rect x="' + n(W * 0.25) + '" y="' + n(floorY * 0.2) + '" width="' + n(Math.min(110, W * 0.08)) + '" height="' + n(Math.min(84, W * 0.06)) + '" rx="8" fill="#FFD24A" ' + SO + '/>' + B.heart(W * 0.25 + Math.min(55, W * 0.04), floorY * 0.2 + Math.min(34, W * 0.024), Math.min(36, W * 0.026), '#FF6F91');
      // Sonnenfleck vom Fenster auf dem Boden
      var beam = c.lin('beam', [['0', '#FFFBE6', 0.5], ['1', '#FFFBE6', 0]]);
      s += '<path d="M' + n(fx) + ' ' + n(fy + fh) + 'L' + n(fx + fw) + ' ' + n(fy + fh) + 'L' + n(fx + fw + W * 0.08) + ' ' + n(H) + 'L' + n(fx - W * 0.08) + ' ' + n(H) + 'Z" fill="' + beam + '"/>';
      // runder Teppich in der Mitte
      var ry = floorY + (H - floorY) * 0.55;
      s += '<ellipse cx="' + n(W / 2) + '" cy="' + n(ry) + '" rx="' + n(W * 0.3) + '" ry="' + n((H - floorY) * 0.3) + '" fill="#A9D8F5" opacity="0.9"/>';
      s += '<ellipse cx="' + n(W / 2) + '" cy="' + n(ry) + '" rx="' + n(W * 0.26) + '" ry="' + n((H - floorY) * 0.24) + '" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>';
      for (var pp2 = 0; pp2 < 6; pp2++) {
        var a2 = (pp2 / 6) * Math.PI * 2 + 0.3;
        s += B.pawPrint(W / 2 + Math.cos(a2) * W * 0.18, ry + Math.sin(a2) * (H - floorY) * 0.15, 1.3, '#FFFFFF', a2 * 57);
      }
      // Pflanze rechts vorn, Spielzeugmaus und Feder links vorn
      var plx = W * 0.97, plb = H * 0.99;
      s += '<path d="M' + n(plx - 34) + ' ' + n(plb - 66) + 'H' + n(plx + 34) + 'L' + n(plx + 27) + ' ' + n(plb) + 'H' + n(plx - 27) + 'Z" fill="#FF9EC4" ' + SO + '/>';
      [[-54, -150, -40], [0, -176, 0], [46, -144, 38], [-32, -114, -62]].forEach(function (l) {
        s += '<path d="M' + n(plx) + ' ' + n(plb - 66) + 'Q' + n(plx + l[0] * 0.3) + ' ' + n(plb - 66 + l[1] * 0.5) + ' ' + n(plx + l[0]) + ' ' + n(plb - 66 + l[1] * 0.8) + '" stroke="#4E9E52" stroke-width="4" fill="none"/>';
        s += '<ellipse cx="' + n(plx + l[0]) + '" cy="' + n(plb - 66 + l[1] * 0.8) + '" rx="22" ry="34" transform="rotate(' + l[2] + ' ' + n(plx + l[0]) + ' ' + n(plb - 66 + l[1] * 0.8) + ')" fill="#6CC070" ' + SO + '/>';
      });
      var mx2 = W * 0.06, my2 = H * 0.95;
      s += '<ellipse cx="' + n(mx2) + '" cy="' + n(my2) + '" rx="26" ry="15" fill="#C9C3D6" ' + SO + '/><circle cx="' + n(mx2 - 22) + '" cy="' + n(my2 - 12) + '" r="9" fill="#FFC2D2" ' + SO + '/><circle cx="' + n(mx2 - 27) + '" cy="' + n(my2 - 2) + '" r="2.4" fill="#4B3A5A"/><path d="M' + n(mx2 + 24) + ' ' + n(my2) + 'Q' + n(mx2 + 46) + ' ' + n(my2 - 6) + ' ' + n(mx2 + 50) + ' ' + n(my2 - 24) + '" stroke="#C9C3D6" stroke-width="3" fill="none" stroke-linecap="round"/>';
      c.ambience = [];
      return s;
    },
  };

  /* =====================================================================
     Anzeigen
     ===================================================================== */

  var current = null;

  function build(def, W, H, seed, forcedVariant) {
    var rng = U.rng(seed);
    var vr = U.rng((seed ^ 0x9e3779b9) >>> 0);
    var v = def.variants(vr);
    if (forcedVariant !== undefined && def.forceVariant) def.forceVariant(v, forcedVariant);
    var c = new Ctx(W, H, rng);
    c.fx = null;
    c.ambience = [];
    var body = def.build(c, v);
    // Vordergrund und Vignette in einem gemeinsamen SVG über den animierten Ebenen (spart eine Vollbild-Ebene)
    var vign = '<rect width="' + W + '" height="' + H + '" fill="' + c.rad('vig', [['0.55', '#4B3A5A', 0], ['1', '#4B3A5A', 0.2]], 0.5, 0.5, 0.75) + '"/>';
    var svg = '<svg class="sc-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none" aria-hidden="true"><defs>' + c.defs + '</defs>' + body + '</svg>';
    var fg = '<svg class="sc-svg sc-fg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' + c.fg + vign + '</svg>';
    return { svg: svg, layers: c.layers + fg, v: v, c: c };
  }

  var Scenes = {
    worlds: WORLDS,
    special: SPECIAL,

    /** Zeigt eine Welt (id aus WORLDS) oder Sonderszene (title, playroom). Rückgabe: Infos für Spiel und Klang */
    show: function (id, o) {
      o = o || {};
      var def = WORLDS[id] || SPECIAL[id];
      if (!def) throw new Error('Unbekannte Szene: ' + id);
      var host = U.$('#scene');
      var seed = o.seed !== undefined ? o.seed : Math.floor(Math.random() * 1e9);
      var W = root.innerWidth, H = root.innerHeight;
      var b = build(def, W, H, seed, o.variant);
      var wrap = U.el('div', { class: 'sc-wrap', html: b.svg + b.layers });
      host.appendChild(wrap);
      // weiches Einblenden, alte Szene danach entfernen
      var old = current && current.el;
      wrap.getBoundingClientRect();
      wrap.classList.add('is-in');
      if (old) setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 700);
      var info = {
        id: id,
        seed: seed,
        variant: b.v,
        hider: def.hider ? { type: def.hider, variant: KS.Hiders.variant(def.hider, b.v.hiderVariant || 0) } : null,
        music: Object.assign({ id: id, seed: seed }, def.music),
        ambience: b.c.ambience,
        fx: b.c.fx,
        extra: { floorY: b.c.floorY, sill: b.c.sill },
      };
      current = { id: id, seed: seed, variant: o.variant, el: wrap, info: info, W: W, H: H };
      var stage = U.$('#stage');
      if (stage) stage.className = 'layer ' + (b.c.stageClass || '') + ' world-' + id;
      if (KS.FX) {
        if (info.fx) KS.FX.ambient(info.fx.kind, info.fx.opts);
        else KS.FX.stopAmbient();
      }
      if (!Scenes._rz) {
        Scenes._rz = true;
        root.addEventListener('resize', function () {
          clearTimeout(Scenes._rzT);
          Scenes._rzT = setTimeout(Scenes.resize, 200);
        });
      }
      return info;
    },

    /** Neu erzeugen für die neue Fenstergröße, gleicher Seed */
    resize: function () {
      if (!current) return;
      var W = root.innerWidth, H = root.innerHeight;
      if (W === current.W && H === current.H) return;
      var def = WORLDS[current.id] || SPECIAL[current.id];
      var b = build(def, W, H, current.seed, current.variant);
      var wrap = U.el('div', { class: 'sc-wrap is-in no-fade', html: b.svg + b.layers });
      var old = current.el;
      U.$('#scene').appendChild(wrap);
      if (old && old.parentNode) old.parentNode.removeChild(old);
      current.el = wrap;
      current.W = W;
      current.H = H;
      current.info.extra = { floorY: b.c.floorY, sill: b.c.sill };
      if (KS.FX && current.info.fx) KS.FX.ambient(current.info.fx.kind, b.c.fx ? b.c.fx.opts : null);
    },

    current: function () { return current ? current.info : null; },

    /** Für die Galerie: Szene in eine vorgegebene Größe als Element bauen */
    render: function (id, W, H, seed) {
      var def = WORLDS[id] || SPECIAL[id];
      var b = build(def, W, H, seed);
      return { html: b.svg + b.layers, variant: b.v, info: b.c };
    },
  };

  KS.Scenes = Scenes;
})(typeof window !== 'undefined' ? window : globalThis);

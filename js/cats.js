/* Miau-Memory – die zwölf Katzen.
   KS.Cats: Daten (Konzept 5.1) · KS.CatArt: SVG-Zeichnung mit globalen defs · KS.CatView: Leben (Blinzeln, Blick, Streicheln …) */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;

  var OUT = '#4B3A5A';

  /* =====================================================================
     Daten
     ===================================================================== */

  KS.Cats = [
    {
      id: 'minka', name: 'Minka', fur: '#F6A55B', stripe: '#E0782F', belly: '#FFF1DC', muzzle: '#FFF1DC', eye: '#7AC35A',
      paw: '#FFF1DC', pattern: 'tabby', acc: 'bell',
      voice: { f0: 620, kind: 'miau' }, tail: 7,
      more: 'Minka ist orange getigert und hat ein Glöckchen.',
    },
    {
      id: 'kruemel', name: 'Krümel', fur: '#3B3547', gloss: '#5A5470', eye: '#F6C945', dark: true,
      paw: '#3B3547', pattern: 'gloss', acc: 'bow', muzzle: '#463F54',
      voice: { f0: 850, kind: 'mi' }, tail: 9,
      more: 'Krümel ist ganz schwarz und trägt eine rote Schleife.',
    },
    {
      id: 'flocke', name: 'Flocke', fur: '#FFFFFF', shade: '#E3E9F3', eye: '#5DADE2', belly: '#FFFFFF',
      paw: '#FFFFFF', pattern: 'fluffy', tufts: true, acc: 'wreath',
      voice: { f0: 700, kind: 'miaaau' }, tail: 5,
      more: 'Flocke ist weiß und flauschig wie Schnee.',
    },
    {
      id: 'tiger', name: 'Tiger', fur: '#A9ADB3', stripe: '#6D7078', belly: '#E9EAEC', muzzle: '#E9EAEC', eye: '#F0A030',
      paw: '#E9EAEC', pattern: 'tabbyM', acc: 'scarf',
      voice: { f0: 500, kind: 'mrrp' }, tail: 6,
      more: 'Tiger ist grau gestreift wie ein kleiner Tiger.',
    },
    {
      id: 'puenktchen', name: 'Pünktchen', fur: '#FFFFFF', shade: '#EDE7F0', spot: '#3B3547', eye: '#3CC7C0',
      paw: '#FFFFFF', pattern: 'spots', acc: 'partyhat',
      voice: { f0: 740, kind: 'mi-au' }, tail: 8,
      more: 'Pünktchen hat lauter Punkte und einen Partyhut.',
    },
    {
      id: 'socke', name: 'Socke', fur: '#34303F', white: '#FFFFFF', eye: '#8BD450', dark: true,
      paw: '#FFFFFF', pattern: 'tuxedo', acc: 'bowtie',
      voice: { f0: 600, kind: 'miau' }, tail: 7,
      more: 'Socke hat weiße Pfoten, wie Socken!',
    },
    {
      id: 'momo', name: 'Momo', fur: '#F5E6D0', point: '#6B4B3E', eye: '#3E8EDE', belly: '#FBF3E6',
      paw: '#6B4B3E', pattern: 'siamese', acc: 'beanie',
      voice: { f0: 560, kind: 'miaaau' }, tail: 5,
      more: 'Momo hat blaue Augen und eine warme Mütze.',
    },
    {
      id: 'lotte', name: 'Lotte', fur: '#FFFFFF', shade: '#EEE8EA', orange: '#F29E4C', black: '#3D3A45', eye: '#6CC070',
      paw: '#FFFFFF', pattern: 'calico', acc: 'sunflower',
      voice: { f0: 680, kind: 'miau?' }, tail: 7,
      more: 'Lotte ist dreifarbig: weiß, orange und schwarz.',
    },
    {
      id: 'schnurri', name: 'Schnurri', fur: '#8FA3B8', eye: '#F28C28', muzzle: '#A9BACB', belly: '#A9BACB',
      paw: '#8FA3B8', pattern: 'plain', round: true, acc: 'strawberry',
      voice: { f0: 480, kind: 'mau' }, tail: 4, purr: 1.25,
      more: 'Schnurri ist blaugrau und schnurrt am liebsten.',
    },
    {
      id: 'sternchen', name: 'Sternchen', fur: '#3E4A89', star: '#FFD24A', eye: '#FFD24A', dark: true, muzzle: '#56629F',
      paw: '#3E4A89', pattern: 'stars', acc: 'crown',
      voice: { f0: 760, kind: 'mi', sparkle: true }, tail: 6,
      more: 'Sternchen hat goldene Sterne im Fell.',
    },
    {
      id: 'rosi', name: 'Rosi', fur: '#F7B2C8', eye: '#9B6BD6', muzzle: '#FCD6E2', belly: '#FCD6E2',
      paw: '#F7B2C8', pattern: 'heart', acc: 'butterfly',
      voice: { f0: 900, kind: 'miu' }, tail: 8,
      more: 'Rosi ist rosa und hat ein Herz auf der Stirn.',
    },
    {
      id: 'wuschel', name: 'Wuschel', fur: '#A0724A', stripe: '#6E4A2E', belly: '#F3E2C7', muzzle: '#F3E2C7', ruff: '#F3E2C7', eye: '#C8D44E',
      paw: '#F3E2C7', pattern: 'tabby', lynx: true, bushy: true, acc: 'stripescarf', big: true,
      voice: { f0: 420, kind: 'mau' }, tail: 4,
      more: 'Wuschel ist die größte Katze und hat Pinselohren.',
    },
  ];
  KS.Cats.byId = {};
  KS.Cats.forEach(function (c, i) {
    c.index = i;
    KS.Cats.byId[c.id] = c;
    c.earIn = c.dark ? '#E48BAA' : '#FFB3C6';
    c.line = OUT;
    c.tailColor = c.tailColor || (c.pattern === 'siamese' ? c.point : c.pattern === 'calico' ? c.orange : c.fur);
  });

  /* =====================================================================
     Zeichnung
     ===================================================================== */

  function n(v) { return Math.round(v * 10) / 10; }

  /** Spitz zulaufender Streifen von (x1,y1) (breit) nach (x2,y2) (Spitze) */
  function taper(x1, y1, x2, y2, w) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    var px = -uy, py = ux;
    var h = w / 2;
    var blx = x1 + px * h, bly = y1 + py * h, brx = x1 - px * h, bry = y1 - py * h;
    var mx = x1 + dx * 0.5, my = y1 + dy * 0.5;
    return 'M' + n(blx) + ' ' + n(bly) +
      'Q' + n(mx + px * h * 0.8) + ' ' + n(my + py * h * 0.8) + ' ' + n(x2) + ' ' + n(y2) +
      'Q' + n(mx - px * h * 0.8) + ' ' + n(my - py * h * 0.8) + ' ' + n(brx) + ' ' + n(bry) +
      'Q' + n(x1 - ux * h * 1.2) + ' ' + n(y1 - uy * h * 1.2) + ' ' + n(blx) + ' ' + n(bly) + 'Z';
  }

  /** Fünfzackiger Stern als Pfad */
  function starPath(cx, cy, r, inner, rot) {
    var d = '';
    rot = rot || -Math.PI / 2;
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * (inner || 0.5) : r;
      var a = rot + (i * Math.PI) / 5;
      d += (i ? 'L' : 'M') + n(cx + Math.cos(a) * rr) + ' ' + n(cy + Math.sin(a) * rr);
    }
    return d + 'Z';
  }
  /** Herz, Mitte oben bei (cx, cy), Größe s */
  function heartPath(cx, cy, s) {
    var k = s / 20;
    function p(x, y) { return n(cx + x * k) + ' ' + n(cy + y * k); }
    return 'M' + p(0, -4) + 'C' + p(-3, -12) + ' ' + p(-16, -11) + ' ' + p(-14, 0) +
      'C' + p(-12, 8) + ' ' + p(-4, 11) + ' ' + p(0, 16) +
      'C' + p(4, 11) + ' ' + p(12, 8) + ' ' + p(14, 0) +
      'C' + p(16, -11) + ' ' + p(3, -12) + ' ' + p(0, -4) + 'Z';
  }

  var MIRROR = 'matrix(-1 0 0 1 200 0)';

  // Grundformen (viewBox 0 0 200 200). Kopf ~128×106 um (100, 88).
  var HEAD = 'M100 35C139 35 163 55 165 86C167 116 146 140 100 140C54 140 33 116 35 86C37 55 61 35 100 35Z';
  var HEAD_ROUND = 'M100 38C140 38 164 58 167 88C170 112 164 132 136 139C124 142 112 143 100 143C88 143 76 142 64 139C36 132 30 112 33 88C36 58 60 38 100 38Z';
  var HEAD_BIG = 'M100 32C141 32 166 53 168 86C170 118 147 141 100 141C53 141 30 118 32 86C34 53 59 32 100 32Z';
  var BODY = 'M100 114C131 114 148 140 150 168C152 191 134 199 100 199C66 199 48 191 50 168C52 140 69 114 100 114Z';
  var BODY_BIG = 'M100 112C135 112 154 140 156 168C158 192 138 200 100 200C62 200 42 192 44 168C46 140 65 112 100 112Z';
  // Linkes Ohr, Spitze bei ~(54, 12); das rechte entsteht gespiegelt
  var EAR = 'M40 80C36 54 41 28 52 14C55 10 60 9 64 12C77 22 89 35 97 48Z';
  var EAR_IN = 'M50 64C49 47 52 33 56 25C63 31 72 40 80 51C69 53 58 58 50 64Z';
  var TAIL = 'M140 186C170 191 186 170 178 149C171 131 177 115 189 112';
  var TAIL_BUSHY = 'M138 184C172 192 190 170 181 148C173 128 178 111 190 106';

  function gradId(c, k) { return 'ks-' + c.id + '-' + k; }

  /** Globale Definitionen (Verläufe, clipPaths) für alle Katzen – einmal pro Dokument */
  function defsMarkup() {
    var s = '';
    // Augen-Clip, gilt für alle (lokale Koordinaten eines Auges)
    s += '<clipPath id="ks-eyeclip"><ellipse cx="0" cy="0" rx="14.2" ry="16.2"/></clipPath>';
    KS.Cats.forEach(function (c) {
      var light = c.shade ? '#FFFFFF' : U.lighten(c.fur, c.dark ? 0.16 : 0.28);
      var mid = c.fur;
      var dark = c.shade || U.darken(c.fur, c.dark ? 0.2 : 0.12);
      s += '<radialGradient id="' + gradId(c, 'fur') + '" cx="0.36" cy="0.3" r="0.78">' +
        '<stop offset="0" stop-color="' + light + '"/><stop offset="0.55" stop-color="' + mid + '"/>' +
        '<stop offset="1" stop-color="' + dark + '"/></radialGradient>';
      s += '<linearGradient id="' + gradId(c, 'iris') + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + U.darken(c.eye, 0.28) + '"/><stop offset="0.55" stop-color="' + c.eye + '"/>' +
        '<stop offset="1" stop-color="' + U.lighten(c.eye, 0.45) + '"/></linearGradient>';
      var head = c.round ? HEAD_ROUND : c.big ? HEAD_BIG : HEAD;
      var body = c.big ? BODY_BIG : BODY;
      s += '<clipPath id="' + gradId(c, 'hc') + '"><path d="' + head + '"/></clipPath>';
      s += '<clipPath id="' + gradId(c, 'bc') + '"><path d="' + body + '"/></clipPath>';
      if (c.pattern === 'siamese') {
        s += '<radialGradient id="' + gradId(c, 'mask') + '" cx="0.5" cy="0.5" r="0.5">' +
          '<stop offset="0" stop-color="' + c.point + '" stop-opacity="0.82"/><stop offset="0.5" stop-color="' + c.point + '" stop-opacity="0.66"/>' +
          '<stop offset="0.78" stop-color="' + c.point + '" stop-opacity="0.28"/><stop offset="1" stop-color="' + c.point + '" stop-opacity="0"/></radialGradient>';
        s += '<linearGradient id="' + gradId(c, 'earpt') + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + c.point + '"/><stop offset="0.7" stop-color="' + c.point + '"/><stop offset="1" stop-color="' + c.fur + '"/></linearGradient>';
      }
    });
    // Gemeinsame Verläufe für Accessoires
    s += '<radialGradient id="ks-gold" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFF4B8"/><stop offset="0.5" stop-color="#FFD24A"/><stop offset="1" stop-color="#E8A317"/></radialGradient>';
    s += '<linearGradient id="ks-rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF6F91"/><stop offset="0.25" stop-color="#FF9A5A"/><stop offset="0.45" stop-color="#FFD24A"/><stop offset="0.65" stop-color="#3CCFA0"/><stop offset="0.82" stop-color="#5AB9EA"/><stop offset="1" stop-color="#B89CFF"/></linearGradient>';
    s += '<radialGradient id="ks-blush" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FF7FA3" stop-opacity="0.75"/><stop offset="1" stop-color="#FF7FA3" stop-opacity="0"/></radialGradient>';
    return s;
  }

  function ensureDefs() {
    if (ensureDefs.done || !root.document) return;
    var host = root.document.getElementById('ks-defs-root');
    if (!host) {
      var svg = root.document.createElementNS(U.SVGNS, 'svg');
      svg.setAttribute('id', 'ks-defs');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;left:0;top:0';
      host = root.document.createElementNS(U.SVGNS, 'defs');
      host.setAttribute('id', 'ks-defs-root');
      svg.appendChild(host);
      root.document.body.insertBefore(svg, root.document.body.firstChild);
    }
    var frag = U.svgFrag(defsMarkup());
    while (frag.firstChild) host.appendChild(frag.firstChild);
    ensureDefs.done = true;
  }

  /* ---------- Teile ---------- */

  function tailMarkup(c) {
    var d = c.bushy ? TAIL_BUSHY : TAIL;
    var wOut = c.bushy ? 30 : 19;
    var wIn = c.bushy ? 24 : 13;
    var col = c.tailColor;
    var s = '<path d="' + d + '" fill="none" stroke="' + OUT + '" stroke-width="' + wOut + '" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + wIn + '" stroke-linecap="round" stroke-linejoin="round"/>';
    if (c.stripe) {
      s += '<path d="' + d + '" fill="none" stroke="' + c.stripe + '" stroke-width="' + wIn + '" stroke-dasharray="6 10" stroke-dashoffset="-4" opacity="0.9"/>';
    }
    if (c.pattern === 'tuxedo' || c.pattern === 'spots') {
      // weiße bzw. dunkle Schwanzspitze
      var tip = c.pattern === 'tuxedo' ? c.white : c.spot;
      s += '<path d="' + d + '" fill="none" stroke="' + tip + '" stroke-width="' + wIn + '" stroke-linecap="round" pathLength="100" stroke-dasharray="0 82 18"/>';
    }
    if (c.pattern === 'calico') {
      s += '<path d="' + d + '" fill="none" stroke="' + c.black + '" stroke-width="' + wIn + '" stroke-dasharray="7 12" stroke-dashoffset="-2" opacity="0.95"/>';
    }
    if (c.pattern === 'stars') {
      s += '<path d="' + starPath(174, 152, 5, 0.45, 0.3) + '" fill="' + c.star + '"/>';
      s += '<path d="' + starPath(186, 114, 4, 0.45, 0.1) + '" fill="' + c.star + '"/>';
    }
    if (c.bushy) {
      // dunkle, buschige Spitze
      s += '<path d="' + d + '" fill="none" stroke="' + U.darken(c.fur, 0.3) + '" stroke-width="' + wIn + '" stroke-linecap="round" pathLength="100" stroke-dasharray="0 88 12"/>';
    }
    return s;
  }

  function bodyMarkup(c) {
    var body = c.big ? BODY_BIG : BODY;
    var s = '<path class="cat-bodyshape" d="' + body + '" fill="url(#' + gradId(c, 'fur') + ')"/>';
    var inner = '';
    // Schatten des Kopfes auf der Brust
    inner += '<ellipse cx="100" cy="140" rx="46" ry="14" fill="#2a1f33" opacity="0.12"/>';
    if (c.belly) inner += '<ellipse cx="100" cy="174" rx="' + (c.big ? 32 : 27) + '" ry="26" fill="' + c.belly + '"/>';
    switch (c.pattern) {
      case 'tabby':
      case 'tabbyM':
        inner += '<g fill="' + c.stripe + '">' +
          '<path d="' + taper(44, 150, 66, 156, 8) + '"/><path d="' + taper(44, 166, 64, 170, 8) + '"/><path d="' + taper(46, 182, 62, 184, 7) + '"/>' +
          '<path d="' + taper(156, 150, 134, 156, 8) + '"/><path d="' + taper(156, 166, 136, 170, 8) + '"/><path d="' + taper(154, 182, 138, 184, 7) + '"/>' +
          '</g>';
        break;
      case 'gloss':
        inner += '<path d="M62 160C63 150 67 142 73 136" fill="none" stroke="' + c.gloss + '" stroke-width="5" stroke-linecap="round" opacity="0.8"/>';
        break;
      case 'spots':
        inner += '<g fill="' + c.spot + '"><circle cx="64" cy="160" r="9"/><circle cx="136" cy="176" r="11"/><circle cx="118" cy="148" r="5"/><circle cx="78" cy="186" r="5"/></g>';
        break;
      case 'tuxedo':
        inner += '<path d="M100 120C118 130 128 150 124 172C121 190 110 199 100 199C90 199 79 190 76 172C72 150 82 130 100 120Z" fill="' + c.white + '"/>';
        break;
      case 'calico':
        inner += '<path d="M40 128C58 118 78 126 78 144C78 162 58 170 44 162Z" fill="' + c.orange + '"/>';
        inner += '<path d="M160 150C146 146 132 156 134 172C136 186 150 194 162 188Z" fill="' + c.black + '"/>';
        inner += '<path d="M150 124C140 126 134 134 138 142C142 148 152 146 158 140Z" fill="' + c.orange + '"/>';
        break;
      case 'stars':
        inner += '<g fill="' + c.star + '">' +
          '<path d="' + starPath(68, 160, 5.5, 0.45, 0.2) + '"/><path d="' + starPath(132, 170, 6, 0.45, -0.2) + '"/>' +
          '<path d="' + starPath(84, 184, 4, 0.45) + '"/><path d="' + starPath(122, 148, 3.5, 0.45) + '"/></g>';
        break;
      case 'fluffy':
        inner += '<path d="M70 132C74 146 80 150 84 144C86 154 94 158 100 150C106 158 114 154 116 144C120 150 126 146 130 132" fill="#FFFFFF" stroke="' + c.shade + '" stroke-width="2.5" stroke-linejoin="round"/>';
        break;
      case 'siamese':
        inner += '<ellipse cx="100" cy="199" rx="60" ry="14" fill="' + c.point + '" opacity="0.18"/>';
        break;
    }
    s += '<g clip-path="url(#' + gradId(c, 'bc') + ')">' + inner + '</g>';
    s += '<path d="' + body + '" fill="none" stroke="' + OUT + '" stroke-width="3"/>';
    if (c.ruff) {
      // Halskrause des Maine-Coon
      s += '<path d="M44 126C48 142 56 150 63 146C63 158 73 167 82 161C86 173 96 175 100 167C104 175 114 173 118 161C127 167 137 158 137 146C144 150 152 142 156 126Z" fill="' + c.ruff + '" stroke="' + OUT + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    return s;
  }

  function pawMarkup(c, x) {
    var col = c.paw;
    var s = '<ellipse cx="' + x + '" cy="190" rx="14" ry="10" fill="' + col + '" stroke="' + OUT + '" stroke-width="3"/>';
    s += '<path d="M' + (x - 4.5) + ' 192.5v5M' + (x + 4.5) + ' 192.5v5" stroke="' + OUT + '" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>';
    return s;
  }

  function earMarkup(c, right) {
    var s = '';
    var fill = c.pattern === 'siamese' ? 'url(#' + gradId(c, 'earpt') + ')' : 'url(#' + gradId(c, 'fur') + ')';
    if (c.pattern === 'calico') fill = right ? c.black : c.orange;
    if (c.pattern === 'spots' && right) fill = c.spot;
    s += '<path d="' + EAR + '" fill="' + fill + '" stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"/>';
    s += '<path d="' + EAR_IN + '" fill="' + c.earIn + '"/>';
    if (c.pattern === 'fluffy' || c.lynx) {
      // Fellbüschel im Ohr
      s += '<path d="M60 56C62 48 66 44 70 42M58 60C60 54 62 50 64 48" fill="none" stroke="' + (c.lynx ? c.belly : '#FFFFFF') + '" stroke-width="2.5" stroke-linecap="round"/>';
    }
    if (c.lynx) {
      // Luchspinsel an der Spitze
      s += '<path d="M51 16C50 8 52 1 57 -5C57 2 59 8 62 13Z" fill="' + U.darken(c.fur, 0.32) + '" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>';
    }
    var g = '<g class="cat-ear ' + (right ? 'cat-ear-r' : 'cat-ear-l') + '">' + s + '</g>';
    return right ? '<g transform="' + MIRROR + '">' + g + '</g>' : g;
  }

  function headPatternMarkup(c) {
    var s = '';
    switch (c.pattern) {
      case 'tabby':
      case 'tabbyM':
        s += '<g fill="' + c.stripe + '">';
        if (c.pattern === 'tabbyM') {
          s += '<path d="M84 60L89 45L100 55L111 45L116 60" fill="none" stroke="' + c.stripe + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
          s += '<path d="' + taper(100, 32, 100, 48, 7) + '"/>';
        } else {
          s += '<path d="' + taper(100, 32, 100, 56, 9) + '"/><path d="' + taper(84, 34, 88, 52, 8) + '"/><path d="' + taper(116, 34, 112, 52, 8) + '"/>';
        }
        s += '<path d="' + taper(30, 90, 52, 95, 8) + '"/><path d="' + taper(31, 104, 50, 106, 7) + '"/>';
        s += '<path d="' + taper(170, 90, 148, 95, 8) + '"/><path d="' + taper(169, 104, 150, 106, 7) + '"/>';
        s += '</g>';
        break;
      case 'gloss':
        s += '<path d="M58 60C66 49 78 43 90 41" fill="none" stroke="' + c.gloss + '" stroke-width="6" stroke-linecap="round" opacity="0.85"/>';
        s += '<path d="M97 40C101 39.5 105 39.7 108 40.5" fill="none" stroke="' + c.gloss + '" stroke-width="5" stroke-linecap="round" opacity="0.7"/>';
        break;
      case 'spots':
        s += '<g fill="' + c.spot + '"><circle cx="146" cy="52" r="20"/><circle cx="84" cy="50" r="6"/><circle cx="96" cy="42" r="3.5"/><circle cx="44" cy="112" r="7"/><circle cx="54" cy="124" r="3.5"/></g>';
        break;
      case 'tuxedo':
        s += '<path d="M100 88C110 98 128 106 132 122C136 138 120 142 100 142C80 142 64 138 68 122C72 106 90 98 100 88Z" fill="' + c.white + '"/>';
        break;
      case 'siamese':
        s += '<ellipse cx="100" cy="112" rx="36" ry="29" fill="url(#' + gradId(c, 'mask') + ')"/>';
        break;
      case 'calico':
        s += '<path d="M28 40C52 30 84 36 90 54C94 68 80 80 60 80C44 80 30 70 28 40Z" fill="' + c.orange + '"/>';
        s += '<path d="M172 34C150 28 122 36 118 50C116 60 130 66 146 64C160 62 170 52 172 34Z" fill="' + c.black + '"/>';
        s += '<path d="M150 118C158 112 170 114 172 124L166 140C156 138 148 128 150 118Z" fill="' + c.orange + '"/>';
        break;
      case 'stars':
        s += '<g fill="' + c.star + '">' +
          '<path d="' + starPath(64, 58, 6, 0.45, -0.3) + '"/><path d="' + starPath(136, 52, 5, 0.45, 0.2) + '"/>' +
          '<path d="' + starPath(100, 46, 4, 0.45) + '"/><path d="' + starPath(46, 110, 4.5, 0.45, 0.4) + '"/>' +
          '<path d="' + starPath(154, 108, 4, 0.45, -0.1) + '"/><path d="' + starPath(118, 62, 2.8, 0.45) + '"/><path d="' + starPath(80, 62, 2.6, 0.45) + '"/></g>';
        break;
      case 'heart':
        s += '<path d="' + heartPath(100, 52, 17) + '" fill="#FFFFFF"/>';
        break;
      case 'fluffy':
        s += '<path d="M60 48C70 42 80 40 88 40" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>';
        break;
    }
    return s;
  }

  function tuftsMarkup(c) {
    // Wangenbüschel (Flocke, Wuschel): gezackte Fellspitzen hinter dem Kopf
    var col = c.pattern === 'fluffy' ? '#FFFFFF' : c.fur;
    var left = c.lynx ? 'M40 100Q28 102 32 109Q24 114 33 119Q28 127 40 127Q44 135 54 136Z'
      : 'M40 104Q31 106 34 112Q28 117 35 121Q32 128 42 128Q46 134 54 135Z';
    var s = '<path d="' + left + '" fill="' + col + '" stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"/>';
    s += '<path d="' + left + '" transform="' + MIRROR + '" fill="' + col + '" stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"/>';
    return s;
  }

  function eyeMarkup(c, x) {
    var iris = 'url(#' + gradId(c, 'iris') + ')';
    var s = '<g transform="translate(' + x + ' 95)">';
    s += '<g class="eye-open">';
    s += '<ellipse rx="15" ry="17" fill="' + iris + '"/>';
    s += '<g clip-path="url(#ks-eyeclip)"><g class="cat-look">' +
      '<ellipse cx="0" cy="1.5" rx="10.5" ry="12.5" fill="#2A1F33"/>' +
      '<ellipse cx="-4.8" cy="-5.6" rx="5.4" ry="5.8" fill="#FFFFFF"/>' +
      '<circle cx="5" cy="6.5" r="2.6" fill="#FFFFFF"/>' +
      '</g></g>';
    s += '<ellipse rx="15" ry="17" fill="none" stroke="' + OUT + '" stroke-width="3"/>';
    s += '</g>';
    var hc = c.dark ? '#F4ECFA' : OUT;
    s += '<path class="eye-happy" d="M-11 4Q0 -10 11 4" fill="none" stroke="' + hc + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<path class="eye-closed" d="M-11 1Q0 9 11 1" fill="none" stroke="' + hc + '" stroke-width="4" stroke-linecap="round"/>';
    s += '</g>';
    return s;
  }

  function faceMarkup(c) {
    var s = '';
    var line = c.dark && !c.muzzleLight ? '#EDE3F5' : OUT;
    // Schnauze
    if (c.muzzle) {
      s += '<g fill="' + c.muzzle + '"><ellipse cx="91" cy="118" rx="12" ry="9.5"/><ellipse cx="109" cy="118" rx="12" ry="9.5"/></g>';
    }
    // Wangenröte
    s += '<g class="cat-blush"><ellipse cx="60" cy="114" rx="13" ry="8" fill="url(#ks-blush)"/><ellipse cx="140" cy="114" rx="13" ry="8" fill="url(#ks-blush)"/></g>';
    s += '<g class="cat-eyes">' + eyeMarkup(c, 76) + eyeMarkup(c, 124) + '</g>';
    // Nase
    s += '<path class="cat-nose" d="M93.5 108.5C96 106.5 104 106.5 106.5 108.5C107.5 110 103 114.5 100 114.5C97 114.5 92.5 110 93.5 108.5Z" fill="#FF8FAE" stroke="' + OUT + '" stroke-width="2" stroke-linejoin="round"/>';
    s += '<ellipse cx="98" cy="108.8" rx="2" ry="1" fill="#FFFFFF" opacity="0.8"/>';
    var mc = c.pattern === 'tuxedo' || c.muzzle ? OUT : line;
    if (c.dark && c.pattern !== 'tuxedo') mc = '#EDE3F5';
    // Mund: geschlossen (ω), offen (Miau), rund (überrascht)
    s += '<path class="mouth-closed" d="M100 114.5V117.5M90.5 116.5C92.5 121 98 121.5 100 117.5C102 121.5 107.5 121 109.5 116.5" fill="none" stroke="' + mc + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<g class="mouth-open"><path d="M91 117C94 115 106 115 109 117C110 125 106 131 100 131C94 131 90 125 91 117Z" fill="#8E3B5A" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<ellipse cx="100" cy="127" rx="5.5" ry="3.4" fill="#FF8FAE"/></g>';
    s += '<ellipse class="mouth-o" cx="100" cy="121" rx="4.2" ry="5" fill="#8E3B5A" stroke="' + OUT + '" stroke-width="2.2"/>';
    // Schnurrhaare
    var wc = c.dark ? '#EDE3F5' : OUT;
    var w = 'M56 110C46 107 36 106 24 107M56 116C46 116 36 117 25 119M58 122C48 124 40 127 30 131';
    s += '<g class="cat-whiskers" fill="none" stroke="' + wc + '" stroke-width="2" stroke-linecap="round" opacity="0.7"><path d="' + w + '"/><path d="' + w + '" transform="' + MIRROR + '"/></g>';
    return s;
  }

  /* ---------- Accessoires ---------- */

  function accNeck(c) {
    switch (c.acc) {
      case 'bell':
        return '<path d="M62 134C80 146 120 146 138 134L140 142C120 155 80 155 60 142Z" fill="#4A90E2" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<g><circle cx="100" cy="156" r="8.5" fill="url(#ks-gold)" stroke="' + OUT + '" stroke-width="2.4"/>' +
          '<path d="M93 155H107M100 158V163" stroke="' + OUT + '" stroke-width="2" stroke-linecap="round"/><circle cx="97" cy="153" r="1.8" fill="#FFF8D6"/></g>';
      case 'scarf':
        return '<path d="M64 134C80 144 120 144 136 134L132 146C122 160 112 172 100 180C88 172 78 160 68 146Z" fill="#4CAF6A" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<g fill="#FFFFFF"><circle cx="86" cy="150" r="2.6"/><circle cx="100" cy="158" r="2.6"/><circle cx="114" cy="150" r="2.6"/><circle cx="100" cy="170" r="2.2"/><circle cx="92" cy="162" r="1.8"/><circle cx="108" cy="162" r="1.8"/></g>';
      case 'stripescarf':
        return '<path d="M58 132C78 146 122 146 142 132L144 144C122 160 78 160 56 144Z" fill="#E8434F" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M72 141L68 151M88 145L86 155M104 146L104 156M120 144L122 154M134 139L138 149" stroke="#FFFFFF" stroke-width="5"/>' +
          '<path d="M122 148L128 180L144 176L136 146Z" fill="#E8434F" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M124 158L139 155M126 168L141 165" stroke="#FFFFFF" stroke-width="4.5"/>' +
          '<path d="M128 180L127 186M133 179L133 185M138 178L139 184M143 177L145 182" stroke="#E8434F" stroke-width="2.4" stroke-linecap="round"/>';
    }
    return '';
  }

  function accHead(c) {
    switch (c.acc) {
      case 'bow':
        return '<g transform="translate(62 50) rotate(-24)">' +
          '<path d="M0 0C-8 -14 -26 -14 -24 0C-26 14 -8 14 0 0Z" fill="#E8434F" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M0 0C8 -14 26 -14 24 0C26 14 8 14 0 0Z" fill="#E8434F" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<g fill="#FFFFFF"><circle cx="-15" cy="-4" r="2.2"/><circle cx="-11" cy="5" r="1.8"/><circle cx="15" cy="-4" r="2.2"/><circle cx="12" cy="5" r="1.8"/><circle cx="-19" cy="3" r="1.4"/><circle cx="19" cy="3" r="1.4"/></g>' +
          '<ellipse cx="0" cy="0" rx="5.5" ry="6.5" fill="#D12F3E" stroke="' + OUT + '" stroke-width="2.4"/></g>';
      case 'wreath':
        var fl = '';
        var spots = [[46, 62, 1], [58, 48, 0], [74, 40, 1], [100, 36, 0], [126, 40, 1], [142, 48, 0], [154, 62, 1]];
        var leaves = [[52, 56, -50], [66, 44, -30], [88, 37, -10], [112, 37, 10], [134, 44, 30], [148, 56, 50]];
        leaves.forEach(function (p) {
          fl += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="7" ry="3.6" transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')" fill="#7CCB6E" stroke="' + OUT + '" stroke-width="1.8"/>';
        });
        spots.forEach(function (p) {
          var col = p[2] ? '#FF9EC4' : '#FFFFFF';
          var petals = '';
          for (var i = 0; i < 5; i++) {
            var a = (i * 72 - 90) * Math.PI / 180;
            petals += '<circle cx="' + n(p[0] + Math.cos(a) * 5.2) + '" cy="' + n(p[1] + Math.sin(a) * 5.2) + '" r="4.4"/>';
          }
          fl += '<g fill="' + col + '" stroke="' + OUT + '" stroke-width="1.8">' + petals + '</g><circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#FFD24A" stroke="' + OUT + '" stroke-width="1.5"/>';
        });
        return fl;
      case 'partyhat':
        return '<g transform="rotate(12 100 40)">' +
          '<path d="M80 44L103 -6L124 44C112 50 92 50 80 44Z" fill="#FFD24A" stroke="' + OUT + '" stroke-width="2.8" stroke-linejoin="round"/>' +
          '<g fill="#FF6F91"><circle cx="96" cy="34" r="3.4"/><circle cx="110" cy="26" r="3"/><circle cx="102" cy="14" r="2.6"/><circle cx="114" cy="40" r="2.8"/><circle cx="90" cy="44" r="2.2"/></g>' +
          '<path d="M80 44C92 50 112 50 124 44" fill="none" stroke="#FF6F91" stroke-width="4" stroke-linecap="round"/>' +
          '<circle cx="103" cy="-8" r="7.5" fill="#FF6F91" stroke="' + OUT + '" stroke-width="2.6"/><circle cx="100.5" cy="-10.5" r="2.4" fill="#FFC2D2"/></g>';
      case 'bowtie':
        return '<g transform="translate(100 146)">' +
          '<path d="M0 0L-19 -10C-24 -6 -24 6 -19 10Z" fill="#E8434F" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M0 0L19 -10C24 -6 24 6 19 10Z" fill="#E8434F" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<rect x="-5.5" y="-6" width="11" height="12" rx="4" fill="#D12F3E" stroke="' + OUT + '" stroke-width="2.4"/></g>';
      case 'beanie':
        return '<path d="M48 64C46 34 70 18 100 18C130 18 154 34 152 64Z" fill="#3CC7C0" stroke="' + OUT + '" stroke-width="2.8" stroke-linejoin="round"/>' +
          '<path d="M74 24C70 34 68 48 68 60M100 19V60M126 24C130 34 132 48 132 60" fill="none" stroke="#2BA9A3" stroke-width="3" stroke-linecap="round"/>' +
          '<rect x="44" y="56" width="112" height="16" rx="8" fill="#5ED8D1" stroke="' + OUT + '" stroke-width="2.8"/>' +
          '<path d="M56 59V69M66 59V69M76 59V69M86 59V69M96 59V69M106 59V69M116 59V69M126 59V69M136 59V69M146 59V69" stroke="#3CC7C0" stroke-width="2.4" stroke-linecap="round"/>' +
          '<circle cx="100" cy="14" r="11" fill="#FFFFFF" stroke="' + OUT + '" stroke-width="2.8"/><path d="M95 10C97 8 100 8 102 9" stroke="#E3E9F3" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      case 'sunflower':
        var pet = '';
        for (var i = 0; i < 12; i++) {
          pet += '<ellipse cx="0" cy="-12" rx="4.6" ry="8.5" transform="rotate(' + i * 30 + ')"/>';
        }
        return '<g transform="translate(146 50) rotate(15) scale(0.9)"><g fill="#FFCF33" stroke="' + OUT + '" stroke-width="1.8">' + pet + '</g>' +
          '<circle r="7.5" fill="#8A5A2B" stroke="' + OUT + '" stroke-width="2"/><g fill="#5E3B19"><circle cx="-2.5" cy="-2" r="1.2"/><circle cx="2.5" cy="-1" r="1.2"/><circle cx="0" cy="2.8" r="1.2"/></g></g>';
      case 'strawberry':
        return '<path d="M44 66C40 40 66 20 100 20C134 20 160 40 156 66C140 58 60 58 44 66Z" fill="#F2545B" stroke="' + OUT + '" stroke-width="2.8" stroke-linejoin="round"/>' +
          '<g fill="#FFE066"><ellipse cx="64" cy="50" rx="2" ry="3"/><ellipse cx="80" cy="38" rx="2" ry="3"/><ellipse cx="100" cy="46" rx="2" ry="3"/><ellipse cx="120" cy="38" rx="2" ry="3"/><ellipse cx="136" cy="50" rx="2" ry="3"/><ellipse cx="88" cy="54" rx="2" ry="3"/><ellipse cx="112" cy="54" rx="2" ry="3"/><ellipse cx="100" cy="30" rx="2" ry="3"/></g>' +
          '<path d="M100 26L86 16L94 26L78 26L92 30L86 38L100 30L114 38L108 30L122 26L106 26L114 16Z" fill="#6CC070" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M100 22C100 14 102 10 106 7" fill="none" stroke="#4F9A4B" stroke-width="4" stroke-linecap="round"/>';
      case 'crown':
        return '<g transform="rotate(-8 100 40)">' +
          '<path d="M76 46L72 18L88 32L100 12L112 32L128 18L124 46Z" fill="url(#ks-gold)" stroke="' + OUT + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<rect x="75" y="40" width="50" height="9" rx="3" fill="#FFC21F" stroke="' + OUT + '" stroke-width="2.4"/>' +
          '<circle cx="88" cy="44.5" r="2.8" fill="#FF6F91"/><circle cx="100" cy="44.5" r="3" fill="#5AB9EA"/><circle cx="112" cy="44.5" r="2.8" fill="#3CCFA0"/>' +
          '<circle cx="72" cy="17" r="3" fill="#FF6F91" stroke="' + OUT + '" stroke-width="1.8"/><circle cx="100" cy="11" r="3.4" fill="#B89CFF" stroke="' + OUT + '" stroke-width="1.8"/><circle cx="128" cy="17" r="3" fill="#5AB9EA" stroke="' + OUT + '" stroke-width="1.8"/></g>';
      case 'butterfly':
        return '<g transform="translate(58 52) rotate(-20)">' +
          '<path d="M0 0C-6 -16 -24 -18 -22 -4C-20 4 -8 4 0 0Z" fill="#B89CFF" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M0 0C6 -16 24 -18 22 -4C20 4 8 4 0 0Z" fill="#B89CFF" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M0 1C-4 8 -16 14 -14 6C-12 2 -6 2 0 1Z" fill="#D7C6FF" stroke="' + OUT + '" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M0 1C4 8 16 14 14 6C12 2 6 2 0 1Z" fill="#D7C6FF" stroke="' + OUT + '" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<circle cx="-12" cy="-7" r="3" fill="#FFFFFF" opacity="0.8"/><circle cx="12" cy="-7" r="3" fill="#FFFFFF" opacity="0.8"/>' +
          '<rect x="-2.5" y="-9" width="5" height="16" rx="2.5" fill="#7B5BB8" stroke="' + OUT + '" stroke-width="1.8"/></g>';
    }
    return '';
  }

  var ZZZ = '<g class="cat-zzz" fill="none" stroke="' + OUT + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
    '<g class="z z1"><path d="M146 50h8l-8 10h8" stroke="#FFFFFF" stroke-width="7"/><path d="M146 50h8l-8 10h8"/></g>' +
    '<g class="z z2"><path d="M158 32h10l-10 12h10" stroke="#FFFFFF" stroke-width="7"/><path d="M158 32h10l-10 12h10"/></g>' +
    '<g class="z z3"><path d="M172 12h12l-12 14h12" stroke="#FFFFFF" stroke-width="7"/><path d="M172 12h12l-12 14h12"/></g></g>';

  /** Komplettes Markup einer Katze (Gruppe im 200×200-Raum) */
  function catMarkup(id) {
    var c = KS.Cats.byId[id];
    if (!c) throw new Error('Unbekannte Katze: ' + id);
    var head = c.round ? HEAD_ROUND : c.big ? HEAD_BIG : HEAD;
    var s = '<g class="cat cat-' + c.id + '" data-cat="' + c.id + '"><g class="cat-inner">';
    s += '<g class="cat-tail">' + tailMarkup(c) + '</g>';
    s += '<g class="cat-bodygrp">' + bodyMarkup(c) + accNeck(c) + '</g>';
    s += '<g class="cat-paw cat-paw-l">' + pawMarkup(c, 80) + '</g>';
    s += '<g class="cat-paw cat-paw-r">' + pawMarkup(c, 120) + '</g>';
    // Winke-Arm (nur im Zustand „wave“ sichtbar)
    s += '<g class="cat-arm"><g class="cat-arm-inner">' +
      '<path d="M72 168L56 128" stroke="' + OUT + '" stroke-width="21" stroke-linecap="round"/>' +
      '<path d="M72 168L56 128" stroke="' + (c.pattern === 'siamese' ? c.point : c.fur) + '" stroke-width="15" stroke-linecap="round"/>' +
      '<ellipse cx="54" cy="122" rx="12" ry="10" fill="' + c.paw + '" stroke="' + OUT + '" stroke-width="3"/>' +
      '<path d="M50 120v-5M58 120v-5" stroke="' + OUT + '" stroke-width="2" stroke-linecap="round" opacity="0.7"/></g></g>';
    s += '<g class="cat-head">';
    s += earMarkup(c, false) + earMarkup(c, true);
    if (c.tufts || c.lynx) s += tuftsMarkup(c);
    s += '<path class="cat-headshape" d="' + head + '" fill="url(#' + gradId(c, 'fur') + ')"/>';
    s += '<g clip-path="url(#' + gradId(c, 'hc') + ')">' + headPatternMarkup(c) + '</g>';
    s += '<path d="' + head + '" fill="none" stroke="' + OUT + '" stroke-width="3"/>';
    s += faceMarkup(c);
    s += accHead(c);
    s += '</g>';
    s += ZZZ;
    s += '</g></g>';
    return s;
  }

  KS.CatArt = {
    ensureDefs: ensureDefs,
    markup: catMarkup,
    defsMarkup: defsMarkup,
    heartPath: heartPath,
    starPath: starPath,
    taper: taper,
    OUT: OUT,
    /** Eigenständiges <svg> mit einer Katze (Titel, Spielzimmer, Galerie) */
    svg: function (id, cls) {
      ensureDefs();
      var s = root.document.createElementNS(U.SVGNS, 'svg');
      s.setAttribute('viewBox', '0 0 200 200');
      s.setAttribute('class', 'cat-svg' + (cls ? ' ' + cls : ''));
      s.setAttribute('overflow', 'visible');
      s.innerHTML = catMarkup(id);
      return s;
    },
  };

  /* =====================================================================
     KS.CatView – Leben einer Katze (Konzept 5.4, 6.1)
     ===================================================================== */

  var views = [];
  var pointer = { x: -1e4, y: -1e4, t: 0, down: false, type: 'mouse', moved: 0 };
  var unFrame = null;
  var nextAmbientLook = 0;

  function nowMs() { return root.performance && root.performance.now ? root.performance.now() : Date.now(); }

  function onPointer(e) {
    var px = e.clientX, py = e.clientY;
    var dx = px - pointer.x, dy = py - pointer.y;
    var jump = pointer.t === 0 || Math.abs(dx) > 200 || Math.abs(dy) > 200;
    pointer.x = px;
    pointer.y = py;
    pointer.type = e.pointerType || 'mouse';
    pointer.t = nowMs();
    if (e.type === 'pointerdown') pointer.down = true;
    else if (e.type === 'pointerup' || e.type === 'pointercancel') pointer.down = false;
    if ((e.type === 'pointermove' && !jump) || e.type === 'pointerdown') {
      var d = e.type === 'pointerdown' ? 0 : Math.sqrt(dx * dx + dy * dy);
      // Nur die Katze, die an dieser Stelle wirklich oben liegt (nicht durch Dialoge hindurch)
      var hit = null;
      try { hit = root.document.elementFromPoint(px, py); } catch (err) { hit = null; }
      for (var i = 0; i < views.length; i++) views[i]._stroke(px, py, d, hit);
    }
  }

  function installGlobal() {
    if (installGlobal.done || !root.addEventListener) return;
    installGlobal.done = true;
    ['pointermove', 'pointerdown', 'pointerup', 'pointercancel'].forEach(function (t) {
      root.addEventListener(t, onPointer, { passive: true, capture: true });
    });
    root.addEventListener('resize', function () { KS.CatView.invalidate(); });
    root.addEventListener('scroll', function () { KS.CatView.invalidate(); }, true);
  }

  function frame(dt) {
    var t = nowMs();
    // Blickziel ohne Eingabe: umherschauen oder zu einer anderen Katze
    var idle = t - pointer.t > 3000;
    if (idle && t > nextAmbientLook) {
      nextAmbientLook = t + 1500 + Math.random() * 2500;
      for (var k = 0; k < views.length; k++) views[k]._pickIdleLook();
    }
    for (var i = 0; i < views.length; i++) views[i]._tick(t, dt, idle);
  }

  function CatView(catEl, opts) {
    opts = opts || {};
    this.el = catEl;
    this.id = catEl.getAttribute('data-cat');
    this.data = KS.Cats.byId[this.id];
    this.headEl = catEl.querySelector('.cat-headshape');
    this.host = opts && opts.host ? opts.host : catEl.ownerSVGElement || catEl;
    this.looks = Array.prototype.slice.call(catEl.querySelectorAll('.cat-look'));
    this.timers = new U.Timers();
    this.opts = opts;
    this.active = opts.active !== false;
    this.energy = 0;
    this.purring = false;
    this.purrSound = null;
    this.sleeping = false;
    this.rect = null;
    this.rectT = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.idleTarget = null;
    this.hoverSince = 0;
    this.lastHeart = 0;
    this.taps = [];
    this.busyUntil = 0;
    var t = nowMs();
    this.nextBlink = t + 800 + Math.random() * 4000;
    this.nextEar = t + 3000 + Math.random() * 8000;
    this.nextYawn = t + 40000 + Math.random() * 60000;
    this.nextWag = t + Math.random() * 3000;
    this.wagging = false;
    this.el.style.setProperty('--tail-dur', (3.6 - (this.data.tail || 6) * 0.25).toFixed(2) + 's');
    views.push(this);
    installGlobal();
    if (!unFrame) unFrame = U.onFrame(frame);
  }

  CatView.prototype = {
    setActive: function (on) {
      this.active = !!on;
      this.rect = null;
      if (!on) this._stopPurr(true);
    },

    /** Bildschirmrechteck des Kopfes (zwischengespeichert) */
    headRect: function () {
      var t = nowMs();
      if (!this.rect || t - this.rectT > 400) {
        var r = this.headEl.getBoundingClientRect();
        this.rect = { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        this.rectT = t;
      }
      return this.rect;
    },

    has: function (cls) { return this.el.classList.contains('is-' + cls); },
    add: function (cls) { this.el.classList.add('is-' + cls); },
    remove: function (cls) { this.el.classList.remove('is-' + cls); },
    /** Zustand für ms Millisekunden */
    flash: function (cls, ms) {
      var el = this.el;
      var key = '_t_' + cls;
      if (this[key]) clearTimeout(this[key]);
      if (el.classList.contains('is-' + cls)) {
        el.classList.remove('is-' + cls);
        el.getBoundingClientRect();
      }
      el.classList.add('is-' + cls);
      var self = this;
      this[key] = setTimeout(function () { el.classList.remove('is-' + cls); self[key] = 0; }, ms);
    },

    blink: function (twice) {
      var self = this;
      this.flash('blink', 120);
      if (twice) this.timers.after(260, function () { self.flash('blink', 120); });
    },

    /** Miau mit eigener Stimme. kind: Variante oder leer (passend zur Katze) */
    meow: function (kind, opts) {
      var dur = 0.7;
      if (KS.Audio && KS.Audio.meow) {
        var d = KS.Audio.meow(this.data, kind, opts);
        if (d) dur = d;
      }
      this.flash('meow', Math.round(dur * 1000));
      return dur;
    },

    /** Antippen: Miau und zufällige Reaktion; drei Tipps in unter 1 s = Kitzeln */
    tap: function () {
      var t = nowMs();
      if (this.sleeping) {
        this.wake(true);
        return 'wake';
      }
      this.taps = this.taps.filter(function (x) { return t - x < 1000; });
      this.taps.push(t);
      if (this.taps.length >= 3) {
        this.taps = [];
        this.tickle();
        return 'tickle';
      }
      this.meow();
      var r = Math.floor(Math.random() * 5);
      if (r === 0) {
        this.el.style.setProperty('--tilt', (Math.random() < 0.5 ? -10 : 10) + 'deg');
        this.flash('tilt', 700);
      } else if (r === 1) {
        this.flash(Math.random() < 0.5 ? 'twitch-l' : 'twitch-r', 420);
      } else if (r === 2) {
        this.flash('wave', 1300);
      } else if (r === 3) {
        this.flash('hop', 460);
        if (KS.Audio) KS.Audio.sfx('boing', { pitch: 1.3, vol: 0.4 });
      } else {
        this.blink(true);
      }
      return 'tap';
    },

    tickle: function () {
      this.flash('spin', 960);
      this.flash('happy', 1300);
      if (KS.Audio && KS.Audio.meow) {
        var d = KS.Audio.meow(this.data, 'mrrp', { pitch: 1.12 });
        this.flash('meow', Math.round((d || 0.5) * 1000));
        KS.Audio.sfx('sparkle', { vol: 0.5 });
      }
      var r = this.headRect();
      if (KS.FX) KS.FX.sparkle(r.cx, r.cy, 18);
    },

    jump: function () {
      this.flash('jump', 740);
      this.flash('happy', 1400);
    },

    surprised: function (ms) { this.flash('surprised', ms || 380); },

    sleep: function () {
      if (this.sleeping) return;
      this.sleeping = true;
      this._stopPurr(true);
      this.add('sleep');
    },

    wake: function (withMeow) {
      if (!this.sleeping) return;
      this.sleeping = false;
      this.remove('sleep');
      var self = this;
      this.flash('stretch', 1100);
      this.flash('yawn', 900);
      if (KS.Audio) KS.Audio.sfx('yawn', { vol: 0.35, pitch: 700 / (this.data.voice.f0 || 700) });
      if (withMeow !== false) this.timers.after(950, function () { self.meow(); });
    },

    /** Blick auf einen Bildschirmpunkt (oder null = geradeaus) */
    lookAt: function (x, y) {
      var r = this.headRect();
      var ox = 0, oy = 0;
      if (x !== null && x !== undefined) {
        var ex = r.cx, ey = r.y + r.h * 0.57;
        var dx = x - ex, dy = y - ey;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1) {
          var k = Math.min(1, d / (r.w * 1.2)) * 4.6;
          ox = (dx / d) * k;
          oy = (dy / d) * k * 0.85;
        }
      }
      this._setLook(ox, oy);
    },

    _setLook: function (ox, oy) {
      if (Math.abs(ox - this.lookX) < 0.15 && Math.abs(oy - this.lookY) < 0.15) return;
      this.lookX = ox;
      this.lookY = oy;
      var tf = 'translate(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px)';
      for (var i = 0; i < this.looks.length; i++) this.looks[i].style.transform = tf;
    },

    _pickIdleLook: function () {
      if (!this.active) return;
      var others = views.filter(function (v) { return v.active && v !== this; }, this);
      var rr = Math.random();
      if (rr < 0.3 && others.length) {
        var o = others[Math.floor(Math.random() * others.length)];
        var orr = o.headRect();
        this.idleTarget = { x: orr.cx, y: orr.cy };
      } else if (rr < 0.55) {
        this.idleTarget = null; // geradeaus
      } else {
        var r = this.headRect();
        var a = Math.random() * Math.PI * 2;
        this.idleTarget = { x: r.cx + Math.cos(a) * r.w * 2, y: r.cy + Math.sin(a) * r.h * 1.4 };
      }
    },

    /** Zeigerbewegung: Streichelenergie sammeln (Konzept 6.1) */
    _stroke: function (x, y, d, hit) {
      if (!this.active || this.sleeping) return;
      if (hit && !this.host.contains(hit)) {
        this.hoverSince = 0;
        return;
      }
      var r = this.headRect();
      var nx = (x - r.cx) / (r.w * 0.5), ny = (y - r.cy) / (r.h * 0.5);
      var inside = nx * nx + ny * ny <= 1;
      var t = nowMs();
      var counts = inside && (pointer.type === 'mouse' || pointer.down);
      if (!counts) {
        this.hoverSince = 0;
        return;
      }
      if (!this.hoverSince) this.hoverSince = t;
      if (t - this.hoverSince < 300) return; // kurzes Überfahren zählt nicht
      if (d > 0.5 && CatView.onActivity) CatView.onActivity(this);
      // Energie relativ zur Kopfgröße, damit es auf jedem Bildschirm gleich viel Streicheln braucht
      this.energy = Math.min(3, this.energy + (d / Math.max(40, r.w)) * 0.8);
      if (d > 0.5) this.lastStroke = t;
    },

    _tick: function (t, dt, idle) {
      if (!this.active) return;
      // Blick
      if (this.lookTarget && Date.now() > this.lookTarget.until) this.lookTarget = null;
      if (!this.sleeping) {
        if (this.lookTarget) this.lookAt(this.lookTarget.x, this.lookTarget.y);
        else if (!idle) this.lookAt(pointer.x, pointer.y);
        else if (this.idleTarget) this.lookAt(this.idleTarget.x, this.idleTarget.y);
        else this._setLook(0, 0);
      }
      // Blinzeln
      if (t > this.nextBlink && !this.sleeping) {
        this.blink(Math.random() < 0.2);
        this.nextBlink = t + 2000 + Math.random() * 4000;
      }
      // Ohrzucken, selten Gähnen
      if (t > this.nextEar && !this.sleeping) {
        this.flash(Math.random() < 0.5 ? 'twitch-l' : 'twitch-r', 420);
        this.nextEar = t + 4000 + Math.random() * 9000;
      }
      // Schwanzwedeln in Schüben (natürlicher und spart Zeichenarbeit)
      if (t > this.nextWag) {
        this.wagging = !this.wagging;
        this.el.classList.toggle('is-wag', this.wagging);
        this.nextWag = t + (this.wagging ? 2500 + Math.random() * 3000 : 4000 + Math.random() * 7000);
      }
      if (t > this.nextYawn && !this.sleeping && !this.purring) {
        this.flash('yawn', 900);
        this.nextYawn = t + 45000 + Math.random() * 60000;
      }
      // Streicheln: Energie zerfällt; hört das Streicheln auf, klingt das Schnurren aus
      if (this.energy > 0) {
        this.energy = Math.max(0, this.energy - dt * 0.7);
        if (!this.purring && this.energy > 1) this._startPurr();
        if (this.purring) {
          if (this.purrSound) this.purrSound.set(Math.min(1, (this.energy - 0.3) / 1.8));
          if (t - this.lastHeart > 250 && KS.FX) {
            this.lastHeart = t;
            var r = this.headRect();
            KS.FX.heart(r.cx + (Math.random() - 0.5) * r.w * 0.6, r.y + r.h * 0.15, { size: 0.5 + Math.random() * 0.35 });
          }
          if (this.energy < 0.35 || t - (this.lastStroke || 0) > 350) this._stopPurr(false);
        }
      }
    },

    _startPurr: function () {
      this.purring = true;
      this.add('purr');
      if (KS.Audio && KS.Audio.purr) this.purrSound = KS.Audio.purr(this.data);
      if (this.opts.onPurr) this.opts.onPurr(this);
    },

    _stopPurr: function (quick) {
      if (!this.purring) return;
      this.purring = false;
      this.energy = 0;
      if (this.purrSound) {
        this.purrSound.stop(quick ? 0.15 : 0.8);
        this.purrSound = null;
      }
      this.remove('purr');
      if (!quick) {
        // zufriedenes Blinzeln
        this.flash('happy', 700);
        var self = this;
        this.timers.after(760, function () { self.blink(true); });
      }
    },

    destroy: function () {
      this._stopPurr(true);
      this.timers.clear();
      var i = views.indexOf(this);
      if (i >= 0) views.splice(i, 1);
      if (!views.length && unFrame) {
        unFrame();
        unFrame = null;
      }
    },
  };

  CatView.invalidate = function () {
    for (var i = 0; i < views.length; i++) views[i].rect = null;
  };
  CatView.all = function () { return views.slice(); };
  CatView.pointer = pointer;
  /** Alle Katzen auf einmal aufräumen (z. B. beim Bildschirmwechsel) */
  CatView.destroyAll = function (filterFn) {
    views.slice().forEach(function (v) { if (!filterFn || filterFn(v)) v.destroy(); });
  };

  KS.CatView = CatView;
})(typeof window !== 'undefined' ? window : globalThis);

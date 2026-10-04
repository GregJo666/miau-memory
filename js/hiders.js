/* Miau-Memory – KS.Hiders: die sieben Verstecke (Konzept 7.2, 7.3) und KS.Card (ein Platz auf dem Spielfeld).
   Karte: inline-SVG viewBox 0 0 200 230, Ebenen von hinten nach vorn:
   Schatten → Rückseite (Innenraum, hintere Abdeckung) → Katzen-Ebene (clip bis clipY) → Vorderseite → Pfoten → vordere Abdeckung */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;
  var OUT = '#4B3A5A';
  var SW = 'stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"';

  var CAT_SCALE = 0.78;
  var CAT_X = 22;
  var CAT_TOP = 3;

  function n(v) { return Math.round(v * 10) / 10; }

  function pawPrint(x, y, s, col) {
    var k = s || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')" fill="' + col + '">' +
      '<ellipse cx="0" cy="4" rx="7" ry="6"/><ellipse cx="-7.5" cy="-4" rx="2.8" ry="3.4"/><ellipse cx="-2.6" cy="-8.5" rx="2.8" ry="3.6"/>' +
      '<ellipse cx="2.6" cy="-8.5" rx="2.8" ry="3.6"/><ellipse cx="7.5" cy="-4" rx="2.8" ry="3.4"/></g>';
  }

  function heart(cx, cy, s, fill) {
    return '<path d="' + KS.CatArt.heartPath(cx, cy, s) + '" fill="' + fill + '"/>';
  }

  /* =====================================================================
     Verstecktypen
     ===================================================================== */

  var T = {};

  /* ---------- Karton ---------- */
  T.box = {
    name: 'Karton', rimY: 128, clipY: 222, sound: 'flap', sticker: [134, 186], paws: [84, 116],
    frontShape: '<rect x="28" y="120" width="144" height="102"/>',
    variants: [
      { id: 'light', front: '#E8B77F', side: '#D29F66', flap: '#F0C792', flapIn: '#D9A46B', inside: '#7C4F2B', wall: '#A8743F', tape: '#F7DFAE', stamp: '#B77D45' },
      { id: 'dark', front: '#C98F57', side: '#B27B45', flap: '#D69C61', flapIn: '#B98043', inside: '#5E3A1E', wall: '#8A5A2F', tape: '#EFD39C', stamp: '#8E5A2C' },
    ],
    back: function (v) {
      return '<path d="M28 128L38 110H162L172 128Z" fill="' + v.inside + '" ' + SW + '/>' +
        '<path d="M40 112H160L166 124H34Z" fill="' + v.wall + '" opacity="0.55"/>' +
        '<g class="h-cov h-flap-l"><path d="M28 128L38 110H100V128Z" fill="' + v.flap + '" ' + SW + '/>' +
        '<path d="M88 110H100V128H86Z" fill="' + v.tape + '" opacity="0.85"/></g>' +
        '<g class="h-cov h-flap-r"><path d="M172 128L162 110H100V128Z" fill="' + v.flap + '" ' + SW + '/>' +
        '<path d="M112 110H100V128H114Z" fill="' + v.tape + '" opacity="0.85"/></g>';
    },
    front: function (v) {
      return '<path d="M28 128H172V213Q172 222 163 222H37Q28 222 28 213Z" fill="' + v.front + '"/>' +
        '<path d="M150 128H172V213Q172 222 163 222H150Z" fill="' + v.side + '" opacity="0.7"/>' +
        '<path d="M28 128H172V137H28Z" fill="#FFFFFF" opacity="0.18"/>' +
        '<path d="M86 128H114V156H86Z" fill="' + v.tape + '" opacity="0.85"/>' +
        '<path d="M86 156L90 153L94 157L98 153L102 157L106 153L110 157L114 154V156H86Z" fill="' + v.tape + '" opacity="0.85"/>' +
        pawPrint(62, 190, 1.35, v.stamp) +
        '<path d="M28 128H172V213Q172 222 163 222H37Q28 222 28 213Z" fill="none" ' + SW + '/>';
    },
  };

  /* ---------- Blumentopf ---------- */
  T.pot = {
    name: 'Blumentopf', rimY: 126, clipY: 222, sound: 'rustle', sticker: [100, 190], paws: [84, 116],
    frontShape: '<path d="M17 124H183V148H170L158 214Q156 222 147 222H53Q44 222 42 214L30 148H17Z"/>',
    variants: [
      { id: 'dots', pot: '#DE7E50', rim: '#E99468', dark: '#C0643A', decor: 'dots', paint: '#FFF4E0', leaf: '#6CC070', leafDark: '#4E9E52', flower: '#FF6F91' },
      { id: 'hearts', pot: '#D9744A', rim: '#E78B60', dark: '#B95C35', decor: 'hearts', paint: '#FFE3EC', leaf: '#71C77A', leafDark: '#4F9A55', flower: '#FFC93C' },
      { id: 'stripes', pot: '#E0845A', rim: '#EC9A70', dark: '#C46B42', decor: 'stripes', paint: '#FFF1D6', leaf: '#62B96B', leafDark: '#468F4E', flower: '#B89CFF' },
    ],
    back: function (v) {
      return '<ellipse cx="100" cy="127" rx="76" ry="9" fill="#6B4527" ' + SW + '/>' +
        '<ellipse cx="100" cy="129" rx="64" ry="5" fill="#553520"/>';
    },
    front: function (v) {
      var d = '';
      if (v.decor === 'dots') {
        [[66, 170, 6], [100, 164, 7], [134, 170, 6], [82, 196, 5], [118, 196, 5], [100, 208, 3.5], [52, 188, 3.5], [148, 188, 3.5]].forEach(function (p) {
          d += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + v.paint + '"/>';
        });
      } else if (v.decor === 'hearts') {
        d += heart(70, 168, 16, v.paint) + heart(130, 168, 16, v.paint) + heart(100, 188, 18, v.paint);
      } else {
        d += '<path d="M34 164H166L164 176H36Z" fill="' + v.paint + '" opacity="0.9"/><path d="M38 190H162L160 200H40Z" fill="' + v.paint + '" opacity="0.9"/>';
      }
      return '<path d="M30 146H170L158 213Q156 222 147 222H53Q44 222 42 213Z" fill="' + v.pot + '"/>' +
        '<path d="M140 146H170L158 213Q156 222 147 222H138Z" fill="' + v.dark + '" opacity="0.35"/>' +
        d +
        '<path d="M30 146H170L158 213Q156 222 147 222H53Q44 222 42 213Z" fill="none" ' + SW + '/>' +
        '<path d="M24 124H176Q183 124 183 131V141Q183 148 176 148H24Q17 148 17 141V131Q17 124 24 124Z" fill="' + v.rim + '" ' + SW + '/>' +
        '<path d="M26 130H150" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.35"/>';
    },
    coverFront: function (v) {
      // Blätter mit eigenem Drehpunkt am Topfrand; geschlossen neigen sie sich zur Mitte
      function leaf(bx, rot, len, w, cls) {
        var by = 132;
        return '<g class="h-leaf ' + cls + '" style="transform-origin:' + bx + 'px ' + by + 'px"><g transform="rotate(' + rot + ' ' + bx + ' ' + by + ')">' +
          '<path d="M' + bx + ' ' + by + 'C' + n(bx - w) + ' ' + n(by - len * 0.35) + ' ' + n(bx - w * 0.6) + ' ' + n(by - len * 0.85) + ' ' + bx + ' ' + n(by - len) +
          'C' + n(bx + w * 0.6) + ' ' + n(by - len * 0.85) + ' ' + n(bx + w) + ' ' + n(by - len * 0.35) + ' ' + bx + ' ' + by + 'Z" fill="' + v.leaf + '" ' + SW + '/>' +
          '<path d="M' + bx + ' ' + (by - 2) + 'V' + n(by - len * 0.82) + '" stroke="' + v.leafDark + '" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M' + bx + ' ' + n(by - len * 0.35) + 'L' + n(bx - w * 0.45) + ' ' + n(by - len * 0.5) + 'M' + bx + ' ' + n(by - len * 0.35) + 'L' + n(bx + w * 0.45) + ' ' + n(by - len * 0.5) +
          'M' + bx + ' ' + n(by - len * 0.6) + 'L' + n(bx - w * 0.35) + ' ' + n(by - len * 0.72) + 'M' + bx + ' ' + n(by - len * 0.6) + 'L' + n(bx + w * 0.35) + ' ' + n(by - len * 0.72) + '" stroke="' + v.leafDark + '" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' +
          '</g></g>';
      }
      var tulip = '<g class="h-leaf h-leaf-m" style="transform-origin:100px 132px"><path d="M100 132V58" stroke="' + v.leafDark + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M86 46C86 62 92 70 100 70C108 70 114 62 114 46L107 52L100 40L93 52Z" fill="' + v.flower + '" ' + SW + '/></g>';
      return tulip + leaf(54, 18, 92, 28, 'h-leaf-l2') + leaf(146, -18, 92, 28, 'h-leaf-r2') + leaf(74, 12, 100, 30, 'h-leaf-l') + leaf(126, -12, 100, 30, 'h-leaf-r');
    },
  };

  /* ---------- Körbchen ---------- */
  T.basket = {
    name: 'Körbchen', rimY: 136, clipY: 218, sound: 'whoosh', sticker: [100, 192], paws: [84, 116], pawsOnTop: true,
    frontShape: '<path d="M10 132H190V140Q182 222 100 222Q18 222 10 140Z"/>',
    variants: [
      { id: 'navy', wicker: '#D9A55F', dark: '#B9823F', light: '#EDC382', blanket: '#34407A', trim: '#5A6BC0', star: '#FFD24A' },
      { id: 'lilac', wicker: '#DCA962', dark: '#BA8543', light: '#EFC686', blanket: '#7E6BC4', trim: '#A796E6', star: '#FFF3B0' },
      { id: 'teal', wicker: '#D6A25C', dark: '#B47E3D', light: '#EBC07F', blanket: '#2E9D98', trim: '#5CC9C2', star: '#FFE9A0' },
    ],
    back: function (v) {
      return '<ellipse cx="100" cy="136" rx="82" ry="16" fill="#5E3B1E" ' + SW + '/>' +
        '<ellipse cx="100" cy="132" rx="70" ry="9" fill="#7A4E29" opacity="0.8"/>';
    },
    front: function (v) {
      var weave = '';
      for (var r = 0; r < 4; r++) {
        var y = 154 + r * 15;
        var off = r % 2 ? 11 : 0;
        for (var x = 20 + off; x < 186; x += 22) {
          weave += '<path d="M' + x + ' ' + y + 'q11 -6 22 0" stroke="' + v.light + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>';
        }
      }
      var ribs = '';
      for (var i = 0; i < 9; i++) {
        var xx = 32 + i * 17;
        ribs += '<path d="M' + xx + ' 146V' + (214 - Math.abs(4 - i) * 3) + '" stroke="' + v.dark + '" stroke-width="2.5" opacity="0.55"/>';
      }
      return '<path d="M18 140Q18 222 100 222Q182 222 182 140Z" fill="' + v.wicker + '"/>' +
        '<g clip-path="url(#ks-basket-body)">' + ribs + weave + '<ellipse cx="100" cy="226" rx="90" ry="26" fill="' + v.dark + '" opacity="0.35"/></g>' +
        '<path d="M18 140Q18 222 100 222Q182 222 182 140Z" fill="none" ' + SW + '/>' +
        '<path d="M16 140Q100 128 184 140" fill="none" stroke="' + OUT + '" stroke-width="17" stroke-linecap="round"/>' +
        '<path d="M16 140Q100 128 184 140" fill="none" stroke="' + v.light + '" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M16 140Q100 128 184 140" fill="none" stroke="' + v.dark + '" stroke-width="11" stroke-dasharray="7 7" opacity="0.6"/>';
    },
    defs: '<clipPath id="ks-basket-body"><path d="M18 140Q18 222 100 222Q182 222 182 140Z"/></clipPath>',
    coverFront: function (v) {
      var stars = '';
      [[70, 110, 5], [100, 96, 6], [132, 112, 5], [52, 128, 4], [150, 128, 4], [86, 124, 3.5], [116, 126, 3.5], [100, 116, 3]].forEach(function (p, i) {
        stars += '<path d="' + KS.CatArt.starPath(p[0], p[1], p[2], 0.45, i * 0.3) + '" fill="' + v.star + '"/>';
      });
      return '<g class="h-cov h-blanket"><path d="M22 142C20 98 56 82 100 82C144 82 180 98 178 142Q100 132 22 142Z" fill="' + v.blanket + '" ' + SW + '/>' +
        stars +
        '<path d="M22 142Q100 132 178 142" fill="none" stroke="' + v.trim + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M44 104C58 92 76 88 90 87" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.25"/></g>';
    },
  };

  /* ---------- Geschenk ---------- */
  T.gift = {
    name: 'Geschenk', rimY: 130, clipY: 222, sound: 'paper', sticker: [142, 184], paws: [84, 116],
    frontShape: '<rect x="30" y="124" width="140" height="98"/>',
    variants: [
      { id: 'redgold', paper: '#E8434F', dark: '#C62F3C', ribbon: '#FFD24A', ribbonDark: '#E8A317', dot: '#FF8A94' },
      { id: 'bluesilver', paper: '#4A90E2', dark: '#3474C2', ribbon: '#EEF2F8', ribbonDark: '#BFC9D8', dot: '#8CC0F5' },
      { id: 'greenred', paper: '#4CAF6A', dark: '#378F52', ribbon: '#E8434F', ribbonDark: '#B92C38', dot: '#8FD6A2' },
    ],
    back: function (v) {
      var bow = '<g transform="translate(100 102)">' +
        '<path d="M0 0C-10 -22 -38 -24 -34 -6C-32 4 -12 6 0 0Z" fill="' + v.ribbon + '" ' + SW + '/>' +
        '<path d="M0 0C10 -22 38 -24 34 -6C32 4 12 6 0 0Z" fill="' + v.ribbon + '" ' + SW + '/>' +
        '<path d="M-6 -4C-12 -12 -22 -14 -24 -8" stroke="' + v.ribbonDark + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M6 -4C12 -12 22 -14 24 -8" stroke="' + v.ribbonDark + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="-1" rx="8" ry="7" fill="' + v.ribbon + '" ' + SW + '/></g>';
      return '<path d="M30 130L38 116H162L170 130Z" fill="' + U.darken(v.paper, 0.45) + '" ' + SW + '/>' +
        '<g class="h-cov h-lid">' +
        '<path d="M22 104H178V122Q178 130 170 130H30Q22 130 22 122Z" fill="' + v.paper + '" ' + SW + '/>' +
        '<path d="M88 104H112V130H88Z" fill="' + v.ribbon + '"/>' +
        '<path d="M88 104V130M112 104V130" stroke="' + v.ribbonDark + '" stroke-width="2"/>' +
        '<path d="M26 108H174" stroke="#FFFFFF" stroke-width="3" opacity="0.3" stroke-linecap="round"/>' +
        '<path d="M22 104H178V122Q178 130 170 130H30Q22 130 22 122Z" fill="none" ' + SW + '/>' +
        bow + '</g>';
    },
    front: function (v) {
      var dots = '';
      [[50, 150], [70, 172], [48, 196], [70, 210], [134, 150], [154, 170], [130, 200], [156, 206], [58, 138], [146, 136]].forEach(function (p) {
        dots += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="' + v.dot + '"/>';
      });
      return '<path d="M30 130H170V214Q170 222 162 222H38Q30 222 30 214Z" fill="' + v.paper + '"/>' +
        '<path d="M148 130H170V214Q170 222 162 222H148Z" fill="' + v.dark + '" opacity="0.45"/>' +
        dots +
        '<path d="M89 130H111V222H89Z" fill="' + v.ribbon + '"/>' +
        '<path d="M89 130V222M111 130V222" stroke="' + v.ribbonDark + '" stroke-width="2"/>' +
        '<path d="M30 130H170V214Q170 222 162 222H38Q30 222 30 214Z" fill="none" ' + SW + '/>';
    },
  };

  /* ---------- Muschel ---------- */
  var SHELL_TOP = 'M18 134C14 116 18 100 26 90Q28 80 38 78Q42 68 54 66Q60 58 72 58Q80 52 90 54Q100 48 110 54Q120 52 128 58Q140 58 146 66Q158 68 162 78Q172 80 174 90Q182 100 182 134Q100 124 18 134Z';
  var SHELL_FRONT = 'M16 134Q100 124 184 134C182 170 160 200 122 214Q100 220 78 214C40 200 18 170 16 134Z';
  T.shell = {
    name: 'Muschel', rimY: 134, clipY: 216, sound: 'clack', sticker: [100, 188], paws: [84, 116],
    frontShape: '<path d="' + SHELL_FRONT + '"/>',
    defs: '<clipPath id="ks-shellclip"><path d="' + SHELL_TOP + '"/></clipPath><clipPath id="ks-shellfront"><path d="' + SHELL_FRONT + '"/></clipPath>',
    variants: [
      { id: 'peach', outer: '#FFC6A8', rib: '#F2A283', inner: '#FFB8CB', innerRib: '#FFD8E3', ear: '#F7B394' },
      { id: 'rose', outer: '#FFB5C5', rib: '#EE8FA6', inner: '#FFD3DE', innerRib: '#FFEAF0', ear: '#F5A2B5' },
      { id: 'lilac', outer: '#D8C4FF', rib: '#B49CEB', inner: '#FFC7D8', innerRib: '#FFE3EB', ear: '#C8B2F5' },
    ],
    back: function (v) {
      // obere Schale: außen (zu, Rippen zum Scharnier unten) und innen (offen, rosa)
      var outRibs = '';
      for (var i = -5; i <= 5; i++) {
        var a = i * 15 * Math.PI / 180;
        outRibs += '<path d="M100 222L' + n(100 + Math.sin(a) * 150) + ' ' + n(222 - Math.cos(a) * 170) + '" stroke="' + v.rib + '" stroke-width="5" stroke-linecap="round"/>';
      }
      var inRibs = '';
      for (var j = -4; j <= 4; j++) {
        var b = j * 17 * Math.PI / 180;
        inRibs += '<path d="M100 134L' + n(100 + Math.sin(b) * 88) + ' ' + n(134 - Math.cos(b) * 76) + '" stroke="' + v.innerRib + '" stroke-width="3.5" stroke-linecap="round"/>';
      }
      var edge = SHELL_TOP;
      return '<ellipse cx="100" cy="136" rx="80" ry="12" fill="#E88FA8" ' + SW + '/>' +
        '<g class="h-cov h-shell">' +
        '<g class="h-shell-in"><path d="' + edge + '" fill="' + v.inner + '" ' + SW + '/><g clip-path="url(#ks-shellclip)">' + inRibs + '</g><path d="' + edge + '" fill="none" ' + SW + '/></g>' +
        '<g class="h-shell-out"><path d="' + edge + '" fill="' + v.outer + '" ' + SW + '/><g clip-path="url(#ks-shellclip)">' + outRibs + '</g><path d="' + edge + '" fill="none" ' + SW + '/></g>' +
        '</g>';
    },
    front: function (v) {
      var ribs = '';
      for (var i = -5; i <= 5; i++) {
        var a = i * 15 * Math.PI / 180;
        ribs += '<path d="M100 222L' + n(100 + Math.sin(a) * 110) + ' ' + n(222 - Math.cos(a) * 100) + '" stroke="' + v.rib + '" stroke-width="5" stroke-linecap="round"/>';
      }
      var edge = SHELL_FRONT;
      return '<path d="' + edge + '" fill="' + v.outer + '"/>' +
        '<g clip-path="url(#ks-shellfront)">' + ribs + '<ellipse cx="100" cy="222" rx="80" ry="24" fill="' + v.rib + '" opacity="0.3"/></g>' +
        '<path d="M78 212L66 222H134L122 212Z" fill="' + v.ear + '" ' + SW + '/>' +
        '<path d="' + edge + '" fill="none" ' + SW + '/>' +
        '<path d="M16 134Q100 124 184 134" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.5"/>';
    },
    extra: function (v) {
      // Perle am Rand, glitzert, wenn offen
      return '<g class="h-pearl"><circle cx="44" cy="131" r="9" fill="#FFFFFF" ' + SW + '/>' +
        '<circle cx="47" cy="134" r="4.5" fill="#EDE6F5"/><circle cx="41" cy="128" r="3" fill="#FFFFFF"/>' +
        '<path class="h-glint" d="M34 116l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFF6C8" stroke="' + OUT + '" stroke-width="1.2"/></g>';
    },
  };

  /* ---------- Kürbis ---------- */
  T.pumpkin = {
    name: 'Kürbis', rimY: 130, clipY: 224, sound: 'tock', sticker: [100, 190], paws: [84, 116],
    frontShape: '<ellipse cx="38" cy="178" rx="28" ry="42"/><ellipse cx="162" cy="178" rx="28" ry="42"/><ellipse cx="66" cy="176" rx="34" ry="47"/><ellipse cx="134" cy="176" rx="34" ry="47"/><ellipse cx="100" cy="175" rx="36" ry="50"/>',
    defs: '<clipPath id="ks-pumpkin-bottom"><rect x="-20" y="131" width="240" height="120"/></clipPath>',
    variants: [
      { id: 'orange', body: '#F28C28', dark: '#D66F14', light: '#FFB25A', flesh: '#FFD28A', stem: '#6E8B3D', leaf: '#7CB342' },
      { id: 'golden', body: '#F6A63A', dark: '#DB8A1E', light: '#FFC56B', flesh: '#FFE0A0', stem: '#7A6A3A', leaf: '#8BC34A' },
      { id: 'coral', body: '#EE7B3A', dark: '#CF6124', light: '#FF9F63', flesh: '#FFC98E', stem: '#5E7F38', leaf: '#6DAA3F' },
    ],
    lobes: function (v) {
      return '<ellipse cx="38" cy="178" rx="28" ry="42" fill="' + v.dark + '" ' + SW + '/>' +
        '<ellipse cx="162" cy="178" rx="28" ry="42" fill="' + v.dark + '" ' + SW + '/>' +
        '<ellipse cx="66" cy="176" rx="34" ry="47" fill="' + v.body + '" ' + SW + '/>' +
        '<ellipse cx="134" cy="176" rx="34" ry="47" fill="' + v.body + '" ' + SW + '/>' +
        '<ellipse cx="100" cy="175" rx="36" ry="50" fill="' + v.light + '" ' + SW + '/>' +
        '<path d="M86 132C82 150 82 170 86 190" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.35"/>';
    },
    back: function (v) {
      var cap = 'M34 132C40 116 66 106 100 106C134 106 160 116 166 132Q100 140 34 132Z';
      var lid = '<g class="h-cov h-plid">' +
        '<path d="' + cap + '" fill="' + v.body + '" ' + SW + '/>' +
        '<path d="M70 110C64 116 62 124 64 134M130 110C136 116 138 124 136 134" stroke="' + v.dark + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M84 112C80 118 80 124 82 130" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.35"/>' +
        '<path d="' + cap + '" fill="none" ' + SW + '/>' +
        '<path d="M110 110C122 100 138 104 134 114C130 122 120 116 126 110" stroke="' + v.leaf + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M108 110C114 100 130 100 136 108C126 116 116 116 108 110Z" fill="' + v.leaf + '" ' + SW + '/>' +
        '<path d="M95 110C93 98 95 90 103 84L111 88C105 94 103 102 105 110Z" fill="' + v.stem + '" ' + SW + '/>' +
        '</g>';
      return '<ellipse cx="100" cy="132" rx="66" ry="8.5" fill="' + v.flesh + '" ' + SW + '/>' +
        '<ellipse cx="100" cy="133" rx="52" ry="4.5" fill="' + U.darken(v.flesh, 0.25) + '" opacity="0.6"/>' + lid;
    },
    front: function (v) {
      return '<g clip-path="url(#ks-pumpkin-bottom)">' + T.pumpkin.lobes(v) + '</g>' +
        '<path d="M30 131Q100 140 170 131" stroke="' + OUT + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    },
  };

  /* ---------- Wolke ---------- */
  var CLOUD_BODY = 'M22 176C8 172 8 146 28 142C30 128 50 126 58 134C66 124 82 124 90 132C98 124 116 124 124 132C134 124 150 126 152 138C170 134 188 148 180 166C194 176 186 202 164 200C158 214 138 218 126 208C116 220 92 220 82 208C70 218 46 214 42 202C22 204 12 190 22 176Z';
  T.cloud = {
    name: 'Wolke', rimY: 134, clipY: 214, sound: 'puff', sticker: [100, 184], paws: [84, 116],
    frontShape: '<path d="' + CLOUD_BODY + '"/>',
    defs: '<clipPath id="ks-cloudfront"><path d="' + CLOUD_BODY + '"/></clipPath>',
    variants: [
      { id: 'lilac', body: '#FFFFFF', shade: '#E4DAFA', deep: '#CBBDF2' },
      { id: 'pink', body: '#FFFFFF', shade: '#FCDDEA', deep: '#F4C1D6' },
      { id: 'sky', body: '#FFFFFF', shade: '#D9ECFB', deep: '#B9DAF4' },
    ],
    back: function (v) {
      return '<ellipse cx="100" cy="136" rx="70" ry="10" fill="' + v.deep + '" opacity="0.8"/>';
    },
    front: function (v) {
      var body = CLOUD_BODY;
      return '<path d="' + body + '" fill="' + v.body + '"/>' +
        '<g clip-path="url(#ks-cloudfront)"><ellipse cx="100" cy="222" rx="96" ry="30" fill="' + v.shade + '"/><ellipse cx="60" cy="150" rx="22" ry="10" fill="#FFFFFF"/></g>' +
        '<path d="' + body + '" fill="none" ' + SW + '/>';
    },
    coverFront: function (v) {
      var top = 'M30 146C16 138 20 110 42 110C40 88 62 78 78 88C84 66 116 64 124 86C138 76 162 84 160 104C182 104 188 136 170 146';
      return '<g class="h-cov h-puff"><path d="' + top + 'Q100 154 30 146Z" fill="' + v.body + '"/>' +
        '<path d="' + top + '" fill="none" ' + SW + ' stroke-linecap="round"/>' +
        '<path d="M60 102C64 94 74 92 80 96M108 84C112 78 120 78 124 82" stroke="' + v.shade + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<path d="M52 136Q100 128 150 136" stroke="' + v.shade + '" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.6"/></g>';
    },
  };

  /* =====================================================================
     Globale Definitionen
     ===================================================================== */

  function ensureDefs() {
    if (ensureDefs.done || !root.document) return;
    KS.CatArt.ensureDefs();
    var host = root.document.getElementById('ks-defs-root');
    var s = '';
    Object.keys(T).forEach(function (k) {
      var t = T[k];
      // sichtbar: alles oberhalb der Kante plus die Fläche der Vorderseite (die das Versteckte abdeckt)
      s += '<clipPath id="ks-hclip-' + k + '"><rect x="-80" y="-260" width="360" height="' + (t.rimY + 268) + '"/>' + t.frontShape + '</clipPath>';
      s += '<clipPath id="ks-tclip-' + k + '"><rect x="-80" y="-260" width="360" height="' + (t.rimY + 262) + '"/></clipPath>';
      if (t.defs) s += t.defs;
    });
    s += '<radialGradient id="ks-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE27A" stop-opacity="0.95"/><stop offset="0.6" stop-color="#FFD24A" stop-opacity="0.45"/><stop offset="1" stop-color="#FFD24A" stop-opacity="0"/></radialGradient>';
    var frag = U.svgFrag(s);
    while (frag.firstChild) host.appendChild(frag.firstChild);
    ensureDefs.done = true;
  }

  function rimPaws(t, cat) {
    var col = cat.paw;
    var y = t.rimY - 1;
    var s = '';
    t.paws.forEach(function (x) {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="11.5" ry="8.5" fill="' + col + '" ' + SW + '/>' +
        '<path d="M' + (x - 3.8) + ' ' + (y + 1) + 'v5M' + (x + 3.8) + ' ' + (y + 1) + 'v5" stroke="' + OUT + '" stroke-width="2" stroke-linecap="round" opacity="0.7"/>';
    });
    return s;
  }

  function tailTip(typeId, cat) {
    // Schwanzspitze für den Tipp: schaut rechts über den Rand (Konzept 9.2)
    var t = T[typeId];
    var y = t.rimY;
    var col = cat.tailColor;
    var d = 'M146 ' + (y + 30) + 'C146 ' + (y + 6) + ' 142 ' + (y - 14) + ' 152 ' + (y - 28) + 'C160 ' + (y - 38) + ' 172 ' + (y - 34) + ' 168 ' + (y - 24);
    return '<g class="h-tailclip" clip-path="url(#ks-tclip-' + typeId + ')"><g class="h-tailtip">' +
      '<path d="' + d + '" fill="none" stroke="' + OUT + '" stroke-width="17" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="11" stroke-linecap="round"/></g></g>';
  }

  function sticker(t) {
    var p = t.sticker;
    return '<g class="h-sticker"><g transform="translate(' + p[0] + ' ' + p[1] + ')">' +
      '<path d="' + KS.CatArt.starPath(0, 0, 17, 0.5) + '" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round"/>' +
      '<path d="' + KS.CatArt.starPath(0, 0, 17, 0.5) + '" fill="url(#ks-gold)" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<circle cx="-4" cy="-4" r="2.6" fill="#FFFBE0"/></g></g>';
  }

  /** Markup einer ganzen Karte */
  function cardMarkup(typeId, v, catId) {
    var t = T[typeId];
    var cat = KS.Cats.byId[catId];
    var s = '';
    s += '<ellipse class="h-glowspot" cx="100" cy="218" rx="98" ry="22" fill="url(#ks-glow)"/>';
    s += '<ellipse class="h-shadow" cx="100" cy="222" rx="80" ry="9" fill="' + OUT + '" opacity="0.18"/>';
    s += '<g class="h-back">' + t.back(v) + '</g>';
    s += '<g class="h-catlayer" clip-path="url(#ks-hclip-' + typeId + ')">' +
      '<g class="cat-slide"><g transform="translate(' + CAT_X + ' ' + CAT_TOP + ') scale(' + CAT_SCALE + ')">' + KS.CatArt.markup(catId) + '</g></g></g>';
    s += '<g class="h-front">' + t.front(v) + '</g>';
    if (!t.pawsOnTop) s += '<g class="h-paws">' + rimPaws(t, cat) + '</g>';
    if (t.coverFront) s += '<g class="h-coverfront">' + t.coverFront(v) + '</g>';
    if (t.pawsOnTop) s += '<g class="h-paws">' + rimPaws(t, cat) + '</g>';
    if (t.extra) s += '<g class="h-extra">' + t.extra(v) + '</g>';
    s += tailTip(typeId, cat);
    s += sticker(t);
    return s;
  }

  /** Versteck-Markup ohne Katze (Titel-Stufenknöpfe, Galerie) */
  function hiderOnly(typeId, v) {
    var t = T[typeId];
    var s = '<ellipse cx="100" cy="222" rx="80" ry="9" fill="' + OUT + '" opacity="0.18"/>';
    s += '<g class="h-back">' + t.back(v) + '</g><g class="h-front">' + t.front(v) + '</g>';
    if (t.coverFront) s += '<g class="h-coverfront">' + t.coverFront(v) + '</g>';
    return s;
  }

  KS.Hiders = {
    types: T,
    ensureDefs: ensureDefs,
    cardMarkup: cardMarkup,
    hiderOnly: hiderOnly,
    CAT_SCALE: CAT_SCALE,
    /** Verschiebung der Katze im Versteck (versteckt / Guck-Phase) */
    hideY: function (typeId) { return T[typeId].rimY - CAT_TOP + 12; },
    peekY: function (typeId) { return Math.round((T[typeId].rimY - CAT_TOP) * 0.3); },
    variant: function (typeId, idOrIndex) {
      var vs = T[typeId].variants;
      if (typeof idOrIndex === 'number') return vs[((idOrIndex % vs.length) + vs.length) % vs.length];
      for (var i = 0; i < vs.length; i++) if (vs[i].id === idOrIndex) return vs[i];
      return vs[0];
    },
  };

  /* =====================================================================
     KS.Card – ein Versteck auf dem Spielfeld
     ===================================================================== */

  function Card(o) {
    ensureDefs();
    this.type = o.type;
    this.variant = o.variant || T[o.type].variants[0];
    this.catId = o.cat;
    this.index = o.index || 0;
    this.open_ = false;
    this.found = false;
    var el = (this.el = root.document.createElement('div'));
    el.className = 'card t-' + o.type;
    el.setAttribute('data-index', this.index);
    var body = (this.body = root.document.createElement('div'));
    body.className = 'card-body';
    var svg = (this.svg = root.document.createElementNS(U.SVGNS, 'svg'));
    svg.setAttribute('viewBox', '0 0 200 230');
    svg.setAttribute('class', 'card-svg');
    svg.setAttribute('overflow', 'visible');
    svg.innerHTML = cardMarkup(o.type, this.variant, o.cat);
    svg.style.setProperty('--hide', KS.Hiders.hideY(o.type) + 'px');
    svg.style.setProperty('--peek', KS.Hiders.peekY(o.type) + 'px');
    body.appendChild(svg);
    el.appendChild(body);
    this.catEl = svg.querySelector('.cat');
    this.catView = new KS.CatView(this.catEl, { active: false, host: el });
    this.x = this.y = this.w = this.h = 0;
  }

  Card.prototype = {
    setBox: function (x, y, w, h, glide) {
      var el = this.el;
      el.classList.toggle('no-glide', !glide);
      el.style.width = w.toFixed(1) + 'px';
      el.style.height = h.toFixed(1) + 'px';
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      this.x = x; this.y = y; this.w = w; this.h = h;
      this.catView.rect = null;
    },
    center: function () {
      return { x: this.x + this.w / 2, y: this.y + this.h * 0.55 };
    },
    /** Bildschirmpunkt des Katzenkopfes (für Effekte) */
    headPoint: function () {
      var r = this.el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.3 };
    },
    open: function () {
      if (this.open_) return;
      this.open_ = true;
      var el = this.el;
      el.classList.remove('is-peek');
      el.classList.add('is-open');
      this.catView.setActive(true);
      if (this.type === 'cloud' && KS.FX) {
        var p = this.headPoint();
        KS.FX.puff(p.x, p.y + this.h * 0.12, this.w);
      }
      var self = this;
      clearTimeout(this._upT);
      this._upT = setTimeout(function () {
        if (!self.open_) return;
        el.classList.add('is-up');
        self.catView.rect = null;
      }, 520);
    },
    close: function () {
      if (!this.open_) return;
      this.open_ = false;
      clearTimeout(this._upT);
      this.el.classList.remove('is-open', 'is-up');
      this.catView.setActive(false);
      if (this.catView.sleeping) this.catView.wake(false);
      if (this.type === 'cloud' && KS.FX) {
        var p = this.headPoint();
        KS.FX.puff(p.x, p.y + this.h * 0.12, this.w * 0.6);
      }
    },
    isOpen: function () { return this.open_; },
    /** Guck-Phase: Katze schaut nur mit dem Kopf heraus */
    peek: function (on) {
      this.el.classList.toggle('is-peek', !!on);
      this.catView.setActive(!!on);
    },
    wiggle: function (strong) {
      U.pulseClass(this.body, strong ? 'is-wiggle-strong' : 'is-wiggle', strong ? 900 : 520);
    },
    setFound: function () {
      this.found = true;
      this.el.classList.add('is-found');
    },
    /** Tipp: Schwanzspitze schaut 1,5 s heraus */
    showTail: function (ms) {
      var el = this.el;
      el.classList.add('is-tail');
      clearTimeout(this._tailT);
      this._tailT = setTimeout(function () { el.classList.remove('is-tail'); }, ms || 1500);
    },
    dropIn: function (delay) {
      var b = this.body;
      b.style.animationDelay = (delay || 0) + 'ms';
      b.classList.remove('is-drop');
      b.getBoundingClientRect();
      b.classList.add('is-drop');
      // danach entfernen: sonst hält „both“ transform:none fest und Wackeln/Hover greifen nie
      var done = function (e) {
        if (e.target !== b || e.animationName !== 'ks-drop') return;
        b.removeEventListener('animationend', done);
        b.classList.remove('is-drop');
        b.style.animationDelay = '';
      };
      b.addEventListener('animationend', done);
    },
    destroy: function () {
      clearTimeout(this._upT);
      clearTimeout(this._tailT);
      this.catView.destroy();
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    },
  };

  KS.Card = Card;
})(typeof window !== 'undefined' ? window : globalThis);

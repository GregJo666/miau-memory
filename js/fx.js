/* Miau-Memory – KS.FX: Canvas-Partikel mit Objekt-Pool und vorgerenderten Sprites.
   Zwei Ebenen: 0 = Umgebung (hinter dem Spielfeld), 1 = Effekte (über allem). */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;

  var MAX = 600;
  var OUT = '#4B3A5A';
  var PALETTE = ['#FF6F91', '#3CCFA0', '#FFC93C', '#5AB9EA', '#B89CFF', '#FF9A5A'];

  var cv = [null, null];
  var cx = [null, null];
  var W = 0, H = 0, DPR = 1;
  var pool = [];
  var live = [];
  var spr = {};
  var ambient = null;
  var unFrame = null;
  var reduced = false;
  var dirty = [false, false];

  /* ---------- Sprites ---------- */

  function sprite(w, h, draw) {
    var c = root.document.createElement('canvas');
    var k = 2;
    c.width = Math.ceil(w * k);
    c.height = Math.ceil(h * k);
    var g = c.getContext('2d');
    g.scale(k, k);
    draw(g, w, h);
    c.w = w;
    c.h = h;
    return c;
  }

  function heartPath(g, cx0, cy0, s) {
    g.beginPath();
    g.moveTo(cx0, cy0 + s * 0.35);
    g.bezierCurveTo(cx0 - s * 0.1, cy0 + s * 0.22, cx0 - s * 0.5, cy0 + s * 0.05, cx0 - s * 0.5, cy0 - s * 0.18);
    g.bezierCurveTo(cx0 - s * 0.5, cy0 - s * 0.45, cx0 - s * 0.12, cy0 - s * 0.52, cx0, cy0 - s * 0.26);
    g.bezierCurveTo(cx0 + s * 0.12, cy0 - s * 0.52, cx0 + s * 0.5, cy0 - s * 0.45, cx0 + s * 0.5, cy0 - s * 0.18);
    g.bezierCurveTo(cx0 + s * 0.5, cy0 + s * 0.05, cx0 + s * 0.1, cy0 + s * 0.22, cx0, cy0 + s * 0.35);
    g.closePath();
  }

  function starPath(g, cx0, cy0, r, inner, points) {
    points = points || 5;
    g.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var rr = i % 2 ? r * inner : r;
      var a = -Math.PI / 2 + (i * Math.PI) / points;
      if (i) g.lineTo(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr);
      else g.moveTo(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr);
    }
    g.closePath();
  }

  function makeSprites() {
    spr.heart = sprite(40, 40, function (g) {
      heartPath(g, 20, 21, 34);
      g.fillStyle = '#FF6F91';
      g.fill();
      g.lineWidth = 2.5;
      g.strokeStyle = '#D9436A';
      g.stroke();
      g.beginPath();
      g.ellipse(12.5, 13, 4, 2.6, -0.6, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fill();
    });
    spr.heartPink = sprite(40, 40, function (g) {
      heartPath(g, 20, 21, 34);
      g.fillStyle = '#FFA3C0';
      g.fill();
      g.lineWidth = 2.5;
      g.strokeStyle = '#F07AA0';
      g.stroke();
      g.beginPath();
      g.ellipse(12.5, 13, 4, 2.6, -0.6, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fill();
    });
    spr.star = sprite(40, 40, function (g) {
      starPath(g, 20, 21, 17, 0.5);
      var gr = g.createRadialGradient(15, 14, 2, 20, 20, 20);
      gr.addColorStop(0, '#FFF4B8');
      gr.addColorStop(0.55, '#FFD24A');
      gr.addColorStop(1, '#F2A91C');
      g.fillStyle = gr;
      g.fill();
      g.lineJoin = 'round';
      g.lineWidth = 2.2;
      g.strokeStyle = '#D98E12';
      g.stroke();
    });
    spr.bigStar = sprite(72, 72, function (g) {
      starPath(g, 36, 38, 31, 0.5);
      g.lineJoin = 'round';
      g.lineWidth = 7;
      g.strokeStyle = '#FFFFFF';
      g.stroke();
      var gr = g.createRadialGradient(28, 26, 3, 36, 36, 36);
      gr.addColorStop(0, '#FFF6C4');
      gr.addColorStop(0.5, '#FFD24A');
      gr.addColorStop(1, '#F0A416');
      g.fillStyle = gr;
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = OUT;
      g.stroke();
      g.beginPath();
      g.arc(29, 30, 4, 0, Math.PI * 2);
      g.fillStyle = '#FFFDF0';
      g.fill();
    });
    spr.rainbowStar = sprite(72, 72, function (g) {
      starPath(g, 36, 38, 31, 0.5);
      g.lineJoin = 'round';
      g.lineWidth = 7;
      g.strokeStyle = '#FFFFFF';
      g.stroke();
      var gr = g.createLinearGradient(6, 8, 66, 66);
      ['#FF6F91', '#FF9A5A', '#FFD24A', '#3CCFA0', '#5AB9EA', '#B89CFF'].forEach(function (c, i) { gr.addColorStop(i / 5, c); });
      g.fillStyle = gr;
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = OUT;
      g.stroke();
      g.beginPath();
      g.arc(29, 30, 4, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.fill();
    });
    spr.sparkle = sprite(32, 32, function (g) {
      var gr = g.createRadialGradient(16, 16, 0, 16, 16, 14);
      gr.addColorStop(0, 'rgba(255,255,240,0.9)');
      gr.addColorStop(1, 'rgba(255,240,180,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 32, 32);
      g.beginPath();
      g.moveTo(16, 2);
      g.quadraticCurveTo(17.5, 14.5, 30, 16);
      g.quadraticCurveTo(17.5, 17.5, 16, 30);
      g.quadraticCurveTo(14.5, 17.5, 2, 16);
      g.quadraticCurveTo(14.5, 14.5, 16, 2);
      g.fillStyle = '#FFFBE0';
      g.fill();
    });
    spr.glow = sprite(32, 32, function (g) {
      var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,255,0.95)');
      gr.addColorStop(0.35, 'rgba(255,248,220,0.55)');
      gr.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 32, 32);
    });
    spr.firefly = sprite(32, 32, function (g) {
      var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,210,1)');
      gr.addColorStop(0.25, 'rgba(236,255,140,0.8)');
      gr.addColorStop(1, 'rgba(200,255,120,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 32, 32);
    });
    spr.flake = sprite(24, 24, function (g) {
      var gr = g.createRadialGradient(12, 12, 0, 12, 12, 12);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.55, 'rgba(255,255,255,0.9)');
      gr.addColorStop(1, 'rgba(225,238,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 24, 24);
    });
    spr.puff = sprite(48, 48, function (g) {
      var gr = g.createRadialGradient(20, 20, 2, 24, 24, 23);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.7, 'rgba(250,246,255,0.9)');
      gr.addColorStop(1, 'rgba(230,222,250,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(24, 24, 23, 0, Math.PI * 2);
      g.fill();
    });
    spr.leaves = ['#F28C28', '#E8574A', '#F6C445', '#D9772B', '#C9502F'].map(function (col) {
      return sprite(36, 36, function (g) {
        g.translate(18, 18);
        g.beginPath();
        g.moveTo(0, -15);
        g.bezierCurveTo(9, -10, 14, -2, 0, 15);
        g.bezierCurveTo(-14, -2, -9, -10, 0, -15);
        g.closePath();
        g.fillStyle = col;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = 'rgba(75,58,90,0.75)';
        g.stroke();
        g.beginPath();
        g.moveTo(0, -12);
        g.lineTo(0, 17);
        g.moveTo(0, -2);
        g.lineTo(5, -7);
        g.moveTo(0, -2);
        g.lineTo(-5, -7);
        g.moveTo(0, 5);
        g.lineTo(6, 0);
        g.moveTo(0, 5);
        g.lineTo(-6, 0);
        g.strokeStyle = 'rgba(90,50,30,0.5)';
        g.lineWidth = 1.4;
        g.stroke();
      });
    });
    spr.petal = sprite(24, 24, function (g) {
      g.translate(12, 12);
      g.beginPath();
      g.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
      g.fillStyle = '#FFC2D6';
      g.fill();
      g.lineWidth = 1.2;
      g.strokeStyle = '#F29AB8';
      g.stroke();
    });
    spr.note = sprite(28, 28, function (g) {
      g.fillStyle = '#B89CFF';
      g.strokeStyle = OUT;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(10, 20, 6, 4.5, -0.4, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.beginPath();
      g.moveTo(15.5, 19);
      g.lineTo(15.5, 4);
      g.quadraticCurveTo(21, 8, 24, 5);
      g.stroke();
    });
  }

  /* ---------- Pool ---------- */

  function Particle() { this.on = false; }

  function spawn(o) {
    var p = null;
    if (live.length >= MAX) {
      // ältester Partikel der gleichen Ebene weicht
      for (var i = 0; i < live.length; i++) if (live[i].layer === (o.layer || 1) && !live[i].keep) { p = live[i]; live.splice(i, 1); break; }
      if (!p) return null;
    } else {
      p = pool.pop() || new Particle();
    }
    p.on = true;
    p.layer = o.layer === undefined ? 1 : o.layer;
    p.spr = o.spr || null;
    p.x = o.x; p.y = o.y;
    p.vx = o.vx || 0; p.vy = o.vy || 0;
    p.ax = o.ax || 0; p.ay = o.ay || 0;
    p.drag = o.drag || 0;
    p.rot = o.rot || 0; p.vr = o.vr || 0;
    p.s = o.s === undefined ? 1 : o.s;
    p.s1 = o.s1 === undefined ? p.s : o.s1;
    p.a = o.a === undefined ? 1 : o.a;
    p.life = o.life || 1;
    p.t = -(o.delay || 0);
    p.fadeIn = o.fadeIn || 0;
    p.fadeOut = o.fadeOut === undefined ? 0.35 : o.fadeOut;
    p.tw = o.tw || 0; // Funkeln (Hz)
    p.twp = Math.random() * 6.28;
    p.wob = o.wob || 0; // Pendeln (px)
    p.wobf = o.wobf || 1;
    p.wobp = Math.random() * 6.28;
    p.path = o.path || null;
    p.ease = o.ease || null;
    p.col = o.col || null;
    p.w = o.w || 8; p.h = o.h || 5;
    p.flip = o.flip || 0;
    p.trail = o.trail || null;
    p.trailT = 0;
    p.onDone = o.onDone || null;
    p.wrap = !!o.wrap;
    p.keep = !!o.keep;
    p.comp = o.comp || null;
    live.push(p);
    dirty[p.layer] = true;
    ensureLoop();
    return p;
  }

  function kill(i) {
    var p = live[i];
    live.splice(i, 1);
    p.on = false;
    if (p.onDone) {
      var fn = p.onDone;
      p.onDone = null;
      try { fn(p); } catch (e) { if (root.console) console.error(e); }
    }
    pool.push(p);
  }

  /* ---------- Schleife ---------- */

  function ensureLoop() {
    if (!unFrame && cx[1]) unFrame = U.onFrame(step);
  }

  function bez(p0, c, p1, t) {
    var u = 1 - t;
    return u * u * p0 + 2 * u * t * c + t * t * p1;
  }

  function step(dt) {
    var i, p;
    // Umgebung nachfüllen
    if (ambient) ambient.tick(dt);
    for (i = live.length - 1; i >= 0; i--) {
      p = live[i];
      p.t += dt;
      if (p.t < 0) continue;
      if (p.path) {
        var k = Math.min(1, p.t / p.life);
        var e = p.ease ? p.ease(k) : k;
        var q = p.path;
        var nx = bez(q[0], q[2], q[4], e);
        var ny = bez(q[1], q[3], q[5], e);
        p.vx = (nx - p.x) / Math.max(dt, 0.001);
        p.vy = (ny - p.y) / Math.max(dt, 0.001);
        p.x = nx;
        p.y = ny;
      } else {
        if (p.drag) {
          var d = Math.pow(1 - p.drag, dt * 60);
          p.vx *= d;
          p.vy *= d;
        }
        p.vx += p.ax * dt;
        p.vy += p.ay * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      p.rot += p.vr * dt;
      if (p.trail) {
        p.trailT -= dt;
        if (p.trailT <= 0) {
          p.trailT = p.trail.every || 0.03;
          p.trail.fn(p);
        }
      }
      if (p.wrap) {
        if (p.y > H + 40) { p.y = -30; p.x = Math.random() * W; }
        if (p.y < -60 && p.vy < 0) { p.y = H + 30; }
        if (p.x < -60) p.x = W + 40;
        if (p.x > W + 60) p.x = -40;
        continue;
      }
      if (p.t >= p.life) kill(i);
    }
    draw(0);
    draw(1);
    if (!live.length && !ambient && unFrame) {
      unFrame();
      unFrame = null;
    }
  }

  function draw(layer) {
    var g = cx[layer];
    if (!g) return;
    var any = false;
    for (var j = 0; j < live.length; j++) if (live[j].layer === layer) { any = true; break; }
    if (!any && !dirty[layer]) return;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    dirty[layer] = any;
    var t;
    for (var i = 0; i < live.length; i++) {
      var p = live[i];
      if (p.layer !== layer || p.t < 0) continue;
      var k = p.wrap ? 0.5 : p.t / p.life;
      var a = p.a;
      if (!p.wrap) {
        if (p.fadeIn && p.t < p.fadeIn) a *= p.t / p.fadeIn;
        var fo = p.fadeOut * p.life;
        if (fo > 0 && p.t > p.life - fo) a *= Math.max(0, (p.life - p.t) / fo);
      } else if (p.fadeIn && p.t < p.fadeIn) {
        a *= p.t / p.fadeIn;
      }
      if (p.tw) a *= 0.55 + 0.45 * Math.sin(p.twp + p.t * p.tw * 6.283);
      if (a <= 0.01) continue;
      var s = p.s + (p.s1 - p.s) * Math.min(1, k);
      var x = p.x;
      if (p.wob) x += Math.sin(p.wobp + p.t * p.wobf * 6.283) * p.wob;
      g.globalAlpha = a > 1 ? 1 : a;
      if (p.comp) g.globalCompositeOperation = p.comp;
      var c = Math.cos(p.rot) * s, sn = Math.sin(p.rot) * s;
      if (p.spr) {
        t = p.spr;
        g.setTransform(c * DPR, sn * DPR, -sn * DPR, c * DPR, x * DPR, p.y * DPR);
        g.drawImage(t, -t.w / 2, -t.h / 2, t.w, t.h);
      } else if (p.col) {
        // Konfetti: Rechteck, das sich wie Papier dreht
        var fl = p.flip ? Math.cos(p.twp + p.t * p.flip) : 1;
        g.setTransform(c * DPR, sn * DPR, -sn * fl * DPR, c * fl * DPR, x * DPR, p.y * DPR);
        g.fillStyle = p.col;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      if (p.comp) g.globalCompositeOperation = 'source-over';
    }
    g.globalAlpha = 1;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function resize() {
    DPR = Math.min(2, root.devicePixelRatio || 1);
    W = root.innerWidth;
    H = root.innerHeight;
    for (var i = 0; i < 2; i++) {
      if (!cv[i]) continue;
      cv[i].width = Math.round(W * DPR);
      cv[i].height = Math.round(H * DPR);
      dirty[i] = true;
    }
    if (ambient && ambient.resize) ambient.resize();
  }

  function n(v, lo) { return reduced ? Math.max(lo || 1, Math.round(v * 0.35)) : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- Umgebung ---------- */

  var AMBIENT = {
    snow: function () {
      var parts = [];
      var depths = [[0.35, 26, 18, 0.55], [0.6, 40, 16, 0.75], [1, 60, 10, 0.95]];
      depths.forEach(function (d) {
        for (var i = 0; i < n(d[2], 3); i++) {
          parts.push(spawn({ layer: 0, spr: spr.flake, x: Math.random() * W, y: Math.random() * H, vy: d[1] * rnd(0.8, 1.2), vx: rnd(-6, 6), s: d[0] * rnd(0.6, 1), a: d[3], wob: 10 * d[0], wobf: rnd(0.15, 0.35), wrap: true, keep: true, fadeIn: 1 }));
        }
      });
      return parts;
    },
    leaves: function () {
      var parts = [];
      for (var i = 0; i < n(14, 4); i++) {
        parts.push(spawn({ layer: 0, spr: pick(spr.leaves), x: Math.random() * W, y: Math.random() * H, vy: rnd(22, 40), vx: rnd(-8, 12), s: rnd(0.6, 1), vr: rnd(-1.4, 1.4), rot: Math.random() * 6, wob: rnd(14, 28), wobf: rnd(0.2, 0.4), wrap: true, keep: true, fadeIn: 1 }));
      }
      return parts;
    },
    fireflies: function () {
      var parts = [];
      for (var i = 0; i < n(20, 6); i++) {
        parts.push(spawn({ layer: 0, spr: spr.firefly, x: Math.random() * W, y: H * rnd(0.35, 1), vx: rnd(-8, 8), vy: rnd(-6, 2), s: rnd(0.5, 1), tw: rnd(0.2, 0.5), wob: rnd(8, 20), wobf: rnd(0.1, 0.25), wrap: true, keep: true, fadeIn: 1.5 }));
      }
      return parts;
    },
    dust: function (o) {
      // Staubkörnchen im Sonnenstrahl (Bereich o.box: x, y, w, h)
      var parts = [];
      var b = o && o.box ? o.box : { x: 0, y: 0, w: W * 0.4, h: H * 0.7 };
      for (var i = 0; i < n(30, 8); i++) {
        parts.push(spawn({ layer: 0, spr: spr.glow, x: b.x + Math.random() * b.w, y: b.y + Math.random() * b.h, vx: rnd(-3, 3), vy: rnd(-4, 4), s: rnd(0.12, 0.3), a: rnd(0.5, 0.9), tw: rnd(0.15, 0.4), wob: rnd(4, 12), wobf: rnd(0.05, 0.15), wrap: true, keep: true, fadeIn: 2 }));
      }
      return parts;
    },
    glitter: function () {
      var parts = [];
      for (var i = 0; i < n(22, 6); i++) {
        parts.push(spawn({ layer: 0, spr: spr.sparkle, x: Math.random() * W, y: Math.random() * H, vx: rnd(-4, 4), vy: rnd(-5, 5), s: rnd(0.3, 0.7), tw: rnd(0.2, 0.6), wrap: true, keep: true, fadeIn: 2 }));
      }
      return parts;
    },
    petals: function () {
      var parts = [];
      for (var i = 0; i < n(10, 3); i++) {
        parts.push(spawn({ layer: 0, spr: spr.petal, x: Math.random() * W, y: Math.random() * H, vy: rnd(14, 26), vx: rnd(4, 14), s: rnd(0.6, 1), vr: rnd(-2, 2), wob: rnd(10, 20), wobf: rnd(0.2, 0.4), wrap: true, keep: true, fadeIn: 1 }));
      }
      return parts;
    },
  };

  /* ---------- Öffentliche Effekte ---------- */

  var FX = {
    PALETTE: PALETTE,

    init: function () {
      if (cx[1]) return;
      reduced = U.reducedMotion();
      cv[0] = root.document.getElementById('ambient');
      cv[1] = root.document.getElementById('fx');
      for (var i = 0; i < 2; i++) if (cv[i]) cx[i] = cv[i].getContext('2d');
      makeSprites();
      resize();
      root.addEventListener('resize', resize);
    },

    get reduced() { return reduced; },

    /** Ein Herz steigt auf (Streicheln) */
    heart: function (x, y, o) {
      o = o || {};
      spawn({ spr: Math.random() < 0.5 ? spr.heart : spr.heartPink, x: x, y: y, vx: rnd(-18, 18), vy: rnd(-70, -50), drag: 0.01, s: (o.size || 0.7) * 0.6, s1: o.size || 0.7, rot: rnd(-0.3, 0.3), vr: rnd(-0.6, 0.6), life: rnd(1, 1.4), fadeIn: 0.1, fadeOut: 0.45, wob: 6, wobf: 1.2 });
    },

    /** Sternexplosion mit Glitzer */
    burst: function (x, y, o) {
      o = o || {};
      var cnt = n(o.count || 16, 5);
      for (var i = 0; i < cnt; i++) {
        var a = (i / cnt) * Math.PI * 2 + rnd(-0.2, 0.2);
        var sp = rnd(160, 320) * (o.power || 1);
        spawn({ spr: Math.random() < 0.7 ? spr.star : spr.sparkle, x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, ay: 260, drag: 0.04, s: rnd(0.45, 0.8), s1: 0.2, rot: rnd(0, 6), vr: rnd(-5, 5), life: rnd(0.7, 1.1), fadeOut: 0.5 });
      }
      spawn({ spr: spr.glow, x: x, y: y, s: 1, s1: 5, a: 0.5, life: 0.4, fadeOut: 1 });
    },

    /** Konfetti-Explosion */
    confetti: function (x, y, o) {
      o = o || {};
      var cnt = n(o.count || 26, 8);
      for (var i = 0; i < cnt; i++) {
        var a = -Math.PI / 2 + rnd(-1.2, 1.2);
        var sp = rnd(220, 480);
        var round = Math.random() < 0.25;
        spawn({ col: pick(PALETTE), x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 520, drag: 0.035, w: round ? 7 : rnd(6, 10), h: round ? 7 : rnd(4, 6), rot: rnd(0, 6), vr: rnd(-8, 8), flip: rnd(6, 14), life: rnd(1.3, 2), fadeOut: 0.3, wob: rnd(2, 6), wobf: rnd(1, 2) });
      }
    },

    /** Konfetti-Regen über den ganzen Bildschirm */
    confettiRain: function (seconds, o) {
      o = o || {};
      var total = n(Math.round((o.rate || 70) * (seconds || 3)), 20);
      for (var i = 0; i < total; i++) {
        spawn({ col: pick(PALETTE), x: Math.random() * W, y: -20 - Math.random() * 60, vx: rnd(-30, 30), vy: rnd(90, 170), ay: 30, w: rnd(7, 11), h: rnd(4, 6), rot: rnd(0, 6), vr: rnd(-6, 6), flip: rnd(5, 12), life: rnd(4, 6), delay: Math.random() * (seconds || 3), fadeOut: 0.15, wob: rnd(10, 26), wobf: rnd(0.3, 0.7) });
      }
    },

    /** Glitzer an einem Punkt */
    sparkle: function (x, y, count, o) {
      o = o || {};
      var cnt = n(count || 12, 4);
      var r = o.radius || 40;
      for (var i = 0; i < cnt; i++) {
        var a = Math.random() * Math.PI * 2;
        var d = Math.random() * r;
        spawn({ spr: spr.sparkle, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * rnd(10, 50), vy: Math.sin(a) * rnd(10, 50) - 20, s: rnd(0.4, 0.9), s1: 0.1, tw: rnd(2, 4), life: rnd(0.6, 1.1), delay: Math.random() * (o.spread || 0.3) });
      }
    },

    /** Herzen fliegen im Bogen von a nach b und zurück; nebeneinander: Herzregen */
    heartStream: function (a, b, o) {
      o = o || {};
      var adjacent = o.adjacent;
      var cnt = n(o.count || 12, 4);
      if (adjacent) {
        var x0 = Math.min(a.x, b.x) - 40, x1 = Math.max(a.x, b.x) + 40;
        var top = Math.min(a.y, b.y) - (o.height || 160);
        for (var j = 0; j < cnt * 1.6; j++) {
          spawn({ spr: Math.random() < 0.5 ? spr.heart : spr.heartPink, x: rnd(x0, x1), y: top - rnd(0, 60), vy: rnd(90, 150), s: rnd(0.45, 0.8), rot: rnd(-0.4, 0.4), vr: rnd(-1, 1), life: rnd(1.1, 1.6), delay: Math.random() * 1.1, fadeIn: 0.15, fadeOut: 0.35, wob: rnd(6, 16), wobf: rnd(0.8, 1.4) });
        }
        return;
      }
      var mx = (a.x + b.x) / 2;
      var my = Math.min(a.y, b.y) - Math.max(80, Math.abs(a.x - b.x) * 0.35);
      for (var i = 0; i < cnt; i++) {
        var back = i % 2 === 1;
        var from = back ? b : a, to = back ? a : b;
        var cy = back ? my + 50 : my;
        spawn({ spr: back ? spr.heartPink : spr.heart, x: from.x, y: from.y, path: [from.x, from.y, mx, cy, to.x, to.y], ease: U.ease.inOutSine, s: rnd(0.5, 0.75), life: 0.95, delay: i * 0.09, fadeIn: 0.1, fadeOut: 0.2, rot: rnd(-0.3, 0.3) });
      }
    },

    /** Großer Stern fliegt im Bogen zu einem Ziel (Sternenleiste). Rückgabe: Promise bei Ankunft */
    starFlight: function (from, to, o) {
      o = o || {};
      var s0 = o.scale || 1.1;
      var mx = (from.x + to.x) / 2 + (o.side || 0);
      var my = Math.min(from.y, to.y) - (o.lift || 120);
      return new Promise(function (resolve) {
        spawn({
          spr: o.rainbow ? spr.rainbowStar : spr.bigStar, x: from.x, y: from.y, path: [from.x, from.y, mx, my, to.x, to.y], ease: U.ease.inOutCubic,
          s: s0, s1: o.endScale || 0.55, life: o.duration || 0.9, fadeOut: 0, vr: 5, keep: true,
          trail: { every: 0.025, fn: function (p) { spawn({ spr: spr.sparkle, x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-10, 30), s: rnd(0.35, 0.7), s1: 0.1, life: rnd(0.4, 0.7), tw: 3 }); } },
          onDone: function () {
            FX.sparkle(to.x, to.y, 10, { radius: 18 });
            resolve();
          },
        });
      });
    },

    /** Glitzerspur zwischen zwei Punkten (Tipp) */
    glitterTrail: function (a, b, o) {
      o = o || {};
      var cnt = n(o.count || 26, 8);
      var mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 60;
      for (var i = 0; i < cnt; i++) {
        var t = i / (cnt - 1);
        var x = bez(a.x, mx, b.x, t), y = bez(a.y, my, b.y, t);
        spawn({ spr: spr.sparkle, x: x + rnd(-6, 6), y: y + rnd(-6, 6), vy: rnd(-12, 4), s: rnd(0.45, 0.85), s1: 0.2, tw: rnd(2, 3.5), life: rnd(1.2, 1.7), delay: t * 0.5, fadeIn: 0.15 });
      }
    },

    /** Wolken-Puff */
    puff: function (x, y, w) {
      var cnt = n(10, 4);
      for (var i = 0; i < cnt; i++) {
        var a = (i / cnt) * Math.PI * 2;
        var r = (w || 120) * 0.3;
        spawn({ spr: spr.puff, x: x + Math.cos(a) * r * 0.5, y: y + Math.sin(a) * r * 0.3, vx: Math.cos(a) * rnd(40, 90), vy: Math.sin(a) * rnd(20, 50), drag: 0.08, s: rnd(0.5, 0.9) * (w || 120) / 130, s1: rnd(1, 1.4) * (w || 120) / 130, life: rnd(0.45, 0.7), fadeOut: 0.6, a: 0.95 });
      }
    },

    /** Kleine Notenwölkchen (Schnurren im Spielzimmer o. ä.) */
    notes: function (x, y) {
      spawn({ spr: spr.note, x: x, y: y, vx: rnd(-20, 20), vy: -50, s: 0.8, life: 1.2, fadeOut: 0.5, wob: 6, wobf: 1 });
    },

    /** Feuerwerk: Rakete mit Funkenschweif, dann Kreisexplosion. o.onPop(x, y) für den Klang */
    firework: function (x, y, o) {
      o = o || {};
      var col = o.color || pick(PALETTE);
      if (reduced) {
        FX.sparkle(x, y, 14, { radius: 50, spread: 0.6 });
        return;
      }
      var sx = x + rnd(-60, 60), sy = H + 20;
      var t = rnd(0.9, 1.2);
      spawn({
        spr: spr.glow, x: sx, y: sy, path: [sx, sy, (sx + x) / 2, (sy + y) / 2, x, y], ease: U.ease.outCubic, s: 0.5, life: t, fadeOut: 0, keep: true,
        trail: { every: 0.03, fn: function (p) { spawn({ spr: spr.sparkle, x: p.x, y: p.y, vx: rnd(-10, 10), vy: rnd(10, 40), s: rnd(0.3, 0.5), s1: 0.1, life: rnd(0.35, 0.6) }); } },
        onDone: function () {
          if (o.onPop) o.onPop(x, y);
          var cnt = 40;
          for (var i = 0; i < cnt; i++) {
            var a = (i / cnt) * Math.PI * 2;
            var sp = rnd(120, 190);
            spawn({ spr: spr.sparkle, x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 60, drag: 0.03, s: rnd(0.5, 0.8), s1: 0.15, tw: rnd(1, 3), life: rnd(1, 1.4), fadeOut: 0.6 });
            if (i % 2 === 0) spawn({ col: col, x: x, y: y, vx: Math.cos(a) * sp * 0.8, vy: Math.sin(a) * sp * 0.8, ay: 80, drag: 0.03, w: 5, h: 5, rot: a, life: rnd(0.9, 1.3), fadeOut: 0.6 });
          }
          spawn({ spr: spr.glow, x: x, y: y, s: 1, s1: 4, a: 0.35, life: 0.5, fadeOut: 1 });
        },
      });
    },

    /** Umgebungspartikel starten (snow, leaves, fireflies, dust, glitter, petals) */
    ambient: function (kind, o) {
      FX.stopAmbient();
      if (!kind || !AMBIENT[kind] || !cx[0]) return;
      cv[0].style.display = '';
      var parts = AMBIENT[kind](o).filter(Boolean);
      ambient = {
        kind: kind,
        parts: parts,
        tick: function () {},
        resize: function () {
          parts.forEach(function (p) {
            if (p.x > W) p.x = Math.random() * W;
            if (p.y > H) p.y = Math.random() * H;
          });
        },
      };
      ensureLoop();
    },

    stopAmbient: function () {
      // ohne Umgebungspartikel die Leinwand ausblenden (eine Vollbild-Ebene weniger)
      if (cv[0] && !ambient) cv[0].style.display = 'none';
      if (!ambient) return;
      for (var i = live.length - 1; i >= 0; i--) if (live[i].layer === 0) kill(i);
      ambient = null;
      dirty[0] = true;
      if (cx[0]) {
        cx[0].setTransform(1, 0, 0, 1, 0, 0);
        cx[0].clearRect(0, 0, cv[0].width, cv[0].height);
      }
      cv[0].style.display = 'none';
    },

    /** Alle Effekte der oberen Ebene entfernen */
    clear: function () {
      for (var i = live.length - 1; i >= 0; i--) if (live[i].layer === 1) { live[i].onDone = null; kill(i); }
      dirty[1] = true;
    },

    count: function () { return live.length; },
    size: function () { return { w: W, h: H }; },
  };

  KS.FX = FX;
})(typeof window !== 'undefined' ? window : globalThis);

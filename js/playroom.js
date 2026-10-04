/* Miau-Memory – KS.Playroom: das Spielzimmer als Belohnung (Konzept 10).
   Katzen hüpfen, jagen den Laserpunkt, schubsen das Wollknäuel, fressen Leckerli und schlafen nach 30 s Ruhe ein. */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;
  var OUT = '#4B3A5A';

  var P = { cats: [], hud: null };

  function now() { return Date.now(); }
  function A() { return KS.Audio; }

  /* ---------- Bodenbereich ---------- */

  function floor() {
    var W = root.innerWidth, H = root.innerHeight;
    var info = KS.Scenes.current();
    var fy = info && info.extra && info.extra.floorY ? info.extra.floorY : H * 0.52;
    var bar = KS.Logic.barHeight(H);
    return { x0: 30, x1: W - 30, y0: Math.max(fy + 30, bar + 40), y1: H - 16, W: W, H: H };
  }
  function depthScale(y) {
    var f = floor();
    return U.lerp(0.65, 1, U.clamp((y - f.y0) / Math.max(1, f.y1 - f.y0), 0, 1));
  }
  function baseSize() {
    return Math.max(110, Math.min(260, Math.min(root.innerWidth, root.innerHeight) * 0.24));
  }

  /* ---------- Katze im Zimmer ---------- */

  function RoomCat(id, x, y) {
    var el = (this.el = U.el('div', { class: 'pr-cat' }));
    var svg = KS.CatArt.svg(id);
    el.appendChild(svg);
    this.view = new KS.CatView(svg.querySelector('.cat'));
    this.id = id;
    this.x = x;
    this.y = y;
    this.hopping = false;
    this.nextIdle = now() + 2000 + Math.random() * 5000;
    this.busy = 0;
    var self = this;
    KS.UI.tapToCat(el, this.view);
    el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      P.touch();
      self.nextIdle = now() + 4000;
    });
    this.place();
  }
  RoomCat.prototype = {
    size: function () { return baseSize() * depthScale(this.y); },
    place: function (lift, sx, sy) {
      var s = this.size();
      var el = this.el;
      el.style.width = s.toFixed(1) + 'px';
      el.style.height = s.toFixed(1) + 'px';
      el.style.zIndex = String(Math.round(this.y));
      el.style.transform = 'translate(' + (this.x - s / 2).toFixed(1) + 'px,' + (this.y - s * 0.97 - (lift || 0)).toFixed(1) + 'px) scale(' + (sx || 1).toFixed(3) + ',' + (sy || 1).toFixed(3) + ')';
    },
    /** Hopser: Bogen mit Stauchen und Strecken, 0,4–0,5 s, höchstens ~120 px */
    hop: function (tx, ty, o) {
      o = o || {};
      if (this.hopping) return false;
      var f = floor();
      var maxD = (o.maxD || 120) * depthScale(this.y) * (baseSize() / 180);
      var dx = tx - this.x, dy = ty - this.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 4) return false;
      if (d > maxD) {
        tx = this.x + (dx / d) * maxD;
        ty = this.y + (dy / d) * maxD;
        d = maxD;
      }
      tx = U.clamp(tx, f.x0, f.x1);
      ty = U.clamp(ty, f.y0, f.y1);
      var x0 = this.x, y0 = this.y;
      var self = this;
      this.hopping = true;
      this.view.lookTarget = { x: tx, y: ty - this.size() * 0.5, until: Date.now() + 900 };
      var dur = o.dur || U.lerp(400, 500, Math.min(1, d / 120));
      var arc = (o.arc || 1) * (22 + d * 0.28);
      if (A() && Math.random() < 0.35) A().sfx('boing', { vol: 0.18, pitch: 1.2 + Math.random() * 0.3 });
      U.tween({
        dur: dur,
        ease: 'linear',
        update: function (k) {
          var e = U.ease.inOutSine(k);
          self.x = U.lerp(x0, tx, e);
          self.y = U.lerp(y0, ty, e);
          var lift = Math.sin(Math.PI * k) * arc;
          // Stauchen am Anfang und bei der Landung, Strecken in der Luft
          var sq = k < 0.15 ? 1 - Math.sin((k / 0.15) * Math.PI) * 0.12 : k > 0.85 ? 1 - Math.sin(((k - 0.85) / 0.15) * Math.PI) * 0.14 : 1 + Math.sin(Math.PI * k) * 0.08;
          self.place(lift, 2 - sq, sq);
        },
        done: function () {
          self.hopping = false;
          self.place();
          if (o.done) o.done();
        },
      });
      return true;
    },
    center: function () {
      var s = this.size();
      return { x: this.x, y: this.y - s * 0.5 };
    },
    destroy: function () {
      this.view.destroy();
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    },
  };

  /* ---------- Start ---------- */

  P.start = function (o) {
    o = o || {};
    P.stop();
    var info = KS.Scenes.show('playroom', { seed: o.seed !== undefined ? +o.seed : Math.floor(Math.random() * 1e9) });
    if (A()) {
      A().music(info.music);
      A().ambience([]);
    }
    P.timers = new U.Timers();
    var ids = (o.cats || []).filter(function (id) { return KS.Cats.byId[id]; });
    var extra = U.random.shuffle(KS.Logic.CAT_IDS.filter(function (id) { return ids.indexOf(id) < 0; }));
    while (ids.length < 3) ids.push(extra.shift());
    ids = ids.slice(0, 8);
    var el = (P.el = U.el('div', { class: 'playroom' }));
    P.trail = U.svg('svg', { class: 'pr-trail' });
    P.trailPath = U.svg('path', { d: '', fill: 'none', stroke: '#FF8FB1', 'stroke-width': '4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: '0.9' });
    P.trail.appendChild(P.trailPath);
    el.appendChild(P.trail);
    U.$('#stage').appendChild(el);
    var f = floor();
    P.cats = ids.map(function (id, i) {
      var x = U.lerp(f.x0 + 60, f.x1 - 60, (i + 0.5) / ids.length) + U.random.range(-30, 30);
      var y = U.lerp(f.y0 + 20, f.y1 - 20, U.random.next());
      var c = new RoomCat(id, x, y);
      el.appendChild(c.el);
      return c;
    });
    // Wollknäuel
    P.ball = { x: f.x0 + (f.x1 - f.x0) * 0.62, y: f.y0 + (f.y1 - f.y0) * 0.55, h: 0, vx: 0, vy: 0, vh: 0, rot: 0, r: 26, held: false, hist: [] };
    P.ballEl = U.el('div', { class: 'pr-ball', html: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="#FF8FB1" stroke="' + OUT + '" stroke-width="3"/><path d="M8 24Q30 34 52 22M6 34Q30 46 54 32M16 48Q28 24 40 8M26 55Q40 30 52 40" fill="none" stroke="#FFD1DF" stroke-width="3" stroke-linecap="round"/><circle cx="21" cy="19" r="4" fill="#FFFFFF" opacity="0.7"/></svg>' });
    el.appendChild(P.ballEl);
    P.bindBall();
    // Leckerli
    P.treats = [];
    // Laser
    P.dot = U.el('div', { class: 'pr-laser' });
    el.appendChild(P.dot);
    el.addEventListener('pointerdown', P.onFloorDown);
    el.addEventListener('pointermove', P.onFloorMove);
    el.addEventListener('pointerup', P.onFloorUp);
    el.addEventListener('pointercancel', P.onFloorUp);
    // Spielleiste: Haus (halten), Fisch, Ton
    var fish = KS.UI.button({ icon: 'fish', color: 'sun', label: 'Leckerli', onTap: function () { P.treat(); } });
    P.hud = new KS.UI.Hud({ pairs: 0, onHome: function () { KS.App.go('title'); }, onSound: function () { KS.App.cycleSound(); }, extra: [fish] });
    P.hud.setSound(KS.App.settings.sound);
    P.lastInput = now();
    P.sleeping = false;
    P.trailPts = [];
    KS.CatView.onActivity = P.onActivity;
    P.unFrame = U.onFrame(P.step);
    P.timers.after(700, function () { if (KS.Speech) KS.Speech.say(KS.Logic.SAY.playroom, { priority: 2 }); });
    P.onResize = function () {
      var ff = floor();
      P.cats.forEach(function (c) { c.x = U.clamp(c.x, ff.x0, ff.x1); c.y = U.clamp(c.y, ff.y0, ff.y1); c.place(); });
      if (P.hud) P.hud.layout();
    };
    root.addEventListener('resize', P.onResize);
  };

  P.onActivity = function () { P.lastInput = now(); };

  P.stop = function () {
    if (P.timers) P.timers.clear();
    if (KS.CatView && KS.CatView.onActivity === P.onActivity) KS.CatView.onActivity = null;
    if (P.unFrame) P.unFrame();
    P.unFrame = null;
    if (P.onResize) root.removeEventListener('resize', P.onResize);
    P.cats.forEach(function (c) { c.destroy(); });
    P.cats = [];
    if (P.el && P.el.parentNode) P.el.parentNode.removeChild(P.el);
    P.el = null;
    if (P.hud) P.hud.destroy();
    P.hud = null;
    P.laser = null;
  };

  P.touch = function () {
    P.lastInput = now();
    if (P.sleeping) {
      P.sleeping = false;
      P.cats.forEach(function (c, i) { P.timers.after(i * 150, function () { c.view.wake(i === 0); }); });
    }
  };

  /* ---------- Laserpunkt ---------- */

  P.onFloorDown = function (e) {
    if (e.target !== P.el && e.target !== P.trail && !(P.trail && P.trail.contains(e.target))) return;
    KS.App.gesture();
    P.touch();
    P.laser = { x: e.clientX, y: e.clientY, id: e.pointerId };
    try { P.el.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    P.dot.classList.add('is-on');
    P.moveDot();
    if (A()) A().sfx('pop', { vol: 0.3, pitch: 1.5 });
  };
  P.onFloorMove = function (e) {
    if (!P.laser || e.pointerId !== P.laser.id) return;
    P.laser.x = e.clientX;
    P.laser.y = e.clientY;
    P.lastInput = now();
    P.moveDot();
  };
  P.onFloorUp = function (e) {
    if (!P.laser || (e && e.pointerId !== P.laser.id)) return;
    P.laser = null;
    P.dot.classList.remove('is-on');
  };
  P.moveDot = function () {
    P.dot.style.transform = 'translate(' + (P.laser.x - 11) + 'px,' + (P.laser.y - 11) + 'px)';
  };

  /* ---------- Wollknäuel ---------- */

  P.bindBall = function () {
    var el = P.ballEl;
    el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      KS.App.gesture();
      P.touch();
      var b = P.ball;
      b.held = { id: e.pointerId, ox: e.clientX - b.x, oy: e.clientY - (b.y - b.h) };
      b.hist = [{ x: e.clientX, y: e.clientY, t: now() }];
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
      el.classList.add('is-held');
    });
    el.addEventListener('pointermove', function (e) {
      var b = P.ball;
      if (!b.held || e.pointerId !== b.held.id) return;
      var f = floor();
      var px = e.clientX - b.held.ox, py = e.clientY - b.held.oy;
      b.x = U.clamp(px, f.x0, f.x1);
      // unterhalb der Bodenoberkante: auf dem Boden; darüber: in der Luft
      b.y = U.clamp(py, f.y0, f.y1);
      b.h = Math.max(0, b.y - py);
      b.hist.push({ x: e.clientX, y: e.clientY, t: now() });
      if (b.hist.length > 6) b.hist.shift();
      P.lastInput = now();
    });
    var release = function (e) {
      var b = P.ball;
      if (!b.held || e.pointerId !== b.held.id) return;
      b.held = false;
      el.classList.remove('is-held');
      var h = b.hist;
      if (h.length >= 2) {
        var a = h[0], z = h[h.length - 1];
        var dt = Math.max(16, z.t - a.t) / 1000;
        b.vx = U.clamp((z.x - a.x) / dt, -1600, 1600);
        var vy = U.clamp((z.y - a.y) / dt, -1600, 1600);
        // nach oben geworfen → fliegt hoch, nach unten → rollt weiter nach vorn
        if (vy < 0) b.vh = -vy * 0.8;
        else b.vy = vy * 0.5;
      }
      if (A()) A().sfx('whoosh', { vol: 0.25, pitch: 1.3 });
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
  };

  function ballStep(dt) {
    var b = P.ball;
    var f = floor();
    if (!b.held) {
      // Schwerkraft zum Boden, Abprallen, Reibung, Rollen
      b.vh -= 1800 * dt;
      b.h += b.vh * dt;
      if (b.h <= 0) {
        b.h = 0;
        if (b.vh < -120) {
          b.vh = -b.vh * 0.45;
          if (A()) A().sfx('plop', { vol: 0.25, pitch: 0.7 });
        } else {
          b.vh = 0;
        }
      }
      var fr = b.h > 0 ? 0.995 : Math.pow(0.12, dt);
      b.vx *= fr;
      b.vy *= fr;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < f.x0) { b.x = f.x0; b.vx = Math.abs(b.vx) * 0.6; }
      if (b.x > f.x1) { b.x = f.x1; b.vx = -Math.abs(b.vx) * 0.6; }
      if (b.y < f.y0) { b.y = f.y0; b.vy = Math.abs(b.vy) * 0.5; }
      if (b.y > f.y1) { b.y = f.y1; b.vy = -Math.abs(b.vy) * 0.5; }
      b.rot += (b.vx * dt) / b.r;
    }
    var s = depthScale(b.y) * (baseSize() / 180);
    var size = 56 * s;
    P.ballEl.style.width = size.toFixed(1) + 'px';
    P.ballEl.style.height = size.toFixed(1) + 'px';
    P.ballEl.style.zIndex = String(Math.round(b.y) + 1);
    P.ballEl.style.transform = 'translate(' + (b.x - size / 2).toFixed(1) + 'px,' + (b.y - b.h - size).toFixed(1) + 'px) rotate(' + b.rot.toFixed(2) + 'rad)';
    // Fadenspur
    var tr = P.trailPts || (P.trailPts = []);
    var tail = { x: b.x, y: b.y - b.h - size * 0.5 };
    var last = tr[tr.length - 1];
    if (!last || U.dist(last.x, last.y, tail.x, tail.y) > 6) {
      tr.push(tail);
      if (tr.length > 28) tr.shift();
      var d = '';
      for (var i = 0; i < tr.length; i++) d += (i ? 'L' : 'M') + tr[i].x.toFixed(1) + ' ' + (tr[i].y + Math.sin(i * 0.9) * 3).toFixed(1);
      P.trailPath.setAttribute('d', d);
    }
    return Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vh);
  }

  /* ---------- Leckerli ---------- */

  P.treat = function () {
    P.touch();
    if (P.treats.length >= 3) return;
    var f = floor();
    var t = { x: U.random.range(f.x0 + 60, f.x1 - 60), y: U.random.range(f.y0 + 20, f.y1 - 20), h: root.innerHeight, vh: 0, el: U.el('div', { class: 'pr-treat', html: '<svg viewBox="0 0 64 40"><path d="M4 20C12 6 32 4 44 16L58 6V34L44 24C32 36 12 34 4 20Z" fill="#FFB36B" stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"/><circle cx="15" cy="18" r="3" fill="' + OUT + '"/><path d="M26 12Q30 20 26 28" stroke="' + OUT + '" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>' }), eaten: false, eater: null };
    t.h = t.y + 40;
    P.el.appendChild(t.el);
    P.treats.push(t);
    if (A()) A().sfx('whoosh', { vol: 0.25, pitch: 0.8 });
  };

  function treatStep(dt) {
    P.treats.slice().forEach(function (t) {
      if (t.h > 0) {
        t.vh -= 1600 * dt;
        t.h = Math.max(0, t.h + t.vh * dt);
        if (t.h === 0 && t.vh < -200) { t.vh = -t.vh * 0.3; t.h = 0.01; if (A()) A().sfx('plop', { vol: 0.3, pitch: 1.1 }); }
      }
      var s = depthScale(t.y) * (baseSize() / 180);
      var w = 58 * s;
      t.el.style.width = w.toFixed(1) + 'px';
      t.el.style.zIndex = String(Math.round(t.y));
      t.el.style.transform = 'translate(' + (t.x - w / 2).toFixed(1) + 'px,' + (t.y - t.h - w * 0.62).toFixed(1) + 'px)';
      if (t.h > 0 || t.eaten) return;
      // nächste Katze hüpft hin und frisst
      var near = null, nd = 1e9;
      P.cats.forEach(function (c) {
        var d = U.dist(c.x, c.y, t.x, t.y);
        if (d < nd && (!t.eater || t.eater === c)) { nd = d; near = c; }
      });
      if (!near) return;
      t.eater = near;
      if (nd < near.size() * 0.35) {
        t.eaten = true;
        near.view.flash('meow', 300);
        near.view.flash('happy', 1600);
        if (A()) A().sfx('mampf', { vol: 0.8 });
        var cp = near.center();
        for (var i = 0; i < 5; i++) P.timers.after(i * 180, function () { if (KS.FX) KS.FX.heart(cp.x + U.random.range(-30, 30), cp.y - near.size() * 0.3, { size: 0.7 }); });
        t.el.classList.add('is-eaten');
        P.timers.after(500, function () {
          if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
          P.treats.splice(P.treats.indexOf(t), 1);
        });
        P.timers.after(700, function () { near.view.meow('mrrp', { vol: 0.6 }); });
      } else if (!near.hopping) {
        near.hop(t.x, t.y + 2);
      }
    });
  }

  /* ---------- Schleife ---------- */

  P.step = function (dt) {
    if (!P.el) return;
    var t = now();
    var ballSpeed = ballStep(dt);
    treatStep(dt);
    var b = P.ball;
    // Laserpunkt: Katzen jagen, die nächste springt ihn an
    if (P.laser) {
      var sorted = P.cats.slice().sort(function (a, c) { return U.dist(a.x, a.y, P.laser.x, P.laser.y) - U.dist(c.x, c.y, P.laser.x, P.laser.y); });
      var f = floor();
      var ly = U.clamp(P.laser.y, f.y0, f.y1);
      sorted.forEach(function (c, i) {
        c.view.lookTarget = { x: P.laser.x, y: P.laser.y, until: Date.now() + 400 };
        if (c.hopping || t < c.busy) return;
        var d = U.dist(c.x, c.y, P.laser.x, ly);
        if (i === 0 && d < c.size() * 0.9 && d > 10) {
          // Anspring-Sprung
          c.view.flash('surprised', 300);
          c.hop(P.laser.x, ly, { arc: 2.2, dur: 480, maxD: 200 });
          c.busy = t + 900;
        } else if (d > c.size() * 0.5) {
          c.hop(P.laser.x + (i ? U.random.range(-80, 80) : 0), ly + (i ? U.random.range(-40, 40) : 0));
          c.busy = t + 350 + i * 120;
        }
      });
    } else if (!b.held) {
      // Wollknäuel: Katzen in der Nähe schlagen mit der Pfote danach
      P.cats.forEach(function (c) {
        if (c.hopping || t < c.busy || P.sleeping) return;
        var d = U.dist(c.x, c.y, b.x, b.y);
        if (ballSpeed > 80 && d < 420 && d > c.size() * 0.45 && Math.random() < 0.05) {
          c.hop(b.x - Math.sign(b.x - c.x) * c.size() * 0.3, b.y);
          c.busy = t + 500;
        } else if (d < c.size() * 0.5 && b.h < 10 && Math.random() < 0.08) {
          c.view.flash('wave', 700);
          var dir = b.x >= c.x ? 1 : -1;
          b.vx += dir * U.random.range(280, 520);
          b.vy += U.random.range(-120, 120);
          b.vh = U.random.range(120, 300);
          if (A()) A().sfx('pop', { vol: 0.3, pitch: 0.9 });
          c.busy = t + 1200;
        }
      });
    }
    // Leben: ab und zu ein Hopser; nach 30 s Ruhe einschlafen
    if (!P.sleeping && t - P.lastInput > 30000) {
      P.sleeping = true;
      P.cats.forEach(function (c, i) { P.timers.after(i * 500, function () { if (P.sleeping) c.view.sleep(); }); });
    }
    if (!P.sleeping && !P.laser) {
      P.cats.forEach(function (c) {
        if (c.hopping || t < c.nextIdle || t < c.busy) return;
        c.nextIdle = t + 3000 + Math.random() * 6000;
        var r = Math.random();
        if (r < 0.55) {
          var ff = floor();
          c.hop(U.clamp(c.x + U.random.range(-140, 140), ff.x0, ff.x1), U.clamp(c.y + U.random.range(-60, 60), ff.y0, ff.y1));
        } else if (r < 0.7) {
          c.view.meow(null, { vol: 0.3 });
        } else {
          c.view.flash('tilt', 800);
        }
      });
    }
  };

  KS.Playroom = P;
})(typeof window !== 'undefined' ? window : globalThis);

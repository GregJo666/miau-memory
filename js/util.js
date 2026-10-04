/* Miau-Memory – KS.U: Zufall, Easing, Tween, DOM/SVG-Helfer, Farben, sicherer Speicher.
   Klassisches Skript (file://-tauglich). Läuft auch in Node für die Unit-Tests. */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = (KS.U = {});

  /* ---------- Zufall ---------- */

  /** mulberry32: kleiner, schneller Seed-Zufall. Liefert eine Funktion → [0, 1). */
  U.mulberry32 = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Zahl aus einem Text (FNV-1a), z. B. für Seeds aus Weltnamen. */
  U.hash = function (str) {
    var h = 0x811c9dc5;
    str = String(str);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  };

  /** Mischt einen Zahlen-Seed (murmur3 fmix32), damit nahe Seeds (1, 2, 3 …) unabhängige Folgen ergeben */
  U.mix32 = function (h) {
    h = h >>> 0;
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  };

  /** Zufallsquelle mit Komfortfunktionen. Ohne Seed: Math.random. */
  U.rng = function (seed) {
    var next = seed === undefined || seed === null ? Math.random : U.mulberry32(typeof seed === 'string' ? U.hash(seed) : U.mix32(seed + 0x9e3779b9));
    var r = {
      seed: seed,
      next: next,
      /** Kommazahl in [a, b) */
      range: function (a, b) { return a + (b - a) * next(); },
      /** Ganzzahl in [a, b] */
      int: function (a, b) { return a + Math.floor((b - a + 1) * next()); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      chance: function (p) { return next() < p; },
      sign: function () { return next() < 0.5 ? -1 : 1; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(next() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      },
      /** Unter-Zufallsquelle mit eigenem, reproduzierbarem Seed */
      fork: function (salt) { return U.rng((Math.floor(next() * 4294967296) ^ U.hash(salt || '')) >>> 0); },
    };
    return r;
  };
  U.random = U.rng();

  /* ---------- Mathe und Easing ---------- */

  U.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.invLerp = function (a, b, v) { return b === a ? 0 : (v - a) / (b - a); };
  U.dist = function (x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); };
  U.round = function (v, d) { var f = Math.pow(10, d === undefined ? 1 : d); return Math.round(v * f) / f; };

  U.ease = {
    linear: function (t) { return t; },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return t * (2 - t); },
    inOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    outBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
  };

  /* ---------- Zeit: gemeinsame rAF-Schleife und Tweens ---------- */

  var loopFns = [];
  var loopRunning = false;
  var lastT = 0;
  function frame(t) {
    var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
    lastT = t;
    var fns = loopFns.slice();
    for (var i = 0; i < fns.length; i++) {
      try { fns[i](dt, t); } catch (e) { if (root.console) console.error(e); }
    }
    if (loopFns.length) root.requestAnimationFrame(frame);
    else { loopRunning = false; lastT = 0; }
  }
  /** Meldet eine Funktion (dt in s, t in ms) für jeden Frame an. Gibt eine Abmeldefunktion zurück. */
  U.onFrame = function (fn) {
    loopFns.push(fn);
    if (!loopRunning && root.requestAnimationFrame) {
      loopRunning = true;
      root.requestAnimationFrame(frame);
    }
    return function () {
      var i = loopFns.indexOf(fn);
      if (i >= 0) loopFns.splice(i, 1);
    };
  };

  /** Tween: {dur (ms), ease, update(k, t), done} → {cancel()} */
  U.tween = function (o) {
    var start = null;
    var ease = typeof o.ease === 'function' ? o.ease : U.ease[o.ease || 'inOutQuad'];
    var dur = Math.max(1, o.dur || 300);
    var delay = o.delay || 0;
    var off = U.onFrame(function (dt, now) {
      if (start === null) start = now + delay;
      if (now < start) return;
      var t = Math.min(1, (now - start) / dur);
      o.update(ease(t), t);
      if (t >= 1) {
        off();
        if (o.done) o.done();
      }
    });
    return { cancel: off };
  };

  /* ---------- Timer-Sammlung (für sauberes Aufräumen) ---------- */

  U.Timers = function () { this.ids = []; };
  U.Timers.prototype.after = function (ms, fn) {
    var self = this;
    var id = setTimeout(function () {
      var i = self.ids.indexOf(id);
      if (i >= 0) self.ids.splice(i, 1);
      fn();
    }, ms);
    this.ids.push(id);
    return id;
  };
  U.Timers.prototype.every = function (ms, fn) {
    var id = setInterval(fn, ms);
    this.ids.push(-id - 1);
    return id;
  };
  U.Timers.prototype.clear = function () {
    for (var i = 0; i < this.ids.length; i++) {
      var id = this.ids[i];
      if (id < 0) clearInterval(-id - 1);
      else clearTimeout(id);
    }
    this.ids = [];
  };
  U.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- DOM und SVG ---------- */

  U.SVGNS = 'http://www.w3.org/2000/svg';
  U.$ = function (sel, el) { return (el || root.document).querySelector(sel); };
  U.$$ = function (sel, el) { return Array.prototype.slice.call((el || root.document).querySelectorAll(sel)); };

  /** HTML-Element: U.el('div', {class: 'x', style: '...'}, [kinder oder text]) */
  U.el = function (tag, attrs, children) {
    var e = root.document.createElement(tag);
    setAttrs(e, attrs);
    append(e, children);
    return e;
  };
  /** SVG-Element */
  U.svg = function (tag, attrs, children) {
    var e = root.document.createElementNS(U.SVGNS, tag);
    setAttrs(e, attrs);
    append(e, children);
    return e;
  };
  function setAttrs(e, attrs) {
    if (!attrs) return;
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
      if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
  }
  function append(e, children) {
    if (children === undefined || children === null) return;
    if (!Array.isArray(children)) children = [children];
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c === null || c === undefined || c === false) continue;
      e.appendChild(typeof c === 'string' ? root.document.createTextNode(c) : c);
    }
  }
  /** SVG-Markup (Fragment ohne <svg>) → Element-Liste in eine Gruppe */
  U.svgFrag = function (markup) {
    var wrap = root.document.createElementNS(U.SVGNS, 'svg');
    wrap.innerHTML = markup;
    return wrap;
  };
  /** Attribut-Text sicher machen */
  U.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  /** Klasse für eine Weile setzen (z. B. Wackeln). Startet die Animation neu, wenn sie schon läuft. */
  U.pulseClass = function (el, cls, ms) {
    if (!el) return;
    el._pulse = el._pulse || {};
    if (el._pulse[cls]) clearTimeout(el._pulse[cls]);
    if (el.classList.contains(cls)) {
      el.classList.remove(cls);
      el.getBoundingClientRect(); // Stil neu berechnen lassen, damit die Animation von vorn beginnt
    }
    el.classList.add(cls);
    el._pulse[cls] = setTimeout(function () {
      el.classList.remove(cls);
      el._pulse[cls] = 0;
    }, ms);
  };

  /* ---------- Farben ---------- */

  U.hexToRgb = function (hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgbToHex = function (r, g, b) {
    function c(v) { v = Math.round(U.clamp(v, 0, 255)).toString(16); return v.length < 2 ? '0' + v : v; }
    return '#' + c(r) + c(g) + c(b);
  };
  /** Mischt zwei Farben: t=0 → a, t=1 → b */
  U.mix = function (a, b, t) {
    var x = U.hexToRgb(a), y = U.hexToRgb(b);
    return U.rgbToHex(U.lerp(x[0], y[0], t), U.lerp(x[1], y[1], t), U.lerp(x[2], y[2], t));
  };
  U.lighten = function (hex, t) { return U.mix(hex, '#ffffff', t); };
  U.darken = function (hex, t) { return U.mix(hex, '#2a1f33', t); };
  U.rgba = function (hex, a) {
    var c = U.hexToRgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  };
  /** Helligkeit 0..1 (für Kontrastentscheidungen) */
  U.luma = function (hex) {
    var c = U.hexToRgb(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  };

  /* ---------- Sicherer Speicher (localStorage kann fehlen oder werfen) ---------- */

  var PREFIX = 'miau-memory:';
  var memory = {};
  U.store = {
    get: function (key, fallback) {
      var raw = null;
      try {
        raw = root.localStorage ? root.localStorage.getItem(PREFIX + key) : null;
      } catch (e) {
        raw = null;
      }
      if (raw === null && Object.prototype.hasOwnProperty.call(memory, key)) raw = memory[key];
      if (raw === null || raw === undefined) return fallback;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      var raw = JSON.stringify(value);
      memory[key] = raw;
      try {
        if (root.localStorage) root.localStorage.setItem(PREFIX + key, raw);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      delete memory[key];
      try {
        if (root.localStorage) root.localStorage.removeItem(PREFIX + key);
      } catch (e) { /* egal */ }
    },
  };

  /* ---------- Sonstiges ---------- */

  U.params = function () {
    var out = {};
    try {
      var q = root.location && root.location.search ? root.location.search.slice(1) : '';
      q.split('&').forEach(function (p) {
        if (!p) return;
        var i = p.indexOf('=');
        var k = decodeURIComponent(i < 0 ? p : p.slice(0, i));
        out[k] = i < 0 ? '1' : decodeURIComponent(p.slice(i + 1).replace(/\+/g, ' '));
      });
    } catch (e) { /* keine Parameter */ }
    return out;
  };

  U.reducedMotion = function () {
    try {
      return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = U;
})(typeof window !== 'undefined' ? window : globalThis);

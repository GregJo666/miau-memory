/* Miau-Memory – Debug-Galerien (nur mit ?debug=…): cats, hiders, worlds, fx */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;

  var STATES = ['blink', 'happy', 'meow', 'purr', 'surprised', 'sleep', 'wave', 'tilt', 'jump', 'spin', 'dance', 'yawn', 'stretch'];

  function page(title) {
    root.document.body.classList.add('debug-page');
    var ui = U.$('#ui');
    ui.innerHTML = '';
    var wrap = U.el('div', { class: 'dbg' }, [U.el('h1', { text: title })]);
    ui.appendChild(wrap);
    return wrap;
  }

  function cardCell(type, variant, cat, state) {
    var card = new KS.Card({ type: type, variant: variant, cat: cat });
    card.el.style.position = 'relative';
    card.el.style.width = '100%';
    card.el.style.height = 'auto';
    card.el.style.aspectRatio = '200 / 230';
    card.el.style.transform = 'none';
    if (state === 'open') card.open();
    else if (state === 'peek') card.peek(true);
    else if (state === 'found') { card.open(); card.setFound(); }
    else if (state === 'tail') card.showTail(1e9);
    return card;
  }

  /** Rendert Klänge offline und misst Spitze, Pegel, Stille und NaN (Konzept 14: Audio) */
  function renderTest(name, seconds, fn) {
    var sr = 44100;
    var ac = new OfflineAudioContext(2, Math.ceil(sr * seconds), sr);
    var E = KS.Audio.createEngine(ac);
    fn(E, ac);
    return ac.startRendering().then(function (buf) {
      var peak = 0, sum = 0, nan = 0, n = 0, tailPeak = 0;
      var tail = Math.floor(buf.length * 0.9);
      for (var c = 0; c < buf.numberOfChannels; c++) {
        var d = buf.getChannelData(c);
        for (var i = 0; i < d.length; i++) {
          var v = d[i];
          if (v !== v) { nan++; continue; }
          var a = Math.abs(v);
          if (a > peak) peak = a;
          if (i >= tail && a > tailPeak) tailPeak = a;
          sum += v * v;
          n++;
        }
      }
      var rms = Math.sqrt(sum / Math.max(1, n));
      return {
        name: name,
        peakDb: peak > 0 ? Math.round(20 * Math.log10(peak) * 10) / 10 : -999,
        rmsDb: rms > 0 ? Math.round(20 * Math.log10(rms) * 10) / 10 : -999,
        nan: nan,
        silent: peak < 0.001,
        tailPeak: Math.round(tailPeak * 1000) / 1000,
      };
    });
  }

  function audioTests() {
    var tests = [];
    var T = 0.05;
    var probe = KS.Audio.createEngine(new OfflineAudioContext(1, 128, 44100));
    Object.keys(probe.SFX).forEach(function (k) {
      tests.push(['sfx:' + k, 3, function (E) { E.sfx(k, { t: T }); }]);
    });
    KS.Cats.forEach(function (c) {
      tests.push(['miau:' + c.id + ' (' + c.voice.kind + ')', 1.8, function (E) { E.meow(c, c.voice.kind, { t: T }); }]);
    });
    Object.keys(probe.KINDS).forEach(function (k) {
      tests.push(['miau-variante:' + k, 1.8, function (E) { E.meow(KS.Cats[0], k, { t: T }); }]);
    });
    tests.push(['schnurren (voll, Schnurri)', 3, function (E, ac) {
      var h = E.purr(KS.Cats.byId.schnurri);
      h.set(1);
    }]);
    var worlds = Object.keys(KS.Scenes.worlds).map(function (id) { return [id, KS.Scenes.worlds[id].music]; });
    worlds.push(['title', KS.Scenes.special.title.music], ['playroom', KS.Scenes.special.playroom.music]);
    worlds.forEach(function (w) {
      var cfg = Object.assign({ seed: 7 }, w[1]);
      var bar = (cfg.meter || 4) * 60 / cfg.bpm;
      tests.push(['musik:' + w[0], bar * 8 + 2, function (E) {
        var s = E.startMusic(cfg);
        for (var b = 0; b < 8; b++) s.scheduleBar(b, 0.1 + b * bar);
      }]);
    });
    Object.keys(probe.AMB_EVENTS).forEach(function (k) {
      tests.push(['umgebung:' + k, 4, function (E) {
        if (probe.AMB_EVENTS[k]) { E.AMB_EVENTS[k][2](T); E.AMB_EVENTS[k][2](1.5); }
        else E.startAmbience([k]);
      }]);
    });
    tests.push(['worst case: Musik + Fanfare + 6 Miaus + Feier', 5, function (E) {
      var s = E.startMusic(Object.assign({ seed: 3 }, KS.Scenes.worlds.garden.music));
      for (var b = 0; b < 3; b++) s.scheduleBar(b, 0.1 + b * 2.3);
      E.sfx('fanfare', { t: 0.3 });
      E.sfx('match', { t: 0.35 });
      KS.Cats.slice(0, 6).forEach(function (c, i) { E.meow(c, null, { t: 0.3 + i * 0.03 }); });
      E.purr(KS.Cats[8]).set(1);
    }]);
    return tests;
  }

  KS.Debug = {
    /** ?debug=worlds: alle Welten mit Varianten (je Welt mehrere Seeds) */
    worlds: function (params) {
      var wrap = page('Welten – je drei Varianten');
      var ids = params.only ? params.only.split(',') : Object.keys(KS.Scenes.worlds).concat(['title', 'playroom']);
      var W = +(params.sw || 800), H = +(params.sh || 450);
      var n = +(params.n || 3);
      var grid = U.el('div', { class: 'dbg-grid', style: '--cell:' + (params.cell || 380) + 'px' });
      wrap.appendChild(grid);
      ids.forEach(function (id) {
        for (var k = 0; k < n; k++) {
          var seed = 11 + k * 101;
          var r = KS.Scenes.render(id, W, H, seed);
          var box = U.el('div', { class: 'dbg-scene', style: 'position:relative;width:100%;aspect-ratio:' + W + '/' + H + ';overflow:hidden;border-radius:12px' });
          var inner = U.el('div', { style: 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0' });
          inner.innerHTML = r.html;
          box.appendChild(inner);
          var label = (KS.Scenes.worlds[id] ? KS.Scenes.worlds[id].name : id) + ' · ' + Object.keys(r.variant).filter(function (x) { return typeof r.variant[x] !== 'object'; }).map(function (x) { return x + '=' + r.variant[x]; }).join(', ');
          grid.appendChild(U.el('div', { class: 'dbg-cell' }, [box, U.el('div', { class: 'name', text: label })]));
          (function (box, inner) {
            requestAnimationFrame(function () { inner.style.transform = 'scale(' + (box.clientWidth / W) + ')'; });
          })(box, inner);
        }
      });
    },

    /** ?debug=audio: alle Klänge offline rendern und prüfen */
    audio: function () {
      var wrap = page('Audio-Prüfung (OfflineAudioContext)');
      var out = U.el('pre', { style: 'font:13px/1.4 ui-monospace,monospace;white-space:pre-wrap' });
      wrap.appendChild(out);
      var tests = audioTests();
      var results = [];
      var p = Promise.resolve();
      tests.forEach(function (t) {
        p = p.then(function () { return renderTest(t[0], t[1], t[2]); }).then(function (r) {
          r.ok = r.nan === 0 && !r.silent && r.peakDb < 0;
          results.push(r);
          out.textContent += (r.ok ? 'ok   ' : 'FAIL ') + r.name + '  Spitze ' + r.peakDb + ' dBFS, RMS ' + r.rmsDb + ' dB' + (r.nan ? ', NaN ' + r.nan : '') + (r.silent ? ', STILL' : '') + '\n';
        });
      });
      KS.debug = KS.debug || {};
      KS.debug.audioDone = p.then(function () { return results; });
    },

    fx: function (params) {
      KS.FX.init();
      root.document.body.style.background = 'linear-gradient(#bfe3ff, #ffe1ec)';
      var ui = U.$('#ui');
      var bar = U.el('div', { class: 'dbg-bar', style: 'position:absolute;left:10px;top:10px;right:10px' });
      ui.appendChild(bar);
      var W = root.innerWidth, H = root.innerHeight;
      var a = { x: W * 0.3, y: H * 0.6 }, b = { x: W * 0.7, y: H * 0.6 };
      var fx = KS.FX;
      var acts = {
        'Sternexplosion': function () { fx.burst(a.x, a.y); },
        'Konfetti': function () { fx.confetti(b.x, b.y); },
        'Herzbogen': function () { fx.heartStream(a, b); },
        'Herzregen': function () { fx.heartStream(a, { x: a.x + 180, y: a.y }, { adjacent: true }); },
        'Sternflug': function () { fx.starFlight(a, { x: W / 2, y: 40 }); },
        'Regenbogenstern': function () { fx.starFlight(b, { x: W / 2 + 60, y: 40 }, { rainbow: true }); },
        'Glitzer': function () { fx.sparkle(W / 2, H / 2, 20); },
        'Glitzerspur': function () { fx.glitterTrail(a, b); },
        'Puff': function () { fx.puff(W / 2, H * 0.4, 200); },
        'Feuerwerk': function () { fx.firework(W * 0.5, H * 0.3); fx.firework(W * 0.25, H * 0.25); },
        'Konfettiregen': function () { fx.confettiRain(3); },
        'Herz': function () { for (var i = 0; i < 6; i++) fx.heart(W / 2 + i * 10, H / 2); },
      };
      Object.keys(acts).forEach(function (k) { bar.appendChild(U.el('button', { text: k, onclick: acts[k] })); });
      ['snow', 'leaves', 'fireflies', 'dust', 'glitter', 'petals'].forEach(function (k) {
        bar.appendChild(U.el('button', { text: 'Umgebung: ' + k, onclick: function () { fx.ambient(k); } }));
      });
      bar.appendChild(U.el('button', { text: 'aus', onclick: function () { fx.stopAmbient(); fx.clear(); } }));
      KS.debug = KS.debug || {};
      KS.debug.fx = acts;
      if (params.demo) {
        fx.ambient(params.demo === '1' ? 'snow' : params.demo);
        Object.keys(acts).forEach(function (k) { if (k !== 'Konfettiregen') acts[k](); });
      }
    },

    hiders: function (params) {
      var wrap = page('Verstecke – zu, Guck-Phase, offen, gefunden, Tipp');
      var bar = U.el('div', { class: 'dbg-bar' });
      wrap.appendChild(bar);
      var types = params.only ? params.only.split(',') : Object.keys(KS.Hiders.types);
      var cats = KS.Cats.map(function (c) { return c.id; });
      var all = [];
      var grid = U.el('div', { class: 'dbg-grid', style: '--cell:' + (params.cell || 150) + 'px' });
      wrap.appendChild(grid);
      var states = params.states ? params.states.split(',') : ['closed', 'peek', 'open', 'found', 'tail'];
      types.forEach(function (type, ti) {
        var t = KS.Hiders.types[type];
        var vi = +(params.variant || 0);
        states.forEach(function (st, si) {
          var card = cardCell(type, t.variants[(vi + (st === 'found' ? 1 : 0)) % t.variants.length], cats[(ti * 3 + si) % cats.length], st);
          all.push(card);
          grid.appendChild(U.el('div', { class: 'dbg-cell' }, [card.el, U.el('div', { class: 'name', text: t.name + ' · ' + st })]));
        });
      });
      bar.appendChild(U.el('button', { text: 'alle öffnen', onclick: function () { all.forEach(function (c) { c.open(); }); } }));
      bar.appendChild(U.el('button', { text: 'alle schließen', onclick: function () { all.forEach(function (c) { c.close(); c.peek(false); }); } }));
      bar.appendChild(U.el('button', { text: 'wackeln', onclick: function () { all.forEach(function (c) { c.wiggle(true); }); } }));
      bar.appendChild(U.el('button', { text: 'einfallen', onclick: function () { all.forEach(function (c, i) { c.dropIn(i * 60); }); } }));
      KS.debug = KS.debug || {};
      KS.debug.cards = all;
    },

    cats: function (params) {
      var wrap = page('Katzengalerie – alle 12 Katzen');
      var grid = U.el('div', { class: 'dbg-grid', style: '--cell:' + (params.cell || 230) + 'px' });
      wrap.appendChild(grid);
      var list = params.only ? params.only.split(',') : KS.Cats.map(function (c) { return c.id; });
      var fixed = params.state ? params.state.split(',') : [];
      list.forEach(function (id) {
        var c = KS.Cats.byId[id];
        var svg = KS.CatArt.svg(id);
        var cat = svg.querySelector('.cat');
        cat.classList.add('is-wag');
        fixed.forEach(function (st) { cat.classList.add('is-' + st); });
        var btns = U.el('div', { class: 'dbg-btns' });
        STATES.forEach(function (st) {
          btns.appendChild(U.el('button', {
            text: st,
            onclick: function () { cat.classList.toggle('is-' + st); },
          }));
        });
        grid.appendChild(U.el('div', { class: 'dbg-cell' }, [svg, U.el('div', { class: 'name', text: c.name }), params.nobtn ? null : btns]));
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);

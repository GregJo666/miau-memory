/* Miau-Memory – KS.Audio: alles synthetisch mit der Web Audio API (Konzept 11).
   Busse Effekte / Musik / Umgebung → Kompressor → Limiter → Ausgang, dazu ein Hall-Send.
   KS.Audio.createEngine(ctx) baut die gleiche Klangmaschine auch auf einem OfflineAudioContext (Tests). */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* =====================================================================
     Engine
     ===================================================================== */

  function createEngine(ac) {
    var E = { ac: ac };
    var sr = ac.sampleRate;

    // Ausgang: Master → Kompressor → Limiter → Ziel
    var master = ac.createGain();
    master.gain.value = 0.8;
    var comp = ac.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 14;
    comp.ratio.value = 4;
    comp.attack.value = 0.006;
    comp.release.value = 0.2;
    var lim = ac.createDynamicsCompressor();
    lim.threshold.value = -4;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.001;
    lim.release.value = 0.08;
    var post = ac.createGain();
    post.gain.value = 0.92;
    master.connect(comp);
    comp.connect(lim);
    lim.connect(post);
    post.connect(ac.destination);

    var sfx = ac.createGain();
    sfx.gain.value = 1;
    var music = ac.createGain();
    music.gain.value = 0.15;
    var amb = ac.createGain();
    amb.gain.value = 0.5;
    sfx.connect(master);
    music.connect(master);
    amb.connect(master);

    // Hall: selbst erzeugte Impulsantwort (~2 s abklingendes Rauschen)
    var rev = ac.createConvolver();
    var irLen = Math.floor(sr * 2.1);
    var ir = ac.createBuffer(2, irLen, sr);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var i = 0; i < irLen; i++) {
        var t = i / irLen;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (i < 200 ? i / 200 : 1);
      }
    }
    rev.buffer = ir;
    var revOut = ac.createGain();
    revOut.gain.value = 0.32;
    rev.connect(revOut);
    revOut.connect(master);
    var revMusic = ac.createGain();
    revMusic.gain.value = 0.55;
    music.connect(revMusic);
    revMusic.connect(rev);
    var revSfx = ac.createGain();
    revSfx.gain.value = 1;
    revSfx.connect(rev);

    // Rauschen (einmal erzeugt)
    var noiseBuf = ac.createBuffer(1, sr * 2, sr);
    var nd = noiseBuf.getChannelData(0);
    for (var k = 0; k < nd.length; k++) nd[k] = Math.random() * 2 - 1;

    // weiche Wellenform für Katzenstimmen: Obertöne ~1/n^1.2
    var N = 28;
    var real = new Float32Array(N), imag = new Float32Array(N);
    for (var h = 1; h < N; h++) imag[h] = 1 / Math.pow(h, 1.2);
    var catWave = ac.createPeriodicWave(real, imag);

    E.bus = { master: master, sfx: sfx, music: music, amb: amb, rev: revSfx, revMusic: revMusic };
    E.noiseBuf = noiseBuf;

    /* ---------- Grundbausteine ---------- */

    function now() { return ac.currentTime; }
    E.now = now;

    function gain(v, dest) {
      var g = ac.createGain();
      g.gain.value = v === undefined ? 1 : v;
      if (dest) g.connect(dest);
      return g;
    }
    function osc(type, f, dest) {
      var o = ac.createOscillator();
      if (type === 'cat') o.setPeriodicWave(catWave);
      else o.type = type;
      o.frequency.value = f;
      if (dest) o.connect(dest);
      return o;
    }
    function filt(type, f, q, dest) {
      var b = ac.createBiquadFilter();
      b.type = type;
      b.frequency.value = f;
      b.Q.value = q === undefined ? 0.7 : q;
      if (dest) b.connect(dest);
      return b;
    }
    function noise(dest, loop) {
      var s = ac.createBufferSource();
      s.buffer = noiseBuf;
      s.loop = loop !== false;
      s.loopStart = 0;
      s.loopEnd = noiseBuf.duration;
      if (dest) s.connect(dest);
      return s;
    }
    /** Hüllkurve: Anstieg a, dann exponentieller Ausklang bis t+dur */
    function env(param, t, peak, a, dur, floor) {
      param.cancelScheduledValues(t);
      param.setValueAtTime(0.0001, t);
      param.linearRampToValueAtTime(peak, t + a);
      param.exponentialRampToValueAtTime(Math.max(0.0001, floor || 0.0001), t + Math.max(a + 0.01, dur));
    }
    /** Hall nur für Effekte; der Musikbus hat einen eigenen Hall-Send (sonst wäre der Hall lauter als die Musik) */
    function sendRev(node, dest) {
      if (dest === sfx) node.connect(revSfx);
    }
    function start(n, t) { n._start = t; n.start(t); n._started = true; }
    function end(n, t) { try { n.stop(t); } catch (e) { /* egal */ } }

    E.util = { gain: gain, osc: osc, filt: filt, noise: noise, env: env, start: start, end: end };

    /* ---------- Instrumente (Konzept 11.4) ---------- */

    /** Spieluhr/Glockenspiel: Sinus mit Obertönen 2×, 3×, 4,2× und exponentiellem Abklingen */
    E.musicbox = function (f, t, vol, dest, o) {
      o = o || {};
      var out = gain(1, dest);
      var partials = o.partials || [[1, 1, 1.4], [2, 0.32, 0.7], [3, 0.12, 0.45], [4.2, 0.08, 0.3]];
      var decay = o.decay || 1.2;
      partials.forEach(function (p) {
        var g = gain(0, out);
        var s = osc('sine', f * p[0], g);
        env(g.gain, t, vol * p[1], 0.004, decay * p[2]);
        start(s, t);
        end(s, t + decay * p[2] + 0.05);
      });
      if (o.rev !== false) sendRev(out, dest);
      return decay;
    };
    E.celesta = function (f, t, vol, dest) {
      return E.musicbox(f, t, vol, dest, { decay: 1.5, partials: [[1, 1, 1], [2, 0.22, 0.5], [4, 0.05, 0.25]] });
    };
    E.glock = function (f, t, vol, dest) {
      return E.musicbox(f, t, vol, dest, { decay: 1.1, partials: [[1, 1, 1], [2.76, 0.28, 0.4], [5.4, 0.1, 0.18]] });
    };
    /** Marimba: Sinus plus 4×-Oberton, kurz */
    E.marimba = function (f, t, vol, dest) {
      var out = gain(1, dest);
      var g1 = gain(0, out), g2 = gain(0, out);
      var s1 = osc('sine', f, g1), s2 = osc('sine', f * 4, g2);
      env(g1.gain, t, vol, 0.005, 0.55);
      env(g2.gain, t, vol * 0.25, 0.002, 0.12);
      start(s1, t); start(s2, t);
      end(s1, t + 0.6); end(s2, t + 0.2);
      return 0.55;
    };
    /** Glocke per FM (Modulator 3,5×) */
    E.bell = function (f, t, vol, dest, dur) {
      dur = dur || 2;
      var out = gain(1, dest);
      sendRev(out, dest);
      var g = gain(0, out);
      var car = osc('sine', f, g);
      var mod = osc('sine', f * 3.5);
      var mg = gain(0, car.frequency);
      mod.connect(mg);
      mg.gain.setValueAtTime(f * 2.2, t);
      mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur * 0.7);
      env(g.gain, t, vol, 0.003, dur);
      start(car, t); start(mod, t);
      end(car, t + dur + 0.05); end(mod, t + dur + 0.05);
      return dur;
    };
    /** Zupfen: gefilterter Sägezahn mit schnell fallendem Filter */
    E.pluck = function (f, t, vol, dest, o) {
      o = o || {};
      var out = gain(1, dest);
      var lp = filt('lowpass', 3500, 2, out);
      var g = gain(0, lp);
      var s = osc(o.type || 'sawtooth', f, g);
      lp.frequency.setValueAtTime(o.bright || 3600, t);
      lp.frequency.exponentialRampToValueAtTime(o.dark || 380, t + 0.22);
      env(g.gain, t, vol, 0.003, o.decay || 0.7);
      start(s, t);
      end(s, t + (o.decay || 0.7) + 0.05);
      return 0.7;
    };
    E.ukulele = function (f, t, vol, dest) {
      return E.pluck(f, t, vol, dest, { type: 'triangle', bright: 5000, dark: 900, decay: 0.9 });
    };
    /** weiche Fläche: verstimmte Dreiecke durch Tiefpass, langsamer Anstieg */
    E.pad = function (freqs, t, dur, vol, dest) {
      var out = gain(0, dest);
      var lp = filt('lowpass', 900, 0.5, out);
      out.gain.setValueAtTime(0.0001, t);
      out.gain.linearRampToValueAtTime(vol, t + Math.min(0.8, dur * 0.35));
      out.gain.setValueAtTime(vol, t + dur * 0.7);
      out.gain.linearRampToValueAtTime(0.0001, t + dur);
      freqs.forEach(function (f) {
        [-6, 6].forEach(function (cents) {
          var s = osc('triangle', f, lp);
          s.detune.value = cents;
          start(s, t);
          end(s, t + dur + 0.05);
        });
      });
      return dur;
    };
    E.bass = function (f, t, dur, vol, dest) {
      var g = gain(0, dest);
      var lp = filt('lowpass', 600, 0.7, g);
      var s = osc('triangle', f, lp);
      env(g.gain, t, vol, 0.01, dur);
      start(s, t);
      end(s, t + dur + 0.05);
    };
    /** Schellen: kurze, hoch gefilterte Rauschstöße */
    E.jingle = function (t, vol, dest, count) {
      count = count || 5;
      for (var i = 0; i < count; i++) {
        var tt = t + i * rand(0.035, 0.07);
        var g = gain(0, dest);
        var hp = filt('bandpass', rand(6500, 8500), 3, g);
        var nz = noise(hp, false);
        env(g.gain, tt, vol * rand(0.5, 1), 0.002, 0.09);
        start(nz, tt);
        end(nz, tt + 0.12);
        var gb = gain(0, dest);
        var sb = osc('sine', rand(3800, 4600), gb);
        env(gb.gain, tt, vol * 0.2, 0.002, 0.12);
        start(sb, tt);
        end(sb, tt + 0.15);
      }
    };

    /* ---------- Katzenstimmen (Konzept 11.2) ---------- */

    var KINDS = {
      mi: { dur: 0.34, curve: [0.95, 1.2, 1.0], cut: [500, 3200, 900], peakAt: 0.25 },
      miau: { dur: 0.7, curve: [0.85, 1.15, 0.7], cut: [400, 2800, 500], peakAt: 0.2 },
      miaaau: { dur: 1.15, curve: [0.85, 1.22, 0.72], cut: [400, 3000, 500], peakAt: 0.22 },
      mrrp: { dur: 0.55, curve: [0.8, 0.9, 1.25], cut: [500, 1800, 2400], peakAt: 0.3, trill: true },
      mau: { dur: 0.72, curve: [0.8, 1.05, 0.68], cut: [350, 1900, 420], peakAt: 0.22 },
      'mi-au': { dur: 0.78, curve: [0.95, 1.18, 0.75], cut: [500, 3000, 600], peakAt: 0.18, split: true },
      'miau?': { dur: 0.72, curve: [0.85, 1.05, 1.3], cut: [400, 2600, 1800], peakAt: 0.2 },
      miu: { dur: 0.45, curve: [0.95, 1.25, 1.05], cut: [600, 3600, 1200], peakAt: 0.22 },
    };
    E.KINDS = KINDS;

    /** Miau. cat: Katzendaten (voice.f0, voice.kind), kind: Variante, o: {vol, pitch, t, dest} */
    E.meow = function (cat, kind, o) {
      o = o || {};
      var v = (cat && cat.voice) || { f0: 650, kind: 'miau' };
      kind = kind || (Math.random() < 0.25 ? pick(['miau', 'mi', 'miaaau']) : v.kind);
      var K = KINDS[kind] || KINDS.miau;
      var t = o.t === undefined ? now() + 0.01 : o.t;
      var f0 = v.f0 * (o.pitch || 1) * rand(0.96, 1.04);
      var dur = K.dur * rand(0.92, 1.08) * (o.stretch || 1);
      var vol = (o.vol === undefined ? 1 : o.vol) * 0.34;
      var dest = o.dest || sfx;

      var out = gain(0, dest);
      var lp = filt('lowpass', K.cut[0], 7.5);
      var dry = gain(0.75, out);
      var form = filt('bandpass', 1500, 2.8);
      var formG = gain(0.55, out);
      lp.connect(dry);
      lp.connect(form);
      form.connect(formG);
      var s = osc('cat', f0 * K.curve[0], lp);
      // Tonhöhe: Bogen f0·0,85 → f0·1,15 (bei 35 %) → f0·0,7
      s.frequency.setValueAtTime(f0 * K.curve[0], t);
      s.frequency.linearRampToValueAtTime(f0 * K.curve[1], t + dur * 0.35);
      s.frequency.linearRampToValueAtTime(f0 * K.curve[2], t + dur);
      // Vibrato 6 Hz, ±2 %
      var vib = osc('sine', 6);
      var vibG = gain(f0 * 0.02, s.frequency);
      vib.connect(vibG);
      // Filter öffnet und schließt: „mi-a-u“
      lp.frequency.setValueAtTime(K.cut[0], t);
      lp.frequency.exponentialRampToValueAtTime(K.cut[1], t + dur * 0.35);
      lp.frequency.exponentialRampToValueAtTime(K.cut[2], t + dur);
      form.frequency.setValueAtTime(1100, t);
      form.frequency.linearRampToValueAtTime(2300, t + dur * 0.35);
      form.frequency.linearRampToValueAtTime(1200, t + dur);
      // Hüllkurve: weicher „m“-Einsatz, Maximum bei ~20 %, Ausklang
      var g = out.gain;
      g.setValueAtTime(0.0001, t);
      g.linearRampToValueAtTime(vol * 0.3, t + 0.04);
      g.linearRampToValueAtTime(vol, t + dur * K.peakAt);
      if (K.split) {
        g.linearRampToValueAtTime(vol * 0.35, t + dur * 0.42);
        g.linearRampToValueAtTime(vol * 0.85, t + dur * 0.55);
      }
      g.setValueAtTime(vol * (K.split ? 0.85 : 0.9), t + dur * 0.6);
      g.exponentialRampToValueAtTime(0.0001, t + dur);
      // Triller: 25-Hz-Amplitudenmodulation am Anfang
      if (K.trill) {
        var tr = osc('square', 25);
        var trG = gain(0);
        tr.connect(trG);
        var am = gain(1);
        dry.disconnect();
        dry.connect(am);
        am.connect(out);
        trG.connect(am.gain);
        trG.gain.setValueAtTime(0.5, t);
        trG.gain.setValueAtTime(0.5, t + dur * 0.4);
        trG.gain.linearRampToValueAtTime(0, t + dur * 0.5);
        start(tr, t);
        end(tr, t + dur + 0.05);
      }
      // etwas Hauchrauschen
      var ng = gain(0, out);
      var hp = filt('highpass', 2500, 0.7, ng);
      var nz = noise(hp, false);
      env(ng.gain, t, 0.05, 0.03, dur * 0.8);
      start(s, t); start(vib, t); start(nz, t);
      end(s, t + dur + 0.05); end(vib, t + dur + 0.05); end(nz, t + dur + 0.05);
      if (v.sparkle) {
        for (var i = 0; i < 3; i++) E.glock(mtof(pick([88, 91, 93, 96])), t + dur * 0.3 + i * 0.08, 0.05 * (o.vol || 1), dest);
      }
      return dur;
    };

    /* ---------- Schnurren (Konzept 11.3) ---------- */

    E.purr = function (cat, o) {
      o = o || {};
      var t = now() + 0.01;
      var cap = 0.24 * ((cat && cat.purr) || 1); // Obergrenze fürs Schnurren
      var out = gain(0, o.dest || sfx);
      // Rauschen → Tiefpass 400 Hz, Amplitude mit ~26 Hz gepulst
      var am = gain(0.5, out);
      var lp = filt('lowpass', 400, 0.8, am);
      var nz = noise(lp, true);
      var rate = 24 + Math.random() * 4;
      var pulse = osc('sine', rate);
      var pg = gain(0.5, am.gain);
      pulse.connect(pg);
      // dazu ein Sägezahn bei 26 Hz → Tiefpass 180 Hz
      var sawG = gain(0.5, out);
      var slp = filt('lowpass', 180, 1, sawG);
      var saw = osc('sawtooth', rate, slp);
      // Atemzyklus ~0,5 Hz: Einatmen höher und leiser
      var breath = osc('sine', 0.5);
      var bg = gain(60, lp.frequency);
      breath.connect(bg);
      var bgg = gain(0.15, am.gain);
      breath.connect(bgg);
      [nz, pulse, saw, breath].forEach(function (n) { start(n, t); });
      out.gain.setValueAtTime(0.0001, t);
      var level = 0;
      var h = {
        set: function (x) {
          x = Math.max(0, Math.min(1, x));
          if (Math.abs(x - level) < 0.02) return;
          level = x;
          // nie vor dem Startzeitpunkt planen, sonst überschreibt ihn setValueAtTime(t)
          out.gain.setTargetAtTime(Math.max(0.0001, cap * (0.35 + 0.65 * x)), Math.max(now(), t + 0.001), 0.15);
        },
        stop: function (fade) {
          var tt = now();
          fade = fade || 0.8;
          out.gain.cancelScheduledValues(tt);
          out.gain.setTargetAtTime(0.0001, tt, fade / 4);
          [nz, pulse, saw, breath].forEach(function (n) { end(n, tt + fade + 0.1); });
        },
      };
      h.set(0.2);
      return h;
    };

    /* ---------- Effekte (Konzept 11.4) ---------- */

    function plop(t, vol, pitch, dest) {
      var g = gain(0, dest || sfx);
      var s = osc('sine', 600 * pitch, g);
      s.frequency.setValueAtTime(600 * pitch, t);
      s.frequency.exponentialRampToValueAtTime(150 * pitch, t + 0.08);
      env(g.gain, t, vol * 0.5, 0.004, 0.12);
      start(s, t);
      end(s, t + 0.15);
    }
    function noiseBurst(t, dur, vol, type, f, q, dest, a) {
      var g = gain(0, dest || sfx);
      var fl = filt(type, f, q, g);
      var nz = noise(fl, false);
      env(g.gain, t, vol, a || 0.005, dur);
      start(nz, t);
      end(nz, t + dur + 0.05);
      return fl;
    }
    function tinkle(t, vol, count, dest) {
      for (var i = 0; i < count; i++) {
        E.glock(mtof(pick([84, 86, 88, 91, 93, 96, 98, 100])), t + i * rand(0.04, 0.09), vol * rand(0.5, 1), dest || sfx);
      }
    }
    function arp(notes, t, step, vol, inst, dest) {
      notes.forEach(function (m, i) { (E[inst] || E.musicbox)(mtof(m), t + i * step, vol, dest || sfx); });
    }

    var SFX = {
      plop: function (t, o) { plop(t, o.vol, o.pitch); },
      pop: function (t, o) { plop(t, o.vol * 0.7, 1.6 * o.pitch); },
      boing: function (t, o) {
        var g = gain(0, sfx);
        var s = osc('triangle', 220 * o.pitch, g);
        s.frequency.setValueAtTime(200 * o.pitch, t);
        s.frequency.exponentialRampToValueAtTime(620 * o.pitch, t + 0.12);
        s.frequency.exponentialRampToValueAtTime(420 * o.pitch, t + 0.3);
        var lfo = osc('sine', 18);
        var lg = gain(30 * o.pitch, s.frequency);
        lfo.connect(lg);
        env(g.gain, t, o.vol * 0.35, 0.01, 0.34);
        start(s, t); start(lfo, t);
        end(s, t + 0.4); end(lfo, t + 0.4);
      },
      ding: function (t, o) {
        E.bell(1568 * o.pitch, t, o.vol * 0.28, sfx, 1.4);
        E.glock(3136 * o.pitch, t + 0.01, o.vol * 0.08, sfx);
      },
      bonus: function (t, o) {
        arp([84, 88, 91, 96, 100], t, 0.06, o.vol * 0.16, 'glock');
        tinkle(t + 0.3, o.vol * 0.1, 5);
      },
      match: function (t, o) {
        // Dur-Dreiklang aufwärts plus Glitzer
        arp([72, 76, 79, 84], t, 0.09, o.vol * 0.22, 'musicbox');
        arp([84], t + 0.36, 0.1, o.vol * 0.14, 'bell');
        tinkle(t + 0.2, o.vol * 0.09, 6);
      },
      sparkle: function (t, o) { tinkle(t, o.vol * 0.12, 7); },
      hint: function (t, o) { tinkle(t, o.vol * 0.12, 5); },
      hm: function (t, o) {
        // zwei weiche Töne abwärts, neugierig
        [[587, 0], [494, 0.2]].forEach(function (n, i) {
          var g = gain(0, sfx);
          var s = osc('triangle', n[0], g);
          var vib = osc('sine', 5.5);
          var vg = gain(n[0] * 0.012, s.frequency);
          vib.connect(vg);
          if (i === 1) {
            s.frequency.setValueAtTime(n[0], t + n[1]);
            s.frequency.linearRampToValueAtTime(n[0] * 1.06, t + n[1] + 0.26);
          }
          env(g.gain, t + n[1], o.vol * 0.16, 0.03, 0.32);
          start(s, t + n[1]); start(vib, t + n[1]);
          end(s, t + n[1] + 0.4); end(vib, t + n[1] + 0.4);
        });
      },
      whoosh: function (t, o) {
        var fl = noiseBurst(t, 0.45, o.vol * 0.22, 'bandpass', 400, 1.2, sfx, 0.15);
        fl.frequency.setValueAtTime(350 * o.pitch, t);
        fl.frequency.exponentialRampToValueAtTime(2200 * o.pitch, t + 0.2);
        fl.frequency.exponentialRampToValueAtTime(600 * o.pitch, t + 0.45);
      },
      fanfare: function (t, o) {
        arp([67, 72, 76, 79], t, 0.13, o.vol * 0.2, 'musicbox');
        [72, 76, 79, 84].forEach(function (m) { E.musicbox(mtof(m), t + 0.6, o.vol * 0.12, sfx, { decay: 2 }); });
        E.bell(mtof(84), t + 0.6, o.vol * 0.14, sfx, 2.4);
        tinkle(t + 0.7, o.vol * 0.08, 6);
      },
      firework: function (t, o) {
        // gedämpftes Puff und leises Knistern (keine lauten Knalle)
        noiseBurst(t, 0.35, o.vol * 0.3, 'lowpass', 500, 0.7, sfx, 0.01);
        for (var i = 0; i < 10; i++) noiseBurst(t + 0.1 + Math.random() * 0.6, 0.02, o.vol * rand(0.03, 0.08), 'highpass', 4000, 0.7);
      },
      mampf: function (t, o) {
        for (var i = 0; i < 4; i++) {
          noiseBurst(t + i * 0.16, 0.08, o.vol * 0.22, 'bandpass', rand(600, 1100), 2, sfx, 0.01);
          plop(t + i * 0.16 + 0.02, o.vol * 0.3, 0.5, sfx);
        }
      },
      yawn: function (t, o) {
        E.meow({ voice: { f0: 520 * o.pitch } }, 'miaaau', { t: t, vol: o.vol * 0.7, stretch: 1.3 });
      },
      rustle: function (t, o) {
        for (var i = 0; i < 5; i++) noiseBurst(t + i * rand(0.02, 0.05), 0.05, o.vol * rand(0.1, 0.2), 'highpass', 3000, 0.8);
      },
      // Versteck-Klänge (Konzept 7.3)
      flap: function (t, o) {
        noiseBurst(t, 0.12, o.vol * 0.4, 'bandpass', 700, 1.5, sfx, 0.004);
        var g = gain(0, sfx);
        var s = osc('sine', 130, g);
        env(g.gain, t, o.vol * 0.35, 0.004, 0.12);
        start(s, t); end(s, t + 0.15);
        noiseBurst(t + 0.09, 0.09, o.vol * 0.25, 'bandpass', 900, 1.5, sfx, 0.004);
      },
      leaves: function (t, o) {
        for (var i = 0; i < 9; i++) noiseBurst(t + i * rand(0.015, 0.04), 0.04, o.vol * rand(0.08, 0.2), 'bandpass', rand(2500, 6000), 1.2);
      },
      softwhoosh: function (t, o) {
        var fl = noiseBurst(t, 0.5, o.vol * 0.25, 'lowpass', 600, 0.7, sfx, 0.18);
        fl.frequency.setValueAtTime(400, t);
        fl.frequency.linearRampToValueAtTime(1500, t + 0.25);
        fl.frequency.linearRampToValueAtTime(500, t + 0.5);
      },
      paper: function (t, o) {
        for (var i = 0; i < 7; i++) noiseBurst(t + i * rand(0.02, 0.05), 0.05, o.vol * rand(0.1, 0.25), 'bandpass', rand(1500, 4000), 2);
        plop(t + 0.28, o.vol * 0.8, 1.2);
      },
      clack: function (t, o) {
        var g = gain(0, sfx);
        var s = osc('sine', 1800, g);
        env(g.gain, t, o.vol * 0.25, 0.001, 0.05);
        start(s, t); end(s, t + 0.08);
        noiseBurst(t, 0.03, o.vol * 0.2, 'highpass', 2000, 0.7);
        // Blubbern
        for (var i = 0; i < 4; i++) {
          var tt = t + 0.12 + i * rand(0.06, 0.1);
          var gb = gain(0, sfx);
          var b = osc('sine', rand(500, 800), gb);
          b.frequency.setValueAtTime(rand(400, 600), tt);
          b.frequency.exponentialRampToValueAtTime(rand(1100, 1600), tt + 0.06);
          env(gb.gain, tt, o.vol * 0.12, 0.005, 0.07);
          start(b, tt); end(b, tt + 0.1);
        }
      },
      tock: function (t, o) {
        var g = gain(0, sfx);
        var s = osc('sine', 240, g);
        s.frequency.setValueAtTime(260, t);
        s.frequency.exponentialRampToValueAtTime(180, t + 0.18);
        env(g.gain, t, o.vol * 0.45, 0.002, 0.25);
        start(s, t); end(s, t + 0.3);
        noiseBurst(t, 0.03, o.vol * 0.2, 'bandpass', 1200, 3);
      },
      puff: function (t, o) {
        var fl = noiseBurst(t, 0.35, o.vol * 0.3, 'lowpass', 1200, 0.7, sfx, 0.02);
        fl.frequency.setValueAtTime(2000, t);
        fl.frequency.exponentialRampToValueAtTime(300, t + 0.35);
      },
    };
    var HIDER_SOUND = { box: 'flap', pot: 'leaves', basket: 'softwhoosh', gift: 'paper', shell: 'clack', pumpkin: 'tock', cloud: 'puff' };
    E.SFX = SFX;
    E.HIDER_SOUND = HIDER_SOUND;

    E.sfx = function (name, o) {
      o = o || {};
      var fn = SFX[name];
      if (!fn) return;
      fn(o.t === undefined ? now() + 0.005 : o.t, { vol: o.vol === undefined ? 1 : o.vol, pitch: o.pitch || 1 });
    };

    E.hider = function (type, o) {
      o = o || {};
      E.sfx(HIDER_SOUND[type] || 'plop', { vol: (o.vol || 1) * (o.close ? 0.6 : 1), t: o.t });
    };

    /* ---------- Musik (Konzept 11.5) ---------- */

    var KEYS = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
    var MAJOR = [0, 2, 4, 5, 7, 9, 11];
    var PENTA = [0, 2, 4, 7, 9];
    var ROMAN = { I: [0, 'M'], ii: [1, 'm'], iii: [2, 'm'], IV: [3, 'M'], V: [4, 'M'], vi: [5, 'm'] };

    function chordNotes(tonic, roman) {
      var r = ROMAN[roman] || ROMAN.I;
      var deg = r[0];
      var root = tonic + MAJOR[deg];
      var third = tonic + MAJOR[(deg + 2) % 7] + (deg + 2 >= 7 ? 12 : 0);
      var fifth = tonic + MAJOR[(deg + 4) % 7] + (deg + 4 >= 7 ? 12 : 0);
      return [root, third, fifth];
    }
    E.chordNotes = chordNotes;

    /** Melodie-Motiv (Pentatonik, Motiv-Wiederholung A A' B A, Pausen zwischen Phrasen) */
    function makePhrase(rng, beats, chords, tonic, variantOf) {
      var RHY = beats === 3
        ? [[1, 1, 1], [2, 1], [1, 0.5, 0.5, 1], [1.5, 0.5, 1], [0.5, 0.5, 1, 1]]
        : [[1, 1, 1, 1], [1, 0.5, 0.5, 2], [0.5, 0.5, 1, 1, 1], [1.5, 0.5, 1, 1], [2, 1, 1], [1, 1, 2]];
      // Pentatonik über zwei Oktaven um die Melodielage
      var scale = [];
      [0, 12].forEach(function (o) { PENTA.forEach(function (p) { scale.push(tonic + 12 + p + o); }); });
      scale.push(tonic + 36);
      var notes = [];
      var idx = 2;
      for (var bar = 0; bar < 4; bar++) {
        if (variantOf && bar < 3) {
          // A': die ersten drei Takte wie A, nur das Ende ist neu
          variantOf.forEach(function (n) { if (n.bar === bar) notes.push(n); });
          continue;
        }
        var last = bar === 3;
        var rh = last ? (beats === 3 ? [2, 1] : [2, 2]) : RHY[Math.floor(rng() * RHY.length)];
        var chord = chords[bar % chords.length];
        var beat = 0;
        for (var i = 0; i < rh.length; i++) {
          var len = rh[i];
          if (last && i === rh.length - 1) break; // Pause am Phrasenende
          if (i === 0) {
            // Taktanfang: nächster Akkordton
            var best = idx, bd = 99;
            for (var k = 0; k < scale.length; k++) {
              if (chord.indexOf((scale[k] - tonic) % 12) < 0) continue;
              var dd = Math.abs(k - idx);
              if (dd < bd) { bd = dd; best = k; }
            }
            idx = best;
          } else {
            idx += Math.floor(rng() * 5) - 2;
            idx = Math.max(0, Math.min(scale.length - 1, idx));
          }
          notes.push({ bar: bar, beat: beat, len: len, m: scale[idx] });
          beat += len;
        }
      }
      return notes;
    }
    E.makePhrase = makePhrase;

    var seq = null;

    E.startMusic = function (cfg, busDest) {
      E.stopMusic();
      if (!cfg) return;
      var tonic = KEYS[cfg.key] || 60;
      var beats = cfg.meter || 4;
      var spb = 60 / (cfg.bpm || 90);
      var prog = (cfg.prog || 'I-IV-V-I').split('-');
      var chordsAbs = prog.map(function (r) { return chordNotes(tonic, r); });
      var chordsRel = chordsAbs.map(function (c) { return c.map(function (n) { return (n - tonic) % 12; }); });
      var seed = (cfg.seed || 1) >>> 0;
      var rng = (KS.U ? KS.U.mulberry32(seed) : Math.random);
      var dest = busDest || music;
      var s = (seq = { cfg: cfg, next: now() + 0.15, bar: 0, rng: rng, timer: null, dest: dest });
      var A, A2, Bp;
      function compose() {
        A = makePhrase(rng, beats, chordsRel, tonic);
        A2 = makePhrase(rng, beats, chordsRel, tonic, A);
        Bp = makePhrase(rng, beats, chordsRel, tonic);
      }
      compose();
      var inst = cfg.inst || 'musicbox';
      function melodyInst(f, t, vol) {
        if (inst === 'marimba') return E.marimba(f, t, vol * 1.1, dest);
        if (inst === 'celesta') return E.celesta(f, t, vol, dest);
        if (inst === 'glock') return E.glock(f, t, vol * 0.9, dest);
        if (inst === 'ukulele') return E.ukulele(f, t, vol * 0.8, dest);
        return E.musicbox(f, t, vol, dest, { decay: 1.1 });
      }
      function scheduleBar(barNo, t0) {
        var section = Math.floor(barNo / 4) % 4; // A A' B A
        var phrase = section === 0 ? A : section === 1 ? A2 : section === 2 ? Bp : A;
        var inBar = barNo % 4;
        var chord = chordsAbs[inBar % chordsAbs.length];
        var swing = cfg.swing || 0;
        // Bass auf Schlag 1 und 3 (im 3/4-Takt auf 1)
        E.bass(mtof(chord[0] - 24), t0, spb * (beats === 3 ? 2.5 : 1.8), 0.5, dest);
        if (beats === 4) E.bass(mtof(chord[0] - 24 + (barNo % 2 ? 7 : 0)), t0 + 2 * spb, spb * 1.8, 0.4, dest);
        // Begleitung
        if (cfg.pad) E.pad(chord.map(function (m) { return mtof(m - 12); }), t0, spb * beats + 0.1, 0.1, dest);
        if (cfg.pluck || inst === 'ukulele') {
          for (var e = 0; e < beats * 2; e++) {
            var tt = t0 + e * spb * 0.5 + (e % 2 ? swing * spb : 0);
            var note = chord[[0, 1, 2, 1][e % 4]] - (e % 4 === 0 ? 12 : 0);
            E.pluck(mtof(note), tt, 0.1, dest, { decay: 0.4, type: inst === 'ukulele' ? 'triangle' : 'sawtooth' });
          }
        } else if (cfg.marimba || inst === 'marimba') {
          for (var b = 1; b < beats; b++) chord.forEach(function (m) { E.marimba(mtof(m - 12), t0 + b * spb, 0.06, dest); });
        } else if (!cfg.pad) {
          for (var b2 = 1; b2 < beats; b2++) E.musicbox(mtof(chord[b2 % 3]), t0 + b2 * spb, 0.07, dest, { decay: 0.6, rev: false });
        }
        if (cfg.bells && inBar === 0) E.jingle(t0, 0.05, dest, 4);
        if (cfg.bell && inBar === 0 && section === 2) E.bell(mtof(chord[0] + 12), t0, 0.08, dest, 2.5);
        // Melodie
        phrase.filter(function (n) { return n.bar === inBar; }).forEach(function (n) {
          var off = n.beat % 1 === 0.5 ? swing * spb : 0;
          melodyInst(mtof(n.m), t0 + n.beat * spb + off, 0.2);
        });
        if (barNo % 16 === 15) compose();
      }
      s.scheduleBar = scheduleBar;
      function pump() {
        if (seq !== s) return;
        while (s.next < now() + 0.2) {
          scheduleBar(s.bar, s.next);
          s.next += beats * spb;
          s.bar++;
        }
      }
      s.pump = pump;
      if (!ac.startRendering) {
        s.timer = setInterval(pump, 25);
        pump();
      }
      return s;
    };

    E.stopMusic = function () {
      if (seq && seq.timer) clearInterval(seq.timer);
      seq = null;
    };
    E.seq = function () { return seq; };

    /* ---------- Umgebung (Konzept 11.6) ---------- */

    var ambNodes = [];
    var ambTimer = null;
    var ambKinds = [];

    function ambLoop(kind) {
      var t = now() + 0.05;
      if (kind === 'sea') {
        var g = gain(0, amb);
        var lp = filt('lowpass', 700, 0.5, g);
        var nz = noise(lp, true);
        var lfo = osc('sine', 0.12);
        var lg = gain(0.12, g.gain);
        lfo.connect(lg);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16, t + 2);
        start(nz, t); start(lfo, t);
        ambNodes.push(nz, lfo, g);
      } else if (kind === 'wind') {
        var g2 = gain(0, amb);
        var bp = filt('bandpass', 500, 1.4, g2);
        var nz2 = noise(bp, true);
        var lfo2 = osc('sine', 0.07);
        var lg2 = gain(260, bp.frequency);
        lfo2.connect(lg2);
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.linearRampToValueAtTime(0.1, t + 2);
        start(nz2, t); start(lfo2, t);
        ambNodes.push(nz2, lfo2, g2);
      } else if (kind === 'fire') {
        var g3 = gain(0, amb);
        var lp3 = filt('lowpass', 300, 0.5, g3);
        var nz3 = noise(lp3, true);
        g3.gain.setValueAtTime(0.0001, t);
        g3.gain.linearRampToValueAtTime(0.05, t + 2);
        start(nz3, t);
        ambNodes.push(nz3, g3);
      }
    }

    var AMB_EVENTS = {
      birds: [1.2, 4, function (t) {
        var g = gain(0, amb);
        var s = osc('sine', 3000, g);
        var n0 = Math.floor(rand(2, 5)), base = rand(2600, 3800);
        for (var i = 0; i < n0; i++) {
          var tt = t + i * rand(0.07, 0.12);
          s.frequency.setValueAtTime(base, tt);
          s.frequency.exponentialRampToValueAtTime(base * rand(1.2, 1.5), tt + 0.04);
          s.frequency.exponentialRampToValueAtTime(base * 0.9, tt + 0.07);
        }
        env(g.gain, t, 0.05, 0.01, n0 * 0.1 + 0.05);
        start(s, t); end(s, t + n0 * 0.12 + 0.1);
      }],
      crickets: [0.6, 1.6, function (t) {
        // Pulse um 4,5 kHz: Hüllkurve × Pulsung (0…1)
        var g = gain(0, amb);
        var pulseG = gain(0.5, g);
        var s = osc('sine', 4500, pulseG);
        var am = osc('square', 60);
        var amg = gain(0.5, pulseG.gain);
        am.connect(amg);
        env(g.gain, t, 0.03, 0.02, 0.28);
        start(s, t); start(am, t); end(s, t + 0.3); end(am, t + 0.3);
      }],
      owl: [18, 36, function (t) {
        [0, 0.45].forEach(function (d, i) {
          var g = gain(0, amb);
          var s = osc('sine', 380, g);
          var vb = osc('sine', 7);
          var vg = gain(6, s.frequency);
          vb.connect(vg);
          env(g.gain, t + d, 0.09, 0.05, i ? 0.7 : 0.3);
          start(s, t + d); start(vb, t + d); end(s, t + d + 0.8); end(vb, t + d + 0.8);
        });
      }],
      gull: [14, 30, function (t) {
        for (var i = 0; i < 3; i++) {
          var tt = t + i * 0.28;
          var g = gain(0, amb);
          var lp = filt('lowpass', 2400, 1, g);
          var s = osc('sawtooth', 900, lp);
          s.frequency.setValueAtTime(1100, tt);
          s.frequency.exponentialRampToValueAtTime(760, tt + 0.22);
          env(g.gain, tt, 0.03, 0.02, 0.24);
          start(s, tt); end(s, tt + 0.3);
        }
      }],
      sleigh: [12, 26, function (t) { E.jingle(t, 0.06, amb, 10); }],
      chimes: [3, 8, function (t) {
        for (var i = 0; i < Math.floor(rand(2, 4)); i++) E.glock(mtof(pick([79, 81, 84, 86, 88, 91])), t + i * rand(0.15, 0.4), 0.04, amb);
      }],
      clock: [1, 1, function (t) { noiseBurst(t, 0.015, 0.06, 'bandpass', 2400, 6, amb, 0.001); }],
      bee: [22, 45, function (t) {
        // leises Summen: Sägezahn mit Tiefpass und Tremolo, zieht vorbei
        var g = gain(0, amb);
        var lp = filt('lowpass', 900, 1.5, g);
        var s = osc('sawtooth', 210, lp);
        var trem = osc('sine', 28);
        var tg = gain(0.012, g.gain);
        trem.connect(tg);
        s.frequency.setValueAtTime(200, t);
        s.frequency.linearRampToValueAtTime(235, t + 0.7);
        s.frequency.linearRampToValueAtTime(205, t + 1.6);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.6);
        g.gain.linearRampToValueAtTime(0.0001, t + 1.7);
        start(s, t); start(trem, t); end(s, t + 1.8); end(trem, t + 1.8);
      }],
      fire: [0.1, 0.5, function (t) { noiseBurst(t, rand(0.005, 0.02), rand(0.02, 0.07), 'highpass', rand(1500, 4000), 0.7, amb, 0.001); }],
      rustle: [4, 9, function (t) {
        for (var i = 0; i < 8; i++) noiseBurst(t + i * rand(0.03, 0.08), 0.06, rand(0.02, 0.05), 'bandpass', rand(2000, 5000), 1.2, amb);
      }],
      wind: null,
      sea: null,
    };
    E.AMB_EVENTS = AMB_EVENTS;

    E.startAmbience = function (kinds) {
      E.stopAmbience();
      ambKinds = (kinds || []).slice();
      ambKinds.forEach(function (k) { if (k === 'sea' || k === 'wind' || k === 'fire') ambLoop(k); });
      var next = {};
      var t0 = now();
      ambKinds.forEach(function (k) { if (AMB_EVENTS[k]) next[k] = t0 + rand(0.5, AMB_EVENTS[k][1]); });
      if (ac.startRendering) return;
      ambTimer = setInterval(function () {
        var t = now();
        ambKinds.forEach(function (k) {
          var ev = AMB_EVENTS[k];
          if (!ev || t < next[k]) return;
          ev[2](t + 0.05);
          next[k] = t + rand(ev[0], ev[1]);
        });
      }, 100);
    };
    E.ambienceKinds = function () { return ambKinds.slice(); };

    E.stopAmbience = function () {
      if (ambTimer) clearInterval(ambTimer);
      ambTimer = null;
      var t = now();
      ambNodes.forEach(function (n) {
        if (n.gain) {
          try { n.gain.cancelScheduledValues(t); n.gain.setTargetAtTime(0.0001, t, 0.3); } catch (e) { /* egal */ }
        } else {
          end(n, t + 1.5);
        }
      });
      ambNodes = [];
      ambKinds = [];
    };

    return E;
  }

  /* =====================================================================
     Live-Instanz: startet erst nach der ersten Nutzergeste
     ===================================================================== */

  var E = null;
  var state = { volume: 0.8, mode: 'all', musicOn: true, ambOn: true, music: null, amb: [], ducked: false, speaking: false };

  function ensure() {
    if (E) return E;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try {
      E = createEngine(new AC({ latencyHint: 'interactive' }));
    } catch (e) {
      try { E = createEngine(new AC()); } catch (e2) { E = null; }
    }
    if (E) applyLevels(true);
    return E;
  }

  function sfxOn() { return state.mode !== 'off'; }
  function musicOn() { return state.mode === 'all' && state.musicOn; }
  function ambOn() { return state.mode !== 'off' && state.ambOn; }

  function applyLevels(instant) {
    if (!E) return;
    var t = E.ac.currentTime;
    var v = state.volume * state.volume;
    var tc = instant ? 0.01 : 0.2;
    E.bus.master.gain.setTargetAtTime(state.mode === 'off' ? 0 : 0.9 * v, t, tc);
    E.bus.music.gain.setTargetAtTime(musicOn() ? (state.ducked ? 0.055 : 0.15) : 0, t, tc);
    E.bus.amb.gain.setTargetAtTime(ambOn() ? 0.5 : 0, t, tc);
  }

  function running() { return E && E.ac.state === 'running'; }

  var Audio = {
    createEngine: createEngine,

    /** Bei der ersten Nutzergeste aufrufen */
    unlock: function () {
      var e = ensure();
      if (!e) return;
      if (e.ac.state !== 'running') {
        try {
          var p = e.ac.resume();
          if (p && p.catch) p.catch(function () {});
        } catch (err) { /* egal */ }
      }
      if (state.music && !e.seq() && musicOn()) e.startMusic(state.music);
      if (state.amb.length && ambOn() && !e.ambienceKinds().length) e.startAmbience(state.amb);
    },
    suspend: function () {
      if (!E) return;
      E.stopMusic();
      E.stopAmbience();
      try { E.ac.suspend(); } catch (e) { /* egal */ }
    },
    resume: function () {
      if (!E) return;
      try {
        var p = E.ac.resume();
        if (p && p.then) p.then(function () { Audio.music(state.music); Audio.ambience(state.amb); }).catch(function () {});
      } catch (e) { /* egal */ }
    },
    setVolume: function (v) {
      state.volume = Math.max(0, Math.min(1, +v || 0));
      applyLevels();
    },
    /** mode: all | nomusic | off; dazu die Eltern-Schalter für Musik und Umgebung */
    setMode: function (mode, musicAllowed, ambAllowed) {
      var hadMusic = musicOn(), hadAmb = ambOn();
      state.mode = mode || 'all';
      if (musicAllowed !== undefined) state.musicOn = !!musicAllowed;
      if (ambAllowed !== undefined) state.ambOn = !!ambAllowed;
      applyLevels();
      if (!E || !running()) return;
      if (musicOn() && !hadMusic && state.music) E.startMusic(state.music);
      if (!musicOn() && hadMusic) E.stopMusic();
      if (ambOn() && !hadAmb) E.startAmbience(state.amb);
      if (!ambOn() && hadAmb) E.stopAmbience();
    },
    sfx: function (name, o) {
      if (!sfxOn() || !running()) return;
      E.sfx(name, o);
    },
    hider: function (type, o) {
      if (!sfxOn() || !running()) return;
      E.hider(type, o);
    },
    /** Miau; Rückgabe: Dauer in Sekunden (auch ohne Ton, damit der Mund passend offen ist) */
    meow: function (cat, kind, o) {
      if (!sfxOn() || !running()) {
        var K = createEngineKinds[kind || (cat && cat.voice && cat.voice.kind)] || { dur: 0.7 };
        return K.dur;
      }
      return E.meow(cat, kind, o);
    },
    purr: function (cat) {
      if (!sfxOn() || !running()) return { set: function () {}, stop: function () {} };
      return E.purr(cat);
    },
    music: function (cfg) {
      state.music = cfg || null;
      if (!E || !running()) return;
      if (cfg && musicOn()) E.startMusic(cfg);
      else E.stopMusic();
    },
    stopMusic: function () {
      state.music = null;
      if (E) E.stopMusic();
    },
    ambience: function (kinds) {
      state.amb = (kinds || []).slice();
      if (!E || !running()) return;
      if (ambOn() && state.amb.length) E.startAmbience(state.amb);
      else E.stopAmbience();
    },
    /** Musik beim Sprechen kurz absenken */
    duck: function (on) {
      state.ducked = !!on;
      applyLevels();
    },
    duckMusic: function (level, seconds) {
      Audio.duck(true);
      clearTimeout(Audio._duckT);
      Audio._duckT = setTimeout(function () { if (!state.speaking) Audio.duck(false); }, (seconds || 3) * 1000);
    },
    speaking: function (on) {
      state.speaking = !!on;
      Audio.duck(on);
    },
    engine: function () { return E; },
    state: state,
  };

  // Dauer der Varianten auch ohne laufenden Kontext (Mundanimation)
  var createEngineKinds = {
    mi: { dur: 0.34 }, miau: { dur: 0.7 }, miaaau: { dur: 1.15 }, mrrp: { dur: 0.55 }, mau: { dur: 0.72 }, 'mi-au': { dur: 0.78 }, 'miau?': { dur: 0.72 }, miu: { dur: 0.45 },
  };

  KS.Audio = Audio;
})(typeof window !== 'undefined' ? window : globalThis);

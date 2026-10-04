/* Miau-Memory – KS.App: Start, Einstellungen, Sterne, Bildschirmwechsel, Debug-Parameter */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});
  var U = KS.U;
  var L = KS.Logic;
  var doc = root.document;

  var App = (KS.App = {
    settings: L.sanitizeSettings(U.store.get('settings', null)),
    stars: Math.max(0, U.store.get('stars', 0) | 0),
    screen: null,
    unlocked: false,
    busy: false,
  });

  App.save = function () {
    U.store.set('settings', App.settings);
  };

  App.setSetting = function (key, value) {
    var s = {};
    for (var k in App.settings) s[k] = App.settings[k];
    s[key] = value;
    App.settings = L.sanitizeSettings(s);
    App.save();
    App.applySound();
  };

  /** Erste Nutzergeste: Audio starten (Autoplay-Regeln) */
  App.gesture = function () {
    if (App.unlocked) {
      if (KS.Audio) KS.Audio.unlock();
      return;
    }
    App.unlocked = true;
    if (KS.Audio) KS.Audio.unlock();
    App.applySound();
    if (App.pendingMusic && KS.Audio) {
      KS.Audio.music(App.pendingMusic);
      App.pendingMusic = null;
    }
  };

  App.applySound = function () {
    var s = App.settings;
    if (KS.Audio) {
      KS.Audio.setVolume(s.volume);
      KS.Audio.setMode(s.sound, s.music, s.ambience);
    }
    if (KS.Speech) KS.Speech.enabled = s.speech && s.sound !== 'off';
  };

  App.cycleSound = function () {
    App.setSetting('sound', L.nextSoundMode(App.settings.sound));
    var hud = App.currentHud();
    if (hud) hud.setSound(App.settings.sound);
  };

  App.currentHud = function () {
    if (App.screen === 'game' && KS.Game) return KS.Game.hud;
    if (App.screen === 'playroom' && KS.Playroom) return KS.Playroom.hud;
    return null;
  };

  App.addStars = function (n) {
    var r = L.addStars(App.stars, n);
    App.stars = r.total;
    U.store.set('stars', App.stars);
    return r;
  };

  App.resetStars = function () {
    App.stars = 0;
    U.store.set('stars', 0);
  };

  /* ---------- Bildschirme ---------- */

  function leave() {
    if (KS.UI && KS.UI.Won) KS.UI.Won.hide();
    if (App.screen === 'title' && KS.UI.Title) KS.UI.Title.hide();
    if (App.screen === 'game') KS.Game.stop();
    if (App.screen === 'playroom' && KS.Playroom) KS.Playroom.stop();
    if (KS.FX) KS.FX.clear();
    if (KS.Speech) KS.Speech.cancel();
  }

  function enter(screen, o) {
    App.screen = screen;
    if (screen === 'title') KS.UI.Title.show(o);
    else if (screen === 'game') KS.Game.start(o);
    else if (screen === 'playroom') KS.Playroom.start(o);
  }

  /** Wechsel mit „Wusch“-Vorhang */
  App.go = function (screen, o) {
    if (App.busy) return;
    if (!App.screen || (o && o.instant)) {
      leave();
      enter(screen, o);
      return;
    }
    App.busy = true;
    var c = doc.getElementById('curtain');
    if (KS.Audio) KS.Audio.sfx('whoosh', { vol: 0.5 });
    c.className = 'layer is-in';
    setTimeout(function () {
      leave();
      enter(screen, o);
      c.className = 'layer is-out';
      setTimeout(function () {
        c.className = 'layer';
        App.busy = false;
      }, 520);
    }, 480);
  };

  App.won = function (result) {
    var r = App.addStars(result.stars);
    result.total = App.stars;
    result.milestones = r.milestones;
    KS.UI.Won.show(result);
  };

  /** Musik beim Titel erst nach dem ersten Tipp */
  App.music = function (cfg) {
    if (!KS.Audio) return;
    if (App.unlocked) KS.Audio.music(cfg);
    else App.pendingMusic = cfg;
  };

  /* ---------- Schutz vor versehentlichen Aktionen (Konzept 12.6) ---------- */

  function guard() {
    doc.addEventListener('contextmenu', function (e) {
      if (!e.target.closest || !e.target.closest('input, textarea')) e.preventDefault();
    });
    doc.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });
    doc.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
    doc.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    // Nutzergeste für Audio und Sprache: Chrome auf Android zählt ein pointerdown per Finger nicht,
    // deshalb zusätzlich pointerup, touchend und click
    ['pointerdown', 'pointerup', 'touchend', 'click'].forEach(function (t) {
      doc.addEventListener(t, function () { App.gesture(); }, { capture: true, passive: true });
    });
    doc.addEventListener('keydown', function (e) {
      if (!App.unlocked) App.gesture();
      if (e.key === 'Escape' && KS.UI && KS.UI.closeDialogs) KS.UI.closeDialogs();
    });
    doc.addEventListener('visibilitychange', function () {
      if (!KS.Audio) return;
      if (doc.hidden) KS.Audio.suspend();
      else KS.Audio.resume();
    });
  }

  /* ---------- Als App installierbar (nur über https oder localhost, nie per file://) ---------- */

  App.installed = function () {
    return !!(root.matchMedia && root.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  };

  function installable() {
    if (!/^https?:$/.test(root.location.protocol)) return;
    // Manifest erst hier einhängen: per file:// würde Chrome es vergeblich laden und einen Fehler melden
    var link = doc.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.webmanifest';
    doc.head.appendChild(link);
    var nav = root.navigator;
    if (!nav.serviceWorker) return;
    var register = function () {
      nav.serviceWorker.register('sw.js').catch(function () { /* dann eben ohne Offline-Start */ });
    };
    if (doc.readyState === 'complete') register();
    else root.addEventListener('load', register);
    // Installiert: Sterne und Einstellungen vor dem Aufräumen des Browsers schützen
    if (App.installed() && nav.storage && nav.storage.persist) nav.storage.persist().catch(function () {});
  }

  /* ---------- Start ---------- */

  function start() {
    var params = U.params();
    KS.params = params;
    installable();
    if (params.debug && KS.Debug && KS.Debug[params.debug]) {
      KS.Debug[params.debug](params);
      return;
    }
    guard();
    if (KS.FX) KS.FX.init();
    App.applySound();
    if (params.debug) {
      KS.debug = KS.debug || {};
      KS.debug.solve = function (o) { return KS.Game.debugSolve(o); };
      KS.debug.state = function () {
        return { screen: App.screen, phase: KS.Game.phase, world: KS.Game.world, stars: App.stars, round: KS.Game.round };
      };
      KS.debug.unlock = function () { App.gesture(); };
    }
    if (params.screen === 'playroom') {
      App.go('playroom', { instant: true, cats: params.cats ? params.cats.split(',') : null, seed: params.seed });
    } else if (params.screen === 'title') {
      App.go('title', { instant: true });
    } else if (params.world || params.level || params.seed || params.screen === 'game') {
      App.go('game', { instant: true, world: params.world, level: params.level ? +params.level : undefined, seed: params.seed, variant: params.variant !== undefined ? +params.variant : undefined });
    } else {
      App.go('title', { instant: true });
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})(typeof window !== 'undefined' ? window : globalThis);

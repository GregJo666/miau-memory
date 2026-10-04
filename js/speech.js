/* Miau-Memory – KS.Speech: Sprachausgabe mit deutscher Stimme (Konzept 11.7).
   Vor jedem neuen Satz cancel(), nie zwei Sätze gleichzeitig; Lob und Zählen haben Vorrang.
   Ohne deutsche Stimme bleibt das Spiel still – ohne Fehlermeldung. */
(function (root) {
  'use strict';
  var KS = (root.KS = root.KS || {});

  var synth = root.speechSynthesis || null;
  var voice = null;
  var current = null; // { priority, done }
  var pendingT = 0;
  var PREFER = ['natural', 'google deutsch', 'katja', 'hedda'];

  /** Online-Stimmen (localService === false) senden den Text an einen Server – nur mit Erlaubnis der Eltern */
  function onlineAllowed() {
    return !!(KS.App && KS.App.settings && KS.App.settings.onlineVoice);
  }

  function pickVoice() {
    if (!synth) return null;
    var list = [];
    try { list = synth.getVoices() || []; } catch (e) { list = []; }
    var allowOnline = onlineAllowed();
    var de = list.filter(function (v) {
      return /^de([-_]|$)/i.test(v.lang || '') && (allowOnline || v.localService !== false);
    });
    if (!de.length) return null;
    for (var i = 0; i < PREFER.length; i++) {
      for (var j = 0; j < de.length; j++) {
        if ((de[j].name || '').toLowerCase().indexOf(PREFER[i]) >= 0) return de[j];
      }
    }
    var deDE = de.filter(function (v) { return /de[-_]DE/i.test(v.lang); });
    return (deDE[0] || de[0]);
  }

  function refresh() { voice = pickVoice(); }
  if (synth) {
    refresh();
    try {
      if (synth.addEventListener) synth.addEventListener('voiceschanged', refresh);
      else synth.onvoiceschanged = refresh;
    } catch (e) { /* egal */ }
  }

  function finish(entry) {
    if (!entry || entry.finished) return;
    entry.finished = true;
    clearTimeout(entry.guard);
    if (current === entry) {
      current = null;
      if (KS.Audio && KS.Audio.speaking) KS.Audio.speaking(false);
    }
    if (entry.onEnd) {
      try { entry.onEnd(); } catch (e) { if (root.console) console.error(e); }
    }
  }

  var Speech = {
    enabled: true,

    available: function () {
      if (!voice) refresh();
      return !!(synth && voice);
    },

    voiceName: function () {
      if (!voice) refresh();
      return voice ? voice.name + ' (' + voice.lang + (voice.localService === false ? ', online' : ', auf dem Gerät') + ')' : '';
    },

    /** Nach Änderung der Erlaubnis für Online-Stimmen neu wählen */
    refresh: function () { refresh(); },

    /**
     * Spricht text. o: {priority: 1 leise Info | 2 normal | 3 Lob/Zählen, onEnd, force}
     * Rückgabe true, wenn gesprochen wird (onEnd folgt dann), sonst false.
     */
    say: function (text, o) {
      o = o || {};
      var prio = o.priority || 2;
      if (!text || (!Speech.enabled && !o.force) || !Speech.available()) return false;
      // Vorrang: ein laufender wichtigerer Satz wird nicht unterbrochen
      if (current && !current.finished && current.priority > prio) return false;
      var prev = current;
      var entry = { priority: prio, onEnd: o.onEnd, finished: false, keep: !!o.keep };
      current = entry;
      if (prev) {
        prev.onEnd = null;
        finish(prev);
        current = entry;
      }
      clearTimeout(pendingT);
      var wasSpeaking = false;
      try {
        wasSpeaking = synth.speaking || synth.pending;
        synth.cancel();
      } catch (e) { /* egal */ }
      var go = function () {
        if (entry.finished || current !== entry) return;
        var u;
        try {
          u = new root.SpeechSynthesisUtterance(text);
        } catch (e) {
          finish(entry);
          return;
        }
        u.voice = voice;
        u.lang = voice.lang || 'de-DE';
        u.rate = 0.95;
        u.pitch = 1.15;
        var vol = KS.App && KS.App.settings ? KS.App.settings.volume : 0.8;
        u.volume = Math.max(0.2, Math.min(1, vol + 0.15));
        u.onstart = function () { if (KS.Audio && KS.Audio.speaking) KS.Audio.speaking(true); };
        u.onend = function () { finish(entry); };
        u.onerror = function () { finish(entry); };
        // Sicherheitsnetz, falls onend ausbleibt (bekanntes Chrome-Verhalten)
        entry.guard = setTimeout(function () { finish(entry); }, 1500 + text.length * 110);
        try {
          synth.speak(u);
        } catch (e) {
          finish(entry);
        }
      };
      // Chrome verschluckt Sätze direkt nach cancel() manchmal – kurz warten
      if (wasSpeaking) pendingT = setTimeout(go, 70);
      else go();
      return true;
    },

    /** Beendet die Ausgabe. Sätze mit keep (z. B. „Los geht's!“) überstehen einen Bildschirmwechsel, außer force. */
    cancel: function (force) {
      if (!force && current && current.keep && !current.finished) return;
      clearTimeout(pendingT);
      var c = current;
      current = null;
      if (c) {
        c.onEnd = null;
        c.finished = true;
        clearTimeout(c.guard);
      }
      try { if (synth) synth.cancel(); } catch (e) { /* egal */ }
      if (KS.Audio && KS.Audio.speaking) KS.Audio.speaking(false);
    },
  };

  KS.Speech = Speech;
})(typeof window !== 'undefined' ? window : globalThis);

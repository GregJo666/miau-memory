/* Miau-Memory – Service Worker: macht das installierte Spiel offline spielbar.
   Wird nur über https (oder localhost) registriert, nie per file://. Siehe KS.App in js/main.js.
   VERSION setzt tools/pages.mjs beim Veröffentlichen auf einen Hash aller Dateien. Mit 'dev' holt
   der Worker immer zuerst frisch aus dem Netz, damit lokale Änderungen sofort sichtbar sind. */
'use strict';

var VERSION = 'c7c51b9d7338';
var CACHE = 'miau-memory-' + VERSION;

// Alles, was das Spiel braucht (tests/app.test.js prüft die Liste gegen index.html und das Manifest)
var FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/util.js',
  'js/logic.js',
  'js/audio.js',
  'js/speech.js',
  'js/cats.js',
  'js/hiders.js',
  'js/scenes.js',
  'js/fx.js',
  'js/game.js',
  'js/playroom.js',
  'js/ui.js',
  'js/debug.js',
  'js/main.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        // cache: 'reload' umgeht den HTTP-Cache, damit keine alten Dateien in die neue Version rutschen
        return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) {
          return k.indexOf('miau-memory-') === 0 && k !== CACHE;
        }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function fromCache(req) {
  // Seitenaufrufe (auch mit ?debug=… usw.) bekommen immer index.html
  var key = req.mode === 'navigate' ? 'index.html' : req;
  return caches.open(CACHE).then(function (c) { return c.match(key, { ignoreSearch: true }); });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (VERSION === 'dev') {
    e.respondWith(fetch(req).catch(function () {
      return fromCache(req).then(function (r) { return r || Response.error(); });
    }));
    return;
  }
  e.respondWith(fromCache(req).then(function (r) { return r || fetch(req); }));
});

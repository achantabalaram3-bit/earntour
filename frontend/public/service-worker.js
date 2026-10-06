/*
 * TallSkill PWA Service Worker
 *
 * Intentionally does NOT cache network responses.
 * Live TallSkill data must continue to come from the network.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/*
 * Minimal network-only fetch handler.
 *
 * A fetch handler is required for the browser to treat the app as an
 * installable PWA (so the install prompt can fire). It intentionally does
 * NOT cache anything — every request goes straight to the network so live
 * TallSkill data (auth, APIs, contests, wallet, leaderboards, Free World,
 * Special Challenge) is never served stale.
 */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(fetch(event.request));
});
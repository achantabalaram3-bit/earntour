/*
 * Prize League PWA Service Worker
 *
 * Intentionally does NOT cache network responses.
 * Live Prize League data must continue to come from the network.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/*
 * No fetch handler by design.
 *
 * This prevents the service worker from interfering with:
 * - authentication
 * - APIs
 * - contests
 * - wallet
 * - payments
 * - leaderboards
 * - Free World
 * - Special Challenge
 */
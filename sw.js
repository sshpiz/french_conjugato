// sw.js - minimal no-op service worker for PWA compliance
// This service worker does nothing but allows the app to be installable

self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Do nothing - let all requests pass through normally
  // This allows the app to work exactly as before
});

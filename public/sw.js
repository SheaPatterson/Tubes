/// <reference lib="webworker" />

/**
 * Service Worker for Amp Simulation Platform
 *
 * Caches DSP engine files, amp/FX/cabinet data, UI assets, and static resources
 * for offline use. Uses cache-first for static assets and network-first for API calls.
 *
 * Requirements: 17.4, 23.1
 */

const CACHE_NAME = 'amp-sim-v1';

/** Static assets to pre-cache on install */
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

/**
 * Patterns for cache-first strategy (static assets, DSP engine, data).
 * Matched against request URL pathname.
 */
const CACHE_FIRST_PATTERNS = [
  /\/_next\/static\//,       // Next.js static JS/CSS chunks
  /\.(?:js|css|woff2?|ttf|otf|eot)$/,  // Scripts, styles, fonts
  /\.(?:png|jpg|jpeg|gif|svg|ico|webp)$/, // Images
  /\/dsp\//,                 // DSP engine / AudioWorklet files
  /\/data\//,                // Amp, FX, cabinet data files
  /\/icons\//,               // PWA icons
];

/**
 * Patterns for network-first strategy (API, dynamic content).
 */
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /convex/,
];

// ── Install ──

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ── Activate ──

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch ──

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-first for API / dynamic calls
  if (NETWORK_FIRST_PATTERNS.some((p) => p.test(url.pathname) || p.test(url.href))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets, DSP engine, data files
  if (CACHE_FIRST_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first for navigation and everything else
  event.respondWith(networkFirst(request));
});

// ── Strategies ──

/**
 * Cache-first: return cached response if available, otherwise fetch from
 * network and cache the response for future use.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // If both cache and network fail, return a basic offline response
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first: try the network, fall back to cache. Cache successful
 * network responses for offline fallback.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/// <reference lib="webworker" />
// ---------------------------------------------------------------------------
// Service Worker — Galeria AMBSSL
// Estratégias de cache por camada para performance mobile.
// ---------------------------------------------------------------------------

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "ambssl-gallery-v1";
const APP_SHELL_CACHE = "ambssl-shell-v1";
const MEDIA_CACHE = "ambssl-media-v1";

// Assets that form the app shell — cached on install
const APP_SHELL_URLS = ["/", "/manifest.webmanifest", "/favicon.svg"];

// ---------------------------------------------------------------------------
// Install — pre-cache app shell
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ---------------------------------------------------------------------------
// Activate — clean old caches
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  const validCaches = new Set([CACHE_NAME, APP_SHELL_CACHE, MEDIA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !validCaches.has(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// ---------------------------------------------------------------------------
// Fetch — strategy per resource type
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests (except media CDN)
  if (request.method !== "GET") return;

  // --- JS/CSS with hash → CacheFirst (immutable) ---
  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // --- API calls → NetworkFirst with cache fallback ---
  if (url.pathname.startsWith("/media/") || url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // --- Images (thumbnails, posters) → CacheFirst with expiration ---
  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirstWithLimit(request, MEDIA_CACHE, 200));
    return;
  }

  // --- Navigation/HTML → NetworkFirst ---
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, APP_SHELL_CACHE));
    return;
  }

  // --- Default → NetworkFirst ---
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

/** CacheFirst — try cache, fallback to network */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

/** NetworkFirst — try network, fallback to cache */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback for navigation — return app shell
    if (request.mode === "navigate") {
      const shell = await caches.match("/");
      if (shell) return shell;
    }
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

/** CacheFirst with entry limit — evicts oldest when over max */
async function cacheFirstWithLimit(
  request: Request,
  cacheName: string,
  maxEntries: number,
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
    // Evict oldest entries if over limit
    limitCacheSize(cacheName, maxEntries);
  }
  return response;
}

/** Trim cache to maxEntries by deleting oldest */
async function limitCacheSize(cacheName: string, maxEntries: number) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Delete oldest entries (first in list)
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((k) => cache.delete(k)));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isHashedAsset(url: URL): boolean {
  // Vite hashed assets: /assets/chunk-abc123.js
  return /\/assets\/.*\.[a-f0-9]{8,}\.(js|css|woff2?)$/i.test(url.pathname);
}

function isImageRequest(request: Request, url: URL): boolean {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("image/")) return true;
  return /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(url.pathname);
}

// ---------------------------------------------------------------------------
// Service Worker — Galeria AMBSSL
// Cache por camada para performance mobile.
// ---------------------------------------------------------------------------

var CACHE_NAME = "ambssl-gallery-v2";
var APP_SHELL_CACHE = "ambssl-shell-v2";
var MEDIA_CACHE = "ambssl-media-v2";

var APP_SHELL_URLS = ["/", "/manifest.webmanifest", "/favicon.svg"];

// ---------------------------------------------------------------------------
// Install — pre-cache app shell
// ---------------------------------------------------------------------------
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then(function (cache) {
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// ---------------------------------------------------------------------------
// Activate — clean old caches
// ---------------------------------------------------------------------------
self.addEventListener("activate", function (event) {
  var validCaches = [CACHE_NAME, APP_SHELL_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return validCaches.indexOf(k) === -1;
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// ---------------------------------------------------------------------------
// Fetch — strategy per resource type
// ---------------------------------------------------------------------------
self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== "GET") return;

  // JS/CSS with hash → CacheFirst (immutable)
  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // API calls → NetworkFirst
  if (url.pathname.indexOf("/media/") === 0 || url.pathname.indexOf("/api/") === 0) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Images → CacheFirst with limit
  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirstWithLimit(request, MEDIA_CACHE, 200));
    return;
  }

  // Navigation → NetworkFirst with shell fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, APP_SHELL_CACHE));
    return;
  }

  // Default
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

function cacheFirst(request, cacheName) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (response.ok) {
        var cache = caches.open(cacheName);
        cache.then(function (c) {
          c.put(request, response.clone());
        });
      }
      return response;
    });
  });
}

function networkFirst(request, cacheName) {
  return fetch(request)
    .then(function (response) {
      if (response.ok) {
        caches.open(cacheName).then(function (cache) {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        if (request.mode === "navigate") {
          return caches.match("/");
        }
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      });
    });
}

function cacheFirstWithLimit(request, cacheName, maxEntries) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response.ok) {
          cache.put(request, response.clone());
          limitCacheSize(cacheName, maxEntries);
        }
        return response;
      });
    });
  });
}

function limitCacheSize(cacheName, maxEntries) {
  caches.open(cacheName).then(function (cache) {
    cache.keys().then(function (keys) {
      if (keys.length > maxEntries) {
        cache.delete(keys[0]).then(function () {
          limitCacheSize(cacheName, maxEntries);
        });
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isHashedAsset(url) {
  return /\/assets\/.*\.[a-f0-9]{8,}\.(js|css|woff2?)$/i.test(url.pathname);
}

function isImageRequest(request, url) {
  var accept = request.headers.get("accept") || "";
  if (accept.indexOf("image/") !== -1) return true;
  return /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(url.pathname);
}

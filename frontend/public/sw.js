const CACHE_NAME = "logic-looper-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

const DYNAMIC_CACHE = "logic-looper-dynamic-v1";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      self.skipWaiting();
    })()
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
      self.clients.claim();
    })()
  );
});

// Fetch event - network first for API, cache first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // API requests - network first with fallback to cache
  if (url.pathname.startsWith("/api") || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before putting it in the cache
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return (
            cached ||
            new Response("Offline - data unavailable", { status: 503 })
          );
        })
    );
  } else {
    // Static assets - cache first with network fallback
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});

// Background sync for offline scores
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-scores") {
    event.waitUntil(
      (async () => {
        try {
          const response = await fetch("/api/sync", { method: "POST" });
          if (!response.ok) throw new Error("Sync failed");
          return response.json();
        } catch (error) {
          console.error("Background sync failed:", error);
          throw error;
        }
      })()
    );
  }
});

// Push notifications (future feature)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Logic Looper";
  const options = {
    body: data.message || "Time for your daily puzzle!",
    icon: "/manifest.json",
    badge: "/manifest.json",
    tag: "logic-looper-notification",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

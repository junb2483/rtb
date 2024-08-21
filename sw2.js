const CACHE_NAME = "cache-v35";
const cacheURL = "/rtb/i2.html";
const urlsToCache = [cacheURL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes(cacheURL)) {
    event.respondWith(
      caches.match(cacheURL).then((response) => {
        return response || fetch(event.request);
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

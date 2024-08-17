const CACHE_NAME = "my-cache-v7";
const urlsToCache = ["/", "/rtb/test4"];

// Cài đặt cache
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(urlsToCache)));
});

// Xử lý các yêu cầu và sử dụng cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches
      .match(e.request, { ignoreSearch: true })
      .then((response) => response || fetch(e.request))
  );
});

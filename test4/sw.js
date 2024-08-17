const CACHE_NAME = "my-cache-v1";
const urlsToCache = ["/rtb/test4/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/rtb/test4/index.html")) {
    event.respondWith(
      caches.match("/rtb/test4/index.html").then((response) => {
        return response || fetch("/rtb/test4/index.html");
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

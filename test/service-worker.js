const CACHE_NAME = "my-cache-v1";
const CACHE_DURATION = 3600 * 1000; // 1 tiếng (3600 giây)

// Cài đặt Service Worker và cache file
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add("/rtb/test");
    })
  );
  self.skipWaiting();
});

// Xử lý fetch để cung cấp file từ cache hoặc từ mạng
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Chỉ cache và trả về file từ đường dẫn không có query params
  console.log(1, url.pathname);
  if (url.pathname === "/rtb/test") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(url.pathname);
        const fetchPromise = fetch(url.pathname).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(url.pathname, networkResponse.clone());
          }
          return networkResponse;
        });

        if (cachedResponse) {
          const cachedTime = new Date(
            cachedResponse.headers.get("date")
          ).getTime();
          const currentTime = Date.now();

          // Kiểm tra thời gian cache
          if (currentTime - cachedTime < CACHE_DURATION) {
            return cachedResponse || fetchPromise;
          }
        }

        return fetchPromise.catch(() => {
          return caches.match(url.pathname);
        });
      })
    );
  }
});

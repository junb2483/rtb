const CACHE_NAME = "my-cache-v5";
const urlsToCache = ["/", "/rtb/test2"];

// Cài đặt cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Xử lý các yêu cầu và sử dụng cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request, { ignoreSearch: true }) // Bỏ qua phần truy vấn của URL
      .then((response) => {
        // Trả về dữ liệu từ cache nếu có
        if (response) {
          return response;
        }
        // Nếu không có dữ liệu trong cache, gửi yêu cầu mạng
        return fetch(event.request);
      })
  );
});

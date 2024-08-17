const CACHE_NAME = "my-cache-v5";
const urlsToCache = ["/", "/rtb/test3/index.html"];

// Chỉ định các URL để cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) => {
          return fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(
                  new Request(url, { mode: "no-cors" }),
                  response.clone()
                );
              }
              throw new Error("Failed to fetch " + url);
            })
            .catch((error) => {
              console.error("Failed to cache:", url, error);
            });
        })
      );
    })
  );
});

// Xử lý các yêu cầu và sử dụng cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const urlWithoutQuery = url.origin + url.pathname; // Loại bỏ phần tham số truy vấn

  event.respondWith(
    caches
      .match(urlWithoutQuery) // Tìm trong cache không có tham số truy vấn
      .then((response) => {
        if (response) {
          return response; // Trả về dữ liệu từ cache nếu có
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              // Lưu vào cache với URL không có tham số truy vấn
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(
                  new Request(urlWithoutQuery, { mode: "no-cors" }),
                  networkResponse.clone()
                );
              });
              return networkResponse;
            }
            throw new Error("Network response was not ok.");
          })
          .catch((error) => {
            console.error("Fetch failed:", error);
            throw error;
          });
      })
  );
});

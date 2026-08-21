// Service worker riêng cho /j/ — cache đúng 1 bản HTML/JS của trang bất kể query string (token
// room_id/auto_id) khác nhau thế nào, vì phần shell (markup + code) không đổi giữa các lần mở,
// chỉ window.location.search khác nhau và được đọc lại MỖI LẦN script chạy (kể cả khi bytes tới
// từ cache) — nên cache theo path, KHÔNG theo URL đầy đủ, vẫn an toàn về mặt hành vi runtime.
//
// KHÔNG đụng tới các request khác (fetch_dds/log/dv/ld tới api3.junb.io.vn) — chỉ can thiệp đúng
// request điều hướng (navigate) tới /j/, để mọi xác minh/chống-clone vẫn luôn hỏi mạng thật.
const CACHE_NAME = "j-shell-v1"; // đổi hậu tố (v2, v3...) khi cần buộc mọi client bỏ cache cũ
const CACHE_KEY = "/j/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode !== "navigate" && req.destination !== "document") return;

  const url = new URL(req.url);
  if (url.pathname !== "/j" && !url.pathname.startsWith("/j/")) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(CACHE_KEY);

      // Luôn fetch mạng nền để cập nhật cache cho lần sau (deploy mới tự "vá" cache trong vòng 1
      // lượt mở kế tiếp) — nhưng KHÔNG chờ nó nếu đã có cache, ưu tiên trả ngay cho nhanh.
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(CACHE_KEY, res.clone());
          return res;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});

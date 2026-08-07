// Lớp TĂNG CƯỜNG thêm cho /s/, không phải cơ chế bắt buộc — cache chuẩn của trình duyệt (dựa
// trên Cache-Control: max-age=600 mặc định của GitHub Pages, không tuỳ chỉnh được header) đã tự
// dùng chung 1 bản cache cho mọi token (token nằm ở URL fragment, không bao giờ gửi lên server
// nên request tới đây LUÔN đã giống hệt nhau, không cần tự strip gì cả) — nhưng hết 10 phút phải
// revalidate lại 1 lần round-trip mạng trước khi dùng lại cache, gây chậm 1 nhịp khi có mạng dù
// nội dung không đổi. Service Worker này cache riêng, không lệ thuộc max-age của GitHub Pages,
// nên tránh được bước revalidate đó ở nơi hỗ trợ SW tốt.
//
// Ở nơi SW không hoạt động ổn định (đã xác nhận: webview Telegram) — trình duyệt tự rơi về đúng
// hành vi HTTP cache hiện có, KHÔNG tệ hơn lúc chưa có file này.
const CACHE_NAME = "s-shell-v1"; // đổi hậu tố khi cần buộc mọi client bỏ cache cũ
const CACHE_KEY = "/s/";

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
  if (url.pathname !== "/s" && !url.pathname.startsWith("/s/")) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(CACHE_KEY);

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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("feedback-cache").then((cache) => {
      return cache.addAll([
        "index.html",
        "styles.css",
        "script.js",
        "html2pdf.bundle.min.js",
        "manifest.json",
        "icon.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request);
    })
  );
});

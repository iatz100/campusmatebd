// CampusMate BD download service worker (v12).
// Makes the popup % track the REAL browser download in realtime:
// the browser starts downloading /dl/CampusMateBD.apk immediately on tap,
// and this worker streams /api/download through to that download while
// counting the bytes and reporting progress to the page.
// The real file address is NEVER in this file — only /api/download is called.
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.pathname !== "/dl/CampusMateBD.apk") return;
  // v14 FIX: without waitUntil, Chrome (especially on phones) may kill
  // this worker mid-download once respondWith() settles — the stream
  // then breaks and the browser reports "download failed" with the
  // popup stuck at 0%. waitUntil keeps the worker alive until the
  // whole file has streamed through.
  var streamFinished;
  var streamDone = new Promise(function (resolve) { streamFinished = resolve; });
  event.waitUntil(streamDone);
  event.respondWith((async function () {
    var res;
    try {
      res = await fetch("/api/download?ts=" + Date.now());
    } catch (err) {
      streamFinished();
      return new Response("Download is not ready yet.", { status: 502 });
    }
    if (!res.ok || !res.body) { streamFinished(); return res; }
    var total = parseInt(res.headers.get("content-length") || "0", 10) || 0;
    var client = null;
    try { client = await self.clients.get(event.clientId); } catch (e) {}
    if (!client) {
      try {
        var all = await self.clients.matchAll({ includeUncontrolled: true });
        if (all && all.length) client = all[0];
      } catch (e2) {}
    }
    function report(received, finished, failed) {
      if (!client) return;
      try { client.postMessage({ type: "cmbd-dl-progress", received: received, total: total, finished: !!finished, failed: !!failed }); } catch (e3) {}
    }
    var received = 0;
    var stream = new ReadableStream({
      async start(controller) {
        var reader = res.body.getReader();
        try {
          for (;;) {
            var r = await reader.read();
            if (r.done) break;
            received += r.value.length;
            controller.enqueue(r.value);
            report(received, false, false);
          }
          controller.close();
          report(received, true, false);
        } catch (err) {
          report(received, false, true);
          controller.error(err);
        } finally {
          streamFinished();
        }
      }
    });
    var headers = {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="CampusMateBD.apk"',
      "Cache-Control": "no-store"
    };
    if (total > 0) headers["Content-Length"] = String(total);
    return new Response(stream, { headers: headers });
  })());
});

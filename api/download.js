// /api/download — hidden-link direct download (Vercel Serverless Function, Node).
// The real file address is NEVER in this repo. It lives ONLY in the
// Vercel dashboard: Settings > Environment Variables > APK_URL
//
// v16: back to STREAMING through this function (v15's 302 redirect is
// gone). The redirect exposed the real GitHub address in browsers that
// navigate instead of downloading (e.g. Via Browser showed the full
// github.com/.../releases/download/... URL with a "Copy link" button).
// Streaming means the browser only ever sees /api/download — Via
// Browser can only copy that, which reveals nothing.
//
// Why streaming, not buffering: Vercel Functions cap a normal
// (non-streamed) response at 4.5 MB. A streamed response is exempt, so
// a ~43 MB file can pass through. Do NOT change this to await arrayBuffer().
//
// Range support: Chrome's download manager resumes an interrupted
// download with "Range: bytes=N-". We forward that header to the file
// host and pass the 206 response through, so a slow/interrupted
// download resumes instead of restarting. Hobby max duration is 300s.
const { Readable } = require("stream");

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method not allowed");
  }
  const fileUrl = process.env.APK_URL;
  if (!fileUrl) {
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Download is not ready yet." }));
  }
  const range = req.headers && req.headers.range;
  const upstreamHeaders = { "User-Agent": "CampusMateBD-Download/1.0" };
  if (range) upstreamHeaders.Range = range;
  let upstream;
  try {
    upstream = await fetch(fileUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
    });
  } catch (e) {
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Could not reach the file storage." }));
  }
  if (!upstream.ok || !upstream.body) {
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "File storage returned an error." }));
  }
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", 'attachment; filename="CampusMateBD.apk"');
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Accept-Ranges", "bytes");
  const len = upstream.headers.get("content-length");
  if (len) res.setHeader("Content-Length", len);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) res.setHeader("Content-Range", contentRange);
  const status = upstream.status === 206 ? 206 : 200;
  res.writeHead(status);
  if (req.method === "HEAD") return res.end();
  // Stream through — never load the whole file into memory.
  Readable.fromWeb(upstream.body).pipe(res);
};

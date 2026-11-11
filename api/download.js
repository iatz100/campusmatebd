// /api/download — hidden-link direct download (Vercel Serverless Function, Node).
// The real file address is NEVER in this repo. It lives ONLY in the
// Vercel dashboard: Settings > Environment Variables > APK_URL
// Value to set in the dashboard (NOT here): your Release file address
// or your Vercel Blob file address. Either works, the page never sees it.
//
// Why streaming, not buffering: Vercel Functions cap a normal (non-streamed)
// response at 4.5 MB. A streamed response is exempt from that cap, so a
// ~41 MB file can pass through. Do NOT change this to await arrayBuffer().
// Hobby (Fluid compute) max duration is 300s; a 41 MB stream finishes well inside it
// on a normal connection. If the origin is slow, the download may still time out —
// in that case use Vercel Blob as the origin (same Vercel network, fastest).
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
  let upstream;
  try {
    upstream = await fetch(fileUrl, {
      headers: { "User-Agent": "CampusMateBD-Download/1.0" },
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
  const len = upstream.headers.get("content-length");
  if (len) res.setHeader("Content-Length", len);
  if (req.method === "HEAD") return res.end();
  // Stream through — never load the whole file into memory.
  Readable.fromWeb(upstream.body).pipe(res);
};

// /api/download — hidden-link direct download (Vercel Serverless Function, Node).
// The real file address is NEVER in this repo. It lives ONLY in the
// Vercel dashboard: Settings > Environment Variables > APK_URL
//
// v15: this function NO LONGER STREAMS the file. Streaming kept the
// function alive for the whole 45 MB transfer (300s cap) and the
// service-worker download built on it kept dying on phones.
// Now it just redirects (302) straight to the file host, so the
// browser downloads directly from there: no time limit, and Chrome's
// download manager can retry/resume. The page never sees the address.
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
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", fileUrl);
  res.writeHead(302);
  return res.end();
};

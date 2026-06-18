const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 1383;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = path.resolve(__dirname, "public");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".map": "application/json",
};

function serve(req, res) {
  let p = req.url.split("?")[0];
  if (p === "/") p = "/index.html";

  const file = path.join(ROOT, p);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.readFile(path.join(ROOT, "404.html"), (_, fallback) => {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(fallback || "Not Found");
        });
      } else {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(serve);
server.listen(PORT, HOST, () => {
  console.log(`keybr Analyzer server running at http://localhost:${PORT}`);
});

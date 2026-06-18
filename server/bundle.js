const fs = require("fs");
const path = require("path");

// Generate embedded files manifest
const outDir = path.resolve(__dirname, "..", "out");
const files = {};

function walk(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = prefix ? prefix + "/" + entry.name : entry.name;
    if (entry.isDirectory()) {
      walk(full, rel);
    } else {
      const content = fs.readFileSync(full);
      files[rel] = content.toString("base64");
    }
  }
}

walk(outDir, "");
files["__manifest__"] = Object.keys(files).filter(f => f !== "__manifest__");

const extMap = {};
for (const key of files.__manifest__) {
  const ext = path.extname(key).toLowerCase();
  if (!extMap[ext]) extMap[ext] = [];
  extMap[ext].push(key);
}

const bundle = `const http = require("http");
const path = require("path");
const os = require("os");

const PORT = process.env.PORT || 1383;
const HOST = process.env.HOST || "0.0.0.0";

const FILES = ${JSON.stringify(files, null, 2)};

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

function getFile(p) {
  p = p.split("?")[0];
  if (p === "/") p = "/index.html";
  if (p.startsWith("/")) p = p.slice(1);
  return FILES[p] ? Buffer.from(FILES[p], "base64") : null;
}

const server = http.createServer((req, res) => {
  let data = getFile(req.url);
  if (data) {
    const ext = path.extname(req.url.split("?")[0]).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    return res.end(data);
  }
  const fallback = getFile("/404.html");
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(fallback || "Not Found");
});

server.listen(PORT, HOST, () => {
  console.log("keybr Analyzer running at http://localhost:" + PORT);
});
`;

const outputPath = path.resolve(__dirname, "keybr-server-bundle.js");
fs.writeFileSync(outputPath, bundle, "utf-8");
console.log("Bundle written to", outputPath);
console.log("Total embedded files:", files.__manifest__.length);

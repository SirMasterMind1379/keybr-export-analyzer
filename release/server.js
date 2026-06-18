const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 1383, ROOT = path.resolve(__dirname, "public");
const M = {".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".ico":"image/x-icon",".woff":"font/woff",".woff2":"font/woff2",".png":"image/png",".svg":"image/svg+xml",".txt":"text/plain"};
function serve(q,r){let u=q.url.split("?")[0];if(u==="/")u="/index.html";let f=path.join(ROOT,u);if(!f.startsWith(ROOT)){r.writeHead(403);return r.end("Forbidden")}fs.readFile(f,(e,d)=>{if(e){if(e.code==="ENOENT"){fs.readFile(path.join(ROOT,"404.html"),(_,b)=>{r.writeHead(404,{"Content-Type":"text/html"});r.end(b||"Not Found")})}else{r.writeHead(500);r.end("Internal Server Error")}return}let x=path.extname(f).toLowerCase();r.writeHead(200,{"Content-Type":M[x]||"application/octet-stream"});r.end(d)})}
function l(p){let s=http.createServer(serve);s.listen(p,"0.0.0.0",()=>console.log("keybr Analyzer @ http://localhost:"+p));s.on("error",e=>{if(e.code==="EADDRINUSE"){console.log("Port "+p+" in use, trying "+(p+1));l(p+1)}else console.error("Error:",e.message)})}
l(parseInt(PORT,10)||1383);

/**
 * ビルド済みの _site/ を静的配信する（見た目の確認用）
 *
 *   npm run serve:built            → http://localhost:8123/
 *   npm run serve:built -- 9000    → ポートを変える
 *
 * なぜ npm start（eleventy --serve）を使わないか:
 *   eleventy-dev-server の差分DOM更新が Prism.js の実行結果を元のプレーンHTMLに
 *   戻してしまい、シンタックスハイライトが消えて見える。本番ビルドでは起きない。
 *   見た目を確認するときは必ずこちらを使う。
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "_site");
const PORT = Number(process.argv[2]) || 8123;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  // .java はブラウザで中身が読めたほうが確認しやすい
  ".java": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

if (!fs.existsSync(ROOT)) {
  console.error(`_site/ がありません。先に npm run build してください。`);
  process.exit(1);
}

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel.endsWith("/")) rel += "index.html";

    // ディレクトリトラバーサル対策: ROOT の外に出るパスは拒否する
    const filePath = path.resolve(ROOT, "." + rel);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403 Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`404 Not Found: ${rel}`);
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`_site/ を配信中: http://localhost:${PORT}/`);
    console.log(`  トップ    http://localhost:${PORT}/index.html`);
    console.log(`  第1回     http://localhost:${PORT}/lessons/01-class.html`);
    console.log(`  部品見本  http://localhost:${PORT}/figure-gallery.html`);
    console.log(`止めるには Ctrl+C。`);
  });

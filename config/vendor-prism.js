/**
 * Prism.js のローカル同梱スクリプト（外部CDNは使わない）
 *
 * node_modules/prismjs から必要なファイルだけを連結して
 *   src/assets/js/prism.js   (core + clike + java + line-numbers + line-highlight)
 *   src/assets/js/prism.css  (tomorrow テーマ + プラグインCSS)
 * を生成する。`npm run vendor:prism` で再生成できる。
 *
 * 生成物は git にコミットする（node_modules が無くてもビルドできるようにするため）。
 * Prism を更新したいときは `npm update prismjs` のあとにこのスクリプトを再実行する。
 *
 * テーマは prism-tomorrow（素直な暗色テーマ）。
 * 「世界観要素をコードのハイライト配色に持ち込まない」ルール（decisions.md 決定6）に従い、
 * テーマファイルは一切改変しない。背景色 #2d2d2d は tokens.css の --c-code-bg と一致させている。
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pm = path.join(root, "node_modules", "prismjs");
const outDir = path.join(root, "src", "assets", "js");

const JS_PARTS = [
  "components/prism-core.min.js",
  "components/prism-clike.min.js",
  "components/prism-java.min.js",
  "plugins/line-numbers/prism-line-numbers.min.js",
  "plugins/line-highlight/prism-line-highlight.min.js",
];

const CSS_PARTS = [
  "themes/prism-tomorrow.min.css",
  "plugins/line-numbers/prism-line-numbers.min.css",
  "plugins/line-highlight/prism-line-highlight.min.css",
];

function bundle(parts, outFile, banner) {
  const chunks = [banner];
  const report = [];
  for (const p of parts) {
    const abs = path.join(pm, p);
    const src = fs.readFileSync(abs, "utf8");
    report.push({ part: p, bytes: Buffer.byteLength(src) });
    chunks.push(`/* ${p} */\n${src}\n`);
  }
  const out = chunks.join("\n");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out, "utf8");
  return { report, bytes: Buffer.byteLength(out) };
}

const version = require(path.join(pm, "package.json")).version;
const banner = `/*! Prism.js ${version} — bundled locally by config/vendor-prism.js. DO NOT EDIT. */`;

const js = bundle(JS_PARTS, path.join(outDir, "prism.js"), banner);
const css = bundle(CSS_PARTS, path.join(outDir, "prism.css"), banner);

console.log(`Prism ${version} を同梱しました`);
for (const r of [...js.report, ...css.report]) {
  console.log(`  ${String(r.bytes).padStart(7)} B  ${r.part}`);
}
console.log(`  ------- `);
console.log(`  ${String(js.bytes).padStart(7)} B  src/assets/js/prism.js`);
console.log(`  ${String(css.bytes).padStart(7)} B  src/assets/js/prism.css`);
console.log(
  `  合計 ${(js.bytes + css.bytes / 1).toLocaleString()} B (約 ${Math.round((js.bytes + css.bytes) / 1024)} KB)`
);

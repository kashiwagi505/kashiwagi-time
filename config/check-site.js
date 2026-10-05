/**
 * `npm run check:site` — ビルド済みの _site/ を公開前に検査する（npm run build の最後にも走る）。
 *
 *   1. ページ内・ページ間のリンク（href / src）の先が存在するか
 *      ・ファイルが _site/ にあるか（相対パスで解決。GitHub Pages のサブディレクトリ配信と同じ条件）
 *      ・#id が付いていれば、その id が行き先のページにあるか
 *   2. 各回の配布 ZIP があるか
 *   3. src/_data/exercises.js に書いたファイルが src/downloads/ にあるか
 *      （create に書いた「自分で作るファイル」は除く）
 *   4. 各回の見出しから取り出した問題と exercises.js が対応しているか（手順ボックスの数）
 *
 *   問題が1つでもあれば終了コード 1 で止める（GitHub Actions のデプロイも止まる）。
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "_site");
const problems = [];

if (!fs.existsSync(out)) {
  console.error("_site/ がありません。先に npm run build を実行してください。");
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const htmlFiles = walk(out).filter((p) => p.endsWith(".html"));
const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const html = fs.readFileSync(file, "utf8");
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}
const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
const rel = (p) => path.relative(out, p).split(path.sep).join("/");

// 1. リンク
let linkCount = 0;
for (const file of htmlFiles) {
  // コードブロックの中の文字列はリンクではないので外す
  const html = fs.readFileSync(file, "utf8").replace(/<pre[\s\S]*?<\/pre>/g, "");
  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const url = m[1].replace(/&amp;/g, "&");
    if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue; // http: mailto: data: など
    linkCount++;
    const [pathPart, hash] = url.split("#");
    const cleanPath = pathPart.split("?")[0];
    if (cleanPath.startsWith("/")) {
      problems.push(`${rel(file)}: ルート絶対パスは使わない → ${url}`);
      continue;
    }
    const target = cleanPath ? path.resolve(path.dirname(file), decode(cleanPath)) : file;
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      problems.push(`${rel(file)}: リンク切れ → ${url}`);
      continue;
    }
    if (hash && target.endsWith(".html") && !idsOf(target).has(decode(hash))) {
      problems.push(`${rel(file)}: 行き先に #${decode(hash)} がない → ${url}`);
    }
  }
}

// 2〜4. 配布物と演習データ
const site = JSON.parse(fs.readFileSync(path.join(root, "src/_data/site.json"), "utf8"));
const exercises = require(path.join(root, "src/_data/exercises.js"));
for (const lesson of site.lessons) {
  const zip = path.join(out, "downloads", `${lesson.slug}.zip`);
  if (!fs.existsSync(zip)) problems.push(`第${lesson.order}回: 配布 ZIP がない → downloads/${lesson.slug}.zip`);

  const steps = exercises[lesson.slug] || [];
  for (const s of steps) {
    for (const f of s.compile || []) {
      if ((s.create || []).includes(f)) continue;
      const p = path.join(root, "src/downloads", s.dir, f);
      if (!fs.existsSync(p)) problems.push(`exercises.js 第${lesson.order}回 ${s.label}: 配布ファイルがない → downloads/${s.dir}/${f}`);
    }
  }
  const page = path.join(out, "lessons", `${lesson.slug}.html`);
  if (fs.existsSync(page)) {
    const html = fs.readFileSync(page, "utf8");
    const boxes = new Set([...html.matchAll(/data-ex-box="([^"]+)"/g)].map((m) => m[1]));
    for (const s of steps) {
      if (!boxes.has(s.key)) {
        problems.push(`第${lesson.order}回: ${s.label} の手順ボックスが出ていない（演習の見出しに「${s.label}」が見つからない）`);
      }
    }
  }
}

if (problems.length) {
  console.error(`\n[check:site] ★公開前チェックで ${problems.length} 件の問題`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`[check:site] 問題なし（${htmlFiles.length} ページ・リンク ${linkCount} 件・${site.lessons.length} 回分の配布物を確認）`);

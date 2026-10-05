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
    let target = cleanPath ? path.resolve(path.dirname(file), decode(cleanPath)) : file;
    // foo/ のようなディレクトリへのリンクは、GitHub Pages では foo/index.html が返る
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) {
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
  const srcDir = path.join(root, "src/downloads", lesson.slug);
  if (!fs.existsSync(zip)) {
    problems.push(`第${lesson.order}回: 配布 ZIP がない → downloads/${lesson.slug}.zip`);
  } else {
    try {
      const names = readZip(fs.readFileSync(zip));
      const expected = fs.existsSync(srcDir)
        ? walk(srcDir)
            .map((p) => `${lesson.slug}/${path.relative(srcDir, p).split(path.sep).join("/")}`)
            .filter((n) => !/(^|\/)README\.(md|txt)$/i.test(n))
        : [];
      for (const n of expected) if (!names.includes(n)) problems.push(`第${lesson.order}回: ZIP に ${n} が入っていない`);
      if (!names.includes(`${lesson.slug}/README.txt`)) problems.push(`第${lesson.order}回: ZIP に README.txt が入っていない`);
    } catch (e) {
      problems.push(`第${lesson.order}回: ZIP が壊れている → ${e.message}`);
    }
  }

  const steps = exercises[lesson.slug] || [];
  for (const s of steps) {
    for (const f of s.compile || []) {
      if ((s.create || []).includes(f)) continue;
      const p = path.join(root, "src/downloads", s.dir, f);
      if (!fs.existsSync(p)) problems.push(`exercises.js 第${lesson.order}回 ${s.label}: 配布ファイルがない → downloads/${s.dir}/${f}`);
    }
  }
  const page = path.join(out, "lessons", `${lesson.slug}.html`);
  if (!fs.existsSync(page)) {
    problems.push(`第${lesson.order}回: ページが出力されていない → lessons/${lesson.slug}.html`);
    continue;
  }
  const html = fs.readFileSync(page, "utf8");
  const counts = {};
  for (const m of html.matchAll(/data-ex-box="([^"]+)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
  for (const s of steps) {
    if (!counts[s.key]) {
      problems.push(`第${lesson.order}回: ${s.label} の手順ボックスが出ていない（演習の見出しに「${s.label}」が見つからない）`);
    } else if (counts[s.key] > 1) {
      problems.push(`第${lesson.order}回: ${s.label} の手順ボックスが ${counts[s.key]} 個ある（演習の見出しが重複している）`);
    }
  }
  const known = new Set(steps.map((s) => s.key));
  for (const k of Object.keys(counts)) {
    if (!known.has(k)) problems.push(`第${lesson.order}回: exercises.js に無い問題キー「${k}」の手順ボックスがある`);
  }
}

/** ZIP の中央ディレクトリを読み、各ファイルを展開して CRC を確かめる。ファイル名の一覧を返す */
function readZip(buf) {
  const zlib = require("node:zlib");
  const { crc32 } = require("./zip-downloads.js");
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("終端レコードが見つからない");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const names = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("中央ディレクトリが壊れている");
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nlen).toString("utf8");
    if (method !== 0 && method !== 8) throw new Error(`${name}: 未対応の圧縮方式 ${method}`);
    if (buf.readUInt32LE(local) !== 0x04034b50) throw new Error(`${name}: ローカルヘッダが壊れている`);
    const lnlen = buf.readUInt16LE(local + 26);
    const lname = buf.slice(local + 30, local + 30 + lnlen).toString("utf8");
    if (lname !== name) throw new Error(`${name}: 中央ディレクトリとローカルヘッダでファイル名が違う（${lname}）`);
    const dataAt = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const comp = buf.slice(dataAt, dataAt + csize);
    const raw = method === 8 ? zlib.inflateRawSync(comp) : comp;
    if (raw.length !== usize) throw new Error(`${name}: 展開後のサイズが合わない`);
    if (crc32(raw) !== crc) throw new Error(`${name}: CRC が合わない`);
    names.push(name);
    p += 46 + nlen + xlen + clen;
  }
  return names;
}

if (problems.length) {
  console.error(`\n[check:site] ★公開前チェックで ${problems.length} 件の問題`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`[check:site] 問題なし（${htmlFiles.length} ページ・リンク ${linkCount} 件・${site.lessons.length} 回分の配布物を確認）`);

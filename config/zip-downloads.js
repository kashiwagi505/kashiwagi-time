/**
 * 回ごとの配布 ZIP（_site/downloads/<slug>.zip）をビルドの最後に作る。
 *
 *   src/downloads/<slug>/ をフォルダ構造ごと固めて、展開すると <slug>/ が1つできる形にする。
 *   ex1 / ex2 のように同名ファイルを分けてある回も、フォルダが保たれるので混ざらない。
 *   中に README.txt（src/_data/exercises.js から作るコンパイル手順）を入れる。
 *
 *   依存パッケージを増やさないため、ZIP は Node 標準の zlib で自前に書く（deflate のみ）。
 */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

// ---------------------------------------------------------------------------
// 最小限の ZIP 書き出し
// ---------------------------------------------------------------------------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  if (typeof zlib.crc32 === "function") return zlib.crc32(buf) >>> 0;
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** 日時を DOS 形式に（ZIP の更新日時欄）。再現性のため固定日時を使う */
function dosDateTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

/** entries: [{ name: "01-class/Student.java", data: Buffer }] */
function buildZip(entries) {
  // ZIP64 には対応しない（教材の配布物はずっと小さい）。超えたら壊れた ZIP を作らずに止める
  if (entries.length > 0xffff) throw new Error("[zip] ファイル数が多すぎます（ZIP64 非対応）");
  const names = new Set();
  for (const e of entries) {
    if (names.has(e.name)) throw new Error(`[zip] 同じ名前のファイルが2つあります: ${e.name}`);
    names.add(e.name);
    if (e.data.length >= 0xffffffff) throw new Error(`[zip] ファイルが大きすぎます（ZIP64 非対応）: ${e.name}`);
  }
  const { time, date } = dosDateTime(new Date(2026, 0, 1, 0, 0, 0));
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const raw = e.data;
    const comp = zlib.deflateRawSync(raw, { level: 9 });
    const crc = crc32(raw);
    const FLAG_UTF8 = 0x0800; // ファイル名を UTF-8 として扱わせる（日本語名の文字化け防止）

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(FLAG_UTF8, 6);
    lh.writeUInt16LE(8, 8); // deflate
    lh.writeUInt16LE(time, 10);
    lh.writeUInt16LE(date, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(raw.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    locals.push(lh, name, comp);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(FLAG_UTF8, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(time, 12);
    ch.writeUInt16LE(date, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20);
    ch.writeUInt32LE(raw.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt16LE(0, 30); // extra
    ch.writeUInt16LE(0, 32); // comment
    ch.writeUInt16LE(0, 34); // disk
    ch.writeUInt16LE(0, 36); // internal attr
    ch.writeUInt32LE(0, 38); // external attr
    ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);

    offset += lh.length + name.length + comp.length;
  }
  const central = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, central, end]);
}

// ---------------------------------------------------------------------------
// 配布フォルダ → ZIP
// ---------------------------------------------------------------------------
function listFiles(dir, base = dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFiles(p, base));
    // README.md は担当者の作業記録なので配らない。README.txt は ZIP 側で作るので重ならないよう除く
    else if (!/^README\.(md|txt)$/i.test(ent.name)) out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out.sort();
}

/** 「README.txt」の中身。Windows のメモ帳でも読めるよう CRLF にする */
function readmeText(lesson, steps) {
  const L = [];
  L.push(`柏木タイム 第${lesson.order}回「${lesson.title}」配布ソース`);
  L.push("");
  L.push("このフォルダは、その回の演習の「開始状態」です。");
  L.push("ターミナル（PowerShell / コマンドプロンプト / ターミナル.app）で、問題ごとに次の手順で動かします。");
  L.push("未完成の別の問題のファイルを混ぜないよう、javac には必要なファイルだけを並べてください。");
  L.push("");
  for (const s of steps || []) {
    if (!s.compile) continue;
    L.push(`■ ${s.label}`);
    if (s.create) L.push(`  自分で新しく作るファイル: ${s.create.join(", ")}`);
    L.push(`  cd ${s.dir}`);
    L.push(`  javac -encoding UTF-8 ${s.compile.join(" ")}`);
    L.push(`  java ${s.run}`);
    if (s.note) L.push(`  ※ ${s.note}`);
    L.push("");
  }
  L.push("※ cd の行は、この ZIP を展開した場所（このファイルがある1つ上のフォルダ）から見たパスです。");
  return L.join("\r\n") + "\r\n";
}

module.exports = function (eleventyConfig, { srcDir = "src" } = {}) {
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    const root = path.resolve(srcDir, "downloads");
    if (!fs.existsSync(root)) return;
    const site = JSON.parse(fs.readFileSync(path.resolve(srcDir, "_data/site.json"), "utf8"));
    const exercises = require(path.resolve(srcDir, "_data/exercises.js"));
    const outDir = path.resolve(dir.output, "downloads");
    fs.mkdirSync(outDir, { recursive: true });

    for (const lesson of site.lessons) {
      const lessonDir = path.join(root, lesson.slug);
      if (!fs.existsSync(lessonDir)) continue;
      const entries = listFiles(lessonDir).map((rel) => ({
        name: `${lesson.slug}/${rel}`,
        data: fs.readFileSync(path.join(lessonDir, rel)),
      }));
      entries.unshift({
        name: `${lesson.slug}/README.txt`,
        data: Buffer.from("﻿" + readmeText(lesson, exercises[lesson.slug]), "utf8"),
      });
      fs.writeFileSync(path.join(outDir, `${lesson.slug}.zip`), buildZip(entries));
    }
  });
};

module.exports.buildZip = buildZip;
module.exports.crc32 = crc32;

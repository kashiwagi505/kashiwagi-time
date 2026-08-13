/**
 * make-transparent.js
 *
 * 元資料 image/ のキャラ立ち絵（白背景JPEG / マゼンタ背景PNG）から
 * 背景を抜いた透過PNGを作る。元資料は一切変更しない（読み込みのみ）。
 *
 * 方式:
 *   1. 画素ごとに「背景らしさ(bgScore 0..1)」を計算する
 *      - white モード : 高輝度・低彩度ほど背景らしい
 *      - magenta モード: G が R,B より落ち込んでいる（マゼンタ）ほど背景らしい
 *   2. 画像の外周からフラッドフィル(4近傍)して「外から到達できる背景領域」だけをマスクにする
 *      → キャラ内部の白目・白い装備・ハイライトに穴があかない
 *   3. マスク内の画素の alpha を bgScore から連続的に決める（境界がなめらかになる）
 *   4. マゼンタは輪郭のにじみ(スピル)を抑える despill を掛ける
 *   5. alpha=0 の余白を trim してタイトに切る
 *
 * 使い方:
 *   cd site/tools && npm install
 *   node make-transparent.js            # 全部作り直す
 *   node make-transparent.js hero maou   # キーを指定して一部だけ
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const SRC_IMAGE = path.join(REPO, 'image');
const SRC_PPTX = path.join(REPO, '00_research', '01_inventory', 'extracted', 'images');
const OUT = path.join(REPO, 'site', 'src', 'assets', 'img');

// ---------------------------------------------------------------- 対象の定義
// key           : 出力ファイル名（拡張子なし）
// src           : 入力ファイル（絶対パス）
// mode          : 'white' | 'magenta' | 'passthrough'(すでに透過済み)
// dir           : 出力サブディレクトリ
const TARGETS = [
  // --- image/ の白背景JPEG（1254x1254 原本） ---
  // ★ warrior.jpg は名前に反して「勇者」(Hero.java)。詳細は README.md 参照
  { key: 'hero',    src: path.join(SRC_IMAGE, 'warrior.jpg'),        mode: 'white',   dir: 'chara' },
  { key: 'wizard',  src: path.join(SRC_IMAGE, 'mage.jpg'),           mode: 'white',   dir: 'chara' },
  { key: 'tank',    src: path.join(SRC_IMAGE, 'guardian.jpg'),       mode: 'white',   dir: 'chara' },
  { key: 'saint',   src: path.join(SRC_IMAGE, 'saint.jpg'),          mode: 'white',   dir: 'chara' },
  { key: 'archer',  src: path.join(SRC_IMAGE, 'archer.jpg'),         mode: 'white',   dir: 'chara' },
  // martial_artist.jpg は教材に登場しないため意図的に対象外（README.md 参照）

  // --- image/ のマゼンタ背景PNG（クロマキー。1254x1254 原本） ---
  { key: 'maou',           src: path.join(SRC_IMAGE, '生成画像1 (2).png'), mode: 'magenta', dir: 'chara' },
  { key: 'hero-excalibur', src: path.join(SRC_IMAGE, '生成画像2.png'),     mode: 'magenta', dir: 'chara' },
  { key: 'excalibur',      src: path.join(SRC_IMAGE, '生成画像3.png'),     mode: 'magenta', dir: 'items' },
  { key: 'magic-circle',   src: path.join(SRC_IMAGE, '生成画像4.png'),     mode: 'magenta', dir: 'items' },

  // --- pptx由来。すでに透過済みなので再処理しない（原本が image/ に無い） ---
  { key: 'assassin', src: path.join(SRC_PPTX, 'session-04', 'chara_assassin.png'), mode: 'passthrough', dir: 'chara' },
  { key: 'priest',   src: path.join(SRC_PPTX, 'session-04', 'chara_priest.png'),   mode: 'passthrough', dir: 'chara' },
  // 第7回スライドで実際に使われた聖剣（生成画像3とは別デザイン）
  { key: 'holy-sword-slide', src: path.join(SRC_PPTX, 'session-07', 'item_holy_sword.png'), mode: 'passthrough', dir: 'items' },
];

// -------------------------------------------------------------- パラメータ
// white: min(r,g,b) がこの値以上なら完全背景 / 以下なら完全前景
const WHITE_FULL_BG = 249;  // これ以上 → alpha 0
const WHITE_FULL_FG = 234;  // これ以下 → alpha 255
const WHITE_MAX_SAT = 14;   // max-min がこれを超えたら「白ではない」= 前景
const WHITE_SEED    = 240;  // フラッドフィルの種として通す緩めの閾値

// magenta: greenDeficit = min(r,b) - g
const MAG_FULL_BG = 170;    // これ以上 → alpha 0
const MAG_FULL_FG = 70;     // これ以下 → alpha 255
// ★ MAG_MIN_RB は明るさの下限。背景のマゼンタは min(r,b)=217〜250 なのに対し、
//   魔法陣の紫の宝石は min(r,b)=140 前後で「マゼンタ寄り」に見えてしまう。
//   195 にすると宝石を確実に前景側に残せる（実測: site/tools/comp2.js）。
const MAG_MIN_RB  = 195;
const MAG_SEED    = 60;     // フラッドフィルの種（緩め）

function bgScoreWhite(r, g, b) {
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  if (mx - mn > WHITE_MAX_SAT) return 0;
  if (mn >= WHITE_FULL_BG) return 1;
  if (mn <= WHITE_FULL_FG) return 0;
  return (mn - WHITE_FULL_FG) / (WHITE_FULL_BG - WHITE_FULL_FG);
}
function seedWhite(r, g, b) {
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  return mn >= WHITE_SEED && mx - mn <= WHITE_MAX_SAT + 6;
}
function greenDeficit(r, g, b) { return Math.min(r, b) - g; }
// 明るさの下限は alpha 計算では「なだらかな傾斜」にする。
// 硬い閾値にすると輪郭のアンチエイリアス画素（背景と暗い縁の中間色）が
// 一気に不透明になり、ジャギーが出る。
const MAG_SOFT_LO = 150;
function bgScoreMagenta(r, g, b) {
  const rb = Math.min(r, b);
  if (rb <= MAG_SOFT_LO) return 0;
  const bright = Math.min(1, (rb - MAG_SOFT_LO) / (MAG_MIN_RB - MAG_SOFT_LO));
  const d = greenDeficit(r, g, b);
  let ds;
  if (d >= MAG_FULL_BG) ds = 1;
  else if (d <= MAG_FULL_FG) ds = 0;
  else ds = (d - MAG_FULL_FG) / (MAG_FULL_BG - MAG_FULL_FG);
  return ds * bright;
}
// 種（＝どの画素をひとつの背景領域として連結させるか）は硬い閾値にする。
// ここを緩めると魔法陣の紫の宝石が外側の背景とつながってしまう。
function seedMagenta(r, g, b) {
  return Math.min(r, b) >= MAG_MIN_RB && greenDeficit(r, g, b) >= MAG_SEED;
}

/** 外周から4近傍フラッドフィルして「外から到達できる背景」マスクを作る */
function floodFillBackground(data, w, h, ch, isSeed) {
  const reach = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const i = y * w + x;
    if (reach[i]) return;
    const o = i * ch;
    if (!isSeed(data[o], data[o + 1], data[o + 2])) return;
    reach[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  return reach;
}

/**
 * 外周から到達できない「内包された背景」を救済する。
 *   白  : 弓使いの弓の内側、魔法使いの腕と杖に囲まれた領域
 *   マゼンタ: 魔王のマントの破れ穴、角や装飾の隙間
 * 内包された前景（聖女のヴェールの折り目、魔法陣の紫の宝石）と区別するため統計量で判定する。
 *   - 外周背景の平均との差が小さい（|dMean| <= 許容値）
 *   - 分布が平坦（std <= 許容値）… 衣装や宝石は陰影があるので std が大きくなる
 *   - ある程度の面積がある（ノイズの粒を拾わないため）
 * 閾値は実測で決めた（site/tools/comp2.js の出力）。実測値の例:
 *   弓の内側 dMean -0.2 / std 1.7  ↔  聖女のヴェール dMean -1.6 / std 3.1
 *   魔王のマントの穴 dMean -12 / std 15  ↔  魔法陣の紫の宝石 dMean -160 / std 9
 */
const RESCUE = {
  white:   { minArea: 2000, maxDMean: 1.0, maxStd: 2.2 },
  // マゼンタは絵の中に一切使われていない色なので、1px の隙間まで拾ってよい。
  // （魔法陣の金の輪の間にできる数pxのすき間が残ると、そこだけピンクに光る）
  // minArea=1 でも maxDMean で「ほぼ純粋なキーカラーか」を見ているので、
  // 紫の宝石（dMean -155）は絶対に通らない。
  magenta: { minArea: 1,    maxDMean: 50,  maxStd: 45 },
};

function rescueEnclosedBackground(data, w, h, ch, isSeed, mask, statOf, tol) {
  // 外周背景の統計量の平均を求める
  let bs = 0, bn = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i]) continue;
    const o = i * ch;
    bs += statOf(data[o], data[o + 1], data[o + 2]); bn++;
  }
  if (!bn) return { mask, rescued: [] };
  const borderMean = bs / bn;

  const seen = new Uint8Array(w * h);
  const rescued = [];
  for (let i0 = 0; i0 < w * h; i0++) {
    if (seen[i0] || mask[i0]) continue;
    const o0 = i0 * ch;
    if (!isSeed(data[o0], data[o0 + 1], data[o0 + 2])) { seen[i0] = 1; continue; }
    const stack = [i0]; seen[i0] = 1;
    const members = []; let s = 0, s2 = 0;
    while (stack.length) {
      const i = stack.pop(); members.push(i);
      const x = i % w, y = (i - x) / w;
      const o = i * ch;
      const v = statOf(data[o], data[o + 1], data[o + 2]); s += v; s2 += v * v;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j < 0 || seen[j] || mask[j]) continue;
        const oj = j * ch;
        seen[j] = 1;
        if (isSeed(data[oj], data[oj + 1], data[oj + 2])) stack.push(j);
      }
    }
    const area = members.length;
    if (area < tol.minArea) continue;
    const mean = s / area;
    const std = Math.sqrt(Math.max(0, s2 / area - mean * mean));
    if (Math.abs(mean - borderMean) <= tol.maxDMean && std <= tol.maxStd) {
      for (const i of members) mask[i] = 1;
      rescued.push({ area, mean: +mean.toFixed(1), std: +std.toFixed(2) });
    }
  }
  return { mask, rescued };
}

/** マスクを1px膨張させて、境界のフェザー画素も alpha 計算の対象に含める */
function dilate(mask, w, h, times) {
  let cur = mask;
  for (let t = 0; t < times; t++) {
    const next = Uint8Array.from(cur);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (cur[i]) continue;
        if ((x > 0 && cur[i - 1]) || (x < w - 1 && cur[i + 1]) ||
            (y > 0 && cur[i - w]) || (y < h - 1 && cur[i + w])) next[i] = 1;
      }
    }
    cur = next;
  }
  return cur;
}

async function keyOut(file, mode) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const score = mode === 'white' ? bgScoreWhite : bgScoreMagenta;
  const seed  = mode === 'white' ? seedWhite    : seedMagenta;

  // 統計判定に使う量: 白は輝度(min)、マゼンタは緑の落ち込み(greenDeficit)
  const statOf = mode === 'white'
    ? (r, g, b) => Math.min(r, g, b)
    : (r, g, b) => greenDeficit(r, g, b);

  // 1) 外周から到達できる背景
  let mask = floodFillBackground(data, w, h, ch, seed);
  // 2) 内包された背景を統計量で救済（前景の内包領域は残す）
  const rr = rescueEnclosedBackground(data, w, h, ch, seed, mask, statOf, RESCUE[mode]);
  mask = rr.mask;
  const rescued = rr.rescued;
  // 3) フェザー／スピル除去用に膨張（境界の中間色画素まで処理対象に含める）
  //    マゼンタは輪郭のにじみが広いので1px多く取る
  mask = dilate(mask, w, h, mode === 'magenta' ? 3 : 2);

  const out = Buffer.alloc(w * h * 4);
  let cleared = 0, feathered = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * ch;
    let r = data[o], g = data[o + 1], b = data[o + 2];
    let a = 255;
    if (mask[i]) {
      const s = score(r, g, b);
      a = Math.round(255 * (1 - s));
      if (a === 0) cleared++;
      else if (a < 255) feathered++;
      // マゼンタのスピル（輪郭のピンクにじみ）を抑える
      if (mode === 'magenta' && a > 0) {
        const d = greenDeficit(r, g, b);
        if (d > 20) {
          const k = Math.min(1, (d - 20) / 60);
          const target = g + 15;
          r = Math.round(r + (Math.min(r, target) - r) * k);
          b = Math.round(b + (Math.min(b, target) - b) * k);
        }
      }
    }
    const p = i * 4;
    out[p] = r; out[p + 1] = g; out[p + 2] = b; out[p + 3] = a;
  }
  const total = w * h;
  return {
    pipeline: sharp(out, { raw: { width: w, height: h, channels: 4 } }),
    stats: {
      w, h,
      clearedPct: (100 * cleared / total).toFixed(1),
      featheredPct: (100 * feathered / total).toFixed(2),
      rescued: rescued.map((r) => `${r.area}px(mean${r.mean}/std${r.std})`).join(' '),
    },
  };
}

// ------------------------------------------------------------------ 出力
async function emit(key, dir, pipeline, srcLabel, stats) {
  const outDir = path.join(OUT, dir);
  fs.mkdirSync(outDir, { recursive: true });
  // trim は alpha=0 の余白を落とす。原寸を保ちたいので resize はしない
  const trimmed = await pipeline.trim({ threshold: 1 }).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer({ resolveWithObject: true });
  const fullPng = path.join(outDir, `${key}.png`);
  fs.writeFileSync(fullPng, trimmed.data);

  const fullWebp = path.join(outDir, `${key}.webp`);
  await sharp(trimmed.data).webp({ quality: 88, alphaQuality: 92, effort: 6 }).toFile(fullWebp);

  const thumbWebp = path.join(outDir, `${key}-320.webp`);
  await sharp(trimmed.data)
    .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90, effort: 6 })
    .toFile(thumbWebp);

  const m = await sharp(fullPng).metadata();
  const kb = (p) => Math.round(fs.statSync(p).size / 1024);
  const tm = await sharp(thumbWebp).metadata();
  return {
    key, dir, src: srcLabel,
    dims: `${m.width}x${m.height}`,
    png: kb(fullPng), webp: kb(fullWebp), thumb: kb(thumbWebp),
    thumbDims: `${tm.width}x${tm.height}`,
    ...stats,
  };
}

// 他のスクリプト（make-silhouette.js）から白抜き処理を再利用できるようにする
module.exports = { keyOut, emit, OUT, REPO, SRC_IMAGE, SRC_PPTX };
if (require.main !== module) return;

(async () => {
  const only = process.argv.slice(2);
  const rows = [];
  for (const t of TARGETS) {
    if (only.length && !only.includes(t.key)) continue;
    if (!fs.existsSync(t.src)) { console.error(`!! 入力が無い: ${t.src}`); continue; }
    const srcKb = Math.round(fs.statSync(t.src).size / 1024);
    const srcLabel = `${path.relative(REPO, t.src).replace(/\\/g, '/')} (${srcKb}KB)`;
    let pipeline, stats;
    if (t.mode === 'passthrough') {
      pipeline = sharp(t.src).ensureAlpha();
      stats = { clearedPct: '-', featheredPct: '-', mode: t.mode };
    } else {
      const r = await keyOut(t.src, t.mode);
      pipeline = r.pipeline; stats = { ...r.stats, mode: t.mode };
    }
    const row = await emit(t.key, t.dir, pipeline, srcLabel, stats);
    row.srcKb = srcKb;
    rows.push(row);
    console.log(`${row.key.padEnd(16)} ${row.mode.padEnd(12)} ${row.dims.padEnd(10)} ` +
      `src=${srcKb}KB png=${row.png}KB webp=${row.webp}KB thumb(${row.thumbDims})=${row.thumb}KB ` +
      `bg=${row.clearedPct}% feather=${row.featheredPct}%` +
      (row.rescued ? `\n  ↳ 内包背景を救済: ${row.rescued}` : ''));
  }
  fs.writeFileSync(path.join(__dirname, 'last-run.json'), JSON.stringify(rows, null, 1));
  const sum = (f) => rows.reduce((a, r) => a + (r[f] || 0), 0);
  console.log(`\n合計: src=${sum('srcKb')}KB  png=${sum('png')}KB  webp=${sum('webp')}KB  thumb=${sum('thumb')}KB`);
})();

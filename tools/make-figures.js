/**
 * make-figures.js
 *
 * 第2回の概念イラスト3点（全7回で唯一「画像として貼る」と決まった図）を
 * WebP に変換して site/src/assets/img/figures/ に置く。
 *
 * 切り抜きはしない。スライドでは <a:srcRect> で左右15〜19%がカットされていたが、
 * 原本のほうが情報が揃っている（session-02.md「切り抜きの影響」参照）。
 *   - juice_stand: 原本だとジュースが5杯そろう（スライドでは右端が切れて4.5杯）
 *   - hero_and_creation_ui: 原本には左端のJavaロゴが写っている
 * ⚠ この3点は出自（生成AI／購入／自作）が未確認。README.md の未解決事項を参照。
 *
 * 使い方: node make-figures.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const SRC = path.join(REPO, '00_research', '01_inventory', 'extracted', 'images', 'session-02');
const OUT = path.join(REPO, 'site', 'src', 'assets', 'img', 'figures');

const TARGETS = [
  { key: 's02-juice-stand',    src: 's02_juice_stand.png',          use: '第2回スライド5 オーバーロード（図C）。この回の主役の図' },
  { key: 's02-creation-ui',    src: 's02_hero_and_creation_ui.png', use: '第2回スライド1 アイキャッチ／スライド3 コンストラクタ' },
  { key: 's02-object-factory', src: 's02_object_factory.png',       use: '第2回スライド2・8 コンストラクタ＝オブジェクト製造機' },
];

// 図はページ内で最大1000px程度で表示する想定。原寸(1672px)も拡大表示用に残す。
const WIDE = 1672;
const PAGE = 1000;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (const t of TARGETS) {
    const src = path.join(SRC, t.src);
    if (!fs.existsSync(src)) { console.error(`!! 入力が無い: ${src}`); continue; }
    const srcKb = Math.round(fs.statSync(src).size / 1024);
    const m = await sharp(src).metadata();

    // 原寸WebP（拡大表示用）
    const full = path.join(OUT, `${t.key}.webp`);
    await sharp(src).webp({ quality: 82, effort: 6 }).toFile(full);
    // ページ表示用（幅1000px）
    const page = path.join(OUT, `${t.key}-1000.webp`);
    await sharp(src).resize({ width: PAGE, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(page);
    // スマホ用（幅700px）— 幅375pxでは果物5種の見分けが付かないので原寸リンクは別途必要
    const sm = path.join(OUT, `${t.key}-700.webp`);
    await sharp(src).resize({ width: 700, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(sm);

    const kb = (p) => Math.round(fs.statSync(p).size / 1024);
    rows.push({ key: t.key, src: t.src, srcKb, dims: `${m.width}x${m.height}`,
      full: kb(full), page: kb(page), sm: kb(sm), use: t.use });
    console.log(`${t.key.padEnd(20)} ${m.width}x${m.height}  png=${srcKb}KB → webp原寸=${kb(full)}KB / 1000px=${kb(page)}KB / 700px=${kb(sm)}KB`);
  }
  const sum = (f) => rows.reduce((a, r) => a + r[f], 0);
  console.log(`\n合計: 元PNG=${sum('srcKb')}KB → WebP原寸=${sum('full')}KB (${(100 * sum('full') / sum('srcKb')).toFixed(0)}%) / 1000px版=${sum('page')}KB`);
  fs.writeFileSync(path.join(__dirname, 'last-figures.json'), JSON.stringify(rows, null, 1));
})();

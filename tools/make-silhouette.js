/**
 * make-silhouette.js
 *
 * 第7回スライド3・4用「職業不明の冒険者」のシルエットを、
 * 既存の立ち絵の加工で代替できるか試すスクリプト。
 * 要件（cross-session-findings.md 7章）:
 *   中核4人と同じ画風 / 顔と装備が判別できない灰色の人型 /「？」を置ける余白 /
 *   背景透過 / 長辺600px以上
 *
 * 使い方:
 *   node make-silhouette.js --compare   # 4案を並べた比較シートを tools/ に出す
 *   node make-silhouette.js             # 採用案を site/src/assets/img/chara/ に出す
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { keyOut, SRC_IMAGE, OUT } = require('./make-transparent.js');

/** 透過済みRGBAバッファを「単色べた塗りのシルエット」にする（alphaだけ残す） */
async function flatSilhouette(buf, rgb) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < info.width * info.height; i++) {
    const p = i * 4;
    out[p] = rgb[0]; out[p + 1] = rgb[1]; out[p + 2] = rgb[2]; out[p + 3] = data[p + 3];
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** グレースケール化＋暗くする（形と陰影は残る＝装備が判別できてしまうか確認用） */
async function grayDark(buf) {
  return sharp(buf).grayscale().linear(0.45, 40).png().toBuffer();
}

(async () => {
  const compare = process.argv.includes('--compare');
  // 素材2種: 勇者（教材の主役 → 剣と盾で職業が分かってしまう懸念）と
  //          武闘家（教材に一切登場しない余剰素材 → 誰でもない人型として使える可能性）
  const heroKeyed = await (await keyOut(path.join(SRC_IMAGE, 'warrior.jpg'), 'white'))
    .pipeline.trim({ threshold: 1 }).png().toBuffer();
  const maKeyed = await (await keyOut(path.join(SRC_IMAGE, 'martial_artist.jpg'), 'white'))
    .pipeline.trim({ threshold: 1 }).png().toBuffer();

  const GRAY = [138, 143, 158]; // 藍寄りのニュートラルグレー（決定4の配色に合わせる）
  const variants = [
    ['A_hero_grayDark',   await grayDark(heroKeyed)],
    ['B_hero_flat',       await flatSilhouette(heroKeyed, GRAY)],
    ['C_martial_grayDark', await grayDark(maKeyed)],
    ['D_martial_flat',    await flatSilhouette(maKeyed, GRAY)],
  ];

  if (compare) {
    const cell = 340;
    const imgs = [];
    for (const [, b] of variants) imgs.push(await sharp(b).resize({ width: cell - 20, height: cell - 20, fit: 'inside' }).toBuffer());
    await sharp({ create: { width: cell * 4, height: cell, channels: 3, background: '#f4f5f9' } })
      .composite(imgs.map((input, i) => ({ input, left: i * cell + 10, top: 10 })))
      .png().toFile(path.join(__dirname, 'qa-silhouette.png'));
    console.log('wrote qa-silhouette.png  順: ' + variants.map(([n]) => n).join(' | '));
    return;
  }

  // --- 採用案を出力 ---
  // 判断: D（武闘家のべた塗りシルエット）を採用する。理由は README.md 参照。
  const outDir = path.join(OUT, 'chara');
  fs.mkdirSync(outDir, { recursive: true });
  const chosen = variants.find(([n]) => n === 'D_martial_flat')[1];
  const png = path.join(outDir, 'silhouette-adventurer.png');
  await sharp(chosen).png({ compressionLevel: 9 }).toFile(png);
  await sharp(chosen).webp({ quality: 90, alphaQuality: 95, effort: 6 }).toFile(path.join(outDir, 'silhouette-adventurer.webp'));
  await sharp(chosen).resize({ width: 320, height: 320, fit: 'inside' })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 }).toFile(path.join(outDir, 'silhouette-adventurer-320.webp'));
  const m = await sharp(png).metadata();
  const kb = (p) => Math.round(fs.statSync(p).size / 1024);
  console.log(`silhouette-adventurer ${m.width}x${m.height} png=${kb(png)}KB ` +
    `webp=${kb(path.join(outDir, 'silhouette-adventurer.webp'))}KB ` +
    `thumb=${kb(path.join(outDir, 'silhouette-adventurer-320.webp'))}KB`);
})();

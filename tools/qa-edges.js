/**
 * qa-edges.js — 透過処理の品質を数値で点検する。
 *   輪郭画素（不透明だが隣に半透明/透明がある画素）について
 *     - 白残り      : 白背景の抜き残しが縁に付いていないか
 *     - マゼンタ残り : クロマキーのスピルが縁に残っていないか
 *   半透明画素の数はフェザーが効いているかの目安（0 ならジャギー）。
 * 使い方: node qa-edges.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', 'src', 'assets', 'img');

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.png$/.test(e.name)) out.push(p);
  }
  return out;
}

(async () => {
  for (const p of walk(OUT)) {
    const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    let n = 0, bright = 0, mag = 0, semi = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        if (data[i + 3] !== 255) continue;
        const nb = [(y * w + x - 1) * 4, (y * w + x + 1) * 4, ((y - 1) * w + x) * 4, ((y + 1) * w + x) * 4];
        if (!nb.some((j) => data[j + 3] < 255)) continue;
        n++;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.min(r, g, b) >= 243) bright++;
        if (Math.min(r, b) - g >= 45 && Math.min(r, b) >= 120) mag++;
      }
    }
    for (let i = 0; i < w * h; i++) { const a = data[i * 4 + 3]; if (a > 0 && a < 255) semi++; }
    const rel = path.relative(OUT, p).split(path.sep).join('/');
    console.log(rel.padEnd(28) +
      ' 輪郭画素=' + String(n).padStart(6) +
      '  白残り=' + (100 * bright / Math.max(1, n)).toFixed(1) + '%' +
      '  マゼンタ残り=' + (100 * mag / Math.max(1, n)).toFixed(2) + '%' +
      '  半透明画素=' + semi);
  }
})();

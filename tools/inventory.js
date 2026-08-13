const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const roots = process.argv.slice(2);
function walk(d, out=[]) {
  for (const e of fs.readdirSync(d, {withFileTypes:true})) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(png|jpe?g|webp)$/i.test(e.name)) out.push(p);
  }
  return out;
}
(async () => {
  const rows = [];
  for (const r of roots) for (const f of walk(r)) {
    const buf = fs.readFileSync(f);
    let m = {};
    try { m = await sharp(f).metadata(); } catch(e) { m = {err: e.message}; }
    let alphaUsed = null;
    if (m.hasAlpha) {
      const st = await sharp(f).ensureAlpha().extractChannel(3).stats();
      alphaUsed = `alphaMin=${st.channels[0].min} mean=${Math.round(st.channels[0].mean)}`;
    }
    rows.push({file: f, fmt: m.format, w: m.width, h: m.height, ch: m.channels, alpha: !!m.hasAlpha, kb: Math.round(buf.length/1024), sha: crypto.createHash('sha256').update(buf).digest('hex').slice(0,12), alphaUsed});
  }
  console.log(JSON.stringify(rows, null, 1));
})();

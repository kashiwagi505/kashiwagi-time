const sharp = require('sharp');
const fs = require('fs'); const path = require('path');
const OUT = path.resolve(__dirname,'..','src','assets','img');
const bgHex = process.argv[2] || '#1a237e';
const files = process.argv.slice(3);
(async () => {
  const cell = 300;
  const items = [];
  for (const f of files) {
    const p = path.join(OUT, f);
    const img = await sharp(p).resize({width:cell-8, height:cell-8, fit:'inside'}).toBuffer();
    items.push({p, img});
  }
  const cols = 4, rows = Math.ceil(items.length/cols);
  const canvas = sharp({create:{width:cols*cell, height:rows*cell, channels:3, background:bgHex}});
  const comps = [];
  for (let i=0;i<items.length;i++) comps.push({input: items[i].img, left:(i%cols)*cell+4, top:Math.floor(i/cols)*cell+4});
  await canvas.composite(comps).png().toFile(path.join(__dirname,'qa-'+bgHex.replace('#','')+'.png'));
  console.log('wrote qa-'+bgHex.replace('#','')+'.png  ('+files.join(', ')+')');
})();

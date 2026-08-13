const sharp = require('sharp');
const files = process.argv.slice(2);
(async () => {
  for (const f of files) {
    const {data, info} = await sharp(f).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const {width:w, height:h, channels:c} = info;
    const px = (x,y) => { const i=(y*w+x)*c; return [data[i],data[i+1],data[i+2]]; };
    // corner samples
    const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1],[Math.floor(w/2),0],[0,Math.floor(h/2)]].map(([x,y])=>px(x,y).join(','));
    // histogram of border pixels
    const seen = new Map();
    for (let x=0;x<w;x++){ for (const y of [0,h-1]) { const k=px(x,y).join(','); seen.set(k,(seen.get(k)||0)+1);} }
    for (let y=0;y<h;y++){ for (const x of [0,w-1]) { const k=px(x,y).join(','); seen.set(k,(seen.get(k)||0)+1);} }
    const top = [...seen.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);
    // how many pixels are "near pure white" min>=250 low sat
    let nearWhite=0, nearKey=0;
    const key = top[0][0].split(',').map(Number);
    for (let i=0;i<w*h;i++){
      const r=data[i*c],g=data[i*c+1],b=data[i*c+2];
      const mn=Math.min(r,g,b), mx=Math.max(r,g,b);
      if (mn>=250 && mx-mn<=8) nearWhite++;
      if (Math.abs(r-key[0])<=10 && Math.abs(g-key[1])<=10 && Math.abs(b-key[2])<=10) nearKey++;
    }
    console.log(`${f}\n  ${w}x${h} corners=[${corners.join(' | ')}]\n  border top: ${top.map(([k,v])=>k+' x'+v).join(' ; ')}\n  nearPureWhite=${(100*nearWhite/(w*h)).toFixed(1)}%  nearKeyColor=${(100*nearKey/(w*h)).toFixed(1)}%\n`);
  }
})();

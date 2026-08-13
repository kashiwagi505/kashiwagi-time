const sharp=require('sharp'); const path=require('path');
const OUT=path.resolve(__dirname,'..','src','assets','img');
(async()=>{
 const rel=process.argv[2], bg=process.argv[3];
 const x=+process.argv[4], y=+process.argv[5], size=+process.argv[6], scale=+process.argv[7]||6;
 const p=path.join(OUT,rel);
 const m=await sharp(p).metadata();
 const left=Math.max(0,Math.min(x,m.width-size)), top=Math.max(0,Math.min(y,m.height-size));
 const crop=await sharp(p).extract({left,top,width:size,height:size}).png().toBuffer();
 const flat=await sharp({create:{width:size,height:size,channels:3,background:bg}})
   .composite([{input:crop,left:0,top:0}]).png().toBuffer();
 await sharp(flat).resize({width:size*scale,kernel:'nearest'}).png().toFile(path.join(__dirname,'zoom.png'));
 console.log(`${rel} ${m.width}x${m.height} crop@${left},${top} ${size}px x${scale}`);
})();

const sharp=require('sharp'); const path=require('path');
const REPO=path.resolve(__dirname,'..','..');
const SEED=240, MAXSAT=20;
function seed(r,g,b){const mn=Math.min(r,g,b),mx=Math.max(r,g,b);return mn>=SEED&&mx-mn<=MAXSAT;}
(async()=>{
 for (const file of process.argv.slice(2)) {
  const {data,info}=await sharp(path.join(REPO,file)).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const {width:w,height:h,channels:ch}=info;
  const lab=new Int32Array(w*h).fill(-1); let n=0; const comps=[];
  for(let i0=0;i0<w*h;i0++){
    if(lab[i0]!==-1)continue; const o0=i0*ch;
    if(!seed(data[o0],data[o0+1],data[o0+2])){lab[i0]=-2;continue;}
    const id=n++; const st=[i0]; lab[i0]=id; let area=0,border=false,s=0,s2=0,minx=w,maxx=0,miny=h,maxy=0;
    while(st.length){const i=st.pop(); const x=i%w,y=(i-x)/w; area++;
      if(x===0||y===0||x===w-1||y===h-1)border=true;
      if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
      const o=i*ch; const v=Math.min(data[o],data[o+1],data[o+2]); s+=v; s2+=v*v;
      for(const j of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1]){
        if(j<0||lab[j]!==-1)continue; const oj=j*ch;
        if(seed(data[oj],data[oj+1],data[oj+2])){lab[j]=id;st.push(j);} else lab[j]=-2; }
    }
    const mean=s/area, std=Math.sqrt(Math.max(0,s2/area-mean*mean));
    comps.push({area,border,mean:mean.toFixed(1),std:std.toFixed(2),box:`${minx},${miny}-${maxx},${maxy}`});
  }
  comps.sort((a,b)=>b.area-a.area);
  const bm=parseFloat(comps.find(c=>c.border).mean);
  console.log(`\n${file}  borderBgMean=${bm}`);
  for(const c of comps.filter(c=>c.area>=300).slice(0,10))
    console.log(`  area=${String(c.area).padStart(7)} border=${c.border?'Y':'.'} mean=${c.mean} std=${c.std} dMean=${(parseFloat(c.mean)-bm).toFixed(1)} box=${c.box}`);
 }
})();

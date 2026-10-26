// 비도 (v181, 사용자 2026-10-26 "검기와 비도 이펙트가 같다"): 암기 비도는 검기 반달과 다른 그림(쇠 단도)으로 그린다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:900,height:600}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/fxview.html'));await p.waitForFunction(()=>typeof drawProj==='function'&&typeof P!=='undefined'&&P);await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const X={art:{c:'225,230,240',cls:'궁',el:null},t:0};
    const old=ctx,cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const snap=kind=>{const q={x:P.x,y:P.y,vx:1,vy:0,size:1,X,c:X.art.c,kind,trail:[],ph:0},s=toScreen(q.x,q.y),w=80,h=60,x0=Math.round(s.x-w/2),y0=Math.round(s.y-24-h/2);
      ctx=cv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);try{drawProj(q)}finally{ctx.setTransform(1,0,0,1,0,0)}
      const d=ctx.getImageData(x0,y0,w,h).data;ctx=old;return d};
    const a=snap('crescent'),c=snap('blade');let diff=0,lit=0,red=0;
    for(let i=0;i<a.length;i+=4){if(Math.abs(a[i]-c[i])+Math.abs(a[i+1]-c[i+1])+Math.abs(a[i+2]-c[i+2])>60)diff++;if(c[i]+c[i+1]+c[i+2]>150)lit++;if(c[i]>120&&c[i+1]<90)red++}
    return{diff,lit,red}});
  ok(`비도는 그려진다 (${r.lit}픽셀)`,r.lit>20);
  ok(`비도와 검기 반달의 그림이 다르다 (${r.diff}픽셀 다름)`,r.diff>40);
  ok(`비도 자루의 붉은 술 (${r.red}픽셀)`,r.red>0);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

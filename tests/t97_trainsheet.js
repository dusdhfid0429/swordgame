// v159: 사용자 수련 시트 4장(assets/train2) — 운기조식·내공 수련·본원진기는 가부좌 장, 근력 바위·민첩 장대·지구력 마보는 각 시트 장으로 그린다.
// 세 가지 기운 연출은 서로 다르다: 운기조식=나선 기운+발밑 고리(MED), 내공 수련=손 사이 기운 구슬+소주천(NG), 본원진기=땅의 생기(TFX qi)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:640}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.waitForFunction(()=>sheetOk('train2'),null,{timeout:10000});await p.waitForTimeout(200);
  // 1. 시트: 36장, 클립 6개, 클립 안 장은 같은 캔버스·같은 발 기준점, 기운 모으는 장에는 손 사이 소켓 qi, 배율은 wuxia와 같다
  const s=await p.evaluate(()=>{const S=SHEETS.train2,F=S.frames,c=S.clips,same=Object.values(c).every(cl=>cl.f.every(i=>F[i].s+''===F[cl.f[0]].s+''&&F[i].pv+''===F[cl.f[0]].pv+''));
    return{n:F.length,clips:Object.keys(c).sort().join(','),same,qi:c.neigong.f.filter(i=>F[i].sk.qi).length,k:sheetK('train2')===sheetK('wuxia')}});
  ok(`train2 ${s.n}장 [${s.clips}] · 클립마다 같은 캔버스 ${s.same} · 기운 소켓 ${s.qi}장 · 배율 같음 ${s.k}`,s.n===36&&s.clips==='lift,medit,neigong,origin,stance,vault'&&s.same&&s.qi>=4&&s.k);
  // 2. 상태별 클립: span 클립은 수련 진행도에 맞춰 첫 장 → 끝 장
  const st=await p.evaluate(()=>{const C=SHEETS.train2.clips,r={},at=(k,u)=>{trnBusy={k,t:u*TRN_DUR[k],dur:TRN_DUR[k]};const f=heroFrame();return f[4]==='train2'?f[0]:'x'+f[4]};P.satk=0;P.runT=0;P.medit=false;
    for(const[k,c]of[['str','lift'],['agi','vault'],['end','stance'],['qi','origin'],['neigong','neigong']]){P.qiTraining=k==='neigong';r[k]=[at(k,0),at(k,.999)].join('→');r[k+'ok']=r[k]===[C[c].f[0],C[c].f.at(-1)].join('→')}
    trnBusy=null;P.qiTraining=false;P.medit=true;const m=heroFrame();r.med=C.medit.f.includes(m[0])&&m[4]==='train2';P.medit=false;
    P.chan={t:.6,dur:1.6,label:'내공 수련',fn:()=>{}};const g=heroFrame();r.chan=C.neigong.f.includes(g[0])&&g[4]==='train2';r.ngp=ngProg();P.chan=null;
    trnBusy={k:'pg2',t:0,dur:9};P.qiTraining=true;r.pg=heroFrame()[4]==='train2';r.pgNg=ngProg();trnBusy=null;P.qiTraining=false;return r});
  ok(`근력 ${st.str} · 민첩 ${st.agi} · 지구력 ${st.end} · 본원진기 ${st.qi} · 내공 ${st.neigong} · 운기조식 ${st.med} · 인물창 내공 수련 ${st.chan} (${st.ngp.toFixed(2)}) · 폐관은 가부좌 ${st.pg}, 내공 연출 아님 ${st.pgNg}`,
    st.strok&&st.agiok&&st.endok&&st.qiok&&st.neigongok&&st.med&&st.chan&&Math.abs(st.ngp-.375)<.01&&st.pg&&st.pgNg===-1);
  // 3. 연출이 서로 다르다: 운기조식은 MED만, 내공 수련은 NG만, 본원진기는 TFX qi만 켜진다. 문파 옷 색도 train2 시트에 입혀진다
  const fx=await p.evaluate(()=>{const run=n=>{for(let i=0;i<n;i++){time+=.03;trainTick(.03);draw()}};const r={};trnBusy=null;TFX=[];P.medit=true;run(30);r.med=[MED.k>.9,NG.k];P.medit=false;run(30);
    startTrain('neigong');run(20);r.ng=[MED.k,NG.k>.9,!!NG.h];run(40);
    P.vit=999;startTrain('qi');run(5);r.qi=[MED.k,NG.k,TFX.some(f=>f.k==='qi')];run(60);
    P.sect='hwasan';const gb=heroGarb();r.garb=!!(gb&&gb.train2);if(gb&&gb.train2){const W=SHEETS.train2.img.width,H=SHEETS.train2.img.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(SHEETS.train2.img,0,0);const o=x.getImageData(0,0,W,H).data,n=gb.train2.getContext('2d').getImageData(0,0,W,H).data;let op=0,ch=0;for(let i=0;i<o.length;i+=4)if(o[i+3]>=20){op++;if(o[i]!==n[i]||o[i+2]!==n[i+2])ch++}r.gpct=ch/op}else r.gpct=0;P.sect=null;return r});
  ok(`운기조식 MED ${fx.med[0]} NG ${fx.med[1]} · 내공 수련 MED ${fx.ng[0].toFixed(2)} NG ${fx.ng[1]} 손 자리 ${fx.ng[2]} · 본원진기 MED ${fx.qi[0].toFixed(2)} NG ${fx.qi[1].toFixed(2)} 생기 ${fx.qi[2]} · 문파 옷 ${fx.garb} (물든 픽셀 ${(fx.gpct*100).toFixed(0)}%)`,
    fx.med[0]&&fx.med[1]===0&&fx.ng[0]<.05&&fx.ng[1]&&fx.ng[2]&&fx.qi[0]<.05&&fx.qi[1]<.05&&fx.qi[2]&&fx.garb&&fx.gpct>.25);
  // 4. 장면 사진 (사람 눈으로 확인): 운기조식 · 내공 수련(모으기/갈무리) · 본원진기 · 근력 · 민첩 · 지구력
  const shot=async(name,fn)=>{await p.evaluate(fn);await p.evaluate(()=>{for(let i=0;i<4;i++){time+=.03;draw()}});const q=await p.evaluate(()=>{const o=toScreen(P.x,P.y),c=document.querySelector('canvas'),r=c.getBoundingClientRect(),sx=r.width/c.width;return{x:r.left+o.x*sx,y:r.top+o.y*sx}});
    await p.screenshot({path:require('path').resolve(__dirname,'shots/train2_'+name+'.png'),clip:{x:Math.max(0,q.x-110),y:Math.max(0,q.y-150),width:220,height:190}})};
  await p.evaluate(()=>{paused=true;trnBusy=null;TFX=[];P.medit=false;P.qiTraining=false;closeTrain&&closeTrain();fx.length=0;texts.length=0;P.sect='hwasan';NPCF=[];mobs.length=0});
  const prep=`for(let i=0;i<40;i++){time+=.03;draw()}`;
  await shot('medit',`P.medit=true;${prep}`);
  await shot('neigong_a',`P.medit=false;MED.k=0;trnBusy={k:'neigong',t:.7,dur:1.6};P.qiTraining=true;${prep.replace('40','12')};trnBusy.t=.75`);
  await shot('neigong_b',`trnBusy.t=1.5`);
  await shot('origin',`trnBusy=null;P.qiTraining=false;NG.k=0;TFX=[];trainFx('qi');TFX[0].t=.6;trnBusy={k:'qi',t:.6,dur:1.4}`);
  await shot('str',`TFX=[];trainFx('str');TFX[0].t=.5;trnBusy={k:'str',t:.5,dur:1.3}`);
  await shot('agi',`TFX=[];trainFx('agi');TFX[0].t=.45;trnBusy={k:'agi',t:.45,dur:1.2}`);
  await shot('end',`TFX=[];trainFx('end');TFX[0].t=.4;trnBusy={k:'end',t:.4,dur:1.4}`);
  ok(`그리기 오류 없음 ${errs.join(' | ')}`,errs.length===0);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close()})();

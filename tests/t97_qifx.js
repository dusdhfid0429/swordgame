// v159–161: 운기조식·내공 수련·본원진기 연출은 서로 다르다 (MED=나선 기운+발밑 고리, NG=손 앞 기운 구슬+소주천, TFX qi=땅의 생기).
// v161 (사용자 2026-10-21): 수련 동작은 예전 wuxia 시트 클립으로 되돌렸다. train2 시트는 빌드에 들어가지 않는다 (원본은 assets/train2/source_sheets)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:640}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.waitForFunction(()=>sheetOk('wuxia'),null,{timeout:10000});await p.waitForTimeout(200);
  // 1. 수련 동작은 예전 클립: 근력 strength_1, 지구력 endurance, 민첩 dash, 내공 수련·운기조식 meditate. train2 시트는 없다
  const st=await p.evaluate(()=>{const C=SHEETS.wuxia.clips,r={none:!SHEETS.train2},at=k=>{trnBusy={k,t:.3,dur:TRN_DUR[k]};const f=heroFrame();return f};P.satk=0;P.runT=0;P.medit=false;
    for(const[k,c]of[['str','strength_1'],['agi','dash'],['end','endurance']]){const f=at(k);r[k]=f[4]==='wuxia'&&C[c].f.includes(f[0])}
    P.qiTraining=true;const n=at('neigong');r.neigong=n[4]==='wuxia'&&C.meditate.f.includes(n[0]);P.qiTraining=false;
    trnBusy=null;P.medit=true;const m=heroFrame();r.med=m[4]==='wuxia'&&C.meditate.f.includes(m[0]);P.medit=false;
    P.chan={t:.6,dur:1.6,label:'내공 수련',fn:()=>{}};r.ngp=ngProg();P.chan=null;
    trnBusy={k:'pg2',t:0,dur:9};P.qiTraining=true;r.pgNg=ngProg();trnBusy=null;P.qiTraining=false;return r});
  ok(`train2 없음 ${st.none} · 근력 ${st.str} · 민첩 ${st.agi} · 지구력 ${st.end} · 내공 ${st.neigong} · 운기조식 ${st.med} · 인물창 내공 수련 진행도 ${st.ngp.toFixed(2)} · 폐관은 내공 연출 아님 ${st.pgNg}`,
    st.none&&st.str&&st.agi&&st.end&&st.neigong&&st.med&&Math.abs(st.ngp-.375)<.01&&st.pgNg===-1);
  // 2. 연출이 서로 다르다: 운기조식은 MED만, 내공 수련은 NG만, 본원진기는 TFX qi만 켜진다
  const fx=await p.evaluate(()=>{const run=n=>{for(let i=0;i<n;i++){time+=.03;trainTick(.03);draw()}};const r={};trnBusy=null;TFX=[];P.medit=true;run(30);r.med=[MED.k>.9,NG.k];P.medit=false;run(30);
    startTrain('neigong');run(20);r.ng=[MED.k,NG.k>.9,!!NG.h];run(40);
    P.vit=999;startTrain('qi');run(5);r.qi=[MED.k,NG.k,TFX.some(f=>f.k==='qi')];run(60);return r});
  ok(`운기조식 MED ${fx.med[0]} NG ${fx.med[1]} · 내공 수련 MED ${fx.ng[0].toFixed(2)} NG ${fx.ng[1]} 손 자리 ${fx.ng[2]} · 본원진기 MED ${fx.qi[0].toFixed(2)} NG ${fx.qi[1].toFixed(2)} 생기 ${fx.qi[2]}`,
    fx.med[0]&&fx.med[1]===0&&fx.ng[0]<.05&&fx.ng[1]&&fx.ng[2]&&fx.qi[0]<.05&&fx.qi[1]<.05&&fx.qi[2]);
  // 3. 장면 사진 (사람 눈으로 확인): 운기조식 · 내공 수련 · 본원진기
  const shot=async(name,fn)=>{await p.evaluate(fn);await p.evaluate(()=>{for(let i=0;i<4;i++){time+=.03;draw()}});const q=await p.evaluate(()=>{const o=toScreen(P.x,P.y),c=document.querySelector('canvas'),r=c.getBoundingClientRect(),sx=r.width/c.width;return{x:r.left+o.x*sx,y:r.top+o.y*sx}});
    await p.screenshot({path:require('path').resolve(__dirname,'shots/qifx_'+name+'.png'),clip:{x:Math.max(0,q.x-110),y:Math.max(0,q.y-150),width:220,height:190}})};
  await p.evaluate(()=>{paused=true;trnBusy=null;TFX=[];P.medit=false;P.qiTraining=false;closeTrain&&closeTrain();fx.length=0;texts.length=0;P.sect='hwasan';NPCF=[];mobs.length=0});
  const prep=`for(let i=0;i<40;i++){time+=.03;draw()}`;
  await shot('medit',`P.medit=true;${prep}`);
  await shot('neigong',`P.medit=false;MED.k=0;trnBusy={k:'neigong',t:.7,dur:1.6};P.qiTraining=true;${prep.replace('40','12')};trnBusy.t=.75`);
  await shot('origin',`trnBusy=null;P.qiTraining=false;NG.k=0;TFX=[];trainFx('qi');TFX[0].t=.6;trnBusy={k:'qi',t:.6,dur:1.4}`);
  ok(`그리기 오류 없음 ${errs.join(' | ')}`,errs.length===0);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close()})();

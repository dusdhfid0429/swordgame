// 터치 로그 위치 (2026-10-15 v113): 상태 상자가 커져도(마성 게이지, 두 줄 자원) 로그는 그 아래에 놓인다 (사용자: 로그 창이 플레이어 정보창을 덮는다)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1200);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(600);
  const m=()=>p.evaluate(()=>{const s=document.querySelector('.status').getBoundingClientRect(),l=$('log').getBoundingClientRect();return{sb:Math.round(s.bottom),lt:Math.round(l.top),sh:Math.round(s.height)}});
  const a=await m();
  await p.evaluate(()=>{P.sect='cheonma';P.sim='N_cheonma_1';P.sims={N_cheonma_1:1};P.mara=20;P.silver=123456;P.fame=1234;P.vit=400;P.good=300;hud()});await p.waitForTimeout(500);
  const b2=await m();
  ok(`터치 로그: 기본 상태 ${a.sh}px → 로그 ${a.lt}≥${a.sb} · 마성 게이지+긴 자원 ${b2.sh}px → 로그 ${b2.lt}≥${b2.sb}`,a.lt>=a.sb&&b2.lt>=b2.sb&&b2.sh>a.sh);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

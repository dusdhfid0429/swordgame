// 실내 날씨 (v121): 전각 안에서는 비·눈·흐림·폭염 연출을 그리지 않는다. 밖에서는 그대로 (사용자 버그 보고 2026-10-16)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 비: 빗줄기는 lineTo 140번. 전각 안에서는 그 호출이 없어야 한다. 눈·흐림·폭염은 fillRect/arc 횟수가 밖보다 작아야 한다
  const r=await p.evaluate(()=>{paused=true;const cnt=(fn)=>{let n=0;const o=ctx.lineTo;ctx.lineTo=function(){n++;return o.apply(this,arguments)};fn();ctx.lineTo=o;return n};
    const arcs=(fn)=>{let n=0;const o=ctx.arc;ctx.arc=function(){n++;return o.apply(this,arguments)};fn();ctx.arc=o;return n};
    tod=.5;G.weather='비';regionJump('hq_hwasan',20,22);const out=cnt(draw);
    regionJump(REGION().halls[0].id,4,4);const inHall=!!REGION().hall,inn=cnt(draw);
    G.weather='눈';const snowIn=arcs(draw);regionJump('hq_hwasan',20,22);const snowOut=arcs(draw);G.weather='맑음';return{out,inn,inHall,snowIn,snowOut}});
  ok(`비: 밖 lineTo ${r.out} ≥140, 전각 안(${r.inHall}) ${r.inn} < 밖−100 · 눈: 밖 arc ${r.snowOut} 안 ${r.snowIn}`,r.inHall&&r.out>=140&&r.inn<r.out-100&&r.snowOut-r.snowIn>=100);
  if(errs.length)console.log('ERRORS',errs);await b.close()})();

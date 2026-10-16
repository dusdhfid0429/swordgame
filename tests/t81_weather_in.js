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
    // 같은 맵에서 맑음일 때와의 차이만 본다 (담·가구 등 다른 선 그리기는 맵마다 달라서 절대값 비교는 안 된다)
    const diff=(w,m)=>{G.weather='맑음';const a=m(draw);G.weather=w;const b=m(draw);G.weather='맑음';return b-a};
    tod=.5;regionJump('hq_hwasan',20,22);const out=diff('비',cnt),snowOut=diff('눈',arcs);
    regionJump(REGION().halls[0].id,4,4);const inHall=!!REGION().hall,inn=diff('비',cnt),snowIn=diff('눈',arcs);return{out,inn,inHall,snowIn,snowOut}});
  ok(`비(맑음 대비 lineTo 증가): 밖 ${r.out} ≥140, 전각 안(${r.inHall}) ${r.inn} ≤5 · 눈(arc 증가): 밖 ${r.snowOut} ≥100 안 ${r.snowIn} ≤5`,r.inHall&&r.out>=140&&r.inn<=5&&r.snowOut>=100&&r.snowIn<=5);
  if(errs.length)console.log('ERRORS',errs);await b.close()})();

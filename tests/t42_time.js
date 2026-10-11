// 시간: 낮밤 한 바퀴가 지나면 한 살을 먹는다. 수명은 지구력·본원진기로만 정해지고 따로 하한을 두지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 하루 = 1년: 낮밤 한 바퀴(DAY_SEC)를 돌리면 나이가 꼭 한 살 는다
  const r=await p.evaluate(()=>{const a0=P.age,t0=tod,steps=300;for(let i=0;i<steps;i++)update(DAY_SEC/steps);return{a0,a1:P.age,t0,t1:tod,ys:YEAR_SEC,ds:DAY_SEC}});
  ok(`낮밤 한 바퀴(${r.ds}초) = 1년(${r.ys}초): 나이 ${r.a0.toFixed(2)} → ${r.a1.toFixed(2)}, 시각 ${r.t0.toFixed(2)} → ${r.t1.toFixed(2)}`,r.ys===r.ds&&Math.abs(r.a1-r.a0-1)<.01&&Math.abs(r.t1-r.t0)<.01);
  // 2. 수명은 지구력(58+지구력×0.7+0~8)과 본원진기 보정으로만 정해진다: 60세 아래도 있을 수 있다
  const l=await p.evaluate(()=>{const out={now:P.life,end:P.st.end,qb:P.lifeQB,min:typeof LIFE_MIN};const q=P.st.qi;P.st.qi=0;recalc();out.afterQiDrop=P.life;P.st.qi=q;recalc();out.back=P.life;return out});
  ok(`수명 ${l.now}세 (지구력 ${l.end}, 본원진기 보정 +${l.qb}), 본원진기 0이면 ${l.afterQiDrop}세, 되돌리면 ${l.back}세 · 하한 상수 없음(${l.min})`,
    l.now>=58+Math.floor(l.end*.7)+l.qb-1&&l.afterQiDrop===l.now-l.qb&&l.back===l.now&&l.min==='undefined');
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

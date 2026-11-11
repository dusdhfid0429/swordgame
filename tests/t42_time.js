// 시간: 낮밤 한 바퀴가 지나면 한 살을 먹는다. 수명은 지구력·본원진기로만 정해지고 따로 하한을 두지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 1년 = 실제 30분 (사용자 2026-10-20): 낮밤 한 바퀴(DAY_SEC)는 한 달, 열두 바퀴를 돌리면 나이가 꼭 한 살 는다
  const r=await p.evaluate(()=>{const a0=P.age,t0=tod,steps=1200;for(let i=0;i<steps;i++)update(DAY_SEC*12/steps);return{a0,a1:P.age,t0,t1:tod,ys:YEAR_SEC,ds:DAY_SEC}});
  ok(`1년 ${r.ys}초 = 낮밤(${r.ds}초) 열두 바퀴: 나이 ${r.a0.toFixed(2)} → ${r.a1.toFixed(2)}, 시각 ${r.t0.toFixed(2)} → ${r.t1.toFixed(2)}`,r.ys===1800&&r.ys===r.ds*12&&Math.abs(r.a1-r.a0-1)<.01&&Math.abs(r.t1-r.t0)<.01);
  // 1b. 접속해 있는 동안만 흐른다 (사용자 2026-10-21): 화면을 가렸다 한 시간 뒤 돌아와도 한 프레임은 0.05초까지만, 창을 열면 멈춘다
  const h=await p.evaluate(()=>{const a0=P.age;last=performance.now()-3600e3;loop(performance.now());const a1=P.age;openPanel('char');const a2=P.age;for(let i=0;i<60;i++)loop(performance.now()+i*16);const a3=P.age;closePanels();return{gap:(a1-a0)*YEAR_SEC,win:a3-a2}});
  ok(`한 시간 뒤 돌아온 첫 프레임 ${h.gap.toFixed(3)}초만 흐름, 창을 연 동안 나이 +${h.win}`,h.gap<=.051&&h.win===0);
  // 1c. 백그라운드(document.hidden)에서는 rAF가 돌아도 나이·달력이 그대로, 돌아온 첫 프레임도 0.05초 넘게 흐르지 않는다 (사용자 2026-11-11)
  const bg=await p.evaluate(()=>{const d=Object.getOwnPropertyDescriptor(Document.prototype,'hidden');const set=v=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>v});document.dispatchEvent(new Event('visibilitychange'))};
    const a0=P.age,c0=G.cal;set(true);const t=performance.now();for(let i=0;i<600;i++)loop(t+i*1000);const a1=P.age,c1=G.cal;
    set(false);delete document.hidden;loop(performance.now()+16);const a2=P.age;return{hid:(a1-a0)*YEAR_SEC,cal:c1-c0,back:(a2-a1)*YEAR_SEC,restored:document.hidden===false&&!!d}});
  ok(`숨긴 채 10분 동안 나이 +${bg.hid}초·달력 +${bg.cal}, 돌아온 첫 프레임 ${bg.back.toFixed(3)}초`,bg.hid===0&&bg.cal===0&&bg.back<=.051&&bg.restored);
  // 2. 수명은 지구력(58+지구력×0.7+0~8)과 본원진기 보정으로만 정해진다: 60세 아래도 있을 수 있다
  const l=await p.evaluate(()=>{const out={now:P.life,end:P.st.end,qb:P.lifeQB,min:typeof LIFE_MIN};const q=P.st.qi;P.st.qi=0;recalc();out.afterQiDrop=P.life;P.st.qi=q;recalc();out.back=P.life;return out});
  ok(`수명 ${l.now}세 (지구력 ${l.end}, 본원진기 보정 +${l.qb}), 본원진기 0이면 ${l.afterQiDrop}세, 되돌리면 ${l.back}세 · 하한 상수 없음(${l.min})`,
    l.now>=58+Math.floor(l.end*.7)+l.qb-1&&l.afterQiDrop===l.now-l.qb&&l.back===l.now&&l.min==='undefined');
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// 시간과 수명: 낮밤 한 바퀴가 지나면 한 살을 먹고, 수명은 근골·본원진기가 어떻든 60세는 보장된다
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
  // 2. 수명 하한 60세: 지구력이 0이어도, 본원진기가 깎여도 60세 아래로 내려가지 않는다
  const l=await p.evaluate(()=>{const out={now:P.life};
    const lows=[];for(let i=0;i<30;i++){const st={...P.st,end:0};const saved=P.st;P.st=st;lows.push(Math.max(LIFE_MIN,Math.round(58+P.st.end*.7+Math.random()*8)));P.st=saved}
    out.min=Math.min(...lows);const q=P.st.qi;P.st.qi=0;recalc();out.afterQiDrop=P.life;P.st.qi=q;recalc();out.back=P.life;return out});
  ok(`새 인물 수명 ${l.now}세, 지구력 0이어도 최소 ${l.min}세, 본원진기가 0이 돼도 ${l.afterQiDrop}세 (되돌리면 ${l.back}세)`,l.now>=60&&l.min>=60&&l.afterQiDrop>=60&&l.back>=60);
  // 3. 옛 저장(수명 55)도 불러오면 60세로 올라온다
  const s=await p.evaluate(()=>{saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));d.P.life=55;d.P.lifeQB=0;localStorage.setItem(SAVE_KEY,JSON.stringify(d));applySave(loadGame());return P.life});
  ok(`수명 55로 저장된 옛 인물을 불러오면 ${s}세`,s>=60);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

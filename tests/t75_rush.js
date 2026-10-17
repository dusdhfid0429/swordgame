// 궁지 몰린 문파 (2026-10-15 v113): 본산 맵의 문파 인원이 줄수록 리젠 상한이 늘고, 보강이 빨라지고 한 번에 여럿 온다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const o={};paused=true;popInit();const sid='hwasan',base=popBase(SECTS[sid]);G.pop[sid]=base;popSync();regionJump('hq_hwasan',20,20);runHooks('regionLoaded','hq_hwasan');
    const sp=REGION().spawns.find(([k])=>FAC_KIND['정'].includes(k));o.kind=sp[0];o.cap0=sp[1];o.capFull=facCap(sp[0],sp[1]);
    G.pop[sid]=base*.3;popSync();o.capLow=facCap(sp[0],sp[1]);
    // 보강: 간격이 짧아지고 한 번에 여럿. 가득 찬 뒤 모두 치우고 한 번의 보강으로 몇 명이 오는지
    for(let i=0;i<10;i++)spawnTick();const own=()=>mobs.filter(m=>m.sect===sid&&m.hp>0);o.init=own().length;mobs=mobs.filter(m=>m.sect!==sid);
    const st=REGION()._fs[sp[0]];st.at=time-2.1;spawnTick();o.reinLow=own().length;   // 인원 30%: 간격 5×(1-.75×.7)≈2.4초 → 2.1초는 아직
    st.at=time-2.6;spawnTick();o.reinLow2=own().length;
    G.pop[sid]=base;popSync();mobs=mobs.filter(m=>m.sect!==sid);st.at=time-2.6;spawnTick();o.reinFull=own().length;st.at=time-5.1;spawnTick();o.reinFull2=own().length;return o});
  ok(`상한 ${r.kind}: 기준 ${r.cap0} → 인원 100% ${r.capFull}, 30% ${r.capLow} · 30% 보강: 2.1초 ${r.reinLow}명, 2.6초 ${r.reinLow2}명 · 100% 보강: 2.6초 ${r.reinFull}명, 5.1초 ${r.reinFull2}명`,
    r.capFull===r.cap0&&r.capLow>r.cap0&&r.reinLow===0&&r.reinLow2===2&&r.reinFull===0&&r.reinFull2===1);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

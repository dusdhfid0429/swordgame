// 인원 감소 (2026-10-15 v112): 직위별 손실(졸개 1 … 장로 15), 본산 안에서는 두 배, 장문인이 죽어 있으면 해마다 늘지 않는다, 10%마다 알림
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const o={};popReset&&0;popInit();const sid='namgung',base=popBase(SECTS[sid]);G.pop[sid]=base;popSync();
    const kill=(rank,reg)=>{const e=mkFac('정',rank>=2?1:0,10,10,sid);e.rank=rank;e.sect=sid;const was=G.pop[sid];runHooks('kill',e);return Math.round((was-G.pop[sid])*10)/10};
    regionJump('gaebong',20,20);o.r0=kill(0);o.r2=kill(2);o.r4=kill(4);
    regionJump('hq_namgung',20,20);o.hq0=kill(0);o.hq4=kill(4);
    // 장문인이 죽어 있으면 해마다 늘지 않는다
    G.pop[sid]=100;popSync();G.mdead[sid]={y:Math.floor(G.cal),life:P.lifeNo};runHooks('newYear');o.deadGrow=G.pop[sid];delete G.mdead[sid];runHooks('newYear');o.aliveGrow=G.pop[sid];
    // 10% 문턱 알림
    G.pop[sid]=base*.31;const n0=document.querySelectorAll('#log .info').length;popLose(sid,base*.02,'');o.note=$('log').innerText.includes('남궁세가 인원');
    G.pop[sid]=base;popSync();return o});
  ok(`직위별 손실: 졸개 ${r.r0} · 일대 ${r.r2} · 장로 ${r.r4} · 본산 안 졸개 ${r.hq0} 장로 ${r.hq4}`,r.r0===1&&r.r2===4&&r.r4===15&&r.hq0===2&&r.hq4===30);
  ok(`장문인 사망 중 증가 없음 100→${r.deadGrow} · 복귀 뒤 증가 ${r.aliveGrow}`,r.deadGrow===100&&r.aliveGrow>100);
  ok(`10% 문턱 알림 ${r.note}`,r.note);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

// 멸문 폐허의 멈춘 NPC (user 2026-11-10 "문파가 폐허가 되었는데 장로들이 공격도 안 되고 공격도 안 하는 상태로 가만히 있다"):
// 본산 사슬 밖의 문파 맵(대연무장 ar_<문파>, 마교 장로원·흑혈옥)도 폐허면 사부·교두·제자·옥주가 서지 않는다. 문파가 살아나면 다시 선다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{paused=true;popInit();const o={},fall=sid=>{G.mdead[sid]={y:0,life:P.lifeNo};G.pop[sid]=.5;regionJump('gaebong',20,20);mobs=[];const e=mkFac('정',0,10,10,sid);e.sect=sid;runHooks('kill',e)};
    const see=id=>{regionJump(id,10,10);runHooks('tick',.1);return REGIONS[id].npcs.length};
    o.arLive=see('ar_hwasan');fall('hwasan');o.pop=G.pop.hwasan;o.arDead=see('ar_hwasan');o.arGore=!!REGIONS.ar_hwasan.dead;
    o.left=Object.keys(REGIONS).filter(k=>{const R=REGIONS[k],s=ruinSect(R);return s&&s.id==='hwasan'}).filter(k=>see(k)>0);
    o.cmLive=see('hq_cheonma_6');fall('cheonma');o.cmDead=see('hq_cheonma_6');o.jail=see('hq_cheonma_9');
    delete G.mdead.hwasan;G.pop.hwasan=popBase(SECTS.hwasan);o.arBack=see('ar_hwasan');return o});
  ok(`화산파 대연무장 살아 있을 때 ${r.arLive}명 → 멸문(${r.pop}) 뒤 ${r.arDead}명 · 폐허 ${r.arGore}`,r.arLive>0&&r.pop===0&&r.arDead===0&&r.arGore);
  ok(`화산파 폐허 맵 어디에도 멈춘 NPC 없음 ${r.left.join(',')||'-'}`,!r.left.length);
  ok(`마교 장로원 ${r.cmLive}명 → 멸문 뒤 ${r.cmDead}명 · 흑혈옥 ${r.jail}명`,r.cmLive>0&&r.cmDead===0&&r.jail===0);
  ok(`문파가 살아나면 대연무장에 다시 선다 ${r.arBack}명`,r.arBack>0);
  ok('오류 없음 '+errs.join(' | '),!errs.length);
  await b.close();
})();

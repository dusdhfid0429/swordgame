// 멸문 폐허 (v115): 인원 0인 문파의 본산은 들어갈 수 있고(폐문 아님) 핏자국·시체가 놓이며 전각 안의 사람도 없다. 살아 있는 문파는 그대로
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 살아 있는 화산파: 폐허 아님, 핏자국 없음
  const a=await p.evaluate(()=>{paused=true;popInit();regionJump('hq_hwasan_outer',20,22);const R=REGION();draw();return{dead:R.dead,gore:R.gore,npcs:REGIONS[R.halls[0].id].npcs.length,builds:builds.length}});
  ok(`살아 있는 본산: 폐허 ${a.dead} 핏자국 ${a.gore} 전각 안 사람 ${a.npcs} 건물 ${a.builds}`,a.dead===false&&a.gore===null&&a.npcs>0&&a.builds>0);
  // 2. 멸문(인원 0): 폐허 표시, 핏자국 26~40 + 시체 6~9, 사람 0, 제 문파 무인 리젠 없음, 깃발 안 그림, 한 장면 그려도 오류 없음
  const d=await p.evaluate(()=>{G.pop.hwasan=0;popSync();regionJump('hq_hwasan_outer',20,22);const R=REGION();tod=.3;draw();const g=R.gore||[];const own=FAC_KIND['정'];
    return{dead:R.dead,ruin:R.ruin,blood:g.filter(x=>x.k==='blood').length,bodies:g.filter(x=>x.k==='body').length,npcs:R.npcs.length,ownSpawn:(R.spawns||[]).some(([k])=>own.includes(k)),pal:g.find(x=>x.k==='body').e.d.pal,log:$('log').textContent.includes('폐허가 되었다')}});
  ok(`멸문 본산: 폐허 ${d.dead}/${d.ruin} 핏자국 ${d.blood} 시체 ${d.bodies}(${d.pal}) 사람 ${d.npcs} 제 문파 리젠 ${d.ownSpawn} 기록 ${d.log}`,d.dead===true&&d.ruin===true&&d.blood>=26+6&&d.bodies>=6&&d.bodies<=9&&d.npcs===0&&!d.ownSpawn&&!!d.pal&&d.log);
  // 3. 출입구: 멸문 본산 쪽 출입구는 막히지 않는다 (인원만 줄어 닫힌 맵은 막힌다)
  const g=await p.evaluate(()=>{regionJump('hq_hwasan_gate',20,20);const gt=REGION().gates.find(g=>g.to==='hq_hwasan_outer');P.x=gt.x;P.y=gt.y;P.gateLock=0;const c={};runHooks('gate',c);const o={dead:!!c.stop};
    G.pop.hwasan=popBase(SECTS.hwasan)*.05;popSync();P.x=gt.x;P.y=gt.y;P.gateLock=0;const c2={};runHooks('gate',c2);o.low=!!c2.stop;o.closed=mapClosed('hq_hwasan_outer');G.pop.hwasan=0;popSync();return o});
  ok(`출입구: 멸문이면 막힘 ${g.dead}, 인원 5%면 막힘 ${g.low} (닫힌 맵 ${g.closed})`,g.dead===false&&g.low===true&&g.closed===true);
  // 4. 전각 안: 사람 없고 핏자국·시체가 있다. 문파가 살아나면 사람이 돌아온다
  const h=await p.evaluate(()=>{regionJump('hq_hwasan_outer',20,22);const hid=REGION().halls[0].id;regionJump(hid,7,6);const H=REGION();draw();const o={dead:H.dead,gore:(H.gore||[]).length,bodies:(H.gore||[]).filter(x=>x.k==='body').length,npcs:H.npcs.length};
    G.pop.hwasan=popBase(SECTS.hwasan);popSync();regionJump(hid,7,6);o.dead2=REGION().dead;o.npcs2=REGION().npcs.length;return o});
  ok(`전각 안: 폐허 ${h.dead} 핏자국·시체 ${h.gore}(시체 ${h.bodies}) 사람 ${h.npcs} → 회복 뒤 폐허 ${h.dead2} 사람 ${h.npcs2}`,h.dead===true&&h.bodies>=1&&h.gore>=h.bodies*2&&h.npcs===0&&h.dead2===false&&h.npcs2>0);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

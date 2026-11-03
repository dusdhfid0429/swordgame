// v231 멸문 규칙 (사용자 2026-11-03 "장문인을 죽이지 않았는데 개방이 멸문했어"): 장문인이 살아 있으면 인원은 1 밑으로 안 내려가고(존망의 기로),
// 장문인을 쓰러뜨린 뒤에야 0(멸문). 세력 힘 -10에 세력 전체가 0이 되지 않는다. 멸문 순간 본산에 있으면 최후의 결사대, 최후의 전인 비밀통로 탈출 알림, 자리를 비웠으면 폐허에서 알림. 옛 저장 되살림
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const a=await p.evaluate(()=>{paused=true;const o={},sid='gaebang';popInit();delete G.mdead[sid];G.pop[sid]=popBase(SECTS[sid]);popSync();
    const kill=()=>{const e=mkFac('정',1,10,10,sid);e.rank=4;e.sect=sid;runHooks('kill',e)};
    regionJump('gaebong',20,20);for(let i=0;i<60;i++)kill();o.floor=G.pop[sid];o.brink=$('log').innerText.includes('존망의 기로');
    popWarLoss(['정'],.5);o.war=G.pop[sid];
    // 세력 힘 버그: 힘이 10 이하일 때 -10
    const f='정',w=wld();setPow(f,8);powAdd(f,-10);o.facLive=liveSects().filter(s=>alFac(s.al)===f&&s.id!==sid).every(s=>G.pop[s.id]>0);
    // 장문인 격살 → 남은 무인 하나 베면 멸문. 본산에 있으면 결사대
    G.mdead[sid]={y:Math.floor(G.cal),life:P.lifeNo};regionJump(hqId(SECTS[sid]),20,22);mobs=[];kill();o.dead=G.pop[sid];
    o.last=mobs.filter(m=>m.last===sid).length;o.lastLog=$('log').innerText.includes('최후의 결사대');o.esc=$('log').innerText.includes('비밀통로로 빠져나갔다');o.remn=!!(G.remn&&G.remn[sid]);
    for(const m of mobs.filter(m=>m.last===sid)){m.hp=0;runHooks('kill',m)}o.lastDone=$('log').innerText.includes('결사대가 모두 쓰러졌다');o.seenHere=!!G.fall[sid].seen;
    return o});
  ok(`장문인이 살아 있으면 인원 ${a.floor}에서 멈춤 · 존망의 기로 알림 ${a.brink} · 대전 패배에도 ${a.war}`,a.floor===1&&a.brink&&a.war===1);
  ok(`세력 힘 8에서 -10 맞아도 정파 문파 모두 살아 있음 ${a.facLive}`,a.facLive);
  ok(`장문인 격살 뒤 멸문 ${a.dead} · 결사대 ${a.last}명 알림 ${a.lastLog} · 전인 탈출 ${a.esc} 잔당 ${a.remn} · 결사대 전멸 알림 ${a.lastDone}`,a.dead===0&&a.last===5&&a.lastLog&&a.esc&&a.remn&&a.lastDone&&a.seenHere);
  const c=await p.evaluate(()=>{const o={},sid='hwasan';popInit();G.mdead[sid]={y:Math.floor(G.cal),life:P.lifeNo};G.pop[sid]=.5;regionJump('gaebong',20,20);mobs=[];
    const e=mkFac('정',0,10,10,sid);e.sect=sid;runHooks('kill',e);o.dead=G.pop[sid];o.noLast=!mobs.some(m=>m.last===sid);o.away=!G.fall[sid].seen;
    regionJump(hqId(SECTS[sid]),20,22);runHooks('regionLoaded',hqId(SECTS[sid]));o.back=$('log').innerText.includes('자리를 비운 사이 화산파');o.seen=!!G.fall[sid].seen;
    // 멸문 문파 무인은 들판에 새로 나오지 않는다
    o.noSpawn=[...Array(200)].every(()=>mkFac('정',0,10,10).sect!==sid);return o});
  ok(`자리를 비운 사이 멸문 ${c.dead===0} 결사대 없음 ${c.noLast} → 돌아오면 알림 ${c.back} · 멸문 문파 무인 안 나옴 ${c.noSpawn}`,c.dead===0&&c.noLast&&c.away&&c.back&&c.seen&&c.noSpawn);
  const d=await p.evaluate(()=>{const o={};G.pop.gaebang=0;delete G.mdead.gaebang;G.pop.hwasan=0;delete G.popRev231;G.gone=G.gone||{};G.pop.jongnam=0;G.gone.jongnam=1;delete G.mdead.jongnam;
    runHooks('gLoaded',{});return{gaebang:G.pop.gaebang,hwasan:G.pop.hwasan,jongnam:G.pop.jongnam}});
  ok(`옛 저장: 장문인 산 개방 되살림 ${d.gaebang} · 장문인 죽은 화산 그대로 ${d.hwasan} · 절멸 종남 그대로 ${d.jongnam}`,d.gaebang===1&&d.hwasan===0&&d.jongnam===0);
  ok('오류 없음 '+errs.join(' | '),!errs.length);
  await b.close();
})();

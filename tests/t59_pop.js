// 문파 인원 (2026-10-13): 인원으로 세력의 힘을 계산, 해마다 증가, 죽으면 감소, 직위 분포, 인원이 줄면 본산 맵이 닫히고 0이면 멸문
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 초기 인원과 힘
  const t1=await p.evaluate(()=>{update(.1);return{hwasan:sectPop('hwasan'),cheonma:sectPop('cheonma'),n:Object.keys(G.pop).length,pow:G.W.pow,init:STORY.INIT.pow}});
  ok(`초기 인원 화산파 ${t1.hwasan}, 천마신교 ${t1.cheonma}, 문파 ${t1.n}곳 · 힘 ${JSON.stringify(t1.pow)}`,t1.hwasan===300&&t1.cheonma===400&&t1.n===51&&JSON.stringify(t1.pow)===JSON.stringify(t1.init));
  // 2. 해마다 증가(마교가 더 빨리), 봉문은 더, 점령은 0
  const t2=await p.evaluate(()=>{G.seal.emei={by:'마',y:0};G.occ.hwasan={by:'사',y:0};const a={h:sectPop('hwasan'),e:sectPop('emei'),c:sectPop('cheonma'),s:sectPop('shaolin')};P.age=9;lastYear=8;update(.1);
    const r={h:sectPop('hwasan')-a.h,e:sectPop('emei')-a.e,c:sectPop('cheonma')-a.c,s:sectPop('shaolin')-a.s,ma:G.W.pow.마};G.seal={};G.occ={};return r});
  ok(`한 해: 점령 화산 +${t2.h}, 봉문 아미 +${t2.e}, 소림 +${t2.s}, 천마신교 +${t2.c} → 마교 힘 ${t2.ma}`,t2.h===0&&t2.e>t2.s&&t2.s>=12&&t2.c>=28&&t2.ma>30);
  // 3. 죽음: 플레이어가 죽이면 1명, 무인끼리면 0.2명. 힘이 따라 준다
  const t3=await p.evaluate(()=>{const p0=sectPop('cheonma'),w0=G.W.pow.마;const e=mkFac('마',0,P.x+2,P.y,'cheonma');e.rank=0;mobs.push(e);e.hp=1;damage(e,99,0,0,P);const p1=sectPop('cheonma');
    const e2=mkFac('마',0,P.x+2,P.y,'cheonma'),k=mkFac('정',1,P.x+3,P.y,'hwasan');mobs.push(e2,k);e2.hp=1;mobHurt(e2,99,k);return{d1:p0-p1,d2:p1-sectPop('cheonma'),w:w0-G.W.pow.마}});
  ok(`처치 -${t3.d1}, 무인끼리 -${t3.d2}, 마교 힘 -${t3.w}`,t3.d1===1&&Math.abs(t3.d2-.2)<.01&&t3.w>0);
  // 4. 사건 효과(powAdd)는 인원 비율로, 직위 분포는 무학·인원을 따른다
  const t4=await p.evaluate(()=>{const w0=G.W.pow.사,p0=sectPop('sama');powAdd('사',5);const r={dw:Math.round((G.W.pow.사-w0)*10)/10,dp:sectPop('sama')-p0};
    const cnt=s=>{const c={};for(let i=0;i<400;i++){const k=popRank(SECTS[s],true);c[k]=(c[k]||0)+1}return c};r.big=cnt('shaolin');G.pop.heukpung=5;r.small=cnt('heukpung');G.pop.heukpung=60;return r});
  ok(`사파 힘 +${t4.dw}(인원 +${t4.dp}) · 고수 직위 분포 소림 ${JSON.stringify(t4.big)} / 흑풍채(인원 5) ${JSON.stringify(t4.small)}`,t4.dw>=4&&t4.dw<=6&&t4.dp>0&&(t4.big[4]||0)>0&&(t4.big[3]||0)>(t4.small[3]||0)&&!(t4.small[4]>0));
  // 5. 본산 맵: 대문파 4장이 인원에 따라 3·2·1장으로 닫히고, 닫힌 맵의 문은 막힌다. 0이면 멸문: 가입 불가, 장문인 맵도 폐허
  const t5=await p.evaluate(()=>{const s=SECTS.hwasan,r={};for(const[pp,k]of[[300,'a'],[140,'b'],[70,'c'],[20,'d'],[0,'e']]){G.pop.hwasan=pp;r[k]=[liveMaps(s),closedMaps(s).join(',')]}
    G.pop.hwasan=70;mobs=[];loadRegion('hq_hwasan');P.reg='hq_hwasan';const g=REGION().gates.find(g=>g.to==='hq_hwasan_back');P.x=g.x;P.y=g.y;P.gateLock=0;const c={stop:false};runHooks('gate',c);r.blocked=c.stop;r.log=$('log').textContent.includes('닫혔다');
    loadRegion('hq_hwasan_gate');P.reg='hq_hwasan_gate';r.ruin=!!REGION().ruin;r.npcs=(REGION().npcs||[]).length;G.pop.hwasan=0;P.fame=300;r.join=joinBlock(s);loadRegion('hq_hwasan');r.ruin0=!!REGION().ruin;openNpc(hqNpc('hq_hwasan'));r.dlg=$('wbody').textContent;G.pop.hwasan=300;loadRegion('hq_hwasan');r.back=(REGION().npcs||[]).length;return r});
  ok(`맵 수 300→${t5.a[0]} 140→${t5.b[0]} 70→${t5.c[0]}(${t5.c[1]}) 20→${t5.d[0]}(${t5.d[1]}) 0→${t5.e[0]}`,t5.a[0]===4&&t5.b[0]===3&&t5.c[0]===2&&t5.c[1]==='hq_hwasan_back,hq_hwasan_gate'&&t5.d[0]===1&&t5.e[0]===0);
  ok(`닫힌 후산 문 막힘 ${t5.blocked}(${t5.log}), 닫힌 산문 황폐 ${t5.ruin} NPC ${t5.npcs}`,t5.blocked&&t5.log&&t5.ruin&&t5.npcs===0);
  ok(`멸문: 가입 "${t5.join}", 폐허 ${t5.ruin0}, 대화 위패 ${t5.dlg.includes('위패')}, 되살리면 NPC ${t5.back}`,/멸문/.test(t5.join)&&t5.ruin0&&t5.dlg.includes('위패')&&t5.back>0);
  // 6. 결전에서 진 편은 8% 잃는다. 정세 창에 인원 카드
  const t6=await p.evaluate(()=>{G.pop.cheonma=400;popWarLoss(['마'],STORY.POP.roundLoss);closePanels();openPanel('story');return{c:sectPop('cheonma'),body:$('wbody').textContent}});
  ok(`결전 패배 천마신교 400→${t6.c}, 인원 카드 ${t6.body.includes('문파 인원')}`,t6.c===368&&t6.body.includes('문파 인원')&&t6.body.includes('기준 300'));
  // 7. 출현: 본산에 들어서면 제 문파 무인은 상한의 60%만, 죽은 자리는 5초 뒤 출입구에서 걸어와 채운다. 인원 0이면 안 온다
  const t7=await p.evaluate(()=>{closePanels();G.pop.hwasan=300;mobs=[];loadRegion('hq_hwasan');P.reg='hq_hwasan';P.x=20.5;P.y=30;for(let i=0;i<6;i++)spawnTick();
    const own=()=>mobs.filter(m=>m.kind==='정파 무인'&&m.hp>0&&!m.fixed),cap=REGION().spawns.find(s=>s[0]==='정파 무인')[1],n0=own().length;
    for(const m of own().slice(0,2)){m.hp=0}const n1=own().length;time+=10;spawnTick();const r1=mobs.filter(m=>m.rein&&m.kind==='정파 무인');const g=REGION().gates.find(g=>!g.door);
    const nearGate=r1.length&&REGION().gates.some(g=>Math.hypot(g.x-r1[0].x,g.y-r1[0].y)<2.5);for(let t=0;t<6&&own().length<n0;t++){time+=10;spawnTick()}const n2=own().length;   // 자리 찾기(무작위 30번)가 빗나갈 수 있어 몇 번 더 기다린다
    G.pop.hwasan=0;for(const m of own())m.hp=0;time+=10;spawnTick();const n3=own().length;G.pop.hwasan=300;return{cap,n0,n1,r1:r1.length,nearGate,n2,n3,goal:r1.length&&!!r1[0].goal}});
  ok(`상한 ${t7.cap} → 처음 ${t7.n0}명(60%), 둘 죽자 ${t7.n1} → 충원 ${t7.r1}명 출입구 곁 ${t7.nearGate} 목적지 ${t7.goal} → ${t7.n2}명 · 인원 0이면 ${t7.n3}명`,t7.n0===Math.round(t7.cap*.6)&&t7.n1===t7.n0-2&&t7.r1===1&&t7.nearGate&&t7.goal&&t7.n2===t7.n0&&t7.n3===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

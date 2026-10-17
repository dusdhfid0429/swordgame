// 임무창 (2026-10-13, v87): 맡은 임무의 상세(의뢰처·대상과 나오는 곳·재료 얻는 곳·진행·보상·보고 장소), 열기(J 키·메뉴·의뢰판 단추), 포기
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 빈 임무창: J 키로 열리고 맡는 곳 안내
  await p.keyboard.press('KeyJ');await p.waitForTimeout(150);
  const t0=await p.evaluate(()=>({panel,title:$('wtitle').textContent,body:$('wbody').textContent}));
  ok(`J 키 → 임무창 '${t0.title}', 빈 안내`,t0.panel==='quest'&&t0.title==='임무'&&t0.body.includes('맡은 임무가 없다')&&t0.body.includes('개봉 의뢰판'));
  await p.keyboard.press('Escape');
  // 2. 의뢰판 처치 임무 + 납품 임무 + 문파 임무를 맡고 상세 확인
  const t1=await p.evaluate(()=>{P.quests=[];P.quests.push({...QUESTS.find(q=>q.mob&&q.mob[0]==='혈교무인'),have:1});P.quests.push({...QUESTS.find(q=>q.kind==='give'&&q.mat==='가죽'),have:0});P.mats.가죽=2;
    P.sect='hwasan';const sq=sectMissions(SECTS.hwasan)[0];P.quests.push({...sq,have:0});openPanel('quest');return{body:$('wbody').textContent,cards:document.querySelectorAll('#wbody .card').length,bars:document.querySelectorAll('#wbody .mbar').length,drops:document.querySelectorAll('[data-act^="qdrop:"]').length,sq:sq.n}});
  ok(`임무 셋 카드 ${t1.cards-1}장, 진행 막대 ${t1.bars}, 포기 단추 ${t1.drops}`,t1.cards===4&&t1.bars===3&&t1.drops===3);
  ok('처치 임무: 대상과 나오는 곳(혈교 동굴), 진행 1/3, 보고 장소',t1.body.includes('혈교무인')&&t1.body.includes('혈교 동굴')&&t1.body.includes('1/3')&&t1.body.includes('개봉 관아 앞 의뢰판'));
  ok('납품 임무: 재료 얻는 곳과 가진 것',t1.body.includes('가죽')&&t1.body.includes('호랑이를 잡는다')&&t1.body.includes('가진 것 2')&&t1.body.includes('2/3'));
  ok(`문파 임무 [${t1.sq}]: 의뢰처 화산파, 공적 보상, 보고 장소`,t1.body.includes('화산파')&&t1.body.includes('화산파 공적 +')&&t1.body.includes('장문인')&&t1.body.includes('연락관'));
  // 3. 완료 표시와 포기
  const t2=await p.evaluate(()=>{P.quests[0].have=3;renderOpen();const done=$('wbody').textContent.includes('완료 · 보고하면 보상');act('qdrop:1');return{done,n:P.quests.length,body:$('wbody').textContent}});
  ok('완료 표시, 포기하면 목록에서 빠지고 창이 바로 갱신',t2.done&&t2.n===2&&!t2.body.includes('가죽 납품'));
  // 4. 메뉴·의뢰판·문파 창의 단추
  const t3=await p.evaluate(()=>{closePanels();openPanel('menu');const m=!!document.querySelector('[data-act="open:quest"]');closePanels();openNpc(npcAt('board'));const bd=!!document.querySelector('[data-act="open:quest"]');
    act('open:quest');const q=panel;closePanels();openNpc(npcAt('jeong'));sectView='hwasan';renderOpen();const sc=!!document.querySelector('[data-act="open:quest"]');return{m,bd,q,sc}});
  ok(`열기 단추: 메뉴 ${t3.m}, 의뢰판 ${t3.bd} (누르면 ${t3.q}), 문파 창 ${t3.sc}`,t3.m&&t3.bd&&t3.q==='quest'&&t3.sc);
  ok('오류 없음: '+errs.join(' | ').slice(0,200),errs.length===0);
  await b.close();
})();

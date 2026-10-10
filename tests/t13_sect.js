// 세력·문파: 정의맹 9파1방+소문파, 사천맹 4대문파+소문파, 마교. 가입하면 고급 무공, 임무 공적으로 일반 무공 비급.
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
  const cnt=await p.evaluate(()=>{const v=Object.values(SECTS);const f=(al,t)=>v.filter(s=>s.al===al&&(!t||s.tier===t)).length;return{jb:f('jeong','big'),js:f('jeong','small')+f('jeong','mid'),sb:f('sacheon','big'),ss:f('sacheon','small')+f('sacheon','mid'),m:f('magyo'),arts:Object.values(ARTS).filter(a=>a.sect).length,hi:Object.values(ARTS).filter(a=>a.hi).length}});
  ok(`세력 구도: 정의맹 ${cnt.jb}+${cnt.js}, 사천맹 ${cnt.sb}+${cnt.ss}, 마교 ${cnt.m} · 문파 무공 ${cnt.arts}(고급 ${cnt.hi})`,cnt.jb===10&&cnt.js>=10&&cnt.sb===4&&cnt.ss>=10&&cnt.m===1&&cnt.hi===52);
  // 정의맹 연락관
  await p.evaluate(()=>{const n=npcAt('jeong');P.x=n.x+.8;P.y=n.y+.2;P.path=null});await p.waitForTimeout(300);await p.tap('#t_ctx');await p.waitForTimeout(200);
  ok('정의맹 연락관 창에 9파1방과 소문파 목록',await p.evaluate(()=>panel==='npc'&&$('wbody').textContent.includes('9파1방')&&$('wbody').textContent.includes('화산파')&&$('wbody').textContent.includes('남궁세가')));
  await p.screenshot({path:shot('sect_list')});
  await p.locator('[data-act="sview:hwasan"]').tap();await p.waitForTimeout(150);
  await p.screenshot({path:shot('sect_hwasan')});
  ok('연락관 앞에서는 가입 대신 본산 가는 길을 알려 준다',await p.evaluate(()=>!document.querySelector('[data-act="sjoin:hwasan"]')&&!!document.querySelector('[data-act="goto:hq_hwasan"]')));
  await p.evaluate(()=>{P.silver=500;renderOpen()});await p.locator('[data-act="goto:hq_hwasan"]').tap();await p.waitForTimeout(2500);
  ok('역참 말로 화산 본산에 도착',await p.evaluate(()=>REG==='hq_hwasan'&&P.silver===480));
  await p.evaluate(()=>openNpc(hqNpc(REG)));await p.waitForTimeout(150);
  await p.screenshot({path:shot('sect_hwasan_hq')});
  await p.locator('[data-act="sjoin:hwasan"]').tap();await p.waitForTimeout(200);
  const j=await p.evaluate(()=>{const h=SECTS.hwasan.arts.find(a=>a.hi);return{sect:P.sect,learned:!!P.arts[h.id]&&P.arts[h.id].f[0],forms:ARTS[h.id].forms.length,n:h.n}});
  ok(`화산파 가입 → 고급 무공 [${j.n}] 첫 초식 (초식 ${j.forms}개)`,j.sect==='hwasan'&&j.learned&&j.forms===6);
  ok('다른 문파는 하산 전에 못 들어간다',await p.evaluate(()=>!!joinBlock(SECTS.mudang)));
  // 임무 → 공적 → 일반 무공 비급
  await p.locator('[data-act^="stake:hwasan:"]').first().tap();await p.waitForTimeout(100);
  const q=await p.evaluate(()=>{const q=P.quests.find(q=>q.sect==='hwasan');if(q.kind==='kill'){for(let i=0;i<q.cnt;i++){const e=mkMob(q.mob[0],P.x+3,P.y+3);mobs.push(e);e.hp=0;onKill(e)}}else P.mats[q.mat]=(P.mats[q.mat]||0)+q.cnt;return{n:q.n,merit:q.merit,done:q.kind==='kill'?q.have>=q.cnt:true}});
  await p.evaluate(()=>renderOpen());await p.waitForTimeout(100);
  await p.locator('[data-act^="qdone:"]').first().tap();await p.waitForTimeout(150);
  const m=await p.evaluate(()=>P.merit.hwasan);ok(`임무 ${q.n} 보고 → 공적 ${m}`,q.done&&m>=q.merit);
  const n0=await p.evaluate(()=>P.bag.length);
  await p.evaluate(()=>{P.merit.hwasan=200;renderOpen()});
  const nid=await p.evaluate(()=>SECTS.hwasan.arts.find(a=>!a.hi).id);
  await p.locator(`[data-act^="mbuy:${nid}:"]`).tap();await p.waitForTimeout(150);
  const bk=await p.evaluate(nid=>{const it=P.bag.find(i=>i.art===nid);if(!it)return null;P.vit+=500;readBook(it);return{n:it.name,learned:!!(P.arts[nid]&&P.arts[nid].f[0])}},nid);
  ok(`공적으로 일반 무공 비급을 받아 익힌다 (${bk&&bk.n})`,bk&&bk.learned);
  await p.screenshot({path:shot('sect_hwasan_member')});
  // 정파는 마교 밀사에게 거절당한다
  await p.evaluate(()=>openNpc(npcAt('magyo')));await p.waitForTimeout(150);
  ok('정파는 마교에 못 들어간다',await p.evaluate(()=>$('wbody').textContent.includes('열려 있지 않다')&&!document.querySelector('[data-act="sjoin:cheonma"]')));
  // 사파: 사천맹 대문파, 마교
  await p.evaluate(()=>{P.side='사';P.sect=null;P.fame=0;P.evil=0;P.age=25;sectView=null});
  ok('마교는 명성 100 또는 악업 80부터',await p.evaluate(()=>!!joinBlock(SECTS.cheonma)));
  await p.evaluate(()=>{P.fame=120;openNpc(npcAt('magyo'))});await p.waitForTimeout(100);await p.locator('[data-act="sview:cheonma"]').tap();await p.evaluate(()=>openNpc(hqNpc('hq_cheonma')));await p.waitForTimeout(100);await p.locator('[data-act="sjoin:cheonma"]').tap();await p.waitForTimeout(150);
  ok('사파 명성 120 → 천마신교 가입, 고급 무공',await p.evaluate(()=>P.sect==='cheonma'&&!!P.arts[SECTS.cheonma.arts.find(a=>a.hi).id]));
  await p.screenshot({path:shot('sect_magyo')});
  // 예전 저장 이전
  ok('예전 무당파 제자 저장은 무당파로 옮겨진다',await p.evaluate(()=>{P.sect='정';migrateSect();return P.sect==='mudang'}));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

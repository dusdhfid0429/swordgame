// v199 (설계 제안 2026-10-28): 8~20세 문파 수련기 — 마디 넷이 나이에 맞춰 열리고, 과제를 다 하면 문파 창에서 사부에게 보고
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1000,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('dialog',d=>d.accept());
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const tick=async(n=3)=>{for(let i=0;i<n;i++){await p.evaluate(()=>{sryT=0;runHooks('tick',.1)})}};
  // 1. 본산에서 가입하면 수련기 시작, 1마디가 바로 열린다
  await p.evaluate(()=>{P.age=9;P.fame=999;loadRegion('hq_hwasan');P.reg='hq_hwasan';openNpc(hqNpc('hq_hwasan'))});await p.waitForTimeout(200);
  await p.click('[data-act="sjoin:hwasan"]');await p.waitForTimeout(150);await tick();
  const r1=await p.evaluate(()=>({sry:!!P.sry,m:P.sry&&P.sry.m,open:P.sry&&P.sry.open,goals:srySt().goals.length}));
  ok(`가입 → 수련기 1마디 열림 (${JSON.stringify(r1)})`,r1.sry&&r1.m===0&&r1.open===1&&r1.goals===3);
  await p.evaluate(()=>{closePanels();openNpc(hqNpc('hq_hwasan'))});await p.waitForTimeout(150);
  const t1=await p.evaluate(()=>({card:$('wbody').textContent.includes('문파 수련기 1'),rep:!!document.querySelector('[data-act="sryrep"]:disabled')}));
  ok(`문파 창에 수련기 카드, 보고 단추는 아직 막힘`,t1.card&&t1.rep);
  // 과제: 외공 +2, 운기 10초, 공적 +15
  await p.evaluate(()=>{closePanels();P.st.str+=1;P.st.end+=1;recalc();P.medit=true;for(let i=0;i<110;i++)runHooks('tick',.1);P.medit=false;addMerit('hwasan',15)});
  const r2=await p.evaluate(()=>({done:sryAllDone(),track:(questTrack(),$('qtrack').textContent)}));
  ok(`1마디 과제 다 함, 임무 줄에 보고 안내 (${r2.track.slice(0,40)})`,r2.done&&r2.track.includes('사부에게 보고'));
  const r3=await p.evaluate(()=>{const v0=P.vit,mt=P.mats.금창약||0;act('sryrep');return{m:P.sry.m,open:P.sry.open,vit:P.vit>v0,mat:(P.mats.금창약||0)-mt}});
  ok(`보고 → 보상(활력·금창약 ${r3.mat}), 2마디는 11세까지 닫힘`,r3.m===1&&r3.open===0&&r3.vit&&r3.mat===2);
  await tick();ok('9세에는 2마디가 안 열림',await p.evaluate(()=>!P.sry.open));
  // 2. 첫 하산: 사형과 함께 산적 8명
  await p.evaluate(()=>{P.age=11});await tick();
  const r4=await p.evaluate(()=>{const o=P.sry.open;act('sryally');const a=allies.find(a=>a.sry);
    for(let i=0;i<8;i++){const e=mkMob('산적',P.x+3,P.y);e.hp=0;onKill(e)}return{o,ally:!!a,hp:a&&a.hp,done:sryAllDone()}});
  ok(`11세 2마디 열림, 사형 동행 (생명 ${r4.hp}), 산적 8 처치`,r4.o===1&&r4.ally&&r4.done);
  const r5=await p.evaluate(()=>{const s=P.mats.소환단||0;act('sryrep');return{m:P.sry.m,pill:(P.mats.소환단||0)-s,ally:allies.some(a=>a.sry)}});
  ok(`2마디 보고: 소환단 ${r5.pill}, 사형은 돌아감`,r5.m===2&&r5.pill===1&&!r5.ally);
  // 3. 동기 재회 대련
  await p.evaluate(()=>{P.age=14});await tick();
  const r6=await p.evaluate(()=>{const rv=P.sry.rival;act('sryduel');const e=mobs.find(m=>m.sryRival);return{rv,duel:G.duel&&!!G.sryDuel,e:!!e,name:e&&e.name}});
  ok(`14세 동기 대련 시작 (${r6.name})`,r6.rv&&r6.rv.n&&r6.duel&&r6.e);
  const r7=await p.evaluate(()=>{const e=mobs.find(m=>m.sryRival);const f=P.fame;damage(e,1e7,0,0,P);const out={duel:G.duel,c:P.sry.c.rival,win:P.sry.c.rivalWin};act('sryrep');out.m=P.sry.m;out.fame=P.fame-f;return out});
  ok(`대련 승리 → 3마디 보고, 명성 +${r7.fame}`,!r7.duel&&r7.c===1&&r7.win===1&&r7.m===3&&r7.fame===15);
  // 4. 첫 폐관 + 승급 시험
  await p.evaluate(()=>{P.age=17});await tick();
  const r8=await p.evaluate(()=>{const o=P.sry.open;const g0=sryAllDone();P.sry.c.pg=1;P.srank.hwasan=(P.srank.hwasan||0)+1;const d=sryAllDone();act('sryrep');return{o,g0,d,end:P.sry.end,on:sryOn()}});
  ok(`17세 4마디, 폐관·승급 뒤 보고 → 수련기 끝`,r8.o===1&&!r8.g0&&r8.d&&r8.end===1&&!r8.on);
  // 폐관 시도는 본산에서 pgFinish 한 번으로 센다
  const r9=await p.evaluate(()=>{P.sry={sid:'hwasan',m:3,open:0,c:{},base:{}};P.age=17;sryActivate();P.st.str+=12;P.st.end+=6;P.qiAcc=400;for(const k in P.arts)P.arts[k].p=60;recalc();const wall=atWall();const r0=Math.random;Math.random=()=>.999;try{pgFinish(false)}catch(e){}Math.random=r0;return{pg:P.sry.c.pg||0,own:inOwnSect(),wall}});
  ok(`본산 폐관 시도 하나 센다 (${r9.pg}, 본산 ${r9.own})`,r9.own&&r9.wall&&r9.pg===1);
  // 20세 넘어 들어오면 수련기는 없다
  const r10=await p.evaluate(()=>{P.sry=null;P.sect=null;P.age=22;sryStart('hwasan');return P.sry});
  ok('20세 넘어 가입하면 수련기 없음',r10===null);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

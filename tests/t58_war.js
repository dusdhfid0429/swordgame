// 천하대전 3·4단계 (2026-10-13): 26세 발발 → 해마다 결전(습격·임무) 세 차례 → 승자가 본산 점령·봉문 → 탈환·개문 임무. 중재 엔딩. 죽어도 세상은 결말을 맞는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 정사연합 대 마교 구도로 26세: 발발, 1차 결전 임무, 습격 무인, 전쟁 중 적·아군
  const t1=await p.evaluate(()=>{for(const e of STORY.EV)P.story.pick[e.id]=2;G.W.rel.정사=30;setPow('마',50);P.age=26;lastYear=25;update(.1);
    const q=P.quests.find(q=>q.war===1),raid=mobs.filter(m=>m.raid);
    return{war:G.war&&G.war.plan.n,round:G.war.round,q:q&&q.n,mob:q&&q.mob,raid:raid.length,raidFac:[...new Set(raid.map(m=>m.d.fac))],foeSa:facFoe('사','정'),foeMa:facFoe('마','정'),peace:raid.some(m=>peaceful(m)),me:mySide()}});
  ok(`26세 발발: ${t1.war}, 제${t1.round}차 임무 [${t1.q}] 대상 ${t1.mob}`,t1.war==='정파·사파 대 마교'&&t1.round===1&&t1.q==='제1차 결전: 적 세력 격파'&&t1.mob.join()==='마교도,마교 고수'&&t1.me===0);
  ok(`습격 ${t1.raid}명(${t1.raidFac}), 전쟁 중 사파는 아군(적 ${t1.foeSa}) 마교는 적(${t1.foeMa})`,t1.raid===5&&t1.raidFac.join()==='마'&&t1.foeSa===false&&t1.foeMa===true&&!t1.peace);
  // 2. 임무를 끝내 보고 → 공(+25). 해가 바뀌면 1차 승패, 2차 시작. 세 차례 뒤 끝
  const t2=await p.evaluate(()=>{const q=P.quests.find(q=>q.war===1);q.have=q.cnt;closePanels();openPanel('story');const btn=document.querySelector('[data-act^="qdone:"]');act(btn.dataset.act);const done=G.war.cur.done;
    setPow('정',80);setPow('사',60);setPow('마',30);P.age=27;lastYear=26;update(.1);const r1=G.war.rounds[0];const q2=P.quests.find(q=>q.war===2);
    P.age=28;lastYear=27;update(.1);const r2=G.war.rounds[1];P.age=29;lastYear=28;update(.1);
    return{done,r1:r1&&r1.win,r1me:r1&&r1.me,q2:!!q2,r2:r2&&r2.win,war:!!G.war,wars:G.wars.length,last:G.wars[0]}});
  const L=t2.last;
  ok(`보고 → 공 ${t2.done}, 1차 승 ${t2.r1}(${t2.r1me}), 2차 임무 ${t2.q2}, 2차 승 ${t2.r2}, 세 차례 뒤 끝 (전쟁 ${t2.war}, 기록 ${t2.wars})`,t2.done&&t2.r1===0&&t2.r1me==='공'&&t2.q2&&t2.r2===0&&!t2.war&&t2.wars===1);
  // 3. 승자의 힘: 정사연합 승 → 마교 본산 점령은 마교 대문파가 없으니 0곳, 봉문 0 (마교는 단일 문파 tier one). 힘·관계 변화
  const t3=await p.evaluate(()=>({won:G.wars[0].won,lost:G.wars[0].lost,me:G.wars[0].me,ma:G.W.pow.마,occ:Object.keys(G.occ),seal:Object.keys(G.seal),fame:P.fame,flag:P.story.flag.warDone||P.story.act===2,sides:G.wars[0].sides.length}));
  ok(`결과: ${t3.won} 승 / ${t3.lost} 패 · 당신 ${t3.me} · 마교 힘 ${t3.ma} · 명성 ${t3.fame}`,t3.won.join()==='정,사'&&t3.lost.join()==='마'&&t3.me==='승'&&t3.ma<30&&t3.fame>=50&&t3.flag&&t3.sides===2);
  // 4. 사마연합이 정파를 이기면: 정파 대문파 본산 2곳 점령 + 소문파 4곳 봉문(사파의 승리). 점령 본산엔 주둔군·점령군 대장, 가입 불가, 탈환 임무
  const t4=await p.evaluate(()=>{G.occ={};G.seal={};P.story.flag.warDone=false;delete P.story.act;G.W.rel.정사=-30;G.W.rel.사마=30;setPow('정',20);setPow('사',80);setPow('마',70);G.W.rel.정관=0;
    G.war=null;warStart();const n=G.war.plan.n;for(let i=0;i<3;i++){P.age=27+i;lastYear=26+i;update(.1)}
    const rec=G.wars[G.wars.length-1],occ=Object.keys(G.occ),seal=Object.keys(G.seal);
    return{n,won:rec.won,me:rec.me,occ,occTier:occ.map(id=>SECTS[id].tier+alFac(SECTS[id].al)),by:occ.map(id=>G.occ[id].by),seal,sealTier:seal.map(id=>SECTS[id].tier+alFac(SECTS[id].al))}});
  ok(`${t4.n}: ${t4.won} 승, 당신 ${t4.me} → 점령 ${t4.occ}(${t4.occTier}, by ${t4.by}) 봉문 ${t4.seal}(${t4.sealTier})`,t4.won.join()==='사,마'&&t4.me==='패'&&t4.occ.length===2&&t4.occTier.every(x=>x==='big정')&&t4.seal.length===4&&t4.sealTier.every(x=>x==='small정')&&t4.by.every(x=>x==='사'));
  const sid=t4.occ[0];const t5n=await p.evaluate(()=>Object.fromEntries(Object.values(SECTS).map(s=>[s.id,s.n])));const SECTS_N=id=>t5n[id];
  const t5=await p.evaluate(sid=>{const s=SECTS[sid];P.fame=200;P.evil=0;P.sect=null;const block=joinBlock(s);mobs=[];loadRegion('hq_'+sid);P.reg='hq_'+sid;spawnTick();spawnTick();
    const chief=mobs.find(m=>m.chief),kinds=[...new Set(mobs.filter(m=>m.d.fac).map(m=>m.d.fac))];openNpc(hqNpc('hq_'+sid));const html=$('wbody').innerHTML;const btn=document.querySelector('[data-act^="srecl:"]');if(btn)act(btn.dataset.act);const q=P.quests.find(q=>q.sq&&q.sq.t==='recl');
    return{block,chief:chief&&chief.name,kinds,html:html.includes('점령군 대장')&&html.includes('탈환'),q:q&&q.n,mob:q&&q.mob}},sid);
  ok(`점령 본산 ${sid}: 가입 "${t5.block}", 대장 ${t5.chief}, 무인 세력 ${t5.kinds}, 대화 ${t5.html}, 탈환 임무 [${t5.q}] ${t5.mob}`,/점령/.test(t5.block)&&/점령군 대장$/.test(t5.chief||'')&&t5.kinds.includes('사')&&!t5.kinds.includes('정')&&t5.html&&t5.q===SECTS_N(sid)+' 탈환'&&t5.mob.join()==='사파 무인,사파 고수');
  // 5. 탈환 보고 → 점령 해제, 제 문파 무인으로 돌아옴. 개문 임무도 같은 길
  const t6=await p.evaluate(sid=>{const q=P.quests.find(q=>q.sq&&q.sq.t==='recl');q.have=q.cnt;closePanels();openPanel('story');const btn=[...document.querySelectorAll('[data-act^="qdone:"]')].find(b=>P.quests[+b.dataset.act.split(':')[1]].sq);act(btn.dataset.act);
    const occ=!!G.occ[sid];mobs=[];spawnTick();spawnTick();const kinds=[...new Set(mobs.filter(m=>m.d.fac).map(m=>m.d.fac))];
    const sl=Object.keys(G.seal)[0];openNpc(hqNpc('hq_'+sl));const html=$('wbody').innerHTML;const b2=document.querySelector('[data-act^="sopen:"]');if(b2)act(b2.dataset.act);const q2=P.quests.find(q=>q.sq&&q.sq.t==='open');
    if(q2){q2.have=q2.cnt;closePanels();openPanel('story');const b3=[...document.querySelectorAll('[data-act^="qdone:"]')].find(b=>P.quests[+b.dataset.act.split(':')[1]].sq);act(b3.dataset.act)}
    return{occ,kinds,html:html.includes('봉문 중'),q2:!!q2,sealed:!!G.seal[sl],chief:mobs.some(m=>m.chief)}},sid);
  ok(`탈환 보고 → 점령 ${t6.occ}, 본산 무인 ${t6.kinds}, 대장 ${t6.chief} · 봉문 본산 대화 ${t6.html}, 개문 임무 ${t6.q2} → 봉문 ${t6.sealed}`,!t6.occ&&t6.kinds.includes('정')&&!t6.chief&&t6.html&&t6.q2&&!t6.sealed);
  // 6. 중재: 결전 전야에서 중재를 골랐으면 싸움 없이 끝난다
  const t7=await p.evaluate(()=>{P.story.flag={mediate:true};G.war=null;G.W=JSON.parse(JSON.stringify(STORY.INIT));popReset();warStart();return{war:!!G.war,last:G.wars[G.wars.length-1].n,rel:G.W.rel.정사,done:P.story.flag.warDone}});
  ok(`중재: 전쟁 ${t7.war}, 기록 ${t7.last}, 정사 관계 ${t7.rel}`,!t7.war&&t7.last==='중재'&&t7.rel===-5&&t7.done);
  // 7. 전쟁 중 죽으면 남은 차례를 치러 결말이 나고 강호사에 남는다
  const t8=await p.evaluate(()=>{P.story.flag={};G.W.rel.정사=30;setPow('마',50);G.war=null;warStart();const r=G.war.round;die('싸움');return{r,war:!!G.war,last:G.wars[G.wars.length-1],h:G.history[G.history.length-1].story}});
  ok(`전쟁 중 죽음: ${t8.r}차에 죽어도 결말 ${t8.last.n} (${t8.last.won}) · 강호사 ${t8.h.war} ${t8.h.me}`,t8.r===1&&!t8.war&&t8.last.won&&t8.h.war===t8.last.n);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

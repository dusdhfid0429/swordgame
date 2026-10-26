// 표국·상단 행렬 (v176, 사용자 2026-10-26): 표국 NPC·일할 자격, 호위 일감과 보고, 길을 가는 행렬, 습격과 구출·이어지는 일감, 약탈과 수배, 객잔 별미, 소문
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 1. 표국은 개봉과 모든 성읍에 하나씩, 국주가 걸을 수 있는 자리에 선다. 성도 표국은 문파가 운영한다
  const r1=await p.evaluate(()=>{const ids=Object.keys(PYO),bad=[];const reg0=REG;
    for(const id of ids){loadRegion(id);const n=npcsHere().find(q=>q.pyo===id);if(!n||!walkAt(n.x,n.y+.6))bad.push(id)}loadRegion(reg0);
    const cap=Object.values(PYO).filter(q=>REGIONS[q.id].city==='cap'),town=Object.values(PYO).filter(q=>REGIONS[q.id].city==='town');
    return{n:ids.length,bad,capSect:cap.filter(q=>q.sid).length,cap:cap.length,townSect:town.filter(q=>q.sid).length,gae:PYO.gaebong&&PYO.gaebong.n}});
  ok(`표국 ${r1.n}곳, 국주 자리 모두 걸을 수 있음 (${r1.bad.join(',')||'문제 없음'})`,r1.n>10&&!r1.bad.length);
  ok(`성도 표국은 문파 운영 (${r1.capSect}/${r1.cap}), 성읍 표국은 독립 (${r1.townSect}), 개봉은 ${r1.gae}`,r1.capSect>=r1.cap-2&&r1.townSect===0&&r1.gae==='진원표국');
  // 2. 일할 자격: 독립 표국은 낭인과 가장 낮은 직위만, 문파 표국은 그 문파 제자만(직위 무관)
  const r2=await p.evaluate(()=>{const ind=PYO.gaebong,sp=Object.values(PYO).find(q=>q.sid);const o={};
    P.sect=null;o.ronin=pyoWhy(ind);o.ronSect=pyoWhy(sp);P.sect='hwasan';P.srank={hwasan:0};o.r0=pyoWhy(ind);P.srank.hwasan=2;o.r2=pyoWhy(ind);
    P.sect=sp.sid;P.srank={[sp.sid]:3};o.member=pyoWhy(sp);P.sect=null;P.srank=undefined;P.pyo=-5;o.neg=pyoWhy(ind);P.pyo=0;return o});
  ok(`낭인은 독립 표국에서 일하고 문파 표국은 못 함`,r2.ronin===''&&!!r2.ronSect);
  ok(`속가제자는 독립 표국 가능, 일대제자는 안 됨 ("${r2.r2.slice(0,30)}")`,r2.r0===''&&/독립 표국/.test(r2.r2));
  ok(`문파 표국은 그 문파 제자면 높은 직위도 가능, 신용이 바닥이면 거절`,r2.member===''&&!!r2.neg);
  // 3. 개봉 표국에서 호위 일감을 맡고, 하남성 지도로 나가면 표행이 기다린다
  const r3=await p.evaluate(()=>{const n=NPCS.find(q=>q.pyo==='gaebong');openNpc(n);const h=$('wbody').innerHTML;const jobs=pyoJobs(PYO.gaebong).length;
    act('pyotake:gaebong:0');closePanels();const q=P.quests.find(q=>q.kind==='escort');P.silver=100;return{h:h.includes('진원표국')&&h.includes('pyotake'),jobs,q:q&&q.reg,gi:q&&q.gi}});
  ok(`표국 창에 일감 ${r3.jobs}개, 맡으면 하남성 호위 의뢰 (${r3.q})`,r3.h&&r3.jobs===2&&r3.q==='pv_henan');
  await p.evaluate(()=>{const g=REGIONS.gaebong.gates.find(g=>g.to==='pv_henan');travel(g)});await p.waitForTimeout(900);
  const r4=await p.evaluate(()=>{const cv=CVS[0];return{reg:REG,n:CVS.length,esc:!!(cv&&cv.q),mem:cv&&cv.mem.length,dest:cv&&cv.dest.label,waves:cv&&cv.waves.length}});
  ok(`하남성에 들어서면 표행 출발 (행렬 ${r4.n}, 인원 ${r4.mem}, ${r4.dest} 길목, 습격 ${r4.waves}번 예정)`,r4.reg.startsWith('pv_henan')&&r4.esc&&r4.mem>=3&&r4.waves===2);
  // 4. 표행은 길을 따라 걷는다. 멀어지면 멈춰 기다린다
  await p.evaluate(()=>{for(const m of mobs)if(!m.cv){m.hp=0}mobs=mobs.filter(m=>m.cv);const cv=CVS[0];cv.waves=[];P.inv=999});
  const c0=await p.evaluate(()=>({x:CVS[0].cart.x,y:CVS[0].cart.y}));
  await p.evaluate(()=>{const c=CVS[0].cart;P.x=c.x+.5;P.y=c.y+.5});await p.waitForTimeout(2500);
  const r5=await p.evaluate(c0=>{const cv=CVS[0],c=cv.cart;return{i:cv.i,mv:Math.hypot(c.x-c0.x,c.y-c0.y)}},c0);
  ok(`표행이 길을 따라 움직임 (${r5.mv.toFixed(2)}칸, 경로 ${r5.i})`,r5.mv>1&&r5.i>0);
  await p.screenshot({path:shot('t111_escort')});
  const r6=await p.evaluate(()=>{const cv=CVS[0];P.x=cv.cart.x+15;P.y=cv.cart.y;cvStep(cv,.1);return cv.stop});
  ok(`호위하는 사람이 멀어지면 표행이 멈춤`,r6===true);
  // 5. 길목에 닿으면 호위 완료, 표국에 보고하면 품삯과 신용
  const r7=await p.evaluate(()=>{const cv=CVS[0],c=cv.cart;c.x=cv.dest.x;c.y=cv.dest.y;P.x=c.x;P.y=c.y;cvStep(cv,.1);const q=P.quests.find(q=>q.kind==='escort');
    const done=questProg(q).done;loadRegion('gaebong');const s0=P.silver,i=P.quests.indexOf(q);openNpc(NPCS.find(q=>q.pyo==='gaebong'));act('qdone:'+i);closePanels();
    return{done,left:CVS.length,silver:P.silver-s0,pyo:P.pyo,gone:!P.quests.includes(q)}});
  ok(`길목에 닿아 호위 완료, 표국 보고로 은자 +${r7.silver} · 신용 ${r7.pyo}`,r7.done&&r7.left===0&&r7.silver>0&&r7.pyo===8&&r7.gone);
  // 6. 행렬이 습격당하고, 거들어 물리치면 사례금과 이어지는 일감
  await p.evaluate(()=>{enterRegion('pv_henan',24.5,24.5);mobs=[]});
  const r8=await p.evaluate(()=>{const cv=cvSpawn('sang');if(!cv)return{none:1};P.x=cv.cart.x+1;P.y=cv.cart.y;cvAmbush(cv,false);const n=cv.raid.length,tg=cv.raid.every(r=>r.tgt&&r.tgt.cv===cv);
    const s0=P.silver,f0=P.fame;for(const r of cv.raid.slice())damage(r,1e6,0,0,P);const rnd=Math.random;Math.random=()=>0;cvStep(cv,.1);Math.random=rnd;
    return{n,tg,help:cv.help,silver:P.silver-s0,fame:P.fame-f0,panel,lead:panelArg&&panelArg.cvlead,html:$('wbody').innerHTML.includes('cvacc')}});
  ok(`상단 습격: 도적 ${r8.n}명이 행렬을 노림`,!r8.none&&r8.n>=3&&r8.tg);
  ok(`거들어 물리치면 사례금 +${r8.silver}, 명성 +${r8.fame}, 우두머리가 일감을 청함`,r8.help>=3&&r8.silver>0&&r8.fame>0&&r8.panel==='npc'&&r8.lead&&r8.html);
  const r9=await p.evaluate(()=>{const n=P.quests.length;act('cvacc');const q=P.quests[P.quests.length-1];return{add:P.quests.length-n,q:q&&q.n,kind:q&&q.kind,live:q&&(q.cvLive||q.pyo==='any')}});
  ok(`일감 수락: [${r9.q}] (${r9.kind})`,r9.add===1&&r9.live);
  // 7. 약탈: 행렬을 치면 악업·수배, 관군이 덤비고, 수레를 부수면 약탈품
  const r10=await p.evaluate(()=>{for(const cv of CVS.slice())cvEnd(cv,true);mobs=[];const cv=cvSpawn('pyo');if(!cv)return{none:1};cv.amb=false;
    const peace=peaceful(cv.cart)&&!foes().includes(cv.cart);const e0=P.evil,w0=P.wanted||0;damage(cv.cart,1,0,0,P);
    const o={peace,robbed:!!cv.robbed,evil:P.evil-e0,wanted:(P.wanted||0)-w0,outlaw:outlaw(),angry:cv.mem.every(m=>m.angry),guardsAtk:cv.mem.filter(m=>m.cvRole==='guard').every(m=>m.aggro)};
    const d0=drops.length;damage(cv.cart,1e6,0,0,P);o.drops=drops.length-d0;o.rob=P.cvRob;o.left=CVS.length;o.news=(G.cvNews||[])[0]&&G.cvNews[0].k;return o});
  ok(`행렬은 평소 공격 대상이 아님, 치면 약탈 (악업 +${r10.evil}, 수배 +${r10.wanted}, 관군 적대 ${r10.outlaw})`,!r10.none&&r10.peace&&r10.robbed&&r10.evil>0&&r10.wanted===1&&r10.outlaw&&r10.angry&&r10.guardsAtk);
  ok(`수레를 부수면 약탈품 ${r10.drops}개, 소문 '${r10.news}'`,r10.drops>=1&&r10.rob===1&&r10.left===0&&r10.news==='rob');
  const r11=await p.evaluate(()=>{const t=cvRumor();P.wanted=1;newYear();return{t,w:P.wanted}});
  ok(`객잔 소문: "${r11.t}", 해가 바뀌면 수배 풀림`,typeof r11.t==='string'&&r11.t.length>8&&r11.w===0);
  // 8. 사파 제자가 털면 문파 공적, 표물 털기 임무가 찬다
  const r12=await p.evaluate(()=>{mobs=[];const sid=Object.keys(SECTS).find(k=>alFac(SECTS[k].al)==='사');P.sect=sid;P.srank=undefined;P.merit={};P.quests=[{n:'표물 털기',kind:'rob',cnt:1,have:0,silver:40,vit:30,fame:3,good:0,key:'t'}];
const cv=cvSpawn('sang');damage(cv.cart,1,0,0,P);damage(cv.cart,1e6,0,0,P);
    return{merit:P.merit[sid]||0,q:questProg(P.quests[0]).done}});
  ok(`사파 제자의 약탈: 공적 +${r12.merit}, 표물 털기 완료`,!r12.none&&r12.merit>0&&r12.q);
  // 9. 객잔 별미: 개봉 관탕포를 먹으면 최대 생명이 오르고, 시간이 지나면 가신다
  const r13=await p.evaluate(()=>{P.sect=null;loadRegion('gaebong');const n=NPCS.find(q=>q.id==='inn');openNpc(n);const h=$('wbody').innerHTML;P.silver=500;const m0=P.maxHp;act('meal');closePanels();
    const m1=P.maxHp;P.meal.left=.01;runHooks('tick',.05);return{h:h.includes('관탕포'),m0,m1,after:P.maxHp,meal:P.meal}});
  ok(`객잔에 이 고장 별미, 먹으면 최대 생명 ${r13.m0}→${r13.m1}, 끝나면 ${r13.after}`,r13.h&&r13.m1>r13.m0&&r13.after===r13.m0&&r13.meal===null);
  const r14=await p.evaluate(()=>{const o={};for(const k of Object.keys(PROV))if(!FOOD.list[k])o[k]=1;return Object.keys(o)});
  ok(`모든 성에 별미가 있음 (${r14.join(',')||'빠짐 없음'})`,!r14.length);
  // 10. 의뢰판의 표행 호위는 맡은 곳의 성으로 정해진다
  const r15=await p.evaluate(()=>{P.quests=[{...QUESTS.find(q=>q.kind==='escort'),have:0}];runHooks('tick',.05);const q=P.quests[0];return{reg:q.reg,dg:q.dg,txt:questWhere(q)}});
  ok(`의뢰판 호위: ${r15.reg}`,r15.reg==='pv_henan'&&r15.txt.includes('하남'));
  // 11. 성 지도에서 시간이 지나면 행렬이 저절로 지나간다
  const r16=await p.evaluate(()=>{P.quests=[];enterRegion('pv_henan',24.5,24.5);mobs=[];cvT=0;const rnd=Math.random;let n=0;for(let t=0;t<6&&!CVS.length;t++){cvT=0;runHooks('tick',.05)}n=CVS.length;return n});
  ok(`성 지도에 행렬이 저절로 나타남 (${r16})`,r16===1);
  await p.waitForTimeout(400);await p.screenshot({path:shot('t111_caravan')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

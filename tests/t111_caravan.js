// 표국·상단 행렬 (v176, 사용자 2026-10-26; v188 표행 모집 참여): 표국 NPC 창의 출발 예정 표행, 참여·출발·품삯, 놓친 표행, 옛 저장, 길을 가는 행렬, 습격과 구출·이어지는 일감, 약탈과 수배, 객잔 별미, 소문
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 1. 표국은 개봉과 모든 성읍에 하나씩, 국주가 걸을 수 있는 자리에 선다. v188: 문파가 운영하지 않는다
  const r1=await p.evaluate(()=>{const ids=Object.keys(PYO),bad=[];const reg0=REG;
    for(const id of ids){loadRegion(id);const n=npcsHere().find(q=>q.pyo===id);if(!n||!walkAt(n.x,n.y+.6))bad.push(id)}loadRegion(reg0);
    return{n:ids.length,bad,sect:Object.values(PYO).filter(q=>'sid'in q).length,gae:PYO.gaebong&&PYO.gaebong.n}});
  ok(`표국 ${r1.n}곳, 국주 자리 모두 걸을 수 있음 (${r1.bad.join(',')||'문제 없음'})`,r1.n>10&&!r1.bad.length);
  ok(`표국은 문파·세력과 상관없음 (문파 표국 ${r1.sect}), 개봉은 ${r1.gae}`,r1.sect===0&&r1.gae==='진원표국');
  // 2. 국주 창: 출발 예정 표행마다 남은 시간·목적지·표물·일행·성공 임금. 문파·직위와 상관없이 누구나 참여, 수배자만 거절
  const r2=await p.evaluate(()=>{const n=NPCS.find(q=>q.pyo==='gaebong');openNpc(n);const h=$('wbody').innerHTML,runs=pyoRuns(PYO.gaebong),r=runs[0];closePanels();const o={};
    o.h={left:h.includes('출발까지'),dst:h.includes('목적지')&&h.includes(PROV[r.dst].n),cargo:h.includes(cargoOf(r.cargo).d),pay:h.includes('성공하면')&&h.includes(String(r.silver)),join:h.includes('pyojoin:gaebong:0'),
      noRank:!/신용|견습 표사|총표두|제자만/.test(h)};
    o.runs=runs.length;o.ordered=runs[0].dep<runs[1].dep&&runs[0].dep>nowS();
    const ind=PYO.gaebong;P.sect=null;o.ronin=pyoWhy(ind,r);P.sect='hwasan';P.srank={hwasan:3};o.high=pyoWhy(ind,r);P.sect='own';o.own=pyoWhy(ind,r);P.sect=null;P.srank=undefined;
    P.wanted=1;o.wanted=pyoWhy(ind,r);P.wanted=0;return o});
  ok(`국주 창에 출발 예정 표행 ${r2.runs}개: 출발까지·목적지·표물·성공 임금·참여 단추 ${JSON.stringify(r2.h)}`,r2.runs===2&&r2.ordered&&Object.values(r2.h).every(Boolean));
  ok(`낭인·높은 직위·문주 모두 참여 가능, 수배자는 거절`,r2.ronin===''&&r2.high===''&&r2.own===''&&/수배/.test(r2.wanted));
  // 3. 참여하면 따라나선 표행 의뢰가 생기고, 하남성 지도로 나가면 표행이 모집 표사와 함께 떠난다
  const r3=await p.evaluate(()=>{const r=pyoRuns(PYO.gaebong)[0];act('pyojoin:gaebong:0');const q=P.quests.find(q=>q.hired);openNpc(NPCS.find(q=>q.pyo==='gaebong'));const h=$('wbody').innerHTML;closePanels();
    const n0=P.quests.length;act('pyojoin:gaebong:1');P.silver=100;return{reg:q&&q.reg,dst:q&&q.dst,me:r.me,h:h.includes('따라나서기로 했다'),twice:P.quests.length-n0,where:q&&questWhere(q),from:q&&questFrom(q).n}});
  ok(`참여: ${r3.reg} · ${r3.dst} 쪽 (${r3.from}), 두 표행은 못 따라감`,r3.reg==='pv_henan'&&r3.me===1&&r3.h&&r3.twice===0&&/출발까지/.test(r3.where));
  await p.evaluate(()=>{const g=REGIONS.gaebong.gates.find(g=>g.to==='pv_henan');travel(g)});await p.waitForTimeout(900);
  const r4=await p.evaluate(()=>{const cv=CVS[0];return{reg:REG,n:CVS.length,esc:!!(cv&&cv.q&&cv.q.hired),went:cv&&cv.q.went,hire:cv&&cv.mem.filter(m=>m.name==='모집 표사').length,hands:cv&&cv.q.hands,mem:cv&&cv.mem.length,dest:cv&&cv.dest.label,tw:cv&&cvToward(cvExits(),cv.q.dst).map(g=>g.label),waves:cv&&cv.waves.length}});
  ok(`하남성에 들어서면 표행 출발 (인원 ${r4.mem}, 모집 표사 ${r4.hire}/${r4.hands}, ${r4.dest} 길목, 습격 ${r4.waves}번 예정)`,r4.reg.startsWith('pv_henan')&&r4.esc&&r4.went&&r4.hire===r4.hands&&r4.mem>=3&&r4.waves===2);
  ok(`표행은 목적지 쪽 길목으로 간다 (${r4.dest} ∈ ${r4.tw.join('·')})`,!r4.tw.length||r4.tw.includes(r4.dest));
  // 4. 표행은 길을 따라 걷는다. 멀어지면 멈춰 기다린다
  await p.evaluate(()=>{for(const m of mobs)if(!m.cv){m.hp=0}mobs=mobs.filter(m=>m.cv);const cv=CVS[0];cv.waves=[];P.inv=999});
  const c0=await p.evaluate(()=>({x:CVS[0].cart.x,y:CVS[0].cart.y}));
  await p.evaluate(()=>{const c=CVS[0].cart;P.x=c.x+.5;P.y=c.y+.5});await p.waitForTimeout(2500);
  const r5=await p.evaluate(c0=>{const cv=CVS[0],c=cv.cart;return{i:cv.i,mv:Math.hypot(c.x-c0.x,c.y-c0.y)}},c0);
  ok(`표행이 길을 따라 움직임 (${r5.mv.toFixed(2)}칸, 경로 ${r5.i})`,r5.mv>1&&r5.i>0);
  await p.screenshot({path:shot('t111_escort')});
  const r6=await p.evaluate(()=>{const cv=CVS[0];P.x=cv.cart.x+15;P.y=cv.cart.y;cvStep(cv,.1);return cv.stop});
  ok(`호위하는 사람이 멀어지면 표행이 멈춤`,r6===true);
  // 5. 길목에 닿으면 표두가 그 자리에서 품삯을 준다 (표국에 돌아가 보고하지 않는다)
  const r7=await p.evaluate(()=>{const cv=CVS[0],c=cv.cart,q=cv.q,s0=P.silver,f0=P.fame;c.x=cv.dest.x;c.y=cv.dest.y;P.x=c.x;P.y=c.y;cvStep(cv,.1);
    return{left:CVS.length,silver:P.silver-s0,want:q.silver,fame:P.fame-f0,gone:!P.quests.includes(q),runGone:!G.pyoRuns.gaebong.some(r=>r.id===q.run),n:P.pyoN,pyo:P.pyo}});
  ok(`길목에 닿아 표행 완료: 그 자리에서 은자 +${r7.silver}, 명성 +${r7.fame}, 신용 같은 등급 없음`,r7.left===0&&r7.silver===r7.want&&r7.fame>0&&r7.gone&&r7.runGone&&r7.n===1&&r7.pyo===undefined);
  // 5-1. 출발 시각이 지나도 성문 밖에 오지 않으면 표행은 떠나고 의뢰가 사라진다
  const r7b=await p.evaluate(()=>{loadRegion('gaebong');const runs=pyoRuns(PYO.gaebong),i=runs.findIndex(r=>!r.me);act(`pyojoin:gaebong:${i}`);const q=P.quests.find(q=>q.hired);
    G.cal=(q.dep+CARV.recruit.grace+5)/YEAR_SEC;pyoChk=0;runHooks('tick',.05);const after=pyoRuns(PYO.gaebong);return{had:!!q,gone:!P.quests.includes(q),fresh:after.length===2&&after.every(r=>r.dep>nowS())}});
  ok(`출발 시각을 놓치면 표행이 떠나고 의뢰가 사라짐, 새 표행이 걸림`,r7b.had&&r7b.gone&&r7b.fresh);
  // 5-2. 옛 저장: 표국 신용·문파 표국 일감을 지우고 맡아 둔 호위는 따라나선 표행으로
  const r7c=await p.evaluate(()=>{P.pyo=40;G.pyoJobs={x:1};P.quests=[{n:'표행 호위 · 하남성 동쪽 길',kind:'escort',cnt:1,have:0,silver:50,vit:60,fame:6,good:4,reg:'pv_henan',pyo:'lm_henan_0',pyoN:'용문표국',pyoAt:'정주',pyoC:8,pyoSect:'shaolin',merit:6,key:'old'},
      {n:'산채 토벌',kind:'kill',mob:['산적'],cnt:6,have:0,pyo:'any',pyoN:'표국',pyoC:3,silver:70,key:'o2'}];
    saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));applySave(d);const q=P.quests[0],k=P.quests[1];
    return{pyo:P.pyo,jobs:G.pyoJobs,hired:q.hired,dep:q.dep>nowS(),sect:'pyoSect'in q||'merit'in q||'pyoC'in q,kc:'pyoC'in k,txt:questWhere(q)}});
  ok(`옛 저장 옮기기: 신용 ${r7c.pyo}, 맡은 호위 → 따라나선 표행 (${r7c.txt.replace(/<[^>]+>/g,'').slice(0,40)})`,r7c.pyo===undefined&&!r7c.jobs&&r7c.hired===1&&r7c.dep&&!r7c.sect&&!r7c.kc);
  await p.evaluate(()=>{P.quests=[]});
  // 5-3. 표물을 세력의 문파·맹에 보내면 받는 곳의 적 세력이 습격한다 (사용자 2026-10-27)
  const r7d=await p.evaluate(()=>{P.sect=null;P.side='정';loadRegion('gaebong');const L=pyoRuns(PYO.gaebong);L[0].to={n:'사천맹 총단',fac:'사',al:'sacheon'};
    openNpc(NPCS.find(q=>q.pyo==='gaebong'));const h=$('wbody').innerHTML;act('pyojoin:gaebong:0');closePanels();const q=P.quests.find(q=>q.hired);
    const g=REGIONS.gaebong.gates.find(g=>g.to==='pv_henan');travel(g);return{h:h.includes('사천맹 총단')&&h.includes('노리는 자'),to:q&&q.to&&q.to.n,foes:pyoFoes(q.to)}});
  await p.waitForTimeout(900);
  const r7e=await p.evaluate(()=>{const cv=CVS.find(c=>c.q&&c.q.hired);if(!cv)return{none:1};cvAmbush(cv,true);const facs=[...new Set(cv.raid.map(e=>e.d.fac))];const foes=cv.foes;
    for(const c of CVS.slice())cvEnd(c,true);mobs=[];P.quests=[];return{facs,foes}});
  ok(`사천맹에 가는 표물: 창에 받는 곳·노리는 자, 정파 플레이어면 ${r7d.foes.join('·')}이 습격 (습격자 ${r7e.facs})`,r7d.h&&r7d.to==='사천맹 총단'&&!r7d.foes.includes('정')&&!r7e.none&&r7e.facs.length===1&&r7e.foes.includes(r7e.facs[0]));
  const r7f=await p.evaluate(()=>{const s0=P.side;P.side='사';const a=pyoFoes({fac:'정'});P.side=s0;return{a,b:pyoFoes({fac:'사'})}});
  ok(`받는 곳 세력의 적만, 관군은 빼고 습격 (정파에 가면 ${r7f.a}, 사파에 가면 ${r7f.b})`,r7f.a.join()==='마'&&r7f.b.join()==='마'&&!r7d.foes.includes('관'));
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

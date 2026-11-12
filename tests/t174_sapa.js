// v258 사파 문파 고유 놀이 (동훈님 2026-11-12 "모두 적용"): 녹림채 통행세·수로채 물길·나루 봉쇄·하오문 추적/역추적·사마세가 하극상
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const run=f=>p.evaluate(f);
  // 1. 녹림채 통행세: 다가가면 묻고, 내면 통과(습격 막음), 맞서면 산채 전부 적, 다 쓰러뜨리면 뚫는다. 녹림채 제자는 그냥 지난다
  const r1=await run(()=>{const o={},rnd=Math.random;P.silver=500;enterRegion('pv_hubei@0,0',20,20);P.reg='pv_hubei@0,0';
    const mk=()=>{G.tollAt={};mobs=mobs.filter(m=>!m.toll);TOLL=null;Math.random=()=>.01;const t=tollMake();Math.random=rnd;return t};
    let t=mk();o.mem=t.mem.length;o.neutral=t.mem.every(e=>e.d.fac==='상'&&!mobFoeP(e));P.x=t.chief.x+3;P.y=t.chief.y;runHooks('tick',.016);o.ask=panel==='npc'&&panelArg&&panelArg.tollNpc;
    o.dlg=/길값 내기/.test(document.body.innerHTML);closePanels();const s0=P.silver;runHooks('sectAct',{a:'toll',x:'pay'});o.paid=TOLL.st;o.fee=s0-P.silver;
    const cv={tollOk:1};let amb=0;const ca=cvAmbush;o.amb=(cvAmbush(cv,0),true);
    t=mk();runHooks('sectAct',{a:'toll',x:'fight'});o.fight=TOLL.st;o.foe=TOLL.mem.every(e=>mobFoeP(e));for(const e of TOLL.mem)e.hp=0;const f0=P.fame;runHooks('tick',.016);o.beat=TOLL.st;o.fame=P.fame>f0;
    t=mk();P.sect='noklim';P.x=t.chief.x+3;P.y=t.chief.y;closePanels();runHooks('tick',.016);o.pass=TOLL.st;P.sect=null;
    t=mk();P.x=t.chief.x+3;P.y=t.chief.y;closePanels();runHooks('tick',.016);closePanels();P.x=t.chief.x+1;P.y=t.chief.y;runHooks('tick',.016);o.push=TOLL.st;
    P.sect='noklim';P.srank={noklim:2};P.mtot={noklim:9999};const sv=P.silver;newYear();o.share=P.silver-sv;o.camp=P.nkCamp;P.sect=null;P.srank=null;return o});
  ok(`통행세: 산채 ${r1.mem}명 중립 ${r1.neutral} · 물음 ${r1.ask} 창 ${r1.dlg} · 냄 ${r1.paid} 은자 ${r1.fee} · 맞섬 ${r1.fight} 적 ${r1.foe} → ${r1.beat} 명성 ${r1.fame} · 녹림 제자 ${r1.pass} · 밀고 들어감 ${r1.push} · 산채 녹봉 ${r1.share} (${r1.camp})`,
    r1.mem>=3&&r1.neutral&&r1.ask&&r1.dlg&&r1.paid==='paid'&&r1.fee>0&&r1.fight==='fight'&&r1.foe&&r1.beat==='beat'&&r1.fame&&r1.pass==='pass'&&r1.push==='fight'&&r1.share>0&&!!r1.camp);
  // 2. 물길: 물가에서 수로채 제자는 빠르고 세고 덜 맞는다, 남들은 느리다. 수로채 무인은 물가에서 세다. 나루 봉쇄는 장강 줄기 역참 삯을 올린다
  const r2=await run(()=>{const o={};enterRegion('hq_janggang',20,20);P.reg='hq_janggang';let w=null,d=null;for(let y=2;y<NH-2;y++)for(let x=2;x<N-2;x++)if(walk(x,y)){if(!w&&waterAt(x+.5,y+.5))w={x:x+.5,y:y+.5};if(!d&&!waterAt(x+.5,y+.5))d={x:x+.5,y:y+.5}}
    P.sect=null;P.x=d.x;P.y=d.y;o.dry=moveSpd();P.x=w.x;P.y=w.y;o.wet=moveSpd();P.sect='janggang';o.suro=moveSpd();
    const c={X:{},e:{},from:P,m:1};runHooks('hit',c);o.m=c.m;const h={src:{sect:'janggang',x:w.x,y:w.y},dm:100};runHooks('hurt',h);o.dm=h.dm;P.sect=null;const h2={src:{sect:'janggang',x:w.x,y:w.y},dm:100};runHooks('hurt',h2);o.dm2=h2.dm;
    G.naru={till:Math.floor(G.cal)+1};o.extra=naruExtra('hq_noklim');P.sect='janggang';o.ex2=naruExtra('hq_noklim');P.sect=null;o.post=postDlg().includes('나루');G.naru=null;o.ex3=naruExtra('hq_noklim');return o});
  ok(`물길: 마른 땅 ${r2.dry.toFixed(2)} 물가 ${r2.wet.toFixed(2)} 수로채 ${r2.suro.toFixed(2)} · 공격 ×${r2.m} · 수로채 무인에게 받는 피해 ${r2.dm}(수로채)/${r2.dm2}(남) · 나루 웃돈 ${r2.extra}/${r2.ex2}(수로채)/${r2.ex3}(열림) 역참 안내 ${r2.post}`,
    r2.wet<r2.dry&&r2.suro>r2.dry&&Math.abs(r2.m-1.2)<1e-9&&r2.dm<r2.dm2&&r2.dm2===120&&r2.extra>0&&r2.ex2===0&&r2.ex3===0&&r2.post);
  // 3. 하오문 사람 찾기: 객잔 세 곳의 단서 → 그 맵에 수배범 → 잡으면 공적·은자
  const r3=await run(()=>{const o={},go=id=>{enterRegion(id,5,5);P.reg=id};P.sect='haomun';P.srank={haomun:0};P.hao={};go(INNS[1]);
    const n=REGION().npcs.find(q=>q.intel==='haomun');openPanel('npc',n);o.offer=/사람 찾기/.test(document.body.innerHTML);closePanels();
    runHooks('sectAct',{a:'hao',x:'take'});const h=P.hao.hunt;o.c1=h&&h.clue;runHooks('sectAct',{a:'hao',x:'clue'});o.same=h.clue;go(INNS[2]);runHooks('sectAct',{a:'hao',x:'clue'});go(INNS[3]);runHooks('sectAct',{a:'hao',x:'clue'});o.c3=h.clue;
    o.card=remnCard().includes(h.n);go(h.reg);sched.splice(0).forEach(s=>s.f());const t=mobs.find(m=>m.haoT);o.t=t&&t.name;o.hostile=t&&!!t.d.hostile;const m0=P.merit.haomun||0,s0=P.silver;
    if(t){t.hp=1;damage(t,99999,0,0,P)}o.done=!P.hao.hunt;o.merit=(P.merit.haomun||0)-m0;o.silver=P.silver-s0;return o});
  ok(`사람 찾기: 제안 ${r3.offer} 단서 ${r3.c1}→같은 객잔 ${r3.same}→${r3.c3} 임무창 ${r3.card} · ${r3.t} 적 ${r3.hostile} · 잡음 ${r3.done} 공적 +${r3.merit} 은자 +${r3.silver}`,
    r3.offer&&r3.c1===1&&r3.same===1&&r3.c3===3&&r3.card&&/^수배범/.test(r3.t||'')&&r3.hostile&&r3.done&&r3.merit>0&&r3.silver>0);
  // 4. 역추적: 하오문과 사이가 나쁘면 객잔에서 행적이 팔리고, 바깥 맵에서 추격조(따라오는 hunt)가 붙는다. 우호·거짓 소문이면 안 팔린다
  const r4=await run(()=>{const o={},rnd=Math.random;P.sect=null;P.srank=null;P.rep=null;P.haoFalse=0;o.r0=haoRisk();repAdd('haomun',-30,-40);o.st=repStageOf(repSect('haomun'));o.r1=haoRisk();
    Math.random=()=>0;enterRegion(INNS[1],5,5);P.reg=INNS[1];o.sold=!!P.haoSold;enterRegion('pv_hubei@0,0',20,20);P.reg='pv_hubei@0,0';Math.random=rnd;sched.splice(0).forEach(s=>s.f());
    const L=mobs.filter(m=>m.haoChase);o.n=L.length;o.follow=L.every(m=>pursueMode(m)==='follow');o.foe=L.every(m=>mobFoeP(m));P.haoFalse=Math.floor(G.cal)+1;o.r2=haoRisk();P.haoFalse=0;P.rep=null;repAdd('haomun',0,80);o.r3=haoRisk();return o});
  ok(`역추적: 보통 ${r4.r0} · 경계(${r4.st}) ${r4.r1} 팔림 ${r4.sold} 추격조 ${r4.n} 따라옴 ${r4.follow} 적 ${r4.foe} · 거짓 소문 ${r4.r2} · 우호 ${r4.r3}`,r4.r0===0&&r4.st<=1&&r4.r1>0&&r4.sold&&r4.n>=3&&r4.follow&&r4.foe&&r4.r2===0&&r4.r3===0);
  // 5. 사마세가 하극상: 공적 절반이면 선배에게 도전 → 이기면 자리, 해마다 아래 서열이 도전 → 지면 한 직위 내려간다
  const r5=await run(()=>{const o={},rnd=Math.random;P.sect='sama';P.srank={sama:0};P.realm=4;P.mtot={sama:Math.round(RANK_PTS[1]*.5)};o.raw=rankRaw('sama');o.why=rtWhy('sama',false);
    P.mtot={sama:Math.round(RANK_PTS[1]*.4)};o.why2=rtWhy('sama',false);P.mtot={sama:Math.round(RANK_PTS[1]*.5)};panel='npc';panelArg={hq:'sama'};o.html=rtHtml(SECTS.sama).includes('선배에게 도전');
    rtStart('sama');const e=mobs.find(m=>m.rtExam);o.sama=!!(G.rtDuel&&G.rtDuel.sama);o.en=e&&e.name;duelEnd(true,e);o.rank=rankIdx('sama');o.grudge=(P.smFoe||[]).length;
    Math.random=()=>0;newYear();Math.random=rnd;o.flag=smChalOn;closePanels();smChallenge();const c=mobs.find(m=>m.smChal);o.cn=c&&c.name;duelEnd(true,c);o.keep=rankIdx('sama');
    smChallenge();duelEnd(false,mobs.find(m=>m.smChal));o.lost=rankIdx('sama');o.d=G.duel;P.sect='jongnam';o.other=rtWhy('jongnam',false)===''||true;return o});
  ok(`하극상: 공적 ${r5.raw}단계라도 도전 '${r5.why}' · 40%면 '${r5.why2.slice(0,20)}' · 창 ${r5.html} · ${r5.en} 이김 → ${r5.rank} 원한 ${r5.grudge} · 도전 ${r5.flag} ${r5.cn} 격퇴 ${r5.keep} · 패배 ${r5.lost}`,
    r5.raw===0&&r5.why===''&&r5.why2!==''&&r5.html&&r5.sama&&r5.rank===1&&r5.grudge===1&&r5.flag&&/사마세가/.test(r5.cn||'')&&r5.keep===1&&r5.lost===0&&!r5.d);
  // 6. 청부: 목격자를 남기고 떠나면 들켜 수배(우호도 하락·추격대), 호위까지 치우면 깨끗하게 끝. 들키기 전엔 우호도 그대로
  const r6=await run(()=>{const o={},go=(id,x=5,y=5)=>{enterRegion(id,x,y);P.reg=id};P.sect='haomun';P.srank={haomun:0};P.chb={};P.rep=null;go(INNS[1]);
    const n=REGION().npcs.find(q=>q.intel==='haomun');openPanel('npc',n);o.offer=/은밀한 청부/.test(document.body.innerHTML);closePanels();
    runHooks('sectAct',{a:'chb',x:'take'});const j=P.chb.job;o.foeSect=!!j&&facFoe(alFac(SECTS[j.sid].al),pfac());go(j.reg,20,20);sched.splice(0).forEach(s=>s.f());
    const t=mobs.find(m=>m.chbT);o.w=mobs.filter(m=>m.chbW).length;const r0=repSect(j.sid);t.hp=1;damage(t,99999,0,0,P);o.same=repSect(j.sid)===r0;o.card=remnCard().includes('은밀한 청부');
    go(INNS[2]);o.seen=chbHunted();o.drop=r0-repSect(j.sid);o.akin=akinWhy()==='';
    P.chb={};go(INNS[1]);runHooks('sectAct',{a:'chb',x:'take'});const j2=P.chb.job;go(j2.reg,20,20);sched.splice(0).forEach(s=>s.f());for(const m of mobs.filter(m=>m.chbW)){m.hp=1;damage(m,99999,0,0,P)}
    const s0=P.silver,h0=P.heuk||0;const t2=mobs.find(m=>m.chbT);t2.hp=1;damage(t2,99999,0,0,P);o.clean=!P.chb.job&&!chbHunted()&&P.silver>s0;o.heuk=(P.heuk||0)>h0;return o});
  ok(`청부: 제안 ${r6.offer} 적 세력 ${r6.foeSect} 호위 ${r6.w} · 쓰러뜨려도 우호도 그대로 ${r6.same} 카드 ${r6.card} · 목격자 남기고 떠남 → 수배 ${r6.seen} 우호도 -${r6.drop} 악인곡 열림 ${r6.akin} · 깨끗한 청부 ${r6.clean} 흑도 ${r6.heuk}`,
    r6.offer&&r6.foeSect&&r6.w===2&&r6.same&&r6.card&&r6.seen&&r6.drop>=15&&r6.akin&&r6.clean&&r6.heuk);
  // 7. 산공독: 만독문 정예에게 맞으면 내공 손실·운기 멈춤·내공 약 안 들음, 해독단으로 풀림, 환골탈태 면역. 내 만독 고급 무공은 적의 피해를 줄인다
  const r7=await run(()=>{const o={},rnd=Math.random;P.qi=P.maxQi;P.sgT=0;P.hgt=0;P.gang=0;const src={sect:'mandok',rank:3,d:{},name:'만독문 당주'};Math.random=()=>0;runHooks('hurt',{src,dm:10});Math.random=rnd;
    o.sg=P.sgT;o.lost=P.qi<P.maxQi;P.medit=true;o.reg=qiRegen();P.medit=false;P.mats.소환단=2;const q0=P.qi;useCon('소환단');o.pot=P.qi===q0&&P.mats.소환단===2;P.mats.해독단=1;useCon('해독단');o.cure=!P.sgT&&P.mats.해독단===0;P.medit=true;o.reg2=qiRegen();P.medit=false;
    const low={sect:'mandok',rank:0,d:{}};Math.random=()=>0;runHooks('hurt',{src:low,dm:10});o.low=!P.sgT;P.hgt=1;runHooks('hurt',{src,dm:10});Math.random=rnd;o.imm=!P.sgT;P.hgt=0;
    const e={x:P.x+1,y:P.y,hp:1e6,maxHp:1e6,d:{},skT:0};Math.random=()=>0;runHooks('hitDone',{e,from:P,X:{art:ARTS.S_mandok_1}});Math.random=rnd;const h={src:e,dm:100};runHooks('hurt',h);const h0={src:{...e,sgT:0},dm:100};runHooks('hurt',h0);o.cut=Math.round(h.dm/h0.dm*100)/100;
    const e2={x:0,y:0,hp:10,d:{},skT:0};Math.random=()=>0;runHooks('hitDone',{e:e2,from:P,X:{art:ARTS.S_mandok_0}});Math.random=rnd;o.basic=!e2.sgT;return o});
  ok(`산공독: ${r7.sg}초 내공 손실 ${r7.lost} 운기 ${r7.reg}→해독 뒤 ${r7.reg2.toFixed(1)} 약 막힘 ${r7.pot} 해독 ${r7.cure} · 졸개는 안 걸림 ${r7.low} · 환골탈태 면역 ${r7.imm} · 만독탈혼장 산공 적 피해 ${r7.cut} 기본 무공은 없음 ${r7.basic}`,
    r7.sg>5&&r7.lost&&r7.reg===0&&r7.reg2>0&&r7.pot&&r7.cure&&r7.low&&r7.imm&&r7.cut===.7&&r7.basic);
  // 8. 악인곡: 악명·수배여야 들어가고(입구는 길이 닿는다), 중립지대라 추격이 끊기고, 안에서 선업이 오르지 않는다. 낱장·치료·곡주 시험
  const r8=await run(()=>{const o={},go=(id,x,y)=>{enterRegion(id,x,y);P.reg=id};P.chb={};P.wanted=0;P.evil=0;P.good=0;P.heuk=0;o.closed=!!akinWhy();P.evil=100;o.open=akinWhy()==='';
    const H=SP_A.host;loadRegion(H);const g0=REGIONS[H].gates.find(q=>q.to==='cv_akin'),seen=new Set(),K=(x,y)=>x+','+y,q=[[Math.floor(g0.x),Math.floor(g0.y)+1]];
    while(q.length){const[x,y]=q.pop();if(seen.has(K(x,y)))continue;seen.add(K(x,y));for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(walk(x+dx,y+dy))q.push([x+dx,y+dy])}o.area=seen.size;
    o.neutral=!!REGIONS.cv_akin.neutral;go('cv_akin',20.5,37);o.npc=npcsHere().length;P.good+=10;runHooks('tick',.01);o.good=P.good;P.silver=2000;P.hp=1;runHooks('sectAct',{a:'akin',x:'heal'});o.heal=P.hp===P.maxHp;
    const b0=bagAll().filter(it=>it.slot==='leaf').reduce((a,it)=>a+it.n,0);runHooks('sectAct',{a:'akin',x:'leaf'});o.leaf=bagAll().filter(it=>it.slot==='leaf').reduce((a,it)=>a+it.n,0)-b0;
    runHooks('sectAct',{a:'akin',x:'test'});const e=mobs.find(m=>m.duel);o.test=!!e;const f0=P.fame;duelEnd(true,e);o.fame=P.fame>f0;o.d=G.duel;runHooks('sectAct',{a:'akin',x:'test'});o.once=!G.duel;return o});
  ok(`악인곡: 닫힘 ${r8.closed} 열림 ${r8.open} 입구 둘레 걸을 칸 ${r8.area} 중립 ${r8.neutral} 사람 ${r8.npc} 선업 ${r8.good} 치료 ${r8.heal} 낱장 +${r8.leaf} 시험 ${r8.test} 명성 ${r8.fame} 해마다 한 번 ${r8.once}`,
    r8.closed&&r8.open&&r8.area>200&&r8.neutral&&r8.npc===4&&r8.good===0&&r8.heal&&r8.leaf===1&&r8.test&&r8.fame&&!r8.d&&r8.once);
  // 9. 사천맹 이탈: 녹림채 우호가 높고 정파를 도왔으면 천하대전 때 녹림채가 사천맹을 떠난다(그 문파 무인은 나를 치지 않는다)
  const r9=await run(()=>{const o={};P.sect=null;P.srank=null;P.rep=null;o.none=!(warPlan().defect);repAdd('noklim',0,60);repAdd(null,30,0,'정');const p=warPlan();o.def=p.defect;o.note=p.notes.join('/');
    G.war={life:P.lifeNo,y:0,plan:p,round:0,rounds:[],won:null};const e=mkFac('사',0,P.x+3,P.y,'noklim');o.ally=e.warAlly===1&&!mobFoeP(e);G.war=null;return o});
  ok(`사천맹 이탈: 평소 ${r9.none} · ${JSON.stringify(r9.def)} '${r9.note}' 그 문파 무인 ${r9.ally}`,r9.none&&r9.def&&r9.def.sid==='noklim'&&/녹림채/.test(r9.note)&&r9.ally);
  // 10. 소맹주 다툼: 부맹주 → 후계 다툼 → 자객 두 번 → 맹주 앞 비무 → 소맹주(해마다 은자)
  const r10=await run(()=>{const o={},rnd=Math.random;P.maeng='sacheon';P.mpt={sacheon:99999};P.realm=8;P.smjE=null;P.smj=null;o.vice=smjVice();Math.random=()=>0;newYear();Math.random=rnd;o.st0=P.smjE&&P.smjE.st;
    const kill=()=>{for(const m of mobs.filter(m=>m.smjAss&&m.hp>0)){m.hp=1;damage(m,99999,0,0,P)}};
    for(let i=0;i<2;i++){P.smjE.t=-1e9;Math.random=()=>0;enterRegion('pv_hubei@0,0',20,20);P.reg='pv_hubei@0,0';Math.random=rnd;sched.splice(0).forEach(s=>s.f());o['a'+i]=mobs.filter(m=>m.smjAss).length;kill()}
    o.st=P.smjE.st;runHooks('sectAct',{a:'smj',x:'guard'});o.guard=P.smjE.guard;runHooks('sectAct',{a:'smj',x:'duel'});const d=mobs.find(m=>m.duel);o.dn=d&&d.name;duelEnd(true,d);o.smj=!!P.smj;const s0=P.silver;newYear();o.inc=P.silver-s0;return o});
  ok(`소맹주: 부맹주 ${r10.vice} → ${r10.st0} 자객 ${r10.a0}·${r10.a1} → ${r10.st} 호위 ${r10.guard} 비무 ${r10.dn} → 소맹주 ${r10.smj} 해마다 +${r10.inc}`,r10.vice&&r10.st0==='open'&&r10.a0>=1&&r10.a1>=1&&r10.st==='ready'&&r10.guard===1&&!!r10.dn&&r10.smj&&r10.inc>=400);
  // 11. 흑도 평판: 약탈·청부가 쌓이면 흑도(정파·관부 우호도↓), 손이 깨끗한 사파는 정파 우호도가 더 잘 오른다
  const r11=await run(()=>{const o={};P.heuk=0;P.rep=null;const b0=repFacBase('정');o.white=heukWhite();const f0=repD().fac['정']||0;repAdd(null,10,0,'정');o.wv=(repD().fac['정']||0)-f0;
    heukAdd('rob');heukAdd('rob');heukAdd('chb');o.tier=heukTier();o.pen=b0-repFacBase('정');o.html=repHtml().includes('흑도 평판');P.heuk=200;o.t2=heukTier();newYear();o.decay=P.heuk<200;P.heuk=0;return o});
  ok(`흑도: 백도 사파 ${r11.white} 정파 우호 +${r11.wv} · 흑도 단계 ${r11.tier} 정파 바탕 -${r11.pen} 인물창 ${r11.html} · 이름난 흑도 ${r11.t2} 옅어짐 ${r11.decay}`,r11.white&&r11.wv===15&&r11.tier===1&&r11.pen===15&&r11.html&&r11.t2===2&&r11.decay);
  // 12. 그림: 악인곡·산채 길목
  await p.evaluate(()=>{P.evil=100;enterRegion('cv_akin',20.5,30);P.reg='cv_akin';closePanels()});await p.waitForTimeout(900);await p.screenshot({path:require('path').resolve(__dirname,'shots/t174_akin.png')});
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}
  await b.close()})();

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
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}
  await b.close()})();

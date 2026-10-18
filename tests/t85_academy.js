// 무관(사관학교) 시작점 (2026-10-17): 정파 청운무관·사파 패천관에서 시작, 5단계 과제, 병기·하승 심법 고르기, 이류 졸업, 추천서, 월반, 맹에서 남은 심법
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url);await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');
  // 1. 생성 화면에 무기 고르기가 없고, 무관에서 시작한다
  const n0=await p.$$eval('[data-s^="cls:"]',x=>x.length),sk0=await p.$$eval('[data-s="skipacad"]',x=>x.length),t0=await p.evaluate(()=>$('scrbox').textContent);
  ok(`생성 화면: 무기 단추 ${n0}개, 첫 생엔 건너뛰기 없음 (${sk0}), 청운무관 안내`,n0===0&&sk0===0&&t0.includes('청운무관에 들다'));
  await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const r1=await p.evaluate(()=>({reg:REG,st:P.acad&&P.acad.stage,w:P.eq.weapon,books:P.bag.filter(i=>i.slot==='book').length,robe:!!P.bag.find(i=>i.acad),dummy:mobs.filter(m=>m.acadDummy).length,track:$('qtrack').textContent}));
  ok(`청운무관 1단계에서 시작 (무기 ${r1.w?'있음':'없음'}, 비급 ${r1.books}, 무관복, 목인장 ${r1.dummy}), 왼쪽에 과제`,r1.reg==='acad_jeong'&&r1.st===0&&!r1.w&&r1.books===0&&r1.robe&&r1.dummy===3&&r1.track.includes('1단계'));
  // v141 (사용자): 처음엔 심법·경공·보법이 없다. 경공·보법 단추를 눌러도 아무 일 없고, 내공 수련은 막힌다
  const r1b=await p.evaluate(()=>{const x0=P.x,q0=P.qiAcc;leap();const lp=!!P.leap;bobeop();startTrain('neigong');
    return{bob:P.bcur,gk:P.gkcur,sim:simCur().id,known:simKnown('N_base_정'),lp,step:!!P.leap,tr:!!trnBusy,mine:simMine().length}});
  ok(`처음: 보법 ${r1b.bob}, 경공 ${r1b.gk}, 심법 ${r1b.sim} (기초 심법 ${r1b.known}), 경공·보법 안 나감, 내공 수련 막힘`,r1b.bob===null&&r1b.gk===null&&r1b.sim==='N_none'&&!r1b.known&&!r1b.lp&&!r1b.step&&!r1b.tr&&r1b.mine===0);
  // 2. 1단계: 목인장은 쓰러지지 않고 숙련은 소성까지만, 과제를 마치면 보고해 2단계로
  const r2=await p.evaluate(()=>{const d=mobs.find(m=>m.acadDummy);P.x=d.x-1;P.y=d.y;const h0=P.acad.c.hit||0;for(let i=0;i<6;i++)hitE(mkX('base',1),d,1,0,0);P.arts.base.p=24.9;for(let i=0;i<40;i++)hitE(mkX('base',1),d,1,0,0);
    return{hits:(P.acad.c.hit||0)-h0,p:P.arts.base.p,alive:d.hp>0}});
  ok(`목인장 타격 ${r2.hits}회 셈, 쓰러지지 않음, 기초권각 숙련 ${r2.p.toFixed(1)} (소성 25 근처에서 멈춤)`,r2.hits>=15&&r2.alive&&r2.p<26);
  // v135: 과제는 하나씩. 지금 과제만 보이고, 세는 과제는 열린 뒤부터 센다. 표시는 장소·단추에
  const r2b=await p.evaluate(()=>{const o={g0:acadCur().k,mk:acadMarks().map(m=>m.l),tr:$('qtrack').textContent};
    for(const k of['장경각','병기고','숙소','식당'])P.acad.c['spot_'+k]=1;acadCheck();o.g1=acadCur().k;o.done=Object.keys(P.acad.done).length;return o});
  await p.waitForTimeout(350);
  const r2c=await p.evaluate(()=>({bag:!!document.querySelector('#b_p_bag.achl'),card:(openNpc(npcsHere().find(n=>n.id==='ac_i0')),$('wbody').textContent)}));
  await p.evaluate(()=>{closePanels();openPanel('bag')});await p.waitForTimeout(350);
  const r2d=await p.evaluate(()=>{const r=P.bag.find(i=>i.acad);const hl=!!document.querySelector(`[data-act="eq:${r.id}"].achl`);act('eq:'+r.id);closePanels();acadCheck();
    const o={hl,g:acadCur().k,have:goalProg(acadCur()).have,mk:acadMarks().map(m=>m.l)};for(let i=0;i<20;i++)P.acad.c.hit++;acadCheck();o.g2=acadCur().k;return o});
  ok(`하나씩: 첫 과제 ${r2b.g0}(표시 ${r2b.mk.join(',')}), 왼쪽엔 그 과제만 (${!r2b.tr.includes('무관복')}), 다음 ${r2b.g1}, 행낭 단추 표시 ${r2c.bag}, 교두 창에 뒤 과제 숨김 (${!r2c.card.includes('운기조식 해 보기')}), 무관복 줄 표시 ${r2d.hl}, 열리기 전 타격은 안 셈 (${r2d.have}), 목인장 표시, 다음 ${r2d.g2}`,
    r2b.g0==='goto'&&r2b.mk.length===1&&r2b.tr.includes('둘러보기')&&!r2b.tr.includes('무관복')&&r2b.g1==='equip'&&r2b.done===1&&r2c.bag&&r2c.card.includes('남은 과제')&&!r2c.card.includes('운기조식 해 보기')&&r2d.hl&&r2d.g==='hit'&&r2d.have===0&&r2d.mk[0]==='목인장'&&r2d.g2==='oe');
  // 운기 과제: 내공이 가득해도 운기 단추가 보이고, 3초 앉아 있으면 된다 (v136 사용자 버그)
  // v140 (사용자): 기본기 과제는 1만. 처음 받은 활력으로 한 번 수련하면 끝난다
  const ro=await p.evaluate(()=>{const o={k:acadCurK(),vit:P.vit};trainStat('str');acadCheck();o.next=acadCurK();return o});
  ok(`기본기 과제: 처음 활력 ${ro.vit}으로 한 번 수련하면 끝 (${ro.k} → ${ro.next})`,ro.k==='oe'&&ro.next!=='oe');
  await p.evaluate(()=>{P.vit=400;trainStat('end');trainStat('agi');acadCheck();P.qi=P.maxQi;setTouch(true)});await p.waitForTimeout(300);
  const rm=await p.evaluate(()=>({k:acadCurK(),btn:!$('t_med').hidden,hl:$('t_med').classList.contains('achl')}));
  await p.evaluate(()=>{setTouch(false);meditate()});await p.waitForTimeout(3600);
  const rm2=await p.evaluate(()=>({done:!!P.acad.done['0:4'],all:acadAllDone()}));
  ok(`운기 과제: 내공 가득해도 운기 단추 ${rm.btn}·표시 ${rm.hl}, 3초 앉으면 끝 (${rm2.done})`,rm.k==='medit'&&rm.btn&&rm.hl&&rm2.done&&rm2.all);
  await p.evaluate(()=>{P.medit=false;act('acrep')});
  const r3=await p.evaluate(()=>({st:P.acad.stage,early:(act('acrep'),P.acad.stage)}));
  ok(`1단계 보고 → 2단계 (과제 전 보고는 넘어가지 않음: ${r3.early})`,r3.st===1&&r3.early===1);
  // 3. 2단계: 병기고에서 고르고, 비급을 읽기 전에는 바꿀 수 있다. 대련은 비급을 읽은 뒤
  await p.evaluate(()=>{openNpc(npcsHere().find(n=>n.id==='ac_i1'))});await p.waitForTimeout(150);
  const t3=await p.evaluate(()=>$('wbody').textContent);
  await p.click('[data-act="acpick:도"]');
  const r4=await p.evaluate(()=>{const a={w:P.eq.weapon&&P.eq.weapon.cls,dur:P.eq.weapon&&P.eq.weapon.dur<P.eq.weapon.maxDur};act('acpick:검');const sparPre=(acadSpar('inst'),G.duel);
    const bk=P.bag.filter(i=>i.slot==='book');return{...a,w2:P.eq.weapon.cls,books:bk.map(i=>ARTS[i.art].cls),startCls:P.startCls,sparPre}});
  ok(`병기 교두 창에 여섯 계열 (${t3.includes('검법')&&t3.includes('궁')}), 도 → 검으로 바꿈, 비급 ${r4.books.join('')}, 연습 병기 내구 깎임 ${r4.dur}, 비급 전 대련 막힘`,t3.includes('창법')&&r4.w==='도'&&r4.w2==='검'&&r4.books.join('')==='검'&&r4.startCls==='검'&&r4.dur&&!r4.sparPre);
  const r5=await p.evaluate(()=>{P.vit=400;readBook(P.bag.find(i=>i.slot==='book'));const lockB=(act('acpick:창'),P.eq.weapon.cls);P.arts[acadArts()[0]].p=26;acadCheck();return{lockB}});
  // v141: 보법은 두 갈래 설명을 듣고 고른다
  await p.evaluate(()=>{openNpc(npcsHere().find(n=>n.id==='ac_i1'))});await p.waitForTimeout(150);
  const tb=await p.evaluate(()=>({t:$('wbody').textContent,k:acadCurK(),mk:acadMarks()[0]&&acadMarks()[0].l}));await p.waitForTimeout(300);
  const hlb=await p.evaluate(()=>!!document.querySelector('[data-act="acbob:b_hoe"].achl'));await p.click('[data-act="acbob:b_hoe"]');
  const rb=await p.evaluate(()=>{const o={cur:P.bcur,again:(act('acbob:b_basic'),P.bcur),k:acadCurK()};return o});
  ok(`보법 고르기: 설명(직선 ${tb.t.includes('직선')}·간파 ${tb.t.includes('간파')}), 표시 ${tb.mk}·${hlb}, 회선보 익힘, 다시 못 고름, 다음 ${rb.k}`,tb.k==='bobpick'&&tb.t.includes('곧게 미끄러진다')&&tb.t.includes('등 뒤')&&hlb&&rb.cur==='b_hoe'&&rb.again==='b_hoe'&&rb.k==='bob');
  Object.assign(r5,await p.evaluate(()=>{closePanels();P.acad.c.bob=(P.acad.c.bob||0)+3;acadCheck();acadSpar('inst');const duel=G.duel,e=mobs.find(m=>m.duel);damage(e,99999,0,0,P);return{duel}}));
  await p.waitForTimeout(400);
  const r5b=await p.evaluate(()=>({win:P.acad.c.spar_inst,duel:G.duel,done:acadAllDone()}));
  ok(`비급 읽은 뒤 병기 못 바꿈(${r5.lockB}), 대련 승리, 2단계 과제 완료`,r5.lockB==='검'&&r5.duel&&r5b.win===1&&!r5b.duel&&r5b.done);
  await p.evaluate(()=>act('acrep'));
  // 4. 3단계: 하승 심법 넷 중 하나, 특색(하승 세기 0.6), 암기와 비도 10
  await p.evaluate(()=>{openNpc(npcsHere().find(n=>n.id==='ac_i2'))});await p.waitForTimeout(150);
  const t4=await p.evaluate(()=>$('wbody').textContent);
  await p.click('[data-act="acsim:N_ac_jeong_0"]');
  const r6=await p.evaluate(()=>{const again=(act('acsim:N_ac_jeong_1'),P.sim);return{st:P.acad.stage,sim:P.sim,again,def:simTv('def'),g:SIM[P.sim].g,sc:pSchool(),el:pEl(),knife:P.mats.비도,sp:P.sp.암기,
    four:ACAD_SIM['정'].length===4&&ACAD_SIM['사'].length===4&&ACAD_SIM['사'].every(x=>SIM[x.id].sc==='사공'),trs:new Set(ACAD_SIM['정'].map(x=>x.tr[0])).size}});
  ok(`장경각 심법 넷 (${['금강호체공','태청토납법','청풍심법','소양진기'].every(n=>t4.includes(n))}), 금강호체공: 하승·불가·금, 금강 ${r6.def}%, 한 번 고르면 끝, 비도 ${r6.knife}`,r6.st===2&&r6.sim==='N_ac_jeong_0'&&r6.again==='N_ac_jeong_0'&&Math.abs(r6.def-3.6)<.01&&r6.g===0&&r6.sc==='불가'&&r6.el==='금'&&r6.knife===10&&r6.sp===1&&r6.four&&r6.trs===4);
  await p.evaluate(()=>{closePanels();P.qiAcc=45;recalc();acadCheck();act('actalk:el');acadCheck()});
  // v141: 경공은 1·2·3단 설명을 듣고 기초 경공을 익힌다
  await p.evaluate(()=>{openNpc(npcsHere().find(n=>n.id==='ac_i2'))});await p.waitForTimeout(150);
  const tg=await p.evaluate(()=>({t:$('wbody').textContent,k:acadCurK()}));await p.click('[data-act="acgk"]');
  const rg=await p.evaluate(()=>({gk:P.gkcur,k:acadCurK(),intro:tg=>0}));
  ok(`경공 배우기: 1단 도약·2단 공중 도약·3단 능공비행 설명, 심법 설명 (${tg.t.includes('내공 증가')}), 기초 경공 익힘 → ${rg.k}`,tg.k==='gklearn'&&['1단 도약','2단 공중 도약','3단 능공비행','하승은 1단'].every(s=>tg.t.includes(s))&&tg.t.includes('특색')&&rg.gk==='g_basic'&&rg.k==='leap');
  await p.evaluate(()=>{closePanels();P.acad.c.leap=(P.acad.c.leap||0)+3;acadCheck();P.mats.비도-=5});await p.waitForTimeout(500);
  const r7=await p.evaluate(()=>({thr:P.acad.c.throw,done:acadAllDone()}));
  ok(`비도 던진 수 ${r7.thr}, 3단계 과제 완료`,r7.thr===5&&r7.done);
  await p.evaluate(()=>act('acrep'));
  // 5. 4단계: 실습 의뢰(임무창에 의뢰처 청운무관), 수련곡, 산적두목, 대장간, 정세창
  const r8=await p.evaluate(()=>{act('acq:0');act('acq:2');openPanel('quest');const t=$('wbody').textContent;closePanels();P.quests[0].have=5;P.mats.약초=4;act('acqd:0');act('acqd:0');act('acq:1');P.quests[0].have=2;act('acqd:0');
    return{t,q:Object.keys(P.acad.c.qd).length,left:P.quests.length,herb:P.mats.약초}});
  ok(`실습 의뢰 셋 해결 (임무창에 단계 카드·의뢰처 청운무관, 약초 납품 ${r8.herb})`,r8.t.includes('4단계')&&r8.t.includes('청운무관')&&r8.q===3&&r8.left===0&&r8.herb===0);
  await p.evaluate(()=>travel({to:'acad_jeong_field',tx:20.5,ty:36.2}));await p.waitForFunction(()=>REG==='acad_jeong_field');await p.waitForTimeout(300);
  const r9=await p.evaluate(()=>{acadCheck();const kinds=[...new Set(mobs.map(m=>m.kind))],mk=acadMarks()[0];if(!mk||mk.l!=='산적두목')return{mk};const e=mkMob('산적두목',P.x+1,P.y);mobs.push(e);damage(e,99999,0,0,P);return{kinds,boss:P.acad.c.boss,gate:REGION().gates.map(g=>g.to)}});
  ok(`수련곡: ${r9.kinds.join('·')}, 산적두목 처치 ${r9.boss}`,r9.kinds.includes('산적')&&r9.kinds.includes('늑대')&&r9.boss===1&&r9.gate.includes('acad_jeong'));
  await p.evaluate(()=>travel({to:'acad_jeong',tx:20.5,ty:30}));await p.waitForFunction(()=>REG==='acad_jeong');await p.waitForTimeout(300);
  await p.evaluate(()=>{P.silver+=100;openNpc(npcsHere().find(n=>n.id==='smith'))});await p.waitForTimeout(150);await p.click('[data-act="repair"]');
  await p.evaluate(()=>{closePanels();acadCheck();openPanel('story');closePanels();acadCheck()});
  const r10=await p.evaluate(()=>({rep:P.acad.c.repair,done:acadAllDone(),st:(act('acrep'),P.acad.stage)}));
  ok(`대장간 수리 ${r10.rep}, 정세창, 4단계 보고 → 5단계`,r10.rep===1&&r10.done&&r10.st===4);
  // 6. 5단계: 세 기둥 → 벽 → 무관 폐관실(호법, 가벼운 주화입마) → 이류, 졸업 비무는 이류가 된 뒤
  const r11=await p.evaluate(()=>{const pre=(acadSpar('final'),G.duel);P.st.str+=3;P.st.end+=2;P.st.agi+=2;P.qiAcc=80;P.arts[acadArts()[0]].p=52;recalc();wallCheck();
    const o={pre,wall:atWall(),place:pgPlace(),hob:hobeop()};const r0=Math.random;Math.random=()=>.999;const st0={...P.st};qiDeviation(1);Math.random=r0;o.heavy=P.injS;o.stat=JSON.stringify(st0)===JSON.stringify(P.st);P.inj=0;P.injS=0;return o});
  ok(`5단계: 이류 전 졸업 비무 막힘, 벽 ${r11.wall}, 폐관 장소 ${r11.place}, 호법 ${r11.hob}, 무관 주화입마는 가벼움(injS ${r11.heavy}, 스탯 그대로 ${r11.stat})`,!r11.pre&&r11.wall&&r11.place==='청운무관 폐관실'&&r11.hob&&r11.heavy===1&&r11.stat);
  await p.evaluate(()=>{P.realm=1;recalc();acadCheck()});
  for(let i=0;i<3;i++){await p.evaluate(i=>{acadSpar('final');if(i<2)damage(mobs.find(m=>m.duel),99999,0,0,P);else duelEnd(false)},i);await p.waitForTimeout(250)}
  const r12=await p.evaluate(()=>({f:P.acad.c.final,w:P.acad.c.finalWin,done:acadAllDone(),grade:acadGradeOf().n}));
  ok(`졸업 비무 ${r12.f}판 ${r12.w}승, 성적 ${r12.grade}`,r12.f===3&&r12.w===2&&r12.done&&r12.grade==='수석');
  // 7. 졸업식 → 추천서 → 그 문파에 들면 공적을 얹어 받는다
  await p.evaluate(()=>{P.age=13.2;act('acgrad');openNpc(npcsHere().find(n=>n.id==='ac_master'))});await p.waitForTimeout(150);
  const t13=await p.evaluate(()=>$('wbody').textContent);
  const r13=await p.evaluate(()=>({grad:P.acad.grad,grade:P.acad.grade,n:G.acadN,tok:!!P.bag.find(i=>i.name.includes('졸업 증표')),track:$('qtrack').textContent,big:acadRecList().some(s=>s.tier==='big')}));
  ok(`${r13.grade} 졸업, 졸업 증표, 추천서 목록에 대문파 (${t13.includes('화산파')}), 졸업 횟수 ${r13.n}`,r13.grad===1&&r13.grade==='수석'&&r13.tok&&r13.big&&r13.n===1&&!r13.track.includes('단계'));
  await p.click('[data-act="acrec:hwasan"]');
  await p.evaluate(()=>{closePanels();P.age=19;P.fame=0;loadRegion('hq_hwasan');openNpc(hqNpc('hq_hwasan'))});await p.waitForTimeout(200);
  await p.click('[data-act="sjoin:hwasan"]');await p.waitForTimeout(200);
  const r14=await p.evaluate(()=>({sect:P.sect,merit:P.merit.hwasan,rec:P.acad.rec,used:P.acad.recUsed}));
  ok(`화산파 추천서: 19세 명성 0인데 받아 줌, 공적 ${r14.merit}`,r14.sect==='hwasan'&&r14.merit>=60&&r14.used===1);
  // 8. 맹 총관: 고르지 않은 무관 심법을 맹 공적으로 (직위 점수는 그대로)
  const r15=await p.evaluate(()=>{P.mpt={jeong:100};const n=Object.values(REGIONS).flatMap(R=>R.npcs||[]).find(n=>n.maeng==='jeong'&&n.role==='steward');openNpc(n);const t=$('wbody').textContent;
    act('acbuy:N_ac_jeong_2');return{t:t.includes('무관 하승 심법')&&t.includes('청풍심법')&&!t.includes('금강호체공'),known:simKnown('N_ac_jeong_2'),mpt:P.mpt.jeong,free:acadMptFree('jeong')}});
  ok(`맹 총관에서 청풍심법 배움 (목록 ${r15.t}), 맹 공적 ${r15.mpt} 그대로·쓸 수 있는 공적 ${r15.free}`,r15.t&&r15.known&&r15.mpt===100&&r15.free===60);
  // 9. 윤회: 전생에 졸업했으면 월반 시험. 붙으면 4단계부터, 병기·심법은 그래도 고른다
  await p.evaluate(()=>{closePanels();die('시험')});await p.waitForSelector('[data-s="rebirth"]',{timeout:8000});await p.click('[data-s="rebirth"]');
  await p.evaluate(()=>{const b=document.querySelector('[data-s="noheir"]');if(b)b.click()});await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing&&P.acad);await p.waitForTimeout(300);
  await p.evaluate(()=>{openNpc(npcsHere().find(n=>n.id==='ac_master'))});await p.waitForTimeout(150);
  const t16=await p.evaluate(()=>$('wbody').textContent);
  await p.click('[data-act="acspar:skip"]');await p.waitForTimeout(150);
  await p.evaluate(()=>{const e=mobs.find(m=>m.duel);damage(e,99999,0,0,P)});await p.waitForTimeout(400);
  const r16=await p.evaluate(()=>({st:P.acad.stage,skip:P.acad.skip,goals:acadGoals().map(g=>g.k),knife:P.mats.비도,again:(acadSpar('skip'),G.duel)}));
  ok(`월반 시험 안내 (${t16.includes('월반 시험')}), 붙으면 4단계, 과제에 병기·심법 고르기 (${r16.goals.join(',')}), 비도 ${r16.knife}, 다시 못 봄`,t16.includes('월반 시험')&&r16.st===3&&r16.skip===1&&r16.goals[0]==='pick'&&r16.goals[1]==='sim'&&r16.knife===10&&!r16.again);
  const r17=await p.evaluate(()=>{const b0=P.bcur,g0=P.gkcur;act('acpick:창');act('acsim:N_ac_jeong_1');act('acbob:b_basic');act('acgk');acadCheck();return{w:P.eq.weapon&&P.eq.weapon.cls,sim:P.sim,b0,g0,b:P.bcur,g:P.gkcur,k:acadCurK()}});
  ok(`월반 뒤 병기(${r17.w})·심법(${r17.sim})·보법(${r17.b})·경공(${r17.g}) 고름, 다음 ${r17.k}`,r17.w==='창'&&r17.sim==='N_ac_jeong_1'&&r17.b0===null&&r17.g0===null&&r17.b==='b_basic'&&r17.g==='g_basic'&&r17.k==='quest');
  // 10. 사파는 패천관, 사공 심법 넷. 이어 하기는 무관에서. 옛 저장(v3)은 무관 없이(P.acad=null)
  const r18=await p.evaluate(()=>{saveGame(true);const sv=loadGame();const reg0=REG;loadRegion('gaebong');P.reg='gaebong';applySave(loadGame());startPlay(false);
    const m=migrateSave({v:3,P:{name:'옛사람'},G:{}});return{reg:REG,reg0,acad:sv.P.acad.stage,mig:m.P.acad,v:m.v,sa:ACAD['사'].n,saReg:!!REGIONS['acad_sacheon']&&!!REGIONS['acad_sacheon_field']}});
  ok(`이어 하기 → ${r18.reg}, 저장에 단계 ${r18.acad}, v3 저장 → v${r18.v} acad=${r18.mig}, 사파 ${r18.sa}`,r18.reg==='acad_jeong'&&r18.acad===3&&r18.mig===null&&r18.v===4&&r18.sa==='패천관'&&r18.saReg);
  // 10b. v138 윤회 때 무관 건너뛰기: 병기·하승 심법 고르는 창 → 개봉에서 바로 시작
  await p.evaluate(()=>{closePanels();die('건너뛰기')});await p.waitForSelector('[data-s="rebirth"]',{timeout:8000});await p.click('[data-s="rebirth"]');
  await p.evaluate(()=>{const b=document.querySelector('[data-s="noheir"]');if(b)b.click()});await p.click('[data-s="side:사"]');
  await p.click('[data-s="skipacad"]');
  const s20=await p.evaluate(()=>({cls:document.querySelectorAll('[data-s^="cls:"]').length,sim:[...document.querySelectorAll('[data-s^="ssim:"]')].map(e=>e.dataset.s.slice(5)),t:$('scrbox').textContent}));
  await p.click('[data-s="skipback"]');const back=await p.$$eval('[data-s="skipacad"]',x=>x.length);
  await p.click('[data-s="skipacad"]');await p.click('[data-s="cls:봉"]');await p.click(`[data-s="ssim:${s20.sim[2]}"]`);await p.click('[data-s="sbob:b_hoe"]');
  const pr=await p.evaluate(()=>document.querySelector('[data-s="cls:봉"]').getAttribute('aria-pressed'));
  await p.click('[data-s="skipstart"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const r20=await p.evaluate(()=>({reg:REG,acad:P.acad,skip:P.acadSkip,w:P.eq.weapon&&P.eq.weapon.cls,sim:P.sim,on:acadOn(),past:acadPast(),track:$('qtrack').textContent,bob:P.bcur,gk:P.gkcur,base:simKnown('N_base_사')}));
  const r21=await p.evaluate(()=>{P.mpt={sacheon:100};P.maeng='sacheon';const n=Object.values(REGIONS).flatMap(R=>R.npcs||[]).find(n=>n.maeng==='sacheon'&&n.role==='steward');if(!n)return{none:1};openNpc(n);
    const o=ACAD_SIM['사'].find(x=>!simKnown(x.id));act('acbuy:'+o.id);return{known:simKnown(o.id)}});
  ok(`건너뛰기 창: 병기 ${s20.cls}개·사파 심법 ${s20.sim.length}개, 돌아가기 (${back}), 봉 선택 ${pr} → ${r20.reg}에서 ${r20.w}·${r20.sim} 들고 시작, 무관 없음, 맹 총관 심법 (${JSON.stringify(r21)})`,
    s20.cls===6&&s20.sim.length===4&&s20.sim.every(id=>id.startsWith('N_ac_sa'))&&back===1&&pr==='true'&&r20.reg==='gaebong'&&r20.acad===null&&r20.skip===1&&r20.w==='봉'&&r20.sim===s20.sim[2]&&!r20.on&&r20.past&&r21.known&&r20.bob==='b_hoe'&&r20.gk==='g_basic'&&!r20.base);
  // 11. ?noacad: 옛 방식 (생성 화면 무기, 개봉 시작)
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');
  const n19=await p.$$eval('[data-s^="cls:"]',x=>x.length);await p.click('[data-s="cls:도"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const r19=await p.evaluate(()=>({reg:REG,acad:P.acad,w:P.eq.weapon&&P.eq.weapon.cls,on:acadOn()}));
  ok(`?noacad: 무기 단추 ${n19}개, ${r19.reg}에서 ${r19.w} 들고 시작, 무관 없음`,n19===6&&r19.reg==='gaebong'&&r19.w==='도'&&r19.acad===null&&!r19.on);
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

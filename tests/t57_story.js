// 천하대전 스토리 1단계 (2026-10-13): 8세 시작, 20세부터 반년마다 사건 10개, 26세 천하대전. 세상 상태(G.W·봉문)는 생을 넘어 남고 '처음부터 새로'만 지운다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 8세 시작, 데이터, 초기 세상 상태
  const t0=await p.evaluate(()=>({age:P.age,n:STORY.EV.length,ages:STORY.EV.map(e=>e.age),war:STORY.T.war,w:G.W,init:STORY.INIT,st:P.story,plan:warPlan().n}));
  ok(`8세 시작 (${t0.age.toFixed(2)}), 사건 ${t0.n}개 ${t0.ages[0]}~${t0.ages[9]}세, 대전 ${t0.war}세`,Math.floor(t0.age)===8&&t0.n===10&&t0.ages[0]===20&&t0.ages[9]===25.5&&t0.war===26);
  ok(`초기 세상 상태 ${JSON.stringify(t0.w.pow)}, 예상 구도 ${t0.plan}`,JSON.stringify(t0.w)===JSON.stringify(t0.init)&&t0.plan==='삼파전'&&t0.st&&t0.st.open===null);
  // 2. 정세 창 N, 성장 구간엔 사건이 열리지 않는다
  await p.keyboard.press('KeyN');await p.waitForTimeout(150);
  const t1=await p.evaluate(()=>{const r={panel,title:$('wtitle').textContent,body:$('wbody').textContent};closePanels();for(let i=0;i<40;i++)update(1);r.open=P.story.open;r.age=P.age;return r});
  ok(`N 키 → '${t1.title}', 성장 구간(${t1.age.toFixed(1)}세) 사건 없음`,t1.panel==='story'&&t1.title==='강호 정세'&&t1.body.includes('삼파전')&&t1.open===null);
  // 3. 20세가 되면 첫 사건이 열린다. 정파에겐 정파의 길과 중립 선택만 보인다 (v114)
  // v149 (사용자): 사건이 터지면 창을 띄우지 않고 화면에 크게 알린다(터치 통과). 왼쪽 임무 줄 맨 위에 남은 시간, 누르면 정세창
  const t2a=await p.evaluate(()=>{closePanels();P.age=20;lastYear=19;update(.1);questTrack();const b=$('sban'),row=document.querySelector('#qtrack [data-story]');
    return{panel,ban:b.classList.contains('on')&&b.textContent.includes('혈교의 그림자'),pe:getComputedStyle(b).pointerEvents,row:row&&row.textContent,first:$('qtrack').querySelector('div')===row}});
  ok(`20세: 창 안 뜸 (${t2a.panel}), 화면 연출 ${t2a.ban} (터치 ${t2a.pe}), 임무 줄 맨 위 "${t2a.row}"`,t2a.panel===null&&t2a.ban&&t2a.pe==='none'&&/흘러가기까지 \d+분 \d+초/.test(t2a.row||'')&&t2a.first);
  await p.click('#qtrack [data-story]');await p.waitForTimeout(150);
  const t2=await p.evaluate(()=>({open:P.story.open,panel,btns:[...document.querySelectorAll('[data-act^="spick:"]')].map(b=>b.disabled),log:$('log').textContent}));
  ok(`정세 줄 누르면 정세창 (${t2.panel}): ${t2.open} 열림, 선택 잠김 ${JSON.stringify(t2.btns)}`,t2.open==='ev1'&&t2.panel==='story'&&t2.btns.length===2&&t2.btns[0]===false&&t2.btns[1]===false&&t2.log.includes('혈교의 그림자'));
  // 4. 임무 선택: 임무가 들어오고, 적을 잡아 정세 창에서 보고하면 끝맺음 효과
  const t3=await p.evaluate(()=>{act('spick:ev1:0');const q=P.quests.find(q=>q.story==='ev1');const pw=G.W.pow.정;q.have=q.cnt;closePanels();openPanel('story');const btn=document.querySelector('[data-act^="qdone:"]');const good=P.good;act(btn.dataset.act);
    return{pick:P.story.pick.ev1,q:!!q,open:P.story.open,btn:!!btn&&!btn.disabled,done:P.story.done.ev1,pw0:pw,pw1:G.W.pow.정,good:P.good-good,left:P.quests.some(q=>q.story==='ev1')}});
  ok(`토벌 선택 → 임무, 보고 → 정파 힘 ${t3.pw0}→${t3.pw1}, 선업 +${t3.good}`,t3.pick===0&&t3.q&&t3.open===null&&t3.btn&&t3.done===true&&t3.pw1===t3.pw0+3&&t3.good===6+4&&!t3.left);
  // 5. 미루면 다음 사건이 올 때 기본 선택으로 흘러간다. 즉시 효과 선택(세력 관계)도 적용
  const t4=await p.evaluate(()=>{closePanels();P.age=20.5;update(.1);const o1=P.story.open;const r0=G.W.rel.사마;P.age=21;update(.1);return{o1,pick2:P.story.pick.ev2,o2:P.story.open,r1:G.W.rel.사마-r0}});
  ok(`ev2 열림(${t4.o1}) → 미루면 기본 선택(${t4.pick2}, 사마 ${t4.r1}) 뒤 ev3 열림(${t4.o2})`,t4.o1==='ev2'&&t4.pick2===4&&t4.r1===-10&&t4.o2==='ev3');
  // 6. 봉문: 사건 4 기본 선택이 정파 대문파 하나를 닫고, 가입이 막힌다
  const t5=await p.evaluate(()=>{closePanels();for(const id of['ev3','ev4'])if(P.story.open!==id){P.age=STORY.EV.find(e=>e.id===id).age;update(.1)}act('spick:ev4:4');const id=Object.keys(G.seal)[0];const s=SECTS[id];P.age=21.6;P.fame=200;return{id,tier:s&&s.tier,fac:s&&alFac(s.al),block:joinBlock(s),ok3:P.story.pick.ev3}});
  ok(`봉문: ${t5.id} (${t5.tier}·${t5.fac}) → 가입 거절 "${t5.block}"`,t5.tier==='big'&&t5.fac==='정'&&/봉문/.test(t5.block));
  // 7. 구도 규칙: 정사 +20 & 마교 45 → 정사연합, 관군 합류, 마교 탈락
  const t6=await p.evaluate(()=>{G.W.rel.정사=25;setPow('마',50);const a=warPlan();G.W.rel.정관=40;const b=warPlan();setPow('마',10);const c=warPlan();G.W.rel.정사=-30;G.W.rel.사마=30;setPow('마',50);const d=warPlan();G.W=JSON.parse(JSON.stringify(STORY.INIT));popReset();return{a:a.n,b:b.n,bs:JSON.stringify(b.sides),c:c.n,d:d.n}});
  ok(`구도: ${t6.a} / ${t6.b} ${t6.bs} / ${t6.c} / ${t6.d}`,t6.a==='정파·사파 대 마교'&&t6.bs==='[["정","사","관"],["마"]]'&&t6.c==='정파·관군 대 사파'&&t6.d==='사파·마교 대 정파·관군');
  // 8. 26세 천하대전 발발 (마지막 사건을 미뤄도 터진다)
  const t7=await p.evaluate(()=>{for(const e of STORY.EV)if(P.story.pick[e.id]==null&&e.id!=='ev10')P.story.pick[e.id]=2;P.age=25.6;update(.1);const o=P.story.open;P.age=26.01;update(.1);return{o,war:G.war&&G.war.plan.n,pick:P.story.pick.ev10,log:$('log').textContent.includes('천하대전이 터졌다')}});
  ok(`결전 전야 열림(${t7.o}) → 26세 천하대전 ${t7.war}`,t7.o==='ev10'&&!!t7.war&&t7.pick===5&&t7.log);
  // 9. 죽으면 선택이 강호사에 남고, 다음 생도 세상 상태(봉문·힘)를 잇는다. 사건 창에 전생의 흔적
  const t8=await p.evaluate(()=>{warEnd(true);setPow('마',77);const seal=Object.keys(G.seal)[0];die('싸움');return{seal,hist:G.history[G.history.length-1].story,wars:G.wars.length}});
  await p.waitForTimeout(1200);await p.click('[data-s="rebirth"]');await p.waitForTimeout(200);await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const t9=await p.evaluate(()=>({age:P.age,ma:G.W.pow.마,seal:Object.keys(G.seal),lives:G.lives,st:P.story.open,hint:(P.age=20,lastYear=19,update(.1),openPanel('story'),$('wbody').textContent)}));
  ok(`강호사에 선택 ${JSON.stringify(t8.hist.pick).slice(0,40)}…, 대전 기록 ${t8.wars}`,t8.hist&&t8.hist.pick.ev1===0&&t8.wars===1);
  ok(`다음 생: 8세(${t9.age}), 마교 힘 유지 ${t9.ma}, 봉문 유지 ${t9.seal}`,Math.floor(t9.age)===8&&Math.round(t9.ma)===77&&t9.seal[0]===t8.seal&&t9.lives===1&&t9.st===null);
  ok('전생의 흔적이 사건 창에 보인다',t9.hint.includes('전생의 흔적')&&t9.hint.includes('제1생'));
  // 10. 저장 이전: v2 저장(story 없음, 23세)은 지난 사건을 '지나감'으로 적고 세상 상태를 채운다
  const t10=await p.evaluate(()=>{saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));d.v=2;delete d.P.story;delete d.G.W;delete d.G.seal;d.P.age=23;const m=migrateSave(JSON.parse(JSON.stringify(d)));return{SV:SAVE_VER,v:m.v,pick:m.P.story.pick,seal:m.G.seal,W:m.G.W}});
  ok(`v2 → v3: 지난 사건 ${Object.keys(t10.pick).length}개 지나감, 봉문 ${JSON.stringify(t10.seal)}`,t10.v===t10.SV&&Object.keys(t10.pick).length===7&&t10.pick.ev7===-1&&t10.pick.ev8==null&&JSON.stringify(t10.seal)==='{}'&&t10.W===null);
  // 11. 타이틀 '처음부터 새로' → 세상과 강호사가 지워진다
  await p.evaluate(()=>{saveGame(true);showTitle()});await p.waitForTimeout(200);
  const hasReset=await p.$('[data-s="reset"]');await p.click('[data-s="reset"]');await p.waitForTimeout(150);await p.click('[data-s="reset2"]');await p.waitForTimeout(300);   // 화면 안 확인 두 단계 (2026-10-14)
  const t11=await p.evaluate(()=>({lives:G.lives,W:G.W,seal:Object.keys(G.seal).length,hist:G.history.length,sv:localStorage.getItem(SAVE_KEY),create:!!document.querySelector('[data-s="start"]')}));
  ok(`처음부터 새로: 생 ${t11.lives}, 봉문 ${t11.seal}, 강호사 ${t11.hist}, 저장 지움`,!!hasReset&&t11.lives===0&&t11.W===null&&t11.seal===0&&t11.hist===0&&t11.sv===null&&t11.create);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

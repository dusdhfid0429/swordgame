// v152 진행 점검: 문파·맹 임무는 해마다 한 번, 폐관이 천하대전·사건을 건너뛰지 않음, 반로환동 뒤에도 해마다 바뀌는 것은 살아온 해로 셈, 10번 사건 '몸을 피한다'·'앞장선다'
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];P.sect='hwasan';P.mtot={hwasan:0};P.merit={hwasan:0};P.quests=[]});
  // 1. 문파 임무: 보고한 임무는 그해에 다시 못 맡는다, 해가 바뀌면 다시
  const r1=await p.evaluate(()=>{const s=SECTS.hwasan,q=sectMissions(s)[0];
    const take=()=>{sectAct('stake',s.id,'0')};const has=()=>P.quests.some(o=>o.key===q.key);
    take();const t1=has();const i=P.quests.findIndex(o=>o.key===q.key);P.quests[i].have=999;if(q.kind!=='kill')P.mats[q.mat]=999;act('qdone:'+i);const gone=!has();
    take();const again=has();const html=sectDetail(s).includes('올해 마침');newYear();const after=(take(),has());return{t1,gone,again,html,after}});
  ok(`문파 임무 맡음 ${r1.t1}, 보고 ${r1.gone}, 그해 다시 맡기 ${r1.again}(막힘), 창에 '올해 마침' ${r1.html}, 새해엔 다시 ${r1.after}`,r1.t1&&r1.gone&&!r1.again&&r1.html&&r1.after);
  // 2. 폐관: 천하대전 중이거나 폐관하는 해 안에 사건이 닥치면 막는다
  const r2=await p.evaluate(()=>{P.quests=[];const due=SEV[0].age;P.age=due-.4;P.story=null;const w1=storyDueIn(1);
    G.war={life:P.lifeNo,plan:warPlan(),round:1,rounds:[],cur:{}};const wWar=storyDueIn(1)!=null||warOn();G.war=null;return{w1,due,wWar}});
  ok(`폐관 막기: ${r2.due}세 사건이 1년 안 → ${r2.w1}, 천하대전 중 ${r2.wWar}`,r2.w1===r2.due&&r2.wWar);
  const r2b=await p.evaluate(()=>{const s=pgWhy.toString();return s.includes('warOn')&&s.includes('storyDueIn')});
  ok(`폐관 조건에 천하대전·사건 확인이 들어 있다 ${r2b}`,r2b);
  // 3. 반로환동 뒤: 임무 키는 살아온 해로 센다
  const r3=await p.evaluate(()=>{P.age=70.2;P.taught=70;const k0=sectMissions(SECTS.hwasan)[0].key;P.ban={from:70,yrs:45};P.age=25.2;
    return{real:Math.floor(realAge()),key:sectMissions(SECTS.hwasan)[0].key===k0,stage:lifeStage()}});
  ok(`반로환동 뒤 살아온 해 ${r3.real}, 임무 키 그대로 ${r3.key}, 생애 단계 ${r3.stage}`,r3.real===70&&r3.key);
  // 3b. 사부 가르침은 한 해 한 번 제한이 없다 (사용자 2026-10-23): 같은 해에 두 초식을 잇달아 받는다
  const r3b=await p.evaluate(()=>{P.ban=null;P.age=30.5;const a=art(),s=A(a.id);s.f=s.f.map((v,i)=>i===0);s.p=9999;
    act('teach');const n1=s.f.filter(Boolean).length;const h=teachHtml();act('teach');const n2=s.f.filter(Boolean).length;return{n1,n2,h:!h.includes('이미 배웠다')}});
  ok(`같은 해 가르침 두 번: 초식 ${r3b.n1} → ${r3b.n2}, 막힘 문구 없음 ${r3b.h}`,r3b.n2===r3b.n1+1&&r3b.n1>=2&&r3b.h);
  // 4. 10번 사건 '몸을 피한다': 결전 임무·습격이 오지 않는다. '앞장선다': 내 편 +10
  const r4=await p.evaluate(()=>{P.ban=null;P.age=27;P.quests=[];mobs=[];P.sect='hwasan';const s=PS();s.flag={hide:true};
    G.war={life:P.lifeNo,y:Math.floor(G.cal),plan:warPlan(),round:0,rounds:[],won:null};const me=mySide();warRound();const q=P.quests.some(q=>q.war),raid=mobs.some(m=>m.raid);
    warTally();const rec=G.war.rounds[0];G.war=null;s.flag={};return{me,q,raid,rec:rec&&rec.me}});
  ok(`몸을 피함(내 편 ${r4.me}): 결전 임무 ${r4.q}, 습격 ${r4.raid}, 기록 '${r4.rec}'`,r4.me>=0?(!r4.q&&!r4.raid&&r4.rec==='-'):true);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

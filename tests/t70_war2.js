// 스토리 5단계 (2026-10-15 v109): 결전장(출전 → war_field, 내 편·적·적장), 적장 격파 = 이번 차례의 공, 마교 탈락의 어부지리, 관군 토벌의 결말
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 정사연합 대 마교 1차 결전: 정세 창에 '출전' → 결전장. 내 편 5(끝은 고수), 적 8 + 적장, 출입구는 떠나온 곳으로
  const a=await p.evaluate(()=>{for(const e of STORY.EV)P.story.pick[e.id]=2;G.W.rel.정사=30;setPow('마',50);P.age=26;lastYear=25;update(.1);closePanels();openPanel('story');const bt=document.querySelector('[data-act="wargo"]');const o={btn:!!bt&&!bt.disabled,from:REG};
    act('wargo');o.reg=REG;const al=mobs.filter(m=>m.warAlly),fo=mobs.filter(m=>m.raid&&!m.warChief),cf=mobs.find(m=>m.warChief);o.ally=al.length;o.allyFac=[...new Set(al.map(m=>m.d.fac))].join('·');o.allyPeace=al.every(m=>peaceful(m));
    o.foe=fo.length;o.foeFac=[...new Set(fo.map(m=>m.d.fac))].join('·');o.chief=cf&&cf.name;o.chiefHp=cf&&cf.maxHp;o.gate=REGION().gates[0].to;o.in=REGIONS.gaebong.gates.find(g=>g.to==='war_field');o.inNeed=o.in&&o.in.need();o.in=!!o.in;o.again=warFieldOk();o.zone=REGION().zone();return o});
  ok(`출전 단추 ${a.btn} → ${a.reg} (${a.zone}) · 내 편 ${a.ally}명(${a.allyFac}, 평화 ${a.allyPeace}) · 적 ${a.foe}명(${a.foeFac}) · 적장 "${a.chief}" 생명 ${a.chiefHp} · 출입구 → ${a.gate} (개봉 쪽 출입구 ${a.in}, 열림 ${a.inNeed===null}) · 재출전 ${a.again}`,
    a.btn&&a.reg==='war_field'&&a.ally===16&&/정|사/.test(a.allyFac)&&a.allyPeace&&a.foe===20&&a.foeFac==='마'&&a.chief==='마교 대장'&&a.chiefHp>300&&a.gate==='gaebong'&&a.in&&a.inNeed===null&&!a.again);
  // 2. 적장을 베면 이번 차례의 공(+25)과 명성 +15. 1초 뒤 아군과 적이 서로 싸운다
  const c=await p.evaluate(()=>{const cf=mobs.find(m=>m.warChief);const f0=P.fame;cf.hp=1;toggleForce(true);damage(cf,5,0,0,P);toggleForce(false);const o={done:G.war.cur.done,fame:P.fame-f0,q:G.war.cur.q};o.fight0=mobs.filter(m=>m.warAlly&&m.tgt).length;for(let i=0;i<15;i++)update(.1);o.fight=mobs.some(m=>m.warAlly&&m.tgt&&m.tgt.raid)||mobs.some(m=>m.raid&&m.tgt&&m.tgt.warAlly);return o});
  ok(`적장 격파 → 공 ${c.done} (${c.q}) 명성 +${c.fame} · 아군 표적 ${c.fight0} 교전 ${c.fight}`,c.done===true&&c.fame===15&&c.fight0>=4&&c.fight);
  // 3. 마교 탈락: 마교도가 마교 없는 구도를 맞으면 어부지리 임무(양쪽 고수 4명), 결전장에서는 모두가 적. 끝내면 마교 +3
  const s=await p.evaluate(()=>{warEnd(true);P.story.flag.warDone=false;G.wars=[];P.quests=[];P.sect='cheonma';P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.mtot={cheonma:100};G.W.rel.정사=-30;G.W.rel.사마=-30;setPow('마',10);setPow('사',50);warStart();const o={plan:G.war.plan.n,me:mySide()};
    const q=P.quests.find(q=>q.sneak);o.q=q&&q.n;o.mob=q&&q.mob.join('·');o.ok=warFieldOk();regionJump('gaebong',60,60);act('wargo');o.reg=REG;const fo=mobs.filter(m=>m.raid);o.foes=[...new Set(fo.map(m=>m.d.fac))].sort().join('·');o.ally=mobs.filter(m=>m.warAlly).length;o.hostile=fo.every(m=>mobFoeP(m));
    const pw=G.W.pow.마;if(q){q.have=q.cnt;closePanels();openPanel('story');const bt=document.querySelector('[data-act^="qdone:"]');act(bt.dataset.act)}o.pow=Math.round((G.W.pow.마-pw)*10)/10;return o});
  ok(`마교 탈락 (${s.plan}, 내 편 ${s.me}): 임무 [${s.q}] ${s.mob} · 출전 ${s.ok} → ${s.reg} 적 ${s.foes} 아군 ${s.ally} 모두 적 ${s.hostile} · 보고 → 마교 +${s.pow}`,
    !/마교/.test(s.plan)&&s.me===-1&&/어부지리/.test(s.q)&&s.ok&&s.reg==='war_field'&&s.foes==='사·정'&&s.ally===0&&s.hostile&&s.pow>0);
  // 4. 관군 토벌: 조정이 홀로 서는 구도. 적장은 토벌대장. 조정이 이기면 정관 -20, 지면 관군 -10
  const g=await p.evaluate(()=>{warEnd(true);P.story.flag.warDone=false;P.quests=[];P.sect=null;P.sims={};P.sim=null;regionJump('gaebong',60,60);G.W.rel.정사=30;setPow('마',50);setPow('관',80);warStart();const o={plan:G.war.plan.n,gun:G.war.plan.sides.some(s=>s.length===1&&s[0]==='관')};
    act('wargo');const cf=mobs.find(m=>m.warChief);o.chief=cf&&cf.name;o.chiefFac=cf&&cf.d.fac;const r0=G.W.rel.정관;G.war.rounds=[{win:G.war.plan.sides.findIndex(s=>s[0]==='관'&&s.length===1),sc:[0,0,0],me:'-'},{win:G.war.plan.sides.findIndex(s=>s[0]==='관'&&s.length===1),sc:[0,0,0],me:'-'}];G.war.round=2;warEnd(true);o.rel=G.W.rel.정관-r0;o.won=G.wars[G.wars.length-1].won.join();return o});
  ok(`관군 토벌 (${g.plan}, 관군 단독 ${g.gun}): 적장 "${g.chief}" · 조정 승(${g.won}) → 정관 ${g.rel}`,g.gun&&g.chief==='관군 토벌대장'&&g.chiefFac==='관'&&g.rel<=-20&&g.won==='관');
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

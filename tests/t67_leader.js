// 교주 비무 쟁탈 (2026-10-15 v107): 부교주+탈마+마성<20이 천마신전에서 교주에게 비무. 이기면 교주(오당 무공·천마무상대법·출정/은둔·사면·세입), 지면 흑혈옥 3년. 도전자.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 조건: 마교도·부교주·탈마·마성·천마신전. 미달이면 단추 비활성
  const c=await p.evaluate(()=>{const o={};o.no0=leaderWhy();P.sect='cheonma';P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.mtot={cheonma:2200};P.mara=0;P.sin=0;P.realm=4;o.no1=leaderWhy();P.realm=6;o.no2=leaderWhy();
    loadRegion('in_hq_cheonma_0');P.reg='in_hq_cheonma_0';P.x=9;P.y=6;runHooks('regionLoaded','in_hq_cheonma_0');o.no3=leaderWhy();P.mara=30;o.no4=leaderWhy();P.mara=0;
    openNpc(npcsHere().find(n=>n.hq));const bt=document.querySelector('[data-act="ldduel"]');o.btn=!!bt&&!bt.disabled;closePanels();return o});
  ok(`조건: 비마교도 "${c.no0}" · 극마 "${c.no1}" · 신전 밖 "${c.no2}" · 갖춤 "${c.no3}" · 마성 30 "${c.no4}" · 단추 ${c.btn}`,c.no0==='마교도만'&&c.no1.includes('탈마')&&c.no2.includes('천마신전')&&c.no3===''&&c.no4.includes('마성')&&c.btn);
  // 2. 비무: 교주 몹(생명 ×4, 탈마), 구경꾼 불개입, 약 금지, 마당을 벗어나면 항복 → 흑혈옥 3년, 마성 +30
  const d=await p.evaluate(()=>{const o={};sectAct('ldduel');o.duel=G.duel&&G.ldDuel==='take'&&REG==='hq_cheonma';const w=mkFac('마',0,P.x+3,P.y,'cheonma');w.aggro=true;mobs.push(w);const e=mobs.find(m=>m.leader);o.boss=!!e;o.realm=e&&e.realm;o.hpX=e&&Math.round(e.maxHp/mkFac('마',1,0,0,'cheonma').maxHp*10)/10;
    o.npc=!REGIONS.in_hq_cheonma_0.npcs.some(n=>n.hq);update(.1);o.watch=!w.aggro;P.mats.금창약=3;const hp0=P.hp;P.hp=10;useCon('금창약');o.noCon=P.hp===10&&P.mats.금창약===3;P.hp=hp0;
    P.x=3;update(.1);o.lost=!G.duel&&!!P.jail;o.jail=P.jail&&P.jail.t;o.back=REGIONS.in_hq_cheonma_0.npcs.some(n=>n.hq);o.reg=REG;o.mara=Math.round(P.mara);o.tried=!!P.ldTried;return o});
  ok(`비무: 시작 ${d.duel} 교주 ${d.boss} 경지 ${d.realm} 생명 ×${d.hpX} · 교주 NPC 숨김 ${d.npc} · 구경꾼 ${d.watch} · 약 금지 ${d.noCon} · 교주 NPC 복귀 ${d.back} · 마당 이탈 → 패배 ${d.lost}: ${d.reg} ${d.jail}년, 마성 ${d.mara}, 한 생에 한 번 ${d.tried}`,
    d.duel&&d.boss&&d.realm===6&&d.hpX>=3&&d.npc&&d.back&&d.watch&&d.noCon&&d.lost&&d.reg==='hq_cheonma_9'&&d.jail===3&&d.mara===30&&d.tried);
  // 3. 승리: 교주 플래그, 명성 +200, 오당 무공·천마무상대법, 죄값 0. 교주 NPC는 제단으로 돌아오고 대화에 교주 카드
  const w=await p.evaluate(()=>{const o={};P.jail=null;P.sin=0;P.ldTried=0;P.mara=0;P.arts={base:P.arts.base};P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';regionJump('in_hq_cheonma_0',9,6);runHooks('regionLoaded','in_hq_cheonma_0');
    const f0=P.fame;sectAct('ldduel');const e=mobs.find(m=>m.leader);e.hp=1;toggleForce(true);damage(e,5,0,0,P);toggleForce(false);update(.1);
    o.leader=P.leader==='cheonma';o.duel=!G.duel;o.fame=P.fame-f0;o.arts=Object.keys(MDANG).every(k=>!!P.arts[MDANG[k].art]);o.sim=!!P.sims.N_cheonma_4;regionJump('in_hq_cheonma_0',9,6);runHooks('regionLoaded','in_hq_cheonma_0');o.npc=npcsHere().some(n=>n.hq);
    openNpc(npcsHere().find(n=>n.hq));o.dlg=$('win').innerText.includes('교주의 자리')&&$('win').innerText.includes('이름이 새겨져');closePanels();sinAdd(10,'test');o.sin=P.sin||0;return o});
  ok(`승리: 교주 ${w.leader} 비무 끝 ${w.duel} 명성 +${w.fame} · 오당 무공 ${w.arts} 천마무상대법 ${w.sim} · 교주 NPC 복귀 ${w.npc} 대화 ${w.dlg} · 교율 위 (죄값 ${w.sin})`,w.leader&&w.duel&&w.fame===200&&w.arts&&w.sim&&w.npc&&w.dlg&&w.sin===0);
  // 4. 천하대전 출정/은둔: 은둔이면 구도에서 마교가 빠진다. 세입 은자 500. 정세 창 카드
  const s=await p.evaluate(()=>{const o={};wld().pow.마=80;o.out=warPlan().sides.some(s=>s.includes('마'));sectAct('ldwar','hide');o.hideF=P.ldWar;const pl=warPlan();o.hide=!pl.sides.some(s=>s.includes('마'));o.note=pl.notes.some(n=>n.includes('은둔'));
    sectAct('ldwar','out');o.back=warPlan().sides.some(s=>s.includes('마'));openPanel('story');o.card=$('win').innerText.includes('교주의 자리')&&!!document.querySelector('[data-act="ldwar:hide"]');closePanels();
    const sv=P.silver;Math.random=()=>.99;runHooks('newYear');o.inc=P.silver-sv;return o});
  ok(`천하대전: 출정 구도에 마교 ${s.out} · 은둔(${s.hideF}) 빠짐 ${s.hide} 주석 ${s.note} · 다시 출정 ${s.back} · 정세 창 카드 ${s.card} · 세입 +${s.inc}`,s.out&&s.hideF==='hide'&&s.hide&&s.note&&s.back&&s.card&&s.inc===500);
  // 5. 사면: 흑혈옥의 정파 수감자를 풀어 동료로. 다시 들어와도 없다
  const r=await p.evaluate(()=>{const o={};regionJump('hq_cheonma_9',20,20);runHooks('regionLoaded','hq_cheonma_9');const n=npcsHere().find(x=>x.prisoner);openNpc(n);o.btn=!!document.querySelector('[data-act="pardon:'+n.id+'"]');closePanels();
    const a0=allies.length;sectAct('pardon',n.id);o.ally=allies.length-a0;o.gone=!npcsHere().some(x=>x.id===n.id);regionJump('hq_cheonma_8',20,20);regionJump('hq_cheonma_9',20,20);runHooks('regionLoaded','hq_cheonma_9');o.still=!npcsHere().some(x=>x.id===n.id);o.left=npcsHere().filter(x=>x.prisoner).length;return o});
  ok(`사면: 단추 ${r.btn} · 동료 +${r.ally} · 수감자 사라짐 ${r.gone} 재진입 ${r.still} (남은 수감자 ${r.left})`,r.btn&&r.ally===1&&r.gone&&r.still&&r.left===1);
  // 6. 도전자: 해마다 20%로 비무를 청한다. 지면 자리를 잃고 흑혈옥
  const h=await p.evaluate(()=>{const o={};regionJump('hq_cheonma_3',20,20);o.start=leaderChallenge();o.def=G.ldDuel==='def';const e=mobs.find(m=>m.challenger);o.mob=!!e;
    P.hp=5;hurtP(999,e);update(.1);o.lost=!P.leader&&!!P.jail&&REG==='hq_cheonma_9';o.why=leaderWhy();return o});
  ok(`도전자: 시작 ${h.start} ${h.def} 몹 ${h.mob} · 패배 → 자리 잃고 흑혈옥 ${h.lost} · 다시 청하기 "${h.why}"`,h.start&&h.def&&h.mob&&h.lost&&h.why.includes('한 번'));
  // 7. 교주인 채 죽으면 교주 공석(G.mdead) + 다음 생은 전대 교주의 후예(명성 +50)
  const l=await p.evaluate(()=>{const o={};P.jail=null;P.leader='cheonma';P.sect='cheonma';runHooks('died',{});o.dead=!!(G.mdead.cheonma&&G.mdead.cheonma.ld);o.heir=!!G.ldHeir;newLife({name:'후예',side:'사',gg:0,wis:5,status:1,cls:'검'});o.fame=P.fame;o.feat=P.feats.some(f=>f.includes('후예'));o.cleared=!G.ldHeir;return o});
  ok(`죽음: 교주 공석 ${l.dead} · 후예 표식 ${l.heir} → 다음 생 명성 ${l.fame} 업적 ${l.feat} 표식 소거 ${l.cleared}`,l.dead&&l.heir&&l.fame===50&&l.feat&&l.cleared);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

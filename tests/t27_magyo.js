// 마교: 문파 하나로 세력 하나. 오당·일곱 단 직위·십만대산 본거지
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:사"]');await p.tap('[data-s="cls:권"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 신강 십만대산 산 맵 중턱 포털에서 마교 여덟 맵으로
  await p.evaluate(()=>{P.silver=5000;P.fame=150;const g=REGIONS[REGIONS.hq_cheonma_1.lmVia].gates.find(q=>q.to==='hq_cheonma_1');travel(g)});await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>({via:REGIONS.hq_cheonma_1.lmVia,reg:REG,N,zone:regionAt(Math.floor(P.x),Math.floor(P.y)),chain:REGION().chain.map(id=>REGIONS[id].name),gate:REGION().gates.map(g=>g.to),
    npc:Object.fromEntries(REGION().chain.map(id=>[REGIONS[id].name,npcsOf(id).length]))}));
  ok(`십만대산 맵 ${r.chain.length}개: ${r.chain.join(' → ')}`,r.reg==='hq_cheonma_1'&&r.chain.length===8&&r.gate.includes(r.via));
  ok(`NPC: ${JSON.stringify(r.npc)}`,r.npc['마교 성읍']===4&&r.npc['오당 광장']===5&&r.npc['천마신전']>=1&&r.npc['장로원']===1);
  const mg=await p.evaluate(()=>{const out=[];for(const id of REGION().chain){loadRegion(id);out.push(builds.filter(b=>b.mg).length===builds.length)}loadRegion('hq_cheonma_1');return out.every(Boolean)});
  ok('여덟 맵의 전각이 모두 검은 벽·붉은 기와',mg);
  await p.evaluate(()=>{P.reg='hq_cheonma_5';loadRegion('hq_cheonma_5');P.x=20.5;P.y=20.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;tod=.55});await p.waitForTimeout(900);
  await p.screenshot({path:shot('magyo_plaza')});
  await p.evaluate(()=>{P.reg='hq_cheonma';loadRegion('hq_cheonma');P.x=20.5;P.y=13.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;spawnTick();spawnTick()});await p.waitForTimeout(900);
  await p.screenshot({path:shot('magyo_temple')});
  // 천마동은 장로 이상만
  const cave=await p.evaluate(()=>{const g=REGION().gates.find(q=>q.to==='hq_cheonma_8');return g.need()});
  ok(`천마동 출입 조건: ${cave}`,!!cave&&cave.includes('장로'));
  // 마교도는 교도가 아니면 적, 교도면 같은 편
  const f0=await p.evaluate(()=>{const m=mobs.find(e=>e.sect==='cheonma');return m?mobFoeP(m):null});
  // 입교 전: 비급은 교도만
  await p.evaluate(()=>openNpc(hqNpc(REG)));await p.waitForTimeout(200);
  const t0=await p.evaluate(()=>$('wbody').textContent);
  ok(`입교 전 마교도는 적(${f0}), 교주 창에 짜임과 '교도만'`,f0!==false&&t0.includes('천마신교의 짜임')&&t0.includes('교도만')&&t0.includes('부교주'));
  await p.locator('[data-act="sjoin:cheonma"]').tap();await p.waitForTimeout(200);
  const j=await p.evaluate(()=>({sect:P.sect,dang:P.dang||null,foe:mobs.filter(e=>e.sect==='cheonma').some(m=>mobFoeP(m)),blk:mgArtBlock({id:'S_cheonma_0'})}));
  ok(`입교: 당 없음, 마교도와 같은 편, 일반 무공은 '${j.blk}'`,j.sect==='cheonma'&&!j.dang&&!j.foe&&j.blk==='당에 든 뒤');
  // 혈마당 입당
  await p.evaluate(()=>{closePanels();P.reg='hq_cheonma_5';loadRegion('hq_cheonma_5');openNpc(findNpc(REG,n=>n.dang==='hyeolma'))});await p.waitForTimeout(200);
  await p.screenshot({path:shot('magyo_dang')});
  await p.locator('[data-act="mdang:hyeolma"]').tap();await p.waitForTimeout(200);
  const d=await p.evaluate(()=>({dang:P.dang,art:!!(P.arts.S_cheonma_0&&P.arts.S_cheonma_0.f[0]),own:mgArtBlock({id:'S_cheonma_0'}),other:mgArtBlock({id:'S_cheonma_1'}),
    cost:[meritCost({id:'S_cheonma_0'},0),meritCost({id:'S_cheonma_1'},0)],again:mgJoinDang('maryeong')}));
  ok(`혈마당 입당 → 혈마장 첫 초식, 다른 당 무공은 '${d.other}', 비급 공적 ${d.cost[0]} < ${d.cost[1]}, 당은 못 바꿈`,d.dang==='hyeolma'&&d.art&&d.own===''&&d.other.includes('장로부터')&&d.cost[0]<d.cost[1]&&d.again===false);
  // 일곱 단 직위
  const rk=await p.evaluate(()=>{const out=[];for(const t of[0,400,800,1400,2200,9999]){P.mtot.cheonma=t;out.push(rankName('cheonma'))}P.mtot.cheonma=800;const el=mgArtBlock({id:'S_cheonma_1'});
    P.mtot.cheonma=2200;const pal=sectPal('cheonma',rankIdx('cheonma'),'권',{});const html=rankHtml(SECTS.cheonma);P.sect=null;P.mtot.hwasan=99999;const other=rankIdx('hwasan');P.sect='cheonma';
    return{out,el,pal:!!pal,html:!html.includes('undefined'),other}});
  ok(`직위 ${rk.out.join('→')}, 장로면 다른 당 무공 열림, 다른 세력은 다섯 단(${rk.other})`,rk.out.join()==='교도,당주,장로,호법,부교주,부교주'&&rk.el===''&&rk.pal&&rk.html&&rk.other===4);
  // 저장
  const sv=await p.evaluate(()=>{saveGame(true);const d=loadGame();return d.P.dang==='hyeolma'});
  ok('저장에 당',sv);
  // 하산하면 당도 잃는다
  const lv=await p.evaluate(()=>{sectAct('sleave');return P.dang});
  ok('하산하면 당이 없어짐',lv===null);
  // 예전 72×72 십만대산 자리에서 불러오면 맵 안 출입구 앞으로
  const old=await p.evaluate(()=>{loadRegion('gaebong');P.reg='hq_cheonma';P.x=60.5;P.y=66.5;loadRegion('hq_cheonma');return walkAt(P.x,P.y)});
  ok('예전 본산 자리 저장도 걸을 수 있는 곳에 놓임',old);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

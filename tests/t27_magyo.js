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
  // 신강에서 십만대산으로 들어간다
  await p.evaluate(()=>{P.silver=5000;P.fame=150;const g=REGIONS.pv_xinjiang.gates.find(q=>q.to==='hq_cheonma');travel(g)});await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    // 도착 자리에서 교주·당주·상점까지 걸어서 닿는가 (BFS)
    const seen=new Set,q=[[Math.floor(P.x),Math.floor(P.y)]];seen.add(q[0]+'');
    while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=[x+dx,y+dy];if(!seen.has(k+'')&&walk(k[0],k[1])){seen.add(k+'');q.push(k)}}}
    const reach=npcsHere().filter(n=>{for(const[dx,dy]of[[0,0],[0,1],[1,0],[-1,0],[0,-1]])if(seen.has([Math.floor(n.x)+dx,Math.floor(n.y)+dy]+''))return true;return false}).map(n=>n.n);
    return{reg:REG,N,walk:walkAt(P.x,P.y),zone:regionAt(Math.floor(P.x),Math.floor(P.y)),npcs:npcsHere().length,reach,
      zones:[...new Set([[36,66],[37,57],[37,46],[36,30],[36,12]].map(([x,y])=>regionAt(x,y)))],mg:builds.filter(b=>b.mg).length,
      gate:REGION().gates.map(g=>g.to)}});
  ok(`십만대산 ${r.N}×${r.N}, 도착 자리 ${r.zone} 걸을 수 있음`,r.reg==='hq_cheonma'&&r.N===72&&r.walk);
  ok(`구역 ${r.zones.join('·')}`,r.zones.length===5);
  ok(`NPC ${r.npcs}명 모두 걸어서 닿음 (${r.reach.length})`,r.npcs===10&&r.reach.length===10);
  ok(`마교 전각 ${r.mg}채, 신강으로 나가는 출입구`,r.mg>=15&&r.gate.includes('pv_xinjiang'));
  await p.evaluate(()=>{P.x=36.5;P.y=24.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;tod=.55});await p.waitForTimeout(900);
  await p.screenshot({path:shot('magyo_plaza')});
  await p.evaluate(()=>{P.x=36.5;P.y=12.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(700);
  await p.screenshot({path:shot('magyo_temple')});
  // 마교도는 교도가 아니면 적, 교도면 같은 편
  const f0=await p.evaluate(()=>{const m=mobs.find(e=>e.sect==='cheonma');return m?mobFoeP(m):null});
  // 입교 전: 비급은 교도만
  await p.evaluate(()=>openNpc(npcsHere().find(n=>n.hq==='cheonma')));await p.waitForTimeout(200);
  const t0=await p.evaluate(()=>$('wbody').textContent);
  ok(`입교 전 마교도는 적(${f0}), 교주 창에 짜임과 '교도만'`,f0!==false&&t0.includes('천마신교의 짜임')&&t0.includes('교도만')&&t0.includes('부교주'));
  await p.locator('[data-act="sjoin:cheonma"]').tap();await p.waitForTimeout(200);
  const j=await p.evaluate(()=>({sect:P.sect,dang:P.dang||null,foe:mobs.filter(e=>e.sect==='cheonma').some(m=>mobFoeP(m)),blk:mgArtBlock({id:'S_cheonma_0'})}));
  ok(`입교: 당 없음, 마교도와 같은 편, 일반 무공은 '${j.blk}'`,j.sect==='cheonma'&&!j.dang&&!j.foe&&j.blk==='당에 든 뒤');
  // 혈마당 입당
  await p.evaluate(()=>{closePanels();openNpc(npcsHere().find(n=>n.dang==='hyeolma'))});await p.waitForTimeout(200);
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
  // 예전 자리(40×40 시절)에서 불러오면 협곡 입구로
  const old=await p.evaluate(()=>{loadRegion('gaebong');P.reg='hq_cheonma';P.x=20.5;P.y=36.2;loadRegion('hq_cheonma');return walkAt(P.x,P.y)});
  ok('예전 본산 자리 저장도 걸을 수 있는 곳에 놓임',old);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

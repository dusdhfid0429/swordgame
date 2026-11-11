// 사부 선정 대회 (v237, 사용자 2026-11-03): 정·사파 사부 고르기는 본산 대연무장에서 문파원과 관할 마을 주민이 구경하는 행사
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 1. 정·사파 문파마다 대연무장, 장문인 맵과 양쪽으로 잇는다. 마교·군부는 없음
  const r0=await p.evaluate(()=>{const on=Object.values(SECTS).filter(s=>sabuOn(s)&&SABU[s.id]&&SABU[s.id].length);
    return{n:on.length,all:on.every(s=>{const A=REGIONS['ar_'+s.id],g=A&&A.gates[0],H=g&&REGIONS[g.to];return !!H&&(H.chain||[hqId(s)]).includes(g.to)&&H.gates.some(q=>q.to==='ar_'+s.id)}),cm:!!REGIONS.ar_cheonma,gb:!!REGIONS.ar_geumgun}});
  ok(`정·사파 ${r0.n}곳 모두 대연무장 + 본산 출입구 (마교·군부 없음)`,r0.n>20&&r0.all&&!r0.cm&&!r0.gb);
  // 2. 입문 → 본산 출입구를 지나 대연무장 → 행사가 열리고 관객이 가득
  const r1=await p.evaluate(()=>{const s=SECTS.taeyang;enterRegion(hqId(s),20.5,30.5);P.reg=REG;mobs=[];P.realm=0;P.age=16;P.fame=60;P.evil=0;P.side='사';openNpc(hqNpc(hqId(s)));act('sjoin:taeyang');closePanels();
    const g=REGION().gates.find(q=>q.to==='ar_taeyang');enterRegion(g.to,g.tx,g.ty);P.reg=REG;return{st:P.sabu.st,walk:walkAt(g.tx,g.ty)}});
  await p.waitForFunction(()=>P.sabu.ev===1,null,{timeout:8000}).catch(()=>{});
  const r2=await p.evaluate(()=>{const L=REGION().npcs;return{ev:P.sabu.ev,sect:L.filter(n=>n.sfCrowd==='sect').length,folk:L.filter(n=>n.sfCrowd==='folk').length,folkN:(L.find(n=>n.sfCrowd==='folk')||{}).n,
    host:!!L.find(n=>n.sfHost),m:L.filter(n=>n.sfMaster!=null).length,coh:L.filter(n=>n.sfCoh).length,tag:L.filter(n=>n.sfCrowd).every(n=>n.noTag),draw:NPCF.length,walk:L.every(n=>walk(Math.floor(n.x),Math.floor(n.y)))}});
  ok(`대연무장에 들어서면 대회가 열린다: 문파원 ${r2.sect} · 주민 ${r2.folk} (${r2.folkN}) · 사부 ${r2.m} · 동기 ${r2.coh}`,r1.st==='rank'&&r2.ev===1&&r2.sect>=15&&r2.folk>=15&&r2.host&&r2.m===3&&r2.coh===5&&r2.tag&&r2.draw===r2.sect+r2.folk+r2.m+r2.coh+1);
  ok(`관객과 사람들이 모두 걸을 수 있는 칸에 선다`,r2.walk&&r1.walk);
  // 3. 서열 비무는 마당 한가운데, 관객이 함성
  const r3=await p.evaluate(()=>{const c=REGION().npcs.find(n=>n.sfCoh===P.sabu.ord[sbPos()-1]);openNpc(c);const btn=$('wbody').innerHTML.includes('data-act="sbduel"');act('sbduel');
    const e=mobs.find(m=>m.sbFoe),hid=!REGION().npcs.some(n=>n.sfCoh===G.sbDuel.foe);return{btn,duel:!!e&&G.duel,d:Math.hypot(P.x-SF.ring[0],P.y-SF.ring[1]),hid}});
  await p.waitForTimeout(2500);
  const r4=await p.evaluate(()=>({shout:texts.filter(t=>[...SF.cheerSect,...SF.cheerFolk].includes(t.t)).length}));
  await p.screenshot({path:shot('t154_duel')});
  ok(`동기에게 말을 걸어 비무 → 연무장 가운데 (${r3.d.toFixed(1)}칸), 상대 동기는 줄에서 나옴, 관객 함성 ${r4.shout}`,r3.btn&&r3.duel&&r3.d<2.5&&r3.hid&&r4.shout>=1);
  const r5=await p.evaluate(()=>{damage(mobs.find(m=>m.sbFoe),1e8,0,0,P);const o={pos:sbPos()+1,win:texts.filter(t=>SF.winLine.includes(t.t)).length};
    for(let i=0;i<2;i++){openNpc(REGION().npcs.find(n=>n.sfHost));act('sbduel');damage(mobs.find(m=>m.sbFoe),1e8,0,0,P)}o.st=P.sabu.st;return o});
  ok(`이기면 서열이 오르고 환호 (${r5.win}), 1위가 되면 사부 고르기`,r5.pos===3&&r5.win>=3&&r5.st==='pick');
  // 4. 단상의 사부에게 가서 고른다 → 대회가 끝나고 동기들도 사부를 정한다
  const r6=await p.evaluate(()=>{P.wis=20;const n=REGION().npcs.find(q=>q.sfMaster!=null);openNpc(n);const btn=$('wbody').innerHTML.includes('data-act="sbpick:'+n.sfMaster+'"');act('sbpick:'+n.sfMaster);runHooks('tick',.05);
    return{btn,st:P.sabu.st,m:P.sabu.m===n.sfMaster,ev:P.sabu.ev,taken:Object.keys(P.sabu.taken||{}).length,track:sabuTrackHtml()}});
  ok(`단상의 사부 창에서 '이 사부를 모신다' → 제자, 대회 끝 (동기 ${r6.taken}명도 사부에게)`,r6.btn&&r6.st==='disc'&&r6.m&&r6.ev===2&&r6.taken===2&&!/대연무장/.test(r6.track));
  await p.waitForTimeout(400);await p.screenshot({path:shot('t154_end')});
  // 5. 나가면 행사가 지나가고, 다시 오면 평소 대연무장 (교두와 연무하는 제자 몇)
  const r7=await p.evaluate(()=>{const g=REGION().gates[0];enterRegion(g.to,g.tx,g.ty);P.reg=REG;const ev=P.sabu.ev;enterRegion('ar_taeyang',20.5,36.2);P.reg=REG;
    return{ev,n:REGION().npcs.length,crowd:REGION().npcs.filter(n=>n.noTag).length,m:REGION().npcs.filter(n=>n.sfMaster!=null).length}});
  ok(`행사가 지나간 뒤 대연무장은 조용하다 (사람 ${r7.n}), 사부들은 늘 단상 앞에 (${r7.m})`,r7.ev===3&&r7.n<=9&&r7.crowd===0&&r7.m===3);
  // 6. 다른 문파 사람이 와도 깨지지 않는다 (손님)
  const r8=await p.evaluate(()=>{enterRegion('ar_hwasan',20.5,36.2);P.reg=REG;openNpc(REGION().npcs.find(n=>n.sfHost));return $('wbody').innerHTML.length>20});
  ok(`남의 문파 대연무장 구경`,r8);
  // 7. 휴대폰 화면 (관객 장면)
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});m.on('pageerror',e=>errs.push('PE '+e.message));
  await m.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await m.waitForFunction(()=>typeof loadRegion==='function');await m.evaluate(()=>localStorage.clear());
  await m.tap('[data-s="new"]');await m.tap('[data-s="start"]');await m.waitForFunction(()=>playing);await m.waitForTimeout(500);
  await m.evaluate(()=>{const s=SECTS.hwasan;enterRegion(hqId(s),20.5,30.5);P.reg=REG;mobs=[];P.realm=0;P.side='정';P.evil=0;P.fame=60;openNpc(hqNpc(hqId(s)));act('sjoin:hwasan');closePanels();enterRegion('ar_hwasan',20.5,24);P.reg=REG;P.path=null});
  await m.waitForTimeout(2200);await m.screenshot({path:shot('t154_phone')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

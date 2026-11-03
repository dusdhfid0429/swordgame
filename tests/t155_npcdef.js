// 고정 NPC 방어 (v237c, 사용자 2026-11-03): 침입이 일어나면 문주처럼 사부·장로·교두도 싸우는 무인으로 나선다
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(500);
  const step0=(n=20)=>p.evaluate(n=>{for(let i=0;i<n;i++)runHooks('tick',.1)},n);
  // 침입자 하나를 세운다 (그 문파의 적 세력 무인)
  await p.evaluate(()=>{window.invade=(s,o,d=3)=>{const f=['정','사','마','관'].find(f=>facFoe(f,alFac(s.al)));const e=mkFac(f,0,o.x+d,o.y+1,null);e.aggro=true;mobs.push(e);return e};spawnTick=()=>{};P.realm=3});
  // 1. 대연무장 사부: 적 세력 무인이 다가오면 무인으로 나서 맞서고, 물리치면 제자리로
  const r1=await p.evaluate(()=>{const s=SECTS.bukhae;P.side='사';P.sect=null;enterRegion('ar_bukhae',20.5,30);P.reg=REG;mobs=[];const n=REGION().npcs.find(q=>q.sfMaster!=null);const foe=invade(s,n);return{n:n.n,id:n.id}});
  await step0(6);
  const r2=await p.evaluate(id=>{const e=mobs.find(m=>m.npcDef&&m.npcRef&&m.npcRef.id===id);return{out:!!e,gone:!REGION().npcs.some(q=>q.id===id),tgt:!!(e&&e.tgt&&e.tgt.d.fac),peace:e?peaceful(e)||!mobFoeP(e):null,draw:!NPCF.some(f=>f.n===(e&&e.name))}},r1.id);
  ok(`대연무장 사부 ${r1.n}: 침입자에 맞서 무인으로 나선다 (플레이어에겐 적이 아님)`,r2.out&&r2.gone&&r2.tgt&&r2.peace);
  await p.evaluate(()=>{mobs=mobs.filter(m=>!(m.d.fac&&!m.npcDef))});await step0(50);
  const r3=await p.evaluate(id=>({back:REGION().npcs.some(q=>q.id===id),mob:mobs.some(m=>m.npcDef)}),r1.id);
  ok(`침입자가 없어지면 제자리 NPC로 돌아온다`,r3.back&&!r3.mob);
  // 2. 크게 다치면 물러난다 (무인끼리 싸우다 죽지 않는다)
  await p.evaluate(()=>{const n=REGION().npcs.find(q=>q.sfHost);window._hid=n.id;invade(SECTS.bukhae,n)});await step0(6);
  const r4=await p.evaluate(()=>{const e=mobs.find(m=>m.npcDef&&m.npcRef&&m.npcRef.id===_hid);if(!e)return{out:false};e.hp=e.maxHp*.1;for(let i=0;i<6;i++)runHooks('tick',.1);return{out:true,back:REGION().npcs.some(q=>q.id===_hid),mob:mobs.includes(e)}});
  ok(`교두도 나서고, 생명이 바닥나면 물러나 NPC로`,r4.out&&r4.back&&!r4.mob);
  // 3. 문주: 장문인도 침입자에 맞선다
  const r5=await p.evaluate(()=>{mobs=[];P.side='정';const s=SECTS.hwasan,H=REGIONS[hqId(s)],id=H.halls&&H.halls.length?H.halls[0].id:hqId(s);enterRegion(id,10,10);P.reg=REG;mobs=[];const n=REGION().npcs.find(q=>q.hq);P.x=n.x;P.y=n.y+3;invade(s,n,2);return{n:n&&n.n}});
  await step0(6);
  const r6=await p.evaluate(()=>{const e=mobs.find(m=>m.master==='hwasan');return{out:!!e,def:!!(e&&e.npcDef),hid:!REGION().npcs.some(q=>q.hq)}});
  await p.evaluate(()=>{mobs=mobs.filter(m=>m.master)});await step0(50);
  const r7=await p.evaluate(()=>({back:REGION().npcs.some(q=>q.hq),mob:mobs.some(m=>m.master),dead:!!G.mdead.hwasan}));
  ok(`장문인(${r5.n})도 같은 방식: 나섰다가 침입이 끝나면 돌아온다`,r6.out&&r6.def&&r6.hid&&r7.back&&!r7.mob&&!r7.dead);
  // 4. 후산 장로: 플레이어가 문파 무인과 싸우면 칼을 뽑아 막아선다 (플레이어에게 적)
  const r8=await p.evaluate(()=>{mobs=[];const s=SECTS.hwasan;enterRegion('hq_hwasan_back',20.5,30);P.reg=REG;mobs=[];const n=REGION().npcs.find(q=>q.elder);P.x=n.x+2;P.y=n.y+2;
    const d=mkFac(alFac(s.al),0,n.x+1,n.y+3,s.id);d.angry=1;d.aggro=true;d.tgt=null;mobs.push(d);for(let i=0;i<6;i++)runHooks('tick',.1);const e=mobs.find(m=>m.npcRef===n);return{out:!!e,foe:!!(e&&mobFoeP(e)),n:n.n}});
  ok(`후산 ${r8.n}: 플레이어가 문파 무인과 싸우면 나서서 플레이어를 친다`,r8.out&&r8.foe);
  // 5. 마교 장로원 사부(장로)도
  const r9=await p.evaluate(()=>{mobs=[];enterRegion('hq_cheonma_6',20.5,30);P.reg=REG;mobs=[];const n=REGION().npcs.find(q=>q.sfMaster!=null);invade(SECTS.cheonma,n);for(let i=0;i<6;i++)runHooks('tick',.1);return{out:mobs.some(m=>m.npcDef&&m.npcRef===n),n:n.n}});
  ok(`마교 장로원 ${r9.n}도 침입자에 맞선다`,r9.out);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

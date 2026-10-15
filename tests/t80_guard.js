// 문파 구성 (v118): 문지기·순찰조·전각 당원/시종, 리젠 상한에 안 셈, 점령군·폐허, 결전장 증원 파도
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 산문 맵: 출입구마다 문지기 둘(바깥을 본다), 대문파 순찰조 2×3. 순찰조는 시간이 지나면 움직인다. 같은 편이라 평화
  const a=await p.evaluate(()=>{paused=true;popInit();regionJump('hq_hwasan_gate',20,24);const gs=REGION().gates.filter(g=>!g.door).length,gd=mobs.filter(m=>m.fixed==='gate'),pt=mobs.filter(m=>m.fixed==='patrol');
    const out=gd.every(m=>{const g=REGION().gates.reduce((b,g)=>dist(g,m)<dist(b,m)?g:b);return (g.y<NH/2)?m.fy<0:m.fy>0});const p0=pt.map(m=>[m.x,m.y]);for(let i=0;i<80;i++)update(.1);const moved=pt.filter((m,i)=>Math.hypot(m.x-p0[i][0],m.y-p0[i][1])>1).length;
    return{gs,gd:gd.length,out,pt:pt.length,lead:pt.filter(m=>m.route&&!m.follow).length,moved,peace:[...gd,...pt].every(m=>peaceful(m)),names:[...new Set([...gd,...pt].map(m=>m.name))].join('·')}});
  ok(`산문: 출입구 ${a.gs}개 문지기 ${a.gd}명 바깥 보기 ${a.out} · 순찰 ${a.pt}명(조장 ${a.lead}) 8초 뒤 이동 ${a.moved}명 · 평화 ${a.peace} [${a.names}]`,a.gd===a.gs*2&&a.out&&a.pt===6&&a.lead===2&&a.moved>=4&&a.peace);
  // 2. 리젠 상한에 세지 않는다: 문지기·순찰을 빼고 정파 무인이 평소 상한만큼 선다
  const c=await p.evaluate(()=>{const sp=REGION().spawns.find(([k])=>k==='정파 무인');for(let i=0;i<12;i++)spawnTick();const all=mobs.filter(m=>m.kind==='정파 무인'&&m.hp>0),fx=all.filter(m=>m.fixed);return{cap:sp[1],fixed:fx.length,free:all.length-fx.length}});
  ok(`리젠: 상한 ${c.cap} → 고정 ${c.fixed} + 일반 ${c.free}`,c.free>=Math.max(1,Math.round(c.cap*.6))&&c.fixed>0);
  // 3. 전각 안: 연무청(drill)엔 당원 4, 다른 전각엔 시종 2. 당원은 초식을 연습한다(swing)
  const h=await p.evaluate(()=>{const jeong=id=>{const R=REGIONS[id];if(!R||!R.hall)return false;const O=REGIONS[R.hall.out];return O&&O.hq&&SECTS[O.hq]&&alFac(SECTS[O.hq].al)==='정'};const dr=Object.keys(REGIONS).find(id=>jeong(id)&&REGIONS[id].hall.kit==='drill');regionJump('hq_hwasan',20,20);const ot=REGION().halls.map(h=>h.id).find(id=>REGIONS[id].hall.kit!=='drill');const o={dr,ot};
    if(dr){regionJump(dr,7,6);const m=mobs.filter(x=>x.fixed==='drill');o.drill=m.length;let sw=0;for(let i=0;i<60;i++){update(.1);if(m.some(x=>x.swing>0))sw++}o.sw=sw>0;o.still=m.every(x=>Math.hypot(x.x-x.post.x,x.y-x.post.y)<.6)}
    if(ot){regionJump(ot,7,6);o.att=mobs.filter(x=>x.fixed==='attend').length;o.kit=REGIONS[ot].hall.kit}return o});
  ok(`전각: 연무청(${h.dr}) 당원 ${h.drill} 연습 ${h.sw} 제자리 ${h.still} · ${h.kit}(${h.ot}) 시종 ${h.att}`,(h.drill===4&&h.sw&&h.still)&&(!h.ot||h.att===2));
  // 4. 점령된 본산엔 점령군이, 폐허(멸문)엔 아무도 없다
  const o=await p.evaluate(()=>{G.occ.hwasan={by:'마',y:0,life:1};regionJump('hq_hwasan_gate',20,24);const occ=mobs.filter(m=>m.fixed);const r={occ:occ.length,fac:[...new Set(occ.map(m=>m.d.fac))].join(),nm:occ[0]&&occ[0].name};delete G.occ.hwasan;
    G.pop.hwasan=0;popSync();regionJump('hq_hwasan_gate',20,24);r.dead=mobs.filter(m=>m.fixed).length;G.pop.hwasan=popBase(SECTS.hwasan);popSync();return r});
  ok(`점령: 점령군 ${o.occ}명 (${o.fac}, ${o.nm}) · 폐허 ${o.dead}명`,o.occ>=6&&o.fac==='마'&&/점령군/.test(o.nm)&&o.dead===0);
  // 5. 결전장: 내 편 16 · 적 20(고수 5) + 적장. 10초마다 양쪽 3명 증원(상한까지), 적장이 죽으면 멈춘다
  const w=await p.evaluate(()=>{for(const e of STORY.EV)P.story.pick[e.id]=e.ch.length-1;G.W.rel.정사=30;setPow('마',50);P.age=26;lastYear=25;update(.1);closePanels();act('wargo');const r={reg:REG,ally:mobs.filter(m=>m.warAlly).length,foe:mobs.filter(m=>m.raid&&!m.warChief).length,elite:mobs.filter(m=>m.raid&&!m.warChief&&m.d.elite).length};
    for(const m of mobs)if(m.raid&&!m.warChief&&Math.random()<.5)m.hp=0;mobs=mobs.filter(m=>m.hp>0);const f0=mobs.filter(m=>m.raid&&!m.warChief).length;for(let i=0;i<105;i++)runHooks('tick',.1);r.f0=f0;r.f1=mobs.filter(m=>m.raid&&!m.warChief).length;r.waves=G.war.cur.waves;
    G.war.cur.done=true;for(let i=0;i<105;i++)runHooks('tick',.1);r.f2=mobs.filter(m=>m.raid&&!m.warChief).length;r.total=mobs.length;return r});
  ok(`결전장(${w.reg}): 내 편 ${w.ally} 적 ${w.foe}(고수 ${w.elite}) · 적 ${w.f0}→10초 뒤 ${w.f1} (파도 ${w.waves}) · 적장 격파 뒤 ${w.f2} · 전체 ${w.total}명`,w.reg==='war_field'&&w.ally===16&&w.foe===20&&w.elite===5&&w.f1===w.f0+3&&w.waves===1&&w.f2===w.f1);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

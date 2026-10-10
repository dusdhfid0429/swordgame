// 군부와 황성: 북경 황성 → 황성 금위영 → 황궁(황제·대장군), 관군 적대 관계, 금군 가입·임무, 어전 포상, 죄인 추적
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const go=(id,x,y)=>p.evaluate(([id,x,y])=>{mobs=[];P.reg=id;loadRegion(id);P.x=x;P.y=y;P.path=null;P.gateLock=0;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;miniBase=null},[id,x,y]);
  // 1. 세력 구도: 군부가 네 번째 세력, 금군이 그 문파. 관군은 사파·마교와만 싸운다
  const f=await p.evaluate(()=>({al:!!ALLY.gunbu,sect:SECTS.geumgun&&SECTS.geumgun.al,fac:alFac('gunbu'),kinds:FAC_KIND['관'],
    foe:{jg:facFoe('정','관'),gj:facFoe('관','정'),sg:facFoe('사','관'),mg:facFoe('마','관'),gs:facFoe('관','사'),jm:facFoe('정','마'),js:facFoe('정','사')},ranks:SRANK.gunbu,mis:SMIS.gunbu.length}));
  ok(`군부 세력 ${f.al} · 금군 ${f.sect} · 세력 무인 ${f.kinds} · 직위 ${f.ranks.join('→')} · 임무 ${f.mis}`,f.al&&f.sect==='gunbu'&&f.fac==='관'&&f.kinds[0]==='관군'&&f.ranks.length===5&&f.mis>=4);
  ok(`적대: 정↔관 ${f.foe.jg}/${f.foe.gj} (서로 안 건드림), 사↔관 ${f.foe.sg}/${f.foe.gs}, 마→관 ${f.foe.mg}, 정→사 ${f.foe.js}`,!f.foe.jg&&!f.foe.gj&&f.foe.sg&&f.foe.gs&&f.foe.mg&&f.foe.js&&f.foe.jm);
  // 2. 북경이 황성: 성내 포털 → 황성 금위영 → 황궁. 황궁 태화전에 황제와 대장군
  const w=await p.evaluate(()=>{const bj=Object.keys(REGIONS).find(id=>REGIONS[id].lm&&REGIONS[id].lm.n==='북경'),R=REGIONS[bj];
    return{bj:R.name,portal:R.gates.some(g=>g.portal&&g.to==='hq_geumgun_gate'),chain:REGIONS.hq_geumgun.chain,gate:REGIONS.hq_geumgun_gate.name,hq:REGIONS.hq_geumgun.name,
      hall:REGIONS.hq_geumgun.halls[0].n,inside:REGIONS[REGIONS.hq_geumgun.halls[0].id].npcs.map(n=>n.n),prov:pvOfSect('geumgun'),post:postDlg().includes('황궁')}});
  ok(`${w.bj}: 포털 ${w.portal} → ${w.chain&&w.chain.join(' → ')} (${w.gate} / ${w.hq}), ${w.hall} 안에 ${w.inside.join('·')}, 하북성 ${w.prov}, 역참 ${w.post}`,
    w.bj==='북경 황성'&&w.portal&&w.chain.length===2&&w.hq==='황궁'&&w.hall==='태화전'&&w.inside.includes('황제')&&w.inside.includes('금군 대장군')&&w.prov==='hebei'&&w.post);
  // 3. 황궁은 걸을 수 있고 관군이 지킨다. 금위영 교장에는 금군 병졸
  await go('hq_geumgun',20.5,36.2);await p.waitForTimeout(300);
  const pal=await p.evaluate(()=>{for(let i=0;i<8;i++)spawnTick();let n=0,free=0;for(let y=3;y<=20;y++)for(let x=9;x<=31;x++){n++;if(walk(x,y))free++}
    return{free:free/n,walk:walkAt(20.5,36.2)&&walkAt(20.5,30),guards:mobs.filter(m=>m.d.fac==='관').length,gold:builds.filter(b=>b.rc==='gold').length,peace:mobs.filter(m=>m.d.fac==='관').every(m=>peaceful(m))}});
  ok(`황궁: 마당 ${Math.round(pal.free*100)}% 걸을 수 있음, 관군 ${pal.guards}명(정파 출신에게 평화 ${pal.peace}), 금기와 전각 ${pal.gold}`,pal.free>.6&&pal.walk&&pal.guards>=4&&pal.peace&&pal.gold>=3);
  await go('hq_geumgun_gate',20.5,36.2);await p.waitForTimeout(300);
  const yd=await p.evaluate(()=>{for(let i=0;i<8;i++)spawnTick();return{zone:regionAt(20,15),own:mobs.filter(m=>m.sect==='geumgun').length,steward:npcsHere().some(n=>n.steward==='geumgun')}});
  ok(`금위영: ${yd.zone}, 금군 ${yd.own}명, 총관 ${yd.steward}`,yd.zone==='금군 교장'&&yd.own>=3&&yd.steward);
  // 4. 사파 사람에게 관군은 적, 업보 -100 아래 죄인에게도 적
  const hos=await p.evaluate(()=>{const g=mkFac('관',0,P.x+2,P.y,'geumgun');const a=mobFoeP(g);P.side='사';const b=mobFoeP(g);P.side='정';P.evil=150;const c=mobFoeP(g);P.evil=0;return{a,b,c}});
  ok(`관군: 정파에게 ${hos.a}, 사파에게 ${hos.b}, 업보 -150 죄인에게 ${hos.c}`,!hos.a&&hos.b&&hos.c);
  // 5. 가입과 알현·어전 포상
  const j=await p.evaluate(()=>{const s=SECTS.geumgun;P.fame=0;const no=joinBlock(s);P.fame=40;P.age=20;const yes=joinBlock(s);return{no,yes}});
  ok(`금군 가입: 명성 0 → "${j.no}", 명성 40 → ${j.yes===null?'가능':j.yes}`,!!j.no&&j.yes===null);
  await go('in_hq_geumgun_0',7.5,9);await p.waitForTimeout(200);
  const e=await p.evaluate(()=>{const em=npcsHere().find(n=>n.emperor);P.fame=0;const a=pNpc(em).includes('물러가라');P.fame=150;const b=pNpc(em).includes('용상');
    P.sect='geumgun';P.mtot={geumgun:500};P.merit={geumgun:0};const c=pNpc(em).includes('data-act="imperial"');const s0=P.silver,f0=P.fame;sectAct('imperial');const again=pNpc(em).includes('이미 받았다');
    return{a,b,c,silver:P.silver-s0,fame:P.fame-f0,item:P.bag.some(i=>i.name==='어사패'),again,rank:rankName('geumgun')}});
  ok(`황제: 명성 0 막힘 ${e.a}, 명성 150 알현 ${e.b}, 금군 ${e.rank} 포상 버튼 ${e.c} → 은자 +${e.silver} 명성 +${e.fame} 어사패 ${e.item}, 두 번은 안 됨 ${e.again}`,e.a&&e.b&&e.c&&e.silver===500&&e.fame===100&&e.item&&e.again);
  // 6. 성도마다 군부 연락관, 세력 창
  const li=await p.evaluate(()=>{const cap=Object.values(REGIONS).find(R=>R.city==='cap'&&R.npcs.some(n=>n.id==='gunbu'));const n=cap&&cap.npcs.find(n=>n.id==='gunbu');return{cap:cap&&cap.name,html:n?pNpc(n).includes('금군'):false}});
  ok(`성도 군부 연락관 (${li.cap}) → 세력 창에 금군 ${li.html}`,!!li.cap&&li.html);
  await p.evaluate(()=>{P.sect=null;P.hp=P.maxHp;mobs=[];loadRegion('gaebong')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

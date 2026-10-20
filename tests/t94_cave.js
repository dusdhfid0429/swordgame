// v157: 동굴 — 산 맵마다 굴 하나(입구 앞은 걸어서 닿는다), 혈교 지부(성 소굴)·총단, 비밀 문파 비동, 보물상자는 한 생에 한 번, 굴 속에서 불러와도 입구로 나온다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const k=await p.evaluate(()=>{const by={};for(const id in REGIONS)if(id.startsWith('cv_')){const t=REGIONS[id].cave.kind;by[t]=(by[t]||0)+1}return by});
  ok(`동굴 수 ${JSON.stringify(k)}`,k.wild>=60&&k.branch===5&&k.hq===1&&k.secret===3);
  // 화산 명소 맵: 입구 자리, 출입구, 앞 칸이 열림
  const a=await p.evaluate(()=>{enterRegion('lm_shaanxi_2',10,10);const s=CAVE_SPOT[REG],g=REGION().gates.find(g=>g.to===caveId(REG));return{s,g:!!g,m:objs[s.j][s.i],w:walk(s.fx,s.fy),th:s.th}});
  ok(`화산 입구 ${JSON.stringify(a.s)} 출입구 ${a.g} 바위 ${a.m} 앞 칸 ${a.w}`,a.g&&a.m==='cmouth'&&a.w&&a.th==='stone');
  await p.evaluate(()=>{const g=REGION().gates.find(g=>g.to===caveId(REG));travel(g)});await p.waitForTimeout(800);
  const b1=await p.evaluate(()=>{for(let i=0;i<4;i++)spawnTick();const nm=mobs.length,n=nodes.find(n=>n.t==='cchest');P.caveGot=null;caveChestOpen(n);const got=!!P.caveGot[REG];enterRegion(REG,P.x,P.y);
    return{reg:REG,dark:REGION().cave.dark,mobs:nm,got,cd:nodes.find(n=>n.t==='cchest').cd,walls:objs.flat().filter(o=>o==='cwall').length}});
  ok(`굴 속 ${b1.reg}: 몹 ${b1.mobs}, 벽 ${b1.walls}, 상자 열고 다시 오면 빈 상자 ${b1.cd}`,b1.reg==='cv_lm_shaanxi_2'&&b1.mobs>0&&b1.walls>50&&b1.got&&b1.cd>0);
  await p.evaluate(()=>travel(REGION().gates[0]));await p.waitForTimeout(800);
  const c1=await p.evaluate(()=>({reg:REG,d:Math.hypot(P.x-CAVE_SPOT[REG].fx-.5,P.y-CAVE_SPOT[REG].fy-.5)}));
  ok(`나오면 입구 앞 ${c1.reg} ${c1.d.toFixed(2)}`,c1.reg==='lm_shaanxi_2'&&c1.d<.1);
  // 한 번도 안 간 산의 굴에서 (저장을 굴 속에서 불러온 셈) 나와도 입구 앞으로
  await p.evaluate(()=>{enterRegion('cv_lm_hubei_2',19.5,34.5);travel(REGION().gates[0])});await p.waitForTimeout(900);
  const d1=await p.evaluate(()=>({reg:REG,s:CAVE_SPOT[REG],x:P.x,y:P.y}));
  ok(`처음 여는 산에서 나와도 입구 앞 ${d1.reg}`,d1.reg==='lm_hubei_2'&&d1.s&&Math.hypot(d1.x-d1.s.fx-.5,d1.y-d1.s.fy-.5)<.1);
  // 혈교 지부: 소굴 맵에 굴 출입구, 두목은 굴 안
  const e1=await p.evaluate(()=>{const L=REGIONS.pv_henan.lairs.find(l=>l.cave),w=pvWin('henan',Math.floor(L.x/40),Math.floor(L.y/40)),W=REGIONS[w];
    enterRegion(w,20,20);const s=CAVE_SPOT[w];return{n:L.n,gate:W.gates.some(g=>g.to===caveId(w)),out:W.bosses.map(b=>b[0]),inn:REGIONS[caveId(w)].bosses.map(b=>b[0]),m:objs[s.j][s.i],w:walk(s.fx,s.fy)}});
  ok(`${e1.n}: 출입구 ${e1.gate}, 바깥 두목 [${e1.out}] 굴 두목 [${e1.inn}], 입구 ${e1.m}`,e1.gate&&!e1.out.includes('혈교장로')&&e1.inn.includes('혈교장로')&&e1.m==='cmouth'&&e1.w);
  const f1=await p.evaluate(()=>({hq:REGIONS.cv_lm_guizhou_3.bosses.map(b=>b[0]),gw:REGIONS.cv_hq_gwiyeong.name,gws:REGIONS.cv_hq_gwiyeong.spawns.map(s=>s[0])}));
  ok(`혈교 총단 두목 [${f1.hq}], ${f1.gw} [${f1.gws}]`,f1.hq.includes('혈교주')&&f1.hq.includes('혈교장로')&&f1.gws.length>=2);
  // 테마마다 그리기
  const g1=await p.evaluate(()=>{const out=[];for(const id of['cv_lm_shaanxi_2','cv_lm_guizhou_3','cv_hq_gwiyeong','cv_lm_sichuan_2']){enterRegion(id,REGIONS[id].size/2,REGIONS[id].size-3);for(let i=0;i<3;i++){time+=.1;draw()}out.push(REGIONS[id].cave.th)}return out});
  ok(`테마 그리기 ${g1}`,g1.includes('ice')&&g1.includes('blood')&&g1.includes('shadow'));
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

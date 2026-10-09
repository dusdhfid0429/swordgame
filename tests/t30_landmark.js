// 무림전도 땅이름: 주요도시·명소·산·지형이 제 성 맵 제자리에 있고, 문파 입구는 지도 위 문파 자리에
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const cnt=await p.evaluate(()=>{const by={c:0,s:0,m:0,t:0};let n=0,want=0;for(const k of Object.keys(PROV)){want+=(LM_DATA[k]||[]).length;for(const m of REGIONS[pvId(k)].marks){by[m.t]++;n++}}
    const win=Object.values(REGIONS).filter(R=>R.win).reduce((a,R)=>a+R.marks.length,0);return{n,want,by,win}});
  ok(`땅이름 ${cnt.n}/${cnt.want}곳 (도시 ${cnt.by.c} · 명소 ${cnt.by.s} · 산 ${cnt.by.m} · 지형 ${cnt.by.t}), 맵에 나눠진 수 ${cnt.win}`,cnt.n===cnt.want&&cnt.n>140&&cnt.win===cnt.n);
  // 지도 순서 그대로: 북경은 석가장보다 북쪽, 낙양은 정주보다 서쪽, 돈황은 란주보다 서쪽
  const ord=await p.evaluate(()=>{const at=(k,n)=>REGIONS[pvId(k)].marks.find(m=>m.n===n);
    return{bj:at('hebei','북경').y<at('hebei','석가장').y,ly:at('henan','낙양').x<at('henan','정주').x,dh:at('gansu','돈황').x<at('gansu','란주').x,
      gz:at('guangdong','광주').y>at('guangdong','단하산').y}});
  ok(`지도 순서 유지 ${JSON.stringify(ord)}`,Object.values(ord).every(Boolean));
  // 도시·명소·산은 각각 40×40 맵 한 장, 들판 맵에는 입구만 (2026-10-09 사용자 결정)
  const lm=await p.evaluate(()=>{const bad=[];let n=0;for(const k of Object.keys(PROV))for(const m of REGIONS[pvId(k)].marks){if(m.t==='t'){if(m.gate)bad.push(m.n);continue}
      n++;const L=REGIONS[m.gate];if(!L||L.size!==40)bad.push(m.n+'(맵없음)');
      const w=Object.values(REGIONS).filter(R=>R.win&&R.win.k===k&&R.gates.some(g=>g.to===m.gate)).length;if(w!==1)bad.push(m.n+'(입구'+w+')')}
    return{n,bad}});
  ok(`장소 맵 ${lm.n}장, 들판 맵마다 입구 하나 ${lm.bad.slice(0,6).join(' ')}`,lm.n===119&&lm.bad.length===0);
  // 문파는 짝 장소 맵 안 포털로: 화산 안 화산파, 아미산 안 아미파, 북경 안 하북팽가
  const pr=await p.evaluate(()=>{const out={};for(const[sid,k,mn]of[['hwasan','shaanxi','화산'],['emei','sichuan','아미산'],['mudang','hubei','무당산'],['paeng','hebei','북경'],['kunlun','qinghai','곤륜산']]){
    const F=REGIONS[pvId(k)],m=F.marks.find(q=>q.n===mn),L=REGIONS[m.gate],first=REGIONS['hq_'+sid].chain[0],back=REGIONS[first].gates.find(g=>g.to===m.gate);
    out[mn]=!!L.gates.find(g=>g.to===first&&g.portal)&&!F.gates.some(g=>g.to===first)&&!!back}return out});
  ok(`문파 포털이 장소 맵 안에 ${JSON.stringify(pr)}`,Object.values(pr).every(Boolean));
  // 장소 맵마다 아래 출입구에서 포털·정상까지 걸어서 닿는가
  const walkAll=await p.evaluate(()=>{const bad=[];for(const[id,R]of Object.entries(REGIONS)){if(!R.lm)continue;loadRegion(id);
      const seen=new Set(['20,36']),q=[[20,36]];while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=[x+dx,y+dy];if(!seen.has(k+'')&&walk(k[0],k[1])){seen.add(k+'');q.push(k)}}}
      const near=(px,py)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen.has([Math.floor(px)+dx,Math.floor(py)+dy]+''))return true;return false};
      for(const g of R.gates)if(!near(g.x,g.y))bad.push(R.name+'→'+g.label);if(R.lm.t==='m'&&!near(20,6))bad.push(R.name+' 정상');if(builds.length<1)bad.push(R.name+' 전각')}
    loadRegion('gaebong');return bad});
  ok(`장소 맵 모두 포털·정상까지 걸어서 닿음 ${walkAll.slice(0,6).join(' / ')}`,walkAll.length===0);
  // 섬서성 들판 → 화산 → 중턱 포털 → 화산파 산문 → 나오면 화산 중턱
  await p.evaluate(()=>{const g=REGIONS.pv_shaanxi.gates.find(q=>q.label==='화산');travel(g)});await p.waitForTimeout(1200);
  const h1=await p.evaluate(()=>({reg:REGION().name,zone:regionAt(Math.floor(P.x),Math.floor(P.y))}));
  await p.evaluate(()=>{const g=REGION().gates.find(q=>q.portal);P.x=g.x-1.5;P.y=g.y+1.5;const t=iso(P.x,P.y-2);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(900);
  const h2=await p.evaluate(()=>regionAt(Math.floor(P.x),Math.floor(P.y)));await p.screenshot({path:shot('lm_huashan')});
  await p.evaluate(()=>{const g=REGION().gates.find(q=>q.portal);P.gateLock=0;P.x=g.x;P.y=g.y;gateTick()});await p.waitForTimeout(1200);
  const h3=await p.evaluate(()=>REG);
  await p.evaluate(()=>{P.gateLock=0;travel(REGION().gates.find(g=>g.y>30))});await p.waitForTimeout(1200);
  const h4=await p.evaluate(()=>({name:REGION().name,zone:regionAt(Math.floor(P.x),Math.floor(P.y)),walk:walkAt(P.x,P.y)}));
  ok(`${h1.reg}(${h1.zone}) → '${h2}' → ${h3} → 나오면 ${h4.name}(${h4.zone})`,h1.reg==='화산'&&h2.includes('화산파')&&h3==='hq_hwasan_gate'&&h4.name==='화산'&&h4.zone.includes('중턱')&&h4.walk);
  await p.evaluate(()=>{P.x=20.5;P.y=7.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(800);await p.screenshot({path:shot('lm_huashan_top')});
  // 북경 성내, 함곡관
  await p.evaluate(()=>{const m=REGIONS.pv_hebei.marks.find(q=>q.n==='북경');mobs=[];P.reg=m.gate;loadRegion(m.gate);P.x=20.5;P.y=22.5;spawnTick();const t=iso(P.x,P.y-3);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(900);
  ok('북경 성내에 하북팽가 포털',await p.evaluate(()=>REGION().gates.some(g=>g.portal&&g.label.includes('팽가'))&&regionAt(20,20).includes('성내')));
  await p.screenshot({path:shot('lm_beijing')});
  await p.evaluate(()=>{const m=REGIONS.pv_henan.marks.find(q=>q.n==='함곡관');P.reg=m.gate;loadRegion(m.gate);P.x=20.5;P.y=20.5;const t=iso(P.x,P.y-2);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(900);
  await p.screenshot({path:shot('lm_hangu')});
  // 지형은 들판 맵에: 청해호 물, 대막 모래
  const look=await p.evaluate(()=>{const cntG=(C,m,f,r)=>{let n=0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const t=C.map[Math.floor(m.y)+j]&&C.map[Math.floor(m.y)+j][Math.floor(m.x)+i];if(t&&f(t.g))n++}return n};
    const Q=pvFull('qinghai'),lake=cntG(Q,REGIONS.pv_qinghai.marks.find(m=>m.n==='청해호'),g=>g===2||g===3,4);
    const X=pvFull('xinjiang'),sand=cntG(X,REGIONS.pv_xinjiang.marks.find(m=>m.n==='대막'),g=>g===12,5);PV_CACHE.k=null;return{lake,sand}});
  ok(`들판 맵 지형: 청해호 물 ${look.lake}칸, 대막 모래 ${look.sand}칸`,look.lake>=15&&look.sand>=40);
  // 천하 지도 정보에 땅이름
  await p.evaluate(()=>{openPanel('world');wSel='hebei';renderOpen()});await p.waitForTimeout(300);
  ok('천하 지도 하북성 정보에 북경·오태산',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('북경')&&t.includes('오태산')&&t.includes('주요도시')}));
  await p.screenshot({path:shot('lm_world')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

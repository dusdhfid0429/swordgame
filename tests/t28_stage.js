// 본산 여러 맵: 대문파 4, 중견문파 2, 소문파 1, 마교 8. 모든 맵이 이어지고 걸어서 끝까지 닿는가
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const cnt=await p.evaluate(()=>{const want={big:4,mid:2,small:1,one:8},bad=[],tiers={};
    for(const s of Object.values(SECTS)){const ch=REGIONS[hqId(s)].chain||[hqId(s)];tiers[s.tier]=(tiers[s.tier]||0)+1;if(ch.length!==want[s.tier])bad.push(s.n+ch.length)}
    return{bad,tiers}});
  ok(`맵 수: 대문파 4·중견 2·소문파 1·마교 8 (${JSON.stringify(cnt.tiers)}) 어긋남 ${cnt.bad.join(',')}`,cnt.bad.length===0&&cnt.tiers.mid===10);
  // 성 지도 출입구 → 첫 맵, 첫 맵 → 성
  const pv=await p.evaluate(()=>{const bad=[];for(const s of Object.values(SECTS)){if(s.id==='shaolin')continue;const ch=REGIONS[hqId(s)].chain||[hqId(s)],k=pvOfSect(s.id),pg=REGIONS['pv_'+k].gates.filter(g=>ch.includes(g.to));
    if(pg.length!==1||pg[0].to!==ch[0]||!REGIONS[ch[0]].gates.some(g=>g.to==='pv_'+k))bad.push(s.n)}return bad});
  ok(`성 지도와 첫 맵이 서로 이어짐 (어긋남 ${pv.length})`,pv.length===0);
  // 모든 맵을 열어 아래 출입구에서 위 출입구·NPC까지 걸어서 닿는가
  const walkAll=await p.evaluate(()=>{const bad=[];let n=0;const ids=new Set;for(const s of Object.values(SECTS))for(const id of REGIONS[hqId(s)].chain||[])ids.add(id);
    for(const id of ids){if(id==='sungsan')continue;loadRegion(id);n++;const R=REGION(),bot=R.gates.find(g=>g.y>30)||{x:20.5,y:38.6};
      const seen=new Set,q=[[20,36]];seen.add('20,36');while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=[x+dx,y+dy];if(!seen.has(k+'')&&walk(k[0],k[1])){seen.add(k+'');q.push(k)}}}
      const near=(px,py)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen.has([Math.floor(px)+dx,Math.floor(py)+dy]+''))return true;return false};
      for(const g of R.gates)if(!near(g.x,g.y))bad.push(`${R.name}→${g.label}`);for(const m of R.npcs)if(!near(m.x,m.y))bad.push(`${R.name}:${m.n}`)}
    loadRegion('gaebong');return{n,bad}});
  ok(`맵 ${walkAll.n}개 모두 출입구·NPC까지 걸어서 닿음 ${walkAll.bad.slice(0,6).join(' / ')}`,walkAll.n>=60&&walkAll.bad.length===0);
  // 숭산(소림사)에서 위로 나한당까지
  const ss=await p.evaluate(()=>{loadRegion('sungsan');const g=REGION().gates.find(q=>q.to==='hq_shaolin_yard');
    const seen=new Set,st=REGION().npcs.find(n=>n.hq==='shaolin'),q=[[Math.floor(st.x),Math.floor(st.y)+1]];seen.add(q[0]+'');
    while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=[x+dx,y+dy];if(!seen.has(k+'')&&walk(k[0],k[1])){seen.add(k+'');q.push(k)}}}
    const r=g&&[0,1,-1].some(d=>seen.has([Math.floor(g.x)+d,Math.floor(g.y)]+'')||seen.has([Math.floor(g.x)+d,Math.floor(g.y)+1]+''));loadRegion('gaebong');return r});
  ok('숭산 소림사 뒤로 나한당 가는 길',ss);
  // 화산파: 성 → 산문 → 외원 → 본산 → 후산(제자만)
  await p.evaluate(()=>{P.silver=999;const g=REGIONS['pv_'+pvOfSect('hwasan')].gates.find(q=>q.to==='hq_hwasan_gate');travel(g)});await p.waitForTimeout(1200);
  const z=await p.evaluate(()=>({reg:REG,zone:regionAt(Math.floor(P.x),Math.floor(P.y))}));
  ok(`성에서 들어가면 ${z.zone}`,z.reg==='hq_hwasan_gate');
  await p.evaluate(()=>{P.x=20.5;P.y=24.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(800);await p.screenshot({path:shot('stage_gate')});
  await p.evaluate(()=>{travel(REGION().gates.find(g=>g.to==='hq_hwasan_outer'))});await p.waitForTimeout(1200);
  await p.evaluate(()=>{P.x=20.5;P.y=20.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(800);await p.screenshot({path:shot('stage_outer')});
  await p.evaluate(()=>openNpc(npcsHere().find(n=>n.steward)));await p.waitForTimeout(200);
  ok('외원 총관 창에 임무와 비급',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('임무')&&t.includes('고유 무공')}));
  await p.evaluate(()=>{closePanels();travel(REGION().gates.find(g=>g.to==='hq_hwasan'))});await p.waitForTimeout(1200);
  const bk=await p.evaluate(()=>{const g=REGION().gates.find(q=>q.to==='hq_hwasan_back');P.gateLock=0;P.x=g.x;P.y=g.y;gateTick();const blocked=REG==='hq_hwasan';P.sect='hwasan';P.gateLock=0;P.x=g.x;P.y=g.y;gateTick();return{blocked}});
  await p.waitForTimeout(1200);
  const bk2=await p.evaluate(()=>({reg:REG,elder:npcsHere().some(n=>n.elder==='hwasan')}));
  ok(`후산은 제자만: 막힘 ${bk.blocked}, 제자는 들어감 ${bk2.reg}`,bk.blocked&&bk2.reg==='hq_hwasan_back'&&bk2.elder);
  await p.evaluate(()=>openNpc(npcsHere().find(n=>n.elder)));await p.waitForTimeout(200);
  ok('후산 장로 창에 패시브·보법',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('패시브')||t.includes('보법')}));
  await p.evaluate(()=>{closePanels();P.x=20.5;P.y=12.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(800);await p.screenshot({path:shot('stage_back')});
  // 중견문파 남궁세가: 산문 → 본산
  const mid=await p.evaluate(()=>REGIONS.hq_namgung.chain.map(id=>REGIONS[id].name));
  ok(`중견문파 남궁세가: ${mid.join(' → ')}`,mid.length===2);
  // 연락관 목록에 중견문파 묶음
  await p.evaluate(()=>{loadRegion('gaebong');P.reg='gaebong';P.sect=null;openNpc(npcAt('jeong'))});await p.waitForTimeout(200);
  ok('정의맹 목록에 중견문파',await p.evaluate(()=>$('wbody').textContent.includes('중견문파')));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

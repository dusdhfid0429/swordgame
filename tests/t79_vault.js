// 문파 재화·침투·전각 NPC 순환 (v117): 금고가 해마다 쌓이고, 몰래 털거나 멸문 뒤 다 가져간다. 장로를 강제공격으로 끌어내 죽이면 공석, 3년 뒤 새 장로
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 금고: 처음 3해치, 해마다 규모·인원·질만큼 쌓이고 20해치에서 멈춘다. 소문파는 적게
  const v=await p.evaluate(()=>{paused=true;popInit();vaultInit();const s=SECTS.hwasan,inc0=vaultIncome(s),v0=sectVault('hwasan');runHooks('newYear');const inc=vaultIncome(s),v1=sectVault('hwasan');G.vault.hwasan=inc*30;runHooks('newYear');const inc2=vaultIncome(s),v2=sectVault('hwasan');
    const small=Object.values(SECTS).find(x=>x.tier==='small');return{inc0,inc,v0,v1,v2,cap:inc2*20,small:vaultIncome(small),smallN:small.n,big:inc}});
  ok(`화산파 금고: 해마다 ${v.inc0}→${v.inc}(인원 증가) · 처음 ${v.v0} → 1년 ${v.v1} → 상한 ${v.v2}/${v.cap} · ${v.smallN} ${v.small}`,v.inc0>=400&&v.v0===v.inc0*3&&v.v1===v.v0+v.inc&&v.v2===v.cap&&v.small<v.big);
  // 2. 장문인 전각 안에 금고 자리. 몰래 털기: 성공하면 30%, 같은 해엔 다시 못 턴다. 들키면 경비 4명·악업 +8
  const st=await p.evaluate(()=>{regionJump('hq_hwasan',20,20);const hid=REGION().halls[0].id;regionJump(hid,7,6);const n=nodes.find(x=>x.t==='vault');const o={hid,node:!!n,label:n&&vaultLabel(n)};G.vault.hwasan=1000;G.vaultHit={};
    const rr=Math.random;Math.random=()=>.99;const s0=P.silver;vaultOpen(n);o.took=P.silver-s0;o.left=G.vault.hwasan;vaultOpen(n);o.again=$('log').textContent.includes('삼엄');
    G.vaultHit={};Math.random=()=>0;const e0=P.evil;vaultOpen(n);Math.random=rr;o.guards=mobs.filter(m=>m.guard==='hwasan').length;o.angry=mobs.filter(m=>m.guard==='hwasan').every(m=>m.angry&&mobFoeP(m));o.evil=P.evil-e0;o.silver2=P.silver-s0;mobs=[];return o});
  ok(`금고 자리 ${st.node} (${st.hid}, ${st.label}): 성공 은자 +${st.took} 남은 ${st.left} 같은 해 ${st.again} · 발각: 경비 ${st.guards}명 적대 ${st.angry} 악업 +${st.evil} 은자 그대로 ${st.silver2===st.took}`,
    st.node&&st.label==='몰래 턴다'&&st.took===300&&st.left===700&&st.again&&st.guards===4&&st.angry&&st.evil===8&&st.silver2===st.took);
  // 3. 멸문: 금고를 통째로
  const d=await p.evaluate(()=>{G.pop.hwasan=0;popSync();const hid=REGION().hall?REG:REGION().halls[0].id;regionJump(hid,7,6);const n=nodes.find(x=>x.t==='vault');const s0=P.silver;const o={label:n&&vaultLabel(n),dead:REGION().dead};vaultOpen(n);o.took=P.silver-s0;o.left=G.vault.hwasan;G.pop.hwasan=popBase(SECTS.hwasan);popSync();return o});
  ok(`멸문 금고 (${d.label}, 폐허 ${d.dead}): 은자 +${d.took} 남은 ${d.left}`,d.label==='금고를 턴다'&&d.dead&&d.took===700&&d.left===0);
  // 4. 장로: 강제공격으로 치면 우두머리(직위 4, 생명 2배). 죽이면 공석·명성 +15·인원 감소. 맵을 다시 들어와도 공석. 3년 뒤 새 이름의 장로
  const e=await p.evaluate(()=>{regionJump('hq_hwasan',20,20);const M=REGION();const hid=M.halls.map(h=>h.id).find(id=>REGIONS[id].npcs.some(n=>n.elder));regionJump(hid,7,6);const n=REGION().npcs.find(x=>x.elder);const o={hid,name:n.n};
    o.noForce=npcOut(n);toggleForce(true);const m=npcOut(n);o.rank=m&&m.rank;o.key=m&&m.npcKey;o.hidden=!REGION().npcs.includes(n);o.hp=m&&m.maxHp;
    const f0=P.fame,p0=sectPop('hwasan');m.hp=1;damage(m,5,0,0,P);toggleForce(false);o.dead=!!(G.ndead&&G.ndead[o.key]);o.fame=P.fame-f0;o.pop=p0-sectPop('hwasan');
    regionJump('hq_hwasan',20,20);regionJump(hid,7,6);o.hidden2=!REGION().npcs.some(x=>x.elder);G.cal+=3;runHooks('newYear');o.back=REGION().npcs.find(x=>x.elder);o.newName=o.back&&o.back.n;o.cleared=!(G.ndead&&G.ndead[o.key]);return o});
  ok(`장로 ${e.name} (${e.hid}): 강제공격 없이 ${e.noForce} → 우두머리 직위 ${e.rank} 생명 ${e.hp} 키 ${e.key} 숨김 ${e.hidden} · 격살 공석 ${e.dead} 명성 +${e.fame} 인원 -${e.pop} 재입장 공석 ${e.hidden2} · 3년 뒤 "${e.newName}" 복귀 ${e.cleared}`,
    e.noForce===null&&e.rank===4&&e.hp>1000&&e.key==='hwasan/elder'&&e.hidden&&e.dead&&e.fame===15&&e.pop>=15&&e.hidden2&&!!e.back&&e.newName!==e.name&&/장로/.test(e.newName)&&e.cleared);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

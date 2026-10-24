// 전수 점검 (사용자 2026-10-24 "구매하다가도 꺼지고 무공이나 기술 등을 배우다가도 꺼지고 … 전수조사해"):
// 모든 지역의 모든 NPC 대화창과 주 메뉴 창을 열고, 보이는 버튼(data-act)을 하나씩 실제로 눌러 본다. 두 단계까지 들어간다.
// 페이지 오류·console.error·게임이 제목으로 튕김(playing=false)을 버튼 이름과 함께 적는다.
const {chromium}=require(process.env.PWPATH||'playwright');
const FROM=+(process.env.FROM||0),TO=+(process.env.TO||9999);
(async()=>{
  const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  const errs=[];let cur='';p.on('dialog',d=>d.dismiss().catch(()=>{}));
  p.on('pageerror',e=>errs.push({w:cur,m:'PE '+e.message,s:(e.stack||'').split('\n').slice(0,4).join(' | ')}));
  const slow=[];p.on('console',m=>{if(m.type()==='warning'&&m.text().startsWith('SLOW'))slow.push(m.text()+' @ '+cur);if(m.type()==='error')errs.push({w:cur,m:'CE '+m.text().slice(0,400)})});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(600);
  // SECT=문파 id 면 그 문파 제자(높은 경지·공적)로 시작한다. FILTER=정규식이면 그 지역만
  if(process.env.SECT)await p.evaluate(s=>{const S=SECTS[s];{const f=alFac(S.al);P.side=f==='마'?'사':f==='관'?P.side:f}P.sect=s;P.realm=5;P.age=30;(P.mpt=P.mpt||{});for(const k in MAENG)P.mpt[k]=5000;try{recalc()}catch(e){}},process.env.SECT);
  await p.evaluate(()=>{window.__boost=()=>{P.silver=99999;P.vit=99999;P.hp=P.maxHp;P.qi=P.maxQi;P.merit=P.merit||{};for(const k in SECTS)P.merit[k]=99999;if(P.bag.length>20)P.bag.length=20};__boost()});
  const regs=await p.evaluate(()=>Object.keys(REGIONS));
  const SKIP=/^(totitle|save|new|del|load|slot|jwa2|ctl|snd|wsel)/;
  const kicked=[];let clicks=0;
  // 지금 열린 창의 버튼 목록
  const btns=()=>p.evaluate(()=>[...document.querySelectorAll('#win:not([hidden]) [data-act]')].filter(b=>!b.disabled).map(b=>b.dataset.act));
  const press=async(a)=>{clicks++;const r=await p.evaluate(a=>{const el=[...document.querySelectorAll('#win:not([hidden]) [data-act]')].find(b=>b.dataset.act===a);if(!el)return'gone';
      const t0=performance.now();try{el.click()}catch(e){return'THROW '+e.message}const ms=performance.now()-t0;if(ms>150)console.warn('SLOW '+Math.round(ms)+'ms');return playing?'ok':'KICK'},a);
    if(r==='KICK'||r.startsWith('THROW'))kicked.push(cur+' → '+r);
    if(r==='KICK'){await p.evaluate(()=>{const t=document.querySelector('[data-s="new"]');if(t)t.click()});await p.waitForTimeout(100);
      await p.evaluate(()=>{const s=document.querySelector('[data-s="side:정"]');s&&s.click();const k=document.querySelector('[data-s="cls:검"]');k&&k.click();const st=document.querySelector('[data-s="start"]');st&&st.click()});await p.waitForTimeout(300);await p.evaluate(()=>__boost())}
    return r};
  // 창 하나를 열고 그 안의 버튼을 두 단계까지 누른다
  const sweep=async(label,open,arg)=>{
    const ok=await p.evaluate(open,arg);if(!ok)return;let top=await btns();const seen=new Set();
    for(const a of top){if(SKIP.test(a)||seen.has(a))continue;seen.add(a);cur=label+' · '+a;
      await p.evaluate(open,arg);await press(a);
      const sub=(await btns()).filter(x=>!SKIP.test(x)&&!top.includes(x)&&!seen.has(x)).slice(0,25);
      for(const s of sub){seen.add(s);cur=label+' · '+a+' › '+s;await p.evaluate(open,arg);await press(a).catch(()=>{});await press(s)}
      await p.evaluate(()=>{__boost();for(let i=0;i<3;i++){time+=.05;try{runHooks('tick',.05);update(.05);draw()}catch(e){console.error('tick after: '+e.message)}}})}};
  // 주 메뉴 창
  await p.evaluate(()=>regionJump('gaebong',20,20));
  for(const id of['quest','char','arts','bag','ally','life','hist','house','help','menu','world','logs','story'])
    await sweep('창:'+id,id=>{try{closePanels();__boost();openPanel(id);return!!panel}catch(e){console.error('open '+id+': '+e.message);return false}},id).catch(e=>errs.push({w:'창:'+id,m:'X '+e.message}));
  // 지역마다 NPC
  let ri=0;
  for(const r of regs.slice(FROM,TO).filter(r=>!process.env.FILTER||new RegExp(process.env.FILTER).test(r))){ri++;
    const n=await p.evaluate(r=>{try{closePanels();regionJump(r,Math.min(N-2,20),Math.min(NH-2,20));return npcsHere().length}catch(e){console.error('jump '+r+': '+e.message);return 0}},r);
    for(let i=0;i<n;i++){const nm=await p.evaluate(i=>{const x=npcsHere()[i];return x&&(x.name||x.id)},i);
      await sweep(r+' / '+nm,i=>{try{closePanels();__boost();const x=npcsHere()[i];if(!x)return false;openNpc(x);return panel==='npc'}catch(e){console.error('openNpc: '+e.message);return false}},i).catch(e=>errs.push({w:r+' '+nm,m:'X '+e.message}))}
    if(ri%20===0)console.log(`.. ${ri}/${regs.length} 지역, 누름 ${clicks}, 오류 ${errs.length}`)}
  console.log(`누름 ${clicks}, 오류 ${errs.length}, 튕김 ${kicked.length}`);
  const uniq={};for(const e of errs){const k=e.m.slice(0,160);(uniq[k]=uniq[k]||{n:0,w:e.w,s:e.s}).n++}
  for(const[k,v]of Object.entries(uniq))console.log(`ERR x${v.n} ${k}\n    @ ${v.w}${v.s?'\n    '+v.s:''}`);
  slow.sort((a,b)=>parseInt(b.slice(5))-parseInt(a.slice(5)));for(const k of slow.slice(0,30))console.log(k);
  for(const k of[...new Set(kicked)].slice(0,40))console.log('KICK '+k);
  await b.close()})();

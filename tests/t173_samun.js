// v257 사문 호칭·항렬 (동훈님 2026-11-12, 적용 계획 PR3): 사부·사백·사숙·사조·사형·사제, 출가 법명·도호(돌림자), 이름표
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 사부의 제자일 때: 사부·사백·사숙·사조, 동기 서열로 사형·사제
  const r1=await p.evaluate(()=>{const s=Object.values(SECTS).find(s=>sideOk(s.al)&&sabuOn(s)&&sbMasters(s.id).length>=3);window.T={sid:s.id};P.sect=s.id;
    P.sabu={sid:s.id,coh:['갑','을','병','정','무'].map(n=>({n,cls:'검'})),ord:['갑','을','@','병','정','무'],st:'disc',m:1,off:-1,step:0,late:0,dj:0,djCool:0};
    return{m:[0,1,2].map(k=>smMaster(s.id,k)).join(),head:smHead(s.id),up:smCoh('을'),dn:smCoh('병'),other:(P.sect=null,smMaster(s.id,0)),back:(P.sect=s.id,1)}});
  ok(`제자: 사부들 ${r1.m} · 장문인 ${r1.head} · 위 동기 ${r1.up} · 아래 동기 ${r1.dn} · 남의 문파면 '${r1.other}'`,r1.m==='사백,사부,사숙'&&r1.head==='사조'&&r1.up==='사형'&&r1.dn==='사제'&&r1.other==='');
  // 2. 공통 길: 사부들은 모두 사숙, 장문인은 장문인
  const r2=await p.evaluate(()=>{P.sabu.st='common';P.sabu.m=-1;return{m:[0,1,2].map(k=>smMaster(T.sid,k)).join(),head:smHead(T.sid)}});
  ok(`공통 길: 사부들 ${r2.m} · 장문인 ${r2.head}`,r2.m==='사숙,사숙,사숙'&&r2.head==='장문인');
  // 3. 창: 서열 줄에 (사형)(사제), 사부 목록에 사백·사부, 장문인 대화 첫머리에 사조
  const r3=await p.evaluate(()=>{P.sabu.st='disc';P.sabu.m=1;const s=SECTS[T.sid];const ord=sbOrdHtml(),hq=hqDlg({hq:T.sid,n:'장문인'});P.sabu.st='pick';const card=sabuCard(s,true);P.sabu.st='disc';
    return{ord:ord.includes('(사형)')&&ord.includes('(사제)'),card:card.includes('사숙'),hq:hq.includes('사조')}});
  ok(`창: 서열 줄 ${r3.ord} · 사부 고르기 목록에 사숙 ${r3.card} · 장문인 대화 사조 ${r3.hq}`,r3.ord&&r3.card&&r3.hq);
  // 4. 출가: 불문은 셋째 세대 돌림자 '혜', 도문(종남)은 '명'. 이름표가 법명으로
  const r4=await p.evaluate(()=>{const out={};for(const sid of['shaolin','jongnam']){if(!SECTS[sid])continue;P.dname=null;P.sect=sid;P.monk=sid;runHooks('sectAct',{a:'kmonk',x:sid,y:undefined,done:false});out[sid]=P.dname}
    hud();return{...out,nm:document.getElementById('nm')?document.getElementById('nm').textContent:P.dname,keep:(()=>{const d=P.dname;runHooks('sectAct',{a:'kmonk',x:'jongnam'});return P.dname===d})()}});
  ok(`출가: 소림 ${r4.shaolin} · 종남 ${r4.jongnam} · 이름표 ${r4.nm} · 다시 출가해도 그대로 ${r4.keep}`,/^혜/.test(r4.shaolin)&&/^명/.test(r4.jongnam)&&r4.nm.includes(r4.jongnam)&&r4.keep);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

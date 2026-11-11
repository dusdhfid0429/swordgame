// v247 참오·변초·자득 (동훈님 2026-11-11 "무공서를 배우는 용도 말고도 창안 조각으로" "등급에 따라 소모처를 선택적으로" "돈오로 사용 중인 무공을 커스텀"):
// 무공서를 읽지 않고 등급별 쓰임(창안 조각·숙련·깨달음·심득)으로 녹이고, 심득으로 초식을 고치고, 다 고치면 자득
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);await p.waitForFunction(()=>playing);
  // 1. 하승 창법 비급: 참오 단추 → 창안 조각·숙련만, 조각 고르면 책이 사라지고 P.mkp[0]+1
  const r1=await p.evaluate(()=>{mobs=[];P.bag=[];const id='정창1',a=ARTS[id];P.bag.push(mkBook(id,0));const it=P.bag[0];
    openPanel('bag');const btn=!!document.querySelector(`[data-act="chask:${it.id}"]`);act('chask:'+it.id);
    const opts=[...document.querySelectorAll('#chask [data-act^="chdo:"]')].map(e=>e.dataset.act.split(':')[2]);
    act(`chdo:${it.id}:pc`);closePanels();return{g:a.grade||0,btn,opts:opts.join(','),bag:P.bag.length,mkp:(P.mkp||{})[a.grade||0]}});
  ok(`하승 비급 참오 단추 ${r1.btn}, 쓰임 ${r1.opts}, 조각 고르면 책 ${r1.bag}권 · 조각 ${r1.mkp}`,r1.g===0&&r1.btn&&r1.opts==='pc,ms'&&r1.bag===0&&r1.mkp===1);
  // 2. 상승 비급: 깨달음·심득까지. 깨달음은 같은 초식이면 한 번만
  const r2=await p.evaluate(()=>{const a=Object.values(ARTS).find(x=>x.sect&&!x.made&&(x.grade||0)===2&&x.forms.length>1);
    const e0=P.enl||0;P.bag=[mkBook(a.id,0),mkBook(a.id,0),mkBook(a.id,1)];const ids=P.bag.map(i=>i.id);
    const opts=chOpts(P.bag[0]).map(o=>o.k).join(',');act(`chdo:${ids[0]}:en`);const e1=P.enl;
    const twice=chOpts(P.bag.find(i=>i.id===ids[1])).find(o=>o.k==='en').why;act(`chdo:${ids[1]}:en`);const kept=P.bag.some(i=>i.id===ids[1]);
    const s0=P.sd||0;act(`chdo:${ids[2]}:sd`);return{opts,de:+(e1-e0).toFixed(2),twice,kept,ds:(P.sd||0)-s0}});
  ok(`상승 쓰임 ${r2.opts}, 깨달음 +${r2.de}, 같은 초식 두 번째는 막힘(${r2.twice}) 책 남음 ${r2.kept}, 심득 +${r2.ds}`,r2.opts==='pc,ms,en,sd'&&r2.de>0&&!!r2.twice&&r2.kept&&r2.ds===1);
  // 3. 숙련: 펼치는 무공 숙련이 오른다
  const r3=await p.evaluate(()=>{const id=ARTS['정검0'].id;P.arts[id]={p:10,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.bag=[mkBook('정창1',1)];act(`chdo:${P.bag[0].id}:ms`);return{p:P.arts[id].p,bag:P.bag.length}});
  ok(`숙련 고르면 펼치는 무공 숙련 10 → ${r3.p.toFixed(1)}`,r3.p>10&&r3.bag===0);
  // 4. 돈오(숙련 100)에 심득
  const r4=await p.evaluate(()=>{const id=ARTS['정검0'].id;P.arts[id].p=99.99;const s0=P.sd||0;gainMast(id,50);return{p:P.arts[id].p,ds:(P.sd||0)-s0}});
  ok(`돈오에 심득 +${r4.ds}`,r4.p>=100&&r4.ds===3);
  // 5. 변초: 숙련·심득 조건, 펼칠 때 위력·빠르기·범위가 덧입혀지고 ARTS는 그대로. 다 고치면 자득·필살기 배율
  const r5=await p.evaluate(()=>{const id=ARTS['정검1'].id,a=ARTS[id];P.arts[id]={p:20,f:a.forms.map(()=>true)};P.cur=id;P.sd=0;
    const w0=bcWhy(id,0,'m');P.arts[id].p=40;const w1=bcWhy(id,0,'m');P.sd=200;
    openPanel('arts');act('bcopen:'+id);const shown=!!document.querySelector(`[data-act="bcdo:${id}:0|m"]`);act(`bcdo:${id}:0|m`);closePanels();
    const f0=a.forms[0],f=bcForm(id,0,f0);const ri=a.forms.findIndex(q=>q.rad||q.len);
    let seen=null;const ex0=exec;exec=(ff,e,X)=>{seen=ff};P.fcd=[0,0,0,0,0,0];P.gcd=0;P.qi=P.maxQi=9999;useForm(0,true);exec=ex0;
    P.arts[id].p=100;for(let i=0;i<a.forms.length;i++)for(const k of ['m','cd','rg'])bcDo(id,i,k==='rg'&&!(a.forms[i].rad||a.forms[i].len)?'m':k);
    const done=a.forms.every((q,i)=>bcSteps(id,i).length===3);
    return{w0,w1,shown,m:+(f.m/f0.m).toFixed(2),same:a.forms[0].m===f0.m,used:seen&&+(seen.m/f0.m).toFixed(2),done,jd:jdOn(id),ult:jdUlt(id),bad:bcDo(id,0,'m'),tag:(openPanel('arts'),$('wbody').textContent.includes('자득'))}});
  ok(`변초: 숙련 모자람 '${r5.w0}' · 심득 모자람 '${r5.w1}' · 단추 ${r5.shown} · 위력 ×${r5.m}, 펼칠 때 ×${r5.used}, ARTS 그대로 ${r5.same}`,r5.w0.includes('숙련')&&r5.w1.includes('심득')&&r5.shown&&r5.m===1.12&&r5.used===1.12&&r5.same);
  ok(`모든 초식 3단 → 자득 ${r5.jd} · 필살기 ×${r5.ult} · 4단 안 됨 · 무공 창 표시 ${r5.tag}`,r5.done&&r5.jd&&r5.ult===1.25&&r5.bad===false&&r5.tag);
  // 6. 창안 조각이 재료 자리를 대신하고 창안하면 사라진다
  await p.evaluate(()=>{closePanels();P.arts={};for(let i=0;i<3;i++){const id=ARTS['정검'+i].id;P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)}}P.cur=ARTS['정검0'].id;P.bag=[];P.mkp={0:2}});
  const r6=await p.evaluate(()=>{const g0=mkGroups().length;P.mkp={0:3,1:3};const g=mkGroups();return{g0,g:g.map(x=>x.cls+x.g+':'+x.ids.length+'+'+x.subs.length).join(),n:g[0]&&mkSrcN(g[0]).join('·'),
    row:(openTrain(),TRN.innerText.includes('창안 조각 2자리'))}});
  ok(`조각 2장이면 묶음 ${r6.g0}, 하승 3 + 중승 3 → ${r6.g} (${r6.n}), 수련 창 표시 ${r6.row}`,r6.g0===0&&r6.g==='검0:3+2'&&/하승 조각 3/.test(r6.n)&&/중승 조각 3/.test(r6.n)&&r6.row);
  await p.evaluate(()=>{closeTrain();P.realm=5;P.vit=800;P.inj=0;mobs=[];P.sect='hwasan';P.mtot={hwasan:0};postGo('hq_hwasan')});await p.waitForTimeout(1500);
  await p.evaluate(()=>{mobs=[];window.__noPrompt=1;const R=Math.random;Math.random=()=>0;startTrain('mk:검:0');window.__restore=()=>{Math.random=R}});
  await p.waitForFunction(()=>!trnBusy,null,{timeout:60000});await p.waitForTimeout(200);
  const r7=await p.evaluate(()=>{window.__restore();const id=Object.keys(P.arts).find(k=>k.startsWith('mk_'));return{id,mkp:JSON.stringify(P.mkp),sub:G.made[id]&&G.made[id].sub}});
  ok(`창안 ${r7.id}, 조각 남음 ${r7.mkp}`,!!r7.id&&r7.mkp==='{"0":0,"1":0}'&&!(r7.sub||[]).some(x=>x==null));
  // 7. 저장·불러오기 뒤에도 조각·심득·변초·자득
  const r8=await p.evaluate(()=>{P.mkp={2:4};P.sd=7;const bc=JSON.stringify(P.bc),jd=JSON.stringify(P.jd);saveGame(true);applySave(loadGame());
    return P.mkp[2]===4&&P.sd===7&&JSON.stringify(P.bc)===bc&&JSON.stringify(P.jd)===jd});
  ok(`불러오기 뒤 그대로 ${r8}`,r8);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close();
})();

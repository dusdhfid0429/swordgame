// v207 완본 (사용자 2026-10-29 "초식까지 모두 모으면 창안에 소모"): 다른 병기 무공 사본을 끝까지 모으면 완본으로 엮고, 창안 재료 두 자리까지 대신한다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 창법 사본을 마지막 초식까지 모으면 행낭에 '완본 엮기' → 완본 한 권, 오성 칸을 쓰지 않음, 견식은 더 적지 않음
  const r1=await p.evaluate(()=>{P.bag=[];const id='정창1',a=ARTS[id];for(let i=0;i<a.forms.length-1;i++)P.bag.push(copyBook(id,i));
    openPanel('bag');const t0=!!document.querySelector('[data-act="wbind:'+id+'"]');P.bag.push(copyBook(id,a.forms.length-1));renderOpen();const t1=!!document.querySelector('[data-act="wbind:'+id+'"]');
    act('wbind:'+id);const wb=P.bag.filter(i=>i.slot==='wbook');const t=$('wbody').textContent;closePanels();
    return{t0,t1,n:P.bag.length,wb:wb.length,name:wb[0]&&wb[0].name,cap:capArts().length,learned:!!P.arts[id],next:nextForm(id,9),desc:t.includes('완본')}});
  ok(`모자라면 엮기 없음 (${!r1.t0}), 다 모으면 엮기 → ${r1.name}, 행낭 ${r1.n}권, 익히지 않음, 견식 더 안 적음 (${r1.next})`,!r1.t0&&r1.t1&&r1.wb===1&&r1.n===1&&!r1.learned&&r1.next===-1&&r1.desc);
  // 2. 검 대성 셋 + 창 완본 + 초식 다 익힌 봉(숙련 0) → 검 창안 묶음, 넷이면 모자람
  const r2=await p.evaluate(()=>{for(let i=0;i<3;i++){const id='정검'+i;P.arts[ARTS[id].id]={p:100,f:ARTS[id].forms.map(()=>true)}}
    const g0=mkGroups().length;const bo='정봉2';P.arts[bo]={p:0,f:ARTS[bo].forms.map(()=>true)};P.cur=ARTS['정검0'].id;
    const g=mkGroups();return{g0,g:g.map(x=>x.cls+x.g+':'+x.ids.length+'+'+x.subs.length),rows:(openTrain(),TRN.innerText.includes('다른 병기 2개'))}});
  ok(`검 셋 + 완본 하나면 묶음 ${r2.g0}개, 봉(초식 다 익힘) 더하면 ${r2.g.join(',')}, 수련 창에 표시 ${r2.rows}`,r2.g0===0&&r2.g.join()==='검0:3+2'&&r2.rows);
  // 3. 같은 병기는 여전히 숙련 100: 창 무공을 숙련 50으로 익혀도 검 묶음엔 안 들어간다 / 다섯 중 셋은 같은 병기여야
  const r3=await p.evaluate(()=>{const s=P.arts[ARTS['정검2'].id];s.p=99;const g=mkGroups().length;s.p=100;return g});
  ok(`같은 병기 대성 둘 + 대신 둘로는 안 됨 (${r3})`,r3===0);
  // 4. 창안: 완본·봉도 함께 사라지고 새 무공은 검법, 초식은 검 무공에서만
  await p.evaluate(()=>{closeTrain();P.realm=5;P.vit=800;P.inj=0;mobs=[];P.sect='hwasan';P.mtot={hwasan:0};postGo('hq_hwasan')});await p.waitForTimeout(1500);
  await p.evaluate(()=>{mobs=[];window.__noPrompt=1;const R=Math.random;Math.random=()=>0;startTrain('mk:검:0');window.__restore=()=>{Math.random=R}});
  await p.waitForFunction(()=>!trnBusy,null,{timeout:60000});await p.waitForTimeout(200);
  const r4=await p.evaluate(()=>{window.__restore();const id=Object.keys(P.arts).find(k=>k.startsWith('mk_')),a=ARTS[id],d=G.made[id];
    return{id,cls:a&&a.cls,src:d&&d.forms.every(x=>ARTS[x.a].cls==='검'),srcN:d&&d.srcN.join('·'),wb:P.bag.filter(i=>i.slot==='wbook').length,bo:!!P.arts['정봉2'],left:['정검0','정검1','정검2'].filter(k=>P.arts[ARTS[k].id]).length,desc:a&&a.d}});
  ok(`창안 ${r4.id} ${r4.cls}, 초식은 검에서만 ${r4.src}, 재료 ${r4.srcN}, 완본 ${r4.wb}·봉 ${r4.bo}·검 ${r4.left} 남음`,r4.cls==='검'&&r4.src&&r4.wb===0&&!r4.bo&&r4.left===0&&/완본/.test(r4.srcN));
  // 5. 저장·불러오기 뒤에도 정의 그대로
  const r5=await p.evaluate(id=>{saveGame(true);const n=ARTS[id].n;delete ARTS[id];applySave(loadGame());return ARTS[id]&&ARTS[id].n===n},r4.id);
  ok(`불러오기 뒤 복원 ${r5}`,r5);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close();
})();

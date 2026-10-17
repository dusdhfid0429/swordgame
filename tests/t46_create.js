// 무공 창안: 같은 병기·같은 등급의 대성 무공 다섯 → 한 등급 높은 무공 (2026-10-12 사용자 요청)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 하승 검 무공 다섯을 숙련 100으로 만들고 화산파 본산으로 간다
  const s0=await p.evaluate(()=>{for(let i=0;i<5;i++){const id='정검'+i;P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)}}P.arts['정검4'].p=99;const gLow=mkGroups().length;P.arts['정검4'].p=100;P.cur='정검0';P.wis=20;P.sect='hwasan';P.mtot={hwasan:0};P.realm=0;P.vit=800;P.silver=500;
    const g0=mkGroups();openTrain();const h0=TRN.innerText;postGo('hq_hwasan');return{g0:g0.map(g=>g.cls+g.g+':'+g.ids.length),gLow,h0:h0.includes('무공 창안')}});
  await p.waitForTimeout(1500);
  const s1=await p.evaluate(()=>{openTrain();renderTrain();const why0=mkWhy(0);P.realm=4;const why4=mkWhy(0);P.realm=5;renderTrain();return{reg:REG,place:pgPlace(),why0,why4,row:TRN.innerText.includes('무공 창안'),why1:mkWhy(0),btn:!!TRN.querySelector('[data-tr="mk:검:0"]:not([disabled])')}});
  ok(`재료 묶음 ${s0.g0.join(',')} (숙련 99면 ${s0.gLow}묶음) · 개봉에서도 창안 줄은 보이고(${s0.h0}) 단추만 막힌다 · ${s1.reg}(${s1.place}) 삼류면 "${s1.why0}", 초절정이면 "${s1.why4}", 화경이면 단추 활성 ${s1.btn}`,s0.g0.join()==='검0:5'&&s0.gLow===0&&s0.h0&&s1.place&&/경지 필요/.test(s1.why0)&&/경지 필요/.test(s1.why4)&&s1.row&&s1.btn&&!s1.why1);
  // 창안 (성공을 고정)
  const r=await p.evaluate(()=>{window.__noPrompt=1;const age=P.age,vit=P.vit,R=Math.random;Math.random=()=>0;startTrain('mk:검:0');window.__restore=()=>{Math.random=R};return{age,vit,busy:trnBusy&&trnBusy.k}});
  await p.waitForFunction(()=>!trnBusy,null,{timeout:60000});await p.waitForTimeout(200);
  const d=await p.evaluate(()=>{window.__restore();const id=Object.keys(P.arts).find(k=>k.startsWith('mk_')),a=ARTS[id];
    return{id,n:a&&a.n,g:a&&a.grade,nf:a&&a.forms.length,open:P.arts[id]&&P.arts[id].f.every(Boolean),p:P.arts[id]&&P.arts[id].p,left:['정검0','정검1','정검2','정검3','정검4'].filter(k=>P.arts[k]).length,age:P.age,vit:P.vit,qi:P.qi,maxQi:P.maxQi,cur:P.cur,
      m0:a&&a.forms[0].m,ult:a&&a.ult.n,made:G.made&&Object.keys(G.made).length,log:logHist.slice(-1).map(l=>l.t||l)[0]}});
  ok(`창안 [${d.n}] ${AGRN(d.g)} 초식 ${d.nf}(모두 열림 ${d.open}, 숙련 ${d.p}) 필살기 ${d.ult} · 재료 남음 ${d.left} · 나이 +${(d.age-r.age).toFixed(1)} 활력 -${r.vit-d.vit} 내공 ${d.qi} · 펼치는 중 ${d.cur}`,
    d.id==='mk_1'&&d.g===1&&d.nf===6&&d.open&&d.p===30&&d.left===0&&Math.abs(d.age-r.age-2)<.1&&r.vit-d.vit===100&&d.qi<d.maxQi*.3&&d.cur==='mk_1'&&d.made===1);
  function AGRN(g){return ['하승','중승','상승','절정','천고'][g]}
  const ui=await p.evaluate(()=>{closeTrain();openPanel('arts');const t=(document.querySelector('#wbody')||document.body).innerText;return{tag:t.includes('창안 ·'),cap:capArts().length}});
  ok(`무공 창에 창안 표시 ${ui.tag} · 익힌 무공 ${ui.cap}`,ui.tag&&ui.cap===1);
  // 저장·불러오기: ARTS에서 지워도 G.made로 다시 만들어진다
  const sv=await p.evaluate(()=>{saveGame(true);const n=ARTS.mk_1.n,m=ARTS.mk_1.forms[2].m;delete ARTS.mk_1;applySave(loadGame());return{ok:!!ARTS.mk_1,same:ARTS.mk_1&&ARTS.mk_1.n===n&&Math.abs(ARTS.mk_1.forms[2].m-m)<1e-9,has:!!P.arts.mk_1}});
  ok(`불러오기 뒤 창안 무공 복원 ${sv.ok} 같은 정의 ${sv.same} 숙련 유지 ${sv.has}`,sv.ok&&sv.same&&sv.has);
  // 문파 등록: 화산파 무공 목록에 들어가고 비급 값이 계산된다
  const rg=await p.evaluate(()=>({inList:SECTS.hwasan.arts.some(q=>q.id==='mk_1'),sect:ARTS.mk_1.sect,cost:meritCost({id:'mk_1'},0),d:ARTS.mk_1.d}));
  ok(`화산파 목록 등록 ${rg.inList} (sect ${rg.sect}, 비급 공적 ${rg.cost}) · ${rg.d.slice(-12)}`,rg.inList&&rg.sect==='hwasan'&&rg.cost>0&&/전해진다/.test(rg.d));
  // 같은 구성으로 다시 창안하면 새것이 갈음한다
  await p.evaluate(()=>{closePanels();for(let i=0;i<5;i++){const id='정검'+i;P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)}}P.vit=800;P.inj=0;const R=Math.random;Math.random=()=>0;startTrain('mk:검:0');window.__restore=()=>{Math.random=R}});
  await p.waitForFunction(()=>!trnBusy,null,{timeout:60000});await p.waitForTimeout(200);
  const rp=await p.evaluate(()=>{window.__restore();return{k1:G.made.mk_1.key,k2:G.made.mk_2&&G.made.mk_2.key,r1:G.made.mk_1.reg,r2:G.made.mk_2&&G.made.mk_2.reg,l1:SECTS.hwasan.arts.some(q=>q.id==='mk_1'),l2:SECTS.hwasan.arts.some(q=>q.id==='mk_2'),keep:!!P.arts.mk_1}});
  ok(`같은 구성(${rp.k1===rp.k2}) → mk_1 등록 ${rp.r1}·목록 ${rp.l1}, mk_2 등록 ${rp.r2}·목록 ${rp.l2}, 익힌 mk_1은 남음 ${rp.keep}`,rp.k1===rp.k2&&rp.r1===0&&rp.r2===1&&!rp.l1&&rp.l2&&rp.keep);
  // 실패: 세월과 활력만 잃고 무공은 남는다
  const f=await p.evaluate(()=>{closePanels();for(let i=0;i<5;i++){const id='사검'+i;P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)}}P.vit=800;P.inj=0;const R=Math.random;Math.random=()=>.999;startTrain('mk:검:0');window.__restore=()=>{Math.random=R};return trnBusy&&trnBusy.k});
  await p.waitForFunction(()=>!trnBusy,null,{timeout:60000});await p.waitForTimeout(200);
  const f2=await p.evaluate(()=>{window.__restore();return{left:['사검0','사검1','사검2','사검3','사검4'].filter(k=>P.arts[k]).length,inj:P.inj>0,made:Object.keys(G.made).length,log:logHist.slice(-1).map(l=>l.t||l)[0]}});
  ok(`실패: 무공 남음 ${f2.left} · 경맥 상함 ${f2.inj} · ${f2.log}`,f===`mk:검:0`&&f2.left===5&&f2.inj&&f2.made===2);
  // 무소속 창안 → 기연 무공. 숭산 정상에서
  await p.evaluate(()=>{P.sect=null;mobs=[];loadRegion('sungsan');P.reg='sungsan';P.x=10.5;P.y=8;P.vit=800;P.inj=0;P.realm=5;const R=Math.random;Math.random=()=>0;startTrain('mk:검:0');window.__restore=()=>{Math.random=R}});
  await p.waitForFunction(()=>!trnBusy,null,{timeout:60000});await p.waitForTimeout(200);
  const gy=await p.evaluate(()=>{const id=Object.keys(G.made).find(k=>G.made[k].sect==null&&G.made[k].reg),a=ARTS[id];const o={id,place:pgPlace(),pool:a&&a.gyPool,inAnySect:Object.values(SECTS).some(s=>s.arts.some(q=>q.id===id))};
    delete P.arts[id];Math.random=()=>0;o.roll=gyRoll('chest');o.roll2=mkGyRoll('spot');Math.random=()=>.999;o.rollHi=mkGyRoll('chest');window.__restore();
    const b=gyLearn(id);o.f=P.arts[id].f.slice();P.arts[id].p=49;gainMast(id,400);o.f2=P.arts[id].f.filter(Boolean).length;return o});
  ok(`무소속 창안 ${gy.id} (${gy.place}) 기연 풀 ${gy.pool}, 문파 목록 아님 ${!gy.inAnySect} · 기연 굴림 ${gy.roll}/${gy.roll2}, 운 나쁘면 ${gy.rollHi} · 첫 초식만 ${gy.f.join('')}, 숙련 오르면 열림 ${gy.f2}`,
    gy.id&&gy.place&&gy.pool===1&&!gy.inAnySect&&gy.roll!==gy.id&&gy.roll2===gy.id&&gy.rollHi===null&&gy.f.join()==='true,false,false,false,false,false'&&gy.f2>1);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

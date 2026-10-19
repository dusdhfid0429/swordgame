// 내공 심법 등급: 같은 활력으로 증가량이 다르고, 문파마다 규모에 따라 최고 등급이 다른 자기 심법이 있다 (2026-10-12 사용자 요청)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{GD.RANK_CAP.plus=9});   // v153 직위 상한(경지+1)은 t91에서 본다. 여기서는 공적만으로 직위를 본다
  // 1. 문파 규모별 심법 수와 최고 등급
  const t=await p.evaluate(()=>{const f=id=>simOf(id).map(x=>x.n+':'+AGR[x.g]);return{small:f('hyeongsan'),mid:f('hwangbo'),big:f('hwasan'),five:f('namgung'),one:f('cheonma'),sa:f(Object.values(SECTS).find(s=>s.al==='sacheon'&&s.tier==='big').id),base:simCur().n,gain:simGain(),cost0:qiCost(P.side,P.qiN)}});
  console.log(JSON.stringify(t));
  ok(`소문파 ${t.small.length}(${t.small.at(-1)}) 중견 ${t.mid.length}(${t.mid.at(-1)}) 대문파 ${t.big.length}(${t.big.at(-1)}) 오대세가 ${t.five.length} 마교 ${t.one.length}(${t.one.at(-1)}) · 타고난 ${t.base} +${t.gain}`,
    t.small.length===1&&/중승$/.test(t.small[0])&&t.mid.length===2&&/상승$/.test(t.mid[1])&&t.big.length===3&&/절정$/.test(t.big[2])&&t.five.length===3&&t.one.length===4&&/천고$/.test(t.one[3])&&t.base==='대반야금강공'&&t.gain===10);
  // 2. 기초 심법으로 한 번, 화산파 절정 심법으로 한 번: 활력은 같은 식, 내공 증가가 다르다
  await p.evaluate(()=>{P.vit=900;closePanels();openTrain();startTrain('neigong')});await p.waitForFunction(()=>!trnBusy,null,{timeout:30000});await p.waitForTimeout(100);
  const q1=await p.evaluate(()=>({acc:P.qiAcc,n:P.qiN,qi:baseQi()}));
  const buy=await p.evaluate(()=>{P.sect='hwasan';P.mtot={hwasan:1000};P.merit={hwasan:1000};const o={};o.blockLow=simBlock(SIM.N_hwasan_3);P.mtot.hwasan=1000;
    act('simbuy:N_hwasan_1');o.r1=P.sim;act('simbuy:N_hwasan_3');o.r3=P.sim;o.merit=P.merit.hwasan;o.gain=simGain();o.cost=qiCost(P.side,P.qiN);return o});
  await p.evaluate(()=>{openTrain();startTrain('neigong')});await p.waitForFunction(()=>!trnBusy,null,{timeout:30000});await p.waitForTimeout(100);
  const q2=await p.evaluate(()=>({acc:P.qiAcc,n:P.qiN,qi:baseQi(),rows:!TRN.innerText.includes('심법 바꾸기')&&(closePanels(),openPanel('arts'),$('win').innerText.includes('운용하기')&&$('win').innerText.includes('자하심법'))}));
  ok(`기초 수련 +${q1.acc} (내공 ${q1.qi}) → 자하심법·자하무극공 익힘(${buy.r1}→${buy.r3}, 공적 ${buy.merit}) · 절정 1회 +${buy.gain} 활력 ${buy.cost} → 쌓인 ${q2.acc} 내공 ${q2.qi} · 무공창 심법 카드 ${q2.rows}`,
    q1.acc===10&&q1.qi===90&&buy.r1==='N_hwasan_1'&&buy.r3==='N_hwasan_3'&&buy.merit===1000-40-160&&buy.gain===18&&q2.acc===28&&q2.qi===108&&q2.rows);
  // 3. 직위 제한과 심법 바꾸기, 잡화점 공용 심법
  const g=await p.evaluate(()=>{P.mtot.hwasan=0;const o={low:simBlock(SIM.N_hwasan_2)};P.mtot.hwasan=1000;act('simsel:N_base_정');o.sw=simCur().n;o.g0=simGain();
    P.silver=1000;act('simshop');o.shop=P.sim;o.silver=P.silver;o.gs=simGain();o.other=simBlock(SIM['N_shop_사']);openPanel('npc',NPCS.find(n=>n.id==='gen'));o.genDlg=document.body.innerText.includes('심법 비급');return o});
  ok(`직위 낮으면 "${g.low}" · 기초로 바꾸면 ${g.sw} +${g.g0} · 잡화점 ${g.shop} 은자 ${g.silver} +${g.gs} · 사파 것은 "${g.other}" · 잡화점 창 ${g.genDlg}`,
    /이상$/.test(g.low)&&g.sw==='대반야금강공'&&g.g0===10&&g.shop==='N_shop_정'&&g.silver===700&&g.gs===12.5&&g.other==='성향이 다르다'&&g.genDlg);
  // 4. 예전 저장 옮기기: 횟수×증가량
  const m=await p.evaluate(()=>{const d=MIGRATE[1]({P:{qiN:3,side:'사'}});return{acc:d.P.qiAcc,sim:d.P.sim,sims:JSON.stringify(d.P.sims)}});
  ok(`v1 저장: 3회 사파 → 쌓인 내공 ${m.acc}, 심법 ${m.sim} ${m.sims}`,m.acc===33&&m.sim===null&&m.sims==='{}');
  // 5. 문파 창에 심법 목록
  const d=await p.evaluate(()=>{closePanels();sectView='hwasan';const h=allianceDlg('jeong');return{list:h.includes('문파 심법')&&h.includes('자하무극공'),top:h.includes('절정까지')}});
  ok(`문파 창 심법 목록 ${d.list} · 최고 등급 안내 ${d.top}`,d.list&&d.top);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

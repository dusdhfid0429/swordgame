// 천하 지도: 성을 눌러 그 지역 정보(문파·무인·짐승·소굴·이웃·가는 길)를 본다
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>openPanel('world'));await p.waitForTimeout(300);
  const txt=()=>p.evaluate(()=>$('wbody').textContent);
  let t=await txt();ok('처음엔 지금 있는 개봉 정보 (중립지대·시설·역참)',t.includes('중립지대')&&t.includes('역참')&&t.includes('지금 여기 있다'));
  // 지도에서 섬서성을 손가락으로 누른다
  const box=await p.evaluate(()=>{const r=document.querySelector('#wbody [data-act="wsel:shaanxi"] .hit').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
  await p.touchscreen.tap(box.x,box.y);await p.waitForTimeout(300);t=await txt();
  ok('섬서성을 누르면: 화산파·종남파 본산, 무인, 짐승, 이웃 성, 가는 길',['섬서성','화산파','종남파','정파 무인 많음','늑대','감숙성','가는 길: 개봉 → 하남성 → 섬서성'].every(s=>t.includes(s)));
  await p.screenshot({path:shot('world_info')});
  // 설명이 지도를 덮지 않고(지도 아래에 놓이고), 설명이 뜬 뒤에도 지도의 다른 성을 또 누를 수 있다
  const lay=await p.evaluate(()=>{const m=document.querySelector('#wbody .wmap').getBoundingClientRect(),c=document.querySelector('#wbody .card').getBoundingClientRect();return{mb:Math.round(m.bottom),ct:Math.round(c.top),mh:Math.round(m.height)}});
  const box2=await p.evaluate(()=>{const r=document.querySelector('#wbody [data-act="wsel:shandong"] .hit').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,top:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2).closest('[data-act]')?.dataset.act}});
  await p.touchscreen.tap(box2.x,box2.y);await p.waitForTimeout(300);t=await txt();
  ok(`설명 카드가 지도(${lay.mh}px) 아래에 놓이고(지도 끝 ${lay.mb} ≤ 카드 위 ${lay.ct}), 그 뒤 산동성을 또 누르면 바뀐다(${box2.top})`,lay.mb<=lay.ct&&lay.mh>200&&box2.top==='wsel:shandong'&&t.includes('산동성')&&t.includes('태산파'));
  await p.evaluate(()=>act('wsel:shaanxi'));await p.waitForTimeout(200);
  // 이웃 버튼으로 감숙성
  await p.tap('#wbody .card [data-act="wsel:gansu"]');await p.waitForTimeout(300);t=await txt();
  ok('이웃 성 버튼으로 감숙성, 길이 한 칸 늘어난다',t.includes('공동파')&&t.includes('성 3곳 이동'));
  // 하남성 소굴
  await p.evaluate(()=>act('wsel:henan'));t=await txt();ok('하남성: 소림사와 흑풍채 산채·혈교 동굴 소굴',t.includes('소림사')&&t.includes('흑풍채 산채')&&t.includes('혈교장로'));
  // 모든 성과 개봉을 열어도 오류 없음, 경로가 있다
  const all=await p.evaluate(()=>[...Object.keys(PROV),'gaebong'].every(k=>{act('wsel:'+k);return $('wbody').textContent.includes(k==='gaebong'?'개봉':PROV[k].n)&&/가는 길|지금 여기/.test($('wbody').textContent)}));
  ok('22개 성과 개봉 모두 정보와 가는 길이 나온다',all);
  // 다른 성으로 옮기면 그 성이 먼저 고른 곳이 된다
  await p.evaluate(()=>{closePanels();travel({to:'pv_sichuan',tx:44,ty:44})});await p.waitForTimeout(1500);
  await p.evaluate(()=>openPanel('world'));await p.waitForTimeout(200);t=await txt();ok('사천성에 가서 열면 사천성 정보가 먼저',t.includes('아미파')&&t.includes('지금 여기 있다'));
  // 이동 중 표시가 저장에 남아 다시는 이동하지 못하던 문제
  const tv=await p.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).P.traveling);
  const st=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem(SAVE_KEY));d.P.traveling=1;applySave(d);return P.traveling});
  await p.evaluate(()=>{const e=REGION().edges||{};travel(REGION().gates[0]||{to:e.n||e.w||e.e||e.s,tx:20.5,ty:20.5})});await p.waitForTimeout(700);
  ok(`이동한 뒤 저장에 이동 중 표시가 없고(${tv}), 예전 저장에 남아 있어도 불러오면 풀려서(${st}) 다시 이동된다`,!tv&&!st&&await p.evaluate(()=>REG!=='pv_sichuan'&&!P.traveling));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

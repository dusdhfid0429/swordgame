// 마을 창고지기: 휴대폰에서 상황 버튼으로 말을 걸고, 물건·재료를 맡기고 꺼내며, 저장 후 다시 불러와도 남아 있는지 확인한다.
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
  await p.evaluate(()=>{const n=npcAt('bank');P.x=n.x+.8;P.y=n.y+.2;P.path=null;P.mats.약초=5});await p.waitForTimeout(400);
  ok('창고지기 곁에서 상황 버튼이 대화',await p.evaluate(()=>$('t_ctx').textContent.trim()==='대화'));
  await p.tap('#t_ctx');await p.waitForTimeout(200);
  ok('창고지기 창이 열린다',await p.evaluate(()=>panel==='npc'&&$('wbody').textContent.includes('창고 물건')));
  const id=await p.evaluate(()=>P.bag[0].id),n0=await p.evaluate(()=>P.bag.length);
  await p.locator(`[data-act="put:${id}"]`).tap();await p.waitForTimeout(150);
  ok('물건 맡기기',await p.evaluate(([id,n0])=>P.bag.length===n0-1&&G.storage.bag.some(i=>i.id===id),[id,n0]));
  await p.locator('[data-act="putm"]').tap();await p.waitForTimeout(150);
  ok('재료 맡기기',await p.evaluate(()=>G.storage.mats.약초===5&&!P.mats.약초));
  await p.screenshot({path:shot('m_storage')});
  await p.evaluate(()=>{saveGame(true)});await p.reload();await p.waitForTimeout(1500);
  await p.tap('[data-s="cont"]').catch(()=>{});await p.waitForTimeout(600);
  ok('다시 불러와도 창고가 남아 있다',await p.evaluate(id=>playing&&G.storage.bag.some(i=>i.id===id)&&G.storage.mats.약초===5,id));
  await p.evaluate(()=>openNpc(npcAt('bank')));await p.waitForTimeout(150);
  await p.locator('[data-act="take:0"]').tap();await p.locator('[data-act="takem"]').tap();await p.waitForTimeout(150);
  ok('꺼내기',await p.evaluate(id=>P.bag.some(i=>i.id===id)&&P.mats.약초===5&&!G.storage.bag.length,id));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

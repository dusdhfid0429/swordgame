// 요대 「암기 빼기」를 펼쳐 하나 빼도 다시 접히지 않는다 (사용자 2026-10-30 "암기빼기 창이 자꾸 다시 접혀")
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.evaluate(()=>{P.mats={};P.eq.weapon=mkWeapon('암',1,0);recalc();addMat('매화침',3);addMat('회선표',3);addMat('독사침',3);openPanel('bag')});
  const det=()=>p.evaluate(()=>{const d=[...document.querySelectorAll('#win details')].find(d=>/암기 빼기/.test(d.textContent));return d?{open:d.open,n:d.querySelectorAll('[data-act^="amr:"]').length}:null});
  const d0=await det();ok(`처음엔 접혀 있다 (${JSON.stringify(d0)})`,d0&&!d0.open);
  await p.click('#win details summary:has-text("암기 빼기")');
  await p.click('#win [data-act^="amr:"]');await p.waitForTimeout(100);
  const d1=await det();ok(`하나 빼도 펼쳐져 있다 (${JSON.stringify(d1)})`,d1&&d1.open&&d1.n===d0.n-1);
  await p.click('#win [data-act^="amr:"]');await p.waitForTimeout(100);
  const d2=await det();ok(`이어서 또 뺄 수 있다 (${JSON.stringify(d2)})`,d2&&d2.open&&d2.n===d0.n-2);
  await p.click('#win details summary:has-text("암기 빼기")');await p.evaluate(()=>renderOpen());
  const d3=await det();ok(`스스로 접으면 접힌 채로 남는다`,d3&&!d3.open);
  ok('오류 없음 '+errs.join(' | '),!errs.length);await b.close()})();

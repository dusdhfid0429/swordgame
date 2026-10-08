// 은자 0인 적(강시)을 잡아도 바닥에 빈 전리품이 생겨 화면이 멈추지 않는지 확인한다.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  await p.evaluate(()=>{for(let i=0;i<40;i++){const e=mkMob('강시',P.x+1.5,P.y+.5);mobs.push(e);e.hp=0;onKill(e)}P.hp=P.maxHp=99999});
  await p.waitForTimeout(800);
  ok('강시 40마리를 잡아도 빈 전리품이 없다',await p.evaluate(()=>drops.every(d=>d.it.silver||d.it.mat||d.it.page||d.it.item)));
  // 예전 저장·버그로 남은 빈 전리품이 있어도 그리기와 줍기가 멈추지 않는다
  await p.evaluate(()=>{drops.push({x:P.x,y:P.y,it:{silver:0},t:0});drops.push({x:P.x+.2,y:P.y,it:{},t:0})});await p.waitForTimeout(800);
  ok('빈 전리품이 있어도 게임이 돈다',await p.evaluate(()=>!loop.err&&!document.querySelector('#log')?.textContent.includes('오류')));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

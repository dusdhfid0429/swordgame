// 메뉴 → 저장 칸 고르기 (v139, 사용자 2026-10-18): 지금 칸에 기록하고 칸 고르는 첫 화면으로. 다른 칸을 이어 하거나 새로 해도 앞 판이 섞이지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.fill('input',' 갑돌');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const n0=await p.evaluate(()=>{P.name='갑돌';P.silver=777;P.acadSkip=1;return P.name});
  await p.evaluate(()=>openPanel('menu'));const btn=await p.$$eval('[data-act="totitle"]',x=>x.length);
  await p.click('[data-act="totitle"]');await p.waitForTimeout(200);
  const r1=await p.evaluate(()=>({playing,P,scr:!scrEl.hidden,slots:document.querySelectorAll('[data-s^="slot:"]').length,row:document.querySelector('[data-s="slot:0"]').textContent}));
  ok(`메뉴 단추 ${btn}개 → 첫 화면, 칸 ${r1.slots}개, 1번 칸에 ${n0} 기록 (${r1.row})`,btn===1&&!r1.playing&&r1.P===null&&r1.scr&&r1.slots>=3&&r1.row.includes('갑돌'));
  await p.waitForTimeout(500);
  await p.click('[data-s="slot:1"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r2=await p.evaluate(()=>({name:P.name,silver:P.silver,skip:P.acadSkip,lives:G.lives}));
  ok(`2번 칸 새로 시작: 앞 판 은자·표시 안 섞임 (${r2.silver}, ${r2.skip})`,r2.name!=='갑돌'&&r2.silver!==777&&!r2.skip&&r2.lives===0);
  await p.evaluate(()=>openPanel('menu'));await p.click('[data-act="totitle"]');await p.click('[data-s="slot:0"]');await p.click('[data-s="cont"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(500);
  const r3=await p.evaluate(()=>({name:P.name,silver:P.silver,reg:REG,mobs:mobs.length}));
  ok(`1번 칸 이어 하기: ${r3.name}, 은자 ${r3.silver}, ${r3.reg}`,r3.name==='갑돌'&&r3.silver===777);
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

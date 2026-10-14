// 저장 칸 5개 (2026-10-14): 제목 화면 목록에서 칸을 골라 새로하기·이어하기, 칸마다 이름·회차 표시, 지우기는 confirm() 없이 화면 안에서 확인
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>{localStorage.clear();window.confirm=()=>{throw new Error('confirm 호출')};showTitle()});
  const t0=await p.evaluate(()=>({rows:box.querySelectorAll('.slot').length,sel:box.querySelector('.slot[aria-pressed="true"]').dataset.s,empty:$('slotinfo')===null&&!!box.querySelector('[data-s="new"]'),slot:SLOT}));
  ok(`제목 화면에 칸 ${t0.rows}개, 고른 칸 ${t0.sel}, 빈 칸이라 새 인생 단추 ${t0.empty}`,t0.rows===5&&t0.sel==='slot:0'&&t0.empty&&t0.slot===0);
  // 1번 칸에 새 인생
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(200);
  const t1=await p.evaluate(()=>{P.name='갑돌';P.age=23;saveGame(true);playing=false;showTitle();const r=box.querySelectorAll('.slot')[0].textContent;return{r,key:SAVE_KEY,has:!!localStorage.getItem('ganghoyunhoe-save-v1'),cont:!!box.querySelector('[data-s="cont"]')}});
  ok(`1번 칸 기록 "${t1.r.trim().slice(0,40)}" (예전 키 그대로 ${t1.has}, 이어하기 ${t1.cont})`,/갑돌/.test(t1.r)&&/1회차/.test(t1.r)&&/23세/.test(t1.r)&&t1.key==='ganghoyunhoe-save-v1'&&t1.has&&t1.cont);
  // 3번 칸 골라 새 인생
  await p.click('[data-s="slot:2"]');await p.waitForTimeout(100);
  const t2=await p.evaluate(()=>({slot:SLOT,key:SAVE_KEY,mem:localStorage.getItem('ganghoyunhoe-slot'),empty:!box.querySelector('[data-s="cont"]')&&!!box.querySelector('[data-s="new"]'),lives:G.lives}));
  ok(`3번 칸 고름: SLOT ${t2.slot}, 키 ${t2.key}, 기억 ${t2.mem}, 빈 칸 ${t2.empty}, 세상 초기화 ${t2.lives===0}`,t2.slot===2&&t2.key==='ganghoyunhoe-save-v1-2'&&t2.mem==='2'&&t2.empty&&t2.lives===0);
  await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:도"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(200);
  const t3=await p.evaluate(()=>{P.name='을순';saveGame(true);playing=false;showTitle();const rows=[...box.querySelectorAll('.slot')].map(r=>r.textContent);return{r0:rows[0],r2:rows[2],r1:rows[1],k2:!!localStorage.getItem('ganghoyunhoe-save-v1-2')}});
  ok(`두 칸 따로: 1번 "${/갑돌/.test(t3.r0)}" 3번 "${/을순/.test(t3.r2)}" 2번 빈 칸 ${/빈 칸/.test(t3.r1)}`,/갑돌/.test(t3.r0)&&/을순/.test(t3.r2)&&/빈 칸/.test(t3.r1)&&t3.k2);
  // 1번 칸 이어하기
  await p.click('[data-s="slot:0"]');await p.click('[data-s="cont"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(200);
  const t4=await p.evaluate(()=>({name:P.name,slot:SLOT,age:Math.floor(P.age)}));
  ok(`1번 칸 이어하기 → ${t4.name} ${t4.age}세 (SLOT ${t4.slot})`,t4.name==='갑돌'&&t4.slot===0&&t4.age===23);
  // 지우기: confirm() 없이 화면 안에서 묻고, 그만두면 그대로
  await p.evaluate(()=>{playing=false;showTitle()});await p.click('[data-s="reset"]');await p.waitForTimeout(100);
  const t5=await p.evaluate(()=>({ask:!!box.querySelector('[data-s="reset2"]'),no:!!box.querySelector('[data-s="noreset"]'),still:!!localStorage.getItem('ganghoyunhoe-save-v1')}));
  await p.click('[data-s="noreset"]');await p.waitForTimeout(100);
  const t6=await p.evaluate(()=>({back:!!box.querySelector('[data-s="reset"]')&&!box.querySelector('[data-s="reset2"]'),still:!!localStorage.getItem('ganghoyunhoe-save-v1')}));
  ok(`지우기 확인 창 ${t5.ask}/${t5.no}, 그만두면 복귀 ${t6.back}, 기록 유지 ${t6.still}`,t5.ask&&t5.no&&t5.still&&t6.back&&t6.still);
  await p.click('[data-s="reset"]');await p.click('[data-s="reset2"]');await p.waitForTimeout(150);
  const t7=await p.evaluate(()=>({gone:!localStorage.getItem('ganghoyunhoe-save-v1'),other:!!localStorage.getItem('ganghoyunhoe-save-v1-2'),create:!!box.querySelector('[data-s="start"]'),lives:G.lives}));
  ok(`지운다 → 1번 칸 삭제 ${t7.gone}, 3번 칸 유지 ${t7.other}, 생성 화면 ${t7.create}, 1회차 ${t7.lives===0}`,t7.gone&&t7.other&&t7.create&&t7.lives===0);
  await p.evaluate(()=>showTitle());await p.click('[data-s="slot:2"]');await p.waitForTimeout(100);await p.screenshot({path:__dirname+'/shots/slots.png'});
  // 다시 열면 마지막에 쓴 칸이 고른 채로
  await p.reload();await p.waitForFunction(()=>typeof loadRegion==='function');await p.waitForTimeout(300);
  const t8=await p.evaluate(()=>({slot:SLOT,sel:box.querySelector('.slot[aria-pressed="true"]').dataset.s,cont:!!box.querySelector('[data-s="cont"]')}));
  ok(`다시 열면 3번 칸 고른 채 (${t8.sel}, 이어하기 ${t8.cont})`,t8.slot===2&&t8.sel==='slot:2'&&t8.cont);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

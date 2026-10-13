// ☰ 메뉴 정리와 빠른 버튼 (2026-10-13, v88): 메뉴는 창 목록만(중복 없음), 질주·승마·운기는 HUD 빠른 버튼, 상황 버튼에서 승마·운기 제거
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="start"]');await p.waitForFunction(()=>playing&&TOUCH);await p.waitForTimeout(300);
  // 1. 메뉴: 창 아홉 + 설정 줄, 질주·말·운기 단추 없음, 중복 없음
  await p.tap('#tmenu');await p.waitForTimeout(150);
  const m=await p.evaluate(()=>{const acts=[...document.querySelectorAll('#wbody [data-act]')].map(b=>b.dataset.act);const grid=[...document.querySelectorAll('#wbody .mbtn')].map(b=>b.querySelector('b').textContent);return{acts,grid,dup:acts.length!==new Set(acts).size}});
  ok(`메뉴 창 목록 ${m.grid.join('·')}`,m.grid.join()==='인물,무공,행낭,동료,생활,임무,강호사,천하 지도,수련');
  ok('메뉴에 질주·말·운기 없음, 설정 줄에 기록·조작법·PC 조작, 중복 없음',!m.acts.includes('run')&&!m.acts.includes('ride')&&!m.acts.includes('medit')&&m.acts.includes('save')&&m.acts.includes('open:help')&&m.acts.includes('ctl:k')&&!m.dup);
  await p.evaluate(()=>closePanels());
  // 2. 빠른 버튼: 질주 토글, 말이 곁에 있을 때만 승마, 내공이 비면 운기
  const q0=await p.evaluate(()=>{mobs=[];P.qi=P.maxQi;P.hp=P.maxHp;touchHud();ctxT=0;touchHud();return{run:$('t_run').hidden,ride:$('t_ride').hidden,med:$('t_med').hidden}});
  ok(`빠른 버튼 처음: 질주 보임, 승마 숨김(${q0.ride}), 운기 숨김(${q0.med})`,!q0.run&&q0.ride&&q0.med);
  await p.tap('#t_run');await p.waitForTimeout(200);
  const q1=await p.evaluate(()=>{ctxT=0;touchHud();return{run:P.run,txt:$('t_run').textContent,on:$('t_run').classList.contains('on')}});
  ok(`질주 버튼 → 질주 ${q1.run} '${q1.txt}'`,q1.run&&q1.txt==='질주 중'&&q1.on);
  await p.tap('#t_run');await p.waitForTimeout(100);
  const q2=await p.evaluate(()=>{const h=mkAlly('pet','말',P.x+.8,P.y);allies.push(h);P.qi=P.maxQi-20;ctxT=0;touchHud();return{ride:$('t_ride').hidden,rt:$('t_ride').textContent,med:$('t_med').hidden,ctx:$('t_ctx').hidden?'':$('t_ctx').textContent}});
  ok(`말 곁 + 내공 부족: 승마 '${q2.rt}' 보임, 운기 보임, 상황 버튼은 승마·운기가 아님('${q2.ctx}')`,!q2.ride&&q2.rt==='승마'&&!q2.med&&q2.ctx!=='승마'&&q2.ctx!=='운기');
  await p.tap('#t_ride');await p.waitForTimeout(150);
  const q3=await p.evaluate(()=>{ctxT=0;touchHud();return{ride:!!P.ride,rt:$('t_ride').textContent,med:$('t_med').hidden}});
  ok(`승마 버튼 → 탐 ${q3.ride} '${q3.rt}', 말 위에서는 운기 숨김`,q3.ride&&q3.rt==='하마'&&q3.med);
  await p.tap('#t_ride');await p.waitForTimeout(150);
  await p.tap('#t_med');await p.waitForTimeout(150);
  const q4=await p.evaluate(()=>{ctxT=0;touchHud();return{med:P.medit,txt:$('t_med').textContent,ride:!!P.ride}});
  ok(`하마 뒤 운기 버튼 → 운기 ${q4.med} '${q4.txt}'`,!q4.ride&&q4.med&&q4.txt==='운기 중');
  ok('오류 없음: '+errs.join(' | ').slice(0,200),errs.length===0);
  await b.close();
})();

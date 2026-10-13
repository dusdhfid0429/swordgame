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
  ok(`메뉴 창 목록 ${m.grid.join('·')}`,m.grid.join()==='인물,무공,행낭,동료,생활,임무,정세,강호사,천하 지도,수련');
  ok('메뉴에 질주·말·운기 없음, 설정 줄에 기록·조작법·PC 조작, 중복 없음',!m.acts.includes('run')&&!m.acts.includes('ride')&&!m.acts.includes('medit')&&m.acts.includes('save')&&m.acts.includes('open:help')&&m.acts.includes('ctl:k')&&!m.dup);
  await p.evaluate(()=>closePanels());
  // 2. 빠른 버튼: 질주 토글, 말이 곁에 있을 때만 승마, 내공이 비면 운기
  const q0=await p.evaluate(()=>{mobs=[];P.qi=P.maxQi;P.hp=P.maxHp;touchHud();ctxT=0;touchHud();return{run:$('t_run').hidden,ride:$('t_ride').hidden,med:$('t_med').hidden}});
  ok(`빠른 버튼 처음: 질주 보임, 승마 숨김(${q0.ride}), 운기 숨김(${q0.med})`,!q0.run&&q0.ride&&q0.med);
  await p.tap('#t_run');await p.waitForTimeout(200);
  const q1=await p.evaluate(()=>{ctxT=0;touchHud();return{run:P.run,txt:$('t_run').textContent,on:$('t_run').classList.contains('on')}});
  ok(`질주 버튼 → 질주 ${q1.run} '${q1.txt}'`,q1.run&&q1.txt==='질주'&&q1.on);
  await p.tap('#t_run');await p.waitForTimeout(100);
  const q2=await p.evaluate(()=>{const h=mkAlly('pet','말',P.x+.8,P.y);allies.push(h);P.qi=P.maxQi-20;ctxT=0;touchHud();return{ride:$('t_ride').hidden,rt:$('t_ride').textContent,med:$('t_med').hidden,ctx:$('t_ctx').hidden?'':$('t_ctx').textContent}});
  ok(`말 곁 + 내공 부족: 승마 '${q2.rt}' 보임, 운기 보임, 상황 버튼은 승마·운기가 아님('${q2.ctx}')`,!q2.ride&&q2.rt==='승마'&&!q2.med&&q2.ctx!=='승마'&&q2.ctx!=='운기');
  await p.tap('#t_ride');await p.waitForTimeout(150);
  const q3=await p.evaluate(()=>{ctxT=0;touchHud();return{ride:!!P.ride,rt:$('t_ride').textContent,med:$('t_med').hidden}});
  ok(`승마 버튼 → 탐 ${q3.ride} '${q3.rt}', 말 위에서는 운기 숨김`,q3.ride&&q3.rt==='하마'&&q3.med);
  await p.tap('#t_ride');await p.waitForTimeout(150);
  await p.tap('#t_med');await p.waitForTimeout(150);
  const q4=await p.evaluate(()=>{ctxT=0;touchHud();return{med:P.medit,txt:$('t_med').textContent,ride:!!P.ride}});
  ok(`하마 뒤 운기 버튼 → 운기 ${q4.med} '${q4.txt}'`,!q4.ride&&q4.med&&q4.txt==='운기');
  // 5. 퀵슬롯 (B안, 2026-10-13): 금창약·소환단 칸은 수량을 보이고 누르면 쓴다. 비도 칸은 암기를 익혀야 보인다
  const s1=await p.evaluate(()=>{P.medit=false;P.mats.금창약=2;P.mats.소환단=0;P.sp.암기=0;P.hp=P.maxHp-30;touchHud();return{gc:$('ts_gc').querySelector('em').textContent,gcOff:$('ts_gc').classList.contains('off'),shOff:$('ts_sh').classList.contains('off'),bd:$('ts_bd').hidden,pot:!!$('t_pot')}});
  ok(`퀵슬롯: 금창약 ${s1.gc}(off ${s1.gcOff}), 소환단 없음 off ${s1.shOff}, 비도 숨김 ${s1.bd}, 옛 약 버튼 없음 ${!s1.pot}`,s1.gc==='2'&&!s1.gcOff&&s1.shOff&&s1.bd&&!s1.pot);
  await p.tap('#ts_gc');await p.waitForTimeout(150);
  const s2=await p.evaluate(()=>{P.sp.암기=1;P.mats.비도=3;touchHud();return{gc:P.mats.금창약,bd:$('ts_bd').hidden,bdn:$('ts_bd').querySelector('em').textContent}});
  ok(`금창약 칸 누름 → 남은 금창약 ${s2.gc}, 암기 익히면 비도 칸 보임(${s2.bdn}자루)`,s2.gc===1&&!s2.bd&&s2.bdn==='3');
  // 6. 자리: 공격 부채꼴·토글 열·퀵슬롯이 서로 겹치지 않는다 (세로 화면)
  const ov=await p.evaluate(()=>{const ids=['t_atk','t_ult','t_leap','t_step','t_spec','t_ctx','t_run','t_force','t_med','t_ride','ts_gc','ts_sh','ts_bd'].filter(i=>!$(i).hidden);const R=ids.map(i=>[i,$(i).getBoundingClientRect()]);const bad=[];
    for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i][1],b=R[j][1];if(a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom)bad.push(R[i][0]+'×'+R[j][0])}
    const w=innerWidth,h=innerHeight;for(const[i,r]of R)if(r.left<0||r.right>w||r.top<0||r.bottom>h)bad.push(i+' 화면 밖');return{n:ids.length,bad}});
  ok(`HUD 단추 ${ov.n}개 서로 안 겹치고 화면 안 (${ov.bad.join(', ')||'문제 없음'})`,!ov.bad.length);
  // 7. 자동초식은 필살기를 안 쓴다 (2026-10-13): 모든 초식을 익히고 연속기를 2번 이은 뒤 autoAttack을 불러도 ucd가 0
  const au=await p.evaluate(()=>{const a=art(),s=A(a.id);s.f=s.f.map(()=>true);s.p=100;P.qi=P.maxQi;P.ucd=0;P.gcd=0;P.chain={t:time,n:3,last:-1};const e=mkMob('늑대',P.x+.6,P.y);mobs.push(e);P.target=e;const cut=[];for(let i=0;i<a.forms.length;i++)P.fcd[i]=9;autoAttack(e);const r={ucd:P.ucd,all:allLearned(a.id)};mobs=[];P.target=null;for(let i=0;i<a.forms.length;i++)P.fcd[i]=0;return r});
  ok(`자동초식: 초식 다 익힘 ${au.all}, 연속기 중 autoAttack 뒤 필살 안 씀 (ucd ${au.ucd})`,au.all&&au.ucd===0);
  ok('오류 없음: '+errs.join(' | ').slice(0,200),errs.length===0);
  await b.close();
})();

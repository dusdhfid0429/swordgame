// 임무 진행도(지역 이름 아래), 지난해 문파 임무 유지, 기록창(메시지창 클릭)과 고정 닫기 버튼
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 의뢰를 맡으면 지역 이름 아래에 진행도가 뜬다
  const t0=await p.evaluate(()=>$('qtrack').hidden);
  await p.evaluate(()=>{const q=QUESTS.find(q=>q.kind==='kill');P.quests.push({...q,have:0});});await p.waitForTimeout(600);
  const t1=await p.evaluate(()=>({h:$('qtrack').hidden,t:$('qtrack').textContent,top:$('qtrack').getBoundingClientRect().top,zone:$('zone').getBoundingClientRect().bottom}));
  ok(`임무 없을 땐 숨고(${t0}), 맡으면 지역 아래에 "${t1.t}"`,t0&&!t1.h&&/0\/\d+/.test(t1.t)&&t1.top>t1.zone);
  await p.evaluate(()=>{P.quests[0].have=2});await p.waitForTimeout(600);
  ok('진행도가 갱신된다',await p.evaluate(()=>/2\/\d+/.test($('qtrack').textContent)));
  // 2. 해가 바뀌어도 맡은 문파 임무는 남고 보고할 수 있다
  const sc=await p.evaluate(()=>{const s=Object.values(SECTS)[0];P.sect=s.id;P.merit[s.id]=0;P.mtot[s.id]=0;const q=sectMissions(s)[0];P.quests.push({...q,have:q.cnt});
    P.age+=1;const keys=sectMissions(s).map(m=>m.key);return{kept:P.quests.some(x=>x.key===q.key),gone:!keys.includes(q.key),n:P.quests.length}});
  ok(`해가 바뀐 뒤에도 임무가 남아 있다 (${sc.n}개, 새 목록에서 빠짐 ${sc.gone})`,sc.kept&&sc.gone);
  const rep=await p.evaluate(()=>{try{const h=sectDetail(SECTS[P.sect],true);return{has:h.includes('지난해 임무'),rep:h.includes('보고하기')}}catch(e){return{err:e.message}}});
  ok(`장문인 창에 지난해 임무가 보고 가능 상태로 보인다 ${JSON.stringify(rep)}`,rep.has&&rep.rep);
  // 3. 메시지창을 누르면 기록창이 열리고, 끝까지 내려도 닫기 버튼이 보인다
  await p.evaluate(()=>{for(let i=0;i<40;i++)log('기록 시험 '+i,'sys')});
  await p.click('#log');await p.waitForTimeout(300);
  const lg=await p.evaluate(()=>({panel,n:document.querySelectorAll('.logs p').length,first:document.querySelector('.logs p').textContent}));
  ok(`기록창 ${lg.panel}, ${lg.n}건, 맨 위 "${lg.first}"`,lg.panel==='logs'&&lg.n>=40&&lg.first.includes('기록 시험 39'));
  await p.evaluate(()=>{$('wbody').scrollTop=99999});await p.waitForTimeout(200);
  const cl=await p.evaluate(()=>{const r=$('wx').getBoundingClientRect(),w=$('win').getBoundingClientRect();return{v:r.top>=w.top&&r.bottom<=w.bottom&&r.top<w.top+80,s:$('wbody').scrollTop}});
  ok(`스크롤 ${cl.s}px 내려도 닫기 버튼이 위에 고정`,cl.v&&cl.s>100);
  await p.click('#wx');await p.waitForTimeout(200);ok('닫기 버튼으로 닫힌다',await p.evaluate(()=>$('win').hidden&&!paused));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// v163: 폐관으로 벽을 깨면 오른 경지마다 다른 돌파 연출 (소주천 → 대주천 → 임독양맥 → 강기 → 오기조원 → 삼화취정 → 생사현관 → 천인합일)
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 모든 경지(1..8)를 처음부터 끝까지 그려 본다. 표보다 높은 경지는 마지막 줄을 쓴다
  const r=await p.evaluate(()=>{paused=true;mobs.length=0;tod=.5;const out=[];
    for(let i=1;i<=9;i++){fx.length=0;const d=brkFx(i),f=fx.find(q=>q.t==='brk');
      for(let k=0;k<=20;k++){f.life=f.max*(1-k/20);time+=.03;draw()}out.push({i,n:d&&d.n,r:f.r,L:f.max})}
    return out});
  ok(`경지마다 이름 ${r.map(q=>q.n).join(' · ')}`,r.slice(0,8).every(q=>q.n)&&new Set(r.slice(0,8).map(q=>q.n)).size===8&&r[8].r===8);
  ok(`높을수록 길다 ${r.map(q=>q.L).join(',')}`,r.slice(0,8).every((q,j)=>!j||q.L>=r[j-1].L));
  // 한 장씩: 경지마다 가장 볼 만한 때
  const at=[0,.55,.5,.6,.5,.62,.84,.6,.55];
  for(let i=1;i<=8;i++){await p.evaluate(([i,t])=>{fx.length=0;brkFx(i);const f=fx.find(q=>q.t==='brk');f.life=f.max*(1-t)},[i,at[i]]);await p.waitForTimeout(120);await p.screenshot({path:shot('brk_'+i)})}
  // 폐관 성공 → 돌파 연출. v241: 수련 창을 내리고, 연출 동안 알림·배너를 붙잡았다가 끝나면 '돌파 결과' 한 장으로
  const g=await p.evaluate(()=>{fx.length=0;BRKS=null;P.realm=0;P.rfx={};openTrain();const R=Math.random;pgWhy=()=>'';passYears=()=>true;Math.random=()=>0;pgFinish();Math.random=R;
    return{realm:P.realm,brk:fx.some(q=>q.t==='brk'&&q.r===1),show:!!BRKS,trn:trnOpen,on:document.body.classList.contains('brk-on'),sys:document.querySelectorAll('.sysmsg p').length,held:BRKH&&BRKH.sys.length,ban:document.getElementById('banner').classList.contains('on')}});
  ok(`폐관 성공: 경지 ${g.realm}, 연출 ${g.brk}, 수련 창 닫힘 ${!g.trn}, 화면 알림 ${g.sys}개·배너 ${g.ban} (붙잡은 줄 ${g.held})`,g.realm===1&&g.brk&&g.show&&!g.trn&&g.on&&g.sys===0&&!g.ban&&g.held>=2);
  await p.evaluate(()=>{paused=false});
  await p.waitForFunction(()=>!BRKS,null,{timeout:15000}).catch(()=>{});await p.waitForTimeout(500);
  const cd=await p.evaluate(()=>{const e=document.getElementById('brkcard');return{on:!!(e&&e.classList.contains('on')),txt:e?e.textContent:'',brkOn:document.body.classList.contains('brk-on'),aura:!!P.brkA}});
  ok(`연출이 끝나면 결과 한 장: "${cd.txt.slice(0,40)}…", 잔상 ${cd.aura}`,cd.on&&cd.txt.includes('벽을 깨다')&&cd.txt.includes('소주천')&&!cd.brkOn&&cd.aura);
  await p.screenshot({path:shot('brk_card')});
  const cl=await p.evaluate(()=>{document.querySelector('#brkcard button').click();const e=document.getElementById('brkcard');return{off:!e.classList.contains('on'),trn:trnOpen}});
  ok(`확인을 누르면 닫히고 수련 창이 다시 열린다 ${JSON.stringify(cl)}`,cl.off&&cl.trn);
  // 실패(주화입마)면 붙잡지 않고 바로 알린다
  const fl=await p.evaluate(()=>{closeTrain();P.realm=1;const R=Math.random;pgWhy=()=>'';passYears=()=>true;pgChance=()=>0;Math.random=()=>.99;pgFinish();Math.random=R;return{held:!!BRKH,show:!!BRKS,ban:document.getElementById('banner').textContent}});
  ok(`실패하면 바로 배너 "${fl.ban}"`,!fl.held&&!fl.show&&fl.ban.includes('주화입마'));
  // v164: 벽은 계단식. 절정·화경·현경으로 넘는 간격은 예전의 두 배, 초절정은 완만
  const w=await p.evaluate(()=>({oe:REALM_NEED.oe,ne:REALM_NEED.ne,mu:REALM_NEED.mu,qi:REALM_QI.slice()}));
  const gap=(a,i)=>a[i]-a[i-1],k=i=>gap(w.ne,i)/gap(w.qi,i);
  ok(`계단식 문턱 외공 ${w.oe} · 내공 ${w.ne} · 무리 ${w.mu} (내공 간격 배율 ${[1,2,3,4,5,6].map(i=>k(i).toFixed(2))})`,[3,5,6].every(i=>k(i)>=1.9)&&k(4)<1.2&&k(1)===1&&w.oe[1]===42&&w.oe[2]===54&&gap(w.oe,3)>gap(w.oe,4));
  ok(`옛 내공 경지표 REALM_QI는 그대로 ${w.qi}`,w.qi[3]===380);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

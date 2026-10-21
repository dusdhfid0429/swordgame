// v163: 폐관으로 벽을 깨면 오른 경지마다 다른 돌파 연출 (소주천 → 대주천 → 임독양맥 → 강기 → 삼화취정 → 오기조원 → 생사현관 → 천인합일)
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
  const at=[0,.55,.5,.6,.5,.35,.62,.6,.55];
  for(let i=1;i<=8;i++){await p.evaluate(([i,t])=>{fx.length=0;brkFx(i);const f=fx.find(q=>q.t==='brk');f.life=f.max*(1-t)},[i,at[i]]);await p.waitForTimeout(120);await p.screenshot({path:shot('brk_'+i)})}
  // 폐관 성공 → 돌파 연출과 배너
  const g=await p.evaluate(()=>{fx.length=0;P.realm=0;P.rfx={};const R=Math.random;pgWhy=()=>'';passYears=()=>true;Math.random=()=>0;pgFinish();Math.random=R;
    return{realm:P.realm,brk:fx.some(q=>q.t==='brk'&&q.r===1),ban:document.getElementById('banner').textContent}});
  ok(`폐관 성공: 경지 ${g.realm}, 연출 ${g.brk}, 배너 "${g.ban}"`,g.realm===1&&g.brk&&g.ban.includes('소주천'));
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

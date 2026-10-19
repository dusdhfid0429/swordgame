// 사냥 임무를 맡으면 가장 가까운 출몰지를 알려 준다 (v148, 사용자 2026-10-19 "늑대를 잡는 임무면 임무를 받을 당시 가장 가까운 출몰지역에 대해 알려줘")
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 개봉에서 늑대·혈교무인 임무를 맡으면 가까운 출몰지를 알린다
  const r1=await p.evaluate(()=>{const reg=REG;P.quests.push({n:'늑대 사냥',kind:'kill',mob:['늑대'],cnt:3,silver:10,have:0,key:'t:w'},{n:'혈교 토벌',kind:'kill',mob:['혈교무인','강시'],cnt:3,silver:10,have:0,key:'t:h'});
    const sp=mobSpots('늑대'),d=regHops(reg),min=Math.min(...sp.map(o=>d[o.id]??999)),nb=mobNearest('늑대');return{reg,sp:sp.length,min,nb,hx:mobNearest('혈교무인')}});
  await p.waitForTimeout(800);
  const r2=await p.evaluate(()=>{const q=P.quests.find(q=>q.key==='t:w'),h=P.quests.find(q=>q.key==='t:h');openPanel('quest');
    return{near:q.near,hn:h.near,log:[...document.querySelectorAll('#log *')].map(e=>e.textContent).filter(t=>t.includes('가장 가까운 출몰지')),card:$('wbody').textContent}});
  ok(`늑대 출몰 ${r1.sp}곳 중 가장 가까운 곳 ${r1.nb&&r1.nb.n} (지역 ${r1.nb&&r1.nb.h}곳, 최소 ${r1.min})`,r1.sp>1&&r1.nb&&r1.nb.h===r1.min&&r1.min<999);
  ok(`혈교무인: ${r1.hx&&r1.hx.n}`,!!r1.hx&&/혈교/.test(r1.hx.n));
  ok(`맡을 때 알림 ${r2.log.length}줄 (${r2.log[0]}), 임무창에 표시`,r2.log.length>=2&&r2.near[0].t&&r2.hn.length===2&&r2.card.includes('맡을 때 가장 가까운 출몰지'));
  // 2. 자리가 바뀌면 다른 곳을 고른다: 출몰지 가운데 한 곳에 가서 맡으면 '바로 이 지역'
  const r3=await p.evaluate(()=>{const o=mobSpots('늑대').find(o=>!o.hq);loadRegion(o.id);P.reg=o.id;const b=mobNearest('늑대');return{id:o.id,b,t:mobNearTxt(b)}});
  ok(`출몰지(${r3.id})에서는 ${r3.t}`,r3.b.h===0&&r3.t.startsWith('바로 이 지역'));
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

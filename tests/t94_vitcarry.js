// v157: 윤회 보상 활력에 이번 생에 실제로 얻은 활력의 몫(GD.VIT_CARRY.share)이 들어간다. 전생에서 받은 몫은 다시 세지 않고 난이도 배율도 다시 곱하지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{
    P.st.end=200;P.vit=0;P.vitEarned=0;P.fame=0;P.good=0;P.evil=0;P.realm=0;P.age=20;
    // 2000을 벌고 다 썼다고 치자 (번 만큼 세고, 쓴 것과 상관없다)
    for(let i=0;i<20;i++){gainVit(100);P.vit=0}
    const earned=P.vitEarned;
    // 전생 몫은 이번 생 벌이에 들지 않고, 난이도 배율도 받지 않는다
    const gd=G.diff;G.diff=0;P.vit=0;gainVit(300,true);const inh=P.vit,earned2=P.vitEarned;G.diff=gd;P.vit=0;
    die('test');
    return{earned,earned2,inh,bonus:G.bonusVit,parts:G.bonusParts,share:GD.VIT_CARRY.share}});
  await p.waitForTimeout(1300);r.html=await p.evaluate(()=>document.body.innerText);
  ok(`번 활력 ${r.earned} = 2000`,r.earned===2000);
  ok(`전생 몫 300은 그대로 ${r.inh}, 이번 생 벌이 그대로 ${r.earned2}`,r.inh===300&&r.earned2===2000);
  ok(`보상 활력 ${r.bonus} = 2000 × ${r.share} (${r.parts&&r.parts.fromVit}) + 업적 ${r.parts&&r.parts.deed}`,r.bonus===Math.round(2000*r.share)+r.parts.deed&&r.parts.fromVit===600);
  ok('윤회 화면에 얻은 활력 몫 표시',r.html.includes('이번 생에 얻은 활력 2000의 30% 600'));
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  console.log(errs.length?'ERRORS':'no console errors');
  await b.close()})();

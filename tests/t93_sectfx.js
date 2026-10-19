// v156: 운기 연출·무공 이펙트 색은 문파 기준 (SECT_FX). 문파 심법 → 그 문파 색, 타고난 심법 + 문파 → 내 문파 색, 문파 없음 → 계열 색, 남의 문파 무공 → 그 문파 색
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const all=Object.keys(SECTS).every(id=>SECT_FX[id]&&SECT_FX[id].length===2);
    const art=id=>Object.values(ARTS).find(a=>a.sect===id);
    P.sect=null;P.sim=null;const none=fxCol(null),nonePair=pFxPair()[0];
    P.sect='hwasan';const base=fxCol(null);
    const s=simOf('mudang')[0];P.sims={...P.sims,[s.id]:1};P.sim=s.id;const own=fxCol(null),pair=pFxPair();
    const other=art('emei').c,dk=simOf('cheonma')[0];P.sims[dk.id]=1;P.sim=dk.id;P.sect='cheonma';const dark=isDark(pFxPair()[0]);
    P.medit=1;for(let i=0;i<30;i++){time+=.03;draw()}P.medit=0;
    const distinct=new Set(Object.values(SECT_FX).map(x=>x[0])).size;
    return{all,none,nonePair,base,own,pair,other,dark,distinct,n:Object.keys(SECTS).length}});
  ok(`문파 ${r.n}곳 모두 색 두 가지, 서로 다른 주색 ${r.distinct}`,r.all&&r.distinct>=r.n-1);
  ok(`문파 없음 ${r.none} (계열 색), 운기 ${r.nonePair}`,r.none==='235,240,250'||r.none==='255,214,120');
  ok(`타고난 심법 + 화산파 → ${r.base}`,r.base===GD_HW());
  ok(`무당 심법 → 무공 ${r.own}, 운기 ${r.pair.join(' / ')}`,r.own==='170,210,255'&&r.pair[1]==='255,255,255');
  ok(`아미파 무인의 무공 → ${r.other}, 천마신교 운기는 검은 마기 ${r.dark}`,r.other==='225,195,255'&&r.dark);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  function GD_HW(){return '255,130,175'}
  await b.close()})();

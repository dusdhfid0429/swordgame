// 경공 1·2·3단 (2026-10-12): 등급별 최고 단계, 숙련 개방, 버튼 연타 순서, 단계별 도트 줄, 비급·문파 화면
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing&&hero2Ok());await p.waitForTimeout(300);
  // 1. 기본 경공은 하승 1단만: 두 번 눌러도 2단이 안 나간다
  const r1=await p.evaluate(()=>{mobs=[];P.qi=P.maxQi;const q0=P.qi;leap();const a=P.leap&&P.leap.st;const q1=P.qi;leap();return{a,st2:P.leap&&P.leap.st,qd:q0-q1,same:P.qi===q1,max:ggMaxStage(),m:ggMast()}});
  ok(`기초 경공: 1단 ${r1.a}, 다시 눌러도 ${r1.st2}단, 내공 -${r1.qd}, 숙련 ${r1.m}`,r1.a===1&&r1.st2===1&&r1.qd===12&&r1.same&&r1.max===1&&r1.m===1);
  await p.waitForFunction(()=>!P.leap);
  // 2. 상승 경공을 익혀도 숙련이 모자라면 1단, 숙련 30이면 2단, 70이면 3단이 열린다
  const r2=await p.evaluate(()=>{P.gk.g_jeun=1;P.gkcur='g_jeun';P.ggm.g_jeun=0;const a=ggMaxStage();P.ggm.g_jeun=30;const b=ggMaxStage();P.ggm.g_jeun=70;const c=ggMaxStage();P.gkcur='g_yeonun';P.gk.g_yeonun=1;P.ggm.g_yeonun=100;const d=ggMaxStage();P.gkcur='g_jeun';return{a,b,c,d}});
  ok(`제운종 숙련 0→${r2.a}단, 30→${r2.b}단, 70→${r2.c}단 · 중승 연운보는 숙련 100이어도 ${r2.d}단`,r2.a===1&&r2.b===2&&r2.c===3&&r2.d===2);
  // 3. 이어 누르면 1→2→3단, 단계마다 더 멀리, 도트 줄이 j→j2→j3
  const r3=await p.evaluate(()=>{P.qi=P.maxQi;P.ggc=null;P.leap=null;const row=f=>Object.entries(A2).find(([k,v])=>f[0]>=v[0]&&f[0]<v[0]+v[1])[0];const out=[];
    for(let i=0;i<4;i++){const x0=P.x,y0=P.y;leap();const L=P.leap;out.push({st:L&&L.st,d:L?+Math.hypot(L.ex-x0,L.ey-y0).toFixed(1):0,row:row(heroFrame()),sj:P.sjSt});P.leap=null}
    return{out,c:P.ggc&&P.ggc.n}});
  ok(`연타: ${r3.out.map(o=>`${o.st}단 ${o.d}칸 ${o.row}`).join(' → ')}`,r3.out.map(o=>o.st).join()==='1,2,3,1'&&r3.out.map(o=>o.row).join()==='j,j2,j3,j');
  // 4. 내려선 지 0.5초가 지나면 다시 1단부터
  await p.waitForTimeout(1400);const r4=await p.evaluate(()=>{P.qi=P.maxQi;const n=ggNext();return n});
  ok(`창이 닫히면 다음은 ${r4}단`,r4===1);
  // 5. 비급·문파 화면·상점·저장
  const r5=await p.evaluate(()=>{const it=mkGBook('g_cheongpung');P.bag.push(it);readBook(it);const learned=!!P.gk.g_cheongpung;
    openPanel('arts');const html=$('wbody').innerHTML;closePanels();const shop=(SHOP.gen||[]).some(x=>x[0]==='gbook:g_yeonun');
    saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));return{learned,card:html.includes('경공')&&html.includes('청풍답월'),shop,saved:d.P.gk&&d.P.gk.g_jeun===1&&d.P.ggm.g_jeun>=70}});
  ok(`비급으로 익힘 ${r5.learned}, 인물창 카드 ${r5.card}, 잡화점 ${r5.shop}, 저장 ${r5.saved}`,r5.learned&&r5.card&&r5.shop&&r5.saved);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

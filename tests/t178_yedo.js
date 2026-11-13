// v264 예도 이펙트 (사용자 2026-11-13 "예도 이펙트가 도 이펙트랑 같아서 구분이 안 돼. 날렵하고 도에 비해 빠르게")
// 예도는 도의 넓은 반달·세 줄 할퀸 자국·푸른 반달이 그려진 도 시트 대신: 가늘고 빠른 칼선(yedoFx) + 일섬 적중(iseom) + 검 클립의 가는 칼선 장, 동작도 더 빠르다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const strike=cls=>p.evaluate(async cls=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===cls&&!ARTS[k].base);P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.eq.weapon=mkWeapon(cls,1,0);
    mobs=[];fx=[];sched=[];P.realm=0;P.bcd=P.gcd=0;P.fx=1;P.fy=0;const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;mobs=[e];basicStrike(e);
    const arc=fx.find(f=>f.t==='arc');
    // 그려 보기: 몇 프레임 동안 오류 없이 지나가는지
    await new Promise(z=>setTimeout(z,250));
    return{arc:arc&&{wc:arc.wc,life:+arc.max.toFixed(3)},iseom:fx.some(f=>f.t==='iseom')||null,claw:fx.some(f=>f.t==='claw'),row:P.atkRow,satk:+P.satkMax.toFixed(3),swing:+P.swingMax.toFixed(3)}},cls);
  const d=await strike('도'),y=await strike('예');
  console.log(JSON.stringify({d,y}));
  ok(`도 평타는 그대로 할퀸 자국 (${d.claw}) · 도 시트 줄 ${d.row}`,d.claw&&d.row==='도');
  ok(`예도 평타 반달은 예도 계열(${y.arc&&y.arc.wc}), 할퀸 자국 없음`,y.arc&&y.arc.wc==='예'&&!y.claw);
  const y2=await p.evaluate(()=>{fx=[];const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;fxHit(mkX(P.cur),e);return fx.some(f=>f.t==='iseom')});
  ok('예도 적중은 일섬 한 줄',y2);
  ok(`예도 기운은 도보다 짧게 남는다 (${y.arc&&y.arc.life} < ${d.arc&&d.arc.life})`,y.arc&&d.arc&&y.arc.life<d.arc.life);
  ok(`예도는 검 클립 줄(가는 칼선 장)을 쓴다: ${y.row}`,y.row==='예');
  ok(`예도 동작이 도보다 빠르다: 몸 ${y.swing}<${d.swing}`,y.swing<d.swing);
  // 예도 기운 그림자(현경) 모양과 투사체 반달이 오류 없이 그려진다
  const sh=await p.evaluate(async()=>{fx=[];P.realm=6;P.bcd=P.gcd=0;P.bpT=P.mhT=time;const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;mobs=[e];const R=Math.random;Math.random=()=>.99;basicStrike(e);Math.random=R;
    const k=fx.filter(f=>f.t==='bt').map(f=>f.cls);await new Promise(z=>setTimeout(z,200));P.realm=0;return k});
  ok(`현경 그림자는 예도 모양 (${sh.join(',')})`,sh.length===2&&sh.every(c=>c==='예'));
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

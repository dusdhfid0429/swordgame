// v259 싸움의 내상과 운기요상 (동훈님 2026-11-12, 적용 계획 PR5): 우두머리 수·깊은 일격으로 내상, 졸개·비무는 없음, 운기요상·호법·쉬기로 낫는다
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 걸리는 때: 우두머리 수(확률 0이면 안 걸림 → 1이면 걸림), 깊은 일격(정예가 20% 아래로), 졸개·비무·이미 상함은 안 걸림
  const r1=await p.evaluate(()=>{const R=Math.random;const reset=()=>{P.inj=0;P.injS=0;P.injK=null;P.maxHp=1000};const out={};
    reset();Math.random=()=>.9;P._bm=1;P.hp=800;runHooks('hurtDone',{src:{d:{boss:1}},hp0:900});out.bmMiss=P.inj;
    reset();Math.random=()=>0;P.hp=800;runHooks('hurtDone',{src:{d:{boss:1}},hp0:900});P._bm=0;out.bm=P.inj>0&&P.injK;
    reset();P.hp=150;runHooks('hurtDone',{src:{rank:2,d:{}},hp0:400});out.deep=P.inj>0;
    reset();P.hp=150;runHooks('hurtDone',{src:{rank:0,d:{}},hp0:400});out.minion=P.inj;
    reset();G.duel=true;P.hp=150;runHooks('hurtDone',{src:{rank:2,d:{}},hp0:400});G.duel=false;out.duel=P.inj;
    reset();P.inj=99;P.injS=2;P.hp=150;runHooks('hurtDone',{src:{rank:2,d:{}},hp0:400});out.keep=P.injS;Math.random=R;P.hp=P.maxHp;return out});
  ok(`걸림: 우두머리 수 빗나감 ${r1.bmMiss} · 맞음 ${r1.bm} · 깊은 일격 ${r1.deep} · 졸개 ${r1.minion} · 비무 ${r1.duel} · 무거운 후유증 그대로 ${r1.keep}`,r1.bmMiss===0&&r1.bm==='fight'&&r1.deep&&r1.minion===0&&r1.duel===0&&r1.keep===2);
  // 2. 길이·위력: 세 달, 공격력 0.85배
  const r2=await p.evaluate(()=>{P.inj=0;nsHit('시험');return{m:P.inj/DAY_SEC,mul:injMul()}});
  ok(`내상 ${r2.m}달 · 공격력 ×${r2.mul}`,r2.m===3&&r2.mul===.85);
  // 3. 운기요상: 혼자 두 배, 호법(동료) 곁이면 다섯 배 (tick이 더하는 몫만 잰다)
  const r3=await p.evaluate(()=>{P.medit=true;const a0=allies;allies=[];P.hob=0;P.inj=300;runHooks('tick',1);const solo=300-P.inj;P.hob=1;P.inj=300;runHooks('tick',1);const hob=300-P.inj;P.hob=0;P.medit=false;allies=a0;return{solo,hob}});
  ok(`운기요상 1초에 더 줄어드는 몫: 혼자 ${r3.solo} · 호법 ${r3.hob}`,r3.solo===1&&r3.hob===4);
  // 4. 쉬면 싸움의 내상은 낫고, 주화입마 후유증은 그대로
  const r4=await p.evaluate(()=>{P.inj=300;P.injS=1;P.injK='fight';act('rest');const f=P.inj;P.inj=300;P.injS=1;P.injK=null;act('rest');return{f,z:P.inj}});
  ok(`쉬기: 싸움의 내상 ${r4.f} · 주화입마 후유증 ${r4.z}`,r4.f===0&&r4.z===300);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

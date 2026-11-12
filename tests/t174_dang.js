// v259 사천당가의 독과 해독 (동훈님 2026-11-12, 적용 계획 PR4): 당가 정예에게 당가독, 해독단 무효, 운기조식·쉬기·당가 해독제, 해독제 값과 우호도, 은원 두 배·세 배
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 당가 정예에게 맞으면 걸리고, 졸개·다른 문파는 안 걸린다. 걸린 동안 다시 안 걸린다
  const r1=await p.evaluate(()=>{const R=Math.random;Math.random=()=>0;const hit=src=>{P.tdok=0;runHooks('hurtDone',{src,dm:1});return P.tdok};
    const a=hit({sect:'dang',rank:2,d:{}}),z=hit({sect:'dang',rank:0,d:{}}),o=hit({sect:'mudang',rank:3,d:{}}),bo=hit({sect:'dang',rank:0,d:{boss:1}});
    P.tdok=5;runHooks('hurtDone',{src:{sect:'dang',rank:2,d:{}},dm:1});const again=P.tdok;Math.random=R;return{a,z,o,bo,again}});
  ok(`걸림: 정예 ${r1.a}초 · 졸개 ${r1.z} · 다른 문파 ${r1.o} · 우두머리 ${r1.bo} · 걸린 동안 다시 ${r1.again}`,r1.a===15&&r1.z===0&&r1.o===0&&r1.bo===15&&r1.again===5);
  // 2. 생명이 빠지고, 운기조식이면 세 배 빨리 빠진다
  const r2=await p.evaluate(()=>{P.hp=P.maxHp=1000;P.tdok=15;P.medit=false;runHooks('tick',1);const a=P.tdok,h=P.hp;P.medit=true;runHooks('tick',1);const m=P.tdok;P.medit=false;return{a,h,m}});
  ok(`빠짐: 1초 뒤 ${r2.a}초 남음, 생명 ${r2.h} · 운기조식 1초 뒤 ${r2.m}초`,r2.a===14&&r2.h===992&&r2.m===11);
  // 3. 해독단은 듣지 않고, 당가 해독제는 듣는다
  const r3=await p.evaluate(()=>{P.tdok=10;P.poison=0;P.mats.해독단=1;P.mats.당가해독제=1;useCon('해독단');const a=P.tdok,k=P.mats.해독단;useCon('당가해독제');return{a,k,b:P.tdok,left:P.mats.당가해독제}});
  ok(`해독단 뒤 ${r3.a}초(해독단 남음 ${r3.k}) · 당가 해독제 뒤 ${r3.b}초 (남은 해독제 ${r3.left})`,r3.a===10&&r3.k===1&&r3.b===0&&r3.left===0);
  // 4. 해독제 값: 우호 40, 중립 120, 경계 이하 안 판다. 장문인 대화에 카드
  const r4=await p.evaluate(()=>{const v=s=>{repD().sect.dang=s;return dangPrice()};const out={fr:v(999),ne:(repD().sect.dang=0,repD().sect.dang=-repFacBase?0:0,null)};
    const st=x=>{repD().sect.dang=x-repSect('dang')+(repD().sect.dang||0)};st(50);out.fr=dangPrice();st(10);out.ne=dangPrice();st(-10);out.ca=dangPrice();
    st(50);P.silver=500;const h=hqDlg({hq:'dang',n:'장문인'});act('dangbuy');return{...out,card:h.includes('당가 해독제'),got:P.mats.당가해독제,silver:P.silver}});
  ok(`해독제 값: 우호 ${r4.fr} · 중립 ${r4.ne} · 경계 ${r4.ca} · 카드 ${r4.card} · 사서 ${r4.got}개 은자 ${r4.silver}`,r4.fr===40&&r4.ne===120&&r4.ca===0&&r4.card&&r4.got===1&&r4.silver===460);
  // 5. 은원: 당가 우호도는 오를 때 두 배, 떨어질 때 세 배. 다른 문파는 그대로
  const r5=await p.evaluate(()=>{const d=sid=>{const a=repSect(sid);return x=>{const b=repSect(sid);repAdd(sid,0,x);return Math.round((repSect(sid)-b)*10)/10}};
    repD().sect.dang=0;repD().sect.mudang=0;const g=d('dang'),m=d('mudang');return{up:g(5),down:g(-5),mu:m(5)}});
  ok(`은원: 당가 +5 → ${r5.up} · -5 → ${r5.down} · 무당 +5 → ${r5.mu}`,r5.up===10&&r5.down===-15&&r5.mu===5);
  // 6. 쉬면 풀린다
  const r6=await p.evaluate(()=>{P.tdok=9;act('rest');return P.tdok});
  ok(`집에서 쉬면 ${r6}`,r6===0);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

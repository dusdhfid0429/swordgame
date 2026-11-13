// v232 필살기 발동 연출 뒤에 무공이 나가고, 연출 중 강하게 맞으면 내공만 잃고 끊긴다 (동훈님 2026-11-03)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{for(const m of mobs)m.hp=0;mobs=[];window.mk=(k,dx)=>{const e=mkMob(k,P.x+dx,P.y);mobs.push(e);return e};
    const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&ARTS[k].ult&&!ARTS[k].side);P.arts[id]={p:99,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.eq.weapon=mkWeapon('검',1,0);recalc();
    window.prep=()=>{for(const m of mobs)m.hp=0;mobs=[];P.hp=P.maxHp=5000;P.qi=P.maxQi=9999;P.ucd=0;P.inv=0;P.ultCast=null;const e=mk('산적',1.2);e.hp=e.maxHp=99999;e.atk=0;e.aggro=false;P.target=e;return e}});
  // 1. 누르면 내공은 바로 들고 연출만 흐른다. 적은 아직 맞지 않는다
  let r=await p.evaluate(()=>{const e=prep();const q=P.qi;ultimate();const c=document.getElementById('callout');
    const o={cast:!!P.ultCast,spent:q-P.qi,hp:e.maxHp-e.hp,co:c&&c.classList.contains('on')&&c.classList.contains('ult'),fx:!!(c&&c._co),x:P.x};
    P.fx=1;keys.arrowright=true;update(.3);keys.arrowright=false;o.moved=Math.abs(P.x-o.x);o.mid=e.maxHp-e.hp;o.form=useForm(0);paused=true;return o});   // 스크린샷을 찍는 동안 실제 시간 루프가 연출을 끝내고 적이 거닐어 빗나가지 않게 멈춘다 (CI에서 피해 0으로 실패)
  ok(`누르자 연출 시작 ${r.cast}, 내공 ${r.spent} 소모, 그 사이 적 피해 ${r.mid}, 제자리 ${r.moved.toFixed(3)}, 초식 막힘 ${r.form}, 속성 캔버스 ${r.fx}`,r.cast&&r.spent>0&&r.hp===0&&r.mid===0&&r.moved<.01&&r.form===false&&r.co&&r.fx);
  await p.waitForTimeout(500);await p.screenshot({path:require('path').resolve(__dirname,'shots/t149_cast.png')});
  r=await p.evaluate(()=>{const e=P.target;paused=false;const pin=()=>{e.x=P.x+1.2;e.y=P.y;e.path=null};   // 필살기 타격은 sched로 나뉘어 늦게 닿는다: 연출이 끝난 뒤 1.5초 더 돌리고, 어그로 없는 적이 거닐어 벗어나지 않게 붙든다
    for(let t=0;t<ULTC.cast+.3&&P.ultCast;t+=.05){pin();update(.05)}for(let t=0;t<1.5&&e.maxHp-e.hp<=0;t+=.05){pin();update(.05)}return{cast:!!P.ultCast,dm:e.maxHp-e.hp}});
  ok(`연출이 끝나고 무공이 나감 (피해 ${r.dm})`,!r.cast&&r.dm>0);
  // 2. 약한 공격은 끊지 못한다
  r=await p.evaluate(()=>{const e=prep();ultimate();const s={atk:P.maxHp*.03,hm:-999};const R=Math.random;Math.random=()=>.99;hurtP(P.maxHp*.03,s);Math.random=R;return{cast:!!P.ultCast}});
  ok(`최대 생명 3% 평타는 연출을 끊지 못함`,r.cast);
  // 3. 강한 공격(최대 생명 10% 이상)은 끊는다: 내공은 돌려받지 못하고 무공도 안 나간다, 글자가 깨진다
  r=await p.evaluate(()=>{const e=P.target;const q=P.qi;const R=Math.random;Math.random=()=>.99;hurtP(P.maxHp*.15/(1-guard()),{atk:1e9,hm:-999});Math.random=R;const c=document.getElementById('callout');
    const u0=P.ultT;const o={cast:!!P.ultCast,qi:q-P.qi,broke:c.classList.contains('broke'),ucd:P.ucd};for(let t=0;t<2;t+=.05)update(.05);o.dm=P.ultT===u0?0:1;return o});
  await p.waitForTimeout(120);await p.screenshot({path:require('path').resolve(__dirname,'shots/t149_break.png')});
  ok(`강타에 끊김 ${!r.cast}, 글자 깨짐 ${r.broke}, 내공 그대로 잃음(돌려받음 ${-r.qi}), 쿨타임 ${r.ucd.toFixed(1)}, 필살 나감 ${r.dm}`,!r.cast&&r.broke&&r.qi===0&&r.ucd>0&&r.dm===0);
  // 4. 큰 수(평타의 1.6배 내려찍기)는 피해가 적어도 끊는다
  r=await p.evaluate(()=>{prep();ultimate();const R=Math.random;Math.random=()=>.99;hurtP(16,{atk:10,hm:-999});Math.random=R;return{cast:!!P.ultCast}});
  ok(`내려찍기(평타×1.6)에 끊김`,!r.cast);
  // 5. 속성마다 기운 설정이 있다
  r=await p.evaluate(()=>Object.keys(EL).filter(k=>!COFX[k]));ok(`모든 심법 속성에 연출 기운 (빠진 것 ${r.join()||'없음'})`,r.length===0);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

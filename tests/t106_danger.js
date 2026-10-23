// v172 피격·빈사 알림: 맞으면 가장자리 번쩍임·큰 숫자, 적이 칠 준비를 하면 머리 위 ! (쓰러질 한 방이면 !!), 한 방이 남은 생명을 넘으면 '위험' 박동
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const tk=n=>p.evaluate(n=>{for(let i=0;i<n;i++){time+=.05;if(window.__e)__e.aggro=true;runHooks("tick",.05)}draw()},n);
  // 1) 생명 가득, 약한 산적 하나: 위험 아님
  const r1=await p.evaluate(()=>{paused=true;closePanels();enterRegion('lm_shaanxi_2',10,10);mobs.length=0;tod=.45;P.hp=P.maxHp;P.inv=0;
    const e=mkMob('산적',P.x+1,P.y);e.aggro=true;e.atk=1;mobs.push(e);window.__e=e;paused=true;return{hp:P.hp}});
  await tk(6);
  let s=await p.evaluate(()=>({lv:dngLvl,cls:$('hpgauge').className,est:hitEst(__e,__e.atk)}));
  ok(`생명 가득·약한 적 → 위험 아님 (lv ${s.lv}, 어림 ${s.est})`,s.lv===0&&!/dng/.test(s.cls));
  // 2) 생명 낮음(30%), 적 한 방 작음 → 1단계
  await p.evaluate(()=>{P.hp=Math.round(P.maxHp*.3)});await tk(6);
  s=await p.evaluate(()=>({lv:dngLvl,cls:$('hpgauge').className}));
  ok(`생명 30% → 천천히 뛰는 1단계 (lv ${s.lv}, ${s.cls})`,s.lv===1&&/dng1/.test(s.cls));
  // 3) 적의 한 방이 남은 생명을 넘음 → 위험, 기록 줄, 적 dngL
  await p.evaluate(()=>{__e.atk=P.hp*10});await tk(6);
  s=await p.evaluate(()=>({lv:dngLvl,cls:$("hpgauge").className,L:__e.dngL,log:document.body.innerText.includes('다음 일격에 쓰러질 수 있습니다')}));
  ok(`한 방이면 쓰러짐 → 위험 (lv ${s.lv}, 적 dngL ${s.L}, 기록 ${s.log})`,s.lv===2&&/\bdng\b/.test(s.cls)&&s.L===1&&s.log);
  // 4) 칠 준비: 머리 위 !! 가 그려진다 (fillText 를 엿본다)
  const t=await p.evaluate(()=>{__e.aggro=true;const seen=[],f=ctx.fillText;ctx.fillText=function(x,...a){seen.push(x);return f.call(this,x,...a)};__e.wind=.2;draw();ctx.fillText=f;return seen});
  ok(`칠 준비하는 적 머리 위 '!!'`,t.includes('!!'));
  await p.screenshot({path:shot('danger_lethal')});
  const t2=await p.evaluate(()=>{__e.atk=1;P.hp=P.maxHp;dngScan=0;__e.aggro=true;runHooks('tick',.05);__e.aggro=true;const seen=[],f=ctx.fillText;ctx.fillText=function(x,...a){seen.push(x);return f.call(this,x,...a)};__e.wind=.2;draw();ctx.fillText=f;return{seen,lv:dngLvl}});
  ok(`쓰러지지 않을 공격에는 아무것도 띄우지 않고, 위험 풀림 (lv ${t2.lv})`,!t2.seen.includes('!')&&!t2.seen.includes('!!')&&t2.lv===0);
  await p.screenshot({path:shot('danger_warn')});
  // 5) 천마혈정·생사경처럼 버티는 수가 있으면 '쓰러진다'고 하지 않는다
  s=await p.evaluate(()=>{__e.atk=P.hp*10;P.chGuard=1;dngScan=0;__e.aggro=true;runHooks('tick',.05);const r={lv:dngLvl,L:__e.dngL};P.chGuard=0;return r});
  ok(`천마혈정이 있으면 위험 아님 (lv ${s.lv})`,s.lv!==2&&!s.L);
  // 5b) 작은 피해에는 번쩍임이 없다 (사용자: 큰 피해일 때만)
  s=await p.evaluate(()=>{mobs.length=0;P.hp=P.maxHp;P.inv=0;const R=Math.random;Math.random=()=>.99;dngF=0;
    hurtP(P.maxHp*.05/(1-guard()),{});Math.random=R;return{F:dngF,lost:P.maxHp-P.hp}});
  ok(`작은 피해(${s.lost}) → 번쩍임 없음 ${s.F}`,s.lost>0&&s.F===0);
  // 6) 큰 피해: 번쩍임, 큰 숫자, 생명줄 잔상
  s=await p.evaluate(()=>{mobs.length=0;P.hp=P.maxHp;P.inv=0;const R=Math.random;Math.random=()=>.99;dngF=0;
    hurtP(P.maxHp*.5/(1-guard()),{});Math.random=R;const tx=texts[texts.length-1];runHooks('tick',.05);draw();
    return{F:dngF,big:!!tx.big,g:parseFloat($('hpg').style.width),b:parseFloat($('hpb').style.width||'100')}});
  ok(`큰 피해 → 번쩍임 ${s.F.toFixed(2)}, 큰 숫자 ${s.big}`,s.F>.8&&s.big);
  await p.screenshot({path:shot('danger_hit')});
  await p.evaluate(()=>{for(let i=0;i<40;i++){time+=.05;runHooks('tick',.05)}});
  s=await p.evaluate(()=>({F:dngF,g:parseFloat($('hpg').style.width),hp:P.hp/P.maxHp*100}));
  ok(`번쩍임은 사라지고 잔상은 생명까지 줄어든다 (F ${s.F.toFixed(2)}, 잔상 ${s.g.toFixed(1)}% / 생명 ${s.hp.toFixed(1)}%)`,s.F<.01&&Math.abs(s.g-s.hp)<1.5);
  // 7) 빈사: 생명이 0이 되면 1로 버티고, 싸울 수 없고 기어 다니며, 운기조식으로 되찾으면 벗어난다. 빈사 중 또 맞으면 쓰러진다
  s=await p.evaluate(()=>{mobs.length=0;const e=mkMob('산적',P.x+1,P.y);e.aggro=true;e.tgt=P;mobs.push(e);P.hp=5;P.inv=0;P.binsa=null;const sp0=moveSpd();const R=Math.random;Math.random=()=>.99;
    hurtP(500,e);Math.random=R;const r={hp:P.hp,b:!!P.binsa,play:playing,ag:e.aggro,lost:e.lost>time,inv:P.inv>0,sp:moveSpd()/sp0,hpt:$('hpt').textContent};
    P.fcd=P.fcd.map(()=>0);P.gcd=0;r.form=useForm(0,true);hud();r.hpt=$('hpt').textContent;return r});
  ok(`빈사: 생명 ${s.hp}, 빈사 ${s.b}, 살아 있음 ${s.play}, 적 물러섬 ${!s.ag&&s.lost}, 잠깐 무적 ${s.inv}, 기는 속도 ${s.sp.toFixed(2)}, 초식 막힘 ${s.form===false}, "${s.hpt}"`,s.hp===1&&s.b&&s.play&&!s.ag&&s.lost&&s.inv&&s.sp<.5&&s.form===false&&/빈사/.test(s.hpt));
  // 회복약으로 채워도 운기조식 전에는 빈사 그대로
  s=await p.evaluate(()=>{mobs.length=0;P.hp=P.maxHp*.8;P.medit=false;time+=.05;runHooks('tick',.05);const b=!!P.binsa;P.hp=1;return{b}});
  ok(`회복약으로 채워도 운기조식 전엔 빈사 ${s.b}`,s.b);
  s=await p.evaluate(()=>{mobs.length=0;P.inv=0;P.lastHit=5;P.medit=true;let t=0;while(P.binsa&&t<120){time+=.05;t+=.05;P.lastHit+=.05;update(.05);P.medit=true}
    return{b:!!P.binsa,hp:P.hp/P.maxHp,t,log:document.body.innerText.includes('빈사에서 벗어났습니다')}});
  ok(`운기조식 ${s.t.toFixed(1)}초 만에 생명 ${(s.hp*100).toFixed(0)}% → 빈사 벗어남 ${!s.b}`,!s.b&&s.hp>=.3&&s.log);
  s=await p.evaluate(()=>{P.hp=3;P.inv=0;const R=Math.random;Math.random=()=>.99;hurtP(500,{});const b=!!P.binsa;P.inv=0;hurtP(500,{});Math.random=R;return{b,play:playing,hp:P.hp}});
  ok(`빈사 중 또 맞으면 쓰러진다 (빈사 ${s.b} → 살아 있음 ${s.play})`,s.b&&!s.play);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

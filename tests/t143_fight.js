// v223 개선 계획 4절 (동훈님 2026-11-01): 초식 직접 고르기 · 간파 · 우두머리 수 셋 · 내공 대결
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 준비: 초식 여럿을 익힌 검 무공, 내공 가득, 앞에 산적 하나
  await p.evaluate(()=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&ARTS[k].forms.length>=4&&ARTS[k].forms.some(f=>FT.pick.wide.includes(f.p))&&!ARTS[k].side);
    P.arts[id]={p:60,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.eq.weapon=mkWeapon('검',1,0);P.realm=1;recalc();P.qi=P.maxQi=9999;P.hp=P.maxHp=99999;
    for(const m of mobs)m.hp=0;mobs=mobs.filter(m=>m.hp>0);window.mk=(k,dx)=>{const e=mkMob(k,P.x+dx,P.y);e.aggro=true;mobs.push(e);return e}});
  // 1. 초식 직접 고르기: 센 초식 · 범위 초식
  let r=await p.evaluate(()=>{const e=mk('산적',1.2);P.target=e;const a=art(),ms=a.forms.map(f=>f.m||0);const iS=pickForm('strong'),iW=pickForm('wide');
    const used=formPick('strong');return{iS,top:ms.indexOf(Math.max(...ms)),wideP:a.forms[iW]&&a.forms[iW].p,used,fp:P.fpick===time,cd:P.fcd[iS]>0}});
  ok(`센 초식 ${r.iS}(가장 센 ${r.top}), 범위 초식 ${r.wideP}, 쓰임 ${r.used}, 표시 ${r.fp}`,r.iS===r.top&&FT_wide(r.wideP)&&r.used&&r.fp&&r.cd);
  function FT_wide(x){return['circle','arc','pull','multi','blinkMulti'].includes(x)}
  // 공격 단추를 옆으로 밀면 범위 초식이 나간다
  await p.evaluate(()=>{P.fcd=P.fcd.map(()=>0);P.gcd=0;P.fpick=0});
  const box=await p.locator('#t_atk').boundingBox();
  await p.evaluate(({x,y})=>{const b=$('t_atk'),ev=(t,X,Y)=>b.dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:X,clientY:Y,pointerId:7,pointerType:'touch'}));ev('pointerdown',x,y);ev('pointermove',x-45,y);ev('pointerup',x-45,y)},{x:box.x+box.width/2,y:box.y+box.height/2});
  r=await p.evaluate(()=>({fp:!!P.fpick,used:P.fcd.map((c,i)=>c>0?i:-1).filter(i=>i>=0)}));
  ok(`단추를 옆으로 밀기 → 초식 ${r.used} 직접 고름 ${r.fp}`,r.fp&&r.used.length>=1);
  // 2. 간파: 적이 칠 준비 중일 때 보법 → 그 수는 빗나가고, 시간이 느려지고, 다음 일격은 반격
  r=await p.evaluate(()=>{bobInit();const bk=Object.keys(BOBS).find(k=>BOBS[k].t!=='flank');P.bob={[bk]:1};P.bcur=bk;P.leap=null;P.kanpaCd=0;const e=mk('산적',1);e.maxHp=e.hp=99999;e.wind=.3;e.tgt=null;e.aggro=true;
    const s=bobeop();update(.02);const o={s,n:P.kanpaN||0,wind:e.wind,slow:fSlow,counter:P.kanpaC>time};
    const h0=e.hp;P.leap=null;P.fcd=P.fcd.map(()=>0);P.gcd=0;e.def=0;const R0=Math.random;Math.random=()=>.5;hitE(mkX(P.cur,1),e,1,0,0);Math.random=R0;/* 적 회피(무작위)로 피해 0이 나오던 것 (CI 2026-11-03) */o.ct=P.kanpaC===0;o.dmg=h0-e.hp;return o});
  ok(`간파 ${r.n}번, 적의 수 끊김 ${r.wind===0}, 느려짐 ${r.slow}, 반격 일격 ${r.ct} (피해 ${r.dmg})`,r.s&&r.n===1&&r.wind===0&&r.slow<1&&r.counter&&r.ct&&r.dmg>0);
  await p.waitForTimeout(800);r=await p.evaluate(()=>fightK(.016));ok(`느린 시간은 실제 시간으로 풀린다 (${r})`,r===1);
  // 3. 우두머리 수: 예고 → 이름 외치기 → 돌진·회전·연환. 서 있으면 맞는다
  r=await p.evaluate(()=>{const R=Math.random;Math.random=()=>.99;   // 회피 운을 빼고 본다
    for(const m of mobs)m.hp=0;mobs=[];const out={};for(const k of['dash','spin','rain']){const e=mk('흑풍채주',2);e.def=0;e.bpT=time-1;e.atk=50;
      FIGHT_FORCE=k;const hp0=P.hp;P.inv=0;for(let t=0;t<4;t+=.05){P.x=P.x;update(.05);if(e.bp&&!out[k])out[k]={n:e.bp.m.n};if(out[k]&&!e.bp)break}out[k]=Object.assign(out[k]||{},{hit:hp0-P.hp>0});e.hp=0;mobs=[]}
    Math.random=R;return out});
  ok(`우두머리 수: 돌진 ${JSON.stringify(r.dash)}, 회전 ${JSON.stringify(r.spin)}, 연환 ${JSON.stringify(r.rain)}`,r.dash&&r.dash.hit&&r.spin&&r.spin.hit&&r.rain&&r.rain.hit);
  // 예고 중에 보법을 쓰면 간파되어 맞지 않는다
  r=await p.evaluate(()=>{for(const k in calloutAt)delete calloutAt[k];const e=mk('흑풍채주',2);e.bpT=time-1;e.atk=50;FIGHT_FORCE='spin';update(.05);const bp=!!e.bp;P.kanpaCd=0;P.leap=null;bobeop();update(.02);const miss=e.bp&&e.bp.miss;const hp0=P.hp;for(let t=0;t<2;t+=.05)update(.05);
    return{bp,miss,lost:hp0-P.hp,co:document.getElementById('callout').textContent}});
  ok(`우두머리 회전 예고 중 간파 → 빗나감 ${r.miss}, 잃은 생명 ${r.lost}, 외친 이름 '${r.co}'`,r.bp&&r.miss&&r.lost===0&&/선풍회륜/.test(r.co));
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t143_boss.png')});
  // 4. 내공 대결: 연타로 밀어내면 상대가 크게 다치고 기절한다. 그동안 세상은 거의 멈춘다
  r=await p.evaluate(()=>{for(const m of mobs)m.hp=0;mobs=[];const e=mk('흑풍채주',1.2);window.CE=e;e.realm=realmIdx();fClashCd=0;clashStart(e);const k=fightK(.016);const vis=!document.getElementById('clash').hidden;
    const h0=e.hp;for(let i=0;i<20;i++)clashTap();fightK(.016);return{k,vis,on:!!fClash,lost:h0-e.hp,stun:e.stun>0,w:P.clashW||0}});
  ok(`내공 대결 창 ${r.vis}, 시간 배율 ${r.k}, 연타로 이김 ${r.w}, 상대 피해 ${r.lost}, 기절 ${r.stun}`,r.vis&&r.k<.1&&!r.on&&r.w===1&&r.lost>0&&r.stun);
  // v226: 화면 가운데 문구 → 게이지·단추, 카메라를 크게 당긴다, 단추를 누르면 내공이 든다 (실제 프레임으로 돌려 본다)
  await p.evaluate(()=>{const e=CE;e.stun=0;e.hp=e.maxHp;fClashCd=0;P.qi=P.maxQi;clashStart(e)});
  await p.waitForTimeout(450);await p.screenshot({path:require('path').resolve(__dirname,'shots/t143_clash1.png')});
  await p.waitForTimeout(900);
  r=await p.evaluate(()=>{const el=document.getElementById('clash'),ban=el.querySelector('.cban').getBoundingClientRect(),box=el.querySelector('.cbox').getBoundingClientRect(),atk=document.getElementById('t_atk'),bar=el.querySelector('.cbar').getBoundingClientRect();
    const q0=P.qi,v0=fClash.v;const ar=atk.getBoundingClientRect();atk.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,clientX:ar.x+ar.width/2,clientY:ar.y+ar.height/2,pointerId:9,pointerType:'touch'}));const top=document.elementFromPoint(ar.x+ar.width/2,ar.y+ar.height/2);return{on:!!fClash,midY:(ban.top+ban.bottom)/2/innerHeight,box:getComputedStyle(el.querySelector('.cbox')).opacity,side:atk.classList.contains('clash')&&/밀어내기/.test(atk.textContent)&&!el.querySelector('.cbtn'),
      nm:el.querySelector('.cnm').textContent,qm:el.querySelector('.qm').textContent,qe:el.querySelector('.qe').textContent,spent:q0-P.qi,z:rdZ,pushed:fClash.v>v0,top:!!(top&&top.closest('#t_atk'))}});
  ok(`문구 세로 위치 ${r.midY.toFixed(2)}, 게이지 ${r.box}, 공격 단추가 밀어내기로 ${r.side} 밀림 ${r.pushed}, '${r.nm}' ${r.qm} ${r.qe}, 누를 때 든 내공 ${r.spent}, 줌 ${r.z.toFixed(2)}`,
    r.on&&r.midY>.3&&r.midY<.6&&+r.box>.9&&r.side&&r.pushed&&/나/.test(r.nm)&&/내공/.test(r.qm)&&/내공/.test(r.qe)&&r.spent>0&&r.z>1.5);
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t143_clash2.png')});
  await p.evaluate(()=>{for(let i=0;i<30&&fClash;i++)clashTap()});await p.waitForTimeout(250);await p.screenshot({path:require('path').resolve(__dirname,'shots/t143_clash3.png')});
  await p.waitForTimeout(1200);r=await p.evaluate(()=>({hid:document.getElementById('clash').hidden,on:!!fClash,lbl:document.querySelector('#t_atk span').textContent,cl:document.getElementById('t_atk').classList.contains('clash')}));ok(`끝나면 창이 닫히고 공격 단추가 돌아옴 ${r.hid} '${r.lbl}'`,r.hid&&!r.on&&r.lbl==='공격'&&!r.cl);
  r=await p.evaluate(()=>{const e=CE;e.stun=0;e.hp=e.maxHp;P.inv=0;fClashCd=0;clashStart(e);const h0=P.hp,rnd=Math.random;Math.random=()=>.99;   // 회피(hurtP 최소 3%)로 빗나가지 않게
    try{for(let i=0;i<200&&fClash;i++)fightK(.05)}finally{Math.random=rnd}return{lost:h0-P.hp,on:!!fClash,ehp:e.hp,php:P.hp,inv:P.inv,bin:P.binsa,n:mobs.length}});
  ok(`가만히 있으면 밀린다: 잃은 생명 ${r.lost} ${JSON.stringify(r)}`,!r.on&&r.lost>0);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

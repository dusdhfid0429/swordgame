// 맵 이동 2초 체류 + 강제공격 토글 (2026-10-13): 출입구·가장자리에 2초 머물러야 넘어가고 경공 중엔 세지 않는다. 강제공격을 켜면 같은 편도 공격 대상
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760},hasTouch:true});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 출입구에 서서: 1.5초까지는 그대로, 2초가 차면 이동
  const g1=await p.evaluate(()=>{const g=REGION().gates[0];P.gateLock=0;P.x=g.x;P.y=g.y;P.path=null;const r0=REG;gateTick(.3);gateTick(.3);gateTick(.3);const t=P.gateT,trav=!!P.traveling;gateTick(.2);return{r0,t,trav,trav2:!!P.traveling,to:g.to}});
  ok(`출입구 0.9초 머묾 → 아직 (${g1.t.toFixed(1)}초, 이동 ${g1.trav}), 1초 차면 이동 ${g1.trav2}`,Math.abs(g1.t-.9)<.01&&!g1.trav&&g1.trav2);
  await p.waitForFunction(to=>REG===to&&!P.traveling,g1.to,{timeout:4000}).catch(()=>{});
  ok(`도착 ${g1.r0} → ${await p.evaluate(()=>REG)}`,await p.evaluate(to=>REG===to&&P.gateT===0,g1.to));
  // 벗어나면 0부터 다시, 경공 중엔 세지 않는다
  const g2=await p.evaluate(()=>{const g=REGION().gates[0];P.gateLock=0;P.x=g.x;P.y=g.y;gateTick(.5);const a=P.gateT;P.x=g.x+3;gateTick(.1);const b=P.gateT||0;P.x=g.x;P.leap={sx:P.x,sy:P.y,ex:P.x,ey:P.y,t:0,dur:.6,z0:0,z1:0,to:null};gateTick(1);gateTick(1);const c=P.gateT||0,trav=!!P.traveling;P.leap=null;P.x=g.x+3;gateTick(.1);return{a,b,c,trav}});
  ok(`벗어나면 초기화 (${g2.a}→${g2.b}), 경공 중 2초 지나도 안 넘어감 (${g2.c}, 이동 ${g2.trav})`,g2.a===.5&&g2.b===0&&g2.c===0&&!g2.trav);
  // 공격 중 상태 (2026-10-20): 휘두르는 중이나 마지막 공격 뒤 1초 안에는 출입구에 서 있어도 세지 않는다
  const g3=await p.evaluate(()=>{const g=REGION().gates[0],r0=REG;P.gateLock=0;P.x=g.x;P.y=g.y;P.path=null;P.lastAtk=time;const st=attacking();for(let i=0;i<5;i++)gateTick(.3);const a=P.gateT||0,trav=!!P.traveling;
    P.lastAtk=time-2;P.swing=.2;const sw=attacking();gateTick(.5);const b=P.gateT||0;P.swing=0;const st2=attacking();gateTick(.5);const c=P.gateT;return{st,a,trav,sw,b,st2,c,r0}});
  ok(`공격 중 ${g3.st}: 1.5초 서 있어도 0 (${g3.a}, 이동 ${g3.trav}), 휘두르는 중 ${g3.sw} 0 (${g3.b}), 끝나면 ${!g3.st2} 다시 셈 (${g3.c})`,g3.st&&g3.a===0&&!g3.trav&&g3.sw&&g3.b===0&&!g3.st2&&g3.c===.5);
  await p.evaluate(()=>{P.x+=3;gateTick(.1)});
  // 강제공격: 같은 편 무인은 평소엔 공격 대상이 아니다
  const f1=await p.evaluate(()=>{mobs=[];P.target=null;const e=mkFac(pfac(),0,P.x+1.5,P.y);mobs.push(e);const a={peace:peaceful(e),near:nearest(5)===e,foe:foes().includes(e)};
    toggleForce();const b={on:forceAtk,peace:peaceful(e),near:nearest(5)===e,foe:foes().includes(e),hud:$('forceb').classList.contains('on'),t:$('t_force').classList.contains('on')};
    P.target=e;const ev0=P.evil;damage(e,1,0,0,P);const c={angry:!!e.angry,evil:P.evil-ev0};
    toggleForce();const d={on:forceAtk,target:P.target===e,peace:peaceful(e)};
    const v=mkMob('양민',P.x-1.5,P.y);mobs.push(v);toggleForce();const vv={villFoe:foes().includes(v),villNear:nearest(5)===v};toggleForce();mobs=[];P.target=null;return{a,b,c,d,vv}});
  ok(`같은 편 무인: 평소 평화 ${f1.a.peace}·대상 아님 ${!f1.a.near}·범위 제외 ${!f1.a.foe}`,f1.a.peace&&!f1.a.near&&!f1.a.foe);
  ok(`강제 켜면: 평화 ${f1.b.peace}, 가까운 적 ${f1.b.near}, 범위 포함 ${f1.b.foe}, HUD 단추 켜짐 ${f1.b.hud}/${f1.b.t}`,f1.b.on&&!f1.b.peace&&f1.b.near&&f1.b.foe&&f1.b.hud&&f1.b.t);
  ok(`치면 배신 (등 돌림 ${f1.c.angry}, 악업 +${f1.c.evil}); 끄면 대상 해제 ${!f1.d.target} (등 돌린 상대는 여전히 적 ${!f1.d.peace})`,f1.c.angry&&f1.c.evil>0&&!f1.d.on&&f1.d.target&&!f1.d.peace);
  ok(`양민은 강제를 켜도 범위 초식·자동 대상에서 제외 (${f1.vv.villFoe}/${f1.vv.villNear})`,!f1.vv.villFoe&&!f1.vv.villNear);
  // 강제공격으로 장문인 끌어내기 + 제자가 죽으면 첫해에도 쇠퇴 (v112: 직위별 손실이라 졸개로 고정)
  const m1=await p.evaluate(()=>{toggleForce(false);const s=SECTS.nabu,ids=[hqId(s),...((REGIONS[hqId(s)]||{}).halls||[]).map(h=>h.id)],mr=ids.find(id=>(REGIONS[id].npcs||[]).some(n=>n.hq===s.id));
    mobs=[];loadRegion(mr);P.reg=mr;const n=(REGION().npcs||[]).find(x=>x.hq);const p0=sectPop('nabu');const off=masterOut(n);toggleForce(true);const e=masterOut(n);const npcGone=!(REGION().npcs||[]).some(x=>x.hq);
    const same=masterOut(n)===e;const d=mkFac(alFac(s.al),0,P.x+1,P.y,'nabu');d.rank=0;mobs.push(d);damage(d,9999,0,0,P);const weak=sectWeak(s);mobs=[];loadRegion(mr);P.reg=mr;const boss2=mobs.some(m=>m.master==='nabu'),npcBack=(REGION().npcs||[]).some(x=>x.hq);toggleForce(false);return{off:off===null,e:!!(e&&e.master==='nabu'),npcGone,same,p0,p1:sectPop('nabu'),weak,boss2,npcBack}});
  ok(`강제 꺼진 채 ${m1.off?'안 나옴':'나옴'}, 켜면 장문인 출전 ${m1.e}·NPC 숨김 ${m1.npcGone}·같은 우두머리 ${m1.same}`,m1.off&&m1.e&&m1.npcGone&&m1.same);
  ok(`제자 1명 죽으면 첫해에도 쇠퇴 (${m1.p0}→${m1.p1}, 쇠퇴 ${m1.weak}, 같은 편이라 다시 들어가면 장문인 NPC ${m1.npcBack} 출전 ${m1.boss2}) [v133]`,m1.p1===m1.p0-1&&m1.weak&&m1.npcBack&&!m1.boss2);
  // PC 키 T, 터치 단추
  await p.keyboard.press('KeyT');const k1=await p.evaluate(()=>forceAtk);await p.keyboard.press('KeyT');const k2=await p.evaluate(()=>forceAtk);
  ok(`T 키로 켜고 끔 (${k1}→${k2})`,k1===true&&k2===false);
  await p.evaluate(()=>setTouch(true));await p.waitForTimeout(300);await p.tap('#t_force');await p.waitForTimeout(150);const t1=await p.evaluate(()=>({on:forceAtk,cls:$('t_force').classList.contains('on'),vis:!$('t_force').hidden}));
  ok(`터치 단추로 켬 (${t1.on}, 표시 ${t1.cls}, 보임 ${t1.vis})`,t1.on&&t1.cls&&t1.vis);
  require('fs').mkdirSync(__dirname+'/shots',{recursive:true});await p.screenshot({path:__dirname+'/shots/gatehold_force.png'});
  if(errs.length)console.log('ERRORS',errs.slice(0,5));
  await b.close();
})();

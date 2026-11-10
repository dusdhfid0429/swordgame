// v242 공격하다 멈춤·동작만 하고 피해 없음 (동훈님 2026-11-10 "공격을 하다가 지형에 걸리거나 하여 공격을 멈춘 상태로 가만히 있거나, 공격 스프라이트는 진행 중인데 실제 데미지가 안 들어간다")
// 1) 적이 같은 칸 안에서 사거리(권 1.1)보다 조금 멀면 길찾기가 빈 길을 돌려줘 제자리에 섰다 → 곧장 다가가 친다
// 2) 막힌 곳(갇힌 칸)의 적: 한 걸음도 못 가면 1.5초 뒤 놓고, 그 적은 잠시 자동으로 다시 고르지 않는다
// 3) 활: 나무·담에 막힌 적에게 계속 쏘아 화살이 막히기만 했다 → 사이가 막히면 쏘지 않고 돌아가서 맞힌다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{paused=true;spawnTick=()=>{};   // 무작위로 생기는 몹이 과녁을 흔들지 않게
    // 빈 마당: 주인공 둘레 13×9칸의 장애물을 걷어 낸다
    window.yard=()=>{for(const m of mobs)m.hp=0;mobs=[];allies=[];projs=[];sched=[];const cx=Math.floor(P.x),cy=Math.floor(P.y);
      for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++)if(objs[cy+j]&&cx+i>=0&&cx+i<N)objs[cy+j][cx+i]=null;
      P.x=cx+.15;P.y=cy+.15;P.path=null;P.target=null;P.chs=0;P.hp=P.maxHp=99999;P.qi=P.maxQi=99999;P.bcd=P.gcd=0;P.fcd=P.fcd.map(()=>0);return{cx,cy}};
    window.foe=(x,y)=>{const e=mkMob('산적',x,y);e.hp=e.maxHp=1e6;e.atk=0;e.def=0;e.hm=-999;e.d=Object.assign({},e.d,{sp:0});e.sp=0;e.stun=999;mobs.push(e);return e};
    window.run=(sec,f)=>{for(let t=0;t<sec;t+=1/30){update(1/30);if(f)f()}};
    window.learn=cls=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===cls&&!ARTS[k].side);P.arts[id]={p:0,f:ARTS[id].forms.map(()=>false)};P.cur=id;P.eq.weapon=cls==='권'?null:mkWeapon(cls,1,0);recalc();return id}});
  // 1. 권법, 같은 칸 안 1.2칸 떨어진 적
  let r=await p.evaluate(()=>{learn('권');const{cx,cy}=yard();const e=foe(cx+.95,cy+.95);P.target=e;const d0=dist(e,P);run(3);return{d0,d:dist(e,P),dmg:1e6-e.hp,tgt:P.target===e}});
  ok(`권법: 같은 칸 안 ${r.d0.toFixed(2)}칸 적에게 다가가 친다 (거리 ${r.d.toFixed(2)}, 피해 ${r.dmg})`,r.d0>1.05&&r.d<1.05&&r.dmg>0&&r.tgt);
  // 1b. 검으로도 같은 칸 귀퉁이에서 (사거리 1.5 안이라 바로 친다: 예전과 같음)
  r=await p.evaluate(()=>{learn('검');const{cx,cy}=yard();const e=foe(cx+.95,cy+.95);P.target=e;run(2);return{dmg:1e6-e.hp}});
  ok(`검법: 바로 친다 (피해 ${r.dmg})`,r.dmg>0);
  // 2. 갇힌 칸의 적: 놓고, 다시 자동으로 고르지 않는다
  r=await p.evaluate(()=>{learn('권');const{cx,cy}=yard();const ex=cx+3,ey=cy;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(i||j)objs[ey+j][ex+i]='B';
    const e=foe(ex+.5,ey+.5);P.target=e;let gaveAt=null;run(4,()=>{if(gaveAt==null&&!P.target)gaveAt=time});const nr=e.noReach>time,pick=nearest(8,P,reachable)===e;
    P.target=null;autoEngage();const auto=P.target;return{gave:!P.target||P.target!==e,nr,pick:!!pick,auto:auto===e,dmg:1e6-e.hp,log:logEl.textContent.includes('닿을 길이 없어')}});
  ok(`갇힌 적은 놓는다 (놓음 ${r.gave}, 잠시 안 고름 ${r.nr}/${!r.pick}/${!r.auto}, 알림 ${r.log})`,r.gave&&r.nr&&!r.pick&&!r.auto&&r.log);
  // 3. 활: 사이에 담이 있으면 쏘지 않고 돌아가서 맞힌다
  r=await p.evaluate(()=>{learn('궁');const{cx,cy}=yard();for(let j=-1;j<=1;j++)objs[cy+j][cx+2]='B';P.x=cx+.5;P.y=cy+.5;
    const e=foe(cx+4.5,cy+.5);P.target=e;const blocked=!shotClear(P,e);let shotBlocked=0;const p0=projs.length;
    run(6,()=>{for(const q of projs)if(q.left<=0)shotBlocked++});return{blocked,dmg:1e6-e.hp,clear:shotClear(P,e),moved:Math.hypot(P.x-cx-.5,P.y-cy-.5)}});
  ok(`활: 담에 막힌 적 (막힘 ${r.blocked}) → 돌아가 맞힌다 (움직임 ${r.moved.toFixed(1)}, 피해 ${r.dmg})`,r.blocked&&r.dmg>0&&r.moved>.5);
  // 3b. 트인 사이면 제자리에서 쏜다
  r=await p.evaluate(()=>{learn('궁');const{cx,cy}=yard();P.x=cx+.5;P.y=cy+.5;const e=foe(cx+4.5,cy+.5);P.target=e;run(3);return{dmg:1e6-e.hp,moved:Math.hypot(P.x-cx-.5,P.y-cy-.5)}});
  ok(`활: 트인 적은 제자리에서 쏜다 (움직임 ${r.moved.toFixed(2)}, 피해 ${r.dmg})`,r.dmg>0&&r.moved<.05);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no errors');await b.close();
})();

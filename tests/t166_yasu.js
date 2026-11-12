// 야수궁 맹수 (v252): 우리에서 받기·직위별 종·주인과 맹수 6:4 (피해·생명)·기술은 몫을 한꺼번에·쓰러지면 반 해·하산·저장·적 야수궁 맹수
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:권"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const o={},Y=GD.YASU;GD.RANK_CAP.plus=9;paused=true;
    o.none=ybWhy('늑대').includes('야수궁');
    P.sect='yasu';P.mtot={yasu:0};P.merit.yasu=0;
    o.away=ybWhy('늑대').includes('본산');
    const s=SECTS.yasu;enterRegion(hqId(s),20.5,30.5);
    o.r0=!ybTake('늑대')&&!ybOut();
    P.mtot.yasu=RANK_PTS[1];o.wolfOk=ybWhy('늑대')===''&&ybWhy('호랑이')!=='';
    o.panel=sectDetail(s).includes('맹수 우리');
    // 6:4 생명: 맹수가 곁에 있으면 주인 최대 생명 own, 맹수 beast
    P.realm=4;recalc();P.hp=P.maxHp;const full=P.maxHp;
    o.take=ybTake('늑대');const a=ybOut();o.realm=!!a&&a.realm===3&&a.kind==='yasu';
    o.hp64=Math.abs(P.maxHp-Math.round(full*Y.split.own))<=1&&Math.abs(a.maxHp-Math.round(full*Y.split.beast))<=1&&P.hp<=P.maxHp;
    o.one=allies.filter(x=>x.kind==='yasu').length===1;
    // 주인이 오르면 이름 경지도 따라 오른다
    P.realm=5;ybSync();o.up=ybOut().realm===4;P.realm=0;ybSync();o.floor=ybOut().realm===0;P.realm=4;ybSync();
    // 호랑이는 당주부터
    P.mtot.yasu=RANK_PTS[3];o.tiger=ybTake('호랑이')&&ybOut().k==='호랑이'&&allies.filter(x=>x.kind==='yasu').length===1;
    // 6:4 피해: 내가 1000을 치면 600만 들어가고 400이 맹수 몫으로 쌓인다
    const t=ybOut(),mk=rr=>{const m=mkMob('늑대',t.x+.5,t.y,{...MOBS['늑대']});m.realm=rr;m.def=0;m.hp=m.maxHp=1e6;return m};
    const foe=mk(4);foe.aggro=true;mobs.push(foe);t.pool=0;
    let h0=foe.hp;damage(foe,1000,0,0,P);o.dmg64=h0-foe.hp===600&&Math.abs(t.pool-400)<.01;
    // 맹수가 물면 쌓인 몫이 나간다 (더 붙지 않는다)
    const c1={a:t,tg:foe,dm:999};runHooks('allyHit',c1);o.bite=Math.abs(c1.dm-400)<.01&&t.pool===0;
    // 합 = 혼자일 때: 맹수가 내는 피해까지 더하면 1000
    t.pool=0;h0=foe.hp;damage(foe,1000,0,0,P);const c2={a:t,tg:foe,dm:0};runHooks('allyHit',c2);damage(foe,Math.round(c2.dm),0,0,t);o.sum=h0-foe.hp===1000;
    // 맹수 피해는 다시 나뉘지 않는다
    t.pool=0;h0=foe.hp;damage(foe,100,0,0,t);o.beastNoSplit=h0-foe.hp===100&&t.pool===0;
    // 맞을 때는 주인 경지로 경지 차
    const R0=Math.random;Math.random=()=>.99;const h1={a:t,dm:100,src:mk(5)};runHooks('allyHurt',h1);const h2={a:t,dm:100,src:mk(4)};runHooks('allyHurt',h2);o.rhurt=!h1.miss&&h1.dm>h2.dm*1.2;
    Math.random=()=>0;const h3={a:t,dm:100,src:mk(4)};runHooks('allyHurt',h3);Math.random=R0;o.dodge=!!h3.miss;const thp=t.hp;Math.random=()=>0;hurtAlly(t,50,mk(4));Math.random=R0;o.dodge=o.dodge&&t.hp===thp;
    // 기술: 쌓인 몫을 한꺼번에, 내공은 안 쓴다
    P.target=foe;t.x=foe.x-1;t.y=foe.y;t.skT=0;P.qi=P.maxQi=1000;t.pool=500;h0=foe.hp;runHooks('allyTick',t,.05);
    o.skill=P.qi===1000&&t.pool===0&&t.skT===Y.skill.cd&&h0-foe.hp===500;
    P.yb.sk=0;t.skT=0;t.pool=500;runHooks('allyTick',t,.05);o.off=t.pool===500;P.yb.sk=1;
    // 칠 상대가 없으면 몫이 줄어든다
    mobs.splice(mobs.indexOf(foe),1);P.target=null;t.pool=100;runHooks('allyTick',t,1);o.decay=t.pool<100;
    // 맹수가 없으면 혼자 몫 1
    const hpS=P.maxHp;hurtAlly(t,t.hp+10);o.down=!ybOut()&&P.yb.rest>G.cal&&P.maxHp>hpS;const f2=mk(4);mobs.push(f2);h0=f2.hp;damage(f2,1000,0,0,P);o.solo=h0-f2.hp===1000;mobs.splice(mobs.indexOf(f2),1);
    ybSync();o.stay=!ybOut();o.restWhy=ybWhy('늑대').includes('추스르');
    G.cal=P.yb.rest+.01;ybSync();o.back=!!ybOut()&&ybOut().hp<ybOut().maxHp;
    // 노릴 상대: 주인이 치는 상대가 먼저, 없으면 주인을 친 적 중 가장 가까운 것, 움직이는 중엔 leash까지만
    {const b=ybOut()||(ybSync(),ybOut());if(b){mobs=[];b.mode='follow';b.x=P.x+1;b.y=P.y;const mm=(dx,dy)=>{const m=mkMob('늑대',P.x+dx,P.y+dy,{...MOBS['늑대']});m.hp=m.maxHp=1e6;m.aggro=false;mobs.push(m);return m};
      const far=mm(5,0),near=mm(2,0),own=mm(-3,0);P.target=null;P.moving=false;o.tgNone=ybTg(b)===null;
      far.ybHitP=time;near.ybHitP=time;o.tgNear=ybTg(b)===near;
      P.target=own;o.tgOwn=ybTg(b)===own;P.target=null;
      P.moving=true;b.x=P.x+Y.tg.leash+1;o.tgLeash=ybTg(b)===null;P.target=own;o.tgLeashOwn=ybTg(b)===own;P.target=null;P.moving=false;
      b.x=P.x+1;near.ybHitP=-99;far.ybHitP=-99;o.tgMem=ybTg(b)===null;
      const hp0=P.hp;P.inv=0;hurtP(1,near);o.tgHurt=near.ybHitP===time||ybTg(b)===near;P.hp=hp0;
      // 어그로: 더 많이 친 쪽을 노린다, 도발은 그 값을 끌어올린다
      const A=GD.AGGRO,am=near;am.aggro=true;am.tgt=null;am.thr=null;am.aggroRe=0;const act=()=>{am.aggroRe=0;runHooks('mobAct',{e:am,dt:A.re})};
      damage(am,300,0,0,P);act();o.agP=am.tgt==null&&aggroTop(am)>0;
      damage(am,1000,0,0,b);act();o.agB=am.tgt===b;
      damage(am,3000,0,0,P);act();o.agBack=am.tgt==null;
      aggroTaunt(am,b,1.5);act();o.agTaunt=am.tgt===b&&am.thr.get(b)>am.thr.get(P)*1.4;
      const v0=am.thr.get(b);act();o.agDecay=am.thr.get(b)<v0;
      am.tgt=null;am.thr.set(b,am.thr.get(P)*1.05);act();o.agMargin=am.tgt==null;
      // 한 공격은 한 몫: 같은 공격이 주인과 맹수를 함께 맞히면 6:4
      {const rr=Math.random;Math.random=()=>.99;P.inv=0;P.hp=P.maxHp;b.hp=b.maxHp;const p0=P.hp,b0=b.hp;const D=Math.round(Math.min(P.maxHp,b.maxHp/Y.split.beast)*.3);hurtP(D,am);const solo=p0-P.hp;hurtAlly(b,D,am);const pl=p0-P.hp,bl=b0-b.hp;
       o.oneHit=Math.abs(pl+bl-solo)<=2&&Math.abs(bl-solo*Y.split.beast)<=2;time+=.1;const p1=P.hp,b1=b.hp;hurtAlly(b,D,am);o.oneHitSep=b1-b.hp>solo*.5&&P.hp===p1;Math.random=rr;P.hp=P.maxHp;b.hp=b.maxHp}
      mobs=[]}}
    // 폐관 호법이 아니다
    o.nohob=!allies.some(x=>x.kind!=='pet'&&x.kind!=='yasu'&&x.hp>0)&&!hobeop()||inOwnSect();
    // 저장·불러오기
    saveGame(true);const d=loadGame();allies=[];applySave(d);o.save=allies.filter(x=>x.kind==='yasu').length===1&&P.yb.sp==='호랑이'&&!(d.allies||[]).some(x=>x.kind==='yasu');
    // 하산하면 우리에 두고 간다
    sectAct('sleave');ybSync();o.leave=!P.sect&&!P.yb&&!ybOut();
    // 적 야수궁: 당주 이상 무인은 맹수를 데리고 나온다, 전리품 없음·인원에 안 셈
    enterRegion('gaebong',20,12);mobs=[];P.realm=2;
    const f=alFac(SECTS.yasu.al);const m=mkFac(f,1,20,14,'yasu');m.rank=3;m.realm=4;scaleMob(m);mobs.push(m);const mh=m.maxHp,ma=m.atk;
    const m2=mkFac(f,0,22,14,'yasu');m2.rank=0;m2.realm=0;mobs.push(m2);ybNpcTick();
    const bs=mobs.filter(x=>x.ybOwner);o.npc64=Math.abs(m.maxHp-mh*Y.split.own)<=1&&Math.abs(bs[0].maxHp-mh*Y.split.beast)<=1&&Math.abs(m.atk-ma*Y.split.own)<=1&&Math.abs(bs[0].atk-ma*Y.split.beast)<=1;o.npc=bs.length===1&&bs[0].ybOwner===m&&bs[0].ybRk===3&&bs[0].noLoot&&!bs[0].sect&&bs[0].d.fac===f;
    ybNpcTick();o.npcOnce=mobs.filter(x=>x.ybOwner).length===1;
    {time+=.1;const be0=bs[0],mh0=m.hp,bh0=be0.hp;damage(m,1000,0,0,P);damage(be0,1000,0,0,P);o.npcOne=Math.abs((mh0-m.hp)-1000*Y.split.own)<=1&&Math.abs((bh0-be0.hp)-1000*Y.split.beast)<=1;m.hp=mh0;be0.hp=bh0;time+=.1}
    const pop0=sectPop('yasu'),s0=P.silver,bag0=P.bag.length;const be=bs[0];be.hp=1;damage(be,5);o.npcBack=m.atk===ma&&m.maxHp===mh;o.npcLoot=sectPop('yasu')===pop0&&P.bag.length===bag0&&!drops.some(x=>x.it&&x.it.mat);
    return o});
  ok('야수궁 제자만',r.none);
  ok('본산에서만 받는다',r.away);
  ok('첫 직위는 못 받는다',r.r0);
  ok('정예는 늑대만',r.wolfOk);
  ok('문파 창에 맹수 우리',r.panel);
  ok('받으면 이름 경지는 한 단계 아래',r.take&&r.realm);
  ok('생명 6:4',r.hp64);
  ok('한 마리만',r.one&&r.tiger);
  ok('주인 경지를 따라 오른다',r.up&&r.floor);
  ok('주는 피해 6:4',r.dmg64);
  ok('맹수가 물면 쌓인 몫이 나간다',r.bite);
  ok('둘의 합 = 혼자 몫',r.sum);
  ok('맹수 피해는 다시 안 나뉜다',r.beastNoSplit);
  ok('맞을 때 주인 경지로 경지 차',r.rhurt);
  ok('회피도 주인 것',r.dodge);
  ok('기술은 몫을 한꺼번에, 내공 안 씀',r.skill);
  ok('기술 끄기',r.off);
  ok('칠 상대 없으면 몫이 준다',r.decay);
  ok('맹수가 없으면 혼자 몫',r.solo);
  ok('주인이 치는 상대가 먼저',r.tgOwn&&r.tgNone);
  ok('없으면 주인을 친 적 중 가장 가까운 것',r.tgNear&&r.tgHurt&&r.tgMem);
  ok('주인이 움직이면 벌어질 때까지만',r.tgLeash&&r.tgLeashOwn);
  ok('어그로: 더 많이 친 쪽을 노린다',r.agP&&r.agB&&r.agBack);
  ok('도발은 어그로를 끌어올린다',r.agTaunt);
  ok('어그로는 잊히고, 조금 더 많다고 갈아타지 않는다',r.agDecay&&r.agMargin);
  ok('한 공격은 한 몫: 함께 맞으면 6:4',r.oneHit&&r.oneHitSep);
  ok('적도 함께 맞으면 6:4',r.npcOne);
  ok('폐관 호법이 아니다',r.nohob);
  ok('쓰러지면 반 해 우리에서',r.down&&r.stay&&r.restWhy);
  ok('추스르면 돌아온다',r.back);
  ok('저장·불러오기',r.save);
  ok('하산하면 두고 간다',r.leave);
  ok('적 당주는 맹수를 데리고 나온다',r.npc&&r.npcOnce);
  ok('적도 6:4',r.npc64);
  ok('적 맹수가 쓰러지면 주인이 몫을 되찾는다',r.npcBack);
  ok('적 맹수는 전리품·인원 없음',r.npcLoot);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(e))}
  await b.close();
})();

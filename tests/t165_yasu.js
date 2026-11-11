// 야수궁 맹수 (v252): 우리에서 받기·직위별 종·경지 = 주인 -1·따라 오름·경지 차·주인 내공 기술·쓰러지면 반 해·하산·저장·적 야수궁 맹수
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
    // 경지: 주인보다 한 단계 아래
    P.realm=4;o.take=ybTake('늑대');const a=ybOut();o.realm=!!a&&a.realm===3&&a.kind==='yasu';
    o.one=allies.filter(x=>x.kind==='yasu').length===1;
    // 주인이 오르면 따라 오른다
    P.realm=5;ybSync();o.up=ybOut().realm===4&&ybOut().maxHp===ybStat('늑대',4).hp;
    P.realm=0;ybSync();o.floor=ybOut().realm===0;P.realm=4;ybSync();
    // 호랑이는 당주부터
    P.mtot.yasu=RANK_PTS[3];o.tiger=ybTake('호랑이')&&ybOut().k==='호랑이'&&allies.filter(x=>x.kind==='yasu').length===1;
    // 종마다 배분만 다르다 (초당 공격 × 생명 ≈ 1)
    o.budget=Object.values(Y.sp).every(q=>Math.abs(q.a*q.h-1)<.2);
    // 평타 세기: 같은 경지 졸개를 killS초 안팎에
    const st=ybStat('멧돼지',3);o.dps=Math.abs(st.atk/st.cd-ybFoeHp(3)/Y.killS)<2;
    // 경지 차 ±25% (칠 때)
    const t=ybOut(),mk=rr=>{const m=mkMob('늑대',t.x+.5,t.y,{...MOBS['늑대']});m.realm=rr;m.def=0;return m};
    const c1={a:t,tg:mk(4),dm:100};runHooks('allyHit',c1);const c2={a:t,tg:mk(3),dm:100};runHooks('allyHit',c2);const c3={a:t,tg:mk(1),dm:100};runHooks('allyHit',c3);
    o.rdiff=Math.round(c1.dm)===75&&Math.round(c2.dm)===100&&Math.round(c3.dm)===150;
    const h1={a:t,dm:100,src:mk(5)};runHooks('allyHurt',h1);o.rhurt=Math.round(h1.dm)===150;
    // 위계: 맹수 평타 dps는 같은 경지 졸개를 혼자 잡는 데 수 초 (주인 피해의 일부)
    o.weak=ybStat('호랑이',3).atk/1.1<ybFoeHp(3)/3;
    // 기술: 주인 내공을 쓴다
    const foe=mk(3);foe.hp=foe.maxHp=1e6;foe.aggro=true;foe.d={...foe.d,hostile:1};mobs.push(foe);P.target=foe;t.x=foe.x-1;t.y=foe.y;t.skT=0;P.qi=P.maxQi=1000;
    const hp0=foe.hp;runHooks('allyTick',t,.05);o.skill=P.qi===1000-Math.round(1000*Y.skill.qi/100)&&foe.hp<hp0&&t.skT===Y.skill.cd;
    t.skT=0;P.qi=5;const q0=P.qi;runHooks('allyTick',t,.05);o.noQi=P.qi===q0;
    P.yb.sk=0;t.skT=0;P.qi=1000;runHooks('allyTick',t,.05);o.off=P.qi===1000;P.yb.sk=1;
    mobs.splice(mobs.indexOf(foe),1);P.target=null;
    // 폐관 호법이 아니다
    o.nohob=!allies.some(x=>x.kind!=='pet'&&x.kind!=='yasu'&&x.hp>0)&&!hobeop()||inOwnSect();
    // 쓰러지면 반 해 우리에서
    hurtAlly(t,t.hp+10);o.down=!ybOut()&&P.yb.rest>G.cal;ybSync();o.stay=!ybOut();o.restWhy=ybWhy('늑대').includes('추스르');
    G.cal=P.yb.rest+.01;ybSync();o.back=!!ybOut()&&ybOut().hp<ybOut().maxHp;
    // 저장·불러오기
    saveGame(true);const d=loadGame();allies=[];applySave(d);o.save=allies.filter(x=>x.kind==='yasu').length===1&&P.yb.sp==='호랑이'&&!(d.allies||[]).some(x=>x.kind==='yasu');
    // 하산하면 우리에 두고 간다
    sectAct('sleave');ybSync();o.leave=!P.sect&&!P.yb&&!ybOut();
    // 적 야수궁: 당주 이상 무인은 맹수를 데리고 나온다, 전리품 없음·인원에 안 셈
    enterRegion('gaebong',20,12);mobs=[];P.realm=2;
    const f=alFac(SECTS.yasu.al);const m=mkFac(f,1,20,14,'yasu');m.rank=3;m.realm=4;scaleMob(m);mobs.push(m);
    const m2=mkFac(f,0,22,14,'yasu');m2.rank=0;m2.realm=0;mobs.push(m2);ybNpcTick();
    const bs=mobs.filter(x=>x.ybOwner);o.npc=bs.length===1&&bs[0].ybOwner===m&&bs[0].realm===3&&bs[0].noLoot&&!bs[0].sect&&bs[0].d.fac===f;
    ybNpcTick();o.npcOnce=mobs.filter(x=>x.ybOwner).length===1;
    const pop0=sectPop('yasu'),s0=P.silver,bag0=P.bag.length;const be=bs[0];be.hp=1;damage(be,5);o.npcLoot=sectPop('yasu')===pop0&&P.bag.length===bag0&&!drops.some(x=>x.it&&x.it.mat);
    return o});
  ok('야수궁 제자만',r.none);
  ok('본산에서만 받는다',r.away);
  ok('첫 직위는 못 받는다',r.r0);
  ok('정예는 늑대만',r.wolfOk);
  ok('문파 창에 맹수 우리',r.panel);
  ok('받으면 한 단계 아래 경지',r.take&&r.realm);
  ok('한 마리만',r.one&&r.tiger);
  ok('주인 경지를 따라 오른다',r.up&&r.floor);
  ok('종마다 배분만 다르다',r.budget);
  ok('평타 = 같은 경지 졸개를 killS초에',r.dps);
  ok('칠 때 경지 차 ±25%',r.rdiff);
  ok('맞을 때 경지 차',r.rhurt);
  ok('평타는 약하다',r.weak);
  ok('기술은 주인 내공을 쓴다',r.skill);
  ok('내공이 모자라면 기술 없음',r.noQi);
  ok('기술 끄기',r.off);
  ok('폐관 호법이 아니다',r.nohob);
  ok('쓰러지면 반 해 우리에서',r.down&&r.stay&&r.restWhy);
  ok('추스르면 돌아온다',r.back);
  ok('저장·불러오기',r.save);
  ok('하산하면 두고 간다',r.leave);
  ok('적 당주는 맹수를 데리고 나온다',r.npc&&r.npcOnce);
  ok('적 맹수는 전리품·인원 없음',r.npcLoot);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(e))}
  await b.close();
})();

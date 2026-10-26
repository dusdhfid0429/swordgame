// 암기 조준 (사용자 2026-10-26 "적 명수에 따라 형태가 바뀌게, 원형·부채꼴은 명중이 너무 적다"; 밸런스 '같은 적 겹침 감쇠')
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{
    const id='사암1';P.eq.weapon=mkWeapon('암',1,0);P.arts[id]={p:0,f:ARTS[id].forms.map(()=>true)};P.cur=id;recalc();P.fx=1;P.fy=0;
    const X=()=>{const x=mkX(id);x.t=0;return x};
    // 적을 놓고 초식을 쓴 뒤 미뤄 둔 연사까지 다 쏘고, 각 투사체가 어느 적을 향하는지 센다
    const run=(f,offs,x=X())=>{mobs=[];projs=[];sched=[];const es=offs.map(([dx,dy])=>{const e=mkMob('산적',P.x+dx,P.y+dy);e.hp=e.maxHp=1e6;mobs.push(e);return e});
      exec(f,es[0],x);for(let i=0;i<40&&sched.length;i++){for(const q of sched)q.t-=.02;const due=sched.filter(q=>q.t<=0);sched=sched.filter(q=>q.t>0);due.forEach(q=>q.f())}
      const at=projs.map(q=>{const a=Math.atan2(q.vy,q.vx);let bi=-1;es.forEach((e,i)=>{const d=Math.atan2(e.y-P.y,e.x-P.x);if(Math.abs(Math.atan2(Math.sin(a-d),Math.cos(a-d)))<.06)bi=i});return bi});
      return{n:projs.length,per:es.map((_,i)=>at.filter(v=>v===i).length),free:at.filter(v=>v<0).length,vol:!!(projs[0]&&projs[0].vol)}};
    const A=GD.AMGI,fan8=A.find(f=>f.n==='팔방표'),mae=A.find(f=>f.n==='매화침'),ult=GD.AMGIU[0].steps[0];
    const one=run(fan8,[[3,0.5]]),two=run(mae,[[2.5,-1],[-2,1]]),many=run(mae,[[2,0],[0,2],[-2,0],[0,-2]]),cap=run(ult,[[2,1]]),none=run(mae,[]);
    // 감쇠: 한 적에게 몰아 맞히면 두 번째 발부터 over 배
    const ms=[],h0=hitE;hitE=(X,e,m,...a)=>{ms.push(+m.toFixed(3));};
    run({...A.find(f=>f.n==='쌍비도')},[[1.5,0]]);for(let i=0;i<60&&projs.length;i++)updateProjs(1/60);const dmg=ms.slice();
    ms.length=0;run({...A.find(f=>f.n==='쌍비도')},[[1.5,-.5],[1.5,.5]]);for(let i=0;i<60&&projs.length;i++)updateProjs(1/60);const dmg2=ms.slice();
    hitE=h0;
    // 다른 계열(궁)은 그대로 부채꼴
    const bowId=Object.keys(ARTS).find(k=>ARTS[k].cls==='궁');const bx=mkX(bowId);bx.t=0;const bow=run({p:'proj',cnt:3,spread:.6,spd:12,len:6,m:.5},[[3,2]],bx);
    return{one,two,many,cap,none,dmg,dmg2,bow,over:GD.AMGI_AIM.over}});
  ok(`적 하나면 팔방표 8발이 모두 그 적에게 (${r.one.per}, 빈 쪽 ${r.one.free})`,r.one.n===8&&r.one.per[0]===8);
  ok(`적 둘이면 매화침 5발을 나눠 겨눔 (${r.two.per})`,r.two.per[0]+r.two.per[1]===5&&r.two.per.every(v=>v>=2));
  ok(`넷이 둘러싸면 한 발씩, 남는 발은 원래 모양으로 (${r.many.per} / 퍼짐 ${r.many.free})`,r.many.per.every(v=>v===1)&&r.many.free===1&&r.many.n===5);
  ok(`오의도 한 적에게는 ${r.cap.per[0]}발까지만, 나머지 ${r.cap.free}발은 퍼짐`,r.cap.per[0]===8&&r.cap.free===r.cap.n-8);
  ok(`적이 없으면 원래 부채꼴 (${r.none.n}발)`,r.none.n===5);
  ok(`같은 적 두 번째 발은 ${r.over}배 (${r.dmg})`,r.dmg.length===2&&r.dmg[0]===0.7&&r.dmg[1]===+(0.7*r.over).toFixed(3));
  ok(`다른 적에게 나눠 맞히면 감쇠 없음 (${r.dmg2})`,r.dmg2.length===2&&r.dmg2.every(v=>v===0.7));
  ok(`궁술은 조준·감쇠 없이 그대로 (${r.bow.per}, ${r.bow.vol})`,!r.bow.vol&&r.bow.free>=2);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

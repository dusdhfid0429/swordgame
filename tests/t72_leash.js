// 줄(leash) 버그 (2026-10-15 v111): 리젠돼 집으로 걸어오는 몹(집에서 15칸 넘게)이 맞을 때마다 아그로가 풀리며 30%씩 차서 못 죽이던 것. 맞으면 제자리를 집으로 삼아 싸우고, 돌아갈 때 회복은 20초에 한 번.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 집에서 20칸 떨어진 채 걸어오는 몹을 때리면 생명이 차지 않고 죽는다
  const r=await p.evaluate(()=>{regionJump('war_field',20.5,24.5);paused=true;mobs=[];const e=mkMob('산적',21.5,24.5);e.home={x:21.5,y:4.5};e.goal={x:21.5,y:4.5};e.rein=1;mobs.push(e);const X=mkX('base');let up=0,last=e.hp,n=0;
    for(let i=0;i<60&&e.hp>0;i++){hitE(X,e,1,0,0);update(.1);if(e.hp>last)up++;last=e.hp;n++}return{dead:e.hp<=0,up,n,home:Math.hypot(e.home.x-e.x,e.home.y-e.y)<2,aggro:e.aggro}});
  ok(`걸어오는 몹: ${r.n}번 공격에 죽음 ${r.dead}, 생명이 찬 횟수 ${r.up}, 집을 제자리로 옮김 ${r.home}`,r.dead&&r.up===0&&r.home);
  // 2. 안 맞은 채 집에서 멀어진 몹은 전처럼 돌아가며 한 번만 회복한다 (20초 안에 다시 안 찬다)
  const q=await p.evaluate(()=>{mobs=[];const e=mkMob('산적',21.5,24.5);e.home={x:21.5,y:4.5};e.hp=40;e.aggro=true;mobs.push(e);update(.1);const h1=e.hp;e.aggro=true;e.hp=40;update(.1);const h2=e.hp;return{h1:Math.round(h1),h2:Math.round(h2),back:!e.aggro}});
  ok(`안 맞은 몹의 귀환: 첫 회복 40→${q.h1}, 바로 다시는 ${q.h2}, 아그로 해제 ${q.back}`,q.h1>60&&q.h2<=41&&q.back);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

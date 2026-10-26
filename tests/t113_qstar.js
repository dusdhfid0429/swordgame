// v178 초식 내공 성 (사용자 2026-10-26): 초식 내공 = 최대 내공 × 비율 × 성/12, 피해는 쓴 내공에 따라, 이펙트는 12성이 지금 그림(최대)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 모든 초식이 고정 내공 없이 비율(qp)을 갖는다
  const a=await p.evaluate(()=>{const bad=[];for(const a of Object.values(ARTS))a.forms.forEach((f,i)=>{if(!(f.qp>0)||'qi' in f)bad.push(a.id+':'+i)});return{bad:bad.slice(0,5),n:bad.length,def:qsCur(),hud:!!document.querySelector('#qsr .qsp i')}});
  ok(`모든 초식이 비율 내공 (틀린 것 ${a.n} ${a.bad}) · 기본 ${a.def}성 · HUD 칸 ${a.hud}`,a.n===0&&a.def===12&&a.hud);
  // 2. 쓰는 내공 = 최대 내공 × qp% × 성/12, 피해 배율은 쓴 내공에 따라
  const c=await p.evaluate(()=>{const f={qp:20},o={},r0=P.realm;P.realm=0;P.maxQi=80;o.q12=formQi(f,12);o.q6=formQi(f,6);o.q1=formQi({qp:1},1);
    const X={};qsX(X,f,12);o.m12=X.qm;o.fs12=X.fs;qsX(X,f,6);o.m6=X.qm;o.fs6=X.fs;
    P.maxQi=320;o.big=formQi(f,12);qsX(X,f,12);o.mbig=X.qm;P.realm=5;P.maxQi=740;o.hw=formQi(f,12);qsX(X,f,12);o.mhw=X.qm;P.realm=r0;recalc();return o});
  const ex=await p.evaluate(()=>({x:QS.exp,r0:QS.ref[0],e5:QS.eff[5]}));const pw=v=>Math.pow(v,ex.x),near=(a,b)=>Math.abs(a-b)<1e-6;
  ok(`삼류 내공 80: 12성 ${c.q12} · 6성 ${c.q6} · 1성 최소 ${c.q1} / 내공 320 12성 ${c.big} · 배율 ${c.m12.toFixed(2)}/${c.m6.toFixed(2)}/${c.mbig.toFixed(2)} · 화경 표준 내공 12성 ${c.hw} 배율 ${c.mhw.toFixed(2)}`,
    c.q12===16&&c.q6===8&&c.q1===1&&c.big===64&&near(c.m12,pw(80/ex.r0))&&near(c.m6,pw(40/ex.r0))&&near(c.mbig,pw(320/ex.r0))&&c.fs12===1&&c.fs6===.5&&c.hw===Math.round(740*.2*ex.e5)&&Math.abs(c.mhw-1)<.02);
  // 3. 실제 초식: 성을 낮추면 내공을 덜 쓰고 피해가 줄고, 이펙트가 옅다. [ ] 키와 HUD 단추로 바꾼다
  const u=await p.evaluate(()=>{const o={};const wp=P.eq.weapon;P.eq.weapon=null;P.cur='base';const go=s=>{P.qs=s;P.maxQi=P.qi=200;P.fcd=[0,0,0,0,0,0];P.gcd=0;P.chain={last:-1,t:-9,sum:0,n:0};
      const w=mkMob('늑대',P.x+1,P.y);w.hp=w.maxHp=1e6;w.def=0;w.hm=-999;mobs.push(w);P.target=w;const n0=fx.length;const q0=P.qi;Math.random=(r=>()=>.5)(Math.random);
      const used=useForm(0,true);const r={used,cost:q0-P.qi,dmg:1e6-w.hp,pw:fx.slice(n0).filter(f=>f.glow).map(f=>f.pw||1)};mobs=mobs.filter(m=>m!==w);P.target=null;return r};
    const r0=Math.random;o.a=go(12);o.b=go(3);Math.random=r0;P.eq.weapon=wp;return o});
  const q=await p.evaluate(()=>{P.qs=12;const o={};document.dispatchEvent(new KeyboardEvent('keydown',{code:'BracketLeft',bubbles:true}));o.k=P.qs;
    document.querySelector('#qsr [data-q="+"]').click();o.p=P.qs;document.querySelector('#qsr .qsp i[data-q="4"]').click();o.d=P.qs;hud();o.t=document.getElementById('qst').textContent;o.on=document.querySelectorAll('#qsr .qsp i.on').length;return o});
  ok(`12성 내공 ${u.a.cost} 피해 ${u.a.dmg} · 3성 내공 ${u.b.cost} 피해 ${u.b.dmg} · 이펙트 밝기 ${Math.max(...u.a.pw)}/${Math.max(...u.b.pw).toFixed(2)} · 키 ${q.k} 단추 ${q.p} 칸 ${q.d} "${q.t}" 켠 칸 ${q.on}`,
    u.a.used&&u.b.used&&u.a.cost===3&&u.b.cost===1&&u.b.dmg<u.a.dmg*.6&&u.b.dmg>u.a.dmg*.4&&u.a.pw.every(x=>x===1)&&u.b.pw.length&&u.b.pw.every(x=>x<.6)&&q.k===11&&q.p===12&&q.d===4&&q.t==='4성'&&q.on===4);
  if(errs.length){console.log('ERRORS');errs.slice(0,8).forEach(e=>console.log(' ',e))}
  await b.close()})();

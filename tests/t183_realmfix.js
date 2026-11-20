// v269 경지별 무공 효과 고침 (동훈님 2026-11-20 '수정해'): 필살기 내공 비율·위력, 현경 덤은 필살기에만, 병기 기운 덤 타격 보정·방어, 검사 0.6초·홀로 선 적, 경지 피해 배율 표, 여분 내공 상한
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{paused=true;for(const m of mobs)m.hp=0;mobs=[];
    const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&ARTS[k].ult&&!ARTS[k].base&&ARTS[k].side==='정');P.arts[id]={p:70,f:ARTS[id].forms.map(()=>true),ws:1};P.cur=id;P.eq.weapon=mkWeapon('검',1,0);
    window.mk=(dx,r)=>{const e=mkMob('산적',P.x+dx,P.y);e.realm=r;scaleMob(e);e.hp=e.maxHp=1e7;e.atk=0;mobs.push(e);return e};
    window.setR=(r,qi)=>{P.realm=r;P.qiBonus=Math.max(0,qi-80);P.qiN=0;P.qiAcc=0;P.qiX=0;recalc();P.qi=P.maxQi;P.wu={검:wuCap(r)}}});
  // 1. 필살기 내공 = 최대 내공 × 20% × 경지 효율, 위력에 내공 수련 회차가 붙지 않는다
  let r=await p.evaluate(()=>{const a=ARTS[P.cur],o={};setR(0,80);o.c0=ultQi(a);o.m0=P.maxQi;setR(8,1700);o.c8=ultQi(a);o.m8=P.maxQi;
    setR(3,380);const q1=ultPow();P.qiN=200;const q2=ultPow();o.same=q1===q2;return o});
  ok(`필살기 내공 삼류 ${r.c0}/${r.m0}, 자연경 ${r.c8}/${r.m8} (예전 55 고정), 수련 회차와 위력 무관 ${r.same}`,r.c0===16&&r.c8===Math.round(r.m8*.2*.25)&&r.same);
  // 2. 현경 필살기 덤은 X.ult 타격에만
  r=await p.evaluate(()=>{setR(6,1000);P.ultT=time;const e=mk(1,6),X=mkX(P.cur);const c1={X,e,from:P,m:1,def:0,hm:0};runHooks('hit',c1);
    const c2={X:{...X,ult:1},e,from:P,m:1,def:0,hm:0};runHooks('hit',c2);return{plain:c1.m,ult:c2.m,want:1+SC().ult}});
  ok(`현경: 필살기 직후 보통 타격 ${r.plain.toFixed(3)} · 필살기 타격 ${r.ult.toFixed(3)} (비 ${(r.ult/r.plain).toFixed(3)} = ${r.want})`,Math.abs(r.ult/r.plain-r.want)<.001);
  // 3. 경지 피해 배율 표가 hit 훅에 그대로 (같은 경지 적이면 경지 차 1)
  r=await p.evaluate(()=>{const o=[];for(const rr of[1,3,5,7]){setR(rr,REALM_QI[rr]);mobs=[];const e=mk(1,Math.min(6,rr)),X=mkX(P.cur);ARTK_OFF=true;const c={X,e,from:P,m:1,def:0,hm:0};runHooks('hit',c);ARTK_OFF=false;o.push({rr,m:c.m,want:GD.REALM_DMG[rr]*(rr>6?1.25:1)})}return o});
  ok(`경지 피해 배율 ${r.map(x=>x.rr+':'+x.m.toFixed(3)).join(' ')}`,r.every(x=>Math.abs(x.m-x.want)<.02));
  // 4. 병기 기운 덤 타격: 경지 차·방어를 탄다 (윗경지 적에게 약하다), 심검은 방어를 빼지 않는다
  r=await p.evaluate(()=>{setR(5,740);mobs=[];const lo=mk(1,5),hi=mk(1.2,6);hi.def=lo.def=10;const k=artK(P.cur)*wuMul('검'),A=atk();
    procHit(lo,.6);procHit(hi,.6);const dl=1e7-lo.hp,dh=1e7-hi.hp;lo.hp=1e7;procHit(lo,.6,1);const dn=1e7-lo.hp;
    return{dl,dh,dn,wl:Math.round(A*.6*k-5),wh:Math.round(A*.6*k*.75-5),wn:Math.round(A*.6*k)}});
  ok(`덤 타격 같은 경지 ${r.dl}(${r.wl}) · 한 단계 위 ${r.dh}(${r.wh}) · 방어 무시 ${r.dn}(${r.wn})`,Math.abs(r.dl-r.wl)<=1&&Math.abs(r.dh-r.wh)<=1&&Math.abs(r.dn-r.wn)<=1);
  // 5. 검사: 곁에 적이 없으면 그 적에게, 0.6초에 한 번
  r=await p.evaluate(()=>{setR(3,380);mobs=[];const e=mk(1,3);const R=Math.random;Math.random=()=>0;let n=0;const d0=damage;damage=function(t,d,...a){if(t===e)n++;return d0.call(this,t,d,...a)};
    const fire=()=>{const c={X:mkX(P.cur),e,from:P,m:1,def:0,hm:0,hp0:e.hp+10};runHooks('hitDone',c)};P.saT=-9;fire();const a=n;fire();const b2=n;time+=.7;fire();damage=d0;Math.random=R;return{a,b2,c:n}});
  ok(`검사 홀로 선 적에게 ${r.a}회, 0.6초 안 두 번째 ${r.b2-r.a}회, 0.7초 뒤 ${r.c-r.b2}회`,r.a===1&&r.b2===1&&r.c===2);
  // 6. 여분 내공 덤 상한: 단전 배율 × 1.5 까지
  r=await p.evaluate(()=>{setR(3,380);const f=ARTS[P.cur].forms[0],q1=formPow(formQi(f),f);setR(3,380*4);const q4=formPow(formQi(f),f);return{q1,q4,cap:Math.pow(danMul()*QS.cap,QS.exp)}});
  ok(`내공 문턱 qm ${r.q1.toFixed(3)} · 네 배 ${r.q4.toFixed(3)} (상한 ${r.cap.toFixed(3)})`,Math.abs(r.q4-r.cap)<.001&&r.q1<r.q4);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

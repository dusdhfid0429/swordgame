// v268 (동훈님 2026-11-19 "줌인 줌아웃되거나 연출이 나올 때 히치"): 카메라가 당겨지는 동안 건물 그림 캐시를 프레임마다 새로 굽지 않는다.
// 배율만 달라진 건물은 있던 그림을 늘려 그리고, 배율이 멈춘 뒤 한 프레임에 한 채씩 또렷하게 다시 굽는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{const b=await chromium.launch();const errs=[];const ok=(n,v)=>console.log((v?'PASS ':'FAIL ')+n);
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{P.vit=2000;P.x=27.5;P.y=13.5;P.path=null;mobs=mobs.filter(m=>m.d.villager);spawnTick=()=>{};
    window.__cv=0;window.__seen=new Set();const v0=drawBuildVec;drawBuildVec=function(){__cv++;return v0.apply(this,arguments)};const d0=drawBuild;drawBuild=function(b){__seen.add(b);return d0.apply(this,arguments)}});await p.waitForTimeout(1500);
  const vis=await p.evaluate(()=>{__seen.clear();return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(__seen.size))))});
  const run=async(name,fn,ms)=>{await p.evaluate(()=>{__cv=0;window.__fr=0;const f=()=>{__fr++;if(window.__cnt)requestAnimationFrame(f)};window.__cnt=1;requestAnimationFrame(f)});await p.evaluate(fn);await p.waitForTimeout(ms);
    const r=await p.evaluate(()=>{__cnt=0;return{cv:__cv,fr:__fr}});ok(`${name}: 건물 그림을 다시 굽는 수가 화면의 건물 수 안쪽 (${r.cv}장 / 건물 ${vis}채 / ${r.fr}프레임)`,vis>0&&r.cv<=vis+2);return r};
  await run('수련 창 열기 줌인',()=>openTrain(),2500);
  const st=await p.evaluate(()=>{__seen.clear();return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(BCACHE.filter(c=>__seen.has(c.b)).map(c=>Math.abs(c.k-BC_K)<1e-6)))))});
  ok(`줌이 멈추면 보이는 건물은 새 배율로 또렷하게 다시 굽힌다 (${st.filter(Boolean).length}/${st.length})`,st.length>0&&st.every(Boolean));
  await run('수련 창 닫기 줌아웃',()=>closeTrain(),3500);
  await run('경지 돌파 연출',()=>{P.realm=5;brkFx(5)},6000);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}await b.close()})();

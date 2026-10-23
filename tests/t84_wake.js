// 화면 꺼짐 막기 (v131, 사용자): 게임 중 손길이 있으면 Wake Lock을 받고, 다른 탭·게임 종료면 놓고, 돌아오면 다시 받는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  // 가짜 Wake Lock: 요청·해제 횟수를 센다
  await p.addInitScript(()=>{window._wl={req:0,rel:0,held:0};Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>{_wl.req++;_wl.held++;const ls=new Set;return{released:false,release(){if(!this.released){this.released=true;_wl.rel++;_wl.held--;ls.forEach(f=>f())}},addEventListener(n,f){if(n==='release')ls.add(f)}}}},configurable:true});
    window._hid=false;Object.defineProperty(document,'hidden',{get:()=>window._hid,configurable:true})});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1000);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.waitForTimeout(300);
  ok('제목 화면에서는 화면 잠금을 잡지 않는다',await p.evaluate(()=>_wl.held===0&&!playing));
  await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  ok('게임을 시작하면 화면 잠금을 잡는다',await p.evaluate(()=>playing&&_wl.held===1));
  await p.evaluate(()=>{window._hid=true;document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(400);
  ok('다른 앱·탭으로 가면 놓는다',await p.evaluate(()=>_wl.held===0&&_wl.rel===1));
  await p.evaluate(()=>{window._hid=false;document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(400);
  ok('돌아오면 다시 잡는다',await p.evaluate(()=>_wl.held===1&&_wl.req>=2));
  await p.evaluate(()=>{P.hp=1;const r0=Math.random;Math.random=()=>.99;hurtP(999,mkMob('늑대',P.x+1,P.y));P.inv=0;hurtP(999,mkMob('늑대',P.x+1,P.y));   /* v172: 첫 치명타는 빈사, 빈사 중 또 맞으면 쓰러진다 */Math.random=r0});   /* 회피 확률(3% 이상)에 걸리면 안 죽어 가끔 실패하던 것 */await p.waitForFunction(()=>!playing&&_wl.held===0,null,{timeout:8000}).catch(()=>{});   // 느린 CI에서 1.5초 고정 대기가 모자랐다
  const d=await p.evaluate(()=>({playing,held:_wl.held}));
  ok(`생이 끝나 게임이 멈추면 놓는다 (playing ${d.playing}, 잡음 ${d.held})`,!d.playing&&d.held===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

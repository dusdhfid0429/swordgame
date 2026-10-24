// 발열·배터리 (사용자 2026-10-24): 그림 수 상한(게임 60·창/제목 30, 절전 30·15), 절전 해상도 1.5배, 성능 표시, 5분 손길 없으면 화면 잠금 놓기
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch({args:['--disable-gpu-vsync','--disable-frame-rate-limit']});const errs=[];
  const c=await b.newContext({viewport:{width:844,height:390},deviceScaleFactor:3,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.addInitScript(()=>{window._wl={held:0};Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>{_wl.held++;const ls=new Set;return{released:false,release(){if(!this.released){this.released=true;_wl.held--;ls.forEach(f=>f())}},addEventListener(n,f){if(n==='release')ls.add(f)}}}},configurable:true})});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1000);
  await p.evaluate(()=>localStorage.clear());
  const rate=async()=>{await p.evaluate(()=>{window._n=0;if(!window._pw){window._pw=1;const f=pwrFrame;pwrFrame=function(ms){_n++;return f(ms)}}});await p.waitForTimeout(2000);return p.evaluate(()=>_n/2)};
  const t=await rate();ok(`제목 화면은 초당 30장 안쪽 (${t})`,t<=32);
  await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(800);
  ok(`그리는 해상도는 2배까지 (${await p.evaluate(()=>C.width)})`,await p.evaluate(()=>C.width===Math.round(C.getBoundingClientRect().width*2)));
  const g=await rate();ok(`게임 중은 초당 60장 안쪽 (${g}, 상한 ${await p.evaluate(()=>pwrFps())})`,g<=62&&await p.evaluate(()=>pwrFps()===60));   // 헤드리스는 소프트웨어로 그려 60장에 못 미칠 수 있어 상한값을 본다
  await p.evaluate(()=>openPanel('char'));const w=await rate();ok(`창을 열어 멈추면 초당 30장 안쪽 (${w})`,w<=32);
  await p.evaluate(()=>closePanels());
  ok('메뉴에 절전·성능 표시 단추',await p.evaluate(()=>pMenu().includes('snd:pw')&&pMenu().includes('snd:meter')));
  await p.evaluate(()=>sndToggle('pw'));await p.waitForTimeout(200);
  ok('절전이면 해상도 1.5배',await p.evaluate(()=>C.width===Math.round(C.getBoundingClientRect().width*1.5)));
  const s=await rate();ok(`절전 게임 중은 초당 30장 안쪽 (${s})`,s<=32);
  ok('절전 설정은 기기에 남는다',await p.evaluate(()=>JSON.parse(localStorage.getItem('ganghoyunhoe-power')||'{}').save===1));
  await p.evaluate(()=>sndToggle('meter'));await p.waitForTimeout(2300);
  const m=await p.evaluate(()=>{const e=document.getElementById('pmeter');return e&&e.textContent});ok(`성능 표시가 뜬다 (${(m||'').split('\n')[0]})`,!!m&&/초당 \d+장/.test(m)&&/배터리/.test(m));
  await p.evaluate(()=>sndToggle('meter'));ok('성능 표시를 끄면 사라진다',await p.evaluate(()=>!document.getElementById('pmeter')));
  await p.evaluate(()=>sndToggle('pw'));
  // 화면 잠금: 5분 손길 없으면 놓고, 만지면 다시 잡는다
  ok('게임 중 화면 잠금을 잡고 있다',await p.evaluate(()=>_wl.held===1));
  await p.evaluate(()=>{wakeIn=Date.now()-6*60e3;wakeTick()});await p.waitForTimeout(200);
  ok('5분 손길이 없으면 화면 잠금을 놓는다',await p.evaluate(()=>_wl.held===0));
  await p.mouse.click(400,200);await p.waitForTimeout(300);
  ok('다시 만지면 화면 잠금을 잡는다',await p.evaluate(()=>_wl.held===1));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

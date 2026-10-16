// 가짜 토스 SDK(window.AIT)를 넣고 앱인토스 대응을 확인한다: 상단 버튼 자리, 세로 고정, 저장, 뒤로 가기·종료 창, 화면 내림.
const {chromium}=require(process.env.PWPATH||'playwright');
require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
const shot=n=>__dirname+'/shots/'+n+'.png';
const MOCK=()=>{const S=JSON.parse(sessionStorage.getItem('mockS')||'{}'),put=()=>sessionStorage.setItem('mockS',JSON.stringify(S));
  window.__ait={calls:[],back:null};const log=(...a)=>window.__ait.calls.push(a.join(' '));
  window.AIT={
    Storage:{getItem:async k=>S[k]??null,setItem:async(k,v)=>{S[k]=v;put()},removeItem:async k=>{delete S[k];put()},clearItems:async()=>{}},
    graniteEvent:{addEventListener:(e,a)=>{if(e==='backEvent')window.__ait.back=a.onEvent;return()=>{}}},
    Screen:{setOrientation:async o=>log('orient',o.type),close:async()=>log('close')},
    SafeArea:{subscribe:({onEvent})=>{onEvent({top:47,bottom:34,left:0,right:0});return()=>{}}},
    getUserKeyForGame:async()=>({type:'HASH',hash:'u123'})}};
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await c.addInitScript(MOCK);
  const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url);await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await p.reload();await p.waitForTimeout(1500);
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  ok('toss layout + touch mode',await p.evaluate(()=>INTOSS&&TOUCH&&document.body.classList.contains('toss')));
  ok('portrait locked',await p.evaluate(()=>__ait.calls.includes('orient portrait')));
  await p.tap('[data-s="new"]');await p.tap('[data-s="start"]');await p.waitForTimeout(600);
  // 토스 X 버튼: 오른쪽 끝에서 10px, 안전 영역 위에서 5~10px. 크기를 넉넉히 44px로 잡아 그 칸을 비운다.
  const rects=await p.evaluate(()=>['mini','tmenu'].map(id=>{const r=$(id).getBoundingClientRect();return{id,top:r.top,right:r.right}}));
  ok(`HUD clear of Toss ··· / X row (${rects.map(r=>r.id+' top '+r.top).join(', ')})`,rects.every(r=>r.top>=47+10+44));
  await p.screenshot({path:shot('toss_play')});
  await p.evaluate(()=>saveGame(true));await p.waitForTimeout(100);
  ok('save goes to Toss Storage under the user key',await p.evaluate(()=>!!JSON.parse(sessionStorage.getItem('mockS')||'{}')['ganghoyunhoe-save-v1:u123']));
  // 뒤로 가기: 창 닫기 → 종료 확인 창 → 계속하기 → 다시 → 끝내기
  await p.tap('#tmenu');await p.tap('[data-act="open:bag"]');await p.evaluate(()=>__ait.back());
  ok('back closes an open window',await p.evaluate(()=>$('win').hidden&&EXITQ.hidden));
  await p.evaluate(()=>__ait.back());
  ok('back with nothing open asks to exit and pauses',await p.evaluate(()=>!EXITQ.hidden&&paused));
  await p.screenshot({path:shot('toss_exit')});
  await p.tap('[data-q="stay"]');
  ok('계속하기 resumes',await p.evaluate(()=>EXITQ.hidden&&!paused));
  // 화면 내림
  await p.evaluate(()=>{P.hp--;Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
  ok('going to background pauses',await p.evaluate(()=>paused));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});
  ok('coming back resumes',await p.evaluate(()=>!paused));
  await p.evaluate(()=>__ait.back());await p.tap('[data-q="leave"]');await p.waitForTimeout(100);
  ok('끝내기 closes the mini app',await p.evaluate(()=>__ait.calls.includes('close')));
  // 다시 열기: 브라우저 저장이 지워져도 토스 저장소에서 이어하기
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1500);
  ok('continue restored from Toss Storage',await p.locator('[data-s="cont"]').count()===1);
  await p.screenshot({path:shot('toss_title')});
  await p.setViewportSize({width:844,height:390});await p.waitForTimeout(200);
  ok('landscape shows rotate notice',await p.evaluate(()=>getComputedStyle($('stage'),'::after').content.includes('세로')));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');
  await b.close();
})();

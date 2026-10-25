// 안드로이드 설치판 점검: build_apk.py 가 만든 android/build/stage/assets/index.html 을 AndroidApp 흉내와 함께 띄운다
// node android/test_apk.js   (먼저 python3 android/build_apk.py --keystore ... 를 돌린다)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errs=[],net=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  p.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))net.push(r.url())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.addInitScript(()=>{window.__apk={keep:[],exit:0};window.AndroidApp={keepScreen:on=>__apk.keep.push(on),exit:()=>__apk.exit++}});
  await p.goto('file://'+require('path').resolve(__dirname,'build/stage/assets/index.html')+'?noacad');
  await p.waitForFunction(()=>typeof loadRegion==='function'&&typeof apkBack==='function');await p.evaluate(()=>localStorage.clear());
  const f=await p.evaluate(async()=>{await document.fonts.ready;return ['Song Myung','Gowun Dodum'].map(n=>document.fonts.check(`16px "${n}"`,'강호'))});
  ok(`글꼴 둘 다 기기 안에서 읽음 ${f}`,f.every(Boolean));
  ok(`터치 조작으로 시작 ${await p.evaluate(()=>TOUCH)}`,await p.evaluate(()=>TOUCH));
  await p.evaluate(()=>apkBack());
  ok('첫 화면에서 뒤로 → 끝낼지 묻는 창',await p.evaluate(()=>!document.querySelector('.apkq').hidden));
  await p.click('.apkq [data-q="stay"]');
  ok('계속하기 → 창 닫힘',await p.evaluate(()=>document.querySelector('.apkq').hidden&&__apk.exit===0));
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  await p.evaluate(()=>{P.silver=4321;openPanel('menu')});await p.evaluate(()=>apkBack());
  ok('창이 열려 있으면 뒤로 → 창만 닫음',await p.evaluate(()=>$('win').hidden&&document.querySelector('.apkq').hidden));
  await p.evaluate(()=>apkBack());
  ok('놀이 중 뒤로 → 묻는 창 + 멈춤',await p.evaluate(()=>!document.querySelector('.apkq').hidden&&paused));
  await p.click('.apkq [data-q="leave"]');
  const sv=await p.evaluate(()=>({exit:__apk.exit,save:(localStorage.getItem(SAVE_KEY)||'').includes('4321')}));
  ok(`끝내기 → 저장하고 앱 닫기 (exit ${sv.exit}, 저장 ${sv.save})`,sv.exit===1&&sv.save);
  const wl=await p.evaluate(async()=>{const l=await navigator.wakeLock.request('screen');await l.release();return __apk.keep.join(',')});
  ok(`화면 켜 두기 → 창 플래그 (${wl})`,/true/.test(wl)&&wl.endsWith('false'));
  ok('바깥 주소 요청 없음: '+net.slice(0,3).join(' '),net.length===0);
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

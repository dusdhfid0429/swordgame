// 꺼짐 기록 (사용자 2026-10-24 "게임이 자꾸 꺼져 로그 확인해줘"): 갑자기 죽은 다음 켜면 제목에 기록과 복사 단추, 정상으로 닫으면 안 뜬다.
// 함께 메모리 줄이기: 그리는 해상도 2배 상한, 맞을 때 흰 그림은 장 하나 크기로만
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const URL='file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad';
  let p=await c.newPage();p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto(URL);await p.waitForTimeout(1200);
  await p.evaluate(()=>localStorage.clear());
  ok('처음 켜면 꺼짐 알림 없음',await p.evaluate(()=>!document.querySelector('#scrbox .crashcard')));
  await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(600);
  const r=await p.evaluate(()=>({cw:C.width,css:C.getBoundingClientRect().width}));
  ok(`배율 3 화면도 2배로만 그린다 (${r.cw} = ${r.css}×2)`,Math.abs(r.cw-r.css*2)<=1);
  // 전수 점검에서 찾은 것: 성에 속하지 않은 곳(전각 안·본산)에서 정세 창을 열면 오류가 났다
  const wv=await p.evaluate(()=>{const out=[];for(const id of[Object.keys(REGIONS).find(k=>REGIONS[k].hall),'hq_hwasan','maeng_jeong']){if(!REGIONS[id]){out.push(id+' 없음');continue}
    try{regionJump(id,Math.min(N-2,6),Math.min(NH-2,6));openPanel('world');out.push(id+':'+(panel==='world'&&$('wbody').innerText.includes('이웃')));closePanels()}catch(e){out.push(id+' '+e.message)}}regionJump('gaebong',20,20);return out});
  ok(`전각·본산·맹 총단에서 정세 창 (${wv.join(', ')})`,wv.every(x=>/:true$/.test(x)));
  await p.evaluate(()=>{openPanel('bag');console.error('시험 오류 하나')});await p.evaluate(()=>{const b=document.querySelector('#wx');b&&b.click()});await p.waitForTimeout(2300);
  // 웹뷰가 죽은 것처럼: 앞 페이지가 pagehide 없이 '켜져 있는 채'로 남긴 기록을 다음 페이지가 읽는다
  const old=p;p=await c.newPage();p.on('pageerror',e=>errs.push('PE '+e.message));await p.goto(URL);await p.waitForTimeout(1500);
  const s=await p.evaluate(()=>{const k=document.querySelector('#scrbox .crashcard');return{has:!!k,t:k?k.textContent:''}});
  ok(`갑자기 꺼진 뒤엔 제목에 기록 (오류·누른 단추·지역 들어 있음)`,s.has&&s.t.includes('시험 오류 하나')&&s.t.includes('start')&&s.t.includes('gaebong')&&s.t.includes('기록 복사'));
  await p.screenshot({path:__dirname+'/shots/crash_title.png'});
  // ☰ 메뉴에서도 본다
  ok('☰ 메뉴에 마지막 꺼짐 기록',await p.evaluate(()=>pMenu().includes('crashcard')));
  // 정상으로 닫으면(pagehide) 다음엔 알림이 없다
  await old.close({runBeforeUnload:true});await p.close({runBeforeUnload:true});p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1200);
  ok('정상으로 닫은 뒤엔 제목 알림 없음',await p.evaluate(()=>!document.querySelector('#scrbox .crashcard')));
  // 흰 그림은 장 하나 크기, 한 번만 굽는다
  const w=await p.evaluate(()=>{const S=SHEETS.act,f=S.frames[0];const a=whiteRect(S.img,...f.r),b2=whiteRect(S.img,...f.r);return{w:a.width,h:a.height,fw:f.r[2],same:a===b2,sheet:S.img.width}});
  ok(`흰 그림 ${w.w}×${w.h} (시트 폭 ${w.sheet})`,w.same&&w.w===Math.ceil(w.fw)&&w.w<w.sheet);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no errors');await b.close()})();

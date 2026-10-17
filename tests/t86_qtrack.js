// 임무 줄·시스템 메시지 (v136, 사용자 2026-10-17): 폭을 줄이고, 임무 줄은 높이 고정·스크롤, 누르면 임무창. 세로·가로 터치 화면에서 서로 겹치지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  for(const[w,h,n]of[[390,844,'세로'],[844,390,'가로']]){
    const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));
    await p.goto(url+'?touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
    await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
    await p.evaluate(()=>{for(const [n,m] of [['수련곡 산적 소탕','산적'],['늑대 몰아내기','늑대'],['산적두목 토벌','산적두목']])P.quests.push({n,kind:'kill',mob:[m],cnt:3,have:0,silver:1,vit:1});
      sysMsg('패천관에서는 강한 자가 옳다. 살아남고 싶으면 이 정도 긴 문장도 버텨야 한다고 관주가 말했다.','sys')});
    await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{const q=$('qtrack'),qr=q.getBoundingClientRect(),s=document.querySelector('.sysmsg p.on'),sr=s&&s.getBoundingClientRect();
      const hit=(a,b)=>a&&b&&a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
      return{w:qr.width,h:qr.height,vw:innerWidth,scroll:q.scrollHeight>q.clientHeight,sw:sr&&sr.width,over:hit(qr,sr),over2:[...document.querySelectorAll('#tquick button:not([hidden])')].some(e=>hit(qr,e.getBoundingClientRect()))}});
    ok(`${n}: 임무 줄 폭 ${Math.round(r.w)}px·높이 ${Math.round(r.h)}px 고정, 스크롤 ${r.scroll}, 메시지 폭 ${Math.round(r.sw)}px, 겹침 없음 (메시지 ${r.over}, 빠른 단추 ${r.over2})`,r.w<=Math.min(230,r.vw*.45)&&r.h<=140&&r.scroll&&r.sw<=270&&!r.over&&!r.over2);
    await p.evaluate(()=>{$('qtrack').scrollTop=999});const st=await p.evaluate(()=>$('qtrack').scrollTop);
    await p.tap('#qtrack');await p.waitForTimeout(200);
    const pn=await p.evaluate(()=>panel);
    ok(`${n}: 임무 줄 스크롤 ${st>0}, 누르면 임무창 (${pn})`,st>0&&pn==='quest');
    await p.close()}
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

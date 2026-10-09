// 시스템 메시지: 창 위 최상단 레이어에 뜨고, 조작 UI와 겹치지 않고, 서서히 사라진다
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
const hit=(a,b)=>a&&b&&a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  for(const[nm,vp]of[['세로',{width:390,height:844}],['가로',{width:844,height:390}]]){
    const c=await b.newContext({viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
    p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
    await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
    await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
    await p.evaluate(()=>{const b=Object.values(ARTS).find(x=>x.side===P.side&&!x.sect&&!A(x.id)&&x.cls===curCls());P.bag.push(mkBook(b.id,0));P.vit+=200;openPanel('bag')});await p.waitForTimeout(200);
    const id=await p.evaluate(()=>P.bag.find(i=>i.slot==='book').id);
    await p.locator(`[data-act="read:${id}"]`).tap();await p.waitForTimeout(450);
    await p.waitForFunction(()=>{const m=document.querySelector('.sysmsg p.on');return m&&+getComputedStyle(m).opacity>.9},null,{timeout:5000}).catch(()=>{});   // 바쁜 기계에서는 나타나는 데 더 걸린다
    const r=await p.evaluate(()=>{const R=e=>{if(!e)return null;const q=e.getBoundingClientRect();return q.width?{l:q.left,r:q.right,t:q.top,b:q.bottom}:null};
      const m=document.querySelector('.sysmsg p.on'),z=+getComputedStyle(document.querySelector('.sysmsg')).zIndex,cs=m&&getComputedStyle(m);
      const ui=['joy','tbtns','mini','wx'].map(i=>R($(i))).concat([R(document.querySelector('.status'))]);
      return{t:m&&m.textContent,op:cs&&+cs.opacity,z,box:R(m),ui,winZ:getComputedStyle($('win')).zIndex}});
    ok(`[${nm}] 비급을 읽으면 시스템 메시지 "${r.t}"`,!!r.t&&r.t.includes('익혔습니다'));
    ok(`[${nm}] 창보다 위 레이어 (z ${r.z})`,r.z>=30&&r.op>.9);
    ok(`[${nm}] 조이스틱·버튼·상태창·지도·닫기 버튼과 겹치지 않음`,!r.ui.some(u=>hit(u,r.box)));
    await p.screenshot({path:shot('sysmsg_'+(nm==='세로'?'portrait':'landscape'))});
    // 사라지는 도중을 시간으로 엿보면 바쁜 기계에서 놓친다. 대신 페이지 안에서 'off'(서서히 사라짐) 전환과 그 길이를 기록한다
    await p.evaluate(()=>{window._fade=null;const m=document.querySelector('.sysmsg p');if(!m)return;
      new MutationObserver(()=>{if(m.classList.contains('off')&&!window._fade)window._fade={dur:getComputedStyle(m).transitionDuration,op:+getComputedStyle(m).opacity}}).observe(m,{attributes:true})});
    await p.waitForFunction(()=>{const m=document.querySelector('.sysmsg p');return !m||+getComputedStyle(m).opacity===0},null,{timeout:15000}).catch(()=>{});
    const fd=await p.evaluate(()=>({f:window._fade,end:(m=>m?+getComputedStyle(m).opacity:0)(document.querySelector('.sysmsg p'))}));
    ok(`[${nm}] 몇 초 뒤 서서히 사라진다 (전환 ${fd.f&&fd.f.dur}, 끝 ${fd.end})`,!!fd.f&&parseFloat(fd.f.dur)>=.3&&fd.end===0);
    // 창이 닫혀 있을 때 전투 기록은 띄우지 않는다
    await p.evaluate(()=>{closePanels();log('테스트 전투 기록','info')});await p.waitForTimeout(300);
    ok(`[${nm}] 창이 닫혀 있을 때 일반 기록은 띄우지 않는다`,await p.evaluate(()=>!document.querySelector('.sysmsg p')));
    await c.close()}
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

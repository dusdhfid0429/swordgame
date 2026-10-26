// 사용자 2026-10-26: 세로 화면에서 성 고르는 칸이 시스템 알림·기록 줄과 겹쳐, 누르면 기록 창이 열렸다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  for(const [w,h,m] of [[475,751,1],[900,420,1],[1100,760,0]]){
    const p=await b.newPage({viewport:{width:w,height:h},hasTouch:!!m,isMobile:!!m});
    p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',x=>{if(x.type()==='error')errs.push('CE '+x.text())});
    await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
    await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
    const tap=async(x,y)=>{if(m)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y)};
    const say=()=>p.evaluate(()=>{for(let i=0;i<5;i++)log('기록 줄 시험 '+i,'sys');sysMsg('시스템 알림 시험 문구가 좀 길게 나온다','sys');sysMsg('두 번째 알림','info')});
    await say();await p.waitForTimeout(300);
    const c=await p.evaluate(()=>{const r=document.getElementById('qsc').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
    await tap(...c);await p.waitForTimeout(150);
    // 열린 칸 12개 모두 맨 위에 있어 그대로 눌린다
    const a=await p.evaluate(()=>{const bad=[];document.querySelectorAll('#qsr button').forEach(bt=>{const r=bt.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(!bt.contains(e)||r.x<0||r.right>innerWidth)bad.push(bt.dataset.q)});
      const r=document.querySelector('#qsr [data-q="5"]').getBoundingClientRect();return{open:!document.getElementById('qsr').hidden,bad,b5:[r.x+r.width/2,r.y+r.height/2]}});
    await tap(...a.b5);await p.waitForTimeout(200);
    const s=await p.evaluate(()=>({qs:P.qs,closed:document.getElementById('qsr').hidden,panel,vis:getComputedStyle(document.querySelector('.sysmsg')).visibility}));
    ok(`${w}x${h}${m?' 터치':''}: 열림 ${a.open} · 가려진 칸 [${a.bad}] · 5성 눌러 ${s.qs}성 닫힘 ${s.closed} · 기록 창 안 열림 ${s.panel!=='logs'} · 닫은 뒤 알림 보임 ${s.vis}`,
      a.open&&!a.bad.length&&s.qs===5&&s.closed&&s.panel!=='logs'&&s.vis==='visible');
    // 칸이 떠 있을 때 밖(기록 줄 자리)을 눌러 닫아도 기록 창이 열리지 않는다
    if(m){await say();await tap(...c);await p.waitForTimeout(150);
      // 터치는 가까운 단추로 끌려가므로 칸에서 넉넉히 떨어진, 알림·기록 줄이 있던 자리를 누른다
      const l=await p.evaluate(()=>{const r=document.querySelector('.sysmsg').getBoundingClientRect(),q=document.getElementById('qsr').getBoundingClientRect();let y=r.y+r.height/2;if(y>q.y-30&&y<q.bottom+30)y=q.bottom+30;return[r.x+r.width/2,y]});
      await tap(...l);await p.waitForTimeout(200);
      const z=await p.evaluate(()=>({closed:document.getElementById('qsr').hidden,panel}));
      ok(`${w}x${h}: 밖을 눌러 닫힘 ${z.closed} · 기록 창 안 열림 ${z.panel!=='logs'}`,z.closed&&z.panel!=='logs')}
    await p.close()}
  if(errs.length){console.log('ERRORS');errs.slice(0,8).forEach(e=>console.log(' ',e))}
  await b.close()})();

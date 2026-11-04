// 포털 이름표 겹침 (사용자 2026-11-04 "포탈에 이름이 겹쳐"): 무관 길잡이가 포털 이름을 한 번 더 쓰지 않고,
// 이름표는 곁에 선 주인공을 덮지 않게 머리 위로 올라간다. 그림 tests/shots/t151_portaltag.png
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{const A=acadOf(P.side),f=acadField(P.side);enterRegion(f,10,10);mobs.length=0;
    const g=REGIONS[f].gates.find(q=>q.to===A.id);P.x=g.x+.7;P.y=g.y-.7;camX=P.x;camY=P.y;return{gx:g.x,gy:g.y,f}});
  await p.waitForTimeout(4500);
  const m=await p.evaluate(r=>{const A=acadOf(P.side),g=REGIONS[r.f].gates.find(q=>q.to===A.id),c=toScreen(g.x,g.y),q=toScreen(P.x,P.y),hh=66*Math.min(1,heroAgeK());
    const ty=portalTagY(g),mk=acadMarks().find(o=>o.tag);ctx.font='11px "Gowun Dodum",sans-serif';const tw=ctx.measureText(g.label).width;
    const lab={l:c.x-tw/2-4,r:c.x+tw/2+4,t:ty-11,b:ty+4},hero={l:q.x-14,r:q.x+14,t:q.y-hh,b:q.y};
    const hit=lab.l<hero.r&&lab.r>hero.l&&lab.t<hero.b&&lab.b>hero.t;return{hit,mk:!!mk,tip:mk?c.y-mk.h:0,labT:lab.t,ty,lbl:g.label}},r);
  ok('무관 길잡이가 포털에 붙으면 이름을 다시 쓰지 않는다',m.mk);
  ok(`이름표(${m.lbl})가 주인공을 덮지 않는다`,!m.hit);
  ok(`길잡이 화살표 끝(${m.tip|0})이 이름표 위(${m.labT|0})`,m.tip<=m.labT);
  await p.screenshot({path:require('path').join(__dirname,'shots/t151_portaltag.png'),clip:{x:95,y:330,width:200,height:180}});
  ok('오류 없음 '+errs.join(' | ').slice(0,300),!errs.length);
  await b.close()})();

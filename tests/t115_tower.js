// v179: 여러 층 누각 — 개봉·성도 객잔이 층마다 처마를 두른 누각으로 서고, 안에서 계단으로 위아래 층을 오간다 (g_tower.js)
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 바깥: 개봉 객잔은 3층 누각
  const r0=await p.evaluate(()=>{enterRegion('gaebong',16.5,19.5);mobs=[];const b=builds.find(b=>b.kind==='inn');const t=iso(16.5,18);cam.x=t.x;cam.y=t.y-40;
    const caps=Object.entries(REGIONS).filter(([id,R])=>R.city==='cap').map(([id])=>id),towns=Object.entries(REGIONS).filter(([id,R])=>R.city==='town').map(([id])=>id);
    return{fl:b&&b.fl,h:b&&towerDims(b).RH,caps:caps.length,capOk:caps.every(id=>REGIONS[hallId(id,0)].tower&&REGIONS[hallId(id,0)+'_3f']),townOk:towns.every(id=>REGIONS[hallId(id,0)+'_2f']&&!REGIONS[hallId(id,0)+'_3f'])}});
  ok(`개봉 객잔은 ${r0.fl}층 누각 (높이 ${r0.h})`,r0.fl===3&&r0.h>110);
  ok(`성도 ${r0.caps}곳 객잔은 3층, 고을 객잔은 2층`,r0.caps>5&&r0.capOk&&r0.townOk);
  await p.waitForTimeout(400);await p.screenshot({path:shot('tower_out')});
  // 층마다: 계단 앞자리에서 모든 계단·문으로 걸어 닿는다
  const r1=await p.evaluate(()=>{const hid=hallId('gaebong',0),bad=[];
    for(const id of[hid,hid+'_2f',hid+'_3f']){enterRegion(id,7.5,9);const gs=REGION().gates,seen=new Set,q=[];
      const st=gs.map(g=>[Math.floor(g.x),Math.floor(g.y)]);const s=st[0];seen.add(s+'');q.push(s);
      while(q.length){const[x,y]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=a+','+b;if(seen.has(k)||!walk(a,b))continue;seen.add(k);q.push([a,b])}}
      for(const[i,g]of gs.entries())if(!seen.has(st[i]+''))bad.push(id+' '+g.label);
      for(const g of gs)if(!walkAt(g.tx,g.ty)&&g.to.startsWith('in_'))bad.push('도착 '+g.label);
      if(!gs.length)bad.push(id+' 계단 없음')}
    return bad});
  ok(`층마다 계단·문이 이어진다 ${r1.join(', ')}`,!r1.length);
  // 실제로 계단 앞에 서서 오르고 내린다
  const go=async label=>{await p.evaluate(l=>{const g=REGION().gates.find(g=>g.label===l||g.label.includes(l));P.x=g.x;P.y=g.y;P.gateLock=0;for(let i=0;i<40;i++)gateTick(.1)},label);await p.waitForTimeout(600);return p.evaluate(()=>({reg:REG,name:REGION().name,x:P.x,y:P.y,w:walkAt(P.x,P.y)}))};
  await p.evaluate(()=>{enterRegion(hallId('gaebong',0),7.5,9)});
  const a=await go('2층');ok(`1층 계단 → ${a.name}`,/_2f$/.test(a.reg)&&a.w);
  await p.screenshot({path:shot('tower_2f')});
  const bb=await go('3층');const top=await p.evaluate(()=>[...document.querySelectorAll('#log p')].map(e=>e.textContent).join('|'));
  ok(`2층 계단 → ${bb.name}, 풍경 한 줄`,/_3f$/.test(bb.reg)&&bb.w&&/내려다보인다|풍경/.test(top));
  await p.screenshot({path:shot('tower_3f')});
  const d1=await go('2층으로');const d2=await go('1층으로');
  ok(`내려와서 2층(${d1.name}) → 1층(${d2.name}), 1층 문으로 개봉에 나간다`,/_2f$/.test(d1.reg)&&d2.reg==='in_gaebong_0'&&d2.w);
  const out=await go('개봉');ok('1층 문 → 개봉',out.reg==='gaebong');
  // 저장하고 불러오면 위층에 그대로
  const sv=await p.evaluate(async()=>{enterRegion(hallId('gaebong',0)+'_3f',7.5,6);P.reg=REG;saveGame(true);loadRegion('gaebong');gateTick(0);return REG});
  ok(`3층에서 저장·불러오면 그 층 (${sv})`,/_3f$/.test(sv));
  ok('오류 없음 '+errs.slice(0,3).join(' / '),!errs.length);
  await b.close()})();

// 개봉 중립지대: 기본 동물과 양민만, 두목·세력 무인 없음. 흑풍채 산채와 혈교 동굴은 하남성으로
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const g=await p.evaluate(()=>{mobs=[];G.bossT={};const P0={x:P.x,y:P.y};
    for(let t=0;t<40;t++){P.x=3+Math.random()*34;P.y=3+Math.random()*34;spawnTick()}P.x=P0.x;P.y=P0.y;
    const kinds=[...new Set(mobs.map(m=>m.kind))],bad=mobs.filter(m=>m.d.hostile||m.d.fac||m.d.boss||(m.d.atk>0&&!m.d.neutral&&!m.d.passive));
    return{reg:REG,kinds:kinds.join('·'),bad:bad.map(m=>m.kind),bosses:REGION().bosses.length,neutral:!!REGION().neutral}});
  ok(`개봉 몹: ${g.kinds} (먼저 덤비는 몹·세력 무인·두목 없음 ${g.bad.join(',')})`,g.reg==='gaebong'&&g.neutral&&!g.bad.length&&g.bosses===0&&g.kinds.includes('양민'));
  // 하남성: 흑풍채 산채와 혈교 동굴
  await p.evaluate(()=>{travel({to:'pv_henan',tx:24.5,ty:26.5})});await p.waitForTimeout(1800);
  const h=await p.evaluate(()=>{const R=REGION(),L=R.lairs;const out=L.map(l=>{P.x=l.x+(l.x<24?8:-8);P.y=l.y;mobs=[];G.bossT={};for(let i=0;i<14;i++)spawnTick();
      return{n:l.n,zone:regionAt(Math.floor(l.x),Math.floor(l.y)),kinds:[...new Set(mobs.filter(m=>Math.hypot(m.x-l.x,m.y-l.y)<7).map(m=>m.kind))].join('·'),walk:walkAt(l.x,l.y+1)}});
    // 소굴까지 길이 이어진다
    const at=R.gates.find(g=>g.to==='gaebong'),sx=Math.floor(at.x)-2,sy=Math.floor(at.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];
    while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&walk(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}
    return{out,reach:L.every(l=>seen.has(Math.floor(l.x)+','+Math.floor(l.y+1)))}});
  for(const l of h.out)ok(`하남성 ${l.n}(${l.zone}): ${l.kinds}`,l.zone.includes(l.n)&&l.walk&&(l.n.includes('흑풍')?/산적/.test(l.kinds)&&/흑풍채주/.test(l.kinds):/혈교무인/.test(l.kinds)&&/혈교장로/.test(l.kinds)));
  ok('개봉 이정표에서 두 소굴까지 걸어서 간다',h.reach);
  await p.evaluate(()=>{const l=REGION().lairs[0];P.x=l.x;P.y=l.y+3;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(600);await p.screenshot({path:shot('henan_camp')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

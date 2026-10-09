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
  // 하남성(맵 여러 장)의 흑풍채 산채와 혈교 동굴: 소굴이 든 맵으로 가서 본다
  const L=await p.evaluate(()=>REGIONS.pv_henan.lairs.map(l=>({n:l.n,x:l.x,y:l.y})));
  for(const l of L){
    await p.evaluate(l=>travel({to:'pv_henan',tx:l.x,ty:l.y+3}),l);await p.waitForTimeout(1500);
    const r=await p.evaluate(l=>{const w=REGION().win,lx=l.x-w.c*40,ly=l.y-w.r*40;P.x=lx+(lx<20?8:-8);P.y=ly;mobs=[];G.bossT={};for(let i=0;i<14;i++)spawnTick();
      return{zone:regionAt(Math.floor(lx),Math.floor(ly)),kinds:[...new Set(mobs.filter(m=>Math.hypot(m.x-lx,m.y-ly)<7).map(m=>m.kind))].join('·'),walk:walkAt(lx,ly+1)}},l);
    ok(`하남성 ${l.n}(${r.zone}): ${r.kinds}`,r.zone.includes(l.n)&&r.walk&&(l.n.includes('흑풍')?/산적/.test(r.kinds)&&/흑풍채주/.test(r.kinds):/혈교무인/.test(r.kinds)&&/혈교장로/.test(r.kinds)));
    if(l.n.includes('흑풍')){await p.evaluate(()=>{const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(600);await p.screenshot({path:shot('henan_camp')})}}
  // 개봉 이정표에서 두 소굴까지 성 전체 그림에서 길이 이어진다
  ok('개봉 이정표에서 두 소굴까지 걸어서 간다',await p.evaluate(()=>{const F=REGIONS.pv_henan,C=pvFull('henan'),S=C.S,at=F.gates.find(g=>g.to==='gaebong'),sx=Math.floor(at.x)-2,sy=Math.floor(at.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];
    const ok=(x,y)=>x>=0&&y>=0&&x<S&&y<S&&C.map[y][x].g!==2&&!C.objs[y][x];
    while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&ok(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}
    return F.lairs.every(l=>seen.has(Math.floor(l.x)+','+Math.floor(l.y+1)))}));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

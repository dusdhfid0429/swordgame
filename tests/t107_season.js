// v173 계절·날씨별 지형: 겨울엔 나무가 앙상하고 눈이 쌓이며(소나무·바위·관도), 가을 단풍·봄꽃, 비 온 뒤 물웅덩이. 전각 안은 그대로
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 1) 눈이 오면 쌓이고, 그치면 겨울엔 천천히 녹는다. 비는 땅을 적신다
  const r1=await p.evaluate(()=>{paused=true;closePanels();G.cal=Math.floor(G.cal)+.8;G.snow=0;G.wet=0;G.weather='눈';G.wT=999;
    for(let i=0;i<200;i++)runHooks('tick',.1);const s1=G.snow;G.weather='맑음';for(let i=0;i<200;i++)runHooks('tick',.1);const s2=G.snow;
    G.weather='비';for(let i=0;i<100;i++)runHooks('tick',.1);return{s1,s2,wet:G.wet}});
  ok(`눈 20초 → ${r1.s1.toFixed(2)}, 그친 뒤 20초 → ${r1.s2.toFixed(2)}, 비 10초 젖음 ${r1.wet.toFixed(2)}`,r1.s1>.4&&r1.s2>r1.s1-.05&&r1.s2<r1.s1&&r1.wet>.3);
  // 2) 계절마다 나무 그림이 바뀐다 (겨울 앙상, 가을 단풍, 여름 그대로), 눈 겹은 바위·소나무에 얹힌다
  const r2=await p.evaluate(()=>{enterRegion('gaebong',20,12);const at=q=>{G.cal=Math.floor(G.cal)+q;SM=seasonMix();let tr=null;
      for(let j=0;j<NH&&!tr;j++)for(let i=0;i<N;i++)if(objs[j][i]==='tree'){tr=[i,j];break}const s=seaSpr('tree',...tr),base=SPRITES.tree[(tr[0]*7+tr[1]*3)%3];
      return{bare:BARE.includes(s.spr),same:s.spr===base,snow:!!s.snow}};
    G.snow=1;const win=at(.87),sum=at(.37),fal=at(.6);G.snow=0;const fal0=at(.6);
    G.snow=1;G.cal=Math.floor(G.cal)+.87;SM=seasonMix();const rk=seaSpr('rock',3,3),pn=seaSpr('pine',3,3);
    const px=s=>{const d=s.getContext('2d').getImageData(0,0,s.width,s.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>100)n++;return n};
    return{win,sum,fal,fal0,rk:px(rk.snow),pn:px(pn.snow)}});
  ok(`겨울 나무 앙상 ${r2.win.bare}·눈 ${r2.win.snow}, 여름 그대로 ${r2.sum.same}, 가을 단풍 ${!r2.fal.same&&!r2.fal.bare}`,r2.win.bare&&r2.win.snow&&r2.sum.same&&!r2.fal.same&&!r2.fal.bare&&!r2.fal0.snow);
  ok(`눈 겹 픽셀: 바위 ${r2.rk}, 소나무 ${r2.pn}`,r2.rk>40&&r2.pn>150);
  // 3) 바닥 계절 겹: 겨울엔 눈 겹을 굽고, 관도(길 칸)도 눈에 덮인다. 그림자 같은 크기
  const r3=await p.evaluate(()=>{G.cal=Math.floor(G.cal)+.87;G.snow=1;G.weather='맑음';P.x=20;P.y=12;draw();const sl=ground._sl||{};
    const L=sl.snow,m=ground.sm,sp=(gx,gy)=>[Math.floor(((gx-gy)*TW/2-m.X0)*m.k*SEA.res),Math.floor(((gx+gy)*TH/2-m.Y0)*m.k*SEA.res)];let n=0,s=0;
    if(L){const g=L.getContext('2d');for(let j=3;j<NH-3;j++)for(let i=3;i<N-3;i++)if(map[j][i].g===1){const[x,y]=sp(i+.5,j+.5);s+=g.getImageData(x,y,1,1).data[3];n++}}
    return{has:!!L,keys:Object.keys(sl),a:Math.round(s/(n||1)),n}});
  ok(`겨울 바닥 눈 겹 ${r3.keys}, 길 칸 ${r3.n}개 평균 눈 투명도 ${r3.a}`,r3.has&&r3.a>100);
  await p.evaluate(()=>{tod=.45;draw()});await p.screenshot({path:shot('t107_winter_gaebong')});
  // 4) 큰 지역(조각 바닥)·화산(봉우리)·가을·봄·비
  // 조각 바닥(큰 지역 chunkGround) 조각 하나에도 눈 겹을 굽는다
  const big=await p.evaluate(()=>{const c=bakeHQ('forest',CHUNK_K,12,12,CHUNK,CHUNK),L=mkSeaLayer(c,'snow'),d=L.getContext('2d').getImageData(0,0,L.width,L.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>100)n++;return{chunk:c.sm.chunk,n,t:(()=>{const t0=performance.now();enterRegion('gaebong',20,12);ground._sl=null;draw();return Math.round(performance.now()-t0)})()}});
  ok(`조각 바닥 눈 겹 픽셀 ${big.n} (조각 ${big.chunk}), 개봉 눈 겹 굽기+그리기 ${big.t}ms`,big.chunk&&big.n>1000);
  await p.evaluate(()=>{enterRegion('hq_hwasan',20,22);tod=.45;draw()});await p.screenshot({path:shot('t107_winter_hwasan')});
  await p.evaluate(()=>{G.snow=0;G.cal=Math.floor(G.cal)+.7;enterRegion('gaebong',20,12);draw()});await p.screenshot({path:shot('t107_fall_gaebong')});
  await p.evaluate(()=>{G.cal=Math.floor(G.cal)+.12;draw()});await p.screenshot({path:shot('t107_spring_gaebong')});
  await p.evaluate(()=>{G.cal=Math.floor(G.cal)+.4;G.wet=1;G.weather='비';draw()});await p.screenshot({path:shot('t107_rain_gaebong')});
  // 5) 전각 안은 계절을 타지 않는다
  const r5=await p.evaluate(()=>{G.cal=Math.floor(G.cal)+.87;G.snow=1;regionJump(REGIONS.hq_hwasan.halls?REGIONS.hq_hwasan.halls[0].id:'gaebong',4,4);draw();return{m:seasonMix(),sl:!!ground._sl}});
  ok(`전각 안 계절 없음 (${JSON.stringify(r5)})`,r5.m===null&&!r5.sl);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

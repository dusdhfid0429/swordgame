// 기연 소문 길잡이 (v267, 동훈님 2026-11-15 "파악된 정보 기준으로 천하지도나 맵에서 화살표 등의 표시")
// 아는 만큼만: 성만 → 천하 지도 성 표시·그 성 쪽 출입구, 그 성 안에선 화살표 없음 / 증인 → 그 맵·그 사람 / 맵+방위 → 그 맵 방위 쪽 / 입구 → 입구
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>{localStorage.clear();window.__noPrompt=1});
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 고를 동굴: 지금 성(개봉=하남)과 다른 성에 있는 것
  const ci=await p.evaluate(()=>{for(let i=0;i<5;i++)update(.1);const c=G.gyc.list.find(c=>gyclProv(c.host)!=='henan')||G.gyc.list[0];
    for(const o of G.gyc.list){gyclEnsure(o);for(const k of Object.keys(o.k))o.k[k]=0;o.found=0;o.heard=-1;o.wit.forEach(w=>{w.ok=0;w.kn=0});o.rumor=0}return c.i});
  // 1. 아무것도 모르면 표시 없음
  const r1=await p.evaluate(()=>({cur:!!gytCur(),m:gytMarks().length,svg:pWorld().includes('gymk')}));
  ok(`아무것도 모르면 표시 없음 ${JSON.stringify(r1)}`,!r1.cur&&!r1.m&&!r1.svg);
  // 2. 성만 앎: 천하 지도에 그 성 표시+길, 지금 맵엔 그 성 쪽 출입구/가장자리, 그 성 안에 가면 화살표 없음, 증인 자리 안 샘
  const r2=await p.evaluate(ci=>{const c=G.gyc.list[ci];c.k.pv=1;c.heard=0;const pv=gyclProv(c.host),t=gytTarget(c),m=gytMarks(),html=pWorld();
    const into=Object.keys(REGIONS).find(id=>REGIONS[id].win&&REGIONS[id].prov===pv&&id!==c.host&&!c.wit.some(w=>w.r===id));enterRegion(into,arriveAt(into).x,arriveAt(into).y);P.reg=REG;
    return{t,m:m.map(x=>x.l),svg:/gymk on/.test(html)&&/gyroute|gypulse/.test(html),pvhtml:pvInfo(pv).includes('기연 소문'),inside:gytMarks().length,pv}},ci);
  ok(`성만 앎 → 성 ${r2.pv} 표시·길 ${r2.svg}, 맵 화살표 ${r2.m.join()}, 그 성 안에선 ${r2.inside}개`,r2.t&&r2.t.pv===r2.pv&&!r2.t.reg&&r2.svg&&r2.pvhtml&&r2.m.length===1&&r2.inside===0);
  // 3. 증인을 들음 → 그 맵까지 길, 그 맵에선 그 사람 머리 위
  const r3=await p.evaluate(ci=>{const c=G.gyc.list[ci],w=c.wit[0];w.kn=1;enterRegion('gaebong',20,20);P.reg=REG;const far=gytMarks().map(x=>x.l);
    enterRegion(w.r,arriveAt(w.r).x,arriveAt(w.r).y);P.reg=REG;const t=gytTarget(c),m=gytMarks();return{far,reg:t.reg===w.r,m:m.map(x=>x.l+'@'+x.x.toFixed(1)),at:m[0]&&Math.hypot(m[0].x-w.x,m[0].y-w.y)<.01,wn:w.n}},ci);
  ok(`증인 → 멀리서 ${r3.far.join()} · 그 맵에서 ${r3.m.join()} (${r3.wn})`,r3.far.length===1&&r3.reg&&r3.at);
  // 4. 맵·방위까지 앎(증인 다 들음) → 입구 맵 방위 쪽, 정확한 입구 자리는 아님. 입구를 찾으면 입구
  const r4=await p.evaluate(ci=>{const c=G.gyc.list[ci];c.wit.forEach(w=>{w.ok=1;w.kn=1});c.k.map=c.k.sign=c.k.dir=1;enterRegion(c.host,arriveAt(c.host).x,arriveAt(c.host).y);P.reg=REG;
    const t=gytTarget(c);P.x=2;P.y=2;if(Math.hypot(t.pt.x-2,t.pt.y-2)<6){P.x=N-3;P.y=NH-3}const m=gytMarks()[0]||null,dCave=m?Math.hypot(m.x-(c.x+.5),m.y-(c.y+.5)):null;P.x=m?m.x:P.x;P.y=m?m.y:P.y;const near=gytMarks().length;
    gyclFound(c,1);const f=gytMarks()[0]||null;return{l:m&&m.l,dir:gycDir(c),dCave,near,f:f&&f.l,fat:f&&Math.hypot(f.x-(c.x+.5),f.y-(c.y+.5))<.01}},ci);
  ok(`맵+방위 → "${r4.l}" (입구와 ${r4.dCave&&r4.dCave.toFixed(1)}칸, 가까이 가면 ${r4.near}개) · 찾으면 "${r4.f}"`,r4.l&&r4.l.includes(r4.dir==='한가운데'?'한가운데':r4.dir)&&r4.near===0&&r4.fat);
  // 5. 길잡이 단추: 고르기·끄기, 임무창에 단추
  const r5=await p.evaluate(ci=>{openPanel('quest');const h=$('wbody').innerHTML;act('gytrk:-1');const off=gytMarks().length;act('gytrk:'+ci);const on=gytCur()&&gytCur().i;closePanels();return{btn:/gytrk/.test(h),off,on}},ci);
  ok(`임무창 길잡이 단추 ${r5.btn} · 끄면 ${r5.off} · 고르면 ${r5.on}`,r5.btn&&r5.off===0&&r5.on===ci);
  // 6. 그림: 맵 화면 + 천하 지도 (휴대폰 세로)
  await p.evaluate(ci=>{const c=G.gyc.list[ci];c.found=0;c.k.trace=0;c.k.map=0;c.k.dir=0;c.wit.forEach(w=>{w.ok=0;w.kn=0});c.wit[0].kn=1;enterRegion('gaebong',20,20);P.reg=REG;mobs=[]},ci);
  await p.waitForTimeout(500);await p.screenshot({path:shot('t181_gytrack_map')});
  await p.evaluate(()=>openPanel('world'));await p.waitForTimeout(300);await p.screenshot({path:shot('t181_gytrack_world')});
  ok(`오류 없음 ${errs.join(' | ')}`,!errs.length);
  await b.close()})();

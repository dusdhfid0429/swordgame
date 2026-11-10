// 무너져 가는 문파 (v246, user 2026-11-10 "맵에 있는동안 맵이 점점 폐허가 되게… 전각이 점점 기울거나 불이 붙거나… 문파가 점점 멸문으로 가는 과정을 맵에서도 인지할 수 있게"):
// 인원 비율이 낮을수록 본산 전각이 그을리고·불붙고·기울고·지붕이 꺼진다. 맵에 있는 동안 인원이 줄면 그 자리에서 바뀌고, 멸문하면 몇 초 뒤 그 자리에서 폐허가 된다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const shot=async(name,frac)=>{await p.evaluate(f=>{paused=false;popInit();G.pop.hwasan=Math.max(1,popBase(SECTS.hwasan)*f);tod=.3;G.weather='맑음';regionJump('hq_hwasan',10,10);
    const R=REGIONS.hq_hwasan,h=R.halls[0];P.x=h.x+1.5;P.y=h.y+3.2;cam.x=iso(P.x,P.y).x;cam.y=iso(P.x,P.y).y;mobs=[];P.inv=99;P.hp=P.maxHp},frac);
    await p.waitForTimeout(1200);await p.evaluate(()=>{mobs=[]});await p.screenshot({path:require('path').resolve(__dirname,'shots/t163_'+name+'.png')})};
  await shot('1_온전',.9);await shot('2_그을음',.42);await shot('3_불길',.25);await shot('4_기울어짐',.12);await shot('5_무너짐',.02);
  const r=await p.evaluate(()=>{paused=true;popInit();const o={},base=popBase(SECTS.hwasan),st=()=>builds.map(b=>b._dk||0);
    const at=f=>{G.pop.hwasan=Math.max(1,base*f);regionJump('hq_hwasan',10,10);return st()};
    o.full=at(.9);o.half=at(.4);o.low=at(.15);o.vlow=at(.01);
    const sum=a=>a.reduce((x,y)=>x+y,0);o.mono=sum(o.full)===0&&sum(o.half)<sum(o.low)&&sum(o.low)<sum(o.vlow);
    // 맵에 있는 동안 인원이 준다
    at(.45);const before=sum(st());G.pop.hwasan=base*.08;for(let i=0;i<20;i++)runHooks('tick',.1);o.liveUp=sum(st())>before;o.anyFire=builds.some(b=>b._fire>.3);o.anyTilt=builds.some(b=>Math.abs(b._tilt)>.03);o.dead0=!!REGION().dead;
    o.tiltNow=builds.map(b=>+(b._tilt||0).toFixed(3)).filter(x=>x);
    // 멸문: 장문인 없음 + 마지막 무인을 벤다
    G.mdead.hwasan={y:0,life:P.lifeNo};G.pop.hwasan=.5;mobs=[];const e=mkFac('정',0,P.x+3,P.y,'hwasan');e.sect='hwasan';runHooks('kill',e);o.pop=G.pop.hwasan;o.fall=!!DEC_FALL;
    for(let i=0;i<30;i++)runHooks('tick',.1);o.midAll=builds.every(b=>(b._dk||0)>=3);o.midDead=!!REGION().dead;
    for(let i=0;i<60;i++)runHooks('tick',.1);o.ruined=!!REGION().dead&&REGION().npcs.length===0&&!!REGION().gore;
    // 살아나면 다시 온전
    delete G.mdead.hwasan;G.pop.hwasan=base;o.back=sum(at(1))===0&&!REGIONS.hq_hwasan.dead;return o});
  ok(`인원별 단계 90% ${r.full} / 40% ${r.half} / 15% ${r.low} / 1% ${r.vlow}`,r.mono);
  ok(`맵에 있는 동안 인원이 줄면 그 자리에서 무너짐 (불 ${r.anyFire}, 기울기 ${r.tiltNow.slice(0,4)})`,r.liveUp&&r.anyFire&&r.anyTilt&&!r.dead0);
  ok(`맵에서 멸문 → 무너지는 연출(${r.fall}, 중간 전부 3단계↑ ${r.midAll}, 아직 폐허 아님 ${!r.midDead}) → 폐허 ${r.ruined}`,r.pop===0&&r.fall&&r.midAll&&!r.midDead&&r.ruined);
  ok(`문파가 살아나면 온전한 본산 ${r.back}`,r.back);
  ok('오류 없음 '+errs.join(' | '),!errs.length);
  await b.close();
})();

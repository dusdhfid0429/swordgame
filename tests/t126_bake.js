// v195 플레이 점검 P2: 지역 이동 때 바닥 굽기를 일꾼에 맡겨 멈추지 않는다 (결과 그림은 동기로 구운 것과 같다), 동원 명단 undefined, 창을 열면 정세 배너를 걷는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  // 1. 본산·개봉·높낮이 맵: 놀이 중엔 바로 돌아오고(미리보기), 일꾼이 다 구우면 동기로 구운 것과 픽셀이 같다
  const r=await p.evaluate(async()=>{const out=[];paused=true;   // 기다리는 동안 출입구를 밟아 지역이 바뀌지 않게
    for(const id of ['hq_hwasan','gaebong','hq_mudang']){for(const k in GROUND)delete GROUND[k];const t=performance.now();loadRegion(id);const ms=performance.now()-t,src=ground.src||ground,baking=!!src.baking;
      const t1=performance.now();while(src.baking&&performance.now()-t1<8000)await new Promise(r=>setTimeout(r,20));
      const a=ground.getContext('2d').getImageData(0,0,ground.width,ground.height).data;
      BAKE_SYNC=1;delete GROUND[id];const t2=performance.now();loadRegion(id);const sync=performance.now()-t2;BAKE_SYNC=0;
      const c=ground.getContext('2d').getImageData(0,0,ground.width,ground.height).data;let diff=0;for(let i=0;i<a.length;i++)if(a[i]!==c[i])diff++;
      out.push({id,ms:Math.round(ms),sync:Math.round(sync),baking,diff,elev:!!ground.elev})}
    paused=false;return out});
  for(const x of r)ok(`${x.id}${x.elev?'(높낮이)':''}: 불러오기 ${x.ms}ms (동기 ${x.sync}ms), 일꾼에 맡김 ${x.baking}, 다 구운 그림 차이 ${x.diff}`,x.baking&&x.diff===0&&x.ms<x.sync);
  // 1b. 다 굽기 전에 다른 지역으로 떠나도, 떠난 지역 바닥은 그 지역 칸으로 마저 구워진다
  const lv=await p.evaluate(async()=>{paused=true;for(const k in GROUND)delete GROUND[k];loadRegion('hq_hwasan');const c=ground;loadRegion('gaebong');const g=ground;
    const t=performance.now();while((c.baking||g.baking)&&performance.now()-t<8000)await new Promise(r=>setTimeout(r,20));
    const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;BAKE_SYNC=1;delete GROUND.hq_hwasan;loadRegion('hq_hwasan');const b=ground.getContext('2d').getImageData(0,0,ground.width,ground.height).data;BAKE_SYNC=0;
    let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;loadRegion('gaebong');paused=false;return d});
  ok(`굽는 중에 떠나도 그 지역 바닥이 맞게 구워짐 (차이 ${lv})`,lv===0);
  // 2. 일꾼을 못 쓰면 동기로 굽는다 (예전과 같음)
  const f=await p.evaluate(()=>{BAKE_W=null;for(const k in GROUND)delete GROUND[k];loadRegion('hq_hwasan');const r=!ground.baking;BAKE_W=undefined;return r});
  ok('일꾼이 없으면 동기로 굽는다',f);
  // 3. 동원 명단: 직위가 다섯인 문파에 undefined가 없다
  const m=await p.evaluate(()=>{const s=Object.values(SECTS).find(s=>s.al==='jeong');P.sect=s.id;P.srank=4;return mobilHtml(s)});
  ok(`동원 명단에 undefined 없음`,m&&!m.includes('undefined'));
  // 4. 정세 배너가 떠 있을 때 창을 열면 걷힌다
  const sb=await p.evaluate(()=>{loadRegion('gaebong');storyBanner('천하대전','정사 대립','강호 정세');const a=$('sban').classList.contains('on');openPanel('char');const b=$('sban').classList.contains('on');closePanels();return{a,b}});
  ok(`창을 열면 정세 배너가 걷힘 (${sb.a}→${sb.b})`,sb.a&&!sb.b);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

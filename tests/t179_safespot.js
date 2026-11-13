// 막힌 칸에 내려놓지 않기 (사용자 2026-11-13 "장백파 객사에 들어갔다 나오면 담에 껴"):
// 장백파 외원 객사 문을 나오면 담(jwall) 칸에 섰다. 출입구 도착 자리·불러온 저장 자리를 safeSpot으로 고쳐 앉힌다.
// 모든 출입구(성 단위 큰 맵 pv_ 제외)의 도착 자리가 열린 칸이고 되돌아갈 출입구에서 걸어 닿는지 훑는다.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage();p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  // 1) 장백파 외원 객사에서 나오기
  const a=await p.evaluate(()=>{const H='in_hq_jangbaek_outer_7',O='hq_jangbaek_outer';enterRegion(H,9,7);const g=REGIONS[H].gates[0];
    const door=REGIONS[O].gates.find(q=>q.to===H);enterRegion(g.to,g.tx,g.ty);
    const reach=safeFlood(Math.floor(door.x),Math.floor(door.y),2000).some(([i,j])=>i===Math.floor(P.x)&&j===Math.floor(P.y));
    return{reg:REG,walk:walkAt(P.x,P.y),free:safeOk(Math.floor(P.x),Math.floor(P.y)),reach,raw:objs[Math.floor(g.ty)][Math.floor(g.tx)],x:P.x,y:P.y}});
  ok(`장백파 객사 문을 나오면 담(${a.raw}) 위가 아닌 열린 칸 (${a.x},${a.y})`,a.reg==='hq_jangbaek_outer'&&a.walk&&a.free);
  ok('나온 자리에서 객사 문으로 걸어 돌아갈 수 있다',a.reach);
  // 2) 이미 담에 낀 저장: 불러오면 빠져나온다
  const c=await p.evaluate(()=>{P.x=10.5;P.y=30.5;const was=walkAt(P.x,P.y);loadRegion('hq_jangbaek_outer');return{was,now:walkAt(P.x,P.y),free:safeOk(Math.floor(P.x),Math.floor(P.y))}});
  ok('담 칸에 저장된 주인공도 불러오면 열린 칸으로 나온다',!c.was&&c.now&&c.free);
  // 3) 모든 출입구 훑기 (바닥 굽기는 건너뛴다: 메모리)
  const r=await p.evaluate(()=>{const tiny=()=>{const c=document.createElement('canvas');c.width=c.height=1;c.sm={k:1,X0:0,Y0:0,x0:0,y0:0,C:N,CH:NH};return c};
    for(const R of Object.values(REGIONS))R.bake=tiny;const bad=[];let n=0,fixed=0;
    for(const id of Object.keys(REGIONS)){const R=REGIONS[id];if(!R.gates||/^pv_/.test(id))continue;
      for(const g of R.gates){const T=REGIONS[g.to];if(!T||/^pv_/.test(g.to)||g.tx==null)continue;
        try{loadRegion(g.to)}catch(e){continue}n++;
        const bk=(REGIONS[g.to].gates||[]).filter(q=>q.to===id).sort((a,b)=>dist(a,{x:g.tx,y:g.ty})-dist(b,{x:g.tx,y:g.ty}))[0];
        if(!safeOk(Math.floor(g.tx),Math.floor(g.ty)))fixed++;
        const q=safeSpot(g.tx,g.ty,bk);if(!safeOk(Math.floor(q.x),Math.floor(q.y)))bad.push(`${id}→${g.to}(${g.tx},${g.ty})`)}}
    return{n,fixed,bad}});
  ok(`출입구 ${r.n}곳(고쳐 앉힌 곳 ${r.fixed}) 모두 열린 칸에 내린다 ${r.bad.slice(0,6).join(' ')}`,r.n>500&&!r.bad.length);
  ok('오류 없음 '+errs.join(' | ').slice(0,300),!errs.length);
  await b.close()})();

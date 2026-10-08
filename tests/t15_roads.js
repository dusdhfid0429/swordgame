// 관도: 개봉 → 관도 → 본산을 걸어서 오간다 (역참 말 없이)
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
  // 지역 연결이 서로 맞는지: 출입구의 도착 지역에 되돌아오는 출입구가 있다
  const g=await p.evaluate(()=>{const bad=[];let n=0;for(const[id,R]of Object.entries(REGIONS))for(const gt of R.gates){n++;const T=REGIONS[gt.to];if(!T||!T.gates.some(b=>b.to===id))bad.push(id+'→'+gt.to)}
    const hq=Object.values(SECTS).filter(s=>s.id!=='shaolin');const once=hq.every(s=>Object.values(REGIONS).filter(R=>R.hub&&R.gates.some(q=>q.to==='hq_'+s.id)).length===1);
    return{bad,n,once,gae:REGIONS.gaebong.gates.map(q=>q.label).join('·')}});
  ok(`출입구 ${g.n}개가 모두 양방향으로 이어진다 ${g.bad.join(',')}`,!g.bad.length);ok('본산 34곳이 모두 관도 하나에 걸려 있다',g.once);ok(`개봉 출입구: ${g.gae}`,g.gae.split('·').length===5);
  // 길 막힘 검사: 지역마다 첫 출입구 도착 자리에서 모든 출입구까지
  const bfs=await p.evaluate(()=>{const bad=[],cur=REG;
    const reach=(id)=>{const R=REGIONS[id];R.gen();for(const g of R.gates)for(let j=Math.floor(g.y)-2;j<=Math.floor(g.y)+2;j++)for(let i=Math.floor(g.x)-2;i<=Math.floor(g.x)+2;i++)if(j>=0&&i>=0&&j<N&&i<N){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}
      const st=id==='gaebong'?POST_AT:(()=>{const g=R.gates[0];for(const o of Object.values(REGIONS))for(const q of o.gates)if(q.to===id&&Math.hypot(q.tx-g.x,q.ty-g.y)<3)return{x:q.tx,y:q.ty};return null})();
      const sx=Math.floor(st.x),sy=Math.floor(st.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];if(!walk(sx,sy))bad.push(id+' 도착');
      while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&walk(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}
      for(const g of R.gates){const gx=Math.floor(g.x),gy=Math.floor(g.y);if(![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((gx+dx)+','+(gy+dy))))bad.push(id+' → '+g.label)}};
    for(const id of Object.keys(REGIONS))reach(id);loadRegion(cur);return bad});
  ok(`모든 지역에서 모든 출입구까지 걸어서 간다 ${bfs.join(', ')}`,!bfs.length);
  // 실제로 걸어서: 개봉 서쪽 → 서쪽 관도 → 화산 → 서쪽 관도 → 개봉
  const walkTo=async(to)=>{await p.evaluate(to=>{const g=REGION().gates.find(q=>q.to===to);P.gateLock=0;P.x=g.x+(g.x<5?1.6:g.x>35?-1.6:0);P.y=g.y+(g.y<5?1.6:g.y>35?-1.6:0);P.path=[{x:g.x,y:g.y}]},to);
    await p.waitForFunction(to=>REG===to,to,{timeout:8000}).catch(()=>{});await p.waitForTimeout(500);return p.evaluate(()=>({reg:REG,x:P.x.toFixed(1),y:P.y.toFixed(1),zone:$('zone').textContent}))};
  await p.evaluate(()=>{P.hp=P.maxHp*=40});
  let s=await walkTo('road_w');ok(`개봉 서쪽 출입구 → ${s.zone} (${s.x},${s.y})`,s.reg==='road_w');
  await p.evaluate(()=>{for(let i=0;i<4;i++)spawnTick();P.x=20.5;P.y=20.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(700);await p.screenshot({path:shot('road_west')});
  s=await walkTo('hq_hwasan');ok(`서쪽 관도 → ${s.zone} (${s.x},${s.y})`,s.reg==='hq_hwasan'&&+s.y>35);
  s=await walkTo('road_w');ok(`화산 아래 출입구 → ${s.zone}`,s.reg==='road_w'&&s.zone.includes('화산'));
  s=await walkTo('gaebong');ok(`서쪽 관도 → 개봉 (${s.x},${s.y})`,s.reg==='gaebong'&&+s.x<5);
  for(const[r,h]of[['road_n','hq_cheonma'],['road_e','hq_mandok'],['road_s','hq_gaebang']]){s=await walkTo(r);const s2=await walkTo(h);const s3=await walkTo(r);const s4=await walkTo('gaebong');
    ok(`개봉 → ${r} → ${h} → 돌아옴`,s.reg===r&&s2.reg===h&&s3.reg===r&&s4.reg==='gaebong')}
  ok('역참 말도 그대로 쓴다',await p.evaluate(()=>!!npcAt('post')));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// 천하 지도: 무림전도를 참고한 성 22곳, 성마다 다른 크기·지형, 지도대로 이어진 길, 성 안의 본산 입구
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
  let PROV_N;const g=await p.evaluate(()=>{const bad=[];let n=0;for(const[id,R]of Object.entries(REGIONS))for(const gt of R.gates){n++;const T=REGIONS[gt.to];const me=R.win?'pv_'+R.win.k:id;if(!T||!T.gates.some(b=>b.to===id||b.to===me))bad.push(id+'→'+gt.to)}
    const pv=Object.keys(PROV),sizes=pv.map(k=>PROV[k].size),placed=Object.values(SECTS).filter(s=>s.id!=='shaolin').every(s=>{const first=(REGIONS[hqId(s)].chain||[hqId(s)])[0];return Object.values(REGIONS).filter(R=>R.prov&&!R.hq&&!R.win&&R.gates.some(q=>q.to===first)).length===1});
    return{bad,n,pv:pv.length,mn:Math.min(...sizes),mx:Math.max(...sizes),themes:new Set(pv.map(k=>PROV[k].th)).size,placed,gae:REGIONS.gaebong.gates.map(q=>q.label).join('·')}});
  ok(`성 ${g.pv}곳, 크기 ${g.mn}~${g.mx}칸, 지형 ${g.themes}가지`,g.pv===22&&g.mn<g.mx&&g.themes>=12);
  const sz=await p.evaluate(()=>['xinjiang','tibet','qinghai','sichuan','henan','zhejiang','hainan'].map(k=>PROV[k].size));
  ok(`실제 면적 비례 크기: 신강 ${sz[0]} > 서장 ${sz[1]} > 청해 ${sz[2]} > 사천 ${sz[3]} > 하남 ${sz[4]} > 절강 ${sz[5]} > 해남 ${sz[6]}`,sz.every((v,i)=>!i||v<=sz[i-1])&&sz[0]>sz[2]&&sz[2]>sz[4]&&sz[4]>sz[6]);
  ok(`출입구 ${g.n}개가 모두 양방향 ${g.bad.join(',')}`,!g.bad.length);ok('본산 49곳이 모두 성 하나 안에 있다',g.placed);ok(`개봉 출입구: ${g.gae}`,g.gae==='숭산 산중·하남성');
  // 모든 지역: 도착 자리에서 모든 출입구까지 걸어서 간다 (지역 크기도 맞게)
  const bfs=await p.evaluate(()=>{const bad=[],cur=REG,sz={};
    for(const[id,R]of Object.entries(REGIONS)){R.gen();sz[id]=N;if(N!==(R.size||40)||NH!==(R.h||R.size||40))bad.push(id+' 크기');
      for(const g of R.gates)for(let j=Math.floor(g.y)-2;j<=Math.floor(g.y)+2;j++)for(let i=Math.floor(g.x)-2;i<=Math.floor(g.x)+2;i++)if(j>=0&&i>=0&&j<NH&&i<N){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}
      let st=null;for(const o of Object.values(REGIONS))for(const q of o.gates)if(q.to===id&&!st)st={x:q.tx,y:q.ty};if(!st&&R.win)continue;
      const sx=Math.floor(st.x),sy=Math.floor(st.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];if(!walk(sx,sy))bad.push(id+' 도착');
      while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&walk(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}
      for(const g of R.gates){const gx=Math.floor(g.x),gy=Math.floor(g.y);if(![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((gx+dx)+','+(gy+dy))))bad.push(id+' → '+g.label)}
      for(const g of R.gates){const t=Math.floor(g.ty),s=Math.floor(g.tx),T=REGIONS[g.to];}
    }
    loadRegion(cur);return{bad,n:Object.keys(sz).length}});
  ok(`지역 ${bfs.n}곳 모두 도착 자리에서 모든 출입구로 길이 이어진다 ${bfs.bad.join(', ')}`,!bfs.bad.length);
  // 실제로 걸어서: 개봉 → 하남성 → 섬서성 → 화산 → 화산파 산문 → 외원 → 화산 본산 → 되돌아 개봉
  const walkTo=async(to)=>{await p.evaluate(to=>{let g=REGION().gates.find(q=>q.to===to);
    // 성이 여러 맵이면 그 출입구가 든 맵으로 먼저 간다
    if(!g&&REGION().win){const k=REGION().win.k,id=Object.keys(REGIONS).find(i=>REGIONS[i].win&&REGIONS[i].win.k===k&&REGIONS[i].gates.some(q=>q.to===to));P.reg=id;loadRegion(id);g=REGION().gates.find(q=>q.to===to)}P.gateLock=0;const dx=g.x<5?1.6:g.x>N-5?-1.6:0,dy=g.y<5?1.6:g.y>N-5?-1.6:dx?0:1.6;P.x=g.x+dx;P.y=g.y+dy;P.path=[{x:g.x,y:g.y}]},to);
    await p.waitForFunction(to=>(REG===to||REGIONS[REG].win&&'pv_'+REGIONS[REG].win.k===to)&&!P.traveling,to,{timeout:9000}).catch(()=>{});await p.waitForTimeout(500);return p.evaluate(()=>({reg:REGIONS[REG].win?'pv_'+REGIONS[REG].win.k:REG,n:N,x:P.x.toFixed(1),y:P.y.toFixed(1),zone:$('zone').textContent,walk:walkAt(P.x,P.y)}))};
  await p.evaluate(()=>{P.maxHp*=60;P.hp=P.maxHp});
  // 화산파 산문은 화산 맵(산 중턱 포털)을 거쳐 간다 (g_lmmap.js)
  const hs=await p.evaluate(()=>REGIONS.hq_hwasan_gate.lmVia);
  const route=['pv_henan','pv_shaanxi',hs,'hq_hwasan_gate','hq_hwasan_outer','hq_hwasan','hq_hwasan_outer','hq_hwasan_gate',hs,'pv_shaanxi','pv_henan','gaebong'];const got=[];
  for(const r of route){const s=await walkTo(r);got.push(`${s.zone}(${s.n})`);if(s.reg!==r||!s.walk){ok(`걸어서 ${r}`,false);break}}
  ok(`걸어서 ${got.join(' → ')}`,got.length===route.length);
  // 큰 지역 화면과 바닥 그림 크기
  await p.evaluate(()=>{P.silver=500});await walkTo('pv_henan');await walkTo('pv_hubei');const r2=await walkTo('pv_sichuan');
  await p.evaluate(()=>{P.x=N/2+.5;P.y=N/2+2.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;for(let i=0;i<4;i++)spawnTick()});await p.waitForTimeout(800);
  const gr=await p.evaluate(()=>({ch:!!ground.chunked,kept:ground.chunked?ground.cache.size:0,keep:CHUNK_KEEP,mobs:mobs.length,loc:mobs.filter(m=>m.sect&&PROV.sichuan.sects.includes(m.sect)).length}));
  ok(`사천성은 40칸 맵 ${PROV_N=await p.evaluate(()=>PROV.sichuan.cols**2)}장, 지금 맵 ${r2.n}칸, 몹 ${gr.mobs} (사천 문파 무인 ${gr.loc})`,r2.reg==='pv_sichuan'&&r2.n===40&&gr.mobs>3);
  await p.screenshot({path:shot('world_sichuan')});
  // 천하 지도 창
  await p.tap('#tmenu');await p.tap('[data-act="open:world"]');await p.waitForTimeout(200);
  ok('천하 지도 창: 성 22곳, 지금 위치 강조',await p.evaluate(()=>panel==='world'&&document.querySelectorAll('.world g.pv:not(.city)').length===22&&document.querySelector('.world .me text').textContent==='사천성'));
  await p.screenshot({path:shot('world_map')});await p.evaluate(()=>closePanels());
  for(const k of['gansu','yunnan','guizhou','hunan','liaoning','xinjiang','tibet','mongol','guangdong','jiangsu','zhejiang','hainan','tianzhu']){await p.evaluate(k=>{const R=REGIONS['pv_'+k];travel({to:'pv_'+k,tx:R.size/2+.5,ty:R.size/2+2.5})},k);await p.waitForTimeout(1600);
    await p.evaluate(()=>{for(let i=0;i<3;i++)spawnTick()});await p.waitForTimeout(500);await p.screenshot({path:shot('world_'+k)})}
  ok('역참 말도 그대로',await p.evaluate(()=>!!npcAt('post')));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

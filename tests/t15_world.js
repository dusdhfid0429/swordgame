// 천하 지도: 무림전도를 참고한 성 18곳, 성마다 다른 크기·지형, 지도대로 이어진 길, 성 안의 본산 입구
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
  const g=await p.evaluate(()=>{const bad=[];let n=0;for(const[id,R]of Object.entries(REGIONS))for(const gt of R.gates){n++;const T=REGIONS[gt.to];if(!T||!T.gates.some(b=>b.to===id))bad.push(id+'→'+gt.to)}
    const pv=Object.keys(PROV),sizes=pv.map(k=>PROV[k].size),placed=Object.values(SECTS).filter(s=>s.id!=='shaolin').every(s=>Object.values(REGIONS).filter(R=>R.size&&R.gates.some(q=>q.to==='hq_'+s.id)).length===1);
    return{bad,n,pv:pv.length,mn:Math.min(...sizes),mx:Math.max(...sizes),themes:new Set(pv.map(k=>PROV[k].th)).size,placed,gae:REGIONS.gaebong.gates.map(q=>q.label).join('·')}});
  ok(`성 ${g.pv}곳, 크기 ${g.mn}~${g.mx}칸, 지형 ${g.themes}가지`,g.pv===18&&g.mn<g.mx&&g.themes>=12);
  ok(`출입구 ${g.n}개가 모두 양방향 ${g.bad.join(',')}`,!g.bad.length);ok('본산 34곳이 모두 성 하나 안에 있다',g.placed);ok(`개봉 출입구: ${g.gae}`,g.gae==='숭산 산중·하남성');
  // 모든 지역: 도착 자리에서 모든 출입구까지 걸어서 간다 (지역 크기도 맞게)
  const bfs=await p.evaluate(()=>{const bad=[],cur=REG,sz={};
    for(const[id,R]of Object.entries(REGIONS)){R.gen();sz[id]=N;if(N!==(R.size||40))bad.push(id+' 크기');
      for(const g of R.gates)for(let j=Math.floor(g.y)-2;j<=Math.floor(g.y)+2;j++)for(let i=Math.floor(g.x)-2;i<=Math.floor(g.x)+2;i++)if(j>=0&&i>=0&&j<N&&i<N){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}
      let st=null;for(const o of Object.values(REGIONS))for(const q of o.gates)if(q.to===id&&!st)st={x:q.tx,y:q.ty};
      const sx=Math.floor(st.x),sy=Math.floor(st.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];if(!walk(sx,sy))bad.push(id+' 도착');
      while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&walk(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}
      for(const g of R.gates){const gx=Math.floor(g.x),gy=Math.floor(g.y);if(![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((gx+dx)+','+(gy+dy))))bad.push(id+' → '+g.label)}
      for(const g of R.gates){const t=Math.floor(g.ty),s=Math.floor(g.tx),T=REGIONS[g.to];}
    }
    loadRegion(cur);return{bad,n:Object.keys(sz).length}});
  ok(`지역 ${bfs.n}곳 모두 도착 자리에서 모든 출입구로 길이 이어진다 ${bfs.bad.join(', ')}`,!bfs.bad.length);
  // 실제로 걸어서: 개봉 → 하남성 → 섬서성 → 화산 → 섬서성 → 하남성 → 개봉
  const walkTo=async(to)=>{await p.evaluate(to=>{const g=REGION().gates.find(q=>q.to===to);P.gateLock=0;const dx=g.x<5?1.6:g.x>N-5?-1.6:0,dy=g.y<5?1.6:g.y>N-5?-1.6:dx?0:1.6;P.x=g.x+dx;P.y=g.y+dy;P.path=[{x:g.x,y:g.y}]},to);
    await p.waitForFunction(to=>REG===to&&!P.traveling,to,{timeout:9000}).catch(()=>{});await p.waitForTimeout(500);return p.evaluate(()=>({reg:REG,n:N,x:P.x.toFixed(1),y:P.y.toFixed(1),zone:$('zone').textContent,walk:walkAt(P.x,P.y)}))};
  await p.evaluate(()=>{P.maxHp*=60;P.hp=P.maxHp});
  const route=['pv_henan','pv_shaanxi','hq_hwasan','pv_shaanxi','pv_henan','gaebong'];const got=[];
  for(const r of route){const s=await walkTo(r);got.push(`${s.zone}(${s.n})`);if(s.reg!==r||!s.walk){ok(`걸어서 ${r}`,false);break}}
  ok(`걸어서 ${got.join(' → ')}`,got.length===route.length);
  // 큰 지역 화면과 바닥 그림 크기
  await p.evaluate(()=>{P.silver=500});await walkTo('pv_henan');await walkTo('pv_hubei');const r2=await walkTo('pv_sichuan');
  await p.evaluate(()=>{P.x=N/2+.5;P.y=N/2+2.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;for(let i=0;i<4;i++)spawnTick()});await p.waitForTimeout(800);
  const gr=await p.evaluate(()=>({w:ground.width,h:ground.height,mobs:mobs.length,loc:mobs.filter(m=>m.sect&&PROV.sichuan.sects.includes(m.sect)).length}));
  ok(`사천성 ${r2.n}칸: 바닥 그림 ${gr.w}×${gr.h} (휴대폰 메모리용 축소), 몹 ${gr.mobs} (사천 문파 무인 ${gr.loc})`,r2.reg==='pv_sichuan'&&r2.n===64&&gr.w<=2560&&gr.mobs>5);
  await p.screenshot({path:shot('world_sichuan')});
  // 천하 지도 창
  await p.tap('#tmenu');await p.tap('[data-act="open:world"]');await p.waitForTimeout(200);
  ok('천하 지도 창: 성 18곳, 지금 위치 강조',await p.evaluate(()=>panel==='world'&&document.querySelectorAll('.world circle').length===18&&document.querySelector('.world .me text').textContent==='사천성'));
  await p.screenshot({path:shot('world_map')});await p.evaluate(()=>closePanels());
  for(const k of['gansu','yunnan','guizhou','hunan','liaoning','xinjiang','tibet','mongol','guangdong']){await p.evaluate(k=>{const R=REGIONS['pv_'+k];travel({to:'pv_'+k,tx:R.size/2+.5,ty:R.size/2+2.5})},k);await p.waitForTimeout(1600);
    await p.evaluate(()=>{for(let i=0;i<3;i++)spawnTick()});await p.waitForTimeout(500);await p.screenshot({path:shot('world_'+k)})}
  ok('역참 말도 그대로',await p.evaluate(()=>!!npcAt('post')));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

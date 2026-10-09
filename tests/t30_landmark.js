// 무림전도 땅이름: 주요도시·명소·산·지형이 제 성 맵 제자리에 있고, 문파 입구는 지도 위 문파 자리에
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const cnt=await p.evaluate(()=>{const by={c:0,s:0,m:0,t:0};let n=0,want=0;for(const k of Object.keys(PROV)){want+=(LM_DATA[k]||[]).length;for(const m of REGIONS[pvId(k)].marks){by[m.t]++;n++}}
    const win=Object.values(REGIONS).filter(R=>R.win).reduce((a,R)=>a+R.marks.length,0);return{n,want,by,win}});
  ok(`땅이름 ${cnt.n}/${cnt.want}곳 (도시 ${cnt.by.c} · 명소 ${cnt.by.s} · 산 ${cnt.by.m} · 지형 ${cnt.by.t}), 맵에 나눠진 수 ${cnt.win}`,cnt.n===cnt.want&&cnt.n>140&&cnt.win===cnt.n);
  // 지도 순서 그대로: 북경은 석가장보다 북쪽, 낙양은 정주보다 서쪽, 돈황은 란주보다 서쪽
  const ord=await p.evaluate(()=>{const at=(k,n)=>REGIONS[pvId(k)].marks.find(m=>m.n===n);
    return{bj:at('hebei','북경').y<at('hebei','석가장').y,ly:at('henan','낙양').x<at('henan','정주').x,dh:at('gansu','돈황').x<at('gansu','란주').x,
      gz:at('guangdong','광주').y>at('guangdong','단하산').y}});
  ok(`지도 순서 유지 ${JSON.stringify(ord)}`,Object.values(ord).every(Boolean));
  // 문파 입구는 그 문파의 산 가까이
  const sm=await p.evaluate(()=>{const out={};for(const[sid,k,mn]of[['hwasan','shaanxi','화산'],['emei','sichuan','아미산'],['mudang','hubei','무당산'],['kunlun','qinghai','곤륜산'],['taesan','shandong','태산'],['hyeongsan','hunan','형산']]){
    const R=REGIONS[pvId(k)],g=R.gates.find(q=>q.to===(REGIONS['hq_'+sid].chain||['hq_'+sid])[0]),m=R.marks.find(q=>q.n===mn);out[mn]=+Math.hypot(g.x-m.x,g.y-m.y).toFixed(1)}return out});
  ok(`문파 입구와 그 산 사이 칸 수 ${JSON.stringify(sm)}`,Object.values(sm).every(d=>d<13));
  // 겹치지 않음: 땅이름끼리, 출입구와
  const ov=await p.evaluate(()=>{const bad=[];for(const k of Object.keys(PROV)){const R=REGIONS[pvId(k)];
    for(const m of R.marks){for(const g of R.gates)if(Math.hypot(g.x-m.x,g.y-m.y)<3)bad.push(m.n+'/'+g.label);for(const o of R.marks)if(o!==m&&Math.hypot(o.x-m.x,o.y-m.y)<3)bad.push(m.n+'/'+o.n)}}return bad});
  ok(`땅이름이 출입구·서로와 겹치지 않음 ${ov.slice(0,6).join(' ')}`,ov.length===0);
  // 걸어서 닿는가: 성 전체 그림에서 한가운데부터 길찾기
  const reach=await p.evaluate(()=>{const bad=[];for(const k of Object.keys(PROV)){const R=REGIONS[pvId(k)],C=pvFull(k),S=C.S,m0=Math.floor(S/2),seen=new Set([m0+','+m0]),q=[[m0,m0]];
      while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b2=y+dy;if(a>=0&&b2>=0&&a<S&&b2<S&&!seen.has(a+','+b2)&&C.map[b2][a].g!==2&&!C.objs[b2][a]){seen.add(a+','+b2);q.push([a,b2])}}}
      for(const m of R.marks){if(m.t==='t'&&m.sub==='l')continue;let r=false;for(let j=-3;j<=3&&!r;j++)for(let i=-3;i<=3;i++)if(seen.has((Math.floor(m.x)+i)+','+(Math.floor(m.y)+j)))r=true;if(!r)bad.push(PROV[k].n+':'+m.n)}}
    return bad});
  ok(`모든 땅이름 곁까지 걸어서 닿음 ${reach.slice(0,6).join(' ')}`,reach.length===0);
  // 도시엔 전각, 호수엔 물, 사막엔 모래
  const look=await p.evaluate(()=>{const cntG=(C,m,f,r)=>{let n=0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const t=C.map[Math.floor(m.y)+j]&&C.map[Math.floor(m.y)+j][Math.floor(m.x)+i];if(t&&f(t.g))n++}return n};
    const C=pvFull('henan'),city=C.builds.filter(b=>b.lm==='낙양').length,cities=REGIONS.pv_henan.marks.filter(m=>m.t==='c').every(m=>C.builds.some(b=>b.lm===m.n));
    const Q=pvFull('qinghai'),lake=cntG(Q,REGIONS.pv_qinghai.marks.find(m=>m.n==='청해호'),g=>g===2||g===3,4);
    const X=pvFull('xinjiang'),sand=cntG(X,REGIONS.pv_xinjiang.marks.find(m=>m.n==='대막'),g=>g===12,5);return{city,cities,lake,sand}});
  ok(`낙양 전각 ${look.city}채(하남 도시 모두 전각 ${look.cities}), 청해호 물 ${look.lake}칸, 대막 모래 ${look.sand}칸`,look.city>=1&&look.cities&&look.lake>=15&&look.sand>=40);
  // 낙양에 가면 지역 이름과 머리 위 글씨
  await p.evaluate(()=>{const F=REGIONS.pv_henan,m=F.marks.find(q=>q.n==='낙양');P.reg='pv_henan';P.x=m.x;P.y=m.y+2;loadRegion('pv_henan')});await p.waitForTimeout(900);
  const z=await p.evaluate(()=>({reg:REG,zone:regionAt(Math.floor(P.x),Math.floor(P.y)),hint:lmHints().map(m=>m.n)}));
  ok(`${z.reg}에서 '${z.zone}', 이름 글씨 ${z.hint.join(',')}`,z.zone.includes('낙양')&&z.hint.includes('낙양'));
  await p.evaluate(()=>{const t=iso(P.x,P.y-2);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(600);await p.screenshot({path:shot('lm_luoyang')});
  await p.evaluate(()=>{const m=REGIONS.pv_shaanxi.marks.find(q=>q.n==='화산');P.reg='pv_shaanxi';P.x=m.x+1;P.y=m.y+3;loadRegion('pv_shaanxi');const t=iso(P.x,P.y-2);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(900);
  await p.screenshot({path:shot('lm_huashan')});
  await p.evaluate(()=>{const m=REGIONS.pv_qinghai.marks.find(q=>q.n==='청해호');P.reg='pv_qinghai';P.x=m.x;P.y=m.y+4;loadRegion('pv_qinghai');const t=iso(P.x,P.y-3);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(900);
  await p.screenshot({path:shot('lm_qinghai')});
  // 천하 지도 정보에 땅이름
  await p.evaluate(()=>{openPanel('world');wSel='hebei';renderOpen()});await p.waitForTimeout(300);
  ok('천하 지도 하북성 정보에 북경·오태산',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('북경')&&t.includes('오태산')&&t.includes('주요도시')}));
  await p.screenshot({path:shot('lm_world')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// 성 지도 나누기: 성 하나 = 40×40 맵 여러 장, 가장자리로 이어 걷기, 문파 입구는 성의 맵 하나에
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const cnt=await p.evaluate(()=>{const per={};let n=0;for(const[k,p]of Object.entries(PROV)){const w=Object.values(REGIONS).filter(R=>R.win&&R.win.k===k).length;per[p.n]=w;n+=w}
    return{n,per,xj:per['신강'],hn:per['하남성'],hi:per['해남도']}});
  ok(`성 맵 ${cnt.n}장 (신강 ${cnt.xj}, 하남 ${cnt.hn}, 해남 ${cnt.hi})`,cnt.n>100&&cnt.xj>cnt.hn&&cnt.hn>=cnt.hi&&cnt.hi===1);
  // 모든 출입구가 성의 맵 하나에 들어가 있고, 성 전체 그림에서 한가운데와 길로 이어진다
  const g=await p.evaluate(()=>{const bad=[];for(const[k,p]of Object.entries(PROV)){const F=REGIONS['pv_'+k];
      const ws=Object.values(REGIONS).filter(R=>R.win&&R.win.k===k),all=ws.flatMap(W=>W.gates.map(q=>q.to+'@'+(W.win.c*40+q.x)+','+(W.win.r*40+q.y)));
      for(const q of F.gates)if(!all.includes(q.to+'@'+q.x+','+q.y))bad.push(p.n+'→'+q.label);
      const C=pvFull(k),S=C.S,m=Math.floor(S/2),seen=new Set([m+','+m]),qq=[[m,m]];
      while(qq.length){const[x,y]=qq.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b2=y+dy;if(a>=0&&b2>=0&&a<S&&b2<S&&!seen.has(a+','+b2)&&C.map[b2][a].g!==2&&!C.objs[b2][a]){seen.add(a+','+b2);qq.push([a,b2])}}}
      for(const q of F.gates){let r=false;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(seen.has((Math.floor(q.x)+i)+','+(Math.floor(q.y)+j)))r=true;if(!r)bad.push(p.n+'(길)→'+q.label)}}
    return bad});
  ok(`출입구가 모두 맵에 놓이고 길로 이어짐 ${g.slice(0,5).join(' / ')}`,g.length===0);
  // 문파 입구: 성의 맵 가운데 한 곳에만
  const se=await p.evaluate(()=>{const bad=[];for(const s of Object.values(SECTS)){if(s.id==='shaolin')continue;const first=(REGIONS[hqId(s)].chain||[hqId(s)])[0],k=pvOfSect(s.id);
    const to=REGIONS[first].lmVia||first,n=Object.values(REGIONS).filter(R=>R.win&&R.win.k===k&&R.gates.some(q=>q.to===to)).length;if(n!==1)bad.push(s.n)}return bad});
  ok(`문파 입구가 성의 맵 한 곳에 (어긋남 ${se.join(',')})`,se.length===0);
  // 개봉 → 하남성: 개봉 출입구가 든 맵으로
  await p.evaluate(()=>travel(REGIONS.gaebong.gates.find(q=>q.to==='pv_henan')));await p.waitForTimeout(1200);
  const h=await p.evaluate(()=>({reg:REG,N,walk:walkAt(P.x,P.y),back:REGION().gates.some(q=>q.to==='gaebong'),name:REGION().name}));
  ok(`개봉에서 ${h.name}(${h.reg}) 40칸, 개봉 출입구 있음`,/^pv_henan@/.test(h.reg)&&h.N===40&&h.walk&&h.back);
  // 서쪽 가장자리를 걸어 나가면 이웃 맵
  const before=await p.evaluate(()=>({reg:REG,w:REGION().edges.w}));
  await p.evaluate(()=>{for(let y=4;y<36;y++)if(walk(0,y)&&walk(1,y)){P.x=1.2;P.y=y+.5;P.path=[{x:.2,y:y+.5}];break}});
  await p.waitForFunction(w=>REG===w&&!P.traveling,before.w,{timeout:6000}).catch(()=>{});await p.waitForTimeout(400);
  const a=await p.evaluate(()=>({reg:REG,x:P.x,walk:walkAt(P.x,P.y),e:REGION().edges.e}));
  ok(`가장자리 걸어 ${before.reg} → ${a.reg} (x ${a.x.toFixed(1)})`,!!before.w&&a.reg===before.w&&a.x>37&&a.walk&&a.e===before.reg);
  await p.evaluate(()=>{const t=iso(P.x-3,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(700);await p.screenshot({path:shot('split_henan')});
  // 신강: 천마신교 입구가 든 맵으로 들어가 본다
  const xj=await p.evaluate(()=>{const W=Object.values(REGIONS).find(R=>R.win&&R.win.k==='xinjiang'&&R.gates.some(q=>q.to==='hq_cheonma_1'));const id=Object.keys(REGIONS).find(k=>REGIONS[k]===W);
    const q=W.gates.find(q=>q.to==='hq_cheonma_1');travel({to:id,tx:q.x,ty:Math.min(38,q.y+2.4)});return id});await p.waitForTimeout(1200);
  const x2=await p.evaluate(()=>({reg:REG,name:REGION().name,zone:regionAt(Math.floor(P.x),Math.floor(P.y))}));
  ok(`신강 ${x2.name}에 십만대산 입구 (${x2.zone})`,x2.reg===xj&&x2.zone.includes('십만대산'));
  await p.evaluate(()=>{const t=iso(P.x,P.y-2);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(700);await p.screenshot({path:shot('split_xinjiang')});
  // 본산에서 나오면 성 전체 좌표 → 맞는 맵
  await p.evaluate(()=>travel(REGION().gates.find(q=>q.to==='hq_cheonma_1')));await p.waitForTimeout(1200);
  await p.evaluate(()=>travel(REGION().gates.find(q=>q.to.startsWith('pv_'))));await p.waitForTimeout(1200);
  ok('십만대산에서 나오면 입구가 있는 신강 맵',await p.evaluate(x=>REG===x&&walkAt(P.x,P.y),xj));
  // 예전 저장: 성 전체 좌표
  const old=await p.evaluate(()=>{loadRegion('gaebong');P.reg='pv_xinjiang';P.x=130.5;P.y=150.5;loadRegion('pv_xinjiang');return{reg:P.reg,x:P.x,y:P.y,w:walkAt(P.x,P.y)}});
  ok(`예전 저장 신강(130,150) → ${old.reg} (${old.x.toFixed(1)},${old.y.toFixed(1)})`,old.reg===`pv_xinjiang@3,3`&&old.w);
  // 천하 지도 정보
  await p.evaluate(()=>{openPanel('world');wSel='xinjiang';renderOpen()});await p.waitForTimeout(300);
  ok('천하 지도에 맵 장수',await p.evaluate(()=>/맵 \d×\d = \d+장/.test($('wbody').textContent)));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

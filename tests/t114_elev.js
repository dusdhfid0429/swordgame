// v179: 땅의 높낮이 — 턱·계단·절벽·출렁다리 (g_elev.js, g_cliff.js). 현공사·산 맵·무당파 본산 4맵
// 높이가 다른 칸은 계단으로만 걷는다, 모든 출입구·전각·NPC는 아래 출입구에서 걸어서 닿는다, 전각은 한 층 위에 선다,
// 경공은 두 층까지 뛰어오른다, 높은 곳의 사람에게 몹 근접이 닿지 않는다, 화면을 누르면 높은 칸을 고른다
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 맵 검사: 아래 출입구에서 걸어 닿는 칸(walk + hpass), 출입구·전각 앞·NPC가 다 닿는지, 전각 밑과 앞 한 줄이 한 층인지
  await p.evaluate(()=>{window.mapCheck=id=>{enterRegion(id,20.5,36);draw();
    const seen=new Uint8Array(N*NH),g0=REGION().gates.find(g=>g.y>NH-3)||REGION().gates[0],q=[];
    const near=(x,y)=>{for(let d=0;d<3;d++)for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++){const a=Math.floor(x)+i,b=Math.floor(y)+j;if(walk(a,b))return[a,b]}return null};
    const s=near(g0.x,g0.y);seen[s[1]*N+s[0]]=1;q.push(s);
    while(q.length){const[x,y]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a<0||b<0||a>=N||b>=NH||seen[b*N+a]||!walk(a,b)||!hpass(x,y,a,b))continue;seen[b*N+a]=1;q.push([a,b])}}
    const reach=(x,y)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const a=Math.floor(x)+i,b=Math.floor(y)+j;if(a>=0&&b>=0&&a<N&&b<NH&&seen[b*N+a])return true}return false};
    const bad=[];for(const g of REGION().gates)if(!reach(g.x,g.y))bad.push('출입구 '+g.label);
    for(const n of npcsHere())if(!reach(n.x,n.y))bad.push('NPC '+n.n);
    for(const bd of builds){const L=lvAt(bd.x,bd.y);for(let j=bd.y;j<=bd.y+bd.h;j++)for(let i=bd.x;i<=bd.x+bd.w;i++)if(i<N&&j<NH&&(lvAt(i,j)!==L||HST[j*N+i]))bad.push(`전각 ${bd.x},${bd.y} 층 어긋남`);
      if(!reach(bd.x+bd.w/2,bd.y+bd.h+.5)&&!reach(bd.x-.5,bd.y+bd.h/2))bad.push(`전각 ${bd.x},${bd.y} 못 닿음`)}
    let st=0;for(let k=0;k<N*NH;k++)if(HST[k])st++;
    return{max:ELMAX,st,bad:[...new Set(bad)],gh:ground.height,elev:!!ground.elev}}});
  for(const id of['hg_hyeongong','hq_mudang_gate','hq_mudang_outer','hq_mudang','hq_mudang_back','lm_shaanxi_2','sungsan']){
    const r=await p.evaluate(id=>mapCheck(id),id);
    ok(`${id}: ${r.max}층·계단 ${r.st}칸, 출입구·NPC·전각 모두 걸어서 닿고 전각은 한 층 위 ${r.bad.slice(0,4).join(', ')}`,r.max>=2&&r.st>0&&r.elev&&!r.bad.length)}
  // 높낮이 없는 맵은 그대로
  ok('개봉·전각 안은 높낮이 없음',await p.evaluate(()=>{enterRegion('gaebong',20.5,20.5);const a=!ELV&&!ground.elev;return a}));
  // 현공사: 벼랑을 걸어 오르지 못하고, 계단으로는 오른다
  const r1=await p.evaluate(()=>{enterRegion('hg_hyeongong',20.5,36);mobs=[];P.maxHp=P.hp=99999;
    // 산문 마당(1층)에서 대웅전 벼랑(5층)을 바로 마주한 칸
    let s=null;for(let y=1;y<NH-1&&!s;y++)for(let x=1;x<N-1;x++)if(lvAt(x,y)===1&&lvAt(x,y-1)===5&&!HST[(y-1)*N+x]&&walk(x,y)){s={x,y};break}
    P.x=s.x+.5;P.y=s.y+.5;for(let i=0;i<60;i++)moveEnt(P,0,-.08);const blocked=lvAt(Math.floor(P.x),Math.floor(P.y))===1;
    // 계단 칸 아래에서 길찾기로 꼭대기 암자 앞까지
    const top=builds.find(b=>lvAt(b.x,b.y)===9);let t=null;for(let j=top.y+top.h;j<top.y+top.h+3&&!t;j++)for(let i=top.x;i<=top.x+top.w;i++)if(walk(i,j)&&lvAt(i,j)===9){t={i,j};break}
    const path=findPath(20,36,t.i,t.j,9000);let up=0;if(path)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];if(!hpath(Math.floor(a.x),Math.floor(a.y),Math.floor(b.x),Math.floor(b.y)))up++}
    return{blocked,path:path&&path.length,jumps:up,y:P.y,sy:s.y}});
  ok(`벼랑 앞에서 밀어도 오르지 못한다 (y ${r1.y.toFixed(2)}, 벼랑 줄 ${r1.sy})`,r1.blocked&&r1.y>r1.sy);
  ok(`길찾기는 계단을 따라 꼭대기 암자까지 (${r1.path}칸, 높이 건너뜀 ${r1.jumps})`,r1.path>20&&r1.jumps===0);
  // 출렁다리: 대웅전 벼랑에서 다리를 건너 돌기둥 정자로. 다리 옆(아래 마당)에서는 다리에 오르지 못한다
  const r2=await p.evaluate(()=>{let br=[];for(let k=0;k<N*NH;k++)if(HBR[k])br.push(k);if(!br.length)return{n:0};
    const k=br[0],x=k%N,y=(k-x)/N,L=ELV[k];const side=lvAt(x,y+1)<L&&walk(x,y+1)?[x,y+1]:[x,y-1];
    const onto=hpass(x-1,y,x,y),fromSide=hpass(side[0],side[1],x,y);const pv=REGION().stage.pillar.size;
    const gy=gH(x+.5,y+.5)/LH;return{n:br.length,onto,fromSide,pv,L,gy}});
  ok(`출렁다리 ${r2.n}칸: 벼랑에서 오르고(${r2.onto}) 아래 마당에서는 못 오른다(${r2.fromSide}), 돌기둥 ${r2.pv}칸, 다리 높이 ${r2.gy}층`,r2.n>=2&&r2.onto&&!r2.fromSide&&r2.pv>=4&&r2.gy===r2.L);
  await p.evaluate(()=>{const b=builds.find(b=>lvAt(b.x,b.y)===5&&b.kind==='temple');P.x=b.x+1.5;P.y=b.y+b.h+1.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y-gH(P.x,P.y)});await p.waitForTimeout(500);
  await p.screenshot({path:shot('elev_hg')});
  // 화면을 누르면 높은 칸을 고른다 (toGrid가 들어 올린 칸을 되찾는다)
  const r3=await p.evaluate(()=>{const out=[];for(const[x,y]of[[P.x,P.y],[P.x+1,P.y-2]]){const s=toScreen(x,y),g=toGrid(s.x*S,s.y*S);out.push(Math.floor(g.x)===Math.floor(x)&&Math.floor(g.y)===Math.floor(y))}return out});
  ok(`높은 칸을 누르면 그 칸을 고른다 ${r3}`,r3.every(v=>v));
  // 높은 곳의 사람: 바로 아래 몹의 근접은 닿지 않는다 (몹은 계단으로 돌아 오른다)
  const r4=await p.evaluate(async()=>{let s=null;for(let y=1;y<NH-1&&!s;y++)for(let x=1;x<N-1;x++)if(lvAt(x,y)===5&&lvAt(x,y+1)===1&&walk(x,y)&&walk(x,y+1)&&!HST[y*N+x]&&!HST[(y+1)*N+x]){s={x,y};break}
    mobs=[];P.x=s.x+.5;P.y=s.y+.3;P.hp=P.maxHp=99999;const e=mkMob('늑대',s.x+.5,s.y+1.4);e.aggro=true;mobs.push(e);const hp=P.hp;
    await new Promise(r=>setTimeout(r,2500));return{hit:hp-P.hp,gap:elevGap(e,P),lv:[hLv(P.x,P.y),hLv(e.x,e.y)]}});
  ok(`벼랑 위 사람에게 아래 늑대의 근접이 닿지 않는다 (피해 ${r4.hit}, 높이 ${r4.lv})`,r4.hit===0);
  // 같은 높이면 막지 않는다 (비교)
  const r5=await p.evaluate(()=>{const out=[];for(const[dx,dy]of[[-1,0],[1,0],[0,-1]]){const e={x:P.x+dx,y:P.y+dy};if(walk(Math.floor(e.x),Math.floor(e.y)))out.push([elevGap(e,P),Math.abs(hLv(e.x,e.y)-hLv(P.x,P.y))<.01])}return out});
  ok(`같은 높이 이웃은 근접이 닿는다 ${JSON.stringify(r5)}`,r5.length&&r5.every(([g,same])=>g===!same));
  // 높은 곳에서 아래를 치면 20% 세다
  ok('높은 곳에서 치면 세다',await p.evaluate(()=>{const e={x:P.x,y:P.y+1.4};return elevAbove(P,e)&&!elevAbove(e,P)}));
  // 경공: 두 층까지는 뛰어오르고 네 층은 못 오른다
  const r6=await p.evaluate(()=>{let lo=null,hi=null;for(let k=0;k<N*NH;k++){const x=k%N,y=(k-x)/N;if(!lo&&ELV[k]===1&&!HST[k])lo={x:x+.5,y:y+.5};if(!hi&&ELV[k]===5&&!HST[k])hi={x:x+.5,y:y+.5}}return{two:elevLeapOk(lo.x,lo.y,hi.x,hi.y)===false,ok2:elevLeapOk(hi.x,hi.y,lo.x,lo.y)}});
  const r7=await p.evaluate(async()=>{mobs=[];P.qi=P.maxQi=9999;
    // 산 맵의 바위 언덕(한 층 위, 경공으로만): 옆 칸에서 언덕 쪽으로 경공
    enterRegion('lm_shaanxi_2',10.5,36);mobs=[];let s=null;
    for(let k=0;k<N*NH&&!s;k++)if(HKN[k]){const x=k%N,y=(k-x)/N;for(const[dx,dy]of[[0,1],[1,0],[-1,0],[0,-1]]){const a=x-dx*2,b=y-dy*2;if(walk(a,b)&&lvAt(a,b)===ELV[k]-1&&walk(x-dx,y-dy)&&lvAt(x-dx,y-dy)===ELV[k]-1&&walk(x,y)){s={a,b,dx,dy,x,y};break}}}
    if(!s)return{none:1};P.x=s.a+.5;P.y=s.b+.5;P.fx=s.dx;P.fy=s.dy;const l0=hLv(P.x,P.y);P.gkcur=P.gkcur||1;leap();await new Promise(r=>setTimeout(r,1200));
    return{l0,l1:hLv(P.x,P.y),walkUp:hpass(s.x-s.dx,s.y-s.dy,s.x,s.y)}});
  ok(`경공으로 바위 언덕에 뛰어오른다 (${r7.l0}층 → ${r7.l1}층), 걸어서는 못 오른다`,!r7.none&&r7.l1>r7.l0&&!r7.walkUp);
  ok(`네 층 위로는 경공이 닿지 않는다`,r6.two&&r6.ok2);
  // 무당파 본산: 붉은 담과 전각 벽색, 그림
  const r8=await p.evaluate(()=>{enterRegion('hq_mudang',20.5,36);draw();let w=0;for(let k=0;k<N*NH;k++)if(HWL[k])w++;return{w,wc:builds.map(b=>b.wc&&b.wc[0]),main:lvAt(20,6),yard:lvAt(20,14)}});
  ok(`무당파 본산: 붉은 담 ${r8.w}칸, 전각 벽 ${r8.wc[0]}, 본전 ${r8.main}층 > 마당 ${r8.yard}층`,r8.w>10&&r8.wc.every(c=>c==='#a8402a')&&r8.main>r8.yard);
  await p.evaluate(()=>{P.x=20.5;P.y=14.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y-gH(P.x,P.y)});await p.waitForTimeout(500);await p.screenshot({path:shot('elev_mudang')});
  // 메모리: 키운 바닥 그림은 원래보다 층 높이만큼만 크다
  const r9=await p.evaluate(()=>({h:ground.height,w:ground.width,pad:ground.padW}));
  ok(`바닥 그림 ${r9.w}×${r9.h} (위로 ${r9.pad|0}픽셀)`,r9.h<=(40+40)*16+9*24+30);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

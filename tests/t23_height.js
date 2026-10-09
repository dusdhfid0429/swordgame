// 높이: 경공으로 지붕·나무 위에 오르고, 지붕 위를 걷고, 내려오고, 높은 곳에서는 근접 적이 닿지 않고, 낙하 공격
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{travel({to:'hq_hwasan',tx:20.5,ty:30})});await p.waitForTimeout(1500);
  await p.evaluate(()=>{mobs=[];P.qi=P.maxQi;P.maxHp=9999;P.hp=9999});
  // 전각 지붕 앞에 서서 지붕 쪽으로 경공
  const r1=await p.evaluate(()=>{const bd=builds.find(q=>q.kind==='temple');const x=bd.x+.5,y=bd.y+bd.h+.6;P.x=x;P.y=y;P.fx=0;P.fy=-1;leap();return{bd:[bd.x,bd.y,bd.w,bd.h]}});
  await p.waitForTimeout(900);
  const s1=await p.evaluate(()=>({k:P.perch&&P.perch.k,z:P.z,x:P.x,y:P.y}));
  ok(`경공으로 전각 지붕 위에 오른다 (높이 ${s1.z})`,s1.k==='roof'&&s1.z>40);
  await p.screenshot({path:shot('height_roof')});
  ok('터치 상황 버튼이 "내려가기"',await p.evaluate(()=>ctxPick().l==='내려가기'));
  // 지붕 위를 걷는다
  const s2=await p.evaluate(()=>{const x0=P.x;for(let i=0;i<5;i++)perchMove(1,0,.08);return{dx:P.x-x0,perch:!!P.perch}});
  ok(`지붕 위를 걷는다 (${s2.dx.toFixed(2)}칸)`,s2.dx>.2&&s2.perch);
  // 작은 지붕: 가장자리에 닿으면 멈추고, 잠깐 미는 정도로는 떨어지지 않는다
  const se=await p.evaluate(()=>{for(let i=0;i<30;i++)perchMove(0,-1,.05);const a=!!P.perch,y=P.y;for(let i=0;i<4;i++)perchMove(0,-1,.05);return{a,b:!!P.perch,y}});
  ok('지붕 끝에 닿으면 멈추고 잠깐 밀어서는 떨어지지 않는다',se.a&&se.b);
  // 지붕 위 한 점을 누르면 그리로 걷는다
  const tp=await p.evaluate(()=>{const b=P.perch.b,tx=b.x+b.w-.4,ty=b.y+b.h-.4,s=toScreen(tx,ty);const ok=roofTap(s.x*S,(s.y-P.z)*S);for(let i=0;i<120&&P.roofGoal;i++)perchMove(0,0,.05);return{ok,d:Math.hypot(P.x-tx,P.y-ty),perch:!!P.perch}});
  ok(`지붕 위를 누르면 지붕 위로 걸어간다 (남은 거리 ${tp.d.toFixed(2)})`,tp.ok&&tp.d<.1&&tp.perch);
  // 근접 적은 닿지 않는다
  await p.evaluate(()=>{const e=mkMob('늑대',P.x,P.y+2.2);e.aggro=true;mobs.push(e);window._w=e});
  const hp0=await p.evaluate(()=>P.hp);await p.waitForTimeout(3000);
  ok('지붕 위에서는 늑대가 물지 못한다',await p.evaluate(h=>P.hp===h,hp0));
  await p.waitForTimeout(5000);
  ok('6초 넘게 닿지 못하면 늑대가 포기한다',await p.evaluate(()=>!window._w.aggro));
  // 낙하 공격: 적을 고르면 그 위로 뛰어내린다
  const s3=await p.evaluate(()=>{const e=mkMob('늑대',P.x+.5,P.y+3);e.aggro=false;mobs.push(e);window._v=e;P.target=e;return e.hp});
  await p.waitForFunction(()=>!P.perch&&P.z===0,null,{timeout:4000}).catch(()=>{});await p.waitForTimeout(400);
  const s4=await p.evaluate(()=>({hp:window._v.hp,perch:!!P.perch,z:P.z,walk:walkAt(P.x,P.y)}));
  ok(`지붕에서 적을 고르면 낙하 공격 (늑대 ${s3} → ${Math.round(s4.hp)}), 땅에 내려선다`,s4.hp<s3&&!s4.perch&&s4.z===0&&s4.walk);
  // 지붕에서 걸어 나가면 뛰어내린다
  await p.evaluate(()=>{mobs=[];const bd=builds.find(q=>q.kind==='temple');P.x=bd.x+.5;P.y=bd.y+bd.h+.6;P.fx=0;P.fy=-1;P.qi=P.maxQi;P.target=null;leap()});await p.waitForTimeout(900);
  await p.evaluate(()=>{for(let i=0;i<40&&P.perch;i++)perchMove(0,1,.1)});await p.waitForTimeout(700);
  ok('지붕 가장자리 밖으로 걸으면 뛰어내린다',await p.evaluate(()=>!P.perch&&P.z===0&&walkAt(P.x,P.y)));
  // 나무 위
  const tr=await p.evaluate(()=>{for(let j=3;j<N-3;j++)for(let i=3;i<N-3;i++)if(PERCH_TREE[objs[j][i]]&&walk(i,j+1)&&walk(i,j+2)&&Math.hypot(i-P.x,j-P.y)<20){P.x=i+.5;P.y=j+2.4;P.fx=0;P.fy=-1;P.qi=P.maxQi;leap();return[i,j]}return null});
  await p.waitForTimeout(900);
  const s5=await p.evaluate(()=>({k:P.perch&&P.perch.k,z:P.z}));
  ok(`나무 위에 오른다 (높이 ${s5.z})`,!!tr&&s5.k==='tree'&&s5.z>20);
  await p.screenshot({path:shot('height_tree')});
  // 나무 위에서는 적이 알아채는 거리가 절반
  const s6=await p.evaluate(()=>{const e=mkMob('늑대',P.x+4,P.y);mobs.push(e);window._t=e;return(e.d.aggro||6)});
  await p.waitForTimeout(600);ok(`나무 위에 숨으면 ${s6}칸 안이라도 4칸 떨어진 늑대가 알아채지 못한다`,await p.evaluate(()=>!window._t.aggro));
  // 나무에서 나무로: 조이스틱으로 겨누고 경공
  await p.evaluate(()=>{mobs=[]});
  const hop=await p.evaluate(()=>{const q=P.perch,from={i:q.i,j:q.j};let to=null;
    for(let r=2;r<=4&&!to;r++)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const i=q.i+dx*r,j=q.j+dy*r;if(i>2&&j>2&&i<N-3&&j<N-3&&PERCH_TREE[objs[j][i]]){to={i,j,dx,dy};break}}
    if(!to)return{none:1};const l=Math.hypot(to.dx,to.dy);joy.on=true;joy.gx=to.dx/l;joy.gy=to.dy/l;
    for(let i=0;i<3;i++)perchMove(joy.gx,joy.gy,.03);const still=!!P.perch,aim=leapAim();P.qi=P.maxQi;leap();joy.on=false;return{to,from,still,aim:!!aim}});
  await p.waitForTimeout(900);
  const hop2=await p.evaluate(h=>({k:P.perch&&P.perch.k,i:P.perch&&P.perch.i,j:P.perch&&P.perch.j}),hop);
  ok(`나무 위에서 조이스틱을 잠깐 기울이면 떨어지지 않고 겨눈 자리가 보이며, 경공으로 그쪽 나무 위로 건너뛴다 (${hop.from?`${hop.from.i},${hop.from.j} → ${hop2.i},${hop2.j}`:'없음'})`,hop.still&&hop.aim&&hop2.k==='tree'&&(hop2.i!==hop.from.i||hop2.j!==hop.from.j)&&((hop2.i-hop.from.i)*hop.to.dx+(hop2.j-hop.from.j)*hop.to.dy)>0);
  await p.screenshot({path:shot('height_tree_hop')});
  await p.evaluate(()=>{for(let i=0;i<45;i++)perchMove(1,0,.05)});await p.waitForTimeout(700);
  ok('나무에서 조이스틱을 계속 밀면 아래로 내려온다',await p.evaluate(()=>!P.perch&&P.z===0&&walkAt(P.x,P.y)));
  // 지역을 옮기면 높이가 풀린다
  await p.evaluate(()=>{P.perch={k:'tree',i:1,j:1,z:30};P.z=30;travel({to:'gaebong',tx:20.5,ty:20.5})});await p.waitForTimeout(800);
  ok('지역을 옮기면 땅에 선다',await p.evaluate(()=>!P.perch&&P.z===0));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

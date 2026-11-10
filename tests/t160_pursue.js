// v243 맵을 옮겨도 남는 몹 (동훈님 2026-11-10 "최후의 결사대가 날 추격하던중 맵을 이동하면 사라져. 따라오거나 맵이동 후 다시 복귀시 유지되어야하는 몹을 설정할수 있을까?")
// 1) 결사대(follow)는 쫓던 중이면 출입구를 따라 넘어온다 (생명 그대로), 보통 몹은 예전처럼 사라진다
// 2) 멀리 따돌린 결사대는 그 맵에 남고, 돌아가면 그대로 있다
// 3) stay 몹(e.pursue·PURSUE.kinds)은 그 맵에 생명을 지닌 채 남는다
// 3c) 기억하는 맵은 바로 전 맵 하나와 기연동굴뿐 (동훈님 같은 날 "모든 맵을 유지하지 말고 현재 맵 기준으로 바로 전 맵과 기연 동굴만")
// 4) 중립지대로는 따라오지 않는다 / 출입구가 아닌 길(regionJump)로는 따라오지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const pair=await p.evaluate(()=>{paused=true;spawnTick=()=>{};P.hp=P.maxHp=1e7;
    // 성 안에서 가장자리로 이어진 이웃 맵 둘 (가장자리 넘기도 travel을 탄다)
    for(const[k,R]of Object.entries(REGIONS))if(R.win&&R.edges&&R.edges.e&&!R.neutral&&!REGIONS[R.edges.e].neutral)return{a:k,to:R.edges.e};
    return null});
  ok(`시험할 두 맵 ${pair&&pair.a} ↔ ${pair&&pair.to}`,!!pair);
  await p.evaluate(({a})=>{
    window.fixP=()=>{if(!walkAt(P.x,P.y)){const q=pvNearWalk(P.x,P.y);P.x=q.x;P.y=q.y}};
    window.go=id=>{regionJump(id,20.5,20.5);paused=true;fixP()};   // regionJump이 창을 닫으며 paused를 푼다
    window.gateTo=to=>({to,tx:20.5,ty:20.5,edge:1});
    window.spot=d=>{for(let t=0;t<400;t++){const an=Math.random()*6.28,x=P.x+Math.cos(an)*d,y=P.y+Math.sin(an)*d;if(x>2&&y>2&&x<N-2&&y<NH-2&&walkAt(x,y))return{x,y}}return{x:P.x+.5,y:P.y}};
    window.sid=Object.keys(SECTS)[0];
    window.squad=(d,hp)=>{const s=spot(d),e=mkMob('산적',s.x,s.y);e.last=sid;e.fixed='last';e.angry=1;e.aggro=true;e.name='시험 결사대';e.maxHp=1000;e.hp=hp;e.atk=0;mobs.push(e);return e};
    window.run=sec=>{for(let t=0;t<sec;t+=1/30)update(1/30)}},pair);
  const hop=async to=>{await p.evaluate(to=>travel(gateTo(to)),to);await p.waitForFunction(to=>REG===to&&!P.traveling,to);await p.evaluate(()=>fixP());};
  // 1. 쫓던 결사대가 따라온다
  let r=await p.evaluate(({a,to})=>{go(a);mobs=[];const e=squad(3,777),m=mkMob('산적',P.x+2,P.y);mobs.push(m);window.E=e;window.M=m;return{d:dist(e,P)}},pair);
  await hop(pair.to);
  r=await p.evaluate(()=>{const before=mobs.includes(E);run(2.5);const e=E;return{before,in:mobs.includes(e),hp:e.hp,d:dist(e,P),m:mobs.includes(M)||pursueAll().includes(M),log:logEl.textContent.includes('뒤쫓아 왔다'),aggro:e.aggro}});
  ok(`결사대가 출입구를 따라 넘어온다 (도착 전 ${r.before}, 뒤 ${r.in}, 생명 ${r.hp}, 거리 ${r.d.toFixed(1)}, 알림 ${r.log})`,!r.before&&r.in&&r.hp===777&&r.d<6&&r.log&&r.aggro);
  ok(`보통 산적은 예전처럼 그 맵에 두고 온다 (남음 ${r.m})`,!r.m);
  // 2. 멀리 따돌리면 그 맵에 남고, 돌아가면 그대로
  r=await p.evaluate(({a,to})=>{for(const m of mobs)m.hp=0;mobs=[];go(to);const e=squad(22,555);window.qF=e;return{d:dist(e,P)}},pair);
  await hop(pair.a);
  const gone=await p.evaluate(()=>{run(2.5);return mobs.includes(qF)});
  await hop(pair.to);
  r=await p.evaluate(()=>({in:mobs.includes(qF),hp:qF.hp}));
  ok(`멀리(22칸) 따돌린 결사대는 그 맵에 남는다 (따라옴 ${gone}, 돌아오니 있음 ${r.in}, 생명 ${r.hp})`,!gone&&r.in&&r.hp===555);
  // 3. stay: e.pursue, 데이터 PURSUE.kinds
  r=await p.evaluate(()=>{for(const m of mobs)m.hp=0;mobs=[];const s1=spot(4),e=mkMob('산적',s1.x,s1.y);e.pursue='stay';e.maxHp=1000;e.hp=321;mobs.push(e);
    PURSUE.kinds['늑대']='stay';const s2=spot(5),w=mkMob('늑대',s2.x,s2.y);w.maxHp=1000;w.hp=12;mobs.push(w);window.qS1=e;window.qS2=w;window.qS1p={x:e.x,y:e.y};return 1});
  await hop(pair.a);
  const away=await p.evaluate(()=>{run(2.5);return mobs.includes(qS1)||mobs.includes(qS2)});
  await hop(pair.to);
  r=await p.evaluate(()=>({a:mobs.includes(qS1),b:mobs.includes(qS2),hp1:qS1.hp,hp2:qS2.hp,moved:Math.hypot(qS1.x-qS1p.x,qS1.y-qS1p.y)}));
  ok(`stay 몹은 남아 기다린다 (따라옴 ${away}, e.pursue ${r.a}/${r.hp1}, PURSUE.kinds 늑대 ${r.b}/${r.hp2}, 자리 ${r.moved.toFixed(2)})`,!away&&r.a&&r.b&&r.hp1===321&&r.hp2===12&&r.moved<.01);
  await p.evaluate(()=>{delete PURSUE.kinds['늑대']});
  // 3b. 멸문 문파 잔당: 다쳐 놓고 나갔다 오면 새로 세우지 않고 다친 그대로
  await p.evaluate(({to})=>{for(const m of mobs)m.hp=0;mobs=[];go(to);window.qPop=G.pop[sid];G.pop[sid]=0;G.remn=G.remn||{};G.remn[sid]={reg:REG,left:2,lead:0,known:1};remnSpawn(REG);
    window.qR=mobs.filter(m=>m.remn===sid);for(const m of qR)m.hp=Math.max(1,Math.floor(m.maxHp/3))},pair);
  await hop(pair.a);await p.evaluate(()=>run(1));await hop(pair.to);
  r=await p.evaluate(()=>{run(3);const L=mobs.filter(m=>m.remn===sid&&m.hp>0);return{n0:qR.length,n:L.length,same:L.every(m=>qR.includes(m)),hurt:L.every(m=>m.hp<m.maxHp*.5)}});
  ok(`잔당은 그 맵에 다친 채 남는다 (처음 ${r.n0}, 돌아와 ${r.n}, 같은 무리 ${r.same}, 다친 그대로 ${r.hurt})`,r.n0===2&&r.n===2&&r.same&&r.hurt);
  await p.evaluate(()=>{delete G.remn[sid];G.pop[sid]=qPop});
  // 3c. 두 맵 건너면 잊는다: A(남김) → B → C → B → A 이면 없다
  const third=await p.evaluate(({to})=>{const R=REGIONS[to],e=R.edges;return [e.s,e.n,e.e].find(k=>k&&k!==window.pairA)||null},{to:pair.to});
  await p.evaluate(a=>{window.pairA=a},pair.a);
  if(third){
    await p.evaluate(({a})=>{for(const m of mobs)m.hp=0;mobs=[];go(a);const s1=spot(4),e=mkMob('산적',s1.x,s1.y);e.pursue='stay';e.maxHp=1000;e.hp=250;mobs.push(e);window.qA=e},pair);
    await hop(pair.to);const k1=await p.evaluate(a=>Object.keys(PURSUE_KEEP).includes(a),pair.a);
    await hop(third);const k2=await p.evaluate(a=>Object.keys(PURSUE_KEEP),pair.a);
    await hop(pair.to);await hop(pair.a);r=await p.evaluate(()=>mobs.includes(qA));
    ok(`바로 전 맵만 기억한다 (한 걸음 뒤 ${k1}, 두 걸음 뒤 기억 [${k2}], 돌아가니 남음 ${r})`,k1&&!k2.includes(pair.a)&&!r);
  }else ok('세 번째 맵이 없어 건너뜀',true);
  // 3d. 기연동굴: 수호자까지 모두 남는다. 다친 수호자는 그대로, 쓰러뜨린 수호자는 다시 나오지 않는다
  r=await p.evaluate(()=>{const c=G.gyc&&G.gyc.list.find(c=>!c.done);if(!c)return{skip:1};window.qC=c;regionJump(c.host,20.5,20.5);paused=true;fixP();
    regionJump('gyc_'+c.i,22.5,40.5);paused=true;const gd=mobs.find(m=>m.gycGuard===c.i);if(!gd)return{nog:1};gd.hp=Math.floor(gd.maxHp*.4);window.qG=gd;return{id:REG,host:c.host}});
  if(r.skip||r.nog)ok(`기연동굴 시험 건너뜀 ${JSON.stringify(r)}`,!r.nog);
  else{const cave=r.id,host=r.host;
    await p.evaluate(()=>{const g=REGION().gates[0];travel(g)});await p.waitForFunction(h=>REG===h&&!P.traveling,host);
    const kc=await p.evaluate(c=>Object.keys(PURSUE_KEEP).includes(c),cave);
    // 동굴 밖에서 다른 맵을 하나 더 들렀다 와도 동굴은 잊지 않는다
    await p.evaluate(()=>{const e=REGION().edges||{};const to=e.e||e.w||e.n||e.s;window.qOut=to;if(to)travel({to,tx:20.5,ty:20.5,edge:1})});
    await p.waitForFunction(()=>!window.qOut||REG.startsWith(qOut.split('@')[0])&&!P.traveling);await p.waitForTimeout(100);
    await p.evaluate(()=>{regionJump(qC.host,20.5,20.5);paused=true;regionJump('gyc_'+qC.i,22.5,40.5);paused=true});
    r=await p.evaluate(()=>{const L=mobs.filter(m=>m.gycGuard===qC.i);return{n:L.length,same:L[0]===qG,hp:L[0]&&L[0].hp,want:qG.hp}});
    ok(`기연동굴 수호자가 다친 채 남는다 (기억 ${kc}, 수호자 ${r.n}, 같은 몹 ${r.same}, 생명 ${r.hp}/${r.want})`,kc&&r.n===1&&r.same&&r.hp===r.want);
    r=await p.evaluate(()=>{qG.hp=0;mobs=mobs.filter(m=>m.hp>0);const g=REGION().gates[0];travel(g);return 1});
    await p.waitForFunction(h=>REG===h&&!P.traveling,host);
    await p.evaluate(()=>{const g=REGION().gates.find(h=>h.gyc===qC.i);travel({to:'gyc_'+qC.i,tx:22.5,ty:40.5})});await p.waitForFunction(c=>REG===c&&!P.traveling,cave);
    r=await p.evaluate(()=>mobs.filter(m=>m.gycGuard===qC.i&&m.hp>0).length);
    ok(`쓰러뜨린 수호자는 다시 나오지 않는다 (${r})`,r===0)}
  // 4a. 출입구가 아닌 길로 옮기면 따라오지 않는다
  r=await p.evaluate(({a})=>{for(const m of mobs)m.hp=0;mobs=[];const e=squad(3,444);regionJump(a,20.5,20.5);paused=true;run(2.5);return{in:mobs.includes(e)}},pair);
  ok(`regionJump(압송 등)로는 따라오지 않는다 (${r.in})`,!r.in);
  // 4b. 중립지대로는 따라오지 않는다
  r=await p.evaluate(()=>{const N0=Object.entries(REGIONS).find(([k,R])=>R.neutral);if(!N0)return{skip:1};for(const m of mobs)m.hp=0;mobs=[];const e=squad(2,333);
    const g={x:P.x,y:P.y,to:N0[0],tx:20.5,ty:20.5};return{f:pursueFollows(e,g),n:N0[0]}});
  ok(`중립지대(${r.n})로는 따라오지 않는다 (${r.f})`,r.skip||r.f===false);
  // 5. 다시 시작하면 남겨 둔 몹을 잊는다
  r=await p.evaluate(()=>{pursueClear();return pursueAll().length});
  ok(`pursueClear 뒤 남은 몹 ${r}`,r===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no errors');await b.close();
})();

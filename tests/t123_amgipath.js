// 암기 궤적 (v190, 사용자 2026-10-27 "나선형·호, 부채꼴·원형으로 뿌린 뒤 선형으로 목표에, 곧게 꺾이거나 부드러운 곡선, 총알처럼 회전하는 강한 한 방")
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{
    const id='사암1';P.eq.weapon=mkWeapon('암',1,0);P.arts[id]={p:0,f:ARTS[id].forms.map(()=>true)};P.cur=id;recalc();AMGI_FREE=true;P.eq.belt=null;
    for(let j=Math.floor(P.y)-8;j<=P.y+8;j++)for(let i=Math.floor(P.x)-8;i<=P.x+8;i++)if(objs[j]&&j>=0&&i>=0)objs[j][i]=null;   // 둘레 장애물을 치워 빗나감을 궤적 탓으로만 본다
    P.fx=1;P.fy=0;const X=()=>{const x=mkX(id);x.t=0;return x};
    const tick=()=>{for(const q of sched)q.t-=1/60;const due=sched.filter(q=>q.t<=0);sched=sched.filter(q=>q.t>0);due.forEach(q=>q.f());updateProjs(1/60)};
    // 초식을 쓰고 끝날 때까지 움직이며 투사체 자취와 맞은 적을 모은다
    const run=(f,offs)=>{mobs=[];projs=[];sched=[];const es=offs.map(([dx,dy])=>{const e=mkMob('산적',P.x+dx,P.y+dy);e.hp=e.maxHp=1e7;e.def=0;e.spd=0;mobs.push(e);return e});
      const hits=[],h0=hitE;hitE=(X,e,m,kb)=>{hits.push({i:es.indexOf(e),m:+m.toFixed(3),kb})};
      exec(f,es[0],X());const n0=projs.length,tr=new Map;let maxHz=0,turned=0,fr=0;
      for(;fr<240&&(projs.length||sched.length);fr++){tick();for(const q of projs){if(!tr.has(q))tr.set(q,[]);tr.get(q).push({x:q.x,y:q.y});maxHz=Math.max(maxHz,Math.abs(q.hz||0));if(q.turned)turned++}}
      hitE=h0;
      // 곧은 선에서 얼마나 벗어났는지: 출발점–마지막 점 직선과의 최대 거리
      const dev=[...tr.values()].map(t=>{const a={x:P.x,y:P.y},z=t[t.length-1],L=Math.hypot(z.x-a.x,z.y-a.y)||1;return Math.max(...t.map(p=>Math.abs((z.x-a.x)*(a.y-p.y)-(a.x-p.x)*(z.y-a.y))/L))});
      return{n0,hits,maxHz,turned,dev:Math.max(0,...dev),es}};
    const A=GD.AMGI,F=n=>A.find(f=>f.n===n),o={};
    const sp=run(F('독침'),[[4,0]]);o.spiral=[sp.hits.length,+sp.maxHz.toFixed(1)];
    const arc=run(F('쌍비도'),[[3,0]]);o.arc=[arc.hits.length,+arc.dev.toFixed(2)];
    const arcFar=run(F('회선표'),[[1.2,0]]);o.arcNear=arcFar.hits.length;
    const ga=run(F('팔방표'),[[3,0.4]]);o.gather=[ga.hits.length,ga.turned>0,+ga.dev.toFixed(2)];
    const mae=run(F('매화침'),[[3,1],[3,-1]]);o.mae=[mae.hits.filter(h=>h.i===0).length,mae.hits.filter(h=>h.i===1).length];
    const vx=run(GD.AMGIU[0].steps[0],[[3,0]]);o.vortex=[vx.hits.length,vx.n0];
    const vx0=run(GD.AMGIU[0].steps[0],[]);o.vortexAlone=vx0.n0;
    // 회전 일격: 바로 나가지 않고 모았다가 한 발, 세게 밀친다
    mobs=[];projs=[];sched=[];exec(F('관혈비도'),null,X());o.charge=[projs.length,sched.length>0];
    const bu=run(F('관혈비도'),[[5,0],[6,0]]);o.bullet=[bu.hits.map(h=>h.i+'×'+h.m).join(' '),bu.hits[0]&&bu.hits[0].kb];
    // 조준·같은 적 감쇠는 그대로: 쌍비도 둘 다 한 적에게 → 두 번째는 0.4배
    o.vol=arc.hits.map(h=>h.m).join('/');
    // 무공 창 설명에 궤적 이름
    o.lab=['독침','쌍비도','팔방표','관혈비도'].map(n=>plabel(F(n))).join(' | ');
    // 그림: 휘는 암기·회전 일격·손에 쥔 비도가 오류 없이 그려진다
    run(F('관혈비도'),[[5,0]]);exec(F('독침'),null,X());for(let i=0;i<10;i++){tick();draw()}
    AMGI_FREE=false;run(F('팔방표'),[[1,0]]);for(let i=0;i<5;i++){tick();draw()}AMGI_FREE=true;
    return o});
  ok(`겹나선 독침이 위아래로 감기며 맞힘 (맞음 ${r.spiral[0]}, 높이 ${r.spiral[1]}px)`,r.spiral[0]===1&&r.spiral[1]>5);
  ok(`쌍비도는 옆으로 휘어 들어 둘 다 맞힘 (맞음 ${r.arc[0]}, 벗어남 ${r.arc[1]}칸)`,r.arc[0]===2&&r.arc[1]>.3);
  ok(`가까운 적도 호로 맞힘 (${r.arcNear})`,r.arcNear>=3);
  ok(`팔방표는 원형으로 퍼졌다 곧게 꺾여 모임 (맞음 ${r.gather[0]}, 꺾임 ${r.gather[1]}, 벗어남 ${r.gather[2]})`,r.gather[0]===8&&r.gather[1]&&r.gather[2]>.3);
  ok(`매화침은 두 적에게 나눠 꺾여 감 (${r.mae})`,r.mae[0]+r.mae[1]===5&&r.mae.every(v=>v>=1));
  ok(`오의 소용돌이도 적에게 모임 (맞음 ${r.vortex[0]}/${r.vortex[1]}발)`,r.vortex[0]>=8);
  ok(`적이 없어도 소용돌이는 나감 (${r.vortexAlone}발)`,r.vortexAlone>=24);
  ok(`회전 일격은 기를 모았다 던짐 (바로 ${r.charge[0]}발, 예약 ${r.charge[1]})`,r.charge[0]===0&&r.charge[1]);
  ok(`회전 일격 한 방 2.1배, 꿰뚫지 않고 세게 밀침 (${r.bullet[0]}, 밀침 ${r.bullet[1]})`,r.bullet[0]==='0×2.1'&&r.bullet[1]>=1);
  ok(`같은 적 감쇠 그대로 (${r.vol})`,r.vol==='0.7/0.28');
  ok(`무공 창에 궤적 이름: ${r.lab}`,/겹나선/.test(r.lab)&&/휘어 들기/.test(r.lab)&&/흩뿌렸다 꺾임/.test(r.lab)&&/회전 일격/.test(r.lab));
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

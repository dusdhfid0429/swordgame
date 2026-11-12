// v254 종남파 (사용자 2026-11-12 "모두 적용하고 묘사된 종남파의 형태도 맵에 적용해줘"): 세 검관·천하삼십육검·검풍·검→장 전환·태을 운기·섬서 논검·몰락한 종남 판·명소·본산 맵
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 세 검관 사부 길·이름·초식 (다른 문파 무공 이름과 겹치지 않는다)
  const r1=await p.evaluate(()=>{const M=SABU.jongnam,names={};for(const a of Object.values(ARTS))(names[a.n]=names[a.n]||[]).push(a.id);
    return{m:M.map(m=>m.n+':'+m.cls+':'+m.path.map(id=>ARTS[id].n+'/'+ARTS[id].cls+'/'+ARTS[id].grade).join('>')),hi:ARTS.S_jongnam_2.n,hf:ARTS.S_jongnam_2.forms.map(f=>f.n).join(),
      dup:Object.entries(names).filter(([n,l])=>l.length>1&&l.some(id=>/^S_jongnam/.test(id))).map(([n])=>n),ice:Object.values(ARTS).filter(a=>/^S_jongnam/.test(a.id)).flatMap(a=>a.forms.map(f=>f.n)).filter(n=>/한빙|빙백|열양|화룡/.test(n)),
      sim:SIM_NAMES.jongnam.join(),tr:[].concat(SIM_TRAIT.jongnam).join(),monk:LORE.monk.includes('jongnam'),pd:ARTS.S_jongnam_t1_0.d.includes('중검')}});
  ok(`세 검관: ${r1.m.join(' | ')}`,r1.m.length===3&&/^현무관주:권:천강장/.test(r1.m[0])&&/^은하관주:검:은하검법.*종남검법\/검\/2>은하성진검\/검\/3$/.test(r1.m[1])&&/^유운관주:검:청운유수검\/검\/0>유운연환검\/검\/1>유운회류검\/검\/2>유운무극검\/검\/3$/.test(r1.m[2]));
  ok(`천하삼십육검 ${r1.hi} [${r1.hf}] · 겹치는 이름 ${r1.dup.join()||'없음'} · 얼음·불 초식 ${r1.ice.join()||'없음'} · 심법 ${r1.sim} 특색 ${r1.tr} · 속가/출가 ${r1.monk} · 검풍 설명 ${r1.pd}`,
    r1.hi==='천하삼십육검'&&/은하범람/.test(r1.hf)&&!r1.dup.length&&!r1.ice.length&&r1.sim==='태을심법,태을신공,태을강기'&&r1.tr==='qreg,taeul'&&r1.monk&&r1.pd);
  // 2. 검풍: 근력이 앞서면 중검(피해↑·밀쳐냄), 민첩이 앞서면 연환검(추가 일격), 고르면 정검(명중)
  const r2=await p.evaluate(()=>{const X={art:ARTS.S_jongnam_0,key:'S_jongnam_0',mul:1,combo:1,t:0},e={x:P.x+1,y:P.y,hp:1e6,maxHp:1e6,def:0,hm:0,d:{},stun:0};
    const run=(str,agi)=>{P.st.str=str;P.st.agi=agi;const c={X,e,from:P,m:1,hm:10,hp0:e.hp};runHooks('hit',c);const m=c.m,hm=c.hm;e.kb=null;P.jnTxtT=0;runHooks('hitDone',{...c,hp0:e.hp+100});return{p:jnPung(),m,hm,kb:!!e.kb}};
    const h=run(30,10),f=run(10,30),ev=run(20,20);const rnd=Math.random;Math.random=()=>0;P.jnFastT=0;P.st.str=10;P.st.agi=30;const n0=sched.length;runHooks('hitDone',{X,e,from:P,m:1,hp0:e.hp+100});Math.random=rnd;
    return{h,f,ev,later:sched.length-n0}});
  ok(`검풍: 중검 ${JSON.stringify(r2.h)} 연환 ${JSON.stringify(r2.f)} 정검 ${JSON.stringify(r2.ev)} 예약된 연환 ${r2.later}`,r2.h.p==='heavy'&&r2.h.m/r2.f.m>1.08&&r2.h.kb&&r2.f.p==='fast'&&Math.abs(r2.f.m-r2.ev.m)<.01&&r2.ev.p==='even'&&r2.ev.hm<r2.f.hm&&r2.later>0);
  // 3. 검→장 전환: 천강장을 익혔고 적이 바짝 붙으면 한 번 밀어낸다 (재사용 대기)
  const r3=await p.evaluate(()=>{P.arts.S_jongnam_1={p:40,f:[true,false,false]};const e={x:P.x+.8,y:P.y,hp:1e6,maxHp:1e6,def:0,hm:0,d:{},stun:0};P.jnPalmT=0;const n0=sched.length;jnPalm(e);const a=sched.length>n0,t1=P.jnPalmT;jnPalm(e);
    const far={...e,x:P.x+3};P.jnPalmT=0;const n1=sched.length;jnPalm(far);return{a,cd:t1>time,again:sched.length===n0+1,far:sched.length===n1,art:jnPalmArt()}});
  ok(`검→장 전환: 발동 ${r3.a} 재사용 대기 ${r3.cd} 연달아 안 됨 ${r3.again} 멀면 안 됨 ${r3.far} (${r3.art})`,r3.a&&r3.cd&&r3.again&&r3.far&&r3.art==='S_jongnam_1');
  // 4. 태을 운기: 끊지 않고 이을수록 운기 회복이 빨라진다 (태을 심법일 때만, 내공이 저절로 차지는 않는다)
  const r4=await p.evaluate(()=>{const o={};P.sims=Object.assign(P.sims||{},{N_jongnam_1:1,N_hwasan_1:1});P.sim='N_jongnam_1';P.medit=true;P.medT=0;o.t0=jnQiMul();P.medT=15;o.t15=jnQiMul();P.medT=90;o.t90=jnQiMul();P.medit=false;o.off=jnQiMul();P.sim='N_hwasan_1';P.medit=true;o.none=jnQiMul();P.medit=false;P.sim=null;return o});
  ok(`태을 운기 배율: 0초 ${r4.t0} · 15초 ${r4.t15} · 90초 ${r4.t90} · 운기 안 함 ${r4.off} · 다른 심법 ${r4.none}`,r4.t0===1&&r4.t15>1.15&&r4.t15<1.25&&Math.abs(r4.t90-1.4)<1e-9&&r4.off===1&&r4.none===1);
  // 5. 섬서 논검: 다섯 해마다 열림 → 종남 제자가 지객 장로 앞에서 나서 이기면 공적·명성·인원, 속가제자는 천하삼십육검 끝 초식까지 (kinOk·jmOk)
  const r5=await p.evaluate(()=>{P.sect='jongnam';P.realm=3;P.monk=false;G.cal=Math.ceil((G.cal+1)/5)*5;newYear();const g=ngD();const open=!!(g.open&&!g.open.done),mine=ngMine();
    const card=ngCard().includes('ngstart:jongnam'),kin0=kinOk('jongnam'),jm0=jmOk(ARTS.S_jongnam_2);ngStart();const duel=!!G.ngDuel,foe=mobs.find(m=>m.ngRep),fn=foe&&foe.name;
    const pop0=G.pop.jongnam,fame0=P.fame;duelEnd(true,foe);return{open,mine,card,kin0,jm0,duel,fn,kin1:kinOk('jongnam'),jm1:jmOk(ARTS.S_jongnam_2),pop:G.pop.jongnam>pop0,fame:P.fame>fame0,last:g.last,done:g.open.done,d:G.duel}});
  ok(`섬서 논검: 열림 ${r5.open} 나설 수 있음 ${r5.mine} 카드 ${r5.card} · 상대 ${r5.fn} · 이긴 뒤 속가 예외 ${r5.kin0}→${r5.kin1} 장문절기 ${r5.jm0}→${r5.jm1} 인원↑ ${r5.pop} 명성↑ ${r5.fame} ${JSON.stringify(r5.last)}`,
    r5.open&&r5.mine&&r5.card&&r5.duel&&/화산파 대표/.test(r5.fn)&&!r5.kin0&&r5.kin1&&!r5.jm0&&r5.jm1&&r5.pop&&r5.fame&&r5.last.w==='jongnam'&&r5.done&&!r5.d);
  // 6. 몰락한 종남 판: 인원이 기준의 52%, 장문절기 비급 없음, 75%까지 되살아나면 재건 (명성·공적)
  const r6=await p.evaluate(()=>{P.kinEx={};G.jnFall=null;const rnd=Math.random;Math.random=()=>0;P.lifeNo=2;jnFallD();Math.random=rnd;const s=SECTS.jongnam,b=popBase(s);
    const o={on:G.jnFall.on,pop:Math.round(G.pop.jongnam/b*100),lost:jnLost(),hi:jnHiOk('jongnam'),note:loreVerNote('jongnam')};G.pop.jongnam=b*.8;const f0=P.fame;newYear();o.back=G.jnFall.back;o.lost2=jnLost();o.fame=P.fame>f0;o.hi2=jnHiOk('jongnam');
    G.jnFall=null;P.lifeNo=1;jnFallD();o.life1=G.jnFall.on;return o});
  ok(`몰락한 종남: ${JSON.stringify(r6)}`,r6.on===1&&r6.pop<=52&&r6.lost&&r6.hi===false&&/절학이 끊겨/.test(r6.note)&&r6.back===1&&!r6.lost2&&r6.fame&&r6.hi2===null&&r6.life1===0);
  // 7. 본산 맵: 본산 좌우 은하관·유운관, 외원 시무관(목인장 마당)·현무관, 후산 중양궁 옛터·누관 정자, 출입구·사람에 길이 닿는다. 사범 대화
  const r7=await p.evaluate(()=>{const reach=id=>{loadRegion(id);P.reg=id;const R=REGION(),g0=R.gates.find(g=>g.y>37)||R.gates[0],seen=new Set(),q=[[Math.floor(g0.x),Math.min(NH-1,Math.floor(g0.y))]],K=(x,y)=>x+','+y;
      while(q.length){const[x,y]=q.pop();if(seen.has(K(x,y)))continue;seen.add(K(x,y));for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(walk(nx,ny)&&!seen.has(K(nx,ny)))q.push([nx,ny])}}
      const near=(fx,fy)=>{const x=Math.floor(fx),y=Math.floor(fy);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen.has(K(x+dx,y+dy)))return true;return false};
      const bad=[];for(const g of R.gates)if(!near(g.x,g.y))bad.push('문 '+g.label);for(const n of R.npcs||[])if(!near(n.x,n.y))bad.push('사람 '+n.n);return bad};
    const o={bad:[]};for(const id of['hq_jongnam','hq_jongnam_outer','hq_jongnam_back'])o.bad.push(...reach(id).map(x=>id+':'+x));
    const hn=id=>(REGIONS[id].halls||[]).map(h=>REGIONS[h.id].name);o.hq=hn('hq_jongnam');o.out=hn('hq_jongnam_outer');
    loadRegion('hq_jongnam_outer');let d=0;for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(objs[y][x]==='dummy')d++;o.dummy=d;loadRegion('hq_jongnam_back');o.ruin=builds.some(b=>b.form==='ruin');
    const npc=(id,r)=>{for(const h of REGIONS[id].halls||[]){const q=REGIONS[h.id].npcs.find(n=>n.srole===r);if(q)return q}};const sm=npc('hq_jongnam_outer','simu'),g1=npc('hq_jongnam','gw1');
    o.simu=sm&&pNpc(sm);o.gw=g1&&pNpc(g1);return o});
  ok(`본산 맵: 본산 ${r7.hq.join()} · 외원 ${r7.out.join()} · 목인장 ${r7.dummy} · 중양궁 옛터 ${r7.ruin} · 막힘 ${r7.bad.join()||'없음'}`,r7.hq.includes('은하관')&&r7.hq.includes('유운관')&&r7.out.includes('시무관')&&r7.out.includes('현무관')&&r7.dummy>=14&&r7.ruin&&!r7.bad.length);
  ok(`사범 대화: 시무관 검풍 안내 ${/내 검풍/.test(r7.simu||'')} · 은하관 길 ${/은하검법/.test(r7.gw||'')}`,/내 검풍/.test(r7.simu||'')&&/세 검관/.test(r7.simu||'')&&/은하검법.*은하성진검/.test(r7.gw||''));
  // 8. 명소: 처음 둘러보면 활력·명성(누관 설경대는 오성), 자오도 어귀는 두 번째에 사천으로 넘어간다
  const r8=await p.evaluate(()=>{const o={};P.jnSpot={};enterRegion('hq_jongnam_back',20.5,30);P.reg='hq_jongnam_back';const n=nodes.find(q=>q.id==='jn_lougwan');P.wis=5;interact({node:n});{const f=P.chan.fn;P.chan=null;f()}o.wis=P.wis;o.seen=!!P.jnSpot.jn_lougwan;
    enterRegion('hq_jongnam_gate',20.5,36);P.reg='hq_jongnam_gate';const j=nodes.find(q=>q.id==='jn_jaodo');interact({node:j});{const f=P.chan.fn;P.chan=null;f()}o.still=REG;P.silver=100;interact({node:j});{const f=P.chan.fn;P.chan=null;f()}o.to=REG;o.silver=P.silver;return o});
  ok(`명소: 누관 오성 ${r8.wis} · 자오도 첫 살핌 ${r8.still} → 두 번째 ${r8.to} 은자 ${r8.silver}`,r8.wis===6&&r8.seen&&r8.still==='hq_jongnam_gate'&&/^pv_sichuan/.test(r8.to)&&r8.silver===80);
  // 9. 그림: 본산·외원
  for(const[id,x,y,f]of[['hq_jongnam',20.5,18,'t170_hq'],['hq_jongnam_outer',20.5,18,'t170_outer'],['hq_jongnam_back',26,22,'t170_back']]){await p.evaluate(([id,x,y])=>{enterRegion(id,x,y);P.reg=id;closePanels()},[id,x,y]);await p.waitForTimeout(900);await p.screenshot({path:require('path').resolve(__dirname,'shots/'+f+'.png')})}
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}
  await b.close()})();

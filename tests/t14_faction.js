// 세력 무인(정파·사파·마교가 서로 싸움), 문파 직위, 문파 본산 지역맵과 역참
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(400);
  // 시뮬레이션: 게임 루프를 멈추고 몹 AI만 직접 돌린다
  await p.evaluate(()=>{window.sim=(sec)=>{for(let t=0;t<sec*30;t++){for(const e of mobs)updateMob(e,1/30);updateEprojs(1/30);mobs=mobs.filter(e=>e.hp>0)}};
    window.place=(fac,x,y,el,sid)=>{const e=mkFac(fac,el?1:0,x,y,sid);mobs.push(e);return e}});
  // 1) 정파와 사파 무인이 서로 싸운다 (플레이어와 멀리)
  const r1=await p.evaluate(()=>{paused=true;mobs=[];P.x=20.5;P.y=20.5;const a=place('정',22.5,33.5),b=place('사',25.5,33.5);sim(25);return{a:a.hp,b:b.hp,am:a.maxHp,bm:b.maxHp,left:mobs.length}});
  ok(`정파·사파 무인이 맞붙어 한쪽이 쓰러진다 (남은 수 ${r1.left})`,r1.left===1&&(r1.a<r1.am||r1.b<r1.bm));
  // 2) 마교는 정파와 사파 모두를 노린다
  const r2=await p.evaluate(()=>{mobs=[];const m=place('마',22.5,33.5),j=place('정',25,33.5);sim(.6);const t1=m.tgt===j;
    mobs=[];const m2=place('마',22.5,33.5),s=place('사',25,33.5);sim(.6);return{t1,t2:m2.tgt===s,s2:s.tgt===m2}});
  ok('마교도는 정파 무인을 노린다',r2.t1);ok('마교도는 사파 무인도 노리고, 사파도 맞선다',r2.t2&&r2.s2);
  // 3) 정파 플레이어: 정파 무인은 덤비지 않고, 사파·마교 무인은 덤빈다
  const r3=await p.evaluate(()=>{mobs=[];P.sect=null;P.x=20.5;P.y=31.5;const j=place('정',P.x+2.5,P.y+1);sim(1);const peace=!j.aggro&&peaceful(j)&&!foes().includes(j)&&nearest(8)!==j;
    mobs=[];const s=place('사',P.x+2.5,P.y+1);sim(.3);const sa=s.aggro&&!s.tgt;mobs=[];const m=place('마',P.x+2.5,P.y+1);sim(.3);return{peace,sa,ma:m.aggro&&!m.tgt}});
  ok('정파 무인은 정파 플레이어를 공격하지 않고, 자동 조준에서도 빠진다',r3.peace);ok('사파 무인은 정파 플레이어에게 덤빈다',r3.sa);ok('마교도도 정파 플레이어에게 덤빈다',r3.ma);
  // 4) 사파 문파에 들면 편이 바뀐다
  const r4=await p.evaluate(()=>{mobs=[];P.side='사';P.sect='hyeolrang';const s=place('사',P.x+2.5,P.y+1),j=place('정',P.x-2.5,P.y-1),m=place('마',P.x+1,P.y-2.5);
    const o={s:peaceful(s),j:!peaceful(j),m:!peaceful(m)};P.sect='cheonma';o.ms=!peaceful(s);P.side='정';P.sect=null;return o});
  ok('혈랑곡 제자에게 사파 무인은 동료, 정파·마교는 적',r4.s&&r4.j&&r4.m);ok('마교 제자에게는 사파 무인도 적',r4.ms);
  // 5) 같은 편을 치면 악업, 등을 돌린다
  const r5=await p.evaluate(()=>{mobs=[];const j=place('정',P.x+1.5,P.y),j2=place('정',P.x+3,P.y);const ev=P.evil;damage(j,5,0,0);return{angry:j.angry&&j2.angry,evil:P.evil-ev,foe:foes().includes(j)}});
  ok(`같은 편 무인을 치면 악업 +${r5.evil}, 그 무인과 주변 동도가 적이 된다`,r5.angry&&r5.evil>0&&r5.foe);
  // 6) 직위: 공적 누적으로 승급, 고급 초식 제한, 할인, 녹봉
  const r6=await p.evaluate(()=>{mobs=[];P.sect='hwasan';P.merit={};P.mtot={};const h=SECTS.hwasan.arts.find(a=>a.hi);
    const n0=rankName();addMerit('hwasan',60);const n1=rankName();P.merit.hwasan=999;P.bag=[];
    sectAct('mbuy',h.id,'2');const blocked=!P.bag.length;const c1=meritCost(h,2);
    addMerit('hwasan',130);const n2=rankName();const c2=meritCost(h,2);sectAct('mbuy',h.id,'2');const got=P.bag.length===1;
    const s0=P.silver;rankStipend();const sti=P.silver-s0;
    const m0=P.merit.hwasan;const e=place('사',P.x+9,P.y+9);e.hp=0;onKill(e);const km=P.merit.hwasan-m0;
    return{n0,n1,n2,blocked,c1,c2,got,sti,km,feat:P.feats.some(f=>f.includes('정식제자'))}});
  ok(`직위 ${r6.n0} → 공적 60에 ${r6.n1} → 180에 ${r6.n2}`,r6.n0==='속가제자'&&r6.n1==='정식제자'&&r6.n2==='일대제자'&&r6.feat);
  ok('고급 무공 셋째 초식은 일대제자부터',r6.blocked&&r6.got);ok(`일대제자는 비급 공적 할인 (${r6.c1} → ${r6.c2})`,r6.c2<r6.c1);
  ok(`해마다 녹봉 은자 ${r6.sti}`,r6.sti===30);ok(`적 세력 무인을 쓰러뜨리면 문파 공적 +${r6.km}`,r6.km>=2);
  await p.evaluate(()=>{paused=false;openPanel('char')});await p.waitForTimeout(150);
  ok('인물창에 문파 직위',await p.evaluate(()=>$('wbody').textContent.includes('화산파 일대제자')));
  await p.evaluate(()=>closePanels());
  // 7) 본산 지역맵: 문파마다 하나씩, 겹치지 않음
  const r7=await p.evaluate(()=>{const ids=Object.values(SECTS).map(hqId);const names=ids.map(i=>REGIONS[i]&&REGIONS[i].name);
    return{n:new Set(ids).size,all:ids.every(i=>REGIONS[i]&&REGIONS[i].npcs.some(n=>n.hq)),names:new Set(names).size}});
  ok(`문파 본산 ${r7.n}곳, 지명 ${r7.names}개, 모두 장문인이 있다`,r7.n===50&&r7.names===50&&r7.all);
  // 8) 모든 본산: 도착 자리 → 장문인·마부·출입구까지 길이 이어지고, 지형이 서로 다르다
  const r8=await p.evaluate(()=>{const bad=[],sig=new Set(),cur=REG;
    for(const s of Object.values(SECTS)){const id=hqId(s),R=REGIONS[id];R.gen();
      for(const g of R.gates)for(let j=Math.floor(g.y)-2;j<=Math.floor(g.y)+2;j++)for(let i=Math.floor(g.x)-2;i<=Math.floor(g.x)+2;i++)if(j>=0&&i>=0&&j<N&&i<N){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}
      const at=arriveAt(id),sx=Math.floor(at.x),sy=Math.floor(at.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];
      if(!walk(sx,sy))bad.push(s.n+' 도착');
      while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&walk(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}
      const near=(o)=>{for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(seen.has((Math.floor(o.x)+dx)+','+(Math.floor(o.y)+dy)))return true;return false};
      for(const n of R.npcs)if(!near(n))bad.push(s.n+' '+n.n);for(const g of R.gates)if(!near(g))bad.push(s.n+' 출입구');
      if(seen.size<350)bad.push(s.n+' 좁음 '+seen.size);
      sig.add(map.map(r=>r.map(t=>t.g).join('')).join('')+objs.map(r=>r.map(o=>o?1:0).join('')).join(''))}
    loadRegion(cur);return{bad,uniq:sig.size}});
  ok(`모든 본산에서 장문인·역참·출입구로 길이 이어진다 ${r8.bad.join(', ')}`,!r8.bad.length);ok(`본산 지도 ${r8.uniq}장이 모두 다르다`,r8.uniq===50);
  // 9) 개봉 역참 → 만독곡 (사파 본산): 정파 플레이어에게 제자들이 적
  const r9=await p.evaluate(()=>{const n=npcAt('post');return{walk:walk(Math.floor(n.x),Math.floor(n.y)+1)||walk(Math.floor(n.x)+1,Math.floor(n.y)),at:walk(Math.floor(POST_AT.x),Math.floor(POST_AT.y))}});
  ok('개봉 역참 마부와 도착 자리가 막혀 있지 않다',r9.walk&&r9.at);
  await p.evaluate(()=>{P.sect=null;P.silver=200;const n=npcAt('post');P.x=n.x+.9;P.y=n.y+.4;P.path=null;openNpc(n)});await p.waitForTimeout(150);
  ok('역참 창에 개봉과 50개 본산',await p.evaluate(()=>document.querySelectorAll('[data-act^="goto:"]').length===50));
  await p.screenshot({path:shot('faction_post')});
  await p.locator('[data-act="goto:hq_mandok"]').tap();await p.waitForTimeout(2500);
  const r10=await p.evaluate(()=>{for(let i=0;i<6;i++)spawnTick();const ds=mobs.filter(m=>m.sect==='mandok');return{reg:REG,name:REGION().name,silver:P.silver,ds:ds.length,nm:ds[0]&&ds[0].name,hostile:ds.every(m=>!peaceful(m)),zone:regionAt(10,10)}});
  ok(`만독곡 도착 (은자 ${r10.silver}), 만독문 제자 ${r10.ds}명 (${r10.nm}) 은 정파에게 적`,r10.reg==='hq_mandok'&&r10.silver===180&&r10.ds>=3&&r10.hostile);
  await p.evaluate(()=>{const m=REGION().npcs.find(n=>n.hq);P.x=m.x;P.y=m.y+2;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;for(const e of mobs)if(dist(e,P)<7)e.x+=0});await p.waitForTimeout(500);
  await p.screenshot({path:shot('faction_hq_mandok')});
  // 10) 화산 본산: 정파 플레이어에게 화산파 제자는 동료, 아래 산길에서 사파·마교가 쳐들어온다
  await p.evaluate(()=>{P.silver=200;const n=REGION().npcs.find(n=>n.id==='post');openNpc(n)});await p.waitForTimeout(100);
  await p.locator('[data-act="goto:hq_hwasan"]').tap();await p.waitForTimeout(2500);
  const r11=await p.evaluate(()=>{for(let i=0;i<8;i++)spawnTick();const own=mobs.filter(m=>m.sect==='hwasan'),inv=mobs.filter(m=>m.d.fac&&m.d.fac!=='정');return{own:own.length,peace:own.every(peaceful),inv:inv.length,kinds:[...new Set(inv.map(m=>m.kind))].join('·')}});
  ok(`화산 본산: 화산파 제자 ${r11.own}명은 동료, 침입자 ${r11.inv}명 (${r11.kinds})`,r11.own>=4&&r11.peace&&r11.inv>=2);
  await p.evaluate(()=>{const m=REGION().npcs.find(n=>n.hq);P.x=m.x;P.y=m.y+3;P.hp=P.maxHp*50;P.maxHp*=50;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;
    const inv=mobs.filter(m=>m.d.fac&&m.d.fac!=='정');inv.forEach((e,i)=>{e.x=19+i;e.y=15;e.home={x:e.x,y:e.y}})});
  await p.waitForTimeout(3500);await p.screenshot({path:shot('faction_hq_fight')});
  // 11) 숭산은 소림사 본산
  const r12=await p.evaluate(()=>{const R=REGIONS.sungsan;return{name:R.name,m:R.npcs.find(n=>n.hq).n}});
  ok(`숭산 = ${r12.name}, ${r12.m}`,r12.name==='숭산 소림사'&&r12.m==='소림사 방장');
  // 12) 개봉 남쪽: 정파·사파 순찰대가 실제 게임 루프에서 맞붙는다
  await p.evaluate(()=>{P.silver=50;const n=REGION().npcs.find(n=>n.id==='post');openNpc(n)});await p.waitForTimeout(100);
  await p.locator('[data-act="goto:gaebong"]').tap();await p.waitForTimeout(2000);
  await p.evaluate(()=>{mobs=mobs.filter(m=>!m.d.fac);place('정',19.5,33.5);place('정',20.5,34.5);place('사',23.5,33.5);place('사',24,34.5);place('마',21.5,31);P.x=21.5;P.y=29;P.path=null;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});
  await p.waitForTimeout(2200);await p.screenshot({path:shot('faction_skirmish')});
  const r13=await p.evaluate(()=>mobs.filter(m=>m.d.fac).some(m=>m.hp<m.maxHp));
  ok('개봉 남쪽 초원에서 세 세력 무인이 서로 싸운다',r13);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

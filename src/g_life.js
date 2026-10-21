// ================= town people =================
const NPCS=GD.NPCS;
const npcAt=id=>NPCS.find(n=>n.id===id);
// 지금 지역의 사람들: 개봉은 마을 사람, 본산은 장문인과 역참 마부 (REGIONS[..].npcs)
const npcsHere=()=>REG==='gaebong'?NPCS:(REGION().npcs||[]);
let dlg=null;
// ================= update =================
let spawnT=0,saveT=30,lastYear=8;
// 배열을 새로 만들지 않고 그 자리에서 거른다 (매 틱 mobs·fx·texts·drops를 filter로 새로 만들던 것)
function prune(a,ok){let j=0;for(let i=0;i<a.length;i++)if(ok(a[i]))a[j++]=a[i];a.length=j;return a}
function dust(e,dt){if(!e.moving||!(e.hp>0))return;e.dustT=(e.dustT||0)-dt;if(e.dustT<=0){fx.push({t:'dust',x:e.x-.1,y:e.y-.1,life:.45});e.dustT=.24}}
function update(dt){
  time+=dt;shake=Math.max(0,shake-dt);trainTick(dt);tombTick();gateTick(dt);
  // calendar, age, weather, day
  G.cal+=dt/YEAR_SEC;P.age+=dt/YEAR_SEC;tod=(tod+dt/DAY_SEC)%1;
  if(Math.floor(P.age)>lastYear){lastYear=Math.floor(P.age);newYear()}
  runHooks('tick',dt);
  G.wT-=dt;if(G.wT<=0){G.wT=22+Math.random()*12;const tb=WEATHER[season()];let r=Math.random();for(const[w,p]of tb){if(r<p){if(w!==G.weather)log(`날씨가 ${w}(으)로 바뀌었습니다.`,'info');G.weather=w;break}r-=p}}
  // 맵에 저절로 생기던 기연 터는 없앴다 (v157, 사용자 2026-10-20): 기연은 소문으로 찾는 기연동굴에서 만난다 (g_gyc.js)
  spawnT-=dt;if(spawnT<=0){spawnT=2;spawnTick()}
  saveT-=dt;if(saveT<=0){saveT=30;saveGame()}
  for(const p of GAE_PLOTS||plots)growPlot(p,dt);
  for(const n of nodes)n.cd=Math.max(0,n.cd-dt);
  if(P.hp>0)updateP(dt);
  for(const e of mobs)updateMob(e,dt);
  prune(mobs,e=>e.hp>0);
  for(const a of allies)updateAlly(a,dt);
  dust(P,dt);for(const e of mobs)dust(e,dt);for(const e of allies)dust(e,dt);
  if(P.hp>0)prune(drops,d=>!(dist(d,P)<.6&&pickUp(d)));
  updateProjs(dt);updateEprojs(dt);
  if(sched.length){for(const q of sched)q.t-=dt;if(sched.some(q=>q.t<=0)){const due=sched.filter(q=>q.t<=0);sched=sched.filter(q=>q.t>0);if(P.hp>0)due.forEach(q=>q.f())}}
  for(const f of fx)f.life-=dt;prune(fx,f=>f.life>0);
  for(const t of texts)t.life-=dt;prune(texts,t=>t.life>0);
  const t=iso(P.x,P.y);cam.x+=(t.x-cam.x)*Math.min(1,dt*8);cam.y+=(t.y-cam.y)*Math.min(1,dt*8);
}
function updateP(dt){
  for(let i=0;i<6;i++)P.fcd[i]=Math.max(0,P.fcd[i]-dt);for(const k in P.scd)P.scd[k]=Math.max(0,P.scd[k]-dt);
  for(const k of['bcd2','gcd','bcd','ucd','swing','palm','inv','hit','flash','jump','satk','sj'])P[k]=Math.max(0,P[k]-dt);
  for(const k of['atk','hm','crit','ult'])P.buff[k]=Math.max(0,(P.buff[k]||0)-dt);
  P.lastHit+=dt;
  if(P.poison>0){P.poison-=dt;P.hp-=P.maxHp*.02*dt;if(P.hp<=0){P.hp=0;die('독');return}}
  if(P.run){P.qi-=4*dt;if(P.qi<=0){P.qi=0;P.run=false;log('내공이 바닥나 질주를 멈춥니다.','info')}}
  // 내공은 저절로 차지 않는다: 운기조식(P.medit)과 회복약으로만 (사용자 결정 2026-10-13)
  if(P.medit)P.qi=Math.min(P.maxQi,P.qi+qiRegen()*dt);
  if(P.lastHit>4)P.hp=Math.min(P.maxHp,P.hp+(1+P.st.qi*.2)*(P.medit?3:1)*(1+pv('hreg')+simTv('hreg')/100)*dt);
  if(P.medit)gainPas(.5*dt);   // 운기조식하면 패시브 숙련이 오른다
  if(P.chan){P.chan.t+=dt;if(P.chan.t>=P.chan.dur){const c=P.chan;P.chan=null;c.fn()}}
  let kx=0,ky=0;
  if(keys.arrowup){kx--;ky--}if(keys.arrowdown){kx++;ky++}if(keys.arrowleft){kx--;ky++}if(keys.arrowright){kx++;ky--}
  if(joy.on){kx+=joy.gx;ky+=joy.gy}
  P.moving=false;const sp=moveSpd()*dt;P.runT=Math.max(0,(P.runT||0)-dt);
  if(P.leap){const L=P.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur),e=k<.5?2*k*k:1-2*(1-k)*(1-k);P.x=L.sx+(L.ex-L.sx)*e;P.y=L.sy+(L.ey-L.sy)*e;P.z=(L.z0||0)+((L.z1||0)-(L.z0||0))*e;
    if(Math.random()<dt*20)fx.push({t:'ghost',x:P.x,y:P.y,life:.25,col:'170,200,255'});
    if(k>=1){P.leap=null;if(!L.to)fx.push({t:'dust',x:P.x-.1,y:P.y-.1,life:.45});leapLand(L);ggLand(L)}}
  else if(P.perch){perchMove(kx,ky,sp)}
  else if(kx||ky){P.path=null;P.target=null;P.talk=null;const l=Math.hypot(kx,ky);P.fx=kx/l;P.fy=ky/l;moveEnt(P,P.fx*sp,P.fy*sp);P.moving=true}
  else{
    if(P.target){const e=P.target;
      if(e.hp<=0)P.target=null;
      else{const rr=P.mode==='auto'?autoReach():CLASS[hasWeaponFor(curCls())?curCls():'권'].reach;
        if(dist(e,P)<rr-.05){P.path=null;face(e.x,e.y);if(P.mode==='auto')autoAttack(e);else basicStrike(e)}
        else if(!P.path||!P.path.length||P.repath<=0){P.path=findPath(Math.floor(P.x),Math.floor(P.y),Math.floor(e.x),Math.floor(e.y));P.repath=.35}
        P.repath-=dt}}
    if(P.talk&&dist(P.talk,P)<1.7){const n=P.talk;P.talk=null;P.path=null;openNpc(n)}
    if(P.goal&&dist(P.goal,P)<1.3){const g=P.goal;P.goal=null;P.path=null;interact(g)}
    if(P.path&&P.path.length>1){const a=P.path[0],b=P.path[1];if(Math.hypot(b.x-P.x,b.y-P.y)<Math.hypot(b.x-a.x,b.y-a.y))P.path.shift()}
    let left=sp;while(left>1e-4&&P.path&&P.path.length){const n=P.path[0],dx=n.x-P.x,dy=n.y-P.y,l=Math.hypot(dx,dy);
      if(l<1e-3){P.path.shift();continue}P.fx=dx/l;P.fy=dy/l;const m=Math.min(l,left);P.x+=P.fx*m;P.y+=P.fy*m;left-=m;P.moving=true;if(m>=l)P.path.shift()}
  }
  if(P.moving){P.runT=.14;P.runPh=(P.runPh||0)+dt;P.medit=false;if(P.chan&&!P.chan.walk)P.chan=null}else if(P.runT<=0)P.runPh=0;
  if(P.ride){P.ride.x=P.x;P.ride.y=P.y;P.ride.fx=P.fx;P.ride.fy=P.fy;P.ride.moving=P.moving}
  if(G.duel&&!G.ldDuel&&!G.acadDuel&&dist(P,ARENA)>ARENA.r+1.2){log('비무대를 벗어나 비무에서 졌습니다.','dmg');duelEnd(false)}   // ldDuel: 교주 비무는 신전 마당이 비무대 (g_magyo3.js)
}
function autoReach(){const a=art();if(!hasWeaponFor(a.cls))return CLASS.권.reach;const s=A(a.id);let r=CLASS[a.cls].reach;
  a.forms.forEach((f,i)=>{if(s.f[i]&&P.fcd[i]<=0&&P.qi>=f.qi)r=Math.max(r,Math.min(engage(f),5))});return Math.min(r,a.cls==='궁'?6:3)}
// 자동초식: chain the learned forms in order, falling back to a plain strike.
// 필살기는 자동으로 안 쓴다 (사용자 요청 2026-10-13): S 키·터치 필살 버튼으로만. 연속기 끝에 직접 쓰는 손맛을 남긴다.
function autoAttack(e){
  if(P.gcd>0)return;const a=art(),s=A(a.id),ch=P.chain,live=time-ch.t<1.7;
  for(let i=0;i<a.forms.length;i++){if(live&&i<=ch.last)continue;if(s.f[i]&&formReady(i)&&dist(e,P)<engage(a.forms[i])+.2){useForm(i,true);return}}
  basicStrike(e);
}
function moveEnt(e,dx,dy){const r=.22;if(walkAt(e.x+dx+Math.sign(dx)*r,e.y))e.x+=dx;if(walkAt(e.x,e.y+dy+Math.sign(dy)*r))e.y+=dy}
function findPath(sx,sy,tx,ty,lim=1400){lim*=Math.max(1,N*NH/1600);
  if(!walk(tx,ty)){let best=null,bd=9;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]])if(walk(tx+a,ty+b)){const d=Math.hypot(tx+a-sx,ty+b-sy);if(d<bd){bd=d;best=[tx+a,ty+b]}}if(!best)return null;[tx,ty]=best}
  const k=(x,y)=>y*N+x,g=new Map([[k(sx,sy),0]]),came=new Map,closed=new Set,open=[[sx,sy,0]];let it=0;
  while(open.length&&it++<lim){
    let bi=0;for(let i=1;i<open.length;i++)if(open[i][2]<open[bi][2])bi=i;
    const[x,y]=open.splice(bi,1)[0],ck=k(x,y);if(closed.has(ck))continue;
    if(x===tx&&y===ty){const p=[];let c=ck;while(c!==k(sx,sy)){p.unshift({x:c%N+.5,y:Math.floor(c/N)+.5});c=came.get(c)}return p}
    closed.add(ck);
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx=x+dx,ny=y+dy,nk=k(nx,ny);if(!walk(nx,ny)||closed.has(nk))continue;if(dx&&dy&&(!walk(x+dx,y)||!walk(x,y+dy)))continue;
      const ng=g.get(ck)+(dx&&dy?1.414:1);if(ng<(g.get(nk)??1e9)){came.set(nk,ck);g.set(nk,ng);open.push([nx,ny,ng+Math.hypot(tx-nx,ty-ny)])}}
  }
  return null;
}
function wander(e,dt,test){
  e.wt-=dt;if(e.wt<=0||!e.goal){e.wt=2+Math.random()*4;e.goal=null;
    if(Math.random()<.6)for(let t=0;t<8;t++){const x=e.x+(Math.random()-.5)*6,y=e.y+(Math.random()-.5)*6;if(walkAt(x,y)&&(!test||test(Math.floor(x),Math.floor(y)))&&Math.hypot(x-e.home.x,y-e.home.y)<9){e.goal={x,y};break}}}
  e.moving=false;if(e.goal){const dx=e.goal.x-e.x,dy=e.goal.y-e.y,l=Math.hypot(dx,dy);if(l<.15){e.goal=null;return}const sp=e.sp*.45*dt;e.fx=dx/l;e.fy=dy/l;const ox=e.x,oy=e.y;moveEnt(e,e.fx*sp,e.fy*sp);if(ox===e.x&&oy===e.y)e.goal=null;else e.moving=true}
}
function chase(e,tg,dt,spd){
  const d=dist(e,tg);let tx=tg.x,ty=tg.y;
  if(d>1.6){e.rp=(e.rp||0)-dt;const pt=Math.floor(tg.x)+','+Math.floor(tg.y);
    if(e.rp<=0||!e.path||e.pt!==pt){e.rp=.5+Math.random()*.3;e.pt=pt;e.path=findPath(Math.floor(e.x),Math.floor(e.y),Math.floor(tg.x),Math.floor(tg.y),600)}
    while(e.path&&e.path.length&&Math.hypot(e.path[0].x-e.x,e.path[0].y-e.y)<.35)e.path.shift();
    if(e.path&&e.path.length>1){tx=e.path[0].x;ty=e.path[0].y}}
  const dd=Math.hypot(tx-e.x,ty-e.y)||1,dx=(tx-e.x)/dd,dy=(ty-e.y)/dd;e.fx=dx;e.fy=dy;moveEnt(e,dx*spd*dt,dy*spd*dt);e.moving=true;
}
function updateMob(e,dt){runHooks('mobTick',e,dt);
  if(e.hp<=0)return;const d=e.d;
  e.hit=Math.max(0,e.hit-dt);if(e.swing>0&&e.swing<=dt)e.rec=.22;e.swing=Math.max(0,e.swing-dt);e.rec=Math.max(0,(e.rec||0)-dt);e.slow=Math.max(0,e.slow-dt);e.bind=Math.max(0,(e.bind||0)-dt);e.nohe=Math.max(0,e.nohe-dt);
  if(e.burn>0){e.burn-=dt;e.hp-=e.burnD*dt;if(Math.random()<dt*8)fParts(null,e,'255,140,60',2,40,'dot',.5);if(e.hp<=0){onKill(e);return}}
  if(e.psn>0){e.psn-=dt;e.hp-=e.psnD*dt;if(Math.random()<dt*6)fParts(null,e,'120,220,90',2,30,'dot',.5);if(e.hp<=0){onKill(e);return}}
  e.x+=e.kb.x*dt*6;e.y+=e.kb.y*dt*6;if(!walkAt(e.x,e.y)){e.x-=e.kb.x*dt*6;e.y-=e.kb.y*dt*6}e.kb.x*=.8;e.kb.y*=.8;
  if(e.stun>0){e.stun-=dt;e.wind=0;e.moving=false;return}
  const spd=e.sp*(e.slow>0?.6:1)*(e.bind>0?.15:1);
  if(e.flee>0){e.flee-=dt;const f=e.fleeFrom||P,dx=e.x-f.x,dy=e.y-f.y,l=Math.hypot(dx,dy)||1;e.fx=dx/l;e.fy=dy/l;moveEnt(e,e.fx*spd*1.1*dt,e.fy*spd*1.1*dt);e.moving=true;return}
  if(d.villager){if(!e.angry)wander(e,dt,inTown);else wander(e,dt);return}
  // aggro: hostile mobs notice the hero (or a companion) nearby; everyone gives up past their leash
  if(G.duel&&!e.duel){e.aggro=false;wander(e,dt);return}
  // 세력 무인: 적 세력 무인을 찾아 싸우고, 같은 편 플레이어에게는 덤비지 않는다 (g_faction.js)
  if(d.fac){if(e.tgt&&e.tgt.hp<=0){e.tgt=null;e.aggro=false}facScan(e,dt)}
  const hostP=d.fac?mobFoeP(e):d.hostile;
  let tg=e.tgt&&e.tgt.hp>0?e.tgt:P;
  if(tg===P&&!hostP&&e.aggro){e.aggro=false;e.tgt=null}
  if(!e.aggro&&hostP&&P.hp>0&&!(P.perch&&e.giveUp>time)&&!(e.lost>time)){if(dist(e,P)<(d.aggro||6)*(P.perch&&P.perch.k==='tree'?.5:1)&&!inTown(Math.floor(P.x),Math.floor(P.y)))e.aggro=true;else for(const a of allies)if(a.hp>0&&a!==P.ride&&dist(e,a)<(d.aggro||6)*.7){e.aggro=true;e.tgt=a;tg=a;break}}
  // 줄(leash): 집에서 15칸 넘게 끌려가면 돌아간다. v111: 방금 맞은 몹(5초 안)은 제자리를 새 집으로 삼아 싸우고, 돌아갈 때의 회복은 한 번만 (리젠돼 걸어오는 몹이 맞을 때마다 30% 차던 '무적' 버그)
  if(e.aggro&&Math.hypot(e.x-e.home.x,e.y-e.home.y)>15&&time-(e.hurtAt||-9)<5)e.home={x:e.x,y:e.y};
  if(e.aggro&&(Math.hypot(e.x-e.home.x,e.y-e.home.y)>15||P.hp<=0&&!tg.isMob||inTown(Math.floor(tg.x),Math.floor(tg.y))&&!e.duel)){e.aggro=false;e.tgt=null;e.goal={x:e.home.x,y:e.home.y};if(time-(e.healAt||-99)>20){e.healAt=time;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.3)}}
  if(!e.aggro){if(!e.nohe)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02*dt);wander(e,dt);return}
  if(tg===P&&P.ride&&Math.random()<.002)tg=P;
  const dd=dist(e,tg),reach=e.reach;
  // 높은 곳의 사람에게는 맨손·병장기가 닿지 않는다: 아래에서 맴돌다 오래 못 닿으면 돌아간다
  if(tg===P&&P.perch&&!d.ranged&&!e.wind&&!(e.slam>0)){e.perchT=(e.perchT||0)+dt;
    if(e.perchT>6&&!d.boss){e.aggro=false;e.tgt=null;e.perchT=0;e.giveUp=time+10;e.goal={x:e.home.x,y:e.home.y};return}
    if(dd>1.6)chase(e,tg,dt,spd);else{e.moving=false;e.fx=(tg.x-e.x)/(dd||1);e.fy=(tg.y-e.y)/(dd||1)}return}
  if(tg===P&&!P.perch)e.perchT=0;
  // telegraphed heavy move for bosses and duelists
  if(d.boss||e.duel||d.elite){e.skT-=dt;if(e.skT<=0&&dd<6&&!e.wind){e.skT=5+Math.random()*3;mobFormCall(e);
    if(d.ranged||(e.duel&&e.d.ranged)){for(let i=-1;i<=1;i++){const a=Math.atan2(tg.y-e.y,tg.x-e.x)+i*.25;eprojs.push({x:e.x,y:e.y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,left:7,dmg:e.atk*.9,src:e,c:'255,200,140'})}}
    else{e.slam=1.1;e.slamAt={x:tg.x,y:tg.y};fx.push({t:'warn',x:tg.x,y:tg.y,r:2,life:1.1,max:1.1})}}}
  if(e.slam>0){e.slam-=dt;e.moving=false;if(e.slam<=0){const c=e.slamAt;fx.push({t:'puff',x:c.x,y:c.y,life:.6});shake=.25;fRing(null,c,2,'255,120,80',4,.35);
    if(hostP){if(dist(P,c)<2&&!P.perch)hurtP(e.atk*1.6,e);for(const a of allies)if(dist(a,c)<2)hurtAlly(a,e.atk*1.6)}
    if(d.fac)for(const o of mobs)if(o.hp>0&&o.d.fac&&facFoe(o.d.fac,d.fac)&&dist(o,c)<2)mobHurt(o,e.atk*1.6,e)}return}
  if(e.wind>0){e.wind-=dt;if(e.wind<=0){e.cd=d.boss?1.3:1.25;e.swing=.24;
      if(d.ranged){const ux=dd>1e-3?(tg.x-e.x)/dd:(e.fx||1),uy=dd>1e-3?(tg.y-e.y)/dd:(e.fy||0);eprojs.push({x:e.x,y:e.y,vx:ux*10,vy:uy*10,left:reach+1,dmg:e.atk,src:e,c:'230,210,160'})}   // 겹쳐 선 상대(dd 0)는 바라보는 쪽으로: NaN 화살 방지
      else if(dist(e,tg)<reach+.3){if(tg===P)hurtP(e.atk,e);else if(tg.isMob)mobHurt(tg,e.atk,e);else hurtAlly(tg,e.atk)}}
    return}
  e.cd-=dt;e.moving=false;
  if(dd<reach){if(e.cd<=0)e.wind=d.boss?.5:.4;e.fx=(tg.x-e.x)/(dd||1);e.fy=(tg.y-e.y)/(dd||1)}
  else chase(e,tg,dt,spd*(dd>9?1.3:1));
  for(const o of mobs)if(o!==e&&o.hp>0){const q=dist(o,e);if(q<.6&&q>0)moveEnt(e,(e.x-o.x)/q*.02,(e.y-o.y)/q*.02)}
}
function updateEprojs(dt){
  for(const q of eprojs){q.x+=q.vx*dt;q.y+=q.vy*dt;if(!isFinite(q.x)||!isFinite(q.y)){q.left=0;continue}q.left-=Math.hypot(q.vx,q.vy)*dt;if(blockedAt(q.x,q.y)&&!(P.perch&&dist(q,P)<2.2))q.left=0;
    const sf=q.src&&q.src.d&&q.src.d.fac,hp=!sf||mobFoeP(q.src);
    if(hp&&q.left>0&&dist(q,P)<.45&&P.hp>0){q.left=0;hurtP(q.dmg,q.src)}
    if(hp)for(const a of allies)if(q.left>0&&a!==P.ride&&dist(q,a)<.45){q.left=0;hurtAlly(a,q.dmg)}
    if(sf)for(const o of mobs)if(q.left>0&&o!==q.src&&o.hp>0&&o.d.fac&&facFoe(o.d.fac,sf)&&dist(q,o)<.45){q.left=0;mobHurt(o,q.dmg,q.src)}}
  eprojs=eprojs.filter(q=>q.left>0);
}
// ================= companions: tamed beasts and disciples =================
function hurtAlly(a,dm){if(a.hp<=0||a===P.ride)return;a.hp-=dm;a.hit=.15;addText(a.x,a.y,Math.round(dm),'#e0a05a');if(a.hp<=0){a.hp=0;log(`${a.name}이(가) 쓰러졌습니다.`,'dmg');allies.splice(allies.indexOf(a),1)}}
function updateAlly(a,dt){
  if(a.hp<=0||a===P.ride)return;a.hit=Math.max(0,a.hit-dt);if(a.swing>0&&a.swing<=dt)a.rec=.22;a.swing=Math.max(0,(a.swing||0)-dt);a.rec=Math.max(0,(a.rec||0)-dt);a.cd-=dt;
  if(a.mode==='wait'){a.moving=false;a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.04*dt);return}
  a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.004*dt);
  let tg=P.target&&P.target.hp>0&&!P.target.d.villager&&!peaceful(P.target)&&dist(P.target,a)<9?P.target:null;
  if(!tg)for(const m of mobs)if(m.hp>0&&m.aggro&&!m.d.villager&&!peaceful(m)&&dist(m,P)<5){tg=m;break}
  if(G.duel)tg=null;
  if(tg){const d=dist(a,tg);if(d<a.reach){a.moving=false;a.fx=(tg.x-a.x)/d;a.fy=(tg.y-a.y)/d;if(a.cd<=0){a.cd=1.1;a.swing=.24;const dm=Math.max(1,Math.round(a.atk*(.9+Math.random()*.2)-tg.def));damage(tg,dm,.2,0,a);if(!tg.tgt||Math.random()<.3)tg.tgt=a}}
    else chase(a,tg,dt,a.sp);return}
  const d=dist(a,P);if(d>12){a.x=P.x-P.fx;a.y=P.y-P.fy;if(!walkAt(a.x,a.y)){a.x=P.x;a.y=P.y}}
  if(d>2.2)chase(a,P,dt,Math.max(a.sp,moveSpd()*.95));else a.moving=false;
}
function rideToggle(){
  if(P.ride){const h=P.ride;P.ride=null;h.x=P.x+.5;h.y=P.y;if(!walkAt(h.x,h.y))h.x=P.x;log('말에서 내렸습니다.','sys');return}
  const h=allies.find(a=>a.d&&a.d.ride&&dist(a,P)<3);if(!h){log('가까이 길들인 말이 없습니다.','info');return}
  P.ride=h;h.mode='follow';log(`${h.name}에 올라탔습니다. 이동이 빨라지고 말 위에서도 경공을 쓸 수 있습니다.`,'sys');
}
// ================= 경공: 질주 and 도약 (also over roofs and walls) =================
function leap(){
  if(P.hp<=0)return;ggInit();if(!P.gkcur){if(!P.perch)log('아직 익힌 경공이 없습니다.','info');return}const st=ggNext(),qi=ggQi(st);if(P.leap&&st===1)return;if(P.qi<qi){log('내공이 부족합니다.','info');return}
  // 조이스틱을 기울이고 있으면 그쪽으로 뛴다
  if(joy.on&&(joy.gx||joy.gy)){P.fx=joy.gx;P.fy=joy.gy}
  const LEAP=leapRange()*GG_LEN[ggOf().g]*ggLenMul()*(st===2?1.4:st===3?2:1);let land=null,to=null;
  // 지붕·나무 위로 (말을 탔으면 못 오른다). v154 (사용자): 오르는 건 1단뿐, 2·3단은 이동기라 나무·지붕을 노리지 않고 땅으로 뛴다
  if(!P.ride&&st===1){const pc=leapPerch(LEAP);if(pc){land={x:pc.x,y:pc.y};to=pc.q}}
  const ok=(nx,ny)=>nx>.3&&ny>.3&&nx<N-.3&&ny<NH-.3&&walkAt(nx,ny)&&walkAt(nx+.2,ny)&&walkAt(nx-.2,ny)&&walkAt(nx,ny+.2)&&walkAt(nx,ny-.2);
  for(let d=LEAP;d>(P.perch?.6:.2)&&!land;d-=.1)for(const o of[0,.5,-.5,.9,-.9]){const nx=P.x+P.fx*d-P.fy*o,ny=P.y+P.fy*d+P.fx*o;if(ok(nx,ny)){land={x:nx,y:ny};break}}
  if(!land){log('뛰어내릴 곳이 없습니다.','info');return}
  const dur=heroSprite()?[.6,.7,.5][st-1]:.42;P.qi-=qi;P.inv=dur;P.path=null;P.target=null;P.chan=null;if(heroSprite()&&!P.ride){P.sj=P.sjMax=dur;P.sjSt=st;P.satk=0}else{P.jump=.35}
  P.leap={sx:P.x,sy:P.y,ex:land.x,ey:land.y,t:0,dur,z0:P.z||0,z1:to?to.z:0,to,st};ggUsed(st,dur);
  if(st>=2){addText(P.x,P.y-.4,`경공 ${st}단`,st===3?'#8fd0ff':'#cfe3ff');for(let i=0;i<3;i++)fx.push({t:'ghost',x:P.x,y:P.y,life:.3+i*.1,col:st===3?'80,160,255':'190,220,255'})}P.perch=null;P.medit=false;fx.push({t:'dust',x:P.x-.1,y:P.y-.1,life:.45});
}
// ================= 생활: gathering, farming, crafting =================
function interact(t){
  if(!t)return;
  if(t.house){openHouse();return}
  if(t.plot){plotAction(t.plot);return}
  const n=t.node;if(!n)return;
  if(n.cd>0){log(n.t==='chest'||n.t==='cchest'?'비어 있는 상자입니다.':n.t==='corpse'||n.t==='rubble'?'이미 뒤진 자리다.':'아직 다시 자라지 않았습니다.','info');return}
  if(n.t==='vault'){P.chan={t:0,dur:sectPop(n.sect)<=0?VAULT.ruinDur:VAULT.steal.dur,label:vaultLabel(n),fn:()=>vaultOpen(n)};return}   // 문파 금고 (g_vault.js)
  if(n.t==='corpse'||n.t==='rubble'){P.chan={t:0,dur:RUIN.dur[n.t],label:n.t==='corpse'?'시체를 뒤진다':'잔해를 뒤진다',fn:()=>ruinLoot(n)};return}   // 폐허 약탈품 (g_ruin.js)
  if(n.t==='cchest'){P.chan={t:0,dur:CV.open,label:'상자를 연다',fn:()=>caveChestOpen(n)};return}   // 동굴 보물상자 (g_cave.js)
  if(n.t==='gybox'){gycOpen(n);return}   // 기연동굴 안쪽 상자 (g_gyc.js)
  if(n.t==='chest'){if(P.chest){log('이번 생의 기연은 이미 얻었습니다.','info');return}P.chest=1;n.cd=99999;giyeon('chest');return}
  const L={herb:['약초를 캔다',1.2],ore:['광석을 캔다',1.8],wood:['나무를 벤다',1.6],fish:['잉어를 낚는다',2.2]}[n.t];
  P.chan={t:0,dur:L[1],label:L[0],fn:()=>{
    if(n.t==='herb'){const k=R1(1,2);addMat('약초',k);log(`약초 ${k}개를 캤습니다.`,'sys');n.cd=40;snowSam()}
    else if(n.t==='ore'){const k=R1(1,2);addMat('광석',k);log(`광석 ${k}개를 캤습니다.`,'sys');n.cd=55}
    else if(n.t==='wood'){const k=R1(1,3);addMat('목재',k);log(`목재 ${k}개를 얻었습니다.`,'sys');n.cd=45}
    else{if(Math.random()<.55){addMat('잉어');log('황하 잉어를 낚았습니다.','sys')}else log('놓쳤습니다.','info');n.cd=6}}};
}
function nearestThing(r=1.6){
  let best=null,bd=r;const consider=(o,d)=>{if(d<bd){bd=d;best=o}};
  for(const n of nodes)if(n.t!=='chest'||!P.chest)consider({node:n},dist(n,P));
  for(const p of plots)consider({plot:p},Math.hypot(p.x+.5-P.x,p.y+.5-P.y));
  for(const n of npcsHere())consider({npc:n},dist(n,P)*.9);
  if(REG==='gaebong'){
  if(G.house&&G.house.built){const h=houseDoor();consider({house:1},dist(h,P))}
  if(P.spouse&&G.house&&G.house.built){const s=spousePos();consider({spouse:1},dist(s,P))}}
  return best;
}
function useNearest(){
  const t=nearestThing();if(!t){const e=P.target&&P.target.d.beast?P.target:null;if(e){tame(e);return}log('주변에 할 일이 없습니다.','info');return}
  if(t.npc)openNpc(t.npc);else if(t.house)openHouse();else if(t.spouse)familyTalk();else interact(t);
}
function plotAction(p){
  if(p.crop&&p.g>=1){const c=CROPS[p.crop];let k=R1(2,4);if(c.season&&season()===c.season)k+=2;addMat(p.crop,k);log(`${p.crop} ${k}개를 거뒀습니다.`,'xp');gainVit(3);p.crop=null;p.g=0;return}
  if(p.crop){log(`${p.crop}이(가) ${Math.floor(p.g*100)}% 자랐습니다. (${CROPS[p.crop].d})`,'info');return}
  const seeds=Object.keys(CROPS).filter(c=>P.mats[CROPS[c].seed]>0);
  if(!seeds.length){log('씨앗이 없습니다. 잡화상이나 포목점에서 사세요.','info');return}
  const c=seeds.includes(P.lastSeed)?P.lastSeed:seeds[0];P.mats[CROPS[c].seed]--;p.crop=c;p.g=0;p.dead=0;P.lastSeed=c;log(`${c}을(를) 심었습니다. ${CROPS[c].d}.`,'sys');
}
function growPlot(p,dt){
  if(!p.crop||p.g>=1)return;const c=CROPS[p.crop];let m=c.like[G.weather]??1;if(c.season&&season()===c.season)m*=1.5;if(season()==='겨울'&&p.crop!=='보리')m*=.4;
  if(m===0){p.dead+=dt;if(p.dead>8){log(`${p.crop}이(가) 눈에 얼어 죽었습니다.`,'dmg');p.crop=null;p.g=0}return}
  p.g=Math.min(1,p.g+dt/c.t*m);if(p.g>=1&&dist({x:p.x,y:p.y},P)<12)log(`${p.crop}이(가) 다 자랐습니다.`,'info');
}
function craft(r){
  const j=P.jobs[r.job];if(!j.on){log(`${JOBS[r.job].n} 기술을 익히지 않았습니다.`,'info');return}
  if(r.min&&j.lv<r.min){log(`${JOBS[r.job].n} 수련도 ${r.min}이 필요합니다.`,'info');return}
  if(r.at==='smith'&&dist(npcAt('smith'),P)>5&&!(G.house&&G.house.built&&dist(houseDoor(),P)<4)){log('대장일은 대장간이나 내 집에서만 할 수 있습니다.','info');return}
  if(!hasMats(r.need)){log('재료가 부족합니다.','info');return}
  if(r.make(1).item===undefined&&!r.make(1).mat&&P.bag.length>=24){log('행낭이 가득 찼습니다.','info');return}
  useMats(r.need);const q=clamp(.6+j.lv/100*.85+Math.random()*.2,.5,1.6),out=r.make(q);
  if(out.mat){addMat(out.mat,out.n);log(`${out.mat} ${out.n}개를 만들었습니다.`,'sys')}else{P.bag.push(out);log(`${itemLabel(out)}을(를) 만들었습니다.`,'xp')}
  const g=2.2*(1-j.lv/115);j.lv=Math.min(100,j.lv+g);gainVit(1);renderOpen();
}
function useCon(k){const c={k,done:false};runHooks('useCon',c);if(!c.done)useConBase(k)}
function useConBase(k){
  if(!(P.mats[k]>0)){log(`${k}이(가) 없습니다.`,'info');return}if(P.hp<=0)return;
  if(k==='해독단'){if(!P.poison){log('중독되지 않았습니다.','info');return}P.poison=0}
  else if(k==='대환단'){if(P.dhw>=3){log('대환단은 한 생에 세 번까지만 효험이 있습니다.','info');return}P.dhw++;P.qiBonus+=15;recalc()}
  else if(k==='금창약'||k==='주먹밥')P.hp=Math.min(P.maxHp,P.hp+P.maxHp*(k==='금창약'?.4:.35));
  else if(k==='소환단'||k==='보리죽')P.qi=Math.min(P.maxQi,P.qi+P.maxQi*(k==='소환단'?.5:.4));
  else if(k==='고기볶음'){P.buff.atk=90;P.buff.atkV=.15}else if(k==='잉어찜')P.buff.hm=90;
  P.mats[k]--;addText(P.x,P.y,k,'#a6d47f');fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:.6});renderOpen();
}
// ================= 나이 and 윤회 =================
// 해를 한꺼번에 보낸다(폐관·창안·옥살이): 해마다 newYear를 부르고, 도중에 죽으면 멈춘다. 살아 있으면 true
function passYears(yrs){P.age+=yrs;G.cal+=yrs;while(Math.floor(P.age)>lastYear){lastYear++;newYear();if(!playing)return false}return playing&&P.hp>0}
function newYear(){
  const a=Math.floor(P.age);birthdayVit();rankStipend();runHooks('newYear');
  if(a>=50){recalc()}
  if(a===P.life-5)log('기력이 쇠해 갑니다. 남은 날이 많지 않습니다.','dmg');
  for(const a2 of allies.slice())if(a2.kind==='pet'){a2.age++;if(a2.age>=a2.life){log(`${a2.name}이(가) 늙어 숨을 거뒀습니다.`,'dmg');if(P.ride===a2)P.ride=null;allies.splice(allies.indexOf(a2),1)}}
  for(const c of P.children)c.age++;
  if(P.spouse&&P.children.length<3&&a<52&&Math.random()<.35){const c={name:P.name[0]+pick(['진','연','후','설','휘','린','찬','하','윤','결']),age:0};P.children.push(c);log(`자식 ${c.name}이(가) 태어났습니다.`,'xp');P.feats.push(`${a}세에 자식 ${c.name}을(를) 얻었다`)}
  if(a>=P.life)die('천수');
}
// 생일 선물: 전생의 활력 한 몫. 활력이 가득 차 못 받은 만큼은 다음 생일로 넘긴다.
function birthdayVit(){
  if(!P.vitInst)P.vitInst=[];const n=P.vitInst.length;if(!n&&!(P.vitCarry>0))return;
  const v=(n?P.vitInst.shift():0)+(P.vitCarry||0),got=gainVit(v,true);P.vitCarry=Math.max(0,Math.round(v-got));
  if(got>0)log(`생일을 맞아 전생의 활력 ${got}을(를) 받았습니다.${n?` (${6-n}/5)`:''}${P.vitCarry?` 활력이 가득 차 ${P.vitCarry}은(는) 다음 생일로 넘깁니다.`:''}`,'xp');
  else if(P.vitCarry)log(`활력이 가득 차 전생의 활력 ${P.vitCarry}을(를) 다음 생일로 넘깁니다.`,'info');
}
// 윤회 보상 활력: 명성·선업·경지·나이 몫 + 이번 생에 실제로 얻은 활력의 일정 몫 (v157). 비율은 난이도가 높을수록 낮다 (difficulty.json carry, 없으면 GD.VIT_CARRY.share)
function rebirthVit(realm=realmIdx()){const share=(typeof diffOf==='function'?diffOf().carry:null)??(GD.VIT_CARRY||{share:.3}).share,earned=Math.max(0,Math.round(P.vitEarned||0));
  const deed=Math.round(P.fame*1.5+Math.max(0,P.good)*2+realm*40+Math.max(0,P.age-30)*3),fromVit=Math.round(earned*share);
  G.bonusParts={deed,earned,share,fromVit};return deed+fromVit}
function die(cause){
  if(!playing)return;playing=false;paused=true;P.hp=0;
  const karma=P.good-P.evil,realm=realmIdx();
  let st=karma<-30?0:karma<30?1:karma<120?2:3;if(P.fame>=300&&st<3)st++;
  const bonus=rebirthVit(realm);
  const wis=karma>=60?1:0;
  const entry={life:P.lifeNo,name:P.name,side:P.side,gg:GEUNGOL[P.side][P.gg][0],status:STATUS[P.status].n,age:Math.floor(typeof realAge==='function'?realAge():P.age),cause,realm:rk(realm),fame:P.fame,good:P.good,evil:P.evil,kills:P.kills,
    arts:learnedArts().map(k=>`${ARTS[k].n} ${Math.floor(A(k).p)}`),feats:P.feats.slice(-6),sect:sectName(),spouse:P.spouse&&P.spouse.name,children:P.children.map(c=>c.name)};
  makeTomb(cause);runHooks('died',entry,cause);
  G.history.push(entry);G.lives++;G.nextStatus=st;G.bonusVit=bonus;G.wisCarry=Math.min(3,(G.wisCarry||0)+wis);
  G.heir=P.children.length?{children:P.children.map(c=>({...c})),silver:Math.floor(P.silver/2),side:P.side}:null;
  if(!G.heir){G.house=null;G.storage={mats:{},bag:[]}}
  saveGame(true);
  setTimeout(()=>showRebirth(entry,cause),cause==='천수'?400:900);
}
// ================= 문파, 가족, 비무, 집 =================
function duelStart(){
  const o=DUELISTS[P.duel];if(!o)return;closePanels();G.duel=true;
  for(const m of mobs)if(m.aggro){m.aggro=false;m.tgt=null}
  P.x=ARENA.x-1;P.y=ARENA.y;P.path=null;P.target=null;P.hp=P.maxHp;P.qi=P.maxQi;
  const e=mkMob(o.n,ARENA.x+1,ARENA.y,{hp:o.hp,atk:o.atk,def:o.def,hm:o.hm,sp:2.2,reach:o.ranged?5:1.4,ranged:o.ranged,el:o.el,pal:'duel'+o.cls,hostile:1,aggro:9,duelist:1});
  e.duel=1;e.aggro=true;e.d=Object.assign({},e.d,{pal:o.cls==='검'?'duelist':o.cls==='궁'?'tang':'chief',ranged:o.ranged});e.el=o.el;e.wcls=o.cls;mobs.push(e);P.target=e;
  showBanner('비무',`${o.n}`);log(`비무 시작: ${o.n} (${CLASS[o.cls].n}·${o.el})`,'sys');
  runHooks('duelStart',o,e);
}
function duelEnd(win,e){
  if(G.acadDuel){acadDuelEnd(win,e);return}   // 무관 대련·월반 시험·졸업 비무 (g_academy.js)
  const o=DUELISTS[P.duel],c={win,e,o,was:P.duel,me:realmIdx()};G.duel=false;mobs=mobs.filter(m=>!m.duel);P.target=null;
  if(win){P.fame+=o.fame;P.silver+=o.silver;P.duel++;log(`${o.n}을(를) 꺾었습니다. 명성 +${o.fame}, 은자 +${o.silver}`,'xp');showBanner('비무 승리',`명성 +${o.fame}`);feat(`비무에서 ${o.n}을(를) 꺾었다`)}
  else{log(`${o.n}에게 졌습니다. 비무에서는 목숨을 잃지 않습니다.`,'dmg');P.hp=Math.max(1,P.maxHp*.3)}
  runHooks('duelEnd',c);
}
const houseDoor=()=>{const l=LOTS[G.house.lot];return{x:l.x+l.w/2,y:l.y+l.h+.5}};
const spousePos=()=>{const l=LOTS[G.house.lot];return{x:l.x+l.w+.6,y:l.y+l.h+.4}};
function buildHouse(){
  const l=LOTS[G.house.lot];for(let j=l.y;j<l.y+l.h;j++)for(let i=l.x;i<l.x+l.w;i++)objs[j][i]='B';
  if(!builds.some(b=>b.home))builds.push({x:l.x,y:l.y,w:l.w,h:l.h,kind:'house',home:1});
}
function familyTalk(){P.hp=P.maxHp;P.qi=P.maxQi;log(`${P.spouse.name}와(과) 시간을 보냈습니다. 몸과 마음이 회복됩니다.`,'sys');addText(P.x,P.y,'가족','#e98fb0')}

// ================= save / load =================
// 저장 칸 5개 (사용자 요청 2026-10-14): 1번 칸은 예전 키 그대로라 옛 기록이 그대로 1번 칸이 된다. 마지막에 쓴 칸을 기억해 다음에 제목 화면에서 고른 채로 연다.
const SAVE_BASE='ganghoyunhoe-save-v1',SLOT_N=5,SLOT_KEY='ganghoyunhoe-slot';
const saveKeyOf=i=>i?`${SAVE_BASE}-${i}`:SAVE_BASE;
let SLOT=0;try{SLOT=Math.min(SLOT_N-1,Math.max(0,Math.floor(+(STORE.get(SLOT_KEY)||0))||0))}catch(e){}
let SAVE_KEY=saveKeyOf(SLOT);
function setSlot(i){SLOT=Math.min(SLOT_N-1,Math.max(0,i|0));SAVE_KEY=saveKeyOf(SLOT);STORE.set(SLOT_KEY,String(SLOT),1)}
function loadSlot(i){let d=null;try{d=migrateSave(JSON.parse(STORE.get(saveKeyOf(i))||'null'))}catch(e){}return d}
function saveGame(silent){
  if(!P)return;
  try{
    const p={...P};for(const k of['target','path','talk','goal','chan','leap','ride','qiTraining'])delete p[k];
    const data={v:SAVE_VER,t:Date.now(),G,P:p,itemId,allies:allies.map(a=>({kind:a.kind,k:a.k,name:a.name,hp:a.hp,maxHp:a.maxHp,atk:a.atk,age:a.age,life:a.life,lv:a.lv,xp:a.xp,mode:a.mode})),
      plots:(GAE_PLOTS||plots).map(p=>({crop:p.crop,g:p.g})),alive:playing,tod};
    STORE.set(SAVE_KEY,JSON.stringify(data));if(!silent)log('기록했습니다.','info');
  }catch(e){}
}
function loadGame(){return loadSlot(SLOT)}
function applySave(data){data=migrateSave(data);
  G=Object.assign(G,data.G);runHooks('gLoaded',data);itemId=data.itemId||0;tod=data.tod||.3;
  if(G.house&&G.house.built)buildHouse();
  {const pl=GAE_PLOTS||plots;data.plots&&data.plots.forEach((s,i)=>{if(pl[i])Object.assign(pl[i],s)})}
  if(data.alive&&data.P){P=Object.assign(P||{},data.P);P.traveling=0;P.perch=null;P.z=0;P.target=null;P.path=null;P.chan=null;P.leap=null;P.ride=null;P.talk=null;P.goal=null;
    // 시계(time)는 새로 시작하므로 지난 판의 시각이 적힌 연출 상태는 버린다. 안 버리면 회피 도트(P.dA)·보법 도트(P.bA)에 갇혀 이동 모션이 안 나오고 '장 번호 없음' 경고가 이어진다 (사용자 보고 2026-10-12)
    P.dA=0;P.bA=null;P.ggc=null;P.ggSpd=null;P.ss2=0;P.ssh=null;P.satk=0;P.sj=0;P.sjSt=0;P.lastAtk=0;P.runT=0;P.runPh=0;P.inv=0;
    allies=(data.allies||[]).map(s=>{const a=mkAlly(s.kind,s.kind==='pet'?s.k:s.name,P.x+.5,P.y+.5);return Object.assign(a,s)});recalc();afterLoad(data);return true}
  return false;
}

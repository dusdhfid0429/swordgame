// ================= town people =================
const NPCS=[
  {id:'inn',n:'객잔 주인 왕씨',x:16.5,y:17.6,pal:'keeper'},{id:'smith',n:'대장장이 철씨',x:23.5,y:17.6,pal:'smithy'},
  {id:'sa',n:'사천맹 연락관',x:26,y:17.6,pal:'cultist'},{id:'pharm',n:'약방 의원 허씨',x:16,y:25.6,pal:'keeper'},
  {id:'cloth',n:'포목점 주인 진씨',x:23,y:24.6,pal:'keeper'},{id:'jeong',n:'정의맹 연락관',x:26,y:25.6,pal:'taoist'},
  {id:'gen',n:'잡화상 노씨',x:18.5,y:23.4,pal:'keeper'},{id:'mae',n:'매파 할멈',x:18.4,y:19.4,pal:'matron'},
  {id:'board',n:'의뢰판',x:21.5,y:19.3,board:1},{id:'arena',n:'비무 관리인',x:22.2,y:21.2,pal:'judge'},{id:'land',n:'토지 관리인',x:14.6,y:21.4,pal:'keeper'},
  {id:'bank',n:'창고지기 장씨',x:19.5,y:26.6,pal:'keeper'},{id:'magyo',n:'마교 밀사',x:26.5,y:20.4,pal:'cultist'},
  {id:'post',n:'역참 마부',x:15.6,y:19.6,pal:'keeper'}];
const npcAt=id=>NPCS.find(n=>n.id===id);
// 지금 지역의 사람들: 개봉은 마을 사람, 본산은 장문인과 역참 마부 (REGIONS[..].npcs)
const npcsHere=()=>REG==='gaebong'?NPCS:(REGION().npcs||[]);
let dlg=null;
// ================= update =================
let spawnT=0,saveT=30,lastYear=13;
function update(dt){
  time+=dt;shake=Math.max(0,shake-dt);trainTick(dt);tombTick();gateTick();
  // calendar, age, weather, day
  G.cal+=dt/YEAR_SEC;P.age+=dt/YEAR_SEC;tod=(tod+dt/150)%1;
  if(Math.floor(P.age)>lastYear){lastYear=Math.floor(P.age);newYear()}
  G.wT-=dt;if(G.wT<=0){G.wT=22+Math.random()*12;const tb=WEATHER[season()];let r=Math.random();for(const[w,p]of tb){if(r<p){if(w!==G.weather)log(`날씨가 ${w}(으)로 바뀌었습니다.`,'info');G.weather=w;break}r-=p}}
  G.gT-=dt;if(G.gT<=0){if(G.giyeon){G.giyeon=null;G.gT=120+Math.random()*120}else{for(let t=0;t<40;t++){const x=2+Math.floor(Math.random()*(N-4)),y=2+Math.floor(Math.random()*(N-4));if(walk(x,y)&&!inTown(x,y)&&!inFarm(x,y)&&dist({x,y},P)>6){G.giyeon={x:x+.5,y:y+.5};G.gT=45;log('어딘가에서 기이한 빛이 일렁입니다.','info');break}}}}
  if(G.giyeon&&dist(G.giyeon,P)<.7){G.giyeon=null;G.gT=150+Math.random()*120;giyeon('spot')}
  spawnT-=dt;if(spawnT<=0){spawnT=2;spawnTick()}
  saveT-=dt;if(saveT<=0){saveT=30;saveGame()}
  for(const p of GAE_PLOTS||plots)growPlot(p,dt);
  for(const n of nodes)n.cd=Math.max(0,n.cd-dt);
  if(P.hp>0)updateP(dt);
  for(const e of mobs)updateMob(e,dt);
  mobs=mobs.filter(e=>e.hp>0);
  for(const a of allies)updateAlly(a,dt);
  for(const e of[P,...mobs,...allies])if(e.moving&&e.hp>0){e.dustT=(e.dustT||0)-dt;if(e.dustT<=0){fx.push({t:'dust',x:e.x-.1,y:e.y-.1,life:.45});e.dustT=.24}}
  if(P.hp>0)drops=drops.filter(d=>!(dist(d,P)<.6&&pickUp(d)));
  updateProjs(dt);updateEprojs(dt);
  sched.forEach(q=>q.t-=dt);const due=sched.filter(q=>q.t<=0);sched=sched.filter(q=>q.t>0);if(P.hp>0)due.forEach(q=>q.f());
  fx.forEach(f=>f.life-=dt);fx=fx.filter(f=>f.life>0);
  texts.forEach(t=>t.life-=dt);texts=texts.filter(t=>t.life>0);
  const t=iso(P.x,P.y);cam.x+=(t.x-cam.x)*Math.min(1,dt*8);cam.y+=(t.y-cam.y)*Math.min(1,dt*8);
}
function updateP(dt){
  for(let i=0;i<6;i++)P.fcd[i]=Math.max(0,P.fcd[i]-dt);for(const k in P.scd)P.scd[k]=Math.max(0,P.scd[k]-dt);
  for(const k of['gcd','bcd','ucd','swing','palm','inv','hit','flash','jump','satk','sj'])P[k]=Math.max(0,P[k]-dt);
  for(const k of['atk','hm','crit','ult'])P.buff[k]=Math.max(0,(P.buff[k]||0)-dt);
  P.lastHit+=dt;
  if(P.poison>0){P.poison-=dt;P.hp-=P.maxHp*.02*dt;if(P.hp<=0){P.hp=0;die('독');return}}
  if(P.run){P.qi-=4*dt;if(P.qi<=0){P.qi=0;P.run=false;log('내공이 바닥나 질주를 멈춥니다.','info')}}
  P.qi=Math.min(P.maxQi,P.qi+qiRegen()*dt*(P.run?0:1));
  if(P.lastHit>4)P.hp=Math.min(P.maxHp,P.hp+(1+P.st.qi*.2)*(P.medit?3:1)*dt);
  if(P.chan){P.chan.t+=dt;if(P.chan.t>=P.chan.dur){const c=P.chan;P.chan=null;c.fn()}}
  let kx=0,ky=0;
  if(keys.arrowup){kx--;ky--}if(keys.arrowdown){kx++;ky++}if(keys.arrowleft){kx--;ky++}if(keys.arrowright){kx++;ky--}
  if(joy.on){kx+=joy.gx;ky+=joy.gy}
  P.moving=false;const sp=moveSpd()*dt;P.runT=Math.max(0,(P.runT||0)-dt);
  if(P.leap){const L=P.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur),e=k<.5?2*k*k:1-2*(1-k)*(1-k);P.x=L.sx+(L.ex-L.sx)*e;P.y=L.sy+(L.ey-L.sy)*e;
    if(Math.random()<dt*20)fx.push({t:'ghost',x:P.x,y:P.y,life:.25,col:'170,200,255'});
    if(k>=1){P.leap=null;fx.push({t:'dust',x:P.x-.1,y:P.y-.1,life:.45})}}
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
  if(G.duel&&dist(P,ARENA)>ARENA.r+1.2){log('비무대를 벗어나 비무에서 졌습니다.','dmg');duelEnd(false)}
}
function autoReach(){const a=art();if(!hasWeaponFor(a.cls))return CLASS.권.reach;const s=A(a.id);let r=CLASS[a.cls].reach;
  a.forms.forEach((f,i)=>{if(s.f[i]&&P.fcd[i]<=0&&P.qi>=f.qi)r=Math.max(r,Math.min(engage(f),5))});return Math.min(r,a.cls==='궁'?6:3)}
// 자동초식: chain the learned forms in order, falling back to a plain strike
function autoAttack(e){
  if(P.gcd>0)return;const a=art(),s=A(a.id),ch=P.chain,live=time-ch.t<1.7;
  if(allLearned(a.id)&&live&&ch.n>=2&&P.ucd<=0&&P.qi>=60&&hasWeaponFor(a.cls)){ultimate();return}
  for(let i=0;i<a.forms.length;i++){if(live&&i<=ch.last)continue;if(s.f[i]&&formReady(i)&&dist(e,P)<engage(a.forms[i])+.2){useForm(i,true);return}}
  basicStrike(e);
}
function moveEnt(e,dx,dy){const r=.22;if(walkAt(e.x+dx+Math.sign(dx)*r,e.y))e.x+=dx;if(walkAt(e.x,e.y+dy+Math.sign(dy)*r))e.y+=dy}
function findPath(sx,sy,tx,ty,lim=1400){lim*=Math.max(1,N*N/1600);
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
function updateMob(e,dt){
  if(e.hp<=0)return;const d=e.d;
  e.hit=Math.max(0,e.hit-dt);e.swing=Math.max(0,e.swing-dt);e.slow=Math.max(0,e.slow-dt);e.bind=Math.max(0,(e.bind||0)-dt);e.nohe=Math.max(0,e.nohe-dt);
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
  if(!e.aggro&&hostP&&P.hp>0){if(dist(e,P)<(d.aggro||6)&&!inTown(Math.floor(P.x),Math.floor(P.y)))e.aggro=true;else for(const a of allies)if(a.hp>0&&a!==P.ride&&dist(e,a)<(d.aggro||6)*.7){e.aggro=true;e.tgt=a;tg=a;break}}
  if(e.aggro&&(Math.hypot(e.x-e.home.x,e.y-e.home.y)>15||P.hp<=0&&!tg.isMob||inTown(Math.floor(tg.x),Math.floor(tg.y))&&!e.duel)){e.aggro=false;e.tgt=null;e.goal={x:e.home.x,y:e.home.y};e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.3)}
  if(!e.aggro){if(!e.nohe)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02*dt);wander(e,dt);return}
  if(tg===P&&P.ride&&Math.random()<.002)tg=P;
  const dd=dist(e,tg),reach=e.reach;
  // telegraphed heavy move for bosses and duelists
  if(d.boss||e.duel||d.elite){e.skT-=dt;if(e.skT<=0&&dd<6&&!e.wind){e.skT=5+Math.random()*3;
    if(d.ranged||(e.duel&&e.d.ranged)){for(let i=-1;i<=1;i++){const a=Math.atan2(tg.y-e.y,tg.x-e.x)+i*.25;eprojs.push({x:e.x,y:e.y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,left:7,dmg:e.atk*.9,src:e,c:'255,200,140'})}}
    else{e.slam=1.1;e.slamAt={x:tg.x,y:tg.y};fx.push({t:'warn',x:tg.x,y:tg.y,r:2,life:1.1,max:1.1})}}}
  if(e.slam>0){e.slam-=dt;e.moving=false;if(e.slam<=0){const c=e.slamAt;fx.push({t:'puff',x:c.x,y:c.y,life:.6});shake=.25;fRing(null,c,2,'255,120,80',4,.35);
    if(hostP){if(dist(P,c)<2)hurtP(e.atk*1.6,e);for(const a of allies)if(dist(a,c)<2)hurtAlly(a,e.atk*1.6)}
    if(d.fac)for(const o of mobs)if(o.hp>0&&o.d.fac&&facFoe(o.d.fac,d.fac)&&dist(o,c)<2)mobHurt(o,e.atk*1.6,e)}return}
  if(e.wind>0){e.wind-=dt;if(e.wind<=0){e.cd=d.boss?1.3:1.25;e.swing=.24;
      if(d.ranged)eprojs.push({x:e.x,y:e.y,vx:(tg.x-e.x)/dd*10,vy:(tg.y-e.y)/dd*10,left:reach+1,dmg:e.atk,src:e,c:'230,210,160'});
      else if(dist(e,tg)<reach+.3){if(tg===P)hurtP(e.atk,e);else if(tg.isMob)mobHurt(tg,e.atk,e);else hurtAlly(tg,e.atk)}}
    return}
  e.cd-=dt;e.moving=false;
  if(dd<reach){if(e.cd<=0)e.wind=d.boss?.5:.4;e.fx=(tg.x-e.x)/(dd||1);e.fy=(tg.y-e.y)/(dd||1)}
  else chase(e,tg,dt,spd*(dd>9?1.3:1));
  for(const o of mobs)if(o!==e&&o.hp>0){const q=dist(o,e);if(q<.6&&q>0)moveEnt(e,(e.x-o.x)/q*.02,(e.y-o.y)/q*.02)}
}
function updateEprojs(dt){
  for(const q of eprojs){q.x+=q.vx*dt;q.y+=q.vy*dt;q.left-=Math.hypot(q.vx,q.vy)*dt;if(blockedAt(q.x,q.y))q.left=0;
    const sf=q.src&&q.src.d&&q.src.d.fac,hp=!sf||mobFoeP(q.src);
    if(hp&&q.left>0&&dist(q,P)<.45&&P.hp>0){q.left=0;hurtP(q.dmg,q.src)}
    if(hp)for(const a of allies)if(q.left>0&&a!==P.ride&&dist(q,a)<.45){q.left=0;hurtAlly(a,q.dmg)}
    if(sf)for(const o of mobs)if(q.left>0&&o!==q.src&&o.hp>0&&o.d.fac&&facFoe(o.d.fac,sf)&&dist(q,o)<.45){q.left=0;mobHurt(o,q.dmg,q.src)}}
  eprojs=eprojs.filter(q=>q.left>0);
}
// ================= companions: tamed beasts and disciples =================
function hurtAlly(a,dm){if(a.hp<=0||a===P.ride)return;a.hp-=dm;a.hit=.15;addText(a.x,a.y,Math.round(dm),'#e0a05a');if(a.hp<=0){a.hp=0;log(`${a.name}이(가) 쓰러졌습니다.`,'dmg');allies.splice(allies.indexOf(a),1)}}
function updateAlly(a,dt){
  if(a.hp<=0||a===P.ride)return;a.hit=Math.max(0,a.hit-dt);a.swing=Math.max(0,(a.swing||0)-dt);a.cd-=dt;
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
  if(P.hp<=0)return;if(P.qi<12){log('내공이 부족합니다.','info');return}if(P.leap)return;
  const LEAP=P.ride?4:3.6;let land=null;
  const ok=(nx,ny)=>nx>.3&&ny>.3&&nx<N-.3&&ny<N-.3&&walkAt(nx,ny)&&walkAt(nx+.2,ny)&&walkAt(nx-.2,ny)&&walkAt(nx,ny+.2)&&walkAt(nx,ny-.2);
  for(let d=LEAP;d>.2&&!land;d-=.1)for(const o of[0,.5,-.5,.9,-.9]){const nx=P.x+P.fx*d-P.fy*o,ny=P.y+P.fy*d+P.fx*o;if(ok(nx,ny)){land={x:nx,y:ny};break}}
  if(!land){log('뛰어내릴 곳이 없습니다.','info');return}
  const dur=heroSprite()?.6:.42;P.qi-=12;P.inv=dur;P.path=null;P.target=null;P.chan=null;if(heroSprite()&&!P.ride){P.sj=.6;P.satk=0}else{P.jump=.35}
  P.leap={sx:P.x,sy:P.y,ex:land.x,ey:land.y,t:0,dur};fx.push({t:'dust',x:P.x-.1,y:P.y-.1,life:.45});
}
// ================= 생활: gathering, farming, crafting =================
function interact(t){
  if(!t)return;
  if(t.house){openHouse();return}
  if(t.plot){plotAction(t.plot);return}
  const n=t.node;if(!n)return;
  if(n.cd>0){log(n.t==='chest'?'비어 있는 상자입니다.':'아직 다시 자라지 않았습니다.','info');return}
  if(n.t==='chest'){if(P.chest){log('이번 생의 기연은 이미 얻었습니다.','info');return}P.chest=1;n.cd=99999;giyeon('chest');return}
  const L={herb:['약초를 캔다',1.2],ore:['광석을 캔다',1.8],wood:['나무를 벤다',1.6],fish:['잉어를 낚는다',2.2]}[n.t];
  P.chan={t:0,dur:L[1],label:L[0],fn:()=>{
    if(n.t==='herb'){const k=R1(1,2);addMat('약초',k);log(`약초 ${k}개를 캤습니다.`,'sys');n.cd=40}
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
function useCon(k){
  if(!(P.mats[k]>0)){log(`${k}이(가) 없습니다.`,'info');return}if(P.hp<=0)return;
  if(k==='해독단'){if(!P.poison){log('중독되지 않았습니다.','info');return}P.poison=0}
  else if(k==='대환단'){if(P.dhw>=3){log('대환단은 한 생에 세 번까지만 효험이 있습니다.','info');return}P.dhw++;P.qiBonus+=15;recalc()}
  else if(k==='금창약'||k==='주먹밥')P.hp=Math.min(P.maxHp,P.hp+P.maxHp*(k==='금창약'?.4:.35));
  else if(k==='소환단'||k==='보리죽')P.qi=Math.min(P.maxQi,P.qi+P.maxQi*(k==='소환단'?.5:.4));
  else if(k==='고기볶음'){P.buff.atk=90;P.buff.atkV=.15}else if(k==='잉어찜')P.buff.hm=90;
  P.mats[k]--;addText(P.x,P.y,k,'#a6d47f');fx.push({t:'lvl',x:P.x,y:P.y,life:.6});renderOpen();
}
// ================= 나이 and 윤회 =================
function newYear(){
  const a=Math.floor(P.age);birthdayVit();rankStipend();
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
  const v=(n?P.vitInst.shift():0)+(P.vitCarry||0),got=gainVit(v);P.vitCarry=v-got;
  if(got>0)log(`생일을 맞아 전생의 활력 ${got}을(를) 받았습니다.${n?` (${6-n}/5)`:''}${P.vitCarry?` 활력이 가득 차 ${P.vitCarry}은(는) 다음 생일로 넘깁니다.`:''}`,'xp');
  else if(P.vitCarry)log(`활력이 가득 차 전생의 활력 ${P.vitCarry}을(를) 다음 생일로 넘깁니다.`,'info');
}
function die(cause){
  if(!playing)return;playing=false;paused=true;P.hp=0;
  const karma=P.good-P.evil,realm=realmIdx();
  let st=karma<-30?0:karma<30?1:karma<120?2:3;if(P.fame>=300&&st<3)st++;
  const bonus=Math.round(P.fame*1.5+Math.max(0,P.good)*2+realm*40+Math.max(0,P.age-30)*3);
  const wis=karma>=60?1:0;
  const entry={life:P.lifeNo,name:P.name,side:P.side,gg:GEUNGOL[P.side][P.gg][0],status:STATUS[P.status].n,age:Math.floor(P.age),cause,realm:RANKS[realm],fame:P.fame,good:P.good,evil:P.evil,kills:P.kills,
    arts:learnedArts().map(k=>`${ARTS[k].n} ${Math.floor(A(k).p)}`),feats:P.feats.slice(-6),sect:sectName(),spouse:P.spouse&&P.spouse.name,children:P.children.map(c=>c.name)};
  makeTomb(cause);
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
}
function duelEnd(win,e){
  const o=DUELISTS[P.duel];G.duel=false;mobs=mobs.filter(m=>!m.duel);P.target=null;
  if(win){P.fame+=o.fame;P.silver+=o.silver;P.duel++;log(`${o.n}을(를) 꺾었습니다. 명성 +${o.fame}, 은자 +${o.silver}`,'xp');showBanner('비무 승리',`명성 +${o.fame}`);P.feats.push(`${Math.floor(P.age)}세에 비무에서 ${o.n}을(를) 꺾었다`)}
  else{log(`${o.n}에게 졌습니다. 비무에서는 목숨을 잃지 않습니다.`,'dmg');P.hp=Math.max(1,P.maxHp*.3)}
}
const houseDoor=()=>{const l=LOTS[G.house.lot];return{x:l.x+l.w/2,y:l.y+l.h+.5}};
const spousePos=()=>{const l=LOTS[G.house.lot];return{x:l.x+l.w+.6,y:l.y+l.h+.4}};
function buildHouse(){
  const l=LOTS[G.house.lot];for(let j=l.y;j<l.y+l.h;j++)for(let i=l.x;i<l.x+l.w;i++)objs[j][i]='B';
  if(!builds.some(b=>b.home))builds.push({x:l.x,y:l.y,w:l.w,h:l.h,kind:'house',home:1});
}
function familyTalk(){P.hp=P.maxHp;P.qi=P.maxQi;log(`${P.spouse.name}와(과) 시간을 보냈습니다. 몸과 마음이 회복됩니다.`,'sys');addText(P.x,P.y,'가족','#e98fb0')}

// ================= save / load =================
const SAVE_KEY='ganghoyunhoe-save-v1';
function saveGame(silent){
  if(!P)return;
  try{
    const p={...P};for(const k of['target','path','talk','goal','chan','leap','ride','qiTraining'])delete p[k];
    const data={G,P:p,itemId,allies:allies.map(a=>({kind:a.kind,k:a.k,name:a.name,hp:a.hp,maxHp:a.maxHp,atk:a.atk,age:a.age,life:a.life,lv:a.lv,xp:a.xp,mode:a.mode})),
      plots:(GAE_PLOTS||plots).map(p=>({crop:p.crop,g:p.g})),alive:playing,tod};
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));if(!silent)log('기록했습니다.','info');
  }catch(e){}
}
function loadGame(){
  let data=null;try{data=JSON.parse(migrateArtIds(localStorage.getItem(SAVE_KEY))||'null')}catch(e){}
  return data;
}
function applySave(data){
  G=Object.assign(G,data.G);itemId=data.itemId||0;tod=data.tod||.3;
  if(G.house&&G.house.built)buildHouse();
  {const pl=GAE_PLOTS||plots;data.plots&&data.plots.forEach((s,i)=>{if(pl[i])Object.assign(pl[i],s)})}
  if(data.alive&&data.P){P=Object.assign(P||{},data.P);P.target=null;P.path=null;P.chan=null;P.leap=null;P.ride=null;P.talk=null;P.goal=null;
    migrateSect();
    allies=(data.allies||[]).map(s=>{const a=mkAlly(s.kind,s.kind==='pet'?s.k:s.name,P.x+.5,P.y+.5);return Object.assign(a,s)});recalc();return true}
  return false;
}

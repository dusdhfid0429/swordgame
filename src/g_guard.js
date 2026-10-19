// 문파 구성 (2026-10-15 v118, 사용자: "문파 입구를 지키는 경비 인원과 순찰을 도는 순찰조, 각 당에 당원 등 문파의 구성을 맵에 갔을 때 문파로 느껴지게,
// 천하대전의 경우도 지금보다 훨씬 많은 몹이 맵에 있어야 단체 전쟁을 벌이는 느낌")
// - 본산 맵(R.hq)마다 문(door 아닌 출입구)마다 문지기 둘이 안쪽을 등지고 선다. 순찰조(고수 1 + 무인 2)가 네 지점을 돌고, 둘은 조장을 따른다. 대문파·마교는 두 조.
// - 전각 안: 연무청·당 전각(kit drill)엔 당원 넷이 서서 초식을 연습하고, 다른 전각엔 시종 둘. 점령된 본산은 점령군이 선다. 폐허·닫힌 맵은 없음.
// - 이들은 e.fixed 로 표시되어 리젠 상한에 세지 않고(g_core spawnTick, g_pop facSpawn) 맵에 들어올 때마다 선다. 같은 편이면 평화, 적이면 여느 무인처럼 덤빈다. 죽이면 인원이 준다.
// - 결전장(g_story3 warGo): 내 편 16·적 20(고수 5)으로 늘리고, 적장이 살아 있는 동안 10초마다 양쪽에 3명씩 증원(최대 6파도, 상한까지).
const GUARD=GD.GUARD;
function guardFac(R){const s=SECTS[R.hq],o=G.occ&&G.occ[s.id];return o?{fac:o.by,sid:null,n:`${FAC4N[o.by]} 점령군`}:{fac:alFac(s.al),sid:s.id,n:s.n}}
function fixedMk(g,elite,x,y,tag){const e=mkFac(g.fac,elite,x,y,g.sid||undefined);e.fixed=tag;e.name=`${g.n} ${GUARD.names[tag]}`;e.home={x,y};e.post={x,y};e.goal=null;return e}
function guardPlace(R){const g=guardFac(R);
  for(const gt of R.gates||[]){if(gt.door)continue;const cx=N/2,cy=NH/2,dx=Math.sign(cx-gt.x)||1,dy=Math.sign(cy-gt.y)||1,vert=Math.abs(gt.y-cy)>=Math.abs(gt.x-cx);
    for(let k=-1;k<=1;k+=2){const x=vert?gt.x+k*1.4:gt.x+dx*1.3,y=vert?gt.y+dy*1.3:gt.y+k*1.4;if(!walkAt(x,y))continue;const e=fixedMk(g,0,x,y,'gate');e.pfx=vert?0:-dx;e.pfy=vert?-dy:0;e.fx=e.pfx;e.fy=e.pfy;mobs.push(e)}}
  const nsq=GUARD.patrol.squads[SECTS[R.hq].tier]||1;
  for(let q=0;q<nsq;q++){const route=[];for(let t=0;t<80&&route.length<GUARD.patrol.route;t++){const x=2+Math.random()*(N-4),y=2+Math.random()*(NH-4);if(walkAt(x,y)&&(!route.length||route.every(r=>Math.hypot(r.x-x,r.y-y)>6)))route.push({x,y})}
    if(route.length<2)continue;let lead=null;for(let i=0;i<GUARD.patrol.n;i++){const p0=route[0],e=fixedMk(g,i===0?1:0,p0.x,p0.y,'patrol');e.route=route;e.ri=1;if(i===0)lead=e;else{e.follow=lead;e.foff={x:i*.8-.4,y:i*.6}}mobs.push(e)}}}
function hallPlace(R){const O=REGIONS[R.hall.out];if(!O||!O.hq||!SECTS[O.hq])return;const g=guardFac(O);if(!g.sid)return;const drill=R.hall.kit==='drill',n=drill?GUARD.drill:GUARD.attend,gate=R.gates[0];let made=0;
  for(let t=0;t<120&&made<n;t++){const x=1+Math.floor(Math.random()*(N-2))+.5,y=1+Math.floor(Math.random()*(NH-3))+.5;if(!walkAt(x,y)||dist({x,y},gate)<2.2||npcsHere().some(q=>Math.hypot(q.x-x,q.y-y)<1.3)||mobs.some(m=>Math.hypot(m.x-x,m.y-y)<1.3))continue;
    const e=fixedMk(g,0,x,y,drill?'drill':'attend');e.pfx=0;e.pfy=1;e.fx=0;e.fy=1;if(drill)e.drill=1;mobs.push(e);made++}}
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||!P||R.dead||R.ruin)return;if(R.hq&&SECTS[R.hq])guardPlace(R);else if(R.hall)hallPlace(R)});
// 자리 지키기·순찰: 평시에는 wander 대신 자리(post)나 다음 지점으로. 싸움이 붙으면(aggro) 여느 무인처럼 싸우고, 끝나면 돌아온다
hook('mobTick',(e,dt)=>{if(!e.fixed||e.hp<=0||e.aggro||G.duel)return;e.wt=99;
  if(e.route){if(e.follow){const l=e.follow;if(l.hp<=0){e.follow=null;e.route=null;return}e.goal={x:l.x-e.foff.x,y:l.y-e.foff.y};if(dist(e,e.goal)<.4)e.goal={x:e.x,y:e.y};return}
    const w=e.route[e.ri];if(Math.hypot(e.x-w.x,e.y-w.y)<.7)e.ri=(e.ri+1)%e.route.length;e.goal=e.route[e.ri];return}
  if(e.post){e.goal={x:e.post.x,y:e.post.y};if(Math.hypot(e.x-e.post.x,e.y-e.post.y)<.3&&e.pfx!=null){e.fx=e.pfx;e.fy=e.pfy}
    if(e.drill){e.dr=(e.dr||0)-dt;if(e.dr<=0){e.dr=1.4+Math.random()*2.2;e.swing=.24;e.fx=Math.random()<.5?1:-1;e.fy=Math.random()<.5?1:-1;e.pfx=e.fx;e.pfy=e.fy}}}});
// 결전장 증원: 적장이 살아 있고 결전장에 있는 동안 10초마다 양쪽에 3명씩, 각 상한(FIELD.ally/foe)까지, 최대 6파도
hook('tick',dt=>{if(!P||typeof warOn!=='function'||!warOn()||REG!==FIELD.id||!G.war.cur||!G.war.cur.field||G.war.cur.done)return;const w=G.war,c=w.cur;c.waveT=(c.waveT||0)+dt;if(c.waveT<GUARD.wave.sec||(c.waves||0)>=GUARD.wave.max)return;c.waveT=0;c.waves=(c.waves||0)+1;
  const n=w.round,me=mySide(),my=me>=0?w.plan.sides[me]:[],foes=warEnemyFacs();const put=spawnBand;
  const al=mobs.filter(m=>m.warAlly===n&&m.hp>0),fo=mobs.filter(m=>m.raid===n&&m.hp>0&&!m.warChief);let a=0,f=0;
  for(let i=0;i<GUARD.wave.n&&my.length&&al.length+a<FIELD.ally;i++)if(put(my[i%my.length],i===0?1:0,33,37,e=>{e.warAlly=n;const t=fo[Math.floor(Math.random()*fo.length)];if(t){e.tgt=t;e.aggro=true}}))a++;
  for(let i=0;i<GUARD.wave.n&&foes.length&&fo.length+f<FIELD.foe;i++)if(put(foes[i%foes.length],i===0?1:0,3,7,e=>{e.raid=n;e.aggro=true;const t=al[Math.floor(Math.random()*al.length)];if(t)e.tgt=t}))f++;
  if(a||f)log(`증원: ${a?`내 편 ${a}명`:''}${a&&f?' · ':''}${f?`적 ${f}명`:''}이 전장에 들어선다.`,'info')});

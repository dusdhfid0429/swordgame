// 멸문 폐허 (2026-10-15 v115, 사용자: "멸문한 문파의 맵에 전각이나 건물들이 폐허가 되어 있고 바닥에 피와 시체가 있게"):
// 인원이 0이 된 문파의 본산 맵과 전각 안은 들어갈 수 있는 폐허가 된다. 전각은 그을리고 지붕이 꺼지고 담이 갈라지며(r_build.js drawBuild 의 R.dead),
// 바닥엔 핏자국(R.gore blood)과 그 문파 옷을 입은 시체(R.gore body)가 자리 고정으로 놓인다. 사람(NPC)과 제 문파 무인은 없고 짐승·도적만 남는다.
const RUIN=GD.RUIN;   // data/ruin.json: 핏자국·시체·잔해 수, 약탈품 표
function ruinSect(R){if(!R)return null;if(R.hq&&SECTS[R.hq])return SECTS[R.hq];if(R.hall&&R.hall.out){const O=REGIONS[R.hall.out];if(O&&O.hq&&SECTS[O.hq])return SECTS[O.hq]}return null}
const ruinDead=R=>{const s=ruinSect(R);return !!s&&sectPop(s.id)<=0};
function ruinBody(s,x,y,k){const fac=alFac(s.al),cls=['검','도','창'][k%3],rank=k%4===0?2:k%2;
  const pal=(typeof sectPal==='function'&&sectPal(s.id,rank,cls,{elite:rank>=2}))||facPal(fac,cls,rank>=2,s.id);
  return{k:'body',x,y,dir:k%2?1:-1,e:{npc:1,dead:1,x,y,d:{pal},fx:k%3?1:-1,fy:k%2?-1:1,hp:0,maxHp:1,moving:false,bob:0,swing:0,wind:0,stun:0,hit:0,sp:0,kb:{x:0,y:0},rec:0}}}
function goreMake(id){const R=REGIONS[id];if(!R)return;R.dead=false;R.gore=null;if(!ruinDead(R))return;const s=ruinSect(R);R.dead=true;
  const inHall=!!R.hall,[b0,b1]=inHall?RUIN.hallBlood:RUIN.blood,[c0,c1]=inHall?RUIN.hallBodies:RUIN.bodies,seed=(s.i||1)*101+(inHall?7:0);
  const nb=b0+Math.floor(hash(seed,1)*(b1-b0+1)),nc=c0+Math.floor(hash(seed,2)*(c1-c0+1)),out=[];
  const spot=k=>{for(let t=0;t<40;t++){const x=1+Math.floor(hash(seed+k,t*2+3)*(N-2)),y=1+Math.floor(hash(seed+k,t*2+4)*(NH-2));if(walk(x,y)&&!(R.gates||[]).some(g=>Math.hypot(g.x-x-.5,g.y-y-.5)<2))return{x:x+.5,y:y+.5}}return null};
  for(let k=0;k<nb;k++){const p=spot(k);if(p)out.push({k:'blood',x:p.x+(hash(seed,k*5)-.5)*.8,y:p.y+(hash(seed,k*5+1)-.5)*.8,r:.3+hash(seed,k*5+2)*.5,a:.5+hash(seed,k*5+3)*.3,n:Math.floor(hash(seed,k*5+4)*4)})}
  for(let k=0;k<nc;k++){const p=spot(100+k);if(!p)continue;out.push(ruinBody(s,p.x,p.y,k));out.push({k:'blood',x:p.x+.2,y:p.y+.1,r:.9,a:.55,n:3})}
  R.gore=out;ruinNodes(R,id,s,seed)}
// 폐허 약탈품 (v116, 사용자 "폐허전용 약탈품 추가해줘"): 시체(corpse)와 잔해(rubble)를 뒤진다. 한 번 뒤진 자리는 G.looted[맵][번호]로 남아 다시 나오지 않고, 문파가 살아나면 지운다.
function ruinNodes(R,id,s,seed){G.looted=G.looted||{};const got=G.looted[id]||{};let k=0;
  for(const g of R.gore)if(g.k==='body'){const key='c'+k++;nodes.push({t:'corpse',x:g.x,y:g.y,cd:got[key]?99999:0,key,sect:s.id})}
  const[r0,r1]=R.hall?RUIN.hallRubble:RUIN.rubble,nr=r0+Math.floor(hash(seed,9)*(r1-r0+1));
  for(let i=0;i<nr;i++){const b=builds.length?builds[(i+Math.floor(hash(seed,10+i)*builds.length))%builds.length]:null;let p=null;
    if(b){for(let t=0;t<20&&!p;t++){const x=b.x+Math.floor(hash(seed+i,t)*(b.w+2))-1,y=b.y+b.h+1+Math.floor(hash(seed+i,t+40)*2);if(walk(x,y)&&!nodes.some(n=>Math.hypot(n.x-x-.5,n.y-y-.5)<1))p={x:x+.5,y:y+.5}}}
    if(!p){for(let t=0;t<40&&!p;t++){const x=1+Math.floor(hash(seed+50+i,t)*(N-2)),y=1+Math.floor(hash(seed+50+i,t+1)*(NH-2));if(walk(x,y)&&!nodes.some(n=>Math.hypot(n.x-x-.5,n.y-y-.5)<1))p={x:x+.5,y:y+.5}}}
    if(!p)continue;const key='r'+i;nodes.push({t:'rubble',x:p.x,y:p.y,cd:got[key]?99999:0,key,sect:s.id})}}
const wpick=list=>{let t=0;for(const e of list)t+=e.w;let r=Math.random()*t;for(const e of list){r-=e.w;if(r<=0)return e}return list[list.length-1]};
function ruinRelic(s){const r=RUIN.relic,q=1+Math.random()*.4,it=mkGear('acc',`${s.n} 유물 · ${pick(r.names)}`,q,{qi:r.qi,hm:r.hm});it.price=Math.round(r.price*q);it.relic=s.id;return it}
function ruinGear(s){const q=(RUIN.gearQ[s.tier]||1)*(.8+Math.random()*.4),st=START[s.id],cls=st&&st.w||(s.arts[0]&&s.arts[0].cls)||'검',r=Math.random();
  if(r<.45)return mkWeapon(cls,q,0);if(r<.75)return mkGear('armor',pick(['마의','피갑','흑철갑']),q,{hp:26,def:4});return mkGear('acc',pick(['옥패','호신부','염주']),q,{qi:24,hm:5})}
function ruinBook(s,hi){const list=s.arts.filter(a=>!!a.hi===hi&&ARTS[a.id]);let a=list.length?pick(list):null;
  if(!a&&!hi){const st=START[s.id],id=st&&Object.keys(ARTS).find(k=>ARTS[k].n===st.art);if(id)return mkBook(id,0)}
  if(!a)return null;const A=ARTS[a.id];return mkBook(a.id,hi?0:Math.floor(Math.random()*Math.min(2,A.forms.length)))}
function ruinLoot(n){const s=SECTS[n.sect];if(!s)return;G.looted=G.looted||{};(G.looted[REG]=G.looted[REG]||{})[n.key]=1;n.cd=99999;
  const e=wpick(n.t==='corpse'?RUIN.bodyLoot:RUIN.rubbleLoot),where=n.t==='corpse'?'시체':'잔해';let it=null;
  if(e.t==='silver'){const v=R1(e.n[0],e.n[1]);P.silver+=v;log(`${where}에서 은자 ${v}을(를) 찾았다.`,'sys');addText(P.x,P.y,`은자 ${v}`,'#e8c66e');return}
  if(e.t==='potion'){const v=R1(e.n[0],e.n[1]);addMat('금창약',v);log(`${where}에서 금창약 ${v}개를 찾았다.`,'sys');return}
  if(e.t==='ash'){log('타다 남은 재와 깨진 기왓장뿐이다.','info');return}
  if(e.t==='leaf'){const id=leafPick({sects:[s.id]});if(id){giveLeaf(id,1,where);return}it=ruinRelic(s)}   // 비급 낱장 (g_mkmat.js)
  if(e.t==='gear')it=ruinGear(s);else if(e.t==='relic')it=ruinRelic(s);else if(e.t==='book')it=ruinBook(s,false)||ruinRelic(s);else if(e.t==='hibook')it=ruinBook(s,true)||ruinRelic(s);
  if(!it)return;if(P.bag.length>=24){log('행낭이 가득 찼다. 자리를 비우고 다시 뒤져라.','info');delete G.looted[REG][n.key];n.cd=0;return}
  P.bag.push(it);log(`${where}에서 ${itemLabel(it)}을(를) 찾았다.${it.relic?` ${s.n}의 유물이다.`:e.t==='hibook'?` 멸문한 ${s.n}의 절기가 폐허에서 흘러나왔다.`:''}`,it.slot==='book'||it.relic?'xp':'sys');
  if(e.t==='hibook')feat(`${s.n} 폐허에서 ${it.name}을(를) 찾았다`)}

// 바닥 그림 바로 위에 핏자국. 시체는 깊이 정렬 목록에 들어간다 (g_draw.js)
function drawGore(){const R=REGION();if(!R.dead||!R.gore)return;ctx.save();
  for(const g of R.gore){if(g.k!=='blood')continue;const p=toScreen(g.x,g.y);if(p.x<-60||p.x>W+60||p.y<-40||p.y>H+40)continue;const rx=g.r*TW*.5,ry=g.r*TH*.5;
    ctx.fillStyle=`rgba(62,5,7,${g.a})`;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,7);ctx.fill();
    ctx.fillStyle=`rgba(48,3,5,${g.a*.9})`;for(let i=0;i<g.n+2;i++){const a=hash(g.x*13|0,i)*6.28,d=rx*(.7+hash(i,g.y*17|0)*.7);ctx.beginPath();ctx.ellipse(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*.5,2.2+i%3,1.4+i%2,0,0,7);ctx.fill()}}
  ctx.restore()}
function drawBody(b){const p=toScreen(b.x,b.y);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(b.dir*Math.PI*.5);ctx.scale(1,.95);ctx.translate(-p.x,-p.y);drawFighter(b.e,false);ctx.restore()}
// 멸문 본산은 길이 막히지 않고 폐허로 들어간다 (g_pop.js gate 훅이 sectPop<=0 이면 막지 않는다)
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R)return;goreMake(id);
  if(!R.dead&&G.looted&&G.looted[id])delete G.looted[id];
  if(R.hall){if(R.dead){if(!R._npcsH)R._npcsH=R.npcs||[];R.npcs=[]}else if(R._npcsH){R.npcs=R._npcsH;delete R._npcsH}}   // 살아 있을 땐 손대지 않는다 (g_pop masterCheck 가 장문인을 숨긴다)
  if(R.dead){refreshNPCF();const s=ruinSect(R);if(!R.hall)log(`${s.n} 본산은 폐허가 되었다. 무너진 전각 사이에 핏자국과 시체만 남았다.`,'info')}});

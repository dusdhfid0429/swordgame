// 멸문 폐허 (2026-10-15 v115, 사용자: "멸문한 문파의 맵에 전각이나 건물들이 폐허가 되어 있고 바닥에 피와 시체가 있게"):
// 인원이 0이 된 문파의 본산 맵과 전각 안은 들어갈 수 있는 폐허가 된다. 전각은 그을리고 지붕이 꺼지고 담이 갈라지며(r_build.js drawBuild 의 R.dead),
// 바닥엔 핏자국(R.gore blood)과 그 문파 옷을 입은 시체(R.gore body)가 자리 고정으로 놓인다. 사람(NPC)과 제 문파 무인은 없고 짐승·도적만 남는다.
const RUIN={blood:[26,40],bodies:[6,9],hallBlood:[4,7],hallBodies:[1,3]};
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
  R.gore=out}
// 바닥 그림 바로 위에 핏자국. 시체는 깊이 정렬 목록에 들어간다 (g_draw.js)
function drawGore(){const R=REGION();if(!R.dead||!R.gore)return;ctx.save();
  for(const g of R.gore){if(g.k!=='blood')continue;const p=toScreen(g.x,g.y);if(p.x<-60||p.x>W+60||p.y<-40||p.y>H+40)continue;const rx=g.r*TW*.5,ry=g.r*TH*.5;
    ctx.fillStyle=`rgba(62,5,7,${g.a})`;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,7);ctx.fill();
    ctx.fillStyle=`rgba(48,3,5,${g.a*.9})`;for(let i=0;i<g.n+2;i++){const a=hash(g.x*13|0,i)*6.28,d=rx*(.7+hash(i,g.y*17|0)*.7);ctx.beginPath();ctx.ellipse(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*.5,2.2+i%3,1.4+i%2,0,0,7);ctx.fill()}}
  ctx.restore()}
function drawBody(b){const p=toScreen(b.x,b.y);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(b.dir*Math.PI*.5);ctx.scale(1,.95);ctx.translate(-p.x,-p.y);drawFighter(b.e,false);ctx.restore()}
// 멸문 본산은 길이 막히지 않고 폐허로 들어간다 (g_pop.js gate 훅이 sectPop<=0 이면 막지 않는다)
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R)return;goreMake(id);
  if(R.hall){if(R.dead){if(!R._npcsH)R._npcsH=R.npcs||[];R.npcs=[]}else if(R._npcsH){R.npcs=R._npcsH;delete R._npcsH}}   // 살아 있을 땐 손대지 않는다 (g_pop masterCheck 가 장문인을 숨긴다)
  if(R.dead){NPCF=npcsHere().filter(x=>!x.board).map(npcFighter);const s=ruinSect(R);if(!R.hall)log(`${s.n} 본산은 폐허가 되었다. 무너진 전각 사이에 핏자국과 시체만 남았다.`,'info')}});

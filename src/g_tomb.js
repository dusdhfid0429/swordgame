// ================= 무덤 던전: 죽은 자리에 봉분이 남고, 그 생의 내가 망령 보스로 지킨다 =================
// 가까이 가면 망령과 강시 둘이 깨어난다. 망령을 쓰러뜨리면 그 생이 지녔던 물건 중 일부를 등급별 확률로 떨어뜨리고 무덤은 사라진다.
const TOMB_MAX=6,TOMB_WAKE=4.5,TOMB_FORGET=24;
// 등급이 높을수록 덜 나온다
const TOMB_DROP={하품:.6,중품:.4,상품:.2,명품:.08};
function tombDropP(it){
  if(it.slot==='book')return Math.max(.12,.4-it.form*.06);
  if(it.slot==='sbook'||it.slot==='tbook')return .25;
  return TOMB_DROP[QN(it.q||1)]??.3}
const tombs=()=>G.tombs||(G.tombs=[]);
// 무덤 자리: 마을 안이나 막힌 곳이면 가까운 바깥 빈 땅으로 옮긴다
function tombSpot(x,y){
  const ok=(i,j)=>walk(i,j)&&!inTown(i,j)&&!plots.some(pl=>Math.abs(pl.x-i)<2&&Math.abs(pl.y-j)<2)&&!(npcsHere().some(n=>Math.hypot(n.x-i-.5,n.y-j-.5)<3))&&!tombs().some(t=>Math.hypot(t.x-i-.5,t.y-j-.5)<3);
  for(let r=0;r<14;r++)for(let a=0;a<Math.max(1,r*8);a++){const i=Math.floor(x+Math.cos(a/(r*8||1)*6.283)*r),j=Math.floor(y+Math.sin(a/(r*8||1)*6.283)*r);if(ok(i,j))return{x:i+.5,y:j+.5}}
  return null}
function makeTomb(cause){
  const s=tombSpot(P.x,P.y);if(!s)return;
  const items=[...Object.values(P.eq).filter(Boolean),...P.bag].map(it=>JSON.parse(JSON.stringify(it)));
  const ri=realmIdx();
  tombs().push({id:Date.now()%1e9,reg:REG,x:s.x,y:s.y,name:P.name,life:P.lifeNo,age:Math.floor(P.age),cause,cls:curCls(),el:art().el||null,side:P.side,realm:RANKS[ri],
    hp:Math.round(P.maxHp*2.5+ri*120),atk:Math.max(10,Math.round(atk()*.75)),def:2+ri*2,hm:Math.round(P.st.agi*2+ri*4),xp:120+ri*60,items});
  while(tombs().length>TOMB_MAX)tombs().shift();
}
function tombGhostPal(cls){const k='ghost'+cls;if(!PAL[k])PAL[k]={...PAL.hero,robe:['#c8d6ee','#7a8cb0'],robeB:'#6a7a9c',inner:'#3a4a78',sash:'#3a4a78',hairband:'#6a7ac8',weapon:CLASS[cls].draw,anim:CLASS[cls].anim};return k}
function tombWake(t){
  t.awake=1;const ranged=t.cls==='궁';
  const e=mkMob(`${t.name}의 망령`,t.x,t.y+1.2,{hp:t.hp,atk:t.atk,def:t.def,hm:t.hm,sp:2,reach:ranged?5:CLASS[t.cls].reach,ranged,el:t.el,pal:tombGhostPal(t.cls),hostile:1,boss:1,aggro:9,xp:t.xp,big:1.1});
  e.tomb=t.id;e.ghost=1;e.wcls=t.cls;e.aggro=true;mobs.push(e);
  for(const dx of[-1.4,1.4]){const g=mkMob('강시',t.x+dx,t.y+.6);g.name='무덤을 지키는 강시';g.tombGuard=t.id;g.aggro=true;mobs.push(g)}
  shake=Math.max(shake,.4);fx.push({t:'ring',x:t.x,y:t.y,life:.8,max:.8});
  showBanner(`${t.name}의 무덤`,`${t.life}번째 생 · ${t.realm}`);log(`${t.name}의 망령이 깨어났습니다. 쓰러뜨리면 그 생에 지녔던 물건을 되찾을 수 있습니다.`,'dmg');
}
function tombTick(){
  if(G.duel)return;
  for(const t of tombs()){if((t.reg||'gaebong')!==REG)continue;const d=Math.hypot(t.x-P.x,t.y-P.y);
    const live=mobs.some(m=>m.tomb===t.id&&m.hp>0);
    if(!live&&P.hp>0&&d<TOMB_WAKE)tombWake(t);
    // 멀리 떠나면 망령은 다시 잠든다 (기운을 되찾는다)
    else if(live&&d>TOMB_FORGET){mobs=mobs.filter(m=>m.tomb!==t.id&&m.tombGuard!==t.id);t.awake=0}}
}
function tombKill(e){
  const i=tombs().findIndex(t=>t.id===e.tomb);if(i<0)return;const t=tombs()[i];tombs().splice(i,1);
  const out=t.items.filter(it=>Math.random()<tombDropP(it));
  // 하나도 안 나오면 가장 흔한 물건 하나는 남긴다
  if(!out.length&&t.items.length)out.push(t.items.reduce((a,b)=>tombDropP(b)>tombDropP(a)?b:a));
  out.forEach((it,k)=>{it.id=++itemId;drops.push({x:t.x+(k%3-1)*.4,y:t.y+.4+Math.floor(k/3)*.4,it:{item:it},t:Math.random()*6})});
  for(const m of mobs)if(m.tombGuard===t.id&&m.hp>0)m.hp=0;mobs=mobs.filter(m=>m.tombGuard!==t.id||m.hp>0);
  fx.push({t:'lvl',x:t.x,y:t.y,life:1.2});showBanner('무덤 정화',`${t.name}이(가) 잠들었습니다`);
  log(`${t.name}의 망령이 잠들고 무덤이 허물어졌습니다. 물건 ${out.length}/${t.items.length}개가 남았습니다.`,'xp');
  P.feats.push(`${Math.floor(P.age)}세에 전생 ${t.name}의 망령을 잠재웠다`);
}
function drawTomb(t){
  const p=toScreen(t.x,t.y),live=mobs.some(m=>m.tomb===t.id&&m.hp>0);
  ctx.save();ctx.translate(p.x,p.y);
  // 봉분
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,4,40,15,0,0,7);ctx.fill();
  let g=ctx.createRadialGradient(-8,-14,4,0,-4,40);g.addColorStop(0,'#b09a70');g.addColorStop(.55,'#86704c');g.addColorStop(1,'#4e3f2a');
  ctx.fillStyle='#4a3c28';ctx.beginPath();ctx.ellipse(0,0,36,13,0,0,Math.PI);ctx.fill();
  ctx.fillStyle=g;ctx.strokeStyle='#2a2116';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-36,0);ctx.bezierCurveTo(-30,-8,-16,-27,0,-28);ctx.bezierCurveTo(16,-27,30,-8,36,0);ctx.ellipse(0,0,36,13,0,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(120,150,70,.8)';for(let k=0;k<7;k++){const a=k*.9+1,xx=Math.cos(a)*26,yy=-6-Math.abs(Math.sin(a))*14;ctx.fillRect(xx,yy,2,3);ctx.fillRect(xx+3,yy+1,2,2)}
  ctx.strokeStyle='rgba(20,22,10,.6)';ctx.lineWidth=1;for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(k*8,-22+Math.abs(k)*3);ctx.lineTo(k*9+2,-17+Math.abs(k)*3);ctx.stroke()}
  // 비석
  ctx.fillStyle='#2a2a2c';ctx.fillRect(-7,8,14,4);g=ctx.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#8a8a86');g.addColorStop(1,'#5a5a58');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-6,10);ctx.lineTo(-6,-10);ctx.quadraticCurveTo(0,-15,6,-10);ctx.lineTo(6,10);ctx.fill();
  ctx.fillStyle='#2a2a2a';for(let k=0;k<4;k++)ctx.fillRect(-1,-7+k*4,2,2);
  // 원혼 기운
  const n=live?9:4;for(let k=0;k<n;k++){const a=time*(live?1.6:.7)+k*2.1,r=18+Math.sin(a*1.3+k)*10,yy=-14-((time*14+k*11)%34);
    ctx.fillStyle=`rgba(${live?'190,170,255':'150,170,220'},${(live?.55:.3)*(1-((time*14+k*11)%34)/34)})`;ctx.beginPath();ctx.arc(Math.cos(a)*r,yy,live?3:2,0,7);ctx.fill()}
  ctx.restore();
  if(dist(t,P)<9){const s=`${t.name}의 무덤`;ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(s,p.x+1,p.y-37);ctx.fillStyle='#b8b0ff';ctx.fillText(s,p.x,p.y-38)}
}
// 망령: 반투명하고 푸른 기운이 감돈다
function drawGhost(e){
  const p=toScreen(e.x,e.y);ctx.save();const g=ctx.createRadialGradient(p.x,p.y-30,4,p.x,p.y-30,46);g.addColorStop(0,'rgba(150,140,255,.35)');g.addColorStop(1,'rgba(150,140,255,0)');
  ctx.fillStyle=g;ctx.fillRect(p.x-50,p.y-80,100,100);ctx.globalAlpha=.72+.12*Math.sin(time*3);drawFighter(e,false);ctx.restore()}

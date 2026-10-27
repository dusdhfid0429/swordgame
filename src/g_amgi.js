// ================= 요대와 암기 (v186) =================
// 사용자 2026-10-26: "암기무공 사용시 장비중 요대를 추가하고 암기의 종류에 따라 이펙트 형태를 다르게 하고 수량을 추가" → '암기 개수를 소모'.
// 요대(P.eq.belt)에 고른 암기(belt.am)는 재료(P.mats)에서 한 발에 하나씩 준다. 다 쓰면 초식 원래 모양(기본 비도)으로 나간다.
// 암기 초식의 투사체만 쓴다(r_exec.js exec proj → amgiLoad). 기본 공격·비 초식·특수무공 암기는 그대로. 표는 data/amgi.json
const AMMO=GD.AMMO,BELTS=GD.BELTS;
function mkBelt(q,i=0){const it=mkGear('belt',BELTS[Math.min(i,BELTS.length-1)],q,{hm:GD.BELT_HM});it.am=GD.BELT_GIFT.am;return it}
const beltAmmo=()=>{const b=P.eq.belt;return b&&AMMO[b.am]?b.am:null};
const ammoN=k=>P.mats[k]||0;
// 투사체 하나에 암기를 싣는다. 실을 것이 없으면 false (v190부터 그 발은 나가지 않는다)
function amgiLoad(q){const k=beltAmmo();if(!k||!(ammoN(k)>0))return false;const a=AMMO[k];P.mats[k]--;
  q.ammo=k;q.kind=a.pj;q.m*=a.m||1;
  if(a.spd){q.vx*=a.spd;q.vy*=a.spd}if(a.len)q.left*=a.len;if(a.pierce)q.pierce=true;if(a.kb)q.kb+=a.kb;
  if(a.psn)q.psn=Math.max(q.psn||0,a.psn);if(a.col){q.c=a.col;q.c2=a.col}if(a.boom)q.boom=a.boom;
  if(ammoN(k)===0){P.bareSaid=0;log(`요대의 ${k}을(를) 다 썼습니다. 이제 비도를 손에 쥐고 붙어 싸웁니다(위력·효과 절반).`,'info')}
  return true}
// 벽력자: 맞거나 떨어진 자리에서 터진다. 직접 맞은 적은 빼고 둘레만
function amgiBoom(q){if(q.boomed)return;q.boomed=1;const o={x:q.x,y:q.y},b=q.boom;
  for(const e of foes())if(e.hp>0&&!q.hit.has(e)&&dist(e,o)<b.r)hitE(q.X,e,q.m*b.m,.4,0,o);
  fx.push({t:'puff',x:o.x,y:o.y,life:.5});GL({t:'ring2',x:o.x,y:o.y,r:b.r,col:'255,170,80',w:4,life:.32},q.X);
  GL({t:'star',x:o.x,y:o.y,col:'255,210,120',s:1.3,life:.22},q.X);shake=Math.max(shake,.12)}
// 처음 암기 병기를 들면 가죽 요대와 비도를 한 번 받는다 (새 생·문파 입문·옛 저장 모두)
hook('recalc',()=>{if(!P||P.beltGift||!P.eq.weapon||P.eq.weapon.cls!=='암')return;P.beltGift=1;const g=GD.BELT_GIFT,b=mkBelt(1);
  addMat(g.am,g.n);if(!P.eq.belt){P.eq.belt=b;log(`암기를 담을 ${b.name}를 허리에 찼습니다. ${g.am} ${g.n}${AMMO[g.am].unit}을 넣어 두었습니다.`,'sys')}
  else{giveItem(b);log(`${b.name}와 ${g.am} ${g.n}${AMMO[g.am].unit}을 받았습니다.`,'sys')}});
// 장비 칸 설명과 행낭 창의 암기 고르기 줄
const beltTxt=it=>{const k=AMMO[it.am]?it.am:null;return k?`암기 ${k} ${it===P.eq.belt?ammoN(k)+AMMO[k].unit:''} · ${AMMO[k].d}`:'암기 없음'};
function beltPick(){const b=P.eq.belt;if(!b)return '';
  return `<div class="card"><h4>요대 암기 <small class="dim">암기 초식 한 발에 하나씩 · 다 쓰면 비도를 쥐고 근접(위력·효과 절반)</small></h4><div class="ib">${Object.keys(AMMO).map(k=>B('amk:'+k,`${b.am===k?'● ':''}${k} ${ammoN(k)}`,{pri:b.am===k?1:0})).join('')}</div></div>`}
// ================= 암기 궤적 (v190) =================
// 사용자 2026-10-27: "직선 말고 나선형이나 호를 그리며, 총알처럼 회전하며 강한 한 방", "부채꼴·원형으로 날리다 선형으로 목표물에게", "곧게 꺾여 가기도 하고 부드러운 곡선으로도",
// "암기술이 주재인 무협소설을 참고". 참고한 수법(이름은 초식 설명 줄 PATH_N):
//  · 겹나선 spiral — 당문 독침이 두 가닥으로 꼬여 날아가 막기 어렵다는 묘사 (당가 탈명침류)
//  · 호 arc — 회선표·비황석처럼 옆으로 벌어졌다 휘어 들어와 정면을 막은 상대의 옆구리를 친다
//  · 꺾임 gather — 만천화우·천녀산화: 하늘 가득 흩뿌린 암기가 한 점으로 모인다
//  · 소용돌이 vortex — 폭우이화침(고룡 칠종무기)처럼 쏟아지며 휘몰아친다
//  · 회전 일격 bullet — 소리비도 '例不虛發': 한 번 던지면 헛나가지 않는 단 한 자루. 손에 기를 모았다 회전하며 꿰뚫는다
// 초식 path(data/arts.json AMGI·AMGIU), 수치 GD.AMGI_PATH. 조준(amgiAim)·같은 적 감쇠는 그대로 쓴다
const APATH=GD.AMGI_PATH;
const PATH_N={spiral:'겹나선',arc:'휘어 들기',gather:'흩뿌렸다 꺾임',vortex:'소용돌이',bullet:'회전 일격'};
const angW=d=>Math.atan2(Math.sin(d),Math.cos(d));
// 적이 없을 때 휘는 궤적이 모일 자리: 바라보는 쪽 사거리 0.6
const amgiAimPt=len=>({x:P.x+P.fx*len*.6,y:P.y+P.fy*len*.6});
// 쏜 투사체에 궤적을 붙인다. a0 = 초식 본래 모양(부채꼴·원형)의 방향, i 몇 번째 발, n 발 수
// 겨눈 적이 없는 남는 발(둘러싸였을 때)은 휘지 않고 곧게 간다
function amgiFly(q,path,a0,tg,aim,i,n){const T=APATH[path];if(!T||!tg&&!aim&&(path==='arc'||path==='gather'))return;const sp=Math.hypot(q.vx,q.vy);
  q.path=path;q.tg=tg;q.aim=tg?{x:tg.x,y:tg.y}:{...aim};q.age=0;q.sp=sp;let a=Math.atan2(q.vy,q.vx);
  if(path==='arc'){const b=Math.atan2(q.aim.y-q.y,q.aim.x-q.x),d=angW(a0-b),side=Math.abs(d)>.02?Math.sign(d):(i%2?-1:1);const off=side*T.bend+(n>1?d*.5:0);a=b+off;q.k=Math.max(T.turn,2*Math.abs(off)*sp/Math.max(.6,dist(q,q.aim))*1.1);q.left*=APATH.len}   // 원호 하나로 목표에 닿는 회전 속도
  else if(path==='gather'){a=a0;q.t1=T.t+i*T.dt;q.left*=APATH.len}
  else if(path==='vortex'){q.o={x:q.x,y:q.y};q.th=a0;q.r=0;q.left*=APATH.len}
  else if(path==='spiral'){q.b={x:q.x,y:q.y};q.ph0=i%2?Math.PI:0}
  else if(path==='bullet'){q.sp*=T.spd;q.spin=0}
  q.vx=Math.cos(a)*q.sp;q.vy=Math.sin(a)*q.sp}
// 한 틱 움직인다 (r_exec.js updateProjs가 path 있는 투사체에 부른다). 실제로 간 길만큼 사거리를 줄인다
function amgiMove(q,dt){const T=APATH[q.path],ox=q.x,oy=q.y;q.age+=dt;
  if(q.tg&&q.tg.hp>0&&!q.hit.has(q.tg)){q.aim.x=q.tg.x;q.aim.y=q.tg.y}
  const steer=k=>{if(q.done)return;const h=Math.atan2(q.vy,q.vx),d=angW(Math.atan2(q.aim.y-q.y,q.aim.x-q.x)-h),s=Math.hypot(q.vx,q.vy),nh=h+Math.max(-k*dt,Math.min(k*dt,d));q.vx=Math.cos(nh)*s;q.vy=Math.sin(nh)*s};
  const near=()=>{if(!q.done&&(dist(q,q.aim)<.45||q.tg&&q.hit.has(q.tg)))q.done=1};
  switch(q.path){
    case'spiral':{const b=q.b;b.x+=q.vx*dt;b.y+=q.vy*dt;const R=T.r*Math.min(1,q.age*T.grow),w=q.age*T.w+q.ph0,sn=Math.sin(w)*R/q.sp;
      q.x=b.x-q.vy*sn;q.y=b.y+q.vx*sn;q.hz=Math.cos(w)*R*T.hz;break}
    case'vortex':{q.r+=q.sp*T.grow*dt;q.th+=T.w*dt/(1+q.r*1.5);q.x=q.o.x+Math.cos(q.th)*q.r;q.y=q.o.y+Math.sin(q.th)*q.r;
      if(q.tg&&q.age>T.home){const s=q.sp*APATH.gather.boost,a=Math.atan2(q.aim.y-q.y,q.aim.x-q.x);q.path='gather';q.t1=0;q.turned=1;q.vx=Math.cos(a)*s;q.vy=Math.sin(a)*s;q.left=Math.max(q.left,dist(q,q.aim)+1.2);amgiTurnFx(q)}break}
    case'arc':steer(q.k*(1+q.age*T.acc));near();q.x+=q.vx*dt;q.y+=q.vy*dt;break;
    case'gather':{const G=APATH.gather;if(q.age<q.t1){q.x+=q.vx*G.spd*dt;q.y+=q.vy*G.spd*dt;break}
      if(!q.turned){q.turned=1;const a=Math.atan2(q.aim.y-q.y,q.aim.x-q.x),s=q.sp*G.boost;q.vx=Math.cos(a)*s;q.vy=Math.sin(a)*s;q.left=Math.max(q.left,dist(q,q.aim)+1.2);amgiTurnFx(q)}
      if(q.tg&&!q.done)steer(30);near();q.x+=q.vx*dt;q.y+=q.vy*dt;break}
    default:q.spin=(q.spin||0)+dt*45;q.x+=q.vx*dt;q.y+=q.vy*dt}
  const mv=Math.hypot(q.x-ox,q.y-oy);q.left-=mv;if(dt>0){q.dvx=(q.x-ox)/dt;q.dvy=(q.y-oy)/dt}return true}
// 꺾이는 자리에 작은 번뜩임
function amgiTurnFx(q){GL({t:'star',x:q.x,y:q.y,col:q.c,s:.45,life:.14},q.X)}
// 회전 일격: 손끝에 기를 모은다
function amgiCharge(X,c){const T=APATH.bullet;GL({t:'vortex',x:P.x,y:P.y,r:.8,col:c,w:2,life:T.charge+.06},X);fx.push({t:'ghost',x:P.x,y:P.y,life:.2,col:c})}
// 회전 일격이 맞은 자리: 꿰뚫는 충격
function amgiImpact(q,e){GL({t:'ring2',x:e.x,y:e.y,r:.9,col:q.c,w:4,life:.3},q.X);GL({t:'star',x:e.x,y:e.y,col:'255,255,255',s:1.4,life:.2},q.X);
  fParts(q.X,e,q.c,10,110,'dot',.45);shake=Math.max(shake,.2)}
// 회전 일격 그림: 탄도에 감기는 두 가닥 강선(腔線) 같은 빛줄기와, 축을 따라 도는 몸통(세로로 줄었다 늘었다)
function drawBulletSpin(q,s){const sp=q.spin||0;
  for(let k=0;k<2;k++){ctx.strokeStyle=rgba(k?HI:q.c,.75);ctx.lineWidth=1.3*s;ctx.beginPath();for(let x=-44;x<=2;x+=3){const y=Math.sin(x*.32+sp+k*Math.PI)*4.5*s*(1+x/60);x===-44?ctx.moveTo(x*s,y):ctx.lineTo(x*s,y)}ctx.stroke()}
  glowDot(4*s,0,12*s,q.c,.55);ctx.scale(1,.35+.65*Math.abs(Math.cos(sp)))}
// ================= 요대가 비면 비도를 쥐고 근접 (v190) =================
// 사용자 2026-10-27: "요대에 암기가 없으면 비도를 손에 쥔 채 싸우는 근접 형태의 무공, 암기로 쓸 때보다 데미지나 무공 효과는 반감".
// 암기 초식(투사체·비)만 바뀐다. 기본 공격은 그대로. 위력 = 한 적에게 다 맞혔을 때(같은 적 감쇠 포함)의 ABARE.m 배, 독·기절·밀침도 ABARE.fx 배
const ABARE=GD.AMGI_BARE;
let AMGI_FREE=false;   // 이펙트 뷰어 '초식 본래 모양'만 켠다: 암기 없이도 던진다
const amgiBare=()=>!AMGI_FREE&&!(beltAmmo()&&ammoN(beltAmmo())>0);
function amgiStab(f,e,X){const c=X.art.c,n=f.p==='rain'?f.cnt:f.cnt||1,many=f.full||f.p==='rain'||n>=3,
    m=f.m*(1+(Math.min(n,AIM.cap)-1)*AIM.over)*ABARE.m,stun=(f.stun||0)*ABARE.fx,kb=(f.kb||.3)*ABARE.fx,psn=f.psn?f.psn*ABARE.fx:0;
  if(!P.bareSaid){P.bareSaid=1;log(`요대에 암기가 없어 비도를 손에 쥐고 붙어 싸웁니다. 위력과 효과는 절반입니다.`,'info')}
  const R=ABARE.r,ts=foes().filter(o=>{if(o.hp<=0)return false;const dx=o.x-P.x,dy=o.y-P.y,d=Math.hypot(dx,dy);return d<R&&(f.full||d<.3||(dx*P.fx+dy*P.fy)/d>Math.cos(many?ABARE.arc/2:.6))});
  if(!many&&e&&e.hp>0&&dist(e,P)<R)face(e.x,e.y);
  const list=many?ts:ts.sort((a,b)=>dist(a,P)-dist(b,P)).slice(0,1);anim(.2);
  for(const o of list){hitE(X,o,m,kb,stun,P,true);fxHit(X,o,.6);if(psn&&o.hp>0){o.psn=Math.max(o.psn||0,psn);o.psnD=Math.max(o.psnD||0,2,atk()*.12*f.m*ABARE.m);o.aggro=true}}
  const a=Math.atan2(P.fy,P.fx);
  if(f.full){fSpin(X,P,R,c,2,.24);GL({t:'dag',x:P.x,y:P.y,a0:a,a1:a+Math.PI*2,r:.85,col:c,life:.24},X)}
  else{const sp=many?ABARE.arc:.7;fArc(X,R*.85,sp,c,2,.18);GL({t:'dag',x:P.x,y:P.y,a0:a-sp/2,a1:a+sp/2,r:.8,col:c,life:.18},X)}}
// 손에 쥔 비도가 휘둘러지는 그림 (r_fx.js drawGlow2 → 't:dag')
function drawDag(f){const k=f.life/f.max,t=1-k,a=f.a0+(f.a1-f.a0)*Math.min(1,t*1.4),p=toScreen(f.x+Math.cos(a)*f.r,f.y+Math.sin(a)*f.r),o=toScreen(f.x,f.y),
    ang=Math.atan2(p.y-o.y,p.x-o.x);ctx.save();ctx.translate(p.x,p.y-26);ctx.rotate(ang);ctx.globalAlpha*=Math.min(1,k*3);
  ctx.fillStyle='#4a3a2c';ctx.fillRect(-9,-1.3,6,2.6);ctx.fillStyle='#b8a070';ctx.fillRect(-3.4,-3.4,1.8,6.8);
  ctx.fillStyle='#c9d2dc';ctx.beginPath();ctx.moveTo(-1.6,-2.2);ctx.lineTo(9,-1);ctx.lineTo(14,0);ctx.lineTo(9,1);ctx.lineTo(-1.6,2.2);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#f4f8ff';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-1,0);ctx.lineTo(13,0);ctx.stroke();glowDot(13,0,6,f.col,.6*k);ctx.restore()}

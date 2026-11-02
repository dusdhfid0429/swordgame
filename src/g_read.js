// ================= 전투 가독성 (v219, 개선 계획 4절 · 동훈님 2026-11-01) =================
// 평가에서 "싸울 때 내 캐릭터가 어디 있는지 모르겠다"가 나왔다. 그림은 그대로 두고 표시만 더한다. 수치는 data/read.json (READ)
//  1) 주인공 발밑에 심법 색 고리. 싸울 때는 더 진하고 살짝 뛴다
//  2) 싸울 때 주인공 몸에 심법 색의 엷은 테두리(그림자 번짐)
//  3) 싸울 때 NPC·지나가는 무인 이름표를 흐리게 (적장·겨눈 적·동료·우두머리 이름은 그대로)
//  4) 피해 숫자: 내가 준 것(희게), 치명타(금빛·크게·튀어 오름), 내가 받은 것(붉게·굵게·왼쪽), 남끼리 준 것(작고 흐리게)
//  5) 싸울 때 카메라를 READ.zoom.fight 배로 당긴다. 싸움이 끝나고 READ.fight.hold 초 뒤에 돌아온다
const READ=GD.READ;
let rdFight=0,rdLast=-99,rdZ=1,rdDimA=1;
const fightOn=()=>rdFight>0;
// 고리·테두리 색: 펼치는 심법 색. 마공처럼 거의 검은 색이면 보조색으로 (검은 고리는 밤에 안 보인다)
function heroCol(){const pr=typeof pFxPair==='function'?pFxPair():null;if(!pr)return'230,200,120';return isDark(pr[0])?pr[1]:pr[0]}
function heroRing(sh){const R=READ.ring,f=rdFight,a=(R.a+(R.fightA-R.a)*f)*(sh||1),pu=1+R.pulse*f*Math.sin(time*6);
  ctx.save();ctx.strokeStyle=`rgba(${heroCol()},${a})`;ctx.lineWidth=R.w+f;ctx.beginPath();ctx.ellipse(0,0,R.rx*pu,R.ry*pu,0,0,7);ctx.stroke();
  if(f>.05){ctx.strokeStyle=`rgba(${heroCol()},${a*.35*f})`;ctx.lineWidth=R.w*3;ctx.beginPath();ctx.ellipse(0,0,R.rx*pu+2,R.ry*pu+1,0,0,7);ctx.stroke()}ctx.restore()}
// on: drawSheet 앞에서 켜고(flash 중이면 안 켠다), off=1 이면 끈다
function heroGlow(flash,off){if(off){ctx.shadowBlur=0;ctx.shadowColor='transparent';return}if(flash||rdFight<.05)return;
  const dpr=C.width/Math.max(1,W*S),G2=READ.glow;ctx.shadowColor=`rgba(${heroCol()},${G2.a*rdFight})`;ctx.shadowBlur=G2.blur*S*dpr;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0}
const nameDim=()=>rdDimA;
// 피해 숫자
function numDraw(t,p,k){const N=READ.num[t.k]||READ.num.out;let y=p.y-74-k*22,x=p.x,sc=1;
  if(t.k==='in'){x+=N.dx;y=p.y-62-k*26}
  if(t.k==='crit'){const u=Math.min(1,k*6);sc=1+(N.pop-1)*(1-u)*(1-u);y=p.y-80-k*20}
  if(N.a)ctx.globalAlpha*=N.a;
  const big=t.big&&t.k==='in';ctx.font=`${big?'bold 24px':N.font} "Song Myung",serif`;
  if(sc!==1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);x=0;y=0}
  ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.strokeText(t.t,x,y);ctx.fillStyle=t.k==='far'?N.col:t.k==='out'?t.c||N.col:N.col;ctx.fillText(t.t,x,y);
  if(sc!==1)ctx.restore()}
// 싸움 여부와 카메라 당김
function rdZoomApply(){if(typeof S_BASE!=='number'||!VW_PX)return;const s=S_BASE*rdZ;if(Math.abs(S-s)<1e-4)return;S=s;W=VW_PX/S;H=VH_PX/S}
hook('tick',dt=>{if(!P)return;
  const now=inCombat()||P.lastHit<1.2||(P.target&&P.target.hp>0&&time-(P.lastAtk||-99)<1.2);if(now)rdLast=time;
  const on=time-rdLast<READ.fight.hold;rdFight=clamp(rdFight+(on?dt*4:-dt*1.5),0,1);
  rdDimA=1-(1-READ.dimName)*rdFight;
  if(typeof fClash!=='undefined'&&fClash)return;   // v226: 내공 대결 중에는 g_fight.js clashCam이 실제 시간으로 당긴다
  const Z=READ.zoom,tz=on&&!rdNoZoom()?Z.fight:1;rdZ+=(tz-rdZ)*Math.min(1,dt*(tz>rdZ?Z.in:Z.out));if(Math.abs(rdZ-tz)<.005)rdZ=tz;rdZoomApply()});
// 당기지 않는 때: 결전장(넓게 봐야 한다)·비무 관전·말 위, 주소에 ?zoom=0
const RD_Q=new URLSearchParams(location.search).get('zoom')==='0';
const rdNoZoom=()=>RD_Q||REG==='war_field'||!!P.ride;

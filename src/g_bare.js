// ================= 내공이 바닥났을 때의 맨 공격 (v214) =================
// 사용자 2026-10-31 "내공이 모두 떨어지면 검기나 강기 같은 이펙트가 나가지 않게, 내공이 없을 때 공격에 적용되는 심플한 이펙트를 무기별로.
//  내공이 없는 걸 알려 주려는 것이라 화려할 필요 없고 무기의 형태와 사거리에 맞게 심플하게."
// 내공이 BAREFX.min 아래면 기본 공격(basicStrike)은 X.bare 를 달고 나간다. 그러면
//  - 무공 색 반달·찌르기(fArc)·타격 별(fxHit)·심법 속성 재질(glFx)을 그리지 않는다
//  - 경지의 검기·검사·검강(g_realmfx.js)과 화경 이후 병기 기운(g_blade.js), 음공 고리(g_lore.js)가 붙지 않는다
//  - 주인공 공격 장은 이펙트가 그려진 actfx 시트 대신 맨 동작 act 시트를 쓴다 (r_atlas.js heroAtk)
//  - 대신 병기 모양·사거리를 따르는 잿빛 궤적 하나(t:'bare', 빛 섞기 없이 보통 그림)와 작은 타격 자국만 남는다
// 표는 data/barefx.json BAREFX. 휘두르기(검·도·봉·단·편·각)는 사거리 둘레의 가는 호, 창은 곧은 한 줄, 권은 짧게 뻗는 주먹 줄과 작은 고리. 궁·암은 쏜 화살·암기 그대로(꼬리만 잿빛)
const BAREFX=GD.BAREFX;
const noQi=()=>!!P&&P.qi<BAREFX.min;
const bareKey=X=>{const c=X&&X.art&&X.art.cls;return c==='권'&&P.atkRow==='각'?'각':c};   // 권 기본 공격의 세 번에 한 번은 발차기 (heroAtk)
function bareSwing(X,e){const k=bareKey(X),S=BAREFX.w[k]||BAREFX.w.검;
  if(e)bareHit(e,S.hit);if(S.mo==='none')return;
  const C=CLASS[k==='각'?'권':k]||CLASS.검,L=BAREFX.life;
  fx.push({t:'bare',k,x:P.x,y:P.y,z:P.z||0,ang:sang(),r:C.reach*(S.rk||1),flip:(P.flipC=!P.flipC),life:L,max:L})}
// 맞은 자리: 베는 병기는 짧은 칼자국 한 줄, 찌르기·화살은 작은 점, 뭉툭한 병기(봉·권·각)는 먼지 한 줌
function bareHit(e,h){if(h==='blunt')fx.push({t:'dust',x:e.x-.05,y:e.y-.05,life:.45});
  fx.push({t:'bareHit',h,x:e.x,y:e.y,z:e.z||0,a:Math.random()*.6-.3,life:.2,max:.2})}

// ---- 그리기 (r_fx.js drawFx 가 넘긴다) ----
function drawBare(f){const S=BAREFX.w[f.k]||BAREFX.w.검,p=toScreen(f.x,f.y),k=f.life/f.max,pr=1-k,fade=Math.min(1,k*2.5),col=BAREFX.col,lw=S.lw||1.4;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  // 밝은 돌바닥·눈밭에서도 보이게 아래로 1.5px 비킨 어두운 그림자 한 줄을 먼저 긋는다
  const stroke=pts=>{ctx.strokeStyle=rgba(BAREFX.shade,.35*fade);ctx.lineWidth=lw+1.5;path(pts.map(q=>[q[0],q[1]+1.5]));ctx.stroke();ctx.strokeStyle=rgba(col,.16*fade);ctx.lineWidth=lw*3;path(pts);ctx.stroke();ctx.strokeStyle=rgba(col,.7*fade);ctx.lineWidth=lw;path(pts);ctx.stroke()};
  if(S.mo==='swing'){const[rx,ry]=isoR(f.r*.86),th=Math.atan2(Math.sin(f.ang)*rx,Math.cos(f.ang)*ry),cy=p.y-(S.h??26),
      arc=(dir,rk,sh)=>{const head=Math.min(1,(pr-sh)/.3),tail=Math.max(0,(pr-sh-.25)/.6);if(head-tail<.03)return;const a0=th-dir*S.sp/2,pts=[];
        for(let i=0;i<=16;i++){const a=a0+dir*S.sp*(tail+(head-tail)*i/16);pts.push([p.x+Math.cos(a)*rx*rk,cy+Math.sin(a)*ry*rk])}stroke(pts)};
    const d=f.flip?-1:1;arc(d,1,0);if(S.dbl)arc(-d,.8,.18)}
  else{const c=Math.cos(f.ang),s=Math.sin(f.ang),[rx,ry]=isoR(f.r*.86),R=rx*ry/Math.hypot(ry*c,rx*s),ox=p.x+c*6,oy=p.y-26+s*6,nx=-s,ny=c;
    const head=Math.min(1,pr/(S.mo==='punch'?.18:.24)),tail=Math.max(0,(pr-.3)/.7);
    if(head-tail>.03){const seg=(o,a,b)=>stroke([[ox+c*R*a+nx*o,oy+s*R*a+ny*o],[ox+c*R*b+nx*o,oy+s*R*b+ny*o]]);
      if(S.mo==='punch'){seg(0,tail,head);seg(4,tail+.25,head*.8);seg(-4,tail+.25,head*.8)}else seg(0,tail,head)}
    if(S.mo==='punch'&&head>=1){const u=Math.min(1,(pr-.18)/.5),hx=ox+c*R,hy=oy+s*R;ctx.strokeStyle=rgba(col,.55*(1-u));ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(hx,hy,3+u*7,(3+u*7)*.6,0,0,7);ctx.stroke()}}
  ctx.restore()}
function drawBareHit(f){const p=toScreen(f.x,f.y),k=f.life/f.max,cy=p.y-26,col=BAREFX.col;ctx.save();ctx.lineCap='round';
  if(f.h==='cut'){const L=9,c=Math.cos(.8+f.a),s=Math.sin(.8+f.a);ctx.strokeStyle=rgba(col,.8*k);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(p.x-c*L,cy-s*L);ctx.lineTo(p.x+c*L,cy+s*L);ctx.stroke()}
  else if(f.h==='poke'){ctx.fillStyle=rgba(col,.8*k);ctx.beginPath();ctx.arc(p.x,cy,2,0,7);ctx.fill();ctx.strokeStyle=rgba(col,.5*k);ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,cy,4+(1-k)*5,0,7);ctx.stroke()}
  else{ctx.strokeStyle=rgba(col,.6*k);ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(p.x,cy+6,5+(1-k)*8,(5+(1-k)*8)*.55,0,0,7);ctx.stroke()}
  ctx.restore()}

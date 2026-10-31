// ================= 속성 재질: 무공 이펙트에 심법 속성을 덧입힌다 =================
// 사용자 요청(2026-10-21): "무공은 종류가 다양하지만 결국 공격 패턴이 비슷하고 연출이 겹친다. 내공에 특성을 넣었으니 그 효과에 맞는 이펙트를 — 화는 불, 수는 물, 뇌는 번개"
// 모양(반달·회전·고리·직선·낙뢰…)과 색(문파 색)은 그대로 두고, 그 모양을 따라 속성의 재질 입자를 얹는다:
//  화 불길·불티 / 수 물방울·물결 / 목 잎 / 금 쇳조각·칼빛 / 토 돌·흙먼지·갈라짐 / 양 햇살 / 음 서리꽃·찬 안개 / 뇌 잔번개 / 마 검은 연기
// 표는 data/elfx.json EL_FX(속성마다 입자 종류·배율·색), r_exec.js GL 이 glFx 훅을 부르고, 투사체는 tick 훅에서 꼬리를 남긴다
const EL_FX=GD.EL_FX,EL_FX_N=GD.EL_FX_N,EL_HARM=GD.EL_HARM;
// v169b (사용자 2026-10-22 "심법 영향 이펙트만 너무 강조되어 조화롭지 못하다, 무공 이펙트와 자연스럽게 섞이게"): 재질 입자의 색을 무공 보조색(a.c2) 쪽으로
// EL_HARM.tint 만큼 물들이고, 크기(size)·진하기(alpha)를 줄인다. 심지(HI)도 무공 보조색을 따른다. 마기 연기는 검은색 그대로 둔다
const elCol=(col,X)=>{const c2=X&&X.art&&X.art.c2;return c2&&!isDark(col)?mixCol(col,c2,EL_HARM.tint,1):col};
const ELFX_SKIP={crackle:1,parts:1};   // 뇌기 잔번개(crackle)는 이미 속성 연출이다
// 모양마다 입자가 날 자리: 기준점(o.x,o.y)의 화면 좌표에서 떨어진 ox,oy, 땅 높이 gy, 늦게 나는 시간 d
function elEmit(o,n){const out=[],L=o.max||o.life,R=Math.random;
  const ell=(rx,ry,cy,u0,u1,dl)=>{for(let i=0;i<n;i++){const u=R(),a=u0+(u1-u0)*u;out.push({ox:Math.cos(a)*rx,oy:cy+Math.sin(a)*ry,gy:Math.sin(a)*ry,d:dl*u*L})}};
  if(o.t==='arc'){const rx=o.r*55,ry=o.r*32,th=Math.atan2(Math.sin(o.ang)*rx,Math.cos(o.ang)*ry),sp=o.spread,dir=o.flip?-1:1,a0=th-dir*sp/2;
    for(let i=0;i<n;i++){const u=R(),a=a0+dir*sp*u;out.push({ox:Math.cos(a)*rx,oy:-26+Math.sin(a)*ry-8*o.r*Math.sin(u*Math.PI),gy:Math.sin(a)*ry,d:u*.32*L})}}
  else if(o.t==='thrust'){const g=thrustGeo(o);for(let i=0;i<n;i++){const u=R();out.push({ox:g.ux*(6+g.L*u)+(R()-.5)*8,oy:-26+g.uy*(6+g.L*u)+(R()-.5)*8,gy:g.uy*g.L*u,d:u*.22*L})}}
  else if(o.t==='spin'){const[rx,ry]=isoR(o.r);ell(rx,ry,-16,0,6.283,.45)}
  else if(o.t==='ring2'||o.t==='vortex'){const[rx,ry]=isoR(o.r);ell(rx*(o.t==='vortex'?.8:1),ry*(o.t==='vortex'?.8:1),0,0,6.283,o.t==='vortex'?.6:.15)}
  else if(o.t==='line'||o.t==='zap'){const a=toScreen(o.x,o.y),b=toScreen(o.ex,o.ey);
    for(let i=0;i<n;i++){const u=R();out.push({ox:(b.x-a.x)*u+(R()-.5)*10,oy:(b.y-a.y)*u-26+(R()-.5)*8,gy:(b.y-a.y)*u,d:u*.25*L})}}
  else{const cy=o.t==='bolt'?-6:-28;for(let i=0;i<n;i++)out.push({ox:(R()-.5)*16,oy:cy+(R()-.5)*14,gy:(R()-.5)*6,d:R()*.05})}
  return out}
const SWEEP={arc:1,thrust:1,spin:1,ring2:1,line:1,zap:1,vortex:1};
// 입자 하나: 종류마다 수명·속도·크기를 정한다 (그림은 elDraw)
function elPart(k,e){const R=Math.random,a=R()*6.283,q={...e,k,r:R(),rot:R()*6.283};
  switch(k){
    case'flame':q.L=.55+R()*.4;q.vx=(R()-.5)*24;q.vy=-(55+R()*60);q.s=9+R()*8;break;
    case'ember':q.L=.6+R()*.5;q.vx=(R()-.5)*50;q.vy=-(60+R()*80);q.s=1.4+R();break;
    case'drop':q.L=.55+R()*.3;q.vx=Math.cos(a)*(40+R()*60);q.vy=-(100+R()*120);q.s=2.2+R()*1.6;break;
    case'ripple':q.L=.6+R()*.3;q.s=9+R()*8;q.d+=.12;break;
    case'leaf':q.L=.8+R()*.5;q.vx=Math.cos(a)*(40+R()*50);q.vy=-(40+R()*60);q.s=5+R()*2.5;break;
    case'shard':q.L=.32+R()*.2;q.vx=Math.cos(a)*(150+R()*120);q.vy=Math.sin(a)*(90+R()*70)-60;q.s=10+R()*9;break;
    case'glint':q.L=.25+R()*.15;q.s=8+R()*8;q.d+=R()*.1;break;
    case'rock':q.L=.6+R()*.3;q.vx=Math.cos(a)*(30+R()*60);q.vy=-(120+R()*130);q.s=3.6+R()*3.4;q.n=4+(R()*2|0);break;
    case'dust':q.L=.6+R()*.4;q.vx=Math.cos(a)*25;q.vy=-(8+R()*12);q.s=9+R()*8;q.oy=q.gy;break;
    case'crack':q.L=.9;q.s=20+R()*26;q.oy=q.gy;break;
    case'ray':q.L=.4+R()*.3;q.s=14+R()*18;break;
    case'frost':q.L=.8+R()*.5;q.vx=(R()-.5)*30;q.vy=-(10+R()*30);q.s=4.5+R()*3;break;
    case'mist':q.L=.8+R()*.4;q.vx=(R()-.5)*20;q.vy=-4;q.s=14+R()*12;break;
    case'spark':q.L=.18+R()*.18;q.s=16+R()*18;q.d+=R()*.15;break;
    case'smoke':q.L=.7+R()*.5;q.vx=(R()-.5)*24;q.vy=-(30+R()*40);q.s=6+R()*6;break}
  q.s*=EL_HARM.size;return q}
// 무공 이펙트 하나(o)에 속성 재질을 덧입힌다. X 가 없거나(경지 효과 등) 속성 표에 없으면 그냥 둔다
function elFx(o,X,el){el=el||(X&&X.art&&typeof artEl==='function'?artEl(X.art):null);const E=EL_FX[el];if(!E||ELFX_SKIP[o.t])return;
  const t=X?X.t:0,base=(SWEEP[o.t]?EL_FX_N.sweep:EL_FX_N.burst)+EL_FX_N.tier*t,ps=[];
  for(const[k,m,c0]of E.parts){const n=Math.max(1,Math.round(base*m)),col=elCol(c0,X);for(const e of elEmit(o,n))ps.push({...elPart(k,e),col})}
  const L=Math.max(...ps.map(q=>q.d+q.L));fx.push({t:'el',el,glow:true,dim:1,x:o.x,y:o.y,z:o.z,ps,life:L,max:L,col:'255,255,255',c2:X&&X.art&&X.art.c2})}
hook('glFx',(o,X)=>elFx(o,X));
// 투사체 꼬리: 날아가는 동안 조금씩 속성 입자를 흘린다
hook('tick',dt=>{for(const q of projs){if(!q.X||!q.X.art||!q.X.key||q.X.bare)continue;   // 내공 없는 맨 화살·암기는 속성 꼬리 없이 (g_bare.js)
  q.elT=(q.elT||0)-dt;if(q.elT>0)continue;q.elT=.06;
  const el=artEl(q.X.art),E=EL_FX[el];if(!E)continue;const ps=[];
  for(const[k,m,c0]of E.parts){if(k==='crack'||k==='ripple')continue;const n=Math.max(1,Math.round(EL_FX_N.trail*m)),col=elCol(c0,q.X);
    for(let i=0;i<n;i++)ps.push({...elPart(k,{ox:(Math.random()-.5)*8,oy:-24+(Math.random()-.5)*8,gy:0,d:0}),col})}
  const L=Math.max(...ps.map(p=>p.L));fx.push({t:'el',el,glow:true,dim:1,x:q.x,y:q.y,ps,life:L,max:L,col:'255,255,255',c2:q.X.art.c2});fxPw(fx[fx.length-1],q.X,false)}});

// ---- 그리기 (r_fx.js drawGlow2 가 부른다. 더하기 합성이 기본, 돌·흙·잎·연기는 보통 합성) ----
const EL_SOLID={rock:1,dust:1,crack:1,leaf:1,smoke:1};
const SPK=[];
// 살아 있는 재질 입자가 많을수록 하나하나를 흐리게 그린다 (겹치면 하얗게 타서 무공 모양이 묻힌다, EL_FX_N.dense)
const ELD={t:-1,k:1};
function elDense(){if(ELD.t===time)return ELD.k;let n=0;for(const f of fx)if(f.t==='el')n+=f.ps.length;ELD.t=time;return ELD.k=Math.min(1,Math.sqrt(EL_FX_N.dense/Math.max(1,n)))}
function drawEl(f){SPK.length=0;const p=toScreen(f.x,f.y),T=f.max-f.life,mode=ctx.globalCompositeOperation,ga=ctx.globalAlpha;ctx.globalAlpha=ga*elDense()*EL_HARM.alpha;ctx.lineCap='round';
  for(const q of f.ps){const a=T-q.d;if(a<0||a>q.L)continue;const u=a/q.L,fade=u<.1?u/.1:1-u*u;
    ctx.globalCompositeOperation=EL_SOLID[q.k]?'source-over':'lighter';
    const x0=p.x+q.ox,y0=p.y+q.oy,gr=p.y+q.gy,c=q.col;
    switch(q.k){
      case'flame':{const x=x0+q.vx*a+Math.sin(a*14+q.r*6)*3,y=y0+q.vy*a,s=q.s*(1-u*.6),hot=u<.2?'255,225,150':u<.6?c:'210,60,25';
        glowDot(x,y,s*1.5,hot,.25*fade);ctx.fillStyle=rgba(hot,.75*fade);ctx.beginPath();ctx.moveTo(x,y-s*1.7);ctx.quadraticCurveTo(x+s*.8,y,x,y+s*.6);ctx.quadraticCurveTo(x-s*.8,y,x,y-s*1.7);ctx.fill();break}
      case'ember':{const x=x0+q.vx*a+Math.sin(a*9+q.r*5)*5,y=y0+q.vy*a;ctx.fillStyle=rgba(c,fade);ctx.fillRect(x-q.s/2,y-q.s/2,q.s,q.s);break}
      case'drop':{const x=x0+q.vx*a,vy=q.vy+900*a,y=Math.min(gr,y0+q.vy*a+450*a*a);if(y>=gr&&vy>0){glowDot(x,gr,6,c,.4*fade,.4);break}
        ctx.strokeStyle=rgba(c,.9*fade);ctx.lineWidth=q.s;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-q.vx*.03,y-vy*.03);ctx.stroke();ctx.fillStyle=rgba(HI,fade);ctx.fillRect(x-.8,y-.8,1.6,1.6);break}
      case'ripple':{const r=q.s*(.4+u*2.2);ctx.strokeStyle=rgba(c,.7*(1-u));ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x0,gr,r,r*.42,0,0,7);ctx.stroke();
        ctx.strokeStyle=rgba(c,.35*(1-u));ctx.beginPath();ctx.ellipse(x0,gr,r*.6,r*.25,0,0,7);ctx.stroke();break}
      case'leaf':{const x=x0+q.vx*a+Math.sin(a*5+q.r*6)*9,y=y0+q.vy*a+70*a*a,ro=q.rot+a*9,sx=Math.cos(a*7+q.r*4);
        ctx.save();ctx.translate(x,y);ctx.rotate(ro);ctx.scale(1,Math.max(.25,Math.abs(sx)));ctx.fillStyle=rgba(sx>0?c:'60,140,60',.9*fade);
        ctx.beginPath();ctx.moveTo(-q.s,0);ctx.quadraticCurveTo(0,-q.s*.6,q.s,0);ctx.quadraticCurveTo(0,q.s*.6,-q.s,0);ctx.fill();ctx.strokeStyle=rgba('210,255,190',.6*fade);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-q.s,0);ctx.lineTo(q.s,0);ctx.stroke();ctx.restore();break}
      case'shard':{const x=x0+q.vx*a,y=y0+q.vy*a+220*a*a,ang=Math.atan2(q.vy+440*a,q.vx),l=q.s*(1-u*.4);
        ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=rgba(c,.95*fade);ctx.beginPath();ctx.moveTo(l*.6,0);ctx.lineTo(-l*.4,1.4);ctx.lineTo(-l*.4,-1.4);ctx.fill();ctx.restore();break}
      case'glint':{const s=q.s*Math.sin(u*Math.PI);ctx.fillStyle=rgba(c,1);for(const ang of[0,Math.PI/2]){ctx.save();ctx.translate(x0,y0);ctx.rotate(ang+.4);
        ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(0,-1.2);ctx.lineTo(s,0);ctx.lineTo(0,1.2);ctx.fill();ctx.restore()}glowDot(x0,y0,s*1.2,c,.6);break}
      case'rock':{let y=y0+q.vy*a+520*a*a;const x=x0+q.vx*Math.min(a,q.L*.7);if(y>gr)y=gr;const s=q.s;
        ctx.save();ctx.translate(x,y);ctx.rotate(q.rot+(y<gr?a*8:0));ctx.fillStyle=rgba(c,fade);ctx.beginPath();for(let i=0;i<q.n;i++){const g=i/q.n*6.283,rr=s*(.75+.35*Math.sin(i*2.3+q.r*9));i?ctx.lineTo(Math.cos(g)*rr,Math.sin(g)*rr):ctx.moveTo(Math.cos(g)*rr,Math.sin(g)*rr)}ctx.closePath();ctx.fill();
        ctx.fillStyle=rgba('80,60,40',.8*fade);ctx.fillRect(-s*.3,0,s*.7,s*.4);ctx.restore();break}
      case'dust':{const x=x0+q.vx*a,y=y0+q.vy*a,r=q.s*(.6+u*1.4);ctx.fillStyle=rgba(c,.3*(1-u));ctx.beginPath();ctx.ellipse(x,y,r,r*.5,0,0,7);ctx.fill();break}
      case'crack':{const pr=Math.min(1,u*5),al=u<.7?.8:(1-u)/.3*.8;ctx.strokeStyle=rgba(c,al);ctx.lineWidth=1.6;ctx.beginPath();let x=x0,y=gr;ctx.moveTo(x,y);
        for(let i=1;i<=4;i++){const t=i/4*pr,ang=q.rot+Math.sin(i*1.7+q.r*7)*.5;x=x0+Math.cos(ang)*q.s*t;y=gr+Math.sin(ang)*q.s*t*.45;ctx.lineTo(x,y)}ctx.stroke();break}
      case'ray':{const L=q.s*(.4+u*.8),ang=q.rot;glowDot(x0,y0,q.s*.9,c,.35*fade);ctx.strokeStyle=rgba(c,.8*fade);ctx.lineWidth=1.8;ctx.beginPath();
        ctx.moveTo(x0+Math.cos(ang)*L*.3,y0+Math.sin(ang)*L*.3*.7);ctx.lineTo(x0+Math.cos(ang)*L,y0+Math.sin(ang)*L*.7);ctx.stroke();
        ctx.strokeStyle=rgba(HI,.7*fade);ctx.lineWidth=.8;ctx.stroke();break}
      case'frost':{const x=x0+q.vx*a+Math.sin(a*3+q.r*6)*4,y=y0+q.vy*a+30*a*a,s=q.s;ctx.strokeStyle=rgba(c,.95*fade);ctx.lineWidth=1.4;
        for(let i=0;i<3;i++){const g=q.rot+a*2+i*Math.PI/3;ctx.beginPath();ctx.moveTo(x-Math.cos(g)*s,y-Math.sin(g)*s);ctx.lineTo(x+Math.cos(g)*s,y+Math.sin(g)*s);ctx.stroke()}
        glowDot(x,y,s*1.6,c,.35*fade);break}
      case'mist':{const x=x0+q.vx*a,y=y0+q.vy*a;glowDot(x,y,q.s*(1+u),c,.3*Math.sin(u*Math.PI),.55);break}
      case'spark':{   // 자잘한 번개: 가지 없는 꺾은선. 입자 수백 개라 따로 긋지 않고 밝기 네 단계로 모아 한 번에 긋는다 (아래 SPK)
        const g=flick(q,()=>{const a=Math.random()*6.283,dx=Math.cos(a)*q.s,dy=Math.sin(a)*q.s*.7,o=[0,0];for(let i=1;i<4;i++){const j=(Math.random()-.5)*q.s*.5;o.push(dx*i/4-dy/q.s*j,dy*i/4+dx/q.s*j)}o.push(dx,dy);return o},.07);
        (SPK[Math.min(3,fade*4|0)]||=[]).push(x0,y0,g,c);break}
      case'smoke':{const x=x0+q.vx*a+Math.sin(a*4+q.r*6)*6,y=y0+q.vy*a,r=q.s*(1+u*1.6);ctx.fillStyle=rgba(c,.55*(1-u));ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
        ctx.strokeStyle=rgba(HI_DARK,.35*(1-u));ctx.lineWidth=1;ctx.stroke();break}
    }}
  ctx.globalCompositeOperation='lighter';
  for(let k=0;k<4;k++){const L=SPK[k];if(!L)continue;const fade=(k+.5)/4;ctx.beginPath();
    for(let i=0;i<L.length;i+=4){const x0=L[i],y0=L[i+1],g=L[i+2];ctx.moveTo(x0+g[0],y0+g[1]);for(let j=2;j<g.length;j+=2)ctx.lineTo(x0+g[j],y0+g[j+1])}
    ctx.strokeStyle=rgba(L[3],.35*fade);ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=rgba(HI,fade);ctx.lineWidth=1.2;ctx.stroke()}
  ctx.globalCompositeOperation=mode;ctx.globalAlpha=ga}

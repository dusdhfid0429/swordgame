// ---------- town buildings: plaster and timber walls, lattice windows, grey tile hip roofs with upturned eaves ----------
const scr=(gx,gy,h=0)=>{const p=toScreen(gx,gy);return[p.x,p.y-h]};
const lerp2=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const up=(p,h)=>[p[0],p[1]-h];
function quad(pts,fill,stroke=OUT){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
const darkLvl=()=>Math.max(0,Math.min(.74,(.15+Math.cos(tod*Math.PI*2))*.9));
function wallFace(A,B,segs,WH,plaster,isFront,b){
  const base=5;quad([A,B,up(B,base),up(A,base)],'#8f897c');
  quad([up(A,base),up(B,base),up(B,WH),up(A,WH)],plaster);
  const glow=darkLvl()>.25,mid=Math.floor(segs/2);
  for(let s=0;s<segs;s++){const t0=s/segs,t1=(s+1)/segs,P0=lerp2(A,B,t0+.2/segs),P1=lerp2(A,B,t1-.2/segs);
    if(isFront&&s===mid&&b.kind!=='pavilion'){const D0=lerp2(A,B,t0+.25/segs),D1=lerp2(A,B,t1-.25/segs);quad([up(D0,base),up(D1,base),up(D1,28),up(D0,28)],'#6e2416');
      const Dm=lerp2(D0,D1,.5);ctx.strokeStyle='#2a0c06';ctx.beginPath();ctx.moveTo(...up(Dm,base));ctx.lineTo(...up(Dm,28));ctx.stroke();
      ctx.fillStyle='#c9a14a';for(const t of[.35,.65])for(const h of[12,20]){const q=up(lerp2(D0,D1,t),h);ctx.fillRect(q[0]-.8,q[1]-.8,1.6,1.6)}continue}
    quad([up(P0,15),up(P1,15),up(P1,27),up(P0,27)],glow?'#f2b45a':'#3a2a1c');
    ctx.strokeStyle=glow?'rgba(90,40,10,.8)':'rgba(220,200,160,.55)';ctx.lineWidth=1;
    for(let k=1;k<4;k++){const q0=lerp2(P0,P1,k/4);ctx.beginPath();ctx.moveTo(...up(q0,15));ctx.lineTo(...up(q0,27));ctx.stroke()}
    const qa=up(P0,21),qb=up(P1,21);ctx.beginPath();ctx.moveTo(...qa);ctx.lineTo(...qb);ctx.stroke()}
  ctx.strokeStyle='#5a2418';ctx.lineWidth=3;
  for(let s=0;s<=segs;s++){const q=lerp2(A,B,s/segs);ctx.beginPath();ctx.moveTo(...up(q,base));ctx.lineTo(...up(q,WH));ctx.stroke()}
  ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(...up(A,WH-1));ctx.lineTo(...up(B,WH-1));ctx.stroke();
}
function roofFace(eave0,eave1,r0,r1,fill,lines){
  quad(r1?[eave0,eave1,r1,r0]:[eave0,eave1,r0],fill);
  ctx.strokeStyle='rgba(15,18,24,.45)';ctx.lineWidth=1;
  for(let k=1;k<lines;k++){const t=k/lines,a=lerp2(eave0,eave1,t),b=r1?lerp2(r0,r1,t):r0;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
  ctx.strokeStyle='rgba(255,255,255,.08)';for(let k=1;k<5;k++){const t=k/5,a=lerp2(eave0,r0,t),b=lerp2(eave1,r1||r0,t);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
  ctx.strokeStyle='#22262c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(...eave0);ctx.lineTo(...eave1);ctx.stroke();
}
function curl(p,dx){ctx.strokeStyle='#22262c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(...p);ctx.quadraticCurveTo(p[0]+dx*.6,p[1],p[0]+dx,p[1]-8);ctx.stroke()}
function drawBuildVec(b,alpha){
  if(b.fl>1&&!REGION().dead)return drawTowerVec(b,alpha);
  const{x,y,w,h}=b,X1=x+w,Y1=y+h,pav=b.kind==='pavilion',ru=!!REGION().dead,WH=pav?(ru?22:34):(ru?26:38),o=.38;   // ru: 멸문 폐허 (g_ruin.js) - 낮고 그을린 담, 꺼진 지붕
  ctx.save();ctx.globalAlpha=alpha;
  quad([scr(x+.3,Y1+.25),scr(X1+.3,Y1+.25),scr(X1+.3,y+.25),scr(X1,y),scr(X1,Y1),scr(x,Y1)],'rgba(0,0,0,.22)',null);
  if(pav){quad([scr(x,y,5),scr(X1,y,5),scr(X1,Y1,5),scr(x,Y1,5)],'#b4ad9e');quad([scr(x,Y1),scr(X1,Y1),scr(X1,Y1,5),scr(x,Y1,5)],'#8f897c');quad([scr(X1,Y1),scr(X1,y),scr(X1,y,5),scr(X1,Y1,5)],'#77716a');
    for(const[i,j]of[[x+.2,y+.2],[X1-.2,y+.2],[x+.2,Y1-.2],[X1-.2,Y1-.2]]){const q=scr(i,j,5);seg([q,up(q,WH-5)],4,'#7a2416')}
    const t=scr(x+w/2,y+h/2,5);ctx.fillStyle='#7a5a3a';ctx.beginPath();ctx.ellipse(t[0],t[1]-6,9,4.5,0,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.stroke()}
  else{wallFace(scr(x,Y1),scr(X1,Y1),w,WH,b.wc?b.wc[0]:b.mg?'#3a2e2c':'#e4d9c0',true,b);wallFace(scr(X1,Y1),scr(X1,y),h,WH,b.wc?b.wc[1]:b.mg?'#2a2020':'#c3b69b',false,b)}
  const RC=ru?['#2c2724','#242120','#332c28','#3b322c']:b.rc&&GD.ROOF_PAL[b.rc]||(b.mg?['#3a1414','#321010','#4a1a18','#5e2420']:GD.ROOF_PAL.gray);
  if(ru&&!pav){ctx.fillStyle='rgba(20,14,10,.45)';quad([scr(x,Y1),scr(X1,Y1),scr(X1,Y1,WH),scr(x,Y1,WH)],'rgba(20,14,10,.42)',null);quad([scr(X1,Y1),scr(X1,y),scr(X1,y,WH),scr(X1,Y1,WH)],'rgba(20,14,10,.5)',null);
    ctx.strokeStyle='#1a1512';ctx.lineWidth=1.5;for(const t of[.22,.58,.8]){const q=up(lerp2(scr(x,Y1),scr(X1,Y1),t),WH);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+3,q[1]+WH*.35);ctx.lineTo(q[0]-2,q[1]+WH*.6);ctx.lineTo(q[0]+2,q[1]+WH*.85);ctx.stroke()}}
  const H0=WH+(pav?0:4),RH=H0+10+8*Math.min(w,h);
  const Et=scr(x-o,y-o,H0),Er=scr(X1+o,y-o,H0),Eb=scr(X1+o,Y1+o,H0),El=scr(x-o,Y1+o,H0);
  let R1,R2;
  if(w>=h){const d=(h+2*o)/2,cy=(y+Y1)/2;R1=scr(x-o+d,cy,RH);R2=scr(X1+o-d,cy,RH);
    roofFace(Et,Er,R1,R2,RC[0],10);roofFace(Et,El,R1,null,RC[1],6);roofFace(Er,Eb,R2,null,RC[2],6);roofFace(El,Eb,R1,R2,RC[3],Math.round(w*5))}
  else{const d=(w+2*o)/2,cx=(x+X1)/2;R1=scr(cx,y-o+d,RH);R2=scr(cx,Y1+o-d,RH);
    roofFace(Et,El,R1,R2,RC[1],10);roofFace(Et,Er,R1,null,RC[0],6);roofFace(El,Eb,R2,null,RC[3],6);roofFace(Er,Eb,R1,R2,RC[2],Math.round(h*5))}
  if(ru){const m=lerp2(R1,R2,.5),hole=[lerp2(R1,R2,.3),up(lerp2(Eb,El,.45),(RH-H0)*.45),lerp2(Eb,El,.6),up(lerp2(Eb,El,.25),(RH-H0)*.3)];quad(hole,'rgba(8,6,6,.92)','#1a1512');
    ctx.strokeStyle='#15110f';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(...R1);ctx.lineTo(m[0],m[1]+3);ctx.stroke();ctx.beginPath();ctx.moveTo(m[0]+6,m[1]+9);ctx.lineTo(...R2);ctx.stroke();
    for(const[t,sz]of[[.1,5],[.3,3.5],[.75,4.5],[.92,3]]){const q=lerp2(scr(x-.4,Y1+.5),scr(X1+.4,Y1+.5),t);ctx.fillStyle='#5a544c';ctx.beginPath();ctx.ellipse(q[0],q[1],sz*1.6,sz,0,0,7);ctx.fill();ctx.strokeStyle='#1a1512';ctx.lineWidth=1;ctx.stroke()}
    ctx.restore();return}
  curl(El,-9);curl(Eb,0);curl(Er,9);
  ctx.strokeStyle='#22262c';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(...R1);ctx.lineTo(...R2);ctx.stroke();
  if(pav){ctx.fillStyle='#c9a14a';ctx.beginPath();ctx.arc(R1[0],R1[1]-4,3,0,7);ctx.fill()}
  else for(const R of[R1,R2]){ctx.beginPath();ctx.arc(R[0],R[1]-3,2.6,0,7);ctx.fillStyle='#22262c';ctx.fill()}
  // hanging red lanterns at the front corners, and an inn flag
  if(!pav)for(const t of[.08,.92]){const q=up(lerp2(scr(x-o*.6,Y1+o*.6),scr(X1+o*.6,Y1+o*.6),t),H0-4);ctx.strokeStyle='#22262c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0],q[1]+5);ctx.stroke();
    ctx.fillStyle=darkLvl()>.25?'#ff6a3a':'#c4301e';ctx.beginPath();ctx.ellipse(q[0],q[1]+10,4,5.5,0,0,7);ctx.fill();ctx.fillStyle='#e0b050';ctx.fillRect(q[0]-2.5,q[1]+4,5,1.5)}
  ctx.restore();
}
// ---- v179 여러 층 누각 (사용자 2026-10-26, 상해 예원 누각 사진): b.fl층. 층마다 처마(腰檐)를 두르고 위층은 조금씩 안으로 들인다 ----
// 아래층은 붉은 나무 벽, 위층은 흰 회벽과 난간, 꼭대기 층 앞에 금테 편액, 맨 위는 우진각 지붕. 안은 층마다 전각 맵 (g_tower.js)
function towerDims(b){const T=GD.TOWER.look,n=b.fl,hb=[],top=[],s=[];let h=0;
  for(let k=0;k<n;k++){hb.push(h);s.push(k*T.inset);h+=k?T.wh:T.wh0;top.push(h);h+=T.skirt}
  const S=s[n-1],H0=top[n-1],RH=H0+T.roof+8*Math.min(b.w-2*S,b.h-2*S);return{n,hb,top,s,H0,RH}}
function drawTowerVec(b,alpha){const{x,y,w,h}=b,X1=x+w,Y1=y+h,T=GD.TOWER.look,D=towerDims(b),o=.38,RC=b.rc&&GD.ROOF_PAL[b.rc]||(b.mg?['#3a1414','#321010','#4a1a18','#5e2420']:GD.ROOF_PAL.gray);
  ctx.save();ctx.globalAlpha=alpha;
  quad([scr(x+.5,Y1+.4),scr(X1+.5,Y1+.4),scr(X1+.5,y+.4),scr(X1,y),scr(X1,Y1),scr(x,Y1)],'rgba(0,0,0,.26)',null);
  const C=(k,hh,dd=0)=>{const q=D.s[k]-dd;return{t:scr(x+q,y+q,hh),r:scr(X1-q,y+q,hh),b:scr(X1-q,Y1-q,hh),l:scr(x+q,Y1-q,hh)}};
  const noDoor={kind:'pavilion'};
  for(let k=0;k<D.n;k++){const q=D.s[k],hb=D.hb[k],wh=D.top[k]-hb,A=scr(x+q,Y1-q,hb),B=scr(X1-q,Y1-q,hb),Bk=scr(X1-q,y+q,hb);
    const wc=k?T.upper:b.wc||(b.mg?['#3a2e2c','#2a2020']:T.ground);
    wallFace(A,B,w,wh,wc[0],!k,k?noDoor:b);wallFace(B,Bk,h,wh,wc[1],false,b);
    if(k){// 난간: 위층 벽 앞 한 뼘
      const R0=scr(x+q-.12,Y1-q+.12,hb),R1=scr(X1-q+.12,Y1-q+.12,hb),R2=scr(X1-q+.12,y+q,hb);ctx.strokeStyle=T.rail;ctx.lineWidth=1.5;
      for(const[P0,P1,m]of[[R0,R1,w*3],[R1,R2,h*3]]){for(let i=0;i<=m;i++){const t=lerp2(P0,P1,i/m);ctx.beginPath();ctx.moveTo(...t);ctx.lineTo(...up(t,10));ctx.stroke()}
        ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(...up(P0,10));ctx.lineTo(...up(P1,10));ctx.stroke();ctx.lineWidth=1.5}}
    if(k===D.n-1&&D.n>1){// 금테 편액
      const P0=lerp2(A,B,.36),P1=lerp2(A,B,.64);quad([up(P0,13),up(P1,13),up(P1,28),up(P0,28)],'#241a12','#c9a14a');
      ctx.fillStyle='#e0b850';for(const t of[.25,.5,.75]){const m=up(lerp2(P0,P1,t),20.5);ctx.fillRect(m[0]-1.6,m[1]-2.6,3.2,5.2)}}
    if(k<D.n-1){// 층 사이 처마: 바깥(아래 가장자리) → 위층 벽 밑동
      const O=C(k,D.top[k]-2,o),I=C(k+1,D.hb[k+1]),L=Math.max(4,w*4);
      roofFace(O.t,O.r,I.t,I.r,RC[0],L);roofFace(O.t,O.l,I.t,I.l,RC[1],L);roofFace(O.r,O.b,I.r,I.b,RC[2],L);roofFace(O.l,O.b,I.l,I.b,RC[3],L);
      curl(O.l,-9);curl(O.b,0);curl(O.r,9);
      if(!k)for(const t of[.08,.92]){const q2=up(lerp2(scr(x-o*.6,Y1+o*.6),scr(X1+o*.6,Y1+o*.6),t),D.top[0]-4);ctx.strokeStyle='#22262c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q2[0],q2[1]);ctx.lineTo(q2[0],q2[1]+5);ctx.stroke();
        ctx.fillStyle=darkLvl()>.25?'#ff6a3a':'#c4301e';ctx.beginPath();ctx.ellipse(q2[0],q2[1]+10,4,5.5,0,0,7);ctx.fill();ctx.fillStyle='#e0b050';ctx.fillRect(q2[0]-2.5,q2[1]+4,5,1.5)}}}
  // 맨 위 우진각 지붕
  const S=D.s[D.n-1],xa=x+S,ya=y+S,xb=X1-S,yb=Y1-S,ww=xb-xa,hh=yb-ya,H0=D.H0,RH=D.RH;
  const Et=scr(xa-o,ya-o,H0),Er=scr(xb+o,ya-o,H0),Eb=scr(xb+o,yb+o,H0),El=scr(xa-o,yb+o,H0);let R1,R2;
  if(ww>=hh){const d=(hh+2*o)/2,cy=(ya+yb)/2;R1=scr(xa-o+d,cy,RH);R2=scr(xb+o-d,cy,RH);
    roofFace(Et,Er,R1,R2,RC[0],10);roofFace(Et,El,R1,null,RC[1],6);roofFace(Er,Eb,R2,null,RC[2],6);roofFace(El,Eb,R1,R2,RC[3],Math.round(ww*5))}
  else{const d=(ww+2*o)/2,cx=(xa+xb)/2;R1=scr(cx,ya-o+d,RH);R2=scr(cx,yb+o-d,RH);
    roofFace(Et,El,R1,R2,RC[1],10);roofFace(Et,Er,R1,null,RC[0],6);roofFace(El,Eb,R2,null,RC[3],6);roofFace(Er,Eb,R1,R2,RC[2],Math.round(hh*5))}
  curl(El,-11);curl(Eb,0);curl(Er,11);
  ctx.strokeStyle='#22262c';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(...R1);ctx.lineTo(...R2);ctx.stroke();
  for(const R of[R1,R2]){ctx.beginPath();ctx.moveTo(R[0],R[1]);ctx.quadraticCurveTo(R[0],R[1]-8,R[0]+(R===R1?-5:5),R[1]-11);ctx.stroke()}
  ctx.fillStyle='#c9a14a';const m=lerp2(R1,R2,.5);ctx.beginPath();ctx.arc(m[0],m[1]-5,3.2,0,7);ctx.fill();
  ctx.restore()}
// 객잔 깃발: 바람에 흔들려 매 프레임 그린다 (건물 그림 캐시 밖)
function drawInnFlag(b,alpha){const f=scr(b.x-.15,b.y+b.h+.35);ctx.save();ctx.globalAlpha=alpha;seg([f,up(f,62)],2,'#5a3a22');const fl=up(f,60),wv=Math.sin(time*2)*1.5;
  quad([fl,[fl[0]+14+wv,fl[1]+2],[fl[0]+13+wv,fl[1]+40],[fl[0],fl[1]+38]],'#b8291f');
  ctx.fillStyle='#f4e8c8';ctx.font='11px "Song Myung",serif';ctx.textAlign='center';ctx.fillText('客',fl[0]+7+wv/2,fl[1]+16);ctx.fillText('棧',fl[0]+7+wv/2,fl[1]+31);ctx.restore()}
// v154 건물 그림 캐시 (사용자 2026-10-19 '8번 진행'): 건물은 카메라를 따라 평행이동만 하므로 한 번 벡터로 그린 그림을 재사용한다.
// 밤 창문·등불 색(darkLvl>.25), 폐허, 화면 배율이 바뀌면 다시 그린다. 최근 BC_MAX채만 들고 있는다 (휴대폰 메모리)
const BCACHE=[],BC_MAX=24;
function buildBox(b,RH){const o=.9,pts=[];for(const gx of[b.x-o,b.x+b.w+o])for(const gy of[b.y-o,b.y+b.h+o])for(const hh of[0,RH+14])pts.push(scr(gx,gy,hh));
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return[Math.min(...xs)-14,Math.min(...ys)-10,Math.max(...xs)+14,Math.max(...ys)+18]}
function drawBuild(b,alpha){const dpr=C.width/Math.max(1,W*S),k=S*dpr,ru=!!REGION().dead,key=`${ru?1:0}${darkLvl()>.25?1:0}|${k}|${b.w}x${b.h}|${b.kind}|${b.mg?1:0}|${b.rc||''}|${b.wc||''}|${b.fl||''}`;
  let c=BCACHE.find(o=>o.b===b);
  if(!c||c.key!==key){GHB=gH(b.x+.5,b.y+.5);try{const pav=b.kind==='pavilion',H0=(pav?(ru?22:34):(ru?26:38))+(pav?0:4),RH=b.fl>1&&!ru?towerDims(b).RH:H0+10+8*Math.min(b.w,b.h),bx=buildBox(b,RH),a=toScreen(b.x,b.y);
    const x0=Math.floor(bx[0]*k)/k,y0=Math.floor(bx[1]*k)/k,cw=Math.ceil((bx[2]-x0)*k),chh=Math.ceil((bx[3]-y0)*k);
    const cv=c&&c.cv&&c.cv.width===cw&&c.cv.height===chh?c.cv:document.createElement('canvas');cv.width=cw;cv.height=chh;const g=cv.getContext('2d');g.clearRect(0,0,cw,chh);g.setTransform(k,0,0,k,-x0*k,-y0*k);
    const keep=ctx;ctx=g;try{drawBuildVec(b,1)}finally{ctx=keep}
    if(c){c.key=key;c.cv=cv;c.ox=x0-a.x;c.oy=y0-a.y;c.w=cw/k;c.h=chh/k;BCACHE.splice(BCACHE.indexOf(c),1)}else c={b,key,cv,ox:x0-a.x,oy:y0-a.y,w:cw/k,h:chh/k};
    BCACHE.push(c);if(BCACHE.length>BC_MAX)BCACHE.shift()}finally{GHB=null}}
  const a=toScreen(b.x,b.y),px=Math.round((a.x+c.ox)*k)/k,py=Math.round((a.y+c.oy)*k)/k;
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(c.cv,px,py,c.w,c.h);ctx.restore();
  if(b.kind==='inn'&&!ru){GHB=gH(b.x+.5,b.y+.5);try{drawInnFlag(b,alpha)}finally{GHB=null}}}
function drawStall(i,j){
  const c=map[j][i].cloth,x=i+.15,y=j+.15,X1=i+.85,Y1=j+.85;
  quad([scr(x,y,10),scr(X1,y,10),scr(X1,Y1,10),scr(x,Y1,10)],'#9a7048');quad([scr(x,Y1),scr(X1,Y1),scr(X1,Y1,10),scr(x,Y1,10)],'#6e4c2e');quad([scr(X1,Y1),scr(X1,y),scr(X1,y,10),scr(X1,Y1,10)],'#5a3c22');
  const r=rng(i*31+j);for(let k=0;k<7;k++){const q=scr(x+.1+r()*.6,y+.1+r()*.6,12);ctx.fillStyle=['#e0b050','#7fbf5f','#d2603a','#e8e0c8'][k%4];ctx.beginPath();ctx.ellipse(q[0],q[1],3,2,0,0,7);ctx.fill()}
  for(const[a,b2]of[[x,y],[X1,y],[x,Y1],[X1,Y1]]){const q=scr(a,b2);seg([q,up(q,30)],1.6,'#5a3a22')}
  quad([scr(x-.1,y-.1,32),scr(X1+.1,y-.1,32),scr(X1+.15,Y1+.15,27),scr(x-.15,Y1+.15,27)],c);
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;for(let k=1;k<4;k++){const t=k/4;ctx.beginPath();ctx.moveTo(...lerp2(scr(x-.1,y-.1,32),scr(X1+.1,y-.1,32),t));ctx.lineTo(...lerp2(scr(x-.15,Y1+.15,27),scr(X1+.15,Y1+.15,27),t));ctx.stroke()}
}
// 전각 안 소품 (g_hall.js): 담(wall) 한 칸짜리 벽, 기둥(pillar), 병풍(screen)
function drawWall(i,j,mg){const x=i,y=j,X1=i+1,Y1=j+1,WH=30,top=mg?'#2a2222':'#b4ad9e',f=mg?'#3a2e2c':'#e4d9c0',sd=mg?'#2a2020':'#c3b69b';
  const left=objs[j][i-1]==='wall',right=objs[j][i+1]==='wall',upW=objs[j-1]&&objs[j-1][i]==='wall',dn=objs[j+1]&&objs[j+1][i]==='wall';
  // 앞면(남쪽)과 오른면(동쪽)만 보인다. 이웃 담과 이어지는 면은 붙여 그린다
  quad([scr(x,Y1),scr(X1,Y1),scr(X1,Y1,WH),scr(x,Y1,WH)],f);quad([scr(X1,Y1),scr(X1,y),scr(X1,y,WH),scr(X1,Y1,WH)],sd);
  quad([scr(x,y,WH),scr(X1,y,WH),scr(X1,Y1,WH),scr(x,Y1,WH)],top);
  ctx.strokeStyle='#5a2418';ctx.lineWidth=2;const b1=scr(x,Y1,5),b2=scr(X1,Y1,5);ctx.beginPath();ctx.moveTo(...b1);ctx.lineTo(...b2);ctx.stroke();
  if(!left&&!upW){const q=scr(x,Y1);seg([q,up(q,WH)],2.5,'#5a2418')}if(!right&&!dn){const q=scr(X1,y);seg([q,up(q,WH)],2.5,'#5a2418')}}
function drawPillar(i,j,mg){const p=scr(i+.5,j+.5),c=mg?'#5e2420':'#8a2a1a';ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(p[0],p[1],10,5,0,0,7);ctx.fill();
  poly([[p[0]-9,p[1]],[p[0]+9,p[1]],[p[0]+8,p[1]-4],[p[0]-8,p[1]-4]],'#6e6a60');poly([[p[0]-5,p[1]-4],[p[0]+5,p[1]-4],[p[0]+5,p[1]-46],[p[0]-5,p[1]-46]],lg(p[0]-5,p[0]+5,c,'#3a1008'));
  poly([[p[0]-8,p[1]-46],[p[0]+8,p[1]-46],[p[0]+8,p[1]-50],[p[0]-8,p[1]-50]],'#c9a14a')}
function drawScreen(i,j,mg){const a=scr(i,j+.5),b=scr(i+1,j+.5),H=34;quad([a,b,up(b,H),up(a,H)],mg?'#2c1a18':'#f0e6cc');
  ctx.strokeStyle=mg?'#8a2a1a':'#5a3a22';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...up(a,H));ctx.lineTo(...up(b,H));ctx.lineTo(...b);ctx.stroke();
  const r=rng(i*13+j*7);ctx.strokeStyle=mg?'rgba(200,60,40,.5)':'rgba(60,70,50,.45)';ctx.lineWidth=1.5;for(let k=0;k<3;k++){const q=up(lerp2(a,b,.2+r()*.6),8+r()*18);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.quadraticCurveTo(q[0]+6,q[1]-8,q[0]+2+r()*6,q[1]-16);ctx.stroke()}}
function drawRail(rl){
  const gx=rl.x;for(const gy of[rl.y,rl.y+1]){const q=scr(gx,gy);seg([q,up(q,14)],2.6,'#6a4426')}
  const a=scr(gx,rl.y,11),b=scr(gx,rl.y+1,11);seg([a,b],2.4,'#8a5a34');const a2=scr(gx,rl.y,5),b2=scr(gx,rl.y+1,5);seg([a2,b2],1.8,'#8a5a34');
}

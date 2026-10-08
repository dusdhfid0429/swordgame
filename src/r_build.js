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
function drawBuild(b,alpha){
  const{x,y,w,h}=b,X1=x+w,Y1=y+h,pav=b.kind==='pavilion',WH=pav?34:38,o=.38;
  ctx.save();ctx.globalAlpha=alpha;
  quad([scr(x+.3,Y1+.25),scr(X1+.3,Y1+.25),scr(X1+.3,y+.25),scr(X1,y),scr(X1,Y1),scr(x,Y1)],'rgba(0,0,0,.22)',null);
  if(pav){quad([scr(x,y,5),scr(X1,y,5),scr(X1,Y1,5),scr(x,Y1,5)],'#b4ad9e');quad([scr(x,Y1),scr(X1,Y1),scr(X1,Y1,5),scr(x,Y1,5)],'#8f897c');quad([scr(X1,Y1),scr(X1,y),scr(X1,y,5),scr(X1,Y1,5)],'#77716a');
    for(const[i,j]of[[x+.2,y+.2],[X1-.2,y+.2],[x+.2,Y1-.2],[X1-.2,Y1-.2]]){const q=scr(i,j,5);seg([q,up(q,WH-5)],4,'#7a2416')}
    const t=scr(x+w/2,y+h/2,5);ctx.fillStyle='#7a5a3a';ctx.beginPath();ctx.ellipse(t[0],t[1]-6,9,4.5,0,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.stroke()}
  else{wallFace(scr(x,Y1),scr(X1,Y1),w,WH,b.mg?'#3a2e2c':'#e4d9c0',true,b);wallFace(scr(X1,Y1),scr(X1,y),h,WH,b.mg?'#2a2020':'#c3b69b',false,b)}
  const RC=b.mg?['#3a1414','#321010','#4a1a18','#5e2420']:['#2e343c','#2a3038','#3a414b','#4d5663'];
  const H0=WH+(pav?0:4),RH=H0+10+8*Math.min(w,h);
  const Et=scr(x-o,y-o,H0),Er=scr(X1+o,y-o,H0),Eb=scr(X1+o,Y1+o,H0),El=scr(x-o,Y1+o,H0);
  let R1,R2;
  if(w>=h){const d=(h+2*o)/2,cy=(y+Y1)/2;R1=scr(x-o+d,cy,RH);R2=scr(X1+o-d,cy,RH);
    roofFace(Et,Er,R1,R2,RC[0],10);roofFace(Et,El,R1,null,RC[1],6);roofFace(Er,Eb,R2,null,RC[2],6);roofFace(El,Eb,R1,R2,RC[3],Math.round(w*5))}
  else{const d=(w+2*o)/2,cx=(x+X1)/2;R1=scr(cx,y-o+d,RH);R2=scr(cx,Y1+o-d,RH);
    roofFace(Et,El,R1,R2,RC[1],10);roofFace(Et,Er,R1,null,RC[0],6);roofFace(El,Eb,R2,null,RC[3],6);roofFace(Er,Eb,R1,R2,RC[2],Math.round(h*5))}
  curl(El,-9);curl(Eb,0);curl(Er,9);
  ctx.strokeStyle='#22262c';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(...R1);ctx.lineTo(...R2);ctx.stroke();
  if(pav){ctx.fillStyle='#c9a14a';ctx.beginPath();ctx.arc(R1[0],R1[1]-4,3,0,7);ctx.fill()}
  else for(const R of[R1,R2]){ctx.beginPath();ctx.arc(R[0],R[1]-3,2.6,0,7);ctx.fillStyle='#22262c';ctx.fill()}
  // hanging red lanterns at the front corners, and an inn flag
  if(!pav)for(const t of[.08,.92]){const q=up(lerp2(scr(x-o*.6,Y1+o*.6),scr(X1+o*.6,Y1+o*.6),t),H0-4);ctx.strokeStyle='#22262c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0],q[1]+5);ctx.stroke();
    ctx.fillStyle=darkLvl()>.25?'#ff6a3a':'#c4301e';ctx.beginPath();ctx.ellipse(q[0],q[1]+10,4,5.5,0,0,7);ctx.fill();ctx.fillStyle='#e0b050';ctx.fillRect(q[0]-2.5,q[1]+4,5,1.5)}
  if(b.kind==='inn'){const f=scr(x-.15,Y1+.35);seg([f,up(f,62)],2,'#5a3a22');const fl=up(f,60),wv=Math.sin(time*2)*1.5;
    quad([fl,[fl[0]+14+wv,fl[1]+2],[fl[0]+13+wv,fl[1]+40],[fl[0],fl[1]+38]],'#b8291f');
    ctx.fillStyle='#f4e8c8';ctx.font='11px "Song Myung",serif';ctx.textAlign='center';ctx.fillText('客',fl[0]+7+wv/2,fl[1]+16);ctx.fillText('棧',fl[0]+7+wv/2,fl[1]+31)}
  ctx.restore();
}
function drawStall(i,j){
  const c=map[j][i].cloth,x=i+.15,y=j+.15,X1=i+.85,Y1=j+.85;
  quad([scr(x,y,10),scr(X1,y,10),scr(X1,Y1,10),scr(x,Y1,10)],'#9a7048');quad([scr(x,Y1),scr(X1,Y1),scr(X1,Y1,10),scr(x,Y1,10)],'#6e4c2e');quad([scr(X1,Y1),scr(X1,y),scr(X1,y,10),scr(X1,Y1,10)],'#5a3c22');
  const r=rng(i*31+j);for(let k=0;k<7;k++){const q=scr(x+.1+r()*.6,y+.1+r()*.6,12);ctx.fillStyle=['#e0b050','#7fbf5f','#d2603a','#e8e0c8'][k%4];ctx.beginPath();ctx.ellipse(q[0],q[1],3,2,0,0,7);ctx.fill()}
  for(const[a,b2]of[[x,y],[X1,y],[x,Y1],[X1,Y1]]){const q=scr(a,b2);seg([q,up(q,30)],1.6,'#5a3a22')}
  quad([scr(x-.1,y-.1,32),scr(X1+.1,y-.1,32),scr(X1+.15,Y1+.15,27),scr(x-.15,Y1+.15,27)],c);
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;for(let k=1;k<4;k++){const t=k/4;ctx.beginPath();ctx.moveTo(...lerp2(scr(x-.1,y-.1,32),scr(X1+.1,y-.1,32),t));ctx.lineTo(...lerp2(scr(x-.15,Y1+.15,27),scr(X1+.15,Y1+.15,27),t));ctx.stroke()}
}
function drawRail(rl){
  const gx=rl.x;for(const gy of[rl.y,rl.y+1]){const q=scr(gx,gy);seg([q,up(q,14)],2.6,'#6a4426')}
  const a=scr(gx,rl.y,11),b=scr(gx,rl.y+1,11);seg([a,b],2.4,'#8a5a34');const a2=scr(gx,rl.y,5),b2=scr(gx,rl.y+1,5);seg([a2,b2],1.8,'#8a5a34');
}

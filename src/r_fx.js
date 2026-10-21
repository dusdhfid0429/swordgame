function drawLamp(l){
  const p=toScreen(l.x,l.y);
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(p.x,p.y,13,6,0,0,7);ctx.fill();
  poly([[p.x-9,p.y],[p.x+9,p.y],[p.x+7,p.y-6],[p.x-7,p.y-6]],lg(p.x-9,p.x+9,'#8c877b','#3a3833'));
  poly([[p.x-3,p.y-6],[p.x+3,p.y-6],[p.x+3,p.y-26],[p.x-3,p.y-26]],lg(p.x-3,p.x+3,'#8c877b','#3a3833'));
  poly([[p.x-8,p.y-26],[p.x+8,p.y-26],[p.x+7,p.y-40],[p.x-7,p.y-40]],lg(p.x-8,p.x+8,'#9a9588','#3a3833'));
  const f=.8+Math.sin(time*9+l.p)*.1+Math.sin(time*23+l.p)*.08;
  ctx.fillStyle=`rgba(255,${170+f*40},80,${f})`;ctx.fillRect(p.x-3.5,p.y-37,7,8);
  poly([[p.x-12,p.y-40],[p.x+12,p.y-40],[p.x,p.y-52]],lg(p.x-12,p.x+12,'#8c877b','#2e2c28'));
}
function drawFx(f){
  const p=toScreen(f.x,f.y);
  if(f.t==='dust'){const k=1-f.life/.45;ctx.fillStyle=`rgba(150,128,96,${.35*(1-k)})`;ctx.beginPath();ctx.ellipse(p.x,p.y-2-k*4,4+k*9,2+k*4,0,0,7);ctx.fill();return}
  if(f.t==='ring'){const k=1-f.life/f.max,r=k*2.6;ctx.strokeStyle=`rgba(140,180,255,${1-k})`;ctx.lineWidth=5*(1-k)+1;
    ctx.beginPath();ctx.ellipse(p.x,p.y,r*TW/2*1.41,r*TH/2*1.41,0,0,7);ctx.stroke();ctx.fillStyle=`rgba(160,200,255,${.12*(1-k)})`;ctx.fill()}
  else if(f.t==='slash'){const a=f.life/.2;ctx.save();ctx.translate(p.x,p.y-30);ctx.scale(f.side,1);
    ctx.strokeStyle=`rgba(255,250,230,${a})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(-6,0,18,-1.1,1.1);ctx.stroke();
    ctx.strokeStyle=`rgba(255,200,120,${a*.6})`;ctx.lineWidth=7;ctx.beginPath();ctx.arc(-8,0,18,-.8,.8);ctx.stroke();ctx.restore()}
  else if(f.t==='puff'){const k=1-f.life/.6;for(let n=0;n<7;n++){ctx.fillStyle=`rgba(30,26,22,${.6*(1-k)})`;ctx.beginPath();ctx.arc(p.x+Math.cos(n*.9)*k*26,p.y-16-k*18+Math.sin(n*.9)*k*9,8*(1-k)+3,0,7);ctx.fill()}}
  else if(f.t==='ghost'){ctx.fillStyle=`rgba(${f.col||'120,150,220'},${f.life*1.2})`;ctx.beginPath();ctx.ellipse(p.x,p.y-26,8,24,0,0,7);ctx.fill()}
  else if(f.t==='lvl'){const k=1-f.life/1.2;ctx.strokeStyle=`rgba(255,215,120,${1-k})`;ctx.lineWidth=2;
    for(let n=0;n<3;n++){ctx.beginPath();ctx.ellipse(p.x,p.y-k*60-n*12,18-n*3,7-n,0,0,7);ctx.stroke()}}
}
const rgba=(c,a)=>`rgba(${c},${Math.max(0,Math.min(1,a))})`;
const isoR=r=>[r*TW/2*1.41,r*TH/2*1.41];
// effect painters: sword-qi ribbons, forked lightning, flare bursts, shockwaves, spirals (all additive)
const WH='255,255,255',rnd=Math.random;let HI=WH;   // HI: 밝은 심지 색. 어두운(마기) 이펙트를 그릴 때는 보랏빛 테두리(HI_DARK)로 바뀐다 (g_draw.js)
function path(pts){ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]))}
function boltPts(x0,y0,x1,y1,d,br,depth,out){
  let pts=[[x0,y0],[x1,y1]];
  for(let it=0;it<5;it++){const n=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,o=(rnd()-.5)*d;
    n.push(a,[(a[0]+b[0])/2-dy/l*o,(a[1]+b[1])/2+dx/l*o])}n.push(pts[pts.length-1]);pts=n;d*=.55}
  out.push({pts,w:depth?.55/depth:1});
  if(depth<2)for(let i=3;i<pts.length-3;i++)if(rnd()<br){const a=pts[i],L=Math.hypot(x1-x0,y1-y0)*(.18+rnd()*.3),g=Math.atan2(y1-y0,x1-x0)+(rnd()<.5?-1:1)*(.4+rnd()*.8);
    boltPts(a[0],a[1],a[0]+Math.cos(g)*L,a[1]+Math.sin(g)*L,L*.35,br*.45,depth+1,out)}
  return out;
}
function strokeBolts(bs,col,k,s=1){
  for(const[lw,c,a]of[[16*s,col,.1],[7*s,col,.4],[3*s,col,.85],[1.4*s,HI,1]]){ctx.strokeStyle=rgba(c,a*k);
    for(const b of bs){ctx.lineWidth=Math.max(.6,lw*b.w);path(b.pts);ctx.stroke()}}
}
const flick=(f,mk,rate=.045)=>{if(!f.geo||time-f.gt>rate){f.geo=mk();f.gt=time}return f.geo};
const GLOWS={};
function glowSpr(col){let c=GLOWS[col];if(c)return c;c=GLOWS[col]=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  if(col==='dark'){g.addColorStop(0,'rgba(6,10,30,1)');g.addColorStop(1,'rgba(6,10,30,0)')}else if(isDark(col)){g.addColorStop(0,rgba(col,.95));g.addColorStop(.35,rgba(col,.75));g.addColorStop(.7,rgba(HI_DARK,.18));g.addColorStop(1,rgba(col,0))}else{g.addColorStop(0,rgba(HI,.8));g.addColorStop(.12,rgba(col,.7));g.addColorStop(.45,rgba(col,.2));g.addColorStop(1,rgba(col,0))}
  x.fillStyle=g;x.fillRect(0,0,128,128);return c}
function glowDot(x,y,r,col,a,sy=1){if(a<=0||r<=0)return;const ga=ctx.globalAlpha;ctx.globalAlpha=ga*Math.min(1,a);ctx.drawImage(glowSpr(col),x-r,y-r*sy,r*2,r*2*sy);ctx.globalAlpha=ga}
function mkRays(n,lo,hi,spread){return Array.from({length:n},()=>({a:(rnd()-.5)*spread,l:lo+rnd()*(hi-lo),w:1+rnd()*2.5}))}
// upward flare (vertical spikes fanning out of an impact)
function flare(x,y,rays,col,k,s){
  for(const r of rays){const a=r.a-Math.PI/2,L=r.l*s*(.5+.5*(1-k*k)),bx=Math.cos(a+1.57)*r.w*s,by=Math.sin(a+1.57)*r.w*s,tx=x+Math.cos(a)*L,ty=y+Math.sin(a)*L;
    ctx.fillStyle=rgba(col,.55*k);ctx.beginPath();ctx.moveTo(x-bx*2,y-by*2);ctx.lineTo(tx,ty);ctx.lineTo(x+bx*2,y+by*2);ctx.fill();
    ctx.fillStyle=rgba(HI,.9*k);ctx.beginPath();ctx.moveTo(x-bx*.6,y-by*.6);ctx.lineTo(x+(tx-x)*.7,y+(ty-y)*.7);ctx.lineTo(x+bx*.6,y+by*.6);ctx.fill()}
}
function sparks(f,x,y,col,k,g=260){const t=f.max-f.life;ctx.lineCap='round';
  for(const q of f.sp){const px=x+q.vx*t,py=y+q.vy*t+g*t*t,vy=q.vy+2*g*t;ctx.strokeStyle=rgba(q.w?HI:col,k*1.1);ctx.lineWidth=q.w?1.2:2;
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-q.vx*.035,py-vy*.035);ctx.stroke()}}
const mkSparks=(n,v,up=.6)=>Array.from({length:n},()=>{const a=rnd()*Math.PI*2,s=v*(.35+rnd()*.8);return{vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-v*up,w:rnd()<.4}});
function shock(x,y,rx,ry,col,k,w){ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);
  const g=ctx.createRadialGradient(0,0,rx*.55,0,0,rx);g.addColorStop(0,rgba(col,0));g.addColorStop(.82,rgba(col,.35*k));g.addColorStop(.95,rgba(HI,.8*k));g.addColorStop(1,rgba(col,0));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,7);ctx.fill();ctx.restore()}
// crescent sword-qi ribbon swept along an iso ellipse; thick bright leading edge, streaky tail
function ribbon(f,p,k,o={}){
  const flat=o.flat,rx=flat?isoR(f.r)[0]:f.r*55,ry=flat?isoR(f.r)[1]:f.r*32,th=Math.atan2(Math.sin(f.ang)*rx,Math.cos(f.ang)*ry),pr=1-k,sp=o.spread||f.spread,dir=f.flip?-1:1;
  const head=Math.min(1,pr/(o.fast||.32)),tail=Math.max(0,(pr-.28)/.72)*.97,cy=p.y-(o.h??26),lift=(o.lift??8)*f.r,thick=(o.thick||(6+f.w*2.2))*(f.r>1.2?1.25:1);
  if(head-tail<.02)return;const a0=(o.a0??th-dir*sp/2);
  const P2=(u,rr)=>{const a=a0+dir*sp*u;return[p.x+Math.cos(a)*rx*rr,cy+Math.sin(a)*ry*rr-lift*Math.sin(u*Math.PI)*(o.tilt??1)]};
  const n=26,outer=[],inner=[],mid=[];
  for(let i=0;i<=n;i++){const u=tail+(head-tail)*i/n,q=i/n,w=thick*Math.pow(q,.9)*Math.min(1,(1-q)*14+.25)/rx;outer.push(P2(u,1+w*.25));inner.push(P2(u,1-w));mid.push(P2(u,1-w*.35))}
  const fade=Math.min(1,k*2.2);
  ctx.fillStyle=rgba(f.col,.22*fade);path([...outer,...inner.reverse()]);ctx.fill();inner.reverse();
  ctx.fillStyle=rgba(f.col,.38*fade);path([...outer.slice(n/3|0),...mid.slice(n/3|0).reverse()]);ctx.fill();
  if(!f.st)f.st=Array.from({length:9},()=>({rr:rnd(),s:rnd()*.7,w:.6+rnd()*1.6,c:rnd()<.35}));
  for(const s of f.st){const pts=[];for(let i=Math.floor(s.s*n);i<=n;i++){const a=outer[i],b=inner[i];pts.push([a[0]+(b[0]-a[0])*s.rr,a[1]+(b[1]-a[1])*s.rr])}
    ctx.strokeStyle=rgba(s.c?HI:f.col,(s.c?.5:.7)*fade);ctx.lineWidth=s.w;path(pts);ctx.stroke()}
  const e=outer.slice(n*.45|0);ctx.strokeStyle=rgba(f.col,.6*fade);ctx.lineWidth=5;path(e);ctx.stroke();ctx.strokeStyle=rgba(HI,.95*fade);ctx.lineWidth=1.8;path(e);ctx.stroke();
  const tip=outer[n];if(k>.5)glowDot(tip[0],tip[1],14,f.col,(k-.5)*1.6);
}
function drawGlow(f){
  const p=toScreen(f.x,f.y),k=f.life/f.max;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=f.dim||1;
  if(f.t==='arc')ribbon(f,p,k);
  else if(f.t==='spin'){const a=-time*0;ribbon(f,p,k,{flat:1,spread:5.6,lift:3,h:16,fast:.45,a0:f.a0??(f.a0=rnd()*6.28)});ribbon(f,p,k,{flat:1,spread:5.6,lift:2,h:30,fast:.5,thick:5,a0:f.a0+3.14});
    if(!f.sp)f.sp=mkSparks(10,150,.3);sparks(f,p.x,p.y-16,f.col,k);shock(p.x,p.y,isoR(f.r)[0]*(1.1-k*.3),isoR(f.r)[1]*(1.1-k*.3),f.col,k)}
  else if(f.t==='ring2'){const[rx,ry]=isoR(f.r*(1-k*.6));shock(p.x,p.y,rx,ry,f.col,k);
    if(f.el){const bs=flick(f,()=>{const o=[];for(let i=0;i<3;i++){const a=rnd()*6.28,b=a+.8+rnd();boltPts(Math.cos(a)*rx,Math.sin(a)*ry,Math.cos(b)*rx,Math.sin(b)*ry,14,0,2,o)}return o});
      ctx.save();ctx.translate(p.x,p.y);strokeBolts(bs,f.col,k,.5);ctx.restore()}}
  else if(f.t==='line'){const b=toScreen(f.ex,f.ey),ay=p.y-26,by=b.y-26,pr=Math.min(1,(1-k)*4),bx=p.x+(b.x-p.x)*pr,ey=ay+(by-ay)*pr,dx=bx-p.x,dy=ey-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
    const pts=[];for(let n=0;n<=24;n++){const t=n/24,o=f.wavy?Math.sin(t*12-time*30)*8*(1-t*.4):0;pts.push([p.x+dx*t+nx*o,ay+dy*t+ny*o])}
    for(const[w,c,al]of[[f.w*3,f.col,.18],[f.w*1.4,f.col,.6],[f.w*.45,HI,.95]]){ctx.strokeStyle=rgba(c,al*k);ctx.lineWidth=w;path(pts);ctx.stroke()}
    if(!f.st)f.st=Array.from({length:6},()=>({o:(rnd()-.5)*f.w*2.4,s:rnd()*.5,w:.6+rnd()}));
    for(const s of f.st){ctx.strokeStyle=rgba(f.col,.7*k);ctx.lineWidth=s.w;ctx.beginPath();ctx.moveTo(p.x+dx*s.s+nx*s.o,ay+dy*s.s+ny*s.o);ctx.lineTo(bx+nx*s.o*.3,ey+ny*s.o*.3);ctx.stroke()}
    glowDot(bx,ey,f.w*3+10,f.col,k)}
  else if(f.t==='bolt'){const s=f.s||1,top=230*s,hot=Math.max(0,(k-.55)/.45);
    if(!f.sp){f.sp=mkSparks(14,170*s);f.rays=mkRays(9,30,80,1.6)}
    glowDot(p.x,p.y,80*s,f.col,.9*k,.5);
    if(f.el){const bs=flick(f,()=>boltPts(p.x+(rnd()-.5)*40*s,p.y-top,p.x,p.y,70*s,.22,0,[]));if(hot>0||Math.sin(time*60)>0)strokeBolts(bs,f.col,Math.max(hot,.35*k),s)}
    else{const w=14*s*(.4+.6*hot),g=ctx.createLinearGradient(0,p.y-top,0,p.y);g.addColorStop(0,rgba(f.col,0));g.addColorStop(1,rgba(f.col,.75*k));ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(p.x-w*.15,p.y-top);ctx.lineTo(p.x-w,p.y);ctx.lineTo(p.x+w,p.y);ctx.lineTo(p.x+w*.15,p.y-top);ctx.fill();
      ctx.strokeStyle=rgba(HI,.9*k);ctx.lineWidth=2.5*s*(.5+hot);ctx.beginPath();ctx.moveTo(p.x,p.y-top);ctx.lineTo(p.x,p.y);ctx.stroke()}
    flare(p.x,p.y,f.rays,f.col,k,s);sparks(f,p.x,p.y-4,f.col,k)}
  else if(f.t==='star'){const s=f.s*(1+(1-k)*.6),cy=p.y-28;if(!f.rays){f.rays=mkRays(8,10,26,6.28);f.cr=rnd()*.8}
    glowDot(p.x,cy,26*s,f.col,k);
    for(const r of f.rays){const a=r.a+f.cr,L=r.l*s;ctx.strokeStyle=rgba(f.col,.8*k);ctx.lineWidth=r.w;ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*5*s,cy+Math.sin(a)*5*s);ctx.lineTo(p.x+Math.cos(a)*L,cy+Math.sin(a)*L);ctx.stroke()}
    for(let n=0;n<4;n++){const a=n*Math.PI/2+f.cr,L=(n%2?22:34)*s*k;ctx.fillStyle=rgba(HI,k);ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*L,cy+Math.sin(a)*L);
      ctx.lineTo(p.x+Math.cos(a+1.57)*2.2*s,cy+Math.sin(a+1.57)*2.2*s);ctx.lineTo(p.x-Math.cos(a)*3,cy-Math.sin(a)*3);ctx.lineTo(p.x-Math.cos(a+1.57)*2.2*s,cy-Math.sin(a+1.57)*2.2*s);ctx.fill()}}
  else if(f.t==='claw'){const pr=Math.min(1,(1-k)*4);for(let n=-1;n<=1;n++){const x0=p.x+(n*11-22)*f.side,y0=p.y-56+n*3,x1=p.x+(n*11+22)*f.side,y1=p.y-10+n*3,xm=x0+(x1-x0)*pr,ym=y0+(y1-y0)*pr;
    for(const[w,c,a]of[[9,f.col,.25],[4,f.col,.7],[1.5,HI,1]]){ctx.strokeStyle=rgba(c,a*k);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo((x0+xm)/2+6*f.side,(y0+ym)/2-4,xm,ym);ctx.stroke()}}}
  else if(f.t==='parts'){const t=f.max-f.life;ctx.fillStyle=rgba(f.col,k);
    for(const q of f.ps){const x=p.x+q.vx*t,y=p.y-28+q.vy*t+90*t*t;
      if(f.shape==='petal'){ctx.beginPath();ctx.ellipse(x,y,3.4,1.7,q.r+t*7,0,7);ctx.fill()}
      else{const vy=q.vy+180*t;ctx.strokeStyle=rgba(q.r<2?HI:f.col,k);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-q.vx*.05,y-vy*.05);ctx.stroke()}}}
  else if(f.t==='crackle'){const bs=flick(f,()=>{const o=[];for(let i=0;i<3;i++){const a=rnd()*6.28,L=16+rnd()*20;boltPts(0,0,Math.cos(a)*L,Math.sin(a)*L*.8,10,.2,1,o)}return o},.06);
    ctx.save();ctx.translate(p.x,p.y-28);strokeBolts(bs,f.col,k,.45);ctx.restore()}
}
const DARKEN={bolt:150,zap:90,vortex:80,spin:70,arc:50,crackle:40};
function drawGlow2(f){
  const p=toScreen(f.x,f.y),k=f.life/f.max;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=f.dim||1;
  if(f.t==='vortex'){const[rx,ry]=isoR(f.r*(.3+.7*k));glowDot(p.x,p.y-10,rx*.5,f.col,k,.5);
    for(let arm=0;arm<3;arm++){const pts=[];for(let n=0;n<=30;n++){const t=n/30,a=-time*9+arm*2.09+t*5;pts.push([p.x+Math.cos(a)*rx*t,p.y-10+Math.sin(a)*ry*t])}
      for(const[w,c,al]of[[f.w*3,f.col,.25],[f.w,f.col,.8],[1.2,HI,.9]]){ctx.strokeStyle=rgba(c,al*k);ctx.lineWidth=w;path(pts);ctx.stroke()}}}
  else if(f.t==='zap'){const b=toScreen(f.ex,f.ey),bs=flick(f,()=>boltPts(p.x,p.y-28,b.x,b.y-28,Math.hypot(b.x-p.x,b.y-p.y)*.25,.25,0,[]));
    strokeBolts(bs,f.col,k,.8);glowDot(b.x,b.y-28,30,f.col,k)}
  else if(f.t==='brk')drawBrk(f);
  else if(f.t==='el')drawEl(f);   // 속성 재질 (r_elfx.js)
  else drawGlow(f);
  ctx.globalAlpha=1;
}
function drawProj(q){
  const p=toScreen(q.x,q.y),t=q.X.t,s=q.size,ang=Math.atan2((q.vx+q.vy)*TH/2,(q.vx-q.vy)*TW/2);ctx.lineCap='round';
  for(let i=1;i<q.trail.length;i++){const a=toScreen(q.trail[i-1].x,q.trail[i-1].y),b=toScreen(q.trail[i].x,q.trail[i].y);
    ctx.strokeStyle=rgba(q.c,i/q.trail.length*.3);ctx.lineWidth=(3+t)*s*i/q.trail.length;ctx.beginPath();ctx.moveTo(a.x,a.y-24);ctx.lineTo(b.x,b.y-24);ctx.stroke()}
  ctx.save();ctx.translate(p.x,p.y-24);ctx.rotate(ang);if(q.wavy)ctx.translate(0,Math.sin(time*25+q.ph)*7);
  if(q.kind!=='crescent'&&q.kind!=='blade'&&q.kind!=='arrow')glowDot(0,0,15*s,q.c,.45);
  if(q.kind==='crescent'||q.kind==='blade'){const r=Math.min(12*s,16);ctx.scale(.55,1);
    ctx.fillStyle=rgba(q.c,.5);ctx.beginPath();ctx.arc(-r*.4,0,r,-1.3,1.3);ctx.arc(-r*1.1,0,r*1.05,1.05,-1.05,true);ctx.closePath();ctx.fill();
    for(let i=0;i<4;i++){const a=-.9+i*.6;ctx.strokeStyle=rgba(i%2?HI:q.c,.45);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r*.4+Math.cos(a)*r*.85,Math.sin(a)*r*.85);ctx.lineTo(-r*2.6,Math.sin(a)*r*.6);ctx.stroke()}
    ctx.strokeStyle=rgba(HI,.95);ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(-r*.4,0,r,-1.2,1.2);ctx.stroke()}
  else if(q.kind==='arrow'){ctx.strokeStyle=rgba(q.c,.55);ctx.lineWidth=4*s;ctx.beginPath();ctx.moveTo(-24*s,0);ctx.lineTo(10*s,0);ctx.stroke();
    ctx.strokeStyle='#d9c9a3';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-22*s,0);ctx.lineTo(10*s,0);ctx.stroke();
    ctx.fillStyle='#eef2f4';ctx.beginPath();ctx.moveTo(15*s,0);ctx.lineTo(8*s,3*s);ctx.lineTo(8*s,-3*s);ctx.fill();
    ctx.strokeStyle=rgba(q.c,.9);ctx.lineWidth=1.4;for(const k of[-1,1]){ctx.beginPath();ctx.moveTo(-22*s,0);ctx.lineTo(-27*s,k*4*s);ctx.stroke()}}
  else if(q.kind==='spear'){ctx.fillStyle=rgba(q.c,.8);ctx.beginPath();ctx.moveTo(18*s,0);ctx.lineTo(-4*s,5*s);ctx.lineTo(-26*s,0);ctx.lineTo(-4*s,-5*s);ctx.closePath();ctx.fill();
    ctx.fillStyle=rgba(HI,.95);ctx.beginPath();ctx.moveTo(16*s,0);ctx.lineTo(-2*s,2*s);ctx.lineTo(-18*s,0);ctx.lineTo(-2*s,-2*s);ctx.closePath();ctx.fill()}
  else if(q.kind==='ring'){for(const[w,c]of[[6*s,q.c],[1.6*s,HI]]){ctx.lineWidth=w;ctx.strokeStyle=rgba(c,.9);ctx.beginPath();ctx.ellipse(0,0,10*s,4.5*s,time*20,0,5);ctx.stroke()}}
  else{glowDot(0,0,10*s,q.c,1);if(q.X.art.elc){const bs=flick(q,()=>{const o=[];for(let i=0;i<3;i++){const a=rnd()*6.28;boltPts(0,0,Math.cos(a)*14*s,Math.sin(a)*14*s,6,0,2,o)}return o},.05);strokeBolts(bs,q.c,1,.35)}}
  ctx.restore();
}
function lightAt(x,y,r,a){if(a<=0)return;const g=lx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(x-r,y-r,r*2,r*2)}
// ================= 경지 돌파 연출 (v163): 폐관으로 벽을 깨는 순간, 오른 경지마다 다른 현상 =================
// 운기(바깥 기운이 소용돌이치며 빨려듦)·본원진기와 겹치지 않게, 돌파는 몸 안의 길이 열리고 빛이 위로 솟는 모양을 바탕으로 한다.
// 높은 경지일수록 길고 크다. 이름·글·색은 data/brkfx.json BRK_FX (경지 색인으로 읽고, 표보다 높은 경지는 마지막 줄)
const BRK_FX=GD.BRK_FX||[],BRK_T=[0,2.4,2.8,3.2,3.6,4.6,5.2,5.4,6];
const WUHAENG=['120,225,150','255,120,90','250,210,100','235,240,255','110,150,255'];   // 목·화·토·금·수
function brkFx(r){const i=Math.min(r,BRK_FX.length-1),d=BRK_FX[i];if(!d||!P)return null;const L=BRK_T[Math.min(i,BRK_T.length-1)];
  fx.push({t:'brk',r:i,x:P.x,y:P.y,z:P.z||0,life:L,max:L,glow:true,col:d.col});shake=Math.max(shake,.15+i*.06);return d}
const cl01=x=>x<0?0:x>1?1:x,ez=x=>{x=cl01(x);return 1-(1-x)*(1-x)};
// 진기 한 점과 꼬리: at(u)가 돌려주는 자리를 u에서 조금씩 거슬러 찍는다
function brkMote(at,u,col,a,r=7,n=12,du=.012){for(let j=n;j>=0;j--){const q=at(u-j*du);if(q)glowDot(q[0],q[1],r*(1-j/n*.6),j?col:HI,a*(1-j/n))}}
function brkLotus(x,y,s,col,a,rot){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(1,.5);
  for(let j=0;j<8;j++){const g=rot+j*Math.PI/4;ctx.fillStyle=rgba(col,.75*a);ctx.beginPath();ctx.ellipse(Math.cos(g)*s*.55,Math.sin(g)*s*.55,s*.55,s*.22,g,0,7);ctx.fill()}
  for(let j=0;j<6;j++){const g=-rot+j*Math.PI/3+.3;ctx.fillStyle=rgba(HI,.6*a);ctx.beginPath();ctx.ellipse(Math.cos(g)*s*.3,Math.sin(g)*s*.3-s*.15,s*.3,s*.13,g,0,7);ctx.fill()}
  ctx.restore();glowDot(x,y,s*1.3,col,a)}
function drawBrk(f){if(P){f.x=P.x;f.y=P.y}
  const p=toScreen(f.x,f.y),t=1-f.life/f.max,env=cl01(t/.1)*cl01((1-t)/.18),r=f.r,cx=p.x,c=f.col,PI2=Math.PI*2;
  if(!f.sd)f.sd=Array.from({length:36},()=>({a:rnd()*PI2,d:rnd(),s:rnd(),w:rnd()}));
  const end=k0=>{const k=cl01((t-k0)/(1-k0));if(k>0){const[rx,ry]=isoR(.6+k*(1+r*.35));shock(cx,p.y,rx,ry,c,(1-k)*.9)}};
  glowDot(cx,p.y-28,26+r*5,c,.35*env);
  if(r<=2){// 소주천: 등 뒤 독맥으로 올라 앞 임맥으로 내려오는 고리 하나. 대주천: 고리가 커지고 몸을 가로로 도는 고리가 더해진다
    const big=r===2,cy=p.y-30,rx=big?14:10,ry=big?27:22,laps=big?3.5:3;
    brkMote(u=>[cx+Math.sin(u*PI2)*rx,cy-Math.cos(u*PI2)*ry],t*laps,c,env,big?8:7);
    if(big){const[hx,hy]=isoR(.75);brkMote(u=>[cx+Math.cos(u*PI2)*hx,cy+4+Math.sin(u*PI2)*hy],t*laps*.8+.3,c,env,7)}
    glowDot(cx,p.y-22,10+8*t,c,.6*env);end(.82)}
  else if(r===3){// 임독양맥: 앞뒤 두 줄이 발끝에서 정수리까지 차오르고, 정수리로 빛기둥이 솟는다
    const h=ez(t/.45),y0=p.y-4,y1=p.y-58;
    for(const dx of[-6,6]){const ye=y0+(y1-y0)*h;for(const[w,cc,al]of[[7,c,.25],[2.4,c,.8],[1,HI,1]]){ctx.strokeStyle=rgba(cc,al*env);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+dx,y0);ctx.quadraticCurveTo(cx+dx*1.6,(y0+ye)/2,cx+dx*(1-h*.8),ye);ctx.stroke()}
      glowDot(cx+dx*(1-h*.8),ye,9,c,env)}
    const k=cl01((t-.42)/.3);if(k>0){const top=p.y-58-170*ez(k),w=11*(1-k*.5),g=ctx.createLinearGradient(0,top,0,p.y-58);g.addColorStop(0,rgba(c,0));g.addColorStop(1,rgba(c,.8*env));
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx-w*.2,top);ctx.lineTo(cx-w,p.y-58);ctx.lineTo(cx+w,p.y-58);ctx.lineTo(cx+w*.2,top);ctx.fill();glowDot(cx,p.y-36,22,c,k*env)}
    end(.7)}
  else if(r===4){// 강기 성형: 금빛 강기가 둥근 막을 이루며 몸을 덮고, 경선이 그 위를 돈다. 끝에 막이 터져 퍼진다
    const g0=ez(t/.3),[rx,ry]=isoR(1.15*g0),H=78*g0,a=env*(t>.8?1-(t-.8)/.2:1);
    ctx.fillStyle=rgba(c,.08*a);ctx.beginPath();ctx.ellipse(cx,p.y,rx,H,0,Math.PI,PI2);ctx.ellipse(cx,p.y,rx,ry,0,0,Math.PI);ctx.fill();
    for(let j=0;j<6;j++){const g=time*1.4+j*Math.PI/6,xr=Math.abs(Math.cos(g))*rx;ctx.strokeStyle=rgba(c,(.25+.35*Math.abs(Math.sin(g)))*a);ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(cx,p.y,xr,H,0,Math.PI,PI2);ctx.stroke()}
    for(let j=1;j<=2;j++){ctx.strokeStyle=rgba(c,.35*a);ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx,p.y-H*j/3,rx*Math.sqrt(1-j*j/9),ry*Math.sqrt(1-j*j/9),0,0,PI2);ctx.stroke()}
    for(const[w,cc,al]of[[8,c,.3],[2.5,c,.85],[1.2,HI,1]]){ctx.strokeStyle=rgba(cc,al*a);ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(cx,p.y,rx,H,0,Math.PI,PI2);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,p.y,rx,ry,0,0,PI2);ctx.stroke()}
    glowDot(cx,p.y-H,16,c,a);end(.78)}
  else if(r===5){// 오기조원: 다섯 방위에서 오행의 기운이 나선을 그리며 단전으로 돌아가 하나가 된다
    const[R,Ry]=isoR(2.6),dy=p.y-24;
    WUHAENG.forEach((cc,j)=>{const a0=-Math.PI/2+j*PI2/5,s=(t-.06-j*.05)/.5;
      if(s<1)glowDot(cx+Math.cos(a0)*R,p.y+Math.sin(a0)*Ry,16,cc,env*(1-cl01(s))*.9,.5);
      const at=u=>{if(u<0||u>1)return null;const a=a0+u*2.4,k=Math.pow(1-u,1.2);return[cx+Math.cos(a)*R*k,p.y+Math.sin(a)*Ry*k-(p.y-dy)*ez(u)-14*Math.sin(u*Math.PI)]};
      if(s>0&&s<1.15)brkMote(at,Math.min(s,1),cc,env,9,16,.022)});
    const k=cl01((t-.6)/.25);if(k>0){WUHAENG.forEach((cc,j)=>{const a=time*2+j*PI2/5;glowDot(cx+Math.cos(a)*14*(1-k),dy+Math.sin(a)*7*(1-k),14,cc,env)});glowDot(cx,dy,20+40*ez(k),c,env*(1-k*.4))}
    const k2=cl01((t-.62)/.3);if(k2>0)WUHAENG.forEach((cc,j)=>{const[rx,ry]=isoR(.5+k2*(2.6+j*.25));shock(cx,p.y,rx,ry,cc,(1-k2)*.7)});
    end(.85)}
  else if(r===6){// 삼화취정: 정(하단전)·기(중단전)·신(상단전) 세 송이가 차례로 피고, 정수리 위로 모여 한 송이와 원광이 된다
    const fl=[['255,170,190',p.y-22],['255,225,150',p.y-38],['200,220,255',p.y-54]],m=ez((t-.5)/.22),top=p.y-84;
    fl.forEach(([cc,y],j)=>{const b=ez((t-.04-j*.14)/.18),yy=y+(top-y)*m;brkLotus(cx,yy,22*b*(1-m*.45),cc,env*(1-cl01((t-.72)/.05)),time*.8+j)});
    const k=cl01((t-.7)/.15);if(k>0){brkLotus(cx,top,34*ez(k),c,env,time*.6);
      ctx.strokeStyle=rgba(c,.7*env*k);ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,p.y-52,30*ez(k),0,PI2);ctx.stroke();glowDot(cx,p.y-52,30,c,.35*env*k);
      for(let j=0;j<12;j++){const a=j*PI2/12+time*.3,L0=28,L1=28+(j%2?12:22)*k;ctx.strokeStyle=rgba(c,.6*env*k);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*L0,p.y-52+Math.sin(a)*L0);ctx.lineTo(cx+Math.cos(a)*L1,p.y-52+Math.sin(a)*L1);ctx.stroke()}}
    end(.86)}
  else if(r===7){// 생사현관: 발밑에 음양이 돌고, 흰 기운은 오르고 검은 기운은 가라앉는다
    const[R,Ry]=isoR(1.7*ez(t/.25)),sp=time*1.3,mode=ctx.globalCompositeOperation;
    ctx.save();ctx.translate(cx,p.y);ctx.scale(1,Ry/R);ctx.rotate(sp);
    const half=()=>{ctx.beginPath();ctx.arc(0,0,R,-Math.PI/2,Math.PI/2);ctx.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2);ctx.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2,true);ctx.fill()};
    ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(8,6,18,${.55*env})`;ctx.rotate(Math.PI);half();ctx.rotate(Math.PI);
    ctx.beginPath();ctx.arc(0,R/2,R*.12,0,PI2);ctx.fill();
    ctx.globalCompositeOperation=mode;ctx.fillStyle=rgba(c,.45*env);half();ctx.beginPath();ctx.arc(0,-R/2,R*.12,0,PI2);ctx.fill();
    ctx.strokeStyle=rgba(c,.7*env);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R,0,PI2);ctx.stroke();ctx.restore();
    f.sd.slice(0,24).forEach((q,j)=>{const up=j%2===0,ph=(q.s+t*1.6)%1,[rx,ry]=isoR(1.6*q.d),x=cx+Math.cos(q.a)*rx,y=p.y+Math.sin(q.a)*ry+(up?-ph*90:-(1-ph)*90);
      if(up)glowDot(x,y,5,c,env*Math.sin(ph*Math.PI));else{ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(20,10,35,${.6*env*Math.sin(ph*Math.PI)})`;ctx.beginPath();ctx.arc(x,y,2.6,0,PI2);ctx.fill();ctx.globalCompositeOperation=mode}});
    const k=cl01((t-.55)/.3);if(k>0){ctx.strokeStyle=rgba(HI,.8*env*(1-k));ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,p.y);ctx.lineTo(cx,p.y-60-200*k);ctx.stroke()}
    end(.85)}
  else{// 천인합일: 하늘에서 넓은 빛이 내려오고, 빛잎이 숨결을 따라 오르며, 기운이 들판 멀리까지 번진다
    const k=ez(t/.3),top=p.y-420;for(const[ww,al]of[[1,.1],[.6,.14],[.28,.22]]){const w=(40+30*k)*ww,g=ctx.createLinearGradient(0,top,0,p.y);g.addColorStop(0,rgba(c,0));g.addColorStop(.75,rgba(c,al*env));g.addColorStop(1,rgba(c,al*1.6*env));
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx-w*.4,top);ctx.lineTo(cx-w,p.y);ctx.lineTo(cx+w,p.y);ctx.lineTo(cx+w*.4,top);ctx.fill()}
    const[R,Ry]=isoR(5.5);f.sd.forEach((q,j)=>{const ph=(q.s+t*1.2)%1,x=cx+Math.cos(q.a)*R*q.d+Math.sin(time*2+j)*6,y=p.y+Math.sin(q.a)*Ry*q.d-ph*120,cc=j%3===0?'255,225,150':j%3===1?c:'255,200,215';
      glowDot(x,y,7,cc,.5*env*Math.sin(ph*Math.PI));ctx.fillStyle=rgba(cc,env*Math.sin(ph*Math.PI));ctx.beginPath();ctx.ellipse(x,y,4.4,2,time*2+j,0,PI2);ctx.fill()});
    for(let j=0;j<3;j++){const kk=cl01((t-.15-j*.2)/.55);if(kk>0&&kk<1){const[rx,ry]=isoR(.5+kk*7);shock(cx,p.y,rx,ry,c,(1-kk)*.6)}}
    glowDot(cx,p.y-30,40,c,.5*env)}
}

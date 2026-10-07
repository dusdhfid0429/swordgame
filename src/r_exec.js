let sched=[],projs=[];const later=(t,f)=>sched.push({t,f});
function anim(d){P.swing=P.swingMax=d}
const front=k=>({x:P.x+P.fx*k,y:P.y+P.fy*k});
const rot=(k,off)=>({x:P.x+(P.fx*Math.cos(off)-P.fy*Math.sin(off))*k,y:P.y+(P.fx*Math.sin(off)+P.fy*Math.cos(off))*k});
const sang=()=>Math.atan2((P.fx+P.fy)*TH/2,(P.fx-P.fy)*TW/2);
function circleHit(X,c,r,m,kb,stun){const o={x:c.x,y:c.y};for(const e of foes())if(e.hp>0&&dist(e,o)<r)hitE(X,e,m,kb,stun,o)}
function arcHit(X,r,cos,m,kb,stun){for(const e of foes()){if(e.hp<=0)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d<r&&(d<.3||(dx*P.fx+dy*P.fy)/d>cos))hitE(X,e,m,kb,stun)}}
function lineHit(X,len,w,m,kb,stun){for(const e of foes()){if(e.hp<=0)continue;const dx=e.x-P.x,dy=e.y-P.y,t=dx*P.fx+dy*P.fy,q=Math.abs(dx*P.fy-dy*P.fx);if(t>-.2&&t<len&&q<w)hitE(X,e,m,kb,stun)}}

// effects: tier 2 adds a wide afterglow copy, tier 3 adds a gold core copy
function GL(o,X){
  const t=X?X.t:0;o.glow=true;o.el=!!(X&&X.art.elc);o.w=(o.w||2)*(1+.3*t);o.max=o.life;fx.push(o);
  if(t>=2)fx.push({...o,life:o.life*1.5,max:o.life*1.5,w:o.w*2.2,dim:.35,r:o.r&&o.r*1.08});
  if(t>=3)fx.push({...o,col:'255,215,120',life:o.life*1.2,max:o.life*1.2,w:o.w*.6,dim:.8,r:o.r&&o.r*.92});
}
const fArc=(X,r,spread,col,w,life)=>GL({t:'arc',x:P.x,y:P.y,ang:sang(),r,spread,col,w,life:Math.max(.34,life*1.8),flip:(P.flipC=!P.flipC)},X);
const fSpin=(X,c,r,col,w,life)=>GL({t:'spin',x:c.x,y:c.y,r,col,w,life},X);
const fRing=(X,c,r,col,w,life)=>GL({t:'ring2',x:c.x,y:c.y,r,col,w,life},X);
const fLine=(X,len,col,w,life,wavy,off=0)=>{const e=rot(len,off);GL({t:'line',x:P.x,y:P.y,ex:e.x,ey:e.y,col,w,life,wavy},X)};
const fBolt=(X,c,col,s=1)=>GL({t:'bolt',x:c.x,y:c.y,col,s,life:.5},X);
const fStar=(X,c,col,s=1,life=.2)=>GL({t:'star',x:c.x,y:c.y,col,s:s*(1+.15*(X?X.t:0)),life},X);
const fClaw=(X,c,col)=>GL({t:'claw',x:c.x,y:c.y,col,life:.3,side:(P.fx-P.fy)>=0?1:-1},X);
function fParts(X,c,col,n,spd,shape,life=.7){n+=4*(X?X.t:0);const ps=[];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=spd*(.4+Math.random()*.8);ps.push({vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6-spd*.5,r:Math.random()*6})}
  fx.push({t:'parts',glow:true,x:c.x,y:c.y,col,ps,shape,life,max:life})}
function fxHit(X,e,s=1){
  const c=X.art.c,w=X.art.cls;
  if(w==='도')fClaw(X,e,c);else if(w==='봉')fRing(X,e,.6*s,c,3,.25);else fStar(X,e,c,(w==='권'?1.2:.9)*s,.2);
  if(X.art.elc)GL({t:'crackle',x:e.x,y:e.y,col:c,life:.3},X);
  fParts(X,e,c,5,60,X.art.pt==='petal'||X.art.pt==='leaf'?'petal':'dot',.6);
}

function exec(f,e,X){
  if(f.delay){const g={...f,delay:0};later(f.delay,()=>exec(g,e,X));return}
  const t=X.t,c=X.art.c,m=f.m,rm=t>=2?1.2:1,stun=f.stun||0,kb=f.kb||.3,hits=f.hits||1;
  switch(f.p){
    case'melee':anim(.2);if(e){hitE(X,e,m,kb,stun,P,true);fxHit(X,e)}fArc(X,1.15,1.6,c,3,.2);break;
    case'multi':for(let i=0;i<hits+(t>=3?1:0);i++)later(i*.1,()=>{anim(.1);if(e&&e.hp>0){hitE(X,e,m,.08,stun,P,true);fxHit(X,e,.8)}fArc(X,.8,1.1,c,2,.14)});break;
    case'arc':for(let i=0;i<hits;i++)later(i*.12,()=>{anim(.24);arcHit(X,f.rad*rm,Math.cos(f.spread/2),m,kb,stun);fArc(X,f.rad*rm,f.spread,c,6,.28)});break;
    case'circle':for(let i=0;i<hits;i++)later(i*.13,()=>{anim(.26);circleHit(X,P,f.rad*rm,m,kb,stun);fSpin(X,P,f.rad*rm,c,5,.32)});break;
    case'line':anim(.22);lineHit(X,f.len*rm,f.w,m,kb,stun);fLine(X,f.len*rm,c,f.len>5?10:5,.3,f.wavy);break;
    case'proj':{anim(.22);let n=f.cnt;if(f.full)n=Math.round(n*(t>=1?1.5:1));else if(t>=1)n+=1;
      const base=Math.atan2(P.fy,P.fx),sp=(f.spread||.3)*(n>f.cnt&&!f.full?1.2:1);
      for(let i=0;i<n;i++){const a=f.full?base+i/n*Math.PI*2:base+(n>1?(i/(n-1)-.5)*sp:0);
        projs.push({x:P.x,y:P.y,vx:Math.cos(a)*f.spd,vy:Math.sin(a)*f.spd,left:f.len*rm,m,kb,stun,pierce:f.pierce||t>=2,size:(f.size||1)*(1+.15*t),
          wavy:f.wavy,hit:new Set,X,c,kind:X.pj||CLASS[X.art.cls].pj,trail:[],ph:Math.random()*6})}
      break}
    case'drop':{anim(.3);const ctr=f.self?{x:P.x,y:P.y}:e?{x:e.x,y:e.y}:front(Math.min(f.r,2));
      circleHit(X,ctr,f.rad*rm,m,kb,stun);fBolt(X,ctr,c,f.rad>2?1.6:1);fx.push({t:'puff',x:ctr.x,y:ctr.y,life:.6});fRing(X,ctr,f.rad*rm,c,4,.4);if(f.rad>2)shake=.3;break}
    case'rain':{anim(.3);const ctr=f.self?{x:P.x,y:P.y}:e?{x:e.x,y:e.y}:front(2),n=f.cnt+(t>=1?2:0)+(t>=3?3:0);
      for(let i=0;i<n;i++)later(i*.06,()=>{const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*f.rad*rm,pt={x:ctr.x+Math.cos(a)*d,y:ctr.y+Math.sin(a)*d};
        circleHit(X,pt,.8,m,.2,stun);fBolt(X,pt,c,.7);fRing(X,pt,.8,c,3,.3);if(X.art.pt==='petal')fParts(X,pt,c,6,50,'petal',.6)});break}
    case'pull':{anim(.3);const o={x:P.x,y:P.y},R=f.rad*rm;
      for(const en of foes())if(en.hp>0&&dist(en,o)<R){hitE(X,en,m,0,stun);en.kb={x:(o.x-en.x)*1.4,y:(o.y-en.y)*1.4}}
      GL({t:'vortex',x:o.x,y:o.y,r:R,col:c,w:3,life:.5},X);break}
    case'chain':{anim(.24);let cur=e||nearest(f.r);if(!cur){fArc(X,1,1.4,c,3,.2);break}
      const done=new Set,n=f.cnt+(t>=1?1:0)+(t>=3?2:0);let from={x:P.x,y:P.y};
      for(let i=0;i<n&&cur;i++){const a=from,b=cur;later(i*.08,()=>{hitE(X,b,m,.1,stun);GL({t:'zap',x:a.x,y:a.y,ex:b.x,ey:b.y,col:c,w:3,life:.25},X)});
        done.add(cur);from={x:cur.x,y:cur.y};let nb=null,bd=2.8;for(const o of foes())if(o.hp>0&&!done.has(o)){const d=dist(o,cur);if(d<bd){bd=d;nb=o}}cur=nb}
      break}
    case'blink':{const tg=e||nearest(f.r);if(!tg){fArc(X,1,1.4,c,3,.2);break}blinkTo(X,tg);anim(.2);hitE(X,tg,m,.6,stun,P,true);fxHit(X,tg,1.3);break}
    case'blinkMulti':{const list=foes().filter(o=>o.hp>0&&dist(o,P)<6).sort((a,b)=>dist(a,P)-dist(b,P)).slice(0,f.cnt+(t>=2?1:0));
      list.forEach((tg,i)=>later(i*.13,()=>{if(tg.hp<=0)return;blinkTo(X,tg);anim(.12);hitE(X,tg,m,.4,stun,P,true);fxHit(X,tg,1.1)}));
      if(!list.length)fArc(X,1,1.4,c,3,.2);break}
    case'dash':{for(let s=0;s<Math.round(f.dist*4);s++){const nx=P.x+P.fx*.25,ny=P.y+P.fy*.25;if(!walkAt(nx,ny))break;if(s%2===0)fx.push({t:'ghost',x:P.x,y:P.y,life:.3,col:c});P.x=nx;P.y=ny}
      P.inv=Math.max(P.inv,.2);P.path=null;exec(f.then,e,X);break}
  }
}
function blinkTo(X,tg){fx.push({t:'ghost',x:P.x,y:P.y,life:.35,col:X.art.c});const dx=tg.x-P.x,dy=tg.y-P.y,l=Math.hypot(dx,dy)||1;
  let nx=tg.x+dx/l*.7,ny=tg.y+dy/l*.7;if(!walkAt(nx,ny)){nx=tg.x-dx/l*.7;ny=tg.y-dy/l*.7}if(walkAt(nx,ny)){P.x=nx;P.y=ny}face(tg.x,tg.y);P.path=null}
const blockedAt=(x,y)=>{const i=Math.floor(x),j=Math.floor(y);return i<0||j<0||i>=N||j>=N||!!objs[j][i]};
function updateProjs(dt){
  for(const q of projs){q.x+=q.vx*dt;q.y+=q.vy*dt;q.left-=Math.hypot(q.vx,q.vy)*dt;q.trail.push({x:q.x,y:q.y});if(q.trail.length>8)q.trail.shift();
    if(blockedAt(q.x,q.y)){q.left=0;fRing(q.X,q,.4,q.c,2,.2)}
    for(const e of foes())if(e.hp>0&&!q.hit.has(e)&&dist(e,q)<.42*Math.max(1,q.size*.7)){q.hit.add(e);hitE(q.X,e,q.m,q.kb,q.stun,{x:q.x-q.vx,y:q.y-q.vy});fxHit(q.X,e,.7);if(!q.pierce){q.left=0;break}}}
  projs=projs.filter(q=>q.left>0);
}

let sched=[],projs=[];const later=(t,f)=>sched.push({t,f});
function anim(d){P.swing=P.swingMax=d}
const front=k=>({x:P.x+P.fx*k,y:P.y+P.fy*k});
const rot=(k,off)=>({x:P.x+(P.fx*Math.cos(off)-P.fy*Math.sin(off))*k,y:P.y+(P.fx*Math.sin(off)+P.fy*Math.cos(off))*k});
const sang=()=>Math.atan2((P.fx+P.fy)*TH/2,(P.fx-P.fy)*TW/2);
function circleHit(X,c,r,m,kb,stun){const o={x:c.x,y:c.y};for(const e of foes())if(e.hp>0&&dist(e,o)<r)hitE(X,e,m,kb,stun,o)}
function arcHit(X,r,cos,m,kb,stun){for(const e of foes()){if(e.hp<=0)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d<r&&(d<.3||(dx*P.fx+dy*P.fy)/d>cos))hitE(X,e,m,kb,stun)}}
function lineHit(X,len,w,m,kb,stun){for(const e of foes()){if(e.hp<=0)continue;const dx=e.x-P.x,dy=e.y-P.y,t=dx*P.fx+dy*P.fy,q=Math.abs(dx*P.fy-dy*P.fx);if(t>-.2&&t<len&&q<w)hitE(X,e,m,kb,stun)}}

// effects: tier 2 adds a wide afterglow copy, tier 3 adds a gold core copy
// 같은 무공을 연달아 쓰면 앞선 시전의 이펙트는 흐리게 줄여 빨리 거둔다 (겹쳐 하얗게 뭉개지지 않게, data/elfx.json FX_OLD)
const FX_OLD=GD.FX_OLD;
function fadeOld(X){if(!X||!X.key)return;for(const f of fx)if(f.ck===X.key&&f.cx!==X&&!f.old){f.old=1;f.dim=(f.dim||1)*FX_OLD.dim;f.life=Math.min(f.life,FX_OLD.life)}}
function tagCast(X,i0,thin=true){if(X&&X.key)for(let i=i0;i<fx.length;i++){fx[i].cx=X;fx[i].ck=X.key;fxPw(fx[i],X,thin)}}   // fxPw: 낮은 성은 옅고 가늘게 (g_qstar.js)
function GL(o,X){
  fadeOld(X);const i0=fx.length;
  const t=X?X.t:0;o.glow=true;o.el=!!(X&&X.art.elc);o.w=(o.w||2)*(1+.3*t);o.max=o.life;if(X&&X.art&&!o.c2)o.c2=X.art.c2;fx.push(o);   // c2: 무공 특성 보조색 (g_fxcol.js, v169)
  if(t>=2&&qsGlow(X,QS.fx.g2))fx.push({...o,col:o.c2||o.col,life:o.life*1.5,max:o.life*1.5,w:o.w*2.2,dim:o.c2&&isDark(o.col)?.22:.35,r:o.r&&o.r*1.08});   // 잔광은 보조색 (마기는 검은 기운 둘레에 옅게)
  if(t>=3&&qsGlow(X,QS.fx.g3))fx.push({...o,col:'255,215,120',life:o.life*1.2,max:o.life*1.2,w:o.w*.6,dim:.8,r:o.r&&o.r*.92});
  runHooks('glFx',o,X);   // 심법 속성 재질 (r_elfx.js, v165)
  tagCast(X,i0);
}
// v211 (사용자 2026-10-30 "권각 무공에 검기·검강이 나와 이상하다. 무기 형태를 기본으로, 찌르면 찌르는 모양 휘두르면 휘두르는 모양"):
// 한 대상을 치는 공격은 병기의 동작(CLASS.anim)을 따른다. 휘두르기(검·도·봉·단·편)는 반달, 찌르기(창)는 곧게 뻗는 기의 창끝, 주먹(권·맨손)은 앞으로 밀려 나가는 기 덩어리.
// 부채꼴로 쓸어 치는 초식(arc)은 어느 병기든 휘두르는 동작이라 반달 그대로다 (sweep)
const strikeMo=X=>{const c=X&&X.art&&X.art.cls,a=c&&CLASS[c]&&CLASS[c].anim;return a==='thrust'?'thrust':a==='punch'?'punch':'swing'};
const fArc=(X,r,spread,col,w,life,sweep)=>{const mo=sweep?'swing':strikeMo(X);const o={t:mo==='swing'?'arc':'thrust',mo,x:P.x,y:P.y,ang:sang(),r,spread,col,w,life:Math.max(.34,life*1.8),flip:(P.flipC=!P.flipC)};GL(o,X);const i1=fx.length;runHooks('slashFx',o);tagCast(X,i1,false)};   // 검기 겹은 이미 가늘어진 o.w로 그려지니 밝기만   // slashFx: 경지 검기·검사·검강 (g_realmfx.js)
const fSpin=(X,c,r,col,w,life)=>GL({t:'spin',x:c.x,y:c.y,r,col,w,life},X);
const fRing=(X,c,r,col,w,life)=>GL({t:'ring2',x:c.x,y:c.y,r,col,w,life},X);
const fLine=(X,len,col,w,life,wavy,off=0)=>{const e=rot(len,off);GL({t:'line',x:P.x,y:P.y,ex:e.x,ey:e.y,col,w,life,wavy},X)};
const fBolt=(X,c,col,s=1)=>GL({t:'bolt',x:c.x,y:c.y,col,s,life:.5},X);
const fStar=(X,c,col,s=1,life=.2)=>GL({t:'star',x:c.x,y:c.y,col,s:s*(1+.15*(X?X.t:0)),life},X);
const fClaw=(X,c,col)=>GL({t:'claw',x:c.x,y:c.y,col,life:.3,side:(P.fx-P.fy)>=0?1:-1},X);
function fParts(X,c,col,n,spd,shape,life=.7){n+=4*(X?X.t:0);const ps=[];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=spd*(.4+Math.random()*.8);ps.push({vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6-spd*.5,r:Math.random()*6})}
  fadeOld(X);fx.push({t:'parts',glow:true,x:c.x,y:c.y,col,c2:X&&X.art&&X.art.c2,ps,shape,life,max:life});tagCast(X,fx.length-1)}
// 암기술 비(낙화우 등): 번개 대신 비침 몇 가닥이 위에서 꽂힌다
const needleRain=(X,pt,c)=>{for(let i=0;i<3;i++)GL({t:'needle',x:pt.x+(Math.random()-.5)*.5,y:pt.y+(Math.random()-.5)*.5,col:c,life:.28},X)};
function fxHit(X,e,s=1){
  const c=X.art.c,w=X.art.cls;
  if(w==='단'||w==='편')dagHitFx(X,e);   // 단검술·절편술: 손에 쥔 단도가 휘둘러진다 (g_amgi.js)
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
    case'arc':for(let i=0;i<hits;i++)later(i*.12,()=>{anim(.24);arcHit(X,f.rad*rm,Math.cos(f.spread/2),m,kb,stun);fArc(X,f.rad*rm,f.spread,c,6,.28,true)});break;
    case'circle':for(let i=0;i<hits;i++)later(i*.13,()=>{anim(.26);circleHit(X,P,f.rad*rm,m,kb,stun);fSpin(X,P,f.rad*rm,c,5,.32)});break;
    case'line':anim(.22);lineHit(X,f.len*rm,f.w,m,kb,stun);fLine(X,f.len*rm,c,f.len>5?10:5,.3,f.wavy);break;
    case'proj':{
      const fire=()=>{anim(.22);let n=f.cnt;if(f.full)n=Math.round(n*(t>=1?1.5:1));else if(t>=1)n+=1;
      const base=Math.atan2(P.fy,P.fx),sp=(f.spread||.3)*(n>f.cnt&&!f.full?1.2:1),dirs=[];
      for(let i=0;i<n;i++)dirs.push(f.full?base+i/n*Math.PI*2:base+(n>1?(i/(n-1)-.5)*sp:0));
      const am=X.art.cls==='암',vol=am?new Map:null,shot=(a,tg)=>{if(tg)a=Math.atan2(tg.y-P.y,tg.x-P.x)+(Math.random()-.5)*.04;
        projs.push({x:P.x,y:P.y,vx:Math.cos(a)*f.spd,vy:Math.sin(a)*f.spd,left:f.len*rm,m,kb,stun,pierce:f.pierce||t>=2,size:(f.size||1)*(1+.15*t),
          wavy:f.wavy,hit:new Set,X,c,c2:X.art.c2,kind:f.pj||X.pj||CLASS[X.art.cls].pj,psn:f.psn,trail:[],ph:Math.random()*6,vol});
        if(am&&!amgiLoad(projs[projs.length-1])&&!AMGI_FREE){projs.pop();return null}return projs[projs.length-1]};   // 요대 암기를 싣는다, 다 떨어진 발은 안 나간다 (g_amgi.js)   // f.pj·psn: 암기술 초식의 모양과 독 (v181)
      if(am){const L=amgiAim(dirs,e,f.len*rm),aim=L.some(s=>s.tg)?null:amgiAimPt(f.len*rm);   // 궤적 f.path (v190): 조준한 적(tg)을 나선·호·꺾임·소용돌이로 쫓는다
        L.forEach((s,i)=>{const go=()=>{const tg=s.tg&&s.tg.hp>0?s.tg:null,q=shot(s.a,tg);if(q&&f.path)amgiFly(q,f.path,dirs[i%n],tg,aim,i,n)};s.d?later(s.d,go):go()})}
      else dirs.forEach(a=>shot(a))};
      if(f.path==='bullet'){anim(.15);amgiCharge(X,c);later(APATH.bullet.charge,fire)}else fire();   // 회전 일격: 기를 모았다 던진다
      break}
    case'drop':{anim(.3);const ctr=f.self?{x:P.x,y:P.y}:e?{x:e.x,y:e.y}:front(Math.min(f.r,2));
      circleHit(X,ctr,f.rad*rm,m,kb,stun);fBolt(X,ctr,c,f.rad>2?1.6:1);fx.push({t:'puff',x:ctr.x,y:ctr.y,life:.6});fRing(X,ctr,f.rad*rm,c,4,.4);if(f.rad>2)shake=.3;break}
    case'rain':{anim(.3);const ctr=f.self?{x:P.x,y:P.y}:e?{x:e.x,y:e.y}:front(2),n=f.cnt+(t>=1?2:0)+(t>=3?3:0);
      for(let i=0;i<n;i++)later(i*.06,()=>{const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*f.rad*rm,pt={x:ctr.x+Math.cos(a)*d,y:ctr.y+Math.sin(a)*d};
        circleHit(X,pt,.8,m,.2,stun);if(X.art.cls==='암')needleRain(X,pt,c);else fBolt(X,pt,c,.7);fRing(X,pt,.8,c,3,.3);if(X.art.pt==='petal')fParts(X,pt,c,6,50,'petal',.6)});break}
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
    case'dash':{for(let s=0;s<Math.round(f.dist*4);s++){const nx=P.x+P.fx*.25,ny=P.y+P.fy*.25;if(!walkAt(nx,ny)||!hstep(P.x,P.y,nx,ny))break;if(s%2===0)fx.push({t:'ghost',x:P.x,y:P.y,life:.3,col:c});P.x=nx;P.y=ny}
      P.inv=Math.max(P.inv,.2);P.path=null;exec(f.then,e,X);break}
  }
}
// 암기 조준 (data/arts.json AMGI_AIM): 사거리 안 적에게 한 발씩, 적이 적으면 남는 발을 몰아 연달아, 많거나 둘러싸였으면 남는 발은 원래 모양으로 빈 쪽에
const AIM=GD.AMGI_AIM;
function amgiAim(dirs,e,len){
  const n=dirs.length,ts=foes().filter(o=>o.hp>0&&dist(o,P)<len+AIM.reach).sort((a,b)=>dist(a,P)-dist(b,P));
  if(e&&e.hp>0&&ts.includes(e))ts.unshift(...ts.splice(ts.indexOf(e),1));
  if(!ts.length)return dirs.map(a=>({a}));
  face(ts[0].x,ts[0].y);
  const out=ts.slice(0,n).map(tg=>({tg,a:Math.atan2(tg.y-P.y,tg.x-P.x)})),ang=out.map(s=>s.a);let left=n-out.length;
  if(left&&ts.length<AIM.surround){const k=out.length,cnt=out.map(()=>1);
    for(let j=0;left&&j<k*AIM.cap;j++){const i=j%k;if(cnt[i]>=AIM.cap)continue;out.push({tg:out[i].tg,a:ang[i],d:cnt[i]*AIM.gap});cnt[i]++;left--}}
  if(left){const gap=a=>Math.min(...ang.map(b=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))));   // 남는 발: 겨눈 쪽에서 가장 먼 원래 방향부터
    dirs.slice().sort((a,b)=>gap(b)-gap(a)).slice(0,left).forEach(a=>out.push({a}))}
  return out}
function blinkTo(X,tg){fx.push({t:'ghost',x:P.x,y:P.y,life:.35,col:X.art.c});const dx=tg.x-P.x,dy=tg.y-P.y,l=Math.hypot(dx,dy)||1;
  let nx=tg.x+dx/l*.7,ny=tg.y+dy/l*.7;if(!walkAt(nx,ny)||!hstep(tg.x,tg.y,nx,ny)){nx=tg.x-dx/l*.7;ny=tg.y-dy/l*.7}if(walkAt(nx,ny)&&hstep(tg.x,tg.y,nx,ny)){P.x=nx;P.y=ny}face(tg.x,tg.y);P.path=null}
const blockedAt=(x,y)=>{const i=Math.floor(x),j=Math.floor(y);return i<0||j<0||i>=N||j>=NH||!!objs[j][i]};
// 나무·지붕 위에서 쏜 투사체는 주인공 높이에서 출발해 겨눈 적(없으면 날아갈 끝)에 닿을 때 땅 높이로 내려온다
function projDrop(q){const z=q.z!==undefined?q.z:(P.z||0)>0&&Math.abs(q.x-P.x)<.8&&Math.abs(q.y-P.y)<.8?P.z:0;q.z=q.z0=z;if(!z)return;
  q.ox=q.x;q.oy=q.y;const v=Math.hypot(q.vx,q.vy)||1,ux=q.vx/v,uy=q.vy/v;let zd=Math.max(1,q.left||1),bs=1e9;
  for(const e of foes()){if(e.hp<=0)continue;const dx=e.x-q.x,dy=e.y-q.y,a=dx*ux+dy*uy,off=Math.abs(dx*uy-dy*ux);if(a>.3&&a<=zd+1&&off<Math.max(1.2,a*.35)&&off+a*.1<bs){bs=off+a*.1;zd=a}}
  q.zd=Math.max(.8,zd)}
function updateProjs(dt){
  for(const q of projs){if(q.z0===undefined)projDrop(q);
    if(q.path)amgiMove(q,dt);else{q.x+=q.vx*dt;q.y+=q.vy*dt;q.left-=Math.hypot(q.vx,q.vy)*dt}if(q.z0)q.z=q.z0*Math.max(0,1-Math.hypot(q.x-q.ox,q.y-q.oy)/q.zd);q.trail.push({x:q.x,y:q.y,z:q.hz,zz:q.z||0});if(q.trail.length>8)q.trail.shift();   // 암기 궤적 (g_amgi.js)
    if(q.high===undefined)q.high=!!P.perch;   // 높은 곳에서 쏜 것은 장애물을 넘는다
    if(!q.high&&blockedAt(q.x,q.y)){q.left=0;fRing(q.X,q,.4,q.c,2,.2)}
    for(const e of foes())if(e.hp>0&&!q.hit.has(e)&&dist(e,q)<.42*Math.max(1,q.size*.7)){q.hit.add(e);let qm=q.m;if(q.vol){const k=q.vol.get(e)||0;q.vol.set(e,k+1);if(k)qm*=AIM.over}hitE(q.X,e,qm,q.kb,q.stun,{x:q.x-q.vx,y:q.y-q.vy});fxHit(q.X,e,.7);if(q.path==='bullet')amgiImpact(q,e);if(q.psn&&e.hp>0){e.psn=Math.max(e.psn||0,q.psn);e.psnD=Math.max(e.psnD||0,2,atk()*.12*q.m);e.aggro=true}if(!q.pierce){q.left=0;break}}}
  for(const q of projs)if(q.left<=0&&q.boom)amgiBoom(q);   // 벽력자는 맞거나 떨어진 자리에서 터진다
  projs=projs.filter(q=>q.left>0);
}

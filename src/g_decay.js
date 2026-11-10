// ================= 무너져 가는 문파 (v246, 사용자 2026-11-10) =================
// "맵이동시 폐허로 갱신되는 문제는 맵에 있는동안 맵이 점점 폐허가 되게는 안돼? 전각이 점점 기울거나 불이 붙거나… 문파가 점점 멸문으로 가는 과정을 맵에서도 인지할 수 있게"
// 문파 인원이 기준의 DECAY.start(50%) 밑으로 내려가면 본산 전각이 하나씩 그을리고(1: 등불 꺼짐·연기) 불붙고(2) 기울고(3) 지붕이 꺼진다(4).
// 어느 전각이 먼저 무너지는지는 전각마다 정해진 값(hash)으로 흩어 놓아, 인원이 줄수록 무너진 전각이 늘어난다.
// 맵에 있는 동안 인원이 줄면(무인을 베거나 결전에 지면) 그 자리에서 다음 단계로 바뀌며 불티·먼지·흔들림이 난다.
// 맵에 있는 동안 멸문하면 모든 전각이 DECAY.fallDur 초에 걸쳐 차례로 불타 무너지고, 끝에 g_ruin.js ruinApply 로 폐허가 된다(다시 들어올 필요 없음).
// 그림: 그을음·탄 지붕·꺼진 지붕은 건물 그림 캐시에 굽고(r_build.js decayVec), 기울기는 그릴 때 밑동 축 기울임, 불·연기·재는 매 프레임 그린다.
const DEC=GD.DECAY;
let DEC_SEV=0,DEC_T=0,DEC_LOG=-99,DEC_FALL=null,DEC_P=[];
const decCl=(v,a,b)=>v<a?a:v>b?b:v;
const decStage=lv=>DEC.stage.filter(t=>lv>=t).length;
function decSevNow(){const R=REGION();if(!R||R.dead||!P)return 0;const s=ruinSect(R);if(!s)return 0;
  if(DEC_FALL&&DEC_FALL.id===REG)return DEC_FALL.s0+(1-DEC_FALL.s0)*Math.min(1,DEC_FALL.t/(DEC.fallDur*DEC.fallRamp));   // 멸문 순간: 몇 초에 걸쳐 끝까지
  return decCl((DEC.start-sectPop(s.id)/popBase(s))/DEC.start,0,1)}
const decName=(bi,b)=>{const h=(REGION().halls||[]).find(h=>h.bi===bi);return h&&h.n||(b.kind==='pavilion'?'정자':'전각')};
// 건물 그림과 같은 처마·용마루 높이
function decGeo(b){const pav=b.kind==='pavilion';if(b.fl>1&&typeof towerDims==='function'){const D=towerDims(b);return{H0:D.H0,RH:D.RH,S:D.s[D.n-1]}}const H0=(pav?34:38)+(pav?0:4);return{H0,RH:H0+10+8*Math.min(b.w,b.h),S:0}}
function decSync(live){const sev=decSevNow(),R=REGION(),s=ruinSect(R),sd=(s&&s.i||1)*31;DEC_SEV=sev;let top=0;
  builds.forEach((b,bi)=>{const lv=sev>0?decCl(sev*(1+DEC.jit)-hash(bi*13+7,sd)*DEC.jit,0,1):0,st=decStage(lv),was=b._dk||0;b._lv=lv;top=Math.max(top,st);
    if(b._lean==null)b._lean=hash(bi*5+1,sd+9)<.5?-1:1;
    const[t0,t1]=DEC.tilt,k3=decCl((lv-DEC.stage[2])/(1-DEC.stage[2]),0,1),k2=decCl((lv-DEC.stage[1])/(1-DEC.stage[1]),0,1);
    b._tt=st>=3?b._lean*(t0+(t1-t0)*k3):0;b._ft=st>=2?.55+.45*k2:0;
    if(!live||b._tilt==null){b._tilt=live?0:b._tt;b._fire=live?0:b._ft;b._tv=0}
    if(st!==was){b._dk=st;if(live&&st>was)decEvent(b,bi,st)}});
  return top}
function decEvent(b,bi,st){decBurst(b,st);const nm=decName(bi,b);
  if(st===3){shake=Math.max(shake,DEC.shake.tilt);b._tv+=b._lean*.25}
  if(st===4){shake=Math.max(shake,DEC.shake.fall);b._tv+=b._lean*.45}
  if(st>=2)addText(b.x+b.w/2,b.y+b.h,DEC.names[st],st>=4?'#ff7a5a':st===3?'#e0b070':'#ffa040');
  if(st>=2&&time-DEC_LOG>DEC.logGap){DEC_LOG=time;log(DEC.live[st].replace('{b}',nm),st>=4?'dmg':'info')}}
// 불티·먼지·기왓장 조각 (세계 좌표 x,y + 높이 z 픽셀)
function decBurst(b,kind){const g=decGeo(b),R=Math.random;
  const roof=()=>({x:b.x+R()*b.w,y:b.y+R()*b.h,z:g.H0+R()*(g.RH-g.H0)*.6}),base=()=>({x:b.x-.3+R()*(b.w+.6),y:b.y+b.h+.1+R()*.6,z:2});
  const add=(k,p,o)=>{if(DEC_P.length<260)DEC_P.push({k,x:p.x,y:p.y,z:p.z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,life:o.l,max:o.l,r:o.r||1,a:R()*6.28})};
  if(kind===1)for(let i=0;i<5;i++)add('dust',roof(),{vz:16,l:1.8,r:.6});
  if(kind===2||kind>=4)for(let i=0;i<(kind>=5?26:16);i++)add('spark',roof(),{vx:(R()-.5)*1.4,vy:(R()-.5)*1.4,vz:40+R()*70,l:.7+R()*.7});
  if(kind>=3){const n=kind===3?6:kind===4?16:22;for(let i=0;i<n;i++)add('dust',base(),{vx:(R()-.5)*.9,vy:(R()-.5)*.5,vz:6+R()*12,l:1.4+R()*1.2,r:kind===3?.8:1.4});
    for(let i=0;i<n;i++)add('chip',roof(),{vx:(R()-.5)*2.2,vy:R()*1.6,vz:20+R()*40,l:1.8})}}
// 멸문이 맵 안에서 일어났을 때: 연출이 끝나면 그 자리에서 폐허로
function decRuin(id){for(const b of builds){decBurst(b,5);b._dk=0;b._tilt=0;b._tv=0;b._fire=0;b._ft=0;b._tt=0}shake=Math.max(shake,DEC.shake.ruin);ruinApply(id,true);DEC_SEV=0}
hook('sectFall',sid=>{if(!P||!REG)return;const s=SECTS[sid];if(!s||ruinSect(REGIONS[REG])!==s||REGION().dead)return;
  DEC_FALL={id:REG,t:0,s0:DEC_SEV};log(DEC.fall.replace('{s}',s.n),'dmg')});
hook('regionLoaded',id=>{if(DEC_FALL&&DEC_FALL.id!==id)DEC_FALL=null;DEC_P=[];DEC_T=.25;if(!P)return;const R=REGIONS[id];
  const top=decSync(false),s=ruinSect(R);if(top>=1&&s&&!R.hall&&!R.dead)log(DEC.enter[top].replace('{s}',s.n),top>=3?'dmg':'info')});
hook('tick',dt=>{if(!P||!REG||!builds)return;
  if(DEC_FALL){DEC_FALL.t+=dt;if(DEC_FALL.t>=DEC.fallDur){const id=DEC_FALL.id;DEC_FALL=null;if(id===REG&&!REGION().dead){decRuin(id);return}}}
  DEC_T-=dt;if(DEC_T<=0){DEC_T=DEC_FALL?.12:.25;decSync(true)}
  const[k,dmp]=DEC.spring;
  for(const b of builds){if(b._tt==null)continue;b._tv=(b._tv||0)+((b._tt-b._tilt)*k-b._tv*dmp)*dt;b._tilt+=b._tv*dt;if(!b._tt&&Math.abs(b._tilt)<.001&&Math.abs(b._tv)<.01){b._tilt=0;b._tv=0}
    const fr=b._ft>b._fire?DEC.fireIn:DEC.fireOut;b._fire+=decCl(b._ft-b._fire,-fr*dt,fr*dt)}
  for(const p of DEC_P){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
    if(p.k==='chip'){p.vz-=240*dt;p.a+=dt*9;if(p.z<=0){p.z=0;p.vz=0;p.vx*=.5;p.vy*=.5}}else if(p.k==='spark'){p.vz-=30*dt;p.vx*=.98}else{p.vx*=.97;p.vy*=.97}}
  prune(DEC_P,p=>p.life>0)});
// ---- 그림 ----
// 그을음·탄 지붕·꺼진 지붕: drawBuildVec 이 건물 그림 캐시에 구울 때 부른다 (단계 1~4)
function decayVec(b,st,gg){const{x,y,X1,Y1,WH,H0,RH,R1,R2,Eb,El}=gg,sd=(b.x*7+b.y*13)|0;
  const FA=scr(x,Y1),FB=scr(X1,Y1),SB=scr(X1,y);
  const blot=(cx,cy,rx,ry,a)=>{const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry));gr.addColorStop(0,`rgba(16,11,8,${a})`);gr.addColorStop(.6,`rgba(16,11,8,${a*.55})`);gr.addColorStop(1,'rgba(16,11,8,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.fill()};
  // 벽: 창 위로 치솟은 그을음 자국
  for(const[A,B,n]of[[FA,FB,Math.max(2,Math.round(b.w*.8))],[FB,SB,Math.max(1,Math.round(b.h*.6))]])for(let i=0;i<n;i++){const t=(i+.3+.4*hash(sd+i,n*7))/n,q0=lerp2(A,B,t),hh=WH*(.5+.45*hash(sd,i+20)),r=7+6*hash(sd+i,3)+st*2;
    const top=up(q0,WH+4),bot=up(q0,15),gr=ctx.createLinearGradient(bot[0],bot[1],top[0],top[1]-hh*.3);gr.addColorStop(0,`rgba(16,11,8,${.5+st*.08})`);gr.addColorStop(1,'rgba(16,11,8,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(bot[0]-r*.6,bot[1]);ctx.quadraticCurveTo(bot[0]-r*1.1,bot[1]-hh*.6,top[0]-r*.2,top[1]-hh*.2);ctx.lineTo(top[0]+r*.5,top[1]-hh*.15);ctx.quadraticCurveTo(bot[0]+r*1.1,bot[1]-hh*.5,bot[0]+r*.6,bot[1]);ctx.fill()}
  ctx.strokeStyle='#1a1512';ctx.lineWidth=1.2;for(const t of[.3,.7]){const q=up(lerp2(FA,FB,t),WH);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+2,q[1]+WH*.3);ctx.lineTo(q[0]-2,q[1]+WH*.55);ctx.stroke()}
  // 지붕: 처마에서 번진 그을음(1), 타서 검게 내려앉은 기와(2~)
  const RP=(u,v)=>lerp2(lerp2(El,Eb,u),lerp2(R1,R2,u),v),rw=Math.hypot(Eb[0]-El[0],Eb[1]-El[1]);
  for(let i=0;i<(st>=2?4+st*2:2);i++){const c=RP(.1+.8*hash(sd+i,41),st>=2?.1+.75*hash(sd+i,43):.05+.2*hash(sd+i,43)),r=rw*(.08+.07*hash(sd+i,47))*(st>=2?1:.8);blot(c[0],c[1],r*1.5,r*.8,st>=2?.6:.35)}
  if(st>=2){ctx.fillStyle='rgba(150,140,128,.35)';for(let i=0;i<10;i++){const c=RP(hash(sd+i,51),hash(sd+i,53)*.9);ctx.fillRect(c[0],c[1],2,1.2)}}   // 재
  if(st>=4){// 꺼진 지붕: 들쭉날쭉한 구멍 사이로 탄 서까래, 아래 끝은 불씨
    const u0=.3+.25*hash(sd,61),uw=.22+.12*hash(sd,62),pts=[];for(let i=0;i<=8;i++){const a=i/8*Math.PI*2,rr=.85+.3*hash(sd+i,63);pts.push(RP(u0+uw*.5+Math.cos(a)*uw*.5*rr,.5+Math.sin(a)*.32*rr))}
    quad(pts,'rgba(10,7,6,.95)','#1a1512');ctx.strokeStyle='#4a2c18';ctx.lineWidth=2;for(let k=0;k<4;k++){const a=RP(u0+uw*(.15+k*.23),.2),c=RP(u0+uw*(.05+k*.25),.8);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.stroke()}
    const e=RP(u0+uw*.5,.78),eg=ctx.createRadialGradient(e[0],e[1],0,e[0],e[1],uw*rw*.5);eg.addColorStop(0,'rgba(255,110,30,.55)');eg.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=eg;ctx.beginPath();ctx.ellipse(e[0],e[1],uw*rw*.5,uw*rw*.25,0,0,7);ctx.fill();
    const m=lerp2(R1,R2,.5);ctx.strokeStyle='#15110f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(m[0]-4,m[1]+2);ctx.lineTo(m[0]+5,m[1]+8);ctx.stroke();
    for(const[t,sz]of[[.15,4.5],[.45,3],[.8,4]]){const q=lerp2(scr(x-.3,Y1+.45),scr(X1+.3,Y1+.45),t);ctx.fillStyle='#4e4840';ctx.beginPath();ctx.ellipse(q[0],q[1],sz*1.6,sz,0,0,7);ctx.fill();ctx.strokeStyle='#1a1512';ctx.lineWidth=1;ctx.stroke()}}}
function decRoofPt(b,g,bi,i){const S=g.S,u=.15+.7*hash(bi*3+i,11),v=.15+.7*hash(bi*3+i,23),w=b.w-2*S,h=b.h-2*S,gx=b.x+S+u*w,gy=b.y+S+v*h;
  const d=w>=h?1-Math.abs(gy-(b.y+b.h/2))/(h/2+.38):1-Math.abs(gx-(b.x+b.w/2))/(w/2+.38);return scr(gx,gy,g.H0+(g.RH-g.H0)*decCl(d,0,1)*.9)}
function decFlame(x,y,f,sd){ctx.globalCompositeOperation='source-over';const Z=DEC.fs||1;
  for(let k=0;k<3;k++){const ph=time*(7+k*1.7)+sd*3+k,h=Z*(13+12*f)*(1-k*.24)*(.8+.25*Math.sin(ph)),w=Z*(4+3.5*f)*(1-k*.27),sx=Z*Math.sin(ph*1.31)*2.8*f;
    if(k===1)ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=k===0?`rgba(210,55,14,${.6+.25*f})`:k===1?'rgba(255,145,30,.75)':'rgba(255,232,150,.85)';
    ctx.beginPath();ctx.moveTo(x-w,y);ctx.quadraticCurveTo(x-w*.9,y-h*.55,x+sx,y-h);ctx.quadraticCurveTo(x+w*.9,y-h*.55,x+w,y);ctx.quadraticCurveTo(x,y+w*.4,x-w,y);ctx.fill()}
  ctx.fillStyle='rgba(255,200,90,.9)';for(let i=0;i<3;i++){const q=(time*.9+hash(sd,i))%1;ctx.fillRect(x+Math.sin(sd+i*2+time*2)*7*Z*q,y-12*Z-q*44*Z*f,2,2)}
  ctx.globalCompositeOperation='source-over'}
function decSmoke(x,y,a,sd){for(let i=0;i<DEC.smoke;i++){const q=(time*.2+i/DEC.smoke+hash(sd,i)*.1)%1,px=x+q*q*60+Math.sin(time*.8+i+sd)*8*q,py=y-q*170,r=7+q*36;
  ctx.fillStyle=`rgba(34,30,28,${a*(1-q)*.62})`;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill()}}
function decDrawB(b,bi){GHB=gH(b.x+.5,b.y+.5);try{const g=decGeo(b),by=toScreen(b.x+b.w,b.y+b.h).y,tl=b._tilt||0,sh=p=>[p[0]+tl*(by-p[1]),p[1]],f=b._fire||0;
  const top=sh(scr(b.x+b.w/2,b.y+b.h/2,g.RH));decSmoke(top[0],top[1]-4,f>.02?.5+.5*f:.42,bi*7+3);
  if(b._dk>=4){const FA=scr(b.x,b.y+b.h),FB=scr(b.x+b.w,b.y+b.h);for(let i=0;i<2;i++){const q=sh(up(lerp2(FA,FB,.25+.5*i),24));decFlame(q[0],q[1],.55*f,bi*11+i)}}   // 4단계: 창으로도 불길
  if(f>.02){const n=Math.round(DEC.flames[0]+(DEC.flames[1]-DEC.flames[0])*Math.min(1,b.w*b.h/12)),m=Math.max(1,Math.ceil(n*f));
    for(let i=0;i<m;i++){const p=sh(decRoofPt(b,g,bi,i));decFlame(p[0],p[1],f*(.7+.3*hash(bi,i+40)),bi*7+i)}}}finally{GHB=null}}
function decDrawP(){for(const p of DEC_P){const s=toScreen(p.x,p.y),y=s.y-p.z,k=p.life/p.max;
  if(p.k==='dust'){const r=(6+(1-k)*22)*p.r;ctx.fillStyle=`rgba(112,102,90,${.5*k})`;ctx.beginPath();ctx.arc(s.x,y,r,0,7);ctx.fill()}
  else if(p.k==='chip'){ctx.save();ctx.translate(s.x,y);ctx.rotate(p.a);ctx.globalAlpha=Math.min(1,k*3);ctx.fillStyle='#2a2420';ctx.fillRect(-2.5,-1.5,5,3);ctx.restore()}
  else{ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,${150+Math.round(80*k)},60,${k})`;ctx.fillRect(s.x-1,y-1,2.2,2.2);ctx.globalCompositeOperation='source-over'}}}
hook('drawList',list=>{if(!P||!builds)return;
  if(!REGION().dead)builds.forEach((b,bi)=>{if(!(b._dk>=1)&&!(b._fire>.02))return;const l=scr(b.x,b.y+b.h)[0]-60,r=scr(b.x+b.w,b.y)[0]+60,bt=scr(b.x+b.w,b.y+b.h)[1];if(r<0||l>W||bt<-40||bt-700>H)return;
    list.push({L:LY.ENT,d:b.x+b.w-1+b.y+b.h-1+1.01,f:()=>decDrawB(b,bi)})});
  if(DEC_P.length)list.push({L:LY.FX,d:9998,f:decDrawP})});
// 맵 전체: 매캐한 연무와 날리는 재·불티 (전각 안도). 밤에는 불타는 전각이 둘레를 밝힌다
hook('afterDark',()=>{const sv=DEC_SEV;if(!P||!(sv>0)||REGION().dead)return;const[r,g,b,a]=DEC.haze;ctx.fillStyle=`rgba(${r},${g},${b},${a*sv})`;ctx.fillRect(0,0,W,H);
  const n=Math.round(DEC.ash*sv);for(let i=0;i<n;i++){const sp=18+hash(i,5)*34,x=((hash(i,3)*W+Math.sin(time*.7+i)*24+time*10)%W+W)%W,y=H-((time*sp+hash(i,7)*(H+30))%(H+30));
    if(i%3){const fl=.5+.5*Math.sin(time*6+i);ctx.fillStyle=`rgba(255,${120+Math.round(70*fl)},40,${.35+.45*fl})`;ctx.fillRect(x,y,1.8,1.8)}else{ctx.fillStyle='rgba(70,64,60,.55)';ctx.fillRect(x,y,2.6,1.6)}}});
hook('darkLights',()=>{if(!builds||REGION().dead)return;for(const b of builds)if(b._fire>.1){GHB=gH(b.x+.5,b.y+.5);try{const g=decGeo(b),q=scr(b.x+b.w/2,b.y+b.h/2,(g.H0+g.RH)/2);lightAt(q[0],q[1],90+70*b._fire*Math.min(1.6,b.w/3),.75*b._fire)}finally{GHB=null}}});

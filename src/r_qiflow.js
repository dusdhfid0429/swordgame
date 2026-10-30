// ================= v208 경지별 기운의 길 (사용자 2026-10-30: 내공 수련·운기 연출을 경지마다 다르게, 소주천·대주천처럼 경지의 특징이 떠오르게) =================
// 앉은 몸(act meditate 장) 위에 경맥을 그리고, 진기가 그 길을 돈다. 색은 지금처럼 문파·심법 색(pFxPair), 모양만 경지를 따른다.
//  삼류 단전 축기(독맥을 오르다 막힘) → 이류 소주천(임독 한 바퀴) → 일류 대주천(사지·대맥) → 절정 임독양맥 타통(두 맥이 빛줄기, 정수리 빛)
//  → 초절정 삼단전 관통(충맥·강기 막) → 화경 환골탈태(온몸 경맥·탁기 배출·오기) → 현경 삼화취정(세 꽃·원광, 기운은 고요)
//  → 생사경 생사현관(음양 반, 흰 기운 오르고 검은 기운 내림) → 자연경 천인합일(하늘 빛이 정수리로 들어 땅으로 흐름)
// 내공 수련(g_train.js drawNgFx)은 진하게, 운기조식(g_draw.js drawMedit)은 옅게 같은 길을 그린다. 이름·설명은 data/qiflow.json QI_FLOW
const QI_FLOW=GD.QI_FLOW||[],QF_MED=GD.QF_MED||{n:[],r:[]};
const qfRealm=()=>P?Math.max(0,Math.min(8,realmIdx()|0)):0;
const QF={imp:[],leaf:[],lt:0};
// 몸 모형: 발 가운데(p)에서 잰 자리. x는 바라보는 쪽(side)이 +, 등은 −. 어린 주인공은 heroAgeK만큼 작다
function qfBody(p,side){const k=typeof heroAgeK==='function'?heroAgeK():1,at=(x,y)=>[p.x+x*side*k,p.y+y*k],path=a=>{const pts=a.map(q=>at(q[0],q[1])),L=[0];
    for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return{pts,L}};
  const DU=[[0,-8],[-6,-11],[-9,-18],[-9.5,-26],[-8,-34],[-5,-42],[0,-48]],REN=[[0,-48],[5.5,-42],[8,-34],[8.5,-26],[8,-18],[5.5,-11],[0,-8]];
  const B={k,H:at(0,-8),D:at(0,-16),M:at(0,-25),U:at(.5,-33),T:at(0,-48),
    du:path(DU),       // 독맥: 회음에서 등줄기로 올라 정수리 위(백회)까지. 작은 몸에서도 보이게 몸 둘레보다 조금 크게 그린다
    ren:path(REN),     // 임맥: 백회에서 얼굴·가슴·배 앞으로 회음까지
    loop:path(DU.concat(REN.slice(1))),
    chong:path([[0,-8],[0,-16],[0,-25],[.5,-33],[0,-48]]),   // 충맥: 세 단전을 꿰는 가운데 줄기
    limbs:[]};
  for(const s of[-1,1]){B.limbs.push(path([[s*1.5,-27],[s*6.5,-27],[s*10,-20],[s*11.5,-13]]));   // 팔: 가슴에서 어깨·팔꿈치·손끝
    B.limbs.push(path([[s*1.5,-10],[s*5,-9],[s*14,-6],[s*7,-3]]))}                                    // 다리: 아랫배에서 무릎·발끝 (가부좌)
  return B}
function qfAt(o,u){const L=o.L,n=L.length,d=Math.max(0,Math.min(1,u))*L[n-1];let i=1;while(i<n-1&&L[i]<d)i++;const a=o.pts[i-1],b=o.pts[i],f=(d-L[i-1])/((L[i]-L[i-1])||1);return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}
const qfWrap=u=>u-Math.floor(u);
// 경맥 한 줄: 넓은 번짐 + 밝은 심
function qfLine(o,col,core,a,w=1){if(a<=.01)return;ctx.lineCap='round';ctx.lineJoin='round';
  for(const[lw,c,al]of[[6*w,col,.26],[2.4*w,col,.8],[1*w,core,.9]]){ctx.strokeStyle=`rgba(${c},${al*Math.min(1,a)})`;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(o.pts[0][0],o.pts[0][1]);for(let i=1;i<o.pts.length;i++)ctx.lineTo(o.pts[i][0],o.pts[i][1]);ctx.stroke()}}
// 진기 한 점과 꼬리. wrap이면 고리(돌아 제자리), 아니면 0~1에서 멈춘다
function qfMote(o,u,col,core,a,r=5,n=8,du=.022,wrap=true){if(a<=.01)return;for(let j=n;j>=0;j--){const uu=u-j*du;if(!wrap&&(uu<0||uu>1))continue;const q=qfAt(o,wrap?qfWrap(uu):uu);glowDot(q[0],q[1],r*(1-j/n*.65),j?col:core,a*(1-j/n))}}
// 팔다리: 나갔다 돌아오는 진기 (u 0→1→0)
const qfOut=u=>{u=qfWrap(u);return u<.5?u*2:2-u*2};
function qfNode(q,r,col,core,a){glowDot(q[0],q[1],r*1.8,col,a*.55);glowDot(q[0],q[1],r*.7,core,a*.8)}
// front: 앞 그리기(몸 위) / 뒤 그리기(몸 뒤). k: 세기(내공 수련 1, 운기조식 ~.5). 몸 뒤로 도는 독맥은 뒤에서 흐리게, 앞의 임맥·팔다리는 앞에서
function qfDraw(front,k,side,str=1){
  if(!P||k<=0)return;const r=qfRealm(),col=pFxPair(),c0=col[0],c1=col[1],dk=isDark(c0),core=dk?HI_DARK:'255,252,235',add=dk?'source-over':'lighter';
  const p=toScreen(P.x,P.y),B=qfBody(p,side),a=k*str,t=time,PI2=Math.PI*2,bk=!front;
  ctx.save();ctx.globalCompositeOperation=add;
  // 몸 뒤 독맥도 몸에 가려지지 않게 앞 그리기에서 비쳐 보이듯 그린다 (등 쪽은 옅게)
  const ratio=B.du.L[B.du.L.length-1]/B.loop.L[B.loop.L.length-1];
  const loop=(sp,n=1,lit=0,rr=4)=>{if(bk)return;if(lit){qfLine(B.du,c0,core,lit*a*.55);qfLine(B.ren,c0,core,lit*a)}
    for(let i=0;i<n;i++){const u=qfWrap(t*sp+i/n);qfMote(B.loop,u,i%2?c1:c0,core,a*(u<ratio?.75:1),rr,12,.016)}};
  const limbs=(sp,lit=0,rr=3.2)=>{if(bk)return;B.limbs.forEach((o,i)=>{if(lit)qfLine(o,c1,c1,lit*a*(i%2?.6:1),.8);const u=qfOut(t*sp+i*.17);qfMote(o,u,c1,core,a*.9,rr,6,.03,false)})};
  if(r===0){// 단전 축기: 독맥을 반쯤 오르다 흩어진다
    if(front){const u=qfWrap(t*.7),h=.45*(1-(1-u)*(1-u));qfLine(B.du,c0,core,.12*a);qfMote(B.du,h,c0,core,a*(1-u)*.9,4.2,8,.025,false);qfNode(B.D,4+1.2*Math.sin(t*4),c0,core,a*.7)}}
  else if(r===1){// 소주천: 독맥으로 올라 임맥으로 내려오는 한 줄기
    loop(.75,1,.45,6);if(front)qfNode(B.D,3.5,c0,core,a*.5)}
  else if(r===2){// 대주천: 소주천 + 사지 + 허리의 대맥
    loop(.9,1,.5,6);limbs(.7,.35);
    const[dx,dy]=B.D,rx=9*B.k,ry=3.4*B.k;ctx.strokeStyle=`rgba(${c1},${.35*a})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(dx,dy,rx,ry,0,bk?Math.PI:0,bk?PI2:Math.PI);ctx.stroke();
    const g=t*2.2,inF=Math.sin(g)>0;if(inF===front)glowDot(dx+Math.cos(g)*rx,dy+Math.sin(g)*ry,3.2,c1,a*.9);
    if(front)qfNode(B.D,3.8,c0,core,a*.55)}
  else if(r===3){// 임독양맥 타통: 두 맥이 빛줄기로 이어지고, 두 점이 빠르게 돌며 한 바퀴마다 정수리로 빛이 솟는다
    loop(1.15,2,.85,5.8);limbs(.9,.4);
    if(front){qfNode(B.M,4.5+Math.sin(t*5),c0,core,a*.8);qfNode(B.D,4,c0,core,a*.6);
      const u=qfWrap(t*1.15*2),pulse=Math.max(0,1-Math.abs(u-.5)*5),[tx,ty]=B.T;if(pulse>0){const g=ctx.createLinearGradient(0,ty-26,0,ty);g.addColorStop(0,`rgba(${c0},0)`);g.addColorStop(1,`rgba(${c0},${.7*a*pulse})`);
        ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(tx-1,ty-26);ctx.lineTo(tx-3.5,ty);ctx.lineTo(tx+3.5,ty);ctx.lineTo(tx+1,ty-26);ctx.fill()}}}
  else if(r===4){// 삼단전 관통: 충맥이 세 단전을 꿰고, 넘친 기운이 강기의 막으로 몸을 감싼다
    loop(1.2,2,.6,5.5);limbs(1,.4);
    const cx=B.M[0],cy=p.y-19*B.k,ex=19*B.k,ey=23*B.k;
    if(bk){ctx.fillStyle=`rgba(${c0},${.07*a})`;ctx.beginPath();ctx.ellipse(cx,cy,ex,ey,0,0,PI2);ctx.fill()}
    else{qfLine(B.chong,c0,core,.9*a,1.1);qfMote(B.chong,qfWrap(t*.8),core,core,a,3.6,6,.04);
      for(const q of[B.D,B.M,B.U])qfNode(q,4.2+.8*Math.sin(t*4+q[1]),c0,core,a*.85);
      for(let j=0;j<3;j++){const g=t*1.3+j*PI2/3,xr=Math.abs(Math.cos(g))*ex;ctx.strokeStyle=`rgba(${c0},${(.12+.22*Math.abs(Math.sin(g)))*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,xr,ey,0,0,PI2);ctx.stroke()}
      ctx.strokeStyle=`rgba(${c0},${.4*a})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(cx,cy,ex,ey,0,0,PI2);ctx.stroke()}}
  else if(r===5){// 환골탈태: 온몸 경맥이 드러나고, 탁기가 살갗 밖으로 밀려 나오며, 오행의 기운이 단전을 돈다
    loop(1.1,2,.75,5.2);limbs(.85,.55);
    if(front){qfLine(B.chong,c0,core,.6*a);const g=ctx.createRadialGradient(B.M[0],B.M[1]+4,0,B.M[0],B.M[1]+4,22*B.k);g.addColorStop(0,`rgba(${core},${.18*a})`);g.addColorStop(1,`rgba(${core},0)`);ctx.fillStyle=g;ctx.fillRect(B.M[0]-24,B.M[1]-20,48,48);
      WUHAENG.forEach((cc,j)=>{const g=t*2+j*PI2/5;glowDot(B.D[0]+Math.cos(g)*8*B.k,B.D[1]+Math.sin(g)*3.5*B.k,3,cc,a*.9)});
      // 탁기: 몸 둘레에서 검은 김이 피어 바깥으로 흩어진다 (어두운 색이라 보통 합성)
      const dt=Math.min(.05,Math.max(0,t-QF.lt));QF.lt=t;if(QF.imp.length<14&&Math.random()<dt*14*str){const lm=B.limbs[Math.random()*4|0],q=qfAt(lm,Math.random());QF.imp.push({x:q[0]-p.x,y:q[1]-p.y,vx:(q[0]-B.M[0])*.06+(Math.random()-.5)*.4,vy:-.5-Math.random()*.5,l:0})}
      ctx.globalCompositeOperation='source-over';for(const q of QF.imp){q.l+=dt;q.x+=q.vx*dt*30;q.y+=q.vy*dt*30;const al=Math.sin(Math.min(1,q.l/1.1)*Math.PI)*.55*a;ctx.fillStyle=`rgba(38,32,28,${al})`;ctx.beginPath();ctx.arc(p.x+q.x,p.y+q.y,1.6+q.l*2.4,0,PI2);ctx.fill()}
      QF.imp=QF.imp.filter(q=>q.l<1.1);ctx.globalCompositeOperation=add}}
  else if(r===6){// 삼화취정: 세 단전에 꽃, 머리 뒤 원광. 기운은 느리고 고요하다 (반박귀진)
    loop(.45,1,.35,4.5);
    const[hx,hy]=[B.U[0]-side*1.5*B.k,B.U[1]-1*B.k];
    if(bk){ctx.strokeStyle=`rgba(${c0},${.6*a})`;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(hx,hy,12*B.k,0,PI2);ctx.stroke();glowDot(hx,hy,15*B.k,c0,.35*a);
      for(let j=0;j<12;j++){const g=j*PI2/12+t*.25,L0=13*B.k,L1=(j%2?16:19)*B.k;ctx.strokeStyle=`rgba(${c0},${.45*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx+Math.cos(g)*L0,hy+Math.sin(g)*L0);ctx.lineTo(hx+Math.cos(g)*L1,hy+Math.sin(g)*L1);ctx.stroke()}}
    else[['255,170,190',B.D],['255,225,150',B.M],['200,220,255',B.U]].forEach(([cc,q],j)=>{const s=(5.5+.8*Math.sin(t*2+j))*B.k;brkLotus(q[0],q[1]+1,s,dk?c0:cc,a*.8,t*.5+j)})}
  else if(r===7){// 생사현관: 발밑에 음양, 흰 기운은 독맥으로 오르고 검은 기운은 임맥으로 내린다
    if(bk){const R=20*B.k,Ry=R*.45;ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,Ry/R);ctx.rotate(t*.9);
      const half=()=>{ctx.beginPath();ctx.arc(0,0,R,-Math.PI/2,Math.PI/2);ctx.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2);ctx.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2,true);ctx.fill()};
      ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(8,6,18,${.5*a})`;ctx.rotate(Math.PI);half();ctx.rotate(Math.PI);
      ctx.globalCompositeOperation=add;ctx.fillStyle=`rgba(${c0},${.35*a})`;half();ctx.strokeStyle=`rgba(${c0},${.55*a})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,R,0,PI2);ctx.stroke();ctx.restore();
      }
    else{qfLine(B.du,c0,core,.45*a);qfMote(B.du,qfWrap(t*.8),core,core,a,5,10,.03);qfLine(B.ren,c0,core,.35*a);ctx.globalCompositeOperation='source-over';
      for(let j=8;j>=0;j--){const q=qfAt(B.ren,qfWrap(t*.8+.5-j*.03));ctx.fillStyle=`rgba(14,8,26,${.75*a*(1-j/9)})`;ctx.beginPath();ctx.arc(q[0],q[1],3.4*(1-j/9*.6),0,PI2);ctx.fill()}
      ctx.globalCompositeOperation=add;qfNode(B.D,3.5,c0,core,a*.5)}}
  else{// 천인합일: 하늘 빛이 정수리로 들어와 몸을 지나 땅으로 흐르고 물결로 번진다. 경맥은 거의 보이지 않는다
    const[tx,ty]=B.T;
    if(bk){for(let j=0;j<3;j++){const kk=qfWrap(t*.45+j/3),[rx,ry]=isoR(.4+kk*2.4);ctx.strokeStyle=`rgba(${c0},${(1-kk)*.5*a})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,PI2);ctx.stroke()}}
    else{const top=ty-150,g=ctx.createLinearGradient(0,top,0,ty);g.addColorStop(0,`rgba(${c0},0)`);g.addColorStop(1,`rgba(${c0},${.38*a})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(tx-3,top);ctx.lineTo(tx-7,ty);ctx.lineTo(tx+7,ty);ctx.lineTo(tx+3,top);ctx.fill();
      for(let i=0;i<3;i++){const u=qfWrap(t*.6+i/3);const y=u<.5?top+(ty-top)*u*2:0;if(u<.5)glowDot(tx,y,3.5,core,a*.8);else qfMote(B.chong,1-(u-.5)*2,c0,core,a*.6,3.2,5,.04,false)}
      qfLine(B.ren,c0,core,.15*a);
      const dt=Math.min(.05,Math.max(0,t-QF.lt));QF.lt=t;if(QF.leaf.length<10&&Math.random()<dt*8*str)QF.leaf.push({a:Math.random()*PI2,d:.4+Math.random()*.8,l:0,s:Math.random()});
      for(const q of QF.leaf){q.l+=dt*.5;const[rx,ry]=isoR(1.6*q.d),x=p.x+Math.cos(q.a+q.l)*rx,y=p.y+Math.sin(q.a+q.l)*ry-q.l*40,al=Math.sin(Math.min(1,q.l)*Math.PI)*a,cc=q.s<.33?'255,225,150':q.s<.66?c0:'200,240,175';
        glowDot(x,y,4,cc,al*.5);ctx.fillStyle=`rgba(${cc},${al})`;ctx.beginPath();ctx.ellipse(x,y,2.6,1.1,t*2+q.s*6,0,PI2);ctx.fill()}
      QF.leaf=QF.leaf.filter(q=>q.l<1)}}
  ctx.restore()}
// 운기조식 둘레 장식: 발밑 고리 수·몸빛이 경지를 따른다 (drawMedit 뒤 그리기에서). 알갱이 수·반경은 QF_MED
const qfMedN=()=>QF_MED.n[qfRealm()]||1,qfMedR=()=>QF_MED.r[qfRealm()]||1;
// 내공 수련을 시작할 때 머리 위에 지금 경지의 운기 경로 이름을 띄운다 (같은 경지면 20초에 한 번)
function qfName(){const d=QI_FLOW[qfRealm()];return d?d.n:''}
function qfShowName(){const r=qfRealm(),n=qfName();if(!n||!P||(QF.nr===r&&time-(QF.nt||-99)<20))return;QF.nr=r;QF.nt=time;addText(P.x,P.y-1.4,n,'#e8f0ff')}

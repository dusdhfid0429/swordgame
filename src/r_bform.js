// ================= v248 건물 형태 (사용자 2026-11-11 "개방은 거지고 녹림은 산적인데 기존 다른 문파의 전각 형태야") =================
// 건물 b.form 이 있으면 상자+우진각 대신 그 형태로 그린다 (r_build.js drawBuildVec 첫 줄). 형태는 여러 갈래가 같이 쓴다.
//   hut 거적 움막 · shack 판자 오두막 · log 통나무집 · loghall 통나무 홀(취의청) · tentB 큰 천막 · watch 망루 · cave 동굴 입구 · ruin 무너진 사당(drawBuildVec 안)
// 맵 소품 PROP (objs 칸, 막힘): pal 목책 · mudw 무너진 흙담 · fire 모닥불 · pot 솥 걸린 화톳불 · junk 잡동사니 더미 · logs 장작더미 · hide 가죽 걸이 · rag 넝마 깃발 · cage 나무 우리 · torch 횃불
const bfL=(a,b)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()};
const bfR=b=>rng(b.x*73+b.y*19+(b.w*7+b.h)*3+7);
function bfShadow(b,k=.3){const{x,y,w,h}=b,X1=x+w,Y1=y+h;quad([scr(x+k,Y1+k),scr(X1+k,Y1+k),scr(X1+k,y+k),scr(X1,y),scr(X1,Y1),scr(x,Y1)],'rgba(0,0,0,.24)',null)}
// 벽: 세로 판자 (윗선은 지붕이 덮는다)
function bfPlanks(A,B,h0,h1,cols,r,n){for(let i=0;i<n;i++){const P0=lerp2(A,B,i/n),P1=lerp2(A,B,(i+1)/n);quad([up(P0,h0),up(P1,h0),up(P1,h1),up(P0,h1)],cols[Math.floor(r()*cols.length)],'rgba(24,14,8,.6)')}
  ctx.strokeStyle='rgba(30,18,10,.55)';ctx.lineWidth=1.2;bfL(up(A,h0+4),up(B,h0+4));bfL(up(A,h1-5),up(B,h1-5))}
// 벽: 가로 통나무
function bfLogs(A,B,h0,h1,base,r){const n=Math.max(3,Math.round((h1-h0)/6)),lh=(h1-h0)/n;quad([up(A,h0),up(B,h0),up(B,h1),up(A,h1)],base,OUT);
  for(let i=0;i<n;i++){const a=h0+i*lh;ctx.strokeStyle='rgba(18,10,4,.7)';ctx.lineWidth=1.3;bfL(up(A,a),up(B,a));ctx.strokeStyle='rgba(255,224,170,.18)';ctx.lineWidth=1.6;bfL(up(A,a+lh*.72),up(B,a+lh*.72))
    ctx.strokeStyle='rgba(18,10,4,.3)';ctx.lineWidth=1;const t=.15+r()*.7;const q=lerp2(A,B,t);bfL(up(q,a+lh*.3),up(lerp2(A,B,t+.06),a+lh*.35))}}
function bfLogEnds(P,h0,h1,dx=0){const n=Math.max(3,Math.round((h1-h0)/6)),lh=(h1-h0)/n;for(let i=0;i<n;i++){const q=up(P,h0+(i+.5)*lh);
  ctx.fillStyle='#b48c5a';ctx.beginPath();ctx.ellipse(q[0]+dx,q[1],lh*.5,lh*.55,0,0,7);ctx.fill();ctx.strokeStyle='#3a2412';ctx.lineWidth=1;ctx.stroke();
  ctx.strokeStyle='rgba(90,56,26,.7)';ctx.beginPath();ctx.ellipse(q[0]+dx,q[1],lh*.22,lh*.25,0,0,7);ctx.stroke()}}
// 문 구멍: 면 A→B 의 t 자리, 너비 wt(면 비율)
function bfDoor(A,B,t,wt,hh,fill,frame){const D0=lerp2(A,B,t-wt/2),D1=lerp2(A,B,t+wt/2);quad([D0,D1,up(D1,hh),up(D0,hh)],fill,frame||OUT);return[D0,D1]}
// 지붕 한 면: 처마 e0→e1, 용마루 r0→r1 (rm: 가운데가 처진 용마루)
function bfSlope(e0,e1,r0,r1,fill,tex,r,rm){const R=t=>rm?(t<.5?lerp2(r0,rm,t*2):lerp2(rm,r1,(t-.5)*2)):lerp2(r0,r1,t);
  quad(rm?[e0,e1,r1,rm,r0]:[e0,e1,r1,r0],fill);const len=Math.hypot(e1[0]-e0[0],e1[1]-e0[1]);
  if(tex==='thatch'){const n=Math.round(len/2.2);ctx.lineWidth=1;for(let k=0;k<=n;k++){const t=k/n,a=lerp2(e0,e1,t),b=R(t);ctx.strokeStyle=r()<.5?'rgba(60,44,18,.45)':'rgba(220,196,130,.28)';bfL(a,lerp2(a,b,.55+r()*.45))}
    ctx.strokeStyle='rgba(40,28,10,.6)';ctx.lineWidth=1.6;for(const s of[.38,.72]){const n2=12;ctx.beginPath();for(let k=0;k<=n2;k++){const t=k/n2,p=lerp2(lerp2(e0,e1,t),R(t),s);k?ctx.lineTo(p[0],p[1]+Math.sin(k*1.7)*.8):ctx.moveTo(p[0],p[1])}ctx.stroke()}
    ctx.fillStyle='rgba(70,52,22,.9)';const m=Math.round(len/5);for(let k=0;k<m;k++){const a=lerp2(e0,e1,k/m),b=lerp2(e0,e1,(k+1)/m),d=2+r()*4;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo((a[0]+b[0])/2+(r()-.5)*2,(a[1]+b[1])/2+d);ctx.fill()}}
  else if(tex==='plank'){const n=Math.max(3,Math.round(len/7));ctx.lineWidth=1.2;for(let k=1;k<n;k++){const t=k/n+(r()-.5)*.02;ctx.strokeStyle='rgba(20,14,8,.55)';bfL(lerp2(e0,e1,t),R(t))}
    ctx.strokeStyle='rgba(255,240,210,.1)';for(let k=1;k<n;k+=2){const t=(k+.5)/n;bfL(lerp2(e0,e1,t),R(t))}
    ctx.strokeStyle='rgba(20,14,8,.5)';ctx.lineWidth=1.5;for(const s of[.3,.75])bfL(lerp2(e0,r0,s),lerp2(e1,r1,s))}
  else if(tex==='shingle'){const rows=7;ctx.lineWidth=1;for(let i=1;i<rows;i++){const s=i/rows,a=lerp2(e0,r0,s),b=lerp2(e1,R(1),s);ctx.strokeStyle='rgba(14,10,6,.6)';bfL(a,b);
      const m=Math.round(len/6);ctx.strokeStyle='rgba(14,10,6,.35)';for(let k=(i%2)*.5;k<m;k++){const t=k/m,p=lerp2(a,b,t),q=lerp2(lerp2(e0,e1,t),R(t),s-1/rows);bfL(p,lerp2(p,q,.9))}}}
  else if(tex==='hide'){ctx.strokeStyle='rgba(50,32,14,.55)';ctx.lineWidth=1.2;for(const t of[.33,.66]){const a=lerp2(e0,e1,t),b=R(t+(r()-.5)*.05);ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo((a[0]+b[0])/2+3,(a[1]+b[1])/2,b[0],b[1]);ctx.stroke()}
    const t0=.1+r()*.6,s0=.2+r()*.4,pt=(t,s)=>lerp2(lerp2(e0,e1,t),R(t),s);quad([pt(t0,s0),pt(t0+.18,s0),pt(t0+.17,s0+.28),pt(t0+.01,s0+.26)],'rgba(120,88,52,.9)','rgba(50,32,14,.6)')}
  ctx.strokeStyle='rgba(20,14,8,.85)';ctx.lineWidth=2;bfL(e0,e1)}
// 맞배 지붕: 긴 쪽으로 용마루. 보이는 박공(끝 세모)을 벽 재질로 채운다. 돌려주는 점은 장식 자리
function bfGable(b,H0,RH,o,C,tex,r,sag=0,gtex){const{x,y,w,h}=b,X1=x+w,Y1=y+h;let out;
  if(w>=h){const cy=y+h/2,Et=scr(x-o,y-o,H0),Er=scr(X1+o,y-o,H0),El=scr(x-o,Y1+o,H0),Eb=scr(X1+o,Y1+o,H0),R1=scr(x-o,cy,RH),R2=scr(X1+o,cy,RH),Rm=sag?scr(x+w/2,cy,RH-sag):null;
    bfSlope(Er,Et,R2,R1,C.back,tex,r,Rm);const g0=scr(X1,Y1,H0-1),g1=scr(X1,y,H0-1),ga=scr(X1,cy,RH-3);quad([g0,g1,ga],C.gable);if(gtex)gtex(g0,g1,ga);
    bfSlope(El,Eb,R1,R2,C.front,tex,r,Rm);ctx.strokeStyle=C.edge||'#2a1c10';ctx.lineWidth=2.5;bfL(Eb,R2);bfL(R2,Er);
    out={R1,R2,apex:R2,El,Eb,Er,Et,gx:'x'}}
  else{const cx=x+w/2,Et=scr(x-o,y-o,H0),Er=scr(X1+o,y-o,H0),El=scr(x-o,Y1+o,H0),Eb=scr(X1+o,Y1+o,H0),R1=scr(cx,y-o,RH),R2=scr(cx,Y1+o,RH),Rm=sag?scr(cx,y+h/2,RH-sag):null;
    bfSlope(El,Et,R2,R1,C.back,tex,r,Rm);const g0=scr(x,Y1,H0-1),g1=scr(X1,Y1,H0-1),ga=scr(cx,Y1,RH-3);quad([g0,g1,ga],C.gable);if(gtex)gtex(g0,g1,ga);
    bfSlope(Eb,Er,R2,R1,C.front,tex,r,Rm);ctx.strokeStyle=C.edge||'#2a1c10';ctx.lineWidth=2.5;bfL(El,R2);bfL(R2,Eb);
    out={R1,R2,apex:R2,El,Eb,Er,Et,gx:'y'}}
  ctx.strokeStyle=C.ridge||'#2a1c10';ctx.lineWidth=3.5;if(out.R1&&!sag)bfL(out.R1,out.R2);else{const m=w>=h?scr(x+w/2,y+h/2,RH-sag):scr(x+w/2,y+h/2,RH-sag);bfL(out.R1,m);bfL(m,out.R2)}
  return out}
// 박공 판자 결 (세로줄)
const bfGPlank=col=>(g0,g1,ga)=>{ctx.strokeStyle=col;ctx.lineWidth=1;for(let k=1;k<6;k++){const p=lerp2(g0,g1,k/6);const top=k/6<.5?lerp2(g0,ga,k/3):lerp2(ga,g1,(k/6-.5)*2);bfL(p,[p[0],Math.max(top[1],ga[1])])}};
// 그을린 폐허(멸문) 맵에선 어둡게
function bfDim(){if(REGION().dead)ctx.filter='brightness(.5) saturate(.45)'}
// 집 몸통 하나: 벽 재질(wall) · 지붕 재질(tex) 고르기
function bfHouse(b,o){const{x,y,w,h}=b,X1=x+w,Y1=y+h,r=bfR(b),WH=b.wh||o.WH,RH=WH+o.rh0+o.rh1*Math.min(w,h),A=scr(x,Y1),B=scr(X1,Y1),Bk=scr(X1,y);
  bfShadow(b);if(o.base){quad([scr(x-.06,Y1+.06),scr(X1+.06,Y1+.06),scr(X1+.06,Y1+.06,o.base),scr(x-.06,Y1+.06,o.base)],'#77716a');quad([scr(X1+.06,Y1+.06),scr(X1+.06,y-.06),scr(X1+.06,y-.06,o.base),scr(X1+.06,Y1+.06,o.base)],'#625d56')}
  const h0=o.base||0;
  if(o.wall==='log'){bfLogs(A,B,h0,WH,o.wc[0],r);bfLogs(B,Bk,h0,WH,o.wc[1],r);bfLogEnds(A,h0,WH,-3);bfLogEnds(B,h0,WH,0);bfLogEnds(Bk,h0,WH,3)}
  else{bfPlanks(A,B,h0,WH,o.wc[0],r,Math.round(w*4));bfPlanks(B,Bk,h0,WH,o.wc[1],r,Math.round(h*4))}
  // 기운 기둥·덧댄 거적
  if(o.patch)for(let k=0;k<o.patch;k++){const t=.1+r()*.7,hh=h0+4+r()*(WH-14),F=r()<.6;const[P,Q]=F?[A,B]:[B,Bk],p0=lerp2(P,Q,t),p1=lerp2(P,Q,t+.12+r()*.1);quad([up(p0,hh),up(p1,hh),up(p1,hh+6+r()*5),up(p0,hh+5+r()*5)],['#7d6a4c','#5e4a36','#8a3a26','#6a6050'][Math.floor(r()*4)],'rgba(30,20,10,.6)')}
  // 문: 앞면 가운데 칸 (g_hall.js hallAdd 문 자리)
  const dt=(Math.floor(w/2)+.5)/w,dw=Math.min(.8,.62)/w;
  if(o.door==='rag'){const[D0,D1]=bfDoor(A,B,dt,dw,Math.min(WH-3,17),'#140c08');quad([up(D0,Math.min(WH-3,17)),up(lerp2(D0,D1,.55),Math.min(WH-3,17)),up(lerp2(D0,D1,.5),5),up(D0,7)],'#7a6a4c','rgba(30,20,10,.7)')}
  else if(o.door){const dh=Math.min(WH-4,o.door==='big'?26:20),[D0,D1]=bfDoor(A,B,dt,dw*(o.door==='big'?1.4:1),dh,'#3e2814','#1a0e06');ctx.strokeStyle='rgba(10,6,2,.7)';ctx.lineWidth=1;const m=lerp2(D0,D1,.5);bfL(m,up(m,dh));
    ctx.strokeStyle='#2a1a0c';ctx.lineWidth=3;bfL(up(lerp2(D0,D1,-.15),dh+2),up(lerp2(D0,D1,1.15),dh+2))}
  // 옆 창: 덧문
  if(o.win&&h>=2){const t=.5,P0=lerp2(B,Bk,t-.12),P1=lerp2(B,Bk,t+.12);quad([up(P0,WH*.45),up(P1,WH*.45),up(P1,WH*.75),up(P0,WH*.75)],darkLvl()>.25?'#e8a050':'#20160e','#2a1a0c')}
  const G=bfGable(b,WH,RH,o.o??.3,o.rc,o.tex,r,o.sag||0,o.gtex);return{G,WH,RH,A,B,Bk,r}}
const BF_HUT={WH:15,rh0:9,rh1:6,wall:'plank',wc:[['#6e5538','#634b31','#7a5f3e','#584329'],['#56412a','#4d3a25','#5f4830']],tex:'thatch',rc:{front:'#857244',back:'#73633a',gable:'#5d4a2e'},sag:5,patch:4,door:'rag',gtex:bfGPlank('rgba(30,20,10,.5)')};
const BF_SHACK={WH:20,rh0:7,rh1:5,wall:'plank',wc:[['#6a5a44','#5e5040','#76644a','#544736'],['#4e4334','#463c2e','#57493a']],tex:'plank',rc:{front:'#6f6450',back:'#5f5544',gable:'#544736'},sag:1,patch:2,door:'rag',o:.22,gtex:bfGPlank('rgba(30,20,10,.5)')};
const BF_LOG={WH:24,rh0:12,rh1:8,wall:'log',wc:['#7a5634','#634427'],tex:'shingle',rc:{front:'#54473a',back:'#463b30',gable:'#6a4a2c',ridge:'#21170e'},door:1,win:1,base:3,gtex:bfGPlank('rgba(30,18,8,.55)')};
const BF_LOGHALL={WH:32,rh0:16,rh1:9,wall:'log',wc:['#7e5a36','#664629'],tex:'shingle',rc:{front:'#4a3e32',back:'#3e342a',gable:'#6e4c2c',ridge:'#1c140c'},door:'big',win:1,base:6,o:.36,gtex:bfGPlank('rgba(30,18,8,.55)')};
// 큰 횃불·뿔 장식 (통나무 홀)
function bfTorch(p,lit=1){seg([p,up(p,26)],2.4,'#3a2414');const f=up(p,26);ctx.fillStyle='#2a1a0e';ctx.fillRect(f[0]-3,f[1]-3,6,4);if(!lit)return;
  const g=ctx.createRadialGradient(f[0],f[1]-6,1,f[0],f[1]-6,16);g.addColorStop(0,'rgba(255,200,90,.55)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f[0],f[1]-6,16,0,7);ctx.fill();
  ctx.fillStyle='#ff9a3a';ctx.beginPath();ctx.moveTo(f[0]-3.5,f[1]-3);ctx.quadraticCurveTo(f[0]-2,f[1]-12,f[0],f[1]-15);ctx.quadraticCurveTo(f[0]+2,f[1]-10,f[0]+3.5,f[1]-3);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.ellipse(f[0],f[1]-6,1.6,3.5,0,0,7);ctx.fill()}
function bfAntler(p){ctx.strokeStyle='#e8dcc0';ctx.lineWidth=2.2;ctx.lineCap='round';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(p[0]+s*2,p[1]);ctx.quadraticCurveTo(p[0]+s*12,p[1]-4,p[0]+s*16,p[1]-16);ctx.stroke();
    for(const t of[.45,.75]){const q=[p[0]+s*(2+12*t),p[1]-4-8*t];bfL(q,[q[0]+s*2,q[1]-7])}}
  ctx.fillStyle='#efe4cc';ctx.beginPath();ctx.ellipse(p[0],p[1]+3,4.5,5.5,0,0,7);ctx.fill();ctx.fillStyle='#1a120c';ctx.fillRect(p[0]-3,p[1]+1,2,2);ctx.fillRect(p[0]+1,p[1]+1,2,2);ctx.lineCap='butt'}
// 세로 깃발 (替天行道 같은 글)
function bfBanner(p,len,col,txt){quad([p,[p[0]+12,p[1]+1],[p[0]+12,p[1]+len],[p[0]+6,p[1]+len-5],[p[0],p[1]+len]],col,'rgba(20,8,4,.8)');if(!txt)return;
  ctx.fillStyle='#f0dca0';ctx.font='9px "Song Myung",serif';ctx.textAlign='center';const ch=[...txt],st=(len-8)/ch.length;ch.forEach((c,i)=>ctx.fillText(c,p[0]+6,p[1]+9+i*st))}
const BFORM={
  hut(b){const{G,r}=bfHouse(b,BF_HUT),pt=(t,s)=>lerp2(lerp2(G.El,G.Eb,t),lerp2(G.R1,G.R2,t),s);   // 덧댄 거적·구멍·기댄 장대
    for(let k=0;k<2;k++){const t=.12+r()*.6,s=.15+r()*.4,a=pt(t,s),b2=pt(t+.16,s),c=pt(t+.15,s+.32),d=pt(t-.01,s+.3);quad([a,b2,c,d],k?'#6e6250':'#7c6a48','rgba(30,20,10,.7)');
      ctx.strokeStyle='rgba(40,30,16,.45)';ctx.lineWidth=1;for(let q=1;q<4;q++){bfL(lerp2(a,b2,q/4),lerp2(d,c,q/4));bfL(lerp2(a,d,q/4),lerp2(b2,c,q/4))}}
    const hp=pt(.55+r()*.3,.45);ctx.fillStyle='#1a120a';ctx.beginPath();ctx.ellipse(hp[0],hp[1],4+r()*3,2.5,.3,0,7);ctx.fill();
    const q=scr(b.x+b.w+.15,b.y+b.h*.3);ctx.strokeStyle='#5a4630';ctx.lineWidth=2.5;bfL(q,[q[0]-10,q[1]-30])},
  shack(b){const{G,r}=bfHouse(b,BF_SHACK);// 지붕 누름돌
    for(let k=0;k<4;k++){const t=.15+k*.22,s=.3+r()*.4,p=lerp2(lerp2(G.El,G.Eb,t),lerp2(G.R1,G.R2,t),s);ctx.fillStyle='#8a857a';ctx.beginPath();ctx.ellipse(p[0],p[1],3.5,2.4,0,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke()}},
  log(b){bfHouse(b,BF_LOG)},
  loghall(b){const{G,WH,A,B}=bfHouse(b,BF_LOGHALL),{x,w}=b,dt=(Math.floor(w/2)+.5)/w;bfAntler(up(G.apex,-6));
    bfTorch(lerp2(A,B,dt-.9/w),1);bfTorch(lerp2(A,B,dt+.9/w),1);if(b.txt!==0)bfBanner(up(lerp2(A,B,.12),WH-2),34,'#8a1f14',b.txt||'替天行道')},
  tentB(b){const{x,y,w,h}=b,X1=x+w,Y1=y+h,r=bfR(b),H0=4,RH=18+9*Math.min(w,h),hide=b.hide!==0,C=hide?{front:'#9b7b55',back:'#86683f',gable:'#7a5e3c'}:{front:'#a89c80',back:'#8e8268',gable:'#7a705a'};
    bfShadow(b,.2);const A=scr(x,Y1),B=scr(X1,Y1),Bk=scr(X1,y);quad([A,B,up(B,H0),up(A,H0)],C.gable);quad([B,Bk,up(Bk,H0),up(B,H0)],C.back);
    const G=bfGable(b,H0,RH,.12,C,'hide',r,2,(g0,g1,ga)=>{const m=lerp2(g0,g1,.5);quad([lerp2(m,g0,.35),lerp2(m,g1,.35),lerp2(m,ga,.62)],'#20160c');ctx.strokeStyle='rgba(40,24,10,.6)';ctx.lineWidth=1;bfL(lerp2(m,ga,.62),lerp2(m,g1,.2))});
    // 장대 끝·끈
    ctx.strokeStyle='#3a2414';ctx.lineWidth=2.4;for(const R of[G.R1,G.R2]){bfL(R,[R[0]-4,R[1]-9]);bfL(R,[R[0]+4,R[1]-9])}
    ctx.strokeStyle='rgba(60,44,24,.7)';ctx.lineWidth=1;for(const t of[.2,.8]){const e=lerp2(G.El,G.Eb,t);bfL(e,[e[0]-2,e[1]+10])}},
  watch(b){const{x,y,w,h}=b,X1=x+w,Y1=y+h,r=bfR(b),PH=b.ph||46,i=.18,wood='#6a4a2c',dk='#4a3018',leg=(gx,gy,h1)=>{const p=scr(gx,gy);seg([p,up(p,h1)],4,wood);ctx.strokeStyle='rgba(255,220,170,.18)';ctx.lineWidth=1;bfL([p[0]-1,p[1]],[p[0]-1,p[1]-h1])};
    bfShadow(b,.25);const L=[[x+i,y+i],[x+i,Y1-i],[X1-i,y+i],[X1-i,Y1-i]],top=PH+30;
    leg(...L[0],top);
    // 버팀목 X (앞·옆)
    ctx.strokeStyle=dk;ctx.lineWidth=2;for(const[a,c]of[[L[1],L[3]],[L[3],L[2]]]){const p=scr(...a),q=scr(...c);bfL(p,up(q,PH-6));bfL(q,up(p,PH-6));bfL(up(p,PH*.5),up(q,PH*.5))}
    leg(...L[1],top);leg(...L[2],top);
    // 사다리 (앞면)
    const la=scr(x+w*.5-.2,Y1+.35),lb=scr(x+w*.5+.2,Y1+.35);ctx.strokeStyle='#7a5634';ctx.lineWidth=1.8;bfL(la,up(scr(x+w*.5-.2,Y1-i),PH));bfL(lb,up(scr(x+w*.5+.2,Y1-i),PH));
    for(let k=1;k<7;k++){const t=k/7;bfL(lerp2(la,up(scr(x+w*.5-.2,Y1-i),PH),t),lerp2(lb,up(scr(x+w*.5+.2,Y1-i),PH),t))}
    // 마루
    const o=.12,p0=scr(x-o,Y1+o,PH),p1=scr(X1+o,Y1+o,PH),p2=scr(X1+o,y-o,PH),p3=scr(x-o,y-o,PH);
    quad([up(p3,0),up(p2,0),up(p1,0),up(p0,0)],'#8a6a44');quad([p0,p1,up(p1,-5),up(p0,-5)].map(q=>q),'#5a3c22');quad([p1,p2,up(p2,-5),up(p1,-5)],'#4a3018');
    // 난간 (앞·옆 판자)
    bfPlanks(scr(x-o,Y1+o),scr(X1+o,Y1+o),PH,PH+12,['#7a5634','#6e4c2e','#835c38'],r,Math.round(w*5));bfPlanks(scr(X1+o,Y1+o),scr(X1+o,y-o),PH,PH+12,['#5e4026','#563a22'],r,Math.round(h*5));
    leg(...L[3],top);
    // 작은 지붕: 사모(네 면이 한 점으로)
    const ro=.3,q0=scr(x-ro,Y1+ro,top),q1=scr(X1+ro,Y1+ro,top),q2=scr(X1+ro,y-ro,top),q3=scr(x-ro,y-ro,top),pk=scr(x+w/2,y+h/2,top+16+4*Math.min(w,h));
    bfSlope(q3,q0,pk,pk,'#6f5c3a','thatch',r);bfSlope(q2,q3,pk,pk,'#6a5836','thatch',r);bfSlope(q0,q1,pk,pk,'#8d7a48','thatch',r);bfSlope(q1,q2,pk,pk,'#7a693e','thatch',r);
    if(b.flag!==0){seg([pk,up(pk,16)],1.6,'#3a2414');const f=up(pk,16),wv=Math.sin(time*2.4+b.x)*1.5;quad([f,[f[0]+13+wv,f[1]+2],[f[0]+12+wv,f[1]+9],[f[0],f[1]+8]],b.fc||'#8a1f14',null)}},
  cave(b){const{x,y,w,h}=b,X1=x+w,Y1=y+h,r=bfR(b),moss=b.moss!==0;bfShadow(b,.35);
    const rock=(p,rw,rh,c)=>{const n=9,pts=[];for(let k=0;k<n;k++){const a=Math.PI*2*k/n,j=.78+r()*.3;pts.push([p[0]+Math.cos(a)*rw*j,p[1]+Math.sin(a)*rh*j*(a>0&&a<Math.PI?.55:1)])}
      quad(pts,c);ctx.strokeStyle='rgba(255,255,240,.13)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p[0]-rw*.15,p[1]-rh*.35,rw*.5,rh*.3,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
      if(moss){ctx.fillStyle='rgba(80,110,50,.55)';for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(p[0]+(r()-.5)*rw,p[1]-rh*(.3+r()*.4),3+r()*4,1.6+r()*1.4,0,0,7);ctx.fill()}}};
    // 뒤에서 앞으로, 뒤쪽이 높은 바위 언덕
    for(let gy=y;gy<Y1;gy+=.7)for(let gx=x;gx<X1;gx+=.7){const back=1-(gy-y)/h,hh=18+back*38+(r()-.5)*10;rock(scr(gx+.35,gy+.35,hh),22+r()*10,20+r()*8,['#6c675d','#615c53','#77726a'][Math.floor(r()*3)])}
    // 앞면 바위 띠
    const A=scr(x,Y1),B=scr(X1,Y1);quad([lerp2(A,B,-.04),lerp2(B,A,-.04),up(lerp2(B,A,-.04),22),up(lerp2(A,B,-.04),26)],'#5a564e');
    for(let k=0;k<5;k++){const t=r();ctx.strokeStyle='rgba(20,18,14,.55)';ctx.lineWidth=1;const p=up(lerp2(A,B,t),4+r()*14);bfL(p,[p[0]+4,p[1]-8])}
    // 입구: 아치 + 버팀 나무틀
    const dt=(Math.floor(w/2)+.5)/w,D0=lerp2(A,B,dt-.42/w),D1=lerp2(A,B,dt+.42/w),m=lerp2(D0,D1,.5);
    ctx.fillStyle='#0c0a08';ctx.beginPath();ctx.moveTo(...D0);ctx.lineTo(D0[0],D0[1]-16);ctx.quadraticCurveTo(m[0],m[1]-34,D1[0],D1[1]-16);ctx.lineTo(...D1);ctx.closePath();ctx.fill();
    seg([D0,up(D0,22)],3.5,'#5a3c22');seg([D1,up(D1,22)],3.5,'#5a3c22');seg([up(lerp2(D0,D1,-.2),22),up(lerp2(D0,D1,1.2),22)],4,'#4a3018');
    if(b.torch!==0){bfTorch(lerp2(D0,D1,-.6),1);bfTorch(lerp2(D0,D1,1.6),1)}},
};
// 캐시 상자 높이 (r_build.js drawBuild)
function bformRH(b){const m=Math.min(b.w,b.h);switch(b.form){case'hut':return 18+10+7*m;case'shack':return 20+7+5*m;case'log':return 24+12+8*m+6;case'loghall':return 32+16+9*m+30;case'tentB':return 22+9*m;case'watch':return(b.ph||46)+50+4*m+20;case'cave':return 80}return 120}
// 무너진 사당(ruin)은 r_build.js 폐허 그림을 쓰고, 그 위에 거적 덧댐·기댄 판자를 얹는다
function bfRuinPatch(b,g){const{x,y,w,h}=b,X1=x+w,Y1=y+h,r=bfR(b),{R1,R2,Eb,El,H0,RH}=g;
  const p=[lerp2(R1,R2,.08),lerp2(R1,R2,.3),up(lerp2(Eb,El,.62),(RH-H0)*.35),up(lerp2(Eb,El,.85),(RH-H0)*.2)];quad(p,'#8a7646','rgba(40,28,10,.7)');
  ctx.lineWidth=1;for(let k=0;k<16;k++){const t=k/16,a=lerp2(p[3],p[2],t),c=lerp2(p[0],p[1],t);ctx.strokeStyle=r()<.5?'rgba(60,44,18,.5)':'rgba(220,196,130,.3)';bfL(a,lerp2(a,c,.6+r()*.4))}
  ctx.strokeStyle='#6a5236';ctx.lineWidth=3;for(let k=0;k<3;k++){const t=.15+k*.28+r()*.05,q=lerp2(scr(x,Y1+.15),scr(X1,Y1+.15),t);bfL(q,[q[0]+6+r()*4,q[1]-24-r()*8])}
  // 비뚤어진 편액
  const P0=lerp2(scr(x,Y1),scr(X1,Y1),.38),P1=lerp2(scr(x,Y1),scr(X1,Y1),.62);ctx.save();const m=up(lerp2(P0,P1,.5),H0-8);ctx.translate(m[0],m[1]);ctx.rotate(.12);ctx.translate(-m[0],-m[1]);
  quad([up(P0,H0-14),up(P1,H0-14),up(P1,H0-3),up(P0,H0-3)],'#2a1e14','#7a6440');ctx.restore()}
// ---------------- 맵 소품 ----------------
const PROP={pal:1,mudw:1,fire:1,pot:1,junk:1,logs:1,hide:1,rag:1,cage:1,torch:1};
function propLine(i,j,k){const L=objs[j][i-1]===k,R=objs[j][i+1]===k,U=objs[j-1]&&objs[j-1][i]===k,D=objs[j+1]&&objs[j+1][i]===k,segs=[];
  if(L||R)segs.push([[L?i:i+.5,j+.5],[R?i+1:i+.5,j+.5]]);if(U||D)segs.push([[i+.5,U?j:j+.5],[i+.5,D?j+1:j+.5]]);if(!segs.length)segs.push([[i+.15,j+.5],[i+.85,j+.5]]);return segs}
function drawProp(k,i,j){const r=rng(i*37+j*101+k.length),c=scr(i+.5,j+.5);
  switch(k){
  case'pal':{const st=[];for(const[a,b]of propLine(i,j,'pal')){const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/.24));for(let s=0;s<n;s++){const t=(s+.5)/n;st.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}
    st.sort((p,q)=>p[0]+p[1]-q[0]-q[1]);const segs=propLine(i,j,'pal');
    ctx.strokeStyle='#3e2a16';ctx.lineWidth=2.5;for(const[a,b]of segs)for(const hh of[10,24])bfL(scr(a[0],a[1],hh),scr(b[0],b[1],hh));
    for(const[gx,gy]of st){const p=scr(gx,gy),hh=32+r()*8,wd=3;poly([[p[0]-wd,p[1]],[p[0]+wd,p[1]],[p[0]+wd,p[1]-hh],[p[0],p[1]-hh-7],[p[0]-wd,p[1]-hh]],r()<.5?'#6e4e2e':'#7a5834');
      ctx.fillStyle='rgba(255,226,180,.16)';ctx.fillRect(p[0]-wd+1,p[1]-hh,1.4,hh-2);ctx.fillStyle='#b89a6a';ctx.beginPath();ctx.moveTo(p[0]-1.5,p[1]-hh-3);ctx.lineTo(p[0],p[1]-hh-7);ctx.lineTo(p[0]+1.5,p[1]-hh-3);ctx.fill()}
    ctx.strokeStyle='#4a3018';ctx.lineWidth=2;for(const[a,b]of segs)bfL(scr(a[0],a[1],18),scr(b[0],b[1],18));break}
  case'mudw':{for(const[a,b]of propLine(i,j,'mudw')){const n=4;for(let s=0;s<n;s++){const t0=s/n,t1=(s+1)/n,p0=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0],p1=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1],hh=r()<.2?4:10+r()*14,th=.18,
        dx=b[1]!==a[1]?th:0,dy=b[0]!==a[0]?th:0;
      quad([scr(p0[0]-dx,p0[1]+dy),scr(p1[0]-dx,p1[1]+dy),scr(p1[0]-dx,p1[1]+dy,hh),scr(p0[0]-dx,p0[1]+dy,hh)],'#8a7458','rgba(40,28,16,.7)');quad([scr(p1[0]-dx,p1[1]+dy),scr(p1[0]+dx,p1[1]-dy),scr(p1[0]+dx,p1[1]-dy,hh),scr(p1[0]-dx,p1[1]+dy,hh)],'#706048','rgba(40,28,16,.7)');
      quad([scr(p0[0]-dx,p0[1]+dy,hh),scr(p1[0]-dx,p1[1]+dy,hh),scr(p1[0]+dx,p1[1]-dy,hh),scr(p0[0]+dx,p0[1]-dy,hh)],'#a08c6c','rgba(40,28,16,.5)')}}
    for(let q=0;q<3;q++){const p=scr(i+r(),j+r());ctx.fillStyle='#7a6850';ctx.beginPath();ctx.ellipse(p[0],p[1],3+r()*3,2,0,0,7);ctx.fill()}break}
  case'fire':case'pot':{for(let q=0;q<7;q++){const a=q/7*Math.PI*2,p=[c[0]+Math.cos(a)*11,c[1]+Math.sin(a)*5.5];ctx.fillStyle=q%2?'#6a655c':'#7d786e';ctx.beginPath();ctx.ellipse(p[0],p[1],3.6,2.6,0,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=.8;ctx.stroke()}
    ctx.strokeStyle='#3a2414';ctx.lineWidth=3;bfL([c[0]-8,c[1]+2],[c[0]+7,c[1]-3]);bfL([c[0]-7,c[1]-3],[c[0]+8,c[1]+2]);
    const night=darkLvl()>.25,g=ctx.createRadialGradient(c[0],c[1]-6,2,c[0],c[1]-6,night?46:24);g.addColorStop(0,`rgba(255,170,70,${night?.42:.25})`);g.addColorStop(1,'rgba(255,110,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c[0],c[1]-6,night?46:24,0,7);ctx.fill();
    for(let q=0;q<3;q++){const ph=time*6+q*2.1,hh=12+Math.sin(ph)*3+q*2,ox=(q-1)*3.5;ctx.fillStyle=q===1?'#ffb040':'#ff7a2a';ctx.beginPath();ctx.moveTo(c[0]+ox-4,c[1]);ctx.quadraticCurveTo(c[0]+ox-3,c[1]-hh*.6,c[0]+ox+Math.sin(ph*1.3)*1.5,c[1]-hh);ctx.quadraticCurveTo(c[0]+ox+3,c[1]-hh*.5,c[0]+ox+4,c[1]);ctx.fill()}
    ctx.fillStyle='#ffe590';ctx.beginPath();ctx.ellipse(c[0],c[1]-4,2.5,4,0,0,7);ctx.fill();
    if(k==='pot'){ctx.strokeStyle='#2a1c10';ctx.lineWidth=2;const tp=[c[0],c[1]-34];for(const d of[[-13,4],[13,4],[2,-6]])bfL([c[0]+d[0],c[1]+d[1]],tp);ctx.lineWidth=1;bfL(tp,[c[0],c[1]-20]);
      ctx.fillStyle='#1c1a18';ctx.beginPath();ctx.ellipse(c[0],c[1]-14,9,7,0,0,Math.PI);ctx.fill();ctx.fillStyle='#2e2a26';ctx.beginPath();ctx.ellipse(c[0],c[1]-15,9,3,0,0,7);ctx.fill();ctx.fillStyle='#6a5a3a';ctx.beginPath();ctx.ellipse(c[0],c[1]-15,7,2,0,0,7);ctx.fill();
      ctx.strokeStyle='rgba(230,230,230,.25)';ctx.lineWidth=2;for(let q=0;q<2;q++){const t=(time*.6+q*.5)%1;ctx.beginPath();ctx.moveTo(c[0]-2+q*4,c[1]-18-t*20);ctx.quadraticCurveTo(c[0]+4*Math.sin(t*6+q),c[1]-24-t*20,c[0]+q*3,c[1]-30-t*20);ctx.stroke()}}
    break}
  case'junk':{fshadow(i,j,14,6);for(let q=0;q<9;q++){const p=scr(i+.2+r()*.6,j+.2+r()*.6),t=r();
      if(t<.3){ctx.fillStyle=['#7a6a4c','#5e4a36','#6a6050','#8a3a26'][q%4];ctx.beginPath();ctx.moveTo(p[0]-7,p[1]);ctx.quadraticCurveTo(p[0]-2,p[1]-9-r()*5,p[0]+6,p[1]-1);ctx.fill();ctx.strokeStyle='rgba(20,12,6,.6)';ctx.lineWidth=1;ctx.stroke()}
      else if(t<.55){ctx.strokeStyle='#6a5236';ctx.lineWidth=2.5;bfL([p[0]-8,p[1]+1],[p[0]+7,p[1]-5-r()*4])}
      else if(t<.8){ctx.fillStyle='#a49a88';ctx.beginPath();ctx.ellipse(p[0],p[1]-2,4.5,2.5,r(),0,Math.PI);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=.8;ctx.stroke()}
      else{ctx.fillStyle='#5a4a3a';ctx.beginPath();ctx.ellipse(p[0],p[1]-4,4,5,0,0,7);ctx.fill();ctx.fillStyle='#2a2018';ctx.beginPath();ctx.ellipse(p[0],p[1]-8,2.5,1.2,0,0,7);ctx.fill()}}break}
  case'logs':{fshadow(i,j,16,7);const rows=[[3,0],[2,1],[1,2]];for(const[n,lv]of rows)for(let q=0;q<n;q++){const gx=i+.25,gy=j+.25+(q+lv*.5)*.22,a=scr(gx,gy,4+lv*6.5),b=scr(gx+.55,gy,4+lv*6.5);
      seg([a,b],7,'#6a4a2c');ctx.strokeStyle='rgba(255,220,170,.2)';ctx.lineWidth=1.5;bfL([a[0],a[1]-2.5],[b[0],b[1]-2.5]);ctx.fillStyle='#c09868';ctx.beginPath();ctx.ellipse(b[0],b[1],3.2,3.5,0,0,7);ctx.fill();ctx.strokeStyle='#3a2412';ctx.lineWidth=1;ctx.stroke()}
    const ax=scr(i+.75,j+.7);ctx.strokeStyle='#4a3018';ctx.lineWidth=2;bfL(ax,[ax[0]+3,ax[1]-16]);ctx.fillStyle='#9aa0a6';ctx.beginPath();ctx.moveTo(ax[0]+1,ax[1]-17);ctx.lineTo(ax[0]+8,ax[1]-16);ctx.lineTo(ax[0]+6,ax[1]-11);ctx.fill();break}
  case'hide':{const a=scr(i+.15,j+.5),b=scr(i+.85,j+.5);seg([a,up(a,36)],3,'#4a3018');seg([b,up(b,36)],3,'#4a3018');seg([up(a,34),up(b,34)],2.5,'#5a3c22');
    const m=lerp2(a,b,.5);ctx.fillStyle='#8a6a44';ctx.beginPath();ctx.moveTo(m[0]-14,m[1]-32);ctx.lineTo(m[0]+14,m[1]-32);ctx.quadraticCurveTo(m[0]+17,m[1]-20,m[0]+12,m[1]-8);ctx.lineTo(m[0]+4,m[1]-12);ctx.lineTo(m[0],m[1]-6);ctx.lineTo(m[0]-4,m[1]-12);ctx.lineTo(m[0]-12,m[1]-8);ctx.quadraticCurveTo(m[0]-17,m[1]-20,m[0]-14,m[1]-32);ctx.fill();ctx.strokeStyle='#3a2414';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(200,170,120,.35)';ctx.beginPath();ctx.ellipse(m[0],m[1]-21,7,6,0,0,7);ctx.fill();bfAntler([m[0],m[1]-44]);break}
  case'rag':{const p=scr(i+.5,j+.5);seg([p,up(p,48)],2.2,'#5a4632');const f=up(p,46),wv=Math.sin(time*2.2+i)*2,cols=['#6a5e4c','#7a3a2a','#5a5a4a'];
    for(let q=0;q<3;q++){const y0=f[1]+q*9;quad([[f[0],y0],[f[0]+15+wv*(q+1)*.5,y0+1+q],[f[0]+11+wv*(q+1)*.6,y0+9],[f[0],y0+8]],cols[(q+i)%3],'rgba(20,12,6,.6)')}break}
  case'cage':{fshadow(i,j,14,7);const x0=i+.15,y0=j+.15,x1=i+.85,y1=j+.85,H=30;quad([scr(x0,y0,H),scr(x1,y0,H),scr(x1,y1,H),scr(x0,y1,H)],'rgba(90,60,30,.5)','#3a2414');
    ctx.strokeStyle='#5a3c22';ctx.lineWidth=2.2;for(let q=0;q<=5;q++){const t=q/5,a=scr(x0+(x1-x0)*t,y1),b=scr(x1,y1-(y1-y0)*t);bfL(a,up(a,H));bfL(b,up(b,H))}
    for(const hh of[2,H]){bfL(scr(x0,y1,hh),scr(x1,y1,hh));bfL(scr(x1,y1,hh),scr(x1,y0,hh))}break}
  case'torch':bfTorch(scr(i+.5,j+.5),1);{const p=scr(i+.5,j+.5);ctx.fillStyle='#5a544c';ctx.beginPath();ctx.ellipse(p[0],p[1],5,2.5,0,0,7);ctx.fill()}break;
  }}

// ================= 땅의 높낮이: 턱·계단·절벽·다리 (사용자 2026-10-26 v179) =================
// "맵지형에 높낮이(턱, 계단 등), 그 높낮이를 이용한 지형 구성 및 건물 배치" + 벼랑에 매달린 절 사진, 리니지 클래식의 높은 단·돌기둥·출렁다리
// 설계: docs/맵이동_설계.md 18장. 숫자는 data/elev.json ELEV
// - 칸마다 층(ELV, 0~7). 한 층은 ELEV.lh 픽셀. 높은 칸은 땅 그림을 그만큼 들어 올리고 앞쪽 두 면(+x·+y)에 벼랑을 그린다
// - 계단(HST): 내려가는 쪽(1 +x, 2 +y, 3 -x, 4 -y). 위쪽 끝은 ELV 층, 아래쪽 끝은 한 층 낮다. 옆으로는 오르내리지 못한다
// - 다리(HBR): ELV 층 높이의 널판 길. 밑의 땅(HBR-1층)은 그림만 보인다
// - 언덕(HKN): 경공으로만 오르는 곳. 몹이 생기지 않는다
// - 서로 다른 층 사이는 계단으로만 걷는다(hpass). 경공은 ELEV.leapUp 층까지 뛰어오른다
// - toScreen 이 그 자리 땅 높이(gH)만큼 올려 그리므로 사람·몹·효과·건물이 저절로 단 위에 선다. 바닥 그림만 toScreen0(안 올림)으로 그린다
// - 맵을 만들 때 높낮이를 정하는 것은 g_cliff.js (산 맵 계단식 턱, 항산 현공사)
const EV=GD.ELEV,LH=EV.lh;
let ELV=null,HST=null,HBR=null,HKN=null,HBD=null,HWL=null,ELMAX=0;   // HWL: 붉은 담이 선 가장자리 (1 +x, 2 +y, 4 -x, 8 -y)   // HBD: 다리 방향(1 x로 뻗음, 2 y로 뻗음)
function elevAlloc(){const n=N*NH;ELV=new Int8Array(n);HST=new Int8Array(n);HBR=new Int8Array(n);HKN=new Int8Array(n);HBD=new Int8Array(n);HWL=new Int8Array(n);ELMAX=0}
function elevClear(){ELV=HST=HBR=HKN=HBD=HWL=null;ESIL=null;ELMAX=0}
const lvAt=(i,j)=>!ELV||i<0||j<0||i>=N||j>=NH?0:ELV[j*N+i];
const elevOn=(i,j)=>!!ELV&&i>=0&&j>=0&&i<N&&j<NH&&(ELV[j*N+i]>0||HST[j*N+i]>0);
// 그 자리 땅 높이(픽셀). 계단 칸은 비탈처럼 이어진다
// GHB: 전각을 그리는 동안은 모든 점을 전각 바닥 높이로 (처마·그늘이 옆 낮은 칸으로 처지지 않게)
let GHB=null;
function gH(x,y){if(!ELV)return 0;if(GHB!=null)return GHB;const i=Math.floor(x),j=Math.floor(y);if(i<0||j<0||i>=N||j>=NH)return 0;const k=j*N+i,s=HST[k];if(!s)return ELV[k]*LH;
  const t=s===1?x-i:s===2?y-j:s===3?1-(x-i):1-(y-j);return(ELV[k]-clamp(t,0,1))*LH}
const hLv=(x,y)=>gH(x,y)/LH;
// 칸의 d쪽 가장자리 높이: 보통 칸은 그 층, 계단은 위·아래 끝, 옆은 같은 계단끼리만 맞는 값
function edgeH(i,j,d){const k=j*N+i,L=ELV[k],s=HST[k];if(!s)return L;const sd=s-1;if(d===sd)return L-1;if(d===(sd+2)%4)return L;return's'+sd+'_'+L}
// 이웃 칸으로 걸어갈 수 있나 (높낮이만 본다. 막힌 칸은 walk가 본다)
function hpass(i0,j0,i1,j1){if(!ELV)return true;const dx=i1-i0,dy=j1-j0;if(!dx&&!dy)return true;
  if(i0<0||j0<0||i0>=N||j0>=NH||i1<0||j1<0||i1>=N||j1>=NH)return true;
  const ax=Math.abs(dx),ay=Math.abs(dy);
  if(ax+ay===1){const d=dx===1?0:dy===1?1:dx===-1?2:3;return edgeH(i0,j0,d)===edgeH(i1,j1,(d+2)%4)}
  if(ax<=1&&ay<=1)return hpass(i0,j0,i1,j0)&&hpass(i1,j0,i1,j1)||hpass(i0,j0,i0,j1)&&hpass(i0,j1,i1,j1);
  return Math.abs(hLv(i0+.5,j0+.5)-hLv(i1+.5,j1+.5))<.01}
const hstep=(x0,y0,x1,y1)=>!ELV||hpass(Math.floor(x0),Math.floor(y0),Math.floor(x1),Math.floor(y1));
// 길찾기: 대각선은 두 갈래 모두 지날 수 있어야 (벼랑 모서리를 깎아 지나지 않게)
const hpath=(x,y,nx,ny)=>!ELV||(x===nx||y===ny?hpass(x,y,nx,ny):hpass(x,y,nx,y)&&hpass(nx,y,nx,ny)&&hpass(x,y,x,ny)&&hpass(x,ny,nx,ny));
// 높이 차: a가 b보다 높은 층 수
const elevDiff=(a,b)=>ELV?hLv(a.x,a.y)-hLv(b.x,b.y):0;
const elevGap=(a,b)=>!!ELV&&Math.abs(elevDiff(a,b))>=EV.gap;
const elevAbove=(a,b)=>!!ELV&&elevDiff(a,b)>=EV.gap;
const elevSpawnOk=(x,y)=>!HKN||!HKN[y*N+x];
// 경공 착지: 너무 높은 곳으로는 못 뛴다 (내려가는 것은 얼마든지)
const elevLeapOk=(x0,y0,x1,y1)=>!ELV||hLv(x1,y1)-hLv(x0,y0)<=EV.leapUp+.01;
// 경공 도중 땅 높이가 바뀌어도 몸이 튀지 않게: 출발·도착 땅 높이를 잇는 선을 따라 그린다
const elevLeapZ=(L,e)=>ELV?gH(L.sx,L.sy)*(1-e)+gH(L.ex,L.ey)*e-gH(P.x,P.y):0;
// 높은 곳에 있는 몹: 근접은 닿지 않으니 계단으로 돌아 올라온다. 길이 없으면 기다리다 ELEV.giveUp초 뒤 돌아간다. 처리했으면 true
function elevChase(e,tg,dt,spd){
  e.ept=(e.ept||0)-dt;if(e.ept<=0||!e.epath){e.ept=.6+Math.random()*.3;e.epath=findPath(Math.floor(e.x),Math.floor(e.y),Math.floor(tg.x),Math.floor(tg.y),900)}
  while(e.epath&&e.epath.length&&Math.hypot(e.epath[0].x-e.x,e.epath[0].y-e.y)<.35)e.epath.shift();
  if(e.epath&&e.epath.length){const n=e.epath[0],dx=n.x-e.x,dy=n.y-e.y,l=Math.hypot(dx,dy)||1;e.fx=dx/l;e.fy=dy/l;moveEnt(e,e.fx*spd*dt,e.fy*spd*dt);e.moving=true;e.perchT=0;return true}
  const dd=dist(e,tg)||1;e.moving=false;e.fx=(tg.x-e.x)/dd;e.fy=(tg.y-e.y)/dd;
  if(tg===P&&!e.d.boss){e.perchT=(e.perchT||0)+dt;if(e.perchT>EV.giveUp){e.aggro=false;e.tgt=null;e.perchT=0;e.giveUp=time+10;e.lost=time+10;e.goal={x:e.home.x,y:e.home.y};e.epath=null}}
  return true}
// 화면 점 → 칸: 높은 칸이 그 점을 덮고 있으면 그 칸 (가장 앞에 그려진 것)
function elevPick(wx,wy,gr){const g0=gr(wx,wy);if(!ELV)return g0;let best=null;
  for(let L=0;L<=ELMAX;L++){const g=gr(wx,wy+L*LH),i=Math.floor(g.x),j=Math.floor(g.y);if(i<0||j<0||i>=N||j>=NH)continue;
    if(Math.abs(hLv(g.x,g.y)-L)<=.5&&(!best||g.x+g.y>best.x+best.y))best=g}
  return best||g0}

// ---- 그리기 ----
const elevRock=()=>{const t=TP&&TP.rock||EV.rock[REGION().theme]||EV.rock._;return t};
// 칸 네 귀(위 i,j / 오른 i+1,j / 아래 i+1,j+1 / 왼 i,j+1)의 높이(픽셀)
function cornerH(i,j){if(i<0||j<0||i>=N||j>=NH)return[0,0,0,0];const k=j*N+i;
  if(HBR[k])return Array(4).fill((HBR[k]-1)*LH);   // 다리 밑은 땅
  const L=ELV[k]*LH,s=HST[k];if(!s)return[L,L,L,L];const lo=L-LH;
  return s===1?[L,lo,lo,L]:s===2?[L,L,lo,lo]:s===3?[lo,L,L,lo]:[lo,lo,L,L]}
// 칸 하나의 그림: 윗면(바닥 그림을 오려 들어 올림) + 앞쪽 벼랑 두 면. 계단은 돌계단, 다리는 널판
function elevPiece(g,i,j,ox,oy,src){
  const k=j*N+i,c=HBR[k]?Array(4).fill(ELV[k]*LH):cornerH(i,j),nl=cornerH(i,j+1),nr=cornerH(i+1,j),r=rng(i*977+j*131+7),rk=elevRock();
  // 귀 자리(조각 안 좌표). 높이 0의 위 귀가 (32, top)
  const top=Math.max(...c),X=[32,64,32,0],Y=[0,16,32,16],pt=(q,h)=>[ox+X[q],oy+top+Y[q]-h];
  const face=(a,b,ha,hb,na,nb,lit)=>{if(ha<=na+.5&&hb<=nb+.5)return;const p=[pt(a,ha),pt(b,hb),pt(b,Math.min(hb,nb)),pt(a,Math.min(ha,na))];
    g.save();g.beginPath();p.forEach((q,n)=>n?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();
    const m=lit?1:.68,gr=g.createLinearGradient(0,oy+top-Math.max(ha,hb),0,oy+top+32-Math.min(na,nb));
    gr.addColorStop(0,`rgb(${rk[0]*m*1.08|0},${rk[1]*m*1.08|0},${rk[2]*m*1.08|0})`);gr.addColorStop(1,`rgb(${rk[0]*m*.5|0},${rk[1]*m*.5|0},${rk[2]*m*.52|0})`);
    g.fillStyle=gr;g.fill();g.clip();
    // 결은 칸이 아니라 땅 좌표를 따른다 (이웃 칸 벼랑과 줄·금이 이어지게): 윗선과 나란한 지층, 세로 절리, 밝은 바위 면, 얼룩
    const x0=Math.min(p[0][0],p[1][0]),x1=Math.max(p[0][0],p[1][0]),y1=Math.max(p[2][1],p[3][1]),sl=(p[1][1]-p[0][1])/((p[1][0]-p[0][0])||1),tY=x=>p[0][1]+sl*(x-p[0][0]),deep=y1-Math.min(p[0][1],p[1][1]);
    for(let n=0;n*8<deep;n++){const d=6+n*8+hash(n,7)*3;g.strokeStyle=`rgba(0,0,0,${.1+hash(n,11)*.14})`;g.lineWidth=.8+hash(n,5);g.beginPath();
      for(let x=x0;x<=x1+.1;x+=4){const y=tY(x)+d+2.2*Math.sin(x*.09+n*1.7)+1.4*Math.sin(x*.23+n);x===x0?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}
    for(let wx=Math.floor(x0/7)*7;wx<x1;wx+=7){const h1=hash(wx/7|0,3),h2=hash(wx/7|0,9);if(h1>.42)continue;const x=wx+h2*5,y=tY(x)+h2*8,l=12+hash(wx/7|0,13)*Math.max(20,deep*.8);
      g.strokeStyle='rgba(0,0,0,.32)';g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+(h1-.2)*6,y+l*.5);g.lineTo(x+(h2-.5)*4,y+l);g.stroke();
      g.strokeStyle=`rgba(255,250,236,${lit?.16:.07})`;g.lineWidth=1;g.beginPath();g.moveTo(x-1.2,y+2);g.lineTo(x-1.2+(h1-.2)*6,y+l*.5);g.stroke()}
    if(lit)for(let q=0;q<2;q++){const x=x0+r()*(x1-x0-8),y=tY(x)+4+r()*Math.max(4,deep-20),w=6+r()*10,h=6+r()*14;g.fillStyle=`rgba(255,248,230,${.05+r()*.05})`;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y+w*sl);g.lineTo(x+w*.8,y+h);g.lineTo(x-1,y+h*.8);g.closePath();g.fill()}
    for(let q=0;q<12;q++){g.fillStyle=r()<.5?`rgba(255,255,255,${.04+r()*.06})`:`rgba(0,0,0,${.08+r()*.1})`;const x=x0+r()*(x1-x0);g.fillRect(x,tY(x)+r()*deep,1.5+r()*2,1+r()*1.5)}
    // 풀이 덮인 윗땅이면 벼랑 머리에 풀·이끼가 늘어진다
    if(map[j][i].g===0||map[j][i].g===9)for(let x=x0+2;x<x1;x+=3+r()*3){const y=tY(x);g.strokeStyle=`rgba(${60+r()*30|0},${90+r()*40|0},${40+r()*20|0},.85)`;g.lineWidth=1.6;g.beginPath();g.moveTo(x,y-1);g.lineTo(x+(r()-.5)*2,y+2+r()*6);g.stroke()}
    g.restore();
    // 윗가장자리 밝은 테 (깎인 모서리)
    g.strokeStyle=`rgba(255,248,230,${lit?.22:.1})`;g.lineWidth=1;g.beginPath();g.moveTo(...p[0]);g.lineTo(...p[1]);g.stroke()};
  if(HBR[k]){elevBridge(g,i,j,ox,oy+top-ELV[k]*LH,r);return}
  // 앞쪽 벼랑: 왼앞(+y 쪽, 왼 귀→아래 귀)은 밝게, 오른앞(+x 쪽, 아래 귀→오른 귀)은 어둡게
  face(3,2,c[3],c[2],nl[0],nl[1],true);face(2,1,c[2],c[1],nr[3],nr[0],false);
  if(HST[k]){elevStair(g,i,j,ox,oy,top,c);return}
  // 윗면: 바닥 그림의 그 칸 마름모를 그대로 오려 붙인다
  const sm=src.sm,K=sm?sm.k:1,sx=((i-j-1)*TW/2-(sm?sm.X0:-NH*TW/2))*K,sy=((i+j)*TH/2-(sm?sm.Y0:0))*K;
  g.save();g.beginPath();g.moveTo(ox+32,oy-.6);g.lineTo(ox+64.8,oy+16);g.lineTo(ox+32,oy+32.6);g.lineTo(ox-.8,oy+16);g.closePath();g.clip();
  g.drawImage(src,sx,sy,TW*K,TH*K,ox,oy,64,32);
  const L=ELV[k];if(L>0){g.fillStyle=`rgba(255,246,226,${Math.min(.14,L*.02)})`;g.fillRect(ox,oy,64,32)}
  g.restore();
  // 낭떠러지 쪽 가장자리: 밝은 테 + 풀 끝
  g.lineWidth=1.2;
  if(c[3]>nl[0]+.5){g.strokeStyle='rgba(255,250,235,.35)';g.beginPath();g.moveTo(...pt(3,c[3]));g.lineTo(...pt(2,c[2]));g.stroke()}
  if(c[2]>nr[3]+.5){g.strokeStyle='rgba(255,250,235,.22)';g.beginPath();g.moveTo(...pt(2,c[2]));g.lineTo(...pt(1,c[1]));g.stroke()}
  if(HWL[k])elevWall(g,HWL[k],c,pt)}
// 붉은 담(무당산 홍벽): 가장자리를 따라 선 낮은 담과 기와 머리. 뒤쪽 두 변은 안쪽 면이, 앞쪽 두 변은 바깥 면이 보인다
const WALL_H=13;
function elevWall(g,f,c,pt){const E=[[8,0,1,'#93361f'],[4,3,0,'#7e2e1b'],[1,1,2,'#86301f'],[2,2,3,'#a8402a']];
  for(const[b,a,z,col]of E){if(!(f&b))continue;const p0=pt(a,c[a]),p1=pt(z,c[z]),q=[p0,p1,[p1[0],p1[1]-WALL_H],[p0[0],p0[1]-WALL_H]];
    g.fillStyle=col;g.beginPath();q.forEach((v,n)=>n?g.lineTo(v[0],v[1]):g.moveTo(v[0],v[1]));g.closePath();g.fill();
    g.strokeStyle='rgba(30,10,6,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(p0[0],p0[1]-1);g.lineTo(p1[0],p1[1]-1);g.stroke();
    g.strokeStyle='#3c3c40';g.lineWidth=3.2;g.beginPath();g.moveTo(q[3][0],q[3][1]);g.lineTo(q[2][0],q[2][1]);g.stroke();
    g.strokeStyle='rgba(170,176,180,.7)';g.lineWidth=1;g.beginPath();g.moveTo(q[3][0],q[3][1]-1.4);g.lineTo(q[2][0],q[2][1]-1.4);g.stroke()}}
// 돌계단: 네 단. 내려가는 쪽이 앞(+x·+y)이면 단마다 앞면(챌판)이 보인다
function elevStair(g,i,j,ox,oy,top,c){
  const k=j*N+i,s=HST[k]-1,L=ELV[k]*LH,n=4,P2=(sa,la)=>{const gx=s===0?sa:s===1?la:s===2?1-sa:la,gy=s===0?la:s===1?sa:s===2?la:1-sa;return[ox+32+(gx-gy)*32,oy+top+(gx+gy)*16]};
  const q=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((p,n)=>n?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()};
  const front=s===0||s===1,order=front?[0,1,2,3]:[3,2,1,0];
  for(const t of order){const a=t/n,b=(t+1)/n,h=L-t*LH/n,u=(p,hh)=>[p[0],p[1]-hh];
    const tread=[u(P2(a,0),h),u(P2(b,0),h),u(P2(b,1),h),u(P2(a,1),h)],tone=150-t*6+((i*7+j*3+t)%3)*5;
    q(tread,`rgb(${tone},${tone-6},${tone-16})`);
    g.strokeStyle='rgba(40,34,28,.45)';g.lineWidth=1;g.beginPath();g.moveTo(...tread[0]);g.lineTo(...tread[3]);g.stroke();
    if(front){const h2=h-LH/n;q([u(P2(b,0),h),u(P2(b,1),h),u(P2(b,1),h2),u(P2(b,0),h2)],`rgb(${tone*.55|0},${tone*.52|0},${tone*.48|0})`)}}
  // 난간 돌: 옆이 낮으면 양옆에 낮은 돌 턱
  g.strokeStyle='rgba(60,52,44,.8)';g.lineWidth=2;for(const la of[.04,.96]){const p0=P2(0,la),p1=P2(1,la);g.beginPath();g.moveTo(p0[0],p0[1]-L-3);g.lineTo(p1[0],p1[1]-(L-LH)-3);g.stroke()}}
// 널판 다리: 널판을 가로로 깔고 양옆에 밧줄 난간
function elevBridge(g,i,j,ox,oy,r){
  const k=j*N+i,along=(HBD[k]||1)-1,P2=(sa,la)=>{const gx=along===0?sa:la,gy=along===0?la:sa;return[ox+32+(gx-gy)*32,oy+(gx+gy)*16]};
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;g.beginPath();g.moveTo(...P2(0,.08));g.lineTo(...P2(1,.08));g.moveTo(...P2(0,.92));g.lineTo(...P2(1,.92));g.stroke();
  for(let t=0;t<5;t++){const a=t/5+.01,b=(t+1)/5-.02,tone=118+((i+j+t)%3)*10+r()*8;g.fillStyle=`rgb(${tone|0},${tone*.74|0},${tone*.5|0})`;
    const p=[P2(a,.06),P2(b,.06),P2(b,.94),P2(a,.94)];g.beginPath();p.forEach((q,n)=>n?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();
    g.strokeStyle='rgba(40,24,12,.5)';g.lineWidth=.8;g.stroke()}
  // 기둥과 밧줄
  for(const la of[.04,.96]){const p0=P2(0,la),p1=P2(1,la);g.strokeStyle='#4a3420';g.lineWidth=2.4;g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p0[0],p0[1]-14);g.stroke();
    g.strokeStyle='rgba(170,140,96,.9)';g.lineWidth=1.3;g.beginPath();g.moveTo(p0[0],p0[1]-13);g.quadraticCurveTo((p0[0]+p1[0])/2,(p0[1]+p1[1])/2-9,p1[0],p1[1]-13);g.stroke();
    g.beginPath();g.moveTo(p0[0],p0[1]-7);g.quadraticCurveTo((p0[0]+p1[0])/2,(p0[1]+p1[1])/2-3,p1[0],p1[1]-7);g.stroke()}}
// 맵을 다 불러온 뒤 한 번: 바닥 그림(ground)을 위로 ELMAX층만큼 키운 새 그림에 높은 칸(윗면을 오려 들어 올림 + 벼랑·계단·다리)을
// 뒤에서 앞 순서로 굽는다. 매 프레임 비용은 바닥 한 장 그대로. 높은 칸 뒤에 선 것은 elevDraw가 그 칸만 다시 덮는다
// (계절 겹은 높낮이 맵에서 쓰지 않는다: 땅 그림 자리가 달라져서)
let ESIL=null;   // 칸별 윤곽(덮어 그릴 때 오리는 모양)
function elevSil(i,j){const k=j*N+i,c=HBR[k]?Array(4).fill(ELV[k]*LH):cornerH(i,j),nl=cornerH(i,j+1),nr=cornerH(i+1,j),ax=(i-j)*TW/2,ay=(i+j)*TH/2;
  const p=HBR[k]?[[ax,ay-c[0]],[ax+32,ay+16-c[1]],[ax,ay+34-c[2]],[ax-32,ay+16-c[3]]]
    :[[ax,ay-c[0]],[ax+32,ay+16-c[1]],[ax+32,ay+16-Math.min(c[1],nr[0])],[ax,ay+32-Math.min(c[2],nl[1],nr[3])],[ax-32,ay+16-Math.min(c[3],nl[0])],[ax-32,ay+16-c[3]]];
  if(HWL[k])for(const q of p)if(q[1]<ay+16-Math.min(...c)+1)q[1]-=WALL_H+2;
  const ys=p.map(q=>q[1]);return{p,x0:ax-33,x1:ax+33,y0:Math.min(...ys)-1,y1:Math.max(...ys)+1,top:Math.max(...c)}}
function elevBuild(){ESIL=null;if(!ELV||!ground||ground.chunked)return;
  if(!ground.elev){const src=ground,sm=src.sm,K=sm?sm.k:1,X0=sm?sm.X0:-NH*TW/2,Y0=sm?sm.Y0:0,pad=Math.ceil((ELMAX*LH+24)*K),padW=pad/K,s=src.getContext('2d');
    // 벼랑 발치 그늘 (낮은 칸 쪽)
    for(let j=0;j<NH;j++)for(let i=0;i<N;i++){const h=hLv(i+.5,j+.5);
      for(const[dx,dy]of[[1,0],[0,1]]){const a=i+dx,b=j+dy;if(a>=N||b>=NH)continue;const d=h-hLv(a+.5,b+.5);if(d<.9||HBR[b*N+a]||HBR[j*N+i])continue;
        const ex=dx?-.5:0,ey=dy?-.5:0,wx=((a+.5+ex)-(b+.5+ey))*TW/2,wy=((a+.5+ex)+(b+.5+ey))*TH/2,sx=(wx-X0)*K,sy=(wy-Y0)*K;
        const gr=s.createRadialGradient(sx,sy,0,sx,sy,30*K);gr.addColorStop(0,`rgba(0,0,0,${Math.min(.45,.18+d*.08)})`);gr.addColorStop(1,'rgba(0,0,0,0)');s.fillStyle=gr;s.fillRect(sx-30*K,sy-30*K,60*K,60*K)}}
    const c=document.createElement('canvas');c.width=src.width;c.height=src.height+pad;const g=c.getContext('2d');g.drawImage(src,0,pad);
    g.setTransform(K,0,0,K,-X0*K,-(Y0-padW)*K);
    const order=[];for(let j=0;j<NH;j++)for(let i=0;i<N;i++){const k=j*N+i;if(ELV[k]||HST[k]||HBR[k])order.push(k)}
    order.sort((a,b)=>(a%N+(a/N|0))-(b%N+(b/N|0))||a-b);
    for(const k of order){const i=k%N,j=(k-i)/N,cc=HBR[k]?Array(4).fill(ELV[k]*LH):cornerH(i,j),top=Math.max(...cc);elevPiece(g,i,j,(i-j)*TW/2-32,(i+j)*TH/2-top,src)}
    c.elev=1;if(src.baking)c.src=src;c.padW=padW;c.K=K;c.X0=X0;c.Y0=Y0-padW;GROUND[REG]=c;ground=c}
  ESIL=new Array(N*NH);for(let j=0;j<NH;j++)for(let i=0;i<N;i++){const k=j*N+i;if(ELV[k]||HST[k]||HBR[k])ESIL[k]=elevSil(i,j)}}
// 높은 칸 뒤(위쪽)에 서 있어 그 칸에 가려져야 하는 것: 그 칸 윤곽만 바닥 그림에서 다시 오려 그 깊이에 덮는다
function elevRedraw(s){const ox=-cam.x+W/2,oy=-cam.y+H/2,g=ground,K=g.K;
  ctx.save();ctx.beginPath();s.p.forEach((q,n)=>n?ctx.lineTo(q[0]+ox,q[1]+oy):ctx.moveTo(q[0]+ox,q[1]+oy));ctx.closePath();ctx.clip();
  ctx.drawImage(g,(s.x0-g.X0)*K,(s.y0-g.Y0)*K,(s.x1-s.x0)*K,(s.y1-s.y0)*K,s.x0+ox,s.y0+oy,s.x1-s.x0,s.y1-s.y0);ctx.restore()}
function elevDraw(list){if(!ESIL||!ground.elev)return;const red=new Set,DU=Math.ceil(ELMAX*LH/16)+2;
  for(const o of list){if(o.x==null||o.L>=LY.FX)continue;const fi=Math.floor(o.x),fj=Math.floor(o.y),eh=gH(o.x,o.y),wx=(o.x-o.y)*TW/2,wy=(o.x+o.y)*TH/2-eh,hw=o.hw||26,ht=o.ht||90;
    for(let du=1;du<=DU;du++)for(let dv=-4;dv<=4;dv++){if((du+dv)&1)continue;const i=fi+(du+dv)/2,j=fj+(du-dv)/2;if(i<0||j<0||i>=N||j>=NH)continue;
      const k=j*N+i,s=ESIL[k];if(!s||red.has(k)||s.top<=eh+2)continue;if(s.x1<wx-hw||s.x0>wx+hw||s.y0>wy+4||s.y1<wy-ht)continue;red.add(k)}}
  if(!red.size)return;const add=[];for(const k of red){const s=ESIL[k],i=k%N,j=(k-i)/N;add.push({d:i+j+.98,f:()=>elevRedraw(s)})}
  // 같은 높이 바닥 위에 선 전각은 앞 칸을 다시 찍은 뒤에 한 번 더 그린다 (처마가 앞 칸 바닥에 잘리지 않게)
  for(const o of list){const b=o.b;if(!b)continue;const bh=lvAt(b.x,b.y)*LH;if(!bh)continue;
    const x0=(b.x-b.y-b.h)*TW/2-20,x1=(b.x+b.w-b.y)*TW/2+20,y1=(b.x+b.w+b.y+b.h)*TH/2-bh+10,y0=y1-260;let m=-1;
    for(const k of red){const s=ESIL[k],i=k%N,j=(k-i)/N;if(s.top>bh+2||i+j+.98<=o.d||s.x1<x0||s.x0>x1||s.y1<y0||s.y0>y1)continue;m=Math.max(m,i+j+.99)}
    if(m>0)add.push({d:m,f:o.f})}
  list.push(...add)}
hook('drawList',elevDraw);
hook('loadRegion',()=>elevClear());
hook('regionLoaded',()=>elevBuild());
// 미니맵: 높을수록 밝게
function elevMini(g){if(!ELV)return;for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const L=ELV[y*N+x];if(!L)continue;const[px,py]=miniXY(x+.5,y+.5),ms=80/(N+NH);g.fillStyle=`rgba(255,250,235,${Math.min(.4,L*.05)})`;g.fillRect(px-1.5*ms,py-ms,3.2*ms,2.2*ms)}}

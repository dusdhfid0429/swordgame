// ================= 동굴 (v158, 사용자 2026-10-20 "동굴도 추가해줘. 입구는 산이 있는 맵에 자연스럽게, 혈교 등 비밀단체의 지부와 본거지에도") =================
// 시안(2026-10-19, screens/cave/)을 게임에 넣었다. 데이터: data/cave.json CAVE. 테스트: tests/t96_cave.js
// 동굴 종류 (지역 id 'cv_<바깥 지역>'):
// - wild 산 동굴: 테마가 산(peak·snow·canyon)인 명소·본산 맵과 숭산에 하나씩. 입구 자리는 처음 그 맵을 열 때 바위·나무가 몰린 뒤쪽에서 고르고
//   (입구 앞 칸은 출입구에서 걸어서 닿아야 한다) 둘레를 바위로 감싼다. 테마: 눈 산 → 빙굴, 이름이 화염·불 → 화굴, 협곡은 셋에 하나 화굴, 그 밖은 석굴
// - branch 혈교 지부: 성 소굴(world.json PV_LAIRS의 cave 표시) 한가운데 바위 굴. 두목(혈교장로)은 굴 안쪽 방으로 옮긴다. 소굴 밖에는 졸개가 지킨다
// - hq 혈교 총단: 귀주 마령하협곡의 굴. 혈교주와 혈교장로
// - secret 비밀 문파(귀영문·하오문·천마신교) 본산의 비동: 그 문파 무인이 지킨다 (같은 문파면 길을 비킨다)
// 굴 속: 세포 자동자(cellular automata)로 굴을 파고 입구 방·웅덩이 방·안쪽 방·곁방을 구불구불한 굴로 잇는다. 입구에서 닿지 않는 곳은 메운다.
// 바닥에 닿은 벽 칸만 바위 벽(cwall)을 세우고 그 뒤는 검은 천장(cvoid, 그리지 않음). 바닥·물·용암·얼음·피 웅덩이는 한 번 굽는다(bakeCave)
// 안쪽 방에 동굴 보물상자(cchest): 한 생에 동굴마다 한 번 (P.caveGot)
// 화면 효과(어둠 뒤에 그림): 수정·버섯·횃불·용암 빛, 물방울, 먼지, 박쥐, 바닥 안개. 빛 구멍은 미리 만든 빛 그림을 찍어 매 프레임 그라디언트를 만들지 않는다
const CV=GD.CAVE,CAVE_TH=CV.th;
let CAVE=null;   // 지금 동굴: {th,T,decor,cry,lava,torch,bats,drips,motes}
// 방 자리는 굴 크기만으로 정한다 (두목 자리를 굴을 만들기 전에 알 수 있게). 56칸 넘는 총단은 제단 방이 하나 더
function caveRooms(W,H){const k=Math.min(1,W/44),mid=Math.floor(W/2);
  const o=[{x:mid,y:H-5,r:4.2,k:'gate'},{x:Math.round(W*.3),y:Math.round(H*.5),r:6.5*k,k:'pool'},{x:Math.round(W*.66),y:Math.round(H*.22),r:5.2*k+.4,k:'boss'},
    {x:Math.round(W*.72),y:Math.round(H*.62),r:4*k+.3,k:'side'},{x:Math.round(W*.28),y:Math.round(H*.2),r:3.6*k+.4,k:'side'}];
  if(W>=50)o.push({x:Math.round(W*.5),y:Math.round(H*.1)+2,r:4.6,k:'altar'});return o}
function genCave(c){
  const T=CAVE_TH[c.th];N=c.w;NH=c.h;const r=rng(c.seed);map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const mid=Math.floor(N/2);let s=[];
  for(let y=0;y<NH;y++){s[y]=[];for(let x=0;x<N;x++)s[y][x]=x<2||y<2||x>N-3||y>NH-3?1:r()<.46?1:0}
  for(let it=0;it<5;it++){const t=[];for(let y=0;y<NH;y++){t[y]=[];for(let x=0;x<N;x++){if(x<2||y<2||x>N-3||y>NH-3){t[y][x]=1;continue}
    let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)n+=s[y+dy][x+dx];t[y][x]=n>=5?1:0}}s=t}
  // 방: 입구, 물웅덩이(용암·얼음), 안쪽(상자), 곁방 둘
  const rooms=caveRooms(N,NH);
  const open=(cx,cy,rr)=>{for(let y=Math.floor(cy-rr-2);y<=cy+rr+2;y++)for(let x=Math.floor(cx-rr-2);x<=cx+rr+2;x++){if(x<2||y<2||x>N-3||y>NH-3)continue;
    const d=Math.hypot(x+.5-cx,y+.5-cy)+(vn(x*.7+c.seed,y*.7)-.5)*2.2;if(d<rr)s[y][x]=0}};
  const keep=new Set();   // 굴 길: 돌기둥·수정을 세우지 않는다
  const tunnel=(a,b)=>{const L=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/L,ny=(b.x-a.x)/L,w=r()*6.28;
    for(let t=0;t<=1;t+=.5/L){const bend=Math.sin(t*Math.PI)*Math.sin(t*6+w)*3.2,x=a.x+(b.x-a.x)*t+nx*bend,y=a.y+(b.y-a.y)*t+ny*bend;
      open(x,y,1.5+vn(t*9,w)*1.1);keep.add(Math.floor(x)+','+Math.floor(y))}};
  for(const m of rooms)open(m.x,m.y,m.r);
  tunnel(rooms[0],rooms[1]);tunnel(rooms[0],rooms[3]);tunnel(rooms[1],rooms[4]);tunnel(rooms[1],rooms[2]);tunnel(rooms[3],rooms[2]);if(rooms[5])tunnel(rooms[4],rooms[5]),tunnel(rooms[2],rooms[5]);
  for(let y=NH-6;y<NH-1;y++)for(let x=mid-1;x<=mid+1;x++)s[y][x]=0;   // 입구 굴
  // 입구에서 닿는 곳만 남긴다
  const seen=[];for(let y=0;y<NH;y++)seen[y]=[];const q=[[mid,NH-2]];seen[NH-2][mid]=1;
  while(q.length){const[x,y]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=N||Y>=NH||seen[Y][X]||s[Y][X])continue;seen[Y][X]=1;q.push([X,Y])}}
  for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(!s[y][x]&&!seen[y][x])s[y][x]=1;
  // 격자: 벽 6, 바닥 11, 물·용암 2 (얼음은 걸을 수 있게 바닥으로 두고 ice 표시만)
  const pool=rooms[1],poolD=(x,y)=>Math.hypot(x-pool.x,y-pool.y)+(fbm(x*.4,y*.4)-.5)*3,lavaF=(x,y)=>Math.abs(vn(x*.18+3,y*.18)-.5),R0=3.6*Math.min(1,N/44);
  for(let y=0;y<NH;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){const v=r();
    if(s[y][x]){map[y][x]={g:6,v};let edge=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<N&&Y<NH&&!s[Y][X])edge=1}
      objs[y][x]=edge?'cwall':'cvoid';continue}
    const pd=poolD(x+.5,y+.5);
    map[y][x]={g:pd<R0&&!T.ice?2:11,v,pool:pd<R0?1:0};objs[y][x]=null}}
  // 용암은 물웅덩이 말고도 갈라진 틈으로 흐른다
  if(T.lava)for(let y=3;y<NH-3;y++)for(let x=3;x<N-3;x++){const f=lavaF(x+.5,y+.5);if(f<.02&&map[y][x].g===11&&!keep.has(x+','+y)&&Math.hypot(x-mid,y-(NH-4))>6)map[y][x]={g:2,v:r(),pool:1}}
  // 돌기둥(종유석), 수정, 장식(버섯·뼈·횃불)
  const free=(x,y)=>map[y]&&map[y][x]&&map[y][x].g===11&&!objs[y][x]&&!keep.has(x+','+y)&&Math.hypot(x-mid,y-(NH-3))>3.5;
  const nearWall=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(objs[y+dy]&&objs[y+dy][x+dx]==='cwall')return 1;return 0};
  CAVE={th:c.th,T,decor:[],cry:[],lava:[],torch:[],drips:[],motes:[],bats:Array.from({length:5},(_,i)=>({p:i*1.3,r:3+i*.7,sp:.5+r()*.6}))};
  for(let y=2;y<NH-2;y++)for(let x=2;x<N-2;x++){if(!free(x,y))continue;const v=r(),nw=nearWall(x,y),inPool=Math.hypot(x-pool.x,y-pool.y)<pool.r+1.5,inBoss=Math.hypot(x-rooms[2].x,y-rooms[2].y)<rooms[2].r+1;
    if(nw&&(inPool||inBoss)&&v<.22){objs[y][x]='crystal';CAVE.cry.push({x:x+.5,y:y+.5,p:r()*6})}
    else if(!nw&&v<.035)objs[y][x]='stalag';
    else if(nw&&v<.12)CAVE.decor.push({x:x+.2+r()*.6,y:y+.2+r()*.6,k:'mush',n:2+Math.floor(r()*4),p:r()*6});
    else if(v<.16)CAVE.decor.push({x:x+r(),y:y+r(),k:'pebble',p:r()*6});
    else if(v<.175)CAVE.decor.push({x:x+.5,y:y+.5,k:'bone',p:r()*6})}
  // 횃불: 입구 둘, 안쪽 방 둘 (산 동굴은 사람이 없으니 입구엔 없다). 혈교·비밀 문파 굴은 방마다 더
  const tp=[[rooms[2].x-2,rooms[2].y-1],[rooms[2].x+2,rooms[2].y-1]];if(c.kind!=='wild')tp.push([mid-2,NH-4],[mid+2,NH-4]);
  for(let i=0;i<(T.torches||0);i++){const m=rooms[1+i%(rooms.length-1)];tp.push([m.x+(i%2?2:-2),m.y+(i%3)-1])}
  for(const[x,y]of tp)if(map[y]&&map[y][x]&&map[y][x].g===11){objs[y][x]=null;CAVE.torch.push({x:x+.5,y:y+.5,p:r()*6})}
  // 안쪽 방: 해골과 동굴 보물상자. 산 동굴은 깊은 곁방에
  const cr=c.kind==='wild'?rooms[4]:rooms[2],cx=cr.x,cy=cr.y-1;for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(map[y][x].g!==6)objs[y][x]=null;
  map[cy][cx]={g:11,v:.5,pool:0};objs[cy][cx]=null;if(c.id)nodes.push({t:'cchest',x:cx+.5,y:cy+.5,cd:P&&P.caveGot&&P.caveGot[c.id]?99999:0,cave:c.id});
  for(let i=0;i<6*(T.bones||1);i++)CAVE.decor.push({x:rooms[2].x+.5+(r()-.5)*5,y:rooms[2].y+.5+(r()-.5)*4,k:'bone',p:r()*6});
  for(const b of c.bosses||[]){const x=Math.floor(b[1]),y=Math.floor(b[2]);for(let j=y-1;j<=y+1;j++)for(let i=x-1;i<=x+1;i++)if(map[j]&&map[j][i]&&map[j][i].g!==6&&objs[j][i]!=='cwall')objs[j][i]=null}
  CAVE.rooms=rooms;CAVE.poolD=poolD;CAVE.lavaF=lavaF;CAVE.id=c.id;CAVE.poolR=R0;
  // 다 놓은 뒤 입구에서 걸어서 닿지 않는 바닥이 있으면: 돌기둥·수정을 치우고, 그래도 막히면 웅덩이·용암 줄기를 얕게(걸을 수 있게) 한다
  const cut=()=>{const sn=[];for(let y=0;y<NH;y++)sn[y]=[];const q=[[mid,NH-3]];sn[NH-3][mid]=1;
    while(q.length){const[x,y]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=N||Y>=NH||sn[Y][X]||!walk(X,Y))continue;sn[Y][X]=1;q.push([X,Y])}}
    let n=0;for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(map[y][x].g===11&&!objs[y][x]&&!sn[y][x])n++;return n};
  if(cut()){for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(objs[y][x]==='stalag'||objs[y][x]==='crystal')objs[y][x]=null;CAVE.cry=[]}
  if(cut()){for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(map[y][x].g===2)map[y][x].g=11;CAVE.lava=[]}
  if(!T.lava)CAVE.lava=[];else{CAVE.lava=[];for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(map[y][x].g===2)CAVE.lava.push(x,y)}
}
// 벽까지 거리(바닥 그늘용): 0이 벽, 4까지
function caveWallDist(){const d=[];const q=[];for(let y=0;y<NH;y++){d[y]=[];for(let x=0;x<N;x++){const w=map[y][x].g===6;d[y][x]=w?0:9;if(w)q.push([x,y])}}
  for(let h=0;h<q.length;h++){const[x,y]=q[h];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=N||Y>=NH||d[Y][X]<=d[y][x]+1)continue;d[Y][X]=d[y][x]+1;if(d[Y][X]<4)q.push([X,Y])}}return d}
function bakeCave(th){
  const T=CAVE_TH[th],k=Math.min(1,40/Math.max(N,NH)),X0=-NH*TW/2,gw=Math.round((N+NH)*TW/2*k),gh=Math.round((N+NH)*TH/2*k),c=document.createElement('canvas');c.width=gw;c.height=gh;
  const g=c.getContext('2d'),img=g.createImageData(gw,gh),d=img.data,WD=caveWallDist();
  const wd=(x,y)=>{const i=Math.floor(x-.5),j=Math.floor(y-.5),fx=x-.5-i,fy=y-.5-j,at=(a,b)=>WD[Math.max(0,Math.min(NH-1,b))][Math.max(0,Math.min(N-1,a))];
    return(at(i,j)*(1-fx)+at(i+1,j)*fx)*(1-fy)+(at(i,j+1)*(1-fx)+at(i+1,j+1)*fx)*fy};
  for(let qy=0;qy<gh;qy++)for(let qx=0;qx<gw;qx++){
    const px=qx/k+X0,py=qy/k,a=px/(TW/2),b=py/(TH/2),gx=(a+b)/2,gy=(b-a)/2;if(gx<0||gy<0||gx>=N||gy>=NH)continue;
    const cell=map[Math.floor(gy)][Math.floor(gx)],n=fbm(gx*1.1,gy*1.1),grain=.9+hash(qx,qy)*.2;let R,G,B;
    const pd=CAVE.poolD(gx,gy),lf=T.lava?CAVE.lavaF(gx,gy):1,R0=CAVE.poolR,liq=cell.g!==6&&(pd<R0||cell.g===2&&lf<.026)?Math.max((R0-pd)/R0,T.lava&&cell.g===2?(.026-lf)/.026:0):0;
    if(cell.g===6){const m=.6+n*.5;R=T.wall[0]*m;G=T.wall[1]*m;B=T.wall[2]*m}
    else if(liq>0&&T.lava){const f=fbm(gx*2,gy*2),hot=Math.min(1,liq*1.4)*(.5+f*.6),cr=fbm(gx*3.5,gy*3.5);
      R=150+105*hot;G=34+110*hot*hot;B=8+30*hot*hot*hot;if(cr>.55-liq*.12){const k=Math.min(1,(cr-.5)*6);R*=1-.75*k;G*=1-.8*k;B*=1-.8*k}if(liq<.12){R*=.6;G*=.5;B*=.5}}
    else if(liq>0&&!T.ice){const dep=Math.min(1,liq*1.6),w=fbm(gx*2.5,gy*4);if(liq<.06){R=T.liq[0]+50;G=T.liq[1]+50;B=T.liq[2]+50}elseR=T.liq[0]*(1.25-dep*.6)+w*14;G=T.liq[1]*(1.25-dep*.6)+w*16;B=T.liq[2]*(1.25-dep*.5)+w*18}
    else if(liq>0&&T.ice){const cr=Math.abs(vn(gx*3,gy*3)-.5)<.03||Math.abs(vn(gx*7+5,gy*7)-.5)<.02,w=fbm(gx*1.5,gy*3);R=172+w*40;G=212+w*30;B=236+w*16;if(cr){R=240;G=250;B=255}}
    else{const mx=fbm(gx*.35+11,gy*.35),t=Math.min(1,Math.max(0,(mx-.4)*3));R=T.floor[0]*(1-t)+T.floor2[0]*t;G=T.floor[1]*(1-t)+T.floor2[1]*t;B=T.floor[2]*(1-t)+T.floor2[2]*t;
      const m=.78+n*.4;R*=m;G*=m;B*=m;
      // 갈라진 금, 젖은 자리(번들), 이끼, 자갈
      if(vn(gx*.45+30,gy*.45)>.58&&Math.abs(vn(gx*2.2,gy*2.2)-.5)<.014){R*=.55;G*=.55;B*=.55}
      const wet=vn(gx*.8+40,gy*.8);if(wet>.66&&!T.lava){const h=(wet-.66)*2.5;R+=(T.liq[0]+40-R)*h*.5;G+=(T.liq[1]+40-G)*h*.5;B+=(T.liq[2]+50-B)*h*.5;if(hash(qx>>1,qy>>1)>.985){R+=60;G+=60;B+=60}}
      const ms=fbm(gx*.9+70,gy*.9);if(ms>.6&&wd(gx,gy)<2.2){const h=Math.min(1,(ms-.6)*4);R+=(T.moss[0]-R)*h*.6;G+=(T.moss[1]-G)*h*.6;B+=(T.moss[2]-B)*h*.6}
      if(hash(Math.floor(gx*9),Math.floor(gy*9))>.93){const h=hash(Math.floor(gx*9)+1,Math.floor(gy*9));R*=.7+h*.5;G*=.7+h*.5;B*=.7+h*.5}
      if(T.lava&&shoreLava(gx,gy)){R+=70;G+=22}   // 용암 둘레가 달아오른다
      const ao=Math.min(1,.35+wd(gx,gy)*.3);R*=ao;G*=ao;B*=ao}
    const i=(qy*gw+qx)*4;d[i]=R*grain;d[i+1]=G*grain;d[i+2]=B*grain;d[i+3]=255}
  g.putImageData(img,0,0);return c}
// 물가까지 거리 (물 칸 안에서)
function shoreD(gx,gy){let m=9;const i=Math.floor(gx),j=Math.floor(gy);for(let y=j-3;y<=j+3;y++)for(let x=i-3;x<=i+3;x++){if(!map[y]||!map[y][x]||map[y][x].g===2)continue;m=Math.min(m,Math.hypot(Math.max(x-gx,0,gx-x-1),Math.max(y-gy,0,gy-y-1)))}return m}
function shoreLava(gx,gy){const i=Math.floor(gx),j=Math.floor(gy);for(let y=j-1;y<=j+1;y++)for(let x=i-1;x<=i+1;x++)if(map[y]&&map[y][x]&&map[y][x].g===2&&Math.hypot(x+.5-gx,y+.5-gy)<1.3)return 1;return 0}

// ---- 그림 (테마마다 처음 쓸 때 만든다) ----
const CAVE_SPR={};
function caveSprites(th){if(CAVE_SPR[th])return CAVE_SPR[th];const T=CAVE_TH[th];
  return CAVE_SPR[th]={cwall:[0,1,2,3].map(s=>mkCaveWall(T,th.length*101+s*37+3)),stalag:[0,1,2].map(s=>mkStalag(T,s*53+11)),crystal:[0,1,2].map(s=>mkCrystal(T,s*71+5)),cvoid:[EMPTY_SPR]}}
const EMPTY_SPR=document.createElement('canvas');EMPTY_SPR.width=EMPTY_SPR.height=1;
for(const kk of['cwall','stalag','crystal','cvoid'])Object.defineProperty(SPRITES,kk,{get:()=>caveSprites(CAVE?CAVE.th:'stone')[kk]});
const rgbS=(a,m=1,al=1)=>`rgba(${a[0]*m|0},${a[1]*m|0},${a[2]*m|0},${al})`;
// 바위 벽 한 칸: 발자국 마름모를 위로 밀어 올린 덩어리. 왼쪽 면은 밝고 오른쪽 면은 어둡다. 윗면은 검은 천장과 이어진다
function mkCaveWall(T,seed){const r=rng(seed),h=58+Math.floor(r()*26),w=76,c=document.createElement('canvas');c.width=w;c.height=h+34;const g=c.getContext('2d');
  const cy=c.height-12,L=[w/2-33,cy],F=[w/2,cy+14],R=[w/2+33,cy],Bk=[w/2,cy-17];
  const top=(p,dh)=>[p[0]+(r()-.5)*8,p[1]-h-dh];const tL=top(L,r()*14),tF=top(F,r()*8-4),tR=top(R,r()*14),tB=top(Bk,r()*10);
  const edge=(a,b,n,j)=>{const o=[];for(let i=0;i<=n;i++){const t=i/n;o.push([a[0]+(b[0]-a[0])*t+(i&&i<n?(r()-.5)*j:0),a[1]+(b[1]-a[1])*t+(i&&i<n?(r()-.5)*j*1.6:0)])}return o};
  const fill=(pts,f)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=f;g.fill()};
  // 왼쪽 앞면 (L→F 아래, tF→tL 위)
  const lf=[...edge(L,F,4,3),...edge(tF,tL,5,7)],rf=[...edge(F,R,4,3),...edge(tR,tF,5,7)];
  let gr=g.createLinearGradient(0,cy-h,0,cy+10);gr.addColorStop(0,rgbS(T.face[0]));gr.addColorStop(.55,rgbS(T.face[1]));gr.addColorStop(1,rgbS(T.face[2],.7));fill(lf,gr);
  gr=g.createLinearGradient(0,cy-h,0,cy+10);gr.addColorStop(0,rgbS(T.face[1]));gr.addColorStop(.6,rgbS(T.face[2]));gr.addColorStop(1,rgbS(T.face[2],.5));fill(rf,gr);
  // 윗면: 천장처럼 거의 검다
  const cap=[...edge(tL,tF,3,10),...edge(tF,tR,3,10),...edge(tR,tB,3,10),...edge(tB,tL,3,10)];fill(cap,rgbS(T.wall,.9));
  // 윗면 울퉁불퉁한 바위 덩이: 앞쪽일수록 밝다
  for(let i=0;i<5;i++){const u=r(),v=r(),x=tL[0]+(tR[0]-tL[0])*u,y=tB[1]+(tF[1]-tB[1])*v-4,rx=8+r()*9,ry=rx*.55;
    const gg=g.createRadialGradient(x-rx*.35,y-ry*.5,1,x,y,rx);gg.addColorStop(0,rgbS(T.face[1],.95));gg.addColorStop(.6,rgbS(T.face[2],.8));gg.addColorStop(1,rgbS(T.wall,.9));
    g.fillStyle=gg;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()}
  // 결: 세로 골, 물 자국, 가로 층
  g.save();g.beginPath();[...lf].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();[...rf].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.clip();
  g.lineCap='round';
  for(let i=0;i<10;i++){const x=6+r()*(w-12),y0=cy-h+r()*14,y1=cy-r()*12;g.strokeStyle=rgbS(T.face[2],.6,.55);g.lineWidth=1+r()*2;g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+(r()-.5)*6,(y0+y1)/2,x+(r()-.5)*4,y1);g.stroke();
    g.strokeStyle=rgbS(T.face[0],1.1,.25);g.lineWidth=1;g.beginPath();g.moveTo(x-1.5,y0+3);g.lineTo(x-1.5,y1-4);g.stroke()}
  for(let y=cy-h+10;y<cy;y+=8+r()*10){g.strokeStyle=rgbS(T.face[2],.7,.3);g.lineWidth=1.2;g.beginPath();g.moveTo(0,y+r()*4);g.quadraticCurveTo(w/2,y+(r()-.5)*6,w,y+r()*4);g.stroke()}
  if(T.lava)for(let i=0;i<3;i++){let x=10+r()*(w-20),y=cy-r()*h*.6;g.strokeStyle='rgba(255,120,30,.85)';g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-.5)*8;y-=4+r()*6;g.lineTo(x,y)}g.stroke()}
  if(T.ice){g.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<4;i++){const x=r()*w,y=cy-h+r()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+6+r()*8,y-10-r()*14);g.lineTo(x+3,y+r()*6);g.fill()}}
  // 아래 그늘
  gr=g.createLinearGradient(0,cy-14,0,cy+14);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=gr;g.fillRect(0,cy-14,w,30);
  g.restore();
  // 윗면 모서리에 볕(=빛) 받는 테두리
  g.strokeStyle=rgbS(T.face[0],1.15,.6);g.lineWidth=1.2;g.beginPath();g.moveTo(...tL);g.lineTo(...tF);g.stroke();g.strokeStyle=rgbS(T.face[1],1,.5);g.beginPath();g.moveTo(...tF);g.lineTo(...tR);g.stroke();
  // 고드름·종유석이 윗모서리에서 늘어진다
  for(let i=0;i<(T.ice?5:3);i++){const t=r(),x=tL[0]+(tF[0]-tL[0])*t,y=tL[1]+(tF[1]-tL[1])*t+2,l=6+r()*(T.ice?16:10);
    g.fillStyle=T.ice?'rgba(236,250,255,.85)':rgbS(T.face[0],.9,.9);g.beginPath();g.moveTo(x-2.4,y);g.lineTo(x+2.4,y);g.lineTo(x,y+l);g.fill()}
  return c}
// 돌기둥(석순): 바닥에서 솟은 뾰족한 기둥 두셋
function mkStalag(T,seed){const r=rng(seed),c=document.createElement('canvas');c.width=56;c.height=96;const g=c.getContext('2d'),B=84;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(28,B,20,8,0,0,7);g.fill();
  const n=2+(r()<.5?1:0);for(let q=0;q<n;q++){const main=q===n-1,cx=main?28+(r()-.5)*4:q?40:16,bw=main?11+r()*3:6+r()*3,ht=main?58+r()*22:24+r()*20;
    const gr=g.createLinearGradient(cx-bw,0,cx+bw,0);gr.addColorStop(0,rgbS(T.face[0]));gr.addColorStop(.45,rgbS(T.face[1]));gr.addColorStop(1,rgbS(T.face[2]));
    g.fillStyle=gr;g.beginPath();g.moveTo(cx-bw,B);for(let s=1;s<=6;s++){const t=s/6;g.lineTo(cx-bw*(1-t)+(r()-.5)*2*(1-t),B-ht*t)}for(let s=5;s>=0;s--){const t=s/6;g.lineTo(cx+bw*(1-t)+(r()-.5)*2*(1-t),B-ht*t)}g.closePath();g.fill();
    for(let k=0;k<4;k++){const y=B-ht*(.15+k*.2);g.strokeStyle=rgbS(T.face[2],.7,.35);g.lineWidth=1;g.beginPath();g.ellipse(cx,y,bw*(1-(B-y)/ht),2,0,0,Math.PI);g.stroke()}
    if(T.lava){g.fillStyle='rgba(255,140,40,.9)';g.beginPath();g.arc(cx,B-ht+3,1.8,0,7);g.fill()}
    if(T.ice){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;g.beginPath();g.moveTo(cx-bw*.5,B-4);g.lineTo(cx-1,B-ht+2);g.stroke()}}
  return c}
// 수정 덩이: 육각 기둥 너덧이 비스듬히 솟는다 (빛은 화면 효과가 따로 더한다)
function mkCrystal(T,seed){const r=rng(seed),c=document.createElement('canvas');c.width=60;c.height=84;const g=c.getContext('2d'),B=72;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(30,B,18,7,0,0,7);g.fill();
  const n=4+Math.floor(r()*3);for(let q=0;q<n;q++){const a=(q/(n-1)-.5)*1.3+(r()-.5)*.3,l=(q===Math.floor(n/2)?44:20+r()*20),w=4+r()*3,x=30+(q-n/2)*4;
    g.save();g.translate(x,B-2);g.rotate(a);const gr=g.createLinearGradient(-w,0,w,0);gr.addColorStop(0,T.cryC[0]);gr.addColorStop(.5,T.cryC[1]);gr.addColorStop(1,T.cryC[2]);
    g.fillStyle=gr;g.beginPath();g.moveTo(-w,0);g.lineTo(-w,-l);g.lineTo(0,-l-w*1.4);g.lineTo(w,-l);g.lineTo(w,0);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;g.beginPath();g.moveTo(-w*.3,-2);g.lineTo(-w*.3,-l);g.lineTo(0,-l-w*1.4);g.stroke();g.restore()}
  return c}
// 빛 그림 (미리 한 번): 빛 구멍(검정→투명)과 색 빛
const CAVE_LIGHT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.5,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c})();
const CAVE_GLOW={};
function caveGlow(col){return CAVE_GLOW[col]||(CAVE_GLOW[col]=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,`rgba(${col},.9)`);gr.addColorStop(.3,`rgba(${col},.35)`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(0,0,128,128);return c})())}
const caveVis=(x,y,m=80)=>{const p=toScreen(x,y);return p.x>-m&&p.x<W+m&&p.y>-m&&p.y<H+m*2?p:null};

// ---- 바닥 장식 (그리기 목록에 얹는다) ----
hook('drawList',list=>{if(!CAVE||!REGION().cave)return;const T=CAVE.T;
  for(const o of CAVE.decor){const p=caveVis(o.x,o.y);if(!p)continue;
    if(o.k==='pebble')list.push({L:LY.BACK,d:o.x+o.y-1,f:()=>{ctx.fillStyle=rgbS(T.face[1],.9);ctx.beginPath();ctx.ellipse(p.x,p.y,3+o.p%2,1.8,0,0,7);ctx.fill();ctx.fillStyle=rgbS(T.face[0],1,.6);ctx.fillRect(p.x-2,p.y-1.5,2,1)}});
    else if(o.k==='bone')list.push({L:LY.BACK,d:o.x+o.y-1,f:()=>{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(o.p);ctx.strokeStyle='#cfc6ae';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.stroke();
      ctx.fillStyle='#d8cfb8';for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*6,-1.2,1.8,0,7);ctx.arc(s*6,1.2,1.8,0,7);ctx.fill()}ctx.restore();
      if(o.p>4.6){ctx.fillStyle='#d6ccb2';ctx.beginPath();ctx.ellipse(p.x+8,p.y-4,5,4.4,0,0,7);ctx.fill();ctx.fillStyle='#1a1410';ctx.fillRect(p.x+5.5,p.y-5,2,2);ctx.fillRect(p.x+8.5,p.y-5,2,2)}}});
    else if(o.k==='mush')list.push({d:o.x+o.y,f:()=>{for(let i=0;i<o.n;i++){const x=p.x+(hash(i,o.p*9)-.5)*14,y=p.y+(hash(i*3,o.p*5)-.5)*6,h=4+hash(i,7)*6;
      ctx.strokeStyle='#d8d0c0';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();ctx.fillStyle=`rgba(${T.mush},.95)`;ctx.beginPath();ctx.ellipse(x,y-h,3.2,1.8,0,Math.PI,0);ctx.fill()}}})}
  for(const t of CAVE.torch){const p=caveVis(t.x,t.y);if(!p)continue;list.push({d:t.x+t.y,f:()=>{ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(p.x,p.y,9,4,0,0,7);ctx.fill();
    // 쇠 화로: 세 발 위에 그릇, 그 위 불꽃
    ctx.strokeStyle='#2a2420';ctx.lineWidth=2;for(const dx of[-6,0,6]){ctx.beginPath();ctx.moveTo(p.x+dx,p.y);ctx.lineTo(p.x+dx*.4,p.y-18);ctx.stroke()}
    poly([[p.x-9,p.y-18],[p.x+9,p.y-18],[p.x+6,p.y-24],[p.x-6,p.y-24]],lg(p.x-9,p.x+9,'#5a4a3a','#1e1814'));
    for(let i=0;i<5;i++){const ph=time*8+t.p+i*1.7,fh=12+Math.sin(ph)*4+i%2*5,x=p.x+(i-2)*2.6;const gr=ctx.createLinearGradient(0,p.y-24,0,p.y-24-fh);gr.addColorStop(0,'rgba(255,200,90,.95)');gr.addColorStop(1,'rgba(255,70,20,0)');
      ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x-3,p.y-24);ctx.quadraticCurveTo(x+Math.sin(ph)*3,p.y-24-fh*.6,x+Math.sin(ph*1.3)*2,p.y-24-fh);ctx.quadraticCurveTo(x+2,p.y-24-fh*.5,x+3,p.y-24);ctx.fill()}}})}});
// ---- 어둠 속 빛 구멍 (g_draw.js 어둠 칠할 때 부른다) ----
hook('darkLights',()=>{if(!CAVE||!REGION().cave)return;const L=(x,y,r,a)=>{lx.globalAlpha=a;lx.drawImage(CAVE_LIGHT,x-r,y-r,r*2,r*2);lx.globalAlpha=1};
  for(const c of CAVE.cry){const p=caveVis(c.x,c.y,140);if(p)L(p.x,p.y-24,110+Math.sin(time*2+c.p)*10,.75)}
  for(const t of CAVE.torch){const p=caveVis(t.x,t.y,200);if(p)L(p.x,p.y-30,230+Math.sin(time*11+t.p)*10,1)}
  for(const o of CAVE.decor)if(o.k==='mush'){const p=caveVis(o.x,o.y,60);if(p)L(p.x,p.y-6,46,.55)}
  const LV=CAVE.lava;for(let q=0;q<LV.length;q+=2){const p=caveVis(LV[q]+.5,LV[q+1]+.5,90);if(p&&(LV[q]*2+LV[q+1])%3===0)L(p.x,p.y,100,.5)}});
// ---- 어둠 위에 더하는 빛과 움직임 ----
hook('afterDark',()=>{if(!CAVE||!REGION().cave)return;const T=CAVE.T,dt=Math.min(.05,Math.max(0,time-(CAVE.lt??time)));CAVE.lt=time;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const c of CAVE.cry){const p=caveVis(c.x,c.y,100);if(!p)continue;const k=.55+.25*Math.sin(time*2+c.p);ctx.globalAlpha=k*.55;ctx.drawImage(caveGlow(T.cry),p.x-60,p.y-84,120,120);
    // 반짝임 두셋
    for(let i=0;i<3;i++){const u=frac(time*.5+hash(i,c.p*10));if(u>.25)continue;const a=Math.sin(u/.25*Math.PI);ctx.globalAlpha=a;ctx.fillStyle='#fff';const sx=p.x+(hash(i*5,c.p*7)-.5)*30,sy=p.y-20-hash(i,c.p*3)*34;ctx.fillRect(sx-.8,sy-4,1.6,8);ctx.fillRect(sx-4,sy-.8,8,1.6)}}
  for(const t of CAVE.torch){const p=caveVis(t.x,t.y,160);if(!p)continue;ctx.globalAlpha=.28+.05*Math.sin(time*13+t.p);ctx.drawImage(caveGlow('255,140,50'),p.x-130,p.y-160,260,260)}
  for(const o of CAVE.decor)if(o.k==='mush'){const p=caveVis(o.x,o.y,40);if(!p)continue;ctx.globalAlpha=.35+.15*Math.sin(time*1.5+o.p);ctx.drawImage(caveGlow(T.mush),p.x-22,p.y-28,44,44)}
  if(T.lava){const LV=CAVE.lava;for(let q=0;q<LV.length;q+=2){const p=caveVis(LV[q]+.5,LV[q+1]+.5,60);if(!p)continue;const h=hash(LV[q],LV[q+1]*7);if((LV[q]*2+LV[q+1])%3===0){ctx.globalAlpha=.09+.05*Math.sin(time*1.7+h*9);ctx.drawImage(caveGlow('255,110,30'),p.x-48,p.y-30,96,60)}
      // 거품: 부풀었다 터진다
      const u=frac(time*.6+h);if(u<.3){const a=u/.3;ctx.globalAlpha=1-a;ctx.strokeStyle='rgba(255,230,140,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(p.x+(h-.5)*24,p.y+(hash(LV[q]*3,LV[q+1])-.5)*10,2+a*5,1+a*2.5,0,0,7);ctx.stroke()}}}
  ctx.restore();
  // 물방울·불티·얼음 가루: 주인공 빛 안에서만
  const D=CAVE.drips;if(D.length<(T.lava?14:6)&&Math.random()<dt*(T.lava?9:3)){const x=P.x+(Math.random()-.5)*9,y=P.y+(Math.random()-.5)*9;if(map[Math.floor(y)]&&map[Math.floor(y)][Math.floor(x)]&&map[Math.floor(y)][Math.floor(x)].g!==6)D.push({x,y,t:0})}
  ctx.save();
  for(const d of D){d.t+=dt;const p=toScreen(d.x,d.y);
    if(T.lava){const a=1-d.t/2.2;ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,${150+80*a|0},60,${a})`;ctx.fillRect(p.x+Math.sin(d.t*4+d.x)*6,p.y-d.t*50,2,2)}
    else if(d.t<.45){const k=d.t/.45;ctx.strokeStyle=T.ice?'rgba(240,250,255,.8)':'rgba(190,225,245,.75)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(p.x,p.y-140*(1-k));ctx.lineTo(p.x,p.y-140*(1-k)+7);ctx.stroke()}
    else{const k=(d.t-.45)/.6;ctx.strokeStyle=`rgba(200,230,250,${.6*(1-k)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,3+k*12,1.5+k*5,0,0,7);ctx.stroke()}}
  CAVE.drips=D.filter(d=>d.t<(T.lava?2.2:1.05));
  // 바닥 안개: 큰 구름 그림 셋이 천천히 흐른다
  if(typeof cloudSpr==='function'){const cs=cloudSpr();ctx.globalCompositeOperation='source-over';for(let i=0;i<3;i++){const sw=W*1.1,x=(hash(i,9)*(W+sw)+time*(5+i*3))%(W+sw)-sw,y=H*(.35+i*.22)+Math.sin(time*.2+i)*12;
    ctx.globalAlpha=T.lava?.10:.13;ctx.filter='none';ctx.drawImage(cs,x,y,sw,sw/3.4)}ctx.globalAlpha=1}
  // 떠다니는 먼지: 주인공 빛 안
  const pp=toScreen(P.x,P.y);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${T.fog},.5)`;
  for(let i=0;i<34;i++){const a=hash(i,3)*6.28+time*.08*(hash(i,5)-.5),rr=30+hash(i,7)*150,x=pp.x+Math.cos(a)*rr+Math.sin(time*.3+i)*8,y=pp.y-30+Math.sin(a)*rr*.6+Math.cos(time*.25+i)*6;ctx.globalAlpha=.35+.35*Math.sin(time*1.3+i);ctx.fillRect(x,y,1.5,1.5)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // 박쥐 (종유굴만): 주인공 둘레를 크게 돌며 날갯짓
  if(!T.lava&&!T.ice)for(const b of CAVE.bats){const a=time*b.sp+b.p,x=pp.x+Math.cos(a)*b.r*TW*.8,y=pp.y-90+Math.sin(a*1.7)*b.r*14,fl=Math.sin(time*22+b.p*3);
    ctx.fillStyle='rgba(14,10,14,.9)';ctx.beginPath();ctx.ellipse(x,y,3,2.2,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-6,y-6*fl,x-12,y-2*fl);ctx.lineTo(x-7,y+1);ctx.moveTo(x,y);ctx.quadraticCurveTo(x+6,y-6*fl,x+12,y-2*fl);ctx.lineTo(x+7,y+1);ctx.fill();
    ctx.fillStyle='rgba(255,60,40,.8)';ctx.fillRect(x-1.5,y-1,1,1);ctx.fillRect(x+.5,y-1,1,1)}
  ctx.restore()});
hook('regionGen',id=>{if(!REGIONS[id].cave){CAVE=null;return}if(CAVE&&CAVE.T.lava)WATER=[]});
// ================= 동굴 지역 만들기 =================
const caveId=pid=>'cv_'+pid;
const CAVE_SPOT={};   // 바깥 지역 id → 입구 {i,j(입구 바위 칸), fx,fy(앞 칸), th}
// 동굴 지역 하나. c: {pid(바깥 지역), kind, th, n(이름), w, seed, bosses:[[종류,x,y,t]], sp:[[종류,수]] 또는 spawns}
function caveRegion(c){const T=CAVE_TH[c.th],W=c.w,mid=Math.floor(W/2),id=caveId(c.pid),out=REGIONS[c.pid];c.id=id;c.h=W;
  const deep=(x,y)=>y<W-8;   // 입구 방에는 몹을 내지 않는다
  const R={name:c.n,in:1,cave:{dark:T.dark,dk:T.dk,kind:c.kind,th:c.th,pid:c.pid},theme:'dark',size:W,gen:()=>genCave(c),bake:()=>bakeCave(c.th),zone:()=>c.n,
    spawns:c.spawns||(c.sp||[]).map(([k,n])=>[k,n,deep]),bosses:c.bosses||[],npcs:[],
    gates:[{x:mid+.5,y:W-1.6,to:c.pid,get tx(){const s=caveSpotOf(c.pid)||CAVE_SPOT[c.pid];return s?s.fx+.5:caveFallback(c.pid).x},get ty(){const s=caveSpotOf(c.pid)||CAVE_SPOT[c.pid];return s?s.fy+.5:caveFallback(c.pid).y},label:`${out?out.name:'바깥'}(으)로`,door:1,caveOut:1}]};
  REGIONS[id]=R;return R}
const caveFallback=pid=>{const g=(REGIONS[pid].gates||[])[0];return g?{x:g.x,y:g.y}:{x:(REGIONS[pid].size||40)/2,y:(REGIONS[pid].h||REGIONS[pid].size||40)/2}};
const caveTheme=(id,R)=>{const nm=R.lm?R.lm.n:R.name||'',T=terrOf(id)||{};if(R.theme==='snow'||/설|雪/.test(nm)||/snow/.test(T.key||''))return'ice';
  if(new RegExp(CV.lavaName).test(nm))return'lava';if(R.theme==='canyon'&&hash(id.length*7,id.charCodeAt(id.length-1))<.34)return'lava';return'stone'};
const CAVE_WAIT={};   // 아직 입구를 놓지 않은 바깥 지역 id → 동굴 정보 (처음 열 때 자리를 고른다)
{const hqMain=new Set(Object.values(SECTS).map(s=>hqId(s)));const HQ=CV.hyeolgyo.hq;
  for(const[id,R]of Object.entries(REGIONS)){if(R.in||R.hall||R.city||R.win||isPvFull(id)||id.startsWith('cv_')||id.startsWith('in_'))continue;
    const sect=hqMain.has(id)?Object.values(SECTS).find(s=>hqId(s)===id):null,sec=sect&&CV.secret[sect.id];
    if(id===HQ.reg){caveRegion({pid:id,kind:'hq',th:'blood',n:HQ.n,w:CV.size.hq,seed:9001,sp:HQ.sp,bosses:HQ.boss.map(([k,t],i)=>{const m=caveRooms(CV.size.hq,CV.size.hq)[i?5:2];return[k,m.x+.5,m.y+.5,t]})});CAVE_WAIT[id]='blood';continue}
    if(sec){caveRegion({pid:id,kind:'secret',th:sec,n:`${sect.n} 비동`,w:CV.size.secret,seed:7000+id.length*13,spawns:[...ownSp(sect,(x,y)=>y<CV.size.secret-8,3,1),...(CV.wild[sec]||[]).map(([k,n])=>[k,Math.ceil(n/2),(x,y)=>y<CV.size.secret-8])]});CAVE_WAIT[id]=sec;continue}
    if(!CV.mountain.includes(R.theme)||!(id.startsWith('lm_')||hqMain.has(id)||id==='sungsan'))continue;
    const th=caveTheme(id,R);caveRegion({pid:id,kind:'wild',th,n:`${R.lm?R.lm.n:R.name} ${CAVE_TH[th].suf}`,w:CV.size.wild,seed:3000+[...id].reduce((a,ch)=>a*31+ch.charCodeAt(0)&65535,7),sp:CV.wild[th]});CAVE_WAIT[id]=th}}
// 혈교 지부: 성 소굴(cave 표시) 한가운데. 소굴 자리는 부팅 때 정해져 있으니 출입구도 지금 붙인다
for(const[k,list]of Object.entries(GD.PV_LAIRS)){const F=REGIONS[pvId(k)];if(!F||!F.lairs)continue;
  for(const L of F.lairs){if(!L.cave)continue;const c=Math.floor(L.x/PV_W),r=Math.floor(L.y/PV_W),wid=pvWin(k,c,r),Wr=REGIONS[wid];if(!Wr)continue;
    const lx=Math.floor(L.x)-c*PV_W,ly=Math.floor(L.y)-r*PV_W;
    // 두목은 굴 안쪽 방으로
    const bk=L.boss[0];F.bosses=F.bosses.filter(b=>!(b[0]===bk&&Math.hypot(b[1]-L.x,b[2]-L.y)<3));Wr.bosses=Wr.bosses.filter(b=>!(b[0]===bk&&Math.hypot(b[1]+c*PV_W-L.x,b[2]+r*PV_W-L.y)<3));
    const W=CV.size.branch,m=caveRooms(W,W)[2],sp=CV.wild.blood;caveRegion({pid:wid,kind:'branch',th:L.cave,n:L.n,w:W,seed:5000+lx*7+ly*13,sp,bosses:[[bk,m.x+.5,m.y+.5,L.boss[1]]]});
    CAVE_SPOT[wid]={i:lx-1,j:ly-2,fx:lx,fy:ly-1,th:L.cave,lair:1};
    Wr.gates.push({x:lx+.5,y:ly-.5,to:caveId(wid),tx:Math.floor(W/2)+.5,ty:W-3.5,label:L.n,door:1});
  }}
// 바깥 맵을 열 때 입구 놓기: 자리는 처음 한 번 고르고 그 뒤엔 같은 자리
const NATURAL=new Set(['rock','spire','pine','tree','bamboo','maple','plum']);
function caveFindSpot(id){const R=REGIONS[id],GS=(R.gates||[]).filter(g=>!g.caveIn),r=rng(1+[...id].reduce((a,ch)=>a*33+ch.charCodeAt(0)&262143,5));
  // 출입구에서 걸어 닿는 칸
  const reach=[];for(let y=0;y<NH;y++)reach[y]=[];const q=[];
  const seed=(x,y)=>{for(let d=0;d<4;d++)for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++){const a=Math.floor(x)+i,b=Math.floor(y)+j;if(walk(a,b)&&!reach[b][a]){reach[b][a]=1;q.push([a,b]);return}}};
  for(const g of GS)seed(g.x,g.y);if(!q.length)seed(N/2,NH/2);
  while(q.length){const[x,y]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=N||Y>=NH||reach[Y][X]||!walk(X,Y))continue;reach[Y][X]=1;q.push([X,Y])}}
  const busy=(x,y)=>GS.some(g=>Math.hypot(g.x-x,g.y-y)<6)||builds.some(b=>x>=b.x-2&&x<b.x+b.w+2&&y>=b.y-2&&y<b.y+b.h+3)||(R.npcs||[]).some(n=>Math.hypot(n.x-x,n.y-y)<3)||nodes.some(n=>Math.hypot(n.x-x-.5,n.y-y-.5)<1.5);
  let best=null,bs=-1e9;
  for(let j=2;j<NH-3;j++)for(let i=2;i<N-3;i++){const fx=i+1,fy=j+1;if(!reach[fy]||!reach[fy][fx]||busy(fx+.5,fy+.5)||map[j][i].g===2)continue;
    const o=objs[j][i];if(o&&!NATURAL.has(o))continue;
    let rock=0;for(const[dx,dy]of[[-1,-1],[0,-1],[-1,0],[1,-1],[-1,1],[1,0],[0,1]]){const v=objs[j+dy]&&objs[j+dy][i+dx];if(v&&NATURAL.has(v))rock+=v==='rock'||v==='spire'?2:1}
    let cover=0;for(const[dx,dy]of[[1,2],[2,1],[2,2],[0,2],[2,0]]){const v=objs[j+dy]&&objs[j+dy][i+dx];if(v&&v!=='rock'&&!NATURAL.has(v))cover+=9}   // 입구 앞을 가리는 건물·가구 자리는 피한다
    const sc=rock*3+(o?4:0)-cover-(i+j)/(N+NH)*10+r()*3;if(sc>bs){bs=sc;best={i,j,fx,fy}}}
  return best}
// 입구 자리: 그 맵을 따로 한 번 만들어 보고 고른다(지금 맵 상태는 그대로 둔다). 처음 물을 때 한 번, 그 뒤엔 기억한 자리
function caveSpotOf(id){if(CAVE_SPOT[id]!==undefined)return CAVE_SPOT[id];if(!CAVE_WAIT[id])return null;
  const sv=[N,NH,map,objs,lamps,builds,rails,nodes,plots,tents];let s=null;
  try{const R=REGIONS[id];R.gen();
    for(const g of R.gates)if(!g.door&&!g.caveIn)for(let j=Math.floor(g.y)-2;j<=Math.floor(g.y)+2;j++)for(let i=Math.floor(g.x)-2;i<=Math.floor(g.x)+2;i++)if(j>=0&&i>=0&&j<NH&&i<N){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}   // loadRegion과 같게
    s=caveFindSpot(id);if(s)s.th=CAVE_WAIT[id]}
  finally{[N,NH,map,objs,lamps,builds,rails,nodes,plots,tents]=sv}
  return CAVE_SPOT[id]=s}
// 바깥 맵 → 동굴 출입구: 부팅 때 붙여 두고, 자리는 처음 물을 때 정한다
for(const id of Object.keys(CAVE_WAIT)){const C=REGIONS[caveId(id)],W=C.size;
  REGIONS[id].gates.push({get x(){const s=caveSpotOf(id);return s?s.fx+.5:-99},get y(){const s=caveSpotOf(id);return s?s.fy+.5:-99},to:caveId(id),tx:Math.floor(W/2)+.5,ty:W-3.5,label:C.name,door:1,caveIn:1})}
// 입구 바위와 둘레: 뒤쪽 세 칸은 바위 덩이, 앞 칸 양옆(화면에서 입구 좌우)도 바위로 감싼다. 앞 칸까지 길이 막히면 그 바위는 빼고
function caveMouth(s){const{i,j,fx,fy}=s;objs[j][i]='cmouth';if(map[j][i].g===2)map[j][i].g=6;
  const put=[[i-1,j-1],[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1]];
  for(const[x,y]of put)if(objs[y]&&objs[y][x]===null&&!(x===fx&&y===fy)&&map[y][x].g!==2){objs[y][x]='rock';
    if(!walk(fx,fy)||!caveStillReach(fx,fy))objs[y][x]=null}
  // 입구 바로 앞 두 줄의 키 큰 나무·봉우리는 걷어 굴 어귀가 보이게 (걸을 칸만 늘어난다)
  for(const[dx,dy]of[[1,2],[2,1],[2,2],[0,2],[2,0]]){const x=i+dx,y=j+dy;if(objs[y]&&NATURAL.has(objs[y][x])&&objs[y][x]!=='rock')objs[y][x]=null}
  objs[fy][fx]=null}
function caveStillReach(fx,fy){const g=(REGION().gates||[]).find(g=>!g.caveOut&&g.to&&!g.to.startsWith('cv_'));if(!g)return true;const sn=new Set([fx+','+fy]),q=[[fx,fy]];
  const gx=Math.floor(g.x),gy=Math.floor(g.y);while(q.length){const[x,y]=q.pop();if(Math.abs(x-gx)+Math.abs(y-gy)<=2)return true;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=X+','+Y;if(sn.has(k)||!walk(X,Y))continue;sn.add(k);q.push([X,Y])}}return false}
hook('regionGen',id=>{const R=REGIONS[id];
  if(R.cave)return;CAVE=null;
  if(R.win){const s=CAVE_SPOT[id];if(s&&s.lair)caveMouth(s);return}
  const s=CAVE_WAIT[id]&&caveSpotOf(id);if(s)caveMouth(s)});
// ---- 입구 그림 (테마마다) ----
const MOUTH_SPR={};
Object.defineProperty(SPRITES,'cmouth',{get:()=>{const s=CAVE_SPOT[REG],th=s?s.th:'stone';return MOUTH_SPR[th]||(MOUTH_SPR[th]=[mkMouth(CAVE_TH[th],th)])}});
function mkMouth(T,th){const r=rng(th.length*97+11),w=150,h=124,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),B=h-14,cx=w/2;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,B+2,64,18,0,0,7);g.fill();
  // 바위 언덕: 둥근 덩이 여럿을 겹친다 (뒤의 큰 것부터)
  const lump=(x,y,rx,ry,k)=>{const gr=g.createLinearGradient(x-rx,y-ry,x+rx,y+ry);gr.addColorStop(0,rgbS(T.face[0],k));gr.addColorStop(.5,rgbS(T.face[1],k));gr.addColorStop(1,rgbS(T.face[2],k));
    g.fillStyle=gr;g.beginPath();for(let a=0;a<=12;a++){const t=a/12*Math.PI*2,j=.86+r()*.2;g.lineTo(x+Math.cos(t)*rx*j,y+Math.sin(t)*ry*j)}g.closePath();g.fill();g.strokeStyle=rgbS(T.face[2],.6,.8);g.lineWidth=1;g.stroke()};
  lump(cx-22,B-58,40,34,.85);lump(cx+26,B-52,38,32,.8);lump(cx,B-72,36,30,.95);lump(cx-44,B-26,30,24,1);lump(cx+46,B-24,30,22,.9);
  // 결
  g.lineCap='round';for(let q=0;q<12;q++){const x=cx-55+r()*110,y0=B-90+r()*40,y1=y0+12+r()*26;g.strokeStyle=rgbS(T.face[2],.7,.45);g.lineWidth=1+r();g.beginPath();g.moveTo(x,y0);g.lineTo(x+(r()-.5)*5,y1);g.stroke()}
  // 굴 어귀: 아치 모양 검은 구멍, 안쪽으로 갈수록 더 검다
  const aw=24,ah=40;g.save();g.beginPath();g.moveTo(cx-aw,B);g.lineTo(cx-aw,B-ah*.55);g.quadraticCurveTo(cx-aw,B-ah,cx,B-ah);g.quadraticCurveTo(cx+aw,B-ah,cx+aw,B-ah*.55);g.lineTo(cx+aw,B);g.closePath();
  const ig=g.createRadialGradient(cx,B-8,2,cx,B-14,ah);ig.addColorStop(0,th==='lava'?'rgba(140,40,10,1)':th==='blood'?'rgba(70,6,8,1)':'rgba(6,6,8,1)');ig.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=ig;g.fill();g.restore();
  g.strokeStyle=rgbS(T.face[0],1.1,.7);g.lineWidth=2;g.beginPath();g.moveTo(cx-aw,B);g.lineTo(cx-aw,B-ah*.55);g.quadraticCurveTo(cx-aw,B-ah,cx,B-ah);g.stroke();
  // 어귀 위 종유석·고드름 이빨
  for(let q=0;q<6;q++){const x=cx-aw+6+q*(aw*2-12)/5,y=B-ah+2+Math.abs(x-cx)*.35,l=4+r()*(T.ice?12:7);g.fillStyle=T.ice?'rgba(236,250,255,.9)':rgbS(T.face[0],.85);g.beginPath();g.moveTo(x-2.5,y);g.lineTo(x+2.5,y);g.lineTo(x,y+l);g.fill()}
  // 테마 덧칠: 눈 모자, 이끼, 피 묻은 깃발과 해골
  if(T.ice){g.fillStyle='rgba(244,248,255,.95)';for(const[x,y,rx]of[[cx,B-96,30],[cx-26,B-84,24],[cx+28,B-78,22]]){g.beginPath();g.ellipse(x,y,rx,9,0,Math.PI,0);g.fill()}}
  else if(!T.lava){g.fillStyle=`rgba(${T.moss.join(',')},.7)`;for(let q=0;q<18;q++){g.beginPath();g.ellipse(cx-56+r()*112,B-90+r()*70,2+r()*4,1.2+r()*2,0,0,7);g.fill()}}
  if(th==='blood'||th==='shadow'){for(const s of[-1,1]){const x=cx+s*(aw+10);g.strokeStyle='#2a1a10';g.lineWidth=2.4;g.beginPath();g.moveTo(x,B+2);g.lineTo(x,B-58);g.stroke();
      g.fillStyle=th==='blood'?'#8a1010':'#3a1a5a';g.beginPath();g.moveTo(x,B-56);g.lineTo(x+s*14,B-52);g.lineTo(x+s*12,B-32);g.lineTo(x,B-36);g.closePath();g.fill()}
    g.fillStyle='#d6ccb2';g.beginPath();g.ellipse(cx,B-ah-6,6,5,0,0,7);g.fill();g.fillStyle='#1a1410';g.fillRect(cx-3.5,B-ah-8,2.4,2.4);g.fillRect(cx+1,B-ah-8,2.4,2.4)}
  return c}
// 입구 앞: 굴에서 새어 나오는 기운 (테마 색), 밤에는 빛 구멍
hook('drawList',list=>{const s=CAVE_SPOT[REG];if(!s||REGION().cave||objs[s.j]&&objs[s.j][s.i]!=='cmouth')return;const p=caveVis(s.i+.5,s.j+.5,120);if(!p)return;const T=CAVE_TH[s.th];
  list.push({L:LY.FX,d:s.i+s.j+1.2,f:()=>{ctx.save();ctx.globalCompositeOperation='lighter';const k=.5+.2*Math.sin(time*1.6);ctx.globalAlpha=k*(T.lava||s.th==='blood'?.5:.25);
    ctx.drawImage(caveGlow(T.lava?'255,120,40':s.th==='blood'?'220,40,30':T.fog),p.x-40,p.y-30,80,56);ctx.restore();
    // 어귀에서 흘러나오는 안개 (얼음굴은 찬 김, 화굴은 열기)
    ctx.fillStyle=`rgba(${T.fog},.18)`;for(let q=0;q<5;q++){const u=frac(time*.25+q/5),x=p.x+(q-2)*6+Math.sin(time+q)*4,y=p.y+6+u*14;ctx.globalAlpha=(1-u)*.8;ctx.beginPath();ctx.ellipse(x-u*10,y,6+u*12,3+u*4,0,0,7);ctx.fill()}ctx.globalAlpha=1}})});
hook('darkLights',()=>{const s=CAVE_SPOT[REG];if(!s||REGION().cave)return;const T=CAVE_TH[s.th];if(!(T.lava||s.th==='blood'||s.th==='shadow'))return;const p=caveVis(s.i+.5,s.j+.5,160);if(p){lx.globalAlpha=.7;lx.drawImage(CAVE_LIGHT,p.x-90,p.y-110,180,180);lx.globalAlpha=1}});
// ---- 동굴 보물상자: 한 생에 동굴마다 한 번 ----
function caveChestOpen(n){P.caveGot=P.caveGot||{};if(P.caveGot[n.cave]){n.cd=99999;log('비어 있는 상자입니다.','info');return}
  const C=REGIONS[n.cave],kind=C&&C.cave.kind||'wild',q=(CV.lootQ[kind]||1)*(.85+Math.random()*.3),e=wpick(CV.loot);let it=null;
  if(e.t==='silver'){const v=Math.round(R1(e.n[0],e.n[1])*q);P.silver+=v;log(`동굴 상자에서 은자 ${v}을(를) 찾았다.`,'sys');addText(P.x,P.y,`은자 ${v}`,'#e8c66e')}
  else if(e.t==='potion'){const v=R1(e.n[0],e.n[1]);addMat('금창약',v);log(`동굴 상자에서 금창약 ${v}개를 찾았다.`,'sys')}
  else if(e.t==='ore'){const v=R1(e.n[0],e.n[1]);addMat('광석',v);log(`동굴 상자에서 광석 ${v}개를 찾았다.`,'sys')}
  else if(e.t==='book'){const cls=P.eq&&P.eq.weapon?P.eq.weapon.cls:'권',ids=Object.keys(ARTS).filter(k=>ARTS[k].cls===cls&&ARTS[k].forms);const id=ids.length?pick(ids):null;it=id?mkBook(id,Math.floor(Math.random()*Math.min(2,ARTS[id].forms.length))):null}
  if(e.t==='gear'||(e.t==='book'&&!it)){const cls=P.eq&&P.eq.weapon?P.eq.weapon.cls:'검',r=Math.random();it=r<.45?mkWeapon(cls,q,0):r<.75?mkGear('armor',pick(['마의','피갑','흑철갑']),q,{hp:26,def:4}):mkGear('acc',pick(['옥패','호신부','염주']),q,{qi:24,hm:5})}
  if(it){if(P.bag.length>=24){log('행낭이 가득 찼다. 자리를 비우고 다시 열어라.','info');return}P.bag.push(it);log(`동굴 상자에서 ${itemLabel(it)}을(를) 찾았다.`,it.slot==='book'?'xp':'sys')}
  P.caveGot[n.cave]=1;n.cd=99999;if(kind!=='wild')feat(`${C.name}의 보물상자를 열었다`)}
function drawCaveChest(n){const p=toScreen(n.x,n.y),open=n.cd>0;ctx.save();ctx.translate(p.x,p.y);
  if(!open){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4+.2*Math.sin(time*3);ctx.drawImage(caveGlow('255,210,120'),-30,-44,60,60);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,0,14,6,0,0,7);ctx.fill();
  poly([[-13,-1],[11,-1],[13,-14],[-11,-14]],lg(-13,13,'#6a4426','#2a180a'));
  if(open)poly([[-11,-14],[13,-14],[11,-26],[-13,-24]],'#3a2210');else poly([[-11,-14],[13,-14],[11,-20],[-9,-20]],'#8a5a30');
  ctx.strokeStyle='#5a5048';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-12,-8);ctx.lineTo(12,-8);ctx.stroke();ctx.fillStyle='#c9a14a';ctx.fillRect(-2,-13,4,4);ctx.restore()}

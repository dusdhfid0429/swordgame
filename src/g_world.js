// ---------- world: 개봉 성내 at the centre, 황하 to the north with 숭산 forest and the 혈교 cave beyond,
// farmland and house lots to the west, 흑풍채 bandit camp to the east, grassland and bamboo to the south ----------
// ground: 0 grass, 1 road, 2 river, 3 bridge, 4 granite plaza, 5 farmland, 6 cave stone, 7 trampled camp dirt
let REG='gaebong';   // 지금 서 있는 지역 (g_region.js)
const TOWN={x0:14,y0:14,x1:27,y1:27};
const inTown=(x,y)=>REG==='gaebong'&&x>=TOWN.x0&&x<=TOWN.x1&&y>=TOWN.y0&&y<=TOWN.y1;
const RIV=9;const isRiver=y=>y===RIV||y===RIV+1;
const inBamboo=(x,y)=>REG==='gaebong'&&x>=2&&x<=11&&y>=29&&y<=37;
const inCave=(x,y)=>REG==='gaebong'&&x>=2&&x<=10&&y>=1&&y<=7;
const inCamp=(x,y)=>REG==='gaebong'&&x>=30&&x<=38&&y>=13&&y<=31;
const inFarm=(x,y)=>REG==='gaebong'&&x>=3&&x<=10&&y>=15&&y<=22;
const LOTS=[{x:3,y:24,w:3,h:2},{x:8,y:24,w:3,h:2}];
const inLot=(x,y)=>LOTS.some(l=>x>=l.x&&x<l.x+l.w&&y>=l.y&&y<l.y+l.h);
const ARENA={x:23.5,y:19.6,r:1.6};
let nodes=[],plots=[],tents=[];
function regionAt(x,y){
  if(REG!=='gaebong')return REGIONS[REG].zone(x,y);
  if(inCave(x,y))return'혈교 동굴';if(y<RIV)return x>26?'숭산 깊은 숲':'숭산 기슭';if(y<=RIV+1)return'황하 나루';
  if(inTown(x,y))return'개봉 성내';if(inCamp(x,y)||x>=29)return'흑풍채';if(x<=12&&y<=27)return'개봉 서쪽 농지';if(inBamboo(x,y))return'남쪽 대숲';return'남쪽 초원'}
function genGaebong(){
  const r=rng(1987);map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  for(let y=0;y<N;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){
    let g=isRiver(y)?2:0,o=null;
    if((x===MID&&!inCave(x,y))||(y===MID&&x>1&&x<N-2))g=g===2?3:1;
    if(y===24&&x>2&&x<TOWN.x0)g=1;
    if(inTown(x,y))g=4;if(inFarm(x,y))g=5;if(inCave(x,y))g=6;if(inCamp(x,y)&&g===0)g=7;
    const edge=x<=1||y<=1||x>=N-2||y>=N-2;
    if(x===0||y===0||x===N-1||y===N-1)o=r()<.5?'pine':'tree';
    else if(edge&&g!==2)o=r()<.7?(r()<.5?'pine':'tree'):null;
    else if(g===0&&!inLot(x,y)&&!(y>=RIV+2&&y<=RIV+3)){
      if(inBamboo(x,y)){if(r()<.42)o='bamboo'}
      else if(y<RIV){const v=r();if(v<(x>26?.16:.1))o=r()<.5?'pine':'tree';else if(v<.13)o='rock'}
      else if(!inTown(x,y)&&Math.hypot(x-MID,y-MID)>9){const v=r();if(v<.03)o='tree';else if(v<.05)o='pine';else if(v<.065)o='rock'}}
    map[y][x]={g,v:r()};objs[y][x]=o;
  }}
  // cave: ring of boulders with an opening facing the road
  for(let y=0;y<=8;y++)for(let x=1;x<=11;x++){const ring=x===1||x===11||y===0||y===8;if(ring&&!(y===8&&(x===6||x===7)))objs[y][x]='rock';else if(!ring)objs[y][x]=null}
  for(const[x,y]of[[4,3],[8,5],[3,6]])objs[y][x]='rock';
  // town buildings, each with a keeper standing at its door
  for(const b of[{x:15,y:15,w:3,h:2,kind:'inn'},{x:22,y:15,w:3,h:2,kind:'smith'},{x:25,y:15,w:2,h:2,kind:'hall'},{x:15,y:22,w:2,h:3,kind:'house'},{x:22,y:22,w:2,h:2,kind:'house'},{x:25,y:22,w:2,h:3,kind:'temple'}]){
    for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)objs[j][i]='B';builds.push(b)}
  [[18,22,'#a3271c'],[17,18,'#2f5f8f']].forEach(([x,y,c])=>{objs[y][x]='stall';map[y][x].cloth=c});
  objs[18][21]='board';
  for(const[x,y]of[[19,13],[21,13],[13,19],[13,21],[19,28],[21,28],[28,19],[28,21],[19,8],[24,26],[16,26]]){objs[y][x]='lamp';if(map[y][x].g!==4)map[y][x].g=0;lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  for(const[x,y]of[[5,7],[9,2]]){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  for(let y=0;y<N;y++)if(map[y][MID].g===3){rails.push({x:MID,y});rails.push({x:MID+1,y})}
  // bandit tents
  for(const[x,y]of[[32,15],[35,16],[33,19],[36,23],[32,26],[35,28],[37,19]]){objs[y][x]='tent';tents.push({x,y})}
  for(let y=15;y<=22;y++)for(let x=3;x<=10;x++)if(map[y][x].g===5&&(x+y)%1===0)plots.push({x,y,crop:null,g:0,dead:0});
  // gathering spots (walkable; they regrow)
  const put=(t,x,y)=>{if(walk(x,y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  for(let i=0;i<220&&nodes.filter(n=>n.t==='herb').length<16;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if(!inTown(x,y)&&map[y][x].g===0&&!inFarm(x,y))put('herb',x,y)}
  for(let i=0;i<220&&nodes.filter(n=>n.t==='ore').length<10;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if((y<RIV&&x<16)||inCave(x,y)||(y>30&&x>25))put('ore',x,y)}
  for(let i=0;i<220&&nodes.filter(n=>n.t==='wood').length<10;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if((y<RIV||inBamboo(x,y))&&!inCave(x,y)&&map[y][x].g===0)put('wood',x,y)}
  for(const x of[6,13,27,33])put('fish',x,RIV+2);
  put('chest',5,2);
}
const walk=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&map[y][x].g!==2&&!objs[y][x];
const walkAt=(fx,fy)=>walk(Math.floor(fx),Math.floor(fy));
const tileG=(x,y)=>{x=Math.max(0,Math.min(N-1,Math.floor(x)));y=Math.max(0,Math.min(N-1,Math.floor(y)));return map[y][x].g};
const iso=(gx,gy)=>({x:(gx-gy)*TW/2,y:(gx+gy)*TH/2});
const toScreen=(gx,gy)=>{const p=iso(gx,gy);return{x:p.x-cam.x+W/2,y:p.y-cam.y+H/2}};
function toGrid(sx,sy){const wx=sx/S-W/2+cam.x,wy=sy/S-H/2+cam.y;const a=wx/(TW/2),b=wy/(TH/2);return{x:(a+b)/2,y:(b-a)/2}}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const frac=v=>v-Math.floor(v);

function bakeGaebong(){
  const gw=N*TW,gh=N*TH,c=document.createElement('canvas');c.width=gw;c.height=gh;
  const g=c.getContext('2d'),img=g.createImageData(gw,gh),d=img.data;
  for(let py=0;py<gh;py++)for(let px=0;px<gw;px++){
    const a=(px-gw/2)/(TW/2),b=py/(TH/2),gx=(a+b)/2,gy=(b-a)/2;
    if(gx<0||gy<0||gx>=N||gy>=N)continue;
    const hard=tileG(gx,gy),soft=hard===3||hard===4||hard===5;
    const jx=soft?gx:gx+(vn(gx*2.3,gy*2.3)-.5)*.5,jy=soft?gy:gy+(vn(gx*2.3+9,gy*2.3+4)-.5)*.5;
    const t=soft?hard:tileG(jx,jy),n=fbm(gx*1.3,gy*1.3),grain=.92+hash(px,py)*.16;
    let R,G,B;
    if(t===2){
      const shore=[[.2,0],[-.2,0],[0,.2],[0,-.2]].some(([ox,oy])=>{const q=tileG(jx+ox,jy+oy);return q!==2&&q!==3});
      if(shore){R=118+n*20;G=104+n*16;B=78+n*12}
      else{const dep=Math.min(1,Math.min(jy-RIV,RIV+2-jy)*2),w=fbm(gx*2,gy*5);R=92-dep*42+w*14;G=112-dep*40+w*16;B=96-dep*20+w*14}
    }else if(t===3){
      R=136;G=96;B=60;const gr=vn(gx*40,gy*4);R*=.8+gr*.35;G*=.8+gr*.35;B*=.8+gr*.3;
      if(frac(gy*4)<.1){R*=.45;G*=.45;B*=.45}
      const ex=frac(gx);if(ex<.1||ex>.9){R*=.7;G*=.65;B*=.6}
    }else if(t===4){
      const sx=gx*2+(Math.floor(gy*2)%2)*.5,sy=gy*2,fx2=frac(sx),fy2=frac(sy),h=hash(Math.floor(sx)*7,Math.floor(sy)*13);
      const tone=.84+h*.22,m=Math.min(fx2,1-fx2,fy2,1-fy2);
      R=170*tone;G=164*tone;B=150*tone;R+=(n-.5)*14;G+=(n-.5)*14;B+=(n-.5)*12;
      if(m<.05){R=92;G=88;B=80;if(vn(gx*6,gy*6)>.62){R=78;G=104;B=60}}
      else if(fx2<.12||fy2<.12){R*=1.06;G*=1.06;B*=1.05}
    }else if(t===5){
      R=104+n*24;G=78+n*18;B=52+n*12;const fr=frac(gy*3);if(fr<.22){R*=.7;G*=.68;B*=.66}else if(fr<.32){R*=1.12;G*=1.1;B*=1.08}
      const ex=Math.min(frac(gx),1-frac(gx),frac(gy),1-frac(gy));if(ex<.04){R=70;G=96;B=46}
    }else if(t===6){
      const k=vn(gx*3,gy*3);R=58+n*22+k*10;G=54+n*20+k*8;B=52+n*18+k*8;if(hash(px*3,py*7)>.985){R+=30;G+=28;B+=26}
    }else if(t===7){
      R=132+n*30;G=108+n*24;B=78+n*18;if(vn(gx*5,gy*5)>.7){R*=.86;G*=.84;B*=.8}
    }else if(t===1){
      R=152+n*34;G=128+n*28;B=94+n*20;
      const across=Math.floor(jx)===MID?frac(gx):frac(gy),rut=Math.min(Math.abs(across-.35),Math.abs(across-.65));
      if(rut<.05){R*=.82;G*=.8;B*=.78}
      if(hash(px*5,py*3)>.992){R+=40;G+=38;B+=34}
    }else{
      const big=vn(gx*.18,gy*.18),north=gy<RIV?.8:1;
      R=(62+n*40+big*24)*north;G=100+n*46+big*10;B=40+n*18;
      const dirt=fbm(gx*.45+20,gy*.45);
      if(dirt>.6){const k=Math.min(1,(dirt-.6)*5);R+=(128-R)*k;G+=(106-G)*k;B+=(72-B)*k}
    }
    const fade=Math.min(1,Math.min(gx,gy,N-gx,N-gy)/1.6);
    const i=(py*gw+px)*4;d[i]=R*grain*fade;d[i+1]=G*grain*fade;d[i+2]=B*grain*fade;d[i+3]=255;
  }
  g.putImageData(img,0,0);
  const r=rng(77),sp=(gx,gy)=>[(gx-gy)*TW/2+gw/2,(gx+gy)*TH/2];
  g.lineCap='round';
  for(let k=0;k<26000;k++){const gx=1+r()*(N-2),gy=1+r()*(N-2);if(tileG(gx,gy)!==0)continue;const[x,y]=sp(gx,gy),l=r();
    g.strokeStyle=`hsla(${80+r()*30},${35+r()*20}%,${l<.5?20+r()*12:42+r()*16}%,.7)`;g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*3,y-2-r()*4);g.stroke()}
  const FL=['#f2efe6','#f3d24a','#e98fb0','#a98be0','#f08a4b'];
  for(let k=0;k<2400;k++){const gx=1+r()*(N-2),gy=1+r()*(N-2);if(tileG(gx,gy)!==0||vn(gx*.6+40,gy*.6)<.58)continue;const[x,y]=sp(gx,gy);
    g.fillStyle=FL[Math.floor(r()*FL.length)];g.beginPath();g.arc(x,y,1.1+r()*.8,0,7);g.fill()}
  for(let k=0;k<700;k++){const gx=r()*N,gy=RIV+(r()<.5?-.05+r()*.25:1.8+r()*.25);if(tileG(gx,gy)===3)continue;const[x,y]=sp(gx,gy),s=1.5+r()*3;
    g.fillStyle=`hsl(40,6%,${42+r()*25}%)`;g.beginPath();g.ellipse(x,y,s*1.4,s*.8,0,0,7);g.fill()}
  // arena ring in the plaza
  {const[x,y]=sp(ARENA.x,ARENA.y);g.strokeStyle='rgba(120,30,20,.75)';g.lineWidth=4;g.beginPath();g.ellipse(x,y,ARENA.r*TW/2*1.41,ARENA.r*TH/2*1.41,0,0,7);g.stroke();
    g.strokeStyle='rgba(230,200,140,.4)';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y,ARENA.r*TW/2*1.41-5,ARENA.r*TH/2*1.41-2.5,0,0,7);g.stroke()}
  // house lots: staked outlines
  for(const l of LOTS){const pts=[sp(l.x,l.y),sp(l.x+l.w,l.y),sp(l.x+l.w,l.y+l.h),sp(l.x,l.y+l.h)];g.setLineDash([5,4]);g.strokeStyle='rgba(230,210,160,.6)';g.lineWidth=1.5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.stroke();g.setLineDash([])}
  return c;
}

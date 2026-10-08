// ================= 지역(맵)과 이동 =================
// 지역마다 40×40 격자 한 장. 지역 사이는 출입구(gate)로 잇는다. 설계는 docs/맵이동_설계.md 참고.
// 지역 정의: name, gen()(map·objs·nodes 등을 채움), bake()(바닥 그림), zone(x,y)(작은 구역 이름), spawns, bosses, gates
// 출입구: {x,y,to,tx,ty,label} — (x,y)에 닿으면 to 지역의 (tx,ty)에 선다.
// 숭산 돌계단 길(아래 끝은 x=20)과 계곡물 줄기
const SS_PATH=y=>20+Math.round(4*Math.sin((39-y)*.22)*Math.min(1,(39-y)/5));
const SS_STREAM=x=>24+Math.round(1.5*Math.sin(x*.3));
const REGIONS={
  gaebong:{name:'개봉',gen:genGaebong,bake:bakeGaebong,zone:null,spawns:null,
    bosses:[['흑풍채주',35.5,22.5,150],['혈교장로',6.5,4.5,240]],
    gates:[{x:20.5,y:1.2,to:'sungsan',tx:20.5,ty:36.4,label:'숭산 산중'}]},
  sungsan:{name:'숭산',gen:genSungsan,bake:bakeSungsan,
    zone:(x,y)=>y>=31?'숭산 산문':y<=9&&x>=14&&x<=26?'산정 암자':y<=13?'숭산 설봉':'숭산 산중',
    spawns:[['늑대',6,(x,y)=>y<30&&y>12],['곰',2,(x,y)=>y<24&&y>12],['호랑이',2,(x,y)=>y<20],['사슴',4,(x,y)=>y>18],
      ['산적',5,(x,y)=>y>=22&&y<=30&&Math.abs(x-SS_PATH(y))<6],['산적궁수',2,(x,y)=>y>=22&&y<=30&&Math.abs(x-SS_PATH(y))<6],['혈교무인',2,(x,y)=>y<=12&&x>27]],
    bosses:[['산적두목',SS_PATH(26)+2.5,26.5,120]],
    gates:[{x:20.5,y:38.6,to:'gaebong',tx:20.5,ty:3.2,label:'개봉'}]}};
const REGION=()=>REGIONS[REG];
const GROUND={};let GAE_PLOTS=null;
// 지역을 불러온다: 격자를 만들고, 바닥 그림은 한 번만 굽고, 밭은 개봉에만 있고 계속 자란다
function loadRegion(id){
  REG=id;const R=REGION();R.gen();
  for(const g of R.gates)for(let j=Math.floor(g.y)-2;j<=Math.floor(g.y)+2;j++)for(let i=Math.floor(g.x)-2;i<=Math.floor(g.x)+2;i++)if(j>=0&&i>=0&&j<N&&i<N){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}
  if(id==='gaebong'){if(GAE_PLOTS)plots=GAE_PLOTS;else GAE_PLOTS=plots;if(G.house&&G.house.built)buildHouse()}
  // 바닥 그림은 한 장에 약 13MB라, 지금 지역과 바로 전 지역 것만 남긴다 (휴대폰 메모리)
  ground=GROUND[id]||(GROUND[id]=R.bake());for(const k in GROUND)if(k!==id&&k!==loadRegion.prev)delete GROUND[k];loadRegion.prev=id;miniBase=null;
}
// 출입구를 지나 다른 지역으로 간다. 짐승·제자·말은 따라오고, 몹·떨어진 물건은 그 지역에 두고 간다.
const FADE=document.createElement('div');FADE.className='fade';$('stage').appendChild(FADE);
function travel(g){
  if(P.traveling)return;P.traveling=1;FADE.classList.add('on');
  setTimeout(()=>{
    mobs=[];drops=[];eprojs=[];fx=[];G.giyeon=null;
    loadRegion(g.to);P.reg=g.to;P.x=g.tx;P.y=g.ty;P.path=null;P.target=null;P.goal=null;P.talk=null;P.gateLock=1;
    allies.forEach((a,i)=>{a.x=P.x+(i%2?.8:-.8);a.y=P.y+.6+i*.3;a.path=null;a.tgt=null});
    const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;spawnTick();spawnTick();
    showBanner(REGION().name,regionAt(Math.floor(P.x),Math.floor(P.y)));log(`${REGION().name}(으)로 왔습니다.`,'sys');
    saveGame(true);FADE.classList.remove('on');P.traveling=0;
  },320);
}
function gateTick(){
  if(!P||P.hp<=0||G.duel)return;
  if((P.reg||'gaebong')!==REG){loadRegion(P.reg||'gaebong');return}
  const gs=REGION().gates;
  // 도착한 출입구에서 한 번 벗어나야 다시 쓸 수 있다 (오자마자 되돌아가지 않게)
  if(P.gateLock){if(gs.every(g=>dist(g,P)>1.8))P.gateLock=0;return}
  for(const g of gs)if(dist(g,P)<.8){travel(g);return}
}
function drawGate(g){
  const p=toScreen(g.x,g.y);ctx.save();ctx.translate(p.x,p.y);
  // 땅에 빛나는 길표시
  const a=.45+.25*Math.sin(time*3);ctx.strokeStyle=`rgba(255,220,140,${a})`;ctx.lineWidth=2;
  for(let k=0;k<3;k++){const s=1-k*.25;ctx.beginPath();ctx.ellipse(0,0,26*s,13*s,0,0,7);ctx.stroke()}
  // 이정표
  ctx.fillStyle='#4a3420';ctx.fillRect(18,-34,4,36);ctx.fillStyle='#8a6a40';ctx.strokeStyle='#2a1a0e';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(6,-36);ctx.lineTo(40,-36);ctx.lineTo(46,-30);ctx.lineTo(40,-24);ctx.lineTo(6,-24);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
  ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';const s=`${g.label} 가는 길`;
  ctx.fillStyle='#000';ctx.fillText(s,p.x+1,p.y-41);ctx.fillStyle='#ffe2a0';ctx.fillText(s,p.x,p.y-42);
}

// ---------- 숭산: 개봉 북쪽 산. 굽이진 돌계단 길, 계곡물, 바위 벼랑, 꼭대기는 눈과 암자 ----------
// ground: 0 산풀, 1 돌계단, 2 계곡물, 3 다리, 4 암자 마당, 6 바위땅, 8 눈
function genSungsan(){
  const r=rng(4242);map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  for(let y=0;y<N;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){
    const px=SS_PATH(y),onPath=x===px||x===px+1,sy=SS_STREAM(x),stream=y===sy||y===sy+1;
    let g=0,o=null;const hi=fbm(x*.18+3,y*.18);
    if(y<=13)g=8;else if(hi>.62)g=6;
    if(stream)g=2;if(onPath)g=stream?3:1;
    const temple=x>=15&&x<=25&&y>=3&&y<=9;if(temple)g=4;
    const edge=x<=1||y<=1||x>=N-2||y>=N-2;
    if(x===0||y===0||x===N-1||y===N-1)o=r()<.5?'pine':'rock';
    else if(edge&&!stream)o=r()<.75?(r()<.6?'pine':'rock'):null;
    else if(!onPath&&!stream&&!temple&&Math.abs(x-px)>1){const v=r(),cliff=fbm(x*.3+11,y*.3+5);
      if(cliff>.66)o='rock';else if(v<(g===8?.12:.17))o='pine';else if(v<.2&&g!==8)o='tree';else if(v<.23)o='rock'}
    map[y][x]={g,v:r()};objs[y][x]=o;
  }}
  // 산정 암자와 등롱
  const b={x:19,y:4,w:3,h:2,kind:'temple'};for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)objs[j][i]='B';builds.push(b);
  for(const[x,y]of[[17,7],[23,7],[SS_PATH(30)-2,31],[SS_PATH(30)+2,31]]){if(map[y][x].g!==4)map[y][x].g=1;objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  for(let x=0;x<N;x++){const y=SS_STREAM(x);for(const yy of[y,y+1])if(map[yy][x].g===3)rails.push({x,y:yy})}
  const put=(t,x,y)=>{if(walk(x,y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  for(let i=0;i<300&&nodes.filter(n=>n.t==='herb').length<14;i++){const x=2+Math.floor(r()*(N-4)),y=10+Math.floor(r()*(N-12));if(map[y][x].g===0)put('herb',x,y)}
  for(let i=0;i<300&&nodes.filter(n=>n.t==='ore').length<12;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if(map[y][x].g===6||map[y][x].g===8)put('ore',x,y)}
  for(let i=0;i<300&&nodes.filter(n=>n.t==='wood').length<9;i++){const x=2+Math.floor(r()*(N-4)),y=12+Math.floor(r()*(N-14));if(map[y][x].g===0)put('wood',x,y)}
  for(const x of[6,12,30,34])put('fish',x,SS_STREAM(x)+2);
}
function bakeSungsan(){
  const gw=N*TW,gh=N*TH,c=document.createElement('canvas');c.width=gw;c.height=gh;
  const g=c.getContext('2d'),img=g.createImageData(gw,gh),d=img.data;
  for(let py=0;py<gh;py++)for(let px=0;px<gw;px++){
    const a=(px-gw/2)/(TW/2),b=py/(TH/2),gx=(a+b)/2,gy=(b-a)/2;
    if(gx<0||gy<0||gx>=N||gy>=N)continue;
    const hard=tileG(gx,gy),soft=hard===1||hard===3||hard===4;
    const jx=soft?gx:gx+(vn(gx*2.3,gy*2.3)-.5)*.6,jy=soft?gy:gy+(vn(gx*2.3+9,gy*2.3+4)-.5)*.6;
    const t=soft?hard:tileG(jx,jy),n=fbm(gx*1.3,gy*1.3),grain=.92+hash(px,py)*.16;
    let R,G,B;
    if(t===2){const w=fbm(gx*2.5,gy*4);R=70+w*30;G=104+w*30;B=118+w*26;if(vn(gx*7,gy*7)>.78){R=196;G=214;B=220}}
    else if(t===3){R=136;G=96;B=60;const gr=vn(gx*40,gy*4);R*=.8+gr*.35;G*=.8+gr*.35;B*=.8+gr*.3;if(frac(gx*4)<.1){R*=.45;G*=.45;B*=.45}}
    else if(t===1){const st=frac(gy*2),h=hash(Math.floor(gx*2),Math.floor(gy*2));R=(126+n*22)*(.88+h*.2);G=(120+n*20)*(.88+h*.2);B=(110+n*18)*(.88+h*.2);if(st<.08){R*=.6;G*=.6;B*=.6}}
    else if(t===4){const sx=gx*2+(Math.floor(gy*2)%2)*.5,sy=gy*2,f1=frac(sx),f2=frac(sy),h=hash(Math.floor(sx)*7,Math.floor(sy)*13),tone=.84+h*.22,m=Math.min(f1,1-f1,f2,1-f2);
      R=168*tone;G=162*tone;B=152*tone;if(m<.05){R=96;G=92;B=86}}
    else if(t===6){const k=vn(gx*3,gy*3);R=96+n*30+k*14;G=94+n*28+k*12;B=90+n*26+k*12;if(vn(gx*9,gy*9)>.72){R*=.7;G*=.7;B*=.72}}
    else if(t===8){const k=fbm(gx*.6,gy*.6);R=212+n*26-k*18;G=220+n*24-k*14;B=232+n*18-k*6;if(vn(gx*5+3,gy*5)>.8){R-=60;G-=56;B-=46}}
    else{const big=vn(gx*.2,gy*.2);R=44+n*34+big*16;G=80+n*40+big*14;B=46+n*20;const dirt=fbm(gx*.5+20,gy*.5);if(dirt>.62){const k=Math.min(1,(dirt-.62)*5);R+=(100-R)*k;G+=(94-G)*k;B+=(80-B)*k}}
    const fade=Math.min(1,Math.min(gx,gy,N-gx,N-gy)/1.6);
    const i=(py*gw+px)*4;d[i]=R*grain*fade;d[i+1]=G*grain*fade;d[i+2]=B*grain*fade;d[i+3]=255;
  }
  g.putImageData(img,0,0);
  const r=rng(91),sp=(gx,gy)=>[(gx-gy)*TW/2+gw/2,(gx+gy)*TH/2];g.lineCap='round';
  for(let k=0;k<18000;k++){const gx=1+r()*(N-2),gy=1+r()*(N-2);if(tileG(gx,gy)!==0)continue;const[x,y]=sp(gx,gy),l=r();
    g.strokeStyle=`hsla(${95+r()*30},${25+r()*20}%,${l<.5?16+r()*10:34+r()*14}%,.7)`;g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*3,y-2-r()*4);g.stroke()}
  for(let k=0;k<900;k++){const gx=r()*N,gy=r()*N,t=tileG(gx,gy);if(t!==6&&t!==8&&!(t===0&&r()<.15))continue;const[x,y]=sp(gx,gy),s=1.5+r()*3.5;
    g.fillStyle=`hsl(210,6%,${t===8?62+r()*20:36+r()*22}%)`;g.beginPath();g.ellipse(x,y,s*1.4,s*.8,0,0,7);g.fill()}
  return c;
}

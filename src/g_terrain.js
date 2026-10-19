// ================= 지역별 지형 개성 (사용자 2026-10-19 v155) =================
// "화산 이런 식의 깎아지르는 듯한 돌산… 지명을 검색해서 실제 이미지를 확인한 다음 지역별 특색을 살려줘. 사막은 지형 이펙트, 물은 일렁거림"
// data/terrain.json TERR: place(지명 조각 → 지형), th(지역 테마 기본값). loadRegion이 바닥을 굽기 전에 regionGen 훅에서 TP를 정한다
// - 바위 칸 색·결(streak 세로 절리, strata 지층, round 둥근 풍화, scree 돌부스러기), 풀·물 색, 가장자리 구름바다(mist)는 bakeHQ가 TP를 읽어 굽는다: 매 프레임 비용 0
// - spire: 맵에 이미 있던 바위(와 뒤쪽 가장자리 나무)를 깎아지른 봉우리 그림으로 바꾼다. 자리만 바꾸므로 걷는 길·막힌 칸은 그대로
// - 화면 효과(g_draw.js가 부른다): 물 칸 반짝임(terrWater), 모래바람·아지랑이·떠도는 구름(terrSky). 모두 한 번에 묶어 그리는 선이라 싸다
var TP=null,WATER=[];
const TERR=GD.TERR,SPIRE=GD.SPIRE;
function terrOf(id){const R=REGIONS[id];if(!R||R.in||R.hall)return null;
  const nm=R.hq&&SECTS[R.hq]?hqPlace(SECTS[R.hq]):R.lm?R.lm.n:R.name||'',th=TERR.th[R.theme];
  for(const k in TERR.place)if(nm.includes(k))return{...th,...TERR.place[k],key:k};
  return th?{...th,key:R.theme}:null}
// 봉우리: 안쪽 바위는 spireN, 뒤쪽 가장자리(화면 위쪽 두 변) 바위·나무는 edge 몫만큼. 앞쪽(화면 아래) 세 줄은 시야를 가리니 그대로
function terrSpires(T){if(!T||!T.spire)return;const r=rng(4400+N*7+NH*13+T.key.length*97+T.key.charCodeAt(0));
  for(let j=0;j<NH;j++)for(let i=0;i<N;i++){const o=objs[j][i],v=r();if(!o||i>=N-3||j>=NH-3)continue;
    const back=i<2||j<2;if(o==='rock'?v<(back?T.edge:T.spireN):back&&PERCH_TREE[o]&&v<T.edge*.6)objs[j][i]='spire'}}
function terrDry(T){if(!T||!T.sand)return;const wet=(i,j)=>{for(let y=j-2;y<=j+2;y++)for(let x=i-2;x<=i+2;x++)if(map[y]&&map[y][x]&&map[y][x].g===2)return 1};
  for(let j=0;j<NH;j++)for(let i=0;i<N;i++)if(PERCH_TREE[objs[j][i]]&&!wet(i,j))objs[j][i]='rock'}
hook('regionGen',id=>{TP=terrOf(id);WATER=[];for(let j=0;j<NH;j++)for(let i=0;i<N;i++)if(map[j][i].g===2)WATER.push(i,j);terrDry(TP);terrSpires(TP)});

// ---- 봉우리 그림 (SPIRE 팔레트마다 셋, 처음 쓸 때 만든다) ----
const SPIRE_SET={};
function spireSet(k){return SPIRE_SET[k]||(SPIRE_SET[k]=[0,1,2].map(s=>mkSpire(SPIRE[k]||SPIRE.g,k.charCodeAt(0)*31+s*97+5)))}
Object.defineProperty(SPRITES,'spire',{get:()=>spireSet(TP&&TP.spire||'g')});
function mkSpire(p,seed){
  const r=rng(seed),h=Math.round(p.h[0]+r()*(p.h[1]-p.h[0])),w=100,c=document.createElement('canvas');c.width=w;c.height=h+14;
  const g=c.getContext('2d'),B=h+2,rgb=(a,k=1,al=1)=>`rgba(${a[0]*k|0},${a[1]*k|0},${a[2]*k|0},${al})`;
  g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(50,B-2,42,12,0,0,7);g.fill();
  // 기둥 두세 개: 뒤의 낮은 것부터, 앞의 큰 것을 마지막에
  const nc=2+(r()<.55?1:0),cols=[];
  for(let q=0;q<nc;q++){const main=q===nc-1;cols.push({cx:main?50+(r()-.5)*6:(q?70:30)+(r()-.5)*6,bw:main?34+r()*6:20+r()*8,ht:main?h-4:h*(.5+r()*.3),k:main?1:.84})}
  for(const o of cols){
    const L=[],R=[],n=9;
    for(let s=0;s<=n;s++){const t=s/n,y=B-6-o.ht*t;
      let hw=p.top==='flat'?o.bw*(1-t*.55):p.top==='round'?o.bw*Math.sqrt(Math.max(0,1-Math.pow(t,3))):o.bw*Math.pow(1-t,.45);
      if(s===n)hw=p.top==='flat'?o.bw*.42:p.top==='round'?o.bw*.25:3;
      const jl=(r()-.5)*o.bw*.22,jr=(r()-.5)*o.bw*.22;L.push([o.cx-hw+jl,y]);R.push([o.cx+hw+jr,y+(p.top==='sharp'&&s===n?4:0)])}
    const poly=L.concat(R.reverse()),top=B-6-o.ht;
    const path=()=>{g.beginPath();poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath()};
    const gr=g.createLinearGradient(o.cx-o.bw,0,o.cx+o.bw,0);gr.addColorStop(0,rgb(p.hi,o.k));gr.addColorStop(.42,rgb(p.mid,o.k));gr.addColorStop(1,rgb(p.dk,o.k));
    g.fillStyle=gr;path();g.fill();
    g.save();path();g.clip();
    // 아래로 갈수록 어둡게 (땅에 묻힌 그늘)
    const vg=g.createLinearGradient(0,top,0,B);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(.7,'rgba(0,0,0,.08)');vg.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=vg;g.fillRect(0,top,w,B-top);
    g.lineCap='round';
    if(p.pat==='streak'||p.pat==='drip'){for(let q=0;q<9;q++){const x=o.cx-o.bw+r()*o.bw*2,y0=top+r()*o.ht*.25,y1=B-r()*o.ht*.2,dx=(r()-.5)*4;
        g.strokeStyle=rgb(p.dk,.7,p.pat==='drip'?.3:.45);g.lineWidth=p.pat==='drip'?2.5+r()*3:1+r()*1.2;g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+dx,(y0+y1)/2,x+dx*.4,y1);g.stroke();
        if(p.pat==='streak'){g.strokeStyle=rgb(p.hi,1.05,.3);g.lineWidth=1;g.beginPath();g.moveTo(x-1.6,y0+4);g.lineTo(x-1.6+dx*.5,y1);g.stroke()}}}
    else if(p.pat==='strata'||p.pat==='tilt'){const tl=p.pat==='tilt'?.42:.06;for(let y=top+6;y<B;y+=6+r()*7){g.strokeStyle=rgb(p.dk,.8,.3+r()*.2);g.lineWidth=1.2+r()*1.8;g.beginPath();g.moveTo(o.cx-o.bw-4,y+o.bw*tl);g.quadraticCurveTo(o.cx,y+(r()-.5)*4,o.cx+o.bw+4,y-o.bw*tl);g.stroke();
        g.strokeStyle=rgb(p.hi,1.04,.22);g.lineWidth=1;g.beginPath();g.moveTo(o.cx-o.bw-4,y+o.bw*tl-2);g.lineTo(o.cx+o.bw+4,y-o.bw*tl-2);g.stroke()}}
    else for(let q=0;q<60;q++){g.fillStyle=rgb(r()<.5?p.dk:p.hi,1,.35);g.fillRect(o.cx-o.bw+r()*o.bw*2,top+r()*o.ht,1.5+r()*2,1.5+r()*1.5)}
    if(p.cap){g.fillStyle='rgba(244,247,252,.95)';g.beginPath();g.moveTo(o.cx-o.bw,top);for(let x=o.cx-o.bw;x<=o.cx+o.bw;x+=5)g.lineTo(x,top+o.ht*(.2+r()*.16)+(x>o.cx?-4:0));g.lineTo(o.cx+o.bw,top-10);g.closePath();g.fill();
      g.strokeStyle='rgba(240,244,250,.7)';g.lineWidth=1.4;for(let q=0;q<5;q++){const x=o.cx-o.bw*.8+r()*o.bw*1.4,y=top+o.ht*.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*3,y+o.ht*(.1+r()*.25));g.stroke()}}
    g.restore();
    // 볕 드는 왼쪽 모서리와 테두리
    g.strokeStyle=rgb(p.hi,1.12,.55);g.lineWidth=1.3;g.beginPath();L.forEach((q,i)=>i?g.lineTo(q[0]+1,q[1]):g.moveTo(q[0]+1,q[1]));g.stroke();
    g.strokeStyle=rgb(p.dk,.55,.9);g.lineWidth=1;path();g.stroke();
    // 바위틈 소나무 (tree 수만큼): 화산 사진의 절벽에 매달린 소나무
    for(let q=0;q<(p.tree||0)*(o.k<1?1:2);q++){const t=.35+r()*.45,y=B-6-o.ht*t,x=o.cx+(r()<.6?-1:1)*o.bw*(1-t)*.7,d=r()<.5?-1:1;
      g.strokeStyle='#3a2416';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+d*5,y-3,x+d*10,y-6);g.stroke();
      for(let e=0;e<9;e++){const l=r();g.fillStyle=`hsl(${128+r()*18},${26+l*12}%,${14+l*20}%)`;g.beginPath();g.ellipse(x+d*(6+r()*10),y-6-r()*5,3.5+r()*3,1.6+r()*1.4,0,0,7);g.fill()}}
  }
  return c;
}

// ---- 화면 효과 ----
// 물: 화면 안 물 칸마다 반짝이는 물결 하나. 밝기 세 단계로 묶어 한 번씩만 긋는다 (칸 600개까지)
function terrWater(){if(!WATER.length)return;const bk=[[],[],[]],day=darkLvl()<.4;let n=0;
  for(let q=0;q<WATER.length;q+=2){const i=WATER[q],j=WATER[q+1],p=toScreen(i+.5,j+.5);if(p.x<-30||p.x>W+30||p.y<-20||p.y>H+20)continue;
    const h=hash(i,j*7),u=frac(time*.16+h),a=Math.sin(u*Math.PI);if(a<.2)continue;
    bk[a>.8?2:a>.5?1:0].push(p.x+(hash(i*3,j)-.5)*28+u*6,p.y+(hash(i,j*5)-.5)*12);if(++n>600)break}
  ctx.lineWidth=1;
  for(let q=0;q<3;q++){const L=bk[q];if(!L.length)continue;ctx.strokeStyle=`rgba(226,240,248,${[.14,.28,.44][q]})`;ctx.beginPath();
    for(let k=0;k<L.length;k+=2){const x=L[k],y=L[k+1];ctx.moveTo(x-7,y+1);ctx.quadraticCurveTo(x-2,y-2,x+3,y);ctx.quadraticCurveTo(x+6,y+1.4,x+9,y-.4)}ctx.stroke()}
  if(day&&bk[2].length){ctx.fillStyle='rgba(255,255,240,.75)';for(let k=0;k<bk[2].length;k+=6)ctx.fillRect(bk[2][k]-.8,bk[2][k+1]-2,1.6,1.6)}}
// 구름 한 장 (부드러운 덩어리 여럿)
let CLOUD=null;
function cloudSpr(){if(CLOUD)return CLOUD;const c=document.createElement('canvas');c.width=300;c.height=100;const g=c.getContext('2d'),r=rng(77);
  for(let i=0;i<26;i++){const x=40+r()*220,y=40+r()*30,s=18+r()*26,gr=g.createRadialGradient(x,y,0,x,y,s);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-s,y-s,s*2,s*2)}
  return CLOUD=c}
// 모래바람(sand)·아지랑이(heat, 낮에만)·떠도는 구름(cloud). 그리는 목록 다음, 날씨·어둠 앞
function terrSky(){const T=TP;if(!T||REGION().in)return;const dl=darkLvl();
  if(T.cloud){const c=cloudSpr();ctx.globalAlpha=.3*(1-dl*.6);
    for(let i=0;i<T.cloud;i++){const sw=W*.9,sp=6+hash(i,4)*6,x=(hash(i,9)*(W+sw)+time*sp)%(W+sw)-sw,y=H*(.08+hash(i,2)*.7)+Math.sin(time*.05+i)*10;ctx.drawImage(c,x,y,sw,sw/3)}ctx.globalAlpha=1}
  if(T.sand){ctx.fillStyle='rgba(222,184,116,.07)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(236,210,156,.5)';ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<110;i++){const sp=110+hash(i,3)*120,x=(hash(i,7)*(W+80)+time*sp)%(W+80)-40,y=(hash(i,11)*H+time*sp*.12+Math.sin(time*2+i)*5)%H,l=6+hash(i,5)*12;ctx.moveTo(x,y);ctx.lineTo(x+l,y+l*.12)}ctx.stroke();
    // 바람 따라 흩날리는 모래 알갱이
    ctx.fillStyle='rgba(214,180,120,.55)';for(let i=0;i<50;i++){const sp=150+hash(i,13)*100,x=(hash(i,17)*(W+40)+time*sp)%(W+40)-20,y=(hash(i,19)*H+Math.sin(time*3+i)*8)%H;ctx.fillRect(x,y,1.6,1.6)}}
  if(T.heat&&dl<.3&&!/비|눈|흐림/.test(G.weather||'')){ctx.strokeStyle=`rgba(255,238,205,${.08*(1-dl/.3)})`;ctx.lineWidth=3;ctx.beginPath();
    for(let k=0;k<7;k++){const y0=H*(.3+k*.1)+Math.sin(time*.4+k)*10;for(let x=0;x<=W;x+=20){const y=y0+Math.sin(x*.045+time*3.2+k*1.7)*2.2;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}}ctx.stroke()}}
const terrBg=()=>TP&&TP.mist&&!REGION().in?`rgb(${TP.mist.join(',')})`:'#0b0a09';

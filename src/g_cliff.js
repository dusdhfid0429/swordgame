// ================= 높낮이 지형 만들기 (v179): 산 맵 계단식 턱, 항산 현공사 =================
// 높낮이 규칙과 그리기는 g_elev.js. 여기서는 맵마다 칸의 층·계단·다리를 정한다. 숫자는 data/elev.json ELEV.mount·hg
// - 산 맵(20×40, 숭산 포함): 아래에서 위로 ELEV.mount.bands 줄마다 한 층씩 높다. 턱 줄은 들쭉날쭉, 산길이 넘는 자리만 곧게 돌계단.
//   경공으로만 오르는 바위 언덕(knolls) 몇 개. 포털 빈터와 꼭대기 마당은 한 층 위에 통째로
// - 항산 현공사(40×40, 항산 산 맵 중턱 포털): 깎아지른 벼랑 덩어리 앞에 층층이 튀어나온 벼랑 턱 셋, 그 위에 전각.
//   골짜기 → 산문 마당 → (두 층 돌계단) 대웅전 벼랑 → 누각 벼랑 → 꼭대기 암자. 대웅전 벼랑 오른쪽에서 출렁다리로 돌기둥 정자
const EVM=EV.mount,EVH=EV.hg;
function elevFix(){ELMAX=0;for(let k=0;k<N*NH;k++){if(ELV[k]>ELMAX)ELMAX=ELV[k];const x=k%N,y=(k-x)/N;if(ELV[k]>0&&!HBR[k]&&map[y][x].g===2)map[y][x].g=6}}
// 산길을 아래에서 위로 따라가며 층이 오르는 줄에 돌계단을 놓는다 (층 차이만큼 칸을 겹쳐 쌓는다). 길은 road(y), road(y)+1 두 칸
function elevRoadStairs(road,yTop,yBot,keep){for(let y=yBot;y>yTop+1;y--)y-=stairAt(road(y-1),y,keep,2)}
// x열(w칸 너비)에서 y줄(아래 칸)과 y-1줄(위 칸)의 층 차이만큼 돌계단을 위로 쌓는다. 쌓은 칸 수를 돌려준다
function stairAt(x,y,keep,w=2){let lo=99,hi=-1;for(let xx=x;xx<x+w;xx++){lo=Math.min(lo,lvAt(xx,y));hi=Math.max(hi,lvAt(xx,y-1))}const n=hi-lo;if(n<=0||y-n-1<0)return 0;
  for(let xx=x;xx<x+w;xx++){if(xx<0||xx>=N)continue;
    for(let m=0;m<=n+1;m++){const yy=y-m,k=yy*N+xx;ELV[k]=m===0?lo:m===n+1?hi:lo+m;HST[k]=m>=1&&m<=n?2:0;HBR[k]=0;if(objs[yy][xx]!=='B')objs[yy][xx]=null;if(m>=1&&m<=n)map[yy][xx].g=1;keep&&keep.add(k)}
    if(y+1<NH&&objs[y+1][xx]!=='B'){objs[y+1][xx]=null;keep&&keep.add((y+1)*N+xx)}}
  return n}
// ---- 산 맵 ----
function elevMount(R){const c=R.stage,road=y=>lmRoadX(c,y),r=rng(c.seed*3+11);elevAlloc();
  const bands=EVM.bands.map(b=>{for(const q of c.portals){const py=Math.floor(q.y);if(b>=py-1&&b<=py+2)b=py+3}return b});
  bands.forEach((b,k)=>{const rx=road(b-1);for(let x=0;x<N;x++){const jag=Math.abs(x-rx-.5)<=2.5?0:clamp(Math.round((fbm(x*.33+k*3.1,c.seed%97+k)-.5)*5),-EVM.jag,EVM.jag),yb=b+jag;
    for(let y=0;y<yb;y++)ELV[y*N+x]++}});
  const keep=new Set;elevRoadStairs(road,c.yard?c.yard[3]:12,NH-2,keep);
  // 바위 언덕: 길·포털·계단에서 떨어진 곳, 한 층 위. 경공으로만 오른다
  let made=0;for(let t=0;t<300&&made<EVM.knolls;t++){const w=2+(r()<.5?1:0),h=2+(r()<.5?1:0),x=1+Math.floor(r()*(N-w-2)),y=10+Math.floor(r()*(NH-h-16)),L=lvAt(x,y);let ok=true;
    for(let j=y-1;j<=y+h&&ok;j++)for(let i=x-1;i<=x+w;i++){const k=j*N+i;if(i<0||i>=N||lvAt(i,j)!==L||HST[k]||keep.has(k)||Math.abs(i-road(j)-.5)<3.5||objs[j][i]==='B'||c.portals.some(q=>Math.hypot(q.x-i,q.y-j)<4)){ok=false;break}}
    if(!ok)continue;made++;for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const k=j*N+i;ELV[k]=L+1;HKN[k]=1;if(objs[j][i]==='rock'&&r()<.6)objs[j][i]=null}
    objs[y][x]='pine'}
  elevFix()}
hook('regionGen',id=>{const R=REGIONS[id];if(!ELV&&R&&R.lm&&R.lm.t==='m'&&R.stage&&N<=48&&NH<=48)elevMount(R)});
// ---- 항산 현공사 ----
// u=x+y(화면 깊이: 작을수록 뒤), v=x-y(화면 가로). 앞에서부터 띠를 보고, 그 띠 깊이인데 가로 밖이면 벼랑 덩어리
const hgMass=(x,y)=>Math.min(EVH.massMax,EVH.mass+Math.max(0,Math.floor((EVH.bands[EVH.bands.length-1][0]-x-y)/EVH.massRise))+Math.round((fbm(x*.21+11,y*.21+5)-.5)*3));
const hgIsMass=L=>L>=EVH.mass;
function hgLv(x,y){const u=x+y,v=x-y,n=Math.round((fbm(x*.31+3,y*.31+7)-.5)*2.4);
  for(const[u0,L,vl,vr]of EVH.bands)if(u>=u0+n)return v>=vl-n&&v<=vr+n?L:hgMass(x,y);return hgMass(x,y)}
const hgRoad=c=>y=>ST_PATH(y,c.seed%7*.9,12,NH-2,N/2);
function genHG(c){genStage(c);elevAlloc();const r=rng(c.seed+5),road=hgRoad(c),keep=new Set;c.pillar=new Set;
  for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const k=y*N+x,L=hgLv(x,y);ELV[k]=L;
    if(hgIsMass(L)){objs[y][x]='cliff';map[y][x].g=6}
    else if(L>=3){map[y][x].g=4;if(objs[y][x]&&objs[y][x]!=='B')objs[y][x]=null}
    else if(L===1&&objs[y][x]==='rock'&&r()<.5)objs[y][x]=null
    else if(L===0&&objs[y][x]==='pine'&&x>1&&y>1&&x<N-2&&y<NH-2&&r()<EVH.thin)objs[y][x]=null}
  elevRoadStairs(road,12,NH-2,keep);
  for(let y=12;y<NH;y++)for(const x of[road(y),road(y)+1])keep.add(y*N+x);
  // 꼭대기 암자로 오르는 한 칸 돌계단 (누각 벼랑 → 암자)
  {const T=EVH.top,B=EVH.bands,hi=B[B.length-1][1],lo=B[B.length-2][1],n=hi-lo;let best=null,bs=1e9;
    for(let y=n+1;y<NH-3;y++)for(let x=1;x<N-1;x++){let ok=lvAt(x,y+1)===lo&&lvAt(x,y+2)===lo;for(let m=0;m<=n&&ok;m++)if(lvAt(x,y-m)!==hi)ok=false;if(!ok)continue;const s=Math.abs(x-y-T.v);if(s<bs){bs=s;best={x,y}}}
    if(best){const{x,y}=best;for(let m=0;m<n;m++){const k=(y-m)*N+x;ELV[k]=lo+1+m;HST[k]=2;map[y-m][x].g=1}for(let j=y-n;j<=y+2;j++){objs[j][x]=null;keep.add(j*N+x)}}}
  // 대웅전 벼랑 오른쪽 끝에서 출렁다리 → 돌기둥 정자
  {const Q=EVH.pillar,L=Q.lv;let best=null,bs=1e9;
    for(let y=1;y<NH-2;y++)for(let x=1;x<N-Q.len-Q.size-1;x++){if(lvAt(x,y)!==L||HST[y*N+x]||lvAt(x+1,y)>=L)continue;let ok=true;
      for(let i=x+1;i<=x+Q.len+Q.size&&ok;i++)for(let j=i>x+Q.len?y-1:y;j<=(i>x+Q.len?y+1:y);j++)if(lvAt(i,j)>=L-1||(i>x+2&&i<=x+Q.len&&lvAt(i,y-1)>=L-1)||HST[j*N+i]||keep.has(j*N+i)||i>=N-1||j>=NH-1){ok=false;break}
      if(!ok)continue;const s=Math.abs(x-y-Q.from[0]);if(s<bs){bs=s;best={x,y}}}
    if(best){const{x,y}=best;
      for(let i=x+1;i<=x+Q.len;i++){const k=y*N+i;HBR[k]=ELV[k]+1;ELV[k]=L;HBD[k]=1;objs[y][i]=null;keep.add(k)}
      for(let i=x+Q.len+1;i<=x+Q.len+Q.size;i++)for(let j=y-1;j<=y+1;j++){const k=j*N+i;ELV[k]=L;objs[j][i]=null;map[j][i].g=4;c.pillar.add(k)}
      objs[y][x]=null;keep.add(y*N+x)}}
  // 전각: 그 층 칸 위에, 앞(오른·아래) 한 줄까지 같은 층이어야 놓는다. 벼랑 쪽(뒤)에 붙인다
  for(const b of EVH.builds){const on=b.lv==='pillar'?(i,j)=>c.pillar.has(j*N+i):(i,j)=>lvAt(i,j)===b.lv&&!c.pillar.has(j*N+i);let best=null,bs=1e9;
    for(let y=1;y<NH-b.h-1;y++)for(let x=1;x<N-b.w-1;x++){let ok=true;
      for(let j=y;j<=y+b.h&&ok;j++)for(let i=x;i<=x+b.w;i++){const k=j*N+i,foot=i<x+b.w&&j<y+b.h;if(!on(i,j)||HST[k]||HBR[k]||objs[j][i]==='B'||objs[j][i]==='cliff'||foot&&keep.has(k)){ok=false;break}}
      if(!ok)continue;const cu=x+y+(b.w+b.h)/2,cv=x-y+(b.w-b.h)/2,s=Math.abs(cv-(b.v||0))+(b.u!=null?Math.abs(cu-b.u):cu*.3);if(s<bs){bs=s;best={x,y}}}
    if(!best)continue;const{x,y}=best;
    for(let j=y;j<=y+b.h;j++)for(let i=x;i<=x+b.w;i++){const foot=i<x+b.w&&j<y+b.h;objs[j][i]=foot?'B':null;map[j][i].g=4}
    builds.push({x,y,w:b.w,h:b.h,kind:b.kind,rc:b.rc})}
  // 소나무: 벼랑 턱 끝과 벼랑 덩어리 앞자락에
  for(let y=1;y<NH-1;y++)for(let x=1;x<N-1;x++){const k=y*N+x,L=ELV[k];if(HST[k]||HBR[k]||keep.has(k)||c.pillar.has(k))continue;const edge=lvAt(x+1,y)<L||lvAt(x,y+1)<L;if(!edge)continue;
    if(hgIsMass(L)?r()<.09:L>=3&&!objs[y][x]&&r()<.14&&!builds.some(b=>x>=b.x-1&&x<=b.x+b.w&&y>=b.y-1&&y<=b.y+b.h))objs[y][x]='pine'}
  nodes=nodes.filter(n=>{const i=Math.floor(n.x),j=Math.floor(n.y);return walk(i,j)&&!HST[j*N+i]&&!HBR[j*N+i]});
  elevFix()}
function hgZone(c,x,y){const i=Math.floor(x),j=Math.floor(y);if(c.pillar&&c.pillar.has(j*N+i))return EVH.zone.pillar;return EVH.zone[lvAt(i,j)]||EVH.name}
// 항산 산 맵 중턱에 현공사 포털
const HG_ID='hg_hyeongong';
{let host=null,prov=null;for(const k of Object.keys(PROV)){const F=REGIONS[pvId(k)];for(const m of F.marks||[])if(m.n===EVH.host&&m.gate){host=m;prov=k}}
  if(host){const L=REGIONS[host.gate],lc=L.stage,n=lc.portals.length,slot=LM_PORTAL_M[Math.min(n,2)],x=lmRoadX(lc,slot[1])+slot[0]+.5,y=slot[1]+.5;
    lc.portals.push({x,y,s:null,label:'현공사'});L.gates.push({x,y,to:HG_ID,tx:20.5,ty:36.2,label:'현공사',portal:1});
    const c={id:HG_ID,name:EVH.name,th:'peak',seed:EVH.seed,w:40,h:40,nodes:{herb:5,ore:3,wood:1}};
    REGIONS[HG_ID]={name:EVH.name,prov,theme:'peak',size:40,h:40,stage:c,hg:1,gen:()=>genHG(c),bake:()=>bakeHQ('peak'),zone:(x,y)=>hgZone(c,x,y),
      spawns:[['늑대',3,(x,y)=>lvAt(x,y)===0&&y>30],['산적',3,(x,y)=>lvAt(x,y)===1],['산적궁수',2,(x,y)=>lvAt(x,y)===5&&!HST[y*N+x]]],
      bosses:[],npcs:[],gates:[{x:20.5,y:38.6,to:host.gate,tx:x,ty:y+2,label:host.n}]}}}

// ---- 문파 본산 (사용자 2026-10-26: "무당파야, 문파들 검색해보고 배치나 지형 참고해서 만들어줘") ----
// 맵 id마다 data/elev.json ELEV.sect 설정. 이미 있는 전각·길·NPC 자리는 그대로 두고 그 밑의 땅을 층층이 들어 올린다.
//  bands [[y0,층]...]: y가 y0 이상인 줄의 층(아래쪽부터). peak [x0,y0,x1,y1,층,간격]: 네모(산꼭대기 마당)에서 멀어질수록 간격 칸마다 한 층 낮다.
//  flank [x0,x1,y까지,최대]: 마당 좌우 바깥은 비탈이 솟는다(몹이 생기지 않음). rects [[x0,y0,x1,y1,층]]: 그 네모는 그 층.
//  stairs [[x,y,너비]]: y줄(아래)과 y-1줄 사이 돌계단. road: 'hq'(본산 길 hqPath)·'stage'(genStage 길). wall [[x0,y0,x1,y1]]: 그 안의 벼랑 가장자리에 붉은 담
function elevSect(R,cf){elevAlloc();const c=R.stage,keep=new Set;
  for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const k=y*N+x;let L=0;
    if(cf.bands)for(const[y0,l]of cf.bands)if(y>=y0){L=l;break}
    if(cf.peak){const[x0,y0,x1,y1,l,st]=cf.peak,d0=Math.max(x0-x,x-x1,y0-y,y-y1,0),d=d0?d0+(fbm(x*.4+2,y*.4+9)-.5)*1.6:0;L=Math.max(L,l-Math.ceil(Math.max(0,d)/st))}
    if(cf.flank){const[x0,x1,ym,mx]=cf.flank;if(y<=ym&&(x<x0||x>x1)){const dx=x<x0?x0-x:x-x1;L+=1+Math.min(mx-1,Math.floor(dx/3+fbm(x*.5,y*.5)));HKN[k]=1}}
    for(const[x0,y0,x1,y1,l]of cf.rects||[])if(x>=x0&&x<=x1&&y>=y0&&y<=y1)L=l;
    ELV[k]=Math.max(0,L)}
  const sd=R.hq&&!c?SECTS[R.hq].i*.7:0;
  if(cf.road==='hq')elevRoadStairs(y=>hqPath(y,sd),15,NH-2,keep);
  else if(cf.road==='stage'&&c){const yd=c.yard,yEnd=yd?yd[3]:c.top?0:12,road=y=>ST_PATH(y,c.seed%7*.9,yEnd,NH-2,N/2);elevRoadStairs(road,yEnd-1,NH-2,keep);
    if(c.top&&yd){const tx=c.topX??N/2;elevRoadStairs(()=>tx,0,yd[1],keep)}}
  for(const[x,y,w]of cf.stairs||[])stairAt(x,y,keep,w||2);
  // 붉은 담: 걸어 넘지 못하는 벼랑 가장자리마다
  for(const[x0,y0,x1,y1]of cf.wall||[])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*N+x;if(HST[k])continue;let f=0;
    [[1,0,1],[0,1,2],[-1,0,4],[0,-1,8]].forEach(([dx,dy,b])=>{const a=x+dx,bb=y+dy;if(a<0||bb<0||a>=N||bb>=NH)return;if(hLv(a+.5,bb+.5)<ELV[k]-.01&&!hpass(x,y,a,bb)&&!HST[bb*N+a])f|=b});HWL[k]=f}
  // 전각과 그 앞 한 줄은 한 층이어야: 어긋나면 전각 칸 층으로 맞춘다
  for(const b of builds){const L=ELV[b.y*N+b.x];for(let j=b.y;j<=Math.min(NH-1,b.y+b.h);j++)for(let i=b.x;i<=Math.min(N-1,b.x+b.w);i++){const k=j*N+i;if(!HST[k])ELV[k]=L}}
  elevFix()}
hook('regionGen',id=>{const cf=EV.sect[id],R=REGIONS[id];if(cf&&R&&!ELV)elevSect(R,cf)});

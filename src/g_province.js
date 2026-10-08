// ================= 천하: 성(省) 지도 14곳 =================
// 탄마 중국무림전도(누구나 무료 사용)를 참고해 성과 이웃 관계, 문파 자리를 정했다. 설계: docs/맵이동_설계.md
// - 성 하나 = 지역 하나. 크기는 지도에서 차지하는 넓이에 따라 44~64칸(본산·개봉·숭산은 40칸).
// - 성끼리는 가장자리 출입구로 지도 위치대로 잇는다. 성 안의 본산 입구(안쪽 출입구)로 각 문파 본산에 들어간다.
// - 개봉은 하남성 동쪽의 성 안 마을(지역 개봉), 숭산 소림사는 개봉 북쪽으로 그대로 잇는다.
// map: 무림전도(2000×1333)에서의 자리, 천하 지도 창에 그린다
const PROV={
  henan:{n:'하남성',size:48,th:'plain',map:[1305,745],sects:['gaebang','haomun','heukpung','cheolgeom'],d:'중원의 한가운데. 황하가 흐르는 너른 들'},
  hebei:{n:'하북성',size:48,th:'north',map:[1335,585],sects:['paeng','geumgang'],d:'북경을 품은 메마른 북방의 들'},
  shandong:{n:'산동성',size:44,th:'coast',map:[1425,630],sects:['hwangbo','sinchang'],d:'태산과 동쪽 바다'},
  liaoning:{n:'요녕성',size:48,th:'cold',map:[1560,465],sects:['moyong'],d:'산해관 너머 눈 덮인 동북'},
  anhui:{n:'안휘성',size:44,th:'hills',map:[1405,770],sects:['namgung','cheongpung'],d:'황산의 기암과 소나무'},
  shaanxi:{n:'섬서성',size:52,th:'loess',map:[1180,705],sects:['hwasan','jongnam','gwiyeong'],d:'황토 고원과 화산·종남산'},
  gansu:{n:'감숙성',size:56,th:'desert',map:[1000,705],sects:['kongtong','hyeolrang','sahyeol'],d:'하서회랑의 모래와 바위'},
  qinghai:{n:'청해성',size:60,th:'highland',map:[870,650],sects:['kunlun'],d:'청해호와 곤륜의 설산 고원'},
  sichuan:{n:'사천성',size:64,th:'basin',map:[950,825],sects:['emei','cheongseong','dang','heuksa'],d:'숲이 짙은 천부지국. 아미산·청성산'},
  yunnan:{n:'운남성',size:56,th:'jungle',map:[965,1090],sects:['jeomchang','salsu'],d:'붉은 흙과 밀림, 점창산'},
  guizhou:{n:'귀주성',size:48,th:'miao',map:[1075,990],sects:['mandok','eumyang','hyeolsu'],d:'독충의 늪과 기암, 묘강'},
  hubei:{n:'호북성',size:52,th:'river',map:[1240,830],sects:['mudang','jegal','noklim'],d:'장강이 가로지르는 무당산의 땅'},
  hunan:{n:'호남성',size:52,th:'lake',map:[1240,955],sects:['janggang','chilsal'],d:'동정호 물길'},
  guangxi:{n:'광서성',size:52,th:'karst',map:[1140,1125],sects:['cheonma','mayeong'],d:'봉우리가 숲처럼 솟은 남방. 십만대산'}};
const pvId=k=>'pv_'+k;
// 이웃: [성A, A쪽 가장자리, 자리(0~1), 성B, B쪽 가장자리, 자리]
const PV_LINKS=[
  ['henan','n',.5,'hebei','s',.5],['henan','e',.3,'shandong','w',.5],['henan','e',.75,'anhui','w',.3],['henan','w',.5,'shaanxi','e',.5],['henan','s',.5,'hubei','n',.6],
  ['hebei','e',.7,'shandong','n',.4],['hebei','n',.7,'liaoning','s',.3],['shandong','s',.4,'anhui','n',.6],['anhui','w',.7,'hubei','e',.4],
  ['shaanxi','w',.4,'gansu','e',.5],['shaanxi','s',.4,'sichuan','n',.6],['shaanxi','s',.8,'hubei','n',.2],['gansu','w',.6,'qinghai','e',.4],
  ['qinghai','s',.7,'sichuan','w',.3],['sichuan','e',.4,'hubei','w',.5],['sichuan','s',.4,'yunnan','n',.5],['sichuan','s',.8,'guizhou','n',.4],
  ['hubei','s',.5,'hunan','n',.5],['hunan','w',.5,'guizhou','e',.4],['hunan','s',.4,'guangxi','n',.7],['yunnan','e',.4,'guizhou','w',.5],
  ['guizhou','s',.5,'guangxi','n',.3],['yunnan','e',.8,'guangxi','w',.5]];
const pvEdge=(S,sd,t)=>{const v=Math.floor(t*S)+.5;return sd==='n'?{x:v,y:1.2}:sd==='s'?{x:v,y:S-1.4}:sd==='w'?{x:1.2,y:v}:{x:S-1.4,y:v}};
const pvIn=(S,sd,t)=>{const v=Math.floor(t*S)+.5;return sd==='n'?{x:v,y:3.6}:sd==='s'?{x:v,y:S-3.8}:sd==='w'?{x:3.6,y:v}:{x:S-3.8,y:v}};
const pvOfSect=sid=>Object.keys(PROV).find(k=>PROV[k].sects.includes(sid));
// 성 안 출입구(본산 입구·개봉) 자리: 가장자리에서 7칸 이상, 서로 9칸 이상 떨어뜨린다
function pvInner(k,p){
  const S=p.size,r=rng(5300+k.length*97+k.charCodeAt(0)*13),pts=[];
  if(k==='henan')pts.push({x:Math.floor(S*.8)+.5,y:Math.floor(S*.5)+.5,to:'gaebong'});
  for(const sid of p.sects){let best=null;for(let t=0;t<200;t++){const x=7+Math.floor(r()*(S-14))+.5,y=7+Math.floor(r()*(S-14))+.5;
    if(Math.hypot(x-S/2,y-S/2)<6)continue;const d=Math.min(99,...pts.map(q=>Math.hypot(q.x-x,q.y-y)));if(d>=9){best={x,y};break}if(!best||d>best.d)best={x,y,d}}
    pts.push({x:best.x,y:best.y,to:'hq_'+sid})}
  return pts}
// 바닥 그림은 본산 그림을 같이 쓴다 (테마 이름이 다르면 풀빛만 고른다)
const PV_PAINT={plain:'manor',north:'canyon',coast:'lake',cold:'snow',hills:'peak',loess:'canyon',desert:'canyon',highland:'snow',basin:'forest',jungle:'forest',miao:'miao',river:'lake',lake:'lake',karst:'forest'};
HQ_GRASS.miao=[48,66,40];
const PV_BEAST={plain:[['토끼',4],['양',3],['말',2]],north:[['늑대',3],['말',2]],coast:[['토끼',3],['멧돼지',2]],cold:[['늑대',4],['곰',1]],hills:[['사슴',3],['호랑이',1]],
  loess:[['늑대',3],['멧돼지',2]],desert:[['늑대',3],['말',2]],highland:[['늑대',3],['곰',1],['양',2]],basin:[['사슴',3],['곰',1],['멧돼지',2]],
  jungle:[['호랑이',2],['멧돼지',2]],miao:[['늑대',2],['멧돼지',3]],river:[['사슴',3],['멧돼지',2]],lake:[['사슴',2],['토끼',3]],karst:[['호랑이',1],['멧돼지',3]]};
// 지형 규칙: base 바닥, alt(높은 곳) 바닥, 나무·바위 밀도, 물(강·호수·바다)
const PV_TH={
  plain:{base:0,alt:5,altAt:.63,tree:'tree',tv:.04,rv:.01,river:{y:.22}},
  north:{base:7,alt:0,altAt:.6,tree:'tree',tv:.05,rv:.03},
  coast:{base:0,alt:6,altAt:.68,tree:'pine',tv:.05,rv:.03,sea:'e'},
  cold:{base:0,alt:8,altAt:.5,tree:'pine',tv:.11,rv:.03},
  hills:{base:0,alt:6,altAt:.6,tree:'pine',tv:.11,rv:.06,river:{y:.7}},
  loess:{base:7,alt:6,altAt:.62,tree:'pine',tv:.04,rv:.05},
  desert:{base:12,alt:6,altAt:.64,tree:'tree',tv:.008,rv:.04},
  highland:{base:0,alt:8,altAt:.62,tree:'pine',tv:.03,rv:.06,lake:{x:.3,y:.32,rx:.14,ry:.1}},
  basin:{base:0,alt:7,altAt:.66,tree:'tree',tv:.13,rv:.02,bamboo:.06,river:{y:.62}},
  jungle:{base:0,alt:10,altAt:.6,tree:'tree',tv:.17,rv:.02,bamboo:.06},
  miao:{base:9,alt:0,altAt:.35,low:true,tree:'tree',tv:.09,rv:.07,pools:.68},
  river:{base:0,alt:7,altAt:.66,tree:'tree',tv:.08,rv:.02,bamboo:.03,river:{y:.7,w:3}},
  lake:{base:0,alt:7,altAt:.68,tree:'tree',tv:.07,rv:.02,lake:{x:.5,y:.32,rx:.24,ry:.15}},
  karst:{base:0,alt:6,altAt:.62,tree:'tree',tv:.07,rv:.13,river:{y:.4}}};
// 성 지역 등록
for(const[k,p]of Object.entries(PROV)){
  const id=pvId(k),S=p.size,gates=[];
  for(const[a,sa,ta,b,sb,tb]of PV_LINKS){
    if(a===k){const at=pvIn(PROV[b].size,sb,tb);gates.push({...pvEdge(S,sa,ta),to:pvId(b),tx:at.x,ty:at.y,label:PROV[b].n,sd:sa})}
    if(b===k){const at=pvIn(PROV[a].size,sa,ta);gates.push({...pvEdge(S,sb,tb),to:pvId(a),tx:at.x,ty:at.y,label:PROV[a].n,sd:sb})}}
  for(const q of pvInner(k,p)){
    if(q.to==='gaebong'){gates.push({x:q.x,y:q.y,to:'gaebong',tx:3.6,ty:27.5,label:'개봉',inner:1});REGIONS.gaebong.gates.push({x:1.2,y:27.5,to:id,tx:q.x,ty:q.y+2.4,label:p.n})}
    else{const sid=q.to.slice(3),s=SECTS[sid];gates.push({x:q.x,y:q.y,to:q.to,tx:20.5,ty:36.2,label:hqPlace(s),inner:1});
      REGIONS[q.to].gates=[{x:20.5,y:38.6,to:id,tx:q.x,ty:q.y+2.4,label:p.n}];REGIONS[q.to].prov=k}}
  const facs=[...new Set(p.sects.map(sid=>alFac(SECTS[sid].al)))],far=(x,y)=>Math.hypot(x-S/2,y-S/2)>6;
  const local=f=>{const l=p.sects.filter(sid=>alFac(SECTS[sid].al)===f);return l.length?pick(l):undefined};
  const spawns=[];for(const f of['정','사','마'])spawns.push([FAC_KIND[f][0],facs.includes(f)?3:1,far,(x,y)=>mkFac(f,0,x,y,local(f))]);
  spawns.push(['산적',3,far],['산적궁수',1,far]);for(const[b,c]of PV_BEAST[p.th])spawns.push([b,c,far]);
  REGIONS[id]={name:p.n,prov:k,size:S,theme:p.th,gen:()=>genProv(id,k,p),bake:()=>bakeHQ(PV_PAINT[p.th]||p.th),gates,bosses:[],npcs:[],spawns,
    zone:(x,y)=>{let b=null,bd=6;for(const g of gates)if(g.inner){const d=Math.hypot(g.x-x,g.y-y);if(d<bd){bd=d;b=g}}
      return b?`${p.n} · ${b.label} 어귀`:Math.hypot(x-S/2,y-S/2)<5?`${p.n} 객잔 거리`:p.n}};
}
REGIONS.sungsan.prov='henan';REGIONS.gaebong.prov='henan';
// 성 지도: 출입구마다 한가운데 객잔 거리로 굽이진 길을 낸다. 물을 건너는 길은 다리가 된다.
function genProv(id,k,p){
  const R=REGIONS[id],S=N,T=PV_TH[p.th],r=rng(8800+k.length*131+k.charCodeAt(1)*7),o1=k.charCodeAt(0)*.05,C=Math.floor(S/2);
  map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const road=new Set(),mark=(x,y)=>{for(const[i,j]of[[x,y],[x+1,y],[x,y+1],[x+1,y+1]])if(i>=1&&j>=1&&i<S-1&&j<S-1)road.add(i+','+j)};
  for(const g of R.gates){let x=Math.max(1,Math.min(S-3,Math.floor(g.x))),y=Math.max(1,Math.min(S-3,Math.floor(g.y)));
    for(let n=0;n<S*4&&(x!==C||y!==C);n++){mark(x,y);const dx=C-x,dy=C-y;if(dy===0||(dx!==0&&r()<Math.abs(dx)/(Math.abs(dx)+Math.abs(dy))))x+=Math.sign(dx);else y+=Math.sign(dy)}mark(C,C)}
  const water=(x,y)=>{
    if(T.river){const w=T.river.w||2,ry=Math.floor(T.river.y*S+2.5*Math.sin(x*.18+o1));if(y>=ry&&y<ry+w)return true}
    if(T.lake){const L=T.lake;if(((x/S-L.x)/L.rx)**2+((y/S-L.y)/L.ry)**2<1)return true}
    if(T.sea==='e'&&x>S*.86+2*Math.sin(y*.3))return true;
    if(T.pools&&fbm(x*.21+o1,y*.21)>T.pools)return true;return false};
  for(let y=0;y<S;y++){map[y]=[];objs[y]=[];for(let x=0;x<S;x++){
    const hi=fbm(x*.15+o1,y*.15+o1*.6),rd=road.has(x+','+y),near=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>road.has((x+dx)+','+(y+dy)));
    let g=T.base;if(T.low?hi<T.altAt:hi>T.altAt)g=T.alt;const wt=water(x,y);if(wt)g=2;if(rd)g=wt?3:1;
    let o=null;const edge=x<=1||y<=1||x>=S-2||y>=S-2;
    if(!rd&&!wt){if(x===0||y===0||x===S-1||y===S-1)o=r()<.6?T.tree:'rock';else if(edge)o=r()<.7?(r()<.6?T.tree:'rock'):null;
      else if(!near&&Math.hypot(x-C,y-C)>4){const v=r(),cliff=fbm(x*.3+o1,y*.3);o=g===6&&cliff>.64?'rock':v<T.tv?T.tree:v<T.tv+T.rv?'rock':v<T.tv+T.rv+(T.bamboo||0)?'bamboo':null}}
    map[y][x]={g,v:r()};objs[y][x]=o}}
  for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(map[y][x].g===3&&(map[y-1]&&map[y-1][x].g===2||map[y+1]&&map[y+1][x].g===2))rails.push({x,y});
  // 한가운데 객잔 거리
  const inn={x:C+2,y:C-4,w:3,h:2,kind:'inn'};let ok=true;for(let j=inn.y;j<inn.y+inn.h;j++)for(let i=inn.x;i<inn.x+inn.w;i++)if(road.has(i+','+j)||map[j][i].g===2)ok=false;
  if(ok){for(let j=inn.y;j<inn.y+inn.h;j++)for(let i=inn.x;i<inn.x+inn.w;i++){objs[j][i]='B';map[j][i].g=4}builds.push(inn)}
  for(const[x,y]of[[C-2,C-2],[C+3,C+3],[C-2,C+3]])if(!road.has(x+','+y)&&map[y][x].g!==2){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  const put=(t,x,y)=>{if(walk(x,y)&&!road.has(x+','+y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  const want=(t,n,okg)=>{for(let i=0;i<400&&nodes.filter(q=>q.t===t).length<n;i++){const x=2+Math.floor(r()*(S-4)),y=2+Math.floor(r()*(S-4));if(okg(map[y][x].g))put(t,x,y)}};
  const sc=S*S/1600;want('herb',Math.round(8*sc),g=>g===0||g===7||g===9);want('wood',Math.round(5*sc),g=>g===0||g===7);want('ore',Math.round(5*sc),g=>g===6||g===8||g===10||g===12);
  if(T.river||T.lake||T.sea){let n=0;for(let i=0;i<600&&n<4;i++){const x=2+Math.floor(r()*(S-4)),y=2+Math.floor(r()*(S-4));if(walk(x,y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>map[y+dy][x+dx].g===2)){put('fish',x,y);n++}}}
}
// 지역마다 격자 크기(N)를 정하고 만든다. 테스트에서 gen()을 바로 불러도 크기가 맞도록 모든 지역에 씌운다.
for(const R of Object.values(REGIONS)){const g=R.gen;R.gen=()=>{N=R.size||40;g()}}

// ================= 천하 지도 창 =================
const provOfReg=id=>{const R=REGIONS[id];return R&&R.prov};
function pWorld(){
  const here=provOfReg(REG),X=v=>(v-780)*.62,Y=v=>(v-400)*.62;
  const lines=PV_LINKS.map(([a,,,b])=>{const A=PROV[a].map,Bm=PROV[b].map;return `<line x1="${X(A[0])}" y1="${Y(A[1])}" x2="${X(Bm[0])}" y2="${Y(Bm[1])}"/>`}).join('');
  const nodes=Object.entries(PROV).map(([k,p])=>{const[x,y]=p.map,me=k===here;
    return `<g class="${me?'me':''}"><circle cx="${X(x)}" cy="${Y(y)}" r="${me?9:6}"/><text x="${X(x)}" y="${Y(y)-12}">${p.n}</text></g>`}).join('');
  const P0=PROV.henan.map,gae=`<g class="${REG==='gaebong'?'me':''} city"><rect x="${X(P0[0])+14}" y="${Y(P0[1])-4}" width="8" height="8"/><text x="${X(P0[0])+38}" y="${Y(P0[1])+16}">개봉</text></g>`;
  const cur=here?PROV[here]:null,list=here?PROV[here].sects.map(sid=>`${SECTS[sid].n}(${hqPlace(SECTS[sid])})`).join(' · '):'';
  return `<svg class="world" viewBox="-20 -10 600 500" role="img" aria-label="천하 지도">${lines}${nodes}${gae}</svg>
    <p class="note">지금 있는 곳: <b class="gold">${REGION().name}</b>${cur&&REGION().name!==cur.n?` (${cur.n})`:''}${cur?` · ${cur.d}`:''}</p>
    ${list?`<p class="note">이 성의 문파: ${list}${here==='henan'?' · 소림사(숭산)':''}</p>`:''}
    <p class="note dim">성 가장자리의 이정표로 이웃 성에 가고, 성 안의 이정표로 문파 본산에 들어간다. 역참 말을 타면 개봉과 본산 사이를 바로 오간다.</p>`}
$('mini').addEventListener('click',()=>{if(playing)openPanel('world')});

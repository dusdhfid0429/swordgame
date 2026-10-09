// ================= 천하: 성(省) 지도 14곳 =================
// 탄마 중국무림전도(누구나 무료 사용)를 참고해 성과 이웃 관계, 문파 자리를 정했다. 설계: docs/맵이동_설계.md
// - 성 하나 = 지역 하나. 크기는 지도에서 차지하는 넓이에 따라 44~64칸(본산·개봉·숭산은 40칸).
// - 성끼리는 가장자리 출입구로 지도 위치대로 잇는다. 성 안의 본산 입구(안쪽 출입구)로 각 문파 본산에 들어간다.
// - 개봉은 하남성 동쪽의 성 안 마을(지역 개봉), 숭산 소림사는 개봉 북쪽으로 그대로 잇는다.
// map: 무림전도(2000×1333)에서의 자리, 천하 지도 창에 그린다
// size: 실제 면적(만 ㎢)에 비례한 한 변 칸 수. 하남(16.7만 ㎢)=48칸 기준, 칸 수 = 48×√(면적/16.7만). 해남도만 본산 입구가 들어가도록 30칸으로 올렸다.
const PROV=GD.PROV;
// 성을 40×40 맵 여러 장으로 나눈다 (2026-10-09 사용자 결정, g_split.js): 한 변 맵 수 = round(실제 칸 수/32).
// 무림전도를 80%로 줄인 셈이다. 성 전체는 (맵 수×40)칸으로 한 번에 만들고 40칸씩 잘라 보여 준다.
for(const p of Object.values(PROV)){p.real=p.size;p.cols=Math.max(1,Math.round(p.size/32));p.size=p.cols*40}
const pvId=k=>'pv_'+k;
// 이웃: [성A, A쪽 가장자리, 자리(0~1), 성B, B쪽 가장자리, 자리]
const PV_LINKS=GD.PV_LINKS;
const pvEdge=(S,sd,t)=>{const v=Math.floor(t*S)+.5;return sd==='n'?{x:v,y:1.2}:sd==='s'?{x:v,y:S-1.4}:sd==='w'?{x:1.2,y:v}:{x:S-1.4,y:v}};
const pvIn=(S,sd,t)=>{const v=Math.floor(t*S)+.5;return sd==='n'?{x:v,y:3.6}:sd==='s'?{x:v,y:S-3.8}:sd==='w'?{x:3.6,y:v}:{x:S-3.8,y:v}};
const pvOfSect=sid=>Object.keys(PROV).find(k=>PROV[k].sects.includes(sid));
// 성 안 출입구(본산 입구·개봉) 자리: 가장자리에서 7칸 이상, 서로 9칸 이상 떨어뜨린다
function pvInner(k,p){
  const S=p.size,r=rng(5300+k.length*97+k.charCodeAt(0)*13),pts=[];
  // 무림전도에 자리가 있는 문파와 개봉은 그 자리로 (g_landmark.js), 나머지는 예전처럼 떨어진 빈자리
  if(k==='henan'){const q=lmSectSpot(k,'_gaebong',S,pts);pts.push({...q,to:'gaebong'})}
  for(const sid of p.sects){const q=lmSectSpot(k,sid,S,pts);if(q)pts.push({...q,to:'hq_'+sid})}
  for(const sid of p.sects){if(LM_SECT[sid])continue;let best=null;for(let t=0;t<200;t++){const x=7+Math.floor(r()*(S-14))+.5,y=7+Math.floor(r()*(S-14))+.5;
    if(Math.hypot(x-S/2,y-S/2)<6)continue;const d=Math.min(99,...pts.map(q=>Math.hypot(q.x-x,q.y-y)));if(d>=9){best={x,y};break}if(!best||d>best.d)best={x,y,d}}
    pts.push({x:best.x,y:best.y,to:'hq_'+sid})}
  return pts}
// 바닥 그림은 본산 그림을 같이 쓴다 (테마 이름이 다르면 풀빛만 고른다)
const PV_PAINT=GD.PV_PAINT;
HQ_GRASS.miao=[48,66,40];HQ_GRASS.subtrop=[34,76,36];HQ_GRASS.plateau=[70,74,52];HQ_GRASS.steppe=[78,100,50];HQ_GRASS.india=[88,92,46];
const PV_BEAST=GD.PV_BEAST;
// 지형 규칙: base 바닥, alt(높은 곳) 바닥, 나무·바위 밀도, 물(강·호수·바다)
const PV_TH=GD.PV_TH;
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
  REGIONS[id]={name:p.n,prov:k,size:S,theme:p.th,gen:()=>genProv(id,k,p),bake:()=>N>48?chunkGround(PV_PAINT[p.th]||p.th):bakeHQ(PV_PAINT[p.th]||p.th),gates,bosses:[],npcs:[],spawns,
    zone:(x,y)=>{let b=null,bd=6;for(const g of gates)if(g.inner){const d=Math.hypot(g.x-x,g.y-y);if(d<bd){bd=d;b=g}}
      const m=lmNear(REGIONS[id],x,y);if(m&&(!b||Math.hypot(m.x-x,m.y-y)<bd))return `${p.n} · ${m.n}`;
      return b?`${p.n} · ${b.label} 어귀`:Math.hypot(x-S/2,y-S/2)<5?`${p.n} 객잔 거리`:p.n}};
}
REGIONS.sungsan.prov='henan';REGIONS.gaebong.prov='henan';
// 성 지도: 출입구마다 한가운데 객잔 거리로 굽이진 길을 낸다. 물을 건너는 길은 다리가 된다.
function genProv(id,k,p){
  const R=REGIONS[id],S=N,T=PV_TH[p.th],r=rng(8800+k.length*131+k.charCodeAt(1)*7),o1=k.charCodeAt(0)*.05,C=Math.floor(S/2);
  map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const road=new Set(),mark=(x,y)=>{for(const[i,j]of[[x,y],[x+1,y],[x,y+1],[x+1,y+1]])if(i>=1&&j>=1&&i<S-1&&j<S-1)road.add(i+','+j)};
  for(const g of[...R.gates,...(R.lairs||[]),...(R.marks||[]).filter(m=>m.t==='c'||m.t==='s')]){let x=Math.max(1,Math.min(S-3,Math.floor(g.x))),y=Math.max(1,Math.min(S-3,Math.floor(g.y)));
    for(let n=0;n<S*4&&(x!==C||y!==C);n++){mark(x,y);const dx=C-x,dy=C-y;if(dy===0||(dx!==0&&r()<Math.abs(dx)/(Math.abs(dx)+Math.abs(dy))))x+=Math.sign(dx);else y+=Math.sign(dy)}mark(C,C)}
  const water=(x,y)=>{
    if(T.river){const w=T.river.w||2,ry=Math.floor(T.river.y*S+2.5*Math.sin(x*.18+o1));if(y>=ry&&y<ry+w)return true}
    if(T.lake){const L=T.lake;if(((x/S-L.x)/L.rx)**2+((y/S-L.y)/L.ry)**2<1)return true}
    if(T.sea==='e'&&x>S*.86+2*Math.sin(y*.3))return true;
    if(T.sea==='s'&&y>S*.86+2*Math.sin(x*.3))return true;
    if(T.pools&&fbm(x*.21+o1,y*.21)>T.pools)return true;return false};
  for(let y=0;y<S;y++){map[y]=[];objs[y]=[];for(let x=0;x<S;x++){
    const hi=fbm(x*.15+o1,y*.15+o1*.6),rd=road.has(x+','+y),near=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>road.has((x+dx)+','+(y+dy)));
    let g=T.base;if(T.low?hi<T.altAt:hi>T.altAt)g=T.alt;const wt=water(x,y);if(wt)g=2;if(rd)g=wt?3:1;
    let o=null;const edge=x<=1||y<=1||x>=S-2||y>=S-2;
    if(!rd&&!wt){if(x===0||y===0||x===S-1||y===S-1)o=r()<.6?T.tree:'rock';else if(edge)o=r()<.7?(r()<.6?T.tree:'rock'):null;
      else if(!near&&Math.hypot(x-C,y-C)>4){const v=r(),cliff=fbm(x*.3+o1,y*.3);o=g===6&&cliff>.64?'rock':v<T.tv?T.tree:v<T.tv+T.rv?'rock':v<T.tv+T.rv+(T.bamboo||0)?'bamboo':null}}
    map[y][x]={g,v:r()};objs[y][x]=o}}
  lmPaint(R,S,T,road,r);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(map[y][x].g===3&&(map[y-1]&&map[y-1][x].g===2||map[y+1]&&map[y+1][x].g===2))rails.push({x,y});
  // 한가운데 객잔 거리
  const inn={x:C+2,y:C-4,w:3,h:2,kind:'inn'};let ok=true;for(let j=inn.y;j<inn.y+inn.h;j++)for(let i=inn.x;i<inn.x+inn.w;i++)if(road.has(i+','+j)||map[j][i].g===2)ok=false;
  if(ok){for(let j=inn.y;j<inn.y+inn.h;j++)for(let i=inn.x;i<inn.x+inn.w;i++){objs[j][i]='B';map[j][i].g=4}builds.push(inn)}
  for(const[x,y]of[[C-2,C-2],[C+3,C+3],[C-2,C+3]])if(!road.has(x+','+y)&&map[y][x].g!==2){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  const put=(t,x,y)=>{if(walk(x,y)&&!road.has(x+','+y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  const want=(t,n,okg)=>{for(let i=0;i<400&&nodes.filter(q=>q.t===t).length<n;i++){const x=2+Math.floor(r()*(S-4)),y=2+Math.floor(r()*(S-4));if(okg(map[y][x].g))put(t,x,y)}};
  // 소굴: 둘레를 비우고 흙·바위 바닥, 산채는 천막
  for(const L of R.lairs||[]){const cx=Math.floor(L.x),cy=Math.floor(L.y);for(let j=cy-4;j<=cy+4;j++)for(let i=cx-4;i<=cx+4;i++)if(i>0&&j>0&&i<S-1&&j<S-1&&Math.hypot(i-cx,j-cy)<4.6){objs[j][i]=null;if(map[j][i].g!==1)map[j][i].g=map[j][i].g===2?1:L.g}
    if(L.tents)for(const[dx,dy]of[[-3,-2],[3,-2],[-3,2]]){const x=cx+dx,y=cy+dy;if(!road.has(x+','+y)){objs[y][x]='tent';tents.push({x,y})}}}
  // 본산 입구 이정표 옆에 그 문파 깃발
  for(const g of R.gates)if(g.inner&&g.to.startsWith('hq_')){const x=Math.floor(g.x),y=Math.floor(g.y);for(const[dx,dy]of[[3,-1],[-3,-1],[3,1],[-3,1]]){const fx=x+dx,fy=y+dy;if(fx>0&&fy>0&&fx<S-1&&fy<S-1&&!road.has(fx+','+fy)&&map[fy][fx].g!==2&&!objs[fy][fx]){objs[fy][fx]='flag:'+g.to.slice(3);break}}}
  const sc=S*S/1600;want('herb',Math.round(8*sc),g=>g===0||g===7||g===9);want('wood',Math.round(5*sc),g=>g===0||g===7);want('ore',Math.round(5*sc),g=>g===6||g===8||g===10||g===12);
  if(T.river||T.lake||T.sea){let n=0;for(let i=0;i<600&&n<4;i++){const x=2+Math.floor(r()*(S-4)),y=2+Math.floor(r()*(S-4));if(walk(x,y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>map[y+dy][x+dx].g===2)){put('fish',x,y);n++}}}
}
// 소굴: 성 안의 두목 자리와 그 둘레 몹. 개봉을 중립지대로 바꾸며 흑풍채 산채와 혈교 동굴을 하남성으로 옮겼다
const PV_LAIRS=GD.PV_LAIRS;
for(const[k,list]of Object.entries(PV_LAIRS)){const R=REGIONS[pvId(k)],S=R.size;R.lairs=[];
  // 자리: 출입구·다른 소굴·한가운데 객잔에서 가장 먼 칸 (가장자리에서 7칸 안쪽)
  for(const L of list){let c=null,bd=-1;for(let y=7;y<S-7;y++)for(let x=7;x<S-7;x++){const q={x:x+.5,y:y+.5};
      const d=Math.min(...R.gates.map(g=>Math.hypot(g.x-q.x,g.y-q.y)),...R.lairs.map(o=>Math.hypot(o.x-q.x,o.y-q.y)*.8),Math.hypot(q.x-S/2,q.y-S/2));if(d>bd){bd=d;c=q}}
    const lr={...L,x:c.x,y:c.y};R.lairs.push(lr);R.bosses.push([L.boss[0],c.x,c.y+1,L.boss[1]]);
    for(const[kind,cap]of L.sp)R.spawns.push([kind,cap,(x,y)=>Math.hypot(x+.5-c.x,y+.5-c.y)<6.5&&Math.hypot(x+.5-c.x,y+.5-c.y)>1.5])}
  const z=R.zone;R.zone=(x,y)=>{const l=R.lairs.find(q=>Math.hypot(q.x-x,q.y-y)<7);return l?`${R.name} · ${l.n}`:z(x,y)}}
// 무림전도의 도시·명소·산·지형 자리 (g_landmark.js). 출입구·소굴이 정해진 뒤에 놓는다
for(const k of Object.keys(PROV)){const R=REGIONS[pvId(k)];R.marks=lmPlace(k,R.size,R)}
// 지역마다 격자 크기(N 가로, NH 세로)를 정하고 만든다. 테스트에서 gen()을 바로 불러도 크기가 맞도록 모든 지역에 씌운다.
for(const R of Object.values(REGIONS)){const g=R.gen;R.gen=()=>{N=R.size||40;NH=R.h||N;g()}}

// ================= 천하 지도 창 =================
const provOfReg=id=>{const R=REGIONS[id];return R&&R.prov};
// 고른 성(또는 개봉). 지도에서 성을 누르면 바뀌고, 다른 성으로 옮기면 지금 성으로 돌아온다
let wSel=null,wSelAt=null;
const PV_NB=k=>[...new Set(PV_LINKS.flatMap(([a,,,b])=>a===k?[b]:b===k?[a]:[]))].concat(k==='henan'?['gaebong']:[]);
// 지금 성에서 고른 곳까지 성 단위 길 (너비 우선)
function pvRoute(from,to){if(!from||from===to)return[from];const prev={[from]:null},q=[from];
  while(q.length){const c=q.shift();if(c===to)break;for(const n of(c==='gaebong'?['henan']:PV_NB(c)))if(!(n in prev)){prev[n]=c;q.push(n)}}
  if(!(to in prev))return null;const r=[];for(let c=to;c!=null;c=prev[c])r.unshift(c);return r}
const pvName=k=>k==='gaebong'?'개봉':PROV[k].n;
const facCls=s=>'wf-'+(alFac(s.al)==='정'?'j':alFac(s.al)==='마'?'m':'s');
function pvInfo(k){
  const here=REG==='gaebong'?'gaebong':provOfReg(REG),route=pvRoute(here,k);
  const way=!route?'':route.length<2?'<b class="gold">지금 여기 있다</b>':`가는 길: ${route.map(pvName).join(' → ')} <small class="dim">(성 ${route.length-1}곳 이동)</small>`;
  const nb=PV_NB(k==='gaebong'?'henan':k).filter(n=>n!==k).map(n=>`<button type="button" class="btn" data-act="wsel:${n}">${pvName(n)}</button>`).join(' ');
  if(k==='gaebong'){
    const fac=NPCS.filter(n=>!n.board).map(n=>n.n.replace(/ [^ ]+씨$| 할멈$/,'')).join(' · ');
    return `<div class="card"><h4>개봉 <small class="dim">하남성 동쪽의 큰 마을 · 중립지대</small></h4>
      <p>${way}</p><p class="note">몬스터 없이 사슴·토끼·양·말·멧돼지 같은 짐승과 양민만 다닌다. 정파·사파·마교 누구도 여기서 싸우지 않는다.</p>
      <p class="note">시설: ${fac}</p><p class="note">역참 말로 모든 문파 본산과 바로 오간다(은자 20).</p><p class="note">이웃: ${nb}</p></div>`}
  const p=PROV[k],R=REGIONS[pvId(k)],sects=(k==='henan'?['shaolin',...p.sects]:p.sects).map(sid=>SECTS[sid]);
  const facs=[...new Set(p.sects.map(sid=>alFac(SECTS[sid].al)))];
  const fname={정:'<b class="wf-j">정파 무인</b>',사:'<b class="wf-s">사파 무인</b>',마:'<b class="wf-m">마교도</b>'};
  const fighters=['정','사','마'].map(f=>fname[f]+(facs.includes(f)?' 많음':' 드묾')).join(' · ');
  const beasts=PV_BEAST[p.th].map(b=>b[0]).join(' · ');
  const sl=sects.map(s=>`<b class="${facCls(s)}">${s.n}</b>${P.sect===s.id?' <small class="good">내 문파</small>':''} <small class="dim">${alFac(s.al)==='정'?'정의맹':alFac(s.al)==='마'?'마교':'사천맹'} · 본산 ${hqPlace(s)}</small>`).join('<br>');
  const lairs=(R.lairs||[]).map(l=>`<b class="bad">${l.n}</b>(두목 ${l.boss[0]})`).join(' · ');
  return `<div class="card"><h4>${p.n} <small class="dim">${p.d}</small></h4>
    <p>${way}</p>
    <p class="note">맵 ${p.cols}×${p.cols} = ${p.cols*p.cols}장${p.cols>=4?' · 아주 넓다':p.cols>=3?' · 넓다':p.cols<=1?' · 작다':''} · 한가운데 객잔 거리</p>
    <h4 style="margin:6px 0 2px">문파 ${sects.length}곳</h4>${sects.length?`<p>${sl}</p>`:'<p class="note">이 성에는 문파 본산이 없다.</p>'}
    <p class="note">무인: ${fighters} · 산적</p><p class="note">짐승: ${beasts}</p>
    ${lairs?`<p class="note">소굴: ${lairs}</p>`:''}
    ${lmInfo(R)}
    <p class="note">이웃 성: ${nb}</p></div>`}
function pWorld(){
  const here=provOfReg(REG),cur0=REG==='gaebong'?'gaebong':here;
  if(wSelAt!==REG){wSelAt=REG;wSel=cur0}const sel=wSel||cur0,X=v=>(v-300)*.44,Y=v=>(v-330)*.44;
  const lines=PV_LINKS.map(([a,,,b])=>{const A=PROV[a].map,Bm=PROV[b].map;return `<line x1="${X(A[0])}" y1="${Y(A[1])}" x2="${X(Bm[0])}" y2="${Y(Bm[1])}"/>`}).join('');
  const nodes=Object.entries(PROV).map(([k,p])=>{const[x,y]=p.map,me=k===here&&REG!=='gaebong';
    return `<g class="pv${me?' me':''}${k===sel?' sel':''}" data-act="wsel:${k}"><circle class="hit" cx="${X(x)}" cy="${Y(y)}" r="18"/>${k===sel?`<circle class="ring" cx="${X(x)}" cy="${Y(y)}" r="13"/>`:''}<circle cx="${X(x)}" cy="${Y(y)}" r="${me?9:6}"/><text x="${X(x)}" y="${Y(y)-12}">${p.n}</text></g>`}).join('');
  const P0=PROV.henan.map,gx=X(P0[0])+18,gy=Y(P0[1]);
  const gae=`<g class="pv city${REG==='gaebong'?' me':''}${sel==='gaebong'?' sel':''}" data-act="wsel:gaebong"><circle class="hit" cx="${gx}" cy="${gy}" r="14"/>${sel==='gaebong'?`<circle class="ring" cx="${gx}" cy="${gy}" r="10"/>`:''}<rect x="${gx-4}" y="${gy-4}" width="8" height="8"/><text x="${gx+20}" y="${gy+16}">개봉</text></g>`;
  const cur=here?PROV[here]:null;
  return `<svg class="world" viewBox="-20 -10 600 500" role="img" aria-label="천하 지도">${lines}${nodes}${gae}</svg>
    <p class="note">지금 있는 곳: <b class="gold">${REGION().name}</b>${cur&&REGION().name!==cur.n?` (${cur.n})`:''} · <span class="dim">지도에서 성을 누르면 그 지역 정보를 본다</span></p>
    ${pvInfo(sel)}
    <p class="note"><b class="wf-j">정파(정의맹)</b> · <b class="wf-s">사파(사천맹)</b> · <b class="wf-m">마교</b></p>
    <p class="note dim">성 가장자리의 이정표로 이웃 성에 가고, 성 안의 이정표로 문파 본산에 들어간다. 역참 말을 타면 개봉과 본산 사이를 바로 오간다.</p>`}
$('mini').addEventListener('click',()=>{if(playing)openPanel('world')});

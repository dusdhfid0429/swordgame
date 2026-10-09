// ================= 본산 여러 맵: 문파 크기만큼 본산이 깊다 =================
// 사용자 결정(2026-10-08): 대문파 4맵, 중견문파 2맵, 소문파 1맵, 마교 8맵. 설계: docs/세력_문파_설계.md 18장
// - 맵은 모두 40×40. 아래(남쪽) 출입구로 들어와 위(북쪽) 출입구로 더 깊이 간다.
// - 대문파: 산문 → 외원 → 본산(장문인) → 후산.  중견문파: 산문 → 본산.  소문파: 본산 하나.
//   소림사는 숭산 맵 중턱 포털로 들어가는 본산(방장) 뒤로 나한당 연무장 → 탑림 → 달마동이 붙는다 (g_lmmap.js).
//   마교 여덟 맵은 g_magyo.js에서 같은 틀로 만든다.
// - 산문: 바위 벽과 망루 둘, 문지기 제자. 적 세력 무인은 산문 밖 어귀까지 쳐들어온다.
// - 외원: 숙소와 연무장, 제자가 많다. 외원 총관에게서 임무와 비급(공적)을 받는다.
// - 후산: 제자만 들어간다. 장로에게 문파 패시브·보법을 배우고, 약초·광석이 많다.
// - 역참 말은 본산(장문인 맵) 아래 출입구에 내린다.
const ST_PATH=(y,sd,y0,y1)=>20+Math.round(3*Math.sin(y*.23+sd)*Math.max(0,Math.min(1,(y1-y)/4,(y-y0)/4)));
// c: {id, s(문파), th(지형), seed, mg(마교 전각), yard:[x0,y0,x1,y1](포장 마당), top(위로 더 갈 수 있나), topX,
//     wall(바위 벽 y), builds, lamps, flags, nodes:{herb,ore,chest:[x,y]}}
function genStage(c){
  N=40;const r=rng(c.seed),sd=c.seed%7*.9,o1=c.seed%13*.7,o2=c.seed%11*.6,th=c.th;map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const yd=c.yard,topX=c.topX??20,yEnd=yd?yd[3]:c.top?0:12,road=y=>ST_PATH(y,sd,yEnd,38);
  const onRoad=(x,y)=>(y>=yEnd&&(x===road(y)||x===road(y)+1))||(c.top&&yd&&y<=yd[1]&&(x===topX||x===topX+1));
  const inYard=(x,y)=>yd&&x>=yd[0]&&x<=yd[2]&&y>=yd[1]&&y<=yd[3];
  const tree=th==='peak'||th==='snow'||th==='dark'?'pine':'tree';
  for(let y=0;y<N;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){
    const hi=fbm(x*.17+o1,y*.17+o2),rd=onRoad(x,y),near=Math.abs(x-road(Math.max(y,yEnd)))<=2;
    let g=HQ_BASE[th]??0;
    if(th==='peak'){if(hi>.62)g=6;if(y<=3)g=8}else if(th==='snow'){if(hi<.36)g=6}else if(th==='forest'){if(hi>.68)g=7}
    else if(th==='lake'){if(hi>.7&&!near)g=2}else if(th==='manor'){if(hi>.66)g=7}else if(th==='swamp'){if(hi>.66&&!near)g=2;else if(hi<.3)g=0}
    else if(th==='canyon'){if(hi>.6)g=6}else if(th==='dark'){if(hi>.63)g=6;else if(hi<.28)g=10}
    if(inYard(x,y))g=4;if(rd)g=g===2?3:1;
    let o=null;const edge=x<=1||y<=1||x>=N-2||y>=N-2;
    if(x===0||y===0||x===N-1||y===N-1)o=r()<.6?tree:'rock';
    else if(edge&&g!==2)o=r()<.75?(r()<.65?tree:'rock'):null;
    else if(!rd&&!inYard(x,y)&&g!==2&&!near){const v=r(),cliff=fbm(x*.3+o2,y*.3+o1);
      if(th==='peak'||th==='snow'||th==='dark')o=cliff>.67?'rock':v<.14?'pine':v<.18?'rock':null;
      else if(th==='forest')o=v<.16?'tree':v<.25?'pine':v<.3&&hi<.45?'bamboo':null;
      else if(th==='manor')o=v<.05?'tree':v<.06?'rock':null;
      else if(th==='canyon')o=cliff>.62?'rock':v<.08?'rock':v<.1?'tree':null;
      else o=v<.08?'tree':v<.1?'rock':null}
    map[y][x]={g,v:r()};objs[y][x]=o}}
  // 산문 벽: 길만 터 두고 가로로 막는다. 길 양옆에 망루
  for(const w of[].concat(c.wall||[])){const rx=road(w);for(let y=w;y<=w+1;y++)for(let x=1;x<N-1;x++)if(Math.abs(x-rx-.5)>1.5){objs[y][x]='rock';if(map[y][x].g===2)map[y][x].g=6}
    c.builds=[...(c.builds||[]),{x:rx-4,y:w-1,w:2,h:2},{x:rx+4,y:w-1,w:2,h:2}]}
  for(const b0 of c.builds||[]){const b={...b0,mg:c.mg};for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++){objs[j][i]='B';if(map[j][i].g===2||map[j][i].g===1)map[j][i].g=4}builds.push(b)}
  for(const[x,y]of c.lamps||[])if(objs[y][x]==null&&!onRoad(x,y)){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  if(c.flags)placeFlags(c.s.id,c.flags);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(map[y][x].g===3)rails.push({x,y});
  const put=(t,x,y)=>{if(walk(x,y)&&!onRoad(x,y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  const want=(t,n,ok)=>{for(let i=0;i<500&&nodes.filter(q=>q.t===t).length<n;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if(!inYard(x,y)&&ok(map[y][x].g))put(t,x,y)}};
  const nd=c.nodes||{};want('herb',nd.herb??5,g=>g===0||g===7||g===9||g===11);want('ore',nd.ore??4,g=>g===6||g===8||g===10||g===11);want('wood',nd.wood??3,g=>g===0||g===9);
  if(nd.chest){const[x,y]=nd.chest;objs[y][x]=null;nodes.push({t:'chest',x:x+.5,y:y+.5,cd:0})}
}
// 맵 하나를 지역으로 등록한다
function stageRegion(c){
  const R={name:c.name,hq:c.s.id,theme:c.th,size:40,stage:c,gen:()=>genStage(c),bake:()=>bakeHQ(c.th),zone:c.zone||(()=>c.name),
    spawns:c.spawns||[],bosses:[],gates:[],npcs:c.npcs||[]};
  REGIONS[c.id]=R;return R}
const stTopX=id=>{const R=REGIONS[id];return R.stage?R.stage.topX??20:R.topX??17};
// ids: 입구부터 가장 깊은 곳까지. 성(省) 지도의 출입구는 첫 맵으로, 각 맵은 위 출입구로 다음 맵과 잇는다.
// need: 다음 맵에 들어갈 조건 (막히면 까닭 글자)
function linkChain(s,ids){
  const master=hqId(s),M=REGIONS[master],out=M.gates.find(g=>g.to.startsWith('pv_')||g.to==='gaebong');
  if(ids[0]!==master&&out){
    for(const R of Object.values(REGIONS))for(const g of R.gates||[])if(g.to===master&&R!==M&&(R.prov||g.inner)){g.to=ids[0];g.tx=20.5;g.ty=36.2}
    M.gates=M.gates.filter(g=>g!==out);REGIONS[ids[0]].gates.push({...out,x:20.5,y:38.6})}
  for(let i=1;i<ids.length;i++){const a=REGIONS[ids[i-1]],b=REGIONS[ids[i]],tx=stTopX(ids[i-1])+.5;
    a.gates.push({x:tx,y:1.2,to:ids[i],tx:20.5,ty:36.2,label:b.name,need:b.stage&&b.stage.need});
    b.gates.push({x:20.5,y:38.6,to:ids[i-1],tx,ty:3.6,label:a.name})}
  for(const id of ids)REGIONS[id].chain=ids}
// 장문인 맵(genHQ)에 위로 나가는 길을 낸다: 본전 왼쪽(x=17) 뒤로
function carveTop(id,x0=17){const R=REGIONS[id],g0=R.gen;R.topX=x0;R.gen=()=>{g0();
  for(let y=0;y<=8;y++)for(const x of[x0,x0+1]){if(objs[y][x]==='B')break;objs[y][x]=null;if(map[y][x].g!==4)map[y][x].g=1}
  for(let i=lamps.length-1;i>=0;i--)if(objs[Math.floor(lamps[i].y)][Math.floor(lamps[i].x)]!=='lamp')lamps.splice(i,1)}}

// ---- 문파 맵 종류 ----
const memberOnly=s=>()=>P.sect===s.id?null:`${s.n} 제자가 아니면 들어갈 수 없다.`;
function ownSp(s,area,n0,n1){const f=alFac(s.al),[k0,k1]=FAC_KIND[f],sp=[];if(n0)sp.push([k0,n0,area,(x,y)=>mkFac(f,0,x,y,s.id)]);if(n1)sp.push([k1,n1,area,(x,y)=>mkFac(f,1,x,y,s.id)]);return sp}
function foeSp(s,area,n){const own=alFac(s.al);return['정','사','마'].filter(f=>facFoe(f,own)).map(f=>[FAC_KIND[f][0],n,area,(x,y)=>mkFac(f,0,x,y)])}
const beastSp=(th,area)=>(HQ_BEAST[th]||[]).map(([k,c])=>[k,c,area]);
function stGate(s,th,place,i){return{id:`hq_${s.id}_gate`,name:`${place} 산문`,s,th,seed:8100+i*37,top:1,wall:20,
  flags:[[17,21],[23,21],[16,16],[24,16]],lamps:[[17,18],[23,18]],
  zone:(x,y)=>y>=23?`${place} 어귀`:`${place} 산문`,
  spawns:[...ownSp(s,(x,y)=>y>=12&&y<=22,3,0),...foeSp(s,(x,y)=>y>=25,2),...beastSp(th,(x,y)=>y>=25||y<10)]}}
function stOuter(s,th,place,i,o={}){return{id:o.id||`hq_${s.id}_outer`,name:o.name||`${place} 외원`,s,th,seed:8200+i*41,top:1,yard:[9,10,31,28],
  builds:[{x:10,y:11,w:3,h:2},{x:27,y:11,w:3,h:2},{x:10,y:16,w:3,h:2},{x:27,y:16,w:3,h:2},{x:10,y:23,w:3,h:2,kind:'hall'},{x:27,y:23,w:3,h:2,kind:'hall'}],
  lamps:[[14,14],[26,14],[14,26],[26,26]],flags:[[14,29],[26,29]],
  zone:(x,y)=>x>=9&&x<=31&&y>=10&&y<=28?(o.yardName||`${s.n} 연무장`):`${place} 외원`,
  npcs:[{id:'steward',steward:s.id,n:`${s.n} 외원 총관`,x:13.5,y:25.7,pal:sectPal(s.id,2,'검',{})||masterPal(s)}],
  spawns:[...ownSp(s,(x,y)=>x>=9&&x<=31&&y>=10&&y<=28,6,1),...beastSp(th,(x,y)=>y>=30)]}}
function stBack(s,th,place,i,o={}){return{id:o.id||`hq_${s.id}_back`,name:o.name||`${place} 후산`,s,th,seed:8300+i*43,top:o.top||0,topX:o.topX,yard:o.top?[13,6,27,14]:[14,7,26,14],need:memberOnly(s),
  builds:[{x:18,y:7,w:3,h:3,kind:'pavilion'}],lamps:[[15,9],[25,9]],nodes:{herb:12,ore:9,wood:4,chest:o.chest},
  zone:()=>o.name||`${place} 후산`,
  npcs:[{id:'elder',elder:s.id,n:o.elderN||`${s.n} 장로`,x:24.5,y:11.5,pal:sectPal(s.id,4,'검',{master:1})||masterPal(s)}],
  spawns:[...ownSp(s,(x,y)=>y<=16,0,1),...beastSp(th,(x,y)=>y>=18)]}}
// 맵 안 NPC 창
function stewardDlg(n){const s=SECTS[n.steward];return `<p class="note">"${P.sect===s.id?`${rankName(s.id)}, 오늘도 수련인가.`:'외원에 온 손님이군. 일감과 비급은 여기서도 내준다.'}"</p>${sectDetail(s)}`}
function elderDlg(n){const s=SECTS[n.elder];
  if(P.sect!==s.id)return `<p class="note">"${s.n}의 제자가 아니면 가르칠 것이 없네."</p>`;
  return `<p class="note">"${rankName(s.id)}, 후산까지 올라왔으니 마음을 단단히 하게."</p>${pasSectHtml(s)}${bobSectHtml(s)}${s.id==='cheonma'?mgOrgHtml():''}`}
hook('npcDlg',c=>{if(c.html==null)c.html=c.n.steward?stewardDlg(c.n):c.n.elder?elderDlg(c.n):null});
// 출입구 조건: 막히면 한 걸음 물러난다
hook('gate',c=>{
  if(P&&P.hp>0&&!G.duel&&(P.reg||'gaebong')===REG&&!P.gateLock)for(const g of REGION().gates)if(g.need&&dist(g,P)<.8){const no=g.need();
    if(no){log(no,'info');addText(P.x,P.y,'출입 금지','#e07a5a');P.y+=g.y<N/2?1.3:-1.3;P.path=null;P.gateLock=1;c.stop=true;return}}});
// 맵이 바뀐 뒤의 예전 저장: 바위·건물 속이나 맵 밖에 서 있으면 아래 출입구 앞으로
hook('regionLoaded',id=>{if(P&&P.reg===id&&id.startsWith('hq_')&&!walkAt(P.x,P.y)){P.x=20.5;P.y=36.2}});

// ---- 문파마다 맵 잇기 (마교는 g_magyo.js) ----
const MID_N=Object.values(SECTS).filter(s=>s.tier==='mid').length;
Object.values(SECTS).forEach((s,i)=>{
  if(s.tier==='one'||s.tier==='small')return;
  if(s.id==='shaolin'){const th='peak',pl='소림사';
    const a=stageRegion(stOuter(s,th,pl,i,{id:'hq_shaolin_yard',name:'소림 나한당',yardName:'나한당 연무장'})),
      b=stageRegion(stBack(s,th,pl,i,{id:'hq_shaolin_tower',name:'소림 탑림',top:1,elderN:'소림 계율원 수좌'})),
      c=stageRegion(stBack(s,th,pl,i+1,{id:'hq_shaolin_cave',name:'달마동',elderN:'달마동 면벽승',chest:[23,8]}));
    a.stage.need=null;carveTop('hq_shaolin');linkChain(s,['hq_shaolin',a.stage.id,b.stage.id,c.stage.id]);return}
  const[th,place]=HQ_THEME[s.id],gate=stageRegion(stGate(s,th,place,i));
  if(s.tier==='mid'){linkChain(s,[gate.stage.id,hqId(s)]);return}
  const outer=stageRegion(stOuter(s,th,place,i)),back=stageRegion(stBack(s,th,place,i));
  carveTop(hqId(s));linkChain(s,[gate.stage.id,outer.stage.id,hqId(s),back.stage.id]);
});

// ================= 마교: 문파 하나로 세력 하나 =================
// 정의맹·사천맹은 문파 여럿이 모인 연합이고, 마교(천마신교)는 문파 하나가 그대로 세력이다. 설계: docs/세력_문파_설계.md 17장
// - 조직: 교주 천마 → 부교주 → 사대호법 → 장로원 → 오당(당주) → 향주 → 정예교도 → 교도. 직위는 일곱 단(g_faction.js SRANK.magyo).
// - 오당: 입교한 뒤 오당 광장에서 당 하나에 든다. 일반 무공은 당마다 하나씩이라 자기 당 무공만 익히고(공적 30% 싸다),
//   장로가 되면 다른 당 무공도 익힌다. 고급 무공(천마검법·천마신장)은 교 전체의 것. 마교는 바깥 사람에게 비급을 주지 않는다.
// - 본거지: 다른 문파의 40×40 본산과 달리 신강 십만대산 전체(72×72)가 마교 땅이다.
//   남쪽 협곡 → 천마관(관문) → 마교 성읍(객잔·병기당·독약당·역참) → 오당 광장(당마다 전각과 당주) → 천마신전(교주).
//   전각은 검은 벽에 붉은 기와. 마교도가 성읍과 광장을 지키고, 정·사 무인은 관문 밖 협곡까지만 쳐들어온다.
const MDANG={
  hyeolma:{n:'혈마당',art:'S_cheonma_0',cls:'권',d:'피를 끓여 쓰는 장법의 당. 마교의 선봉'},
  maryeong:{n:'마령당',art:'S_cheonma_1',cls:'도',d:'귀기 어린 도법으로 적진을 가르는 당'},
  hyeolyeong:{n:'혈영대',art:'S_cheonma_4',cls:'창',d:'붉은 그림자처럼 들이치는 창기병'},
  gwiryeong:{n:'귀령당',art:'S_cheonma_5',cls:'봉',d:'곤으로 관문과 신전을 지키는 수비의 당'},
  amhyeol:{n:'암혈당',art:'S_cheonma_6',cls:'궁',d:'어둠 속에서 독시를 날리는 암살과 척후의 당'}};
const MG_ELDER=4;   // 장로부터 다른 당 무공도 익힌다
const dangOfArt=id=>Object.keys(MDANG).find(k=>MDANG[k].art===id);
const dangDisc=id=>P&&P.sect==='cheonma'&&P.dang&&MDANG[P.dang].art===id?.7:1;
// 마교 무공을 익힐 수 없는 까닭 (없으면 '')
function mgArtBlock(a){
  if(!P||P.sect!=='cheonma')return '교도만';if(a.hi)return '';
  const d=dangOfArt(a.id);if(!d||d===P.dang)return '';
  if(!P.dang)return '당에 든 뒤';
  return rankIdx('cheonma')>=MG_ELDER?'':`${MDANG[d].n} 무공 · 장로부터`}
function mgJoinDang(k){const D=MDANG[k];if(!D||P.sect!=='cheonma'||P.dang)return false;
  P.dang=k;const a=ARTS[D.art];if(!P.arts[a.id])P.arts[a.id]={p:0,f:a.forms.map((f,i)=>i===0)};else P.arts[a.id].f[0]=true;
  log(`${D.n}에 들었습니다. 당의 무공 [${a.n}]의 첫 초식 [${a.forms[0].n}]을(를) 익혔습니다. 당 무공 비급은 공적이 30% 쌉니다.`,'xp');
  showBanner(D.n,'천마신교 오당');P.feats.push(`${Math.floor(P.age)}세에 천마신교 ${D.n}에 들었다`);return true}

// ---- 화면 ----
function mgOrgHtml(){const i=P.sect==='cheonma'?rankIdx('cheonma'):-1,R=SRANK.magyo;
  const al=k=>Object.values(SECTS).filter(s=>s.al===k).length;
  return `<div class="card"><h4>천마신교의 짜임 <small class="dim">문파 하나가 곧 세력</small></h4>
    <p>교주 천마 → ${R.slice(1).reverse().map((n,k)=>{const j=R.length-1-k;return j===i?`<b class="gold">${n}</b>`:n}).join(' → ')} → ${i===0?'<b class="gold">교도</b>':'교도'}</p>
    <p>오당: ${Object.entries(MDANG).map(([k,D])=>`${P.dang===k?`<b class="gold">${D.n}</b>`:D.n}(${CLASS[D.cls].n})`).join(' · ')}</p>
    <p class="note">정의맹 ${al('jeong')}문파, 사천맹 ${al('sacheon')}문파와 홀로 맞선다. 입교하면 오당 광장에서 당 하나에 든다. 자기 당 무공만 익히다가 장로가 되면 다른 당 무공도 익힌다. 직위는 다른 세력보다 두 단 높은 호법·부교주까지 오른다.</p></div>`}
function dangDlg(n){const D=MDANG[n.dang],a=ARTS[D.art],s=SECTS.cheonma,mine=P.dang===n.dang;
  const hi=P.sect!=='cheonma'?`"교도가 아니면 이 전각에 발을 들이지 마라."`:mine?`"${rankName('cheonma')}, ${D.n}의 이름을 높여라."`:P.dang?`"${MDANG[P.dang].n} 사람이 무슨 일인가."`:`"아직 당이 없군. ${D.n}에 들겠는가?"`;
  const st=A(a.id),blk=mgArtBlock({id:a.id});
  const join=P.sect==='cheonma'&&!P.dang?`<div class="row2"><span class="note">당은 한 번 고르면 바꿀 수 없다. 들면 [${a.n}]의 첫 초식을 바로 익힌다.</span>${B('mdang:'+n.dang,`${D.n} 입당`,{pri:1})}</div>`:'';
  return `<p class="note">${hi}</p><div class="row2"><span class="note">${embImg('cheonma',22)} <b>${D.n}</b> · 천마신교 오당${mine?' · <span class="good">내 당</span>':''}</span></div><p class="note">${D.d}.</p>${join}
    <div class="list"><div class="it"><div style="color:rgb(${a.c})">${a.n} ${gradeTag(a.grade)} <small class="dim">${D.n} 무공</small><span>${CLASS[a.cls].n}·${a.el} · 초식 ${a.forms.length}개${st?` · 익힌 초식 ${st.f.filter(Boolean).length}`:''}${blk?` · ${blk}`:mine?' · 비급 공적 30% 할인':''}</span></div></div></div>
    <p class="note">비급은 천마신전의 교주에게서 공적으로 받는다.</p>${mgOrgHtml()}`}
{const _hq=hqDlg;hqDlg=function(n){return n.hq==='cheonma'?_hq(n)+mgOrgHtml():_hq(n)}}
{const _np=pNpc;pNpc=function(n){return n.dang?dangDlg(n):_np(n)}}
{const _sa=sectAct;sectAct=function(a,x,y){
  if(a==='mdang'){mgJoinDang(x);return true}
  const r=_sa(a,x,y);
  if(a==='sjoin'&&x==='cheonma'&&P.sect==='cheonma')setTimeout(()=>log('오당 광장의 다섯 전각 가운데 한 곳을 골라 당에 드세요.','sys'),80);
  if(P.sect!=='cheonma')P.dang=null;
  return r}}

// ---- 십만대산: 마교 본거지 지역 ----
const MG_S=72,MG_C=36;
const mgRoad=y=>MG_C+Math.round(2*Math.sin(y*.14));
// 골짜기 너비: 협곡은 좁고, 성읍·광장은 넓다
const mgHalf=y=>y>=62?7:y>=54?5:y>=38?15:y>=19?17:12;
const MG_HALL={hyeolma:[MG_C-15,21],maryeong:[MG_C-15,27],hyeolyeong:[MG_C-15,33],gwiryeong:[MG_C+12,21],amhyeol:[MG_C+12,27]};
const inMgTown=(x,y)=>y>=38&&y<54&&Math.abs(x-mgRoad(y))<=15,inMgPlaza=(x,y)=>y>=19&&y<38&&Math.abs(x-MG_C)<=16,inMgTemple=(x,y)=>y<19&&Math.abs(x-MG_C)<=11;
function genMagyo(){
  N=MG_S;const r=rng(66601);map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  for(let y=0;y<N;y++){map[y]=[];objs[y]=[];const rx=mgRoad(y),hw=mgHalf(y);for(let x=0;x<N;x++){
    const dx=Math.abs(x-rx),hi=fbm(x*.15+3,y*.15+7),inV=dx<=hw&&y>=2;
    let g=hi>.62?10:hi<.3?6:11;
    if(inMgPlaza(x,y)&&y>=20&&y<=36&&Math.abs(x-MG_C)<=14)g=4;
    if(inMgTemple(x,y)&&y>=3)g=4;
    if(y>=19&&(x===rx||x===rx+1))g=1;
    let o=null;
    if(x===0||y===0||x===N-1||y===N-1)o='rock';
    else if(!inV){const v=r();o=dx>hw+2||v<.7?(v<.12?'pine':'rock'):null}
    else if(g!==4&&g!==1){const v=r();o=dx>=hw-1?(v<.55?'rock':v<.7?'pine':null):v<.035?'pine':v<.06?'rock':null}
    map[y][x]={g,v:r()};objs[y][x]=o}}
  // 천마관: 협곡을 가로막는 바위 벽과 관문 망루 둘
  for(let y=55;y<=60;y++){const rx=mgRoad(y);for(let x=rx-9;x<=rx+10;x++)if(Math.abs(x-rx-.5)>2.5&&x>0&&x<N-1)objs[y][x]='rock'}
  const bs=[{x:mgRoad(57)-4,y:56,w:2,h:2},{x:mgRoad(57)+4,y:56,w:2,h:2},
    // 마교 성읍
    {x:mgRoad(44)-9,y:42,w:3,h:2,kind:'inn'},{x:mgRoad(44)+5,y:42,w:3,h:2,kind:'smith'},{x:mgRoad(49)-9,y:48,w:2,h:2},{x:mgRoad(49)+5,y:48,w:3,h:2},
    {x:mgRoad(40)-13,y:45,w:2,h:2},{x:mgRoad(40)+11,y:45,w:2,h:2},
    // 오당 전각과 장로원
    ...Object.values(MG_HALL).map(([x,y])=>({x,y,w:3,h:2,kind:'hall'})),{x:MG_C+12,y:33,w:3,h:2,kind:'hall'},
    // 천마신전
    {x:MG_C-3,y:5,w:7,h:3,kind:'temple'},{x:MG_C-10,y:8,w:2,h:3},{x:MG_C+9,y:8,w:2,h:3}];
  for(const b of bs){b.mg=1;for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++){objs[j][i]='B';if(map[j][i].g===1)map[j][i].g=4}builds.push(b)}
  // 신전 앞 화톳불, 광장 등롱, 성읍 길 등롱
  const lp=(x,y)=>{if(objs[y][x]==null&&map[y][x].g!==1){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}};
  for(const[x,y]of[[MG_C-4,10],[MG_C+5,10],[MG_C-8,14],[MG_C+9,14],[MG_C-6,20],[MG_C+7,20],[MG_C-6,36],[MG_C+7,36]])lp(x,y);
  for(let y=40;y<=52;y+=4){const rx=mgRoad(y);lp(rx-2,y);lp(rx+3,y)}
  placeFlags('cheonma',[[mgRoad(54)-2,54],[mgRoad(54)+3,54],[MG_C-2,17],[MG_C+3,17],[MG_C-2,38],[MG_C+3,38]]);
  const put=(t,x,y)=>{if(walk(x,y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  const want=(t,n,ok)=>{for(let i=0;i<600&&nodes.filter(q=>q.t===t).length<n;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if(ok(map[y][x].g,x,y))put(t,x,y)}};
  want('ore',14,g=>g===6||g===10||g===11);want('herb',8,(g,x,y)=>g===11&&y>=54);
}
const MG_ARRIVE={x:mgRoad(67)+.5,y:67.5};
function mgZone(x,y){
  if(Math.abs(x-mgRoad(y))>mgHalf(y)+1)return'십만대산 험봉';
  return y>=61?'십만대산 협곡':y>=54?'천마관':y>=38?'마교 성읍':y>=19?'오당 광장':'천마신전'}
function mgNpcs(){const s=SECTS.cheonma;
  return[{id:'hq',hq:'cheonma',n:'천마신교 교주 천마',x:MG_C+.5,y:9.4,pal:masterPal(s)},
    ...Object.entries(MG_HALL).map(([k,[x,y]])=>({id:'dang_'+k,dang:k,n:`${MDANG[k].n}주`,x:x+1.5,y:y+2.7,pal:sectPal('cheonma',3,MDANG[k].cls,{elite:1})})),
    {id:'inn',n:'마교 객잔 주인',x:mgRoad(44)-7.5,y:44.7,pal:'keeper'},{id:'smith',n:'병기당 대장장이',x:mgRoad(44)+6.5,y:44.7,pal:'smithy'},
    {id:'pharm',n:'독약당 의원',x:mgRoad(49)-8,y:50.7,pal:'keeper'},{id:'post',n:'역참 마부',x:MG_ARRIVE.x+2.5,y:MG_ARRIVE.y-.6,pal:'keeper'}]}
function mgSpawns(){
  const own=(x,y)=>(inMgTown(x,y)||inMgPlaza(x,y)||inMgTemple(x,y)),out=(x,y)=>y>=61;
  const sp=[['마교도',9,own,(x,y)=>mkFac('마',0,x,y,'cheonma')],['마교 고수',3,(x,y)=>inMgPlaza(x,y)||inMgTemple(x,y),(x,y)=>mkFac('마',1,x,y,'cheonma')],
    ['정파 무인',2,out,(x,y)=>mkFac('정',0,x,y)],['사파 무인',2,out,(x,y)=>mkFac('사',0,x,y)],['늑대',3,(x,y)=>y>=54&&!own(x,y)],['호랑이',1,(x,y)=>y>=58]];
  return sp}
{const R=REGIONS.hq_cheonma;
  Object.assign(R,{name:'십만대산 천마신교',size:MG_S,theme:'dark',big:1,arrive:MG_ARRIVE,gen:genMagyo,bake:()=>chunkGround('dark'),zone:mgZone,spawns:mgSpawns(),npcs:mgNpcs()});
  // 신강과 잇는 출입구: 남쪽 협곡 끝
  R.gates.forEach(g=>{g.x=mgRoad(70)+.5;g.y=MG_S-1.4});
  for(const p of Object.values(REGIONS))for(const g of p.gates||[])if(g.to==='hq_cheonma'){g.tx=MG_ARRIVE.x;g.ty=MG_ARRIVE.y}}
// 예전 저장(40×40 본산 시절 자리)에서 불러와 바위 속에 서 있으면 협곡 입구로 옮긴다
{const _lr=loadRegion;loadRegion=function(id){_lr(id);if(id==='hq_cheonma'&&P&&P.reg==='hq_cheonma'&&!walkAt(P.x,P.y)){P.x=MG_ARRIVE.x;P.y=MG_ARRIVE.y}}}

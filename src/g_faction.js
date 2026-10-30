// ================= 세력 무인, 문파 직위, 문파 본산 =================
// 정파·사파·마교 무인 몹은 서로 적이다. 정파와 사파는 서로 싸우고, 마교는 정사 모두를 공격한다.
// 플레이어 편(문파의 세력, 없으면 정·사 성향)과 같은 무인은 먼저 덤비지 않는다.
// 문파마다 본산 지역맵(40×40)이 따로 있고, 개봉 역참에서 말을 타고 간다. 가입은 본산의 장문인에게만 청한다.
// 설계: docs/세력_문파_설계.md 8~10장
const alFac=al=>al==='magyo'?'마':al==='gunbu'?'관':ALLY[al].side;
const FACN=GD.FACN;
// 플레이어 편: 마교 제자면 '마', 문파가 있으면 그 세력, 없으면 타고난 성향
function pfac(){const s=P&&P.sect&&SECTS[P.sect];return s?alFac(s.al):P?P.side:'정'}
// v150 (사용자 버그): 인물 정보에 보이는 소속 세력. 마교에 들면 '마교' (P.side는 태어난 계열이라 정/사로 남는다)
const facName=()=>({정:'정파',사:'사파',마:'마교',관:'관군'})[pfac()]||SIDES[P.side].n;
// 누가 누구와 싸우나: 정↔사, 마교는 모두와, 관군(군부)은 사파·마교와. 정파와 관군은 서로 건드리지 않는다 (2026-10-10 군부)
const FAC_FOE={'정':['사','마'],'사':['정','마','관'],'마':['정','사','관'],'관':['사','마']};
// 천하대전 중에는 구도(G.war.plan)가 적·아군을 정한다 (g_story.js warFoe). 구도에 없는 세력은 평소 표를 따른다
const facFoe=(a,b)=>{if(!a||!b||a===b)return false;const w=typeof warFoe==='function'?warFoe(a,b):null;return w!=null?w:!!FAC_FOE[a]&&FAC_FOE[a].includes(b)};
// 업보가 -100 아래로 떨어진 사람은 조정이 쫓는 죄인: 관군이 편을 가리지 않고 덤빈다
// v176: 표국·상단 행렬을 턴 수배자(P.wanted, g_caravan.js)도 해가 바뀔 때까지 관군이 쫓는다
const outlaw=()=>!!P&&(P.good-P.evil<=-100||P.wanted>0)&&pfac()!=='관';
// 이 무인이 플레이어에게 적인가: 다른 편이거나, 같은 편이라도 공격당해 등을 돌렸으면 적
// v182: 세력·문파 우호도(g_rep.js)가 적대 단계면 적. 우호도를 올리면 적 세력도 먼저 덤비지 않는다
const mobFoeP=e=>e.angry||(e.d.fac==='관'&&outlaw())||(typeof repFoe==='function'?repFoe(e):facFoe(e.d.fac,pfac()));
// 강제공격 (사용자 요청 2026-10-13, 리니지식 토글): 켜면 같은 편 무인도 공격 대상이 되고 범위 초식에도 맞는다 (치면 그대로 배신·악업). 양민은 켜고 직접 눌러야 맞는다.
// PC는 T 키·HUD '강제' 단추, 터치는 오른쪽 세로 열의 네모 단추. 불러오기·새 생에서는 꺼져 있다.
let forceAtk=false;
const peaceful=m=>!!m.d.fac&&!mobFoeP(m)&&!forceAtk;
function toggleForce(v){forceAtk=v==null?!forceAtk:!!v;
  if(!forceAtk&&P&&P.target&&P.target.hp>0&&(peaceful(P.target)||(P.target.d.villager&&!P.target.angry)))P.target=null;
  if(P)log(forceAtk?'강제공격을 켰습니다. 같은 편과 양민도 공격합니다. 치면 배신이 되어 악업이 쌓입니다.':'강제공격을 껐습니다.','info');
  for(const id of['forceb','t_force']){const b=$(id);if(b)b.classList.toggle('on',forceAtk)}}
const FAC_KIND=GD.FAC_KIND;
/* MOBS에 덧붙이던 것은 data/mobs.json 으로 옮김 */
// 옷 색: 정파 흰옷·청띠, 사파 갈색·자주띠, 마교 검은옷·붉은띠, 소림은 가사
const FAC_ROBE=GD.FAC_ROBE;
function facPal(fac,cls,elite,sid){
  const look=sid==='shaolin'?'소림':fac,k=`fac_${look}_${cls}_${elite?1:0}`;
  if(!PAL[k])PAL[k]={...PAL.hero,...FAC_ROBE[look],weapon:CLASS[cls].draw,anim:CLASS[cls].anim,jade:0,beard:elite?1:0,armor:elite&&fac!=='정'?1:0};
  return k}
// 무인 하나를 만든다. sid를 주면 그 문파 제자, 없으면 그 세력의 아무 문파
function mkFac(fac,elite,x,y,sid){
  const s=SECTS[sid]||pick(Object.values(SECTS).filter(q=>alFac(q.al)===fac)),a=pick(s.arts.filter(q=>!q.hi)),cls=a.cls,kind=FAC_KIND[fac][elite?1:0];
  const e=mkMob(kind,x,y),bow=rangedCls(cls);
  const sel=typeof simSectEl==='function'?simSectEl(s.id):a.el;   // 무인의 속성은 문파 심법의 것 (천마신교 = 마, v101)
  e.d={...e.d,el:sel,ranged:bow?1:0};e.el=sel;e.art=a.id;e.reach=bow?(cls==='암'?4:5):cls==='창'?1.8:cls==='봉'?1.6:1.3;
  // 직위: 제자는 속가·정식, 고수는 일대·호법(당주). 옷과 이름이 직위를 따른다
  const rank=typeof popRank==='function'?popRank(s,elite):elite?(Math.random()<.65?2:3):(Math.random()<.35?0:1);e.rank=rank;   // 직위 분포는 문파 인원·무학을 따른다 (g_pop.js)
  e.pal=sectPal(s.id,rank,cls,{elite})||facPal(fac,cls,elite,s.id);e.sect=s.id;e.name=`${s.n} ${rankName(s.id,rank)}`;
  runHooks('facMade',e);return e}
// 0.5초마다 주변의 적 세력 무인을 찾아 노린다
function facScan(e,dt){
  e.fscan=(e.fscan||0)-dt;if(e.fscan>0)return;e.fscan=.45+Math.random()*.2;
  if(e.tgt&&e.tgt.hp>0&&e.tgt.isMob&&dist(e,e.tgt)<12)return;
  if(e.aggro&&!e.tgt&&mobFoeP(e)&&dist(e,P)<4)return;   // 플레이어와 붙어 있으면 그대로
  let b=null,bd=(e.d.aggro||6)+1;
  for(const o of mobs)if(o!==e&&o.hp>0&&o.d.fac&&facFoe(o.d.fac,e.d.fac)){const q=dist(o,e);if(q<bd){bd=q;b=o}}
  if(b){e.tgt=b;e.aggro=true}
}
// 몹끼리의 타격. 쓰러져도 전리품은 없다 (은자는 플레이어가 직접 잡았을 때만 들어온다).
function mobHurt(t,dm,src){
  if(t.hp<=0)return;{const c={t,src,dm};runHooks('mobHurt',c);dm=c.dm}
  dm=Math.max(1,Math.round(dm*(.9+Math.random()*.2)-(t.def||0)));t.hp-=dm;t.hit=.12;t.hurtAt=time;
  if(dist(t,P)<14)addText(t.x,t.y,dm,'#c8b8a0');
  if(t.d.fac&&(!t.tgt||t.tgt.hp<=0||!t.tgt.isMob||Math.random()<.3)){t.tgt=src;t.aggro=true}
  if(t.hp<=0){t.hp=0;fx.push({t:'puff',x:t.x,y:t.y,life:.6});if(P.target===t)P.target=null;runHooks('mobKilled',t,src);
    if(dist(t,P)<12)log(`${src.name}이(가) ${t.name}을(를) 쓰러뜨렸습니다.`,'info')}
}
// 같은 편 무인을 친 대가: 악업, 그 무인과 주변 동도가 등을 돌린다
function facBetray(e){
  if(e.angry)return;
  if(typeof repStE==='function'&&repStE(e)===0){e.angry=1;e.aggro=true;return}   // v182: 이미 원수가 된(적대) 문파는 배신이 아니다
  e.angry=1;e.aggro=true;e.tgt=null;P.evil+=P.side==='정'?6:2;if(typeof repHit==='function')repHit(e);
  for(const o of mobs)if(o!==e&&o.hp>0&&o.d.fac===e.d.fac&&dist(o,e)<6){o.angry=1;o.aggro=true;o.tgt=null}
  log(`같은 편인 ${e.name}을(를) 공격했습니다. 악업이 쌓이고 주변 동도가 등을 돌립니다.`,'dmg');
}
// 플레이어가 무인을 쓰러뜨렸을 때: 적 세력이면 문파 공적, 같은 편이면 악업
function facKill(e){
  if(!e.d.fac)return;const foe=facFoe(e.d.fac,pfac()),grudge=!foe&&typeof repStE==='function'&&repStE(e)===0;
  if(foe){if(P.sect&&SECTS[P.sect]){const v=addMerit(P.sect,e.d.elite?6:2);log(`${SECTS[P.sect].n} 공적 +${v}`,'xp')}}
  else if(grudge)log(`원수가 된 ${e.name}을(를) 쓰러뜨렸습니다.`,'info');   // v182: 적대 단계라 먼저 덤빈 상대. 악업은 없다
  else{P.evil+=P.side==='정'?10:4;log(`동도 ${e.name}을(를) 죽였습니다. 무거운 악업이 쌓였습니다.`,'dmg')}
  if(typeof repKill==='function')repKill(e,foe);
}
// 세력 대립 임무 (기존 임무 풀에 더한다)
SMIS.jeong.push({n:'사파 무인 소탕',kind:'kill',mob:['사파 무인','사파 고수'],cnt:5,merit:20,silver:35},{n:'마교도 토벌',kind:'kill',mob:['마교도','마교 고수'],cnt:4,merit:25,silver:45});
SMIS.sacheon.push({n:'정파 무인 사냥',kind:'kill',mob:['정파 무인','정파 고수'],cnt:5,merit:20,silver:40},{n:'마교도 격퇴',kind:'kill',mob:['마교도','마교 고수'],cnt:4,merit:25,silver:45});
SMIS.magyo.push({n:'정파 척살',kind:'kill',mob:['정파 무인','정파 고수'],cnt:5,merit:22,silver:45},{n:'사파 척살',kind:'kill',mob:['사파 무인','사파 고수'],cnt:5,merit:22,silver:45});
// 개봉은 중립지대라 세력 무인이 순찰하지 않는다

// ================= 문파 직위 =================
// 문파에 있는 동안 얻은 공적을 따로 누적(P.mtot)해 직위가 오른다. 비급에 공적을 써도 직위는 내려가지 않는다.
const SRANK=GD.SRANK;
// 마교만 직위가 일곱 단(호법·부교주). 다른 세력은 다섯 단에서 멈춘다
const RANK_PTS=GD.RANK_PTS;
const rankTop=sid=>{const s=SECTS[sid];return s?SRANK[s.al].length-1:4};
const HI_RANK=GD.HI_RANK;   // 고급 무공 n번째 초식 비급에 필요한 직위
// v153 (사용자): 직위는 경지+1 단까지만 (RANK_CAP). 공적이 넘쳐도 경지가 오르면 그때 오른다 (rankRealmUp)
const rankCap=()=>P?realmIdx()+GD.RANK_CAP.plus:99;
function rankRaw(sid=P.sect){const t=(P.mtot||{})[sid]||0,mx=rankTop(sid);let i=0;while(i<mx&&t>=RANK_PTS[i+1])i++;return i}
// v176 (사용자): 직위는 공적만으로 오르지 않는다. 공적·경지가 닿으면 본산에서 승급 시험을 청해 이겨야 오른다 (g_ranktest.js, P.srank[문파]).
// P.srank는 본산에서 가입할 때 생긴다(옛 저장은 g_save.js v6이 지금 직위로 채운다). P.srank가 없을 때만 옛 규칙(공적·경지로 저절로)을 따른다: 테스트가 문파를 바로 정할 때
const rankIdx=(sid=P.sect)=>P.srank?Math.min(P.srank[sid]||0,rankTop(sid)):Math.min(rankRaw(sid),rankCap());
const capNeed=i=>rk(Math.max(0,i-GD.RANK_CAP.plus));
const rankName=(sid=P.sect,i)=>{const s=SECTS[sid];return s?SRANK[s.al][i??rankIdx(sid)]:null};
function addMerit(sid,v){
  if(!sid||!SECTS[sid])return 0;const member=P.sect===sid;if(member)v=Math.round(v*(1+rankIdx(sid)*.1)*(typeof maengSeatMul==='function'?maengSeatMul(sid):1)*(typeof loreSeatMul==='function'?loreSeatMul(sid):1)*(G.unified&&G.unified.by===alFac(SECTS[sid].al)?worldMul('merit'):1));   // v153: 천하통일한 세력의 문파   // 맹 서열 1위 문파 +15% (g_maeng.js)
  P.merit[sid]=(P.merit[sid]||0)+v;
  if(member){P.mtot=P.mtot||{};const b=rankIdx(sid),rb=rankRaw(sid);P.mtot[sid]=(P.mtot[sid]||0)+v;const a=rankIdx(sid);
    if(P.srank&&rankRaw(sid)>rb&&typeof rtNotice==='function')rtNotice(sid);
    if(!P.srank&&a===b&&rankRaw(sid)>a&&P.capN!==sid+a){P.capN=sid+a;log(`공적은 ${rankName(sid,a+1)}에 닿았지만 경지가 모자라 직위가 오르지 않는다 (${capNeed(a+1)} 이상).`,'info')}
    if(a>b){const n=rankName(sid),s=SECTS[sid];showBanner(`${s.n} ${n}`,'직위가 올랐습니다');log(`${s.n}의 ${n}(으)로 올랐습니다. ${rankPerk(a)}`,'xp');feat(`${s.n}의 ${n}이(가) 되었다`);log(`${n}의 의복으로 갈아입었습니다. ${['','문파 색 옷과 띠','금테와 문파 마크를 단 어깨 망토','허리까지 오는 망토','땅에 끌리는 장로의 망토','붉은 안감을 댄 호법의 망토','부교주의 검붉은 대망토'][a]}.`,'sys')}}
  return v}
// 경지가 오르면 막혀 있던 직위가 오른다 (g_realmfx.js realmGain이 부른다)
function rankRealmUp(r){const was=r-1+GD.RANK_CAP.plus;
  if(P.sect&&SECTS[P.sect]&&P.srank&&typeof rtNotice==='function')rtNotice(P.sect);
  if(P.sect&&SECTS[P.sect]&&!P.srank){const a=rankIdx(),s=SECTS[P.sect];if(a>was&&rankRaw()>was){showBanner(`${s.n} ${rankName()}`,'경지에 걸맞은 직위');log(`경지가 올라 ${s.n}의 ${rankName()}(으)로 올랐습니다. ${rankPerk(a)}`,'xp');feat(`${s.n}의 ${rankName()}이(가) 되었다`)}}
  const al=typeof maengOf==='function'&&maengOf();if(al){const a=maengRank(al);if(a>was&&maengRaw(al)>was){log(`경지가 올라 ${MAENG[al].short}의 ${maengRankName(al)}(으)로 올랐습니다.`,'xp');feat(`${MAENG[al].short}의 ${maengRankName(al)}이(가) 되었다`)}}}
function rankPerk(i){return['','고급 무공 둘째 초식 비급을 받을 수 있습니다.','비급 공적 20% 할인, 고급 무공 셋째·넷째 초식.','고급 무공 다섯째 초식.','고급 무공 마지막 초식.','사대호법: 교주를 곁에서 지킨다.','부교주: 천마 다음 자리. 교 안에서 가장 높은 직위.'][i]||''}
const rankDisc=sid=>P.sect===sid&&rankIdx(sid)>=2?.8:1;
// 해마다 직위에 따른 녹봉
function rankStipend(){const s=P.sect&&SECTS[P.sect];if(!s)return;const i=rankIdx(),v=Math.round(i*15*worldMul('stipend'));if(v>0){P.silver+=v;log(`${s.n} ${rankName()} 녹봉으로 은자 ${v}을(를) 받았습니다.`,'sys')}}
function rankHtml(s){
  const i=rankIdx(s.id),t=(P.mtot||{})[s.id]||0,nx=i<rankTop(s.id)?RANK_PTS[i+1]:0;
  return `<div class="card"><h4>직위 <b>${rankName(s.id)}</b></h4><p>누적 공적 ${t}${nx?` / ${nx} (다음 ${rankName(s.id,i+1)}${i+1>rankCap()?` · <b class="bad">${capNeed(i+1)} 이상</b>`:''})`:' · 최고 직위'} · 공적 획득 +${i*10}% · 녹봉 해마다 은자 ${i*15}${i>=2?' · 비급 공적 20% 할인':''}</p>
    <p class="dim">${SRANK[s.al].map((n,k)=>k===i?`<b>${n}</b>`:n).join(' → ')}</p>${P.srank&&typeof rtHtml==='function'?rtHtml(s):''}</div>`}

// ================= 문파 본산 지역 =================
// [지형, 지명]. 지형: peak 산봉우리, snow 설산, forest 숲, lake 호수, manor 장원, swamp 늪, canyon 붉은 협곡, dark 검은 땅
const HQ_THEME=GD.HQ_THEME;
const hqId=s=>'hq_'+s.id;   // 소림사도 hq_shaolin (숭산은 산 맵, g_lmmap.js)
const hqPlace=s=>HQ_THEME[s.id][1];
function masterTitle(s){const n=s.n;return s.id==='geumgun'?'대장군':s.id==='shaolin'||s.id==='daeroe'?'방장':/파$/.test(n)?'장문인':/방$/.test(n)?'방주':/가$/.test(n)?'가주':/곡$/.test(n)?'곡주':/궁$/.test(n)?'궁주':/사$/.test(n)?'사주':/채$/.test(n)?'채주':/교$/.test(n)?'교주':'문주'}
const POST_FEE=20,POST_AT=GD.POST_AT;
const arriveAt=id=>REGIONS[id]&&REGIONS[id].arrive?REGIONS[id].arrive:id==='gaebong'?POST_AT:id==='sungsan'?{x:10.5,y:36.4}:{x:20.5,y:36.2};
PAL.abbot={...PAL.hero,...FAC_ROBE.소림,jade:0,hair:'#3a2a20',beard:1,weapon:'staff',anim:'swing'};
function masterPal(s){if(typeof sectPal==='function'&&LOOK[s.id])return sectPal(s.id,4,'검',{master:1});const f=alFac(s.al),k='master_'+f;if(!PAL[k])PAL[k]={...PAL.hero,...FAC_ROBE[f],hair:'#cfcac0',beard:1,jade:0,weapon:'none',cape:f==='정'?null:FAC_ROBE[f].cape||'#2a1a10'};return s.id==='shaolin'?'abbot':k}
const hqNpcs=(s,mx,my)=>[{id:'hq',hq:s.id,n:`${s.n} ${masterTitle(s)}`,x:mx,y:my,pal:masterPal(s)},{id:'post',n:'역참 마부',x:22.6,y:36.4,pal:'keeper'}];
const HQ_BEAST=GD.HQ_BEAST;
const inHQ=(x,y)=>x>=12&&x<=28&&y>=3&&y<=18;
// 본산 몹: 제자 다섯과 고수 하나가 지키고, 아래 산길로 적 세력 무인이 쳐들어온다
function hqSpawns(s,th){
  const own=alFac(s.al),[k0,k1]=FAC_KIND[own],out=(x,y)=>y>=21&&y<=34&&!inHQ(x,y);
  const[n0,n1]=s.tier==='big'||s.tier==='one'?[7,2]:s.tier==='mid'?[5,1]:[4,1];   // 인원: 대문파(오대세가 포함) 7+2, 중견 5+1, 소문파 4+1
  const sp=[[k0,n0,inHQ,(x,y)=>mkFac(own,0,x,y,s.id)],[k1,n1,inHQ,(x,y)=>mkFac(own,1,x,y,s.id)]];
  for(const f of['정','사','마','관'])if(facFoe(f,own))sp.push([FAC_KIND[f][0],2,out,(x,y)=>mkFac(f,0,x,y)]);
  for(const[k,c]of HQ_BEAST[th])sp.push([k,c,(x,y)=>(y<20||x<10||x>30)&&!inHQ(x,y)]);
  return sp}
for(const s of Object.values(SECTS)){const[th,place]=HQ_THEME[s.id];
  REGIONS['hq_'+s.id]={name:place,hq:s.id,theme:th,gen:()=>genHQ(s,th),bake:()=>bakeHQ(th),
    zone:(x,y)=>inHQ(x,y)&&y<=16?`${s.n} 본산`:y>=31?`${place} 어귀`:`${place} 산길`,
    spawns:hqSpawns(s,th),bosses:[],gates:[],npcs:hqNpcs(s,20.5,8.7)}}   // 아래 출입구는 본산이 있는 성(省) 지도와 잇는다 (g_province.js)
// 본산 산길: 아래 출입구(x=20)에서 굽이쳐 본산 앞마당(y=16)으로 오른다
const hqPath=(y,sd)=>20+Math.round(3*Math.sin(y*.23+sd)*Math.min(1,(38-y)/4));
// ground: 0 풀, 1 길, 2 물, 3 다리, 4 본산 마당, 6 바위, 7 흙, 8 눈, 9 늪 진흙, 10 붉은 바위, 11 검은 땅, 12 모래, 13 나무 바닥(전각 안)
const HQ_BASE=GD.HQ_BASE;
function genHQ(s,th){
  const r=rng(7000+s.i*131),sd=s.i*.7,o1=s.i*1.7,o2=s.i*.9;map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const lakes=th==='lake'?[{x:8+r()*3,y:25+r()*4,rx:5.5,ry:4},{x:32+r()*2,y:27+r()*3,rx:4,ry:3.5},{x:6,y:9+r()*3,rx:3.5,ry:3}]:[];
  const tree=th==='peak'||th==='snow'||th==='dark'?'pine':'tree';
  for(let y=0;y<NH;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){
    const px=hqPath(y,sd),onPath=y>=16&&(x===px||x===px+1),comp=x>=13&&x<=27&&y>=4&&y<=16,hi=fbm(x*.17+o1,y*.17+o2),arrive=x>=18&&x<=24&&y>=34;
    let g=HQ_BASE[th];
    if(th==='peak'){if(hi>.62)g=6;if(y<=3)g=8}
    else if(th==='snow'){if(hi<.36)g=6}
    else if(th==='forest'){if(hi>.68)g=7}
    else if(th==='lake'){if(lakes.some(l=>((x-l.x)/l.rx)**2+((y-l.y)/l.ry)**2<1))g=2}
    else if(th==='manor'){if(hi>.66)g=7}
    else if(th==='swamp'){if(hi>.64)g=2;else if(hi<.3)g=0}
    else if(th==='canyon'){if(hi>.6)g=6}
    else if(th==='dark'){if(hi>.63)g=6;else if(hi<.28)g=8}
    if(comp)g=4;if(onPath)g=g===2?3:1;if(arrive&&g===2)g=1;
    let o=null;const edge=x<=1||y<=1||x>=N-2||y>=NH-2;
    if(x===0||y===0||x===N-1||y===NH-1)o=r()<.6?tree:'rock';
    else if(edge&&g!==2)o=r()<.75?(r()<.65?tree:'rock'):null;
    else if(!comp&&!onPath&&!arrive&&g!==2&&Math.abs(x-px)>1){const v=r(),cliff=fbm(x*.3+o2,y*.3+o1);
      if(th==='peak'||th==='snow')o=cliff>.67?'rock':v<.14?'pine':v<.18?'rock':null;
      else if(th==='forest')o=v<.16?'tree':v<.25?'pine':v<.3&&hi<.45?'bamboo':null;
      else if(th==='lake')o=v<.07?'tree':v<.1?'bamboo':v<.11?'rock':null;
      else if(th==='manor')o=v<.04?'tree':v<.05?'pine':v<.055?'rock':null;
      else if(th==='swamp')o=v<.07?'tree':v<.09?'rock':null;
      else if(th==='canyon')o=cliff>.62?'rock':v<.08?'rock':v<.1?'tree':null;
      else o=cliff>.66?'rock':v<.1?'pine':v<.17?'rock':null}
    map[y][x]={g,v:r()};objs[y][x]=o;
  }}
  // 본산: 본전과 좌우 전각, 마당 등롱. 장원 지형은 산길 옆에 집이 더 있다
  const bs=[{x:19,y:5,w:3,h:2,kind:'temple'},{x:14,y:8,w:2,h:2},{x:25,y:8,w:2,h:2}];
  if(th==='manor')bs.push({x:10,y:22,w:3,h:2},{x:27,y:24,w:3,h:2});
  const st=GD.SECT_STYLE[s.id]||{};
  for(const b of bs){b.rc=st.roof;b.wc=st.wall;for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++){objs[j][i]='B';if(map[j][i].g===2)map[j][i].g=4}builds.push(b)}
  for(const[x,y]of[[16,6],[24,6],[14,14],[26,14]]){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  // 문파 특색: 화산의 매화, 청성의 대숲, 불가의 석탑 (data/world.json SECT_STYLE)
  if(st.tree)for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const o=objs[y][x];if((o==='tree'||o==='pine')&&r()<.6)objs[y][x]=st.tree}
  if(st.props==='stupa')for(const[x,y]of[[12,5],[28,5],[12,13],[28,13]])if(!objs[y][x]&&map[y][x].g!==2)objs[y][x]='stupa';
  // 문파 깃발: 산문(산길이 마당에 닿는 곳) 양옆과 본전 앞
  {const q=hqPath(17,sd);placeFlags(s.id,[[q-1,17],[q+2,17],[17,11],[24,11]])}
  for(let y=16;y<NH;y++){const px=hqPath(y,sd);for(const x of[px,px+1])if(map[y][x].g===3)rails.push({x,y})}
  const put=(t,x,y)=>{if(walk(x,y)&&!inHQ(x,y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  const want=(t,n,ok)=>{for(let i=0;i<400&&nodes.filter(q=>q.t===t).length<n;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(NH-4));if(ok(map[y][x].g))put(t,x,y)}};
  want('herb',10,g=>g===0||g===7||g===9);want('ore',8,g=>g===6||g===8||g===10||g===11);want('wood',6,g=>g===0||g===9);
  if(th==='lake'||th==='swamp')want('fish',4,g=>g===0||g===9||g===1);
}
// 바닥 그림: 지형마다 풀빛을 바꾸고, 새 바닥(늪·붉은 바위·검은 땅)을 칠한다
const HQ_GRASS=GD.HQ_GRASS;
// k: 큰 지역은 바닥 그림을 줄여 굽고(픽셀 수를 40칸 지역과 같게) 그릴 때 늘린다. 휴대폰 메모리 때문.
// x0,y0,C,CH: 큰 지역은 C×CH칸 조각만 굽는다(아래 chunkGround). 조각 그림의 왼쪽 위 = 그 칸 묶음 마름모를 감싸는 네모. 맵 전체면 N×NH
// v195: 바닥 한 장의 픽셀 계산만 떼어 낸 순수 함수 (일꾼 Worker에서도 같은 코드로 돈다). 결과는 bakeHQ가 동기로 굽던 것과 같다
function bakePix(o){
  const{gw,gh,k,X0,Y0,x0,y0,C,CH,N,NH,th,gc,stair,MI,TW,TH}=o,GT=o.G,TR=o.tw,d=new Uint8ClampedArray(gw*gh*4),
    tg=(x,y)=>{x=Math.max(0,Math.min(N-1,Math.floor(x)));y=Math.max(0,Math.min(NH-1,Math.floor(y)));return GT[y*N+x]};
  for(let qy=0;qy<gh;qy++)for(let qx=0;qx<gw;qx++){
    const px=qx/k+X0,py=qy/k+Y0,a=px/(TW/2),b=py/(TH/2),gx=(a+b)/2,gy=(b-a)/2;
    if(gx<x0||gy<y0||gx>=x0+C||gy>=y0+CH||gx>=N||gy>=NH)continue;
    const hard=tg(gx,gy),soft=hard===1||hard===3||hard===4;
    const jx=soft?gx:gx+(vn(gx*2.3,gy*2.3)-.5)*.6,jy=soft?gy:gy+(vn(gx*2.3+9,gy*2.3+4)-.5)*.6;
    const t=soft?hard:tg(jx,jy),n=fbm(gx*1.3,gy*1.3),grain=.92+hash(qx,qy)*.16;
    let R,G,B;
    if(t===2){const w=fbm(gx*2.5,gy*4);if(TR&&TR.water){const c=TR.water,m=.8+w*.4;R=c[0]*m;G=c[1]*m;B=c[2]*m}else if(th==='swamp'||th==='miao'){R=44+w*20;G=60+w*22;B=42+w*14}else{R=60+w*30;G=98+w*30;B=118+w*28}if(vn(gx*7,gy*7)>.8){R+=70;G+=70;B+=60}}
    else if(t===3){R=136;G=96;B=60;const gr=vn(gx*40,gy*4);R*=.8+gr*.35;G*=.8+gr*.35;B*=.8+gr*.3;if(frac(gx*4)<.1){R*=.45;G*=.45;B*=.45}}
    else if(t===1){if(stair){const st=frac(gy*2),h=hash(Math.floor(gx*2),Math.floor(gy*2));R=(126+n*22)*(.88+h*.2);G=(120+n*20)*(.88+h*.2);B=(110+n*18)*(.88+h*.2);if(st<.08){R*=.6;G*=.6;B*=.6}}
      else{const k=vn(gx*6,gy*6);R=122+n*24+k*10;G=102+n*20+k*8;B=74+n*14}}
    else if(t===4){const sx=gx*2+(Math.floor(gy*2)%2)*.5,sy=gy*2,f1=frac(sx),f2=frac(sy),h=hash(Math.floor(sx)*7,Math.floor(sy)*13),tone=.84+h*.22,m=Math.min(f1,1-f1,f2,1-f2);
      R=(th==='dark'?110:168)*tone;G=(th==='dark'?100:162)*tone;B=(th==='dark'?100:152)*tone;if(m<.05){R=80;G=76;B=72}}
    else if(t===6){const k=vn(gx*3,gy*3);if(TR&&TR.rock){const c=TR.rock,pt=TR.pat,m=.8+n*.3+k*.14;let s=1;R=c[0]*m;G=c[1]*m;B=c[2]*m;
        if(pt==='streak'){const q=frac(gx*2.2+vn(gy*.9,gx*.4)*1.6);s=q<.07?.6:q<.13?1.12:1}
        else if(pt==='strata'){s=.86+Math.sin((gx*.35+gy)*2.6+k*2.2)*.14}
        else if(pt==='round')s=vn(gx*5,gy*5)>.68?1.12:1;
        else if(pt==='scree')s=.8+hash(Math.floor(gx*6),Math.floor(gy*6))*.35;
        R*=s;G*=s;B*=s;if(vn(gx*9,gy*9)>.76){R*=.72;G*=.72;B*=.74}}
      else{R=96+n*30+k*14;G=94+n*28+k*12;B=90+n*26+k*12;if(vn(gx*9,gy*9)>.72){R*=.7;G*=.7;B*=.72}}}
    else if(t===7){const k=vn(gx*4,gy*4);R=106+n*26+k*10;G=88+n*20+k*8;B=64+n*14}
    else if(t===8){const k=fbm(gx*.6,gy*.6);R=212+n*26-k*18;G=220+n*24-k*14;B=232+n*18-k*6;if(vn(gx*5+3,gy*5)>.8){R-=60;G-=56;B-=46}}
    else if(t===9){const k=vn(gx*3,gy*3);R=64+n*24+k*10;G=60+n*22+k*8;B=38+n*12;if(vn(gx*8,gy*8)>.76){R*=.7;G*=.8;B*=.7}}
    else if(t===10){const k=vn(gx*2.5,gy*2.5),band=Math.sin((gx+gy)*1.6+k*3)*.5+.5;R=128+n*34+band*20;G=70+n*20+band*10;B=46+n*12}
    else if(t===12){const k2=vn(gx*2,gy*2),dune=Math.sin(gx*1.3+gy*.7+k2*4)*.5+.5;R=196+n*26+dune*18;G=168+n*22+dune*14;B=112+n*16}
    else if(t===13){const pl=frac(gy*1.5)<.06||frac(gx*.5+Math.floor(gy*1.5)*.5)<.04,k=vn(gx*2,gy*7);R=(th==='dark'?74:150)+n*18+k*10;G=(th==='dark'?52:104)+n*14+k*8;B=(th==='dark'?44:66)+n*10;if(pl){R*=.55;G*=.55;B*=.55}}
    else if(t===11){const k=vn(gx*3,gy*3);R=40+n*18+k*10;G=36+n*16+k*8;B=38+n*16+k*8;if(vn(gx*11,gy*11)>.82){R+=60;G+=14;B+=8}}
    else{const big=vn(gx*.2,gy*.2);R=gc[0]+n*34+big*16;G=gc[1]+n*40+big*14;B=gc[2]+n*20;const dirt=fbm(gx*.5+20,gy*.5);if(dirt>.64){const k=Math.min(1,(dirt-.64)*5);R+=(100-R)*k;G+=(94-G)*k;B+=(80-B)*k}}
    const i=(qy*gw+qx)*4,ed=Math.min(gx,gy,N-gx,NH-gy);
    if(MI){const e=clamp((ed-.4+(fbm(gx*.35,gy*.35)-.5)*2.4)/3.2,0,1),f=e*e*(3-2*e);   // 구름바다: 가장자리가 안개 빛으로 바랜다
      d[i]=R*grain*f+MI[0]*(1-f);d[i+1]=G*grain*f+MI[1]*(1-f);d[i+2]=B*grain*f+MI[2]*(1-f)}
    else{const fade=Math.min(1,ed/1.6);d[i]=R*grain*fade;d[i+1]=G*grain*fade;d[i+2]=B*grain*fade}d[i+3]=255;
  }
  return d}
function bakeHQ(th,k=Math.min(1,40/Math.max(N,NH)),x0=0,y0=0,C=N,CH=C===N&&!x0&&!y0?NH:C){
  const X0=(x0-y0-CH)*TW/2,Y0=(x0+y0)*TH/2,gw=Math.round((C+CH)*TW/2*k),gh=Math.round((C+CH)*TH/2*k),c=document.createElement('canvas');c.width=gw;c.height=gh;
  c.sm={k,X0,Y0,x0,y0,C,CH,chunk:C!==N||CH!==NH||x0||y0};   // v173: 계절 겹(g_season.js)이 칸 좌표를 되찾는다
  const g=c.getContext('2d'),TR=th==='hall'||th==='dark'&&!(TP&&TP.key==='십만대산')?null:TP,gc=TR&&TR.grass||HQ_GRASS[th]||HQ_GRASS.peak,stair=th==='peak'||th==='snow',MI=TR&&TR.mist;   // v155: TR = 지역 지형(g_terrain.js)
  const o={gw,gh,k,X0,Y0,x0,y0,C,CH,N,NH,th,gc,stair,MI,TW,TH,tw:TR?{water:TR.water,rock:TR.rock,pat:TR.pat}:null,G:bakeTiles()},
    fin=d=>{const img=g.createImageData(gw,gh);img.data.set(d);g.putImageData(img,0,0);bakeDeco(g,o,TR)};
  // 놀이 중에 바닥(맵 한 장이든 큰 지역 조각이든)을 구울 때는 일꾼에게 맡긴다 (지역 이동 때 0.4~1초 멈춤 없앰, pixLater)
  if(pixLater('hq',o,c,fin))return c;
  fin(bakePix(o));return c}
// 바닥 위 풀잎·자갈 (픽셀을 다 구운 뒤에 그린다)
function bakeDeco(g,o,TR){const{th,k,X0,Y0,x0,y0,C,CH,N,NH}=o,tileG=pixTile(o);   // 칸은 구울 때 넘긴 o.G로 본다 (다 굽기 전에 지역을 떠나도 맞게)
  const r=rng(57+th.length+x0*131+y0*7919),sp=(gx,gy)=>[((gx-gy)*TW/2-X0)*k,((gx+gy)*TH/2-Y0)*k],A=C*CH/1600,rx=()=>Math.min(N-1,x0+r()*C),ry=()=>Math.min(NH-1,y0+r()*CH);g.lineCap='round';
  const hue=TR&&TR.sand?40:th==='canyon'?60:th==='swamp'?75:th==='dark'?100:105;
  for(let q=0;q<16000*A;q++){const gx=rx(),gy=ry();if(gx<1||gy<1||gx>N-1||gy>NH-1)continue;const t=tileG(gx,gy);if(t!==0&&!(t===9&&r()<.3))continue;const[x,y]=sp(gx,gy),l=r();
    g.strokeStyle=`hsla(${hue+r()*30},${20+r()*20}%,${l<.5?14+r()*10:30+r()*14}%,.7)`;g.lineWidth=k;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*3*k,y-(2+r()*4)*k);g.stroke()}
  for(let q=0;q<900*A;q++){const gx=rx(),gy=ry(),t=tileG(gx,gy);if(t!==6&&t!==8&&t!==10&&t!==11&&t!==12)continue;const[x,y]=sp(gx,gy),s=(1.5+r()*3.5)*k;
    g.fillStyle=t===6&&TR&&TR.rock?`rgb(${TR.rock.map(v=>v*(.55+r()*.5)|0).join(',')})`:t===12?`hsl(38,35%,${52+r()*16}%)`:t===10?`hsl(14,40%,${30+r()*18}%)`:t===11?`hsl(0,4%,${14+r()*14}%)`:`hsl(210,6%,${t===8?62+r()*20:36+r()*22}%)`;g.beginPath();g.ellipse(x,y,s*1.4,s*.8,0,0,7);g.fill()}
}
const BAKE_PREVIEW=.2;   // 일꾼이 굽는 동안 깔 미리보기 배율
// 지금 맵 칸 종류를 한 줄 배열로 (일꾼에게 넘긴다)
// o.G(칸 배열)로 보는 tileG
const pixTile=o=>{const{N,NH,G}=o;return(x,y)=>{x=Math.max(0,Math.min(N-1,Math.floor(x)));y=Math.max(0,Math.min(NH-1,Math.floor(y)));return G[y*N+x]}};
function bakeTiles(){const G=new Uint8Array(N*NH);for(let y=0;y<NH;y++){const r=map[y];for(let x=0;x<N;x++)G[y*N+x]=r[x].g}return G}
// 바닥 픽셀 함수들. 모두 o만 보고(칸은 tileG 또는 o.G) Uint8ClampedArray를 돌려준다. o.k로 줄여 구울 수 있어야 한다
const PIXF=()=>({hq:bakePix,gae:gaePix});
// 일꾼: 픽셀 함수와 잡음 함수를 글로 옮겨 Blob으로 띄운다. tileG·N·NH·RIV는 일감마다 o에서 채운다. 못 띄우면(CSP 등) null → 동기로 굽는다
let BAKE_W,BAKE_N=0;const BAKE_JOB=new Map;
function bakeWorker(){if(BAKE_W!==undefined)return BAKE_W;BAKE_W=null;
  try{if(typeof Worker==='undefined'||typeof Blob==='undefined')return null;const F=PIXF();
    const src=`${hash}\n${vn}\nconst fbm=${fbm},frac=${frac},clamp=${clamp},TW=${TW},TH=${TH},MID=${MID};let N,NH,RIV,GT;
const tileG=(x,y)=>{x=Math.max(0,Math.min(N-1,Math.floor(x)));y=Math.max(0,Math.min(NH-1,Math.floor(y)));return GT[y*N+x]};
${Object.values(F).join('\n')}\nconst PIX={${Object.entries(F).map(([k,f])=>k+':'+f.name).join(',')}};
onmessage=e=>{const o=e.data.o;N=o.N;NH=o.NH;RIV=o.RIV;GT=o.G;const d=PIX[e.data.f](o);postMessage({id:e.data.id,d},[d.buffer])}`,
      w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    w.onmessage=e=>{const j=BAKE_JOB.get(e.data.id);if(!j)return;BAKE_JOB.delete(e.data.id);pixDone(j,e.data.d)};
    w.onerror=()=>{BAKE_W=null;const F=PIXF();for(const[id,j]of BAKE_JOB){BAKE_JOB.delete(id);pixDone(j,F[j.f](j.o))}};   // 일꾼이 죽으면 남은 일을 여기서 마저 굽는다
    BAKE_W=w}catch(e){BAKE_W=null}return BAKE_W}
// 다 구운 픽셀을 붙인다. 높낮이 맵은 g_elev가 미리보기로 만든 그림(src가 이 바닥)을 지금 지역이면 다시 짓고, 아니면 버려 다음에 새로 굽게 한다
function pixDone(j,d){j.c.baking=0;j.fin(d);
  for(const k in GROUND){const e=GROUND[k];if(e.src!==j.c)continue;if(k===REG&&ground===e){GROUND[k]=ground=j.c;elevBuild()}else delete GROUND[k]}}
// 놀이 중이면 픽셀 함수 f를 일꾼에게 맡기고, 그동안 c에 줄여 구운 미리보기를 늘려 깐다. 다 되면 fin(d). 맡기지 못하면 false (부른 쪽이 동기로 굽는다)
function pixLater(f,o,c,fin){if(!playing||window.BAKE_SYNC)return false;const w=bakeWorker();if(!w)return false;
  const q=BAKE_PREVIEW,o2={...o,k:(o.k||1)*q,gw:Math.max(1,Math.round(o.gw*q)),gh:Math.max(1,Math.round(o.gh*q))},t=document.createElement('canvas');t.width=o2.gw;t.height=o2.gh;
  const tg=t.getContext('2d'),im=tg.createImageData(o2.gw,o2.gh);im.data.set(PIXF()[f](o2));tg.putImageData(im,0,0);{const cg=c.getContext('2d');cg.imageSmoothingQuality='high';cg.drawImage(t,0,0,o.gw,o.gh)}
  const id=++BAKE_N;BAKE_JOB.set(id,{f,o,c,fin});c.baking=1;w.postMessage({id,f,o});return true}
// 큰 지역(성) 바닥: 한 장으로 구우면 휴대폰 메모리가 모자라서, 12×12칸 조각을 화면 가까이에서만 굽고 멀어진 조각은 버린다
const CHUNK=12,CHUNK_K=.6,CHUNK_KEEP=64;
const chunkGround=th=>({chunked:1,th,cache:new Map,n:0});
function drawChunks(gr,o){
  const C=CHUNK,n=Math.ceil(N/C),nh=Math.ceil(NH/C),m=C*TW*.6;let budget=gr.cache.size?1:99;
  for(let cy=0;cy<nh;cy++)for(let cx=0;cx<n;cx++){
    const x=o.x+(cx-cy-1)*C*TW/2,y=o.y+(cx+cy)*C*TH/2,w=C*TW,h=C*TH;
    if(x+w<-m||x>W+m||y+h<-m||y>H+m)continue;const key=cx+','+cy,near=!(x+w<0||x>W||y+h<0||y>H);
    let c=gr.cache.get(key);
    if(!c){if(budget<=0&&!near)continue;budget--;c=bakeHQ(gr.th,CHUNK_K,cx*C,cy*C,C,C);gr.n++}
    else gr.cache.delete(key);gr.cache.set(key,c);
    if(near){ctx.drawImage(c,x,y,w,h);seasonGround(c,x,y,w,h)}}
  while(gr.cache.size>CHUNK_KEEP)gr.cache.delete(gr.cache.keys().next().value)}
// ---- 역참: 은자를 내고 말을 타 개봉과 모든 본산을 오간다 ----
function postDlg(){
  const row=(id,n,sub,fee)=>`<div class="it"><div>${n}<span>${sub}</span></div><div class="ib">${REG===id?'<small class="dim">여기</small>':B('goto:'+id,`가기 · 은자 ${fee}`,{d:P.silver<fee})}</div></div>`;
  // 내 문파 본산은 맨 위에 따로 (성도·맹 총단 훅은 첫 '</div><h4' 뒤에 끼므로 이 칸과 겹치지 않는다)
  const my=P.sect&&SECTS[P.sect];
  let h=`<p class="note">"어디로 모실까? 길은 멀어도 말은 빠르오."</p>`+(my?`<h4 style="margin:0">내 문파</h4><div class="list">${row(hqId(my),hqPlace(my),`${my.n} 본산`,POST_FEE)}</div>`:'')+`<div class="list">${row('gaebong','개봉','성내 역참',10)}</div>`;
  for(const al of['jeong','sacheon','magyo','gunbu'])h+=`<h4 style="margin:0">${ALLY[al].n}</h4><div class="list">`+liveSects().filter(s=>s.al===al&&s!==my)
    .map(s=>row(hqId(s),hqPlace(s),`${s.n} 본산${!sideOk(al)?' · 다른 성향':''}`,POST_FEE)).join('')+'</div>';
  return h}
function postGo(id){
  if(!REGIONS[id]||REG===id)return;const fee=id==='gaebong'?10:REGIONS[id].city?CITY_FEE:POST_FEE;
  if(P.silver<fee){log('은자가 모자랍니다.','info');return}
  P.silver-=fee;const at=arriveAt(id);closePanels();log(`역참 말을 타고 ${REGIONS[id].name}(으)로 갑니다. (은자 -${fee})`,'sys');travel({to:id,tx:at.x,ty:at.y});
}
// 본산 장문인: 가입·직위·임무·비급을 모두 여기서 본다
function hqDlg(n){
  const s=SECTS[n.hq],same=sideOk(s.al),member=P.sect===s.id;
  const hi=member?`"${rankName(s.id)}, 수고가 많구나."`:same?`"${s.n}에 뜻이 있어 찾아왔는가."`:`"${FACN[pfac()]} 사람이 여기까지 무슨 일인가. 칼을 뽑기 전에 돌아가게."`;
  const c={n,html:`<p class="note">${hi}</p>${sectDetail(s,true)}`};runHooks('hqDlg',c);return c.html}


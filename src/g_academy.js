// ================= 무관(사관학교): 새 생과 윤회의 시작점 =================
// 사용자 요청(2026-10-17): 새로 시작하거나 윤회하면 정파·사파 각각 사관학교 같은 곳에서 시작해, 성장에 맞춘 임무로 게임 시스템을 익힌다.
//   무기 계열과 하승 내공심법(서로 다른 여럿 중 하나)을 골라 배우고, 5단계를 수료해 이류가 되면 졸업한다.
// 사용자 결정(2026-10-17): 무기는 생성 화면이 아니라 무관 2단계에서 고른다 · 전생에 졸업했으면 1~3단계를 월반 시험으로 건너뛰되 병기·심법은 골라야 한다 ·
//   고르지 않은 하승 심법은 졸업 뒤 맹 총관에게서 맹 공적으로 배운다 · 졸업 기한은 없다 · 이름은 청운무관(정)·패천관(사).
// - 정파 청운무관은 형주(정의맹 총단과 같은 성내), 사파 패천관은 악양(사천맹 총단과 같은 성내)에 있다. 북문 밖 수련곡이 실습장이다. 마교는 무관이 없다.
// - 진행은 P.acad = {stage 0~4, c 세는 것들, done 마친 과제, cls 고른 병기, sim 고른 심법, skip 월반, grad 졸업, grade, rec 추천서 문파}.
//   P.acad가 없으면(옛 저장·?noacad) 무관 없이 강호에 있는 것으로 친다. 졸업 횟수는 G.acadN (월반 시험 자격, 생을 넘어 남는다).
// - 과제 종류와 판정은 GOAL 표. 대부분은 상태를 보고 판정하고, 세는 것(목인장·보법·경공·비도·실습 의뢰)은 a.c에 센다. 한 번 마친 과제는 그대로 마친 것.
// - 대련·졸업 비무는 비무 틀(G.duel)을 빌려 쓴다: g_life.js duelEnd 첫머리가 G.acadDuel이면 acadDuelEnd로 넘긴다.
// - 무관 안에서는 폐관수련을 할 수 있고(관주가 호법), 주화입마가 가볍다(g_realm.js pgPlace·hobeop·qiDeviation).
// - ?noacad (개발·테스트용): 생성 화면에서 무기를 고르고 개봉에서 태어나는 옛 방식. 기존 테스트가 쓴다.
// 데이터: data/academy.json. 설계: docs/무관_설계.md. 테스트: tests/t85_academy.js
const ACAD_BOB=GD.ACAD_BOB||['b_basic'];
const ACAD=GD.ACAD,ACAD_ST=GD.ACAD_STAGES,ACAD_SPOTS=GD.ACAD_SPOTS,ACAD_SPAR=GD.ACAD_SPAR,ACAD_GRADE=GD.ACAD_GRADE,ACAD_SIM=GD.ACAD_SIM,ACAD_SIM_COST=GD.ACAD_SIM_COST;
const ACAD_OFF=/[?&#]noacad/.test(location.href);
const acadOf=side=>ACAD[side]||ACAD['정'];
const acadOn=()=>!!(P&&P.acad&&!P.acad.grad);
// 졸업했거나 윤회 때 무관을 건너뛰었으면(v138, P.acadSkip) 맹 총관에게서 남은 하승 심법을 배울 수 있다
const acadPast=()=>!!(P&&((P.acad&&P.acad.grad)||P.acadSkip));
// v141: 건너뛰어도 타고난 심법은 없고, 고른 심법·보법과 기초 경공으로 시작한다
function acadSkipStart(sim,bob){const x=SIM[sim];P.acadSkip=1;P.noBase=1;if(ACAD_BOB.includes(bob)){P.bob={[bob]:1};P.bcur=bob}if(x&&x.acad&&x.side===P.side){simLearn(x);recalc()}
  P.feats.push(`8세에 무관을 거치지 않고 강호에 나섰다`)}
const acadReg=()=>acadOf(P.side).id;
const acadField=side=>acadOf(side).id+'_field';
const inAcad=()=>!!(P&&P.acad&&REG===acadOf(P.side).id);
// 하승 심법 넷씩: 등급은 하승(내공 증가 ×1), 차이는 계열·속성·특색. 특색 세기는 SIM_TQ[0]
for(const side of['정','사'])for(const x of ACAD_SIM[side])SIM[x.id]={...x,g:0,side,acad:1};

// ---- 입관: 새 생이 무관에서 시작한다 (newLife가 부른다) ----
function acadEnroll(){const A=acadOf(P.side);
  // v141 (사용자): 처음엔 심법·경공·보법이 모두 없다. 보법은 2단계 병기 교두, 심법·경공은 3단계 심법 교두에게서 설명을 듣고 익힌다
  P.noBase=1;P.bob={};P.bcur=null;P.gk={};P.gkcur=null;
  P.acad={stage:0,c:{},done:{},cls:null,sim:null,skip:0,grad:0,t0:P.age,oe0:STATS.reduce((s,{k})=>s+P.st[k],0),items:[]};
  const robe=mkGear('armor',`${A.n} 무관복`,1,{def:2,hp:6});robe.acad=1;P.bag.push(robe);
  P.feats.push(`8세에 ${A.n}에 들었다`)}

// ---- 지역: 무관 본관과 수련곡 ----
const acadSpotsOf=()=>Object.entries(ACAD_SPOTS);
['정','사'].forEach((side,idx)=>{const A=ACAD[side],M=MAENG[A.al],f=alFac(A.al),pal=A.pal;
  const inYard=(x,y)=>x>=8&&x<=32&&y>=6&&y<=30;
  const zone=(x,y)=>{if(!inYard(x,y))return `${A.n} 문밖`;let best=null,bd=3.2;for(const[k,[sx,sy]]of acadSpotsOf()){const d=Math.hypot(sx-x,sy-y);if(d<bd){bd=d;best=k}}return best?`${A.n} ${best}`:A.n};
  const c={id:A.id,name:A.n,s:{id:A.id,n:A.n,al:A.al,tier:'mid',i:95+idx},th:A.th,seed:A.seed,top:1,yard:[8,6,32,30],
    builds:[{x:24,y:7,w:5,h:3,kind:'hall'},{x:9,y:8,w:3,h:2,kind:'hall'},{x:14,y:8,w:3,h:2},{x:9,y:17,w:3,h:2},{x:28,y:17,w:3,h:2},{x:9,y:24,w:3,h:2},{x:28,y:24,w:3,h:2}],
    lamps:[[13,13],[27,13],[13,28],[27,28],[18,30],[23,30]],flags:[[18,31],[23,31]],zone,
    npcs:[{id:'ac_master',acad:side,role:'master',n:A.master,x:26.5,y:11.6,pal},
      ...A.inst.map((n,i)=>({id:'ac_i'+i,acad:side,role:'inst',i,n,pal:i===1?'smithy':i===2?(side==='정'?'taoist':'cultist'):'chief',...[{x:17.5,y:15.6},{x:16.5,y:11.6},{x:12.5,y:11.6},{x:23.5,y:15.6}][i]})),
      ...A.mates.map((m,i)=>({id:'ac_m'+i,acad:side,role:'mate',i,n:`동기 ${m[0]}`,x:12.5+i*2,y:22.6,pal:'disciple'})),
      {id:'smith',n:`${A.n} 대장장이`,x:27.5,y:22.6,pal:'smithy'},{id:'inn',n:`${A.n} 식당 숙수`,x:30.5,y:20.6,pal:'keeper'}],
    spawns:[]};
  const R=stageRegion(c);R.hq=null;R.acad=side;R.capital=0;R.acadProv=M.prov;R.arrive={x:20.5,y:34.6};
  // 수련곡: 산적·늑대·약초, 북쪽 깊은 곳에 산적두목
  const fc={id:acadField(side),name:A.field,s:{id:acadField(side),n:A.field,al:A.al,tier:'small',i:97+idx},th:A.fth,seed:A.seed+11,top:0,
    zone:(x,y)=>y<11?`${A.field} 깊은 곳`:A.field,nodes:{herb:12,ore:4,wood:4},
    spawns:[['산적',5,(x,y)=>y>=11&&y<=30],['산적궁수',2,(x,y)=>y>=11&&y<=26],['늑대',2,(x,y)=>y>=6&&y<=20],['산적두목',1,(x,y)=>y<10],['토끼',3,(x,y)=>y>=24]]};
  const FR=stageRegion(fc);FR.hq=null;FR.acad=side;FR.capital=0;FR.acadProv=M.prov;
  R.gates.push({x:20.5,y:1.2,to:fc.id,tx:20.5,ty:36.2,label:A.field});FR.gates.push({x:20.5,y:38.6,to:A.id,tx:20.5,ty:3.6,label:A.n});
  // 성내 포털 (맹 총단 옆 자리)
  const F=REGIONS[pvId(M.prov)],m=F&&F.marks&&F.marks.find(q=>q.n===M.city&&q.gate),L=m&&REGIONS[m.gate],cL=L&&L.stage;
  if(cL&&cL.portals){const n=cL.portals.length,slot=LM_PORTAL_C[Math.min(n,2)],x=slot[0]+.5,y=slot[1]+.5;
    cL.portals.push({x,y,s:null,label:A.n});L.gates.push({x,y,to:A.id,tx:20.5,ty:36.2,label:A.n,portal:1});
    R.gates.push({x:20.5,y:38.6,to:m.gate,tx:x,ty:y+2,label:L.name||m.n});R.lmVia=m.gate}
  else R.gates.push({x:20.5,y:38.6,to:'gaebong',tx:20.5,ty:20.5,label:'개봉'});
});
// 연무장 목인장: 맞아도 쓰러지지 않고 반격하지 않는다. 숙련은 소성(25)까지만 오른다(g_core hitE)
const ACAD_DUMMY=[[14.5,20.5],[16.5,20.5],[25.5,20.5]];
hook('regionLoaded',id=>{if(!P||!REGIONS[id]||REGIONS[id].acad==null||id.endsWith('_field'))return;if(mobs.some(m=>m.acadDummy))return;
  for(const[x,y]of ACAD_DUMMY){const e=mkMob('목인장',x,y,{hp:99999,atk:0,def:0,hm:0,sp:0,pal:'villager',o:{acadDummy:1,fixed:'dummy'}});e.hp=e.maxHp=99999;e.atk=0;mobs.push(e)}});
hook('mobTick',e=>{if(!e.acadDummy)return;e.hp=e.maxHp;e.stun=.5;e.aggro=false;e.tgt=null;e.kb.x=e.kb.y=0;e.x=e.home.x;e.y=e.home.y;e.burn=e.psn=0});

// ---- 과제 판정 ----
const acadSt=()=>ACAD_ST[P.acad.stage];
const acadGoals=(i=P.acad.stage)=>ACAD_ST[i].goals.map((g,j)=>({...g,j})).filter(g=>!g.skipOnly||P.acad.skip);
const acadArts=()=>learnedArts().filter(id=>!ARTS[id].base);
const GOAL={
  goto:g=>[g.spots.filter(s=>P.acad.c['spot_'+s]).length,g.v],
  equip:()=>[P.eq.armor&&P.eq.armor.acad?1:0,1],
  hit:g=>[P.acad.c.hit||0,g.v],
  oe:g=>[pillarVal('oe'),g.v],
  medit:()=>[P.acad.c.medit?1:0,1],
  pick:()=>[P.acad.cls?1:0,1],
  read:()=>[P.acad.cls&&acadArts().some(id=>ARTS[id].cls===P.acad.cls)?1:0,1],
  mast:g=>[Math.floor(Math.max(0,...acadArts().map(id=>A(id).p))),g.v],
  bobpick:()=>[P.bcur?1:0,1],
  bob:g=>[P.acad.c.bob||0,g.v],
  spar:g=>[P.acad.c['spar_'+g.id]?1:0,1],
  sim:()=>[P.acad.sim?1:0,1],
  ne:g=>[baseQi(),g.v],
  talk:g=>[P.acad.c['talk_'+g.id]?1:0,1],
  gklearn:()=>[P.gkcur?1:0,1],
  leap:g=>[P.acad.c.leap||0,g.v],
  throw:g=>[P.acad.c.throw||0,g.v],
  quest:g=>[Object.keys(P.acad.c.qd||{}).length,g.v],
  boss:g=>[P.acad.c.boss||0,g.v],
  repair:()=>[P.acad.c.repair||P.acad.cls==='권'||!P.eq.weapon?1:0,1],
  panel:g=>[P.acad.c['panel_'+g.id]?1:0,1],
  oeAbs:g=>[pillarVal('oe'),g.v],
  mu:g=>[pillarVal('mu'),g.v],
  realm:g=>[realmIdx(),g.v],
  final:g=>[P.acad.c.final||0,g.v]};
// v135 (사용자): 과제는 한 번에 하나씩. 앞 과제를 마쳐야 다음 과제가 열리고, 세는 과제는 열린 때부터 센다(ACAD_REL, a.base)
const ACAD_REL=new Set(['hit','oe','bob','leap','throw','boss']);
function goalProg(g,i=P.acad.stage){const a=P.acad,k=i+':'+g.j;if(a.done[k])return{have:1,need:1,done:true};let[h,n]=GOAL[g.k](g);
  if(ACAD_REL.has(g.k)){const b=(a.base||{})[k];h=b==null?0:h-b}return{have:h,need:n,done:h>=n}}
const acadAllDone=(i=P.acad.stage)=>acadGoals(i).every(g=>P.acad.done[i+':'+g.j]);
const acadCur=()=>acadGoals().find(g=>!P.acad.done[P.acad.stage+':'+g.j]);
const acadCurK=()=>{const g=acadOn()&&acadCur();return g?g.k:null};
// 과제가 열릴 때: 세는 과제는 지금 값을 기준으로 잡고, 한 번 하면 되는 과제(운기·창 열기·이야기)는 새로 하게 한다
function acadActivate(g){const a=P.acad,c=a.c,k=a.stage+':'+g.j;a.cur=k;a.base=a.base||{};
  if(ACAD_REL.has(g.k))a.base[k]=GOAL[g.k](g)[0];
  if(g.k==='medit'){c.medit=0;c.meditLow=0;c.meditT=0}if(g.k==='panel')c['panel_'+g.id]=0;if(g.k==='talk')c['talk_'+g.id]=0}
const acadReporter=()=>P.acad.stage===4?acadOf(P.side).master:acadOf(P.side).inst[acadSt().inst];
// 판정: 새로 마친 과제를 알리고, 다음 과제를 일러 준다
function acadCheck(){if(!acadOn())return;const a=P.acad,st=acadSt();let g=acadCur(),news=0;
  while(g){const k=a.stage+':'+g.j;if(a.cur!==k)acadActivate(g);if(!goalProg(g).done)break;a.done[k]=1;news++;log(`과제 완료: ${g.n}`,'xp');g=acadCur()}
  if(!news)return;
  if(!g){log(`${st.n} 과제를 모두 마쳤다. ${acadReporter()}에게 보고하자.`,'xp');showBanner(`${st.n} 과제 완료`,`${acadReporter()}에게 보고`)}
  else{log(`다음 과제: ${g.n} · ${g.h}`,'info');showBanner('과제 완료',`다음: ${g.n}`)}}
function acadStageStart(){const a=P.acad,st=acadSt(),A=acadOf(P.side);
  if(a.stage===2&&!P.sp.암기){P.sp.암기=1;log('암기술의 기초를 배웠습니다.','xp')}
  if(a.stage===2||(a.skip&&a.stage===3&&!a.knives)){a.knives=1;P.mats.비도=(P.mats.비도||0)+10;acadKnife=P.mats.비도;log('연습용 비도 10자루를 받았습니다.','sys')}
  showBanner(`${A.n} ${a.stage+1}단계`,`${st.n} · ${st.sub}`);log(`[${A.n} ${a.stage+1}단계 · ${st.n}] ${st.d}`,'sys');
  const g=acadCur();if(g){acadActivate(g);log(`과제: ${g.n} · ${g.h}`,'info')}}

// ---- 세는 것: 무관 둘러보기·운기·보법·경공·비도 ----
let acadT=0,acadLeap=null,acadKnife=null;
hook('tick',dt=>{if(!acadOn())return;const a=P.acad,c=a.c;
  if(P.leap&&P.leap!==acadLeap){acadLeap=P.leap;if(P.leap.step)c.bob=(c.bob||0)+1;else c.leap=(c.leap||0)+1}else if(!P.leap)acadLeap=null;
  const kn=P.mats.비도||0;if(acadKnife!=null&&kn<acadKnife&&inAcad())c.throw=(c.throw||0)+(acadKnife-kn);acadKnife=kn;
  // 운기 과제: 내공이 빈 채로 앉아 다 채우거나, 이미 가득하면 3초 동안 앉아 있으면 된다 (v136 사용자 버그: 내공이 가득하면 진행이 안 됐다)
  if(P.medit){c.meditT=(c.meditT||0)+dt;if(P.qi<P.maxQi-.5)c.meditLow=1;if(P.qi>=P.maxQi-.5&&(c.meditLow||c.meditT>=3))c.medit=1}
  if(inAcad())for(const[k,[x,y]]of acadSpotsOf())if(!c['spot_'+k]&&Math.hypot(P.x-x,P.y-y)<2.6){c['spot_'+k]=1;log(`${acadOf(P.side).n} ${k}`,'sys')}
  if((acadT-=dt)<=0){acadT=.25;acadCheck()}});
hook('hitDone',c=>{if(acadOn()&&c.e&&c.e.acadDummy)P.acad.c.hit=(P.acad.c.hit||0)+1});
hook('kill',e=>{if(acadOn()&&e.kind==='산적두목'&&REG===acadField(P.side))P.acad.c.boss=(P.acad.c.boss||0)+1});
hook('panelOpen',id=>{if(acadOn())P.acad.c['panel_'+id]=1});

// ---- 대련·월반 시험·졸업 비무 (비무 틀을 빌린다) ----
const acadSparStat=s=>{const[a,h,m]=STD[s.lv];return{hp:Math.round(h*2.2*s.k),atk:Math.round(a*.6*s.k),hm:m,def:Math.round(2+s.lv*1.5)}};
const acadSparOk=kind=>{const a=P.acad;if(!acadOn()||!inAcad())return false;
  return kind==='inst'?a.stage>=1&&!a.c.spar_inst&&!!GOAL.read()[0]&&acadCurK()==='spar':kind==='skip'?a.stage===0&&(G.acadN||0)>0&&!a.skipTried&&!a.skip:kind==='final'?a.stage===4&&realmIdx()>=1&&(a.c.final||0)<3&&acadCurK()==='final':false};
function acadSpar(kind){if(G.duel||P.hp<=0||!acadSparOk(kind))return;const a=P.acad,A=acadOf(P.side);let o;
  if(kind==='final'){const i=a.c.final||0,s=ACAD_SPAR.final[i];if(!s)return;const mt=A.mates[i];o={n:mt[0],...acadSparStat(s),cls:CLS[(i*2+(P.side==='사'?1:0))%5]}}
  else{const s=ACAD_SPAR[kind];o={n:kind==='inst'?A.inst[1]:A.master,...acadSparStat(s),cls:kind==='inst'?(a.cls==='궁'?'검':a.cls||'검'):'검'}}
  closePanels();G.duel=true;G.acadDuel={kind};for(const m of mobs)if(m.aggro){m.aggro=false;m.tgt=null}
  P.x=19.5;P.y=23.5;P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;
  const e=mkMob(o.n,22.5,23.5,{hp:o.hp,atk:o.atk,def:o.def,hm:o.hm,sp:2.2,reach:o.cls==='궁'?5:1.4,ranged:o.cls==='궁'?1:0,el:null,pal:'duel'+o.cls,hostile:1,aggro:9,duelist:1});
  Object.assign(e,{hp:o.hp,maxHp:o.hp,atk:o.atk,def:o.def,hm:o.hm,duel:1,aggro:true,acadSpar:kind,wcls:o.cls});e.d=Object.assign({},e.d,{pal:o.cls==='검'?'duelist':'chief'});
  mobs.push(e);P.target=e;showBanner(kind==='final'?'졸업 비무':kind==='skip'?'월반 시험':'대련',o.n);log(`${kind==='final'?'졸업 비무':kind==='skip'?'월반 시험':'대련'} 시작: ${o.n} (${CLASS[o.cls].n})`,'sys')}
// 대련 중에 기록된 저장을 불러오면 대련은 없던 것으로
hook('gLoaded',()=>{if(G.acadDuel){G.acadDuel=null;G.duel=false}});
function acadDuelEnd(win,e){const kind=G.acadDuel&&G.acadDuel.kind,a=P.acad;G.duel=false;G.acadDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;
  if(!win)P.hp=Math.max(1,Math.round(P.maxHp*.3));if(!a)return;
  if(kind==='inst'){if(win){a.c.spar_inst=1;log('병기 교두를 꺾었습니다.','xp');showBanner('대련 승리','')}else log('병기 교두에게 졌습니다. 숨을 고르고 다시 청하자.','dmg')}
  else if(kind==='skip'){a.skipTried=1;if(win){a.skip=1;a.stage=3;log('월반 시험에 붙었습니다. 4단계 강호 실습부터 한다. 병기와 심법은 교두들에게서 골라야 한다.','xp');P.feats.push(`${Math.floor(P.age)}세에 월반 시험에 붙었다`);acadStageStart()}
    else log('월반 시험에 떨어졌습니다. 1단계부터 차근차근 배우자.','dmg')}
  else if(kind==='final'){a.c.final=(a.c.final||0)+1;if(win)a.c.finalWin=(a.c.finalWin||0)+1;log(`졸업 비무 ${a.c.final}판째: ${win?'이겼다':'졌다'}. (${a.c.finalWin||0}승)`,win?'xp':'info')}
  acadCheck()}

// ---- 무관 의뢰 (4단계) ----
function acadQuestTake(i){const st=ACAD_ST[3],q=st.quests[i],a=P.acad,key='acad:'+i;if(!q||a.stage<3||(a.c.qd||{})[key]||P.quests.some(o=>o.key===key)||P.quests.length>=4)return;
  P.quests.push({...q,key,acad:1,have:0});log(`실습 의뢰 [${q.n}]을(를) 맡았습니다. 수련곡은 무관 북문 밖이다.`,'sys')}
function acadQuestReport(i){const q=P.quests[i];if(!q||!q.acad||!questProg(q).done)return;
  if(q.kind==='give')P.mats[q.mat]-=q.cnt;P.silver+=q.silver;gainVit(q.vit);P.fame+=q.fame||0;P.good+=q.good||0;
  const c=P.acad.c;c.qd=c.qd||{};c.qd[q.key]=1;runHooks('questDone',q);P.quests.splice(i,1);log(`실습 의뢰 [${q.n}] 보상: 은자 ${q.silver}, 활력 ${q.vit}`,'xp')}

// ---- 병기 고르기 (2단계, 월반이면 4단계) ----
const acadPickOpen=()=>P.acad&&!P.acad.grad&&(P.acad.stage>=1||P.acad.skip);
const acadPickLocked=()=>!!(P.acad.cls&&acadArts().some(id=>ARTS[id].cls===P.acad.cls));
function acadPick(cls){const a=P.acad;if(!acadPickOpen()||!CLS.includes(cls)||acadPickLocked()||cls===a.cls)return;
  // 아직 비급을 읽기 전이면 바꿀 수 있다: 먼저 받은 연습 병기·비급을 거둔다
  for(const id of a.items||[]){const k=P.bag.findIndex(it=>it.id===id);if(k>=0)P.bag.splice(k,1);if(P.eq.weapon&&P.eq.weapon.id===id)P.eq.weapon=null}
  a.items=[];a.cls=cls;P.startCls=cls;
  if(cls==='권'){if(P.eq.weapon&&P.bag.length<24){P.bag.push(P.eq.weapon);P.eq.weapon=null}}
  else{const w=mkWeapon(cls,P.status>=2?1.15:.85,0);w.name=`연습용 ${w.name}`;w.dur=Math.round(w.maxDur*.6);if(P.eq.weapon&&P.bag.length<24)P.bag.push(P.eq.weapon);P.eq.weapon=w;a.items.push(w.id)}
  const b0=mkBook(P.side+cls+'0',0);P.bag.push(b0);a.items.push(b0.id);
  if(P.status>=2){const b1=mkBook(P.side+cls+'1',0);P.bag.push(b1);a.items.push(b1.id)}
  recalc();log(`${CLASS[cls].n}을(를) 골랐습니다. ${cls==='권'?'맨손으로 싸운다.':'연습 병기를 찼다(날이 무뎌 있다).'} 행낭의 비급을 읽어 첫 초식을 익히자.`,'xp');showBanner(CLASS[cls].n,'병기를 고르다');acadCheck()}
// ---- 심법 고르기 (3단계, 월반이면 4단계) ----
const acadSimOpen=()=>P.acad&&!P.acad.grad&&(P.acad.stage>=2||P.acad.skip);
function acadSimPick(id){const a=P.acad,x=SIM[id];if(!acadSimOpen()||a.sim||!x||!x.acad||x.side!==P.side)return;a.sim=id;simLearn(x);recalc();P.feats.push(`${Math.floor(P.age)}세에 ${x.n}을(를) 익혔다`);acadCheck()}

// ---- 보법 고르기 (2단계, 월반이면 4단계): 직선·간파 하승 보법 가운데 하나 ----
const acadBobOpen=()=>acadOn()&&(P.acad.stage>=1||P.acad.skip);
function acadBobPick(id){if(!acadBobOpen()||!ACAD_BOB.includes(id)||!BOBS[id])return;bobInit();if(P.bcur)return;
  P.bob[id]=1;P.bcur=id;const b=BOBS[id];log(`보법 [${b.n}](${b.t==='line'?'직선':'간파'})을(를) 익혔습니다. ${TOUCH?'보법 단추':'Shift'}로 씁니다.`,'xp');showBanner(b.n,'보법을 익히다');acadCheck()}
// ---- 경공 배우기 (3단계, 월반이면 4단계): 기초 경공 ----
const acadGkOpen=()=>acadOn()&&(P.acad.stage>=2||P.acad.skip);
function acadGkLearn(){if(!acadGkOpen())return;ggInit();if(P.gkcur)return;P.gk.g_basic=1;P.gkcur='g_basic';
  log(`경공 [${GGS.g_basic.n}](하승 · 1단)을(를) 익혔습니다. ${TOUCH?'경공 단추':'Space'}로 뜁니다.`,'xp');showBanner(GGS.g_basic.n,'경공을 익히다');acadCheck()}

// ---- 단계 보고·졸업 ----
function acadReport(){const a=P.acad;if(!acadOn()||a.stage>=4||!acadAllDone())return;const st=acadSt(),r=st.reward||{};
  P.silver+=r.silver||0;gainVit(r.vit||0);for(const[k,v]of Object.entries(r.mats||{}))P.mats[k]=(P.mats[k]||0)+v;
  log(`${st.n} 수료. 은자 ${r.silver||0}, 활력 ${r.vit||0}${Object.keys(r.mats||{}).length?', '+Object.entries(r.mats).map(([k,v])=>`${k} ${v}`).join(', '):''}.`,'xp');
  P.feats.push(`${Math.floor(P.age)}세에 ${acadOf(P.side).n} ${a.stage+1}단계(${st.n})를 마쳤다`);a.stage++;acadStageStart()}
function acadGradeOf(){const a=P.acad,w=a.c.finalWin||0;return ACAD_GRADE.find(g=>P.age<=g.need&&w>=g.win)||ACAD_GRADE[ACAD_GRADE.length-1]}
function acadGraduate(){const a=P.acad;if(!acadOn()||a.stage!==4||!acadAllDone())return;const A=acadOf(P.side),g=acadGradeOf();
  a.grad=1;a.grade=g.n;a.gradAge=Math.floor(P.age);G.acadN=(G.acadN||0)+1;P.silver+=g.silver;P.fame+=g.fame;
  const tok=mkGear('acc',`${A.n} 졸업 증표 (${g.n})`,g.n==='수석'?1.4:g.n==='우등'?1.2:1,{qi:10,hm:2});if(P.bag.length<24)P.bag.push(tok);
  log(`${A.n}을(를) ${g.n}(으)로 졸업했습니다. 은자 ${g.silver}, 명성 ${g.fame}, 졸업 증표. 관주에게 추천서를 받자.`,'xp');showBanner(`${A.n} 졸업`,`${g.n} · ${Math.floor(P.age)}세`);
  P.feats.push(`${Math.floor(P.age)}세에 ${A.n}을(를) ${g.n}(으)로 졸업했다`);fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:2})
  // 사파 무관을 악업이 무겁게 졸업하면 마교 밀사가 길을 일러 준다 (가입은 지금처럼 본산에서)
  if(P.side==='사'&&P.evil>=30&&SECTS.cheonma)setTimeout(()=>log(`졸업식 밤, 마교 밀사가 찾아와 속삭였다. "천마신교는 강한 자를 반긴다. ${hqPlace(SECTS.cheonma)}(으)로 오라."`,'dmg'),1200)}
// 추천서: 성적에 맞는 같은 진영 문파 하나. 그 문파에 들면 가입 조건(명성·나이)을 덜고 공적을 얹어 받는다
const acadRecTiers=()=>(ACAD_GRADE.find(g=>g.n===P.acad.grade)||ACAD_GRADE[2]).tiers;
const acadRecList=()=>Object.values(SECTS).filter(s=>(s.al==='jeong'||s.al==='sacheon')&&ALLY[s.al].side===P.side&&acadRecTiers().includes(s.tier)&&!(G.seal&&G.seal[s.id])&&!(G.occ&&G.occ[s.id])&&!(typeof sectPop==='function'&&sectPop(s.id)<=0));
function acadRec(x){const a=P.acad;if(!a||!a.grad||a.recDone)return;const A=acadOf(P.side);
  if(x==='maeng'){a.recDone=1;if(!P.sect&&!P.maeng&&P.side===ALLY[A.al].side){P.maeng=A.al;P.mpt=P.mpt||{};P.mpt[A.al]=P.mpt[A.al]||0;log(`관주의 추천으로 ${MAENG[A.al].short}의 맹원이 되었습니다.`,'xp');showBanner(`${MAENG[A.al].short} 입맹`,'맹원')}return}
  if(x==='none'){a.recDone=1;log('추천서 없이 낭인으로 강호에 나섭니다.','info');return}
  const s=SECTS[x];if(!s||!acadRecList().includes(s))return;a.rec=s.id;a.recDone=1;
  log(`${s.n}에 보내는 추천서를 받았습니다. 본산 ${masterTitle(s)}에게 가면 받아 준다. (${hqPlace(s)})`,'xp');P.feats.push(`${A.n} 관주가 ${s.n}에 추천서를 써 주었다`)}
hook('sectActDone',c=>{if(c.a!=='sjoin'||!P.acad||P.acad.rec!==c.x||P.sect!==c.x||P.acad.recUsed)return;const g=ACAD_GRADE.find(g=>g.n===P.acad.grade)||ACAD_GRADE[2];
  P.acad.recUsed=1;const v=addMerit(c.x,g.merit);log(`추천서 덕에 ${SECTS[c.x].n} 공적 +${v}을(를) 얹어 받았습니다.`,'xp')});

// ---- 대화 ----
const acadGoalRow=(g,i)=>{const p=goalProg(g,i);return p.done?`<div class="it"><div><b class="good">✓</b> <span class="dim">${esc(g.n)}</span></div><div class="ib"></div></div>`
  :`<div class="it"><div><b class="gold">▶</b> <b>${esc(g.n)}</b> <small class="num gold">${Math.min(p.have,p.need)}/${p.need}</small><span>${esc(g.h)}</span></div><div class="ib"></div></div>`};
// 마친 과제와 지금 과제만 보인다. 뒤 과제는 개수만
const acadGoalList=()=>{const gs=acadGoals(),cur=acadCur(),k=cur?gs.findIndex(g=>g.j===cur.j):gs.length,left=gs.length-k-1;
  return gs.slice(0,k+1).map(g=>acadGoalRow(g,P.acad.stage)).join('')+(left>0?`<p class="note dim">남은 과제 ${left}개는 지금 과제를 마치면 하나씩 열린다.</p>`:'')};
function acadStageCard(btn){const a=P.acad,A=acadOf(P.side),st=acadSt();
  return `<div class="card"><div class="row2"><h4>${A.n} ${a.stage+1}단계 · ${st.n} <small class="dim">${st.sub}</small></h4><span class="tag">보고 ${esc(acadReporter())}</span></div><p class="note">${st.d}</p>
    <div class="list">${acadGoalList()}</div>${btn||''}</div>`}
const acadSteps=()=>`<p class="note">${ACAD_ST.map((s,i)=>`<span class="${i<P.acad.stage||P.acad.grad?'good':i===P.acad.stage?'gold':'dim'}">${i+1}.${s.n}</span>`).join(' · ')}</p>`;
function acadWeaponHtml(){const a=P.acad,lock=acadPickLocked();
  return `<div class="card"><h4>병기고 <small class="dim">고르면 그 계열 하승 무공 비급과 연습 병기를 받는다${lock?' · 이미 비급을 읽어 바꿀 수 없다':a.cls?' · 비급을 읽기 전이면 바꿀 수 있다':''}</small></h4><div class="list">${CLS.map(c=>{const C=CLASS[c],art=ARTS[P.side+c+'0'];
    return `<div class="it"><div>${C.n} <small class="dim">${C.w}</small>${a.cls===c?' <small class="gold">고름</small>':''}<span>${C.d} · 공격 ×${C.atk} · 방어 ×${C.def} · 현묘도 ${C.hm>0?'+':''}${C.hm} · 사거리 ${C.reach}${art?` · 무공 [${art.n}]`:''}</span></div><div class="ib">${B('acpick:'+c,a.cls===c?'고름':'고른다',{d:lock||a.cls===c})}</div></div>`}).join('')}</div></div>`}
function acadSimHtml(){const a=P.acad;
  return `<div class="card"><h4>장경각 하승 심법 <small class="dim">하나만 고른다 · 나머지는 졸업 뒤 맹 총관에게서 맹 공적으로 배울 수 있다</small></h4>${acadSimIntro()}<div class="list">${ACAD_SIM[P.side].map(x=>simRowHtml(SIM[x.id],a.sim===x.id?'<small class="gold">익힘</small>':B('acsim:'+x.id,'익힌다',{d:!!a.sim}))).join('')}</div></div>`}
// v141 (사용자): 보법은 종류(직선·간파)를 설명하고 고르게, 경공은 1·2·3단을 설명하고 익히게, 심법도 무엇을 정하는지 설명한 뒤 고르게
function acadBobHtml(){const t=c=>c==='line'?'직선':'간파',cur=P.bcur;
  return `<div class="card"><h4>보법 <small class="dim">회피기 · ${TOUCH?'보법 단추':'Shift 또는 W'} · 하나만 고른다</small></h4>
    <p class="note">"보법은 싸움 중에 짧게 미끄러져 몸을 빼는 걸음이다. 펼치는 동안은 몸이 흐려져 칼이 닿지 않는다. 내공을 쓰지만 쉬는 시간은 없어, 내공이 있는 한 연달아 쓸 수 있다."</p>
    <p><b class="gold">직선</b> 누른 방향(조이스틱, 놓았으면 바라보는 쪽)으로 곧게 미끄러진다. 적 사이를 빠져나가고 벽·물에서 멈춘다. 거리를 벌리거나 포위를 뚫기 좋다.<br>
    <b class="gold">간파</b> 둘레를 살펴 치기 좋은 자리로 옮긴다. 상대 등 뒤를 잡고 다른 적에게 둘러싸이지 않는 자리를 고른다. 등 뒤를 잡으면 다음 일격이 치명타다.</p>
    <p class="note dim">등급(하승·중승·상승·절정)이 높을수록 멀리·넓게 움직인다. 중승은 개봉 잡화점 비급, 상승·절정은 문파에서 배운다.</p>
    <div class="list">${ACAD_BOB.map(id=>{const b=BOBS[id];return `<div class="it"><div>${b.n} <small class="gold">${t(b.t)}</small>${cur===id?' <small class="good">익힘</small>':''}<span>${b.d} · 거리 ${BG.len[b.g]} · 내공 ${BG.qi[b.g]}</span></div><div class="ib">${cur===id?'':B('acbob:'+id,'익힌다',{d:!!cur})}</div></div>`}).join('')}</div></div>`}
function acadGkHtml(){const has=!!P.gkcur;
  return `<div class="card"><h4>경공 <small class="dim">멀리 뛰는 이동기 · ${TOUCH?'경공 단추':'Space'}</small></h4>
    <p class="note">"경공은 땅을 박차고 멀리 뛰는 법이다. 지붕과 나무 위에도 오른다. 단추를 이어 누르면 다음 단이 나간다."</p>
    <p><b class="gold">1단 도약</b> 땅을 박차고 한 번 뛴다.<br><b class="gold">2단 공중 도약</b> 날고 있거나 막 내려선 순간 다시 누르면 허공을 한 번 더 밟는다. 1.4배 멀리.<br>
    <b class="gold">3단 능공비행</b> 한 번 더 누르면 허공을 길게 난다. 2배 멀리, 나는 내내 무적.</p>
    <p class="note dim">경공의 등급이 최고 단을 정한다: 하승은 1단, 중승은 2단, 상승·절정은 3단까지. 뛸수록 숙련이 올라 숙련 ${GG_OPEN[1]}에 2단, ${GG_OPEN[2]}에 3단이 열린다. 무관은 하승 기초 경공을 가르친다. 중승은 개봉 잡화점 비급, 상승 이상은 문파에서 배운다.</p>
    <div class="row2"><span>${GGS.g_basic.n} <small class="dim">하승 · 1단 · 내공 ${GG_QI[0]}</small>${has?' <small class="good">익힘</small>':''}</span>${has?'':B('acgk','기초 경공을 익힌다',{pri:1})}</div></div>`}
const acadSimIntro=()=>`<p class="note">"심법은 단전에 내공을 쌓는 법이다. 심법이 없으면 수련을 해도 내공이 늘지 않는다. 운용하는 심법이 세 가지를 정한다."</p>
  <p><b class="gold">내공 증가</b> 수련 한 번에 쌓이는 내공. 심법 등급(하승·중승·상승·절정·천고)이 높을수록 많다. 무관 심법은 모두 하승이다.<br>
  <b class="gold">속성</b> 무공의 기운(오행 등)과 이펙트 색. 같은 검법도 심법에 따라 불이 되고 물이 된다. 상극 속성을 만나면 피해가 커진다.<br>
  <b class="gold">특색</b> 심법마다 따로 붙는 효과. 운용하는 동안만 살아난다.</p>
  <p class="note dim">계열(불가·도가·정종·사공·마공)이 상극인 심법은 한 몸에 둘 수 없어, 상극 심법에 입문하면 산공한다. 쌓은 내공은 심법을 바꿔도 그대로다.</p>`;
function acadElHtml(){const els=[...new Set(ACAD_SIM[P.side].map(x=>x.el))];
  return `<div class="card"><h4>속성과 상극</h4><p class="note">"무공의 기운은 심법을 따른다. 어떤 심법을 운용하느냐에 따라 같은 검법도 불이 되고 물이 된다."</p>
    <p>상극: ${Object.entries(BEATS).map(([k,v])=>`${k}→${v}`).join(' · ')} <small class="dim">(앞이 뒤를 누른다 · 피해가 커진다)</small></p>
    <p>${els.map(e=>`<b>${e}</b> ${EL[e]?EL[e].fx:''}`).join('<br>')}</p>${P.acad.c.talk_el?'':B('actalk:el','알겠습니다',{pri:1})}</div>`}
function acadQuestHtml(){const st=ACAD_ST[3],c=P.acad.c;
  const rows=st.quests.map((q,i)=>{const key='acad:'+i,done=(c.qd||{})[key],on=P.quests.findIndex(o=>o.key===key),p=on>=0?questProg(P.quests[on]):null;
    return `<div class="it"><div>${esc(q.n)}${done?' <small class="good">해결</small>':''}<span>${q.kind==='kill'?q.mob.join('·')+' 처치':q.mat+' 납품'} ${q.cnt} · 은자 ${q.silver} · 활력 ${q.vit}${p?` · 진행 ${p.have}/${q.cnt}`:''}</span></div><div class="ib">${done?'':on>=0?B('acqd:'+on,'보고',{d:!p.done,pri:p.done}):B('acq:'+i,'맡기',{d:P.quests.length>=4})}</div></div>`}).join('');
  return `<div class="card"><h4>실습 의뢰 <small class="dim">수련곡은 무관 북문 밖</small></h4><div class="list">${rows}</div></div>`}
function acadDlg(n){const a=P.acad,A=acadOf(n.acad),mine=P.side===n.acad;
  if(!mine)return `<p class="note">"${A.n}은(는) ${SIDES[n.acad].n}의 자제만 받는다."</p>`;
  if(n.role==='mate'){const m=A.mates[n.i];return `<p class="note">${esc(m[1])}.</p><p class="note">"${a&&a.grad?'졸업하고도 잊지 마. 강호에서 또 보자.':a&&a.stage>=4?'졸업 비무에서 만나면 봐주지 않을 거야.':'같이 열심히 해 보자!'}"</p>`}
  if(!a)return `<p class="note">"강호에 나간 지 오래되었구나. 가끔 들러 후배들을 보아 다오."</p>`;
  const rep=i=>!a.grad&&acadSt().inst===i&&a.stage<4?(acadAllDone()?B('acrep','보고하고 다음 단계로',{pri:1}):'<p class="note">과제를 마치면 보고하러 오너라.</p>'):'';
  if(n.role==='master'){
    if(a.grad)return `<p class="note">"${A.grad}"</p><p>${A.n} ${a.grade} 졸업 · ${a.gradAge}세</p>${a.recDone?(a.rec?`<p>추천서: <b class="gold">${SECTS[a.rec].n}</b> ${a.recUsed?'<small class="good">들어감</small>':''}</p>`:''):`<div class="card"><h4>추천서 <small class="dim">${a.grade}: ${acadRecTiers().map(t=>TIERN[t]||t).join('·')}</small></h4><p class="note">추천서를 낸 문파는 명성·나이 조건 없이 받아 주고, 공적 ${(ACAD_GRADE.find(g=>g.n===a.grade)||{}).merit}을(를) 얹어 준다.</p>
      <div class="list">${acadRecList().map(s=>`<div class="it"><div>${s.n}<span>${TIERN[s.tier]||s.tier} · ${hqPlace(s)}</span></div><div class="ib">${B('acrec:'+s.id,'추천서')}</div></div>`).join('')}</div>
      <div class="row2">${B('acrec:maeng',`${MAENG[A.al].short} 맹원으로`,{d:!!(P.sect||P.maeng)})}${B('acrec:none','낭인으로')}</div></div>`}`;
    const skipB=a.stage===0&&(G.acadN||0)>0&&!a.skipTried&&!a.skip?`<div class="card"><h4>월반 시험</h4><p class="note">"전생에 이곳을 거친 눈빛이로구나. 나를 상대로 버텨 이기면 1~3단계를 건너뛰게 해 주마. 병기와 심법은 그래도 교두들에게서 골라야 한다."</p>${B('acspar:skip','월반 시험을 치른다',{pri:1})}</div>`:'';
    const grad=a.stage===4?(acadAllDone()?`<div class="row2"><span class="note">성적은 졸업 나이와 졸업 비무 승수로 정한다. 지금이면 <b class="gold">${acadGradeOf().n}</b>.</span>${B('acgrad','졸업식',{pri:1})}</div>`:'<p class="note">"이류가 되고 졸업 비무를 마치면 졸업식을 열어 주마."</p>'):'';
    return `<p class="note">"${A.hello}"</p>${acadSteps()}${skipB}${acadStageCard(grad)}`}
  // 교두
  const head=`<p class="note">${['기본기와 몸가짐을 맡는다.','병기와 무공을 맡는다.','심법과 내공을 맡는다.','강호 실습을 맡는다.'][n.i]}</p>`;
  if(a.grad)return head+'<p class="note">"졸업한 몸이 웬일이냐. 강호는 어떠하더냐?"</p>';
  let body='';
  if(n.i===1){if(acadPickOpen())body+=acadWeaponHtml();if(acadBobOpen()&&(acadPickLocked()||P.bcur||P.acad.skip))body+=acadBobHtml();if(!acadPickOpen()) body+='<p class="note">"1단계를 마치면 병기를 고르게 해 주마."</p>';
    if(acadSparOk('inst'))body+=`<div class="row2"><span class="note">대련에서 져도 다치지 않는다.</span>${B('acspar:inst','대련을 청한다')}</div>`}
  if(n.i===2){if(acadSimOpen())body+=acadSimHtml()+acadElHtml()+(P.acad.c.talk_el||P.gkcur||P.acad.skip?acadGkHtml():'');else body+='<p class="note">"심법은 3단계에서 고른다. 심법이 없으면 수련을 해도 내공이 쌓이지 않는다."</p>'}
  if(n.i===3){if(a.stage>=3)body+=acadQuestHtml();else body+='<p class="note">"4단계가 되면 수련곡으로 실습을 나간다."</p>'}
  if(n.i===0&&a.stage===4){const left=3-(a.c.final||0);body+=left>0?`<div class="row2"><span class="note">졸업 비무 ${a.c.final||0}/3판 · ${a.c.finalWin||0}승${realmIdx()<1?' · 이류가 되어야 치를 수 있다':''}</span>${B('acspar:final',`다음 상대: ${esc(A.mates[a.c.final||0][0])}`,{d:!acadSparOk('final')})}</div>`:`<p class="note">졸업 비무를 마쳤다 (${a.c.finalWin||0}승).</p>`}
  return head+body+(acadSt().inst===n.i?acadStageCard(rep(n.i)):'')}
hook('npcDlg',c=>{if(c.html!=null||!c.n.acad)return;c.html=acadDlg(c.n)});
// 맹 총관: 고르지 않은 무관 하승 심법을 맹 공적으로 (졸업한 사람만)
const acadMptFree=al=>((P.mpt||{})[al]||0)-((P.mspent||{})[al]||0);
hook('npcDlg',c=>{const n=c.n;if(!n.maeng||n.role!=='steward'||c.html==null||!acadPast())return;const al=n.maeng,side=ALLY[al].side;if(side!==P.side)return;
  const xs=ACAD_SIM[side].filter(x=>!simKnown(x.id)),on=maengOf()===al;if(!xs.length)return;
  c.html+=`<div class="card"><h4>무관 하승 심법 <small class="dim">맹 공적 ${ACAD_SIM_COST} · 쓸 수 있는 공적 ${acadMptFree(al)} (직위는 그대로)</small></h4><div class="list">${xs.map(x=>simRowHtml(SIM[x.id],B('acbuy:'+x.id,'배운다',{d:!on||acadMptFree(al)<ACAD_SIM_COST}))).join('')}</div></div>`});
// 행동
hook('sectAct',c=>{const{a,x}=c;
  if(a==='repair'){const w=P.eq.weapon;if(acadOn()&&w&&w.dur<w.maxDur&&P.silver>=Math.ceil((w.maxDur-w.dur)*.6))P.acad.c.repair=1;return}
  if(!a.startsWith('ac'))return;
  const H={acpick:()=>acadPick(x),acsim:()=>acadSimPick(x),acbob:()=>acadBobPick(x),acgk:()=>acadGkLearn(),actalk:()=>{if(acadOn())P.acad.c['talk_'+x]=1;acadCheck()},acspar:()=>acadSpar(x),acq:()=>acadQuestTake(+x),acqd:()=>acadQuestReport(+x),
    acrep:()=>acadReport(),acgrad:()=>acadGraduate(),acrec:()=>acadRec(x),
    acbuy:()=>{const s=SIM[x],al=s&&(s.side==='정'?'jeong':'sacheon');if(!s||!s.acad||s.side!==P.side||simKnown(x)||!acadPast()||maengOf()!==al||acadMptFree(al)<ACAD_SIM_COST)return;
      P.mspent=P.mspent||{};P.mspent[al]=(P.mspent[al]||0)+ACAD_SIM_COST;P.sims[x]=1;log(`${MAENG[al].short}에서 [${s.n}]을(를) 배웠습니다. 수련 창에서 바꿔 운용할 수 있다.`,'xp')}};
  if(!H[a])return;c.done=true;c.r=true;H[a]()});

// ---- 임무창·왼쪽 임무 줄 ----
const acadQuestCard=()=>acadOn()?acadSteps()+acadStageCard():'';
function acadTrackHtml(){if(!acadOn())return'';const a=P.acad,gs=acadGoals(),g=acadCur(),p=g&&goalProg(g);
  return `<h5>${acadOf(P.side).n} ${a.stage+1}단계 · ${acadSt().n} <small>${g?gs.findIndex(o=>o.j===g.j)+1:gs.length}/${gs.length}</small></h5>`+(g?`<div>${esc(g.n)} <b>${Math.min(p.have,p.need)}/${p.need}</b></div><div class="achint">${esc(g.h)}</div>`:`<div class="done">과제 완료 · ${esc(acadReporter())}에게 보고</div>`)}

// ---- v135 (사용자): 지금 과제와 이어진 장소·물건·NPC·UI에 표시를 띄운다 ----
// 맵: 금빛 고리와 화살표(화면 밖이면 가장자리 화살표). UI: 눌러야 할 단추·창 줄에 금빛 테두리(.achl)
function acadMarks(){if(!acadOn())return[];const a=P.acad,A=acadOf(P.side),R=REGIONS[REG];if(!R)return[];
  const g=acadCur(),near=(list,l,h)=>{let b=null,bd=1e9;for(const o of list){const d=Math.hypot(o.x-P.x,o.y-P.y);if(d<bd){bd=d;b=o}}return b?[{x:b.x,y:b.y,l,h}]:[]};
  const npc=(id,l)=>{const n=(R.npcs||[]).find(n=>n.id===id);return n?[{x:n.x,y:n.y,l:l||n.n,h:84,npc:1}]:[]};
  const gate=to=>{const q=(R.gates||[]).find(q=>q.to===to);return q?[{x:q.x,y:q.y,l:q.label,h:56}]:[]};
  const qs=P.quests.filter(q=>q.acad),qOpen=qs.filter(q=>!questProg(q).done);
  if(REG===acadField(P.side)){let w=[];
    if(g&&g.k==='boss')w=near(mobs.filter(m=>m.kind==='산적두목'&&m.hp>0),'산적두목',84);
    else if(g&&g.k==='quest')for(const q of qOpen)w=w.concat(q.kind==='give'?near(nodes.filter(n=>n.t==='herb'&&n.cd<=0),q.n,40):near(mobs.filter(m=>q.mob.includes(m.kind)&&m.hp>0),q.n,80));
    return w.length?w:gate(A.id)}
  if(REG!==A.id)return gate(A.id);   // 성내 지도면 무관 포털
  const dummy=l=>near(mobs.filter(m=>m.acadDummy),l||'목인장',70);
  if(!g)return npc(a.stage===4?'ac_master':'ac_i'+acadSt().inst,'보고');
  switch(g.k){
    case'goto':{const left=g.spots.filter(s=>!a.c['spot_'+s]).map(s=>({x:ACAD_SPOTS[s][0],y:ACAD_SPOTS[s][1]+1.2,s}));const m=near(left,'',44)[0];return m?[{...m,l:left.find(o=>o.x===m.x&&o.y===m.y).s}]:[]}
    case'hit':case'mast':case'mu':return dummy();
    case'throw':return dummy('비도 던지기');
    case'pick':case'spar':case'bobpick':return npc('ac_i1');
    case'sim':case'talk':case'gklearn':return npc('ac_i2');
    case'final':return npc('ac_i0');
    case'repair':return npc('smith');
    case'boss':return gate(acadField(P.side));
    case'quest':return qs.some(q=>questProg(q).done)||!qs.length?npc('ac_i3'):gate(acadField(P.side));
    case'realm':return[{x:ACAD_SPOTS.폐관실[0],y:ACAD_SPOTS.폐관실[1]+1.2,l:'폐관실',h:44}]}
  return[]}
function acadMarkDraw(m){const p=toScreen(m.x,m.y),pad=26,top=60,bot=H-120,off=p.x<pad||p.x>W-pad||p.y-m.h<top||p.y>bot;ctx.save();
  ctx.font='bold 12px "Gowun Dodum"';ctx.textAlign='center';ctx.lineJoin='round';
  if(off){const pp=toScreen(P.x,P.y),x=clamp(p.x,pad,W-pad),y=clamp(p.y-m.h/2,top,bot),an=Math.atan2(p.y-pp.y,p.x-pp.x),k=.75+.25*Math.sin(time*5);
    ctx.translate(x,y);ctx.save();ctx.rotate(an);ctx.fillStyle=`rgba(255,211,106,${k})`;ctx.strokeStyle='#2a1a06';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-6,-9);ctx.lineTo(-2,0);ctx.lineTo(-6,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    if(m.l){const ty=y>H/2?-16:24;ctx.lineWidth=3;ctx.strokeStyle='#120c04';ctx.strokeText(m.l,0,ty);ctx.fillStyle='#ffd36a';ctx.fillText(m.l,0,ty)}ctx.restore();return}
  const k=(time*1.4)%1,b=Math.sin(time*4)*4,y=p.y-m.h+b;
  ctx.strokeStyle=`rgba(255,211,106,${.9-k*.7})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,10+k*16,5+k*8,0,0,7);ctx.stroke();
  ctx.fillStyle='#ffd36a';ctx.strokeStyle='#2a1a06';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x-8,y-12);ctx.lineTo(p.x+8,y-12);ctx.lineTo(p.x,y);ctx.closePath();ctx.fill();ctx.stroke();
  if(m.l){ctx.lineWidth=3;ctx.strokeStyle='#120c04';ctx.strokeText(m.l,p.x,y-17);ctx.fillStyle='#ffd36a';ctx.fillText(m.l,p.x,y-17)}ctx.restore()}
hook('drawList',list=>{if(!playing||!acadOn())return;for(const m of acadMarks())list.push({L:LY.TOP,d:99990,f:()=>acadMarkDraw(m)})});
function acadUi(){const g=acadCur(),a=P.acad;if(!g)return['[data-act="acrep"]','[data-act="acgrad"]'];
  const TR=['#tmenu','#b_p_char','[data-act="trainwin"]'],BAG=['#tmenu','#b_p_bag','[data-act="open:bag"]'];
  const robe=P.bag.find(i=>i.acad&&i.slot==='armor'),books=P.bag.filter(i=>i.slot==='book'&&a.cls&&ARTS[i.art]&&ARTS[i.art].cls===a.cls);
  const U={equip:[...BAG,...(robe?[`[data-act="eq:${robe.id}"]`]:[])],read:[...BAG,...books.map(i=>`[data-act="read:${i.id}"]`)],
    oe:[...TR,'[data-tr="str"]','[data-tr="end"]','[data-tr="agi"]','[data-tr="qi"]'],oeAbs:[...TR,'[data-tr="str"]','[data-tr="end"]','[data-tr="agi"]','[data-tr="qi"]'],
    ne:[...TR,'[data-tr="neigong"]'],realm:[...TR,'[data-tr="pg"]','[data-tr="pg2"]'],medit:['#t_med','#b_medit'],
    hit:['#t_atk'],mast:['#t_atk'],mu:['#t_atk'],bob:['#t_step'],leap:['#t_leap','#b_leap'],throw:['#ts_bd','#b_암기'],
    pick:['[data-act^="acpick:"]'],bobpick:['[data-act^="acbob:"]'],gklearn:['[data-act="acgk"]'],sim:['[data-act^="acsim:"]'],talk:['[data-act="actalk:el"]'],spar:['[data-act="acspar:inst"]'],final:['[data-act="acspar:final"]'],
    quest:['[data-act^="acq:"]','[data-act^="acqd:"]'],repair:['[data-act="repair"]'],panel:['#tmenu',`[data-act="open:${g.id}"]`]};
  const s=(U[g.k]||[]).slice();
  // 표시한 NPC 곁에 서 있으면 터치 상황 단추(대화)도
  if(acadMarks().some(m=>m.npc&&Math.hypot(m.x-P.x,m.y-P.y)<3))s.push('#t_ctx');
  return s}
let acadHlEls=[];
setInterval(()=>{let els=[];try{if(playing&&acadOn()){const s=acadUi();if(s.length)els=[...document.querySelectorAll(s.join(','))]}}catch(e){}
  for(const e of acadHlEls)if(!els.includes(e))e.classList.remove('achl');for(const e of els)e.classList.add('achl');acadHlEls=els},250);

// ================= 표국·상단 행렬, 표국, 객잔 별미 (v176, 사용자 2026-10-26) =================
// 영상 「무협 웹툰 속 표국과 객잔, 강호 사람들은 뭘 먹고 살았을까」에서 고른 것 넷 + 사용자 요청:
// "맵에 표국 행렬 또는 상단 행렬들이 다니고 적대 세력 또는 사파 산적들에게 공격 당하기도 해, 플레이어가 구해 주면 퀘스트로 연결되기도"
// "반대로 플레이어가 약탈도 할 수 있어" / "문파가 운영하는 표국은 직위 상관없이 일할 수 있고, 문파가 연결되지 않은 표국은 속가제자만"
// - 행렬: 성 지도(pv_)의 길을 따라 출입구로 가는 수레 하나와 표두·표사(상단은 행수·호위·상인). 세력 '상'이라 누구와도 싸우지 않고, 양민처럼
//   강제공격(T)이나 Shift+클릭으로만 칠 수 있다. 치면 약탈(cvRob): 악업, 관군 수배(P.wanted, 해가 바뀌면 하나씩 풀림).
//   수레를 부수면 약탈품이 떨어진다. 사파·마교 제자는 문파 공적도 받는다. 행렬을 자주 털면 표사들이 알아보고 먼저 칼을 뽑는다.
// - 습격: 플레이어가 가까이 있을 때 산적 떼나 적대 세력(사파·마교) 무인이 길 앞에서 덮친다. 거들어 물리치면 사례금·명성·선업,
//   그리고 행렬 우두머리가 일감을 청한다(남은 길 호위 / 산채 토벌 / 빼앗긴 표물 되찾기). 수레가 부서지면 표물을 잃는다.
// - 표국: 성읍마다 역참 옆에 하나(개봉은 진원표국). v188(사용자): 가입하는 곳이 아니고 문파·세력과도 상관없다. 출발을 앞둔 표행이
//   손을 더 모으고, 국주 창에서 표행마다 출발까지 남은 시간·목적지·표물·일행·성공 임금을 보고 '참여하기'로 한 번 따라나선다.
//   출발 시각(+grace) 안에 성문 밖 성 지도로 나가면 표행이 떠나고, 목적지 쪽 길목에 닿으면 표두가 그 자리에서 품삯을 준다. 의뢰판에도 표행 호위 방이 붙는다.
// - 객잔 별미: 성마다 하나(data/caravan.json FOOD). 사 먹으면 한동안 공격·방어·생명·회피 중 하나가 오른다. 내공은 채우지 않는다.
// - 소문: 객잔 손님들이 최근 행렬 소식(털림·구출·플레이어의 약탈)과 표행이 몰리는 길을 말한다. 그 길엔 행렬이 더 자주 지난다.
// 데이터 data/caravan.json (CARAVAN, FOOD), 설계 docs/표국_설계.md, 테스트 tests/t111_caravan.js
const CARV=GD.CARAVAN,FOOD=GD.FOOD;
PAL.pyosa={...PAL.hero,robe:['#3c5478','#1c2a40'],robeB:'#26364f',inner:'#c9a14a',trim:'#c9a14a',sash:'#8a1a1a',hairband:'#8a1a1a',jade:0,tail:0,weapon:'dao'};
PAL.pyodu={...PAL.pyosa,robe:['#24344e','#0f1828'],robeB:'#18243a',cape:'#8a1a1a',beard:1,armor:1,weapon:'big'};
PAL.sangho={...PAL.hero,robe:['#7a5a34','#3a2814'],robeB:'#54401f',inner:'#2a4a3a',trim:'#c9a14a',sash:'#2a4a3a',hairband:'#2a4a3a',jade:0,tail:0,weapon:'spear',anim:'thrust'};
PAL.merchant={...PAL.hero,robe:['#b08a4a','#5a4220'],robeB:'#7a5c2c',inner:'#8a1a1a',trim:'#e0c070',sash:'#8a1a1a',hairband:'#3a2a1a',jade:1,tail:0,beard:1,weapon:'none'};
let CVS=[],cvT=20,cvEsc=false,cvEscT=0;
const cvDanger=k=>(PV_DANGER[k]||[0,1])[0];
const cvProv=()=>provOf(REG)||'henan';
const onPv=()=>/^pv_/.test(REG);

// ---- 표국: 성읍마다 하나. 문파·세력과 상관없는 장사꾼이다 ----
// v188 (사용자 2026-10-27): "표국은 가입하는 방식이 아니라 표국이 출발 전 사람을 추가로 모집하는 형태로 표국 행렬에 참여하게, 문파나 세력 개념에서 제외"
// "표국 NPC에게 말을 걸면 출발 예정인 표행이 나오고 출발까지 남은 시간과 성공 시 받는 임금, 목적지 및 표행 내용을 보여 줘"
const PYO={};
{const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
  const add=(id,R,x,y,list)=>{const n=id==='gaebong'?'진원':CARV.pyoNames[hash(id)%CARV.pyoNames.length];
    PYO[id]={id,k:provOf(id)||'henan',n:`${n}표국`,town:id==='gaebong'?'개봉':R.name.replace(/ 성도$/,'')};
    list.push({id:'pyo',n:`${n}표국 국주`,x,y,pal:'pyodu',pyo:id})};
  add('gaebong',REGIONS.gaebong,CARV.pyoAt.gaebong[0],CARV.pyoAt.gaebong[1],NPCS);
  for(const[id,R]of Object.entries(REGIONS))if(R.city)add(id,R,CARV.pyoAt.town[0],CARV.pyoAt.town[1],R.npcs)}
// 이 표행에 따라나설 수 있나 (없으면 ''). 문파·직위는 묻지 않는다
function pyoWhy(p,r){if(!p)return'표국이 아니다';if(P.wanted>0)return'"관아에 쫓기는 사람을 표행에 끼울 수는 없소." 수배가 풀리면 다시 오자';
  if(P.quests.some(q=>q.hired))return'이미 따라나서기로 한 표행이 있다';if(P.quests.length>=4)return'맡은 의뢰가 넷이다';
  if(r&&r.got>=r.need)return'"이번 표행은 사람이 다 찼소."';return''}
// 성 지도는 40칸 맵 여러 장이라(g_split.js) 행렬은 지금 맵 안에서 걷는다. 나가는 곳 = 출입구 + 이웃 맵으로 길이 이어지는 가장자리
function cvExits(){const R=REGION(),out=[];for(const g of R.gates||[])if(!g.door)out.push({x:g.x,y:g.y,label:g.label,to:g.to});
  const E=R.edges||{};
  for(const sd of['w','e','n','s']){const to=E[sd];if(!to||!REGIONS[to])continue;const hor=sd==='n'||sd==='s',L=hor?N:NH,b=sd==='w'||sd==='n'?0:(hor?NH:N)-1,ib=sd==='w'||sd==='n'?1:b-1;
    let run=[];const flush=()=>{if(run.length){const m=run[Math.floor(run.length/2)];out.push(hor?{x:m+.5,y:ib+.5,label:REGIONS[to].name,to}:{x:ib+.5,y:m+.5,label:REGIONS[to].name,to})}run=[]};
    for(let t=1;t<L-1;t++){const[x,y]=hor?[t,b]:[b,t],[ix,iy]=hor?[t,ib]:[ib,t];if((roadAt(x,y)||roadAt(ix,iy))&&walk(ix,iy))run.push(t);else flush()}flush()}
  return out}
const pvBase=id=>String(id||'').split('@')[0];
const nowS=()=>(G.cal||0)*YEAR_SEC;
// 표행 목적지 쪽 출입구: 목적지 성 지도로 바로 나가는 곳, 없으면 그리로 이어지는 같은 성 지도의 이웃 맵 쪽
function cvToward(ex,dst){if(!dst)return[];const hit=to=>!!to&&pvBase(to)===pvId(dst);
  const direct=ex.filter(g=>hit(g.to));if(direct.length)return direct;
  // 같은 성 지도의 맵들을 넓이 우선으로 훑어, 목적지로 나가는 맵에 가장 빨리 닿는 첫 이웃 쪽 출입구
  const outs=w=>{const R=REGIONS[w];return R?[...(R.gates||[]).map(g=>g.to),...Object.values(R.edges||{})]:[]},base=pvBase(REG),first={};let q=[];
  for(const g of ex)if(g.to&&g.to!==REG&&pvBase(g.to)===base&&REGIONS[g.to]&&!(g.to in first)){first[g.to]=g.to;q.push(g.to)}
  while(q.length){const w=q.shift();if(outs(w).some(hit))return ex.filter(g=>g.to===first[w]);
    for(const n of outs(w))if(n&&n!==REG&&pvBase(n)===base&&REGIONS[n]&&!(n in first)){first[n]=first[w];q.push(n)}}
  return[]}
// 출발을 앞둔 표행: 표국마다 CARV.recruit.runs개. 떠난 표행은 지우고 새 표행을 건다
function pyoMkRun(p,dep){const RC=CARV.recruit,E=CARV.escort,lo=cvDanger(p.k),c=pick(CARV.cargo),nb=PV_NB(p.k).filter(n=>n!==p.k&&PROV[n]),dst=nb.length?pick(nb):null;
  const need=R1(RC.need[0],RC.need[1]);
  return{id:`${p.id}:${Math.round(dep)}:${Math.floor(Math.random()*1e4)}`,cargo:c.k,dst,dep,t0:nowS(),need,got:R1(0,Math.max(0,need-3)),
    silver:Math.round(R1(E.silver[0],E.silver[1])*(1+lo*.35)*c.mul),vit:E.vit+lo*20,fame:E.fame,good:E.good}}
function pyoRuns(p){G.pyoRuns=G.pyoRuns||{};const RC=CARV.recruit,t=nowS();const L=(G.pyoRuns[p.id]||[]).filter(r=>r.me||r.dep>t);
  for(const r of L)if(!r.me)r.got=Math.max(r.got,Math.min(r.need-1,Math.floor(r.need*Math.min(1,(t-r.t0)/Math.max(1,r.dep-r.t0)))));   // 떠날 날이 다가올수록 사람이 찬다(한 자리는 남긴다)
  while(L.filter(r=>!r.me).length<RC.runs){const last=Math.max(t,...L.map(r=>r.dep));L.push(pyoMkRun(p,last+(L.length?R1(RC.gap[0],RC.gap[1]):R1(RC.dep[0],RC.dep[1]))))}
  L.sort((a,b)=>a.dep-b.dep);G.pyoRuns[p.id]=L;return L}
const cargoOf=k=>CARV.cargo.find(c=>c.k===k)||CARV.cargo[0];
const dstN=k=>k&&PROV[k]?PROV[k].n:'이웃 성';
// 표행 한 장: 출발까지 남은 시간·목적지·표물·일행·성공하면 받는 임금
function pyoRunHtml(p,r,i){const c=cargoOf(r.cargo),T=CARV.types.pyo,left=r.dep-nowS(),why=r.me?'':pyoWhy(p,r);
  return `<div class="card pyorun"><div class="row2"><h4>${esc(c.n)} 표행 <small class="dim">${esc(p.town)} → ${esc(dstN(r.dst))}</small></h4><span class="tag">${left>0?`출발까지 <b>${fmtLeft(left)}</b>`:'<b class="bad">곧 떠난다</b>'}</span></div>
    <p><b>목적지</b> ${esc(PROV[p.k].n)} 성 지도를 지나 ${esc(dstN(r.dst))} 쪽 길목까지. ${esc(p.town)} 성문 밖에서 모여 떠난다</p>
    <p><b>표물</b> ${esc(c.d)} · ${esc(dstN(r.dst))}의 ${esc(c.to)}에게${c.boss?' · <b class="bad">값진 표물이라 산적두목이 노린다</b>':''}</p>
    <p><b>일행</b> ${T.lead} 1 · ${T.guard} ${T.nGuard[0]}~${T.nGuard[1]} · 모집 <b>${r.got+(r.me?1:0)}/${r.need}</b>명 · 가는 길에 습격 두 번쯤</p>
    <p><b>성공하면</b> 은자 <b class="gold">${r.silver}</b> · 활력 ${r.vit} · 명성 ${r.fame} · 선업 ${r.good} <small class="dim">길목에 닿으면 ${T.lead}가 그 자리에서 치른다. 수레가 부서지면 품삯은 없다</small></p>
    <div class="row2"><span class="${why?'bad':'note'}">${r.me?'<b class="gold">따라나서기로 했다.</b> 성문 밖 성 지도로 나가면 바로 떠난다':why||'가입할 필요 없다. 이번 한 번 품을 판다'}</span>${r.me?'':B(`pyojoin:${p.id}:${i}`,'참여하기',{pri:!why,d:!!why})}</div></div>`}
function pyoDlg(n){const p=PYO[n.pyo];if(!p)return'';
  const mine=P.quests.map((q,i)=>[q,i]).filter(([q])=>!q.hired&&(q.pyo===p.id||q.pyo==='any'));
  const rows=mine.map(([q,i])=>`<div class="it"><div>${esc(q.n)}<span>${misSpan(q,q)} · 은자 ${q.silver}${q.fail?' · <b class="bad">실패</b>':''}</span></div><div class="ib">${B('qdone:'+i,questProg(q).done?'보고하기':'진행 중',{pri:questProg(q).done,d:!questProg(q).done})}</div></div>`).join('');
  const rum=typeof cvRumor==='function'?cvRumor():'';
  return `<p class="note">"표물은 목숨보다 무겁소. 떠나기 전에 손이 모자라 사람을 더 모으고 있소. 실력만 있으면 누구든 좋소. ${esc(rum)}"</p>
    <div class="row2"><h4 style="margin:0">${esc(p.n)} · 출발 예정 표행 <small class="dim">한 번에 한 표행만</small></h4>${B('open:quest','임무창')}</div>
    ${pyoRuns(p).map((r,i)=>pyoRunHtml(p,r,i)).join('')}
    ${rows?`<h4 style="margin:0">알릴 일 <small class="dim">어느 표국에서든</small></h4><div class="list">${rows}</div>`:''}`}
hook('npcDlg',c=>{if(c.html==null&&c.n.pyo)c.html=pyoDlg(c.n)});
hook('sectAct',c=>{if(c.a!=='pyojoin')return;c.done=true;c.r=true;const p=PYO[c.x],L=p&&pyoRuns(p),r=L&&L[+c.y];if(!r||r.me||pyoWhy(p,r)||r.dep<=nowS())return;
  r.me=1;const cg=cargoOf(r.cargo);
  P.quests.push({n:`${cg.n} 표행 · ${p.town} → ${dstN(r.dst)}`,kind:'escort',cnt:1,have:0,hired:1,run:r.id,reg:pvId(p.k),dst:r.dst,dep:r.dep,cargo:r.cargo,hands:Math.min(2,r.got),
    silver:r.silver,vit:r.vit,fame:r.fame,good:r.good,pyo:p.id,pyoN:p.n,pyoAt:p.town,key:`pyo:${r.id}`});
  log(`[${p.n}] ${cg.n} 표행에 따라나서기로 했습니다. ${fmtLeft(r.dep-nowS())} 안에 ${p.town} 성문 밖 ${PROV[p.k].n} 성 지도로 나가세요.`,'info')});
function pyoRunDone(q){const L=G.pyoRuns&&G.pyoRuns[q.pyo];if(L)G.pyoRuns[q.pyo]=L.filter(r=>r.id!==q.run)}
// 의뢰판·문파 임무로 맡은 호위는 맡은 곳의 성으로 정한다. 따라나선 표행은 출발 시각이 지나도 성문 밖에 오지 않으면 기다리다 떠난다
let pyoChk=0;
hook('tick',dt=>{if(!P||!P.quests)return;for(const q of P.quests)if(q.kind==='escort'&&!q.reg&&!q.cvLive)q.reg=pvId(cvProv());
  if((pyoChk-=dt)>0)return;pyoChk=1;const t=nowS();
  for(const q of P.quests.slice())if(q.hired&&!q.went&&t>q.dep+CARV.recruit.grace){P.quests.splice(P.quests.indexOf(q),1);pyoRunDone(q);log(`[${q.n}] 표행이 기다리다 떠났습니다. 품삯은 없습니다.`,'dmg')}});
function cvEscTxt(q){if(q.cvLive)return'구해 준 행렬이 길목에 닿을 때까지';const R=REGIONS[q.reg];if(!R)return'맡은 곳 성 지도의 표행';
  if(q.hired&&!q.went){const left=q.dep-nowS();return `${R.name} 성 지도 · ${dstN(q.dst)} 쪽 길목까지 <small class="dim">${left>0?`출발까지 ${fmtLeft(left)}`:'출발 시각이 지났다, 서두르자'} · ${esc(q.pyoAt||'')} 성문 밖에서 모인다</small>`}
  return `${R.name} 성 지도${q.dg?` · ${q.dg} 길목까지`:''} <small class="dim">그 성 지도에 들어서면 표행이 기다린다</small>`}
// 옛 저장(v176~v187): 표국 신용·문파 표국 일감을 지우고, 맡아 둔 호위 일감은 따라나선 표행으로 바꾼다. 여러 번 불러도 같다
function pyoFixSave(){if(!P)return;let n=0,mv=0;
  if(P.pyo!==undefined){delete P.pyo;n++}if(G.pyoJobs){delete G.pyoJobs;n++}
  for(const q of P.quests||[]){if('pyoC'in q||'pyoSect'in q){if(q.pyoSect)delete q.merit;delete q.pyoC;delete q.pyoSect;n++}
    if(q.pyo&&q.pyo!=='any'&&q.kind==='escort'&&!q.hired&&!q.have&&!q.cvLive){Object.assign(q,{hired:1,dep:nowS()+CARV.recruit.dep[1],cargo:CARV.cargo[0].k,dst:null,run:'old',hands:1});mv++}}
  if(n||mv)log(`표국은 이제 가입하는 곳이 아닙니다. 표국 국주에게 말을 걸면 출발을 앞둔 표행이 사람을 모으고, 한 번씩 따라나서 품삯을 받습니다.${mv?' 맡아 둔 호위 일은 따라나선 표행으로 옮겼습니다.':''}`,'sys')}
hook('afterLoad',pyoFixSave);

// ---- 행렬 만들기 ----
function cvMk(cv,kind,x,y,role,name){const e=mkMob(kind,x,y);e.d={...e.d,fac:'상'};e.fixed='cv';e.cv=cv;e.cvRole=role;e.name=name;e.home={x,y};mobs.push(e);cv.mem.push(e);return e}
const roadAt=(x,y)=>map[y]&&map[y][x]&&map[y][x].g===1;
function cvRoute(o){
  const ex=cvExits();
  if(o.escort){let sx=P.x+1.4,sy=P.y+.6;if(!walkAt(sx,sy)){sx=P.x;sy=P.y}
    const far=ex.sort((a,b)=>Math.hypot(b.x-sx,b.y-sy)-Math.hypot(a.x-sx,a.y-sy)).slice(0,4),tw=cvToward(ex,o.escort.dst);   // 따라나선 표행은 목적지 쪽 길목부터
    for(const g of[...tw,...far.filter(g=>!tw.includes(g))]){if(Math.hypot(g.x-sx,g.y-sy)<(tw.includes(g)?6:10))continue;
      const path=findPath(Math.floor(sx),Math.floor(sy),Math.floor(g.x),Math.floor(g.y),3000);if(path&&path.length>8)return{sx,sy,path,g}}
    return null}
  const[n0,n1]=CARV.spawn.near;
  for(let t=0;t<8;t++){let s=null;for(let k=0;k<300&&!s;k++){const x=1+Math.floor(Math.random()*(N-2)),y=1+Math.floor(Math.random()*(NH-2)),d=Math.hypot(x+.5-P.x,y+.5-P.y);if(d>=n0&&d<=n1&&roadAt(x,y)&&walk(x,y))s={x:x+.5,y:y+.5}}
    if(!s)return null;const gs=ex.filter(g=>Math.hypot(g.x-s.x,g.y-s.y)>=CARV.spawn.minLen);if(!gs.length)continue;const g=pick(gs);
    const path=findPath(Math.floor(s.x),Math.floor(s.y),Math.floor(g.x),Math.floor(g.y),3000);if(path&&path.length>=CARV.spawn.minLen*.7)return{sx:s.x,sy:s.y,path,g}}
  return null}
function cvSpawn(type,o={}){if(!onPv())return null;const T=CARV.types[type],rt=cvRoute(o);if(!T||!rt)return null;const k=cvProv(),lo=cvDanger(k);
  const name=type==='pyo'?(o.escort&&o.escort.pyoN||`${pick(CARV.pyoNames)}표국`):`${pick(T.names)} 상단`;
  const cv={type,T,name,mem:[],raid:[],path:rt.path,i:0,len:rt.path.length,dest:{x:rt.g.x,y:rt.g.y,label:rt.g.label},help:0,
    amb:!o.escort&&Math.random()<CARV.ambush.chance,waves:o.escort?CARV.ambush.escortAt.slice():[],q:o.escort||null,
    hate:!o.escort&&type==='pyo'&&(P.cvRob||0)>=2&&Math.random()<(P.cvRob||0)*CARV.rob.hate};
  const c=cvMk(cv,T.cart,rt.sx,rt.sy,'cart',`${name} ${T.cart}`);c.maxHp=c.hp=Math.round(c.d.hp*(1+lo*.6));cv.cart=c;
  const at=(i)=>{const a=i*2.1+.6;let x=rt.sx+Math.cos(a)*1.1,y=rt.sy+Math.sin(a)*1.1;if(!walkAt(x,y)){x=rt.sx;y=rt.sy}return[x,y]};
  let n=0;cvMk(cv,'표두',...at(n++),'guard',`${name} ${T.lead}`);
  for(let i=R1(T.nGuard[0],T.nGuard[1]);i>0;i--)cvMk(cv,T.guard,...at(n++),'guard',T.guard);   // 이름표가 겹치지 않게 호위·상인은 짧은 이름
  if(o.escort&&o.escort.hired){o.escort.went=1;for(let i=o.escort.hands||0;i>0;i--)cvMk(cv,T.guard,...at(n++),'guard','모집 표사');   // 같이 모집된 사람들
    if(cargoOf(o.escort.cargo).boss)cv.boss=1}
  if(T.merchant)for(let i=R1(T.nMerch[0],T.nMerch[1]);i>0;i--)cvMk(cv,T.merchant,...at(n++),'merch',T.merchant);
  CVS.push(cv);
  if(o.escort){showBanner('표행 출발',`${name} → ${cv.dest.label}`);if(o.escort.hired)log(`${name} ${T.lead}: "모두 모였군. 출발하오!"`,'info');log(`약속한 ${name} 표행이 기다리고 있었습니다. ${cv.dest.label} 길목까지 지켜 주세요. 너무 멀어지면 표행이 멈춰 기다립니다.`,'info')}
  else log(`${name} 행렬이(가) ${cv.dest.label} 쪽으로 지나갑니다.${P.side!=='정'&&!(P.cvRob>0)?' (강제공격(T)이나 Shift+클릭으로 털 수도 있다)':''}`,'info');
  return cv}
function cvEnd(cv,rm){const i=CVS.indexOf(cv);if(i>=0)CVS.splice(i,1);if(rm)mobs=mobs.filter(m=>!cv.mem.includes(m));
  for(const m of cv.mem)m.cv=null;for(const r of cv.raid){r.cvRaid=null;r.home={x:r.x,y:r.y}}}

// ---- 습격 ----
function cvAmbush(cv,esc){const c=cv.cart,k=cvProv(),fs=[...new Set((PROV[k]&&PROV[k].sects||[]).map(s=>alFac(SECTS[s].al)))].filter(f=>f==='사'||f==='마');
  const fac=fs.length&&Math.random()<CARV.ambush.facChance?pick(fs):null;
  const ahead=cv.path[Math.min(cv.path.length-1,cv.i+6)]||c;
  const spot=()=>{for(let t=0;t<30;t++){const a=Math.random()*6.28,r=1.5+Math.random()*2.5,x=ahead.x+Math.cos(a)*r,y=ahead.y+Math.sin(a)*r;if(walkAt(x,y))return[x,y]}return[c.x+.5,c.y+.5]};
  const made=[];
  if(fac){for(let i=0;i<CARV.raid.facN;i++){const[x,y]=spot(),e=mkFac(fac,i===0?1:0,x,y);made.push(e)}}
  else{for(const[kind,n]of CARV.raid.bandit)for(let i=0;i<n;i++){const[x,y]=spot();made.push(mkMob(kind,x,y))}
    const wave=esc?CARV.ambush.escortAt.length-cv.waves.length-1:0;if(esc?CARV.raid.escortBoss[wave]||cv.boss:Math.random()<CARV.raid.boss){const[x,y]=spot();made.push(mkMob('산적두목',x,y))}}
  for(const e of made){e.cvRaid=cv;e.fixed='cv';e.aggro=true;e.tgt=pick(cv.mem);e.home={x:e.x,y:e.y};mobs.push(e);cv.raid.push(e);fx.push({t:'puff',x:e.x,y:e.y,life:.5})}
  cv.raiding=true;const who=fac?`${FACN[fac]} 무리`:'산적 떼';cv.who=who;
  showBanner('행렬 습격',`${cv.name} · ${who}`);log(`${cv.name} 행렬이(가) ${who}에게 습격당했습니다! 거들면 사례를 받습니다.`,'dmg')}
// 습격을 물리쳤다 (수레가 살아 있다)
function cvSaved(cv){if(cv.robbed)return;if(!cv.help){log(`${cv.name} 행렬이(가) 습격을 물리치고 다시 길을 떠납니다.`,'info');return}
  const R=CARV.rescue,lo=cvDanger(cvProv()),s=Math.round(R1(R.silver[0],R.silver[1])*(1+lo*.3));P.silver+=s;P.fame+=R.fame;P.good+=R.good;
  P.cvSaveN=(P.cvSaveN||0)+1;if(P.cvSaveN===1)feat(`습격당한 ${cv.name} 행렬을 구했다`);
  runHooks('cvSaved',cv);cvNews('save',cv);showBanner('행렬을 구했다',`${cv.name} · 은자 +${s}`);
  log(`${cv.name}의 ${cv.T.lead}: "은혜는 잊지 않겠소!" 사례금 은자 ${s}, 명성 +${R.fame}, 선업 +${R.good}.`,'xp');
  if(Math.random()<LEAF.cvSave)cvLeaf(`${cv.name} 행렬의 사례`);   // 비급 낱장 (g_mkmat.js)
  if(!cv.q&&Math.random()<R.offer&&P.quests.length<4)cvOffer(cv)}
// 구해 준 행렬 우두머리가 일감을 청한다
function cvOffer(cv){const L=CARV.offers.filter(o=>o.k!=='rest'||cv.i/cv.len<.7),o=pick(L);if(!o)return;cvAsk={cv,o};
  openPanel('npc',{id:'cvlead',n:`${cv.name} ${cv.T.lead}`,cvlead:1})}
let cvAsk=null;
hook('npcDlg',c=>{if(c.html!=null||!c.n.cvlead)return;const a=cvAsk;if(!a){c.html='<p class="note">"고맙소."</p>';return}const o=a.o,lo=cvDanger(cvProv()),sv=Math.round(o.silver*(1+lo*.35));
  c.html=`<p class="note">"덕분에 살았소. 염치없지만 하나만 더 부탁하겠소. ${esc(o.d)}"</p><div class="card"><h4>${esc(o.n)}</h4><p>${o.kind==='kill'?`${mobTxt(o.mob)} 처치 ${o.cnt}`:`${esc(a.cv.dest.label)} 길목까지 호위`} · 은자 ${sv} · 활력 ${o.vit} · 명성 ${o.fame} · 선업 ${o.good}</p></div>
    <div class="row2"><span class="note">맡은 의뢰 ${P.quests.length}/4</span><span>${B('cvacc','맡기',{pri:1,d:P.quests.length>=4})} ${B('cvno','사양하기')}</span></div>`});
hook('sectAct',c=>{if(c.a!=='cvacc'&&c.a!=='cvno')return;c.done=true;c.r=true;const a=cvAsk;cvAsk=null;closePanels();if(!a||c.a==='cvno'||P.quests.length>=4)return;
  const o=a.o,lo=cvDanger(cvProv()),sv=Math.round(o.silver*(1+lo*.35)),base={silver:sv,vit:o.vit,fame:o.fame,good:o.good,have:0,key:`cv:${o.k}:${Date.now()}`};
  if(o.k==='rest'){if(!CVS.includes(a.cv))return;const q={...base,n:`${a.cv.name} ${o.n}`,kind:'escort',cnt:1,reg:REG,dg:a.cv.dest.label,cvLive:1};a.cv.q=q;P.quests.push(q)}
  else P.quests.push({...base,n:o.n,kind:'kill',mob:o.mob.slice(),cnt:o.cnt,pyo:'any',pyoN:'표국'});
  log(`[${o.n}] 의뢰를 맡았습니다.`,'info')});
// 수레가 길목에 닿았다
function cvArrive(cv){const q=cv.q;log(`${cv.name} 행렬이(가) 무사히 ${cv.dest.label} 길목에 닿았습니다.`,'info');
  if(q&&P.quests.includes(q)&&!q.fail){q.have=1;
    if(q.cvLive||q.hired){P.silver+=q.silver;gainVit(q.vit);P.fame+=q.fame;P.good+=q.good;P.quests.splice(P.quests.indexOf(q),1);
      if(q.hired){P.pyoN=(P.pyoN||0)+1;if(P.pyoN===1)feat(`${cv.name} 표행을 따라 ${cv.dest.label} 길목까지 표물을 지켰다`);pyoRunDone(q);runHooks('questDone',q);log(`${cv.name} ${cv.T.lead}: "수고했소. 약속한 품삯이오. 또 사람을 모을 때 들르시오."`,'info')}
      showBanner(q.hired?'표행 완료':'호위 완료',`은자 +${q.silver}`);log(`[${q.n}] 보상: 은자 ${q.silver}, 활력 ${q.vit}, 명성 ${q.fame}, 선업 ${q.good}`,'xp')}
    else{showBanner('호위 완료','의뢰처에 보고하자');log(`[${q.n}] 호위를 마쳤습니다. ${questFrom(q).at}에 보고하세요.`,'xp')}}
  cvEnd(cv,true)}
// 수레가 부서졌다
function cvCartDown(cv){if(!CVS.includes(cv))return;
  if(cv.robbed)cvLoot(cv);
  else{log(`${cv.name} ${cv.T.cart}이(가) 부서지고 표물을 빼앗겼습니다.`,'dmg');cvNews('lost',cv)}
  const q=cv.q;if(q&&P.quests.includes(q)){q.fail=1;log(`[${q.n}] 실패: 표물을 잃었습니다.${q.hired?' 품삯은 없습니다.':''}`,'dmg');if(q.cvLive||q.hired){P.quests.splice(P.quests.indexOf(q),1);if(q.hired)pyoRunDone(q)}}
  cvEnd(cv)}

// ---- 약탈 ----
function cvRob(cv,hated){if(cv.robbed)return;cv.robbed=1;const RB=CARV.rob,f=pfac();
  for(const m of cv.mem){m.angry=1;if(m.cvRole==='guard'){m.aggro=true;m.tgt=null}}
  if(hated){log(`${cv.name}의 표사들이 당신을 알아보고 칼을 뽑습니다! 표물을 털던 자를 잊지 않았다.`,'dmg');return}
  runHooks('cvRob',cv);P.evil+=RB.evil[f]||5;P.wanted=Math.min(RB.wantedMax,(P.wanted||0)+RB.wanted);
  showBanner('약탈',`${cv.name} 행렬`);log(`${cv.name} 행렬을(를) 털기 시작했습니다. 악업이 쌓이고 관아가 당신을 수배합니다(관군이 덤빈다).`,'dmg')}
function cvLoot(cv){const L=cv.T.loot,c=cv.cart,lo=cvDanger(cvProv()),out=[];
  out.push({silver:Math.round(R1(L.silver[0],L.silver[1])*(1+lo*.4)*worldMul('loot'))});
  for(const[k,n]of L.mats)if(Math.random()<.6)out.push({mat:k,n:R1(1,n)});
  if(Math.random()<L.item){const cls=pick(CLS.filter(x=>x!=='권'));out.push({item:mkWeapon(cls,1+Math.random()*.6+lo*.15,0)})}
  if(Math.random()<.05)out.push({mat:'대환단',n:1});
  if(Math.random()<LEAF.cvRob)cvLeaf('부서진 수레');   // 비급 낱장 (g_mkmat.js)
  out.forEach((it,i)=>drops.push({x:c.x+(i%3-1)*.35,y:c.y+Math.floor(i/3)*.35,it,t:Math.random()*6}));
  P.cvRob=(P.cvRob||0)+1;if(P.cvRob===1)feat(`${cv.name} 행렬을 털었다`);if(cv.robbed&&!P.wanted)P.wanted=1;
  for(const q of P.quests)if(q.kind==='rob'&&(q.have||0)<q.cnt){q.have=(q.have||0)+1;if(q.have>=q.cnt)log(`[${q.n}] 완료. 의뢰처에 보고하세요.`,'xp')}
  const mv=CARV.rob.merit[pfac()];if(mv&&P.sect&&SECTS[P.sect]){const v=addMerit(P.sect,mv);log(`${SECTS[P.sect].n} 공적 +${v}`,'xp')}
  cvNews('rob',cv);showBanner('약탈 성공',cv.name);log(`${cv.name}의 ${cv.T.cart}을(를) 부쉈습니다. 약탈품을 주우세요.`,'xp')}
hook('struck',(e,from)=>{if(e.cv&&!e.cv.robbed&&(from===P||allies.includes(from)))cvRob(e.cv)});
hook('kill',e=>{if(e.cvRaid)e.cvRaid.help++;if(!e.cv)return;const cv=e.cv;e.d={...e.d,fac:null};   // 세력 판정(facKill '동도를 죽였다')은 건너뛴다
  if(e.cvRole!=='cart')P.evil+=CARV.rob.guardEvil[pfac()]||1;else cvCartDown(cv)});
hook('mobKilled',t=>{if(t.cv&&t.cvRole==='cart')cvCartDown(t.cv)});
hook('hitDone',c=>{if(c.e&&c.e.cvRaid&&c.from===P)c.e.cvRaid.help++});
// 수배는 해가 바뀔 때마다 하나씩 풀린다
hook('newYear',()=>{if(P.wanted>0){P.wanted--;if(!P.wanted)log('관아의 수배가 풀렸습니다.','info')}});

// ---- 행렬 움직임 (몹 한 프레임 전) ----
function cvFollow(e,cv,dt){const c=cv.cart,l=Math.hypot(c.fx,c.fy)||1,fx=c.fx/l,fy=c.fy/l,i=cv.mem.indexOf(e),sd=i%2?1:-1,back=.9+Math.floor(i/2)*.7;
  let gx=c.x-fx*back-fy*sd*.9,gy=c.y-fy*back+fx*sd*.9;if(!walkAt(gx,gy)){gx=c.x-fx*back;gy=c.y-fy*back}
  const d=Math.hypot(e.x-c.x,e.y-c.y);if(d>8){e.x=gx;e.y=gy;if(!walkAt(e.x,e.y)){e.x=c.x;e.y=c.y}}
  e.sp=e.d.sp*(d>2.6?1.6:1);e.wt=99;e.goal={x:gx,y:gy}}
hook('mobTick',(e,dt)=>{
  if(e.cvRaid){const cv=e.cvRaid;if(!CVS.includes(cv)){e.cvRaid=null;return}e.home={x:e.x,y:e.y};e.aggro=true;e.rtT=(e.rtT||0)-dt;
    const bad=!e.tgt||e.tgt.hp<=0||(e.tgt.isMob&&!mobs.includes(e.tgt));
    if(bad||e.rtT<=0){e.rtT=.8;const hp=e.d.fac?mobFoeP(e):!!e.d.hostile,live=cv.mem.filter(m=>m.hp>0);
      if(hp&&P.hp>0&&dist(P,e)<2.6&&Math.random()<.5)e.tgt=null;else if(live.length){let b=live[0],bd=1e9;for(const m of live){const q=dist(m,e);if(q<bd){bd=q;b=m}}e.tgt=b}}
    return}
  if(!e.cv)return;const cv=e.cv;if(!CVS.includes(cv)){e.cv=null;return}e.home={x:e.x,y:e.y};
  const raiders=cv.raid.filter(r=>r.hp>0),c=cv.cart;
  if(e.cvRole==='cart'){e.aggro=false;e.tgt=null;e.lost=time+1;e.nohe=1;e.wt=99;
    if(cv.stop){e.goal={x:e.x,y:e.y};e.moving=false;return}
    while(cv.i<cv.path.length&&Math.hypot(cv.path[cv.i].x-e.x,cv.path[cv.i].y-e.y)<.45)cv.i++;
    const w=cv.path[cv.i]||cv.dest;e.goal={x:w.x,y:w.y};
    // 3초 동안 앞으로 못 가면(나무·몹에 걸림) 다음 칸으로 옮긴다
    if(cv.lastI!==cv.i){cv.lastI=cv.i;cv.stuck=0}else if((cv.stuck=(cv.stuck||0)+dt)>3&&cv.path[cv.i]){e.x=cv.path[cv.i].x;e.y=cv.path[cv.i].y;cv.stuck=0}
    return}
  const near=(o,r)=>o.filter(q=>dist(q,e)<r).sort((a,b)=>dist(a,e)-dist(b,e))[0];
  if(e.cvRole==='merch'){e.aggro=false;e.tgt=null;e.lost=time+1;const th=near(raiders,4)||(cv.robbed&&dist(P,e)<4?P:null);
    if(th){e.flee=.5;e.fleeFrom=th;return}cvFollow(e,cv,dt);return}
  // 호위: 습격한 놈을 치고, 털리면 플레이어를 친다. 싸울 일이 없으면 수레를 따른다
  const r=near(raiders,14);
  if(cv.robbed&&(!r||dist(P,e)<dist(r,e))){e.angry=1;e.aggro=true;e.tgt=null;return}
  if(r){e.aggro=true;if(!e.tgt||e.tgt.hp<=0||!e.tgt.isMob||(e.rtT=(e.rtT||0)-dt)<=0){e.rtT=.6;e.tgt=r}return}
  if(e.aggro&&!cv.robbed){e.aggro=false;e.tgt=null}
  if(!cv.robbed)cvFollow(e,cv,dt)});
// ---- 행렬 한 프레임 ----
function cvStep(cv,dt){const c=cv.cart;
  if(c.hp<=0){cvCartDown(cv);return}if(!mobs.includes(c)){cvEnd(cv);return}
  cv.mem=cv.mem.filter(m=>m.hp>0&&mobs.includes(m));cv.raid=cv.raid.filter(m=>m.hp>0&&mobs.includes(m));
  if(cv.raiding&&!cv.raid.length){cv.raiding=false;cvSaved(cv)}
  const far=cv.q&&!cv.robbed&&dist(P,c)>CARV.escort.wait;if(far&&!cv.waitN){cv.waitN=1;log(`${cv.name} 표행이 멈춰 당신을 기다립니다.`,'info')}if(!far)cv.waitN=0;
  cv.stop=cv.raiding||cv.robbed||far;
  if(cv.amb&&!cv.ambDone&&cv.i>4&&dist(c,P)<CARV.ambush.near){cv.ambDone=1;cvAmbush(cv,false)}
  if(cv.waves.length&&!cv.raiding&&!cv.robbed&&cv.i/cv.len>=cv.waves[0]){cv.waves.shift();cvAmbush(cv,true)}
  if(cv.hate&&!cv.robbed&&dist(P,c)<CARV.rob.hateNear)cvRob(cv,true);
  if(!cv.robbed&&Math.hypot(c.x-cv.dest.x,c.y-cv.dest.y)<1.8)cvArrive(cv)}
// 같은 맵을 다시 여는 경우(계절 바뀜 등)에는 몹이 남아 있으므로 행렬도 그대로 둔다
let cvReg=null;
hook('regionLoaded',id=>{CVS=CVS.filter(cv=>mobs.includes(cv.cart));if(id===cvReg&&CVS.length)return;cvReg=id;cvAsk=null;cvEscT=0;cvT=R1(CARV.spawn.first[0],CARV.spawn.first[1]);cvEsc=false;if(!P||!P.quests)return;
  for(const q of P.quests.slice())if(q.kind==='escort'&&q.cvLive){P.quests.splice(P.quests.indexOf(q),1);log(`[${q.n}] 행렬과 헤어져 의뢰가 끝났습니다.`,'info')}
  cvEsc=/^pv_/.test(id)&&P.quests.some(q=>q.kind==='escort'&&q.reg===pvBase(id)&&!q.have&&!q.fail)});
hook('tick',dt=>{if(!P||!playing||G.duel||P.hp<=0)return;
  if(cvEsc&&onPv()){cvEsc=false;const q=P.quests.find(q=>q.kind==='escort'&&q.reg===pvBase(REG)&&!q.have&&!q.fail);const cv=q&&cvSpawn('pyo',{escort:q});if(cv)q.dg=cv.dest.label;else if(q)cvEscT=2}
  if(cvEscT>0&&(cvEscT-=dt)<=0)cvEsc=true;   // 길이 안 잡히면(길에서 먼 곳) 2초 뒤 다시
  for(const cv of CVS.slice())cvStep(cv,dt);
  if(!onPv()||CVS.length||(typeof inAcad==='function'&&inAcad()))return;
  if((cvT-=dt)>0)return;const S=CARV.spawn;cvT=R1(S.every[0],S.every[1]);const h=G.cvHot;
  if(Math.random()<S.chance*(h&&h.k===cvProv()&&(G.cal||0)<h.until?S.hot:1))cvSpawn(Math.random()<.55?'pyo':'sang')});

// ---- 수레 그리기: 말 뒤에 짐수레와 깃발, 위에 이름과 생명 ----
function drawWagon(cv,wx,wy){const c=cv.cart,p=toScreen(wx,wy),side=(c.fx-c.fy)>=0?1:-1,col=cv.T.col,hit=c.hit>0;ctx.save();ctx.translate(p.x,p.y);ctx.scale(side,1);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,2,26,8,0,0,7);ctx.fill();
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(14,-12);ctx.lineTo(34,-16);ctx.moveTo(14,-6);ctx.lineTo(34,-10);ctx.stroke();   // 끌채
  const box=[[-22,-26],[16,-30],[18,-10],[-20,-6]];poly(box,hit?'#fff':'#7a5232');poly([[-22,-26],[16,-30],[16,-34],[-22,-30]],hit?'#fff':'#93653e');
  if(cv.type==='sang'){poly([[-20,-30],[14,-34],[10,-48],[-16,-44]],'#c9b48a');ctx.strokeStyle='rgba(60,40,20,.6)';ctx.lineWidth=1;for(const x of[-10,0,8]){ctx.beginPath();ctx.moveTo(x,-31-x*.1);ctx.lineTo(x-1,-45-x*.1);ctx.stroke()}}
  else for(const[x,y,w,h]of[[-18,-42,13,11],[-4,-44,14,13],[-12,-52,11,9]]){poly([[x,y],[x+w,y-1],[x+w,y+h-1],[x,y+h]],'#a0703a');ctx.fillStyle='#c0301c';ctx.fillRect(x+w/2-1.5,y+1,3,h-2)}
  for(const[x,y]of[[-14,-4],[10,-7]]){ctx.fillStyle='#2a1a10';ctx.beginPath();ctx.ellipse(x,y,6,7.5,0,0,7);ctx.fill();ctx.strokeStyle='#8a6440';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y,4,5.5,0,0,7);ctx.stroke()}
  ctx.strokeStyle='#3a2a18';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-20,-28);ctx.lineTo(-20,-74);ctx.stroke();   // 깃대
  const wv=Math.sin(time*4+wx)*2;poly([[-20,-74],[-2,-71+wv],[-2,-57+wv],[-20,-60]],col);
  ctx.scale(side,1);ctx.font='bold 11px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#f0e4c8';ctx.fillText(cv.T.flag,-11*side,-62);ctx.restore()}
function drawCvTag(cv){const c=cv.cart,p=toScreen(c.x,c.y),w=40,y=p.y-78;ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(p.x-w/2-1,y-1,w+2,5);ctx.fillStyle=cv.robbed?'#c0261b':'#c9a24a';ctx.fillRect(p.x-w/2,y,w*Math.max(0,c.hp/c.maxHp),3);
  ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(`${cv.name} 행렬`,p.x+1,y-4);ctx.fillStyle=cv.robbed?'#f0a080':cv.raiding?'#ffd36a':'#9cc8f0';ctx.fillText(`${cv.name} 행렬`,p.x,y-5)}
hook('drawList',list=>{if(!playing)return;for(const cv of CVS){const c=cv.cart;if(!c||c.hp<=0)continue;const s=toScreen(c.x,c.y);if(s.x<-120||s.y<-160||s.x>W+120||s.y>H+120)continue;
  const l=Math.hypot(c.fx,c.fy)||1,wx=c.x-c.fx/l*.95,wy=c.y-c.fy/l*.95;list.push({L:LY.ENT,d:wx+wy,f:()=>drawWagon(cv,wx,wy)});list.push({L:LY.TOP,d:99000,f:()=>drawCvTag(cv)})}});
// 표국 앞의 깃발 (성읍 역참 옆)
hook('drawList',list=>{if(!playing)return;const n=npcsHere().find(q=>q.pyo);if(!n)return;const x=n.x+1.2,y=n.y-.4;list.push({L:LY.ENT,d:x+y,f:()=>{const p=toScreen(x,y);ctx.save();ctx.translate(p.x,p.y);
  ctx.strokeStyle='#3a2a18';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-70);ctx.stroke();const wv=Math.sin(time*3)*2;poly([[0,-70],[22,-67+wv],[22,-49+wv],[0,-52]],CARV.types.pyo.col);
  ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#f0e4c8';ctx.fillText('표',11,-55);ctx.restore()}})});

// ---- 객잔 별미 ----
function foodHere(){const k=cvProv(),f=FOOD.list[k];return f?{k,...f,price:worldPrice(FOOD.price[0]+FOOD.price[1]*cvDanger(k))}:null}
const FOOD_T={atk:v=>`공격력 +${v}%`,def:v=>`받는 피해 -${v}%`,hp:v=>`최대 생명 +${v}%`,eva:v=>`상대 현묘도 -${v} (덜 맞는다)`};
function foodHtml(){const f=foodHere();if(!f)return'';const m=P.meal;
  return `<div class="card"><h4>이 고장 별미 · ${esc(f.n)}</h4><p>${esc(f.d)}. ${FOOD_T[f.t](f.v)} · ${Math.round(FOOD.sec/60)}분 동안</p>${m?`<p class="note">지금 든든하다: ${esc(m.n)} (${FOOD_T[m.t](m.v)}, ${Math.ceil(m.left)}초 남음). 새로 먹으면 바뀐다.</p>`:''}
    <div class="row2"><span class="note">한 번에 하나만 든든하다. 내공은 채워 주지 않는다.</span>${B('meal','사 먹기 · 은자 '+f.price,{pri:1,d:P.silver<f.price})}</div></div>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.id==='inn')c.html=pNpcBase(c.n)+foodHtml()});
hook('sectAct',c=>{if(c.a!=='meal')return;c.done=true;c.r=true;const f=foodHere();if(!f||P.silver<f.price)return;P.silver-=f.price;P.meal={n:f.n,t:f.t,v:f.v,left:FOOD.sec};recalc();
  addText(P.x,P.y,f.n,'#a6d47f');log(`${f.n}을(를) 먹었습니다. ${FOOD_T[f.t](f.v)} (${Math.round(FOOD.sec/60)}분)`,'sys')});
hook('tick',dt=>{const m=P&&P.meal;if(!m)return;m.left-=dt;if(m.left<=0){P.meal=null;recalc();log(`${m.n}의 든든함이 가셨습니다.`,'info')}});
hook('hit',c=>{const m=P.meal;if(m&&m.t==='atk'&&c.from===P)c.m*=1+m.v/100});
hook('hurt',c=>{const m=P.meal;if(!m)return;if(m.t==='def')c.dm*=1-m.v/100;else if(m.t==='eva')c.hm=Math.max(0,c.hm-m.v)});
hook('recalc',()=>{const m=P&&P.meal;if(m&&m.t==='hp'){P.maxHp=Math.round(P.maxHp*(1+m.v/100));P.hp=Math.min(P.hp,P.maxHp)}});

// ---- 객잔 소문: 행렬 소식과 표행이 몰리는 길 (g_intel.js innLine이 부른다) ----
function cvNews(k,cv){G.cvNews=G.cvNews||[];G.cvNews.unshift({k,p:PROV[cvProv()]?PROV[cvProv()].n:'',name:cv.name,by:cv.who||'',y:G.cal||0});if(G.cvNews.length>6)G.cvNews.length=6}
function cvRumor(){const N=(G.cvNews||[]).filter(n=>(G.cal||0)-n.y<2);
  if(N.length&&Math.random()<.6){const n=pick(N);
    if(n.k==='lost')return `${n.p} 길에서 ${n.name} 행렬이 ${n.by||'산적 떼'}에게 털렸다더군. 표사들 얼굴이 말이 아니오.`;
    if(n.k==='rob')return `누가 ${n.p}에서 ${n.name} 행렬을 털었다오. 관아가 범인을 쫓는다던데${P.wanted>0?'... 설마 당신은 아니겠지?':'.'}`;
    if(n.k==='save')return `${n.p} 길에서 웬 협객이 습격당한 ${n.name} 행렬을 구했다더군. ${P.name}이라던가?`}
  const nb=typeof PV_NB==='function'?PV_NB(cvProv()).filter(k=>PROV[k]):[],k=nb.length?pick(nb):cvProv();if(!PROV[k])return'';G.cvHot={k,until:(G.cal||0)+.5};
  return `요즘 ${PROV[k].n} 길로 표행과 상단이 자주 지나간다오. 산적도 덩달아 꼬이지.`}
// 문파 임무: 정파·군부는 표행 호위, 사파·마교는 표물 털기 (호위는 맡은 곳의 성 지도에서)
SMIS.jeong.push({n:'표행 호위',kind:'escort',cnt:1,merit:18,silver:35});SMIS.gunbu&&SMIS.gunbu.push({n:'관물 호송',kind:'escort',cnt:1,merit:18,silver:35});
SMIS.sacheon.push({n:'표물 털기',kind:'rob',cnt:1,merit:20,silver:40});SMIS.magyo.push({n:'상단 약탈',kind:'rob',cnt:1,merit:20,silver:40});

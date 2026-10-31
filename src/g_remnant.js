// ================= 멸문 뒤: 장경각 약탈과 잔당 소탕 (v183, 사용자 2026-10-26) =================
// 사용자: "단리세가를 멸문시켰고 그 과정에서 도법을 익혔는데 이후 초식을 배울 방법이 없어"
//  "멸문시킨 문파의 장경각을 약탈할 경우 해당 문파의 직접 전수 무공을 제외하곤 모두 익힐 수 있어야"
//  "남은 잔존 세력을 찾아 모두 죽이면 최후의 무공도 익히고 해당 문파는 진행 중인 판에서 완전히 제거, 목록에도 안 나오고 시간이 지나도 복구가 안 되어야"
//  "최후의 잔족 세력이 탈출을 시도할 때 죽이면 그 자리에서 획득 가능하게"
// - 장경각: 멸문 폐허의 서고 전각(kit library, 없으면 본산 둘째·첫째 전각)에 서가(node lib)가 놓인다. 뒤지면(REMN.lib.dur초) '<문파> 장경각 비급'
//   한 묶음(slot lib)을 얻는다. 펼치면 그 문파의 직접 전수(hi, 고급·절기)를 뺀 모든 무공의 모든 초식을 차례로 익힌다. 읽는 규칙은 비급과 같다
//   (숙련·활력·오성 한도). 다른 계열 문파여도 읽히고(사본과 같다) 정파는 악업이 쌓인다. 한 생에 문파마다 한 번 (P.lib).
// - 잔당: 멸문한 문파마다 G.remn[문파]={reg,left,lead,known,hint}. 본산에서 REMN.hops 걸음 떨어진 들판·산에 숨는다. 장경각을 뒤지거나 객잔 소문을 들으면 숨은 곳을 안다.
//   그 맵에 가면 잔당(left명, 맨 앞은 '최후의 전인')이 서 있고 덤빈다. 전인은 직접 전수 무공을 펼치며, 쓰러뜨리면 그 자리에서 '<문파> 최후의 비전'(slot lib, hi)을 떨군다.
//   전인이 마지막 하나가 되면 비전을 품고 달아난다(REMN.escape.t초 안에 못 잡으면 다른 곳으로 숨고 잔당 regroup명을 다시 모은다).
//   잔당이 모두 죽으면 G.gone[문파]=1: 이번 판(전체 재시작 전까지, 윤회해도) 문파 목록·역참·인원표에서 사라지고 인원이 다시 차지 않는다.
// 데이터 data/remnant.json (REMN), 테스트 tests/t119_remnant.js, 설계 docs/세력_문파_설계.md 38장
const REMN=GD.REMN;

// ---- 장경각 비급 묶음 ----
function libHall(s){const M=REGIONS[hqId(s)];if(!M)return null;
  const own=k=>{const R=REGIONS[k];return R&&R.hall&&ruinSect(R)===s};
  const lib=Object.keys(REGIONS).find(k=>k.startsWith('in_')&&own(k)&&REGIONS[k].hall.kit==='library');if(lib)return lib;
  const hs=M.halls||[];return hs[1]?hs[1].id:hs[0]?hs[0].id:hqId(s)}
// hi: 직접 전수(고급·절기)만, 아니면 그 밖의 모든 무공
const libArts=(sid,hi)=>{const s=SECTS[sid];if(!s)return[];return [...new Set(s.arts.filter(m=>!!m.hi===!!hi&&ARTS[m.id]).map(m=>ARTS[m.id].id))]};
function libBox(sid,hi){const s=SECTS[sid];return{id:++itemId,slot:'lib',sect:sid,hi:hi?1:0,name:hi?`${s.n} 최후의 비전`:`${s.n} 장경각 비급`,price:REMN.lib.price*(hi?3:1)}}
const libLeft=it=>libArts(it.sect,it.hi).reduce((n,id)=>{const s=A(id);return n+ARTS[id].forms.filter((f,i)=>!(s&&s.f[i])).length},0);
function libDesc(it){const s=SECTS[it.sect];if(!s)return '사라진 문파의 비급 묶음';const L=libArts(it.sect,it.hi);
  return `${it.hi?'직접 전수 무공':'직접 전수를 뺀 문파 무공'} ${L.length}가지 (${L.map(id=>ARTS[id].n).join('·')}) · 남은 초식 ${libLeft(it)} · 펼쳐서 차례로 익힌다`}
// 다음에 익힐 초식 (차례대로). 없으면 -1
const libNext=id=>{const a=ARTS[id],s=A(id);return a.forms.findIndex((f,i)=>!(s&&s.f[i]))};
const libProbe=(id,fi)=>({slot:'book',art:id,form:fi,tu:1});
function libDlg(it){const s=SECTS[it.sect];if(!s)return '<p class="note">사라진 문파의 비급이다.</p>';
  const rows=libArts(it.sect,it.hi).map(id=>{const a=ARTS[id],st=A(id),fi=libNext(id),why=fi<0?'모두 익힘':readBlock(libProbe(id,fi));
    return `<div class="it"><div style="color:rgb(${a.ct})">${a.n} ${gradeTag(a.grade||0)} <small class="dim">${CLASS[a.cls].n}</small><span>초식 ${a.forms.length}개${st?` · 익힌 초식 ${st.f.filter(Boolean).length} · 숙련 ${Math.floor(st.p)}`:''}${fi>=0?` · 다음 [${a.forms[fi].n}] 숙련 ${a.forms[fi].req} · 활력 ${a.forms[fi].cost}`:''}${why&&fi>=0?` · <span class="bad">${esc(why)}</span>`:''}</span></div>
      <div class="ib">${B(`libl:${it.id}:${id}`,fi<0?'모두 익힘':st?'다음 초식 익히기':'익히기',{d:!!why,pri:!why})}</div></div>`}).join('');
  return `<p class="note">${it.hi?`${s.n}의 장문인이 제자에게 직접 전하던 절기다. 최후의 전인이 품고 있던 것을 거두었다.`:`멸문한 ${s.n}의 장경각에서 쓸어 담은 비급들이다. 장문인이 직접 전하던 절기는 여기 없다.`} 익히는 규칙은 비급과 같다 (숙련·활력·오성).</p><div class="list">${rows}</div>`}
function libLearn(itId,id){const it=bagAll().find(q=>q.id===+itId&&q.slot==='lib');if(!it||!libArts(it.sect,it.hi).includes(id))return;const fi=libNext(id);if(fi<0)return;
  const b={...libProbe(id,fi),id:-1};P.bag.push(b);readBook(b);const k=P.bag.indexOf(b);if(k>=0)P.bag.splice(k,1)}
hook('sectAct',c=>{if(c.a!=='libl')return;c.done=true;c.r=true;libLearn(c.x,c.y)});
hook('npcDlg',c=>{if(c.html==null&&c.n.lib){const it=bagAll().find(q=>q.id===c.n.lib);c.html=it?libDlg(it):'<p class="note">비급 묶음이 행낭에 없다.</p>'}});
const libOpen=it=>openPanel('npc',{id:'lib',lib:it.id,n:it.name});
// ---- 장경각 서가 (멸문 폐허) ----
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||!R.dead||!P)return;const s=ruinSect(R);if(!s||libHall(s)!==id)return;const p=vaultSpot();if(!p)return;
  nodes.push({t:'lib',sect:s.id,x:p.x,y:p.y,cd:P.lib&&P.lib[s.id]?99999:0})});
function libLoot(n){const s=SECTS[n.sect];if(!s)return;(P.lib=P.lib||{})[s.id]=1;n.cd=99999;const it=libBox(s.id,0);giveItem(it);
  log(`${s.n} 장경각의 서가를 뒤져 [${it.name}]을(를) 거두었다. 직접 전수를 뺀 ${s.n}의 무공 ${libArts(s.id,0).length}가지를 모두 익힐 수 있다. 행낭에서 펼친다.`,'xp');
  showBanner('장경각 약탈',s.n);feat(`멸문한 ${s.n}의 장경각을 털었다`);remnReveal(s.id,'서가 밑에 숨겨 둔 연락 쪽지');}

// ================= 잔당 =================
function remnInit(){G.remn=G.remn||{};G.gone=G.gone||{};return G.remn}
// 숨을 곳: 본산에서 hops 걸음 떨어진 들판·산 (성·본산·전각·동굴은 뺀다)
function remnSpot(s,not){const d=regHops(hqId(s)),[h0,h1]=REMN.hops;
  const L=Object.keys(d).filter(k=>{const R=REGIONS[k];return R&&d[k]>=h0&&d[k]<=h1&&k!==not&&/^(pv_|lm_)/.test(k)&&!R.city&&!R.hq&&!R.in&&!R.cave&&!(R.npcs||[]).some(n=>n.rc)});
  return L.length?pick(L):null}
const remnName=r=>REGIONS[r.reg]?REGIONS[r.reg].name:'어딘가';
const remnProv=r=>{const R=REGIONS[r.reg],p=R&&PROV[R.prov];return p?p.n:''};
// 멸문한 문파에 잔당을 세우고, 다시 일어난 문파(인원 > 0)의 잔당은 거둔다
function remnSync(){if(!G||!SECTS)return;const M=remnInit();
  for(const s of Object.values(SECTS)){const dead=sectPop(s.id)<=0;
    if(dead&&!M[s.id]&&!G.gone[s.id]){const reg=remnSpot(s);if(reg)M[s.id]={reg,left:REMN.band[s.tier]||4,lead:1,known:0}}
    else if(!dead&&M[s.id])delete M[s.id]}}
function remnReveal(sid,how){const r=remnInit()[sid],s=SECTS[sid];if(!r||!s)return;r.known=1;
  log(`${how}: ${s.n}의 잔당 ${r.left}명이 ${remnProv(r)} ${remnName(r)}에 숨어 있다.`,'xp')}
// 숨은 맵에 있는데 잔당이 보이지 않으면(넓은 맵에서 멀어져 거둬졌으면) 다시 세운다
let remnT=0;hook('tick',dt=>{if(!P||!playing||(remnT-=dt)>0)return;remnT=2;remnSync();if(!P.traveling&&Object.values(G.remn).some(r=>r.reg===REG&&r.left>0))remnSpawn(REG)});
hook('newYear',remnSync);
// 잔당 세우기: 맵 가운데 가까이 걸을 수 있는 곳에 모여 있다
// 맵을 연 때(regionLoaded)는 아직 P 자리가 바뀌기 전이라 다음 틱에 세운다
let remnPend=null;hook('regionLoaded',id=>{remnPend=id});
hook('tick',()=>{if(!P||!remnPend||remnPend!==REG)return;remnPend=null;tnArrive();remnSpawn(REG)});
function remnSpawn(id){remnSync();for(const[sid,r]of Object.entries(G.remn)){if(r.reg!==id||!(r.left>0))continue;const s=SECTS[sid];if(!s)continue;if(mobs.some(m=>m.remn===sid&&m.hp>0))continue;
  // 사람 곁 12~18칸 (넓은 맵은 44칸 밖의 몹을 거두므로 멀리 두지 않는다)
  let c=null;for(let t=0;t<300&&!c;t++){const a=Math.random()*6.28,d=12+Math.random()*6,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(x>3&&y>3&&x<N-3&&y<NH-3&&walkAt(x,y))c={x,y}}
  for(let t=0;t<200&&!c;t++){const x=4+Math.random()*(N-8),y=4+Math.random()*(NH-8);if(walkAt(x,y)&&Math.hypot(x-P.x,y-P.y)>6)c={x,y}}if(!c)continue;
  const hiA=libArts(sid,1),fac=alFac(s.al);
  for(let i=0;i<r.left;i++){let p=null;for(let t=0;t<30&&!p;t++){const x=c.x+(Math.random()-.5)*5,y=c.y+(Math.random()-.5)*5;if(walkAt(x,y))p={x,y}}if(!p)p=c;
    const lead=i===0&&r.lead,e=mkFac(fac,lead?1:0,p.x,p.y,sid);e.fixed='remn';e.remn=sid;e.angry=1;e.home={x:p.x,y:p.y};
    if(lead){e.remnLead=1;e.rank=REMN.leadRank;e.realm=Math.min(6,Math.max(2,realmIdx()+REMN.leadRealm));if(hiA.length){e.art=hiA[0];e.known=ARTS[hiA[0]].forms.length}
      if(typeof scaleMob==='function')scaleMob(e);e.maxHp=Math.round(e.maxHp*REMN.leadHp);e.hp=e.maxHp;e.atk=Math.round(e.atk*REMN.leadAtk);e.name=`${s.n} 최후의 전인`}
    else e.name=`${s.n} 잔당`;
    mobs.push(e)}
  log(`이곳에 ${s.n}의 잔당 ${r.left}명이 숨어 있다.${r.lead?' 최후의 전인이 문파의 절기를 품고 있다.':''}`,'dmg');r.known=1;showBanner(`${s.n} 잔당`,r.lead?'최후의 전인':'잔당 소탕')}}
// 마지막 하나가 된 전인은 비급을 품고 달아난다. 그 사이에 쓰러뜨리면 그 자리에서 비전을 얻는다
function remnGate(e){let b=null,bd=1e9;for(const g of REGION().gates||[]){const d=Math.hypot(g.x-e.x,g.y-e.y);if(d<bd){bd=d;b=g}}return b}
hook('mobTick',(e,dt)=>{if(!e.remnLead||e.hp<=0)return;const r=G.remn&&G.remn[e.remn];if(!r)return;
  if(e.escT==null){if(mobs.some(m=>m!==e&&m.remn===e.remn&&m.hp>0))return;const g=remnGate(e);if(!g)return;e.escT=REMN.escape.t;e.escG=g;
    addText(e.x,e.y-.6,'이 비급만은 넘길 수 없다!','#ffb070');log(`${e.name}이(가) 문파의 절기를 품고 달아나려 한다! ${REMN.escape.t}초 안에 쓰러뜨려야 한다.`,'dmg');showBanner('탈출 시도',`${e.name}`)}
  const g=e.escG;e.escT-=dt;e.flee=.3;e.fleeFrom={x:2*e.x-g.x,y:2*e.y-g.y};e.stun=0;
  if(e.escT<=0||Math.hypot(g.x-e.x,g.y-e.y)<REMN.escape.gate)remnEscape(e,r)});
function remnEscape(e,r){const s=SECTS[e.remn],i=mobs.indexOf(e);if(i>=0)mobs.splice(i,1);fx.push({t:'puff',x:e.x,y:e.y,life:.6});
  const reg=remnSpot(s,r.reg)||r.reg;r.reg=reg;r.left=1+REMN.regroup;r.known=0;r.hint=remnProv(r);
  log(`${e.name}이(가) 달아났다. 남은 무리를 모아 ${r.hint||'어딘가'} 쪽으로 숨어든 듯하다.`,'dmg')}
hook('kill',e=>{if(!e.remn)return;const r=G.remn&&G.remn[e.remn],s=SECTS[e.remn];if(!r||!s)return;r.left=Math.max(0,r.left-1);
  if(e.remnLead&&libArts(s.id,1).length){r.lead=0;const it=libBox(s.id,1);giveItem(it);addText(e.x,e.y-.6,it.name,'#ffd27a');
    log(`${e.name}을(를) 쓰러뜨리고 품에서 [${it.name}]을(를) 거두었다.${e.escT!=null?' 달아나기 직전이었다.':''} 행낭에서 펼치면 ${s.n}의 직접 전수 무공을 익힌다.`,'xp');feat(`${s.n}의 최후의 전인을 쓰러뜨렸다`)}
  if(e.remnLead)r.lead=0;if(r.left<=0)remnEnd(s)});
// 잔당이 모두 죽으면 문파는 이번 판에서 사라진다 (전체 재시작 G0 전까지)
function remnEnd(s){remnInit();delete G.remn[s.id];G.gone[s.id]=1;if(G.pop)G.pop[s.id]=0;P.fame+=REMN.fame;
  log(`${s.n}의 마지막 잔당까지 쓰러졌다. ${s.n}은(는) 강호에서 완전히 사라졌다. 명성 +${REMN.fame}`,'xp');showBanner('절멸',s.n);feat(`${s.n}을(를) 강호에서 지웠다`)}
// ---- 객잔 소문·임무창 ----
function remnRumor(){const L=Object.entries(remnInit()).filter(([sid,r])=>!r.known&&SECTS[sid]);if(!L.length)return'';const[sid,r]=pick(L);r.known=1;
  return `멸문한 ${SECTS[sid].n}의 잔당이 ${remnProv(r)} ${remnName(r)}에 숨어 지낸다더군.${r.lead?' 장문인의 절기를 이은 자가 하나 남았다던데.':''}`}
function remnCard(){const L=Object.entries(remnInit()).filter(([sid])=>SECTS[sid]);if(!L.length)return'';
  return `<div class="card"><h4>멸문 문파의 잔당 <small class="dim">모두 쓰러뜨리면 그 문파는 이번 판에서 사라진다</small></h4>${L.map(([sid,r])=>`<p class="note"><b>${SECTS[sid].n}</b> 잔당 ${r.left}명${r.lead?' · 최후의 전인':''} · ${r.known?`<span class="gold">${esc(remnProv(r))} ${esc(remnName(r))}</span>`:r.hint?`${esc(r.hint)} 어딘가로 숨었다`:'숨은 곳을 모른다 (장경각·객잔 소문)'}</p>`).join('')}</div>`}

// ================= 문주전 비밀 통로와 기관 지하도 (사용자 2026-10-26) =================
// "문주전이나 특정 전각 안에 비밀통로를 배치하고 이용 시 지하터널을 통과, 지하터널에는 기관진식. 지하터널을 탈출하면 탈출한 세력이 도망간 지역으로 이동되어
//  추적할 수 있게. 탈출구는 기믹을 통해 발견하게. 전각으로 진입하여도 바로 보이지 않게"
// - 멸문한 문파의 문주전(금고가 있는 첫 전각) 안에 촛대 셋(mech: 해·달·별)과 현판(plaque)이 있다. 현판 글귀의 차례대로 촛대를 돌리면
//   왼쪽 벽 서가가 밀려나 비밀 통로(gate tn)가 드러난다. 틀리면 화살이 날아오고 처음부터. 한 번 열면 그 판 내내 열려 있다(G.tn[문파].open).
// - 지하도 'tn_<문파>': 동굴 생성기(genCave)로 판 굴. 바닥 곳곳에 철침 판(오르내린다)과 화살 발판(밟으면 잠깐 뒤 한 줄로 화살)이 깔렸다.
//   안쪽 방의 출구(tnexit)를 밀고 나가면 잔당이 숨은 맵으로 나온다(그 맵을 알게 된다). 잔당이 없으면 본산 앞으로.
const TNC=REMN.tunnel,MECH=REMN.mech;
const tnId=sid=>'tn_'+sid;
const tnSt=sid=>{G.tn=G.tn||{};return G.tn[sid]||(G.tn[sid]={open:0,seq:[]})};
// 문파마다 정해진 촛대 차례 (해·달·별의 순열)
function tnOrder(s){const P3=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];return P3[Math.floor(hash(s.i*13+5,77)*6)%6].map(i=>MECH.names[i])}
const tnHere=id=>{const R=REGIONS[id];if(!R||!R.dead)return null;const s=ruinSect(R);return s&&vaultHall(s)===id&&!(G.gone&&G.gone[s.id])?s:null};
// 지하도 지역 (모든 문파에 미리 만들어 두어 저장·불러오기가 그 안이어도 열린다). 들어오는 문 자리는 문주전을 연 뒤에 정해진다
let TN=null;   // 지금 지하도: {sid,traps,shots}
for(const s of Object.values(SECTS)){const W=TNC.w,mid=Math.floor(W/2),id=tnId(s.id),T=CAVE_TH.stone;
  REGIONS[id]={name:`${s.n} 비밀 지하도`,in:1,cave:{dark:T.dark,dk:T.dk,kind:'secret',th:'stone'},theme:'dark',size:W,tn:s.id,
    gen:()=>{genCave({th:'stone',w:W,h:W,seed:8000+s.i*17,kind:'secret'});tnBuild(s)},bake:()=>bakeCave('stone'),zone:()=>`${s.n} 비밀 지하도`,spawns:[],bosses:[],npcs:[],
    gates:[{x:mid+.5,y:W-1.6,to:vaultHall(s)||hqId(s),get tx(){const t=G.tn&&G.tn[s.id];return t&&t.gx!=null?t.gx+1:3},get ty(){const t=G.tn&&G.tn[s.id];return t&&t.gy!=null?t.gy:4},label:'문주전으로',door:1}]}}
// 굴을 판 뒤: 안쪽 방 상자 자리를 출구로, 굴 바닥에 기관을 깐다
function tnBuild(s){const W=N,mid=Math.floor(W/2),r=rng(9100+s.i*7);TN={sid:s.id,traps:[],shots:[]};
  for(const n of nodes)if(n.t==='chest'){n.t='tnexit';n.sect=s.id;n.cd=0}
  const ex=nodes.find(n=>n.t==='tnexit'),far=(x,y)=>Math.hypot(x-mid,y-(W-3))>TNC.keep&&(!ex||Math.hypot(x-ex.x,y-ex.y)>3);
  const fl=[];for(let y=2;y<W-2;y++)for(let x=2;x<W-2;x++)if(walk(x,y)&&far(x+.5,y+.5))fl.push([x,y]);
  const take=()=>{for(let t=0;t<40&&fl.length;t++){const k=Math.floor(r()*fl.length),[x,y]=fl[k];fl.splice(k,1);if(!TN.traps.some(q=>Math.hypot(q.x-x-.5,q.y-y-.5)<2.2))return{x:x+.5,y:y+.5}}return null};
  for(let i=0;i<TNC.spike.n;i++){const p=take();if(p)TN.traps.push({k:'spike',...p,ph:r(),cd:0})}
  for(let i=0;i<TNC.arrow.n;i++){const p=take();if(p)TN.traps.push({k:'arrow',...p,dir:r()<.5?[1,0]:[0,1],arm:0,cd:0})}}
hook('regionGen',id=>{if(!REGIONS[id]||!REGIONS[id].tn)TN=null});
const trapSrc={hm:0,d:{},name:'기관'};
const spikeUp=t=>{const S=TNC.spike,c=S.up+S.down;return ((time+t.ph*c)%c)<S.up};
hook('tick',dt=>{if(!TN||!P||P.hp<=0||REG!==tnId(TN.sid))return;const S=TNC.spike,A=TNC.arrow;
  for(const t of TN.traps){t.cd=Math.max(0,t.cd-dt);const on=Math.abs(P.x-t.x)<.55&&Math.abs(P.y-t.y)<.55&&!(P.z>0);
    if(t.k==='spike'){if(on&&spikeUp(t)&&t.cd<=0){t.cd=S.cd;hurtP(Math.round(P.maxHp*S.dm),trapSrc);addText(P.x,P.y-.5,'철침!','#e0e0e0')}continue}
    if(t.arm>0){t.arm-=dt;if(t.arm<=0){t.cd=2;const L=A.len,[dx,dy]=t.dir,x0=t.x-dx*L,y0=t.y-dy*L,x1=t.x+dx*L,y1=t.y+dy*L;TN.shots.push({x0,y0,x1,y1,t:.35});
      const along=(P.x-x0)*dx+(P.y-y0)*dy,off=Math.abs((P.x-x0)*dy-(P.y-y0)*dx);if(along>=0&&along<=2*L&&off<.6){hurtP(Math.round(P.maxHp*A.dm),trapSrc);addText(P.x,P.y-.5,'화살!','#ffb070')}}}
    else if(on&&t.cd<=0){t.arm=A.warn;addText(t.x,t.y-.4,'딸깍','#d8d0b0')}}
  for(const s of TN.shots)s.t-=dt;TN.shots=TN.shots.filter(s=>s.t>0)});
hook('drawList',list=>{if(!TN||REG!==tnId(TN.sid))return;const LYb=LY.BACK;
  for(const t of TN.traps)if(Math.hypot(t.x-P.x,t.y-P.y)<26)list.push({L:LYb,d:t.x+t.y-.3,f:()=>drawTrap(t)});
  for(const s of TN.shots)list.push({L:LY.FX,d:9000,f:()=>{const a=toScreen(s.x0,s.y0),b=toScreen(s.x1,s.y1);ctx.save();ctx.strokeStyle=`rgba(230,210,170,${Math.min(1,s.t*3)})`;ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.lineDashOffset=-time*200;ctx.beginPath();ctx.moveTo(a.x,a.y-12);ctx.lineTo(b.x,b.y-12);ctx.stroke();ctx.restore()}})});
function drawTrap(t){const p=toScreen(t.x,t.y);ctx.save();ctx.translate(p.x,p.y);const dia=(w,h,f)=>{ctx.fillStyle=f;ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(0,-h);ctx.lineTo(w,0);ctx.lineTo(0,h);ctx.closePath();ctx.fill()};
  dia(15,7.5,'rgba(40,36,32,.85)');dia(12,6,t.k==='arrow'?(t.arm>0?'#8a5a30':'#4a4038'):'#3a3a40');
  if(t.k==='spike'){const up=spikeUp(t);ctx.fillStyle=up?'#d8d8e0':'#6a6a70';for(const[x,y]of[[-6,0],[0,-3],[6,0],[0,3],[0,0]]){ctx.beginPath();ctx.moveTo(x-1.6,y);ctx.lineTo(x,y-(up?11:2));ctx.lineTo(x+1.6,y);ctx.fill()}}
  else{ctx.strokeStyle='#2a2420';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-6,-3);ctx.lineTo(6,3);ctx.moveTo(-6,3);ctx.lineTo(6,-3);ctx.stroke()}
  ctx.restore()}
// ---- 문주전 촛대·현판 ----
function tnSpot(x0,y0){for(let r=0;r<5;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const x=x0+i,y=y0+j;if(x>1&&y>1&&x<N-2&&y<NH-2&&walk(x,y)&&!objs[y][x]&&!nodes.some(n=>Math.hypot(n.x-x-.5,n.y-y-.5)<1.2))return{x:x+.5,y:y+.5}}return null}
// 왼쪽 벽 안쪽의 서가(없으면 셋째 줄 칸)가 통로 자리
function tnDoor(){for(let y=3;y<NH-3;y++)if(objs[y][1]==='shelf'||objs[y][1]==='rack')return{x:1,y};return{x:1,y:3}}
function tnOpenDoor(s){const st=tnSt(s.id),d=tnDoor(),R=REGIONS[vaultHall(s)];objs[d.y][d.x]=null;st.gx=d.x+.5;st.gy=d.y+.5;
  if(!R.gates.some(g=>g.tn===s.id))R.gates.push({x:d.x+.5,y:d.y+.5,to:tnId(s.id),tx:Math.floor(TNC.w/2)+.5,ty:TNC.w-3.2,label:'비밀 통로',door:1,tn:s.id})}
hook('regionLoaded',id=>{const R=REGIONS[id];if(R&&R.gates)R.gates=R.gates.filter(g=>g.tn==null||tnHere(id));const s=tnHere(id);if(!s||!P)return;const st=tnSt(s.id),mid=Math.floor(N/2);
  if(st.open){tnOpenDoor(s);return}
  const pl=tnSpot(mid-2,3);if(pl)nodes.push({t:'plaque',sect:s.id,...pl,cd:0});
  [[3,5],[N-4,5],[mid+3,NH-4]].forEach(([x,y],k)=>{const p=tnSpot(x,y);if(p)nodes.push({t:'mech',sect:s.id,k:MECH.names[k],...p,cd:0})})});
function plaqueRead(n){const s=SECTS[n.sect];log(`현판: "${tnOrder(s).map(k=>MECH.words[k]).join(', ')}" 촛대 받침에 해·달·별이 새겨져 있다.`,'info')}
function mechTurn(n){const s=SECTS[n.sect],st=tnSt(s.id);if(st.open){log('촛대는 이미 다 돌아가 있다.','info');return}const want=tnOrder(s);st.seq.push(n.k);
  const ok=st.seq.every((k,i)=>want[i]===k);
  if(!ok){st.seq=[];hurtP(Math.round(P.maxHp*MECH.fail),trapSrc);addText(P.x,P.y-.5,'화살!','#ffb070');log(`[${n.k}] 촛대를 돌리자 벽에서 화살이 날아왔다. 촛대들이 처음 자리로 돌아간다.`,'dmg');return}
  addText(n.x,n.y-.6,'철컥','#e8d8a8');if(st.seq.length<want.length){log(`[${n.k}] 촛대가 철컥 돌아갔다.`,'info');return}
  st.open=1;st.seq=[];tnOpenDoor(s);log(`세 촛대가 맞물리자 왼쪽 벽 서가가 밀려나며 비밀 통로가 드러났다.`,'xp');showBanner('비밀 통로',`${s.n} 문주전`);feat(`${s.n} 문주전의 비밀 통로를 찾았다`)}
function tnExit(n){const s=SECTS[n.sect],r=G.remn&&G.remn[s.id];let to=hqId(s);
  if(r){r.known=1;to=r.reg;log(`좁은 굴을 빠져나오니 ${remnProv(r)} ${remnName(r)}이다. ${s.n}의 잔당이 이 길로 달아났다.`,'xp')}else log(`굴을 빠져나오니 ${s.n} 본산 근처다.`,'info');
  const R=REGIONS[to],g=(R.gates||[]).find(q=>!q.door)||(R.gates||[])[0],W=R.size||40,H=R.h||W;
  P.tnArr=1;travel({to,tx:g?g.x+(W/2-g.x)*.15:W/2,ty:g?g.y+(H/2-g.y)*.15:H/2})}
// 나온 자리가 막혀 있으면 가까운 걸을 칸으로
function tnArrive(){if(!P.tnArr)return;P.tnArr=0;if(walkAt(P.x,P.y))return;const x0=Math.floor(P.x),y0=Math.floor(P.y);
  for(let r=1;r<20;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const x=x0+i,y=y0+j;if(x>0&&y>0&&x<N-1&&y<NH-1&&walk(x,y)){P.x=x+.5;P.y=y+.5;return}}}
// interact(g_life.js)가 먼저 부른다. 처리했으면 true
function remnNode(n){
  if(n.t==='lib'&&n.live){const s=SECTS[n.sect];openPanel('npc',{id:'slib',slib:s.id,n:`${s.n} 장경각`});return true}
  if(n.t==='lib'){P.chan={t:0,dur:REMN.lib.dur,label:'장경각 서가를 뒤진다',fn:()=>libLoot(n)};return true}
  if(n.t==='plaque'){plaqueRead(n);return true}
  if(n.t==='mech'){P.chan={t:0,dur:MECH.turn,label:`[${n.k}] 촛대를 돌린다`,fn:()=>mechTurn(n)};return true}
  if(n.t==='tnexit'){P.chan={t:0,dur:TNC.exit,label:'출구를 밀어 연다',fn:()=>tnExit(n)};return true}
  return false}
function drawRemnNode(n){const p=toScreen(n.x,n.y),ready=n.cd<=0;ctx.save();ctx.translate(p.x,p.y);
  if(n.t==='lib'){ctx.fillStyle='#3a2a1c';ctx.fillRect(-12,-26,24,26);ctx.fillStyle='#6a4a2a';for(let i=0;i<3;i++)ctx.fillRect(-11,-24+i*8,22,2);
    const C=['#8a3a2a','#3a5a6a','#a08040','#4a6a3a'];for(let i=0;i<3;i++)for(let k=0;k<5;k++){ctx.fillStyle=C[(i+k)%4];ctx.fillRect(-10+k*4,-22+i*8,3,6)}
    if(ready){ctx.strokeStyle=`rgba(255,225,150,${.5+.4*Math.sin(time*4)})`;ctx.lineWidth=1.5;ctx.strokeRect(-13,-27,26,28)}}
  else if(n.t==='plaque'){ctx.fillStyle='#2a1a10';ctx.fillRect(-14,-30,28,12);ctx.strokeStyle='#a08040';ctx.lineWidth=1.5;ctx.strokeRect(-13,-29,26,10);ctx.fillStyle='#c9a14a';ctx.font='8px serif';ctx.textAlign='center';ctx.fillText('日 月 星',0,-21);ctx.fillStyle='#3a2a1c';ctx.fillRect(-1,-18,2,18)}
  else if(n.t==='mech'){const lit=G.tn&&G.tn[n.sect]&&(G.tn[n.sect].open||G.tn[n.sect].seq.includes(n.k));ctx.fillStyle='#5a4a30';ctx.fillRect(-1.5,-22,3,22);ctx.fillRect(-6,-1,12,2);ctx.fillRect(-5,-23,10,2);
    if(lit){const f=1+Math.sin(time*12+n.x)*.15;ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.ellipse(0,-27,2.2*f,4*f,0,0,7);ctx.fill()}
    ctx.fillStyle='#8a7a5a';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText(n.k,0,4)}
  else if(n.t==='tnexit'){ctx.fillStyle='#1a1410';ctx.beginPath();ctx.ellipse(0,-4,14,7,0,0,7);ctx.fill();ctx.strokeStyle='#6a5a40';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-4,14,7,0,0,7);ctx.stroke();
    ctx.fillStyle=`rgba(200,230,255,${.25+.15*Math.sin(time*2)})`;ctx.beginPath();ctx.ellipse(0,-6,8,3,0,0,7);ctx.fill()}
  ctx.restore()}

// ================= 살아 있는 문파: 장로와 장경각의 전수 (사용자 2026-10-26) =================
// "기존에 문파 무공 전수 방식도 문주만 익히거나 대제자만 익히는 무공을 제외하곤 해당 무공을 익힌 장로나 장경각을 통해 익힐 수 있게"
// - 직접 전수 무공(hi, 고급): 지금처럼 장문인(사부)이 직위에 따라 전한다(공적 비급·가르침 청하기).
// - 그 밖의 문파 무공(일반·중승·입문공): 제자는 ① 장로에게 한 초식씩 배운다(숙련만 닿으면, 활력 없이) ② 장경각 서가에서 비급을 열람해 익힌다(비급 규칙: 숙련·활력·오성).
//   천마신교는 남의 당 무공을 막는 규칙(mgArtBlock)을 그대로 따른다. 공적 비급(mbuy)도 그대로 남는다.
function sectTeachWhy(s,id){const meta=s.arts.find(m=>ARTS[m.id]&&ARTS[m.id].id===id);if(!meta||meta.hi)return '직접 전수';if(P.sect!==s.id)return '제자만';
  if(s.id==='cheonma'){const b=mgArtBlock(meta);if(b)return b}return ''}
function elderNext(id){const a=ARTS[id],s=A(id),fi=libNext(id);if(fi<0)return{fi,why:'모두 익힘'};
  if(!s&&capArts().length>=artCap())return{fi,why:`오성 ${P.wis}로는 ${artCap()}가지까지`};if(!artSideOk(a))return{fi,why:'다른 계열'};
  if((s?s.p:0)<a.forms[fi].req)return{fi,why:`숙련 ${a.forms[fi].req} 필요`};return{fi,why:''}}
// mode: 'elder' 장로가 가르친다 / 'lib' 장경각 열람
function sectTeachRows(s,mode){return libArts(s.id,0).map(id=>{const a=ARTS[id],st=A(id),w0=sectTeachWhy(s,id);
  const nx=mode==='elder'?elderNext(id):{fi:libNext(id),why:''},fi=nx.fi,why=w0||(fi<0?'모두 익힘':mode==='elder'?nx.why:readBlock({slot:'book',art:id,form:fi}));
  return `<div class="it"><div style="color:rgb(${a.ct})">${a.n} ${gradeTag(a.grade||0)} <small class="dim">${CLASS[a.cls].n}</small><span>초식 ${a.forms.length}개${st?` · 익힌 초식 ${st.f.filter(Boolean).length} · 숙련 ${Math.floor(st.p)}`:''}${fi>=0?` · 다음 [${a.forms[fi].n}] 숙련 ${a.forms[fi].req}${mode==='lib'?` · 활력 ${a.forms[fi].cost}`:''}`:''}${why&&fi>=0&&!w0?` · <span class="bad">${esc(why)}</span>`:''}</span></div>
    <div class="ib">${B(`${mode==='elder'?'eteach':'slibl'}:${s.id}:${id}`,w0||(fi<0?'모두 익힘':mode==='elder'?(st?'가르침 청하기':'배우기'):(st?'다음 초식 열람':'열람해 익히기')),{d:!!why,pri:!why})}</div></div>`}).join('')}
function elderTeachHtml(s){if(P.sect!==s.id)return'';const rows=sectTeachRows(s,'elder');if(!rows)return'';
  return `<h4 style="margin:0">장로의 가르침 <small class="dim">직접 전수 무공 말고는 장로가 한 초식씩 가르친다 · 숙련만 닿으면</small></h4><div class="list">${rows}</div>`}
function sectLibDlg(s){if(P.sect!==s.id)return `<p class="note">${s.n}의 장경각이다. 제자가 아니면 서가에 손댈 수 없다.</p>`;
  return `<p class="note">${s.n}의 장경각. 장문인이 직접 전하는 절기 말고는 여기서 비급을 열람해 익힐 수 있다. 규칙은 비급과 같다 (숙련·활력·오성).</p><div class="list">${sectTeachRows(s,'lib')}</div>`}
hook('sectAct',c=>{if(c.a!=='eteach'&&c.a!=='slibl')return;c.done=true;c.r=true;const s=SECTS[c.x],id=c.y,a=ARTS[id];if(!s||!a||sectTeachWhy(s,id))return;
  if(c.a==='slibl'){const fi=libNext(id);if(fi<0)return;const b={slot:'book',art:id,form:fi,id:-1};P.bag.push(b);readBook(b);const k=P.bag.indexOf(b);if(k>=0)P.bag.splice(k,1);return}
  const nx=elderNext(id);if(nx.why||nx.fi<0)return;if(!A(id))P.arts[id]={p:0,f:a.forms.map(()=>false)};P.arts[id].f[nx.fi]=true;
  log(`${s.n} 장로에게서 [${a.n} · ${a.forms[nx.fi].n}]을(를) 배웠습니다.`,'xp');if(allLearned(id))log(`필살기 [${a.ult.n}]을(를) 쓸 수 있습니다.`,'xp');if(!P.cur||!A(P.cur))setArt(id)});
// 장로 창(g_stage.js elderDlg)이 먼저 그려진 뒤 뒤에 붙인다
hook('npcDlg',c=>{if(c.html==null||!c.n.elder||P.sect!==c.n.elder||!SECTS[c.n.elder])return;c.html+=elderTeachHtml(SECTS[c.n.elder])});
hook('npcDlg',c=>{if(c.html==null&&c.n.slib&&SECTS[c.n.slib])c.html=sectLibDlg(SECTS[c.n.slib])});
// 살아 있는 문파의 장경각 서가 (폐허가 아니면): 제자는 열람한다
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||R.dead||!R.hall||!P)return;const s=ruinSect(R);if(!s||sectGone(s.id)||libHall(s)!==id)return;const p=tnSpot(3,3)||vaultSpot();if(!p)return;
  nodes.push({t:'lib',sect:s.id,live:1,x:p.x,y:p.y,cd:0})});

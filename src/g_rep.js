// ================= 세력·문파 우호도 (v182, 사용자 2026-10-26) =================
// "플레이어 캐릭터 기준으로 세력 및 문파별 우호도를 별도로 두고 윤회 시 초기화. 정파지만 금군의 임무나 도움을 줘서 우호도를 올리거나,
//  강제공격으로 개방을 공격하면 우호도에 따라 경계·적대로 바뀌는"
// - P.rep={fac:{정,사,마,관},sect:{문파:값},gift:{문파:해}}. newLife가 P를 새로 만들므로 윤회하면 비어 있다(처음 쓸 때 만든다).
// - 점수 = 바탕 + 세력 값 + 문파 값. 바탕: 내 문파 50, 내 세력 30, 서로 싸우지 않는 세력 20, 적 세력(FAC_FOE·천하대전 구도) -60. 마성이 짙으면 정파 -20.
// - 단계: 적대(-40 아래) 보이면 덤빈다 · 경계(0 아래) 먼저 덤비진 않지만 곁에 머물면 칼을 뽑는다 · 중립 · 우호(40 이상) 그 문파 비급 공적 10% 할인.
//   적 세력이라도 우호도를 올려 경계·중립이 되면 먼저 덤비지 않는다. 천하대전 중 적 진영은 우호도와 상관없이 적이다.
// - 오르는 길: 문파·맹 임무(남의 문파 임무가 더 크다), 표국 임무, 행렬 구출(관), 그 세력의 적 처치(세력 값 30까지), 본산·연락관 예물.
//   내리는 길: 같은 편을 치거나 죽이기(그 문파·세력), 무인 처치(그 문파), 행렬 약탈(관). 해마다 조금씩 0으로 돌아간다(원한 10%, 은혜 5%).
// - 문파에 진 원한(세력 값 + 문파 값)이 -20 아래면 가입·임무·동원을 거절한다. 다른 성향의 문파도 경계 이상이면 객원으로 임무를 준다.
// 데이터 data/rep.json (REP), 테스트 tests/t117_rep.js, 설계 docs/세력_문파_설계.md 37장
const REP=GD.REP,REPF=['정','사','마','관'];
function repD(){if(!P.rep)P.rep={fac:{},sect:{},gift:{}};const r=P.rep;r.fac=r.fac||{};r.sect=r.sect||{};r.gift=r.gift||{};return r}
const repStageOf=v=>v<REP.stage[0]?0:v<REP.stage[1]?1:v<REP.stage[2]?2:3;
const repName=v=>REP.names[repStageOf(v)];
const repCol=v=>REP.col[repStageOf(v)];
function repFacBase(f){const pf=pfac();let b=f===pf?REP.base.ownFac:facFoe(f,pf)?REP.base.foe:REP.base.ally;
  if(REP.mara&&f===REP.mara.fac&&typeof maraTier==='function'&&maraTier()>=REP.mara.tier)b+=REP.mara.v;return b}
const repFac=f=>clamp(repFacBase(f)+(repD().fac[f]||0),-REP.lim,REP.lim);
// 그 문파가 보는 나: 내 문파면 바탕 50, 아니면 세력 바탕. 세력 값과 문파 값을 더한다
function repSect(sid){const s=SECTS[sid];if(!s)return 0;const f=alFac(s.al),r=repD();
  return clamp((P.sect===sid?REP.base.own:repFacBase(f))+(r.fac[f]||0)+(r.sect[sid]||0),-REP.lim,REP.lim)}
// 바탕을 뺀 내 행적만의 값 (원한): 가입·임무·동원 거절에 쓴다. 마교가 정파도 받는 규칙(v102)은 바탕과 상관없이 그대로
const repOwn=sid=>{const s=SECTS[sid];if(!s)return 0;const r=repD();return (r.fac[alFac(s.al)]||0)+(r.sect[sid]||0)};
function repGrudge(sid){const s=SECTS[sid];return s&&repOwn(sid)<REP.joinMin?`${s.n}은(는) 당신이 저지른 일을 잊지 않았다 (우호도 ${repName(repSect(sid))})`:''}
const repDisc=sid=>repStageOf(repSect(sid))>=3?REP.disc:1;
// 무인 하나가 나를 보는 단계 (세력 무인이 아니면 중립)
function repStE(e){const f=e&&e.d&&e.d.fac;if(!f||!REPF.includes(f)||!P)return 2;return repStageOf(e.sect&&SECTS[e.sect]?repSect(e.sect):repFac(f))}
// mobFoeP(g_faction.js)가 부른다: 적대 단계면 적. 천하대전 중 적 진영과 결전장 아군은 우호도와 상관없다
function repFoe(e){const f=e.d.fac,pf=pfac();if(!REPF.includes(f))return facFoe(f,pf);if(e.warAlly)return false;
  if(facFoe(f,pf)&&typeof warFoe==='function'&&warFoe(f,pf)===true)return true;return repStE(e)===0}
// 값 바꾸기. 단계가 바뀌면 알린다
function repAdd(sid,fdv,sdv,f){if(!P)return;const r=repD(),s=SECTS[sid];f=f||(s&&alFac(s.al));if(!f||!REPF.includes(f))return;
  const f0=repStageOf(repFac(f)),s0=s?repStageOf(repSect(sid)):0,L=REP.lim;
  if(fdv)r.fac[f]=clamp(Math.round(((r.fac[f]||0)+fdv)*10)/10,-L,L);
  if(sdv&&s)r.sect[sid]=clamp(Math.round(((r.sect[sid]||0)+sdv)*10)/10,-L,L);
  const f1=repStageOf(repFac(f)),s1=s?repStageOf(repSect(sid)):0;
  if(f1!==f0)repNote(FACN[f],f0,f1);if(s&&s1!==s0&&(f1===f0||sdv))repNote(s.n,s0,s1)}
function repNote(n,a,b){const N=REP.names;log(`${n}의 태도가 ${N[a]}에서 ${N[b]}(으)로 바뀌었습니다.${b===0?' 보이는 대로 덤벼듭니다.':b===1?' 곁에 머물면 칼을 뽑습니다.':''}`,b<a?'dmg':'xp');
  if(b===0||a===0||b===3)showBanner(`${n} ${N[b]}`,b<a?'우호도가 떨어졌다':'우호도가 올랐다')}

// ---- 오르내리는 일 ----
// 같은 편을 쳤다 (g_faction.js facBetray)
function repHit(e){if(e.sect)repAdd(e.sect,REP.hit.fac,REP.hit.sect,e.d.fac);else repAdd(null,REP.hit.fac,0,e.d.fac)}
// 무인을 쓰러뜨렸다 (g_faction.js facKill). foe: 원래 적 세력. 그 세력의 적들은 고마워한다(세력 값 cap까지)
function repKill(e,foe){const f=e.d.fac;if(!REPF.includes(f))return;
  if(foe)repAdd(e.sect,0,e.d.elite?REP.killFoe.elite:REP.killFoe.sect,f);else repAdd(e.sect,REP.kill.fac,REP.kill.sect,f);
  const H=REP.killHelp,r=repD();
  for(const g of REPF)if(g!==f&&FAC_FOE[g]&&FAC_FOE[g].includes(f)&&(r.fac[g]||0)<H.cap)repAdd(null,Math.min(e.d.elite?H.elite:H.v,H.cap-(r.fac[g]||0)),0,g)}
hook('questDone',q=>{const Q=REP.quest;
  if(q.sect&&SECTS[q.sect]){const own=P.sect===q.sect;repAdd(q.sect,own?Q.ownFac:Q.outFac,own?Q.own:Q.out)}
  if(q.maeng&&ALLY[q.maeng])repAdd(null,Q.maeng,0,alFac(q.maeng));
  if(q.pyo){if(q.pyoSect&&SECTS[q.pyoSect])repAdd(q.pyoSect,0,Q.pyo);repAdd(null,Q.pyoGwan,0,'관')}});
hook('cvSaved',()=>{for(const[f,v]of Object.entries(REP.cvSave))repAdd(null,v,0,f)});
hook('cvRob',()=>{for(const[f,v]of Object.entries(REP.cvRob))repAdd(null,v,0,f)});
// 해마다 은원이 조금씩 옅어진다
hook('newYear',()=>{const r=repD(),D=REP.decay,f=v=>{const k=v<0?D.neg:D.pos,n=v*(1-k);return Math.abs(n)<1?0:Math.trunc(n*10)/10};
  for(const o of[r.fac,r.sect])for(const k in o){o[k]=f(o[k]);if(!o[k])delete o[k]}});
// 경계: 먼저 덤비지 않지만 곁에 오래 머물면 칼을 뽑는다
hook('mobTick',(e,dt)=>{if(!e.d.fac||e.angry||e.hp<=0||e.cv||e.warAlly||e.duel||!P||P.hp<=0)return;
  if(repStE(e)!==1){e.wary=0;return}const W=REP.wary,near=dist(e,P)<W.r&&!inTown(Math.floor(P.x),Math.floor(P.y));
  if(!near){e.wary=Math.max(0,(e.wary||0)-dt);return}
  if(!e.warySay||time-e.warySay>6){e.warySay=time;addText(e.x,e.y-.5,pick(W.say),REP.col[1])}
  e.wary=(e.wary||0)+dt;if(e.wary>W.t){e.angry=1;e.aggro=true;e.tgt=null;log(`경계하던 ${e.name}이(가) 칼을 뽑습니다.`,'dmg')}});
// 예물: 한 해에 문파마다 한 번, 은자를 바쳐 우호도를 올린다
function repGiftWhy(s){const G2=REP.gift,y=Math.floor(realAge());if(P.sect===s.id)return'내 문파에는 기부를 한다';if(repD().gift[s.id]===y)return'올해는 이미 예물을 바쳤다';if(P.silver<G2.silver)return`은자 ${G2.silver} 필요`;return''}
function repGift(sid){const s=SECTS[sid];if(!s||repGiftWhy(s))return;const G2=REP.gift;P.silver-=G2.silver;repD().gift[sid]=Math.floor(realAge());
  log(`${s.n}에 은자 ${G2.silver}의 예물을 바쳤습니다. 우호도 +${G2.sect+G2.fac}`,'xp');repAdd(sid,G2.fac,G2.sect)}
hook('sectAct',c=>{if(c.a!=='rgift')return;c.done=true;c.r=true;repGift(c.x)});

// ---- 창 ----
const repBar=v=>`<span class="repbar"><i style="left:${(v+REP.lim)/(2*REP.lim)*100}%;background:${repCol(v)}"></i></span>`;
const repTag=v=>`<b style="color:${repCol(v)}">${repName(v)}</b> <small class="dim num">${v>0?'+':''}${Math.round(v)}</small>`;
// 문파 창(본산·연락관)에 붙는 한 줄
function repSectHtml(s){const v=repSect(s.id),why=repGiftWhy(s),g=repGrudge(s.id);
  return `<div class="row2"><span class="note">${s.n}의 우호도 ${repTag(v)}${g?` · <b class="bad">${g}</b>`:''}</span>${P.sect===s.id?'':B('rgift:'+s.id,why||`예물 · 은자 ${REP.gift.silver}`,{d:!!why})}</div>`}
// 인물창 카드
function repHtml(){const r=repD(),mine=P.sect&&SECTS[P.sect]?P.sect:null;
  const fac=REPF.map(f=>{const v=repFac(f);return `<div class="it"><div>${FACN[f]}${f===pfac()?' <small class="good">내 세력</small>':''}<span>${repBar(v)}</span></div><div class="ib">${repTag(v)}</div></div>`}).join('');
  const ids=[...new Set([mine,...Object.keys(r.sect)])].filter(id=>id&&SECTS[id]).sort((a,b)=>repSect(b)-repSect(a));
  const sec=ids.map(id=>{const s=SECTS[id],v=repSect(id);return `<div class="it"><div>${typeof embImg==='function'?embImg(id,18)+' ':''}${s.n}${id===mine?' <small class="good">내 문파</small>':''}<span>${FACN[alFac(s.al)]} · ${repBar(v)}</span></div><div class="ib">${repTag(v)}</div></div>`}).join('');
  return `<div class="card"><h4>세력·문파 우호도 <small class="dim">이번 생에만 · 윤회하면 처음부터</small></h4><div class="list">${fac}</div>
    ${sec?`<h4 style="margin:6px 0 0">문파</h4><div class="list">${sec}</div>`:''}
    <p class="note">적대: 보이면 덤빈다 · 경계: 곁에 머물면 칼을 뽑는다 · 중립 · 우호: 비급 공적 10% 할인. 임무·예물·행렬 구출·그 세력의 적 처치로 오르고, 같은 편을 치거나 행렬을 털면 내린다. 해마다 조금씩 옅어진다.</p></div>`}

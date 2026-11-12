// ================= v255 구결: 비급과 전수의 구분 (동훈님 2026-11-12, 적용 계획 PR1) =================
// 고파 영상 12편 분석 → 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 B. 숫자는 data/kyul.json (GD.KYUL)
// "비급으로 동작은 익혀도, 힘을 어디로 보내는지는 사람이 전해야 한다" (타구봉법의 동작과 구결, 영호충과 자하신공)
// - 다른 문파의 무공(ARTS[id].sect가 있고 내 문파가 아님)은 구결이 없으면 숙련이 KYUL.cap에서 멈춘다.
//   숙련 덤은 극성 1.30배, cap 60에서 1.18배라 위력 손해는 최대 약 9% (경지 > 등급 > 숙련 위계 안). 극성의 돈오(오성 +1)는 막힌다.
// - 구결이 있는 것: 기본·공용(정·사 기본 계열 '정검0' 등, 문파가 쓰더라도)·기연·창안·은거기인 무공, 내 문파 무공, P.kyul에 적힌 무공.
//   내 문파 무공은 문파 제자로 지내는 동안 P.kyul에 적혀(숙련이 오를 때·해마다) 문파를 떠나도 남는다.
// - 구결 얻기: ① 그 문파 장문인에게 청한다 (우호도 KYUL.rep 단계 이상, 은자 KYUL.cost[무공 등급])
//   ② 잔당 '최후의 비전'을 펼치면 그 문파 무공 모두 (g_remnant.js libLearn)  ③ 전생의 요결 (PR2, g_past.js)
// - 옛 저장: 이미 cap을 넘긴 다른 문파 무공은 구결이 있는 것으로 친다 (afterLoad. 깎지 않는다)
// 테스트 tests/t171_kyul.js
const KY=GD.KYUL||{cap:60,cost:[150,300,600,1200,2400],rep:3};
function kyulD(){return P.kyul||(P.kyul={})}
// 구결이 있어야 cap을 넘는 무공인가 (구결을 이미 가졌으면 false)
// 정·사 기본 계열 무공(정검0 같은 '성향+병기+번호')은 문파가 쓰더라도 무관·시작에서 누구나 배우는 공용이라 구결이 필요 없다
const kyulOpen=id=>/^[정사].\d$/.test(id);
function kyulNeed(id){const a=ARTS[id];if(!a||!a.sect||a.base||a.melee||a.gy||a.made||a.rc||kyulOpen(id))return false;if(P.sect===a.sect)return false;return !kyulD()[id]}
function kyulCap(id){return kyulNeed(id)?KY.cap:100}
// 숙련을 바로 더하는 곳(세월 넘기기·수련기 보상)에서 쓴다: cap을 넘기지 않고, 이미 넘친 값은 깎지 않는다
function kyulAdd(id,p,v){return Math.max(p,Math.min(kyulCap(id),p+v))}
function kyulGive(id,why){const a=ARTS[id];if(!a||kyulD()[id])return false;kyulD()[id]=1;
  log(`[${a.n}]의 구결을 얻었습니다${why?` (${why})`:''}. 이제 숙련이 극성까지 오릅니다.`,'xp');return true}
function kyulSect(sid,why){let n=0;for(const id in ARTS)if(ARTS[id].sect===sid&&!kyulD()[id]){kyulD()[id]=1;if(A(id))n++}
  const s=SECTS[sid];if(s)log(`${s.n}의 구결을 모두 얻었습니다${why?` (${why})`:''}. ${n?`익힌 무공 ${n}가지의 숙련이 극성까지 오릅니다.`:''}`,'xp');return n}
// 막혔을 때 한 생에 무공마다 한 번 알린다
function kyulWarn(id){const w=P.kyulW||(P.kyulW={});if(w[id])return;w[id]=1;const a=ARTS[id],s=SECTS[a.sect];
  log(`[${a.n}] 숙련 ${KY.cap}: 동작은 알겠는데 힘을 어디로 보내는지 모르겠다. 구결이 없다. ${s?`${s.n} 장문인에게 청하거나 그 문파의 비전을 얻어야 한다.`:''}`,'info');
  if(typeof showBanner==='function')showBanner('구결이 없다',`${a.n} 숙련 ${KY.cap}`)}
// 무공 창의 꼬리표
function kyulTag(id){return kyulNeed(id)?` · <span class="bad" title="구결이 없어 숙련이 ${KY.cap}에서 멈춘다">구결 없음</span>`:''}
// 내 문파 무공은 제자로 지내는 동안 구결이 적힌다
function kyulOwn(){if(!P||!P.sect)return;for(const id of learnedArts()){const a=ARTS[id];if(a&&a.sect===P.sect)kyulD()[id]=1}}
hook('mastDone',c=>{const a=ARTS[c.id];if(a&&a.sect&&P.sect===a.sect)kyulD()[c.id]=1});
hook('newYear',kyulOwn);
// 옛 저장: 이미 cap을 넘긴 무공은 구결이 있는 것으로
hook('afterLoad',()=>{if(!P)return;kyulOwn();for(const id of learnedArts())if(A(id).p>KY.cap&&kyulNeed(id))kyulD()[id]=1});
// ---- 장문인에게 구결을 청한다 ----
const kyulCost=id=>KY.cost[Math.min(KY.cost.length-1,ARTS[id].grade||0)];
function kyulAskWhy(sid,id){const s=SECTS[sid];if(!s)return '없는 문파';if(P.sect===sid)return '';
  if(typeof sectPop==='function'&&sectPop(sid)<=0)return '멸문했다';
  if(typeof repSect==='function'&&repStageOf(repSect(sid))<KY.rep)return `우호도 '${REP.names[KY.rep]}' 이상이어야 한다`;
  if(P.silver<kyulCost(id))return `은자 ${kyulCost(id)} 필요`;return ''}
function kyulAsk(sid,id){if(!kyulNeed(id)||ARTS[id].sect!==sid||kyulAskWhy(sid,id))return;P.silver-=kyulCost(id);kyulGive(id,`${SECTS[sid].n} 장문인의 가르침`);
  if(typeof feat==='function')feat(`${SECTS[sid].n} 장문인에게 [${ARTS[id].n}]의 구결을 받았다`)}
hook('sectAct',c=>{if(c.a!=='kyul')return;c.done=true;c.r=true;kyulAsk(c.x,c.y)});
hook('hqDlg',c=>{const s=SECTS[c.n.hq];if(!s||P.sect===s.id||c.html==null)return;
  const L=learnedArts().filter(id=>ARTS[id].sect===s.id&&kyulNeed(id));if(!L.length)return;
  const rows=L.map(id=>{const a=ARTS[id],why=kyulAskWhy(s.id,id);
    return `<div class="it"><div>${a.n} ${typeof gradeTag==='function'?gradeTag(a.grade||0):''}<span>숙련 ${Math.floor(A(id).p)}/${KY.cap} · 은자 ${kyulCost(id)}${why?` · <span class="bad">${esc(why)}</span>`:''}</span></div>
      <div class="ib">${B(`kyul:${s.id}:${id}`,'구결을 청한다',{d:!!why,pri:!why})}</div></div>`}).join('');
  c.html+=`<div class="card"><h4>구결 <small class="dim">비급만으로는 닿지 않는 곳</small></h4><p class="note">"우리 문파의 무공을 어디서 주워 익혔군. 동작은 맞는데 힘이 엉뚱한 데로 샌다."</p><div class="list">${rows}</div></div>`});

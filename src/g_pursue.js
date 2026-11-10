// ================= 맵을 옮겨도 남는 몹: 뒤쫓기(follow)와 머물기(stay) (v243, 동훈님 2026-11-10) =================
// 동훈님: "최후의 결사대가 날 추격하던중 맵을 이동하면 사라져. 따라오거나 맵이동 후 다시 복귀시 유지되어야하는 몹을 설정할수 있을까?"
// 예전에는 맵을 옮기면(enterRegion) 그 맵의 몹을 모두 버렸다. 이제 몹마다 맵을 떠날 때의 행동을 정한다 (data/pursue.json PURSUE).
// - follow: 나를 쫓던(aggro·angry) 몹이 PURSUE.follow.range칸 안에 있으면 출입구를 따라 넘어온다. delay초 뒤 내가 들어온 출입구 곁에 나타난다.
//   멀리 떨어져 따돌렸거나, 가는 곳이 중립지대거나, 출입구가 아닌 길(흑혈옥 압송·입마곡 등 regionJump)로 옮기면 그 맵에 남는다(stay와 같다).
// - stay: 그 맵에 생명·자리·상태를 지닌 채 남는다. stay.keep초 안에 그 맵에 다시 오면 그대로 있다.
//   동훈님 (같은 날): "모든 맵을 유지하지 말고 현재 맵 기준으로 바로 전 맵과 기연 동굴만" → 기억하는 맵은 바로 전 맵 하나와 기연동굴(stay.all 접두어 gyc_)뿐.
//   기연동굴은 stay 표지가 없는 몹(수호자 등)까지 모두 그대로 남긴다 (쓰러뜨린 수호자는 다시 나오지 않는다).
//   저장 파일에는 넣지 않는다(불러오면 예전처럼 맵이 새로 채워진다).
// 정하는 차례: 몹의 e.pursue → 몹 데이터 d.pursue → PURSUE.kinds[몹 종류] → PURSUE.tags[표지]. 표지: last 최후의 결사대, hunt 추살조,
//   arrest 마교 연행조, remn 멸문 문파 잔당(최후의 전인 포함), boss 지역 두목. 아무것도 없으면 예전처럼 사라진다.
// 테스트 tests/t160_pursue.js
const PURSUE=GD.PURSUE||{tags:{},kinds:{},follow:{range:14,max:8,delay:1.2,spread:2.5},stay:{keep:900,all:['gyc_']}};
const pursueAllMap=id=>(PURSUE.stay.all||[]).some(p=>String(id||'').startsWith(p));   // 모든 몹을 남기는 맵 (기연동굴)
const pursueTag=e=>e.last?'last':e.hunt?'hunt':e.arrest?'arrest':e.remn?'remn':e.d&&e.d.boss?'boss':null;
function pursueMode(e){if(!e)return null;if(e.pursue)return e.pursue;if(e.d&&e.d.pursue)return e.d.pursue;
  const k=PURSUE.kinds&&PURSUE.kinds[e.kind];if(k)return k;const t=pursueTag(e);return t&&PURSUE.tags[t]||null}
let PURSUE_GATE=null;            // 출입구로 옮기는 중이면 그 출입구 (travel 훅이 적고 enterRegion이 쓴다)
const PURSUE_KEEP={};            // 맵 id → {at, list:[몹]} 남겨 둔 몹
let PURSUE_FROM=null;            // 방금 떠난 맵
let PURSUE_Q=[];                 // 뒤따라 넘어오는 중인 몹 {e, reg, from, at}
const pursueAlive=e=>e&&e.hp>0&&!e.dead;
// 출입구 g로 갈 때 e가 따라오나
function pursueFollows(e,g){if(pursueMode(e)!=='follow'||!pursueAlive(e)||!P)return false;const to=g&&REGIONS[g.to];if(to&&to.neutral)return false;
  if(e.duel||e.d&&e.d.villager)return false;return !!(e.aggro||e.angry||e.tgt===P)&&dist(e,P)<=PURSUE.follow.range}
// 다른 맵에 남겨 둔 몹과 넘어오는 중인 몹까지 (같은 무리가 다 쓰러졌는지 셀 때)
function pursueAll(){const a=PURSUE_Q.map(q=>q.e);for(const k in PURSUE_KEEP)a.push(...PURSUE_KEEP[k].list);return a.filter(pursueAlive)}
hook('travel',c=>{PURSUE_GATE=c.g});
// 남겨 둔 몹이 다시 나와도 되나 (잔당은 숨은 곳이 바뀌었으면 거기 없다, 결사대·잔당은 그 문파가 아직 있어야)
function pursueValid(e,reg){if(!pursueAlive(e))return false;
  if(e.remn){const r=G.remn&&G.remn[e.remn];if(!r||r.reg!==reg||!(r.left>0))return false}
  if(e.last&&G.gone&&G.gone[e.last])return false;return true}
hook('leaveRegion',c=>{const g=PURSUE_GATE;PURSUE_GATE=null;if(!P||!c.from)return;
  const now=time,fol=[],keep=[];
  // 넘어오는 중이던 몹: 출입구로 다시 옮기면 또 따라오고, 아니면 버린다
  for(const q of PURSUE_Q)if(g&&pursueAlive(q.e)&&!(REGIONS[g.to]&&REGIONS[g.to].neutral))fol.push(q.e);PURSUE_Q=[];
  for(const e of mobs){if(!pursueAlive(e)||e.ally)continue;const m=pursueMode(e);if(!m)continue;
    if(m==='follow'&&g&&fol.length<PURSUE.follow.max&&pursueFollows(e,g))fol.push(e);else keep.push(e)}
  if(pursueAllMap(c.from))for(const e of mobs)if(pursueAlive(e)&&!e.ally&&!fol.includes(e)&&!keep.includes(e)&&!(e.d&&e.d.villager))keep.push(e);
  PURSUE_FROM=c.from;
  if(keep.length||pursueAllMap(c.from)){for(const e of keep){e.kept=1;e.path=null;e.goal=null;e.tgt=null}PURSUE_KEEP[c.from]={at:now,list:keep}}
  else delete PURSUE_KEEP[c.from];
  for(const e of fol){e.kept=0;PURSUE_Q.push({e,from:c.from,reg:g.to,at:now+PURSUE.follow.delay})}
  if(fol.length)c.pursued=fol.length});
hook('enteredRegion',id=>{const k=PURSUE_KEEP[id];
  // 바로 전 맵(방금 떠난 맵)과 기연동굴만 기억한다 (지금 맵 것은 아래에서 꺼낸다)
  for(const q in PURSUE_KEEP)if(q!==id&&q!==PURSUE_FROM&&!pursueAllMap(q))delete PURSUE_KEEP[q];
  for(const q of PURSUE_Q)q.reg=id;   // 출입구 훅(g_split)이 맵 id를 바꿨을 수 있다
  if(!k)return;delete PURSUE_KEEP[id];if(time-k.at>PURSUE.stay.keep)return;
  // 기연동굴은 맵을 열며 새로 세운 몹(수호자)을 버리고 남겨 둔 몹으로 바꾼다
  if(pursueAllMap(id))mobs=mobs.filter(m=>m.ally);
  for(const e of k.list)if(pursueValid(e,id)&&!mobs.includes(e)){e.kept=1;e.path=null;e.goal=null;e.tgt=null;mobs.push(e)}});
// 뒤쫓는 몹이 내가 들어온 출입구(지난 맵으로 가는 문) 곁에 나타난다
function pursueSpot(from){let g0=null,bd=1e9;for(const g of(REGION()&&REGION().gates)||[]){if(g.to!==from&&!String(g.to).startsWith(from))continue;const d=Math.hypot(g.x-P.x,g.y-P.y);if(d<bd){bd=d;g0=g}}
  const c=g0&&bd<8?g0:P,s=PURSUE.follow.spread;
  for(let t=0;t<40;t++){const a=Math.random()*6.28,d=1+Math.random()*s,x=c.x+Math.cos(a)*d,y=c.y+Math.sin(a)*d;if(x>1&&y>1&&x<N-1&&y<NH-1&&walkAt(x,y)&&Math.hypot(x-P.x,y-P.y)>1)return{x,y}}
  return{x:P.x,y:P.y}}
hook('tick',()=>{if(!PURSUE_Q.length||!P||P.traveling)return;const due=PURSUE_Q.filter(q=>q.at<=time&&q.reg===REG);if(!due.length)return;
  PURSUE_Q=PURSUE_Q.filter(q=>!due.includes(q));let n=0,lead=null;
  for(const q of due){const e=q.e;if(!pursueAlive(e)||mobs.includes(e))continue;const p=pursueSpot(q.from);
    e.x=p.x;e.y=p.y;e.home={x:p.x,y:p.y};e.post&&(e.post={x:p.x,y:p.y});e.path=null;e.goal=null;e.tgt=null;e.aggro=true;e.angry=e.angry||1;e.flee=0;e.kept=0;e.lost=0;e.giveUp=0;
    e.z=0;mobs.push(e);fx.push({t:'puff',x:p.x,y:p.y,life:.5});n++;lead=lead||e}
  if(n){addText(lead.x,lead.y-1,'뒤쫓아 왔다!','#ff7a5a');log(`${lead.name||lead.kind}${n>1?` 등 ${n}명`:''}이(가) 출입구를 지나 뒤쫓아 왔다!`,'dmg')}});
// 처음부터 다시·윤회·불러오기로 판이 바뀌면 남겨 둔 몹을 잊는다
function pursueClear(){PURSUE_Q=[];PURSUE_GATE=null;for(const k in PURSUE_KEEP)delete PURSUE_KEEP[k]}
hook('gLoaded',pursueClear);hook('died',pursueClear);

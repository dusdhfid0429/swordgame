// ================= 어그로 (v252c, 사용자 2026-11-12) =================
// "어그로의 개념을 넣어서 주인을 공격하다가도 맹수가 준 데미지가 더 많아지는 경우 몬스터가 (맹수를) 공격하게, 도발류 스킬도 이 개념으로"
// - 적(몹)마다 e.thr(Map: 친 쪽 → 쌓인 값). 주인(P)·동료(allies)가 준 피해만큼 쌓인다 (core damage()의 dmgOut 훅, 문파 규칙으로 나눈 뒤 값).
// - re초마다 주인과 동료 중 가장 많이 쌓인 쪽을 노린다. 지금 노리는 쪽보다 margin배 넘어야 갈아탄다. 값은 초당 decay씩 잊는다.
// - 적 세력끼리 싸우는 중(노리는 상대가 주인·동료가 아님)이면 건드리지 않는다.
// - 도발: aggroTaunt(적, 누구, 배) = 그 적에게 가장 많이 쌓인 값의 배만큼으로 끌어올린다 (곰 후려치기 등).
const AGGRO=GD.AGGRO;
const aggroWho=f=>f===P||(!!f&&!f.d&&!f.kind)?P:f&&allies.includes(f)?f:null;
function aggroAdd(e,who,v){if(!e||!e.isMob||!who||!(v>0))return;const t=e.thr||(e.thr=new Map());t.set(who,(t.get(who)||0)+v)}
function aggroTop(e){let top=0;if(e&&e.thr)for(const v of e.thr.values())top=Math.max(top,v);return top}
function aggroTaunt(e,who,mul){if(!e||!e.isMob)return;const t=e.thr||(e.thr=new Map());t.set(who,Math.max(t.get(who)||0,aggroTop(e)*mul+1));e.aggroRe=0}
hook('dmgOut',c=>{if(P&&c.e&&c.e.isMob&&!c.e.duel){const w=aggroWho(c.from);aggroAdd(c.e,w,c.d*(w&&w!==P&&w.thr||1))}});   // 동료는 thr배 (맹수 종마다 data/yasu.json)
hook('mobAct',c=>{const e=c.e;if(!e.aggro||!e.thr||!P||e.duel||G.duel)return;
  const cur=e.tgt&&e.tgt.hp>0?e.tgt:P;if(cur!==P&&!allies.includes(cur))return;   // 적 세력끼리 싸우는 중
  e.aggroRe=(e.aggroRe||0)-c.dt;if(e.aggroRe>0)return;e.aggroRe=AGGRO.re;
  const t=e.thr,k=1-AGGRO.decay*AGGRO.re;for(const[w,v]of t){if(w!==P&&(!(w.hp>0)||!allies.includes(w)))t.delete(w);else t.set(w,v*k)}
  const val=w=>t.get(w)||0;let best=cur,bv=val(cur);
  for(const[w,v]of t)if(v>bv*AGGRO.margin&&(w===P?P.hp>0:w!==P.ride&&w.mode!=='wait')&&dist(e,w)<AGGRO.range){best=w;bv=v}
  if(best!==cur)e.tgt=best===P?null:best});

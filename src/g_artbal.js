// ================= 무공 위력 위계 (v249, 사용자 2026-11-11 "경지 > 무공 등급 > 숙련") =================
// 같은 조건에서 잰 무공별 초당 피해가 등급 목표(ARTBAL.grade)에 모이도록 무공마다 보정값 ARTK[id]를 곱한다.
// 등급 구간은 서로 겹치지 않는다: 윗등급 무공은 아랫등급 어느 무공보다 세다. 숙련 덤은 g_core.js mkX (ARTBAL.mast).
// 보정값은 경지마다 따로다 (내공량·방어 깎임이 달라 한 경지에서 맞춘 값이 다른 경지에서는 어긋난다).
// 손으로 쓰지 않는다: tools/art_budget.sh 가 tests/sim_arts.js 로 재서 data/artbal.json 을 다시 쓴다.
const ARTBAL=GD.ARTBAL,ARTK=GD.ARTK;let ARTK_OFF=false;   // ARTK_OFF: 잴 때만 켠다
const artK=id=>{if(ARTK_OFF)return 1;const r=Math.min(realmIdx(),6),k=ARTK[id];if(k)return k[r]||1;const a=ARTS[id];if(!a||a.base)return 1;const f=ARTBAL.fb&&ARTBAL.fb[r]&&ARTBAL.fb[r][a.cls];return f&&f[Math.min(a.grade||0,f.length-1)]||1};   // 창안 무공 등 잰 적 없는 무공은 같은 병기·등급의 가운데 값
hook('hit',c=>{if(c.from===P&&c.X&&!c.X.bare)c.m*=artK(P.cur)});   // 그 무공을 든 동안의 모든 공격 (초식 사이 평타·던지기 포함): 무공마다 평타 비중이 달라 초식만 고치면 덜 맞는다

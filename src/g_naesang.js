// ================= v260 싸움의 내상과 운기요상 (동훈님 2026-11-12, 적용 계획 PR5) =================
// 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 D. 고파 「강호는 어떻게 돌아가는가」: 외상과 내상, 운기요상과 그동안 지켜 주는 호법,
// 내상을 입은 고수는 이류 한둘에게도 위태롭다. 숫자는 data/naesang.json (GD.NAESANG)
// - 주화입마 후유증(P.inj·P.injS, g_realm.js)을 그대로 쓴다: 가벼운 내상 = 공격력·운기조식 회복 -15% (injMul). P.injK='fight'로 싸움의 내상을 구별한다.
// - 걸리는 때 (평상 사냥에서는 생기지 않는다): ① 우두머리 수(돌진·회전·연환, g_fight.js)에 정통으로 맞으면 NAESANG.bm 확률
//   ② 정예·우두머리에게 맞아 생명이 NAESANG.low 아래로 떨어지면 반드시 (비무는 빼고). 이미 상해 있으면 더 걸리지 않는다
// - 길이 NAESANG.dur 달(하루 = 한 달 = DAY_SEC초). 운기조식 중이면 NAESANG.medit배, 곁에 호법(내 문파 안·무관·동료·고용 호법)이 있으면 NAESANG.heal배 빨리 낫는다.
//   객잔·집에서 쉬면 싸움의 내상은 낫는다 (주화입마 후유증은 그대로)
// 테스트 tests/t175_naesang.js
const NSG=GD.NAESANG||{bm:.5,low:.2,dur:1,medit:2,heal:5};
const nsBig=src=>!!(src&&(src.rank>=2||src.d&&(src.d.boss||src.d.elite)));
function nsHit(why){if(!P||P.inj>0||G.duel)return false;P.inj=DAY_SEC*NSG.dur;P.injS=1;P.injK='fight';
  log(`${why}: 내상을 입었다. 공격력과 운기조식 회복 -15%. 운기요상하면(곁에 호법이 있으면 더) 빨리 낫고, 객잔·집에서 쉬어도 낫는다.`,'dmg');
  if(typeof showBanner==='function')showBanner('내상',why);return true}
hook('hurtDone',c=>{if(!P||P.hp<=0||P.inj>0||G.duel||!c.src)return;
  if(P._bm&&c.hp0>P.hp&&Math.random()<NSG.bm){nsHit('우두머리의 일격');return}
  if(nsBig(c.src)&&c.hp0>=P.maxHp*NSG.low&&P.hp<P.maxHp*NSG.low)nsHit('깊은 일격')});
// 운기요상: 싸움의 내상만 더 빨리 낫는다 (g_realm.js trainTick이 기본 1배로 줄인다)
hook('tick',dt=>{if(!P||!playing||paused||!(P.inj>0)||P.injK!=='fight'||!P.medit)return;const m=(typeof hobeop==='function'&&hobeop())?NSG.heal:NSG.medit;
  P.inj=Math.max(0,P.inj-dt*(m-1));if(P.inj===0){P.injS=0;P.injK=null;log('운기요상으로 내상을 다스렸다.','sys')}});
// 쉬면 낫는다
function nsRest(){if(P&&P.injK==='fight'&&P.inj>0){P.inj=0;P.injS=0;P.injK=null;log('푹 쉬어 내상이 나았다.','sys')}}

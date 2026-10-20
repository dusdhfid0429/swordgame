// ================= 난이도 (2026-10-15 v110): 완전 새로 시작할 때 다섯 단계 중 고른다 =================
// 사용자 요청: "완전 새로 시작할 때 난이도 5단계로 구분해서 시작하게 해 주고 난이도별로 밸런스를 잡아 줘". 표 data/difficulty.json DIFF, 계수는 tests/sim_balance.js로 맞춘다.
// - G.diff(0~4)는 저장 칸(G)에 남아 윤회해도 그대로다. '처음부터 새로'(G0) 또는 빈 칸의 첫 인생에서만 탄생 화면에 난이도 카드가 뜬다. 옛 저장은 보통(1).
// - 적용: 사람 몹의 경지 수치(scaleMob 뒤 mobScaled 훅)와 짐승(mobMade)에 생명·공격 배율, 플레이어가 받는 피해(hurt), 활력 획득(gainVit), 마성 증가(maraAdd), 추살조·연행조 인원(squad).
const DIFF=GD.DIFF||[{id:'normal',n:'보통',mobHp:1,mobAtk:1,taken:1,vit:1,mara:1,squad:1}];
const diffIdx=()=>{const i=G&&G.diff;return i==null||!DIFF[i]?Math.min(1,DIFF.length-1):i};
const diffOf=()=>DIFF[diffIdx()];
const diffMul=k=>{const v=diffOf()[k];return v==null?1:v};
hook('mobScaled',e=>{if(!e.d||e.d.villager||e.d.passive)return;e.maxHp=Math.max(1,Math.round(e.maxHp*diffMul('mobHp')));e.hp=e.maxHp;e.atk=Math.max(1,Math.round(e.atk*diffMul('mobAtk')))});
hook('mobMade',e=>{const d=e.d;if(!d||!d.beast||e.diffed)return;e.diffed=1;e.maxHp=Math.max(1,Math.round(e.maxHp*diffMul('mobHp')));e.hp=e.maxHp;e.atk=Math.max(1,Math.round(e.atk*diffMul('mobAtk')))});
hook('hurt',c=>{if(c.src&&c.src.d)c.dm*=diffMul('taken')});
const diffVit=v=>v>0?Math.round(v*diffMul('vit')):v;   // v136 (사용자): 활력은 정수만 (배율을 곱하면 소수점이 나왔다)
const diffSquad=n=>Math.max(1,Math.round(n*diffMul('squad')));
function diffHtml(){const d=diffOf();return `<div class="card"><h4>난이도 <small class="dim">완전 새로 시작할 때 정한다</small></h4><p><b class="gold">${d.n}</b> · ${d.d}</p><p class="note">적 생명 ×${d.mobHp} · 적 공격 ×${d.mobAtk} · 받는 피해 ×${d.taken} · 활력 ×${d.vit} · 윤회 보상 ${Math.round((d.carry??.3)*100)}% · 마성 ×${d.mara} · 추살조 ×${d.squad}</p></div>`}
function diffPickHtml(){if(G.lives)return '';const i=diffIdx();
  return `<div class="card"><h4>난이도 <small class="dim">이 저장 칸의 모든 생에 걸친다 · 처음부터 새로 시작할 때만 고른다</small></h4>
    <div class="choice">${DIFF.map((d,k)=>`<button type="button" class="opt" data-s="diff:${k}" aria-pressed="${k===i}"><b>${d.n}</b><span>${d.d}</span><span class="dim">적 생명 ×${d.mobHp} · 공격 ×${d.mobAtk} · 받는 피해 ×${d.taken}</span></button>`).join('')}</div></div>`}

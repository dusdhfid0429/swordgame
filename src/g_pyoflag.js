// ================= v261 표행의 깃발과 암표 (동훈님 2026-11-12, 적용 계획 PR6) =================
// 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 F. 고파 「강호는 어떻게 돌아가는가」: 명성이 통하는 길에서는 깃발을 높이 걸고 이름을 외치고,
// 교섭도 힘겨루기도 어려운 길에서는 깃발을 거두고 조용히 간다(암표). 숫자는 data/pyoflag.json (GD.PYOFLAG). 표행·습격 틀은 g_caravan.js 그대로
// - 표행에 따라나설 때 고른다. 깃발(q.flag='flag'): 산적 습격은 PYOFLAG.flag.bandit 확률로 길을 비키지만 세력 무인이 칠 확률 ×PYOFLAG.flag.fac, 무사히 닿으면 명성 +PYOFLAG.flag.fame
//   암표(q.flag='hid'): 모든 습격이 PYOFLAG.hid.skip 확률로 오지 않지만 품삯 ×PYOFLAG.hid.pay
// 테스트 tests/t176_pyoflag.js
const PF=GD.PYOFLAG||{flag:{bandit:.5,fac:1.5,fame:3},hid:{skip:.3,pay:.8}};
const pyoQ=cv=>cv&&cv.q&&cv.q.hired?cv.q:null;
function pyoFacMul(cv){const q=pyoQ(cv);return q&&q.flag==='flag'?PF.flag.fac:1}
// 습격을 건너뛰나: 암표는 모두, 깃발은 산적만 (세력은 판단 뒤 g_caravan.js cvAmbush에서)
function pyoHidSkip(cv){const q=pyoQ(cv);if(!q||q.flag!=='hid'||Math.random()>=PF.hid.skip)return false;log(`${cv.name}: 깃발을 거두고 조용히 지나 습격을 피했다.`,'info');return true}
function pyoBanditFlee(cv){const q=pyoQ(cv);if(!q||q.flag!=='flag'||Math.random()>=PF.flag.bandit)return false;log(`${cv.name}: 높이 건 표국 깃발을 보고 산적들이 길을 비켰다.`,'info');return true}
hook('sectAct',c=>{if(c.a==='pyojoin'){const q=P.quests[P.quests.length-1];if(q&&q.kind==='escort'&&q.hired&&!q.flag)q.flag='flag';return}   // g_caravan.js의 참여 처리 뒤 (훅 순서)
  if(c.a!=='pyohid')return;c.done=true;c.r=true;const n0=P.quests.length;sectAct('pyojoin',c.x,c.y);const q=P.quests.length>n0?P.quests[P.quests.length-1]:null;
  if(q&&q.kind==='escort'&&q.hired){q.flag='hid';q.silver=Math.round(q.silver*PF.hid.pay);log('깃발을 거두고 암표로 간다. 습격은 덜 만나지만 품삯이 준다.','info')}});

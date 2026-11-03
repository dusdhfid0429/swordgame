// ================= 고정 NPC 방어 (v237c, 사용자 2026-11-03) =================
// "고정 npc들도 문파에 침공이 일어나거나 할 경우 활성 npc로 싸워야 해. 문주와 동일하게 변경해줘"
// - 대상: 문주(n.hq)와 문파 고정 NPC(npcRole: 장로·집사·당주·제자·사부·교두, g_vault.js). 마부·상인 같은 문파 밖 사람은 그대로
// - 문주와 같은 세 경우에 싸우는 무인이 된다
//   ① 강제공격으로 친다 (g_vault npcOut, 예전 그대로)
//   ② 문파가 쇠퇴했고 플레이어가 적 세력이면 맵에 들어설 때 몸소 나선다 (문주는 g_pop masterState, 나머지는 여기)
//   ③ 침입: 그 문파의 적 세력 무인이나 덤벼드는 짐승·산적이 DEF.r칸 안에 오거나, 문파 무인이 플레이어에게 덤비고 있으면 나선다
// - ③으로 나선 무인은 침입자가 없어지고 DEF.calm초 지나면 제자리 NPC로 돌아가고, 생명이 DEF.retreat 아래로 떨어지면 물러난다(무인끼리 싸우다 문주가 죽는 일은 없다)
const ND=GD.VAULT.DEF;
const ndSid=n=>n.hq||(typeof npcSect==='function'?npcSect(n):null);
const ndFixed=n=>!!n&&!n.board&&(!!n.hq||!!npcRole(n));
// 이 문파(s)를 치러 온 자인가
function ndFoe(m,s){if(!m||m.hp<=0||m.npcDef||m.d.villager||m.d.passive||m.acadDummy)return false;const f=alFac(s.al);
  if(m.d.fac)return m.sect!==s.id&&facFoe(m.d.fac,f);
  return !!(m.d.hostile&&m.aggro)}
function ndNear(o,s,r){let b=null,bd=r;for(const m of mobs){if(!ndFoe(m,s))continue;const d=dist(m,o);if(d<bd){bd=d;b=m}}return b}
// 문파 무인이 플레이어에게 덤비고 있나 (플레이어가 문파를 친다)
const ndPlayerFoe=(o,s,r)=>P.hp>0&&dist(o,P)<r&&mobs.some(m=>m.hp>0&&!m.npcKey&&!m.master&&m.sect===s.id&&m.d.fac&&m.aggro&&!m.tgt&&mobFoeP(m)&&dist(m,P)<r+4);
// 고정 NPC 하나를 싸우는 무인으로
function ndOut(n,why,foeP){const sid=ndSid(n),s=SECTS[sid];if(!s)return null;let e;
  if(n.hq){if(G.mdead[s.id]||mobs.some(m=>m.master===s.id&&m.hp>0))return null;const R=REGION();if(!R._npcsM)R._npcsM=R.npcs;e=masterBoss(R,n,s,why)}
  else{e=npcFight(n,true);if(e&&why)log(why,'info')}
  if(!e)return null;e.npcRef=n;e.ndReg=REG;if(foeP){e.angry=1;e.aggro=true;e.tgt=null}else e.npcDef=1;return e}
// 제자리로: 무인을 치우고 NPC를 되살린다
function ndBack(e,why){mobs=mobs.filter(m=>m!==e);const n=e.npcRef,R=REGION();if(why)log(why,'info');
  if(e.master){if(typeof masterCheck==='function')masterCheck(REG);if(!(R.npcs||[]).includes(n)&&R._npcsM&&R._npcsM.includes(n))R.npcs=R._npcsM}
  else if(n){if(R._npcsO)R._npcsO=R._npcsO.filter(x=>x!==n);if(!R.npcs.includes(n))R.npcs.push(n)}
  if(typeof SF_KEY!=='undefined')SF_KEY='';refreshNPCF()}
let ND_T=0,ND_LOG=0;
hook('tick',dt=>{if(!P||!playing||G.duel||!REG)return;ND_T-=dt;if(ND_T>0)return;ND_T=ND.scan;const R=REGION();if(!R||R.dead||R.ruin)return;
  // 나서기
  for(const n of[...(R.npcs||[])]){if(!ndFixed(n))continue;const s=SECTS[ndSid(n)];if(!s||!(sectPop(s.id)>0))continue;
    const foe=ndNear(n,s,ND.r),pf=!foe&&ndPlayerFoe(n,s,ND.r);if(!foe&&!pf)continue;
    const loud=time-ND_LOG>6;const e=ndOut(n,loud?`${n.n}이(가) ${pf?'칼을 뽑아 당신을 막아선다':'침입자를 막으러 나섰다'}.`:'',pf);if(!e)continue;if(loud)ND_LOG=time;
    if(foe){e.tgt=foe;e.aggro=true}}
  // 돌아가기·물러나기 (침입을 막으러 나선 무인만)
  for(const e of[...mobs]){if(!e.npcDef||e.hp<=0||e.ndReg!==REG)continue;const s=SECTS[e.master||(e.npcKey||'').split('/')[0]];if(!s)continue;
    if(e.hp<e.maxHp*ND.retreat){ndBack(e,`${e.name}이(가) 크게 다쳐 물러났다.`);continue}
    const foe=ndNear(e,s,ND.chase);if(foe){e.calm=0;if(!e.tgt||e.tgt.hp<=0){e.tgt=foe;e.aggro=true}}
    else if((e.calm=(e.calm||0)+ND.scan)>=ND.calm-.01)ndBack(e)}});
// ② 쇠퇴한 적 문파: 문주처럼 나머지 고정 NPC도 몸소 나선다 (npcSync 뒤)
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||R.dead||R.ruin||!P)return;let k=0;
  for(const n of[...(R.npcs||[])]){if(n.hq||!ndFixed(n))continue;const s=SECTS[ndSid(n)];if(!s||!(sectPop(s.id)>0)||!sectWeak(s)||!facFoe(alFac(s.al),pfac()))continue;if(ndOut(n,'',true))k++}
  if(k)log(`쇠퇴한 문파의 고수 ${k}명이 몸소 칼을 잡고 섰다.`,'info')});
// 다른 맵에서 남은 무인 정보는 맵을 옮기면 사라진다 (enterRegion 이 mobs 를 비운다). 저장을 불러오면 NPC 로 돌아와 있다 (npcSync)

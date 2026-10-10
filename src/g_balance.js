// ================= 경지 밸런스: 플레이어 대 NPC·몹 =================
// 사용자 요청(2026-10-09): 경지에 따른 플레이어와 NPC 사이의 밸런스. 제안서 /mnt/project-files/docs/경지_밸런스_제안.md 1~3번.
// 1) 모든 사람 몹·NPC에 경지를 붙인다 (문파 무인은 직위가 곧 경지)
// 2) 경지 표준 능력치(그 경지에 갓 오른 플레이어의 맨몸 수치)에 졸개·정예·보스 배율을 곱해 능력치를 정한다
// 3) 경지 한 단계 차이마다 주는 피해 ±25%, 명중·회피 ±5% (최대 세 단계). 플레이어와 NPC, NPC끼리 모두
// 설계: docs/경지_설계.md 3부

// 경지 표준: 공격력·생명·현묘도 (tests로 뽑은 정파 검객의 문턱 수치)
const STD=GD.STD;
// 졸개는 약하게, 정예는 같은 경지 한 사람 몫, 보스는 준비해야 이긴다
const TIER=GD.TIER;
// 사람 몹의 경지 (짐승은 경지만 붙이고 수치는 그대로)
const MOB_REALM=GD.MOB_REALM;
// 혈교무인·강시는 졸개가 아니라 정예 몫
const MOB_TIER=GD.MOB_TIER;
function scaleMob(e){const d=e.d;if(!d||d.beast||d.villager||d.passive||e.realm==null)return e;
  const r=clamp(e.realm,0,6),[a,h,m]=STD[r],t=TIER[d.boss?'b':d.elite||MOB_TIER[e.kind]==='e'?'e':'n'],g=GD.GROW||{h:0,a:0};
  // 경지가 오를수록 사람은 초식·연속기·필살기로 표준보다 훨씬 세지므로, 몹은 경지마다 체력·공격을 더 얹는다
  e.maxHp=e.hp=Math.round(h*t.h*(1+g.h*r));e.atk=Math.round(a*t.a*(1+g.a*r));e.hm=d.hm!=null&&d.hm<5?d.hm:Math.round(m*t.m);   // 강시처럼 굼뜬 몹은 그대로
  e.def=Math.max(d.def||0,Math.round((1+r*1.5)*t.d));return e}
hook('mobMade',(e,kind,extra)=>{if(MOB_REALM[kind]!=null&&!extra){e.realm=MOB_REALM[kind];scaleMob(e)}});
// 문파 무인: 직위(0 속가·졸개·교도, 1 정식·정예, 2 일대·조장·향주, 3 호법·당주)가 경지
hook('facMade',e=>{e.realm=e.rank||0;scaleMob(e)});

// 경지 차이: 한 단계마다 ±25% 피해, ±5% 명중 (세 단계까지)
const rDiff=(a,b)=>clamp(a-b,-3,3);
const rMul=dd=>1+.25*dd;
hook('hit',c=>{const dd=rDiff(realmIdx(),mobRealm(c.e));c.hm-=5.5*dd;c.m*=rMul(dd)});
hook('hurt',c=>{if(!c.src.d)return;const dd=rDiff(mobRealm(c.src),realmIdx());c.hm+=10*dd;c.dm*=rMul(dd)});
hook('mobHurt',c=>{if(c.src&&c.src.d&&c.t.d)c.dm*=rMul(rDiff(mobRealm(c.src),mobRealm(c.t)))});

// ---- 4) 지역 위험도: 지역마다 나오는 경지의 바닥(lo)과 천장(hi) ----
// 졸개·정예의 경지는 min(hi, 원래 경지 + lo). 보스는 제 경지 그대로. 짐승은 lo보다 낮으면 lo로 끌어올려 수치도 표준 비율만큼 키운다.
const PV_DANGER=GD.PV_DANGER;
function danger(id=REG){const R=REGIONS[id];if(!R||id==='gaebong')return[0,0];
  if(id==='sungsan')return[0,1];
  if(/천마동|달마동/.test(R.name||''))return[5,5];
  if(id.startsWith('hq_cheonma'))return[3,4];
  if(id.endsWith('_back'))return[2,3];
  const k=R.prov||(id.startsWith('pv_')?id.slice(3).split('@')[0]:null),b=PV_DANGER[k]||[0,1];
  if(R.lm&&R.lm.t==='m')return[Math.min(5,b[0]+1),Math.min(5,b[1]+1)];   // 명산은 한 단계 위
  return b}
function regionRealm(e,base){const[lo,hi]=danger();return Math.max(base,Math.min(hi,base+lo))}
function liftBeast(e){const lo=danger()[0],r0=e.realm??0;e.realm=r0;if(lo<=r0)return e;
  const fh=STD[lo][1]/STD[r0][1],fa=STD[lo][0]/STD[r0][0];e.maxHp=e.hp=Math.round(e.maxHp*fh);e.atk=Math.round(e.atk*fa);e.realm=lo;return e}
hook('mobMade',(e,kind,extra)=>{if(extra||!e.d||e.d.boss||e.d.villager||e.d.passive||e.realm==null||e.d.fac)return;
  if(e.d.beast)return liftBeast(e);const r=regionRealm(e,e.realm);if(r!==e.realm){e.realm=r;scaleMob(e)}});
hook('facMade',e=>{const r=regionRealm(e,e.realm);
  if(r!==e.realm){e.realm=r;if(e.sect){e.rank=Math.min(r,4);e.name=`${SECTS[e.sect].n} ${rankName(e.sect,e.rank)}`}  /* 초절정 이상은 장로 */scaleMob(e)}});

// ---- 5) 비무 사다리: 경지마다 한 명, 일곱 명 ----
// 비무 상대는 같은 경지 한 사람 몫보다 질기다(생명 ×2.2, 공격력 ×0.6). 이기면 다음 경지 고수가 도전장을 보낸다.
/* DUELISTS에 덧붙이던 것은 data/mobs.json 으로 옮김 */
DUELISTS.forEach((o,i)=>{const[a,h,m]=STD[i];Object.assign(o,{realm:i,hp:Math.round(h*2.2),atk:Math.round(a*.6),hm:m,def:2+Math.round(i*1.5)})});
hook('duelStart',(o,e)=>{e.realm=o.realm});
hook('duelEnd',({win,was})=>{const nx=DUELISTS[P.duel];
  if(win&&P.duel>was&&nx)log(`${nx.n}(${RANKS[nx.realm]})이(가) 비무대로 도전장을 보내왔습니다.`,'info')});

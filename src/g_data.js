// ================= 신영웅문 systems: data =================
const RANKS=GD.RANKS;
const REALM_QI=GD.REALM_QI;        // 경지 by 내공 (갑자) total
const SIJIN=GD.SIJIN;
const YEAR_SEC=90;                                    // one year of age per 90 s of play
const SEASONS=GD.SEASONS;
// 정파/사파: base 내공 and the opposite 내공 수련 curves (official 10/11 per session; 첫 수련 300→30 scaled, +3 / 3, +4)
const SIDES=GD.SIDES;
const qiCost=(side,n)=>SIDES[side].first+SIDES[side].step*n;
// 근골: 근력·지구력·민첩력·본원진기, total 32 each (o = values from the official site, others are ours)
const GEUNGOL=GD.GEUNGOL;
const STATS=GD.STATS;
const STATUS=GD.STATUS;

// 무기 계열: 현묘도 (명중+회피) trades against 공격·방어
const CLS=GD.CLS;
const CLASS=GD.CLASS;
const WEAP=CLASS;
// 오행: each 무공 belongs to one element; 상극 hits 1.3x
const ELS=GD.ELS;
const EL=GD.EL;
const BEATS=GD.BEATS;
const elMul=(a,b)=>!a||!b?1:BEATS[a]===b?1.3:BEATS[b]===a?.8:1;
const FORMN=GD.FORMN;
const REQ=GD.REQ,COST=GD.COST,BONUS=GD.BONUS;
const ART_NAMES=GD.ART_NAMES;
const OFFICIAL=GD.OFFICIAL;
const NA=GD.NA;
const NB=GD.NB;
const UA=GD.UA,UB=GD.UB;
// 궁법 forms (new); the other classes reuse the hand-made 초식 of the earlier prototype as their pattern pool (각 folds into 권법 as 권각)
const BOW=GD.BOW;
const BOWU=GD.BOWU;
function buildArts(){
  const pool={},ults={};
  for(const c of CLS){pool[c]=[];ults[c]=[]}
  for(const k in PROTO){const c=k==='각'?'권':k;for(const a of PROTO[k]){pool[c].push(...a.forms);ults[c].push(a.ult)}}
  pool.궁=BOW;ults.궁=BOWU;
  const R=rng(4242),combos=[];for(const a of NA)for(const b of NB)combos.push(a+b);
  for(let i=combos.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[combos[i],combos[j]]=[combos[j],combos[i]]}
  const uc=[];for(const a of UA)for(const b of UB)uc.push(a+b);
  let ci=0,ui=0;const arts={};
  for(const side of['정','사'])CLS.forEach(c=>ELS.forEach((el,ei)=>{
    const n=ART_NAMES[side][c][ei],k=FORMN[el],r=rng(7+n.charCodeAt(0)*31+n.charCodeAt(1)*7+ei);
    const p=pool[c].slice();for(let i=p.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
    // a quick single-target strike first, then the rest from cheapest to heaviest
    const first=p.findIndex(f=>['melee','multi','line'].includes(f.p)||(f.p==='proj'&&!f.full&&f.cnt<=2));
    const pick=[p.splice(Math.max(0,first),1)[0],...p.slice(0,k-1).sort((a,b)=>a.cd-b.cd)];
    const off=OFFICIAL[n];
    const forms=pick.map((f,i)=>({...f,n:off?off.forms[i]:combos[ci++%combos.length],req:REQ[i],cost:COST[i],bonus:BONUS[i],qi:4+i*4,m:f.m*(1+.06*i)*(k<=3?1.25:1)}));
    const u=ults[c][(ei+(side==='사'?1:0))%ults[c].length];
    const id=side+c+ei;
    arts[id]={id,side,cls:c,el,n,c:EL[el].c,pt:EL[el].pt,elc:el==='금',forms,
      ult:{n:off?off.ult:uc[ui++%uc.length],steps:[F('','circle',{rad:2.8,m:1.5,stun:.3}),...u.steps.map(s=>({...s,delay:(s.delay||0)+.18}))]},
      d:`${SIDES[side].base} 계열 ${CLASS[c].n} · 오행 ${el}. 초식 ${forms.length}개와 필살기.`};
  }));
  addSectArts(arts,pool,ults,()=>combos[ci++%combos.length],()=>uc[ui++%uc.length]);
  addGiyeonArts(arts,pool,ults);
  arts.base={id:'base',side:null,cls:'권',el:null,n:'기초권각',c:'235,225,200',pt:'dot',base:1,
    forms:[{...F('정권','melee',{m:1,cd:.3}),req:0,cost:0,bonus:10,qi:0},{...F('연환퇴','multi',{hits:2,m:.55,cd:.45}),req:20,cost:0,bonus:20,qi:4},{...F('소퇴','arc',{spread:2,rad:1.5,m:.9,cd:.55}),req:45,cost:0,bonus:30,qi:8}],
    ult:{n:'선풍퇴',steps:[F('','circle',{rad:2.4,m:1.4,kb:1})]},d:'누구나 아는 기초 권각. 숙련도 20·45에 저절로 초식이 열린다. 오성 제한에 들지 않는다.'};
  return arts;
}

// 적과 짐승. el = 오행, good = 처치 시 선업, xp = 활력
const MOBS=GD.MOBS;
// spawn regions: [mob, cap, test(x,y)]
// 개봉은 중립지대(2026-10-08 사용자 결정): 싸움을 거는 몹 없이 기본 동물과 양민만 산다.
// 예전 흑풍채 산채(산적·흑풍채주)와 혈교 동굴(혈교무인·강시·혈교장로)은 하남성으로 옮겼다 (g_province.js PV_LAIRS)
// 개봉 몹 출현 구역: 데이터(GD.SPAWNS)는 구역 이름만 쓰고, 판정은 여기서
const SPAWN_ZONE={north:(x,y)=>y<RIV-1&&x>12,south_rabbit:(x,y)=>y>28&&!inBamboo(x,y),sheep:(x,y)=>y>29&&x>13&&x<30,horse:(x,y)=>y>30&&x>14,boar:(x,y)=>(inBamboo(x,y)||y>32),town:(x,y)=>inTown(x,y)};
const SPAWNS=GD.SPAWNS.map(([k,cap,z])=>[k,cap,SPAWN_ZONE[z]]);

// 절세신공: 10장 each, one per character, 수동초식 only, 5 s cooldown
const SHINGONG=GD.SHINGONG;

// 생활: materials and consumables live in P.mats as counts
const MAT_PRICE=GD.MAT_PRICE;
const CONSUME=GD.CONSUME;
const JOBS=GD.JOBS;
const WNAME=GD.WNAME;
// 제작 결과: 데이터의 설명(make)을 실제 물건으로. weapon·gear 는 품질 q를 받고, 재료는 n개 (good: 품질 1.2 넘으면, perQ: 품질에 비례)
const recipeMake=m=>m.kind==='weapon'?q=>mkWeapon(m.cls,q,1):m.kind==='gear'?q=>mkGear(m.slot,m.name,q,m.o):q=>({mat:m.mat,n:m.perQ?m.n+Math.round(q*m.perQ):m.good&&q>1.2?m.good:m.n});
const RECIPES=GD.RECIPES.map(r=>({...r,make:recipeMake(r.make)}));
// 농사: weather and season change growth (sec to ripen at 1x)
const CROPS=GD.CROPS;
const WEATHER=GD.WEATHER;
// 비무 상대
const DUELISTS=GD.DUELISTS;
const QUESTS=GD.QUESTS;

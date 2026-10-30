// ================= 신영웅문 systems: data =================
const RANKS=GD.RANKS;
const REALM_QI=GD.REALM_QI;        // 경지 by 내공 (갑자) total
const SIJIN=GD.SIJIN;
const DAY_SEC=150;                                    // 낮밤 한 바퀴 = 150초
const YEAR_SEC=1800;                                  // 1년 = 실제 30분 = 낮밤 12바퀴, 하루가 한 달 (사용자 결정 2026-10-20, 전에는 하루=1년)
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
const MELEE=GD.MELEE_ARTS;   // 근접 무공이 하나씩 딸린 병기 계열: 단 단도·편 절편 (v192)
const rangedCls=c=>c==='궁'||c==='암';   // 멀리서 쏘는 병기: 궁법·암기술 (v181)
const CLASS=GD.CLASS;
const WEAP=CLASS;
// 오행·음양·뇌기: 속성은 무공이 아니라 운용 중인 심법(내공)의 것이다 (사용자 결정 2026-10-13). 무공의 el 은 생성 씨앗(초식 수·이름·id)으로만 남고, 전투·색·입자는 심법 속성과 계열을 따른다.
// 상극 우선순위는 그대로: 화>금>목>토>수>화, 여기에 양>음>뇌>양 삼각을 더했다. 1.3x / 0.8x
const ELS=GD.ELS;
const EL=GD.EL;
const BEATS=GD.BEATS;
// 마기(사용자 2026-10-14 v101): 마는 다른 모든 속성에 우위(1.3)이고, 다른 속성은 마에 열세(0.8)다. 다만 불가 계열(소림·아미·보타) 심법을 운용하는 상대에게는 거꾸로 취약하다.
// sa·sb는 공격자·방어자의 심법 계열(pSchool / 문파 simSchoolOf). 속성이 없는 상대(짐승 등)와는 배율 1.
const elMul=(a,b,sa,sb)=>{if(!a||!b)return 1;if(a==='마'&&b!=='마')return sb==='불가'?.8:1.3;if(b==='마'&&a!=='마')return sa==='불가'?1.3:.8;return BEATS[a]===b?1.3:BEATS[b]===a?.8:1};
const FORMN=GD.FORMN;
// 무공 객체의 c(색)·pt(입자)·elc(뇌기)는 저장되지 않는 getter 로, 그때그때 심법에서 읽는다 (g_simbeop.js artEl/fxCol)
// v169: c 는 심법 색에 무공 특성 색을 물들인 주색, c2 는 무공 특성 색인 보조색 (g_fxcol.js artMain/trCol)
// 어두운 색(마기): 이펙트는 더하기 합성 대신 보통 합성으로 검게 그리고, 글자에는 보랏빛 테두리색(ct)을 쓴다 (사용자 요청 2026-10-14 "마교 무공은 검은색 계열")
const DARKC=new Map();   // 이펙트마다 매 프레임 묻는다: 색 문자열별로 한 번만 가린다
const isDark=c=>{let r=DARKC.get(c);if(r===undefined){const v=String(c).split(',').map(Number);r=v.length===3&&v[0]*.3+v[1]*.6+v[2]*.1<70;DARKC.set(c,r)}return r};
const HI_DARK='150,40,190';
const textCol=c=>isDark(c)?HI_DARK:c;
function artFx(a){delete a.c;delete a.c2;delete a.pt;delete a.elc;delete a.ct;
  Object.defineProperty(a,'c',{get(){return artMain(a)},enumerable:false,configurable:true});
  Object.defineProperty(a,'c2',{get(){return trCol(a)},enumerable:false,configurable:true});
  Object.defineProperty(a,'ct',{get(){return textCol(artMain(a))},enumerable:false,configurable:true});
  Object.defineProperty(a,'pt',{get(){return EL[artEl(a)].pt},enumerable:false,configurable:true});
  Object.defineProperty(a,'elc',{get(){return artEl(a)==='뇌'},enumerable:false,configurable:true});return a}
const REQ=GD.REQ,COST=GD.COST,BONUS=GD.BONUS;
const ART_NAMES=GD.ART_NAMES;
const OFFICIAL=GD.OFFICIAL;
const NA=GD.NA;
const NB=GD.NB;
const UA=GD.UA,UB=GD.UB;
// 궁법 forms (new); the other classes reuse the hand-made 초식 of the earlier prototype as their pattern pool (각 folds into 권법 as 권각)
const BOW=GD.BOW;
const BOWU=GD.BOWU;
// 암기술 forms (v181, 사용자 2026-10-26): 비도·표창·비침, 독침
function buildArts(){
  const pool={},ults={};
  for(const c of CLS){pool[c]=[];ults[c]=[]}
  for(const k in PROTO){const c=k==='각'?'권':k;for(const a of PROTO[k]){pool[c].push(...a.forms);ults[c].push(a.ult)}}
  pool.궁=BOW;ults.궁=BOWU;pool.암=GD.AMGI;ults.암=GD.AMGIU;
  const R=rng(4242),combos=[];for(const a of NA)for(const b of NB)combos.push(a+b);
  for(let i=combos.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[combos[i],combos[j]]=[combos[j],combos[i]]}
  const uc=[];for(const a of UA)for(const b of UB)uc.push(a+b);
  let ci=0,ui=0;const arts={};
  const basic=(side,c)=>ELS.forEach((el,ei)=>{
    const n=ART_NAMES[side][c][ei],k=FORMN[el],r=rng(7+n.charCodeAt(0)*31+n.charCodeAt(1)*7+ei);
    const pick=pickForms(pool[c],r,k);
    const off=OFFICIAL[n];
    const forms=pick.map((f,i)=>({...f,n:off?off.forms[i]:combos[ci++%combos.length],req:REQ[i],cost:COST[i],bonus:BONUS[i],qp:GD.QSTAR.pct[i],m:f.m*(1+.06*i)*(k<=3?1.25:1)}));
    const u=ults[c][(ei+(side==='사'?1:0))%ults[c].length];
    const id=side+c+ei;
    arts[id]=artFx({id,side,cls:c,el,n,forms,
      ult:{n:off?off.ult:uc[ui++%uc.length],steps:[F('','circle',{rad:2.8,m:1.5,stun:.3}),...u.steps.map(s=>({...s,delay:(s.delay||0)+.18}))]},
      d:`${SIDES[side].base} 계열 ${CLASS[c].n}. 초식 ${forms.length}개와 필살기.`});
  });
  for(const side of['정','사'])CLS.forEach(c=>{if(c!=='암')basic(side,c)});
  addSectArts(arts,pool,ults,()=>combos[ci++%combos.length],()=>uc[ui++%uc.length]);
  addGiyeonArts(arts,pool,ults);
  addRecluseArts(arts,pool,ults,()=>combos[ci++%combos.length],()=>uc[ui++%uc.length]);   // 은거기인의 중승 무공 (g_mkmat.js). 맨 끝에 불러 다른 무공의 초식 이름이 밀리지 않는다
  for(const side of['정','사'])basic(side,'암');   // 암기술 기본 무공(v181)도 나중에 넣은 계열이라 맨 끝
  if(typeof addLoreArts==='function')addLoreArts(arts,pool,ults,()=>combos[ci++%combos.length],()=>uc[ui++%uc.length]);   // v213 형산 음공 (g_lore.js). 맨 끝에 불러 다른 무공의 초식 이름이 밀리지 않는다
  arts.base=artFx({id:'base',side:null,cls:'권',el:null,n:'기초권각',base:1,
    forms:[{...F('정권','melee',{m:1,cd:.3}),req:0,cost:0,bonus:10,qp:GD.QSTAR.base[0]},{...F('연환퇴','multi',{hits:2,m:.55,cd:.45}),req:20,cost:0,bonus:20,qp:GD.QSTAR.base[1]},{...F('소퇴','arc',{spread:2,rad:1.5,m:.9,cd:.55}),req:45,cost:0,bonus:30,qp:GD.QSTAR.base[2]}],
    ult:{n:'선풍퇴',steps:[F('','circle',{rad:2.4,m:1.4,kb:1})]},d:'누구나 아는 기초 권각. 숙련도 20·45에 저절로 초식이 열린다. 오성 제한에 들지 않는다.'});
  // 근접 무공 (v191 단검술, v192 절편술): 단도·절편으로 펼친다. 요대에 차 두면 암기가 떨어졌을 때 저절로 든다 (g_amgi.js). 초식은 숙련에 저절로 열린다
  for(const[c,D]of Object.entries(MELEE))arts[D.id]=artFx({id:D.id,side:null,cls:c,el:null,n:D.n,melee:1,
    forms:D.forms.map((f,i)=>({...f,cost:0,qp:GD.QSTAR.pct[i]})),ult:D.ult,d:`${WNAME[c]}을(를) 손에 들거나 요대에 차 두고 펼치는 ${CLASS[c].n}. 숙련이 오르면 초식이 저절로 열린다.`})
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
// 초식 고르기 (g_data 기본 무공, g_sect 문파 무공, g_giyeon 기연 무공이 같이 쓴다): 씨앗 r로 섞고, 빠른 단일 타격 하나를 먼저, 나머지 k-1개는 가벼운 것부터
function pickForms(src,r,k){const p=src.slice();for(let i=p.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
  const first=p.findIndex(f=>['melee','multi','line'].includes(f.p)||(f.p==='proj'&&!f.full&&f.cnt<=2));
  return [p.splice(Math.max(0,first),1)[0],...p.slice(0,k-1).sort((a,b)=>a.cd-b.cd)]}

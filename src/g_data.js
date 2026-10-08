// ================= 신영웅문 systems: data =================
const RANKS=['삼류','이류','일류','절정','초절정','화경','현경'];
const REALM_QI=[0,150,250,380,540,740,1000];        // 경지 by 내공 (갑자) total
const SIJIN=['자','축','인','묘','진','사','오','미','신','유','술','해'];
const YEAR_SEC=90;                                    // one year of age per 90 s of play
const SEASONS=['봄','여름','가을','겨울'];
// 정파/사파: base 내공 and the opposite 내공 수련 curves (official 10/11 per session; 첫 수련 300→30 scaled, +3 / 3, +4)
const SIDES={
  정:{n:'정파',base:'대반야금강공',gain:10,first:30,step:3,col:'#9db8e0',d:'초반 내공 수련이 비싸고 갈수록 덜 오른다. 양민을 해치면 업보가 크게 쌓인다.'},
  사:{n:'사파',base:'혈라공',gain:11,first:3,step:4,col:'#e0675a',d:'초반 내공 수련이 아주 싸지만 갈수록 비싸진다. 독공의 위력이 1.5배.'}};
const qiCost=(side,n)=>SIDES[side].first+SIDES[side].step*n;
// 근골: 근력·지구력·민첩력·본원진기, total 32 each (o = values from the official site, others are ours)
const GEUNGOL={
  정:[['마천오행지체',10,7,8,7,1],['인봉금지체',8,7,7,10,1],['극태양지체',8,8,8,8,1],['천강금골체',11,8,7,6],['청운선골체',6,7,9,10],['송학유골체',7,7,11,7],['백련정골체',7,10,7,8],['반야불골체',8,9,6,9],['태청현골체',6,8,8,10],['무량검골체',9,7,9,7]],
  사:[['수덕지성지체',9,6,7,10,1],['천고만야지체',10,7,9,6,1],['북두성태체',8,8,8,8,1],['혈해마령체',11,7,7,7],['음풍귀골체',6,7,10,9],['독사연골체',7,6,11,8],['흑수현음체',6,8,7,11],['철골동피체',9,11,6,6],['귀령유골체',7,7,8,10],['마염단골체',10,6,8,8]]};
const STATS=[{k:'str',n:'근력'},{k:'end',n:'지구력'},{k:'agi',n:'민첩력'},{k:'qi',n:'본원진기'}];
const STATUS=[
  {n:'천민',silver:10,vit:20,pick:3,wis:0,d:'악업이 무거웠던 생. 가진 것이 거의 없다.'},
  {n:'양민',silver:50,vit:40,pick:5,wis:0,d:'평범한 집안에서 태어났다.'},
  {n:'무가',silver:120,vit:90,pick:7,wis:0,d:'무인 집안. 시작 무기가 좋고 비급 한 권을 더 받는다.'},
  {n:'명문세가',silver:300,vit:160,pick:10,wis:1,d:'이름난 세가. 근골을 모두 고를 수 있고 오성이 1 높다.'}];

// 무기 계열: 현묘도 (명중+회피) trades against 공격·방어
const CLS=['검','도','창','봉','권','궁'];
const CLASS={
  검:{n:'검법',w:'검·판관필',atk:.9,def:.9,hm:22,reach:1.45,draw:'sword',anim:'swing',pj:'crescent',d:'공방 낮음, 현묘도 높음'},
  도:{n:'도법',w:'도·섭선',atk:1.1,def:1.1,hm:10,reach:1.5,draw:'dao',anim:'swing',pj:'crescent',d:'검보다 현묘도 낮고 공방 높음'},
  창:{n:'창법',w:'창·극·언월도',atk:1.35,def:1,hm:-12,reach:2,draw:'spear',anim:'thrust',pj:'spear',d:'현묘도 매우 낮고 한 방이 큼'},
  봉:{n:'봉법',w:'봉·선장',atk:1.12,def:1,hm:6,reach:1.7,draw:'staff',anim:'swing',pj:'ring',d:'창보다 공격 낮고 현묘도 높음'},
  권:{n:'권법',w:'맨손',atk:1,def:1,hm:12,reach:1.25,draw:'fist',anim:'punch',pj:'orb',d:'균형형. 무기가 필요 없다'},
  궁:{n:'궁법',w:'궁',atk:1.3,def:.7,hm:6,reach:6,draw:'bow',anim:'punch',pj:'arrow',d:'공격 높고 방어 매우 약함, 사거리 김'}};
const WEAP=CLASS;
// 오행: each 무공 belongs to one element; 상극 hits 1.3x
const ELS=['화','수','목','금','토'];
const EL={
  화:{c:'255,125,55',pt:'spark',fx:'화상: 3초간 타오른다'},수:{c:'110,180,255',pt:'dot',fx:'빙결: 2초간 느려진다'},
  목:{c:'120,225,120',pt:'leaf',fx:'흡기: 피해의 10%를 체력으로'},금:{c:'235,235,250',pt:'spark',fx:'예기: 치명타 +15%, 방어 무시'},토:{c:'225,175,95',pt:'dot',fx:'중압: 기절 +0.3초, 밀쳐냄'}};
const BEATS={화:'금',금:'목',목:'토',토:'수',수:'화'};
const elMul=(a,b)=>!a||!b?1:BEATS[a]===b?1.3:BEATS[b]===a?.8:1;
const FORMN={화:5,수:4,목:3,금:6,토:2};
const REQ=[0,20,40,60,80,90],COST=[30,60,110,170,240,320],BONUS=[14,20,38,56,75,90];
const ART_NAMES={
  정:{검:['양의검법','현허칠성검법','태극혜검','삼절황검','신문십삼검'],도:['오호단문도','벽파도법','청송도법','금강복마도','산하일도'],창:['열화창법','유수창법','송백창법','백호창법','태산창법'],
     봉:['화운봉법','수류곤법','청죽봉법','금강항마곤','대지봉법'],권:['열양신권','유운장','청목수','금강권','복호각'],궁:['낙일궁','추월궁','청송궁','관일궁','진산궁']},
  사:{검:['혈영검법','음풍검법','독사검','탈혼검','귀령검'],도:['혈마도법','흑수도법','독랑도','참혼도','귀두도법'],창:['혈룡창','음수창','독전창','탈명창','귀문창'],
     봉:['혈운곤','흑풍곤','독목곤','쇄골곤','마령곤'],권:['혈수인','음한장','독사수','혈강권','마령각'],궁:['혈시궁','음전궁','독시궁','탈백궁','귀곡궁']}};
const OFFICIAL={양의검법:{forms:['이지작검','검정중원','만검진천','매영당당','귀곡신호'],ult:'허완의영'}};
const NA=['청풍','낙화','유성','만검','귀곡','추혼','비룡','회선','혈영','천강','무영','섬광','열양','한빙','벽력','송학','운룡','백호','현무','주작','청룡','금강','나한','태극','칠성','구궁','팔괘','일월','성하','운무','산하','풍뢰','화룡','빙백','낙엽','단혼','탈백','파천','유수','철산'];
const NB=['일섬','난무','회류','진천','파산','연환','폭우','출수','탈명','관일','횡소','천격','낙영','분광','회천','비상','쇄골','열지','단월','붕산','축지','삼연','만상','귀원','노도','섬전','무흔','낙뢰','개벽','소요'];
const UA=['천지','만겁','개천','무극','혼원','구천','대라','태허','멸세','귀일','천마','반야'],UB=['무쌍','파멸','대환','귀종','일기','신강','탈혼','천붕','혈해','열천','멸겁','합일'];
// 궁법 forms (new); the other classes reuse the hand-made 초식 of the earlier prototype as their pattern pool (각 folds into 권법 as 권각)
const BOW=[F('관일시','proj',{cnt:1,spd:15,len:7,pierce:1,m:1.1,cd:.4}),F('연주전','proj',{cnt:2,spread:.15,spd:14,len:7,m:.7,cd:.5}),F('삼성탈월','proj',{cnt:3,spread:.5,spd:13,len:6.5,m:.65,cd:.6}),
  F('낙성시','drop',{rad:1,r:6,stun:.3,m:1.1,cd:.8}),F('전우','rain',{cnt:6,rad:1.8,r:6,m:.55,cd:.9}),F('팔방전','proj',{full:1,cnt:8,spd:12,len:5,m:.6,cd:.8}),
  F('파갑시','proj',{cnt:1,spd:18,len:9,pierce:1,size:1.6,m:1.4,cd:.8}),F('추혼전','chain',{cnt:3,r:6,m:.8,cd:.75}),F('산화시','proj',{cnt:5,spread:.9,spd:12,len:5.5,m:.45,cd:.7}),F('섬광시','line',{len:7,w:.35,m:1.2,cd:.6})];
const BOWU=[{steps:[F('','rain',{cnt:16,rad:3.5,self:1,m:.9})]},{steps:[F('','proj',{full:1,cnt:20,spd:12,len:6,pierce:1,m:.9})]},{steps:[F('','proj',{cnt:1,spd:12,len:10,pierce:1,size:3,m:3})]}];
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
  arts.base={id:'base',side:null,cls:'권',el:null,n:'기초권각',c:'235,225,200',pt:'dot',base:1,
    forms:[{...F('정권','melee',{m:1,cd:.3}),req:0,cost:0,bonus:10,qi:0},{...F('연환퇴','multi',{hits:2,m:.55,cd:.45}),req:20,cost:0,bonus:20,qi:4},{...F('소퇴','arc',{spread:2,rad:1.5,m:.9,cd:.55}),req:45,cost:0,bonus:30,qi:8}],
    ult:{n:'선풍퇴',steps:[F('','circle',{rad:2.4,m:1.4,kb:1})]},d:'누구나 아는 기초 권각. 숙련도 20·45에 저절로 초식이 열린다. 오성 제한에 들지 않는다.'};
  return arts;
}

// 적과 짐승. el = 오행, good = 처치 시 선업, xp = 활력
const MOBS={
  산적:{hp:44,atk:7,def:1,hm:8,sp:1.8,reach:1.2,xp:9,silver:[2,6],el:'금',pal:'bandit',hostile:1,good:1,aggro:6},
  산적궁수:{hp:32,atk:6,def:0,hm:14,sp:1.7,reach:5,ranged:1,xp:10,silver:[2,7],el:'목',pal:'archer',hostile:1,good:1,aggro:7},
  산적두목:{hp:150,atk:13,def:3,hm:16,sp:1.9,reach:1.3,xp:35,silver:[12,28],el:'화',pal:'chief',hostile:1,good:3,aggro:6,elite:1,big:1.12},
  흑풍채주:{hp:620,atk:22,def:6,hm:26,sp:1.7,reach:1.5,xp:220,silver:[90,160],el:'토',pal:'boss',boss:1,hostile:1,good:10,fame:25,aggro:7,big:1.3},
  혈교무인:{hp:190,atk:17,def:4,hm:28,sp:2,reach:1.3,xp:60,silver:[12,30],el:'수',pal:'cultist',hostile:1,good:4,aggro:6,poison:1},
  강시:{hp:300,atk:21,def:9,hm:2,sp:1.3,reach:1.1,xp:75,silver:[0,0],el:'토',pal:'jiangshi',hostile:1,good:3,aggro:5,hop:1},
  혈교장로:{hp:1100,atk:30,def:10,hm:40,sp:1.8,reach:1.5,xp:420,silver:[160,260],el:'화',pal:'elder',boss:1,hostile:1,good:20,fame:50,aggro:7,big:1.3,poison:1},
  토끼:{beast:'rabbit',hp:10,atk:0,sp:3.2,xp:2,passive:1,meat:1,size:.45,col:['#d8cfc0','#8a7f6e']},
  양:{beast:'sheep',hp:28,atk:0,sp:1.4,xp:3,passive:1,meat:2,size:.75,col:['#efe9dc','#a59d8a']},
  사슴:{beast:'deer',hp:46,atk:0,sp:3,xp:6,passive:1,meat:2,hide:1,tame:30,life:14,size:.9,col:['#b07a48','#5e3d22'],antler:1},
  말:{beast:'horse',hp:90,atk:6,sp:3.2,xp:8,passive:1,meat:3,tame:45,life:28,size:1.2,col:['#7a4e2e','#2e1c10'],ride:1,mane:1},
  멧돼지:{beast:'boar',hp:80,atk:10,def:2,sp:2.4,xp:14,neutral:1,meat:3,hide:1,tame:35,life:12,size:.85,col:['#5a4636','#231a12'],tusk:1,el:'토'},
  늑대:{beast:'wolf',hp:66,atk:11,def:1,hm:18,sp:2.7,xp:16,hostile:1,aggro:6,meat:1,hide:1,tame:50,life:13,size:.85,col:['#8d8a84','#3c3a36'],el:'금'},
  곰:{beast:'bear',hp:240,atk:20,def:5,sp:2,xp:45,neutral:1,meat:4,hide:2,tame:90,life:30,size:1.35,col:['#4a3426','#1d140e'],el:'토'},
  호랑이:{beast:'tiger',hp:330,atk:26,def:4,hm:24,sp:2.9,xp:70,hostile:1,aggro:7,meat:3,hide:3,tame:140,life:24,size:1.3,col:['#d88a2e','#5a2e10'],stripes:1,el:'금'},
  양민:{villager:1,hp:30,atk:0,sp:1.1,xp:0,passive:1,pal:'villager'}};
// spawn regions: [mob, cap, test(x,y)]
const SPAWNS=[
  ['산적',8,(x,y)=>inCamp(x,y)],['산적궁수',4,(x,y)=>inCamp(x,y)],['산적두목',2,(x,y)=>inCamp(x,y)&&x>33],
  ['혈교무인',3,(x,y)=>inCave(x,y)],['강시',2,(x,y)=>inCave(x,y)],
  ['늑대',4,(x,y)=>y<RIV-1&&x>12],['곰',1,(x,y)=>y<RIV-1&&x>16],['호랑이',1,(x,y)=>y<RIV-1&&x>28],['사슴',3,(x,y)=>y<RIV-1&&x>12],
  ['토끼',4,(x,y)=>y>28&&!inBamboo(x,y)],['양',4,(x,y)=>y>29&&x>13&&x<30],['말',2,(x,y)=>y>30&&x>14],['멧돼지',2,(x,y)=>(inBamboo(x,y)||y>32)],
  ['양민',6,(x,y)=>inTown(x,y)]];

// 절세신공: 10장 each, one per character, 수동초식 only, 5 s cooldown
const SHINGONG={
  역천용상비전:{d:'5초 동안 필살기 내공 소모 70% 감소, 필살기 재사용 초기화'},
  사신십삼탈혼:{d:'5초 동안 치명타 확률 100%'},
  백환수인:{d:'주변 적의 이동 속도를 5초 동안 1로 묶는다'},
  단홍참뢰비전:{d:'주변 적에게 뇌전, 5초 동안 회복 불가'}};

// 생활: materials and consumables live in P.mats as counts
const MAT_PRICE={약초:4,광석:6,목재:4,고기:5,가죽:9,잉어:8,쌀:5,보리:4,배추:4,목화:6,볍씨:5,보리씨:5,배추씨:5,목화씨:5,비도:2,금창약:15,소환단:20,해독단:10,대환단:120,주먹밥:8,보리죽:8,고기볶음:16,잉어찜:24};
const CONSUME={
  금창약:{d:'체력 40% 회복',k:'4'},소환단:{d:'내공 50% 회복',k:'5'},해독단:{d:'중독 해제'},대환단:{d:'최대 내공 +15 (한 생에 3번)'},
  주먹밥:{d:'체력 35% 회복'},보리죽:{d:'내공 40% 회복'},고기볶음:{d:'90초 동안 공격력 +15%'},잉어찜:{d:'황하 특산. 90초 동안 현묘도 +20'}};
const JOBS={대장:{n:'대장장이',npc:'smith'},직물:{n:'직물 제조사',npc:'cloth'},요리:{n:'요리사',npc:'inn'},약재:{n:'약재사',npc:'pharm'}};
const WNAME={검:'철검',도:'박도',창:'장창',봉:'철곤',권:'철권갑',궁:'각궁'};
const RECIPES=[
  ...CLS.map(c=>({job:'대장',n:WNAME[c]+' 단조',need:c==='궁'?{목재:3,가죽:1}:{광석:3,목재:1},make:q=>mkWeapon(c,q,1),at:'smith'})),
  {job:'대장',n:'철갑 단조',need:{광석:4,가죽:1},make:q=>mkGear('armor','철갑',q,{hp:30,def:6}),at:'smith'},
  {job:'대장',n:'비도 10자루',need:{광석:1},make:q=>({mat:'비도',n:10+Math.round(q*4)}),at:'smith'},
  {job:'직물',n:'무명 무복',need:{목화:2},make:q=>mkGear('armor','무명 무복',q,{hp:24,def:2})},
  {job:'직물',n:'비단 무복',need:{목화:4,가죽:1},make:q=>mkGear('armor','비단 무복',q,{hp:40,def:3,hm:6})},
  {job:'직물',n:'가죽신',need:{가죽:2},make:q=>mkGear('boots','가죽신',q,{spd:.15,hm:5})},
  {job:'직물',n:'영락 장신구',need:{목화:1,광석:2},make:q=>mkGear('acc','영락',q,{qi:20,hm:4})},
  {job:'요리',n:'주먹밥',need:{쌀:1},make:q=>({mat:'주먹밥',n:q>1.2?2:1})},
  {job:'요리',n:'보리죽',need:{보리:1},make:q=>({mat:'보리죽',n:q>1.2?2:1})},
  {job:'요리',n:'고기볶음',need:{고기:1,배추:1},make:q=>({mat:'고기볶음',n:q>1.2?2:1})},
  {job:'요리',n:'황하 잉어찜',need:{잉어:1,배추:1},make:q=>({mat:'잉어찜',n:q>1.2?2:1})},
  {job:'약재',n:'금창약',need:{약초:2},make:q=>({mat:'금창약',n:q>1.2?2:1})},
  {job:'약재',n:'소환단',need:{약초:3},make:q=>({mat:'소환단',n:q>1.2?2:1})},
  {job:'약재',n:'해독단',need:{약초:1},make:q=>({mat:'해독단',n:2})},
  {job:'약재',n:'대환단',need:{약초:6,잉어:1},make:q=>({mat:'대환단',n:1}),min:40}];
// 농사: weather and season change growth (sec to ripen at 1x)
const CROPS={
  쌀:{seed:'볍씨',t:40,like:{비:1.9,맑음:1,흐림:.9,폭염:.6,눈:0},col:'#c8b45a',d:'비를 좋아한다'},
  보리:{seed:'보리씨',t:32,like:{비:1.1,맑음:1,흐림:1,폭염:.7,눈:.6},col:'#d8c070',d:'눈에도 견딘다'},
  배추:{seed:'배추씨',t:28,like:{비:1.3,맑음:1,흐림:1.2,폭염:.4,눈:0},col:'#7fbf5f',season:'가을',d:'가을에 1.5배'},
  목화:{seed:'목화씨',t:44,like:{비:.7,맑음:1.6,흐림:.8,폭염:1.8,눈:0},col:'#f2efe6',d:'햇볕과 더위를 좋아한다'}};
const WEATHER={봄:[['맑음',.5],['비',.35],['흐림',.15]],여름:[['맑음',.45],['비',.3],['폭염',.25]],가을:[['맑음',.6],['흐림',.25],['비',.15]],겨울:[['눈',.5],['흐림',.3],['맑음',.2]]};
// 비무 상대
const DUELISTS=[
  {n:'떠돌이 무사 장삼',cls:'도',el:'금',hp:160,atk:11,def:2,hm:14,fame:8,silver:20},
  {n:'속가제자 이연',cls:'검',el:'수',hp:260,atk:15,def:3,hm:30,fame:15,silver:40},
  {n:'팽가 도객 팽무진',cls:'도',el:'화',hp:420,atk:21,def:5,hm:24,fame:25,silver:70},
  {n:'당가 암기고수 당소옥',cls:'궁',el:'목',hp:520,atk:26,def:4,hm:40,fame:40,silver:110,ranged:1},
  {n:'무명검객',cls:'검',el:'금',hp:900,atk:34,def:8,hm:55,fame:80,silver:200}];
const QUESTS=[
  {n:'흑풍채 산적 소탕',kind:'kill',mob:['산적','산적궁수'],cnt:8,silver:40,vit:60,fame:6,good:4},
  {n:'산적두목 토벌',kind:'kill',mob:['산적두목'],cnt:2,silver:70,vit:90,fame:10,good:5},
  {n:'늑대 퇴치',kind:'kill',mob:['늑대'],cnt:4,silver:30,vit:45,fame:4,good:2},
  {n:'약초 납품',kind:'give',mat:'약초',cnt:5,silver:35,vit:30,fame:2,good:3},
  {n:'가죽 납품',kind:'give',mat:'가죽',cnt:3,silver:45,vit:35,fame:2,good:2},
  {n:'쌀 납품',kind:'give',mat:'쌀',cnt:4,silver:40,vit:40,fame:3,good:4},
  {n:'혈교 무인 추적',kind:'kill',mob:['혈교무인'],cnt:3,silver:90,vit:150,fame:15,good:6},
  {n:'황하 잉어 납품',kind:'give',mat:'잉어',cnt:2,silver:40,vit:30,fame:2,good:2}];

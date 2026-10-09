// ================= 경지의 효과, 깨달음, 갑자·영약·심법 계열·단전 =================
// 사용자 결정(2026-10-09): 경지 제안서(/mnt/project-files/docs/경지_내공_제안.md)의 2·4·5번. 윤회 때의 전승(내공 전수·생사경)은 지금대로 두었다.
// 설계: docs/경지_설계.md 2장 이후

// ---- 상대의 경지: 공격력으로 가늠한다 (보스는 한 단계 위) ----
const MOB_RT=[10,16,22,28,36,50];
function mobRealm(e){if(!e||!e.d)return 0;if(e.realm!=null)return e.realm;let r=0;for(const v of MOB_RT)if((e.atk||0)>=v)r++;return Math.min(6,r+(e.d.boss?1:0))}

// ---- 경지마다 열리는 것 ----
const REALM_FX=[
  {n:'초식을 흉내 낸다',d:'기본'},
  {n:'소주천',d:'내공 회복 +30%, 경공 거리 +0.6'},
  {n:'검기',d:'병장기에 기가 서려 피해 +10%, 상대 방어 절반 무시'},
  {n:'임독양맥 타통 · 검사',d:'중단전이 열려 최대 내공 +15%, 공격이 20% 확률로 곁의 적에게 기의 실을 뻗는다'},
  {n:'검강 · 호신강기',d:'피해 +25%, 두 단계 아래 하수의 공격은 강기에 막혀 1/5만 들어온다'},
  {n:'반박귀진 · 환골탈태',d:'기운이 안으로 숨어 하수도 겁먹지 않고 덤빈다. 상단전이 열려 최대 내공 +30%, 기본기 모두 +2, 수명 +10년'},
  {n:'반로환동 · 이기어검',d:'수명 +20년, 필살기 위력 +30%'}];
// 화경·현경은 심법 계열마다 이름·수치·고유 특성이 다르다 (사용자 결정 2026-10-09: 계열의 특징은 살리되 비슷한 경지끼리 밸런스를 맞춘다)
// 밸런스 점수: 최대 내공 10% = 1, 기본기 1 = 1, 수명 5년 = 1, 필살기 10% = 1. 화경은 모두 13점, 현경은 모두 7점에 고유 특성 하나.
//  q: 상단전이 열려 늘어나는 최대 내공(중단전 15% 대신), st: 환골탈태로 오르는 기본기, l5/l6: 수명, ult: 현경 필살기 위력
const SUMMIT={
  정종:{q:.3,st:{str:2,end:2,agi:2,qi:2},l5:10,l6:20,ult:.3,
    r:[{r:'화경',n:'반박귀진',d:'기운이 안으로 숨어 하수도 겁먹지 않고 덤빈다'},{r:'현경',n:'이기어검',d:'검을 날려 부린다'}]},
  도가:{q:.4,st:{str:1,end:1,agi:2,qi:2},l5:15,l6:30,ult:.1,
    r:[{r:'귀원경',n:'태극 반탄',d:'받은 피해의 15%를 상대에게 되돌린다'},{r:'등선경',n:'심검',d:'마음으로 검을 부린다'}]},
  불가:{q:.3,st:{str:2,end:4,agi:1,qi:2},l5:5,l6:25,ult:.2,
    r:[{r:'금강경',n:'금강불괴',d:'받는 피해 -10%'},{r:'보리경',n:'여래신장',d:'부처의 손바닥이 내려친다'}]},
  사불:{q:.2,st:{str:3,end:3,agi:1,qi:2},l5:10,l6:20,ult:.3,
    r:[{r:'혈불경',n:'혈불공',d:'준 피해의 6%만큼 생명을 빨아들인다'},{r:'명왕경',n:'명왕존',d:'분노한 명왕의 위세'}]},
  사공:{q:.3,st:{str:3,end:1,agi:4,qi:1},l5:5,l6:15,ult:.4,
    r:[{r:'사왕경',n:'사기침골',d:'맞은 적은 사기에 뼈가 저려 2초 동안 느려진다'},{r:'사신경',n:'사신강림',d:'사신의 그림자가 깃든다'}]},
  마공:{q:.5,st:{str:4,end:1,agi:2,qi:1},l5:0,l6:5,ult:.6,
    r:[{r:'마화경',n:'천마해체',d:'생명이 30% 아래로 떨어지면 피해 +25%'},{r:'천마경',n:'천마강림',d:'천마의 기운이 깃든다'}]}};
const SC=()=>SUMMIT[school()];
const summit=i=>SC().r[i-5];
function rk(i){return i>=5&&i<=6&&P?summit(i).r:RANKS[i]}
const stTxt=st=>STATS.map(({k,n})=>`${n} +${st[k]}`).join(', ');
function fxOf(i){if(i<5)return REALM_FX[i];const c=SC(),s=summit(i);
  return i===5?{n:`${s.n} · 환골탈태`,d:`${s.d}. 상단전이 열려 최대 내공 +${Math.round(c.q*100)}%, ${stTxt(c.st)}${c.l5?`, 수명 +${c.l5}년`:''}`}
    :{n:`반로환동 · ${s.n}`,d:`${s.d}: 필살기 위력 +${Math.round(c.ult*100)}%${c.l6?`, 수명 +${c.l6}년`:''}`}}
const sig=k=>realmIdx()>=5&&school()===k;
const realmAt=r=>realmIdx()>=r;
// 단전: 하단전 → 중단전(절정) → 상단전(화경)
const danName=()=>realmAt(5)?'상단전':realmAt(3)?'중단전':'하단전';
const danMul=()=>realmAt(5)?1+SC().q:realmAt(3)?1.15:1;
function realmQiMul(){return realmAt(1)?1.3:1}

// ---- 심법 계열: 문파를 따르고, 문파가 없으면 타고난 기초 내공(정파 대반야금강공=불가, 사파 혈라공=사공) ----
// 사용자 결정(2026-10-09): 사파(사천맹) 문파는 모두 사공, 마공은 마교(천마신교)만.
// 포달랍궁·대뢰음사는 불교로 두되 사공으로 변질된 불교(사불, 밀교 비술)로 따로 둔다
const SCHOOL_OF={불가:['shaolin','emei','bota'],사불:['podal','daeroe'],
  도가:['mudang','hwasan','kunlun','kongtong','jeomchang','cheongseong','jongnam','hyeongsan','cheonsan','taesan','jeonjin','gomyo','seolsan','jangbaek','mosan','nabu'],
  마공:['cheonma']};
const SCHOOL={불가:{d:'느리지만 안정되어 폐관 성공 +5%, 사파·마교 무인에게 받는 피해 -15%'},
  도가:{d:'정종 현문 심법. 폐관 성공 +5%, 주화입마가 덜 무겁고, 경지가 오를 때마다 수명 +2년'},
  사불:{d:'사공으로 변질된 불교(밀교 비술). 내공이 15% 빨리 쌓이고, 금강의 몸으로 정파 무인에게 받는 피해 -15%. 폐관은 불가의 안정과 사공의 위험이 맞서 그대로'},
  사공:{d:'사파의 심법. 내공이 15% 빨리 쌓이지만 폐관 성공 -5%, 주화입마가 조금 무겁다'},
  마공:{d:'천마신교의 심법. 내공이 25% 빨리 쌓이지만 수련마다 악업이 쌓이고, 폐관 성공 -10%, 주화입마가 무겁다'},
  정종:{d:'세가·방파의 심법. 치우침이 없다'}};
function school(){const s=P.sect&&P.sect!=='own'?P.sect:null;
  if(s){for(const[k,l]of Object.entries(SCHOOL_OF))if(l.includes(s))return k;return SECTS[s]&&SECTS[s].al==='sacheon'?'사공':'정종'}
  return P.side==='사'?'사공':'불가'}

// ---- 갑자: 120 내공 = 1갑자(60년 공력) ----
const GAPJA=120;
function gapja(q){const y=Math.round(q/GAPJA*60);if(q<GAPJA*.5)return`${y}년 공력`;const n=Math.floor(q/GAPJA),h=q/GAPJA-n>=.5;
  return n?`${n}갑자${h?' 반':''}`:'반 갑자'}

// ---- 깨달음: 무리 기둥에 더해진다 ----
function gainEnl(v,why){v=Math.round(v*100)/100;if(!(v>0))return;P.enl=Math.round(((P.enl||0)+v)*100)/100;addText(P.x,P.y-.6,`깨달음 +${v}`,'#e8d08a');if(why)log(`${why} 깨달음 +${v}`,'xp');wallCheck()}

// 명산 정상에서 운기조식: 8초마다 깨달음, 일출이면 두 배. 산마다 한도가 있고 이름난 산은 더 크다
const FAMOUS_PEAK=/^(태산|화산|아미산|숭산|황산|무당산|곤륜산|천산|형산|청성산|종남산)$/;
const PEAK_MSG={태산:'태산 꼭대기에서 천하를 굽어보니 마음이 넓어진다.',화산:'낙안봉의 바람 속에서 검의 길이 보인다.',아미산:'금정의 구름바다에 마음이 고요해진다.',숭산:'달마가 면벽하던 산의 기운이 스민다.'};
function peakTick(dt){const R=REGIONS[REG];if(!P.medit||!R||!R.lm||R.lm.t!=='m'||P.y>9.5){P.peakT=0;return}
  P.peakT=(P.peakT||0)+dt;if(P.peakT<8)return;P.peakT=0;
  P.peaks=P.peaks||{};const cap=FAMOUS_PEAK.test(R.name)?2:1,got=P.peaks[REG]||0;
  if(got>=cap){if(!P.peakFull||P.peakFull!==REG){P.peakFull=REG;log(`${R.name} 정상에서 얻을 깨달음은 이미 다 얻었습니다.`,'info')}return}
  const dawn=tod>.18&&tod<.3,v=Math.round(Math.min(cap-got,dawn?.2:.1)*100)/100;P.peaks[REG]=Math.round((got+v)*100)/100;
  gainEnl(v,got===0?(PEAK_MSG[R.name]||`${R.name} 정상의 운무 속에서 천지의 이치를 엿본다.`)+(dawn?' 일출이 장엄하다.':''):'')}

// ---- 경지가 오를 때 한 번만 받는 것 (예전 저장은 불러올 때 채운다) ----
function realmGain(r){P.rfx=P.rfx||{};if(P.rfx[r])return;P.rfx[r]=1;
  if(school()==='도가'&&r>0)P.life+=2;
  if(r===5){const c=SC();P.life+=c.l5;for(const{k}of STATS){P.st[k]+=c.st[k];P.base[k]+=c.st[k]}P.inj=0;P.injS=0;log(`환골탈태: 탁한 기운이 빠져나가고 뼈와 살이 새로 태어났습니다. ${stTxt(c.st)}${c.l5?`, 수명 +${c.l5}년`:''}.`,'xp')}
  if(r===6){const c=SC();P.life+=c.l6;if(c.l6)log(`반로환동: 늙은 몸이 다시 젊어집니다. 수명 +${c.l6}년.`,'xp')}
  if(r>0)log(`${rk(r)}: ${fxOf(r).n}. ${fxOf(r).d}`,'xp');recalc()}
function realmFxSync(){P.rfx=P.rfx||{};for(let r=1;r<=realmIdx();r++)if(!P.rfx[r])realmGain(r)}

// ---- 전투: 검기·검강·검사, 호신강기, 이기어검 ----
hook('hit',c=>{const r=realmIdx();
  if(r>=4)c.m*=1.25;else if(r>=2)c.m*=1.1;if(r>=6&&time-(P.ultT??-9)<2.5)c.m*=1+SC().ult;
  if(sig('마공')&&P.hp<P.maxHp*.3)c.m*=1.25;
  if(r>=2)c.def=Math.round(c.def*.5)});
hook('hitDone',c=>{const r=realmIdx(),e=c.e;if(e.hp>=c.hp0)return;
  if(sig('사불'))P.hp=Math.min(P.maxHp,P.hp+(c.hp0-Math.max(0,e.hp))*.06);if(sig('사공'))e.slow=Math.max(e.slow||0,2);
  if(r>=2)fParts(null,e,r>=4?'255,230,140':'150,210,255',r>=4?6:3,60,'dot',.35);
  if(r>=3&&Math.random()<.2){const o=mobs.find(q=>q!==e&&q.hp>0&&!q.d.villager&&!peaceful(q)&&dist(q,P)<4&&(q.aggro||q.d.hostile));
    if(o){damage(o,Math.max(1,Math.round(atk()*.4)),0,0,P);GL({t:'line',x:P.x,y:P.y,ex:o.x,ey:o.y,w:2,life:.25,col:'200,230,255'})}}});
hook('hurt',c=>{const r=realmIdx(),src=c.src;
  if(src.d&&r>=4&&mobRealm(src)<=r-2){c.dm*=.2;if(time-(P.hsT||-9)>1.2){P.hsT=time;addText(P.x,P.y-.4,'호신강기','#ffe7a0')}}
  if(src.d&&school()==='불가'&&(src.d.fac==='사'||src.d.fac==='마'))c.dm*=.85;
  if(src.d&&school()==='사불'&&src.d.fac==='정')c.dm*=.85;
  if(sig('불가'))c.dm*=.9});
hook('hurtDone',c=>{const src=c.src;if(sig('도가')&&src.isMob&&src.hp>0&&P.hp<c.hp0)damage(src,Math.max(1,Math.round((c.hp0-Math.max(0,P.hp))*.15)),0,0,P)});
{const _rc=recalc;recalc=function(){_rc();if(!P)return;const m=danMul();if(m!==1){P.maxQi=Math.round(P.maxQi*m);P.qi=Math.min(P.qi,P.maxQi)}}}

// ---- 경지 차이 체감: 두 단계 아래 하수는 겁먹고 달아난다 (정종의 화경 반박귀진만 기운이 숨어 덤빈다) ----
{const _um=updateMob;updateMob=function(e,dt){
  if(e.hp>0&&!e.aggro&&!e.cowed&&e.d.hostile&&!e.d.boss&&!e.duel&&!e.tomb&&!e.tombGuard&&P.hp>0){const r=realmIdx();
    if(r>=2&&!sig('정종')&&mobRealm(e)<=r-2&&dist(e,P)<(e.d.aggro||6)){e.cowed=1;e.flee=5;e.fleeFrom=P;addText(e.x,e.y,'겁먹음','#c8c0a8');
      if(time-(P.cowT||-99)>20){P.cowT=time;log(`${e.name}이(가) 기세에 눌려 달아납니다.`,'info')}}}
  return _um(e,dt)}}
// 노린 상대의 기도를 가늠한다
function senseText(e){const d=mobRealm(e)-realmIdx();return d<=-2?'하수다':d<0?'한 수 아래':d===0?'만만치 않은 기도':d===1?'기도가 범상치 않다':'바닥이 보이지 않는다'}
function senseTick(){const t=P.target;if(t===P.senseOf)return;P.senseOf=t;if(!t||t.hp<=0||t.d.villager||t.d.passive)return;
  const d=mobRealm(t)-realmIdx();addText(t.x,t.y-.8,senseText(t),d>=1?'#f0968a':d<=-2?'#9a8d72':'#e8d9a8')}

// ---- 깨달음 계기: 비무, 고수 처치, 돈오, 기연 ----
{const _de=duelEnd;duelEnd=function(win,e){const o=DUELISTS[P.duel],r=o?(o.realm??mobRealm({atk:o.atk,d:{}})):0,me=realmIdx();_de(win,e);
  if(o&&r>me)gainEnl(win?1.5:1,win?`자기보다 높은 ${RANKS[r]}의 고수를 꺾으며`:`${RANKS[r]}의 고수와 겨루며 한 수 배웠다.`)}}
{const _ok=onKill;onKill=function(e){const up=!e.duel&&!e.d.villager&&!e.d.passive&&mobRealm(e)>realmIdx();_ok(e);if(up)gainEnl(e.d.boss?.5:.15,e.d.boss?`${e.name}과의 사투에서`:'')}}
{const _gm=gainMast;gainMast=function(id,v){const s=A(id),b=s?s.p:100;const r=_gm(id,v);if(s&&b<100&&s.p>=100)gainEnl(1.5,`${ARTS[id].n} 돈오:`);return r}}
{const _gy=giyeon;giyeon=function(src){const R=REGIONS[REG];
  if(R&&R.lm&&R.lm.t==='m'&&!P.gcs&&Math.random()<.3){addMat('공청석유');P.feats.push(`${Math.floor(P.age)}세에 ${R.name}에서 공청석유를 얻었다`);showBanner('공청석유','석실 천장에서 떨어지는 만년의 정수');log('기연: 석실 천장에서 떨어지는 공청석유를 얻었습니다. 먹으면 내공 1갑자가 늘어납니다.','xp');fx.push({t:'lvl',x:P.x,y:P.y,life:1.6});return}
  _gy(src);gainEnl(.5,'기연 속에서 전대 고수의 무리를 엿보았다.')}}

// ---- 영약: 공청석유(1갑자, 한 생에 한 번), 만년설삼(반 갑자, 한 생에 두 번) ----
Object.assign(CONSUME,{공청석유:{d:'내공 1갑자(+120). 한 생에 한 번'},만년설삼:{d:'내공 반 갑자(+60). 한 생에 두 번'}});
Object.assign(MAT_PRICE,{공청석유:900,만년설삼:400});
{const _uc=useCon;useCon=function(k){
  if(k!=='공청석유'&&k!=='만년설삼')return _uc(k);
  if(!(P.mats[k]>0)){log(`${k}이(가) 없습니다.`,'info');return}if(P.hp<=0)return;
  if(k==='공청석유'){if(P.gcs){log('공청석유는 한 생에 한 번만 효험이 있습니다.','info');return}P.gcs=1;P.qiBonus+=120}
  else{if((P.mss||0)>=2){log('만년설삼은 한 생에 두 번까지만 효험이 있습니다.','info');return}P.mss=(P.mss||0)+1;P.qiBonus+=60}
  P.mats[k]--;recalc();P.qi=P.maxQi;fx.push({t:'lvl',x:P.x,y:P.y,life:1.4});addText(P.x,P.y,`내공 +${k==='공청석유'?'1갑자':'반 갑자'}`,'#9db8e0');
  log(`${k}을(를) 먹고 운기하니 내공이 ${k==='공청석유'?'1갑자':'반 갑자'} 늘었습니다. (${gapja(baseQi())})`,'xp');wallCheck();renderOpen()}}
// 눈 덮인 산 맵의 약초밭에서 드물게 만년설삼
function snowSam(){const R=REGIONS[REG];if(R&&R.lm&&R.theme==='snow'&&Math.random()<.04){addMat('만년설삼',1);log('눈 속에서 만년설삼을 캤습니다!','xp');showBanner('만년설삼','내공 반 갑자')}}

// ---- 내공 수련 한 번: 심법 계열을 탄다 ----
function qiTrained(){const s=school();
  if(s==='사공'||s==='사불'){P.qiX=(P.qiX||0)+Math.round(SIDES[P.side].gain*.15*10)/10;recalc()}
  if(s==='마공'){const x=Math.round(SIDES[P.side].gain*.25*10)/10;P.qiX=(P.qiX||0)+x;P.evil+=1;recalc();if(!P.mgT||time-P.mgT>30){P.mgT=time;log(`마공의 기운이 거칠게 몰아쳐 내공이 ${x} 더 쌓였지만 악업도 쌓입니다.`,'info')}}
  wallCheck()}

// ---- 폐관·주화입마를 심법 계열에 맞춘다 ----
{const _pc=pgChance;pgChance=function(pill){let c=_pc(pill);if(P.side==='사')c+=.05;const s=school();c+=s==='마공'?-.1:s==='사공'?-.05:s==='도가'||s==='불가'?.05:0;return clamp(c,.05,.95)}}
{const _qd=qiDeviation;qiDeviation=function(r){const s=school(),rnd=Math.random;
  // 마공은 무겁게(45%), 사공은 조금 무겁게(35%), 도가는 가볍게(20%): 무거움 경계(0.3)에 맞춰 뽑은 값을 옮긴다
  if(s==='마공'||s==='사공'||s==='도가'){const f=s==='마공'?.45:s==='사공'?.35:.2;let first=true;Math.random=()=>{const v=rnd();if(!first)return v;first=false;
      const death=r>=4?.05:0;if(v<death)return v;const u=(v-death)/(1-death),heavy=u<f;return death+(heavy?u/f*(.3-death):(.3+(u-f)/(1-f)*.7))};}
  try{_qd(r)}finally{Math.random=rnd}
  if(P.qiX)P.qiX=Math.round(P.qiX*.85*10)/10;recalc()}}
{const _pf=pgFinish;pgFinish=function(pill){const r0=realmIdx();_pf(pill);if(P&&realmIdx()>r0)realmGain(realmIdx())}}

// ---- 매 프레임 ----
{const _tt=trainTick;trainTick=function(dt){const r=_tt(dt);if(P&&playing&&P.hp>0){peakTick(dt);senseTick()}return r}}
// 새 생 (예전 저장 옮기기는 g_save.js)
{const _nl=newLife;newLife=function(o){_nl(o);P.enl=0;P.peaks={};P.rfx={};P.qiX=0;P.gcs=0;P.mss=0}}

// ---- 인물창 경지 카드에 덧붙인다 ----
{const _rcd=realmCard;realmCard=function(c){const h=_rcd(c),ri=realmIdx(),s=school();
  const ladder=REALM_FX.map((_,i)=>fxOf(i)).map((f,i)=>`<div class="it"><div>${i<=ri?'<b class="good">●</b>':'<span class="dim">○</span>'} ${rk(i)} · <b${i<=ri?' class="gold"':''}>${f.n}</b><span>${f.d}</span></div><div class="ib"></div></div>`).join('');
  const extra=`<p>내공 <b class="gold">${gapja(baseQi())}</b> (${baseQi()}) · ${danName()} · 심법 계열 <b class="gold">${s}</b> <small class="dim">${SCHOOL[s].d}</small></p>
    <p>깨달음 <b class="gold">${P.enl||0}</b> <small class="dim">명산 정상 운기조식(일출이면 두 배), 높은 경지의 고수와 비무·사투, 돈오, 기연으로 쌓여 무리에 더해진다</small></p>
    <details><summary>경지의 길</summary><div class="list">${ladder}</div></details>`;
  return h.replace('<div class="list">',extra+'<div class="list">')}}

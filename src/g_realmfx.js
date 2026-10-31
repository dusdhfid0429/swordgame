// ================= 경지의 효과, 깨달음, 갑자·영약·심법 계열·단전 =================
// 사용자 결정(2026-10-09): 경지 제안서(/mnt/project-files/docs/경지_내공_제안.md)의 2·4·5번. 윤회 때의 전승(내공 전수·생사경)은 지금대로 두었다.
// 설계: docs/경지_설계.md 2장 이후

// ---- 상대의 경지: 공격력으로 가늠한다 (보스는 한 단계 위) ----
const MOB_RT=GD.MOB_RT;
function mobRealm(e){if(!e||!e.d)return 0;if(e.realm!=null)return e.realm;let r=0;for(const v of MOB_RT)if((e.atk||0)>=v)r++;return Math.min(6,r+(e.d.boss?1:0))}

// ---- 경지마다 열리는 것 ----
const REALM_FX=GD.REALM_FX;
// 화경·현경은 심법 계열마다 이름·수치·고유 특성이 다르다 (사용자 결정 2026-10-09: 계열의 특징은 살리되 비슷한 경지끼리 밸런스를 맞춘다)
// 밸런스 점수: 최대 내공 10% = 1, 기본기 1 = 1, 수명 5년 = 1, 필살기 10% = 1. 화경은 모두 13점, 현경은 모두 7점에 고유 특성 하나.
//  q: 상단전이 열려 늘어나는 최대 내공(중단전 15% 대신), st: 환골탈태로 오르는 기본기, l5/l6: 수명, ult: 현경 필살기 위력
const SUMMIT=GD.SUMMIT;
const SC=()=>SUMMIT[school()];
const summit=i=>SC().r[i-5];
function rk(i){return i>=5&&i<=6&&P?summit(i).r:RANKS[i]}
const stTxt=st=>STATS.map(({k,n})=>`${n} +${st[k]}`).join(', ');
function fxOf(i){if(i<5||i>6)return REALM_FX[i];   // 생사경·자연경은 계열과 상관없다 (g_beyond.js)
const c=SC(),s=summit(i);
  return i===5?{n:`${s.n} · 환골탈태`,d:`${s.d}. 상단전이 열려 최대 내공 +${Math.round(c.q*100)}%, ${stTxt(c.st)}${c.l5?`, 수명 +${c.l5}년`:''}`}
    :{n:`반로환동 · ${s.n}`,d:`${s.d}: 필살기 위력 +${Math.round(c.ult*100)}%${c.l6?`, 수명 +${c.l6}년`:''}, 몸이 ${BODY.ban.to}세까지 젊어진다`}}
const sig=k=>realmIdx()>=5&&school()===k;
const realmAt=r=>realmIdx()>=r;
// 단전: 하단전 → 중단전(절정) → 상단전(화경)
const danName=()=>realmAt(5)?'상단전':realmAt(3)?'중단전':'하단전';
const danMul=()=>realmAt(5)?1+SC().q:realmAt(3)?1.15:1;
function realmQiMul(){return(realmAt(1)?1.3:1)*(realmAt(8)?GD.BEYOND.jayeon.medit:1)}   // 자연경: 운기조식 회복 두 배

// ---- 심법 계열: 문파를 따르고, 문파가 없으면 타고난 기초 내공(정파 대반야금강공=불가, 사파 혈라공=사공) ----
// 사용자 결정(2026-10-09): 사파(사천맹) 문파는 모두 사공, 마공은 마교(천마신교)만.
// 포달랍궁·대뢰음사는 불교로 두되 사공으로 변질된 불교(사불, 밀교 비술)로 따로 둔다
const SCHOOL_OF=GD.SCHOOL_OF;
const SCHOOL=GD.SCHOOL;
function school(){const s=P.sect&&P.sect!=='own'?P.sect:null;
  if(s){for(const[k,l]of Object.entries(SCHOOL_OF))if(l.includes(s))return k;return SECTS[s]&&SECTS[s].al==='sacheon'?'사공':'정종'}
  return P.side==='사'?'사공':'불가'}

// ---- 갑자: 120 내공 = 1갑자(60년 공력) ----
const GAPJA=120;
function gapja(q){const y=Math.round(q/GAPJA*60);if(q<GAPJA*.5)return`${y}년 공력`;const n=Math.floor(q/GAPJA),h=q/GAPJA-n>=.5;
  return n?`${n}갑자${h?' 반':''}`:'반 갑자'}

// ---- 깨달음: 무리 기둥에 더해진다 ----
function gainEnl(v,why){if(typeof enlMul==='function')v*=enlMul();v=Math.round(v*100)/100;if(!(v>0))return;P.enl=Math.round(((P.enl||0)+v)*100)/100;addText(P.x,P.y-.6,`깨달음 +${v}`,'#e8d08a');if(why)log(`${why} 깨달음 +${v}`,'xp');wallCheck()}

// 명산 정상에서 운기조식: 8초마다 깨달음, 일출이면 두 배. 산마다 한도가 있고 이름난 산은 더 크다
const FAMOUS_PEAK=/^(태산|화산|아미산|숭산|황산|무당산|곤륜산|천산|형산|청성산|종남산)$/;
const PEAK_MSG=GD.PEAK_MSG;
function peakTick(dt){const R=REGIONS[REG];if(!P.medit||!R||!R.lm||R.lm.t!=='m'||P.y>9.5){P.peakT=0;return}
  P.peakT=(P.peakT||0)+dt;if(P.peakT<8)return;P.peakT=0;
  P.peaks=P.peaks||{};const cap=FAMOUS_PEAK.test(R.name)?2:1,got=P.peaks[REG]||0;
  if(got>=cap){if(!P.peakFull||P.peakFull!==REG){P.peakFull=REG;log(`${R.name} 정상에서 얻을 깨달음은 이미 다 얻었습니다.`,'info')}return}
  const dawn=tod>.18&&tod<.3,v=Math.round(Math.min(cap-got,dawn?.2:.1)*100)/100;P.peaks[REG]=Math.round((got+v)*100)/100;
  gainEnl(v,got===0?(PEAK_MSG[R.name]||`${R.name} 정상의 운무 속에서 천지의 이치를 엿본다.`)+(dawn?' 일출이 장엄하다.':''):'')}

// ---- 경지가 오를 때 한 번만 받는 것 (예전 저장은 불러올 때 채운다) ----
function realmGain(r){P.rfx=P.rfx||{};if(P.rfx[r])return;P.rfx[r]=1;rankRealmUp(r);
  if(school()==='도가'&&r>0)P.life+=2;
  // 환골탈태·반로환동·금강불괴는 g_body.js (v151): 영약으로 먼저 환골탈태했으면 화경에서는 상단전만 열린다
  if(r===BODY.hg.minR)elixirBody();
  if(r===5&&!hwangol('화경'))log('이미 환골탈태한 몸이라 화경에서는 상단전만 새로 열립니다.','info');
  if(r===6){const c=SC();P.life+=c.l6;if(c.l6)log(`현경: 수명 +${c.l6}년.`,'xp');banro()}
  if(r>=7)beyondGain(r);
  if(r>0)log(`${rk(r)}: ${fxOf(r).n}. ${fxOf(r).d}`,'xp');if(typeof bladeGain==='function')bladeGain(r);recalc();gangCheck()}
function realmFxSync(){P.rfx=P.rfx||{};for(let r=1;r<=realmIdx();r++)if(!P.rfx[r])realmGain(r);bodySync()}

// ---- 전투: 검기·검강·검사, 호신강기, 이기어검 (화경부터의 검환·어검술·심검·무형검은 g_blade.js, 검사의 기 실은 거기서 끝난다) ----
hook('hit',c=>{const r=realmIdx();
  if(r>=4)c.m*=1.25;else if(r>=2)c.m*=1.1;if(r>=6&&time-(P.ultT??-9)<2.5)c.m*=1+SC().ult;
  if(sig('마공')&&P.hp<P.maxHp*.3)c.m*=1.25;
  if(r>=2)c.def=Math.round(c.def*.5)});
hook('hitDone',c=>{const r=realmIdx(),e=c.e;if(e.hp>=c.hp0)return;
  if(sig('사불'))P.hp=Math.min(P.maxHp,P.hp+(c.hp0-Math.max(0,e.hp))*.06);if(sig('사공'))e.slow=Math.max(e.slow||0,2);
  if(c.X&&c.X.bare)return;   // v214: 내공이 바닥난 맨 공격에는 검기·검사·검강도, 검사의 기 실은 곁가지 일격도 없다 (g_bare.js)
  // v136 (사용자): 세 단계가 서로 달라 보이게. 검기=푸른 날 기운, 검사=은빛 실, 검강=금빛 강기 충격
  if(r>=4){fParts(null,e,RFX_COL.gang,8,80,'dot',.4);GL({t:'ring2',x:e.x,y:e.y,r:.75,col:RFX_COL.gang,w:4,life:.3})}
  else if(r===3)for(let i=0;i<2;i++)GL({t:'line',x:e.x+(Math.random()-.5)*.8,y:e.y+(Math.random()-.5)*.8,ex:e.x,ey:e.y,w:1,wavy:1,life:.22,col:RFX_COL.sa});
  else if(r===2)fParts(null,e,RFX_COL.gi,4,60,'dot',.35);
  if(r>=3&&r<5&&Math.random()<.2){const o=mobs.find(q=>q!==e&&q.hp>0&&!q.d.villager&&!peaceful(q)&&dist(q,P)<4&&(q.aggro||q.d.hostile));
    if(o){damage(o,Math.max(1,Math.round(atk()*.4)),0,0,P);for(let i=0;i<3;i++)GL({t:'line',x:P.x,y:P.y,ex:o.x+(i-1)*.15,ey:o.y,w:i===1?1.6:.8,wavy:1,life:.3,col:r>=4?RFX_COL.gang:RFX_COL.sa})}}});
// 베기마다: 검기는 칼날 너머로 뻗는 푸른 반달, 검사는 반달 끝에서 뻗는 은빛 실 셋, 검강은 굵고 무거운 금빛 반달 두 겹
const RFX_COL={gi:'140,205,255',sa:'215,245,255',gang:'255,212,105'};
// v211: 찌르기·주먹(o.t 'thrust')은 같은 세 단계를 곧은 모양으로. 창기=푸른 창끝, 창사=앞으로 곧게 뻗는 은빛 실 셋, 창강=굵은 금빛 창끝 두 겹 / 권기=푸른 기 덩어리, 권풍=밀려 나가는 바람 고리, 권강=금빛 기 덩어리 두 겹
hook('slashFx',o=>{const r=realmIdx();if(r<2)return;const L=o.life,arc=(k)=>fx.push({...o,glow:true,el:false,max:L*(k.l||1),life:L*(k.l||1),st:null,...k});
  if(o.t==='thrust'){if(r>=4){if(r<7){arc({col:RFX_COL.gang,r:o.r*1.06,w:o.w*2.4,dim:.9,l:1.15});arc({col:'255,250,225',r:o.r*1.02,w:o.w,dim:.95})}return}
    arc({col:RFX_COL.gi,r:o.r*1.06,w:o.w*.9,dim:.75,l:1.1});
    if(r===3){if(o.mo==='punch')arc({mo:'gust',col:RFX_COL.sa,w:o.w,dim:.85,l:1.6});   // 권풍 고리도 주먹이 닿는 데서 멈춘다 (THR.gust)

      else{const a0=Math.atan2(P.fy,P.fx);for(const d of[-.12,0,.12]){const a=a0+d,L2=o.r*1.25;GL({t:'line',x:P.x,y:P.y,ex:P.x+Math.cos(a)*L2,ey:P.y+Math.sin(a)*L2,w:.9,life:.28,col:RFX_COL.sa})}}}
    return}
  if(r>=4){if(r<7){arc({col:RFX_COL.gang,r:o.r*1.06,w:o.w*2.6,spread:o.spread*1.15,dim:.9,l:1.15});arc({col:'255,250,225',r:o.r*1.02,w:o.w*1,spread:o.spread*1.05,dim:.95})}return}   // 심검·무형검은 강기를 드러내지 않는다 (g_blade.js)
  arc({col:RFX_COL.gi,r:o.r*1.06,w:o.w*.9,spread:o.spread*1.1,dim:.75,l:1.1});   // v212: 기운도 병기 사거리 안 (예전 1.35배는 사거리 밖까지 뻗었다)
  if(r===3){const a0=Math.atan2(P.fy,P.fx);for(const d of[-.5,0,.5]){const a=a0+d*o.spread*.6,L2=o.r*1.25;GL({t:'line',x:P.x,y:P.y,ex:P.x+Math.cos(a)*L2,ey:P.y+Math.sin(a)*L2,w:.9,wavy:1,life:.28,col:RFX_COL.sa})}}});
hook('hurt',c=>{const r=realmIdx(),src=c.src;
  if(src.d&&r>=4&&mobRealm(src)<=r-2){c.dm*=.2;if(time-(P.hsT||-9)>1.2){P.hsT=time;addText(P.x,P.y-.4,'호신강기','#ffe7a0')}}
  if(src.d&&school()==='불가'&&(src.d.fac==='사'||src.d.fac==='마'))c.dm*=.85;
  if(src.d&&school()==='사불'&&src.d.fac==='정')c.dm*=.85;
  /* 불가 화경의 금강불괴(받는 피해 -10%)는 g_body.js 의 금강불괴지신(-15%, 등 뒤 조문)이 맡는다 */});
hook('hurtDone',c=>{const src=c.src;if(sig('도가')&&src.isMob&&src.hp>0&&P.hp<c.hp0)damage(src,Math.max(1,Math.round((c.hp0-Math.max(0,P.hp))*.15)),0,0,P)});
hook('recalc',()=>{const m=danMul();if(m!==1){P.maxQi=Math.round(P.maxQi*m);P.qi=Math.min(P.qi,P.maxQi)}});

// ---- 경지 차이 체감: 두 단계 아래 하수는 겁먹고 달아난다 (정종의 화경 반박귀진만 기운이 숨어 덤빈다) ----
// 플레이어에게 덤빌 몹만 겁먹는다: 같은 편 세력 무인(결전장 아군·순찰조·당원·문지기)은 d.hostile이어도 달아나지 않는다 (사용자 2026-10-25 '아군도 도망가')
hook('mobTick',e=>{
  if(e.hp>0&&!e.aggro&&!e.cowed&&(e.d.fac?mobFoeP(e):e.d.hostile)&&!e.warAlly&&!e.d.boss&&!e.duel&&!e.tomb&&!e.tombGuard&&P.hp>0){const r=realmIdx();
    if(r>=2&&!sig('정종')&&mobRealm(e)<=r-2&&dist(e,P)<(e.d.aggro||6)){e.cowed=1;e.flee=5;e.fleeFrom=P;addText(e.x,e.y,'겁먹음','#c8c0a8');
      if(time-(P.cowT||-99)>20){P.cowT=time;log(`${e.name}이(가) 기세에 눌려 달아납니다.`,'info')}}}});
// 노린 상대의 기도를 가늠한다
function senseText(e){const d=mobRealm(e)-realmIdx();return d<=-2?'하수다':d<0?'한 수 아래':d===0?'만만치 않은 기도':d===1?'기도가 범상치 않다':'바닥이 보이지 않는다'}
function senseTick(){const t=P.target;if(t===P.senseOf)return;P.senseOf=t;if(!t||t.hp<=0||t.d.villager||t.d.passive)return;
  const d=mobRealm(t)-realmIdx();addText(t.x,t.y-.8,senseText(t),d>=1?'#f0968a':d<=-2?'#9a8d72':'#e8d9a8')}

// ---- 깨달음 계기: 비무, 고수 처치, 돈오, 기연 ----
hook('duelEnd',({win,o,me})=>{const r=o?(o.realm??mobRealm({atk:o.atk,d:{}})):0;
  if(o&&r>me)gainEnl(win?1.5:1,win?`자기보다 높은 ${RANKS[r]}의 고수를 꺾으며`:`${RANKS[r]}의 고수와 겨루며 한 수 배웠다.`)});
hook('kill',e=>{if(!e.duel&&!e.d.villager&&!e.d.passive&&mobRealm(e)>realmIdx())gainEnl(e.d.boss?.5:.15,e.d.boss?`${e.name}과의 사투에서`:'')});
hook('mastDone',({id,s,before})=>{if(before<100&&s.p>=100)gainEnl(1.5,`${ARTS[id].n} 돈오:`)});
hook('giyeon',c=>{const R=REGIONS[REG];
  if(R&&R.lm&&R.lm.t==='m'&&!P.gcs&&Math.random()<.3){c.done=true;addMat('공청석유');feat(`${R.name}에서 공청석유를 얻었다`);showBanner('공청석유','석실 천장에서 떨어지는 만년의 정수');log('기연: 석실 천장에서 떨어지는 공청석유를 얻었습니다. 먹으면 내공 1갑자가 늘어납니다.','xp');fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1.6})}});
hook('giyeonDone',()=>gainEnl(.5,'기연 속에서 전대 고수의 무리를 엿보았다.'));

// ---- 영약: 공청석유(1갑자, 한 생에 한 번), 만년설삼(반 갑자, 한 생에 두 번) ----
/* CONSUME에 덧붙이던 것은 data/economy.json 으로 옮김 */
/* MAT_PRICE에 덧붙이던 것은 data/economy.json 으로 옮김 */
hook('useCon',c=>{const k=c.k;
  if(k!=='공청석유'&&k!=='만년설삼')return;c.done=true;
  if(!(P.mats[k]>0)){log(`${k}이(가) 없습니다.`,'info');return}if(P.hp<=0)return;
  if(k==='공청석유'){if(P.gcs){log('공청석유는 한 생에 한 번만 효험이 있습니다.','info');return}P.gcs=1;P.qiBonus+=120}
  else{if((P.mss||0)>=2){log('만년설삼은 한 생에 두 번까지만 효험이 있습니다.','info');return}P.mss=(P.mss||0)+1;P.qiBonus+=60}
  P.mats[k]--;recalc();P.qi=P.maxQi;fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1.4});addText(P.x,P.y,`내공 +${k==='공청석유'?'1갑자':'반 갑자'}`,'#9db8e0');
  log(`${k}을(를) 먹고 운기하니 내공이 ${k==='공청석유'?'1갑자':'반 갑자'} 늘었습니다. (${gapja(baseQi())})`,'xp');elixirBody();wallCheck();renderOpen()});
// 눈 덮인 산 맵의 약초밭에서 드물게 만년설삼
function snowSam(){const R=REGIONS[REG];if(R&&R.lm&&R.theme==='snow'&&Math.random()<.04){addMat('만년설삼',1);log('눈 속에서 만년설삼을 캤습니다!','xp');showBanner('만년설삼','내공 반 갑자')}}

// ---- 내공 수련 한 번: 심법 계열을 탄다 ----
function qiTrained(){const s=typeof pSchool==='function'?pSchool():school();   // 운용 중인 심법의 계열 (사공→정종 전향이 되게)
  if(s==='사공'||s==='사불'){const f=qiWallMul(s),x=Math.round(qiGain()*f*10)/10;P.qiX=(P.qiX||0)+x;recalc();
    if(f<0&&(!P.qwT||time-P.qwT>30)){P.qwT=time;log(`${s}의 한계: ${RANKS[QI_WALL.hiR]}부터는 수련마다 내공이 ${Math.abs(x)} 덜 쌓입니다. 정종 심법으로 바꾸거나 대문파의 상승 심법을 받아야 길이 넓어집니다.`,'info')}}
  if(s==='마공'){const x=Math.round(qiGain()*.25*10)/10;P.qiX=(P.qiX||0)+x;P.evil+=1;recalc();if(typeof maraAdd==='function')maraAdd(MARA.train,'수련');if(!P.mgT||time-P.mgT>30){P.mgT=time;log(`마공의 기운이 거칠게 몰아쳐 내공이 ${x} 더 쌓였지만 악업도 쌓입니다.`,'info')}}
  wallCheck()}

// ---- 폐관·주화입마를 심법 계열에 맞춘다 ----
// 폐관 성공률 보정 (예전 사파 -5%는 이 표가 대신한다)과 무거운 주화입마의 몫. g_realm.js의 pgChance·qiDeviation이 읽는다
const PG_SCHOOL=GD.PG_SCHOOL;
const DEV_HEAVY=GD.DEV_HEAVY;
// ---- 사공의 한계 (2026-10-15 v105, docs/마교_심화_기획.md §5) ----
// 무협 관례 "사파는 절정 직전까지 빠르고 그 뒤는 애매하다": 사공은 일류까지 수련 내공 +30%, 초절정부터 -30% (대문파 상승 심법 운용 중 -15%), 절정 벽 -5%·초절정 이후 벽 -20%.
// 사불은 불가의 안정이 절반을 상쇄(+15% / -15%, 초절정 이후 벽 -10%). 표는 data/realm.json QI_WALL·PG_SCHOOL_R. 경지 색인은 다음 경지(r)로 읽는다
const PG_SCHOOL_R=GD.PG_SCHOOL_R||{},QI_WALL=GD.QI_WALL||{hiR:4};
const saBig=()=>{const s=P&&P.sim&&SIM[P.sim];return !!(s&&s.sect&&SECTS[s.sect]&&SECTS[s.sect].tier==='big'&&s.g>=2)};
function pgSchoolAdj(r){const s=typeof pSchool==='function'?pSchool():school(),t=PG_SCHOOL_R[s];let v=t?(t[r]??0):(PG_SCHOOL[s]||0);if(s==='사공'&&saBig())v/=2;return v}
function qiWallMul(s){const w=QI_WALL[s];if(!w)return 0;if(realmIdx()<QI_WALL.hiR)return w.lo;return s==='사공'&&saBig()?w.big:w.hi}

// ---- 매 프레임 ----
hook('trainTick',dt=>{if(P&&playing&&P.hp>0){peakTick(dt);senseTick()}});

// ---- 인물창 경지 카드에 덧붙인다 ----
function realmCardExtra(){const ri=realmIdx(),s=school();
  const ladder=REALM_FX.map((_,i)=>fxOf(i)).map((f,i)=>`<div class="it"><div>${i<=ri?'<b class="good">●</b>':'<span class="dim">○</span>'} ${rk(i)} · <b${i<=ri?' class="gold"':''}>${f.n}</b><span>${f.d}</span></div><div class="ib"></div></div>`).join('');
  const extra=`<p>내공 <b class="gold">${gapja(baseQi())}</b> (${baseQi()}) · ${danName()} · 심법 계열 <b class="gold">${s}</b> <small class="dim">${SCHOOL[s].d}</small></p>
    <p>깨달음 <b class="gold">${P.enl||0}</b> <small class="dim">명산 정상 운기조식(일출이면 두 배), 높은 경지의 고수와 비무·사투, 돈오, 기연으로 쌓여 무리에 더해진다</small></p>
    ${typeof bladeHtml==='function'?bladeHtml():''}<details><summary>경지의 길</summary><div class="list">${ladder}</div></details>${bodyHtml()}`;
  return extra}

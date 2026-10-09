// ================= 경지: 세 기둥과 벽, 폐관수련, 주화입마 =================
// 사용자 결정(2026-10-09): 경지는 내공만으로 오르지 않는다. 활력으로 다진 스탯의 합(외공), 내공, 무공 숙련의 합(무리)이
// 함께 다음 경지 문턱에 닿으면 "벽"에 막히고, 안전한 곳에서 폐관수련으로 벽을 깨야 오른다. 실패하면 주화입마.
// 설계: docs/경지_설계.md
const PILLARS=[{k:'oe',n:'외공',d:'근력·지구력·민첩력·본원진기의 합',lack:'몸이 기를 감당하지 못한다'},
  {k:'ne',n:'내공',d:'단전에 쌓인 기',lack:'단전의 기가 얕다'},
  {k:'mu',n:'무리',d:'익힌 무공의 경지 합',lack:'무리에 대한 깨달음이 부족하다'}];
const REALM_NEED={oe:[0,42,54,68,84,102,122],ne:REALM_QI,mu:[0,3,7,12,18,26,36]};
// 무공 하나의 깨달음: 입문 1·소성 2·대성 3·극성 4·돈오(숙련 100) 6, 등급(하승~천고)이 높을수록 무겁다. 기본 무공은 절반.
const MU_W=[1,1.2,1.5,1.8,2];
const artMu=id=>{const s=A(id);if(!s)return 0;const t=s.p>=100?6:tierOf(s.p)+1;return t*(id==='base'?.5:MU_W[artGrade(id)]||1)};
// 무리에는 깨달음(P.enl, g_realmfx.js)이 더해진다
const pillarVal=k=>k==='oe'?STATS.reduce((a,{k})=>a+P.st[k],0):k==='ne'?baseQi():Math.round((Object.keys(P.arts).reduce((a,id)=>a+artMu(id),0)+(P.enl||0))*10)/10;
// 벽: 세 기둥이 모두 다음 경지 문턱에 닿았는데 경지가 아직 그대로인 상태
const atWall=()=>realmIdx()<RANKS.length-1&&PILLARS.every(({k})=>pillarVal(k)>=REALM_NEED[k][realmIdx()+1]);
const lacking=()=>{const r=realmIdx()+1;if(r>=RANKS.length)return[];return PILLARS.filter(({k})=>pillarVal(k)<REALM_NEED[k][r])};
// 수련 뒤마다 부른다: 처음 벽에 닿으면 한 번 알린다
function wallCheck(){if(!P||!atWall()||P.wallN===realmIdx())return;P.wallN=realmIdx();
  const nx=rk(realmIdx()+1);log(`세 기둥이 ${nx}의 문턱에 닿았지만 벽에 막혔습니다. 안전한 곳에서 폐관수련으로 벽을 깨야 합니다.`,'xp');showBanner('벽에 막히다',`${nx}의 문턱`)}

// ---- 폐관수련 ----
// 자기 문파(본산 맵들), 개봉의 내 집 곁, 산 맵 정상에서만 할 수 있다
function sectRegs(sid){const s=SECTS[sid];if(!s)return[];const id=hqId(s),R=REGIONS[id];return R?(R.chain||[id]).concat(id):[]}
const inOwnSect=()=>!!(P.sect&&P.sect!=='own'&&sectRegs(P.sect).includes(REG));
function pgPlace(){
  if(inOwnSect())return SECTS[P.sect].n+' 후산';
  if(REG==='gaebong'&&G.house&&G.house.built&&dist(houseDoor(),P)<6)return'내 집';
  const R=REGIONS[REG];if(R&&R.lm&&R.lm.t==='m'&&P.y<=9.5)return R.name+' 정상';
  return null}
const pgCost=()=>40+30*realmIdx();
const pgYears=()=>.5+.5*realmIdx();
const hobeop=()=>inOwnSect()||allies.some(a=>a.kind!=='pet'&&a.hp>0);
// 성공률: 다음 경지가 높을수록 낮다. 호법 +10%, 문턱을 20% 넘긴 기둥마다 +5%, 소환단 +10%. 심법 계열에 따른 가감은 g_realmfx.js. 최대 95%
const PG_BASE=[0,.85,.75,.65,.55,.45,.35];
function pgChance(pill){const r=realmIdx()+1;if(r>=RANKS.length)return 0;let c=PG_BASE[r];
  if(hobeop())c+=.1;for(const{k}of PILLARS)if(pillarVal(k)>=REALM_NEED[k][r]*1.2&&REALM_NEED[k][r]>0)c+=.05;
  if(pill)c+=.1;c+=PG_SCHOOL[school()]||0;return clamp(c,.05,.95)}
// 할 수 없는 까닭 (없으면 '')
function pgWhy(){if(realmIdx()>=RANKS.length-1)return'더 오를 경지가 없다';if(!atWall())return'아직 벽에 닿지 않았다';
  if(inCombat())return'싸움 중';if(!pgPlace())return'문파·내 집·산 정상에서만';if(P.inj>0)return'경맥이 아직 상해 있다';
  if(P.vit<pgCost())return`활력 ${pgCost()} 필요`;return''}
function pgRow(){if(!atWall())return'';const why=pgWhy(),r=realmIdx()+1,pill=(P.mats.소환단||0)>0,busy=trnBusy&&trnBusy.k.startsWith('pg');
  return `<div class="trow"><div class="tname"><b>폐관수련</b> <span class="num gold">${rk(r)}</span><small>${pgPlace()||'안전한 곳 필요'} · ${pgYears()}년 · 성공 ${Math.round(pgChance()*100)}%${hobeop()?' · 호법':''}</small></div>
    <button type="button" class="btn tbtn${busy?' busy':''}" data-tr="pg"${why||trnBusy?' disabled':''}>${why||`벽 깨기 · 활력 ${pgCost()}`}<i class="tcd"></i></button>
    ${pill&&!why?`<button type="button" class="btn tbtn" data-tr="pg2"${trnBusy?' disabled':''}>소환단 먹고 · ${Math.round(pgChance(1)*100)}%<i class="tcd"></i></button>`:''}</div>`}
function pgStart(k){
  if(trnBusy||P.hp<=0)return;const why=pgWhy();if(why){log(`폐관수련을 할 수 없습니다: ${why}.`,'info');return}
  P.path=null;P.target=null;P.medit=false;P.chan=null;P.qiTraining=true;
  log(`${pgPlace()}에서 문을 걸어 잠그고 폐관에 들었습니다.`,'sys');trnBusy={k,t:0,dur:TRN_DUR[k]};renderTrain()}
// 폐관을 마친다: 세월이 흐르고, 벽을 깨거나 주화입마에 빠진다
function pgFinish(pill){P.qiTraining=false;const why=pgWhy();if(why){log(`폐관수련이 끊겼습니다: ${why}.`,'info');return}
  const r=realmIdx()+1,ch=pgChance(pill),yrs=pgYears();P.vit-=pgCost();if(pill)P.mats.소환단--;
  P.age+=yrs;G.cal+=yrs;while(Math.floor(P.age)>lastYear){lastYear++;newYear()}if(!playing||P.hp<=0)return;
  if(Math.random()<ch){P.realm=r;P.wallN=null;recalc();P.qi=P.maxQi;P.hp=P.maxHp;fx.push({t:'lvl',x:P.x,y:P.y,life:2});shake=Math.max(shake,.25);
    log(`${yrs}년의 폐관 끝에 벽을 깨고 ${rk(r)}의 경지에 올랐습니다.`,'xp');showBanner('벽을 깨다',`${rk(r)}의 경지`);
    P.feats.push(`${Math.floor(P.age)}세에 폐관수련으로 ${rk(r)}의 경지에 올랐다`);wallCheck();realmGain(r);return}
  qiDeviation(r)}
// 주화입마: 가벼우면 내공 일부를 잃고 경맥이 상한다. 무거우면 기본기도 깎인다. 초절정 이상의 벽에서는 목숨을 잃을 수도 있다.
function qiDeviation(r){const roll=Math.random(),death=r>=4?.05:0;fx.push({t:'ring',x:P.x,y:P.y,life:.6,max:.6,col:'220,60,60'});shake=Math.max(shake,.3);
  if(roll<death){log('기혈이 역류하여 주화입마에 빠졌습니다. 심맥이 끊어졌습니다.','dmg');P.feats.push(`${Math.floor(P.age)}세에 ${rk(r)}의 벽 앞에서 주화입마로 쓰러졌다`);die('주화입마');return}
  // 무거운 주화입마의 몫: 기본 30%(죽음 몫 포함), 마공 45%·사공 35%·도가 20% (죽음을 뺀 나머지 중)
  const f=DEV_HEAVY[school()]??(.3-death)/(1-death),heavy=(roll-death)/(1-death)<f,lost=Math.max(1,Math.ceil(P.qiN*(heavy?.2:.1)));P.qiN=Math.max(0,P.qiN-lost);
  if(P.qiX)P.qiX=Math.round(P.qiX*.85*10)/10;   // 심법이 덧쌓은 내공도 흩어진다
  P.inj=YEAR_SEC*(heavy?1.5:.5);P.injS=heavy?2:1;
  let st='';if(heavy){const ks=STATS.filter(({k})=>P.st[k]>1),s=ks.length?pick(ks):null;if(s){P.st[s.k]--;st=`, ${s.n} -1`}}
  recalc();P.hp=Math.max(1,Math.round(P.hp*.5));P.qi=0;
  const m=`${heavy?'크게 ':''}주화입마에 빠졌습니다. 내공 -${lost*SIDES[P.side].gain}${st}. 경맥이 상해 ${heavy?'한 해 반':'반 년'} 동안 힘을 다 쓰지 못합니다.`;
  log(m,'dmg');showBanner('주화입마',heavy?'경맥이 크게 상했다':'기혈이 뒤틀렸다');P.feats.push(`${Math.floor(P.age)}세에 ${rk(r)}의 벽 앞에서 주화입마에 빠졌다`)}
hook('trainTick',dt=>{
  if(P&&P.inj>0){P.inj=Math.max(0,P.inj-dt);if(P.inj===0){P.injS=0;log('상했던 경맥이 아물었습니다.','sys')}}
  const b=trnBusy;if(b&&b.k.startsWith('pg')){b.t+=dt;const el=TRN.querySelector(`[data-tr="${b.k}"] .tcd`);if(el)el.style.width=Math.min(100,b.t/b.dur*100)+'%';
    if(b.t>=b.dur){trnBusy=null;pgFinish(b.k==='pg2');renderTrain()}}});
hook('mastDone',({s,before})=>{const t=p=>p>=100?4:tierOf(p);if(t(s.p)!==t(before))wallCheck()});
// 인물창의 경지 카드
function realmCard(c){const ri=realmIdx(),r=ri+1,top=r>=RANKS.length,wall=atWall();
  const bars=PILLARS.map(({k,n,d})=>{const v=pillarVal(k),need=top?REALM_NEED[k][ri]:REALM_NEED[k][r],lo=REALM_NEED[k][ri],ok=v>=need;
    const w=top?100:clamp((v-lo)/Math.max(1,need-lo),0,1)*100;
    return `<div class="it"><div>${n} <b class="num ${ok?'good':'gold'}">${v}</b>${top?'':` <small class="dim">/ ${need}</small>`}<span>${d}</span><div class="mbar"><i style="width:${w}%"></i></div></div><div class="ib"></div></div>`}).join('');
  const lk=lacking();
  const msg=top?'무학의 끝에 닿았다.':wall?`<b class="gold">벽에 막혔다.</b> 문파·내 집·산 정상에서 폐관수련으로 ${rk(r)}의 벽을 깨야 한다. 성공 ${Math.round(pgChance()*100)}%`
    :`${rk(r)}에 오르려면: ${lk.map(p=>`<span class="bad">${p.lack}</span>`).join(' · ')}`;
  return `<div class="card"><div class="row2"><h4>경지 ${realmName()}</h4><span class="num tag">${top?'최고 경지':`다음 ${rk(r)}`}</span></div>
    <p class="note">경지는 외공·내공·무리 세 기둥이 함께 차야 오른다. 한쪽만 키우면 벽에 닿지 못한다.</p>
    ${realmCardExtra()}<div class="list">${bars}</div><p>${msg}</p>
    ${P.inj>0?`<p class="bad">주화입마의 후유증: 경맥이 상해 공격력과 내공 회복 -${P.injS>=2?30:15}% (${Math.ceil(P.inj/YEAR_SEC*12)}달 남음)</p>`:''}
    <p>내공 심법 수련 ${P.qiN}회 · 1회 +${SIDES[P.side].gain} · 다음 수련에 활력 ${c}</p>
    <div class="row2"><span class="note">기본기·내공·폐관수련은 수련 창에서 한다.</span>${B('trainwin',wall?'폐관수련하러 (T)':'수련 창에서 수련')}</div></div>`}

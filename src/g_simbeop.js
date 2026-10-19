// ================= 내공 심법: 등급별로 내공 증가량이 다르고, 문파마다 자기 심법이 있다 =================
// 사용자 요청(2026-10-12): "내공심법의 종류도 다양하게. 같은 활력을 소모하지만 내공 증가량에 차이가 있게 등급별 차등. 문파는 자기들만의 내공심법을 보유하고,
//   등급별로 문파의 규모에 따라 최고 등급은 차이가 나게."
// - 등급 하승·중승·상승·절정·천고(AGR). 한 번 수련의 내공 증가 = 타고난 증가(정 10·사 11) × SIM_GQ[등급] (1 / 1.25 / 1.5 / 1.8 / 2.2). 활력 값은 그대로(qiCost).
// - 타고난 심법(대반야금강공·혈라공)은 하승. 개봉 잡화점에서 중승 공용 심법(소주천심법·현음공)을 은자로 산다(자기 성향 것만).
// - 문파 심법: 소문파 중승까지 1개, 중견 상승까지 2개, 대문파(오대세가 포함) 절정까지 3개, 마교 천고까지 4개. 이름은 SIM_NAMES, 없으면 문파 이름으로 짓는다.
//   문파 창에서 공적으로 익힌다(등급마다 직위 SIM_RANK: 중승 2단계 직위, 상승 3단계, 절정 4단계, 천고 5단계).
// - 수련 창에서 익힌 심법 가운데 하나를 운용한다(P.sim). 쌓인 내공은 P.qiAcc 에 적어(예전 저장은 횟수×증가량으로 옮김) 심법을 바꿔도 지난 수련분은 그대로다.
// - 문파 심법 특색(사용자 요청 2026-10-12 "문파별 내공에 특색"): 문파 심법마다 SIM_TRAIT 에 적은 특색(SIM_TK: 금강·반탄·패도·광폭·예기·현묘·회춘·순환·질풍·비상·절약·독기·한기·벽력·흡정·흡혈)이
//   그 심법을 운용하는 동안만 살아난다. 세기 = SIM_TK[k].v × SIM_TQ[등급] (중승 1 / 상승 1.4 / 절정 1.8 / 천고 2.3). 타고난·잡화점 심법은 특색이 없다. 천마신교는 둘(패도+흡혈).
// - 주화입마로 잃는 내공은 지금 운용하는 심법의 증가량 × 잃는 회차. 설계: docs/경지_설계.md 4부. 테스트: tests/t48_simbeop.js
const SIM_EL=GD.SIM_EL,SIM_BASE_EL=GD.SIM_BASE_EL,SIM_SHOP_EL=GD.SIM_SHOP_EL,SCHOOL_FX=GD.SCHOOL_FX,SIM_GQ=GD.SIM_GQ,SIM_TQ=GD.SIM_TQ,SIM_TK=GD.SIM_TK,SIM_TRAIT=GD.SIM_TRAIT,SIM_TDEF=GD.SIM_TDEF,SIM_TOP=GD.SIM_TOP,SIM_RANK=GD.SIM_RANK,SIM_COST=GD.SIM_COST,SIM_SHOP=GD.SIM_SHOP,SIM_NAMES=GD.SIM_NAMES;
const SIM={};
for(const side of['정','사'])SIM['N_base_'+side]={id:'N_base_'+side,n:SIDES[side].base,g:0,side,sc:side==='정'?'불가':'사공',el:SIM_BASE_EL[side],d:`${SIDES[side].n} 사람이 타고나는 기초 심법.`};
for(const side of['정','사'])SIM['N_shop_'+side]={id:'N_shop_'+side,n:SIM_SHOP[side],g:1,side,shop:1,sc:side==='정'?'정종':'사공',el:SIM_SHOP_EL[side],d:'강호에 널리 퍼진 공용 심법. 개봉 잡화점에서 판다.'};
const simPre=n=>n.replace(/(세가|파|가|문|교|사|궁|채|방|장|맹)$/,'')||n;
for(const s of Object.values(SECTS)){const top=SIM_TOP[s.tier]||1,names=SIM_NAMES[s.id]||[],pre=simPre(s.n),auto=[`${pre}심법`,`${pre}진기`,`${pre}신공`,`${pre}무상공`];
  const tr=[].concat(SIM_TRAIT[s.id]||SIM_TDEF[simSchoolOf(s.id)]||[]).filter(k=>SIM_TK[k]),sc=simSchoolOf(s.id),hiArt=s.arts.find(a=>a.hi)||s.arts[0],el=SIM_EL[s.id]||(hiArt&&EL[hiArt.el]?hiArt.el:'금');
  for(let g=1;g<=top;g++){const id=`N_${s.id}_${g}`;SIM[id]={id,n:names[g-1]||auto[g-1],g,sect:s.id,side:ALLY[s.al].side,tr,sc,el,d:`${s.n}(${tierName(s)})의 ${AGR[g]} 심법.`}}}
// 속성(오행·음양·뇌)과 계열은 심법의 것 (사용자 결정 2026-10-13 "오행·음양·뇌기를 내공에, 검법 등 무공에서는 제거, 상극 우선순위 유지")
// - pEl(): 운용 중 심법의 속성 → 상극 배율(elMul)·적중 효과(hitE). pSchool(): 계열 → 무공 이펙트 색(SCHOOL_FX).
// - artEl/fxCol(a): 내 무공(문파 무공 포함)은 내 심법을, 다른 문파의 무공(그 문파 무인이 쓰는)은 그 문파 심법을 따른다.
const pEl=()=>(P&&simCur().el)||'금';
const pSchool=()=>(P&&simCur().sc)||'정종';
// 상극 판정용: 내 쪽은 운용 중 심법, 무인은 문파 심법 속성·계열, 짐승은 없음 (v101 마기 상극)
const elOf=x=>x===P?pEl():(x&&x.el)||null;
const scOf=x=>x===P?pSchool():x&&x.sect&&SECTS[x.sect]?simSchoolOf(x.sect):null;
const simSectEl=sid=>{const l=simOf(sid);return l.length?l[0].el:'금'};
function artEl(a){if(a&&a.sect&&SECTS[a.sect]&&(!P||(P.sect!==a.sect&&!(P.arts&&P.arts[a.id]))))return simSectEl(a.sect);return pEl()}
function fxCol(a){const sc=a&&a.sect&&SECTS[a.sect]&&(!P||(P.sect!==a.sect&&!(P.arts&&P.arts[a.id])))?simSchoolOf(a.sect):pSchool();return SCHOOL_FX[sc]||SCHOOL_FX['정종']}
const simElHtml=x=>`<b style="color:rgb(${textCol(SCHOOL_FX[x.sc]||'235,240,250')})">${x.sc}</b> · <b>${x.el}</b> ${EL[x.el]?EL[x.el].fx:''}`;
// 심법 특색: 운용 중인 심법의 특색 k 값(SIM_TK 단위: %p 또는 현묘도 점수). 없으면 0
function simSchoolOf(sid){for(const[k,l]of Object.entries(GD.SCHOOL_OF||{}))if(l.includes(sid))return k;return SECTS[sid]&&SECTS[sid].al==='sacheon'?'사공':'정종'}
const simTraitVal=(x,k)=>x&&x.tr&&x.tr.includes(k)?SIM_TK[k].v*SIM_TQ[x.g]:0;
const simTv=k=>simTraitVal(simCur(),k);
const simTraits=x=>(x&&x.tr||[]).map(k=>({k,n:SIM_TK[k].n,v:simTraitVal(x,k),txt:SIM_TK[k].fmt.replace('{p}',Math.round(simTraitVal(x,k)))}));
const simTraitTxt=x=>simTraits(x).map(t=>`${t.n}(${t.txt})`).join(' · ');
const simTraitHtml=x=>simTraits(x).map(t=>`<b class="gold">${t.n}</b> ${t.txt}`).join(' · ');
// 전투 적용: 공격력·광폭·받는 피해·반탄·적중 효과(중독=독기, 둔화, 경직)·흡정·흡혈. 치명타·현묘도·회복·이동·경공·초식 내공은 각 공식에서 simTv 를 더한다
hook('hit',c=>{if(c.from!==P)return;const a=simTv('atk'),r=P.hp<P.maxHp*.5?simTv('rage'):0;if(a||r)c.m*=1+(a+r)/100});
hook('hurt',c=>{const v=simTv('def');if(v)c.dm*=1-v/100});
hook('hitDone',c=>{const e=c.e,d=c.hp0-e.hp;if(!e||d<=0||!(simCur().tr||[]).length)return;
  if(Math.random()*100<simTv('poison')){e.burn=Math.max(e.burn||0,4);e.burnD=Math.max(1,Math.round(d*.06));addText(e.x,e.y-.4,'중독','#9fd36a')}
  if(Math.random()*100<simTv('slow')){e.slow=Math.max(e.slow||0,2.5);addText(e.x,e.y-.4,'둔화','#9fc8ff')}
  if(Math.random()*100<simTv('stun')){e.stun=Math.max(e.stun||0,e.d&&e.d.boss?.25:.6);addText(e.x,e.y-.4,'경직','#ffd36a')}
  const dr=simTv('drain');if(dr)P.qi=Math.min(P.maxQi,P.qi+d*dr/100);
  const va=simTv('vamp');if(va&&P.hp>0)P.hp=Math.min(P.maxHp,P.hp+d*va/100)});
hook('hurtDone',c=>{const v=simTv('reflect'),src=c.src,d=c.hp0-Math.max(0,P.hp);if(v&&d>0&&src&&src.d&&src.hp>0&&src!==P)damage(src,Math.max(1,Math.round(d*v/100)),0,0,P)});
const simOf=sid=>Object.values(SIM).filter(x=>x.sect===sid).sort((a,b)=>a.g-b.g);
const simBase=()=>SIM['N_base_'+P.side];
// v141 (사용자): 무관에서 시작하면 타고난 기초 심법이 없다(P.noBase). 심법을 고르기 전엔 '심법 없음'이고 내공 수련을 못 한다
const SIM_NONE={id:'N_none',n:'심법 없음',g:0,sc:'',el:'',tr:[],none:1,d:'아직 익힌 심법이 없다. 무관 심법 교두에게서 고른다.'};
// 상극 심법 (사용자 2026-10-15 v103 "마교 심법과 정파 심법을 같이 쓰는 건 기괴"): 마공은 정파 계열(불가·도가·정종)과 한 몸에 둘 수 없다. 사공·사불은 마공과 어울린다.
const SIM_FOE={마공:['불가','도가','정종'],불가:['마공'],도가:['마공'],정종:['마공']};
const simClash=(a,b)=>!!a&&!!b&&(SIM_FOE[a]||[]).includes(b);
const simHeld=()=>Object.keys(P.sims||{}).map(id=>SIM[id]).filter(Boolean);
// 타고난 기초 심법은 상극 심법(마공)을 지니는 동안 봉인된다: 목록엔 남지만 운용할 수 없다
const simBaseSealed=()=>!P.noBase&&simHeld().some(x=>simClash(x.sc,simBase().sc));
function simCur(){if(P.sim&&SIM[P.sim]&&simKnown(P.sim))return SIM[P.sim];if(simBaseSealed()){const alt=simHeld().find(x=>!simClash(x.sc,simBase().sc)&&x.sc!==simBase().sc)||simHeld()[0];if(alt)return alt}return P.noBase?simHeld()[0]||SIM_NONE:simBase()}
const simKnown=id=>(id===('N_base_'+P.side)&&!P.noBase&&!simBaseSealed())||!!(P.sims&&P.sims[id]);
// 산공: 익히려는 심법 계열과 상극인 심법을 모두 잊고, 쌓은 내공의 절반이 흩어진다. 잃는 것이 없으면 아무 일도 없다.
function sangongLoss(sc){const gone=simHeld().filter(x=>simClash(x.sc,sc));return{gone,base:!P.noBase&&simClash(simBase().sc,sc)&&!simBaseSealed()}}
function sangong(sc){const{gone,base}=sangongLoss(sc);if(!gone.length&&!base)return false;
  for(const x of gone)delete P.sims[x.id];if(P.sim&&!P.sims[P.sim])P.sim=null;
  if(sc==='마공')P.mara=Math.min(100,(P.mara||0)+(typeof MARA!=='undefined'?MARA.sangong:20));else if(gone.some(x=>x.sc==='마공'))P.mara=0;   // 입마는 마성을 안고 시작하고, 마공을 버리면 마성도 사라진다 (v104)
  const lost=Math.floor((P.qiAcc||0)/2);P.qiAcc=(P.qiAcc||0)-lost;P.qiN=Math.max(0,P.qiN-Math.ceil(P.qiN/2));if(typeof recalc==='function')recalc();P.qi=Math.min(P.qi,P.maxQi);
  log(`${sc} 심법을 받아들이려 ${[...gone.map(x=>x.n),...(base?[simBase().n+'(봉인)']:[])].join('·')}을(를) 버리고 산공했습니다. 쌓은 내공 ${lost}이 흩어졌습니다.`,'dmg');showBanner('산공',`${sc}과 상극인 심법을 버렸다`);
  feat(`${sc}에 들려 산공했다`);return true}
const sangongTxt=sc=>{const{gone,base}=sangongLoss(sc);if(!gone.length&&!base)return'';return`${sc}은 ${[...gone.map(x=>x.n),...(base?[simBase().n]:[])].join('·')}과 상극이라 입문하면 그 심법을 버리고(산공) 쌓은 내공 절반이 흩어진다.`};
const simGain=()=>Math.round(SIDES[P.side].gain*SIM_GQ[simCur().g]*10)/10;
const simMine=()=>[...(P.noBase?[]:[simBase()]),...Object.keys(P.sims||{}).map(id=>SIM[id]).filter(Boolean)].sort((a,b)=>a.g-b.g);
function simBlock(x){if(!x)return'없는 심법';if(simKnown(x.id))return'';
  if(simHeld().some(h=>simClash(h.sc,x.sc)))return`상극 심법(${simHeld().find(h=>simClash(h.sc,x.sc)).sc})을 지녀 못 익힌다`;
  if(x.shop)return x.side==='사'&&P.side!=='사'?'성향이 다르다':P.silver<SIM_SHOP.price?`은자 ${SIM_SHOP.price} 필요`:'';
  if(P.sect!==x.sect)return`${SECTS[x.sect].n} 제자만`;const r=rankIdx(x.sect);if(r<SIM_RANK[x.g])return`${rankName(x.sect,SIM_RANK[x.g])} 이상`;
  if((P.merit[x.sect]||0)<SIM_COST[x.g])return`공적 ${SIM_COST[x.g]} 필요`;return''}
function simLearn(x){P.sims=P.sims||{};P.sims[x.id]=1;P.sim=x.id;log(`심법 [${x.n}](${AGR[x.g]})을(를) 익혀 운용합니다. 수련 한 번에 내공 +${simGain()}.`,'xp');if(x.tr&&x.tr.length)log(`특색: ${simTraitTxt(x)} (운용 중에만)`,'xp');showBanner(x.n,`${AGR[x.g]} 심법`)}
const simRowHtml=(x,btn)=>`<div class="it"><div>${x.n} ${gradeTag(x.g)}${P.sim===x.id||(!P.sim&&x.g===0&&x.side===P.side&&!x.sect&&!x.shop&&!x.acad)?' <small class="gold">운용 중</small>':''}<span>수련 1회 내공 +${Math.round(SIDES[P.side].gain*SIM_GQ[x.g]*10)/10} · ${x.d}<br>${simElHtml(x)}${x.tr&&x.tr.length?`<br>특색 ${simTraitHtml(x)}`:''}</span></div><div class="ib">${btn}</div></div>`;
// 문파 창: 문파 심법 목록
function simSectHtml(s){const list=simOf(s.id),member=P.sect===s.id;
  return `<h4 style="margin:0">문파 심법 <small class="dim">${tierName(s)}는 ${AGR[SIM_TOP[s.tier]||1]}까지 · 직위가 오르면 더 익힌다</small></h4><div class="list">${list.map(x=>{const no=simBlock(x);
    return simRowHtml(x,simKnown(x.id)?'<small class="good">익힘</small>':member?B('simbuy:'+x.id,no||`익히기 · 공적 ${SIM_COST[x.g]}`,{d:!!no,pri:!no}):`<small class="dim">${no||`${rankName(s.id,SIM_RANK[x.g])} 이상`}</small>`)}).join('')}</div>`}
// 잡화점: 공용 중승 심법
// 사파에게는 정종 공용 심법(소주천심법)도 판다: 초절정부터 느려지는 사공을 버리고 정종으로 갈아탈 길 (사공↔정종은 상극이 아니다)
function simShopHtml(){const xs=P.side==='사'?[SIM['N_shop_사'],SIM['N_shop_정']]:[SIM['N_shop_'+P.side]];
  return `<h4 style="margin:0">심법 비급</h4><div class="list">${xs.map(x=>{const no=simBlock(x);return simRowHtml(x,simKnown(x.id)?'<small class="good">익힘</small>':B('simshop:'+x.id,no||`사기 · 은자 ${SIM_SHOP.price}`,{d:!!no,pri:!no}))}).join('')}</div>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.id==='gen'&&REG==='gaebong'){c.html=pNpcBase(c.n)+simShopHtml()}});
hook('sectAct',c=>{const{a,x}=c;
  if(a==='simbuy'){c.done=true;c.r=true;const s=SIM[x];if(!s||s.shop||simBlock(s))return;P.merit[s.sect]-=SIM_COST[s.g];simLearn(s);return}
  if(a==='simshop'){c.done=true;c.r=true;const s=SIM[x]||SIM['N_shop_'+P.side];if(!s||!s.shop||simBlock(s))return;P.silver-=SIM_SHOP.price;simLearn(s);return}});
// 운용할 심법은 무공 창(pArts)의 심법 카드에서 고른다 (사용자 요청 2026-10-12 "심법도 수련창 말고 무공창에서 장착"). 수련 창에는 바꾸기 줄이 없다
const simRows=()=>'';
function simArtsHtml(){const mine=simMine(),cur=simCur();
  return `<div class="card"><h4>심법 <small class="dim">운용 중인 심법이 수련의 내공 증가와 특색을 정한다</small></h4><div class="list">${mine.length?'':'<p class="note">아직 익힌 심법이 없다. 심법이 없으면 내공 수련을 할 수 없다.</p>'}${mine.map(x=>simRowHtml(x,x.id===cur.id?'':!simKnown(x.id)?'<small class="dim">봉인 · 상극 심법을 지녀 운용 못 함</small>':B('simsel:'+x.id,'운용하기'))).join('')}</div>
    <p class="note">문파 심법은 문파 창에서 공적으로, 공용 심법은 개봉 잡화점에서 익힌다. 쌓인 내공은 심법을 바꿔도 그대로다. 마공과 정파 계열(불가·도가·정종) 심법은 한 몸에 둘 수 없어, 상극 심법에 입문하면 산공한다.</p></div>`}
function simSwitch(id){const x=SIM[id];if(!x||!simKnown(id)||trnBusy)return;P.sim=id;log(`[${x.n}]을(를) 운용합니다. ${x.sc} ${x.el}속성 · 수련 한 번에 내공 +${simGain()}.${x.tr&&x.tr.length?' 특색: '+simTraitTxt(x):''}`,'sys');if(typeof renderTrain==='function'&&$('trn')&&!$('trn').hidden)renderTrain()}

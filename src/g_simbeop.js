// ================= 내공 심법: 등급별로 내공 증가량이 다르고, 문파마다 자기 심법이 있다 =================
// 사용자 요청(2026-10-12): "내공심법의 종류도 다양하게. 같은 활력을 소모하지만 내공 증가량에 차이가 있게 등급별 차등. 문파는 자기들만의 내공심법을 보유하고,
//   등급별로 문파의 규모에 따라 최고 등급은 차이가 나게."
// - 등급 하승·중승·상승·절정·천고(AGR). 한 번 수련의 내공 증가 = 타고난 증가(정 10·사 11) × SIM_GQ[등급] (1 / 1.25 / 1.5 / 1.8 / 2.2). 활력 값은 그대로(qiCost).
// - 타고난 심법(대반야금강공·혈라공)은 하승. 개봉 잡화점에서 중승 공용 심법(소주천심법·현음공)을 은자로 산다(자기 성향 것만).
// - 문파 심법: 소문파 중승까지 1개, 중견 상승까지 2개, 대문파(오대세가 포함) 절정까지 3개, 마교 천고까지 4개. 이름은 SIM_NAMES, 없으면 문파 이름으로 짓는다.
//   문파 창에서 공적으로 익힌다(등급마다 직위 SIM_RANK: 중승 2단계 직위, 상승 3단계, 절정 4단계, 천고 5단계).
// - 수련 창에서 익힌 심법 가운데 하나를 운용한다(P.sim). 쌓인 내공은 P.qiAcc 에 적어(예전 저장은 횟수×증가량으로 옮김) 심법을 바꿔도 지난 수련분은 그대로다.
// - 주화입마로 잃는 내공은 지금 운용하는 심법의 증가량 × 잃는 회차. 설계: docs/경지_설계.md 4부. 테스트: tests/t48_simbeop.js
const SIM_GQ=GD.SIM_GQ,SIM_TOP=GD.SIM_TOP,SIM_RANK=GD.SIM_RANK,SIM_COST=GD.SIM_COST,SIM_SHOP=GD.SIM_SHOP,SIM_NAMES=GD.SIM_NAMES;
const SIM={};
for(const side of['정','사'])SIM['N_base_'+side]={id:'N_base_'+side,n:SIDES[side].base,g:0,side,d:`${SIDES[side].n} 사람이 타고나는 기초 심법.`};
for(const side of['정','사'])SIM['N_shop_'+side]={id:'N_shop_'+side,n:SIM_SHOP[side],g:1,side,shop:1,d:'강호에 널리 퍼진 공용 심법. 개봉 잡화점에서 판다.'};
const simPre=n=>n.replace(/(세가|파|가|문|교|사|궁|채|방|장|맹)$/,'')||n;
for(const s of Object.values(SECTS)){const top=SIM_TOP[s.tier]||1,names=SIM_NAMES[s.id]||[],pre=simPre(s.n),auto=[`${pre}심법`,`${pre}진기`,`${pre}신공`,`${pre}무상공`];
  for(let g=1;g<=top;g++){const id=`N_${s.id}_${g}`;SIM[id]={id,n:names[g-1]||auto[g-1],g,sect:s.id,side:ALLY[s.al].side,d:`${s.n}(${tierName(s)})의 ${AGR[g]} 심법.`}}}
const simOf=sid=>Object.values(SIM).filter(x=>x.sect===sid).sort((a,b)=>a.g-b.g);
const simBase=()=>SIM['N_base_'+P.side];
function simCur(){return(P.sim&&SIM[P.sim]&&simKnown(P.sim)?SIM[P.sim]:simBase())}
const simKnown=id=>id===('N_base_'+P.side)||!!(P.sims&&P.sims[id]);
const simGain=()=>Math.round(SIDES[P.side].gain*SIM_GQ[simCur().g]*10)/10;
const simMine=()=>[simBase(),...Object.keys(P.sims||{}).map(id=>SIM[id]).filter(Boolean)].sort((a,b)=>a.g-b.g);
function simBlock(x){if(!x)return'없는 심법';if(simKnown(x.id))return'';
  if(x.shop)return P.side!==x.side?'성향이 다르다':P.silver<SIM_SHOP.price?`은자 ${SIM_SHOP.price} 필요`:'';
  if(P.sect!==x.sect)return`${SECTS[x.sect].n} 제자만`;const r=rankIdx(x.sect);if(r<SIM_RANK[x.g])return`${rankName(x.sect,SIM_RANK[x.g])} 이상`;
  if((P.merit[x.sect]||0)<SIM_COST[x.g])return`공적 ${SIM_COST[x.g]} 필요`;return''}
function simLearn(x){P.sims=P.sims||{};P.sims[x.id]=1;P.sim=x.id;log(`심법 [${x.n}](${AGR[x.g]})을(를) 익혀 운용합니다. 수련 한 번에 내공 +${simGain()}.`,'xp');showBanner(x.n,`${AGR[x.g]} 심법`)}
const simRowHtml=(x,btn)=>`<div class="it"><div>${x.n} ${gradeTag(x.g)}${P.sim===x.id||(!P.sim&&x.g===0&&x.side===P.side&&!x.sect&&!x.shop)?' <small class="good">운용 중</small>':''}<span>수련 1회 내공 +${Math.round(SIDES[P.side].gain*SIM_GQ[x.g]*10)/10} · ${x.d}</span></div><div class="ib">${btn}</div></div>`;
// 문파 창: 문파 심법 목록
function simSectHtml(s){const list=simOf(s.id),member=P.sect===s.id;
  return `<h4 style="margin:0">문파 심법 <small class="dim">${tierName(s)}는 ${AGR[SIM_TOP[s.tier]||1]}까지 · 직위가 오르면 더 익힌다</small></h4><div class="list">${list.map(x=>{const no=simBlock(x);
    return simRowHtml(x,simKnown(x.id)?'<small class="good">익힘</small>':member?B('simbuy:'+x.id,no||`익히기 · 공적 ${SIM_COST[x.g]}`,{d:!!no,pri:!no}):`<small class="dim">${no||`${rankName(s.id,SIM_RANK[x.g])} 이상`}</small>`)}).join('')}</div>`}
// 잡화점: 공용 중승 심법
function simShopHtml(){const x=SIM['N_shop_'+P.side],no=simBlock(x);
  return `<h4 style="margin:0">심법 비급</h4><div class="list">${simRowHtml(x,simKnown(x.id)?'<small class="good">익힘</small>':B('simshop',no||`사기 · 은자 ${SIM_SHOP.price}`,{d:!!no,pri:!no}))}</div>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.id==='gen'&&REG==='gaebong'){c.html=pNpcBase(c.n)+simShopHtml()}});
hook('sectAct',c=>{const{a,x}=c;
  if(a==='simbuy'){c.done=true;c.r=true;const s=SIM[x];if(!s||s.shop||simBlock(s))return;P.merit[s.sect]-=SIM_COST[s.g];simLearn(s);return}
  if(a==='simshop'){c.done=true;c.r=true;const s=SIM['N_shop_'+P.side];if(simBlock(s))return;P.silver-=SIM_SHOP.price;simLearn(s);return}});
// 수련 창: 익힌 심법 가운데 운용할 것을 고른다 (g_train.js renderTrain·startTrain 이 부른다)
function simRows(){const mine=simMine();if(mine.length<2)return'';const cur=simCur();
  return mine.filter(x=>x.id!==cur.id).map(x=>trnRow('sim:'+x.id,`심법 바꾸기 · ${x.n}`,AGR[x.g],`수련 1회 내공 +${Math.round(SIDES[P.side].gain*SIM_GQ[x.g]*10)/10}`,0,!trnBusy,'운용하기')).join('')}
function simSwitch(id){const x=SIM[id];if(!x||!simKnown(id)||trnBusy)return;P.sim=id;log(`[${x.n}]을(를) 운용합니다. 수련 한 번에 내공 +${simGain()}.`,'sys');renderTrain()}

// ================= 패시브 무공 (심법·신법·외공) =================
// 익히면 늘 켜져 있는 무공. 버프 종류(타입)마다 하나씩 공용 무공이 있고, 문파마다 고유 패시브 셋이 있다.
// - 공용(1단계): 문파 가입 없이 잡화점 비급으로 익힌다.
// - 문파(2·3단계): 그 문파 제자만, 정해진 직위 이상에서 공적으로 익힌다.
//   같은 타입의 하위 단계 무공을 대성(숙련 50)해야 익힐 수 있다. 2단계는 같은 타입 공용 무공, 3단계는 같은 타입 2단계 무공.
// - 같은 타입은 겹치지 않고 가장 센 것 하나만 듣는다. 숙련 0에서 효과 35%, 숙련 100에서 100%.
// - 숙련은 적을 쓰러뜨릴 때와 운기조식할 때 오른다.
// 설계: docs/세력_문파_설계.md 13장
const PTYPE=Object.fromEntries(Object.entries(GD.PTYPE).map(([k,t])=>[k,{...t,f:v=>t.fmt.replace('{p}',Math.round(v*100))}]));
const PT_KEYS=Object.keys(PTYPE);
// 공용 패시브: 타입마다 하나
const PCOMMON=GD.PCOMMON;
// 문파 고유 패시브: [A타입, B타입, A 2단계 이름, B 2단계 이름, A 3단계 이름]. 직위: A2 정식제자, B2 일대제자, A3 호법(당주)
const PSECT=GD.PSECT;
const PWORD=GD.PWORD;
const PRANK=GD.PRANK;   // A2, B2, A3을 익힐 수 있는 직위
const sectShort=n=>/세가$/.test(n)?n.slice(0,-2):/^..(.)가$/.test(n)?n[2]+'가':n.replace(/(세가|수로채|신교|파|문|방|채|궁|사|교|곡|장)$/,'')||n;
const PAS={};
for(const k of PT_KEYS){const[n,d]=PCOMMON[k];PAS['P_'+k]={id:'P_'+k,n,d,type:k,tier:0,sect:null,rank:0}}
for(const s of Object.values(SECTS)){
  let o=PSECT[s.id];
  if(!o){let h=0;for(const ch of s.id)h=(h*31+ch.charCodeAt(0))>>>0;const a=PT_KEYS[h%8],b=PT_KEYS[(h>>>3)%8]===a?PT_KEYS[(h%8+3)%8]:PT_KEYS[(h>>>3)%8],sh=sectShort(s.n);
    o=[a,b,sh+PWORD[a][0],sh+PWORD[b][0],sh+PWORD[a][1]]}
  [[o[0],1,o[2]],[o[1],1,o[3]],[o[0],2,o[4]]].forEach(([type,tier,n],j)=>{const id=`PS_${s.id}_${j}`;
    PAS[id]={id,n,type,tier,sect:s.id,rank:PRANK[j],d:`${s.n}의 ${tier===2?'비전 ':''}${PTYPE[type].n} 무공`}})}
const pasOf=sid=>Object.values(PAS).filter(p=>p.sect===sid);
const pasCost=p=>p.tier===2?150:60;
const pasVal=(p,m)=>PTYPE[p.type].v[p.tier]*(.35+.65*Math.min(100,m)/100);
// 타입별 효과: 같은 타입은 가장 센 것 하나
function pv(type){if(!P||!P.pas)return 0;let b=0;for(const id in P.pas){const p=PAS[id];if(p&&p.type===type)b=Math.max(b,pasVal(p,P.pas[id].p))}return b}
// 익힐 수 있는지: 못 익히면 까닭을 돌려준다
function pasBlock(p){
  if(!P.pas)P.pas={};if(P.pas[p.id])return'이미 익혔다';
  if(p.sect){if(P.sect!==p.sect)return'제자만';if(rankIdx(p.sect)<p.rank)return`${rankName(p.sect,p.rank)} 이상`}
  if(p.tier>0){const low=Object.keys(P.pas).some(id=>PAS[id]&&PAS[id].type===p.type&&PAS[id].tier===p.tier-1&&P.pas[id].p>=50);
    if(!low)return p.tier===1?`${PCOMMON[p.type][0]} 대성 필요`:`${PTYPE[p.type].n} 2단계 대성 필요`}
  if(p.sect&&(P.merit[p.sect]||0)<pasCost(p))return`공적 ${pasCost(p)} 필요`;
  return null}
function learnPas(id,free){const p=PAS[id];if(!p)return false;const no=pasBlock(p);if(no&&!(free&&!p.sect&&no!=='이미 익혔다'))return false;
  if(p.sect)P.merit[p.sect]-=pasCost(p);P.pas[id]={p:0};recalc();
  log(`패시브 무공 [${p.n}]을(를) 익혔습니다. ${PTYPE[p.type].f(pasVal(p,0))}부터 시작합니다.`,'xp');showBanner(p.n,`${PTYPE[p.type].n} 패시브`);return true}
// 숙련: 쓰러뜨릴 때 v=2, 운기조식 1초에 v=.5. 무공 숙련처럼 오성이 높을수록 빠르고, 높아질수록 느려진다
function gainPas(v){if(!P||!P.pas)return;let ch=false;
  for(const id in P.pas){const s=P.pas[id],p=PAS[id];if(!p||s.p>=100)continue;const b=s.p;s.p=Math.min(100,s.p+v*.3*wisMul()*(1-s.p/125));
    if(Math.floor(b)!==Math.floor(s.p))ch=true;
    if(tierOf(b)!==tierOf(s.p)){showBanner(`${p.n} ${TIERS[tierOf(s.p)]}`,PTYPE[p.type].f(pasVal(p,s.p)));log(`[${p.n}] ${TIERS[tierOf(s.p)]}: ${PTYPE[p.type].f(pasVal(p,s.p))}`,'xp')}}
  if(ch)recalc()}
// 공용 패시브 비급 (잡화점)
function mkPBook(id){const p=PAS[id];return{id:++itemId,slot:'pbook',pas:id,name:`패시브 비급 · ${p.n}`,price:30}}
// ---- 화면 ----
function pasRow(p,btn){const s=P.pas&&P.pas[p.id],m=s?s.p:0;
  return `<div class="it"><div>${p.n} <small class="${p.tier?'good':'dim'}">${['공용','문파','문파 비전'][p.tier]} · ${PTYPE[p.type].n}</small><span>${s?`${PTYPE[p.type].f(pasVal(p,m))} · 숙련 ${Math.floor(m)} ${TIERS[tierOf(m)]}`:`${PTYPE[p.type].f(pasVal(p,0))}~${PTYPE[p.type].f(pasVal(p,100)).replace(/^[^+-]*/,'')}`}${p.sect&&!s?` · ${rankName(p.sect,p.rank)} 이상`:''}</span>${s?`<div class="mbar"><i style="width:${m}%"></i></div>`:''}</div>${btn?`<div class="ib">${btn}</div>`:''}</div>`}
function pasArtsHtml(){
  const mine=Object.keys(P.pas||{}).map(id=>PAS[id]).filter(Boolean).sort((a,b)=>PT_KEYS.indexOf(a.type)-PT_KEYS.indexOf(b.type)||a.tier-b.tier);
  const sum=PT_KEYS.filter(k=>pv(k)>0).map(k=>PTYPE[k].f(pv(k))).join(' · ');
  return `<div class="card"><h4>패시브 무공 <small class="dim">늘 켜져 있다 · 같은 종류는 가장 센 것 하나</small></h4>
    ${mine.length?`<p>${sum}</p><div class="list">${mine.map(p=>pasRow(p)).join('')}</div>`:'<p class="note">익힌 패시브 무공이 없다. 공용 패시브는 개봉 잡화점에서 비급을 사서 익히고, 문파 패시브는 문파에서 직위와 공적으로 익힌다.</p>'}
    <p class="note">숙련은 적을 쓰러뜨리거나 운기조식할 때 오른다. 문파 패시브는 같은 종류의 하위 무공을 대성(숙련 50)해야 익힐 수 있다.</p></div>`}
function pasSectHtml(s){
  const list=pasOf(s.id),member=P.sect===s.id;
  return `<h4 style="margin:0">문파 패시브 <small class="dim">직위가 오르면 더 익힐 수 있다</small></h4><div class="list">${list.map(p=>{const no=pasBlock(p);
    return pasRow(p,P.pas&&P.pas[p.id]?'<small class="good">익힘</small>':member?B('plearn:'+p.id,no||`익히기 · 공적 ${pasCost(p)}`,{d:!!no,pri:!no}):`<small class="dim">${no}</small>`)}).join('')}</div>`}

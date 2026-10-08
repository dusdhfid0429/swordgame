// ================= 패시브 무공 (심법·신법·외공) =================
// 익히면 늘 켜져 있는 무공. 버프 종류(타입)마다 하나씩 공용 무공이 있고, 문파마다 고유 패시브 셋이 있다.
// - 공용(1단계): 문파 가입 없이 잡화점 비급으로 익힌다.
// - 문파(2·3단계): 그 문파 제자만, 정해진 직위 이상에서 공적으로 익힌다.
//   같은 타입의 하위 단계 무공을 대성(숙련 50)해야 익힐 수 있다. 2단계는 같은 타입 공용 무공, 3단계는 같은 타입 2단계 무공.
// - 같은 타입은 겹치지 않고 가장 센 것 하나만 듣는다. 숙련 0에서 효과 35%, 숙련 100에서 100%.
// - 숙련은 적을 쓰러뜨릴 때와 운기조식할 때 오른다.
// 설계: docs/세력_문파_설계.md 13장
const PTYPE={
  spd:{n:'이동속도',v:[.04,.08,.12],f:v=>`이동속도 +${Math.round(v*100)}%`},
  hp:{n:'최대 생명',v:[.06,.12,.2],f:v=>`최대 생명 +${Math.round(v*100)}%`},
  qi:{n:'최대 내공',v:[.06,.12,.2],f:v=>`최대 내공 +${Math.round(v*100)}%`},
  atk:{n:'공격력',v:[.04,.08,.12],f:v=>`공격력 +${Math.round(v*100)}%`},
  def:{n:'피해 감소',v:[.03,.06,.1],f:v=>`받는 피해 -${Math.round(v*100)}%`},
  crit:{n:'치명타',v:[.02,.04,.07],f:v=>`치명타 확률 +${Math.round(v*100)}%`},
  hreg:{n:'생명 회복',v:[.3,.6,1],f:v=>`생명 회복 +${Math.round(v*100)}%`},
  qreg:{n:'내공 회복',v:[.15,.3,.5],f:v=>`내공 회복 +${Math.round(v*100)}%`}};
const PT_KEYS=Object.keys(PTYPE);
// 공용 패시브: 타입마다 하나
const PCOMMON={spd:['팔보간섬','가볍게 디디는 걸음의 기초'],hp:['십단금','몸을 두드려 단련하는 외공'],qi:['토납법','숨을 고르게 들이고 내는 내공의 기초'],atk:['역발산공','힘을 한 점에 모으는 법'],
  def:['포피술','살갗을 단단히 하는 외공'],crit:['명목술','상대의 빈틈을 보는 눈'],hreg:['양생법','몸의 기운을 고르는 도인술'],qreg:['조식법','흩어진 내기를 빨리 거두는 호흡']};
// 문파 고유 패시브: [A타입, B타입, A 2단계 이름, B 2단계 이름, A 3단계 이름]. 직위: A2 정식제자, B2 일대제자, A3 호법(당주)
const PSECT={
  shaolin:['hp','qi','금종조','역근경','금강불괴'],mudang:['spd','qi','제운종','태극심법','태극신행'],hwasan:['spd','qi','암향표','자하신공','매화비영보'],
  emei:['def','qreg','아미호신공','청정심법','불광호체'],kunlun:['spd','atk','운룡신법','곤륜강기','곤륜비영'],kongtong:['atk','hp','칠상결','공동호체공','공동패력'],
  jeomchang:['crit','spd','분광안','점창보','점창혜안'],cheongseong:['hreg','crit','청성양생결','청성안법','청성회춘공'],jongnam:['def','qi','종남호신공','종남심법','천강호체'],
  gaebang:['spd','hp','소요유','개방호체공','취팔선보'],cheonma:['qi','atk','천마신공','혈마강기','천마대법'],
  namgung:['atk','def','제왕검기','남궁호신공','창궁패천기'],moyong:['qi','crit','모용심법','두전안','신공환원'],paeng:['atk','hp','오호패력','팽가호체','혼원벽력기'],
  dang:['crit','qreg','당가암안','당가조식','만천혜안'],jegal:['crit','qi','팔진안','와룡심법','신산혜안'],hwangbo:['hp','def','황보호체','금강호신공','황보불괴체'],
  bota:['hreg','qi','관음양생결','자항심법','보타회춘공'],taeyang:['atk','qreg','열양강기','태양조식','대일패천공'],bukhae:['def','qi','빙백호체','빙궁심법','빙백호신강기'],
  gwiyeong:['spd','crit','귀영보','귀영안','무흔신행'],podal:['hp','qi','밀종호체','대수인심법','밀종금강체']};
const PWORD={spd:['보법','신행'],hp:['호체공','금강체'],qi:['심법','신공'],atk:['강기결','패천공'],def:['철포삼','호신강기'],crit:['안법','혜안통'],hreg:['양생결','회춘공'],qreg:['토납술','주천대법']};
const PRANK=[1,2,3];   // A2, B2, A3을 익힐 수 있는 직위
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

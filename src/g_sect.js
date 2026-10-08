// ================= 세력과 문파: 정의맹(정파) · 사천맹(사파) · 마교 =================
// 문파마다 고유 무공이 있다. 일반 무공은 임무로 쌓은 공적으로 비급을 받아 익히고, 고급 무공은 가입할 때 받는다.
// 설계: docs/세력_문파_설계.md
const ALLY={
  jeong:{n:'정의맹',side:'정',npc:'jeong',d:'9파1방과 정파 소문파가 모인 무림맹. 협의를 앞세운다.'},
  sacheon:{n:'사천맹',side:'사',npc:'sa',d:'사파 4대문파가 이끄는 연합. 힘과 이익이 곧 법이다.'},
  magyo:{n:'마교',side:'사',npc:'magyo',d:'천마를 받드는 단일 문파. 정사 어느 쪽과도 손잡지 않는다.'}};
// [id, 이름, 세력, 등급(big/small/one), 소개, 무공들 [이름, 무기, 오행, 'n'일반|'h'고급]]
const SECT_DATA=[
  ['shaolin','소림사','jeong','big','무림의 태산북두. 권과 곤이 단단하다.',[['나한권','권','토','n'],['나한곤법','봉','토','n'],['여래신장','권','금','h']]],
  ['mudang','무당파','jeong','big','부드러움으로 강함을 이기는 도가의 문파.',[['태극권','권','수','n'],['양의검법','검','수','n'],['태극혜검','검','수','h']]],
  ['hwasan','화산파','jeong','big','매화처럼 화려하고 빠른 검의 문파.',[['매화검법','검','목','n'],['낙안검법','검','화','n'],['이십사수매화검','검','목','h']]],
  ['emei','아미파','jeong','big','여승들의 문파. 검이 매섭고 장법이 가볍다.',[['금정검법','검','금','n'],['표운장','권','수','n'],['멸절검법','검','금','h']]],
  ['kunlun','곤륜파','jeong','big','서쪽 설산의 문파. 검과 장법이 차갑다.',[['곤륜검법','검','수','n'],['설산장법','권','수','n'],['운룡대구식','검','수','h']]],
  ['kongtong','공동파','jeong','big','상처를 주고받는 칠상권으로 이름난 문파.',[['칠상권','권','화','n'],['복호검법','검','금','n'],['공동복마검','검','화','h']]],
  ['jeomchang','점창파','jeong','big','남쪽 변방의 쾌검 문파.',[['사일검법','검','화','n'],['유운검법','검','수','n'],['분광신검','검','금','h']]],
  ['cheongseong','청성파','jeong','big','사천 청성산의 도가 검파.',[['송풍검법','검','목','n'],['청성권','권','목','n'],['최혼검','검','목','h']]],
  ['jongnam','종남파','jeong','big','장안 남쪽 종남산의 검파.',[['종남검법','검','금','n'],['천강장','권','토','n'],['천강북두검','검','금','h']]],
  ['gaebang','개방','jeong','big','천하 거지들의 방회. 소식이 가장 빠르다.',[['연환장','권','토','n'],['타구봉법','봉','토','n'],['항룡십팔장','권','화','h']]],
  ['namgung','남궁세가','jeong','small','검으로 이름난 정파 세가.',[['창궁검법','검','금','n'],['제왕검형','검','금','h']]],
  ['moyong','모용세가','jeong','small','상대의 수를 되돌려주는 세가.',[['연환쾌검','검','수','n'],['두전성이','권','수','h']]],
  ['paeng','하북팽가','jeong','small','도 하나로 일어선 호방한 세가.',[['오호단문도','도','화','n'],['혼원벽력도','도','화','h']]],
  ['jegal','제갈세가','jeong','small','지략과 진법, 궁술의 세가.',[['팔진궁술','궁','목','n'],['와룡신궁','궁','목','h']]],
  ['hwangbo','황보세가','jeong','small','단단한 권으로 이름난 세가.',[['황보권','권','토','n'],['금강불괴장','권','토','h']]],
  ['dang','사천당가','jeong','small','암기와 독을 다루는 정파 세가.',[['당가비전궁','궁','수','n'],['만천화우','궁','수','h']]],
  ['cheolgeom','철검문','jeong','small','무쇠 같은 검을 쓰는 작은 문파.',[['철검삼식','검','금','n'],['철혈검법','검','금','h']]],
  ['sinchang','신창문','jeong','small','창 한 자루로 버텨 온 문파.',[['신창십삼식','창','목','n'],['폭우이화창','창','목','h']]],
  ['cheongpung','청풍문','jeong','small','바람처럼 가벼운 도를 쓰는 문파.',[['청풍도법','도','목','n'],['청풍만리도','도','목','h']]],
  ['geumgang','금강문','jeong','small','불가 속가 제자들의 곤법 문파.',[['금강곤법','봉','토','n'],['금강항마곤','봉','토','h']]],
  ['hyeolrang','혈랑곡','sacheon','big','사천맹 4대문파. 늑대처럼 무리 지어 싸운다.',[['혈랑참','도','화','n'],['랑아권','권','화','n'],['혈월광랑도','도','화','h']]],
  ['heuksa','흑사방','sacheon','big','사천맹 4대문파. 뱀처럼 휘감는 장법과 창.',[['흑사장','권','수','n'],['흑사창','창','수','n'],['만사귀종장','권','수','h']]],
  ['mandok','만독문','sacheon','big','사천맹 4대문파. 독과 독침의 문파.',[['오독장','권','목','n'],['독침술','궁','목','n'],['만독탈혼장','권','목','h']]],
  ['gwiyeong','귀영문','sacheon','big','사천맹 4대문파. 그림자처럼 숨어 베는 검.',[['귀영검법','검','수','n'],['귀전술','궁','수','n'],['귀영무흔검','검','수','h']]],
  ['haomun','하오문','sacheon','small','저잣거리 건달들의 문파. 정보가 빠르다.',[['하오권','권','토','n'],['천라지망수','권','토','h']]],
  ['noklim','녹림채','sacheon','small','산을 근거로 한 산적 연합.',[['녹림도법','도','목','n'],['녹림패왕도','도','목','h']]],
  ['janggang','장강수로채','sacheon','small','장강 물길을 쥔 수적들.',[['수로창법','창','수','n'],['장강파랑창','창','수','h']]],
  ['chilsal','칠살문','sacheon','small','일곱 번 베어 반드시 죽이는 검.',[['칠살검','검','금','n'],['칠살탈명검','검','금','h']]],
  ['salsu','살수문','sacheon','small','돈을 받고 사람을 쏘는 살수들.',[['살수궁술','궁','금','n'],['일시필살궁','궁','금','h']]],
  ['sahyeol','사혈문','sacheon','small','피를 바쳐 창을 다루는 문파.',[['사혈창','창','화','n'],['혈해마창','창','화','h']]],
  ['eumyang','음양교','sacheon','small','음양의 기를 뒤섞는 사이한 장법.',[['음양장','권','수','n'],['음양쌍절장','권','수','h']]],
  ['hyeolsu','혈수문','sacheon','small','피 묻은 곤을 휘두르는 문파.',[['혈수곤','봉','화','n'],['혈수파천곤','봉','화','h']]],
  ['mayeong','마영방','sacheon','small','허상으로 눈을 속이는 검.',[['마영검','검','목','n'],['마영분신검','검','목','h']]],
  ['heukpung','흑풍채','sacheon','small','개봉 동쪽에 진을 친 산채.',[['흑풍도','도','토','n'],['흑풍광사도','도','토','h']]],
  ['cheonma','천마신교','magyo','one','마교 그 자체. 교주 천마 아래 하나로 뭉쳤다.',[['혈마장','권','화','n'],['마령도법','도','화','n'],['천마검법','검','화','h'],['천마신장','권','화','h']]]];
const SECTS={};SECT_DATA.forEach(([id,n,al,tier,d,arts],i)=>{SECTS[id]={id,n,al,tier,d,i,arts:arts.map((a,j)=>({id:`S${i}_${j}`,n:a[0],cls:a[1],el:a[2],hi:a[3]==='h'}))}});
const sectOf=id=>SECTS[id]||null;
const artSect=artId=>{const m=/^S(\d+)_/.exec(artId);return m?SECTS[SECT_DATA[+m[1]][0]]:null};
const TIERN={big:'대문파',small:'소문파',one:'단일 문파'};
// buildArts에서 부른다: 문파 무공을 일반 무공과 같은 틀(초식 무늬 풀)로 만든다
function addSectArts(arts,pool,ults,formName,ultName){
  for(const s of Object.values(SECTS))for(const a of s.arts){
    const side=ALLY[s.al].side,k=a.hi?6:Math.max(3,Math.min(4,FORMN[a.el])),r=rng(31+a.n.charCodeAt(0)*17+a.n.charCodeAt(a.n.length-1)*5+s.i);
    const p=pool[a.cls].slice();for(let i=p.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
    const first=p.findIndex(f=>['melee','multi','line'].includes(f.p)||(f.p==='proj'&&!f.full&&f.cnt<=2));
    const pick=[p.splice(Math.max(0,first),1)[0],...p.slice(0,k-1).sort((x,y)=>x.cd-y.cd)];
    const mul=a.hi?1.35:1.12;
    const forms=pick.map((f,i)=>({...f,n:formName(),req:REQ[i],cost:Math.round(COST[i]*(a.hi?1.2:1)),bonus:BONUS[i],qi:4+i*4,m:f.m*(1+.06*i)*mul}));
    const u=ults[a.cls][(s.i+a.n.length)%ults[a.cls].length],EC=EL[a.el];
    arts[a.id]={id:a.id,side,cls:a.cls,el:a.el,n:a.n,c:EC.c,pt:EC.pt,elc:a.el==='금',forms,sect:s.id,hi:a.hi,
      ult:{n:ultName(),steps:[F('','circle',{rad:2.8,m:a.hi?1.9:1.5,stun:.3}),...u.steps.map(x=>({...x,m:(x.m||1)*(a.hi?1.25:1),delay:(x.delay||0)+.18}))]},
      d:`${s.n}의 ${a.hi?'고급':'일반'} 무공 · ${CLASS[a.cls].n} · 오행 ${a.el}. 초식 ${forms.length}개와 필살기.`};
  }
}
// ---- 가입 조건 ----
function joinBlock(s){
  const al=ALLY[s.al];
  if(P.side!==al.side)return `${SIDES[al.side].n}만 받는다.`;
  if(P.sect===s.id)return '이미 이 문파의 제자다.';
  if(P.sect&&P.sect!=='own'&&SECTS[P.sect])return `이미 ${SECTS[P.sect].n}의 제자다. 먼저 하산(탈퇴)해야 한다.`;
  if(P.sect==='own')return '스스로 세운 문파의 문주다.';
  if(s.tier==='one')return P.fame>=100||P.evil>=80?null:'명성 100 또는 악업 80이 있어야 마교가 부른다.';
  if(s.tier==='big'){if(s.al==='jeong'&&P.evil>=50)return '악업이 50 이상이면 정파 대문파가 받지 않는다.';return P.age<18||P.fame>=50?null:'18세 전이거나 명성 50 이상이어야 한다.'}
  return null}
// ---- 임무: 세력마다 맡길 일이 다르고, 문파마다 두 가지씩 해마다 바뀐다 ----
const SMIS={
  jeong:[{n:'산적 소탕',kind:'kill',mob:['산적','산적궁수'],cnt:8,merit:15,silver:30},{n:'혈교 무인 추적',kind:'kill',mob:['혈교무인'],cnt:4,merit:25,silver:50},
    {n:'흑풍채주 토벌',kind:'kill',mob:['흑풍채주'],cnt:1,merit:45,silver:80},{n:'약초 공양',kind:'give',mat:'약초',cnt:6,merit:12,silver:20},
    {n:'늑대 퇴치',kind:'kill',mob:['늑대'],cnt:5,merit:12,silver:25},{n:'혈교장로 토벌',kind:'kill',mob:['혈교장로'],cnt:1,merit:60,silver:100}],
  sacheon:[{n:'호랑이 사냥',kind:'kill',mob:['호랑이'],cnt:2,merit:25,silver:40},{n:'곰 사냥',kind:'kill',mob:['곰'],cnt:2,merit:20,silver:35},
    {n:'혈교 무인 처단',kind:'kill',mob:['혈교무인'],cnt:4,merit:25,silver:50},{n:'가죽 상납',kind:'give',mat:'가죽',cnt:4,merit:14,silver:25},
    {n:'광석 상납',kind:'give',mat:'광석',cnt:5,merit:14,silver:25},{n:'산적두목 굴복시키기',kind:'kill',mob:['산적두목'],cnt:2,merit:30,silver:50}],
  magyo:[{n:'혈교 이단 처단',kind:'kill',mob:['혈교무인','강시'],cnt:6,merit:30,silver:60},{n:'혈교장로 처단',kind:'kill',mob:['혈교장로'],cnt:1,merit:70,silver:120},
    {n:'호랑이 가죽 진상',kind:'kill',mob:['호랑이'],cnt:2,merit:25,silver:40},{n:'광석 진상',kind:'give',mat:'광석',cnt:6,merit:16,silver:30}]};
function sectMissions(s){const pool=SMIS[s.al],y=Math.floor(P.age),a=(s.i*3+y)%pool.length,b=(s.i*3+y+1+(s.i%2))%pool.length;
  return [a,b===a?(a+1)%pool.length:b].map(i=>({...pool[i],n:`[${s.n}] ${pool[i].n}`,sect:s.id,vit:Math.round(pool[i].merit*1.5),fame:Math.round(pool[i].merit/5),good:s.al==='jeong'?3:0,key:`${s.id}:${i}:${y}`}))}
const meritCost=(a,fi)=>(a.hi?40:20)*(fi+1);
// ---- 세력 연락관 창 ----
let sectView=null;
function allianceDlg(alId){
  const al=ALLY[alId],mine=P.sect&&SECTS[P.sect];
  if(sectView&&SECTS[sectView]&&SECTS[sectView].al===alId)return sectDetail(SECTS[sectView]);
  const row=s=>{const m=P.merit[s.id]||0;return `<div class="it"><div>${s.n}${P.sect===s.id?' <small class="good">내 문파</small>':''}<span>${[...new Set(s.arts.map(a=>CLASS[a.cls].n))].join('·')}${m?` · 공적 ${m}`:''}</span></div><div class="ib">${B('sview:'+s.id,'보기')}</div></div>`};
  const list=Object.values(SECTS).filter(s=>s.al===alId),big=list.filter(s=>s.tier!=='small'),small=list.filter(s=>s.tier==='small');
  const head=P.side!==al.side?`<p class="note">"${SIDES[P.side].n} 사람이군. 우리 맹의 문은 그대에게 열려 있지 않다. 구경만 하시오."</p>`
    :`<p class="note">"${al.n}에 온 것을 환영하오."</p>`;
  return `${head}<p class="note">${al.d}</p>${mine?`<p class="note">지금 소속: <b>${mine.n}</b> (${ALLY[mine.al].n})</p>`:''}
    <h4 style="margin:0">${alId==='jeong'?'9파1방':alId==='sacheon'?'4대문파':'본교'}</h4><div class="list">${big.map(row).join('')}</div>
    ${small.length?`<h4 style="margin:0">소문파</h4><div class="list">${small.map(row).join('')}</div>`:''}${ownSectHtml(al)}`;
}
function sectDetail(s){
  const al=ALLY[s.al],m=P.merit[s.id]||0,member=P.sect===s.id,jb=joinBlock(s),same=P.side===al.side;
  const hi=s.arts.find(a=>a.hi);
  const arts=s.arts.map(a=>{const A2=ARTS[a.id],st=A(a.id),fi=A2.forms.findIndex((f,i)=>!(st&&st.f[i])),c=fi>=0?meritCost(a,fi):0,lock=a.hi&&!member;
    const why=!same?'':lock?'제자만':fi<0?'모두 익힘':m<c?`공적 ${c} 필요`:'';
    return `<div class="it"><div style="color:rgb(${A2.c})">${A2.n} <small class="${a.hi?'good':'dim'}">${a.hi?'고급':'일반'}</small><span>${CLASS[a.cls].n}·${a.el} · 초식 ${A2.forms.length}개${st?` · 익힌 초식 ${st.f.filter(Boolean).length}`:''}${fi>=0?` · 다음 [${A2.forms[fi].n}] 숙련 ${A2.forms[fi].req}`:''}</span></div>
      <div class="ib">${same?B(`mbuy:${a.id}:${fi}`,why||`비급 · 공적 ${c}`,{d:!!why||P.bag.length>=24}):''}</div></div>`}).join('');
  const mis=same?sectMissions(s).map((q,qi)=>{const on=P.quests.find(x=>x.key===q.key),done=on&&(on.kind==='kill'?on.have>=on.cnt:(P.mats[on.mat]||0)>=on.cnt),i=P.quests.indexOf(on);
    return `<div class="it"><div>${q.n.replace(/^\[[^\]]+\] /,'')}<span>${q.kind==='kill'?`${q.mob.join('·')} ${on?on.have+'/':''}${q.cnt}`:`${q.mat} ${on?(P.mats[q.mat]||0)+'/':''}${q.cnt}개`} · 공적 ${q.merit} · 은자 ${q.silver}</span></div>
      <div class="ib">${on?B('qdone:'+i,done?'보고하기':'진행 중',{pri:done,d:!done}):B('stake:'+s.id+':'+qi,'맡기',{d:P.quests.length>=4})}</div></div>`}).join(''):'';
  const membership=member?`<div class="row2"><span class="note">${s.n}의 제자다. 고급 무공의 다음 초식도 공적으로 받을 수 있다.</span>${B('sleave','하산하기')}</div>`
    :same?`<div class="row2"><span class="note">${jb||`가입하면 고급 무공 [${hi.n}]의 첫 초식을 바로 익힌다.`}</span>${B('sjoin:'+s.id,`${s.n} 가입`,{pri:1,d:!!jb})}</div>`:'';
  return `<div class="row2"><span class="note"><b>${s.n}</b> · ${ALLY[s.al].n} ${TIERN[s.tier]} · 공적 ${m}</span>${B('sview:','← 목록')}</div><p class="note">${s.d}</p>${membership}
    <h4 style="margin:0">고유 무공</h4><div class="list">${arts}</div>
    ${same?`<h4 style="margin:0">임무 <small class="dim">해마다 바뀐다 · 의뢰는 넷까지</small></h4><div class="list">${mis}</div>`:''}${member?teachHtml():''}`;
}
// 사부의 가르침(해마다 한 번)과 맹 공용 비급, 자기 문파 세우기는 기존 규칙 그대로
function teachHtml(){
  const a=art(),s=A(a.id),fi=a.side===P.side?a.forms.findIndex((f,i)=>!s.f[i]&&s.p>=f.req):-1,can=fi>=0&&P.taught<Math.floor(P.age);
  return `<div class="row2"><span class="note">${fi>=0?`사부에게 [${a.forms[fi].n}]을(를) 전수받을 수 있다`:'지금 펼치는 무공에서 전수받을 초식이 없다'}${P.taught>=Math.floor(P.age)?' · 올해는 이미 배웠다':''}</span>${B('teach','가르침 청하기',{d:!can})}</div>`}
function ownSectHtml(al){
  if(P.side!==al.side)return '';
  if(P.sect==='own')return `<div class="row2"><span class="note">${esc(P.sectName)}의 문주</span>${B('disciple',`제자 받기 · 은자 50 (${allies.filter(a=>a.kind==='disciple').length}/3)`,{pri:1,d:P.silver<50||allies.filter(a=>a.kind==='disciple').length>=3})}</div>`;
  const found=P.sect&&realmIdx()>=3&&P.fame>=150;
  return `<div class="row2"><span class="note">문파의 제자로 절정 이상, 명성 150이면 하산해 자기 문파를 세울 수 있다.</span>${B('found','문파 창설',{d:!found})}</div>`}
function sectAct(a,x,y){
  switch(a){
    case'sview':sectView=x||null;return true;
    case'sjoin':{const s=SECTS[x];if(!s||joinBlock(s))return true;P.sect=s.id;P.sectName=null;const h=s.arts.find(q=>q.hi);
      if(!P.arts[h.id])P.arts[h.id]={p:0,f:ARTS[h.id].forms.map((f,i)=>i===0)};
      log(`${s.n}에 입문했습니다. 고급 무공 [${h.n}]의 첫 초식 [${ARTS[h.id].forms[0].n}]을(를) 익혔습니다.`,'xp');showBanner(`${s.n} 입문`,h.n);
      P.feats.push(`${Math.floor(P.age)}세에 ${s.n}에 입문했다`);return true}
    case'sleave':{const s=SECTS[P.sect];if(!s)return true;if(!confirm(`${s.n}에서 하산할까요? 익힌 무공은 남지만 고급 무공의 다음 초식은 더 받을 수 없습니다.`))return true;
      P.sect=null;log(`${s.n}에서 하산했습니다.`,'info');return true}
    case'stake':{const s=SECTS[x],q=sectMissions(s)[+y];if(q&&P.quests.length<4&&!P.quests.some(o=>o.key===q.key)){P.quests.push({...q,have:0});log(`임무 ${q.n}을(를) 맡았습니다.`,'sys')}return true}
    case'mbuy':{const a2=ARTS[x],s=artSect(x),meta=s.arts.find(q=>q.id===x),fi=+y,c=meritCost(meta,fi);
      if(fi<0||(meta.hi&&P.sect!==s.id)||(P.merit[s.id]||0)<c||P.bag.length>=24)return true;P.merit[s.id]-=c;P.bag.push(mkBook(x,fi));log(`${s.n}에서 [${a2.n} · ${a2.forms[fi].n}] 비급을 받았습니다. 행낭에서 읽으세요.`,'xp');return true}
  }
  return false}
// 예전 저장: 무당파('정')·혈교('사') 제자는 새 문파로 옮긴다
function migrateSect(){if(!P)return;P.merit=P.merit||{};if(P.sect==='정')P.sect='mudang';else if(P.sect==='사')P.sect='hyeolrang'}
const sectName=()=>P.sect==='own'?P.sectName:P.sect&&SECTS[P.sect]?SECTS[P.sect].n:null;

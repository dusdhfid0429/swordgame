// ================= 세력과 문파: 정의맹(정파) · 사천맹(사파) · 마교 =================
// 문파마다 고유 무공이 있다. 일반 무공은 임무로 쌓은 공적으로 비급을 받아 익히고, 고급 무공은 가입할 때 받는다.
// 설계: docs/세력_문파_설계.md
const ALLY=GD.ALLY;
// [id, 이름, 세력, 등급(big/small/one), 소개, 무공들 [이름, 무기, 오행, 'n'일반|'h'고급]]
const SECT_DATA=GD.SECT_DATA;
const SECTS={};SECT_DATA.forEach(([id,n,al,tier,d,arts],i)=>{SECTS[id]={id,n,al,tier,d,i,arts:arts.map((a,j)=>({id:`S_${id}_${j}`,n:a[0],cls:a[1],el:a[2],hi:a[3]==='h'}))}});
const sectOf=id=>SECTS[id]||null;
const artSect=artId=>{const m=/^S_(\w+)_\d+$/.exec(artId);return m?SECTS[m[1]]||null:null};
// 중견문파(2026-10-08): 오대세가·사천당가, 새외 사대 세력. 본산이 두 맵이다 (g_stage.js)
const TIERN=GD.TIERN;
// 무공 등급: 대문파(9파1방·사천맹 4대문파·마교)는 일반 상승·고급 절정, 군소문파는 일반 중승·고급 상승. 문파 밖 무공은 하승.
// 등급이 높을수록 초식·필살기가 세고 비급 공적이 비싸며, 숙련은 더디게 오른다. 설계: docs/세력_문파_설계.md 15장
// 4번 천고는 기연으로만 얻는 무공의 등급이다 (g_giyeon.js)
const AGR=GD.AGR,AGR_C=GD.AGR_C;
const GMUL=GD.GMUL,GULT=GD.GULT,GCOST=GD.GCOST,GMAST=GD.GMAST;
const sectGrade=(s,hi)=>s.tier==='small'?(hi?2:1):s.tier==='mid'?2:(hi?3:2);
const artGrade=id=>(ARTS[id]&&ARTS[id].grade)||0;
const gradeTag=g=>`<small class="${AGR_C[g]}">${AGR[g]}</small>`;
// buildArts에서 부른다: 문파 무공을 일반 무공과 같은 틀(초식 무늬 풀)로 만든다
function addSectArts(arts,pool,ults,formName,ultName){
  for(const s of Object.values(SECTS))for(const a of s.arts){
    const side=ALLY[s.al].side,k=a.hi?6:Math.max(3,Math.min(4,FORMN[a.el])),r=rng(31+a.n.charCodeAt(0)*17+a.n.charCodeAt(a.n.length-1)*5+s.i);
    const p=pool[a.cls].slice();for(let i=p.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
    const first=p.findIndex(f=>['melee','multi','line'].includes(f.p)||(f.p==='proj'&&!f.full&&f.cnt<=2));
    const pick=[p.splice(Math.max(0,first),1)[0],...p.slice(0,k-1).sort((x,y)=>x.cd-y.cd)];
    const g=sectGrade(s,a.hi),mul=GMUL[g];
    const forms=pick.map((f,i)=>({...f,n:formName(),req:REQ[i],cost:Math.round(COST[i]*(a.hi?1.2:1)),bonus:BONUS[i],qi:4+i*4,m:f.m*(1+.06*i)*mul}));
    const u=ults[a.cls][(s.i+a.n.length)%ults[a.cls].length],EC=EL[a.el];
    arts[a.id]={id:a.id,side,cls:a.cls,el:a.el,n:a.n,c:EC.c,pt:EC.pt,elc:a.el==='금',forms,sect:s.id,hi:a.hi,
      grade:g,ult:{n:ultName(),steps:[F('','circle',{rad:2.8,m:GULT[g][0],stun:.3}),...u.steps.map(x=>({...x,m:(x.m||1)*GULT[g][1],delay:(x.delay||0)+.18}))]},
      d:`${s.n}(${TIERN[s.tier]})의 ${AGR[g]} ${a.hi?'고급':'일반'} 무공 · ${CLASS[a.cls].n} · 오행 ${a.el}. 초식 ${forms.length}개와 필살기.`};
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
const SMIS=GD.SMIS;
function sectMissions(s){const pool=SMIS[s.al],y=Math.floor(P.age),a=(s.i*3+y)%pool.length,b=(s.i*3+y+1+(s.i%2))%pool.length;
  return [a,b===a?(a+1)%pool.length:b].map(i=>({...pool[i],n:`[${s.n}] ${pool[i].n}`,sect:s.id,vit:Math.round(pool[i].merit*1.5),fame:Math.round(pool[i].merit/5),good:s.al==='jeong'?3:0,key:`${s.id}:${i}:${y}`}))}
// 직위가 일대제자(조장·향주) 이상이면 자기 문파 비급이 20% 싸다 (g_faction.js)
const meritCost=(a,fi)=>Math.round(GCOST[artGrade(a.id)]*(fi+1)*rankDisc(artSect(a.id).id)*dangDisc(a.id));
// ---- 세력 연락관 창 ----
let sectView=null;
function allianceDlg(alId){
  const al=ALLY[alId],mine=P.sect&&SECTS[P.sect];
  if(sectView&&SECTS[sectView]&&SECTS[sectView].al===alId)return sectDetail(SECTS[sectView]);
  const row=s=>{const m=P.merit[s.id]||0;return `<div class="it"><div>${embImg(s.id,20)} ${s.n}${P.sect===s.id?' <small class="good">내 문파</small>':''}<span>${AGR[sectGrade(s,0)]}~${AGR[sectGrade(s,1)]} 무공 · ${[...new Set(s.arts.map(a=>CLASS[a.cls].n))].join('·')}${m?` · 공적 ${m}`:''}</span></div><div class="ib">${B('sview:'+s.id,'보기')}</div></div>`};
  const list=Object.values(SECTS).filter(s=>s.al===alId),big=list.filter(s=>s.tier==='big'||s.tier==='one'),mid=list.filter(s=>s.tier==='mid'),small=list.filter(s=>s.tier==='small');
  const head=P.side!==al.side?`<p class="note">"${SIDES[P.side].n} 사람이군. 우리 맹의 문은 그대에게 열려 있지 않다. 구경만 하시오."</p>`
    :`<p class="note">"${al.n}에 온 것을 환영하오."</p>`;
  return `${head}<p class="note">${al.d}</p>${mine?`<p class="note">지금 소속: <b>${mine.n}</b> (${ALLY[mine.al].n})</p>`:''}
    <h4 style="margin:0">${alId==='jeong'?'9파1방':alId==='sacheon'?'4대문파':'본교'}</h4><div class="list">${big.map(row).join('')}</div>
    ${mid.length?`<h4 style="margin:0">중견문파</h4><div class="list">${mid.map(row).join('')}</div>`:''}
    ${small.length?`<h4 style="margin:0">소문파</h4><div class="list">${small.map(row).join('')}</div>`:''}${ownSectHtml(al)}`;
}
// hq: 본산 장문인 앞에서 보는 창. 가입은 본산에서만 된다.
function sectDetail(s,hq){
  const al=ALLY[s.al],m=P.merit[s.id]||0,member=P.sect===s.id,jb=joinBlock(s),same=P.side===al.side;
  const hi=s.arts.find(a=>a.hi);
  const arts=s.arts.map(a=>{const A2=ARTS[a.id],st=A(a.id),fi=A2.forms.findIndex((f,i)=>!(st&&st.f[i])),c=fi>=0?meritCost(a,fi):0,lock=a.hi&&!member;
    const mb=s.id==='cheonma'?mgArtBlock(a):'',why=!same?'':mb?mb:lock?'제자만':fi<0?'모두 익힘':a.hi&&rankIdx(s.id)<HI_RANK[fi]?`${rankName(s.id,HI_RANK[fi])} 이상`:m<c?`공적 ${c} 필요`:'';
    return `<div class="it"><div style="color:rgb(${A2.c})">${A2.n} ${gradeTag(A2.grade)} <small class="dim">${a.hi?'고급':'일반'}</small><span>${CLASS[a.cls].n}·${a.el} · 초식 ${A2.forms.length}개${st?` · 익힌 초식 ${st.f.filter(Boolean).length}`:''}${fi>=0?` · 다음 [${A2.forms[fi].n}] 숙련 ${A2.forms[fi].req}`:''}</span></div>
      <div class="ib">${same?B(`mbuy:${a.id}:${fi}`,why||`비급 · 공적 ${c}`,{d:!!why||P.bag.length>=24}):''}</div></div>`}).join('');
  const mis=same?sectMissions(s).map((q,qi)=>{const on=P.quests.find(x=>x.key===q.key),done=on&&(on.kind==='kill'?on.have>=on.cnt:(P.mats[on.mat]||0)>=on.cnt),i=P.quests.indexOf(on);
    return `<div class="it"><div>${q.n.replace(/^\[[^\]]+\] /,'')}<span>${q.kind==='kill'?`${q.mob.join('·')} ${on?on.have+'/':''}${q.cnt}`:`${q.mat} ${on?(P.mats[q.mat]||0)+'/':''}${q.cnt}개`} · 공적 ${q.merit} · 은자 ${q.silver}</span></div>
      <div class="ib">${on?B('qdone:'+i,done?'보고하기':'진행 중',{pri:done,d:!done}):B('stake:'+s.id+':'+qi,'맡기',{d:P.quests.length>=4})}</div></div>`}).join(''):'';
  // 지난해에 맡아 아직 들고 있는 임무도 보고할 수 있다 (해가 바뀌어도 임무는 사라지지 않는다)
  const cur=same?sectMissions(s).map(q=>q.key):[],old=same?P.quests.map((q,i)=>[q,i]).filter(([q])=>q.sect===s.id&&!cur.includes(q.key)).map(([on,i])=>{const done=on.kind==='kill'?on.have>=on.cnt:(P.mats[on.mat]||0)>=on.cnt;
    return `<div class="it"><div>${on.n.replace(/^\[[^\]]+\] /,'')}<span>${on.kind==='kill'?`${on.mob.join('·')} ${on.have}/${on.cnt}`:`${on.mat} ${P.mats[on.mat]||0}/${on.cnt}`} · 공적 ${on.merit} · 지난해 임무</span></div><div class="ib">${B('qdone:'+i,done?'보고하기':'진행 중',{pri:done,d:!done})}</div></div>`}).join(''):'';
  const membership=member?`<div class="row2"><span class="note">${s.n}의 ${rankName(s.id)}다. 공적을 쌓으면 직위가 오르고 고급 무공의 다음 초식을 받는다.</span>${B('sleave','하산하기')}</div>${rankHtml(s)}`
    :!same?'':hq?`<div class="row2"><span class="note">${jb||`가입하면 고급 무공 [${hi.n}]의 첫 초식을 바로 익힌다.`}</span>${B('sjoin:'+s.id,`${s.n} 가입`,{pri:1,d:!!jb})}</div>`
    :`<div class="row2"><span class="note">${jb?jb+' ':''}가입은 본산 ${hqPlace(s)}에서 ${masterTitle(s)}에게 청한다. 역참 말로 갈 수 있다.</span>${B('goto:'+hqId(s),`${hqPlace(s)} 가기 · 은자 ${POST_FEE}`,{d:P.silver<POST_FEE||REG===hqId(s)})}</div>`;
  return `<div class="row2"><span class="note">${embImg(s.id,26)} <b>${s.n}</b> · ${ALLY[s.al].n} ${TIERN[s.tier]} · 공적 ${m}</span>${hq?'':B('sview:','← 목록')}</div><p class="note">${s.d}</p>${membership}${garbHtml(s)}
    <h4 style="margin:0">고유 무공</h4><div class="list">${arts}</div>
    ${pasSectHtml(s)}
    ${bobSectHtml(s)}
    ${same?`<h4 style="margin:0">임무 <small class="dim">해마다 바뀐다 · 의뢰는 넷까지</small></h4><div class="list">${mis}${old}</div>`:''}${member?teachHtml():''}`;
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
function sectAct(a,x,y){const c={a,x,y,done:false,r:undefined};runHooks('sectAct',c);if(c.done)return c.r;c.r=sectActBase(a,x,y);runHooks('sectActDone',c);return c.r}
function sectActBase(a,x,y){
  switch(a){
    case'sview':sectView=x||null;return true;
    case'sjoin':{const s=SECTS[x];if(!s||joinBlock(s)||!(panel==='npc'&&panelArg&&panelArg.hq===s.id))return true;P.sect=s.id;P.sectName=null;setTimeout(()=>log(`${s.n} ${rankName(s.id,0)}의 수련복을 입었습니다.`,'sys'),50);const h=s.arts.find(q=>q.hi);
      if(!P.arts[h.id])P.arts[h.id]={p:0,f:ARTS[h.id].forms.map((f,i)=>i===0)};
      log(`${s.n}에 입문했습니다. 고급 무공 [${h.n}]의 첫 초식 [${ARTS[h.id].forms[0].n}]을(를) 익혔습니다.`,'xp');showBanner(`${s.n} 입문`,h.n);
      P.feats.push(`${Math.floor(P.age)}세에 ${s.n}에 입문했다`);return true}
    case'sleave':{const s=SECTS[P.sect];if(!s)return true;if(!confirm(`${s.n}에서 하산할까요? 익힌 무공은 남지만 고급 무공의 다음 초식은 더 받을 수 없습니다.`))return true;
      P.sect=null;log(`${s.n}에서 하산했습니다.`,'info');return true}
    case'blearn':learnBob(x,1);return true;
    case'plearn':{const q=PAS[x];if(q&&q.sect)learnPas(x);return true}
    case'stake':{const s=SECTS[x],q=sectMissions(s)[+y];if(q&&P.quests.length<4&&!P.quests.some(o=>o.key===q.key)){P.quests.push({...q,have:0});log(`임무 ${q.n}을(를) 맡았습니다.`,'sys')}return true}
    case'goto':postGo(x);return true;
    case'mbuy':{const a2=ARTS[x],s=artSect(x),meta=s.arts.find(q=>q.id===x),fi=+y,c=meritCost(meta,fi);
      if(fi<0||(s.id==='cheonma'&&mgArtBlock(meta))||(meta.hi&&(P.sect!==s.id||rankIdx(s.id)<HI_RANK[fi]))||(P.merit[s.id]||0)<c||P.bag.length>=24)return true;P.merit[s.id]-=c;P.bag.push(mkBook(x,fi));log(`${s.n}에서 [${a2.n} · ${a2.forms[fi].n}] 비급을 받았습니다. 행낭에서 읽으세요.`,'xp');return true}
  }
  return false}
// 예전 저장: 무당파('정')·혈교('사') 제자는 새 문파로 옮긴다. 무림전도 개편으로 없어진 문파는 같은 세력의 새 문파로 옮긴다
const SECT_MOVED={heuksa:'sama',cheolgeom:'eon',sinchang:'ak',cheongpung:'hyeongsan',geumgang:'cheonsan',chilsal:'dongjeong',salsu:'yasu',sahyeol:'gwangpung',eumyang:'podal',hyeolsu:'taeyang',mayeong:'bukhae'};
// 예전 무공 번호(S문파순번_n) → 새 번호(S_문파_n). 저장 글자 그대로 바꾼다
const OLD_ART={"0_0":'shaolin_0',"0_1":'shaolin_1',"0_2":'shaolin_2',"1_0":'mudang_0',"1_1":'mudang_1',"1_2":'mudang_2',"2_0":'hwasan_0',"2_1":'hwasan_1',"2_2":'hwasan_2',"3_0":'emei_0',"3_1":'emei_1',"3_2":'emei_2',"4_0":'kunlun_0',"4_1":'kunlun_1',"4_2":'kunlun_2',"5_0":'kongtong_0',"5_1":'kongtong_1',"5_2":'kongtong_2',"6_0":'jeomchang_0',"6_1":'jeomchang_1',"6_2":'jeomchang_2',"7_0":'cheongseong_0',"7_1":'cheongseong_1',"7_2":'cheongseong_2',"8_0":'jongnam_0',"8_1":'jongnam_1',"8_2":'jongnam_2',"9_0":'gaebang_0',"9_1":'gaebang_1',"9_2":'gaebang_2',"10_0":'namgung_0',"10_1":'namgung_1',"11_0":'moyong_0',"11_1":'moyong_1',"12_0":'paeng_0',"12_1":'paeng_1',"13_0":'jegal_0',"13_1":'jegal_1',"14_0":'hwangbo_0',"14_1":'hwangbo_1',"15_0":'dang_0',"15_1":'dang_1',"16_0":'eon_0',"16_1":'eon_1',"17_0":'ak_0',"17_1":'ak_1',"18_0":'hyeongsan_0',"18_1":'hyeongsan_1',"19_0":'cheonsan_0',"19_1":'cheonsan_1',"20_0":'hyeolrang_0',"20_1":'hyeolrang_0',"20_2":'hyeolrang_1',"21_0":'sama_0',"21_1":'sama_0',"21_2":'sama_2',"22_0":'mandok_0',"22_1":'mandok_0',"22_2":'mandok_1',"23_0":'gwiyeong_0',"23_1":'gwiyeong_0',"23_2":'gwiyeong_1',"24_0":'haomun_0',"24_1":'haomun_2',"25_0":'noklim_0',"25_1":'noklim_2',"26_0":'janggang_0',"26_1":'janggang_2',"27_0":'dongjeong_0',"27_1":'dongjeong_1',"28_0":'yasu_0',"28_1":'yasu_1',"29_0":'gwangpung_0',"29_1":'gwangpung_1',"30_0":'podal_0',"30_1":'podal_1',"31_0":'taeyang_0',"31_1":'taeyang_1',"32_0":'bukhae_0',"32_1":'bukhae_1',"33_0":'heukpung_0',"33_1":'heukpung_1',"34_0":'cheonma_0',"34_1":'cheonma_1',"34_2":'cheonma_2',"34_3":'cheonma_3'};
const migrateArtIds=raw=>raw&&raw.replace(/"S(\d+_\d+)"/g,(m,k)=>OLD_ART[k]?`"S_${OLD_ART[k]}"`:m);
function migrateSect(p=P,notes){if(!p)return;p.pas=p.pas||{};p.merit=p.merit||{};p.mtot=p.mtot||{};if(p.sect==='정')p.sect='mudang';else if(p.sect==='사')p.sect='hyeolrang';
  for(const o of[p.merit,p.mtot])for(const[a,b]of Object.entries(SECT_MOVED))if(o[a]!=null){o[b]=(o[b]||0)+o[a];delete o[a]}
  if(SECT_MOVED[p.sect]){p.sect=SECT_MOVED[p.sect];const m=`강호의 판도가 바뀌어 문파가 ${SECTS[p.sect].n}(으)로 옮겨졌습니다.`;notes?notes.push(m):setTimeout(()=>log(m,'sys'),600)}
  if(p.sect&&SECTS[p.sect]&&p.mtot[p.sect]==null)p.mtot[p.sect]=p.merit[p.sect]||0}
const sectName=()=>P.sect==='own'?P.sectName:P.sect&&SECTS[P.sect]?SECTS[P.sect].n:null;

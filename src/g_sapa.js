// ================= v258 사파 문파 고유 놀이 (동훈님 2026-11-12 "모두 적용") =================
// 고파 「사파 총정리」 분석 문서(https://claude.ai/artifact/SKH3waL74rMudGNGGTasN2)의 제안. 사파는 세력마다 힘을 얻는 길이 다르다:
// 산길(녹림), 물길(수로채), 소식(하오문), 서열 다툼(사마세가). 숫자·이름은 data/sapa.json (GD.SAPA). 설계 docs/사파_놀이.md, 테스트 tests/t174_sapa.js
// 1순위 (사천맹 4대문파)
// ① 녹림채 길목 통행세: 성 지도에 들면 길목 하나를 산채가 막는다. 내기/맞서기/통과. 표행 중이면 표물 몫까지 내고 그 맵의 습격을 막는다. 녹림채 조장부터 산채 녹봉
// ② 장강수로채 물길: 물가·다리에서 수로채 제자는 빠르고 세며, 남들은 발이 무겁다. 수로채 무인도 물가에서 세다. 나루 봉쇄 해에는 장강 줄기 역참 삯이 오른다
// ③ 하오문 추적·역추적: 하오문 제자는 객잔 세 곳의 조각 단서로 수배범을 찾는다. 하오문과 사이가 나쁘면 점소이가 내 행적을 팔아 추격조가 붙는다
// ④ 사마세가 하극상: 승급 시험 대신 한 단계 위 선배를 비무로 꺾어 자리를 빼앗는다. 아래 서열은 해마다 도전해 온다
const SAPA=GD.SAPA||{},SP_T=SAPA.toll||{},SP_W=SAPA.water||{},SP_H=SAPA.hao||{},SP_S=SAPA.sama||{};
const spPopK=sid=>SECTS[sid]&&!sectGone(sid)&&typeof sectPop==='function'?clamp(sectPop(sid)/(popBase(SECTS[sid])||1),0,1.2):0;
const spRank=sid=>P&&P.sect===sid?rankIdx(sid):-1;
const spOut=()=>typeof onPv==='function'&&onPv();
// 주인공 둘레 r칸 안 걸을 수 있는 자리
function spSpot(r0,r1,from){const o=from||P;for(let i=0;i<80;i++){const a=Math.random()*Math.PI*2,r=r0+Math.random()*(r1-r0),x=o.x+Math.cos(a)*r,y=o.y+Math.sin(a)*r;if(walkAt(x,y))return{x,y}}return null}
// 추격조: 적 세력 무인 n + 고수 하나. hunt 표지라 출입구를 따라온다 (g_pursue.js)
function spSquad(f,n,sid,tag,name){let made=0;for(let i=0;i<60&&made<n+1;i++){const p=spSpot(6,9);if(!p)continue;const el=made===n?1:0,e=mkFac(f,el,p.x,p.y,sid&&SECTS[sid]?sid:undefined);
    e.aggro=true;e.angry=1;e.hunt=1;e[tag]=1;if(name)e.name=`${name}${el?' 우두머리':''}`;mobs.push(e);made++}return made}

// ================= ① 녹림채 길목 통행세 =================
let TOLL=null;   // 이 맵의 산채 {fee, cv, st:'wait'|'paid'|'fight'|'pass'|'beat', chief, mem, asked, name}
const nkFriend=()=>P.sect==='noklim'||repStageOf(repSect('noklim'))>=3;
const tollCv=()=>typeof CVS!=='undefined'&&CVS.find(cv=>cv.q&&cv.q.hired&&!cv.robbed&&cv.cart&&cv.cart.hp>0);
function tollFee(){const k=cvProv(),lo=typeof cvDanger==='function'?cvDanger(k):1,f=SP_T.fee||[20,12];let v=Math.round((f[0]+f[1]*lo)*(typeof worldPrice==='function'?worldPrice(1):1));
  if(tollCv())v=Math.round(v*(SP_T.cvMul||2.5));if(P.sect&&SECTS[P.sect]&&SECTS[P.sect].al==='sacheon')v=Math.round(v*.5);return Math.max(5,v)}
function tollRoad(){const c=[];for(let y=3;y<NH-3;y++)for(let x=3;x<N-3;x++){if(map[y][x].g!==1||objs[y][x])continue;const d=Math.hypot(x-P.x,y-P.y);if(d<10||d>24)continue;
    if((REGION().gates||[]).some(g=>Math.hypot(g.x-x,g.y-y)<6))continue;c.push({x:x+.5,y:y+.5})}return c.length?pick(c):null}
function tollMake(){if(!spOut()||G.duel||!SECTS.noklim||sectGone('noklim')||mobs.some(m=>m.toll))return null;
  const k=cvProv(),p=((SP_T.prov||{})[k]||0)*Math.min(1,spPopK('noklim'));G.tollAt=G.tollAt||{};
  if(!p||(G.tollAt[REG]&&time-G.tollAt[REG]<(SP_T.cool||240))||Math.random()>=p)return null;G.tollAt[REG]=time;
  const at=tollRoad();if(!at)return null;const t={st:'wait',mem:[],name:pick(SP_T.camps||['산채']),at};
  const mk=(el,x,y,nm)=>{const e=mkFac('사',el,x,y,'noklim');e.d={...e.d,fac:'상'};e.fixed='toll';e.toll=t;e.pursue='stay';e.home={x,y};e.name=nm;mobs.push(e);t.mem.push(e);return e};
  t.chief=mk(1,at.x,at.y,`${t.name} ${pick(SP_T.chief||['두목'])}`);
  for(let i=0;i<(SP_T.guards||3);i++){const q=spSpot(1,2.2,at);if(q)mk(0,q.x,q.y,`${t.name} 산적`)}
  TOLL=t;return t}
hook('enteredRegion',()=>{TOLL=null;const m=mobs.find(e=>e.toll&&e.hp>0);if(m){TOLL=m.toll;return}if(P&&playing)tollMake()});
function tollAsk(){const t=TOLL;if(!t||t.st!=='wait')return;t.asked=1;t.fee=tollFee();t.cv=!!tollCv();P.path=null;P.target=null;
  if(P.sect==='noklim'){tollSet('pass');addText(t.chief.x,t.chief.y-.6,'형님!','#d8c890');log(`${t.chief.name}: "${SP_T.say.pass}"`,'info');return}
  openPanel('npc',{id:'toll',n:t.chief.name,tollNpc:1})}
function tollSet(st){const t=TOLL;if(!t)return;t.st=st;const cv=tollCv();
  if(st==='paid'||st==='pass'||st==='beat'){if(cv)cv.tollOk=1}
  if(st==='fight'){for(const e of t.mem)if(e.hp>0){e.d={...e.d,fac:'사'};e.angry=1;e.aggro=true;e.tgt=null}addText(t.chief.x,t.chief.y-.6,'쳐라!','#ff8a6a')}}
hook('npcDlg',c=>{if(c.html!=null||!c.n.tollNpc)return;const t=TOLL;if(!t||t.st!=='wait'){c.html='<p class="note">"가던 길이나 가라."</p>';return}
  const fr=nkFriend(),no=P.silver<t.fee;
  c.html=`<p class="note">"${esc(t.cv?SP_T.say.cv:SP_T.say.ask)}"</p><div class="card"><h4>녹림채 ${esc(t.name)} <small class="dim">길목 통행세</small></h4>
    <p class="note">길값 은자 <b class="gold">${t.fee}</b>${t.cv?' (표물 몫 포함, 내면 이 맵에서 행렬을 습격하지 않는다)':''}${P.sect&&SECTS[P.sect]&&SECTS[P.sect].al==='sacheon'?' · 사천맹이라 절반':''}. 맞서면 산채 전부와 싸운다.</p></div>
    <div class="ib">${fr?B('toll:pass','통과 (녹림채가 알아본다)',{pri:1}):''}${B('toll:pay',no?`은자 ${t.fee} 필요`:`길값 내기 · 은자 ${t.fee}`,{pri:!fr&&!no,d:no})}${B('toll:fight','맞서기')}</div>`});
hook('sectAct',c=>{if(c.a!=='toll')return;c.done=true;c.r=true;const t=TOLL;closePanels();if(!t||t.st!=='wait')return;const S=SP_T.say;
  if(c.x==='pass'&&nkFriend()){tollSet('pass');log(`${t.chief.name}: "${P.sect==='noklim'?S.pass:S.friend}"`,'info')}
  else if(c.x==='pay'&&P.silver>=t.fee){P.silver-=t.fee;tollSet('paid');repAdd('noklim',0,SP_T.rep||1);log(`${t.chief.name}에게 길값 은자 ${t.fee}을(를) 냈다. "${S.paid}"`,'info');addText(P.x,P.y-.6,`-${t.fee}`,'#e0c070')}
  else if(c.x==='fight'){tollSet('fight');log(`${t.chief.name}: "${S.fight}"`,'dmg')}});
// 다가가면 묻는다. 묻고도 그냥 밀고 들어오면 칼을 뽑는다
hook('tick',dt=>{const t=TOLL;if(!t||!P||!playing||G.duel||P.hp<=0||!t.chief)return;const d=dist(P,t.chief);
  if(t.st==='wait'&&t.chief.hp>0){if(t.asked&&d>(SP_T.ask||4.5)+3)t.asked=0;if(!t.asked&&d<(SP_T.ask||4.5)&&panel!=='npc')tollAsk();else if(t.asked&&d<(SP_T.push||1.8)&&panel!=='npc'){tollSet('fight');log(`길값도 내지 않고 밀고 들어가자 ${t.chief.name}이(가) 칼을 뽑았다.`,'dmg')}}
  if(t.st==='fight'&&t.mem.every(e=>e.hp<=0)){tollSet('beat');const B0=SP_T.beat||{};P.fame+=B0.fame||0;if(pfac()!=='사')P.good+=B0.good||0;log(`녹림채 ${t.name}의 길목을 뚫었다. 명성 +${B0.fame||0}`,'xp');feat(`녹림채 ${t.name}의 길목을 칼로 뚫었다`)}});
// 길값을 냈거나 산채를 뚫었으면 이 맵에서는 행렬을 덮치지 않는다
if(typeof cvAmbush==='function'){const o=cvAmbush;cvAmbush=function(cv,esc){if(cv&&cv.tollOk)return;return o(cv,esc)}}
// 녹림채 조장부터: 산채 하나를 맡아 해마다 길값 몫
hook('newYear',()=>{if(!P||P.sect!=='noklim')return;const r=rankIdx('noklim');if(r<2)return;if(!P.nkCamp)P.nkCamp=pick(SP_T.camps||['산채']);
  const v=Math.round((SP_T.share||18)*r*Math.max(.2,Math.min(1,spPopK('noklim'))));if(v>0){P.silver+=v;log(`맡은 ${P.nkCamp}에서 올라온 길값 몫 은자 ${v}을(를) 받았다.`,'sys')}});

// ================= ② 장강수로채 물길 =================
const SURO=SP_W.suro||['janggang','dongjeong'];
const suroMe=()=>!!P&&SURO.includes(P.sect);
function waterAt(fx,fy){const x=Math.floor(fx),y=Math.floor(fy);if(!map||!map[y]||!map[y][x])return false;if(map[y][x].g===3)return true;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const r=map[y+j];if(r&&r[x+i]&&r[x+i].g===2)return true}return false}
const pWater=()=>!!P&&!P.perch&&!(P.z>0)&&waterAt(P.x,P.y);
{const o=pv;pv=function(t){const v=o(t);if(t!=='spd'||!P||!pWater())return v;return v+(suroMe()?SP_W.spd||0:-(SP_W.slow||0))}}
hook('hit',c=>{if(c.from===P&&suroMe()&&pWater())c.m*=1+(SP_W.atk||0)});
hook('hurt',c=>{const s=c.src;if(s&&SURO.includes(s.sect)&&waterAt(s.x,s.y))c.dm*=1+(SP_W.mobAtk||0);if(suroMe()&&pWater())c.dm*=1-(SP_W.def||0)});
// 물가를 처음 밟으면 한 번 알린다
hook('tick',()=>{if(!P||!playing||P.wHint===P.lifeNo||!pWater())return;P.wHint=P.lifeNo;
  log(suroMe()?'물길이 몸에 익었다. 물가와 다리 위에서는 수로채 무공이 빠르고 세다.':'물가에서는 발이 무겁다. 수로채 무인은 물에서 강하니 조심하라.','info')});
// 나루 봉쇄
const naruOn=()=>!!(G&&G.naru&&Math.floor(G.cal||0)<G.naru.till);
hook('newYear',()=>{if(!G)return;const N2=SP_W.naru;if(!N2)return;if(naruOn()){if(P&&P.sect==='janggang'&&rankIdx('janggang')>0){const v=N2.share*rankIdx('janggang');P.silver+=v;log(`막아 둔 나루에서 거둔 몫 은자 ${v}을(를) 받았다.`,'sys')}return}
  if(G.naru&&Math.floor(G.cal||0)>=G.naru.till){G.naru=null;log('장강의 나루가 다시 열렸다.','info')}
  if(!SECTS.janggang||sectGone('janggang')||Math.random()>=N2.p*Math.min(1,spPopK('janggang')))return;G.naru={till:Math.floor(G.cal||0)+1};log(N2.msg,'sys');showBanner('나루 봉쇄','장강수로채')});
const naruProv=id=>{const k=typeof provOf==='function'&&provOf(id);return !!k&&((SP_W.naru||{}).provs||[]).includes(k)};
function naruExtra(id){if(!naruOn()||suroMe()||!REGIONS[id])return 0;if(!naruProv(id)&&!naruProv(REG))return 0;const fee=id==='gaebong'?10:REGIONS[id].city?(typeof CITY_FEE!=='undefined'?CITY_FEE:POST_FEE):POST_FEE;
  return Math.round(fee*((SP_W.naru.mul||1.5)-1))}
if(typeof postGo==='function'){const o=postGo;postGo=function(id){const x=naruExtra(id);if(x){const fee=(id==='gaebong'?10:REGIONS[id].city?(typeof CITY_FEE!=='undefined'?CITY_FEE:POST_FEE):POST_FEE);
    if(P.silver<fee+x){log(`나루가 막혀 돌아가는 삯까지 은자 ${fee+x}이(가) 든다.`,'info');return}P.silver-=x;log(`장강 나루가 막혀 돌아간다. 웃돈 은자 ${x}.`,'info')}return o(id)}}
if(typeof postDlg==='function'){const o=postDlg;postDlg=function(){const h=o();return naruOn()?`<p class="note bad">장강수로채가 나루를 막았다. 장강 줄기(${((SP_W.naru||{}).provs||[]).map(k=>PROV[k]?PROV[k].n:k).join('·')})를 오가면 삯이 ${Math.round(((SP_W.naru||{}).mul||1.5)*100-100)}% 더 든다${suroMe()?' · 수로채 사람은 그대로':''}.</p>`+h:h}}

// ================= ③ 하오문 추적·역추적 =================
const haoD=()=>{P.hao=P.hao||{};return P.hao};
const haoMem=()=>!!P&&P.sect==='haomun';
const innHere=()=>typeof INNS!=='undefined'&&INNS.includes(REG);
const pvParts=()=>Object.keys(REGIONS).filter(k=>/^pv_/.test(k)&&(k.includes('@')||!Object.keys(REGIONS).some(o=>o.startsWith(k+'@'))));
function haoNew(){const L=pvParts();if(!L.length)return null;const reg=pick(L),H=SP_H;
  return{n:pick(H.names),crime:pick(H.crimes),reg,k:provOf(reg),clue:1,inns:[REG],y:realAge(),dir:pick(['동','서','남','북','북동','북서','남동','남서'])}}
const haoClueTxt=(h,i)=>{const pn=PROV[h.k]?PROV[h.k].n:'어느 성',mn=REGIONS[h.reg]?REGIONS[h.reg].name:'?';
  return['',`${pn}(으)로 갔다는 말이 돈다.`,`${pn} ${mn} 근처에서 봤다는 사람이 있다.`,`${mn} ${h.dir}쪽 길목에 숨어 지낸다. 지도에 적어 두었다.`][i]||''};
function haoCard(){const h=haoD().hunt;if(!h)return '';return `<div class="card"><h4>사람 찾기 <small class="dim">하오문 · 단서 ${h.clue}/${SP_H.need||3}</small></h4><p class="note"><b>${esc(h.n)}</b>: ${esc(h.crime)}.</p>${
  [1,2,3].filter(i=>i<=h.clue).map(i=>`<p class="note">· ${haoClueTxt(h,i)}</p>`).join('')}${h.clue<(SP_H.need||3)?'<p class="note dim">다른 객잔의 하오문 점소이에게 다음 단서를 묻는다.</p>':'<p class="note gold">대상이 있는 곳을 알았다. 그 맵에 가면 나타난다.</p>'}</div>`}
function haoDlgAdd(){if(!haoMem())return '';const d=haoD(),h=d.hunt;
  if(!h){const cd=d.cd!=null&&realAge()<d.cd;return `<div class="card"><h4>사람 찾기</h4><p class="note">"문의 장부에 새 이름이 올라왔소. 객잔 세 곳을 돌며 조각을 맞추면 어디 숨었는지 나오오."</p><div class="ib">${B('hao:take',cd?'요즘은 맡길 사람이 없다':'맡기',{pri:!cd,d:cd})}</div></div>`}
  if(h.clue>=(SP_H.need||3))return haoCard();const used=h.inns.includes(REG);
  return haoCard()+`<div class="ib">${B('hao:clue',used?'이 객잔에서는 이미 들었다':'다음 단서 묻기',{pri:!used,d:used})}</div>`}
hook('npcDlg',c=>{if(!c.n||c.n.intel!=='haomun'||c.html==null)return;c.html=haoDlgAdd()+haoFalseHtml()+c.html});
hook('sectAct',c=>{if(c.a!=='hao')return;c.done=true;c.r=true;const d=haoD();
  if(c.x==='take'&&haoMem()&&!d.hunt&&!(d.cd!=null&&realAge()<d.cd)&&innHere()){d.hunt=haoNew();if(d.hunt)log(`[사람 찾기] ${d.hunt.n}: ${d.hunt.crime}. 첫 단서: ${haoClueTxt(d.hunt,1)}`,'info')}
  else if(c.x==='clue'&&d.hunt&&innHere()&&!d.hunt.inns.includes(REG)&&d.hunt.clue<(SP_H.need||3)){const h=d.hunt;h.clue++;h.inns.push(REG);log(`[사람 찾기] 단서 ${h.clue}: ${haoClueTxt(h,h.clue)}`,'info')}
  else if(c.x==='false'){const f=haoMem()?0:SP_H.falseFee||80;if(P.silver<f)return;P.silver-=f;P.haoFalse=Math.floor(G.cal||0)+1;log(`하오문 점소이에게 거짓 행적을 흘려 달라 부탁했다${f?` (은자 ${f})`:''}. 한 해 동안은 내 행적이 팔리지 않는다.`,'info')}});
// 세 단서를 모으면 그 맵에서 나타난다
hook('enteredRegion',id=>{const h=P&&P.hao&&P.hao.hunt;if(!h||h.clue<(SP_H.need||3)||id!==h.reg||mobs.some(m=>m.haoT))return;
  later(.8,()=>{if(REG!==h.reg||mobs.some(m=>m.haoT))return;const p=spSpot(8,14);if(!p)return;const e=mkFac('사',1,p.x,p.y,pick(['haomun','heukpung','noklim']));
    e.d={...e.d,fac:null,hostile:1};e.angry=1;e.aggro=true;e.haoT=1;e.fixed='sapa';e.pursue='stay';e.name=`수배범 ${h.n}`;mobs.push(e);log(`단서대로 ${h.n}이(가) 숨어 있었다!`,'dmg');addText(e.x,e.y-.6,'!','#ff8a6a')})});
hook('kill',e=>{if(!e.haoT||!P.hao||!P.hao.hunt)return;const h=P.hao.hunt,S=SP_H,sv=Math.round(S.silver[0]+S.silver[1]*realmIdx());P.hao.hunt=null;P.hao.cd=realAge()+(S.cd||.5);P.silver+=sv;P.fame+=S.fame||0;
  if(haoMem())addMerit('haomun',S.merit||40);log(`수배범 ${h.n}을(를) 잡았다. 은자 +${sv}, 명성 +${S.fame||0}${haoMem()?`, 하오문 공적 +${S.merit}`:''}`,'xp');showBanner('사람 찾기','수배범을 잡았다');feat(`하오문의 단서로 수배범 ${h.n}을(를) 잡았다`)});
// 임무창 카드 (remnCard 뒤에 붙인다)
if(typeof remnCard==='function'){const o=remnCard;remnCard=function(){return o()+haoCard()+(typeof spCards==='function'?spCards():'')}}
// ---- 역추적: 점소이가 내 행적을 판다 ----
const haoChased=()=>!!P&&((P.wanted||0)>0||(typeof chbHunted==='function'&&chbHunted()));
function haoRisk(){if(!P||haoMem()||!SECTS.haomun||sectGone('haomun'))return 0;if(P.haoFalse&&Math.floor(G.cal||0)<P.haoFalse)return 0;const st=repStageOf(repSect('haomun'));if(st>=3)return 0;
  return st<=1||haoChased()?SP_H.sell||.35:0}
function haoFalseHtml(){if(haoMem()&&!haoChased())return '';const on=P.haoFalse&&Math.floor(G.cal||0)<P.haoFalse,f=haoMem()?0:SP_H.falseFee||80;
  return `<div class="row2"><span class="note">거짓 소문: 내 행적을 엉뚱한 곳으로 흘린다${on?' <b class="good">(올해는 흘려 두었다)</b>':' · 한 해 동안 객잔에서 팔리지 않는다'}</span>${on?'':B('hao:false',f?`은자 ${f}`:'흘리기',{d:P.silver<f})}</div>`}
hook('enteredRegion',id=>{if(!P||!playing)return;
  if(innHere()){const st=SECTS.haomun&&!haoMem()?repStageOf(repSect('haomun')):0;
    if(st>=3&&haoChased()&&Math.random()<.5){log('하오문 점소이가 슬쩍 귀띔한다: "누가 손님 행적을 묻고 다니오. 조심하시오."','info');return}
    const p=haoRisk();if(p&&Math.random()<p){P.haoSold={t:time};later(1.5,()=>{if(innHere())log('하오문 점소이가 당신을 흘끔 보더니 뒷문으로 빠져나갔다.','info')})}return}
  const s=P.haoSold;if(!s)return;if(time-s.t>(SP_H.win||300)){P.haoSold=null;return}if(!spOut()&&!/^lm_/.test(id))return;P.haoSold=null;
  later(2,()=>{if(!P||G.duel||!REGION())return;const f=(P.wanted||0)>0?'관':haoFoeFac();if(!f)return;const n=spSquad(f,SP_H.squad||3,null,'haoChase');
    if(n){showBanner('추격','팔린 행적');log(`하오문이 판 행적을 따라 ${FACN[f]} 무인 ${n}명이 따라붙었다!`,'dmg')}})});
function haoFoeFac(){const pf=pfac(),L=['정','사','마','관'].filter(f=>f!==pf&&(facFoe(f,pf)||repStageOf(repFac(f))<=1));if(!L.length)return null;return L.sort((a,b)=>repFac(a)-repFac(b))[0]}

// ================= ④ 사마세가 하극상 =================
const SMS='sama';
const smPerson=i=>(SP_S.names||['사마량'])[i%((SP_S.names||[1]).length)];
if(typeof rtWhy==='function'){const o=rtWhy;rtWhy=function(sid,where=true){if(sid!==SMS)return o(sid,where);const s=SECTS[sid];if(!s||P.sect!==sid||!P.srank)return'문파 제자만 청할 수 있다';
  const i=rankIdx(sid),to=i+1;if(i>=rankTop(sid))return'이미 가장 높은 직위다';const t=(P.mtot||{})[sid]||0,need=Math.round(RANK_PTS[to]*(SP_S.meritK||.5));
  if(t<need)return`사마세가는 공적보다 칼이지만, 선배에게 도전하려면 누적 공적 ${need}은 있어야 한다 (지금 ${t})`;
  if(rankCap()<to)return`${rankName(sid,to)} 선배에게 도전하려면 ${capNeed(to)} 이상이어야 한다`;
  const c=(P.rtCool||{})[sid];if(c!=null&&P.age<c)return`지난 도전에서 져 조금 더 수련해야 한다 (${Math.max(1,Math.ceil((c-P.age)*12))}달 뒤)`;
  if(G.duel||P.jail||P.hp<=0)return'지금은 도전할 수 없다';
  if(where&&!(panel==='npc'&&panelArg&&panelArg.hq===sid))return`본산 ${hqPlace(s)}에서 ${masterTitle(s)} 앞에서 청한다`;return''}}
if(typeof rtHtml==='function'){const o=rtHtml;rtHtml=function(s){if(s.id!==SMS||P.sect!==SMS)return o(s);const i=rankIdx(SMS);if(i>=rankTop(SMS))return'';const why=rtWhy(SMS),to=i+1;
  return `<div class="row2"><span class="note"><b>하극상</b>: 사마세가의 자리는 빼앗는 것이다. ${rankName(SMS,to)} 선배 <b>${smPerson(to)}</b>을(를) 비무로 꺾으면 그 자리가 내 것이 된다.${why?` <small class="dim">${why}</small>`:''}</span>${B('rtest:'+SMS,'선배에게 도전',{pri:!why,d:!!why})}</div>`}}
if(typeof rtStart==='function'){const o=rtStart;rtStart=function(sid){o(sid);if(sid!==SMS||!G.rtDuel)return;const t=G.rtDuel,e=mobs.find(m=>m.rtExam&&m.hp>0);t.sama=1;t.foe=smPerson(t.to);
  if(e){const r=e.realm||0,es=eliteStat(r,SP_S.kh||.9,SP_S.ka||.85);Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk});e.name=`${rankName(SMS,t.to)} ${t.foe}`}
  showBanner('하극상',`${rankName(SMS,t.to)} ${t.foe}`);log(`${t.foe}: "아랫것이 감히 내 자리를 넘봐? 좋다, 칼로 말해라."`,'dmg')}}
if(typeof rtEnd==='function'){const o=rtEnd;rtEnd=function(win,e){const t=G.rtDuel;o(win,e);if(!t||!t.sama)return;
  if(win){const W=SP_S.win||{};P.fame+=W.fame||0;P.smFoe=P.smFoe||[];P.smFoe.push(t.foe);if(P.smFoe.length>4)P.smFoe.shift();log(`${t.foe}을(를) 꺾고 그 자리를 빼앗았다. 꺾인 선배는 원한을 품었다. 명성 +${W.fame||0}`,'xp')}
  else log(`${t.foe}: "자리는 힘으로 지키는 것이다." 하극상은 실패했다.`,'dmg')}}
// 아래 서열의 도전: 해마다
let smChalOn=false;
hook('newYear',()=>{if(!P||P.sect!==SMS||!P.srank||rankIdx(SMS)<1||Math.random()>=(SP_S.chal||.3))return;smChalOn=true;setTimeout(()=>{if(playing)smChallenge()},4500)});
function smChallenge(){smChalOn=false;if(!P||P.sect!==SMS||G.duel||P.jail||P.hp<=0||!REGION()||P.traveling||rankIdx(SMS)<1)return false;const i=rankIdx(SMS),rev=(P.smFoe||[]).length&&Math.random()<.5;
  const nm=rev?P.smFoe[Math.floor(Math.random()*P.smFoe.length)]:smPerson(i+3),r=clamp(realmIdx(),0,8),K=SP_S.chalK||[.75,.75],es=eliteStat(r,K[0],K[1]),p=spSpot(2,3)||{x:P.x+2,y:P.y};
  closePanels();G.duel=true;G.smDuel={x:P.x,y:P.y,i,n:nm,rev};for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}P.path=null;P.target=null;P.leap=null;
  const cls=pick(['검','도']),e=mkMob(nm,p.x,p.y,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.3,reach:1.4,el:typeof simSectEl==='function'?simSectEl(SMS):'금',pal:'duelist',hostile:1,aggro:9,duelist:1,elite:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls,smChal:1});e.d=Object.assign({},e.d,{pal:(typeof sectPal==='function'&&sectPal(SMS,Math.max(0,i-1),cls,{elite:1}))||'duelist'});
  e.name=`사마세가 ${rev?'원한의 ':''}${nm}`;mobs.push(e);P.target=e;showBanner('하극상','아래 서열의 도전');
  log(rev?`꺾였던 ${nm}이(가) 이를 갈며 돌아왔다. "내 자리를 돌려받겠다!" 피할 수 없다.`:`사마세가 ${nm}이(가) ${rankName(SMS,i)} 자리를 걸고 비무를 청했다. 사마세가에서는 거절할 수 없다.`,'dmg');return true}
function smChalEnd(win){const t=G.smDuel;G.duel=false;G.smDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!t)return;
  if(win){const W=SP_S.win||{};P.fame+=W.fame||0;addMerit(SMS,W.merit||0);if(t.rev&&P.smFoe)P.smFoe=P.smFoe.filter(n=>n!==t.n);log(`${t.n}을(를) 물리쳤다. ${rankName(SMS)}의 자리는 그대로다. 명성 +${W.fame||0}`,'xp');showBanner('도전 격퇴',rankName(SMS))}
  else{P.hp=Math.max(1,Math.round(P.maxHp*.3));if(P.srank&&P.srank[SMS]>0){P.srank[SMS]--;if(typeof garbSync==='function')try{garbSync()}catch(err){}recalc()}
    log(`${t.n}에게 졌다. 자리를 빼앗겨 ${rankName(SMS)}(으)로 내려앉았다.`,'dmg');showBanner('자리를 잃다',rankName(SMS));feat(`하극상에 져 사마세가 ${rankName(SMS)}(으)로 내려앉았다`)}}
{const de=duelEnd;duelEnd=function(win,e){if(G.smDuel){if(win)runHooks('duelWon',e);return smChalEnd(win)}return de(win,e)}}
hook('tick',()=>{const t=G.smDuel;if(!t||!P||!playing)return;if(Math.hypot(P.x-t.x,P.y-t.y)>(SP_S.ring||9)){log('비무 자리를 벗어났다. 도전에 진 것으로 친다.','dmg');duelEnd(false)}});
hook('gLoaded',()=>{if(G.smDuel){G.smDuel=null;G.duel=false}});

// ================= 2순위 =================
// ⑤ 청부(살수) 의뢰: 사파 사람은 객잔 하오문 점소이에게서 적 세력 문파 무인 하나를 맡는다. 목격자(호위)를 남긴 채 맵을 떠나면 들켜 그 문파의 수배를 받는다
// ⑥ 만독문 산공독: 만독문 정예에게 맞으면 내공을 잃고 한동안 운기조식·내공 약이 듣지 않는다. 내공이 큰 사람일수록 오래 간다
// ⑦ 악인곡: 악명 높거나 쫓기는 몸만 들어가는 숨은 골짜기. 추격이 끊기고, 악인들이 수법·시험·치료를 판다. 곡 안에서는 선업이 오르지 않는다
const SP_C=SAPA.chb||{},SP_G=SAPA.sg||{},SP_A=SAPA.akin||{};
const chbD=()=>{P.chb=P.chb||{};return P.chb};
const chbOk=()=>!!P&&pfac()==='사'&&P.sect!=='cheonma';
const chbHunted=()=>!!(P&&P.chb&&P.chb.w&&(G.cal||0)<P.chb.w.till);
function chbNew(){const pf=pfac(),L=liveSects().filter(s=>s.al!=='seoe'&&facFoe(alFac(s.al),pf));if(!L.length)return null;const s=pick(L),k=provOf(hqId(s));
  const regs=pvParts().filter(id=>provOf(id)===k),reg=regs.length?pick(regs):pick(pvParts());return{sid:s.id,n:pick(SP_C.names),why:pick(SP_C.why),reg,k:provOf(reg)}}
function chbCard(){const j=P.chb&&P.chb.job;if(!j||!SECTS[j.sid])return '';const s=SECTS[j.sid],R=REGIONS[j.reg];
  return `<div class="card"><h4>은밀한 청부 <small class="dim">${s.n}</small></h4><p class="note"><b>${esc(s.n)} ${esc(j.n)}</b>. ${esc(j.why)}. ${PROV[j.k]?PROV[j.k].n:''} ${R?R.name:''}에서 호위 둘을 데리고 다닌다.${j.dead?' <b class="gold">대상은 쓰러졌다. 목격자의 입을 막고 떠나라.</b>':''}</p><p class="note dim">목격자를 남긴 채 맵을 떠나면 들켜서 ${s.n}의 수배를 받는다.</p></div>`}
function chbDlgAdd(){if(!chbOk())return '';const d=chbD();if(d.job)return chbCard()+`<div class="ib">${B('chb:drop','청부 물리기')}</div>`;const cd=d.cd!=null&&realAge()<d.cd;
  return `<div class="card"><h4>은밀한 청부</h4><p class="note">"목소리를 낮추시오. 사람 하나를 조용히 치워 줄 손이 필요하다는 의뢰가 들어왔소. 들키면 그 문파가 끝까지 쫓을 것이오."</p><div class="ib">${B('chb:take',cd?'지금은 의뢰가 없다':'의뢰 듣기',{pri:!cd,d:cd})}</div></div>`}
hook('npcDlg',c=>{if(!c.n||c.n.intel!=='haomun'||c.html==null)return;c.html=chbDlgAdd()+c.html});
hook('sectAct',c=>{if(c.a!=='chb')return;c.done=true;c.r=true;const d=chbD();
  if(c.x==='take'&&chbOk()&&!d.job&&!(d.cd!=null&&realAge()<d.cd)&&innHere()){d.job=chbNew();if(d.job)log(`[청부] ${SECTS[d.job.sid].n} ${d.job.n}. ${d.job.why}. ${REGIONS[d.job.reg].name}에 있다.`,'info')}
  else if(c.x==='drop'&&d.job){log(`[청부] ${d.job.n}의 일을 물렸다.`,'info');d.job=null;d.cd=realAge()+(SP_C.cd||.4)}});
hook('enteredRegion',id=>{const j=P&&P.chb&&P.chb.job;if(!j||j.dead||id!==j.reg||mobs.some(m=>m.chbT))return;
  later(.8,()=>{if(REG!==j.reg||mobs.some(m=>m.chbT)||!SECTS[j.sid])return;const p=spSpot(9,15);if(!p)return;const s=SECTS[j.sid],f=alFac(s.al);
    const mk=(el,x,y,nm)=>{const e=mkFac(f,el,x,y,s.id);e.chb=1;e.fixed='sapa';e.pursue='stay';e.home={x,y};if(nm)e.name=nm;mobs.push(e);return e};
    const t=mk(1,p.x,p.y,`${s.n} ${j.n}`);t.chbT=1;for(let i=0;i<(SP_C.guards||2);i++){const q=spSpot(1,2,p);if(q){const g=mk(0,q.x,q.y,`${s.n} 호위`);g.chbW=1}}
    log(`청부 대상 ${t.name}이(가) 이 근처에 있다. 호위를 남기지 마라.`,'info')})});
const chbWit=()=>mobs.filter(m=>m.chbW&&m.hp>0&&!m.dead);
function chbPay(j,seen){const d=chbD(),S=SP_C,sv=Math.round(S.silver[0]+S.silver[1]*realmIdx()),s=SECTS[j.sid];d.job=null;d.cd=realAge()+(S.cd||.4);d.n=(d.n||0)+1;P.silver+=sv;P.evil+=S.evil||0;
  if(P.sect==='haomun'||P.sect==='gwiyeong')addMerit(P.sect,S.merit||0);if(typeof heukAdd==='function')heukAdd('chb');
  if(seen){const R=S.rep||{};repAdd(j.sid,R.fac||-15,R.sect||-40);d.w={sid:j.sid,till:Math.floor(G.cal||0)+(S.years||2)};log(`목격자가 살아서 달아났다. ${s.n}이(가) 청부의 손을 알아냈다! ${S.years||2}년 동안 ${s.n} 추격대가 쫓는다. (은자 +${sv})`,'dmg');showBanner('수배',`${s.n}의 추격`)}
  else{log(`청부를 깨끗이 마쳤다. 아무도 보지 못했다. 은자 +${sv}${P.sect==='haomun'||P.sect==='gwiyeong'?`, 공적 +${S.merit}`:''}`,'xp');showBanner('청부 완수','목격자 없음')}
  feat(`${s.n}의 ${j.n}을(를) 청부로 쓰러뜨렸다`)}
hook('kill',e=>{const j=P.chb&&P.chb.job;if(!j||!e.chb)return;if(e.chbT){j.dead=1;if(!chbWit().length)chbPay(j,false);else log(`${e.name}이(가) 쓰러졌다. 목격자 ${chbWit().length}명이 보았다. 이 맵을 떠나기 전에 입을 막아라!`,'dmg')}
  else if(j.dead&&!chbWit().length)chbPay(j,false)});
hook('leaveRegion',c=>{const j=P&&P.chb&&P.chb.job;if(!j||!j.dead||c.from!==j.reg)return;chbPay(j,chbWit().length>0)});
// 청부로 친 무인은 들키기 전까지 우호도를 건드리지 않는다
if(typeof repKill==='function'){const o=repKill;repKill=function(e,foe){if(e&&e.chb)return;return o(e,foe)}}
if(typeof repHit==='function'){const o=repHit;repHit=function(e){if(e&&e.chb)return;return o(e)}}
// 수배: 바깥 맵에 들 때 그 문파 추격대
hook('enteredRegion',id=>{if(!chbHunted()||!playing||REGIONS[id].neutral)return;if(!spOut()&&!/^lm_/.test(id))return;const w=P.chb.w,s=SECTS[w.sid];if(!s||sectGone(s.id))return;
  if(time-(w.t||-1e9)<(SP_C.cool||150)||Math.random()>=(SP_C.huntP||.4))return;w.t=time;
  later(2,()=>{if(!P||G.duel||!REGION()||REGION().neutral)return;const n=spSquad(alFac(s.al),SP_C.squad||3,s.id,'chbHunt',`${s.n} 추격대`);if(n)log(`청부의 원한을 갚으러 ${s.n} 추격대 ${n}명이 나타났다!`,'dmg')})});
hook('newYear',()=>{const w=P&&P.chb&&P.chb.w;if(w&&(G.cal||0)>=w.till){P.chb.w=null;log(`${SECTS[w.sid]?SECTS[w.sid].n:'그 문파'}의 청부 수배가 풀렸다.`,'info')}});

// ---- ⑥ 만독문 산공독 ----
const sgImm=()=>!!P&&(P.hgt||P.gang);
const sgOn=()=>!!P&&(P.sgT||0)>0;
function sgApply(src){if(!P||sgImm()||sgOn())return false;const r=clamp(P.maxQi/((P.maxQi+P.maxHp)||1),0,1),S=SP_G;P.sgT=Math.round(S.base*(.6+1.6*r)*10)/10;
  const lose=Math.round(P.qi*S.loss*(.5+r));P.qi=Math.max(0,P.qi-lose);addText(P.x,P.y-.7,'산공독','#9be36a');fx.push({t:'ring',x:P.x,y:P.y,life:.5,max:.5,col:'120,200,90'});
  log(`${src&&src.name?src.name+'의 ':''}산공독에 당했다! 내공 -${lose}. ${P.sgT}초 동안 운기조식이 듣지 않고 내공 약도 소용없다. 해독단으로 풀 수 있다.`,'dmg');return true}
hook('hurt',c=>{const s=c.src;if(!s||s.sect!=='mandok'||!(s.rank>=2||(s.d&&(s.d.elite||s.d.boss))))return;if(Math.random()<(SP_G.p||.25))sgApply(s)});
hook('tick',dt=>{if(!P||!(P.sgT>0))return;P.sgT=Math.max(0,P.sgT-(dt||0));if(!P.sgT)log('산공독이 풀려 내공이 다시 돈다.','info')});
{const o=realmQiMul;realmQiMul=function(){return sgOn()?0:o()}}
hook('useCon',c=>{if(!sgOn()||c.done)return;const k=c.k;
  if((SP_G.potions||[]).includes(k)){c.done=true;log('산공독이 내공 길을 막아 약 기운이 돌지 않는다. 해독단부터 먹어야 한다.','info');return}
  if(k==='해독단'&&!P.poison&&P.mats[k]>0){c.done=true;P.sgT=0;P.mats[k]--;addText(P.x,P.y,'해독','#a6d47f');log('해독단으로 산공독을 풀었다.','xp');renderOpen()}else if(k==='해독단')P.sgT=0});
hook('recalc',()=>{if(sgImm()&&P.sgT)P.sgT=0});
// 만독문 고급 무공으로 치면 적의 내공 길을 막는다
const sgArt=a=>!!a&&(a.sect==='mandok'||(typeof artSect==='function'&&(artSect(a.id)||{}).id==='mandok'))&&(a.hi||(a.grade||0)>=2);
hook('hitDone',c=>{const e=c.e;if(c.from!==P||!e||e.hp<=0||!sgArt(c.X&&c.X.art)||(e.sgT||0)>time)return;if(Math.random()>=(SP_G.pp||.3))return;e.sgT=time+(SP_G.mobDur||8);e.skT=Math.max(e.skT||0,SP_G.mobDur||8);addText(e.x,e.y-.6,'산공','#9be36a')});
hook('hurt',c=>{const s=c.src;if(s&&(s.sgT||0)>time)c.dm*=1-(SP_G.mobCut||.3)});

// ---- ⑦ 악인곡 ----
const AK_ID='cv_akin';
const akinEvil=()=>!!P&&((P.evil||0)-(P.good||0)>=(SP_A.evil||60));
const akinWhy=()=>{if(!P)return'';if(akinEvil()||(P.wanted||0)>0||chbHunted()||(P.sect==='cheonma'&&P.fame>=((typeof MARA!=='undefined'&&MARA.huntFame)||9e9))||(typeof heukTier==='function'&&heukTier()>=1))return'';return SP_A.say.gate};
if(SP_A.host&&REGIONS[SP_A.host]){const W=SP_A.size||40,c={pid:SP_A.host,kind:'trial',th:'shadow',n:SP_A.n,w:W,h:W,seed:SP_A.seed||6610},mid=Math.floor(W/2),rm=caveRooms(W,W),T=CAVE_TH.shadow,at=SP_A.at;
  const npc=(id,n,r,dx,pal)=>({id,akin:id,n,x:r.x+.5+dx,y:r.y+.5,pal});
  REGIONS[AK_ID]={name:SP_A.n,in:1,neutral:1,cave:{dark:T.dark,dk:T.dk,kind:'trial',th:'shadow',pid:c.pid},theme:'dark',size:W,gen:()=>genCave(c),bake:()=>bakeCave('shadow'),zone:()=>SP_A.n,spawns:[],bosses:[],
    npcs:[npc('akchief','악인곡주 혈수',rm[2],0,'cultist'),npc('akleaf','수법 장수 귀면',rm[1],-1.5,'npc'),npc('akdoc','독의 백골노',rm[1],1.8,'npc'),npc('akspy','소식꾼 쥐눈이',rm[3],0,'npc')],
    gates:[{x:mid+.5,y:W-1.6,to:c.pid,tx:at[0],ty:at[1]+1.6,label:`${REGIONS[c.pid].name}(으)로`,door:1,caveOut:1}]};
  REGIONS[c.pid].gates.push({x:at[0],y:at[1],to:AK_ID,tx:mid+.5,ty:W-3.5,label:SP_A.n,door:1,need:()=>akinWhy()||null})}
hook('enteredRegion',id=>{if(id!==AK_ID||!P)return;P.akGood=P.good||0;P.haoSold=null;mobs=mobs.filter(m=>!m.hunt);if(!P.akSeen){P.akSeen=1;feat('악인곡에 숨어들었다')}log(SP_A.say.in,'info');showBanner(SP_A.n,'쫓기는 자들의 골짜기')});
hook('tick',()=>{if(!P||REG!==AK_ID||P.akGood==null)return;if((P.good||0)>P.akGood)P.good=P.akGood});
hook('leaveRegion',c=>{if(c.from===AK_ID&&P)P.akGood=null});
function akinDlg(n){const k=n.akin,y=Math.floor(G.cal||0);
  if(k==='akchief'){const done=P.akTest===y;return `<p class="note">"강호에서 버림받은 놈들이 모여 사는 곳이다. 여기서는 내 말이 법이다. 쓸 만한 놈인지 보자."</p><div class="card"><h4>곡주의 시험</h4><p class="note">곡주가 고른 악인과 겨룬다. 이기면 사파 상승 이상 무공의 낱장과 악명(명성 +${SP_A.test.fame}). 해마다 한 번.</p><div class="ib">${B('akin:test',done?'올해는 이미 겨뤘다':'시험 받기',{pri:!done,d:done||G.duel})}</div></div>`}
  if(k==='akleaf')return `<p class="note">"정파 놈들한테서 훔친 것도, 문파를 배신하고 들고 나온 것도 있지. 값만 맞으면 묻지 않는다."</p><div class="row2"><span class="note">사파 무공 비급 낱장 한 장</span>${B('akin:leaf',`은자 ${SP_A.leaf}`,{d:P.silver<SP_A.leaf})}</div>`;
  if(k==='akdoc')return `<p class="note">"독으로 사람을 죽이던 손이 이제는 살린다. 공짜는 아니다."</p><div class="row2"><span class="note">생명·내공을 채우고 독·산공독·중독을 씻는다</span>${B('akin:heal',`은자 ${SP_A.heal}`,{d:P.silver<SP_A.heal})}</div>`;
  if(k==='akspy'){const on=chbHunted()||(P.wanted||0)>0;return `<p class="note">"누가 형씨를 쫓는지 다 듣고 있소. ${on?'지금도 여럿이 이를 갈고 있지.':'지금은 조용하구려.'} 여기 있는 동안은 아무도 못 들어오오."</p>${chbHunted()?`<p class="note">${SECTS[P.chb.w.sid]?SECTS[P.chb.w.sid].n:''} 청부 수배 · ${Math.max(0,P.chb.w.till-Math.floor(G.cal||0))}년 남음</p>`:''}`}
  return null}
hook('npcDlg',c=>{if(c.html==null&&c.n&&c.n.akin)c.html=akinDlg(c.n)});
hook('sectAct',c=>{if(c.a!=='akin')return;c.done=true;c.r=true;if(REG!==AK_ID)return;
  if(c.x==='leaf'&&P.silver>=SP_A.leaf){const id=leafPick({sects:liveSects().filter(s=>s.al==='sacheon').map(s=>s.id)});if(!id)return;P.silver-=SP_A.leaf;giveLeaf(id,1,'악인곡 수법 장수')}
  else if(c.x==='heal'&&P.silver>=SP_A.heal){P.silver-=SP_A.heal;P.hp=P.maxHp;P.qi=P.maxQi;P.poison=0;P.sgT=0;P.tdok=0;log(`백골노가 독을 씻어 주었다. (은자 -${SP_A.heal})`,'xp')}
  else if(c.x==='test')akinTest()});
function akinTest(){const y=Math.floor(G.cal||0);if(P.akTest===y||G.duel)return;P.akTest=y;const r=clamp(realmIdx(),0,8),T=SP_A.test,es=eliteStat(r,T.kh,T.ka),p=spSpot(2,3)||{x:P.x+2,y:P.y};
  closePanels();G.duel=true;G.akDuel={x:P.x,y:P.y};P.path=null;P.target=null;P.hp=P.maxHp;P.qi=P.maxQi;const cls=pick(['도','검','권']);
  const e=mkMob('곡주의 악인',p.x,p.y,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.4,reach:1.4,el:'독',pal:'duelist',hostile:1,aggro:9,duelist:1,elite:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls});e.d=Object.assign({},e.d,{pal:'cultist'});e.name=pick(['피묻은 손 왕노','십악 마두','독수 귀파','도살자 손이랑']);mobs.push(e);P.target=e;
  showBanner('곡주의 시험',e.name);log(`곡주: "죽이지는 마라. 쓸모를 보려는 것이니." ${e.name}이(가) 앞으로 나섰다.`,'sys')}
function akinTestEnd(win){G.duel=false;G.akDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;
  if(win){const T=SP_A.test,id=leafPick({sects:liveSects().filter(s=>s.al==='sacheon').map(s=>s.id),minG:T.minG});P.fame+=T.fame;if(id)giveLeaf(id,1,'악인곡주');log(`곡주가 웃었다. "쓸 만하군." 명성 +${T.fame}`,'xp');feat('악인곡주의 시험을 통과했다')}
  else{P.hp=Math.max(1,Math.round(P.maxHp*.3));log('곡주: "아직 멀었다. 내년에 다시 와라."','dmg')}}
{const de=duelEnd;duelEnd=function(win,e){if(G.akDuel){if(win)runHooks('duelWon',e);return akinTestEnd(win)}return de(win,e)}}
hook('gLoaded',()=>{if(G.akDuel){G.akDuel=null;G.duel=false}});
// 처음 쫓기는 몸이 되면 한 번 소문을 듣는다
hook('newYear',()=>{if(!P||P.akHint===P.lifeNo||akinWhy()||P.akSeen)return;P.akHint=P.lifeNo;log(`쫓기는 자들 사이에 도는 소문: ${REGIONS[SP_A.host]?REGIONS[SP_A.host].name:'감숙'} 깊은 골짜기에 악인곡이 있어, 거기 숨으면 아무도 쫓아오지 못한다고 한다.`,'info')});
// 임무창 카드
function spCards(){return chbCard()}

// ================= 3순위: 이야기·연합 =================
// ⑧ 사천맹이 한덩어리가 아니게: 천하대전 구도를 정할 때 내 행적에 따라 사천맹 문파 하나가 중립이나 정파 편으로 빠진다 (화산귀환의 녹림처럼)
// ⑨ 사천맹 소맹주 다툼: 부맹주에 오르면 후계 경쟁. 후보들의 자객을 버티고 호위를 모아 맹주 앞 비무에서 이긴다 (마교 소교주 쟁탈과 짝)
// ⑩ 흑도 평판: 약탈·청부·양민 살해가 쌓이면 '흑도'. 정파·관부가 더 미워하고 토벌대가 온다. 손이 깨끗한 사파는 정파와 가까워지기 쉽다
const SP_D=SAPA.defect||{},SP_M=SAPA.smj||{},SP_K=SAPA.heuk||{};
// ---- ⑧ 사천맹 이탈 ----
function defectPick(plan){if(!plan||!plan.sides||!plan.sides.some(s=>s.includes('사'))||!P)return null;const pf=pfac();if((repD().fac['정']||0)<(SP_D.jeong||20)&&pf!=='정')return null;
  const L=(SP_D.sects||[]).filter(id=>SECTS[id]&&!sectGone(id)&&SECTS[id].al==='sacheon'&&P.sect!==id).map(id=>[id,repSect(id)]).filter(x=>x[1]>=(SP_D.minRep||40)).sort((a,b)=>b[1]-a[1]);if(!L.length)return null;
  const[sid,v]=L[0],to=v>=(SP_D.ally||70)&&plan.sides.some(s=>s.includes('정'))?'정':'중립';return{sid,to}}
if(typeof warPlan==='function'){const o=warPlan;warPlan=function(){const p=o();const d=defectPick(p);if(!d)return p;p.defect=d;const s=SECTS[d.sid];
  p.notes=(p.notes||[]).concat(d.to==='정'?`${s.n}이(가) 사천맹을 떠나 정파 편에 선다`:`${s.n}이(가) 사천맹을 떠나 중립을 지킨다`);
  if(typeof powAdd==='function'){powAdd('사',-(SP_D.pow||6));if(d.to==='정')powAdd('정',(SP_D.pow||6)/2)}feat(`${s.n}을(를) 사천맹에서 떼어 냈다`);return p}}
const defectOf=()=>G&&G.war&&G.war.plan&&G.war.plan.defect;
hook('facMade',e=>{const d=defectOf();if(d&&e.sect===d.sid)e.warAlly=1});
{const o=warEnd;warEnd=function(silent){const d=defectOf();o(silent);if(!d||!SECTS[d.sid])return;const rec=G.wars[G.wars.length-1];if(rec)rec.defect=d;const s=SECTS[d.sid];
  if(rec&&rec.won&&rec.won.includes('사')&&typeof popSet==='function'&&G.pop){popSet(d.sid,G.pop[d.sid]*(SP_D.punish||.85),'');if(typeof popSync==='function')popSync();log(`사천맹이 이겼다. 맹을 떠났던 ${s.n}은(는) 배신의 대가를 치렀다.`,'info')}
  else log(`사천맹을 떠났던 ${s.n}은(는) 대전의 불길을 비켜 갔다.`,'info')}}
// ---- ⑨ 소맹주 다툼 ----
const smjOn=()=>!!(P&&P.smjE&&P.smjE.st!=='done'&&P.smjE.st!=='lost'&&P.smjE.life===P.lifeNo);
const smjVice=()=>typeof maengOf==='function'&&maengOf()==='sacheon'&&maengRank('sacheon')>=5;
hook('newYear',()=>{if(!P)return;if(P.smj&&P.smj.life===P.lifeNo){P.silver+=SP_M.income||0;log(`사천맹 소맹주의 몫으로 은자 ${SP_M.income}을(를) 받았다.`,'xp');return}
  if(smjOn()||P.smjE&&P.smjE.life===P.lifeNo||!smjVice()||Math.random()>=(SP_M.p||.5))return;
  const R=(SP_M.rivals||[]).filter(r=>!P.sect||!SECTS[P.sect]||SECTS[P.sect].n!==r[0]),two=[];while(two.length<2&&R.length)two.push(R.splice(Math.floor(Math.random()*R.length),1)[0]);
  P.smjE={life:P.lifeNo,st:'open',rivals:two,guard:0,tries:0,t:-1e9};showBanner('소맹주 다툼','사천맹의 후계');
  log(`맹주가 후계를 정하겠다고 했다. 소맹주 후보: 당신, ${two.map(r=>`${r[0]}의 ${r[1]}`).join(', ')}. 후보들의 자객을 조심하라. 맹 총단 맹주에게서 호위를 구할 수 있다.`,'sys')});
hook('enteredRegion',id=>{if(!smjOn()||P.smjE.st!=='open'||!playing||REGIONS[id].neutral)return;if(!spOut()&&!/^lm_/.test(id))return;const E=P.smjE;
  if(time-E.t<(SP_M.cool||180)||Math.random()>=(SP_M.assP||.45))return;E.t=time;
  later(2,()=>{if(!smjOn()||G.duel||!REGION())return;const r=pick(E.rivals),n=Math.max(1,(SP_M.ass||3)-E.guard);const m=spSquad('사',n-1,null,'smjAss',`${r[1]}의 자객`);
    if(E.guard)log(`호위 ${E.guard}명이 자객을 막아섰다.`,'info');log(`${r[0]} ${r[1]}이(가) 보낸 자객 ${m}명이 덮쳤다!`,'dmg');E.wave={n:m}})});
hook('kill',e=>{if(!e.smjAss||!smjOn())return;const E=P.smjE;if(mobs.some(m=>m.smjAss&&m.hp>0))return;E.tries++;
  if(E.tries>=(SP_M.tries||2)){E.st='ready';log('자객들을 모두 물리쳤다. 맹주가 소맹주 비무를 열겠다고 한다. 맹 총단 맹주에게 가라.','xp');showBanner('소맹주 비무','맹 총단에서')}else log(`자객을 물리쳤다 (${E.tries}/${SP_M.tries||2}). 아직 끝나지 않았다.`,'info')});
function smjHtml(){if(!P)return '';if(P.smj&&P.smj.life===P.lifeNo)return `<div class="card"><h4>소맹주</h4><p class="note">당신은 사천맹의 소맹주다. 해마다 은자 ${SP_M.income} · 맹 공적 ×${SP_M.merit}.</p></div>`;
  if(!smjOn())return '';const E=P.smjE,full=E.guard>=2,no=((P.mpt||{}).sacheon||0)<(SP_M.guardCost||120);
  return `<div class="card"><h4>소맹주 다툼 <small class="dim">${E.st==='ready'?'비무 준비':'자객 '+E.tries+'/'+(SP_M.tries||2)}</small></h4><p class="note">후보: ${E.rivals.map(r=>`${r[0]} ${r[1]}`).join(' · ')}. 호위 ${E.guard}/2.</p>
    <div class="ib">${B('smj:guard',full?'호위가 찼다':`호위 구하기 · 맹 공적 ${SP_M.guardCost}`,{d:full||no})}${E.st==='ready'?B('smj:duel','소맹주 비무',{pri:1,d:!!G.duel}):''}</div></div>`}
hook('npcDlg',c=>{if(c.html==null||!c.n||c.n.maeng!=='sacheon'||c.n.role!=='leader')return;c.html=smjHtml()+c.html});
hook('sectAct',c=>{if(c.a!=='smj')return;c.done=true;c.r=true;if(!smjOn())return;const E=P.smjE;
  if(c.x==='guard'&&E.guard<2&&((P.mpt||{}).sacheon||0)>=SP_M.guardCost){P.mpt.sacheon-=SP_M.guardCost;E.guard++;log(`맹의 고수 하나를 호위로 붙였다 (${E.guard}/2).`,'info')}
  else if(c.x==='duel'&&E.st==='ready'&&!G.duel)smjDuel()});
function smjDuel(){const E=P.smjE,rv=E.rivals[E.rivals.length-1],r=clamp(realmIdx(),0,8),es=eliteStat(r,SP_M.kh||1,SP_M.ka||.9),p=spSpot(2,3)||{x:P.x+2,y:P.y};
  closePanels();G.duel=true;G.smjDuel={x:P.x,y:P.y};P.path=null;P.target=null;P.hp=P.maxHp;P.qi=P.maxQi;const cls=pick(['도','검']);
  const e=mkMob(rv[1],p.x,p.y,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.4,reach:1.4,el:'금',pal:'duelist',hostile:1,aggro:9,duelist:1,elite:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls});e.d=Object.assign({},e.d,{pal:'chief'});e.name=`${rv[0]} ${rv[1]}`;mobs.push(e);P.target=e;
  showBanner('소맹주 비무',`${e.name}`);log(`맹주: "사천맹은 힘이 곧 법이다. 이기는 자가 소맹주다."`,'sys')}
function smjDuelEnd(win){G.duel=false;G.smjDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;const E=P.smjE;
  if(win){E.st='done';P.smj={life:P.lifeNo};P.fame+=SP_M.fame||0;showBanner('소맹주','사천맹의 후계');log(`소맹주가 되었다! 명성 +${SP_M.fame}. 해마다 은자 ${SP_M.income}, 맹 공적이 ×${SP_M.merit}로 쌓인다.`,'xp');feat('사천맹 소맹주가 되었다')}
  else{E.st='lost';P.hp=Math.max(1,Math.round(P.maxHp*.3));log('소맹주 비무에서 졌다. 이번 생에 후계의 길은 닫혔다.','dmg');feat('사천맹 소맹주 다툼에서 졌다')}}
{const de=duelEnd;duelEnd=function(win,e){if(G.smjDuel){if(win)runHooks('duelWon',e);return smjDuelEnd(win)}return de(win,e)}}
hook('gLoaded',()=>{if(G.smjDuel){G.smjDuel=null;G.duel=false}});
// 소맹주는 맹 공적이 더 쌓인다 (g_maeng.js maengSeatMul은 문파 공적용이라 맹 공적에 따로 곱한다)
hook('questDone',q=>{if(!q||!q.maeng||q.maeng!=='sacheon'||!(P.smj&&P.smj.life===P.lifeNo))return;const add=Math.round((q.merit||0)*((SP_M.merit||1.2)-1));if(add>0){P.mpt=P.mpt||{};P.mpt.sacheon=(P.mpt.sacheon||0)+add;log(`소맹주의 위세로 맹 공적 +${add}`,'xp')}});
// ---- ⑩ 흑도 평판 ----
function heukAdd(k){if(!P)return;const v=SP_K[k]||0;if(!v)return;const t0=heukTier();P.heuk=Math.round(((P.heuk||0)+v)*10)/10;const t1=heukTier();
  if(t1>t0){showBanner(SP_K.names[t1],'강호가 당신을 그렇게 부른다');log(`약탈과 피 묻은 손이 쌓여 강호가 당신을 '${SP_K.names[t1]}'(이)라 부른다. 정파와 관부가 더 미워한다${t1>=2?'. 해마다 토벌대가 온다':''}.`,'dmg')}}
const heukTier=()=>{const v=P&&P.heuk||0,T=SP_K.tier||[30,70];return v>=T[1]?2:v>=T[0]?1:0};
const heukWhite=()=>!!P&&pfac()==='사'&&(P.heuk||0)<(SP_K.white||10);
hook('cvRob',()=>heukAdd('rob'));
hook('kill',e=>{if(e&&e.d&&e.d.villager)heukAdd('vill')});
hook('newYear',()=>{if(!P||!P.heuk)return;P.heuk=Math.round(P.heuk*(1-(SP_K.decay||.15))*10)/10;if(P.heuk<1)P.heuk=0;
  if(heukTier()>=2)setTimeout(()=>{if(!playing||G.duel||!REGION()||REGION().neutral||REG===AK_ID)return;const f=pick(['정','관']),n=spSquad(f,SP_K.squad||3,null,'heukHunt',f==='관'?'흑도 토벌 관군':'흑도 토벌대');if(n)log(`이름난 흑도를 잡으러 ${FACN[f]} 토벌대 ${n}명이 나타났다!`,'dmg')},6000)});
if(typeof repFacBase==='function'){const o=repFacBase;repFacBase=function(f){let b=o(f);if((f==='정'||f==='관')&&P)b-=(SP_K.pen||[0,15,30])[heukTier()]||0;return b}}
if(typeof repAdd==='function'){const o=repAdd;repAdd=function(sid,fdv,sdv,f){const s=SECTS[sid],ff=f||(s&&alFac(s.al));if(ff==='정'&&heukWhite()){if(fdv>0)fdv*=SP_K.whiteK||1.5;if(sdv>0)sdv*=SP_K.whiteK||1.5}return o(sid,fdv,sdv,f)}}
if(typeof repHtml==='function'){const o=repHtml;repHtml=function(){const h=o(),t=heukTier(),v=Math.round(P.heuk||0);
  const line=`<p class="note"><b>흑도 평판</b> ${v} · ${t?`<b class="bad">${SP_K.names[t]}</b>: 정파·관부 우호도 -${SP_K.pen[t]}${t>=2?', 해마다 토벌대':''}`:heukWhite()?'<b class="good">백도 사파</b>: 손이 깨끗해 정파 우호도가 더 잘 오른다':'아직 흑도로 불리지 않는다'} <small class="dim">(약탈·청부·양민 살해로 쌓이고 해마다 옅어진다)</small></p>`;
  return h.replace(/<\/div>\s*$/,line+'</div>')}}

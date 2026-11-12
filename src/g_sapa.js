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

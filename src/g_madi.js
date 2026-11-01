// ================= 한 판의 뼈대: 마디·세월 넘기기, 인연 3갈래 (v220, 개선 계획 1·2절 · 동훈님 2026-11-01) =================
// 동훈님 결정(2026-11-01): '1년 = 30분, 사건 나이 그대로'는 두고, 마디가 끝나면 세월을 한꺼번에 넘길 수 있게 한다.
//  세월 넘기기: 마디 과제를 마쳤고 싸움·비무·결전이 아닐 때, 다음 마디(수련기 마디 나이)·첫 강호 사건(20세)·다음 사건·천하대전 앞까지
//    MADI.minYr~maxYr 해를 넘긴다. 길 넷(폐관 수련·강호 유랑·문파 잡무/품팔이) 가운데 고르면 그 해들의 활력(MADI.vitYr)을 길마다 배율로
//    기본기·내공 수련에 저절로 쓰고, 명성·은자·공적·깨달음·숙련·비급이 길마다 다르게 붙는다. 넘긴 동안 기록된 일은 '그해 강호에서는' 한 장으로 보여 준다.
//    수련기 마디를 보고하면 카드가 저절로 뜨고, 임무창 맨 위 줄에서도 연다.
//  인연 3갈래: 마디가 열릴 때(무관 졸업·수련기 2~4마디·스무 살 출사) 사부의 가르침·의형제·숙적·기연 비급 넷 가운데 셋이 나와 하나를 고른다.
//    고른 인연은 P.iny.log에 남아 판 끝 결산(g_life showRebirth)에 실린다. 싸움 중이면 끝난 뒤에 뜬다.
// 수치는 data/madi.json (MADI, INY)
const MADI=GD.MADI,INY=GD.INY;
const myIny=()=>P.iny||(P.iny={log:[],q:[],seen:{}});
// ---- 세월 넘기기 ----
function mdStop(){const a=P.age,stops=[a+MADI.maxYr];
  if(a<MADI.firstEv)stops.push(MADI.firstEv);
  if(typeof sryOn==='function'&&sryOn()&&!P.sry.open)stops.push(srySt().age);
  if(typeof storyDueIn==='function'){const s=storyDueIn(MADI.maxYr);if(s!=null)stops.push(s+(P.age-realAge()))}
  return Math.min(...stops.filter(s=>s>a))}
// 넘길 수 있는 해(반 해 단위)와 못 넘기는 까닭
function mdYears(){if(!P)return{y:0,why:''};
  if(acadOn())return{y:0,why:'무관을 마쳐야 한다'};
  if(G.duel||G.war&&G.war.life===P.lifeNo)return{y:0,why:'비무·결전 중'};
  if(inCombat())return{y:0,why:'싸움 중'};
  if(typeof sryOpen==='function'&&sryOpen())return{y:0,why:sryAllDone()?'사부에게 먼저 보고하자':'이번 마디 과제가 남았다'};
  if(myIny().q.length)return{y:0,why:'인연을 먼저 고르자'};
  const y=Math.floor((mdStop()-P.age)*2)/2;if(y<MADI.minYr)return{y:0,why:'다음 일이 코앞이다'};return{y,why:''}}
const mdWays=()=>Object.entries(MADI.ways).filter(([k,w])=>!w.need||(w.need==='sect')===!!(P.sect&&P.sect!=='own'&&SECTS[P.sect]));
function mdOpen(){if(!P||!playing)return;openPanel('npc',{id:'madi',n:'세월 넘기기'})}
function mdCard(){const{y,why}=mdYears(),r=mdLast;
  if(r)return mdNews(r);
  if(!y)return `<p class="note">지금은 세월을 넘길 수 없다: ${esc(why)}.</p>`;
  const to=Math.floor(P.age+y),next=mdNextTxt(P.age+y);
  return `<p class="note">다음 마디까지 <b class="gold">${y}년</b>. ${Math.floor(P.age)}세 → ${to}세${next?` · ${esc(next)}`:''}. 넘기는 동안 무엇을 하며 보낼까? 넘기지 않고 지금처럼 돌아다녀도 된다.</p>
    <div class="choice">${mdWays().map(([k,w])=>`<button type="button" class="opt" data-act="mdgo:${k}"><b>${w.n}</b><span>${esc(w.d)}</span><span class="dim">${mdGainTxt(w,y)}</span></button>`).join('')}</div>
    <div class="center">${B('mdno','머문다 (지금처럼 돌아다닌다)')}</div>`}
function mdNextTxt(age){const a=Math.round(age*2)/2;if(typeof sryOn==='function'&&sryOn()&&!P.sry.open&&srySt().age<=a)return`수련기 [${srySt().n}]`;
  if(age>=MADI.firstEv&&P.age<MADI.firstEv)return'강호 출사';const s=typeof storyDueIn==='function'?storyDueIn(MADI.maxYr):null;return s!=null?'강호 정세의 다음 일':''}
function mdGainTxt(w,y){const o=[`수련 활력 ${Math.round(mdVit()*y*w.vit)}`];if(w.fame)o.push(`명성 +${w.fame*y}`);if(w.silver)o.push(`은자 +${w.silver*y}`);if(w.merit)o.push(`공적 +${w.merit*y}`);
  if(w.enl)o.push(`깨달음 +${+(w.enl*y).toFixed(2)}`);if(w.mast)o.push(`숙련 +${w.mast*y}`);if(w.book)o.push('비급을 얻을 수도');if(w.good)o.push(`선업 +${w.good*y}`);return o.join(' · ')}
const mdVit=()=>MADI.vitYr[Math.min(realmIdx(),MADI.vitYr.length-1)];
// 활력 b를 가장 싼 수련부터 쓴다 (기본기 넷·내공). 수련 창의 값·비용을 그대로 쓴다
function mdTrain(b){const got={str:0,end:0,agi:0,qi:0,ne:0};
  for(let n=0;n<400;n++){const opt=STATS.map(({k})=>({k,c:statCost(k)}));if(!simCur().none)opt.push({k:'ne',c:qiCost(P.side,P.qiN)});
    opt.sort((a,b)=>a.c-b.c);const o=opt[0];if(!o||o.c>b)break;b-=o.c;
    if(o.k==='ne'){const g=qiGain();qiAccAdd(g);P.qiN++;got.ne+=g}else{P.st[o.k]++;got[o.k]++}}
  recalc();P.hp=P.maxHp;P.qi=P.maxQi;return{got,left:b}}
let mdLast=null;
function mdGo(k){const w=MADI.ways[k],{y}=mdYears();if(!w||!y)return;
  const snap=mdSnap(),h0=logHist.length,age0=Math.floor(P.age);
  feat(`${y}년 동안 ${w.n}(으)로 세월을 보냈다`);closePanels();const alive=passYears(y);
  const T=mdTrain(Math.round(mdVit()*y*w.vit)),extra=[];
  if(w.fame)P.fame+=w.fame*y;if(w.silver)P.silver+=w.silver*y;if(w.good)P.good+=w.good*y;
  if(w.enl)P.enl=Math.round(((P.enl||0)+w.enl*y)*100)/100;
  if(w.merit&&P.sect&&SECTS[P.sect])addMerit(P.sect,w.merit*y);
  if(w.mast){const a=art();if(a&&a.id!=='base'&&A(a.id)){A(a.id).p=Math.min(100,A(a.id).p+w.mast*y)}}
  if(w.book)for(let i=0;i<Math.ceil(y);i++)if(Math.random()<w.book){const b=inyBook();if(b){giveItem(b);extra.push(b.name)}}
  recalc();if(typeof wallCheck==='function')wallCheck();
  const news=logHist.slice(h0).filter(l=>l.c!=='info').map(l=>l.t).slice(-MADI.news);
  mdLast={k,y,age0,news,snap,now:mdSnap(),T,extra};if(alive!==false&&P.hp>0&&playing)openPanel('npc',{id:'madi',n:'세월 넘기기'})}
const mdSnap=()=>({age:Math.floor(P.age),realm:RANKS[realmIdx()],oe:pillarVal('oe'),ne:baseQi(),mu:pillarVal('mu'),fame:P.fame,silver:P.silver,vit:P.vit,merit:P.sect&&P.mtot?P.mtot[P.sect]||0:0});
function mdNews(r){const w=MADI.ways[r.k],a=r.snap,b=r.now,row=(n,x,y)=>x===y?'':`<p>${n} ${x} → <b class="gold">${y}</b></p>`;
  return `<div class="card"><h4>${r.age0}세부터 ${r.y}년 · ${w.n}</h4>${row('나이',a.age,b.age)}${row('경지',a.realm,b.realm)}${row('외공',a.oe,b.oe)}${row('내공',a.ne,b.ne)}${row('무리',a.mu,b.mu)}${row('명성',a.fame,b.fame)}${row('은자',a.silver,b.silver)}${row('공적',a.merit,b.merit)}
    ${r.extra.length?`<p>얻은 것: ${r.extra.map(esc).join(', ')}</p>`:''}</div>
    <div class="card"><h4>그해 강호에서는</h4>${r.news.length?r.news.map(t=>`<p class="note">${esc(t)}</p>`).join(''):'<p class="note">별다른 소식 없이 세월이 흘렀다.</p>'}</div>
    <div class="center">${B('mdok','다시 길을 나선다',{pri:1})}</div>`}
// ---- 인연 3갈래 ----
// 마디가 열리면 인연 카드를 줄 세운다. 싸움·비무·창이 열려 있으면 기다렸다가 띄운다
function inyOffer(why){if(!P)return;const I=myIny();if(I.seen[why])return;I.seen[why]=1;
  const ks=Object.keys(INY.types).filter(k=>k!=='book'||inyBook(true));for(let i=ks.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ks[i],ks[j]]=[ks[j],ks[i]]}
  I.q.push({why,ks:ks.slice(0,INY.pick),age:Math.floor(P.age)});I.mast=1;log('새 인연이 찾아왔다. 왼쪽 위 [인연] 줄을 눌러 세 갈래 가운데 하나를 고르자.','xp')}
const INY_WHY={grad:'무관을 나서며',sry:'수련기의 새 마디',out:'스무 살, 강호에 나서며'};
// 창을 저절로 띄우지 않는다(놀던 손을 막지 않게): 알림 한 줄과 왼쪽 위 맨 윗줄 '인연'을 누르면 카드가 열린다
let inyT=0;hook('tick',dt=>{if(!P||!playing||(inyT-=dt)>0)return;inyT=1;
  if(P.age>=MADI.firstEv&&!acadOn())inyOffer('out')});
// 왼쪽 위 임무 줄 맨 위: 고를 인연, 넘길 수 있는 세월 (g_ui questTrack)
function mdTrackHtml(){if(!P)return'';const I=myIny();if(I.q.length)return `<h5 data-iny="1">인연 <small>누르면 고른다</small></h5><div class="sq" data-iny="1">세 갈래 인연 가운데 하나를 고르자</div>`;
  if(!I.mdHint||acadOn()||inCombat())return'';const{y}=mdYears();return y?`<h5 data-md="1">세월 넘기기 <small>누르면 카드</small></h5><div data-md="1">다음 마디까지 <b>${y}년</b></div>`:''}
function inyCard(){const I=myIny(),o=I.q[0];if(!o)return'<p class="note">지금은 고를 인연이 없다.</p>';
  return `<p class="note">${esc(INY_WHY[o.why.split(':')[0]]||'새 마디')} · ${o.age}세. 세 갈래 인연 가운데 하나를 고른다.</p>
    <div class="choice">${o.ks.map(k=>{const t=INY.types[k];return `<button type="button" class="opt" data-act="inygo:${k}"><b>${t.n}</b><span>${esc(inyDesc(k))}</span></button>`}).join('')}</div>`}
function inyDesc(k){const t=INY.types[k];if(k==='sabu'){const S=P.sect&&SECTS[P.sect];return `${S?S.n+' '+masterTitle(S):'은거한 노고수'}가 곁에 두고 가르친다. ${t.d}`}
  if(k==='book'){const b=inyBook(true);return b?`${t.d} (${ARTS[b].n})`:t.d}return t.d}
// 들고 있는 병기에 맞고, 아직 모르고, 문파 무공이 아닌 하승 무공 하나
function inyBook(peek){const c=curCls(),ids=Object.keys(ARTS).filter(id=>{const a=ARTS[id];return a.cls===c&&!a.sect&&!a.grade&&(!a.side||a.side===P.side)&&!P.arts[id]&&a.forms&&a.forms.length});
  if(!ids.length)return null;const id=peek?ids[0]:pick(ids);return peek?id:mkBook(id,0)}
function inyGo(k){const I=myIny(),o=I.q.shift();if(!o||!o.ks.includes(k))return;const t=INY.types[k];let note='';
  if(k==='sabu'){I.mast=t.mast;note=P.sect&&SECTS[P.sect]?masterTitle(SECTS[P.sect]):'은거 고수'}
  else if(k==='dong'){const nm=pick(INY.names),r=realmIdx(),es=eliteStat(r,t.kh,t.ka);let x=P.x+1,y=P.y;if(!walkAt(x,y)){x=P.x;y=P.y}
    const a=mkAlly('disciple',nm,x,y);Object.assign(a,{k:'의형제',name:nm,hp:es.hp,maxHp:es.hp,atk:es.atk,lv:1+r});allies.push(a);fx.push({t:'puff',x,y,life:.6});note=nm;
    log(`${nm}와(과) 의형제를 맺었습니다. 이제 곁에서 함께 싸웁니다.`,'xp')}
  else if(k==='won'){const nm=pick(INY.names);note=nm;I.foe=nm;closePanels();inyDuel(nm,t)}
  else if(k==='book'){const b=inyBook();if(b){giveItem(b);note=b.name;log(`기연: ${b.name}을(를) 얻었습니다. 행낭에서 읽어 익힌다.`,'xp')}}
  I.log.push({age:o.age,k,n:t.n,note});feat(`인연: ${t.n}${note?` (${note})`:''}`);showBanner('인연',t.n)}
// 숙적과의 비무: 그 자리에서, 수련기 동기 대련과 같은 방식 (지면 생명 30%로 끝난다)
function inyDuel(nm,t){const r=realmIdx(),es=eliteStat(r,t.kh,t.ka),cls=curCls(),ranged=rangedCls(cls);
  G.duel=true;G.mdDuel=1;for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}
  P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;
  let ex=P.x+2.4,ey=P.y;if(!walkAt(ex,ey)){ex=P.x-2.4;if(!walkAt(ex,ey)){ex=P.x;ey=P.y+2.4}}
  const e=mkMob(`숙적 ${nm}`,ex,ey,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.2,reach:ranged?5:cls==='창'?1.8:1.4,ranged:ranged?1:0,el:null,pal:'duelist',hostile:1,aggro:9,duelist:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls,mdRival:1});e.name=`숙적 ${nm}`;
  mobs.push(e);P.target=e;showBanner('숙적',nm);log(`${nm}: "네 이름은 들었다. 어디 실력을 보자."`,'info')}
function inyDuelEnd(win){const t=INY.types.won,I=myIny();G.duel=false;G.mdDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!win)P.hp=Math.max(1,Math.round(P.maxHp*.3));
  if(win){P.enl=Math.round(((P.enl||0)+t.enl)*100)/100;P.fame+=t.fame;P.silver+=t.silver;log(`숙적 ${I.foe}을(를) 꺾었습니다. 깨달음 +${t.enl}, 명성 +${t.fame}, 은자 +${t.silver}`,'xp')}
  else log(`숙적 ${I.foe}에게 졌습니다. "다음에 또 보자."`,'info');
  const l=I.log[I.log.length-1];if(l&&l.k==='won')l.win=win?1:0;showBanner(win?'숙적을 꺾다':'숙적에게 지다',I.foe||'');feat(`숙적 ${I.foe}와(과) 겨뤄 ${win?'이겼다':'졌다'}`,1)}
hook('gLoaded',()=>{if(G.mdDuel){G.mdDuel=null;G.duel=false}});
const inyMast=()=>P&&P.iny&&P.iny.mast||1;
// ---- 창·단추 ----
hook('npcDlg',c=>{if(c.html!=null)return;if(c.n.id==='madi')c.html=mdCard();else if(c.n.id==='iny')c.html=inyCard()});
hook('sectAct',c=>{const a=c.a;if(!/^(md|iny)/.test(a))return;c.done=true;c.r=true;
  if(a==='mdgo')mdGo(c.x);else if(a==='mdno'||a==='mdok'){if(a==='mdno')myIny().mdHint=0;mdLast=null;closePanels();c.r=false}else if(a==='mdopen'){mdLast=null;mdOpen();c.r=false}
  else if(a==='inygo'){inyGo(c.x);if(panel==='npc'&&panelArg&&panelArg.id==='iny'){closePanels();c.r=false}}});
// 임무창 맨 위 줄
// 마디가 끝났다는 표시: 이때부터 왼쪽 위에 '세월 넘기기' 줄이 뜬다 (무관 졸업·수련기 마디 보고)
const mdEnd=()=>{if(P)myIny().mdHint=1};
function mdQuestRow(){if(!P||acadOn())return'';const{y,why}=mdYears();
  return `<div class="card"><div class="row2"><span class="note"><b>세월 넘기기</b> ${y?`다음 마디까지 ${y}년을 한꺼번에 보낸다`:esc(why)}</span>${B('mdopen','세월 넘기기',{d:!y})}</div></div>`}
// ---- 판 끝 결산 (개선 계획 2절): 윤회 화면 맨 위 '이번 생' 한 장. 스크린샷으로 나누기 좋게 한 카드에 모은다 ----
hook('hurt',c=>{if(c.src&&c.src.name&&c.src.d)P.lastFoe=c.src.name});
hook('died',(e,cause)=>{const I=P.iny||{log:[]};e.iny=(I.log||[]).map(l=>`${l.age}세 ${l.n}${l.note?` (${l.note})`:''}${l.k==='won'&&l.win!=null?l.win?' 승':' 패':''}`);
  const w=(G.wars||[]).filter(r=>r.life===P.lifeNo).pop();
  e.war=w?w.won?`${sideName(w.won)}의 승리${w.me==='승'?' · 이긴 편':w.me==='패'?' · 진 편':''}`:w.n||'끝남':realAge()<warAge()?`${Math.ceil(warAge()-realAge())}년을 남기고 생을 마쳤다`:'치르지 못했다';
  e.by=cause!=='천수'&&cause!=='좌화'&&P.lastFoe?P.lastFoe:'';e.lifeT=Math.round((P.playT||0)/60)});
hook('tick',dt=>{if(P)P.playT=(P.playT||0)+dt});
function lifeSum(e,cause){const how=cause==='천수'?'천수를 누리고 눈을 감았다':cause==='좌화'?'스스로 좌화했다':cause==='주화입마'?'주화입마로 쓰러졌다':e.by?`${e.by}에게 쓰러졌다`:'싸움에서 쓰러졌다';
  const cell=(k,v)=>`<div><small>${k}</small><b>${v}</b></div>`;
  return `<div class="card lifesum"><small class="dim">제${e.life||G.lives}생 결산</small><h3>${esc(e.name)}</h3><p>${e.age}세 · ${esc(how)}</p>
    <div class="lsgrid">${cell('최고 경지',esc(e.realm))}${cell('문파',esc(e.sect||'낭인'))}${cell('천하대전',esc(e.war||'-'))}${cell('명성',e.fame)}${cell('처치',e.kills)}${cell('선업 · 악업',`<span class="good">${e.good}</span> · <span class="bad">${e.evil}</span>`)}</div>
    ${e.iny&&e.iny.length?`<p><small class="dim">인연</small> ${e.iny.map(esc).join(' · ')}</p>`:''}
    ${e.feats.length?`<p class="note">${e.feats.filter(f=>!/인연: |숙적 /.test(f)).slice(-4).map(f=>esc(josa(f))).join(' · ')}</p>`:''}
    <p class="dim" style="font-size:11px">${e.status} · ${e.side==='정'?'정파':'사파'} · ${e.gg}${e.lifeT?` · 이번 생 ${e.lifeT}분`:''}</p></div>`}

// ================= 마교 교주 쟁탈 (2026-10-15 v107): 교주 비무, 교주의 권한(천하대전 출정·은둔, 세입, 사면), 도전자 =================
// 사용자 결정: 기획서 docs/마교_심화_기획.md §2(교주 비무 쟁탈)·§3(사면) 대로 (v107). 상수 data/simbeop.json MAGYO3.
// - 도전: 부교주 + 탈마 + 마성 20 미만 + 교주가 살아 있고(G.mdead.cheonma 없음) 마교 인원이 기준의 50% 이상 + 천마신전에서, 한 생에 한 번.
// - 비무: 교주 천마 = 장문인 우두머리(masterBoss) 틀에 경지 탈마, 생명 ×4, 공격 ×1.5. 생명 50% 아래 천마해체(피해 +25%), 25% 아래 5초마다 마기 폭발(반경 3).
//   비무 중엔 약을 못 쓰고, 신전 마당(yard)을 벗어나면 항복. 지면 죽지 않고 흑혈옥 3년(출옥 때 직위 강등) + 마성 +30.
// - 승리: P.leader='cheonma', 명성 +200, 오당 다섯 무공 첫 초식·천마무상대법(천고 심법)을 공적 없이 얻는다. 죄값 0. 교주는 교율 위에 있다(죄값이 안 쌓인다).
// - 교주의 해: 세입 은자 500. 20% 확률로 도전자(호법·부교주)가 그 자리에서 비무를 청한다(거절 불가, 지면 자리를 잃고 흑혈옥). 추살조는 두 번 온다.
// - 천하대전: 정세 창에서 출정/은둔. 은둔이면 마교가 구도에서 빠져 인원 손실이 없다. 출정이면 습격에 고수 둘이 더 온다.
// - 사면: 흑혈옥의 정파 수감자를 사면하면 동료(allies)로 들어온다. 교주인 채 죽으면 다음 생의 마교는 교주 공석 3년, 다음 생은 '전대 교주의 후예'(명성 +50).
const MAGYO3=GD.MAGYO3||{leader:{hp:4,atk:1.5,challenge:.2,income:500,fame:200,jail:3,mara:30,rage:.5,rageV:.25,blast:.25,blastEvery:5,blastR:3,popMin:.5,heirFame:50,chalHp:2.5,chalAtk:1.3,raidElite:2}};
const LD=MAGYO3.leader,LD_SECT='cheonma',LD_HQ='hq_cheonma',LD_HALL='in_hq_cheonma_0',LD_YARD=[8,4,32,24];
const isLeader=()=>!!P&&P.leader===LD_SECT&&P.sect===LD_SECT;
// ---- 도전 조건 ----
function leaderWhy(){if(!P||P.sect!==LD_SECT)return'마교도만';if(isLeader())return'이미 교주다';if(P.ldTried)return'한 생에 한 번만 청할 수 있다';
  if(rankIdx(LD_SECT)<rankTop(LD_SECT))return`부교주만 (지금 ${rankName(LD_SECT)})`;if(typeof isTalma!=='function'||!isTalma())return'탈마에 이른 뒤';
  if((P.mara||0)>=(typeof TALMA==='function'?TALMA().low:20))return`마성 ${Math.round(P.mara)} · 20 미만이어야`;if(G.mdead&&G.mdead[LD_SECT])return'교주 자리가 비어 있다';
  const s=SECTS[LD_SECT];if(typeof sectPop==='function'&&sectPop(LD_SECT)<popBase(s)*LD.popMin)return'마교 인원이 기준의 절반 아래라 교주가 이미 칼을 잡았다';
  if(REG!==LD_HQ&&REG!==LD_HALL)return'천마신전에서';if(G.duel)return'비무 중';return''}
// ---- 비무 ----
function leaderMob(n,def){let e;
  if(def){e=mkFac('마',1,P.x+1.5,P.y,LD_SECT);e.rank=5+(Math.random()<.5?1:0);e.realm=5;if(typeof scaleMob==='function')scaleMob(e);e.name=`천마신교 ${rankName(LD_SECT,e.rank)} (도전자)`;e.maxHp=Math.round(e.maxHp*LD.chalHp);e.atk=Math.round(e.atk*LD.chalAtk)}
  else{e=mkFac('마',1,20.5,11.5,LD_SECT);e.rank=4;e.realm=6;if(typeof scaleMob==='function')scaleMob(e);e.name=n.n;e.pal=n.pal||e.pal;e.home={x:e.x,y:e.y};e.maxHp=Math.round(e.maxHp*LD.hp);e.atk=Math.round(e.atk*LD.atk)}
  e.hp=e.maxHp;e.el='마';e.d={...e.d,el:'마'};e.duel=1;e.leader=def?0:1;e.challenger=def?1:0;e.angry=1;e.aggro=true;e.tgt=null;e.blastT=LD.blastEvery;mobs.push(e);return e}
let ldHall=null;   // 비무 동안 교주 NPC를 숨긴 신전 대전
function leaderDuel(){const no=leaderWhy();if(no){log(`교주 비무: ${no}.`,'info');return false}const HR=REGIONS[LD_HALL]||REGIONS[LD_HQ],n=(HR._npcsM||HR.npcs).find(x=>x.hq===LD_SECT);if(!n)return false;
  P.ldTried=1;closePanels();if(!HR._npcsM)HR._npcsM=HR.npcs;HR.npcs=HR._npcsM.filter(x=>x!==n);ldHall=HR;
  if(REG!==LD_HQ)regionJump(LD_HQ,20.5,15.5);else{P.x=20.5;P.y=15.5}G.duel=true;G.ldDuel='take';for(const m of mobs)if(m.aggro){m.aggro=false;m.tgt=null}
  P.path=null;P.target=null;P.hp=P.maxHp;P.qi=P.maxQi;const e=leaderMob(n,0);P.target=e;if(typeof npcFighter==='function')NPCF=npcsHere().filter(x=>!x.board).map(npcFighter);
  showBanner('교주 비무','천마신전 마당');log('교주 천마가 제단에서 내려와 마당에 섰다. "힘이 곧 자리다. 덤벼라." 마당 안의 교도는 구경만 한다. 약은 쓸 수 없고 마당을 벗어나면 항복이다.','sys');return true}
// 도전자: 교주가 된 뒤 해마다 20%. 그 자리에서 바로 비무
function leaderChallenge(){if(!isLeader()||G.duel||P.jail||P.hp<=0||!REGION()||P.traveling)return false;
  G.duel=true;G.ldDuel='def';for(const m of mobs)if(m.aggro){m.aggro=false;m.tgt=null}P.path=null;P.target=null;const e=leaderMob(null,1);P.target=e;
  showBanner('도전','교주 자리를 노리는 자');log(`${e.name}이(가) 교주 자리를 걸고 비무를 청했다. 거절할 수 없다. 지면 자리를 잃고 흑혈옥이다.`,'dmg');return true}
function leaderEnd(win,e){const kind=G.ldDuel;G.duel=false;G.ldDuel=0;mobs=mobs.filter(m=>!m.duel);P.target=null;
  if(ldHall){ldHall.npcs=ldHall._npcsM;ldHall=null;if(typeof npcFighter==='function')NPCF=npcsHere().filter(x=>!x.board).map(npcFighter)}
  if(win){if(kind==='take')leaderWin();else{P.fame+=30;log(`도전자를 꺾었다. 교주의 자리는 굳건하다. 명성 +30`,'xp');showBanner('비무 승리','교주의 위엄')}}
  else{if(kind==='def'){P.leader=null;G.leader=null;log('도전자에게 졌다. 교주의 자리를 잃었다.','dmg');P.feats.push(`${Math.floor(P.age)}세에 교주 비무에서 져 자리를 잃었다`)}
    else{log('교주 천마에게 졌다. "탈마에 이르렀어도 아직 멀었다." 호법들이 양팔을 잡았다.','dmg');P.feats.push(`${Math.floor(P.age)}세에 교주 비무에서 졌다`)}
    P.hp=Math.max(1,P.hp);P.mara=clamp((P.mara||0)+LD.mara,0,100);P.maraLow=null;P.sin=LD.jail*J2.perYear;jailEnter('교주 비무에서 패했다')}
  runHooks('leaderDuel',{win,kind,e})}
function leaderWin(){const s=SECTS[LD_SECT];P.leader=LD_SECT;G.leader={life:P.lifeNo,name:P.name,y:Math.floor(G.cal)};P.fame+=LD.fame;P.sin=0;P.ldWar=P.ldWar||'out';
  const got=[];for(const k in MDANG){const a=ARTS[MDANG[k].art];if(!a)continue;if(!P.arts[a.id]){P.arts[a.id]={p:0,f:a.forms.map((f,i)=>i===0)};got.push(a.n)}}
  const top=SIM[`N_${LD_SECT}_${SIM_TOP.one||4}`];if(top&&!(P.sims&&P.sims[top.id])){simLearn(top);got.push(top.n)}
  log(`교주 천마를 꺾었다! 제단에 당신의 이름이 새겨지고 사대호법과 오당 당주가 무릎을 꿇었다. 천마신교 교주가 되었다. 명성 +${LD.fame}${got.length?`, 얻음: ${got.join('·')}`:''}.`,'xp');
  showBanner('교주 등극','천마신교의 새 천마');P.feats.push(`${Math.floor(P.age)}세에 교주 비무에서 천마를 꺾고 천마신교 교주가 되었다`);if(typeof saveGame==='function')saveGame(true)}
{const de=duelEnd;duelEnd=function(win,e){if(G.ldDuel)return leaderEnd(win,e);return de(win,e)}}
{const uc=useCon;useCon=function(k){if(G.ldDuel){log('비무 중엔 약을 쓸 수 없다. 영약은 비무 전에 먹었어야 했다.','info');return}return uc(k)}}
// 보스 패턴: 천마해체(생명 50% 아래 피해 +25%), 마기 폭발(25% 아래 5초마다 반경 3)
hook('hurt',c=>{const b=c.src;if(!b||!b.leader||!G.ldDuel)return;if(b.hp<b.maxHp*LD.rage)c.dm*=1+LD.rageV});
hook('tick',dt=>{if(!G.ldDuel||!P||!playing)return;const b=mobs.find(m=>m.duel&&m.hp>0);
  if(!b){G.ldT=(G.ldT||0)+dt;if(G.ldT>1.5){G.ldDuel=0;G.duel=false;G.ldT=0}return}G.ldT=0;
  if(G.ldDuel==='take'&&REG===LD_HQ&&(P.x<LD_YARD[0]||P.x>LD_YARD[2]||P.y<LD_YARD[1]||P.y>LD_YARD[3])){log('신전 마당을 벗어났다. 항복으로 친다.','dmg');leaderEnd(false,b);return}
  if(b.leader&&b.hp<b.maxHp*LD.blast){b.blastT-=dt;if(b.blastT<=0){b.blastT=LD.blastEvery;fx.push({t:'lvl',x:b.x,y:b.y,life:.7});addText(b.x,b.y,'마기 폭발','#d060ff');
    if(dist(P,b)<LD.blastR){hurtP(b.atk*1.3,b);P.slow=Math.max(P.slow||0,2)}}}});
// ---- 교주의 권한 ----
hook('newYear',()=>{if(!isLeader())return;P.silver+=LD.income;log(`교의 세입으로 은자 ${LD.income}을 받았다.`,'xp');
  if(Math.random()<LD.challenge)setTimeout(()=>{if(playing)leaderChallenge()},4000);
  if(P.fame>=MARA.huntFame&&typeof maraHunt==='function')setTimeout(()=>{if(playing)maraHunt()},7000)});   // 교주에게는 추살조가 두 번 온다
{const sa=sinAdd;sinAdd=function(v,why){if(v>0&&isLeader())return;return sa(v,why)}}   // 교주는 교율 위에 있다
// 천하대전: 은둔이면 마교가 구도에서 빠진다. 출정이면 습격에 고수가 더 온다
const ldHide=()=>isLeader()&&P.ldWar==='hide';
{const wp=warPlan;warPlan=function(){const p=wp();if(!ldHide()||!p.sides.some(s=>s.includes('마')))return p;p.sides=p.sides.map(s=>s.filter(f=>f!=='마')).filter(s=>s.length);p.notes.push('교주가 은둔을 명해 마교는 구도에서 빠진다');
  p.n=p.sides.length<2?'중재 (싸울 상대가 없다)':p.sides.map(s=>s.map(f=>FAC4N[f]).join('·')).join(' 대 ');return p}}
{const rd=raid;raid=function(n){rd(n);if(!isLeader()||ldHide()||!warOn())return;const me=mySide(),facs=[];G.war.plan.sides.forEach((s,i)=>{if(i!==me)facs.push(...s)});if(!facs.length||me<0)return;
  let made=0;for(let t=0;t<40&&made<LD.raidElite;t++){const a=Math.random()*Math.PI*2,r=7+Math.random()*2,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;if(!walkAt(x,y))continue;const e=mkFac(facs[made%facs.length],1,x,y);e.aggro=true;e.raid=n;mobs.push(e);made++}
  if(made)log(`교주의 목을 노리고 ${facs.map(f=>FAC4N[f]).join('·')}의 고수 ${made}명이 더 왔다.`,'dmg')}}
hook('sectAct',c=>{if(c.a==='ldduel'){c.done=true;c.r=true;leaderDuel()}else if(c.a==='ldwar'){c.done=true;c.r=true;if(!isLeader()||warOn())return;P.ldWar=c.x==='hide'?'hide':'out';log(c.x==='hide'?'교주의 명: 천하대전에 마교는 은둔한다. 인원을 잃지 않지만 구도에서 빠진다.':'교주의 명: 천하대전에 마교가 출정한다. 결전마다 교주가 직접 싸운다.','sys')}
  else if(c.a==='pardon'){c.done=true;c.r=true;leaderPardon(c.x)}});
// ---- 사면: 흑혈옥의 정파 수감자를 풀어 동료로 들인다 ----
function leaderPardon(id){if(!isLeader()||REG!==JAIL_ID)return false;const n=npcsHere().find(x=>x.prisoner&&x.id===id);if(!n)return false;
  P.pardon=P.pardon||{};P.pardon[id]=1;const R=REGION();R._npcsP=R._npcsP||R.npcs;R.npcs=R.npcs.filter(x=>x!==n);if(typeof npcFighter==='function')NPCF=npcsHere().filter(x=>!x.board).map(npcFighter);
  const a=mkAlly('disciple',n.n.replace('갇힌 ',''),P.x+.6,P.y+.4);a.lv=4;a.maxHp=a.hp=240;a.atk=18;a.k='동료';allies.push(a);closePanels();
  log(`${n.n}을(를) 사면했다. "목숨을 빚졌소. 교주의 곁에서 갚겠소." 동료가 되었다.`,'xp');showBanner('사면','교주의 은혜');P.feats.push(`${Math.floor(P.age)}세에 흑혈옥의 ${n.n}을(를) 사면했다`);return true}
hook('regionLoaded',id=>{if(id!==JAIL_ID)return;const R=REGIONS[id];if(!R)return;R._npcsP=R._npcsP||R.npcs;R.npcs=R._npcsP.filter(n=>!(n.prisoner&&P.pardon&&P.pardon[n.id]))});
{const pd=prisonerDlg;prisonerDlg=function(n){const h=pd(n);if(!isLeader())return h;return h+`<div class="row2"><span class="note">교주의 사면: 풀어 주면 동료로 따른다.</span>${B('pardon:'+n.id,'사면하기',{pri:1})}</div>`}}
// ---- 화면 ----
function leaderCard(){if(P.sect!==LD_SECT)return '';const no=leaderWhy();
  if(!isLeader())return `<div class="card"><h4>교주 비무 <small class="dim">힘이 곧 자리</small></h4><p class="note">부교주가 탈마에 이르러 마성 20 미만이면 천마신전에서 교주에게 비무를 청한다. 이기면 교주 천마, 지면 흑혈옥 ${LD.jail}년. 한 생에 한 번.</p>
    <div class="row2"><span class="note">${no?`지금은 못 한다: ${no}`:'조건을 갖췄다'}</span>${B('ldduel','비무를 청한다',{d:!!no,pri:!no})}</div></div>`;
  const war=warOn();return `<div class="card"><h4>교주의 자리 <small class="dim">천마신교 교주 ${esc(P.name)}</small></h4><p>해마다 세입 은자 ${LD.income} · 도전자 ${Math.round(LD.challenge*100)}% · 추살조 두 번 · 교율 위에 선다 · 흑혈옥 사면</p>
    <div class="row2"><span class="note">천하대전: <b class="gold">${P.ldWar==='hide'?'은둔':'출정'}</b> · ${P.ldWar==='hide'?'마교는 구도에서 빠지고 인원을 잃지 않는다':'결전마다 교주가 직접 싸운다 (습격에 고수 둘 추가)'}${war?' · 대전 중엔 못 바꾼다':''}</span>${B('ldwar:'+(P.ldWar==='hide'?'out':'hide'),P.ldWar==='hide'?'출정으로':'은둔으로',{d:war})}</div></div>`}
hook('hqDlg',c=>{if(c.n.hq!==LD_SECT||P.sect!==LD_SECT)return;if(isLeader())c.html=`<p class="note">제단에 당신의 이름이 새겨져 있다. 전대 교주의 위패가 그 옆에 놓였다. 호법들이 고개를 숙인다.</p>`+c.html.replace(/^<p class="note">.*?<\/p>/,'');c.html+=leaderCard()});
{const sh=sinHtml;sinHtml=function(){return (isLeader()?`<div class="card"><h4>교주 <small class="dim">천마신교의 천마</small></h4><p>천하대전 <b class="gold">${P.ldWar==='hide'?'은둔':'출정'}</b> · 세입 ${LD.income}/년 · 정세 창(N)에서 출정·은둔을 정한다.</p></div>`:'')+sh()}}
{const ps=pStory;pStory=function(){const h=ps();if(!isLeader())return h;const i=h.indexOf('<div class="card"><h4>세력의 힘</h4>');return i<0?h+leaderCard():h.slice(0,i)+leaderCard()+h.slice(i)}}
// ---- 죽음과 윤회: 교주인 채 죽으면 교주 공석 3년, 다음 생은 전대 교주의 후예 ----
hook('died',entry=>{if(!isLeader())return;G.mdead=G.mdead||{};G.mdead[LD_SECT]={y:Math.floor(G.cal),life:P.lifeNo,ld:1};G.leader=null;G.ldHeir={name:P.name};entry.leader=1});
{const nl=newLife;newLife=function(o){nl(o);if(G.ldHeir){P.fame+=LD.heirFame;P.feats.push(`전대 교주 ${G.ldHeir.name}의 후예로 태어났다`);G.ldHeir=null;setTimeout(()=>{if(typeof log==='function')log(`전대 교주 천마의 후예로 태어났다. 강호가 그 이름을 기억한다. 명성 +${LD.heirFame}`,'xp')},0)}}}

// ================= 사부 지명 · 입문 서열 · 대제자 (v234, 사용자 2026-11-03) =================
// "사부가 각각 하 중 상 절 순의 무공 로드맵을 각각 다르게 가지고, 입문 동기들 간의 성적에 따라 사부를 고르거나 지명권을 가지게.
//  순위 안에 못 들면 공통 기본무공을 시작으로 공적을 쌓아 배우는 지금의 방식 유지. 대제자가 되면 장문인에게 장문절기 전수." 정파·사파만 (마교는 따로)
// - 사부와 로드맵은 SABU[문파] (g_sect.js addSabuArts). 숫자는 data/sabu.json SABU
// - P.sabu {sid, coh:[{n,cls}] (나를 뺀 동기 다섯, 서열 순서는 ord), ord:[이름|'@'], st, m, off, step, late, dj, djCool}
//   st: 'rank' 서열 비무 중 · 'pick' 1위라 사부 고르기 · 'named' 사부가 지명(받기/사양) · 'common' 공통 길 · 'disc' 사부의 제자
// - 서열 비무·대련은 그 자리 비무 틀(G.duel + G.sbDuel), 승급 시험과 같은 방식. 목숨은 걸지 않는다
// - 장문절기(문파 고급 무공 hi) 비급은 대제자만 받는다 (g_sect.js sectDetail·mbuy가 jmOk를 본다). 이미 익힌 무공은 이어 배운다
const SB=GD.SABU;
const sbSect=()=>P&&P.sabu&&P.sect===P.sabu.sid&&SECTS[P.sect]?SECTS[P.sect]:null;
const sbMasters=sid=>SABU[sid]||[];
const sbMy=()=>{const s=sbSect();return s&&P.sabu.st==='disc'?sbMasters(s.id)[P.sabu.m]:null};
const sbPos=()=>P.sabu.ord.indexOf('@');
const isDaeje=sid=>!!(P&&P.sabu&&P.sabu.sid===sid&&P.sabu.dj&&P.sect===sid);
// 장문절기 비급을 받을 수 있나: 대제자이거나 이미 익힌 무공 (예전 저장)
const jmOk=a=>{if(!a||!a.hi||P.arts[a.id])return true;const s=artSect(a.id);if(s&&s.id==='geumgun')return P.sect==='geumgun'&&rankIdx('geumgun')>=rankTop('geumgun');return !sabuOn(s)||isDaeje(s.id)};   // v235 군부: 어림군 최고 무공은 대장군만 (g_gunbu.js)
const sbInHq=sid=>panel==='npc'&&panelArg&&panelArg.hq===sid;
function sbStart(sid){const s=SECTS[sid];if(!sabuOn(s)||!sbMasters(sid).length)return;
  const pool=SB.coh.slice(),coh=[];for(let i=0;i<5;i++){const n=pool.splice(Math.floor(Math.random()*pool.length),1)[0];coh.push({n,cls:pick(sbMasters(sid)).cls})}
  const ord=coh.map(c=>c.n);ord.splice(SB.start[Math.min(realmIdx(),SB.start.length-1)],0,'@');
  P.sabu={sid,coh,ord,st:'rank',m:-1,off:-1,step:0,late:0,dj:0,djCool:0};
  log(`${s.n} 입문 동기 여섯이 모였습니다. 서열은 지금 ${sbPos()+1}위. 1위는 사부를 고르고, 그 아래는 사부가 지명합니다. 문파 창에서 바로 위 동기에게 서열 비무를 청하세요.`,'xp');
  setTimeout(()=>showBanner('입문 서열',`${s.n} 동기 여섯 · 지금 ${sbPos()+1}위`),1400)}
hook('sectActDone',c=>{if(c.a==='sjoin'&&P.sect===c.x)sbStart(c.x)});
// 서열을 굳힌다: 위 동기들이 사부를 먼저 데려가고, 남은 사부가 있으면 나를 지명한다
function sbSettle(){const b=P.sabu,s=SECTS[b.sid],M=sbMasters(b.sid),pos=sbPos();
  if(pos===0){b.st='pick';log(`서열 1위! ${s.n}의 사부 ${M.length}분 가운데 모실 분을 직접 고르세요.`,'xp');showBanner('입문 서열 1위','사부를 고른다');return}
  const left=M.map(m=>m.k);for(let i=0;i<pos&&left.length;i++){const c=b.coh.find(o=>o.n===b.ord[i]),j=left.findIndex(k=>M[k].cls===c.cls);left.splice(j>=0?j:Math.floor(Math.random()*left.length),1)}
  if(!left.length){b.st='common';log(`서열 ${pos+1}위. 사부들이 위 동기들을 먼저 데려가 지명을 받지 못했습니다. 공통 기본무공을 익히며 공적을 쌓으세요. ${rankName(b.sid,SB.late)}에 오르면 사부가 다시 눈여겨봅니다.`,'info');showBanner(`입문 서열 ${pos+1}위`,'공통 길');return}
  const cur=(art()||{}).cls,k=left.find(k=>M[k].cls===cur)??left[0];b.st='named';b.off=k;
  log(`서열 ${pos+1}위. ${M[k].n}이(가) 당신을 제자로 지명했습니다. 문파 창에서 받들지 정하세요.`,'xp');showBanner(`${M[k].n}의 지명`,`입문 서열 ${pos+1}위`)}
// 사부를 모신다: 로드맵 첫 무공을 받는다
function sbTake(k){const b=P.sabu,M=sbMasters(b.sid)[k],s=SECTS[b.sid];if(!M)return;b.st='disc';b.m=k;b.off=-1;b.step=0;
  log(`${M.n}: "${M.say}"`,'info');log(`${M.n}의 제자가 되었습니다. 사부의 길: ${M.path.map(id=>`[${ARTS[id].n}]`).join(' → ')}`,'xp');showBanner(`${M.n}의 제자`,s.n);feat(`${s.n} ${M.n}의 제자가 되었다`);sbGive(true)}
// 로드맵 다음 무공을 줄 수 있나 ('' = 줄 수 있음)
function sbNextWhy(){const b=P.sabu,M=sbMy();if(!M)return'사부가 없다';if(b.step>=M.path.length)return'사부의 무공을 모두 받았다';
  const id=M.path[b.step],a=ARTS[id],g=artGrade(id);if(b.step>0){const pv=A(M.path[b.step-1]);if(!pv||pv.p<SB.mast)return`[${ARTS[M.path[b.step-1]].n}] 숙련 ${SB.mast} 필요 (지금 ${Math.floor(pv?pv.p:0)})`}
  if(rankIdx(b.sid)<SB.rank[g])return`${rankName(b.sid,SB.rank[g])} 이상`;if(!P.arts[id]&&capArts().length>=artCap())return`오성 ${P.wis}로는 ${artCap()}가지까지 (무공 하나를 잊으면 빈다)`;return''}
function sbGive(first){const b=P.sabu,M=sbMy();if(!M||(!first&&sbNextWhy()))return;
  while(b.step<M.path.length){const id=M.path[b.step],a=ARTS[id];
    if(P.arts[id]){b.step++;continue}
    if(capArts().length>=artCap()){log(`오성 칸이 모자라 [${a.n}]을(를) 아직 받지 못했습니다. 무공 하나를 잊고 문파 창에서 다시 청하세요.`,'info');return}
    P.arts[id]={p:0,f:a.forms.map((f,i)=>i===0)};b.step++;log(`${M.n}에게서 ${AGR[a.grade]} 무공 [${a.n} · ${a.forms[0].n}]을(를) 전수받았습니다. 다음 초식은 숙련이 닿으면 '가르침 청하기'로 받습니다.`,'xp');
    showBanner(`${AGR[a.grade]} 무공 전수`,`${M.n} · ${a.n}`);feat(`사부 ${M.n}에게서 [${a.n}]을(를) 받았다`);recalc();return}}
// 예전 저장(이미 문파 제자)이나 다른 길로 든 제자: 서열 없이 공통 길로 시작한다 (늦은 지명은 그대로)
hook('tick',()=>{if(!P||!playing||!P.sect||P.sect==='own')return;const s=SECTS[P.sect];if(!sabuOn(s)||!sbMasters(s.id).length||(P.sabu&&P.sabu.sid===s.id))return;
  const pool=SB.coh.slice(0,5);P.sabu={sid:s.id,coh:pool.map(n=>({n,cls:sbMasters(s.id)[0].cls})),ord:[...pool,'@'],st:'common',m:-1,off:-1,step:0,late:0,dj:0,djCool:0}});
// 늦은 지명: 공통 길에서 직위가 오르면 한 번
hook('tick',()=>{const s=sbSect();if(!s||P.sabu.st!=='common'||P.sabu.late||rankIdx(s.id)<SB.late)return;const b=P.sabu,M=sbMasters(s.id),cur=(art()||{}).cls;
  b.late=1;b.st='named';b.off=(M.find(m=>m.cls===cur)||M[0]).k;log(`${rankName(s.id)}에 오른 당신을 ${M[b.off].n}이(가) 눈여겨보고 제자로 지명했습니다. 본산 문파 창에서 받들지 정하세요.`,'xp');showBanner('늦은 지명',M[b.off].n)});
// 대제자 선발을 청할 수 있나
function djWhy(){const b=P.sabu,s=sbSect();if(!s)return'문파 제자만';if(b.dj)return'이미 대제자다';if(b.st==='rank'||b.st==='pick'||b.st==='named')return'입문 서열과 사부부터 정해야 한다';
  const need=b.st==='disc'?SB.dj.rank:SB.dj.rankCommon;if(rankIdx(s.id)<need)return`${rankName(s.id,need)} 이상${b.st==='disc'?'':' (사부가 없으면 한 단 더)'}`;
  if(realmIdx()<SB.dj.realm)return`${RANKS[SB.dj.realm]} 이상`;if(b.djCool&&realAge()<b.djCool)return`지난 선발에 져서 ${Math.max(1,Math.ceil((b.djCool-realAge())*12))}달 뒤`;if(G.duel||P.hp<=0)return'지금은 안 된다';return''}
// ---- 그 자리 비무 (서열 비무 · 대제자 선발) ----
function sbDuel(kind){const b=P.sabu,s=sbSect();if(!s||G.duel||P.hp<=0||!sbInHq(s.id))return;let foe,kh,ka,nm;
  if(kind==='rank'){const pos=sbPos();if(b.st!=='rank'||pos<=0)return;foe=b.coh.find(o=>o.n===b.ord[pos-1]);[kh,ka]=SB.duel[pos-1];nm=`${s.n} 동기 ${foe.n} · ${pos}위`}
  else{if(djWhy())return;foe=b.coh.find(o=>o.n===b.ord[sbPos()===0?1:0]);kh=SB.dj.kh;ka=SB.dj.ka;nm=`${s.n} 수석 제자 ${foe.n}`}
  const r=realmIdx(),es=eliteStat(r,kh,ka),cls=foe.cls,ranged=rangedCls(cls),ar=(s.arts.find(a=>a.cls===cls&&!a.hi)||{}).id;
  closePanels();G.duel=true;G.sbDuel={kind,foe:foe.n,x:P.x,y:P.y};for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}
  P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;
  let ex=P.x+2.4,ey=P.y;if(!walkAt(ex,ey)){ex=P.x-2.4;if(!walkAt(ex,ey)){ex=P.x;ey=P.y+2.4}}
  const e=mkMob(nm,ex,ey,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.2,reach:ranged?5:cls==='창'?1.8:1.4,ranged:ranged?1:0,el:typeof simSectEl==='function'?simSectEl(s.id):null,pal:'duelist',hostile:1,aggro:9,duelist:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls,sbFoe:1});if(ar)e.art=ar;
  e.d=Object.assign({},e.d,{pal:(typeof sectPal==='function'&&sectPal(s.id,kind==='rank'?0:2,cls,{}))||'duelist'});e.name=nm;mobs.push(e);P.target=e;
  showBanner(kind==='rank'?'서열 비무':'대제자 선발',nm);log(kind==='rank'?`${foe.n}: "서열은 실력으로 정하는 거야. 덤벼!"`:`${masterTitle(s)}: "대제자 자리는 하나다. 실력으로 보여라."`,'info')}
function sbDuelEnd(win){const t=G.sbDuel;G.duel=false;G.sbDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!win)P.hp=Math.max(1,Math.round(P.maxHp*.3));
  const b=P.sabu,s=sbSect();if(!t||!s)return;
  if(t.kind==='rank'){const pos=sbPos();if(win){b.ord[pos]=b.ord[pos-1];b.ord[pos-1]='@';log(`${t.foe}을(를) 꺾고 서열 ${pos}위로 올랐습니다.`,'xp');showBanner('서열 비무 승리',`${pos}위`);if(pos-1===0)sbSettle()}
    else{log(`${t.foe}에게 졌습니다. 서열이 ${pos+1}위로 굳었습니다.`,'info');showBanner('서열 비무 패배',`${pos+1}위로 굳음`);sbSettle()}return}
  if(!win){b.djCool=realAge()+SB.dj.retry;log(`${t.foe}에게 져 대제자 선발에서 떨어졌습니다. 한 해 더 수련하고 다시 청하세요.`,'dmg');showBanner('선발 낙방',s.n);return}
  b.dj=1;showBanner(`${s.n} 대제자`,`${masterTitle(s)}이 장문절기를 전한다`);feat(`${s.n}의 대제자가 되었다`);P.fame+=20;
  const got=[];for(const m of s.arts.filter(a=>a.hi)){const a=ARTS[m.id];if(P.arts[m.id]){got.push(a.n);continue}if(capArts().length>=artCap()){log(`오성 칸이 모자라 장문절기 [${a.n}]은(는) 비급으로 받아 두었습니다. 칸을 비우고 읽으세요.`,'info');if(P.bag.length<24)P.bag.push(mkBook(m.id,0));continue}
    P.arts[m.id]={p:0,f:a.forms.map((f,i)=>i===0)};got.push(a.n)}
  log(`${masterTitle(s)}: "이제 네가 ${s.n}의 대제자다." 장문절기 ${got.map(n=>`[${n}]`).join(' · ')}을(를) 전수받았습니다. 명성 +20. 다음 초식 비급은 공적으로 받습니다.`,'xp');recalc()}
hook('tick',()=>{const t=G.sbDuel;if(!t||!P||!playing)return;if(Math.hypot(P.x-t.x,P.y-t.y)>9){log('비무 자리를 벗어나 졌습니다.','dmg');duelEnd(false)}});
hook('gLoaded',()=>{if(G.sbDuel){G.sbDuel=null;G.duel=false}});
hook('sectAct',c=>{if(!/^sb/.test(c.a))return;c.done=true;c.r=true;const b=P.sabu,s=sbSect();if(!s)return;
  if(c.a==='sbduel')sbDuel('rank');else if(c.a==='sbdj')sbDuel('dj');
  else if(c.a==='sbstop'&&b.st==='rank')sbSettle();
  else if(c.a==='sbpick'&&b.st==='pick'&&sbInHq(s.id))sbTake(+c.x);
  else if(c.a==='sbtake'&&b.st==='named'&&sbInHq(s.id))sbTake(b.off);
  else if(c.a==='sbno'&&b.st==='named'){b.st='common';b.off=-1;log('지명을 사양했습니다. 공통 길로 공적을 쌓아 무공을 배웁니다.','info')}
  else if(c.a==='sbnext'&&b.st==='disc'&&sbInHq(s.id))sbGive(false)});
// ---- 화면: 문파 창 맨 위 '사부와 로드맵' 카드 ----
function sbPathHtml(M,mine){const b=P.sabu;return `<div class="sbpath">${M.path.map((id,i)=>{const a=ARTS[id],st=A(id),got=!!st,nx=mine&&i===b.step;
  return `<span class="sbstep${got?' got':nx?' next':''}">${gradeTag(a.grade)} ${esc(a.n)}${got?` <small class="good">${st.f.filter(Boolean).length}/${a.forms.length}</small>`:nx?' <small class="gold">다음</small>':''}</span>`}).join('<span class="dim"> → </span>')}</div>`}
function sbOrdHtml(){const b=P.sabu;return `<p class="note">${b.ord.map((n,i)=>n==='@'?`<b class="gold">${i+1}.나</b>`:`<span class="dim">${i+1}.${esc(n)}</span>`).join(' · ')}</p>`}
function sabuCard(s,hq){if(s.id==='geumgun'&&typeof gbCard==='function')return gbCard(s,hq);if(!P.sabu||P.sabu.sid!==s.id||!sabuOn(s))return sabuOn(s)?`<div class="card sbcard"><h4>사부와 로드맵</h4><p class="note">입문 서열이 이미 지나 공통 길을 걷는다. ${rankName(s.id,SB.late)}에 오르면 사부가 지명할 수 있다.</p></div>`:'';
  const b=P.sabu,M=sbMasters(s.id),here=hq?'':`<p class="note dim">비무와 사부 정하기는 본산 ${hqPlace(s)}의 ${masterTitle(s)} 창에서 한다.</p>`;let body='';
  const masters=(btn)=>`<div class="list">${M.map(m=>`<div class="it"><div><b>${esc(m.n)}</b> <small class="dim">${CLASS[m.cls].n}</small>${sbPathHtml(m,false)}<span>"${esc(m.say)}"</span></div><div class="ib">${btn(m)}</div></div>`).join('')}</div>`;
  if(b.st==='rank'){const pos=sbPos(),up=pos>0?b.ord[pos-1]:null;
    body=`<p class="note">입문 동기 여섯의 서열. <b>1위</b>는 사부를 고르고, 그 아래는 위 동기들이 사부를 먼저 데려간 뒤 남은 사부가 지명한다. 바로 위 동기를 이기면 한 칸 오르고, 지면 서열이 굳는다.</p>${sbOrdHtml()}
      <div class="row2"><span class="note">${up?`다음 상대 <b>${esc(up)}</b> (${pos}위)`:''}</span><span>${hq&&up?B('sbduel',`서열 비무 · ${esc(up)}`,{pri:1,d:!!G.duel}):''}${B('sbstop','여기서 서열 굳히기')}</span></div>${masters(()=>'')}`}
  else if(b.st==='pick')body=`<p class="note"><b class="gold">서열 1위.</b> 모실 사부를 고른다. 사부마다 병기와 무공 길이 다르다.</p>${sbOrdHtml()}${masters(m=>hq?B('sbpick:'+m.k,'이 사부를 모신다',{pri:1}):'')}`;
  else if(b.st==='named'){const m=M[b.off];body=`<p class="note"><b class="gold">${esc(m.n)}</b>이(가) 당신을 제자로 지명했다.</p>${masters(x=>x.k!==b.off?'':(hq?B('sbtake','받든다',{pri:1}):'')+B('sbno','사양하고 공통 길'))}`}
  else if(b.st==='disc'){const m=sbMy(),why=sbNextWhy(),done=b.step>=m.path.length;
    body=`<p class="note">사부 <b>${esc(m.n)}</b> · ${CLASS[m.cls].n}. 앞 무공 숙련 ${SB.mast}과 직위(상승 ${rankName(s.id,SB.rank[2])}, 절정 ${rankName(s.id,SB.rank[3]??2)})가 되면 다음 무공을 받는다. 초식은 아래 '가르침 청하기'.</p>${sbPathHtml(m,true)}
      ${done?'':`<div class="row2"><span class="note">${why?`<small class="dim">${esc(why)}</small>`:`[${esc(ARTS[m.path[b.step]].n)}]을(를) 받을 수 있다`}</span>${hq?B('sbnext','다음 무공 청하기',{pri:!why,d:!!why}):''}</div>`}`}
  else body=`<p class="note">사부 없이 <b>공통 길</b>을 걷는다. 입문공과 공적 비급으로 배운다. ${b.late?'':`${rankName(s.id,SB.late)}에 오르면 사부가 지명할 수 있다.`}</p>${sbOrdHtml()}`;
  const dw=djWhy(),hiN=s.arts.filter(a=>a.hi).map(a=>`[${ARTS[a.id].n}]`).join(' · ');
  const dj=b.dj?`<div class="row2"><span class="note"><b class="gold">${s.n} 대제자</b> · 장문절기 ${hiN}의 비급을 공적으로 받는다.</span></div>`
    :`<div class="row2"><span class="note">대제자가 되면 ${masterTitle(s)}이 장문절기 ${hiN}을(를) 전한다. ${dw?`<small class="dim">${esc(dw)}</small>`:'동기 수석과 선발 비무를 청할 수 있다.'}</span>${hq&&!dw?B('sbdj','대제자 선발 청하기',{pri:1}):''}</div>`;
  return `<div class="card sbcard"><div class="row2"><h4>사부와 로드맵</h4><span class="tag">${b.dj?'대제자':b.st==='disc'?'사부의 제자':b.st==='common'?'공통 길':'입문 서열 '+(sbPos()+1)+'위'}</span></div>${body}${here}${dj}</div>`}
// 임무 줄: 할 일이 있을 때만
function sabuTrackHtml(){const s=sbSect();if(!s)return'';const b=P.sabu;
  const t=b.st==='rank'?`서열 ${sbPos()+1}위 · 서열 비무`:b.st==='pick'?'서열 1위 · 사부 고르기':b.st==='named'?`${sbMasters(s.id)[b.off].n}의 지명`:b.st==='disc'&&!sbNextWhy()?'사부에게 다음 무공 청하기':!b.dj&&!djWhy()?'대제자 선발 청하기':'';
  return t?`<h5>사부 · ${esc(s.n)}</h5><div>${t} <small class="dim">본산 ${esc(masterTitle(s))}</small></div>`:''}

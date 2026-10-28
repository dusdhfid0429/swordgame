// ================= 문파 수련기 (v199, 설계 제안 2026-10-28 · 사용자 "제안한 대로 진행") =================
// 무관을 나온 어린 제자가 강호 사건이 시작되는 20세까지 문파 안에서 자라는 이야기. data/suryeon.json SRY 마디 넷.
// - 본산에서 문파에 들 때(SRY_END세 전) P.sry가 생긴다. 마디는 나이(age)가 차면 하나씩 열리고, 과제는 한꺼번에 보인다.
// - 세는 과제(외공·공적)는 열린 때 값을 base로 잡는다. 운기·처치·대련·폐관은 c에 센다.
// - 다 하면 문파 창(그 문파 제자일 때)에서 사부에게 보고하고 보상을 받는다. 하지 않아도 벌은 없다. 문파를 떠나면 멈춘다.
// - 2마디: 사형(동료 kind 'sect', g_mobil.js 귀환 규칙)을 데려간다. 3마디: 무관 동기와 그 자리 대련(G.sryDuel, g_life duelEnd가 넘긴다).
const SRY=GD.SRY,SRY_END=GD.SRY_END||20;
const sryOn=()=>!!(P&&P.sry&&!P.sry.end&&P.sect===P.sry.sid&&SECTS[P.sect]);
const srySt=()=>SRY[P.sry.m];
const sryOpen=()=>sryOn()&&!!P.sry.open;
const SRY_VAL={oe:()=>pillarVal('oe'),merit:()=>(P.mtot&&P.mtot[P.sry.sid])||0};
function sryProg(g){const s=P.sry,c=s.c;
  let have=SRY_VAL[g.k]?SRY_VAL[g.k]()-((s.base||{})[g.k]||0):g.k==='rank'?rankIdx(s.sid)-(s.base.rank||0):Math.floor(c[g.k]||0);
  have=Math.max(0,have);return{have:Math.min(have,g.v),need:g.v,done:have>=g.v}}
const sryAllDone=()=>srySt().goals.every(g=>sryProg(g).done);
function sryStart(sid){if(!P||P.sry||P.age>=SRY_END||!SECTS[sid])return;P.sry={sid,m:0,open:0,c:{},base:{}}}
function sryActivate(){const s=P.sry,st=srySt(),S=SECTS[s.sid];s.open=1;s.c={};s.base={oe:SRY_VAL.oe(),merit:SRY_VAL.merit(),rank:rankIdx(s.sid)};
  if(st.rival&&!s.rival){const A=acadOf(P.side),pool=SECT_DATA.map(d=>d[0]).filter(id=>id!==s.sid&&SECTS[id].al!=='magyo'&&sideOk(SECTS[id].al)&&!(G.gone&&G.gone[id]));
    s.rival={n:A.mates[Math.floor(Math.random()*A.mates.length)][0],sect:pool.length?pick(pool):null}}
  log(`[문파 수련기 ${s.m+1} · ${st.n}] ${masterTitle(S)}: "${st.say}"`,'sys');showBanner(`수련기 ${s.m+1} · ${st.n}`,`${S.n} ${masterTitle(S)}의 부름`)}
// 나이가 차면 다음 마디를 연다. 예전 저장(이미 문파에 든 어린 제자)도 여기서 시작한다
let sryT=0;hook('tick',dt=>{if(!P||!playing)return;
  if(sryOpen()){const s=P.sry;if(P.medit&&srySt().goals.some(g=>g.k==='medit'))s.c.medit=(s.c.medit||0)+dt}
  if((sryT-=dt)>0)return;sryT=1;
  if(!P.sry&&P.sect&&P.sect!=='own'&&SECTS[P.sect]&&!acadOn())sryStart(P.sect);
  if(sryOn()&&!P.sry.open&&!G.duel&&P.age>=srySt().age)sryActivate()});
hook('sectActDone',c=>{if(c.a==='sjoin'&&P.sect===c.x)sryStart(c.x)});
hook('kill',e=>{if(!sryOpen())return;const g=srySt().goals.find(g=>g.k==='kill');if(g&&g.mob.includes(e.kind))P.sry.c.kill=(P.sry.c.kill||0)+1});
// 폐관수련은 붙든 떨어지든 한 번으로 센다 (본산에서만)
hook('pgDone',()=>{if(sryOpen()&&inOwnSect()&&P.hp>0)P.sry.c.pg=(P.sry.c.pg||0)+1});
// 2마디: 사형과 하산
function sryAlly(){const s=P.sry,st=srySt(),S=SECTS[s.sid];if(!sryOpen()||!st.ally||allies.some(a=>a.sry)||G.duel)return;
  const r=Math.min(6,realmIdx()+0),es=eliteStat(r,st.ally.kh,st.ally.ka),cls=(startSet(S).art||S.arts[0]).cls||'검';
  let x=P.x+1,y=P.y;if(!walkAt(x,y)){x=P.x;y=P.y}
  const a=mkAlly('sect',`${S.n} 사형`,x,y);Object.assign(a,{k:'사형',sect:S.id,rank:1,realm:r,hp:es.hp,maxHp:es.hp,atk:es.atk,def:2+r,sp:2.8,left:st.ally.dur,sry:1,pal:(typeof sectPal==='function'&&sectPal(S.id,1,cls,{}))||'disciple'});
  a.d={pal:a.pal};allies.push(a);fx.push({t:'puff',x,y,life:.6});log(`${S.n} 사형이 함께 하산합니다. ${Math.round(st.ally.dur/60)}분 동안 곁에서 싸웁니다.`,'xp')}
// 3마디: 무관 동기와 대련 (그 자리에서, 승급 시험과 같은 방식)
function sryDuel(){const s=P.sry,st=srySt();if(!sryOpen()||!st.rival||G.duel||P.hp<=0||(s.c.rival||0)>=1)return;const rv=s.rival,RS=rv.sect&&SECTS[rv.sect];
  const r=realmIdx(),es=eliteStat(r,st.rival.kh,st.rival.ka),cls=RS?(startSet(RS).art||RS.arts[0]).cls:'검';
  closePanels();G.duel=true;G.sryDuel=1;for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}
  P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;
  let ex=P.x+2.4,ey=P.y;if(!walkAt(ex,ey)){ex=P.x-2.4;if(!walkAt(ex,ey)){ex=P.x;ey=P.y+2.4}}
  const nm=`${RS?RS.n+' ':''}${rv.n}`,ranged=rangedCls(cls);
  const e=mkMob(nm,ex,ey,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.2,reach:ranged?5:cls==='창'?1.8:1.4,ranged:ranged?1:0,el:null,pal:'duelist',hostile:1,aggro:9,duelist:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls,sryRival:1});
  e.d=Object.assign({},e.d,{pal:(RS&&typeof sectPal==='function'&&sectPal(RS.id,1,cls,{}))||'duelist'});e.name=nm;
  mobs.push(e);P.target=e;showBanner('동기 대련',nm);log(`${rv.n}: "오랜만이야. 무관에서처럼 봐주지는 않을 거야."`,'info')}
function sryDuelEnd(win){G.duel=false;G.sryDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!win)P.hp=Math.max(1,Math.round(P.maxHp*.3));
  const s=P.sry;if(!s)return;s.c.rival=1;s.c.rivalWin=win?1:0;const rv=s.rival||{n:'동기'};
  log(win?`${rv.n}을(를) 꺾었습니다. "다음엔 내가 이긴다. 강호에서 또 보자."`:`${rv.n}에게 졌습니다. "아직 멀었네. 강호에서 또 보자."`,win?'xp':'info');showBanner(win?'대련 승리':'대련 패배',rv.n);
  feat(`무관 동기 ${rv.n}와(과) 겨뤄 ${win?'이겼다':'졌다'}`)}
hook('gLoaded',()=>{if(G.sryDuel){G.sryDuel=null;G.duel=false}});
// 보고: 보상을 받고 다음 마디로
function sryReport(){if(!sryOpen()||!sryAllDone())return;const s=P.sry,st=srySt(),r=st.reward||{},S=SECTS[s.sid],got=[];
  if(r.merit){addMerit(s.sid,r.merit);got.push(`공적 ${r.merit}`)}if(r.vit){gainVit(r.vit);got.push(`활력 ${r.vit}`)}
  const win=s.c.rivalWin,fame=(r.fame||0)+(win?r.winFame||0:0),enl=(r.enl||0)+(win?r.winEnl||0:0);
  if(fame){P.fame+=fame;got.push(`명성 ${fame}`)}if(enl){P.enl=(P.enl||0)+enl;got.push(`깨달음 ${enl}`)}
  if(r.mast){const a=art(),m=a&&A(a.id);if(m&&a.id!=='base'){m.p=Math.min(100,m.p+r.mast);got.push(`[${a.n}] 숙련 +${r.mast}`)}}
  for(const[k,v]of Object.entries(r.mats||{})){P.mats[k]=(P.mats[k]||0)+v;got.push(`${k} ${v}`)}
  allies=allies.filter(a=>!a.sry);recalc();
  log(`${masterTitle(S)}: "잘했다." 수련기 ${s.m+1}마디 [${st.n}]을(를) 마쳤습니다. ${got.join(', ')}.`,'xp');feat(`${S.n} 수련기 [${st.n}]을(를) 마쳤다`);
  s.m++;s.open=0;s.c={};if(s.m>=SRY.length){s.end=1;showBanner('수련기를 마치다',`${S.n} · ${Math.floor(P.age)}세`);log('문파 수련기를 모두 마쳤다. 이제 강호가 기다린다.','xp')}
  else showBanner(`${st.n} 마침`,`다음: ${SRY[s.m].n} (${SRY[s.m].age}세)`)}
hook('sectAct',c=>{const a=c.a;if(a!=='sryrep'&&a!=='sryally'&&a!=='sryduel')return;c.done=true;c.r=true;
  if(a==='sryrep')sryReport();else if(a==='sryally'){sryAlly();closePanels()}else sryDuel()});
// ---- 화면: 문파 창 카드, 임무창 카드, 임무 줄 ----
const sryGoalRows=()=>srySt().goals.map(g=>{const p=sryProg(g);return `<div class="it"><div>${esc(g.n)}${p.done?' <small class="good">완료</small>':''}<span>${esc(g.h)}</span></div><div class="ib"><b class="num${p.done?' good':''}">${p.have}/${p.need}</b></div></div>`}).join('');
const srySteps=()=>`<p class="note">${SRY.map((t,i)=>`<span class="${i<P.sry.m||P.sry.end?'good':i===P.sry.m?'gold':'dim'}">${i+1}.${t.n} <small>${t.age?t.age+'세':'입문'}</small></span>`).join(' · ')}</p>`;
function sryCard(inSect){if(!sryOn())return'';const s=P.sry,st=srySt();
  if(!s.open)return `<div class="card"><h4>문파 수련기 <small class="dim">${s.m+1}/${SRY.length}</small></h4>${srySteps()}<p class="note">다음 마디 [${st.n}]은(는) ${st.age}세에 사부가 부른다.</p></div>`;
  const done=sryAllDone(),btn=[];
  if(inSect){if(st.ally&&!done)btn.push(B('sryally','사형과 하산',{d:allies.some(a=>a.sry)||!!G.duel,pri:!allies.some(a=>a.sry)}));
    if(st.rival&&!(s.c.rival))btn.push(B('sryduel',`동기와 대련 · ${esc(s.rival?s.rival.n:'')}`,{pri:1,d:!!G.duel}));
    btn.push(B('sryrep','사부에게 보고',{pri:done,d:!done}))}
  return `<div class="card"><div class="row2"><h4>문파 수련기 ${s.m+1} · ${esc(st.n)}</h4><span class="tag">보고 ${esc(masterTitle(SECTS[s.sid]))}</span></div>${srySteps()}<p class="note">${esc(st.d)}</p>
    ${s.rival&&st.rival?`<p class="note">찾아온 동기: <b>${esc(s.rival.n)}</b>${s.rival.sect?` · ${SECTS[s.rival.sect].n}`:''}</p>`:''}<div class="list">${sryGoalRows()}</div>
    ${btn.length?`<div class="row2"><span class="note">${done?'과제를 모두 마쳤다. 사부에게 보고하자.':''}</span><span>${btn.join('')}</span></div>`:`<p class="note">보고는 ${SECTS[s.sid].n} 문파 창에서 한다.</p>`}</div>`}
function sryTrackHtml(){if(!sryOpen())return'';const s=P.sry,st=srySt(),g=st.goals.find(g=>!sryProg(g).done),p=g&&sryProg(g);
  return `<h5>수련기 ${s.m+1} · ${esc(st.n)}</h5>`+(g?`<div>${esc(g.n)} <b>${p.have}/${p.need}</b></div>`:`<div class="done">과제 완료 · 사부에게 보고</div>`)}

// ================= v254 종남파 (사용자 2026-11-12 "모두 적용하고 묘사된 종남파의 형태도 맵에 적용해줘") =================
// 고파 영상 「종남파, 군림천하부터 촌검무인까지」 분석 → 문서 https://claude.ai/artifact/T2hiN4zVRHbgPTLjy1Xj76 의 제안 A~G. 숫자·이름은 data/jongnam.json (GD.JONGNAM)
// A 세 검관: 사부 3명을 현무관(권장·금나)·은하관(힘의 검)·유운관(변화의 검) 관주로. 길·무공은 g_sect.js addSabuArts 끝에서 다듬는다. 본산 외원은 시무관(공통 기초) 마당
// B 천하삼십육검: 절정 장문절기 이름·초식(은하수 심상). 종남 검법은 근력이 앞서면 중검(피해·밀쳐냄), 민첩이 앞서면 연환검(추가 일격), 고르면 정검(명중)
// C 태을 심법: 태을심법·태을신공·태을강기. 특색 '태을' = 운기조식을 끊지 않을수록 회복이 빨라진다 (g_core qiRegen × jnQiMul). 내공이 저절로 차지는 않는다
// D 섬서 논검: G.cal 다섯 해마다 화산과 종남이 대표를 내세운다. 두 문파 제자면 지객 장로에게 나선다. 종남 속가제자가 이기면 천하삼십육검 끝 초식까지 (P.kinEx, g_lore kinOk·g_sabu jmOk)
// E 검↔장 전환: 종남 검법으로 친 적이 바짝 붙으면 익힌 종남 장법으로 한 번 밀어낸다 (재사용 대기)
// F 몰락한 종남 판: 둘째 생부터 가끔 종남이 쇠락한 채 시작한다. 인원이 기준의 75%까지 되살아나면 재건 (그동안 천하삼십육검 비급 없음)
// G 종남산 명소: 자오도 어귀(사천으로 넘어감)·누관 설경대·중양궁 옛터·맹교의 시비 (node 'jnspot', g_life interact·g_draw)
const JN=GD.JONGNAM||{},JNS=JN.sid||'jongnam';

// ---- B 검풍 ----
function jnSword(X){const a=X&&X.art;if(!a||a.cls!=='검'||X.bare)return false;if(a.sect===JNS)return true;const s=typeof artSect==='function'&&artSect(a.id);return !!s&&s.id===JNS}
function jnPung(){if(!P||!P.st)return 'even';const s=P.st.str,a=P.st.agi,k=(JN.pung||{}).k||1.15;return s>=a*k?'heavy':a>=s*k?'fast':'even'}
const JN_PN={heavy:'중검',fast:'연환검',even:'정검'},JN_PD={heavy:'검격이 묵직해 피해가 늘고 적을 밀쳐낸다',fast:'빠른 검이 따라붙어 이따금 한 번 더 벤다',even:'자세가 정갈해 잘 빗나가지 않는다'};
function jnTxt(e,t,col,force){if(!force&&time<(P.jnTxtT||0))return;P.jnTxtT=time+((JN.pung||{}).txtCd||1.2);addText(e.x,e.y-.6,t,col)}
hook('hit',c=>{if(c.from!==P||!JN.pung||!jnSword(c.X))return;const p=jnPung();if(p==='heavy')c.m*=JN.pung.heavyM;else if(p==='even')c.hm-=JN.pung.evenHm});
hook('hitDone',c=>{if(c.from!==P||!JN.pung||!jnSword(c.X))return;const e=c.e,U=JN.pung,p=jnPung(),dealt=Math.max(0,(c.hp0||0)-e.hp);
  if(p==='heavy'&&e.hp>0&&!(e.d&&e.d.boss)){const l=Math.hypot(e.x-P.x,e.y-P.y)||1;e.kb={x:(e.x-P.x)/l*U.heavyKb,y:(e.y-P.y)/l*U.heavyKb};e.stun=Math.max(e.stun||0,U.heavyStun);jnTxt(e,'중검','#e8c890')}
  if(p==='fast'&&e.hp>0&&dealt>0&&time>(P.jnFastT||0)&&Math.random()<U.fastP){P.jnFastT=time+U.fastCd;later(.16,()=>{if(e.hp>0){damage(e,Math.max(1,Math.round(dealt*U.fastM)),.1,0,P);jnTxt(e,'연환','#bfe3ff',1)}})}
  jnPalm(e)});

// ---- E 검↔장 전환 ----
function jnPalmArt(){if(!P||!P.arts)return null;const m=(typeof SABU!=='undefined'&&SABU[JNS]||[]).find(q=>q.cls==='권'),ids=[`S_${JNS}_1`,...(m?m.path:[])];
  let best=null;for(const id of ids)if(P.arts[id]&&ARTS[id]&&ARTS[id].cls==='권'&&(!best||(A(id).p||0)>(A(best).p||0)))best=id;return best}
function jnPalm(e){const U=JN.palm;if(!U||!e||e.hp<=0||time<(P.jnPalmT||0)||Math.hypot(e.x-P.x,e.y-P.y)>U.r)return;const id=jnPalmArt();if(!id)return;P.jnPalmT=time+U.cd;
  later(.12,()=>{if(e.hp<=0)return;const st=A(id),d=Math.max(1,Math.round(atk()*U.m*(.9+Math.random()*.2)*(1+((st&&st.p)||0)/200)));damage(e,d,U.kb,e.d&&e.d.boss?U.stun*.4:U.stun,P);
    fx.push({t:'ring',x:e.x,y:e.y,life:.45,max:.45,col:'226,200,140'});addText(e.x,e.y-.85,`${ARTS[id].n} 전환`,'#f0d090');if(typeof gainMast==='function')gainMast(id,1)})}

// ---- C 태을 운기 ----
hook('tick',dt=>{if(!P)return;if(P.medit)P.medT=(P.medT||0)+(dt||0);else if(P.medT)P.medT=0});
function jnQiMul(){if(!P||!P.medit||typeof simTv!=='function')return 1;const v=simTv('taeul');if(!v)return 1;return 1+v/100*Math.min(1,(P.medT||0)/((JN.taeul||{}).full||30))}

// ---- F 몰락한 종남 판 ----
function jnFallD(){if(!G||!P)return null;const F=JN.fall;if(!F)return null;const n=P.lifeNo||1;
  if(!G.jnFall||G.jnFall.life!==n){const on=n>1&&Math.random()<F.p&&SECTS[JNS]&&!sectGone(JNS);G.jnFall={life:n,on:on?1:0,back:0};
    if(on&&typeof popInit==='function'){popInit();const s=SECTS[JNS],v=Math.round(popBase(s)*F.pop);if((G.pop[JNS]||0)>v)G.pop[JNS]=v;if(typeof popSync==='function')popSync();logQuiet(`이번 생의 강호: ${F.say}`,'sys')}}
  return G.jnFall}
const jnLost=()=>{const f=G&&G.jnFall;return !!(f&&f.on&&!f.back&&P&&f.life===P.lifeNo)};
hook('gLoaded',()=>{if(P&&(!G.jnFall||G.jnFall.life!==P.lifeNo))G.jnFall={life:P.lifeNo||1,on:0,back:0};if(G.ngDuel){G.ngDuel=null;G.duel=false}});   // 예전 저장: 이번 생은 그대로
hook('tick',()=>{if(P&&playing&&G&&(!G.jnFall||G.jnFall.life!==P.lifeNo))jnFallD()});
hook('newYear',()=>{const f=G.jnFall,F=JN.fall;if(!f||!f.on||f.back||!F||!SECTS[JNS]||sectGone(JNS))return;if(sectPop(JNS)<popBase(SECTS[JNS])*F.back)return;f.back=1;
  log(F.back_msg,'xp');showBanner('종남 재건',SECTS[JNS].n);if(P.sect===JNS){P.fame+=F.fame;if(typeof addMerit==='function')addMerit(JNS,F.merit);else P.merit[JNS]=(P.merit[JNS]||0)+F.merit;log(`종남을 다시 일으킨 제자로 이름이 났다. 명성 +${F.fame}, 공적 +${F.merit}`,'xp');feat('쇠락한 종남을 다시 일으켰다')}});
if(typeof loreVerNote==='function'){const o=loreVerNote;loreVerNote=id=>id===JNS&&jnLost()?JN.fall.say:o(id)}
// 장문절기(천하삼십육검) 비급: 쇠락한 판에는 없다 · 논검을 이긴 속가제자에게는 열린다. null 이면 원래 규칙 (g_sabu.js jmOk)
function jnHiOk(sid){if(sid!==JNS)return null;if(jnLost())return false;if(P&&P.kinEx&&P.kinEx[JNS])return true;return null}

// ---- D 섬서 논검 ----
const JNG=JN.ng||{},JNG_RIVAL={hwasan:JNS,[JNS]:'hwasan'};
function ngD(){G.ng=G.ng||{};return G.ng}
const ngLive=()=>!!(SECTS.hwasan&&SECTS[JNS]&&!sectGone('hwasan')&&!sectGone(JNS)&&sectPop('hwasan')>0&&sectPop(JNS)>0);
const ngYear=()=>Math.floor(G.cal||0);
function ngMine(){const g=ngD();return !!(g.open&&!g.open.done&&P&&JNG_RIVAL[P.sect]&&realmIdx()>=JNG.minRealm)}
function ngResult(win,me){const g=ngD(),lose=JNG_RIVAL[win],W=JNG.win;if(!SECTS[win]||!SECTS[lose])return;if(g.open)g.open.done=1;g.last={y:ngYear(),w:win,me:!!me};
  if(typeof popSet==='function'&&G.pop){popSet(win,G.pop[win]*W.pop,'');popSet(lose,G.pop[lose]*W.lose,'');if(typeof popSync==='function')popSync()}
  log(JNG.won.replace(/\{s\}/g,SECTS[win].n),me?'xp':'info')}
hook('newYear',()=>{if(!P||!G||!JNG.every)return;const g=ngD(),y=ngYear();
  if(g.open&&!g.open.done&&y>g.open.y)ngResult(Math.random()<(JNG.auto||.5)*(sectPop(JNS)/(sectPop(JNS)+sectPop('hwasan')||1))*2?JNS:'hwasan',false);   // 아무도 나서지 않은 해: 인원으로 갈린다
  if(y%JNG.every||!ngLive()||(g.open&&g.open.y===y))return;g.open={y};log(JNG.open.replace('{y}',y),'sys');
  if(ngMine())log(`${SECTS[P.sect].n} 지객 장로가 당신을 찾는다: "${JNG.ask}"`,'info')});
function ngCard(){if(!ngMine())return '';const foe=SECTS[JNG_RIVAL[P.sect]];
  return `<div class="card"><h4>섬서 논검 <small class="dim">${ngD().open.y}년</small></h4><p class="note">"${JNG.ask}" 상대는 ${foe.n}의 대표. 이기면 문파 인원이 늘고 명성 +${JNG.win.fame}·공적 +${JNG.win.merit}${P.sect===JNS&&!P.monk?'. 속가제자라도 천하삼십육검 끝 초식까지 전수받는다':''}.</p><div class="ib">${B('ngstart:'+P.sect,'대표로 나선다',{pri:1})}</div></div>`}
hook('npcDlg',c=>{if(!P||!c.n||!ngMine())return;const n=c.n;if(n.jigak===P.sect||(n.hq===P.sect&&n.master)){if(c.html==null&&n.jigak&&typeof smDlg==='function')c.html=smDlg(n);if(c.html!=null)c.html=ngCard()+c.html}});
hook('sectAct',c=>{if(c.a!=='ngstart')return;c.done=true;c.r=true;ngStart()});
function ngStart(){if(!ngMine()||G.duel)return;const foe=SECTS[JNG_RIVAL[P.sect]],r=clamp(realmIdx(),0,6),cls=(foe.arts.find(a=>a.cls==='검'&&!a.hi)||foe.arts[0]).cls,ar=foe.arts.find(a=>a.cls===cls&&!a.hi)||foe.arts[0];
  closePanels();G.duel=true;G.ngDuel={y:ngD().open.y,foe:foe.id,x:P.x,y0:P.y};for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}
  P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;let ex=P.x+2.4,ey=P.y;if(!walkAt(ex,ey)){ex=P.x-2.4;if(!walkAt(ex,ey)){ex=P.x;ey=P.y+2.4}}
  const es=eliteStat(r,JNG.foeK[0],JNG.foeK[1]),nm=`${foe.n} 대표`;
  const e=mkMob(nm,ex,ey,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.3,reach:1.4,el:typeof simSectEl==='function'?simSectEl(foe.id):'금',pal:'duelist',hostile:1,aggro:9,duelist:1,elite:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls,art:ar.id,ngRep:1});
  e.d=Object.assign({},e.d,{pal:(typeof sectPal==='function'&&sectPal(foe.id,3,cls,{elite:1}))||'duelist'});mobs.push(e);P.target=e;
  showBanner('섬서 논검',`${SECTS[P.sect].n} 대 ${foe.n}`);log(`섬서 논검: ${foe.n}의 대표와 검을 겨룬다.`,'sys')}
function ngDuelEnd(win,e){const t=G.ngDuel;G.duel=false;G.ngDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!t)return;const mine=P.sect;
  if(win){P.fame+=JNG.win.fame;if(typeof addMerit==='function')addMerit(mine,JNG.win.merit);else P.merit[mine]=(P.merit[mine]||0)+JNG.win.merit;showBanner('논검 승리',`명성 +${JNG.win.fame}`);feat(`섬서 논검에서 ${SECTS[t.foe].n}의 대표를 꺾었다`);
    if(mine===JNS&&!P.monk){P.kinEx=P.kinEx||{};P.kinEx[JNS]=1;log(JNG.hi,'xp')}ngResult(mine,true)}
  else{P.hp=Math.max(1,P.maxHp*.3);log(`${SECTS[t.foe].n}의 대표에게 졌다. 논검에서는 목숨을 잃지 않는다.`,'dmg');ngResult(t.foe,true)}}

// ---- A 세 검관·시무관 사범 대화 ----
function jnGwan(k){return(typeof SABU!=='undefined'&&SABU[JNS]||[])[k]}
function jnGwanHtml(k){const m=jnGwan(k),gw=(JN.gwan||[])[k];if(!m||!gw)return '';const mine=P.sabu&&P.sabu.sid===JNS&&P.sabu.st==='disc'&&P.sabu.m===k;
  return `<p class="note">"${gw.hall}는 ${gw.d}을 잇는다. 관주께서는 대연무장에서 제자를 고르신다."</p><div class="card"><h4>${gw.hall} <small class="dim">${CLASS[m.cls].n}${mine?' · 내 관':''}</small></h4><p class="note">${m.path.map(id=>ARTS[id]?`${ARTS[id].n} <small class="dim">${AGR[ARTS[id].grade??0]||''}</small>`:'').filter(Boolean).join(' → ')}</p></div>`}
function jnSimuHtml(){const p=jnPung(),G0=(JN.gwan||[]).map((gw,k)=>{const m=jnGwan(k);return m?`<b>${gw.hall}</b> <small class="dim">${CLASS[m.cls].n}</small> ${gw.d}`:''}).filter(Boolean).join('<br>');
  return `<p class="note">"새로 든 제자는 누구든 여기서 같은 기초를 닦는다. 성취와 성향을 보고 세 검관 가운데 하나로 간다."</p><div class="card"><h4>세 검관</h4><p class="note">${G0}</p></div>
    <div class="card"><h4>내 검풍 <small class="dim">근력 ${P.st.str} · 민첩 ${P.st.agi}</small></h4><p class="note"><b>${JN_PN[p]}</b> · ${JN_PD[p]}. 종남 검법을 들면 이렇게 펼쳐진다. 종남 장법을 익혔다면 바짝 붙은 적을 장으로 밀어낸다.</p></div>`}
hook('npcDlg',c=>{if(c.html!=null||!c.n||c.n.ssid!==JNS||!P)return;const r=c.n.srole;if(r==='simu')c.html=jnSimuHtml();else{const m=/^gw(\d)$/.exec(r||'');if(m)c.html=jnGwanHtml(+m[1])}});

// ---- G 종남산 명소 ----
const JN_SPOT={};(JN.spots||[]).forEach(s=>JN_SPOT[s.id]=s);
hook('regionLoaded',id=>{if(!P||typeof loreSpotXY!=='function')return;for(const S of JN.spots||[]){if(S.map!==id)continue;const p=loreSpotXY(S.at[0],S.at[1]);if(p)nodes.push({t:'jnspot',id:S.id,...p,cd:0})}});
function jnTravelTo(S){const ids=Object.keys(REGIONS).filter(k=>k===S.travel||k.startsWith(S.travel+'@')),pickG=id=>(REGIONS[id].gates||[]).find(q=>/^pv_shaanxi/.test(q.to||''));   // 지방 맵이 여러 장으로 나뉘면(g_split) 섬서로 이어진 장으로
  const id=ids.find(k=>k!==S.travel&&pickG(k))||ids.find(pickG)||ids[0];if(!id)return false;const g=pickG(id),x=g?g.x:N/2,y=g?g.y+2.5:NH/2;enterRegion(id,clamp(x,2,N-3),clamp(y,2,NH-3));return true}
function jnNode(n){if(n.t!=='jnspot')return false;const S=JN_SPOT[n.id];if(!S)return true;P.jnSpot=P.jnSpot||{};const first=!P.jnSpot[S.id];
  if(S.travel&&!first){if(P.silver<S.fee){log(`자오도를 넘으려면 길잡이 삯 은자 ${S.fee}이(가) 든다.`,'info');return true}
    P.chan={t:0,dur:1.6,label:'자오도를 따라 남쪽으로 넘어간다',fn:()=>{P.silver-=S.fee;if(jnTravelTo(S))log(`자오도를 넘어 ${REGIONS[S.travel].name||'사천'}에 닿았다. (은자 -${S.fee})`,'info')}};return true}
  P.chan={t:0,dur:1.6,label:`${S.n}을(를) 둘러본다`,fn:()=>{P.jnSpot[S.id]=1;let gain='';
    if(first){gainVit(JN.vit||0);gain+=` 활력 +${JN.vit||0}`;if(S.fame){P.fame+=S.fame;gain+=`, 명성 +${S.fame}`}if(S.wis&&P.wis<10){P.wis++;gain+=`, 오성 +1`}feat(`종남산 ${S.n}을(를) 둘러보았다`);showBanner('명소 유람',S.n)}
    log(`${S.n}. ${S.d}${first&&gain?gain:''}${S.travel?` 다시 살피면 자오도를 넘어 사천으로 간다 (은자 ${S.fee}).`:''}`,first?'xp':'info')}};return true}
function drawJnNode(n){const S=JN_SPOT[n.id];if(!S)return;const p=toScreen(n.x,n.y),fresh=!(P.jnSpot&&P.jnSpot[S.id]);ctx.save();ctx.translate(p.x,p.y);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,0,12,5,0,0,7);ctx.fill();
  const lg2=ctx.createLinearGradient(-8,0,8,0);lg2.addColorStop(0,'#8a8578');lg2.addColorStop(1,'#4c4a44');ctx.fillStyle=lg2;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-7,-24);ctx.quadraticCurveTo(0,-30,7,-24);ctx.lineTo(7,0);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(30,26,20,.6)';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-3,-21+i*5);ctx.lineTo(3,-21+i*5);ctx.stroke()}
  if(S.travel){ctx.strokeStyle='#c9a14a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(9,-14);ctx.lineTo(16,-14);ctx.lineTo(13,-17);ctx.moveTo(16,-14);ctx.lineTo(13,-11);ctx.stroke()}
  if(fresh)for(let i=0;i<5;i++){const k=frac(time*.3+i/5),a=Math.sin(k*Math.PI)*.55;ctx.fillStyle=`rgba(235,225,190,${a})`;ctx.beginPath();ctx.arc(Math.sin(i*2.3+time*.5)*12,-10-k*30,2,0,7);ctx.fill()}
  if(Math.hypot(n.x-P.x,n.y-P.y)<6){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(`● ${S.n}`,1,-35);ctx.fillStyle=fresh?'#f0e2b8':'#c8c0a8';ctx.fillText(`● ${S.n}`,0,-36)}
  ctx.restore()}

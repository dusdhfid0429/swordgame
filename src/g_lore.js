// ================= 무림록: 구파일방과 오대세가 (v213, 사용자 2026-10-30) =================
// 사용자가 보낸 참고 영상('구파일방과 오대세가｜위치부터 대표 무공까지', 문화번역가 고파)에서 추린 여덟 가지를 "다 넣어줘".
// 1 무림록(문파 도감): 문파·세가마다 실제 자리·분위기·전승·대표 인물·명소·무공 이름 풀이·앙숙과 동맹. 강호사·문파 창에서 연다.
//   자리는 늘 보이고, 분위기·전승은 본산에 가 보면, 인물은 본산 비석을 읽으면, 명소는 둘러보면 채워진다 (G.lore: 윤회해도 남고, 처음부터 새로 하면 지워진다).
// 2 무공 이름 풀이: 무공 창·무림록에 이름의 뜻 한 줄. LORE.mean에 없으면 이름 조각(gloss)과 끝말(suffix)을 이어 푼다.
// 3 앙숙·동맹(LORE.rel): 내 문파의 앙숙은 나를 덜 반기고(relBase) 동맹은 더 반긴다. 문파(구파)와 세가 사이에도 조금 거리가 있다.
//   한 문파의 임무를 해 주면 그 앙숙의 우호도는 떨어지고 동맹의 우호도는 오른다 (questDone).
// 4 세가는 혈연, 불문은 출가: 세가(LORE.blood)에 성씨가 같은 사람이 들면 직계, 아니면 방계(외성 제자). 출가 문파(LORE.monk)는 처음엔 속가 제자.
//   방계·속가 제자는 고급 무공 비급의 직위가 한 단 높고(kinPen, 맨 위 직위까지만), 고급 무공 마지막 초식은 직계·출가 제자만 받는다(kinBlock).
//   일대제자 이상이면 공적을 바쳐 입적(직계)하거나, 정식제자 이상이고 배우자가 없으면 출가한다. 출가하면 혼례를 올리지 못한다.
// 5 전대 고수 전설: 본산(첫 맵)에 비석(node stele). 읽으면 무림록에 인물이 실리고, 생마다 한 번 명성과 그 문파 무공 낱장 한 장(기연 실마리).
// 6 명소: 본산에 명소 표지(node spot, 아미 금정 운해·형산 축융봉 등). 생마다 한 번 둘러보면 활력·명성, 무림록에 명소가 실린다.
// 7 음공: 형산파 일반 무공 [소상야우검](검). 퍼지는 꼴의 초식만 쓰고, 맞은 적은 음파 고리와 함께 느려지고 이따금 넋을 놓는다.
//   buildArts 맨 끝에서 만들어 다른 무공의 초식 이름이 밀리지 않는다 (addLoreArts).
// 8 이번 생의 강호(G.lore.ver): 생마다 구파일방 아홉째 자리(곤륜·형산·해남), 오대세가 다섯째 자리(제갈·황보), 모용세가·개방 총타 자리 소문이 바뀐다.
//   첫 생은 원래 설정(곤륜·제갈). 자리에 든 문파는 '9파1방'·'오대세가' 목록에 서고, 제자 공적이 15% 더 붙는다 (loreSeatMul, addMerit).
// 데이터 data/lore.json (LORE), 테스트 tests/t121_lore.js
const LORE=GD.LORE,LSECT=LORE.sect,KIN=LORE.kin;
function loreD(){G.lore=G.lore||{};const L=G.lore;L.seen=L.seen||{};L.leg=L.leg||{};L.spot=L.spot||{};return L}

// ---- 8 이번 생의 강호 ----
const LV0={nine:LORE.ver.nine[0],five:LORE.ver.five[0],moyong:LORE.ver.moyong[0],gaebang:LORE.ver.gaebang[0]};
function loreVer(){if(!P||!G)return LV0;const L=loreD(),n=P.lifeNo||1;
  if(!L.ver||L.ver.life!==n){const V=LORE.ver,pk=a=>n<=1?a[0]:pick(a);L.ver={life:n,nine:pk(V.nine),five:pk(V.five),moyong:pk(V.moyong),gaebang:pk(V.gaebang),told:0}}
  return L.ver}
const loreFive=()=>{const v=loreVer();return [...FIVE.filter(id=>!LORE.ver.five.includes(id)),v.five]};
const loreNineOut=id=>LORE.ver.nine.includes(id)&&loreVer().nine!==id;   // 구파 자리를 다투다 이번 생엔 밀려난 문파
const loreSeat=id=>{const v=loreVer();return id===v.nine||id===v.five};
const loreSeatMul=id=>P&&P.sect===id&&loreSeat(id)?LORE.ver.seatMul:1;
function loreVerTxt(){const v=loreVer(),n=id=>SECTS[id]?SECTS[id].n:id;
  return `구파일방의 아홉째 자리는 ${n(v.nine)}, 오대세가 다섯째 자리는 ${n(v.five)}. 모용세가는 ${v.moyong}에 터를 잡았고, 개방 총타는 ${v.gaebang}에 있다는 소문이다.`}
function loreVerNote(id){const v=loreVer(),V=LORE.ver;
  if(V.nine.includes(id))return id===v.nine?'이번 생에는 구파일방의 아홉째 자리에 들었다. 제자 공적 +15%':'이번 생에는 구파일방 자리를 다른 문파에 내주었다';
  if(V.five.includes(id))return id===v.five?'이번 생에는 오대세가의 다섯째 자리에 들었다. 제자 공적 +15%':'이번 생에는 오대세가 자리를 다른 세가에 내주었다';
  if(id==='moyong')return `이번 생에는 ${v.moyong}에 터를 잡았다는 소문이 돈다`;
  if(id==='gaebang')return `이번 생에는 총타가 ${v.gaebang}에 있다는 소문이 돈다`;
  return ''}

// ---- 3 앙숙·동맹 ----
const REL={};LORE.rel.forEach(([a,b,k,d])=>{(REL[a]=REL[a]||[]).push({o:b,k,d});(REL[b]=REL[b]||[]).push({o:a,k,d})});
const relOf=(a,b)=>(REL[a]||[]).find(r=>r.o===b);
// repSect(g_rep.js)의 바탕에 더한다: 내 문파의 앙숙·동맹, 문파와 세가 사이
function relBase(sid){if(!P||!P.sect||P.sect===sid||!SECTS[P.sect])return 0;const r=relOf(P.sect,sid),B=LORE.relBase;let v=r?B[r.k]:0;
  const gu=LORE.gu,bl=LORE.blood;if((gu.includes(P.sect)&&bl[sid])||(bl[P.sect]&&gu.includes(sid)))v+=B.camp;return v}
hook('questDone',q=>{if(!q.sect||!REL[q.sect]||!SECTS[q.sect])return;const v=P.sect===q.sect?REP.quest.own:REP.quest.out;
  for(const r of REL[q.sect]){if(!SECTS[r.o]||(G.gone&&G.gone[r.o]))continue;const d=Math.round(v*LORE.relSpill[r.k]*10)/10;if(!d)continue;repAdd(r.o,0,d);
    log(`${SECTS[r.o].n}은(는) 당신이 ${SECTS[q.sect].n}의 일을 도운 것을 ${r.k==='feud'?'못마땅해한다':'반긴다'}. (${r.d})`,r.k==='feud'?'dmg':'info')}});
function relHtml(sid){const L=(REL[sid]||[]).filter(r=>SECTS[r.o]);if(!L.length)return '';
  return L.map(r=>`<b class="${r.k==='feud'?'bad':'good'}">${r.k==='feud'?'앙숙':'동맹'}</b> ${SECTS[r.o].n} <small class="dim">${r.d}</small>`).join('<br>')}

// ---- 4 세가는 혈연, 불문은 출가 ----
const isBlood=sid=>!!LORE.blood[sid],isMonk=sid=>LORE.monk.includes(sid);
const kinOk=sid=>isBlood(sid)?!!(P.kin&&P.kin[sid]):isMonk(sid)?!!P.monk:true;
const kinName=sid=>isBlood(sid)?(kinOk(sid)?'직계':'방계'):isMonk(sid)?(kinOk(sid)?'출가 제자':'속가 제자'):'';
// artNeedRank(g_sect.js)에 더하는 직위
function kinPen(a){if(!P||!a||!a.hi)return 0;const s=artSect(a.id);return s&&!kinOk(s.id)&&(isBlood(s.id)||isMonk(s.id))?KIN.pen:0}
// 고급 무공 마지막 초식: 직계·출가 제자만
function kinBlock(a,fi){if(!P||!a||!a.hi||fi!==a.forms.length-1)return '';const s=artSect(a.id);if(!s||kinOk(s.id))return '';
  return isBlood(s.id)?'직계만':isMonk(s.id)?'출가 제자만':''}
hook('sectActDone',c=>{if(c.a!=='sjoin'||P.sect!==c.x)return;const sid=c.x,s=SECTS[sid];
  if(isBlood(sid)){const sn=LORE.blood[sid];if(P.name.startsWith(sn)){(P.kin=P.kin||{})[sid]=1;log(`${sn}씨 성을 가진 당신은 ${s.n}의 직계로 받아들여졌다. 가문의 비전을 끝까지 이을 수 있다.`,'xp')}
    else log(`${s.n}은 핏줄로 잇는 세가다. ${sn}씨가 아닌 당신은 방계(외성 제자)로 들었다. 고급 무공은 한 단 높은 직위에서 받고, 마지막 초식은 직계만 받는다. ${rankName(sid,KIN.adoptRank)} 이상이 되면 공적을 바쳐 입적할 수 있다.`,'info')}
  else if(isMonk(sid))log(`${s.n}은 출가한 제자가 비전을 잇는다. 지금은 속가 제자다. ${rankName(sid,KIN.monkRank)} 이상이 되면 출가할 수 있다 (혼례를 올리지 못한다).`,'info')});
function kinWhy(sid,k){const r=rankIdx(sid),s=SECTS[sid];
  if(k==='adopt'){if(!isBlood(sid)||kinOk(sid))return '없음';if(r<KIN.adoptRank)return `${rankName(sid,KIN.adoptRank)} 이상`;if((P.merit[sid]||0)<KIN.adoptMerit)return `공적 ${KIN.adoptMerit} 필요`;return ''}
  if(!isMonk(sid)||kinOk(sid))return '없음';if(r<KIN.monkRank)return `${rankName(sid,KIN.monkRank)} 이상`;if(P.spouse)return '배우자가 있다';return ''}
function kinHtml(s){if(P.sect!==s.id||!(isBlood(s.id)||isMonk(s.id)))return '';const ok=kinOk(s.id),b=isBlood(s.id),w=kinWhy(s.id,b?'adopt':'monk');
  return `<div class="row2" id="kinrow"><span class="note">${s.n}의 <b class="${ok?'good':'gold'}">${kinName(s.id)}</b>. ${ok?(b?'가문의 비전을 끝까지 잇는다.':'출가한 몸이라 비전을 끝까지 잇는다. 혼례는 올리지 못한다.')
    :`고급 무공은 한 단 높은 직위에서 받고, 마지막 초식은 ${b?'직계':'출가 제자'}만 받는다.`}</span>${ok?'':B(b?'kadopt:'+s.id:'kmonk:'+s.id,w||(b?`입적 · 공적 ${KIN.adoptMerit}`:'출가하기'),{d:!!w,pri:!w})}</div>`}
hook('sectAct',c=>{
  if(c.a==='kadopt'){c.done=true;c.r=true;const sid=c.x,s=SECTS[sid];if(!s||P.sect!==sid||kinWhy(sid,'adopt'))return;P.merit[sid]-=KIN.adoptMerit;(P.kin=P.kin||{})[sid]=1;
    log(`${s.n}의 족보에 이름을 올렸다. 이제 직계로서 가문의 비전을 끝까지 이을 수 있다.`,'xp');showBanner('입적',`${s.n} 직계`);feat(`${s.n}에 입적해 직계가 되었다`)}
  if(c.a==='kmonk'){c.done=true;c.r=true;const sid=c.x,s=SECTS[sid];if(!s||P.sect!==sid||kinWhy(sid,'monk'))return;P.monk=sid;
    log(`머리를 깎고 ${s.n}의 출가 제자가 되었다. 비전을 끝까지 이을 수 있지만 혼례는 올리지 못한다.`,'xp');showBanner('출가',s.n);feat(`${s.n}에서 출가했다`)}});

// ---- 5·6 본산의 비석과 명소 ----
function loreSpotXY(fx,fy){const R=REGION(),cx=Math.floor(N*fx),cy=Math.floor(NH*fy);
  for(let r=0;r<14;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=cx+i,y=cy+j;
    if(x<2||y<2||x>N-3||y>NH-3||!walk(x,y))continue;if(nodes.some(n=>Math.hypot(n.x-x-.5,n.y-y-.5)<2.5))continue;
    if((R.gates||[]).some(g=>Math.hypot(g.x-x-.5,g.y-y-.5)<3))continue;return{x:x+.5,y:y+.5}}return null}
// 생마다 한 번 이번 생의 강호를 알린다
hook('tick',()=>{if(!P||!playing)return;const V=loreVer();if(!V.told){V.told=1;log(`이번 생의 강호: ${loreVerTxt()}`,'sys')}});
hook('regionLoaded',id=>{if(!P)return;
  const m=/^hq_(\w+)$/.exec(id),s=m&&SECTS[m[1]],L=s&&LSECT[s.id];if(!L)return;loreD().seen[s.id]=1;
  if(L.leg){const p=loreSpotXY(.36,.42);if(p)nodes.push({t:'stele',sect:s.id,...p,cd:0})}
  if(L.spot){const p=loreSpotXY(.66,.32);if(p)nodes.push({t:'spot',sect:s.id,...p,cd:0})}});
const loreP=()=>{P.lore=P.lore||{leg:{},spot:{}};return P.lore};
// interact(g_life.js)가 먼저 부른다. 처리했으면 true
function loreNode(n){const L=LSECT[n.sect];if(!L)return false;
  if(n.t==='stele'){P.chan={t:0,dur:1.2,label:`${L.leg.n}의 비석을 읽는다`,fn:()=>loreLeg(n)};return true}
  if(n.t==='spot'){P.chan={t:0,dur:2,label:`${L.spot.n}을(를) 둘러본다`,fn:()=>loreSpot(n)};return true}
  return false}
function loreLeg(n){const s=SECTS[n.sect],L=LSECT[n.sect];if(!s||!L)return;const g=loreD(),me=loreP(),first=!me.leg[s.id];g.leg[s.id]=1;me.leg[s.id]=1;
  if(first){P.fame+=LORE.legFame;log(`${s.n} 전대 고수 ${L.leg.n}(${L.leg.t})의 비석을 읽었다. 명성 +${LORE.legFame}`,'xp');
    const ids=s.arts.filter(a=>!a.hi&&ARTS[a.id]&&!(typeof allLearned==='function'&&allLearned(ARTS[a.id].id))).map(a=>a.id);
    if(ids.length&&typeof giveLeaf==='function')giveLeaf(pick(ids),1,`${L.leg.n}의 비석 밑`)}
  openPanel('npc',{id:'lore',sect:s.id,n:'무림록'})}
function loreSpot(n){const s=SECTS[n.sect],L=LSECT[n.sect];if(!s||!L)return;const g=loreD(),me=loreP();g.spot[s.id]=1;
  if(me.spot[s.id]){log(`${L.spot.n}. ${L.spot.d}`,'info');return}me.spot[s.id]=1;gainVit(LORE.spotVit);P.fame+=LORE.spotFame;
  log(`${s.n}의 명소 ${L.spot.n}을(를) 둘러보았다. ${L.spot.d} 활력 +${LORE.spotVit}, 명성 +${LORE.spotFame}`,'xp');showBanner('명소 유람',L.spot.n);feat(`${s.n}의 ${L.spot.n}을(를) 둘러보았다`)}
const SPOT_COL={sun:'255,214,120',mist:'225,232,240',snow:'235,245,255',sea:'130,200,240',pine:'130,210,140'};
function drawLoreNode(n){const p=toScreen(n.x,n.y),L=LSECT[n.sect],me=P.lore||{leg:{},spot:{}};ctx.save();ctx.translate(p.x,p.y);
  if(n.t==='stele'){const fresh=!me.leg[n.sect];ctx.fillStyle='#3a3836';ctx.fillRect(-11,-3,22,5);
    ctx.fillStyle='#6e6a64';ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(-8,-30);ctx.quadraticCurveTo(0,-36,8,-30);ctx.lineTo(8,-2);ctx.fill();
    ctx.fillStyle='#4a4743';for(let i=0;i<4;i++)ctx.fillRect(-4,-27+i*6,8,2);
    if(fresh){ctx.strokeStyle=`rgba(255,225,150,${.5+.4*Math.sin(time*3)})`;ctx.lineWidth=1.5;ctx.strokeRect(-10,-34,20,33)}}
  else{const c=SPOT_COL[L&&L.spot.fx]||SPOT_COL.sun,fresh=!me.spot[n.sect];
    for(let i=0;i<6;i++){const k=frac(time*.25+i/6),a=Math.sin(k*Math.PI)*.5;ctx.fillStyle=`rgba(${c},${a})`;ctx.beginPath();ctx.arc(Math.sin(i*2.1+time*.4)*16,-6-k*34,2+(L&&L.spot.fx==='mist'?4:1),0,7);ctx.fill()}
    ctx.fillStyle='#5a5650';ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-4,-18);ctx.lineTo(4,-18);ctx.lineTo(6,0);ctx.fill();ctx.fillStyle='#a83a2a';ctx.fillRect(-2,-16,4,12);
    if(fresh){ctx.strokeStyle=`rgba(${c},${.45+.35*Math.sin(time*3)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-2,16,8,0,0,7);ctx.stroke()}}
  if(L&&Math.hypot(n.x-P.x,n.y-P.y)<6){const t=n.t==='stele'?`${L.leg.n}의 비석`:`● ${L.spot.n}`;ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';
    ctx.fillStyle='#000';ctx.fillText(t,1,-41);ctx.fillStyle=n.t==='stele'?'#d8d0c0':'#f0d890';ctx.fillText(t,0,-42)}
  ctx.restore()}

// ---- 2 무공 이름 풀이 ----
function artMean(a){if(!a||!a.n)return '';if(LORE.mean[a.n])return LORE.mean[a.n];
  let rest=a.n;const sf=LORE.suffix.find(([k])=>rest.length>k.length&&rest.endsWith(k));if(sf)rest=rest.slice(0,-sf[0].length);
  const sn=Object.values(SECTS).find(s=>rest.startsWith(s.n.replace(/(파|사|세가|문|방)$/,''))&&s.n.length>1),parts=[];
  if(sn){const k=sn.n.replace(/(파|사|세가|문|방)$/,'');parts.push(`${k}(${sn.n})`);rest=rest.slice(k.length)}
  for(let i=0;i<rest.length;){let hit=null;for(let l=Math.min(4,rest.length-i);l>=1;l--){const k=rest.substr(i,l);if(LORE.gloss[k]){hit=k;break}}
    if(hit){parts.push(`${hit}(${LORE.gloss[hit]})`);i+=hit.length}else i++}
  if(sf)parts.push(`${sf[0]}(${sf[1]})`);return parts.length>=2?parts.join(' + '):''}
const artMeanHtml=a=>{const m=artMean(a);return m?`<p class="note lmean">이름 풀이: ${esc(m)}</p>`:''};

// ---- 7 음공: buildArts(g_data.js) 맨 끝에서 부른다. 그때는 이 파일의 const가 아직 없으니 GD만 읽는다 ----
function addLoreArts(arts,pool,ults,formName,ultName){const U=GD.LORE.um,s=SECTS[U.sect];if(!s||s.arts.some(a=>a.n===U.n))return;
  const id=`S_${s.id}_${s.arts.length}`,meta={id,n:U.n,cls:U.cls,el:U.el,hi:false,mid:false};s.arts.push(meta);
  const g=artGradeOf(s,meta),mul=GMUL[g],wave=f=>f.p==='circle'||f.p==='arc'||f.p==='pull'||f.p==='rain',src=[...pool[U.cls].filter(wave),...Object.keys(pool).filter(c=>c!==U.cls&&c!=='궁'&&c!=='암').flatMap(c=>pool[c].filter(wave))];   // 소리가 퍼지는 꼴만 (검에 모자라면 다른 근접 병기의 꼴을 빌린다)
  const forms=pickForms(src.length>=4?src:pool[U.cls],rng(913+s.i),4).map((f,i)=>({...f,n:formName(),req:REQ[i],cost:COST[i],bonus:BONUS[i],qp:GD.QSTAR.pct[i],m:f.m*(1+.06*i)*mul}));
  const u=ults[U.cls][s.i%ults[U.cls].length];
  arts[id]=artFx({id,side:ALLY[s.al].side,cls:U.cls,el:U.el,n:U.n,forms,sect:s.id,hi:false,grade:g,um:1,
    ult:{n:ultName(),steps:[F('','circle',{rad:3.2,m:GULT[g][0],stun:.4}),...u.steps.map(x=>({...x,m:(x.m||1)*GULT[g][1],delay:(x.delay||0)+.18}))]},
    d:`${s.n}(${GD.TIERN[s.tier]})의 ${AGR[g]} 일반 무공 · ${CLASS[U.cls].n} · 음공. 검이 호금처럼 울려 음파가 퍼진다. 맞은 적은 느려지고 이따금 넋을 놓는다. 초식 ${forms.length}개와 필살기.`})}
hook('hitDone',c=>{const a=c.X&&c.X.art;if(!a||!a.um||!c.e||c.X.bare)return;const U=LORE.um,e=c.e;fx.push({t:'ring',um:1,col:U.col,x:e.x,y:e.y,life:.45,max:.45});
  if(e.hp<=0)return;e.slow=Math.max(e.slow||0,U.slow);if(!e.d.boss&&Math.random()<U.stun){e.stun=Math.max(e.stun||0,.5);addText(e.x,e.y-.4,'음파','#a8f0c8')}});

// ---- 1 무림록 창 ----
const loreOpen=sid=>openPanel('npc',{id:'lore',sect:sid||null,n:'무림록'});
const loreIds=()=>Object.keys(LSECT).filter(id=>SECTS[id]);
function loreRow(id){const s=SECTS[id],L=LSECT[id],g=loreD(),mk=(v,t)=>`<small class="${v?'good':'dim'}">${v?'✓':'·'} ${t}</small>`;
  return `<div class="it"><div>${typeof embImg==='function'?embImg(id,18):''} ${s.n} <small class="dim">${tierName(s)}${G.gone&&G.gone[id]?' · 절멸':''}</small><span>${esc(L.place)}<br>${mk(g.seen[id],'본산')} ${mk(g.leg[id],'인물')} ${mk(g.spot[id],'명소')}</span></div><div class="ib">${B('lsect:'+id,'보기')}</div></div>`}
function loreCard(id){const s=SECTS[id],L=LSECT[id],g=loreD(),seen=g.seen[id],vn=loreVerNote(id),rel=relHtml(id);
  const arts=s.arts.filter(a=>ARTS[a.id]).map(a=>{const A2=ARTS[a.id],m=artMean(A2);return `<p class="note"><b style="color:rgb(${A2.ct})">${A2.n}</b> ${gradeTag(A2.grade||0)} ${m?esc(m):'<span class="dim">풀이가 전하지 않는다</span>'}</p>`}).join('');
  const kin=isBlood(id)?`핏줄로 잇는 세가다. ${LORE.blood[id]}씨가 들면 직계, 아니면 방계(외성 제자)로 받는다.`:isMonk(id)?'출가한 제자가 비전을 잇는다. 처음 들면 속가 제자다.':'';
  return `<div class="row2"><span class="note">${typeof embImg==='function'?embImg(id,26):''} <b>${s.n}</b> · ${ALLY[s.al].n} ${tierName(s)}</span>${B('lsect:','← 목록')}</div>
    <div class="card"><h4>자리</h4><p>${esc(L.place)}</p></div>
    <div class="card"><h4>분위기와 전승</h4>${seen?`<p>${esc(L.mood)}</p><p>${esc(L.line)}</p>`:`<p class="dim">본산에 가 보면 채워진다.</p>`}${kin?`<p class="note">${kin}</p>`:''}</div>
    <div class="card"><h4>대표 인물</h4>${g.leg[id]?`<p><b class="gold">${esc(L.leg.n)}</b> <small>${esc(L.leg.t)}</small></p><p>${esc(L.leg.s)}</p>`:`<p class="dim">??? · 본산의 비석을 읽으면 실린다.</p>`}</div>
    <div class="card"><h4>명소</h4>${g.spot[id]?`<p><b>${esc(L.spot.n)}</b> ${esc(L.spot.d)}</p>`:`<p class="dim">??? · 본산의 명소를 둘러보면 실린다.</p>`}</div>
    <div class="card"><h4>무공 이름 풀이</h4>${seen?arts:'<p class="dim">본산에 가 보면 채워진다.</p>'}</div>
    ${rel?`<div class="card"><h4>앙숙과 동맹</h4><p class="note">${rel}</p></div>`:''}
    <div class="card"><h4>작품마다 다른 설정</h4><p class="note">${esc(L.note)}</p>${vn?`<p class="note gold">${vn}</p>`:''}</div>`}
function loreHtml(sid){if(sid&&LSECT[sid]&&SECTS[sid])return loreCard(sid);const g=loreD(),ids=loreIds(),n=k=>ids.filter(id=>g[k][id]).length;
  return `<p class="note">구파일방과 오대세가, 그 밖의 이름난 문파의 자리·분위기·전승·인물·명소. 본산을 찾아가 비석을 읽고 명소를 둘러보면 채워진다. 지난 생에 채운 것도 남는다.</p>
    <div class="card"><h4>이번 생의 강호</h4><p class="note">${loreVerTxt()}</p></div>
    <p class="note">본산 ${n('seen')}/${ids.length} · 인물 ${n('leg')}/${ids.length} · 명소 ${n('spot')}/${ids.length}</p><div class="list">${ids.map(loreRow).join('')}</div>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.id==='lore')c.html=loreHtml(c.n.sect)});
hook('sectAct',c=>{if(c.a==='lore'){c.done=true;c.r=true;loreOpen(c.x);return}
  if(c.a==='lsect'){c.done=true;c.r=true;loreOpen(c.x)}});
// 문파 창(sectDetail)에 붙는 칸: 이번 생의 자리, 앙숙·동맹, 직계·방계, 무림록 단추
function loreSectHtml(s){const vn=LSECT[s.id]?loreVerNote(s.id):'',rel=relHtml(s.id);
  return `${kinHtml(s)}${vn||rel?`<p class="note">${vn?`<span class="gold">${vn}</span>${rel?'<br>':''}`:''}${rel}</p>`:''}${LSECT[s.id]?`<div class="row2"><span class="note">${s.n}의 자리·전승·인물·명소</span>${B('lore:'+s.id,'무림록')}</div>`:''}`}
// 강호사 창 맨 위에 무림록 단추
{const ph=pHist;pHist=function(){return `<div class="row2"><span class="note">구파일방과 오대세가의 도감</span>${B('lore','무림록')}</div>`+ph()}}
var LORE_ON=1;   // isFive(g_sect.js)가 이 파일이 읽힌 뒤에만 loreFive를 쓴다 (buildArts 때는 원래 FIVE)

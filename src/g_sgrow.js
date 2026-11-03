// ================= 문파 증축 (v239, 사용자 2026-11-03) =================
// "문파의 규모가 커지면 맵 구성이 커지게" + "인원을 충족해도 문파의 최고 등급 무공이 그 규모에 맞아야":
// - 소문파 → 중견: 인원 SGROW.need.mid.pop 이상 + 절정(SGROW.jeol) 이상 무공 n개. 중견 → 대문파: 인원 300 + 절정 무공 2개.
//   조건을 채운 해에 증축을 시작하고(G.sbuild[sid]={t,y}) SGROW.build 해 뒤 맵이 커진다(G.slt[sid]=규모).
// - 절정 무공을 얻는 길: 기재가 화경에 올라 창안(g_hugi.js), 문도가 장경각에 절정 비급을 바침(여기 sgdon, G.sbDon). 무공 등급은 저절로 오르지 않는다.
// - 맵: 소문파 → 중견이면 산문 맵이 생기고 본산이 중견 틀(g_sectmap), 중견 → 대문파면 외원·후산이 생기고 대문파 틀.
//   s.lt = 지금 맵 규모(없으면 s.tier). 무공 등급(sectGrade)·기준 인원(popBase)은 s.tier 그대로, 인원 상한만 s.lt 기준(popCap, g_pop).
// - 다른 저장을 불러오면 처음 모습(SG_SNAP, 이 파일이 읽힐 때 찍어 둔 것)으로 되돌린 뒤 그 저장의 규모까지 다시 키운다.
//   주인공이 그 문파 맵 안에 있으면 밖으로 나올 때까지 미룬다 (불러올 때는 바로).
const SGROW=GD.SGROW,SG_TN={small:'소문파',mid:'중견 문파',big:'대문파'},SG_ORD=['small','mid','big'];
const sgOwn=(s,k)=>{const h=hqId(s);return k===h||k.startsWith(h+'_')||k.startsWith('in_'+h+'_')};
const sgCan=s=>!!s&&(s.tier==='small'||s.tier==='mid')&&!SMAP.skip.includes(s.id)&&!!HQ_THEME[s.id]&&!!REGIONS[hqId(s)];
const SG_LIST=Object.values(SECTS).filter(sgCan);
// 절정 이상 무공 수 (본래 무공·기증·창안·바친 비급 모두)
const jeolN=s=>new Set(s.arts.filter(q=>artGrade(q.id)>=SGROW.jeol).map(q=>q.id)).size;
const sgTier=s=>(G.slt&&G.slt[s.id])||s.tier;
// ---- 처음 모습 찍어 두기 / 되돌리기 ----
const SG_SNAP={};
// 출입구는 그 객체 그대로 두고 값만 (tx 같은 getter 가 있는 출입구가 있다)
const sgData=o=>{const d={};for(const[k,v]of Object.entries(Object.getOwnPropertyDescriptors(o)))if('value' in v&&v.writable)d[k]=v.value;return d};
const sgPut=(o,d)=>{for(const k of Object.keys(o)){const v=Object.getOwnPropertyDescriptor(o,k);if('value' in v&&v.writable&&!(k in d))delete o[k]}Object.assign(o,d)};
function sgSnap(s){const regs={};
  for(const k of Object.keys(REGIONS)){if(!sgOwn(s,k))continue;const R=REGIONS[k],n=R.npcs||[];
    regs[k]={R,p:{...R},gates:(R.gates||[]).map(g=>[g,sgData(g)]),npcs:n.slice(),pos:n.concat(R.hall&&R.hall.npcs||[]).map(q=>[q,q.x,q.y]),stage:R.stage?{...R.stage}:null,
      hall:R.hall?{...R.hall}:null,hn:R.hall&&R.hall.npcs?R.hall.npcs.slice():null,same:!!(R.hall&&R.hall.npcs===R.npcs),tower:R.tower?{...R.tower}:null}}
  const ext=[];for(const[k,R]of Object.entries(REGIONS)){if(regs[k])continue;for(const g of R.gates||[])if(regs[g.to])ext.push([g,sgData(g)])}
  SG_SNAP[s.id]={regs,ext,towers:TOWERS.filter(t=>regs[t])}}
for(const s of SG_LIST)sgSnap(s);
function sgRestore(s){const S=SG_SNAP[s.id];if(!S)return;
  for(const k of Object.keys(REGIONS))if(sgOwn(s,k)&&!S.regs[k])delete REGIONS[k];
  for(const[k,o]of Object.entries(S.regs)){const R=o.R;for(const q of Object.keys(R))delete R[q];Object.assign(R,o.p);R.gates=o.gates.map(([g,d])=>(sgPut(g,d),g));R.npcs=o.npcs.slice();
    if(o.stage)Object.assign(R.stage,o.stage);if(o.hall){Object.assign(R.hall,o.hall);R.hall.npcs=o.same?R.npcs:o.hn.slice()}if(o.tower)Object.assign(R.tower,o.tower);
    for(const[q,x,y]of o.pos){q.x=x;q.y=y}REGIONS[k]=R}
  for(const[g,d]of S.ext)sgPut(g,d);
  for(let i=TOWERS.length-1;i>=0;i--)if(sgOwn(s,TOWERS[i]))TOWERS.splice(i,1);TOWERS.push(...S.towers);
  delete s.lt}
// ---- 맵 잇기: g_stage linkChain 과 같되 바깥 길(성 지도·산 맵 lm_·개봉)을 첫 맵으로 옮긴다 ----
function sgLink(s,ids){const master=hqId(s),M=REGIONS[master],out=M.gates.find(g=>/^(pv_|lm_|gaebong)/.test(g.to));
  if(ids[0]!==master&&out){const O=REGIONS[out.to];if(O)for(const g of O.gates||[])if(g.to===master){g.to=ids[0];g.tx=20.5;g.ty=36.2}
    M.gates=M.gates.filter(g=>g!==out);REGIONS[ids[0]].gates.push({...out,x:20.5,y:38.6})}
  for(let i=1;i<ids.length;i++){const a=REGIONS[ids[i-1]],b=REGIONS[ids[i]],tx=stTopX(ids[i-1])+.5;
    a.gates.push({x:tx,y:1.2,to:ids[i],tx:20.5,ty:36.2,label:b.name,need:b.stage&&b.stage.need});b.gates.push({x:20.5,y:38.6,to:ids[i-1],tx,ty:3.6,label:a.name})}
  for(const id of ids)REGIONS[id].chain=ids}
// 한 단계 키운다 (소→중, 중→대)
function sgGrow(s,to){const[th,place]=HQ_THEME[s.id],i=Object.values(SECTS).indexOf(s),hq=hqId(s),gid=`hq_${s.id}_gate`;
  if(to==='mid'){if(!REGIONS[gid]){const g=stageRegion(stGate(s,th,place,i));sgLink(s,[g.stage.id,hq])}}
  else if(to==='big'){if(!REGIONS[gid])sgGrow(s,'mid');const o=stageRegion(stOuter(s,th,place,i)),b=stageRegion(stBack(s,th,place,i)),G1=REGIONS[gid],M=REGIONS[hq];
    G1.gates=G1.gates.filter(g=>g.to!==hq);M.gates=M.gates.filter(g=>g.to!==gid);sgLink(s,[gid,o.stage.id,hq,b.stage.id])}
  s.lt=to;smBuild(s);runHooks('sectGrown',s,to)}
// 지금 G 에 맞춘다. now: 불러올 때(주인공 자리와 상관없이)
function sgSync(now){const want=G.slt||{};
  for(const s of SG_LIST){const w=want[s.id]||null,cur=s.lt||null;if(w===cur)continue;if(!now&&P&&REG&&sgOwn(s,REG))continue;
    sgRestore(s);const k=SG_ORD.indexOf(w);for(let t=SG_ORD.indexOf(s.tier)+1;w&&t<=k;t++)sgGrow(s,SG_ORD[t])}}
// ---- 해마다: 증축 조건 ----
function sgNeed(s){const nx=SGROW.next[sgTier(s)];if(!nx)return null;const nd=SGROW.need[nx];return{t:nx,pop:nd.pop,n:nd.n,okPop:sectPop(s.id)>=nd.pop,okArt:jeolN(s)>=nd.n}}
hook('newYear',()=>{const y=Math.floor(G.cal);G.sbuild=G.sbuild||{};
  for(const s of SG_LIST){if(!(sectPop(s.id)>0)||sectGone(s.id)){delete G.sbuild[s.id];continue}const nd=sgNeed(s);if(!nd)continue;const b=G.sbuild[s.id];
    if(!(nd.okPop&&nd.okArt)){if(b){delete G.sbuild[s.id];log(`${s.n}의 본산 증축이 멈췄다.`,'info')}continue}
    if(!b){G.sbuild[s.id]={t:nd.t,y};log(`${s.n}이(가) 본산 증축을 시작했다. ${SGROW.build}년 뒤 ${SG_TN[nd.t]}의 규모가 된다.`,'info');continue}
    if(y-b.y>=SGROW.build){(G.slt=G.slt||{})[s.id]=b.t;delete G.sbuild[s.id];log(`${s.n}의 증축이 끝났다. 이제 ${SG_TN[b.t]} 규모의 본산이다${b.t==='mid'?' (산문이 서고 장문전이 2층)':' (외원·후산이 열리고 장문전이 3층)'}.`,'xp');showBanner(`${s.n} 증축`,`${SG_TN[b.t]} 규모`)}}
  sgSync()});
hook('regionLoaded',()=>{sgDonSync();if(G.slt||SG_LIST.some(s=>s.lt))sgSync()});
// ---- 장경각에 절정 비급 바치기 (문도만, 바로 문파 무공이 된다) ----
const sgBooks=s=>P.bag.filter(it=>(it.slot==='book'||it.slot==='wbook')&&ARTS[it.art]&&!ARTS[it.art].gy&&artGrade(it.art)>=SGROW.jeol&&!s.arts.some(q=>q.id===it.art));
function sgDonSync(){const D=G.sbDon||{};for(const s of Object.values(SECTS)){s.arts=s.arts.filter(q=>!q.dn);for(const id of D[s.id]||[]){const a=ARTS[id];if(a&&!s.arts.some(q=>q.id===id))s.arts.push({id,n:a.n,cls:a.cls,el:a.el,hi:false,dn:1})}}}
hook('gLoaded',()=>{sgDonSync();sgSync(true)});
function sgGrowHtml(s){const nd=sgNeed(s);if(!nd)return'';const b=G.sbuild&&G.sbuild[s.id];
  return `<p class="note">${b?`<b class="gold">증축 중</b> · ${b.y+SGROW.build}년에 ${SG_TN[b.t]} 규모`:`${SG_TN[nd.t]}로 커지려면: 인원 ${Math.round(sectPop(s.id))}/${nd.pop}${nd.okPop?' ✓':''} · 절정 무공 ${jeolN(s)}/${nd.n}${nd.okArt?' ✓':''}`}</p>`}
function sgDonHtml(s){if(P.sect!==s.id)return'';const L=sgBooks(s);
  const rows=L.map(it=>{const a=ARTS[it.art];return `<div class="it"><div>${a.n} ${gradeTag(a.grade)}<span>바치면 ${s.n}의 무공으로 기록된다 · 공적 +${SGROW.donMerit}</span></div><div class="ib">${B('sgdon:'+it.id,'바치기',{pri:1})}</div></div>`});
  return `<div class="card"><h4>절정 비급 바치기</h4>${sgGrowHtml(s)}${rows.length?`<div class="list">${rows.join('')}</div>`:'<p class="note dim">행낭에 이 문파에 없는 절정 이상 비급이 없다.</p>'}</div>`}
hook('npcDlg',c=>{const n=c.n;if(c.html==null)return;const sid=n.srole==='lib3'?n.ssid:n.steward&&!smOn(SECTS[n.steward])?n.steward:null,s=sid&&SECTS[sid];if(s&&P.sect===s.id&&sgCan(s))c.html+=sgDonHtml(s)});
hook('sectAct',c=>{if(c.a!=='sgdon')return;c.done=true;c.r=true;const s=SECTS[P.sect];if(!s)return;const it=sgBooks(s).find(i=>i.id===+c.x);if(!it)return;const a=ARTS[it.art];
  P.bag.splice(P.bag.indexOf(it),1);((G.sbDon=G.sbDon||{})[s.id]=G.sbDon[s.id]||[]).push(a.id);sgDonSync();const m=addMerit(s.id,SGROW.donMerit);P.fame+=SGROW.donFame;
  log(`${s.n} 장경각에 [${a.n}]의 비급을 바쳤다. 이제 ${s.n}의 무공으로 전한다. 공적 +${m}, 명성 +${SGROW.donFame}.`,'xp');feat(`${s.n}에 ${a.n} 비급을 바쳤다`);
  const nd=sgNeed(s);if(nd&&nd.okArt)log(nd.okPop?`${s.n}이(가) 해가 바뀌면 증축을 시작한다.`:`${s.n}의 무공은 ${SG_TN[nd.t]}에 걸맞다. 인원이 ${nd.pop}명이 되면 증축한다.`,'info')});

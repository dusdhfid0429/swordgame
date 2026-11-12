// ================= v248 성장 상한 · 화두 · 생활 활력 (사용자 2026-11-11) =================
// "경지가 막히면 내공 및 기본기의 성장을 못하게 막는다. 활력은 생활 숙련을 올리는 데 쓴다. 경지 돌파는 지금처럼 되면 안 된다."
// 1) 상한: 기본기 합(외공)과 내공은 다음 경지 문턱까지만 수련으로 오른다. 네 기본기마다 문턱의 min(22%)이 최소치, 나머지는 자유 몫. 넘친 옛 저장은 깎지 않고 더 오르지만 않는다.
// 2) 화두: 벽에 닿으면 화두 n개가 열린다. need개를 풀면 폐관이 반드시 성공한다. 덜 풀면 푼 비율이 성공률. 폐관에 활력은 들지 않는다 (g_realm.js pgChance·pgWhy).
// 3) 생활: 제작·씨뿌리기가 활력을 쓴다 (g_life.js craft·plotAction). 수치 data/hwadu.json
const HW=GD.HWADU;
// ---- 상한 ----
const capOf=k=>{const r=realmIdx()+1,a=REALM_NEED[k];return r<a.length?a[r]:Math.round(a[a.length-1]*HW.cap.top)};
// v248b (사용자 2026-11-11 "경지별 최소 기본기를 두고 나머지를 커스텀하게"): 네 기본기마다 다음 경지 문턱의 min(22%)이 최소치. 나머지(12%)는 자유 몫.
// 다른 기본기의 최소치를 채울 몫이 모자라게 되는 수련은 막는다 → 문턱에 닿았을 때 네 기본기가 모두 최소치를 넘는다
const statMin=()=>Math.floor(capOf('oe')*HW.cap.min);
const statNeed=k=>STATS.reduce((a,s)=>a+(s.k===k?0:Math.max(0,statMin()-P.st[s.k])),0);   // k 말고 다른 기본기들이 최소치까지 모자란 합
const statCap1=()=>capOf('oe')-3*statMin();   // 한 기본기에 다 몰았을 때의 끝
// 수련할 수 없는 까닭 ('' 이면 된다). k = str/end/agi/qi 또는 'ne'(내공)
function capWhy(k){if(!P)return'';
  if(k==='ne'||k==='neigong')return baseQi()>=capOf('ne')?'벽에 막혔다':'';
  if(pillarVal('oe')>=capOf('oe'))return'벽에 막혔다';
  if(P.st[k]>=statMin()&&capOf('oe')-pillarVal('oe')-1<statNeed(k))return'다른 기본기가 모자라다';return''}
// ---- 화두 ----
const hwDef=id=>HW.pool.find(h=>h.id===id);
const hwGoal=(h,r)=>h.base+Math.floor(r/(h.every||1))*(h.step||0);
function hwRoll(){const r=realmIdx()+1,ok=HW.pool.filter(h=>h.id!=='mast'||Object.keys(P.arts).some(id=>A(id).p<100)),l=[];
  const bag=ok.slice();while(l.length<HW.n&&bag.length){const h=bag.splice(Math.floor(Math.random()*bag.length),1)[0];l.push({id:h.id,c:0,g:hwGoal(h,r)})}
  l.sort((a,b)=>HW.pool.indexOf(hwDef(a.id))-HW.pool.indexOf(hwDef(b.id)));return{r:realmIdx(),l}}
// 벽에 닿아 있으면 그 경지의 화두를 돌려준다 (없으면 그때 연다)
function hwGet(){if(!P||typeof atWall!=='function'||!atWall())return null;
  if(!P.hw||P.hw.r!==realmIdx()){P.hw=hwRoll();log(`벽 앞에 화두가 놓였다: ${P.hw.l.map(x=>hwDef(x.id).n).join(' · ')}. 셋을 풀면 벽이 열린다.`,'xp')}return P.hw}
const hwDone=()=>{const h=hwGet();return h?h.l.filter(x=>x.c>=x.g).length:0};
const hwRate=()=>Math.min(1,hwDone()/HW.need);
function hwAdd(id,v=1){const h=hwGet();if(!h)return;const x=h.l.find(q=>q.id===id);if(!x||x.c>=x.g)return;const was=hwDone();
  x.c=Math.min(x.g,x.c+v);if(x.c<x.g)return;const d=hwDef(id),n=hwDone();
  log(`화두 [${d.n}]을(를) 풀었다. 깨달음 ${Math.min(n,HW.need)}/${HW.need}`,'xp');addText(P.x,P.y-.7,`화두 · ${d.n}`,'#e8d08a');
  if(was<HW.need&&n>=HW.need){showBanner('깨달음이 차다',`${rk(realmIdx()+1)}의 벽이 열린다`);log('깨달음이 찼다. 이제 폐관에 들면 반드시 벽을 깬다.','xp')}
  if(typeof questTrack==='function')questTrack();if(typeof renderTrain==='function')renderTrain()}
hook('duelWon',()=>hwAdd('duel'));
hook('kill',e=>{if(e.duel||!e.d||e.d.villager||e.d.passive||e.d.beast&&e.realm==null)return;const r=mobRealm(e),me=realmIdx();
  if(r>me)hwAdd('over');if(r>=me&&(e.d.boss||e.d.elite||e.master||MOB_TIER[e.kind]==='e'))hwAdd('elite',e.d.boss||e.master?5:1)});
hook('peakSat',()=>hwAdd('peak'));
hook('mastDone',({s,before})=>{const t=p=>p>=100?4:tierOf(p);if(t(s.p)!==t(before))hwAdd('mast')});
hook('giyeonDone',()=>hwAdd('giyeon'));
hook('questDone',()=>hwAdd('quest'));
hook('lifeDone',()=>hwAdd('life'));
// ---- 화면 ----
function hwListHtml(){const h=hwGet();if(!h)return'';const n=hwDone();
  return `<div class="card"><div class="row2"><h4>화두</h4><span class="num tag ${n>=HW.need?'good':''}">깨달음 ${Math.min(n,HW.need)}/${HW.need}</span></div>
    <p class="note">${n>=HW.need?'깨달음이 찼다. 폐관에 들면 반드시 벽을 깬다.':`여섯 가운데 셋을 풀면 폐관이 반드시 성공한다. 덜 풀고 들면 주화입마를 무릅쓴다.`}</p>
    <div class="list">${h.l.map(x=>{const d=hwDef(x.id),ok=x.c>=x.g;return `<div class="it"><div>${ok?'<b class="good">'+d.n+'</b>':d.n}<span>${d.d}</span></div><div class="ib"><b class="num ${ok?'good':'gold'}">${ok?'풀었다':x.c+'/'+x.g}</b></div></div>`}).join('')}</div></div>`}
function hwTrackHtml(){if(!P||!P.hw||P.hw.r!==realmIdx()||!atWall())return'';const h=P.hw,n=h.l.filter(x=>x.c>=x.g).length;
  if(n>=HW.need)return `<h5>화두</h5><div class="sq done">깨달음이 찼다 · 폐관하러</div>`;
  const nx=h.l.filter(x=>x.c<x.g).slice(0,2).map(x=>`${hwDef(x.id).n} <b>${x.c}/${x.g}</b>`).join(' · ');
  return `<h5>화두 <small>${n}/${HW.need}</small></h5><div class="sq">${nx}</div>`}
// 시험·점검용: 화두 need개를 푼 것으로 친다
function hwFill(n=HW.need){const h=hwGet();if(!h)return 0;for(const x of h.l){if(n<=0)break;if(x.c<x.g){x.c=x.g;n--}else n--}return hwDone()}

// ---- 문파를 키운다: 문도 지도 · 저술 (사용자 2026-11-11 "저술이나 가르치기 괜찮은데? 후계보단 문파의 성장 측면으로") ----
// 벽에 막혀 남는 활력을 내 힘이 아니라 문파에 쓴다. 공적으로 바꾸지 않는다(사용자). 수치 HWADU.sect
const HWS=HW.sect;
const jsOf=sid=>(G.sjs&&G.sjs[sid])||{};
const jsArts=s=>learnedArts().filter(id=>{const a=ARTS[id];return a&&!a.base&&!a.gy&&A(id).p>=HWS.write.mast&&!jsOf(s.id)[id]});
function teachWhy(s){const T=HWS.teach;if(P.sect!==s.id)return'문도만';if(rankIdx(s.id)<T.rank)return`${rankName(s.id,T.rank)}부터`;if(realmIdx()<T.realm)return`${rk(T.realm)}부터`;
  if(typeof inOwnSect==='function'&&!inOwnSect())return'본산에서';if(inCombat())return'싸움 중';if(P.vit<T.vit)return`활력 ${T.vit} 필요`;return''}
function sectTeach(s){if(teachWhy(s))return;const T=HWS.teach;P.vit-=T.vit;const was=sectPop(s.id),cap=popCap(s),to=Math.min(cap,was+T.pop);if(to>was)popSet(s.id,to,'teach');
  const up=(G.hugi||[]).filter(h=>h.sid===s.id&&!h.dead&&h.rk<realmIdx()&&hugiRoll(h,'teach'));
  for(const h of up)h.tch={l:P.lifeNo,n:P.name};   // v256 가르친 제자는 다음 생의 흔적이 된다 (g_past.js)
  log(`${s.n}의 문도들을 모아 가르쳤다. ${to>was?`문파 인원 +${Math.round((to-was)*10)/10}`:'문파가 이미 가득 찼다'}${up.length?` · ${up.map(h=>h.n).join('·')}이(가) 한 단계 올라섰다`:''}.`,'xp');
  runHooks('lifeDone','teach');renderOpen()}
function sectWrite(s,id){const a=ARTS[id],W=HWS.write;if(!a||P.sect!==s.id||!jsArts(s).includes(id))return;const g=artGrade(id),c=W.vit[g]??W.vit[W.vit.length-1];
  if(P.vit<c){log(`저술할 활력이 부족합니다. (필요 ${c})`,'info');return}P.vit-=c;((G.sjs=G.sjs||{})[s.id]=G.sjs[s.id]||{})[id]=1;(P.sjsMine=P.sjsMine||[]).push([s.id,id]);   /* v256 이번 생에 쓴 요결 (g_past.js) */
  const was=sectPop(s.id),to=Math.min(popCap(s),was+W.pop[g]);if(to>was)popSet(s.id,to,'write');P.fame+=W.fame[g];
  log(`[${a.n}]의 요결을 책으로 엮어 ${s.n} 장경각에 올렸다. 배우러 오는 이가 늘어 문파 인원 +${Math.round((to-was)*10)/10}, 명성 +${W.fame[g]}.`,'xp');feat(`${a.n}의 요결을 저술해 ${s.n}에 남겼다`);
  runHooks('lifeDone','write');renderOpen()}
hook('hugiMul',c=>{const n=Object.keys(jsOf(c.h.sid)).length;if(n)c.mul*=Math.min(HWS.write.hugiMax,1+HWS.write.hugi*n)});
function sectGrowCard(s){if(!P||P.sect!==s.id)return'';const T=HWS.teach,tw=teachWhy(s),L=jsArts(s),n=Object.keys(jsOf(s.id)).length;
  const rows=L.map(id=>{const a=ARTS[id],g=artGrade(id),c=HWS.write.vit[g];return `<div class="it"><div>${a.n} ${gradeTag(g)}<span>요결을 써서 장경각에 올린다 · 인원 +${HWS.write.pop[g]}</span></div><div class="ib">${B('hwwrite:'+id,`저술 · 활력 ${c}`,{d:P.vit<c})}</div></div>`}).join('');
  return `<div class="card"><div class="row2"><h4>문파를 키운다</h4><span class="num tag">인원 ${Math.round(sectPop(s.id))}/${Math.round(popCap(s))}</span></div>
    <p class="note">활력을 내 몸이 아니라 문파에 쓴다. 내 힘은 그대로이고 문파가 자란다.${n?` 내가 남긴 저술 ${n}권.`:''}</p>
    <div class="list"><div class="it"><div>문도 지도<span>문도를 모아 가르친다 · 인원 +${T.pop}, 문파의 후기지수가 배운다</span></div><div class="ib">${B('hwteach',tw||`가르치기 · 활력 ${T.vit}`,{d:!!tw})}</div></div>${rows}</div>
    ${L.length?'':`<p class="note dim">숙련 ${HWS.write.mast} 이상으로 익힌 무공이 있으면 저술할 수 있다.</p>`}</div>`}
hook('sectAct',c=>{if(c.a!=='hwteach'&&c.a!=='hwwrite')return;c.done=true;c.r=true;const s=SECTS[P.sect];if(!s)return;if(c.a==='hwteach')sectTeach(s);else sectWrite(s,c.x)});

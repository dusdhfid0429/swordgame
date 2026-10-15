// ================= 문파 인원 (사용자 구상 2026-10-13) =================
// 문파의 세력은 인원 수(G.pop[문파])다. 해마다 늘고(보유 무학이 많을수록, 마교는 더 빨리), 무인이 죽으면 준다
// (플레이어가 죽이면 1명, 무인끼리 죽으면 0.2명, 결전에서 진 편은 8%, 대전에서 진 편은 10%).
// 세력의 힘(G.W.pow)은 그 세력 문파들의 인원×경지에서 계산하고, 무인의 직위(경지) 분포는 문파의 무학과 인원을 따른다.
// 인원이 줄면 본산 맵이 닫힌다(황폐): 기준 인원의 50% 밑이면 가장 깊은 맵부터, 0이면 멸문. 설계: docs/스토리_설계.md
const POP=STORY.POP;
const popBase=s=>POP.base[s.id]||POP.base[s.tier]||60;
function popInit(){if(!G.mdead)G.mdead={};if(G.pop){if(!G.popPrev)G.popPrev=JSON.parse(JSON.stringify(G.pop));return}G.pop={};for(const s of Object.values(SECTS))G.pop[s.id]=popBase(s);G.popPrev=JSON.parse(JSON.stringify(G.pop))}   // popPrev: 올해 첫날 인원. 첫해에도 '사망이 추가보다 많다'를 셀 수 있게 처음부터 둔다
const sectPop=sid=>{popInit();return G.pop[sid]||0};
// 무학의 질: 고급 무공 수와 무공 수. 0~1
const sectQ=s=>Math.min(1,(s.arts.filter(a=>a.hi).length*.4+s.arts.length*.1+(s.tier==='big'||s.tier==='one'?.2:s.tier==='mid'?.1:0)));
// 세력의 힘 = 초기값 × (지금 인원×질 합) / (기준 인원×질 합)
function facStrength(f,base){let v=0;for(const s of Object.values(SECTS))if(alFac(s.al)===f)v+=(base?popBase(s):sectPop(s.id))*(1+sectQ(s));return v}
function popSync(){popInit();const w=G.W;if(!w)return;for(const f of FAC4){const b=facStrength(f,true);w.pow[f]=b?clamp(Math.round(STORY.INIT.pow[f]*facStrength(f)/b*10)/10,0,100):0}}
// 한 세력의 문파 인원을 비율로 늘리거나 줄인다 (사건·전쟁의 효과)
function popScale(f,m){popInit();for(const s of Object.values(SECTS))if(alFac(s.al)===f)G.pop[s.id]=Math.max(0,Math.round(G.pop[s.id]*m*10)/10);popSync()}
function popLose(sid,n,why){popInit();if(!SECTS[sid]||!(G.pop[sid]>0))return;const was=G.pop[sid];G.pop[sid]=Math.max(0,Math.round((was-n)*10)/10);popSync();
  if(was>0&&G.pop[sid]<=0){log(`${SECTS[sid].n}이(가) 멸문했다${why?` (${why})`:''}. 본산은 폐허가 된다.`,'dmg');if(P)P.feats.push(`${Math.floor(P.age)}세에 ${SECTS[sid].n}이(가) 멸문하는 것을 보았다`)}
  else{const b=popBase(SECTS[sid]);if(Math.floor(was/b*10)!==Math.floor(G.pop[sid]/b*10))log(`${SECTS[sid].n} 인원 ${Math.round(G.pop[sid])}명 (기준의 ${Math.round(G.pop[sid]/b*100)}%).`,'info')}}   // v112: 10%씩 줄 때마다 알린다
// 해마다: 자연 증가. 봉문 중이면 수련만 하니 더 늘고, 점령당했으면 늘지 않는다. 멸문(0)은 되살아나지 않는다
hook('newYear',()=>{popInit();G.popPrev=JSON.parse(JSON.stringify(G.pop));
  for(const s of Object.values(SECTS)){const p=G.pop[s.id];if(!(p>0))continue;if(G.occ&&G.occ[s.id])continue;if(G.mdead&&G.mdead[s.id])continue;   // v112: 장문인이 죽어 있으면 제자를 받지 못한다
    let r=(s.tier==='one'?POP.growMagyo:POP.grow)+POP.growHi*s.arts.filter(a=>a.hi).length;if(G.seal&&G.seal[s.id])r*=POP.sealMul;
    G.pop[s.id]=Math.min(popBase(s)*POP.max,Math.round((p+Math.max(1,p*r))*10)/10)}
  popSync()});
// v112 (사용자: 장문인을 죽인 뒤 아무리 베어도 멸문이 안 된다): 직위가 높을수록 크게 줄고(killRank), 본산 안에서 베면 두 배(hqMul)
const killLoss=e=>{const t=POP.killRank||[POP.kill],n=t[Math.min(t.length-1,Math.max(0,e.rank||0))]||POP.kill,R=REG&&REGIONS[REG];return n*(R&&R.hq===e.sect?POP.hqMul||1:1)};
hook('kill',e=>{if(e.sect&&e.d&&e.d.fac)popLose(e.sect,killLoss(e),'')});
hook('mobKilled',t=>{if(t.sect&&t.d&&t.d.fac)popLose(t.sect,POP.npcKill,'')});
hook('gLoaded',()=>{popInit();popSync()});
// 결전·대전에서 진 편
function popWarLoss(facs,rate){popInit();for(const s of Object.values(SECTS))if(facs.includes(alFac(s.al))&&G.pop[s.id]>0)G.pop[s.id]=Math.round(G.pop[s.id]*(1-rate)*10)/10;popSync()}
// ---- 무인의 직위(=경지) 분포: 질이 높을수록 윗직위가 많고, 인원이 바닥나면 고수가 드물다 ----
function popRank(s,elite){const q=Math.max(0,sectQ(s)-(G.mdead&&G.mdead[s.id]?.3:0)),f=Math.min(1,sectPop(s.id)/popBase(s)),r=Math.random();
  if(!elite)return r<.3+.3*q?1:0;
  const p4=f>.6?.05+.15*q:0,p3=.25+.35*q*f;return r<p4?4:r<p4+p3?3:2}
// ---- 본산 맵: 인원이 줄면 깊은 맵부터 닫힌다 ----
const liveMaps=s=>{const n=(REGIONS[hqId(s)]||{}).chain?REGIONS[hqId(s)].chain.length:1,f=sectPop(s.id)/popBase(s);if(f<=0)return 0;for(const[th,k]of POP.live)if(f>=th)return Math.max(1,Math.ceil(n*k));return 1};
// 닫히는 순서: 장문인 맵 뒤쪽(깊은 곳)부터, 그다음 앞쪽(입구 쪽)부터
function closedMaps(s){const M=REGIONS[hqId(s)];if(!M||!M.chain)return sectPop(s.id)<=0?[hqId(s)]:[];const ch=M.chain,i=ch.indexOf(hqId(s)),live=liveMaps(s);if(live>=ch.length)return[];
  const order=[...ch.slice(i+1).reverse(),...ch.slice(0,i),hqId(s)];return order.slice(0,ch.length-live)};
const mapClosed=id=>{const R=REGIONS[id];if(!R||!R.hq||!SECTS[R.hq])return false;return closedMaps(SECTS[R.hq]).includes(id)};
// 출입구: 닫힌 맵으로는 못 들어간다 (linkChain이 단 need 앞에 끼운다). 멸문(인원 0)이면 폐허로 들어간다 (g_ruin.js)
hook('gate',c=>{if(!P||c.stop||!REGION().gates)return;for(const g of REGION().gates)if(g.to&&dist(g,P)<.8&&mapClosed(g.to)&&!(P.gateLock)&&!(sectPop(REGIONS[g.to].hq)<=0)){const s=SECTS[REGIONS[g.to].hq];
  log(sectPop(s.id)<=0?`${REGIONS[g.to].name}은(는) 폐허가 되어 길이 막혔다. ${s.n}은(는) 멸문했다.`:`${REGIONS[g.to].name}은(는) 인원이 줄어 닫혔다. ${s.n}의 세가 회복되어야 다시 연다.`,'info');addText(P.x,P.y,'폐문','#e07a5a');P.y+=g.y<NH/2?1.3:-1.3;P.path=null;P.gateLock=1;c.stop=true;return}});
// 닫힌 맵에 서 있게 되면(옛 저장) 황폐: NPC 없음, 제 문파 무인 없음
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||!R.hq||!SECTS[R.hq])return;if(!R._npcs)R._npcs=R.npcs||[];if(!R._sp2)R._sp2=R._sp||R.spawns||[];
  const ruin=mapClosed(id);R.ruin=ruin;if(ruin){R.npcs=[];const own=FAC_KIND[alFac(SECTS[R.hq].al)];R.spawns=(R._sp2).filter(([k])=>!own.includes(k))}else{R.npcs=R._npcs;if(!(G.occ&&G.occ[R.hq]))R.spawns=R._sp2}});
// ---- 본산 대화·정세 창 ----
hook('hqDlg',c=>{const s=SECTS[c.n.hq];if(sectPop(s.id)>0)return;c.html=`<p class="note">폐허 속에 ${masterTitle(s)}의 위패만 남았다. ${s.n}은(는) 멸문했다.</p>`});
const popTrend=sid=>{const a=G.popPrev&&G.popPrev[sid];if(a==null)return '';const d=sectPop(sid)-a;return d>0?'<span class="good">▲</span>':d<0?'<span class="bad">▼</span>':'·'};
function popCard(){popInit();const list=Object.values(SECTS).map(s=>({s,p:sectPop(s.id),b:popBase(s)})).sort((a,b)=>b.p-a.p);
  const mine=P.sect&&SECTS[P.sect]?list.find(x=>x.s.id===P.sect):null;const top=list.slice(0,12);if(mine&&!top.includes(mine))top.push(mine);
  const row=x=>{const f=alFac(x.s.al),live=liveMaps(x.s),n=(REGIONS[hqId(x.s)]||{}).chain?REGIONS[hqId(x.s)].chain.length:1,q=sectQ(x.s);
    return `<div class="it"><div>${x.s.n} <small class="dim">${FAC4N[f]}</small> <b class="num ${x.p<=0?'bad':''}">${Math.round(x.p)}</b> ${popTrend(x.s.id)}<span>${x.p<=0?'멸문':`기준 ${x.b} · 본산 ${live}/${n}장${G.seal[x.s.id]?' · 봉문':''}${G.occ[x.s.id]?' · 점령':''}${G.mdead[x.s.id]?` · <span class="bad">${masterTitle(x.s)} 공석</span>`:sectWeak(x.s)?` · <span class="bad">쇠퇴 · ${masterTitle(x.s)} 출전</span>`:''} · 고수 비율 ${Math.round((.25+.35*q)*100)}%`}</span></div></div>`};
  return `<div class="card"><h4>문파 인원 <small class="dim">상위 12${mine?' + 내 문파':''} · 해마다 늘고 무인이 죽으면 준다</small></h4><div class="list">${top.map(row).join('')}</div>
    <p class="note">기준 인원: 대문파 ${POP.base.big} · 중견 ${POP.base.mid} · 소문파 ${POP.base.small} · 천마신교 ${POP.base.one}. 해마다 ${Math.round(POP.grow*100)}%(고급 무공마다 +${Math.round(POP.growHi*100)}%, 마교 ${Math.round(POP.growMagyo*100)}%) 늘고, 플레이어가 죽인 무인은 ${POP.kill}명, 무인끼리 죽으면 ${POP.npcKill}명 준다. 결전에서 지면 ${Math.round(POP.roundLoss*100)}%, 대전에서 지면 ${Math.round(POP.warLoss*100)}% 잃는다. 기준의 반 밑이면 깊은 본산 맵부터 닫히고 0이면 멸문.</p></div>`}
{const ps=pStory;pStory=function(){const h=ps();const i=h.indexOf('<p class="note">세력의 힘은');return i<0?h+popCard():h.slice(0,i)+popCard()+h.slice(i)}}

// ---- 세력 무인의 출현: 맵에 들어서면 상한의 60%만 서 있고, 죽어 빈 자리는 문파 인원이 남아 있는 동안 출입구에서 걸어 들어와 채운다 (사용자 요청 2026-10-13) ----
let FACK=null;   // FAC_KIND는 뒤 파일(g_faction.js)에 있어 처음 쓸 때 만든다
// v113 (사용자 2026-10-15 "인원이 감소할수록 맵에 리젠되는 적의 수가 점점 증가해서 멸문 속도가 빨라지게"): 본산 맵의 문파가 줄어든 만큼(1-인원/기준) 상한 ×(1+rush.cap·d), 보강 간격 ×(1-rush.rein·d), 한 번에 1+floor(rush.n·d)명
const rushD=R=>{const s=R&&R.hq&&SECTS[R.hq];if(!s)return 0;const p=sectPop(s.id);if(!(p>0))return 0;return Math.max(0,Math.min(1,1-p/popBase(s)))};
function facCap(k,cap){if(!FACK)FACK=new Set(Object.values(FAC_KIND).flat());if(!FACK.has(k))return cap;const d=rushD(REGION()),r=POP.rush||{cap:0};return Math.round(cap*(1+(r.cap||0)*d))}
function facSpawn(k,cap,test,mk,n){if(!FACK)FACK=new Set(Object.values(FAC_KIND).flat());if(!FACK.has(k)||!mk)return false;const R=REGION();R._fs=R._fs||{};const st=R._fs[k]||(R._fs[k]={init:false,at:-99});
  const spot=()=>{const big=N>BIG_N;for(let t=0;t<80;t++){const x=big?Math.max(1,Math.min(N-2,Math.floor(P.x+(Math.random()*2-1)*NEAR_R))):1+Math.floor(Math.random()*(N-2)),y=big?Math.max(1,Math.min(NH-2,Math.floor(P.y+(Math.random()*2-1)*NEAR_R))):1+Math.floor(Math.random()*(NH-2));
    if(test(x,y)&&walk(x,y)&&Math.hypot(x+.5-P.x,y+.5-P.y)>=8)return{x:x+.5,y:y+.5}}return null};
  if(!st.init){const want=Math.max(1,Math.round(cap*POP.initFill));for(let i=n;i<want;i++){const s=spot();if(!s)break;mobs.push(mk(s.x,s.y))}st.init=true;st.at=time;return true}   // 처음엔 60%를 한꺼번에
  const d=rushD(R),ru=POP.rush||{};if(time-st.at<POP.reinSec*(1-(ru.rein||0)*d))return true;st.at=time;
  for(let i=0,cnt=1+Math.floor((ru.n||0)*d);i<cnt&&mobs.filter(m=>m.kind===k&&m.hp>0&&!m.fixed).length<cap;i++){
  const s=spot();if(!s)continue;const e=mk(s.x,s.y);if(!(sectPop(e.sect)>0))return true;   // 그 문파에 남은 사람이 없으면 못 온다
  const gates=(R.gates||[]).filter(g=>g.to&&!g.door);const g=gates.length?gates[Math.floor(Math.random()*gates.length)]:null;
  if(g){let gx=g.x,gy=g.y;for(let t=0;t<8&&!walkAt(gx,gy);t++){gx=g.x+(Math.random()*2-1);gy=g.y+(Math.random()*2-1)}if(walkAt(gx,gy)){e.x=gx;e.y=gy;e.home={x:s.x,y:s.y};e.goal={x:s.x,y:s.y};e.rein=1}}
  mobs.push(e)}return true}
hook('regionLoaded',id=>{const R=REGIONS[id];if(R)R._fs={}});
// 세력의 힘을 바로 맞춘다(인원을 비율로 바꿔서). 테스트·디버그용
function setPow(f,v){const w=wld();if(!(w.pow[f]>0)){for(const s of Object.values(SECTS))if(alFac(s.al)===f&&!(G.pop[s.id]>0))G.pop[s.id]=popBase(s);popSync()}popScale(f,v/Math.max(.1,w.pow[f]))}
function popReset(){G.pop=null;popInit();popSync()}

// ---- 쇠퇴한 문파의 장문인은 싸울 수 있다 (사용자 요청 2026-10-13) ----
// 인원이 기준의 50% 이하이거나 지난해보다 줄었으면(사망이 증가보다 많음) 쇠퇴. 그때 장문인 NPC 자리에 싸우는 우두머리가 선다(생명 3배, 공격 1.3배, 장로급 직위).
// 쓰러뜨리면 그 문파 인원 10%가 흩어지고(G.mdead) 고수 비율이 떨어지며 가입이 막힌다. 쇠퇴에서 벗어나 3년이 지나면 새 장문인이 선다.
const sectWeak=s=>{const p=sectPop(s.id);if(p<=0)return false;if(p<=popBase(s)*POP.weak)return true;const a=G.popPrev&&G.popPrev[s.id];return a!=null&&p<a};
// 장문인 NPC를 싸우는 우두머리로 바꿔 세운다 (쇠퇴했을 때, 또는 강제공격으로 장문인을 쳤을 때)
function masterBoss(R,n,s,why){R.npcs=(R._npcsM||R.npcs).filter(x=>x!==n);const e=mkFac(alFac(s.al),1,n.x,n.y,s.id);e.rank=4;e.realm=4;if(typeof scaleMob==='function')scaleMob(e);e.maxHp=Math.round(e.maxHp*POP.masterHp);e.hp=e.maxHp;e.atk=Math.round(e.atk*POP.masterAtk);
  e.master=s.id;e.name=n.n;e.pal=n.pal||e.pal;e.home={x:n.x,y:n.y};mobs.push(e);NPCF=npcsHere().filter(x=>!x.board).map(npcFighter);log(why,'info');return e}
// 지금 맵(id)의 장문인 상태를 인원에 맞춘다: 쇠퇴·공석이면 NPC를 숨기고(쇠퇴면 우두머리를 세우고), 아니면 NPC로 돌린다. 맵에 들어올 때와 이 맵에서 제자가 죽을 때마다
function masterCheck(id){const R=REGIONS[id];if(!R||R.ruin)return;const base=R._npcsM||R.npcs||[];const n=base.find(x=>x.hq);if(!n)return;const s=SECTS[n.hq];if(!s)return;if(!R._npcsM)R._npcsM=R.npcs;popInit();
  const dead=!!G.mdead[s.id],weak=sectWeak(s),boss=mobs.some(m=>m.master===s.id&&m.hp>0);
  if(dead||weak){R.npcs=R._npcsM.filter(x=>x!==n);
    if(!dead&&REG===id&&!boss)masterBoss(R,n,s,`${s.n}이(가) 쇠퇴해 ${masterTitle(s)}이 몸소 칼을 잡고 섰다.`)}
  else if(!boss)R.npcs=R._npcsM;   // 강제공격으로 끌어낸 장문인은 싸움이 끝날 때까지 그대로
  NPCF=npcsHere().filter(x=>!x.board).map(npcFighter)}
hook('regionLoaded',masterCheck);
hook('kill',e=>{if(e.sect&&e.d&&e.d.fac&&!e.master&&P&&REG)masterCheck(REG)});
// 강제공격을 켜고 장문인 NPC를 치면 쇠퇴하지 않았어도 우두머리로 나선다 (사용자 2026-10-13 "왜 장문인을 죽일 수 없지"). 돌아온다: 맵을 나갔다 오면 다시 NPC
function masterOut(n){if(!n||!n.hq||!forceAtk)return null;const s=SECTS[n.hq];if(!s||G.mdead[s.id])return null;const R=REGION();const live=mobs.find(m=>m.master===s.id&&m.hp>0);if(live)return live;
  if(!R._npcsM)R._npcsM=R.npcs;return masterBoss(R,n,s,`${masterTitle(s)} ${n.n}에게 칼을 겨눴다. ${s.n} 전체가 적이 된다.`)}
hook('kill',e=>{if(!e.master)return;const s=SECTS[e.master];if(!s)return;G.mdead[s.id]={y:Math.floor(G.cal),life:P.lifeNo};popLose(s.id,Math.round(sectPop(s.id)*POP.masterLoss),`${masterTitle(s)} 사망`);
  P.fame+=30;showBanner(`${s.n} ${masterTitle(s)} 격살`,`${s.n}의 제자 ${Math.round(POP.masterLoss*100)}%가 흩어진다`);log(`${s.n}의 ${masterTitle(s)}을(를) 쓰러뜨렸다. 명성 +30. ${s.n}은(는) 당분간 제자를 받지 못하고 고수가 줄어든다.`,'xp');P.feats.push(`${Math.floor(P.age)}세에 ${s.n}의 ${masterTitle(s)}을(를) 쓰러뜨렸다`)});
hook('newYear',()=>{popInit();for(const sid in G.mdead){const s=SECTS[sid];if(!s)continue;if(!sectWeak(s)&&Math.floor(G.cal)-G.mdead[sid].y>=POP.masterBack){delete G.mdead[sid];log(`${s.n}에 새 ${masterTitle(s)}이 섰다.`,'sys')}}});

// ================= v256 전생의 흔적 (동훈님 2026-11-12, 적용 계획 PR2) =================
// 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 J. "내가 남긴 것이 세상에 남고, 다음 생의 내가 그것을 찾는다". 숫자는 data/past.json (GD.PAST)
// 세상(G)은 이미 생을 넘어 이어진다. 여기서는 바로 전 생 하나가 남긴 것 G.past를 적고, 다음 생에서 찾아 되찾게 한다.
// - 죽을 때(died 훅) G.past = {life, n, sect, arts:[숙련 PAST.artMin 이상 무공 PAST.arts개], yg:[[문파,무공] 저술한 요결], tch:[가르친 후기지수 id], foe:[문파], fr:[문파]}
//   두 생 전 것은 강호사에만 남는다 (덮어쓴다)
// - 흔적 ① 전대의 요결: 전생에 저술한 무공. 그 문파 장문인 대화에서 '전대 ○○의 요결'을 읽으면 구결(g_kyul.js) + 숙련 선출발
//   (전생 숙련 × 난이도 비율 PAST.carry, 최대 PAST.head). 처음 보는 무공이면 첫 초식도 익힌다. 다른 편 문파면 정파는 악업 (몰래 본다)
// - 흔적 ② 전생의 제자: 문도 지도로 한 단계 올려 준 후기지수(h.tch). 이번 생에도 살아 있으면 그 문파 장문인 곁에 원로로 선다.
//   대화: 옛 무공을 펼쳐 보이면 알아본다(전생 무공을 익혀 들고 있어야) → 전생 무공의 구결 모두 + 화두 하나 + 명성, 벗이 된다.
//   옛 스승의 이야기를 물으면 요결이 어디 있는지 일러 준다. 그냥 인사만 할 수도 있다
// - 흔적 ③ 전생의 은원: 은원 장부에서 벤 정예·우두머리의 문파는 이번 생에 우호도가 낮게, 구해 준 이의 문파는 높게 시작한다 (첫 맵에서 한 번)
// - 찾는 법: 흔적은 저절로 보이지 않는다(P.pk). 정보 단체(개방·하오문 등)에서 '전대 고수의 흔적'(중급)을 사거나, 전생의 무덤 망령을 쓰러뜨리면 모두 드러난다.
//   전생의 제자를 만나면 요결 자리도 드러난다
// - 원칙: 능력치·경지는 넘기지 않는다. 구결·숙련 선출발·우호도 시작점·화두만. 선출발은 병기 이해도의 '새 무공 숙련 최대 25'와 같은 크기
// 테스트 tests/t172_past.js
const PSD=GD.PAST||{artMin:80,arts:3,head:25,carry:[.5,.35,.25,.15,.1],rep:{foe:-30,fr:25},fame:20,intelG:2};
const pastOn=()=>!!(G.past&&P&&P.lifeNo===G.past.life+1);   // 바로 다음 생에서만
const pastK=()=>P.pk||(P.pk={});
const pastCarry=()=>PSD.carry[Math.max(0,Math.min(PSD.carry.length-1,G.diff??1))];
// ---- 죽을 때 남긴다 ----
function pastRecord(){if(!P)return null;
  const arts=learnedArts().filter(id=>{const a=ARTS[id];return a&&!a.base&&!a.melee&&A(id).p>=PSD.artMin}).sort((a,b)=>A(b).p-A(a).p).slice(0,PSD.arts).map(id=>({id,p:Math.round(A(id).p)}));
  const yg=(P.sjsMine||[]).filter(([s,id])=>SECTS[s]&&ARTS[id]).map(([s,id])=>{const m=A(id);return[s,id,m?Math.round(m.p):PSD.artMin]});
  const tch=(G.hugi||[]).filter(h=>h.tch&&h.tch.l===P.lifeNo&&!h.dead).map(h=>h.id);
  const ew=P.ew||[],uniq=a=>[...new Set(a)].filter(s=>SECTS[s]);
  const foe=uniq(ew.filter(r=>r.k==='kill'&&r.sect).map(r=>r.sect)),fr=uniq(ew.filter(r=>r.k==='save'&&r.sect).map(r=>r.sect)).filter(s=>!foe.includes(s));
  return{life:P.lifeNo,n:P.name,sect:P.sect||null,arts,yg,tch,foe,fr}}
hook('died',()=>{G.past=pastRecord()});
// ---- 흔적 목록 ----
const pastPupils=()=>pastOn()?(G.past.tch||[]).map(hugiById).filter(h=>h&&!h.dead):[];
function pastTraces(){if(!pastOn())return[];const L=[];
  for(const[s,id,p]of G.past.yg||[])L.push({k:`yg:${s}:${id}`,t:'요결',sid:s,id,p,txt:`전대 ${G.past.n}이(가) 남긴 [${ARTS[id].n}]의 요결이 ${SECTS[s].n} 장경각에 있다`});
  for(const h of pastPupils())L.push({k:`tch:${h.id}`,t:'제자',sid:h.sid,h,txt:`전대 ${G.past.n}에게 배운 ${h.n}이(가) ${SECTS[h.sid]?SECTS[h.sid].n:'강호'}에 살아 있다`});
  return L}
function pastKnowAll(why){const L=pastTraces();if(!L.length)return 0;let n=0;for(const t of L)if(!pastK()[t.k]){pastK()[t.k]=1;n++}
  if(n){log(`${why?why+': ':''}전생의 흔적 ${n}가지를 알게 되었다. ${L.filter(t=>pastK()[t.k]).map(t=>t.txt).join(' / ')}.`,'xp');if(typeof showBanner==='function')showBanner('전생의 흔적',`${n}가지`)}
  return n}
// 정보 단체 (g_intel.js intelList)
function pastIntel(){const L=pastTraces();if(!L.length)return[];
  return[{g:PSD.intelG,key:'past',t:'전대 고수의 흔적',txt:L.map(t=>t.txt).join(' / ')+'.',fn:()=>pastKnowAll('들은 소문')}]}
// ---- 흔적 ③ 은원: 첫 맵에서 한 번 ----
function pastRepTry(){if(!P||!pastOn()||P.pastRep||typeof repAdd!=='function')return;P.pastRep=1;
  for(const s of G.past.foe||[])repAdd(s,0,PSD.rep.foe);for(const s of G.past.fr||[])repAdd(s,0,PSD.rep.fr)}
for(const k of['regionLoaded','enteredRegion','newYear','panelOpen'])hook(k,pastRepTry);   // 새 생의 첫 맵이 P를 만들기 전에 열릴 수 있어 여러 자리에서 한 번만
// ---- 흔적 ① 요결 ----
const ygHead=p=>Math.min(PSD.head,Math.round((p||PSD.artMin)*pastCarry()));
function ygWhy(t){if(pastK()['used:'+t.k])return '이미 읽었다';if(!pastK()[t.k])return '모른다';const a=ARTS[t.id];
  if(!A(t.id)&&typeof readBlock==='function'){const no=readBlock({slot:'book',art:t.id,form:0});if(no)return no}return ''}
function ygRead(k){const t=pastTraces().find(q=>q.k===k);if(!t||t.t!=='요결'||ygWhy(t))return;const a=ARTS[t.id];pastK()['used:'+k]=1;
  if(!A(t.id))P.arts[t.id]={p:0,f:a.forms.map((f,i)=>i===0)};const head=ygHead(t.p),s=A(t.id);s.p=Math.max(s.p,head);
  if(typeof kyulD==='function')kyulD()[t.id]=1;
  const s2=SECTS[t.sid];if(s2&&P.side==='정'&&!sideOk(s2.al)){P.evil+=5;log('다른 편 문파의 장경각을 몰래 들여다보았다. 악업이 쌓입니다.','dmg')}
  log(`전대 ${G.past.n}의 요결을 펼쳤다. 낯익은 글씨다. [${a.n}]의 구결을 얻고 숙련 ${Math.floor(s.p)}에서 다시 시작한다.`,'xp');
  if(typeof showBanner==='function')showBanner('전대의 요결',a.n);feat(`전생에 남긴 [${a.n}]의 요결을 되찾았다`);if(typeof recalc==='function')recalc()}
// ---- 흔적 ② 전생의 제자 ----
const pastArtIds=()=>pastOn()?(G.past.arts||[]).map(x=>x.id).filter(id=>ARTS[id]):[];
// 알아보는 조건: 전생 무공을 익혀 지금 펼치는 중
const pastShowOk=()=>{const ids=pastArtIds();return ids.includes(P.cur)&&!!A(P.cur)&&hasWeaponFor(ARTS[P.cur].cls)};
function pupilWhy(h){if(pastK()['met:'+h.id])return '이미 알아보았다';if(!pastK()['tch:'+h.id])return '모른다';if(!pastShowOk())return pastArtIds().length?`전생의 무공(${pastArtIds().map(id=>ARTS[id].n).join('·')})을 익혀 펼친 채여야 한다`:'보여 줄 전생의 무공이 없다';return ''}
function pupilAct(id,how){const h=(G.hugi||[]).find(q=>String(q.id)===String(id));if(!h||!pastK()['tch:'+h.id])return;
  if(how==='show'){if(pupilWhy(h))return;pastK()['met:'+h.id]=1;let n=0;
    for(const aid of pastArtIds())if(typeof kyulD==='function'&&!kyulD()[aid]){kyulD()[aid]=1;n++}
    P.fame+=PSD.fame;{P.hgr=P.hgr||{};const r=P.hgr[h.id]||(P.hgr[h.id]={v:0,f:0,w:0,l:0});r.v=Math.max(r.v,60)}
    if(typeof hwGet==='function'&&hwGet()&&typeof hwFill==='function'){const h0=hwGet();const x=h0.l.find(hwOpenX);if(x){x.c=x.g;hwSolve(x);log(`화두 하나가 풀렸다: ${(hwDef(x.id)||{}).n||x.id}`,'xp')}}else P.pastHw=1;
    log(`${h.n}의 눈이 커진다. "그 초식… 그 손목의 버릇… 사부님?" 늙은 제자가 무릎을 꿇는다. 전생 무공의 구결 ${n}가지를 되찾았고 명성 +${PSD.fame}.`,'xp');
    if(typeof showBanner==='function')showBanner('전생의 제자',h.n);feat(`전생의 제자 ${h.n}과(와) 다시 만났다`)}
  else if(how==='ask'){const yg=pastTraces().filter(t=>t.t==='요결');for(const t of yg)pastK()[t.k]=1;
    log(`${h.n}: "스승님은 ${G.past.n}이라 하셨지. ${yg.length?`생전에 ${yg.map(t=>`[${ARTS[t.id].n}]의 요결을 ${SECTS[t.sid].n}에`).join(', ')} 남기셨네.`:'남기신 책은 없네. 다만 그 검은 아직 내 손에 남아 있지.'}"`,'sys')}
  else log(`${h.n}에게 인사만 하고 물러났다.`,'info')}
hook('sectAct',c=>{if(c.a==='ygread'){c.done=true;c.r=true;ygRead(`${c.x}`.replace(/~/g,':'))}else if(c.a==='pupil'){c.done=true;c.r=true;pupilAct(c.x,c.y)}});
// 화두가 생기면(벽에 닿으면) 미뤄 둔 화두 하나를 푼다
const pastHwTry=()=>{if(!P||!P.pastHw||typeof hwGet!=='function'||!hwGet())return;const x=hwGet().l.find(q=>q.c<q.g);if(x){x.c=x.g;P.pastHw=0;log('전생의 제자가 일러 준 말이 떠올라 화두 하나가 풀렸다.','xp')}};
hook('mastDone',pastHwTry);hook('newYear',pastHwTry);hook('panelOpen',pastHwTry);
// 장문인 대화에 흔적 카드
hook('hqDlg',c=>{const s=SECTS[c.n.hq];if(!s||!pastOn()||c.html==null)return;const L=pastTraces().filter(t=>t.sid===s.id&&pastK()[t.k]);if(!L.length)return;
  const rows=L.map(t=>{if(t.t==='요결'){const why=ygWhy(t),a=ARTS[t.id];
      return `<div class="it"><div>전대 ${esc(G.past.n)}의 요결 · ${a.n}<span>구결 + 숙련 ${ygHead(t.p)}에서 시작${why?` · <span class="bad">${esc(why)}</span>`:''}</span></div><div class="ib">${B(`ygread:${t.k.replace(/:/g,'~')}`,'펼친다',{d:!!why,pri:!why})}</div></div>`}
    const h=t.h,why=pupilWhy(h),met=pastK()['met:'+h.id];
    return `<div class="it"><div>원로 ${esc(h.n)}${P.sect===h.sid?' <small class="gold">사숙조</small>':''} <small class="dim">전대 ${esc(G.past.n)}의 제자${P.sect===h.sid?' · 내가 가르친 아이를 이제 윗대로 모신다':''}</small><span>${met?'"사부님, 이번 생에는 제가 지켜 드리지요."':`"…자네, 어디서 본 듯하군."`}${why&&!met?` · <span class="dim">${esc(why)}</span>`:''}</span></div>
      <div class="ib">${met?'':B(`pupil:${h.id}:show`,'옛 무공을 펼쳐 보인다',{d:!!why,pri:!why})}${B(`pupil:${h.id}:ask`,'옛 스승의 이야기를 묻는다')}${met?'':B(`pupil:${h.id}:bye`,'인사만 한다')}</div></div>`}).join('');
  c.html+=`<div class="card"><h4>전생의 흔적 <small class="dim">낯익은 것들</small></h4><div class="list">${rows}</div></div>`});
// ---- 윤회 화면: 다음 생에 남는 흔적 ----
function pastCard(){const g=G.past;if(!g)return '';const yg=(g.yg||[]).map(([s,id])=>`${ARTS[id].n}(${SECTS[s].n})`),t=(g.tch||[]).length,f=(g.foe||[]).length,r=(g.fr||[]).length;
  const any=yg.length||t||f||r;
  return `<div class="card"><h4>다음 생에 남는 흔적</h4><p class="note">${any?[yg.length?`요결 ${yg.join(', ')}`:'',t?`가르친 제자 ${t}명`:'',f?`원한을 산 문파 ${f}곳`:'',r?`은혜를 베푼 문파 ${r}곳`:''].filter(Boolean).join(' · ')+'. 다음 생에서 찾아 되찾을 수 있다 (정보 단체·전생의 무덤).':'남긴 것이 없다. 저술·문도 지도·은원이 다음 생의 흔적이 된다.'}</p></div>`}

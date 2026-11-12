// ================= title, 캐릭터 생성, 윤회 =================
const scrEl=$('scr'),box=$('scrbox');
// 제목 화면: 저장 칸 5개 목록. 칸을 고르면 그 칸의 이름·회차·나이·경지·문파·저장 시각과 단추(이어하기·새 생·강호사·처음부터 새로·삭제)가 나온다. 지우기는 confirm() 대신 화면 안에서 한 번 더 묻는다 (아티팩트·웹뷰에서 confirm이 막혀 '처음부터 새로'가 안 눌리던 문제, 사용자 보고 2026-10-14)
let slotAsk=false;
function slotInfo(i){const sv=loadSlot(i);if(!sv||!sv.G)return null;const p=sv.P||{},h=sv.G.history||[],last=h[h.length-1],alive=!!(sv.alive&&sv.P);
  const name=alive?p.name:last?last.name:'',life=alive?(p.lifeNo||(sv.G.lives||0)+1):(sv.G.lives||0);
  const sect=alive?(p.sect==='own'?p.sectName:p.sect&&SECTS[p.sect]?SECTS[p.sect].n:''):last&&last.sect||'';
  const realm=alive?(RANKS[p.realm|0]||''):last?last.realm:'';
  let when='';try{when=new Date(sv.t||0).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){}
  return{sv,alive,name:name||'이름 없음',life,age:Math.floor(p.age||0),sect,realm,when:sv.t?when:'',lives:sv.G.lives||0,hist:h.length}}
// v219 (개선 계획 3절): 첫 화면은 제목·그림·큰 단추 둘. 칸은 아래 작은 칩 다섯 개로 줄이고, 고른 칸의 자세한 줄은 가운데 카드가 보여 준다 (칩의 자세한 글은 .sd로 숨긴다)
function slotRow(i,sel){const s=slotInfo(i);const t=s?`<b>${i+1}번 · ${esc(s.name)}</b><span class="sd">${s.alive?`${s.life}회차 · ${s.age}세 · ${esc(s.realm)}${s.sect?' · '+esc(s.sect):''}`:`${s.lives}회차 마침 · 다음 생 대기`}${s.when?` · <span class="dim">${s.when}</span>`:''}</span>`:`<b>${i+1}번 · 빈 칸</b><span class="dim sd">새로 시작할 수 있다</span>`;
  return `<button type="button" class="opt slot" data-s="slot:${i}" aria-pressed="${sel}">${t}</button>`}
function slotPanel(){const i=SLOT,s=slotInfo(i);
  if(!s)return `<div class="card tcard"><div class="center tbig"><button class="btn pri" data-s="new" type="button">새 인생</button></div><p class="note">${i+1}번 칸 · 비어 있음</p></div>`;
  const body=s.alive?`<p class="tsum"><b class="gold">${esc(s.name)}</b> · 제${s.life}생 · ${s.age}세 · ${esc(s.realm)}${s.sect?' · '+esc(s.sect):''}${s.when?` <span class="dim">· ${s.when}</span>`:''}</p>`:`<p class="tsum">${s.lives}번의 생을 마쳤다 · 마지막은 <b class="gold">${esc(s.name)}</b>${s.when?` <span class="dim">· ${s.when}</span>`:''}</p>`;
  // v160 (사용자 2026-10-20 "저장된 기록을 삭제 가능하게"): 삭제는 칸을 비우고 제목 화면에 남는다. 처음부터 새로는 지우고 바로 새 인생
  const btns=slotAsk==='del'?`<p class="note">${i+1}번 칸의 기록(인물·세상·강호사)을 모두 지워 빈 칸으로 만든다. 되돌릴 수 없다.</p><div class="center"><button class="btn pri" data-s="del2" type="button">삭제한다</button><button class="btn" data-s="noreset" type="button">그만둔다</button></div>`
    :slotAsk?`<p class="note">이 칸의 세력 구도·봉문·점령과 강호사까지 모두 지우고 1회차부터 다시 시작한다. 되돌릴 수 없다.</p><div class="center"><button class="btn pri" data-s="reset2" type="button">지운다</button><button class="btn" data-s="noreset" type="button">그만둔다</button></div>`
    :`<div class="center tbig">${s.alive?'<button class="btn pri" data-s="cont" type="button">이어하기</button>':''}${s.alive?'':`<button class="btn pri" data-s="new" type="button">${s.lives?'다음 생 시작':'새 인생'}</button>`}</div>
      <div class="center tsmall">${s.hist?'<button class="btn" data-s="hist" type="button">강호사</button>':''}<button class="btn" data-s="reset" type="button" title="이 칸의 세상(세력 구도·봉문·점령)과 강호사를 모두 지우고 1회차부터">처음부터 새로</button><button class="btn" data-s="del" type="button" title="이 칸의 기록을 지워 빈 칸으로">삭제</button></div>`;
  return `<div class="card tcard" id="slotinfo">${body}${btns}</div>`}
// 메뉴 → 저장 칸 고르기 (v139, 사용자 요청 2026-10-18): 지금 칸에 기록하고, 다른 칸을 이어 할 때 앞 판의 상태가 섞이지 않게 인물·세계를 비운다
function toTitle(){if(!P)return;saveGame(true);closePanels();if(G.duel)G.duel=null;
  P=null;G=G0();if(typeof pursueClear==='function')pursueClear();allies=[];mobs=[];drops=[];projs=[];eprojs=[];fx=[];texts=[];sched=[];
  for(const b of builds.filter(b=>b.home)){for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)objs[j][i]=null}builds=builds.filter(b=>!b.home);
  showTitle()}
// 메뉴 → 종료 (사용자 2026-10-26): '저장소 선택'은 toTitle, '완전 종료'는 기록하고 앱을 닫는다.
// 안드로이드 설치판은 껍데기의 AndroidApp.exit, 브라우저는 window.close 를 해 보고 안 닫히면(스크립트가 연 창이 아니면 막힌다) 첫 화면으로 가서 알린다
let quitAsk=false;hook('panelOpen',()=>{if(quitAsk){quitAsk=false;renderOpen()}});
const quitCard=()=>quitAsk?`<div class="card" id="quitask"><p>어떻게 끝낼까요? 지금까지의 진행은 이 칸에 기록해 둡니다.</p><div class="center">${B('totitle','저장소 선택',{pri:1,t:'기록하고 저장 칸 고르는 첫 화면으로'})} ${B('quitapp','완전 종료',{t:'기록하고 게임을 닫는다'})} ${B('quitno','그만둔다')}</div></div>`:'';
function quitApp(){quitAsk=false;if(P)saveGame(true);
  const A=window.AndroidApp;if(A&&typeof A.exit==='function'){A.exit();return}
  try{window.close()}catch(e){}
  setTimeout(()=>{if(window.closed)return;if(P)toTitle();else showTitle();
    box.insertAdjacentHTML('afterbegin','<p class="card note" id="quitnote" style="text-align:center">기록해 두었습니다. 브라우저에서는 게임이 창을 직접 닫을 수 없으니 이 탭을 닫아 끝내 주세요.</p>')},250)}
// 첫 화면 그림: 달·먹 산 세 겹·벼랑 위 검객 그림자 (코드로 그린 SVG)
const TITLE_ART=`<svg class="tart" viewBox="0 0 360 170" aria-hidden="true" preserveAspectRatio="xMidYMax slice"><defs><radialGradient id="tmoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f6e7b8"/><stop offset=".6" stop-color="#e8d49a"/><stop offset="1" stop-color="#e8d49a" stop-opacity="0"/></radialGradient><linearGradient id="tfog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0a09" stop-opacity="0"/><stop offset="1" stop-color="#0b0a09"/></linearGradient></defs>
  <circle cx="262" cy="52" r="34" fill="url(#tmoon)" opacity=".85"/><circle cx="262" cy="52" r="22" fill="#f1e2b0" opacity=".9"/>
  <path d="M0 120 L40 86 L70 104 L112 62 L150 96 L188 70 L232 108 L276 78 L318 102 L360 84 L360 170 L0 170Z" fill="#3a3226" opacity=".55"/>
  <path d="M0 140 L32 116 L64 128 L98 98 L134 126 L170 110 L214 134 L250 112 L296 132 L330 118 L360 128 L360 170 L0 170Z" fill="#251f18" opacity=".85"/>
  <path d="M60 170 L96 132 L120 126 L138 112 L150 118 L166 170Z" fill="#14110d"/>
  <g fill="#0d0b09"><path d="M139 112 l2 -14 l3 -3 l3 3 l1 14 l-2 0 l-1 -10 l-2 0 l-1 10Z"/><circle cx="144" cy="92" r="3.2"/><path d="M146 97 l18 -16" stroke="#0d0b09" stroke-width="1.4"/><path d="M141 99 q-8 4 -13 12 q6 -3 12 -6Z" opacity=".8"/></g>
  <path d="M40 150 q10 -26 6 -40 m-6 40 q-14 -10 -24 -8 m24 0 q14 -14 26 -12" stroke="#120f0b" stroke-width="3" fill="none"/>
  <rect x="0" y="120" width="360" height="50" fill="url(#tfog)"/></svg>`;
let titleView='main';
function showTitle(){if(typeof mdgEnd==='function')mdgEnd(true,true);   // v224 마당 사건을 접는다 (g_scene.js)

  playing=false;paused=true;scrEl.hidden=false;slotAsk=false;titleView='main';renderTitle()}
function renderTitle(){
  if(titleView==='help'){box.innerHTML=`<h2 class="title" style="font-size:36px">설정 · 조작법</h2><div class="card">${pHelp()}</div>
   <p class="note" style="text-align:center">진행은 고른 칸에 30초마다, 그리고 객잔·집에서 쉴 때 기록된다. 그림은 모두 코드로 그렸고 주인공 스프라이트는 사용자가 준 그림이다.</p><div class="center"><button class="btn" data-s="back" type="button">돌아가기</button></div>`;return}
  box.innerHTML=`<div class="tmain">${TITLE_ART}<h1 class="title">강호윤회록</h1><p>태어나 늙고, 업보에 따라 다시 태어난다</p></div>
   ${slotPanel()}
   <div class="slotbar"><small class="dim">저장 칸</small><div class="slots">${Array.from({length:SLOT_N},(_,i)=>slotRow(i,i===SLOT)).join('')}</div></div>
   <div class="center tlinks"><button class="btn" data-s="thelp" type="button">설정 · 조작법</button></div>`}
function refreshSlots(){if(titleView==='main')renderTitle()}
box.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b||b.disabled)return;const s=b.dataset.s;
  if(s.startsWith('slot:')){setSlot(+s.slice(5));G=G0();slotAsk=false;refreshSlots();return}
  if(s==='cont'){const sv=loadGame();if(applySave(sv)){startPlay(false)}else showCreate()}
  else if(s==='new'){const sv=loadGame();if(sv&&sv.G){G=Object.assign(G,sv.G);if(sv.alive){G.nextStatus=G.nextStatus??1}}showCreate()}
  else if(s==='hist'){const sv=loadGame();if(sv)G=Object.assign(G,sv.G);box.innerHTML=`<h2 class="title" style="font-size:40px">강호사</h2>${pHist()}<div class="center"><button class="btn" data-s="back" type="button">돌아가기</button></div>`}
  else if(s==='back')showTitle();
  else if(s==='thelp'){titleView='help';renderTitle()}
  else if(s==='reset'){slotAsk=true;refreshSlots()}
  else if(s==='del'){slotAsk='del';refreshSlots()}
  else if(s==='del2'){STORE.del(SAVE_KEY);G=G0();slotAsk=false;refreshSlots()}
  else if(s==='noreset'){slotAsk=false;refreshSlots()}
  else if(s==='reset2'){STORE.del(SAVE_KEY);G=G0();slotAsk=false;showCreate()}
  else if(s.startsWith('side:')){CR.side=s.slice(5);CR.opts=rollGG(CR.side);CR.gg=CR.opts[0];renderCreate()}
  else if(s.startsWith('gg:')){CR.gg=+s.slice(3);renderCreate()}
  else if(s.startsWith('cls:')){CR.cls=s.slice(4);if(CR.skip)renderSkip();else renderCreate()}
  else if(s==='diffopen'){CR.diffOpen=1;renderCreate()}
  else if(s.startsWith('diff:')){if(!G.lives)G.diff=+s.slice(5);renderCreate()}
  else if(s.startsWith('heir:')){const c=G.heir.children[+s.slice(5)];CR.heir=c;CR.name=c.name;CR.status=Math.max(G.nextStatus??1,2);CR.side=G.heir.side;CR.opts=rollGG(CR.side);CR.gg=CR.opts[0];renderCreate()}
  else if(s==='noheir'){CR.heir=null;CR.status=G.nextStatus??1;renderCreate()}
  else if(s==='start')beginLife();
  // v138 (사용자): 윤회하면 무관 튜토리얼을 건너뛸 수 있다. 건너뛰면 병기·심법을 고르는 창을 거쳐 바로 강호에서 시작
  else if(s==='skipacad'){CR.skip=1;CR.bob=ACAD_BOB.includes(CR.bob)?CR.bob:ACAD_BOB[0];CR.sim=CR.sim&&SIM[CR.sim]&&SIM[CR.sim].side===CR.side?CR.sim:ACAD_SIM[CR.side][0].id;renderSkip()}
  else if(s.startsWith('amode:')){CR.amode=s.slice(6);renderCreate()}
  else if(s==='skipback'){CR.skip=0;renderCreate()}
  else if(s.startsWith('ssim:')){CR.sim=s.slice(5);renderSkip()}
  else if(s.startsWith('sbob:')){CR.bob=s.slice(5);renderSkip()}
  else if(s==='skipstart')beginLife(true);
  else if(s==='rebirth')showCreate();
});
let CR=null;
const NAMES1=GD.NAMES1,NAMES2=GD.NAMES2;
const rname=()=>pick(NAMES1)+pick(NAMES2)+(Math.random()<.6?pick(NAMES2):'');
function rollGG(side){const n=STATUS[G.nextStatus??1].pick,idx=GEUNGOL[side].map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}return idx.slice(0,n).sort((a,b)=>a-b)}
function showCreate(){
  scrEl.hidden=false;playing=false;paused=true;const st=G.nextStatus??1;
  // v143 (사용자 버그: 윤회했는데 무관 처음부터): 두 번째 생부터는 무관 건너뛰기가 기본으로 골라져 있고, 무관부터 하려면 따로 고른다
  CR={name:rname(),side:'정',cls:'검',status:st,wis:Math.min(10,R1(3,7)+STATUS[st].wis+(G.wisCarry||0)),heir:null,amode:G.lives?'skip':'acad'};CR.opts=rollGG('정');CR.gg=CR.opts[0];renderCreate();
}
// 근골 한 줄 성격: 가장 높은 값(같은 값 둘이면 둘 다)의 형용사 + 효과. 고르면 even
function ggTrait(g){const T=GD.GG_TRAIT,k=['str','end','agi','qi'],v=g.slice(1,5),mx=Math.max(...v),mn=Math.min(...v);if(mx-mn<=1)return T.even;
  const top=k.filter((_,i)=>v[i]===mx).slice(0,2);return top.length>1?`${T.and[top[0]]} ${T.adj[top[1]]} 몸 · ${T.eff[top[0]]}`:`${T.adj[top[0]]} 몸 · ${T.eff[top[0]]}`}
function renderCreate(){
  const st=STATUS[CR.status],gl=GEUNGOL[CR.side];
  const heir=G.heir&&G.heir.children.length?`<div class="card"><h4>대물림</h4><p>전생의 자식으로 이어 살면 집과 창고, 은자 ${G.heir.silver}을(를) 물려받는다. 계열은 부모를 따른다.</p>
    <div class="center">${G.heir.children.map((c,i)=>`<button type="button" class="opt" data-s="heir:${i}" aria-pressed="${CR.heir===c}"><b>${esc(c.name)}</b><span>${c.age}세</span></button>`).join('')}<button type="button" class="opt" data-s="noheir" aria-pressed="${!CR.heir}"><b>남으로 태어나기</b><span>가문을 잇지 않는다</span></button></div></div>`:'';
  // v219 (개선 계획 3절): 한 화면에 들어오게. 신분은 한 줄, 난이도는 접고, 근골은 숫자 대신 한 줄 성격 (숫자는 작게)
  box.innerHTML=josa(`<h2 class="title" style="font-size:40px">${G.lives?`제${G.lives+1}생`:'탄생'}</h2>
    <div class="card crow"><span><b>${st.n}</b>의 자식 <small class="dim">${esc(st.d)}${G.bonusVit?` 전생의 보상 활력 ${G.bonusVit}은(는) 생일마다 ${Math.ceil(G.bonusVit/5)}씩 받는다.`:''}</small></span><span class="tag">오성 ${CR.wis}${G.wisCarry?` (+${G.wisCarry})`:''} · 은자 ${st.silver+(CR.heir?G.heir.silver:0)}</span></div>
    ${heir}
    <div class="row2 cname"><label style="display:flex;gap:8px;align-items:center;font-family:var(--display);font-size:18px">이름 <input class="name" id="nmi" maxlength="8" value="${esc(CR.name)}"${CR.heir?' disabled':''}></label>
      <div class="center">${['정','사'].map(s=>`<button type="button" class="opt" data-s="side:${s}" aria-pressed="${CR.side===s}"${CR.heir?' disabled':''}><b>${SIDES[s].n}</b><span>${ACAD_OFF?`기초 내공 ${SIDES[s].base}`:acadOf(s).n}</span></button>`).join('')}</div></div>
    <p class="note">${SIDES[CR.side].d}</p>
    <div class="card"><h4>타고난 몸 <small class="dim">근골 · ${st.pick}가지 중 하나</small></h4>
      <div class="choice">${CR.opts.map(i=>{const g=gl[i];return `<button type="button" class="opt" data-s="gg:${i}" aria-pressed="${CR.gg===i}" title="근력 ${g[1]} · 지구력 ${g[2]} · 민첩력 ${g[3]} · 본원진기 ${g[4]}"><b>${g[0]}</b><span>${ggTrait(g)}</span></button>`}).join('')}</div></div>
    ${typeof diffPickHtml==='function'?diffPickHtml():''}
    ${ACAD_OFF?`    <div class="card"><h4>처음 잡을 무기 <small class="dim">그 계열 화(火) 무공의 첫 초식 비급을 받는다</small></h4>
      <div class="choice">${CLS.map(c=>`<button type="button" class="opt" data-s="cls:${c}" aria-pressed="${CR.cls===c}"><b>${CLASS[c].n}</b><span>${CLASS[c].w} · ${CLASS[c].d}</span></button>`).join('')}</div></div>`:G.lives?`<div class="card"><h4>어디서 시작할까 <small class="dim">전생을 거친 몸이다</small></h4><div class="choice">
      <button type="button" class="opt" data-s="amode:skip" aria-pressed="${CR.amode==='skip'}"><b>무관 건너뛰기</b><span>병기·심법·보법만 골라 바로 강호에서 시작한다. 졸업 보상과 추천서는 없다.</span></button>
      <button type="button" class="opt" data-s="amode:acad" aria-pressed="${CR.amode==='acad'}"><b>${acadOf(CR.side).n}부터</b><span>무관 과제를 처음부터 한다.${(G.acadN||0)>0?' 전생에 졸업했으면 관주에게 월반 시험을 볼 수 있다.':''}</span></button></div></div>`
      :`<p class="note center">${acadOf(CR.side).n}에서 시작한다. 병기와 내공심법은 무관에서 직접 보고 고른다.</p>`}
    <div class="center">${!ACAD_OFF&&G.lives&&CR.amode==='skip'?'<button type="button" class="btn pri" data-s="skipacad" style="font-size:18px;padding:8px 26px">다음: 병기·심법·보법 고르기</button>'
      :`<button type="button" class="btn pri" data-s="start" style="font-size:18px;padding:8px 26px">${ACAD_OFF?'8세, 강호에 태어나다':`8세, ${acadOf(CR.side).n}에 들다`}</button>`}</div>`);
  const ni=$('nmi');if(ni)ni.addEventListener('input',()=>CR.name=ni.value);
}
// 무관 건너뛰기 창: 병기 하나, 진영의 하승 심법 넷 중 하나
function renderSkip(){
  box.innerHTML=josa(`<h2 class="title" style="font-size:40px">무관 건너뛰기</h2>
    <p class="note center">${acadOf(CR.side).n} 과제를 건너뛰고 바로 강호에서 시작한다. 병기·내공심법·보법을 고르자.</p>
    <div class="card"><h4>병기 <small class="dim">그 계열 화(火) 무공의 첫 초식 비급과 병기를 받는다</small></h4>
      <div class="choice">${CLS.map(c=>`<button type="button" class="opt" data-s="cls:${c}" aria-pressed="${CR.cls===c}"><b>${CLASS[c].n}</b><span>${CLASS[c].w} · ${CLASS[c].d}</span></button>`).join('')}</div></div>
    <div class="card"><h4>하승 내공심법 <small class="dim">하나만 고른다 · 나머지는 맹 총관에게서 맹 공적으로 배울 수 있다</small></h4>
      <div class="choice">${ACAD_SIM[CR.side].map(x=>{const m=SIM[x.id];return `<button type="button" class="opt" data-s="ssim:${x.id}" aria-pressed="${CR.sim===x.id}"><b>${m.n}</b><span>${m.sc} · ${m.el}${m.tr&&m.tr.length?' · '+simTraitTxt(m):''}</span></button>`}).join('')}</div></div>
    <div class="card"><h4>보법 <small class="dim">회피기 · 직선은 적을 뚫고 무조건 나가고, 간파는 상대 등 뒤로 돌지만 실패할 수 있다 · 경공은 기초 경공(1단)을 받는다</small></h4>
      <div class="choice">${ACAD_BOB.map(id=>{const b=BOBS[id];return `<button type="button" class="opt" data-s="sbob:${id}" aria-pressed="${CR.bob===id}"><b>${b.n}</b><span>${b.t==='line'?'직선':'간파'} · ${b.d}</span></button>`}).join('')}</div></div>
    <div class="center"><button type="button" class="btn" data-s="skipback">돌아가기</button><button type="button" class="btn pri" data-s="skipstart" style="font-size:18px;padding:8px 26px">8세, 강호에 나서다</button></div>`);
}
function beginLife(skip){
  const nm=(CR.name||'').trim()||rname();const heir=CR.heir;
  newLife({name:nm.slice(0,8),side:CR.side,gg:CR.gg,wis:CR.wis,status:CR.status,cls:ACAD_OFF||skip?CR.cls:null,bonusVit:G.bonusVit||0,silver:heir?G.heir.silver:0});
  if(skip&&!ACAD_OFF)acadSkipStart(CR.sim,CR.bob);
  if(heir){P.feats.push(`${G.lives}번째 생의 자식으로 가문을 이었다`)}else{G.house=null;G.storage={mats:{},bag:[]}}
  G.heir=null;G.bonusVit=0;G.bonusParts=null;G.wisCarry=0;G.board=null;
  allies=[];mobs=[];drops=[];projs=[];eprojs=[];fx=[];texts=[];sched=[];if(typeof pursueClear==='function')pursueClear();
  for(const b of builds.filter(b=>b.home)){for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)objs[j][i]=null}builds=builds.filter(b=>!b.home);
  if(G.house&&G.house.built)buildHouse();
  startPlay(true);
}
function startPlay(fresh){
  scrEl.hidden=true;playing=true;paused=false;lastYear=Math.floor(P.age);logEl.innerHTML='';
  if(fresh&&acadOn()){const A=acadOf(P.side);logQuiet(`${P.name}, ${STATUS[P.status].n}의 자식으로 태어나 여덟 살에 ${A.n}에 들었습니다. "${A.hello}"`,'sys');   // v219: 왼쪽 위는 두 줄만
    log(`관주에게 말을 걸고 왼쪽 위 과제를 따라 배우자.`,'info');
    log(TOUCH?'왼쪽 아래를 끌어 이동 · 사람 앞에서 행동 단추로 대화 · 더보기 → 조작법 참고':'땅 클릭 이동 · 사람을 눌러 대화 · F 행동 · 조작법 버튼 참고','info');showBanner(A.n,`${SIDES[P.side].n} · ${GEUNGOL[P.side][P.gg][0]}`)}
  else if(fresh){log(`${P.name}, ${STATUS[P.status].n}의 자식으로 개봉에서 태어났습니다.`,'sys');
    log(TOUCH?'아래 행낭 탭에서 비급을 읽어 첫 초식을 익히세요. 더보기 → 수련에서 기본기와 내공을 다질 수 있습니다.':'행낭(I)의 비급을 읽어 첫 초식을 익히세요. 수련(U) 창에서 기본기와 내공을 다질 수 있습니다.','info');
    log(TOUCH?'왼쪽 아래를 끌어 이동 · '+(atkAuto?'멈춰 서면 자동 공격':'공격 버튼으로 싸움')+' · 더보기 → 조작법 참고':'땅 클릭 이동 · 적 클릭 공격 · Q A Z E D C 초식 · S 필살기 · Space 도약 · F 행동 · 조작법 버튼 참고','info');showBanner(P.name,`${SIDES[P.side].n} · ${GEUNGOL[P.side][P.gg][0]}`)}
  else log(`${P.name}의 생을 이어갑니다. ${Math.floor(P.age)}세.`,'sys');
  // 새로 태어나면 개봉 성내에서, 이어 할 때는 마지막에 있던 곳에서 가장 가까운 성도에서 시작한다 (사용자 결정 2026-10-11)
  // 무관(g_academy.js)을 졸업하기 전에는 새 생도 이어 하기도 무관 본관에서
  const start=acadOn()?acadReg():fresh?'gaebong':nearestCapital(P.reg||'gaebong');
  if(REG!==start){mobs=[];drops=[];loadRegion(start)}P.reg=start;P.gateLock=0;
  const at=start==='gaebong'?{x:20.5,y:20.5}:arriveAt(start);P.x=at.x;P.y=at.y;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y-camDY();spawnTick();spawnTick();
  if(!fresh&&start!=='gaebong')log(`${REGIONS[start].name}에서 다시 길을 나섭니다.`,'sys');saveGame(true);
}
function showRebirth(e,cause){
  scrEl.hidden=false;const ns=STATUS[G.nextStatus];
  box.innerHTML=josa(`<h2 class="title" style="font-size:46px">${cause==='천수'?'천수를 다하다':cause==='좌화'?'좌화하다':'쓰러지다'}</h2>
   ${typeof lifeSum==='function'?lifeSum(e,cause):''}${typeof pastCard==='function'?pastCard():''}${e.arts.length?`<div class="card"><h4>익힌 무공</h4><p class="note">${e.arts.map(esc).join(', ')}</p></div>`:''}
   <div class="card"><h4>윤회의 수레바퀴</h4><p>업보에 따라 다음 생은 <b class="gold">${ns.n}</b>(으)로 태어난다. 보상 활력 <b class="gold">${G.bonusVit}</b> (다음 생에서 생일마다 다섯 번 나눠 받음)${G.bonusParts?` · 이번 생에 얻은 활력 ${G.bonusParts.earned}의 ${Math.round(G.bonusParts.share*100)}% ${G.bonusParts.fromVit} + 명성·선업·경지·나이 ${G.bonusParts.deed}`:''}${G.wisCarry?`, 선업으로 오성 +${G.wisCarry}`:''}.</p>
   <p>${G.heir?`자식 ${G.heir.children.map(c=>esc(c.name)).join(', ')}(으)로 이어 살 수 있다.`:'이어 살 자식이 없어 집과 창고는 남에게 넘어갔다.'} 이 생은 강호사에 기록되었다.</p></div>
   <div class="center"><button class="btn pri" type="button" data-s="rebirth">다시 태어나기</button></div>`);
}

// ================= input =================
const C=$('game');let ctx=C.getContext('2d');  // let: 문파 옷 미리보기가 잠시 바꿔 끼운다
const L=document.createElement('canvas'),lx=L.getContext('2d');
// 그리는 해상도는 화면 배율 2까지만 (사용자 2026-10-24 "게임이 자꾸 꺼져"): 배율 3 휴대폰에서 화면 크기 캔버스(본 화면·빛 겹·합성 사본) 한 장이 12MB씩이라
// 메모리가 모자라 웹뷰가 꺼질 수 있다. 2배면 한 장 5MB, 칠할 픽셀도 절반 아래로 준다
let DPR_MAX=2;   // 절전이면 1.5 (g_power.js)
let S_BASE=1,VW_PX=0,VH_PX=0;   // v219: 카메라 당김(g_read.js)이 S를 S_BASE×배율로 바꾼다
function resize(){const r=C.getBoundingClientRect(),d=Math.min(DPR_MAX,devicePixelRatio||1);S=Math.max(.8,Math.min(1.3,r.width/900));W=r.width/S;H=r.height/S;S_BASE=S;VW_PX=r.width;VH_PX=r.height;C.width=L.width=Math.round(r.width*d);C.height=L.height=Math.round(r.height*d)}
addEventListener('resize',resize);
function pickAt(ev){
  const r=C.getBoundingClientRect(),sx=(ev.clientX-r.left)/S,sy=(ev.clientY-r.top)/S;
  // pick by screen position against each thing's body (feet at p, body ~50px up)
  let best=null,bd=26;const test=(o,kind,h=34)=>{const p=toScreen(o.x,o.y),d=Math.hypot(p.x-sx,(p.y-h)-sy);if(d<bd){bd=d;best={kind,o}}};
  for(const n of npcsHere())test(n,'npc',n.board?20:36);for(const m of mobs)if(m.hp>0)test(m,m.d.villager||peaceful(m)?'vil':'mob',m.d.beast?14*m.d.size:36);
  if(best)return best;
  const g=toGrid(ev.clientX-r.left,ev.clientY-r.top);
  for(const n of nodes)if(Math.hypot(n.x-g.x,n.y-g.y)<.6&&(n.t!=='chest'||!P.chest))return{kind:'node',o:n,g};
  const pl=plots.find(p=>Math.floor(g.x)===p.x&&Math.floor(g.y)===p.y);if(pl)return{kind:'plot',o:pl,g};
  if(REG==='gaebong'&&G.house&&G.house.built){const l=LOTS[G.house.lot];if(g.x>=l.x-.3&&g.x<=l.x+l.w+.3&&g.y>=l.y-.3&&g.y<=l.y+l.h+.8)return{kind:'house',g}}
  return{kind:'ground',g};
}
C.addEventListener('contextmenu',e=>e.preventDefault());
C.addEventListener('pointerdown',ev=>{
  if(!playing||paused||P.hp<=0)return;const h=pickAt(ev);P.medit=false;P.goal=null;P.talk=null;
  if(ev.button===2){if(h.kind==='mob'&&h.o.d.beast)tame(h.o);return}
  if(h.kind==='mob'){P.target=h.o;P.repath=0;P.path=null;return}
  if(h.kind==='vil'){if(ev.shiftKey||forceAtk){P.target=h.o;P.repath=0;P.path=null}else if(typeof cvTalkTap==='function'&&cvTalkTap(h.o))return;else addText(h.o.x,h.o.y,h.o.d.villager?'양민':h.o.name,'#e8dcc0');return}
  P.target=null;
  const go=(x,y)=>{P.path=findPath(Math.floor(P.x),Math.floor(P.y),Math.floor(x),Math.floor(y))};
  if(h.kind==='npc'){if(forceAtk&&(typeof npcCanOut==='function'?npcCanOut(h.o):h.o.hq)){const e=typeof npcOut==='function'?npcOut(h.o):masterOut(h.o);if(e){P.target=e;P.repath=0;P.path=null;return}}if(dist(h.o,P)<1.7)openNpc(h.o);else{P.talk=h.o;go(h.o.x,h.o.y)}return}
  if(h.kind==='node'){const t={node:h.o};if(dist(h.o,P)<1.3)interact(t);else{P.goal={x:h.o.x,y:h.o.y,...t};go(h.o.x,h.o.y)}return}
  if(h.kind==='plot'){const c={x:h.o.x+.5,y:h.o.y+.5},t={plot:h.o};if(dist(c,P)<1.3)interact(t);else{P.goal={...c,...t};go(c.x,c.y)}return}
  if(h.kind==='house'){const d=houseDoor();if(dist(d,P)<1.4)openHouse();else{P.goal={x:d.x,y:d.y,house:1};go(d.x,d.y)}return}
  {const cr=C.getBoundingClientRect();if(roofTap(ev.clientX-cr.left,ev.clientY-cr.top))return}
  go(h.g.x,h.g.y);
});
const KEYF={KeyQ:0,KeyA:1,KeyZ:2,KeyE:3,KeyD:4,KeyC:5,Numpad7:0,Numpad4:1,Numpad1:2,Numpad9:3,Numpad6:4,Numpad3:5};
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();
  if(k==='escape'){closePanels();return}
  if(!playing)return;keys[k]=true;if(k.startsWith('arrow')||k===' '||k==='tab')e.preventDefault();
  const menu={KeyK:'char',KeyB:'arts',KeyI:'bag',KeyP:'ally',KeyL:'life',KeyH:'hist',KeyG:'world',KeyN:'story'}[e.code];
  if(menu){openPanel(menu);return}
  if(paused)return;
  if(e.code in KEYF){useForm(KEYF[e.code]);return}
  if(e.code==='KeyS'||e.code==='Numpad5'){ultimate();return}
  if(e.code==='Digit1')special('암기');else if(e.code==='Digit2')special('독공');else if(e.code==='Digit3')special('점혈');
  else if(e.code==='Digit4')useCon('금창약');else if(e.code==='Digit5')useCon('소환단');
  else if(e.code==='KeyV')shingong();else if(e.code==='Space')leap();else if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyW')bobeop();else if(e.code==='KeyR')toggleRun();else if(e.code==='KeyT')toggleForce();else if(e.code==='KeyX')meditate();
  else if(e.code==='KeyM')rideToggle();else if(e.code==='KeyF')useNearest();else if(e.code==='Tab')toggleMode();
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('blur',()=>keys={});

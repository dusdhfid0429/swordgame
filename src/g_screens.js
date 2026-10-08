// ================= title, 캐릭터 생성, 윤회 =================
const scrEl=$('scr'),box=$('scrbox');
function showTitle(){
  playing=false;paused=true;scrEl.hidden=false;const sv=loadGame();
  box.innerHTML=`<h1 class="title">강호윤회록</h1><p>신영웅문의 시스템을 옮긴 쿼터뷰 무협 · 태어나 늙고, 업보에 따라 다시 태어난다</p>
   <div class="center">${sv&&sv.alive?'<button class="btn pri" data-s="cont" type="button">이어하기</button>':''}<button class="btn${sv&&sv.alive?'':' pri'}" data-s="new" type="button">${sv&&sv.G&&sv.G.lives?'다음 생 시작':'새 인생'}</button>${sv&&sv.G&&sv.G.history&&sv.G.history.length?'<button class="btn" data-s="hist" type="button">강호사</button>':''}</div>
   <div class="card">${pHelp()}</div>
   <p class="note" style="text-align:center">진행은 이 브라우저에 30초마다, 그리고 객잔·집에서 쉴 때 기록된다. 그림은 모두 코드로 그렸고 주인공 스프라이트는 사용자가 준 그림이다.</p>`;
}
box.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b||b.disabled)return;const s=b.dataset.s;
  if(s==='cont'){const sv=loadGame();if(applySave(sv)){startPlay(false)}else showCreate()}
  else if(s==='new'){const sv=loadGame();if(sv&&sv.G){G=Object.assign(G,sv.G);if(sv.alive){G.nextStatus=G.nextStatus??1}}showCreate()}
  else if(s==='hist'){const sv=loadGame();if(sv)G=Object.assign(G,sv.G);box.innerHTML=`<h2 class="title" style="font-size:40px">강호사</h2>${pHist()}<div class="center"><button class="btn" data-s="back" type="button">돌아가기</button></div>`}
  else if(s==='back')showTitle();
  else if(s.startsWith('side:')){CR.side=s.slice(5);CR.opts=rollGG(CR.side);CR.gg=CR.opts[0];renderCreate()}
  else if(s.startsWith('gg:')){CR.gg=+s.slice(3);renderCreate()}
  else if(s.startsWith('cls:')){CR.cls=s.slice(4);renderCreate()}
  else if(s.startsWith('heir:')){const c=G.heir.children[+s.slice(5)];CR.heir=c;CR.name=c.name;CR.status=Math.max(G.nextStatus??1,2);CR.side=G.heir.side;CR.opts=rollGG(CR.side);CR.gg=CR.opts[0];renderCreate()}
  else if(s==='noheir'){CR.heir=null;CR.status=G.nextStatus??1;renderCreate()}
  else if(s==='start')beginLife();
  else if(s==='rebirth')showCreate();
});
let CR=null;
const NAMES1=['이','김','장','왕','유','진','한','백','남궁','제갈','모용','당','팽','소','위','곽'],NAMES2=['청','운','설','무','연','휘','결','현','진','하','린','호','강','월','영','도'];
const rname=()=>pick(NAMES1)+pick(NAMES2)+(Math.random()<.6?pick(NAMES2):'');
function rollGG(side){const n=STATUS[G.nextStatus??1].pick,idx=GEUNGOL[side].map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}return idx.slice(0,n).sort((a,b)=>a-b)}
function showCreate(){
  scrEl.hidden=false;playing=false;paused=true;const st=G.nextStatus??1;
  CR={name:rname(),side:'정',cls:'검',status:st,wis:Math.min(10,R1(3,7)+STATUS[st].wis+(G.wisCarry||0)),heir:null};CR.opts=rollGG('정');CR.gg=CR.opts[0];renderCreate();
}
function renderCreate(){
  const st=STATUS[CR.status],gl=GEUNGOL[CR.side];
  const heir=G.heir&&G.heir.children.length?`<div class="card"><h4>대물림</h4><p>전생의 자식으로 이어 살면 집과 창고, 은자 ${G.heir.silver}을(를) 물려받는다. 계열은 부모를 따른다.</p>
    <div class="center">${G.heir.children.map((c,i)=>`<button type="button" class="opt" data-s="heir:${i}" aria-pressed="${CR.heir===c}"><b>${esc(c.name)}</b><span>${c.age}세</span></button>`).join('')}<button type="button" class="opt" data-s="noheir" aria-pressed="${!CR.heir}"><b>남으로 태어나기</b><span>가문을 잇지 않는다</span></button></div></div>`:'';
  box.innerHTML=josa(`<h2 class="title" style="font-size:44px">${G.lives?`제${G.lives+1}생`:'탄생'}</h2>
    <div class="card"><div class="row2"><h3>신분 · ${st.n}</h3><span class="tag">오성 ${CR.wis}${G.wisCarry?` (전생의 선업 +${G.wisCarry})`:''} · 시작 활력 ${st.vit} · 은자 ${st.silver+(CR.heir?G.heir.silver:0)}</span></div><p>${CR.heir?'가문을 이어 무가 이상으로 태어난다. ':''}${st.d}${G.bonusVit?` 전생의 보상 활력 ${G.bonusVit}은(는) 다섯 몫으로 나뉘어 생일마다 ${Math.ceil(G.bonusVit/5)}씩 받는다.`:''} 근골과 오성은 타고나는 값이라 기연이나 윤회로만 오른다.</p></div>
    ${heir}
    <div class="row2"><label style="display:flex;gap:8px;align-items:center;font-family:var(--display);font-size:18px">이름 <input class="name" id="nmi" maxlength="8" value="${esc(CR.name)}"${CR.heir?' disabled':''}></label>
      <div class="center">${['정','사'].map(s=>`<button type="button" class="opt" data-s="side:${s}" aria-pressed="${CR.side===s}"${CR.heir?' disabled':''}><b>${SIDES[s].n}</b><span>기초 내공 ${SIDES[s].base}</span></button>`).join('')}</div></div>
    <p class="note">${SIDES[CR.side].d}</p>
    <div class="card"><h4>근골 <small class="dim">${st.n}은(는) ${st.pick}가지 중에서 고른다 · 근력/지구력/민첩력/본원진기, 합 32</small></h4>
      <div class="choice">${CR.opts.map(i=>{const g=gl[i];return `<button type="button" class="opt" data-s="gg:${i}" aria-pressed="${CR.gg===i}"><b>${g[0]}</b><span class="num">${g[1]} / ${g[2]} / ${g[3]} / ${g[4]}</span>${g[5]?'':'<span class="dim">창작 근골</span>'}</button>`}).join('')}</div></div>
    <div class="card"><h4>처음 잡을 무기 <small class="dim">그 계열 화(火) 무공의 첫 초식 비급을 받는다</small></h4>
      <div class="choice">${CLS.map(c=>`<button type="button" class="opt" data-s="cls:${c}" aria-pressed="${CR.cls===c}"><b>${CLASS[c].n}</b><span>${CLASS[c].w} · ${CLASS[c].d}</span></button>`).join('')}</div></div>
    <div class="center"><button type="button" class="btn pri" data-s="start" style="font-size:18px;padding:8px 26px">13세, 강호에 태어나다</button></div>`);
  const ni=$('nmi');if(ni)ni.addEventListener('input',()=>CR.name=ni.value);
}
function beginLife(){
  const nm=(CR.name||'').trim()||rname();const heir=CR.heir;
  newLife({name:nm.slice(0,8),side:CR.side,gg:CR.gg,wis:CR.wis,status:CR.status,cls:CR.cls,bonusVit:G.bonusVit||0,silver:heir?G.heir.silver:0});
  if(heir){P.feats.push(`${G.lives}번째 생의 자식으로 가문을 이었다`)}else{G.house=null;G.storage={mats:{},bag:[]}}
  G.heir=null;G.bonusVit=0;G.wisCarry=0;G.board=null;
  allies=[];mobs=[];drops=[];projs=[];eprojs=[];fx=[];texts=[];sched=[];
  for(const b of builds.filter(b=>b.home)){for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)objs[j][i]=null}builds=builds.filter(b=>!b.home);
  if(G.house&&G.house.built)buildHouse();
  startPlay(true);
}
function startPlay(fresh){
  scrEl.hidden=true;playing=true;paused=false;lastYear=Math.floor(P.age);logEl.innerHTML='';
  if(fresh){log(`${P.name}, ${STATUS[P.status].n}의 자식으로 개봉에서 태어났습니다.`,'sys');
    log(TOUCH?'☰ 메뉴 → 행낭에서 비급을 읽어 첫 초식을 익히세요. 18세 전에는 인물에서 기본기를 다질 수 있습니다.':'행낭(I)의 비급을 읽어 첫 초식을 익히세요. 유아기(18세 전)에는 인물(K)에서 기본기를 다질 수 있습니다.','info');
    log(TOUCH?'왼쪽 아래를 끌어 이동 · 공격 버튼으로 싸움 · ☰ 메뉴의 조작법 참고':'땅 클릭 이동 · 적 클릭 공격 · Q A Z E D C 초식 · S 필살기 · Space 도약 · F 행동 · 조작법 버튼 참고','info');showBanner(P.name,`${SIDES[P.side].n} · ${GEUNGOL[P.side][P.gg][0]}`)}
  else log(`${P.name}의 생을 이어갑니다. ${Math.floor(P.age)}세.`,'sys');
  P.x=20.5;P.y=20.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;spawnTick();spawnTick();saveGame(true);
}
function showRebirth(e,cause){
  scrEl.hidden=false;const ns=STATUS[G.nextStatus];
  box.innerHTML=josa(`<h2 class="title" style="font-size:46px">${cause==='천수'?'천수를 다하다':'쓰러지다'}</h2>
   <div class="card"><h3>${esc(e.name)} · ${e.age}세</h3><p>${e.status} · ${e.side==='정'?'정파':'사파'} · ${e.gg} · 경지 ${e.realm}</p>
   <p>선업 <span class="good">${e.good}</span> · 악업 <span class="bad">${e.evil}</span> · 명성 ${e.fame} · 처치 ${e.kills}</p>${e.arts.length?`<p>${e.arts.map(esc).join(', ')}</p>`:''}${e.feats.length?`<p>${e.feats.map(esc).join(' · ')}</p>`:''}</div>
   <div class="card"><h4>윤회의 수레바퀴</h4><p>업보에 따라 다음 생은 <b class="gold">${ns.n}</b>(으)로 태어난다. 보상 활력 <b class="gold">${G.bonusVit}</b> (다음 생에서 생일마다 다섯 번 나눠 받음)${G.wisCarry?`, 선업으로 오성 +${G.wisCarry}`:''}.</p>
   <p>${G.heir?`자식 ${G.heir.children.map(c=>esc(c.name)).join(', ')}(으)로 이어 살 수 있다.`:'이어 살 자식이 없어 집과 창고는 남에게 넘어갔다.'} 이 생은 강호사에 기록되었다.</p></div>
   <div class="center"><button class="btn pri" type="button" data-s="rebirth">다시 태어나기</button></div>`);
}

// ================= input =================
const C=$('game'),ctx=C.getContext('2d');const L=document.createElement('canvas'),lx=L.getContext('2d');
function resize(){const r=C.getBoundingClientRect();S=Math.max(.8,Math.min(1.3,r.width/900));W=r.width/S;H=r.height/S;C.width=L.width=r.width*devicePixelRatio;C.height=L.height=r.height*devicePixelRatio}
addEventListener('resize',resize);
function pickAt(ev){
  const r=C.getBoundingClientRect(),sx=(ev.clientX-r.left)/S,sy=(ev.clientY-r.top)/S;
  // pick by screen position against each thing's body (feet at p, body ~50px up)
  let best=null,bd=26;const test=(o,kind,h=34)=>{const p=toScreen(o.x,o.y),d=Math.hypot(p.x-sx,(p.y-h)-sy);if(d<bd){bd=d;best={kind,o}}};
  for(const n of NPCS)test(n,'npc',n.board?20:36);for(const m of mobs)if(m.hp>0)test(m,m.d.villager?'vil':'mob',m.d.beast?14*m.d.size:36);
  if(best)return best;
  const g=toGrid(ev.clientX-r.left,ev.clientY-r.top);
  for(const n of nodes)if(Math.hypot(n.x-g.x,n.y-g.y)<.6&&(n.t!=='chest'||!P.chest))return{kind:'node',o:n,g};
  const pl=plots.find(p=>Math.floor(g.x)===p.x&&Math.floor(g.y)===p.y);if(pl)return{kind:'plot',o:pl,g};
  if(G.house&&G.house.built){const l=LOTS[G.house.lot];if(g.x>=l.x-.3&&g.x<=l.x+l.w+.3&&g.y>=l.y-.3&&g.y<=l.y+l.h+.8)return{kind:'house',g}}
  return{kind:'ground',g};
}
C.addEventListener('contextmenu',e=>e.preventDefault());
C.addEventListener('pointerdown',ev=>{
  if(!playing||paused||P.hp<=0)return;const h=pickAt(ev);P.medit=false;P.goal=null;P.talk=null;
  if(ev.button===2){if(h.kind==='mob'&&h.o.d.beast)tame(h.o);return}
  if(h.kind==='mob'){P.target=h.o;P.repath=0;P.path=null;return}
  if(h.kind==='vil'){if(ev.shiftKey){P.target=h.o;P.repath=0;P.path=null}else addText(h.o.x,h.o.y,'양민','#e8dcc0');return}
  P.target=null;
  const go=(x,y)=>{P.path=findPath(Math.floor(P.x),Math.floor(P.y),Math.floor(x),Math.floor(y))};
  if(h.kind==='npc'){if(dist(h.o,P)<1.7)openNpc(h.o);else{P.talk=h.o;go(h.o.x,h.o.y)}return}
  if(h.kind==='node'){const t={node:h.o};if(dist(h.o,P)<1.3)interact(t);else{P.goal={x:h.o.x,y:h.o.y,...t};go(h.o.x,h.o.y)}return}
  if(h.kind==='plot'){const c={x:h.o.x+.5,y:h.o.y+.5},t={plot:h.o};if(dist(c,P)<1.3)interact(t);else{P.goal={...c,...t};go(c.x,c.y)}return}
  if(h.kind==='house'){const d=houseDoor();if(dist(d,P)<1.4)openHouse();else{P.goal={x:d.x,y:d.y,house:1};go(d.x,d.y)}return}
  go(h.g.x,h.g.y);
});
const KEYF={KeyQ:0,KeyA:1,KeyZ:2,KeyE:3,KeyD:4,KeyC:5,Numpad7:0,Numpad4:1,Numpad1:2,Numpad9:3,Numpad6:4,Numpad3:5};
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();
  if(k==='escape'){closePanels();return}
  if(!playing)return;keys[k]=true;if(k.startsWith('arrow')||k===' '||k==='tab')e.preventDefault();
  const menu={KeyK:'char',KeyB:'arts',KeyI:'bag',KeyP:'ally',KeyL:'life',KeyH:'hist'}[e.code];
  if(menu){openPanel(menu);return}
  if(paused)return;
  if(e.code in KEYF){useForm(KEYF[e.code]);return}
  if(e.code==='KeyS'||e.code==='Numpad5'){ultimate();return}
  if(e.code==='Digit1')special('암기');else if(e.code==='Digit2')special('독공');else if(e.code==='Digit3')special('점혈');
  else if(e.code==='Digit4')useCon('금창약');else if(e.code==='Digit5')useCon('소환단');
  else if(e.code==='KeyV')shingong();else if(e.code==='Space')leap();else if(e.code==='KeyR')toggleRun();else if(e.code==='KeyX')meditate();
  else if(e.code==='KeyM')rideToggle();else if(e.code==='KeyF')useNearest();else if(e.code==='Tab')toggleMode();
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('blur',()=>keys={});

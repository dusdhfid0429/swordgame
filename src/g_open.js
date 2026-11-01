// ================= 첫 30분: 창 단계별 열기 · 창 첫 줄 '지금 할 일' · 초식 이름 외치기 (v222, 개선 계획 3절 · 동훈님 2026-11-01) =================
// 아직 쓸 일이 없는 칸은 감추고 처음 쓸 일이 생기면 연다 (OPEN, 한 번 열리면 P.opened에 남는다).
//  mk 무공 창 '창안 재료' (g_mkmat gsHtml) · mu 인물 창 깨달음·몸의 변화 (g_realmfx realmCardExtra)
//  탭바 둘째 쪽(동료·생활·정세)은 쓸 일이 생길 때까지 흐리게 둔다 (눌러지기는 한다).
// 창 맨 위에는 지금 할 일 하나만 크게 (todoOf). 초식 이름 외치기 callout(n,by)는 무관 첫 대련과 4·5절 연출이 같이 쓴다.
// 수치·문구는 data/open.json (OPEN, CALLOUT)
const OPEN=GD.OPEN,CALLOUT=GD.CALLOUT;
const OPEN_IF={
  mk:()=>Object.keys(P.gs||{}).length>0||P.bag.some(i=>i.slot==='leaf'||i.slot==='wbook'||i.tu)||!!(G.rcMet&&Object.keys(G.rcMet).length)||Object.keys(G.made||{}).length>0,
  mu:()=>P.wallN!=null||realmIdx()>=1||(P.enl||0)>0};
// 열렸는지. 처음 열리는 순간에만 알림 한 줄
function openOf(k){if(!P)return false;P.opened=P.opened||{};if(P.opened[k])return true;if(!OPEN_IF[k]||!OPEN_IF[k]())return false;
  P.opened[k]=1;if(OPEN[k]&&OPEN[k].log&&playing)log(OPEN[k].log,'info');return true}
// 탭바 둘째 쪽: 쓸 일이 생길 때까지 흐리게
const TAB_LIT={ally:()=>allies.length>0||!!P.sect||!!P.maeng,life:()=>!acadOn()||P.acad.stage>=3,story:()=>!acadOn()};
let openT=0;
hook('tick',dt=>{if(!P||!playing||(openT-=dt)>0)return;openT=.5;for(const k of Object.keys(OPEN_IF))openOf(k);
  if(typeof TBAR==='undefined')return;for(const[k,f]of Object.entries(TAB_LIT)){const b=document.getElementById('tb_'+k);if(b)b.classList.toggle('dim',!f())}});

// ---- 창 첫 줄: 지금 할 일 하나 ----
const unreadBook=()=>P.bag.find(it=>it.slot==='book'&&!readBlock(it));
function todoOf(p){
  if(p==='char'||p==='train'){
    if(typeof atWall==='function'&&atWall())return{t:'벽에 닿았다. 수련 창의 폐관 수련으로 경지를 넘는다.',b:['trainwin','수련 창']};
    const c=Math.min(...STATS.map(s=>statCost(s.k)));if(P.vit>=c)return{t:`활력 ${P.vit}이 있다. 수련 창에서 기본기와 내공을 다진다.`,b:['trainwin','수련 창']}}
  if(p==='arts'||p==='bag'){const b=unreadBook();if(b)return{t:`[${(ARTS[b.art]||{}).n||b.name}] 비급을 읽어 초식을 익힌다.`,b:['tread:'+b.id,'읽기']}}
  if(p==='quest'){const q=P.quests.find(q=>questProg(q).done);if(q)return{t:`[${q.n}]을(를) 마쳤다. 맡긴 사람에게 보고하러 간다.`}
    if(acadOn()){const g=acadCur();if(g)return{t:`무관 과제: ${g.n}`}}
    if(!P.quests.length)return{t:'객잔·관아·문파에서 임무를 맡아 강호의 일을 해 본다.'}}
  return null}
function todoHtml(p){const d=todoOf(p);if(!d)return'';return `<div class="${GD.TODO.cls}"><b>▶</b><span>${esc(d.t)}</span>${d.b?B(d.b[0],d.b[1],{pri:1}):''}</div>`}
hook('panelDrawn',p=>{const w=$('wbody');if(!w||w.querySelector('.todo'))return;const h=todoHtml(p);if(h)w.insertAdjacentHTML('afterbegin',josa(h))});

// ---- 초식 이름 외치기 ----
// 화면이 잠깐 어두워지고 붓글씨 이름이 크게 지나간다. 같은 사람이 CALLOUT.gap초 안에 또 외치면 건너뛴다
const calloutAt={};
function callout(n,by){if(!n||typeof document==='undefined')return false;const k=by||'_';if(calloutAt[k]&&time-calloutAt[k]<CALLOUT.gap)return false;calloutAt[k]=time;
  let el=document.getElementById('callout');if(!el){el=document.createElement('div');el.id='callout';el.setAttribute('aria-live','polite');$('app').appendChild(el)}
  el.innerHTML=`<i></i><b>${esc(n)}</b>${by?`<small>${esc(by)}</small>`:''}`;el.style.setProperty('--cd',CALLOUT.dur+'s');el.style.setProperty('--cdim',CALLOUT.dim);
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),CALLOUT.dur*1000);return true}

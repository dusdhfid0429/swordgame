// ================= 터치 조작 (모바일) =================
// 왼쪽 아래를 끌면 이동, 오른쪽 아래 공격을 중심으로 한 부채꼴(보법·필살·경공·비기·상황)로 싸운다. 원신·명조식 배치 (사용자 선택 2026-10-13, B안).
// 켜고 끄는 것(질주·강제공격·운기·승마)은 오른쪽 가장자리 세로 열의 네모 단추, 약·비도는 퀵슬롯 줄(세로 화면은 왼쪽 아래 모퉁이, 가로 화면은 아래 가운데). ☰ 하나에 창을 모두 모았다.
// 터치에서는 늘 자동초식이라 초식은 공격 버튼 하나가 차례로 잇는다.
var TOUCH=false,joy={on:false,gx:0,gy:0,m:0},touchAtk=false;
const TUI=document.createElement('div');TUI.id='tui';
TUI.innerHTML=`<div id="joyz"><div id="joy"><i id="joyk"></i></div></div>
  <button type="button" id="tmenu" aria-label="메뉴">☰</button>
  <div id="tbtns">
    <button type="button" class="tb big" id="t_atk"><span>공격</span><i class="cd"></i></button>
    <button type="button" class="tb" id="t_ult"><span>필살</span><i class="cd"></i></button>
    <button type="button" class="tb" id="t_leap"><span>경공</span><i class="cd"></i></button>
    <button type="button" class="tb" id="t_step"><span>보법</span><i class="cd"></i></button>
    <button type="button" class="tb" id="t_spec"><span>비기</span><i class="cd"></i></button>
    <button type="button" class="tb ctx" id="t_ctx"><span></span></button>
  </div>
  <div id="tquick">
    <button type="button" class="tq" id="t_run">질주</button>
    <button type="button" class="tq" id="t_force">강제</button>
    <button type="button" class="tq" id="t_med" hidden>운기</button>
    <button type="button" class="tq" id="t_ride" hidden>승마</button>
  </div>
  <div id="tslots">
    <button type="button" class="ts" id="ts_gc"><span>금창약</span><em></em></button>
    <button type="button" class="ts" id="ts_sh"><span>소환단</span><em></em></button>
    <button type="button" class="ts" id="ts_bd" hidden><span>비도</span><em></em><i class="cd"></i></button>
  </div>`;
$('stage').insertBefore(TUI,$('win'));
const statusEl=document.querySelector('.status'),panelEl=document.querySelector('.panel');
function setTouch(on){
  TOUCH=on;document.body.classList.toggle('touch',on);
  if(on){TUI.prepend(logEl);TUI.prepend(statusEl)}else{panelEl.prepend(logEl);panelEl.prepend(statusEl)}
  try{STORE.set('ganghoyunhoe-ctl',on?'t':'k',1)}catch(e){}
  joy.on=false;joy.m=0;touchAtk=false;resize();logTop();
}
// v113 (사용자: 로그 창이 플레이어 정보창을 덮는다): 상태 상자(마성 게이지·두 줄 자원)가 커져도 로그는 늘 그 아래에
function logTop(){if(!TOUCH)return;const b=statusEl.getBoundingClientRect(),st=$('stage').getBoundingClientRect();document.documentElement.style.setProperty('--log-top',Math.round(b.bottom-st.top+5)+'px')}
if(window.ResizeObserver)new ResizeObserver(()=>logTop()).observe(statusEl);
// 화면 방향 (dx,dy) → 격자 방향. 쿼터뷰라 화면 위쪽은 격자 (-1,-1).
function joyDir(dx,dy){const gx=dx/TW+dy/TH,gy=dy/TH-dx/TW,l=Math.hypot(gx,gy)||1;joy.gx=gx/l;joy.gy=gy/l}
{const z=$('joyz'),base=$('joy'),knob=$('joyk'),R=50;let id=null,sx=0,sy=0,t0=0,moved=0;
  const home=()=>{base.style.left='';base.style.top='';base.classList.remove('on');knob.style.transform=''};
  z.addEventListener('pointerdown',e=>{if(!playing||paused||id!==null)return;e.preventDefault();id=e.pointerId;z.setPointerCapture(id);
    const r=z.getBoundingClientRect();sx=e.clientX;sy=e.clientY;t0=performance.now();moved=0;
    base.style.left=(sx-r.left)+'px';base.style.top=(sy-r.top)+'px';base.classList.add('on')});
  z.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;let dx=e.clientX-sx,dy=e.clientY-sy;const l=Math.hypot(dx,dy);moved=Math.max(moved,l);
    if(l>R){dx*=R/l;dy*=R/l}knob.style.transform=`translate(${dx}px,${dy}px)`;
    joy.m=Math.min(1,l/R);if(l>8){joyDir(dx,dy);joy.on=true}});
  const up=e=>{if(e.pointerId!==id)return;id=null;joy.on=false;joy.m=0;home();
    // 짧게 톡 친 것은 그 자리 클릭으로 넘긴다 (사람·채집물·적 고르기)
    if(e.type==='pointerup'&&moved<10&&performance.now()-t0<300)C.dispatchEvent(new PointerEvent('pointerdown',{clientX:e.clientX,clientY:e.clientY,button:0,bubbles:true}))};
  z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);}
// 공격: 누르면 가장 가까운 적을 잡아 자동초식으로 싸운다. 누르고 있으면 쓰러뜨린 뒤 다음 적으로 넘어간다.
function touchTarget(){if(P.target&&P.target.hp>0&&dist(P.target,P)<10)return true;let e=nearest(8);if(!e&&forceAtk){const t=nearestThing(6);if(t&&t.npc&&(typeof npcCanOut==='function'?npcCanOut(t.npc):t.npc.hq))e=typeof npcOut==='function'?npcOut(t.npc):masterOut(t.npc)}if(e){P.target=e;P.repath=0;P.path=null;P.medit=false;return true}return false}
function hold(id,down,upf){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!playing||paused)return;b.classList.add('press');down()});
  const u=()=>{b.classList.remove('press');if(upf)upf()};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('pointerleave',u)}
hold('t_atk',()=>{touchAtk=true;if(!touchTarget())log('가까이 싸울 상대가 없습니다.','info')},()=>{touchAtk=false});
hold('t_ult',()=>ultimate());
hold('t_leap',()=>leap());
hold('t_step',()=>bobeop());
hold('t_spec',()=>{const k=specPick();if(k==='신공')shingong();else if(k)special(k);else log(specMsg(),'info')});
hold('ts_gc',()=>{if(P.mats.금창약>0)useCon('금창약');else log('금창약이 없습니다. 약방에서 사거나 만드세요.','info')});
hold('ts_sh',()=>{if(P.mats.소환단>0)useCon('소환단');else log('소환단이 없습니다. 약방에서 사거나 만드세요.','info')});
hold('ts_bd',()=>special('암기'));
hold('t_ctx',()=>{const c=ctxPick();if(c)c.fn()});
// 빠른 버튼 (사용자 요청 2026-10-13 "질주·탈것 등은 HUD 버튼으로"): 질주 켜고 끄기, 말 타고 내리기(말이 곁에 있거나 탔을 때만), 운기조식(싸움 중이 아닐 때만)
hold('t_run',()=>toggleRun());hold('t_force',()=>toggleForce());hold('t_ride',()=>rideToggle());hold('t_med',()=>meditate());
$('tmenu').addEventListener('click',()=>{if(playing)openPanel('menu')});
// 비기: 지금 쓸 수 있는 특수무공·신공 중 하나를 알아서 고른다
function sgReady(){return P.sg.name&&realmIdx()>=5&&P.fame>=200&&P.scd.신공<=0}
function specPick(){
  if(sgReady()&&inCombat())return'신공';
  const e=P.target&&P.target.hp>0?P.target:nearest(7);
  if(P.sp.점혈&&P.scd.점혈<=0&&P.qi>=SPEC.점혈.qi&&e&&dist(e,P)<2.6)return'점혈';
  if(P.sp.독공&&P.scd.독공<=0&&P.qi>=SPEC.독공.qi&&e)return'독공';
  return null}   // 암기(비도)는 퀵슬롯 칸이 따로 있어 여기서는 고르지 않는다
function specMsg(){return P.sg.name||P.sp.독공||P.sp.점혈?'지금 쓸 수 있는 비기가 없습니다.':'특수무공을 아직 익히지 못했습니다. 잡화상에서 비급을 구하세요.'}
function potPick(){const a=P.mats.금창약>0,b=P.mats.소환단>0;if(!a&&!b)return null;if(a&&b)return P.hp/P.maxHp<=P.qi/P.maxQi?'금창약':'소환단';return a?'금창약':'소환단'}
// 상황 버튼: 가까이 있는 것에 맞춰 대화·채집·농사·집·길들이기·말·운기로 바뀐다
const NODEL={herb:'채집',ore:'채광',wood:'벌목',fish:'낚시',chest:'열기',corpse:'뒤지기',rubble:'뒤지기',vault:'금고'};
function ctxPick(){
  if(P.perch)return{l:'내려가기',fn:()=>perchDrop()};
  const t=nearestThing();
  if(t){if(t.npc)return{l:'대화',fn:()=>openNpc(t.npc)};if(t.house)return{l:'집',fn:openHouse};if(t.spouse)return{l:'가족',fn:familyTalk};
    if(t.plot)return{l:'농사',fn:()=>interact(t)};return{l:NODEL[t.node.t]||'행동',fn:()=>interact(t)}}
  const b=P.target&&P.target.hp>0&&P.target.d.beast&&P.target.d.tame&&dist(P.target,P)<3.2?P.target:null;
  if(b)return{l:'길들이기',fn:()=>tame(b)};
  return null}   // 승마·하마·운기는 빠른 버튼(t_ride·t_med)으로 옮겼다
let ctxT=0,ctxNow=null;   // 상황 버튼은 프레임 수가 아니라 실제 시간 0.15초마다 고른다 (느린 기기에서 늦게 뜨던 것)
function touchHud(){
  if(P.mode!=='auto')P.mode='auto';
  if(touchAtk&&!paused&&!joy.on)touchTarget();
  const a=art(),cd=(id,v)=>$(id).querySelector('.cd').style.height=clamp(v,0,1)*100+'%';
  const u=$('t_ult');u.classList.toggle('off',!allLearned(a.id));u.querySelector('span').textContent=allLearned(a.id)?a.ult.n.slice(0,4):'필살';cd('t_ult',P.ucd/8);
  $('t_leap').classList.toggle('off',P.qi<ggQi(ggNext()));cd('t_leap',P.leap&&ggNext()===1?1:0);
  {const b=bobOf();$('t_step').classList.toggle('off',P.qi<BG.qi[b.g]);$('t_step').querySelector('span').textContent=b.n.length<=3?b.n:'보법';cd('t_step',0)}
  const hasSp=P.sg.name||P.sp.독공||P.sp.점혈,k=hasSp?specPick():null;
  $('t_spec').hidden=!hasSp;$('t_spec').querySelector('span').textContent=k||'비기';$('t_spec').classList.toggle('off',!k);
  // 퀵슬롯: 금창약·소환단은 수량, 비도는 암기를 익혔을 때만 (수량·식는 시간)
  for(const[id,k]of[['ts_gc','금창약'],['ts_sh','소환단']]){const b=$(id);b.querySelector('em').textContent=P.mats[k]||0;b.classList.toggle('off',!(P.mats[k]>0))}
  {const b=$('ts_bd');b.hidden=!P.sp.암기;if(P.sp.암기){b.querySelector('em').textContent=P.mats.비도||0;b.classList.toggle('off',!(P.mats.비도>0)||P.scd.암기>0||P.qi<SPEC.암기.qi);cd('ts_bd',P.scd.암기/SPEC.암기.cd)}}
  $('t_atk').classList.toggle('on',!!(P.target&&P.target.hp>0));
  {const now=performance.now();if(now-ctxT>=150){ctxT=now;ctxNow=ctxPick();const c=$('t_ctx');c.hidden=!ctxNow;if(ctxNow)c.querySelector('span').textContent=ctxNow.l;
    $('t_run').classList.toggle('on',!!P.run);$('t_force').classList.toggle('on',forceAtk);
    const horse=P.ride||allies.some(a=>a.d&&a.d.ride&&a.hp>0&&dist(a,P)<3);$('t_ride').hidden=!horse;$('t_ride').textContent=P.ride?'하마':'승마';$('t_ride').classList.toggle('on',!!P.ride);
    const med=P.medit||(!inCombat()&&!P.ride&&(P.qi<P.maxQi||P.hp<P.maxHp||(typeof isMa==='function'&&isMa()&&P.mara>0)||(typeof acadCurK==='function'&&acadCurK()==='medit')));   /* v136: 무관 운기 과제 중이면 내공이 가득해도 보인다 */   /* v130 (사용자): 마성이 쌓여 있어도 운기 단추를 보인다 (운기조식이 마성을 내린다) */$('t_med').hidden=!med;$('t_med').classList.toggle('on',!!P.medit)}}
}
function pMenu(){
  const M=(a,l,s)=>`<button type="button" class="btn mbtn" data-act="${a}"><b>${l}</b><small>${s}</small></button>`;
  // 창 목록만 (사용자 요청 2026-10-13: 중복 빼고, 질주·말·운기 같은 동작은 HUD 빠른 버튼으로). 설정은 아래 한 줄.
  return `<div class="mgrid">${M('open:char','인물','능력치 · 문파 · 업보')}${M('open:arts','무공','무공 · 초식 · 심법')}${M('open:bag','행낭','장비 · 비급 읽기')}
    ${M('open:ally','동료','짐승 · 제자 · 가족')}${M('open:life','생활','직업 · 제작 · 농사')}${M('open:quest','임무','맡은 임무 상세')}
    ${M('open:story','정세','천하대전 · 사건')}${M('open:hist','강호사','지난 생들')}${M('open:world','천하 지도','성과 문파 본산')}${M('trainwin','수련','기본기 · 내공 심법')}</div>
    <div class="row2" style="margin-top:4px"><span class="note">설정 · 30초마다 저절로 기록된다</span><span>${B('save','기록')} ${B('open:help','조작법')} ${B('ctl:k','PC 조작으로')}</span></div>`;
}
let pref=null;try{pref=STORE.get('ganghoyunhoe-ctl')}catch(e){}
setTouch(pref?pref==='t':/[?#&]touch/.test(location.href)||matchMedia('(pointer:coarse)').matches);

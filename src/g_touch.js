// ================= 터치 조작 (모바일) =================
// 왼쪽 아래를 끌면 이동, 오른쪽 아래 버튼 여섯 개로 싸우고, ☰ 하나에 창을 모두 모았다.
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
    <button type="button" class="tb" id="t_pot"><span>약</span><em></em></button>
    <button type="button" class="tb ctx" id="t_ctx"><span></span></button>
  </div>`;
$('stage').insertBefore(TUI,$('win'));
const statusEl=document.querySelector('.status'),panelEl=document.querySelector('.panel');
function setTouch(on){
  TOUCH=on;document.body.classList.toggle('touch',on);
  if(on){TUI.prepend(logEl);TUI.prepend(statusEl)}else{panelEl.prepend(logEl);panelEl.prepend(statusEl)}
  try{localStorage.setItem('ganghoyunhoe-ctl',on?'t':'k')}catch(e){}
  joy.on=false;joy.m=0;touchAtk=false;resize();
}
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
function touchTarget(){if(P.target&&P.target.hp>0&&dist(P.target,P)<10)return true;const e=nearest(8);if(e){P.target=e;P.repath=0;P.path=null;P.medit=false;return true}return false}
function hold(id,down,upf){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!playing||paused)return;b.classList.add('press');down()});
  const u=()=>{b.classList.remove('press');if(upf)upf()};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('pointerleave',u)}
hold('t_atk',()=>{touchAtk=true;if(!touchTarget())log('가까이 싸울 상대가 없습니다.','info')},()=>{touchAtk=false});
hold('t_ult',()=>ultimate());
hold('t_leap',()=>leap());
hold('t_step',()=>bobeop());
hold('t_spec',()=>{const k=specPick();if(k==='신공')shingong();else if(k)special(k);else log(specMsg(),'info')});
hold('t_pot',()=>{const k=potPick();if(k)useCon(k);else log('금창약도 소환단도 없습니다.','info')});
hold('t_ctx',()=>{const c=ctxPick();if(c)c.fn()});
$('tmenu').addEventListener('click',()=>{if(playing)openPanel('menu')});
// 비기: 지금 쓸 수 있는 특수무공·신공 중 하나를 알아서 고른다
function sgReady(){return P.sg.name&&realmIdx()>=5&&P.fame>=200&&P.scd.신공<=0}
function specPick(){
  if(sgReady()&&inCombat())return'신공';
  const e=P.target&&P.target.hp>0?P.target:nearest(7);
  if(P.sp.점혈&&P.scd.점혈<=0&&P.qi>=SPEC.점혈.qi&&e&&dist(e,P)<2.6)return'점혈';
  if(P.sp.독공&&P.scd.독공<=0&&P.qi>=SPEC.독공.qi&&e)return'독공';
  if(P.sp.암기&&P.scd.암기<=0&&P.mats.비도>0&&e)return'암기';
  return null}
function specMsg(){return P.sg.name||P.sp.암기||P.sp.독공||P.sp.점혈?'지금 쓸 수 있는 비기가 없습니다.':'특수무공을 아직 익히지 못했습니다. 잡화상에서 비급을 구하세요.'}
function potPick(){const a=P.mats.금창약>0,b=P.mats.소환단>0;if(!a&&!b)return null;if(a&&b)return P.hp/P.maxHp<=P.qi/P.maxQi?'금창약':'소환단';return a?'금창약':'소환단'}
// 상황 버튼: 가까이 있는 것에 맞춰 대화·채집·농사·집·길들이기·말·운기로 바뀐다
const NODEL={herb:'채집',ore:'채광',wood:'벌목',fish:'낚시',chest:'열기'};
function ctxPick(){
  if(P.perch)return{l:'내려가기',fn:()=>perchDrop()};
  const t=nearestThing();
  if(t){if(t.npc)return{l:'대화',fn:()=>openNpc(t.npc)};if(t.house)return{l:'집',fn:openHouse};if(t.spouse)return{l:'가족',fn:familyTalk};
    if(t.plot)return{l:'농사',fn:()=>interact(t)};return{l:NODEL[t.node.t]||'행동',fn:()=>interact(t)}}
  const b=P.target&&P.target.hp>0&&P.target.d.beast&&P.target.d.tame&&dist(P.target,P)<3.2?P.target:null;
  if(b)return{l:'길들이기',fn:()=>tame(b)};
  if(P.ride)return{l:'하마',fn:rideToggle};
  if(allies.some(a=>a.d&&a.d.ride&&dist(a,P)<3))return{l:'승마',fn:rideToggle};
  if(P.medit)return{l:'운기 끝',fn:meditate};
  if(!inCombat()&&(P.qi<P.maxQi||P.hp<P.maxHp))return{l:'운기',fn:meditate};
  return null}
let ctxT=0,ctxNow=null;   // 상황 버튼은 프레임 수가 아니라 실제 시간 0.15초마다 고른다 (느린 기기에서 늦게 뜨던 것)
function touchHud(){
  if(P.mode!=='auto')P.mode='auto';
  if(touchAtk&&!paused&&!joy.on)touchTarget();
  const a=art(),cd=(id,v)=>$(id).querySelector('.cd').style.height=clamp(v,0,1)*100+'%';
  const u=$('t_ult');u.classList.toggle('off',!allLearned(a.id));u.querySelector('span').textContent=allLearned(a.id)?a.ult.n.slice(0,4):'필살';cd('t_ult',P.ucd/8);
  $('t_leap').classList.toggle('off',P.qi<12);cd('t_leap',P.leap?1:0);
  {const b=bobOf();$('t_step').classList.toggle('off',P.qi<BG.qi[b.g]);$('t_step').querySelector('span').textContent=b.n.length<=3?b.n:'보법';cd('t_step',(P.bcd2||0)/(P.bmax||1))}
  const hasSp=P.sg.name||P.sp.암기||P.sp.독공||P.sp.점혈,k=hasSp?specPick():null;
  $('t_spec').hidden=!hasSp;$('t_spec').querySelector('span').textContent=k||'비기';$('t_spec').classList.toggle('off',!k);
  const pk=potPick()||'금창약';$('t_pot').querySelector('span').textContent=pk==='금창약'?'금창약':'소환단';$('t_pot').querySelector('em').textContent=P.mats[pk]||0;$('t_pot').classList.toggle('off',!potPick());
  $('t_atk').classList.toggle('on',!!(P.target&&P.target.hp>0));
  {const now=performance.now();if(now-ctxT>=150){ctxT=now;ctxNow=ctxPick();const c=$('t_ctx');c.hidden=!ctxNow;if(ctxNow)c.querySelector('span').textContent=ctxNow.l}}
}
function pMenu(){
  const M=(a,l,s)=>`<button type="button" class="btn mbtn" data-act="${a}"><b>${l}</b><small>${s}</small></button>`;
  return `<div class="mgrid">${M('open:char','인물','기본기 · 내공 수련')}${M('open:arts','무공','무공 바꾸기 · 초식')}${M('open:bag','행낭','장비 · 비급 읽기')}
    ${M('open:ally','동료','짐승 · 제자 · 가족')}${M('open:life','생활','직업 · 제작 · 의뢰')}${M('open:hist','강호사','지난 생들')}${M('open:world','천하 지도','성과 문파 본산')}
    ${M('trainwin','수련','기본기 · 내공 심법')}${M('medit','운기조식','내공을 빨리 채운다')}${M('run',P.run?'질주 끄기':'질주','내공을 쓰며 달린다')}${M('ride',P.ride?'말에서 내리기':'말 타기','말이 곁에 있을 때')}
    ${M('save','기록','지금 상태를 저장')}${M('open:help','조작법','')}${INTOSS?M('exit','끝내기','진행을 기록하고 나간다'):M('ctl:k','PC 조작으로','키보드·마우스 화면')}</div>`;
}
let pref=null;try{pref=localStorage.getItem('ganghoyunhoe-ctl')}catch(e){}
setTouch(pref?pref==='t':/[?#&]touch/.test(location.href)||matchMedia('(pointer:coarse)').matches);

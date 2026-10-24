// ================= 꺼짐 기록 (사용자 2026-10-24 "게임이 자꾸 꺼져 로그 확인해줘") =================
// 휴대폰에서 게임이 갑자기 꺼지면(웹뷰가 메모리 부족 등으로 죽으면) 콘솔 기록이 남지 않는다. 그래서 기기 안에 작은 기록을 계속 적어 둔다:
// - 2초마다 '살아 있음'(시각·지역·열린 창·초당 그림 수·메모리)을, 버튼을 누를 때마다 무엇을 눌렀는지(최근 30개), 오류가 나면 그 내용을 적는다.
// - 화면이 가려지거나 페이지를 닫으면 '정상'으로 적는다. 다음에 켰을 때 마지막 기록이 '켜져 있는 채'면 갑자기 꺼진 것으로 보고
//   제목 화면에 알림과 '기록 복사' 단추를 띄운다. 복사한 글을 그대로 보내 주면 어디서 꺼졌는지 볼 수 있다. ☰ 메뉴에서도 볼 수 있다.
const CRASH_KEY='ganghoyunhoe-crash',CRASH_LAST='ganghoyunhoe-crash-last';
const CRL={on:1,acts:[],errs:[],fr:0,fps:0,t0:Date.now()};
let crashPrev=null;
try{const s=STORE.get(CRASH_KEY);if(s){const d=JSON.parse(s);if(d&&d.on){crashPrev=d;STORE.set(CRASH_LAST,s,1)}}}catch(e){}
function crashMem(){const m=performance.memory;return m?Math.round(m.usedJSHeapSize/1e6)+'/'+Math.round(m.jsHeapSizeLimit/1e6)+'MB':''}
function crashWrite(on){CRL.on=on;try{STORE.set(CRASH_KEY,JSON.stringify({on,t:Date.now(),up:Math.round((Date.now()-CRL.t0)/1000),reg:typeof REG!=='undefined'?REG:'',
  panel:typeof panel!=='undefined'?panel:'',playing:typeof playing!=='undefined'&&playing,fps:CRL.fps,mem:crashMem(),
  scr:`${innerWidth}x${innerHeight}@${devicePixelRatio}`,ua:navigator.userAgent.slice(0,160),acts:CRL.acts,errs:CRL.errs}),1)}catch(e){}}
const crashAct=s=>{CRL.acts.push(Math.round((Date.now()-CRL.t0)/100)/10+'s '+String(s).slice(0,60));if(CRL.acts.length>30)CRL.acts.shift();crashWrite(1)};
const crashErr=s=>{CRL.errs.push(String(s).slice(0,300));if(CRL.errs.length>10)CRL.errs.shift();crashWrite(1)};
addEventListener('error',e=>crashErr((e.message||'error')+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));
addEventListener('unhandledrejection',e=>crashErr('promise: '+(e.reason&&e.reason.message||e.reason)));
{const ce=console.error;console.error=function(...a){try{crashErr(a.map(String).join(' '))}catch(e){}return ce.apply(this,a)}}
// 누른 단추: 창 안(data-act), 제목(data-s), 화면 단추(id)
addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act],[data-s],button');if(b)crashAct(b.dataset.act||b.dataset.s||b.id||b.textContent.trim().slice(0,12))},{capture:true,passive:true});
addEventListener('pagehide',()=>crashWrite(0));
document.addEventListener('visibilitychange',()=>crashWrite(document.hidden?0:1));
setInterval(()=>{CRL.fps=CRL.fr/2;CRL.fr=0;if(!document.hidden)crashWrite(1)},2000);
(function crashFrame(){CRL.fr++;requestAnimationFrame(crashFrame)})();
crashWrite(1);
// 보여 줄 글
function crashText(d){if(!d)return'';const ago=Math.round((Date.now()-d.t)/60000);
  return `[강호윤회록 꺼짐 기록] ${new Date(d.t).toLocaleString()} (${ago}분 전) · 켜진 지 ${d.up}초\n지역 ${d.reg} · 창 ${d.panel||'-'} · 게임 중 ${d.playing} · 초당 ${d.fps}장 · 메모리 ${d.mem||'?'}\n화면 ${d.scr}\n${d.ua}\n`+
    `오류:\n${(d.errs||[]).map(x=>'  '+x).join('\n')||'  (없음)'}\n마지막에 누른 것:\n${(d.acts||[]).slice(-15).map(x=>'  '+x).join('\n')||'  (없음)'}`}
function crashCopy(t,el){const done=()=>{if(el)el.textContent='복사했습니다'};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,()=>crashShowText(t));else crashShowText(t)}
function crashShowText(t){const a=document.createElement('textarea');a.value=t;a.readOnly=true;a.className='crashtxt';a.style.cssText='width:100%;height:160px;font-size:11px';
  const host=$('wbody')&&!$('win').hidden?$('wbody'):box;host.appendChild(a);a.focus();a.select()}
function crashCard(d,first){if(!d)return'';return `<div class="card crashcard"><h4>${first?'지난번에 게임이 갑자기 꺼졌습니다':'마지막 꺼짐 기록'}</h4>
  <p class="note">아래 단추로 기록을 복사해 보내 주시면 어디서 꺼졌는지 찾을 수 있습니다.</p><pre style="white-space:pre-wrap;font-size:11px;max-height:140px;overflow:auto">${esc(crashText(d))}</pre>
  <button type="button" class="btn pri crashcopy">기록 복사</button></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.crashcopy');if(!b)return;e.stopPropagation();const pre=b.parentNode.querySelector('pre');crashCopy(pre?pre.textContent:'',b)});
// 제목 화면: 갑자기 꺼진 뒤 처음 켰을 때만 맨 위에
{const st=showTitle;showTitle=function(...a){const r=st.apply(this,a);if(crashPrev){box.insertAdjacentHTML('afterbegin',crashCard(crashPrev,1));crashPrev=null}return r}}
// ☰ 메뉴: 마지막 꺼짐 기록
{const pm=pMenu;pMenu=function(){let d=null;try{d=JSON.parse(STORE.get(CRASH_LAST)||'null')}catch(e){}return pm()+(d?crashCard(d,0):'')}}

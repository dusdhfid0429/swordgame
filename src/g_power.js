// ================= 발열·배터리 줄이기 (사용자 2026-10-24 "발열과 배터리 소모 체크 가능해??") =================
// 휴대폰이 뜨거워지고 배터리가 빨리 닳는 건 대부분 '1초에 몇 장을, 몇 픽셀로 그리느냐'에서 온다.
// - 그림 수 상한: 120Hz 화면에서도 게임 중 60장, 창을 열어 멈췄거나 제목 화면이면 30장. 절전이면 각각 30·15장.
// - 절전: 위 상한 + 그리는 해상도(DPR) 2 → 1.5 (픽셀 수 약 56%).
// - 성능 표시: 화면 위에 초당 그림 수·한 장 계산 시간·그리는 해상도·배터리(%·시간당 소모)를 띄워 실제 휴대폰에서 직접 본다.
//   기기 온도는 웹에서 읽을 수 없다. 배터리는 navigator.getBattery가 있는 곳(안드로이드 웹뷰)에서만 보인다(아이폰은 없음).
// 설정은 기기 안에만 둔다(STORE, 'ganghoyunhoe-power'). ☰ 메뉴·조작법 창의 소리 단추 아래에 있다.
const PWR_KEY='ganghoyunhoe-power';
const PWR=(()=>{let o={save:0,meter:0};try{Object.assign(o,JSON.parse(STORE.get(PWR_KEY)||'{}'))}catch(e){}return o})();
const pwrSave=()=>{try{STORE.set(PWR_KEY,JSON.stringify(PWR),1)}catch(e){}};
const PWR_FPS={play:[60,30],idle:[30,15]};   // [보통, 절전]
DPR_MAX=PWR.save?1.5:2;
// loop가 매 rAF마다 묻는다: 이번 장을 그릴 차례인가. 남는 rAF는 아무것도 안 하고 넘긴다
function pwrFps(){return PWR_FPS[playing&&!paused?'play':'idle'][PWR.save?1:0]}
let pwrLast=0;
function pwrDue(now){const gap=1000/pwrFps();if(now-pwrLast<gap-2)return false;pwrLast=now-gap>pwrLast+gap?now:pwrLast+gap;return true}
// 성능 표시: 2초마다 갱신
const PM={fr:0,ms:0,t0:performance.now(),bat:null,b0:null};
function pwrFrame(ms){PM.fr++;PM.ms+=ms}
function pwrMeterEl(){let e=$('pmeter');if(!e){e=document.createElement('div');e.id='pmeter';e.style.cssText='position:fixed;left:max(6px,env(safe-area-inset-left));top:40%;z-index:60;pointer-events:none;background:rgba(0,0,0,.62);color:#e8dcc0;font:11px/1.35 monospace;padding:3px 8px;border-radius:6px;white-space:pre;text-align:left';document.body.appendChild(e)}return e}
function pwrBatText(){const b=PM.bat;if(!b)return'배터리: 이 기기에선 못 읽음';const lv=Math.round(b.level*100);if(b.charging)return`배터리 ${lv}% 충전 중 (소모 측정 멈춤)`;
  if(!PM.b0||PM.b0.charging!==false)PM.b0={lv:b.level,t:Date.now(),charging:false};
  const h=(Date.now()-PM.b0.t)/36e5,d=(PM.b0.lv-b.level)*100;
  return h<1/6&&d<2?`배터리 ${lv}% · 소모 재는 중 (${Math.round(h*60)}분)`:`배터리 ${lv}% · 시간당 ${(d/h).toFixed(1)}% 소모 (${Math.round(h*60)}분 동안 ${d.toFixed(0)}%)`}
function pwrMeter(){const on=!!PWR.meter;let e=$('pmeter');if(!on){if(e)e.remove();return}e=pwrMeterEl();
  const s=(performance.now()-PM.t0)/1000,fps=PM.fr/s,ms=PM.fr?PM.ms/PM.fr:0;PM.fr=0;PM.ms=0;PM.t0=performance.now();
  e.textContent=`초당 ${fps.toFixed(0)}장 (상한 ${pwrFps()}) · 한 장 ${ms.toFixed(1)}ms · ${C.width}×${C.height}${PWR.save?' · 절전':''}\n${pwrBatText()}`}
if(navigator.getBattery)navigator.getBattery().then(b=>{PM.bat=b;b.addEventListener('chargingchange',()=>{PM.b0=null})}).catch(()=>{});
setInterval(()=>{if(!document.hidden)pwrMeter()},2000);
// 설정 단추 (소리 단추 줄 아래)
const pwrBtns=()=>`<div class="sndrow">${B('snd:pw',PWR.save?'절전 켬 (30장·낮은 해상도)':'절전 끔',{pri:!!PWR.save})}${B('snd:meter',`성능 표시 ${PWR.meter?'켬':'끔'}`,{pri:!!PWR.meter})}</div>`;
{const pm=pMenu;pMenu=function(){return pm()+pwrBtns()};const ph=pHelp;pHelp=function(){const h=ph(),i=h.indexOf('</div>');return i<0?pwrBtns()+h:h.slice(0,i+6)+pwrBtns()+h.slice(i+6)}}
{const st=sndToggle;sndToggle=function(k){if(k==='pw'){PWR.save=PWR.save?0:1;DPR_MAX=PWR.save?1.5:2;pwrSave();resize();return}
  if(k==='meter'){PWR.meter=PWR.meter?0:1;PM.b0=null;pwrSave();PM.fr=0;PM.ms=0;PM.t0=performance.now();pwrMeter();return}return st(k)}}

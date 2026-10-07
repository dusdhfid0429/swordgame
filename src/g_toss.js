// ================= 앱인토스 (토스 인앱) =================
// 토스 안에서는 toss/bridge.js 가 SDK를 window.AIT 에 넣고 'ait-ready' 를 쏜다.
// 브라우저에서는 AIT가 없으니 화면을 내릴 때 멈추는 것 말고는 하는 일이 없다.
// 주소 끝에 #toss 를 붙이면 토스 화면 배치(상단 버튼 자리, 세로 고정 안내)만 흉내 낸다.
var INTOSS=false,tossKey=null,tossReady=false;
const tossSaveKey=()=>SAVE_KEY+(tossKey?':'+tossKey:'');
// 토스 저장소에도 같은 기록을 남긴다. 사용자 키에 묶여 있어 앱을 지웠다 깔아도 키는 같다.
function tossSave(s){const sdk=window.AIT;if(!sdk||!sdk.Storage||!tossReady)return;sdk.Storage.setItem(tossSaveKey(),s).catch(()=>{})}
function tossLayout(){INTOSS=true;document.body.classList.add('toss');if(!TOUCH)setTouch(true);else resize()}
// 종료 확인 창 (안드로이드 뒤로 가기)
const EXITQ=document.createElement('div');EXITQ.className='exitq';EXITQ.hidden=true;EXITQ.setAttribute('role','dialog');EXITQ.setAttribute('aria-modal','true');
EXITQ.innerHTML=`<div class="card"><h3>강호를 떠날까요?</h3><p>지금까지의 진행은 기록해 둡니다.</p><div class="center"><button type="button" class="btn" data-q="stay">계속하기</button><button type="button" class="btn pri" data-q="leave">끝내기</button></div></div>`;
$('stage').appendChild(EXITQ);
let exitPaused=false;
function askExit(){if(!EXITQ.hidden)return;exitPaused=!paused;paused=true;EXITQ.hidden=false}
function stayIn(){EXITQ.hidden=true;if(exitPaused&&$('win').hidden)paused=false;exitPaused=false}
EXITQ.addEventListener('click',async e=>{const q=e.target.closest('[data-q]');if(!q)return;
  if(q.dataset.q==='stay'){stayIn();return}
  saveGame(true);const sdk=window.AIT;try{if(sdk&&sdk.Screen&&sdk.Screen.close)await sdk.Screen.close();else stayIn()}catch(err){stayIn()}});
function onBack(){
  if(!EXITQ.hidden){stayIn();return}
  if(!$('win').hidden){closePanels();return}
  askExit()}
// 화면을 내리면 멈추고 기록한다. 돌아오면 이어서 한다.
let hidePaused=false;
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(playing){saveGame(true);if(!paused){paused=true;hidePaused=true}}}
  else if(hidePaused){hidePaused=false;if($('win').hidden&&EXITQ.hidden)paused=false;last=performance.now()}});
async function tossInit(){
  const sdk=window.AIT;if(!sdk||tossInit.done)return;tossInit.done=1;tossLayout();
  try{if(sdk.Screen&&sdk.Screen.setOrientation)await sdk.Screen.setOrientation({type:'portrait'})}catch(e){}
  try{const SA=sdk.SafeArea||sdk.SafeAreaInsets;if(SA&&SA.subscribe)SA.subscribe({onEvent:i=>{const r=document.documentElement.style;
    for(const k of['top','bottom','left','right'])r.setProperty('--sa'+k[0],(i[k]||0)+'px')}})}catch(e){}
  try{sdk.graniteEvent.addEventListener('backEvent',{onEvent:onBack,onError:()=>{}})}catch(e){}
  try{const r=await sdk.getUserKeyForGame();if(r&&r.type==='HASH')tossKey=r.hash}catch(e){}
  // 토스 저장소의 기록이 있으면 그걸 쓴다 (아직 플레이를 시작하지 않았을 때만)
  try{const s=await sdk.Storage.getItem(tossSaveKey());if(s&&!playing)localStorage.setItem(SAVE_KEY,s)}catch(e){}
  tossReady=true;
  if(!playing&&!scrEl.hidden&&box.querySelector('.title'))showTitle();
}
addEventListener('ait-ready',tossInit);
if(window.AIT)setTimeout(tossInit);
else if(/[?#&]toss/.test(location.href))tossLayout();

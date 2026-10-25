// ================= 안드로이드 설치판 (android/build_apk.py 가 게임 맨 끝에 붙인다) =================
// 게임 소스(src/)는 건드리지 않는다. 웹뷰 껍데기(MainActivity.java)의 AndroidApp 과 이어 주는 일만 한다.
(function(){
  const A=window.AndroidApp;if(!A)return;
  document.documentElement.classList.add('apk');
  // 처음 켰을 때는 터치 조작으로 (설정에서 바꾼 적이 있으면 그대로)
  try{if(!TOUCH&&STORE.get('ganghoyunhoe-ctl')==null)setTouch(true)}catch(e){}
  // 화면 켜 두기: 웹뷰에는 Screen Wake Lock 이 없어서 g_audio.js 의 wakeOn/wakeOff 를 창 플래그로 받는다
  const sentinel=()=>{const ls=[];const l={released:false,type:'screen',
    addEventListener:(t,f)=>{if(t==='release')ls.push(f)},removeEventListener(){},
    release:async()=>{if(l.released)return;l.released=true;A.keepScreen(false);ls.forEach(f=>{try{f()}catch(e){}})}};return l};
  try{Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{A.keepScreen(true);return sentinel()}}})}catch(e){}
  // 끝낼지 묻는 창 (뒤로 가기)
  const st=document.createElement('style');
  st.textContent='.apkq{position:absolute;inset:0;display:grid;place-items:center;background:#000a;z-index:50}.apkq .card{max-width:min(320px,86vw);padding:16px 18px;gap:10px;text-align:center}';
  document.head.appendChild(st);
  const Q=document.createElement('div');Q.className='apkq';Q.hidden=true;Q.setAttribute('role','dialog');Q.setAttribute('aria-modal','true');
  Q.innerHTML='<div class="card"><h3>강호를 떠날까요?</h3><p>지금까지의 진행은 기록해 둡니다.</p><div class="center"><button type="button" class="btn" data-q="stay">계속하기</button><button type="button" class="btn pri" data-q="leave">끝내기</button></div></div>';
  $('stage').appendChild(Q);
  let qPaused=false;
  const ask=()=>{if(!Q.hidden)return;qPaused=!paused;paused=true;Q.hidden=false};
  const stay=()=>{Q.hidden=true;if(qPaused&&$('win').hidden)paused=false;qPaused=false};
  Q.addEventListener('click',e=>{const q=e.target.closest('[data-q]');if(!q)return;
    if(q.dataset.q==='stay'){stay();return}
    try{if(playing)saveGame(true)}catch(err){}A.exit()});
  // 뒤로 가기: 열린 창부터 닫고, 더 닫을 것이 없으면 끝낼지 묻는다
  window.apkBack=function(){
    if(!Q.hidden){stay();return}
    if(typeof trnOpen!=='undefined'&&trnOpen){closeTrain();return}
    if(!$('win').hidden){closePanels();return}
    ask()};
  // 화면을 내리면 멈추고 기록한다. 돌아오면 이어서 한다
  let hidePaused=false;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(playing){try{saveGame(true)}catch(e){}if(!paused){paused=true;hidePaused=true}}}
    else if(hidePaused){hidePaused=false;if($('win').hidden&&Q.hidden)paused=false;last=performance.now()}});
})();

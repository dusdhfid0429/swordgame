// ================= 소리: 배경음악과 효과음 =================
// 바깥 음원 파일 없이 Web Audio로 그 자리에서 연주한다 (저작권 걱정 없음, 파일 크기 0).
// - 배경음악: 오음 음계(궁·상·각·치·우)로 가야금(고쟁) 같은 뜯는 소리, 대금(적) 같은 피리, 북을 그때그때 지어 낸다.
//   개봉(마을)은 밝고 느리게, 성·본산(들판)은 쓸쓸하게, 싸움이 붙으면 북이 빨라진다.
// - 효과음: 칼바람, 타격, 치명타, 맞음, 쓰러뜨림, 초식, 필살기(징), 경공, 은자·물건 줍기, 창 열기, 깨달음, 지역 이동, 죽음 등.
// - 브라우저는 사람이 화면을 한 번 눌러야 소리를 낼 수 있어서 첫 손길에 켠다. 앱이 뒤로 가면 음악을 멈춘다.
// 설정: ☰ 메뉴(또는 조작법 창)의 배경음악·효과음 켬/끔. 기기 안에만 둔다(STORE, 'ganghoyunhoe-snd').
const SND_KEY='ganghoyunhoe-snd';
const SND=(()=>{let o={m:1,s:1,mv:.5,sv:.7};try{Object.assign(o,JSON.parse(STORE.get(SND_KEY)||'{}'))}catch(e){}return o})();
const sndSave=()=>{try{STORE.set(SND_KEY,JSON.stringify(SND),1)}catch(e){}};
let AC=null,AMaster=null,AMus=null,ASfx=null,ARev=null,ANoise=null;
function audioInit(){
  if(AC){if(AC.state==='suspended'&&!document.hidden)AC.resume();return AC}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  try{AC=new C()}catch(e){return null}
  AMaster=AC.createGain();AMaster.gain.value=1;const cp=AC.createDynamicsCompressor();cp.threshold.value=-10;cp.ratio.value=4;AMaster.connect(cp);cp.connect(AC.destination);
  AMus=AC.createGain();AMus.gain.value=SND.m?SND.mv*1.4:0;ASfx=AC.createGain();ASfx.gain.value=SND.s?SND.sv:0;
  // 잔향: 짧게 감쇠하는 잡음으로 만든 공간감 (산사·계곡 느낌)
  ARev=AC.createConvolver();const L=AC.sampleRate*2.4|0,ir=AC.createBuffer(2,L,AC.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,3.2)}ARev.buffer=ir;
  const wet=AC.createGain();wet.gain.value=.32;ARev.connect(wet);wet.connect(AMaster);
  AMus.connect(AMaster);AMus.connect(ARev);ASfx.connect(AMaster);const sw=AC.createGain();sw.gain.value=.35;ASfx.connect(sw);sw.connect(ARev);
  const nl=AC.sampleRate*2|0;ANoise=AC.createBuffer(1,nl,AC.sampleRate);const nd=ANoise.getChannelData(0);for(let i=0;i<nl;i++)nd[i]=Math.random()*2-1;
  musStart();return AC}
// 첫 손길에 켠다
for(const ev of['pointerdown','keydown','touchend'])addEventListener(ev,()=>audioInit(),{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()});
function sndApply(){if(!AC)return;const t=AC.currentTime;AMus.gain.setTargetAtTime(SND.m?SND.mv*1.4*MUS.fade:0,t,.15);ASfx.gain.setTargetAtTime(SND.s?SND.sv:0,t,.05)}
function sndToggle(k){SND[k]=SND[k]?0:1;sndSave();audioInit();sndApply();if(k==='s'&&SND.s)sfx('ui')}

// ---- 소리 재료 ----
const mtof=m=>440*Math.pow(2,(m-69)/12);
function env(g,t,a,peak,dec,end=.0001){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(end,t+a+dec)}
function tone(dst,t,f,type,peak,a,dec,f2,detune){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+a+dec);if(detune)o.detune.value=detune;
  env(g,t,a,peak,dec);o.connect(g);g.connect(dst);o.start(t);o.stop(t+a+dec+.05);return o}
function noise(dst,t,peak,a,dec,ftype,f1,f2,q=1){const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=ANoise;s.loop=true;
  fl.type=ftype;fl.frequency.setValueAtTime(f1,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+a+dec);fl.Q.value=q;
  env(g,t,a,peak,dec);s.connect(fl);fl.connect(g);g.connect(dst);s.start(t,Math.random()*1.5);s.stop(t+a+dec+.05)}
// 뜯는 줄 소리 (카플러스-스트롱): 음높이마다 한 번 만들어 둔다
const PLUCK={};
function pluckBuf(f){const k=Math.round(f*10);if(PLUCK[k])return PLUCK[k];
  const sr=AC.sampleRate,len=sr*2.2|0,b=AC.createBuffer(1,len,sr),d=b.getChannelData(0),n=Math.max(2,Math.round(sr/f)),ring=new Float32Array(n);
  let prev=0;for(let i=0;i<n;i++){const v=Math.random()*2-1;prev=prev*.45+v*.55;ring[i]=prev}
  let p=0;for(let i=0;i<len;i++){const a=ring[p],nx=ring[(p+1)%n];d[i]=a;ring[p]=(a+nx)*.4985;p=(p+1)%n}
  return PLUCK[k]=b}
function pluck(dst,t,m,vol=.5,pan=0){const s=AC.createBufferSource(),g=AC.createGain(),lp=AC.createBiquadFilter();s.buffer=pluckBuf(mtof(m));
  lp.type='lowpass';lp.frequency.value=Math.min(9000,mtof(m)*7);g.gain.value=vol;s.connect(lp);lp.connect(g);
  if(AC.createStereoPanner){const pn=AC.createStereoPanner();pn.pan.value=pan;g.connect(pn);pn.connect(dst)}else g.connect(dst);s.start(t);s.stop(t+2.2)}
// 피리: 사인파에 떨림과 숨소리
function flute(dst,t,m,dur,vol=.12){const o=AC.createOscillator(),g=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain();o.type='sine';o.frequency.value=mtof(m);
  lfo.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(mtof(m)*.012,t+dur*.5);lfo.connect(lg);lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.18);g.gain.setValueAtTime(vol,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(dst);o.start(t);lfo.start(t);o.stop(t+dur+.05);lfo.stop(t+dur+.05);noise(dst,t,vol*.25,.05,dur*.6,'bandpass',mtof(m)*2,null,2)}
// 북: 큰북(둥), 작은북(딱), 목탁
function drum(dst,t,k,vol=1){
  if(k==='big'){tone(dst,t,110,'sine',.7*vol,.004,.5,42);noise(dst,t,.25*vol,.002,.12,'lowpass',900,200)}
  else if(k==='mid'){tone(dst,t,180,'sine',.45*vol,.003,.25,90);noise(dst,t,.18*vol,.002,.08,'bandpass',1200,500,1.5)}
  else if(k==='wood'){tone(dst,t,820,'sine',.22*vol,.001,.07,700)}
  else{noise(dst,t,.16*vol,.001,.05,'highpass',3000)}}
// 징·종: 어긋난 배음들이 길게 운다
function gong(dst,t,f,vol,dec){[[1,1],[1.48,.6],[2.02,.45],[2.74,.3],[3.9,.18]].forEach(([r,a])=>tone(dst,t,f*r,'sine',vol*a,.01,dec*(1.2-r*.15),f*r*.985))}

// ---- 효과음 ----
let sfxLast={};
function sfx(k,o={}){
  if(!AC||!SND.s||document.hidden)return;const t=AC.currentTime,D=ASfx;
  // 같은 소리가 한 순간에 몰리면 줄인다
  const lim={hit:.04,crit:.06,swing:.05,ehit:.05,kill:.06,coin:.05,step:.1}[k]||.02;if(t-(sfxLast[k]||0)<lim)return;sfxLast[k]=t;
  const v=o.v==null?1:o.v;
  switch(k){
    case'swing':{const c=o.cls||'검',hi=c==='검'?1:c==='창'||c==='봉'?.7:c==='도'?.8:c==='궁'?1.2:.5;
      noise(D,t,.28*v,.01,.16,'bandpass',2600*hi,700*hi,1.2);if(c==='검')tone(D,t+.02,2800,'sine',.03*v,.002,.25,2700);break}
    case'bow':tone(D,t,180,'triangle',.25*v,.002,.12,90);noise(D,t,.15*v,.002,.25,'bandpass',3000,1200,2);break;
    case'hit':noise(D,t,.4*v,.001,.07,'bandpass',1800,600,.8);tone(D,t,150,'sine',.5*v,.002,.13,60);break;
    case'crit':noise(D,t,.5*v,.001,.09,'bandpass',2400,800,.8);tone(D,t,130,'sine',.6*v,.002,.18,50);
      [1900,2850,4100].forEach((f,i)=>tone(D,t+.01,f,'sine',.08*v/(i+1),.002,.5,f*.99));break;
    case'miss':noise(D,t,.12*v,.01,.12,'highpass',2000,900);break;
    case'hurt':tone(D,t,95,'sine',.6,.003,.2,45);noise(D,t,.3,.002,.14,'lowpass',1400,300);tone(D,t,220,'sawtooth',.06,.01,.12,140);break;
    case'dodge':noise(D,t,.16,.02,.16,'bandpass',1500,3500,1.5);break;
    case'kill':tone(D,t,200,'triangle',.3*v,.005,.35,55);noise(D,t+.05,.2*v,.01,.3,'lowpass',700,120);break;
    case'form':{const f=o.f||660;noise(D,t,.3,.01,.2,'bandpass',3000,900,1.4);tone(D,t,f,'sine',.12,.005,.4,f*1.5);tone(D,t+.06,f*1.5,'sine',.07,.005,.35);break}
    case'ult':gong(D,t,92,.55,3.2);noise(D,t,.08,.4,1.4,'bandpass',600,2600,.7);drum(D,t,'big',1.2);break;
    case'leap':noise(D,t,.24,.03,.35,'bandpass',600,3200,1.2);break;
    case'land':noise(D,t,.12,.002,.08,'lowpass',500);break;
    case'coin':tone(D,t,1950,'sine',.16*v,.002,.18);tone(D,t+.06,2630,'sine',.14*v,.002,.3);break;
    case'item':pluck(D,t,79,.35);pluck(D,t+.07,86,.3);break;
    case'book':noise(D,t,.12,.02,.18,'bandpass',4200,2000,.9);noise(D,t+.14,.1,.02,.16,'bandpass',3600,1800,.9);break;
    case'ui':tone(D,t,900,'sine',.12,.001,.06,760);break;
    case'open':tone(D,t,700,'sine',.1,.001,.08,560);noise(D,t,.05,.01,.1,'bandpass',3000,1500);break;
    case'close':tone(D,t,560,'sine',.08,.001,.07,480);break;
    case'tier':[74,76,79,81,86].forEach((m,i)=>pluck(D,t+i*.075,m,.42,(i-2)*.2));gong(D,t+.4,587,.05,1.8);break;
    case'learn':[69,74,76,81].forEach((m,i)=>pluck(D,t+i*.09,m,.4));break;
    case'travel':noise(D,t,.18,.25,.9,'bandpass',400,1600,.8);[81,86].forEach((m,i)=>pluck(D,t+.35+i*.12,m,.25));break;
    case'die':gong(D,t,70,.6,4.5);[62,58,55,50].forEach((m,i)=>pluck(D,t+.3+i*.35,m,.35));break;
    case'medit':gong(D,t,523,.12,4);break;
    case'train':drum(D,t,'big',.9);drum(D,t+.12,'mid',.5);break;
    case'chop':tone(D,t,320,'triangle',.25,.002,.08,200);noise(D,t,.2,.001,.06,'bandpass',1500,700);break;
    case'dig':noise(D,t,.22,.003,.12,'bandpass',900,400,1.5);tone(D,t,1400,'sine',.05,.001,.12);break;
    case'herb':noise(D,t,.12,.02,.2,'highpass',2500,4000);break;
    case'buy':tone(D,t,1750,'sine',.14,.002,.15);tone(D,t+.05,2350,'sine',.12,.002,.2);tone(D,t+.1,2950,'sine',.1,.002,.3);break;
    case'error':tone(D,t,220,'square',.05,.002,.12,200);break;
  }}

// ---- 배경음악 ----
// 음계: 반음 간격. 개봉 궁조(밝음), 들판 우조(쓸쓸함), 싸움 각조풍(급함)
const MODES={
  town:{root:62,sc:[0,2,4,7,9],bpm:72,dens:.42,flute:.35,drum:0,pad:0},
  field:{root:57,sc:[0,3,5,7,10],bpm:62,dens:.28,flute:.5,drum:0,pad:1},
  night:{root:57,sc:[0,3,5,7,10],bpm:54,dens:.2,flute:.25,drum:0,pad:1},
  battle:{root:64,sc:[0,3,5,7,10],bpm:116,dens:.55,flute:0,drum:1,pad:0},
  title:{root:62,sc:[0,2,4,7,9],bpm:58,dens:.25,flute:.6,drum:0,pad:1}};
const MUS={mode:null,want:'title',step:0,next:0,deg:4,fade:1,timer:null,combatT:0,padNodes:null,phrase:0};
function musStart(){if(MUS.timer)return;MUS.next=AC.currentTime+.1;MUS.timer=setInterval(musTick,90)}
function musWant(){
  if(!playing)return'title';
  if(typeof inCombat==='function'&&P&&P.hp>0&&inCombat())MUS.combatT=performance.now();
  if(performance.now()-MUS.combatT<4500)return'battle';
  if(REG==='gaebong')return'town';
  return typeof tod==='number'&&(tod<.2||tod>.8)?'night':'field'}
function padOn(m){padOff();if(!m.pad)return;const t=AC.currentTime,g=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+3);
  const os=[0,7,12].map((iv,i)=>{const o=AC.createOscillator();o.type='sine';o.frequency.value=mtof(m.root-12+iv);o.detune.value=(i-1)*6;o.connect(lp);o.start(t);return o});
  lp.connect(g);g.connect(AMus);MUS.padNodes={g,os}}
function padOff(){const p=MUS.padNodes;if(!p)return;const t=AC.currentTime;p.g.gain.setTargetAtTime(.0001,t,.6);p.os.forEach(o=>o.stop(t+3));MUS.padNodes=null}
function musTick(){
  if(!AC||AC.state!=='running')return;const want=musWant();
  // 분위기가 바뀌면 소리를 줄였다가 새 가락으로
  if(want!==MUS.mode){if(MUS.mode&&MUS.fade>0){MUS.fade=Math.max(0,MUS.fade-.12);sndApply();if(MUS.fade>0)return}
    MUS.mode=want;MUS.step=0;MUS.next=AC.currentTime+.05;MUS.deg=4;padOn(MODES[want])}
  else if(MUS.fade<1){MUS.fade=Math.min(1,MUS.fade+.08);sndApply()}
  if(!SND.m){MUS.next=AC.currentTime+.1;return}
  const m=MODES[MUS.mode],st=60/m.bpm/2;
  while(MUS.next<AC.currentTime+.3){musStep(m,MUS.step,MUS.next,st);MUS.step++;MUS.next+=st*(MUS.step%2?1.04:.96)}}
const noteOf=(m,deg)=>{const n=m.sc.length,o=Math.floor(deg/n);return m.root+o*12+m.sc[((deg%n)+n)%n]};
function musStep(m,s,t,st){
  const bar=Math.floor(s/8),b=s%8,D=AMus;
  // 낮은 줄: 두 마디마다 으뜸음과 5도
  if(b===0&&bar%2===0){pluck(D,t,m.root-24,.5,-.3);pluck(D,t+st*2,m.root-17,.32,-.3)}
  if(m.drum){const pat=[['big',1],null,['tick',.6],['mid',.7],['big',.9],['tick',.5],['mid',.8],['wood',.6]][b];if(pat)drum(D,t,pat[0],pat[1]*.8);if(b===0&&bar%4===3)drum(D,t+st,'big',.9)}
  else if(b===0&&bar%4===0)drum(D,t,'wood',.35);
  // 가락: 음계 위를 걷다가 마디 끝에서 쉰다. 네 마디마다 훑어 올리기
  if(b===0&&bar%4===0&&Math.random()<.6){for(let i=0;i<5;i++)pluck(D,t+i*.045,noteOf(m,MUS.deg-4+i),.18,.2)}
  const rest=bar%4===3&&b>=4;
  if(!rest&&Math.random()<m.dens*(b%2?.7:1.2)){
    MUS.deg+=[-2,-1,-1,1,1,2,0][Math.random()*7|0];if(MUS.deg<0)MUS.deg=2;if(MUS.deg>11)MUS.deg=8;
    const n=noteOf(m,MUS.deg);pluck(D,t,n,.42,.15);
    if(Math.random()<.15)pluck(D,t+st*.5,n+(Math.random()<.5?2:-2),.2,.15);   // 꾸밈음
    if(m.drum&&Math.random()<.4)pluck(D,t,n-12,.25,-.1)}
  // 피리: 네 마디에 한 번쯤 긴 음
  if(m.flute&&b===0&&bar%4===1&&Math.random()<m.flute){const n=noteOf(m,5+(Math.random()*4|0));flute(D,t,n,st*6);if(Math.random()<.6)flute(D,t+st*6,noteOf(m,4+(Math.random()*3|0)),st*7)}}

// ---- 게임에 소리 붙이기 (기존 함수를 감싼다) ----
const sndNear=e=>!e||!P||Math.hypot(e.x-P.x,e.y-P.y)<10;
{const wrap=(name,fn)=>{const o=window[name];if(typeof o!=='function')return;window[name]=function(...a){return fn(o,a,this)}};
  wrap('damage',(o,a)=>{const[e,d,kb,stun,from,crit]=a,was=e&&e.hp>0;const r=o(...a);if(was&&sndNear(e)&&(from===undefined||from===P||allies.includes(from)))sfx(crit?'crit':'hit',{v:from&&from!==P?.5:1});if(was&&e.hp<=0&&sndNear(e))sfx('kill');return r});
  wrap('hitE',(o,a)=>{const e=a[1],hp=e&&e.hp,r=o(...a);if(e&&e.hp===hp&&e.hp>0&&sndNear(e))sfx('miss');return r});
  wrap('hurtP',(o,a)=>{const hp=P.hp,r=o(...a);if(P.hp<hp&&P.hp>0)sfx('hurt');else if(P.hp===hp&&P.inv<=0)sfx('dodge');return r});
  wrap('basicStrike',(o,a)=>{const b=P.bcd,r=o(...a);if(P.bcd>b){const c=curCls();sfx(c==='궁'&&hasWeaponFor('궁')?'bow':'swing',{cls:c})}return r});
  wrap('useForm',(o,a)=>{const r=o(...a);if(r){const el=art().el,f={금:880,목:660,수:587,화:784,토:523}[el]||660;sfx('swing',{cls:art().cls});sfx('form',{f})}return r});
  wrap('ultimate',(o,a)=>{const u=P.ucd,r=o(...a);if(P.ucd>u)sfx('ult');return r});
  wrap('special',(o,a)=>{const r=o(...a);sfx('swing',{cls:'궁',v:.6});return r});
  wrap('leap',(o,a)=>{const q=P.qi,r=o(...a);if(P.qi<q)sfx('leap');return r});
  wrap('pickUp',(o,a)=>{const it=a[0]&&a[0].it,r=o(...a);if(r&&it)sfx(it.silver?'coin':it.item&&(it.item.slot==='book'||it.item.slot==='sbook')||it.page?'book':'item');return r});
  wrap('travel',(o,a)=>{const was=P.traveling;const r=o(...a);if(!was)sfx('travel');return r});
  wrap('die',(o,a)=>{sfx('die');return o(...a)});
  wrap('showBanner',(o,a)=>{if(!P||!P.traveling)if(!AC||AC.currentTime-(sfxLast.ult||-9)>.5)sfx('tier');return o(...a)});
  wrap('openPanel',(o,a)=>{const p=panel,r=o(...a);sfx(panel&&panel!==p?'open':'close');return r});
  wrap('closePanels',(o,a)=>{const p=panel,r=o(...a);if(p)sfx('close');return r});
  wrap('buy',(o,a)=>{const s=P.silver,r=o(...a);sfx(P.silver<s?'buy':'error');return r});
  wrap('meditate',(o,a)=>{const r=o(...a);if(P.medit)sfx('medit');return r});
  wrap('trainStat',(o,a)=>{const v=P.vit,r=o(...a);if(P.vit!==v)sfx('train');return r});
  wrap('trainQi',(o,a)=>{const v=P.vit,r=o(...a);if(P.vit!==v)sfx('medit');return r});
  wrap('readBook',(o,a)=>{const r=o(...a);sfx('book');return r});
  wrap('learnPas',(o,a)=>{const r=o(...a);if(r)sfx('learn');return r});
  wrap('interact',(o,a)=>{const n=a[0]&&a[0].node,r=o(...a);if(n&&P.chan){const k={ore:'dig',wood:'chop',herb:'herb'}[n.t];if(k){sfx(k);setTimeout(()=>P.chan&&sfx(k),500);setTimeout(()=>P.chan&&sfx(k),1000)}}return r});
  // 창 안의 버튼 누름
  $('wbody').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled&&!/^(open|wsel)/.test(b.dataset.act||''))sfx('ui')});
}
// 설정 버튼 (☰ 메뉴와 조작법 창)
const sndBtns=()=>`<div class="sndrow">${B('snd:m',`배경음악 ${SND.m?'켬':'끔'}`,{pri:!!SND.m})}${B('snd:s',`효과음 ${SND.s?'켬':'끔'}`,{pri:!!SND.s})}</div>`;
{const pm=pMenu;pMenu=function(){return pm()+sndBtns()};const ph=pHelp;pHelp=function(){return sndBtns()+ph()}}

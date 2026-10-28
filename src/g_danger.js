// ================= 피격·빈사 알림 (v172) =================
// 사용자 2026-10-23: "데미지를 입는 타이밍을 인지하기 어렵다. 이걸 맞으면 죽을 수도 있다를 피드백으로 알 수 있으면"
//  1) 큰 피해를 맞는 순간: 화면 가장자리가 붉게 번쩍이고(많이 잃을수록 진하게) 큰 숫자·센 흔들림·진동. 생명줄의 잃은 몫은 잠깐 하얗게 남았다가 줄어든다
//  2) 나를 노리는 적이 칠 준비(e.wind)를 하고 그 한 방에 쓰러질 수 있으면 머리 위 붉은 '!!'와 좁혀 드는 고리(고리가 닫히면 맞는다). 쓰러지지 않을 공격에는 띄우지 않는다
//  3) 생명이 낮으면 가장자리가 천천히 뛰고, 주변 적의 한 방이 남은 생명을 넘으면 '위험': 빠른 박동·심장 소리·생명줄 깜빡임
// 수치는 data/danger.json (DANGER)
const DG=GD.DANGER;
let dngF=0,dngLvl=0,dngBeat=0,dngPulse=0,dngGhost=1,dngGhostT=0,dngWarnT=-99,dngScan=0,dngDemo=0,RVIG=null;
// 한 방 어림: hurtP 의 'hurt' 훅 가운데 피해를 곱하는 것만 따라 한다. 호신강기는 깎을 몫만 셈하고 내공을 쓰지 않는다.
// 회피 확률과 금강불괴는 셈하지 않는다(가장 나쁜 경우를 알린다)
function hitEst(e,base){
  let dm=base;const r=realmIdx();
  if(e.d){dm*=rMul(rDiff(mobRealm(e),r))*diffMul('taken');if(r>=4&&mobRealm(e)<=r-2)dm*=.2}
  const st=simTv('def');if(st)dm*=1-st/100;
  const mt=maraTier();if(mt)dm*=1+MARA.dmg[mt];
  if(r>=8)dm*=1-BEY.jayeon.cut;
  if(e.d&&hsCut()>0&&!P.hsBrk)dm-=Math.min(dm*hsCut(),Math.max(0,P.qi)/hsQi());
  return Math.max(1,Math.round(dm*(1-guard())))}
// 나를 노리는 적만: 살아 있고, 나에게 적대하고, 실제 과녁이 나(e.tgt 가 없거나 나)인 몹. 다른 몹과 싸우는 몹은 빠진다 (사용자 2026-10-24)
const dngAimsP=e=>e.hp>0&&!e.dead&&(e.dngDemo||e.aggro&&(!e.tgt||e.tgt===P)&&(e.d.fac?mobFoeP(e):e.d.hostile));   // dngDemo: 이펙트 뷰어의 목인장
// 바닥의 빨간 경고원(두목·정예의 내려찍기): 내려찍기가 나에게 닿을 때만 보이고, 내려찍던 몹이 쓰러지거나 내려찍기가 끝나면 사라진다 (사용자 2026-10-24)
const slamHitsP=e=>e.hp>0&&!e.dead&&e.slam>0&&!!e.slamAt&&(e.d.fac?mobFoeP(e):e.d.hostile)&&!P.perch&&dist(P,e.slamAt)<2.4;
function warnShow(f){if(!P||P.hp<=0)return false;const e=f.src;if(e.hp<=0||e.dead||!(e.slam>0))f.life=0;return f.life>0&&slamHitsP(e)}
{const off=e=>{if(e){e.wind=0;e.slam=0;e.dngL=e.dngS=0}};hook('kill',off);hook('mobKilled',off)}   // 쓰러진 몹(내가·몹이 쓰러뜨린)에 칠 준비가 남지 않게
// 버티는 수(천마혈정·생사경)가 남아 있으면 '쓰러진다'고 하지 않는다
const dngSaved=()=>!!P.chGuard&&!G.duel||ssReady();
function dngScanMobs(){let top=0;const saved=dngSaved();
  // e.dngL: 보통 한 방이면 쓰러짐, e.dngS: 내려찍기(1.6배)면 쓰러짐
  for(const e of mobs){if(e.dngDemo)continue;e.dngL=e.dngS=0;if(!dngAimsP(e)||dist(e,P)>DG.range)continue;
    const heavy=(e.d.boss||e.duel||e.d.elite)&&!e.d.ranged,h=hitEst(e,e.atk),hs=heavy?hitEst(e,e.atk*1.6):h;
    if(!saved){e.dngL=h>=P.hp?1:0;e.dngS=hs>=P.hp?1:0}top=Math.max(top,hs)}
  for(const q of eprojs)if(q.src&&q.left>0&&dist(q,P)<4)top=Math.max(top,hitEst(q.src,q.dmg));
  return !saved&&top>=P.hp}
hook('tick',dt=>{if(!P)return;
  dngF=Math.max(0,dngF-dt*2.6);dngDemo=Math.max(0,dngDemo-dt);
  if((dngScan-=dt)<=0){dngScan=.2;const lethal=P.hp>0&&dngScanMobs(),lv=dngDemo>0?2:P.hp<=0?0:lethal?2:P.hp<P.maxHp*DG.low?1:0;
    if(lv===2&&dngLvl<2&&dngDemo<=0){addText(P.x,P.y-.5,'위험','#ff4a3a');if(time-dngWarnT>DG.warnCd){dngWarnT=time;log('위험! 다음 일격에 쓰러질 수 있습니다. 물러나거나 단약을 드십시오.','dmg')}}
    if(lv!==dngLvl){const g=$('hpgauge');if(g){g.classList.toggle('dng',lv===2);g.classList.toggle('dng1',lv===1)}if(lv&&!dngLvl)dngBeat=.999}dngLvl=lv}
  // 박동: 한 번 뛸 때 두 번 쿵쿵. 위험이면 빠르게, 심장 소리도
  if(dngLvl){const per=DG.heart[dngLvl-1];dngBeat+=dt/per;if(dngBeat>=1){dngBeat%=1;if(dngLvl===2||P.hp<P.maxHp*DG.low*.6)sfx('heart',{v:dngLvl===2?1:.55})}
    const b=dngBeat*per;dngPulse=Math.exp(-b*9)+(b>.17?.7*Math.exp(-(b-.17)*9):0)}else dngPulse=0;
  // 생명줄의 잃은 몫: 잠깐 하얗게 남았다가 줄어든다
  const r=clamp(P.hp/P.maxHp,0,1);if(r>=dngGhost)dngGhost=r;else if(time>dngGhostT)dngGhost=Math.max(r,dngGhost-dt*1.2);
  const gi=$('hpg');if(gi&&gi._w!==(gi._w=Math.round(dngGhost*1000)))setW('hpg',dngGhost)});
hook('hurtDone',c=>{const lost=c.hp0-Math.max(0,P.hp);if(lost<=0)return;const k=lost/P.maxHp;
  dngGhostT=time+DG.ghostWait;dngScan=0;
  // 가장자리 번쩍임은 큰 피해일 때만 (사용자 2026-10-23 "큰 피해일 때만")
  const big=k>=DG.big;if(big){dngF=Math.max(dngF,clamp(DG.flash+k*DG.flashK,DG.flash,1));shake=Math.max(shake,.22);for(let i=texts.length-1;i>=0;i--)if(texts[i].c==='#e0675a'&&texts[i].x===P.x){texts[i].big=1;break}}
  const v=big?DG.vib[0]:dngLvl===2?DG.vib[1]:0;if(v&&navigator.vibrate)try{navigator.vibrate(v)}catch(e){}});
hook('loadRegion',()=>{dngF=0;dngScan=0});
// 붉은 가장자리: 크기가 바뀔 때만 다시 그린다 (vignette 와 같은 까닭)
function redVig(){const w=Math.ceil(W),h=Math.ceil(H);if(RVIG&&RVIG.width===w&&RVIG.height===h)return RVIG;
  RVIG=document.createElement('canvas');RVIG.width=w;RVIG.height=h;const g2=RVIG.getContext('2d'),g=g2.createRadialGradient(w/2,h/2,Math.min(w,h)*.42,w/2,h/2,Math.hypot(w,h)/2);
  g.addColorStop(0,'rgba(210,10,0,0)');g.addColorStop(.5,'rgba(210,10,0,.12)');g.addColorStop(.82,'rgba(170,0,0,.62)');g.addColorStop(1,'rgba(120,0,0,.95)');g2.fillStyle=g;g2.fillRect(0,0,w,h);return RVIG}
hook('drawHud',()=>{if(!P)return;
  const a=Math.min(1,dngF+(dngLvl===2?.42+.5*dngPulse:dngLvl===1?.16+.26*dngPulse:0));if(a<.01)return;
  ctx.globalAlpha=a;ctx.drawImage(redVig(),-30,-30,W+60,H+60);ctx.globalAlpha=1});
// 적의 공격 예고: 나를 노리고 칠 준비를 하는 적 가운데, 그 한 방에 쓰러질 수 있는 적에게만 머리 위 !! 와 닫히면 맞는 고리를 띄운다
// (사용자 2026-10-23: "모든 공격에 띄우지 말고 내가 죽을 수도 있는 공격에만"). 칠 준비는 0.4초뿐이라 0.2초마다 하는 훑기를 기다리지 않고 그 자리에서 어림한다
hook('drawTop',()=>{if(!P||P.hp<=0)return;const saved=dngSaved();
  for(const e of mobs){const sl=e.slam>0;if(!(e.wind>0||sl)||!dngAimsP(e))continue;
    const lt=e.dngDemo?e.dngL:!saved&&(sl?hitEst(e,e.atk*1.6)>=P.hp&&dist(P,e.slamAt)<2.2:(e.d.ranged||dist(e,P)<e.reach+.6)&&hitEst(e,e.atk)>=P.hp);if(!lt)continue;   // 닿지 않을 거리면 띄우지 않는다
    const p=toScreen(e.x,e.y),wm=e.d.boss?.5:.4,k=sl?1-e.slam/1.1:clamp(1-e.wind/wm,0,1),col='255,60,40';
    p.y-=e.z||0;
    if(!sl){const s=1.9-.9*k;ctx.strokeStyle=`rgba(${col},${.5+.5*k})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,TW/2*s*.8,TH/2*s*.8,0,0,7);ctx.stroke()}
    const sz=26*(1+.18*Math.sin(time*28)),y=p.y-(e.d.boss?104:90);
    ctx.font=`bold ${sz}px "Song Myung",serif`;ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText('!!',p.x,y);ctx.fillStyle=`rgb(${col})`;ctx.fillText('!!',p.x,y)}});

// ================= 빈사 (v172) =================
// 사용자 2026-10-23: "빈사 상태를 넣어서 남은 hp가 0이 되면 1이 남게 되고, 운기조식으로 회복하면 빈사 상태를 벗어나게 (블레이드앤소울1)".
// 블소1(2011 CBT)의 탈진: 생명이 바닥나면 기어서 안전한 곳까지 물러나고, 운기조식으로 회복한다. 운기조식 중 공격당하면 사망.
// 여기서는: 생명이 0이 되면 1로 버티며 빈사에 든다(그 순간 잠깐 무적, 나를 노리던 적은 잠시 물러선다). 빈사 중에는 기어서만 움직이고 싸울 수 없다.
// 빈사 중 또 맞아 0이 되면 쓰러진다. 운기조식 중에 생명이 DANGER.binsa.out 이상이면 벗어난다 (사용자: 운기조식으로만 풀린다. 회복약은 생명만 채운다).
// 심법이 없어 운기조식을 못 하는 사람(무관 초반)도 빈사 중에는 앉아 기혈을 고를 수 있게 한다 (내공은 차지 않는다: qiRegen 이 심법을 본다).
// 생사경이 버텨 주는 해(g_beyond.js 'lethal')와 비무(G.duel)는 그쪽이 먼저다.
const BS=DG.binsa;
hook('lethal',()=>{if(P.hp>0||P.binsa||G.duel)return;
  P.binsa={t:time};P.hp=1;P.inv=Math.max(P.inv||0,BS.inv);P.chan=null;P.poison=0;P.medit=false;P.target=null;P.path=null;P.leap=null;
  // v194 (점검): 곁의 적은 나를 노리지 않았어도 밀쳐내고(push칸까지), lose초 동안 덤비지 않는다. 비무 상대·고정 경비는 그대로
  for(const e of mobs)if(e.hp>0&&!e.duel&&(e.tgt===P||e.aggro&&!e.tgt||e.d&&e.d.hostile&&dist(e,P)<(BS.near||0))){e.aggro=false;e.tgt=null;e.wind=0;e.slam=0;e.lost=time+BS.lose;
    const d=dist(e,P),k=BS.push||0;if(k&&d<k&&!e.fixed){const ux=d>.01?(e.x-P.x)/d:Math.cos(e.id||1),uy=d>.01?(e.y-P.y)/d:Math.sin(e.id||1),nx=P.x+ux*k,ny=P.y+uy*k;if(walkAt(nx,ny)){e.x=nx;e.y=ny;fx.push({t:'puff',x:nx,y:ny,life:.4})}}}
  dngF=1;shake=Math.max(shake,.3);addText(P.x,P.y-.5,'빈사','#ff4a3a');sfx('heart',{v:1});
  log(`빈사 상태입니다. 기어서 물러나 운기조식으로 생명을 ${Math.round(BS.out*100)}%까지 되찾으면 벗어납니다. 이대로 또 맞으면 쓰러집니다.`,'dmg');
  if(typeof showBanner==='function')showBanner('빈사','운기조식으로 회복하라')});
hook('tick',dt=>{if(!P||!P.binsa)return;
  if(P.hp<=0){P.binsa=null;return}
  // 빈사 중 운기조식은 생명을 더 빨리 되찾는다 (g_life.js 의 평소 회복에 (heal-1)배를 더한다)
  if(P.medit&&P.lastHit>4)P.hp=Math.min(P.maxHp,P.hp+(1+P.st.qi*.2)*3*(BS.heal-1)*dt);
  if(P.medit&&P.hp>=P.maxHp*BS.out){P.binsa=null;addText(P.x,P.y-.5,'회복','#9fe0a0');log('기혈이 돌아와 빈사에서 벗어났습니다.','sys')}});
// 빈사 중에는 싸울 수 없다: 공격·초식·필살·특기·보법·경공을 막는다
{const block=name=>{const o=window[name];if(typeof o!=='function')return;window[name]=function(...a){if(P&&P.binsa){if(time-(P.binsaMsg||-9)>2){P.binsaMsg=time;log('빈사 상태라 싸울 수 없습니다. 물러나 운기조식을 하십시오.','info')}return false}return o.apply(this,a)}};
  ['basicStrike','autoAttack','useForm','ultimate','special','bobeop','leap'].forEach(block)}
hook('loadRegion',()=>{if(P&&P.binsa)P.binsa.t=time});
{const o=meditate;meditate=function(){if(P&&P.binsa&&!P.medit&&typeof simCur==='function'&&simCur().none){
  if(inCombat()){log('싸움 중에는 운기조식을 할 수 없습니다.','info');return}P.path=null;P.target=null;P.medit=true;log('빈사: 앉아 기혈을 고른다. 생명이 돌아오면 빈사에서 벗어난다.','info');return}return o()}}

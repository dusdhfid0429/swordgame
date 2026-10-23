// ================= 피격·빈사 알림 (v172) =================
// 사용자 2026-10-23: "데미지를 입는 타이밍을 인지하기 어렵다. 이걸 맞으면 죽을 수도 있다를 피드백으로 알 수 있으면"
//  1) 맞는 순간: 화면 가장자리가 붉게 번쩍인다(많이 잃을수록 진하게). 큰 피해는 큰 숫자·센 흔들림·진동. 생명줄의 잃은 몫은 잠깐 하얗게 남았다가 줄어든다
//  2) 나를 노리는 적이 칠 준비(e.wind)를 하면 머리 위 '!'와 좁혀 드는 고리(고리가 닫히면 맞는다). 그 한 방에 쓰러질 만하면 붉은 '!!'
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
const dngAimsP=e=>e.hp>0&&(e.dngDemo||e.aggro&&(!e.tgt||e.tgt===P)&&(e.d.fac?mobFoeP(e):e.d.hostile));   // dngDemo: 이펙트 뷰어의 목인장
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
  dngF=Math.max(dngF,clamp(DG.flash+k*DG.flashK,DG.flash,1));dngGhostT=time+DG.ghostWait;dngScan=0;
  const big=k>=DG.big;if(big){shake=Math.max(shake,.22);for(let i=texts.length-1;i>=0;i--)if(texts[i].c==='#e0675a'&&texts[i].x===P.x){texts[i].big=1;break}}
  const v=big?DG.vib[0]:dngLvl===2?DG.vib[1]:0;if(v&&navigator.vibrate)try{navigator.vibrate(v)}catch(e){}});
hook('loadRegion',()=>{dngF=0;dngScan=0});
// 붉은 가장자리: 크기가 바뀔 때만 다시 그린다 (vignette 와 같은 까닭)
function redVig(){const w=Math.ceil(W),h=Math.ceil(H);if(RVIG&&RVIG.width===w&&RVIG.height===h)return RVIG;
  RVIG=document.createElement('canvas');RVIG.width=w;RVIG.height=h;const g2=RVIG.getContext('2d'),g=g2.createRadialGradient(w/2,h/2,Math.min(w,h)*.42,w/2,h/2,Math.hypot(w,h)/2);
  g.addColorStop(0,'rgba(210,10,0,0)');g.addColorStop(.5,'rgba(210,10,0,.12)');g.addColorStop(.82,'rgba(170,0,0,.62)');g.addColorStop(1,'rgba(120,0,0,.95)');g2.fillStyle=g;g2.fillRect(0,0,w,h);return RVIG}
hook('drawHud',()=>{if(!P)return;
  const a=Math.min(1,dngF+(dngLvl===2?.42+.5*dngPulse:dngLvl===1?.16+.26*dngPulse:0));if(a<.01)return;
  ctx.globalAlpha=a;ctx.drawImage(redVig(),-30,-30,W+60,H+60);ctx.globalAlpha=1});
// 적의 공격 예고: 나를 노리고 칠 준비를 하는 적 머리 위 ! 와, 닫히면 맞는 고리
hook('drawTop',()=>{if(!P||P.hp<=0)return;
  for(const e of mobs){const sl=e.slam>0;if(!(e.wind>0||sl)||!dngAimsP(e))continue;
    const p=toScreen(e.x,e.y),wm=e.d.boss?.5:.4,k=sl?1-e.slam/1.1:clamp(1-e.wind/wm,0,1),lt=sl?e.dngS:e.dngL,col=lt?'255,60,40':'255,200,90';
    p.y-=e.z||0;
    if(!sl){const s=1.9-.9*k;ctx.strokeStyle=`rgba(${col},${.5+.5*k})`;ctx.lineWidth=lt?3:2;ctx.beginPath();ctx.ellipse(p.x,p.y,TW/2*s*.8,TH/2*s*.8,0,0,7);ctx.stroke()}
    const t=lt?'!!':'!',sz=(lt?26:21)*(1+.18*Math.sin(time*(lt?28:18))),y=p.y-(e.d.boss?104:90);
    ctx.font=`bold ${sz}px "Song Myung",serif`;ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(t,p.x,y);ctx.fillStyle=`rgb(${col})`;ctx.fillText(t,p.x,y)}});

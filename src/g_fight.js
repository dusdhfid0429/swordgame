// ================= 전투 손맛: 초식 직접 고르기 · 간파 · 우두머리 수 셋 · 내공 대결 (v223, 개선 계획 4절 · 동훈님 2026-11-01) =================
// 자동 연속기는 그대로 두고, 고르는 순간을 몇 개 더한다. 단추는 늘리지 않는다.
//  1 초식 직접 고르기: 공격 단추를 위로 밀면 가장 센 초식, 옆으로 밀면 범위 초식. 고른 초식은 피해가 조금 세다 (fpick)
//  2 간파: 적이 칠 준비(예고 !·!!, 내려찍기, 우두머리 수) 중일 때 보법을 쓰면 시간이 잠깐 느려지고 그 수는 빗나가며, 다음 일격은 반드시 치명타
//  3 우두머리 수: 두목·장문인·호법·마두(d.boss)는 돌진·회전·연환 가운데 하나를 예고한 뒤 쓴다 (바닥 표시 · 이름 외치기)
//  4 내공 대결: 경지가 비슷한 강적과 검이 맞붙으면 화면을 연타해 기를 밀어붙인다
// 시간 느리게: 루프(g_draw.js loop)가 fightK(dt)를 곱한다. 실제 시간으로 돌아온다. 수치는 data/fight.json (FIGHT)
const FT=GD.FIGHT;
let fSlow=1,fSlowEnd=0,fClash=null,fClashCd=0;   // fSlowEnd: 실제 시각(performance.now) 기준
// 루프가 부른다: 실제 dt로 느린 시간을 풀고, 내공 대결 시계를 돌린다. 돌려준 배율을 update에 곱한다
function fightK(dt){if(fClash){clashTick(dt);return .02}if(fSlow<1&&performance.now()>=fSlowEnd)fSlow=1;return fSlow}
function slowMo(k,dur){const now=performance.now();if(now>=fSlowEnd)fSlow=1;fSlow=Math.min(fSlow,k);fSlowEnd=Math.max(fSlowEnd,now+dur*1000)}

// ---- 1 초식 직접 고르기 ----
const isWide=f=>FT.pick.wide.includes(f.p);
function pickForm(kind){if(!P||P.hp<=0)return -1;const a=art(),fs=a.forms.map((f,i)=>({f,i})).filter(({i})=>formReady(i));if(!fs.length)return -1;
  if(kind==='wide'){const w=fs.filter(({f})=>isWide(f));if(w.length)return w.sort((x,y)=>(engage(y.f)-engage(x.f))||(y.f.m-x.f.m))[0].i}
  return fs.sort((x,y)=>(y.f.m||0)-(x.f.m||0))[0].i}
function formPick(kind){if(typeof touchTarget==='function')touchTarget();const i=pickForm(kind);
  if(i<0){addText(P.x,P.y-.4,'쓸 초식이 없다','#9a8d72');return false}
  if(useForm(i,true)){P.fpick=time;addText(P.x,P.y-.7,kind==='wide'?'범위 초식':'강한 초식','#ffd36a');return true}return false}
hook('hit',c=>{if(c.from!==P)return;
  if(P.fpick&&time-P.fpick<FT.pick.win)c.m*=FT.pick.bonus;
  if(P.kanpaC>time){c.m*=FT.kanpa.dm;c.hm=-999;P.buff.crit=Math.max(P.buff.crit||0,.05);P.kanpaC=0;addText(c.e.x,c.e.y-.8,'반격','#ffe08a')}});

// ---- 2 간파 ----
// 지금 나를 칠 수: 칠 준비 중인 근접·내려찍기·우두머리 수·가까이 날아오는 투사체
function kanpaThreat(){const K=FT.kanpa;
  for(const e of mobs){if(e.hp<=0||!dngAimsP(e)||dist(e,P)>K.near+e.reach)continue;
    if(e.wind>0||(e.slam>0&&e.slamAt&&dist(P,e.slamAt)<2.4)||(e.bp&&e.bp.t<e.bp.m.warn))return e}
  for(const q of eprojs)if(q.left>0&&dist(q,P)<K.near){const vx=P.x-q.x,vy=P.y-q.y;if(vx*q.vx+vy*q.vy>0)return q.src||q}
  return null}
hook('stepDone',()=>{if(!P||(P.kanpaCd||0)>time)return;
  const e=kanpaThreat();if(!e)return;const K=FT.kanpa;P.kanpaCd=time+K.cd;P.kanpaC=time+K.cw;P.kanpaN=(P.kanpaN||0)+1;
  if(e.wind>0){e.wind=0;e.cd=Math.max(e.cd,.9)}if(e.slam>0&&e.slamAt){fx.push({t:'puff',x:e.slamAt.x,y:e.slamAt.y,life:.5});e.slam=0;e.slamAt=null;e.cd=Math.max(e.cd||0,.9)}if(e.bp)e.bp.miss=1;
  for(const q of eprojs)if(q.src===e&&dist(q,P)<K.near)q.left=0;
  slowMo(K.slow,K.dur);P.inv=Math.max(P.inv||0,.35);addText(P.x,P.y-.9,'간파!','#bfe8ff');sfx('dodge',{v:1.2});
  if(typeof feat==='function'&&P.kanpaN===1)log('간파! 적의 수를 읽고 비켜섰다. 다음 일격은 반드시 치명타다.','xp')});

// ---- 3 우두머리 수 셋 ----
const BM=FT.boss;
const bossOk=e=>e.d&&e.d.boss&&!e.acadBoss&&!e.duel&&!e.dngDemo&&e.aggro&&(!e.tgt||e.tgt===P)&&e.hp>0;
let FIGHT_FORCE=null;   // 시험용: 이 수만 쓴다
function bossStart(e){const m=(FIGHT_FORCE&&BM.moves.find(x=>x.k===FIGHT_FORCE))||BM.moves[Math.floor(Math.random()*BM.moves.length)],tx=P.x,ty=P.y,l=Math.hypot(tx-e.x,ty-e.y)||1;
  e.bp={m,t:0,ux:(tx-e.x)/l,uy:(ty-e.y)/l,ox:e.x,oy:e.y,marks:m.k==='rain'?[]:null,hit:0};e.moving=false;
  if(typeof callout==='function'&&dist(e,P)<BM.range+2)callout(m.n,e.kind);}
const inLine=(b,x,y)=>{const m=b.m,px=x-b.ox,py=y-b.oy,u=px*b.ux+py*b.uy,v=Math.abs(px*b.uy-py*b.ux);return u>-.3&&u<m.len&&v<m.w};
function bossTick(e,dt){const b=e.bp,m=b.m;b.t+=dt;e.wind=0;
  if(m.k==='dash'){if(b.t>=m.warn&&!b.hit){b.hit=1;const ex=b.ox+b.ux*m.len,ey=b.oy+b.uy*m.len;
      if(!b.miss&&!P.perch&&inLine(b,P.x,P.y))hurtP(e.atk*m.dm,e);for(const a of allies)if(inLine(b,a.x,a.y))hurtAlly(a,e.atk*m.dm);
      const st=12;for(let i=1;i<=st;i++){const x=b.ox+b.ux*m.len*i/st,y=b.oy+b.uy*m.len*i/st;if(!walkAt(x,y))break;e.x=x;e.y=y}shake=Math.max(shake,.25);fx.push({t:'puff',x:e.x,y:e.y,life:.5})}
    if(b.t>=m.warn+.25)e.bp=null}
  else if(m.k==='spin'){if(b.t>=m.warn&&!b.hit){b.hit=1;if(!b.miss&&!P.perch&&dist(P,e)<m.r)hurtP(e.atk*m.dm,e);for(const a of allies)if(dist(a,e)<m.r)hurtAlly(a,e.atk*m.dm);
      shake=Math.max(shake,.3);const FX=foeX(e);fRing(FX,e,m.r,FX?FX.art.c:'255,150,90',5,.4)}if(b.t>=m.warn+.3)e.bp=null}
  else if(m.k==='rain'){while(b.marks.length<m.n3&&b.t>=b.marks.length*m.gap)b.marks.push({x:P.x,y:P.y,at:b.t,done:0});
    for(const k of b.marks)if(!k.done&&b.t>=k.at+m.warn){k.done=1;if(!b.miss&&!P.perch&&dist(P,k)<m.r)hurtP(e.atk*m.dm,e);fx.push({t:'puff',x:k.x,y:k.y,life:.5});shake=Math.max(shake,.15)}
    if(b.marks.length>=m.n3&&b.marks.every(k=>k.done))e.bp=null}
  if(!e.bp)e.bpT=time+BM.every[0]+Math.random()*(BM.every[1]-BM.every[0])}
hook('mobAct',c=>{const e=c.e;if(e.bp){if(e.hp<=0||e.stun>0){e.bp=null;return}bossTick(e,c.dt);c.stop=true;return}
  if(!bossOk(e)||fClash)return;if(e.bpT==null){e.bpT=time+2+Math.random()*2;return}
  if(time>=e.bpT&&!e.wind&&!(e.slam>0)&&dist(e,P)<BM.range){bossStart(e);c.stop=true}});
// 바닥 예고: 붉은 띠·고리·원. 차오를수록 진해진다
function bossMarkDraw(e){const b=e.bp,m=b.m,k=clamp(b.t/m.warn,0,1);ctx.save();ctx.globalAlpha=.25+.45*k;ctx.fillStyle='rgba(220,50,40,.35)';ctx.strokeStyle='rgba(255,90,70,.9)';ctx.lineWidth=2;
  const ell=(x,y,r)=>{const p=toScreen(x,y);ctx.beginPath();ctx.ellipse(p.x,p.y,r*TW/2,r*TH/2,0,0,7);ctx.fill();ctx.stroke()};
  if(m.k==='dash'&&!b.hit){const a=toScreen(b.ox+b.uy*m.w,b.oy-b.ux*m.w),c2=toScreen(b.ox-b.uy*m.w,b.oy+b.ux*m.w),ex=b.ox+b.ux*m.len,ey=b.oy+b.uy*m.len,d=toScreen(ex-b.uy*m.w,ey+b.ux*m.w),f=toScreen(ex+b.uy*m.w,ey-b.ux*m.w);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(f.x,f.y);ctx.lineTo(d.x,d.y);ctx.lineTo(c2.x,c2.y);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(m.k==='spin'&&!b.hit)ell(e.x,e.y,m.r*(.4+.6*k));
  else if(m.k==='rain')for(const q of b.marks)if(!q.done){const kk=clamp((b.t-q.at)/m.warn,0,1);ctx.globalAlpha=.25+.5*kk;ell(q.x,q.y,m.r*(.5+.5*kk))}
  ctx.restore()}
hook('drawList',list=>{if(!playing)return;for(const e of mobs)if(e.bp&&e.hp>0)list.push({L:LY.BACK,d:99000,f:()=>bossMarkDraw(e)})});

// ---- 4 내공 대결 ----
const clashOk=e=>e&&e.hp>0&&(e.d.boss||e.d.elite||e.duel)&&!e.dngDemo&&!e.acadSpar&&Math.abs(mobRealm(e)-realmIdx())<=FT.clash.rd&&mobRealm(e)>=realmIdx()&&!P.perch&&!P.leap;
hook('hitDone',c=>{const e=c&&c.e;if(fClash||!P||P.hp<=0||time<fClashCd||!clashOk(e)||Math.random()>FT.clash.chance)return;clashStart(e)});
function clashStart(e){const C=FT.clash;fClashCd=time+C.cd;fClash={e,t:C.dur,v:0,taps:0,k:C.push*(mobRealm(e)+1)/(realmIdx()+1)};
  let el=document.getElementById('clash');if(!el){el=document.createElement('div');el.id='clash';$('app').appendChild(el);
    el.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();clashTap()})}
  el.innerHTML=`<b>내공 대결</b><small>${esc(e.kind)}와(과) 검이 맞붙었다. 화면을 빠르게 두드려 기를 밀어붙여라!</small><div class="cbar"><i></i><em></em></div><span class="ct"></span>`;
  el.hidden=false;el.classList.add('on');sfx('crit',{v:1});shake=Math.max(shake,.2);P.target=e;clashPaint()}
function clashTap(){if(!fClash)return;fClash.taps++;fClash.v=Math.min(1,fClash.v+FT.clash.tap*(1+Math.min(.5,(P.maxQi||0)/4000)));clashPaint();if(navigator.vibrate)try{navigator.vibrate(8)}catch(e){}if(fClash.v>=1)clashEnd(true)}
function clashPaint(){const el=document.getElementById('clash');if(!el||!fClash)return;const i=el.querySelector('.cbar i');if(i)i.style.left=((fClash.v+1)/2*100)+'%';
  const t=el.querySelector('.ct');if(t)t.textContent=`${Math.max(0,fClash.t).toFixed(1)}초`}
function clashTick(dt){const c=fClash;c.t-=dt;c.v=Math.max(-1,c.v-c.k*dt);clashPaint();if(c.v>=1||c.v<=-1||c.t<=0)clashEnd(c.v>0)}
function clashEnd(win){const c=fClash,C=FT.clash,e=c.e;fClash=null;const el=document.getElementById('clash');if(el){el.classList.remove('on');el.hidden=true}
  if(!e||e.hp<=0||!P||P.hp<=0)return;
  if(win){const d=Math.round(e.maxHp*(e.d.boss?C.boss:C.win));damage(e,d,.6,C.stun,P,true);addText(e.x,e.y-.9,'내력으로 밀어냈다','#ffd36a');P.clashW=(P.clashW||0)+1;slowMo(.4,.4)}
  else{hurtP(e.atk*C.lose,e);addText(P.x,P.y-.9,'내력에 밀렸다','#e0675a')}
  log(win?`내공 대결에서 ${e.kind}을(를) 밀어냈다.`:`내공 대결에서 ${e.kind}에게 밀렸다.`,win?'xp':'dmg')}
document.addEventListener('keydown',ev=>{if(fClash&&(ev.code==='Space'||ev.code==='KeyF'||ev.code==='Enter')){ev.preventDefault();clashTap()}},true);
hook('loadRegion',()=>{if(fClash)clashEnd(false);fSlow=1;fSlowEnd=0});

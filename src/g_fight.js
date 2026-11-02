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
// v226 (동훈님 2026-11-02 "하단에 표시되어서 진행되는지 모르겠어"): 화면 가운데 '내공 대결' 문구 → 나·적 내공 게이지와 그 옆 '밀어내기' 단추 →
// 두 사람 사이에서 기운이 맞부딪치는 이펙트, 카메라는 두 사람 가운데로 크게 당긴다 (C.zoom). 대결 중에는 게임 시간이 거의 멈추므로
// 연출·줌·카메라는 실제 dt로 돈다. 단추를 누를 때마다 내 내공이 C.tapQi만큼 든다 (내공이 바닥나면 미는 힘이 C.dryK배)
const clashOk=e=>e&&e.hp>0&&(e.d.boss||e.d.elite||e.duel)&&!e.dngDemo&&!e.acadSpar&&Math.abs(mobRealm(e)-realmIdx())<=FT.clash.rd&&mobRealm(e)>=realmIdx()&&!P.perch&&!P.leap;
hook('hitDone',c=>{const e=c&&c.e;if(fClash||!P||P.hp<=0||time<fClashCd||!clashOk(e)||Math.random()>FT.clash.chance)return;clashStart(e)});
let fClashP=[],fClashFin=null;   // 부딪치는 자리의 불꽃 입자, 끝난 뒤의 폭발 (실제 시간)
const clashCols=e=>{const pc=typeof pFxPair==='function'?pFxPair():['120,190,255','255,255,255'],X=typeof foeX==='function'?foeX(e):null;return{p:pc[0],p2:pc[1]||pc[0],e:X?X.art.c:'255,110,70',e2:X&&X.art.c2||'255,200,140'}};
const rgbCss=c=>`rgb(${c})`;
function clashStart(e){const C=FT.clash;fClashCd=time+C.cd;const rr=(mobRealm(e)+1)/(realmIdx()+1),eq=Math.max(1,Math.round((P.maxQi||100)*rr));
  fClash={e,t:C.dur,v:0,taps:0,k:C.push*rr,age:0,eq,eq0:eq,col:clashCols(e),bump:0};fClashP=[];fClashFin=null;
  // 마주 보게 하고 거리를 맞춘다 (막힌 땅이면 그대로)
  const l=Math.hypot(e.x-P.x,e.y-P.y)||1,ux=(e.x-P.x)/l,uy=(e.y-P.y)/l;P.fx=ux;P.fy=uy;e.fx=-ux;e.fy=-uy;e.wind=0;e.slam=0;e.bp=null;e.moving=false;
  const nx=P.x+ux*C.gap,ny=P.y+uy*C.gap;if(Math.abs(l-C.gap)>.3&&typeof walkAt==='function'&&walkAt(nx,ny)){e.x=nx;e.y=ny}
  let el=document.getElementById('clash');if(!el){el=document.createElement('div');el.id='clash';$('app').appendChild(el);
    el.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();clashTap()})}
  const c=fClash.col,R=i=>typeof RANKS!=='undefined'&&RANKS[i]?RANKS[i]:'';
  el.style.setProperty('--cp',rgbCss(c.p));el.style.setProperty('--ce',rgbCss(c.e));el.style.setProperty('--ci',C.intro+'s');
  el.innerHTML=`<div class="cban"><b>내공 대결</b><small>${esc(e.kind)}와(과) 내력이 맞붙었다</small></div>
<div class="cbox"><div class="crow"><div class="cg"><div class="cnm"><span class="me">나 <em>${esc(R(realmIdx()))}</em></span><span class="ct"></span><span class="fo">${esc(e.kind)} <em>${esc(R(mobRealm(e)))}</em></span></div>
<div class="cbar"><s class="cpL"></s><s class="cpR"></s><i></i></div>
<div class="cq"><span class="qm"></span><span class="qe"></span></div></div>
</div>
<p class="chint">${document.body.classList.contains('touch')?'빛나는 밀어내기(공격) 단추를':'화면이나 스페이스를'} 빠르게 눌러 기를 밀어붙여라</p></div><div class="cres"></div>`;
  clearTimeout(el._t);document.body.classList.add('clash-on');clashAtk(true);el.hidden=false;el.classList.remove('fin','win','lose');el.classList.add('on');sfx('crit',{v:1});shake=Math.max(shake,.25);P.target=e;clashPaint()}
function clashTap(){if(!fClash)return;const C=FT.clash,c=fClash;c.taps++;
  const cost=Math.max(1,Math.round((P.maxQi||0)*C.tapQi)),dry=(P.qi||0)<cost;if(!dry)P.qi-=cost;
  const pw=C.tap*(1+Math.min(.5,(P.maxQi||0)/4000))*(dry?C.dryK:1);c.v=Math.min(1,c.v+pw);c.eq=Math.max(0,c.eq-c.eq0*pw*C.eDrain);c.bump=1;
  clashBurst(10);const b=document.getElementById('t_atk');if(b){b.classList.remove('clhit');void b.offsetWidth;b.classList.add('clhit')}
  shake=Math.max(shake,.06);clashPaint();if(navigator.vibrate)try{navigator.vibrate(8)}catch(e){}if(c.v>=1)clashEnd(true)}
function clashPaint(){const el=document.getElementById('clash');if(!el||!fClash)return;const c=fClash,f=(c.v+1)/2;
  const i=el.querySelector('.cbar i');if(i)i.style.left=(f*100)+'%';const L=el.querySelector('.cpL'),R=el.querySelector('.cpR');if(L)L.style.width=(f*100)+'%';if(R)R.style.width=((1-f)*100)+'%';
  const t=el.querySelector('.ct');if(t)t.textContent=`${Math.max(0,c.t).toFixed(1)}초`;
  const qm=el.querySelector('.qm'),qe=el.querySelector('.qe');if(qm)qm.textContent=`내공 ${Math.round(P.qi||0)} / ${Math.round(P.maxQi||0)}`;if(qe)qe.textContent=`내공 ${Math.round(c.eq)} / ${c.eq0}`;
  el.classList.toggle('dry',(P.qi||0)<Math.max(1,(P.maxQi||0)*FT.clash.tapQi))}
// v228 (동훈님 2026-11-02 "밀어내기 버튼을 공격버튼으로 대체"): 대결 동안 공격 단추 글자가 '밀어내기'로 바뀌고 빛난다. 누르면 민다 (공격·초식 고르기는 막음)
function clashAtk(on){const b=document.getElementById('t_atk');if(!b)return;const sp=b.querySelector('span');if(sp){if(on){if(b.dataset.lbl==null)b.dataset.lbl=sp.textContent;sp.textContent='밀어내기'}else if(b.dataset.lbl!=null){sp.textContent=b.dataset.lbl;delete b.dataset.lbl}}
  b.classList.toggle('clash',!!on);if(!on)b.classList.remove('clhit');
  if(!b._clash){b._clash=1;b.addEventListener('pointerdown',ev=>{if(!fClash)return;ev.preventDefault();ev.stopImmediatePropagation();clashTap()},true);
    for(const t of['pointermove','pointerup','click'])b.addEventListener(t,ev=>{if(fClash||b.classList.contains('clash')){ev.stopImmediatePropagation()}},true)}}
// 두 사람 가운데·부딪치는 자리 (세계 좌표)
const clashMid=c=>({x:(P.x+c.e.x)/2,y:(P.y+c.e.y)/2});
const clashPt=c=>{const f=.5+.42*c.v;return{x:P.x+(c.e.x-P.x)*f,y:P.y+(c.e.y-P.y)*f}};
function clashBurst(n){const c=fClash;if(!c)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=60+Math.random()*190;fClashP.push({a,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7-40,x:0,y:0,l:.35+Math.random()*.4,m:.75,me:Math.random()<.5})}}
function clashTick(dt){const c=fClash,C=FT.clash;c.age+=dt;c.bump=Math.max(0,c.bump-dt*5);
  if(c.age>=C.intro){c.t-=dt;c.v=Math.max(-1,c.v-c.k*dt);c.eq=Math.max(0,c.eq-c.eq0*c.k*dt*C.eDrain*.25)}
  if(Math.random()<dt*40)clashBurst(1);for(const p of fClashP){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt}fClashP=fClashP.filter(p=>p.l>0);
  clashCam(dt);clashPaint();if(c.v>=1||c.v<=-1||c.t<=0)clashEnd(c.v>0)}
// 카메라: 두 사람 가운데로 옮기고 C.zoom배로 당긴다 (g_read.js rdZ·rdZoomApply)
function clashCam(dt){const C=FT.clash,m=clashMid(fClash),k=Math.min(1,dt*C.zin);
  if(typeof rdZ==='number'&&typeof rdZoomApply==='function'&&!RD_Q){rdZ+=(C.zoom-rdZ)*k;rdZoomApply()}
  const t=iso(m.x,m.y);t.y-=gH(m.x,m.y);cam.x+=(t.x-cam.x)*k;cam.y+=(t.y-cam.y)*k}
function clashEnd(win){const c=fClash,C=FT.clash,e=c.e;fClash=null;const el=document.getElementById('clash');
  if(el){el.classList.add('fin',win?'win':'lose');const r=el.querySelector('.cres');if(r)r.innerHTML=`<b>${win?'밀어냈다!':'밀렸다…'}</b>`;clearTimeout(el._t);el._t=setTimeout(()=>{el.classList.remove('on','fin','win','lose');el.hidden=true;document.body.classList.remove('clash-on')},C.outro*1000)}
  clashAtk(false);const lo=win?e:P;fClashFin={x:lo.x,y:lo.y,win,t0:performance.now(),col:c.col};fClashP=[];
  if(!e||e.hp<=0||!P||P.hp<=0)return;shake=Math.max(shake,.45);
  if(win){const d=Math.round(e.maxHp*(e.d.boss?C.boss:C.win));damage(e,d,.6,C.stun,P,true);addText(e.x,e.y-.9,'내력으로 밀어냈다','#ffd36a');P.clashW=(P.clashW||0)+1;slowMo(.4,.4)}
  else{hurtP(e.atk*C.lose,e,true);addText(P.x,P.y-.9,'내력에 밀렸다','#e0675a')}
  log(win?`내공 대결에서 ${e.kind}을(를) 밀어냈다.`:`내공 대결에서 ${e.kind}에게 밀렸다.`,win?'xp':'dmg')}
// ---- 내공 대결 이펙트: 두 사람의 기운이 줄기로 뻗어 가운데서 부딪친다 ----
function clashBeam(a,b,col,col2,w,ph){const dk=isDark(col);ctx.globalCompositeOperation=dk?'source-over':'lighter';
  const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,N=14;
  for(const [ww,al,cc] of [[w*2.6,.22,col],[w*1.4,.55,col],[w*.45,.95,dk?col2:'255,255,255']]){ctx.strokeStyle=`rgba(${cc},${al})`;ctx.lineWidth=ww;ctx.lineCap='round';ctx.beginPath();
    for(let i=0;i<=N;i++){const t=i/N,o=Math.sin(t*9+ph)*w*.35*Math.sin(t*Math.PI);const x=a.x+dx*t+nx*o,y=a.y+dy*t+ny*o;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}}
function clashAura(p,col,k){const dk=isDark(col);ctx.globalCompositeOperation=dk?'source-over':'lighter';const r=34+8*Math.sin(performance.now()/90)+14*k;
  ctx.globalAlpha=dk?.45:.38;ctx.drawImage(glowSpr(col),p.x-r,p.y-30-r*1.3,r*2,r*2.4);
  ctx.globalAlpha=dk?.4:.35;for(let i=0;i<3;i++){const fl=(performance.now()/400+i/3)%1,hh=70+40*k;ctx.drawImage(glowSpr(col),p.x-14+Math.sin(i*2.1+fl*6)*8,p.y-20-fl*hh-20,28,40*(1-fl)+16)}ctx.globalAlpha=1;
  ctx.strokeStyle=`rgba(${col},.6)`;ctx.lineWidth=2;const q=(performance.now()/700)%1;ctx.beginPath();ctx.ellipse(p.x,p.y,(20+q*26),(10+q*13),0,0,7);ctx.globalAlpha=1-q;ctx.stroke();ctx.globalAlpha=1}
function clashDraw(){const now=performance.now();
  if(fClash){const c=fClash,C=FT.clash,col=c.col,ph=now/80,pin=Math.min(1,c.age/C.intro);
    const pp=toScreen(P.x,P.y),ep=toScreen(c.e.x,c.e.y),pt=clashPt(c),xp=toScreen(pt.x,pt.y);pp.y-=P.z||0;ep.y-=c.e.z||0;
    const hy=34,ph1={x:pp.x,y:pp.y-hy},eh={x:ep.x,y:ep.y-hy},x0={x:xp.x,y:xp.y-hy};
    // 주변을 어둡게: 가운데만 밝게 남긴다
    ctx.save();const g=ctx.createRadialGradient(x0.x,x0.y,30,x0.x,x0.y,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.3,`rgba(4,6,14,${.35*pin})`);g.addColorStop(1,`rgba(4,6,14,${.85*pin})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // 집중선: 화면 가장자리에서 부딪치는 자리로 모이는 흰 줄 (만화의 기 싸움 연출)
    const fr=Math.floor(now/70),R0=Math.min(W,H)*.32,R1=Math.hypot(W,H);ctx.fillStyle=`rgba(255,250,235,${.22*pin})`;ctx.beginPath();
    for(let i=0;i<56;i++){const a=(i+hash(i,fr)*.8)/56*Math.PI*2,r0=R0*(.8+hash(fr,i)*.7),wd=.006+hash(i+3,fr)*.014;
      ctx.moveTo(x0.x+Math.cos(a)*r0,x0.y+Math.sin(a)*r0);ctx.lineTo(x0.x+Math.cos(a-wd)*R1,x0.y+Math.sin(a-wd)*R1);ctx.lineTo(x0.x+Math.cos(a+wd)*R1,x0.y+Math.sin(a+wd)*R1);ctx.closePath()}ctx.fill();
    // 땅이 갈라지듯 퍼지는 고리
    ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const q=((now/900)+i/3)%1;ctx.strokeStyle=`rgba(255,235,190,${.35*(1-q)*pin})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(xp.x,xp.y,20+q*120,10+q*60,0,0,7);ctx.stroke()}
    clashAura(pp,col.p,c.v>0?c.v:0);clashAura(ep,col.e,c.v<0?-c.v:0);
    if(pin>.25){const w=10+6*c.bump,grow=Math.min(1,(c.age-C.intro*.25)/(C.intro*.5));
      const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
      clashBeam(ph1,lerp(ph1,x0,grow),col.p,col.p2,w*(1+Math.max(0,c.v)*.5),ph);clashBeam(eh,lerp(eh,x0,grow),col.e,col.e2,w*(1+Math.max(0,-c.v)*.5),-ph);
      if(grow>=1){ctx.globalCompositeOperation='lighter';const r=26+8*Math.sin(now/45)+22*c.bump;
        ctx.drawImage(glowSpr(col.p),x0.x-r*1.4,x0.y-r*1.4,r*2.8,r*2.8);ctx.drawImage(glowSpr(col.e),x0.x-r,x0.y-r,r*2,r*2);
        ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.arc(x0.x,x0.y,11+7*c.bump+3*Math.sin(now/30),0,7);ctx.fill();
        // 두 기운이 맞물려 도는 고리 (내 색 반, 상대 색 반)
        for(let j=0;j<2;j++){const rot=now/260*(j?-1:1),rr=r*.9+j*10;ctx.lineWidth=3;ctx.strokeStyle=`rgba(${j?col.e:col.p},.75)`;ctx.beginPath();ctx.ellipse(x0.x,x0.y,rr,rr*.55,0,rot,rot+Math.PI*1.1);ctx.stroke()}
        // 번개처럼 튀는 줄기
        ctx.strokeStyle='rgba(255,250,230,.8)';ctx.lineWidth=1.5;for(let j=0;j<4;j++){let a=Math.random()*7,x=x0.x,y=x0.y;ctx.beginPath();ctx.moveTo(x,y);for(let s=0;s<4;s++){a+=(Math.random()-.5)*1.4;x+=Math.cos(a)*14;y+=Math.sin(a)*10;ctx.lineTo(x,y)}ctx.stroke()}
        for(const p of fClashP){ctx.globalAlpha=Math.min(1,p.l/p.m*1.5);ctx.fillStyle=`rgb(${p.me?col.p:col.e})`;ctx.fillRect(x0.x+p.x-1.5,x0.y+p.y-1.5,3,3)}ctx.globalAlpha=1}}
    ctx.restore()}
  else if(fClashFin){const f=fClashFin,k=(now-f.t0)/1000/FT.clash.outro;if(k>=1){fClashFin=null;return}
    const p=toScreen(f.x,f.y),col=f.win?f.col.p:f.col.e;ctx.save();ctx.globalCompositeOperation=isDark(col)?'source-over':'lighter';
    const r=40+k*170;ctx.globalAlpha=.75*(1-k);ctx.drawImage(glowSpr(col),p.x-r,p.y-34-r,r*2,r*2);ctx.strokeStyle='rgba(255,245,220,.9)';ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.ellipse(p.x,p.y-10,r*.8,r*.4,0,0,7);ctx.stroke();
    if(k<.12){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=(.12-k)/.12*.3;ctx.fillStyle='#fff8e0';ctx.fillRect(0,0,W,H)}ctx.restore()}}
hook('drawTop',clashDraw);
document.addEventListener('keydown',ev=>{if(fClash&&(ev.code==='Space'||ev.code==='KeyF'||ev.code==='Enter')){ev.preventDefault();clashTap()}},true);
hook('loadRegion',()=>{if(fClash)clashEnd(false);fSlow=1;fSlowEnd=0});

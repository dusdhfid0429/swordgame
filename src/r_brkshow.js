// ================= 경지 돌파 연출 틀 (v241, 사용자 2026-11-09 "이펙트가 너무 약해", "설명 메시지 때문에 연출이 하나도 안 보여") =================
// 1) 정적: 화면이 어두워지고 위아래 검은 띠, 카메라가 주인공에게 다가간다 (HUD 단추·알림은 잠시 걷는다)
// 2) 몸 안: r_fx.js drawBrk (소주천·대주천 …) 3) 몸 밖: brkOuter, 머리 위·주변·하늘의 현상
// 4) 터짐: 충격·주변 적 밀림·붓글씨 한자 이름 5) 잔상: 돌파 뒤 한동안 머리 위 현상이 은은하게 남는다 (P.brkA)
// 연출 동안 뜨는 알림·배너는 붙잡아 두었다가(BRKH) 끝난 뒤 '돌파 결과' 한 장(brkCard)으로 묶어 보여 준다.
// 수치는 data/brkfx.json BRK_SHOW
const BKS=Object.assign({dim:.5,bar:.085,zoom:1.45,camy:.16,outro:1.6,burst:[],push:3.5,aura:45,auraFade:8},GD.BRK_SHOW||{});
let BRKS=null,BRKH=null;   // BRKS: 지금 도는 돌파 연출, BRKH: 붙잡아 둔 알림 {sys,ban,story}
function brkHoldBegin(){if(!BRKH)BRKH={sys:[],ban:[],story:[]};return BRKH}
function brkHold(kind,a){if(BRKS&&performance.now()-BRKS.t0>25000)brkShowEnd();if(!BRKH)return false;BRKH[kind].push(a);return true}   // 무슨 일로 연출이 멈춰도 알림을 영영 삼키지 않게
function brkHoldFlush(card){const h=BRKH;BRKH=null;if(!h)return;
  if(card&&(h.sys.length||h.ban.length))brkCard(h);else{for(const a of h.ban)showBanner(...a);for(const a of h.sys)sysMsg(...a)}
  for(const a of h.story)storyBanner(...a)}
function brkShowStart(f,d){brkHoldBegin();const trn=typeof trnOpen!=='undefined'&&trnOpen;if(trn)closeTrain();
  BRKS={f,d,r:f.r,t0:performance.now(),age:0,out:-1,burst:false,bt:0,col:d.col,trn:trn||!!(BRKS&&BRKS.trn)};document.body.classList.add('brk-on');
  brkCardClose(true);for(const p of[...SYS.children])p.remove();document.body.classList.remove('sys-on');$('banner').classList.remove('on');{const sb=$('sban');if(sb)sb.classList.remove('on')}}
// 들어오고 나가는 세기 0..1
function brkEnv(){const b=BRKS;if(!b)return 0;return Math.min(1,b.age/.5)*(b.out<0?1:Math.max(0,1-b.out/BKS.outro))}
function brkZoom(){return BRKS&&BRKS.out<0?BKS.zoom:0}
function brkCamDY(){return BRKS?(typeof H==='number'?H:0)*BKS.camy:null}
function brkBurst(b){b.burst=true;b.bt=b.age;shake=Math.max(shake,.4+b.r*.04);if(typeof sfx==='function')sfx('ult');
  for(const e of mobs){if(e.hp<=0||e.d.boss)continue;const l=Math.hypot(e.x-P.x,e.y-P.y);if(l>BKS.push||l<.01)continue;const k=1.1*(1-l/BKS.push)+.3;e.kb={x:(e.x-P.x)/l*k,y:(e.y-P.y)/l*k};e.stun=Math.max(e.stun||0,.8)}}
function brkShowEnd(){const b=BRKS;BRKS=null;document.body.classList.remove('brk-on');if(!b)return;
  if(P&&BKS.aura>0)P.brkA={r:b.r,t:BKS.aura,col:b.col};brkCard.trn=b.trn;brkHoldFlush(true);if(!brkCardEl()&&b.trn&&typeof openTrain==='function')openTrain()}
hook('gLoaded',()=>{BRKS=null;BRKH=null;document.body.classList.remove('brk-on');brkCardClose(true)});   // 다른 칸을 불러오면 걷는다
hook('tick',dt=>{if(P&&P.brkA){P.brkA.t-=dt;if(P.brkA.t<=0)P.brkA=null}
  const b=BRKS;if(!b)return;b.age+=dt;const f=b.f,alive=fx.includes(f),t=alive?1-f.life/f.max:1;
  if(!b.burst&&t>=(BKS.burst[b.r]||.8))brkBurst(b);
  if(!alive){if(b.out<0){b.out=0;if(!b.burst)brkBurst(b)}b.out+=dt;if(b.out>=BKS.outro)brkShowEnd()}});

// ---- 돌파 결과 한 장: 연출이 끝난 뒤 아래쪽에 ----
function brkCardEl(){const el=document.getElementById('brkcard');return el&&el.classList.contains('on')?el:null}
function brkCard(h){let el=document.getElementById('brkcard');if(!el){el=document.createElement('div');el.id='brkcard';el.className='brkcard';$('stage').appendChild(el);
    el.addEventListener('click',ev=>{ev.stopPropagation();if(ev.target.closest('button')||!ev.target.closest('.bl'))brkCardClose()})}
  const b0=h.ban[0]||['경지가 올랐다',''],seen=new Set(),lines=[];
  for(const[t,c]of h.sys){const s=josa(t);if(seen.has(s))continue;seen.add(s);lines.push([s,c||''])}
  el.innerHTML=`<h3>${esc(josa(b0[0]))}</h3>${b0[1]?`<div class="bs">${esc(josa(b0[1]))}</div>`:''}<div class="bl">${lines.slice(0,10).map(([s,c])=>`<p class="${esc(c)}">${esc(s)}</p>`).join('')}</div><button type="button" class="btn">확인</button>`;
  el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}
function brkCardClose(quiet){const el=document.getElementById('brkcard');if(!el||!el.classList.contains('on'))return;el.classList.remove('on');el.hidden=true;
  if(!quiet&&brkCard.trn&&typeof openTrain==='function'&&playing&&!BRKS)openTrain();brkCard.trn=false}

// ---- 화면 연출: 어둡게(어둠 뒤, 빛 이펙트 아래)·검은 띠·붓글씨 이름·번쩍임 ----
hook('afterDark',()=>{const b=BRKS;if(!b||!P)return;const e=brkEnv(),p=toScreen(P.x,P.y),y=p.y-30-(P.z||0);
  const g=ctx.createRadialGradient(p.x,y,30,p.x,y,Math.max(W,H)*.6);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.22,`rgba(0,0,0,${BKS.dim*e*.75})`);g.addColorStop(1,`rgba(0,0,0,${BKS.dim*e})`);
  ctx.fillStyle=g;ctx.fillRect(-40,-40,W+80,H+80);
  if(b.r===7){// 생사현관: 세상이 한순간 뒤집혔다가 흑백으로 가라앉는다
    const m=ctx.globalCompositeOperation;if(b.age<.35){ctx.globalCompositeOperation='difference';ctx.fillStyle=`rgba(255,255,255,${1-b.age/.35})`;ctx.fillRect(-40,-40,W+80,H+80)}
    ctx.globalCompositeOperation='saturation';ctx.fillStyle=`rgba(128,128,128,${.92*e})`;ctx.fillRect(-40,-40,W+80,H+80);ctx.globalCompositeOperation=m}});
hook('drawHud',()=>{const b=BRKS;if(!b)return;const e=brkEnv(),bh=H*BKS.bar*ez(e);
  ctx.fillStyle='#000';ctx.fillRect(-40,-40,W+80,bh+40);ctx.fillRect(-40,H-bh,W+80,bh+40);
  if(!b.burst)return;const x=b.age-b.bt;
  if(x<.3){ctx.fillStyle=`rgba(255,250,235,${.45*(1-x/.3)})`;ctx.fillRect(-40,-40,W+80,H+80)}
  if(b.r>=8&&x<1.4){const m=ctx.globalCompositeOperation;ctx.globalCompositeOperation='soft-light';ctx.fillStyle=`rgba(200,245,150,${.7*(1-x/1.4)})`;ctx.fillRect(-40,-40,W+80,H+80);ctx.globalCompositeOperation=m}
  brkName(b,x,e)});
// 붓글씨 이름: 먹이 왼쪽에서 오른쪽으로 번지며 박히고, 아래에 한글 이름과 경지
function brkName(b,x,e){const d=b.d,u=1/(typeof rdZ==='number'&&rdZ>0?rdZ:1),hz=d.h||d.n,n=[...hz].length,k=ez(x/.6),pop=1+.35*(1-ez(x/.25));
  const sz=Math.min(76*u,W*.82/Math.max(2,n)),cx=W/2,cy=H*.25,c=b.col;
  ctx.save();ctx.globalAlpha=e;ctx.translate(cx,cy);ctx.scale(pop,pop);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`${Math.round(sz)}px "Song Myung","Nanum Myeongjo",serif`;const w=ctx.measureText(hz).width;
  // 먹 띠: 붓으로 한 번 긋는 듯한 어두운 띠
  {const x0=-w*.62,x1=x0+w*1.24*k;ctx.fillStyle='rgba(8,4,2,.62)';ctx.beginPath();ctx.moveTo(x0,-sz*.42);ctx.quadraticCurveTo((x0+x1)/2,-sz*.6,x1,-sz*.36);ctx.lineTo(x1+sz*.08,sz*.46);ctx.quadraticCurveTo((x0+x1)/2,sz*.62,x0,sz*.44);ctx.closePath();ctx.fill()}
  ctx.save();ctx.beginPath();ctx.rect(-w/2-sz*.3,-sz,(w+sz*.6)*k,sz*2);ctx.clip();
  ctx.lineJoin='round';ctx.lineWidth=sz*.09;ctx.strokeStyle='rgba(20,8,0,.9)';ctx.strokeText(hz,0,0);
  ctx.shadowColor=rgba(c,1);ctx.shadowBlur=26*u;ctx.fillStyle='#fff4dc';ctx.fillText(hz,0,0);ctx.shadowBlur=0;ctx.fillStyle=rgba(c,.35);ctx.fillText(hz,0,0);ctx.restore();
  const k2=cl01((x-.35)/.4);if(k2>0){ctx.globalAlpha=e*k2;ctx.font=`${Math.round(17*u)}px "Song Myung",serif`;const s=`${d.n} · ${typeof rk==='function'?rk(b.r):''}`;
    ctx.lineWidth=3*u;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(s,0,sz*.78);ctx.fillStyle='#ecd9a8';ctx.fillText(s,0,sz*.78)}
  ctx.restore()}

// ---- 몸 밖 현상: drawBrk 끝에서 부른다 (빛 합성 중) ----
function brkSrc(fn){const m=ctx.globalCompositeOperation;ctx.globalCompositeOperation='source-over';fn();ctx.globalCompositeOperation=m}
function brkLotusDark(x,y,s,a,rot){if(s<=0||a<=0)return;brkSrc(()=>{ctx.save();ctx.translate(x,y);ctx.scale(1,.5);
  for(let j=0;j<8;j++){const g=rot+j*Math.PI/4;ctx.fillStyle=`rgba(14,8,24,${.85*a})`;ctx.strokeStyle=`rgba(190,170,230,${.5*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(Math.cos(g)*s*.55,Math.sin(g)*s*.55,s*.55,s*.22,g,0,7);ctx.fill();ctx.stroke()}
  for(let j=0;j<6;j++){const g=-rot+j*Math.PI/3+.3;ctx.fillStyle=`rgba(40,20,60,${.8*a})`;ctx.beginPath();ctx.ellipse(Math.cos(g)*s*.3,Math.sin(g)*s*.3-s*.15,s*.3,s*.13,g,0,7);ctx.fill()}ctx.restore()})}
function brkOuter(f,cx,py,t,env){const r=f.r,c=f.col,PI2=Math.PI*2,sd=f.sd,line=(pts,w,cc,a)=>{ctx.strokeStyle=rgba(cc,a);ctx.lineWidth=w;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
  if(r===1){// 이류: 단전의 빛 구슬이 떠올라 머리 위에서 고리가 된다
    const u=ez((t-.5)/.2),y=py-22-50*u,k=ez((t-.7)/.12);if(t>.45&&k<1)glowDot(cx,y,10,c,env);
    if(k>0){for(const[w,cc,al]of[[6,c,.3],[2,c,.9],[1,HI,1]]){ctx.strokeStyle=rgba(cc,al*env);ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(cx,py-72,15*k,5*k,0,0,PI2);ctx.stroke()}
      const a=time*4;glowDot(cx+Math.cos(a)*15*k,py-72+Math.sin(a)*5*k,6,c,env);
      sd.slice(0,10).forEach((q,j)=>{const s=cl01((t-.72)/.25);if(s>0&&s<1)glowDot(cx+Math.cos(q.a)*(15+40*s*q.d),py-72+Math.sin(q.a)*(5+18*s*q.d),3,c,env*(1-s))})}}
  else if(r===2){// 일류: 발밑에 경락도가 그려지고, 두 손·두 발 끝에서 빛이 터진다
    const k=ez((t-.05)/.5),[rx,ry]=isoR(1.5),a=env*(1-cl01((t-.85)/.15));
    ctx.strokeStyle=rgba(c,.7*a);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,py,rx,ry,0,-Math.PI/2,-Math.PI/2+PI2*k);ctx.stroke();
    ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx,py,rx*.62,ry*.62,0,Math.PI/2,Math.PI/2+PI2*k);ctx.stroke();
    for(let j=0;j<12;j++){if(k<j/12)continue;const g=j*PI2/12,x0=cx+Math.cos(g)*rx*.62,y0=py+Math.sin(g)*ry*.62,x1=cx+Math.cos(g)*rx,y1=py+Math.sin(g)*ry;
      line([[x0,y0],[x1,y1]],1.2,c,.6*a);glowDot(x1,y1,5,c,a);if(j%3===0)glowDot(x0,y0,4,HI,a)}
    [[cx-15,py-36],[cx+15,py-36],[cx-7,py-3],[cx+7,py-3]].forEach(([x,y],j)=>{const kk=cl01((t-.6-j*.03)/.22);if(kk>0&&kk<1){glowDot(x,y,6+22*kk,c,env*(1-kk));glowDot(x,y,4,HI,env*(1-kk))}})}
  else if(r===3){// 절정: 백회혈의 빛기둥이 구름을 뚫어 하늘이 열린다
    const k=cl01((t-.5)/.35),top=py-250;if(k<=0)return;const R=30+60*ez(k);
    glowDot(cx,top,R*1.2,c,.45*env,.35);
    sd.slice(0,14).forEach((q,j)=>{const g=q.a,rr=R+10+q.d*30,x=cx+Math.cos(g)*rr,y=top+Math.sin(g)*rr*.3;glowDot(x,y,22+q.s*14,'215,220,235',.22*env*(1-k*.4),.45)});
    for(let j=0;j<7;j++){const g=(j-3)*.12,L=200;ctx.strokeStyle=rgba(c,.16*env*k);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx+Math.sin(g)*R*.5,top);ctx.lineTo(cx+Math.sin(g)*L*.6,top+L);ctx.stroke()}}
  else if(r===4){// 초절정: 강기가 터지며 땅이 갈라지고 돌 조각이 둥실 떠오른다
    const k=ez((t-.3)/.35),[RX,RY]=isoR(2.3),a=env*(1-cl01((t-.9)/.1));
    if(k>0)sd.slice(0,8).forEach((q,j)=>{const g=j*PI2/8+q.a*.3,pts=[[cx,py]];for(let s=1;s<=5;s++){const u=s/5*k,jt=(hash(j,s)-.5)*.5;pts.push([cx+Math.cos(g+jt)*RX*u,py+Math.sin(g+jt)*RY*u])}
      line(pts,5,c,.25*a);line(pts,1.6,c,.9*a);line(pts,.8,HI,a)});
    const h0=ez((t-.35)/.3),fly=cl01((t-.78)/.22);if(h0<=0)return;
    brkSrc(()=>sd.slice(10,20).forEach((q,j)=>{const g=q.a,[rx,ry]=isoR(.9+q.d*1.3),bx=cx+Math.cos(g)*rx,by=py+Math.sin(g)*ry,hh=(18+q.s*30)*h0+Math.sin(time*3+j)*3,
      x=bx+Math.cos(g)*90*fly,y=by-hh-40*fly+160*fly*fly,s=3+q.w*4,al=env*(1-fly);if(al<=0)return;
      ctx.fillStyle=`rgba(0,0,0,${.25*al*(1-fly)})`;ctx.beginPath();ctx.ellipse(bx,by,s*1.2,s*.5,0,0,PI2);ctx.fill();
      ctx.fillStyle=`rgba(78,68,58,${al})`;ctx.strokeStyle=rgba(c,.85*al);ctx.lineWidth=1;ctx.beginPath();for(let v=0;v<5;v++){const gg=v*PI2/5+q.w*3+time*(fly?6:.6),rr=s*(.7+hash(j,v)*.5);v?ctx.lineTo(x+Math.cos(gg)*rr,y+Math.sin(gg)*rr):ctx.moveTo(x+Math.cos(gg)*rr,y+Math.sin(gg)*rr)}ctx.closePath();ctx.fill();ctx.stroke()}))}
  else if(r===5){// 화경: 오행 다섯 구슬이 머리 위에서 오각형으로 돌다 정수리로 빨려 들고, 하늘에 오색 구름
    const sk=cl01((t-.2)/.3);WUHAENG.forEach((cc,j)=>glowDot(cx+(j-2)*58+Math.sin(time*.7+j)*10,py-235+(j%2)*22,80,cc,.2*env*sk,.4));
    const k=ez((t-.5)/.15),suck=ez((t-.8)/.08),R=24*(1-suck),hy=py-78+20*suck;if(k<=0)return;
    const pts=WUHAENG.map((cc,j)=>{const g=time*2.4+j*PI2/5;return[cx+Math.cos(g)*R*k,hy+Math.sin(g)*R*.42*k]});
    if(suck<1){const st=[0,2,4,1,3,0].map(i=>pts[i]);line(st,1.2,c,.5*env*k*(1-suck))}
    WUHAENG.forEach((cc,j)=>{if(suck<1){glowDot(pts[j][0],pts[j][1],10,cc,env*k);glowDot(pts[j][0],pts[j][1],4,HI,env*k)}});
    if(suck>0)glowDot(cx,py-60,16+30*suck,c,env*(1-cl01((t-.9)/.1)))}
  else if(r===6){// 현경: 원광이 선 뒤 꽃잎이 흩날린다 (세 송이는 drawBrk)
    const k=cl01((t-.7)/.12);if(k<=0)return;
    sd.forEach((q,j)=>{const x=cx+(q.d-.5)*230+Math.sin(time*1.5+j)*10,y=py-210+((q.s+t*1.1)%1)*240,cc=j%3?'255,190,205':'255,228,160';
      ctx.fillStyle=rgba(cc,.8*env*k);ctx.beginPath();ctx.ellipse(x,y,4.2,1.9,time*2+j,0,PI2);ctx.fill()})}
  else if(r===7){// 생사경: 머리 위에서 흰 꽃과 검은 꽃이 마주 핀다 (세상이 흑백으로 바뀌는 것은 r_brkshow afterDark)
    const b=ez((t-.3)/.2);if(b<=0)return;const y=py-80+Math.sin(time*2)*2;
    brkLotus(cx-26,y,17*b,'240,240,255',.85*env,time*.7);brkLotusDark(cx+26,y,17*b,env,-time*.7);
    ctx.strokeStyle=rgba('235,235,250',.4*env*b);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx-26,y);ctx.quadraticCurveTo(cx,y-18,cx+26,y);ctx.stroke()}
  else{// 자연경: 발밑부터 풀이 자라 꽃이 피고, 새가 모여들어 머리 위를 돈다
    const k=ez((t-.08)/.6),[RX,RY]=isoR(3.4);
    brkSrc(()=>sd.forEach((q,j)=>{if(q.d>k)return;const g=q.a,x=cx+Math.cos(g)*RX*q.d,y=py+Math.sin(g)*RY*q.d,h=(6+q.s*9)*Math.min(1,(k-q.d)*4)*env;if(h<=.5)return;
      ctx.strokeStyle=`rgba(${90+q.w*40|0},${165+q.s*40|0},80,${.9*env})`;ctx.lineWidth=1.3;ctx.beginPath();for(const dx of[-2.5,0,2.5]){ctx.moveTo(x+dx,y);ctx.quadraticCurveTo(x+dx*1.4,y-h*.6,x+dx*2+Math.sin(time*2+j)*1.5,y-h)}ctx.stroke();
      if(j%3===0){ctx.fillStyle=j%2?`rgba(255,200,220,${env})`:`rgba(255,235,140,${env})`;ctx.beginPath();ctx.arc(x,y-h,2.2,0,PI2);ctx.fill()}}));
    const bk=cl01((t-.25)/.3);if(bk>0)for(let j=0;j<6;j++){const g=time*.8+j*1.05,x=cx+Math.cos(g)*(80+j*8),y=py-150-j*6+Math.sin(g)*24,fl=5*Math.sin(time*11+j*1.7);
      ctx.strokeStyle=rgba('245,245,235',.85*env*bk);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-7,y-fl);ctx.quadraticCurveTo(x-3,y-2,x,y);ctx.quadraticCurveTo(x+3,y-2,x+7,y-fl);ctx.stroke()}}}

// ---- 잔상: 돌파 뒤 한동안 머리 위에 남는 표시 ----
hook('drawList',list=>{const a=P&&P.brkA;if(!a||BRKS||P.hp<=0||!playing)return;
  list.push({L:LY.FX,d:P.x+P.y+.2,f:()=>{const p=toScreen(P.x,P.y),al=Math.min(1,a.t/BKS.auraFade)*.6*Math.min(1,(BKS.aura-a.t)/1.5);if(al<=0)return;
    const k=typeof heroAgeK==='function'?heroAgeK():1;ctx.save();ctx.translate(p.x,p.y-(P.z||0));ctx.scale(k,k);ctx.translate(-p.x,-p.y);ctx.globalCompositeOperation='lighter';HI=WH;brkAura(a.r,p.x,p.y,al,a.col);ctx.restore()}})});
function brkAura(r,x,y,a,c){const PI2=Math.PI*2,hy=y-62;
  if(r===1){ctx.strokeStyle=rgba(c,.8*a);ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y-72,12,4,0,0,PI2);ctx.stroke();glowDot(x+Math.cos(time*3)*12,y-72+Math.sin(time*3)*4,4,c,a)}
  else if(r===2){const[rx,ry]=isoR(.9);ctx.strokeStyle=rgba(c,.5*a);ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI2);ctx.stroke();
    for(let j=0;j<4;j++){const g=time*.6+j*PI2/4;glowDot(x+Math.cos(g)*rx,y+Math.sin(g)*ry,4,c,a)}}
  else if(r===3){glowDot(x,y-60,14,c,.7*a);ctx.strokeStyle=rgba(c,.35*a);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-62);ctx.lineTo(x,y-62-26-4*Math.sin(time*3));ctx.stroke()}
  else if(r===4){const[rx,ry]=isoR(.95),h=70;ctx.strokeStyle=rgba(c,(.25+.1*Math.sin(time*3))*a);ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,rx,h,0,Math.PI,PI2);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI2);ctx.stroke()}
  else if(r===5)WUHAENG.forEach((cc,j)=>{const g=time*1.6+j*PI2/5;glowDot(x+Math.cos(g)*16,y-74+Math.sin(g)*6,6,cc,a);glowDot(x+Math.cos(g)*16,y-74+Math.sin(g)*6,2.5,HI,a)});
  else if(r===6)[['255,170,190',-2.36],['255,225,150',-1.5708],['200,220,255',-.785]].forEach(([cc,g],j)=>brkLotus(x+Math.cos(g)*30,y-50+Math.sin(g)*30+Math.sin(time*2+j)*1.5,9,cc,a,time*.6+j));
  else if(r===7){const R=9,cy=y-76;ctx.save();ctx.translate(x,cy);ctx.rotate(time*1.2);ctx.fillStyle=rgba('240,240,255',.8*a);ctx.beginPath();ctx.arc(0,0,R,-Math.PI/2,Math.PI/2);ctx.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2);ctx.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2,true);ctx.fill();ctx.restore();
    brkSrc(()=>{ctx.save();ctx.translate(x,cy);ctx.rotate(time*1.2+Math.PI);ctx.fillStyle=`rgba(12,8,22,${.8*a})`;ctx.beginPath();ctx.arc(0,0,R,-Math.PI/2,Math.PI/2);ctx.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2);ctx.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2,true);ctx.fill();ctx.restore()})}
  else for(let j=0;j<6;j++){const ph=(time*.35+j/6)%1,g=j*1.7,xx=x+Math.cos(g)*22+Math.sin(time*2+j)*5,yy=y-10-ph*80,cc=j%2?'255,225,150':c;ctx.fillStyle=rgba(cc,a*Math.sin(ph*Math.PI));ctx.beginPath();ctx.ellipse(xx,yy,3.6,1.6,time*2+j,0,PI2);ctx.fill()}}

// ================= v232 필살기 발동 연출 · 끊김 =================
// 동훈님 2026-11-03: 필살기를 쓰면 연출과 무공이 한꺼번에 나가 연출을 볼 수 없다.
// - 필살 단추: 내공을 먼저 쓰고 오의 이름 외치기(callout)가 ULTCAST.cast초 흐른다. 연출이 끝나야 무공이 나간다 (ultFire, g_core.js)
// - 그동안 제자리에 서고(g_life.js) 다른 수는 막는다. 강한 공격을 맞으면 끊긴다: 내공·쿨타임은 돌려주지 않고, 글자가 붉게 물들며 유리처럼 깨진다
// - 연출 글자 둘레에 심법 속성(pEl) 기운이 흐른다: 양·화 불길, 수 물방울, 빙 서리 조각, 뇌 번개, 풍 바람결, 독 거품, 혈 핏방울, 마·음 연기, 목 잎, 금 빛살, 토 돌조각
// 수치는 data/ult.json (ULTCAST)
const ULTC=GD.ULTCAST;
function ultCastStart(a,combo,e,elo){
  if(!(ULTC.cast>0))return false;const el=elo||pEl(),by=P.byh||P.name;
  P.ultCast={a:a.id,combo,e,t:0,dur:ULTC.cast,el,au:0};P.path=null;P.chan=null;P.medit=false;
  if(typeof callout==='function')callout(a.ult.n,by,{dur:ULTC.cast,el,ult:1,force:1});
  fx.push({t:'ring',x:P.x,y:P.y,life:.5,max:.5,um:1,col:ultAuraCol(el)});return true}
const ultAuraCol=el=>el==='마'?'130,40,170':(EL[el]||EL.금).c;
function ultCastEnd(){const c=P&&P.ultCast;if(!c)return;P.ultCast=null;const a=ARTS[c.a];
  const el=document.getElementById('callout');if(el){clearTimeout(el._t);el.classList.remove('on');coFxStop(el)}
  if(a&&P.hp>0)ultFire(a,c.combo,c.e)}
function ultBreak(why){const c=P&&P.ultCast;if(!c)return false;P.ultCast=null;const a=ARTS[c.a];
  P.flash=.35;P.flashCol='255,40,30';shake=Math.max(shake,.25);addText(P.x,P.y-.6,'필살기 끊김','#ff5a48');
  log(`[${a?a.ult.n:'필살기'}] 발동 중에 ${why||'강하게 맞아'} 기가 흩어졌습니다. 내공만 잃었습니다.`,'dmg');
  const b=$('banner');if(b)b.classList.remove('on');
  const el=document.getElementById('callout');if(el&&el.classList.contains('on'))coFxBreak(el);
  if(typeof sfx==='function')sfx('shatter');return true}
// 연출 동안은 다른 공격·초식·보법을 막는다 (필살기를 겹쳐 누르는 것도)
{const block=name=>{const o=window[name];if(typeof o!=='function')return;window[name]=function(...a){if(P&&P.ultCast)return false;return o.apply(this,a)}};
  ['basicStrike','autoAttack','useForm','ultimate','special','shingong','bobeop','leap','meditate'].forEach(block)}
hook('tick',dt=>{const c=P&&P.ultCast;if(!c)return;
  if(P.hp<=0||P.binsa){P.ultCast=null;const el=document.getElementById('callout');if(el){el.classList.remove('on');coFxStop(el)}return}
  c.t+=dt;P.moving=false;P.medit=false;if(c.e&&c.e.hp>0)face(c.e.x,c.e.y);
  c.au-=dt;if(c.au<=0){c.au=ULTC.aura;const k=Math.min(1,c.t/c.dur),pt=(EL[c.el]||EL.금).pt;fParts(null,{x:P.x,y:P.y},ultAuraCol(c.el),2+Math.round(k*4),1.4+k*1.6,pt,.45)}
  if(c.t>=c.dur)ultCastEnd()});
// 강한 공격: 한 번에 최대 생명의 strong배 이상, 또는 평타의 heavyK배 넘는 큰 수(내려찍기·우두머리 수 등)
const ultHeavy=c=>{const s=c.src||{},lost=c.hp0-P.hp;if(lost<=0)return false;if(lost>=P.maxHp*ULTC.strong)return true;return s.atk>0&&c.raw/s.atk>=ULTC.heavyK};
hook('hurtDone',c=>{if(P&&P.ultCast&&P.hp>0&&ultHeavy(c))ultBreak()});
hook('loadRegion',()=>{if(P&&P.ultCast){P.ultCast=null;const el=document.getElementById('callout');if(el){el.classList.remove('on');coFxStop(el)}}});

// ---- 연출 글자 둘레의 속성 기운 (화면 좌표 캔버스, 실제 시간) ----
// cols: 태어남→사그라짐 색. glow: 글자 빛
const COFX={
  화:{glow:'255,120,40',k:['flame','ember'],cols:['255,236,190','255,160,60','240,80,25','120,20,8'],r:330,big:1.5},
  양:{glow:'255,214,110',k:['flame','ember','ray'],cols:['255,255,236','255,224,120','255,150,45','200,70,15'],r:400,big:1.8},
  수:{glow:'110,180,255',k:['drop','ripple'],cols:['225,245,255','120,185,255'],r:61},
  빙:{glow:'170,230,255',k:['shard','mist'],cols:['245,252,255','170,225,255'],r:54},
  뇌:{glow:'200,230,255',k:['bolt','spark'],cols:['255,255,255','170,210,255'],r:72},
  풍:{glow:'200,245,225',k:['streak','leaf'],cols:['235,255,245','170,230,205'],r:47},
  독:{glow:'130,215,70',k:['bubble','mist'],cols:['200,255,140','110,200,60','140,60,170'],r:72},
  혈:{glow:'225,40,50',k:['drip','mist'],cols:['255,90,90','190,15,30','90,0,10'],r:61},
  마:{glow:'150,40,200',k:['smoke','ember'],cols:['40,10,55','95,25,120','200,60,90'],r:108,dark:1},
  음:{glow:'170,150,255',k:['smoke','mote'],cols:['200,190,255','140,120,230','80,70,160'],r:83},
  목:{glow:'120,225,120',k:['leaf','mote'],cols:['190,255,170','90,190,90'],r:54},
  금:{glow:'235,235,250',k:['glint','slash'],cols:['255,255,255','220,225,240'],r:47},
  토:{glow:'225,175,95',k:['chip','dust'],cols:['230,190,120','150,110,60','90,70,45'],r:72}};
const coR=(a,b)=>a+Math.random()*(b-a);
function coFxStart(el,elm,dur){coFxStop(el);const cfg=COFX[elm]||COFX.금;el.style.setProperty('--eg',cfg.glow);
  const cv=document.createElement('canvas');cv.className='cofx';el.insertBefore(cv,el.querySelector('b'));
  const S={cv,ctx:cv.getContext('2d'),cfg,dur,t0:performance.now(),last:performance.now(),ps:[],emit:true,brk:null,acc:0,bolt:0};el._co=S;
  const loop=now=>{if(el._co!==S)return;const dt=Math.min(.05,(now-S.last)/1000);S.last=now;coFxFrame(el,S,dt,(now-S.t0)/1000);S.raf=requestAnimationFrame(loop)};S.raf=requestAnimationFrame(loop)}
function coFxStop(el){const S=el&&el._co;if(!S)return;cancelAnimationFrame(S.raf);if(S.cv.parentNode)S.cv.remove();el._co=null;const b=el.querySelector('b');if(b)b.style.visibility=''}
function coRect(el,cv){const R=el.getBoundingClientRect(),b=el.querySelector('b');const r=b?b.getBoundingClientRect():R;return{x:r.left-R.left,y:r.top-R.top,w:r.width||200,h:r.height||80,W:R.width,H:R.height}}
function coSpawn(S,r,k,f){const c=S.cfg,B=c.big||1,p={k,t:0,x:0,y:0,vx:0,vy:0,g:0,s:1,rot:coR(0,6.3),vr:coR(-3,3),col:c.cols[0]};
  const bx=()=>coR(r.x-r.w*.08,r.x+r.w*1.08),by=r.y+r.h*.92,rim=()=>{const a=coR(0,6.3);return[r.x+r.w/2+Math.cos(a)*r.w*coR(.5,.62),r.y+r.h/2+Math.sin(a)*r.h*coR(.6,1.1)]};
  switch(k){
    case'flame':p.x=bx();p.y=by-coR(-r.h*.1,r.h*.9);p.vx=coR(-20,20);p.vy=-coR(110,240)*(.7+.3*B)*(.6+.4*f);p.s=coR(12,28)*B*(.55+.45*f);p.max=coR(.45,.9);break;
    case'ember':p.x=bx();p.y=by-coR(0,r.h*.5);p.vx=coR(-40,40);p.vy=-coR(120,260);p.s=coR(1.5,3.2);p.max=coR(.5,1);p.col=c.cols[c.dark?2:1];break;
    case'ray':p.x=r.x+r.w/2;p.y=r.y+r.h/2;p.rot=coR(0,6.3);p.vr=coR(-.6,.6);p.s=Math.max(r.w,180)*coR(.6,1);p.max=coR(.6,1.1);break;
    case'drop':{const[x,y]=rim();p.x=x;p.y=y;p.vx=coR(-60,60);p.vy=-coR(40,140);p.g=420;p.s=coR(3,6.5);p.max=coR(.6,1.1);break}
    case'ripple':p.x=bx();p.y=by+coR(4,18);p.s=coR(10,30);p.max=coR(.5,.9);break;
    case'shard':{const[x,y]=rim();p.x=x;p.y=y;p.vx=coR(-10,10);p.vy=coR(-10,10);p.s=coR(6,15);p.max=coR(.6,1.1);p.vr=coR(-.6,.6);break}
    case'mist':p.x=bx();p.y=by-coR(-10,r.h*.6);p.vx=coR(-25,25);p.vy=-coR(5,30);p.s=coR(26,60);p.max=coR(.8,1.4);p.col=c.cols[c.cols.length-1];break;
    case'spark':{const[x,y]=rim();p.x=x;p.y=y;const a=coR(0,6.3),v=coR(80,220);p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v;p.s=coR(1.2,2.6);p.max=coR(.15,.35);break}
    case'bolt':{const pt=()=>[coR(r.x-r.w*.15,r.x+r.w*1.15),coR(r.y-r.h*.5,r.y+r.h*1.5)];const a=pt(),z=pt();p.pts=coBolt(a,z,0);p.max=coR(.08,.16);break}
    case'streak':p.x=r.x-r.w*.3;p.y=coR(r.y-r.h*.4,r.y+r.h*1.4);p.vx=coR(500,900)*(Math.random()<.5?1:-1);if(p.vx<0)p.x=r.x+r.w*1.3;p.vy=coR(-40,40);p.s=coR(60,140);p.max=coR(.35,.6);p.bend=coR(-.5,.5);break;
    case'leaf':{const[x,y]=rim();p.x=x;p.y=y;p.vx=coR(-120,120);p.vy=coR(-60,40);p.s=coR(5,9);p.max=coR(.7,1.2);p.vr=coR(-6,6);p.col=c.cols[Math.random()<.5?0:1];break}
    case'bubble':p.x=bx();p.y=by-coR(0,r.h*.3);p.vx=coR(-10,10);p.vy=-coR(40,110);p.s=coR(3,9);p.max=coR(.6,1.1);p.col=c.cols[Math.random()<.7?1:2];break;
    case'drip':p.x=coR(r.x+r.w*.05,r.x+r.w*.95);p.y=r.y+r.h*coR(.55,.9);p.vy=coR(5,20);p.g=coR(60,260);p.s=coR(2.5,5);p.max=coR(.6,1.1);break;
    case'smoke':p.x=bx();p.y=by-coR(0,r.h*.8);p.vx=coR(-30,30);p.vy=-coR(30,90);p.s=coR(18,40);p.max=coR(.7,1.3);break;
    case'mote':{const[x,y]=rim();p.x=x;p.y=y;p.vx=coR(-20,20);p.vy=-coR(10,50);p.s=coR(1.5,3);p.max=coR(.6,1.2);break}
    case'glint':p.x=coR(r.x,r.x+r.w);p.y=coR(r.y,r.y+r.h);p.s=coR(8,20);p.max=coR(.25,.5);break;
    case'slash':p.x=coR(r.x,r.x+r.w);p.y=coR(r.y,r.y+r.h);p.rot=coR(-.5,.5)+(Math.random()<.5?0:Math.PI/2);p.s=coR(r.w*.25,r.w*.6);p.max=coR(.12,.22);break;
    case'chip':p.x=bx();p.y=by;p.vx=coR(-80,80);p.vy=-coR(180,340);p.g=700;p.s=coR(3,7);p.max=coR(.6,1);p.col=c.cols[Math.random()<.5?1:2];break;
    case'dust':p.x=bx();p.y=by+coR(-6,10);p.vx=coR(-40,40);p.vy=-coR(5,25);p.s=coR(18,40);p.max=coR(.6,1.1);p.col=c.cols[1];break}
  if(!/ray|streak|slash|bolt|flame/.test(k))p.s*=1.4;S.ps.push(p)}
function coBolt(a,z,d){const n=6,pts=[a];for(let i=1;i<n;i++){const k=i/n;pts.push([a[0]+(z[0]-a[0])*k+coR(-18,18),a[1]+(z[1]-a[1])*k+coR(-18,18)])}pts.push(z);return pts}
const coLerpCol=(cols,k)=>{const i=Math.min(cols.length-1,k*(cols.length-1)),a=cols[Math.floor(i)].split(',').map(Number),b=cols[Math.ceil(i)].split(',').map(Number),f=i-Math.floor(i);return a.map((v,j)=>Math.round(v+(b[j]-v)*f)).join(',')};
function coFxFrame(el,S,dt,t){const cv=S.cv,ctx=S.ctx,dpr=Math.min(2,devicePixelRatio||1),r=coRect(el,cv);
  const W=Math.round(r.W*dpr),H=Math.round(r.H*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,r.W,r.H);
  const c=S.cfg,f=Math.min(1,t/S.dur);   // 연출이 흐를수록 기운이 짙어진다
  if(S.emit&&!S.brk){S.acc+=dt*c.r*(.45+.75*f);const n=Math.min(40,Math.floor(S.acc));S.acc-=n;
    for(let i=0;i<n;i++){const k=c.k[0]==='bolt'?(Math.random()<.25?'bolt':'spark'):c.k[Math.random()<.75?0:1];if(k!=='ray')coSpawn(S,r,k,f)}
    if(c.k.includes('ray')&&Math.random()<dt*5)coSpawn(S,r,'ray',f)}
  for(const p of S.ps){p.t+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.k==='flame'){p.vx+=Math.sin(t*9+p.y*.05)*60*dt}}
  S.ps=S.ps.filter(p=>p.t<p.max);if(S.ps.length>700)S.ps.splice(0,S.ps.length-700);
  if(c.k[0]==='flame'&&!S.brk){const a=.35+.35*f+.08*Math.sin(t*23),cx=r.x+r.w/2,cy=r.y+r.h*.75;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(cx,cy);ctx.scale(1,.45);const g=ctx.createRadialGradient(0,0,0,0,0,r.w*.62);g.addColorStop(0,`rgba(${c.cols[1]},${a})`);g.addColorStop(1,`rgba(${c.cols[2]},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r.w*.62,0,7);ctx.fill();ctx.restore()}
  for(const p of S.ps)coDraw(ctx,p,c);
  if(S.brk)coBreakDraw(ctx,S,dt,r)}
function coDraw(ctx,p,c){const k=p.t/p.max,a=Math.sin(Math.PI*Math.min(1,k*1.25+.05));ctx.save();
  switch(p.k){
    case'flame':{ctx.globalCompositeOperation='lighter';const col=coLerpCol(c.cols,k),s=p.s*(1-k*.6);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,s);
      g.addColorStop(0,`rgba(${col},${.75*a})`);g.addColorStop(.45,`rgba(${col},${.35*a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.translate(p.x,p.y);ctx.scale(.75,1.35);ctx.translate(-p.x,-p.y);ctx.beginPath();ctx.arc(p.x,p.y,s,0,7);ctx.fill();break}
    case'ember':case'spark':case'mote':ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${p.col},${a*(Math.random()<.2?.4:1)})`;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill();break;
    case'ray':{ctx.globalCompositeOperation='lighter';ctx.translate(p.x,p.y);ctx.rotate(p.rot);const g=ctx.createLinearGradient(0,0,p.s,0);g.addColorStop(0,`rgba(255,240,190,${.28*a})`);g.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(p.s,-p.s*.06);ctx.lineTo(p.s,p.s*.06);ctx.fill();break}
    case'drop':{ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx)-Math.PI/2);ctx.fillStyle=`rgba(${c.cols[1]},${.85*a})`;ctx.beginPath();ctx.moveTo(0,-p.s*2.2);ctx.quadraticCurveTo(p.s,0,0,p.s);ctx.quadraticCurveTo(-p.s,0,0,-p.s*2.2);ctx.fill();ctx.fillStyle=`rgba(255,255,255,${.8*a})`;ctx.beginPath();ctx.arc(-p.s*.3,-p.s*.1,p.s*.3,0,7);ctx.fill();break}
    case'ripple':ctx.strokeStyle=`rgba(${c.cols[0]},${.6*(1-k)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,p.s*(.3+k),p.s*(.3+k)*.3,0,0,7);ctx.stroke();break;
    case'shard':{const s=p.s*Math.min(1,k*5);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${c.cols[1]},${.45*a})`;ctx.strokeStyle=`rgba(${c.cols[0]},${.9*a})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,-s*1.6);ctx.lineTo(s*.45,0);ctx.lineTo(0,s*1.6);ctx.lineTo(-s*.45,0);ctx.closePath();ctx.fill();ctx.stroke();break}
    case'mist':case'smoke':case'dust':{const col=p.k==='smoke'?coLerpCol(c.cols,k):p.col,s=p.s*(1+k*.8);if(!c.dark)ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,s);
      const al=(c.dark?.6:p.k==='dust'?.35:.22)*a;g.addColorStop(0,`rgba(${col},${al})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,s,0,7);ctx.fill();
      if(c.dark){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${c.cols[2]},${.12*a})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,s*.7,0,7);ctx.stroke()}break}
    case'bolt':{ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';for(const[w,al,col]of[[7,.25,c.cols[1]],[2.2,1,c.cols[0]]]){ctx.strokeStyle=`rgba(${col},${al*(1-k)})`;ctx.lineWidth=w;ctx.beginPath();p.pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}break}
    case'streak':{ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${c.cols[0]},${.7*a})`;ctx.lineWidth=2;ctx.lineCap='round';const d=Math.sign(p.vx);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x-d*p.s*.5,p.y+p.s*p.bend*.5,p.x-d*p.s,p.y+p.s*p.bend*.1);ctx.stroke();break}
    case'leaf':{ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`rgba(${p.col},${.9*a})`;ctx.beginPath();ctx.ellipse(0,0,p.s,p.s*.4,0,0,7);ctx.fill();break}
    case'bubble':{const pop=k>.88;ctx.strokeStyle=`rgba(${p.col},${(pop?.4:.85)*a})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(p.x+Math.sin(p.t*8)*3,p.y,p.s*(pop?1.5:1),0,7);ctx.stroke();ctx.fillStyle=`rgba(${p.col},${.18*a})`;ctx.fill();break}
    case'drip':{ctx.fillStyle=`rgba(${coLerpCol(c.cols,k*.6)},${.9*a})`;const L=p.s*(1.5+Math.min(4,p.vy/40));ctx.beginPath();ctx.ellipse(p.x,p.y,p.s*.7,L,0,0,7);ctx.fill();break}
    case'glint':{ctx.globalCompositeOperation='lighter';ctx.translate(p.x,p.y);ctx.rotate(p.rot*.2);const s=p.s*a;ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.12,0);ctx.lineTo(0,s);ctx.lineTo(-s*.12,0);ctx.closePath();ctx.moveTo(-s,0);ctx.lineTo(0,s*.12);ctx.lineTo(s,0);ctx.lineTo(0,-s*.12);ctx.closePath();ctx.fill();break}
    case'slash':{ctx.globalCompositeOperation='lighter';ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.strokeStyle=`rgba(255,255,255,${.9*(1-k)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-p.s/2,0);ctx.lineTo(p.s/2,0);ctx.stroke();break}
    case'chip':{ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`rgba(${p.col},${a})`;ctx.beginPath();ctx.moveTo(-p.s,-p.s*.4);ctx.lineTo(p.s*.6,-p.s*.7);ctx.lineTo(p.s,p.s*.5);ctx.lineTo(-p.s*.3,p.s*.7);ctx.closePath();ctx.fill();break}}
  ctx.restore()}

// ---- 끊김: 글자가 붉게 물들고 금이 간 뒤 유리 조각처럼 흩어진다 ----
function coFxBreak(el){let S=el._co;if(!S){coFxStart(el,'금',ULTC.cast);S=el._co}if(!S||S.brk)return;
  const b=el.querySelector('b'),R=el.getBoundingClientRect(),r=b.getBoundingClientRect(),cs=getComputedStyle(b),dpr=Math.min(2,devicePixelRatio||1);
  const pad=24,w=r.width+pad*2,h=r.height+pad*2,img=document.createElement('canvas');img.width=Math.ceil(w*dpr);img.height=Math.ceil(h*dpr);
  const g=img.getContext('2d');g.scale(dpr,dpr);g.font=cs.font;try{g.letterSpacing=cs.letterSpacing}catch(e){}g.textAlign='center';g.textBaseline='middle';
  g.shadowColor='rgba(255,30,20,.95)';g.shadowBlur=18;const gr=g.createLinearGradient(0,pad,0,h-pad);gr.addColorStop(0,'#ffe0d4');gr.addColorStop(.5,'#ff4a36');gr.addColorStop(1,'#a80c0c');g.fillStyle=gr;g.fillText(b.textContent,w/2+parseFloat(cs.letterSpacing||0)/2,h/2);
  g.shadowBlur=0;g.lineWidth=1.2;g.strokeStyle='rgba(60,0,0,.9)';g.strokeText(b.textContent,w/2+parseFloat(cs.letterSpacing||0)/2,h/2);
  const ox=r.left-R.left-pad,oy=r.top-R.top-pad,cols=Math.max(5,Math.round(w/46)),rows=3,V=[];
  for(let j=0;j<=rows;j++){V[j]=[];for(let i=0;i<=cols;i++){const edge=i===0||j===0||i===cols||j===rows;V[j][i]=[i*w/cols+(edge?0:coR(-.3,.3)*w/cols),j*h/rows+(edge?0:coR(-.3,.3)*h/rows)]}}
  const ip=[coR(w*.35,w*.65),coR(h*.4,h*.6)],sh=[];
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=V[j][i],b2=V[j][i+1],c=V[j+1][i+1],d=V[j+1][i],tris=Math.random()<.5?[[a,b2,c],[a,c,d]]:[[a,b2,d],[b2,c,d]];
    for(const t of tris){const cx=(t[0][0]+t[1][0]+t[2][0])/3,cy=(t[0][1]+t[1][1]+t[2][1])/3,dx=cx-ip[0],dy=cy-ip[1],l=Math.hypot(dx,dy)||1,v=coR(80,220);
      sh.push({t,cx,cy,vx:dx/l*v+coR(-40,40),vy:dy/l*v*.8-coR(60,160),vr:coR(-7,7),rot:0,x:0,y:0})}}
  const cracks=[];for(let i=0;i<11;i++){const a=i/11*6.283+coR(-.2,.2);let x=ip[0],y=ip[1];const pts=[[x,y]];for(let s=0;s<4;s++){x+=Math.cos(a+coR(-.4,.4))*coR(w*.05,w*.12);y+=Math.sin(a+coR(-.4,.4))*coR(h*.08,h*.2);pts.push([x,y])}cracks.push(pts)}
  S.brk={img,w,h,ox,oy,sh,ip,cracks,t:0};S.emit=false;b.style.visibility='hidden';el.classList.add('broke');
  clearTimeout(el._t);el._t=setTimeout(()=>{el.classList.remove('on','broke');coFxStop(el)},ULTC.break*1000)}
function coBreakDraw(ctx,S,dt,r){const B=S.brk;B.t+=dt;const T=.14;ctx.save();ctx.translate(B.ox,B.oy);
  if(B.t<T){ctx.drawImage(B.img,0,0,B.w,B.h);const k=B.t/T;ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,235,225,${.95})`;ctx.lineWidth=1.6;
    for(const c of B.cracks){const n=Math.max(1,Math.round(c.length*Math.min(1,k*1.6)));ctx.beginPath();for(let i=0;i<n;i++)i?ctx.lineTo(c[i][0],c[i][1]):ctx.moveTo(c[i][0],c[i][1]);ctx.stroke()}
    const g=ctx.createRadialGradient(B.ip[0],B.ip[1],0,B.ip[0],B.ip[1],80);g.addColorStop(0,'rgba(255,90,70,.9)');g.addColorStop(1,'rgba(255,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(B.ip[0],B.ip[1],80,0,7);ctx.fill()}
  else{const tt=B.t-T,al=Math.max(0,1-tt/(ULTC.break-T));
    for(const s of B.sh){s.x=s.vx*tt;s.y=s.vy*tt+.5*900*tt*tt;s.rot=s.vr*tt;ctx.save();ctx.globalAlpha=al;ctx.translate(s.cx+s.x,s.cy+s.y);ctx.rotate(s.rot);ctx.translate(-s.cx,-s.cy);
      ctx.beginPath();ctx.moveTo(s.t[0][0],s.t[0][1]);ctx.lineTo(s.t[1][0],s.t[1][1]);ctx.lineTo(s.t[2][0],s.t[2][1]);ctx.closePath();
      ctx.save();ctx.clip();ctx.fillStyle='rgba(255,60,50,.05)';ctx.fill();ctx.drawImage(B.img,0,0,B.w,B.h);ctx.restore();
      ctx.strokeStyle=`rgba(255,220,215,${.55*al})`;ctx.lineWidth=1;ctx.stroke();ctx.restore()}
    if(tt<.25){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,60,40,${.35*(1-tt/.25)})`;ctx.fillRect(-r.W,-r.H,r.W*3,r.H*3)}}
  ctx.restore()}

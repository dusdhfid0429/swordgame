// ================= 수련 창: 화면 아래에 붙어 캐릭터를 가리지 않는다 =================
// 시간은 멈추지 않는다. 한 번 수련하면 연출이 끝날 때까지(약간의 쿨타임) 다음 수련을 할 수 없다.
// 기본기(근력·지구력·민첩력·본원진기)와 내공 심법 모두 나이와 상관없이 활력으로 수련한다.
const TRN_DUR=GD.TRN_DUR;
const TRN_COL={str:'255,110,50',end:'230,180,90',agi:'110,230,170',qi:'150,255,170'};
const TRN_FX={str:'근력',end:'지구력',agi:'민첩력',qi:'본원진기'};
let trnOpen=false,trnBusy=null;   // trnBusy = {k,t,dur}
const TRN=document.createElement('div');TRN.id='trn';TRN.className='trn';TRN.hidden=true;TRN.setAttribute('role','dialog');TRN.setAttribute('aria-label','수련');
$('stage').appendChild(TRN);
function openTrain(){if(!playing||!P)return;closePanels();trnOpen=true;TRN.hidden=false;document.body.classList.add('trn-on');renderTrain()}
function closeTrain(){trnOpen=false;renderTrain.h='';TRN.hidden=true;document.body.classList.remove('trn-on')}
function trnRow(k,name,val,desc,cost,can,why){
  const busy=trnBusy&&trnBusy.k===k;
  return `<div class="trow"><div class="tname"><b>${name}</b> <span class="num gold">${val}</span><small>${desc}</small></div>
    <button type="button" class="btn tbtn${busy?' busy':''}" data-tr="${k}"${can&&!trnBusy?'':' disabled'}>${why||`수련 · 활력 ${cost}`}<i class="tcd"></i></button></div>`}
function renderTrain(){
  if(!trnOpen)return;const c=qiCost(P.side,P.qiN),fight=inCombat();
  const rows=STATS.map(({k,n})=>{const v=P.st[k],cost=statCost(k);
    const desc=k==='str'?`공격력 +${v*2}`:k==='end'?`활력 최대 ${maxVit()}`:k==='agi'?`현묘도 +${v*2}`:`생명 +${v*10} · 수명 +${Math.floor(v*.5)}년`;
    return trnRow(k,n,v,desc,cost,P.vit>=cost&&!fight,fight?'싸움 중':P.vit<cost?`활력 ${cost} 필요`:'')}).join('');
  // 내용이 바뀔 때만 다시 그린다. 매번 갈아 끼우면 누르는 도중 버튼이 바뀌어 탭이 사라진다.
  const h=`<div class="thead"><span>수련 <small>활력 ${P.vit}/${maxVit()} · ${Math.floor(P.age)}세</small></span><button type="button" class="btn" data-tr="close">닫기</button></div>
    <div class="tlist">${pgRow()}${rows}${trnRow('neigong','내공 심법',baseQi(),`${gapja(baseQi())} · ${school()} · 1회 +${SIDES[P.side].gain}`,c,P.vit>=c&&!fight,fight?'싸움 중':P.vit<c?`활력 ${c} 필요`:'')}</div>`;
  if(h!==renderTrain.h){renderTrain.h=h;TRN.innerHTML=h}
}
TRN.addEventListener('click',e=>{const b=e.target.closest('[data-tr]');if(!b||b.disabled)return;const k=b.dataset.tr;
  if(k==='close'){closeTrain();return}startTrain(k)});
function startTrain(k){
  if(k==='pg'||k==='pg2')return pgStart(k);   // 폐관수련 (g_realm.js)
  if(trnBusy||P.hp<=0)return;if(inCombat()){log('싸움 중에는 수련할 수 없습니다.','info');return}
  const neo=k==='neigong',cost=neo?qiCost(P.side,P.qiN):statCost(k);
  if(P.vit<cost){log(`활력이 부족합니다. (필요 ${cost})`,'info');return}
  P.path=null;P.target=null;P.medit=false;P.chan=null;
  trnBusy={k,t:0,dur:TRN_DUR[k]};if(neo)P.qiTraining=true;else trainFx(k);renderTrain();
}
// 매 프레임: 쿨타임을 흘리고, 끝나면 능력치를 올린다
function trainTick(dt){
  runHooks('trainTick',dt);if(trnBusy&&trnBusy.k.startsWith('pg'))return;   // 폐관은 g_realm.js가 진행한다
  if(trnOpen&&(trainTick.r=(trainTick.r||0)-dt)<=0){trainTick.r=.5;if(!trnBusy)renderTrain()}
  if(!trnBusy)return;const b=trnBusy;b.t+=dt;
  const el=TRN.querySelector(`[data-tr="${b.k}"] .tcd`);if(el)el.style.width=Math.min(100,b.t/b.dur*100)+'%';
  if(b.t<b.dur)return;trnBusy=null;
  if(P.hp>0&&!inCombat()){
    if(b.k==='neigong'){P.qiTraining=false;const c=qiCost(P.side,P.qiN);if(P.vit>=c){P.vit-=c;P.qiN++;recalc();P.qi=P.maxQi;fx.push({t:'lvl',x:P.x,y:P.y,life:1.2});
        addText(P.x,P.y,`내공 +${SIDES[P.side].gain}`,'#9db8e0');log(`운기조식으로 내공이 ${SIDES[P.side].gain} 늘었습니다. (${P.qiN}회차)`,'xp');
        qiTrained()}}
    else{const c=statCost(b.k);if(P.vit>=c){P.vit-=c;P.st[b.k]++;recalc();addText(P.x,P.y,`${TRN_FX[b.k]} +1`,`rgb(${TRN_COL[b.k]})`);log(`${TRN_FX[b.k]}이(가) 1 올랐습니다.`,'sys');wallCheck()}}
  }else{P.qiTraining=false;log('수련이 끊겼습니다.','info')}
  renderTrain();
}
// ---- 능력치마다 다른 연출 ----
let TFX=[];
function trainFx(k){const n=k==='str'?26:k==='end'?3:k==='agi'?14:24;
  TFX.push({k,t:0,dur:TRN_DUR[k],p:Array.from({length:n},(_,i)=>({a:Math.random()*7,r:Math.random(),s:Math.random(),i}))})}
function drawTrainFx(front){
  const dt=front?Math.min(.05,Math.max(0,time-(drawTrainFx.lt??time))):0;if(front)drawTrainFx.lt=time;
  if(!TFX.length)return;const p=toScreen(P.x,P.y);ctx.save();
  for(const f of TFX){if(front)f.t+=dt;const u=Math.min(1,f.t/f.dur),col=TRN_COL[f.k],fade=u<.15?u/.15:u>.8?(1-u)/.2:1;
    if(f.k==='str'){ // 근력: 몸에 붉은 열기가 모였다가 땅을 내리쳐 충격파와 불티가 튄다
      const hit=.55,v=u<hit?u/hit:1;
      if(!front){if(u>=hit){const w=(u-hit)/(1-hit);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},${(1-w)*.9})`;ctx.lineWidth=3*(1-w)+1;
          ctx.beginPath();ctx.ellipse(p.x,p.y,10+70*w,5+35*w,0,0,7);ctx.stroke();
          ctx.strokeStyle=`rgba(255,200,120,${(1-w)*.8})`;ctx.lineWidth=1.5;for(const q of f.p.slice(0,10)){const L=18+40*w*q.r;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(q.a)*L,p.y+Math.sin(q.a)*L*.5);ctx.stroke()}}}
      else{ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(p.x,p.y-30,0,p.x,p.y-30,34);g.addColorStop(0,`rgba(${col},${(u<hit?.35*v:.35*(1-(u-hit)/(1-hit)))})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(p.x-40,p.y-70,80,80);
        if(u<hit)for(const q of f.p){const r=(1-v)*50*(.5+q.r)+4,a=q.a+v*3;ctx.fillStyle=`rgba(${col},${.8*v})`;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*r,p.y-28+Math.sin(a)*r*.6,1.6,0,7);ctx.fill()}
        else{const w=(u-hit)/(1-hit);for(const q of f.p){const d=w*(30+40*q.r),h=w*(30+40*q.s)-w*w*30;ctx.fillStyle=`rgba(255,${150+100*q.s|0},80,${1-w})`;ctx.fillRect(p.x+Math.cos(q.a)*d,p.y-h,2,2)}}
        if(u>=hit&&!f.shook){f.shook=1;shake=Math.max(shake,.18)}}}
    else if(f.k==='end'){ // 지구력: 발밑에서 금빛 방벽이 세 겹으로 차례로 솟아 몸을 감싼다
      ctx.globalCompositeOperation='lighter';
      for(let i=0;i<3;i++){const w=clamp((u-i*.18)/.55,0,1);if(w<=0)continue;const y=p.y-w*58,rx=26-6*w,al=(1-w*.6)*fade;
        const back=!front;ctx.strokeStyle=`rgba(${col},${al*(back?.45:.9)})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(p.x,y,rx,rx*.42,0,back?Math.PI:0,back?Math.PI*2:Math.PI);ctx.stroke()}
      if(front){const g=ctx.createLinearGradient(0,p.y,0,p.y-70);g.addColorStop(0,`rgba(${col},${.22*fade})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(p.x,p.y-32,24,40,0,0,7);ctx.fill()}}
    else if(f.k==='agi'){ // 민첩력: 푸른 바람이 빠르게 몸을 휘감고 잎이 흩날린다
      ctx.globalCompositeOperation='lighter';
      for(const q of f.p){const a=q.a+f.t*(7+q.s*4),r=20+q.r*16,y=p.y-10-q.s*50,inFront=Math.sin(a)>0;if(inFront!==!!front)continue;
        ctx.strokeStyle=`rgba(${col},${.75*fade})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(p.x,y,r,r*.35,0,a-.9,a);ctx.stroke();
        if(q.i%3===0){ctx.fillStyle=`rgba(190,255,150,${.9*fade})`;ctx.beginPath();ctx.ellipse(p.x+Math.cos(a)*r,y+Math.sin(a)*r*.35,3,1.4,a,0,7);ctx.fill()}}
      if(front&&Math.random()<dt*14)fx.push({t:'ghost',x:P.x,y:P.y,life:.3,col:col})}
    else if(f.k==='qi'){ // 본원진기: 땅에서 초록 생기가 피어올라 몸에 스미고, 심장처럼 두 번 고동친다
      ctx.globalCompositeOperation='lighter';
      if(front){for(const q of f.p){const w=(u*1.4+q.s)%1,x=p.x+Math.cos(q.a)*(24*(1-w)+2),y=p.y-4-w*44;ctx.fillStyle=`rgba(${col},${(1-w)*.9*fade})`;ctx.beginPath();ctx.arc(x,y,1.4+q.r*1.4,0,7);ctx.fill()}
        const beat=Math.max(0,Math.sin(u*Math.PI*4))**6,g=ctx.createRadialGradient(p.x,p.y-30,0,p.x,p.y-30,30+10*beat);g.addColorStop(0,`rgba(220,255,220,${(.15+.4*beat)*fade})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(p.x-45,p.y-75,90,90)}
      else{ctx.fillStyle=`rgba(${col},${.18*fade})`;ctx.beginPath();ctx.ellipse(p.x,p.y,30,15,0,0,7);ctx.fill()}}
  }
  ctx.restore();if(front)TFX=TFX.filter(f=>f.t<f.dur);
}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||!playing)return;
  if(e.code==='KeyT'){trnOpen?closeTrain():openTrain()}else if(e.code==='Escape'&&trnOpen)closeTrain()});

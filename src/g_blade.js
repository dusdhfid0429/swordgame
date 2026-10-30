// ================= 병기 기운의 단계: 화경 이후 (v170) =================
// 사용자(2026-10-22): "초절정 이후 검강밖에 없다. 자료 찾아보고 이후 경지에 어검술 같은 것을 더해 줘"
// 무협 관례 검기(일류) → 검사(절정) → 검강(초절정) → 검환(화경) → 어검술(현경) → 심검(생사경) → 무형검(자연경).
// 일류~초절정은 g_realmfx.js 가 그리고, 화경부터는 여기서 덧붙인다. 이름·수치는 data/blade.json BLADE, 병기마다 이름이 다르다
const BLADE=GD.BLADE;
const bladeCls=()=>{const w=P&&P.eq&&P.eq.weapon,c=!P||!P.cur?'검':hasWeaponFor(curCls())?curCls():w?w.cls:'권';return BLADE.names[c]?c:'검'};   // 든 병기를 따르고, 맨손이면 권
function bladeName(r){return r<2?'':BLADE.names[bladeCls()][Math.min(r,8)-2]}
const bladeHz=r=>bladeCls()==='검'?`(${BLADE.hz[Math.min(r,8)-2]})`:'';   // 한자는 검 이름에만 맞는다
const bladeCol=r=>BLADE.col[Math.min(r,8)-2];
const bladeFoes=(c,R,first)=>{const l=foes().filter(q=>q.hp>0&&!q.d.villager&&dist(q,P)<R).sort((a,b)=>dist(a,P)-dist(b,P));
  if(first&&first.hp>0&&l.includes(first)){l.splice(l.indexOf(first),1);l.unshift(first)}return l.slice(0,c)};
function bladeCall(r,e){if(time-(P.bnT||-9)>4){P.bnT=time;addText(e.x,e.y-1,bladeName(r),`rgb(${bladeCol(r)})`)}}
const bHit=(e,m)=>{if(e.hp>0)damage(e,Math.max(1,Math.round(atk()*m)),0,0,P)};

// 화경 검환: 강기 구슬이 몸 곁을 반 바퀴 돌고 날아가 터진다
function bladeOrb(e){const q=BLADE.proc[5],col=bladeCol(5),L=.55;
  fx.push({t:'bt',k:'orb',glow:true,x:P.x,y:P.y,tx:e.x,ty:e.y,a0:Math.random()*6.28,col,life:L,max:L});
  later(L,()=>{bHit(e,q.m);for(const o of foes())if(o!==e&&o.hp>0&&dist(o,e)<q.r)bHit(o,q.splash);
    GL({t:'ring2',x:e.x,y:e.y,r:q.r*.8,col,w:4,life:.35});fParts(null,e,col,10,110,'dot',.45);shake=Math.max(shake,.08)})}
// 현경 어검술: 기검 세 자루가 등 뒤에서 솟아 적을 꿰뚫는다
function bladeFly(e){const q=BLADE.proc[6],col=bladeCol(6),l=bladeFoes(q.n,q.range,e);
  for(let i=0;i<q.n;i++){const o=l[i%Math.max(1,l.length)]||e,d=.12*i,L=.5;
    later(d,()=>{const side=(i-(q.n-1)/2)*.55;fx.push({t:'bt',k:'fly',cls:bladeCls(),glow:true,x:P.x,y:P.y,sx:P.x-P.fx*.5-P.fy*side,sy:P.y-P.fy*.5+P.fx*side,tx:o.x,ty:o.y,col,life:L,max:L});
      later(L*.85,()=>{bHit(o,q.m);fStar(null,o,col,.8,.2)})})}}
// 생사경 심검: 날아가는 것 없이 뜻이 닿은 자리가 베인다
function bladeMind(e){const q=BLADE.proc[7],col=bladeCol(7);
  bladeFoes(q.n,q.range,e).forEach((o,i)=>later(i*.06,()=>{fx.push({t:'bt',k:'mind',cls:bladeCls(),glow:true,x:o.x,y:o.y,a0:Math.random()*3.14,col,life:.45,max:.45});later(.08,()=>bHit(o,q.m))}))}
// 자연경 무형검: 하늘에서 형체 없는 기검이 떨어진다
function bladeRain(e){const q=BLADE.proc[8],col=bladeCol(8);
  bladeFoes(q.n,q.range,e).forEach((o,i)=>later(i*.09,()=>{const ox=(Math.random()-.5)*.3,oy=(Math.random()-.5)*.3,L=.42;
    fx.push({t:'bt',k:'rain',cls:bladeCls(),glow:true,x:o.x+ox,y:o.y+oy,col,life:L,max:L});
    later(L*.45,()=>{bHit(o,q.m);GL({t:'ring2',x:o.x+ox,y:o.y+oy,r:.6,col,w:2,life:.3})})}))}

hook('hitDone',c=>{const r=realmIdx(),e=c.e;if(r<5||e.hp>=c.hp0)return;const tr=Math.min(r,8),q=BLADE.proc[tr];
  if(tr===8){if(time-(P.mhT??-99)<q.cd)return;P.mhT=time}
  else{if(time-(P.bpT??-99)<q.icd||Math.random()>=q.p)return;P.bpT=time}
  bladeCall(tr,e);(tr===5?bladeOrb:tr===6?bladeFly:tr===7?bladeMind:bladeRain)(e)});

// 베기 모양: 검환은 반달 끝에 강환이 맺히고, 어검술은 반달을 따라 검 그림자 둘, 심검은 반달이 옅어지고 날카로운 한 줄, 무형검은 형체 없이 물결만
// v211: 찌르기·주먹(o.t 'thrust')이면 강환은 기운 끝에 맺히고, 병기 그림자는 기운과 나란히 앞으로 뻗는다. 그림자 모양은 든 병기를 따른다 (wpnShape)
hook('slashFx',o=>{const r=realmIdx();if(r<5)return;const tr=Math.min(r,8),col=bladeCol(tr),L=o.life,cls=bladeCls(),th=o.t==='thrust';
  if(th&&tr===5)fx.push({t:'bt',k:'tipT',glow:true,x:P.x,y:P.y,ang:o.ang,r:o.r,mo:o.mo,col,life:L,max:L});
  else if(th&&tr===6)for(const s of[-1,1])fx.push({t:'bt',k:'shadowT',cls,side:s,glow:true,x:P.x,y:P.y,ang:o.ang,r:o.r,mo:o.mo,col,life:L*1.1,max:L*1.1});
  else if(tr===5)fx.push({t:'bt',k:'tip',glow:true,x:P.x,y:P.y,ang:o.ang,r:o.r*1.04,spread:o.spread*1.15,flip:o.flip,col,life:L,max:L});
  else if(tr===6)for(const s of[-1,1])fx.push({t:'bt',k:'shadow',cls,glow:true,x:P.x,y:P.y,ang:o.ang+s*o.spread*.35,r:o.r,col,life:L*1.1,max:L*1.1});
  else if(tr===7){fx.push({...o,glow:true,el:false,st:null,col,r:o.r,w:o.w*.7,dim:.45,max:L,life:L});fx.push({t:'bt',k:'cut',glow:true,x:P.x,y:P.y,ang:o.ang,r:o.r*1.05,col,life:L*.8,max:L*.8})}
  else fx.push({t:'bt',k:'ripple',glow:true,x:P.x,y:P.y,ang:o.ang,r:o.r,col,life:L*1.4,max:L*1.4})});

// 경지에 들면 알린다 (g_realmfx.js realmGain 이 부른다)
function bladeGain(r){if(r>=5&&r<=8)log(`${bladeName(r)}${bladeHz(r)}: ${BLADE.d[r-2]}`,'xp')}
function bladeHtml(){const r=realmIdx();if(r<2)return'';
  return `<p>병기 기운 <b class="gold">${bladeName(r)}</b> <small class="dim">${bladeHz(r)} ${BLADE.d[Math.min(r,8)-2]}</small></p>`}

// ---- 그리기 (r_fx.js drawGlow2 가 t:'bt' 를 넘긴다) ----
function swordShape(x,y,ang,len,col,a){   // 날·코등이·자루를 한 획씩
  const c=Math.cos(ang),s=Math.sin(ang),px=-s,py=c,tip=[x+c*len*.6,y+s*len*.6],hilt=[x-c*len*.4,y-s*len*.4],g=[x-c*len*.25,y-s*len*.25];
  ctx.fillStyle=rgba(col,.55*a);ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(g[0]+px*3,g[1]+py*3);ctx.lineTo(g[0]-px*3,g[1]-py*3);ctx.fill();
  ctx.strokeStyle=rgba(HI,.95*a);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(g[0],g[1]);ctx.stroke();
  ctx.strokeStyle=rgba(col,.9*a);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g[0]+px*6,g[1]+py*6);ctx.lineTo(g[0]-px*6,g[1]-py*6);ctx.moveTo(g[0],g[1]);ctx.lineTo(hilt[0],hilt[1]);ctx.stroke()}
// 든 병기 모양의 기운 그림자 (v211): 검·도·창·봉·권. 단도·절편은 검 모양
function wpnShape(cls,x,y,ang,len,col,a){const c=Math.cos(ang),s=Math.sin(ang),px=-s,py=c,at=(u,v=0)=>[x+c*len*u+px*v,y+s*len*u+py*v];
  const fill=(pts,al)=>{ctx.fillStyle=rgba(col,al*a);path(pts);ctx.fill()},line=(p0,p1,w,cc,al)=>{ctx.strokeStyle=rgba(cc,al*a);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()};
  if(cls==='도'){fill([at(.62,1),at(-.22,2.5),at(-.22,-3),at(.15,-5.5),at(.45,-4)],.55);line(at(-.22,-3),at(.15,-5.5),1.4,HI,.9);line(at(.15,-5.5),at(.62,1),1.4,HI,.9);   // 등은 곧고 날이 배부른 넓은 칼
    ctx.fillStyle=rgba(col,.9*a);ctx.beginPath();ctx.arc(...at(-.25),3.2,0,7);ctx.fill();line(at(-.28),at(-.45),2.2,col,.9)}
  else if(cls==='창'){line(at(-.65),at(.42),2,col,.85);line(at(-.65),at(.42),.8,HI,.8);fill([at(.68),at(.42,3.5),at(.36),at(.42,-3.5)],.8);line(at(.42),at(.68),1.2,HI,.95);   // 긴 자루 끝 잎사귀 창날, 붉은 술
    ctx.fillStyle=rgba('220,70,60',.8*a);ctx.beginPath();ctx.arc(...at(.35),2.4,0,7);ctx.fill()}
  else if(cls==='봉'){line(at(-.6),at(.6),3.2,col,.75);line(at(-.6),at(.6),1.1,HI,.85);for(const u of[-.5,-.42,.42,.5])line(at(u,2.4),at(u,-2.4),1.4,col,.9)}   // 매끈한 막대, 양 끝 쇠테
  else if(cls==='권'){const r=len*.24,f0=at(.15);glowDot(f0[0],f0[1],r*2.4,col,.6*a);fill([at(-.45,r*.45),at(.05,r*.9),at(.05,-r*.9),at(-.45,-r*.45)],.35);   // 주먹: 손목에서 굵어져 마디 넷이 앞을 향한다
    ctx.fillStyle=rgba(col,.75*a);ctx.beginPath();ctx.arc(f0[0],f0[1],r,0,7);ctx.fill();for(let i=0;i<4;i++){const q=at(.15+r/len*.85,(i-1.5)*r*.5);ctx.fillStyle=rgba(HI,.85*a);ctx.beginPath();ctx.arc(q[0],q[1],r*.22,0,7);ctx.fill()}}
  else swordShape(x,y,ang,len,col,a)}
function drawBT(f){const k=f.life/f.max,pr=1-k,p=toScreen(f.x,f.y);
  if(f.k==='orb'){const a=f.a0+pr*4,u=Math.max(0,(pr-.45)/.55),e=u*u,
      ox=P.x+Math.cos(a)*.7,oy=P.y+Math.sin(a)*.7,wx=ox+(f.tx-ox)*e,wy=oy+(f.ty-oy)*e,q=toScreen(wx,wy),y=q.y-30-Math.sin(Math.min(1,pr/.45)*Math.PI)*6;
    if(!f.tr)f.tr=[];f.tr.push([q.x,y]);if(f.tr.length>9)f.tr.shift();
    f.tr.forEach((t,i)=>glowDot(t[0],t[1],4+i*1.2,f.col,.12+i*.05));
    glowDot(q.x,y,28,f.col,.9);ctx.fillStyle=rgba(HI,.95);ctx.beginPath();ctx.arc(q.x,y,6,0,7);ctx.fill();
    ctx.strokeStyle=rgba(f.col,.8);ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(q.x,y,9,4,time*6,0,7);ctx.stroke()}
  else if(f.k==='fly'){const rise=Math.min(1,pr/.3),u=Math.max(0,(pr-.3)/.7),e=u*u*(3-2*u),
      wx=f.sx+(f.tx-f.sx)*e,wy=f.sy+(f.ty-f.sy)*e,q=toScreen(wx,wy),h=34+rise*18-e*22,b=toScreen(f.tx,f.ty),
      ang=u>0?Math.atan2(b.y-30-(q.y-h),b.x-q.x):-Math.PI/2+(1-rise)*.6;
    if(!f.tr)f.tr=[];f.tr.push([q.x,q.y-h]);if(f.tr.length>7)f.tr.shift();
    ctx.strokeStyle=rgba(f.col,.35);ctx.lineWidth=5;path(f.tr);ctx.stroke();
    glowDot(q.x,q.y-h,18,f.col,.55);wpnShape(f.cls,q.x,q.y-h,ang,42,f.col,Math.min(1,k*3))}
  else if(f.k==='mind'&&(f.cls==='권'||f.cls==='봉')){const cy=p.y-26,fade=Math.min(1,k*1.6),hit=Math.min(1,pr/.15);   // 심권·심봉: 베임 대신 그 자리에 보이지 않는 일격이 꽂혀 움푹 터진다
    const[rx,ry]=isoR(.7*(1-hit)+.2);ctx.strokeStyle=rgba(f.col,.7*fade);ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(p.x,cy,rx*.6,rx*.6,0,0,7);ctx.stroke();
    glowDot(p.x,cy,20+hit*10,f.col,fade*hit);
    for(let i=0;i<6;i++){const a=f.a0+i*1.047,r0=8+hit*6,r1=r0+hit*16;ctx.strokeStyle=rgba(HI,.9*fade*hit);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*r0,cy+Math.sin(a)*r0*.7);ctx.lineTo(p.x+Math.cos(a)*r1,cy+Math.sin(a)*r1*.7);ctx.stroke()}
    ctx.strokeStyle=rgba(f.col,.5*fade);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,7);ctx.stroke()}
  else if(f.k==='mind'){   // 심검·심도는 엇갈린 두 줄, 심창은 꿰뚫는 한 줄
    const cy=p.y-26,draw=Math.min(1,pr/.18),fade=Math.min(1,k*1.6);
    for(const d of(f.cls==='창'?[0]:[0,1.15])){const a=f.a0+d,L=34,c=Math.cos(a),s=Math.sin(a)*.7,x0=p.x-c*L,y0=cy-s*L,x1=x0+c*L*2*draw,y1=y0+s*L*2*draw;
      for(const[w,cc,al]of[[7,f.col,.25],[2.4,f.col,.8],[1,HI,1]]){ctx.strokeStyle=rgba(cc,al*fade);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke()}}
    const[rx,ry]=isoR(.55+pr*.4);ctx.strokeStyle=rgba(f.col,.5*fade);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,7);ctx.stroke()}
  else if(f.k==='rain'){const fall=Math.min(1,pr/.45),y=p.y-220*(1-fall*fall)-6,fade=pr<.45?.4+fall*.6:Math.max(0,(1-pr)/.55);
    ctx.strokeStyle=rgba(f.col,.22*fade);ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(p.x,y-70);ctx.lineTo(p.x,y);ctx.stroke();
    wpnShape(f.cls,p.x,y-14,Math.PI/2,34,f.col,fade*.85);if(pr>=.45){const[rx,ry]=isoR(.3+(pr-.45)*1.2);glowDot(p.x,p.y,rx,f.col,fade*.8,ry/rx)}}
  else if(f.k==='tip'){const sp=f.spread,dir=f.flip?-1:1,rx=f.r*55,ry=f.r*32,th=Math.atan2(Math.sin(f.ang)*rx,Math.cos(f.ang)*ry),a=th+dir*sp/2*Math.min(1,pr/.32),
      x=p.x+Math.cos(a)*rx,y=p.y-26+Math.sin(a)*ry;glowDot(x,y,16,f.col,k);ctx.fillStyle=rgba(HI,k);ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill()}
  else if(f.k==='shadow'){const rx=f.r*55,ry=f.r*32,th=Math.atan2(Math.sin(f.ang)*rx,Math.cos(f.ang)*ry),d=.35+pr*.65,x=p.x+Math.cos(th)*rx*d,y=p.y-30+Math.sin(th)*ry*d;
    wpnShape(f.cls,x,y,Math.atan2(Math.sin(th)*ry,Math.cos(th)*rx),26,f.col,k*.9)}
  else if(f.k==='tipT'){const g=thrustGeo(f),u=Math.min(1,pr/(f.mo==='punch'?.16:.22)),x=p.x+g.ux*(6+g.L*u),y=p.y-26+g.uy*(6+g.L*u);
    glowDot(x,y,16,f.col,k);ctx.fillStyle=rgba(HI,k);ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill()}
  else if(f.k==='shadowT'){const g=thrustGeo(f),d=.3+pr*.7,x=p.x+g.ux*g.L*d-g.uy*f.side*16,y=p.y-28+g.uy*g.L*d+g.ux*f.side*16;
    wpnShape(f.cls,x,y,Math.atan2(g.uy,g.ux),26,f.col,k*.9)}
  else if(f.k==='cut'){const rx=f.r*55,ry=f.r*32,th=Math.atan2(Math.sin(f.ang)*rx,Math.cos(f.ang)*ry),c=Math.cos(th+1.57),s=Math.sin(th+1.57),
      cx=p.x+Math.cos(th)*rx*.6,cy=p.y-26+Math.sin(th)*ry*.6,L=rx*.7*Math.min(1,pr/.15);
    for(const[w,cc,al]of[[5,f.col,.3],[1.2,HI,1]]){ctx.strokeStyle=rgba(cc,al*k);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx-c*L,cy-s*L*.6);ctx.lineTo(cx+c*L,cy+s*L*.6);ctx.stroke()}}
  else if(f.k==='ripple'){const rx=f.r*55,ry=f.r*32,th=Math.atan2(Math.sin(f.ang)*rx,Math.cos(f.ang)*ry),cx=p.x+Math.cos(th)*rx*.5,cy=p.y-20+Math.sin(th)*ry*.5;
    for(let i=0;i<3;i++){const u=Math.min(1,pr*1.4-i*.18);if(u<=0)continue;ctx.strokeStyle=rgba(f.col,.5*(1-u)*Math.min(1,k*2));ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(cx,cy,10+u*rx*.6,(10+u*rx*.6)*.5,0,0,7);ctx.stroke()}
    if(!f.mo)f.mo=Array.from({length:6},()=>[(Math.random()-.5)*rx,(Math.random()-.5)*ry]);for(const m of f.mo)glowDot(cx+m[0],cy+m[1]-pr*14,5,f.col,.6*k)}
}

function drawFighter(e,isP){
  const dc=isP?heroCls():null,pal=isP?{...PAL.hero,weapon:CLASS[dc].draw}:(PAL[e.d&&e.d.pal||e.pal]||PAL.bandit),p=toScreen(e.x,e.y),sc=(e.d&&e.d.big)||e.big||1;
  const side=(e.fx-e.fy)>=0?1:-1,back=(e.fx+e.fy)<-.35,front=(e.fx+e.fy)>.35;
  const mv=e.moving,ph=time*(isP?moveSpd():e.sp||1)*3.1+(e.bob||0);
  const flash=(isP?P.hit:e.hit)>0,Fc=c=>flash?'#ffffff':c;
  const jump=isP&&P.jump>0?Math.sin((1-P.jump/.35)*Math.PI)*28:0;
  ctx.save();ctx.translate(p.x,p.y);
  const sh=1-jump/70;ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,0,13*sc*sh,5.5*sc*sh,0,0,7);ctx.fill();
  if(!isP&&e.wind>0){ctx.strokeStyle=`rgba(220,60,40,${.45+.4*Math.sin(time*30)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,TW/2*sc,TH/2*sc,0,0,7);ctx.stroke()}
  if(isP&&P.inv>0)ctx.globalAlpha=.6;
  if(isP&&heroSprite()){const[fi,useB,lk]=heroFrame(),f=HF[fi],k=.47,lift=P.sj>0?Math.sin((1-P.sj/.6)*Math.PI)*22:jump;ctx.translate(0,-lift);ctx.scale(side,1);
    const gb=heroGarb(),img=useB?(flash&&HBODYW?HBODYW:gb?gb.body:HBODY):(flash&&HEROW?HEROW:gb?gb.hero:HERO);
    // 일대제자부터 문파 망토 (도트 몸이 코드 사람보다 1.2배 크다)
    if(gb&&gb.pal.cape&&!flash){const tr=e.moving?7:0,wv=Math.sin(time*8);ctx.save();ctx.translate(-2,-8);drawCape(gb.pal,tr,wv,1.2);ctx.restore()}
    ctx.drawImage(img,f[0],0,f[1],f[2],-f[3]*k,-f[2]*k+3-f[4]*k,f[1]*k,f[2]*k);
    if(lk){ctx.save();ctx.translate(-f[3]*k,-f[2]*k+3-f[4]*k);ctx.scale(k,k);drawWeapon(dc,lk==='b'?WL.b[fi]:WL.s[fi],lk,flash);ctx.restore()}
    if(P.palm>0){const a=P.palm/.35,g=ctx.createRadialGradient(26,-44,1,26,-44,20);g.addColorStop(0,`rgba(190,220,255,${a})`);g.addColorStop(1,'rgba(80,130,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(26,-44,20,0,7);ctx.fill()}
    ctx.restore();return}
  ctx.scale(sc*side,sc);
  const s1=mv?Math.sin(ph):0,c1=mv?Math.cos(ph):0,bob=mv?Math.abs(c1)*2.2:Math.sin(time*2.2+(e.bob||0))*.5;
  ctx.translate(0,-bob-jump/sc);
  // attack pose for the weapon arm: 0 = hanging, PI/2 = straight ahead, ~3 = overhead
  const sw=isP?P.swing:e.swing,wind=!isP&&(e.wind>0||e.slam>0),mode=isP?CLASS[dc].anim:pal.anim||'swing',prog=sw>0?1-sw/(isP?P.swingMax:.24):0;
  let ang=mv?.35-s1*.55:.32,reach=0,kick=0;
  if(mode==='thrust'){if(sw>0){ang=1.5;reach=Math.sin(prog*Math.PI)*12}else if(!mv)ang=.8}
  else if(mode==='punch'){if(sw>0){ang=1.55;reach=Math.sin(prog*Math.PI)*9}}
  else if(mode==='kick'&&sw>0)kick=Math.sin(prog*Math.PI);
  const attacking=sw>0||wind,wk=isP?dc:'';
  // combat stances after martial-arts silhouettes: wide low base, overhead chamber -> diagonal cut, lunges, chambered fists, high kicks
  let st=null,lean=mv?.15:0,twoH=false,bArm=null;
  if(attacking){
    if(mode==='swing'){if(sw>0){const w0=prog<.22;ang=w0?2.5+prog/.22*.8:3.3-(prog-.22)/.78*3.7;lean=w0?-.14:.34*Math.sin(Math.min(1,(prog-.22)/.45)*Math.PI/2)}
      else{ang=2.7+Math.sin(time*20)*.08;lean=-.12}
      st=[[.66,.02],[-.62,-.55]];twoH=isP||(e.d&&e.d.boss)}
    else if(mode==='thrust'){st=[[.95,.22],[-.88,-.78]];lean=.32;twoH=true}
    else if(mode==='punch'){st=[[.78,.08],[-.72,-.62]];lean=.24;bArm=-.75}
    else{st=[[kick*1.95,kick*1.8],[-.12,-.18]];lean=-.32*kick;bArm=1.3}
  }else if(isP&&!mv&&mobs.some(o=>o.hp>0&&o.aggro&&dist(o,P)<3.5)){
    st=[[.42,0],[-.38,-.36]];ang=mode==='thrust'?1.25:mode==='swing'?1.1:1.35;lean=.05;
    if(mode==='punch'||mode==='kick')bArm=1.15;else twoH=true}
  const trail=mv?7:0,wv=Math.sin(time*8+(e.bob||0));
  // legs: thigh/shin angles from the run cycle, knee folds back as the leg lifts
  const legs=off=>{if(!mv)return[0,-.05];const a=ph+off,t=Math.sin(a)*.7;return[t,t-(Math.max(0,Math.cos(a))*1.0+.12)]};
  const leg=(hip,[ta,sa])=>{const k=joint(hip,ta,12.5),f=joint(k,sa,13);seg([hip,k,f],4.6,Fc(pal.pants));seg([joint(k,sa,8),f],5,Fc(pal.boot));seg([f,[f[0]+3.2,f[1]+.3]],3.4,Fc(pal.boot));return f};
  const backLeg=st?st[1]:legs(Math.PI),frontLeg=st?st[0]:legs(0);
  const vh=l=>12.5*Math.cos(l[0])+13*Math.cos(l[1]);ctx.translate(0,st?25.5-Math.max(vh(frontLeg),vh(backLeg)):0);
  const withLean=fn=>{ctx.save();ctx.translate(0,-29);ctx.rotate(lean);ctx.translate(0,29);fn();ctx.restore()};
  // cape (boss) and sash tails (hero) stream behind
  if(pal.cape&&pal.capeLen)withLean(()=>drawCape(flash?{...pal,cape:'#ffffff',emb:null}:pal,trail,wv));
  else if(pal.cape)withLean(()=>poly([[-7,-45],[4,-45],[-10-trail*1.6,-4+wv*2],[-22-trail*2,-8+wv*3]],Fc(pal.cape)));
  if(pal.jade)seg([[-6,-30],[-12-trail,-22+wv*2],[-17-trail*1.4,-15+wv*3]],2.2,Fc(pal.sash));
  // ponytail behind the head (drawn over it in back view)
  const tail=()=>{if(pal.tail)withLean(()=>seg([[-2,-58],[-6-trail*.6,-52+wv],[-8-trail,-42+wv*1.5]],3,Fc(pal.hair)))};
  if(!back)tail();
  // back arm with wide sleeve
  withLean(()=>{const sh2=[-4,-44];
    if(twoH&&mode!=='kick'){const hp=[4+reach+12*Math.sin(ang),-44+12*Math.cos(ang)],el=[(sh2[0]+hp[0])/2-1,(sh2[1]+hp[1])/2+5];
      seg([sh2,el,hp],6,Fc(pal.robeB));ctx.fillStyle=pal.skin[1];ctx.beginPath();ctx.arc(hp[0],hp[1],2.1,0,7);ctx.fill();return}
    const sa=bArm??(attacking?.35:(mv?s1*.6:.12)),el=joint(sh2,sa,7.5),hd=joint(el,sa+(bArm!==null&&bArm<0?-.9:.55),7);
    seg([sh2,el,hd],6,Fc(pal.robeB));seg([hd,joint(hd,sa+.55,.5)],7.5,Fc(pal.robeB));ctx.fillStyle=pal.skin[1];ctx.beginPath();ctx.arc(...joint(hd,sa+.55,2.5),2.1,0,7);ctx.fill()});
  leg([-2,-26],backLeg);
  // robe skirt: back panel lags and flutters, front panel follows the front thigh
  const bk=Math.sin(backLeg[0])*8,ff=Math.sin(frontLeg[0])*10,hem=pal.short?-15:-6;
  poly([[-8,-30],[1,-30],[-1+bk*.6,hem-1],[-10+bk-trail*.5,hem+wv*.6]],Fc(pal.robeB));
  leg([2,-26],frontLeg);
  poly([[-1,-30],[8,-30],[11+ff,hem-2],[2+ff*.7,hem]],Fc(lg(-2,11,pal.robe[0],pal.robe[1])));
  if(pal.patch&&!flash){ctx.fillStyle='rgba(60,50,30,.75)';ctx.fillRect(3,-22,4,4);ctx.fillStyle='rgba(150,120,80,.7)';ctx.fillRect(-6,-16,4,3)}
  withLean(()=>{
    // torso, cross collar, sash and pendant
    poly([[-8,-45],[8,-45],[7.6,-37],[7,-29],[-7,-29],[-8,-37]],Fc(lg(-8,8,pal.robe[0],pal.robe[1])));
    if(!back){poly([[-1.5,-45],[4.5,-45],[1.5,-37]],Fc(pal.inner));ctx.strokeStyle=pal.trim;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-4,-45);ctx.lineTo(2,-35);ctx.moveTo(6,-45);ctx.lineTo(2.5,-39);ctx.stroke()}
    if(pal.armor){poly([[-10,-46],[-2,-46],[-3,-38],[-11,-39]],lg(-11,-2,'#7c776c','#24221e'));poly([[2,-46],[11,-46],[11,-38],[3,-38]],lg(2,11,'#7c776c','#24221e'));
      ctx.strokeStyle='rgba(20,18,16,.7)';ctx.lineWidth=1;for(let y=-42;y<-32;y+=3){ctx.beginPath();ctx.moveTo(-6,y);ctx.lineTo(6,y);ctx.stroke()}}
    poly([[-7.6,-32.5],[7.6,-32.5],[7.3,-28.5],[-7.3,-28.5]],Fc(pal.sash));
    if(pal.emb&&!back&&!flash)drawEmblem(ctx,pal.emb,-3.5,-39,5.5);
    if(pal.jade){const sway=mv?s1*2:0;seg([[5,-28.5],[5.5+sway,-21]],1.2,pal.trim);ctx.fillStyle='#5fbf8f';ctx.beginPath();ctx.arc(5.6+sway,-19.5,2,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=.8;ctx.stroke();
      seg([[5.6+sway,-17.5],[5.8+sway*1.2,-13]],1.4,'#b8291f')}
    // neck and head
    ctx.fillStyle=Fc(pal.skin[1]);ctx.fillRect(.5,-49,3,4);
    const hx=1.5,hy=-53;const hg=ctx.createRadialGradient(hx+1,hy-2,1,hx,hy,7);hg.addColorStop(0,pal.skin[0]);hg.addColorStop(1,pal.skin[1]);
    ctx.beginPath();ctx.ellipse(hx,hy,5.2,5.8,0,0,7);ctx.fillStyle=Fc(hg);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=pal.hair;
    if(back){ctx.beginPath();ctx.ellipse(hx,hy,5.4,6,0,0,7);ctx.fill()}
    else{ctx.beginPath();ctx.ellipse(hx-.6,hy-1.4,5.5,5,0,Math.PI*.95,Math.PI*2.05);ctx.fill();
      ctx.beginPath();ctx.moveTo(hx-5,hy-2);ctx.quadraticCurveTo(hx-6,hy+3,hx-4,hy+6);ctx.lineTo(hx-3,hy);ctx.fill();
      ctx.fillStyle='#1a1210';ctx.fillRect(hx+3,hy-.5,1.6,1.3);if(front)ctx.fillRect(hx-.5,hy-.5,1.5,1.2);
      ctx.strokeStyle='rgba(40,25,15,.7)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(hx+2.5,hy-2);ctx.lineTo(hx+5,hy-2.4);ctx.stroke()}
    ctx.fillStyle=pal.hair;ctx.beginPath();ctx.arc(hx-1.5,hy-6.5,2.8,0,7);ctx.fill();
    if(pal.hairband){ctx.fillStyle=pal.hairband;ctx.fillRect(hx-3.6,hy-5.6,4.2,1.6);seg([[hx-3.6,hy-5],[hx-8-trail*.7,hy-3+wv*1.5]],1.2,pal.hairband)}
    if(pal.band){ctx.fillStyle=pal.band;ctx.fillRect(hx-5.4,hy-3.6,10.8,2.2);seg([[hx-5.4,hy-2.6],[hx-9-trail*.5,hy+1+wv]],1.4,pal.band)}
    if(pal.mask&&!back){ctx.fillStyle=pal.mask;ctx.fillRect(hx-.5,hy+1.2,6.3,3.6)}
    if(pal.beard&&!back){ctx.fillStyle=pal.hair;ctx.beginPath();ctx.moveTo(hx-1,hy+3);ctx.lineTo(hx+5.5,hy+2);ctx.lineTo(hx+3,hy+10);ctx.closePath();ctx.fill()}
  });
  if(back)tail();
  // weapon arm: sleeve, cuff, hand, weapon
  withLean(()=>{ctx.save();ctx.translate(4+reach,-44);ctx.rotate(-ang);
    seg([[0,0],[0,7],[0,12]],6,Fc(pal.robe[0]));seg([[0,11.2],[0,12.4]],7.6,Fc(pal.trim));
    ctx.fillStyle=pal.skin[0];ctx.beginPath();ctx.arc(0,13.5,2.4,0,7);ctx.fill();
    if(!(isP&&P.palm>0))weapon(pal.weapon);
    ctx.restore()});
  if(isP&&P.palm>0){const k=P.palm/.35;const g=ctx.createRadialGradient(16,-40,1,16,-40,18);g.addColorStop(0,`rgba(190,220,255,${k})`);g.addColorStop(1,'rgba(80,130,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(16,-40,18,0,7);ctx.fill()}
  ctx.restore();
  if(!isP&&e.stun>0&&!e.npc){for(let n=0;n<3;n++){const a=time*6+n*2.1;ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(p.x+Math.cos(a)*10,p.y-(sc>1.2?88:68)+Math.sin(a)*3,2,0,7);ctx.fill()}}
  if(!isP&&!e.npc){const w=30*sc,y=p.y-(sc>1.2?94:74);
    ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(p.x-w/2-1,y-1,w+2,5);ctx.fillStyle='#c0261b';ctx.fillRect(p.x-w/2,y,w*Math.max(0,e.hp/e.maxHp),3);
    if(e.d.boss||e.duel||e.ally||e.d.fac||P.target===e){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(e.name,p.x+1,y-4);ctx.fillStyle=e.d.boss?'#ff9a6a':e.ally?'#a6d47f':e.d.fac?(peaceful(e)?'#9cc8f0':'#f0a080'):'#f0e4c8';ctx.fillText(e.name,p.x,y-5);if(e.sect&&LOOK[e.sect]){const tw=ctx.measureText(e.name).width;drawEmblem(ctx,e.sect,p.x-tw/2-8,y-9,12)}}}
  if(e.npc){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(e.n,p.x+1,p.y-71);ctx.fillStyle='#e8c66e';ctx.fillText(e.n,p.x,p.y-72)}
}

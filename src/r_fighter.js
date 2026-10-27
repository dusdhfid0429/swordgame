function drawFighter(e,isP){
  const dc=isP?heroCls():null,pal=isP?{...PAL.hero,weapon:CLASS[dc].draw}:(PAL[e.d&&e.d.pal||e.pal]||PAL.bandit),p=toScreen(e.x,e.y),sc=(e.d&&e.d.big)||e.big||1;
  const side=(e.fx-e.fy)>=0?1:-1,back=(e.fx+e.fy)<-.35,front=(e.fx+e.fy)>.35;
  const mv=e.moving,ph=time*(isP?moveSpd():e.sp||1)*3.1+(e.bob||0);
  const flash=(isP?P.hit:e.hit)>0,Fc=c=>flash?'#ffffff':c;
  const jump=isP&&P.jump>0?Math.sin((1-P.jump/.35)*Math.PI)*28:0;
  ctx.save();ctx.translate(p.x,p.y);
  const sh=1-jump/70;ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,0,13*sc*sh,5.5*sc*sh,0,0,7);ctx.fill();
  // v172: 칠 준비 고리는 g_danger.js drawTop 이 나를 노리는 치명 공격에만 그린다 (사용자 2026-10-24: 몹끼리 싸울 때는 없어야)
  if(isP&&P.inv>0)ctx.globalAlpha=.6;
  if(isP&&heroSprite()){let[fi,useB,lk,a2,sh]=heroFrame(),f=sh?SHEETS[sh].frames[fi]:a2?HF2[fi]:HF[fi];
    // 안전망: 잘못된 장 번호(예전 저장의 공격 세트 등)면 기본 서기 장으로 그리고 한 번만 알린다
    if(!f){sh=null;if(!window.__badFrame){window.__badFrame=1;console.warn('hero frame missing',fi,a2,P.ss2,P.sset,P.bA,P.sjSt,P.runT,P.satk)}fi=0;a2=false;useB=false;lk='';f=HF[0];P.satk=0;P.bA=null;P.ss2=0}
    const k=sh?sheetK(sh,fi):a2?K2*(f[5]||1)*a2RowK(fi):.47,lift=P.sj>0?Math.sin((1-P.sj/(P.sjMax||.6))*Math.PI)*(P.sjSt===3?10:P.sjSt===2?30:22):jump;ctx.translate(0,-lift);ctx.scale(side,1);WPN_K=k;
    // v120 움직임 덧입히기 (사용자 2026-10-16): 공격 예비는 뒤로, 휘두름·멈춤은 앞으로 밀고 기울임, 달리기는 앞으로 기울임, 피격은 뒤로 밀림. 발을 축으로 돈다
    {let mdx=0,mrot=0;if(P.satk>0){const u=1-P.satk/P.satkMax;if(u<.3){mdx=-3;mrot=-.05}else if(u<.85){mdx=5;mrot=.05}}else if(P.runT>0)mrot=.07;
      if(P.hit>0){const h=Math.min(1,P.hit/.2);mdx-=5*h;mrot-=.07*h}if(mdx||mrot){ctx.translate(mdx,0);ctx.rotate(mrot)}}
    const gb=heroGarb();
    // v123 핸드오프 시트 장: 발 기준점이 캔버스에 박혀 있어 자리 보정 없이 그린다. 무기는 소켓이 확정될 때까지 안 그린다
    if(sh){if(dc==='검'||dc==='도'){const[ox,oy]=sheetXY(sh,fi,0,0,k);ctx.save();ctx.translate(ox,oy);ctx.scale(k,k);drawSheath(dc,...(SHEATH_AT[sh]||SHEATH_AT.wuxia),flash);ctx.restore()}
      drawSheet(sh,fi,k,flash,gb&&gb.sh&&gb.sh[sh]);if(gb&&gb.mark&&!flash)drawRankMark(gb.mark,side,sheetTop(sh,fi,k)-10);
      // v124: 소켓이 있는 장(검·도·창·봉 공격)은 손 자리에 코드 무기를 얹는다
      const wl=dc!=='권'&&dc!=='각'&&dc!=='암'&&dc!=='단'?sheetWeaponLine(sh,fi,dc):null;
      if(wl&&ANIM.heroHandWpn){const[ox,oy]=sheetXY(sh,fi,0,0,k);ctx.save();ctx.translate(ox,oy);ctx.scale(k,k);drawWeapon(dc,wl,dc==='창'||dc==='봉'?'p':'b',flash);ctx.restore()}
      if(P.palm>0){const a=P.palm/.35,g=ctx.createRadialGradient(26,-44,1,26,-44,20);g.addColorStop(0,`rgba(190,220,255,${a})`);g.addColorStop(1,'rgba(80,130,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(26,-44,20,0,7);ctx.fill()}
      ctx.restore();WPN_K=.47;return}
    const img=flash?(a2?HERO2:useB?HBODY:HERO):a2?(gb&&gb.h2?gb.h2:HERO2):useB?(gb?gb.body:HBODY):(gb?gb.hero:HERO);
    const pc=lk==='p'&&a2?POLEI[dc].cut[fi]:null,fw=pc?pc[0]:f[1];
    // v125 칼집: 검객 원본 시트가 아닌 장(몸통·두 번째 시트)에서 검·도를 들었으면 허리 뒤에 걸린 칼집을 몸보다 먼저
    if((a2||useB)&&(dc==='검'||dc==='도')){ctx.save();ctx.translate(-f[3]*k,-f[2]*k+3-f[4]*k);ctx.scale(k,k);drawSheath(dc,f[3]-6,f[2]*.55,flash);ctx.restore()}
    drawPart(img,flash,f[0],0,fw,f[2],-f[3]*k,-f[2]*k+3-f[4]*k,fw*k,f[2]*k);
    // 직위 표식 (망토 대신, 사용자 결정 2026-10-13): 머리 위 문장 + 점
    if(gb&&gb.mark&&!flash)drawRankMark(gb.mark,side,-f[2]*k+3-f[4]*k-10);
    if(!ANIM.heroHandWpn){}   // v167 사용자: 따로 그려 손에 붙이던 무기는 일단 뺀다 (시트 그림의 무기만)
    else if(lk==='p'){ctx.save();ctx.translate(-f[3]*k,-f[2]*k+3-f[4]*k);ctx.scale(k,k);if(pc)drawPole(dc,[pc[1],pc[2]],-1,flash);else if(WL.s[fi])drawPole(dc,[WL.s[fi][0],WL.s[fi][1]],1,flash);ctx.restore()}
    else if(lk){ctx.save();ctx.translate(-f[3]*k,-f[2]*k+3-f[4]*k);ctx.scale(k,k);drawWeapon(dc,lk==='b'?WL.b[fi]:WL.s[fi],lk,flash);ctx.restore()}
    if(P.palm>0){const a=P.palm/.35,g=ctx.createRadialGradient(26,-44,1,26,-44,20);g.addColorStop(0,`rgba(190,220,255,${a})`);g.addColorStop(1,'rgba(80,130,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(26,-44,20,0,7);ctx.fill()}
    ctx.restore();WPN_K=.47;return}
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
  let st=null,lean=mv?.15:0,twoH=false,bArm=null,guardPose=false;
  // 회복: 휘두른 뒤 0.22초 동안 팔이 낮은 마무리 자세에서 돌아온다 (r_anim.js)
  const rec=!isP&&!attacking&&(e.rec||0)>0?e.rec/.22:0;
  if(rec){if(mode==='swing'){ang=-.45*rec+ang*(1-rec);lean=.3*rec}else if(mode==='thrust'){ang=1.5*rec+ang*(1-rec);reach=5*rec;lean=.2*rec}else if(mode==='punch'){ang=1.55*rec+ang*(1-rec);reach=3*rec;lean=.15*rec}else lean=-.1*rec}
  else if(!mv&&!attacking)lean=.04*Math.sin(time*.7+(e.bob||0));   // 가만히 서면 무게중심이 천천히 옮겨 간다
  if(attacking){
    if(mode==='swing'){if(sw>0){const w0=prog<.22;ang=w0?2.5+prog/.22*.8:3.3-(prog-.22)/.78*3.7;lean=w0?-.14:.34*Math.sin(Math.min(1,(prog-.22)/.45)*Math.PI/2)}
      else{ang=2.7+Math.sin(time*20)*.08;lean=-.12}
      st=[[.66,.02],[-.62,-.55]];twoH=isP||(e.d&&e.d.boss)}
    else if(mode==='thrust'){st=[[.95,.22],[-.88,-.78]];lean=.32;twoH=true;if(wind&&sw<=0){ang=.7;reach=-5;lean=-.12}}   // 예비: 창을 뒤로 당긴다
    else if(mode==='punch'){st=[[.78,.08],[-.72,-.62]];lean=.24;bArm=-.75;if(wind&&sw<=0){ang=.5;reach=-4;lean=-.1;bArm=-.3}}   // 예비: 주먹을 허리로
    else{st=[[kick*1.95,kick*1.8],[-.12,-.18]];lean=-.32*kick;bArm=1.3;if(wind&&sw<=0){lean=-.18;st=[[.3,.1],[-.5,-.4]]}}
  }else if(isP&&!mv&&mobs.some(o=>o.hp>0&&o.aggro&&dist(o,P)<3.5)){guardPose=true;
    st=[[.42,0],[-.38,-.36]];ang=mode==='thrust'?1.25:mode==='swing'?1.1:1.35;lean=.05;
    if(mode==='punch'||mode==='kick')bArm=1.15;else twoH=true}
  // 피격: 맞은 쪽 반대로 젖혀지고 머리가 들린다. 치명·강타는 더 크게
  const hitT=isP?P.hit/.2:e.hit/.12;if(hitT>0)lean+=-.32*Math.sin(Math.min(1,hitT)*Math.PI/2)*(e.hitK||1);
  // 창·봉 (v119, 사용자 요청: 양손으로 비스듬히 길게 잡는 자세): 날 끝이 앞·위를 향하고 뒷손은 아래. 찌르기는 앞으로 미끄러지고, 봉 휘두르기는 머리 위에서 앞·아래로 쓸어 내린다
  const pole=pal.weapon==='spear'||pal.weapon==='staff';let th=0,gp=null;
  if(pole){th=mv?1.02+s1*.1:.92+Math.sin(time*.7+(e.bob||0))*.03;gp=[3,-36+(mv?0:Math.sin(time*2.2+(e.bob||0))*.3)];
    if(rec)th=(mode==='thrust'?1.4:1.75)*rec+th*(1-rec);
    else if(attacking){if(mode==='thrust'){if(sw>0){th=1.52;gp=[1+reach*1.1,-39]}else{th=1.38;gp=[-4,-38]}}
      else if(sw>0){const w0=prog<.22;th=w0?-.4+prog/.22*.25:-.15+(prog-.22)/.78*2.15;gp=[4,-40]}else{th=-.35+Math.sin(time*20)*.05;gp=[2,-41]}}
    else if(guardPose){th=1.22;gp=[4,-38]}}
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
    if(pole){const t=[Math.sin(th),-Math.cos(th)],bh=[gp[0]-t[0]*9,gp[1]-t[1]*9],el=[(sh2[0]+bh[0])/2-2,(sh2[1]+bh[1])/2+4];
      seg([sh2,el,bh],6,Fc(pal.robeB));ctx.fillStyle=pal.skin[1];ctx.beginPath();ctx.arc(bh[0],bh[1],2.2,0,7);ctx.fill();return}
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
  if(pole){withLean(()=>{const t=[Math.sin(th),-Math.cos(th)],fh=[gp[0]+t[0]*9,gp[1]+t[1]*9],sh=[4,-44],el=[(sh[0]+fh[0])/2+1,(sh[1]+fh[1])/2+4];
      ctx.save();ctx.translate(gp[0],gp[1]);ctx.rotate(th+Math.PI);if(!(isP&&P.palm>0))polearm(pal.weapon);ctx.restore();
      seg([sh,el,fh],6,Fc(pal.robe[0]));seg([joint(fh,0,-1.2),joint(fh,0,.2)],7.4,Fc(pal.trim));ctx.fillStyle=pal.skin[0];ctx.beginPath();ctx.arc(fh[0],fh[1],2.4,0,7);ctx.fill()})}
  else withLean(()=>{ctx.save();ctx.translate(4+reach,-44);ctx.rotate(-ang);
    seg([[0,0],[0,7],[0,12]],6,Fc(pal.robe[0]));seg([[0,11.2],[0,12.4]],7.6,Fc(pal.trim));
    ctx.fillStyle=pal.skin[0];ctx.beginPath();ctx.arc(0,13.5,2.4,0,7);ctx.fill();
    if(!(isP&&P.palm>0))weapon(pal.weapon);
    ctx.restore()});
  if(isP&&P.palm>0){const k=P.palm/.35;const g=ctx.createRadialGradient(16,-40,1,16,-40,18);g.addColorStop(0,`rgba(190,220,255,${k})`);g.addColorStop(1,'rgba(80,130,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(16,-40,18,0,7);ctx.fill()}
  ctx.restore();
  if(!isP&&e.stun>0&&!e.npc){for(let n=0;n<3;n++){const a=time*6+n*2.1;ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(p.x+Math.cos(a)*10,p.y-(sc>1.2?88:68)+Math.sin(a)*3,2,0,7);ctx.fill()}}
  if(!isP&&!e.npc&&!e.dead){const w=30*sc,y=p.y-(sc>1.2?94:74);
    ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(p.x-w/2-1,y-1,w+2,5);ctx.fillStyle='#c0261b';ctx.fillRect(p.x-w/2,y,w*Math.max(0,e.hp/e.maxHp),3);
    if(e.d.boss||e.duel||e.ally||e.d.fac||P.target===e){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(e.name,p.x+1,y-4);ctx.fillStyle=e.d.boss?'#ff9a6a':e.ally?'#a6d47f':e.d.fac?(peaceful(e)?(typeof repStE==='function'&&repStE(e)!==2?REP.col[repStE(e)]:'#9cc8f0'):'#f0a080'):'#f0e4c8';ctx.fillText(e.name,p.x,y-5);if(e.sect&&LOOK[e.sect]){const tw=ctx.measureText(e.name).width;drawEmblem(ctx,e.sect,p.x-tw/2-8,y-9,12)}}}
  if(e.npc&&!e.dead){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(e.n,p.x+1,p.y-71);ctx.fillStyle='#e8c66e';ctx.fillText(e.n,p.x,p.y-72)}
}

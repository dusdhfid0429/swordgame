// ================= 출입구 상징물 (v218, 사용자 2026-11-01) =================
// 글자 이정표만으로는 어디로 가는 길인지 알아보기 어렵다고 해서, 출입구 자리에 그 목적지를 상징하는 것을 코드로 그린다.
//  성도·도시·개봉 = 성벽과 문루, 고을 = 나무 목책 문, 산 = 봉우리(눈산·모래산·붉은 산·마교 산 색이 다름),
//  문파 본산 = 산문 패루(문파 지붕 색, 마교는 검은 기둥·붉은 지붕), 다른 성(省) 경계 = 돌 패방,
//  명소 = 종류대로(관문·석탑·정자·기암·포구 배·밀림 초가), 그 밖의 맵(무관·맹 총단 등) = 작은 전각.
// 글자는 그 위에 작게 남긴다. 건물 문(door)·기연 동굴은 예전대로.
// 그림은 종류·색마다 한 번 작은 캔버스에 그려 두고 찍는다 (휴대폰 발열, v175).
const PORTAL_RES=2.5,PORTAL_CACHE={};
const PT_MT={peak:['#7a8270','#545b4e','#3e4a36'],snow:['#a6b2be','#6e7a88','#e8eef4'],sand:['#cfa96c','#9c7a48','#b89058'],canyon:['#b05a3c','#7a3a26','#8a4a30'],dark:['#463e4c','#26202c','#5a1a1a']};
function portalKind(g){const R=REGIONS[g.to];
  if(g.to==='gaebong')return{k:'castle',big:1};
  if(!R)return{k:'border'};
  if(R.lm){const m=R.lm;
    if(m.t==='m')return{k:'mount',v:PT_MT[R.theme]?R.theme:'peak'};
    if(m.t==='c')return{k:'castle'};
    if(m.town)return{k:'town'};
    const st=typeof lmStyle==='function'?lmStyle(m.n):null,tag=st&&st.tag;
    if(tag==='관문')return{k:'castle',v:'pass'};
    if(tag==='기암')return{k:'rocks'};
    if(tag==='포구')return{k:'port'};
    if(tag==='밀림 마을')return{k:'hut'};
    if(st&&st.kind==='temple')return{k:'pagoda'};
    return{k:'pavilion'}}
  if(/^pv_/.test(g.to))return{k:'border'};
  if(R.city)return{k:'castle'};
  const sid=R.hq||(R.stage&&R.stage.s&&R.stage.s.id);
  if(sid||g.portal){const st=sid&&GD.SECT_STYLE[sid],mg=!!(R.stage&&R.stage.mg)||sid==='cheonma';return{k:'sect',v:mg?'mg':st&&st.roof||'gray'}}
  return{k:'hall'}}
// ---- 그리기 도우미 (앞에서 본 모습 + 오른쪽 옆면을 조금 어둡게) ----
function ptRoof(c,cx,y,w,h,P){const L=cx-w/2,Rr=cx+w/2;
  c.beginPath();c.moveTo(L-5,y+h-5);c.quadraticCurveTo(L+2,y+h+1,L+w*.16,y+h);c.lineTo(Rr-w*.16,y+h);c.quadraticCurveTo(Rr-2,y+h+1,Rr+5,y+h-5);
  c.lineTo(Rr-w*.2,y);c.lineTo(L+w*.2,y);c.closePath();c.fillStyle=P[0];c.fill();
  c.save();c.clip();c.strokeStyle=P[1];c.lineWidth=1.2;for(let x=L-4;x<Rr+5;x+=4.5){c.beginPath();c.moveTo(cx+(x-cx)*.62,y);c.lineTo(x,y+h+2);c.stroke()}
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(L-6,y+h-2.5,w+12,3);c.restore();
  c.strokeStyle=P[3];c.lineWidth=1.5;c.beginPath();c.moveTo(L-5,y+h-5);c.quadraticCurveTo(L+2,y+h+1,L+w*.16,y+h);c.lineTo(Rr-w*.16,y+h);c.quadraticCurveTo(Rr-2,y+h+1,Rr+5,y+h-5);c.stroke();
  c.strokeStyle=P[1];c.lineWidth=3;c.beginPath();c.moveTo(L+w*.2-3,y-2);c.lineTo(L+w*.2,y);c.lineTo(Rr-w*.2,y);c.lineTo(Rr-w*.2+3,y-2);c.stroke()}
function ptBox(c,x,y,w,h,f,s){c.fillStyle=f;c.fillRect(x,y,w,h);if(s){c.strokeStyle=s;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1)}}
function ptSide(c,x,y,w,h,d,f){c.fillStyle=f;c.beginPath();c.moveTo(x,y+h);c.lineTo(x+d,y+h-d*.6);c.lineTo(x+d,y-d*.6);c.lineTo(x,y);c.closePath();c.fill()}
function ptBricks(c,x,y,w,h,col){c.strokeStyle=col;c.lineWidth=.8;for(let j=y+6,r=0;j<y+h;j+=6,r++){c.beginPath();c.moveTo(x,j);c.lineTo(x+w,j);c.stroke();
  for(let i=x+(r%2?6:0);i<x+w;i+=12){c.beginPath();c.moveTo(i,j-6);c.lineTo(i,j);c.stroke()}}}
function ptArch(c,cx,base,w,h,col){c.fillStyle=col;c.beginPath();c.moveTo(cx-w/2,base);c.lineTo(cx-w/2,base-h+w/2);c.arc(cx,base-h+w/2,w/2,Math.PI,0);c.lineTo(cx+w/2,base);c.closePath();c.fill()}
function ptPine(c,x,y,s,col){c.fillStyle='#3a2a1a';c.fillRect(x-1,y-6*s,2,6*s);c.fillStyle=col||'#2c4a32';for(let k=0;k<3;k++){const w=(10-k*2.6)*s,t=y-5*s-k*5*s;c.beginPath();c.moveTo(x-w,t);c.lineTo(x,t-8*s);c.lineTo(x+w,t);c.closePath();c.fill()}}
const PT_WOOD=['#7a2a1c','#4e1810','#9a3a24'],PT_STONE=['#7e7b74','#5a5853','#9a978e','#45433f'];
// ---- 종류별 그림. 기준점 (0,0) = 땅의 빛 고리 가운데. 돌려주는 값 = 그림 꼭대기 높이 ----
const PT_DRAW={
  castle(c,o){const pass=o.v==='pass',S=pass?['#8a6a56','#5e4636','#a8846c','#3e2e24']:PT_STONE,big=o.big,W=big?50:44,Hw=big?36:32;
    ptSide(c,W,-Hw,10,Hw,8,S[3]);ptBox(c,-W,-Hw,W*2,Hw,S[0]);ptBricks(c,-W,-Hw,W*2,Hw,S[1]);
    c.fillStyle=S[0];for(let x=-W;x<W;x+=9)c.fillRect(x,-Hw-5,5,5);c.fillStyle=S[2];c.fillRect(-W,-Hw,W*2,2);
    ptArch(c,0,0,20,26,'#1a120c');c.fillStyle='rgba(255,200,120,.18)';ptArch(c,0,0,14,20,'rgba(255,200,120,.16)');
    c.fillStyle='#5a2a16';c.fillRect(-10,-12,4,12);c.fillRect(6,-12,4,12);
    // 문루
    const B=-Hw-1;ptBox(c,-30,B-4,60,4,S[2]);
    for(const x of[-24,-12,10,22])ptBox(c,x,B-20,3,16,PT_WOOD[0]);ptBox(c,-24,B-20,49,3,PT_WOOD[1]);
    c.fillStyle='rgba(30,16,10,.75)';c.fillRect(-9,B-16,18,12);c.fillStyle='rgba(255,190,110,.55)';c.fillRect(-7,B-14,14,8);
    ptRoof(c,0,B-36,72,16,GD.ROOF_PAL.gray);
    if(pass)return-B+36;
    ptBox(c,-14,B-46,28,10,PT_WOOD[0]);c.fillStyle='rgba(255,190,110,.5)';c.fillRect(-9,B-44,18,6);
    ptRoof(c,0,B-60,44,14,GD.ROOF_PAL.gray);
    // 깃발
    c.strokeStyle='#2a1a10';c.lineWidth=1.5;for(const x of[-W+4,W-4]){c.beginPath();c.moveTo(x,-Hw-5);c.lineTo(x,-Hw-28);c.stroke();c.fillStyle='#a82a1e';c.beginPath();c.moveTo(x,-Hw-28);c.lineTo(x+(x<0?-12:12),-Hw-24);c.lineTo(x,-Hw-19);c.closePath();c.fill()}
    return-B+60},
  town(c){for(let x=-40;x<=40;x+=6){if(Math.abs(x)<16)continue;const h=18+(x*7%5);ptBox(c,x-2,-h,5,h,'#6a4a2c');c.fillStyle='#8a6a40';c.beginPath();c.moveTo(x-2,-h);c.lineTo(x+.5,-h-4);c.lineTo(x+3,-h);c.fill()}
    c.fillStyle='#4a3420';c.fillRect(-40,-12,80,3);
    ptBox(c,-16,-44,5,44,'#5a3a20');ptBox(c,11,-44,5,44,'#5a3a20');ptBox(c,-20,-44,40,5,'#4a2e18');
    ptRoof(c,0,-58,48,12,GD.ROOF_PAL.brown);ptBox(c,-8,-40,16,7,'#2a1a10');c.fillStyle='#d8b060';c.fillRect(-6,-38,12,3);
    return 58},
  mount(c,o){const T=PT_MT[o.v]||PT_MT.peak,snow=o.v==='snow';
    const pk=(cx,top,w,col)=>{c.fillStyle=col[0];c.beginPath();c.moveTo(cx-w,-2);c.lineTo(cx-w*.25,top+10);c.lineTo(cx,top);c.lineTo(cx+w*.12,top+14);c.lineTo(cx+w,-2);c.closePath();c.fill();
      c.fillStyle=col[1];c.beginPath();c.moveTo(cx,top);c.lineTo(cx+w*.12,top+14);c.lineTo(cx+w,-2);c.lineTo(cx+w*.15,-2);c.closePath();c.fill();
      if(snow||o.v==='peak'||o.v==='dark'){c.fillStyle=snow?'#f2f6fa':o.v==='dark'?'#6a2424':'#c8ccc0';c.beginPath();c.moveTo(cx-w*.25*.45,top+10*.45);c.lineTo(cx,top);c.lineTo(cx+w*.12*.6,top+14*.6);c.lineTo(cx+w*.04,top+7);c.lineTo(cx-w*.05,top+11);c.closePath();c.fill()}};
    pk(4,-96,46,T);pk(-30,-62,30,[T[0],T[1]]);pk(36,-70,30,[T[0],T[1]]);
    c.fillStyle=o.v==='sand'?'rgba(120,90,50,.5)':'rgba(30,40,28,.45)';c.beginPath();c.ellipse(0,-2,58,7,0,Math.PI,0);c.fill();
    if(o.v!=='sand'&&o.v!=='canyon')for(const[x,s]of[[-44,1],[-34,.8],[40,.9],[48,.7]])ptPine(c,x,0,s,o.v==='dark'?'#2a2430':snow?'#2c4038':'#2c4a32');
    // 표석
    ptBox(c,-24,-22,10,20,'#8a877e','#4a4842');c.fillStyle='#3a3834';for(let j=-19;j<-6;j+=4)c.fillRect(-21,j,4,2);
    return 96},
  sect(c,o){const mg=o.v==='mg',RP=mg?['#3a1414','#200a0a','#4a1a18','#8a2a20']:GD.ROOF_PAL[o.v]||GD.ROOF_PAL.gray,Wd=mg?['#1c1416','#0c0808','#2a2024']:PT_WOOD;
    c.fillStyle='#6a665e';c.fillRect(-42,-3,84,4);
    for(const x of[-38,-16,13,35]){ptBox(c,x-2,-6,7,6,'#8a867c');ptBox(c,x,x===-16||x===13?-58:-44,3,x===-16||x===13?52:38,Wd[0])}
    ptBox(c,-38,-44,76,3,Wd[1]);ptBox(c,-16,-58,32,4,Wd[1]);ptBox(c,-16,-50,32,3,Wd[2]);
    c.fillStyle='#1a1410';c.fillRect(-9,-57,18,8);c.fillStyle=mg?'#c03a2a':'#d8b450';c.fillRect(-7,-55,14,4);
    ptRoof(c,-27,-56,30,10,RP);ptRoof(c,27,-56,30,10,RP);ptRoof(c,0,-74,46,14,RP);
    c.fillStyle=RP[3];c.beginPath();c.arc(0,-77,2.5,0,7);c.fill();
    return 78},
  border(c){ptBox(c,-30,-4,60,4,'#6a675f');
    for(const x of[-24,20]){ptBox(c,x-2,-8,8,4,PT_STONE[2]);ptBox(c,x,-48,4,40,PT_STONE[0],PT_STONE[3])}
    ptBox(c,-28,-50,56,5,PT_STONE[2],PT_STONE[3]);ptBox(c,-12,-45,24,7,PT_STONE[1]);c.fillStyle='#2a2824';c.fillRect(-9,-43,18,3);
    ptRoof(c,0,-62,64,12,GD.ROOF_PAL.gray);
    for(const x of[-36,36]){ptBox(c,x-3,-14,6,14,PT_STONE[0]);ptBox(c,x-5,-18,10,4,PT_STONE[2]);c.fillStyle='rgba(255,190,110,.6)';c.fillRect(x-2,-12,4,4)}
    return 62},
  pagoda(c){const tiers=5;let y=0,w=30;ptBox(c,-20,-4,40,4,'#6a665e');
    for(let i=0;i<tiers;i++){const h=i?11:16;ptSide(c,w/2,y-h-4,4,h,4,'#5e4c38');ptBox(c,-w/2,y-h-4,w,h,'#a08a6a');c.fillStyle='#2a1e14';c.fillRect(-3,y-h,6,h-6);
      y-=h+4;ptRoof(c,0,y-6,w+14,8,GD.ROOF_PAL.gray);y-=6;w-=4}
    c.strokeStyle='#c8a050';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.lineTo(0,y-12);c.stroke();for(let k=0;k<3;k++){c.fillStyle='#c8a050';c.beginPath();c.arc(0,y-3-k*3.5,2.2-k*.4,0,7);c.fill()}
    return -y+12},
  pavilion(c){c.fillStyle='#6a665e';c.beginPath();c.ellipse(0,-2,30,8,0,0,7);c.fill();ptBox(c,-28,-6,56,5,'#8a867c');
    for(const x of[-22,-8,6,19])ptBox(c,x,-38,3,32,PT_WOOD[0]);ptBox(c,-24,-38,48,3,PT_WOOD[1]);
    c.strokeStyle=PT_WOOD[2];c.lineWidth=1;for(let x=-22;x<20;x+=3){c.beginPath();c.moveTo(x,-16);c.lineTo(x,-10);c.stroke()}c.fillStyle=PT_WOOD[1];c.fillRect(-24,-17,48,2);
    ptRoof(c,0,-60,62,22,GD.ROOF_PAL.green);c.fillStyle='#c8a050';c.beginPath();c.moveTo(0,-70);c.lineTo(3,-60);c.lineTo(-3,-60);c.closePath();c.fill();
    return 70},
  rocks(c){const sp=(x,h,w,a,b)=>{c.fillStyle=a;c.beginPath();c.moveTo(x-w,0);c.quadraticCurveTo(x-w*.9,-h*.6,x-w*.3,-h);c.lineTo(x+w*.25,-h+4);c.quadraticCurveTo(x+w,-h*.5,x+w,0);c.closePath();c.fill();
      c.fillStyle=b;c.beginPath();c.moveTo(x+w*.1,-h+3);c.lineTo(x+w*.25,-h+4);c.quadraticCurveTo(x+w,-h*.5,x+w,0);c.lineTo(x+w*.2,0);c.closePath();c.fill();
      c.fillStyle='#3e6a3a';c.beginPath();c.ellipse(x-w*.1,-h+2,w*.55,4,0,0,7);c.fill()};
    sp(-26,56,10,'#8a8a7e','#5e5e54');sp(22,66,11,'#8a8a7e','#5e5e54');sp(-2,92,13,'#9a9a8c','#66665a');sp(36,38,8,'#7e7e72','#56564c');
    ptPine(c,-40,0,.8);return 92},
  port(c){c.strokeStyle='#5a3a20';c.lineWidth=3;for(const x of[-38,-24,24,38]){c.beginPath();c.moveTo(x,0);c.lineTo(x,-12);c.stroke()}
    c.fillStyle='#6a4a2c';c.fillRect(-42,-12,26,4);
    c.fillStyle='#4a2e18';c.beginPath();c.moveTo(-14,-10);c.lineTo(34,-10);c.lineTo(28,0);c.lineTo(-8,0);c.closePath();c.fill();c.fillStyle='#6a4a2c';c.fillRect(-12,-12,44,3);
    c.strokeStyle='#3a2414';c.lineWidth=2.5;c.beginPath();c.moveTo(10,-12);c.lineTo(10,-72);c.stroke();
    c.fillStyle='#d8c8a0';c.beginPath();c.moveTo(12,-70);c.quadraticCurveTo(30,-50,34,-20);c.lineTo(12,-18);c.closePath();c.fill();
    c.strokeStyle='#a89870';c.lineWidth=1;for(let j=-62;j<-20;j+=9){c.beginPath();c.moveTo(12,j);c.lineTo(12+(j+72)*.42,j);c.stroke()}
    c.fillStyle='#a82a1e';c.beginPath();c.moveTo(10,-72);c.lineTo(22,-69);c.lineTo(10,-66);c.fill();
    ptBox(c,-34,-30,6,18,'#7a5a3a');c.fillStyle='rgba(255,190,110,.75)';c.fillRect(-34,-36,6,6);return 74},
  hut(c){ptBox(c,-24,-24,48,24,'#7a5a34','#4a3420');ptSide(c,24,-24,8,24,6,'#5a4024');
    c.strokeStyle='#5a4024';c.lineWidth=1;for(let x=-20;x<24;x+=5){c.beginPath();c.moveTo(x,-24);c.lineTo(x,0);c.stroke()}ptBox(c,-6,-16,12,16,'#2a1a10');
    c.fillStyle='#b09050';c.beginPath();c.moveTo(-34,-20);c.lineTo(0,-58);c.lineTo(38,-22);c.closePath();c.fill();
    c.strokeStyle='#8a6a34';for(let k=-30;k<36;k+=5){c.beginPath();c.moveTo(k,-20);c.lineTo(k*.3,-50);c.stroke()}
    for(const[x,s]of[[-42,1],[44,.9]]){c.strokeStyle='#4a3a1a';c.lineWidth=2;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+3,-20,x,-38*s);c.stroke();
      c.fillStyle='#3e7a3a';for(const a of[-1,1]){c.beginPath();c.ellipse(x+a*8,-36*s,10,3,a*.5,0,7);c.fill()}}
    return 58},
  hall(c,o){const RP=GD.ROOF_PAL[o.v]||GD.ROOF_PAL.gray;ptBox(c,-32,-6,64,6,'#8a867c');
    ptSide(c,28,-30,6,24,5,'#3a1a10');ptBox(c,-28,-30,56,24,'#5a3a26');
    for(const x of[-28,-12,9,25])ptBox(c,x,-30,3,24,PT_WOOD[0]);c.fillStyle='rgba(255,190,110,.5)';c.fillRect(-9,-26,18,14);c.fillStyle='#2a1a10';c.fillRect(-1,-26,2,20);
    ptRoof(c,0,-50,74,20,RP);return 52}};
// 한 번 그려 둔 그림 (종류+색). 크기는 여유 있게 잡는다
function portalSprite(o){const key=o.k+':'+(o.v||'')+(o.big?':b':'');let s=PORTAL_CACHE[key];if(s)return s;
  const W=150,H=150,cv=document.createElement('canvas');cv.width=W*PORTAL_RES;cv.height=H*PORTAL_RES;const c=cv.getContext('2d');
  c.scale(PORTAL_RES,PORTAL_RES);c.translate(W/2,H-12);
  // 바닥 그림자
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(6,-1,54,10,0,0,7);c.fill();
  const top=(PT_DRAW[o.k]||PT_DRAW.hall)(c,o)||60;
  return PORTAL_CACHE[key]={cv,W,H,top}}
const PORTAL_K=1;   // 화면에 찍는 배율 (주인공 키와 맞춤)
function drawPortal(g){const p=toScreen(g.x,g.y),o=g._pk||(g._pk=portalKind(g)),s=portalSprite(o),k=PORTAL_K;
  // 주인공이 그림 뒤(북쪽)에 서 있으면 비쳐 보이게
  let a=1;if(P){const q=toScreen(P.x,P.y);if(P.x+P.y<g.x+g.y&&Math.abs(q.x-p.x)<s.W*k*.4&&q.y<p.y&&q.y>p.y-s.top*k-10)a=.42}
  ctx.save();ctx.globalAlpha=a;ctx.drawImage(s.cv,p.x-s.W/2*k,p.y-(s.H-12)*k,s.W*k,s.H*k);ctx.restore();
  // 이름은 작게, 꼭대기 위에 (주인공이 가리면 머리 위로)
  const ty=portalTagY(g);ctx.font='11px "Gowun Dodum",sans-serif';ctx.textAlign='center';const tw=ctx.measureText(g.label).width;
  ctx.fillStyle='rgba(10,8,6,.55)';ctx.fillRect(p.x-tw/2-4,ty-11,tw+8,15);ctx.fillStyle='#ffe2a0';ctx.fillText(g.label,p.x,ty)}
// 출입구 이름표 글자 바닥 y (화면). 사용자 2026-11-04: 이름표가 곁에 선 주인공을 덮지 않게, 겹치면 주인공 머리 위로 올린다.
// 무관 길잡이 화살표(acadMarks)도 이 자리 바로 위에 찍어 이름이 두 번 겹쳐 보이지 않게 한다
function portalTagY(g){const p=toScreen(g.x,g.y);let ty;
  if(g.door)ty=p.y-14;else{const s=portalSprite(g._pk||(g._pk=portalKind(g)));ty=p.y-s.top*PORTAL_K-8}
  if(P&&!P.dead){const q=toScreen(P.x,P.y),hh=66*Math.min(1,heroAgeK());ctx.font='11px "Gowun Dodum",sans-serif';const tw=ctx.measureText(g.label||'').width;
    if(Math.abs(q.x-p.x)<tw/2+20&&ty-12<q.y+4&&ty+4>q.y-hh)ty=q.y-hh-6}
  return ty}

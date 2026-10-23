// ================= 계절·날씨별 지형 모습 (사용자 2026-10-23 v173) =================
// "계절에 따라 나무나 바위 도로들 변경해줄 수 있어? 겨울이니깐 눈 덮인 소나무나 바위 관도 등 계절에 맞춰 날씨에 맞춰"
// - 눈은 날씨가 쌓는다: '눈'이 오면 G.snow가 차오르고, 그치면 겨울엔 천천히·다른 계절엔 빨리 녹는다. 비는 G.wet(젖은 땅·물웅덩이)
// - 나무: 봄 새잎·꽃, 가을 단풍, 겨울 앙상한 가지. 나무마다 바뀌는 때가 달라(칸마다 문턱) 한 그루씩 물든다. 소나무·대나무는 늘 푸르다
// - 눈 겹: 나무·소나무·바위·봉우리·석탑 그림의 윗면에 눈을 얹은 그림을 처음 쓸 때 만들어 두고, 쌓인 만큼 투명도로 덧그린다
// - 바닥: 구운 바닥 그림 위에 계절 겹(눈·낙엽·봄꽃)을 반 해상도로 한 번 굽고 투명도로 덧그린다. 관도엔 바퀴 자국, 물가엔 살얼음
// 바닥을 굽는 함수(bakeHQ·bakeGaebong·bakeSungsan)는 그림에 c.sm(칸↔그림 좌표)을 달아 둔다. 전각·동굴 안은 바뀌지 않는다
const SEA=GD.SEA;
const ramp=(p,a,b)=>clamp((p-a)/(b-a),0,1);
// 지금 계절이 얼마나 들었나 (0~1). bare 앙상함, fall 단풍, bloom 봄, snow 쌓인 눈, wet 젖음, leafG 바닥 낙엽
let SM=null,SL_BUDGET=0;
function seasonMix(){const R=REGION();if(!R||R.in||R.hall||R.cave)return null;
  const s=frac(G.cal)*4,q=Math.floor(s)%4,p=s-Math.floor(s),T=SEA.region[R.theme]||{};
  let snow=(G.snow||0)*(T.mul??1);if(T.min)snow=Math.max(snow,T.min);
  const m={bare:0,fall:0,bloom:0,leafG:0,snow,wet:G.wet||0};
  if(q===0){m.bare=1-ramp(p,0,.25);m.bloom=ramp(p,.05,.25)*(1-ramp(p,.8,1))}
  else if(q===2){m.fall=ramp(p,0,.3);m.bare=ramp(p,.75,1);m.leafG=ramp(p,.1,.4)}
  else if(q===3){m.bare=1;m.leafG=1-ramp(p,0,.3)}
  m.tint=Math.min(ramp(p,0,.08),1-ramp(p,.92,1));   // 화면 색조도 계절 머리·끝에서 서서히 들고 빠진다
  return m}
hook('tick',dt=>{const w=G.weather,win=season()==='겨울';
  G.snow=w==='눈'?Math.min(1,(G.snow||0)+dt/SEA.snowIn):Math.max(0,(G.snow||0)-dt/(win?SEA.snowOutW:SEA.snowOut));
  G.wet=w==='비'?Math.min(1,(G.wet||0)+dt/SEA.wetIn):Math.max(0,(G.wet||0)-dt*(w==='폭염'?3:1)/SEA.wetOut)});

// ---------- 나무·바위 그림 ----------
const SEA_SPR=new WeakMap();
const seaCache=(base,k,mk)=>{let o=SEA_SPR.get(base);if(!o)SEA_SPR.set(base,o={});return o[k]||(o[k]=mk())};
// 앙상한 가지 (mkTree와 같은 크기·줄기 자리라 경공 높이·가림이 그대로다)
function mkBare(seed){
  const c=document.createElement('canvas');c.width=120;c.height=150;const g=c.getContext('2d'),r=rng(seed);
  g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.ellipse(60,138,30,10,0,0,7);g.fill();
  const tg=g.createLinearGradient(52,0,68,0);tg.addColorStop(0,'#7a5e44');tg.addColorStop(1,'#33251a');
  g.fillStyle=tg;g.beginPath();g.moveTo(52,140);g.lineTo(56,74);g.lineTo(64,74);g.lineTo(69,140);g.closePath();g.fill();g.strokeStyle='#1e140c';g.lineWidth=1;g.stroke();
  g.lineCap='round';
  const br=(x,y,a,l,w,d)=>{const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l,mx=(x+x2)/2+(r()-.5)*l*.3,my=(y+y2)/2+(r()-.5)*l*.2;
    g.strokeStyle=d>2?'#3e2c1e':'#4a3626';g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(mx,my,x2,y2);g.stroke();
    if(d<=0||y2<6)return;const n=d>2?3:2;for(let q=0;q<n;q++)br(x2,y2,a+(q-(n-1)/2)*(.5+r()*.35)+(r()-.5)*.3,l*(.62+r()*.16),Math.max(.8,w*.62),d-1)};
  br(60,78,-Math.PI/2+(r()-.5)*.2,26,5,4);br(58,92,-Math.PI/2-.7,20,3.4,3);br(63,96,-Math.PI/2+.75,20,3.4,3);
  // 잔가지 끝의 흐린 덤불 (겨울 나무가 너무 휑하지 않게)
  for(let q=0;q<160;q++){const a=r()*Math.PI*2,d=Math.sqrt(r()),x=60+Math.cos(a)*d*44,y=60+Math.sin(a)*d*34;g.strokeStyle=`rgba(${60+r()*20},${44+r()*14},${32},.35)`;g.lineWidth=.8;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*7,y-2-r()*5);g.stroke()}
  return c}
const BARE=[mkBare(11),mkBare(23),mkBare(47)];
// 색 바꾸기: 푸른 잎(색상 50~180도)만 고친다
function recolor(src,f){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
  const im=g.getImageData(0,0,c.width,c.height),d=im.data;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(d[i+3]<20)continue;
    const R=d[i]/255,Gr=d[i+1]/255,B=d[i+2]/255,mx=Math.max(R,Gr,B),mn=Math.min(R,Gr,B),l=(mx+mn)/2,dd=mx-mn;if(dd<.04)continue;
    const s=dd/(1-Math.abs(2*l-1)||1);let h=mx===R?((Gr-B)/dd)%6:mx===Gr?(B-R)/dd+2:(R-Gr)/dd+4;h=(h*60+360)%360;
    const o=f(h,s,l,x,y);if(!o)continue;const[H,S,L]=o,C=(1-Math.abs(2*L-1))*S,X=C*(1-Math.abs((H/60)%2-1)),m=L-C/2,k=Math.floor(H/60)%6;
    const[r1,g1,b1]=[[C,X,0],[X,C,0],[0,C,X],[0,X,C],[X,0,C],[C,0,X]][k];d[i]=(r1+m)*255;d[i+1]=(g1+m)*255;d[i+2]=(b1+m)*255}
  g.putImageData(im,0,0);return c}
const leafy=h=>h>48&&h<185;
// 단풍: 나무마다 붉은·주황·노란 빛 중 하나가 주가 되고 덩어리마다 조금씩 다르다
function fallSpr(base,ob,k){return seaCache(base,'fall',()=>{const F=SEA.fall,band=F[k%F.length],sd=k*17+3;
  if(ob==='bamboo')return recolor(base,(h,s,l)=>leafy(h)?[h-28,s*.8,l*1.04]:null);
  if(ob==='maple')return recolor(base,(h,s,l,x,y)=>h<60||h>330?[(h+360-6)%360,Math.min(1,s*1.35+.1),Math.min(.62,l*1.12)]:null);
  return recolor(base,(h,s,l,x,y)=>{if(!leafy(h))return null;const n=vn(x*.06+sd,y*.06);return[band[0]+n*(band[1]-band[0])+(n>.82?-10:0),Math.min(1,s*1.5+.18),Math.min(.6,l*1.12)]})})}
// 봄: 연둣빛 새잎, 첫 그림 나무는 살구꽃이 핀다
function bloomSpr(base,k){return seaCache(base,'bloom',()=>{const c=recolor(base,(h,s,l)=>leafy(h)?[h+10,Math.min(1,s*1.15),Math.min(.6,l*1.14)]:null);
  if(k%3)return c;const g=c.getContext('2d'),r=rng(500+k),im=g.getImageData(0,0,c.width,c.height).data;
  for(let q=0;q<130;q++){const x=10+r()*100,y=18+r()*92;if(im[((y|0)*c.width+(x|0))*4+3]<200)continue;g.fillStyle=r()<.6?'rgba(250,226,232,.95)':'rgba(240,180,200,.95)';g.beginPath();g.arc(x,y,1.2+r()*1.3,0,7);g.fill()}
  return c})}
// 눈 겹: 그림의 각 세로줄을 위에서부터 훑어, 위가 비어 있는 면(윗면)마다 두께만큼 눈을 얹는다. 오른쪽(그늘)은 푸르스름하게
function snowSpr(base,ob){return seaCache(base,'snow',()=>{const w=base.width,h=base.height,src=base.getContext('2d').getImageData(0,0,w,h).data,
  c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,th=SEA.thick[ob]||[2,4],sd=w*7+h;
  for(let x=0;x<w;x++){let air=9,dep=-1,tk=0;
    for(let y=0;y<h;y++){const a=src[(y*w+x)*4+3];if(a<120){air++;dep=-1;continue}
      if(air>=2){dep=0;tk=th[0]+Math.floor(vn(x*.25+sd,y*.08)*(th[1]-th[0]+1))}air=0;
      if(dep<0||dep>=tk){dep=-1;continue}
      const i=(y*w+x)*4,sh=x>w*.56?-16:0,v=(dep?236-dep*5:250)+sh;d[i]=v-6;d[i+1]=v-1;d[i+2]=Math.min(255,v+8);d[i+3]=dep===tk-1?150:255;dep++}}
  g.putImageData(im,0,0);return c})}
const SEA_SNOWY={tree:1,maple:1,plum:1,pine:1,bamboo:1,rock:1,spire:1,stupa:1};
// 칸 하나의 그림: {spr(크기·가림 기준), L(겹쳐 그릴 [그림, 투명도] 목록, 아래부터), snow(덧그릴 눈 그림), sa(눈 투명도)}
// 사용자 2026-10-23 "페이드인 페이드아웃 느낌으로": 나무마다 SEA.fade 폭만큼 천천히 옛 모습이 사라지고 새 모습이 떠오른다
// 잎이 지고 돋을 때는 앙상한 가지를 밑에 깔고 잎 그림의 투명도를, 단풍·새잎은 푸른 잎 위에 덧그린 투명도를 바꾼다
function seaSpr(ob,i,j){const set=SPRITES[ob],k=(i*7+j*3)%set.length,base=set[k];if(!SM)return{spr:base,L:[[base,1]]};
  const h=hash(i*13+5,j*7+3),w=SEA.fade,t=v=>{const x=clamp((v-h*(1-w))/w,0,1);return x*x*(3-2*x)},L=[];let spr=base,leaf=1;
  if(ob==='tree'||ob==='maple'){const b=t(SM.bare);if(b>0){spr=BARE[k%BARE.length];L.push([spr,1]);leaf=1-b}
    if(leaf>.01){L.push([base,leaf]);const f=t(SM.fall),s=ob==='tree'?t(SM.bloom):0;if(f>.01)L.push([fallSpr(base,ob,k),leaf*f]);if(s>.01)L.push([bloomSpr(base,k),leaf*s]);if(leaf>.5)spr=base}}
  else{L.push([base,1]);if(ob==='bamboo'){const f=t(SM.fall);if(f>.01)L.push([fallSpr(base,ob,k),f])}}
  return{spr,L,snow:SM.snow>.02&&SEA_SNOWY[ob]?snowSpr(spr,ob):null,sa:SM.snow}}

// ---------- 바닥 계절 겹 ----------
const SEA_TINT={snow:[236,241,248],fall:[158,116,48],bloom:[112,162,62]};
function mkSeaLayer(c,kind){const m=c.sm;if(!m)return null;
  const LS=SEA.res,lw=Math.ceil(c.width*LS),lh=Math.ceil(c.height*LS),L=document.createElement('canvas');L.width=lw;L.height=lh;
  const g=L.getContext('2d'),im=g.createImageData(lw,lh),d=im.data,x1=m.x0+m.C,y1=m.y0+m.CH,road=(x,y)=>{const t=tileG(x,y);return t===1||t===4},tc=SEA_TINT[kind];
  for(let ly=0;ly<lh;ly++)for(let lx=0;lx<lw;lx++){
    const px=(lx+.5)/LS/m.k+m.X0,py=(ly+.5)/LS/m.k+m.Y0,a=px/(TW/2),b=py/(TH/2),gx=(a+b)/2,gy=(b-a)/2;
    if(gx<m.x0||gy<m.y0||gx>=x1||gy>=y1||gx>=N||gy>=NH)continue;
    const hard=tileG(gx,gy),soft=hard===1||hard===3||hard===4||hard===5,t=soft?hard:tileG(gx+(vn(gx*2.3,gy*2.3)-.5)*.6,gy+(vn(gx*2.3+9,gy*2.3+4)-.5)*.6),n=fbm(gx*.8,gy*.8),f=vn(gx*3,gy*3);
    let al=0,R=tc[0],Gr=tc[1],B=tc[2];
    if(kind==='snow'){const sh=(n-.5)*22;R+=sh-4;Gr+=sh;B+=sh*.6+4;
      if(t===0||t===7||t===9)al=.62+.31*ramp(n,.22,.38);
      else if(t===1){const along=road(gx-1,gy)&&road(gx+1,gy)&&!(road(gx,gy-1)&&road(gx,gy+1)),ac=along?frac(gy):frac(gx),rut=Math.min(Math.abs(ac-.36),Math.abs(ac-.64));   // 관도: 다져진 눈 + 바퀴 자국
        if(rut<.05){al=.55;R=150;Gr=146;B=142}else al=.82+(hash(lx,ly*3)>.97?-.3:0)}
      else if(t===4)al=.5+.32*ramp(n,.36,.48);
      else if(t===3)al=frac(gx*4)<.1?.2:.72;
      else if(t===5)al=frac(gy*3)<.3?.48:.9;
      else if(t===6||t===10||t===11)al=.4+.44*ramp(f,.38,.52);
      else if(t===12)al=f*.5;
      else if(t===2){const shore=[[.3,0],[-.3,0],[0,.3],[0,-.3]].some(([ox,oy])=>tileG(gx+ox,gy+oy)!==2);   // 물가 살얼음
        if(shore){al=.86;R=214;Gr=228;B=240}else{al=.22+fbm(gx*2,gy*2)*.3;R=196;Gr=218;B=234}}
      else if(t!==8&&t!==13)al=.8;
      if(hash(lx*7,ly)>.996){R=Gr=B=255;al=1}}
    else if(kind==='fall'){if(t===0||t===7||t===9){al=.5;R+=f*40-20;Gr+=f*24-12}else if(t===5)al=.35}
    else if(t===0||t===9)al=.24;
    if(!al)continue;const i=(ly*lw+lx)*4,ed=Math.min(gx,gy,N-gx,NH-gy);
    d[i]=R;d[i+1]=Gr;d[i+2]=B;d[i+3]=255*al*Math.min(1,ed/1.6)}
  g.putImageData(im,0,0);
  // 낙엽·봄꽃 점
  if(kind!=='snow'){const r=rng(91+m.x0*131+m.y0*977+kind.length),k=m.k*LS,sp=(gx,gy)=>[((gx-gy)*TW/2-m.X0)*k,((gx+gy)*TH/2-m.Y0)*k],cnt=m.C*m.CH*(kind==='fall'?SEA.leaves:SEA.flowers),FL=['#f4f0e4','#f2d04c','#ec98b8','#b294e2'];
    for(let q=0;q<cnt;q++){const gx=m.x0+r()*m.C,gy=m.y0+r()*m.CH;if(gx<1||gy<1||gx>N-1||gy>NH-1)continue;const t=tileG(gx,gy),[x,y]=sp(gx,gy);
      if(kind==='fall'){if(t===6||t===8||t===12||t===13||t===2&&r()<.7||(t===1||t===4)&&r()<.5)continue;g.fillStyle=`hsl(${6+r()*40},${60+r()*25}%,${30+r()*24}%)`;g.beginPath();g.ellipse(x,y,(1.2+r()*1.2)*k*2,(.6+r()*.6)*k*2,r()*3,0,7);g.fill()}
      else{if(t!==0&&t!==9)continue;g.fillStyle=FL[Math.floor(r()*FL.length)];g.beginPath();g.arc(x,y,(1+r()*.8)*k*2,0,7);g.fill()}}}
  return L}
// 바닥 그림 c를 (x,y,w,h)에 그린 바로 뒤에 부른다. 겹은 처음 필요할 때 굽고(조각 바닥은 한 프레임에 하나만), 안 쓰게 되면 버린다
function seasonGround(c,x,y,w,h){if(!SM||!c.sm)return;const sl=c._sl||(c._sl={}),want={snow:SM.snow,fall:SM.leafG*(1-SM.snow),bloom:SM.bloom*(1-SM.snow)};
  for(const k in want){const a=want[k];if(a<.02){if(sl[k]&&a<=0)delete sl[k];continue}
    if(!sl[k]){if(c.sm.chunk&&SL_BUDGET--<=0)continue;sl[k]=mkSeaLayer(c,k)}
    ctx.globalAlpha=Math.min(1,a);ctx.drawImage(sl[k],x,y,w,h)}ctx.globalAlpha=1}
// 젖은 땅: 길·포석 칸 몇 곳에 물웅덩이, 비가 오면 빗방울 동그라미가 번진다
function seasonWet(){if(!SM||SM.wet<.05)return;const raining=G.weather==='비',vr=Math.ceil(W/TW+H/TH)+2,j0=Math.max(0,Math.floor(P.y)-vr),j1=Math.min(NH,Math.floor(P.y)+vr),i0=Math.max(0,Math.floor(P.x)-vr),i1=Math.min(N,Math.floor(P.x)+vr);
  ctx.lineWidth=1;for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++){const t=map[j][i].g,h=hash(i*5+1,j*11+2);if(!(t===1&&h<.24||t===4&&h<.1||t===0&&h<.025)||objs[j][i])continue;
    const p=toScreen(i+.2+hash(i,j)*.6,j+.2+hash(j,i)*.6);if(p.x<-30||p.x>W+30||p.y<-20||p.y>H+20)continue;const s=.8+hash(i*3,j)*.9,a=SM.wet;
    ctx.fillStyle=`rgba(48,60,76,${.5*a})`;ctx.beginPath();ctx.ellipse(p.x,p.y,13*s,6*s,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(196,212,228,${.3*a})`;ctx.beginPath();ctx.ellipse(p.x-2*s,p.y-1*s,9*s,3.4*s,0,Math.PI*1.05,Math.PI*1.7);ctx.stroke();
    if(raining)for(let q=0;q<2;q++){const u=frac(time*.9+h*7+q*.5),rr=1+u*7*s;ctx.strokeStyle=`rgba(214,226,238,${.5*(1-u)*a})`;ctx.beginPath();ctx.ellipse(p.x+(hash(i+q,j)-.5)*12*s,p.y+(hash(i,j+q)-.5)*5*s,rr,rr*.45,0,0,7);ctx.stroke()}}}

// ================= 리니지풍 화풍 시안 (사용자 2026-11-18, 시안 전용 — main 미병합) =================
// "강호윤회록의 디자인톤을 첨부한 이미지의 톤으로" — 톤 = 식생·배경·오브젝트의 화풍과 디자인
// 켜기: 주소 ?tone=lin, 또는 window.GH_TONE='lin', 또는 localStorage 'gh-tone'='lin'
// 바꾸는 것 (그림은 모두 코드로 그린다. 상용 게임 그림은 쓰지 않는다)
//  - 바닥: 채도 낮은 올리브빛 풀, 촘촘한 잔결(픽셀 잡음 여러 겹), 마른 풀 얼룩, 모래빛 흙길과 자갈, 깊은 청색 물과 물가 밝은 띠
//  - 바닥 위 풀포기: 가는 잎 3~5가닥 덤불을 빽빽하게, 그늘 점
//  - 나무: 가는 줄기·잔가지가 비치는 성긴 활엽수(작은 잎 점 수천 개, 왼쪽 위 빛), 바늘잎 소나무, 앙상한 가지, 질감 바위
//  - 전각: 검은 윤곽선을 흐리게, 기와·벽에 풍화 잡음·세로 때·밑동 그늘
//  - 화면 전체: 살짝 낮은 채도와 따뜻한 색
const LIN=(()=>{try{if(/[?&]tone=lin\b/.test(location.search)||window.GH_TONE==='lin')return true;return localStorage.getItem('gh-tone')==='lin'}catch(e){return false}})();
// 섞는 판 (사용자 2026-11-18 '리니지풍은 폐기, 구조물·나무·지형·배경 느낌은 어느 정도 가져오고 싶어'): ?tone=mix — 인물·UI·화면 색은 지금 그대로, 바닥 결·나무·바위·건물 질감만 약하게
const LMIX=(()=>{try{return /[?&]tone=mix\b/.test(location.search)||window.GH_TONE==='mix'||localStorage.getItem('gh-tone')==='mix'}catch(e){return false}})();
const LF=LMIX?.45:1;
if(LIN||LMIX){
  // ---------- 바닥 픽셀: bakePix·gaePix 끝(색을 다 정한 직후)에 질감 겹을 끼워 넣는다. 일꾼(Worker)이 함수 글을 그대로 옮기므로 글을 고쳐 다시 만든다 ----------
  const LIN_PIX=`{const oR=R,oG=G,oB=B;const h1=hash(qx*1.7+3,qy*2.3+1),h2=hash((qx>>1)+91,(qy>>1)*3+7),h3=hash((qx>>2)+5,(qy>>2)+19),f1=vn(gx*16,gy*16),f2=vn(gx*6+11,gy*6+5),bl=fbm(gx*.32+40,gy*.32+13);
    const _tg=typeof tg!=='undefined'?tg:tileG,_st=typeof stair!=='undefined'&&stair;
    const dirtC=()=>{const tx=.8+f2*.2+(h1-.5)*.26+(h2-.5)*.18;let rr=(150+bl*16)*tx,gg=(131+bl*12)*tx,bb=(106+bl*8)*tx;
      if(hash(Math.floor(gx*15),Math.floor(gy*15)+3)>.962){rr+=30;gg+=28;bb+=26}else if(hash(Math.floor(gx*15)+1,Math.floor(gy*15))>.972){rr*=.62;gg*=.6;bb*=.58}return[rr,gg,bb]};
    if(t===0||t===9){const dm=clamp((22-(G-R))/30,0,1),L0=clamp((R*.3+G*.59+B*.11)/96,.6,1.35),dry=clamp((bl-.42)*2.2,0,1);
      let rr=86+dry*42,gg=98+dry*20,bb=40+dry*8;const f3=vn(gx*30+3,gy*30+8);const tex=.7+f1*.2+f2*.16+f3*.14+(h2-.5)*.1+(h3-.5)*.08+(h1-.5)*.05;
      rr*=tex*L0;gg*=tex*L0;bb*=tex*L0;if(f3>.8){rr*=1.16;gg*=1.14;bb*=1.04}else if(f3<.18){rr*=.7;gg*=.74;bb*=.66}
      if(t===9){rr*=.82;gg*=.86;bb*=.8}
      if(dm>0){const d=dirtC();rr+=(d[0]-rr)*dm;gg+=(d[1]-gg)*dm;bb+=(d[2]-bb)*dm}R=rr;G=gg;B=bb}
    else if(t===1&&!_st){const d=dirtC();R=d[0];G=d[1];B=d[2]}
    else if(t===2){const w1=fbm(gx*1.4,gy*2.8),w2=vn(gx*8,gy*13),w3=vn(gx*3+7,gy*11);R=18+w1*20+w2*12;G=80+w1*34+w2*14;B=132+w1*38+w2*16;
      if(w3>.72){R+=26;G+=30;B+=30}
      const near=d=>[[d,0],[-d,0],[0,d],[0,-d]].some(([a,b])=>_tg(gx+a,gy+b)!==2);
      if(near(.22)){const k=.55+h1*.3;R=R*(1-k)+150*k;G=G*(1-k)+160*k;B=B*(1-k)+162*k}else if(near(.7)){R+=22;G+=34;B+=26}}
    else if(t===3||t===5){const gr=vn(gx*3,gy*70)*.5+vn(gx*7,gy*140)*.5,Lm=(R+G+B)/3,m=.7+gr*.34+(h1-.5)*.12;R=(Lm+(R-Lm)*.55+6)*m;G=(Lm+(G-Lm)*.55+1)*m;B=(Lm+(B-Lm)*.55-6)*m;if(vn(gx*2+5,gy*2)>.7){R*=.8;G*=.8;B*=.78}}
    else if(t===4||t===13){const gm=fbm(gx*.7+17,gy*.7+3),m=.72+h1*.14+(f2-.5)*.22+f1*.1-(gm>.55?(gm-.55)*.9:0);R*=m;G*=m;B*=m;R=R*.9+8;G=G*.92+6;B=B*.86;
      if(gm>.62&&vn(gx*9,gy*9)>.55){R=R*.7+40*.3;G=G*.7+52*.3;B=B*.7+24*.3}}
    else{const m=.8+h1*.26+(f2-.5)*.18+(h2-.5)*.1;R*=m;G*=m;B*=m}
    ${LMIX?'R=oR+(R-oR)*'+LF+';G=oG+(G-oG)*'+LF+';B=oB+(B-oB)*'+LF+';':'const Lm=(R+G+B)/3;R+=(Lm-R)*.14+5;G+=(Lm-G)*.14+1;B+=(Lm-B)*.14-5;'}}`;
  const linPatch=(f,anchor)=>{const s=f.toString(),i=s.indexOf(anchor);if(i<0){console.warn('lin: anchor 없음',f.name);return f}
    return(0,eval)('('+s.slice(0,i)+LIN_PIX+'\n'+s.slice(i)+')')};
  bakePix=linPatch(bakePix,'const i=(qy*gw+qx)*4,ed=');
  gaePix=linPatch(gaePix,'const fade=Math.min(1,Math.min(gx,gy,N-gx,NH-gy)/1.6);');

  // ---------- 윤곽선: 전각·소품·가구·인물(코드로 그린 몸)의 먹선을 옅은 갈색 그늘선으로 (함수 글에서 바꿔 다시 만든다) ----------
  window.LIN_OUT=LMIX?'rgba(24,18,12,.62)':'rgba(36,28,20,.32)';window.LIN_EAVE=LMIX?'rgba(34,32,30,.8)':'rgba(44,40,36,.6)';window.LIN_BARK='rgba(40,30,22,.5)';
  const linInk=name=>{try{const f=window[name];if(typeof f!=='function')return;const s0=f.toString(),s1=s0.replace(/\bOUT\b/g,'LIN_OUT').replace(/'#22262c'/g,'LIN_EAVE').replace(/'#1e140c'/g,'LIN_BARK');
    if(s1!==s0)window[name]=(0,eval)('('+s1+')')}catch(e){console.warn('lin ink',name,e)}};
  for(const n of LMIX?['quad','roofFace','curl','drawBuildVec','drawTowerVec','bfLogs','bfDoor','bfGiwa','bfPalace','drawProp','drawFurn']:['quad','roofFace','curl','drawBuildVec','drawTowerVec','bfLogs','bfDoor','bfGiwa','bfPalace','drawProp','drawFighter','poly','seg','polearm','weapon','drawFurn'])linInk(n);

  if(!LMIX){   // 인물 쪽 바꿈은 리니지풍 판에서만
  // ---------- 새 인물 몸 (사용자 2026-11-18 "인물 시트도 새로 만들어봐") ----------
  // 주인공도 시트 그림 대신 코드로 그린 몸을 쓴다 (모든 인물이 같은 화풍). 머리를 작게, 몸을 길고 가늘게(7등신 쪽으로),
  // 팔다리는 먹선 없이 그늘·본색·빛 세 겹 원통으로, 몸판은 왼쪽 위 빛 그러데이션으로 칠한다
  window.LIN_BODY=!/[?&]body=old\b/.test(location.search);
  if(LIN_BODY){try{let src=drawFighter.toString();
    src=src.replace(/heroSprite\(\)/g,'(heroSprite()&&!LIN_BODY)').replace('ctx.scale(sc*side,sc);','ctx.scale(sc*side*.84,sc*1.07);')
      .replace('ctx.ellipse(hx,hy,5.2,5.8,0,0,7)','ctx.ellipse(hx,hy,4.3,5.0,0,0,7)').replace("ctx.fillRect(.5,-49,3,4);","ctx.fillRect(.8,-48.5,2.4,3.6);")
      .replace('seg([[0,11.2],[0,12.4]],7.6,Fc(pal.trim))','seg([[0,11.2],[0,12.4]],6,Fc(pal.trim))').replace('seg([hd,joint(hd,sa+.55,.5)],7.5,Fc(pal.robeB))','seg([hd,joint(hd,sa+.55,.5)],6,Fc(pal.robeB))')
      .replace('seg([joint(fh,0,-1.2),joint(fh,0,.2)],7.4,Fc(pal.trim))','seg([joint(fh,0,-1.2),joint(fh,0,.2)],6,Fc(pal.trim))');
    drawFighter=(0,eval)('('+src+')')}catch(e){console.warn('lin body',e)}
    const SC=new Map,tone=(c,k)=>{const key=c+'|'+k;let v=SC.get(key);if(v!==undefined)return v;const m=/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(c);v=null;
      if(m){let h=m[1];if(h.length===3)h=h.replace(/./g,x=>x+x);const n=parseInt(h,16),f=x=>Math.max(0,Math.min(255,Math.round(x)));v=`rgb(${f((n>>16)*k)},${f((n>>8&255)*k)},${f((n&255)*k)})`}SC.set(key,v);return v};
    const _seg=seg;seg=function(pts,w,col){const dk=typeof col==='string'?tone(col,.6):null;if(!dk)return _seg(pts,w,col);
      ctx.lineCap='round';ctx.lineJoin='round';const path=(dx,dy)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0]+dx,p[1]+dy):ctx.moveTo(p[0]+dx,p[1]+dy))};
      path(0,0);ctx.strokeStyle=dk;ctx.lineWidth=w+.4;ctx.stroke();
      path(-w*.1,-w*.1);ctx.strokeStyle=col;ctx.lineWidth=w*.74;ctx.stroke();
      if(w>=2.5){path(-w*.24,-w*.26);ctx.strokeStyle=tone(col,1.28);ctx.globalAlpha*=.7;ctx.lineWidth=w*.26;ctx.stroke();ctx.globalAlpha/=.7}}}


  // 코드로 그린 몸(poly)은 단색 대신 왼쪽 위가 밝고 오른쪽 아래가 어두운 그러데이션으로 칠해 부피를 준다
  {const PC=new Map,shade=(c,k)=>{const m=/^#([0-9a-f]{6})$/i.exec(c);if(!m)return null;const v=parseInt(m[1],16),f=x=>Math.max(0,Math.min(255,Math.round(x)));return`rgb(${f((v>>16)*k)},${f((v>>8&255)*k)},${f((v&255)*k)})`};
    const folds=(pts)=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}FOLD(pts,x0,y0,x1,y1)};
    const _poly=poly;poly=function(pts,fill){if(pts.length<3)return _poly(pts,fill);if(typeof fill!=='string'){_poly(pts,fill);return folds(pts)}let c=PC.get(fill);if(c===undefined){c=/^#[0-9a-f]{6}$/i.test(fill)?[shade(fill,1.22),shade(fill,.68)]:null;PC.set(fill,c)}
      if(!c)return _poly(pts,fill);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}
      const g=ctx.createLinearGradient(x0,y0,x1+(x1-x0)*.2,y1);g.addColorStop(0,c[0]);g.addColorStop(.45,fill);g.addColorStop(1,c[1]);_poly(pts,g);
      FOLD(pts,x0,y0,x1,y1)}
    function FOLD(pts,x0,y0,x1,y1){if(window.LIN_BODY&&(x1-x0)>5&&(y1-y0)>7){ctx.save();ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.clip();ctx.lineWidth=.7;
        for(let x=x0+2.2;x<x1;x+=2.8){ctx.strokeStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x+(x-(x0+x1)/2)*.15,y1);ctx.stroke();ctx.strokeStyle='rgba(255,240,220,.07)';ctx.beginPath();ctx.moveTo(x+.8,y0);ctx.lineTo(x+.8+(x-(x0+x1)/2)*.15,y1);ctx.stroke()}
        const sh=ctx.createLinearGradient(0,y0,0,y1);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=sh;ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.restore()}}}

  // ---------- 인물 시트(주인공·옛 그림·무기): 처음 불릴 때 한 번, 먹선을 주변 옷색의 그늘로 바꾸고 채도·대비를 낮춘다 ----------
  function linSheet(img){const w=img.naturalWidth,h=img.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(img,0,0);
    const im=g.getImageData(0,0,w,h),d=im.data,src=new Uint8ClampedArray(d),Lu=i=>src[i]*.3+src[i+1]*.59+src[i+2]*.11;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(src[i+3]<40)continue;let R=src[i],G=src[i+1],B=src[i+2];const L=Lu(i);
      if(L<58){let sr=0,sg=0,sb=0,n=0,edge=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h){edge++;continue}const j=(yy*w+xx)*4;
          if(src[j+3]<40){edge++;continue}if(Lu(j)>=58){sr+=src[j];sg+=src[j+1];sb+=src[j+2];n++}}
        if(n){const k=edge?.5:.66;R=sr/n*k;G=sg/n*k;B=sb/n*k}if(edge)d[i+3]=Math.min(src[i+3],210)}
      const Lm=(R+G+B)/3;R=(Lm+(R-Lm)*.72)*.92+6;G=(Lm+(G-Lm)*.72)*.92+3;B=(Lm+(B-Lm)*.72)*.92-2;
      R=96+(R-96)*.9;G=92+(G-92)*.9;B=86+(B-86)*.9;d[i]=R;d[i+1]=G;d[i+2]=B}
    g.putImageData(im,0,0);c.complete=true;c.naturalWidth=w;c.naturalHeight=h;return c}
  for(const n in SHEETS){const S0=SHEETS[n],go=()=>{try{if(S0.img.naturalWidth&&!S0.img._lin){const c=linSheet(S0.img);c._lin=1;S0.img=c}}catch(e){console.warn('lin sheet',n,e)}};
    if(S0.img.complete&&S0.img.naturalWidth)go();else S0.img.addEventListener('load',go,{once:true})}
  // 코드로 그린 인물도 같은 색으로: 인물 색표(PAL)의 색을 채도·밝기만 살짝 낮춘다 (그릴 때 filter는 큰 시트에서 몹시 느려서 쓰지 않는다)
  {const mute=c=>{if(typeof c!=='string')return c;const m=c.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);if(!m)return c;let h=m[1];if(h.length===3)h=h.replace(/./g,x=>x+x);
      let R=parseInt(h.slice(0,2),16),G=parseInt(h.slice(2,4),16),B=parseInt(h.slice(4,6),16);const L=(R+G+B)/3,f=v=>Math.max(0,Math.min(255,Math.round(v)));
      R=(L+(R-L)*.7)*.93+5;G=(L+(G-L)*.7)*.93+2;B=(L+(B-L)*.7)*.93-2;return'#'+[R,G,B].map(v=>f(v).toString(16).padStart(2,'0')).join('')};
    const walk=o=>{for(const k in o){const v=o[k];if(typeof v==='string')o[k]=mute(v);else if(v&&typeof v==='object')walk(v)}};try{walk(PAL)}catch(e){}}

  }
  // ---------- 바닥 위 풀포기·그늘 점·자갈 ----------
  const _deco=bakeDeco;
  bakeDeco=function(g,o,TR){const{th,k,X0,Y0,x0,y0,C,CH,N,NH}=o,tileG2=pixTile(o);
    const r=rng(57+th.length+x0*131+y0*7919),sp=(gx,gy)=>[((gx-gy)*TW/2-X0)*k,((gx+gy)*TH/2-Y0)*k],A=C*CH/1600,rx=()=>Math.min(N-1,x0+r()*C),ry=()=>Math.min(NH-1,y0+r()*CH);g.lineCap='round';
    for(let q=0;q<7000*A;q++){const gx=rx(),gy=ry(),t=tileG2(gx,gy);if(t!==0&&t!==9||gx<1||gy<1||gx>N-1||gy>NH-1)continue;const[x,y]=sp(gx,gy);
      g.fillStyle=`rgba(18,22,8,${.25+r()*.25})`;g.fillRect(x,y,(1+r()*2)*k,(1+r())*k)}
    for(let q=0;q<9000*A;q++){const gx=rx(),gy=ry(),t=tileG2(gx,gy);if(t!==0&&!(t===9&&r()<.5)||gx<1||gy<1||gx>N-1||gy>NH-1)continue;const[x,y]=sp(gx,gy),dry=r()<.3,nb=3+(r()*3|0);
      g.lineWidth=.9*k;for(let b=0;b<nb;b++){const l=r();g.strokeStyle=LMIX?`hsla(${dry?62+r()*14:84+r()*26},${dry?34:34+r()*18}%,${l<.4?16+r()*8:30+r()*20}%,.75)`:`hsla(${dry?50+r()*12:62+r()*24},${dry?34:28+r()*16}%,${l<.4?14+r()*8:26+r()*20}%,.85)`;
        const a=-Math.PI/2+(r()-.5)*1.4,len=(2.5+r()*4)*k;g.beginPath();g.moveTo(x+(r()-.5)*2*k,y);g.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);g.stroke()}}
    for(let q=0;q<2200*A;q++){const gx=rx(),gy=ry(),t=tileG2(gx,gy);if(t!==1&&t!==6&&t!==8&&t!==10&&t!==11&&t!==12)continue;const[x,y]=sp(gx,gy),s=(.9+r()*2.4)*k;
      const base=t===1?[150,140,128]:t===6&&TR&&TR.rock?TR.rock:t===12?[190,170,130]:t===10?[120,80,60]:t===11?[60,56,56]:[120,118,114],m=.6+r()*.5;
      g.fillStyle='rgba(20,16,10,.45)';g.beginPath();g.ellipse(x+s*.3,y+s*.35,s*1.3,s*.75,0,0,7);g.fill();
      g.fillStyle=`rgb(${base.map(v=>Math.min(255,v*m)|0).join(',')})`;g.beginPath();g.ellipse(x,y,s*1.2,s*.7,0,0,7);g.fill();
      g.fillStyle='rgba(255,250,235,.25)';g.beginPath();g.ellipse(x-s*.3,y-s*.25,s*.5,s*.25,0,0,7);g.fill()}};

  // 물가 돌무더기: 물에 닿은 뭍 칸 가장자리에 크고 작은 돌을 촘촘히
  const _deco2=bakeDeco;bakeDeco=function(g,o,TR){_deco2(g,o,TR);const{k,X0,Y0,x0,y0,C,CH,N,NH}=o,tg2=pixTile(o),r=rng(911+x0*31+y0*17),sp=(gx,gy)=>[((gx-gy)*TW/2-X0)*k,((gx+gy)*TH/2-Y0)*k],A=C*CH/1600;
    for(let q=0;q<26000*A;q++){const gx=x0+r()*C,gy=y0+r()*CH;if(gx<1||gy<1||gx>N-1||gy>NH-1)continue;const t=tg2(gx,gy);if(t===2||t===3||t===5)continue;
      let w=0;for(const[a,b]of[[.28,0],[-.28,0],[0,.28],[0,-.28]])if(tg2(gx+a,gy+b)===2)w++;if(!w)continue;const[x,y]=sp(gx,gy),s=(1.6+r()*3.4)*k,m=.55+r()*.55;
      g.fillStyle='rgba(16,14,10,.5)';g.beginPath();g.ellipse(x+s*.35,y+s*.4,s*1.3,s*.8,0,0,7);g.fill();
      g.fillStyle=`rgb(${128*m|0},${120*m|0},${104*m|0})`;g.beginPath();g.ellipse(x,y,s*1.2,s*.75,(r()-.5)*.6,0,7);g.fill();
      g.fillStyle=`rgba(235,228,210,${.18+r()*.2})`;g.beginPath();g.ellipse(x-s*.35,y-s*.3,s*.55,s*.28,0,0,7);g.fill()}};

  // ---------- 나무·바위 그림 ----------
  const shadow=(g,x,y,w,h)=>{for(let s=0;s<6;s++){g.fillStyle='rgba(0,0,0,.06)';g.beginPath();g.ellipse(x-4,y,w-s*w/8,h-s*h/9,0,0,7);g.fill()}};
  // 줄기: 밑동이 퍼지고 껍질 결이 있는 가는 줄기. 가지 끝 목록을 돌려준다
  function linTrunk(g,r,{x=60,base=141,top=46,w0=9,lean=0,dep=3,col=[92,74,56]}){const tips=[],L=(a,b,t)=>a+(b-a)*t;
    const tx=x+lean;for(let y=base;y>top;y--){const t=(base-y)/(base-top),cx=L(x,tx,t)+Math.sin(t*5+r()*0)*1.2,w=L(w0,2.4,Math.pow(t,.7))+(t<.08?(1-t/.08)*5:0);
      for(let xx=-w/2;xx<w/2;xx+=.5){const s=(xx+w/2)/w,lit=1.15-s*.75,n=.85+Math.random()*.3,str=Math.sin((xx*1.7+y*.15))*.5+.5>.8?.7:1;
        g.fillStyle=`rgb(${col[0]*lit*n*str|0},${col[1]*lit*n*str|0},${col[2]*lit*n*str|0})`;g.fillRect(cx+xx,y,.6,1.05)}}
    // 뿌리
    g.strokeStyle=`rgb(${col.map(v=>v*.6|0).join(',')})`;g.lineCap='round';for(let q=0;q<4;q++){const a=q/3*Math.PI;g.lineWidth=2.4-q*.3;g.beginPath();g.moveTo(x,base-2);g.quadraticCurveTo(x+Math.cos(a)*7,base,x+Math.cos(a)*(10+r()*5),base+1+r()*2);g.stroke()}
    const br=(x0,y0,a,l,w,d)=>{let x1=x0+Math.cos(a)*l,y1=y0+Math.sin(a)*l;if(y1<16||x1<14||x1>106){const k=Math.max(.2,Math.min(y1<16?(y0-16)/(y0-y1):1,x1<14?(x0-14)/(x0-x1):1,x1>106?(106-x0)/(x1-x0):1));x1=x0+(x1-x0)*k;y1=y0+(y1-y0)*k;l*=k}const mx=(x0+x1)/2+(r()-.5)*l*.25,my=(y0+y1)/2+(r()-.5)*l*.2;
      g.strokeStyle=`rgb(${col.map(v=>v*(.55+d*.08)|0).join(',')})`;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx,my,x1,y1);g.stroke();
      if(d<=0){tips.push([x1,y1]);return}tips.push([x1,y1,1]);const n=2+(r()<.4?1:0);for(let q=0;q<n;q++)br(x1,y1,a+(q-(n-1)/2)*(.45+r()*.35)+(r()-.5)*.25,l*(.6+r()*.18),Math.max(.5,w*.6),d-1)};
    const nb=5+(r()*3|0);for(let q=0;q<nb;q++){const t=.35+q/nb*.6,y=L(base,top,t),side=q%2?1:-1;br(L(x,tx,t),y,-Math.PI/2+side*(.6+r()*.6),12+r()*10,2.6-t*1.4,dep-(t>.7?1:0))}
    br(tx,top,-Math.PI/2+(r()-.5)*.3,10+r()*5,2,dep-1);
    return tips}
  // 잎 점: 덩어리마다 작은 점 수십 개. 왼쪽 위가 밝고, 덩어리 안쪽 아래가 어둡다
  function linLeaves(g,r,tips,{hue=74,hs=22,sat=40,lum=0,R0=9,n=70,cx=60,cy=66,cw=46,ch=46,sparse=.0}){const dots=[];
    for(const tp of tips){const big=tp[2]?.7:1,R=R0*big*(.7+r()*.6),nn=n*big*(.6+r()*.6)|0;
      for(let q=0;q<nn;q++){if(r()<sparse)continue;const a=r()*Math.PI*2,d=Math.pow(r(),.6)*R,x=tp[0]+Math.cos(a)*d,y=tp[1]+Math.sin(a)*d*.8-1;
        const loc=(Math.cos(a)*d)/R*.35+(Math.sin(a)*d)/R*.45,glob=(x-cx)/cw*.35+(y-cy)/ch*.45;
        const l=clamp(.62-loc-glob+(r()-.5)*.42,0,1);dots.push({x,y,l,h:hue+r()*hs})}}
    dots.sort((a,b)=>a.l-b.l);
    for(const o of dots){g.fillStyle=`hsl(${o.h},${sat-10+o.l*14}%,${6+o.l*33+lum}%)`;const s=.9+Math.random()*1.1;g.fillRect(o.x,o.y,s*1.4,s)}
    // 맨 밝은 잎 반짝임
    for(const o of dots)if(o.l>.88&&Math.random()<.35){g.fillStyle=`hsla(${o.h-6},55%,${62+lum}%,.8)`;g.fillRect(o.x,o.y,1,1)}}
  function mkLinTree(seed,o={}){const c=document.createElement('canvas');c.width=120;c.height=150;const g=c.getContext('2d'),r=rng(seed);
    shadow(g,60,139,44,14);const tips=linTrunk(g,r,{top:44+r()*14,lean:(r()-.5)*10,col:o.bark||[96,78,58]});linLeaves(g,r,tips,o);return c}
  function mkLinBare(seed){const c=document.createElement('canvas');c.width=120;c.height=150;const g=c.getContext('2d'),r=rng(seed);
    shadow(g,60,139,32,10);const tips=linTrunk(g,r,{top:44+r()*14,lean:(r()-.5)*10,dep:4,col:[90,74,58]});
    g.lineWidth=.6;for(const t of tips)for(let q=0;q<4;q++){g.strokeStyle=`rgba(70,56,42,${.4+r()*.3})`;g.beginPath();g.moveTo(t[0],t[1]);g.lineTo(t[0]+(r()-.5)*8,t[1]-2-r()*6);g.stroke()}return c}
  // 침엽수: 곧은 줄기 + 아래로 처지는 층층 가지 (가는 잎 획 수백 개)
  function mkLinPine(seed){const c=document.createElement('canvas');c.width=130;c.height=175;const g=c.getContext('2d'),r=rng(seed);
    shadow(g,64,163,34,11);const top=10+r()*8,lean=(r()-.5)*6;
    for(let y=166;y>top;y--){const t=(166-y)/(166-top),cx=64+lean*t,w=Math.max(1.5,6.5*(1-t)+(t<.05?5*(1-t/.05):0));for(let xx=-w/2;xx<w/2;xx+=.5){const lit=1.15-(xx+w/2)/w*.7,n=.8+Math.random()*.35;g.fillStyle=`rgb(${84*lit*n|0},${62*lit*n|0},${46*lit*n|0})`;g.fillRect(cx+xx,y,.6,1.05)}}
    const st=[],tiers=9+(r()*3|0);
    for(let q=0;q<tiers;q++){const t=q/(tiers-1),y=top+8+t*(118-top),cx=64+lean*(1-(y-top)/(166-top)),hw=6+t*30+(r()-.5)*6;
      for(const side of[-1,1]){const ex=cx+side*hw,ey=y+6+t*6;g.strokeStyle='#3a2a1c';g.lineWidth=1.2;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo((cx+ex)/2,y-2,ex,ey);g.stroke();
        const n=40+t*90|0;for(let i=0;i<n;i++){const u=r(),bx=cx+(ex-cx)*u,by=y+(ey-y)*u*u-2+(r()-.3)*(5+t*5),l=clamp(.7-u*.25*(side>0?1.4:.6)-(by-y)/14*.35+(side<0?.12:-.12)-t*.15+(r()-.5)*.35,0,1);st.push({x:bx,y:by,l,u})}}}
    st.sort((a,b)=>a.l-b.l);g.lineWidth=1;
    for(const s of st){g.strokeStyle=`hsl(${118+s.l*22+r()*10},${20+s.l*14}%,${7+s.l*30}%)`;const len=2+r()*3.5;g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.x+(r()-.5)*len,s.y+len*.7);g.stroke()}
    return c}
  // 바위: 윤곽선 없이, 위는 밝고 오른쪽 아래는 어둡게, 잔 얼룩과 이끼
  function mkLinRock(seed){const c=document.createElement('canvas');c.width=60;c.height=44;const g=c.getContext('2d'),r=rng(seed);
    shadow(g,32,35,24,7);const pts=[];for(let i=0;i<11;i++){const a=Math.PI+i/10*Math.PI;pts.push([30+Math.cos(a)*(15+r()*7),35+Math.sin(a)*(16+r()*11)])}
    g.fillStyle='#000';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();
    const im=g.getImageData(0,0,60,44),d=im.data;
    for(let y=0;y<44;y++)for(let x=0;x<60;x++){const i=(y*60+x)*4;if(d[i+3]<250||d[i]>10)continue;const sh=clamp(1.2-(x-14)/46*.6-(y-10)/28*.5,0,1.3),n=.78+hash(x*3,y*5)*.3+(vn(x*.25,y*.25)-.5)*.3;
      let R=150*sh*n,G=144*sh*n,B=130*sh*n;if(vn(x*.18+seed,y*.3)>.7&&y<26){R*=.78;G*=.92;B*=.62}d[i]=R;d[i+1]=G;d[i+2]=B}
    g.putImageData(im,0,0);g.strokeStyle='rgba(30,26,20,.35)';g.lineWidth=.8;for(let q=0;q<4;q++){const x=18+r()*24,y=16+r()*14;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*8,y+3+r()*5);g.stroke()}
    return c}
  // 다른 그림(매화·단풍·대나무·석탑)은 채도를 낮추고 잔결을 얹는다
  function linGrade(c,sat=.7,amt=.22){const g=c.getContext('2d'),w=c.width,h=c.height,im=g.getImageData(0,0,w,h),d=im.data;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!d[i+3])continue;const L=(d[i]+d[i+1]+d[i+2])/3,m=1-amt/2+hash(x*1.3,y*1.7)*amt;
      d[i]=(L+(d[i]-L)*sat+4)*m;d[i+1]=(L+(d[i+1]-L)*sat)*m;d[i+2]=(L+(d[i+2]-L)*sat-4)*m}g.putImageData(im,0,0);return c}
  const put=(arr,list)=>{arr.length=0;arr.push(...list)};const TM=o=>LMIX?{...o,hue:(o.hue||74)+10,sat:(o.sat||40)+10,lum:(o.lum||0)+3}:o;
  put(TREES,[mkLinTree(11,TM({hue:74,hs:26,sat:34})),mkLinTree(23,TM({hue:86,hs:22,lum:-3,sat:30})),mkLinTree(47,TM({hue:66,hs:26,lum:3,sat:38,sparse:.2}))]);
  put(PINES,[mkLinPine(3),mkLinPine(19)]);put(ROCKS,[mkLinRock(5),mkLinRock(9)]);
  put(BARE,[mkLinBare(11),mkLinBare(23),mkLinBare(47)]);
  put(PLUMS,[mkLinTree(61,{hue:338,hs:14,sat:30,lum:10}),mkLinTree(67,{hue:345,hs:12,sat:28,lum:12})]);
  put(MAPLES,[mkLinTree(71,{hue:12,hs:20,sat:48,lum:2}),mkLinTree(73,{hue:24,hs:16,sat:46,lum:4})]);
  if(!LMIX){for(const c of BAMBOO)linGrade(c,.62,.26);for(const c of STUPAS)linGrade(c,.6,.3)}

  // ---------- 전각: 윤곽선 흐리게 + 풍화 잡음 ----------
  const _quad=quad;quad=function(pts,fill,stroke=OUT){_quad(pts,fill,stroke===OUT?(LMIX?'rgba(24,18,12,.62)':'rgba(34,26,18,.38)'):stroke)};
  function linWeather(cv,ofs=0,strong=0){const g=cv.getContext('2d'),w=cv.width,h=cv.height;if(w*h>9e6)return;const im=g.getImageData(0,0,w,h),d=im.data,colTop=new Int16Array(w).fill(-1);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<8)continue;if(colTop[x]<0)colTop[x]=y;
      const X=x+ofs,L=(d[i]+d[i+1]+d[i+2])/3,n=hash(X*1.31,y*2.17),blot=vn(X*.05,y*.05),streak=vn(X*.3,y*.025),m=(.84+n*.16+(blot-.5)*.2+(streak-.5)*.08)*(L>190?.84:.92);
      let mm=m;if(strong){mm*=.86+hash((X>>1)+7,(y>>1)+3)*.26;if(L<130){const row=y%5,col=(x+((y/5|0)%2)*4)%8;if(row===0)mm*=.72;else if(row===1)mm*=1.08;if(col===0&&row>0)mm*=.8}}
      if(LMIX){mm=1+(mm-1)*.5;d[i]=(L+(d[i]-L)*.85+3)*mm;d[i+1]=(L+(d[i+1]-L)*.85+1)*mm;d[i+2]=(L+(d[i+2]-L)*.85-3)*mm}else{d[i]=(L+(d[i]-L)*.55+8)*mm;d[i+1]=(L+(d[i+1]-L)*.55+3)*mm;d[i+2]=(L+(d[i+2]-L)*.55-7)*mm}}
    g.putImageData(im,0,0)}
  const _dbv=drawBuildVec;drawBuildVec=function(b,a){_dbv(b,a);try{if(ctx.canvas&&ctx.canvas.id!=='game')linWeather(ctx.canvas,0,1)}catch(e){}};

  // ---------- 담장·기둥·병풍·난간·노점·소품·가구: 칸 하나를 따로 구워 풍화 겹을 입히고 저장해 두었다가 붙인다 ----------
  // 불·등불처럼 움직이는 소품은 그대로 둔다. 구운 그림은 지역·칸·배율로 기억하고, 오래 안 쓴 것부터 버린다
  const LC=new Map,LC_MAX=160,LIVE={fire:1,torch:1,brazier:1,lantern:1,furnace:1,censer:1};
  const linCached=(key,ax,ay,fn,bx=[-58,-118,58,26])=>{const dpr=C.width/Math.max(1,W*S),k=S*dpr,K=REG+'|'+key+'|'+k;let c=LC.get(K);const a=toScreen(ax,ay);
    if(!c){const w=bx[2]-bx[0],h=bx[3]-bx[1],x0=a.x+bx[0],y0=a.y+bx[1],cv=document.createElement('canvas');cv.width=Math.ceil(w*k);cv.height=Math.ceil(h*k);const g=cv.getContext('2d');g.setTransform(k,0,0,k,-x0*k,-y0*k);
      const keep=ctx;ctx=g;try{fn()}finally{ctx=keep}try{linWeather(cv,Math.round(a.x*k))}catch(e){}c={cv,ox:bx[0],oy:bx[1],w,h};if(LC.size>=LC_MAX)LC.delete(LC.keys().next().value)}else LC.delete(K);LC.set(K,c);
    ctx.drawImage(c.cv,a.x+c.ox,a.y+c.oy,c.w,c.h)};
  const _wall=drawWall,_pil=drawPillar,_scr=drawScreen,_rail=drawRail,_stall=drawStall,_prop=drawProp,_furn=drawFurn;
  drawWall=(i,j,mg)=>linCached(`w${i},${j},${mg?1:0}`,i+.5,j+.5,()=>_wall(i,j,mg));
  drawPillar=(i,j,mg)=>linCached(`p${i},${j},${mg?1:0}`,i+.5,j+.5,()=>_pil(i,j,mg));
  drawScreen=(i,j,mg)=>linCached(`s${i},${j},${mg?1:0}`,i+.5,j+.5,()=>_scr(i,j,mg));
  drawRail=rl=>linCached(`r${rl.x},${rl.y}`,rl.x,rl.y+.5,()=>_rail(rl));
  drawStall=(i,j)=>linCached(`st${i},${j}`,i+.5,j+.5,()=>_stall(i,j));
  drawProp=(kd,i,j)=>LIVE[kd]?_prop(kd,i,j):linCached(`pr${kd}${i},${j}`,i+.5,j+.5,()=>_prop(kd,i,j),[-70,-130,70,30]);
  drawFurn=(kd,i,j,mg)=>kd==='forge'?_furn(kd,i,j,mg):linCached(`f${kd}${i},${j},${mg?1:0}`,i+.5,j+.5,()=>_furn(kd,i,j,mg));

  // ---------- 화면 해상도 잔결: 바닥을 다 깐 직후 기기 픽셀 크기의 풀결 무늬를 겹친다 (줄여 구운 바닥이 늘어나 뭉개지는 것을 덮는다) ----------
  let LGP=null;const linGrainPat=()=>{if(LGP)return LGP;const S2=256,c=document.createElement('canvas');c.width=c.height=S2;const g=c.getContext('2d'),im=g.createImageData(S2,S2),d=im.data,r=rng(4242);
    for(let i=0;i<S2*S2;i++){const v=128+(r()-.5)*34;d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255}
    for(let q=0;q<5200;q++){const x=r()*S2|0,y=r()*S2|0,len=2+(r()*4|0),v=r()<.5?70:190,lean=r()<.5?0:(r()<.5?-1:1);
      for(let k=0;k<len;k++){const xx=(x+(k>len/2?lean:0)+S2)%S2,yy=(y-k+S2)%S2,i=(yy*S2+xx)*4;d[i]=d[i+1]=d[i+2]=(d[i]+v)/2}}
    g.putImageData(im,0,0);LGP=ctx.createPattern(c,'repeat');return LGP};
  const linGrain=()=>{if(REGION().in||REGION().hall)return;const p=linGrainPat(),m=ctx.getTransform(),o=toScreen0(0,0),ox=m.a*o.x+m.e,oy=m.d*o.y+m.f;
    ctx.save();ctx.setTransform(1,0,0,1,0,0);if(p.setTransform)p.setTransform(new DOMMatrix([1,0,0,1,Math.round(ox),Math.round(oy)]));
    ctx.globalCompositeOperation='overlay';ctx.globalAlpha=LMIX?.32:.55;ctx.fillStyle=p;ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore()};
  const _gore=drawGore;drawGore=function(){try{linGrain()}catch(e){}return _gore.apply(this,arguments)};

  if(!LMIX){
  // ---------- 화면 전체 색 ----------
  addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#game{filter:saturate(.86) sepia(.07) contrast(1.04)}';document.head.appendChild(s)});
  {const s=document.createElement('style');s.textContent='#game{filter:saturate(.86) sepia(.07) contrast(1.04)}';(document.head||document.documentElement).appendChild(s)}
  }
}

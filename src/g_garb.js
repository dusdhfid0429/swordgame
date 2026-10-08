// ================= 문파 상징과 의복 =================
// 문파마다 상징 마크(글자·도형·색)와 옷 색이 있고, 직위가 오를수록 옷이 달라진다. 가입하면 내 캐릭터도 그 옷을 입는다.
// 직위별 옷: 0 속가제자 = 문파 색을 누른 수련복, 1 정식제자 = 문파 색 + 띠·머리끈, 2 일대제자 = 금테 + 어깨 망토(마크),
//            3 호법·당주 = 허리까지 오는 망토, 4 장로 = 땅에 끌리는 짙은 망토에 금테
// 설계: docs/세력_문파_설계.md 12장
// [글자, 마크 모양, 옷 색, 띠 색(마크 바탕), 테 색, 덧붙임]
// 덧붙임: monk 민머리 승려, short 짧은 옷(산적·마적), band 머리띠, mask 복면, patch 기운 옷, taiji 태극, plum 매화
const LOOK={
  shaolin:['卍','circle','#d88a2e','#a3271c','#f0c060','monk'],
  mudang:['武','circle','#5a6f8c','#e8e4d8','#c9a14a','taiji'],
  hwasan:['華','circle','#26262e','#d0446a','#f0b8c8','plum'],
  emei:['峨','hex','#b8bcc8','#6a3a8a','#e8e0f0'],
  kunlun:['崑','diamond','#dfe8f0','#3a7aa8','#a8d0e8'],
  kongtong:['崆','square','#8a7a5a','#5a3a1a','#d8b860'],
  jeomchang:['點','diamond','#5a8a5a','#2a4a2a','#d8c870'],
  cheongseong:['靑','hex','#3a7a74','#1a3a38','#a0d8c8'],
  jongnam:['終','shield','#6a7484','#2a3444','#c9a14a'],
  gaebang:['丐','octagon','#8a7454','#4a6a2a','#c0a060','patch'],
  namgung:['宮','shield','#e8e0c8','#2a4a8a','#d8b040'],
  moyong:['慕','circle','#c8d8e8','#4a6a9a','#f0f0f8'],
  paeng:['彭','square','#6a2a24','#d8a040','#f0d070'],
  eon:['彦','octagon','#8a8a6a','#4a3a2a','#d8c070'],
  jegal:['葛','hex','#e8e8e0','#2a5a4a','#9ab8a8'],
  hwangbo:['皇','shield','#c8a040','#6a3a14','#f0e090'],
  ak:['岳','shield','#3a4a6a','#a8281c','#d8b040'],
  dang:['唐','diamond','#3a5a3a','#9a2a6a','#a8c860'],
  hyeongsan:['衡','diamond','#8a9ab0','#3a4a6a','#e8e8f0'],
  cheonsan:['天','hex','#e8f0f8','#7aa8d8','#c0d8f0'],
  taesan:['泰','square','#9a8a6a','#3a5a2a','#e0d090'],
  yangga:['楊','shield','#7a3a2a','#e0c060','#f0e0a0'],
  jeonjin:['全','circle','#e0dccc','#3a3a5a','#b8a878'],
  gomyo:['古','circle','#f0f0f0','#8a8aa8','#c8c8e0'],
  ungga:['雲','octagon','#a8c0d8','#4a6a8a','#e8f0f8'],
  seolsan:['雪','diamond','#f0f4f8','#5a8ab8','#d8e8f8'],
  jangbaek:['白','hex','#d0d8d0','#3a6a5a','#b0d0c0'],
  danri:['段','square','#6a5a7a','#c9a14a','#e8d8f0'],
  sanggwan:['上','shield','#8ab0a0','#2a5a4a','#e8e0c0'],
  danmok:['木','octagon','#7a8a5a','#3a2a1a','#d8c078'],
  bota:['普','circle','#d8c8a0','#2a6a8a','#f0e0b0','monk'],
  mosan:['茅','diamond','#4a3a6a','#d8b040','#f0e090'],
  nabu:['羅','hex','#a87a5a','#3a6a3a','#e8d098'],
  haenam:['海','circle','#2a6a8a','#e8e0c0','#88d0e8'],
  noklim:['綠','shield','#3a4a2a','#8a2a1a','#a89850','short'],
  janggang:['江','octagon','#2a3a4a','#4a8aa8','#a89860','band'],
  haomun:['下','square','#5a4a3a','#a87a2a','#d8b060'],
  sama:['司','shield','#2a1a2a','#8a2a4a','#c9a14a'],
  dongjeong:['洞','octagon','#2a4a4a','#3a7a6a','#a8a870','band'],
  yasu:['獸','diamond','#6a4a2a','#c88a2a','#e8c070','short'],
  gwangpung:['風','hex','#a88a5a','#5a2a1a','#e8c888','short'],
  taeyang:['陽','circle','#c84a1a','#f0c040','#ffe890'],
  bukhae:['氷','hex','#a8c8e0','#2a4a7a','#e8f8ff'],
  podal:['密','circle','#a8281c','#e8a020','#f8d870','monk'],
  daeroe:['雷','octagon','#d8a040','#8a2a1a','#f8e8a8','monk'],
  mandok:['毒','diamond','#2a3a1a','#7a2a8a','#a8c860'],
  hyeolrang:['狼','shield','#3a2a2a','#a81818','#a89080'],
  gwiyeong:['鬼','diamond','#1a1a24','#4a4a6a','#a8a8c8','mask'],
  heukpung:['黑','square','#2a2620','#5a4a2a','#a88a50','band'],
  cheonma:['魔','hex','#1a1414','#a01818','#d8a840']};
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const rgbHex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const cMix=(a,b,t)=>{const A=hexRgb(a),B=hexRgb(b);return rgbHex(A.map((v,i)=>v+(B[i]-v)*t))};
const cShade=(a,k)=>rgbHex(hexRgb(a).map(v=>v*k));
const lookOf=sid=>{const L=LOOK[sid];return L&&{sid,glyph:L[0],shape:L[1],robe:L[2],accent:L[3],trim:L[4],x:L[5]||''}};
// 직위 0(속가제자)은 문파 색을 회색 쪽으로 눌러 수련복처럼 보이게
const rankRobe=(L,rank)=>rank<1?cMix(L.robe,'#8a8884',.5):L.robe;

// ---- 상징 마크 (캔버스에 한 번 그려 두고 다시 쓴다) ----
const EMB={};
function shapePath(g,shape,c,r){g.beginPath();
  if(shape==='circle')g.arc(c,c,r,0,7);
  else if(shape==='diamond'){g.moveTo(c,c-r);g.lineTo(c+r,c);g.lineTo(c,c+r);g.lineTo(c-r,c)}
  else if(shape==='square'){const s=r*.86;g.rect(c-s,c-s,s*2,s*2)}
  else if(shape==='shield'){g.moveTo(c-r*.82,c-r*.86);g.lineTo(c+r*.82,c-r*.86);g.lineTo(c+r*.82,c-r*.1);g.quadraticCurveTo(c+r*.7,c+r*.62,c,c+r);g.quadraticCurveTo(c-r*.7,c+r*.62,c-r*.82,c-r*.1)}
  else{const n=shape==='hex'?6:8;for(let i=0;i<n;i++){const a=Math.PI*2*i/n+(n===8?Math.PI/8:Math.PI/6);g[i?'lineTo':'moveTo'](c+Math.cos(a)*r,c+Math.sin(a)*r)}}
  g.closePath()}
function embCanvas(sid,S=96){
  const key=sid+'_'+S;if(EMB[key])return EMB[key];const L=lookOf(sid);if(!L)return null;
  const cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d'),c=S/2,r=S*.44;
  shapePath(g,L.shape,c,r);g.fillStyle=L.trim;g.fill();
  shapePath(g,L.shape,c,r*.86);const gr=g.createLinearGradient(0,c-r,0,c+r);gr.addColorStop(0,cMix(L.accent,'#ffffff',.12));gr.addColorStop(1,cShade(L.accent,.7));g.fillStyle=gr;g.fill();
  g.lineWidth=S*.02;g.strokeStyle='rgba(10,7,5,.8)';shapePath(g,L.shape,c,r);g.stroke();
  const ink=hexRgb(L.accent).reduce((a,v)=>a+v,0)>420?'#1a1612':L.trim;
  if(L.x==='taiji'){const t=r*.56;g.fillStyle='#f4f0e6';g.beginPath();g.arc(c,c,t,0,7);g.fill();g.fillStyle='#1a1612';g.beginPath();g.arc(c,c,t,-Math.PI/2,Math.PI/2);g.arc(c,c+t/2,t/2,Math.PI/2,-Math.PI/2,true);g.arc(c,c-t/2,t/2,Math.PI/2,-Math.PI/2);g.fill();
    g.fillStyle='#f4f0e6';g.beginPath();g.arc(c,c+t/2,t/7,0,7);g.fill();g.fillStyle='#1a1612';g.beginPath();g.arc(c,c-t/2,t/7,0,7);g.fill();g.strokeStyle=L.trim;g.lineWidth=S*.02;g.beginPath();g.arc(c,c,t,0,7);g.stroke()}
  else if(L.x==='plum'){const p=r*.24;for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g.fillStyle='#f6d8e0';g.beginPath();g.arc(c+Math.cos(a)*p*1.15,c+Math.sin(a)*p*1.15,p,0,7);g.fill()}
    g.fillStyle=L.accent;g.beginPath();g.arc(c,c,p*.6,0,7);g.fill();g.fillStyle='#f0c040';for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5+.6;g.beginPath();g.arc(c+Math.cos(a)*p*.45,c+Math.sin(a)*p*.45,S*.012,0,7);g.fill()}}
  else{g.font=`bold ${Math.round(S*.46)}px "Noto Serif KR","Noto Serif CJK KR","Noto Serif CJK SC","Nanum Myeongjo",serif`;g.textAlign='center';g.textBaseline='middle';
    g.lineWidth=S*.05;g.strokeStyle=ink==='#1a1612'?'rgba(255,255,255,.35)':'rgba(10,7,5,.7)';g.strokeText(L.glyph,c,c+S*.03);g.fillStyle=ink;g.fillText(L.glyph,c,c+S*.03)}
  return EMB[key]=cv}
const EMBURL={};
const embUrl=sid=>EMBURL[sid]||(EMBURL[sid]=embCanvas(sid)?embCanvas(sid).toDataURL():'');
const embImg=(sid,px=22)=>LOOK[sid]?`<img class="emb" src="${embUrl(sid)}" width="${px}" height="${px}" alt="${SECTS[sid]?SECTS[sid].n:''} 상징">`:'';
function drawEmblem(g,sid,x,y,s){const cv=embCanvas(sid,s>40?96:48);if(cv)g.drawImage(cv,x-s/2,y-s/2,s,s)}

// ---- 코드로 그리는 사람(몹·장문인)의 옷 ----
function sectPal(sid,rank,cls,o={}){rank=Math.min(4,rank);   // 마교 호법·부교주는 장로 옷을 입는다
  const L=lookOf(sid);if(!L)return null;const k=`garb_${sid}_${rank}_${cls}_${o.elite?1:0}_${o.master?1:0}`;if(PAL[k])return k;
  const robe=rankRobe(L,rank),W=CLASS[cls]||CLASS.검,monk=L.x==='monk',fac=alFac(SECTS[sid].al);
  PAL[k]={...PAL.hero,robe:[robe,cShade(robe,.55)],robeB:cShade(robe,.72),
    inner:rank>=1?L.accent:cShade(robe,.8),sash:rank>=1?L.accent:cShade(robe,.6),trim:rank>=2?L.trim:cShade(robe,.85),
    hairband:monk?null:rank>=1?L.accent:null,tail:monk?0:1,hair:monk?'#c8987a':o.master?'#d8d4cc':PAL.hero.hair,
    weapon:o.master?'none':W.draw,anim:W.anim,jade:0,beard:o.master||o.elite?1:0,armor:o.elite&&fac!=='정'&&!monk&&!o.master?1:0,
    short:L.x==='short'&&!o.master?1:0,band:L.x==='band'||L.x==='short'&&rank<3?L.accent:null,mask:L.x==='mask'&&!o.master?'#14141c':null,patch:L.x==='patch'?1:0,
    cape:rank>=2?(rank>=4?cShade(L.robe,.45):L.accent):null,capeLen:rank>=2?rank-1:0,capeEdge:rank>=3?L.trim:null,emb:rank>=2?sid:null};
  return k}
// 망토: 길이 1 어깨, 2 허리, 3 땅까지. 뒤쪽 가운데에 문파 마크
function drawCape(pal,trail,wv,sc=1){
  const L=pal.capeLen||3,yb=[0,-30,-17,-3][L]*sc,w=[0,.55,.8,1][L],top=-45*sc;
  const pts=[[-7*sc,top],[4*sc,top],[(-6-4*w)*sc-trail*1.6*w,yb+wv*2],[(-12-10*w)*sc-trail*2*w,yb-4*sc+wv*3]];
  poly(pts,pal.cape);
  if(pal.capeEdge){ctx.strokeStyle=pal.capeEdge;ctx.lineWidth=1.4*sc;ctx.beginPath();ctx.moveTo(...pts[1]);ctx.lineTo(...pts[2]);ctx.lineTo(...pts[3]);ctx.lineTo(...pts[0]);ctx.stroke()}
  if(pal.emb){const cx=(pts[0][0]+pts[1][0]+pts[2][0]+pts[3][0])/4,cy=(pts[0][1]+pts[1][1]+pts[2][1]+pts[3][1])/4;drawEmblem(ctx,pal.emb,cx,cy,(L===1?7:L===2?9:11)*sc)}}

// ---- 내 캐릭터(도트 그림)의 옷: 남색 겉옷 픽셀만 문파 색으로 바꿔 칠한 그림을 문파·직위(속가/정식)마다 만들어 둔다 ----
const HERO_GARB={};
function recolorAtlas(img,robe){
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
  const id=g.getImageData(0,0,c.width,c.height),d=id.data,B=hexRgb(robe),dark=B.map(v=>v*.22),light=B.map(v=>v+(255-v)*.38);
  for(let i=0;i<d.length;i+=4){if(d[i+3]<20)continue;const r=d[i],gg=d[i+1],b=d[i+2],l=r*.3+gg*.59+b*.11;
    if(b-r<15||l>=140)continue;  // 겉옷(푸른 기가 도는 어두운 색)만. 머리카락·피부·흰 속옷·칼은 그대로
    const u=Math.max(0,Math.min(1,(l-12)/108));let o;
    if(u<.42){const t=u/.42;o=dark.map((v,k)=>v+(B[k]-v)*t)}else{const t=(u-.42)/.58;o=B.map((v,k)=>v+(light[k]-v)*t)}
    d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2]}
  g.putImageData(id,0,0);return c}
function heroGarb(){
  if(!P||!P.sect||!LOOK[P.sect])return null;const rank=Math.min(4,rankIdx(P.sect)),L=lookOf(P.sect),key=P.sect+(rank<1?'_0':'_1');
  if(!HERO_GARB[key]&&HERO.complete&&HERO.naturalWidth&&HBODY.complete&&HBODY.naturalWidth){const robe=rankRobe(L,rank);HERO_GARB[key]={hero:recolorAtlas(HERO,robe),body:recolorAtlas(HBODY,robe)}}
  const imgs=HERO_GARB[key];if(!imgs)return null;
  return{...imgs,rank,pal:{cape:rank>=2?(rank>=4?cShade(L.robe,.45):L.accent):null,capeLen:rank>=2?rank-1:0,capeEdge:rank>=3?L.trim:null,emb:rank>=2?P.sect:null}}}

// ---- 직위별 옷 미리보기 (문파 창) ----
const GARB_PREV={};
function garbPreview(sid){
  const pk=sid+(P&&P.sect===sid?rankIdx(sid):'');if(GARB_PREV[pk])return GARB_PREV[pk];const s=SECTS[sid],cls=s.arts[0].cls,w=68,h=124,cv=document.createElement('canvas');cv.width=w*5*2;cv.height=h*2;
  const og=ctx,sv={x:cam.x,y:cam.y,W,H,time};
  try{
    // drawFighter는 화면(ctx)에 그리므로, 잠시 미리보기 캔버스로 바꿔 끼운다
    ctx=cv.getContext('2d');ctx.scale(2,2);time=0.4;
    for(let r=0;r<5;r++){const e={x:20,y:20,fx:1,fy:0,moving:false,hit:0,big:1.45,pal:sectPal(sid,r,cls,{elite:r>=2,master:r>=4}),d:{},npc:1,n:''},p=iso(20,20);
      cam.x=p.x+W/2-(w*r+w/2+6);cam.y=p.y+H/2-(h-26);drawFighter(e,false)}
    ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';SRANK[s.al].forEach((n,r)=>{ctx.fillStyle=P&&P.sect===sid&&rankIdx(sid)===r?'#e8c66e':'#cfc4ae';ctx.fillText(n,w*r+w/2,h-6)})}
  catch(err){}
  ctx=og;cam.x=sv.x;cam.y=sv.y;time=sv.time;
  return GARB_PREV[pk]=cv.toDataURL()}
function garbHtml(s){
  if(!LOOK[s.id])return'';const L=lookOf(s.id),names=SRANK[s.al];
  return `<div class="card garb"><h4>${embImg(s.id,34)} ${s.n}의 상징과 의복</h4>
    <img class="garbprev" src="${garbPreview(s.id)}" alt="${s.n} 직위별 의복: ${names.join(', ')}">
    <p class="dim">상징 '${L.glyph}'. 가입하면 이 옷을 입고, 직위가 오르면 옷이 바뀐다: 속가제자 수련복 → 정식제자 띠 → 일대제자 금테·어깨 망토 → ${names[3]} 허리 망토 → 장로 긴 망토.</p></div>`}

// ---- 본산 깃발: 'flag:문파' 물체 ----
function drawFlag(i,j,sid){
  const p=toScreen(i+.5,j+.5),L=lookOf(sid);if(!L)return;const wv=Math.sin(time*2.4+i+j);
  ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,0,8,3.5,0,0,7);ctx.fill();
  ctx.fillStyle='#3a2a1c';ctx.fillRect(-1.6,-78,3.2,78);ctx.fillStyle=L.trim;ctx.beginPath();ctx.arc(0,-79,2.6,0,7);ctx.fill();
  const x0=1.5,y0=-74,fw=26,fh=36,pts=[[x0,y0],[x0+fw,y0+wv*2],[x0+fw+wv,y0+fh+wv*2],[x0+fw*.5,y0+fh+6+wv],[x0,y0+fh]];
  poly(pts,L.accent);ctx.strokeStyle=L.trim;ctx.lineWidth=1.6;ctx.stroke();
  drawEmblem(ctx,sid,x0+fw/2+wv*.5,y0+fh/2+wv,20);ctx.restore()}
function placeFlags(sid,spots){for(const[x,y]of spots)if(objs[y]&&objs[y][x]==null&&map[y][x].g!==2&&map[y][x].g!==1&&map[y][x].g!==3)objs[y][x]='flag:'+sid}

// ================= 보법: 회피기 (경공과 따로) =================
// 경공은 멀리·높이 뛰는 이동기, 보법은 싸움 중 짧게 미끄러지는 회피기다. 설계: docs/세력_문파_설계.md 14장
// - 보법 버튼(터치) · Shift 또는 W(키보드). 쓰는 동안 잠깐 몸이 흐려져 피해를 받지 않는다(무적).
// - 두 타입
//   직선(line): 조이스틱 방향(놓았으면 바라보는 쪽)으로 정해진 거리만큼 곧게 미끄러진다. 적 사이는 빠져나가고 벽·물에서는 멈춘다.
//   간파(flank): 둘레를 살펴 공격하기 좋은 자리로 옮긴다. 상대 등 뒤를 잡고, 다른 적에게 둘러싸이지 않는 자리를 고른다.
//               등 뒤를 잡으면 다음 일격이 치명타가 된다. 조이스틱을 기울이고 있으면 그쪽 자리를 더 쳐 준다.
// - 등급(하승·중승·상승·절정)이 높을수록 미끄러지는 거리와 살피는 범위가 넓고, 다시 쓰는 시간이 짧다.
// - 살피는 자리 수는 등급과 상관없이 최대 96곳, 견주는 적은 가까운 순으로 최대 24명이라 절정에서도 1ms 안팎이다.
const BGRADE=GD.BGRADE;
const BG=GD.BG;
const BOBS=GD.BOBS;
// 얻는 곳: 하승·중승은 개봉 잡화점 비급, 상승은 문파 본산에서 정식제자 이상 공적 100, 절정은 호법(당주) 이상 공적 300
const BCOST=GD.BCOST,BRANK=GD.BRANK,BPRICE=GD.BPRICE;
const bobOf=()=>BOBS[P.bcur]||BOBS.b_basic;
function bobInit(){if(!P.bob)P.bob={b_basic:1};if(!P.bcur||!P.bob[P.bcur])P.bcur='b_basic';if(P.bcd2==null)P.bcd2=0}
function bobBlock(id,viaSect){const b=BOBS[id];bobInit();if(P.bob[id])return'이미 익혔다';
  if(b.g>=2){if(!viaSect)return'문파에서';if(!P.sect)return'문파 제자만';if(rankIdx(P.sect)<BRANK[b.g])return`${rankName(P.sect,BRANK[b.g])} 이상`;if((P.merit[P.sect]||0)<BCOST[b.g])return`공적 ${BCOST[b.g]} 필요`}
  return null}
function learnBob(id,viaSect){const b=BOBS[id],no=bobBlock(id,viaSect);if(no)return false;if(b.g>=2)P.merit[P.sect]-=BCOST[b.g];
  P.bob[id]=1;P.bcur=id;log(`보법 [${b.n}](${BGRADE[b.g]} · ${b.t==='line'?'직선':'간파'})을(를) 익혔습니다. 보법 버튼으로 씁니다.`,'xp');showBanner(b.n,`${BGRADE[b.g]} 보법`);return true}
function mkBBook(id){const b=BOBS[id];return{id:++itemId,slot:'bbook',bob:id,name:`보법 비급 · ${b.n}`,price:40}}

// ---- 자리 찾기 ----
// 가는 길이 막히지 않았나 (적은 빠져나가고, 벽·물·나무·바위에서 막힌다)
function bobClear(x0,y0,x1,y1){const l=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(l/.3));for(let i=1;i<=n;i++){const t=i/n;if(!walkAt(x0+(x1-x0)*t,y0+(y1-y0)*t))return false}return true}
function bobLine(b,dx,dy){const L=BG.len[b.g];let best=null;
  for(let d=L;d>=.6;d-=.15){const x=P.x+dx*d,y=P.y+dy*d;if(!walkAt(x,y)||!bobClear(P.x,P.y,x,y))continue;
    if(mobs.some(e=>e.hp>0&&Math.hypot(e.x-x,e.y-y)<.45))continue;best={x,y};break}
  return best}
// 간파: 후보 자리마다 점수를 매겨 가장 좋은 곳
function bobFlank(b,jx,jy){
  const R=BG.rad[b.g],fs=foes().filter(e=>dist(e,P)<R+3).sort((a,c)=>dist(a,P)-dist(c,P)).slice(0,24);
  let T=P.target&&P.target.hp>0&&dist(P.target,P)<R+2&&fs.includes(P.target)?P.target:fs[0]||null;
  const reach=Math.max(.9,Math.min(2.2,CLASS[hasWeaponFor(curCls())?curCls():'권'].reach*.8));
  const rings=Math.min(6,Math.max(3,Math.round(R/.9))),per=16;let best=null,bs=-1e9,tried=0;
  for(let r=1;r<=rings;r++){const rad=R*r/rings;
    for(let k=0;k<per;k++){const a=(k+(r%2)*.5)/per*Math.PI*2,x=P.x+Math.cos(a)*rad,y=P.y+Math.sin(a)*rad;tried++;
      if(!walkAt(x,y))continue;let s=0,near=0,close=9;
      for(const e of fs){const d=Math.hypot(e.x-x,e.y-y);close=Math.min(close,d);if(e!==T&&d<1.7)near++}
      if(close<.55)continue;
      s-=near*3;                                              // 다른 적에게 둘러싸이면 나쁘다
      if(T){const tx=x-T.x,ty=y-T.y,td=Math.hypot(tx,ty)||1;
        s-=Math.abs(td-reach)*2.2;                            // 칼이 닿는 거리
        const back=-(tx*(T.fx||0)+ty*(T.fy||0))/td;s+=back*3.5}  // 상대 등 뒤
      else{s+=Math.min(4,close)*.8}                           // 상대가 없으면 적에게서 멀리
      if(jx||jy)s+=((x-P.x)*jx+(y-P.y)*jy)/rad*2.5;           // 조이스틱 쪽
      s-=rad*.15;
      if(s>bs&&bobClear(P.x,P.y,x,y)){bs=s;best={x,y,T,back:T?-((x-T.x)*(T.fx||0)+(y-T.y)*(T.fy||0))/(Math.hypot(x-T.x,y-T.y)||1):0}}}}
  BOB_STAT.tried=tried;BOB_STAT.foes=fs.length;return best}
const BOB_STAT=GD.BOB_STAT;
function bobeop(){
  if(!P||P.hp<=0||P.leap)return false;bobInit();
  if(P.perch){perchDrop();return true}
  const b=bobOf(),q=BG.qi[b.g];
  if((P.bcd2||0)>0)return false;if(P.qi<q){log('내공이 부족합니다.','info');return false}
  const t0=performance.now(),jx=joy.on?joy.gx:0,jy=joy.on?joy.gy:0;
  let dst=null;
  if(b.t==='flank')dst=bobFlank(b,jx,jy);
  if(!dst){const dx=jx||jy?jx:P.fx,dy=jx||jy?jy:P.fy;dst=bobLine(b,dx,dy)}
  BOB_STAT.ms=performance.now()-t0;
  if(!dst){addText(P.x,P.y,'막혔다','#9a8d72');return false}
  P.qi-=q;P.bcd2=BG.cd[b.g];P.bmax=BG.cd[b.g];P.inv=Math.max(P.inv,BG.inv[b.g]);P.path=null;P.chan=null;P.medit=false;
  P.leap={sx:P.x,sy:P.y,ex:dst.x,ey:dst.y,t:0,dur:.2+Math.hypot(dst.x-P.x,dst.y-P.y)*.025,z0:0,z1:0,to:null,step:1};
  for(let i=0;i<4;i++)fx.push({t:'ghost',x:P.x+(dst.x-P.x)*i/4,y:P.y+(dst.y-P.y)*i/4,life:.3+i*.05,col:'190,220,255'});
  if(dst.T){P.target=dst.T;if(dst.back>.5){P.buff.crit=Math.max(P.buff.crit||0,1.4);addText(dst.x,dst.y,'배후','#ffd36a')}}
  if(typeof sfx==='function')sfx('dodge');
  return true}
// 보법이 끝나면 상대를 바라본다
function bobLand(L){if(L.step&&P.target&&P.target.hp>0)face(P.target.x,P.target.y)}

// ---- 화면 ----
function bobRow(id,btn){const b=BOBS[id],on=P.bcur===id;
  return `<div class="it"><div>${b.n} <small class="${b.g>=2?'good':'dim'}">${BGRADE[b.g]} · ${b.t==='line'?'직선':'간파'}</small>${on?' <small class="gold">쓰는 중</small>':''}<span>${b.d} · ${b.t==='line'?`${BG.len[b.g]}칸 미끄러짐`:`둘레 ${BG.rad[b.g]}칸을 살핌`} · 내공 ${BG.qi[b.g]} · ${BG.cd[b.g]}초</span></div>${btn?`<div class="ib">${btn}</div>`:''}</div>`}
function bobArtsHtml(){bobInit();const mine=Object.keys(BOBS).filter(id=>P.bob[id]);
  return `<div class="card"><h4>보법 <small class="dim">회피기 · ${TOUCH?'보법 버튼':'Shift 또는 W'}</small></h4><div class="list">${mine.map(id=>bobRow(id,P.bcur===id?'':B('bsel:'+id,'쓰기'))).join('')}</div>
    <p class="note">직선 보법은 조이스틱(또는 바라보는) 방향으로 곧게 빠지고, 간파 보법은 상대 등 뒤나 덜 둘러싸인 자리를 찾아 옮긴다. 등 뒤를 잡으면 다음 일격이 치명타. 경공은 멀리·높이 뛰는 이동기로 따로 쓴다.</p>
    <p class="note">하승·중승 비급은 개봉 잡화점, 상승·절정은 문파 본산에서 직위와 공적으로 익힌다.</p></div>`}
function bobSectHtml(s){if(P.sect!==s.id)return'';bobInit();const list=Object.keys(BOBS).filter(id=>BOBS[id].g>=2);
  return `<h4 style="margin:0">문파 보법 <small class="dim">상승은 ${rankName(s.id,BRANK[2])}, 절정은 ${rankName(s.id,BRANK[3])} 이상</small></h4><div class="list">${list.map(id=>{const no=bobBlock(id,1);
    return bobRow(id,P.bob[id]?'<small class="good">익힘</small>':B('blearn:'+id,no||`익히기 · 공적 ${BCOST[BOBS[id].g]}`,{d:!!no,pri:!no}))}).join('')}</div>`}

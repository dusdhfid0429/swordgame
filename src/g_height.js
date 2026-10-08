// ================= 높이: 지붕과 나무 위 =================
// 경공(도약)으로 집 지붕이나 나무 위에 올라선다. 설계: docs/맵이동_설계.md 12장
// - 지붕: 지붕 위를 걸어 다닐 수 있고, 가장자리 밖으로 걸어 나가면 뛰어내린다. 지붕에서 지붕으로 건너뛸 수 있다.
// - 나무: 가지 위에 선다. 움직이면 바로 아래로 내려온다. 나무 위에 있으면 적이 알아채는 거리가 절반이 된다.
// - 높은 곳의 이점: 맨손·병장기로 덤비는 적은 닿지 않는다(활·암기를 쓰는 적만 쏜다). 높은 곳에서 쏜 화살·장풍은 장애물을 넘고 20% 세다.
//   높은 곳에서 적을 고르면 그 적 위로 뛰어내리며 낙하 공격(높이가 높을수록 세다)을 한다.
// - 덤비던 적이 6초 동안 닿지 못하면 포기하고 돌아간다(두목은 끝까지 기다린다).
const PERCH_TREE={tree:1,pine:1,bamboo:1};
const buildAt=(i,j)=>builds.find(b=>i>=b.x&&i<b.x+b.w&&j>=b.y&&j<b.y+b.h);
function roofZ(b){const pav=b.kind==='pavilion',WH=pav?34:38,H0=WH+(pav?0:4),RH=H0+10+8*Math.min(b.w,b.h);return Math.round(pav?RH*.85:H0+(RH-H0)*.55)}
function treeZ(ob,i,j){const set=SPRITES[ob],s=set[(i*7+j*3)%set.length];return Math.round(Math.max(28,(s.height-12)*.62))}
// 그 자리의 높은 곳: 지붕이나 나무
function perchAt(x,y){const i=Math.floor(x),j=Math.floor(y);if(i<0||j<0||i>=N||j>=N)return null;const o=objs[j][i];
  if(o==='B'){const b=buildAt(i,j);return b?{k:'roof',b,z:roofZ(b)}:null}
  if(PERCH_TREE[o])return{k:'tree',i,j,z:treeZ(o,i,j),x:i+.5,y:j+.5};return null}
const samePerch=(a,b)=>!!a&&!!b&&a.k===b.k&&(a.k==='roof'?a.b===b.b:a.i===b.i&&a.j===b.j);
const onRoof=(b,x,y,m=.18)=>x>b.x+m&&x<b.x+b.w-m&&y>b.y+m&&y<b.y+b.h-m;
const perchD=()=>{const q=P.perch;return q.k==='roof'?q.b.x+q.b.w+q.b.y+q.b.h-1+.6:q.i+q.j+1.1};
// 높은 곳에서 내려간다: 가고 싶은 쪽(없으면 바라보는 쪽)의 가까운 땅으로. after가 있으면 내려가서 그리로 길을 잡는다
function perchDrop(tx,ty,after){
  if(!P.perch||P.leap)return false;const ax=tx==null?P.x+P.fx*2:tx,ay=ty==null?P.y+P.fy*2:ty;let best=null,bd=1e9;
  const q=P.perch,x0=q.k==='roof'?q.b.x-1:q.i-1,x1=q.k==='roof'?q.b.x+q.b.w:q.i+1,y0=q.k==='roof'?q.b.y-1:q.j-1,y1=q.k==='roof'?q.b.y+q.b.h:q.j+1;
  for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++)if(walk(i,j)){const d=Math.hypot(i+.5-ax,j+.5-ay)+Math.hypot(i+.5-P.x,j+.5-P.y)*.3;if(d<bd){bd=d;best={x:i+.5,y:j+.5}}}
  if(!best)return false;
  P.leap={sx:P.x,sy:P.y,ex:best.x,ey:best.y,t:0,dur:.38,z0:P.z||0,z1:0,to:null,after};P.path=null;P.perch=null;P.medit=false;return true}
// 낙하 공격: 높은 곳에서 적 위로 뛰어내린다
function plunge(e){
  if(!P.perch||P.leap||!e)return false;const z=P.z||0,dur=.45;
  P.leap={sx:P.x,sy:P.y,ex:e.x,ey:e.y,t:0,dur,z0:z,z1:0,to:null,plunge:z};P.perch=null;P.path=null;P.inv=Math.max(P.inv,dur);P.medit=false;
  if(heroSprite()&&!P.ride){P.sj=.6;P.satk=0}else P.jump=.35;face(e.x,e.y);return true}
function plungeHit(L){
  const X=mkX(hasWeaponFor(curCls())?P.cur:'base'),m=1.3+L.plunge/45;let n=0;
  for(const e of foes())if(dist(e,P)<1.7){hitE(X,e,m,.5,.6);n++}
  fx.push({t:'puff',x:P.x,y:P.y,life:.6});fRing(X,P,1.7,X.art.c,4,.35);shake=.3;
  addText(P.x,P.y-.4,'낙하 공격','#ffd36a');if(n)gainMast(X.key,1)}
// 경공 착지 자리 고르기: 바라보는 쪽에 지붕·나무가 있으면 그 위로
function leapPerch(LEAP){
  for(let d=.7;d<=LEAP;d+=.15)for(const o of[0,.35,-.35]){const nx=P.x+P.fx*d-P.fy*o,ny=P.y+P.fy*d+P.fx*o,q=perchAt(nx,ny);
    if(!q||samePerch(q,P.perch))continue;
    if(q.k==='tree')return{q,x:q.x,y:q.y};
    const b=q.b;let x=nx,y=ny;for(let k=0;k<20&&!onRoof(b,x,y,.3);k++){x+=P.fx*.1;y+=P.fy*.1}
    x=Math.max(b.x+.3,Math.min(b.x+b.w-.3,x));y=Math.max(b.y+.3,Math.min(b.y+b.h-.3,y));return{q,x,y}}
  return null}
// 높은 곳에서의 움직임. 처리했으면 true
function perchMove(kx,ky,sp){
  const q=P.perch;if(!q||P.leap)return false;
  if(kx||ky){const l=Math.hypot(kx,ky);P.fx=kx/l;P.fy=ky/l;P.path=null;P.target=null;P.talk=null;P.medit=false;
    if(q.k==='tree'){perchDrop();return true}
    const nx=P.x+P.fx*sp*.85,ny=P.y+P.fy*sp*.85;
    if(onRoof(q.b,nx,ny)){P.x=nx;P.y=ny;P.moving=true}else perchDrop(P.x+P.fx*2,P.y+P.fy*2);return true}
  // 적을 골랐으면: 활은 그 자리에서 쏘고, 아니면 뛰어내리며 낙하 공격
  if(P.target&&P.target.hp>0){const e=P.target,rr=CLASS[hasWeaponFor(curCls())?curCls():'권'].reach;
    if(rr>=4&&dist(e,P)<rr){face(e.x,e.y);if(P.mode==='auto')autoAttack(e);else basicStrike(e)}
    else if(dist(e,P)<5.5)plunge(e);else{perchDrop(e.x,e.y)}
    return true}
  if(P.path&&P.path.length||P.talk||P.goal){const dst=P.path&&P.path.length?P.path[P.path.length-1]:P.talk||P.goal;perchDrop(dst.x,dst.y,{x:dst.x,y:dst.y});return true}
  return true}
// 경공이 끝날 때
function leapLand(L){
  P.z=L.z1||0;P.perch=L.to||null;
  if(P.perch){addText(P.x,P.y-.3,P.perch.k==='roof'?'지붕 위':'나무 위','#cfe3ff');if(typeof sfx==='function')sfx('land')}
  else if(L.plunge)plungeHit(L);
  if(L.after){const a=L.after;P.path=findPath(Math.floor(P.x),Math.floor(P.y),Math.floor(a.x),Math.floor(a.y))}}

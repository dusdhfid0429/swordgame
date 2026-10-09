// ================= 성 지도 나누기: 성 하나 = 40×40 맵 여러 장 =================
// 사용자 결정(2026-10-09): 무림전도를 비율대로 줄이고, 맵 하나는 40×40, 성은 실제 크기에 따라 여러 맵으로 만든다.
// 성 안 문파 본산의 입구(이정표)는 그 성을 이루는 맵 가운데 하나에 있고, 들어가면 문파 규모만큼 맵이 이어진다(g_stage.js).
// 설계: docs/맵이동_설계.md 13장
// - 성 전체(PROV.size = 한 변 맵 수×40칸)는 예전처럼 genProv로 한 번에 만든 뒤, 맵마다 40칸씩 잘라 보여 준다. 길·강·호수가 맵 경계를 넘어 이어진다.
// - 이웃 맵으로는 가장자리를 걸어 나가면 바로 넘어간다(출입구 없이). 성끼리·본산·개봉 출입구는 그 자리가 든 맵에 있다.
// - 'pv_성' 지역은 성 전체의 설계도로 남는다. 그곳으로 가는 출입구·저장은 좌표로 알맞은 맵으로 바꿔 보낸다.
const PV_W=40;
const pvWin=(k,c,r)=>`pv_${k}@${c},${r}`;
const isPvFull=id=>!!id&&/^pv_[a-z]+$/.test(id)&&!!REGIONS[id];
function pvSplitAt(id,x,y){const k=REGIONS[id].prov,n=PROV[k].cols,c=clamp(Math.floor(x/PV_W),0,n-1),r=clamp(Math.floor(y/PV_W),0,n-1);
  return{id:pvWin(k,c,r),x:clamp(x-c*PV_W,.6,PV_W-.6),y:clamp(y-r*PV_W,.6,PV_W-.6)}}
// 맵 이름: 성 이름 + 방위 (가운데 셋째는 방위 없음). 같은 이름이 겹치면 번호를 붙인다
function pvWinName(p,c,r){if(p.cols<=1)return p.n;const f=t=>t<1/3?0:t>2/3?2:1,nm=(c,r)=>`${p.n} ${['북','','남'][f((r+.5)/p.cols)]+['서','','동'][f((c+.5)/p.cols)]||'중'}부`;
  const same=[];for(let j=0;j<p.cols;j++)for(let i=0;i<p.cols;i++)if(nm(i,j)===nm(c,r))same.push(i+','+j);return same.length>1?`${nm(c,r)} ${same.indexOf(c+','+r)+1}`:nm(c,r)}
// 성 전체 그림을 한 장만 들고 있는다 (같은 성 안에서 맵을 옮겨 다닐 때 다시 만들지 않는다)
const PV_CACHE={k:null};
function pvFull(k){
  if(PV_CACHE.k===k)return PV_CACHE;const F=REGIONS[pvId(k)];F.gen();
  Object.assign(PV_CACHE,{k,S:N,map,objs,lamps,builds,rails,nodes,tents,plots});return PV_CACHE}
function pvSlice(k,c,r){
  const F=pvFull(k),ox=c*PV_W,oy=r*PV_W,inW=(x,y)=>x>=ox&&y>=oy&&x<ox+PV_W&&y<oy+PV_W,sh=o=>({...o,x:o.x-ox,y:o.y-oy});
  N=PV_W;map=[];objs=[];for(let y=0;y<N;y++){map[y]=F.map[y+oy].slice(ox,ox+N);objs[y]=F.objs[y+oy].slice(ox,ox+N)}
  lamps=F.lamps.filter(o=>inW(o.x,o.y)).map(sh);rails=F.rails.filter(o=>inW(o.x,o.y)).map(sh);tents=F.tents.filter(o=>inW(o.x,o.y)).map(sh);
  builds=F.builds.filter(b=>b.x<ox+N&&b.x+b.w>ox&&b.y<oy+N&&b.y+b.h>oy).map(sh);nodes=F.nodes.filter(o=>inW(o.x,o.y)).map(sh);plots=[]}
for(const[k,p]of Object.entries(PROV)){
  const F=REGIONS[pvId(k)];
  for(let r=0;r<p.cols;r++)for(let c=0;c<p.cols;c++){const ox=c*PV_W,oy=r*PV_W,inW=(x,y)=>x>=ox&&y>=oy&&x<ox+PV_W&&y<oy+PV_W;
    REGIONS[pvWin(k,c,r)]={name:pvWinName(p,c,r),prov:k,win:{k,c,r},size:PV_W,theme:p.th,
      gen:()=>pvSlice(k,c,r),bake:()=>bakeHQ(PV_PAINT[p.th]||p.th),
      // 성 전체 좌표로 만든 것들을 이 맵 좌표로 옮긴다 (출입구는 연결이 끝난 뒤에 아래에서 채운다)
      gates:[],npcs:(F.npcs||[]).filter(n=>inW(n.x,n.y)).map(n=>({...n,x:n.x-ox,y:n.y-oy})),
      bosses:[],spawns:F.spawns.map(([kind,cap,t,mk])=>[kind,cap,(x,y)=>t(x+ox,y+oy),mk]),
      zone:(x,y)=>F.zone(x+ox,y+oy),
      edges:{w:c>0?pvWin(k,c-1,r):null,e:c<p.cols-1?pvWin(k,c+1,r):null,n:r>0?pvWin(k,c,r-1):null,s:r<p.cols-1?pvWin(k,c,r+1):null}}}
}
// 출입구와 소굴 두목을 자리가 든 맵으로 나눠 준다. 다른 지역에서 'pv_성'으로 오는 출입구는 travel이 맞는 맵으로 바꾼다
function pvDistribute(){for(const[k,p]of Object.entries(PROV)){const F=REGIONS[pvId(k)];
  for(let r=0;r<p.cols;r++)for(let c=0;c<p.cols;c++){const W=REGIONS[pvWin(k,c,r)],ox=c*PV_W,oy=r*PV_W,inW=(x,y)=>x>=ox&&y>=oy&&x<ox+PV_W&&y<oy+PV_W;
    W.gates=F.gates.filter(g=>inW(g.x,g.y)).map(g=>({...g,x:g.x-ox,y:g.y-oy}));
    W.marks=(F.marks||[]).filter(m=>inW(m.x,m.y)).map(m=>({...m,x:m.x-ox,y:m.y-oy}));
    W.bosses=F.bosses.filter(([,x,y])=>inW(x,y)).map(([kd,x,y,t])=>[kd,x-ox,y-oy,t])}}}
pvDistribute();
{const _tr=travel;travel=function(g){if(g&&isPvFull(g.to)){const s=pvSplitAt(g.to,g.tx,g.ty);g={...g,to:s.id,tx:s.x,ty:s.y}}return _tr(g)}}
// 예전 저장(성 전체 좌표)이나 테스트가 'pv_성'을 부르면 그 좌표가 든 맵을 연다
{const _lr=loadRegion;loadRegion=function(id){
  if(isPvFull(id)){const s=pvSplitAt(id,P?P.x:0,P?P.y:0);if(P&&P.reg===id){P.reg=s.id;P.x=s.x;P.y=s.y}id=s.id}
  _lr(id);
  if(P&&P.reg===id&&REGIONS[id].win&&!walkAt(P.x,P.y)){const q=pvNearWalk(P.x,P.y);if(q){P.x=q.x;P.y=q.y}}}}
function pvNearWalk(x,y){for(let d=0;d<8;d++)for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++){const a=Math.floor(x)+i,b=Math.floor(y)+j;if(walk(a,b))return{x:a+.5,y:b+.5}}return null}
// 가장자리를 걸어 나가면 이웃 맵으로. 넘어가는 자리가 막혔으면 성 전체 그림에서 가까운 빈칸을 찾는다
function pvEdgeTick(){
  const R=REGION();if(!R||!R.edges||!P||P.hp<=0||P.traveling||P.leap||G.duel)return;
  const e=R.edges,m=.55,side=P.x<m?'w':P.x>N-m?'e':P.y<m?'n':P.y>N-m?'s':null;if(!side||!e[side])return;
  const T=REGIONS[e[side]].win,F=pvFull(T.k),fx=T.c*PV_W,fy=T.r*PV_W;
  let tx=side==='w'?PV_W-1.1:side==='e'?1.1:P.x,ty=side==='n'?PV_W-1.1:side==='s'?1.1:P.y;
  const free=(a,b)=>a>=0&&b>=0&&a<PV_W&&b<PV_W&&F.map[b+fy][a+fx].g!==2&&!F.objs[b+fy][a+fx];
  if(!free(Math.floor(tx),Math.floor(ty))){let best=null;for(let d=1;d<6&&!best;d++)for(const s of[-d,d]){const a=side==='w'||side==='e'?Math.floor(tx):Math.floor(tx)+s,b=side==='n'||side==='s'?Math.floor(ty):Math.floor(ty)+s;if(free(a,b)){best={x:a+.5,y:b+.5};break}}
    if(!best){P.x=clamp(P.x,m+.1,N-m-.1);P.y=clamp(P.y,m+.1,N-m-.1);return}tx=best.x;ty=best.y}
  P.path=null;P.target=null;travel({to:e[side],tx,ty,edge:1})}
{const _gt=gateTick;gateTick=function(){_gt();if(!P||P.traveling)return;if(!P.gateLock)pvEdgeTick()}}
// 이웃 맵이 있는 가장자리에 가까이 가면 경계에 빛줄과 이웃 맵 이름을 띄운다
function pvEdgeHints(){const e=REGION().edges,out=[];if(!P)return out;const near=6,q=v=>clamp(v,3,N-3);
  if(e.w&&P.x<near)out.push({x:.3,y:q(P.y),dx:0,dy:1,to:e.w,ar:'←'});if(e.e&&P.x>N-near)out.push({x:N-.3,y:q(P.y),dx:0,dy:1,to:e.e,ar:'→'});
  if(e.n&&P.y<near)out.push({x:q(P.x),y:.3,dx:1,dy:0,to:e.n,ar:'↑'});if(e.s&&P.y>N-near)out.push({x:q(P.x),y:N-.3,dx:1,dy:0,to:e.s,ar:'↓'});return out}
function drawEdgeHint(h){const a=.35+.2*Math.sin(time*3),p0=toScreen(h.x-h.dx*3,h.y-h.dy*3),p1=toScreen(h.x+h.dx*3,h.y+h.dy*3),pm=toScreen(h.x,h.y);
  ctx.save();ctx.strokeStyle=`rgba(255,220,140,${a})`;ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke();ctx.restore();
  ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';const s=`${h.ar} ${REGIONS[h.to].name}`;ctx.fillStyle='#000';ctx.fillText(s,pm.x+1,pm.y-11);ctx.fillStyle='#ffe2a0';ctx.fillText(s,pm.x,pm.y-12)}

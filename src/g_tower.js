// ================= 여러 층 누각 (v179, 사용자 2026-10-26) =================
// "이런 식의 여러 층으로 구성된 전각도 추가하고 내부에서 윗층 아래층으로 이동 가능하게" (상해 예원 누각 사진)
// - 바깥: 건물에 fl(층 수)이 있으면 r_build.js drawTowerVec가 층마다 처마를 두른 누각으로 그린다.
// - 안: 1층은 원래 전각 맵(hallAdd). 2층부터 '<전각 id>_<층>f' 맵을 새로 만든다. 문은 없고 계단만 있다.
//   계단은 뒷벽 쪽 두 칸(stairU 올라가는 계단 / stairD 내려가는 구멍), 그 앞에 서 있으면 다른 층으로 간다(출입구 door:1).
//   1층에서 왼쪽으로 오르면 2층 왼쪽에 닿고, 2층의 다음 계단은 오른쪽(층마다 번갈아).
// - 성도 객잔은 3층(2층 주루, 3층 전망대), 고을 객잔은 2층, 개봉 객잔 3층. data/tower.json TOWER.
// 테스트: tests/t115_tower.js
const TOWER=GD.TOWER;
const towerFid=(hid,k)=>k<=1?hid:`${hid}_${k}f`;
const towerSide=k=>k%2?'L':'R';   // k층에서 올라가는 계단 자리
// 계단 두 칸과 그 앞 출입구 자리
function towerSpot(side,w){const x=side==='L'?2:w-4;return{tiles:[[x,1],[x+1,1]],gx:x+1.5,gy:2.7}}
function towerStair(hid,k,n,w){const out=[];
  if(k<n){const s=towerSpot(towerSide(k),w),t=towerSpot(towerSide(k),w);out.push({kind:'stairU',s,to:towerFid(hid,k+1),tx:t.gx,ty:t.gy+1.3,label:TOWER.up.replace('{n}',k+1)})}
  if(k>1){const s=towerSpot(towerSide(k-1),w);out.push({kind:'stairD',s,to:towerFid(hid,k-1),tx:s.gx,ty:s.gy+1.3,label:TOWER.down.replace('{n}',k-1)})}
  return out}
// 계단 칸을 놓고 앞자리를 비운다 (gen 뒤에 부른다)
function towerPlace(st){for(const o of st){for(const[x,y]of o.s.tiles)objs[y][x]=o.kind;
  const fx=Math.floor(o.s.gx),fy=Math.floor(o.s.gy);for(const[x,y]of[[fx,fy],[fx,fy+1]])if(objs[y]&&objs[y][x]&&objs[y][x]!=='wall'){if(objs[y][x]==='lamp')lamps=lamps.filter(l=>Math.floor(l.x)!==x||Math.floor(l.y)!==y);objs[y][x]=null}}}
// 위층 가구: 2층 주루는 탁자와 술독, 꼭대기는 의자와 탁자 몇
function towerFurnish(k,n,w,h){const mid=Math.floor(w/2),put=(o,x,y)=>{if(x>0&&y>2&&x<w-1&&y<h-1&&!objs[y][x])objs[y][x]=o};
  if(k<n){for(const[x,y]of[[3,5],[w-4,5],[3,h-4],[w-4,h-4],[mid-2,7],[mid+2,7]])put('table',x,y);put('jar',1,4);put('jar',1,5);put('kettle',w-3,h-3)}
  else{put('table',mid,5);put('seat',mid-1,5);put('seat',mid+1,5);put('table',3,h-4);put('table',w-4,h-4);put('altar',mid,3)}}
const TOWERS=[];
function towerAdd(hid,n){const R1=REGIONS[hid];if(!R1||n<2||R1.tower)return;const c1=R1.hall,w=c1.w,h=c1.h,mid=Math.floor(w/2),name=R1.name;
  TOWERS.push(hid);R1.tower={k:1,n,hid};
  const st1=towerStair(hid,1,n,w);{const g0=R1.gen;R1.gen=()=>{g0();towerPlace(st1)}}
  for(const o of st1)R1.gates.push({x:o.s.gx,y:o.s.gy,to:o.to,tx:o.tx,ty:o.ty,label:o.label,door:1,stair:1});
  for(let k=2;k<=n;k++){const id=towerFid(hid,k),c={...c1,npcs:[],kit:'tower',seed:(c1.seed||1)+k*7},st=towerStair(hid,k,n,w);
    const R=hallRegion(id,`${name} ${TOWER.names[k]||k+'층'}`,c);R.tower={k,n,hid};
    R.gen=()=>{genHall(c);objs[h-1][mid]='wall';towerPlace(st);towerFurnish(k,n,w,h)};
    R.gates=st.map(o=>({x:o.s.gx,y:o.s.gy,to:o.to,tx:o.tx,ty:o.ty,label:o.label,door:1,stair:1}));
    // 바깥 지역(성도·개봉)은 1층 문이 이끄는 곳
    R.outer=c1.out}}
// 성도·고을 객잔(건물 0번)과 개봉 객잔
for(const[id,R]of Object.entries(REGIONS)){if(!R.city||!R.stage||!R.stage.builds[0])continue;const n=TOWER.floors[R.city==='cap'?'cap':'town'];
  R.stage.builds[0].fl=n;towerAdd(hallId(id,0),n)}
towerAdd(hallId('gaebong',0),TOWER.floors.gaebong);
// 꼭대기 층에 오르면 풍경 한 줄
hook('regionLoaded',id=>{const R=REGIONS[id];if(!P||!R||!R.tower||R.tower.k!==R.tower.n)return;
  const out=REGIONS[R.outer];log(TOWER.view[Math.floor(time)%TOWER.view.length].replace('{city}',out?out.name:'성'),'sys')});
// 맵을 옮기면 지난 맵 사람의 말풍선은 지운다 (객잔 1층 손님 말이 위층에 떠 있지 않게)
hook('loadRegion',()=>{gycBub.length=0});

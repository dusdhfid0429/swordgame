// ================= 무림전도의 도시·명소·산·지형을 성 맵 제자리에 =================
// 사용자 요청(2026-10-09): 탄마 중국무림전도 왼쪽 아래 아이콘 설명(주요도시·명소·산이름·주요문파·성이름·주요지형)대로
// 지도 위의 주요 도시, 산, 명소 등을 그 자리에 해당하는 성 맵에 놓는다. 문파 본산 입구도 지도 위 문파 자리로 옮긴다.
// 설계: docs/맵이동_설계.md 14장
// - 자리는 무림전도 원본(6000×4000) 픽셀 좌표. 성마다 지도에서 차지하는 테두리(LM_BOX)를 성 전체 맵(맵 수×40칸)에 맞춰 옮긴다.
// - 게임에 없는 성(산서·녕하·북경·천진·상해·중경·강서·복건·길림·흑룡강)의 땅이름은 이웃 성에 붙였다(LM_FOLD 주석).
// - 광서의 십만대산(지도에서는 마교 자리)은 마교를 신강으로 옮긴 사용자 결정(2026-10-08)에 따라 넣지 않는다.
// 종류 c 주요도시, s 명소, m 산, t 지형(l 호수, d 사막, 그 밖은 이름만)
const LM_BOX=GD.LM_BOX;
const LM_SECT=GD.LM_SECT;
const LM_DATA=GD.LM_DATA;
const LM_KIND=GD.LM_KIND;
// 원본 좌표 → 성 전체 맵 칸 (가장자리 6칸 안쪽)
function lmTile(k,x,y,S){const B=LM_BOX[k],u=clamp((x-B[0])/(B[2]-B[0]),0,1),v=clamp((y-B[1])/(B[3]-B[1]),0,1);return{x:6+u*(S-12),y:6+v*(S-12)}}
// 다른 것들과 떨어진 빈자리를 가까운 곳부터 찾는다
function lmFree(x,y,S,taken,gap){let best=null,bd=-1;
  for(let d=0;d<=14;d++)for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++){if(Math.max(Math.abs(i),Math.abs(j))!==d)continue;
    const q={x:Math.floor(x)+i+.5,y:Math.floor(y)+j+.5};if(q.x<6||q.y<6||q.x>S-6||q.y>S-6||Math.hypot(q.x-S/2,q.y-S/2)<7)continue;
    const m=Math.min(99,...taken.map(t=>Math.hypot(t.x-q.x,t.y-q.y)-(t.gap||0)));if(m>=gap)return q;if(m>bd){bd=m;best=q}}
  return best||{x:Math.floor(x)+.5,y:Math.floor(y)+.5}}
// 문파 본산 입구: 지도 위 문파 자리. 자리가 없는 문파(지도에 없는 창작 문파·마교)는 null → 예전처럼 정한다
function lmSectSpot(k,sid,S,taken){const s=LM_SECT[sid];if(!s)return null;const t=lmTile(k,s[0],s[1],S);return lmFree(t.x,t.y,S,taken,6)}
// 땅이름 자리: 출입구·소굴·다른 땅이름과 겹치지 않게. 산·호수·사막은 둘레가 넓어 조금 더 띄운다
function lmPlace(k,S,R){const taken=[...R.gates.filter(g=>g.inner),...(R.lairs||[]).map(l=>({x:l.x,y:l.y,gap:3}))],out=[];
  for(const[n,t,x,y]of LM_DATA[k]||[]){const p=lmTile(k,x,y,S),wide=t==='m'||t==='tl'||t==='td';const q=lmFree(p.x,p.y,S,taken,wide?6:5);
    const m={n,t:t[0],sub:t[1]||'',sx:x,sy:y,x:q.x,y:q.y,r:t==='td'?6:wide?4:t==='t'?7:t==='c'?5:3};out.push(m);taken.push({x:q.x,y:q.y,gap:wide?1:0})}
  return out}
const lmNear=(R,x,y)=>{let b=null,bd=99;for(const m of R.marks||[]){const d=Math.hypot(m.x-x,m.y-y);if(d<m.r&&d<bd){bd=d;b=m}}return b};
// 성 지도를 만들 때 땅이름을 그린다 (길과 출입구 둘레는 건드리지 않는다)
function lmPaint(R,S,T,road,r){
  const gates=R.gates,nearGate=(x,y,d)=>gates.some(g=>Math.hypot(g.x-x-.5,g.y-y-.5)<d),inside=(x,y)=>x>1&&y>1&&x<S-2&&y<S-2;
  const near=(x,y)=>[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>road.has((x+dx)+','+(y+dy)));
  for(const m of R.marks||[]){const cx=Math.floor(m.x),cy=Math.floor(m.y);
    if(m.t==='m'){ // 산: 바위 바닥이 솟고 둘레에 바위와 소나무
      for(let j=cy-4;j<=cy+4;j++)for(let i=cx-4;i<=cx+4;i++){if(!inside(i,j))continue;const d=Math.hypot(i-cx,j-cy);if(d>4.2)continue;const t=map[j][i];if(t.g===2||t.g===3)continue;
        if(!road.has(i+','+j)&&d<3.2)t.g=T.base===8||T.alt===8?8:6;
        const o=objs[j][i],keep=o&&(o==='B'||o==='lamp'||o==='tent'||o.startsWith('flag'));if(!keep&&!near(i,j)&&!nearGate(i,j,2.6)&&d>1.2){const v=r();objs[j][i]=v<.34?'rock':v<.5?'pine':null}}
      if(!road.has(cx+','+cy)&&!objs[cy][cx]&&!nearGate(cx,cy,2.6))objs[cy][cx]='rock'}
    else if(m.t==='t'&&m.sub==='l'){ // 호수
      const rx=3.6,ry=2.6;for(let j=cy-4;j<=cy+4;j++)for(let i=cx-5;i<=cx+5;i++){if(!inside(i,j)||nearGate(i,j,3))continue;
        if(((i-cx)/rx)**2+((j-cy)/ry)**2<1){map[j][i].g=road.has(i+','+j)?3:2;if(!road.has(i+','+j))objs[j][i]=null}}}
    else if(m.t==='t'&&m.sub==='d'){ // 사막: 모래 바닥, 나무 대신 바위 몇 개
      for(let j=cy-6;j<=cy+6;j++)for(let i=cx-6;i<=cx+6;i++){if(!inside(i,j)||Math.hypot(i-cx,j-cy)>6+fbm(i*.4,j*.4)*1.5)continue;const t=map[j][i];if(t.g===2)continue;
        if(!road.has(i+','+j))t.g=12;if(objs[j][i]&&objs[j][i]!=='rock'&&objs[j][i]!=='B'&&!objs[j][i].startsWith('flag'))objs[j][i]=null}}
    else if(m.t==='c'||m.t==='s'){ // 도시·명소: 돌 마당과 전각
      const w=m.gate?1:m.t==='c'?3:2;for(let j=cy-w;j<=cy+w;j++)for(let i=cx-w-1;i<=cx+w+1;i++){if(!inside(i,j)||nearGate(i,j,2))continue;const t=map[j][i];if(t.g===2)continue;
        t.g=road.has(i+','+j)?1:4;if(objs[j][i]&&!String(objs[j][i]).startsWith('flag'))objs[j][i]=null}
      const pass=/관$/.test(m.n),cave=/석굴|용문/.test(m.n);
      const list=m.gate?[]:m.t==='c'?[{x:cx-3,y:cy-3,w:2,h:2,kind:'house'},{x:cx+1,y:cy-3,w:3,h:2,kind:'hall'},{x:cx-3,y:cy+1,w:2,h:2,kind:'house'}]
        :[{x:cx-1,y:cy-2,w:2,h:pass?1:2,kind:pass?'hall':cave?'temple':m.n.includes('묘')?'temple':'pavilion'}];
      for(const b of list){let ok=true;for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)if(!inside(i,j)||road.has(i+','+j)||map[j][i].g===2||map[j][i].g===3||nearGate(i,j,2.2)||objs[j][i])ok=false;
        if(!ok)continue;for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++){objs[j][i]='B';map[j][i].g=4}builds.push({...b,lm:m.n})}
      for(const[dx,dy]of m.t==='c'?[[-1,1],[2,1]]:[[1,1]]){const x=cx+dx,y=cy+dy;if(inside(x,y)&&!road.has(x+','+y)&&!objs[y][x]&&map[y][x].g!==2){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}}
      if(cave)for(const[dx,dy]of[[-2,-2],[2,-2],[-2,-1],[2,-1]]){const x=cx+dx,y=cy+dy;if(inside(x,y)&&!road.has(x+','+y)&&!objs[y][x])objs[y][x]='rock'}}}}
// 땅이름 글씨: 가까이 가면 그 자리 위에 이름을 띄운다 (종류마다 범례 색)
const LM_COL=GD.LM_COL;
function lmHints(){const R=REGION();if(!R.marks||!P)return[];return R.marks.filter(m=>!m.gate&&Math.hypot(m.x-P.x,m.y-P.y)<12)}
function drawLmName(m){const p=toScreen(m.x,m.y),a=clamp(1.4-Math.hypot(m.x-P.x,m.y-P.y)/10,.25,1),s=(m.t==='m'?'▲ ':m.t==='c'?'◆ ':m.t==='s'?'● ':'')+m.n;
  ctx.save();ctx.globalAlpha=a;ctx.font=(m.t==='c'||m.t==='t'?'bold 14px':'13px')+' "Gowun Dodum",sans-serif';ctx.textAlign='center';const y=p.y-(m.t==='m'?70:m.t==='c'?84:m.t==='s'?62:20);
  ctx.fillStyle='#000';ctx.fillText(s,p.x+1,y+1);ctx.fillStyle=LM_COL[m.t];ctx.fillText(s,p.x,y);ctx.restore()}
// 천하 지도 창: 성에 있는 땅이름을 종류별로
function lmInfo(R){const ms=R.marks||[];if(!ms.length)return'';
  return['c','m','s','t'].map(t=>{const l=ms.filter(m=>m.t===t);return l.length?`<p class="note"><b style="color:${LM_COL[t]}">${LM_KIND[t]}</b>: ${l.map(m=>m.n).join(' · ')}</p>`:''}).join('')}

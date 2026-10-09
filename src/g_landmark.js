// ================= 무림전도의 도시·명소·산·지형을 성 맵 제자리에 =================
// 사용자 요청(2026-10-09): 탄마 중국무림전도 왼쪽 아래 아이콘 설명(주요도시·명소·산이름·주요문파·성이름·주요지형)대로
// 지도 위의 주요 도시, 산, 명소 등을 그 자리에 해당하는 성 맵에 놓는다. 문파 본산 입구도 지도 위 문파 자리로 옮긴다.
// 설계: docs/맵이동_설계.md 14장
// - 자리는 무림전도 원본(6000×4000) 픽셀 좌표. 성마다 지도에서 차지하는 테두리(LM_BOX)를 성 전체 맵(맵 수×40칸)에 맞춰 옮긴다.
// - 게임에 없는 성(산서·녕하·북경·천진·상해·중경·강서·복건·길림·흑룡강)의 땅이름은 이웃 성에 붙였다(LM_FOLD 주석).
// - 광서의 십만대산(지도에서는 마교 자리)은 마교를 신강으로 옮긴 사용자 결정(2026-10-08)에 따라 넣지 않는다.
// 종류 c 주요도시, s 명소, m 산, t 지형(l 호수, d 사막, 그 밖은 이름만)
const LM_BOX={ // [x0,y0,x1,y1] 원본 픽셀
  henan:[3600,1960,4240,2560],hebei:[3600,1240,4440,2240],shandong:[4080,1720,4680,2240],liaoning:[4440,560,5360,1680],
  anhui:[4040,2080,4440,2880],shaanxi:[3160,1600,3640,2560],gansu:[2160,1360,3400,2240],qinghai:[1920,1560,3160,2240],
  sichuan:[2480,2240,3600,3040],yunnan:[2560,2720,3360,3680],guizhou:[2960,2760,3600,3280],hubei:[3440,2360,4200,2800],
  hunan:[3520,2720,4080,3400],guangxi:[3040,3120,3840,3600],guangdong:[3680,3120,4440,3680],xinjiang:[600,600,2560,1920],
  tibet:[920,1640,2800,2800],mongol:[2600,200,4400,1700],jiangsu:[4200,2080,4800,2560],zhejiang:[4400,2440,4800,3160],
  hainan:[3360,3700,3700,4000],tianzhu:[800,2500,2240,3040]};
const LM_SECT={gaebang:[4000,2145],sama:[3820,2120],paeng:[4140,1575],eon:[4050,1790],hwangbo:[4210,1922],ak:[4125,2005],taesan:[4230,1962],
  yangga:[4110,1895],jeonjin:[4570,1810],moyong:[4685,1318],jangbaek:[4965,1250],namgung:[4295,2638],danri:[4225,2378],hwasan:[3550,2190],
  jongnam:[3550,2245],gomyo:[3475,2245],kongtong:[3335,2078],kunlun:[2360,2062],emei:[2990,2705],cheongseong:[2955,2552],dang:[3415,2560],
  ungga:[3145,2400],seolsan:[2885,2600],jeomchang:[2670,3090],yasu:[2780,3440],mudang:[3625,2420],jegal:[3810,2420],noklim:[3895,2500],
  janggang:[3605,2568],dongjeong:[3850,2812],hyeongsan:[3880,2973],haomun:[3880,3418],nabu:[4040,3400],cheonsan:[1310,978],gwangpung:[868,1168],
  taeyang:[2040,1076],podal:[1800,2552],bukhae:[2965,280],mosan:[4405,2460],sanggwan:[4475,2638],danmok:[4480,2600],bota:[4770,2610],
  cheonma:[1110,1500],haenam:[3555,3875],daeroe:[1160,2810],_gaebong:[3973,2145]};
const LM_DATA={
  henan:[['정주','c',3895,2160],['낙양','c',3793,2168],['삼문협','s',3703,2140],['함곡관','s',3754,2172],['용문','s',3790,2205],['여남','s',3970,2332],['대별산','m',3863,2368]],
  // 산서성(태원·오태산·항산·운강석굴·태항산)과 북경·천진을 하북성에
  hebei:[['북경','c',4108,1575],['천진','c',4178,1655],['산해관','s',4378,1518],['석가장','c',3965,1790],['태원','c',3803,1818],['운강석굴','s',3850,1570],
    ['항산','m',3895,1610],['오태산','m',3880,1675],['태항산','m',3925,1895]],
  shandong:[['제남','c',4177,1922],['청주','s',4140,1895],['태산','m',4197,1962],['공묘','s',4178,2040],['맹묘','s',4183,2070],['곤유산','m',4610,1810],['황하','t',4385,1780]],
  // 길림성·흑룡강성을 요녕성에
  liaoning:[['심양','c',4655,1318],['봉황산','m',4738,1455],['장백산','m',4925,1250],['장춘','c',4770,1065],['길림','c',4867,1038],['합이빈','c',4837,850]],
  // 강서성 북쪽(여산·포양호·남창)을 안휘성에
  anhui:[['합비','c',4248,2452],['봉양','s',4257,2378],['소호','tl',4270,2485],['천주산','m',4160,2570],['구화산','m',4310,2605],['황산','m',4340,2640],
    ['여산','m',4125,2722],['포양호','tl',4255,2775],['남창','c',4145,2810]],
  shaanxi:[['서안','c',3493,2212],['오장원','s',3332,2210],['화산','m',3587,2190],['태백산','m',3363,2245],['종남산','m',3510,2252],['한중','c',3318,2340]],
  // 녕하(은천·하란산)를 감숙성에
  gansu:[['옥문관','s',2235,1420],['돈황','s',2340,1468],['실크로드','s',2293,1495],['명사산','m',2338,1500],['가욕관','s',2622,1548],['기련산','m',2636,1610],
    ['란주','c',3053,2002],['공동산','m',3298,2078],['하란산','m',3248,1720],['은천','c',3272,1745]],
  qinghai:[['시달목분지','t',2170,1700],['청해호','tl',2750,1880],['서녕','c',2882,1928],['아할랍달택산','m',2333,2028],['곤륜산','m',2398,2062],['아니마경산','m',2657,2088]],
  // 중경(중경·개현)을 사천성에
  sichuan:[['성도','c',3037,2593],['청성산','m',2990,2552],['대설산','m',2920,2600],['공알산','m',2890,2677],['촉산','m',2923,2705],['아미산','m',2960,2705],
    ['검각산','m',3180,2400],['중경','c',3258,2732],['개현','s',3447,2560]],
  yunnan:[['매리설산','m',2513,2790],['점창산','m',2633,3090],['대리','s',2628,3120],['곤명','c',2867,3195],['석림','s',2950,3225],['서쌍판납','s',2643,3523],['남만','t',2650,3300]],
  guizhou:[['귀양','c',3265,3045],['범정산','m',3450,2915],['묘강','t',3520,2930],['마령하협곡','s',3140,3193]],
  hubei:[['무당산','m',3670,2420],['융중산','m',3770,2420],['녹림산','m',3855,2500],['장강삼협','s',3572,2600],['형주','c',3793,2640],['무한','c',3978,2610],
    ['동호','tl',4035,2662],['적벽','s',3938,2693]],
  // 강서성 남쪽(정강산·무공산)을 호남성에
  hunan:[['악양','c',3875,2738],['동정호','tl',3780,2765],['장가계','s',3623,2775],['장사','c',3865,2875],['형산','m',3840,2975],['정강산','m',4007,3093],['무공산','m',3975,2930]],
  guangxi:[['계림','s',3613,3193],['대요산','m',3625,3335],['남녕','c',3413,3460]],
  guangdong:[['광주','c',3912,3418],['단하산','m',3942,3205],['나부산','m',3997,3400],['향항','s',3985,3507],['오문','s',3938,3528],['주강','t',4060,3520]],
  xinjiang:[['오로목제','c',1858,972],['토로번','c',1960,1090],['화염산','m',2000,1076],['천산','m',1273,978],['객십','c',833,1168],['준갈이분지','t',1805,832],
    ['파음포로극초원','t',1578,1032],['대막','td',1460,1190],['탑리목분지','t',1458,1335],['탑극랍마간사막','td',1455,1425],['고목탑격사막','td',2118,1135],['총령','t',730,1375],
    // 무림전도에는 없지만 사용자 결정(2026-10-08)으로 마교 본거지 십만대산을 신강 남서쪽 곤륜 기슭에 둔다
    ['십만대산','m',1090,1480]],
  tibet:[['랍살','c',1833,2552],['주목랑마','m',1440,2637]],
  mongol:[['호화호특','c',3720,1495],['몽혁살리달격산','m',2930,280],['북해','tl',2935,400]],
  // 상해를 강소성에
  jiangsu:[['남경','c',4380,2425],['모산','m',4440,2460],['홍택호','tl',4340,2280],['소주','c',4560,2445],['상해','c',4635,2488],['태호','tl',4530,2495],['회수','t',4550,2180]],
  // 복건성(무이산·복주)과 삼청산을 절강성에
  zhejiang:[['항주','c',4515,2620],['서호','tl',4520,2575],['막간산','m',4483,2570],['회계산','m',4610,2655],['보타산','m',4733,2610],['주산군도','t',4790,2565],
    ['안탕산','m',4625,2800],['선하령','m',4383,2835],['삼청산','m',4340,2785],['무이산','m',4333,2900],['복주','c',4492,3068]],
  hainan:[['해구','c',3633,3758]],
  // 니박이(가덕만두)·불단(정포)을 천축에
  tianzhu:[['가덕만두','c',1233,2630],['정포','c',1645,2752]]};
const LM_KIND={c:'주요도시',s:'명소',m:'산',t:'지형'};
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
const LM_COL={c:'#f2eee4',s:'#ffd27a',m:'#8fe08a',t:'#8cc8ff'};
function lmHints(){const R=REGION();if(!R.marks||!P)return[];return R.marks.filter(m=>!m.gate&&Math.hypot(m.x-P.x,m.y-P.y)<12)}
function drawLmName(m){const p=toScreen(m.x,m.y),a=clamp(1.4-Math.hypot(m.x-P.x,m.y-P.y)/10,.25,1),s=(m.t==='m'?'▲ ':m.t==='c'?'◆ ':m.t==='s'?'● ':'')+m.n;
  ctx.save();ctx.globalAlpha=a;ctx.font=(m.t==='c'||m.t==='t'?'bold 14px':'13px')+' "Gowun Dodum",sans-serif';ctx.textAlign='center';const y=p.y-(m.t==='m'?70:m.t==='c'?84:m.t==='s'?62:20);
  ctx.fillStyle='#000';ctx.fillText(s,p.x+1,y+1);ctx.fillStyle=LM_COL[m.t];ctx.fillText(s,p.x,y);ctx.restore()}
// 천하 지도 창: 성에 있는 땅이름을 종류별로
function lmInfo(R){const ms=R.marks||[];if(!ms.length)return'';
  return['c','m','s','t'].map(t=>{const l=ms.filter(m=>m.t===t);return l.length?`<p class="note"><b style="color:${LM_COL[t]}">${LM_KIND[t]}</b>: ${l.map(m=>m.n).join(' · ')}</p>`:''}).join('')}

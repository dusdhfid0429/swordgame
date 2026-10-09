// ================= 도시·명소·산은 각각 40×40 맵 한 장 =================
// 사용자 결정(2026-10-09): 성 맵 안에 구역으로 그리지 말고, 화산은 화산 맵 한 장으로 만들고 그 안(산 중턱)에서 화산파 맵으로 간다.
// 설계: docs/맵이동_설계.md 15장
// - 들판(성) 맵의 그 자리에는 입구(이정표)만 있다. 들어가면 그 장소의 40×40 맵: 아래 출입구로 들어와 위로 오른다.
// - 산: 굽은 산길이 정상의 정자까지. 산 중턱 빈터에 그 산 문파의 포털(본산 첫 맵으로).
// - 도시: 성벽과 성문, 안쪽 돌 마당에 객잔·대장간·관아·민가·사당. 곁에 있는 문파(북경 → 하북팽가 등)는 성 안 북쪽 포털.
// - 명소: 마당 가운데 그 명소의 전각(관문·석굴 절·사당·정자).
// - 호수·사막 같은 지형은 들판 맵에 그대로 둔다.
// - 문파 짝: 무림전도에서 문파 표시와 80픽셀 안에 있는 산(없으면 도시·명소). 세가는 도시·명소를 먼저. 짝이 없는 문파 입구는 들판에 그대로.
const LM_SNOW=/장백산|천산|곤륜산|매리설산|대설산|주목랑마|아니마경산|아할랍달택산|몽혁살리달격산|기련산|공알산/;
const lmId=(k,i)=>`lm_${k}_${i}`;
// 산 중턱 포털 자리 (문파가 여럿이면 길 양쪽·조금 아래로)
const LM_PORTAL_M=[[5,20],[-5,20],[5,27]],LM_PORTAL_C=[[20,10],[14,10],[26,10]];
function lmMapCfg(k,i,m,p){
  const seed=9100+i*53+k.charCodeAt(0)*7+k.length*31,id=lmId(k,i),th=m.t==='m'?(LM_SNOW.test(m.n)?'snow':'peak'):PV_PAINT[p.th]||'manor';
  const base={id,name:m.n,th,seed};
  if(m.t==='m')return{...base,yard:[16,3,24,8],builds:[{x:19,y:4,w:2,h:2,kind:'pavilion'}],lamps:[[18,7],[22,7]],nodes:{herb:7,ore:6,wood:2}};
  if(m.t==='c')return{...base,th:'manor',yard:[8,7,32,30],wall:33,
    builds:[{x:9,y:9,w:3,h:2,kind:'inn'},{x:28,y:9,w:3,h:2,kind:'hall'},{x:9,y:15,w:2,h:2,kind:'house'},{x:29,y:15,w:2,h:2,kind:'house'},
      {x:9,y:21,w:2,h:3,kind:'smith'},{x:29,y:21,w:2,h:2,kind:'temple'},{x:13,y:26,w:2,h:2,kind:'house'},{x:25,y:26,w:2,h:2,kind:'house'}],
    lamps:[[17,12],[23,12],[17,24],[23,24],[16,31],[24,31]],nodes:{herb:2,ore:0,wood:2}};
  const pass=/관$/.test(m.n),cave=/석굴|용문/.test(m.n),kind=pass?'hall':cave||m.n.includes('묘')?'temple':'pavilion';
  return{...base,yard:[13,12,27,24],builds:[{x:19,y:14,w:3,h:2,kind}],lamps:[[16,18],[24,18],[16,22],[24,22]],nodes:{herb:4,ore:2,wood:2},cave}}
// 산길 x (genStage와 같은 식)
const lmRoadX=(c,y)=>ST_PATH(y,c.seed%7*.9,c.yard?c.yard[3]:12,38);
for(const[k,p]of Object.entries(PROV)){const F=REGIONS[pvId(k)];
  (F.marks||[]).forEach((m,i)=>{if(m.t==='t')return;
    const c=lmMapCfg(k,i,m,p),id=c.id;m.gate=id;
    // 문파 포털 자리를 미리 비워 두고, 석굴은 둘레에 바위
    const portals=[];c.portals=portals;
    const R={name:m.n,prov:k,lm:m,theme:c.th,size:40,stage:c,
      gen:()=>{genStage(c);
        for(const q of portals){const x=Math.floor(q.x),y=Math.floor(q.y);
          for(let j=y-1;j<=y+1;j++)for(let i2=x-1;i2<=x+1;i2++){if(objs[j][i2]&&objs[j][i2]!=='B')objs[j][i2]=null;if(map[j][i2].g===2)map[j][i2].g=6;if(map[j][i2].g!==1)map[j][i2].g=4}
          // 길에서 포털까지 디딤돌
          if(m.t==='m'){const rx=lmRoadX(c,y),a=Math.min(rx,x),b=Math.max(rx+1,x);for(let i2=a;i2<=b;i2++){if(objs[y][i2]!=='B')objs[y][i2]=null;if(map[y][i2].g!==4)map[y][i2].g=1}}
          if(q.s)placeFlags(q.s,[[x-2,y-1],[x+2,y-1]])}
        if(c.cave)for(const[x,y]of[[17,13],[23,13],[17,15],[23,15]])if(!objs[y][x])objs[y][x]='rock'},
      bake:()=>bakeHQ(c.th),
      zone:(x,y)=>m.t==='m'?(y<=9?`${m.n} 정상`:portals.some(q=>Math.hypot(q.x-x,q.y-y)<5)?`${m.n} 중턱 · ${portals.find(q=>Math.hypot(q.x-x,q.y-y)<5).label} 가는 길`:y>=30?`${m.n} 기슭`:`${m.n} 산길`)
        :m.t==='c'?(y>=33?`${m.n} 성문 밖`:`${m.n} 성내`):m.n,
      spawns:m.t==='m'?[...(PV_BEAST[p.th]||[]).map(([b,n])=>[b,n,(x,y)=>y>10]),['산적',2,(x,y)=>y>12&&y<32]]
        :m.t==='c'?[['양민',4,(x,y)=>y>8&&y<31]]:(PV_BEAST[p.th]||[]).slice(0,1).map(([b,n])=>[b,n,(x,y)=>y>26||y<10]),
      bosses:[],npcs:[],
      gates:[{x:20.5,y:38.6,to:pvId(k),tx:m.x,ty:m.y+2.4,label:p.n}]};
    REGIONS[id]=R;
    F.gates.push({x:m.x,y:m.y,to:id,tx:20.5,ty:36.2,label:m.n,inner:1,lm:1})})}
// 문파를 짝 장소 맵 안 포털로 옮긴다
function lmPair(sid,k){const s=LM_SECT[sid];if(!s)return null;const F=REGIONS[pvId(k)];let best=null,bd=80;
  // 세가(가문)는 도시·명소를 먼저, 나머지는 산을 먼저 찾는다
  const fam=/세가$|가$|양가장/.test(SECTS[sid].n);
  for(const pass of fam?['cs','m']:['m','cs']){for(const m of F.marks||[])if(m.gate&&pass.includes(m.t)){const d=Math.hypot(m.sx-s[0],m.sy-s[1]);if(d<bd){bd=d;best=m}}if(best)break}
  return best}
for(const[k,p]of Object.entries(PROV))for(const sid of p.sects){const m=lmPair(sid,k);if(!m)continue;
  const s=SECTS[sid],first=(REGIONS[hqId(s)].chain||[hqId(s)])[0],F=REGIONS[pvId(k)],L=REGIONS[m.gate],c=L.stage;
  const n=c.portals.length,slot=(m.t==='m'?LM_PORTAL_M:LM_PORTAL_C)[Math.min(n,2)];
  const x=m.t==='m'?lmRoadX(c,slot[1])+slot[0]+.5:slot[0]+.5,y=slot[1]+.5,label=s.n;
  c.portals.push({x,y,s:sid,label});
  L.gates.push({x,y,to:first,tx:20.5,ty:36.2,label,portal:1});
  F.gates=F.gates.filter(g=>g.to!==first);
  for(const g of REGIONS[first].gates)if(g.to===pvId(k)){g.to=m.gate;g.tx=x;g.ty=y+2;g.label=m.n}
  REGIONS[first].lmVia=m.gate}

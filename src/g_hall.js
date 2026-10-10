// ================= 전각: 이름 있는 건물과 들어갈 수 있는 내부 맵 =================
// 사용자 요청(2026-10-09): 본산에 가면 볼 게 없다. 화산파라면 자소궁·태청궁·매화봉처럼 전각이 여럿이고,
// 건물에 들어갈 수 있어야 하며, 문이 포털이 되어 내부 맵으로 가고, 장문인 같은 NPC는 건물 안에 있어야 한다.
// - 전각 이름: data/sects.json HALLS[문파] = [본전, 왼쪽 전각, 오른쪽 전각, 외원 연무청, 외원 객청, 후산 정자]. 없으면 HALL_DEF(파·가·그 밖).
// - 내부 맵: 지역 id 'in_<바깥 지역>_<건물 번호>'. 나무 바닥(바닥 13), 둘레 담(wall), 기둥(pillar), 뒤쪽 병풍(screen), 등롱.
//   아래 가운데 문으로 드나든다. 바깥 맵에서는 건물 앞문 자리(door:1 출입구)에 서면 들어간다.
// - NPC 옮기기: 바깥 맵 npcs 가운데 id가 맞는 사람(장문인 hq, 총관 steward, 장로 elder, 당주 dang_*, 객잔 inn, 대장장이 smith)을 안으로 들인다.
// 설계: docs/세력_문파_설계.md 19장. 테스트: tests/t36_hall.js
const HALLS=GD.HALLS,HALL_DEF=GD.HALL_DEF;
function hallNames(s){return HALLS[s.id]||(/파$|교$|문$/.test(s.n)?HALL_DEF['파']:/가$|장$/.test(s.n)?HALL_DEF['가']:HALL_DEF.default)}
const hallId=(reg,bi)=>`in_${reg}_${bi}`;
// 지역 reg 의 장문인: 바깥 맵에 있으면 그 사람, 전각 안이면 안의 사람. 테스트와 안내문이 쓴다
const findNpc=(reg,pred)=>{const R=REGIONS[reg];if(!R)return null;const f=L=>L&&L.find(pred);return f(R.npcs)||(R.halls||[]).map(h=>f(REGIONS[h.id].npcs)).find(Boolean)||null};
const hqNpc=reg=>findNpc(reg,n=>n.hq);
const npcsOf=reg=>{const R=REGIONS[reg];return R?[...R.npcs,...(R.halls||[]).flatMap(h=>REGIONS[h.id].npcs)]:[]};
// 내부 맵 그리기. c: {w,h,mg(마교: 검은 벽·붉은 기둥),npcs}
function genHall(c){
  N=c.w;NH=c.h;const r=rng(c.seed||1);map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const mid=Math.floor(N/2);
  for(let y=0;y<NH;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){
    const edge=x===0||y===0||x===N-1||y===NH-1;map[y][x]={g:13,v:r()};
    objs[y][x]=edge&&!(y===NH-1&&x===mid)?'wall':null}}
  for(const[x,y]of[[2,2],[N-3,2],[2,NH-3],[N-3,NH-3]])objs[y][x]='pillar';
  for(let x=mid-1;x<=mid+1;x++)objs[1][x]='screen';
  for(const[x,y]of[[mid-3,2],[mid+3,2]])if(x>2&&x<N-3){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  hallFurnish(c,mid);
}
// 건물 용도(kit)에 맞는 가구. 문 앞 가운데 길과 NPC 자리는 비워 둔다 (r_furn.js 가 그린다)
// kit: inn 객잔·객청 / smith 대장간·병기당 / shop 잡화점 / pharm 약방·약당·단방 / cloth 포목점 / store 창고·병기고 / office 관아·서재 /
//      shrine 사당 / hall 본전 / library 장경각 / drill 연무청·당 / room 승방 / armory 검각
function hallKit(name,ids){
  if(/객잔|객청/.test(name)||ids.includes('inn'))return'inn';if(/대장간|병기당/.test(name)||ids.includes('smith'))return'smith';
  if(/잡화/.test(name)||ids.includes('gen'))return'shop';if(/약|단방|의원/.test(name)||ids.includes('pharm'))return'pharm';if(/포목/.test(name)||ids.includes('cloth'))return'cloth';
  if(/창고|선창/.test(name)||ids.includes('bank'))return'store';if(/병기고|검각|무기/.test(name))return'armory';if(/관아|총타|취의청/.test(name))return'office';if(/사당|사$/.test(name))return'shrine';
  if(/장경각|서재|서각|문각|경각/.test(name))return'library';if(/연무/.test(name)||ids.some(i=>i.startsWith('dang_')))return'drill';if(/승방|침소/.test(name))return'room';
  if(ids.includes('hq'))return'hall';if(ids.includes('elder'))return'library';if(ids.includes('steward'))return'office';return'hall'}
function hallFurnish(c,mid){const kit=c.kit||'hall',W=N,H=NH;
  const keep=(x,y)=>(x===mid&&y>=H-6)||(y===3&&Math.abs(x-mid)<=1)||(y===4&&(Math.abs(x-mid)===3||Math.abs(x-mid)<=1));
  const put=(k,x,y)=>{if(x>0&&y>0&&x<W-1&&y<H-1&&!objs[y][x]&&!keep(x,y)){objs[y][x]=k;return true}return false};
  const L=1,R=W-3,B=2,F=H-3;   // 왼쪽 벽 안쪽, 오른쪽 벽에서 한 칸 띄움(벽 앞면에 가려지지 않게), 뒷줄, 앞줄
  const wallL=(k,n,y0=3)=>{for(let y=y0;y<y0+n&&y<=H-3;y++)put(k,L,y)},wallR=(k,n,y0=3)=>{for(let y=y0;y<y0+n&&y<=H-3;y++)put(k,R,y)};
  const back=(k,n,side=1)=>{for(let i=0;i<n;i++)put(k,mid+side*(2+i),B)};
  const floor=(k)=>{put(k,3,F-1);put(k,W-4,F-1);if(H>=12){put(k,3,6);put(k,W-4,6)}};
  switch(kit){
  case'inn':back('counter',2,1);wallL('jar',3);floor('table');wallR('bed',2);put('kettle',L,H-4);break;
  case'smith':put('forge',R,3);put('anvil',R-1,4);wallL('rack',2);put('chest',L,H-3);put('jar',L,5);back('counter',1,-1);break;
  case'shop':back('counter',2,1);wallL('shelf',3);wallR('chest',2);put('jar',R,5);put('bolts',L,H-3);break;
  case'pharm':back('cabinet',2,-1);back('counter',1,1);wallL('cabinet',3);wallR('jar',3);put('kettle',R,H-3);break;
  case'cloth':back('counter',2,1);wallL('bolts',3);wallR('bolts',3);put('chest',L,H-3);put('table',W-4,F-1);break;
  case'store':wallL('chest',4);wallR('chest',4);back('chest',2,1);back('chest',2,-1);put('jar',3,F-1);put('jar',W-4,F-1);break;
  case'armory':wallL('rack',3);wallR('rack',3);back('chest',2,1);back('chest',2,-1);put('anvil',W-4,F-1);break;
  case'office':put('desk',mid,2);put('seat',mid,1)||put('seat',mid+1,2);wallL('shelf',2);wallR('cabinet',2);put('chest',L,H-3);put('table',W-4,F-1);break;
  case'shrine':put('altar',mid,2);put('altar',mid-1,2);put('altar',mid+1,2);wallL('jar',2);wallR('jar',2);put('table',3,F-1);put('table',W-4,F-1);break;
  case'hall':put('seat',mid,2);put('desk',mid-1,2);put('desk',mid+1,2);wallL('shelf',2);wallR('rack',2);floor('table');if(c.ochre){put('altar',mid-2,2);put('altar',mid+2,2)}break;
  case'library':back('shelf',3,1);back('shelf',3,-1);wallL('shelf',4);wallR('shelf',4);put('desk',mid,2);put('table',3,F-1);put('table',W-4,F-1);break;
  case'drill':wallL('rack',3);wallR('rack',3);back('rack',2,1);back('rack',2,-1);put('chest',L,H-3);put('chest',R,H-3);break;
  case'room':wallL('bed',2);wallR('bed',2);put('bed',L,H-3);put('bed',R,H-3);put('table',mid,F-1);put('jar',3,F-1);break}
  // 마교 전각은 검은 벽이라 가구도 어둡게 그린다 (drawFurn 의 mg)
}
// 내부 맵의 바닥 그림: 나무 바닥만이라 bakeHQ 로 굽되 가장자리 어둡게 하지 않는다
const hallRegion=(id,name,c)=>{const R={name,in:1,hall:c,theme:c.mg?'dark':'hall',size:c.w,h:c.h,gen:()=>genHall(c),bake:()=>bakeHQ(c.mg?'dark':'hall'),
  zone:()=>name,spawns:[],bosses:[],npcs:c.npcs,gates:[{x:Math.floor(c.w/2)+.5,y:c.h-.5,to:c.out,tx:c.tx,ty:c.ty,label:c.outName,door:1}]};
  REGIONS[id]=R;return R};
// 바깥 지역 reg 의 건물 bi(builds 순서)에 이름 name 을 붙이고 내부 맵을 만든다. b: 건물 자리 {x,y,w,h}. ids: 안으로 들일 NPC id (없으면 비어 있는 전각)
function hallAdd(reg,bi,b,name,ids=[],o={}){
  const R=REGIONS[reg];if(!R)return null;const id=hallId(reg,bi),w=o.w||(b.w>=5?18:b.w>=3?14:10),h=o.h||(b.w>=5?13:b.w>=3?12:9),mid=Math.floor(w/2);
  const dx=b.x+Math.floor(b.w/2)+.5,dy=b.y+b.h+.5;   // 앞문: 앞면 가운데 칸 (r_build.js wallFace 의 문 자리)
  const inside=[],keep=[];for(const n of R.npcs||[]){if(ids.includes(n.id))inside.push(n);else keep.push(n)}
  R.npcs=keep;
  inside.forEach((n,i)=>{n.x=i===0?mid+.5:mid+.5+(i%2?-3:3);n.y=i===0?3.6:4.4});
  const c={w,h,mg:o.mg||R.stage&&R.stage.mg,seed:reg.length*31+bi,npcs:inside,out:reg,tx:dx,ty:dy+1,outName:R.name,kit:o.kit||hallKit(name,ids),ochre:!!(R.hq&&GD.SECT_STYLE[R.hq]&&GD.SECT_STYLE[R.hq].roof==='ochre')};
  hallRegion(id,`${name}`,c);
  R.halls=R.halls||[];R.halls.push({id,bi,n:name,x:dx,y:dy});
  R.gates.push({x:dx,y:dy,to:id,tx:mid+.5,ty:h-2.5,label:name,door:1});
  return id}
// ---- 문파마다 전각 이름 붙이기 ----
for(const s of Object.values(SECTS)){if(s.id==='cheonma')continue;
  const nm=hallNames(s),M=hqId(s),R=REGIONS[M];if(!R)continue;
  // 장문인 맵(genHQ): 본전 {19,5,3,2}, 왼쪽 {14,8,2,2}, 오른쪽 {25,8,2,2}
  if(!R.stage){
    // 왼쪽 전각에 비급·임무, 오른쪽 전각에 장로(패시브·보법). 소문파는 외원·후산이 없어 여기서 다 본다
    R.npcs.push({id:'steward',steward:s.id,n:`${s.n} ${nm[1]} 집사`,x:15.5,y:11.5,pal:sectPal(s.id,2,'검',{})||masterPal(s)},
      {id:'elder',elder:s.id,n:`${s.n} 장로`,x:26.5,y:11.5,pal:sectPal(s.id,4,'검',{master:1})||masterPal(s)});
    hallAdd(M,0,{x:19,y:5,w:3,h:2},nm[0],['hq']);hallAdd(M,1,{x:14,y:8,w:2,h:2},nm[1],['steward']);hallAdd(M,2,{x:25,y:8,w:2,h:2},nm[2],['elder']);
    R.zone=((z0)=>(x,y)=>inHQ(x,y)&&y<=16?`${s.n} ${nm[0]} 앞마당`:z0(x,y))(R.zone)}
  // 외원: 연무청(총관)과 객청(제자)
  const O=REGIONS[`hq_${s.id}_outer`]||(s.id==='shaolin'?REGIONS.hq_shaolin_yard:null);
  if(O&&O.stage){const bs=O.stage.builds;
    O.npcs.push({id:'disc',disc:s.id,n:`${s.n} 제자`,x:0,y:0,pal:sectPal(s.id,1,'검',{})||masterPal(s)});
    hallAdd(O.stage.id,4,bs[4],nm[3],['steward']);hallAdd(O.stage.id,5,bs[5],nm[4],['disc'])}
  // 후산 정자는 열린 정자라 이름만 (지역 이름에)
  const B=REGIONS[`hq_${s.id}_back`];if(B&&nm[5]&&!/정자$/.test(B.name))B.name=`${B.name} ${nm[5]}`;
}
// 마교: 천마신전(교주), 장로원(대장로), 오당 광장의 다섯 전각(당주), 성읍 객잔·병기당
{const K=REGIONS;
  if(K.hq_cheonma&&K.hq_cheonma.stage){hallAdd('hq_cheonma',0,{x:17,y:5,w:7,h:3},'천마신전 대전',['hq'],{mg:1,w:20,h:14})}
  if(K.hq_cheonma_6)hallAdd('hq_cheonma_6',0,{x:16,y:10,w:5,h:3},'장로원 대청',['elder'],{mg:1});
  if(K.hq_cheonma_5){Object.entries(MG_HALL).forEach(([k,[x,y]],i)=>hallAdd('hq_cheonma_5',i,{x,y,w:3,h:2},`${MDANG[k].n}`,['dang_'+k],{mg:1}))}
  if(K.hq_cheonma_3){hallAdd('hq_cheonma_3',0,{x:11,y:15,w:3,h:2},'마교 객잔',['inn'],{mg:1});hallAdd('hq_cheonma_3',1,{x:26,y:15,w:3,h:2},'병기당',['smith'],{mg:1})}}
// 제자 인사
hook('npcDlg',c=>{if(c.html==null&&c.n.disc){const s=SECTS[c.n.disc];c.html=`<p class="note">"${P.sect===s.id?`${rankName(s.id)}, 객청에서 쉬다 가십시오.`:`${s.n} 외원입니다. 가입은 본전의 ${masterTitle(s)}께 청하십시오.`}"</p>`}});
// 예전 저장: 전각 안에서 벽 속이면 문 앞으로
hook('regionLoaded',id=>{if(P&&P.reg===id&&id.startsWith('in_')&&!walkAt(P.x,P.y)){const g=REGION().gates[0];P.x=g.x;P.y=g.y-2}});

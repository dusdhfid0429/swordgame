// ================= 군부: 황제가 사는 황성과 금군 =================
// 2026-10-10 동훈님: 성도 중에 황제가 사는 지역을 만들고, 세력 구도에 군부를 더한다. 설계: docs/세력_문파_설계.md 20장
// - 북경(하북성 성도)이 황성이다. 성내 북쪽 포털 → 황성 금위영(금군 교장, 총관) → 황궁(태화전에 황제와 금군 대장군).
// - 군부(ALLY.gunbu)는 네 번째 세력. 세력 무인은 관군(FAC_KIND['관']). 정파와는 서로 건드리지 않고 사파·마교·도적과 싸운다.
//   업보 -100 아래의 죄인은 관군이 쫓는다 (g_faction.js outlaw). 금군은 군부의 유일한 문파(중견문파 틀, 직위 병졸→십장→백부장→천부장→장군).
// - 황제 알현: 명성 100 이상이거나 금군이면 뵐 수 있다. 금군 천부장 이상은 한 생에 한 번 어전 포상(어사패·은자·명성)을 받는다.
PAL.emperor={...PAL.hero,robe:['#e8c23a','#8a6a10'],robeB:'#a8841a',inner:'#8a1a1a',trim:'#f0d060',sash:'#8a1a1a',hair:'#14100e',beard:1,weapon:'none',cape:'#b8961a',jade:0,tail:0};
PAL.officer={...PAL.hero,...FAC_ROBE['관'],weapon:'spear',anim:'thrust',armor:1,jade:0,tail:0};
// 북경 성도를 황성으로 부른다
{const K=Object.keys(REGIONS).find(id=>REGIONS[id].lm&&REGIONS[id].lm.n==='북경');
  if(K){const R=REGIONS[K];R.name='북경 황성';R.capital=1;const z0=R.zone;R.zone=(x,y)=>{const z=z0(x,y);return /성내|성도$/.test(z)?'북경 황성':z};
    R.spawns=[...(R.spawns||[]),['관군',4,(x,y)=>y>8&&y<31,(x,y)=>mkFac('관',0,x,y,'geumgun')]]}}
// 황궁(hq_geumgun): 본전 태화전 안에 황제, 대장군은 그 곁에
{const M=REGIONS.hq_geumgun;if(M){M.name='황궁';const z0=M.zone;M.zone=(x,y)=>{const z=z0(x,y);return /본산/.test(z)?'황궁':/산길/.test(z)?'황성 어도':/어귀/.test(z)?'황궁 정문':z};
  const h=(M.halls||[])[0];if(h){const H=REGIONS[h.id],mid=Math.floor(H.size/2);
    for(const n of H.npcs)if(n.hq){n.x=mid+.5+3;n.y=4.4}
    H.npcs.unshift({id:'emperor',emperor:1,n:'황제',x:mid+.5,y:3.6,pal:'emperor'})}
  // 황궁 꾸미기: 넓은 포장 마당, 전각 넷, 등롱·깃발. 산장이 아니라 궁궐로 보이게
  const g0=M.gen;M.gen=()=>{g0();
    for(let y=2;y<=20;y++)for(let x=8;x<=32;x++){if(objs[y][x]==='B'||objs[y][x]==='lamp'||objs[y][x]==='flag')continue;if(map[y][x].g!==2){map[y][x].g=4;if(objs[y][x]&&objs[y][x]!=='stupa')objs[y][x]=null}}
    for(const b of[{x:9,y:12,w:3,h:2,kind:'hall'},{x:28,y:12,w:3,h:2,kind:'hall'},{x:9,y:17,w:3,h:2},{x:28,y:17,w:3,h:2}]){const q={...b,rc:'gold'};for(let j=q.y;j<q.y+q.h;j++)for(let i=q.x;i<q.x+q.w;i++)objs[j][i]='B';builds.push(q)}
    for(const[x,y]of[[12,10],[28,10],[12,20],[28,20],[18,16],[22,16]])if(!objs[y][x]){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:Math.random()*6})}
    placeFlags('geumgun',[[15,19],[25,19]]);
    for(const n of nodes.slice())if(n.x>8&&n.x<33&&n.y<21)nodes.splice(nodes.indexOf(n),1)};
  // 황궁 안팎은 관군이 지킨다. 교장과 황궁에는 금군이 많다
  M.spawns=M.spawns.filter(s=>s[0]!=='관군'&&s[0]!=='관군 교위');
  M.spawns.unshift(['관군',6,inHQ,(x,y)=>mkFac('관',0,x,y,'geumgun')],['관군 교위',2,inHQ,(x,y)=>mkFac('관',1,x,y,'geumgun')])}}
// 황제 알현
function emperorDlg(n){
  const g=P.sect==='geumgun',ri=g?rankIdx('geumgun'):-1,karma=P.good-P.evil;
  if(!g&&P.fame<100)return `<p class="note">금군이 창을 엇갈려 막는다. "명성 100도 없는 자가 어전에 들 수는 없다. 물러가라."</p>`;
  if(karma<=-100)return `<p class="note">"저 자는 조정이 쫓는 죄인이다. 잡아라!"</p><p class="note">업보가 -100 아래면 관군이 그대를 쫓는다. 선업을 쌓아 업보를 되돌려야 한다.</p>`;
  let h=`<p class="note">황제가 용상에서 내려다본다. "${g?`${rankName('geumgun')} ${esc(P.name)}, 짐의 금군이 되어 강호를 다스리라.`:`${esc(P.name)}이라 했는가. 강호에 이름이 들리더구나.`}"</p>`;
  h+=`<div class="card"><h4>군부 <small class="dim">네 번째 세력</small></h4><p class="note">관군은 사파·마교·도적을 치고, 정파와는 서로 건드리지 않는다. 금군 임무로 쌓은 공적은 금군창법·어림궁술·용양신창 비급이 된다. 금군은 황성 금위영 총관이나 황궁의 대장군에게서 들어간다.</p></div>`;
  if(g&&ri>=3){const got=P.imperial;
    h+=`<div class="card"><h4>어전 포상 <small class="dim">천부장 이상 · 한 생에 한 번</small></h4><p class="note">어사패(현묘도·내공), 은자 500, 명성 100</p>${got?'<p class="note">이미 받았다.</p>':B('imperial','포상 받기',{pri:1,d:P.bag.length>=24})}</div>`}
  else if(g)h+=`<p class="note">"공을 더 세워 천부장에 오르면 짐이 직접 상을 내리마."</p>`;
  return h}
hook('npcDlg',c=>{if(c.html==null&&c.n.emperor)c.html=emperorDlg(c.n)});
hook('sectAct',c=>{if(c.a!=='imperial')return;c.done=true;c.r=true;if(P.sect!=='geumgun'||rankIdx('geumgun')<3||P.imperial)return;
  P.imperial=1;P.silver+=500;P.fame+=100;const it=mkGear('acc','어사패',1.4,{qi:24,hm:5});P.bag.push(it);
  log('어전 포상: 어사패와 은자 500, 명성 100을 받았습니다.','xp');showBanner('어전 포상','황제의 신임');P.feats.push(`${Math.floor(P.age)}세에 황제에게 포상을 받았다`)});

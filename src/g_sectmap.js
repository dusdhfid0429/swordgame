// ================= 문파 본산 구성: 구역별 맵 · 여러 층 전각 · 각 소속 문파원 (v238, 사용자 2026-11-03) =================
// "문파의 모든 건물이 단층인 것도 별로. 문도들이 수련을 하는 연무장이 있는 맵, 재산을 관리하는 전각과 해당 각에 속한 문파원들이 있는 맵,
//  장문인이 있는 3층 전각 등 문파 규모별로 구성" → 계획 https://claude.ai/artifact/FsR7EjFK7razP8KTHNsYac
// - 대문파: 산문 → 외원(살림: 재무각 2층·의약당·객청·숙소) → 본산(장문: 장문전 3층·장로원 2층·계율당) → 후산(비전: 장경각 3층·조사당) + 대연무장(외원 왼쪽)
// - 장문전 1층 대전의 지객 장로가 입문을 받고(g_sect sjoin), 장문인은 3층 내전. 금고는 재무각 2층(g_vault vaultHall ← M.vaultAt)
// - 층마다 맵 한 장(g_tower.js towerAdd의 틀). 층 NPC는 SECTMAP.kinds[k].floors[층].npcs. 새 역할은 n.srole·n.ssid(g_vault npcRole)라 죽으면 공석·후임, 침공 땐 나선다(g_npcdef)
// - 데이터 data/sectmap.json. 시범: SECTMAP.on 문파만(화산파). 나머지 문파는 예전 구성 그대로
const SMAP=GD.SECTMAP;
const smT=s=>s.lt||s.tier;   // v239: 맵 규모(증축하면 s.lt, g_sgrow.js). 무공 등급·기준 인원은 s.tier 그대로
const smOn=s=>!!s&&!SMAP.skip.includes(s.id)&&!!SMAP.tiers[smT(s)]&&!!REGIONS[hqId(s)]&&!!HQ_THEME[s.id];
// 갈래: 불가(황토 지붕) · 개방 · 채 · 세가 · 그 밖(도가·검파)
const smStyle=s=>(GD.SECT_STYLE[s.id]||{}).roof==='ochre'?'buddha':/방$/.test(s.n)?'beggar':/채$/.test(s.n)?'fort':/가$/.test(s.n)?'clan':'dao';
function smName(s,k){const o=(SMAP.names[s.id]||{})[k];if(o)return o;if(k==='main'||k==='main2'){const h=typeof hallNames==='function'&&hallNames(s)[0];if(h&&HALLS[s.id])return h}
  if(k==='guest'&&HALLS[s.id]&&!/장경|서재|서각/.test(HALLS[s.id][4]))return HALLS[s.id][4];if(k==='pav'&&HALLS[s.id])return HALLS[s.id][5];
  return(SMAP.style[smStyle(s)]||{})[k]||SMAP.kinds[k].n}
const smRank=r=>(GD.VAULT.npc[r]||{rank:1}).rank;
// v248 갈래별 본산 모양 (SMAP.look): 개방 움막촌·녹림채 목책 산채 …
function smLook(s){const L=(SMAP.look||{})[smStyle(s)];return L&&!(L.skip||[]).includes(s.id)?L:null}
function smNpc(s,f){const id=f.id||f.role,rk=smRank(f.role),tt=(smLook(s)||{}).titles||{},n={id,n:`${s.n} ${tt[f.t]||f.t}`,pal:(typeof sectPal==='function'&&sectPal(s.id,Math.min(4,rk),'검',rk>=4?{master:1}:{}))||masterPal(s)};
  if(f.role==='elder')n.elder=s.id;else if(f.role==='steward')n.steward=s.id;else{n.srole=f.role;n.ssid=s.id}
  if(f.role==='jigak')n.jigak=s.id;return n}
// 예전 전각(내부 맵·층·문)을 걷어 낸다. 남겨 둘 사람(장문인 등)은 돌려준다
function smClear(id){const R=REGIONS[id];if(!R)return[];const out=[],gone=new Set((R.halls||[]).map(h=>h.id));
  for(const h of R.halls||[]){const H=REGIONS[h.id];if(!H)continue;out.push(...(H.npcs||[]));for(const f of H.floorIds||[]){if(REGIONS[f])out.push(...REGIONS[f].npcs);delete REGIONS[f]}
    if(H.tower){for(let k=2;k<=H.tower.n;k++)delete REGIONS[towerFid(h.id,k)];const i=TOWERS.indexOf(h.id);if(i>=0)TOWERS.splice(i,1)}delete REGIONS[h.id]}
  R.halls=[];R.gates=R.gates.filter(g=>!gone.has(g.to));return out}
// 층 맵 하나를 이 층에 맞게: 이름·가구·사람
function smFloor(hid,k,n,s,b,fd,name){const R=REGIONS[towerFid(hid,k)];if(!R)return;const c=R.hall,w=c.w,h=c.h,mid=Math.floor(w/2),st=towerStair(hid,k,n,w);
  R.name=`${name} ${fd.n||k+'층'}`;R.zone=()=>R.name;c.kit=fd.kit||'hall';c.npcs=R.npcs=(fd.npcs||[]).map(f=>{const q=smNpc(s,f);q.x=mid+.5+(f.x||0);q.y=f.y||3.6;return q});
  R.gen=()=>{genHall(c);objs[h-1][mid]='wall';towerPlace(st)};R.smFloor={sid:s.id,k:b.k,f:k};return R}
// 맵의 건물 하나를 세운다: 들어갈 수 있으면 전각 맵(1층) + 위층
function smHall(mapId,bi,b,s,keep){const K=SMAP.kinds[b.k];if(!b.door||!K.floors)return null;const R=REGIONS[mapId],name=smName(s,b.k),n=Math.min(b.fl||1,K.floors.length);
  // v248: 겉모양이 층이 적으면(움막·동굴…) 위층 사람·장문인·금고를 맨 위 층으로 모은다
  let F=K.floors;if(n<F.length){const rest=F.slice(n-1),ex=rest.slice(1).flatMap(f=>f.npcs||[]).map((f,i)=>({...f,x:(i%2?-1:1)*(3+Math.floor(i/2)*2),y:5.2}));
    F=[...F.slice(0,n-1),{...F[n-1],npcs:[...(F[n-1].npcs||[]),...ex],master:rest.some(f=>f.master),vault:rest.some(f=>f.vault)}]}
  const f0=F[0].npcs.map(smNpc.bind(null,s));R.npcs.push(...f0);
  const hid=hallAdd(mapId,bi,b,n>1?`${name} ${F[0].n}`:name,f0.map(q=>q.id),{kit:F[0].kit});const H=REGIONS[hid];H.smFloor={sid:s.id,k:b.k,f:1};
  F[0].npcs.forEach((f,i)=>{const q=H.npcs[i];if(q){q.x=Math.floor(H.hall.w/2)+.5+(f.x||0);q.y=f.y||3.6}});
  if(n>1){towerAdd(hid,n);H.floorIds=[];for(let k=2;k<=n;k++){smFloor(hid,k,n,s,b,F[k-1],name);H.floorIds.push(towerFid(hid,k))}}
  // 장문인(master): 맨 위층. 금고(vault): 그 층
  F.slice(0,n).forEach((fd,i)=>{const id=i?towerFid(hid,i+1):hid,Q=REGIONS[id];
    if(fd.master&&keep.master){const m=keep.master,w=Q.hall.w;m.x=Math.floor(w/2)+.5;m.y=3.6;Q.npcs.unshift(m);Q.hall.npcs=Q.npcs}
    if(fd.vault)REGIONS[hqId(s)].vaultAt=id});
  return hid}
function smBuild(s){const L=smLook(s),T=L&&L[smT(s)]||SMAP.tiers[smT(s)].maps,hq=hqId(s),[th]=HQ_THEME[s.id],oid=`hq_${s.id}_outer`,bid=`hq_${s.id}_back`,ar='ar_'+s.id;
  const old=[hq,oid,bid].flatMap(smClear),keep={master:old.find(n=>n.hq===s.id)};
  for(const R of[REGIONS[oid],REGIONS[bid]])if(R)R.npcs=R.npcs.filter(n=>!n.elder&&!n.steward&&!n.disc);
  // 본산(장문 구역): genHQ 대신 genStage 틀로 — 마당·길·위로 나가는 길(topX)
  {const R=REGIONS[hq],t=T.hq,c={id:hq,name:R.name,s,th,seed:7000+s.i*131,top:t.topX!=null?1:0,topX:t.topX,yard:t.yard,yardG:t.yardG,fence:t.fence,deco:t.deco,builds:t.builds.map(b=>({...b})),lamps:t.lamps,flags:t.flags,nodes:{herb:8,ore:6,wood:4}};
    const st=GD.SECT_STYLE[s.id]||{};c.rc=st.roof;c.wc=st.wall;c.tree=st.tree;c.props=st.props;
    R.stage=c;R.gen=()=>genStage(c);if(t.topX!=null)R.topX=t.topX;const nm=smName(s,t.builds[0].k),[y0,y1]=[t.yard[1],t.yard[3]];
    R.zone=(x,y)=>x>=t.yard[0]&&x<=t.yard[2]&&y>=y0&&y<=y1?`${s.n} ${nm} 앞마당`:y>=31?`${hqPlace(s)} 어귀`:`${hqPlace(s)} 산길`;
    for(const g of R.gates)if(g.to===bid)g.x=t.topX+.5;const B=REGIONS[bid];if(B)for(const g of B.gates)if(g.to===hq)g.tx=t.topX+.5;
    c.builds.forEach((b,i)=>smHall(hq,i,b,s,keep))}
  // 외원(살림 구역)
  if(REGIONS[oid]&&T.outer){const R=REGIONS[oid],c=R.stage,t=T.outer;c.yard=t.yard;c.yardG=t.yardG;c.fence=t.fence;c.deco=t.deco;c.builds=t.builds.map(b=>({...b}));c.lamps=t.lamps;c.flags=t.flags;
    R.zone=(x,y)=>x>=t.yard[0]&&x<=t.yard[2]&&y>=t.yard[1]&&y<=t.yard[3]?`${s.n} 외원 마당`:`${hqPlace(s)} 외원`;
    c.builds.forEach((b,i)=>smHall(oid,i,b,s,keep));
    // 암기 문파(g_amgi)의 암기방 대장장이: 창고 한 채를 암기방으로
    const sm=old.find(n=>n.asmith===s.id);if(sm){const bi=c.builds.findIndex(b=>b.k==='store'&&!b.door),b=c.builds[bi];b.door=1;R.npcs.push(sm);hallAdd(oid,bi,b,sm.n.replace(/ 대장장이$/,''),['asmith'],{kit:'smith'})}
    // 대연무장 출입구를 본산 아래에서 외원 왼쪽으로 (대문파만, 사용자 결정)
    const A=REGIONS[ar];if(A&&t.arena){const H=REGIONS[hq],[ax,ay]=t.arena;H.gates=H.gates.filter(g=>g.to!==ar);R.gates.push({x:ax,y:ay,to:ar,tx:20.5,ty:36.2,label:'대연무장'});
      for(const g of A.gates)if(g.to===hq){g.to=oid;g.tx=ax+1.8;g.ty=ay;g.label=R.name}
      const g0=R.gen;R.gen=()=>{g0();const yd=t.yard;for(let x=1;x<=yd[0];x++)for(const y of[Math.floor(ay),Math.floor(ay)-1]){objs[y][x]=null;if(map[y][x].g===2||map[y][x].g===6)map[y][x].g=1;else if(map[y][x].g!==4)map[y][x].g=1}}}}
  // 후산(비전 구역)
  if(REGIONS[bid]&&T.back){const R=REGIONS[bid],c=R.stage,t=T.back;c.yard=t.yard;c.yardG=t.yardG;c.fence=t.fence;c.deco=t.deco;c.builds=t.builds.map(b=>({...b}));c.lamps=t.lamps;R.name=`${hqPlace(s)} 후산`;R.zone=()=>R.name;
    c.builds.forEach((b,i)=>smHall(bid,i,b,s,keep))}
  // 산문 맵: 갈래의 담·망루 (녹림채 목책, 개방 무너진 흙담)
  {const G=REGIONS[`hq_${s.id}_gate`],g=L&&L.gate;if(G&&G.stage){G.stage.wallK=g&&g.wallK;G.stage.wallTower=g&&g.tower}}
  REGIONS[hq].smTier=smT(s)}
for(const s of Object.values(SECTS))if(smOn(s))smBuild(s);
// ---- 새 역할 NPC 창 ----
function smSay(n,i){const L=SMAP.say[n.srole]||[''],s=SECTS[n.ssid];return(L[i??Math.floor(time/7)%L.length]||'').replace('{s}',s.n).replace('{rank}',P.sect===s.id?rankName(s.id):'손님')}
function smDlg(n){const s=SECTS[n.ssid],member=P.sect===s.id,r=n.srole;
  if(r==='jigak'){if(!member)return `<p class="note">"${smSay(n,0)}"</p>${sectDetail(s,true)}`;return `<p class="note">"${smSay(n,1)}"</p>${rankHtml(s)}`}
  if(r==='treas')return `<p class="note">"${member?`${rankName(s.id)}, 녹봉은 해마다 이 방에서 나간다.`:'외부인이 장부를 들여다볼 일은 없소.'}"</p><div class="card"><h4>${s.n} 금고</h4><p class="note">쌓인 은자 ${sectVault(s.id)} · 해마다 들어오는 몫 ${vaultIncome(s)}${member?` · 내 녹봉 해마다 은자 ${rankIdx(s.id)*15}`:''}</p>${member?donateHtml(s):''}</div>`;
  if(r==='medic'){const fee=member?0:SMAP.medicFee;return `<p class="note">"${smSay(n,member?1:0)}"</p><div class="row2"><span class="note">생명을 모두 되찾는다${fee?` · 은자 ${fee}`:' · 문파원은 무료'}.</span>${B('smheal:'+s.id,'치료 받기',{d:P.hp>=P.maxHp||P.silver<fee})}</div>`}
  return `<p class="note">"${smSay(n)}"</p>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.srole&&c.n.ssid&&SECTS[c.n.ssid])c.html=smDlg(c.n)});
hook('sectAct',c=>{if(c.a!=='smheal')return;c.done=true;c.r=true;const s=SECTS[c.x];if(!s)return;const fee=P.sect===s.id?0:SMAP.medicFee;if(P.silver<fee||P.hp>=P.maxHp)return;P.silver-=fee;P.hp=P.maxHp;log(`${s.n} 의원에게 치료를 받았다.${fee?` (은자 -${fee})`:''}`,'sys');addText(P.x,P.y,'치료','#9fe3a0')});
// 맨 위층 풍경 한 줄(g_tower)은 성 누각 글이라 문파 전각에선 문파 글로
hook('regionLoaded',id=>{const R=REGIONS[id];if(!P||!R||!R.smFloor||!R.tower||R.tower.k!==R.tower.n)return;const s=SECTS[R.smFloor.sid];log(`${R.name}. 난간 너머로 ${hqPlace(s)}의 봉우리와 ${s.n}의 지붕들이 내려다보인다.`,'sys')});

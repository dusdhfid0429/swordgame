// ================= 맹 총단: 정의맹·사천맹의 본부, 문파 입지와 개인 직위 =================
// 2026-10-11 동훈님: 사천맹과 정의맹도 지역을 정해 구성한다. 각 맹은 맹주·장로·전투 조직인 당을 두고,
// 플레이어는 문파에 속해 문파의 입지를 맹에서 올리거나, 개인이 맹 소속으로 활동해 입지를 올려 직위를 올린다. 설계: docs/세력_문파_설계.md 21장
// - 총단 맵: 정의맹 총단은 호북성 형주 성내 북쪽 포털, 사천맹 총단은 호남성 악양 성내 북쪽 포털. 역참 말로도 간다.
//   취의청/패왕전(맹주) · 장로각(장로 셋) · 접객당(총관: 가입·임무·직위) · 당 넷(당주). 마당에는 그 맹 문파의 무인들이 있다.
// - 문파 입지(G.mst[맹][문파]): 문파 등급의 기본 입지에, 플레이어가 그 문파의 임무를 보고하거나 맹 임무를 문파 제자로서 보고해 쌓은 몫을 더한다.
//   입지 순서가 맹의 서열이다. 서열 1위(맹주 문파)의 제자는 공적 +15%, 2~3위는 +5%.
// - 개인 직위(P.mpt[맹]): 맹 임무로 쌓은 맹 공적으로 맹원 → 당원 → 당주 → 호법 → 장로 → 부맹주. 문파 제자는 저절로 맹 소속이고,
//   문파 없이도 같은 성향이면 총단·연락관에서 맹원이 될 수 있다(명성 10). 당주부터 당을 고르고(당패), 장로부터 맹주의 하사를 받는다. 녹봉 해마다 직위×20.
const MAENG=GD.MAENG,MMIS=GD.MMIS,MRANK=GD.MRANK,MPTS=GD.MPTS,MSEAT=GD.MSEAT;
const MAENG_IDS=Object.keys(MAENG);
const maengId=al=>'maeng_'+al;
// 지금 속한 맹: 맹원으로 들었거나, 그 맹 문파의 제자
const maengOf=()=>P&&(P.maeng||(P.sect&&SECTS[P.sect]&&MAENG[SECTS[P.sect].al]?SECTS[P.sect].al:null))||null;
const mySectIn=al=>P.sect&&SECTS[P.sect]&&SECTS[P.sect].al===al?SECTS[P.sect]:null;
function maengRank(al){const t=(P.mpt||{})[al]||0;let i=0;while(i<MPTS.length-1&&t>=MPTS[i+1])i++;return i}
const maengRankName=(al,i)=>MRANK[al][i??maengRank(al)];
// ---- 문파 입지와 서열 ----
function sectStanding(al,s){const base=MSEAT[s.tier]||50,j=(s.i*37)%40;return base+j+(((G.mst||{})[al]||{})[s.id]||0)}
function maengSeats(al){return Object.values(SECTS).filter(s=>s.al===al).map(s=>({s,v:sectStanding(al,s)})).sort((a,b)=>b.v-a.v)}
function seatOf(al,sid){return maengSeats(al).findIndex(q=>q.s.id===sid)+1}
// 서열 1위 문파 제자는 공적 +15%, 2~3위는 +5% (g_faction.js addMerit)
function maengSeatMul(sid){const s=SECTS[sid];if(!s||!MAENG[s.al]||P.sect!==sid)return 1;const k=seatOf(s.al,sid);return k===1?1.15:k<=3?1.05:1}
function sectGainStanding(sid,v){const s=SECTS[sid];if(!s||!MAENG[s.al]||v<=0)return 0;const al=s.al;G.mst=G.mst||{};G.mst[al]=G.mst[al]||{};
  const before=seatOf(al,sid);G.mst[al][sid]=(G.mst[al][sid]||0)+v;const after=seatOf(al,sid);
  if(after<before)log(`${s.n}의 ${MAENG[al].short} 서열이 ${after}위로 올랐습니다.`,'xp');return v}
// ---- 맹 임무: 해마다 셋씩 바뀐다 ----
function maengMissions(al){const pool=MMIS[al],y=Math.floor(P.age),M=MAENG[al];
  return[y%pool.length,(y+2)%pool.length,(y+4)%pool.length].map(i=>({...pool[i],n:`[${M.short}] ${pool[i].n}`,maeng:al,vit:Math.round(pool[i].merit*1.2),fame:Math.round(pool[i].merit/4),good:al==='jeong'?4:0,key:`m_${al}:${i}:${y}`}))}
// 보고: 개인 맹 공적(직위에 따라 +10%씩)과, 문파 제자면 문파 입지(공적의 1.5배)
function maengReport(q){const al=q.maeng,M=MAENG[al];if(!M)return;
  const b=maengRank(al),v=Math.round(q.merit*(1+b*.1));P.mpt=P.mpt||{};P.mpt[al]=(P.mpt[al]||0)+v;log(`${M.short} 공적 +${v}`,'xp');
  const a=maengRank(al);if(a>b){const n=maengRankName(al,a);showBanner(`${M.short} ${n}`,'맹의 직위가 올랐습니다');log(`${M.short}의 ${n}(으)로 올랐습니다. ${maengPerk(al,a)}`,'xp');P.feats.push(`${Math.floor(P.age)}세에 ${M.short}의 ${n}이(가) 되었다`)}
  const s=mySectIn(al);if(s){const sv=sectGainStanding(s.id,Math.round(q.merit*1.5));log(`${s.n}의 ${M.short} 입지 +${sv}`,'xp')}}
function maengPerk(al,i){return['','맹 임무 공적 +10%.','당을 골라 당패를 받을 수 있다. 공적 +20%.','총단 당 무인들이 길을 비킨다. 공적 +30%.','맹주를 알현해 하사품을 받는다. 공적 +40%.','부맹주: 맹의 둘째 자리. 명성 +100.'][i]||''}
// ---- 가입 조건 ----
function maengJoinBlock(al){const M=MAENG[al];
  if(P.side!==ALLY[al].side)return `${SIDES[ALLY[al].side].n}만 받는다.`;
  if(maengOf()===al)return mySectIn(al)?`${SECTS[P.sect].n} 제자로서 이미 ${M.short} 소속이다.`:'이미 맹원이다.';
  if(P.maeng&&P.maeng!==al)return `이미 ${MAENG[P.maeng].short}의 맹원이다.`;
  if(P.sect&&SECTS[P.sect]&&!MAENG[SECTS[P.sect].al])return `${SECTS[P.sect].n} 제자는 맹에 들 수 없다.`;
  if(P.fame<10)return '명성 10은 있어야 맹원으로 받는다.';return null}
// ---- 창 ----
function maengRankHtml(al){const M=MAENG[al],i=maengRank(al),t=(P.mpt||{})[al]||0,nx=i<MPTS.length-1?MPTS[i+1]:0,on=maengOf()===al;
  return `<div class="card"><h4>${M.short} 직위 <b>${on?maengRankName(al,i):'없음'}</b></h4>${on?`<p>맹 공적 ${t}${nx?` / ${nx} (다음 ${maengRankName(al,i+1)})`:' · 최고 직위'} · 맹 임무 공적 +${i*10}% · 녹봉 해마다 은자 ${i*20}${P.mdang&&P.mdang.al===al?` · ${M.dangs[P.mdang.k]}`:''}</p>
    <p class="dim">${MRANK[al].map((n,k)=>k===i?`<b>${n}</b>`:n).join(' → ')}</p>`:`<p class="note">${mySectIn(al)?'':`${M.short} 문파의 제자가 되거나, 명성 10으로 맹원이 되어 맹 임무를 맡는다.`}</p>`}</div>`}
function maengSeatsHtml(al){const M=MAENG[al],mine=mySectIn(al);
  return `<div class="card"><h4>${M.short} 서열 <small class="dim">문파 입지 순</small></h4><p class="dim">${maengSeats(al).slice(0,8).map((q,i)=>`${i+1}위 ${q.s.id===(mine&&mine.id)?`<b class="gold">${q.s.n}</b>`:q.s.n} ${q.v}`).join(' · ')}</p>
    ${mine?`<p class="note">${mine.n}은(는) ${seatOf(al,mine.id)}위 (입지 ${sectStanding(al,mine)}). 문파 임무를 보고하면 입지가 오르고, 맹 임무는 1.5배로 오른다. 서열 1위 제자는 공적 +15%, 3위까지 +5%.</p>`:'<p class="note">문파 제자가 되어 임무를 보고하면 그 문파의 입지가 오른다.</p>'}</div>`}
function maengMisHtml(al){const M=MAENG[al];if(P.side!==ALLY[al].side)return '';
  const can=maengOf()===al;
  const mis=maengMissions(al).map((q,qi)=>{const on=P.quests.find(x=>x.key===q.key),done=on&&(on.kind==='kill'?on.have>=on.cnt:(P.mats[on.mat]||0)>=on.cnt),i=P.quests.indexOf(on);
    return `<div class="it"><div>${q.n.replace(/^\[[^\]]+\] /,'')}<span>${q.kind==='kill'?`${mobTxt(q.mob)} ${on?on.have+'/':''}${q.cnt}`:`${q.mat} ${on?(P.mats[q.mat]||0)+'/':''}${q.cnt}개`} · 맹 공적 ${q.merit} · 은자 ${q.silver}</span></div>
      <div class="ib">${on?B('qdone:'+i,done?'보고하기':'진행 중',{pri:done,d:!done}):B('mtake:'+al+':'+qi,'맡기',{d:!can||P.quests.length>=4,t:can?'':'맹 소속이어야 맡는다'})}</div></div>`}).join('');
  const cur=maengMissions(al).map(q=>q.key),old=P.quests.map((q,i)=>[q,i]).filter(([q])=>q.maeng===al&&!cur.includes(q.key)).map(([on,i])=>{const done=on.kind==='kill'?on.have>=on.cnt:(P.mats[on.mat]||0)>=on.cnt;
    return `<div class="it"><div>${on.n.replace(/^\[[^\]]+\] /,'')}<span>${on.kind==='kill'?`${mobTxt(on.mob)} ${on.have}/${on.cnt}`:`${on.mat} ${P.mats[on.mat]||0}/${on.cnt}`} · 맹 공적 ${on.merit} · 지난해 임무</span></div><div class="ib">${B('qdone:'+i,done?'보고하기':'진행 중',{pri:done,d:!done})}</div></div>`}).join('');
  return `<div class="row2"><h4 style="margin:0">${M.short} 임무 <small class="dim">해마다 바뀐다 · 의뢰는 넷까지</small></h4>${B('open:quest','임무창')}</div><div class="list">${mis}${old}</div>`}
function maengJoinHtml(al){const M=MAENG[al],jb=maengJoinBlock(al);
  if(P.side!==ALLY[al].side)return '';
  if(P.maeng===al)return `<div class="row2"><span class="note">${M.short}의 ${maengRankName(al)}다.</span>${B('mleave','맹에서 나가기')}</div>`;
  if(maengOf()===al)return '';
  return `<div class="row2"><span class="note">${jb||'맹원이 되면 맹 임무로 맹 공적을 쌓아 직위를 올린다.'}</span>${B('mjoin:'+al,`${M.short} 맹원 되기`,{pri:1,d:!!jb})}</div>`}
// 연락관·총관 공통 덩어리: 직위, 가입, 임무, 총단 가기
function maengBlock(al,atHq){const M=MAENG[al],id=maengId(al);
  return `${maengRankHtml(al)}${maengJoinHtml(al)}${maengMisHtml(al)}${atHq?'':`<div class="row2"><span class="note">총단은 ${PROV[M.prov].n} ${M.city} 성내 북쪽에 있다. 역참 말로 바로 갈 수 있다.</span>${B('goto:'+id,`총단 가기 · 은자 ${POST_FEE}`,{d:P.silver<POST_FEE||REG===id})}</div>`}`}
function maengDlg(n){const al=n.maeng,M=MAENG[al],same=P.side===ALLY[al].side,on=maengOf()===al,r=maengRank(al),mine=mySectIn(al);
  if(n.role==='leader'){
    if(!same)return `<p class="note">"${facName()} 사람이 여기까지 오다니. 당 무인들이 보기 전에 돌아가라."</p>`;
    let h=`<p class="note">${M.leader}이(가) 상석에서 내려다본다. "${on?`${mine?`${mine.n}의 ${rankName(mine.id)}`:'맹원'} ${esc(P.name)}, ${r>=4?'그대의 공이 맹을 지탱한다.':'맹을 위해 힘써 주게.'}`:'맹에 들고 싶거든 접객당 총관을 찾게.'}"</p><p class="note">${M.d}</p>${maengSeatsHtml(al)}${maengRankHtml(al)}`;
    if(on&&r>=4){const got=(P.mgift||{})[al]||0,lv=r>=5?2:1;
      h+=`<div class="card"><h4>맹주의 하사 <small class="dim">장로 이상 · 직위마다 한 번</small></h4><p class="note">장로: 은자 300·명성 50 · 부맹주: 은자 800·명성 100</p>${got>=lv?'<p class="note">이미 받았다.</p>':B('mgift:'+al,'하사 받기',{pri:1})}</div>`}
    else if(on)h+=`<p class="note">"장로에 오르면 맹의 이름으로 상을 내리마."</p>`;
    return h}
  if(n.role==='elder')return `<p class="note">"${same?`${on?'맹의 식구가 왔군.':'손님이군.'} 강호의 균형은 서열로 지켜지는 법.`:'적이 장로각에 들다니, 겁이 없군.'}"</p>${maengSeatsHtml(al)}<p class="note">장로원은 문파 사이의 다툼을 재판하고, 서열에 따라 맹의 이권을 나눈다. 당주 이상이면 장로원에 들 수 있다.</p>`;
  if(n.role==='dang'){const k=n.dang,nm=M.dangs[k],mineD=P.mdang&&P.mdang.al===al&&P.mdang.k===k;
    return `<p class="note">${nm} 당주가 병기를 세우며 묻는다. "${same?(mineD?`우리 ${nm}의 식구군.`:on&&r>=2?`당주 자리에 올랐으니 당을 고를 수 있다.`:'당원은 당주부터 받는다. 공을 더 세우게.'):'적이다!'}"</p>
      <p class="note">${nm}은 ${M.short}의 전투 조직 ${k+1}당. 맹의 명으로 적 세력의 소굴을 치고 요지를 지킨다.</p>
      ${on&&r>=2&&!P.mdang?`<div class="row2"><span class="note">${nm}에 들면 당패(장신구)를 받고 명성이 10 오른다. 한 생에 한 당만 고른다.</span>${B('mdang:'+al+':'+k,`${nm} 들기`,{pri:1,d:P.bag.length>=24})}</div>`:P.mdang&&P.mdang.al===al?`<p class="note">그대는 ${M.dangs[P.mdang.k]} 소속이다.</p>`:''}`}
  // 총관
  return `<p class="note">"${same?(on?`${maengRankName(al)} ${esc(P.name)}, 맹의 일감은 여기 있네.`:'맹에 뜻이 있는가? 명성 10이면 맹원으로 받는다.'):'우리 맹의 문은 그대에게 열려 있지 않다.'}"</p>${maengBlock(al,true)}${maengSeatsHtml(al)}`}
// ---- 행동 ----
hook('sectAct',c=>{const{a,x,y}=c;
  if(a==='mjoin'){c.done=true;c.r=true;if(maengJoinBlock(x))return;P.maeng=x;P.mpt=P.mpt||{};P.mpt[x]=P.mpt[x]||0;log(`${MAENG[x].short}의 맹원이 되었습니다.`,'xp');showBanner(`${MAENG[x].short} 입맹`,'맹원');P.feats.push(`${Math.floor(P.age)}세에 ${MAENG[x].short} 맹원이 되었다`);return}
  if(a==='mleave'){c.done=true;c.r=true;if(!P.maeng)return;if(!confirm(`${MAENG[P.maeng].short}에서 나갈까요? 맹 공적과 직위는 남지만 녹봉은 끊깁니다.`))return;log(`${MAENG[P.maeng].short}에서 나왔습니다.`,'info');P.maeng=null;return}
  if(a==='mtake'){c.done=true;c.r=true;const q=maengMissions(x)[+y];if(q&&maengOf()===x&&P.quests.length<4&&!P.quests.some(o=>o.key===q.key)){P.quests.push({...q,have:0});log(`임무 ${q.n}을(를) 맡았습니다.`,'sys')}return}
  if(a==='mdang'){c.done=true;c.r=true;const al=x,k=+y,M=MAENG[al];if(maengOf()!==al||maengRank(al)<2||P.mdang||P.bag.length>=24)return;
    P.mdang={al,k};P.fame+=10;const it=mkGear('acc',`${M.dangs[k]} 당패`,1.2,{qi:16,hm:3});P.bag.push(it);log(`${M.dangs[k]}에 들었습니다. 당패를 받았습니다.`,'xp');showBanner(M.dangs[k],`${M.short} ${maengRankName(al)}`);P.feats.push(`${Math.floor(P.age)}세에 ${M.short} ${M.dangs[k]}에 들었다`);return}
  if(a==='mgift'){c.done=true;c.r=true;const al=x,M=MAENG[al],r=maengRank(al);if(maengOf()!==al||r<4)return;P.mgift=P.mgift||{};const got=P.mgift[al]||0,lv=r>=5?2:1;if(got>=lv)return;
    P.mgift[al]=lv;const sv=lv===2?800:300,fm=lv===2?100:50;P.silver+=sv;P.fame+=fm;log(`맹주의 하사: 은자 ${sv}, 명성 ${fm}.`,'xp');showBanner('맹주의 하사',M.leader);P.feats.push(`${Math.floor(P.age)}세에 ${M.short} 맹주의 하사를 받았다`);return}
});
// 녹봉: 해마다 직위×20
hook('newYear',()=>{const al=maengOf();if(!al)return;const i=maengRank(al),v=i*20;if(v>0){P.silver+=v;log(`${MAENG[al].short} ${maengRankName(al)} 녹봉으로 은자 ${v}을(를) 받았습니다.`,'sys')}});
// 성도 연락관 창에 맹 덩어리를 붙인다. 총단 NPC는 자기 창
hook('npcDlg',c=>{if(c.html!=null)return;const n=c.n;
  if(n.maeng){c.html=maengDlg(n);return}
  if(n.id==='jeong'||n.id==='sa'){const al=n.id==='jeong'?'jeong':'sacheon';c.html=allianceDlg(al)+maengBlock(al,false)}});
// ---- 총단 맵: 성도 북쪽 포털로 들어간다 ----
MAENG_IDS.forEach((al,idx)=>{const M=MAENG[al],id=maengId(al),f=alFac(al),[k0,k1]=FAC_KIND[f],pal=al==='jeong'?'taoist':'cultist';
  const inYard=(x,y)=>x>=8&&x<=32&&y>=6&&y<=30;
  const c={id,name:M.n,s:{id,n:M.short,al,tier:'big',i:90+idx},th:'manor',seed:8600+idx*53,top:0,yard:[8,6,32,30],
    builds:[{x:18,y:7,w:5,h:3,kind:'hall'},{x:9,y:10,w:3,h:2,kind:'hall'},{x:28,y:10,w:3,h:2,kind:'hall'},{x:9,y:17,w:3,h:2},{x:28,y:17,w:3,h:2},{x:9,y:23,w:3,h:2},{x:28,y:23,w:3,h:2}],
    lamps:[[15,12],[25,12],[15,27],[25,27],[18,30],[22,30]],
    zone:(x,y)=>inYard(x,y)?M.n:`${M.n} 문밖`,
    npcs:[{id:'mleader',maeng:al,role:'leader',n:M.leader,x:20.5,y:11.6,pal},
      ...M.elders.map((e,i)=>({id:'melder'+i,maeng:al,role:'elder',n:e,x:11.5+i,y:13.6,pal})),
      {id:'msteward',maeng:al,role:'steward',n:M.steward,x:29.5,y:13.6,pal:'keeper'},
      ...M.dangs.map((d,k)=>({id:'mdang'+k,maeng:al,role:'dang',dang:k,n:`${d} 당주`,x:0,y:0,pal:al==='jeong'?'disciple':'chief'}))],
    spawns:[[k0,8,inYard,(x,y)=>mkFac(f,0,x,y)],[k1,3,inYard,(x,y)=>mkFac(f,1,x,y)],...beastSp('manor',(x,y)=>y>=33)]};
  const R=stageRegion(c);R.hq=null;R.maeng=al;R.capital=0;
  R.arrive={x:20.5,y:36.2};
  // 전각: 맹주전 · 장로각 · 접객당 · 당 넷
  hallAdd(id,0,c.builds[0],M.halls[0],['mleader'],{w:18,h:13});hallAdd(id,1,c.builds[1],M.halls[1],['melder0','melder1','melder2']);hallAdd(id,2,c.builds[2],M.halls[2],['msteward'],{kit:'office'});
  M.dangs.forEach((d,k)=>hallAdd(id,3+k,c.builds[3+k],d,['mdang'+k],{kit:'drill'}));
  // 성내 북쪽 포털
  const F=REGIONS[pvId(M.prov)],m=F&&F.marks&&F.marks.find(q=>q.n===M.city&&q.gate),L=m&&REGIONS[m.gate],cL=L&&L.stage;
  if(cL&&cL.portals){const n=cL.portals.length,slot=LM_PORTAL_C[Math.min(n,2)],x=slot[0]+.5,y=slot[1]+.5;
    cL.portals.push({x,y,s:null,label:M.n});L.gates.push({x,y,to:id,tx:20.5,ty:36.2,label:M.n,portal:1});
    R.gates.push({x:20.5,y:38.6,to:m.gate,tx:x,ty:y+2,label:L.name||m.n});R.lmVia=m.gate}
  else R.gates.push({x:20.5,y:38.6,to:'gaebong',tx:20.5,ty:20.5,label:'개봉'});
});
// 역참 마부 창에 총단 두 곳
hook('npcDlg',c=>{if(c.n.id!=='post'||c.html==null)return;
  const row=al=>{const id=maengId(al),M=MAENG[al];return `<div class="it"><div>${M.n}<span>${PROV[M.prov].n} ${M.city}</span></div><div class="ib">${REG===id?'<small class="dim">여기</small>':B('goto:'+id,`가기 · 은자 ${POST_FEE}`,{d:P.silver<POST_FEE})}</div></div>`};
  c.html=c.html.replace('</div><h4','</div><h4 style="margin:0">맹 총단</h4><div class="list">'+MAENG_IDS.map(row).join('')+'</div><h4')});

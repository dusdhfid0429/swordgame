// ================= 객잔과 정보 단체 (v158, 사용자 2026-10-20) =================
// "마을의 객잔처럼 소문을 듣기 좋은 장소. 객잔 건물에 들어갈 수 있고, 안의 NPC들이 말풍선으로 여러 정보를 나눈다.
//  정파 개방, 사파 하오문, 마교 별도 정보단체, 군부 동창. 마교·군부는 정보창구 NPC에서 무료, 정파·사파는 개방·하오문에 가입했으면 무료.
//  직위에 따라 접근 권한(모든 세력): 직위가 높을수록 높은 등급 정보. 다른 문파는 정보 등급에 따른 비용을 내고 듣는다."
// - 객잔: 모든 성읍의 객잔(전각 안, g_city.js)과 개봉 객잔(여기서 새로 들어갈 수 있게 한다). 안에 손님 넷과 개방 정보원·하오문 점소이.
//   손님들은 INTEL.chat초마다 돌아가며 말풍선으로 이야기한다: 기연동굴 소문(객잔은 먼 소문도 들린다), 두목 출몰, 세력 판도, 흔들리는 문파 등.
// - 정보 창구: 개방 정보원·하오문 점소이(객잔), 천리당 밀사(마교 객잔, 교도만), 동창 번자(성도 관아). 창에서 정보를 고르면 듣는다(로그 + 임무창 '들은 정보').
//   접근 등급 = INTEL.access[내 문파 직위](무소속은 하급만). 그 단체 사람이면 무료, 아니면 INTEL.cost[등급] 은자(다른 편 단체는 ×otherSide, 동창은 ×mul).
// - 정보: 기연동굴마다 하급(성)·중급(맵)·상급(방위·세력전)·극비(입구가 지도에 표시되고 안의 기연 무공 이름), 그 밖에 판도·두목·흔들리는 문파·문파 금고·기연 무공의 행방.
// 설계: docs/세력_문파_설계.md 34장. 테스트: tests/t95_intel.js
const INTEL=GD.INTEL,ORG=INTEL.orgs;
const orgPal=k=>{const o=ORG[k],s=SECTS[o.pal];return s?(sectPal(s.id,k==='magyo'?2:1,s.id==='gaebang'?'봉':'검',{})||o.pal):o.pal};
// 그 단체 사람인가
function orgMember(k){const s=SECTS[P.sect];if(!s)return false;return k==='gaebang'?s.id==='gaebang':k==='haomun'?s.id==='haomun':k==='magyo'?s.id==='cheonma':k==='dongchang'?s.al==='gunbu':false}
const orgSide=k=>k==='gaebang'?'정':k==='haomun'?'사':k==='magyo'?'마':'관';
// 접근 등급(1~4): 직위를 따른다. 무소속·자기 문파 직위 없음은 하급만
const intelAccess=()=>{const s=SECTS[P.sect];return s?INTEL.access[Math.min(INTEL.access.length-1,rankIdx(s.id))]:1};
function intelCost(k,g){if(orgMember(k))return 0;const o=ORG[k],my=P.sect&&SECTS[P.sect]?alFac(SECTS[P.sect].al):P.side;
  return Math.round(INTEL.cost[g-1]*(o.mul||1)*(my===orgSide(k)?1:INTEL.otherSide))}
// ---- 객잔·관아에 사람 들이기 ----
const INNS=[];
{const add=(id,o)=>{const R=REGIONS[id];if(!R)return;R.npcs=R.npcs||[];R.npcs.push(o)};
  // 개봉 객잔: 바깥 건물 문으로 들어간다. 객잔 주인 왕씨는 문 옆으로 비킨다
  if(!REGIONS[hallId('gaebong',0)]){hallAdd('gaebong',0,{x:15,y:15,w:3,h:2},'객잔',[],{kit:'inn'});const k=npcAt('inn');if(k){k.x=18.4;k.y=17.8}}
  for(const[id,R]of Object.entries(REGIONS)){if(!R.hall||!/객잔$/.test(R.name))continue;const H=R.hall,mg=/마교/.test(R.name),w=H.w,h=H.h;INNS.push(id);
    const seats=[[2.5,h-4.5],[w-2.5,h-4.5],[3.5,h-6.6],[w-3.5,h-6.6]],ps=INTEL.patrons;
    seats.forEach(([x,y],i)=>{const q=ps[(id.length*7+i)%ps.length];add(id,{id:'patron',patron:1,n:q[0],x,y,pal:q[1]})});
    if(mg)add(id,{id:'intel',intel:'magyo',n:ORG.magyo.who,x:w/2+3.5,y:5.2,pal:orgPal('magyo')});
    else{add(id,{id:'intel',intel:'gaebang',n:ORG.gaebang.who,x:2.5,y:5.2,pal:orgPal('gaebang')});add(id,{id:'intel',intel:'haomun',n:ORG.haomun.who,x:w-2.5,y:5.2,pal:orgPal('haomun')})}}
  // 동창: 성도 관아(황성 포함)
  for(const[id,R]of Object.entries(REGIONS))if(R.hall&&R.name==='관아'){const w=R.hall.w;add(id,{id:'intel',intel:'dongchang',n:ORG.dongchang.who,x:w-3.5,y:4.4,pal:orgPal('dongchang')})}}
// ---- 정보 목록: 지금 강호 형편에서 만든다 ----
const gycHostName=c=>REGIONS[c.host]?REGIONS[c.host].name:'?';
function intelList(k){const out=[],L=G.gyc?G.gyc.list:[];
  L.forEach((c,i)=>{const n=`기연동굴 ${i+1}`,R=REGIONS[c.host],pv=PROV[R.prov]?PROV[R.prov].n:R.name;
    if(c.done){out.push({g:1,key:`gyc${i}d`,t:`${n}의 행방`,txt:c.by==='me'?`${pv} ${gycHostName(c)}의 ${c.name}은(는) ${c.who||'누군가'}이(가) 이미 휩쓸었다.`:`${pv} ${gycHostName(c)}의 ${c.name}은(는) ${SECTS[c.by]?SECTS[c.by].n:FAC4N[c.by]||'누군가'}이(가) 차지했다.`});return}
    out.push({g:1,key:`gyc${i}a`,t:`${n} · 어느 성`,txt:`${pv} 어딘가 산중에 ${GYC.sign[c.th]}.`,fn:()=>gycHear(c,0,`${pv} 어딘가 산중에 ${GYC.sign[c.th]}`)});
    out.push({g:2,key:`gyc${i}b`,t:`${n} · 어느 맵`,txt:`${gycHostName(c)}이다. ${GYC.sign[c.th]}.`,fn:()=>gycHear(c,1,`${gycHostName(c)}에 ${GYC.sign[c.th]}`)});
    const dir=gycDir(c),war=c.rumor>=GYC.rumor.war;
    out.push({g:3,key:`gyc${i}c`,t:`${n} · 입구 방위${war?' · 세력전':''}`,txt:`${gycHostName(c)} ${dir}쪽에 입구가 있다.${war?` 지금 ${(c.facs||[]).map(f=>FAC4N[f]).join('·')} 무사들이 입구 앞에서 다툰다.`:` 소문은 ${Math.round(c.rumor)}할쯤 퍼졌다.`}`,fn:()=>gycHear(c,2,`${gycHostName(c)} ${dir}쪽에 굴 입구가 있다`)});
    out.push({g:4,key:`gyc${i}x`,t:`${n} · 정확한 자리와 기연`,txt:`${gycHostName(c)}의 ${c.name}. 입구는 지도에 표시해 두었다. 안에는 ${c.art?`천고의 무공 [${ARTS[c.art].n}]의 비급`:'영약과 비급'}이 잠들어 있고 수호자가 지킨다.`,fn:()=>{c.mark=1;gycHear(c,3,`${gycHostName(c)}의 ${c.name} (지도 표시)`)}})});
  const w=G.W&&G.W.pow;if(w)out.push({g:1,key:'pow',t:'천하 판도',txt:FAC4.map(f=>`${FAC4N[f]} ${Math.round(w[f]||0)}`).join(' · ')+'.'});
  const bs=Object.keys(MOBS).filter(m=>MOBS[m].boss).map(m=>`${m}: ${mobWhere(m)||'행방 모름'}`);out.push({g:1,key:'boss',t:'두목 출몰지',txt:bs.join(' / ')+'.'});
  if(typeof sectPop==='function'){const ss=Object.values(SECTS).filter(s=>sectPop(s.id)>0).map(s=>[s,sectPop(s.id)/popBase(s)]).sort((a,b)=>a[1]-b[1]).slice(0,3);
    out.push({g:2,key:'weak',t:'흔들리는 문파',txt:ss.map(([s,r])=>`${s.n} 인원 ${Math.round(r*100)}%${G.mdead&&G.mdead[s.id]?' (장문인 공석)':''}`).join(' · ')+'.'})}
  if(typeof sectVault==='function'){const vs=Object.values(SECTS).map(s=>[s,sectVault(s.id)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
    if(vs.length)out.push({g:3,key:'vault',t:'문파 금고',txt:vs.map(([s,v])=>`${s.n} 은자 ${v}`).join(' · ')+'. 금고는 본산 깊은 전각에 있다.'})}
  const up=Object.values(SECTS).filter(s=>sectUp(s)>0);out.push({g:3,key:'up',t:'무공 등급이 오른 문파',txt:up.length?up.map(s=>`${s.n} ${AGR[sectTop0(s)]}→${AGR[sectTopReg(s)]}`).join(' · ')+'.':'아직 없다.'});
  out.push({g:4,key:'gyarts',t:'기연 무공의 행방',txt:Object.keys(GY_ARTS).map(id=>{const own=gycDonOwner(id),c=L.find(c=>c.art===id&&!c.done);return `${ARTS[id].n}: ${own?SECTS[own].n:c?`${gycHostName(c)}의 동굴`:'강호를 떠돈다'}`}).join(' / ')+'.'});
  return out}
function gycDir(c){const R=REGIONS[c.host],S=R.size||40,H=R.h||S,sx=(c.ax-S/2)-(c.ay-H/2),sy=(c.ax-S/2)+(c.ay-H/2);return Math.hypot(sx,sy)<4?'한가운데':['동','남동','남','남서','서','북서','북','북동'][(Math.round(Math.atan2(sy,sx)/(Math.PI/4))+8)%8]}
function gycHear(c,L,txt){if(L>c.heard)c.heard=L;c.hints[L*2]=txt}
// ---- 정보 창구 창 ----
function intelDlg(n){const k=n.intel,o=ORG[k],mem=orgMember(k),acc=intelAccess(),bought=P.intel||(P.intel=[]);
  if(o.members&&!mem)return `<p class="note">"${o.n}은(는) 본교 사람에게만 입을 연다. 썩 꺼져라."</p>`;
  const rows=intelList(k).sort((a,b)=>a.g-b.g).map(it=>{const have=bought.some(b=>b.key===it.key&&b.txt===it.txt),c=intelCost(k,it.g),lock=it.g>acc;
    const why=have?'들음':lock?`${INTEL.grade[it.g-1]} · 직위 부족`:c&&P.silver<c?`은자 ${c} 필요`:'';
    return `<div class="it"><div>${esc(it.t)} <small class="${it.g>=4?'bad':it.g>=3?'gold':'dim'}">${INTEL.grade[it.g-1]}</small><span>${have?esc(it.txt):lock?'더 높은 직위가 되어야 들을 수 있다':'…'}</span></div><div class="ib">${have?'<small class="good">들음</small>':B(`intel:${k}:${it.key}`,why||(c?`듣기 · 은자 ${c}`:'듣기 · 무료'),{d:!!why,pri:!why&&!c})}</div></div>`}).join('');
  return `<p class="note">"${o.hello}"${mem?` "${o.free}"`:''}</p><p class="note">${o.n} · ${mem?'<b class="good">이 단체 사람이라 무료</b>':'값을 내고 듣는다'} · 내가 들을 수 있는 등급: <b class="gold">${INTEL.grade[acc-1]}까지</b> <small class="dim">(직위가 오를수록 높은 등급. 무소속은 하급만)</small></p><div class="list">${rows}</div>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.intel)c.html=intelDlg(c.n)});
hook('npcDlg',c=>{if(c.html==null&&c.n.patron){const r=innLine();c.html=`<p class="note">${esc(c.n.n)}: "${esc(r||'좋은 술이오. 한잔하시겠소?')}"</p>`}});
hook('sectAct',c=>{if(c.a!=='intel')return;c.done=true;c.r=true;const k=c.x,o=ORG[k];if(!o||(o.members&&!orgMember(k)))return;
  const it=intelList(k).find(q=>q.key===c.y);if(!it||it.g>intelAccess())return;const cost=intelCost(k,it.g);if(P.silver<cost)return;P.silver-=cost;
  P.intel=P.intel||[];P.intel.unshift({key:it.key,t:it.t,txt:it.txt,org:o.n});if(P.intel.length>12)P.intel.length=12;if(it.fn)it.fn();
  log(`[${o.n}] ${it.t}: ${it.txt}${cost?` (은자 ${cost})`:''}`,'info')});
// 임무창: 들은 정보 (최근 것부터)
function intelCard(){const L=P.intel||[];if(!L.length)return'';return `<div class="card"><h4>들은 정보 <small class="dim">정보 단체(개방·하오문·천리당·동창)에게서</small></h4>${L.slice(0,6).map(b=>`<p class="note"><b>${esc(b.t)}</b> <small class="dim">${esc(b.org)}</small> ${esc(b.txt)}</p>`).join('')}</div>`}
// ---- 객잔 손님들의 이야기 ----
function innLine(){const T=INTEL.chatter,r=Math.random();
  if(r<.45){const g=gycRumorFor(.4);if(g){gycHear(g.c,Math.min(2,Math.floor(g.L)),g.txt);return g.txt}}
  const t=pick(T),w=G.W&&G.W.pow||{},f=pick(FAC4.filter(x=>w[x]>0).length?FAC4.filter(x=>w[x]>0):['정']),bs=Object.keys(MOBS).filter(m=>MOBS[m].boss),b=pick(bs);
  const weak=typeof sectPop==='function'?Object.values(SECTS).filter(s=>sectPop(s.id)>0).sort((a,c)=>sectPop(a.id)/popBase(a)-sectPop(c.id)/popBase(c))[0]:null;
  return josa(t.replace('{boss}',b).replace('{bossAt}',mobWhere(b)||'어딘가').replace('{fac}',FAC4N[f]).replace('{pow}',Math.round(w[f]||0)).replace('{weak}',weak?weak.n:'어느 문파')
    .replace('{season}',`${season()} ${G.weather}`).replace('{sect}',pick(Object.values(SECTS)).n))}
let innT=0;
hook('tick',dt=>{if(!P||!playing||!INNS.includes(REG)||(innT-=dt)>0)return;innT=INTEL.chat;
  const ps=NPCF.filter(n=>{const o=REGION().npcs.find(q=>q.n===n.n&&q.x===n.x);return o&&o.patron})
    .filter(n=>!gycBub.some(b=>b.o===n));if(!ps.length||gycBub.length>=3)return;const n=pick(ps),txt=innLine();if(!txt)return;
  gycBub.push({o:n,txt,end:time+INTEL.chat+1.5});log(`[객잔] ${n.n}: "${txt}"`,'info')});

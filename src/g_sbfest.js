// ================= 사부 선정 대회 · 대연무장 (v237, 사용자 2026-11-03) =================
// "정파 사파에서 사부를 고르는 것은 문파 대연무장에서 열리는 행사로 만들어줘. 문파의 문파원들과 문파에서 관리하는 지역 주민들이 관객으로 와 있는 하나의 행사로"
// - 정·사파 문파(sabuOn)마다 대연무장 지역 ar_<문파>. 장문인 맵(hqId) 아래 어귀 왼쪽 출입구(SBFEST.gate)로 드나든다
// - 입문하면 서열 비무·사부 고르기·지명 받들기는 대연무장에서만 한다 (g_sabu.js sbDuel·sbpick·sbtake가 sfHere를 본다). 늦은 지명(b.late)은 본산 창에서 그대로
// - 행사 P.sabu.ev: 0/없음 아직 · 1 열림(관객 가득) · 2 끝남(이번에 머무는 동안 관객이 남음) · 3 지나감(평소 대연무장, 연무하는 제자 몇)
// - 자리: 북쪽 단상 앞에 장문인과 사부들, 서쪽 줄에 입문 동기, 동쪽은 문파원, 서쪽 끝과 남쪽은 관할 마을 주민. 비무는 가운데 SBFEST.ring
// - 관객은 이름표 없이(noTag) 서 있다가 함성을 지른다(addText). 비무 중엔 더 자주, 승패가 나면 한꺼번에
const SF=GD.SBFEST,sfId=sid=>'ar_'+sid;
const sfHere=()=>!!(P&&P.sabu&&P.sect===P.sabu.sid&&REG===sfId(P.sabu.sid)&&sectPop(P.sabu.sid)>0);
const sfOpen=b=>b&&(b.st==='rank'||b.st==='pick'||b.st==='named'&&!b.late);   // 대회에서 정할 일이 남았다
const sfLive=()=>sfHere()&&(P.sabu.ev===1||P.sabu.ev===2);
const sfRing=()=>sfHere()?{x:SF.ring[0],y:SF.ring[1]}:null;
const sfFolkName=s=>{const k=typeof pvOfSect==='function'&&pvOfSect(s.id);return `${k?pvName(k):hqPlace(s)} 마을 주민`};
{const[gx,gy]=SF.gate;
  for(const s of Object.values(SECTS)){if(!sabuOn(s)||!REGIONS[hqId(s)]||!HQ_THEME[s.id])continue;
    const id=sfId(s.id),th=HQ_THEME[s.id][0];
    const R=stageRegion({id,name:`${s.n} 대연무장`,s,th,seed:9400+(s.i||0)*17,yard:[7,7,33,31],
      builds:[{x:18,y:3,w:5,h:3,kind:'pavilion'}],lamps:[[8,8],[32,8],[8,30],[32,30]],flags:[[16,15],[25,15],[16,24],[25,24],[12,8],[29,8]],
      zone:()=>`${s.n} 대연무장`,npcs:[],spawns:[]});
    const H=REGIONS[hqId(s)];R.chain=H.chain;R.noGuard=1;   // 순찰조·문지기는 대연무장에 들이지 않는다 (g_guard.js)
    R.gates.push({x:20.5,y:38.6,to:hqId(s),tx:gx,ty:gy-2.4,label:H.name||s.n});
    H.gates.push({x:gx,y:gy,to:id,tx:20.5,ty:36.2,label:'대연무장'})}}
// ---- 사람 배치 ----
function sfNpcs(s){return sfNpcs0(s).filter(sfStay).map(sfName)}
// 공석(죽음)이거나 지금 싸우는 무인으로 나가 있는 고정 NPC는 빼고, 후임 이름을 붙인다 (g_vault.js · g_npcdef.js)
const sfStay=n=>!(typeof npcRole==='function'&&npcRole(n))||!(npcDead(n)||mobs.some(m=>m.hp>0&&m.npcKey===npcKey(n)));
const sfName=n=>{const nm=typeof npcRole==='function'&&npcRole(n)&&G.nname&&G.nname[npcKey(n)];if(nm)n.n=nm;return n};
function sfNpcs0(s){const b=P.sabu,M=sbMasters(s.id),L=[],live=b&&b.sid===s.id&&(b.ev===1||b.ev===2),rng0=rng(4100+(s.i||0));
  const sp=(rk,cls)=>(typeof sectPal==='function'&&sectPal(s.id,rk,cls,{}))||masterPal(s);
  if(!live){for(let i=0;i<SF.crowd.idle;i++)L.push({id:'sf_idle'+i,sfCrowd:'sect',n:`${s.n} 제자`,x:[14.5,26.5,14.5,26.5][i%4],y:[13.5,13.5,25.5,25.5][i%4],fx:i%2?-1:1,fy:0,pal:sp(i%2,M[i%M.length]?M[i%M.length].cls:'검')});
    L.push({id:'sf_host',sfHost:s.id,n:`${s.n} 연무장 교두`,x:20.5,y:12.6,pal:sp(2,'검')});
    // v237b: 사부들은 평소에도 대연무장 단상 앞에서 제자를 가르친다 (사부의 무공·초식은 사부 NPC가 직접 전한다)
    M.forEach((m,i)=>L.push({id:'sf_m'+m.k,sfSid:s.id,sfMaster:m.k,n:`사부 ${m.n}`,x:[16.5,24.5,14.5,26.5][i],y:8.8,pal:sp(4,m.cls)}));return L}
  L.push({id:'sf_host',sfHost:s.id,n:`${s.n} ${masterTitle(s)}`,x:20.5,y:8.4,pal:masterPal(s)});
  const seat=[16.5,24.5,14.5,26.5];
  M.forEach((m,i)=>{const fwd=b.st==='named'&&b.off===m.k;L.push({id:'sf_m'+m.k,sfSid:s.id,sfMaster:m.k,n:`사부 ${m.n}`,x:fwd?20.5:seat[i],y:fwd?11.6:8.8,pal:sp(4,m.cls)})});
  const foe=G.sbDuel&&G.sbDuel.foe;
  b.ord.forEach((n,i)=>{if(n==='@'||n===foe)return;const c=b.coh.find(o=>o.n===n);if(!c)return;
    const tk=b.st!=='rank'&&b.taken?Object.keys(b.taken).find(k=>b.taken[k]===n):null,mi=tk!=null?M.findIndex(m=>m.k===+tk):-1;   // 사부가 데려간 동기는 그 사부 곁에 선다
    L.push({id:'sf_c'+i,sfCoh:n,n:`${i+1}위 ${n}`,x:mi>=0?seat[mi]+(seat[mi]<20?-1.1:1.1):13.2,y:mi>=0?9.6:13+i*1.5,fx:mi>=0?0:1,fy:mi>=0?1:0,pal:sp(0,c.cls)})});
  // 동쪽 문파원 석 줄, 서쪽 끝과 남쪽은 관할 마을 주민
  for(let i=0;i<SF.crowd.sect;i++){const col=i%3,row=Math.floor(i/3);L.push({id:'sf_s'+i,sfCrowd:'sect',noTag:1,n:`${s.n} ${col?'제자':'사형'}`,x:28.6+col*1.3+(row%2)*.4,y:11.2+row*2.6,fx:-1,fy:0,pal:sp(rng0()<.25?1:0,pick(M).cls)})}
  const fp=SF.folkPal,fn=sfFolkName(s);
  for(let i=0;i<SF.crowd.folk;i++){const west=i<SF.crowd.folk*.6,j=west?i:i-Math.ceil(SF.crowd.folk*.6),
    x=west?8.6+(j%2)*1.3+(Math.floor(j/2)%2)*.4:15+j*1.6,y=west?11.6+Math.floor(j/2)*2.2:29.6+(j%2)*.5;
    L.push({id:'sf_f'+i,sfCrowd:'folk',noTag:1,n:fn,x,y,fx:west?1:0,fy:west?0:-1,pal:fp[i%fp.length]})}
  return L}
let SF_KEY='';
function sfSync(force){if(!REG||!REG.startsWith('ar_'))return;const s=SECTS[REG.slice(3)];if(!s)return;const b=P&&P.sabu&&P.sabu.sid===s.id?P.sabu:null;
  const k=b?[b.st,b.ev,b.off,b.ord.join(),G.sbDuel&&G.sbDuel.foe,Object.keys(b.taken||{}).length,mobs.filter(m=>m.npcKey&&m.hp>0).length].join('|'):'-'+mobs.filter(m=>m.npcKey&&m.hp>0).length;if(!force&&k===SF_KEY)return;SF_KEY=k;
  REGION().npcs=sectPop(s.id)<=0?[]:sfNpcs(s);refreshNPCF()}   // 멸문: 대연무장도 폐허, 사부·교두·제자·관객 없음 (user 2026-11-10)
// 그리기: 관객은 이름표 없이, 마주 보는 쪽은 NPC마다 (g_draw.js npcFighter가 fx·fy·noTag를 옮긴다)
// ---- 행사 진행 ----
function sfShout(n,lines,col){if(!n)return;texts.push({x:n.x+(Math.random()-.5)*.3,y:n.y-.2,t:pick(lines),c:col,life:1.3})}
function sfBurst(lines,k=SF.shout.burst){const C=REGION().npcs.filter(n=>n.sfCrowd);for(let i=0;i<k&&C.length;i++){const n=C.splice(Math.floor(Math.random()*C.length),1)[0];sfShout(n,lines||(n.sfCrowd==='sect'?SF.cheerSect:SF.cheerFolk),n.sfCrowd==='sect'?'#e8d9a0':'#f4efe0')}}
function sfOpenEv(){const b=P.sabu,s=SECTS[b.sid],pos=sbPos(),pop=typeof sectPop==='function'?sectPop(s.id):0;b.ev=1;sfSync(true);
  showBanner('사부 선정 대회',`${s.n} 대연무장`);
  log(`${masterTitle(s)}: "오늘 ${s.n}의 새 제자 여섯이 사부를 맞는다. 서열은 실력으로 정한다. 1위는 사부를 직접 고르고, 그 아래는 사부들께서 지명하신다."`,'info');
  log(`${pop?`문파원 ${pop}명과 `:'문파원들과 '}${sfFolkName(s).replace(/ 주민$/,'')} 사람들이 대연무장을 메웠습니다. 지금 서열 ${pos+1}위.${b.st==='rank'?` ${masterTitle(s)}이나 바로 위 동기에게 말을 걸어 서열 비무를 청하세요.`:''}`,'xp');
  sfBurst(null,10)}
// 대회가 끝났다: 남은 동기들도 사부를 정하고 관객이 환호한다
function sfCloseEv(){const b=P.sabu,s=SECTS[b.sid],M=sbMasters(s.id);b.ev=2;b.taken=b.taken||{};
  const free=M.filter(m=>!(m.k in b.taken)&&!(b.st==='disc'&&b.m===m.k)),out=[];
  for(const n of b.ord){if(n==='@'||Object.values(b.taken).includes(n))continue;if(!free.length)break;const c=b.coh.find(o=>o.n===n),j=free.findIndex(m=>m.cls===c.cls),m=free.splice(j>=0?j:0,1)[0];b.taken[m.k]=n}
  for(const k in b.taken){const m=M.find(q=>q.k===+k);if(m)out.push(`${b.taken[k]} → ${m.n}`)}
  sfSync(true);showBanner('사부 선정 대회 끝',b.st==='disc'?`${sbMy().n}의 제자`:'공통 길');
  log(`${masterTitle(s)}: "올해의 사부와 제자가 정해졌다. 모두 정진하라!"${out.length?` 동기들: ${out.join(' · ')}.`:''} 관객들이 크게 환호합니다.`,'xp');sfBurst(SF.winLine,12)}
hook('regionLoaded',id=>{SF_KEY='';if(!id.startsWith('ar_')){if(P&&P.sabu&&P.sabu.ev===2)P.sabu.ev=3;return}
  sfSync(true);if(!sfHere())return;const b=P.sabu;
  if(sfOpen(b)&&!b.ev)setTimeout(()=>{if(sfHere()&&!P.sabu.ev)sfOpenEv()},700);
  else if(b.ev===1)setTimeout(()=>{if(sfHere())showBanner('사부 선정 대회',`서열 ${sbPos()+1}위`)},700)});
hook('tick',dt=>{if(!P||!playing||!REG||!REG.startsWith('ar_'))return;sfSync();if(!sfHere())return;const b=P.sabu;
  if(b.ev===1&&!sfOpen(b)&&!G.sbDuel)sfCloseEv();
  if(!sfLive())return;if(G.sbDuel&&!G.sfD){G.sfD=1;G.sfT=.3;sfBurst(null,4)}else if(!G.sbDuel)G.sfD=0;   // 비무가 시작되면 한꺼번에
  G.sfT=(G.sfT||0)-dt;if(G.sfT>0)return;const[a,c]=G.sbDuel?SF.shout.duel:SF.shout.idle;G.sfT=a+Math.random()*(c-a);sfBurst(null,1)});
hook('sbDuelDone',c=>{if(sfHere())sfBurst(c.win?SF.winLine:SF.loseLine)});
// ---- 대화 ----
function sfHostDlg(n){const s=SECTS[n.sfHost],b=P.sabu&&P.sabu.sid===s.id&&P.sect===s.id?P.sabu:null;
  if(!b||!(b.ev===1||b.ev===2)){return `<p class="note">"${P.sect===s.id?'대연무장은 해마다 입문 제자들의 사부 선정 대회가 열리는 곳이다. 오늘은 조용하군.':`${s.n}의 대연무장이오. 행사 날이면 이 마당이 사람으로 꽉 찬다오.`}"</p>${P.sect===s.id&&sabuOn(s)?sabuCard(s,true):''}`}
  const pos=sbPos(),up=pos>0?b.ord[pos-1]:null;
  const say=b.st==='rank'?(up?`"${esc(P.name)}, 지금 서열 ${pos+1}위. 바로 위 ${esc(up)}와(과) 겨루겠느냐, 아니면 여기서 서열을 굳히겠느냐?"`:'"서열 1위다."')
    :b.st==='pick'?'"서열 1위다. 단상의 사부들 가운데 모실 분께 가서 예를 올려라."':b.st==='named'?`"${esc(sbMasters(s.id)[b.off].n)}께서 너를 지명하셨다. 앞으로 나아가 받들지 정하라."`:'"올해의 사부와 제자가 정해졌다."';
  return `<p class="note">${masterTitle(s)}: ${say}</p>${sabuCard(s,true)}`}
function sfMasterDlg(n){const s=SECTS[n.sfSid],m=s&&sbMasters(s.id).find(q=>q.k===n.sfMaster);if(!m)return'';
  const b=P.sabu&&P.sabu.sid===s.id&&P.sect===s.id?P.sabu:null;
  if(!b)return `<p class="note">"${esc(m.say)}"</p><p class="note"><b>${esc(m.n)}</b> · ${CLASS[m.cls].n} · ${esc(s.n)}의 사부</p>${sbPathHtml(m,false)}<p class="note dim">${P.sect===s.id?'사부 없이 공통 길을 걷는 제자에겐 가르칠 것이 없다.':`${esc(s.n)}의 제자가 아니면 가르치지 않는다.`}</p>`;
  const tk=b.taken&&b.taken[m.k],mine=b.st==='disc'&&b.m===m.k;let act='';
  if(mine)act=`<p class="note good">"내 제자여, 게으르지 마라."</p>${sbMineHtml(m)}`;
  else if(tk)act=`<p class="note dim">동기 ${esc(tk)}을(를) 제자로 거두었다.</p>`;
  else if(b.st==='pick')act=`<div class="row2"><span class="note">서열 1위의 권리로 이 사부를 모실 수 있다.</span>${B('sbpick:'+m.k,'이 사부를 모신다',{pri:1})}</div>`;
  else if(b.st==='disc')act=`<p class="note dim">${esc(sbMy().n)}의 제자는 그 사부에게 배워라.</p>`;
  else if(b.st==='named'&&b.off===m.k)act=`<div class="row2"><span class="note">"너를 제자로 삼고 싶다."</span><span>${B('sbtake','받든다',{pri:1})}${B('sbno','사양하고 공통 길')}</span></div>`;
  else if(b.st==='rank')act=`<p class="note dim">서열이 정해지면 위에서부터 사부를 정한다.</p>`;
  else if(b.st==='common')act=`<p class="note dim">${b.late?'':`${rankName(s.id,SB.late)}에 오르면 눈여겨보마.`}</p>`;
  return `<p class="note">"${esc(m.say)}"</p><p class="note"><b>${esc(m.n)}</b> · ${CLASS[m.cls].n}</p>${sbPathHtml(m,mine)}${act}`}
function sfCohDlg(n){const b=P.sabu,c=b.coh.find(o=>o.n===n.sfCoh),i=b.ord.indexOf(n.sfCoh),pos=sbPos();if(!c)return'';
  const up=b.st==='rank'&&i===pos-1;
  return `<p class="note">"${up?'서열은 실력으로 정하는 거야. 올라올 테면 와 봐!':i<pos?'위 자리는 쉽게 안 내준다.':'다음엔 내가 이긴다.'}"</p><p class="note">서열 ${i+1}위 <b>${esc(c.n)}</b> · ${CLASS[c.cls].n}</p>${up?B('sbduel',`서열 비무 · ${esc(c.n)}`,{pri:1,d:!!G.duel}):''}`}
hook('npcDlg',c=>{if(c.html!=null)return;const n=c.n;
  if(n.sfHost)c.html=sfHostDlg(n);else if(n.sfMaster!=null&&n.sfSid)c.html=sfMasterDlg(n);else if(n.sfCoh&&P.sabu)c.html=sfCohDlg(n);
  else if(n.sfCrowd)c.html=`<p class="note">"${pick(n.sfCrowd==='sect'?SF.talkSect:SF.talkFolk)}"</p>`});
// ---- 마교 장로원 사부 (v237b): SABU.cheonma 장로들이 장로원 마당에 선다. 지명(향주 또는 인연)을 받들고 무공·초식을 직접 받는 곳 ----
const SF_CM_AT=[[15.5,22.5],[20.5,22.5],[24.5,22.5],[18,20.5],[23,20.5]];
hook('regionLoaded',id=>{if(id!=='hq_cheonma_6')return;const R=REGIONS[id],M=sbMasters('cheonma');R.npcs=R.npcs.filter(n=>!n.sfMaster&&n.sfMaster!==0);if(sectPop('cheonma')<=0)return;   // 멸문 폐허엔 장로 사부가 서지 않는다
  M.forEach((m,i)=>{if(G.ndead&&G.ndead['cheonma/sf_m'+m.k])return;const[x,y]=SF_CM_AT[i%SF_CM_AT.length];R.npcs.push({id:'sf_m'+m.k,sfSid:'cheonma',sfMaster:m.k,n:m.n,x,y,pal:(typeof sectPal==='function'&&sectPal('cheonma',4,m.cls,{}))||masterPal(SECTS.cheonma)})});refreshNPCF()});

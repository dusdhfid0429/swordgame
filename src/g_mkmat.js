// ================= 창안 재료를 얻는 길: 견식·비급 낱장·은거기인 (사용자 2026-10-26) =================
// 사용자: "동일한 등급의 무공 숙련도를 100달성 한 무공 5개로 한단계 높은 무공을 창안하는 스팩을 하기위해 무공을 배워야하는데,
//  문파가입 후 배울수 있는 무공의 갯수가 동일등급 5개가 아닌 등급별 하나야. 단순히 무공의 갯수를 늘이는게 아니라 컨텐츠로써 풀고 싶어"
// 제안서(견식·낱장·은거기인 조합을 사용자가 골랐다): https://claude.ai/artifact/Jzf1FcqUoHjg4Hgc5wBSJW
// - 견식(투학): 적이 초식을 펼치는 것을 보거나(GSIK.seeR칸 안), 그 무공에 맞거나, 그 적을 쓰러뜨리면 그 무공의 견식(P.gs[무공])이 쌓인다.
//   본 적 있는 초식 수(g.k)는 그 적이 아는 초식 수(e.known)까지다(전리품 규칙 "아는 초식만"과 같다). 다음 초식의 견식이 다 차면 무공 창에서
//   정리해 사본 비급(it.tu)으로 적는다. 사본은 계열이 달라도 읽을 수 있고, 정파가 다른 계열 사본을 읽으면 악업이 쌓인다.
// - 비급 낱장(slot 'leaf'): 멸문 폐허의 시체·잔해, 동굴 보물상자, 기연동굴, 표국·상단 행렬(털거나 구해 주면)에서 나온다. 같은 무공 낱장끼리 한 장에 쌓이고,
//   LEAF.need[등급]장이 모이면 행낭에서 엮어 아직 모르는 가장 앞 초식의 사본 비급을 만든다. 고급 무공 낱장도 나온다(문파 밖에서 고급을 얻는 길).
// - 은거기인(RECLUSE): 산 맵 정상에 숨어 사는 무소속 고수 열둘(병기마다 둘). 부탁(납품·처치)을 들어주면 은혜가 하나 쌓이고, 은혜 하나로
//   그가 아는 중승 무공 셋 가운데 하나의 첫 초식이나 다음 초식(숙련이 닿으면)을 전수받는다. 중승 무공은 창안 말고는 이들에게서만 배운다
//   (v101에서 소문파 일반 무공이 하승 입문공이 되어 중승 무공이 강호에서 사라졌다).
// 데이터 data/mkmat.json (GSIK, LEAF, RECLUSE), 설계 docs/세력_문파_설계.md 36장, 테스트 tests/t112_mkmat.js
const GSIK=GD.GSIK,LEAF=GD.LEAF,RCL=GD.RECLUSE;
// ---- 은거기인 무공: buildArts(g_core.js 첫머리)에서 부른다. 그때는 이 파일의 const가 아직 없으니 GD만 읽는다 ----
function addRecluseArts(arts,pool,ults,formName,ultName){const R=GD.RECLUSE,g=R.grade,mul=GMUL[g];
  R.list.forEach((rc,ri)=>rc.arts.forEach(([n,el],j)=>{const id=`${rc.id}_${j}`,r=rng(577+ri*41+j*7+n.charCodeAt(0)*3);
    const forms=pickForms(pool[rc.cls],r,R.forms).map((f,i)=>({...f,n:formName(),req:REQ[i],cost:COST[i],bonus:BONUS[i],qp:GD.QSTAR.pct[i],m:f.m*(1+.06*i)*mul}));
    const u=ults[rc.cls][(ri+j)%ults[rc.cls].length];
    arts[id]=artFx({id,side:null,cls:rc.cls,el,n,forms,rc:rc.id,grade:g,
      ult:{n:ultName(),steps:[F('','circle',{rad:2.8,m:GULT[g][0],stun:.3}),...u.steps.map(x=>({...x,m:(x.m||1)*GULT[g][1],delay:(x.delay||0)+.18}))]},
      d:`은거기인 ${rc.n}의 ${AGR[g]} 무공 · ${CLASS[rc.cls].n}. 초식 ${forms.length}개와 필살기. 문파에 매이지 않아 정사 누구나 배운다.`})}))}
// ---- 공통: 사본 비급 ----
const bagAll=()=>[...P.bag,...(G.storage&&G.storage.bag||[])];
const hasBookOf=(id,i)=>bagAll().some(it=>(it.slot==='book'&&it.form===i||it.slot==='wbook')&&it.art===id);   // 완본이 있으면 더 적지 않는다 (v207)
// 아직 모르고 행낭·창고에 비급도 없는 가장 앞 초식 (k: 앞에서 몇 초식까지 볼 수 있나). 없으면 -1
function nextForm(id,k){const a=ARTS[id],s=A(id);if(!a)return -1;for(let i=0;i<Math.min(k,a.forms.length);i++)if(!(s&&s.f[i])&&!hasBookOf(id,i))return i;return -1}
function copyBook(id,i){const a=ARTS[id],b=mkBook(id,i);b.tu=1;b.name=`${a.n} 사본 · ${a.forms[i].n}`;b.price=GSIK.price;return b}
// 사본을 읽은 뒤: 정파가 다른 계열 무공을 익히면 악업 (readBook 이 부른다)
function tuRead(a){if(P.side==='정'&&a.side&&a.side!==P.side){P.evil+=GSIK.sideEvil;log(`${SIDES[a.side].base} 계열 무공을 몰래 익혔다. 악업 +${GSIK.sideEvil}`,'dmg')}}

// ================= 견식 =================
const gsOk=a=>!!a&&!a.base&&!a.gy&&!!a.forms&&a.forms.length>0;
const gsNeed=(a,i)=>Math.round(GSIK.need*(1+GSIK.formK*i)*(1+GSIK.gradeK*(a.grade||0)));
function gsGain(e,v){if(!P||!e||!e.known||!(v>0))return;const a=ARTS[e.art];if(!gsOk(a)||allLearned(a.id))return;const id=a.id;
  const g=(P.gs=P.gs||{})[id]||(P.gs[id]={p:0,k:0});g.k=Math.max(g.k,Math.min(e.known,a.forms.length));
  const d=nextForm(id,g.k),need=gsNeed(a,d<0?Math.min(g.k,a.forms.length-1):d);g.p=Math.min(need*GSIK.cap,g.p+v);
  if(d>=0&&g.p>=need&&g.told!==d){g.told=d;log(`견식: [${a.n}]의 [${a.forms[d].n}]이(가) 눈에 익었다. 무공 창에서 정리하면 사본 비급이 된다.`,'xp')}}
hook('hurtDone',c=>{if(c.src&&c.src.isMob)gsGain(c.src,GSIK.hit)});
hook('formCall',e=>{if(P&&dist(e,P)<=GSIK.seeR)gsGain(e,GSIK.see)});
hook('kill',e=>{if(e.d)gsGain(e,GSIK.kill[mobTier(e)]||0)});
function gsWrite(id){const a=ARTS[id],g=P.gs&&P.gs[id];if(!a||!g)return;const d=nextForm(id,g.k);
  if(d<0||g.p<gsNeed(a,d)){log('아직 정리할 만큼 견식이 쌓이지 않았다.','info');return}if(inCombat()){log('싸움 중에는 견식을 되새길 수 없다.','info');return}
  closePanels();P.chan={t:0,dur:GSIK.chan,label:'견식을 되새긴다',fn:()=>{const d2=nextForm(id,g.k);if(d2<0||g.p<gsNeed(a,d2))return;g.p-=gsNeed(a,d2);g.told=null;
    giveItem(copyBook(id,d2));log(`눈에 익은 [${a.n} · ${a.forms[d2].n}]을(를) 되새겨 사본 비급으로 적었다. 행낭에서 읽으면 익힌다.`,'xp');feat(`${a.n}을(를) 견식으로 익혔다`)}}}
hook('sectAct',c=>{if(c.a!=='gsw')return;c.done=true;c.r=true;gsWrite(c.x)});
const sideTxt=a=>a.side&&SIDES[a.side]?SIDES[a.side].n:'정사 공용';
// 무공 창의 '창안 재료' 칸: 견식 목록과 만난 은거기인
function gsHtml(){if(!P)return'';const L=Object.entries(P.gs||{}).filter(([id])=>ARTS[id]&&!allLearned(id)).map(([id,g])=>{const a=ARTS[id],d=nextForm(id,g.k);return{id,a,g,d,need:d>=0?gsNeed(a,d):0}})
    .sort((x,y)=>(y.d>=0?y.g.p/y.need:-1)-(x.d>=0?x.g.p/x.need:-1)).slice(0,GSIK.rows);
  const rows=L.map(({id,a,g,d,need})=>{const ok=d>=0&&g.p>=need;
    return `<div class="it"><div style="color:rgb(${a.ct})">${a.n} ${gradeTag(a.grade||0)} <small class="dim">${sideTxt(a)} ${CLASS[a.cls].n}</small><span>본 초식 ${g.k}/${a.forms.length} · ${d>=0?`다음 [${a.forms[d].n}] 견식 ${Math.floor(Math.min(g.p,need))}/${need}`:'더 적을 초식이 없다 (더 깊은 초식을 아는 적을 만나야 한다)'}</span></div><div class="ib">${B('gsw:'+id,ok?'정리':'견식 중',{d:!ok,pri:ok})}</div></div>`}).join('');
  const met=RCL.list.filter(rc=>G.rcMet&&G.rcMet[rc.id]).map(rc=>`${rc.n}(${REGIONS[rc.reg].name} · ${CLASS[rc.cls].n} · 은혜 ${rcSt(rc.id).tok})`);
  return `<div class="card"><h4>창안 재료 <small class="dim">같은 병기·같은 등급 다섯을 모으는 길</small></h4>
    <p class="note"><b>견식</b> 적이 초식을 펼치는 것을 보거나 맞거나 쓰러뜨리면 그 무공의 견식이 쌓인다. 다 차면 정리해 사본 비급으로 적는다. 그 적이 아는 초식까지만 적을 수 있다. 다른 계열의 사본도 읽을 수 있지만 정파는 악업이 쌓인다.</p>
    <div class="list">${rows||'<p class="note">아직 견식한 무공이 없다.</p>'}</div>
    <p class="note"><b>비급 낱장</b> 멸문 폐허·동굴 상자·기연동굴·표국 행렬에서 나온다. 같은 무공 낱장을 하승 ${LEAF.need[0]}·중승 ${LEAF.need[1]}·상승 ${LEAF.need[2]}·절정 ${LEAF.need[3]}장 모으면 행낭에서 엮는다.</p>
    <p class="note"><b>완본</b> 익히지 않은 무공의 사본·비급을 마지막 초식까지 모두 모으면 행낭에서 완본으로 엮는다. 오성 칸을 쓰지 않고, 다른 병기 같은 등급 무공을 창안할 때 재료 한 자리를 대신한다(다섯 중 ${MK_SUB}자리까지). 초식을 모두 익힌 다른 병기 무공도 숙련과 상관없이 그 자리를 채운다.</p>
    <p class="note"><b>은거기인</b> 산 정상에 숨어 사는 무소속 고수들이 중승 무공을 전한다. 객잔에서 소문을 들을 수 있다.${met.length?` 만난 기인: ${met.join(' · ')}`:''}</p></div>`}

// ================= 비급 낱장 =================
const leafNeed=a=>LEAF.need[Math.min(LEAF.need.length-1,a.grade||0)];
const bagLeaf=id=>bagAll().find(it=>it.slot==='leaf'&&it.art===id);
function giveLeaf(id,n,where){const a=ARTS[id];if(!a||!(n>0))return null;id=a.id;const it=bagLeaf(id);let have=n;
  if(it){it.n+=n;have=it.n}else giveItem({id:++itemId,slot:'leaf',art:id,n,name:`${a.n} 비급 낱장`,price:LEAF.price});
  log(`${where?where+'에서 ':''}[${a.n}] 비급 낱장 ${n}장을 찾았다. (${have}/${leafNeed(a)}장 · 다 모으면 행낭에서 엮는다)`,'xp');return a}
// 낱장이 나올 무공: 문파 무공 가운데 (cls 병기, minG 등급 이상, sects 그 문파들만). 모으던 낱장이 있으면 그 무공을 더 쳐 준다
function leafPick(o={}){const L=new Set();
  for(const s of Object.values(SECTS)){if(o.sects&&!o.sects.includes(s.id))continue;for(const m of s.arts){const a=ARTS[m.id];if(!a||a.made||a.gy)continue;
    if(o.cls&&a.cls!==o.cls)continue;if(o.minG!=null&&(a.grade||0)<o.minG)continue;L.add(a.id)}}
  const ids=[...L];if(!ids.length)return null;const mine=ids.filter(bagLeaf);return mine.length&&Math.random()<.4?pick(mine):pick(ids)}
const myCls=()=>P.eq&&P.eq.weapon?P.eq.weapon.cls:curCls();
function leafDesc(it){const a=ARTS[it.art];if(!a)return '알 수 없는 무공의 낱장';const need=leafNeed(a);
  return `${AGR[a.grade||0]} · ${sideTxt(a)} ${CLASS[a.cls].n} · 낱장 ${it.n}/${need}장 · 다 모으면 엮어서 아직 모르는 초식의 사본 비급을 만든다`}
function leafBlock(it){const a=ARTS[it.art];if(!a)return '지금 강호에 전하지 않는 무공의 낱장이다.';const need=leafNeed(a);
  if(it.n<need)return `낱장이 모자란다. (${it.n}/${need}장)`;if(nextForm(a.id,a.forms.length)<0)return '엮어 낼 초식이 없다. 모두 익혔거나 그 비급이 이미 있다.';return null}
function leafBind(it){const a=ARTS[it.art],no=leafBlock(it);if(no){log(no,'info');return}const d=nextForm(a.id,a.forms.length);
  it.n-=leafNeed(a);if(it.n<=0){const i=P.bag.indexOf(it);if(i>=0)P.bag.splice(i,1)}
  giveItem(copyBook(a.id,d));log(`낱장을 엮어 [${a.n} · ${a.forms[d].n}] 사본 비급을 만들었다. 행낭에서 읽으면 익힌다.`,'xp')}
// 표국·상단 행렬: 털어 수레를 부수거나 습격에서 구해 주면 (그 성 문파들의 무공, 반쯤은 내 병기)
function cvLeaf(where){const k=typeof cvProv==='function'?cvProv():null,ss=k&&PROV[k]&&PROV[k].sects||null;
  const id=leafPick({sects:ss&&ss.length?ss:null,cls:Math.random()<.5?myCls():null})||leafPick({});if(id)giveLeaf(id,1,where)}

// ================= 은거기인 =================
const RC={};RCL.list.forEach(rc=>{RC[rc.id]=rc;PAL['rc_'+rc.id]={...(PAL[rc.pal]||PAL.taoist),weapon:CLASS[rc.cls].draw}});
const rcArts=rc=>rc.arts.map((x,j)=>`${rc.id}_${j}`).filter(id=>ARTS[id]);
const rcSt=id=>{P.rc=P.rc||{};return P.rc[id]||(P.rc[id]={k:0,tok:0})};
{for(const rc of RCL.list){const R=REGIONS[rc.reg];if(!R)continue;R.npcs=R.npcs||[];R.npcs.push({id:'rc',rc:rc.id,n:`은거기인 ${rc.n}`,x:10.5,y:7.5,pal:'rc_'+rc.id})}}
// 정상 가까이 걸을 수 있는 칸에 앉힌다 (산 지형은 바위가 많다)
hook('regionLoaded',id=>{const R=REGIONS[id],n=R&&(R.npcs||[]).find(q=>q.rc);if(!n)return;let b=null,bd=1e9;
  for(let j=3;j<12;j++)for(let i=2;i<N-2;i++){if(!walk(i,j))continue;const d=Math.hypot(i-10,j-6.5);if(d<bd){bd=d;b={x:i+.5,y:j+.5}}}
  if(b){n.x=b.x;n.y=b.y;refreshNPCF()}});
function rcTask(rc,k){const T=rc.tasks[k%rc.tasks.length],mul=1+Math.floor(k/rc.tasks.length)*RCL.taskMul,cnt=Math.max(1,Math.round(T.cnt*mul));
  const what=T.kind==='give'?`${T.mat} ${cnt}개`:`${T.mob.join('·')} ${cnt}`;
  return{n:`[${rc.n}의 부탁] ${T.kind==='give'?`${T.mat}을(를) 가져다 다오`:`${T.mob.join('·')}을(를) 물리쳐 다오`}`,kind:T.kind,mat:T.mat,mob:T.mob,cnt,silver:0,vit:15+k*5,fame:2,good:3,rc:rc.id,key:`rc:${rc.id}:${k}`,what}}
function rcDlg(n){const rc=RC[n.rc];if(!rc)return'';
  if(realmIdx()<RCL.realm)return `<p class="note">${esc(n.n)}: "눈이 아직 트이지 않았구나. ${rk(RCL.realm)}에 오르거든 다시 오너라."</p>`;
  (G.rcMet=G.rcMet||{})[rc.id]=1;const st=rcSt(rc.id),qi=P.quests.findIndex(q=>q.rc===rc.id),on=P.quests[qi];
  const task=on?misRow(on,misSpan(on,on)+' · 은혜 +1',misReport(on,qi)):(t=>misRow(t,`${t.what} · 은혜 +1 · 활력 ${t.vit}`,B('rctake:'+rc.id,'부탁 듣기',{d:P.quests.length>=4,t:P.quests.length>=4?'임무는 넷까지 맡는다':''})))(rcTask(rc,st.k));
  const arts=rcArts(rc).map((id,j)=>{const a=ARTS[id],s=A(id),fi=s?a.forms.findIndex((f,i)=>!s.f[i]):0,book=fi>=0&&hasBookOf(id,fi);
    const why=fi<0?'모두 배움':book?'비급이 행낭에 있다':st.tok<1?'은혜 1 필요':!s&&capArts().length>=artCap()?`오성 ${P.wis}로는 ${artCap()}가지까지`:s&&s.p<a.forms[fi].req?`숙련 ${a.forms[fi].req} 필요`:'';
    return `<div class="it"><div style="color:rgb(${a.ct})">${a.n} ${gradeTag(a.grade)} <small class="dim">${CLASS[a.cls].n}</small><span>초식 ${a.forms.length}개${s?` · 익힌 초식 ${s.f.filter(Boolean).length} · 숙련 ${Math.floor(s.p)}`:''}${fi>=0?` · 다음 [${a.forms[fi].n}] 숙련 ${a.forms[fi].req}`:''}</span></div>
      <div class="ib">${B(`rcteach:${rc.id}:${j}`,why||(s?'가르침 청하기 · 은혜 1':'배우기 · 은혜 1'),{d:!!why,pri:!why})}</div></div>`}).join('');
  return `<p class="note">${esc(n.n)}: "${esc(rc.hello)} 공짜로 가르치진 않는다. 늙은이 부탁을 들어주면 하나씩 일러 주마."</p>
    <div class="card"><h4>${esc(rc.n)} <small class="dim">은거기인 · ${CLASS[rc.cls].n} · 무소속</small></h4><p>은혜 <b class="gold">${st.tok}</b> · 들어준 부탁 ${st.k} <small class="dim">(은혜 하나로 한 초식을 전수받는다)</small></p></div>
    <h4 style="margin:0">부탁</h4><div class="list">${task}</div><h4 style="margin:0">전하는 무공 <small class="dim">중승 · 정사 공용</small></h4><div class="list">${arts}</div>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.rc)c.html=rcDlg(c.n)});
hook('sectAct',c=>{if(c.a==='rctake'){c.done=true;c.r=true;const rc=RC[c.x];if(!rc||realmIdx()<RCL.realm||P.quests.length>=4||P.quests.some(q=>q.rc===rc.id))return;
    const t=rcTask(rc,rcSt(rc.id).k);P.quests.push({...t,have:0});log(`${rc.n}의 부탁 [${t.what}]을(를) 맡았다. 마치면 이곳 정상으로 돌아와 아뢴다.`,'info');return}
  if(c.a!=='rcteach')return;c.done=true;c.r=true;const rc=RC[c.x],id=rc&&rcArts(rc)[+c.y],a=id&&ARTS[id];if(!a)return;const st=rcSt(rc.id),s=A(id),fi=s?a.forms.findIndex((f,i)=>!s.f[i]):0;
  if(fi<0||st.tok<1||hasBookOf(id,fi)||(!s&&capArts().length>=artCap())||(s&&s.p<a.forms[fi].req))return;
  st.tok--;giveItem(mkBook(id,fi));log(`${rc.n}이(가) [${a.n} · ${a.forms[fi].n}]을(를) 일러 주었다. 받아 적은 비급을 행낭에서 읽으면 익힌다.`,'xp');if(!s)feat(`은거기인 ${rc.n}에게서 ${a.n}을(를) 배웠다`)});
hook('questDone',q=>{if(!q.rc||!RC[q.rc])return;const st=rcSt(q.rc);st.k++;st.tok++;log(`${RC[q.rc].n}: "고맙구나." 은혜 +1 (${st.tok})`,'xp')});
// 객잔 손님 소문: 아직 만나지 않은 기인 하나
function rcRumor(){const L=RCL.list.filter(rc=>!(G.rcMet&&G.rcMet[rc.id])&&REGIONS[rc.reg]);if(!L.length)return'';const rc=pick(L),R=REGIONS[rc.reg],pv=PROV[R.prov]?PROV[R.prov].n:'';
  return `${pv} ${R.name} 꼭대기에 ${CLASS[rc.cls].n}을 쓰는 노인이 숨어 산다더군. 문파에 매이지 않은 무공이라던데.`}

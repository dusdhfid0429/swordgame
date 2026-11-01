// ================= 문파 고르기 카드 (v221, 개선 계획 2절 · 동훈님 2026-11-01 "문파카드 좋은것 같아 추가해줘") =================
// 무관을 졸업하면 관주 앞 추천서 칸이 카드 고르기가 된다: 추천서를 써 줄 문파 후보 SCARD.pick장(같은 진영·성적에 맞는 등급) + 낭인 카드.
//  카드는 몸에 맞는 문파일수록 잘 뽑힌다 — 고른 병기(P.acad.cls)·운용 심법 계열(pSchool)·근골의 가장 센 기둥·업보(선업−악업).
//  카드 한 장: 문파 성격(s.d) · 대표 입문공(startSetTxt) · 앙숙(무림록 LORE.rel) · 천하대전 위험(내 세력 힘 대 가장 센 세력) 한 줄씩.
//  성적이 모자라 추천서를 못 받는 명문은 잠긴 카드로 SCARD.lockN장까지 보여 준다(본산에서 직접 들어가는 길은 그대로).
//  윤회 해금(SCARD.unlock): 지난 생이 쌓이면 다시 뽑기·카드 한 장 더. 뽑힌 카드는 P.acad.cards에 남아 창을 다시 열어도 같다.
// 고르면 acadRec(id)(g_academy.js)와 같다: 추천서를 받고, 본산에 가서 들어가면 공적을 얹어 받는다. 수치는 data/sectcard.json
const SCARD=GD.SCARD;
const scLives=()=>Math.max(0,+(G.lives||0));
const scUnlock=()=>{const u={reroll:0,extra:0};for(const r of SCARD.unlock)if(scLives()>=r.lives){u.reroll+=r.reroll||0;u.extra+=r.extra||0}return u};
// 근골의 가장 센 기둥 (같은 값이면 앞 기둥)
const scGgTop=()=>{const g=GEUNGOL[P.side]&&GEUNGOL[P.side][P.gg];if(!g)return null;const k=['str','end','agi','qi'],v=g.slice(1,5);return k[v.indexOf(Math.max(...v))]};
const scWpn=()=>(P.acad&&P.acad.cls)||(P.eq.weapon&&P.eq.weapon.cls)||'권';
// 이 문파가 내 몸에 맞는 까닭들 (카드에 작은 표로 붙고, 뽑힐 무게가 된다)
function scWhy(s){const W=SCARD.w,st=START[s.id]||{},sc=simSchoolOf(s.id),why=[];let w=W.base;
  if(st.w&&st.w===scWpn()){w+=W.wpn;why.push(`${st.w} 병기가 맞다`)}
  if(sc===pSchool()){w+=W.sc;why.push(`${sc} 심법이 맞다`)}
  const gt=scGgTop();if(gt&&st.w&&(SCARD.gg[gt]||[]).includes(st.w)){w+=W.gg;why.push('근골에 맞는 병기')}
  const K=SCARD.karma,kv=(P.good||0)-(P.evil||0);
  if(kv>=K.good&&K.goodSc.includes(sc)){w+=W.karma;why.push('선업이 통한다')}else if(-kv>=K.evil&&K.evilSc.includes(sc)){w+=W.karma;why.push('악업이 통한다')}
  return{w,why}}
// 추천서를 받을 수는 없지만 같은 진영의 더 높은 명문
const scLockList=()=>{const ok=acadRecList(),t=acadRecTiers();return Object.values(SECTS).filter(s=>(s.al==='jeong'||s.al==='sacheon')&&ALLY[s.al].side===P.side&&!t.includes(s.tier)&&!ok.includes(s)&&!(G.seal&&G.seal[s.id])&&!(G.occ&&G.occ[s.id]))};
// 무게대로 겹치지 않게 n장 (lastOut은 다시 뽑을 때 되도록 빼는 것)
function scDraw(pool,n,lastOut){const out=[],L=pool.filter(s=>!(lastOut||[]).includes(s.id)),src=L.length>=n?L:pool.slice();
  while(out.length<n&&src.length){let tot=0;const ws=src.map(s=>{const v=scWhy(s).w;tot+=v;return v});let r=Math.random()*tot,i=0;for(;i<ws.length-1;i++){r-=ws[i];if(r<=0)break}out.push(src.splice(i,1)[0].id)}
  return out}
function scDeal(lastOut){const a=P.acad,n=SCARD.pick+scUnlock().extra;a.cards=scDraw(acadRecList(),n,lastOut);
  a.lockCards=scLockList().sort((x,y)=>(y.tier==='big')-(x.tier==='big')).slice(0,SCARD.lockN).map(s=>s.id)}
const scCards=()=>{const a=P.acad;if(!a.cards)scDeal();a.cards=a.cards.filter(id=>SECTS[id]&&acadRecList().includes(SECTS[id]));return a.cards};
// 천하대전 위험: 내 세력 힘 대 가장 센 다른 세력
function scRisk(s){const f=alFac(s.al),pw=wld().pow||{},me=pw[f]||0,R=SCARD.risk;let top=0,tn='';
  for(const[k,v]of Object.entries(pw))if(k!==f&&k!=='관'&&v>top){top=v;tn=FACN[k]||k}
  const lv=!top?'':me>=top*R.hi?'<b class="good">우세</b>':me<top*R.lo?'<b class="bad">열세</b>':'<b class="gold">팽팽</b>';
  return `${FACN[f]||f} 쪽에 선다${lv?` · ${tn}에 ${lv}`:''}${s.tier==='small'?' · 작은 문파라 결전에서 먼저 무너지기 쉽다':''}`}
const scFeud=s=>{const L=(typeof REL!=='undefined'&&REL[s.id]||[]).filter(r=>r.k==='feud'&&SECTS[r.o]);return L.length?L.slice(0,2).map(r=>SECTS[r.o].n).join(' · '):'없다'};
function scCardHtml(s,locked){const t=typeof tierName==='function'?tierName(s):TIERN[s.tier],y=scWhy(s);
  return `<div class="scard${locked?' lock':''}"><h5>${s.n} <small class="dim">${t} · ${hqPlace(s)}</small></h5>
    <p><b class="dim">성격</b> ${esc(s.d)}</p><p><b class="dim">입문공</b> ${startSetTxt(s)}</p><p><b class="dim">앙숙</b> ${scFeud(s)}</p><p><b class="dim">천하대전</b> ${scRisk(s)}</p>
    ${!locked&&y.why.length?`<p class="good"><small>${y.why.join(' · ')}</small></p>`:''}
    ${locked?`<p class="note">명문이라 ${s.tier==='big'?'수석':'우등'} 졸업이어야 추천서를 써 준다. 본산에 직접 찾아가 들 수는 있다.</p>`:B('acrec:'+s.id,'추천서를 받는다',{pri:1})}</div>`}
function scHtml(){const a=P.acad,A=acadOf(P.side),g=ACAD_GRADE.find(g=>g.n===a.grade)||{},u=scUnlock(),left=u.reroll-(a.reroll||0);
  const cards=scCards().map(id=>scCardHtml(SECTS[id])).join('')+(a.lockCards||[]).filter(id=>SECTS[id]).map(id=>scCardHtml(SECTS[id],1)).join('');
  return `<div class="card"><h4>갈 길을 고른다 <small class="dim">${a.grade} 졸업 · 추천서 ${acadRecTiers().map(t=>TIERN[t]||t).join('·')}</small></h4>
    <p class="note">"네 몸과 손에 맞을 만한 곳들이다. 추천서를 낸 문파는 명성·나이를 따지지 않고 받아 주고 공적 ${g.merit||0}을(를) 얹어 준다."</p>
    <div class="scards">${cards}<div class="scard ronin"><h5>낭인으로 떠난다</h5><p>어느 문파에도 매이지 않고 강호를 떠돈다. 문파는 나중에 본산에 찾아가 들 수도 있다.</p>${B('acrec:none','낭인으로')}</div></div>
    <div class="row2">${B('acrec:maeng',`${MAENG[A.al].short} 맹원으로`,{d:!!(P.sect||P.maeng)})}${u.reroll?B('screroll',`다시 뽑기 (${Math.max(0,left)}번)`,{d:left<=0,t:'윤회를 거듭해 열린 다시 뽑기'}):''}</div></div>`}
hook('sectAct',c=>{if(c.a!=='screroll')return;c.done=true;c.r=true;const a=P.acad;if(!a||!a.grad||a.recDone)return;
  if((a.reroll||0)>=scUnlock().reroll)return;a.reroll=(a.reroll||0)+1;scDeal(a.cards);log('관주가 다른 문파들을 떠올려 본다.','info')});

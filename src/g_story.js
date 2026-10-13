// ================= 천하대전 스토리 엔진 (사용자 구상 2026-10-13) =================
// 생마다 8세에 태어나 20세부터 사건 10개가 반년 간격으로 터지고, 26세에 천하대전이 난다 (data/story.json STORY.T, EV).
// 세상 상태(G.W 세력의 힘과 관계, G.seal 봉문, G.occ 점령, G.wars 지난 대전)는 생을 넘어 이어지고, 타이틀의 '처음부터 새로'만 되돌린다.
// 이번 생의 선택은 P.story에 적고, 죽을 때 강호사(G.history[].story)에 남겨 다음 생의 사건 창에 '전생의 흔적'으로 보인다.
// 사건은 열리면 정세 창(N)이 뜨고, 고르지 않은 채 다음 사건이 오면 세 번째 선택(기본)으로 흘러간다. 설계: docs/스토리_설계.md
const STORY=GD.STORY,SEV=STORY.EV,ST=STORY.T;
const FAC4=['정','사','마','관'],FAC4N={정:'정파',사:'사파',마:'마교',관:'관군'};
const clone=o=>JSON.parse(JSON.stringify(o));
const wld=()=>{if(!G.W)G.W=clone(STORY.INIT);if(!G.seal)G.seal={};if(!G.occ)G.occ={};if(!G.wars)G.wars=[];return G.W};
const PS=()=>{if(!P.story)P.story={pick:{},open:null,done:{},flag:{}};return P.story};
const wClamp=()=>{const w=wld();for(const k in w.pow)w.pow[k]=clamp(Math.round(w.pow[k]*10)/10,0,100);for(const k in w.rel)w.rel[k]=clamp(Math.round(w.rel[k]*10)/10,-100,100)};
function powAdd(f,v){const w=wld();if(w.pow[f]==null)return;w.pow[f]+=v;wClamp()}
function relAdd(k,v){const w=wld();if(w.rel[k]==null)return;w.rel[k]+=v;wClamp()}
// 플레이어 편의 세력 (문파 없으면 타고난 성향). 관군은 금군 제자
const myFac=()=>pfac();
// ---- 조건 문법: "pow.정>=50" "fac in:정,관" "side==사|evil>=5"(| 는 또는). 줄 여러 개는 모두 맞아야 한다 ----
function condVal(k){const w=wld(),s=PS();
  if(k.startsWith('pow.'))return w.pow[k.slice(4)]??0;if(k.startsWith('rel.'))return w.rel[k.slice(4)]??0;if(k.startsWith('pick.'))return s.pick[k.slice(5)]??-9;if(k.startsWith('flag.'))return s.flag[k.slice(5)]?1:0;
  switch(k){case'fame':return P.fame;case'good':return P.good;case'evil':return P.evil;case'karma':return P.good-P.evil;case'realm':return realmIdx();case'age':return Math.floor(P.age);case'side':return P.side;case'fac':return myFac();case'sect':return P.sect||'';case'lives':return G.lives;case'silver':return P.silver}
  return 0}
function condOne(c){const m=c.match(/^([\w.가-힣]+)\s*(>=|<=|==|!=|in:)\s*(.*)$/);if(!m)return true;const v=condVal(m[1]),r=m[3].trim();
  if(m[2]==='in:')return r.split(',').map(x=>x.trim()).includes(String(v));
  const n=+r,num=r!==''&&!isNaN(n);
  if(m[2]==='==')return num?v==n:String(v)===r;if(m[2]==='!=')return num?v!=n:String(v)!==r;if(m[2]==='>=')return +v>=n;return +v<=n}
const condOk=list=>!list||list.every(line=>line.split('|').some(c=>condOne(c.trim())));
const CONDN={fame:'명성',good:'선업',evil:'악업',karma:'업보',realm:'경지',side:'성향',fac:'편',sect:'문파',lives:'생',silver:'은자'};
function condTxt(list){return (list||[]).map(line=>line.split('|').map(c=>{const m=c.trim().match(/^([\w.가-힣]+)\s*(>=|<=|==|!=|in:)\s*(.*)$/);if(!m)return c;
  const k=m[1].startsWith('pow.')?FAC4N[m[1].slice(4)]+' 힘':m[1].startsWith('rel.')?m[1].slice(4)+' 관계':CONDN[m[1]]||m[1],v=m[1]==='realm'&&!isNaN(+m[3])?rk(+m[3]):m[3].replace(/,/g,'·');
  return `${k} ${{'>=':v+' 이상','<=':v+' 이하','==':v,'!=':v+' 아님','in:':v}[m[2]]}`}).join(' 또는 ')).join(', ')}
// ---- 효과: pow·rel·fame·good·evil·silver·powSelf(내 편의 힘)·flag·seal{side,n}·unseal ----
function applyFx(fx,why){if(!fx)return;const out=[];
  if(fx.pow)for(const k in fx.pow){powAdd(k,fx.pow[k]);out.push(`${FAC4N[k]} 힘 ${fx.pow[k]>0?'+':''}${fx.pow[k]}`)}
  if(fx.powSelf){const f=myFac();powAdd(f,fx.powSelf);out.push(`${FAC4N[f]} 힘 +${fx.powSelf}`)}
  if(fx.rel)for(const k in fx.rel){relAdd(k,fx.rel[k]);out.push(`${k} 관계 ${fx.rel[k]>0?'+':''}${fx.rel[k]}`)}
  for(const k of['fame','good','evil','silver'])if(fx[k]){P[k]+=fx[k];out.push(`${{fame:'명성',good:'선업',evil:'악업',silver:'은자'}[k]} ${fx[k]>0?'+':''}${fx[k]}`)}
  if(fx.flag)PS().flag[fx.flag]=true;
  if(fx.seal){const got=sealSects(fx.seal.side,fx.seal.n||1,fx.seal.tier||'big');if(got.length)out.push(`${got.map(s=>s.n).join('·')} 봉문`)}
  if(fx.unseal){const got=unsealSects(fx.unseal==='own'?(P.sect&&SECTS[P.sect]?[P.sect]:[]):Object.keys(G.seal).filter(id=>SECTS[id]&&alFac(SECTS[id].al)===fx.unseal));if(got.length)out.push(`${got.map(s=>s.n).join('·')} 개문`)}
  if(out.length)log(`${why?why+': ':''}${out.join(', ')}`,'sys');return out}
// ---- 봉문: 산문을 닫은 문파는 제자를 받지 않는다 (joinBlock). 열면 다시 받는다 ----
function sealSects(side,n,tier){const cands=Object.values(SECTS).filter(s=>alFac(s.al)===side&&(tier?s.tier===tier:true)&&!G.seal[s.id]&&s.id!==P.sect);
  const got=[];for(let i=0;i<n&&cands.length;i++){const s=cands.splice(Math.floor(Math.random()*cands.length),1)[0];G.seal[s.id]={y:Math.floor(G.cal),life:P.lifeNo};got.push(s)}
  if(got.length)log(`${got.map(s=>s.n).join('·')}이(가) 산문을 닫고 봉문했습니다.`,'dmg');return got}
function unsealSects(ids){const got=[];for(const id of ids)if(G.seal[id]){delete G.seal[id];got.push(SECTS[id])}if(got.length)log(`${got.map(s=>s.n).join('·')}이(가) 산문을 열었습니다.`,'xp');return got}
// ---- 천하대전 구도: 규칙을 순서대로 보고 처음 맞는 것. 관군은 정관 관계가 좋으면 정파 쪽, 힘이 넘치면 '관군 토벌'로 모두를 친다. 마교는 힘이 바닥이면 빠진다 ----
function warPlan(){const w=wld(),R=STORY.RULES;let rule=STORY.WAR.find(r=>condOk(r.cond))||STORY.WAR[STORY.WAR.length-1];
  let sides=clone(rule.sides),notes=[];
  if(w.pow.마<R.magyoOut){sides=sides.map(s=>s.filter(f=>f!=='마')).filter(s=>s.length);notes.push('마교는 힘이 바닥나 물러선다')}
  if(w.pow.관>=R.gunPunish){sides.push(['관']);notes.push('조정이 무림 전체를 토벌하러 나선다')}
  else if(w.rel.정관>=R.gunJoin){const s=sides.find(s=>s.includes('정'));if(s){s.push('관');notes.push('관군이 정파 편에 선다')}}
  const n=sides.length<2?'중재 (싸울 상대가 없다)':sides.length===3&&rule.id==='three'?rule.n:sides.map(s=>s.map(f=>FAC4N[f]).join('·')).join(' 대 ');
  return{id:rule.id,n,d:rule.d,sides,notes}}
const sideName=s=>s.map(f=>FAC4N[f]).join('·');
// ---- 생의 단계와 남은 해 ----
function lifeStage(){const a=P.age;let n=ST.stages[0][1];for(const[ag,nm]of ST.stages)if(a>=ag)n=nm;return n}
const yearsToWar=()=>Math.max(0,ST.war-P.age);
// ---- 사건 열기·고르기·미루기 ----
const evOf=id=>SEV.find(e=>e.id===id);
function evState(e){const s=PS();return s.pick[e.id]!=null?'done':s.open===e.id?'open':'wait'}
function openEvent(e){const s=PS();s.open=e.id;showBanner(e.n,'강호의 사건 · 정세 창(N)에서 선택');log(`[사건] ${e.n}: ${e.t}`,'sys');P.feats.push(`${Math.floor(P.age)}세에 ${e.n}을(를) 마주했다`);
  if(playing&&!trnOpen&&(!panel||panel==='story')){if(panel==='story'&&!$('win').hidden)renderOpen();else{panel=null;openPanel('story')}}}
function pickChoice(e,i,auto){const s=PS(),ch=e.ch[i];if(!ch||s.pick[e.id]!=null)return false;if(!auto&&!condOk(ch.req)){log(`아직 할 수 없다: ${condTxt(ch.req)}`,'info');return false}
  s.pick[e.id]=i;if(s.open===e.id)s.open=null;
  log(auto?`[${e.n}] 손쓰지 못한 채 흘러갔다: ${ch.n}`:`[${e.n}] ${ch.n}`,auto?'info':'xp');
  applyFx(ch.fx,e.n);
  if(ch.quest){const q={...ch.quest,kind:'kill',have:0,story:e.id,ci:i,key:'story:'+e.id};P.quests.push(q);log(`임무 [${q.n}]을(를) 맡았습니다. 끝내면 정세 창에서 보고한다.`,'sys')}
  else s.done[e.id]=true;
  if(e.id===SEV[SEV.length-1].id)warStart();
  return true}
hook('questDone',q=>{if(!q.story)return;const e=evOf(q.story),ch=e&&e.ch[q.ci];if(!ch)return;PS().done[e.id]=true;applyFx(ch.done,e.n);P.feats.push(`${Math.floor(P.age)}세에 ${e.n}: ${ch.n}`)});
// 매 틱: 나이가 사건의 때를 지나면 연다. 먼저 열린 사건이 남아 있으면 기본 선택으로 흘려보낸다. 마지막 사건을 미루면 전쟁이 나는 해에 흘러간다
hook('tick',()=>{if(!P||!playing)return;wld();const s=PS();
  const due=SEV.filter(e=>s.pick[e.id]==null&&P.age>=e.age);
  if(due.length){const e=due[due.length-1];for(const o of due.slice(0,-1))pickChoice(o,o.ch.length-1,true);if(s.open!==e.id)openEvent(e)}
  if(s.open===SEV[SEV.length-1].id&&P.age>=ST.war)pickChoice(SEV[SEV.length-1],SEV[SEV.length-1].ch.length-1,true);
  if(!G.war&&P.age>=ST.war&&s.pick[SEV[SEV.length-1].id]!=null)warStart();
});
// ---- 천하대전 발발 (전투·점령은 다음 단계. 지금은 구도를 정해 알리고 기록한다) ----
function warStart(){if(G.war&&G.war.life===P.lifeNo)return;const plan=warPlan();G.war={life:P.lifeNo,y:Math.floor(G.cal),plan,round:0,won:null};
  showBanner('천하대전',plan.n);log(`천하대전이 터졌다: ${plan.n}. ${plan.d}${plan.notes.length?' '+plan.notes.join('. ')+'.':''}`,'dmg');P.feats.push(`${Math.floor(P.age)}세에 천하대전(${plan.n})을 맞았다`)}
// ---- 해마다: 마교는 저절로 세를 불린다. 지난 대전의 패자는 서서히 힘을 되찾는다 ----
hook('newYear',()=>{const w=wld();for(const k in STORY.DRIFT)powAdd(k,STORY.DRIFT[k]);
  const last=G.wars[G.wars.length-1];if(last&&last.lost)for(const f of last.lost)powAdd(f,STORY.WIN.loserDrift)});
// ---- 처치와 임무가 세력의 힘을 움직인다 ----
hook('kill',e=>{const f=e.d&&e.d.fac;if(!f)return;powAdd(f,e.d.elite?-1:-.3)});
hook('questDone',q=>{if(q.sect&&SECTS[q.sect])powAdd(alFac(SECTS[q.sect].al),1);else if(q.maeng&&typeof MAENG!=='undefined')powAdd(alFac(q.maeng),1.5)});
// ---- 죽음: 이번 생의 선택과 대전을 강호사에 남긴다. 세상 상태(G.W 등)는 그대로 다음 생으로 ----
hook('died',entry=>{const s=PS();entry.story={pick:{...s.pick},war:G.war&&G.war.life===P.lifeNo?G.war.plan.n:null};
  if(G.war&&G.war.life===P.lifeNo&&!G.wars.some(x=>x.life===P.lifeNo))G.wars.push({life:P.lifeNo,y:G.war.y,n:G.war.plan.n,won:G.war.won,lost:G.war.lost||null});G.war=null});
hook('gLoaded',()=>{wld();if(G.war&&(!P||G.war.life!==G.lives+1))G.war=null});
// ---- 전생의 흔적: 같은 사건을 지난 생들이 어떻게 풀었나 ----
function pastPicks(e){return G.history.map(h=>{const p=h.story&&h.story.pick&&h.story.pick[e.id];return p==null||p<0?null:`제${h.life}생 ${esc(h.name)}: ${e.ch[p]?e.ch[p].n:'?'}`}).filter(Boolean)}
// ---- 정세 창 ----
const sBar=(v,c)=>`<div class="mbar"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></div>`;
const FACC={정:'#8fb4e6',사:'#c98a5a',마:'#c05050',관:'#d7b45a'};
function storyCard(){const w=wld(),plan=warPlan();return `<div class="card"><h4>강호 정세 <small class="dim">${lifeStage()} · ${G.war&&G.war.life===P.lifeNo?'천하대전 중':`천하대전까지 ${Math.ceil(yearsToWar())}년`}</small></h4>
  <p>${FAC4.map(f=>`${FAC4N[f]} <b class="num" style="color:${FACC[f]}">${Math.round(w.pow[f])}</b>`).join(' · ')} · 예상 구도 <b class="gold">${plan.n}</b></p><div class="ib">${B('open:story','정세 창 (N)')}</div></div>`}
function evCard(e){const s=PS(),st=evState(e),pk=s.pick[e.id],past=pastPicks(e);
  if(st==='wait')return `<div class="card dim"><div class="row2"><h4>${e.n}</h4><span class="tag">${Number.isInteger(e.age)?e.age+'세':Math.floor(e.age)+'세 하반기'}</span></div><p class="note">아직 오지 않았다.</p></div>`;
  if(st==='done'){const ch=e.ch[pk],q=P.quests.find(q=>q.story===e.id),qi=P.quests.indexOf(q);
    return `<div class="card"><div class="row2"><h4>${e.n}</h4><span class="tag">${pk<0?'지나감':ch.n}</span></div>${q?`<p>임무 [${esc(q.n)}] ${q.have}/${q.cnt}${q.have>=q.cnt?' <span class="good">완료</span>':''}</p><div class="ib">${B('qdone:'+qi,'보고하기',{pri:q.have>=q.cnt,d:q.have<q.cnt})}</div>`:pk>=0&&!s.done[e.id]?'<p class="note">임무를 포기해 끝맺지 못했다.</p>':''}</div>`}
  return `<div class="card"><div class="row2"><h3>${e.n}</h3><span class="tag">열린 사건</span></div><p>${e.t}</p>
    <div class="list">${e.ch.map((c,i)=>{const ok=condOk(c.req);return `<div class="it"><div>${c.n}${c.req?` <small class="${ok?'good':'bad'}">${condTxt(c.req)}</small>`:''}<span>${c.d}${c.quest?` <small class="dim">임무: ${c.quest.mob.join('·')} ${c.quest.cnt}</small>`:''}</span></div><div class="ib">${B('spick:'+e.id+':'+i,'고르기',{pri:ok,d:!ok})}</div></div>`}).join('')}</div>
    ${past.length?`<p class="note">전생의 흔적: ${past.join(' · ')}</p>`:'<p class="note">마지막 선택은 고르지 않아도 다음 사건이 오면 저절로 흘러간다.</p>'}</div>`}
function pStory(){const w=wld(),plan=warPlan(),s=PS(),war=G.war&&G.war.life===P.lifeNo;
  const pow=FAC4.map(f=>`<p style="margin:6px 0 2px">${FAC4N[f]} <b class="num" style="color:${FACC[f]}">${Math.round(w.pow[f])}</b> <small class="dim">${f==='마'?'해마다 저절로 +'+STORY.DRIFT.마:f==='관'?`정관 관계 ${w.rel.정관} (${STORY.RULES.gunJoin} 이상이면 정파 편, 힘 ${STORY.RULES.gunPunish} 이상이면 무림 토벌)`:f==='정'?'정의맹':'사천맹'}</small></p>${sBar(w.pow[f],FACC[f])}`).join('');
  const rel=Object.keys(w.rel).map(k=>`${k} <b class="num ${w.rel[k]>=20?'good':w.rel[k]<=-20?'bad':''}">${w.rel[k]>0?'+':''}${Math.round(w.rel[k])}</b>`).join(' · ');
  const seal=Object.keys(G.seal).filter(id=>SECTS[id]).map(id=>SECTS[id].n),occ=Object.keys(G.occ).filter(id=>SECTS[id]).map(id=>`${SECTS[id].n}(${FAC4N[G.occ[id].by]||G.occ[id].by})`);
  const wars=G.wars.slice(-3).reverse().map(x=>`제${x.life}생 ${x.n}${x.won?` · ${sideName(x.won)} 승`:''}`);
  return `<div class="card"><div class="row2"><h3>${Math.floor(P.age)}세 · ${lifeStage()}</h3><span class="tag">${war?`천하대전 중: ${G.war.plan.n}`:`천하대전까지 ${Math.ceil(yearsToWar())}년 (${ST.war}세)`}</span></div>
    <p>${ST.evFrom}세부터 강호의 사건이 반년마다 하나씩 열 번 찾아오고, ${ST.war}세가 되는 해에 천하대전이 터진다. 그 전에 죽으면 8세로 윤회하되, 세력의 힘과 관계·봉문·점령은 그대로 이어진다.</p>
    <p>예상 구도 <b class="gold">${plan.n}</b> <small class="dim">${plan.d}${plan.notes.length?' · '+plan.notes.join(', '):''}</small></p></div>
    <div class="card"><h4>세력의 힘</h4>${pow}<p>관계 ${rel} <small class="dim">(+20 이상이면 손을 잡고, -20 아래면 등을 돌린다)</small></p>
    ${seal.length?`<p>봉문 <b class="bad">${seal.join(' · ')}</b> <small class="dim">제자를 받지 않는다</small></p>`:''}${occ.length?`<p>점령 ${occ.join(' · ')}</p>`:''}${wars.length?`<p class="note">지난 대전: ${wars.join(' · ')}</p>`:''}</div>
    ${SEV.map(evCard).join('')}
    <p class="note">세력의 힘은 사건의 선택, 문파·맹 임무(+1), 세력 무인 처치(고수 -1, 무인 -0.3)로 움직인다. 구도 규칙: 정사 +20 이상이고 마교 ${STORY.WAR[0].cond[1].split('>=')[1]} 이상이면 정사연합, 사마 +20 이상이고 정사 -20 이하면 사마연합, 정사 -40 이하이고 사파 60 이상이면 정마밀약, 아니면 삼파전.</p>`}
hook('sectAct',c=>{if(c.a!=='spick')return;c.done=true;c.r=true;const e=evOf(c.x);if(e)pickChoice(e,+c.y,false)});
{const pc=pChar;pChar=function(){return pc()+storyCard()}}

// ================= 천하대전 스토리 엔진 (사용자 구상 2026-10-13) =================
// 생마다 8세에 태어나 20세부터 사건 10개가 반년 간격으로 터지고, 26세에 천하대전이 난다 (data/story.json STORY.T, EV).
// 세상 상태(G.W 세력의 힘과 관계, G.seal 봉문, G.occ 점령, G.wars 지난 대전)는 생을 넘어 이어지고, 타이틀의 '처음부터 새로'만 되돌린다.
// 이번 생의 선택은 P.story에 적고, 죽을 때 강호사(G.history[].story)에 남겨 다음 생의 사건 창에 '전생의 흔적'으로 보인다.
// 사건은 열리면 정세 창(N)이 뜨고, 고르지 않은 채 다음 사건이 오면 세 번째 선택(기본)으로 흘러간다. 설계: docs/스토리_설계.md
const STORY=GD.STORY,SEV=STORY.EV,ST=STORY.T;
const FAC4=['정','사','마','관'],FAC4N={정:'정파',사:'사파',마:'마교',관:'관군'};
const clone=o=>JSON.parse(JSON.stringify(o));
const wld=()=>{if(!G.W){G.W=clone(STORY.INIT);if(typeof popSync==='function')popSync()}if(!G.seal)G.seal={};if(!G.occ)G.occ={};if(!G.wars)G.wars=[];return G.W};
const PS=()=>{if(!P.story)P.story={pick:{},open:null,done:{},flag:{}};return P.story};
// v153: 2막. 첫 천하대전이 끝나면 P.story.act=2, 그 승자(br)에 따른 사건 셋과 제2차 천하대전 (data/story2.json, g_story5.js)
const S2=GD.STORY2;
const actOf=()=>P&&P.story&&P.story.act===2?2:1;
const curEv=()=>actOf()===2?act2Ev(PS().br):SEV;
const lastEv=()=>{const l=curEv();return l[l.length-1]};
const warAge=()=>actOf()===2?S2.T.war:ST.war;
const warLbl=()=>actOf()===2?'제2차 천하대전':'천하대전';
const wClamp=()=>{const w=wld();for(const k in w.pow)w.pow[k]=clamp(Math.round(w.pow[k]*10)/10,0,100);for(const k in w.rel)w.rel[k]=clamp(Math.round(w.rel[k]*10)/10,-100,100)};
function powAdd(f,v){const w=wld();if(w.pow[f]==null)return;if(typeof popScale==='function'){popScale(f,1+v/Math.max(10,w.pow[f]));return}w.pow[f]+=v;wClamp()}
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
  if(fx.powRule||fx.powResist)act2Pow(fx,out);
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
function warPlan(){if(actOf()===2){const p=act2Plan();if(p)return p}const w=wld(),R=STORY.RULES;let rule=STORY.WAR.find(r=>condOk(r.cond))||STORY.WAR[STORY.WAR.length-1];
  let sides=clone(rule.sides),notes=[];
  if(w.pow.마<R.magyoOut){sides=sides.map(s=>s.filter(f=>f!=='마')).filter(s=>s.length);notes.push('마교는 힘이 바닥나 물러선다')}
  if(w.pow.관>=R.gunPunish){sides.push(['관']);notes.push('조정이 무림 전체를 토벌하러 나선다')}
  else if(w.rel.정관>=R.gunJoin){const s=sides.find(s=>s.includes('정'));if(s){s.push('관');notes.push('관군이 정파 편에 선다')}}
  const n=sides.length<2?'중재 (싸울 상대가 없다)':sides.length===3&&rule.id==='three'?rule.n:sides.map(s=>s.map(f=>FAC4N[f]).join('·')).join(' 대 ');
  return{id:rule.id,n,d:rule.d,sides,notes}}
const sideName=s=>s.map(f=>FAC4N[f]).join('·');
// ---- 생의 단계와 남은 해 ----
function lifeStage(){const a=realAge();let n=ST.stages[0][1];for(const[ag,nm]of actOf()===2?ST.stages.concat(S2.T.stages):ST.stages)if(a>=ag)n=nm;return n}
const yearsToWar=()=>Math.max(0,warAge()-realAge());
// yrs 안에 닥칠 사건·천하대전의 나이 (없으면 null). 폐관(g_realm.js pgWhy)이 본다
function storyDueIn(yrs){const s=PS(),a=realAge();if(!s||s.flag.warDone)return null;const ev=curEv().find(e=>s.pick[e.id]==null&&e.age>a&&e.age<=a+yrs);if(ev)return ev.age;const wa=warAge();return a<wa&&wa<=a+yrs?wa:null}
// ---- 사건 열기·고르기·미루기 ----
const evOf=id=>SEV.find(e=>e.id===id)||act2Find(id);
function evState(e){const s=PS();return s.pick[e.id]!=null?'done':s.open===e.id?'open':'wait'}
// v149 (사용자): 사건이 터지면 창을 띄우지 않고 화면에 크게 알린다. 정세 줄(맨 위)을 누르거나 N으로 정세창을 연다
function openEvent(e){const s=PS();s.open=e.id;storyBanner(e.n,'강호의 사건 · 왼쪽 정세 줄을 누르거나 N으로 정세창에서 고른다','강호의 사건');log(`[사건] ${e.n}: ${e.t}`,'sys');feat(`${e.n}을(를) 마주했다`);
  if(panel==='story'&&!$('win').hidden)renderOpen()}
// 정세 줄: 고를 사건(다음 사건이 열리면 저절로 흘러간다)과 정세 임무. left = 남은 초 (나이 → 1년 YEAR_SEC초)
function storyRows(){if(!P||!P.story)return[];const s=PS(),out=[],sec=a=>(a-realAge())*YEAR_SEC;
  if(s.open){const ev=curEv(),e=evOf(s.open),i=ev.indexOf(e),nx=ev.slice(i+1).find(o=>s.pick[o.id]==null),due=nx?nx.age:warAge();out.push({n:`사건 · ${e.n}`,prog:'선택 대기',left:sec(due),lbl:'흘러가기까지'})}
  for(const q of P.quests||[]){if(!q.story&&!q.war&&!q.sq)continue;const p=questProg(q);
    const left=q.war?sec(Math.floor(realAge())+1):q.story&&realAge()<warAge()?sec(warAge()):null,lbl=q.war?'이번 결전 끝까지':warLbl()+'까지';out.push({q,n:q.n,prog:`${p.have}/${q.cnt}`,done:p.done,left,lbl})}
  return out}
function pickChoice(e,i,auto){const s=PS(),ch=e.ch[i];if(!ch||s.pick[e.id]!=null)return false;if(!auto&&ch.role&&ch.role!==myRole()){log(`${ch.role==='rule'?'천하를 쥔 편':'맞서는 편'}의 길이다.`,'info');return false}if(!auto&&ch.fac&&ch.fac!==myFac()){log(`${FAC4N[ch.fac]}의 길이다. ${FAC4N[myFac()]}인 당신은 고를 수 없다.`,'info');return false}if(!auto&&!condOk(ch.req)){log(`아직 할 수 없다: ${condTxt(ch.req)}`,'info');return false}
  s.pick[e.id]=i;if(s.open===e.id)s.open=null;
  log(auto?`[${e.n}] 손쓰지 못한 채 흘러갔다: ${ch.n}`:`[${e.n}] ${ch.n}`,auto?'info':'xp');
  applyFx(ch.fx,e.n);
  if(ch.quest){const q={...ch.quest,mob:ch.quest.mob||act2Kinds(ch.quest.foe),kind:'kill',have:0,story:e.id,ci:i,key:'story:'+e.id};P.quests.push(q);log(`임무 [${q.n}]을(를) 맡았습니다. 끝내면 정세 창에서 보고한다.`,'sys')}
  else s.done[e.id]=true;
  if(e.id===lastEv().id)warStart();
  return true}
hook('questDone',q=>{if(!q.story)return;const e=evOf(q.story),ch=e&&e.ch[q.ci];if(!ch)return;PS().done[e.id]=true;applyFx(ch.done,e.n);feat(`${e.n}: ${ch.n}`)});
// 매 틱: 나이가 사건의 때를 지나면 연다. 먼저 열린 사건이 남아 있으면 기본 선택으로 흘려보낸다. 마지막 사건을 미루면 전쟁이 나는 해에 흘러간다
hook('tick',()=>{if(!P||!playing)return;wld();const s=PS();
  const ev=curEv(),last=ev[ev.length-1],due=ev.filter(e=>s.pick[e.id]==null&&realAge()>=e.age);
  if(due.length){const e=due[due.length-1];for(const o of due.slice(0,-1))pickChoice(o,o.ch.length-1,true);if(s.open!==e.id)openEvent(e)}
  if(s.open===last.id&&realAge()>=warAge())pickChoice(last,last.ch.length-1,true);
  if(!G.war&&!s.flag.warDone&&realAge()>=warAge()&&s.pick[last.id]!=null)warStart();
});
// ---- 해마다: 마교는 저절로 세를 불린다. 지난 대전의 패자는 서서히 힘을 되찾는다 ----
hook('newYear',()=>{const last=G.wars[G.wars.length-1];if(last&&last.lost)for(const f of last.lost)powAdd(f,STORY.WIN.loserDrift)});
// ---- 처치와 임무가 세력의 힘을 움직인다 ----
hook('questDone',q=>{if(q.sect&&SECTS[q.sect])powAdd(alFac(SECTS[q.sect].al),1);else if(q.maeng&&typeof MAENG!=='undefined')powAdd(alFac(q.maeng),1.5)});
// ---- 죽음: 이번 생의 선택과 대전을 강호사에 남긴다. 세상 상태(G.W 등)는 그대로 다음 생으로 ----
hook('died',entry=>{const s=PS();if(warOn())warEnd(true);const last=G.wars[G.wars.length-1];entry.story={pick:{...s.pick},war:last&&last.life===P.lifeNo?last.n:null,me:last&&last.life===P.lifeNo?last.me:null};G.war=null});
hook('gLoaded',()=>{wld();if(G.war&&(!P||G.war.life!==G.lives+1))G.war=null});
// ---- 전생의 흔적: 같은 사건을 지난 생들이 어떻게 풀었나 ----
function pastPicks(e){return G.history.map(h=>{const p=h.story&&h.story.pick&&h.story.pick[e.id];return p==null||p<0?null:`제${h.life}생 ${esc(h.name)}: ${e.ch[p]?e.ch[p].n:'?'}`}).filter(Boolean)}
// ---- 정세 창 ----
const sBar=(v,c)=>`<div class="mbar"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></div>`;
const FACC={정:'#8fb4e6',사:'#c98a5a',마:'#c05050',관:'#d7b45a'};
function storyCard(){const w=wld(),plan=warPlan();return `<div class="card"><h4>강호 정세 <small class="dim">${lifeStage()} · ${G.war&&G.war.life===P.lifeNo?warLbl()+' 중':PS().flag.warDone?warLbl()+'이 끝났다':`${warLbl()}까지 ${Math.ceil(yearsToWar())}년`}</small></h4>
  <p>${FAC4.map(f=>`${FAC4N[f]} <b class="num" style="color:${FACC[f]}">${Math.round(w.pow[f])}</b>`).join(' · ')} · 예상 구도 <b class="gold">${plan.n}</b></p><div class="ib">${B('open:story','정세 창 (N)')}</div></div>`}
function evCard(e){const s=PS(),st=evState(e),pk=s.pick[e.id],past=pastPicks(e);
  if(st==='wait')return `<div class="card dim"><div class="row2"><h4>${e.n}</h4><span class="tag">${Number.isInteger(e.age)?e.age+'세':Math.floor(e.age)+'세 하반기'}</span></div><p class="note">아직 오지 않았다.</p></div>`;
  if(st==='done'){const ch=e.ch[pk],q=P.quests.find(q=>q.story===e.id),qi=P.quests.indexOf(q);
    return `<div class="card"><div class="row2"><h4>${e.n}</h4><span class="tag">${pk<0?'지나감':ch.n}</span></div>${q?`<p>임무 [${esc(q.n)}] ${q.have}/${q.cnt}${q.have>=q.cnt?' <span class="good">완료</span>':''}</p><div class="ib">${B('qdone:'+qi,'보고하기',{pri:q.have>=q.cnt,d:q.have<q.cnt})}</div>`:pk>=0&&!s.done[e.id]?'<p class="note">임무를 포기해 끝맺지 못했다.</p>':''}</div>`}
  const my=myFac(),role=myRole(),pov=e.pov&&(e.pov[my]||e.pov[role]);
  return `<div class="card"><div class="row2"><h3>${e.n}</h3><span class="tag">열린 사건</span></div><p>${e.t}</p>${pov?`<p><b style="color:${FACC[my]}">${FAC4N[my]}의 눈${e.pov[my]?'':role==='rule'?' · 천하를 쥔 편':' · 맞서는 편'}</b> <small>${pov}</small></p>`:''}
    <div class="list">${e.ch.map((c,i)=>{if(c.fac&&c.fac!==my||c.role&&c.role!==role)return '';const ok=condOk(c.req);return `<div class="it"><div>${c.n}${c.req?` <small class="${ok?'good':'bad'}">${condTxt(c.req)}</small>`:''}<span>${c.d}${c.quest?` <small class="dim">임무: ${(c.quest.mob||act2Kinds(c.quest.foe)).join('·')} ${c.quest.cnt}</small>`:''}</span></div><div class="ib">${B('spick:'+e.id+':'+i,'고르기',{pri:ok,d:!ok})}</div></div>`}).join('')}</div>
    ${past.length?`<p class="note">전생의 흔적: ${past.join(' · ')}</p>`:'<p class="note">마지막 선택은 고르지 않아도 다음 사건이 오면 저절로 흘러간다.</p>'}</div>`}
function pStory(){const w=wld(),plan=warPlan(),s=PS(),war=G.war&&G.war.life===P.lifeNo;
  const pow=FAC4.map(f=>`<p style="margin:6px 0 2px">${FAC4N[f]} <b class="num" style="color:${FACC[f]}">${Math.round(w.pow[f])}</b> <small class="dim">${f==='마'?'천마신교 · 인원이 빨리 는다':f==='관'?`정관 관계 ${w.rel.정관} (${STORY.RULES.gunJoin} 이상이면 정파 편, 힘 ${STORY.RULES.gunPunish} 이상이면 무림 토벌)`:f==='정'?'정의맹':'사천맹'}</small></p>${sBar(w.pow[f],FACC[f])}`).join('');
  const rel=Object.keys(w.rel).map(k=>`${k} <b class="num ${w.rel[k]>=20?'good':w.rel[k]<=-20?'bad':''}">${w.rel[k]>0?'+':''}${Math.round(w.rel[k])}</b>`).join(' · ');
  const seal=Object.keys(G.seal).filter(id=>SECTS[id]).map(id=>SECTS[id].n),occ=Object.keys(G.occ).filter(id=>SECTS[id]).map(id=>`${SECTS[id].n}(${FAC4N[G.occ[id].by]||G.occ[id].by})`);
  const wars=G.wars.slice(-3).reverse().map(x=>`제${x.life}생 ${x.n}${x.won?` · ${sideName(x.won)} 승`:''}`);
  return `<div class="card"><div class="row2"><h3>${Math.floor(P.age)}세 · ${lifeStage()}</h3><span class="tag">${war?`${warLbl()} 중: ${G.war.plan.n}`:s.flag.warDone?warLbl()+'이 끝났다':`${warLbl()}까지 ${Math.ceil(yearsToWar())}년 (${warAge()}세)`}</span></div>
    ${actOf()===2?act2Intro():`<p>${ST.evFrom}세부터 강호의 사건이 반년마다 하나씩 열 번 찾아오고, ${ST.war}세가 되는 해에 천하대전이 터진다. 그 전에 죽으면 8세로 윤회하되, 세력의 힘과 관계·봉문·점령은 그대로 이어진다.</p>`}
    <p>예상 구도 <b class="gold">${plan.n}</b> <small class="dim">${plan.d}${plan.notes.length?' · '+plan.notes.join(', '):''}</small></p></div>
    <div class="card"><h4>세력의 힘</h4>${pow}<p>관계 ${rel} <small class="dim">(+20 이상이면 손을 잡고, -20 아래면 등을 돌린다)</small></p>
    ${seal.length?`<p>봉문 <b class="bad">${seal.join(' · ')}</b> <small class="dim">제자를 받지 않는다</small></p>`:''}${occ.length?`<p>점령 ${occ.join(' · ')}</p>`:''}${wars.length?`<p class="note">지난 대전: ${wars.join(' · ')}</p>`:''}</div>
    ${curEv().map(evCard).join('')}
    <p class="note">세력의 힘은 그 세력 문파들의 인원과 경지에서 나온다(아래 문파 인원). 사건의 선택, 문파·맹 임무, 세력 무인의 죽음이 인원을 움직인다. 구도 규칙: 정사 +20 이상이고 마교 ${STORY.WAR[0].cond[1].split('>=')[1]} 이상이면 정사연합, 사마 +20 이상이고 정사 -20 이하면 사마연합, 정사 -40 이하이고 사파 60 이상이면 정마밀약, 아니면 삼파전.</p>`}
hook('sectAct',c=>{if(c.a!=='spick')return;c.done=true;c.r=true;const e=evOf(c.x);if(e)pickChoice(e,+c.y,false)});
{const pc=pChar;pChar=function(){return pc()+storyCard()}}

// ================= 3단계: 천하대전 전투 =================
// 26세에 터져 세 해(26·27·28세) 동안 해마다 한 차례씩 결전이 난다. 차례마다 적 세력의 무인이 밀려오고(습격) 결전 임무가 걸린다.
// 차례의 승패는 편의 힘 합계 + 플레이어가 결전 임무를 끝냈으면 공로(warMerit, 15+5×경지, g_story5.js) + 운. 세 차례 뒤 더 많이 이긴 편이 천하를 쥔다 (warEnd → applyWin).
// 전쟁 중엔 구도가 적·아군을 정한다 (warFoe → g_faction.js facFoe). 「결전 전야」에서 중재를 골랐으면 싸움 없이 끝난다.
const warOn=()=>!!(G.war&&P&&G.war.life===P.lifeNo);
function warSideOf(f){if(!warOn())return-1;return G.war.plan.sides.findIndex(s=>s.includes(f))}
function warFoe(a,b){if(!warOn())return null;const sa=warSideOf(a),sb=warSideOf(b);if(sa<0||sb<0)return null;return sa!==sb}
const mySide=()=>warSideOf(myFac());
const sidePow=s=>s.reduce((a,f)=>a+(wld().pow[f]||0),0);
function warStart(){if(G.war&&G.war.life===P.lifeNo)return;const plan=warPlan();G.war={life:P.lifeNo,y:Math.floor(G.cal),plan,round:0,rounds:[],won:null};
  storyBanner('천하대전',plan.n,'강호 정세');log(`천하대전이 터졌다: ${plan.n}. ${plan.d}${plan.notes.length?' '+plan.notes.join('. ')+'.':''}`,'dmg');feat(`천하대전(${plan.n})을 맞았다`);
  if(PS().flag.mediate){mediate();return}
  if(plan.sides.length<2){log('맞설 상대가 없어 대전은 흐지부지 끝났다.','info');warEnd();return}
  warRound()}
function mediate(){const w=wld();for(const f of FAC4)powAdd(f,-5);for(const k in w.rel)relAdd(k,15);P.fame+=40;P.good+=10;
  showBanner('중재',`${P.name}의 이름으로 칼을 거두다`);log(`${P.name}의 중재로 세력들이 칼을 거뒀다. 명성 +40, 선업 +10. 모든 세력의 관계 +15.`,'xp');feat(`천하대전을 중재로 막았다`);
  G.wars.push({life:P.lifeNo,y:G.war.y,n:'중재',won:null,lost:null,me:'중재'});G.war=null;PS().flag.warDone=true;runHooks('warEnded',{silent:false})}
const ENEMY_KINDS=()=>{const me=mySide(),out=[];G.war.plan.sides.forEach((s,i)=>{if(i!==me)for(const f of s)out.push(...FAC_KIND[f])});return out};
function warRound(){const w=G.war,n=w.round+1;if(n>ST.rounds)return warEnd();w.round=n;w.cur={done:false};
  const me=mySide(),enemy=ENEMY_KINDS(),hide=!!PS().flag.hide;   // 10번 사건 '몸을 피한다'(flag.hide): 결전 임무·습격이 오지 않는다
  if(me>=0&&hide)log(`제${n}차 결전이 벌어진다. 몸을 피해 이번 싸움에 나서지 않는다.`,'sys');
  else if(me>=0&&enemy.length){const q={n:`제${n}차 결전: 적 세력 격파`,kind:'kill',mob:enemy,cnt:6,silver:150,vit:100,fame:20,good:0,have:0,war:n,key:'war:'+n};if(!P.quests.some(o=>o.key===q.key))P.quests.push(q);
    log(`제${n}차 결전이 벌어진다. 임무 [${q.n}]: ${enemy.filter((k,i)=>i%2===0).join('·')} 6명을 꺾고 정세 창에서 보고하라.`,'sys');if(playing)raid(n)}
  else log(`제${n}차 결전이 벌어진다. ${me<0?'당신의 편은 이 싸움에 끼지 않았다.':''}`,'sys');
  storyBanner(`제${n}차 결전`,G.war.plan.n,'천하대전')}
// 습격: 적 세력 무인이 플레이어 둘레에 나타난다 (무인 넷 + 고수 하나). 비무·무덤 중엔 안 온다
function raid(n){if(G.duel||!REGION())return;const me=mySide(),facs=[];G.war.plan.sides.forEach((s,i)=>{if(i!==me)facs.push(...s)});if(!facs.length)return;
  let made=0;for(let t=0;t<60&&made<5;t++){const a=Math.random()*Math.PI*2,r=6+Math.random()*3,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;if(!walkAt(x,y))continue;
    const f=facs[made%facs.length],e=mkFac(f,made===4?1:0,x,y);e.aggro=true;e.raid=n;mobs.push(e);made++}
  if(made){showBanner('습격',`${facs.map(f=>FAC4N[f]).join('·')}의 무인이 덮쳐 온다`);log(`${facs.map(f=>FAC4N[f]).join('·')}의 무인 ${made}명이 덮쳐 옵니다!`,'dmg')}}
hook('questDone',q=>{if(!q.war||!warOn())return;G.war.cur.done=true;G.war.cur.q=q.n;log(`제${q.war}차 결전에서 공을 세웠다. 이번 차례에 내 편의 힘 +${warMerit()}.`,'xp')});
// 한 차례의 승패를 가린다
function warTally(){const w=G.war,me=mySide();const fl=PS().flag,sc=w.plan.sides.map((s,i)=>sidePow(s)+(i===me&&w.cur&&w.cur.done?warMerit():0)+(i===me&&fl.front?10:0)+Math.random()*15);   // flag.front: 앞장선 내 편 +10
  let best=0;sc.forEach((v,i)=>{if(v>sc[best])best=i});w.rounds.push({win:best,sc:sc.map(Math.round),me:me>=0&&!fl.hide?(w.cur&&w.cur.done?'공':'무'):'-'});
  const wn=w.plan.sides[best];for(const f of wn)powAdd(f,2);popWarLoss(w.plan.sides.filter((s,i)=>i!==best).flat(),STORY.POP.roundLoss);
  log(`제${w.round}차 결전: ${sideName(wn)}이(가) 이겼다${me===best?' (내 편)':me>=0?' (내 편이 밀렸다)':''}.`,best===me?'xp':'dmg');
  for(const q of P.quests.slice())if(q.war&&q.war===w.round&&!(w.cur&&w.cur.done))P.quests.splice(P.quests.indexOf(q),1);
  mobs=mobs.filter(m=>!m.raid||m.hp<=0)}
hook('newYear',()=>{if(!warOn()||G.war.round<1)return;warTally();if(G.war.round>=ST.rounds)warEnd();else warRound()});
// ================= 4단계: 승자의 힘 =================
// 가장 많이 이긴 편이 천하를 쥔다. 진 편의 대문파 본산 둘을 점령하고(G.occ, 장문인 대신 점령군 대장), 둘을 봉문시킨다(사파가 이기면 소문파 넷).
// 점령당한 본산엔 점령군이 주둔하고 가입·임무가 막힌다. 탈환·개문 임무는 그 본산의 대화에서 맡아 정세 창에서 보고한다.
function warEnd(silent){const w=G.war;if(!w)return;const n=w.plan.sides.length;
  while(w.rounds.length<ST.rounds&&n>=2){w.round=w.rounds.length+1;w.cur=w.cur||{done:false};warTally()}
  const wins=w.plan.sides.map((s,i)=>w.rounds.filter(r=>r.win===i).length);let best=0;wins.forEach((v,i)=>{if(v>wins[best]||(v===wins[best]&&sidePow(w.plan.sides[i])>sidePow(w.plan.sides[best])))best=i});
  const won=n>=2?w.plan.sides[best]:null,lost=won?w.plan.sides.filter((s,i)=>i!==best).flat():[],me=mySide();
  const rec={life:P.lifeNo,y:w.y,n:w.plan.n,won,lost,sides:w.plan.sides,rounds:w.rounds.map(r=>r.win),me:won?(me===best?'승':me>=0?'패':'-'):'-'};
  if(won){for(const f of won)powAdd(f,10);popWarLoss(lost,STORY.POP.warLoss);
    const wl=wld();for(const k in wl.rel){const[a,b]=[k[0],k[1]];if(won.includes(a)&&won.includes(b))relAdd(k,10);else if((won.includes(a)&&lost.includes(b))||(won.includes(b)&&lost.includes(a)))relAdd(k,-15)}
    rec.occ=applyWin(won,lost,me===best?myFac():won[0]);
    showBanner('천하대전 끝',`${sideName(won)}의 천하`);log(`천하대전이 끝났다. ${sideName(won)}이(가) 천하를 쥐었다.${rec.me==='승'?' 당신은 이긴 편에 섰다: 명성 +50, 은자 +300.':rec.me==='패'?' 당신의 편은 졌다. 명성 +10.':''}`,rec.me==='패'?'dmg':'xp');
    if(rec.me==='승'){P.fame+=50;P.silver+=300}else if(rec.me==='패')P.fame+=10;P.feats.push(`${Math.floor(P.age)}세 천하대전: ${sideName(won)}의 승리${rec.me!=='-'?' ('+rec.me+')':''}`)}
  G.wars.push(rec);G.war=null;PS().flag.warDone=true;runHooks('warEnded',{rec,silent});if(!silent)renderOpen()}
// 승자의 힘: 점령 WIN.occ곳 + 봉문 (대문파 WIN.seal.big곳, 사파가 이기면 소문파 WIN.seal.small곳)
function applyWin(won,lost,by){const cand=t=>Object.values(SECTS).filter(s=>lost.includes(alFac(s.al))&&(t==='big'?s.tier==='big':s.tier==='small')&&!G.seal[s.id]&&!G.occ[s.id]&&s.id!=='geumgun');
  const take=(list,n)=>{const out=[];const byFac={};for(let i=0;i<n&&list.length;i++){list.sort((a,b)=>(byFac[alFac(a.al)]||0)-(byFac[alFac(b.al)]||0)||Math.random()-.5);const s=list.shift();byFac[alFac(s.al)]=(byFac[alFac(s.al)]||0)+1;out.push(s)}return out};
  const occ=take(cand('big'),STORY.WIN.occ),y=Math.floor(G.cal);for(const s of occ)G.occ[s.id]={by,y,life:P.lifeNo};
  const sacheon=won[0]==='사',seal=take(cand(sacheon?'small':'big'),sacheon?STORY.WIN.seal.small:STORY.WIN.seal.big);for(const s of seal)G.seal[s.id]={by,y,life:P.lifeNo};
  if(occ.length)log(`${FAC4N[by]}이(가) ${occ.map(s=>s.n).join('·')} 본산을 점령했다. 점령군이 주둔하고 ${occ.map(s=>masterTitle(s)).join('·')}은 쫓겨났다.`,'dmg');
  if(seal.length)log(`${seal.map(s=>s.n).join('·')}이(가) 산문을 닫고 봉문했다.`,'dmg');
  if(P.sect&&(G.occ[P.sect]||G.seal[P.sect]))log(`당신의 문파 ${SECTS[P.sect].n}이(가) ${G.occ[P.sect]?'점령당했다. 본산에서 탈환 임무를 맡을 수 있다':'봉문했다. 본산에서 개문 임무를 맡을 수 있다'}.`,'dmg');
  return{occ:occ.map(s=>s.id),seal:seal.map(s=>s.id)}}
// 점령당한 본산: 주둔군이 제 문파 무인 대신 서고 점령군 대장이 지킨다
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||!R.hq||!SECTS[R.hq])return;const o=G.occ&&G.occ[R.hq];
  if(!R._sp)R._sp=R.spawns||[];
  const m=hqNpc(id);if(m){if(!m._n)m._n=m.n;m.n=o?`${FAC4N[o.by]} 점령군 대장`:G.seal[R.hq]?`${SECTS[R.hq].n} 문지기`:m._n}   // 장문인 자리에 점령군 대장·문지기
  if(!o){R.spawns=R._sp;return}
  const[k0,k1]=FAC_KIND[o.by];R.spawns=[[k0,6,inHQ,(x,y)=>mkFac(o.by,0,x,y)],[k1,2,inHQ,(x,y)=>mkFac(o.by,1,x,y)],...R._sp.filter(([k])=>!FAC_KIND[alFac(SECTS[R.hq].al)].includes(k))];
  if(P&&REG===id&&!mobs.some(m=>m.chief)){let x=20.5,y=8.5;for(let t=0;t<40&&!walkAt(x,y);t++){x=13+Math.random()*14;y=4+Math.random()*13}const e=mkFac(o.by,1,x,y);e.chief=1;e.name=`${FAC4N[o.by]} 점령군 대장`;e.maxHp=Math.round(e.maxHp*1.8);e.hp=e.maxHp;mobs.push(e)}});
// 본산 대화: 점령·봉문이면 장문인 대신 안내와 임무
hook('hqDlg',c=>{const s=SECTS[c.n.hq],o=G.occ[s.id],sl=G.seal[s.id];if(!o&&!sl)return;
  const by=(o||sl).by||'마',key=(o?'recl:':'open:')+s.id,q=P.quests.find(q=>q.key===key),mine=P.sect===s.id,foe=facFoe(by,myFac())||mine;
  if(o)c.html=`<p class="note">${FAC4N[by]} 점령군 대장: "${foe?`${FACN[myFac()]||''} 놈이 여길 어디라고. 썩 꺼져라!`:`${s.n}은(는) 이제 우리 땅이다. 볼일 없으면 가라.`}"</p>
    <p>${s.n} 본산은 ${o.y}년 ${FAC4N[by]}에 점령당해 ${masterTitle(s)}이 쫓겨났다. 가입·임무·비급을 쓸 수 없다.</p>
    ${q?`<p>탈환 임무 [${esc(q.n)}] ${q.have}/${q.cnt} · 정세 창(N)에서 보고</p>`:foe?`<div class="ib">${B('srecl:'+s.id,'탈환 임무 맡기 (주둔군 6명)',{pri:1})}</div>`:'<p class="note">점령군과 싸울 편이 아니면 탈환은 맡을 수 없다.</p>'}`;
  else c.html=`<p class="note">산문이 닫혀 있다. 문지기: "${mine?`${rankName(s.id)}, 문파는 봉문 중입니다. ${FAC4N[by]}의 눈이 거두어져야 문을 엽니다.`:'봉문 중이라 손님을 받지 않습니다.'}"</p>
    <p>${s.n}은(는) ${sl.y}년부터 봉문 중이다. 제자를 받지 않고 임무·비급도 없다.</p>
    ${q?`<p>개문 임무 [${esc(q.n)}] ${q.have}/${q.cnt} · 정세 창(N)에서 보고</p>`:facFoe(by,myFac())||mine?`<div class="ib">${B('sopen:'+s.id,`개문 임무 맡기 (${FAC4N[by]} 무인 5명)`,{pri:1})}</div>`:''}`});
hook('sectAct',c=>{if(c.a!=='srecl'&&c.a!=='sopen')return;c.done=true;c.r=true;const s=SECTS[c.x];if(!s)return;const recl=c.a==='srecl',rec=recl?G.occ[s.id]:G.seal[s.id];if(!rec)return;
  const by=rec.by||'마',key=(recl?'recl:':'open:')+s.id;if(P.quests.some(q=>q.key===key))return;
  const q=recl?{n:`${s.n} 탈환`,kind:'kill',mob:FAC_KIND[by],cnt:6,silver:200,vit:120,fame:25,good:0,have:0,key,sq:{t:'recl',sid:s.id,by}}:{n:`${s.n} 개문`,kind:'kill',mob:FAC_KIND[by],cnt:5,silver:120,vit:80,fame:15,good:0,have:0,key,sq:{t:'open',sid:s.id,by}};
  P.quests.push(q);log(`임무 [${q.n}]을(를) 맡았습니다. ${FAC4N[by]} 무인을 꺾고 정세 창에서 보고하라.`,'sys')});
hook('questDone',q=>{if(!q.sq)return;const s=SECTS[q.sq.sid],by=q.sq.by;if(!s)return;
  if(q.sq.t==='recl'){delete G.occ[s.id];powAdd(by,-5);powAdd(alFac(s.al),5);if(P.sect===s.id)addMerit(s.id,60);mobs=mobs.filter(m=>!m.chief);log(`${s.n} 본산을 되찾았다. ${masterTitle(s)}이 돌아온다.`,'xp');showBanner('탈환',s.n);feat(`${s.n} 본산을 되찾았다`);if(P.reg===`hq_${s.id}`||REGIONS[P.reg]&&REGIONS[P.reg].hq===s.id)runHooks('regionLoaded',P.reg)}
  else{unsealSects([s.id]);powAdd(alFac(s.al),3);if(P.sect===s.id)addMerit(s.id,40);showBanner('개문',s.n);feat(`${s.n}의 산문을 열었다`)}});
// 정세 창의 천하대전·본산 카드
function warCard(){const w=G.war;if(!warOn()){const last=G.wars[G.wars.length-1];if(!last||last.life!==P.lifeNo)return '';
    return `<div class="card"><h4>이번 생의 천하대전 <small class="dim">${last.n}</small></h4><p>${last.won?`${sideName(last.won)}의 승리 (${last.rounds.map((r,i)=>`${i+1}차 ${sideName(last.sides[r])}`).join(' · ')})`:last.n==='중재'?'중재로 칼을 거뒀다':'흐지부지 끝났다'}${last.me&&last.me!=='-'?` · 당신: ${last.me}`:''}</p></div>`}
  const me=mySide(),q=P.quests.find(q=>q.war===w.round),qi=P.quests.indexOf(q);
  return `<div class="card"><div class="row2"><h3>천하대전 <small class="dim">${w.plan.n}</small></h3><span class="tag">제${w.round}차 / ${ST.rounds}차</span></div>
    <p>${w.plan.sides.map((s,i)=>`${sideName(s)} <b class="num">${Math.round(sidePow(s))}</b>${i===me?' <small class="good">내 편</small>':''}`).join(' 대 ')}</p>
    ${w.rounds.map((r,i)=>`<p class="note">제${i+1}차: ${sideName(w.plan.sides[r.win])} 승 (${r.sc.join(' : ')})</p>`).join('')}
    ${q?`<p>임무 [${esc(q.n)}] <b class="num ${q.have>=q.cnt?'good':''}">${q.have}/${q.cnt}</b></p><div class="ib">${B('qdone:'+qi,'보고하기',{pri:q.have>=q.cnt,d:q.have<q.cnt})}</div>`:w.cur&&w.cur.done?`<p class="good">이번 차례의 공을 세웠다 (+${warMerit()}). 해가 바뀌면 승패가 갈린다.</p>`:me<0?'<p class="note">당신의 편은 이 싸움에 끼지 않았다.</p>':'<p class="note">이번 차례의 임무를 놓쳤다.</p>'}
    <p class="note">해마다 한 차례씩. 차례의 승패는 편의 힘 합계와 당신의 공(+${warMerit()}, 경지가 높을수록 크다), 운으로 갈린다. 세 차례 뒤 더 많이 이긴 편이 천하를 쥐고 진 편의 본산 ${STORY.WIN.occ}곳을 점령하고 ${STORY.WIN.seal.big}곳을 봉문시킨다.</p></div>`}
function hqCard(){const qs=P.quests.filter(q=>q.sq);if(!qs.length)return '';
  return `<div class="card"><h4>본산 임무</h4>${qs.map(q=>{const i=P.quests.indexOf(q);return `<p>[${esc(q.n)}] <b class="num ${q.have>=q.cnt?'good':''}">${q.have}/${q.cnt}</b> ${B('qdone:'+i,'보고하기',{pri:q.have>=q.cnt,d:q.have<q.cnt})}</p>`}).join('')}</div>`}
{const ps=pStory;pStory=function(){const h=ps();const i=h.indexOf('<div class="card"><h4>세력의 힘</h4>');return h.slice(0,i)+warCard()+hqCard()+h.slice(i)}}

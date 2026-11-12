// ================= v258 마교 교리·충성·소교주 후보 (동훈님 2026-11-12, 마교 영상 분석 제안 1·2·4) =================
// 분석 문서 https://claude.ai/artifact/93RsYHP33VfKDMZjwaYqKn . 숫자는 data/magyo4.json (GD.MAGYO4)
// ① 교리·구호: 교규 다섯 줄을 천마신전 비석(교주 대화)에 새기고, 줄마다 어기면 무엇이 되는지(지금의 죄값·추살) 적는다.
//    입교·교주 등극·천하대전 출정 때 교도들이 구호를 외친다. "마교"는 적이 부르는 이름이고 교도는 천마신교라 부른다(무림록 용어).
// ② 충성의 세 갈래(P.mloyal): 입마곡을 나오면 천마신전에서 교를 따르는 이유를 고른다. 신앙(마성 덜, 죄값 무겁게)·출세(공적 더)·공포(공적 가장 많이,
//    죄값 가볍게, 대신 혈고: 해마다 천마신전에서 해약을 받지 않으면 생명 상한이 깎인다. 교를 떠나도 혈고는 남는다).
//    교주가 되면 간부를 묶는 법(P.ldBind)을 고른다: 자리로(그대로)·덕으로(세입 절반, 도전자 절반)·독으로(도전자 0.3배, 악업).
// ③ 소교주 후보의 출신: 세 후보는 차례로 입마곡 출신·장로 가문·교주의 혈육. 뒤로 갈수록 세고(혈육은 교주의 비전을 쓴다), 이긴 뒤에도
//    다른 후보를 밀던 장로 둘(P.sgjOpp)을 공적으로 설득해야 교내 입지가 선다. 설득이 끝나기 전엔 교주 비무를 청할 수 없다.
// 테스트 tests/t174_magyo4.js
const MG4=GD.MAGYO4||{creed:[],cry:'천마재림 만마앙복',loyal:{},gu:.1,guMax:.3,bind:{},cand:[],opp:2,pay:60,oppN:[]};
const mlOf=()=>P&&P.mloyal&&MG4.loyal[P.mloyal]||null;
const mlMember=()=>!!P&&P.sect==='cheonma';
const mgCry=sub=>{showBanner(MG4.cry,sub);log(`교도들이 한목소리로 외친다. "${MG4.cry}!"`,'sys')};
// ---- ① 교규 ----
function creedHtml(){return `<div class="card"><h4>천마신교 교규 <small class="dim">천마신전 비석</small></h4>
  <ol class="note">${MG4.creed.map(([t,how])=>`<li><b>${esc(t)}</b> <small class="dim">${esc(how)}</small></li>`).join('')}</ol>
  <p class="note">바깥 사람은 이 교를 마교라 부른다. 교도는 천마신교라 부르고, 구호는 "${esc(MG4.cry)}"이다.</p></div>`}
hook('sectActDone',c=>{if(c.a!=='sjoin'||c.x!=='cheonma'||P.sect!=='cheonma')return;
  log(`천마신전 비석의 교규: ${MG4.creed.map(([t])=>t).join(' / ')}.`,'info');log(`교도들이 외친다. "${MG4.cry}!"`,'sys')});
hook('leaderDuel',o=>{if(o.win&&o.kind==='take')setTimeout(()=>{if(playing)mgCry('교도들이 새 천마를 맞는다')},2600)});
hook('sectAct',c=>{if(c.a==='ldwar'&&c.x==='out'&&typeof isLeader==='function'&&isLeader()&&P.ldWar==='out')mgCry('천마신교가 출정한다')});
// ---- ② 충성의 세 갈래 ----
function mlWhy(){if(!mlMember())return'마교도만';if(P.mloyal)return'이미 정했다';if(P.imk&&P.imk.st==='trial')return'입마곡부터';return''}
function mlPick(k){if(mlWhy()||!MG4.loyal[k])return false;const L=MG4.loyal[k];P.mloyal=k;
  if(k==='fear'){P.gu=0;P.guOk=1;log('교가 몸에 혈고를 심었다. 해마다 천마신전에서 해약을 받아야 한다. 올해 해약은 이미 받았다.','dmg')}
  log(`교를 따르는 이유: ${L.n}. ${L.d}. (${L.fx})`,'xp');feat(`천마신교를 ${L.n}(으)로 따르기로 했다`);recalc();return true}
function guTake(){if(!mlMember()||P.mloyal!=='fear'||P.guOk)return false;const had=P.gu||0;P.guOk=1;P.gu=0;recalc();
  log(had>0?'해약을 받아 삼켰다. 혈고가 잠잠해지고 몸이 돌아왔다.':'올해의 해약을 받았다. 혈고가 잠잠하다.','xp');return true}
hook('newYear',()=>{if(!P||P.mloyal!=='fear')return;
  if(!P.guOk){P.gu=Math.min(MG4.guMax,Math.round(((P.gu||0)+MG4.gu)*100)/100);recalc();log(`해약을 받지 못해 혈고가 몸을 갉아먹는다. 생명 상한 -${Math.round(P.gu*100)}%.`,'dmg')}
  P.guOk=0;if(mlMember())setTimeout(()=>{if(playing&&!P.guOk)log('새해다. 천마신전에서 올해의 해약을 받아야 한다.','info')},1500)});
hook('recalc',()=>{if(P&&P.gu>0){P.maxHp=Math.max(1,Math.round(P.maxHp*(1-P.gu)));P.hp=Math.min(P.hp,P.maxHp)}});
// 교를 떠나면 신앙·출세는 사라지고 공포(혈고)는 남는다. 다시 들면 이유를 다시 고른다 (공포였다면 그대로)
hook('sectActDone',c=>{if(c.a==='sleave'&&!P.sect&&P.mloyal&&P.mloyal!=='fear')P.mloyal=null});
// 배율: 마성·죄값·공적
{const ma=maraAdd;maraAdd=function(v,why){const L=mlOf();if(v>0&&L&&mlMember())v*=L.mara;return ma(v,why)}}
{const sa=sinAdd;sinAdd=function(v,why){const L=mlOf();if(v>0&&L&&mlMember())v=Math.max(1,Math.round(v*L.sin));return sa(v,why)}}
{const am=addMerit;addMerit=function(sid,v){const L=mlOf();if(sid==='cheonma'&&v>0&&L&&P.sect==='cheonma')v=Math.round(v*L.merit);return am(sid,v)}}
// 입마곡을 나오면 한 번 일러 준다
hook('tick',()=>{if(!P||!mlMember()||P.mloyal||P.mlHint||!P.imk||P.imk.st!=='done')return;P.mlHint=1;
  setTimeout(()=>{if(playing)log('천마신전의 교주가 묻는다. "너는 무엇 때문에 이 교를 따르느냐?" 천마신전에서 답하세요.','sys')},2500)});
function loyalHtml(){if(!mlMember())return'';const L=mlOf(),why=mlWhy();
  if(L){const gu=P.mloyal==='fear'?` · 혈고 ${P.gu>0?`<b class="bad">생명 상한 -${Math.round(P.gu*100)}%</b>`:'잠잠'} · 올해 해약 ${P.guOk?'받음':'<b>아직</b>'}`:'';
    return `<div class="card"><h4>교를 따르는 이유 <small class="dim">${esc(L.n)}</small></h4><p class="note">${esc(L.d)}. ${esc(L.fx)}${gu}</p>
      ${P.mloyal==='fear'&&!P.guOk?`<div class="row2"><span class="note">교주가 해약을 내린다.</span>${B('guok','해약 받기',{pri:1})}</div>`:''}</div>`}
  return `<div class="card"><h4>교를 따르는 이유 <small class="dim">교주의 물음</small></h4><p class="note">"너는 무엇 때문에 이 교를 따르느냐?" 한 번 고르면 이 교에 있는 동안 바꿀 수 없다.${why?` <small class="dim">${esc(why)}</small>`:''}</p>
    ${Object.entries(MG4.loyal).map(([k,o])=>`<div class="row2"><span class="note"><b>${esc(o.n)}</b> · ${esc(o.d)} <small class="dim">${esc(o.fx)}</small></span>${B('mloyal:'+k,o.n,{d:!!why})}</div>`).join('')}</div>`}
// 교주가 간부를 묶는 법
const bindOf=()=>MG4.bind[(P&&P.ldBind)||'rank']||{income:1,chal:1};
function bindPick(k){if(typeof isLeader!=='function'||!isLeader()||!MG4.bind[k]||P.ldBind===k)return false;const o=MG4.bind[k];P.ldBind=k;
  if(o.evil){P.evil=(P.evil||0)+o.evil}log(`교주의 다스림: ${o.n}. ${o.d}. (${o.fx})`,'sys');return true}
hook('newYear',()=>{if(typeof isLeader!=='function'||!isLeader())return;const o=bindOf();if(o.income<1){const cut=Math.round(LD.income*(1-o.income));P.silver=Math.max(0,P.silver-cut);log(`세입 가운데 은자 ${cut}을 간부들에게 나눴다.`,'info')}});
{const lc=leaderChallenge;leaderChallenge=function(){const o=bindOf();if(o.chal<1&&isLeader()&&Math.random()>=o.chal){log(P.ldBind==='dok'?'자리를 노리던 간부가 해약이 끊길까 두려워 물러섰다.':'자리를 노리던 간부가 교주의 덕을 입어 칼을 거두었다.','info');return false}return lc()}}
function bindHtml(){if(typeof isLeader!=='function'||!isLeader())return'';const cur=P.ldBind||'rank';
  return `<div class="card"><h4>간부를 묶는 법 <small class="dim">${esc(MG4.bind[cur].n)}</small></h4>
    ${Object.entries(MG4.bind).map(([k,o])=>`<div class="row2"><span class="note">${k===cur?'<b class="gold">':'<b>'}${esc(o.n)}</b> · ${esc(o.d)} <small class="dim">${esc(o.fx)}</small></span>${k===cur?'':B('ldbind:'+k,'이렇게 다스린다')}</div>`).join('')}</div>`}
// 오당 당주는 저마다 교를 따르는 이유가 있다 (분위기)
const DANG_LOYAL=['faith','rise','fear'];
hook('npcDlg',c=>{if(!c.html||!c.n||!c.n.dang||c.n.maeng||typeof MDANG==='undefined'||!MDANG[c.n.dang])return;const ks=Object.keys(MDANG),k=DANG_LOYAL[ks.indexOf(c.n.dang)%3],o=MG4.loyal[k];if(!o)return;
  const say={faith:'천마의 뜻이 곧 내 길이다.',rise:'공을 세운 만큼 오른다. 이 교만큼 공평한 곳이 없다.',fear:'해약이 끊기면 나는 죽는다. 그러니 누구보다 충실하지.'}[k];
  c.html+=`<p class="note">${esc(c.n.n)}: "${say}" <small class="dim">(${esc(o.n)})</small></p>`});
// ---- ③ 소교주 후보의 출신 ----
const candOf=i=>MG4.cand[Math.min(i,MG4.cand.length-1)]||null;
{const sd=sgjDuel;sgjDuel=function(){const i=P.sgjI||0;sd();const t=G.sgjDuel;if(!t||t.i!==i)return;const o=candOf(i),e=mobs.find(m=>m.duel&&m.hp>0);if(!o||!e)return;
  e.maxHp=e.hp=Math.round(e.maxHp*o.kh);e.atk=Math.round(e.atk*o.ka);e.name=`${e.name} · ${o.n}`;e.cand=o.k;
  log(`${o.n}의 후보: "${o.line}"`,'info');if(o.k==='blood')log('교주의 혈육은 피로만 잇는 비전 초식을 쓴다. 당신은 그 초식을 배운 적이 없다.','dmg')}}
{const se=sgjDuelEnd;sgjDuelEnd=function(win,e){const had=P.sgj;se(win,e);if(had||!P.sgj)return;
  const pool=MG4.oppN.slice(),opp=[];for(let k=0;k<MG4.opp&&pool.length;k++)opp.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);P.sgjOpp=opp;
  if(opp.length)log(`소교주가 되었지만 다른 후보를 밀던 ${opp.join('·')}이(가) 아직 고개를 숙이지 않습니다. 천마신전에서 공적으로 설득해야 교내 입지가 섭니다 (한 명에 공적 ${MG4.pay}).`,'info')}}
function oppWhy(){if(!(P.sgjOpp&&P.sgjOpp.length))return'설득할 장로가 없다';if(P.sect!=='cheonma')return'마교도만';if((P.merit.cheonma||0)<MG4.pay)return`공적 ${MG4.pay} 필요 (지금 ${Math.floor(P.merit.cheonma||0)})`;return''}
function oppWin(){if(oppWhy())return false;P.merit.cheonma-=MG4.pay;const n=P.sgjOpp.shift();P.fame+=10;
  if(P.sgjOpp.length)log(`${n}이(가) 소교주를 따르기로 했습니다. 남은 반대파 ${P.sgjOpp.join('·')}.`,'xp');
  else{log(`${n}마저 무릎을 꿇었습니다. 장로원 전체가 소교주를 따릅니다. 교내 입지가 섰습니다.`,'xp');showBanner('교내 입지','장로원이 소교주를 따른다');feat('장로원 전체를 소교주의 편으로 돌렸다')}return true}
{const lw=leaderWhy;leaderWhy=function(){const w=lw();if(w)return w;if(P.sgjOpp&&P.sgjOpp.length)return`소교주를 반대한 장로 ${P.sgjOpp.length}명(${P.sgjOpp.join('·')})부터 설득해야`;return''}}
function oppHtml(){if(!(P.sgjOpp&&P.sgjOpp.length)||P.sect!=='cheonma')return'';const w=oppWhy();
  return `<div class="row2"><span class="note">반대파 장로 <b>${esc(P.sgjOpp.join('·'))}</b> · 한 명에 공적 ${MG4.pay}. 모두 설득해야 교주 비무를 청할 수 있다.${w?` <small class="dim">${esc(w)}</small>`:''}</span>${B('sgjopp','장로 설득',{d:!!w})}</div>`}
{const sh=sgjHtml;sgjHtml=function(s,hq){const h=sh(s,hq);if(P.sgj)return h+oppHtml();const i=P.sgjI||0,o=candOf(i);
  return h+(o?`<div class="row2"><span class="note">후보: ${MG4.cand.map((c,k)=>k<i?`<s class="dim">${esc(c.n)}</s>`:k===i?`<b>${esc(c.n)}</b>`:esc(c.n)).join(' → ')} <small class="dim">뒤로 갈수록 세다. 교주의 혈육은 비전을 쓴다</small></span></div>`:'')}}
// ---- 천마신전 대화와 단추 ----
hook('hqDlg',c=>{if(c.n.hq!=='cheonma')return;c.html+=creedHtml();if(P.sect==='cheonma')c.html+=loyalHtml()+bindHtml()});
hook('sectAct',c=>{
  if(c.a==='mloyal'){c.done=true;c.r=true;mlPick(c.x)}
  else if(c.a==='guok'){c.done=true;c.r=true;guTake()}
  else if(c.a==='ldbind'){c.done=true;c.r=true;bindPick(c.x)}
  else if(c.a==='sgjopp'){c.done=true;c.r=true;oppWin()}});

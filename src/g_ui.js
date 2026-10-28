// ================= log, banner =================
const $=id=>document.getElementById(id);
const logEl=$('log');
// pick the right particle after a Korean word: 을/를, 이/가, 은/는, 와/과, 으로/로
const DIGF=[21,8,0,16,0,0,1,8,8,0];
function josa(s){return String(s).replace(/([가-힣0-9])(<\/b>)?(을\(를\)|이\(가\)|은\(는\)|와\(과\)|\(으\)로)/g,(m,ch,tag,j)=>{const f=/[0-9]/.test(ch)?DIGF[+ch]:(ch.charCodeAt(0)-0xAC00)%28;tag=tag||'';
  const t={'을(를)':f?'을':'를','이(가)':f?'이':'가','은(는)':f?'은':'는','와(과)':f?'과':'와','(으)로':f&&f!==8?'으로':'로'}[j];return ch+tag+t})}
const logHist=[];   // 시스템 메시지 기록: 메시지창을 누르면 되돌아본다
function log(t,c){winNote(t,c);const tx=josa(t),last=logEl.lastElementChild;
  // v194 (점검): 같은 줄이 잇달아 오면 새 줄을 쌓지 않고 '×n'만 늘린다 ("금창약이 없습니다"가 화면을 채우던 문제)
  if(last&&last.dataset.t===tx&&(last.className||'')===(c||'')){const n=(+last.dataset.n||1)+1;last.dataset.n=n;last.textContent=`${tx} ×${n}`;return}
  const p=document.createElement('p');p.className=c||'';p.textContent=tx;p.dataset.t=tx;logEl.appendChild(p);while(logEl.children.length>14)logEl.firstChild.remove();
  logHist.push({t:p.textContent,c:c||'',at:P?`${Math.floor(P.age)}세${P.ban&&P.ban.yrs?` <small class="dim">(반로환동, 살아온 해 ${Math.floor(realAge())}년)</small>`:''} ${season()} ${SIJIN[Math.floor((tod*24+1)/2)%12]}시`:''});if(logHist.length>400)logHist.shift()}
function pLogs(){if(!logHist.length)return '<p class="note">아직 기록이 없습니다.</p>';
  return `<p class="note">최근 ${logHist.length}건, 새 것이 위. 시스템 메시지창을 누르면 언제든 볼 수 있다.</p><div class="logs">${logHist.slice().reverse().map(l=>`<p class="${l.c}"><small>${l.at}</small>${esc(l.t)}</p>`).join('')}</div>`}
// 맡은 임무와 진행도: 지역 이름 아래
let qtrackKey='';
// v136 (사용자): 임무 줄은 높이가 고정이고 스크롤된다. 누르면(끌어 스크롤하면 아님) 임무창이 열린다
// v149 (사용자): 정세 줄을 누르면 정세창, 다른 줄은 임무창
$('qtrack').addEventListener('click',e=>{if(!playing||!P)return;openPanel(e.target.closest('[data-story]')?'story':'quest')});
function questTrack(){const el=$('qtrack');if(!el)return;const qs=P.quests||[];
  const rows=qs.map(q=>{const pr=questProg(q),have=pr.have,done=pr.done,g=qGoal(q),what=q.kind==='kill'?g.plain+' 처치':g.plain+' '+g.v;return{n:q.n,s:`${q.n.includes(what)?'':what+' '}<b>${have}/${q.cnt}</b>`,done}});
  const ac=acadTrackHtml();   // 무관 과제 (g_academy.js)
  // v149: 정세(사건 선택·정세 임무)는 맨 위, 남은 시간과 함께. 정세 임무는 아래 일반 임무 줄에서 뺀다
  const sr=typeof storyRows==='function'?storyRows():[],sq=new Set(sr.map(r=>r.q).filter(Boolean)),rest=rows.filter((r,i)=>!sq.has(qs[i]));
  const st=sr.map(r=>`<div class="sq${r.done?' done':''}" data-story="1">${esc(r.n)}${r.prog?` <b>${r.prog}</b>`:''}${r.left!=null?` · <i>${r.lbl} ${fmtLeft(r.left)}</i>`:''}</div>`).join('');
  const key=ac+st+rest.map(r=>r.n+r.s+r.done).join('|');if(key===qtrackKey)return;qtrackKey=key;el.hidden=!rest.length&&!ac&&!st;
  el.innerHTML=ac+(st?`<h5>정세 <small>누르면 정세창</small></h5>`+st:'')+(rest.length?`<h5>맡은 임무 ${rest.length}</h5>`+rest.map(r=>`<div class="${r.done?'done':''}">${esc(r.n)} · ${r.s}${r.done?' · 완료':''}</div>`).join(''):'')}
// 남은 시간: 한 시간 넘으면 시·분, 그 아래는 분·초, 1분 아래는 초
function fmtLeft(sec){sec=Math.max(0,Math.ceil(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${h}시간 ${m}분`:m?`${m}분 ${s}초`:`${s}초`}
let noteT;
// 창(행낭·인물창 등)이나 수련 창이 열려 있을 때의 메시지는 화면 맨 위 레이어에 잠깐 띄웠다가 서서히 지운다.
// 위치는 위쪽 상태창·지도 아래, 아래쪽 조이스틱·버튼 위라 조작을 가리지 않고, 터치도 통과한다.
const SYS=document.createElement('div');SYS.className='sysmsg';SYS.setAttribute('role','status');SYS.setAttribute('aria-live','polite');$('stage').appendChild(SYS);
function sysMsg(t,c){
  t=josa(t);const last=SYS.lastElementChild;
  if(last&&last.textContent===t&&last.classList.contains('on')){clearTimeout(last.t);last.t=setTimeout(()=>sysOut(last),2600);return}
  const p=document.createElement('p');p.className=c||'';p.textContent=t;SYS.appendChild(p);
  while(SYS.children.length>(document.body.classList.contains('touch')?2:3))SYS.firstElementChild.remove();document.body.classList.add('sys-on');
  requestAnimationFrame(()=>requestAnimationFrame(()=>p.classList.add('on')));
  p.t=setTimeout(()=>sysOut(p),2600+Math.min(1600,t.length*30))}
function sysOut(p){p.classList.remove('on');p.classList.add('off');setTimeout(()=>{p.remove();if(!SYS.children.length)document.body.classList.remove('sys-on')},650)}
function winNote(t,c){if(!$('win').hidden||trnOpen)sysMsg(t,c)}
let bannerT;
function showBanner(t,s){const b=$('banner');b.innerHTML='';b.append(josa(t));if(s){const sm=document.createElement('small');sm.textContent=josa(s);b.append(sm)}b.classList.add('on');clearTimeout(bannerT);bannerT=setTimeout(()=>b.classList.remove('on'),1700)}
// v149 (사용자): 정세 사건은 창을 띄우지 않고 화면 가운데에 크게 박는다 (맵 이동 알림보다 세게, 터치는 통과)
let sbanT;function storyBanner(t,s,k){const b=$('sban');if(!b)return;b.innerHTML=`<div class="bd"></div><div class="k">${esc(k||'강호 정세')}</div><div class="t">${esc(t)}</div>${s?`<div class="s">${esc(josa(s))}</div>`:''}`;
  b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(sbanT);sbanT=setTimeout(()=>b.classList.remove('on'),4300);shake=Math.max(shake||0,.25);if(typeof sfx==='function')sfx('ult')}
function addText(x,y,t,c){texts.push({x,y,t:String(t),c,life:.9})}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ================= skill bar =================
const BAR1=[...SLOTKEY.map((k,i)=>({id:'f'+i,key:k,pad:PADKEY[i],form:i})),{id:'ult',key:'S',pad:'5',u:1},{sep:1},
  {id:'암기',key:'1',sp:1},{id:'독공',key:'2',sp:1},{id:'점혈',key:'3',sp:1},{id:'신공',key:'V',sg:1}];
const BAR2=[{id:'금창약',key:'4',con:1},{id:'소환단',key:'5',con:1},{id:'leap',key:'␣',n:'도약'},{id:'medit',key:'X',n:'운기'},{id:'ridebtn',key:'M',n:'말'},{id:'use',key:'F',n:'행동'},{sep:1},
  {id:'p_char',key:'K',n:'인물',menu:1},{id:'p_arts',key:'B',n:'무공',menu:1},{id:'p_bag',key:'I',n:'행낭',menu:1},{id:'p_ally',key:'P',n:'동료',menu:1},{id:'p_life',key:'L',n:'생활',menu:1},{id:'p_hist',key:'H',n:'강호사',menu:1}];
function buildBar(){
  const mk=(row,list)=>{$(row).innerHTML=list.map(b=>b.sep?'<span class="sep"></span>':`<button class="sk${b.menu?' menu':''}${b.u?' u':''}" id="b_${b.id}" type="button"><b>${b.key}${b.pad?'·'+b.pad:''}</b><span class="nm">${b.n||''}</span><em></em><span class="cd"></span></button>`).join('')};
  mk('row1',BAR1);mk('row2',BAR2);
  for(const b of[...BAR1,...BAR2]){if(b.sep)continue;$('b_'+b.id).addEventListener('pointerdown',e=>{e.preventDefault();press(b)})}
}
function press(b){
  if(!playing)return;
  if(b.menu){openPanel(b.id.slice(2));return}if(paused)return;
  if(b.form!==undefined)useForm(b.form);else if(b.u)ultimate();else if(b.sp)special(b.id);else if(b.sg)shingong();else if(b.con)useCon(b.id);
  else if(b.id==='leap')leap();else if(b.id==='medit')meditate();else if(b.id==='ridebtn')rideToggle();else if(b.id==='use')useNearest();
}
function meditate(){if(P.medit){P.medit=false;return}if(typeof simCur==='function'&&simCur().none){log('익힌 심법이 없어 운기조식을 할 수 없습니다.','info');return}   // v144 (사용자): 내공을 채우는 일도 심법을 익힌 뒤
  if(inCombat()){log('싸움 중에는 운기조식을 할 수 없습니다.','info');return}P.path=null;P.target=null;P.medit=true;log('운기조식: 가만히 앉아 내공을 되찾는다. 내공은 운기조식과 회복약(소환단·보리죽)으로만 찬다.','info')}
// HUD는 매 프레임 그린다: 값이 바뀐 것만 DOM에 쓴다 (예전엔 프레임마다 textContent 36번·querySelector 40번이 레이아웃을 다시 잡게 했다)
const txt=(el,v)=>{v=String(v);if(el._t!==v){el._t=v;el.textContent=v}};
const sty=(el,k,v)=>{const c=el._s||(el._s={});if(c[k]!==v){c[k]=v;el.style[k]=v}};
const qc=(el,sel)=>{const c=el._q||(el._q={});return c[sel]||(c[sel]=el.querySelector(sel))};
const $t=(id,v)=>txt($(id),v);
const tip=(el,v)=>{if(el._ti!==v){el._ti=v;el.title=v}};
const setW=(id,v)=>sty($(id),'width',clamp(v,0,1)*100+'%');
function hud(){
  if(!P)return;const a=art(),s=A(a.id);
  $t('nm',P.name);$t('rank',`${realmName()} · ${facName()}`);
  $t('sub',`${STATUS[P.status].n} · ${GEUNGOL[P.side][P.gg][0]} · 오성 ${P.wis} · ${Math.floor(P.age)}세${P.age<18?' (유아기)':''}${P.ban&&P.ban.yrs?` (살아온 해 ${Math.floor(realAge())}년)`:''}`);
  setW('hpb',P.hp/P.maxHp);setW('qib',P.qi/P.maxQi);setW('msb',s.p/100);
  if($('mag')){const ma=typeof isMa==='function'&&isMa();sty($('mag'),'display',ma?'':'none');if(ma){const tm=isTalma();$('mag').classList.toggle('tm',tm);setW('mab',(P.mara||0)/100);$t('mat',tm?`탈마 · 마성 ${Math.round(P.mara||0)}`:`마성 ${Math.round(P.mara||0)} · ${MARA_N[maraTier()]}${P.burst?' · 폭주':''}`)}}
  $t('hpt',`생명 ${Math.ceil(P.hp)}/${P.maxHp}${P.poison>0?' · 중독':''}${P.binsa?' · 빈사':''}`);$t('qit',`내공 ${Math.floor(P.qi)}/${P.maxQi}`);if(typeof qsHud==='function')qsHud();
  $t('mst',`${a.n} 숙련 ${Math.floor(s.p)} · ${TIERS[tierOf(s.p)]}${hasWeaponFor(a.cls)?'':a.cls==='권'?' · 병기를 벗어야':' · 병기 없음'}`);
  $t('res',`활력 ${P.vit}/${maxVit()} · 은자 ${P.silver} · 명성 ${P.fame} · 업보 ${P.good-P.evil>=0?'+':''}${P.good-P.evil}`);
  $t('zone',regionAt(Math.floor(P.x),Math.floor(P.y))+(G.duel?' · 비무 중':''));
  questTrack();$t('cal',`${season()} · ${G.weather} · ${SIJIN[Math.floor((tod*24+1)/2)%12]}시${P.ride?' · 기마':''}${P.medit?' · 운기조식':''}`);
  $t('modeb',P.mode==='auto'?'자동초식':'수동초식');$('modeb').classList.toggle('on',P.mode==='manual');$('runb').classList.toggle('on',P.run);$('forceb').classList.toggle('on',forceAtk);
  const ch=P.chain,live=time-ch.t<1.7;
  for(let i=0;i<6;i++){const b=$('b_f'+i),f=a.forms[i];if(!f){b.classList.add('off');txt(qc(b,'.nm'),'');txt(qc(b,'em'),'');sty(qc(b,'.cd'),'height','0');tip(b,'');continue}
    const on=s.f[i];const tag=f.n+on;if(b.dataset.n!==tag){b.dataset.n=tag;txt(qc(b,'.nm'),f.n);tip(b,`${f.n} · ${plabel(f)} · 연속기 +${f.bonus}%${on?'':` · 미습득 (숙련 ${f.req}, 활력 ${f.cost})`}`)}
    txt(qc(b,'em'),on?formQi(f):'');b.classList.toggle('off',!on);b.classList.toggle('lock',on&&(P.qi<formQi(f)||!hasWeaponFor(a.cls)));
    sty(qc(b,'.cd'),'height',(on?P.fcd[i]/P.fmax[i]*100:0)+'%');b.classList.toggle('used',live&&ch.last===i)}
  const u=$('b_ult');txt(qc(u,'.nm'),a.ult.n);u.classList.toggle('off',!allLearned(a.id));sty(qc(u,'.cd'),'height',(P.ucd/8*100)+'%');tip(u,`필살기 ${a.ult.n} · 초식을 모두 익혀야 쓸 수 있다`);
  for(const k of['암기','독공','점혈']){const b=$('b_'+k);txt(qc(b,'.nm'),k);b.classList.toggle('off',!P.sp[k]);sty(qc(b,'.cd'),'height',(P.scd[k]/SPEC[k].cd*100)+'%');
    txt(qc(b,'em'),k==='암기'?(P.mats.비도||0):SPEC[k].qi)}
  const g=$('b_신공');txt(qc(g,'.nm'),P.sg.name?P.sg.name.slice(0,2):'신공');g.classList.toggle('off',!P.sg.name);sty(qc(g,'.cd'),'height',(P.scd.신공/5*100)+'%');
  for(const k of['금창약','소환단']){const b=$('b_'+k);txt(qc(b,'.nm'),k);txt(qc(b,'em'),P.mats[k]||0);b.classList.toggle('lock',!(P.mats[k]>0))}
  $('b_medit').classList.toggle('used',P.medit);$('b_ridebtn').classList.toggle('off',!allies.some(x=>x.d&&x.d.ride));
  if(TOUCH)touchHud();
  if(P.chan){$('chan').hidden=false;$t('chant',P.chan.label);sty($('chanb'),'width',(P.chan.t/P.chan.dur*100)+'%')}else $('chan').hidden=true;
}
function plabel(f){
  const m={melee:'단일',multi:`${f.hits}연타`,arc:'부채꼴',circle:'주변 전체',line:'직선 관통',drop:'원격 낙하',rain:'광역 낙하',pull:'끌어당김',chain:'연쇄',blink:'순간이동',blinkMulti:'연속 순간이동',dash:'돌진'};
  let s=f.p==='proj'?(f.full?`${f.cnt}방향 원격`:f.cnt>1?`원격 ${f.cnt}발`:'원격'):m[f.p];
  if(f.p==='dash')s+=' + '+plabel(f.then);if(f.hits>1&&f.p!=='multi')s+=` ×${f.hits}`;if(f.stun)s+=' · 기절';if(f.p==='proj'&&f.pierce)s+=' · 관통';if(f.path&&typeof PATH_N!=='undefined')s+=' · '+PATH_N[f.path];return s}

// ================= windows =================
let panel=null;
const TITLES=GD.TITLES;
let panelAt=0;
function openPanel(id,arg){if(trnOpen)closeTrain();if(panel===id&&id!=='npc'){closePanels();return}panel=id;panelAt=performance.now();panelArg=arg;$('win').hidden=false;{const sb=$('sban');if(sb)sb.classList.remove('on')}   // v195: 창을 열면 정세 배너를 걷는다 (정세 창을 가렸다)
  paused=true;renderOpen();$('wbody').scrollTop=0;runHooks('panelOpen',id)}
let panelArg=null;
function closePanels(){$('wnote').hidden=true;panel=null;$('win').hidden=true;if(playing)paused=false}
function renderOpen(){if(!panel||$('win').hidden)return;const f={quest:pQuest,char:pChar,arts:pArts,bag:pBag,ally:pAlly,life:pLife,hist:pHist,npc:pNpc,house:pHouse,help:pHelp,menu:pMenu,world:pWorld,logs:pLogs,story:pStory}[panel];
  $('wtitle').innerHTML=panel==='npc'?esc(panelArg.n):TITLES[panel]+(panel==='bag'?`<small>${P.bag.length}/24</small>`:'');
  // 창 하나를 그리다 오류가 나도 창은 열리고 닫기 단추가 남는다 (오류는 꺼짐 기록에 남긴다)
  let h;try{h=f(panelArg)}catch(e){if(typeof crashErr==='function')crashErr('panel '+panel+': '+e.message);console.warn(e);h=`<p class="note bad">이 창을 그리다 문제가 생겼습니다. 물건과 기록은 그대로 있습니다. 닫고 다시 열거나 게임을 새로 켜 주세요.</p>`}
  $('wbody').innerHTML=josa(h)}
const B=(act,label,o={})=>`<button type="button" class="btn${o.pri?' pri':''}" data-act="${act}"${o.d?' disabled':''}${o.t?` title="${esc(o.t)}"`:''}>${label}</button>`;
function pChar(){
  const c=qiCost(P.side,P.qiN);
  const stats=STATS.map(({k,n})=>{const v=P.st[k],add=v-P.base[k];const fx=k==='str'?`공격력 +${v*2}`:k==='end'?`활력 최대 ${150+v*25}, 피해 감소`:k==='agi'?`현묘도 +${v*2}, 이동·재사용`:`생명 +${v*10}, 생명 회복 ${(1+v*.2).toFixed(1)}/초, 수명 +${Math.floor(v*.5)}년`;
    return `<div class="it"><div>${n} <b class="num gold">${v}</b>${add?` <small class="good">(근골 ${P.base[k]} +${add})</small>`:''}<span>${fx}</span></div><div class="ib"></div></div>`}).join('');
  return `<div class="card"><div class="row2"><h3>${esc(P.name)} <small class="dim">${P.lifeNo}번째 생</small></h3><span class="tag">${STATUS[P.status].n} · ${facName()} · ${simCur().n} <small class="dim">${simCur().sc} ${simCur().el}</small>${simCur().tr&&simCur().tr.length?` <small class="dim">${simTraitTxt(simCur())}</small>`:''}</span></div>
    <p>근골 <b class="gold">${GEUNGOL[P.side][P.gg][0]}</b> · 오성 <b class="gold">${P.wis}</b> (익힐 수 있는 무공 ${artCap()}가지, 숙련 증가 ${Math.round(wisMul()*100)}%) · ${Math.floor(P.age)}세${P.ban&&P.ban.yrs?` <small class="dim">(반로환동, 살아온 해 ${Math.floor(realAge())}년)</small>`:''} ${season()}${P.age>=P.life-6?' · <span class="bad">기력이 쇠했다</span>':''}</p>
    <p>공격력 ${atk()} · 현묘도 ${hmv()} · 받는 피해 -${Math.round(guard()*100)}% · 이동 ${moveSpd().toFixed(2)}</p>
    <p>문파 ${P.sect==='own'?esc(P.sectName)+' (문주)':P.sect&&SECTS[P.sect]?`<b class="gold">${esc(sectName())} ${rankName()}</b> · ${ALLY[SECTS[P.sect].al].n} · 누적 공적 ${(P.mtot||{})[P.sect]||0}`:'없음'}${typeof maengOf==='function'&&maengOf()?` · ${MAENG[maengOf()].short} <b class="gold">${maengRankName(maengOf())}</b> (맹 공적 ${(P.mpt||{})[maengOf()]||0})`:''}</p></div>
    ${realmCard(c)}
    <div class="card"><h4>기본기 <small class="dim">활력을 들여 언제든 다질 수 있다</small></h4><div class="list">${stats}</div><div class="row2"><span class="note">기본기와 내공은 수련 창에서 다진다. 수련 창은 화면 아래에 열려 캐릭터가 보인다.</span>${B('trainwin','수련하기 (U)',{pri:1})}</div></div>
    ${typeof maraHtml==='function'?maraHtml():''}${typeof sinHtml==='function'?sinHtml():''}${typeof diffHtml==='function'?diffHtml():''}
    <div class="card"><h4>업보와 명성</h4><p>선업 <span class="good">${P.good}</span> · 악업 <span class="bad">${P.evil}</span> · 명성 ${P.fame} · 처치 ${P.kills} · 우두머리 ${P.bosses}</p>
      <p>죽으면 업보와 명성으로 다음 생의 신분과 보상 활력이 정해진다.</p></div>
    ${typeof repHtml==='function'?repHtml():''}
    <div class="card"><h4>절세신공</h4><p>${P.sg.name?`<b class="gold">${P.sg.name}</b> · ${SHINGONG[P.sg.name].d}`:'아직 없음. 화경에 오른 뒤 우두머리에게서 열 장을 모은다. 캐릭터당 하나, 수동초식 상태 전용, 재사용 5초.'}</p>
      <p>${Object.keys(SHINGONG).map(k=>`${k} ${P.sg.pages[k]||0}/10`).join(' · ')}</p></div>`;
}
// 무공 잊기 (v184, 사용자 2026-10-26): 익힌 무공을 지워 오성이 정한 칸을 비운다. 숙련과 초식이 모두 사라지고 되돌릴 수 없어 한 번 더 묻는다
let forgetAsk=null;hook('panelOpen',()=>{forgetAsk=null});
function forgetWhy(id){const a=ARTS[id];if(!a||!A(id))return'익히지 않은 무공';if(id==='base'||a.base)return'기본 무공은 잊을 수 없다';
  if(typeof acadOn==='function'&&acadOn()){const m=acadMainArt();if(m&&m.id===id)return'무관에서 닦는 무공은 졸업한 뒤에 잊을 수 있다'}
  return null}
function forgetNote(id){const a=ARTS[id],s=A(id),o=[`숙련 ${Math.floor(s.p)}과 익힌 초식 ${s.f.filter(Boolean).length}개가 모두 사라진다`];
  const mu=typeof artMu==='function'?Math.round(artMu(id)*10)/10:0;if(mu>0)o.push(`경지의 무리가 ${mu} 줄어든다`);
  if(P.sect&&SECTS[P.sect]&&a.sect===P.sect&&(START[P.sect]||{}).art===a.n)o.push('문파 입문공이라 사부도 다시 처음부터 가르쳐 주지 않는다');
  if(a.gy)o.push('기연 무공이라 다시 만나기 어렵다');
  o.push('다시 익히려면 첫 초식 비급부터 읽어야 한다');return o.join('. ')+'.'}
function forgetArt(id){if(forgetWhy(id))return false;const a=ARTS[id];delete P.arts[id];
  if(P.cur===id||!A(P.cur))setArt('base');recalc();runHooks('artForget',id);
  log(`[${a.n}]을(를) 잊었습니다. 익힌 무공 ${capArts().length}/${artCap()}`,'sys');return true}
function pArts(){
  const list=['base',...learnedArts()].map(id=>{const a=ARTS[id],s=A(id),on=P.cur===id;
    const forms=a.forms.map((f,i)=>`<li class="${s.f[i]?'':'off'}"><span class="key">${SLOTKEY[i]}·${PADKEY[i]}</span><span>${f.n} <small>${plabel(f)}</small></span><small>${s.f[i]?`내공 ${f.qp}%·${qsCur()}성 ${formQi(f)} · +${f.bonus}%`:a.base||a.gy?`숙련 ${f.req}에 열림`:`숙련 ${f.req} · 활력 ${f.cost}`}</small></li>`).join('')
      +`<li class="ult ${allLearned(id)?'':'off'}"><span class="key">S·5</span><span>${a.ult.n}</span><small>필살기 · 주변 범위</small></li>`;
    return `<div class="card"><div class="row2"><h3 style="color:rgb(${a.ct})">${a.n}</h3><span class="tag">${a.gy?'기연 · ':a.made?'창안 · ':''}${a.base?'':AGR[a.grade||0]+' · '}${CLASS[a.cls].n} · 특성 ${trHtml(a)} · 숙련 ${Math.floor(s.p)}/100 · ${TIERS[tierOf(s.p)]}</span></div>
      <p>${a.d}${hasWeaponFor(a.cls)?'':` <span class="bad">${a.cls==='권'?'맨손이거나 권갑을 차야 펼칠 수 있다.':`${a.cls}을(를) 차야 펼칠 수 있다.`}</span>`}</p><div class="mbar"><i style="width:${s.p}%"></i></div><ol class="forms">${forms}</ol>
      <div class="ib">${B('setart:'+id,on?'펼치는 중':'펼치기',{d:on,pri:!on})}${id==='base'?'':B('forget:'+id,'잊기',{d:!!forgetWhy(id)})}</div>
      ${id!=='base'&&forgetWhy(id)?`<p class="note dim">${forgetWhy(id)}.</p>`:''}
      ${forgetAsk===id?`<div class="card" id="forgetask"><p><b class="bad">[${a.n}]을(를) 잊을까요?</b> ${forgetNote(id)}</p><div class="center">${B('forgetok:'+id,'잊는다',{pri:1})} ${B('forgetno','그만둔다')}</div></div>`:''}</div>`}).join('');
  return `<div class="row2"><span class="note">익힌 무공 ${capArts().length}/${artCap()} (오성 ${P.wis}) · 초식 비급을 행낭에서 읽어 익힌다 · 칸이 차면 '잊기'로 비운다</span>${B('mode',P.mode==='auto'?'자동초식 → 수동':'수동초식 → 자동')}</div>
    ${list}
    ${gyNote()}
    ${typeof gsHtml==='function'?gsHtml():''}
    ${simArtsHtml()}
    ${ggArtsHtml()}
    ${bobArtsHtml()}
    ${pasArtsHtml()}
    <div class="card"><h4>특수무공</h4><p>${['암기','독공','점혈'].map(k=>`${k} ${P.sp[k]?'<span class="good">익힘</span>':'<span class="dim">미습득</span>'}`).join(' · ')} · 비도 ${P.mats.비도||0}자루</p></div>
    <p class="note"><b class="gold">연속기</b> 초식을 1.7초 안에 순서대로(앞 번호에서 뒷 번호로) 이어 치면 추가 공력이 쌓인다. 예: 14%·20%·38%를 이으면 마지막 초식은 172%로 나간다. <b class="gold">필살기</b> 모든 초식을 익히면 S(키패드 5)로 주변을 친다. 연속기 끝에 쓰면 쌓인 공력이 실린다. <b class="gold">속성 상극</b>은 운용 중인 심법의 속성을 따른다: 화→금→목→토→수→화, 양→음→뇌→양, 이기는 쪽 1.3배. 무공 이펙트 색은 심법 계열(불가·도가·정종·사공·마공·사불)의 것. <b class="gold">자동초식</b>은 클릭한 적에게 익힌 초식을 차례로 잇되 필살기는 쓰지 않고(직접 S·필살 버튼), <b class="gold">수동초식</b>은 클릭이 평타만 친다.</p>`;
}
let shopMode=null;
function pBag(){
  const sell=shopMode;
  const eq=Object.entries({weapon:'무기',armor:'의복',acc:'장신구',boots:'신발'}).map(([k,n])=>{const it=P.eq[k];
    return `<button type="button" class="eq" data-act="uneq:${k}"${it?'':' disabled'}><small>${n}</small>${it?`<b style="color:${itemCol(it)}">${esc(itemLabel(it))}</b><span>${itemDesc(it)}</span>`:'<span>비어 있음</span>'}</button>`}).join('');
  const bag=P.bag.length?P.bag.map(it=>{try{return bagRow(it,sell)}catch(e){typeof crashErr==='function'&&crashErr('bag '+(it&&it.name)+': '+e.message);
    return `<div class="it"><div><b>${esc(String(it&&it.name||'알 수 없는 물건'))}</b><span>알 수 없는 물건 · 버리지 않으면 그대로 남는다</span></div><div class="ib">${it&&it.id!=null?B('drop:'+it.id,'버리기'):''}</div></div>`}}).join(''):'<p class="note">행낭이 비어 있습니다.</p>';
  const mats=Object.entries(P.mats).filter(([k,n])=>n>0).map(([k,n])=>`<div class="mat"><span>${esc(k)} <b class="num">${n}</b></span>${CONSUME[k]?`<button type="button" data-act="con:${k}" title="${CONSUME[k].d}">쓰기</button>`:''}${sell&&MAT_PRICE[k]?`<button type="button" data-act="sellm:${k}">팔기</button>`:''}</div>`).join('')||'<p class="note">재료가 없습니다.</p>';
  return `<div class="eqs">${eq}</div>${beltPick()}<div class="list">${bag}</div><h4 style="margin:0;font-family:var(--display);font-weight:400">재료와 소모품</h4><div class="mats">${mats}</div>
    <p class="note">무기 공격력은 같은 계열 무공을 펼칠 때만 붙는다. 내구가 0이면 공격력이 반으로 준다. 다른 계열 내공의 비급은 읽을 수 없지만 팔 수는 있다.${sell?' 지금은 상인 앞이라 팔 수 있다.':''}</p>`;
}
// 행낭 한 줄. 물건 하나가 잘못돼도 행낭 전체가 안 열리는 일이 없게 pBag이 줄마다 감싼다
function bagRow(it,sell){const read=it.slot==='book'||it.slot==='sbook'||it.slot==='tbook'||it.slot==='pbook'||it.slot==='bbook'||it.slot==='gbook'||it.slot==='gpage'||it.slot==='leaf'||it.slot==='lib'||it.slot==='bp';
    return `<div class="it"><div><b style="color:${itemCol(it)}">${esc(itemLabel(it))}</b> <small class="dim">${SLOTN[it.slot]||''}</small><span>${itemDesc(it)}</span>${read&&readBlock(it)?`<span class="bad">${esc(readBlock(it))}</span>`:''}</div>
      <div class="ib">${B((read?'read:':'eq:')+it.id,read?(it.slot==='leaf'?'엮기':it.slot==='lib'?'펼치기':it.slot==='bp'?'살펴보기':'읽기'):'장착')}${!read&&MELEE[it.cls]&&beltOf()?B('beq:'+it.id,'요대에 차기'):''}${sell?B('sell:'+it.id,`팔기 ${it.price}`):''}${B('drop:'+it.id,'버리기')}</div></div>`}
function pAlly(){
  const pets=allies.filter(a=>a.kind==='pet').map(a=>`<div class="it"><div><b>${esc(a.name)}</b> <small class="dim">${a.k} · ${a.age}/${a.life}살</small><span>생명 ${Math.ceil(a.hp)}/${Math.round(a.maxHp)} · 공격 ${a.atk} · ${a.mode==='wait'?'기다리는 중 (빠르게 회복)':'따라오는 중'}${P.ride===a?' · 타는 중':''}</span></div>
    <div class="ib">${B('pmode:'+allies.indexOf(a),a.mode==='wait'?'따라와':'기다려')}${B('feed:'+allies.indexOf(a),'먹이 · 고기',{d:!(P.mats.고기>0)})}${B('rename:'+allies.indexOf(a),'이름')}${a.d.ride?B('ride','타기/내리기'):''}${B('free:'+allies.indexOf(a),'풀어주기')}</div></div>`).join('')||'<p class="note">길들인 짐승이 없습니다. 짐승을 오른쪽 클릭하거나 선택하고 F를 누르면 활력을 써서 길들인다. 성공률은 내공(갑자)에 달려 있다. 토끼와 양은 길들일 수 없다.</p>';
  const dis=allies.filter(a=>a.kind==='disciple').map(a=>`<div class="it"><div><b>${esc(a.name)}</b> <small class="dim">제자 ${a.lv}단계</small><span>생명 ${Math.ceil(a.hp)}/${a.maxHp} · 공격 ${a.atk}</span></div><div class="ib">${B('pmode:'+allies.indexOf(a),a.mode==='wait'?'따라와':'기다려')}</div></div>`).join('');
  return `<div class="card"><h4>길들인 짐승 <small class="dim">${allies.filter(a=>a.kind==='pet').length}/5</small></h4><div class="list">${pets}</div></div>
    <div class="card"><h4>제자 <small class="dim">${P.sect==='own'?esc(P.sectName):'문파를 세우면 받을 수 있다'}</small></h4><div class="list">${dis||'<p class="note">제자가 없습니다.</p>'}</div></div>
    <div class="card"><h4>가족</h4><p>${P.spouse?`배우자 <b class="gold">${esc(P.spouse.name)}</b> · 가족 유대로 활력 +10%${G.house&&G.house.built?' · 집에서 기다린다':''}`:'혼인하지 않았다. 매파 할멈을 찾아가라.'}</p>
      <p>${P.children.length?'자식 '+P.children.map(c=>`${esc(c.name)} (${c.age}세)`).join(', ')+' · 죽은 뒤 자식으로 이어 살면 집과 창고, 은자 절반을 물려받는다.':'자식이 없다.'}</p>
      <p>문파 ${P.sect==='own'?esc(P.sectName)+' (문주)':P.sect?esc(sectName())+' '+(rankName()||'제자'):'없음'}</p></div>`;
}
function pLife(){
  const jobs=Object.entries(JOBS).map(([k,j])=>{const s=P.jobs[k],rs=RECIPES.filter(r=>r.job===k);
    return `<div class="card"><div class="row2"><h4>${j.n}</h4><span class="tag">${s.on?`수련도 ${Math.floor(s.lv)}`:'기술서 필요'}</span></div>
      ${s.on?`<div class="list">${rs.map(r=>`<div class="it"><div>${r.n}<span>${Object.entries(r.need).map(([m,n])=>`${m} ${P.mats[m]||0}/${n}`).join(' · ')}${r.min?` · 수련도 ${r.min}`:''}${r.at?' · 대장간·집':''}</span></div><div class="ib">${B('craft:'+RECIPES.indexOf(r),'만들기',{d:!hasMats(r.need)||(r.min&&s.lv<r.min)})}</div></div>`).join('')}</div>`
        :`<p>${k==='대장'?'대장장이':k==='직물'?'포목점':k==='요리'?'객잔 주인':'약방 의원'}에게서 기술서를 살 수 있다. 직업 선택에 제약이 없다.</p>`}</div>`}).join('');
  const crops=Object.entries(CROPS).map(([k,c])=>`${k}: ${c.d}`).join(' · ');
  return `<p class="note">수련도가 높을수록 같은 물건도 품질(하품·중품·상품·명품)과 공격력·판매가가 오른다. 만들 때마다 수련도와 활력이 조금 오른다.</p>${jobs}
    <div class="card"><h4>농사 <small class="dim">${season()} · ${G.weather}</small></h4><p>서쪽 농지의 밭에서 F(또는 클릭)로 씨를 심고 거둔다. 날씨가 자람에 영향을 준다. ${crops}. 겨울 눈에는 보리 말고는 얼어 죽는다.</p>
      <p>채집: 약초·광석·목재는 들과 숲, 동굴 근처에서, 황하 잉어는 나루 남쪽 물가에서. 잉어는 개봉 특산 요리 재료다.</p></div>`;
}
function pHist(){
  const h=G.history.slice().reverse();
  return (h.length?h.map(e=>`<div class="card"><div class="row2"><h4>제${e.life}생 ${esc(e.name)}</h4><span class="tag">${e.status} · ${e.side==='정'?'정파':'사파'} · ${e.gg}</span></div>
    <p>${e.age}세에 ${e.cause==='천수'?'천수를 누리고 눈을 감았다':e.cause==='좌화'?`${e.realm}에 이르러 스스로 좌화했다`:e.cause==='독'?'독에 쓰러졌다':'싸움에서 쓰러졌다'}. 경지 ${e.realm} · 명성 ${e.fame} · 선업 ${e.good} · 악업 ${e.evil} · 처치 ${e.kills}</p>
    ${e.arts.length?`<p>무공: ${e.arts.map(esc).join(', ')}</p>`:''}${e.sect?`<p>문파: ${esc(e.sect)}</p>`:''}${e.spouse?`<p>배우자 ${esc(e.spouse)}${e.children.length?' · 자식 '+e.children.map(esc).join(', '):''}</p>`:''}
    ${e.feats.length?`<p>${e.feats.map(esc).join(' · ')}</p>`:''}</div>`).join(''):'<p class="note">아직 기록된 생이 없습니다. 한 생이 끝나면 이곳에 강호의 역사로 남는다.</p>');
}
function pHelp(){
  if(TOUCH)return `<div class="help"><p><b>이동</b> 화면 왼쪽 아래를 누른 채 끌면 그쪽으로 걷는다. 사람·적·채집물·땅을 톡 치면 그리로 간다.</p>
  <p><b>공격</b> 가장 가까운 적과 싸운다. 익힌 초식을 차례로 이어 연속기가 된다. 누르고 있으면 다음 적으로 계속 넘어간다.</p>
  <p><b>필살</b> 무공의 초식을 모두 익히면 열린다. <b>경공</b> 바라보는 쪽으로 도약해 강과 지붕도 넘는다.</p>
  <p><b>비기</b> 특수무공(암기·독공·점혈)이나 절세신공을 익히면 나타나고, 지금 쓸 수 있는 것을 알아서 고른다.</p>
  <p><b>약</b> 생명과 내공 중 더 모자란 쪽을 채운다.</p>
  <p><b>상황 버튼</b> 공격 위의 버튼은 가까이 있는 것에 따라 대화·채집·농사·집·길들이기·말·운기로 바뀐다.</p>
  <p><b>☰ 메뉴</b> 인물·무공·행낭·동료·생활·임무·강호사·천하 지도·수련 창. 질주·강제공격·운기·승마는 오른쪽 가장자리의 네모 단추, 금창약·소환단·비도는 퀵슬롯 줄. 창이 열려 있는 동안 시간이 멈춘다.</p>
  <p><b>나이</b> 실제 30분(낮밤 열두 바퀴)이 1년, 낮밤 한 바퀴가 한 달. 늙거나 싸움에서 쓰러지면 생이 끝나고 업보에 따라 다시 태어난다.</p></div>
  <div class="center">${B('ctl:k','PC 조작으로 바꾸기')}</div>`;
  return `<div class="help"><p><b>이동</b> 땅 클릭 또는 방향키. 적 클릭은 공격, 사람·밭·채집물 클릭은 다가가서 행동.</p>
  <p><b>초식</b> 키패드 7·4·1·9·6·3 또는 Q·A·Z·E·D·C (키패드 배치를 왼손에 옮긴 것). <b>필살기</b> 키패드 5 또는 S.</p>
  <p><b>자동/수동초식</b> Tab. 자동은 클릭한 적에게 초식을 차례로 잇는다.</p>
  <p><b>경공</b> Space 도약(강·지붕·성벽도 넘는다), R 질주(내공 소모).</p>
  <p><b>수련</b> U. 기본기·내공·폐관수련 창을 화면 아래에 연다.</p>
  <p><b>강제공격</b> T (HUD '강제' 단추). 켜면 같은 편과 양민도 공격 대상이 되고, 치면 배신이 되어 악업이 쌓인다.</p>
  <p><b>맵 이동</b> 출입구나 맵 가장자리에 1초 머물면 넘어간다. 지나가거나 경공으로 날면 넘어가지 않는다.</p>
  <p><b>특수무공</b> 1 암기 · 2 독공 · 3 점혈. <b>절세신공</b> V.</p>
  <p><b>소모품</b> 4 금창약 · 5 소환단. <b>운기조식</b> X.</p>
  <p><b>행동</b> F: 가까운 사람과 대화, 채집, 밭, 집. 짐승을 오른쪽 클릭하면 길들이기. M 말 타기.</p>
  <p><b>창</b> K 인물 · B 무공 · I 행낭 · P 동료 · L 생활 · H 강호사 · J 임무(왼쪽 '맡은 임무' 글을 눌러도 된다). 창이 열려 있는 동안 시간이 멈춘다.</p>
  <p><b>나이</b> 실제 30분(낮밤 열두 바퀴)이 1년, 낮밤 한 바퀴가 한 달. 8세에 태어나 늙으면 죽고, 업보에 따라 다시 태어난다. 20세부터 강호의 사건이 잇따르고 26세에 천하대전이 터진다(정세 창 N). 싸움에서 쓰러져도 생이 끝난다. 비무는 목숨을 걸지 않는다.</p>
  <p><b>양민</b>은 Shift+클릭으로만 공격한다. 해치면 악업이 쌓인다.</p>
  <p><b>표국·상단 행렬</b>이 성 지도의 길을 오간다. 습격당한 행렬을 거들면 사례와 일감을 받고, 강제공격(T)이나 Shift+클릭으로 직접 털 수도 있다(악업·관아 수배). 성읍 역참 옆 표국 국주에게 말을 걸면 출발을 앞둔 표행이 사람을 모은다. 가입할 필요 없이 한 번씩 따라나서 길목에 닿으면 품삯을 받는다.</p></div>
  <div class="center">${B('ctl:t','터치 조작으로 바꾸기')}</div>`;
}
// ================= NPC dialogs =================
const TIPS=GD.TIPS;
function openNpc(n){shopMode=null;sectView=null;if(n.board&&(!G.board||!G.board.length))G.board=[0,1,2].map(()=>({...pick(QUESTS)}));openPanel('npc',n)}
function shopRow(label,desc,price,act,d){return `<div class="it"><div>${label}<span>${desc}</span></div><div class="ib">${B(act,`사기 · 은자 ${price}`,{d:d||P.silver<price})}</div></div>`}
const SHOP=GD.SHOP;
function shopList(id){
  return SHOP[id].map(([k,t,p0,mr],i)=>{const p=worldPrice(p0);   // v153: 천하통일 세상의 물가 (g_story5.js). mr = 살 수 있는 최소 경지
    if(mr!=null&&realmIdx()<mr)return shopRow(k,`${CONSUME[k]?CONSUME[k].d+' · ':''}${rk(mr)} 이상`,p,`buy:${id}:${i}`,true);
    // mat10: 암기 한 묶음 (v191부터 PACK=100개, 값은 그대로)
    if(t==='mat'||t==='mat10'){const nm=t==='mat10'?`${k} ${PACK}${AMMO[k]?AMMO[k].unit:'자루'}`:k;return shopRow(nm,AMMO[k]?`요대 암기 · ${AMMO[k].d}`:CONSUME[k]?CONSUME[k].d:k.endsWith('씨')?`${Object.keys(CROPS).find(c=>CROPS[c].seed===k)} 씨앗`:'',p,`buy:${id}:${i}`)}
    if(t==='weapon'){const c=k.split(':')[1];return shopRow(`${WNAME[c]} <small class="dim">${CLASS[c].n}</small>`,`중품 · ${CLASS[c].d}${c==='암'?` · 암기 ${GD.BELT_CAP[0]}칸`:''}`,p,`buy:${id}:${i}`)}
    if(t==='gear')return shopRow(k==='armor'?'무명 무복':'짚신',k==='armor'?'생명 +24':'이동 +0.12',p,`buy:${id}:${i}`);
    if(t==='tbook'){const j=k.split(':')[1];return shopRow(`기술서 · ${JOBS[j].n}`,P.jobs[j].on?'이미 익혔다':'읽으면 생활 기술을 익힌다',p,`buy:${id}:${i}`,P.jobs[j].on)}
    if(t==='bbook'){bobInit();const bid=k.split(':')[1],b=BOBS[bid],has=!!P.bob[bid];return shopRow(`보법 비급 · ${b.n} <small class="dim">${BGRADE[b.g]} · ${b.t==='line'?'직선':'간파'}</small>`,has?'이미 익혔다':b.d,p,`buy:${id}:${i}`,has)}
    if(t==='gbook'){ggInit();const gid=k.split(':')[1],g=GGS[gid],has=!!P.gk[gid];return shopRow(`경공 비급 · ${g.n} <small class="dim">${BGRADE[g.g]} · ${GG_MAX[g.g]}단까지</small>`,has?'이미 익혔다':g.d+(g.tr&&g.tr.length?' · '+ggTraitTxt(g):''),p,`buy:${id}:${i}`,has)}
    if(t==='pbook'){const q=PAS[k.split(':')[1]],has=P.pas&&P.pas[q.id];return shopRow(`패시브 비급 · ${q.n} <small class="dim">${PTYPE[q.type].n}</small>`,has?'이미 익혔다':`${PTYPE[q.type].f(pasVal(q,0))}~${PTYPE[q.type].f(pasVal(q,100)).replace(/^[^+-]*/,'')} · ${q.d}`,p,`buy:${id}:${i}`,has)}
    if(t==='sbook'){const s=k.split(':')[1],pp=s==='독공'&&P.side==='사'?worldPrice(60):p;return shopRow(`특수무공 비급 · ${s}`,{암기:'비도를 던진다',독공:'독 기운으로 5초간 중독 (사파 1.5배)',점혈:'붙어서 혈을 짚어 3초간 묶는다'}[s]+(P.sp[s]?' · 익힘':''),pp,`buy:${id}:${i}`,!!P.sp[s])}
  }).join('');
}
function buy(id,i){
  const[k,t,p1,mr]=SHOP[id][i];if(mr!=null&&realmIdx()<mr)return;const p0=worldPrice(p1),p=t==='sbook'&&k.endsWith('독공')&&P.side==='사'?worldPrice(60):p0;if(P.silver<p)return;
  if((t==='weapon'||t==='gear'||t==='tbook'||t==='sbook'||t==='pbook'||t==='bbook'||t==='gbook')&&P.bag.length>=24){log('행낭이 가득 찼습니다.','info');return}
  P.silver-=p;
  if(t==='mat')addMat(k);else if(t==='mat10')addMat(k,PACK);else if(t==='weapon')P.bag.push(mkWeapon(k.split(':')[1],1,0));
  else if(t==='gear')P.bag.push(k==='armor'?mkGear('armor','무명 무복',1,{hp:24,def:2}):mkGear('boots','짚신',1,{spd:.12,hm:3}));
  else if(t==='tbook')P.bag.push(mkTBook(k.split(':')[1]));else if(t==='pbook')P.bag.push(mkPBook(k.split(':')[1]));else if(t==='bbook')P.bag.push(mkBBook(k.split(':')[1]));else if(t==='gbook')P.bag.push(mkGBook(k.split(':')[1]));else P.bag.push(mkSBook(k.split(':')[1]));
  log(`샀습니다. (은자 -${p})`,'sys');renderOpen();
}
function pNpc(n){const c={n,html:null};runHooks('npcDlg',c);return c.html??pNpcBase(n)}
function pNpcBase(n){
  if(n.hq)return hqDlg(n);if(n.id==='post')return postDlg();
  const sellB=B('sellmode','물건 팔기 (행낭)');
  if(n.id==='bank')return `<p class="note">"맡긴 물건은 목숨 걸고 지키겠소. 자식 대까지도 말이오."</p><p class="note">집에 있는 창고와 같은 창고다. 자식으로 윤회하면 그대로 이어진다.</p>${storageHtml()}`;
  if(n.id==='inn')return `<p class="note">"어서 오시오. 묵어 가시려오?"</p><div class="row2"><span class="note">하룻밤 묵으면 생명과 내공이 모두 차고 기록된다.</span>${B('sleep','묵기 · 은자 10',{pri:1,d:P.silver<10})}</div>
    <div class="list">${shopList('inn')}</div><div class="row2">${B('rumor','소문 듣기')}${sellB}</div>`;
  if(n.id==='smith'){const w=P.eq.weapon,rc=w?Math.ceil((w.maxDur-w.dur)*.6):0;
    return `<p class="note">"쇠는 두드릴수록 단단해지는 법이오."</p>${w?`<div class="row2"><span class="note">${esc(itemLabel(w))} 내구 ${w.dur}/${w.maxDur}</span>${B('repair',`수리 · 은자 ${rc}`,{d:!rc||P.silver<rc})}</div>`:''}<div class="list">${shopList('smith')}</div>${sellB}`}
  if(n.id==='pharm')return `<p class="note">"약초를 캐 오면 값을 쳐 주겠소."</p><div class="list">${shopList('pharm')}</div>${sellB}`;
  if(n.id==='cloth')return `<p class="note">"좋은 옷은 칼날도 비껴가게 하지."</p><div class="list">${shopList('cloth')}</div>${sellB}`;
  if(n.id==='gen')return `<p class="note">"씨앗부터 비급까지, 없는 것 빼고 다 있소."</p><div class="list">${shopList('gen')}</div>${sellB}`;
  if(n.id==='jeong'||n.id==='sa'||n.id==='magyo'||n.id==='gunbu')return allianceDlg(n.id==='jeong'?'jeong':n.id==='sa'?'sacheon':n.id==='gunbu'?'gunbu':'magyo');
  if(n.id==='mae'){
    if(P.spouse)return `<p class="note">"${esc(P.spouse.name)}와(과) 금슬이 좋다고 소문이 자자하오. 자식 복도 있기를."</p>`;
    const ok=P.age>=18&&P.silver>=200&&P.fame>=20;
    return `<p class="note">"짝을 찾으시오? 열여덟이 넘고, 은자 200에, 이름이 조금은 알려져야(명성 20) 좋은 집안과 맺어 줄 수 있소."</p>
      <p class="note">혼인하면 가족 유대로 활력을 10% 더 얻고, 해마다 자식이 생길 수 있다. 자식은 다음 생으로 이어 살 몸이 된다.</p>
      <div class="row2"><span class="note">${P.age<18?'아직 어리다':''}</span>${B('marry','혼례 올리기 · 은자 200',{pri:1,d:!ok})}</div>`}
  if(n.id==='board'){
    const act=P.quests.map((q,i)=>`<div class="it"><div>${q.n}<span>${q.kind==='give'?`${q.mat} ${P.mats[q.mat]||0}/${q.cnt} 납품`:`${qGoal(q).w} ${qGoal(q).v} ${q.have||0}/${q.cnt}${q.fail?' · 실패':''}`} · 은자 ${q.silver} · 활력 ${q.vit} · 명성 ${q.fame}</span></div><div class="ib">${B('qdone:'+i,'보상 받기',{pri:1,d:!questProg(q).done||!!(q.pyo||q.cvLive)})}${B('qdrop:'+i,'포기')}</div></div>`).join('');
    const av=G.board.map((q,i)=>`<div class="it"><div>${q.n}<span>${q.kind==='give'?`${q.mat} ${q.cnt}개`:`${qGoal(q).w} ${qGoal(q).v} ${q.cnt}`} · 은자 ${q.silver} · 활력 ${q.vit} · 명성 ${q.fame} · 선업 ${q.good}</span></div><div class="ib">${B('qtake:'+i,'맡기',{d:P.quests.length>=3})}</div></div>`).join('');
    return `<p class="note">개봉 관아와 상인들이 붙인 방. 한 번에 셋까지 맡을 수 있다. 해가 바뀌면 새 방이 붙는다.</p><div class="row2"><h4 style="margin:0">맡은 의뢰</h4>${B('open:quest','임무창 · 상세')}</div><div class="list">${act||'<p class="note">없음</p>'}</div><h4 style="margin:0">붙은 방</h4><div class="list">${av||'<p class="note">새 방이 붙기를 기다리시오.</p>'}</div>`}
  if(n.id==='arena'){const o=DUELISTS[P.duel];
    return `<p class="note">"비무는 실력을 겨루는 자리. 목숨은 걸지 않소. 비무대 밖으로 나가면 지는 것이오."</p>${o?`<div class="card"><h4>${o.n} <small class="gold">${o.realm!=null?RANKS[o.realm]:''}</small></h4><p>${CLASS[o.cls].n} · 내공 ${o.el}속성 · 생명 ${o.hp} · 이기면 명성 +${o.fame}, 은자 +${o.silver}</p></div>${B('duel','비무 신청',{pri:1})}`:'<p class="note">개봉의 비무대에는 더 이상 당신의 상대가 없소. 천하제일이라 불러도 되겠구려.</p>'}
      <p class="note">${P.duel}/${DUELISTS.length} 꺾음</p>`}
  if(n.id==='land'){const h=G.house;
    if(!h)return `<p class="note">"서쪽 농지 아래에 집터 두 곳이 남았소. 집이 있으면 쉬고, 창고에 물건을 맡기고, 자식에게 물려줄 수 있지."</p><div class="row2">${B('lot:0','동쪽 집터 · 은자 300',{d:P.silver<300})}${B('lot:1','서쪽 집터 · 은자 300',{d:P.silver<300})}</div>`;
    if(!h.built)return `<p class="note">집을 지으려면 목재 10, 광석 6, 은자 150이 드오.</p><p class="note">가진 것: 목재 ${P.mats.목재||0} · 광석 ${P.mats.광석||0} · 은자 ${P.silver}</p>${B('build','집 짓기',{pri:1,d:(P.mats.목재||0)<10||(P.mats.광석||0)<6||P.silver<150})}`;
    return `<p class="note">"좋은 집을 지으셨구려."</p>`}
  return '';
}
const STORE_MAX=60;
// 창고: 마을 창고지기와 내 집에서 같은 창고를 쓴다. 자식으로 윤회하면 그대로 이어진다.
function storageHtml(){
  const st=G.storage,items=st.bag.map((it,i)=>`<div class="it"><div style="color:${itemCol(it)}">${esc(itemLabel(it))}<span>${itemDesc(it)}</span></div><div class="ib">${B('take:'+i,'꺼내기',{d:P.bag.length>=24})}</div></div>`).join('');
  const mats=Object.entries(st.mats).filter(([k,n])=>n>0).map(([k,n])=>`${k} ${n}`).join(' · ')||'없음';
  return `<div class="card"><div class="row2"><h4>창고 재료</h4><span>${B('putm','재료 모두 맡기기')} ${B('takem','재료 모두 꺼내기')}</span></div><p>${mats}</p></div>
    <div class="card"><h4>창고 물건 <small class="dim">${st.bag.length}/${STORE_MAX}</small></h4><div class="list">${items||'<p class="note">비어 있음</p>'}</div></div>
    <div class="card"><h4>행낭에서 맡기기</h4><div class="list">${P.bag.map(it=>`<div class="it"><div style="color:${itemCol(it)}">${esc(itemLabel(it))}</div><div class="ib">${B('put:'+it.id,'맡기기',{d:st.bag.length>=STORE_MAX})}</div></div>`).join('')||'<p class="note">행낭이 비어 있음</p>'}</div></div>`;
}
function pHouse(){
  return `<div class="row2"><span class="note">집에서 쉬면 생명과 내공이 차고 기록된다. 창고는 자식에게 이어진다.</span>${B('rest','쉬기',{pri:1})}</div>${storageHtml()}`;
}
function openHouse(){openPanel('house')}
// one click handler for every window button
// 창을 연 손가락 탭의 click이 막 열린 창의 버튼을 누르지 않게 (터치 버튼은 pointerdown에 창을 연다). 창 안에서 눌러 시작한 탭과 키보드는 그대로
let wDown=0;$('wbody').addEventListener('pointerdown',()=>{wDown=performance.now()});
$('wbody').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled||(e.detail&&wDown<panelAt))return;act(b.dataset.act)});
function act(s){
  const[a,x,y]=s.split(':'),n=+x;
  if(sectAct(a,x,y)){renderOpen();return}
  switch(a){
    case'stat':trainStat(x);break;case'qi':trainQi();return;
    case'setart':if(!hasWeaponFor(ARTS[x].cls))log(wpnNeed(ARTS[x].cls),'info');setArt(x);break;
    case'mode':toggleMode();break;
    case'forget':forgetAsk=forgetAsk===x?null:x;renderOpen();{const q=$('forgetask');if(q&&q.scrollIntoView)q.scrollIntoView({block:'nearest'})}return;
    case'forgetno':forgetAsk=null;break;
    case'forgetok':forgetAsk=null;forgetArt(x);break;
    case'trainwin':openTrain();return;
    case'jwa':jwaAsk(x);break;case'jwa2':jwahwa();return;   // 좌화 (g_beyond.js)
    case'open':openPanel(x);return;
    case'wsel':wSel=x;break;
    case'bsel':bobInit();if(P.bob[x])P.bcur=x;break;
    case'gsel':ggInit();if(P.gk[x])P.gkcur=x;break;
    case'simsel':simSwitch(x);break;
    case'snd':sndToggle(x);break;
    case'medit':closePanels();meditate();return;
    case'run':closePanels();toggleRun();return;
    case'save':closePanels();saveGame();return;
    case'totitle':toTitle();return;
    case'quit':quitAsk=!quitAsk;renderOpen();{const q=$('quitask');if(q&&q.scrollIntoView)q.scrollIntoView({block:'nearest'})}return;
    case'quitno':quitAsk=false;break;
    case'quitapp':quitApp();return;
    case'ctl':closePanels();setTouch(x==='t');return;
    case'uneq':if(P.bag.length<24){P.bag.push(P.eq[x]);P.eq[x]=null;recalc()}break;
    case'eq':{const it=P.bag.find(i=>i.id===n);if(it){P.bag.splice(P.bag.indexOf(it),1);if(P.eq[it.slot])P.bag.push(P.eq[it.slot]);P.eq[it.slot]=it;recalc();log(`${itemLabel(it)}을(를) 장착했습니다.`,'sys')}break}
    case'read':{const it=P.bag.find(i=>i.id===n);if(it)readBook(it);break}
    case'drop':{const i=P.bag.findIndex(i=>i.id===n);if(i>=0)P.bag.splice(i,1);break}
    case'sell':{const i=P.bag.findIndex(i=>i.id===n);if(i>=0){P.silver+=P.bag[i].price;log(`${P.bag[i].name}을(를) 은자 ${P.bag[i].price}에 팔았습니다.`,'sys');P.bag.splice(i,1)}break}
    case'sellm':{const k=x,c=P.mats[k]||0,p=Math.max(1,Math.round(MAT_PRICE[k]*.6))*c;P.silver+=p;P.mats[k]=0;log(`${k} ${c}개를 은자 ${p}에 팔았습니다.`,'sys');break}
    case'con':useCon(x);break;
    case'pmode':allies[n].mode=allies[n].mode==='wait'?'follow':'wait';if(P.ride===allies[n])P.ride=null;break;
    case'feed':if(P.mats.고기>0){P.mats.고기--;allies[n].hp=allies[n].maxHp;log(`${allies[n].name}에게 먹이를 주었습니다.`,'sys')}break;
    case'rename':{const v=prompt('새 이름',allies[n].name);if(v&&v.trim())allies[n].name=v.trim().slice(0,8);break}
    case'free':{const p=allies[n];if(P.ride===p)P.ride=null;allies.splice(n,1);log(`${p.name}을(를) 풀어주었습니다.`,'sys');break}
    case'ride':closePanels();rideToggle();return;
    case'craft':craft(RECIPES[n]);break;
    case'sellmode':shopMode=panelArg.id;openPanel('bag');return;
    case'buy':buy(x,+y);break;
    case'sleep':if(P.silver>=10){P.silver-=10;P.hp=P.maxHp;P.qi=P.maxQi;P.poison=0;saveGame();log('객잔에서 하룻밤 묵었습니다.','sys');closePanels();return}break;
    case'rumor':log(`객잔 주인: "${pick(TIPS)}"`,'info');break;
    case'repair':{const w=P.eq.weapon,c=Math.ceil((w.maxDur-w.dur)*.6);if(P.silver>=c){P.silver-=c;w.dur=w.maxDur;log('무기를 고쳤습니다.','sys')}break}
    case'marry':{const v=prompt('배우자의 이름',pick(['연화','소혜','설아','월향','진운','하령','유경','백란']));if(!v)return;P.silver-=200;P.spouse={name:v.trim().slice(0,8)};
      log(`${P.spouse.name}와(과) 혼례를 올렸습니다.`,'xp');showBanner('혼례',`${P.name} · ${P.spouse.name}`);feat(`${P.spouse.name}와(과) 혼인했다`);break}
    case'qtake':{const q={...G.board[n],have:0},m=worldMul('board');if(m!==1)q.silver=Math.round(q.silver*m);P.quests.push(q)}G.board.splice(n,1);break;
    case'qdrop':P.quests.splice(n,1);break;
    case'qdone':{const q=P.quests[n];if(!q)break;if(q.sect||q.maeng)(P.qdone=P.qdone||{})[q.key]=1;if(q.sect){const v=addMerit(q.sect,q.merit);log(`${SECTS[q.sect].n} 공적 +${v}`,'xp');if(typeof sectGainStanding==='function'&&P.sect===q.sect){const sv=sectGainStanding(q.sect,q.merit);if(sv)log(`${SECTS[q.sect].n}의 맹 입지 +${sv}`,'xp')}}if(q.maeng&&typeof maengReport==='function')maengReport(q);if(q.kind==='give')P.mats[q.mat]-=q.cnt;P.silver+=q.silver;gainVit(q.vit);P.fame+=q.fame;P.good+=q.good;runHooks('questDone',q);P.quests.splice(n,1);log(`의뢰 [${q.n}] 보상: 은자 ${q.silver}, 활력 ${q.vit}, 명성 ${q.fame}`,'xp');break}
    case'duel':duelStart();return;
    case'lot':P.silver-=300;G.house={lot:n,built:false};log('집터를 샀습니다. 목재와 광석을 모아 토지 관리인에게 오세요.','sys');break;
    case'build':P.mats.목재-=10;P.mats.광석-=6;P.silver-=150;G.house.built=true;buildHouse();log('집을 지었습니다.','xp');feat(`집을 지었다`);break;
    case'teach':{const a2=art(),s2=A(a2.id),fi=a2.forms.findIndex((f,i)=>!s2.f[i]&&s2.p>=f.req);if(fi>=0){s2.f[fi]=true;P.taught=Math.floor(realAge());log(`사부에게서 [${a2.forms[fi].n}]을(를) 전수받았습니다.`,'xp');if(allLearned(a2.id))log(`필살기 [${a2.ult.n}]을(를) 쓸 수 있습니다.`,'xp')}break}
    case'sbuy':{const fi=+y,price=40*(fi+1);if(P.silver>=price){P.silver-=price;P.bag.push(mkBook(x,fi));log('비급을 샀습니다. 행낭에서 읽으세요.','sys')}break}
    case'found':{const v=prompt('문파의 이름',P.name[0]+'가장');if(!v)return;P.sect='own';P.sectName=v.trim().slice(0,10);log(`${P.sectName}을(를) 세웠습니다. 이제 제자를 받을 수 있습니다.`,'xp');showBanner('개파',P.sectName);P.fame+=20;feat(`${P.sectName}을(를) 세웠다`);break}
    case'disciple':{P.silver-=50;const nm=pick(['소운','청하','무진','백결','한솔','도현','진우','설화','유린']);const d=mkAlly('disciple',nm,P.x+.6,P.y+.4);allies.push(d);log(`${nm}을(를) 제자로 받았습니다.`,'xp');break}
    case'rest':P.hp=P.maxHp;P.qi=P.maxQi;P.poison=0;saveGame();log('집에서 쉬었습니다.','sys');if(P.spouse)familyTalk();closePanels();return;
    case'putm':for(const[k,v]of Object.entries(P.mats))if(v>0&&!CONSUME[k]&&k!=='비도'){G.storage.mats[k]=(G.storage.mats[k]||0)+v;P.mats[k]=0}break;
    case'takem':for(const[k,v]of Object.entries(G.storage.mats)){addMat(k,v);G.storage.mats[k]=0}break;
    case'put':{const i=P.bag.findIndex(i=>i.id===n);if(i>=0&&G.storage.bag.length<STORE_MAX)G.storage.bag.push(P.bag.splice(i,1)[0]);break}
    case'take':if(P.bag.length<24&&G.storage.bag[n])P.bag.push(G.storage.bag.splice(n,1)[0]);break;
  }
  renderOpen();
}
function toggleMode(){P.mode=P.mode==='auto'?'manual':'auto';log(P.mode==='auto'?'자동초식: 클릭한 적에게 익힌 초식을 차례로 잇습니다.':'수동초식: 클릭은 평타만, 초식은 키로 냅니다.','info')}
$('wx').addEventListener('click',closePanels);
// v129 (사용자): HUD 왼쪽 위 정보창을 누르면 인물 창
$('pstat').addEventListener('click',()=>{if(playing&&P)openPanel('char')});$('pstat').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&playing&&P){e.preventDefault();openPanel('char')}});
logEl.addEventListener('click',()=>{if(playing)openPanel('logs')});const sysEl=document.querySelector('.sysmsg');if(sysEl)sysEl.addEventListener('click',()=>{if(playing)openPanel('logs')});
$('modeb').addEventListener('click',()=>{if(P)toggleMode()});
$('runb').addEventListener('click',()=>{if(P)toggleRun()});
$('forceb').addEventListener('click',()=>{if(P)toggleForce()});
$('saveb').addEventListener('click',()=>{if(P&&playing)saveGame()});
$('helpb').addEventListener('click',()=>{if(playing)openPanel('help');else{}});
function toggleRun(){P.run=!P.run;if(P.run&&P.qi<5){P.run=false;log('내공이 부족합니다.','info')}}

// ================= 마교 심화 (2026-10-15 v106): 정혈과 마교 영약, 교율 위반의 죄값, 흑혈옥 =================
// 사용자 결정: 기획서 docs/마교_심화_기획.md §3(흑혈옥)·§4(마교 영약) 대로 (v106). 상수 data/simbeop.json MAGYO2, 영약 설명 data/economy.json CONSUME.
// - 정혈: 마공 운용 중 정·사 무인을 죽이면 가끔 떨어진다 (양민·짐승은 안 나온다). 마교 영약의 재료.
// - 영약 세 가지, 모두 마공 운용 중에만 삭인다: 혈마단(혈마당, 공적+정혈: 60초 공격 +30%, 뒤에 30초 공격·이동 -20%, 마성 +25),
//   흡정환(암혈당, 공적: 정혈 1을 삼켜 내공 수련 5회분, 마성 +15, 악업 +10), 천마혈정(교주, 장로 이상·공적 100·한 생에 한 번: 치명타를 한 번 버티고 생명 40%, 5초 폭주, 마성 +40).
//   같은 영약을 한 생에 3번 넘게 먹으면 중독: 효과가 끝날 때마다 갈증(운기조식 회복 -50%)이 다음 복용까지. 탈마에 이르면 풀린다. 탈마 뒤엔 영약의 마성이 오르지 않는다(maraAdd).
// - 죄값 P.sin (마교도만): 같은 편 마교도 살해 +10 (폭주 중 포함), 추살조에게서 달아남 +5, 연행조를 물리침 +10, 배교 뒤 재입교 +30. 해마다 -5.
//   30에 닿으면 마교 땅에 들어설 때 연행되어 흑혈옥에 갇히고, 마교 밖이면 해마다 연행조가 덮쳐 제압당하면 갇힌다.
// - 흑혈옥(hq_cheonma_9, 천마동 아래): 죄값 10당 1년 형기. 옥 안에서는 운기조식(마성 감소 두 배)·수련만. 출구는 옥주가 막는다. '복역'으로 세월을 바로 보내거나,
//   옥주를 쳐 탈옥하면 배교: 하산, 죄값 50, 마교 연행조가 해마다 덮친다. 만기면 죄값 0, 직위 한 단계 강등. 사면은 교주가 된 뒤(v107).
const MAGYO2=GD.MAGYO2||{blood:{rate:.35},addictN:3,elixir:{혈마단:{dur:60,atk:.3,mara:25,weak:30,weakV:.2,merit:15,blood:3},흡정환:{n:5,mara:15,evil:10,merit:10},천마혈정:{mara:40,hp:.4,burst:5,merit:100}},jail:{cap:30,perYear:10,pardon:5,ally:10,flee:5,resist:10,rejoin:30,escape:50,squad:4}};
const EL2=MAGYO2.elixir,J2=MAGYO2.jail,JAIL_ID='hq_cheonma_9';

// ---- 정혈 ----
hook('kill',e=>{if(!isMa()||!e||!e.d||!e.d.fac||e.d.villager||e.duel||e.ghost)return;if(Math.random()<MAGYO2.blood.rate)drops.push({x:e.x,y:e.y,it:{mat:'정혈',n:1},t:0})});

// ---- 영약 ----
const elixirName=k=>`${k} <small class="dim">${CONSUME[k]?CONSUME[k].d:''}</small>`;
function elixirWhy(k){const E=EL2[k];if(!E)return'없는 영약';if(P.sect!=='cheonma')return'마교도만';
  if(k==='천마혈정'){if(rankIdx('cheonma')<MG_ELDER)return'장로 이상';if(P.chj)return'한 생에 한 번'}
  if((P.merit.cheonma||0)<E.merit)return`공적 ${E.merit} 필요`;if(E.blood&&(P.mats.정혈||0)<E.blood)return`정혈 ${E.blood} 필요`;return''}
function elixirRow(k){const E=EL2[k],no=elixirWhy(k);return `<div class="it"><div>${elixirName(k)}<span>공적 ${E.merit}${E.blood?` + 정혈 ${E.blood}`:''} · 마성 +${E.mara}${k==='천마혈정'?' · 장로 이상, 한 생에 한 번':''} · 가진 것 ${P.mats[k]||0}</span></div><div class="ib">${B('elixir:'+k,no||'받기',{d:!!no,pri:!no})}</div></div>`}
function elixirGet(k){const no=elixirWhy(k);if(no)return false;const E=EL2[k];P.merit.cheonma-=E.merit;if(E.blood)P.mats.정혈-=E.blood;addMat(k);log(`${k}을(를) 받았습니다. 마공을 운용하는 동안만 삭일 수 있고, 먹으면 마성이 ${E.mara} 오릅니다.`,'xp');return true}
hook('npcDlg',c=>{if(!c.n.dang||c.html==null||P.sect!=='cheonma')return;const k=c.n.dang==='hyeolma'?'혈마단':c.n.dang==='amhyeol'?'흡정환':null;if(!k)return;
  c.html+=`<div class="card"><h4>${MDANG[c.n.dang].n}의 영약 <small class="dim">빠른 길의 유혹</small></h4><div class="list">${elixirRow(k)}</div><p class="note">정혈은 마공을 운용하며 정·사 무인을 죽이면 떨어진다. 같은 영약을 한 생에 ${MAGYO2.addictN}번 넘게 먹으면 중독된다.</p></div>`});
hook('hqDlg',c=>{if(c.n.hq!=='cheonma'||P.sect!=='cheonma')return;c.html+=`<div class="card"><h4>천마혈정 <small class="dim">교주가 내리는 피의 결정</small></h4><div class="list">${elixirRow('천마혈정')}</div></div>`});
hook('sectAct',c=>{if(c.a!=='elixir')return;c.done=true;c.r=true;elixirGet(c.x)});
// 먹기
hook('useCon',c=>{const k=c.k,E=EL2[k];if(!E)return;c.done=true;
  if(!(P.mats[k]>0)){log(`${k}이(가) 없습니다.`,'info');return}if(P.hp<=0)return;
  if(!isMa()){log(`${k}은(는) 마공을 운용하는 몸만 삭인다. 지금 먹으면 마기가 날뛸 뿐이다.`,'info');return}
  if(k==='천마혈정'){if(P.chj){log('천마혈정은 한 생에 한 번만 몸이 받는다.','info');return}P.chj=1;P.chGuard=1;log('천마혈정을 삼켰습니다. 치명상을 한 번 버티고 피가 끓어 되살아난다.','xp')}
  else if(k==='흡정환'){if(!(P.mats.정혈>0)){log('흡정환은 정혈 한 방울과 함께 삼켜야 한다.','info');return}P.mats.정혈--;for(let i=0;i<E.n;i++){qiAccAdd(qiGain());P.qiN++}P.evil+=E.evil;recalc();log(`정혈을 삼켜 남의 공력을 빨아들였습니다. 내공 수련 ${E.n}회분이 한 번에 쌓이고 악업이 ${E.evil} 쌓입니다.`,'xp')}
  else if(k==='혈마단'){P.buff.atk=E.dur;P.buff.atkV=E.atk;P.hyeolT=E.dur;P.weakT=0;log(`혈마단의 피가 끓어 ${E.dur}초 동안 공격 +${Math.round(E.atk*100)}%. 끝나면 ${E.weak}초 동안 몸이 무거워진다.`,'xp')}
  P.mats[k]--;P.elixirN=P.elixirN||{};P.elixirN[k]=(P.elixirN[k]||0)+1;P.thirst=0;
  if(P.elixirN[k]>MAGYO2.addictN&&k!=='천마혈정'){P.addict=P.addict||{};if(!P.addict[k])log(`${k}에 중독되었습니다. 효험이 끝날 때마다 갈증이 운기조식 회복을 반으로 줄인다. 탈마에 이르면 풀린다.`,'dmg');P.addict[k]=1;if(k==='흡정환')thirst(k)}
  maraAdd(E.mara,k);addText(P.x,P.y,k,'#d8a0ff');fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:.8});showBanner(k,'마교의 영약');renderOpen()});
function thirst(k){if(!(P.addict&&P.addict[k])||isTalma())return;P.thirst=1;log(`${k}의 갈증이 밀려옵니다. 운기조식 회복 -50% (다음 복용까지).`,'dmg')}
hook('tick',dt=>{if(!P||!playing)return;
  if(P.hyeolT>0){P.hyeolT-=dt;if(P.hyeolT<=0){P.hyeolT=0;P.weakT=EL2.혈마단.weak;P.buff.atk=EL2.혈마단.weak;P.buff.atkV=-EL2.혈마단.weakV;log(`혈마단의 기운이 빠져 ${EL2.혈마단.weak}초 동안 공격·이동 -${Math.round(EL2.혈마단.weakV*100)}%.`,'info');thirst('혈마단')}}
  if(P.weakT>0)P.weakT=Math.max(0,P.weakT-dt);
  if(P.jail&&P.medit&&P.mara>0&&typeof maraAdd==='function')maraAdd(-MARA.medit*dt)});   // 옥 안의 운기조식은 마성을 두 배로 내린다
// 천마혈정: 치명타를 한 번 버틴다
hook('hurt',c=>{if(!P.chGuard||G.duel||!(c.dm>=P.hp))return;c.dm=0;P.chGuard=0;P.hp=Math.max(P.hp,Math.round(P.maxHp*EL2.천마혈정.hp));P.inv=Math.max(P.inv||0,.5);
  log('천마혈정의 피가 끓어 죽음의 문턱에서 되살아났습니다! 마기가 날뛴다.','dmg');showBanner('천마혈정','피가 끓는다');if(typeof maraBurst==='function'){maraBurst();if(P.burst)P.burst.t=EL2.천마혈정.burst}});

// ---- 죄값 ----
function sinAdd(v,why){if(P.sect!=='cheonma'&&v>0)return;P.sin=Math.max(0,(P.sin||0)+v);
  if(v>0){log(`교율 위반: ${why}. 죄값 +${v} (${P.sin}/${J2.cap}).`,'dmg');if(P.sin>=J2.cap&&!P.jail)log('죄값이 가득 찼다. 마교 땅에 들어서면 호법들이 연행하고, 밖에 있으면 연행조가 찾아온다.','dmg')}}
const jailDue=()=>!!P&&P.sect==='cheonma'&&!P.jail&&(P.sin||0)>=J2.cap;
hook('kill',e=>{if(P.sect==='cheonma'&&e&&e.sect==='cheonma'&&!e.duel&&!e.arrest&&!e.jailer)sinAdd(J2.ally,'같은 편 마교도 살해');
  if(e&&e.arrest&&!mobs.some(m=>m!==e&&m.arrest&&m.hp>0))sinAdd(J2.resist,'연행조를 물리침');
  if(e&&e.jailer)jailEscape()});
hook('travel',c=>{if(P.sect==='cheonma'&&mobs.some(m=>m.hunt&&m.hp>0&&!m.arrest))sinAdd(J2.flee,'추살조에게서 달아남')});
hook('sectAct',c=>{if(c.a==='sleave'&&P.sect==='cheonma')P.mgLeaving=1});
hook('sectActDone',c=>{if(c.a==='sleave'){if(P.mgLeaving&&!P.sect)P.mgLeft=1;P.mgLeaving=0}
  if(c.a==='sjoin'&&c.x==='cheonma'&&P.sect==='cheonma'&&P.mgLeft){P.mgLeft=0;P.sin=0;sinAdd(J2.rejoin,'배교했다가 다시 돌아옴');setTimeout(()=>{if(playing&&jailDue())jailEnter('"배교자는 옥을 거쳐야 교도다." 호법 둘이 양팔을 잡았다')},900)}});
hook('newYear',()=>{if(!P)return;if(P.sin>0&&!P.jail)P.sin=Math.max(0,P.sin-J2.pardon);
  if(P.jail){P.jail.t-=1;if(P.jail.t<=0)jailRelease();else log(`흑혈옥의 한 해가 지났습니다. 남은 형기 ${P.jail.t}년.`,'info');return}
  if(jailDue()&&!/^hq_cheonma/.test(REG)&&!G.duel)setTimeout(()=>{if(playing&&jailDue())arrestSquad()},2500);
  else if(P.escaped&&!/^hq_cheonma/.test(REG)&&!G.duel&&P.sect!=='cheonma')setTimeout(()=>{if(playing&&P.escaped)arrestSquad(1)},2500)});
hook('regionLoaded',id=>{if(jailDue()&&/^hq_cheonma/.test(id)&&id!==JAIL_ID)setTimeout(()=>{if(playing&&jailDue()&&REG===id)jailEnter('호법 둘이 다가와 양팔을 잡았다')},600)});
// 연행조: 마교 무인 넷. 제압당하면 흑혈옥 (탈옥자에게는 추살조)
function arrestSquad(hunt){if(!P||!REGION()||G.duel)return false;let made=0;const sq=typeof diffSquad==='function'?diffSquad(J2.squad):J2.squad;
  for(let i=0;i<60&&made<sq;i++){const a=Math.random()*Math.PI*2,r=6+Math.random()*3,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;if(!walkAt(x,y))continue;
    const e=mkFac('마',made===sq-1?1:0,x,y,'cheonma');e.angry=1;e.aggro=true;e.tgt=null;if(hunt)e.hunt=1;else e.arrest=1;mobs.push(e);made++}
  if(made){showBanner(hunt?'추살':'연행',hunt?'배교자는 추살한다':'교율을 어긴 자를 잡아간다');log(hunt?`마교의 추살조 ${made}명이 배교자를 쫓아왔습니다!`:`마교 연행조 ${made}명이 덮쳐 옵니다. 제압당하면 흑혈옥이다.`,'dmg')}return made>0}
hook('hurt',c=>{if(P.jail||!c.src||!c.src.arrest||P.sect!=='cheonma')return;if(!(c.dm>=P.hp)&&!P.jailQ)return;c.dm=0;P.hp=Math.max(P.hp,1);
  if(!P.jailQ){P.jailQ=1;setTimeout(()=>{P.jailQ=0;if(playing&&P.hp>0)jailEnter('연행조에게 제압당했다')},60)}});
// 지역을 바로 옮긴다 (출입구 없이)
function regionJump(id,x,y){P.chan=null;P.medit=false;P.burst=null;enterRegion(id,x,y);closePanels()}
function jailEnter(why){if(!P||P.jail)return;const yrs=Math.max(1,Math.ceil((P.sin||0)/J2.perYear));P.jail={t:yrs,sin:P.sin||0};
  regionJump(JAIL_ID,20.5,20.5);showBanner('흑혈옥',`형기 ${yrs}년`);log(`${why}. 천마동 아래 흑혈옥에 갇혔습니다. 형기 ${yrs}년: 해를 넘기거나 옥주에게 복역을 청하면 풀려난다. 옥주를 치고 나가면 배교자다.`,'dmg');
  feat(`교율을 어겨 흑혈옥에 갇혔다`);if(typeof saveGame==='function')saveGame(true)}
function jailRelease(){if(!P.jail)return;P.jail=null;P.sin=0;const i=rankIdx('cheonma');if(i>0){P.mtot=P.mtot||{};P.mtot.cheonma=RANK_PTS[i]-1}
  log(`형기를 다 채워 흑혈옥에서 나왔습니다. 죄값은 지워졌지만 직위는 ${rankName('cheonma')}(으)로 한 단계 내려갔습니다.`,'xp');showBanner('출옥','흑혈옥의 문이 열렸다');
  if(REG===JAIL_ID)regionJump('hq_cheonma_8',20.5,22)}
// 복역: 남은 형기만큼 세월을 바로 보낸다
function jailServe(){if(!P.jail||P.hp<=0)return;P.medit=false;if(!passYears(P.jail.t))return;if(P.jail)jailRelease()}
// 탈옥: 옥주를 쳐야 한다. 이기면 배교
function jailBreak(){if(!P.jail||mobs.some(m=>m.jailer&&m.hp>0))return;const e=mkFac('마',1,20.5,16.5,'cheonma');e.angry=1;e.aggro=true;e.tgt=null;e.jailer=1;e.name='흑혈옥 옥주';e.maxHp=e.hp=Math.round(e.hp*3);e.atk=Math.round(e.atk*1.5);mobs.push(e);P.target=e;
  log('옥주가 칼을 뽑았습니다. "옥문을 나서려면 내 목을 넘어가라."','dmg');showBanner('탈옥','옥주를 쳐라')}
function jailEscape(){if(!P.jail)return;P.jail=null;P.sin=J2.escape;P.escaped=1;const s=SECTS.cheonma;P.sect=null;P.dang=null;P.mgLeft=1;
  log(`옥주를 쓰러뜨리고 흑혈옥을 나왔습니다. 배교자가 되어 ${s.n}에서 하산했고, 마교의 추살조가 해마다 쫓아올 것입니다. 마공은 남습니다.`,'dmg');showBanner('배교','마교의 적이 되었다');feat(`흑혈옥을 탈옥해 마교의 배교자가 되었다`)}
// 흑혈옥 안의 사람들
function jailerDlg(n){if(!P.jail)return `<p class="note">"${P.sect==='cheonma'?rankName('cheonma'):'손님'}, 옥을 둘러보러 왔는가. 여기엔 교율을 어긴 자와 붙잡힌 정파 놈들이 있다. 사면은 교주님만 하신다."</p><p class="note">죄값 ${P.sin||0}/${J2.cap} · 해마다 ${J2.pardon}씩 준다.</p>`;
  return `<p class="note">"죄값 ${P.jail.sin}, 형기 ${P.jail.t}년. 옥 안에서 운기조식이나 하며 마기를 다스려라. 나가고 싶으면 내 목을 넘어가든가, 세월을 삭이든가."</p>
    <div class="row2"><span class="note">복역: 남은 ${P.jail.t}년을 바로 보낸다 (나이도 든다). 만기면 죄값 0, 직위 한 단계 강등.</span>${B('jserve','복역하기',{pri:1})}</div>
    <div class="row2"><span class="note">탈옥: 옥주(화경 호법급)를 쓰러뜨리고 나간다. 배교자가 되어 하산하고 죄값 ${J2.escape}, 마교 추살조가 해마다 쫓는다.</span>${B('jbreak','탈옥하기')}</div>`}
function prisonerDlg(n){const t=n.id==='pris2'?'"나무아미타불. 마교 땅에서 염불이나 외우고 있소. 교주가 바뀌면 풀려날 날이 올는지."':'"정파의 무인으로 잡혀 와 몇 해째요. 여기 갇힌 자는 마교도든 정파든 똑같은 죄인이지."';
  return `<p class="note">${t}</p><p class="note">갇힌 정파 무인. 사면은 교주만 할 수 있다 (교주가 되면 동료로 들일 수 있다).</p>`}
hook('npcDlg',c=>{if(c.html!=null)return;if(c.n.jailer)c.html=jailerDlg(c.n);else if(c.n.prisoner)c.html=prisonerDlg(c.n)});
hook('sectAct',c=>{if(c.a==='jserve'){c.done=true;c.r=true;jailServe()}else if(c.a==='jbreak'){c.done=true;c.r=true;jailBreak();closePanels()}});
// 인물창: 죄값
function sinHtml(){if(P.sect!=='cheonma'&&!P.jail)return '';return `<div class="card"><h4>교율 <small class="dim">마교는 배신과 나약함을 벌한다</small></h4><p>죄값 <b class="${(P.sin||0)>=J2.cap?'bad':''}">${P.sin||0}</b>/${J2.cap}${P.jail?` · <b class="bad">흑혈옥 수감 ${P.jail.t}년</b>`:''}${P.addict?` · 중독: ${Object.keys(P.addict).join('·')}`:''}${P.chGuard?' · 천마혈정이 몸에 돈다':''}</p>
  <p class="note">같은 편 살해 +${J2.ally} · 추살조에게서 도망 +${J2.flee} · 배교 뒤 재입교 +${J2.rejoin} · 해마다 -${J2.pardon}. ${J2.cap}이면 흑혈옥(죄값 ${J2.perYear}당 1년).</p></div>`}

// ---- 흑혈옥 맵: 천마동 아래 동굴 감옥 ----
{const s=SECTS.cheonma;stageRegion({id:JAIL_ID,s,th:'dark',mg:1,seed:9199,name:'흑혈옥',yard:[8,8,32,30],zone:()=>'흑혈옥',
  need:()=>P.jail||(P.sect==='cheonma'&&rankIdx('cheonma')>=MG_ELDER)?null:'흑혈옥은 죄인과 장로 이상만 든다.',
  builds:[{x:9,y:10,w:2,h:2},{x:13,y:10,w:2,h:2},{x:17,y:10,w:2,h:2},{x:21,y:10,w:2,h:2},{x:25,y:10,w:2,h:2},{x:29,y:10,w:2,h:2},{x:9,y:27,w:2,h:2},{x:29,y:27,w:2,h:2}],
  lamps:[[12,16],[28,16],[12,25],[28,25]],
  npcs:[{id:'jailer',jailer:1,n:'흑혈옥 옥주',x:20.5,y:15.7,pal:sectPal('cheonma',5,'도',{elite:1})},{id:'pris1',prisoner:'정',n:'갇힌 정파 무인',x:10.5,y:29.7,pal:'duelist'},{id:'pris2',prisoner:'정',n:'갇힌 소림 승려',x:30.5,y:29.7,pal:'duelist'}],spawns:[]});
  const R=REGIONS[JAIL_ID],D=REGIONS.hq_cheonma_8;R.chain=D.chain;
  R.gates.push({x:20.5,y:38.6,to:'hq_cheonma_8',tx:24.5,ty:13.5,label:'천마동',need:()=>P.jail?'옥주가 막는다. 형기를 채우기 전엔 나갈 수 없다.':null});
  D.gates.push({x:24.5,y:12.5,to:JAIL_ID,tx:20.5,ty:36.2,label:'흑혈옥 (아래)',need:R.stage.need})}

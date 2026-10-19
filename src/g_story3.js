// ================= 천하대전 스토리 5단계 (2026-10-15 v109): 결전장 맵, 결전 연출, 관군 토벌·마교 탈락의 특수 전개 =================
// 설계 docs/스토리_설계.md '5단계'. 데이터 data/story.json STORY.FIELD.
// - 결전장 war_field(개봉 동쪽 근교, 결전 중에만 열리는 출입구): 결전이 벌어진 해에 정세 창의 '출전'으로 바로 간다(차례마다 한 번). 아래쪽에 내 편 무인, 위쪽에 적 무인과 적장. 아래 출입구로 개봉에 돌아간다.
// - 적장(e.warChief)을 베면 이번 차례의 공(+25)을 세운 것으로 치고 명성 +15. 습격(raid)은 전처럼 그 자리에도 온다.
// - 관군 토벌: 조정이 홀로 서는 구도면 결전장의 적장이 '토벌대장'이고, 대전 끝에 조정이 이기면 정관 -20·무림 전체의 힘이 깎이고, 지면 조정의 힘이 더 꺾인다.
// - 마교 탈락: 마교가 구도에서 빠졌는데 내가 마교도면 결전마다 '어부지리' 임무(양쪽 고수 4명)가 생기고, 결전장에서는 모두가 적이다. 끝내면 마교 힘 +3.
const FIELD=STORY.FIELD||{id:'war_field',ally:5,foe:8,elite:2,chiefHp:2.5,chiefAtk:1.4,chiefFame:15,sneak:4,sneakPow:3,gunRel:-20,gunLose:-10};
const FIELD_ID=FIELD.id;
{const s={id:'warfield',n:'결전장',al:'jeong'};stageRegion({id:FIELD_ID,s,th:'sand',seed:9301,name:'결전장',zone:()=>'결전장 · 천하대전',
  tents:[[8,30],[12,31],[28,30],[32,31],[8,8],[12,7],[28,8],[32,7]],lamps:[[14,20],[26,20]],builds:[],spawns:[]});
  const R=REGIONS[FIELD_ID];R.hq=null;R.gates.push({x:20.5,y:38.6,to:'gaebong',tx:37.5,ty:27.5,label:'개봉으로'});
  REGIONS.gaebong.gates.push({x:38.8,y:27.5,to:FIELD_ID,tx:20.5,ty:36.2,label:'결전장',need:()=>warOn()&&G.war.round>=1?null:'결전이 없는 벌판에는 갈 일이 없다.'})}   // 결전장은 개봉 동쪽 근교
const warSneak=()=>warOn()&&mySide()<0&&pfac()==='마';
const warFieldOk=()=>warOn()&&G.war.round>=1&&(mySide()>=0||warSneak())&&!(G.war.cur&&G.war.cur.field);
function warEnemyFacs(){const me=mySide(),out=[];G.war.plan.sides.forEach((s,i)=>{if(i!==me)out.push(...s)});return out}
// 결전장·순찰조: 가로 6~34, 세로 y0~y1 띠 안 걸을 수 있는 곳에 세력 무인 하나 (g_guard.js도 쓴다)
function spawnBand(f,elite,y0,y1,tag){for(let t=0;t<40;t++){const x=6+Math.random()*28,y=y0+Math.random()*(y1-y0);if(!walkAt(x,y))continue;const e=mkFac(f,elite,x,y);tag(e);mobs.push(e);return e}return null}
function warGo(){if(!warFieldOk()||!REGION()||G.duel||P.hp<=0)return false;const w=G.war,n=w.round,me=mySide(),my=me>=0?w.plan.sides[me]:[],foes=warEnemyFacs();if(!foes.length)return false;
  w.cur.field=1;
  regionJump(FIELD_ID,20.5,35.5);let made=0,ally=0;
  const put=spawnBand;
  for(let i=0;i<FIELD.ally&&my.length;i++)if(put(my[i%my.length],i===FIELD.ally-1?1:0,27,33,e=>{e.warAlly=n}))ally++;
  for(let i=0;i<FIELD.foe;i++)if(put(foes[i%foes.length],i<FIELD.elite?1:0,9,17,e=>{e.raid=n;e.aggro=true}))made++;
  const gun=foes.includes('관')&&w.plan.sides.some(s=>s.length===1&&s[0]==='관'),cfac=gun?'관':foes[0],cf=put(cfac,1,10,13,e=>{e.raid=n;e.warChief=1;e.aggro=true;e.realm=Math.min(5,Math.max(3,realmIdx()+1));if(typeof scaleMob==='function')scaleMob(e);e.maxHp=e.hp=Math.round(e.maxHp*FIELD.chiefHp);e.atk=Math.round(e.atk*FIELD.chiefAtk);e.name=gun?'관군 토벌대장':`${FAC4N[cfac]} 대장`});
  {const al=mobs.filter(m=>m.warAlly===n),fo=mobs.filter(m=>m.raid===n);const near=(e,list)=>{let b=null,bd=1e9;for(const o of list){const q=dist(e,o);if(q<bd){bd=q;b=o}}return b};for(const e of al){e.tgt=near(e,fo);e.aggro=!!e.tgt}for(const e of fo){const t=near(e,al);if(t&&Math.random()<.6)e.tgt=t}}   // 결전 연출: 양 진영이 곧바로 맞붙는다
  showBanner(`제${n}차 결전`,w.plan.n);log(`결전장. ${ally?`${sideName(my)} 무인 ${ally}명이 전열에 섰다. `:'당신은 홀로 섰다. '}${foes.map(f=>FAC4N[f]).join('·')} ${made}명이 마주 섰고 적장 ${cf?cf.name:''}이(가) 깃발 아래 있다. 적장을 베면 이번 차례의 공을 세운 것으로 친다.`,'sys');return true}
hook('kill',e=>{if(!e||!e.warChief||!warOn())return;const w=G.war;P.fame+=FIELD.chiefFame;if(!(w.cur&&w.cur.done)){w.cur=w.cur||{};w.cur.done=true;w.cur.q=w.cur.q||'적장 격파';log(`적장 ${e.name}을(를) 베었다! 이번 차례의 공을 세웠다(+25). 명성 +${FIELD.chiefFame}.`,'xp')}else log(`적장 ${e.name}을(를) 베었다. 명성 +${FIELD.chiefFame}.`,'xp');
  showBanner('적장 격파',e.name);P.feats.push(`${Math.floor(P.age)}세 제${w.round}차 결전에서 적장 ${e.name}을(를) 베었다`)});
hook('sectAct',c=>{if(c.a!=='wargo')return;c.done=true;c.r=true;closePanels();warGo()});
// 마교 탈락: 어부지리 임무
{const wr=warRound;warRound=function(){wr();if(!warSneak()||!G.war||G.war.round<1)return;const n=G.war.round,kinds=[];G.war.plan.sides.forEach(s=>{for(const f of s)kinds.push(FAC_KIND[f][1])});
  const q={n:`제${n}차 결전 · 어부지리: 양쪽 고수 사냥`,kind:'kill',mob:kinds,cnt:FIELD.sneak,silver:120,vit:80,fame:10,good:0,have:0,war:n,sneak:1,key:'warsneak:'+n};if(!P.quests.some(o=>o.key===q.key))P.quests.push(q);
  log(`마교는 이 싸움에서 빠졌지만 천마신교는 틈을 노린다. 임무 [${q.n}]: 결전장(정세 창 '출전')에서 ${kinds.join('·')} ${FIELD.sneak}명을 베고 보고하라.`,'sys')}}
hook('questDone',q=>{if(!q.sneak)return;powAdd('마',FIELD.sneakPow);log(`어부지리: 양쪽이 피를 흘리는 사이 천마신교의 힘 +${FIELD.sneakPow}.`,'xp')});
// 결전장의 마교도에겐 모두가 적: 마교가 구도에 없으면 warFoe가 null이라 기본 적대(FAC_FOE)로 돌아가므로 따로 손댈 것이 없다
// 관군 토벌의 결말
{const we=warEnd;warEnd=function(silent){const w=G.war,gun=w&&w.plan.sides.some(s=>s.length===1&&s[0]==='관')&&w.plan.sides.length>=2;we(silent);if(!gun)return;const last=G.wars[G.wars.length-1];if(!last||!last.won)return;
  if(last.won.length===1&&last.won[0]==='관'){relAdd('정관',FIELD.gunRel);for(const f of['정','사','마'])powAdd(f,-3);log(`조정이 무림을 억눌렀다. 정관 관계 ${FIELD.gunRel}, 무림의 힘이 모두 꺾인다.`,'dmg')}
  else{powAdd('관',FIELD.gunLose);log(`무림이 조정의 토벌령을 꺾었다. 조정의 위신이 떨어진다 (관군 ${FIELD.gunLose}).`,'xp')}}}
// 정세 창: 출전 단추
{const wc=warCard;warCard=function(){let h=wc();if(!warOn())return h;const ok=warFieldOk(),been=G.war.cur&&G.war.cur.field;
  const row=`<div class="row2"><span class="note">결전장: 내 편 무인과 함께 적진을 친다. 적장을 베면 이번 차례의 공.${been?' 이번 차례는 다녀왔다.':mySide()<0&&!warSneak()?' 당신의 편이 없다.':''}</span>${B('wargo','출전',{pri:ok,d:!ok})}</div>`;
  const i=h.indexOf('<p class="note">해마다 한 차례씩');return i<0?h+row:h.slice(0,i)+row+h.slice(i)}}

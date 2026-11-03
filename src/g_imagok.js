// ================= 마교 입마곡 · 소교주 (v236, 사용자 2026-11-03) =================
// "마교는 입마곡 같은 동굴에 모두 모여 체질 및 결과에 따라 죽을 수도 있는 수련을 하고, 서로 목숨을 건 경쟁과 위험한 임무를 통해 곡을 통과하면 직위를 받고
//  직위에 따라 무공을 배운다. 교주의 독문무공은 소교주만. 소교주는 경지와 소교주 경쟁자들과의 경쟁, 교내 입지로 쟁취한다.
//  소교주가 되기 전까지 무공은 장경각을 통해 배우거나 인연을 통해 사부를 구하면 사부의 독문무공을 전수받게."
// - 천마신전에서 입교하면 곧장 입마곡(cv_imagok, 핏빛 굴)에 갇힌다. P.imk {st:'trial'|'done'|'fail', stage:'pool'|'rival'|'boss', tz 체질, t, hp, kills, bossT, score, y}
//   ① 마기 연못(굴 웅덩이 방)에 IMAGOK.pool.t초 머문다: 생명이 초마다 깎인다(체질 tz × (1 - 지구력×endK), 운기조식이면 medit배). 연못을 나가면 시간이 멈춘다.
//   ② 동기 생사결: 동기 다섯이 덮친다. 셋을 쓰러뜨리면(진짜 싸움, 지면 목숨을 잃는다) 나머지는 서로 죽고 죽인다.
//   ③ 수호 마수: 굴 안쪽 방의 혈마수를 잡으면 곡을 통과한다. 점수로 직위(교도·정예교도·향주)를 받는다.
//   곡을 버리고 나가면 탈락: 하산하고 한 해 뒤에야 다시 입교할 수 있다.
// - 소교주(P.sgj): 경지·입지(누적 공적이나 직위)를 갖추고 천마신전에서 소교주 후보 셋을 차례로 이기면 된다(비무, 목숨은 걸지 않는다).
//   소교주가 되면 교주가 독문무공(천마신교 고급 무공)을 전한다. 그 비급은 소교주만 받는다 (g_sabu.js jmOk).
// - 소교주 전: 장경각(g_remnant.js)과 장로원 장로 사부(SABU.cheonma, g_sabu.js 공통 길 → 향주에 오르거나 인연 '사부의 가르침'을 고르면 지명)
const IMK=GD.IMAGOK,IMK_ID='cv_imagok';
const imkOn=()=>!!(P&&P.imk&&P.imk.st==='trial'&&P.sect==='cheonma');
const imkRooms=()=>caveRooms(IMK.size,IMK.size);
{const W=IMK.size,c={pid:'hq_cheonma_4',kind:'trial',th:'blood',n:IMK.n,w:W,h:W,seed:IMK.seed},mid=Math.floor(W/2);
  REGIONS[IMK_ID]={name:IMK.n,in:1,cave:{dark:CAVE_TH.blood.dark,dk:CAVE_TH.blood.dk,kind:'trial',th:'blood',pid:c.pid},theme:'dark',size:W,gen:()=>genCave(c),bake:()=>bakeCave('blood'),zone:()=>IMK.n,
    spawns:[],bosses:[],npcs:[],gates:[{x:mid+.5,y:W-1.6,to:c.pid,get tx(){return caveFallback(c.pid).x},get ty(){return caveFallback(c.pid).y},label:'혈마연무장(으)로',door:1,caveOut:1}]}}
// 입교 → 곡으로
hook('sectActDone',c=>{if(c.a!=='sjoin'||c.x!=='cheonma'||P.sect!=='cheonma')return;
  const[a,b]=IMK.pool.tz;P.imk={st:'trial',stage:'pool',tz:Math.round((a+Math.random()*(b-a))*100)/100,t:0,hp:1,kills:0,bossT:0,score:0,y:Math.floor(realAge())};
  log(`교주: "마교의 문은 넓지만 입마곡을 살아 나오는 자만 교도다." 입교한 이들이 모두 입마곡에 갇힙니다. 마기 연못을 버티고, 동기들과 생사결을 벌이고, 곡의 마수를 잡아야 나올 수 있습니다. 곡을 버리고 나가면 탈락입니다.`,'dmg');
  setTimeout(()=>{if(!imkOn())return;const g=imkRooms()[0];regionJump(IMK_ID,g.x+.5,g.y-.5);showBanner('입마곡','살아 나오는 자만 교도가 된다')},300)});
const imkInPool=()=>{const r=imkRooms()[1];return Math.hypot(P.x-r.x-.5,P.y-r.y-.5)<r.r};
// 동기는 아직 교도가 아니다: 같은 편 무인(우호도·악업·죄값)이 아니라 그냥 적으로 만든다
function imkRival(i,x,y){const r=realmIdx(),es=eliteStat(r,IMK.rival.kh,IMK.rival.ka),e=mkMob('혈교무인',x,y,{hp:es.hp,atk:es.atk,hm:es.hm,sp:2.6,hostile:1,aggro:9});e.d=Object.assign({},e.d,{pal:(typeof sectPal==='function'&&sectPal('cheonma',0,['검','도','권'][i%3],{}))||e.d.pal});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,realm:r,angry:1,aggro:true,imkRival:1,fixed:'imk',home:{x,y}});e.name=`입교 동기 ${(P.imk.coh||[])[i]||'교도'}`;mobs.push(e);return e}
function imkStage(st){const k=P.imk;k.stage=st;
  if(st==='rival'){const pool=SB.coh.slice();k.coh=[];for(let i=0;i<IMK.rival.n;i++)k.coh.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);k.left=IMK.rival.n;
    imkSpawnRivals();showBanner('생사결','동기 다섯이 칼을 뽑았다');log(`연못을 버텼습니다. 그러자 동기들이 서로를 노려봅니다. "곡을 나가는 자리는 몇 개 없다." 동기 ${IMK.rival.need}명을 쓰러뜨리세요. 지면 목숨을 잃습니다.`,'dmg')}
  if(st==='boss'){imkSpawnBoss();showBanner('곡의 수호 마수',IMK.boss.n);log(`살아남은 동기들끼리 서로 죽고 죽였습니다. 굴 안쪽에서 ${IMK.boss.n}이(가) 깨어납니다. 잡아야 곡을 나갈 수 있습니다.`,'dmg')}}
function imkSpawnRivals(){const k=P.imk;let n=0;for(let i=0;i<k.coh.length&&n<k.left;i++){const a=i*1.25,x=P.x+Math.cos(a)*5,y=P.y+Math.sin(a)*5;let p={x,y};if(!walkAt(x,y)){const r=imkRooms()[1];p={x:r.x+.5+Math.cos(a)*3,y:r.y+.5+Math.sin(a)*3}}if(walkAt(p.x,p.y)){imkRival(i,p.x,p.y);n++}}}
function imkSpawnBoss(){const r=imkRooms()[2],es=eliteStat(realmIdx(),IMK.boss.kh,IMK.boss.ka),e=mkMob('호랑이',r.x+.5,r.y+.5,{hp:es.hp,atk:es.atk,def:Math.round(3+realmIdx()*1.5),hm:es.hm,sp:2.6,hostile:1,aggro:9});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,imkBoss:1,realm:realmIdx(),fixed:'imk',home:{x:r.x+.5,y:r.y+.5}});e.name=IMK.boss.n;e.d=Object.assign({},e.d,{boss:1});mobs.push(e);P.imk.bossT=0}
// 곡 안: 연못 시간, 생명 깎임
hook('tick',dt=>{if(!imkOn()||!playing||REG!==IMK_ID||P.hp<=0)return;const k=P.imk;
  if(k.stage==='pool'){if(!imkInPool()){k.warn=(k.warn||0)-dt;if(k.warn<=0){k.warn=6;addText(P.x,P.y-1,'마기 연못으로','#c84a4a')}return}
    const end=(P.st&&P.st.end)||0,d=P.maxHp*IMK.pool.drain*k.tz*Math.max(.35,1-end*IMK.pool.endK)*(P.medit?IMK.pool.medit:1)*dt;P.hp-=d;k.t+=dt;
    if(Math.floor(k.t)!==Math.floor(k.t-dt))addText(P.x,P.y-1,`마기 ${Math.floor(k.t)}/${IMK.pool.t}`,'#d05050');
    if(P.hp<=0){P.hp=0;log('마기를 견디지 못하고 쓰러졌습니다.','dmg');if(typeof die==='function')die('입마곡의 마기');return}
    if(k.t>=IMK.pool.t){k.hp=P.hp/P.maxHp;log(`마기 연못을 버텼습니다. 체질 ${k.tz<.95?'좋음':k.tz>1.15?'나쁨':'보통'} · 남은 생명 ${Math.round(k.hp*100)}%.`,'xp');imkStage('rival')}}
  else if(k.stage==='boss')k.bossT+=dt});
hook('kill',e=>{if(!imkOn())return;const k=P.imk;
  if(e.imkRival){k.kills++;k.left--;log(`${e.name}을(를) 쓰러뜨렸습니다. (${k.kills}/${IMK.rival.need})`,'dmg');if(k.stage==='rival'&&k.kills>=IMK.rival.need){for(const m of mobs)if(m.imkRival)m.hp=0;mobs=mobs.filter(m=>!m.imkRival);imkStage('boss')}}
  if(e.imkBoss)imkPass()});
// 다시 들어오면 남은 상대를 다시 세운다
hook('regionLoaded',id=>{if(!imkOn())return;const k=P.imk;if(id===IMK_ID){if(k.stage==='rival')setTimeout(imkSpawnRivals,50);else if(k.stage==='boss')setTimeout(imkSpawnBoss,50);return}
  if(!REGIONS[id]||REGIONS[id].cave&&id===IMK_ID)return;imkFail()});
function imkPass(){const k=P.imk,S=IMK.score,f=S.fast;k.st='done';
  k.score=Math.round(k.hp*S.hp+k.kills*S.kill+(k.bossT<f[0]?f[1]:k.bossT<f[2]?f[3]:0));const r=(IMK.rank.find(([v])=>k.score>=v)||[0,0])[1];
  P.srank=P.srank||{};P.srank.cheonma=Math.max(P.srank.cheonma||0,r);const n=rankName('cheonma',r);P.fame+=10+r*10;
  showBanner('입마곡 통과',`${n} · 점수 ${k.score}`);log(`입마곡을 살아 나왔습니다. 점수 ${k.score} (남은 생명 ${Math.round(k.hp*100)}% · 동기 ${k.kills}명 · 마수 ${Math.round(k.bossT)}초). 교주가 ${n}의 직위를 내립니다. 직위가 오를수록 더 높은 무공을 받습니다.`,'xp');
  feat(`입마곡을 살아 나와 천마신교 ${n}이(가) 되었다`);if(typeof garbSync==='function')try{garbSync()}catch(err){}recalc()}
function imkFail(){const k=P.imk;k.st='fail';k.y=Math.floor(realAge());P.sect=null;mobs=mobs.filter(m=>m.fixed!=='imk');log(`입마곡을 버리고 나왔습니다. 마교는 곡을 버린 자를 받지 않습니다. ${IMK.retry}년 뒤에 다시 입교할 수 있습니다.`,'dmg');showBanner('입마곡 탈락','마교에서 쫓겨났다')}
// 탈락한 해에는 다시 받지 않는다 (g_sect.js joinBlock 뒤에 붙인다)
const imkJoinBlock=()=>P&&P.imk&&P.imk.st==='fail'&&realAge()<P.imk.y+IMK.retry?`입마곡을 버린 자는 ${IMK.retry}년 동안 받지 않는다.`:'';
// 예전 저장의 마교도는 곡을 지난 것으로 친다
hook('tick',()=>{if(P&&P.sect==='cheonma'&&!P.imk)P.imk={st:'done',old:1}});
// ---- 소교주 ----
function sgjWhy(){const s=SECTS.cheonma,g=IMK.sgj;if(P.sect!=='cheonma')return'마교도만';if(P.sgj)return'이미 소교주다';if(imkOn())return'입마곡부터';
  if(typeof isLeader==='function'&&isLeader())return'교주다';if(G.mdead&&G.mdead.cheonma)return'교주 자리가 비었다';
  if(realmIdx()<g.realm)return`${RANKS[g.realm]} 이상`;if(((P.mtot||{}).cheonma||0)<g.merit&&rankIdx('cheonma')<g.rank)return`교내 입지: 누적 공적 ${g.merit} 또는 ${rankName('cheonma',g.rank)} (지금 공적 ${(P.mtot||{}).cheonma||0})`;
  if(P.sgjCool&&realAge()<P.sgjCool)return`지난 쟁탈에 져서 ${Math.max(1,Math.ceil((P.sgjCool-realAge())*12))}달 뒤`;if(G.duel||P.hp<=0)return'지금은 안 된다';return''}
const SGJ_N=['혈영','마검','흑풍','독수','귀령'];
function sgjDuel(){if(sgjWhy()||!(panel==='npc'&&panelArg&&panelArg.hq==='cheonma'))return;const g=IMK.sgj,i=P.sgjI||0,s=SECTS.cheonma,r=realmIdx(),es=eliteStat(r,g.kh[i],g.ka[i]);
  const nm=`소교주 후보 ${(P.imk&&P.imk.coh&&P.imk.coh[i])||SGJ_N[i]} (${i+1}/${g.n})`,cls=['검','도','권'][i%3];
  closePanels();G.duel=true;G.sgjDuel={i,x:P.x,y:P.y};for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;
  let ex=P.x+2.4,ey=P.y;if(!walkAt(ex,ey)){ex=P.x-2.4;if(!walkAt(ex,ey)){ex=P.x;ey=P.y+2.4}}
  const e=mkMob(nm,ex,ey,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.3,reach:1.4,el:'마',pal:'duelist',hostile:1,aggro:9,duelist:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,duel:1,aggro:true,realm:r,wcls:cls});e.d=Object.assign({},e.d,{pal:(typeof sectPal==='function'&&sectPal('cheonma',3,cls,{elite:1}))||'duelist'});e.name=nm;mobs.push(e);P.target=e;
  showBanner('소교주 쟁탈',nm);log(`교주: "소교주 자리는 하나다. 살아남는 자가 갖는다."`,'info')}
function sgjDuelEnd(win){const t=G.sgjDuel;G.duel=false;G.sgjDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!win)P.hp=Math.max(1,Math.round(P.maxHp*.3));if(!t)return;const g=IMK.sgj;
  if(!win){P.sgjI=0;P.sgjCool=realAge()+g.retry;log('소교주 쟁탈에서 졌습니다. 한 해 더 입지를 다지고 다시 도전하세요.','dmg');showBanner('쟁탈 패배','소교주 후보');return}
  P.sgjI=t.i+1;if(P.sgjI<g.n){log(`후보를 꺾었습니다. 남은 후보 ${g.n-P.sgjI}명. 천마신전에서 이어서 도전하세요.`,'xp');showBanner('후보 격파',`${P.sgjI}/${g.n}`);return}
  P.sgj=1;P.sgjI=0;P.fame+=60;const s=SECTS.cheonma,got=[];
  for(const m of s.arts.filter(a=>a.hi)){const a=ARTS[m.id];if(P.arts[m.id]){got.push(a.n);continue}if(capArts().length>=artCap()){if(P.bag.length<24)P.bag.push(mkBook(m.id,0));got.push(a.n+' 비급');continue}P.arts[m.id]={p:0,f:a.forms.map((f,i)=>i===0)};got.push(a.n)}
  showBanner('천마신교 소교주','교주의 독문무공을 잇는다');log(`교주: "네가 내 뒤를 이을 소교주다." 교주의 독문무공 ${got.map(n=>`[${n}]`).join(' · ')}을(를) 전수받았습니다. 명성 +60. 다음 초식 비급은 공적으로 받습니다.`,'xp');feat('천마신교의 소교주가 되었다');recalc()}
hook('tick',()=>{const t=G.sgjDuel;if(!t||!P||!playing)return;if(Math.hypot(P.x-t.x,P.y-t.y)>9){log('쟁탈 자리를 벗어나 졌습니다.','dmg');duelEnd(false)}});
hook('gLoaded',()=>{if(G.sgjDuel){G.sgjDuel=null;G.duel=false}});
hook('sectAct',c=>{if(c.a!=='sgjgo')return;c.done=true;c.r=true;sgjDuel()});
function sgjHtml(s,hq){const w=sgjWhy(),hi=s.arts.filter(a=>a.hi).map(a=>`[${ARTS[a.id].n}]`).join(' · '),g=IMK.sgj;
  if(P.sgj)return `<div class="row2"><span class="note"><b class="gold">소교주</b> · 교주의 독문무공 ${hi}의 비급을 공적으로 받는다.</span></div>`;
  return `<div class="row2"><span class="note">교주의 독문무공 ${hi}은(는) <b>소교주</b>만 잇는다. 경지 ${RANKS[g.realm]} · 교내 입지(누적 공적 ${g.merit} 또는 ${rankName('cheonma',g.rank)}) · 후보 ${g.n}명과의 쟁탈. ${P.sgjI?`<b>후보 ${P.sgjI}/${g.n} 격파</b>. `:''}${w?`<small class="dim">${esc(w)}</small>`:''}</span>${hq&&!w?B('sgjgo',P.sgjI?'다음 후보와 겨루기':'소교주 쟁탈 도전',{pri:1}):''}</div>`}
// 문파 창: 곡 안에서는 진행 카드
function imkCard(){const k=P.imk,st={pool:`마기 연못 ${Math.floor(k.t)}/${IMK.pool.t}초`,rival:`동기 생사결 ${k.kills}/${IMK.rival.need}`,boss:`${IMK.boss.n} 사냥`}[k.stage];
  return `<div class="card sbcard"><div class="row2"><h4>입마곡</h4><span class="tag">${st}</span></div><p class="note">① 마기 연못을 ${IMK.pool.t}초 버틴다(체질이 나쁘면 더 깎인다, 운기조식으로 줄인다) → ② 동기 ${IMK.rival.need}명을 쓰러뜨린다(목숨을 건다) → ③ ${IMK.boss.n}을(를) 잡는다. 점수로 직위를 받는다. 곡을 나가면 탈락.</p></div>`}
function imkTrackHtml(){if(!imkOn())return'';const k=P.imk;return `<h5>입마곡</h5><div>${{pool:`마기 연못 ${Math.floor(k.t)}/${IMK.pool.t}초`,rival:`동기 생사결 ${k.kills}/${IMK.rival.need}`,boss:`${IMK.boss.n} 사냥`}[k.stage]}</div>`}
// 인연 '사부의 가르침'을 고른 마교도(사부 없음)는 장로원 장로가 제자로 거둔다 (g_madi.js 인연 뒤에 돈다)
hook('sectAct',c=>{if(c.a!=='inygo'||c.x!=='sabu'||P.sect!=='cheonma'||imkOn()||!P.sabu||P.sabu.sid!=='cheonma'||P.sabu.st!=='common')return;const M=sbMasters('cheonma'),cur=(art()||{}).cls,m=M.find(x=>x.cls===cur)||pick(M);
  P.sabu.st='named';P.sabu.off=m.k;P.sabu.late=1;log(`인연이 닿아 장로원의 ${m.n}이(가) 당신을 제자로 거두겠다고 합니다. 천마신전 문파 창에서 받들지 정하세요.`,'xp');showBanner('장로의 인연',m.n)});

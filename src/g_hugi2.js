// ================= 후기지수 경쟁 (v240, 사용자 2026-11-03) =================
// "해당 인원들이 정마 사파 마교 군부를 대표하는 후기지수가 되고 플레이어와 경쟁하는 구도"  ·  "나이 상한은 40으로 하고 실제 사망은 사망으로"
// 명단 G.hugi와 경지 굴림(hugiRoll)은 g_hugi.js. 여기는 그 위에 얹는 경쟁:
// - 순위표: 경지·비무 전적·용봉지회·창안(+ 플레이어 명성·별호)으로 점수. 해마다 다시 꼽고 내 순위가 바뀌면 알린다. 40세(HGC.age)까지. 정세 창 '후기지수' 카드
// - 은원 P.hgr[id]={v,f,w,l}: 벗(v≥40)·원수(v≤-50)·숙적(적 세력, 두 번 이상)·호적수(두 번 이상)·안면
// - 마주침: 들판(pv_)에서 한 해 두 번까지. 비무(목숨은 안 건다)를 청하거나, 숙적·원수·적 세력이면 생사결(진짜 죽음, 플레이어도)
//   생사결에서 쓰러뜨리면 벤다·무공을 폐한다·살려 준다. 베면 그 문파 원한, 같은 문파 후기지수는 원수가 된다
// - 도전장: 순위가 가까운 자가 보낸다(반년 안에 받지 않으면 명성 하락). 내 위의 자에게 보낼 수도 있다 (한 해 한 번씩)
// - 용봉지회: 세 해마다 개봉 비무대에서 8강 대진. 플레이어가 없는 판은 점수·운으로 셈
// - 천하대전: 결전장에 적 후기지수가 이름 있는 고수로, 내 편 후기지수가 아군으로 선다. 대전 중 해마다 전사할 수 있다
// - 경쟁 가중치(hugiMul): 플레이어에게 진 자는 이듬해 더 오르고, 두 경지 앞선 자는 덜 오른다. 세 경지 넘게 뒤처지면 자취를 감춘다
// 데이터 data/hugic.json (HGC), 테스트 tests/t158_hugic.js
const HGC=GD.HGC;
const hgEl=()=>!!P&&realAge()<=HGC.age&&!(typeof acadOn==='function'&&acadOn());
const hgOn=h=>h&&!h.dead&&!h.old&&h.age<=HGC.age;
const hgList=()=>(G.hugi||[]).filter(hgOn);
function hgR(id){P.hgr=P.hgr||{};return P.hgr[id]=P.hgr[id]||{v:0,f:0,w:0,l:0}}
const hgRv=id=>(P&&P.hgr&&P.hgr[id])||{v:0,f:0,w:0,l:0};
function hgRelK(h){const r=hgRv(h.id),R=HGC.rel;if(r.v>=R.friend)return'friend';if(r.v<=R.enemy)return'foe';
  if(r.f>=2)return facFoe(h.fac,pfac())?'nem':'rival';return r.f>=1?'met':'none'}
const hgRelN=h=>HGC.rn[hgRelK(h)];
const hgSect=h=>SECTS[h.sid]?SECTS[h.sid].n:FAC4N[h.fac];
const hgNm=h=>`${SECTS[h.sid]?SECTS[h.sid].n+' ':''}${h.n}`;
// ---- 순위표 ----
function hgScore(h){const S=HGC.score;return h.rk*S.rk+(h.bw||0)*S.win-(h.bl||0)*S.lose+(h.tw||0)*S.tour+(h.art?S.art:0)}
function hgMeScore(){const S=HGC.score;return realmIdx()*S.rk+(P.hgW||0)*S.win-(P.hgL||0)*S.lose+(P.hgTw||0)*S.tour+Math.min(S.fameMax,Math.floor((P.fame||0)/S.fameDiv))+(P.byh?S.byh:0)}
function hgRank(){const L=hgList().map(h=>({h,s:hgScore(h)}));if(hgEl())L.push({me:1,s:hgMeScore()});L.sort((a,b)=>b.s-a.s||(a.me?-1:b.me?1:a.h.id-b.h.id));return L}
const hgMyRank=()=>{const i=hgRank().findIndex(x=>x.me);return i<0?0:i+1};
function hgRankNote(quiet){if(!P)return;const r=hgMyRank(),o=P.hgRk||0;P.hgRk=r;if(quiet||!r||r===o)return;
  if(!o||r<o){showBanner(`후기지수 제${r}위`,'강호가 당신을 꼽는다');log(`강호가 당신을 천하 후기지수 제${r}위로 꼽는다.${o?` (전엔 ${o}위)`:''}`,'xp')}else log(`후기지수 순위가 ${o}위에서 ${r}위로 밀렸다.`,'info')}
// 해마다: 동기 편입, 대전 전사, 뒤처진 자 퇴장, 도전장, 용봉지회, 순위, 천하제일
hook('newYear',()=>{if(!P||!G.hugi)return;const y=hgYear(),me=realmIdx();hgSryLink();
  if(typeof warOn==='function'&&warOn())for(const h of hgList())if(warSideOf(h.fac)>=0&&Math.random()<HGC.war.die*Math.max(.2,1-h.rk*.1))hugiDie(h,'전사');
  for(const h of hgList())if(h.rk<=me-3&&!h.prod&&!(P.hgr&&P.hgr[h.id]&&P.hgr[h.id].f)&&Math.random()<HGC.fade){h.old=1;log(`강호 소식: ${hgNm(h)}이(가) 강호에서 자취를 감췄다.`,'info')}
  if(G.hgTour&&!G.hgTour.done&&y>G.hgTour.y)hgTourSim();
  if(!G.hgTour||y-G.hgTour.y>=HGC.tour.gap)hgTourOpen(y);
  P.hgMeet={y,n:0};hgChCheck(y);hgRankNote();
  if(hgEl()&&P.hgRk===1){P.hgTopN=(P.hgTopN||0)+1;if(P.hgTopN>=HGC.top.years&&!P.hgTop){P.hgTop=1;P.fame+=HGC.top.fame;showBanner(HGC.top.title,P.name);feat(`${HGC.top.title}로 불렸다`);log(`세 해 내리 후기지수 맨 위에 섰다. 강호가 당신을 ${HGC.top.title}라 부른다. 명성 +${HGC.top.fame}`,'xp')}}else P.hgTopN=0});
// 문파 수련기 동기 라이벌을 명단에 올린다 (같은 문파 후기지수 이름을 바꾸거나 새로)
function hgSryLink(){const rv=P.sry&&P.sry.rival;if(!rv||rv.hg)return;const s=rv.sect&&SECTS[rv.sect];if(!s||(G.gone&&G.gone[s.id]))return;
  let h=hgList().find(x=>x.sid===s.id&&!x.prod&&!(P.hgr&&P.hgr[x.id]));if(!h&&typeof hugiNew==='function')h=hugiNew(s.id,{age:Math.max(16,Math.floor(realAge()))});if(!h)return;
  h.n=rv.n;rv.hg=h.id;const r=hgR(h.id);r.f=Math.max(r.f,1)}
// 가중치: 플레이어에게 진 자는 이를 간다, 너무 앞선 자는 쉬어 간다
hook('hugiMul',c=>{if(!P)return;const h=c.h;if(G.hgSpur&&G.hgSpur[h.id]>=hgYear()-1)c.mul*=HGC.spur.lose;if(h.rk>=realmIdx()+2)c.mul*=HGC.spur.ahead});
hook('hugiUp',(h,from,to)=>{if(!P||!hgEl())return;const me=realmIdx();if(from<=me&&to>me&&P.hgr&&P.hgr[h.id]){showBanner(`${h.n} ${RANKS[to]}`,'경쟁자가 당신을 앞질렀다');log(`${hgNm(h)}이(가) ${RANKS[to]}에 올라 당신을 앞질렀다.`,'info')}});
// 죽음: 플레이어 손에 죽으면 그 문파가 기억한다
hook('hugiDie',(h,cause)=>{if(!P||cause!=='player')return;const K=HGC.kill;if(typeof repAdd==='function')repAdd(h.sid,K.fac,K.sect,h.fac);
  (P.hgKill=P.hgKill||[]).push({id:h.id,n:h.n,sid:h.sid});for(const o of hgList())if(o.sid===h.sid&&o.id!==h.id){const r=hgR(o.id);r.v=Math.min(r.v,HGC.rel.sectKill)}
  if(typeof ewAdd==='function')ewAdd('kill',{name:hgNm(h),sect:h.sid},hgNm(h))});
// ---- 무인 만들기 ----
function hgMob(h,x,y,o={}){const r=Math.min(6,h.rk),es=eliteStat(r,HGC.kh,HGC.ka),cls=h.w||'검',ranged=rangedCls(cls),nm=hgNm(h);
  const e=mkMob(nm,x,y,{hp:es.hp,atk:es.atk,def:Math.round(2+r*1.5),hm:es.hm,sp:2.3,reach:ranged?(cls==='암'?4:5):cls==='창'?1.8:cls==='봉'?1.6:1.4,ranged:ranged?1:0,el:null,pal:'duelist',hostile:1,aggro:9,duelist:1});
  Object.assign(e,{hp:es.hp,maxHp:es.hp,atk:es.atk,hm:es.hm,realm:r,wcls:cls,hgId:h.id,name:nm,sect:h.sid||null},o);
  const pal=SECTS[h.sid]&&typeof sectPal==='function'&&sectPal(h.sid,Math.min(4,Math.max(1,h.rk)),cls,{});e.d=Object.assign({},e.d,{pal:pal||'duelist',elite:1});return e}
function hgSpot(d=2.6){for(const[dx,dy]of[[d,0],[-d,0],[0,d],[0,-d],[d,d],[-d,-d]]){const x=P.x+dx,y=P.y+dy;if(walkAt(x,y))return{x,y}}return{x:P.x+.6,y:P.y}}
function hgVs(h,k){const pool=HGC.vs[k]||HGC.vs.none,foe=pool[(h.id+hgYear())%pool.length],me=HGC.vs.me[k]||HGC.vs.me.none,col={정:'#7aa6d8',사:'#b58a4a',마:'#8b2e2e',관:'#6f8f5a'}[h.fac]||'#9a8f7a';
  let el=document.getElementById('vsline');if(!el){el=document.createElement('div');el.id='vsline';el.setAttribute('aria-live','polite');$('app').appendChild(el)}
  el.innerHTML=`<div class="vf"><i style="--sc:${col}">${esc(hgSect(h)[0])}</i><div><b>${esc(h.n)}</b><p>${esc(foe)}</p></div></div><div class="vm"><div><b>${esc(P.name)}${P.byh?` <small>「${esc(P.byh)}」</small>`:''}</b><p>${esc(me)}</p></div></div>`;
  el.style.setProperty('--vd',VS.dur+'s');el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),VS.dur*1000);
  if(typeof vsAt!=='undefined')vsAt=time;log(`${h.n}: "${foe}"`,'info')}
// ---- 비무 (목숨은 걸지 않는다) ----
function hgDuel(h,kind,at){if(!h||G.duel||P.hp<=0||!hgOn(h))return false;closePanels();G.duel=true;for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}
  if(at){P.x=at.x-1;P.y=at.y}P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;G.hgDuel={id:h.id,k:kind,x:P.x,y:P.y};
  const p=hgSpot(2.4),e=hgMob(h,p.x,p.y,{duel:1,aggro:true});mobs.push(e);P.target=e;
  showBanner(kind==='tour'?`용봉지회 ${HGC.tour.names[G.hgTour?G.hgTour.r:0]||''}`:'후기지수 비무',hgNm(h));hgVs(h,kind==='tour'?'tour':hgRelK(h));return true}
function hgDuelEnd(win){const t=G.hgDuel;G.duel=false;G.hgDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!win)P.hp=Math.max(1,Math.round(P.maxHp*.3));
  const h=t&&hugiById(t.id);if(!h)return;const r=hgR(h.id),R=HGC.rel;r.f++;
  if(win){r.w++;r.v=clamp(r.v+R.win,-100,100);P.hgW=(P.hgW||0)+1;h.bl=(h.bl||0)+1;(G.hgSpur=G.hgSpur||{})[h.id]=hgYear();
    const fame=HGC.duel.winFame+Math.max(0,h.rk-realmIdx()+1)*HGC.duel.rkFame;P.fame+=fame;log(`${hgNm(h)}을(를) 꺾었습니다. 명성 +${fame}. "${r.f>=2?'다음엔 반드시':'기억해 두겠소'}."`,'xp');showBanner('비무 승리',h.n);feat(`후기지수 ${h.n}을(를) 비무에서 꺾었다`)}
  else{r.l++;r.v=clamp(r.v+R.lose,-100,100);P.hgL=(P.hgL||0)+1;h.bw=(h.bw||0)+1;log(`${hgNm(h)}에게 졌습니다. 비무에서는 목숨을 잃지 않습니다.`,'dmg');showBanner('비무 패배',h.n);hugiRoll(h,'bm')}
  if(typeof ewAdd==='function')ewAdd(win?'win':'lose',{name:hgNm(h),sect:h.sid},hgNm(h));
  if(t.k==='tour')hgTourAfter(win);else if(t.k==='ch'&&P.hgCh&&P.hgCh.id===h.id)P.hgCh=null;
  hgRankNote()}
hook('tick',()=>{const t=G.hgDuel;if(!t||!P||!playing)return;if(Math.hypot(P.x-t.x,P.y-t.y)>HGC.duel.ring){log('비무 자리를 벗어나 졌습니다.','dmg');duelEnd(false)}});
hook('gLoaded',()=>{if(G.hgDuel){G.hgDuel=null;G.duel=false}});
// ---- 생사결 (진짜 죽음) ----
function hgLethal(h){if(!h||!hgOn(h)||P.hp<=0)return null;const p=hgSpot(3.2),e=hgMob(h,p.x,p.y,{aggro:true,hgLethal:1});e.tgt=P;mobs.push(e);
  showBanner('생사결',hgNm(h));hgVs(h,hgRelK(h));log(`${h.n}이(가) 목숨을 건 승부를 걸어 왔다. 여기서 지면 정말 죽는다.`,'dmg');return e}
// 생사결에서 쓰러뜨리면 바로 죽이지 않고 고른다
hook('struck',(e,from)=>{if(!e||!e.hgLethal||e.hgDown||e.hp>0||from!==P)return;e.hp=1;e.hgDown=1;e.stun=999;e.aggro=false;e.tgt=null;e.d=Object.assign({},e.d,{hostile:0});
  if(P.target===e)P.target=null;openPanel('npc',{id:'hgdown',n:e.name,hgE:e})});
hook('mobHurt',c=>{if(c.t&&c.t.hgDown){c.dm=0;c.t.hp=Math.max(c.t.hp,2)}});
function hgFinish(e,how){if(!e||!e.hgDown)return;const h=hugiById(e.hgId);mobs=mobs.filter(m=>m!==e);fx.push({t:'puff',x:e.x,y:e.y,life:.6});if(!h)return;const r=hgR(h.id),R=HGC.rel;r.f++;r.w++;P.hgW=(P.hgW||0)+1;
  if(how==='kill'){P.fame+=HGC.kill.fame;P.evil+=h.fac===P.side?HGC.kill.evil:Math.round(HGC.kill.evil/3);r.v=R.kill;hugiDie(h,'player');feat(`생사결에서 후기지수 ${h.n}을(를) 베었다`);showBanner('생사결 승리',`${h.n}을(를) 베었다`)}
  else if(how==='crip'){const C=HGC.crip;h.rk=0;h.old=1;h.crip=1;P.fame+=C.fame;P.evil+=C.evil;r.v=R.crip;if(typeof repAdd==='function')repAdd(h.sid,0,C.sect,h.fac);log(`${h.n}의 단전을 깨뜨렸다. 다시는 무공을 쓰지 못한다. ${hgSect(h)}이(가) 이 일을 잊지 않을 것이다.`,'dmg');feat(`후기지수 ${h.n}의 무공을 폐했다`)}
  else{const S=HGC.spare;r.v=clamp(Math.max(r.v,0)+R.spare,-100,100);P.good+=S.good;P.fame+=S.fame;(G.hgSpur=G.hgSpur||{})[h.id]=hgYear();log(`${h.n}을(를) 살려 보냈다. "이 목숨 빚은 잊지 않겠소."`,'xp');feat(`생사결에서 이긴 뒤 ${h.n}을(를) 살려 보냈다`)}
  hgRankNote()}
// 생사결 무인이 죽으면 (다른 무인의 손이든 쓰러뜨림 고르기 없이든)
hook('kill',e=>{if(e&&e.hgId&&!e.hgDown){const h=hugiById(e.hgId);if(h&&!h.dead){const r=hgR(h.id);r.f++;r.w++;hugiDie(h,'player')}}});
hook('mobKilled',t=>{if(t&&t.hgId){const h=hugiById(t.hgId);if(h&&!h.dead)hugiDie(h,'전사')}});
hook('died',()=>{const e=mobs.find(m=>m.hgLethal&&m.hp>0);if(!e)return;const h=hugiById(e.hgId);if(h){h.bw=(h.bw||0)+1;log(`강호 소식: ${hgNm(h)}이(가) 생사결에서 ${P.name}을(를) 베었다.`,'info')}});
// ---- 길에서 마주침 ----
let hgMeetT=null,hgMeetH=null;
hook('regionLoaded',id=>{hgMeetH=null;hgMeetT=/^pv_/.test(id||'')?HGC.meet.t[0]+Math.random()*(HGC.meet.t[1]-HGC.meet.t[0]):null});
function hgMeetOk(){return P&&playing&&!paused&&$('win').hidden&&!G.duel&&P.hp>P.maxHp*.5&&!P.leap&&!P.perch&&hgEl()&&!mobs.some(m=>m.hp>0&&m.aggro&&dist(m,P)<10)}
hook('tick',dt=>{if(hgMeetT==null||!P||!playing||paused)return;hgMeetT-=dt;if(hgMeetT>0)return;if(!hgMeetOk()){hgMeetT=5;return}hgMeetT=null;
  const m=P.hgMeet&&P.hgMeet.y===hgYear()?P.hgMeet:(P.hgMeet={y:hgYear(),n:0});if(m.n>=HGC.meet.perYear||Math.random()>=HGC.meet.p)return;hgMeet()});
function hgMeet(h){const L=hgList().filter(x=>SECTS[x.sid]||!x.sid);if(!h){if(!L.length)return null;const w=L.map(x=>1+(P.hgr&&P.hgr[x.id]?2:0)+(Math.abs(x.rk-realmIdx())<=1?2:0));let t=w.reduce((a,b)=>a+b,0)*Math.random();h=L[0];for(let i=0;i<L.length;i++){t-=w[i];if(t<=0){h=L[i];break}}}
  P.hgMeet=P.hgMeet&&P.hgMeet.y===hgYear()?P.hgMeet:{y:hgYear(),n:0};P.hgMeet.n++;const k=hgRelK(h),r=hgR(h.id);
  const lethal=k==='foe'||k==='nem'||(k!=='friend'&&facFoe(h.fac,pfac())&&(Math.random()<HGC.meet.foeP||(typeof warOn==='function'&&warOn())));
  if(lethal){r.f=Math.max(r.f,1);hgLethal(h);return'lethal'}
  hgMeetH=h.id;openPanel('npc',{id:'hgmeet',n:hgNm(h),hgm:h.id});return'meet'}
// ---- 도전장 ----
function hgChCheck(y){if(!hgEl()||P.hgCh||Math.random()>=HGC.ch.p)return;const R=hgRank(),i=R.findIndex(x=>x.me);if(i<0)return;
  const near=R.filter((x,j)=>!x.me&&Math.abs(j-i)<=HGC.ch.near).map(x=>x.h);if(!near.length)return;const h=pick(near);
  P.hgCh={id:h.id,until:(G.cal||0)+HGC.ch.dur};hgR(h.id).f=Math.max(hgR(h.id).f,0);showBanner('도전장',hgNm(h));log(`${hgNm(h)}이(가) 도전장을 보내왔다. 반년 안에 받지 않으면 강호가 당신을 비웃는다. (정세 창 · 후기지수)`,'sys')}
hook('tick',()=>{const c=P&&P.hgCh;if(!c||!playing||(G.cal||0)<=c.until)return;P.hgCh=null;const h=hugiById(c.id);P.fame=Math.max(0,P.fame-HGC.ch.refuseFame);
  if(h){h.bw=(h.bw||0)+1;log(`${hgNm(h)}의 도전을 받지 않았다. "겁을 먹은 게로군." 명성 -${HGC.ch.refuseFame}`,'dmg')}});
// ---- 용봉지회 ----
function hgTourOpen(y){G.hgTour={y,r:0,br:null,done:0,me:0};if(!hgList().length)return;showBanner('용봉지회','개봉 비무대에 천하의 후기지수가 모인다');
  log(`[소식] 올해 개봉 비무대에서 용봉지회가 열린다. 후기지수 여덟이 겨룬다.${hgEl()?' 정세 창에서 출전할 수 있다 (개봉에서).':''}`,'sys')}
function hgTourBracket(me){const L=hgRank().filter(x=>!x.me).slice(0,HGC.tour.n-(me?1:0)).map(x=>x.h.id);if(me)L.push('P');for(let i=L.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[L[i],L[j]]=[L[j],L[i]]}return L}
const hgSc=id=>id==='P'?hgMeScore():hgScore(hugiById(id));
const hgPair=(a,b)=>{if(b==null)return a;const d=hgSc(a)-hgSc(b);return Math.random()<1/(1+Math.exp(-d/80))?a:b};
function hgTourJoin(){const T=G.hgTour;if(!T||T.done||T.me||!hgEl()||G.duel)return;T.me=1;T.br=hgTourBracket(true);T.r=0;hgTourNext()}
// 플레이어가 낀 판의 상대
function hgTourFoe(){const T=G.hgTour,i=T.br.indexOf('P');if(i<0)return null;return hugiById(T.br[i^1])}
function hgTourNext(){const h=hgTourFoe();if(!h){hgTourAfter(true);return}hgDuel(h,'tour',REG==='gaebong'?ARENA:null)}
// 한 판이 끝나면: 다른 판을 셈하고 다음 대진
function hgTourAfter(win){const T=G.hgTour;if(!T||!T.br)return;const nb=[];for(let i=0;i<T.br.length;i+=2){const a=T.br[i],b=T.br[i+1];nb.push(a==='P'||b==='P'?(win?'P':(a==='P'?b:a)):hgPair(a,b))}T.br=nb;T.r++;
  if(!win||nb.length<=1||!nb.includes('P')){while(T.br.length>1){const n2=[];for(let i=0;i<T.br.length;i+=2)n2.push(hgPair(T.br[i],T.br[i+1]));T.br=n2}hgTourWin(T.br[0]);return}
  log(`용봉지회 ${HGC.tour.names[T.r-1]}을(를) 넘었다. 다음은 ${HGC.tour.names[T.r]||'결승'}. 정세 창에서 나선다.`,'xp')}
function hgTourSim(){const T=G.hgTour;if(!T||T.done)return;if(!T.br)T.br=hgTourBracket(false);while(T.br.length>1){const n2=[];for(let i=0;i<T.br.length;i+=2)n2.push(hgPair(T.br[i],T.br[i+1]));T.br=n2}hgTourWin(T.br[0])}
function hgTourWin(id){const T=G.hgTour;T.done=1;T.win=id;if(id==='P'){P.hgTw=(P.hgTw||0)+1;P.fame+=HGC.tour.fame;showBanner('용봉지회 우승',P.name);feat('용봉지회에서 우승했다');log(`용봉지회에서 우승했다! 천하가 당신의 이름을 안다. 명성 +${HGC.tour.fame}`,'xp')}
  else{const h=hugiById(id);if(h){h.tw=(h.tw||0)+1;log(`강호 소식: 용봉지회에서 ${hgNm(h)}이(가) 우승했다.`,'info');hugiRoll(h,'bm')}}hgRankNote()}
// ---- 천하대전: 결전장에 이름 있는 후기지수 ----
if(typeof warGo==='function'){const wg=warGo;warGo=function(){const ok=wg.apply(this,arguments);if(ok)hgWar();return ok}}
function hgWar(){const w=G.war,n=w.round,me=mySide(),L=hgList().filter(h=>warSideOf(h.fac)>=0);let foe=0,ally=0;
  for(const h of L.sort((a,b)=>b.rk-a.rk)){const side=warSideOf(h.fac);
    if(side!==me&&foe<HGC.war.foe){if(hgRelK(h)==='friend'&&Math.random()<HGC.war.friendSheathe){log(`${hgNm(h)}이(가) 적진에 섰지만 당신을 보고 칼을 거두었다.`,'info');continue}
      const p={x:10+Math.random()*20,y:11+Math.random()*4};if(!walkAt(p.x,p.y))continue;const e=hgMob(h,p.x,p.y,{raid:n,aggro:true,hgLethal:1});e.d=Object.assign({},e.d,{fac:h.fac});mobs.push(e);foe++}
    else if(side===me&&me>=0&&ally<HGC.war.ally){const p={x:12+Math.random()*16,y:28+Math.random()*4};if(!walkAt(p.x,p.y))continue;const e=hgMob(h,p.x,p.y,{warAlly:n,hostile:0});e.d=Object.assign({},e.d,{fac:h.fac,hostile:0});e.aggro=false;mobs.push(e);hgR(h.id).v=clamp(hgR(h.id).v+HGC.rel.ally,-100,100);ally++}}
  if(foe||ally)log(`결전장에 후기지수가 섰다. 적진 ${foe}명, 우리 편 ${ally}명.`,'sys')}
// ---- 창 ----
function hgCard(){if(!P||!G.hugi)return'';const R=hgRank(),me=R.findIndex(x=>x.me),T=G.hgTour,c=P.hgCh,ch=c&&hugiById(c.id),y=hgYear();
  const row=(x,i)=>{if(x.me)return `<tr class="me"><td class="num">${i+1}</td><td><b class="gold">${esc(P.name)}</b>${P.hgTop?` <small class="gold">${HGC.top.title}</small>`:''}</td><td>${RANKS[realmIdx()]}</td><td>—</td><td class="num">${x.s}</td><td></td></tr>`;
    const h=x.h,k=hgRelK(h),send=me>=0&&i<me&&!G.duel&&!(P.hgSent&&P.hgSent[h.id]===y);
    return `<tr><td class="num">${i+1}</td><td>${esc(h.n)} <small class="dim">${esc(hgSect(h))} · ${FAC4N[h.fac]}${h.prod?' · 기재':''}</small></td><td>${RANKS[h.rk]}</td><td class="${k==='friend'?'good':k==='foe'||k==='nem'?'bad':''}">${HGC.rn[k]}</td><td class="num">${x.s}</td><td>${send?B('hgsend:'+h.id,'도전'):''}</td></tr>`};
  const top=R.slice(0,HGC.show).map(row);if(me>=HGC.show)top.push(row(R[me],me));
  const tour=T&&!T.done&&T.y===y?`<div class="row2"><span class="note">용봉지회 ${T.me?`· ${HGC.tour.names[T.r]||''} 상대 <b>${esc((hgTourFoe()||{}).n||'')}</b>`:'· 올해 개봉 비무대'}</span>${hgEl()?B(T.me?'hgtnext':'hgtour',T.me?'나서기':'출전',{pri:1,d:!!G.duel||REG!=='gaebong',t:REG!=='gaebong'?'개봉에서 나설 수 있다':''}):''}</div>`:T&&T.done&&T.win&&T.y===y?`<p class="note">올해 용봉지회 우승: <b>${T.win==='P'?esc(P.name):esc((hugiById(T.win)||{}).n||'')}</b></p>`:'';
  const chl=ch?`<div class="row2"><span class="note">도전장: <b>${esc(hgNm(ch))}</b> · ${Math.max(0,Math.ceil((c.until-(G.cal||0))*12))}달 안에</span>${B('hgch','받는다',{pri:1,d:!!G.duel})}${B('hgchno','거절')}</div>`:'';
  const dead=(G.hugi||[]).filter(h=>h.dead&&h.dy>=y-5).slice(-4).map(h=>`${esc(h.n)}(${h.dc==='player'?'당신의 손':esc(h.dc||'')})`);
  return `<div class="card hgc"><h4>후기지수 <small class="dim">${hgEl()?`내 순위 ${me+1}위`:`${HGC.age}세 아래만 꼽는다`}</small></h4>${chl}${tour}
    <table class="hgt"><tr><th>#</th><th>이름</th><th>경지</th><th>은원</th><th>점수</th><th></th></tr>${top.join('')}</table>
    ${dead.length?`<p class="note dim">근래 떠난 후기지수: ${dead.join(' · ')}</p>`:''}<p class="note dim">점수 = 경지·비무 전적·용봉지회·창안 (나는 명성·별호까지). 비무는 목숨을 걸지 않지만, 숙적·원수·적 세력과의 생사결은 진짜 죽음이다.</p></div>`}
{const ps=pStory;pStory=function(){const h=ps(),c=hgCard(),i=h.indexOf('<div class="card"><h4>세력의 힘</h4>');return i<0?h+c:h.slice(0,i)+c+h.slice(i)}}
function hgMeetDlg(h){const k=hgRelK(h),r=hgRv(h.id),pool=HGC.vs[k]||HGC.vs.none;
  return `<p class="note">"${esc(pool[(h.id+hgYear())%pool.length])}"</p><div class="card"><h4>${esc(h.n)} <small class="dim">${esc(hgSect(h))} · ${FAC4N[h.fac]} 후기지수${h.prod?' · 기재':''}</small></h4>
    <p class="note">${RANKS[h.rk]} · ${CLASS[h.w]?CLASS[h.w].n:h.w} · ${h.age}세 · ${HGC.rn[k]}${r.f?` · 겨룬 횟수 ${r.f} (${r.w}승 ${r.l}패)`:''}</p></div>
    <div class="row2">${B('hgbm:'+h.id,'비무를 청한다',{pri:1})}${B('hgpass','지나친다')}</div><p class="note dim">비무는 목숨을 걸지 않는다. 이기면 명성이 오르고, 지면 상대가 한 걸음 앞서 간다.</p>`}
function hgDownDlg(e){const h=hugiById(e.hgId);if(!h)return'';
  return `<p class="note">${esc(h.n)}이(가) 무릎을 꿇었다. "…베어라."</p><div class="list">
    <div class="row2"><span class="note">벤다 · 명성 +${HGC.kill.fame}, ${esc(hgSect(h))}의 원한 (같은 문파 후기지수가 원수가 된다)</span>${B('hgkill','벤다',{pri:1})}</div>
    <div class="row2"><span class="note">무공을 폐한다 · 다시는 강호에 서지 못한다</span>${B('hgcrip','폐한다')}</div>
    <div class="row2"><span class="note">살려 준다 · 선업, 목숨 빚 (벗에 가까워진다)</span>${B('hgspare','살려 준다')}</div></div>`}
hook('npcDlg',c=>{const n=c.n;if(n.id==='hgmeet'){const h=hugiById(n.hgm);c.html=h?hgMeetDlg(h):'<p class="note">떠났다.</p>'}else if(n.id==='hgdown')c.html=hgDownDlg(n.hgE)});
hook('sectAct',c=>{const{a,x}=c;if(!/^hg/.test(a))return;c.done=true;c.r=true;const y=hgYear();
  if(a==='hgbm'){hgMeetH=null;hgDuel(hugiById(+x),'bm');return}
  if(a==='hgpass'){hgMeetH=null;closePanels();return}
  if(a==='hgch'){const h=P.hgCh&&hugiById(P.hgCh.id);if(h)hgDuel(h,'ch');return}
  if(a==='hgchno'){if(P.hgCh)P.hgCh.until=-1;return}
  if(a==='hgsend'){const h=hugiById(+x);if(!h)return;(P.hgSent=P.hgSent||{})[h.id]=y;log(`${hgNm(h)}에게 도전장을 보냈다. 그가 찾아왔다.`,'sys');hgDuel(h,'ch');return}
  if(a==='hgtour'){hgTourJoin();return}
  if(a==='hgtnext'){hgTourNext();return}
  if(a==='hgkill'||a==='hgcrip'||a==='hgspare'){const e=panelArg&&panelArg.hgE;closePanels();hgFinish(e,a.slice(2))}});
// 쓰러뜨림 창을 고르지 않고 닫으면 살려 준 것으로
hook('tick',()=>{if(!P||!playing||panel==='npc')return;for(const e of mobs)if(e.hgDown&&e.hp>0){hgFinish(e,'spare');break}});

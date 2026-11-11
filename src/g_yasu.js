// ================= 야수궁 맹수 (v252, 사용자 2026-11-11) =================
// "남만야수궁은 호랑이나 곰 늑대 등의 맹수를 길들여서 싸우는 건 어때? 야수에게도 경지를 적용시켜서 궁주가 데리고 다니는 건 초절정 호랑이 등 본인의 등급보다 한 단계 낮게"
// - 야수궁 제자는 본산(어느 맵이든)의 문파 창 '맹수 우리'에서 맹수 한 마리를 받는다. 직위가 오를수록 고를 수 있는 종이 는다 (YASU.sp[종].rank).
// - 맹수 경지 = 주인 경지 - 1. 주인이 오르면 따라 오른다. 레벨·장비·숙련이 없어 힘은 경지로만 정한다 (위계: 경지 > 무공 등급 > 숙련).
// - 평타는 같은 경지 졸개를 혼자 killS초에 잡는 세기, 경지 차 ±25%를 주고받는다 (allyHit·allyHurt 훅, g_life.js).
// - 맹수 기술은 주인의 내공을 쓴다 (내공은 저절로 차지 않으니 무공 한 번 덜 쓰는 값). 쓰러지면 우리로 돌아가 rest해 동안 추스른다. 폐관 호법은 못 된다.
// - 적 야수궁: 직위 npc.rank 이상 무인과 궁주가 한 단계 아래 맹수를 데리고 나온다. 문파 인원에 세지 않고 전리품이 없다.
const YASU=GD.YASU;
const ybRealmOf=r=>clamp((r|0)-1,0,6);
const ybRealm=()=>ybRealmOf(realmIdx());
// 그 경지 졸개(보통 난이도)의 생명: scaleMob의 'n' 등급
function ybFoeHp(r){const h=STD[r][1],g=GD.GROW||{};return h*TIER.n.h*(g.hs?g.hs[r]:1)}
// 내 맹수 수치: 생명은 플레이어 기준(몹 공격을 받으니), 평타는 몹 생명 기준(몹을 치니)
function ybStat(sp,r){const s=YASU.sp[sp];return{realm:r,hp:Math.round(STD[r][1]*YASU.hpK*s.h),atk:Math.max(1,Math.round(ybFoeHp(r)/YASU.killS*s.cd*s.a)),cd:s.cd,sp:s.spd}}
const ybOut=()=>allies.find(a=>a.kind==='yasu');
const ybIn=()=>!!(P&&P.sect===YASU.sect);
const ybAtHq=()=>ybIn()&&sectRegs(YASU.sect).includes(REG);
const ybRankOk=sp=>(P.leader===YASU.sect?99:rankIdx(YASU.sect))>=YASU.sp[sp].rank;
function ybMk(){const y=P.yb,st=ybStat(y.sp,ybRealm()),d={...MOBS[y.sp]};d.size=(d.size||1)*YASU.size;
  const a={kind:'yasu',k:y.sp,d,name:y.n||y.sp,x:P.x+.8,y:P.y+.4,hp:st.hp,maxHp:st.hp,atk:st.atk,def:0,realm:st.realm,acd:st.cd,sp:st.sp,reach:1.2,mode:'follow',cd:0,hit:0,fx:1,fy:1,moving:false,bob:Math.random()*6,swing:0,skT:2};
  if(y.hp!=null)a.hp=Math.max(1,Math.round(st.hp*y.hp));if(!walkAt(a.x,a.y)){a.x=P.x;a.y=P.y}return a}
function ybDrop(a){const i=allies.indexOf(a);if(i>=0)allies.splice(i,1);if(a)fx.push({t:'puff',x:a.x,y:a.y,life:.6})}
// 있어야 할 때 곁에 세우고, 아닐 때 거둔다. 주인 경지가 바뀌면 수치를 다시 잡는다
function ybSync(){if(!P)return;const a=ybOut(),y=P.yb;
  if(y&&!ybIn()){delete P.yb;if(a)ybDrop(a);log(`${y.n||y.sp}을(를) 야수궁 맹수 우리에 두고 왔습니다.`,'sys');return}
  if(!y){if(a)ybDrop(a);return}
  if(y.rest&&G.cal<y.rest){if(a)ybDrop(a);return}
  if(y.rest){delete y.rest;y.hp=.5;log(`몸을 추스른 ${y.n||y.sp}이(가) 우리에서 달려와 곁에 섰습니다.`,'xp')}
  if(!a){if(P.hp>0&&!G.duel)allies.push(ybMk());return}
  const r=ybRealm();if(a.realm!==r){const st=ybStat(y.sp,r),f=a.hp/a.maxHp;Object.assign(a,{realm:r,maxHp:st.hp,hp:Math.max(1,Math.round(st.hp*f)),atk:st.atk});
    if(r>0)log(`${a.name}도 ${RANKS[r]}의 기세를 띱니다.`,'xp')}
  y.hp=+(a.hp/a.maxHp).toFixed(3)}
{let t=0;hook('tick',dt=>{t-=dt;if(t>0)return;t=.5;ybSync();ybNpcTick()})}
hook('afterLoad',()=>{allies=allies.filter(a=>a.kind!=='yasu');ybSync()});
hook('duelStart',()=>{const a=ybOut();if(a)ybDrop(a)});   // 비무에는 데려가지 않는다 (끝나면 ybSync가 다시 세운다)
// 우리에서 받기·돌려놓기·기술 켜고 끄기 (문파 창)
function ybWhy(sp){
  if(!ybIn())return'야수궁 제자만 맹수를 받는다';
  if(!ybAtHq())return'본산의 맹수 우리 앞에서 받는다';
  if(sp&&!ybRankOk(sp))return`${rankName(YASU.sect,YASU.sp[sp].rank)} 이상이어야 ${sp}을(를) 내준다`;
  if(P.yb&&P.yb.rest&&G.cal<P.yb.rest)return'맹수가 우리에서 몸을 추스르는 중이다';
  return''}
function ybTake(sp){const why=ybWhy(sp);if(why){log(why+'.','info');return false}
  const old=ybOut();if(old)ybDrop(old);P.yb={sp,n:sp,sk:P.yb?P.yb.sk:1};ybSync();const a=ybOut();if(a)fx.push({t:'lvl',x:a.x,y:a.y,life:1.2});
  log(`맹수 우리에서 ${sp}을(를) 데려왔습니다. ${RANKS[ybRealm()]} 경지로 곁을 지킵니다.`,'xp');return true}
function ybBack(){if(!P.yb)return;if(!ybAtHq()){log('본산의 맹수 우리 앞에서 돌려놓는다.','info');return}const a=ybOut();if(a)ybDrop(a);log(`${P.yb.n||P.yb.sp}을(를) 우리에 돌려놓았습니다.`,'sys');delete P.yb}
hook('sectAct',c=>{const a=c.a||'';if(!a.startsWith('yb'))return;c.done=true;c.r=true;
  if(a.startsWith('ybtake:'))ybTake(a.slice(7));else if(a==='ybback')ybBack();else if(a==='ybsk'&&P.yb)P.yb.sk=P.yb.sk?0:1;renderOpen()});
hook('allyDown',a=>{if(a.kind!=='yasu'||!P.yb)return;P.yb.rest=G.cal+YASU.rest;P.yb.hp=1;log(`${a.name}이(가) 크게 다쳐 우리로 돌아갔습니다. 반 해쯤 몸을 추스릅니다.`,'dmg')});
// 경지 차 ±25%: 맹수가 칠 때와 맞을 때
hook('allyHit',c=>{if(c.a.kind!=='yasu')return;c.dm*=rMul(rDiff(c.a.realm,mobRealm(c.tg)))});
hook('allyHurt',c=>{if(c.a.kind!=='yasu'||!c.src||!c.src.d)return;c.dm*=rMul(rDiff(mobRealm(c.src),c.a.realm))});
// 맹수 기술: 싸움 중 cd초마다 주인 내공을 내서 쓴다
const ybSkQi=()=>Math.max(1,Math.round(P.maxQi*YASU.skill.qi/100));
function ybTg(a){const t=P.target&&P.target.hp>0&&!P.target.d.villager&&!peaceful(P.target)&&dist(P.target,a)<9?P.target:null;if(t)return t;
  for(const m of mobs)if(m.hp>0&&m.aggro&&!m.d.villager&&!peaceful(m)&&dist(m,P)<5)return m;return null}
hook('allyTick',(a,dt)=>{if(a.kind!=='yasu')return;a.skT=(a.skT||0)-dt;
  if(a.skT>0||G.duel||!P.yb||!P.yb.sk||a.mode==='wait')return;const tg=ybTg(a);if(!tg)return;
  const s=YASU.sp[a.k].skill,d=dist(a,tg),rng=s.leap||a.reach+.2;if(d>rng)return;
  const q=ybSkQi();if(P.qi<q){a.skT=1;return}
  P.qi-=q;a.skT=YASU.skill.cd;a.cd=Math.max(a.cd,a.acd||1.1);a.swing=.24;
  if(s.leap&&d>a.reach){const l=d||1;a.x=tg.x-(tg.x-a.x)/l*.8;a.y=tg.y-(tg.y-a.y)/l*.8;if(!walkAt(a.x,a.y)){a.x=tg.x;a.y=tg.y}fx.push({t:'dust',x:a.x,y:a.y,life:.45})}
  const hit=e=>{const c={a,tg:e,dm:Math.max(1,a.atk*s.m*(.9+Math.random()*.2)-e.def)};runHooks('allyHit',c);damage(e,Math.max(1,Math.round(c.dm)),s.kb||.2,s.stun||0,a);
    if(s.bleed){e.burn=Math.max(e.burn||0,s.bleed);e.burnD=Math.max(1,c.dm*.08);e.burnC='220,30,45'}if(s.slow)e.slow=Math.max(e.slow||0,s.slow);if(!e.tgt||Math.random()<.5)e.tgt=a};
  hit(tg);if(s.r)for(const m of mobs)if(m!==tg&&m.hp>0&&m.aggro&&!peaceful(m)&&!m.d.villager&&dist(m,tg)<s.r)hit(m);
  if(s.taunt)for(const m of mobs)if(m.hp>0&&m.aggro&&!peaceful(m)&&dist(m,a)<s.taunt){m.tgt=a;m.tauntT=time+s.tauntT}
  addText(a.x,a.y-.5,s.n,'#f0c070');a.fx=(tg.x-a.x)/(d||1);a.fy=(tg.y-a.y)/(d||1)});
// 문파 창 카드 (g_sect.js membership)
function ybHtml(s){if(!s||s.id!==YASU.sect||P.sect!==s.id)return'';const y=P.yb,a=ybOut(),r=ybRealm(),here=ybAtHq();
  const rest=y&&y.rest&&G.cal<y.rest?Math.max(1,Math.ceil((y.rest-G.cal)*12)):0;
  const now=y?`<p class="note"><b>${esc(y.n||y.sp)}</b> · ${RANKS[r]} 경지 (주인보다 한 단계 아래) · ${YASU.sp[y.sp].role}.${a?` 생명 ${Math.ceil(a.hp)}/${a.maxHp}`:''}${rest?` <b class="bad">우리에서 추스르는 중 · ${rest}달</b>`:''}</p>
    <p class="dim">기술 ${YASU.sp[y.sp].skill.n}: 싸움 중 ${YASU.skill.cd}초마다 내 내공 ${ybSkQi()}를 쓴다.</p>`:'<p class="note">맹수 우리에서 짐승 한 마리를 받아 함께 싸운다. 경지는 내 경지보다 한 단계 아래로 따라 오르고, 쓰러지면 반 해 동안 우리에서 추스른다.</p>';
  const rows=Object.keys(YASU.sp).map(sp=>{const st=ybStat(sp,r),why=ybWhy(sp),cur=y&&y.sp===sp;
    return `<div class="it"><div><b>${sp}</b> <small class="dim">${rankName(s.id,YASU.sp[sp].rank)} 이상</small><span>${YASU.sp[sp].role} · 생명 ${st.hp}</span></div>
      <div class="ib">${cur?'<small class="dim">데리고 있음</small>':B('ybtake:'+sp,'데려가기',{d:!!why})}</div></div>`}).join('');
  return `<div class="card"><h4>맹수 우리 ${here?'':'<small class="dim">본산에서 고른다</small>'}</h4>${now}<div class="list">${rows}</div>
    ${y?`<div class="row2">${B('ybsk',y.sk?'기술 끄기':'기술 켜기')}${here?B('ybback','우리에 돌려놓기'):''}</div>`:''}</div>`}

// ---- 적 야수궁: 직위 높은 무인과 궁주가 맹수를 데리고 나온다 ----
function ybNpcStat(e,sp,r){const s=YASU.sp[sp],[a,h]=STD[r],t=TIER.e,g=GD.GROW||{h:0,a:0};
  e.realm=r;e.maxHp=e.hp=Math.max(1,Math.round(h*t.h*(g.hs?g.hs[r]:1)*YASU.npc.h*s.h));e.atk=Math.max(1,Math.round(a*t.a*(1+(g.a||0)*r)*s.a));e.def=Math.round(1+r*1.5);
  runHooks('mobScaled',e);return e}
function ybNpcBeast(owner,sp,x,y){const base=MOBS[sp];if(!base)return null;
  const e=mkMob(sp,x,y,{...base});e.d={...base,fac:owner.d?owner.d.fac:base.fac,hostile:0,neutral:0,passive:0,size:(base.size||1)*YASU.size};delete e.d.tame;
  e.name=`야수궁 ${sp}`;e.noLoot=1;e.ybOwner=owner;e.bsect=YASU.sect;ybNpcStat(e,sp,ybRealmOf(owner.realm??mobRealm(owner)));if(!walkAt(e.x,e.y)){e.x=owner.x;e.y=owner.y}e.home={x:e.x,y:e.y};mobs.push(e);return e}
function ybNpcTick(){if(!P||!REG)return;
  for(const o of mobs.slice()){if(o.ybDone||o.hp<=0||o.sect!==YASU.sect||!o.d||!o.d.fac)continue;
    o.ybDone=1;if(!(o.master||(o.rank||0)>=YASU.npc.rank))continue;
    const L=YASU.npc.pick,sp=o.master?YASU.npc.boss:L[Math.floor(Math.random()*L.length)];ybNpcBeast(o,sp,o.x+.7,o.y+.4)}
  // 전각 안의 궁주 NPC(우두머리로 나서지 않았을 때): 곁에 맹수가 엎드려 있다
  const R=REGION();for(const n of(R&&R.npcs)||[])if(n.hq===YASU.sect&&!mobs.some(m=>m.ybNpc===n)){const o={x:n.x,y:n.y,realm:4,d:{fac:alFac(SECTS[YASU.sect].al)}};const e=ybNpcBeast(o,YASU.npc.boss,n.x+1,n.y+.5);if(e){e.ybNpc=n;e.ybOwner=null;e.home={x:e.x,y:e.y}}}}
hook('mobAct',c=>{const e=c.e,o=e.ybOwner;if(!o)return;
  if(o.hp<=0||!mobs.includes(o)){e.ybOwner=null;return}
  if(e.aggro&&(!e.tgt||e.tgt===P)&&!mobFoeP(o)){e.aggro=false;e.tgt=null}   // 주인이 덤비지 않는 상대에게는 덤비지 않는다
  if(!e.aggro&&o.aggro&&(o.tgt?o.tgt.hp>0:mobFoeP(o))){e.aggro=true;e.tgt=o.tgt&&o.tgt.hp>0?o.tgt:null}
  if(e.aggro)return;e.home={x:o.x,y:o.y};if(dist(e,o)>2.2){chase(e,o,c.dt,e.sp);c.stop=true}});

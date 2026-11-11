// ================= 야수궁 맹수 (v252, 사용자 2026-11-11) =================
// "남만야수궁은 호랑이나 곰 늑대 등의 맹수를 길들여서 싸우는 건 어때? 야수에게도 경지를 적용시켜서 궁주가 데리고 다니는 건 초절정 호랑이 등 본인의 등급보다 한 단계 낮게"
// "맹수와 주인을 묶어 1로 보고 6:4로 나눠서 가지게 하면 어때? 플레이어가 입문해도 이 규칙은 동일해" / "나중에 컨텐츠 확장에서 문파가 클래스 개념이 될 거야"
// - 문파 규칙(클래스)의 첫 사례: 주인과 맹수는 한 사람 몫. 맹수가 곁에 있으면 주인이 주는 피해·최대 생명은 split.own,
//   맹수는 split.beast. 주인이 주는 피해의 beast/own만큼이 맹수 몫(a.pool)으로 쌓이고 맹수가 물 때 낸다 (dmgOut·allyHit 훅).
//   그래서 무공 등급·숙련·경지·장비가 모두 그대로 따라오고, 둘의 합은 혼자일 때와 같다. 맹수 생명 = 주인 본래 최대 생명 × beast.
// - 맹수 경지는 이름만 주인보다 한 단계 아래. 맞을 때 경지 차·난이도·호신은 주인 것으로 셈한다 (allyHurt).
// - 야수궁 제자는 본산(어느 맵이든)의 문파 창 '맹수 우리'에서 한 마리를 받는다. 직위가 오를수록 고를 수 있는 종이 는다 (YASU.sp[종].rank).
// - 맹수 기술: cd초마다 쌓인 몫을 한꺼번에 내며 종마다 효과(출혈·돌진·도발·덮치기). 피해는 더하지 않고 내공도 쓰지 않는다.
// - 쓰러지면 우리로 돌아가 rest해 동안 추스른다 (주인은 몫을 되찾지만 남은 생명은 그대로). 폐관 호법은 못 된다.
// - 적 야수궁: 직위 npc.rank 이상 무인과 궁주도 같은 6:4. 맹수는 문파 인원에 세지 않고 전리품이 없다.
const YASU=GD.YASU,YS=YASU.split;
const ybRealmOf=r=>clamp((r|0)-1,0,6);
const ybRealm=()=>ybRealmOf(realmIdx());
const ybRestTxt=()=>{const m=Math.round(YASU.rest*12);return m>=12?`${Math.round(m/12)}해쯤`:m>=6&&m%6===0?'반 해쯤':`${Math.max(1,m)}달쯤`};
const ybOut=()=>allies.find(a=>a.kind==='yasu'&&a.hp>0);
const ybIn=()=>!!(P&&P.sect===YASU.sect);
const ybAtHq=()=>ybIn()&&sectRegs(YASU.sect).includes(REG);
const ybRankOk=sp=>(P.leader===YASU.sect?99:rankIdx(YASU.sect))>=YASU.sp[sp].rank;
const ybHpOf=()=>Math.max(1,Math.round((P.ybHp0||P.maxHp/YS.own)*YS.beast));
// 맹수가 곁에 있으면 주인 최대 생명은 own (본래 값은 P.ybHp0)
hook('recalc',()=>{if(!P)return;if(ybOut()){P.ybHp0=P.maxHp;P.maxHp=Math.max(1,Math.round(P.maxHp*YS.own));P.hp=Math.min(P.hp,P.maxHp)}else P.ybHp0=0});
function ybMk(){const y=P.yb,s=YASU.sp[y.sp],d={...MOBS[y.sp]};d.size=(d.size||1)*YASU.size;
  const a={kind:'yasu',k:y.sp,d,name:y.n||y.sp,x:P.x+.8,y:P.y+.4,hp:1,maxHp:1,atk:0,def:0,realm:ybRealm(),acd:s.cd,sp:s.spd,reach:1.2,mode:'follow',cd:0,hit:0,fx:1,fy:1,moving:false,bob:Math.random()*6,swing:0,skT:2,pool:0};
  if(!walkAt(a.x,a.y)){a.x=P.x;a.y=P.y}return a}
function ybDrop(a){const i=allies.indexOf(a);if(i>=0)allies.splice(i,1);if(a)fx.push({t:'puff',x:a.x,y:a.y,life:.6});recalc()}
// 맹수 생명을 주인 몫에 맞춘다 (주인 최대 생명이 바뀌면 비율을 지켜 따라간다)
function ybFit(a,f){const m=ybHpOf();a.hp=Math.max(1,Math.round(m*(f??a.hp/a.maxHp)));a.maxHp=m}
// 있어야 할 때 곁에 세우고, 아닐 때 거둔다
function ybSync(){if(!P)return;const a=ybOut(),y=P.yb;
  if(y&&!ybIn()){delete P.yb;if(a)ybDrop(a);log(`${y.n||y.sp}을(를) 야수궁 맹수 우리에 두고 왔습니다.`,'sys');return}
  if(!y){if(a)ybDrop(a);return}
  if(y.rest&&G.cal<y.rest){if(a)ybDrop(a);return}
  if(y.rest){delete y.rest;y.hp=.5;log(`몸을 추스른 ${y.n||y.sp}이(가) 우리에서 달려와 곁에 섰습니다.`,'xp')}
  if(!a){if(P.hp<=0||G.duel)return;const b=ybMk();allies.push(b);recalc();ybFit(b,y.hp??1);return}
  const r=ybRealm();if(a.realm!==r){a.realm=r;if(r>0)log(`${a.name}도 ${RANKS[r]}의 기세를 띱니다.`,'xp')}
  if(a.maxHp!==ybHpOf())ybFit(a);y.hp=+(a.hp/a.maxHp).toFixed(3)}
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
  log(`맹수 우리에서 ${sp}을(를) 데려왔습니다. 이제 둘이 한 사람 몫을 ${YS.own*10}:${YS.beast*10}로 나눠 싸웁니다.`,'xp');return true}
function ybBack(){if(!P.yb)return;if(!ybAtHq()){log('본산의 맹수 우리 앞에서 돌려놓는다.','info');return}const a=ybOut();delete P.yb;if(a)ybDrop(a);log('맹수를 우리에 돌려놓았습니다.','sys')}
hook('sectAct',c=>{const a=c.a||'';if(!a.startsWith('yb'))return;c.done=true;c.r=true;
  if(a.startsWith('ybtake:'))ybTake(a.slice(7));else if(a==='ybback')ybBack();else if(a==='ybsk'&&P.yb)P.yb.sk=P.yb.sk?0:1;renderOpen()});
hook('allyDown',a=>{if(a.kind!=='yasu'||!P.yb)return;P.yb.rest=G.cal+YASU.rest;P.yb.hp=1;recalc();log(`${a.name}이(가) 크게 다쳐 우리로 돌아갔습니다. ${ybRestTxt()} 몸을 추스릅니다.`,'dmg')});
// ---- 6:4 피해: 내가 주는 피해는 own, 나머지 몫은 맹수에게 쌓인다 ----
const ybMine=f=>f===P||(!!f&&!f.d&&!f.kind);
// 맹수가 그 적 곁(near칸 안)에 없으면 몫을 쓸 수 없으니 나누지 않는다 (멀리서 쏘거나 맹수가 다른 데 있으면 주인이 다 친다)
hook('dmgOut',c=>{if(!P||!ybMine(c.from)||c.e.duel)return;const a=ybOut();if(!a||a.mode==='wait'||dist(a,c.e)>YASU.pool.near)return;
  const solo=c.d;c.d=Math.max(1,Math.round(solo*YS.own));a.pool=(a.pool||0)+solo*YS.beast});
// 맹수가 물면 쌓인 몫을 낸다 (경지 차·방어는 주인이 칠 때 이미 셈했다)
hook('allyHit',c=>{if(c.a.kind!=='yasu')return;c.dm=c.a.pool||0;c.a.pool=0;c.noAggro=true});   // 물어도 적의 눈길을 끌지 않는다 (끄는 건 곰의 도발뿐)
// 맞을 때는 주인처럼: 회피·경지 차는 주인 것으로, 난이도 받는 피해, 몸 방어
hook('allyHurt',c=>{if(c.a.kind!=='yasu'||!P)return;if(c.src&&c.src.d&&Math.random()<clamp((hmv()-(c.src.hm||0))/200+.06,.03,.5)){c.miss=true;return}   // 회피도 주인의 것
  if(c.src&&c.src.d){c.dm*=rMul(rDiff(mobRealm(c.src),realmIdx()));if(typeof diffMul==='function')c.dm*=diffMul('taken')}c.dm=Math.max(1,Math.round(c.dm*(1-guard())))});
// 맹수 기술: 싸움 중 cd초마다 쌓인 몫을 한꺼번에 내며 종마다 효과가 붙는다 (피해는 더하지 않는다)
function ybTg(a){const t=P.target&&P.target.hp>0&&!P.target.d.villager&&!peaceful(P.target)&&dist(P.target,a)<9?P.target:null;if(t)return t;
  for(const m of mobs)if(m.hp>0&&m.aggro&&!m.d.villager&&!peaceful(m)&&dist(m,P)<5)return m;return null}
hook('allyTick',(a,dt)=>{if(a.kind!=='yasu')return;a.skT=(a.skT||0)-dt;const tg=G.duel||a.mode==='wait'?null:ybTg(a);
  if(!tg){a.pool=(a.pool||0)*Math.max(0,1-YASU.pool.decay*dt);return}
  if(a.skT>0||!P.yb||!P.yb.sk)return;
  const s=YASU.sp[a.k].skill,d=dist(a,tg),rng=s.leap||a.reach+.2;if(d>rng)return;
  a.skT=YASU.skill.cd;a.cd=Math.max(a.cd,a.acd||1.1);a.swing=.24;
  if(s.leap&&d>a.reach){const l=d||1;a.x=tg.x-(tg.x-a.x)/l*.8;a.y=tg.y-(tg.y-a.y)/l*.8;if(!walkAt(a.x,a.y)){a.x=tg.x;a.y=tg.y}fx.push({t:'dust',x:a.x,y:a.y,life:.45})}
  const tgs=[tg];if(s.r)for(const m of mobs)if(m!==tg&&m.hp>0&&m.aggro&&!peaceful(m)&&!m.d.villager&&dist(m,tg)<s.r)tgs.push(m);
  const each=(a.pool||0)/tgs.length;a.pool=0;   // 쌓인 몫을 맞은 상대들이 나눠 받는다
  for(const e of tgs){let now=each;if(s.bleed){now=each/2;e.burn=Math.max(e.burn||0,s.bleed);e.burnD=Math.max(e.burnD||0,each/2/s.bleed);e.burnC='220,30,45'}   // 출혈: 몫의 절반을 나눠 흘린다
    damage(e,Math.max(1,Math.round(now)),s.kb||.2,s.stun||0,a);if(s.slow)e.slow=Math.max(e.slow||0,s.slow)}
  if(s.taunt)for(const m of mobs)if(m.hp>0&&m.aggro&&!peaceful(m)&&dist(m,a)<s.taunt){m.tgt=a;m.tauntT=time+s.tauntT}
  addText(a.x,a.y-.5,s.n,'#f0c070');a.fx=(tg.x-a.x)/(d||1);a.fy=(tg.y-a.y)/(d||1)});
// 문파 창 카드 (g_sect.js membership)
function ybHtml(s){if(!s||s.id!==YASU.sect||P.sect!==s.id)return'';const y=P.yb,a=ybOut(),r=ybRealm(),here=ybAtHq(),o=YS.own*10,b=YS.beast*10;
  const rest=y&&y.rest&&G.cal<y.rest?Math.max(1,Math.ceil((y.rest-G.cal)*12)):0;
  const rule=`주인과 맹수는 한 사람 몫이다. 맹수가 곁에 있으면 내가 주는 피해와 최대 생명이 ${o}할, 맹수가 ${b}할을 갖는다. 내가 친 만큼 맹수 몫이 쌓이고 맹수가 물 때 나간다. 쓰러지면 ${ybRestTxt()} 우리에서 추스른다.`;
  const now=y?`<p class="note"><b>${esc(y.n||y.sp)}</b> · ${RANKS[r]}의 기세 · ${YASU.sp[y.sp].role}.${a?` 생명 ${Math.ceil(a.hp)}/${a.maxHp}`:''}${rest?` <b class="bad">우리에서 추스르는 중 · ${rest}달</b>`:''}</p>
    <p class="dim">기술 ${YASU.sp[y.sp].skill.n}: 싸움 중 ${YASU.skill.cd}초마다 쌓인 몫을 한꺼번에 낸다. ${rule}</p>`:`<p class="note">${rule}</p>`;
  const rows=Object.keys(YASU.sp).map(sp=>{const why=ybWhy(sp),cur=y&&y.sp===sp;
    return `<div class="it"><div><b>${sp}</b> <small class="dim">${rankName(s.id,YASU.sp[sp].rank)} 이상</small><span>${YASU.sp[sp].role} · 기술 ${YASU.sp[sp].skill.n}</span></div>
      <div class="ib">${cur?'<small class="dim">데리고 있음</small>':B('ybtake:'+sp,'데려가기',{d:!!why})}</div></div>`}).join('');
  return `<div class="card"><h4>맹수 우리 ${here?'':'<small class="dim">본산에서 고른다</small>'}</h4>${now}<div class="list">${rows}</div>
    ${y?`<div class="row2">${B('ybsk',y.sk?'기술 끄기':'기술 켜기')}${here?B('ybback','우리에 돌려놓기'):''}</div>`:''}</div>`}

// ---- 적 야수궁: 직위 높은 무인과 궁주가 맹수를 데리고 나온다. 같은 6:4 ----
function ybNpcBeast(owner,sp,x,y,virt){const base=MOBS[sp];if(!base)return null;
  const e=mkMob(sp,x,y,{...base});e.d={...base,fac:owner.d?owner.d.fac:base.fac,hostile:0,neutral:0,passive:0,size:(base.size||1)*YASU.size};delete e.d.tame;
  e.name=`야수궁 ${sp}`;e.noLoot=1;e.ybOwner=virt?null:owner;e.bsect=YASU.sect;e.realm=owner.realm??mobRealm(owner);e.ybRk=ybRealmOf(e.realm);
  e.maxHp=e.hp=Math.max(1,Math.round(owner.maxHp*YS.beast));e.atk=Math.max(1,Math.round(owner.atk*YS.beast));e.def=owner.def||0;e.hm=owner.hm||e.hm;e.reach=Math.max(e.reach,1.2);
  if(!virt){owner.ybHp0=owner.maxHp;owner.ybAtk0=owner.atk;owner.maxHp=Math.max(1,Math.round(owner.maxHp*YS.own));owner.hp=Math.max(1,Math.round(owner.hp*YS.own));owner.atk=Math.max(1,Math.round(owner.atk*YS.own));owner.ybPet=e}
  if(!walkAt(e.x,e.y)){e.x=owner.x;e.y=owner.y}e.home={x:e.x,y:e.y};mobs.push(e);return e}
// 맹수가 쓰러지면 주인은 공격·최대 생명을 되찾는다 (남은 생명은 그대로)
hook('kill',e=>{const o=e.ybOwner;if(!o||o.hp<=0||o.ybPet!==e)return;o.ybPet=null;if(o.ybAtk0)o.atk=o.ybAtk0;if(o.ybHp0)o.maxHp=o.ybHp0});
function ybNpcTick(){if(!P||!REG)return;
  for(const o of mobs.slice()){if(o.ybDone||o.hp<=0||o.sect!==YASU.sect||!o.d||!o.d.fac)continue;
    o.ybDone=1;if(!(o.master||(o.rank||0)>=YASU.npc.rank))continue;
    const L=YASU.npc.pick,sp=o.master?YASU.npc.boss:L[Math.floor(Math.random()*L.length)];ybNpcBeast(o,sp,o.x+.7,o.y+.4)}
  // 전각 안의 궁주 NPC(우두머리로 나서지 않았을 때): 곁에 맹수가 엎드려 있다. 궁주가 우두머리로 나섰을 때의 몫(beast)으로 센다
  const R=REGION();for(const n of(R&&R.npcs)||[])if(n.hq===YASU.sect&&!mobs.some(m=>m.ybNpc===n)){
    const st=eliteStat(4),PO=typeof POP!=='undefined'?POP:{},o={x:n.x,y:n.y,realm:4,maxHp:st.hp*(PO.masterHp||1),atk:st.atk*(PO.masterAtk||1),hm:st.hm,def:7,d:{fac:alFac(SECTS[YASU.sect].al)}};
    if(typeof diffMul==='function'){o.maxHp*=diffMul('mobHp');o.atk*=diffMul('mobAtk')}
    const e=ybNpcBeast(o,YASU.npc.boss,n.x+1,n.y+.5,true);if(e)e.ybNpc=n}}
hook('mobAct',c=>{const e=c.e,o=e.ybOwner;if(!o)return;
  if(o.hp<=0||!mobs.includes(o)){e.ybOwner=null;return}
  if(e.aggro&&(!e.tgt||e.tgt===P)&&!mobFoeP(o)){e.aggro=false;e.tgt=null}   // 주인이 덤비지 않는 상대에게는 덤비지 않는다
  if(!e.aggro&&o.aggro&&(o.tgt?o.tgt.hp>0:mobFoeP(o))){e.aggro=true;e.tgt=o.tgt&&o.tgt.hp>0?o.tgt:null}
  if(e.aggro)return;e.home={x:o.x,y:o.y};if(dist(e,o)>2.2){chase(e,o,c.dt,e.sp);c.stop=true}});
// 적은 주인과 맹수 중 남은 생명 비율대로 노린다 (2~3초마다 다시 고름). 둘이 맞는 몫이 생명 몫을 따라가야 합이 혼자일 때와 같다. 곰의 도발 중에는 곰
hook('mobAct',c=>{const e=c.e;if(!e.aggro||!P||!P.yb||e.ybOwner||e.duel)return;const a=ybOut();if(!a||a.mode==='wait')return;
  if(e.tgt&&e.tgt!==P&&e.tgt!==a)return;if(e.tauntT>time){e.tgt=a;return}
  e.ybRe=(e.ybRe||0)-c.dt;if(e.ybRe>0)return;e.ybRe=2+Math.random();
  e.tgt=dist(e,a)<8&&Math.random()<a.hp/(a.hp+Math.max(1,P.hp))?a:null});

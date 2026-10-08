// ================= state =================
const TW=64,TH=32,MID=20;
let N=40;   // 지금 지역의 격자 크기. 지역마다 다르다 (REGIONS[..].size, 기본 40)
let map,objs,lamps,builds,rails,ground,P=null,mobs=[],allies=[],fx=[],texts=[],embers=[],drops=[],eprojs=[],S=1,W=0,H=0,cam={x:0,y:0},keys={},time=0,shake=0,tod=.3;
let paused=true,playing=false;
const ARTS=buildArts();
// G: what outlives a single life (lineage, house, history)
let G={lives:0,history:[],tombs:[],house:null,storage:{mats:{},bag:[]},cal:0,weather:'맑음',wT:20,bossT:{},giyeon:null,gT:120,wisCarry:0,nextStatus:1,bonusVit:0,heir:null,family:null};
let itemId=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const R1=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

function newLife(o){
  const sideD=SIDES[o.side],gg=GEUNGOL[o.side][o.gg],st={str:gg[1],end:gg[2],agi:gg[3],qi:gg[4]},stat=STATUS[o.status];
  P={name:o.name,side:o.side,gg:o.gg,base:{...st},st,wis:o.wis,status:o.status,age:13,life:0,vit:stat.vit,vitInst:splitVit(o.bonusVit||0),vitCarry:0,silver:stat.silver+(o.silver||0),fame:0,good:0,evil:0,
    qiN:0,qiBonus:0,dhw:0,arts:{base:{p:0,f:[true,false,false]}},cur:'base',mode:'auto',bag:[],eq:{weapon:null,armor:null,acc:null,boots:null},mats:{금창약:3,소환단:1},
    jobs:{대장:{on:0,lv:0},직물:{on:0,lv:0},요리:{on:0,lv:0},약재:{on:0,lv:0}},sp:{암기:0,독공:0,점혈:0},sg:{name:null,pages:{}},sect:null,sectName:null,merit:{},mtot:{},spouse:null,children:[],quests:[],
    duel:0,taught:-1,chest:0,kills:0,bosses:0,startCls:o.cls,lifeNo:G.lives+1,feats:[],
    x:20.5,y:20.5,hp:1,maxHp:1,qi:1,maxQi:1,fx:1,fy:1,path:null,target:null,fcd:[0,0,0,0,0,0],fmax:[1,1,1,1,1,1],gcd:0,bcd:0,ucd:0,scd:{암기:0,독공:0,점혈:0,신공:0},
    swing:0,swingMax:.24,inv:0,hit:0,lastHit:9,moving:false,repath:0,flash:0,flashCol:'255,255,255',jump:0,satk:0,satkMax:.34,sset:[13],sj:0,hc:0,palm:0,
    chain:{last:-1,t:-9,sum:0,n:0},buff:{atk:0,hm:0,crit:0,ult:0},poison:0,chan:null,ride:null,run:false,medit:false};
  P.life=Math.round(58+P.st.end*.7+Math.random()*8);
  P.mats.비도=0;
  // the starting weapon and the first 비급 of that class's 화 무공
  const c=o.cls;if(c!=='권')P.eq.weapon=mkWeapon(c,o.status>=2?1.15:.85,0);
  P.bag.push(mkBook(o.side+c+'0',0));if(o.status>=2)P.bag.push(mkBook(o.side+c+'1',0));
  recalc();P.hp=P.maxHp;P.qi=P.maxQi;
}
// ================= derived stats =================
const art=()=>ARTS[P.cur];
const A=id=>P.arts[id];
const curCls=()=>art().cls;
const eqList=()=>Object.values(P.eq).filter(Boolean);
const gear=f=>eqList().reduce((a,it)=>a+(f==='atk'&&it.slot==='weapon'?0:(it[f]||0)),0);
const hasWeaponFor=c=>c==='권'||!!(P.eq.weapon&&P.eq.weapon.cls===c);
const weaponAtk=()=>{const w=P.eq.weapon;if(!w||w.cls!==curCls())return 0;return w.dur>0?w.atk:Math.round(w.atk*.5)};
const mast=(id=P.cur)=>A(id)?A(id).p:0;
const atk=()=>Math.round((6+P.st.str*2+weaponAtk()+gear('atk'))*CLASS[curCls()].atk*(1+(P.buff.atk>0?P.buff.atkV||0:0)));
const hmv=()=>Math.round(P.st.agi*2+CLASS[curCls()].hm+mast()*.3+gear('hm')+(P.buff.hm>0?20:0));
const guard=()=>Math.min(.65,(P.st.end*.008+gear('def')/100)*CLASS[curCls()].def);
// 내공은 오직 내공 심법 수련(과 영약)으로 오른다. 본원진기는 생명, 지구력은 활력을 담을 그릇.
const baseQi=()=>80+P.qiN*SIDES[P.side].gain+P.qiBonus;
// 윤회로 물려받은 활력은 다섯 몫으로 나눠 생일마다 한 몫씩 받는다
function splitVit(v){if(!(v>0))return[];const a=Math.floor(v/5),r=v-a*5;return[0,1,2,3,4].map(i=>a+(i<r?1:0))}
const maxVit=()=>150+P.st.end*25;
// 활력을 얻는다. 지구력이 정한 최대치까지만 찬다 (전생에서 넘겨받아 이미 넘친 활력은 깎지 않는다).
function gainVit(v){const m=maxVit(),was=P.vit;P.vit=Math.max(P.vit,Math.min(m,P.vit+v));
  if(P.vit-was<v&&time-(P.vitFullT||-99)>20){P.vitFullT=time;log(`활력이 가득 찼습니다 (최대 ${m}). 지구력이 높을수록 더 담을 수 있습니다.`,'info')}return P.vit-was}
const realmIdx=()=>{let i=0;REALM_QI.forEach((v,j)=>{if(baseQi()>=v)i=j});return i};
const realmName=()=>RANKS[realmIdx()];
const moveSpd=()=>(3+P.st.agi*.04+gear('spd'))*(P.ride?1.8:P.run?1.55:1)*(P.poison>0?.85:1);
const cdMul=()=>1-Math.min(.35,P.st.agi*.01);
const qiRegen=()=>(2+baseQi()*.025)*(P.medit?5:1);
const wisMul=()=>.5+P.wis*.1;
const artCap=()=>2+Math.floor(P.wis/2);
const learnedArts=()=>Object.keys(P.arts).filter(k=>k!=='base');
const allLearned=id=>A(id)&&A(id).f.every(Boolean);
const season=()=>SEASONS[Math.floor(frac(G.cal)*4)];
const adult=()=>P.age>=18;
function recalc(){
  const oldAge=Math.max(0,P.age-50);
  P.maxHp=Math.round((60+P.st.qi*10+gear('hp'))*(1-Math.min(.4,oldAge*.012)));
  P.maxQi=baseQi()+gear('qi');P.hp=Math.min(P.hp,P.maxHp);P.qi=Math.min(P.qi,P.maxQi);
}
const tierOf=p=>p>=80?3:p>=50?2:p>=25?1:0;
const TIERS=['입문','소성','대성','극성'];
function mkX(id=P.cur,combo=1){const a=ARTS[id],p=mast(id);return{art:a,key:id,t:tierOf(p),mul:1+p/100,combo}}

// ================= items =================
const QN=q=>q>=1.35?'명품':q>=1.1?'상품':q>=.85?'중품':'하품';
const QC=q=>q>=1.35?'#c58bff':q>=1.1?'#6aa8ff':q>=.85?'#7fd16a':'#d8d2c2';
function mkWeapon(c,q,made){const a=Math.round((c==='궁'?14:c==='창'?13:10)*q*(1+Math.random()*.15));return{id:++itemId,slot:'weapon',cls:c,name:WNAME[c],q,atk:a,dur:Math.round(60*q),maxDur:Math.round(60*q),price:Math.round(20*q*q+a),made}}
function mkGear(slot,name,q,o){const it={id:++itemId,slot,name,q,price:0};for(const k in o)it[k]=k==='spd'?+(o[k]*q).toFixed(2):Math.round(o[k]*q);it.price=Math.round(15*q*q+(it.hp||0)*.4+(it.qi||0)*.4+(it.hm||0));return it}
function mkBook(artId,i){const a=ARTS[artId];return{id:++itemId,slot:'book',art:artId,form:i,name:`${a.n} 비급 · ${a.forms[i].n}`,price:20+i*25}}
function mkSBook(k){return{id:++itemId,slot:'sbook',sk:k,name:`특수무공 비급 · ${k==='암기'?'암기술':k==='독공'?'독공':'점혈법'}`,price:40}}
function mkTBook(j){return{id:++itemId,slot:'tbook',job:j,name:`기술서 · ${JOBS[j].n}`,price:25}}
const SLOTN={weapon:'무기',armor:'의복',acc:'장신구',boots:'신발',book:'초식 비급',sbook:'특수무공',tbook:'기술서'};
function itemDesc(it){
  if(it.slot==='book'){const a=ARTS[it.art],f=a.forms[it.form];return `${SIDES[a.side].n} ${CLASS[a.cls].n}·${a.el} · ${it.form+1}초식 · 숙련 ${f.req} · 활력 ${f.cost} · 연속기 +${f.bonus}%`}
  if(it.slot==='sbook')return '읽으면 특수무공을 익힌다';if(it.slot==='tbook')return '읽으면 생활 기술을 익힌다';
  const a=[];if(it.slot==='weapon')a.push(`${CLASS[it.cls].n} 무기 · 공격력 ${it.atk} · 내구 ${it.dur}/${it.maxDur}`);
  if(it.hp)a.push(`체력 +${it.hp}`);if(it.def)a.push(`받는 피해 -${it.def}%`);if(it.qi)a.push(`내공 +${it.qi}`);if(it.hm)a.push(`현묘도 +${it.hm}`);if(it.spd)a.push(`이동 +${it.spd}`);
  return a.join(' · ');
}
const itemLabel=it=>it.q?`[${QN(it.q)}] ${it.name}`:it.name;
const itemCol=it=>it.q?QC(it.q):it.slot==='book'?(ARTS[it.art].side===P.side?'#e8c66e':'#9a8d72'):'#e8d9a8';
const addMat=(k,n=1)=>{P.mats[k]=(P.mats[k]||0)+n};
const hasMats=need=>Object.entries(need).every(([k,n])=>(P.mats[k]||0)>=n);
const useMats=need=>{for(const[k,n]of Object.entries(need))P.mats[k]-=n};

// why a book can't be read right now, or null if it can
function readBlock(it){
  if(it.slot==='sbook')return P.sp[it.sk]?'이미 익힌 특수무공입니다.':null;
  if(it.slot==='tbook')return P.jobs[it.job].on?'이미 익힌 기술입니다.':null;
  const a=ARTS[it.art],f=a.forms[it.form],s=A(a.id);
  if(a.side!==P.side)return `${SIDES[a.side].base} 계열 무공이라 ${SIDES[P.side].base}을(를) 익힌 몸으로는 읽을 수 없습니다. 팔 수는 있습니다.`;
  if(!s&&learnedArts().length>=artCap())return `오성 ${P.wis}로는 무공을 ${artCap()}가지까지만 익힐 수 있습니다.`;
  if(s&&s.f[it.form])return '이미 익힌 초식입니다.';
  if((s?s.p:0)<f.req)return `${a.n} 숙련도 ${f.req}이(가) 필요합니다. (지금 ${Math.floor(s?s.p:0)}) 이 무공으로 싸워 숙련을 올리세요.`;
  if(P.vit<f.cost)return `활력이 부족합니다. (필요 ${f.cost}, 지금 ${P.vit})`;
  return null}
function readBook(it){
  const no=readBlock(it);if(no){log(no,'info');return}
  if(it.slot==='sbook'){P.sp[it.sk]=1;P.bag.splice(P.bag.indexOf(it),1);log(`특수무공 [${it.sk}]을(를) 익혔습니다.`,'xp');return}
  if(it.slot==='tbook'){P.jobs[it.job].on=1;P.bag.splice(P.bag.indexOf(it),1);log(`${JOBS[it.job].n}의 기술을 익혔습니다.`,'xp');return}
  const a=ARTS[it.art],f=a.forms[it.form],s=A(a.id);
  P.vit-=f.cost;if(!s)P.arts[a.id]={p:0,f:a.forms.map(()=>false)};P.arts[a.id].f[it.form]=true;P.bag.splice(P.bag.indexOf(it),1);
  log(`${a.n}의 [${f.n}]을(를) 익혔습니다. (활력 -${f.cost})`,'xp');
  if(allLearned(a.id))log(`${a.n}의 모든 초식을 익혀 필살기 [${a.ult.n}]을(를) 쓸 수 있습니다. (S / 키패드 5)`,'xp');
  if(!s&&hasWeaponFor(a.cls))setArt(a.id);
}
function setArt(id){if(!A(id))return;P.cur=id;P.fcd=[0,0,0,0,0,0];P.chain={last:-1,t:-9,sum:0,n:0};log(`[${ARTS[id].n}]을(를) 펼칩니다.`,'sys')}

// ================= mobs =================
function mkMob(kind,x,y,extra){
  const d=MOBS[kind]||extra,m={kind,d,name:kind,x,y,home:{x,y},hp:d.hp,maxHp:d.hp,atk:d.atk||0,def:d.def||0,hm:d.hm||0,sp:d.sp,el:d.el||null,reach:d.reach||(d.beast?1.1:1.2),
    cd:1+Math.random(),wind:0,swing:0,hit:0,kb:{x:0,y:0},fx:1,fy:1,bob:Math.random()*6,moving:false,aggro:false,flee:0,stun:0,slow:0,burn:0,psn:0,nohe:0,wt:Math.random()*3,goal:null,skT:4+Math.random()*3,isMob:1};
  if(extra)Object.assign(m,extra.o||{});return m;
}
const foes=()=>mobs.filter(m=>m.hp>0&&!(m.d.villager&&!m.angry)&&!peaceful(m)&&!(G.duel&&!m.duel)||(m.hp>0&&m.duel));
function nearest(r,from=P){let b=null,bd=r;for(const e of mobs)if(e.hp>0&&!e.d.villager&&!peaceful(e)&&(!G.duel||e.duel)){const d=dist(e,from);if(d<bd){bd=d;b=e}}return b}
// 큰 지역(64칸 넘게)은 몹을 사람 둘레 24칸 안에 내고, 44칸 넘게 멀어진 몹은 거둔다. 넓어도 비어 보이지 않고 몹 수도 늘지 않는다
const BIG_N=64,NEAR_R=24,FAR_R=44;
function spawnTick(){
  const big=N>BIG_N;if(big&&P)mobs=mobs.filter(m=>m.d.boss||m.tomb||m.tombGuard||m.duel||Math.hypot(m.x-P.x,m.y-P.y)<FAR_R);
  for(const[k,cap,test,mk]of REGION().spawns||SPAWNS){const n=mobs.filter(m=>m.kind===k&&m.hp>0).length;if(n>=cap)continue;
    for(let t=0;t<30;t++){const x=big?Math.max(1,Math.min(N-2,Math.floor(P.x+(Math.random()*2-1)*NEAR_R))):1+Math.floor(Math.random()*(N-2)),
      y=big?Math.max(1,Math.min(N-2,Math.floor(P.y+(Math.random()*2-1)*NEAR_R))):1+Math.floor(Math.random()*(N-2));
      if(!test(x,y)||!walk(x,y))continue;if(k!=='양민'&&Math.hypot(x+.5-P.x,y+.5-P.y)<8)continue;mobs.push(mk?mk(x+.5,y+.5):mkMob(k,x+.5,y+.5));break}}
  for(const[k,x,y,t]of REGION().bosses){
    if(mobs.some(m=>m.kind===k))continue;G.bossT[k]=(G.bossT[k]??20)-2;
    if(G.bossT[k]<=0&&Math.hypot(x-P.x,y-P.y)>7){mobs.push(mkMob(k,x,y));G.bossT[k]=t;log(`${k}이(가) 모습을 드러냈다는 소문이 돕니다.`,'dmg')}}
}

// ================= combat =================
function hitE(X,e,m,kb,stun,from=P,echo){
  if(!e||e.hp<=0)return;
  const pHit=clamp(.74+(hmv()-e.hm)/110,.25,.98);
  if(Math.random()>pHit){addText(e.x,e.y,'빗나감','#9a8d72');return}
  const a=X.art,el=a.el;let d=atk()*m*X.mul*X.combo*elMul(el,e.el)*(.92+Math.random()*.16);
  const crit=P.buff.crit>0||Math.random()<.05+(el==='금'?.15:0);if(crit)d*=1.6;
  d=Math.max(1,Math.round(d-(el==='금'?0:e.def)));
  if(el==='토'){stun=(stun||0)+.3;kb=(kb||0)+.3}
  damage(e,d,kb,stun?stun+(X.t>=1?.2:0):0,from,crit);
  if(el==='화')e.burn=Math.max(e.burn,3),e.burnD=Math.max(1,d*.07);
  if(el==='수')e.slow=Math.max(e.slow,2);
  if(el==='목'&&P.hp>0)P.hp=Math.min(P.maxHp,P.hp+d*.1);
  gainMast(X.key,1);
  const w=P.eq.weapon;if(w&&w.cls===a.cls&&Math.random()<.06&&w.dur>0){w.dur--;if(!w.dur)log(`${w.name}의 날이 상했습니다. 대장간에서 고치세요.`,'dmg')}
  if(echo&&X.t>=3)later(.15,()=>{if(e.hp>0){damage(e,Math.round(d*.3),0,0);fStar(X,e,'255,215,120',.7,.2)}});
}
function gainMast(id,v){
  const s=A(id);if(!s||s.p>=100)return;const before=s.p;s.p=Math.min(100,s.p+v*.3*wisMul()*(1-s.p/125));
  const a=ARTS[id];
  if(Math.floor(before/10)!==Math.floor(s.p/10))log(`${a.n} 숙련도 ${Math.floor(s.p)}`,'sys');
  if(tierOf(before)!==tierOf(s.p))showBanner(`${a.n} ${TIERS[tierOf(s.p)]}`,`숙련도 ${Math.floor(s.p)}`);
  if(a.base)a.forms.forEach((f,i)=>{if(!s.f[i]&&s.p>=f.req){s.f[i]=true;log(`기초권각의 [${f.n}]을(를) 깨우쳤습니다.`,'xp')}});
  if(s.p>=100&&before<100){log(`${a.n}을(를) 극성까지 익혔습니다. 깨달음이 찾아옵니다.`,'xp');if(P.wis<10){P.wis++;log(`돈오: 오성이 ${P.wis}(으)로 올랐습니다.`,'xp')}}
}
function damage(e,d,kb,stun,from=P,crit){
  e.hp-=d;e.hit=.12;addText(e.x,e.y,crit?d+'!':d,crit?'#ffd36a':'#f3e6c4');
  if(kb&&!e.d.boss){const l=Math.hypot(e.x-from.x,e.y-from.y)||1;e.kb={x:(e.x-from.x)/l*kb,y:(e.y-from.y)/l*kb}}
  if(stun)e.stun=Math.max(e.stun||0,e.d.boss?stun*.4:stun);
  if(e.d.fac&&!e.angry&&!facFoe(e.d.fac,pfac()))facBetray(e);
  if(e.d.villager&&!e.angry){e.angry=1;e.flee=4;P.evil+=P.side==='정'?10:4;log('양민을 해쳤습니다. 악업이 쌓입니다.','dmg')}
  else if(e.d.passive)e.flee=3,e.fleeFrom=from;
  else e.aggro=true;
  if(e.hp<=0)onKill(e);
}
function onKill(e){
  fx.push({t:'puff',x:e.x,y:e.y,life:.6});if(P.target===e)P.target=null;
  if(e.duel){duelEnd(true,e);return}
  const d=e.d,fam=P.spouse?1.1:1;let v=Math.round((d.xp||0)*fam*(1+P.children.length*.03));
  if(d.villager){v=P.side==='사'?8:0;P.evil+=P.side==='정'?20:8;log('양민이 죽었습니다. 무거운 악업이 쌓였습니다.','dmg')}
  gainVit(v);P.kills++;if(d.good){P.good+=d.good*(P.side==='정'?2:1)}if(d.fame){P.fame+=d.fame;P.bosses++;P.feats.push(`${Math.floor(P.age)}세에 ${e.kind}을(를) 쓰러뜨렸다`)}
  if(v)log(`${e.name}을(를) 처치했습니다. 활력 +${v}`,'xp');
  for(const a of allies)if(a.kind==='disciple'&&dist(a,e)<8)discipleXp(a,1);
  for(const q of P.quests)if(q.kind==='kill'&&q.mob.includes(e.kind)&&q.have<q.cnt){q.have++;if(q.have>=q.cnt)log(`의뢰 [${q.n}] 완료. 의뢰판에서 보상을 받으세요.`,'xp')}
  facKill(e);
  if(e.tomb){tombKill(e);return}
  // loot
  const out=[];
  // 은자가 0인 적(강시 등)은 빈 주머니를 떨어뜨리지 않는다. 0은 거짓이라 아이템으로 오인돼 화면이 멈췄었다.
  if(d.silver){const s=R1(d.silver[0],d.silver[1]);if(s>0)out.push({silver:s})}
  if(d.meat)out.push({mat:'고기',n:d.meat});if(d.hide)out.push({mat:'가죽',n:d.hide});
  const bk=d.boss?1:d.elite?.3:e.kind==='혈교무인'?.3:e.kind==='강시'?.2:d.hostile&&!d.beast?.07:0;
  if(Math.random()<bk)out.push({item:randomBook()});if(d.boss&&Math.random()<.6)out.push({item:randomBook()});
  const gq=d.boss?1:d.elite?.25:d.hostile&&!d.beast?.07:0;
  if(Math.random()<gq)out.push({item:randomGear(d.boss?1.2:.9)});
  if(d.hostile&&!d.beast&&Math.random()<.12)out.push({mat:pick(['금창약','소환단','비도']),n:1});
  if(d.boss&&realmIdx()>=5){const sg=P.sg.name||pick(Object.keys(SHINGONG));out.push({page:sg})}
  if(d.boss&&Math.random()<.25)out.push({item:mkSBook(pick(['암기','독공','점혈']))});
  out.forEach((it,i)=>drops.push({x:e.x+(i%3-1)*.3,y:e.y+Math.floor(i/3)*.3,it,t:Math.random()*6}));
}
function randomBook(){
  const side=Math.random()<.8?P.side:(P.side==='정'?'사':'정'),c=Math.random()<.45?(art().base?P.startCls:curCls()):pick(CLS),e=pick(ELS),a=ARTS[side+c+ELS.indexOf(e)];
  const w=a.forms.map((f,i)=>1/(i+1));let r=Math.random()*w.reduce((x,y)=>x+y),i=0;while(r>w[i]){r-=w[i];i++}
  return mkBook(a.id,Math.min(i,a.forms.length-1));
}
function randomGear(m){const q=clamp(.6+Math.random()*.7*m,.5,1.6),s=pick(['weapon','weapon','armor','acc','boots']);
  if(s==='weapon')return mkWeapon(Math.random()<.5&&!art().base?curCls():pick(CLS),q,0);
  if(s==='armor')return mkGear('armor',pick(['마의','피갑','흑철갑']),q,{hp:26,def:4});if(s==='acc')return mkGear('acc',pick(['옥패','호신부','염주']),q,{qi:24,hm:5});
  return mkGear('boots',pick(['짚신','무혜','운리혜']),q,{spd:.12,hm:4})}
function pickUp(d){
  const it=d.it;
  if(it.silver){P.silver+=it.silver;addText(P.x,P.y,`은자 ${it.silver}`,'#e8c66e');return true}
  if(it.mat){addMat(it.mat,it.n);log(`${it.mat} ${it.n}개를 얻었습니다.`,'sys');return true}
  if(it.page){P.sg.pages[it.page]=(P.sg.pages[it.page]||0)+1;log(`절세신공 [${it.page}] 한 장을 얻었습니다. (${P.sg.pages[it.page]}/10)`,'xp');
    if(!P.sg.name&&P.sg.pages[it.page]>=10){P.sg.name=it.page;log(`절세신공 [${it.page}]을(를) 완성했습니다. 수동초식 상태에서 V로 펼칩니다.`,'xp');showBanner('절세신공',it.page)}return true}
  if(!it.item)return true;
  if(P.bag.length>=24){if(!d.full){log('행낭이 가득 찼습니다.','info');d.full=1}return false}
  P.bag.push(it.item);log(`${itemLabel(it.item)}을(를) 얻었습니다.`,it.item.slot==='book'?'xp':'sys');return true;
}
function hurtP(dm,src){
  if(P.inv>0||P.hp<=0)return;
  if(Math.random()<clamp((hmv()-(src.hm||0))/200+.06,.03,.5)){addText(P.x,P.y,'회피','#9db8e0');return}
  dm=Math.max(1,Math.round(dm*(1-guard())));P.hp-=dm;P.hit=.2;P.lastHit=0;shake=.12;addText(P.x,P.y,dm,'#e0675a');P.chan=null;
  if(src.d&&src.d.poison&&Math.random()<.25&&!P.poison){P.poison=6;log('중독되었습니다. 해독단으로 풀 수 있습니다.','dmg')}
  if(P.eq.armor&&Math.random()<.04&&P.eq.armor.def)P.eq.armor.def=Math.max(0,P.eq.armor.def-0);
  if(P.hp<=0){if(G.duel){P.hp=1;duelEnd(false)}else{P.hp=0;die('전투')}}
}

// ================= 초식, 연속기, 필살기 =================
function engage(f){switch(f.p){case'melee':case'multi':return CLASS[curCls()].reach;case'arc':return f.rad*.9;case'circle':return f.rad*.85;case'line':return f.len*.9;
  case'proj':return f.full?f.len*.8:f.len*.9;case'pull':return f.rad;case'dash':return f.dist+1.2;case'blinkMulti':return 5;default:return f.r||4}}
const SLOTKEY=['Q','A','Z','E','D','C'],PADKEY=['7','4','1','9','6','3'];
function formReady(i){const a=art(),f=a.forms[i],s=A(a.id);return f&&s&&s.f[i]&&P.fcd[i]<=0&&P.qi>=f.qi&&P.gcd<=0&&hasWeaponFor(a.cls)}
function useForm(i,silent){
  if(P.hp<=0)return false;const a=art(),f=a.forms[i],s=A(a.id);if(!f)return false;
  if(!s.f[i]){if(!silent)log(`[${f.n}]은(는) 아직 익히지 못했습니다. 비급이 필요합니다.`,'info');return false}
  if(!hasWeaponFor(a.cls)){if(!silent)log(`${CLASS[a.cls].n}을(를) 펼치려면 ${a.cls}이(가) 필요합니다.`,'info');return false}
  if(P.fcd[i]>0||P.gcd>0)return false;if(P.qi<f.qi){if(!silent)log('내공이 부족합니다.','info');return false}
  // 연속기: forms entered in order inside the window stack their 추가 공력
  const ch=P.chain;if(time-ch.t<1.7&&i>ch.last){ch.sum+=f.bonus;ch.n++}else{ch.sum=f.bonus;ch.n=1}ch.last=i;ch.t=time;
  const X=mkX(a.id,1+ch.sum/100),r=engage(f),e=P.target&&P.target.hp>0&&dist(P.target,P)<r?P.target:nearest(r);
  P.qi-=f.qi;P.fcd[i]=P.fmax[i]=(f.cd*2.2+i*.35)*(X.t>=2?.9:1)*cdMul();P.gcd=.2;P.lastAtk=time;heroAtk(HKIND[f.p]);if(e)face(e.x,e.y);P.chan=null;P.medit=false;
  texts.push({x:P.x,y:P.y,t:ch.n>1?`${f.n} · 연속기 ${ch.n} (${100+ch.sum}%)`:f.n,c:`rgb(${a.c})`,life:.9,call:1});exec(f,e,X);return true;
}
function basicStrike(e){
  if(P.bcd>0||P.gcd>0||!e)return;const useArt=hasWeaponFor(curCls())?P.cur:'base',a=ARTS[useArt];const X=mkX(useArt);X.pj=CLASS[a.cls].pj;
  P.bcd=.8*cdMul();face(e.x,e.y);heroAtk();P.lastAtk=time;
  if(a.cls==='궁'&&useArt!=='base'){projs.push({x:P.x,y:P.y,vx:P.fx*14,vy:P.fy*14,left:7,m:.75,kb:.1,stun:0,pierce:0,size:1,hit:new Set,X,c:a.c,kind:'arrow',trail:[],ph:0})}
  else{anim(.2);hitE(X,e,.75,.25,0);fxHit(X,e,.8);fArc(X,1.05,1.4,a.c,2.5,.18)}
}
function ultimate(){
  if(P.hp<=0)return;const a=art();
  if(!allLearned(a.id)){log(`필살기는 ${a.n}의 초식을 모두 익혀야 쓸 수 있습니다.`,'info');return}
  if(!hasWeaponFor(a.cls)){log(`${a.cls}이(가) 필요합니다.`,'info');return}
  const cost=Math.round((a.base?30:55)*(P.buff.ult>0?.3:1));if(P.ucd>0)return;if(P.qi<cost){log('내공이 부족합니다.','info');return}
  const ch=P.chain,combo=time-ch.t<1.7?1+ch.sum/100:1;P.chain={last:-1,t:-9,sum:0,n:0};
  P.qi-=cost;P.ucd=8;heroAtk('ult');const X=mkX(a.id,combo),e=P.target&&P.target.hp>0?P.target:nearest(6);if(e)face(e.x,e.y);
  showBanner(a.ult.n,`${a.n} 필살기${combo>1?` · 공력 ${Math.round(combo*100)}%`:''}`);log(`필살기 [${a.ult.n}]!`,'sys');P.flash=.5;P.flashCol=a.c;shake=.35;P.inv=Math.max(P.inv,.6);
  a.ult.steps.forEach(st=>exec({...st,m:st.m*(1+.1*X.t)*(1+P.qiN*.01)},e,X));
}
// 특수무공: 암기 · 독공 · 점혈
const SPEC={암기:{qi:0,cd:.9,key:'1'},독공:{qi:20,cd:6,key:'2'},점혈:{qi:15,cd:8,key:'3'}};
function special(k){
  if(P.hp<=0)return;if(!P.sp[k]){log(`[${k}]을(를) 익히지 못했습니다. 잡화상에서 특수무공 비급을 구할 수 있습니다.`,'info');return}
  if(P.scd[k]>0)return;const s=SPEC[k];if(P.qi<s.qi){log('내공이 부족합니다.','info');return}
  const e=P.target&&P.target.hp>0?P.target:nearest(k==='점혈'?2.5:7);
  if(k==='암기'){if(!(P.mats.비도>0)){log('비도가 없습니다. 대장간에서 사거나 만드세요.','info');return}if(!e){log('던질 상대가 없습니다.','info');return}
    P.mats.비도--;face(e.x,e.y);heroAtk('flat');const X={art:{c:'225,230,240',cls:'궁',pt:'spark',elc:false,el:null},key:null,t:0,mul:1+P.st.agi/40,combo:1};
    projs.push({x:P.x,y:P.y,vx:P.fx*16,vy:P.fy*16,left:8,m:.85,kb:.1,stun:0,pierce:0,size:.8,hit:new Set,X,c:X.art.c,kind:'blade',trail:[],ph:0})}
  else if(k==='독공'){const c=e?{x:e.x,y:e.y}:front(1.5);heroAtk('palm');P.palm=.35;
    for(const o of foes())if(dist(o,c)<1.7){o.psn=5;o.psnD=Math.max(2,atk()*.22*(P.side==='사'?1.5:1));o.aggro=true}
    fParts(null,c,'120,220,90',22,70,'dot',1);fx.push({t:'ring',x:c.x,y:c.y,life:.5,max:.5,col:'120,220,90'})}
  else{if(!e||dist(e,P)>2.6){log('점혈하려면 가까이 붙어야 합니다.','info');return}heroAtk('flat');face(e.x,e.y);e.stun=Math.max(e.stun,e.d.boss?1:3);e.aggro=true;addText(e.x,e.y,'점혈','#ffe27a');fStar(null,e,'255,226,122',1,.3)}
  P.qi-=s.qi;P.scd[k]=s.cd;P.chan=null;
}
function shingong(){
  if(!P.sg.name){log('절세신공을 아직 얻지 못했습니다. 화경에 오른 뒤 우두머리를 쓰러뜨려 열 장을 모으세요.','info');return}
  if(realmIdx()<5||P.fame<200){log('절세신공은 화경을 넘어 명성 200을 얻어야 온전히 쓸 수 있습니다.','info');return}
  if(P.mode!=='manual'&&!TOUCH){log('절세신공은 수동초식 상태에서만 펼칠 수 있습니다. (Tab)','info');return}
  if(P.scd.신공>0)return;P.scd.신공=5;const n=P.sg.name;showBanner(n,'절세신공');P.flash=.4;P.flashCol='255,215,120';
  if(n==='역천용상비전'){P.buff.ult=5;P.ucd=0}
  else if(n==='사신십삼탈혼')P.buff.crit=5;
  else for(const o of foes())if(dist(o,P)<4.5){if(n==='백환수인')o.slow=5,o.bind=5;else{o.nohe=5;damage(o,Math.round(atk()*1.2),.2,.4);fBolt(null,o,'200,170,255',.8)}}
  fx.push({t:'ring',x:P.x,y:P.y,life:.5,max:.5});
}
function face(tx,ty){const dx=tx-P.x,dy=ty-P.y,l=Math.hypot(dx,dy);if(l>.01){P.fx=dx/l;P.fy=dy/l}}

// ================= 내공 수련, 기본기, 길들이기 =================
function trainQi(){
  const c=qiCost(P.side,P.qiN);if(P.vit<c){log(`활력이 부족합니다. (필요 ${c})`,'info');return}
  if(inCombat()){log('싸움 중에는 운기할 수 없습니다.','info');return}
  const done=()=>{const before=realmIdx();P.vit-=c;P.qiN++;recalc();P.qi=P.maxQi;fx.push({t:'lvl',x:P.x,y:P.y,life:1.2});
    log(`운기조식으로 내공이 ${SIDES[P.side].gain} 늘었습니다. (${P.qiN}회차, 다음 ${qiCost(P.side,P.qiN)})`,'xp');
    if(realmIdx()>before){log(`경지가 ${realmName()}(으)로 올랐습니다.`,'xp');showBanner('경지 상승',realmName());P.feats.push(`${Math.floor(P.age)}세에 ${realmName()}의 경지에 올랐다`)}renderOpen()};
  // 인물창에서 누르면 창을 닫지 않고 그 자리에서 잠깐 운기한 뒤 결과를 보여 준다 (창이 열려 있는 동안 시간은 멈춰 있다)
  if(panel==='char'){if(P.qiTraining)return;P.qiTraining=true;renderOpen();setTimeout(()=>{P.qiTraining=false;if(P.hp>0)done();renderOpen()},900);return}
  P.chan={t:0,dur:1.6,label:'내공 수련',fn:done};
}
const statCost=k=>12+(P.st[k]-P.base[k])*6;
function trainStat(k){
  const c=statCost(k);if(P.vit<c){log(`활력이 부족합니다. (필요 ${c})`,'info');return}
  P.vit-=c;P.st[k]++;recalc();log(`${STATS.find(s=>s.k===k).n}이(가) 1 올랐습니다.`,'sys');renderOpen();
}
const inCombat=()=>mobs.some(m=>m.hp>0&&m.aggro&&!m.d.villager&&dist(m,P)<7);
function tame(e){
  if(!e||e.hp<=0)return;const d=e.d;
  if(!d.beast){log('짐승만 길들일 수 있습니다.','info');return}if(!d.tame){log(`${e.kind}은(는) 길들일 수 없습니다.`,'info');return}
  if(allies.filter(a=>a.kind==='pet').length>=5){log('짐승은 다섯 마리까지 데리고 다닐 수 있습니다.','info');return}
  if(dist(e,P)>3){P.target=e;log('가까이 다가가야 합니다.','info');return}
  if(P.vit<d.tame){log(`활력이 부족합니다. (필요 ${d.tame})`,'info');return}
  P.vit-=d.tame;const ch=clamp(P.maxQi/(d.tame*4)*(e.hp<e.maxHp*.5?1.3:1),.05,.92);
  if(Math.random()<ch){mobs.splice(mobs.indexOf(e),1);const a=mkAlly('pet',e.kind,e.x,e.y);a.hp=Math.max(1,e.hp);allies.push(a);if(P.target===e)P.target=null;
    log(`${e.kind}을(를) 길들였습니다. (성공률 ${Math.round(ch*100)}%)`,'xp');fx.push({t:'lvl',x:e.x,y:e.y,life:1.2})}
  else{log(`길들이기에 실패했습니다. (성공률 ${Math.round(ch*100)}%)`,'dmg');if(!d.passive)e.aggro=true;else e.flee=3,e.fleeFrom=P}
}
function mkAlly(kind,k,x,y){
  if(kind==='pet'){const d=MOBS[k];return{kind,k,d,name:k,x,y,hp:d.hp*1.2,maxHp:d.hp*1.2,atk:d.atk||4,sp:d.sp,reach:1.2,age:R1(1,4),life:d.life,mode:'follow',cd:0,hit:0,fx:1,fy:1,moving:false,bob:Math.random()*6,swing:0}}
  return{kind:'disciple',k:'제자',d:{pal:'disciple'},name:k,x,y,lv:1,xp:0,hp:120,maxHp:120,atk:9,sp:2.6,reach:1.3,mode:'follow',cd:0,hit:0,fx:1,fy:1,moving:false,bob:Math.random()*6,swing:0,wind:0};
}
function discipleXp(a,v){a.xp+=v;if(a.xp>=a.lv*6){a.xp=0;a.lv++;a.maxHp+=30;a.hp=a.maxHp;a.atk+=3;gainVit(15);P.fame+=1;log(`제자 ${a.name}이(가) ${a.lv}단계로 성장했습니다. 사부로서 활력 +15`,'xp')}}

// ================= 기연 =================
function giyeon(src){
  const r=Math.random(),k=pick(STATS).k;
  if(r<.25&&P.wis<10){P.wis++;log(`기연: 깨달음을 얻어 오성이 ${P.wis}(으)로 올랐습니다.`,'xp')}
  else if(r<.5){P.st[k]+=2;recalc();log(`기연: 영약을 먹고 ${STATS.find(s=>s.k===k).n}이(가) 2 올랐습니다.`,'xp')}
  else if(r<.7){P.qiBonus+=40;recalc();log('기연: 천년 영지를 먹어 내공이 40 늘었습니다.','xp')}
  else if(r<.85){const n=pick(Object.keys(SHINGONG));const v=src==='chest'?2:1;P.sg.pages[n]=(P.sg.pages[n]||0)+v;log(`기연: 절세신공 [${n}] ${v}장을 얻었습니다.`,'xp')}
  else{const b=randomBook();P.bag.push(b);log(`기연: 낡은 비급 [${b.name}]을(를) 발견했습니다.`,'xp')}
  P.feats.push(`${Math.floor(P.age)}세에 기연을 만났다`);showBanner('기연','하늘이 내린 인연');fx.push({t:'lvl',x:P.x,y:P.y,life:1.2});
}

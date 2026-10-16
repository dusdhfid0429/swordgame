// ================= 마성(魔性): 마공의 대가 =================
// 사용자 요청(2026-10-15 v104): "마교가 다른 계열보다 이점이 많은데 패널티가 마교스럽지 못해". 무협 관례(나무위키 마공·마교·주화입마, 아카라이브 무공편) 조사:
//   마공은 빨리 강해지지만 마기를 함께 들이켜 미치기 쉽고(입마→극마), 주화입마에 취약하며, 한계(깨달음)가 낮고, 강호에서 공적으로 몰려 추살당한다.
// 구현: 마공 심법을 운용하는 동안 마성(P.mara 0~100)이 쌓인다. 수련·살생·산공 입마로 오르고, 운기조식과 천마신전의 마기 정련으로 내린다.
//   입마(40~) 공격 +8% 받는 피해 +8% · 심마(70~) +15%/+15%, 싸움 중 가끔 폭주(아군·양민 가리지 않고 가까운 것을 친다) · 광마(90~) +20%/+20%, 폭주 잦음
// v105 (2026-10-15, 사용자 안): 마공의 화경·현경 이름이 극마·탈마다. 탈마(현경)는 마성을 다스린 자만 오른다: 장로 이상, 마성 20 미만을 한 해 내내 유지, 천마동 폐관 (실패하면 주화입마).
//   탈마에 이르면 마성이 더 오르지 않고(폭주·주화입마·양민 도주 없음), 깨달음 배율 1, 공격 +8%만 남는다. 마성 70 단계는 경지 극마와 겹치지 않게 심마(心魔)로 부른다. 설계 docs/마교_심화_기획.md §1.
//   100에 닿으면 주화입마: 쌓은 내공 10%를 잃고 마성 60으로. 깨달음은 마공 운용 중 절반(사공·사불 70%). 마교도는 명성 50부터 해마다 정·사 추살조가 덮친다.
// 설계: docs/경지_설계.md '마성', docs/마교_밸런스.md. 상수 data/simbeop.json MARA.
const MARA=GD.MARA||{train:3,kill:1,sangong:20,medit:1.2,tiers:[40,70,90],atk:[0,.08,.15,.2],dmg:[0,.08,.15,.2],burst:[0,0,.04,.1],burstDur:4,refine:{merit:20,v:30},enl:{마공:.5,사공:.7,사불:.7},huntFame:50,huntN:4,dev:{qi:.1,back:60}};
const MARA_N=['평정','입마','심마','광마'];
const isMa=()=>!!P&&typeof pSchool==='function'&&pSchool()==='마공';
const isTalma=()=>isMa()&&realmIdx()>=6;   // 탈마: 마공의 현경
const maraTier=()=>{if(!isMa()||isTalma())return 0;const m=P.mara||0;return m>=MARA.tiers[2]?3:m>=MARA.tiers[1]?2:m>=MARA.tiers[0]?1:0};
function maraAdd(v,why){if(!P||!isMa()&&v>0||v>0&&isTalma())return;if(v>0&&typeof diffMul==='function')v*=diffMul('mara');const t0=maraTier();P.mara=clamp((P.mara||0)+v,0,100);const t1=maraTier();
  if(v>0&&P.mara>=100){maraDev();return}
  if(t1>t0)log(`마기가 심맥에 스며 ${MARA_N[t1]}에 이르렀습니다. 공격 +${Math.round(MARA.atk[t1]*100)}%, 받는 피해 +${Math.round(MARA.dmg[t1]*100)}%${t1>=2?', 싸움 중 폭주할 수 있다':''}.`,'dmg');
  else if(t1<t0)log(`마기가 가라앉아 ${MARA_N[t1]}으로 돌아왔습니다.`,'info')}
// 마성 100: 주화입마. 쌓은 내공 10%가 흩어지고 생명이 깎이며 마성 60으로 내려간다
function maraDev(){const lost=Math.floor((P.qiAcc||0)*MARA.dev.qi);P.qiAcc=Math.max(0,(P.qiAcc||0)-lost);P.mara=MARA.dev.back;if(typeof recalc==='function')recalc();P.hp=Math.max(1,Math.min(P.hp,Math.round(P.maxHp*.3)));P.qi=Math.min(P.qi,P.maxQi);
  log(`마기가 역류해 주화입마에 빠졌습니다! 쌓은 내공 ${lost}이 흩어졌습니다.`,'dmg');showBanner('주화입마','마기가 역류했다');P.feats.push(`${Math.floor(P.age)}세에 마기에 먹혀 주화입마에 빠졌다`);fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1.2})}
// 폭주: 몇 초 동안 가장 가까운 것(같은 편·양민 포함)을 친다. 끝나면 강제공격을 원래대로
function maraBurst(){if(P.burst||G.duel)return;P.burst={t:MARA.burstDur,force:typeof forceAtk!=='undefined'?forceAtk:false,mode:P.mode};if(typeof toggleForce==='function')toggleForce(true);P.mode='auto';P.medit=false;P.chan=null;
  log('마기가 날뛰어 이성을 잃었습니다! 눈앞의 것을 가리지 않고 칩니다.','dmg');showBanner('폭주','마기가 날뛴다');P.feats.push(`${Math.floor(P.age)}세에 마기에 휘둘려 폭주했다`)}
function burstTick(dt){const B=P.burst;if(!B)return;B.t-=dt;if(B.t<=0){P.burst=null;if(typeof toggleForce==='function')toggleForce(B.force);P.mode=B.mode;log('마기가 가라앉아 정신이 돌아왔습니다.','info');return}
  if(!P.target||P.target.hp<=0||Math.random()<dt*2){let b=null,bd=8;for(const e of mobs)if(e.hp>0&&!e.ghost){const d=dist(e,P);if(d<bd){bd=d;b=e}}if(b){P.target=b;P.path=null}}
  if(Math.random()<dt*6)fx.push({t:'ghost',x:P.x,y:P.y,life:.3,col:'110,20,150'})}
hook('hit',c=>{if(c.from!==P)return;const t=maraTier();if(t)c.m*=1+MARA.atk[t];else if(isTalma())c.m*=1+MARA.atk[1]});
hook('hurt',c=>{const t=maraTier();if(t)c.dm*=1+MARA.dmg[t]});
hook('kill',e=>{if(!isMa()||!e||e.duel||e.ghost||(e.d&&e.d.passive))return;maraAdd(MARA.kill,'살생')});
// ---- 탈마 (마공 현경 폐관의 추가 조건) ----
// P.maraLow: 마성이 20 아래로 내려간 해(G.cal). 20 이상이 되면 지운다. 유지 1년이 조건, 그 뒤 1년마다 폐관 +5% (최대 +15%)
const TALMA=()=>MARA.talma||{low:20,hold:1,bonus:.05,max:.15};
const talmaHold=()=>P.maraLow==null?0:Math.max(0,G.cal-P.maraLow);
const talmaWall=r=>isMa()&&r===6;
function talmaWhy(r){if(!talmaWall(r))return'';const T=TALMA();
  if(P.sect!=='cheonma'||rankIdx('cheonma')<MG_ELDER)return'탈마는 마교 장로 이상만';
  if(talmaHold()<T.hold)return`마성 ${T.low} 미만을 ${T.hold}년 유지해야 (${Math.floor(talmaHold()*12)}/${T.hold*12}달)`;
  if(REG!=='hq_cheonma_8')return'천마동에서만';return''}
const talmaBonus=r=>{if(!talmaWall(r)||talmaWhy(r))return 0;const T=TALMA();return Math.min(T.max,Math.floor(talmaHold()-T.hold)*T.bonus)};
function talmaGain(r){if(!talmaWall(r))return;P.mara=0;P.maraLow=null;P.addict=null;P.thirst=0;log('마기를 다스려 탈마(脫魔)에 이르렀습니다. 마성이 더 오르지 않고 마공의 한계가 풀립니다.','xp');P.feats.push(`${Math.floor(P.age)}세에 마기를 다스려 탈마에 이르렀다`)}
function talmaFail(r){if(!talmaWall(r)||!P||P.hp<=0)return;P.maraLow=null;P.mara=Math.max(P.mara||0,MARA.dev.back);log(`마기가 역류해 마성이 ${Math.round(P.mara)}으로 치솟았습니다. 유지 기간은 처음부터입니다.`,'dmg')}
hook('tick',dt=>{if(!P||!playing||!isMa())return;burstTick(dt);
  if(!isTalma()){if((P.mara||0)<TALMA().low){if(P.maraLow==null)P.maraLow=G.cal}else P.maraLow=null}
  if(P.medit&&P.mara>0)maraAdd(-MARA.medit*dt);
  const t=maraTier();if(t>=2&&!P.burst&&inCombat()&&Math.random()<MARA.burst[t]*dt)maraBurst();
  if(t>=1&&Math.random()<dt*.5)for(const e of mobs)if(e.d&&e.d.villager&&!e.angry&&e.hp>0&&dist(e,P)<3&&!(e.flee>0)){e.flee=2;e.fleeFrom=P;addText(e.x,e.y-.4,'마인이다!','#d8b0ff')}});
// 깨달음은 마공 운용 중 절반, 사공·사불 70% (속성 수련에는 깨달음을 얻을 곳이 없다)
const enlMul=()=>{if(isTalma())return 1;const s=typeof pSchool==='function'&&P?pSchool():'정종';return MARA.enl[s]||1};
// 추살: 마교도가 명성을 얻으면 해마다 정의맹·사천맹의 추살조가 덮친다 (마교는 정·사 공통의 적)
function maraHunt(){if(!P||P.sect!=='cheonma'||P.fame<MARA.huntFame||G.duel||!REGION()||(REGIONS[REG]&&(REGIONS[REG].hq==='cheonma'||/^hq_cheonma/.test(REG))))return false;
  let made=0;const facs=['정','사'];const huntN=typeof diffSquad==='function'?diffSquad(MARA.huntN):MARA.huntN;for(let i=0;i<60&&made<huntN;i++){const a=Math.random()*Math.PI*2,r=6+Math.random()*3,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;if(!walkAt(x,y))continue;
    const e=mkFac(facs[made%2],made===huntN-1?1:0,x,y);e.aggro=true;e.hunt=1;mobs.push(e);made++}
  if(made){showBanner('추살',`정·사가 마교도의 목에 현상금을 걸었다`);log(`정의맹·사천맹의 추살조 ${made}명이 덮쳐 옵니다! 마교도는 강호의 공적이다.`,'dmg')}return made>0}
hook('newYear',()=>{if(P&&P.sect==='cheonma'&&P.fame>=MARA.huntFame)setTimeout(()=>{if(playing)maraHunt()},1500)});
// 천마신전: 마기 정련 (공적으로 마성을 내린다)
function maraHtml(){if(!isMa()&&!(P.mara>0))return '';const t=maraTier(),m=Math.round(P.mara||0),T=TALMA();
  if(isTalma())return `<div class="card"><h4>마성 <small class="dim">탈마: 마기를 다스렸다</small></h4><p><b class="gold">탈마</b> ${m}/100 · 마성이 더 오르지 않는다 · 공격 +${Math.round(MARA.atk[1]*100)}% · 폭주·주화입마 없음 · 깨달음 ×1</p></div>`;
  const tal=realmIdx()===5?`<p class="note">탈마(현경)까지: 마성 ${T.low} 미만 유지 ${Math.floor(talmaHold()*12)}/${T.hold*12}달 · 장로 ${P.sect==='cheonma'&&rankIdx('cheonma')>=MG_ELDER?'○':'×'} · 천마동 폐관 (실패하면 주화입마)</p>`:'';
  return `<div class="card"><h4>마성 <small class="dim">마공의 대가 · 수련·살생으로 오르고 운기조식·마기 정련으로 내린다</small></h4><p><b class="${t?'bad':'good'}">${MARA_N[t]}</b> ${m}/100 · 공격 +${Math.round(MARA.atk[t]*100)}% · 받는 피해 +${Math.round(MARA.dmg[t]*100)}%${t>=2?' · 싸움 중 폭주':''} · 깨달음 ×${enlMul()}</p>
    <p class="note">입마 ${MARA.tiers[0]} · 심마 ${MARA.tiers[1]} · 광마 ${MARA.tiers[2]} · 100이면 주화입마(쌓은 내공 ${Math.round(MARA.dev.qi*100)}% 손실). 마교도는 명성 ${MARA.huntFame}부터 해마다 정·사 추살조가 덮친다.</p>${tal}</div>`}
hook('hqDlg',c=>{if(c.n.hq!=='cheonma'||P.sect!=='cheonma')return;const m=P.merit.cheonma||0,no=(P.mara||0)<=0?'마성이 없다':m<MARA.refine.merit?`공적 ${MARA.refine.merit} 필요`:'';
  c.html+=`<div class="row2"><span class="note">마기 정련: 신전 제단에서 마기를 다스려 마성 -${MARA.refine.v} (지금 ${Math.round(P.mara||0)}). 공적 ${MARA.refine.merit}.</span>${B('mrefine',no||'마기 정련',{d:!!no,pri:!no})}</div>`});
hook('sectAct',c=>{if(c.a!=='mrefine')return;c.done=true;c.r=true;const m=P.merit.cheonma||0;if((P.mara||0)<=0||m<MARA.refine.merit)return;P.merit.cheonma=m-MARA.refine.merit;maraAdd(-MARA.refine.v);log(`제단의 마기를 가라앉혀 마성이 ${MARA.refine.v} 내렸습니다. (${Math.round(P.mara)})`,'xp')});

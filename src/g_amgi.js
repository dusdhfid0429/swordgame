// ================= 요대와 암기 (v186 → v191) =================
// 사용자 2026-10-26: "암기무공 사용시 장비중 요대를 추가하고 암기의 종류에 따라 이펙트 형태를 다르게 하고 수량을 추가" → '암기 개수를 소모'.
// v191 사용자 2026-10-27: "요대에 비도의 종류를 지정해두지 말고 요대에 추가하면 추가한 암기가 등록되게, 등록된 암기를 다 쓰면 시계방향으로 다음 암기를 소모,
//  요대에서 등록된 암기 중 현재 사용할 암기를 선택", "가격은 유지하고 묶음 단위는 100개".
// 요대(P.eq.belt)는 등록한 암기 목록 belt.reg(요대 칸 수 BELT_CAP만큼, 등록 순서가 시계방향)와 지금 쓰는 암기 belt.am 을 가진다.
// 암기를 얻으면(addMat) 빈 칸이 있을 때 저절로 등록된다. 한 발에 하나씩 재료(P.mats)에서 줄고, 고른 암기가 떨어지면 시계방향 다음 암기로 넘어간다.
// 모두 떨어지면 펼치던 암기 무공을 요대의 단도·절편으로 펼치는 단검술(없으면 기초권각)로 바꿔 든다(amgiOut). 암기를 다시 얻으면 돌아간다(amgiBack).
// 암기 초식의 투사체와 평타가 쓴다(r_exec.js exec proj, g_core.js basicStrike → amgiLoad). 비 초식·특수무공 암기는 그대로. 표는 data/amgi.json
const AMMO=GD.AMMO,BELTS=GD.BELTS,ASECT=GD.AMMO_SECT,PACK=GD.AMMO_PACK;
const ammoSect=k=>Object.keys(ASECT).find(s=>ASECT[s].includes(k))||null;
const AMMO_COMMON=Object.keys(AMMO).filter(k=>!ammoSect(k));   // 대장간·적이 흘리는 암기. 문파 비전 암기는 빼고
function mkBelt(q,i=0){const it=mkGear('belt',BELTS[Math.min(i,BELTS.length-1)],q,{hm:GD.BELT_HM});it.am=null;it.reg=[];it.mw=null;return it}
const ammoN=k=>P.mats[k]||0;
const beltCap=b=>GD.BELT_CAP[Math.max(0,BELTS.indexOf(b.name))]||GD.BELT_CAP[0];
const beltMw=()=>P&&P.eq.belt&&P.eq.belt.mw||null;
// 옛 요대(v186~190: am 하나만): 고른 암기와 가진 암기로 칸을 채운다
function beltNorm(b){if(!b)return b;if(!Array.isArray(b.reg)){b.reg=AMMO[b.am]?[b.am]:[];if(b===P.eq.belt)for(const k of Object.keys(AMMO))if(b.reg.length<beltCap(b)&&ammoN(k)>0&&!b.reg.includes(k))b.reg.push(k)}
  if(b.reg.some(k=>!AMMO[k]))b.reg=b.reg.filter(k=>AMMO[k]);if(!b.reg.includes(b.am))b.am=b.reg[0]||null;return b}
// 지금 쓸 암기: 고른 것이 떨어졌으면 시계방향(등록 순서) 다음 것. 하나도 없으면 null
function beltAmmo(){const b=P.eq.belt;if(!b)return null;beltNorm(b);if(b.am&&ammoN(b.am)>0)return b.am;
  const n=b.reg.length,i0=b.reg.indexOf(b.am);
  for(let j=1;j<=n;j++){const k=b.reg[(i0+j+n)%n];if(ammoN(k)>0){const was=b.am;b.am=k;if(was&&was!==k)log(`요대의 ${was}을(를) 다 써서 시계방향 다음 ${k}(으)로 넘어갑니다.`,'info');return k}}
  return null}
// 새로 얻은 암기를 찬 요대에 등록한다 (g_core.js addMat)
function beltReg(k){const b=P&&P.eq.belt;if(!b||!AMMO[k])return;beltNorm(b);
  if(!b.reg.includes(k)){if(b.reg.length>=beltCap(b)){log(`${b.name}의 칸이 다 차서 ${k}은(는) 등록하지 못했습니다. 행낭 창 요대에서 다른 암기를 빼고 넣으세요.`,'info');return}
    b.reg.push(k);log(`${k}을(를) 요대에 등록했습니다. (${b.reg.length}/${beltCap(b)}칸)`,'sys')}
  if(!(b.am&&ammoN(b.am)>0))b.am=k;amgiBack()}
// 투사체 하나에 암기를 싣는다. 실을 것이 없으면 false (그 발은 나가지 않는다)
function amgiLoad(q){const k=beltAmmo();if(!k)return false;const a=AMMO[k];P.mats[k]--;
  q.ammo=k;q.kind=a.pj;q.m*=a.m||1;
  if(a.spd){q.vx*=a.spd;q.vy*=a.spd}if(a.len)q.left*=a.len;if(a.pierce)q.pierce=true;if(a.kb)q.kb+=a.kb;if(a.stun)q.stun=Math.max(q.stun||0,a.stun);if(a.sz)q.size*=a.sz;
  if(a.psn)q.psn=Math.max(q.psn||0,a.psn);if(a.col){q.c=a.col;q.c2=a.col}if(a.boom)q.boom=a.boom;
  if(ammoN(k)===0&&!beltAmmo())log(`요대의 암기를 모두 썼습니다.`,'info');
  return true}
// 벽력자: 맞거나 떨어진 자리에서 터진다. 직접 맞은 적은 빼고 둘레만
function amgiBoom(q){if(q.boomed)return;q.boomed=1;const o={x:q.x,y:q.y},b=q.boom;
  for(const e of foes())if(e.hp>0&&!q.hit.has(e)&&dist(e,o)<b.r)hitE(q.X,e,q.m*b.m,.4,0,o);
  fx.push({t:'puff',x:o.x,y:o.y,life:.5});GL({t:'ring2',x:o.x,y:o.y,r:b.r,col:q.c||'255,170,80',w:4,life:.32},q.X);
  GL({t:'star',x:o.x,y:o.y,col:'255,210,120',s:1.3,life:.22},q.X);shake=Math.max(shake,.12)}
// 처음 암기 병기를 들면 가죽 요대와 비도를 한 번 받는다 (새 생·문파 입문·옛 저장 모두). v191: 요대에 단도를 차 주고 단검술을 익힌다
hook('recalc',()=>{if(!P||!P.eq.weapon||P.eq.weapon.cls!=='암')return;const g=GD.BELT_GIFT;
  if(!P.beltGift){P.beltGift=1;const b=mkBelt(1);
    if(!P.eq.belt){P.eq.belt=b;log(`암기를 담을 ${b.name}를 허리에 찼습니다.`,'sys')}else{giveItem(b);log(`${b.name}를 받았습니다.`,'sys')}
    addMat(g.am,g.n)}
  if(!P.dagGift){P.dagGift=1;const w=mkWeapon('단',1,0,g.mw);if(P.eq.belt&&!P.eq.belt.mw){P.eq.belt.mw=w;log(`요대에 ${w.name}를 찼습니다. 암기가 떨어지면 뽑아 들고 단검술로 싸웁니다.`,'sys')}else giveItem(w)}
  if(!P.arts[GD.DAGGER.id]){P.arts[GD.DAGGER.id]={p:0,f:GD.DAGGER.forms.map((f,i)=>i===0)};log(`[${GD.DAGGER.n}]을(를) 익혔습니다. 요대의 단도·절편으로 펼치는 단검 무공입니다.`,'xp')}});
// 장비 칸 설명
const beltTxt=it=>{beltNorm(it);const r=it.reg.length?it.reg.map(k=>it===P.eq.belt?`${k===it.am?'●':''}${k} ${ammoN(k)}`:k).join(' · '):'등록한 암기 없음';
  return `암기 ${it.reg.length}/${beltCap(it)}칸 ${r}${it.mw?` · 근접 ${it.mw.name}`:''}`};
// 행낭 창의 요대: 등록한 암기를 둥글게(시계방향) 늘어놓고, 눌러서 지금 쓸 암기를 고른다. 근접 무기 칸
function beltPick(){const b=P.eq.belt;if(!b)return '';beltNorm(b);const cap=beltCap(b),cur=beltAmmo()||b.am,mw=b.mw;
  const slots=[...Array(cap)].map((_,i)=>{const k=b.reg[i],a=i/cap*Math.PI*2-Math.PI/2,x=(50+Math.cos(a)*39).toFixed(1),y=(50+Math.sin(a)*39).toFixed(1);
    return `<button type="button" class="bslot${k&&k===cur?' on':''}${k&&!ammoN(k)?' out':''}" style="left:${x}%;top:${y}%"${k?` data-act="amk:${k}"`:' disabled'}>${k?`<b>${esc(k)}</b><small>${ammoN(k)}</small>`:'<small>빈 칸</small>'}</button>`}).join('');
  const add=Object.keys(AMMO).filter(k=>ammoN(k)>0&&!b.reg.includes(k)).map(k=>B('ama:'+k,`${k} ${ammoN(k)} 넣기`,{d:b.reg.length>=cap})).join('');
  const rm=b.reg.map(k=>B('amr:'+k,`${k} 빼기`)).join('');
  return `<div class="card"><h4>요대 <small class="dim">암기 ${b.reg.length}/${cap}칸 · 눌러 고른 암기를 다 쓰면 시계방향 다음 암기 · 모두 쓰면 ${mw?esc(mw.name)+'로 단검술':'맨손 권각'}</small></h4>
    <div class="bring">${slots}<div class="bcen"><small>지금</small><b>${cur?esc(cur):'없음'}</b><small>↻ 시계방향</small></div></div>
    <div class="row2"><span class="note">근접 무기 ${mw?`<b style="color:${itemCol(mw)}">${esc(itemLabel(mw))}</b> 공격력 ${mw.atk}${mw.hm?` · 현묘도 +${mw.hm}`:''}`:'없음 · 행낭의 단도·절편을 요대에 찬다'}</span>${mw?B('bmw:off','풀기'):''}</div>
    ${add?`<div class="ib">${add}</div>`:''}${rm?`<details><summary class="dim">암기 빼기</summary><div class="ib">${rm}</div></details>`:''}</div>`}
// 요대 단추: 고르기·넣기·빼기, 단도·절편 차기·풀기 (행낭 '장착'은 단검이면 요대로 간다)
hook('sectAct',c=>{const{a,x}=c,b=P.eq.belt;
  if(a==='eq'){const it=P.bag.find(i=>i.id===+x);if(!it||it.slot!=='weapon'||it.cls!=='단')return;c.done=true;c.r=true;
    if(!b){log('단도·절편은 요대에 찹니다. 먼저 요대를 차세요.','info');return}P.bag.splice(P.bag.indexOf(it),1);if(b.mw)P.bag.push(b.mw);b.mw=it;recalc();log(`요대에 ${itemLabel(it)}을(를) 찼습니다.`,'sys');return}
  if(!['amk','ama','amr','bmw'].includes(a))return;c.done=true;c.r=true;if(!b)return;beltNorm(b);
  if(a==='amk'&&b.reg.includes(x)){b.am=x;log(`요대 암기를 ${x}(으)로 골랐습니다.${ammoN(x)?'':' 다 떨어져 있어 다음 암기를 씁니다.'}`,'sys');amgiBack()}
  if(a==='ama'&&AMMO[x]&&!b.reg.includes(x)&&b.reg.length<beltCap(b)){b.reg.push(x);if(!(b.am&&ammoN(b.am)>0))b.am=x;log(`${x}을(를) 요대에 등록했습니다.`,'sys');amgiBack()}
  if(a==='amr'&&b.reg.includes(x)){b.reg.splice(b.reg.indexOf(x),1);if(b.am===x)b.am=b.reg[0]||null;log(`${x}을(를) 요대에서 뺐습니다.`,'sys')}
  if(a==='bmw'&&b.mw){if(P.bag.length>=24){log('행낭이 가득 찼습니다.','info');return}P.bag.push(b.mw);log(`${b.mw.name}을(를) 요대에서 풀었습니다.`,'sys');b.mw=null;if(P.cur===GD.DAGGER.id)setArt('base');recalc()}});
// ================= 암기 궤적 (v190) =================
// 사용자 2026-10-27: "직선 말고 나선형이나 호를 그리며, 총알처럼 회전하며 강한 한 방", "부채꼴·원형으로 날리다 선형으로 목표물에게", "곧게 꺾여 가기도 하고 부드러운 곡선으로도",
// "암기술이 주재인 무협소설을 참고". 참고한 수법(이름은 초식 설명 줄 PATH_N):
//  · 겹나선 spiral — 당문 독침이 두 가닥으로 꼬여 날아가 막기 어렵다는 묘사 (당가 탈명침류)
//  · 호 arc — 회선표·비황석처럼 옆으로 벌어졌다 휘어 들어와 정면을 막은 상대의 옆구리를 친다
//  · 꺾임 gather — 만천화우·천녀산화: 하늘 가득 흩뿌린 암기가 한 점으로 모인다
//  · 소용돌이 vortex — 폭우이화침(고룡 칠종무기)처럼 쏟아지며 휘몰아친다
//  · 회전 일격 bullet — 소리비도 '例不虛發': 한 번 던지면 헛나가지 않는 단 한 자루. 손에 기를 모았다 회전하며 꿰뚫는다
// 초식 path(data/arts.json AMGI·AMGIU), 수치 GD.AMGI_PATH. 조준(amgiAim)·같은 적 감쇠는 그대로 쓴다
const APATH=GD.AMGI_PATH;
const PATH_N={spiral:'겹나선',arc:'휘어 들기',gather:'흩뿌렸다 꺾임',vortex:'소용돌이',bullet:'회전 일격'};
const angW=d=>Math.atan2(Math.sin(d),Math.cos(d));
// 적이 없을 때 휘는 궤적이 모일 자리: 바라보는 쪽 사거리 0.6
const amgiAimPt=len=>({x:P.x+P.fx*len*.6,y:P.y+P.fy*len*.6});
// 쏜 투사체에 궤적을 붙인다. a0 = 초식 본래 모양(부채꼴·원형)의 방향, i 몇 번째 발, n 발 수
// 겨눈 적이 없는 남는 발(둘러싸였을 때)은 휘지 않고 곧게 간다
function amgiFly(q,path,a0,tg,aim,i,n){const T=APATH[path];if(!T||!tg&&!aim&&(path==='arc'||path==='gather'))return;const sp=Math.hypot(q.vx,q.vy);
  q.path=path;q.tg=tg;q.aim=tg?{x:tg.x,y:tg.y}:{...aim};q.age=0;q.sp=sp;let a=Math.atan2(q.vy,q.vx);
  if(path==='arc'){const b=Math.atan2(q.aim.y-q.y,q.aim.x-q.x),d=angW(a0-b),side=Math.abs(d)>.02?Math.sign(d):(i%2?-1:1);const off=side*T.bend+(n>1?d*.5:0);a=b+off;q.k=Math.max(T.turn,2*Math.abs(off)*sp/Math.max(.6,dist(q,q.aim))*1.1);q.left*=APATH.len}   // 원호 하나로 목표에 닿는 회전 속도
  else if(path==='gather'){a=a0;q.t1=T.t+i*T.dt;q.left*=APATH.len}
  else if(path==='vortex'){q.o={x:q.x,y:q.y};q.th=a0;q.r=0;q.left*=APATH.len}
  else if(path==='spiral'){q.b={x:q.x,y:q.y};q.ph0=i%2?Math.PI:0}
  else if(path==='bullet'){q.sp*=T.spd;q.spin=0}
  q.vx=Math.cos(a)*q.sp;q.vy=Math.sin(a)*q.sp}
// 한 틱 움직인다 (r_exec.js updateProjs가 path 있는 투사체에 부른다). 실제로 간 길만큼 사거리를 줄인다
function amgiMove(q,dt){const T=APATH[q.path],ox=q.x,oy=q.y;q.age+=dt;
  if(q.tg&&q.tg.hp>0&&!q.hit.has(q.tg)){q.aim.x=q.tg.x;q.aim.y=q.tg.y}
  const steer=k=>{if(q.done)return;const h=Math.atan2(q.vy,q.vx),d=angW(Math.atan2(q.aim.y-q.y,q.aim.x-q.x)-h),s=Math.hypot(q.vx,q.vy),nh=h+Math.max(-k*dt,Math.min(k*dt,d));q.vx=Math.cos(nh)*s;q.vy=Math.sin(nh)*s};
  const near=()=>{if(!q.done&&(dist(q,q.aim)<.45||q.tg&&q.hit.has(q.tg)))q.done=1};
  switch(q.path){
    case'spiral':{const b=q.b;b.x+=q.vx*dt;b.y+=q.vy*dt;const R=T.r*Math.min(1,q.age*T.grow),w=q.age*T.w+q.ph0,sn=Math.sin(w)*R/q.sp;
      q.x=b.x-q.vy*sn;q.y=b.y+q.vx*sn;q.hz=Math.cos(w)*R*T.hz;break}
    case'vortex':{q.r+=q.sp*T.grow*dt;q.th+=T.w*dt/(1+q.r*1.5);q.x=q.o.x+Math.cos(q.th)*q.r;q.y=q.o.y+Math.sin(q.th)*q.r;
      if(q.tg&&q.age>T.home){const s=q.sp*APATH.gather.boost,a=Math.atan2(q.aim.y-q.y,q.aim.x-q.x);q.path='gather';q.t1=0;q.turned=1;q.vx=Math.cos(a)*s;q.vy=Math.sin(a)*s;q.left=Math.max(q.left,dist(q,q.aim)+1.2);amgiTurnFx(q)}break}
    case'arc':steer(q.k*(1+q.age*T.acc));near();q.x+=q.vx*dt;q.y+=q.vy*dt;break;
    case'gather':{const G=APATH.gather;if(q.age<q.t1){q.x+=q.vx*G.spd*dt;q.y+=q.vy*G.spd*dt;break}
      if(!q.turned){q.turned=1;const a=Math.atan2(q.aim.y-q.y,q.aim.x-q.x),s=q.sp*G.boost;q.vx=Math.cos(a)*s;q.vy=Math.sin(a)*s;q.left=Math.max(q.left,dist(q,q.aim)+1.2);amgiTurnFx(q)}
      if(q.tg&&!q.done)steer(30);near();q.x+=q.vx*dt;q.y+=q.vy*dt;break}
    default:q.spin=(q.spin||0)+dt*45;q.x+=q.vx*dt;q.y+=q.vy*dt}
  const mv=Math.hypot(q.x-ox,q.y-oy);q.left-=mv;if(dt>0){q.dvx=(q.x-ox)/dt;q.dvy=(q.y-oy)/dt}return true}
// 꺾이는 자리에 작은 번뜩임
function amgiTurnFx(q){GL({t:'star',x:q.x,y:q.y,col:q.c,s:.45,life:.14},q.X)}
// 회전 일격: 손끝에 기를 모은다
function amgiCharge(X,c){const T=APATH.bullet;GL({t:'vortex',x:P.x,y:P.y,r:.8,col:c,w:2,life:T.charge+.06},X);fx.push({t:'ghost',x:P.x,y:P.y,life:.2,col:c})}
// 회전 일격이 맞은 자리: 꿰뚫는 충격
function amgiImpact(q,e){GL({t:'ring2',x:e.x,y:e.y,r:.9,col:q.c,w:4,life:.3},q.X);GL({t:'star',x:e.x,y:e.y,col:'255,255,255',s:1.4,life:.2},q.X);
  fParts(q.X,e,q.c,10,110,'dot',.45);shake=Math.max(shake,.2)}
// 회전 일격 그림: 탄도에 감기는 두 가닥 강선(腔線) 같은 빛줄기와, 축을 따라 도는 몸통(세로로 줄었다 늘었다)
function drawBulletSpin(q,s){const sp=q.spin||0;
  for(let k=0;k<2;k++){ctx.strokeStyle=rgba(k?HI:q.c,.75);ctx.lineWidth=1.3*s;ctx.beginPath();for(let x=-44;x<=2;x+=3){const y=Math.sin(x*.32+sp+k*Math.PI)*4.5*s*(1+x/60);x===-44?ctx.moveTo(x*s,y):ctx.lineTo(x*s,y)}ctx.stroke()}
  glowDot(4*s,0,12*s,q.c,.55);ctx.scale(1,.35+.65*Math.abs(Math.cos(sp)))}
// ================= 암기가 떨어지면 단검술 (v191) =================
// 사용자 2026-10-27: "암기를 모두 소모하면 근접의 형태로 사용하게 해달라고 했는데 여전히 유엽비도가 발사돼" — 평타가 공짜 비도를 던지고 있었다.
// 이어서: "암기무공을 사용하면 요대에 단검을 장착, 암기를 모두 소모하면 단검을 사용한 단검무공. 기존 근접 무공 전환 대신 암기무공과 단검무공을 별도의 무공으로 분리,
//  요대에 장착할 수 있는 근접무기는 단도·절편, 요대에 근접 무기가 없으면 권각술". v190의 '비도 쥔 근접(위력 절반)'은 없앴다.
// 암기 무공을 펼치는데 요대에 쓸 암기가 없으면 단검술(GD.DAGGER, 요대의 단도·절편)로, 근접 무기가 없으면 기초권각으로 바꿔 든다.
// 바꾸기 전 무공은 P.amgiBack 에 두고, 암기를 다시 얻거나 넣으면 돌아간다. 평타도 암기를 하나씩 쓴다
let AMGI_FREE=false;   // 이펙트 뷰어 '초식 본래 모양'·시험만 켠다: 암기 없이도 던지고 바꿔 들지 않는다
function amgiOut(){if(AMGI_FREE||!P||curCls()!=='암')return;const fb=hasWeaponFor('단')&&A(GD.DAGGER.id)?GD.DAGGER.id:'base',was=P.cur;
  setArt(fb);P.amgiBack=was;
  log(fb==='base'?`요대에 쓸 암기도, 찬 단검도 없어 맨손 권각으로 싸웁니다.`:`요대에 쓸 암기가 없어 ${beltMw().name}을(를) 뽑아 들고 ${ARTS[fb].n}으로 싸웁니다.`,'info')}
function amgiBack(){if(!P||!P.amgiBack||AMGI_FREE)return;if(P.cur!==GD.DAGGER.id&&P.cur!=='base'){P.amgiBack=null;return}
  const id=P.amgiBack;if(!A(id)||!hasWeaponFor('암')||!beltAmmo())return;P.amgiBack=null;setArt(id);log(`요대에 암기가 있어 다시 ${ARTS[id].n}을(를) 펼칩니다.`,'info')}
let amgiT=0;
hook('tick',dt=>{if(!P||AMGI_FREE||(amgiT-=dt)>0)return;amgiT=.25;if(curCls()==='암'&&hasWeaponFor('암')){if(!beltAmmo())amgiOut()}else if(P.amgiBack)amgiBack()});
// 단검술이 맞힐 때: 손에 쥔 단도가 짧게 휘둘러진다 (r_exec.js fxHit)
function dagHitFx(X,e){const a=Math.atan2(e.y-P.y,e.x-P.x),s=Math.random()<.5?-1:1;GL({t:'dag',x:P.x,y:P.y,a0:a-.7*s,a1:a+.7*s,r:.8,col:X.art.c,life:.18},X)}
// 손에 쥔 단도가 휘둘러지는 그림 (r_fx.js drawGlow2 → 't:dag')
function drawDag(f){const k=f.life/f.max,t=1-k,a=f.a0+(f.a1-f.a0)*Math.min(1,t*1.4),p=toScreen(f.x+Math.cos(a)*f.r,f.y+Math.sin(a)*f.r),o=toScreen(f.x,f.y),
    ang=Math.atan2(p.y-o.y,p.x-o.x);ctx.save();ctx.translate(p.x,p.y-26);ctx.rotate(ang);ctx.globalAlpha*=Math.min(1,k*3);
  ctx.fillStyle='#4a3a2c';ctx.fillRect(-9,-1.3,6,2.6);ctx.fillStyle='#b8a070';ctx.fillRect(-3.4,-3.4,1.8,6.8);
  ctx.fillStyle='#c9d2dc';ctx.beginPath();ctx.moveTo(-1.6,-2.2);ctx.lineTo(9,-1);ctx.lineTo(14,0);ctx.lineTo(9,1);ctx.lineTo(-1.6,2.2);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#f4f8ff';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-1,0);ctx.lineTo(13,0);ctx.stroke();glowDot(13,0,6,f.col,.6*k);ctx.restore()}
// ================= 문파 비전 암기와 설계도 (v191) =================
// 사용자 2026-10-27: "대장간 말고 사천당가에는 비전 암기가 별도로 있고, 암기를 주력 무공으로 사용하는 문파들은 각각 서로 다른 비전 암기를 최소 10종류(문파 간 겹치면 안 돼),
//  문파를 멸문시키면 설계도를 입수, 주력무공이 암기인 문파는 문파의 대장장이가 별도로 있어 설계도 전달 시 해당 문파에서 설계도의 암기를 구매".
// - 비전 암기 목록 data/amgi.json AMMO_SECT (주력 무공 START.w 가 암기인 사천당가·하오문). 일반 대장간은 팔지 않는다.
// - 그 문파 외원의 암기방(없으면 본산 마당)에 문파 대장장이(asmith)가 있다. 자기 문파 비전 암기는 문도에게만 판다.
// - 그 문파를 멸문시키면(마지막 한 명을 벤 때, 놓쳤으면 폐허에 들어설 때) '<문파> 비전 암기 설계도첩'(slot bp)을 얻는다. 생마다 한 번 (P.bp).
// - 다른 암기 문파의 대장장이에게 전하면 G.bpAt[그 문파]에 남고, 그 대장장이가 그 암기를 누구에게나 판다 (윤회해도 남는다).
const BP_PRICE=300;
const AMGI_SECTS=Object.keys(ASECT).filter(s=>SECTS[s]);
const bpAt=sid=>(G.bpAt=G.bpAt||{})[sid]=G.bpAt[sid]||[];
for(const sid of AMGI_SECTS){const s=SECTS[sid],O=REGIONS[`hq_${sid}_outer`],nm=sid==='dang'?'당문 암기방':`${s.n} 암기방`,n={id:'asmith',asmith:sid,n:`${nm} 대장장이`,x:0,y:0,pal:'smithy'};
  if(O&&O.stage){O.npcs=O.npcs||[];O.npcs.push(n);hallAdd(O.stage.id,3,O.stage.builds[3],nm,['asmith'],{kit:'smith'})}
  else{const M=REGIONS[hqId(s)];if(M){M.npcs=M.npcs||[];M.npcs.push({...n,x:23.5,y:14.6})}}}
function mkBp(sid){const s=SECTS[sid];return{id:++itemId,slot:'bp',sect:sid,name:`${s.n} 비전 암기 설계도첩`,price:BP_PRICE}}
const bpDesc=it=>`${SECTS[it.sect]?SECTS[it.sect].n:''} 비전 암기 ${(ASECT[it.sect]||[]).length}가지의 설계도 · 다른 암기 문파의 대장장이(${AMGI_SECTS.filter(s=>s!==it.sect).map(s=>SECTS[s].n).join('·')})에게 전하면 거기서 판다`;
function bpRead(it){log(`[${it.name}] ${(ASECT[it.sect]||[]).join(', ')}. ${bpDesc(it)}.`,'sys')}
function bpGive(sid,how){if(!P||!ASECT[sid])return;P.bp=P.bp||{};if(P.bp[sid])return;P.bp[sid]=1;const it=mkBp(sid);giveItem(it);
  log(`${how==='ruin'?`폐허가 된 ${SECTS[sid].n}의 암기방 잔해에서`:`멸문한 ${SECTS[sid].n}에서`} [${it.name}]을(를) 손에 넣었다. 비전 암기 ${ASECT[sid].length}가지의 설계도다.`,'xp');
  showBanner('설계도 입수',it.name);feat(`${SECTS[sid].n}의 비전 암기 설계도를 손에 넣었다`)}
hook('kill',e=>{if(e&&e.sect&&ASECT[e.sect]&&sectPop(e.sect)<=0)bpGive(e.sect,'kill')});   // g_pop.js 의 kill 훅(인원 줄이기) 다음에 돈다
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||!R.dead||!P)return;const s=ruinSect(R);if(s&&ASECT[s.id]&&sectPop(s.id)<=0)bpGive(s.id,'ruin')});
// 문파 대장장이 창
function asmithRows(sid,list,mem){return list.map(k=>{const a=AMMO[k],p=worldPrice(a.p),own=ammoSect(k);
  return shopRow(`${k} ${PACK}${a.unit}`,`${SECTS[own].n} 비전 암기 · ${a.d}${own===sid&&!mem?' · 문도에게만 판다':''}`,p,`abuy:${sid}:${k}`,own===sid&&!mem||P.silver<p)}).join('')}
function asmithDlg(n){const sid=n.asmith,s=SECTS[sid],mem=P.sect===sid,got=bpAt(sid),bps=P.bag.filter(it=>it.slot==='bp'&&it.sect!==sid);
  return `<p class="note">"${mem?`${rankName(sid)}, 쓸 만큼 가져가게. ${s.n}의 비전 암기는 밖에 내놓지 않네.`:`${s.n}의 비전 암기는 문도에게만 판다오. 다른 문파의 설계도를 가져오면 그건 만들어 주지.`}"</p>
    <h4>${s.n} 비전 암기 <small class="dim">${PACK}개 묶음</small></h4><div class="list">${asmithRows(sid,ASECT[sid],mem)}</div>
    ${got.length?`<h4>설계도로 만드는 암기 <small class="dim">전해 준 설계도 · 누구에게나</small></h4><div class="list">${asmithRows(sid,got,mem)}</div>`:''}
    ${bps.length?`<h4>설계도 전하기</h4><div class="list">${bps.map(it=>`<div class="it"><div>${esc(it.name)}<span>${esc(ASECT[it.sect].join(' · '))}</span></div><div class="ib">${B(`bpgive:${it.id}:${sid}`,'전하기')}</div></div>`).join('')}</div>`:''}`}
hook('npcDlg',c=>{if(c.html==null&&c.n.asmith)c.html=asmithDlg(c.n)});
hook('sectAct',c=>{const{a,x,y}=c;
  if(a==='abuy'){c.done=true;c.r=true;const a0=AMMO[y];if(!a0||!ASECT[x])return;const ok=ASECT[x].includes(y)?P.sect===x:bpAt(x).includes(y);if(!ok)return;
    const p=worldPrice(a0.p);if(P.silver<p)return;P.silver-=p;addMat(y,PACK);log(`${y} ${PACK}${a0.unit}을(를) 샀습니다. (은자 -${p})`,'sys');return}
  if(a==='bpgive'){c.done=true;c.r=true;const it=P.bag.find(i=>i.id===+x&&i.slot==='bp');if(!it||!ASECT[y]||it.sect===y)return;
    const L=bpAt(y),add=ASECT[it.sect].filter(k=>!L.includes(k));L.push(...add);P.bag.splice(P.bag.indexOf(it),1);
    log(`${SECTS[y].n} 대장장이에게 [${it.name}]을(를) 전했습니다. 이제 여기서 ${SECTS[it.sect].n}의 비전 암기 ${L.filter(k=>ammoSect(k)===it.sect).length}가지를 살 수 있습니다.`,'xp');feat(`${SECTS[it.sect].n}의 암기 설계도를 ${SECTS[y].n}에 전했다`)}});

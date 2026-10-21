// ================= 기연동굴과 소문 (v157, 사용자 2026-10-20) =================
// "기연을 맵에 랜덤하게 생성하지 말고, 기연동굴 입구를 전체 맵에 랜덤 배치, NPC 근처에 가면 말풍선으로 장소를 유추. 소문이 너무 퍼진 기연은 세력 무사들의 세력전"
// "한 번 소모된 기연동굴은 완전 새로 시작하기 전에는 리셋되지 않는다. 기연으로 얻은 영약·비급은 행낭에 들어오고, 문파에 기부하면 문파 무공으로 기록. 완전 새로 시작하면 리셋"
// "창안 무공도 가입한 문파의 제자들에게 전수하면 그 문파 무공으로 등록" / "문파의 기존 최고 등급보다 높은 무공이면 문파 무공 등급이 올라 세력 확장에 반영"
// - 배치: G.gyc가 없을 때(완전 새로 시작, 옛 저장) 한 번. 동굴 GYC.n곳을 서로 다른 성의 들판·명소 맵에 고르고(산 명소를 더 자주), 맵 안의 목표 자리를 정한다.
//   입구 칸은 그 맵을 처음 열 때 목표에서 가장 가까운, 맵 출입구에서 걸어 닿는 칸으로 정한다(맵은 씨앗으로 늘 같게 만들어지므로 한 번 정하면 그대로).
// - 동굴 안: g_cave.js의 genCave/bakeCave(종유굴·용암굴·얼음굴, 호스트 맵 테마로 고른다). 안쪽 방에 수호자와 기연 상자(gybox). 상자는 한 번만 열린다.
// - 소문(c.rumor 0~100): 해마다 오른다. NPC(사람·양민) 곁에 가면 말풍선으로 소문을 흘린다. 멀리 있는 동굴일수록 소문이 커야 들리고,
//   소문이 클수록 자세하다(성 → 맵 이름 → 맵 안의 방위). 들은 소문은 임무창 '기연 소문'에 남는다.
// - 세력전: 소문이 GYC.rumor.war를 넘으면 입구에 세력 무사들이 모여 서로 싸운다(맵에 들어가 입구 가까이 가면 나타남).
//   GYC.rumor.take에 닿을 때까지 아무도 상자를 열지 않으면, 그 해에 싸우던 세력 중 하나(힘이 셀수록 잘)가 차지해 그 문파의 무공이 된다.
// - 문파 무공 등록: 기연 무공 비급을 문파 창에서 기증(G.gyDon)하거나, 창안 무공을 제자들에게 전수(G.made[..].sect)하면 그 문파 고유 무공 목록에 들어가 공적으로 비급을 받는다.
//   그 무공이 문파가 본래 가진 최고 등급보다 높으면 문파 무공 등급이 오르고, 오른 등급마다 세력 힘 계산에서 인원이 GYC.powPerGrade만큼 더 쳐진다(sectUp, g_pop.js facStrength).
// 설계: docs/세력_문파_설계.md 33장. 테스트: tests/t94_gyc.js
const gycId=i=>'gyc_'+i;
const gycOf=id=>{const m=/^gyc_(\d+)$/.exec(id||'');return m&&G.gyc?G.gyc.list[+m[1]]:null};
const gycSeen=g=>{const c=G.gyc&&G.gyc.list[g.gyc];return !!(c&&(c.seen||c.mark))};
// 동굴을 둘 수 있는 맵: 성 조각 맵(들판)과 성도·본산이 아닌 명소. 산 명소(봉우리·설산·협곡·숲)는 더 자주
function gycHosts(){const W=GYC.hostW,out=[];
  for(const[id,R]of Object.entries(REGIONS)){if(R.hq||R.in||R.hall||R.city||R.neutral||R.acad||R.maeng||R.cave||!R.prov)continue;
    if(id.startsWith('pv_')){if(isPvFull(id))continue;out.push({id,w:W.pv})}
    else if(id.startsWith('lm_')||id==='sungsan')out.push({id,w:GYC.mountTh.includes(R.theme)?W.lmMount:W.lm})}
  return out}
function gycInit(){
  const hosts=gycHosts(),list=[],used=new Set(),arts=Object.keys(GY_ARTS).sort(()=>Math.random()-.5).slice(0,GYC.arts),names={};
  for(let i=0;i<GYC.n;i++){const pool=hosts.filter(h=>!used.has(REGIONS[h.id].prov));if(!pool.length)break;
    let r=Math.random()*pool.reduce((a,h)=>a+h.w,0),h=pool[0];for(const q of pool){if((r-=q.w)<=0){h=q;break}}
    const R=REGIONS[h.id];used.add(R.prov);const S=R.size||40,H=R.h||S,th=GYC.themeOf[R.theme]||'stone';
    const nl=(GYC.names[th]||GYC.names.stone).filter(n=>!Object.values(names).includes(n)),name=pick(nl.length?nl:GYC.names[th]);names[i]=name;
    list.push({i,host:h.id,ax:3+Math.floor(Math.random()*(S-6)),ay:4+Math.floor(Math.random()*(H-8)),x:null,y:null,th,name,seed:1000+Math.floor(Math.random()*9e4),
      rumor:R1(GYC.rumor.start[0],GYC.rumor.start[1]),art:arts[i]||null,done:0,by:null,who:null,heard:-1,hints:{},facs:null,seen:0})}
  G.gyc={list};G.gyDon=G.gyDon||{};gycSync()}
// G가 바뀌었을 때(불러오기·완전 새로 시작) 동굴 지역·입구와 문파 등록을 맞춘다
let gycG=null;
function gycSync(){gycG=G;
  for(const id of Object.keys(REGIONS))if(id.startsWith('gyc_'))delete REGIONS[id];
  for(const R of Object.values(REGIONS))if(R.gates&&R.gates.some(g=>g.gyc!=null))R.gates=R.gates.filter(g=>g.gyc==null);
  for(const c of(G.gyc?G.gyc.list:[])){const R=REGIONS[c.host];if(!R)continue;gycDefine(c);
    R.gates.push({x:(c.x??c.ax)+.5,y:(c.y??c.ay)+.5,to:gycId(c.i),tx:22.5,ty:40.3,label:c.name,gyc:c.i,door:1})}
  sectRegSync()}
function gycDefine(c){const T=CAVE_TH[c.th],sp=GYC.spawns[c.th]||[];
  REGIONS[gycId(c.i)]={name:c.name,in:1,cave:{dark:T.dark,dk:T.dk},theme:'dark',size:44,gyc:c.i,
    gen:()=>{genCave({th:c.th,w:44,h:44,seed:c.seed});for(const n of nodes)if(n.t==='chest'){n.t='gybox';n.gyc=c.i;n.cd=c.done?99999:0}},
    bake:()=>bakeCave(c.th),zone:()=>c.name,spawns:sp.map(([k,n,y])=>[k,n,(x,yy)=>yy<y]),bosses:[],npcs:[],
    gates:[{x:22.5,y:42.4,to:c.host,tx:(c.x??c.ax)+.5,ty:(c.y??c.ay)+1.6,label:'동굴 밖'}]}}
// 호스트 맵을 처음 열 때 입구 칸을 정한다: 맵 출입구(없으면 가운데)에서 걸어 닿는 칸 가운데 목표에 가장 가깝고 다른 출입구와 떨어진 곳
hook('regionGen',id=>{if(!G.gyc)return;for(const c of G.gyc.list){if(c.host!==id)continue;
  if(c.x==null){const R=REGIONS[id],gs=R.gates.filter(g=>g.gyc==null),s0=gs.length?{x:Math.floor(gs[0].x),y:Math.floor(gs[0].y)}:{x:N>>1,y:NH>>1};
    let st=null;for(let r=0;r<20&&!st;r++)for(let j=-r;j<=r&&!st;j++)for(let i=-r;i<=r;i++){const X=clamp(s0.x+i,1,N-2),Y=clamp(s0.y+j,1,NH-2);if(walk(X,Y)){st=[X,Y];break}}
    const seen=new Set(),q=st?[st]:[];let best=null,bd=1e9;
    for(let h=0;h<q.length&&h<20000;h++){const[x,y]=q[h];const k=x+','+y;if(seen.has(k))continue;seen.add(k);
      if(walk(x,y)&&walk(x,y+1)&&y<NH-2&&gs.every(g=>Math.hypot(g.x-x,g.y-y)>4)){const d=Math.hypot(x-c.ax,y-c.ay);if(d<bd){bd=d;best={x,y}}}
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>0&&Y>0&&X<N-1&&Y<NH-1&&walk(X,Y)&&!seen.has(X+','+Y))q.push([X,Y])}}
    const p=best||{x:clamp(c.ax,2,N-3),y:clamp(c.ay,2,NH-3)};c.x=p.x;c.y=p.y;
    const g=REGIONS[id].gates.find(g=>g.gyc===c.i);if(g){g.x=c.x+.5;g.y=c.y+.5}const cg=REGIONS[gycId(c.i)].gates[0];cg.tx=c.x+.5;cg.ty=c.y+1.6}
  for(let j=c.y-1;j<=c.y+1;j++)for(let i=c.x-1;i<=c.x+1;i++)if(map[j]&&map[j][i]){objs[j][i]=null;if(map[j][i].g===2)map[j][i].g=1}}});
// ---- 동굴 안: 수호자와 기연 상자 ----
hook('regionLoaded',id=>{gycWarDone=false;const c=gycOf(id);if(!c)return;
  if(!c.seen){c.seen=1;log(`${c.name}. 소문의 기연동굴이다. 안쪽 깊은 곳에 무언가가 잠들어 있다.`,'sys');feat(`소문을 좇아 ${REGIONS[c.host].name}의 ${c.name}을(를) 찾아냈다`)}
  if(c.done||!CAVE||!CAVE.rooms)return;const rm=CAVE.rooms[2],gd=GYC.guard,e=mkMob(gd[c.th]||'강시',rm.x+.5,rm.y+1.5);
  e.name=`${c.name} 수호자`;e.gycGuard=c.i;e.fixed=1;e.realm=Math.min(7,Math.max(2,realmIdx()+1));if(typeof scaleMob==='function')scaleMob(e);
  e.maxHp=e.hp=Math.round(e.maxHp*gd.hp);e.atk=Math.round(e.atk*gd.atk);mobs.push(e)});
function gycOpen(n){const c=G.gyc&&G.gyc.list[n.gyc];if(!c)return;
  if(c.done||n.cd>0){log(c.by&&c.by!=='me'?`비어 있다. ${SECTS[c.by]?SECTS[c.by].n:'누군가'}이(가) 먼저 휩쓸어 갔다.`:'이미 연 상자다. 이 동굴의 기연은 다했다.','info');return}
  if(mobs.some(m=>m.gycGuard===c.i&&m.hp>0)){log(`${c.name} 수호자가 상자를 지키고 있다. 먼저 쓰러뜨려야 한다.`,'dmg');return}
  P.chan={t:0,dur:1.6,label:'상자를 연다',fn:()=>gycLoot(c,n)}}
function gycLoot(c,n){n.cd=99999;c.done=1;c.by='me';c.who=P.name;const got=[];
  const art=c.art&&ARTS[c.art]&&!P.arts[c.art]&&!gyInBag(c.art)&&!gycDonOwner(c.art)?c.art:typeof mkGyRoll==='function'?mkGyRoll('cave'):null;
  if(art)got.push(gyGive(art).n+' 비급');
  for(const[k,m]of GYC.loot){const kk=k==='주과'?null:k;for(let j=0;j<m;j++){const nm=kk||pick(Object.keys(GYC.fruits));addMat(nm);got.push(nm)}}
  if(!art){const b=randomBook();P.bag.push(b);got.push(b.name);const sg=pick(Object.keys(SHINGONG));P.bag.push(mkGPage(sg,2));got.push(`절세신공 잔결 ${sg}`)}
  log(`${c.name}의 기연: ${got.join(' · ')}을(를) 얻었다. 모두 행낭에 넣었다.`,'xp');showBanner(c.name,art?`${ARTS[art].n} 비급`:'기연의 보물');
  feat(`${c.name}에서 기연을 얻었다${art?` (${ARTS[art].n})`:''}`);fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1.6});runHooks('giyeonDone',{src:'cave'});saveGame(true)}
// ---- 소문: 해마다 퍼지고, 다 퍼지면 세력이 차지한다 ----
hook('newYear',()=>{if(!G.gyc)return;const Rm=GYC.rumor;
  // 해마다 오르는 폭은 동굴 씨앗과 해로 정한다 (Math.random을 쓰지 않아 다른 해넘이 규칙의 난수 순서를 흐트러뜨리지 않는다)
  for(const c of G.gyc.list){if(c.done)continue;const was=c.rumor,r=rng(c.seed+Math.floor(G.cal)*131);c.rumor=Math.min(Rm.take,c.rumor+Rm.year[0]+Math.floor(r()*(Rm.year[1]-Rm.year[0]+1)));
    if(was<Rm.war&&c.rumor>=Rm.war){c.facs=GYC.war.facs[Math.floor(r()*GYC.war.facs.length)];log(`강호에 소문이 파다하다: ${REGIONS[c.host].name} 어딘가의 기연을 두고 ${c.facs.map(f=>FAC4N[f]).join('·')} 무사들이 모여든다고 한다.`,'info')}
    if(c.rumor>=Rm.take)gycTake(c)}});
// 세력전 끝: 싸우던 세력 가운데 힘에 비례해 하나가 차지하고, 그 세력의 살아 있는 문파 하나의 무공이 된다
function gycTake(c){const facs=c.facs||GYC.war.facs[0],w=G.W&&G.W.pow||{},rr=rng(c.seed+7);let r=rr()*facs.reduce((a,f)=>a+Math.max(5,w[f]||30),0),f=facs[0];
  for(const q of facs){if((r-=Math.max(5,w[q]||30))<=0){f=q;break}}
  const ss=Object.values(SECTS).filter(s=>alFac(s.al)===f&&(typeof sectPop!=='function'||sectPop(s.id)>0)).sort((a,b)=>(b.tier==='big'||b.tier==='one')-(a.tier==='big'||a.tier==='one')),s=ss.length?ss.slice(0,4)[Math.floor(rr()*Math.min(4,ss.length))]:null;
  c.done=1;c.by=s?s.id:f;const art=c.art&&!(P&&P.arts[c.art])&&!gycDonOwner(c.art)?c.art:null;
  if(s&&art){(G.gyDon[s.id]=G.gyDon[s.id]||[]).push(art);sectRegSync()}
  log(`${c.name}의 기연은 ${s?s.n:FAC4N[f]}이(가) 차지했다.${s&&art?` 천고의 무공 [${ARTS[art].n}]이(가) ${s.n}의 무공이 되었다.`:''}`,'info')}
// NPC가 아는 소문 하나 (없으면 null): 멀수록 소문이 커야 들린다
let gycHop=null,gycHopReg=null;
function gycRumorFor(boost=1){if(!G.gyc)return null;if(gycHopReg!==REG){gycHop=regHops(REG);gycHopReg=REG}
  const ok=G.gyc.list.filter(c=>{const h=gycHop[c.host]??30;return c.rumor>=h*GYC.rumor.knowHop*boost||c.host===REG});if(!ok.length)return null;
  const c=pick(ok),R=REGIONS[c.host],S=R.size||40,H=R.h||S,lv=GYC.rumor.lv,L=c.rumor>=lv[1]?2:c.rumor>=lv[0]?1:0,war=!c.done&&c.rumor>=GYC.rumor.war;
  const sx=(c.ax-S/2)-(c.ay-H/2),sy=(c.ax-S/2)+(c.ay-H/2),a=Math.atan2(sy,sx),dir=Math.hypot(sx,sy)<4?'한가운데':['동','남동','남','남서','서','북서','북','북동'][(Math.round(a/(Math.PI/4))+8)%8];
  const sect=SECTS[c.by],t=c.done?(c.by==='me'?GYC.sayMine:GYC.sayTaken):war?GYC.sayWar:GYC.say[L];
  const txt=t.replace('{prov}',PROV[R.prov]?PROV[R.prov].n:R.name).replace('{map}',R.name).replace('{dir}',dir).replace('{sign}',GYC.sign[c.th]).replace('{facs}',(c.facs||[]).map(f=>FAC4N[f]).join('·'))
    .replace('{sect}',sect?sect.n:FAC4N[c.by]||'누군가').replace('{who}',c.who||'누군가');
  return{c,L:c.done?3:war?2.5:L,txt:josa(txt)}}
// 말풍선: NPC·양민 곁(GYC.bubble.r칸)에 가면 소문을 흘린다. 같은 사람은 한동안 같은 말을 되풀이하지 않는다
const gycBub=[],gycTalked={};let gycBT=0;
hook('tick',dt=>{if(!P||!playing)return;if(gycG!==G||!G.gyc){if(!G.gyc)gycInit();else gycSync()}
  if((gycBT-=dt)>0)return;gycBT=.5;gycWarTick();const B=GYC.bubble;
  for(let i=gycBub.length-1;i>=0;i--)if(time>gycBub[i].end)gycBub.splice(i,1);if(gycBub.length>=2||P.hp<=0)return;
  const near=[...NPCF.map(n=>({o:n,k:REG+':'+n.n,nm:n.n})),...mobs.filter(m=>m.d&&m.d.villager&&m.hp>0&&!m.angry).map(m=>({o:m,k:m,nm:'양민'}))].filter(q=>dist(q.o,P)<B.r);
  for(const q of near){const key=typeof q.k==='string'?q.k:(q.o.gycK=q.o.gycK||'m'+Math.random());if(time<(gycTalked[key]||0))continue;gycTalked[key]=time+B.cd;
    if(Math.random()>B.p||gycBub.some(b=>b.o===q.o))continue;const r=gycRumorFor();if(!r)continue;
    gycBub.push({o:q.o,txt:r.txt,end:time+B.life});const c=r.c;if(r.L>c.heard)c.heard=r.L;c.hints[Math.floor(r.L*2)]=r.txt;
    log(`[소문] ${q.nm}: "${r.txt}"`,'info');break}});
function gycWrap(s,n){const out=[];let cur='';for(const w of s.split(' ')){if((cur+' '+w).trim().length>n&&cur){out.push(cur);cur=w}else cur=(cur+' '+w).trim()}if(cur)out.push(cur);return out}
hook('drawList',list=>{for(const b of gycBub){const o=b.o;list.push({L:LY.OVER,d:o.x+o.y+50,f:()=>{const p=toScreen(o.x,o.y),lines=gycWrap(b.txt,15),lh=15,w=Math.min(230,Math.max(...lines.map(l=>l.length))*12.5+16),h=lines.length*lh+10,x=p.x-w/2,y=p.y-92-h;
  const fade=Math.min(1,(b.end-time)/.6);ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='rgba(250,244,228,.95)';ctx.strokeStyle='#5a4428';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,8):ctx.rect(x,y,w,h);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(p.x-6,y+h-1);ctx.lineTo(p.x,y+h+9);ctx.lineTo(p.x+6,y+h-1);ctx.fill();ctx.beginPath();ctx.moveTo(p.x-6,y+h);ctx.lineTo(p.x,y+h+9);ctx.lineTo(p.x+6,y+h);ctx.stroke();
  ctx.fillStyle='#2a1e10';ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';lines.forEach((l,i)=>ctx.fillText(l,p.x,y+17+i*lh));ctx.restore()}})}});
// 입구 그림: 바위 틈 사이 검은 굴 아가리. 이름은 가까이(5칸) 가야 보인다
function drawGycMouth(g){const p=toScreen(g.x,g.y),c=G.gyc&&G.gyc.list[g.gyc];ctx.save();ctx.translate(p.x,p.y-4);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,6,34,13,0,0,7);ctx.fill();
  const rk=(x,y,rx,ry,c1,c2)=>{const gr=ctx.createLinearGradient(x-rx,y-ry,x+rx,y+ry);gr.addColorStop(0,c1);gr.addColorStop(1,c2);ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()};
  rk(-22,-10,16,20,'#7a7266','#3a352e');rk(22,-10,16,20,'#6e675c','#2e2a24');rk(0,-30,30,14,'#857c6e','#3e3830');
  ctx.fillStyle='#07060a';ctx.beginPath();ctx.moveTo(-14,4);ctx.quadraticCurveTo(-16,-24,0,-26);ctx.quadraticCurveTo(16,-24,14,4);ctx.closePath();ctx.fill();
  const t=c?c.th:'stone',col=t==='lava'?'255,110,40':t==='ice'?'170,225,255':'120,200,255',a=.18+.12*Math.sin(time*2+g.gyc);
  const gl=ctx.createRadialGradient(0,-8,1,0,-8,18);gl.addColorStop(0,`rgba(${col},${a})`);gl.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=gl;ctx.fillRect(-18,-26,36,32);
  ctx.restore();if(dist(g,P)<5){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';const s=`${g.label}${c&&c.done?' (빈 굴)':''}`;ctx.fillStyle='#000';ctx.fillText(s,p.x+1,p.y-47);ctx.fillStyle='#ffe2a0';ctx.fillText(s,p.x,p.y-48)}}
// ---- 세력전: 소문이 다 퍼진 동굴 입구에 다가가면 세력 무사들이 서로 싸우고 있다 (한 번 들어올 때마다 한 판) ----
let gycWarDone=false;
function gycWarTick(){if(gycWarDone||!G.gyc||G.duel)return;const c=G.gyc.list.find(c=>c.host===REG&&!c.done&&c.rumor>=GYC.rumor.war&&c.x!=null);if(!c||Math.hypot(c.x-P.x,c.y-P.y)>GYC.war.near)return;
  gycWarDone=true;c.facs=c.facs||pick(GYC.war.facs);const made=[];
  c.facs.forEach((f,k)=>{const a=k/c.facs.length*Math.PI*2+Math.random();for(let i=0;i<GYC.war.band;i++){for(let t=0;t<20;t++){const r=2.5+Math.random()*3,x=c.x+.5+Math.cos(a)*r+(Math.random()-.5)*2,y=c.y+.5+Math.sin(a)*r+(Math.random()-.5)*2;
    if(!walkAt(x,y))continue;const e=mkFac(f,i===0?1:0,x,y);e.gycWar=c.i;e.fixed=1;mobs.push(e);made.push(e);break}}});
  for(const e of made){let b=null,bd=1e9;for(const o of made)if(alFac(SECTS[o.sect].al)!==alFac(SECTS[e.sect].al)){const q=dist(e,o);if(q<bd){bd=q;b=o}}e.tgt=b;e.aggro=!!b}
  log(`${c.name} 입구에서 ${c.facs.map(f=>FAC4N[f]).join('·')} 무사들이 기연을 두고 싸우고 있다!`,'dmg');showBanner('기연 쟁탈',`${c.facs.map(f=>FAC4N[f]).join(' 대 ')}`)}
// ---- 임무창: 들은 소문 ----
function gycCard(){if(!G.gyc)return'';const L=G.gyc.list.filter(c=>c.heard>=0);if(!L.length)return'';
  return `<div class="card"><h4>기연 소문 <small class="dim">사람들 곁에 가면 소문을 흘린다 · 소문이 커질수록 자세해지고, 다 퍼지면 세력들이 몰려든다</small></h4>${L.map((c,k)=>{
    const st=c.done?(c.by==='me'?'<small class="good">얻음</small>':`<small class="bad">${SECTS[c.by]?SECTS[c.by].n:'남'}이(가) 차지</small>`):c.rumor>=GYC.rumor.war?'<small class="bad">세력전</small>':'';
    const hs=Object.keys(c.hints).sort((a,b)=>b-a).slice(0,2).map(h=>`<p class="note">"${esc(c.hints[h])}"</p>`).join('');
    return `<p style="margin:6px 0 0"><b>소문 ${k+1}</b> ${st}${c.seen||c.mark?` <small class="gold">${esc(c.name)} · ${esc(REGIONS[c.host].name)}${c.mark&&!c.seen?' · 지도에 표시':''}</small>`:''}</p>${hs}`}).join('')}</div>`}
// ---- 문파 무공 등록: 기연 무공 기증과 창안 무공 전수 ----
const gycDonOwner=id=>{for(const[sid,l]of Object.entries(G.gyDon||{}))if(l.includes(id))return sid;return null};
// 문파가 본래 가진 무공(등록된 것 빼고)의 최고 등급, 등록된 무공의 최고 등급, 오른 등급
const sectTop0=s=>Math.max(0,...s.arts.filter(q=>!q.gyd&&!q.made).map(q=>artGrade(q.id)));
const sectTopReg=s=>Math.max(-1,...s.arts.filter(q=>q.gyd||q.made).map(q=>artGrade(q.id)));
function sectUp(s){const d=sectTopReg(s)-sectTop0(s);return d>0?d*GYC.powPerGrade:0}
// 문파 목록을 지금 G(기증 G.gyDon, 창안 G.made)에 맞춘다: 완전 새로 시작하면 지난 판의 등록이 사라진다
function sectRegSync(){const don=G.gyDon||{},made=G.made||{};
  for(const s of Object.values(SECTS))s.arts=s.arts.filter(q=>!(q.gyd&&!(don[s.id]||[]).includes(q.id))&&!(q.made&&!(made[q.id]&&made[q.id].sect===s.id)));
  for(const id of Object.keys(GY_ARTS))if(ARTS[id])delete ARTS[id].sect;
  for(const id of Object.keys(ARTS))if(ARTS[id].made&&!made[id])delete ARTS[id];
  for(const[sid,l]of Object.entries(don)){const s=SECTS[sid];if(!s)continue;for(const id of l){const a=ARTS[id];if(!a)continue;a.sect=sid;if(!s.arts.some(q=>q.id===id))s.arts.push({id,n:a.n,cls:a.cls,el:a.el,hi:false,gyd:1})}}
  if(typeof popSync==='function'&&G.W)popSync()}
hook('gLoaded',()=>{gycSync()});
function gycSectHtml(s){const g0=sectTop0(s),up=sectTopReg(s)>g0?`<p class="note gold">기증·전수로 문파 무공 등급이 ${AGR[g0]}에서 ${AGR[sectTopReg(s)]}(으)로 올랐다. 세력 힘에 인원 ${Math.round(sectUp(s)*100)}%가 더 쳐진다.</p>`:'';
  const books=P.bag.filter(it=>it.slot==='book'&&ARTS[it.art]&&ARTS[it.art].gy&&!gycDonOwner(it.art));
  const made=Object.values(G.made||{}).filter(d=>!d.sect&&P.arts[d.id]&&ARTS[d.id]);
  const row=(n,sub,btn)=>`<div class="it"><div>${n}<span>${sub}</span></div><div class="ib">${btn}</div></div>`;
  const rows=[...books.map(it=>{const a=ARTS[it.art];return row(`${a.n} ${gradeTag(a.grade)} <small class="dim">기연 비급</small>`,`기증하면 ${s.n}의 무공으로 기록된다(이번 판 동안) · 공적 +${GYC.donMerit}${a.grade>g0?` · 문파 무공 등급 ${AGR[g0]} → ${AGR[a.grade]}`:''}`,B('gydon:'+it.id,'기증하기',{pri:1}))}),
    ...made.map(d=>{const a=ARTS[d.id];return row(`${a.n} ${gradeTag(a.grade)} <small class="dim">창안 무공</small>`,`제자들에게 전수하면 ${s.n}의 무공으로 등록된다(이번 판 동안) · 공적 +${GYC.teachMerit[a.grade]||0}${a.grade>g0?` · 문파 무공 등급 ${AGR[g0]} → ${AGR[a.grade]}`:''}`,B('mkteach:'+d.id,'제자들에게 전수',{pri:1}))})];
  return up+(rows.length?`<h4 style="margin:0">무공 기증·전수</h4><div class="list">${rows.join('')}</div>`:'')}
function gycRegNote(s,a,g0){if(a.grade>g0){log(`${s.n}의 무공 등급이 ${AGR[g0]}에서 ${AGR[a.grade]}(으)로 올랐다. 세력이 커진다.`,'xp');showBanner(`${s.n} 무공 ${AGR[a.grade]}`,a.n)}}
hook('sectAct',c=>{if(c.a!=='gydon'&&c.a!=='mkteach')return;c.done=true;c.r=true;const s=SECTS[P.sect];if(!s)return;const g0=sectTop0(s);
  if(c.a==='gydon'){const it=P.bag.find(i=>i.id===+c.x);if(!it||!ARTS[it.art]||!ARTS[it.art].gy||gycDonOwner(it.art))return;const a=ARTS[it.art];
    P.bag.splice(P.bag.indexOf(it),1);(G.gyDon[s.id]=G.gyDon[s.id]||[]).push(a.id);sectRegSync();const m=addMerit(s.id,GYC.donMerit);P.fame+=30;
    log(`${s.n}에 천고의 무공 [${a.n}]의 비급을 기증했다. 이제 ${s.n}의 무공으로 전한다. 공적 +${m}, 명성 +30.`,'xp');feat(`${s.n}에 ${a.n}을(를) 기증했다`);gycRegNote(s,a,g0);return}
  const d=G.made&&G.made[c.x],a=d&&ARTS[d.id];if(!a||d.sect||!P.arts[d.id])return;
  if(d.reg)mkUnregister(d);d.sect=s.id;d.reg=1;a.reg=0;a.gyPool=0;mkRegister(d);sectRegSync();const m=addMerit(s.id,GYC.teachMerit[a.grade]||0);
  log(`${s.n}의 제자들에게 창안 무공 [${a.n}]을(를) 전수했다. ${s.n}의 무공으로 등록되었다. 공적 +${m}.`,'xp');feat(`${s.n}에 ${a.n}을(를) 전수했다`);gycRegNote(s,a,g0)});
// ---- 기연 영약 (행낭의 소모품) ----
hook('useCon',c=>{const k=c.k,st=GYC.fruits[k];if(k!=='청명단'&&k!=='천년영지'&&!st)return;c.done=true;if(!(P.mats[k]>0)||P.hp<=0)return;
  if(k==='청명단'){if(P.wis>=10){log('오성이 이미 10이라 청명단이 듣지 않는다.','info');return}P.wis++;log(`청명단을 먹고 운기하니 머리가 맑아진다. 오성이 ${P.wis}(으)로 올랐다.`,'xp')}
  else if(k==='천년영지'){P.qiBonus+=40;log('천년영지를 먹어 내공이 40 늘었다.','xp')}
  else{P.st[st]+=2;log(`${k}을(를) 먹어 ${STATS.find(s=>s.k===st).n}이(가) 2 올랐다.`,'xp')}
  P.mats[k]--;recalc();fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1});addText(P.x,P.y,k,'#a6d47f');renderOpen()});

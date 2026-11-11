// ================= 기연 소문 단서 추적 (v247, 동훈님 2026-11-11) =================
// "기연소문의 경우 파헤치기 식으로 모두가 똑같은 기연을 이야기하는 게 아니라 지역을 찾아가고 npc와 대화하여 실마리를 더 얻고 하는 식의 프로그래스" / "강호윤회록이 가진 콘텐츠들과 어울리게"
// - 단서 칸 다섯(c.k): 성(pv)·맵(map)·징조(sign)·방위(dir)·흔적(trace). 흔적까지 찾으면 숨은 입구가 드러난다(c.found). 그 전엔 입구가 맵에 없다(g_gyc.js gycShown).
// - 풍문: 길의 사람·양민·객잔 손님은 사람마다 다른 동굴, 다른 말을 한다(말하는 사람 열쇠로 고름, 아무것도 모르는 사람도 있다). 성 이름(가끔 징조)까지만.
//   동굴이 있는 성에 오면 사람들이 '아는 사람'(증인)을 가리킨다.
// - 증인 셋(c.wit): 그 성 성읍의 증인 → 맵 / 입구 맵 옆 들판의 증인 → 징조·수호자 / 입구 맵의 증인 → 방위. 앞 증인이 다음 증인을 일러 준다. 머리 위 '?'.
//   증인은 있는 콘텐츠로 대가를 받는다: 은자, 명성(모자라면 술값), 진영(다른 편이면 웃돈), 근처 몹 처치(사냥 의뢰처럼), 맞수와 한 판(이기면 말한다).
// - 그 밖의 길: 정보 단체(g_intel.js gycHear가 칸을 채움), 내 문파 정탐 보고(직위 GYCL.reportRank 이상, 공적), 입구 맵에서 운기조식하면 기운의 방위, 입구 곁에 다가가면 저절로 찾음.
// - 경쟁: 소문(c.rumor)은 정탐꾼들의 진척이다. 임무창에 보이고, 75면 세력전, 100이면 빼앗긴다(그대로).
// - 옛 저장: 들은 단계(c.heard)와 들어가 본 동굴(c.seen·c.mark)로 칸을 채운다. 증인은 동굴 씨앗으로 늘 같게 만든다.
// 테스트: tests/t152_gyclue.js
const GYCL=GD.GYCL;
const gyclProv=id=>{const R=REGIONS[id];if(!R)return null;if(R.prov)return R.prov;if(id==='gaebong')return'henan';const m=/^in_(.+)_\d+$/.exec(id);return m?gyclProv(m[1]):null};
const gyclHash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0};
const gyclMyFac=()=>P.sect&&SECTS[P.sect]?alFac(SECTS[P.sect].al):P.side;
// ---- 옛 저장 맞추기와 증인 만들기 ----
function gyclEnsure(c){
  if(!c.k){const h=c.heard??-1,s=c.seen||c.mark?1:0;c.k={pv:h>=0||s?1:0,map:h>=1||s?1:0,sign:h>=1||s?1:0,dir:h>=2||s?1:0,trace:s};c.found=s;
    const old=c.hints||{};c.hints={};const ks=['pv','map','dir','trace'];for(const n of Object.keys(old))if(typeof old[n]==='string')c.hints[ks[Math.min(3,Math.floor(n/2))]]=old[n]}
  if(!c.wit)c.wit=gyclWitGen(c);
  if(!c.form){const W=GYCL.forms.w,ks=Object.keys(W);let r=rng(c.seed+31)()*ks.reduce((a,k)=>a+W[k],0);c.form=ks[ks.length-1];for(const k of ks)if((r-=W[k])<0){c.form=k;break}}}
function gyclWitGen(c){const r=rng(c.seed+977),host=c.host,pv=REGIONS[host].prov,used=new Set(),pk=a=>a[Math.floor(r()*a.length)];
  const ok=id=>{const R=REGIONS[id];return R&&!R.hq&&!R.in&&!R.hall&&!R.cave&&!R.acad&&!R.maeng&&!id.startsWith('gyc_')};
  const cities=Object.keys(REGIONS).filter(id=>REGIONS[id].city&&REGIONS[id].prov===pv&&id!==host).sort();
  const hops=regHops(host),near=Object.keys(hops).filter(id=>hops[id]===1&&ok(id)&&!REGIONS[id].city).sort();
  const inPv=Object.keys(hops).filter(id=>id!==host&&ok(id)&&gyclProv(id)===pv).sort((a,b)=>hops[a]-hops[b]);
  const w0=cities.length?(cities.find(id=>/성도|성도부/.test(REGIONS[id].name))&&r()<.5?cities.find(id=>/성도/.test(REGIONS[id].name)):pk(cities)):inPv[0]||host;
  const w1=near.filter(id=>id!==w0).length?pk(near.filter(id=>id!==w0)):inPv.find(id=>id!==w0)||host;
  return GYCL.wit.map((d,i)=>{let role=pk(d.roles);for(let t=0;t<6&&used.has(role);t++)role=pk(d.roles);used.add(role);
    const pay=pk(d.pays.filter(p=>p!=='side'||GYCL.roles[role].side)),sur=GYCL.sur[(c.i*3+i+Math.floor(r()*GYCL.sur.length))%GYCL.sur.length];
    return{r:i===0?w0:i===1?w1:host,role,n:`${role} ${sur}씨`,pal:GYCL.roles[role].pal,pc:d.piece,pay,side:GYCL.roles[role].side||null,
      v:pay==='silver'?R1(GYCL.silver[0],GYCL.silver[1]):pay==='fame'?GYCL.famePer*(i+1):pay==='hunt'?GYCL.hunt[0]+Math.floor(r()*(GYCL.hunt[1]-GYCL.hunt[0]+1)):0,
      x:null,y:null,ok:0,kn:0,hv:0}})}
const gyclIsWit=nm=>!!(G.gyc&&G.gyc.list.some(c=>!c.done&&c.wit&&c.wit.some(w=>w.n===nm)));
// 증인을 그 맵 사람 목록에 넣는다 (자리가 정해진 증인만). 끝난 동굴의 증인은 떠난다
function gyclNpcSync(){const arrs=[NPCS,...Object.values(REGIONS).map(R=>R.npcs).filter(Boolean)];
  for(const a of arrs)for(let i=a.length-1;i>=0;i--)if(a[i].gyw)a.splice(i,1);
  for(const c of(G.gyc?G.gyc.list:[])){if(c.done||!c.wit)continue;c.wit.forEach((w,wi)=>{if(w.x==null||!REGIONS[w.r])return;const a=w.r==='gaebong'?NPCS:(REGIONS[w.r].npcs=REGIONS[w.r].npcs||[]);
    a.push({id:'gyw',gyw:[c.i,wi],n:w.n,x:w.x,y:w.y,pal:w.pal})})}
  if(P&&typeof refreshNPCF==='function')refreshNPCF()}
// 맵을 처음 열 때 증인과 흔적 자리를 정한다: 도착 자리에서 걸어 닿는 칸, 출입구·다른 사람과 떨어진 곳 (맵은 씨앗으로 늘 같게 만들어진다)
hook('regionGen',id=>{if(!G.gyc)return;let ch=0;
  const free=(x,y)=>walk(x,y)&&!objs[y][x]&&(REGIONS[id].gates||[]).every(g=>Math.hypot(g.x-x,g.y-y)>2.5)&&npcsHere().every(n=>n.x==null||Math.hypot(n.x-x,n.y-y)>1.6);
  const near=(x0,y0,dmin,dmax,seed)=>{const o=[];for(let j=1;j<NH-1;j++)for(let i=1;i<N-1;i++){const d=Math.hypot(i-x0,j-y0);if(d>=dmin&&d<=dmax&&free(i,j))o.push([i,j])}
    if(!o.length)return null;return o[gyclHash(seed)%o.length]};
  for(const c of G.gyc.list){if(!c.wit)continue;
    c.wit.forEach((w,wi)=>{if(w.r!==id||w.x!=null)return;const a=arriveAt(id),p=near(a.x,a.y,4,14,c.seed+':'+wi)||near(a.x,a.y,1,40,c.seed+':'+wi);if(p){w.x=p[0]+.5;w.y=p[1]+.5;ch=1}});
    if(c.host===id&&c.x!=null&&c.tx==null){const o=GYCL.traceOff,p=near(c.x,c.y,o[0],o[1],c.seed+':t')||{0:c.x,1:c.y+1};c.tx=p[0]+.5;c.ty=p[1]+.5}}
  if(ch)gyclNpcSync()});
// ---- 칸 채우기 ----
const GYCL_L={pv:0,map:1,sign:1,dir:2,trace:3};
function gyclGive(c,ks,txt){gyclEnsure(c);const got=[];for(const k of ks)if(!c.k[k]){c.k[k]=1;got.push(k)}
  for(const k of ks)c.heard=Math.max(c.heard??-1,GYCL_L[k]);if(txt){const top=ks.slice().sort((a,b)=>GYCL_L[b]-GYCL_L[a])[0];if(got.length||!c.hints[top])c.hints[top]=txt}
  if(c.k.dir&&c.k.map&&c.k.sign&&c.k.pv&&c.wit)c.wit.forEach(w=>w.kn=w.kn||w.ok);return got}
function gyclHearRumor(r){const c=r.c;if(!c)return;if(r.pt!=null&&c.wit&&c.wit[r.pt])c.wit[r.pt].kn=1;gyclGive(c,r.ks||[],r.txt);if(!(r.ks&&r.ks.length)){c.heard=Math.max(c.heard??-1,0);c.hints.done=r.txt}}
function gyclFound(c,quiet){gyclEnsure(c);if(c.found)return;c.found=1;c.mark=1;for(const k of Object.keys(c.k))c.k[k]=1;c.heard=3;gycGate(c);
  if(!quiet){log(`숨은 굴 입구를 찾았다! ${REGIONS[c.host].name}의 ${c.name}.`,'xp');showBanner('숨은 입구',c.name);fx.push({t:'lvl',x:(c.x??c.ax)+.5,y:(c.y??c.ay)+.5,life:1.2});saveGame(true)}}
// ---- 사람마다 다른 말 ----
function gyclFill(t,c,w){const R=REGIONS[c.host],pv=PROV[R.prov]?PROV[R.prov].n:R.name;
  return josa(t.replace(/\{prov\}/g,pv).replace(/\{map\}/g,R.name).replace(/\{dir\}/g,gycDir(c)).replace(/\{sign\}/g,GYC.sign[c.th]).replace(/\{guard\}/g,GYCL.guard[c.th]||'수호자')
    .replace(/\{facs\}/g,(c.facs||[]).map(f=>FAC4N[f]).join('·')).replace(/\{sect\}/g,SECTS[c.by]?SECTS[c.by].n:FAC4N[c.by]||'누군가').replace(/\{who\}/g,c.who||'누군가')
    .replace(/\{wn\}/g,w?w.n:'').replace(/\{wreg\}/g,w&&REGIONS[w.r]?REGIONS[w.r].name:'').replace(/\{side\}/g,w&&w.side?FAC4N[w.side]||w.side:''))}
const gyclNextWit=c=>c.wit?c.wit.findIndex(w=>!w.ok):-1;
// ok: 이 사람이 들을 수 있는 동굴들. key: 말하는 사람 (같은 사람은 같은 동굴·같은 말, 사람마다 다르다. 없으면 아무렇게나)
function gyclLine(ok,key){const h=key==null?Math.floor(Math.random()*1e9):gyclHash(key+':'+Math.floor(G.cal||0)),here=gyclProv(REG);
  const loc=ok.filter(c=>!c.done&&here&&REGIONS[c.host].prov===here),pool=loc.length&&h%4!==3?loc:ok,c=pool[h%pool.length];gyclEnsure(c);
  if(key!=null&&h%5===4&&!loc.length)return null;   // 아무것도 모르는 사람
  if(c.done)return{c,L:3,ks:[],txt:gyclFill(c.by==='me'?GYC.sayMine:GYC.sayTaken,c)};
  if(c.rumor>=GYC.rumor.war)return{c,L:2.5,ks:['pv'],txt:gyclFill('{prov} 어딘가 굴 앞에 {facs} 무인들이 몰려들어 피를 보고 있다오. 기연을 두고 싸운다지.',c)};
  if(loc.includes(c)){const wi=gyclNextWit(c);   // 동굴이 있는 성: 아는 사람을 가리킨다
    if(wi>=0){const w=c.wit[wi];if(wi===0||c.wit[wi-1].ok||h%3===0){if(w.r===REG)return{c,L:0,ks:['pv'],pt:wi,txt:gyclFill(GYCL.pointHere,c,w)};
      return{c,L:0,ks:['pv'],pt:wi,txt:gyclFill(GYCL.point[h%GYCL.point.length],c,w)}}}}
  if(h%3===1)return{c,L:1,ks:['pv','sign'],txt:gyclFill(GYCL.fungSign,c)};
  return{c,L:0,ks:['pv'],txt:gyclFill(GYCL.fung[h%GYCL.fung.length],c)}}
// ---- 증인과의 대화 ----
const gyclW=n=>{const c=G.gyc&&G.gyc.list[n.gyw[0]];return c&&c.wit?[c,c.wit[n.gyw[1]]]:[null,null]};
function gyclKnowTxt(c,w,wi){const t=gyclFill(GYCL.know[w.pc],c,w),nx=c.wit[wi+1];return t+(nx&&GYCL.next[w.pc]?' '+gyclFill(GYCL.next[w.pc],c,nx):'')}
function gywDlg(n){const[c,w]=gyclW(n),wi=n.gyw[1];if(!c)return'<p class="note">"…"</p>';const q=s=>`<p class="note">${esc(w.n)}: "${esc(s)}"</p>`;
  if(c.done)return q(GYCL.doneTxt);if(w.ok)return q(GYCL.seen+' '+gyclKnowTxt(c,w,wi));
  const a=`gyw:${c.i}_${wi}`,asks=gyclFill(GYCL.ask[w.pay],c,w).replace('{v}',w.v);let btn='';const sv=GYCL.silver[1];
  if(w.pay==='silver')btn=B(a+':pay',`은자 ${w.v}냥을 건넨다`,{pri:1,d:P.silver<w.v});
  else if(w.pay==='fame')btn=P.fame>=w.v?B(a+':pay','이야기를 청한다',{pri:1}):B(a+':alt',`술값을 치른다 (은자 ${sv*GYCL.fameAlt})`,{d:P.silver<sv*GYCL.fameAlt})+`<small class="dim"> 명성 ${Math.floor(P.fame)}/${w.v}</small>`;
  else if(w.pay==='side')btn=gyclMyFac()===w.side?B(a+':pay','같은 편이라 말한다',{pri:1}):B(a+':alt',`웃돈을 얹는다 (은자 ${sv*GYCL.sideAlt})`,{d:P.silver<sv*GYCL.sideAlt});
  else if(w.pay==='hunt')btn=!w.hunt?B(a+':hunt','맡는다',{pri:1}):w.hv>=w.v?B(a+':pay','다 쫓았다',{pri:1}):`<small class="gold">이 맵에서 몹 ${w.hv}/${w.v}</small>`;
  else if(w.pay==='beat')btn=w.won?B(a+':pay','이겼다',{pri:1}):mobs.some(m=>m.gyw===a&&m.hp>0)?'<small class="bad">맞수가 기다린다</small>':B(a+':beat','겨룬다',{pri:1});
  else btn=B(a+':pay','듣는다',{pri:1});
  return q(asks)+`<div class="row2">${btn}</div><p class="note dim">기연 소문의 실마리 · ${GYCL.slots.find(s=>s[0]===w.pc)[1]}</p>`}
hook('npcDlg',c=>{if(c.html==null&&c.n.gyw)c.html=gywDlg(c.n)});
function gyclReveal(c,wi){const w=c.wit[wi];w.ok=1;const ks=w.pc==='map'?['pv','map']:w.pc==='sign'?['pv','sign']:['pv','map','dir'],txt=gyclKnowTxt(c,w,wi);
  gyclGive(c,ks,gyclFill(GYCL.know[w.pc],c,w));if(c.wit[wi+1])c.wit[wi+1].kn=1;
  log(`[단서] ${w.n}: "${txt}"`,'xp');addText(P.x,P.y,'실마리','#ffe2a0');saveGame(true)}
hook('sectAct',x=>{if(x.a!=='gyw')return;x.done=true;x.r=true;const[ci,wi]=String(x.x).split('_').map(Number),c=G.gyc&&G.gyc.list[ci],w=c&&c.wit&&c.wit[wi];if(!w||w.ok||c.done)return;
  const sv=GYCL.silver[1],k=x.y;
  if(k==='pay'){if(w.pay==='silver'){if(P.silver<w.v)return;P.silver-=w.v}else if(w.pay==='fame'&&P.fame<w.v)return;else if(w.pay==='side'&&gyclMyFac()!==w.side)return;
    else if(w.pay==='hunt'&&!(w.hv>=w.v))return;else if(w.pay==='beat'&&!w.won)return;gyclReveal(c,wi)}
  else if(k==='alt'){const v=sv*(w.pay==='fame'?GYCL.fameAlt:GYCL.sideAlt);if(P.silver<v||(w.pay!=='fame'&&w.pay!=='side'))return;P.silver-=v;gyclReveal(c,wi)}
  else if(k==='hunt'&&w.pay==='hunt'){w.hunt=1;w.hv=0;log(`${w.n}의 부탁: ${REGIONS[w.r].name}에서 날뛰는 놈 ${w.v}을(를) 쫓아 달란다.`,'info')}
  else if(k==='beat'&&w.pay==='beat'){const id=`gyw:${ci}_${wi}`;if(mobs.some(m=>m.gyw===id&&m.hp>0))return;
    let at=null;for(let t=0;t<40&&!at;t++){const x2=P.x+(Math.random()*2-1)*3,y2=P.y+(Math.random()*2-1)*3;if(walkAt(x2,y2)&&Math.hypot(x2-P.x,y2-P.y)>1.5)at=[x2,y2]}at=at||[P.x+1.5,P.y];
    const e=mkMob(P.side==='사'?'정파 무인':'사파 무인',at[0],at[1]);e.name=`${w.n}의 맞수`;e.gyw=id;e.fixed=1;e.realm=Math.max(0,realmIdx());if(typeof scaleMob==='function')scaleMob(e);
    e.maxHp=e.hp=Math.round(e.maxHp*GYCL.beatHp);e.aggro=true;e.d=Object.assign({},e.d,{xp:0,fame:0});mobs.push(e);closePanels();log(`${w.n}: "자, 보여 주시오." ${e.name}이(가) 나섰다.`,'dmg')}});
hook('kill',e=>{if(!G.gyc)return;if(e.gyw){const[ci,wi]=e.gyw.slice(4).split('_').map(Number),w=G.gyc.list[ci]&&G.gyc.list[ci].wit[wi];if(w){w.won=1;log(`${e.name}이(가) 물러났다. ${w.n}에게 돌아가 이야기를 듣자.`,'xp')}return}
  if(e.d&&(e.d.villager||e.d.passive))return;
  for(const c of G.gyc.list){if(c.done||!c.wit)continue;for(const w of c.wit)if(w.hunt&&!w.ok&&w.r===REG&&w.hv<w.v){w.hv++;if(w.hv>=w.v)log(`${w.n}의 부탁을 마쳤다. 돌아가 이야기를 듣자.`,'xp')}}});
// ---- 현장: 흔적 살피기, 입구 곁, 운기로 느끼기 ----
let gyclMedT=0;
hook('tick',dt=>{if(!P||!playing||!G.gyc||P.hp<=0)return;
  for(const c of G.gyc.list){if(c.host!==REG||c.found||c.x==null)continue;gyclEnsure(c);
    if(Math.hypot(c.x+.5-P.x,c.y+.5-P.y)<GYCL.mouthR){gyclFound(c);continue}
    if(c.tx!=null&&c.k.map&&!P.chan&&!attacking()&&Math.hypot(c.tx-P.x,c.ty-P.y)<GYCL.traceR){P.chan={t:0,dur:1.5,label:'흔적을 살핀다',fn:()=>gyclFound(c)};continue}
    if(P.medit&&!c.k.dir){if((gyclMedT+=dt)>=GYCL.meditT){gyclMedT=0;const t=gyclFill(GYCL.meditTxt.replace('{th}',GYCL.thN[c.th]||'묘한'),c);gyclGive(c,['pv','map','dir'],t);log(t,'xp')}}else if(!P.medit)gyclMedT=0}});
// ---- 할 이야기가 있는 사람: 머리 위 '!' (동훈님 2026-11-11 "근처만 가도 말풍선이 뜨게는 하지 마. 대화가 가능한 주제가 있는 경우 느낌표 만들고 대화 시 들을 수 있게") ----
// 소문을 아는 길 사람·가게 주인·객잔 손님은 '!'. 말을 걸면 대화창 맨 위에서 듣고, 같은 말이면 '!'가 사라진다(해가 바뀌면 할 말이 바뀐다).
// 증인은 아직 이야기를 다 하지 않았으면 '!', 앞 증인이 가리킨 증인은 '?'를 더 크게.
const GYCL_SKIP=n=>n.gyw||n.gyherm!=null||n.intel||n.board||n.hq||n.sect||n.srole||n.elder||n.steward||n.acad||n.hugi!=null||n.disc||n.emperor||n.lib||n.slib||n.jailer||n.prisoner||n.maeng||n.dang||n.id==='hgmeet'||n.id==='hgdown'||n.id==='lore'||n.id==='madi'||n.id==='iny'||n.id==='cvlead'||n.id==='cvtalk';
const gyclTold={},gyclTopicC={};
const gyclKey=n=>REG+':'+n.n+':'+Math.round((n.x||0)*2);
function gyclTopic(n){if(!G.gyc||!n||GYCL_SKIP(n))return null;const k=gyclKey(n),C=gyclTopicC[k];if(C&&time-C.t<1)return C.r;
  const r=n.patron?{txt:'객잔 손님의 이야기',patron:1}:gycRumorFor(1,k);gyclTopicC[k]={t:time,r};return r}
const gyclNew=r=>{const c=r.c;if(!c)return true;if(r.pt!=null&&c.wit&&c.wit[r.pt]&&!c.wit[r.pt].kn)return true;if(!(r.ks&&r.ks.length))return !c.hints||c.hints.done!==r.txt;return r.ks.some(k=>!(c.k&&c.k[k]))};   // 들으면 새로 아는 게 있나
const gyclHasTalk=n=>{const r=gyclTopic(n);return !!r&&gyclTold[gyclKey(n)]!==(r.patron?Math.floor(G.cal||0):r.txt)&&(r.patron||gyclNew(r))};
function gyclTalkHtml(n){const r=gyclTopic(n);if(!r)return'';const k=gyclKey(n);
  if(r.patron){gyclTold[k]=Math.floor(G.cal||0);return''}   // 손님은 원래 대화(innLine)가 이야기다
  const first=gyclTold[k]!==r.txt;gyclTold[k]=r.txt;if(first){gyclHearRumor(r);log(`[소문] ${n.n}: "${r.txt}"`,'info')}
  return `<p class="note"><small class="gold">소문</small> ${esc(n.n)}: "${esc(r.txt)}"</p>`}
function gyclMark(n,ch,col){return{L:LY.OVER,d:n.x+n.y+40,f:()=>{const p=toScreen(n.x,n.y),y=p.y-84+Math.sin(time*3+n.x)*2;ctx.save();ctx.font='bold 18px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(ch,p.x+1,y+1);ctx.fillStyle=col;ctx.fillText(ch,p.x,y);ctx.restore()}}}
hook('drawList',list=>{if(!G.gyc||!P||!playing)return;
  for(const n of npcsHere()){if(n.x==null)continue;if(n.gyw){const[c,w]=gyclW(n);if(w&&!w.ok&&!c.done)list.push(gyclMark(n,w.kn?'?':'!',w.kn?'#ffd25a':'#f0e4c8'));continue}
    if(gyclHasTalk(n))list.push(gyclMark(n,'!','#ffe2a0'))}
  for(const c of G.gyc.list){if(c.host!==REG||c.found||c.tx==null||!c.k||!c.k.map)continue;
    list.push({L:LY.BACK,d:c.tx+c.ty,f:()=>{const p=toScreen(c.tx,c.ty),a=.35+.3*Math.sin(time*2.4);ctx.save();const col=c.th==='lava'?'255,120,60':c.th==='ice'?'180,230,255':'130,200,255';
      const g=ctx.createRadialGradient(p.x,p.y-4,1,p.x,p.y-4,16);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(p.x-16,p.y-20,32,32);
      ctx.fillStyle=`rgba(${col},${a+.2})`;for(let i=0;i<3;i++){const t=time*1.3+i*2.1;ctx.fillRect(p.x+Math.sin(t)*8,p.y-6-((t*10)%14),2,2)}ctx.restore()}})}});
// ---- 내 문파 정탐 보고: 직위가 높으면 공적을 내고 다음 칸 하나 ----
function gyclRepCost(c){return GYCL.reportMerit[Math.min(2,['map','sign','dir'].filter(k=>c.k[k]).length)]}
function gyclRepHtml(s){if(!G.gyc||P.sect!==s.id||rankIdx(s.id)<GYCL.reportRank)return'';
  const L=G.gyc.list.filter(c=>{gyclEnsure(c);return c.k.pv&&!c.found&&!c.done&&!(c.k.map&&c.k.sign&&c.k.dir)});if(!L.length)return'';
  return `<h4 style="margin:0">정탐 보고 <small class="dim">문파 정탐꾼이 기연 소문의 다음 실마리를 알아 온다</small></h4><div class="list">${L.map(c=>{const pv=PROV[REGIONS[c.host].prov]?PROV[REGIONS[c.host].prov].n:'';const m=gyclRepCost(c);
    return `<div class="it"><div>${esc(pv)}의 기연 <span>${GYCL.slots.map(([k,n])=>c.k[k]?`<b class="gold">${n}</b>`:`<span class="dim">${n}</span>`).join(' · ')}</span></div><div class="ib">${B('gyrep:'+c.i,`공적 ${m}`,{d:(P.merit[s.id]||0)<m})}</div></div>`}).join('')}</div>`}
hook('sectAct',x=>{if(x.a!=='gyrep')return;x.done=true;x.r=true;const s=SECTS[P.sect],c=G.gyc&&G.gyc.list[+x.x];if(!s||!c||c.done||c.found||rankIdx(s.id)<GYCL.reportRank)return;
  const m=gyclRepCost(c);if((P.merit[s.id]||0)<m)return;const k=['map','sign','dir'].find(k=>!c.k[k]);if(!k)return;P.merit[s.id]-=m;
  const t=gyclFill(GYCL.know[k],c);gyclGive(c,k==='dir'?['pv','map','dir']:['pv',k],t);log(`[${s.n} 정탐 보고] ${t} (공적 -${m})`,'xp')});
// ---- 임무창: 단서 수첩 ----
function gyclNext(c){const R=REGIONS[c.host],pv=PROV[R.prov]?PROV[R.prov].n:R.name;if(c.found)return `입구를 찾았다: ${R.name}의 ${c.name}`;
  const wi=gyclNextWit(c);if(wi>=0){const w=c.wit[wi];if(w.kn)return `${REGIONS[w.r]?REGIONS[w.r].name:'?'}의 ${w.n}을(를) 찾아가 보자${w.hunt&&!w.ok?` (부탁 ${w.hv}/${w.v})`:''}${w.won?' (맞수를 이겼다)':''}`;
    return [`${pv}에 가서 사람들에게 물어보자`,`${c.k.map?R.name:pv} 둘레 사람들에게 물어보자`,`${c.k.map?R.name:pv}에서 사람들에게 물어보자`][wi]}
  return `${R.name} ${c.k.dir?gycDir(c)+'쪽':''}에서 흔적을 살펴보자`}
function gycCard(){if(!G.gyc)return'';const L=G.gyc.list.filter(c=>{gyclEnsure(c);return c.heard>=0||c.k.pv});if(!L.length)return'';
  return `<div class="card"><h4>기연 소문 <small class="dim">단서 수첩 · 풍문을 따라 그 성에 가서 아는 사람을 찾고, 다섯 칸을 채우면 숨은 입구가 드러난다</small></h4>${L.map((c,k)=>{
    const st=c.done?(c.by==='me'?'<small class="good">얻음</small>':`<small class="bad">${SECTS[c.by]?SECTS[c.by].n:'남'}이(가) 차지</small>`):c.rumor>=GYC.rumor.war?'<small class="bad">세력전</small>':'';
    const slots=GYCL.slots.map(([s,n])=>c.k[s]?`<b class="gold">■${n}</b>`:`<span class="dim">□${n}</span>`).join(' ');
    const hs=['trace','dir','sign','map','pv','done'].filter(h=>c.hints[h]).slice(0,2).map(h=>`<p class="note">"${esc(c.hints[h])}"</p>`).join('');
    const rv=c.done?'':`<p class="note dim">다른 정탐꾼들 ${Math.round(c.rumor)}% <small>(${GYC.rumor.war}%면 세력전, ${GYC.rumor.take}%면 빼앗긴다)</small></p>`;
    return `<p style="margin:6px 0 0"><b>소문 ${k+1}</b> ${st} ${slots}${c.found||c.seen?` <small class="gold">${esc(c.name)} · ${esc(REGIONS[c.host].name)}</small>`:''}</p>${hs}${c.done?'':`<p class="note">다음: ${esc(gyclNext(c))}</p>`}${rv}`}).join('')}</div>`}
// ---- 기연이 나오는 모습: 상자 / 동굴 벽화 / 기인이사 (동훈님 2026-11-11 "상자안에 비급의 형태 말고 동굴 벽에 그려진 벽화나 기인이사 npc를 만나거나 하는 다양성") ----
// 벽화: 수호자를 물리치고 벽화를 베껴 적으면(3초) '벽화 필사본' 비급. 기인이사: 안쪽 방에 앉은 은자가 수호자를 물리친 사람에게 구결을 전하고 떠난다. 보상은 모두 행낭으로(그대로)
const gyclHermitName=c=>GYCL.forms.hermits[c.seed%GYCL.forms.hermits.length];
function gyclHermitNpc(c,n){return c.form==='hermit'&&!c.done?[{id:'gyherm',gyherm:c.i,n:gyclHermitName(c),x:n.x,y:n.y,pal:'taoist',fy:1}]:[]}
hook('npcDlg',x=>{if(x.html!=null||x.n.gyherm==null)return;const c=G.gyc&&G.gyc.list[x.n.gyherm];if(!c)return;const q=s=>`<p class="note">${esc(x.n.n)}: "${esc(s)}"</p>`;
  if(c.done){x.html=q(GYCL.forms.hermitGone);return}
  if(mobs.some(m=>m.gycGuard===c.i&&m.hp>0)){x.html=q(GYCL.forms.hermitWait);return}
  x.html=q(GYCL.forms.hermitHello)+`<div class="row2">${B('gyherm:'+c.i,'가르침을 받는다',{pri:1})}</div>`});
hook('sectAct',x=>{if(x.a!=='gyherm')return;x.done=true;x.r=true;const c=G.gyc&&G.gyc.list[+x.x];if(!c||c.done||mobs.some(m=>m.gycGuard===c.i&&m.hp>0))return;
  const n=nodes.find(q=>q.t==='gybox'&&q.gyc===c.i);if(!n)return;const nm=gyclHermitName(c);gycLoot(c,n);log(`${nm}: "${GYCL.forms.hermitBye}"`,'info');
  const R=REGIONS[gycId(c.i)];if(R)R.npcs=[];fx.push({t:'puff',x:n.x,y:n.y,life:.8});refreshNPCF();closePanels()});
function drawGyMural(n){const p=toScreen(n.x,n.y),c=G.gyc&&G.gyc.list[n.gyc],live=n.cd<=0;ctx.save();ctx.translate(p.x,p.y);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,2,30,9,0,0,7);ctx.fill();
  const g=ctx.createLinearGradient(-26,-70,26,0);g.addColorStop(0,'#6e665a');g.addColorStop(1,'#2e2a24');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(-24,-62);ctx.quadraticCurveTo(0,-74,24,-62);ctx.lineTo(26,0);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1e1a16';ctx.lineWidth=1.5;ctx.stroke();
  const col=c&&c.th==='lava'?'255,150,90':c&&c.th==='ice'?'190,235,255':'150,210,255',a=live?.55+.3*Math.sin(time*2):.18;
  ctx.strokeStyle=`rgba(${col},${a})`;ctx.lineWidth=1.6;ctx.lineCap='round';
  const fig=(x,y,s,k)=>{ctx.beginPath();ctx.arc(x,y-14*s,2.6*s,0,7);ctx.moveTo(x,y-11*s);ctx.lineTo(x,y-3*s);ctx.moveTo(x,y-3*s);ctx.lineTo(x-4*s,y+3*s);ctx.moveTo(x,y-3*s);ctx.lineTo(x+4*s,y+3*s);
    ctx.moveTo(x,y-9*s);ctx.lineTo(x+(k?7:-6)*s,y-(k?13:6)*s);ctx.moveTo(x,y-9*s);ctx.lineTo(x+(k?-5:6)*s,y-(k?5:12)*s);ctx.moveTo(x+(k?7:6)*s,y-(k?13:12)*s);ctx.lineTo(x+(k?14:13)*s,y-(k?20:17)*s);ctx.stroke()};
  fig(-12,-30,1,0);fig(10,-34,1,1);fig(-2,-12,.8,1);
  ctx.beginPath();ctx.arc(10,-50,10,Math.PI*.9,Math.PI*1.9);ctx.stroke();
  if(live){const gl=ctx.createRadialGradient(0,-32,2,0,-32,40);gl.addColorStop(0,`rgba(${col},.18)`);gl.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=gl;ctx.fillRect(-40,-72,80,76)}
  ctx.restore();if(dist(n,P)<4){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';const s=live?'벽화':'벽화 (베낌)';ctx.fillStyle='#000';ctx.fillText(s,p.x+1,p.y-79);ctx.fillStyle='#ffe2a0';ctx.fillText(s,p.x,p.y-80)}}

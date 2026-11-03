// ================= 후기지수와 기재 (v239, 사용자 2026-11-03) =================
// "해마다 경지 상승보단 랜덤하게, 해당 인원들이 정파·사파·마교·군부를 대표하는 후기지수가 되고 플레이어와 경쟁하는 구도"
// "스스로 창안을 5%로 기재가 출현해 화경에 달하면 … 해당 기재는 정식 NPC로 등록되고"
// - 명단 G.hugi: [{id,n,sid,fac,rk,w,sim,age,dead,dy,dc,prod,art,elder,old,y,ev}]. 세력마다 HUGI.reps 명이 살아 있게 채운다(새해·첫 맵).
//   rk = RANKS 번호(삼류 0 … 자연경 8), w = 병기 계열, sim = 심법 id, dead 1이면 죽음(dy 해, dc 까닭), old 1이면 나이가 차서 후기지수에서 빠짐.
// - 경지는 해마다 오르지 않는다: 사건(기연 gy·폐관 pg·비무 bm·가르침 teach)마다 HUGI.p 확률 × rkDamp^경지 × runHooks('hugiMul',c) 의 c.mul.
//   폐관은 실패하면 주화입마(HUGI.pgDie 확률로 죽음). 오르면 runHooks('hugiUp',h,from,to,cause), 죽으면 runHooks('hugiDie',h,cause).
// - 기재(prod): 소문파(맵 규모 소) 인원 HUGI.prod.pop 이상, 절정 무공이 없을 때 해마다 HUGI.prod.p, 온 강호에 HUGI.prod.gap 해에 한 명.
//   화경(HUGI.prod.hwa)에 오르면 그 문파에 절정 무공을 창안해 등록하고(G.made, reg) 장로가 된다 → 증축 조건(g_sgrow). 화경 전에 죽이면 창안은 없다.
// - 문파 본산 마당에 정식 NPC(srole 'hugi')로 선다. 강제공격으로 칠 수 있고 쓰러뜨리면 명단에서 죽음으로 남는다(후임 없음).
const HUGI=GD.HUGI;VAULT.npc.hugi=HUGI.npc;
const hgYear=()=>Math.floor(G.cal||0);
const hgLive=()=>(G.hugi||[]).filter(h=>!h.dead&&!h.old);
const hugiById=id=>(G.hugi||[]).find(h=>h.id===id)||null;
const hgRand=([a,b])=>a+Math.floor(Math.random()*(b-a+1));
function hgName(){const used=new Set((G.hugi||[]).map(h=>h.n));let n;for(let t=0;t<20;t++){n=pick(NAMES1)+pick(NAMES2)+pick(NAMES2);if(!used.has(n))break}return n}
function hugiNew(sid,o={}){const s=SECTS[sid],f=alFac(s.al),cls=(START[sid]&&START[sid].w)||(s.arts[0]&&s.arts[0].cls)||'검',sl=typeof simOf==='function'?simOf(sid):[];
  const h={id:(G.hugiN=(G.hugiN||0)+1),n:hgName(),sid,fac:f,rk:o.rk??hgRand(HUGI.rk0),w:cls,sim:sl.length?sl[sl.length-1].id:null,age:o.age??hgRand(HUGI.age),dead:0,prod:o.prod?1:0,art:null,y:hgYear(),ev:[]};
  (G.hugi=G.hugi||[]).push(h);return h}
// 세력마다 정원을 채운다. 문파는 규모 가중(tierW)으로, 같은 문파가 겹치지 않게
function hugiFill(){G.hugi=G.hugi||[];let k=0;
  for(const f of FAC4){const live=hgLive().filter(h=>h.fac===f&&!h.prod);let need=(HUGI.reps[f]||0)-live.length;
    const pool=liveSects().filter(s=>alFac(s.al)===f&&sectPop(s.id)>0&&REGIONS[hqId(s)]);
    while(need-->0&&pool.length){const used=new Set(hgLive().map(h=>h.sid)),L=pool.filter(s=>!used.has(s.id)),P0=L.length?L:pool;
      let t=P0.reduce((a,s)=>a+(HUGI.tierW[s.tier]||1),0)*Math.random(),s=P0[0];for(const q of P0){t-=HUGI.tierW[q.tier]||1;if(t<=0){s=q;break}}hugiNew(s.id);k++}}
  return k}
// 사건 하나로 경지를 굴린다
function hugiRoll(h,cause){if(!h||h.dead||h.rk>=HUGI.cap)return false;const c={h,cause,mul:1};runHooks('hugiMul',c);
  const p=(HUGI.p[cause]||0)*Math.pow(HUGI.rkDamp,h.rk)*(h.prod?HUGI.prod.boost:1)*c.mul,r=Math.random();
  if(r<p){const from=h.rk;h.rk++;h.ev.push({y:hgYear(),c:cause,to:h.rk});if(h.ev.length>8)h.ev.shift();runHooks('hugiUp',h,from,h.rk,cause);hgNews(h,cause);
    if(h.prod&&!h.art&&h.rk>=HUGI.prod.hwa)hugiCreate(h);return true}
  if(cause==='pg'&&r<p*(1+HUGI.pgFail)){h.ev.push({y:hgYear(),c:'zh'});if(h.ev.length>8)h.ev.shift();
    if(Math.random()<HUGI.pgDie)hugiDie(h,'주화입마');else if(h.rk>=3||h.prod)log(`강호 소식: ${hgWho(h)}이(가) 폐관 중 주화입마에 들었다가 간신히 깨어났다.`,'info')}
  return false}
const hgWho=h=>`${SECTS[h.sid]?SECTS[h.sid].n+'의 ':''}${h.prod&&!h.art?'기재 ':''}${h.n}`;
function hgNews(h,cause){if(h.rk<3&&!h.prod)return;log(`강호 소식: ${hgWho(h)}이(가) ${HUGI.cause[cause]||''} ${RANKS[h.rk]}에 올랐다.`,'info')}
function hugiDie(h,cause){if(!h||h.dead)return;h.dead=1;h.dy=hgYear();h.dc=cause;runHooks('hugiDie',h,cause);
  log(`강호 소식: ${hgWho(h)}이(가) ${cause==='player'?'당신의 손에 쓰러졌다':cause==='주화입마'?'주화입마로 세상을 떠났다':'세상을 떠났다'}.${h.prod&&!h.art?` ${SECTS[h.sid].n}의 창안의 싹이 꺾였다.`:''}`,cause==='player'?'xp':'info')}
// 해마다: 나이, 사건 굴림(사람마다 한 해 한 번까지 오른다), 정원 채우기, 기재 출현
hook('newYear',()=>{hugiFill();
  for(const h of hgLive()){h.age++;if(h.age>HUGI.retire&&!h.prod){h.old=1;continue}const cs=Object.keys(HUGI.p).sort(()=>Math.random()-.5);for(const c of cs)if(hugiRoll(h,c))break}
  hugiProd()});
function hugiProd(){const y=hgYear(),PD=HUGI.prod;if(G.hgProdY!=null&&y-G.hgProdY<PD.gap)return null;
  const L=liveSects().filter(s=>sgCan(s)&&sgTier(s)==='small'&&sectPop(s.id)>=PD.pop&&jeolN(s)<1&&!hgLive().some(h=>h.prod&&h.sid===s.id)).sort(()=>Math.random()-.5);
  for(const s of L)if(Math.random()<PD.p){const h=hugiNew(s.id,{prod:1,rk:PD.rk0,age:hgRand(PD.age)});G.hgProdY=y;
    log(`강호 소식: ${s.n}에 기재 ${h.n}(${h.age}세)이(가) 나타났다. 화경에 이르면 ${s.n}에 절정 무공을 남길 것이라 한다.`,'info');showBanner('기재 출현',`${s.n} ${h.n}`);return h}
  return null}
// 기재가 화경에 올라 절정 무공을 창안한다: 그 병기 계열 무공(제 문파 것 먼저) 다섯에서 초식을 모아 G.made 에 문파 무공으로
function hugiCreate(h){const s=SECTS[h.sid];if(!s||!(sectPop(s.id)>0))return null;const g=SGROW.jeol;
  const ok=a=>a&&a.cls===h.w&&a.forms&&a.forms.length&&a.ult&&a.ult.steps&&!a.made&&!a.gy&&(a.grade||0)<=g;
  const own=s.arts.map(q=>ARTS[q.id]).filter(ok),rest=Object.values(ARTS).filter(a=>ok(a)&&!own.includes(a)).sort((x,y)=>(y.grade||0)-(x.grade||0));
  const srcs=[...own,...rest].slice(0,5);if(!srcs.length)return null;
  const id=`mk_${(G.madeN=(G.madeN||0)+1)}`,el=srcs[0].el,used=new Set(Object.values(ARTS).map(a=>a.n)),pre=MK_PRE[el]||MK_PRE['금'];
  let n=pre[h.id%4]+MK_SUF[h.w];for(let t=0;used.has(n)&&t<12;t++)n=pre[(h.id+t)%4]+NA[(h.id*7+t)%NA.length][0]+MK_SUF[h.w];
  const names=new Set(),nm=i=>{let x;for(let t=0;t<30;t++){x=NA[(h.id*3+i*5+t)%NA.length]+NB[(h.id+i*7+t)%NB.length];if(!names.has(x))break}names.add(x);return x};
  const forms=[];for(let i=0;i<6;i++){const a=srcs[i%srcs.length];forms.push({a:a.id,i:Math.min(a.forms.length-1,Math.floor(i/srcs.length)+(i%srcs.length?1:0)),n:nm(i)})}
  const ua=srcs.slice().sort((x,y)=>(y.grade||0)-(x.grade||0))[0];
  const def={id,n,cls:h.w,el,grade:g,src:srcs.map(a=>a.id),srcN:srcs.map(a=>a.n),forms,ult:{a:ua.id,n:UA[h.id%UA.length]+UB[(h.id*3)%UB.length]},by:h.n,life:P?P.lifeNo:0,sect:s.id,reg:1,hugi:h.id};
  def.key=mkKey(def);G.made=G.made||{};G.made[id]=def;mkBuild(def);mkRegister(def);sectRegSync();h.art=id;h.elder=1;runHooks('hugiArt',h,id);
  log(`강호 소식: ${s.n}의 기재 ${h.n}이(가) 화경에 올라 절정 무공 [${n}]을(를) 창안했다. ${s.n}의 무공으로 전하고, ${h.n}은(는) 장로가 되었다.`,'xp');showBanner('절정 무공 창안',`${s.n} ${n}`);return id}
// ---- 본산 마당의 정식 NPC ----
function hgSpot(i){for(let t=0;t<80;t++){const a=i*2.1+t*.7,r=2+t*.12,x=Math.floor(20.5+Math.cos(a)*r*2.4),y=Math.floor(26.5+Math.sin(a)*r);if(x>1&&y>1&&x<N-2&&y<NH-2&&walk(x,y)&&!objs[y][x])return{x:x+.5,y:y+.5}}return{x:20.5,y:28.5}}
hook('regionLoaded',id=>{const R=REGIONS[id];if(!R||!P)return;if(!G.hugi)hugiFill();if(R.npcs)R.npcs=R.npcs.filter(n=>n.hugi==null);if(R.dead||R.ruin||!R.npcs)return;
  const s=Object.values(SECTS).find(q=>hqId(q)===id);if(!s)return;let i=0;
  for(const h of(G.hugi||[]))if(h.sid===s.id&&!h.dead&&(!h.old||h.elder)){const p=hgSpot(i++);
    R.npcs.push({id:'hg'+h.id,srole:'hugi',ssid:s.id,hugi:h.id,n:`${h.elder?`${s.n} 장로 `:''}${h.n}`,x:p.x,y:p.y,pal:sectPal(s.id,Math.min(4,Math.max(1,h.rk)),h.w,{})||masterPal(s)})}
  refreshNPCF()});
function hugiFight(e,n){const h=hugiById(n.hugi);if(!h)return;const d=h.rk-HUGI.npc.rank;e.realm=Math.min(8,h.rk);e.rank=Math.min(4,Math.max(1,h.rk));
  e.maxHp=Math.round(e.maxHp*Math.pow(HUGI.hp,d));e.hp=e.maxHp;e.atk=Math.round(e.atk*Math.pow(HUGI.atk,d));e.hugi=h.id}
hook('kill',e=>{const h=e.npcRef&&e.npcRef.hugi!=null&&hugiById(e.npcRef.hugi);if(!h)return;if(G.ndead)delete G.ndead[e.npcKey];P.fame+=HUGI.npc.fame;
  hugiDie(h,'player');feat(`후기지수 ${h.n}을(를) 쓰러뜨렸다`);const R=REGION();if(R&&R.npcs)R.npcs=R.npcs.filter(q=>q.hugi!==h.id)});
function hugiDlg(n){const h=hugiById(n.hugi),s=SECTS[n.ssid];if(!h||!s)return'';const mine=P.sect===s.id;
  const say=h.elder?`${s.n}의 무공은 내 손에서 한 걸음 더 나아갔소.`:mine?'사형제여, 함께 정진합시다. 언젠가 천하가 우리 이름을 부를 것이오.':'강호는 넓고 고수는 많지. 언젠가 한번 겨뤄 보고 싶군.';
  return `<p class="note">"${say}"</p><div class="card"><h4>${h.n} <small class="dim">${s.n} · ${FAC4N[h.fac]} 후기지수${h.prod?' · 기재':''}</small></h4><p class="note">${RANKS[h.rk]} · ${CLASS[h.w]?CLASS[h.w].n:h.w} · ${h.age}세${h.art&&ARTS[h.art]?` · 창안 [${ARTS[h.art].n}]`:''}</p></div>`}
hook('npcDlg',c=>{if(c.n.hugi!=null)c.html=hugiDlg(c.n)});

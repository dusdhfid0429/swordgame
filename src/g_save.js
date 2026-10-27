// ================= 저장 형식 번호와 옛 저장 옮기기 =================
// 저장에는 형식 번호 v가 붙는다. 번호가 없는 저장은 v0(2026-10-09까지의 모든 저장)이다.
// 옛 저장을 새 형식으로 옮기는 일은 모두 여기 MIGRATE에서, 번호 순서대로 한 번씩만 한다.
// 형식을 바꿀 때: SAVE_VER를 1 올리고 MIGRATE 끝에 "옛 번호 → 새 번호" 함수를 하나 더한다.
// 옮기는 함수는 저장 자료(d)만 고친다. 게임 상태(P, G)는 건드리지 않는다. 테스트: tests/t34_save.js
const SAVE_VER=9;
const MIGRATE=[
  // v0 → v1: 그동안 여러 파일에 흩어져 있던 옮기기를 한데 모음
  d=>{
    d=JSON.parse(migrateArtIds(JSON.stringify(d)));   // 예전 무공 번호 S0_1 → S_shaolin_1
    const p=d.P;if(!p)return d;
    migrateSect(p,d.notes);                             // 없어진 문파 → 옮겨 간 문파, 공적 합치기
    if(p.realm==null)p.realm=qiRealm(p);                // v42 이전: 경지는 내공으로 정했다
    const def={inj:0,injS:0,wallN:null,lifeQB:0,enl:0,peaks:{},qiX:0,gcs:0,mss:0,pas:{}};
    for(const k in def)if(p[k]===undefined)p[k]=def[k];
    return d},
  // v1 → v2: 심법 등급 (g_simbeop.js). 쌓인 내공을 횟수×타고난 증가량으로 옮긴다
  d=>{const p=d.P;if(!p)return d;if(p.qiAcc===undefined)p.qiAcc=(p.qiN||0)*SIDES[p.side].gain;if(p.sim===undefined)p.sim=null;if(!p.sims)p.sims={};return d},
  // v2 → v3: 천하대전 스토리 (g_story.js). 세상 상태는 G에, 이번 생의 선택은 P.story에. 이미 지난 나이의 사건은 '지나감'(-1)으로 적어 한꺼번에 터지지 않게 한다
  d=>{const g=d.G;if(g){if(!g.W)g.W=null;if(!g.seal)g.seal={};if(!g.occ)g.occ={};if(!g.wars)g.wars=[]}
    const p=d.P;if(p&&!p.story){p.story={pick:{},open:null,done:{},flag:{}};for(const e of STORY.EV)if(e.age<=(p.age||0))p.story.pick[e.id]=-1}return d},
  // v3 → v4: 무관 (g_academy.js). 이미 살던 생은 무관 없이 강호에 있는 것으로 친다(P.acad=null)
  d=>{const p=d.P;if(p&&p.acad===undefined)p.acad=null;return d},
  // v4 → v5: 같은 이름 무공 합치기 (g_sect.js linkSameArts). 기본 번호(정도0)로 익힌 것을 문파 무공(S_paeng_0)에 합친다: 숙련은 큰 쪽, 익힌 초식은 앞에서부터 개수만큼
  d=>mergeArtAliases(d),
  // v5 → v6: 직위는 승급 시험으로 (g_ranktest.js). 문파에 든 사람은 지금 직위(누적 공적·경지 상한)를 시험에 붙은 직위로 적는다
  d=>{const p=d.P;if(!p||p.srank||!p.sect||!SECTS[p.sect])return d;const s=SECTS[p.sect],t=(p.mtot||{})[s.id]||0,mx=SRANK[s.al].length-1;let i=0;while(i<mx&&t>=RANK_PTS[i+1])i++;
    p.srank={[s.id]:Math.max(0,Math.min(i,(p.realm??0)+GD.RANK_CAP.plus))};return d},
  // v6 → v7: 암기술 계열 (v181). 활 계열이던 당가·하오문·장강수로채 비도 무공이 암기술로 옮겨 갔다. 익힌 사람은 불러온 뒤 유엽비도 한 자루를 받는다(afterLoad)
  d=>{const p=d.P;if(!p||!p.arts)return d;const mv=AMGI_MOVED.filter(k=>p.arts[k]&&ARTS[k]);
    if(mv.length){p.amgiGift=1;d.notes.push(`${mv.map(k=>ARTS[k].n).join('·')}은(는) 이제 암기술입니다. 활이 아니라 비도를 차야 펼칠 수 있어 유엽비도 한 자루를 넣어 두었습니다.`)}return d},
  // v7 → v8: 세력·문파 우호도 (g_rep.js). 옛 생은 빈 우호도로 시작한다(바탕만: 내 문파·세력, 적 세력)
  d=>{const p=d.P;if(p&&!p.rep)p.rep={fac:{},sect:{},gift:{}};return d},
  // v8 → v9: 문파 보법·경공 (v187, g_sectmove.js). 문파에 든 사람은 내 문파 보법·경공을 받는다: 옛 공용 상승·절정(유운보·제운종 등) 가운데 가장 높은 등급을
  //   문파 상한까지 문파 것으로 바꾸고(넘는 것은 그대로 남김), 하나도 없으면 입문(중승) 단계. 경공 숙련은 큰 쪽을 넘긴다
  d=>{const p=d.P;if(!p||!p.sect||!SECTS[p.sect]||!SECT_MOVE[p.sect])return d;const got=[];
    for(const k of['b','g']){const r=smMigrate(p,k);if(r)got.push(r)}
    if(got.length)d.notes.push(`${SECTS[p.sect].n}에는 이 문파만의 보법·경공이 있습니다. ${got.join(', ')}(으)로 바꿔 두었습니다.`);return d},
];
// 저장 자료(p)의 보법(k='b')·경공(k='g')을 문파 것으로. 바뀐 것이 있으면 알림 글, 없으면 null
function smMigrate(p,k){const sid=p.sect,top=smTop(sid),own=k==='b'?p.bob:p.gk;if(!own||!top)return null;
  const T=k==='b'?BOBS:GGS,mk=k==='b'?smBid:smGid,cur=k==='b'?'bcur':'gkcur',m=k==='g'?(p.ggm=p.ggm||{}):null;
  const legacy=Object.keys(own).filter(id=>T[id]&&!T[id].sect&&T[id].g>=2);
  let have=0;for(let g=1;g<=top;g++)if(own[mk(sid,g)])have=g;
  let want=Math.max(have,1);for(const id of legacy)want=Math.max(want,Math.min(top,T[id].g));
  const nid=mk(sid,want);if(have===want&&!legacy.some(id=>T[id].g<=want))return null;
  own[nid]=1;
  for(let g=1;g<want;g++){const lo=mk(sid,g);if(m){m[nid]=Math.max(m[nid]||0,m[lo]||0);delete m[lo]}delete own[lo];if(p[cur]===lo)p[cur]=nid}
  const gone=[];for(const id of legacy)if(T[id].g<=want){if(m){m[nid]=Math.max(m[nid]||0,m[id]||0);delete m[id]}delete own[id];gone.push(T[id].n);if(p[cur]===id)p[cur]=nid}
  const c=T[p[cur]];if(!c||!own[p[cur]]||(!c.sect&&c.g<=want))p[cur]=nid;
  return `${k==='b'?'보법':'경공'} [${T[nid].n}](${BGRADE[want]})${gone.length?` ← ${gone.join('·')}`:''}`}
const AMGI_MOVED=['S_dang_0','S_dang_1','S_janggang_1','S_haomun_1'];
function mergeArtAliases(d){const al=artAliases(),p=d.P;
  if(p&&p.arts)for(const[o,c]of Object.entries(al)){const x=p.arts[o];if(!x)continue;delete p.arts[o];
    const y=p.arts[c],cnt=v=>(v&&v.f||[]).filter(Boolean).length,k=Math.max(cnt(x),cnt(y));
    p.arts[c]={...x,...(y||{}),p:Math.max(x.p||0,y?y.p||0:0),f:ARTS[c].forms.map((f,i)=>i<k||!!(y&&y.f&&y.f[i]))}}
  let raw=JSON.stringify(d);for(const[o,c]of Object.entries(al))raw=raw.split(`"${o}"`).join(`"${c}"`);
  d=JSON.parse(raw);
  // 행낭·창고의 비급: 초식 수가 줄어 없는 초식을 가리키면 마지막 초식 비급으로
  const walk=o=>{if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return}
    if(o.slot==='book'&&ARTS[o.art]&&ARTS[o.art].forms&&o.form>=ARTS[o.art].forms.length){const a=ARTS[o.art];o.form=a.forms.length-1;o.name=`${a.n} 비급 · ${a.forms[o.form].n}`}
    for(const k in o)walk(o[k])};
  walk(d);return d}
// 저장 자료를 지금 형식으로 옮긴다. 이미 지금 형식이면 그대로 돌려준다(여러 번 불러도 같다).
function migrateSave(d){if(!d||typeof d!=='object')return d;
  let v=d.v||0;if(v>SAVE_VER){console.warn(`저장 형식 ${v}이 게임(${SAVE_VER})보다 새것입니다`);return d}
  d.notes=d.notes||[];
  while(v<SAVE_VER){d=MIGRATE[v](d)||d;d.v=++v}
  return d}
// 불러온 뒤 한 번: 옮기면서 생긴 알림을 띄우고, 경지 효과처럼 저장에서 다시 계산하는 것을 맞춘다
function afterLoad(d){realmFxSync();P.vit=Math.round(P.vit||0);if(P.vitCarry)P.vitCarry=Math.round(P.vitCarry);   /* 예전 저장에 남은 소수점 활력 */
  if(P.amgiGift){delete P.amgiGift;const w=P.eq.weapon;if(!(w&&w.cls==='암')&&!P.bag.some(i=>i.slot==='weapon'&&i.cls==='암'))giveItem(mkWeapon('암',1,0))}
  runHooks('afterLoad',d);   // v188: 형식 번호 없이 고치는 옛 저장 손질 (g_caravan.js pyoFixSave)
  for(const n of d.notes||[])setTimeout(()=>log(n,'sys'),600);d.notes=[]}

// ================= 경공 단계: 1단 도약 → 2단 공중 도약 → 3단 능공비행 =================
// 사용자 요청 (2026-10-12): 경공 버튼을 이어 누르면 1·2·3단이 순서대로 나가고, 쓰는 경공의 등급이 최고 단계를 정하며, 숙련도로 단계가 열린다.
// - 경공도 보법처럼 익히는 기예: 등급 하승·중승·상승·절정(BGRADE). 하승은 1단만, 중승은 2단까지, 상승·절정은 3단까지 (GG_MAX).
// - 숙련도 P.ggm[id] 0~100: 뛸 때마다 오른다 (GG_GAIN). 2단은 숙련 30, 3단은 70에 열린다 (GG_OPEN). 등급이 막으면 숙련이 차도 안 열린다.
// - 1단이 날고 있거나 내려선 지 0.5초 안에 다시 누르면 다음 단. 2단은 1.4배, 3단은 2배 멀리, 3단은 내내 무적. 내공 GG_QI.
// - 얻는 곳: 하승 기본, 중승은 개봉 잡화점 비급(gbook), 상승·절정은 문파 본산(직위·공적). 보법과 같은 틀.
// 경공별 특징 (사용자 요청 2026-10-13 "경공도 무공별 특징을 추가"): 각 경공은 특징(GG_TK 8종) 1~3개를 가진다. 쓰는 경공의 것만 적용된다.
// - len 비거리, qcost 내공 절감, spd 착지 후 질주(GG_SPD_DUR초), chain 이어 뛰기 여유, mast 숙련 가속, shock 착지 진각(둘레 적 밀침·피해), hide 착지 무흔(적이 놓침), inv 착지 후 무적 연장.
const GG_MAX=GD.GG_MAX,GG_LEN=GD.GG_LEN,GG_QI=GD.GG_QI,GG_OPEN=GD.GG_OPEN,GG_GAIN=GD.GG_GAIN,GG_COST=GD.GG_COST,GG_RANK=GD.GG_RANK,GG_PRICE=GD.GG_PRICE,GGS=GD.GGS,GG_TK=GD.GG_TK,GG_SPD_DUR=GD.GG_SPD_DUR||3;
const ggTv=(k,g)=>{g=g||ggOf();let v=0;for(const t of g.tr||[])if(t.k===k)v+=t.v;return v};
const ggTraitTxt=g=>(g.tr||[]).filter(t=>GG_TK[t.k]).map(t=>GG_TK[t.k].f.replace('{v}',t.v)).join(' · ');
const ggTraitHtml=g=>(g.tr||[]).filter(t=>GG_TK[t.k]).map(t=>`<small class="good">${GG_TK[t.k].n}</small>`).join(' ');
const ggQi=st=>Math.max(1,Math.round(GG_QI[st-1]*(1-ggTv('qcost')/100)));
const ggLenMul=()=>1+ggTv('len')/100;
// 착지 후 질주: moveSpd가 곱한다
const ggSpdMul=()=>P&&P.ggSpd&&time<P.ggSpd.until?1+P.ggSpd.v/100:1;
// 내려선 순간 (경공 도약만; 낙하 공격은 L.st가 없다)
function ggLand(L){if(!L||!L.st)return;const g=ggOf();
  const spd=ggTv('spd',g);if(spd)P.ggSpd={v:spd,until:time+GG_SPD_DUR};
  const inv=ggTv('inv',g);if(inv)P.inv=Math.max(P.inv||0,inv);
  const sh=ggTv('shock',g);if(sh){let n=0;for(const e of foes())if(dist(e,P)<1.7){damage(e,Math.max(1,Math.round(atk()*sh/100)),.9,0,P);n++}if(n){shake=Math.max(shake,.15);fx.push({t:'ring',x:P.x,y:P.y,life:.3,max:.3,col:'220,200,150'})}}
  const hd=ggTv('hide',g);if(hd){let n=0;for(const e of mobs)if(e.hp>0&&e.aggro&&!e.duel&&!e.d.boss&&dist(e,P)<10){e.aggro=false;e.tgt=null;e.lost=time+hd;e.goal={x:e.home.x,y:e.home.y};n++}if(n){addText(P.x,P.y-.6,'무흔','#dfe9ff');if(P.target&&P.target.isMob)P.target=null}}}
// v141 (사용자): 무관에서 시작하면 경공이 없다(P.gk={}, P.gkcur=null). 심법 교두에게서 기초 경공을 배운다. 옛 저장은 기초 경공
function ggInit(){if(!P.gk)P.gk={g_basic:1};if(!P.gkcur||!P.gk[P.gkcur])P.gkcur=Object.keys(P.gk).find(id=>GGS[id])||null;if(!P.ggm)P.ggm={}}
const ggOf=()=>{ggInit();return GGS[P.gkcur]||GGS.g_basic};
const ggMast=id=>{ggInit();return P.ggm[id||P.gkcur]||0};
// 지금 쓰는 경공으로 열린 최고 단계
function ggMaxStage(){const g=ggOf(),m=ggMast();let n=1;for(let s=2;s<=GG_MAX[g.g];s++)if(m>=GG_OPEN[s-1])n=s;return n}
// 다음에 나갈 단: 이어 누르는 중이면 다음 단, 아니면 1단
function ggNext(){const c=P.ggc;if(c&&time<c.until&&c.until-time<3&&c.n<ggMaxStage())return c.n+1;return 1}
function ggBlock(id,viaSect){const g=GGS[id];ggInit();if(P.gk[id])return'이미 익혔다';
  // v187 문파 경공(g_sectmove.js): 그 문파 제자만, 아랫 단계부터 차례로. 옛 공용 상승·절정(제운종 등)은 본산에서 가르치지 않는다
  if(g.sect){if(!viaSect)return'문파에서';if(P.sect!==g.sect)return`${SECTS[g.sect].n} 제자만`;if(g.g>1&&smHave('g',g.sect)<g.g-1)return`${BGRADE[g.g-1]} 단계부터`;if(smHave('g',g.sect)>g.g)return'이미 윗 단계'}
  else if(g.g>=2)return'문파에서 익히지 않는다';
  if(g.g>=2){if(!viaSect)return'문파에서';if(!P.sect)return'문파 제자만';if(rankIdx(P.sect)<GG_RANK[g.g])return`${rankName(P.sect,GG_RANK[g.g])} 이상`;if((P.merit[P.sect]||0)<GG_COST[g.g])return`공적 ${GG_COST[g.g]} 필요`}
  return null}
function learnGg(id,viaSect){const g=GGS[id],no=ggBlock(id,viaSect);if(no)return false;if(g.g>=2)P.merit[P.sect]-=GG_COST[g.g];
  if(g.sect)for(let k=1;k<g.g;k++){const lo=smGid(g.sect,k);if(P.gk[lo]){P.ggm[id]=Math.max(P.ggm[id]||0,P.ggm[lo]||0);delete P.gk[lo];delete P.ggm[lo]}}
  P.gk[id]=1;P.gkcur=id;log(`경공 [${g.n}](${BGRADE[g.g]} · ${GG_MAX[g.g]}단까지)을(를) 익혔습니다. 경공 버튼으로 씁니다.`,'xp');showBanner(g.n,`${BGRADE[g.g]} 경공`);return true}
function mkGBook(id){const g=GGS[id];return{id:++itemId,slot:'gbook',gg:id,name:`경공 비급 · ${g.n}`,price:GG_PRICE}}
// 뛰고 나서: 이어 누를 수 있는 창을 열고 숙련을 올린다
function ggUsed(st,dur){const g=ggOf();P.ggc={n:st,until:time+dur+.5+ggTv('chain',g)};const m=ggMast();if(m<100){P.ggm[P.gkcur]=Math.min(100,m+GG_GAIN[st-1]*(1+ggTv('mast',g)/100));
    const m2=ggMast();for(let s=2;s<=GG_MAX[g.g];s++)if(m<GG_OPEN[s-1]&&m2>=GG_OPEN[s-1]){log(`경공 [${g.n}] ${s}단이 열렸습니다. 뛰는 중에 경공을 한 번 더 누르세요.`,'xp');showBanner(`${g.n} ${s}단`,'경공 개방')}}}
// ---- 화면 ----
function ggRow(id,btn){const g=GGS[id],on=P.gkcur===id,m=ggMast(id),open=[];for(let s=2;s<=GG_MAX[g.g];s++)open.push(`${s}단 ${m>=GG_OPEN[s-1]?'<span class="good">열림</span>':`숙련 ${GG_OPEN[s-1]}`}`);
  return `<div class="it"><div>${g.n} <small class="${g.g>=2?'good':'dim'}">${g.sect?SECTS[g.sect].n+' · ':''}${BGRADE[g.g]} · ${GG_MAX[g.g]}단까지</small>${on?' <small class="gold">쓰는 중</small>':''}<span>${g.d} · 숙련 ${Math.floor(m)}${open.length?' · '+open.join(' · '):''}${g.tr&&g.tr.length?`<br>${ggTraitHtml(g)} ${ggTraitTxt(g)}`:''}</span></div>${btn?`<div class="ib">${btn}</div>`:''}</div>`}
function ggArtsHtml(){ggInit();const mine=Object.keys(GGS).filter(id=>P.gk[id]);
  return `<div class="card"><h4>경공 <small class="dim">${TOUCH?'경공 버튼':'Space'} · 이어 누르면 ${ggMaxStage()}단까지</small></h4><div class="list">${mine.map(id=>ggRow(id,P.gkcur===id?'':B('gsel:'+id,'쓰기'))).join('')}</div>
    <p class="note">1단은 도약, 2단은 공중에서 한 번 더 띄워 1.4배, 3단은 능공비행으로 2배 멀리 날고 내내 몸이 흐려진다. 등급이 최고 단계를 정하고, 뛸수록 오르는 숙련으로 2단(30)·3단(70)이 열린다. 경공마다 특징이 달라 쓰는 경공의 것만 적용된다. 하승·중승 비급은 개봉 잡화점. 문파마다 고유한 경공이 있어 가입하면 중승 단계를 받고, 상승·절정 단계는 본산에서 올린다(숙련은 이어진다).</p></div>`}
function ggSectHtml(s){if(P.sect!==s.id)return'';ggInit();const top=smTop(s.id);if(!top)return'';
  return `<h4 style="margin:0">${s.n} 경공 <small class="dim">상승은 ${rankName(s.id,GG_RANK[2])}${top>=3?`, 절정은 ${rankName(s.id,GG_RANK[3])}`:''} 이상 · 이 문파만의 경공</small></h4><div class="list">${smSectRows('g',s)}</div>`}

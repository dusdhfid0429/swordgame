// ================= 경공 단계: 1단 도약 → 2단 공중 도약 → 3단 능공비행 =================
// 사용자 요청 (2026-10-12): 경공 버튼을 이어 누르면 1·2·3단이 순서대로 나가고, 쓰는 경공의 등급이 최고 단계를 정하며, 숙련도로 단계가 열린다.
// - 경공도 보법처럼 익히는 기예: 등급 하승·중승·상승·절정(BGRADE). 하승은 1단만, 중승은 2단까지, 상승·절정은 3단까지 (GG_MAX).
// - 숙련도 P.ggm[id] 0~100: 뛸 때마다 오른다 (GG_GAIN). 2단은 숙련 30, 3단은 70에 열린다 (GG_OPEN). 등급이 막으면 숙련이 차도 안 열린다.
// - 1단이 날고 있거나 내려선 지 0.5초 안에 다시 누르면 다음 단. 2단은 1.4배, 3단은 2배 멀리, 3단은 내내 무적. 내공 GG_QI.
// - 얻는 곳: 하승 기본, 중승은 개봉 잡화점 비급(gbook), 상승·절정은 문파 본산(직위·공적). 보법과 같은 틀.
const GG_MAX=GD.GG_MAX,GG_LEN=GD.GG_LEN,GG_QI=GD.GG_QI,GG_OPEN=GD.GG_OPEN,GG_GAIN=GD.GG_GAIN,GG_COST=GD.GG_COST,GG_RANK=GD.GG_RANK,GG_PRICE=GD.GG_PRICE,GGS=GD.GGS;
function ggInit(){if(!P.gk)P.gk={g_basic:1};if(!P.gkcur||!P.gk[P.gkcur])P.gkcur='g_basic';if(!P.ggm)P.ggm={}}
const ggOf=()=>{ggInit();return GGS[P.gkcur]||GGS.g_basic};
const ggMast=id=>{ggInit();return P.ggm[id||P.gkcur]||0};
// 지금 쓰는 경공으로 열린 최고 단계
function ggMaxStage(){const g=ggOf(),m=ggMast();let n=1;for(let s=2;s<=GG_MAX[g.g];s++)if(m>=GG_OPEN[s-1])n=s;return n}
// 다음에 나갈 단: 이어 누르는 중이면 다음 단, 아니면 1단
function ggNext(){const c=P.ggc;if(c&&time<c.until&&c.n<ggMaxStage())return c.n+1;return 1}
function ggBlock(id,viaSect){const g=GGS[id];ggInit();if(P.gk[id])return'이미 익혔다';
  if(g.g>=2){if(!viaSect)return'문파에서';if(!P.sect)return'문파 제자만';if(rankIdx(P.sect)<GG_RANK[g.g])return`${rankName(P.sect,GG_RANK[g.g])} 이상`;if((P.merit[P.sect]||0)<GG_COST[g.g])return`공적 ${GG_COST[g.g]} 필요`}
  return null}
function learnGg(id,viaSect){const g=GGS[id],no=ggBlock(id,viaSect);if(no)return false;if(g.g>=2)P.merit[P.sect]-=GG_COST[g.g];
  P.gk[id]=1;P.gkcur=id;log(`경공 [${g.n}](${BGRADE[g.g]} · ${GG_MAX[g.g]}단까지)을(를) 익혔습니다. 경공 버튼으로 씁니다.`,'xp');showBanner(g.n,`${BGRADE[g.g]} 경공`);return true}
function mkGBook(id){const g=GGS[id];return{id:++itemId,slot:'gbook',gg:id,name:`경공 비급 · ${g.n}`,price:GG_PRICE}}
// 뛰고 나서: 이어 누를 수 있는 창을 열고 숙련을 올린다
function ggUsed(st,dur){const g=ggOf();P.ggc={n:st,until:time+dur+.5};const m=ggMast();if(m<100){P.ggm[P.gkcur]=Math.min(100,m+GG_GAIN[st-1]);
    const m2=ggMast();for(let s=2;s<=GG_MAX[g.g];s++)if(m<GG_OPEN[s-1]&&m2>=GG_OPEN[s-1]){log(`경공 [${g.n}] ${s}단이 열렸습니다. 뛰는 중에 경공을 한 번 더 누르세요.`,'xp');showBanner(`${g.n} ${s}단`,'경공 개방')}}}
// ---- 화면 ----
function ggRow(id,btn){const g=GGS[id],on=P.gkcur===id,m=ggMast(id),open=[];for(let s=2;s<=GG_MAX[g.g];s++)open.push(`${s}단 ${m>=GG_OPEN[s-1]?'<span class="good">열림</span>':`숙련 ${GG_OPEN[s-1]}`}`);
  return `<div class="it"><div>${g.n} <small class="${g.g>=2?'good':'dim'}">${BGRADE[g.g]} · ${GG_MAX[g.g]}단까지</small>${on?' <small class="gold">쓰는 중</small>':''}<span>${g.d} · 숙련 ${Math.floor(m)}${open.length?' · '+open.join(' · '):''}</span></div>${btn?`<div class="ib">${btn}</div>`:''}</div>`}
function ggArtsHtml(){ggInit();const mine=Object.keys(GGS).filter(id=>P.gk[id]);
  return `<div class="card"><h4>경공 <small class="dim">${TOUCH?'경공 버튼':'Space'} · 이어 누르면 ${ggMaxStage()}단까지</small></h4><div class="list">${mine.map(id=>ggRow(id,P.gkcur===id?'':B('gsel:'+id,'쓰기'))).join('')}</div>
    <p class="note">1단은 도약, 2단은 공중에서 한 번 더 띄워 1.4배, 3단은 능공비행으로 2배 멀리 날고 내내 몸이 흐려진다. 등급이 최고 단계를 정하고, 뛸수록 오르는 숙련으로 2단(30)·3단(70)이 열린다. 하승·중승 비급은 개봉 잡화점, 상승·절정은 문파 본산.</p></div>`}
function ggSectHtml(s){if(P.sect!==s.id)return'';ggInit();const list=Object.keys(GGS).filter(id=>GGS[id].g>=2);
  return `<h4 style="margin:0">문파 경공 <small class="dim">상승은 ${rankName(s.id,GG_RANK[2])}, 절정은 ${rankName(s.id,GG_RANK[3])} 이상</small></h4><div class="list">${list.map(id=>{const no=ggBlock(id,1);
    return ggRow(id,P.gk[id]?'<small class="good">익힘</small>':B('glearn:'+id,no||`익히기 · 공적 ${GG_COST[GGS[id].g]}`,{d:!!no,pri:!no}))}).join('')}</div>`}

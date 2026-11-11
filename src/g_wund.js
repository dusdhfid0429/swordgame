// ================= 병기 이해도 (v248, 사용자 2026-11-11) =================
// 무공 숙련과 따로, 병기 계열(검·도·창·봉·권·궁·암·단·편)마다 쌓이는 이해도 P.wu[계열].
// 중립형 (사용자 선택 "중립형, 특색 없음"): 이해도가 그 경지 상한까지 차야 제 위력이고, 그 위의 덤은 없다.
//  · 위력 = floor + (1-floor) × 이해도/상한.  요대 병기(암·단·편)는 바닥이 더 낮고 더디게 는다
//    (사용자: "최고치의 이득이 크다면 시작점이 그만큼 더 어렵거나 이득보다 더 어려워야 해"). 셋은 따로 쌓인다.
//  · 같은 병기의 새 무공은 이해도만큼 숙련을 안고 시작하고(seed), 숙련이 조금 빨리 는다(mast).
//  · 무리(경지 기둥)에는 넣지 않는다. 윤회하면 난이도별 비율만 이어진다.
const WU=GD.WUND;
const wuBelt=c=>WU.belt.includes(c);
const wuCap=(r=realmIdx())=>WU.cap[Math.min(r,WU.cap.length-1)];
function wuAll(){if(!P.wu){P.wu={};   // 옛 저장: 익힌 무공 숙련에서 되짚어 채운다. 이미 익힌 무공은 덤 숙련을 받지 않는다
    for(const id in P.arts){const a=ARTS[id],s=P.arts[id];if(!a||!s)continue;s.ws=1;P.wu[a.cls]=Math.max(P.wu[a.cls]||0,Math.min(wuCap(),(s.p||0)*WU.old))}}
  return P.wu}
const wuOf=c=>Math.min(wuCap(),wuAll()[c]||0);
const wuFloor=c=>wuBelt(c)?WU.beltFloor:WU.floor;
const wuMul=c=>{if(!WU.cls.includes(c))return 1;const f=wuFloor(c);return f+(1-f)*Math.min(1,wuOf(c)/wuCap())};
const wuMast=id=>{const a=ARTS[id];return a?1+WU.mast*wuOf(a.cls)/100:1};
function wuGain(c,v=1,dummy){if(!WU.cls.includes(c))return;const w=wuAll(),cap=dummy?Math.min(WU.dummyMax,wuCap()):wuCap(),u=w[c]||0;if(u>=cap)return;
  const nu=Math.min(cap,u+v*WU.gain*(wuBelt(c)?WU.beltGain:1)*wisMul()*(1-u/125));w[c]=nu;
  if(Math.floor(u/10)!==Math.floor(nu/10))log(`${c} 이해도 ${Math.floor(nu)}`,'sys');
  if(nu>=cap&&!dummy)log(`${c}의 이치가 지금 경지에서 닿을 수 있는 데까지 닿았습니다.`,'xp')}
// 새로 익힌 무공: 같은 병기 이해도만큼 숙련을 안고 시작한다 (한 번만)
function wuSeed(){if(!P||!P.arts)return;wuAll();for(const id in P.arts){const s=P.arts[id],a=ARTS[id];if(!s||s.ws||!a)continue;s.ws=1;if(a.base)continue;
    const v=Math.min(WU.seedMax,Math.floor(wuOf(a.cls)*WU.seed));if(v>(s.p||0)){s.p=v;log(`${a.cls}을(를) 다뤄 온 이해로 ${a.n}을(를) 숙련 ${v}에서 시작합니다.`,'xp')}}}
hook('hit',c=>{const k=c.X&&c.X.art&&c.X.art.cls;if(k)c.m*=wuMul(k)});
hook('hitDone',c=>{const k=c.X&&c.X.art&&c.X.art.cls;if(k&&c.from===P)wuGain(k,1,c.e&&c.e.acadDummy)});
hook('recalc',wuSeed);
// 윤회: 난이도가 높을수록 덜 이어진다
hook('died',()=>{const r=WU.carry[typeof diffIdx==='function'?diffIdx():1]??WU.carry[1],w=wuAll(),o={};for(const k in w){const v=Math.floor(w[k]*r);if(v>0)o[k]=v}G.wuCarry=o});
function wuBorn(){const o={...(G.wuCarry||{})};G.wuCarry=null;return o}
function wuCard(){const cap=wuCap(),w=wuAll(),cur=ARTS[P.cur]&&ARTS[P.cur].cls;
  const rows=WU.cls.filter(c=>(w[c]||0)>0||c===cur).map(c=>{const u=wuOf(c);
    return `<div class="it"><div class="grow"><b>${c}${wuBelt(c)?' <small class="dim">요대</small>':''}</b> ${Math.floor(u)}/${cap}<div class="mbar"><i style="width:${Math.round(u/cap*100)}%"></i></div></div><span class="${u>=cap?'gold':'dim'}">위력 ${Math.round(wuMul(c)*100)}%</span></div>`}).join('');
  return `<div class="card" id="wucard"><h4>병기 이해도 <small class="dim">상한 ${cap} (경지를 넘으면 오른다)</small></h4><div class="list">${rows||'<p class="note dim">아직 병기를 휘둘러 보지 않았다.</p>'}</div>
    ${fold('wund','가득 차야 제 위력',`<p class="note">그 병기로 적을 칠수록 는다. 상한까지 차야 무공이 제 위력을 내고, 그 위의 덤은 없다. 같은 병기의 새 무공은 이해도의 ${Math.round(WU.seed*100)}%만큼 숙련을 안고 시작한다. 요대 병기(암기·단도·절편)는 따로 쌓이고 더디게 늘며 서툴 때 위력이 더 낮다. 윤회하면 일부만 이어진다.</p>`)}</div>`}
const wuChip=id=>{const a=ARTS[id];if(!a||!WU.cls.includes(a.cls))return'';const m=wuMul(a.cls);return chip(`${a.cls} 이해도 ${Math.floor(wuOf(a.cls))}/${wuCap()}${m<1?` · 위력 ${Math.round(m*100)}%`:''}`,m<1?'':'gold')};

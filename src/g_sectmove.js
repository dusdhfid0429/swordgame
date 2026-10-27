// ================= 문파 보법·경공 (v187) =================
// 사용자 (2026-10-27): "문파 경공과 보법의 이름 및 효과가 모든 문파가 같아 문파마다 다르게" → 문파마다 고유한 보법 하나·경공 하나 (data/sectmove.json SECT_MOVE)
// - 단계: 중승(입문 · 가입할 때 받음) → 상승(정식제자 · 공적 100) → 절정(대문파·오대세가·마교만 · 호법 · 공적 300). 상한은 그 문파 고급 무공 등급(sectGrade(s,true))
// - 특징: 문파마다 셋을 정해 두고 중승 2개, 상승·절정 3개가 열린다. 값은 등급표(SM_BTK.v, SM_GTV)에서만 오니 같은 등급끼리 힘이 같다
// - 번호: 보법 B_<문파>_<등급>, 경공 G_<문파>_<등급>. 윗 단계를 익히면 아랫 단계는 지운다(경공 숙련은 넘긴다, learnBob·learnGg)
// - 잔상은 문파 장식색(LOOK)으로 물든다 (smCol)
const SECT_MOVE=GD.SECT_MOVE,SM_BTK=GD.SM_BTK,SM_GTV=GD.SM_GTV;
const smTop=sid=>SECTS[sid]?sectGrade(SECTS[sid],true):0;
const smTrN=g=>Math.min(3,g+1);
const smBid=(sid,g)=>`B_${sid}_${g}`,smGid=(sid,g)=>`G_${sid}_${g}`;
for(const sid in SECT_MOVE){const m=SECT_MOVE[sid];if(!SECTS[sid])continue;
  for(let g=1;g<=smTop(sid);g++){
    BOBS[smBid(sid,g)]={n:m.b.n,t:m.b.t,g,d:m.b.d,sect:sid,tr:m.b.tr.slice(0,smTrN(g)).map(k=>({k,v:SM_BTK[k].v[g-1]}))};
    GGS[smGid(sid,g)]={n:m.g.n,g,d:m.g.d,sect:sid,tr:m.g.tr.slice(0,smTrN(g)).map(k=>({k,v:SM_GTV[k][g-1]}))}}}
// 문파 보법·경공 가운데 내가 가진 가장 높은 단계 (없으면 0)
const smHave=(kind,sid)=>{let h=0;for(let g=1;g<=smTop(sid);g++)if(kind==='b'?P.bob&&P.bob[smBid(sid,g)]:P.gk&&P.gk[smGid(sid,g)])h=g;return h};
// 문파 장식색 → 잔상 색
function smCol(sid){const L=GD.LOOK&&GD.LOOK[sid];if(!L)return null;const h=L[4]||L[3];if(!/^#[0-9a-f]{6}$/i.test(h))return null;return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')}
// 날고 있는 동안의 잔상 색: 문파 보법·경공이면 그 문파 색 (g_life.js)
const smLeapCol=L=>{if(!L||!P)return null;const s=L.step?bobOf().sect:L.st?ggOf().sect:null;return s?smCol(s):null};
// 보법 특징 값 (쓰는 보법의 것만)
const bobTv=(k,b)=>{b=b||bobOf();let v=0;for(const t of b.tr||[])if(t.k===k)v+=t.v;return v};
const bobTraitTxt=b=>(b.tr||[]).filter(t=>SM_BTK[t.k]).map(t=>SM_BTK[t.k].f.replace('{v}',t.v)).join(' · ');
const bobTraitHtml=b=>(b.tr||[]).filter(t=>SM_BTK[t.k]).map(t=>`<small class="good">${SM_BTK[t.k].n}</small>`).join(' ');
// 반격: 보법 뒤 2.5초 안의 첫 일격이 세다
hook('hit',c=>{const k=P.smCtr;if(!k)return;if(time>k.until){P.smCtr=null;return}c.m*=1+k.v/100;P.smCtr=null;addText(c.e.x,c.e.y-.5,'반격','#ffcf8a')});
// 보법이 나간 뒤 (g_bobeop.js bobeop): 과검·전박·추풍·반격·미혹
function bobAfter(b,sx,sy,dst){const col=b.sect&&smCol(b.sect)||'190,220,255';
  const cut=bobTv('cut',b);if(cut){const L=Math.hypot(dst.x-sx,dst.y-sy)||1,dmg=Math.max(1,Math.round(atk()*cut/100));let n=0;
    for(const e of foes()){const t=clamp(((e.x-sx)*(dst.x-sx)+(e.y-sy)*(dst.y-sy))/(L*L),0,1),d=Math.hypot(e.x-(sx+(dst.x-sx)*t),e.y-(sy+(dst.y-sy)*t));
      if(d<.9){damage(e,dmg,.3,0,P);n++}}
    if(n)fx.push({t:'slash',x:(sx+dst.x)/2,y:(sy+dst.y)/2,life:.2,side:1})}
  const sl=bobTv('slow',b);if(sl){let n=0;for(const e of foes())if(Math.hypot(e.x-dst.x,e.y-dst.y)<1.8){e.slow=Math.max(e.slow||0,sl);n++}if(n)fx.push({t:'ring',x:dst.x,y:dst.y,life:.35,max:.35,col})}
  const af=bobTv('after',b);if(af)P.ggSpd={v:af,until:time+2};
  const ct=bobTv('counter',b);if(ct)P.smCtr={v:ct,until:time+2.5};
  const hd=bobTv('hide',b);if(hd){let n=0;for(const e of mobs)if(e.hp>0&&e.aggro&&!e.duel&&!e.d.boss&&dist(e,P)<8){e.aggro=false;e.tgt=null;e.lost=time+hd;e.goal={x:e.home.x,y:e.home.y};n++}
    if(n){addText(dst.x,dst.y-.6,'미혹','#dfe9ff');if(P.target&&P.target.isMob&&!dst.T)P.target=null}}}
// ---- 문파 본산 화면: 내 문파 것만, 가진 단계와 다음 단계 ----
function smSectRows(kind,s){const top=smTop(s.id);if(!top)return'';const have=smHave(kind,s.id),rows=[];
  for(let g=1;g<=top;g++){const id=kind==='b'?smBid(s.id,g):smGid(s.id,g);
    if(g<have)continue;
    if(g===have){rows.push(kind==='b'?bobRow(id,'<small class="good">익힘</small>'):ggRow(id,'<small class="good">익힘</small>'));continue}
    if(g>have+1){rows.push(`<div class="it"><div class="dim">${BGRADE[g]} 단계 <span>${kind==='b'?bobTraitTxt(BOBS[id]):ggTraitTxt(GGS[id])}</span></div></div>`);continue}
    const no=kind==='b'?bobBlock(id,1):ggBlock(id,1),cost=kind==='b'?BCOST[g]:GG_COST[g];
    rows.push(kind==='b'?bobRow(id,B('blearn:'+id,no||(cost?`익히기 · 공적 ${cost}`:'익히기'),{d:!!no,pri:!no})):ggRow(id,B('glearn:'+id,no||(cost?`익히기 · 공적 ${cost}`:'익히기'),{d:!!no,pri:!no})))}
  return rows.join('')}

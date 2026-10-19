// 스토리 6단계 (2026-10-15 v114): 세력별 천하통일 노선. 사건마다 정·사·마·관의 눈(e.pov)과 그 세력만 고를 수 있는 선택(c.fac)이 있고(g_story.js evCard/pickChoice),
// 천하대전을 한 세력이 홀로 이기고 그 힘이 UNIFY.pow 이상, 나머지 셋이 모두 UNIFY.rival 이하면 천하통일(G.unified). 내 세력이면 명성·은자 보상. 다른 세력이 다음 대전을 이기면 천하는 다시 갈라진다.
const UNIFY=STORY.UNIFY;
function unifyCheck(){const last=G.wars[G.wars.length-1];if(!last||!last.won)return null;const w=wld();
  if(G.unified&&!last.won.includes(G.unified.by)){log(`${FAC4N[G.unified.by]}의 천하가 ${sideName(last.won)}에 무너졌다. 천하는 다시 갈라졌다.`,'info');G.unified=null}
  if(last.won.length!==1)return null;const f=last.won[0];if(w.pow[f]<UNIFY.pow||FAC4.some(o=>o!==f&&w.pow[o]>UNIFY.rival))return null;
  if(G.unified&&G.unified.by===f)return G.unified;
  const mine=myFac()===f;G.unified={by:f,y:Math.floor(G.cal),life:P.lifeNo,mine};last.unified=f;
  showBanner('천하통일',`${FAC4N[f]}의 천하`);{const x=worldOf();if(x)log(`천하가 바뀐다: ${x.n}. ${x.d}.`,'sys')}log(`${FAC4N[f]}이(가) 천하를 하나로 묶었다. ${mine?`당신은 그 중심에 섰다: 명성 +${UNIFY.fame}, 은자 +${UNIFY.silver}.`:'당신의 세력은 그 아래 엎드렸다.'}`,mine?'xp':'dmg');
  if(mine){P.fame+=UNIFY.fame;P.silver+=UNIFY.silver}P.feats.push(`${Math.floor(P.age)}세 천하통일: ${FAC4N[f]}의 천하${mine?' (내 세력)':''}`);return G.unified}
{const we=warEnd;warEnd=function(silent){const had=!!G.war;we(silent);if(had)unifyCheck()}}
// 정세 창: 세력의 힘 카드 다음에 천하통일 카드 (내 세력의 노선, 네 세력의 진척)
function unifyCard(){const w=wld(),my=myFac();
  const rows=FAC4.map(f=>{const riv=Math.max(...FAC4.filter(o=>o!==f).map(o=>w.pow[o]));const okP=w.pow[f]>=UNIFY.pow,okR=riv<=UNIFY.rival;
    return `<p style="margin:4px 0"><b style="color:${FACC[f]}">${FAC4N[f]}</b>${f===my?' <small class="gold">(내 세력)</small>':''} 힘 <b class="num ${okP?'good':''}">${Math.round(w.pow[f])}</b>/${UNIFY.pow} · 가장 센 상대 <b class="num ${okR?'good':''}">${Math.round(riv)}</b>/${UNIFY.rival}${okP&&okR?' <small class="good">조건 충족</small>':''}</p>`}).join('');
  return `<div class="card"><div class="row2"><h4>천하통일</h4><span class="tag">${G.unified?`${FAC4N[G.unified.by]}의 천하 (제${G.unified.life}생)`:'아직 아무도'}</span></div>
    ${worldHtml()}<p><b style="color:${FACC[my]}">${FAC4N[my]}의 길</b> <small>${UNIFY.lines[my]}</small></p>${rows}
    <p class="note">천하대전을 한 세력이 홀로 이기고, 그 힘이 ${UNIFY.pow} 이상이며 나머지 셋이 모두 ${UNIFY.rival} 이하면 천하통일. 내 세력이면 명성 +${UNIFY.fame}, 은자 +${UNIFY.silver}. 사건마다 내 세력의 눈으로 본 노선이 열리고, 다른 세력의 길은 고를 수 없다.</p></div>`}
{const ps=pStory;pStory=function(){const h=ps(),first=evCard(curEv()[0]),i=h.indexOf(first);return i<0?h+unifyCard():h.slice(0,i)+unifyCard()+h.slice(i)}}

// ================= 현경 너머: 생사경·자연경, 좌화 =================
// 사용자 결정(2026-10-20): 현경 위 경지를 만들고, 생사경부터는 언제든 스스로 윤회(좌화)할 수 있게 한다.
// 생사경(7): 한 해에 한 번 쓰러질 피해를 받으면 생명 절반으로 버틴다, 수명 +10년, 좌화.
// 자연경(8): 천인합일. 피해 +15%, 받는 피해 -10%, 운기조식 내공 회복 두 배(g_realmfx.js realmQiMul), 수명 +20년.
// 문턱(외공·무리)·수치는 data/realm.json BEYOND, 내공 문턱은 REALM_QI, 이름은 RANKS. 폐관은 다른 벽과 같다(g_realm.js).
// 살아 있는 칸의 제목 화면에서는 '다음 생 시작'을 숨겨, 새 생은 죽음과 좌화로만 열린다(g_screens.js).
const BEY=GD.BEYOND;

// 경지에 오를 때 한 번 (realmGain이 부른다)
function beyondGain(r){if(r===7){P.life+=BEY.saeng.life;feat('생사현관을 뚫고 생사경에 올랐다')}
  if(r===8){P.life+=BEY.jayeon.life;feat('천지와 하나 되어 자연경에 올랐다')}}

// ---- 생사경: 한 해에 한 번 죽음을 넘긴다 (G.cal 기준) ----
const ssReady=()=>realmIdx()>=7&&!(P.ssY!=null&&G.cal-P.ssY<1);
hook('lethal',()=>{if(!ssReady())return;P.ssY=G.cal;P.hp=Math.max(1,Math.round(P.maxHp*BEY.saeng.save));P.inv=Math.max(P.inv||0,1);
  fx.push({t:'ring',x:P.x,y:P.y,life:.8,max:.8,col:'235,225,190'});shake=Math.max(shake,.3);addText(P.x,P.y-.6,'생사경','#f2e6b8');
  log('생사의 경계에서 한 걸음 물러섰습니다. 생명을 절반 되찾았습니다 (한 해에 한 번).','xp')});

// ---- 자연경: 천인합일 ----
hook('hit',c=>{if(realmIdx()>=8)c.m*=1+BEY.jayeon.dmg});
hook('hurt',c=>{if(realmIdx()>=8)c.dm*=1-BEY.jayeon.cut});

// ---- 좌화: 생사경부터 스스로 이 생을 마치고 윤회한다. 죽음과 똑같이 업보·보상 활력·강호사가 남는다 ----
function jwaWhy(){if(realmIdx()<BEY.jwa.minR)return`${RANKS[BEY.jwa.minR]}에 올라야 한다`;if(G.duel)return'비무 중';if(inCombat())return'싸움 중';
  if(typeof warOn==='function'&&warOn())return'천하대전 중이다';return''}
function jwaAsk(on){P.jwaAsk=on==='1';renderOpen()}
function jwahwa(){const why=jwaWhy();P.jwaAsk=false;if(why){log(`좌화할 수 없습니다: ${why}.`,'info');renderOpen();return}
  closePanels();feat(`${realmName()}의 경지에서 스스로 좌화했다`);log(`${P.name}은(는) 가부좌를 틀고 고요히 숨을 거두었습니다. 혼은 윤회의 수레바퀴로 돌아갑니다.`,'sys');die('좌화')}
// 인물창 경지 카드 맨 아래 (g_realm.js realmCard)
function jwaHtml(){if(realmIdx()<BEY.jwa.minR)return'';const why=jwaWhy();
  if(P.jwaAsk&&!why)return `<p class="note">이 생을 여기서 마치고 다음 생으로 넘어간다. 업보에 따라 다시 태어나고 보상 활력과 강호사가 남는다. 되돌릴 수 없다.</p><div class="row2">${B('jwa:0','그만두기')}${B('jwa2','좌화한다',{pri:1})}</div>`;
  return `<div class="row2"><span class="note">생사경의 고수는 원할 때 스스로 생을 마칠 수 있다.${ssReady()?'':' 올해 생사의 경계를 이미 한 번 넘겼다.'}</span><button type="button" class="btn" data-act="jwa:1"${why?' disabled':''}>${why||'좌화 (윤회)'}</button></div>`}

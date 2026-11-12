// ================= v257 사문 호칭·항렬 (동훈님 2026-11-12, 적용 계획 PR3) =================
// 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 A. 고파 「강호는 어떻게 돌아가는가」의 사문 호칭과 학렬. 숫자·글자는 data/samun.json (GD.SAMUN)
// 대사만 바뀌고 수치는 건드리지 않는다.
// - 같은 문파 사람을 나와의 관계로 부른다: 내 사부 = 사부, 사부와 같은 세대의 다른 사부 = 사백(먼저)·사숙(나중), 장문인 = 사조(사부의 윗대)
//   입문 동기는 서열(P.sabu.ord)로 위 = 사형, 아래 = 사제. 사부 없이 공통 길이면 사부들은 모두 사숙, 장문인은 장문인
// - 출가(P.monk, g_lore.js 출가하기)하면 그 문파 세대의 돌림자를 넣은 법명·도호(P.dname)를 받고 이름표에 쓴다. 사형이 장문인이 되어도 호칭은 그대로
// - 전생의 제자(g_past.js)가 내 문파 원로면 '사숙조': 내가 가르친 아이를 윗대로 모셔야 한다
// 테스트 tests/t173_samun.js
const SMN=GD.SAMUN||{};
// 사부들(g_sabu.js sbMasters)의 k 번째와 나의 관계
function smMaster(sid,k){const b=P.sabu;if(!b||b.sid!==sid||P.sect!==sid)return '';if(b.st==='disc'&&b.m>=0)return k===b.m?'사부':k<b.m?'사백':'사숙';return '사숙'}
// 장문인
function smHead(sid){if(P.sect!==sid)return '';return P.sabu&&P.sabu.sid===sid&&P.sabu.st==='disc'?'사조':'장문인'}
// 입문 동기 (이름)
function smCoh(n){const b=P.sabu;if(!b)return '';const me=b.ord.indexOf('@'),i=b.ord.indexOf(n);if(i<0||me<0)return '';return i<me?'사형':'사제'}
const smTag=r=>r?` <small class="gold">${r}</small>`:'';
// ---- 출가 법명·도호 ----
function smFaith(sid){return (SMN.bul||[]).includes(sid)?'bul':'do'}
function smDharma(sid){const f=smFaith(sid),gen=SMN.gen[f],c=gen[Math.min(gen.length-1,SMN.myGen)],pool=SMN.pool[f];
  const h=[...(P.name||'')].reduce((a,ch)=>a+ch.charCodeAt(0),0);return c+pool[h%pool.length]}
hook('sectAct',c=>{if(c.a!=='kmonk'||!P.monk||P.dname)return;P.dname=smDharma(P.monk);const s=SECTS[P.monk],f=smFaith(P.monk);
  log(`${s?s.n:''}에 출가해 ${f==='bul'?'법명':'도호'} '${P.dname}'을(를) 받았다. 돌림자 '${P.dname[0]}'는 ${SMN.genN[f]} 세대의 글자다.`,'xp');
  if(typeof showBanner==='function')showBanner(f==='bul'?'법명':'도호',P.dname);feat(`출가해 ${P.dname}(이)라는 이름을 받았다`)});
// 장문인 대화 첫머리에 관계
hook('hqDlg',c=>{const s=SECTS[c.n.hq];if(!s||P.sect!==s.id||c.html==null)return;const r=smHead(s.id);if(r!=='사조')return;
  c.html=`<p class="note">${esc(P.dname||P.name)}은(는) ${masterTitle(s)}을(를) <b class="gold">사조</b>로 모신다. 사부의 사부다.</p>`+c.html});

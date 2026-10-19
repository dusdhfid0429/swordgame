// ================= 천하대전 스토리 2단계 (2026-10-15 v108): 사건 살 붙이기 — 장소·인물 대화, 사건 전용 적 =================
// 설계 docs/스토리_설계.md '2단계'. 데이터 data/story.json STORY.AT[evId] = {at:[규칙…], where:글, foe:적 무리 이름}.
// - 사건이 열리면 어디서 이야기를 들을지 알려 주고(openEvent 로그, 정세 창 카드 '장소' 줄), 그 인물(규칙: id / hqFac / maeng / role / emperor)의 대화 맨 위에 사건 카드가 붙어 거기서도 고른다.
// - 임무가 딸린 선택을 고르면 사건 전용 적 무리가 곧바로 둘레에 나타난다(이름 "사건 · 종류", e.story). 임무가 안 끝난 채 다른 바깥 지역에 들어서면 남은 수만큼 다시 나타난다.
// - 이 파일은 PARTS 끝에 있어 npcDlg 훅이 다른 대화 훅들 뒤에 돈다 (앞에 두면 c.html이 차서 다른 대화가 막힌다).
const EV_AT=STORY.AT||{};
const evAt=id=>EV_AT[id]||(id&&id.startsWith('b2_')?S2.AT:null);   // v153: 2막 사건은 한 장소 규칙을 함께 쓴다
function evNpcOk(rule,n){if(!rule||!n)return false;for(const k in rule){const v=rule[k];
  if(k==='id'){if(n.id!==v)return false}else if(k==='hqFac'){if(!n.hq||!SECTS[n.hq]||alFac(SECTS[n.hq].al)!==v)return false}
  else if(k==='maeng'){if(n.maeng!==v)return false}else if(k==='role'){if(n.role!==v)return false}else if(k==='emperor'){if(!n.emperor)return false}else if(n[k]!==v)return false}return true}
const evAtNpc=n=>{const s=P&&PS();if(!s||!s.open)return null;const e=evOf(s.open),a=evAt(s.open);return e&&a&&a.at.some(r=>evNpcOk(r,n))?e:null};
hook('npcDlg',c=>{const e=evAtNpc(c.n);if(!e)return;const base=c.html??pNpcBase(c.n);c.html=`<p class="note">"${e.n} 이야기를 들었소? 강호가 술렁이오."</p>`+evCard(e)+base});
{const oe=openEvent;openEvent=function(e){oe(e);const a=evAt(e.id);if(a&&a.where)log(`${a.where}에게서 이야기를 들을 수 있다. 정세 창(N)에서도 고른다.`,'info')}}
{const ec=evCard;evCard=function(e){let h=ec(e);const a=evAt(e.id);if(a&&a.where&&evState(e)==='open')h=h.replace('<div class="list">',`<p class="note">장소: ${a.where}</p><div class="list">`);return h}}
// ---- 사건 전용 적 ----
const kindFac=k=>Object.keys(FAC_KIND).find(f=>FAC_KIND[f].includes(k));
function evFoes(e,q){if(!P||!playing||!REGION()||G.duel||/^in_/.test(REG)||P.jail)return 0;q=q||P.quests.find(x=>x.story===e.id);if(!q||q.have>=q.cnt)return 0;
  if(mobs.some(m=>m.story===e.id&&m.hp>0))return 0;const a=evAt(e.id)||{},want=Math.min(6,q.cnt-q.have+1);let made=0;
  for(let t=0;t<80&&made<want;t++){const an=Math.random()*Math.PI*2,r=7+Math.random()*3,x=P.x+Math.cos(an)*r,y=P.y+Math.sin(an)*r;if(!walkAt(x,y))continue;
    const k=q.mob[made%q.mob.length],f=kindFac(k);let m;
    if(f)m=mkFac(f,FAC_KIND[f].indexOf(k)===1?1:0,x,y);else if(MOBS[k])m=mkMob(k,x,y);else continue;
    m.story=e.id;m.angry=1;m.aggro=true;m.tgt=null;m.name=`${a.foe||e.n} · ${m.name}`;mobs.push(m);made++}
  if(made){showBanner(a.foe||e.n,`${made}명이 나타났다`);log(`[${e.n}] ${a.foe||'적'} ${made}명이 덮쳐 온다. 임무 [${q.n}] ${q.have}/${q.cnt}.`,'dmg')}return made}
{const pc=pickChoice;pickChoice=function(e,i,auto){const r=pc(e,i,auto);if(r&&!auto&&e.ch[i]&&e.ch[i].quest)setTimeout(()=>{if(playing)evFoes(e)},400);return r}}
hook('regionLoaded',id=>{if(!P||!playing)return;setTimeout(()=>{if(!playing||REG!==id)return;for(const q of P.quests)if(q.story&&q.have<q.cnt){const e=evOf(q.story);if(e)evFoes(e,q)}},1200)});

// ================= 임무창: 맡은 임무의 상세 (사용자 요청 2026-10-13 "임무들의 상세 정보를 볼 수 있는 임무 창") =================
// 맡은 임무마다 의뢰처·대상(나오는 곳)·재료(얻는 곳)·진행·보상·보고 장소를 한 장에. 보고는 여기서 못 하고(의뢰처에 가야 한다) 포기만 된다.
// 열기: J 키, ☰ 메뉴 '임무', 화면 왼쪽 '맡은 임무' 글 누르기, 의뢰판·문파·맹 창의 '임무창' 단추. 재료 얻는 곳 글은 data/economy.json MAT_FROM.
const MAT_FROM=GD.MAT_FROM||{};
// 의뢰처와 보고할 곳
function questFrom(q){
  if(q.sect&&SECTS[q.sect]){const s=SECTS[q.sect];return{n:s.n,at:`본산 ${hqPlace(s)}의 ${masterTitle(s)}, 또는 성도의 ${s.n} 연락관`,merit:`${s.n} 공적 +${q.merit}`}}
  if(q.maeng&&typeof MAENG!=='undefined'&&MAENG[q.maeng]){const M=MAENG[q.maeng];return{n:M.n,at:`${PROV[M.prov].n} ${M.city} 성내 북쪽 ${M.n}`,merit:`${M.short} 공적 +${q.merit}`}}
  return{n:'개봉 의뢰판',at:'개봉 관아 앞 의뢰판',merit:''}}
function questProg(q){const kill=q.kind==='kill',have=kill?q.have||0:Math.min(q.cnt,P.mats[q.mat]||0);return{kill,have,done:have>=q.cnt,pct:Math.min(100,Math.round(have/q.cnt*100))}}
// 대상이 나오는 곳 / 재료를 얻는 곳
function questWhere(q){
  if(q.kind==='kill')return q.mob.map(k=>{const w=typeof mobWhere==='function'?mobWhere(k):'';return `${k}${w?` <small class="dim">${w}</small>`:''}`}).join(' · ');
  return `${q.mat}${MAT_FROM[q.mat]?` <small class="dim">${MAT_FROM[q.mat]}</small>`:''}`}
function questCard(q,i){const f=questFrom(q),p=questProg(q);
  const rew=[`은자 ${q.silver}`,q.vit?`활력 ${q.vit}`:'',q.fame?`명성 ${q.fame}`:'',q.good?`선업 ${q.good}`:'',f.merit].filter(Boolean).join(' · ');
  return `<div class="card"><div class="row2"><h4>${esc(q.n)} ${p.done?'<small class="good">완료 · 보고하면 보상</small>':''}</h4><span class="tag">${f.n}</span></div>
    <p>${p.kill?'처치':'납품'} <b class="gold">${questWhere(q)}</b></p>
    <p>진행 <b class="num ${p.done?'good':''}">${p.have}/${q.cnt}</b>${p.kill?'':` <small class="dim">(가진 것 ${P.mats[q.mat]||0})</small>`}</p><div class="mbar"><i style="width:${p.pct}%;background:${p.done?'#7fc77a':'#c9a24a'}"></i></div>
    <p>보상 ${rew}</p><p class="note">보고: ${f.at}</p>
    <div class="row2"><span></span>${B('qdrop:'+i,'포기')}</div></div>`}
function pQuest(){const qs=P.quests||[];
  const where=[`개봉 의뢰판 <small class="dim">한 번에 셋 · ${G.board&&G.board.length?`붙은 방 ${G.board.length}`:'새 방은 해가 바뀌면'}</small>`];
  if(P.sect&&SECTS[P.sect])where.push(`${SECTS[P.sect].n} 임무 <small class="dim">본산 ${masterTitle(SECTS[P.sect])}·성도 연락관 · 해마다 둘</small>`);
  const al=typeof maengOf==='function'?maengOf():null;if(al&&typeof MAENG!=='undefined'&&MAENG[al])where.push(`${MAENG[al].n} 임무 <small class="dim">총단 · 해마다 셋</small>`);
  return `<p class="note">맡은 임무 ${qs.length}. 보상은 의뢰처에 가서 보고해야 받는다. 적이 나오는 곳과 재료 얻는 곳이 흐린 글로 적혀 있다.</p>
    ${qs.length?qs.map(questCard).join(''):'<p class="note">맡은 임무가 없다.</p>'}
    <div class="card"><h4>임무를 맡는 곳</h4>${where.map(w=>`<p>${w}</p>`).join('')}</div>`}
// 열기: J 키, 왼쪽 '맡은 임무' 글(PC)
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||!playing)return;if(e.code==='KeyJ')openPanel('quest')});
{const el=$('qtrack');if(el){el.style.cursor='pointer';el.addEventListener('click',()=>{if(playing&&!TOUCH)openPanel('quest')})}}

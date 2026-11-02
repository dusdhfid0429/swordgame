// v230 창 설명 줄이기 (동훈님 2026-11-02 "이런 설명들이 너무 글이 많아"): 개선 계획 3절.
// 설명은 한 줄 요약(칩·숫자) + '자세히'로 접은 본문. 펼친 칸은 창을 다시 그려도 열린 채로 남는다(BRIEF_OPEN).
// 손으로 줄이지 않은 다른 긴 .note는 briefClamp가 두 줄로 자르고, 누르면 다 보인다.
const BRIEF_OPEN=new Set(),BRIEF_LONG=new Set();
function chip(t,c){return `<span class="chip${c?' '+c:''}">${t}</span>`}
function fold(key,sum,body){const o=BRIEF_OPEN.has(key);
  return `<details class="brief"${o?' open':''} data-bk="${key}"><summary><span class="bsum">${sum}</span><i class="bmore">자세히</i></summary><div class="bbody">${body}</div></details>`}
// 여러 줄 본문: [['머리','설명'],...] → 한 줄씩
function briefList(rows){return `<ul class="blist">${rows.filter(Boolean).map(r=>Array.isArray(r)?`<li><b class="gold">${r[0]}</b> ${r[1]}</li>`:`<li>${r}</li>`).join('')}</ul>`}
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.dataset||!d.dataset.bk)return;d.open?BRIEF_OPEN.add(d.dataset.bk):BRIEF_OPEN.delete(d.dataset.bk)},true);
const BRIEF_MAX=110;   // 이보다 긴 설명 줄은 두 줄로 자른다
function briefClamp(root){if(!root)return;root.querySelectorAll('p.note').forEach(p=>{
  if(p.closest('.brief,.todo,#forgetask')||p.querySelector('button,input,select,.btn'))return;
  const t=p.textContent.trim();if(t.length<=BRIEF_MAX)return;
  const k=t.slice(0,40);p.classList.add('clamp');p.dataset.ck=k;if(BRIEF_LONG.has(k))p.classList.add('open')})}
document.addEventListener('click',e=>{const p=e.target&&e.target.closest&&e.target.closest('p.note.clamp');if(!p||e.target.closest('.term'))return;
  p.classList.toggle('open');p.classList.contains('open')?BRIEF_LONG.add(p.dataset.ck):BRIEF_LONG.delete(p.dataset.ck)});
hook('panelDrawn',()=>briefClamp($('wbody')));

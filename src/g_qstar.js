// ================= 초식 내공 성(星) 단계 (v178, 사용자 2026-10-26) =================
// "초식 소모 내공을 상수로 두지 말고 비율로, 내 내공량 기준 비율에 해당하는 값에 따라 데미지가 달라지게"
// "비율을 12로 나눠 1성~12성으로, 메인 HUD에서 정해 두고 쓰게. 실제 쓴 내공에 따라 이펙트가 달라지게, 지금 이펙트가 최대"
// 초식마다 f.qp = 최대 내공의 몇 %인지 (data/qistar.json QSTAR.pct). P.qs(1~12)가 그중 몇 성을 쓸지.
// 쓴 내공 = 최대 내공 × qp% × 성/12. 피해 배율 X.qm = (쓴 내공 / 경지 표준 내공의 12성 양)^exp. 이펙트 세기 X.fs = 성/12 (12성 = 지금 그림)
const QS=GD.QSTAR;
const qsCur=()=>clamp(Math.round((P&&P.qs)||QS.def),1,QS.n);
// 경지가 오를수록 같은 초식이 먹는 비율이 준다 (QS.eff[경지], 삼류 1). 고수일수록 내공을 아껴 쓴다
const qsEff=()=>QS.eff[Math.min(realmIdx(),QS.eff.length-1)];
function formQi(f,s=qsCur()){return Math.max(QS.min,Math.round(P.maxQi*formPct(f)/100*s/QS.n))}
const formPct=f=>f.qp*qsEff();   // 지금 경지에서 12성일 때 최대 내공의 몇 %
// 기준 = 지금 경지의 표준 내공(QS.ref[경지], 그 경지 내공 문턱)으로 12성을 쓸 때의 양. 같은 경지에서 내공이 많을수록 세고, 성을 낮추면 약하다
const qsRef=()=>QS.ref[Math.min(realmIdx(),QS.ref.length-1)];
const formPow=(q,f)=>Math.pow(q/(formPct(f)/100*qsRef()),QS.exp);
// 초식 한 번의 X에 성·이펙트 세기·피해 배율을 싣는다. 돌려주는 값 = 이번에 쓸 내공(심법 절약 특색 전)
function qsX(X,f,s=qsCur()){const q=formQi(f,s);X.qs=s;X.fs=s/QS.n;X.qm=formPow(q,f);return q}
// 성이 낮은 시전의 이펙트: 옅게(pw), 가늘게, 입자 적게. 한 번만 (f.pw가 붙어 있으면 건너뛴다). thin=false면 밝기만
function fxPw(f,X,thin=true){if(!f||!X||X.fs==null||X.fs>=1||f.pw)return;const s=X.fs,F=QS.fx;f.pw=F.a+(1-F.a)*s;if(!thin)return;
  const k=F.w+(1-F.w)*s;if(f.w)f.w*=k;if(f.s)f.s*=k;if(f.t==='parts'&&f.ps)f.ps.length=Math.max(1,Math.round(f.ps.length*(F.p+(1-F.p)*s)))}
const qsGlow=(X,g)=>!X||X.qs==null||X.qs>=g;   // 대성 잔광·극성 금빛 심이 붙을 만큼의 성인가
function qsSet(s){if(!P)return;const v=clamp(Math.round(s),1,QS.n);if(v===P.qs)return;P.qs=v;qsHud();addText(P.x,P.y-.6,`${v}성`,'#9fd0ff')}
function qsHud(){const b=$('qsr');if(!b||!P)return;const s=qsCur();if(b.dataset.s==s)return;b.dataset.s=s;
  $t('qst',`${s}성`);b.querySelectorAll('.qsp i').forEach((p,i)=>p.classList.toggle('on',i<s));b.title=`초식 내공 ${s}성: 초식마다 정해진 비율의 ${Math.round(s/QS.n*100)}%를 쓴다 ([ ] 키)`}
{const b=$('qsr');if(b){b.querySelector('.qsp').innerHTML=Array.from({length:QS.n},(_,i)=>`<i data-q="${i+1}"></i>`).join('');
  b.addEventListener('click',e=>{const t=e.target.closest('[data-q]');if(!t)return;e.stopPropagation();const v=t.dataset.q;qsSet(v==='-'?qsCur()-1:v==='+'?qsCur()+1:+v)});
  b.addEventListener('keydown',e=>e.stopPropagation())}}
addEventListener('keydown',e=>{if(!playing||!P||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  if(e.code==='BracketLeft'){e.preventDefault();qsSet(qsCur()-1)}else if(e.code==='BracketRight'){e.preventDefault();qsSet(qsCur()+1)}});

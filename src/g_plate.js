// ================= 머리 위 생명 막대: 관계별 모양·색 (v210) =================
// 사용자 2026-10-30: "HP바 플레이트를 나와의 관계에 따라 구분되게, 아군인 경우와 내가 타겟팅한 적(공격 중인 적)만 나오게"
//  동료(초록, 둥근 끝)·결전장 아군과 싸우는 같은 편 무인(파랑, 둥근 끝)은 늘 / 적(빨강, 뾰족한 끝)은 겨누었거나 내가 친 뒤 PLATE.keep초 동안만
//  경계(노랑)·중립(옅은 갈색, 납작)은 겨눌 때만. 보스·정예는 금테·뿔. 겨눈 대상은 밝은 테. 잃은 몫은 잠깐 하얗게 남았다가 줄어든다
// 수치·색은 data/plate.json (PLATE)
const PLATE=GD.PLATE;
// 나와의 관계
function plRel(e){
  if(e.ally)return'pal';if(e.warAlly)return'ally';if(e.duel)return'foe';
  if(e.d.fac){if(mobFoeP(e))return'foe';const st=typeof repStE==='function'?repStE(e):2;if(st===1)return'wary';return facFoe(e.d.fac,pfac())?'neu':'side'}
  if(e.d.villager)return e.angry?'foe':'neu';
  if(e.d.passive&&!e.aggro)return'neu';
  return e.d.hostile||e.aggro?'foe':'neu'}
// 띄울지와 투명도 (0이면 안 띄움)
function plAlpha(e,rel){
  if(P.target===e)return 1;
  if(rel==='pal'||rel==='ally')return 1;
  if(rel==='side')return(e.tgt&&e.tgt.hp>0)||time-(e.hurtAt??-99)<PLATE.sideFight?1:0;
  if(rel==='foe'){const t=time-(e.pHitAt??-99);return t<PLATE.keep?1:t<PLATE.keep+PLATE.fade?1-(t-PLATE.keep)/PLATE.fade:0}
  return 0}
const plShown=e=>!e.dead&&e.hp>0&&!!P&&plAlpha(e,plRel(e))>0;
// 내가 친 적을 기억한다. from이 나, 또는 내 투사체가 넘기는 {x,y} 자리. 동료·무인(d나 kind가 있는 것)이 친 것은 아니다
hook('struck',(e,from)=>{if(!from||from===P||!(from.d||from.kind))e.pHitAt=time});
function plPath(x,y,w,h,rel){const l=x-w/2,r=x+w/2;ctx.beginPath();
  if(rel==='foe'){const k=h/2+2;ctx.moveTo(l-k,y+h/2);ctx.lineTo(l,y-1);ctx.lineTo(r,y-1);ctx.lineTo(r+k,y+h/2);ctx.lineTo(r,y+h+1);ctx.lineTo(l,y+h+1);ctx.closePath()}
  else if(rel==='neu'||rel==='wary'){ctx.rect(l-1,y-1,w+2,h+2)}
  else{const rr=h/2+1;ctx.moveTo(l,y-1);ctx.lineTo(r,y-1);ctx.arc(r,y+h/2,rr,-Math.PI/2,Math.PI/2);ctx.lineTo(l,y+h+1);ctx.arc(l,y+h/2,rr,Math.PI/2,Math.PI*1.5);ctx.closePath()}}
// x: 가운데, y: 막대 윗줄, w: 너비. 띄웠으면 이름 색을 돌려준다 (안 띄우면 null)
function drawPlate(e,x,y,w){
  if(!P||e.dead||e.hp<=0)return null;const rel=plRel(e),a=plAlpha(e,rel);if(a<=0)return null;
  const C=PLATE.col[rel],boss=e.d.boss||e.d.elite,tg=P.target===e,h=boss?PLATE.bossH:PLATE.h,f=Math.max(0,Math.min(1,e.hp/e.maxHp));
  if(boss)w*=1.35;
  const dt=Math.min(.1,Math.max(0,time-(e.plT||time)));e.plT=time;if(e.plG==null||e.plG<f)e.plG=f;else e.plG=Math.max(f,e.plG-PLATE.ghost*dt);
  ctx.save();ctx.globalAlpha*=a;
  plPath(x,y,w,h,rel);ctx.fillStyle='rgba(0,0,0,.72)';ctx.fill();
  ctx.lineWidth=tg?1.6:1;ctx.strokeStyle=tg?PLATE.target:boss?PLATE.boss:C.edge;ctx.stroke();
  const l=x-w/2;if(e.plG>f){ctx.fillStyle='rgba(255,240,220,.75)';ctx.fillRect(l+w*f,y,w*(e.plG-f),h)}
  const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,C.bar);g.addColorStop(1,C.edge);ctx.fillStyle=g;ctx.fillRect(l,y,w*f,h);
  ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(l,y,w*f,1);
  if(boss){ctx.fillStyle=PLATE.boss;const k=h/2+2;for(const s of[-1,1]){const ex=x+s*(w/2+k);ctx.beginPath();ctx.moveTo(ex-s*2,y-1);ctx.lineTo(ex+s*2,y-6);ctx.lineTo(ex-s*1,y+1);ctx.fill()}}
  if(tg){const by=y-3+Math.sin(time*5)*1;ctx.fillStyle=PLATE.target;ctx.beginPath();ctx.moveTo(x+w/2+8,by);ctx.lineTo(x+w/2+12,by-3);ctx.lineTo(x+w/2+12,by+3);ctx.fill();ctx.beginPath();ctx.moveTo(x-w/2-8,by);ctx.lineTo(x-w/2-12,by-3);ctx.lineTo(x-w/2-12,by+3);ctx.fill()}
  ctx.restore();return C.name}

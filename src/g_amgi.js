// ================= 요대와 암기 (v186) =================
// 사용자 2026-10-26: "암기무공 사용시 장비중 요대를 추가하고 암기의 종류에 따라 이펙트 형태를 다르게 하고 수량을 추가" → '암기 개수를 소모'.
// 요대(P.eq.belt)에 고른 암기(belt.am)는 재료(P.mats)에서 한 발에 하나씩 준다. 다 쓰면 초식 원래 모양(기본 비도)으로 나간다.
// 암기 초식의 투사체만 쓴다(r_exec.js exec proj → amgiLoad). 기본 공격·비 초식·특수무공 암기는 그대로. 표는 data/amgi.json
const AMMO=GD.AMMO,BELTS=GD.BELTS;
function mkBelt(q,i=0){const it=mkGear('belt',BELTS[Math.min(i,BELTS.length-1)],q,{hm:GD.BELT_HM});it.am=GD.BELT_GIFT.am;return it}
const beltAmmo=()=>{const b=P.eq.belt;return b&&AMMO[b.am]?b.am:null};
const ammoN=k=>P.mats[k]||0;
// 투사체 하나에 암기를 싣는다. 실을 것이 없으면 그대로 둔다
function amgiLoad(q){const k=beltAmmo();if(!k||!(ammoN(k)>0))return false;const a=AMMO[k];P.mats[k]--;
  q.ammo=k;q.kind=a.pj;q.m*=a.m||1;
  if(a.spd){q.vx*=a.spd;q.vy*=a.spd}if(a.len)q.left*=a.len;if(a.pierce)q.pierce=true;if(a.kb)q.kb+=a.kb;
  if(a.psn)q.psn=Math.max(q.psn||0,a.psn);if(a.col){q.c=a.col;q.c2=a.col}if(a.boom)q.boom=a.boom;
  if(ammoN(k)===0)log(`요대의 ${k}을(를) 다 썼습니다. 이제 초식 본래의 비도가 나갑니다.`,'info');
  return true}
// 벽력자: 맞거나 떨어진 자리에서 터진다. 직접 맞은 적은 빼고 둘레만
function amgiBoom(q){if(q.boomed)return;q.boomed=1;const o={x:q.x,y:q.y},b=q.boom;
  for(const e of foes())if(e.hp>0&&!q.hit.has(e)&&dist(e,o)<b.r)hitE(q.X,e,q.m*b.m,.4,0,o);
  fx.push({t:'puff',x:o.x,y:o.y,life:.5});GL({t:'ring2',x:o.x,y:o.y,r:b.r,col:'255,170,80',w:4,life:.32},q.X);
  GL({t:'star',x:o.x,y:o.y,col:'255,210,120',s:1.3,life:.22},q.X);shake=Math.max(shake,.12)}
// 처음 암기 병기를 들면 가죽 요대와 비도를 한 번 받는다 (새 생·문파 입문·옛 저장 모두)
hook('recalc',()=>{if(!P||P.beltGift||!P.eq.weapon||P.eq.weapon.cls!=='암')return;P.beltGift=1;const g=GD.BELT_GIFT,b=mkBelt(1);
  addMat(g.am,g.n);if(!P.eq.belt){P.eq.belt=b;log(`암기를 담을 ${b.name}를 허리에 찼습니다. ${g.am} ${g.n}${AMMO[g.am].unit}을 넣어 두었습니다.`,'sys')}
  else{giveItem(b);log(`${b.name}와 ${g.am} ${g.n}${AMMO[g.am].unit}을 받았습니다.`,'sys')}});
// 장비 칸 설명과 행낭 창의 암기 고르기 줄
const beltTxt=it=>{const k=AMMO[it.am]?it.am:null;return k?`암기 ${k} ${it===P.eq.belt?ammoN(k)+AMMO[k].unit:''} · ${AMMO[k].d}`:'암기 없음'};
function beltPick(){const b=P.eq.belt;if(!b)return '';
  return `<div class="card"><h4>요대 암기 <small class="dim">암기 초식 한 발에 하나씩 · 다 쓰면 초식 본래의 비도</small></h4><div class="ib">${Object.keys(AMMO).map(k=>B('amk:'+k,`${b.am===k?'● ':''}${k} ${ammoN(k)}`,{pri:b.am===k?1:0})).join('')}</div></div>`}

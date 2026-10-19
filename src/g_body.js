// ================= 몸의 변화: 환골탈태 · 반로환동 · 금강불괴 =================
// 사용자 요청(2026-10-19, 리뷰라마 「무협 웹툰 속 내공과 경지」 정리 뒤): "환골탈태 반로환동 금강불괴를 적용해줘. 반로환동시 실제로 캐릭터의 나이를 윤회와 별개로 어려지게"
// 수치는 data/realm.json BODY, 설계는 docs/경지_설계.md '몸의 변화'
//  환골탈태 P.hgt: 화경에 오르거나, 절정 이상에서 영약 내공이 1갑자를 넘으면 (한 생에 한 번). 기본기·수명(계열 표), 수련 활력 -20%, 후유증·독·중독·탁기 정화
//  반로환동 P.ban: 현경에 오르면 몸의 나이를 BODY.ban.to 세까지(최대 max 년) 되돌린다. G.cal·살아온 해는 그대로
//  금강불괴 P.gang: 불가 계열 화경(금강경), 또는 환골탈태한 몸의 지구력이 BODY.gang.end 이상. 받는 피해·독 면역, 등 뒤 조문은 약점
const BODY=GD.BODY;
const realAge=()=>P.age+(P.ban?P.ban.yrs:0);
const elixirQi=()=>(P.gcs?120:0)+(P.mss||0)*60;
function bodyFx(col,dark){if(dark)fParts(null,P,'40,30,30',22,70,'dot',1.1);fParts(null,P,col,16,90,'dot',.9);
  GL({t:'ring2',x:P.x,y:P.y,r:1.2,col,w:5,life:.8});fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1.8})}

// ---- 환골탈태 ----
function hwangol(why){if(P.hgt)return false;const c=SC(),B=BODY.hg;P.hgt={age:Math.floor(P.age),why};
  P.life+=c.l5;for(const{k}of STATS){P.st[k]+=c.st[k];P.base[k]+=c.st[k]}
  const cured=[];if(P.inj||P.injS)cured.push('주화입마 후유증');P.inj=0;P.injS=0;if(P.poison>0)cured.push('독');P.poison=0;
  if(P.addict){cured.push('영약 중독');P.addict=null;P.thirst=0}if((P.mara||0)>0){P.mara=Math.max(0,P.mara-B.mara);cured.push('탁기')}
  recalc();P.hp=P.maxHp;bodyFx('255,236,190',1);showBanner('환골탈태','뼈와 살이 새로 태어났다');
  log(`환골탈태: 온몸의 털구멍으로 검은 탁기가 빠져나가고 뼈와 살이 새로 태어났습니다. ${stTxt(c.st)}${c.l5?`, 수명 +${c.l5}년`:''}, 기본기 수련 활력 -${Math.round((1-B.cost)*100)}%${cured.length?`. 씻겨 나간 것: ${cured.join('·')}`:''}.`,'xp');
  P.feats.push(`${Math.floor(P.age)}세에 ${why==='영약'?'영약의 기운으로 ':''}환골탈태했다`);gangCheck();return true}
// 영약 내공이 1갑자를 넘으면 몸이 바뀐다. 절정 아래에서는 몸이 받아내지 못하고 기다린다
function elixirBody(){if(P.hgt||elixirQi()<BODY.hg.elixir)return;
  if(realmIdx()>=BODY.hg.minR){hwangol('영약');return}
  if(!P.hgWait){P.hgWait=1;log(`영약의 기운이 뼛속에 고였지만 아직 몸이 받아내지 못합니다. ${RANKS[BODY.hg.minR]}에 오르면 환골탈태가 일어납니다.`,'info')}}

// ---- 반로환동: 몸의 나이만 젊어진다 ----
function banro(){if(P.ban)return;const B=BODY.ban,a=Math.floor(P.age),back=Math.max(0,Math.min(B.max,a-B.to));
  P.ban={from:a,yrs:back};P.age-=back;lastYear=Math.floor(P.age);recalc();P.hp=P.maxHp;bodyFx('255,250,225');
  if(back>0){showBanner('반로환동',`${a}세 → ${Math.floor(P.age)}세`);addText(P.x,P.y-.8,`${Math.floor(P.age)}세`,'#ffe7a0');
    log(`반로환동: 백발이 검어지고 주름이 펴집니다. ${a}세의 몸이 ${Math.floor(P.age)}세로 돌아왔습니다. 살아온 해는 그대로 남고 수명까지 ${back}년이 더 남았습니다.`,'xp');
    P.feats.push(`${a}세에 반로환동해 ${Math.floor(P.age)}세의 몸이 되었다`)}
  else log('반로환동: 아직 젊은 몸이라 되돌릴 세월은 없지만 기혈이 아이처럼 맑아집니다.','xp')}

// ---- 금강불괴 ----
const gangOn=()=>!!P.gang;
function gangCheck(){if(P.gang||!P.st)return;const s=typeof school==='function'?school():'';
  const why=realmIdx()>=5&&s==='불가'?'금강경':P.hgt&&P.st.end>=BODY.gang.end?'외공':null;if(!why)return;
  P.gang={why};showBanner('금강불괴','칼이 들지 않는 몸');bodyFx('255,205,90');
  log(`금강불괴지신: 살갗이 쇠처럼 단단해져 받는 피해 -${Math.round((1-BODY.gang.dm)*100)}%, 독에 걸리지 않습니다. 다만 등 뒤의 조문(약점)을 맞으면 금강이 풀려 피해가 ${Math.round((BODY.gang.back-1)*100)}% 더 들어옵니다.`,'xp');
  P.feats.push(`${Math.floor(P.age)}세에 금강불괴지신을 이루었다`)}
// 공격한 쪽이 내가 보는 방향의 등 뒤에 있으면 조문
const fromBack=src=>{if(!src||src.x==null)return false;const dx=src.x-P.x,dy=src.y-P.y,l=Math.hypot(dx,dy)||1;return (dx*P.fx+dy*P.fy)/(l*(Math.hypot(P.fx,P.fy)||1))<-.35};
hook('hurt',c=>{if(!gangOn()||!c.src||!c.src.d)return;
  if(fromBack(c.src)){c.dm*=BODY.gang.back;c.joMun=1;if(time-(P.gjT||-9)>1){P.gjT=time;addText(P.x,P.y-.4,'조문!','#ff8a70')}return}
  c.dm*=BODY.gang.dm;if(time-(P.ggT||-9)>1.5){P.ggT=time;addText(P.x,P.y-.4,'금강','#ffd27a')}});
hook('hurtDone',c=>{if(gangOn()&&!c.joMun&&P.poison>0&&c.src&&c.src.d&&c.src.d.poison)P.poison=0});
hook('recalc',()=>{if(P&&P.hgt&&!P.gang&&P.st.end>=BODY.gang.end&&playing)gangCheck()});

// ---- 호신강기 (사용자 2026-10-19: "경지가 오를수록 데미지를 줄여주고 내공을 소모해") ----
// 초절정부터 받는 피해를 BODY.hs.cut[경지]만큼 막고, 막은 피해 × hs.qi[경지] 만큼 내공이 빠진다(사용자: 경지가 오를수록 소모는 준다). 내공이 brk 아래면 깨지고 back 까지 차야 다시 선다.
// 두 단계 아래 하수의 공격을 1/5로 막는 것(g_realmfx.js)은 그대로 두고, 그 뒤에 남은 피해에 건다
const hsCut=()=>BODY.hs.cut[realmIdx()]||0,hsQi=()=>BODY.hs.qi[realmIdx()]||0;
function hsUp(){if(hsCut()<=0)return false;if(P.hsBrk&&P.qi>=P.maxQi*BODY.hs.back){P.hsBrk=0;addText(P.x,P.y-.6,'호신강기','#ffe7a0');log('내공이 차올라 호신강기가 다시 섰습니다.','info')}return !P.hsBrk}
hook('hurt',c=>{if(!c.src||!c.src.d||!hsUp())return;const B=BODY.hs,q=hsQi(),cut=Math.min(c.dm*hsCut(),Math.max(0,P.qi)/q);if(cut<=0)return;
  c.dm-=cut;P.qi=Math.max(0,P.qi-cut*q);P.hsLast=cut;
  if(time-(P.hsFx||-9)>.35){P.hsFx=time;GL({t:'ring2',x:P.x,y:P.y,r:.7,col:'255,224,140',w:3,life:.25})}
  if(P.qi<P.maxQi*B.brk){P.hsBrk=1;addText(P.x,P.y-.6,'호신강기 깨짐','#ff8a70');log(`내공이 바닥나 호신강기가 깨졌습니다. 내공이 ${Math.round(B.back*100)}%까지 차야 다시 섭니다.`,'dmg')}});

// 예전 저장: 화경을 이미 지났으면 환골탈태한 몸으로 친다(능력치는 그때 받았다), 현경이면 지금 젊어진다
function bodySync(){const r=realmIdx();if(r>=5&&!P.hgt)P.hgt={age:null,why:'화경'};if(r>=6&&!P.ban)banro();gangCheck()}

// ---- 인물창 경지 카드 ----
function bodyHtml(){const B=BODY,row=(on,n,d,how)=>`<div class="it"><div>${on?'<b class="good">●</b>':'<span class="dim">○</span>'} <b${on?' class="gold"':''}>${n}</b><span>${on?d:how}</span></div><div class="ib"></div></div>`;
  const ra=Math.floor(realAge());
  return `<details${P.hgt||P.ban||P.gang||hsCut()>0?' open':''}><summary>몸의 변화</summary><div class="list">
    ${row(!!P.hgt,'환골탈태',B.hg.d+(P.hgt&&P.hgt.age!=null?` (${P.hgt.age}세, ${P.hgt.why==='영약'?'영약':'화경'})`:''),`화경에 오르거나, ${RANKS[B.hg.minR]} 이상에서 영약 내공이 1갑자를 넘으면 (지금 ${gapja(elixirQi())||'없음'})`)}
    ${row(!!P.ban,'반로환동',B.ban.d+(P.ban?` · 몸 ${Math.floor(P.age)}세, 살아온 해 ${ra}년`:''),`현경에 오르면 몸이 ${B.ban.to}세까지(최대 ${B.ban.max}년) 젊어진다`)}
    ${row(hsCut()>0,'호신강기',`${B.hs.d}. 지금 받는 피해 -${Math.round(hsCut()*100)}%, 막은 피해 1당 내공 ${hsQi()}${P.hsBrk?' · <span class="bad">깨짐</span>':''}`,`${RANKS[B.hs.minR]}에 오르면 선다 (막는 피해 초절정 25%·화경 35%·현경 45%, 피해 1당 내공 0.6·0.4·0.2)`)}
    ${row(!!P.gang,'금강불괴',B.gang.d,`불가 계열로 화경에 오르거나, 환골탈태한 몸으로 지구력 ${B.gang.end} 이상 (지금 ${P.st.end})`)}
  </div></details>`}

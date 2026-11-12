// ================= v259 사천당가의 독과 해독 (동훈님 2026-11-12, 적용 계획 PR4) =================
// 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 E. 고파 「사천당가 — 독과 암기의 명가」: 해독제는 당가만 가진다, 은혜는 두 배·원한은 열 배.
// 숫자는 data/dang.json (GD.DANG). 암기 소모·요대(g_amgi.js)는 그대로 둔다.
// - 당가독(P.tdok, 남은 초): 당가(SECTS.dang) 정예(직위 2 이상)·우두머리에게 맞으면 DANG.chance 확률로 걸린다. 걸려 있는 동안은 다시 걸리지 않는다.
//   초마다 최대 생명의 DANG.drain. 해독단으로는 풀리지 않는다. 운기조식 중에는 DANG.meditMul배 빨리 빠진다. 객잔·집에서 쉬면 풀린다(보통 독과 같다).
// - 당가 해독제: 당가 본산 장문인 대화에서 산다. 우호는 제값, 중립은 DANG.priceMul배, 경계·적대에는 팔지 않는다. 금강불괴(호신강기, g_body.js)면 걸리지 않는다
// - 은원: 당가 우호도는 오르는 것이 DANG.rep.up배, 떨어지는 것이 DANG.rep.down배 (g_rep.js repAdd). 전생의 은원(g_past.js)도 같은 배율로 이어진다
// 테스트 tests/t174_dang.js
const DGT=GD.DANG||{sid:'dang',chance:.2,dur:15,drain:.008,meditMul:3,price:40,priceMul:3,rep:{up:2,down:3}};
const dangSrc=src=>!!(src&&src.sect===DGT.sid&&(src.rank>=2||src.d&&(src.d.boss||src.d.elite)));
hook('hurtDone',c=>{if(!P||P.hp<=0||P.tdok>0||!dangSrc(c.src))return;if(typeof gangOn==='function'&&gangOn())return;if(Math.random()>=DGT.chance)return;
  P.tdok=DGT.dur;log('당가독에 중독되었습니다. 해독단으로는 풀리지 않습니다. 당가 해독제나 운기조식, 쉬기로 풀린다.','dmg');if(typeof showBanner==='function')showBanner('당가독','해독단 무효')});
hook('tick',dt=>{if(!P||!playing||!(P.tdok>0)||paused)return;P.tdok=Math.max(0,P.tdok-dt*(P.medit?DGT.meditMul:1));P.hp-=P.maxHp*DGT.drain*dt;
  if(P.hp<=0&&!G.duel){P.hp=0;die('당가독');return}if(!P.tdok)log('당가독이 빠졌습니다.','info')});
// 해독단은 듣지 않는다 / 당가 해독제
hook('useCon',c=>{if(c.k==='해독단'&&P.tdok>0&&!P.poison){c.done=true;log('해독단으로는 당가독이 풀리지 않습니다.','info')}
  else if(c.k==='당가해독제'){c.done=true;if(!(P.mats['당가해독제']>0))return;if(!(P.tdok>0)&&!P.poison){log('중독되지 않았습니다.','info');return}P.mats['당가해독제']--;P.tdok=0;P.poison=0;log('당가 해독제로 독을 풀었습니다.','xp')}});
// 은원 배율 (g_rep.js repAdd가 부른다)
function dangRepMul(sid,dv){if(sid!==DGT.sid||!dv)return 1;return dv>0?DGT.rep.up:DGT.rep.down}
// 장문인 대화: 해독제
function dangPrice(){const st=typeof repStageOf==='function'?repStageOf(repSect(DGT.sid)):2;if(P.sect===DGT.sid||st>=3)return DGT.price;if(st===2)return DGT.price*DGT.priceMul;return 0}
function dangBuy(){const c=dangPrice();if(!c||P.silver<c)return;P.silver-=c;addMat('당가해독제');log(`당가 해독제를 은자 ${c}에 샀습니다.`,'xp')}
hook('sectAct',c=>{if(c.a!=='dangbuy')return;c.done=true;c.r=true;dangBuy()});
hook('hqDlg',c=>{if(c.n.hq!==DGT.sid||c.html==null)return;const p=dangPrice(),why=!p?'당가와 사이가 나빠 팔지 않는다':P.silver<p?`은자 ${p} 필요`:'';
  c.html+=`<div class="card"><h4>당가 해독제 <small class="dim">당가독을 푸는 것은 당가뿐</small></h4><div class="list"><div class="it"><div>당가 해독제<span>${p?`은자 ${p}${p>DGT.price?' (우호가 아니라 웃돈)':''}`:''} · 가진 것 ${P.mats['당가해독제']||0}${why?` · <span class="bad">${esc(why)}</span>`:''}</span></div><div class="ib">${B('dangbuy','산다',{d:!!why,pri:!why})}</div></div></div><p class="note">"은혜는 두 배로, 원한은 열 배로 갚는 것이 당가다."</p></div>`});

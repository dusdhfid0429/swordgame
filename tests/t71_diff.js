// 난이도 (2026-10-15 v110): 완전 새로 시작할 때만 다섯 단계 중 고른다. 저장 칸에 남아 윤회해도 그대로. 적 생명·공격, 받는 피해, 활력, 마성, 추살조 인원에 배율.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');
  // 1. 빈 칸의 첫 인생: 탄생 화면에 난이도 카드(5단계, 기본 보통). 고르면 G.diff
  const c=await p.evaluate(()=>{const o={};o.n=document.querySelectorAll('[data-s^="diff:"]').length;o.def=document.querySelector('[data-s="diff:1"]').getAttribute('aria-pressed')==='true';o.names=DIFF.map(d=>d.n).join('·');return o});
  await p.click('[data-s="diff:3"]');
  const c2=await p.evaluate(()=>({diff:G.diff,pressed:document.querySelector('[data-s="diff:3"]').getAttribute('aria-pressed')==='true'}));
  ok(`탄생 화면 난이도 카드: ${c.n}단계(${c.names}) 기본 보통 ${c.def} · 고수 고르면 G.diff=${c2.diff} ${c2.pressed}`,c.n===5&&c.def&&c.names==='입문·보통·어려움·고수·지옥'&&c2.diff===3&&c2.pressed);
  await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 2. 배율: 사람 몹 생명·공격(mobScaled), 짐승(mobMade), 받는 피해(hurt), 활력(gainVit), 마성(maraAdd), 추살조(diffSquad)
  const m=await p.evaluate(()=>{const o={};const at=(k,f)=>{const g=G.diff;G.diff=k;const r=f();G.diff=g;return r};
    const mob=k=>at(k,()=>{const e=mkMob('산적',0,0);e.d={...e.d,elite:1};e.realm=2;scaleMob(e);return[e.maxHp,e.atk]});o.n=mob(1);o.h=mob(4);o.e=mob(0);
    const beast=k=>at(k,()=>{const e=mkMob('늑대',0,0);return e.maxHp});o.wn=beast(1);o.wh=beast(4);
    const took=k=>at(k,()=>{const e=mkMob('산적',P.x+1,P.y);e.realm=0;const R=Math.random;Math.random=()=>.99;P.inv=0;P.hp=P.maxHp;hurtP(50,e);Math.random=R;return P.maxHp-P.hp});o.tn=took(1);o.th=took(4);
    const vit=k=>at(k,()=>{P.vit=0;gainVit(100);return P.vit});o.vn=vit(1);o.vh=vit(4);
    const mara=k=>at(k,()=>{P.sect='cheonma';P.mara=0;maraAdd(10,'t');const v=P.mara;P.sect=null;P.mara=0;return v});o.mn=mara(1);o.mh=mara(4);
    o.sq=[at(0,()=>diffSquad(4)),at(1,()=>diffSquad(4)),at(4,()=>diffSquad(4))];o.mul=DIFF[4];P.hp=P.maxHp;mobs=[];return o});
  const mu=m.mul;
  ok(`배율(지옥): 정예 생명 ${m.n[0]}→${m.h[0]} 공격 ${m.n[1]}→${m.h[1]} (입문 ${m.e[0]}/${m.e[1]}) · 늑대 ${m.wn}→${m.wh} · 받는 피해 ${m.tn}→${m.th} · 활력 ${m.vn}→${m.vh} · 마성 ${m.mn}→${m.mh} · 추살조 ${m.sq}`,
    Math.abs(m.h[0]-m.n[0]*mu.mobHp)<=1&&Math.abs(m.h[1]-m.n[1]*mu.mobAtk)<=1&&m.e[0]<m.n[0]&&Math.abs(m.wh-m.wn*mu.mobHp)<=1&&m.th>m.tn*mu.taken*.9&&Math.abs(m.vh-m.vn*mu.vit)<=1&&Math.abs(m.mh-m.mn*mu.mara)<=.5&&m.sq[0]<m.sq[1]&&m.sq[2]===Math.round(4*mu.squad));
  // 3. 인물 창에 난이도 카드. 윤회(둘째 인생)의 탄생 화면에는 난이도 카드가 없고 G.diff는 그대로
  const l=await p.evaluate(()=>{const o={};openPanel('char');o.card=$('win').innerText.includes('난이도')&&$('win').innerText.includes('고수');closePanels();
    G.lives=1;showCreate();o.pick=!document.querySelector('[data-s^="diff:"]');o.diff=G.diff;const g=G.diff;act=null;return o});
  ok(`인물 창 카드 ${l.card} · 둘째 인생 탄생 화면에 난이도 선택 없음 ${l.pick}, G.diff 유지 ${l.diff}`,l.card&&l.pick&&l.diff===3);
  // 4. 옛 저장(G.diff 없음)은 보통. '처음부터 새로'(reset2)는 다시 고른다
  const o4=await p.evaluate(()=>{const o={};delete G.diff;o.old=diffIdx()===1&&diffOf().n==='보통';G.lives=0;G.diff=0;showCreate();o.pick=!!document.querySelector('[data-s^="diff:"]');o.pressed=document.querySelector('[data-s="diff:0"]').getAttribute('aria-pressed')==='true';return o});
  ok(`옛 저장은 보통 ${o4.old} · 빈 칸(처음부터 새로)은 다시 고른다 ${o4.pick} 입문 표시 ${o4.pressed}`,o4.old&&o4.pick&&o4.pressed);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

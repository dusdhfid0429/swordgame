// v258 마교 교리·충성·소교주 후보 (동훈님 2026-11-12, 마교 영상 분석 제안 1·2·4)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(500);
  // 1. 교규 다섯 줄·구호가 천마신전 대화에, 마교도면 '교를 따르는 이유' 카드와 세 단추
  const r1=await p.evaluate(()=>{enterRegion('hq_cheonma',20.5,20.5);P.reg=REG;mobs=[];const n={hq:'cheonma',n:'교주'};const o={out:hqDlg(n)};
    P.sect='cheonma';P.imk={st:'done'};P.merit.cheonma=0;P.mloyal=null;o.in=hqDlg(n);o.why=mlWhy();return{creed:MG4.creed.length,cry:o.out.includes(MG4.cry),c0:o.out.includes('교규'),l0:o.out.includes('교를 따르는 이유'),
      l1:o.in.includes('교를 따르는 이유'),btn:['faith','rise','fear'].every(k=>o.in.includes(`data-act="mloyal:${k}"`)),why:o.why}});
  ok(`교규 ${r1.creed}줄 · 구호 ${r1.cry} · 비석 ${r1.c0} · 바깥 사람에겐 이유 카드 없음 ${!r1.l0} · 마교도 카드 ${r1.l1} 단추 ${r1.btn} · 고를 수 있음 '${r1.why}'`,
    r1.creed===5&&r1.cry&&r1.c0&&!r1.l0&&r1.l1&&r1.btn&&r1.why==='');
  // 2. 출세: 마교 공적이 더 들어온다. 한 번 고르면 바꿀 수 없다
  const r2=await p.evaluate(()=>{const g=()=>{const m=P.merit.cheonma||0;addMerit('cheonma',100);return (P.merit.cheonma||0)-m};const base=g();sectAct('mloyal','rise');const rise=g();
    const again=mlPick('fear');return{base,rise,k:P.mloyal,again}});
  ok(`출세: 공적 100 → 그냥 ${r2.base}, 출세 ${r2.rise} · 다시 고르기 막힘 ${!r2.again} (${r2.k})`,r2.rise>r2.base&&r2.k==='rise'&&!r2.again);
  // 3. 신앙: 마성은 덜 쌓이고 죄값은 무겁다
  const r3=await p.evaluate(()=>{P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';const run=()=>{P.mara=0;P.sin=0;maraAdd(20,'t');sinAdd(10,'t');return{m:P.mara,s:P.sin}};
    P.mloyal=null;const a=run();P.mloyal='faith';const f=run();P.mara=0;P.sin=0;return{am:a.m,as:a.s,fm:f.m,fs:f.s}});
  ok(`신앙: 마성 ${r3.am} → ${r3.fm} · 죄값 ${r3.as} → ${r3.fs}`,r3.am>0&&r3.fm<r3.am&&r3.fs===15&&r3.as===10);
  // 4. 공포: 혈고. 첫 해 해약은 받은 채, 해약 없이 해를 넘기면 생명 상한이 깎이고(최대 30%) 해약을 받으면 돌아온다. 교를 떠나도 남는다
  const r4=await p.evaluate(()=>{P.mloyal=null;sectAct('mloyal','fear');const o={k:P.mloyal,ok0:P.guOk,gu0:P.gu};recalc();const h0=P.maxHp;
    G.cal=Math.floor(G.cal||0)+1;Math.random=()=>.99;runHooks('newYear');o.gu1=P.gu;o.h1=P.maxHp;    // 받은 해: 깎이지 않는다
    for(let i=0;i<4;i++){G.cal+=1;runHooks('newYear')}o.gu2=P.gu;o.h2=P.maxHp;o.btn=hqDlg({hq:'cheonma',n:'교주'}).includes('data-act="guok"');
    sectAct('guok');o.gu3=P.gu;o.h3=P.maxHp;o.h0=h0;return o});
  ok(`공포: 고름 ${r4.k} 첫 해약 ${r4.ok0} · 1년 혈고 ${r4.gu1} · 4년 더 ${r4.gu2} 생명 ${r4.h0}→${r4.h2} · 해약 단추 ${r4.btn} → 혈고 ${r4.gu3} 생명 ${r4.h3}`,
    r4.k==='fear'&&r4.ok0===1&&r4.gu0===0&&r4.gu1===0&&r4.gu2===.3&&r4.h2<r4.h1&&r4.btn&&r4.gu3===0&&r4.h3>r4.h2);
  // 5. 소교주 후보 출신: 입마곡 출신 → 장로 가문 → 교주 혈육 (뒤로 갈수록 세다), 이기면 반대파 장로 둘
  const r5=await p.evaluate(()=>{P.sect='cheonma';P.imk={st:'done'};P.mloyal=null;P.sgj=0;P.sgjI=0;P.sgjOpp=null;P.sgjCool=0;P.realm=3;P.mtot.cheonma=500;enterRegion('hq_cheonma',20.5,20.5);P.reg=REG;mobs=[];
    const o={c:[],hp:[]};for(let i=0;i<3;i++){openNpc(hqNpc('hq_cheonma'));act('sgjgo');const e=mobs.find(m=>m.duel);o.c.push(e&&e.cand);o.hp.push(e&&e.maxHp);if(e)damage(e,1e9,0,0,P)}
    o.sgj=P.sgj;o.opp=(P.sgjOpp||[]).length;return o});
  ok(`후보 ${r5.c.join('→')} · 생명 ${r5.hp.join('/')} · 소교주 ${r5.sgj} · 반대파 장로 ${r5.opp}`,r5.c.join()==='imagok,elder,blood'&&r5.sgj===1&&r5.opp===2);
  // 6. 반대파 설득: 공적이 모자라면 막히고, 남아 있으면 교주 비무를 청할 수 없다. 둘 다 설득하면 풀린다
  const r6=await p.evaluate(()=>{const o={};P.merit.cheonma=10;o.w0=oppWhy();o.html=sgjHtml(SECTS.cheonma,true).includes('data-act="sgjopp"');P.merit.cheonma=200;
    P.mtot.cheonma=99999;P.realm=6;P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.mara=0;P.talma=1;P.ldTried=0;o.lw=leaderWhy();
    sectAct('sgjopp');o.left=P.sgjOpp.length;sectAct('sgjopp');o.left2=P.sgjOpp.length;o.merit=P.merit.cheonma;o.lw2=leaderWhy();return o});
  ok(`설득: 공적 부족 '${r6.w0}' · 단추 ${r6.html} · 비무 막힘 '${r6.lw}' · 남은 장로 ${r6.left}→${r6.left2} · 공적 ${r6.merit} · 그 뒤 비무 '${r6.lw2}'`,
    /공적/.test(r6.w0)&&r6.html&&/장로/.test(r6.lw)&&r6.left===1&&r6.left2===0&&r6.merit===80&&!/장로 \d명/.test(r6.lw2));
  // 7. 교주가 간부를 묶는 법: 덕으로면 세입 절반, 독으로면 도전자가 물러서기도 한다
  const r7=await p.evaluate(()=>{const o={};P.leader='cheonma';P.ldBind=null;o.card=hqDlg({hq:'cheonma',n:'교주'}).includes('data-act="ldbind:deok"');sectAct('ldbind','deok');
    const sv=P.silver;Math.random=()=>.99;runHooks('newYear');o.inc=P.silver-sv;const e0=P.evil||0;sectAct('ldbind','dok');o.evil=(P.evil||0)-e0;
    Math.random=()=>.5;o.ch=leaderChallenge();o.duel=!!G.duel;P.leader=null;return o});
  ok(`다스림: 카드 ${r7.card} · 덕으로 세입 +${r7.inc} · 독으로 악업 +${r7.evil} · 도전자 물러섬 ${!r7.ch}`,r7.card&&r7.inc===250&&r7.evil===10&&!r7.ch&&!r7.duel);
  // 8. 저장·불러오기
  const r8=await p.evaluate(()=>{P.mloyal='fear';P.gu=.2;P.sgjOpp=['혈수장로'];P.ldBind='deok';saveGame(true);const d=loadGame();return d.P.mloyal==='fear'&&d.P.gu===.2&&d.P.sgjOpp.length===1&&d.P.ldBind==='deok'});
  ok(`저장·불러오기 ${r8}`,r8);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

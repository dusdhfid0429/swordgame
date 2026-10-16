// 마성(魔性) (2026-10-15 v104): 마공 운용 중 수련·살생으로 오르고 운기조식·마기 정련으로 내린다. 입마·심마·광마 단계, 폭주, 100이면 주화입마, 깨달음 절반, 추살조
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 마공이 아니면 마성이 안 오르고 HUD도 숨는다. 마공을 운용하면 수련·살생으로 오른다
  const a=await p.evaluate(()=>{const o={};maraAdd(10);o.noMa=(P.mara||0)===0&&$('mag').style.display==='none';
    P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.sect='cheonma';P.vit=999;P.qiAcc=100;P.qiN=10;const q0=P.qiAcc;qiTrained();o.train=P.mara;o.qiUp=P.qiAcc>q0||P.qiX>0;
    const e=mkMob('늑대',P.x+1,P.y);mobs.push(e);e.hp=1;damage(e,5,0,0,P);o.kill=P.mara;mobs=[];P.target=null;hud();o.hud=$('mag').style.display!=='none'&&$('mat').textContent.includes('마성');
    return o});
  ok(`마공 아닐 때 마성 ${!a.noMa?'오름':'없음'} · 수련 +${a.train} · 살생 후 ${a.kill} · HUD ${a.hud}`,a.noMa&&a.train===3&&a.kill===4&&a.hud&&a.qiUp);
  // 2. 단계별 공격·피해 배율과 운기조식 감소
  const t=await p.evaluate(()=>{const o={},mk=()=>{const e=mkMob('늑대',P.x+1,P.y);e.def=0;e.hp=e.maxHp=5000;mobs.push(e);return e};const R=Math.random;Math.random=()=>.5;
    const X={art:ARTS[P.cur],key:null,t:0,mul:1,combo:1};const hitAt=m=>{P.mara=m;const e=mk();hitE(X,e,1,0,0);const d=5000-e.hp;mobs=[];return d};
    o.d0=hitAt(0);o.d1=hitAt(45);o.d3=hitAt(95);
    const hurtAt=m=>{P.mara=m;P.hp=P.maxHp;const e=mk();P.inv=0;hurtP(100,e);const d=P.maxHp-P.hp;mobs=[];P.hp=P.maxHp;return d};
    o.h0=hurtAt(0);o.h1=hurtAt(45);Math.random=R;
    P.mara=50;P.medit=true;mobs=[];P.target=null;P.path=null;for(let i=0;i<40;i++)update(.1);o.medit=P.mara;P.medit=false;o.tier=[MARA_N[(P.mara=0,maraTier())],MARA_N[(P.mara=40,maraTier())],MARA_N[(P.mara=70,maraTier())],MARA_N[(P.mara=90,maraTier())]].join('·');P.mara=0;return o});
  ok(`공격 배율 평정 ${t.d0} → 입마 ${t.d1} → 광마 ${t.d3} · 받는 피해 ${t.h0} → ${t.h1} · 운기조식 4초 뒤 마성 50 → ${t.medit} · 단계 ${t.tier}`,
    t.d1>t.d0*1.05&&t.d3>t.d1*1.05&&t.h1>t.h0*1.05&&t.medit<50&&t.medit>40&&t.tier==='평정·입마·심마·광마');
  // 3. 폭주: 같은 편 마교도도 친다. 끝나면 강제공격이 원래대로
  const bu=await p.evaluate(()=>{const o={};mobs=[];const ally=mkFac('마',0,P.x+2,P.y,'cheonma');mobs.push(ally);o.peace=peaceful(ally);toggleForce(false);maraBurst();o.on=!!P.burst&&forceAtk;update(.2);update(.2);o.target=P.target===ally;
    for(let i=0;i<25;i++)update(.2);o.off=!P.burst&&!forceAtk;mobs=[];P.target=null;return o});
  ok(`폭주: 같은 편 ${bu.peace} → 폭주 중 강제공격 ${bu.on}, 표적 ${bu.target}, 끝나면 해제 ${bu.off}`,bu.peace&&bu.on&&bu.target&&bu.off);
  // 4. 마성 100 → 주화입마 (내공 10% 손실, 마성 60). 깨달음은 절반. 산공 입마는 마성 20으로 시작
  const d=await p.evaluate(()=>{const o={};P.qiAcc=200;P.mara=98;maraAdd(5);o.qi=P.qiAcc;o.mara=P.mara;P.enl=0;gainEnl(1,'t');o.enl=P.enl;
    P.sims={N_hwasan_1:1};P.sim='N_hwasan_1';P.side='정';P.mara=0;sangong('마공');o.sg=P.mara;P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';sangong('도가');o.reset=P.mara;P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.side='사';return o});
  ok(`주화입마: 내공 200 → ${d.qi}, 마성 ${d.mara} · 깨달음 1 → ${d.enl} · 산공 입마 마성 ${d.sg} · 마공을 버리면 ${d.reset}`,d.qi===180&&d.mara===60&&d.enl===.5&&d.sg===20&&d.reset===0);
  // 5. 천마신전 마기 정련, 인물창 카드, 추살조
  const r=await p.evaluate(()=>{const o={};P.mara=50;P.merit.cheonma=100;openNpc(hqNpc('hq_cheonma')||{id:'x',hq:'cheonma',x:0,y:0});o.btn=!!document.querySelector('[data-act="mrefine"]');sectAct('mrefine');o.after=P.mara;o.merit=P.merit.cheonma;closePanels();
    openPanel('char');o.card=$('win').innerText.includes('마성');closePanels();P.fame=60;mobs=[];o.hunt=maraHunt();o.n=mobs.filter(m=>m.hunt).length;o.foe=mobs.filter(m=>m.hunt).every(m=>!peaceful(m));mobs=[];return o});
  ok(`마기 정련 단추 ${r.btn} → 마성 50 → ${r.after}, 공적 100 → ${r.merit} · 인물창 마성 카드 ${r.card} · 추살조 ${r.hunt} ${r.n}명 모두 적 ${r.foe}`,r.btn&&r.after===20&&r.merit===80&&r.card&&r.hunt&&r.n===4&&r.foe);
  // v130 (사용자): 내공·생명이 가득해도 마성이 남아 있으면 터치 운기 단추가 보인다
  await p.evaluate(()=>{setTouch(true);P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.qi=P.maxQi;P.hp=P.maxHp;P.medit=false;P.ride=null;mobs=[];P.mara=0});await p.waitForTimeout(400);const m={isMa:await p.evaluate(()=>isMa()),full:await p.evaluate(()=>$('t_med').hidden)};await p.evaluate(()=>{P.mara=30});await p.waitForTimeout(400);m.mara=await p.evaluate(()=>$('t_med').hidden);await p.evaluate(()=>{P.mara=0;setTouch(false)});
  ok(`터치 운기 단추: 마공 ${m.isMa} · 내공·생명 가득이면 숨김(${m.full}), 마성 30이면 보임(${!m.mara})`,m.isMa&&m.full&&!m.mara);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

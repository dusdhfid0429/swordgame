// 기본기 능력치의 쓰임: 지구력 → 활력 최대치, 본원진기 → 생명, 내공 → 내공 심법 수련으로만.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const r=await p.evaluate(()=>{const o={};
    const hp0=P.maxHp,qi0=P.maxQi;P.st.qi+=5;recalc();o.hpUp=P.maxHp-hp0;o.qiSame=P.maxQi===qi0;P.st.qi-=5;recalc();
    const v0=maxVit();P.st.end+=4;o.vitUp=maxVit()-v0;const hp1=P.maxHp;recalc();o.hpSameEnd=P.maxHp===hp1;
    P.vit=maxVit()-5;o.gained=gainVit(100);o.capped=P.vit===maxVit();
    P.vit=maxVit()+200;const hi=P.vit;gainVit(10);o.overKept=P.vit===hi;
    P.vit=5000;o.q1=P.maxQi;for(const m of mobs)m.aggro=false;trainQi();return o});
  await p.waitForTimeout(2200);r.qiTrain=await p.evaluate(q1=>P.maxQi-q1,r.q1);
  ok(`본원진기 +5 → 생명 +${r.hpUp}, 내공은 그대로`,r.hpUp===50&&r.qiSame);
  ok(`지구력 +4 → 활력 최대 +${r.vitUp}, 생명은 그대로`,r.vitUp===100&&r.hpSameEnd);
  ok(`활력은 최대치에서 멈춘다 (+${r.gained})`,r.gained===5&&r.capped);
  ok('이미 넘친 활력(전생에서 받은 것)은 깎지 않는다',r.overKept);
  ok(`내공 심법 수련 → 내공 +${r.qiTrain}`,r.qiTrain>0);
  await p.waitForTimeout(200);ok(`HUD shows 활력 n/max (${await p.evaluate(()=>$('res').textContent)})`,/활력 \d+\/\d+/.test(await p.evaluate(()=>$('res').textContent)));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

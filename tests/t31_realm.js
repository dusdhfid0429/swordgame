// 경지: 세 기둥(외공·내공·무리)이 모두 차야 벽에 닿고, 폐관수련으로 벽을 깨야 오른다. 실패하면 주화입마
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[]});
  // 내공만 키우면 경지가 오르지 않는다
  const r1=await p.evaluate(()=>{P.qiN=50;recalc();return{q:baseQi(),r:realmIdx(),wall:atWall(),lack:lacking().map(x=>x.n)}});
  ok(`내공만 ${r1.q}: 경지 ${r1.r}, 벽 ${r1.wall}, 모자람 ${r1.lack}`,r1.r===0&&!r1.wall&&r1.lack.includes('외공')&&r1.lack.includes('무리'));
  // 세 기둥을 채우면 벽
  const r2=await p.evaluate(()=>{for(const k of['str','end','agi','qi'])P.st[k]+=3;P.arts.base.p=60;P.arts[Object.keys(ARTS)[0]]={p:30,f:[true,false,false]};P.vit=999;wallCheck();return{oe:pillarVal('oe'),mu:pillarVal('mu'),wall:atWall(),r:realmIdx(),why:pgWhy()}});
  ok(`세 기둥 차서 벽: 외공 ${r2.oe} 무리 ${r2.mu} → 벽 ${r2.wall}, 경지 ${r2.r}, 들판에서는 '${r2.why}'`,r2.wall&&r2.r===0&&r2.why.includes('정상'));
  // 인물창 경지 카드
  await p.evaluate(()=>{openPanel('char')});await p.waitForTimeout(300);
  ok('인물창에 세 기둥과 벽',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('외공')&&t.includes('무리')&&t.includes('벽에 막혔다')}));
  await p.screenshot({path:shot('realm_char')});await p.evaluate(()=>closePanels());
  // 화산 정상으로 가서 폐관수련 (성공하도록 Math.random 고정)
  await p.evaluate(()=>{const m=REGIONS.pv_shaanxi.marks.find(q=>q.n==='화산');P.reg=m.gate;loadRegion(m.gate);P.x=20.5;P.y=7.5;mobs=[];const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;openTrain()});await p.waitForTimeout(400);
  const row=await p.evaluate(()=>({place:pgPlace(),why:pgWhy(),ch:pgChance(),btn:!!TRN.querySelector('[data-tr="pg"]:not([disabled])')}));
  ok(`화산 정상에서 폐관 가능: ${row.place} 성공 ${Math.round(row.ch*100)}%`,row.place==='화산 정상'&&!row.why&&row.btn);
  await p.screenshot({path:shot('realm_train')});
  const age0=await p.evaluate(()=>{window._rnd=Math.random;Math.random=()=>.01;return P.age});
  await p.tap('[data-tr="pg"]');await p.waitForFunction(()=>!trnBusy,null,{timeout:15000}).catch(()=>{});   // 시간 대신 폐관이 끝나기를 기다린다
  const s=await p.evaluate(()=>{Math.random=window._rnd;return{r:realmIdx(),n:realmName(),age:P.age,wall:atWall()}});
  ok(`벽을 깸: ${s.n}, 나이 +${(s.age-age0).toFixed(1)}`,s.r===1&&s.age-age0>=.45&&!s.wall);
  // 주화입마: 실패하면 내공을 잃고 경맥이 상한다
  const d=await p.evaluate(()=>{P.qiN=200;for(const k of['str','end','agi','qi'])P.st[k]+=6;P.arts.base.p=100;for(const id of Object.keys(ARTS).slice(0,3))P.arts[id]={p:60,f:[true,true,true]};recalc();
    const w=atWall(),q0=P.qiN,a0=atk();window._rnd=Math.random;let i=0;Math.random=()=>[.99,.5][i++]??.5;pgFinish(false);Math.random=window._rnd;
    return{w,r:realmIdx(),lost:q0-P.qiN,inj:P.inj>0,a0,a1:atk()}});
  ok(`주화입마: 경지 ${d.r} 유지, 내공 회차 -${d.lost}, 공격력 ${d.a0}→${d.a1}`,d.w&&d.r===1&&d.lost>=1&&d.inj&&d.a1<d.a0);
  // 예전 저장: P.realm 없으면 지금 내공 경지를 이어받는다
  const m=await p.evaluate(()=>{saveGame(true);const data=JSON.parse(localStorage.getItem(SAVE_KEY));delete data.v;delete data.P.realm;data.P.qiN=30;applySave(data);return{r:P.realm,q:qiRealm()}});
  ok(`예전 저장 옮김: 경지 ${m.r} = 내공 경지 ${m.q}`,m.r===m.q&&m.r>=2);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// v260 표행의 깃발과 암표 (동훈님 2026-11-12, 적용 계획 PR6): 참여 단추 둘, 깃발 = 산적 비킴·세력 ×1.5·명성, 암표 = 습격 건너뜀·품삯 0.8
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 표국 창에 참여 단추 둘, 깃발로 참여하면 q.flag='flag' 품삯 그대로, 암표로 참여하면 'hid' 품삯 ×0.8
  const r1=await p.evaluate(()=>{P.realm=6;P.fame=999;P.silver=100;const runs=pyoRuns(PYO.gaebong);openNpc(NPCS.find(q=>q.pyo==='gaebong'));const h=$('wbody').innerHTML;closePanels();
    const s0=runs[0].silver,s1=runs[1]&&runs[1].silver;act('pyojoin:gaebong:0');const q0=P.quests.find(q=>q.hired&&q.run===runs[0].id);
    const f0=q0&&q0.flag,p0=q0&&q0.silver;if(q0){P.quests.splice(P.quests.indexOf(q0),1);runs[0].me=0}
    act('pyohid:gaebong:0');const q1=P.quests.find(q=>q.hired&&q.run===runs[0].id);return{two:h.includes('깃발을 걸고 참여')&&h.includes('암표로 참여'),f0,ok0:p0===s0,f1:q1&&q1.flag,p1:q1&&q1.silver,exp:Math.round(s0*.8)}});
  ok(`참여: 단추 둘 ${r1.two} · 깃발 ${r1.f0} 품삯 그대로 ${r1.ok0} · 암표 ${r1.f1} 품삯 ${r1.p1} (기대 ${r1.exp})`,r1.two&&r1.f0==='flag'&&r1.ok0&&r1.f1==='hid'&&r1.p1===r1.exp);
  // 2. 습격 판정: 깃발은 세력 ×1.5·산적 비킴, 암표는 건너뜀, 따라나서지 않은 행렬은 그대로
  const r2=await p.evaluate(()=>{const R=Math.random;Math.random=()=>0;const cf={name:'甲',q:{hired:1,flag:'flag'}},ch={name:'乙',q:{hired:1,flag:'hid'}},cn={name:'丙',q:null};
    const o={fm:[pyoFacMul(cf),pyoFacMul(ch),pyoFacMul(cn)].join(),flee:[pyoBanditFlee(cf),pyoBanditFlee(ch),pyoBanditFlee(cn)].join(),skip:[pyoHidSkip(cf),pyoHidSkip(ch),pyoHidSkip(cn)].join()};
    Math.random=()=>.99;o.no=[pyoBanditFlee(cf),pyoHidSkip(ch)].join();Math.random=R;return o});
  ok(`세력 배율 ${r2.fm} · 산적 비킴 ${r2.flee} · 건너뜀 ${r2.skip} · 운이 없으면 ${r2.no}`,r2.fm==='1.5,1,1'&&r2.flee==='true,false,false'&&r2.skip==='false,true,false'&&r2.no==='false,false');
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

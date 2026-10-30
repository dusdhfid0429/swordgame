// v208 경지별 기운의 길 (사용자 2026-10-30 "내공수련과 운기의 이펙트를 경지에 따라 다르게, 내공수련은 소주천 대주천 등 경지 특징이 연상되게")
// r_qiflow.js qfDraw: 경지마다 그리는 것이 다르고(소주천 고리, 대주천 사지, 환골탈태 탁기, 삼화취정 꽃, 천인합일 빛잎 …), 운기조식에도 옅게 나온다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:640}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.waitForFunction(()=>sheetOk('act'),null,{timeout:10000});
  // 1. 표: 경지 아홉 단계마다 이름·설명
  const tb=await p.evaluate(()=>({n:QI_FLOW.length,names:QI_FLOW.map(d=>d.n),full:QI_FLOW.every(d=>d.n&&d.d),med:QF_MED.n.length===9&&QF_MED.r.length===9}));
  ok(`QI_FLOW 9단계 ${tb.names.join('·')} · QF_MED ${tb.med}`,tb.n===9&&tb.full&&tb.med&&tb.names[1]==='소주천'&&tb.names[2]==='대주천');
  // 2. 경지마다 그리는 것이 다르다: 그리기 함수 호출을 세어 경지별 서명을 만든다
  const sig=await p.evaluate(()=>{paused=true;NPCF=[];mobs.length=0;P.sect='hwasan';const C={};
    const wrap=n=>{const f=window[n];window[n]=function(...a){C[n]=(C[n]||0)+1;return f.apply(this,a)}};['qfLine','qfMote','qfNode','brkLotus','qfAt'].forEach(wrap);
    const out=[];for(let r=0;r<=8;r++){P.realm=r;QF.imp.length=0;QF.leaf.length=0;trnBusy=null;P.medit=false;P.qiTraining=false;NG.k=0;MED.k=0;
      for(const k in C)C[k]=0;startTrain('neigong');for(let i=0;i<45;i++){time+=.03;trainTick(.03);draw()}
      out.push({r,line:C.qfLine||0,mote:C.qfMote||0,node:C.qfNode||0,lotus:C.brkLotus||0,at:C.qfAt||0,imp:QF.imp.length,leaf:QF.leaf.length,txt:texts.some(t=>t.t===QI_FLOW[r].n)});
      trnBusy=null;P.qiTraining=false;for(let i=0;i<20;i++){time+=.03;draw()}}
    return out});
  const keys=sig.map(s=>[s.line,s.mote,s.node,s.lotus,s.at,s.imp>0,s.leaf>0].join(','));
  ok(`경지별 서명이 모두 다르다 ${keys.join(' | ')}`,new Set(keys).size===9);
  const R=sig;
  ok(`삼류는 막혀 고리 없음·이류 소주천 고리 · 일류 대주천은 사지까지 (선 ${R[1].line}→${R[2].line})`,R[1].mote>0&&R[2].line>R[1].line&&R[2].mote>R[1].mote);
  ok(`환골탈태 탁기 ${R[5].imp} · 삼화취정 꽃 ${R[6].lotus} · 천인합일 빛잎 ${R[8].leaf} (다른 경지엔 없음)`,R[5].imp>0&&R[6].lotus>0&&R[8].leaf>0&&R.every((s,i)=>(i===6||!s.lotus)&&(i===5||!s.imp)&&(i===8||!s.leaf)));
  ok(`내공 수련을 시작하면 머리 위에 경로 이름 ${R.map(s=>s.txt?1:0).join('')}`,R.every(s=>s.txt));
  // 3. 운기조식: 같은 길을 옅게 그리고, 높은 경지일수록 기운 알갱이가 많다
  const md=await p.evaluate(()=>{const r={};for(const rl of[0,8]){P.realm=rl;P.medit=true;MED.k=0;MED.parts.length=0;let n=0;const f=window.qfDraw;window.qfDraw=function(...a){n++;return f.apply(this,a)};
      for(let i=0;i<60;i++){time+=.03;draw()}window.qfDraw=f;r[rl]={parts:MED.parts.length,qf:n};P.medit=false;for(let i=0;i<30;i++){time+=.03;draw()}}return r});
  ok(`운기조식에도 기운 길 (삼류 ${md[0].qf}회, 자연경 ${md[8].qf}회) · 알갱이 삼류 ${md[0].parts} < 자연경 ${md[8].parts}`,md[0].qf>0&&md[8].qf>0&&md[8].parts>md[0].parts);
  // 3b. v209 몸 둘레를 도는 기운도 경지마다 다르다 (사용자 2026-10-30 "몸주변을 회전하는 효과도 경지에 따라 다르게")
  const sw=await p.evaluate(()=>{const o={};for(let r=0;r<=8;r++){P.realm=r;const a=Array.from({length:300},()=>medSpawn());
      o[r]={pos:a.filter(q=>q.w>0).length,neg:a.filter(q=>q.w<0).length,tl:a.some(q=>q.tl),e:[...new Set(a.map(q=>q.e))].length,wh:a.filter(q=>WUHAENG.includes(q.cc)).length,dk:a.filter(q=>q.dk).length,leaf:a.filter(q=>q.leaf).length,hi:Math.min(...a.map(q=>q.h))}}
    P.realm=8;const q=Object.assign(medSpawn(),{});P.realm=1;Object.assign(q,medSpawn());o.clean=!q.leaf&&!q.cc&&!q.dk;return o});
  ok(`이류 한 방향 ${sw[1].neg===0} · 일류 두 띠 반대 ${sw[2].pos>0&&sw[2].neg>0} · 절정 기운 고리 ${sw[3].tl} · 초절정 세 단전 ${sw[4].e} · 화경 오행 ${sw[5].wh} · 생사경 검은 기운 ${sw[7].dk} · 자연경 빛잎 ${sw[8].leaf} 높이 ${sw[8].hi|0} · 되살릴 때 앞 경지 성질 지움 ${sw.clean}`,
    sw[1].neg===0&&sw[2].pos>0&&sw[2].neg>0&&sw[3].tl&&!sw[1].tl&&sw[4].e===3&&sw[5].wh>100&&sw[7].dk>100&&sw[8].leaf>100&&sw[8].hi<-100&&sw[0].wh+sw[0].dk+sw[0].leaf===0&&sw.clean);
  // 4. 마교(마기, 어두운 색)도 오류 없이 그린다 + 장면 사진
  await p.evaluate(()=>{P.sect='cheonma';for(const r of[3,7]){P.realm=r;startTrain('neigong');for(let i=0;i<30;i++){time+=.03;trainTick(.03);draw()}trnBusy=null;P.qiTraining=false}P.sect='hwasan'});
  for(const r of[1,2,3,5,6,8]){await p.evaluate(r=>{P.realm=r;trnBusy={k:'neigong',t:0,dur:1.6};P.qiTraining=true;for(let i=0;i<24;i++){time+=.03;trnBusy.t+=.03;draw()}},r);
    const q=await p.evaluate(()=>{const o=toScreen(P.x,P.y),c=document.querySelector('canvas'),rc=c.getBoundingClientRect(),sx=rc.width/W;return{x:rc.left+o.x*sx,y:rc.top+o.y*sx}});
    await p.screenshot({path:require('path').resolve(__dirname,`shots/qiflow_${r}.png`),clip:{x:Math.max(0,q.x-70),y:Math.max(0,q.y-110),width:140,height:130}})}
  ok(`그리기 오류 없음 ${errs.join(' | ')}`,errs.length===0);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close()})();

// 운기 효율 패시브 (옛 이름 내공 회복): 내공은 운기조식으로만 찬다는 규칙(v85)에 맞게, 패시브·순환 특색은 운기조식 회복량만 늘린다 (2026-10-25 사용자 지적)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 운기 효율 패시브를 대성해도 가만히 있으면 내공이 차지 않는다
  const a=await p.evaluate(()=>{mobs.length=0;P.pas={P_qreg:{p:100}};recalc();P.medit=false;P.run=false;P.qi=5;return{q0:P.qi,pv:pv('qreg'),name:PTYPE.qreg.n,txt:PTYPE.qreg.f(pv('qreg'))}});
  await p.waitForTimeout(1500);
  const q1=await p.evaluate(()=>P.qi);
  ok(`패시브 ${a.name} "${a.txt}" · 운기 안 하면 ${a.q0} → ${q1}`,a.pv>0&&q1<=a.q0&&a.name==='운기 효율'&&/운기조식/.test(a.txt));
  // 2. 운기조식 중에는 패시브만큼 더 빨리 찬다
  const r=await p.evaluate(()=>{P.medit=true;const w=qiRegen();const s=P.pas;P.pas={};const n=qiRegen();P.pas=s;return{w,n,pv:pv('qreg')}});
  await p.waitForTimeout(800);
  const q2=await p.evaluate(()=>{const q=P.qi;P.medit=false;return q});
  ok(`운기 중 회복 ${r.n.toFixed(2)} → 패시브 ${r.w.toFixed(2)}/초 · 내공 ${q1} → ${q2.toFixed(1)}`,q2>q1&&Math.abs(r.w/r.n-1-r.pv)<1e-6&&r.pv>0);
  // 3. 순환 특색도 운기조식으로 적힌다
  const t=await p.evaluate(()=>({sim:SIM_TK.qreg.fmt}));
  ok(`순환 특색 "${t.sim}"`,/운기조식/.test(t.sim));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

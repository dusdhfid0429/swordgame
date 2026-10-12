// 애니메이션 보강: 사망 쓰러짐(corpses), 공격 회복 타이머, 피격 배율, 그리기 오류 없음 (2026-10-12)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 사람 몹과 짐승을 죽이면 시체가 쓰러지며 사라진다
  const r=await p.evaluate(()=>{const e=mkMob('산적',P.x+1.5,P.y),w=mkMob('늑대',P.x-1.5,P.y);mobs.push(e,w);e.hp=0;onKill(e);w.hp=0;onKill(w);return{n:corpses.length,beast:corpses.map(c=>c.beast),dead:corpses.every(c=>c.e.dead)}});
  await p.waitForTimeout(350);
  const r2=await p.evaluate(()=>({n:corpses.length,t:corpses.map(c=>c.t.toFixed(2)),dusted:corpses.every(c=>c.dusted),mobs:mobs.filter(m=>m.kind==='산적'||m.kind==='늑대').length}));
  await p.screenshot({path:shot('anim_corpse')});await p.waitForTimeout(1200);
  const r3=await p.evaluate(()=>corpses.length);
  ok(`시체 ${r.n}개(짐승 ${r.beast.join('/')}, dead ${r.dead}) → 0.35초 뒤 ${r2.n}개 t=${r2.t.join(',')} 먼지 ${r2.dusted} → 1.2초 뒤 ${r3}개`,r.n===2&&r.beast.join()==='false,true'&&r.dead&&r2.n===2&&r2.dusted&&r3===0);
  // 2. 휘두른 뒤 회복 타이머, 강타 피격 배율
  const a=await p.evaluate(()=>{const e=mkMob('산적',P.x+2,P.y);e.hp=5000;e.maxHp=5000;mobs.push(e);e.swing=.05;e.cd=9;return mobs.length});
  await p.waitForTimeout(150);
  const a2=await p.evaluate(()=>{const e=mobs[mobs.length-1];const o={swing:e.swing,rec:e.rec};mobHurt(e,2000,P);o.k1=e.hitK;mobHurt(e,10,P);o.k2=e.hitK;e.hp=5000;return o});
  ok(`휘두름 끝 → 회복 ${a2.rec&&a2.rec.toFixed(2)} (swing ${a2.swing}) · 강타 배율 ${a2.k1} 잔타 ${a2.k2}`,a2.swing===0&&a2.rec>0&&a2.rec<=.22&&a2.k1===1.6&&a2.k2===1);
  // 3. 예비·회복·피격 자세로 그리는 동안 오류가 없다
  await p.evaluate(()=>{const e=mobs[mobs.length-1];e.wind=.4;e.hit=.12;e.aggro=true;const m=mkMob('늑대',P.x-2,P.y+1);m.hp=5000;m.maxHp=5000;m.wind=.4;m.hit=.1;mobs.push(m)});
  await p.waitForTimeout(250);await p.screenshot({path:shot('anim_windup')});
  await p.evaluate(()=>{for(const e of mobs.slice(-2)){e.wind=0;e.swing=.24}});await p.waitForTimeout(120);await p.screenshot({path:shot('anim_swing')});
  await p.waitForTimeout(300);
  ok('예비·타격·회복 그리기 오류 없음',errs.length===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

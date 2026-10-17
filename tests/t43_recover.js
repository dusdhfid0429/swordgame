// 프레임 오류 복구: 좌표가 NaN이 된 것이 있어도 게임이 멈추지 않고, 오류 줄에 난 자리(함수 이름)가 적힌다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 몹과 인물의 좌표를 NaN으로 망가뜨려도 몇 프레임 뒤 게임이 계속 돈다
  const r=await p.evaluate(()=>{const e=mkMob('산적',P.x+2,P.y);e.x=NaN;e.y=NaN;mobs.push(e);P.x=NaN;P.y=NaN;P.path=[{x:NaN,y:NaN}];const t0=time;
    // 세 프레임 동안 그리기에서 오류를 일으킨다 (사용자 보고: Cannot read properties of undefined (reading 'NaN'))
    const h=window.hud;let k=0;window.hud=function(){if(++k<=3)throw new TypeError("Cannot read properties of undefined (reading 'NaN')");return h.apply(this,arguments)};return{t0,n:mobs.length}});
  await p.waitForTimeout(1200);
  const s=await p.evaluate(()=>({t:time,x:P.x,y:P.y,bad:mobs.filter(m=>!isFinite(m.x+m.y)).length,n:mobs.length,errN:loop.errN||0,last:logHist.slice(-6).map(l=>l.t||l).join(' | ')}));
  ok(`NaN 좌표 뒤에도 시간이 흐르고(${(s.t-r.t0).toFixed(1)}초) 인물은 제자리로(${s.x},${s.y}), 망가진 몹은 치워진다(${s.bad}/${s.n}) · 오류 ${s.errN}번`,s.t-r.t0>.5&&isFinite(s.x)&&isFinite(s.y)&&s.bad===0);
  const hasWhere=await p.evaluate(()=>logHist.some(l=>/오류: .*\(\S+\)/.test(l.t||String(l))));
  ok(`오류 줄에 난 자리가 적힌다 (오류 ${s.errN}번, 자리 ${hasWhere})`,s.errN>=3&&hasWhere);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

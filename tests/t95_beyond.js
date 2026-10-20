// v161 현경 너머: 생사경·자연경 문턱과 효과, 생사경 좌화(스스로 윤회), 살아 있는 칸에서 '다음 생 시작' 숨김
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];P.sect='namgung'});
  // 1. 경지 표가 아홉 단계이고 문턱이 오른다
  const r1=await p.evaluate(()=>({n:RANKS.length,top:RANKS.slice(-2),oe:REALM_NEED.oe.slice(-3),ne:REALM_NEED.ne.slice(-3),mu:REALM_NEED.mu.slice(-3),pg:PG_BASE.length,fx:REALM_FX.length,hs:BODY.hs.cut.length}));
  ok(`경지 ${r1.n}단계 (${r1.top}), 문턱 외공 ${r1.oe} 내공 ${r1.ne} 무리 ${r1.mu}`,r1.n===9&&r1.top.join()==='생사경,자연경'&&r1.oe[1]>r1.oe[0]&&r1.oe[2]>r1.oe[1]&&r1.ne[2]>r1.ne[1]&&r1.mu[2]>r1.mu[1]&&r1.pg===9&&r1.fx===9&&r1.hs===9);
  // 2. 현경에서 벽에 닿으면 생사경 폐관이 열린다
  const r2=await p.evaluate(()=>{P.realm=6;realmFxSync();for(const k of['str','end','agi','qi'])P.st[k]=60;P.enl=200;P.qiX=5000;recalc();
    return{wall:atWall(),nx:rk(7),ch:pgChance(),yrs:pgYears(),hob:hobCost()}});
  ok(`현경 벽: ${r2.wall}, 다음 ${r2.nx}, 성공 ${Math.round(r2.ch*100)}%, ${r2.yrs}년, 호법 ${r2.hob}`,r2.wall&&r2.nx==='생사경'&&r2.ch>0&&r2.yrs===3.5&&r2.hob===4800);
  // 3. 생사경: 수명 +10, 한 해에 한 번 죽음을 버틴다
  const r3=await p.evaluate(()=>{const l0=P.life;P.realm=7;realmFxSync();const dl=P.life-l0;
    const R=Math.random;Math.random=()=>.99;const hit=()=>{P.inv=0;P.hp=5;const e=mkMob('산적',P.x+1,P.y);hurtP(99999,e);return{hp:P.hp,alive:playing}};
    const a=hit(),b2=hit();Math.random=R;return{dl,a,b2,name:realmName()}});
  ok(`생사경(${r3.name}) 수명 +${r3.dl}, 첫 치명타 뒤 생명 ${r3.a.hp}, 같은 해 두 번째는 쓰러짐 ${!r3.b2.alive}`,r3.dl===10&&r3.a.alive&&r3.a.hp>1&&!r3.b2.alive);
  // 4. 새 판으로: 자연경 효과 (피해 +15%, 받는 피해 -10%, 운기 두 배)
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1500);
  await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r4=await p.evaluate(()=>{mobs=[];P.sect='namgung';P.realm=7;realmFxSync();const q7=realmQiMul(),l0=P.life;
    const c1={m:1,def:0,e:mkMob('산적',P.x+1,P.y)},h1={dm:100,src:{d:{}}};runHooks('hit',c1);
    P.realm=8;realmFxSync();const c2={m:1,def:0,e:c1.e},h2={dm:100,src:{d:{}}};runHooks('hit',c2);
    return{q:realmQiMul()/q7,life:P.life-l0,m:c2.m/c1.m,fx:fxOf(8).n}});
  ok(`자연경(${r4.fx}): 운기 ×${r4.q}, 수명 +${r4.life}, 피해 ×${r4.m.toFixed(2)}`,r4.q===2&&r4.life===20&&Math.abs(r4.m-1.15)<.001);
  // 5. 좌화: 인물창 경지 카드에서 두 번 눌러 윤회. 강호사에 '좌화'로 남는다
  await p.evaluate(()=>{P.realm=7;openPanel('char')});await p.waitForTimeout(200);
  const btn=await p.$('[data-act="jwa:1"]');ok('좌화 단추가 보인다',!!btn);
  await p.screenshot({path:shot('beyond_char')});
  await p.evaluate(()=>act('jwa:1'));const ask=await p.$('[data-act="jwa2"]');ok('한 번 더 묻는다',!!ask);
  await p.evaluate(()=>act('jwa2'));await p.waitForTimeout(800);
  const r5=await p.evaluate(()=>({playing,cause:G.history[G.history.length-1].cause,lives:G.lives,title:document.body.innerText.includes('좌화하다')}));
  ok(`좌화 → 윤회 화면 ${r5.title}, 강호사 ${r5.cause}, 회차 ${r5.lives}`,!r5.playing&&r5.cause==='좌화'&&r5.title&&r5.lives===1);
  // 6. 현경 아래면 단추가 없다
  await p.tap('[data-s="rebirth"]');await p.waitForTimeout(300);await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r6=await p.evaluate(()=>{mobs=[];P.realm=6;openPanel('char');return{btn:!!document.querySelector('[data-act="jwa:1"]'),why:jwaWhy()}});
  ok(`현경에서는 좌화 단추 없음 (${r6.why})`,!r6.btn&&!!r6.why);
  // 7. 살아 있는 칸의 제목 화면에는 '다음 생 시작'이 없다
  await p.evaluate(()=>{closePanels();toTitle()});await p.waitForTimeout(400);
  const r7=await p.evaluate(()=>({cont:!!document.querySelector('[data-s="cont"]'),nw:!!document.querySelector('[data-s="new"]')}));
  ok(`살아 있는 칸: 이어하기 ${r7.cont}, 다음 생 시작 ${r7.nw}`,r7.cont&&!r7.nw);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close();
})();

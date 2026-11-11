// 병기 이해도 (v248, g_wund.js): 중립형, 경지 상한, 요대 병기는 더 까다롭게, 새 무공 숙련 덤, 윤회 이월
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];paused=true});
  const a=await p.evaluate(()=>{P.realm=2;P.wu={};const cap=wuCap();const m0=wuMul('검'),b0=wuMul('암');P.wu.검=cap;P.wu.암=cap;P.wu.도=999;
    return{cap,m0,b0,m1:wuMul('검'),b1:wuMul('암'),over:wuOf('도'),mo:wuMul('도'),none:wuMul('없음')}});
  ok(`이해도 0: 검 ${a.m0}·암기 ${a.b0}, 상한 ${a.cap}에서 1 (${a.m1}/${a.b1}), 넘쳐도 ${a.over}·${a.mo}`,a.cap===50&&a.m0===.85&&a.b0===.75&&a.m1===1&&a.b1===1&&a.over===50&&a.mo===1&&a.none===1);
  const g=await p.evaluate(()=>{P.wu={};for(let i=0;i<100;i++){wuGain('검');wuGain('단');wuGain('편')}const r={k:P.wu.검,d:P.wu.단,p:P.wu.편,am:P.wu.암||0};
    P.wu={};for(let i=0;i<5000;i++)wuGain('검',1,true);r.dm=P.wu.검;for(let i=0;i<20000;i++)wuGain('검');r.top=P.wu.검;return r});
  ok(`같은 100번: 검 ${g.k.toFixed(1)} > 단도 ${g.d.toFixed(1)} = 절편 ${g.p.toFixed(1)}, 암기는 따로 ${g.am}`,g.k>g.d&&Math.abs(g.d/g.k-.7)<.03&&g.d===g.p&&g.am===0);
  ok(`목인장으로는 ${g.dm}까지, 실전으로는 경지 상한 ${g.top}까지`,g.dm===10&&g.top===50);
  const h=await p.evaluate(()=>{P.wu={검:0};const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&!ARTS[k].base&&!P.arts[k]);P.arts[id]={p:0,f:ARTS[id].forms.map((f,i)=>i===0)};P.cur=id;P.eq.weapon=mkWeapon('검',1,0);recalc();
    const e={x:P.x+1,y:P.y,hp:1e9,maxHp:1e9,def:0,hm:0,d:{},burn:0};const R=Math.random;Math.random=()=>.5;
    const hp=e.hp;hitE(mkX(),e,1);const d0=hp-e.hp;P.wu.검=wuCap();const hp2=e.hp;hitE(mkX(),e,1);const d1=hp2-e.hp;Math.random=R;return{d0,d1,u:P.wu.검}});
  ok(`같은 한 방: 이해도 0에서 ${h.d0}, 가득 차면 ${h.d1} (비 ${(h.d0/h.d1).toFixed(2)})`,Math.abs(h.d0/h.d1-.85)<.03);
  const s=await p.evaluate(()=>{P.wu={검:40,도:0};const ids=Object.keys(ARTS).filter(k=>!ARTS[k].base&&!P.arts[k]);const k1=ids.find(k=>ARTS[k].cls==='검'),k2=ids.find(k=>ARTS[k].cls==='도');
    P.arts[k1]={p:0,f:[true]};P.arts[k2]={p:0,f:[true]};recalc();const r={a:P.arts[k1].p,b:P.arts[k2].p};P.arts[k1].p=3;recalc();r.again=P.arts[k1].p;
    r.mm=wuMast(k1);r.mm0=wuMast(k2);return r});
  ok(`검 이해도 40으로 새 검법은 숙련 ${s.a}에서, 도법은 ${s.b}에서. 덤은 한 번만(${s.again}), 숙련 증가 ×${s.mm}/${s.mm0}`,s.a===10&&s.b===0&&s.again===3&&Math.abs(s.mm-1.08)<1e-9&&s.mm0===1);
  const o=await p.evaluate(()=>{const k=Object.keys(ARTS).find(k=>ARTS[k].cls==='창'&&!ARTS[k].base);P.cur='base';P.arts={base:P.arts.base};P.arts[k]={p:80,f:[true]};delete P.wu;P.realm=3;const u=wuOf('창');recalc();return{u,p:P.arts[k].p}});
  ok(`옛 저장: 창법 숙련 80 → 창 이해도 ${o.u}, 숙련은 그대로 ${o.p}`,o.u===48&&o.p===80);
  const cy=await p.evaluate(()=>{P.wu={검:80,암:9,봉:1};const out=[];for(let d=0;d<5;d++){G.diff=d;runHooks('died',{},'t');out.push(G.wuCarry.검)}G.diff=1;runHooks('died',{},'t');const car={...G.wuCarry};const born=wuBorn();return{out,car,born,left:G.wuCarry}});
  ok(`윤회 이월 검 80 → 난이도별 ${cy.out.join('/')}, 보통 ${JSON.stringify(cy.car)}, 새 생이 받고 비운다`,cy.out.join()==='40,28,20,12,8'&&cy.car.암===3&&!('봉' in cy.car)&&cy.born.검===28&&cy.left===null);
  const u=await p.evaluate(()=>{P.wu={검:10};P.realm=1;openPanel('char');const t=document.getElementById('wucard');return{card:!!t,txt:t?t.textContent.slice(0,60):''}});
  ok(`인물 창 병기 이해도 칸: ${u.txt}`,u.card&&u.txt.includes('검')&&u.txt.includes('10/35'));
  if(errs.length){console.log('ERRORS');errs.slice(0,8).forEach(e=>console.log(' ',e))}
  await b.close();process.exit(0)})();

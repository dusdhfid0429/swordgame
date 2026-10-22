// v170 화경 이후 병기 기운: 검환·어검술·심검·무형검 (g_blade.js, data/blade.json BLADE)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 경지마다: 목표 하나 + 곁의 적 셋, 확률을 0으로 눌러 한 번 친 뒤 발동한 그림과 곁의 적이 받은 피해를 본다
  for(const[r,kind,need]of[[4,null,0],[5,'orb',1],[6,'fly',2],[7,'mind',3],[8,'rain',3]]){
    const s=await p.evaluate(async(r)=>{mobs=[];fx=[];sched=[];P.realm=r;P.bpT=P.mhT=-99;P.hp=P.maxHp;
      const mk=(dx,dy)=>{const e=mkMob('강시',P.x+dx,P.y+dy);e.hp=e.maxHp=99999;e.aggro=1;mobs.push(e);return e};
      const e=mk(1,0),o=[mk(1.6,.5),mk(.5,1.6),mk(-1.5,.3)];
      const R=Math.random;Math.random=()=>0;hitE(mkX('base'),e,1,0,0);fArc(mkX('base'),1.05,1.4,'200,200,200',2.5,.18);Math.random=R;
      await new Promise(z=>setTimeout(z,200));const kinds=fx.filter(f=>f.t==='bt').map(f=>f.k);await new Promise(z=>setTimeout(z,700));
      return{kinds,others:o.filter(q=>q.hp<99999).length,name:bladeName(r)}},r);
    ok(`${s.name||'검강'}: 그림 ${[...new Set(s.kinds)].join(',')||'없음'}, 곁의 적 ${s.others}명이 맞음`,(kind?s.kinds.includes(kind):!s.kinds.length)&&s.others>=need&&(r<5||s.name));
    if(r>=5)await p.screenshot({path:__dirname+'/shots/blade_'+r+'.png'})}
  // 무형검은 확률이 아니라 2.2초 간격
  const cd=await p.evaluate(()=>{mobs=[];fx=[];P.realm=8;P.mhT=time;const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;mobs=[e];hitE(mkX('base'),e,1,0,0);return fx.filter(f=>f.k==='rain').length});
  ok(`무형검 간격 안이면 다시 떨어지지 않는다 (${cd})`,cd===0);
  // 병기마다 이름이 다르고, 인물창 경지 카드에 적힌다
  const nm=await p.evaluate(()=>{const o={};for(const cls of['도','창','권']){const id=Object.keys(ARTS).find(k=>ARTS[k].cls===cls&&!ARTS[k].base);const c0=P.cur,w0=P.eq.weapon;P.cur=id;P.eq.weapon=cls==='권'?null:{...w0,cls};o[cls]=[5,6,7,8].map(bladeName).join('/');P.cur=c0;P.eq.weapon=w0}
    P.realm=6;return{o,s:[5,6,7,8].map(bladeName).join('/'),card:realmCardExtra().includes(bladeName(6))}});
  ok(`이름 도 ${nm.o.도}, 창 ${nm.o.창}, 권 ${nm.o.권}, 철검 ${nm.s}, 카드 ${nm.card}`,nm.o.도.startsWith('도환')&&nm.o.권.includes('격공권')&&nm.card&&nm.s.startsWith('검환'));
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

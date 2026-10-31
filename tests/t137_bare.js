// v214 내공이 바닥났을 때의 맨 공격 (사용자 2026-10-31 "내공이 모두 떨어지면 검기·강기 같은 이펙트가 나가지 않게, 내공이 없을 때 공격에 적용되는 심플한 이펙트를 무기별로, 무기 형태와 사거리에 맞게")
// 내공 0: 무공 색 반달·찌르기·병기 기운·속성 재질이 없고 t:'bare' 궤적 하나와 타격 자국만, 공격 장은 이펙트 없는 act 시트. 내공이 있으면 예전 그대로
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const setCls=async cls=>p.evaluate(cls=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===cls&&!ARTS[k].base);P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.eq.weapon=cls==='권'?null:mkWeapon(cls,1,0);if(cls==='암'){AMGI_FREE=true}},cls);
  // r: 경지, qi: 내공, kick: 권 기본 공격의 발차기 차례
  const strike=(r,qi,kick)=>p.evaluate(async([r,qi,kick])=>{mobs=[];fx=[];sched=[];projs=[];P.realm=r;P.bcd=P.gcd=0;P.bpT=P.mhT=time;P.fx=1;P.fy=0;P.qi=qi;P.hc=kick?0:1;
    const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;e.def=0;mobs=[e];const R=Math.random;Math.random=()=>.01;basicStrike(e);
    for(let i=0;i<40&&projs.length;i++){updateProjs(.03);runHooks('tick',.03)}   // 화살·암기는 날아가 맞을 때까지
    Math.random=R;const glow=fx.filter(f=>f.glow).map(f=>f.t);
    return{glow,bare:fx.filter(f=>f.t==='bare').map(f=>f.k+':'+f.r.toFixed(2)),hit:fx.filter(f=>f.t==='bareHit').map(f=>f.h),dmg:e.hp<99999,sheet:P.ssh,row:P.atkRow}},[r,qi,kick]);
  const W=['검','도','창','봉','권','단','편'];
  for(const cls of W){await setCls(cls);
    const z=await strike(6,0),q=await strike(6,9999);
    ok(`${cls} 내공 0 현경: 빛 이펙트 없음 [${z.glow}] · 맨 궤적 ${z.bare} · 자국 ${z.hit} · 피해 ${z.dmg} · 시트 ${z.sheet}`,z.glow.length===0&&z.bare.length===1&&z.bare[0].startsWith(cls+':')&&z.hit.length===1&&z.dmg&&z.sheet!=='actfx');
    ok(`${cls} 내공 있음: 기운 이펙트 그대로 (${q.glow.length}개, 맨 궤적 ${q.bare.length})`,q.glow.length>0&&q.bare.length===0)}
  await setCls('권');const k=await strike(4,0,true);
  ok(`권 발차기 차례는 각: ${k.bare} (줄 ${k.row})`,k.row==='각'&&k.bare.length===1&&k.bare[0].startsWith('각:'));
  // 사거리: 맨 궤적 반경은 병기 사거리를 따른다
  const rr=await p.evaluate(()=>{const o={};for(const c of['권','검','도','봉','창'])o[c]=CLASS[c].reach;return o});
  const rad={};for(const cls of['권','검','봉','창']){await setCls(cls);rad[cls]=+(await strike(0,0)).bare[0].split(':')[1]}
  ok(`맨 궤적 반경 권 ${rad.권} < 검 ${rad.검} < 봉 ${rad.봉} < 창 ${rad.창} (= 사거리)`,rad.권<rad.검&&rad.검<rad.봉&&rad.봉<rad.창&&Math.abs(rad.창-rr.창)<.01);
  for(const cls of['궁','암']){await setCls(cls);const z=await strike(4,0);
    ok(`${cls} 내공 0: 궤적 없이 맞은 자리 점 하나 (${z.hit}) · 빛 이펙트 없음 [${z.glow}]`,z.bare.length===0&&z.hit.join()==='poke'&&z.glow.length===0)}
  // 그림 (병기마다 한 장)
  await p.evaluate(()=>{const s=document.querySelector('#tbtns');if(s)s.style.display='none'});
  for(const cls of['검','도','창','봉','권']){await setCls(cls);await strike(4,0);await p.waitForTimeout(80);await p.screenshot({path:`${__dirname}/shots/bare_${cls}.png`,clip:{x:95,y:250,width:200,height:200}})}
  await p.evaluate(()=>{mobs=[];fx=[]});
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

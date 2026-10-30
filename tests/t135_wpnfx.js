// v210 병기 동작별 기운 (사용자 2026-10-30 "권각 무공에 검기·검강이 나와 이상하다. 무기 형태를 기본으로, 찌르면 찌르는 모양 휘두르면 휘두르는 모양")
// 휘두르기(검·도·봉)는 반달(arc), 찌르기(창)·주먹(권)은 곧은 기운(thrust). 쓸어 치는 초식(arc)은 어느 병기든 반달
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  // 병기를 쥐여 주고 경지마다 한 번 평타: 그려진 기운의 모양(t·mo)과 병기 그림자 모양(cls)을 본다
  const setCls=async cls=>p.evaluate(cls=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===cls&&!ARTS[k].base);P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.eq.weapon=cls==='권'?null:mkWeapon(cls,1,0)},cls);
  const strike=(r)=>p.evaluate(async r=>{mobs=[];fx=[];sched=[];P.realm=r;P.bcd=P.gcd=0;P.bpT=P.mhT=time;P.fx=1;P.fy=0;
    const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;mobs=[e];const R=Math.random;Math.random=()=>.99;basicStrike(e);Math.random=R;
    return{t:[...new Set(fx.filter(f=>(f.t==='arc'||f.t==='thrust')&&f.mo!=='gust').map(f=>f.t+':'+f.mo))],bt:fx.filter(f=>f.t==='bt').map(f=>f.k+':'+(f.cls||'')),lines:fx.filter(f=>f.t==='line').length,gust:fx.some(f=>f.mo==='gust'),name:r>=2?bladeName(r):''}},r);
  const exp={검:'arc:swing',도:'arc:swing',봉:'arc:swing',창:'thrust:thrust',권:'thrust:punch'};
  for(const cls of['검','도','창','봉','권']){await setCls(cls);
    const rs={};for(const r of[0,2,3,4,6])rs[r]=await strike(r);
    const all=Object.values(rs).every(x=>x.t.length===1&&x.t[0]===exp[cls]);
    ok(`${cls}: 평타·기운 모양 ${[0,2,3,4,6].map(r=>rs[r].t.join('+')).join(' ')} (${rs[2].name}·${rs[3].name}·${rs[4].name})`,all);
    ok(`${cls}: 현경 그림자 ${rs[6].bt.join(',')}`,rs[6].bt.length===2&&rs[6].bt.every(k=>k.endsWith(':'+cls))&&rs[6].bt[0].startsWith(exp[cls].startsWith('arc')?'shadow:':'shadowT:'));
    if(cls==='권')ok(`권 절정은 권풍 바람 고리 (실 ${rs[3].lines}줄)`,rs[3].name==='권풍'&&rs[3].gust&&rs[3].lines===0)}
  // 쓸어 치는 초식은 권이라도 반달
  const sw=await p.evaluate(()=>{fx=[];fArc(mkX(P.cur),1.5,2,'200,200,200',6,.28,true);return fx.filter(f=>f.t==='arc').length});
  ok(`권의 쓸어 치기 초식은 반달 (${sw})`,sw>0);
  // 모양마다 그림 (몇 프레임 지나 한 장씩)
  await p.evaluate(()=>{const s=document.querySelector('#tbtns');if(s)s.style.display='none'});
  for(const cls of['검','창','권']){await setCls(cls);for(const r of[2,3,4]){await strike(r);await p.waitForTimeout(90);await p.screenshot({path:`${__dirname}/shots/wpnfx_${cls}_${r}.png`,clip:{x:95,y:250,width:200,height:200}})}}
  await p.evaluate(()=>{mobs=[];fx=[];P.realm=2});
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

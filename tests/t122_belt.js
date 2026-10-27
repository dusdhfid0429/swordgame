// 요대와 암기 (v186, 사용자 2026-10-26 "요대를 추가하고 암기 종류에 따라 이펙트 형태를 다르게, 수량" → '암기 개수를 소모')
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{
    const o={};o.ammo=Object.keys(AMMO).join(',');o.slot=SLOTN.belt;o.shop=SHOP.smith.filter(x=>AMMO[x[0]]||x[0]==='belt').length;
    // 1. 처음 암기 병기를 들면 요대와 비도 20자루
    const bd0=P.mats.비도||0;P.eq.belt=null;P.beltGift=0;P.eq.weapon=mkWeapon('암',1,0);recalc();o.gift=[P.eq.belt&&P.eq.belt.name,P.eq.belt&&P.eq.belt.am,(P.mats.비도||0)-bd0];
    recalc();o.gift2=(P.mats.비도||0)-bd0;
    const id='사암1';P.arts[id]={p:0,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.fx=1;P.fy=0;
    const X=()=>{const x=mkX(id);x.t=0;return x};
    const cast=(f,offs)=>{mobs=[];projs=[];sched=[];const es=offs.map(([dx,dy])=>{const e=mkMob('산적',P.x+dx,P.y+dy);e.hp=e.maxHp=1e6;e.def=0;mobs.push(e);return e});
      exec(f,es[0],X());for(let i=0;i<40&&sched.length;i++){for(const q of sched)q.t-=.02;const due=sched.filter(q=>q.t<=0);sched=sched.filter(q=>q.t>0);due.forEach(q=>q.f())}return es};
    const five={p:'proj',cnt:5,spread:.8,spd:17,len:5,m:.4};
    // 2. 매화침 3개만 있으면 3발만 매화침, 나머지는 본래 모양
    P.eq.belt.am='매화침';P.mats.매화침=3;cast({...five,pj:'blade'},[]);
    o.mae=projs.map(q=>q.kind+(q.ammo?'*':'')).join(',');o.maeLeft=P.mats.매화침;o.maeSpd=+(Math.hypot(projs[0].vx,projs[0].vy)).toFixed(1);
    o.emptyLog=[...document.querySelectorAll('#log *')].some(e=>/매화침을\(를\) 다 썼습니다/.test(e.textContent))||(typeof logs!=='undefined'&&JSON.stringify(logs).includes('다 썼습니다'));
    // 3. 독사침은 중독, 초록 빛깔
    P.eq.belt.am='독사침';P.mats.독사침=9;const e3=cast({p:'proj',cnt:1,spd:19,len:7,m:.8},[[2,0]])[0];const q3=projs[0];o.dok=[q3.kind,q3.psn,q3.c];
    for(let i=0;i<60&&projs.length;i++)updateProjs(1/60);o.dokHit=e3.psn>0;
    // 4. 회선표는 꿰뚫는다
    P.eq.belt.am='회선표';P.mats.회선표=9;cast({p:'proj',cnt:1,spd:12,len:6,m:.6},[[2,0]]);o.star=[projs[0].kind,projs[0].pierce];
    // 5. 벽력자는 맞은 자리에서 터져 옆 적도 다친다
    P.eq.belt.am='벽력자';P.mats.벽력자=9;const es5=cast({p:'proj',cnt:1,spd:12,len:6,m:.6},[[2,0],[2.4,.6]]);o.pel=projs[0].kind;
    const hs=[],h0=hitE;hitE=(X,e,m)=>hs.push([es5.indexOf(e),+m.toFixed(2)]);for(let i=0;i<60&&projs.length;i++)updateProjs(1/60);hitE=h0;o.boom=hs.map(x=>x.join('×')).join(' ');
    // 6. 기본 공격은 암기를 쓰지 않는다
    const n6=P.mats.벽력자;mobs=[];projs=[];const e6=mkMob('산적',P.x+2,P.y);mobs.push(e6);P.bcd=P.gcd=0;basicStrike(e6);o.basic=[P.mats.벽력자===n6,projs[0]&&projs[0].kind];
    // 7. 요대를 풀면 본래 모양
    const bl=P.eq.belt;P.eq.belt=null;cast({p:'proj',cnt:1,spd:12,len:6,m:.6,pj:'star'},[]);o.noBelt=projs[0].kind+(projs[0].ammo?'*':'');P.eq.belt=bl;
    // 8. 대장간: 요대와 암기 10개 묶음
    P.silver=9999;const bi=SHOP.smith.findIndex(x=>x[0]==='belt'),ai=SHOP.smith.findIndex(x=>x[0]==='벽력자');const nb=P.bag.length,na=P.mats.벽력자;
    buy('smith',bi);buy('smith',ai);o.buy=[P.bag.length-nb,P.bag[P.bag.length-1].slot,P.mats.벽력자-na];
    o.shopTxt=shopList('smith').includes('벽력자 10알')&&shopList('smith').includes('가죽 요대');
    // 9. 행낭 창: 요대 칸과 암기 고르기
    const h=pBag();o.ui=[h.includes('요대'),(h.match(/data-act="amk:/g)||[]).length];act('amk:비도');o.pick=P.eq.belt.am;
    o.desc=itemDesc(P.eq.belt);
    return o});
  ok(`암기 다섯 가지 (${r.ammo}), 장비 칸 ${r.slot}, 대장간 ${r.shop}줄`,r.ammo.split(',').length===5&&r.slot==='요대'&&r.shop===6);
  ok(`암기 병기를 처음 들면 ${r.gift[0]}(${r.gift[1]})와 비도 ${r.gift[2]}자루, 두 번은 안 줌 (${r.gift2})`,r.gift[0]==='가죽 요대'&&r.gift[1]==='비도'&&r.gift[2]===20&&r.gift2===20);
  ok(`매화침 3개면 3발만 매화침 (${r.mae}), 남은 수 ${r.maeLeft}, 빠름 ${r.maeSpd}`,r.mae==='needle*,needle*,needle*,blade,blade'&&r.maeLeft===0&&r.maeSpd>17*1.3);
  ok(`독사침은 초록 비침에 중독 (${r.dok}, 맞음 ${r.dokHit})`,r.dok[0]==='needle'&&r.dok[1]===3&&r.dok[2]==='110,220,90'&&r.dokHit);
  ok(`회선표는 꿰뚫는 표창 (${r.star})`,r.star[0]==='star'&&r.star[1]===true);
  ok(`벽력자는 터져 옆 적도 다침 (${r.pel}, ${r.boom})`,r.pel==='pellet'&&r.boom==='0×0.6 1×0.3');
  ok(`기본 공격은 암기를 쓰지 않음 (${r.basic})`,r.basic[0]&&r.basic[1]==='blade');
  ok(`요대가 없으면 본래 모양 (${r.noBelt})`,r.noBelt==='star');
  ok(`대장간에서 요대·암기 10개 (${r.buy}), 진열 글`,r.buy[0]===1&&r.buy[1]==='belt'&&r.buy[2]===10&&r.shopTxt);
  ok(`행낭 창에 요대 칸과 암기 고르기 ${r.ui[1]}개, 바꾸기 → ${r.pick}`,r.ui[0]&&r.ui[1]===5&&r.pick==='비도');
  ok(`요대 설명: ${r.desc}`,/암기 비도 \d+자루/.test(r.desc));
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

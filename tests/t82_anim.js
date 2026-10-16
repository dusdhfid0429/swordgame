// 애니메이션 클립 데이터 + 소팅 레이어 (v122): 상태→클립은 data/anim.json ANIM이 정하고, 무기 variant가 클립만 바꿔 끼운다. 그리기 목록은 레이어 먼저, 깊이 다음
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 클립 도구: 왕복(pp)·끝에서 멈춤(once)·순환
  const c=await p.evaluate(()=>{const pp=[0,1,2,3,4,5,6,7].map(u=>clipAt(CLIP.idle창,u)),once=[0,5,99].map(u=>clipAt(CLIP.jumpSword,u)),loop=[0,7,8,13].map(u=>clipAt(CLIP.run,u));
    return{pp,once,loop,j2:clipFrames(CLIP.jump2),j2row:A2.j2[0],dodge:clipFrames(CLIP.dodge).length,a2:A2.sd[1]}});
  ok(`왕복 ${c.pp.join(',')} · 멈춤 ${c.once.join(',')} · 순환 ${c.loop.join(',')} · 경공2단 ${c.j2.length}장(첫 장 건너뜀) · 회피 ${c.dodge}장`,
    c.pp.join(',')==='69,70,71,72,73,72,71,70'&&c.once.join(',')==='32,37,40'&&c.loop.join(',')==='41,48,41,46'&&c.j2[0]===c.j2row+1&&c.dodge===c.a2);
  // 2. variant: 창은 idle·run·jumpNb를 바꿔 끼우고 lk 'p', 검은 base 그대로. 시트가 없을 때(idleNb)는 몸통 대기
  const v=await p.evaluate(()=>{const useCls=w=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===w);P.arts[id]=P.arts[id]||{p:0,f:[true,false,false]};P.cur=id;P.eq.weapon=w==='권'?null:mkWeapon(w,1,0);recalc()};
    useCls('창');P.satk=0;P.runT=0;P.sj=0;const idle=heroFrame();P.runT=.2;P.runPh=.1;const run=heroFrame();P.runT=0;
    const spearRun=heroClip('run','창'),swordRun=heroClip('run','검'),nb=CLIP[ANIM.hero.창.idleNb];
    useCls('검');const sw=heroFrame();return{idle,run,spear:spearRun.a,sword:swordRun.a,nbA:nb.a,sw,idleF:CLIP.idle창.f}});
  ok(`창 대기 ${JSON.stringify(v.idle)} 달리기 ${JSON.stringify(v.run)} (run 클립 창 ${v.spear} / 검 ${v.sword}, 시트 없을 때 ${v.nbA}) 검 대기 ${JSON.stringify(v.sw)}`,
    v.idle[3]&&v.idle[2]==='p'&&v.idleF.includes(v.idle[0])&&v.run[1]&&v.run[2]==='p'&&v.run[0]>=41&&v.run[0]<=48&&v.spear==='body'&&v.sword==='hero'&&v.nbA==='body'&&!v.sw[1]&&v.sw[2]===''&&v.sw[0]<=5);
  // 3. 공격 장 배분: 가중치는 데이터 (예비 30% → 첫 장, 끝 15% → 마지막 장)
  const a=await p.evaluate(()=>({w:ANIM.atkWeight,i:[.1,.29,.31,.5,.6,.84,.86,.99].map(u=>atkIdx(u,5))}));
  ok(`공격 장 배분 ${a.w.join('/')} → ${a.i.join(',')}`,a.i.join(',')==='0,0,1,2,3,3,4,4');
  // 4. 소팅 레이어: 시체(BACK)는 더 남쪽(깊이 큼)이어도 개체보다 먼저, 효과(FX)는 더 북쪽이어도 개체 뒤에 그린다
  const L=await p.evaluate(()=>{const order=[];const list=[{L:LY.FX,d:1,f:()=>order.push('fx')},{d:5,f:()=>order.push('npc')},{L:LY.BACK,d:50,f:()=>order.push('corpse')},{L:LY.TOP,d:0,f:()=>order.push('aim')},{d:2,f:()=>order.push('mob')}];
    list.sort((a,b)=>((a.L??LY.ENT)-(b.L??LY.ENT))||(a.d-b.d)).forEach(o=>o.f());
    // 실제 장면: 시체 하나를 주인공 남쪽에 두고 그려도 오류 없음
    corpses.push({x:P.x,y:P.y+2,t:.2,e:{x:P.x,y:P.y+2,d:{pal:'bandit'},fx:1,fy:0}});try{draw()}catch(e){return{order,err:e.message}}corpses.length=0;return{order}});
  ok(`레이어 순서 ${L.order.join('>')}${L.err?' 오류 '+L.err:''}`,L.order.join('>')==='corpse>mob>npc>fx>aim'&&!L.err);
  if(errs.length)console.log('ERRORS',errs);await b.close()})();

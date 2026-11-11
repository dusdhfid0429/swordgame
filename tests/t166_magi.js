// v252 마기 위압 (g_magi.js): 내공 견주기 → 위축·심마, 불가 면역, 불가 아군 완화, 마기 심법이면 적이 움츠러듦
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{mobs=[];allies=[];paused=true;const out={};
    const foe=(realm,el)=>{const e=mkMob(Object.keys(MOBS)[0],P.x+2,P.y);e.realm=realm;e.el=el;e.aggro=true;e.d={...e.d,boss:0,elite:1};e.hp=e.maxHp=99999;mobs.push(e);return e};
    const e=foe(4,'마');const q=magiQi(e);out.q=q;
    const at=k=>{P.maxQi=Math.round(q*k);P.qi=P.maxQi;magiScan();return MAGI_LV};
    out.lv=[at(1.2),at(.8),at(.6),at(.3)];
    out.spd0=(at(1.2),moveSpd());out.spd3=(at(.3),moveSpd());
    const hitM=()=>{const c={from:P,e,X:{bare:1},m:1,hm:0};const hs=HOOKS.hit;let m0=1;magiScan();const s=magiSt();return s?1-s.atk:1};
    at(.3);out.atk3=hitM();
    // 심마 발작
    MAGI_FIT=MAGI.fit.every-.01;MAGI_T=9;const q0=P.qi;runHooks('tick',.05);out.fit=q0-P.qi;out.slow=MAGI_SLOW;MAGI_SLOW=0;
    // 다른 속성 적은 위압 없음
    e.el='화';out.other=at(.3);e.el='마';
    // 불가 아군
    const sid=Object.keys(SECTS).find(k=>simSchoolOf(k)==='불가');const a=mkAlly('sect','스님',P.x+.5,P.y);a.sect=sid;a.hp=a.maxHp=100;allies.push(a);out.monk=at(.3);allies=[];
    // 불가 심법 면역
    const sv=[P.sim,P.sims];const bs=Object.values(SIM).find(x=>x.sect&&x.sc==='불가');out.base=at(.3);P.sims={[bs.id]:1};P.sim=bs.id;out.bul=at(.3);
    // 마기 심법: 면역 + 적이 움츠러듦
    P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';out.ma=at(.3);const w=foe(1,'금');P.maxQi=5000;out.cow=magiCowed(w);out.cowMa=magiCowed(e);
    const c2={src:w,dm:100,raw:100,hm:0,hp0:P.hp};HOOKS.hurt.filter(f=>String(f).includes('magiCowed')).forEach(f=>f(c2));out.cowDm=c2.dm;P.sim=sv[0];P.sims=sv[1];
    out.tag=(at(.8),magiTag());mobs=[];magiScan();out.clear=MAGI_LV;return out});
  ok(`내공 견주기 단계 ${r.lv} (적 내공 ${r.q})`,r.lv.join()==='0,1,2,3');
  ok(`심마 때 이동 ${r.spd3.toFixed(2)} < ${r.spd0.toFixed(2)}, 공격 ×${r.atk3}`,r.spd3<r.spd0*.9&&Math.abs(r.atk3-.78)<.001);
  ok(`심마 발작: 내공 ${r.fit} 잃고 ${r.slow}초 묶임`,r.fit>0&&r.slow>1);
  ok(`마기 아닌 적은 위압 없음 ${r.other}`,r.other===0);
  ok(`불가 아군 곁이면 한 단계 가벼움 ${r.monk}`,r.monk===2);
  ok(`불가 심법 면역 ${r.bul}, 마기 심법 면역 ${r.ma}`,r.bul===0&&r.ma===0&&r.base===3);
  ok(`마기 심법이면 약한 적이 움츠러듦 ${r.cow} (피해 ${r.cowDm}), 마기 적은 아님 ${r.cowMa}`,r.cow===true&&r.cowDm===88&&r.cowMa===false);
  ok(`상태 칸 표시 '${r.tag}', 적이 없으면 풀림 ${r.clear}`,r.tag===' · 위축'&&r.clear===0);
  ok('오류 없음 '+errs.join('|'),errs.length===0);await b.close()})();

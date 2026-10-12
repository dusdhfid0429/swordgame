// 문파별 심법 특색: 운용 중인 심법의 특색만 살아나고, 등급이 오르면 세진다 (2026-10-12 사용자 요청 "문파별 내공에 특색을 넣고 싶어")
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 모든 문파 심법에 특색이 있고, 타고난·잡화점 심법에는 없다. 등급이 오르면 세진다
  const t=await p.evaluate(()=>{const sect=Object.values(SIM).filter(x=>x.sect),none=sect.filter(x=>!x.tr||!x.tr.length).map(x=>x.id);
    const kinds=new Set(sect.flatMap(x=>x.tr));return{n:sect.length,none,kinds:kinds.size,base:(SIM['N_base_정'].tr||[]).length,shop:(SIM['N_shop_사'].tr||[]).length,
      sl1:simTraitVal(SIM.N_shaolin_1,'def'),sl3:simTraitVal(SIM.N_shaolin_3,'def'),cm:SIM.N_cheonma_4.tr.join('+'),cmv:simTraitVal(SIM.N_cheonma_4,'atk'),txt:simTraitTxt(SIM.N_mudang_2)}});
  console.log(JSON.stringify(t));
  ok(`문파 심법 ${t.n}개 모두 특색 있음(없는 것 ${t.none.length}) · 종류 ${t.kinds} · 타고난 ${t.base} 잡화점 ${t.shop} · 소림 금강 중승 ${t.sl1}% → 절정 ${t.sl3}% · 천마 ${t.cm} ${t.cmv}% · 무당 "${t.txt}"`,
    t.n>0&&t.none.length===0&&t.kinds>=14&&t.base===0&&t.shop===0&&t.sl1===6&&Math.abs(t.sl3-10.8)<1e-9&&t.cm==='atk+vamp'&&Math.abs(t.cmv-11.5)<1e-9&&/반탄\(받은 피해의 21%/.test(t.txt));
  // 2. 운용 중에만 산다: 기초 심법이면 0, 소림 절정 심법을 운용하면 받는 피해가 줄고 이동·경공은 청성·곤륜에서만
  const u=await p.evaluate(()=>{P.sims={N_shaolin_3:1,N_cheongseong_2:1,N_kunlun_3:1,N_jegal_3:1};P.sim=null;const o={};o.def0=simTv('def');
    const sp0=moveSpd(),lp0=leapRange(),hm0=hmv();P.sim='N_shaolin_3';o.def=simTv('def');o.sp_same=moveSpd()===sp0;
    P.sim='N_cheongseong_2';o.spd=Math.round((moveSpd()/sp0-1)*1000)/10;P.sim='N_kunlun_3';o.leap=Math.round((leapRange()/lp0-1)*1000)/10;
    P.sim='N_jegal_3';P.maxQi=P.qi=500;const f=art().forms[0];const q0=P.qi;P.fcd=[0,0,0,0,0,0];P.gcd=0;useForm(0,true);o.qcost=q0-P.qi;o.fq=f.qi;o.hm_same=hmv()===hm0;
    P.sim='N_shaolin_3';o.dmgTxt=document.body.innerText;return o});
  ok(`기초 0 → 소림 절정 금강 ${u.def}% (이동 그대로 ${u.sp_same}) · 청성 이동 +${u.spd}% · 곤륜 경공 +${u.leap}% · 제갈 절정 초식 내공 ${u.qcost}/${u.fq}`,
    u.def0===0&&Math.abs(u.def-10.8)<1e-9&&u.sp_same&&Math.abs(u.spd-8.4)<.05&&Math.abs(u.leap-21.6)<.05&&u.qcost===Math.round(u.fq*(1-.216))&&u.hm_same);
  // 3. 피해 받기: 소림 절정이면 같은 공격에 받는 피해가 약 10.8% 적다 (회피 없이 기대값 비교), 무당 반탄은 때린 적이 피해를 입는다
  const h=await p.evaluate(()=>{const mk=()=>({x:P.x+1,y:P.y,hp:1000,maxHp:1000,d:{},hm:0,atk:10,isMob:true});
    const avg=sim=>{P.sim=sim;let s=0,n=0;for(let i=0;i<300;i++){P.hp=P.maxHp=1000;P.inv=0;const h0=P.hp;hurtP(50,mk());if(P.hp<h0){s+=h0-P.hp;n++}}return s/n};
    const base=avg('N_base_정'),sl=avg('N_shaolin_3');P.sim='N_mudang_2';P.sims.N_mudang_2=1;const m=mk();let hit=0;for(let i=0;i<40;i++){P.hp=P.maxHp=1000;P.inv=0;hurtP(50,m);if(P.hp<1000)hit++}
    return{base,sl,ratio:sl/base,ref:1000-m.hp,hit}});
  ok(`기초 평균 ${h.base.toFixed(1)} → 소림 ${h.sl.toFixed(1)} (비율 ${h.ratio.toFixed(3)}) · 무당 반탄: ${h.hit}번 맞고 적이 ${h.ref} 피해`,
    Math.abs(h.ratio-.892)<.03&&h.hit>0&&h.ref>=h.hit*5);
  // 4. 수련창·문파창·인물창에 특색이 보인다
  const v=await p.evaluate(()=>{P.sim='N_shaolin_3';closePanels();openTrain();const tr=TRN.innerText;closePanels();sectView='mudang';const h=allianceDlg('jeong');
    return{train:tr.includes('특색')&&tr.includes('금강'),sect:h.includes('반탄')&&h.includes('되돌림'),log:simTraits(simCur()).length===1}});
  ok(`수련창 특색 ${v.train} · 문파창 무당 반탄 ${v.sect}`,v.train&&v.sect&&v.log);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

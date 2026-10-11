// 맹 총단(정의맹 형주·사천맹 악양)·맹 직위·문파 입지·이어하기 시 가장 가까운 성도 (2026-10-11 사용자 요청)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 총단 맵 둘: 성도(형주·악양) 북쪽 포털로 들어가고, 전각 안에 맹주·장로 셋·총관·당주 넷이 있다
  const r=await p.evaluate(()=>['maeng_jeong','maeng_sacheon'].map(id=>{const R=REGIONS[id];const ids=npcsOf(id).map(n=>n.id);
    return {id,name:R.name,via:R.lmVia,portal:!!REGIONS[R.lmVia].gates.find(g=>g.to===id&&g.portal),halls:(R.halls||[]).length,hq:R.hq,
      npcs:['mleader','melder0','melder1','melder2','msteward','mdang0','mdang1','mdang2','mdang3'].every(k=>ids.includes(k))}}));
  ok(`총단 맵: ${r.map(x=>`${x.name}←${REGIONS_NAME(x.via)}`).join(', ')}`,r.length===2&&r[0].via==='lm_hubei_4'&&r[1].via==='lm_hunan_0'&&r.every(x=>x.portal&&x.halls===7&&x.npcs&&x.hq==null));
  function REGIONS_NAME(v){return v}
  // 2. 가장 가까운 성도
  const nc=await p.evaluate(()=>({kunlun:nearestCapital('hq_kunlun'),gae:nearestCapital('gaebong'),shaolin:nearestCapital('hq_shaolin'),pv:nearestCapital('pv_sichuan@0,0'),mj:nearestCapital('maeng_jeong')}));
  ok(`가장 가까운 성도: 곤륜→${nc.kunlun} 개봉→${nc.gae} 소림→${nc.shaolin} 사천 들판→${nc.pv} 정의맹 총단→${nc.mj}`,nc.kunlun==='lm_qinghai_2'&&nc.gae==='gaebong'&&nc.shaolin==='gaebong'&&nc.pv==='lm_sichuan_0'&&nc.mj==='lm_hubei_4');
  // 3. 역참으로 총단에 가서 총관에게 입맹·임무, 보고하면 맹 공적, 직위가 오르고 당에 들고 맹주의 하사를 받는다
  await p.evaluate(()=>{P.silver=1000;P.fame=50;postGo('maeng_jeong')});await p.waitForTimeout(1500);
  const m=await p.evaluate(()=>{const a={reg:REG,zone:REGION().zone(P.x,P.y)};
    const st=npcsOf('maeng_jeong').find(n=>n.id==='msteward');openPanel('npc',st);a.btns=[...document.querySelectorAll('[data-act]')].map(b=>b.dataset.act).filter(x=>/^m/.test(x));
    act('mjoin:jeong');a.maeng=P.maeng;act('mtake:jeong:0');const q=P.quests[0];a.q=q&&q.n;q.cnt=q.need;q.done=1;act('qdone:0');a.mpt=P.mpt.jeong;a.r0=maengRankName('jeong');
    P.mpt.jeong=300;a.r1=maengRankName('jeong');act('mdang:jeong:1');a.dang=P.mdang&&P.mdang.k;a.pae=P.bag.some(i=>/당패/.test(i.name));
    P.mpt.jeong=1300;a.r2=maengRankName('jeong');const s0=P.silver;act('mgift:jeong');a.gift=P.silver-s0;
    openPanel('char');a.char=/정의맹 장로/.test(document.body.innerText);a.blk=maengJoinBlock('sacheon');return a});
  ok(`총단 도착(${m.reg} · ${m.zone}) · 총관 단추 ${m.btns.join(',')}`,m.reg==='maeng_jeong'&&m.btns.includes('mjoin:jeong')&&m.btns.includes('mtake:jeong:0'));
  ok(`입맹 ${m.maeng} · 임무 ${m.q} 보고 → 맹 공적 ${m.mpt} ${m.r0} → 300이면 ${m.r1}(당 ${m.dang}, 당패 ${m.pae}) → 1300이면 ${m.r2}, 하사 은자 ${m.gift}, 인물창 ${m.char}, 사천맹은 "${m.blk}"`,
    m.maeng==='jeong'&&m.mpt===35&&m.r0==='맹원'&&m.r1==='당주'&&m.dang===1&&m.pae&&m.r2==='장로'&&m.gift===300&&m.char&&!!m.blk);
  // 4. 문파 제자: 문파 임무 보고가 문파 입지를 올리고, 서열 1위 문파는 공적 보정 1.15
  const s=await p.evaluate(()=>{act('mleave');P.sect='hwasan';P.mtot={hwasan:0};const b=sectStanding('jeong',SECTS.hwasan);sectGainStanding('hwasan',100);
    return {maeng:P.maeng,of:maengOf(),before:b,after:sectStanding('jeong',SECTS.hwasan),seat:seatOf('hwasan'),mul:maengSeatMul('hwasan')}});
  ok(`맹 탈퇴 뒤 화산파 제자: 맹 ${s.of}, 입지 ${s.before}→${s.after}, 서열 ${s.seat+1}위 보정 ${s.mul}`,s.maeng==null&&s.of==='jeong'&&s.after===s.before+100&&s.seat===0&&s.mul===1.15);
  // 5. 이어하기: 총단에서 저장했으면 가장 가까운 성도(형주)에서 시작
  const c=await p.evaluate(()=>{saveGame(true);applySave(loadGame());startPlay(false);return {reg:REG,log:logHist.slice(-1).map(l=>l.t||l)[0]}});
  ok(`이어하기 시작 지역 ${c.reg} · ${c.log}`,c.reg==='lm_hubei_4'&&/형주/.test(c.log));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

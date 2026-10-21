// 객잔과 정보 단체 (v158, 사용자 2026-10-20): 개봉 객잔에 들어가고, 손님 말풍선, 개방·하오문·천리당·동창 창구, 직위별 접근, 무료·유료
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 1. 개봉 객잔 문으로 들어가면 손님과 개방·하오문 창구가 있다. 성도 객잔에도, 마교 객잔엔 천리당, 성도 관아엔 동창
  const r1=await p.evaluate(()=>{const g=REGIONS.gaebong.gates.find(g=>g.to===hallId('gaebong',0));travel(g);return{g:!!g,inns:INNS.length}});
  await p.waitForTimeout(700);
  const r2=await p.evaluate(()=>{const ns=REGION().npcs;const mg=INNS.find(id=>/마교/.test(REGIONS[id].name));
    const gw=Object.values(REGIONS).filter(R=>R.hall&&R.name==='관아').some(R=>R.npcs.some(n=>n.intel==='dongchang'));
    return{reg:REG,name:REGION().name,pat:ns.filter(n=>n.patron).length,org:ns.filter(n=>n.intel).map(n=>n.intel).sort().join(','),mg:mg&&REGIONS[mg].npcs.some(n=>n.intel==='magyo'),gw}});
  ok(`개봉 객잔 입구 ${r1.g} → ${r2.name}: 손님 ${r2.pat} · 창구 ${r2.org} · 객잔 ${r1.inns}곳 · 마교 객잔 천리당 ${r2.mg} · 관아 동창 ${r2.gw}`,r1.g&&r2.reg==='in_gaebong_0'&&r2.pat===4&&r2.org==='gaebang,haomun'&&r1.inns>10&&r2.mg&&r2.gw);
  // 2. 손님들이 돌아가며 말풍선으로 이야기한다 (앞서 흘러간 시간에 뜬 말풍선은 비우고, 기록은 이 동안의 log 호출로 센다)
  const r3=await p.evaluate(()=>{for(const c of G.gyc.list)c.rumor=50;gycBub.length=0;let nl=0;const l0=log;log=(t,c)=>{if(String(t).startsWith('[객잔]'))nl++;l0(t,c)};innT=0;for(let i=0;i<4;i++){innT=0;update(.05)}log=l0;return{n:gycBub.length,t:gycBub.map(b=>b.txt),log:nl}});
  ok(`손님 말풍선 ${r3.n}개 (${r3.t[0]}) · 기록 ${r3.log}`,r3.n>=2&&r3.log>=2);
  await p.waitForTimeout(200);await p.screenshot({path:shot('intel_inn')});
  // 3. 무소속: 하급만, 값을 낸다(하오문은 다른 편이라 1.5배). 사서 들으면 기연 소문이 쌓인다 (2번에서 손님이 소문을 흘렸으면 이미 들었으니 heard를 비운다)
  const r4=await p.evaluate(()=>{P.silver=1000;for(const c of G.gyc.list)c.heard=0;const gb=REGION().npcs.find(n=>n.intel==='gaebang'),hm=REGION().npcs.find(n=>n.intel==='haomun');openPanel('npc',gb);
    const acc=intelAccess(),c1=intelCost('gaebang',1),c2=intelCost('haomun',1),txt=$('wbody').textContent;const s0=P.silver;sectAct('intel','gaebang','gyc0a');sectAct('intel','gaebang','gyc0b');
    return{acc,c1,c2,paid:s0-P.silver,heard:G.gyc.list[0].heard,lock:txt.includes('직위 부족'),intel:P.intel.length}});
  ok(`무소속 접근 ${r4.acc} · 개방 하급 ${r4.c1}, 하오문 ${r4.c2} · 하급 사고 중급은 막힘(냄 ${r4.paid}) · 동굴 1 들은 단계 ${r4.heard} · 잠김 표시 ${r4.lock}`,r4.acc===1&&r4.c1===20&&r4.c2===30&&r4.paid===20&&r4.heard===0&&r4.lock&&r4.intel===1);
  // 4. 개방 제자: 무료, 직위가 오르면 높은 등급. 극비는 입구를 지도에 표시한다
  const r5=await p.evaluate(()=>{P.sect='gaebang';P.mtot.gaebang=0;const a0=intelAccess(),c0=intelCost('gaebang',3),ch=intelCost('haomun',1);P.mtot.gaebang=99999;P.realm=9;const a4=intelAccess();
    const s0=P.silver;sectAct('intel','gaebang','gyc1x');const c=G.gyc.list[1];return{a0,a4,c0,ch,paid:s0-P.silver,mark:c.mark,seen:gycSeen({gyc:1}),card:(openPanel('quest'),$('wbody').textContent.includes('들은 정보'))}});
  ok(`개방 제자 접근 ${r5.a0}→${r5.a4} · 개방 무료 ${r5.c0===0}, 하오문 ${r5.ch} · 극비 공짜(${r5.paid}) 지도 표시 ${r5.mark} · 임무창 ${r5.card}`,r5.a0===1&&r5.a4===4&&r5.c0===0&&r5.ch===30&&r5.paid===0&&r5.mark===1&&r5.seen&&r5.card);
  // 5. 천리당은 교도만, 동창은 금군이면 무료·아니면 두 배
  const r6=await p.evaluate(()=>{const mg=REGIONS[INNS.find(id=>/마교/.test(REGIONS[id].name))].npcs.find(n=>n.intel==='magyo');const no=intelDlg(mg).includes('꺼져라');P.sect='cheonma';const yes=intelCost('magyo',2);
    P.sect=null;const dc=intelCost('dongchang',1);P.sect='geumgun';const df=intelCost('dongchang',1);return{no,yes,dc,df}});
  ok(`천리당 남에게 거절 ${r6.no} · 교도 무료 ${r6.yes===0} · 동창 무소속 ${r6.dc} / 금군 ${r6.df}`,r6.no&&r6.yes===0&&r6.dc===60&&r6.df===0);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

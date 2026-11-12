// v255 구결 (동훈님 2026-11-12, 적용 계획 PR1): 다른 문파 무공은 구결이 없으면 숙련이 70에서 멈춘다. 장문인에게 청하기·최후의 비전·문파 제자의 구결·옛 저장
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 준비: 정파 문파 둘 (내 문파 mine, 남의 문파 other), 각 문파의 무공 하나
  await p.evaluate(()=>{const ss=Object.values(SECTS).filter(s=>sideOk(s.al)&&sectPop(s.id)>0&&Object.values(ARTS).some(a=>a.sect===s.id&&!a.gy&&!kyulOpen(a.id)));
    window.T={mine:ss[0].id,other:ss[1].id};const ok2=a=>!a.gy&&!kyulOpen(a.id);T.ma=Object.values(ARTS).find(a=>a.sect===T.mine&&ok2(a)).id;T.oa=Object.values(ARTS).find(a=>a.sect===T.other&&ok2(a)).id;
    P.sect=null;P.kyul={};P.kyulW={};P.wis=10;for(const id of[T.ma,T.oa])P.arts[id]={p:0,f:ARTS[id].forms.map(()=>true)}});
  // 1. 누가 구결이 필요한가
  const r1=await p.evaluate(()=>({cap:KY.cap,base:kyulNeed('base'),basic:kyulNeed('정검0'),other:kyulNeed(T.oa),gy:kyulNeed(Object.keys(ARTS).find(k=>ARTS[k].gy)),
    mine:(P.sect=T.mine,kyulNeed(T.ma)),otherAsMember:kyulNeed(T.oa)}));
  ok(`구결 필요: 상한 ${r1.cap} · 기초 ${r1.base} · 공용 ${r1.basic} · 남의 문파 ${r1.other} · 기연 ${r1.gy} · 내 문파 ${r1.mine} · 제자일 때 남의 문파 ${r1.otherAsMember}`,
    r1.cap===70&&!r1.base&&!r1.basic&&r1.other&&!r1.gy&&!r1.mine&&r1.otherAsMember);
  // 2. 숙련이 70에서 멈추고 한 번만 알린다. 내 문파 무공은 넘는다
  const r2=await p.evaluate(()=>{P.sect=T.mine;const logs=[];const l0=log;log=(t,c)=>{logs.push(t);l0(t,c)};
    for(let i=0;i<4000;i++){gainMast(T.oa,5);gainMast(T.ma,5)}log=l0;
    return{o:A(T.oa).p,m:A(T.ma).p,warn:logs.filter(t=>t.includes('구결이 없다')).length,mk:!!P.kyul[T.ma]}});
  ok(`숙련: 남의 문파 ${r2.o.toFixed(1)} · 내 문파 ${r2.m.toFixed(1)} · 알림 ${r2.warn}번 · 내 문파 구결 적힘 ${r2.mk}`,r2.o===70&&r2.m===100&&r2.warn===1&&r2.mk);
  // 3. 세월 넘기기·수련기처럼 바로 더하는 곳: 넘기지 않고, 넘친 값은 깎지 않는다
  const r3=await p.evaluate(()=>({a:kyulAdd(T.oa,65,20),b:kyulAdd(T.oa,80,20),c:kyulAdd(T.ma,90,20)}));
  ok(`바로 더하기: 65+20→${r3.a} · 80(옛 값)+20→${r3.b} · 내 문파 90+20→${r3.c} (극성 100)`,r3.a===70&&r3.b===80&&r3.c===100);
  // 4. 문파를 떠나도 제자 때 적힌 구결은 남는다
  const r4=await p.evaluate(()=>{P.sect=null;return{need:kyulNeed(T.ma),tag:kyulTag(T.oa).includes('구결 없음'),tagMine:kyulTag(T.ma)}});
  ok(`떠난 뒤 옛 문파 무공 구결 필요 ${r4.need} · 무공 창 꼬리표 '구결 없음' ${r4.tag} · 옛 문파 꼬리표 '${r4.tagMine}'`,!r4.need&&r4.tag&&r4.tagMine==='');
  // 5. 장문인에게 청하기: 우호도·은자가 모자라면 막히고, 갖추면 받는다
  const r5=await p.evaluate(()=>{const n={hq:T.other,n:'장문인'};P.silver=10000;repD().sect[T.other]=-999;
    const h1=hqDlg(n),why1=kyulAskWhy(T.other,T.oa);repD().sect[T.other]=999;const why2=kyulAskWhy(T.other,T.oa),h2=hqDlg(n);
    const s0=P.silver;act(`kyul:${T.other}:${T.oa}`);return{card1:h1.includes('구결을 청한다'),why1,why2,card2:h2.includes('구결을 청한다'),got:!!P.kyul[T.oa],paid:s0-P.silver,cost:kyulCost(T.oa)}});
  ok(`장문인: 카드 ${r5.card1} 막힘 '${r5.why1}' → 우호면 '${r5.why2}' · 받음 ${r5.got} 은자 -${r5.paid} (값 ${r5.cost})`,r5.card1&&/우호/.test(r5.why1)&&r5.why2===''&&r5.card2&&r5.got&&r5.paid===r5.cost);
  // 6. 이제 극성까지 오른다
  const r6=await p.evaluate(()=>{for(let i=0;i<4000;i++)gainMast(T.oa,5);return A(T.oa).p});
  ok(`구결을 받은 뒤 숙련 ${r6.toFixed(1)}`,r6===100);
  // 7. 최후의 비전을 펼치면 그 문파의 구결을 모두 얻는다
  const r7=await p.evaluate(()=>{const s=Object.values(SECTS).find(s=>s.id!==T.mine&&s.id!==T.other&&libArts(s.id,1).length);if(!s)return{none:1};
    const L=libArts(s.id,1);for(const id of L)delete P.kyul[id];const it=libBox(s.id,1);giveItem(it);P.vit=99999;libLearn(it.id,L[0]);
    return{sect:s.n,need:L.filter(id=>kyulNeed(id)).length,all:Object.values(ARTS).filter(a=>a.sect===s.id).every(a=>P.kyul[a.id])}});
  ok(`최후의 비전(${r7.sect}): 남은 구결 필요 ${r7.need} · 그 문파 무공 모두 ${r7.all}`,!r7.none&&r7.need===0&&r7.all);
  // 8. 옛 저장: 이미 70을 넘긴 남의 문파 무공은 구결이 있는 것으로 (깎지 않는다)
  const r8=await p.evaluate(()=>{const id=Object.values(ARTS).find(a=>a.sect&&a.sect!==T.mine&&a.sect!==T.other&&!a.gy&&!kyulOpen(a.id)&&!P.kyul[a.id]).id;P.sect=null;P.arts[id]={p:82,f:ARTS[id].forms.map(()=>true)};
    const low=Object.values(ARTS).find(a=>a.sect&&a.sect!==T.mine&&a.sect!==T.other&&a.id!==id&&!a.gy&&!kyulOpen(a.id)&&!P.kyul[a.id]).id;P.arts[low]={p:40,f:[true]};
    runHooks('afterLoad',{});return{hi:!!P.kyul[id],p:A(id).p,low:!!P.kyul[low]}});
  ok(`옛 저장: 82짜리 구결 ${r8.hi} 숙련 ${r8.p} · 40짜리 구결 ${r8.low}`,r8.hi&&r8.p===82&&!r8.low);
  // 9. 저장했다 불러와도 남는다
  const r9=await p.evaluate(()=>{saveGame(true);const d=loadGame();return Object.keys(d.P.kyul||{}).length===Object.keys(P.kyul).length});
  ok(`저장·불러오기 ${r9}`,r9);
  // 10. 참오 '숙련': 구결 없이 70에서 멈춘 무공에는 고를 수 없다 (책만 사라지고 숙련 +0 이던 것)
  const r10=await p.evaluate(()=>{const id=Object.values(ARTS).find(a=>a.sect&&a.sect!==P.sect&&!a.gy&&!kyulOpen(a.id)&&!P.kyul[a.id]).id;P.arts[id]={p:70,f:ARTS[id].forms.map(()=>true)};P.cur=id;
    const bk=Object.values(ARTS).find(a=>(a.grade||0)>=CHM.minG.ms&&!a.gy);const it={id:'chk',slot:'book',art:bk.id,form:0};const o=chOpts(it).find(q=>q.k==='ms');const why=o&&o.why;P.cur='base';return why||''});
  ok(`참오 숙련 막음: '${r10}'`,/구결/.test(r10));
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

// v256 전생의 흔적 (동훈님 2026-11-12, 적용 계획 PR2): 죽을 때 G.past, 다음 생에서 요결·전생 제자(대화)·은원, 흔적 찾기(정보 단체·무덤), 선출발 상한·한 생만
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 첫 생: 문파에 들어 무공을 극성까지, 저술, 문도 지도, 은원 (벤 문파·구한 문파)
  const r1=await p.evaluate(()=>{const ss=Object.values(SECTS).filter(s=>sideOk(s.al)&&sectPop(s.id)>0);const s=ss[0],foe=ss[1],fr=ss[2];
    const id=Object.values(ARTS).find(a=>a.sect===s.id&&!a.gy&&!kyulOpen(a.id)).id;window.T={sid:s.id,id,foe:foe.id,fr:fr.id};
    P.sect=s.id;P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};P.cur=id;(P.sjsMine=[]).push([s.id,id]);
    G.hugi=G.hugi||[];const h={id:'tpupil',n:'청운자',sid:s.id,fac:'정',rk:1,w:0,age:20,y:0};G.hugi.push(h);h.tch={l:P.lifeNo,n:P.name};T.hid=h.id;
    P.ew=[{k:'kill',n:'정예',sect:foe.id,y:20},{k:'save',n:'표두',sect:fr.id,y:21}];
    const rec=pastRecord();return{arts:rec.arts.map(x=>x.id+':'+x.p).join(),yg:rec.yg.length,tch:rec.tch.join(),foe:rec.foe.join(),fr:rec.fr.join()}});
  ok(`남기는 것: 무공 ${r1.arts} · 요결 ${r1.yg} · 제자 ${r1.tch} · 원한 ${r1.foe} · 은혜 ${r1.fr}`,/:100/.test(r1.arts)&&r1.yg===1&&r1.tch==='tpupil'&&!!r1.foe&&!!r1.fr);
  // 2. 죽고 다시 태어난다 (자식 없이)
  await p.evaluate(()=>{P.children=[];P.spouse=null;die('test')});await p.waitForSelector('[data-s="rebirth"]');
  const r2=await p.evaluate(()=>({life:G.past&&G.past.life,card:document.body.innerHTML.includes('다음 생에 남는 흔적')}));
  ok(`G.past 생 ${r2.life} · 윤회 화면 카드 ${r2.card}`,r2.life===1&&r2.card);
  await p.click('[data-s="rebirth"]');await p.waitForTimeout(300);
  const st=await p.$('[data-s="start"]');if(st)await st.click();await p.waitForFunction(()=>playing);await p.waitForTimeout(500);
  // 3. 은원: 첫 맵에서 원한 문파는 낮게, 은혜 문파는 높게 시작
  const r3=await p.evaluate(()=>(openPanel('char'),closePanels(),{on:pastOn(),life:P.lifeNo,foe:repSect(T.foe),fr:repSect(T.fr),once:P.pastRep}));
  ok(`새 생 ${r3.life} · 흔적 켜짐 ${r3.on} · 원한 문파 ${r3.foe} · 은혜 문파 ${r3.fr} · 한 번만 ${r3.once}`,r3.on&&r3.life===2&&r3.foe<r3.fr&&r3.once===1);
  // 4. 흔적은 처음엔 보이지 않고, 정보 단체에서 사면 드러난다
  const r4=await p.evaluate(()=>{const n={hq:T.sid,n:'장문인'};const h0=hqDlg(n).includes('전생의 흔적');const it=pastIntel()[0];P.silver=9999;it.fn();
    return{h0,intel:!!it&&it.g===2,known:Object.keys(P.pk).length,h1:hqDlg(n).includes('전생의 흔적')}});
  ok(`흔적: 처음 카드 ${r4.h0} · 정보 단체 중급 ${r4.intel} · 알게 된 흔적 ${r4.known} · 카드 ${r4.h1}`,!r4.h0&&r4.intel&&r4.known===2&&r4.h1);
  // 5. 요결: 구결 + 숙련 선출발(전생 100 × 보통 0.35 = 35 → 최대 25), 첫 초식, 두 번은 못 읽는다
  const r5=await p.evaluate(()=>{P.sect=null;const k=`yg:${T.sid}:${T.id}`;act(`ygread:${k.replace(/:/g,'~')}`);const s=A(T.id);const p1=s&&s.p;act(`ygread:${k.replace(/:/g,'~')}`);
    return{p:p1,kyul:!!P.kyul[T.id],need:kyulNeed(T.id),f0:s&&s.f[0],again:s&&s.p,why:ygWhy(pastTraces().find(t=>t.k===k))}});
  ok(`요결: 숙련 ${r5.p} · 구결 ${r5.kyul}(필요 ${r5.need}) · 첫 초식 ${r5.f0} · 두 번째 '${r5.why}' 숙련 그대로 ${r5.again}`,r5.p===25&&r5.kyul&&!r5.need&&r5.f0&&r5.why==='이미 읽었다'&&r5.again===25);
  // 6. 전생의 제자: 옛 무공을 들지 않으면 막히고, 들고 펼치면 알아본다 (구결·명성·벗). 이야기를 물으면 요결 자리를 일러 준다
  const r6=await p.evaluate(()=>{const h=hugiById(T.hid);delete P.kyul[T.id];P.cur='base';const w0=pupilWhy(h);
    P.cur=T.id;P.eq.weapon=mkWeapon(ARTS[T.id].cls,1,0);const w1=pupilWhy(h);const f0=P.fame;act(`pupil:${h.id}:show`);
    const logs=[];const l0=log;log=(t,c)=>{logs.push(t);l0(t,c)};act(`pupil:${h.id}:ask`);log=l0;
    return{w0,w1,met:!!P.pk['met:'+h.id],kyul:!!P.kyul[T.id],fame:P.fame-f0,v:P.hgr&&P.hgr[h.id]?P.hgr[h.id].v:null,ask:logs.join().includes('요결')}});
  ok(`제자: 무공 없이 '${r6.w0}' · 들고 '${r6.w1}' · 알아봄 ${r6.met} · 구결 ${r6.kyul} · 명성 +${r6.fame} · 벗 ${r6.v} · 이야기에 요결 ${r6.ask}`,/전생의 무공/.test(r6.w0)&&r6.w1===''&&r6.met&&r6.kyul&&r6.fame===20&&r6.v>=60&&r6.ask);
  // 7. 다음 생(셋째)에는 둘째 생의 흔적만 남는다: 첫 생 요결은 없다 (눈덩이 방지)
  const r7=await p.evaluate(()=>{P.sjsMine=[];P.ew=[];const rec=pastRecord();return{yg:rec.yg.length,life:rec.life}});
  ok(`셋째 생에 남을 것: 생 ${r7.life} · 요결 ${r7.yg} (첫 생 요결은 이어지지 않는다)`,r7.life===2&&r7.yg===0);
  // 8. 난이도 비율: 지옥이면 100 × 0.1 = 10
  const r8=await p.evaluate(()=>{const d=G.diff;G.diff=4;const v=ygHead(100);G.diff=d;return v});
  ok(`지옥 난이도 선출발 ${r8}`,r8===10);
  // 9. 저장·불러오기
  const r9=await p.evaluate(()=>{saveGame(true);const d=loadGame();return !!(d.G.past&&d.G.past.life===1&&d.P.pk&&d.P.pk['met:'+T.hid])});
  ok(`저장·불러오기 ${r9}`,r9);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

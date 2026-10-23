// 문파원 동원: 직위가 오르면 문파원을 부른다. 직위별 수·고수, 공적, 해마다 한 번, 쓰러지면 인원 감소, 기한·하산 때 돌아감, 저장
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const o={};GD.RANK_CAP.plus=9;
    o.none=mobilWhy().includes('문파에');
    P.sect='mudang';P.mtot={mudang:0};P.merit.mudang=1000;
    o.r0=!mobilPlan()&&!mobilize()&&allies.length===0;
    o.panel=sectDetail(SECTS.mudang).includes('문파원 동원');
    P.mtot.mudang=RANK_PTS[1];const p1=mobilPlan();o.r1=p1.n===1&&p1.e===0;
    P.mtot.mudang=RANK_PTS[3];const p3=mobilPlan();o.r3=p3.n===3&&p3.e===1;
    G.seal=G.seal||{};G.seal.mudang={y:0};o.seal=mobilWhy().includes('봉문');delete G.seal.mudang;
    const m0=P.merit.mudang;o.go=mobilize();const out=mobilOut();
    o.cnt=out.length===3&&out.filter(a=>a.elite).length===1;o.cost=m0-P.merit.mudang===p3.cost;
    const el=out.find(a=>a.elite),pl=out.find(a=>!a.elite);o.strong=el.maxHp>pl.maxHp&&el.realm===2&&pl.realm===1&&!!PAL[el.pal]&&el.name.startsWith(rankName('mudang',2));
    o.once=!mobilize()&&mobilOut().length===3;
    o.html=sectDetail(SECTS.mudang).includes('돌려보내기');
    // 저장·불러오기
    saveGame(true);const d=loadGame();allies=[];applySave(d);const l2=mobilOut();o.save=l2.length===3&&l2.some(a=>a.elite&&a.pal===el.pal&&a.d.pal===el.pal)&&l2.every(a=>a.left>0);
    // 쓰러지면 인원 감소
    const pop0=sectPop('mudang'),v=mobilOut().find(a=>a.elite);hurtAlly(v,v.hp+10);o.loss=Math.abs(pop0-sectPop('mudang')-GD.MOBIL.loss[1])<.01&&mobilOut().length===2;
    // 기한
    for(const a of mobilOut())a.left=.01;updateAlly(allies.find(a=>a.kind==='sect'),.1);o.expire=mobilOut().length===0;
    // 이듬해 다시, 하산하면 돌아감
    P.mobY=-5;o.again=mobilize()&&mobilOut().length===3;sectAct('sleave');o.leave=!P.sect&&mobilOut().length===0;
    // 장로 (rank 4)는 4명, 교주 줄
    P.sect='mudang';P.mtot.mudang=RANK_PTS[4];o.r4=mobilPlan().n===4;
    // 인원이 적으면 덜 온다
    G.pop.mudang=GD.MOBIL.popPer*2+1;o.pop=mobilPlan().n===2;
    return o});
  ok('문파 없으면 못 부름',r.none);
  ok('첫 직위는 못 부름',r.r0);
  ok('문파창에 동원 칸',r.panel);
  ok('직위 1: 1명',r.r1);
  ok('직위 3: 3명 중 고수 1',r.r3);
  ok('봉문 중 막힘',r.seal);
  ok('부르면 3명이 곁에',r.go&&r.cnt);
  ok('공적을 쓴다',r.cost);
  ok('고수가 더 세고 경지·옷·이름이 직위를 따른다',r.strong);
  ok('해마다 한 번',r.once);
  ok('문파창에 돌려보내기',r.html);
  ok('저장·불러오기에 남는다',r.save);
  ok('쓰러지면 문파 인원이 준다',r.loss);
  ok('기한이 지나면 돌아간다',r.expire);
  ok('이듬해 다시, 하산하면 돌아간다',r.again&&r.leave);
  ok('장로는 4명',r.r4);
  ok('인원이 적으면 덜 온다',r.pop);
  ok('오류 없음',!errs.length);if(errs.length)console.log(errs);
  await b.close()})();

// 기연 무공: 기연으로만 얻는 천고 등급 무공
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:사"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const d=await p.evaluate(()=>{const g=Object.values(ARTS).filter(a=>a.gy);
    return{n:g.length,cls:[...new Set(g.map(a=>a.cls))].length,grade:g.every(a=>a.grade===4&&a.side===null&&a.forms.length===5),
      mul:ARTS.gy_geom.forms[0].m/ARTS['정검0'].forms.find(()=>1).m,ult:ARTS.gy_geom.ult.steps[0].m}});
  ok(`기연 무공 ${d.n}가지, 무기 ${d.cls}종, 모두 천고·정사 무관·5초식`,d.n===6&&d.cls===6&&d.grade);
  ok(`필살기 첫 타 배수 ${d.ult} > 절정 2`,d.ult>2);
  // 다른 곳에서는 나오지 않는다
  const src=await p.evaluate(()=>{let bk=0;for(let i=0;i<800;i++){const it=randomBook();if(ARTS[it.art].gy)bk++}
    const shop=JSON.stringify(SHOP).includes('gy_'),sect=Object.values(SECTS).some(s=>s.arts.some(a=>a.id.startsWith('gy_')));return{bk,shop,sect}});
  ok(`비급(800번)·상점·문파 어디에도 없음: ${JSON.stringify(src)}`,src.bk===0&&!src.shop&&!src.sect);
  // v157: 기연 터·보물상자에서는 기연 무공이 나오지 않고 기연동굴(cave)에서만
  const pr=await p.evaluate(()=>{const n={spot:0,chest:0,cave:0};const keep=P.arts;for(const s of['spot','chest','cave'])for(let i=0;i<4000;i++){P.arts={base:keep.base};if(gyRoll(s))n[s]++}P.arts=keep;return n});
  ok(`기연 터 ${pr.spot/40}% · 보물상자 ${pr.chest/40}% · 기연동굴 ${pr.cave/40}%`,pr.spot===0&&pr.chest===0&&pr.cave>2100&&pr.cave<2700);
  // 기연을 만나면 비급이 행낭에 들어오고, 읽어야 익힌다 (사파 검객 → 천외비선검)
  const g1=await p.evaluate(()=>{const R=Math.random;Math.random=()=>.01;giyeon('cave');Math.random=R;const bag=!!P.bag.find(i=>i.art==='gy_geom'),before=!!P.arts.gy_geom;readBook(P.bag.find(i=>i.art==='gy_geom'));const s=P.arts.gy_geom;
    return{bag,before,has:!!s,f:s&&s.f.filter(Boolean).length,cur:P.cur,feat:P.feats.slice(-1)[0],log:G.gyLog}});
  ok(`기연으로 천외비선검 비급이 행낭에(${g1.bag}, 바로 익히지 않음 ${!g1.before}) → 읽으면 첫 초식만, 바로 펼침: ${JSON.stringify(g1)}`,g1.bag&&!g1.before&&g1.has&&g1.f===1&&g1.cur==='gy_geom'&&g1.feat.includes('천외비선검'));
  // 오성 가짓수에 들지 않는다
  const cap=await p.evaluate(()=>({cap:capArts().length,all:learnedArts().length}));
  ok(`무공 가짓수에 들지 않음 (가짓수 ${cap.cap}, 전체 ${cap.all})`,cap.cap===cap.all-1);
  // 숙련이 차면 다음 초식이 저절로 열린다
  const m=await p.evaluate(()=>{P.arts.gy_geom.p=19.9;gainMast('gy_geom',5);const a=P.arts.gy_geom.f.filter(Boolean).length;P.arts.gy_geom.p=99;gainMast('gy_geom',50);return[a,P.arts.gy_geom.f.filter(Boolean).length,allLearned('gy_geom')]});
  ok(`숙련 20에 2초식, 극성에 모든 초식과 필살기: ${m}`,m[0]===2&&m[1]===5&&m[2]);
  // 한 생에 두 가지까지
  const mx=await p.evaluate(()=>{const R=Math.random;Math.random=()=>.01;giyeon('cave');Math.random=R;const b=P.bag.find(i=>i.slot==='book'&&ARTS[i.art].gy);readBook(b);const two=gyMine().length;let third=null;for(let i=0;i<20;i++)third=third||gyRoll('cave');
    const b3=mkBook(Object.keys(GY_ARTS).find(id=>!P.arts[id]),0);return{two,third,block:readBlock(b3)}});
  ok(`한 생에 2가지까지: ${JSON.stringify(mx)}`,mx.two===2&&mx.third===null&&/2가지까지/.test(mx.block));
  // 무공 창
  await p.evaluate(()=>openPanel('arts'));await p.waitForTimeout(300);
  const t=await p.evaluate(()=>$('wbody').textContent);
  ok('무공 창에 기연·천고 표시와 기연 무공 2/6',t.includes('기연 · 천고')&&t.includes('기연 무공 2/6')&&t.includes('???'));
  await p.screenshot({path:shot('giyeon_arts')});
  // 저장
  const sv=await p.evaluate(()=>{saveGame(true);const d=loadGame();return!!(d.P.arts.gy_geom&&d.G.gyLog.length===2)});
  ok('저장에 기연 무공과 기연록',sv);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

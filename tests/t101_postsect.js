// 역참 마부 창: 가입한 문파 본산이 맨 위에 나오고 세력 목록에는 다시 나오지 않는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{
    const ids=h=>[...h.matchAll(/goto:([a-z_0-9]+)/g)].map(m=>m[1]);
    const none0h=pNpc({id:'post',n:'역참 마부'}),none=ids(none0h);P.sect='mudang';
    const h=pNpc({id:'post',n:'역참 마부'}),all=ids(h);
    return{nomy:!none0h.includes('내 문파'),none0:none.length&&!none.includes(hqId(SECTS.mudang))?'':'x',my:hqId(SECTS.mudang),gae:h.indexOf('성내 역참')>h.indexOf('내 문파'),first:all[0],dup:all.filter(x=>x===hqId(SECTS.mudang)).length,head:h.indexOf('내 문파'),caps:h.includes('성도'),maeng:h.includes('맹 총단'),capAfter:h.indexOf('성도')>h.indexOf('내 문파')}});
  ok('문파 없으면 내 문파 칸 없음',r.nomy);
  ok('가입하면 내 문파 본산이 맨 위',r.first===r.my&&r.gae);
  ok('내 문파 본산은 한 번만',r.dup===1&&r.head>0);
  ok('성도·맹 총단 목록은 그대로 붙는다',r.caps&&r.maeng&&r.capAfter);
  ok('오류 없음',!errs.length);if(errs.length)console.log(errs);
  await b.close()})();

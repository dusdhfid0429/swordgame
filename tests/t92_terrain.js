// v155: 지역별 지형 개성 — 지명별 지형(TP), 봉우리는 있던 바위·나무 자리만 바꾼다, 사막은 마른 땅, 물 칸 목록, 그리기 오류 없음
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const cnt=f=>{let n=0;for(const row of objs)for(const o of row)if(f(o))n++;return n};
    const go=id=>{enterRegion(id,N/2,NH/2);draw();return{key:TP&&TP.key,sp:cnt(o=>o==='spire'),all:cnt(o=>!!o),tree:cnt(o=>PERCH_TREE[o]),water:WATER.length/2}};
    const hw=go('hq_hwasan');const ts=terrSpires;terrSpires=()=>{};loadRegion('hq_hwasan');const raw=cnt(o=>!!o);terrSpires=ts;
    const ms=go(Object.keys(REGIONS).find(k=>REGIONS[k].lm&&REGIONS[k].lm.n==='명사산'));
    const bt=go('hq_bota'),gb=go('gaebong');return{hw,raw,ms,bt,gb,spr:SPRITES.spire.length}});
  ok(`화산: 지형 ${r.hw.key}, 봉우리 ${r.hw.sp}개, 막힌 칸 ${r.hw.all} = 원래 ${r.raw}`,r.hw.key==='화산'&&r.hw.sp>20&&r.hw.all===r.raw);
  ok(`명사산: 지형 ${r.ms.key}, 마른 땅 나무 ${r.ms.tree}`,r.ms.key==='명사산'&&r.ms.tree===0);
  ok(`보타산 물 칸 ${r.bt.water}, 개봉 지형 ${r.gb.key} 물 칸 ${r.gb.water}, 봉우리 그림 ${r.spr}장`,r.bt.water>0&&!r.gb.key&&r.gb.water>0&&r.spr===3);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

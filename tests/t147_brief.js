// v230 창 설명 줄이기 (동훈님 2026-11-02 "이런 설명들이 너무 글이 많아"): 무공창·심법·경공·보법·패시브 설명은 칩 한 줄 + 접은 '자세히',
// 다른 긴 설명 줄은 두 줄로 자르고 누르면 펼친다. 펼친 칸은 창을 다시 그려도 열려 있다.
const {chromium}=require(process.env.PWPATH||'playwright');const path=require('path');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+path.resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(500);
  await p.evaluate(()=>{P.opened=Object.assign(P.opened||{},{mu:1});WTAB.arts=0;openPanel('arts')});await p.waitForTimeout(300);
  let r=await p.evaluate(()=>{const w=$('wbody');const f=w.querySelector('details.brief[data-bk="artsHow"]');
    return{fold:!!f,open:f&&f.open,chips:f?f.querySelectorAll('.chip').length:0,vis:w.innerText.includes('1.7초'),txt:w.textContent.includes('1.7초'),gy:!!w.querySelector('details.brief[data-bk="gy"]')}});
  await p.screenshot({path:path.resolve(__dirname,'shots/t147_arts.png')});
  ok(`무공창 요령: 접힌 칸 ${r.fold}·칩 ${r.chips}개, 본문 숨김 ${!r.vis}(내용은 있음 ${r.txt}), 기연 접힘 ${r.gy}`,r.fold&&!r.open&&r.chips>=3&&!r.vis&&r.txt&&r.gy);
  await p.click('details.brief[data-bk="artsHow"]>summary');await p.waitForTimeout(100);
  r=await p.evaluate(()=>{renderOpen();return $('wbody').querySelector('details.brief[data-bk="artsHow"]').open});
  ok(`펼친 칸은 다시 그려도 열림 ${r}`,r===true);
  await p.evaluate(()=>{WTAB.arts=1;renderOpen()});await p.waitForTimeout(300);
  r=await p.evaluate(()=>{const w=$('wbody');const ks=[...w.querySelectorAll('details.brief')].map(d=>d.dataset.bk);
    const long=[...w.querySelectorAll('p.note')].filter(n=>!n.closest('details')&&n.textContent.length>110&&!n.classList.contains('clamp')).length;return{ks,long}});
  await p.screenshot({path:path.resolve(__dirname,'shots/t147_suryeon.png')});
  ok(`심법·보법 탭 접힌 칸 ${r.ks.join(',')}, 자르지 않은 긴 설명 ${r.long}`,['sim','gg','bob','pas'].every(k=>r.ks.includes(k))&&r.long===0);
  // 다른 창의 긴 설명은 두 줄로 잘리고 누르면 펼친다
  await p.evaluate(()=>{closePanels();openPanel('world')});await p.waitForTimeout(300);
  r=await p.evaluate(()=>{const n=$('wbody').querySelector('p.note.clamp');if(!n)return null;const h0=n.clientHeight;n.click();const h1=n.clientHeight;return{h0,h1,open:n.classList.contains('open')}});
  ok(`정세 창 긴 설명 두 줄로 자름·누르면 펼침 ${JSON.stringify(r)}`,r&&r.open&&r.h1>r.h0&&r.h0<=40);
  ok('오류 없음 '+errs.join(' | '),!errs.length);
  await b.close();
})();

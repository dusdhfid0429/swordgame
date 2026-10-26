// 메뉴 → 종료 (v177, 사용자 2026-10-26): 저장소 선택 / 완전 종료 / 그만둔다. 완전 종료는 기록하고 안드로이드는 AndroidApp.exit, 브라우저는 첫 화면 + 알림
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  const start=async(apk)=>{const p=await b.newPage({viewport:{width:420,height:820}});
    p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
    if(apk)await p.addInitScript(()=>{window.__exit=0;window.AndroidApp={keepScreen(){},exit:()=>window.__exit++}});
    await p.goto(url+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
    await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
    await p.evaluate(()=>{P.silver=4321});return p};
  // 안드로이드: 종료 → 완전 종료
  let p=await start(true);
  await p.evaluate(()=>openPanel('menu'));
  const r0=await p.evaluate(()=>({quit:document.querySelectorAll('#wbody [data-act="quit"]').length,ask:!!document.getElementById('quitask'),old:document.querySelectorAll('#wbody [data-act="totitle"]').length}));
  ok(`메뉴에 종료 단추 ${r0.quit}개, 처음엔 고르는 칸 없음`,r0.quit===1&&!r0.ask&&r0.old===0);
  await p.click('[data-act="quit"]');
  const r1=await p.evaluate(()=>[...document.querySelectorAll('#quitask [data-act]')].map(x=>x.dataset.act+':'+x.textContent));
  ok('종료 → 저장소 선택·완전 종료·그만둔다: '+r1.join(', '),r1.length===3&&r1[0]==='totitle:저장소 선택'&&r1[1]==='quitapp:완전 종료'&&r1[2].startsWith('quitno'));
  await p.click('[data-act="quitno"]');
  ok('그만둔다 → 고르는 칸 닫힘, 메뉴 그대로',await p.evaluate(()=>!document.getElementById('quitask')&&panel==='menu'&&__exit===0));
  await p.click('[data-act="quit"]');await p.evaluate(()=>{closePanels();openPanel('menu')});
  ok('메뉴를 다시 열면 고르는 칸은 접혀 있음',await p.evaluate(()=>!document.getElementById('quitask')));
  await p.click('[data-act="quit"]');await p.click('[data-act="quitapp"]');
  const r2=await p.evaluate(()=>({exit:__exit,save:(localStorage.getItem(SAVE_KEY)||'').includes('4321')}));
  ok(`완전 종료 (안드로이드) → 기록하고 AndroidApp.exit (exit ${r2.exit}, 저장 ${r2.save})`,r2.exit===1&&r2.save);
  await p.close();
  // 브라우저: 완전 종료 → 창이 안 닫히면 첫 화면 + 알림
  p=await start(false);
  await p.evaluate(()=>openPanel('menu'));await p.click('[data-act="quit"]');await p.click('[data-act="quitapp"]');await p.waitForTimeout(600);
  const r3=await p.evaluate(()=>({playing,P,scr:!scrEl.hidden,note:!!document.getElementById('quitnote'),row:document.querySelector('[data-s="slot:0"]').textContent,save:(localStorage.getItem(SAVE_KEY)||'').includes('4321')}));
  ok(`완전 종료 (브라우저) → 기록, 첫 화면, 탭을 닫으라는 알림 (${r3.row})`,!r3.playing&&r3.P===null&&r3.scr&&r3.note&&r3.save);
  await p.click('[data-s="slot:0"]');await p.click('[data-s="cont"]');await p.waitForFunction(()=>playing);
  ok('다시 이어 하기: 은자 그대로',await p.evaluate(()=>P.silver===4321));
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

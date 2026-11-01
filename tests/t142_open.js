// v222 개선 계획 3절 (동훈님 2026-11-01): 무관 첫 대련 · 창 단계별 열기 · 창 첫 줄 '지금 할 일' · 초식 이름 외치기
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(500);
  // 1. 무관 첫 과제는 동기와 첫 대련. 동기 대화에 단추, 누르면 대련 + 동기가 초식 이름을 외친다
  let r=await p.evaluate(()=>{const g=acadCur();const n=npcsHere().find(n=>n.id==='ac_m'+ACAD_SPAR.mate.i);openNpc(n);return{k:g.k,id:g.id,btn:!!document.querySelector('[data-act="acspar:mate"]'),stage:P.acad.stage}});
  ok(`첫 과제 ${r.k}:${r.id}, 동기 창 대련 단추 ${r.btn}`,r.k==='spar'&&r.id==='mate'&&r.btn&&r.stage===0);
  await p.click('[data-act="acspar:mate"]');await p.waitForTimeout(1000);
  r=await p.evaluate(()=>{const c=document.getElementById('callout');return{duel:!!(G.acadDuel&&G.acadDuel.kind==='mate'),co:!!c&&c.classList.contains('on'),t:c&&c.textContent}});
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t142_callout.png')});
  ok(`대련 시작 ${r.duel}, 초식 이름 외치기 '${r.t}'`,r.duel&&r.co&&/맹호출림/.test(r.t));
  // 8세 맨손으로 이길 수 있다: 기본 공격만으로 60초 안에 끝난다
  r=await p.evaluate(()=>{const e=mobs.find(m=>m.acadSpar==='mate');let t=0;P.target=e;for(;t<60&&G.acadDuel;t+=.1){P.target=e;update(.1)}
    return{t:Math.round(t),end:!G.acadDuel,done:!!P.acad.c.spar_mate,hp:Math.round(P.hp),next:acadCurK()}});
  ok(`첫 대련 ${r.t}초 만에 끝남 ${r.end}, 과제 ${r.done}, 다음 ${r.next}`,r.end&&r.done&&r.next==='equip');
  // 2. 탭바 둘째 쪽: 무관 중엔 정세가 흐리고 졸업하면 밝다
  await p.waitForTimeout(700);
  r=await p.evaluate(()=>({dim:document.getElementById('tb_story').classList.contains('dim'),hist:document.getElementById('tb_hist').classList.contains('dim')}));
  ok(`무관 중 정세 단추 흐림 ${r.dim}, 강호사는 밝음 ${!r.hist}`,r.dim&&!r.hist);
  // 3. 창안 재료·깨달음은 처음엔 없고, 첫 견식·깨달음에 열린다
  r=await p.evaluate(()=>{closePanels();openPanel('arts');const a=$('wbody').textContent.includes('창안 재료');openPanel('char');const c=/깨달음 \d/.test($('wbody').textContent);
    const id=Object.keys(ARTS).find(k=>ARTS[k].sect&&ARTS[k].forms.length>1);P.gs={[id]:{k:1,p:0}};P.enl=2;openT=0;update(.1);
    openPanel('arts');const a2=$('wbody').textContent.includes('창안 재료');openPanel('char');const c2=/깨달음 \d/.test($('wbody').textContent);
    return{a,c,a2,c2,op:Object.keys(P.opened||{}).join(),log:logHist.slice(-4).map(l=>l.t||l).join('|')}});
  ok(`창안 재료 ${r.a}→${r.a2}, 깨달음 ${r.c}→${r.c2}, 열림 ${r.op}`,!r.a&&r.a2&&!r.c&&r.c2&&r.op.includes('mk')&&r.op.includes('mu'));
  // 4. 창 맨 위 '지금 할 일': 비급이 있으면 행낭·무공 창에 읽기 단추
  r=await p.evaluate(()=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='권'&&!ARTS[k].base&&!A(k)&&!ARTS[k].side);const bk=mkBook(id,0);P.bag.push(bk);openPanel('bag');const t=document.querySelector('#wbody .todo');
    return{t:t&&t.textContent,btn:!!(t&&t.querySelector(`[data-act="tread:${bk.id}"]`)),first:document.querySelector('#wbody').firstElementChild.classList.contains('todo')}});
  ok(`행낭 첫 줄 '${r.t}', 읽기 단추 ${r.btn}, 맨 위 ${r.first}`,r.btn&&r.first);
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t142_todo.png')});
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

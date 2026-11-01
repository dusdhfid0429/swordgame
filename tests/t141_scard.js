// v221 문파 고르기 카드 (개선 계획 2절, 동훈님 2026-11-01): 무관 졸업 뒤 추천서 칸이 카드 셋 + 낭인 카드가 된다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const grad=(grade,lives,cls)=>p.evaluate(([grade,lives,cls])=>{G.lives=lives;P.acad={grad:1,grade,gradAge:13,stage:4,c:{},cls};const d=document.createElement('div');d.innerHTML=scHtml();
    const cards=[...d.querySelectorAll('.scard')];return{n:cards.filter(c=>!c.classList.contains('lock')&&!c.classList.contains('ronin')).length,lock:cards.filter(c=>c.classList.contains('lock')).map(c=>({t:c.textContent,btn:!!c.querySelector('[data-act^="acrec:"]')})),
      ronin:!!d.querySelector('.ronin [data-act="acrec:none"]'),lines:cards[0].querySelectorAll('p b.dim').length,heads:[...cards[0].querySelectorAll('p b.dim')].map(x=>x.textContent).join(),reroll:(x=>x&&{t:x.textContent,dis:x.disabled})(d.querySelector('[data-act="screroll"]')),ids:P.acad.cards.slice(),
      ok:P.acad.cards.every(id=>acadRecList().includes(SECTS[id]))}},[grade,lives,cls]);
  // 1. 수석·첫 생: 카드 셋 + 낭인, 줄 넷(성격·입문공·앙숙·천하대전), 다시 뽑기 없음
  let r=await grad('수석',0,'검');
  ok(`수석 첫 생: 카드 ${r.n}장 ${r.ids}, 낭인 ${r.ronin}, 줄 ${r.heads}, 다시 뽑기 ${!!r.reroll}`,r.n===3&&r.ronin&&r.heads==='성격,입문공,앙숙,천하대전'&&!r.reroll&&r.ok&&new Set(r.ids).size===3);
  // 2. 수료: 소문파만 추천, 명문 하나는 잠긴 카드(추천서 단추 없음)
  r=await grad('수료',0,'검');ok(`수료: 카드 ${r.n}장, 잠긴 명문 ${r.lock.length} (단추 ${r.lock.map(l=>l.btn)})`,r.n>=1&&r.lock.length===1&&!r.lock[0].btn&&/졸업이어야/.test(r.lock[0].t)&&r.ok);
  // 3. 몸에 맞는 문파가 더 자주: 검을 고르면 입문공이 검인 문파가 뽑히는 몫이 고르게 뽑을 때보다 크다
  r=await p.evaluate(()=>{G.lives=0;P.acad={grad:1,grade:'수석',gradAge:13,stage:4,c:{},cls:'검'};const L=acadRecList(),sw=L.filter(s=>(START[s.id]||{}).w==='검');let hit=0,N=400;
    for(let i=0;i<N;i++){scDeal();hit+=P.acad.cards.filter(id=>(START[id]||{}).w==='검').length}
    return{share:hit/(N*3),even:sw.length/L.length,why:scWhy(sw[0]).why}});
  ok(`검 문파 몫 ${r.share.toFixed(2)} > 고르게 ${r.even.toFixed(2)}, 까닭 '${r.why}'`,r.share>r.even+.05&&r.why.includes('검 병기가 맞다'));
  // 4. 윤회 해금: 지난 생 3 → 카드 4장 + 다시 뽑기 1번
  r=await grad('수석',3,'도');ok(`지난 생 3: 카드 ${r.n}장, 다시 뽑기 ${r.reroll&&r.reroll.t}`,r.n===4&&!!r.reroll&&!r.reroll.dis);
  r=await p.evaluate(()=>{const a=P.acad.cards.slice();act('screroll');const b=P.acad.cards.slice();const d=document.createElement('div');d.innerHTML=scHtml();act('screroll');
    return{a,b,diff:b.filter(x=>!a.includes(x)).length,dis:d.querySelector('[data-act="screroll"]').disabled,same:P.acad.cards.join()===b.join()}});
  ok(`다시 뽑기: ${r.a} → ${r.b} (새 카드 ${r.diff}), 다 쓰면 막힘 ${r.dis}, 더 눌러도 그대로 ${r.same}`,r.diff>=1&&r.dis&&r.same);
  // 5. 카드 고르기 = 추천서
  r=await p.evaluate(()=>{const id=P.acad.cards[0];act('acrec:'+id);return{id,rec:P.acad.rec,done:P.acad.recDone}});
  ok(`카드 ${r.id} → 추천서 ${r.rec}`,r.rec===r.id&&r.done===1);
  // 6. 좁은 화면에서 카드가 옆으로 넘치지 않는다
  r=await p.evaluate(()=>{P.acad.recDone=0;P.acad.rec=null;openPanel('npc',{id:'x',n:'관주'});$('wbody').innerHTML=scHtml();const w=$('wbody');return{sw:w.scrollWidth,cw:w.clientWidth}});
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t141_scard.png')});
  ok(`카드 창 폭 ${r.sw}/${r.cw}`,r.sw<=r.cw+1);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

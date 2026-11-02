// v227 (동훈님 2026-11-02 "UI가 깨지는 부분들 확인해줘"): 용어 풀이(.term)가 flex·grid 칸 안에서 글 조각을 쪼개
// 낱말마다 줄이 바뀌고 점선이 칸 폭만큼 깔리던 문제. 모든 창에서 .term은 글 줄 안(inline)에 머물러야 한다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>{localStorage.clear();showTitle()});
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 창 하나를 열고 .term 검사: 모두 inline, 한 줄짜리 설명 칸(.it)이 용어 때문에 부풀지 않음
  const check=()=>p.evaluate(()=>{const ts=[...document.querySelectorAll('#wbody .term')];
    const bad=ts.filter(t=>getComputedStyle(t).display!=='inline').map(t=>t.dataset.term+'<'+t.parentElement.className+'>');
    // 글 묶음(.tw)은 원래 글처럼 부모의 글씨 크기·색을 그대로 따른다 (.it span 규칙에 작아지지 않음)
    for(const w of document.querySelectorAll('#wbody .tw')){const a=getComputedStyle(w),c=getComputedStyle(w.parentElement);if(a.fontSize!==c.fontSize||a.color!==c.color)bad.push('tw:'+w.textContent.slice(0,8))}
    return{n:ts.length,bad}});
  const shots=[];
  const panel=async(name,open)=>{await p.evaluate(open);await p.waitForTimeout(150);const r=await check();
    ok(`${name}: 용어 ${r.n}개, 줄 깨짐 ${r.bad.length}${r.bad.length?' '+r.bad.slice(0,5).join(' '):''}`,r.bad.length===0);
    if(shots.length<6){const f=__dirname+`/shots/t146_${shots.length}.png`;await p.screenshot({path:f});shots.push(f)}
    await p.evaluate(()=>closePanels())};
  // 1. 행낭: 무공 비급 두 권 (스크린샷: 혈마도법 비급만 깨지고 탈혼검 비급은 멀쩡)
  await p.evaluate(()=>{const ids=Object.keys(ARTS).filter(k=>ARTS[k].forms&&ARTS[k].forms.length>1).slice(0,3);for(const k of ids)giveItem(mkBook(k,0))});
  await panel('행낭 비급',()=>openPanel('bag'));
  // 비급 칸 높이: 이름 줄 + 설명 한두 줄 + 활력 줄을 넘지 않는다
  await p.evaluate(()=>openPanel('bag'));await p.waitForTimeout(150);
  let r=await p.evaluate(()=>[...document.querySelectorAll('#wbody .it')].filter(e=>e.textContent.includes('비급')).map(e=>Math.round(e.getBoundingClientRect().height)));
  ok(`비급 칸 높이 ${r.join(',')}px (모두 140px 아래)`,r.length>0&&r.every(h=>h<140));
  await p.evaluate(()=>closePanels());
  // 2. 문파 창 수련기 카드 (장작 패기·물 긷기 (외공 +2) / 근력·민첩·지구력)
  await p.evaluate(()=>{P.age=9;P.fame=999;loadRegion('hq_hwasan');P.reg='hq_hwasan';openNpc(hqNpc('hq_hwasan'))});await p.waitForTimeout(200);
  await p.evaluate(()=>act('sjoin:hwasan'));await p.waitForTimeout(150);await p.evaluate(()=>{sryT=0;runHooks('tick',.1)});
  await panel('문파 수련기 카드',()=>{closePanels();openNpc(hqNpc('hq_hwasan'))});
  await p.evaluate(()=>{closePanels();openNpc(hqNpc('hq_hwasan'))});await p.waitForTimeout(150);
  r=await p.evaluate(()=>({top:$('wbody').scrollTop,rows:[...document.querySelectorAll('#wbody .it')].filter(e=>e.textContent.includes('외공')).map(e=>Math.round(e.getBoundingClientRect().height))}));
  ok(`수련기 과제 칸 높이 ${r.rows.join(',')}px (110px 아래), 창 맨 위에서 시작 ${r.top}`,r.rows.length>0&&r.rows.every(h=>h<110)&&r.top===0);
  await p.evaluate(()=>closePanels());
  // 3. 무관 실습 의뢰 줄 (산적·산적궁수 처치 5 · 은자 25 · 활력 40)
  r=await p.evaluate(()=>{const d=document.createElement('div');d.id='tmpgl';d.style.cssText='position:fixed;left:0;top:0;width:360px';
    d.innerHTML='<div class="list"><div class="it"><div>수련곡 산적 소탕<span>산적·산적궁수 처치 5 · 은자 25 · 활력 40 · 연속기 +14%</span></div><div class="ib"></div></div></div>';
    document.body.appendChild(d);glossMark(d);const ts=[...d.querySelectorAll('.term')],h=d.querySelector('.it').getBoundingClientRect().height,inl=ts.every(t=>getComputedStyle(t).display==='inline');d.remove();
    return{n:ts.length,inl,h:Math.round(h)}});
  ok(`실습 의뢰 줄: 용어 ${r.n}개 inline ${r.inl}, 높이 ${r.h}px`,r.n>=2&&r.inl&&r.h<90);
  // 4. 나머지 창 훑기
  for(const id of ['char','arts','quest','world','story','help','menu','logs','hist'])await panel(id+' 창',new Function(`openPanel('${id}')`));
  console.log('shots '+shots.join(' '));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

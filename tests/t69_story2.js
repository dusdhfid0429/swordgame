// 스토리 2단계 (2026-10-15 v108): 사건의 장소·인물 대화(그 인물 대화에 사건 카드), 사건 전용 적(선택 즉시 둘레에, 다른 지역에 들어서면 다시)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 사건이 열리면 장소를 알려 주고, 정세 창 카드에 '장소' 줄
  const a=await p.evaluate(()=>{P.age=20;lastYear=19;update(.1);const o={open:P.story.open,log:$('log').textContent.includes('의뢰판'),card:$('wbody').textContent.includes('장소: 개봉 의뢰판')};closePanels();return o});
  ok(`ev1 열림(${a.open}) · 로그에 장소 ${a.log} · 카드 장소 줄 ${a.card}`,a.open==='ev1'&&a.log&&a.card);
  // 2. 의뢰판 대화 맨 위에 사건 카드. 객잔 주인에게는 없다. 거기서 고르면 임무 + 전용 적(혈교무인)이 둘레에
  const c=await p.evaluate(()=>{const o={};const bd=npcsHere().find(n=>n.id==='board');openNpc(bd);o.card=$('win').innerText.includes('혈교의 그림자')&&!!document.querySelector('[data-act="spick:ev1:0"]');closePanels();
    openNpc(npcsHere().find(n=>n.id==='inn'));o.inn=!document.querySelector('[data-act^="spick:"]');closePanels();openNpc(bd);act('spick:ev1:0');o.q=!!P.quests.find(q=>q.story==='ev1');o.gone=!document.querySelector('[data-act="spick:ev1:0"]');closePanels();return o});
  await p.waitForTimeout(700);
  const f=await p.evaluate(()=>{const m=mobs.filter(x=>x.story==='ev1');return{n:m.length,kind:m[0]&&m[0].kind,name:m[0]&&m[0].name,near:m.every(x=>dist(x,P)<12),aggro:m.every(x=>x.angry)}});
  ok(`의뢰판 대화 카드 ${c.card} · 객잔엔 없음 ${c.inn} · 고르면 임무 ${c.q} 카드 사라짐 ${c.gone} · 전용 적 ${f.n}명 ${f.kind} "${f.name}" 근처 ${f.near} 덤빔 ${f.aggro}`,
    c.card&&c.inn&&c.q&&c.gone&&f.n===4&&f.kind==='혈교무인'&&/혈교 사자/.test(f.name)&&f.near&&f.aggro);
  // 3. 잡으면 임무가 센다. 둘 남긴 채 다른 지역에 들어서면 남은 수만큼 다시 나타난다. 임무가 끝나면 안 나온다
  const r=await p.evaluate(async()=>{const o={};const m=mobs.filter(x=>x.story==='ev1');for(const x of m.slice(0,2)){x.hp=1;damage(x,5,0,0,P)}const q=P.quests.find(q=>q.story==='ev1');o.have=q.have;
    loadRegion('pv_henan');P.reg='pv_henan';P.x=30;P.y=30;runHooks('regionLoaded','pv_henan');await new Promise(r=>setTimeout(r,1500));o.again=mobs.filter(x=>x.story==='ev1').length;
    q.have=q.cnt;mobs=[];runHooks('regionLoaded','pv_henan');await new Promise(r=>setTimeout(r,1500));o.none=mobs.filter(x=>x.story==='ev1').length;return o});
  ok(`둘 처치 → ${r.have}/3 · 하남성 진입 시 다시 ${r.again}명 (남은 1+1) · 임무 끝나면 ${r.none}명`,r.have===2&&r.again===2&&r.none===0);
  // 4. 세력 무인 종류도 나온다: ev2 호위 → 사파 무인·고수. 규칙 hqFac·role 매칭
  const s=await p.evaluate(()=>{const o={};P.quests=[];P.story.pick.ev1=0;P.age=20.5;update(.1);closePanels();o.open=P.story.open;pickChoice(evOf('ev2'),0,false);
    const q=P.quests.find(q=>q.story==='ev2');evFoes(evOf('ev2'),q);const m=mobs.filter(x=>x.story==='ev2');o.n=m.length;o.kinds=[...new Set(m.map(x=>x.kind))].join('·');o.fac=m.every(x=>x.d.fac==='사'&&x.angry);
    o.hq=evNpcOk({hqFac:'정'},{hq:'hwasan'})&&!evNpcOk({hqFac:'정'},{hq:'cheonma'});o.role=evNpcOk({maeng:'sacheon',role:'leader'},{maeng:'sacheon',role:'leader'})&&!evNpcOk({maeng:'sacheon',role:'leader'},{maeng:'jeong',role:'leader'});return o});
  ok(`ev2(${s.open}) 호위 → 사파 ${s.n}명 (${s.kinds}) 적대 ${s.fac} · 규칙 본산 ${s.hq} 맹 ${s.role}`,s.open==='ev2'&&s.n===3&&/사파 무인/.test(s.kinds)&&s.fac&&s.hq&&s.role);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

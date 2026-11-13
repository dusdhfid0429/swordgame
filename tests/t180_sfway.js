// 대연무장 가는 길 (사용자 2026-11-13 "장백파 대연무장을 못찾겠어")
// 대문파는 대연무장 출입구가 외원 서쪽 끝인데 안내가 '본산 아래 어귀 왼쪽'이라 했다 → 글은 실제 자리를 읽고, 볼일이 있으면 본산 맵마다 금빛 화살표
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 안내 글이 실제 출입구 자리를 말한다 (대문파 = 외원, 그 밖 = 본산 아래)
  const r1=await p.evaluate(()=>{const on=Object.values(SECTS).filter(s=>sabuOn(s)&&REGIONS['ar_'+s.id]);
    return{bad:on.filter(s=>{const H=REGIONS[sfHostMap(s.id)],g=H.gates.find(q=>q.to==='ar_'+s.id);return !g||(sfOuter(s.id)?!(g.x<6):!(g.y>30))||sfOuter(s.id)!==/외원/.test(sfWay(s))}).map(s=>s.id),
      jb:sfWay(SECTS.jangbaek),big:on.filter(s=>sfOuter(s.id)).length,n:on.length}});
  ok(`안내 글 = 실제 출입구 (${r1.big}/${r1.n} 외원): ${r1.jb} ${r1.bad.join(',')}`,!r1.bad.length&&/외원 마당 서쪽/.test(r1.jb)&&r1.big>10);
  // 2. 장백파 입문 → 입문 기록·임무 줄이 외원을 가리키고, 산문·본산·외원 맵마다 갈 출입구에 표시
  const r2=await p.evaluate(()=>{const s=SECTS.jangbaek;enterRegion(hqId(s),20.5,30.5);P.reg=REG;mobs=[];P.realm=0;P.age=16;P.fame=60;P.evil=0;openNpc(hqNpc(hqId(s)));act('sjoin:jangbaek');closePanels();
    const o={st:P.sabu&&P.sabu.st,log:[...document.querySelectorAll('#log div, #log p, #log span')].map(e=>e.textContent).join(' ').includes('외원 마당 서쪽'),trk:sabuTrackHtml(),m:{}};
    for(const id of s.id&&REGIONS[hqId(s)].chain){enterRegion(id,20.5,30.5);P.reg=REG;const M=sfMarks();o.m[id]=M.map(x=>x.l+'@'+x.x+','+x.y).join()}
    enterRegion('ar_jangbaek',20.5,36.2);P.reg=REG;o.m.ar=sfMarks().length;return o});
  ok(`입문하면 외원 대연무장으로: ${r2.st} · ${r2.trk.replace(/<[^>]+>/g,' ')} · ${JSON.stringify(r2.m)}`,r2.st==='rank'&&/외원 서쪽 대연무장/.test(r2.trk)&&r2.m.hq_jangbaek_gate.includes('외원')&&r2.m.hq_jangbaek.includes('외원')&&r2.m.hq_jangbaek_outer.startsWith('대연무장@2.6')&&r2.m.hq_jangbaek_back.includes('장백산'));
  // 3. 사부의 제자로 다음 무공을 받을 수 있으면 대연무장 안에서 그 사부에게 표시, 볼일이 없으면 표시 없음
  const r3=await p.evaluate(()=>{const b=P.sabu;b.st='disc';b.m=0;b.ev=3;const why=sbNextWhy();sfSync&&sfSync(true);const a=sfMarks().map(x=>x.l);
    b.st='common';const c=sfMarks().length;enterRegion('hq_jangbaek_outer',20.5,30.5);P.reg=REG;const d=sfMarks().length;return{why,a,c,d}});
  ok(`대연무장 안 사부 표시: ${r3.why||'청할 수 있음'} → ${r3.a.join()} · 볼일 없으면 ${r3.c}/${r3.d}`,(r3.why?r3.a.length===0:r3.a.length===1)&&r3.c===0&&r3.d===0);
  // 4. 그려도 오류가 없다
  await p.evaluate(()=>{P.sabu.st='rank';enterRegion('hq_jangbaek_outer',20.5,30.5);P.reg=REG});await p.waitForTimeout(600);
  ok(`오류 없음 ${errs.join(' | ')}`,!errs.length);
  await b.close()})();

// 무림전도 문파 개편: 정파 20 · 사파 14 · 마교 1, 모든 문파가 지도 속 성에 있고, 예전 저장은 새 문파·무공으로 옮겨진다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const p=await b.newPage({viewport:{width:1280,height:800}});
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{const S=Object.values(SECTS),c=al=>S.filter(s=>s.al===al).length;
    const prov={};for(const[k,v]of Object.entries(PROV))for(const sid of v.sects)prov[sid]=(prov[sid]||[]).concat(k);
    const where=S.filter(s=>s.id!=='shaolin'&&(prov[s.id]||[]).length!==1).map(s=>s.n);
    return{j:c('jeong'),s:c('sacheon'),m:c('magyo'),where,arts:S.every(s=>s.arts.every(a=>artSect(a.id)===s)),
      na:new Set(S.flatMap(s=>s.arts.map(a=>a.n))).size===S.reduce((t,s)=>t+s.arts.length,0),
      hao:pvOfSect('haomun'),cs:pvOfSect('cheonsan'),bh:pvOfSect('bukhae')}});
  ok(`정파 ${r.j} · 사파 ${r.s} · 마교 ${r.m}`,r.j===34&&r.s===15&&r.m===1);
  ok(`모든 문파가 성 한 곳에 있다 ${r.where.join(',')}`,!r.where.length);
  ok('무공 번호에서 문파를 찾는다, 무공 이름이 겹치지 않는다',r.arts&&r.na);
  ok(`하오문은 광동, 천산파는 신강, 북해빙궁은 내몽고 (${r.hao}/${r.cs}/${r.bh})`,r.hao==='guangdong'&&r.cs==='xinjiang'&&r.bh==='mongol');
  // 예전 저장: 흑사방 제자, 흑사장(S21_0)·만천화우(S15_1)를 익히고 행낭에 칠살검 비급(S27_0)
  await p.evaluate(()=>{localStorage.clear()});await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  await p.evaluate(()=>{saveGame(true);playing=false;const d=JSON.parse(localStorage.getItem(SAVE_KEY));d.P.sect='heuksa';d.P.merit={heuksa:50};d.P.mtot={heuksa:200};
    let raw=JSON.stringify(d);raw=raw.replace('"P":{','"P":{"oldArts":["S21_0","S15_1"],"oldBook":{"art":"S27_0"},');localStorage.setItem(SAVE_KEY,raw)});
  await p.reload();await p.waitForTimeout(1200);await p.click('[data-s="cont"]');await p.waitForTimeout(1000);
  const m=await p.evaluate(()=>({sect:P.sect,merit:P.merit.sama,mtot:P.mtot.sama,old:P.merit.heuksa,arts:P.oldArts,book:P.oldBook.art,log:$('log').textContent}));
  ok(`흑사방 제자는 사마세가로 (공적 ${m.merit}, 누적 ${m.mtot})`,m.sect==='sama'&&m.merit===50&&m.mtot===200&&m.old==null);
  ok(`예전 무공 번호가 새 번호로: ${m.arts} · 비급 ${m.book}`,m.arts[0]==='S_sama_0'&&m.arts[1]==='S_dang_1'&&m.book==='S_dongjeong_0');
  ok('옮겨졌다는 알림',/사마세가로 옮겨졌습니다/.test(m.log));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

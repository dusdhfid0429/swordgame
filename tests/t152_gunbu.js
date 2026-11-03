// 군부 병기별 부대 · 황궁 무고 · 대장군 하사 (v235, 사용자 2026-11-03)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  const r0=await p.evaluate(()=>{const U=SABU.geumgun;return{n:U.length,cls:U.map(u=>u.cls).join(''),gr:U.map(u=>u.path.map(id=>ARTS[id].grade).join('')),top:rankName('geumgun',rankTop('geumgun')),hi:ARTS[SECTS.geumgun.arts.find(a=>a.hi).id].grade}});
  ok(`부대 ${r0.n}개 (${r0.cls}), 무고 등급 ${r0.gr[0]}, 맨 위 직위 ${r0.top}, 어림군 최고 무공 ${r0.hi}`,r0.n===7&&r0.gr.every(g=>g==='0123')&&r0.top==='대장군'&&r0.hi===3);
  // 투신: 부대를 골라야 들어간다. 시작 무공은 그 부대 하승
  const r1=await p.evaluate(()=>{const s=SECTS.geumgun;enterRegion(hqId(s),20.5,30.5);P.reg=REG;mobs=[];P.realm=1;P.age=20;P.fame=60;P.evil=0;P.side='정';const n=hqNpc(hqId(s));openNpc(n);
    const h=$('wbody').innerHTML,o={btns:(h.match(/data-act="gbjoin:/g)||[]).length,plain:h.includes('data-act="sjoin:geumgun"')};act('gbjoin:검');const u=SABU.geumgun.find(u=>u.cls==='검');
    o.sect=P.sect;o.gbu=P.gbu;o.art=!!P.arts[u.path[0]]&&ARTS[u.path[0]].grade===0;o.spear=!P.arts[SECTS.geumgun.arts.find(a=>a.n==='금군창법').id];o.sabu=!P.sabu||P.sabu.sid!=='geumgun';
    openNpc(n);o.card=$('wbody').innerHTML.includes('황궁 무고');return o});
  ok(`부대 단추 ${r1.btns}개, 그냥 가입 단추 없음`,r1.btns===7&&!r1.plain);
  ok(`금위검대 투신 → 검 하승 무공만, 서열·사부 없음, 무고 카드`,r1.sect==='geumgun'&&r1.gbu==='검'&&r1.art&&r1.spear&&r1.sabu&&r1.card);
  // 무고: 직위가 등급을 연다
  const r2=await p.evaluate(()=>{const u=SABU.geumgun.find(u=>u.cls==='검');P.merit.geumgun=9999;P.bag=[];act(`gbbuy:${u.path[1]}:0`);const o={b0:P.bag.length};
    P.srank.geumgun=1;act(`gbbuy:${u.path[1]}:0`);o.b1=P.bag.length;act(`gbbuy:${u.path[3]}:0`);o.b2=P.bag.length;P.srank.geumgun=3;act(`gbbuy:${u.path[3]}:0`);o.b3=P.bag.length;return o});
  ok(`병졸은 중승 못 받음, 십장은 중승, 절정은 천부장부터 (${JSON.stringify(r2)})`,r2.b0===0&&r2.b1===1&&r2.b2===1&&r2.b3===2);
  // 대장군: 황제 하사, 그 전엔 비급 잠김
  const r3=await p.evaluate(()=>{const s=SECTS.geumgun,hi=s.arts.find(a=>a.hi);P.bag=[];P.wis=20;openNpc(hqNpc(hqId(s)));const b=$('wbody').querySelector(`[data-act^="mbuy:${hi.id}:"]`);
    const o={lock:b&&b.disabled&&/대장군만/.test(b.textContent)};P.srank.geumgun=rankTop('geumgun');runHooks('tick',.1);o.grant=P.gbGrant===1&&!!P.arts[hi.id];return o});
  ok(`어림군 최고 무공은 대장군만, 대장군이 되면 황제가 하사`,r3.lock&&r3.grant);
  await p.screenshot({path:shot('t152_gunbu')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

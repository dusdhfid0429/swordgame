// 승급 시험 (v176, 사용자 2026-10-26): 직위는 공적으로 저절로 오르지 않고, 본산에서 시험을 청해 시험관을 이겨야 오른다. 옛 저장은 지금 직위를 지킨다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 1. 본산에서 가입하면 P.srank가 생기고, 공적이 쌓여도 직위는 그대로. 자격이 닿으면 알림
  const r1=await p.evaluate(()=>{enterRegion('hq_hwasan',20.5,30.5);mobs=[];P.realm=2;P.age=20;P.fame=60;P.evil=0;P.side='정';const n=hqNpc('hq_hwasan');openNpc(n);act('sjoin:hwasan');
    const o={sect:P.sect,sr:P.srank&&P.srank.hwasan};const l0=$('log').textContent.length;addMerit('hwasan',RANK_PTS[1]+5);o.rank=rankIdx('hwasan');o.raw=rankRaw('hwasan');
    o.note=$('log').textContent.includes('승급 시험을 청할 수 있습니다');o.why=rtWhy('hwasan');o.html=$('wbody').innerHTML;openNpc(n);o.btn=$('wbody').innerHTML.includes('rtest:hwasan');o.dis=$('wbody').querySelector('[data-act="rtest:hwasan"]').disabled;return o});
  ok(`가입하면 직위 기록 (${r1.sect} · ${r1.sr})`,r1.sect==='hwasan'&&r1.sr===0);
  ok(`공적이 닿아도 직위는 그대로 (직위 ${r1.rank}, 공적 기준 ${r1.raw}), 시험 알림`,r1.rank===0&&r1.raw===1&&r1.note);
  ok(`본산 문파 창에 승급 시험 단추가 켜짐`,r1.btn&&!r1.dis&&r1.why==='');
  // 2. 본산 밖에서는 못 청한다
  const r2=await p.evaluate(()=>{closePanels();const w=rtWhy('hwasan');return w});
  ok(`본산 밖에서는 못 청함 ("${r2}")`,/본산/.test(r2));
  // 3. 시험: 시험관과 비무, 이기면 직위가 오른다
  const r3=await p.evaluate(()=>{const n=hqNpc('hq_hwasan');openNpc(n);act('rtest:hwasan');const e=mobs.find(m=>m.rtExam);
    const o={duel:G.duel,rt:!!G.rtDuel,e:e&&e.name,hp:e&&e.maxHp,panel};damage(e,1e7,0,0,P);o.after=rankIdx('hwasan');o.duel2=G.duel;o.name=rankName('hwasan');return o});
  ok(`시험관 [${r3.e}] 생명 ${r3.hp}와 비무 시작`,r3.duel&&r3.rt&&!!r3.e&&r3.panel===null);
  ok(`시험관을 이기면 ${r3.name}(으)로 오름`,r3.after===1&&r3.duel2===false);
  // 4. 지면 떨어지고 한동안 다시 못 청한다. 시험 자리를 벗어나도 떨어진다
  const r4=await p.evaluate(()=>{addMerit('hwasan',RANK_PTS[2]);P.realm=4;const n=hqNpc('hq_hwasan');openNpc(n);act('rtest:hwasan');const g=!!G.rtDuel;
    duelEnd(false);const o={g,rank:rankIdx('hwasan'),why:rtWhy('hwasan',false),hp:P.hp>0};P.rtCool.hwasan=0;openNpc(n);act('rtest:hwasan');const t=G.rtDuel;P.x=t.x+RT.ring+1;runHooks('tick',.05);
    o.out=!G.rtDuel&&rankIdx('hwasan')===1;return o});
  ok(`지면 직위 그대로, 재시험은 나중 ("${r4.why}")`,r4.g&&r4.rank===1&&/수련/.test(r4.why)&&r4.hp);
  ok(`시험 자리를 벗어나면 낙방`,r4.out);
  // 5. 경지가 모자라면 시험을 못 청한다
  const r5=await p.evaluate(()=>{P.rtCool.hwasan=0;P.realm=0;return rtWhy('hwasan',false)});
  ok(`경지가 모자라면 못 청함 ("${r5}")`,/이상이어야/.test(r5));
  // 6. 옛 저장: 지금 직위(공적·경지 상한)를 그대로 시험에 붙은 직위로 옮긴다
  const r6=await p.evaluate(()=>{const d={v:5,G:{},P:{sect:'hwasan',mtot:{hwasan:RANK_PTS[3]+1},realm:1}};const m=migrateSave(d);const d2={v:5,G:{},P:{sect:null,mtot:{}}};
    return{sr:m.P.srank&&m.P.srank.hwasan,v:m.v,sv:SAVE_VER,none:migrateSave(d2).P.srank}});
  ok(`옛 저장의 직위 유지 (공적 기준 3, 경지 상한 2 → ${r6.sr})`,r6.sr===2&&r6.v===r6.sv&&r6.none===undefined);
  await p.screenshot({path:shot('t112_ranktest')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

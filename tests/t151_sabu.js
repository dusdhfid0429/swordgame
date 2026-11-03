// 사부 지명 · 입문 서열 · 대제자 (v234, 사용자 2026-11-03): 북해빙궁에서 가입 → 서열 비무 → 사부 고르기 → 로드맵 전수 → 대제자 → 장문절기
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  // 1. 사부 로드맵: 정·사 문파마다 사부 2~3명, 병기가 다르고 등급이 하승→중승→상승→절정. 마교·군부는 없음
  const r0=await p.evaluate(()=>{const M=SABU.bukhae,o={n:M.length,cls:M.map(m=>m.cls),gr:M.map(m=>m.path.map(id=>ARTS[id].grade).join('')),names:M.map(m=>m.path.map(id=>ARTS[id].n).join('>')),
    cm:sabuOn(SECTS.cheonma),gb:sabuOn(SECTS.geumgun),small:SABU.hyeongsan.length,sg:SABU.hyeongsan[0].path.map(id=>ARTS[id].grade).join(''),hi:ARTS[SECTS.bukhae.arts.find(a=>a.hi).id].grade,
    uniq:new Set(Object.values(SABU).flatMap(M=>M.flatMap(m=>m.path))).size===Object.values(SABU).flatMap(M=>M.flatMap(m=>m.path)).length,
    st:SABU.bukhae.some(m=>m.path.includes(SECTS.bukhae.arts.find(a=>a.n==='빙백장').id))};return o});
  console.log(r0.names.join(' | '));
  ok(`북해빙궁 사부 3명 (${r0.cls}), 등급 ${r0.gr}`,r0.n===3&&new Set(r0.cls).size===3&&r0.gr.every(g=>g==='0123'));
  ok(`원래 무공(빙백장)도 로드맵에 쓰임, 무공이 겹치지 않음`,r0.st&&r0.uniq);
  ok(`소문파 사부 ${r0.small}명 · 상승까지 (${r0.sg}), 마교·군부는 사부 없음(군부는 부대)`,r0.small===2&&r0.sg==='012'&&!r0.cm&&!r0.gb);
  ok(`중견문파 장문절기는 절정 (${r0.hi})`,r0.hi===3);
  // 2. 가입하면 입문 서열이 생기고 문파 창에 카드
  const r1=await p.evaluate(()=>{const s=SECTS.bukhae;enterRegion(hqId(s),20.5,30.5);P.reg=REG;mobs=[];P.realm=0;P.age=16;P.fame=60;P.evil=0;P.side='사';const n=hqNpc(hqId(s));openNpc(n);act('sjoin:bukhae');
    openNpc(n);const h=$('wbody').innerHTML;return{sect:P.sect,st:P.sabu&&P.sabu.st,pos:sbPos()+1,card:h.includes('사부와 로드맵'),btn:h.includes('data-act="sbduel"'),track:sabuTrackHtml().includes('서열')}});
  ok(`가입 → 입문 서열 ${r1.pos}위 (삼류는 4위), 카드·비무 단추·임무 줄`,r1.sect==='bukhae'&&r1.st==='rank'&&r1.pos===4&&r1.card&&r1.btn&&r1.track);
  // 3. 서열 비무: 이기면 한 칸씩, 1위가 되면 사부 고르기
  const r2=await p.evaluate(()=>{const n=hqNpc(hqId(SECTS.bukhae)),o=[];for(let i=0;i<3;i++){openNpc(n);act('sbduel');const e=mobs.find(m=>m.sbFoe);o.push(!!e&&G.duel);if(e)damage(e,1e8,0,0,P)}
    openNpc(n);return{o,pos:sbPos()+1,st:P.sabu.st,duel:G.duel,pick:$('wbody').innerHTML.includes('sbpick:')}});
  ok(`서열 비무 세 번 이겨 1위 → 사부 고르기 (${r2.st})`,r2.o.every(Boolean)&&r2.pos===1&&r2.st==='pick'&&!r2.duel&&r2.pick);
  // 4. 사부를 고르면 로드맵 첫 무공. 숙련·직위가 닿으면 다음 무공
  const r3=await p.evaluate(()=>{const n=hqNpc(hqId(SECTS.bukhae));P.wis=20;openNpc(n);const M=SABU.bukhae.find(m=>m.cls==='검');act('sbpick:'+M.k);
    const o={st:P.sabu.st,m:sbMy()&&sbMy().cls,a0:!!P.arts[M.path[0]],step:P.sabu.step,why0:sbNextWhy()};
    A(M.path[0]).p=70;o.why1=sbNextWhy();openNpc(n);act('sbnext');o.a1=!!P.arts[M.path[1]];
    A(M.path[1]).p=70;o.why2=sbNextWhy();P.srank.bukhae=1;P.realm=2;openNpc(n);act('sbnext');o.a2=!!P.arts[M.path[2]];return o});
  ok(`검 사부 제자 · 하승 무공 받음, 다음은 숙련 조건 ("${r3.why0}")`,r3.st==='disc'&&r3.m==='검'&&r3.a0&&r3.step===1&&/숙련/.test(r3.why0));
  ok(`숙련 닿으면 중승 무공, 상승은 직위 ("${r3.why2}") 뒤`,r3.why1===''&&r3.a1&&/이상/.test(r3.why2)&&r3.a2);
  // 5. 장문절기는 대제자만: 비급 단추 잠김 → 선발 비무 이기면 전수
  const r4=await p.evaluate(()=>{const s=SECTS.bukhae,n=hqNpc(hqId(s)),hi=s.arts.find(a=>a.hi);P.merit.bukhae=9999;openNpc(n);
    const btn=$('wbody').querySelector(`[data-act^="mbuy:${hi.id}:"]`),o={lock:btn&&btn.disabled&&/대제자만/.test(btn.textContent),why:djWhy()};
    P.srank.bukhae=2;o.why2=djWhy();openNpc(n);act('sbdj');const e=mobs.find(m=>m.sbFoe);o.duel=!!e;duelEnd(false);o.fail=!P.sabu.dj&&/달 뒤/.test(djWhy());
    P.sabu.djCool=0;openNpc(n);act('sbdj');damage(mobs.find(m=>m.sbFoe),1e8,0,0,P);o.dj=isDaeje('bukhae');o.hi=!!P.arts[hi.id];openNpc(n);
    const b2=$('wbody').querySelector(`[data-act^="mbuy:${hi.id}:"]`);o.open=b2&&!/대제자만/.test(b2.textContent);return o});
  ok(`장문절기 비급은 대제자만 (잠김), 직위 모자람 ("${r4.why}")`,r4.lock&&/이상/.test(r4.why));
  ok(`대제자 선발: 지면 한동안 못 청함, 이기면 대제자 + 장문절기 전수`,r4.why2===''&&r4.duel&&r4.fail&&r4.dj&&r4.hi&&r4.open);
  await p.screenshot({path:shot('t151_sabu')});
  // 6. 지명: 2위 · 사양하면 공통 길, 공통 길은 직위가 오르면 늦은 지명
  const r5=await p.evaluate(()=>{const s=SECTS.hwasan;act('sleave');P.sect=null;P.side='정';P.realm=1;enterRegion(hqId(s),20.5,30.5);P.reg=REG;mobs=[];const n=hqNpc(hqId(s));openNpc(n);act('sjoin:hwasan');
    const o={pos:sbPos()+1};openNpc(n);act('sbstop');o.st=P.sabu.st;o.off=P.sabu.off;openNpc(n);act('sbno');o.st2=P.sabu.st;P.srank.hwasan=2;runHooks('tick',.1);o.st3=P.sabu.st;o.late=P.sabu.late;return o});
  ok(`이류는 3위 시작, 굳히면 지명 (${r5.st}) → 사양하면 공통 길 → 직위 오르면 늦은 지명`,r5.pos===3&&r5.st==='named'&&r5.off>=0&&r5.st2==='common'&&r5.st3==='named'&&r5.late===1);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

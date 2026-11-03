// 마교 입마곡 · 소교주 · 장로 사부 (v236, 사용자 2026-11-03)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(600);
  const r0=await p.evaluate(()=>({n:SABU.cheonma.length,gr:SABU.cheonma.map(m=>m.path.map(id=>ARTS[id].grade).join('')),own:SABU.cheonma.every(m=>m.path.every(id=>ARTS[id].sabu))}));
  ok(`장로원 장로 사부 ${r0.n}명, 하승→절정 (${r0.gr}), 당 무공은 안 씀`,r0.n===3&&r0.gr.every(g=>g==='0123')&&r0.own);
  // 1. 입교 → 입마곡
  await p.evaluate(()=>{enterRegion('hq_cheonma',20.5,20.5);P.reg=REG;mobs=[];P.realm=2;P.age=25;P.fame=120;P.evil=0;P.side='사';P.st.end=10;openNpc(hqNpc('hq_cheonma'));act('sjoin:cheonma')});
  await p.waitForFunction(()=>REG==='cv_imagok',null,{timeout:8000});
  const r1=await p.evaluate(()=>({sect:P.sect,st:P.imk.st,stage:P.imk.stage,tz:P.imk.tz,track:imkTrackHtml().includes('마기 연못')}));
  ok(`입교하면 입마곡에 갇힘 (체질 ${r1.tz}), 임무 줄`,r1.sect==='cheonma'&&r1.st==='trial'&&r1.stage==='pool'&&r1.tz>=.7&&r1.tz<=1.35&&r1.track);
  // 2. 연못 밖에서는 시간이 안 감, 연못에서 생명이 깎이며 버팀
  const r2=await p.evaluate(()=>{const h0=P.hp;for(let i=0;i<10;i++)runHooks('tick',.1);const o={t0:P.imk.t,h0,h1:P.hp};const r=imkRooms()[1];P.x=r.x+.5;P.y=r.y+.5;P.maxHp=99999;P.hp=99999;
    for(let i=0;i<210;i++)runHooks('tick',.1);o.t=P.imk.t;o.lost=99999-P.hp;o.stage=P.imk.stage;o.rivals=mobs.filter(m=>m.imkRival).length;return o});
  ok(`연못 밖은 시간이 안 감, 연못에서 생명이 깎이고 20초 버티면 생사결 (동기 ${r2.rivals}명)`,r2.t0===0&&r2.lost>0&&r2.stage==='rival'&&r2.rivals>=3);
  // 3. 동기 셋을 쓰러뜨리면 마수, 마수를 잡으면 통과·직위
  const r3=await p.evaluate(()=>{for(const e of mobs.filter(m=>m.imkRival).slice(0,3))damage(e,1e9,0,0,P);const o={stage:P.imk.stage,boss:!!mobs.find(m=>m.imkBoss)};
    damage(mobs.find(m=>m.imkBoss),1e9,0,0,P);o.st=P.imk.st;o.score=P.imk.score;o.rank=rankName('cheonma');o.ri=rankIdx('cheonma');return o});
  ok(`생사결 → 마수 → 통과 (점수 ${r3.score} → ${r3.rank})`,r3.stage==='boss'&&r3.boss&&r3.st==='done'&&r3.ri>=0);
  // 4. 교주 독문무공은 소교주만, 쟁탈 세 번 이기면 소교주 + 전수
  const r4=await p.evaluate(()=>{enterRegion('hq_cheonma',20.5,20.5);P.reg=REG;mobs=[];const s=SECTS.cheonma,hi=s.arts.filter(a=>a.hi);const o={jm:jmOk(ARTS[hi[0].id]),why:sgjWhy()};
    P.realm=3;P.mtot.cheonma=500;o.why2=sgjWhy();for(let i=0;i<3;i++){openNpc(hqNpc('hq_cheonma'));act('sgjgo');const e=mobs.find(m=>m.duel);o['d'+i]=!!e;if(e)damage(e,1e9,0,0,P)}
    o.sgj=P.sgj;o.hi=hi.every(a=>!!P.arts[a.id]);o.jm2=jmOk(ARTS[hi[0].id]);return o});
  ok(`소교주 전엔 독문무공 잠김, 입지 모자람 ("${r4.why}")`,!r4.jm&&/이상|입지/.test(r4.why)&&r4.why2==='');
  ok(`소교주 후보 셋을 이기면 소교주 + 교주 독문무공 전수`,r4.d0&&r4.d1&&r4.d2&&r4.sgj===1&&r4.hi&&r4.jm2);
  // 5. 장로 사부: 인연 '사부의 가르침'이면 지명
  const r5=await p.evaluate(()=>{P.wis=20;runHooks('tick',.1);const o={st:P.sabu&&P.sabu.st};P.sabu.late=0;P.sabu.st='common';P.srank.cheonma=0;sectAct('inygo','sabu');o.st2=P.sabu.st;openNpc(hqNpc('hq_cheonma'));act('sbtake');o.hqNo=P.sabu.st==='named';enterRegion('hq_cheonma_6',20.5,30);P.reg=REG;const mn=REGION().npcs.find(n=>n.sfMaster===P.sabu.off);o.mw=!!mn&&walk(Math.floor(mn.x),Math.floor(mn.y));openNpc(mn);act('sbtake');o.st3=P.sabu.st;o.got=!!P.arts[sbMy().path[0]];return o});
  ok(`인연 '사부의 가르침' → 장로 지명 → 교주 창에선 못 받고 장로원의 장로에게 받든다 → 제자, 독문무공 받음 (${r5.st}→${r5.st2}→${r5.st3})`,r5.st2==='named'&&r5.hqNo&&r5.mw&&r5.st3==='disc'&&r5.got);
  // 6. 곡을 버리면 탈락, 한 해 동안 못 들어감
  const r6=await p.evaluate(()=>{P.sect=null;P.sabu=null;P.sgj=0;enterRegion('hq_cheonma',20.5,20.5);openNpc(hqNpc('hq_cheonma'));act('sjoin:cheonma');return new Promise(res=>setTimeout(()=>{const a=REG;enterRegion('hq_cheonma_4',20.5,20.5);res({a,sect:P.sect,st:P.imk.st,jb:joinBlock(SECTS.cheonma)})},700))});
  ok(`곡을 나가면 탈락·하산, 다시 못 들어감 ("${r6.jb}")`,r6.a==='cv_imagok'&&r6.sect===null&&r6.st==='fail'&&/입마곡/.test(r6.jb||''));
  await p.screenshot({path:shot('t153_imagok')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

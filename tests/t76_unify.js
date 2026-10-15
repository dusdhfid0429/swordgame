// 세력별 천하통일 노선 (v114): 사건 선택지는 내 세력 것만 보이고 남의 길은 못 고른다, 홀로 이긴 세력이 힘 70↑·상대 모두 30↓면 천하통일
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 데이터: 사건 10개 모두 pov 넷 + 정·사·마·관 전용 선택 하나씩 + 세력 없는 선택
  const d=await p.evaluate(()=>{const o={n:STORY.EV.length,pov:0,fac:0,neutral:0};for(const e of STORY.EV){if(e.pov&&['정','사','마','관'].every(f=>e.pov[f]))o.pov++;if(['정','사','마','관'].every(f=>e.ch.filter(c=>c.fac===f).length===1))o.fac++;if(e.ch.some(c=>!c.fac))o.neutral++}o.unify=STORY.UNIFY&&STORY.UNIFY.pow;return o});
  ok(`사건 ${d.n}개: 네 관점 ${d.pov} · 세력 전용 선택 ${d.fac} · 중립 선택 ${d.neutral} · UNIFY.pow ${d.unify}`,d.n===10&&d.pov===10&&d.fac===10&&d.neutral===10&&d.unify===70);
  // 2. 정파로 ev1 열림: 카드에 정파의 눈과 정파·중립 선택만, 사파 선택은 숨고 고를 수도 없다
  const c=await p.evaluate(()=>{P.age=20;update(.1);closePanels();openPanel('story');const h=document.getElementById('win').innerHTML;const e=STORY.EV[0];const si=e.ch.findIndex(c=>c.fac==='사'),ji=e.ch.findIndex(c=>c.fac==='정');
    const o={open:P.story.open,pov:h.includes('정파의 눈'),jeong:h.includes(`spick:ev1:${ji}`),sa:h.includes(`spick:ev1:${si}`),neutral:h.includes(`spick:ev1:${e.ch.length-1}`),card:h.includes('천하통일'),line:h.includes(STORY.UNIFY.lines.정.slice(0,10))};
    o.saPick=pickChoice(e,si,false);o.after=P.story.pick.ev1;o.jPick=pickChoice(e,ji,false);o.picked=P.story.pick.ev1;return o});
  ok(`ev1 열림(${c.open}) 정파의 눈 ${c.pov} · 정파 ${c.jeong} 중립 ${c.neutral} 사파 ${c.sa} · 사파 길 고르기 ${c.saPick}(${c.after}) 정파 길 ${c.jPick}(${c.picked}) · 천하통일 카드 ${c.card} 노선 ${c.line}`,
    c.open==='ev1'&&c.pov&&c.jeong&&c.neutral&&!c.sa&&c.saPick===false&&c.after==null&&c.jPick===true&&c.picked===0&&c.card&&c.line);
  // 3. 삼파전에서 정파가 홀로 이기고 힘 70↑, 셋 다 30↓ → 천하통일, 정파인 나는 명성 +100 은자 +1000
  const u=await p.evaluate(()=>{P.quests=[];P.story.pick={};for(const e of STORY.EV)P.story.pick[e.id]=e.ch.length-1;G.W.rel.정사=-30;G.W.rel.사마=-30;G.W.rel.정관=0;setPow('정',65);setPow('사',25);setPow('마',25);setPow('관',25);warStart();
    const o={plan:G.war.plan.n,sides:G.war.plan.sides.length};const ji=G.war.plan.sides.findIndex(s=>s.length===1&&s[0]==='정');G.war.rounds=[{win:ji,sc:[0,0,0],me:'승'},{win:ji,sc:[0,0,0],me:'승'}];G.war.round=2;const f0=P.fame,s0=P.silver;warEnd(true);
    o.won=G.wars[G.wars.length-1].won.join();o.pow=Math.round(G.W.pow.정);o.by=G.unified&&G.unified.by;o.mine=G.unified&&G.unified.mine;o.fame=P.fame-f0;o.silver=P.silver-s0;o.feat=P.feats.some(f=>/천하통일/.test(f));
    closePanels();openPanel('story');o.tag=document.getElementById('win').innerHTML.includes('정파의 천하');return o});
  ok(`${u.plan}(${u.sides}편) 정파 승(${u.won}) 힘 ${u.pow} → 천하통일 ${u.by} 내 세력 ${u.mine} 명성 +${u.fame} 은자 +${u.silver} 업적 ${u.feat} 카드 ${u.tag}`,
    u.sides===3&&u.won==='정'&&u.pow>=70&&u.by==='정'&&u.mine===true&&u.fame===150&&u.silver===1300&&u.feat&&u.tag);
  // 4. 조건 미달(상대 힘 30 초과)이면 통일 없음; 다른 세력이 다음 대전을 이기면 천하는 다시 갈라진다
  const n=await p.evaluate(()=>{P.story.flag.warDone=false;P.quests=[];setPow('정',80);setPow('사',45);setPow('마',25);setPow('관',25);warStart();const si=G.war.plan.sides.findIndex(s=>s.length===1&&s[0]==='사');G.war.rounds=[{win:si,sc:[0,0,0],me:'패'},{win:si,sc:[0,0,0],me:'패'}];G.war.round=2;warEnd(true);
    return{won:G.wars[G.wars.length-1].won.join(),uni:G.unified}});
  ok(`사파 승(${n.won}, 힘 미달) → 천하 갈라짐 ${n.uni===null}`,n.won==='사'&&n.uni===null);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

// v219 단계 1 (개선 계획 3·4절, 동훈님 2026-11-01): 첫 화면·탄생 화면 정리, 왼쪽 위 줄이기, 용어 풀이, 전투 가독성
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>{localStorage.clear();showTitle()});
  // 1. 첫 화면: 그림·큰 단추 하나(빈 칸이면 새 인생)·칩 다섯·조작법은 안쪽
  let r=await p.evaluate(()=>({art:!!box.querySelector('.tart'),big:[...box.querySelectorAll('.tbig .btn')].map(b=>b.dataset.s),chips:box.querySelectorAll('.slotbar .slot').length,help:!box.querySelector('.help')&&!!box.querySelector('[data-s="thelp"]'),h:box.scrollHeight}));
  ok(`첫 화면: 그림 ${r.art}, 큰 단추 ${r.big}, 칸 칩 ${r.chips}, 조작법 안쪽 ${r.help}, 높이 ${r.h}px`,r.art&&r.big.join()==='new'&&r.chips===5&&r.help&&r.h<844);
  await p.click('[data-s="thelp"]');r=await p.evaluate(()=>!!box.querySelector('.help'));await p.click('[data-s="back"]');
  ok(`설정·조작법 화면 ${r}`,r);
  // 2. 탄생 화면: 난이도 접힘, 근골 한 줄 성격
  await p.click('[data-s="new"]');
  r=await p.evaluate(()=>({diff:document.querySelectorAll('[data-s^="diff:"]').length,open:!!document.querySelector('[data-s="diffopen"]'),gg:[...document.querySelectorAll('[data-s^="gg:"] span')].map(s=>s.textContent),num:/\d+ \/ \d+/.test(box.textContent)}));
  ok(`탄생: 난이도 접힘 ${r.open&&!r.diff}, 근골 성격 "${r.gg[0]}", 숫자 줄 없음 ${!r.num}`,r.open&&!r.diff&&r.gg.length>=3&&r.gg.every(t=>/몸/.test(t))&&!r.num);
  r=await p.evaluate(()=>[ggTrait(['a',11,8,7,6]),ggTrait(['b',9,7,9,7]),ggTrait(['c',8,8,8,8])]);
  ok(`근골 성격: ${r.join(' / ')}`,r[0]==='힘이 센 몸 · 한 방이 무겁다'&&r[1].startsWith('힘이 세고 날랜 몸')&&r[2].startsWith('고른 몸'));
  await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 3. 왼쪽 위: 임무는 한 가지만, 기록은 두 줄, '이번 생의 강호'는 화면에 안 뜨고 강호사에
  await p.evaluate(()=>{for(const [n,m] of [['산적 소탕','산적'],['늑대 몰아내기','늑대'],['두목 토벌','산적두목']])P.quests.push({n,kind:'kill',mob:[m],cnt:3,have:0,silver:1,vit:1});qtrackKey='';questTrack();
    for(let i=0;i<5;i++)log('알림 '+i,'info')});await p.waitForTimeout(1200);
  r=await p.evaluate(()=>{const q=$('qtrack'),vis=[...q.children].filter(c=>getComputedStyle(c).display!=='none').length,lg=$('log').getBoundingClientRect(),lp=[...$('log').children].filter(c=>{const b=c.getBoundingClientRect();return b.top>=lg.top-1&&b.bottom<=lg.bottom+1}).length;
    return{vis,more:q.dataset.more,lines:lp,lore:[...$('log').children].some(c=>c.textContent.includes('이번 생의 강호')),hist:logHist.some(l=>l.t.includes('이번 생의 강호'))}});
  ok(`왼쪽 위: 임무 ${r.vis}칸 보임 '${r.more}', 기록 ${r.lines}줄, 강호 알림 화면 ${r.lore} · 기록 ${r.hist}`,r.vis===2&&r.more==='외 2가지 ▸'&&r.lines<=2&&!r.lore&&r.hist);
  await p.evaluate(()=>openPanel('hist'));r=await p.evaluate(()=>$('wbody').textContent.includes('이번 생의 강호'));await p.evaluate(()=>closePanels());
  ok(`강호사 창에 이번 생의 강호 ${r}`,r);
  // 4. 용어 풀이: 인물창의 용어 표시 → 누르면 말풍선 → 무림록 '강호 용어'
  await p.evaluate(()=>openPanel('char'));await p.waitForTimeout(150);
  r=await p.evaluate(()=>({n:document.querySelectorAll('#wbody .term').length,inBtn:document.querySelectorAll('#wbody button .term').length,one:new Set([...document.querySelectorAll('#wbody .term')].map(e=>e.dataset.term)).size===document.querySelectorAll('#wbody .term').length}));
  ok(`인물창 용어 ${r.n}개 표시, 단추 안 ${r.inBtn}, 한 번씩 ${r.one}`,r.n>=8&&r.inBtn===0&&r.one);
  const term=await p.evaluate(()=>document.querySelector('#wbody .term').dataset.term);
  await p.tap('#wbody .term');await p.waitForTimeout(100);
  r=await p.evaluate(t=>({tip:!document.querySelector('.gtip').hidden&&document.querySelector('.gtip').textContent.includes(GLOSS.terms[t].slice(0,8)),saved:!!(G.glos&&G.glos[t]),panel}),term);
  ok(`'${term}' 누르면 풀이 ${r.tip}, 기록 ${r.saved}, 창 그대로 ${r.panel}`,r.tip&&r.saved&&r.panel==='char');
  await p.tap('#wtitle');await p.waitForTimeout(80);r=await p.evaluate(()=>document.querySelector('.gtip').hidden);ok(`다른 곳 누르면 닫힘 ${r}`,r);
  r=await p.evaluate(t=>{closePanels();loreOpen();const tx=$('wbody').textContent;closePanels();return tx.includes('강호 용어')&&tx.includes(GLOSS.terms[t].slice(0,8))},term);
  ok(`무림록 강호 용어에 실림 ${r}`,r);
  r=await p.evaluate(()=>{const d=document.createElement('div');d.innerHTML='<p>절벽 아래 벽에 막혔다</p>';glossMark(d);return [...d.querySelectorAll('.term')].map(e=>e.textContent).join()});
  ok(`한 글자 용어는 낱말 안에서 안 고름: [${r}]`,r==='벽');
  // 5. 전투 가독성: 싸우면 카메라 당김·고리 진하게·이름표 흐리게, 숫자 종류
  r=await p.evaluate(()=>({z:rdZ,f:rdFight,s:S,sb:S_BASE}));
  ok(`싸우기 전 배율 ${r.z} (S ${r.s.toFixed(3)} = 기본 ${r.sb.toFixed(3)})`,r.z===1&&Math.abs(r.s-r.sb)<1e-6);
  await p.evaluate(()=>{P.maxHp=P.hp=99999;const m=mkMob('산적',P.x+1.2,P.y+.6);m.aggro=true;m.hp=m.maxHp=99999;mobs.push(m);P.target=m});
  await p.waitForTimeout(1500);
  r=await p.evaluate(()=>({z:rdZ,f:rdFight,s:S,sb:S_BASE,w:W,vw:VW_PX,dim:nameDim(),fight:fightOn(),zt:GD.READ.zoom.fight,hold:GD.READ.fight.hold}));const HOLD=r.hold;
  ok(`싸움: 배율 ${r.z.toFixed(3)} (목표 ${r.zt}), 싸움 정도 ${r.f.toFixed(2)}, W×S = 화면 폭 ${Math.round(r.w*r.s)}/${Math.round(r.vw)}, 이름표 ${r.dim.toFixed(2)}`,
    Math.abs(r.z-r.zt)<.01&&r.f>.9&&Math.abs(r.w*r.s-r.vw)<1&&r.dim<.5&&r.fight);
  r=await p.evaluate(()=>{texts=[];const m=mobs[mobs.length-1];damage(m,10,0,0,P,false);damage(m,30,0,0,P,true);damage(m,5,0,0,{x:0,y:0,d:{},kind:'x'},false);P.inv=0;hurtP(5,{atk:5,d:{},x:P.x+1,y:P.y,hm:-999});return texts.map(t=>t.k+':'+t.t)});
  ok(`피해 숫자 종류: ${r.join(' ')}`,r.includes('out:10')&&r.includes('crit:30!')&&r.includes('far:5')&&r.some(t=>t.startsWith('in:')||t.startsWith('undefined:회피')));
  await p.screenshot({path:__dirname+'/shots/t139_fight.png'});
  await p.evaluate(()=>{for(const m of mobs)m.hp=0;mobs=[];P.target=null;P.lastHit=99;P.lastAtk=-99});await p.waitForTimeout(HOLD*1000+3000);
  r=await p.evaluate(()=>({z:rdZ,f:rdFight}));
  ok(`싸움 끝나면 돌아옴: 배율 ${r.z.toFixed(3)}, 싸움 ${r.f.toFixed(2)}`,r.z===1&&r.f<.05);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

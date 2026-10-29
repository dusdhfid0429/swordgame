// 모바일 전용 화면 (v200, 사용자 2026-10-28: 세로 고정). 늘 터치 조작, PC는 가운데 휴대폰 비율, 창은 아래 시트 + 탭, 가로로 돌리면 안내 막, ?dev만 PC 조작
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  const start=async(p,q)=>{await p.goto(url+q);await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
    await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300)};
  // 세로 휴대폰
  let p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));
  await start(p,'?touch&noacad');
  let r=await p.evaluate(()=>({mob:document.body.classList.contains('mob'),touch:TOUCH,ms:getComputedStyle(document.querySelector('.status .gauge.ms')).display,mini:$('mini').getBoundingClientRect().top,menu:$('tmenu').getBoundingClientRect().top}));
  ok(`세로: 모바일 모드 ${r.mob}, 터치 ${r.touch}, 숙련 막대 접힘 (${r.ms}), 미니맵이 토스 단추 아래 (${Math.round(r.mini)})`,r.mob&&r.touch&&r.ms==='none'&&r.mini>=50);
  await p.tap('#pexp');r=await p.evaluate(()=>({ms:getComputedStyle(document.querySelector('.status .gauge.ms')).display,panel}));
  ok(`▾를 누르면 펼치고 인물 창은 안 열린다 (${r.ms}, ${r.panel})`,r.ms!=='none'&&r.panel==null);
  // v201 여백·탭바: 가장자리에서 16px 이상, 탭바 다섯 칸
  r=await p.evaluate(()=>{const vw=innerWidth,R=s=>document.querySelector(s).getBoundingClientRect(),tb=R('#tbar'),st=R('#stage');
    return{l:Math.min(R('.status').left,R('#tslots').left),r:Math.min(vw-R('#tbtns').right,vw-R('#tquick').right,vw-R('#mini').right),tb:tb.height,tn:$('tbar').children.length,gap:Math.round(tb.top-st.bottom)}});
  ok(`여백 왼쪽 ${Math.round(r.l)}px·오른쪽 ${Math.round(r.r)}px, 탭바 ${r.tn}칸 높이 ${Math.round(r.tb)}px가 무대 아래`,r.l>=16&&r.r>=16&&r.tn===5&&r.tb>=56&&r.gap===0);
  await p.tap('#tb_bag');await p.waitForTimeout(250);
  r=await p.evaluate(()=>({panel,on:$('tb_bag').classList.contains('on')}));
  ok(`행낭 탭 → 행낭 창 (${r.panel}), 탭 불 켜짐`,r.panel==='bag'&&r.on);
  await p.tap('#tb_bag');await p.waitForTimeout(150);ok('같은 탭을 다시 누르면 닫힌다',await p.evaluate(()=>panel===null&&$('win').hidden));
  await p.tap('#tmenu');await p.waitForTimeout(400);
  r=await p.evaluate(()=>{const w=$('win').getBoundingClientRect(),st=$('stage').getBoundingClientRect(),bs=[...$('wbody').querySelectorAll('.btn')].filter(e=>e.offsetParent),g=[...document.querySelectorAll('#wbody .mbtn b')].map(e=>e.textContent);
    return{pc:$('wbody').textContent.includes('PC 조작'),top:Math.round(w.top-st.top),bot:Math.round(st.bottom-w.bottom),w:Math.round(w.width),sw:Math.round(st.width),minH:Math.min(...bs.map(e=>e.getBoundingClientRect().height)),g}});
  ok(`더보기: PC 조작 단추 없음, 탭에 있는 창은 빼고 (${r.g.join('·')}), 탭바 위를 꽉 채운 페이지 (위 ${r.top}·아래 ${r.bot}, 폭 ${r.w}/${r.sw}), 단추 높이 ${Math.round(r.minH)}px`,
    !r.pc&&!r.g.includes('행낭')&&r.g.includes('수련')&&r.top===0&&r.bot===0&&r.w===r.sw&&r.minH>=40);
  r=await p.evaluate(()=>{closePanels();const n=npcsHere()[0];openPanel('npc',n);const w=$('win').getBoundingClientRect(),st=$('stage').getBoundingClientRect();const o={sheet:$('win').classList.contains('sheet'),top:w.top-st.top,h:st.height};closePanels();return o});
  ok(`사람과 대화는 아래 시트 (위 ${Math.round(r.top)}px)`,r.sheet&&r.top>r.h*.3);
  await p.evaluate(()=>openPanel('arts'));await p.waitForTimeout(100);
  r=await p.evaluate(()=>({tabs:[...document.querySelectorAll('.wtab')].map(e=>e.textContent),key:[...document.querySelectorAll('.forms .key')].some(e=>e.offsetParent),sim:$('wbody').textContent.includes('혈라공')}));
  ok(`무공 창 탭 ${r.tabs.join('/')}, 단축키 표시 숨김, 첫 탭엔 심법 없음`,r.tabs.length===2&&!r.key&&!r.sim);
  await p.tap('.wtab:nth-child(2)');r=await p.evaluate(()=>({sim:$('wbody').textContent.includes('혈라공'),on:document.querySelector('.wtab.on').textContent,panel}));
  ok(`둘째 탭을 누르면 심법·보법 (${r.on})`,r.sim&&r.on==='심법·보법'&&r.panel==='arts');
  // v202 공격 방식: 더보기 설정에서 '멈추면 자동 공격'으로 바꾸면 공격 단추가 숨고 필살이 그 자리로, 멈춰 서면 가까운 적을 친다
  await p.evaluate(()=>closePanels());await p.tap('#tmenu');await p.waitForTimeout(200);
  r=await p.evaluate(()=>{const b=document.querySelector('[data-act="atkm:auto"]'),c=document.querySelector('[data-act="atkm:btn"]');return{has:!!b&&c.classList.contains('pri')&&!b.classList.contains('pri'),txt:c&&c.textContent}});
  ok(`더보기 설정에 공격 방식 단추 (${r.txt})`,r.has);
  await p.tap('[data-act="atkm:auto"]');await p.waitForTimeout(150);
  r=await p.evaluate(()=>({auto:atkAuto,st:STORE.get('ganghoyunhoe-atk'),atk:getComputedStyle($('t_atk')).display,ult:Math.round($('t_ult').getBoundingClientRect().width),lab:document.querySelector('[data-act="atkm:auto"]').classList.contains('pri')}));
  ok(`자동으로 바꾸면 기록되고(${r.st}) 공격 단추 숨김(${r.atk}), 필살이 커짐(${r.ult}px), 고른 쪽 불 켜짐`,r.auto&&r.st==='auto'&&r.atk==='none'&&r.ult>=70&&r.lab);
  await p.evaluate(()=>closePanels());
  r=await p.evaluate(async()=>{const e=mkMob('산적',P.x+2,P.y,{hp:1e6,atk:0});mobs.push(e);P.target=null;P.path=null;P.goal=null;P.talk=null;P.medit=false;
    await new Promise(r=>setTimeout(r,400));const a=P.target===e;
    joy.on=true;joy.gx=-1;joy.gy=0;await new Promise(r=>setTimeout(r,300));const b=P.target==null;joy.on=false;joy.gx=0;
    return{a,b}});
  ok(`멈춰 서면 가까운 적을 친다 (${r.a}), 조이스틱으로 걸으면 싸움에서 빠진다 (${r.b})`,r.a&&r.b);
  await p.evaluate(()=>{act('atkm:btn')});
  r=await p.evaluate(()=>({auto:atkAuto,st:STORE.get('ganghoyunhoe-atk'),atk:getComputedStyle($('t_atk')).display}));
  ok(`단추로 되돌리면 공격 단추가 다시 보인다 (${r.atk})`,!r.auto&&r.st==='btn'&&r.atk!=='none');
  await p.evaluate(()=>closePanels());
  // 머리줄을 아래로 끌면 닫힌다
  const h=await p.evaluate(()=>{const e=document.querySelector('#win .whead').getBoundingClientRect();return{x:e.left+40,y:e.top+20}});
  await p.evaluate(({x,y})=>{const t=document.querySelector('#win .whead'),o={bubbles:true,pointerId:1,pointerType:'touch',clientX:x};
    t.dispatchEvent(new PointerEvent('pointerdown',{...o,clientY:y}));t.dispatchEvent(new PointerEvent('pointerup',{...o,clientY:y+120}))},h);
  ok('머리줄을 아래로 끌면 창이 닫힌다',await p.evaluate(()=>$('win').hidden&&!paused));
  await p.evaluate(()=>openPanel('char'));r=await p.evaluate(()=>{const a=gameBack(),b=gameBack();return{a,b,hid:$('win').hidden}});
  ok(`뒤로 가기: 창을 닫고(${r.a}) 더 닫을 게 없으면 false (${r.b})`,r.a&&!r.b&&r.hid);
  await p.close();
  // 가로로 돌린 휴대폰: 세로 안내 막과 멈춤
  p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto(url+'?touch&noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  r=await p.evaluate(()=>{playing=true;paused=false;rotCheck();return{rot:!$('rot').hidden,paused}});
  ok(`가로 휴대폰: 세로로 세워 달라는 막 (${r.rot}), 멈춤 (${r.paused})`,r.rot&&r.paused);
  await p.close();
  // PC: 가운데 휴대폰 비율
  p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await start(p,'?touch&noacad');
  r=await p.evaluate(()=>{const a=$('app').getBoundingClientRect();return{w:a.width,l:a.left,rot:!$('rot').hidden,touch:TOUCH}});
  ok(`PC: 폭 ${Math.round(r.w)}px 가운데 (${Math.round(r.l)}), 안내 막 없음, 터치 조작`,r.w<=720*9/19+2&&Math.abs(r.l-(1280-r.w)/2)<2&&!r.rot&&r.touch);
  await p.close();
  // ?dev: 예전 PC 조작
  p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto(url+'?dev');await p.waitForFunction(()=>typeof loadRegion==='function');
  r=await p.evaluate(()=>({mob:document.body.classList.contains('mob'),touch:TOUCH,w:$('app').getBoundingClientRect().width}));
  ok(`?dev: PC 조작·전체 폭 (mob ${r.mob}, touch ${r.touch}, 폭 ${r.w})`,!r.mob&&!r.touch&&r.w===1280);
  await p.close();
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

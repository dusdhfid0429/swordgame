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
  let r=await p.evaluate(()=>({mob:document.body.classList.contains('mob'),touch:TOUCH,ms:getComputedStyle(document.querySelector('.status .gauge.ms')).display,mini:$('mini').getBoundingClientRect().top,st:document.querySelector('.status').getBoundingClientRect().top,menu:$('tmenu').getBoundingClientRect().top}));
  ok(`세로: 모바일 모드 ${r.mob}, 터치 ${r.touch}, 숙련 막대 접힘 (${r.ms}), 미니맵 위가 상태 칸과 같은 높이 (${Math.round(r.mini)}/${Math.round(r.st)})`,r.mob&&r.touch&&r.ms==='none'&&Math.abs(r.mini-r.st)<1);
  await p.tap('#pexp');r=await p.evaluate(()=>({ms:getComputedStyle(document.querySelector('.status .gauge.ms')).display,panel}));
  ok(`▾를 누르면 펼치고 인물 창은 안 열린다 (${r.ms}, ${r.panel})`,r.ms!=='none'&&r.panel==null);
  // v201 여백·탭바: 가장자리에서 16px 이상, 탭바 다섯 칸
  r=await p.evaluate(()=>{const vw=innerWidth,R=s=>document.querySelector(s).getBoundingClientRect(),tb=R('#tbar'),st=R('#stage');
    return{l:Math.min(R('.status').left,R('#tslots').left),r:Math.min(vw-R('#tbtns').right,vw-R('#tquick').right,vw-R('#mini').right),tb:tb.height,tn:[...$('tbar').querySelectorAll('.tbi')].filter(e=>e.offsetParent).length,nx:!!$('tnext').offsetParent,gap:Math.round(tb.top-st.bottom)}});
  ok(`여백 왼쪽 ${Math.round(r.l)}px·오른쪽 ${Math.round(r.r)}px, 탭바 ${r.tn}칸+▸ 높이 ${Math.round(r.tb)}px가 무대 아래`,r.l>=16&&r.r>=16&&r.tn===5&&r.nx&&r.tb>=44&&r.gap===0);
  // v204 활력 막대: 탭바 윗단, 미니맵 아래에는 은자만
  r=await p.evaluate(async()=>{P.vit=Math.round(maxVit()/2);await new Promise(r=>setTimeout(r,500));const v=$('tvit').getBoundingClientRect(),tb=$('tbar').getBoundingClientRect(),i=qc($('tvit'),'i').getBoundingClientRect();
    return{t:$('tvit').textContent,cur:$('tcur').textContent,top:Math.round(v.top-tb.top),h:v.height,w:Math.round(v.width),tw:Math.round(tb.width),k:i.width/v.width}});
  ok(`활력 막대가 탭바 윗단 (${r.t}, 위 ${r.top}, 두께 ${r.h}px, 폭 ${r.w}/${r.tw}, 채움 ${r.k.toFixed(2)}), 미니맵 아래 '${r.cur}'`,r.t.startsWith('활력')&&r.top<=1&&r.h<=4&&r.w===r.tw&&Math.abs(r.k-.5)<.05&&!r.cur.includes('활력'));
  await p.tap('#tb_bag');await p.waitForTimeout(250);
  r=await p.evaluate(()=>({panel,on:$('tb_bag').classList.contains('on')}));
  ok(`행낭 탭 → 행낭 창 (${r.panel}), 탭 불 켜짐`,r.panel==='bag'&&r.on);
  await p.tap('#tb_bag');await p.waitForTimeout(150);ok('같은 탭을 다시 누르면 닫힌다',await p.evaluate(()=>panel===null&&$('win').hidden));
  // v205 두 쪽 탭바: ▸로 둘째 쪽(동료·생활·정세·강호사·지도·설정), ◂로 돌아오고, 옆으로 밀어도 넘어간다
  await p.tap('#tnext');await p.waitForTimeout(250);
  r=await p.evaluate(()=>({t:[...$('tbar').querySelectorAll('.tbi')].filter(e=>e.offsetParent).map(e=>e.textContent),pv:!!$('tprev').offsetParent,nx:!!$('tnext').offsetParent,pg:tbPage}));
  ok(`▸ → 둘째 쪽 (${r.t.join('·')}), ◂ 보임`,r.pg===1&&r.t.join()==='伴동료,活생활,勢정세,史강호사,圖지도,設설정'&&r.pv&&!r.nx);
  await p.tap('#tb_story');await p.waitForTimeout(200);ok('둘째 쪽 정세 탭 → 정세 창',await p.evaluate(()=>panel==='story'&&$('tb_story').classList.contains('on')));
  await p.evaluate(()=>closePanels());await p.tap('#tprev');await p.waitForTimeout(250);ok('◂ → 첫 쪽',await p.evaluate(()=>tbPage===0&&!!$('tb_bag').offsetParent&&!$('tb_story').offsetParent));
  r=await p.evaluate(()=>{const t=$('tbar'),b=$('tb_arts').getBoundingClientRect(),y=b.top+b.height/2,o={bubbles:true,pointerId:5,pointerType:'touch',clientY:y};
    t.dispatchEvent(new PointerEvent('pointerdown',{...o,clientX:300}));$('tb_arts').dispatchEvent(new PointerEvent('pointerup',{...o,clientX:120}));$('tb_arts').click();return{pg:tbPage,panel}});
  ok(`탭바를 왼쪽으로 밀면 둘째 쪽, 밀 때 닿은 탭은 안 열림 (${r.panel})`,r.pg===1&&r.panel==null);
  await p.tap('#tmenu');await p.waitForTimeout(400);
  r=await p.evaluate(()=>{const w=$('win').getBoundingClientRect(),st=$('stage').getBoundingClientRect(),bs=[...$('wbody').querySelectorAll('.btn')].filter(e=>e.offsetParent),g=[...document.querySelectorAll('#wbody .mbtn b')].map(e=>e.textContent);
    return{pc:$('wbody').textContent.includes('PC 조작'),top:Math.round(w.top-st.top),bot:Math.round(st.bottom-w.bottom),w:Math.round(w.width),sw:Math.round(st.width),minH:Math.min(...bs.map(e=>e.getBoundingClientRect().height)),g,ti:$('wtitle').textContent}});
  ok(`설정: PC 조작 단추 없음, 창 목록 없음 (${r.g.length}), 제목 ${r.ti}, 탭바 위를 꽉 채운 페이지 (위 ${r.top}·아래 ${r.bot}, 폭 ${r.w}/${r.sw}), 단추 높이 ${Math.round(r.minH)}px`,
    !r.pc&&r.g.length===0&&r.ti.startsWith('설정')&&r.top===0&&r.bot===0&&r.w===r.sw&&r.minH>=40);
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
  ok(`자동으로 바꾸면 기록되고(${r.st}) 공격 단추 숨김(${r.atk}), 필살이 커짐(${r.ult}px), 고른 쪽 불 켜짐`,r.auto&&r.st==='auto'&&r.atk==='none'&&r.ult>=56&&r.lab);
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
  // v204 수련 탭: 누르면 수련 띠가 열리고 탭에 불, 다시 누르면 닫힌다
  await p.evaluate(()=>{closePanels();tbSet(0)});await p.tap('#tb_train');await p.waitForTimeout(150);
  r=await p.evaluate(()=>({o:trnOpen,on:$('tb_train').classList.contains('on'),bar:getComputedStyle($('tbar')).display}));
  ok(`수련 탭 → 수련 창 (${r.o}), 탭 불 (${r.on}), 탭바 그대로 (${r.bar})`,r.o&&r.on&&r.bar!=='none');
  await p.tap('#tb_train');await p.waitForTimeout(150);ok('수련 탭을 다시 누르면 닫힌다',await p.evaluate(()=>!trnOpen));
  // v204 임무 줄 접기: ◂ 단추, 오른쪽→왼쪽으로 밀기, 손잡이로 다시 펴기, 기억
  r=await p.evaluate(async()=>{P.quests=[{...QUESTS[0]}];qtrackKey='';questTrack();await new Promise(r=>setTimeout(r,50));
    const q=$('qtrack'),f=$('qfold');return{vis:!q.hidden&&!!f.offsetParent,fr:Math.round(f.getBoundingClientRect().right),qr:Math.round(q.getBoundingClientRect().right)}});
  ok(`임무 줄 오른쪽 끝에 접기 단추 (${r.fr}/${r.qr})`,r.vis&&Math.abs(r.fr-r.qr)<=2);
  await p.tap('#qfold');await p.waitForFunction(()=>$('qtrack').getBoundingClientRect().right<=1,null,{timeout:3000}).catch(()=>{});
  r=await p.evaluate(()=>{const q=$('qtrack').getBoundingClientRect(),f=$('qfold').getBoundingClientRect();return{on:document.body.classList.contains('qfolded'),qr:q.right,fl:f.left,st:STORE.get('ganghoyunhoe-qfold'),panel}});
  ok(`접으면 임무 줄이 왼쪽 밖으로 (오른쪽 끝 ${Math.round(r.qr)}), 손잡이는 가장자리 (${Math.round(r.fl)}), 기억 ${r.st}, 창은 안 열림`,r.on&&r.qr<=1&&r.fl<=1&&r.st==='1'&&r.panel==null);
  await p.tap('#qfold');await p.waitForFunction(()=>$('qtrack').getBoundingClientRect().left>=15,null,{timeout:3000}).catch(()=>{});
  r=await p.evaluate(()=>({on:document.body.classList.contains('qfolded'),l:$('qtrack').getBoundingClientRect().left}));
  ok(`손잡이를 누르면 다시 펴진다 (${Math.round(r.l)})`,!r.on&&r.l>=15);
  r=await p.evaluate(()=>{const q=$('qtrack'),b=q.getBoundingClientRect(),y=b.top+b.height/2,o={bubbles:true,pointerId:3,pointerType:'touch',clientY:y};
    q.dispatchEvent(new PointerEvent('pointerdown',{...o,clientX:b.right-20}));q.dispatchEvent(new PointerEvent('pointerup',{...o,clientX:b.left+10}));q.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return{on:document.body.classList.contains('qfolded'),panel}});
  ok(`임무 줄을 오른쪽에서 왼쪽으로 밀면 접히고 임무 창은 안 열린다 (${r.panel})`,r.on&&r.panel==null);
  await p.evaluate(()=>{$('qfold').click();P.quests=[];qtrackKey='';questTrack()});
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

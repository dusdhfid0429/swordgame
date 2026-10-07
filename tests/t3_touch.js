// 휴대폰 화면에서 터치 조작을 자동으로 확인한다: 조이스틱 이동, 공격 버튼, 상황 버튼, 메뉴, 가로 화면.
const {chromium}=require(process.env.PWPATH||'playwright');
require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  p.on('dialog',d=>d.accept('테스트'));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(2500);
  await p.evaluate(()=>localStorage.clear());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  ok('touch mode on by default',await p.evaluate(()=>TOUCH&&document.body.classList.contains('touch')));
  await p.screenshot({path:shot('m_title')});
  await p.tap('[data-s="new"]');await p.waitForTimeout(200);await p.screenshot({path:shot('m_create')});
  await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(800);
  ok('bottom panel hidden',await p.evaluate(()=>getComputedStyle(document.querySelector('.panel')).display==='none'));
  await p.evaluate(()=>{readBook(P.bag.find(i=>i.slot==='book'));P.vit+=3000});
  await p.screenshot({path:shot('m_town')});
  // 조이스틱: 왼쪽 아래를 눌러 오른쪽 위로 끈다
  const before=await p.evaluate(()=>({x:P.x,y:P.y}));
  await p.mouse.move(90,700);await p.mouse.down();await p.mouse.move(130,660,{steps:5});await p.waitForTimeout(250);
  await p.screenshot({path:shot('m_joy')});
  await p.waitForTimeout(700);await p.mouse.up();
  const after=await p.evaluate(()=>({x:P.x,y:P.y,joy:joy.on}));
  const dx=after.x-before.x,dy=after.y-before.y;
  // 화면 오른쪽 위로 45도 = 격자 (-0.32, -0.95) 방향
  ok(`joystick moves up-right (dx ${dx.toFixed(2)}, dy ${dy.toFixed(2)}) and stops`,dy<-1&&Math.abs(dx/dy-1/3)<.15&&!after.joy);
  // 상황 버튼: 사람 곁에서는 '대화'
  const npc=await p.evaluate(()=>{const n=NPCS.find(n=>!n.board);P.x=n.x+.8;P.y=n.y+.3;P.path=null;return n.n});
  await p.waitForTimeout(400);
  const ctx=await p.evaluate(()=>!$('t_ctx').hidden&&$('t_ctx').textContent.trim());
  ok(`context button says 대화 near ${npc} (${ctx})`,ctx==='대화');
  await p.tap('#t_ctx');await p.waitForTimeout(200);
  ok('context button opens NPC window',await p.evaluate(()=>panel==='npc'));
  await p.screenshot({path:shot('m_npc')});
  await p.tap('#wx');
  // 공격: 산채로 옮겨 버튼을 누르고 있으면 계속 싸운다
  await p.evaluate(()=>{P.x=29.5;P.y=21.5;P.path=null;P.hp=P.maxHp=5000;P.qi=P.maxQi});
  await p.waitForTimeout(300);
  const box=await p.locator('#t_atk').boundingBox();
  const kills0=await p.evaluate(()=>mobs.filter(m=>m.hp<=0).length+(P.kills||0));
  await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();
  await p.waitForTimeout(1200);await p.screenshot({path:shot('m_fight')});
  const tgt=await p.evaluate(()=>P.target&&P.target.name);
  await p.waitForTimeout(5000);await p.mouse.up();
  const r=await p.evaluate(()=>({mode:P.mode,chain:P.chain.n,hp:P.hp}));
  ok(`attack button acquires target (${tgt}) in auto mode`,!!tgt&&r.mode==='auto');
  // 메뉴
  await p.tap('#tmenu');await p.waitForTimeout(200);
  ok('menu opens',await p.evaluate(()=>panel==='menu'));
  await p.screenshot({path:shot('m_menu')});
  await p.tap('[data-act="open:char"]');await p.waitForTimeout(200);
  ok('menu → 인물',await p.evaluate(()=>panel==='char'));
  await p.screenshot({path:shot('m_char')});
  await p.tap('#wx');
  // 짧게 톡: 땅을 치면 그리로 걷는다 (조이스틱 영역 안에서도)
  await p.evaluate(()=>{P.x=20.5;P.y=20.5;P.target=null;P.path=null});await p.waitForTimeout(200);
  await p.tap('#joyz',{position:{x:120,y:150}});await p.waitForTimeout(100);
  ok('short tap in joystick area walks there',await p.evaluate(()=>!!(P.path&&P.path.length)));
  // 가로 화면
  await p.setViewportSize({width:844,height:390});await p.waitForTimeout(500);
  await p.screenshot({path:shot('m_land')});
  // PC 조작으로 되돌리기
  await p.evaluate(()=>setTouch(false));await p.waitForTimeout(200);
  ok('switch back to PC layout',await p.evaluate(()=>getComputedStyle(document.querySelector('.panel')).display!=='none'&&document.querySelector('.panel').contains(logEl)));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');
  await b.close();
})();

// 이펙트 뷰어 실시간 수정 (src/fxview_ai.js): 가짜 Claude(sample)가 도구로 함수·데이터를 바꿔 끼우고,
// 오류 나는 수정은 저절로 되돌리고, 되돌리기·다시 적용·채택(db)·다시 열 때 복원이 되는지 본다
const {chromium}=require(process.env.PWPATH||'playwright');
const MOCK=()=>{
  const store=JSON.parse(sessionStorage.getItem('mockdb')||'{}'),save=()=>sessionStorage.setItem('mockdb',JSON.stringify(store));
  const snap=(id,d)=>({id,exists:!!d,data:()=>d,metadata:{}});
  const db={collection:n=>({add:async d=>{const id='d'+Object.keys(store).length+Date.now();store[id]=JSON.parse(JSON.stringify(d));save();return{id}},
      where:(f,op,v)=>({get:async()=>{const docs=Object.entries(store).filter(([,d])=>d[f]===v).map(([id,d])=>snap(id,d));return{docs,size:docs.length,empty:!docs.length}}})}),
    doc:p=>({delete:async()=>{delete store[p.split('/')[1]];save()}})};
  // 가짜 Claude: window.__script 의 도구 호출을 차례로 하고, 결과를 window.__log 에 남긴다
  const sample=async(input,o)=>{window.__prompt=input;window.__log=[];if(window.__delay)await new Promise(r=>setTimeout(r,window.__delay));for(const[name,arg]of window.__script||[]){const t=o.tools.find(x=>x.name===name);
      try{window.__log.push(['ok',name,await t.execute(arg,{signal:new AbortController().signal})])}catch(e){window.__log.push(['err',name,e.message])}}
    o.onText&&o.onText({text:'바꿨어요.',delta:'바꿨어요.'});return{text:'바꿨어요.',truncated:false}};
  sample.limits=async()=>({maxPromptBytes:262144,tools:{maxCount:16}});
  window.claude={use:async n=>n==='sample'?sample:n==='db'?db:null}};
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const c=await b.newContext({viewport:{width:1280,height:800}});await c.addInitScript(MOCK);const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));
  const url='file://'+require('path').resolve(__dirname,'../dist/fxview.html');
  await p.goto(url);await p.waitForTimeout(1800);
  ok('실시간 수정 칸이 있고 Claude가 연결됨',await p.evaluate(()=>!!document.getElementById('fxai')&&!document.getElementById('fxai_go').disabled&&FXAI.tools));
  ok('파일 줄 되짚기: GL 은 r_exec.js, drawFx 는 r_fx.js',await p.evaluate(()=>FXAI.defFile('GL')==='r_exec.js'&&FXAI.defFile('drawFx')==='r_fx.js'&&FXAI.fileText('r_exec.js').includes('function GL(o,X)')));
  // 충격파 고리를 골라 둔다
  await p.click('#fxv button[data-a="tab:prim"]');await p.click('#fxv button[data-a="prim:2"]');await p.waitForTimeout(100);
  ok('대상 줄에 고른 이펙트',(await p.textContent('#fxai_tg')).includes('충격파'));
  // 1) GL 을 patch, EL_FX 값 하나를 set
  await p.evaluate(()=>{window.__script=[['search_code',{pattern:'^function GL\\('}],['read_value',{path:'GL'}],
    ['patch_function',{name:'GL',find:'function GL(o,X){',replace:'function GL(o,X){o.fxai=1;'}],['set_value',{path:'GD.EL_FX.화.n',value:'불꽃!'}],['replay',{}]]});
  await p.evaluate(()=>window.__delay=3500);await p.fill('#fxai_q','고리에 표시를 달아 줘');await p.click('#fxai_go');await p.waitForTimeout(400);
  const run=await p.evaluate(()=>({card:!!document.querySelector('#fxai .ch.run .stt.run'),q:document.querySelector('#fxai .ch.run .q')?.textContent,toast:document.getElementById('fxai_toast').className.includes('on'),go:document.getElementById('fxai_go').textContent,stop:!document.getElementById('fxai_stop').hidden}));
  await p.waitForTimeout(800);const sec=await p.evaluate(()=>document.querySelector('#fxai .ch.run .sec')?.textContent);
  await p.screenshot({path:__dirname+'/shots/fxai_sending.png'});
  ok('보내자마자 보냄 카드·화면 위 알림·단추 문구·멈춤 단추 '+JSON.stringify(run)+' '+sec,run.card&&run.q==='고리에 표시를 달아 줘'&&run.toast&&run.go.startsWith('Claude가 고치는 중')&&run.stop&&/^[1-9]초$/.test(sec||''));
  await p.evaluate(()=>window.__delay=0);await p.waitForTimeout(300);await p.waitForFunction(()=>document.getElementById('fxai_stop').hidden,null,{timeout:20000});
  const r1=await p.evaluate(()=>({log:__log,prompt:__prompt,ch:FXAI.CH.map(c=>({on:c.on,ops:c.ops.map(o=>o.name||o.path)})),gl:GL.toString().includes('o.fxai=1'),el:EL_FX.화.n}));
  ok('도구가 모두 성공 '+JSON.stringify(r1.log.filter(x=>x[0]!=='ok')),r1.log.every(x=>x[0]==='ok')&&/r_exec\.js:\d+ \[GL\]/.test(r1.log[0][2]));
  ok('요청문에 대상·요청·관련 코드',r1.prompt.includes('충격파')&&r1.prompt.includes('고리에 표시를')&&r1.prompt.includes('=== r_fx.js ==='));
  ok('GL 이 바뀌고 EL_FX(=GD.EL_FX) 값도 바뀜',r1.gl&&r1.el==='불꽃!'&&r1.ch.length===1&&r1.ch[0].ops.join()==='GL,GD.EL_FX.화.n');
  await p.click('#fxv button[data-a="prim:2"]');await p.waitForTimeout(50);
  ok('바뀐 GL 로 재생됨',await p.evaluate(()=>fx.some(f=>f.fxai)));
  // 2) 오류 나는 수정은 되돌림
  await p.evaluate(()=>{window.__script=[['replace_function',{name:'drawGlow2',source:'function drawGlow2(f){throw Error("깨짐")}'}],['patch_function',{name:'GL',find:'없는글',replace:'x'}],['replace_function',{name:'fArc',source:'(X)=>{'}]]});
  await p.fill('#fxai_q','망가뜨려 봐');await p.click('#fxai_go');await p.waitForTimeout(300);await p.waitForFunction(()=>document.getElementById('fxai_stop').hidden,null,{timeout:20000});
  const r2=await p.evaluate(()=>({log:__log,ok:!drawGlow2.toString().includes('깨짐'),n:FXAI.CH.length,fail:!!document.querySelector('#fxai .ch .stt.none'),done:!!document.querySelector('#fxai .ch .stt.done')}));
  ok('오류 수정 셋 다 거절·되돌림 '+r2.log.map(x=>x[0]).join(),r2.log.every(x=>x[0]==='err')&&/되돌렸다/.test(r2.log[0][2])&&r2.ok&&r2.n===2&&r2.fail&&r2.done);
  // 3) 되돌리기 → 다시 적용
  await p.click('#fxai_undo');await p.waitForTimeout(100);
  const u=await p.evaluate(()=>({gl:GL.toString().includes('o.fxai'),el:EL_FX.화.n}));
  ok('되돌리기: GL·데이터 원래대로',!u.gl&&u.el!=='불꽃!');
  await p.click('#fxai button[data-x^="on:"]');await p.waitForTimeout(100);
  ok('다시 적용',await p.evaluate(()=>GL.toString().includes('o.fxai')&&EL_FX.화.n==='불꽃!'));
  // 4) 채택 → 다시 열면 복원
  await p.click('#fxai button[data-x^="keep:"]');await p.waitForTimeout(300);
  const kept=await p.evaluate(()=>{const d=JSON.parse(sessionStorage.getItem('mockdb'));const x=Object.values(d)[0];return x&&x.state==='kept'&&x.ops[0].file==='r_exec.js'&&x.ops[1].file==='data/elfx.json'&&x.ops[0].after.includes('o.fxai')});
  ok('채택: db 에 파일 이름과 함께 남음',kept);
  await p.screenshot({path:__dirname+'/shots/fxai_pc.png'});
  await p.reload();await p.waitForTimeout(2200);
  ok('다시 열면 채택한 수정이 다시 끼워짐',await p.evaluate(()=>GL.toString().includes('o.fxai')&&EL_FX.화.n==='불꽃!'&&FXAI.CH.length===1&&FXAI.CH[0].kept&&FXAI.CH[0].on));
  await p.click('#fxai button[data-x^="off:"]');await p.waitForTimeout(100);
  ok('복원한 수정도 되돌리기 됨',await p.evaluate(()=>!GL.toString().includes('o.fxai')&&EL_FX.화.n!=='불꽃!'));
  // 5) 휴대폰 화면
  const m=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await m.addInitScript(MOCK);const q=await m.newPage();
  q.on('pageerror',e=>errs.push('PE '+e.message));await q.goto(url);await q.waitForTimeout(1800);
  ok('휴대폰: 처음엔 접혀 있음',await q.evaluate(()=>document.getElementById('fxai').classList.contains('shut')));await q.click('#fxai_fold');
  const box=await q.evaluate(()=>{const r=document.getElementById('fxai').getBoundingClientRect(),g=document.getElementById('fxai_go').getBoundingClientRect();return{w:document.documentElement.scrollWidth,go:g.bottom<=innerHeight&&g.height>20}});
  ok('휴대폰: 가로로 넘치지 않고 보내기 단추가 보임',box.w<=390&&box.go);await q.screenshot({path:__dirname+'/shots/fxai_mobile.png'});
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

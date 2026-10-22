// 이펙트 뷰어 (dist/fxview.html): 모든 탭의 단추를 눌러 보고 오류가 없는지, 이펙트가 실제로 생기는지 본다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  for(const vp of[{width:1280,height:760},{width:390,height:844,isMobile:true,hasTouch:true}]){
    const c=await b.newContext({viewport:{width:vp.width,height:vp.height},isMobile:!!vp.isMobile,hasTouch:!!vp.hasTouch});const p=await c.newPage();
    p.on('pageerror',e=>errs.push('PE '+e.message));
    // 좁은 화면은 왼쪽 서랍을 열고 누른다 (재생 단추를 누르면 서랍이 닫힌다)
    const cl=async sel=>{await p.evaluate(()=>{if(FXV.narrow())FXV.drawer('l',true)});if(sel){await p.waitForTimeout(260);await p.click(sel)}};p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
    await p.goto('file://'+require('path').resolve(__dirname,'../dist/fxview.html'));await p.waitForTimeout(1500);
    const st=await p.evaluate(()=>({reg:REG,play:playing,dummies:mobs.filter(m=>m.acadDummy).length,save:STORE.get(SAVE_KEY)}));
    ok(`${vp.width}px: 연무장(${st.reg})에서 시작, 목인장 ${st.dummies}개, 저장 없음`,st.reg==='fxv_arena'&&st.play&&st.dummies===6&&!st.save);
    const cam0=await p.evaluate(()=>({...cam}));let drift=0;
    const tabs=await p.$$eval('#fxv button[data-a^="tab:"]',l=>l.map(x=>x.dataset.a));let n=0,made=0;
    for(const t of tabs){await cl(`#fxv button[data-a="${t}"]`);
      const acts=await p.$$eval('#fxv .body button[data-a]',l=>l.map(x=>x.dataset.a).filter(a=>!a.startsWith('cls:')&&a!=='all'));
      for(const a of acts){await p.evaluate(()=>{fx=[];projs=[];TFX=[];sched=[];P.medit=P.qiTraining=false});
        await cl(`#fxv button[data-a="${a}"]`);await p.waitForTimeout(60);
        const after=await p.evaluate(()=>fx.length+projs.length+TFX.length+(P.medit||P.qiTraining?1:0)+(P.leap?1:0)+sched.length);n++;if(after>0||a==='med:0')made++;else console.log('  변화 없음: '+a);
        drift=Math.max(drift,await p.evaluate(c=>Math.hypot(cam.x-c.x,cam.y-c.y),cam0));await p.waitForTimeout(240)}}
    ok(`${vp.width}px: 재생해도 카메라가 움직이지 않는다 (${drift.toFixed(2)})`,drift<.01);
    ok(`${vp.width}px: 단추 ${n}개 중 ${made}개가 이펙트를 냈다`,n>30&&made===n);
    // 병기마다 첫 무공의 필살기
    await cl('#fxv button[data-a="tab:art"]');let ults=0;
    for(const cls of['검','도','창','봉','권','궁']){await cl(`#fxv button[data-a="cls:${cls}"]`);await cl('#fxv button[data-a="form:ult"]');await p.waitForTimeout(300);ults++}
    ok(`${vp.width}px: 병기 여섯 가지 필살기`,ults===6);
    if(vp.width>500){await cl('#fxv button[data-a="cls:검"]');await cl('#fxv button[data-a="form:ult"]');await p.waitForTimeout(350);await p.screenshot({path:__dirname+'/shots/fxview_pc.png'})}
    else{await cl('#fxv button[data-a="tab:realm"]');await cl(null);await p.selectOption('#fxv select[data-a="realm"]','4');await cl('#fxv button[data-a="flow:0"]');await p.waitForTimeout(150);await p.screenshot({path:__dirname+'/shots/fxview_mobile.png'})}
    await c.close()}
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

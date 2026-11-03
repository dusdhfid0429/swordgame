// v233 (동훈님 2026-11-03): 수련 창이 열리면 카메라가 당겨지고, 주인공이 위 HUD와 수련 창 사이 가운데쯤에 서서 연출이 창에 붙지 않는다. 닫으면 원래대로.
const {chromium}=require(process.env.PWPATH||'playwright');
require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];const ok=(n,v)=>console.log((v?'PASS ':'FAIL ')+n);
  for(const mobile of[true,false]){const tag=mobile?'phone':'pc';
    const c=await b.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1100,height:760}});
    const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad'+(mobile?'&touch':''));await p.waitForTimeout(1500);
    await p.evaluate(()=>localStorage.clear());const tap=s=>mobile?p.tap(s):p.click(s);
    await tap('[data-s="new"]');await tap('[data-s="start"]');await p.waitForTimeout(500);
    await p.evaluate(()=>{P.vit=2000;P.x=27.5;P.y=13.5;P.path=null;mobs=mobs.filter(m=>m.d.villager);spawnTick=()=>{}});await p.waitForTimeout(800);
    const z0=await p.evaluate(()=>rdZ);
    await p.evaluate(()=>openTrain());await p.waitForTimeout(1600);
    const st=await p.evaluate(()=>{const cr=C.getBoundingClientRect(),r=TRN.getBoundingClientRect(),q=toScreen(P.x,P.y),sr=$('pstat').getBoundingClientRect();
      return{z:rdZ,feet:cr.top+q.y*S,head:cr.top+(q.y-READ.train.body*2)*S,top:r.top,hud:sr.bottom<cr.height*.4?sr.bottom:cr.top}});
    ok(`${tag}: 수련 창을 열면 카메라가 당겨진다 (${z0} → ${st.z.toFixed(2)})`,st.z>z0+.5);
    ok(`${tag}: 발이 수련 창보다 넉넉히 위 (발 ${st.feet|0}, 창 ${st.top|0})`,st.top-st.feet>60);
    ok(`${tag}: 머리는 위 HUD 아래 (머리 ${st.head|0}, HUD ${st.hud|0})`,st.head>st.hud);
    await p.screenshot({path:__dirname+`/shots/t150_${tag}.png`});
    await p.evaluate(()=>closeTrain());await p.waitForTimeout(2500);
    const z1=await p.evaluate(()=>rdZ);ok(`${tag}: 닫으면 배율이 돌아온다 (${z1.toFixed(2)})`,Math.abs(z1-1)<.02);
    await c.close()}
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}await b.close()})();

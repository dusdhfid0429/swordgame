// 수련 창: 화면 아래에 열려 캐릭터를 가리지 않고, 시간은 흐르며, 능력치마다 연출과 쿨타임이 있다.
const {chromium}=require(process.env.PWPATH||'playwright');
require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  for(const mobile of[false,true]){
    const c=await b.newContext(mobile?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1100,height:760},deviceScaleFactor:2});
    const p=await c.newPage();p.on('pageerror',e=>errs.push('PE '+e.message));
    await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
    await p.evaluate(()=>localStorage.clear());
    const tap=s=>mobile?p.tap(s):p.click(s);
    await tap('[data-s="new"]');await tap('[data-s="start"]');await p.waitForTimeout(400);
    await p.evaluate(()=>{P.vit=2000;P.x=27.5;P.y=13.5;P.path=null;mobs=mobs.filter(m=>m.d.villager);spawnTick=()=>{}});await p.waitForTimeout(300);
    const tag=mobile?'phone':'pc';
    if(mobile){await tap('#tmenu');await tap('[data-act="trainwin"]')}else await p.keyboard.press('KeyT');
    await p.waitForTimeout(200);
    const st=await p.evaluate(()=>{const r=TRN.getBoundingClientRect(),q=toScreen(P.x,P.y),cr=C.getBoundingClientRect();return{open:!TRN.hidden,paused,win:!$('win').hidden,top:r.top,head:cr.top+(q.y-70)*S,feet:cr.top+q.y*S}});
    ok(`${tag}: 수련 창이 열리고 시간은 흐른다`,st.open&&!st.paused&&!st.win);
    ok(`${tag}: 창이 캐릭터 아래에 있다 (창 위 ${st.top|0}, 발 ${st.feet|0})`,st.top>st.feet);
    for(const k of['str','end','agi','qi']){
      const v0=await p.evaluate(k=>P.st[k],k);await tap(`[data-tr="${k}"]`);
      await p.waitForTimeout(550);
      const mid=await p.evaluate(()=>({busy:!!trnBusy,dis:[...TRN.querySelectorAll('[data-tr]')].filter(b=>b.dataset.tr!=='close').every(b=>b.disabled)}));
      await p.evaluate(()=>{const q=toScreen(P.x,P.y),r=C.getBoundingClientRect();window.__clip={x:r.left+(q.x-90)*S,y:r.top+(q.y-110)*S,width:180*S,height:150*S}});
      await p.screenshot({path:shot(`train_${tag}_${k}`),clip:await p.evaluate(()=>window.__clip)});
      ok(`${tag} ${k}: 수련 중에는 다른 수련 버튼이 잠긴다 (쿨타임)`,mid.busy&&mid.dis);
      await p.waitForFunction(()=>!trnBusy,null,{timeout:4000});
      ok(`${tag} ${k}: 쿨타임이 끝나면 1 오른다`,await p.evaluate(([k,v0])=>P.st[k]===v0+1,[k,v0]));
    }
    const q0=await p.evaluate(()=>P.qiN);await tap('[data-tr="neigong"]');await p.waitForTimeout(700);
    await p.screenshot({path:shot(`train_${tag}_panel`)});
    await p.waitForFunction(()=>!trnBusy,null,{timeout:4000});
    ok(`${tag}: 내공 심법 수련`,await p.evaluate(q0=>P.qiN===q0+1,q0));
    await p.evaluate(()=>{P.age=20});await p.waitForTimeout(700);
    ok(`${tag}: 유아기가 지나도 기본기 버튼이 열려 있다`,await p.evaluate(()=>!TRN.querySelector('[data-tr="str"]').disabled));
    {const s0=await p.evaluate(()=>P.st.str);await tap('[data-tr="str"]');await p.waitForFunction(()=>!trnBusy,null,{timeout:4000});
      ok(`${tag}: 20세에도 근력이 오른다`,await p.evaluate(s0=>P.st.str===s0+1,s0))}
    await tap('[data-tr="close"]');ok(`${tag}: 닫기`,await p.evaluate(()=>TRN.hidden));
    await c.close();
  }
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

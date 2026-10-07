// 운기조식 연출: 기운 줄기가 생기고, 그치면 사라지는지 확인하고 장면을 찍는다.
const {chromium}=require(process.env.PWPATH||'playwright');
require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:700},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const S0=await p.evaluate(()=>S);const clip=async n=>{const c=await p.evaluate(()=>{const q=toScreen(P.x,P.y),r=C.getBoundingClientRect();return{x:r.left+(q.x-120)*S,y:r.top+(q.y-150)*S}});await p.screenshot({path:shot(n),clip:{...c,width:240*S0,height:200*S0}})};
  for(const[side,night]of[['정',0],['사',1]]){
    await p.evaluate(([s,n])=>{P.side=s;tod=n?.0:.3;P.qi=1;P.x=27.5;P.y=13.5;P.path=null;mobs=mobs.filter(m=>dist(m,P)>12);for(const m of mobs)m.aggro=false;meditate()},[side,night]);
    await p.waitForTimeout(1500);
    const st=await p.evaluate(()=>({k:MED.k,n:MED.parts.length,medit:P.medit}));
    ok(`${side}파 운기조식 effect running (k ${st.k.toFixed(2)}, ${st.n} streams)`,st.medit&&st.k>.99&&st.n>45);
    await clip('medit_'+(side==='정'?'jeong':'sa'));
    await p.evaluate(()=>{P.medit=false});
    ok(`${side}파 effect fades out when it stops`,await p.waitForFunction(()=>MED.k===0&&MED.parts.length===0,null,{timeout:3000}).then(()=>true,()=>false));
  }
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

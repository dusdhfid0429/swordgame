// 오래 돌리기: 실제 rAF로 돌리며 지역을 옮기고, 계절·날씨를 바꾸고, 싸움을 붙인다. 살아 있는 캔버스 픽셀·JS 힙·오류를 적는다
const {chromium}=require(process.env.PWPATH||'playwright');
const MIN=+(process.env.MIN||4);
(async()=>{
  const b=await chromium.launch({args:['--js-flags=--expose-gc']});const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,300))});
  await p.addInitScript(()=>{const L=window.__cv=[];const ce=Document.prototype.createElement;
    Document.prototype.createElement=function(t,...a){const e=ce.call(this,t,...a);if(String(t).toLowerCase()==='canvas'){L.push({r:new WeakRef(e),st:(new Error).stack.split('\n')[2]||''})}return e}});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(800);
  const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
  const regs=await p.evaluate(()=>Object.keys(REGIONS).filter(k=>!REGIONS[k].hall&&!REGIONS[k].in));
  console.log('regions',regs.length);
  const sample=async(tag)=>{await p.evaluate(()=>window.gc&&gc());await p.waitForTimeout(200);
    const m=(await cdp.send('Performance.getMetrics')).metrics.reduce((o,x)=>(o[x.name]=x.value,o),{});
    const cv=await p.evaluate(()=>{let n=0,px=0;const by={};for(const o of __cv){const e=o.r.deref();if(!e)continue;n++;const s=e.width*e.height*4;px+=s;const k=o.st.trim().replace(/\(file.*gangho\.html/,'(').slice(0,80);by[k]=(by[k]||0)+s}
      const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>(v/1e6).toFixed(1)+'MB '+k);
      return{n,mb:px/1e6,top,mobs:mobs.length,fx:fx.length,texts:texts.length,dom:document.getElementsByTagName('*').length}});
    console.log(`${tag} heap ${(m.JSHeapUsedSize/1e6).toFixed(0)}MB canv ${cv.n} ${cv.mb.toFixed(0)}MB dom ${cv.dom} nodes ${m.Nodes} mobs ${cv.mobs} fx ${cv.fx} txt ${cv.texts} errs ${errs.length}`);return cv};
  await sample('start');
  const t0=Date.now();let i=0;
  while(Date.now()-t0<MIN*60e3){i++;
    await p.evaluate(([r,i])=>{try{closePanels()}catch(e){}paused=false;const R=REGIONS[r];regionJump(r,Math.min(N-2,20),Math.min(NH-2,20));spawnTick();spawnTick();
      G.cal=(G.cal||0)+.13;G.weather=['맑음','비','눈','폭염'][i%4];P.hp=P.maxHp;P.mp=P.maxMp},[regs[i%regs.length],i]);
    for(let k=0;k<+(process.env.K||20);k++){await p.evaluate(()=>{try{const e=mobs.find(m=>m.d.hostile);if(e){P.x=e.x+.8;P.y=e.y;e.aggro=true}P.hp=P.maxHp;P.mp=P.maxMp;for(let f=0;f<5;f++)try{useForm(f%5,true)}catch(e){}}catch(e){}});await p.waitForTimeout(250)}
    if(i%5===0){const cv=await sample('it'+i);if(i%20===0)console.log('  '+cv.top.join('\n  '))}
  }
  const cv=await sample('end');console.log('  '+cv.top.join('\n  '));
  console.log([...new Set(errs)].slice(0,20).join('\n'));
  await b.close()})();

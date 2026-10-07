const {chromium}=require(process.env.PWPATH||'playwright');
require('fs').mkdirSync(__dirname+'/shots',{recursive:true});
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});
  const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(3500);
  await p.screenshot({path:__dirname+'/shots/s_title.png'});
  await p.click('[data-s="new"]');await p.waitForTimeout(300);await p.screenshot({path:__dirname+'/shots/s_create.png'});
  await p.click('[data-s="start"]');await p.waitForTimeout(1500);
  await p.screenshot({path:__dirname+'/shots/s_game.png'});
  // read the book then fight
  const r=await p.evaluate(()=>{const it=P.bag.find(i=>i.slot==='book');readBook(it);return {cur:P.cur,vit:P.vit,arts:Object.keys(P.arts),hp:P.hp,maxHp:P.maxHp,qi:P.maxQi,mobs:mobs.length}});
  console.log(JSON.stringify(r));
  // teleport near camp and fight
  await p.evaluate(()=>{P.x=29.5;P.y=20.5;});await p.waitForTimeout(500);
  await p.evaluate(()=>{const e=nearest(20);P.target=e});
  for(let i=0;i<20;i++){await p.waitForTimeout(500);await p.keyboard.press('KeyQ');}
  await p.screenshot({path:__dirname+'/shots/s_fight.png'});
  const r2=await p.evaluate(()=>({hp:P.hp,vit:P.vit,kills:P.kills,mast:A(P.cur).p,log:[...document.querySelectorAll('#log p')].map(x=>x.textContent).slice(-8)}));
  console.log(JSON.stringify(r2));
  for(const k of['KeyK','KeyB','KeyI','KeyP','KeyL','KeyH']){await p.keyboard.press(k);await p.waitForTimeout(200);await p.screenshot({path:'s_p_'+k+'.png'});await p.keyboard.press('Escape')}
  console.log(errs.join('\n'));
  await b.close();
})();

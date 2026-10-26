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
    await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
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
    // v129 (사용자): 목록을 스크롤해도 닫기 버튼(머리줄)은 제자리
    const sc=await p.evaluate(()=>{const l=TRN.querySelector('.tlist'),h=TRN.querySelector('.thead'),b0=h.getBoundingClientRect().top;l.scrollTop=400;const b1=h.getBoundingClientRect().top;return{can:l.scrollHeight>l.clientHeight,moved:Math.abs(b1-b0),st:l.scrollTop,inside:h.getBoundingClientRect().top>=TRN.getBoundingClientRect().top-1}});
    ok(`${tag}: 목록을 ${sc.st}px 내려도 닫기 버튼은 제자리 (움직임 ${sc.moved}px${sc.can?'':', 목록이 다 보여 스크롤 없음'})`,(!sc.can||sc.st>0)&&sc.moved<1&&sc.inside);
    // v132 (사용자): 버튼을 누르거나 수련이 끝나 다시 그려도 스크롤 자리 유지
    const keep=await p.evaluate(async()=>{const l=TRN.querySelector('.tlist');if(l.scrollHeight<=l.clientHeight)return{skip:true};l.scrollTop=40;const s0=l.scrollTop;renderTrain.h='';renderTrain();const s1=TRN.querySelector('.tlist').scrollTop;
      const b=TRN.querySelector('[data-tr="str"]');b&&b.click();await new Promise(r=>setTimeout(r,120));const s2=TRN.querySelector('.tlist').scrollTop;return{s0,s1,s2}});
    ok(`${tag}: 다시 그려도 스크롤 자리 유지 (${keep.skip?'목록이 다 보여 생략':`${keep.s0} → ${keep.s1} → 수련 뒤 ${keep.s2}`})`,keep.skip||(keep.s0>0&&keep.s1===keep.s0&&keep.s2===keep.s0));
    await p.evaluate(()=>{TRN.querySelector('.tlist').scrollTop=0;trnBusy=null;renderTrain.h='';renderTrain()});await p.waitForTimeout(1700);
    // v129 (사용자): HUD 왼쪽 위 정보창을 누르면 인물 창
    await tap('#pstat .who');   // v178: 가운데에 내공 성 칸이 있다await p.waitForTimeout(200);
    const pc=await p.evaluate(()=>({panel,win:!$('win').hidden,trn:!TRN.hidden,title:$('wtitle').textContent}));
    ok(`${tag}: 정보창을 누르면 인물 창이 열린다 (${pc.title})`,pc.panel==='char'&&pc.win&&!pc.trn);
    await p.evaluate(()=>closePanels());if(mobile){await tap('#tmenu');await tap('[data-act="trainwin"]')}else await p.keyboard.press('KeyT');await p.waitForTimeout(200);
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

// 소리: 첫 손길에 켜지고, 마을·들판·싸움에 따라 음악이 바뀌고, 싸움 효과음이 나고, 켬/끔이 저장된다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1000);
  ok('누르기 전에는 소리 장치를 만들지 않는다',await p.evaluate(()=>AC===null));
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');
  // 소리 크기 재기: 마스터 뒤에 분석기
  const lvl=async(ms=1500)=>{await p.waitForTimeout(ms);return p.evaluate(()=>{const a=window._an,d=new Float32Array(a.fftSize);let m=0;for(let k=0;k<20;k++){}a.getFloatTimeDomainData(d);for(const v of d)m=Math.max(m,Math.abs(v));return window._peak=Math.max(window._peakKeep||0,m)})};
  await p.evaluate(()=>{const a=AC.createAnalyser();a.fftSize=2048;AMaster.connect(a);window._an=a;window._pk=0;setInterval(()=>{const d=new Float32Array(2048);a.getFloatTimeDomainData(d);for(const v of d)window._pk=Math.max(window._pk,Math.abs(v))},50)});
  const peak=async ms=>{await p.evaluate(()=>window._pk=0);await p.waitForTimeout(ms);return p.evaluate(()=>window._pk)};
  ok(`첫 손길에 켜진다 (${await p.evaluate(()=>AC.state)})`,await p.evaluate(()=>AC&&AC.state==='running'));
  const t0=await peak(5000);ok(`첫 화면 음악이 들린다 (최대 ${t0.toFixed(3)}, ${await p.evaluate(()=>MUS.mode)})`,t0>.01&&await p.evaluate(()=>MUS.mode==='title'));
  await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(3000);
  ok(`개봉에서는 마을 음악 (${await p.evaluate(()=>MUS.mode)})`,await p.evaluate(()=>MUS.mode==='town'));
  await p.evaluate(()=>{tod=.5;travel(REGION().gates.find(g=>g.to==='pv_henan'))});await p.waitForTimeout(3500);
  ok(`하남성(낮)에서는 들판 음악 (${await p.evaluate(()=>MUS.mode)})`,await p.evaluate(()=>MUS.mode==='field'));
  // 싸움: 가까이에 적이 덤비면 북 음악
  await p.evaluate(()=>{const e=mkMob('늑대',P.x+2,P.y);e.aggro=true;mobs.push(e);window._wolf=e});await p.waitForTimeout(3000);
  const bt=await p.evaluate(()=>MUS.mode);ok(`싸움이 붙으면 싸움 음악 (${bt})`,bt==='battle');
  // 효과음: 기본 공격과 타격이 sfx를 부른다
  const hits=await p.evaluate(()=>{const log=[];const o=sfx;sfx=function(k,x){log.push(k);return o(k,x)};P.bcd=0;P.gcd=0;basicStrike(window._wolf);P.hp=P.maxHp;P.inv=0;hurtP(5,window._wolf);P.qi=P.maxQi;leap();sfx=o;return log});
  ok(`공격·타격(또는 빗나감)·맞음/회피·경공 효과음: ${hits.join(',')}`,hits.includes('swing')&&(hits.includes('hit')||hits.includes('crit')||hits.includes('miss'))&&(hits.includes('hurt')||hits.includes('dodge'))&&hits.includes('leap'));
  // 켬/끔: 메뉴 버튼, 저장
  await p.evaluate(()=>{mobs=[];MUS.combatT=0;openPanel('menu')});await p.waitForTimeout(200);
  ok('☰ 메뉴에 배경음악·효과음 버튼',await p.evaluate(()=>!!document.querySelector('#wbody [data-act="snd:m"]')&&!!document.querySelector('#wbody [data-act="snd:s"]')));
  await p.tap('#wbody [data-act="snd:m"]');await p.tap('#wbody [data-act="snd:s"]');await p.waitForTimeout(400);
  const off=await p.evaluate(()=>({m:SND.m,s:SND.s,saved:JSON.parse(localStorage.getItem(SND_KEY)),txt:$('wbody').textContent.includes('배경음악 끔')}));
  // 소리는 0.15초 시간 상수로 줄어든다. 느린 기계에서는 남은 소리가 재는 구간에 걸리니, 음량이 다 내려간 뒤에 잰다
  await p.waitForFunction(()=>AMus.gain.value<.001&&ASfx.gain.value<.001,null,{timeout:10000}).catch(()=>{});
  const pk=await peak(2500);
  ok(`끄면 조용하고(최대 ${pk.toFixed(4)}) 설정이 저장된다`,!off.m&&!off.s&&off.saved.m===0&&off.saved.s===0&&off.txt&&pk<.01);
  await p.tap('#wbody [data-act="snd:m"]');await p.tap('#wbody [data-act="snd:s"]');
  ok('다시 켤 수 있다',await p.evaluate(()=>SND.m===1&&SND.s===1));
  // 앱이 뒤로 가면 멈춘다
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(300);
  ok('화면이 숨으면 소리를 멈춘다',await p.evaluate(()=>AC.state==='suspended'));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

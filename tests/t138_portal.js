// 출입구 상징물 (v218, 사용자 2026-11-01): 글자 이정표 대신 목적지를 상징하는 건물·봉우리를 그린다.
// 모든 맵의 건물 문이 아닌 출입구가 알맞은 종류를 받고, 그 그림이 오류 없이 그려지는지 본다. 종류별 모음 그림은 tests/shots/t138_portal.png
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?touch&noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{const cnt={},bad=[];
    for(const[id,R]of Object.entries(REGIONS))for(const g of R.gates||[]){if(g.door||g.gyc!=null)continue;const o=portalKind(g);if(!PT_DRAW[o.k])bad.push(id+'>'+g.to);cnt[o.k]=(cnt[o.k]||0)+1;
      const s=portalSprite(o);if(!(s.top>20&&s.top<s.H))bad.push('top '+o.k)}
    const kd=(r,f)=>{const g=(REGIONS[r].gates||[]).find(f);return g&&portalKind(g)};
    return{cnt,bad,gae:kd('pv_henan',g=>g.to==='gaebong'),city:kd('pv_henan',g=>g.to==='lm_henan_0'),mt:kd('pv_henan',g=>g.to==='lm_henan_6'),pv:kd('pv_henan',g=>/^pv_/.test(g.to)),sh:kd('sungsan',g=>g.to==='hq_shaolin'),
      keys:Object.keys(PORTAL_CACHE).length}});
  console.log(JSON.stringify(r.cnt));
  ok('모든 출입구가 그릴 수 있는 종류를 받는다 '+r.bad.slice(0,5).join(','),!r.bad.length);
  ok('개봉·정주=성, 대별산=봉우리, 하북성=경계 패방, 소림사=산문(황토 지붕)',r.gae.k==='castle'&&r.city.k==='castle'&&r.mt.k==='mount'&&r.pv.k==='border'&&r.sh.k==='sect'&&r.sh.v==='ochre');
  ok('그림은 종류·색마다 한 장만 ('+r.keys+')',r.keys>=8&&r.keys<40);
  ok('여러 종류가 쓰인다',['castle','mount','sect','border','pavilion','pagoda'].every(k=>r.cnt[k]>0));
  // 종류별 모음 + 실제 맵에서 한 번 그려 보기
  await p.evaluate(()=>{const g=REGIONS.pv_henan.gates.find(g=>g.to==='gaebong');enterRegion('pv_henan',g.x,g.y+2.5)});await p.waitForTimeout(600);
  const shot=await p.evaluate(()=>{const L=[['castle',{k:'castle',big:1},'성(개봉)'],['town',{k:'town'},'고을'],['pass',{k:'castle',v:'pass'},'관문'],['m',{k:'mount',v:'peak'},'산'],['ms',{k:'mount',v:'snow'},'눈산'],['md',{k:'mount',v:'canyon'},'붉은 산'],
      ['s',{k:'sect',v:'ochre'},'불가 산문'],['s2',{k:'sect',v:'green'},'도가 산문'],['s3',{k:'sect',v:'mg'},'마교 산문'],['b',{k:'border'},'경계'],['pg',{k:'pagoda'},'석탑'],['pv',{k:'pavilion'},'정자'],['rk',{k:'rocks'},'기암'],['pt',{k:'port'},'포구'],['ht',{k:'hut'},'밀림'],['hl',{k:'hall'},'전각']];
    const cv=document.createElement('canvas'),C=4,w=150;cv.width=C*w;cv.height=Math.ceil(L.length/C)*170;const c=cv.getContext('2d');c.fillStyle='#3a4a30';c.fillRect(0,0,cv.width,cv.height);
    L.forEach(([_,o,n],i)=>{const s=portalSprite(o),x=i%C*w,y=Math.floor(i/C)*170;c.drawImage(s.cv,x,y,s.W,s.H);c.fillStyle='#ffe2a0';c.font='13px sans-serif';c.textAlign='center';c.fillText(n,x+w/2,y+165)});
    document.body.appendChild(cv);cv.id='ptgal';cv.style.cssText='position:fixed;left:0;top:0;z-index:99999';return 1});
  await p.locator('#ptgal').screenshot({path:require('path').join(__dirname,'shots/t138_portal.png')});
  ok('오류 없음 '+errs.join(' | ').slice(0,300),!errs.length);
  await b.close()})();

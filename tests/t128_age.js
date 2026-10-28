// v197 (사용자 2026-10-28): 주인공은 8세에 작게 그려지고 나이에 따라 커져 20세에 지금 크기가 된다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const k=await p.evaluate(()=>[6,8,12,16,20,40].map(a=>{P.age=a;return+heroAgeK().toFixed(3)}));
  ok(`나이별 배율 ${k.join(' ')}`,k[0]===ANIM_MIN(k)&&k[1]===k[0]&&k[1]<k[2]&&k[2]<k[3]&&k[3]<k[4]&&k[4]===1&&k[5]===1);
  // drawFighter(P)가 발 기준으로 그 배율을 실제로 건다
  const sc=await p.evaluate(()=>{const g=CanvasRenderingContext2D.prototype,o=g.scale;const got=[];g.scale=function(x,y){got.push(+x.toFixed(3));return o.call(this,x,y)};
    P.age=8;drawFighter(P,true);const a=got.slice(0,1);got.length=0;P.age=25;drawFighter(P,true);const c=got.includes(.72);g.scale=o;return{a,c}});
  ok(`8세는 0.72배로 그림 (${sc.a}), 25세는 줄이지 않음`,sc.a[0]===.72&&!sc.c);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();
function ANIM_MIN(k){return 0.72}

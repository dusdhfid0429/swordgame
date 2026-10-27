// 나무·지붕 위에서 던진 암기·투사체는 겨눈 적에게 내려가 닿는다 (사용자 2026-10-27)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{
    AMGI_FREE=1;mobs=[];projs=[];const e=mkMob('산적',P.x+4,P.y);e.hp=e.maxHp=1e6;e.fixed=1;mobs.push(e);
    P.perch={k:'tree',x:P.x,y:P.y,z:60};P.z=60;P.fx=1;P.fy=0;
    projs.push({x:P.x,y:P.y,vx:9,vy:0,left:6,m:1,kb:0,size:1,kind:'blade',c:'#ccc',trail:[],hit:new Set(),X:mkX('base')});const q=projs[0];
    const zs=[];let hitZ=null;for(let i=0;i<40&&projs.includes(q);i++){updateProjs(.02);zs.push(Math.round(q.z));if(q.hit.has(e)&&hitZ===null)hitZ=q.z}
    // 적이 없으면 날아갈 끝에서 땅에 닿는다
    mobs=[];projs=[];projs.push({x:P.x,y:P.y,vx:9,vy:0,left:6,m:1,kb:0,size:1,kind:'blade',c:'#ccc',trail:[],hit:new Set(),X:mkX('base')});const q2=projs[0];updateProjs(.02);const z1=q2.z;for(let i=0;i<30;i++)updateProjs(.02);
    // 땅에서 쏜 것은 그대로 땅 높이
    P.perch=null;P.z=0;projs=[];projs.push({x:P.x,y:P.y,vx:9,vy:0,left:6,m:1,kb:0,size:1,kind:'blade',c:'#ccc',trail:[],hit:new Set(),X:mkX('base')});updateProjs(.02);
    return{z0:zs[0],hitZ,down:zs.every((z,i)=>!i||z<=zs[i-1]),z1,z2:q2.z,gnd:projs[0].z};
  });
  ok(`나무 위(60)에서 던지면 내려가며 (${r.z0}→…) 적에게 닿을 때 높이 ${r.hitZ&&r.hitZ.toFixed(1)}`,r.z0>40&&r.down&&r.hitZ!==null&&r.hitZ<12);
  ok(`적이 없으면 끝에서 땅으로 (${r.z1.toFixed(1)}→${r.z2.toFixed(1)})`,r.z1>40&&r.z2<8);
  ok(`땅에서 쏘면 높이 0 (${r.gnd})`,r.gnd===0);
  await p.evaluate(()=>{AMGI_FREE=0});ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

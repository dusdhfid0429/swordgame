// 경공과 건물 문: 문 쪽으로 뛰면 지붕이 아니라 문 앞에 내려서고, 경공 도중 문을 지나 안으로 들어가면 도약이 끝난다 (안에서 '지붕 위' 판정이 나지 않게)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text()+' @'+JSON.stringify(m.location()))});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 문 2.2칸 아래에서 문 쪽으로 경공: 문 앞에 내려선 뒤 안으로 들어간다
  const r1=await p.evaluate(()=>{mobs=[];loadRegion('hq_shaolin');P.reg='hq_shaolin';const g=REGION().gates.find(g=>g.door);if(!g)return{nog:1};P.gateLock=0;P.x=g.x;P.y=g.y+2.2;P.fx=0;P.fy=-1;P.qi=P.maxQi=999;P.perch=null;P.leap=null;texts.length=0;
    const pc=leapPerch(leapRange());leap();return{from:REG,door:g.label,pc:pc&&{q:pc.q&&pc.q.k,x:+pc.x.toFixed(1),y:+pc.y.toFixed(1)},gx:g.x,gy:g.y,leapTo:P.leap&&P.leap.to}});
  await p.waitForTimeout(1400);
  const s1=await p.evaluate(()=>({reg:REG,hall:!!REGION().gates.find(g=>g.door&&g.to!==REG)&&REG.startsWith('in_'),perch:P.perch,leap:P.leap,z:P.z,roofMsg:texts.some(t=>/지붕 위|나무 위/.test(t.t)),zone:$('zone').textContent}));
  ok(`${r1.door} 문 쪽으로 경공: 착지점 (${r1.pc&&r1.pc.x},${r1.pc&&r1.pc.y}) = 문 (${r1.gx},${r1.gy}), 지붕 아님(${r1.pc&&r1.pc.q})`,!r1.nog&&r1.pc&&!r1.pc.q&&r1.pc.x===r1.gx&&r1.pc.y===r1.gy&&!r1.leapTo);
  ok(`들어가서 ${s1.zone}: 지붕 판정 없음 (perch ${s1.perch}, z ${s1.z}, 알림 ${s1.roofMsg})`,s1.reg!==r1.from&&s1.reg.startsWith('in_')&&!s1.perch&&!s1.leap&&!s1.z&&!s1.roofMsg);
  // 2. 경공 도중 문을 지나 들어가면 도약이 끊긴다
  const r2=await p.evaluate(()=>{const out=REGION().gates.find(g=>g.door);P.leap={sx:P.x,sy:P.y,ex:P.x,ey:P.y-3,t:0,dur:.6,z0:0,z1:0,to:null};travel(out);return{to:out.to}});
  await p.waitForTimeout(900);
  const s2=await p.evaluate(()=>({reg:REG,leap:P.leap,perch:P.perch,z:P.z,roofMsg:texts.some(t=>/지붕 위/.test(t.t))}));
  ok(`경공 도중 문으로 나가면 도약이 끊긴다 (${s2.reg}, leap ${s2.leap}, perch ${s2.perch}, z ${s2.z}, 알림 ${s2.roofMsg})`,s2.reg===r2.to&&!s2.leap&&!s2.perch&&!s2.z&&!s2.roofMsg);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

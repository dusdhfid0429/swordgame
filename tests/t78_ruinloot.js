// 폐허 약탈품 (v116): 멸문 본산의 시체·잔해를 뒤지면 은자·장비·비급·유물이 나온다. 한 번 뒤진 자리는 생을 넘어 남고 문파가 살아나면 지워진다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 1. 살아 있는 본산엔 시체·잔해 자리가 없고, 멸문 본산엔 시체 수만큼 corpse + 잔해 3~5
  const a=await p.evaluate(()=>{paused=true;popInit();regionJump('hq_hwasan_outer',20,22);const live=nodes.filter(n=>n.t==='corpse'||n.t==='rubble').length;G.pop.hwasan=0;popSync();regionJump('hq_hwasan_outer',20,22);
    const R=REGION(),bodies=R.gore.filter(g=>g.k==='body').length,c=nodes.filter(n=>n.t==='corpse'),r=nodes.filter(n=>n.t==='rubble');draw();return{live,bodies,c:c.length,r:r.length,ready:c.every(n=>n.cd===0)&&r.every(n=>n.cd===0),nearB:r.some(n=>builds.some(b=>n.x>b.x-1.5&&n.x<b.x+b.w+1.5&&n.y>b.y+b.h&&n.y<b.y+b.h+3.5))}});
  ok(`시체·잔해 자리: 살아 있을 때 ${a.live} → 멸문 시체 ${a.bodies}=${a.c} 잔해 ${a.r} (뒤질 수 있음 ${a.ready}, 건물 앞 ${a.nearB})`,a.live===0&&a.c===a.bodies&&a.r>=3&&a.r<=5&&a.ready&&a.nearB);
  // 2. 시체 뒤지기: 1.4초 작업 → 은자·금창약·장비·비급·유물 중 하나. 열 구를 모두 뒤져 종류를 모은다. 같은 무공 낱장은 행낭 칸이 늘지 않고 쌓이므로 낱장 수로 센다. 뒤진 자리는 cd 99999 + G.looted
  const l=await p.evaluate(()=>{const o={kinds:{},items:[]};const cs=nodes.filter(n=>n.t==='corpse');for(const n of cs){P.x=n.x;P.y=n.y;const lv=()=>bagAll().reduce((t,it)=>t+(it.slot==='leaf'?it.n:0),0);const s0=P.silver,m0=P.mats.금창약||0,b0=P.bag.length,f0=lv();interact({node:n});o.dur=P.chan&&P.chan.dur;o.label=P.chan&&P.chan.label;P.chan.fn();P.chan=null;
      const k=P.silver>s0?'silver':(P.mats.금창약||0)>m0?'potion':P.bag.length>b0?(P.bag[P.bag.length-1].relic?'relic':P.bag[P.bag.length-1].slot==='book'?'book':'gear'):lv()>f0?'leaf':'none';o.kinds[k]=(o.kinds[k]||0)+1;if(P.bag.length>b0)o.items.push(P.bag[P.bag.length-1].name)}
    o.cd=cs.every(n=>n.cd>9000);o.looted=Object.keys(G.looted[REG]||{}).length;interact({node:cs[0]});o.again=$('log').textContent.includes('이미 뒤진 자리다');return o});
  ok(`시체 뒤지기 (${l.label}, ${l.dur}초): ${JSON.stringify(l.kinds)} ${l.items.join(' · ')} · 다 뒤짐 ${l.cd} 기록 ${l.looted} 다시 ${l.again}`,l.label==='시체를 뒤진다'&&l.dur===1.4&&!l.kinds.none&&l.cd&&l.looted>=6&&l.again);
  // 3. 잔해: 100번 뽑아 유물·절기 비급(hibook)·은자·재가 모두 나온다. 유물은 그 문파 이름의 장신구, 절기 비급은 화산파 고급 무공
  const r=await p.evaluate(()=>{const o={kinds:{},relic:null,hi:null};const n=nodes.find(x=>x.t==='rubble');for(let i=0;i<100;i++){n.cd=0;delete G.looted[REG][n.key];const s0=P.silver,b0=P.bag.length,lg=$('log').textContent.length;ruinLoot(n);
      const it=P.bag.length>b0?P.bag[P.bag.length-1]:null;const k=P.silver>s0?'silver':it?(it.relic?'relic':it.slot==='leaf'?'leaf':'hibook'):'ash';o.kinds[k]=(o.kinds[k]||0)+1;if(it&&it.relic&&!o.relic)o.relic=it;if(it&&it.slot==='book'&&!o.hi)o.hi={name:it.name,art:it.art,hi:SECTS.hwasan.arts.find(a=>a.id===it.art)&&SECTS.hwasan.arts.find(a=>a.id===it.art).hi};P.bag=[]}
    o.feat=P.feats.some(f=>/폐허에서/.test(f));return o});
  ok(`잔해 100번: ${JSON.stringify(r.kinds)} · 유물 ${r.relic&&r.relic.name} (현묘 +${r.relic&&r.relic.hm}, 값 ${r.relic&&r.relic.price}) · 절기 ${r.hi&&r.hi.name} 고급 ${r.hi&&r.hi.hi} 업적 ${r.feat}`,
    r.kinds.silver>0&&r.kinds.relic>0&&r.kinds.hibook>0&&r.kinds.ash>0&&r.kinds.leaf>0&&r.relic&&/화산파 유물/.test(r.relic.name)&&r.relic.hm>=8&&r.hi&&r.hi.hi===true&&r.feat);
  // 4. 전각 안에도 시체 1~3·잔해 1~2. 문파가 살아나면 자리가 사라지고 G.looted 도 지워진다
  const h=await p.evaluate(()=>{const hid=REGION().halls[0].id;regionJump(hid,7,6);const o={c:nodes.filter(n=>n.t==='corpse').length,r:nodes.filter(n=>n.t==='rubble').length};const n=nodes.find(x=>x.t==='corpse');ruinLoot(n);o.looted=!!(G.looted[hid]&&G.looted[hid][n.key]);
    G.pop.hwasan=popBase(SECTS.hwasan);popSync();regionJump(hid,7,6);o.after=nodes.filter(n=>n.t==='corpse'||n.t==='rubble').length;o.cleared=!G.looted[hid];return o});
  ok(`전각 안: 시체 ${h.c} 잔해 ${h.r} 뒤진 기록 ${h.looted} → 회복 뒤 자리 ${h.after} 기록 지움 ${h.cleared}`,h.c>=1&&h.c<=3&&h.r>=1&&h.r<=2&&h.looted&&h.after===0&&h.cleared);
  if(errs.length){console.log('ERRORS');errs.forEach(e=>console.log(' ',e))}
  await b.close();process.exit(errs.length?1:0)})();

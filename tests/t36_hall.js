// 전각과 성도: 문파마다 이름 붙은 전각과 들어갈 수 있는 내부 맵, 장문인은 전각 안, 문으로 드나들기, 성도의 가게·좌판·의뢰판, 역참으로 성도 가기.
const {chromium}=require(process.env.PWPATH||'playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const shot=n=>path.join(__dirname,'shots',n+'.png');
  await p.goto('file://'+path.resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');
  await p.waitForFunction(()=>playing);await p.waitForTimeout(1500);
  const go=(id,x,y)=>p.evaluate(([id,x,y])=>{mobs=[];P.reg=id;loadRegion(id);P.x=x;P.y=y;P.path=null;P.gateLock=0;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;miniBase=null},[id,x,y]);
  // 1) 문파마다 전각: 장문인 맵에 본전·왼쪽·오른쪽 세 전각, 장문인은 본전 안, 바깥 맵에는 없다
  const r1=await p.evaluate(()=>{const bad=[];let halls=0,inside=0;for(const s of Object.values(SECTS)){const M=hqId(s),R=REGIONS[M];if(!R)continue;halls+=(R.halls||[]).length;
      const h=hqNpc(M);if(!h)bad.push(s.n+' 장문인 없음');else if(R.npcs.some(n=>n.hq))bad.push(s.n+' 장문인이 밖에');else inside++;
      if(s.id!=='cheonma'&&!R.stage&&(!R.halls||R.halls.length!==3||R.halls[0].n!==hallNames(s)[0]))bad.push(s.n+' 전각 '+(R.halls||[]).map(h=>h.n))}
    return{halls,inside,bad,hwasan:REGIONS.hq_hwasan.halls.map(h=>h.n),inN:Object.keys(REGIONS).filter(k=>k.startsWith('in_')).length}});
  ok(`문파 전각 ${r1.halls}개, 내부 맵 ${r1.inN}개, 장문인 ${r1.inside}명 모두 전각 안 · 화산파 ${r1.hwasan.join('·')} ${r1.bad.slice(0,4).join(' / ')}`,r1.bad.length===0&&r1.inside===50&&r1.hwasan[0]==='자소궁'&&r1.inN>=200);
  // 2) 전각 문(door 출입구)은 건물 앞면 가운데 바로 아래, 걸어갈 수 있는 칸
  const r2=await p.evaluate(()=>{loadRegion('hq_hwasan');const bad=[];for(const g of REGION().gates.filter(g=>g.door)){if(!walk(Math.floor(g.x),Math.floor(g.y)))bad.push(g.label+' 문 앞이 막힘')}
    const h=REGIONS[REGION().halls[0].id];return{bad,w:h.size,h:h.h,theme:h.theme,gate:h.gates[0],npc:h.npcs.map(n=>n.n)}});
  ok(`자소궁 안 ${r2.w}×${r2.h} ${r2.theme}, 안에 ${r2.npc.join(',')}, 나가는 문 → ${r2.gate.to} ${r2.bad.join('/')}`,r2.bad.length===0&&r2.theme==='hall'&&r2.gate.to==='hq_hwasan'&&r2.gate.door&&r2.npc.some(n=>n.includes('장문인')));
  // 3) 문 앞에 서면 들어가고, 안에서 아래 문으로 나오면 앞마당
  await go('hq_hwasan',20.5,9.5);
  await p.evaluate(()=>{P.path=[{x:20.5,y:7.5}]});await p.waitForFunction(()=>REG.startsWith('in_'),null,{timeout:8000}).catch(()=>{});await p.waitForTimeout(600);
  const r3=await p.evaluate(()=>({reg:REG,walk:walkAt(P.x,P.y),zone:$('zone').textContent,npcs:npcsHere().map(n=>n.n),floor:map[Math.floor(P.y)][Math.floor(P.x)].g,wallN:objs.flat().filter(o=>o==='wall').length,mobs:mobs.length}));
  ok(`문으로 들어감: ${r3.reg} (${r3.zone}) 바닥 ${r3.floor} 담 ${r3.wallN} ${r3.npcs.join(',')}`,r3.reg==='in_hq_hwasan_0'&&r3.walk&&r3.floor===13&&r3.wallN>30&&r3.npcs.some(n=>n.includes('장문인'))&&r3.mobs===0);
  await p.screenshot({path:shot('hall_inside')});
  await p.evaluate(()=>openNpc(npcsHere().find(n=>n.hq)));await p.waitForTimeout(150);
  ok('전각 안에서 장문인에게 가입 청할 수 있다',await p.evaluate(()=>!!document.querySelector('[data-act="sjoin:hwasan"]')));
  await p.evaluate(()=>{closePanels();const g=REGION().gates[0];P.gateLock=0;P.path=[{x:g.x,y:g.y}]});await p.waitForFunction(()=>REG==='hq_hwasan',null,{timeout:8000}).catch(()=>{});await p.waitForTimeout(400);
  const r4=await p.evaluate(()=>({reg:REG,y:P.y,walk:walkAt(P.x,P.y)}));
  ok(`문으로 나옴: ${r4.reg} y=${r4.y.toFixed(1)}`,r4.reg==='hq_hwasan'&&r4.walk&&r4.y>7&&r4.y<10);
  // 4) 외원 연무청에 총관, 객청에 제자; 마교 천마신전 대전(검은 벽)에 교주, 오당 전각에 당주
  const r5=await p.evaluate(()=>{const O=REGIONS.hq_hwasan_outer,st=findNpc('hq_hwasan_outer',n=>n.steward),dc=findNpc('hq_hwasan_outer',n=>n.disc);
    const T=REGIONS[REGIONS.hq_cheonma.halls[0].id],D=REGIONS.hq_cheonma_5;return{outer:O.halls.map(h=>h.n),st:!!st&&!O.npcs.includes(st),dc:!!dc,mg:T.theme,mgNpc:T.npcs.map(n=>n.n),dang:D.halls.map(h=>h.n),dangIn:D.halls.every(h=>REGIONS[h.id].npcs.some(n=>n.dang))}});
  ok(`화산 외원 ${r5.outer.join('·')} 총관 안 ${r5.st} 제자 ${r5.dc} · 천마신전 ${r5.mg} ${r5.mgNpc} · 오당 ${r5.dang.length}전각 당주 안 ${r5.dangIn}`,r5.outer.length===2&&r5.st&&r5.dc&&r5.mg==='dark'&&r5.mgNpc.some(n=>n.includes('교주'))&&r5.dang.length===5&&r5.dangIn);
  // 5) 성도: 성마다 하나, 가게 여덟 전각, 좌판·의뢰판·연락관·역참, 양민
  const r6=await p.evaluate(()=>{const caps=Object.entries(PROV).filter(([k,p])=>p.cap);const bad=[];for(const[k,p] of caps){const m=REGIONS[pvId(k)].marks.find(q=>q.n===p.cap),R=REGIONS[m.gate];
      if(R.city!=='cap'||(R.halls||[]).length!==8||!R.npcs.some(n=>n.id==='post')||!R.npcs.some(n=>n.board)||!(R.spawns||[]).some(s=>s[0]==='양민'))bad.push(p.cap)}
    const towns=Object.keys(REGIONS).filter(k=>REGIONS[k].city==='town');return{n:caps.length,bad,towns:towns.length,henan:PROV.henan.cap,sichuan:REGIONS[REGIONS[pvId('sichuan')].marks.find(q=>q.n===PROV.sichuan.cap).gate].name}});
  ok(`성도 ${r6.n}곳 (하남은 개봉 ${r6.henan}) 도시 ${r6.towns}곳, 사천 ${r6.sichuan} ${r6.bad.join('/')}`,r6.n===21&&r6.bad.length===0&&r6.henan===null&&r6.towns>=10&&r6.sichuan==='성도부');
  const cap=await p.evaluate(()=>REGIONS[pvId('shaanxi')].marks.find(q=>q.n==='서안').gate);
  await go(cap,20.5,20.5);await p.waitForTimeout(600);
  const r7=await p.evaluate(()=>({zone:$('zone').textContent,board:objs[12][31],stalls:[[17,19],[22,19],[17,23],[22,23]].filter(([x,y])=>objs[y][x]==='stall').length,
    inn:REGIONS[REGION().halls[0].id].npcs.map(n=>n.n),labels:REGION().gates.filter(g=>g.door).map(g=>g.label)}));
  ok(`서안 성도: ${r7.zone}, 의뢰판 ${r7.board}, 좌판 ${r7.stalls}, 객잔 안 ${r7.inn}, 전각 ${r7.labels.join('·')}`,r7.zone==='서안 성도'&&r7.board==='board'&&r7.stalls===4&&r7.inn.includes('서안 객잔 주인')&&r7.labels.includes('관아')&&r7.labels.includes('약방'));
  await p.screenshot({path:shot('city_seoan')});
  await p.evaluate(()=>openNpc(REGIONS[REGION().halls[0].id].npcs[0]));await p.waitForTimeout(150);
  ok('객잔 주인 창이 열린다 (쉬기·술)',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('객잔')||t.includes('쉬')||!!document.querySelector('[data-act]')}));
  // 6) 역참: 성도 목록, 은자 15로 간다
  await p.evaluate(()=>{closePanels();P.silver=100;openNpc(REGION().npcs.find(n=>n.id==='post'))});await p.waitForTimeout(150);
  const r8=await p.evaluate(()=>({caps:document.querySelectorAll('[data-act^="goto:lm_"]').length,here:$('wbody').textContent.includes('여기'),fee:/은자 15/.test($('wbody').textContent)}));
  const target=await p.evaluate(()=>REGIONS[pvId('sichuan')].marks.find(q=>q.n==='성도').gate);
  await p.locator(`[data-act="goto:${target}"]`).click();await p.waitForTimeout(2500);
  const r9=await p.evaluate(()=>({reg:REG,silver:P.silver,name:REGION().name}));
  ok(`역참 성도 목록 ${r8.caps}개(여기 ${r8.here}, 은자 15 ${r8.fee}) → ${r9.name} 은자 ${r9.silver}`,r8.caps===20&&r8.here&&r8.fee&&r9.reg===target&&r9.silver===85);
  // 7-0) 작은 전각(10×9, 소림사 장경각)에서도 그리기 오류 없이 주인공이 보인다 (2026-10-10 버그)
  errs.length=0;await go('hq_shaolin',15.5,12.5);await p.evaluate(()=>{const g=REGION().gates.find(g=>g.label==='장경각');P.path=[{x:g.x,y:g.y}]});
  await p.waitForFunction(()=>REG==='in_hq_shaolin_1',null,{timeout:8000}).catch(()=>{});await p.waitForTimeout(800);
  const r9b=await p.evaluate(()=>({reg:REG,N,NH,walk:walkAt(P.x,P.y)}));
  ok(`소림사 장경각 ${r9b.N}×${r9b.NH} 안: 그리기 오류 ${errs.length}건`,r9b.reg==='in_hq_shaolin_1'&&r9b.NH<11&&r9b.walk&&errs.length===0);
  // 7-1) 가구: 전각마다 용도에 맞는 가구가 세 점 이상, 문에서 안의 사람까지 걸어서 닿는다 (2026-10-10)
  const fr=await p.evaluate(()=>{const bad=[],kits={};let n=0;for(const id of Object.keys(REGIONS)){if(!id.startsWith('in_'))continue;const R=REGIONS[id];loadRegion(id);n++;kits[R.hall.kit]=1;
      const g=R.gates[0],sx=Math.floor(g.x),sy=Math.floor(g.y),seen=new Set([sx+','+sy]),q=[[sx,sy]];
      while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=[x+dx,y+dy];if(!seen.has(k+'')&&walk(k[0],k[1])){seen.add(k+'');q.push(k)}}}
      const miss=R.npcs.filter(np=>!seen.has(Math.floor(np.x)+','+Math.floor(np.y))).length,furn=objs.flat().filter(o=>FURN[o]).length;let free=0;for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(walk(x,y))free++;
      if(miss||furn<3||seen.size<free*.75)bad.push(id+' '+R.hall.kit+' '+furn+' '+miss+' '+seen.size+'/'+free)}
    loadRegion('gaebong');const inn=REGIONS[REGIONS[pvId('shaanxi')].marks.find(q=>q.n==='서안').gate].halls[0].id;loadRegion(inn);const has=k=>objs.flat().includes(k);const r={n,kits:Object.keys(kits).length,bad:bad.slice(0,5),inn:has('jar')&&has('table')&&has('bed')&&has('counter')};loadRegion('gaebong');return r});
  ok(`전각 ${fr.n}곳 가구 종류 ${fr.kits}가지, 객잔에 술독·탁자·침상·계산대 ${fr.inn} ${fr.bad.join(' / ')}`,fr.bad.length===0&&fr.kits>=10&&fr.inn);
  // 7) 전각 안 벽 속 좌표로 들어오면(예전 저장) 문 앞으로 옮긴다
  const r10=await p.evaluate(()=>{mobs=[];P.reg='in_hq_hwasan_0';P.x=.5;P.y=.5;loadRegion('in_hq_hwasan_0');return{reg:REG,walk:walkAt(P.x,P.y),y:P.y,inn:REGION().in}});
  ok(`벽 속이면 문 앞으로: y=${r10.y}`,r10.reg==='in_hq_hwasan_0'&&r10.walk&&r10.inn===1&&r10.y>8);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close()})();

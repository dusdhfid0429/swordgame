// 기연 소문 단서 추적 (v247, 동훈님 2026-11-11): 사람마다 다른 소문, 성에 가면 아는 사람을 가리킴, 증인 셋(대가)·흔적·숨은 입구, 정보 단체·정탐 보고·운기, 옛 저장
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>{localStorage.clear();window.__noPrompt=1});
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(800);
  // 1. 동굴마다 증인 셋: 성읍(맵) → 옆 들판(징조) → 입구 맵(방위), 입구는 아직 숨어 있다
  const r1=await p.evaluate(()=>{for(let i=0;i<5;i++)update(.1);const L=G.gyc.list;
    return L.map(c=>({n:c.wit.length,r0:REGIONS[c.wit[0].r].city?1:0,pv0:gyclProv(c.wit[0].r)===REGIONS[c.host].prov,r2:c.wit[2].r===c.host,pcs:c.wit.map(w=>w.pc).join(),names:new Set(c.wit.map(w=>w.n)).size,
      hidden:!REGIONS[c.host].gates.some(g=>g.gyc===c.i),k:Object.values(c.k).every(v=>!v)}))});
  ok(`증인 셋·순서 맵/징조/방위·성읍 증인 같은 성·입구 숨음 ${JSON.stringify(r1.map(x=>x.r0+''+(x.pv0?1:0)+(x.hidden?1:0)))}`,r1.every(x=>x.n===3&&x.pcs==='map,sign,dir'&&x.r2&&x.pv0&&x.names===3&&x.hidden&&x.k));
  // 2. 사람마다 다른 소문: 먼 곳에선 성 이름(가끔 징조)만, 같은 사람은 같은 말, 사람마다 갈린다
  const r2=await p.evaluate(()=>{for(const c of G.gyc.list)c.rumor=70;REG='gaebong';gycHopReg=null;const outs=[];
    for(let i=0;i<40;i++){const r=gycRumorFor(1,'gaebong:사람'+i);outs.push(r?r.txt:null)}
    const same=gycRumorFor(1,'gaebong:사람3'),hosts=G.gyc.list.map(c=>REGIONS[c.host].name);
    return{uniq:new Set(outs.filter(Boolean)).size,none:outs.filter(x=>!x).length,same:(same&&same.txt)===outs[3],
      leak:outs.filter(Boolean).some(t=>hosts.some(h=>t.includes(h))&&!/차지|얻었다/.test(t))}});
  ok(`사람 40명: 서로 다른 말 ${r2.uniq}가지, 모르는 사람 ${r2.none}, 같은 사람 같은 말 ${r2.same}, 먼 곳에서 맵 이름 안 샘 ${!r2.leak}`,r2.uniq>=5&&r2.same&&!r2.leak);
  // 3. 그 성에 가면 사람들이 첫 증인을 가리키고, 증인 머리 위에 '?'가 뜬다
  const r3=await p.evaluate(()=>{const c=G.gyc.list[0],w=c.wit[0];c.rumor=20;for(const o of G.gyc.list)if(o!==c)o.rumor=0;enterRegion(w.r,arriveAt(w.r).x,arriveAt(w.r).y);gycHopReg=null;
    let pt=null;for(let i=0;i<30&&!pt;i++){const r=gycRumorFor(1,REG+':길손'+i);if(r&&r.pt===0&&r.c===c)pt=r}if(pt)gyclHearRumor(pt);
    const n=npcsHere().find(n=>n.gyw&&n.gyw[0]===0&&n.gyw[1]===0);const L=[];runHooks('drawList',L);
    return{pt:pt&&pt.txt,kn:w.kn,pv:c.k.pv,npc:!!n,walk:n&&walk(Math.floor(n.x),Math.floor(n.y)),q:L.length>0,map:c.k.map}});
  ok(`성읍에서 "${r3.pt}" → 증인 알게 됨 ${r3.kn} · 성 칸 ${r3.pv} · 증인이 걸을 수 있는 칸에 섬 ${r3.walk} · 맵은 아직 모름 ${!r3.map}`,!!r3.pt&&r3.kn===1&&r3.pv===1&&r3.npc&&r3.walk&&!r3.map);
  await p.evaluate(()=>{const c=G.gyc.list[0],n=npcsHere().find(n=>n.gyw&&n.gyw[0]===0&&n.gyw[1]===0);P.x=n.x+1;P.y=n.y;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y});await p.waitForTimeout(300);await p.screenshot({path:shot('t164_witness')});
  // 4. 대가: 첫 증인 (종류별로 은자/명성/진영/공짜), 듣고 나면 맵 칸과 다음 증인
  const r4=await p.evaluate(()=>{const c=G.gyc.list[0],w=c.wit[0];P.silver=1000;P.fame=0;const n=npcsHere().find(n=>n.gyw&&n.gyw[1]===0);openNpc(n);const html=$('wbody').innerHTML;
    const act=w.pay==='fame'||(w.pay==='side'&&gyclMyFac()!==w.side)?'alt':'pay';const s0=P.silver;sectAct('gyw',`0_0`,act);
    return{pay:w.pay,btn:/data-act="gyw:0_0:/.test(html),ok:w.ok,map:c.k.map,paid:s0-P.silver,next:c.wit[1].kn,log:[...document.querySelectorAll('#log *')].some(e=>e.textContent.includes('[단서]'))}});
  ok(`첫 증인 대가 ${r4.pay} (은자 ${r4.paid}) → 맵 칸 ${r4.map} · 다음 증인 ${r4.next} · 기록 ${r4.log}`,r4.btn&&r4.ok===1&&r4.map===1&&r4.next===1&&r4.log);
  // 5. 몹 처치 부탁과 맞수 겨루기 (둘째·셋째 증인을 그 대가로 바꿔 본다)
  const r5=await p.evaluate(()=>{const c=G.gyc.list[0],w=c.wit[1];w.pay='hunt';w.v=3;enterRegion(w.r,arriveAt(w.r).x,arriveAt(w.r).y);sectAct('gyw','0_1','hunt');const early=sectAct('gyw','0_1','pay'),okEarly=w.ok;
    for(let i=0;i<3;i++){const e=mkMob('산적',P.x+3,P.y);mobs.push(e);onKill(e)}const hv=w.hv;sectAct('gyw','0_1','pay');
    const w2=c.wit[2];w2.pay='beat';enterRegion(c.host,arriveAt(c.host).x,arriveAt(c.host).y);sectAct('gyw','0_2','beat');const e=mobs.find(m=>m.gyw==='gyw:0_2');const beforeWin=(sectAct('gyw','0_2','pay'),w2.ok);
    e.hp=0;onKill(e);sectAct('gyw','0_2','pay');return{okEarly,hv,ok1:w.ok,sign:c.k.sign,mob:!!e&&e.name,beforeWin,ok2:w2.ok,dir:c.k.dir,found:c.found,gate:REGION().gates.some(g=>g.gyc===0)}});
  ok(`몹 부탁: 미리 못 받음 ${!r5.okEarly} · ${r5.hv}/3 → 징조 ${r5.sign} · 맞수 ${r5.mob}: 이기기 전 ${!r5.beforeWin} → 방위 ${r5.dir} · 아직 입구 숨음 ${!r5.gate}`,!r5.okEarly&&r5.hv===3&&r5.ok1&&r5.sign&&r5.mob&&!r5.beforeWin&&r5.ok2&&r5.dir&&!r5.found&&!r5.gate);
  // 6. 흔적: 맵을 알면 흔적 자리가 반짝이고, 살피면 입구가 드러난다. 동굴에 들어갈 수 있다
  const r6=await p.evaluate(()=>{const c=G.gyc.list[0];P.x=c.tx;P.y=c.ty;P.chan=null;update(.05);const ch=P.chan&&P.chan.label;if(P.chan)P.chan.fn();
    return{ch,tr:Math.hypot(c.tx-c.x,c.ty-c.y),found:c.found,gate:REGION().gates.some(g=>g.gyc===0),slots:Object.values(c.k).every(v=>v)}});
  ok(`흔적(입구에서 ${r6.tr.toFixed(1)}칸) "${r6.ch}" → 입구 드러남 ${r6.found} · 출입구 ${r6.gate} · 다섯 칸 ${r6.slots}`,r6.ch==='흔적을 살핀다'&&r6.found===1&&r6.gate&&r6.slots);
  const r6b=await p.evaluate(()=>{openPanel('quest');return $('wbody').textContent});
  ok(`임무창 단서 수첩·다음 할 일·정탐꾼 진척`,r6b.includes('단서 수첩')&&r6b.includes('입구를 찾았다')&&r6b.includes('정탐꾼'));
  await p.screenshot({path:shot('t164_card')});await p.evaluate(()=>closePanels());
  // 7. 다른 길: 입구 맵에서 운기하면 방위, 입구 곁에 다가가면 저절로, 정보 단체 극비는 바로 드러냄, 문파 정탐 보고(공적)
  const r7=await p.evaluate(()=>{const c=G.gyc.list[1];enterRegion(c.host,arriveAt(c.host).x,arriveAt(c.host).y);P.x=c.x+12>N-2?c.x-12:c.x+12;P.y=c.y;P.medit=1;for(let i=0;i<70;i++)update(.1);P.medit=0;const dir=c.k.dir;
    P.x=c.x+.5;P.y=c.y+1.2;update(.05);const near=c.found;
    const d=G.gyc.list[2];gycHear(d,3,'극비');
    const e=G.gyc.list[3];e.k.pv=1;P.sect='namgung';P.srank={namgung:3};P.merit.namgung=1000;const h=gyclRepHtml(SECTS.namgung);sectAct('gyrep',String(e.i));const m=1000-P.merit.namgung;
    return{dir,near,intel:d.found&&REGIONS[d.host].gates.some(g=>g.gyc===d.i),rep:h.includes('gyrep:'+e.i),m,map:e.k.map}});
  ok(`운기로 방위 ${r7.dir} · 입구 곁 저절로 ${r7.near} · 정보 단체 극비 ${r7.intel} · 정탐 보고 단추 ${r7.rep} 공적 -${r7.m} → 맵 ${r7.map}`,r7.dir===1&&r7.near===1&&r7.intel&&r7.rep&&r7.m>0&&r7.map===1);
  // 8. 옛 저장: 단서 칸·증인 없던 동굴은 들은 단계와 들어가 본 것으로 채운다. 저장·불러오기 뒤에도 그대로
  const r8=await p.evaluate(()=>{const c=G.gyc.list[4];delete c.k;delete c.wit;delete c.found;c.heard=1;c.hints={0:'옛 소문',2:'옛 맵 소문'};c.seen=0;c.mark=0;gyclEnsure(c);
    const a={k:{...c.k},hint:c.hints.map,wit:c.wit.length};const f=G.gyc.list[3];delete f.k;delete f.wit;f.seen=1;gyclEnsure(f);
    saveGame(true);const j=JSON.stringify(G.gyc.list.map(c=>[c.k,c.wit.map(w=>w.ok+w.n)]));loadGame();gycSync();return{a,seen:f.found&&f.k.trace,same:JSON.stringify(G.gyc.list.map(c=>[c.k,c.wit.map(w=>w.ok+w.n)]))===j,
      gate:REGIONS[G.gyc.list[0].host].gates.some(g=>g.gyc===0),hid:!REGIONS[G.gyc.list[4].host].gates.some(g=>g.gyc===4)}});
  ok(`옛 저장 들은 단계 1 → ${JSON.stringify(r8.a.k)} 힌트 "${r8.a.hint}" 증인 ${r8.a.wit} · 들어가 본 동굴 드러남 ${r8.seen} · 불러오기 뒤 같음 ${r8.same} · 찾은 입구 남고 못 찾은 입구 숨음 ${r8.gate&&r8.hid}`,
    r8.a.k.pv&&r8.a.k.map&&r8.a.k.sign&&!r8.a.k.dir&&r8.a.hint==='옛 맵 소문'&&r8.a.wit===3&&r8.seen&&r8.same&&r8.gate&&r8.hid);
  // 9. 기연이 나오는 모습: 상자 말고 동굴 벽화(베껴 적기)와 기인이사(수호자를 물리치면 구결을 전하고 떠난다)
  const r9=await p.evaluate(()=>{const L=G.gyc.list.filter(c=>c.art),out={forms:G.gyc.list.map(c=>c.form).join()};
    const a=L[0],b=L[1];for(const c of[a,b]){c.done=0;c.by=null;c.found=1;delete P.arts[c.art];P.bag=P.bag.filter(i=>i.art!==c.art)}a.form='mural';b.form='hermit';
    enterRegion('gyc_'+a.i,22.5,40.3);let box=nodes.find(n=>n.t==='gybox');const g=mobs.find(m=>m.gycGuard===a.i);P.x=box.x;P.y=box.y+.6;gycOpen(box);out.mBlock=!P.chan;g.hp=0;prune(mobs,m=>m.hp>0);gycOpen(box);out.mLabel=P.chan&&P.chan.label;P.chan.fn();P.chan=null;
    out.mBook=(P.bag.find(i=>i.art===a.art)||{}).name;out.mForm=box.form;
    enterRegion('gyc_'+b.i,22.5,40.3);box=nodes.find(n=>n.t==='gybox');const h=npcsHere().find(n=>n.gyherm===b.i),g2=mobs.find(m=>m.gycGuard===b.i);openNpc(h);out.hWait=!/data-act="gyherm/.test($('wbody').innerHTML);
    g2.hp=0;prune(mobs,m=>m.hp>0);openNpc(h);out.hBtn=/data-act="gyherm/.test($('wbody').innerHTML);sectAct('gyherm',String(b.i));
    out.hBook=(P.bag.find(i=>i.art===b.art)||{}).name;out.hGone=!npcsHere().some(n=>n.gyherm===b.i);out.hDone=b.done;return out});
  ok(`모습 ${r9.forms} · 벽화: 수호자 전엔 막힘 ${r9.mBlock} "${r9.mLabel}" → ${r9.mBook} · 기인이사: 수호자 전엔 기다림 ${r9.hWait} → 단추 ${r9.hBtn} → ${r9.hBook}, 떠남 ${r9.hGone}`,
    r9.forms.split(',').every(f=>['box','mural','hermit'].includes(f))&&r9.mBlock&&r9.mLabel==='벽화를 베껴 적는다'&&/벽화 필사본/.test(r9.mBook)&&r9.hWait&&r9.hBtn&&/기인의 구결/.test(r9.hBook)&&r9.hGone&&r9.hDone===1);
  await p.screenshot({path:shot('t164_hermit')});
  // 10. 표행: 밤엔 노숙(모닥불)·한낮엔 휴식, 그때만 표사에게 말을 걸 수 있다 (머리 위 '!')
  const r10=await p.evaluate(()=>{const id=Object.keys(REGIONS).find(k=>/^pv_henan/.test(k));enterRegion(id,arriveAt(id).x,arriveAt(id).y);tod=.3;let cv=null;for(let t=0;t<10&&!cv;t++)cv=cvSpawn('pyo');if(!cv)return{none:1};
    update(.05);const moving=!cv.rest,m=cv.mem.find(q=>q.cvRole==='guard');P.x=m.x+1;P.y=m.y;const busy=(cvTalkTap(m),!$('wbody').innerHTML.includes('노숙'));
    tod=.9;update(.05);const camp=cv.rest,stop=cv.stop;const L=[];runHooks('drawList',L);const marks=L.length;m.x=P.x-1;m.y=P.y;cvTalkTap(m);const html=$('wbody').textContent;closePanels();
    const told=cv.told.has(m);tod=.5;update(.05);const noon=cv.rest;tod=.35;update(.05);return{moving,busy,camp,stop,marks,html:html.slice(0,80),told,noon,after:cv.rest}});
  ok(`표행 낮엔 길 재촉 ${r10.moving}·말 안 됨 ${r10.busy} → 밤 ${r10.camp}(멈춤 ${r10.stop}) 말 걸면 "${r10.html}" · 들음 ${r10.told} · 한낮 ${r10.noon} · 다시 출발 ${r10.after}`,
    !r10.none&&r10.moving&&r10.busy&&r10.camp==='camp'&&r10.stop&&r10.html.includes('노숙')&&r10.told&&r10.noon==='rest'&&r10.after==null);
  // 11. 따라나선 표행: 수레는 천천히, 맵 여러 곳을 지나고(길목에 닿으면 함께 다음 맵으로), 노숙·휴식을 겪고 모닥불가에서 생명이 돈다. 마지막 맵 길목에서 품삯
  const r11a=await p.evaluate(()=>{closePanels();CVS.slice().forEach(cv=>cvEnd(cv,true));tod=.3;const nb=PV_NB('henan').find(n=>n!=='henan'&&PROV[n]);
    P.quests=[{n:'시험 표행',kind:'escort',cnt:1,have:0,hired:1,run:'t',reg:pvId('henan'),dst:nb,dep:nowS()+200,cargo:CARV.cargo[0].k,hands:1,legs:3,leg:0,silver:100,vit:10,fame:1,good:1,pyo:'gaebong',pyoN:'진원표국',pyoAt:'개봉'}];
    const id=Object.keys(REGIONS).find(k=>/^pv_henan/.test(k)&&REGIONS[k].win);enterRegion(id,arriveAt(id).x,arriveAt(id).y);runHooks('regionLoaded',id);
    let cv=null;for(let t=0;t<40&&!cv;t++){update(.05);cv=CVS.find(c=>c.q)}if(!cv)return{none:1};
    const q=P.quests[0];return{sp:cv.cart.sp/cv.cart.d.sp,from:REG,legTxt:questWhere?questWhere(q):'',to:cv.dest.to,waves:cv.waves.length}});
  ok(`표행 출발: 수레 걸음 ×${r11a.sp} · 첫 맵 습격 ${r11a.waves} · 다음 맵 ${r11a.to}`,!r11a.none&&r11a.sp===0.5&&/^pv_/.test(r11a.to||''));
  await p.evaluate(()=>{const cv=CVS.find(c=>c.q);cvArrive(cv)});await p.waitForTimeout(900);
  const r11=await p.evaluate(()=>{const q=P.quests[0];let cv=null;for(let t=0;t<40&&!cv;t++){update(.05);cv=CVS.find(c=>c.q)}if(!cv)return{none:1,reg:REG,q:JSON.stringify(q)};
    const leg=q.leg,reg=REG,same=q.reg===pvBase(REG),walkOk=walkAt(P.x,P.y);tod=.9;update(.05);const camp=cv.rest;P.hp=P.maxHp*.5;P.x=cv.cart.x+.9;P.y=cv.cart.y+1.6;if(!walkAt(P.x,P.y)){P.x=cv.cart.x+.9;P.y=cv.cart.y+.9}
    const h0=P.hp;for(let i=0;i<10;i++)update(.1);const heal=P.hp-h0;tod=.3;update(.05);
    q.leg=q.legs-1;const s0=P.silver;cvArrive(cv);return{leg,reg,same,walkOk,camp,heal,paid:P.silver-s0,left:P.quests.length}});
  ok(`다음 맵(${r11.reg})으로 함께 넘어감 · 맵 ${r11.leg+1}/3 · 걸을 수 있는 자리 ${r11.walkOk} · 따라나선 표행도 밤엔 ${r11.camp} · 모닥불가 생명 +${Math.round(r11.heal||0)} · 마지막 길목 품삯 ${r11.paid}`,
    !r11.none&&r11.leg===1&&r11.same&&r11.walkOk&&r11.camp==='camp'&&r11.heal>0&&r11.paid===100&&r11.left===0);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

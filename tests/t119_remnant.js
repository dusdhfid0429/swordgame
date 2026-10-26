// 멸문 뒤: 장경각 약탈 · 문주전 비밀 통로와 기관 지하도 · 잔당 소탕과 절멸 (src/g_remnant.js, 사용자 2026-10-26)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const tick=()=>p.evaluate(()=>runHooks('tick',.05));

  // 1. 단리세가 멸문 → 잔당이 들판·산에 숨는다
  const a=await p.evaluate(()=>{mobs=[];popLose('danri',99999,'시험');remnSync();const r=G.remn.danri,R=REGIONS[r.reg];
    return{reg:r.reg,left:r.left,lead:r.lead,known:r.known,wild:/^(pv_|lm_)/.test(r.reg)&&!R.city&&!R.hq,card:/단리세가/.test(remnCard())&&/모른다/.test(remnCard())}});
  ok(`멸문 → 잔당 ${a.left}명(전인 ${a.lead}) ${a.reg} 들판·산 ${a.wild} · 숨은 곳 모름 ${a.known===0} · 임무창 칸 ${a.card}`,a.left===4&&a.lead===1&&a.wild&&a.known===0&&a.card);

  // 2. 장경각(서재) 서가: 직접 전수를 뺀 무공을 모두 익힌다
  await p.evaluate(()=>{P.realm=3;enterRegion('in_hq_danri_1',7.5,9.5)});await p.waitForTimeout(300);
  const l=await p.evaluate(()=>{const n=nodes.find(q=>q.t==='lib');if(!n)return{none:1};interact({node:n});const ch=P.chan&&P.chan.label;P.chan.fn();P.chan=null;
    const it=P.bag.find(q=>q.slot==='lib');P.vit=9999;P.wis=99;
    for(const id of libArts('danri',0)){P.arts[id]=P.arts[id]||{p:0,f:ARTS[id].forms.map(()=>false)};P.arts[id].p=9999}
    openPanel('bag');const bag=document.body.innerText;readBook(it);const dlg=document.body.innerText;
    for(const id of libArts('danri',0))for(let i=0;i<9;i++)sectAct('libl',String(it.id),id);
    const all=libArts('danri',0).every(id=>allLearned(id)),hi=libArts('danri',1)[0],hiL=!!(A(hi)&&A(hi).f.some(Boolean));closePanels();
    return{ch,name:it&&it.name,bag:/펼치기/.test(bag),dlg:/장경각/.test(dlg)&&/단리도법/.test(dlg)&&!/단리파천도/.test(dlg),all,hiL,left:libLeft(it),cd:n.cd,known:G.remn.danri.known}});
  ok(`서가 "${l.ch}" → [${l.name}] 행낭 펼치기 ${l.bag} · 창에 단리도법 있고 파천도(직전) 없음 ${l.dlg} · 모두 익힘 ${l.all} (직접 전수 안 익힘 ${!l.hiL}) 남은 ${l.left} · 다시 못 뒤짐 ${l.cd>0} · 잔당 쪽지 ${l.known}`,
    l.ch==='장경각 서가를 뒤진다'&&l.name==='단리세가 장경각 비급'&&l.bag&&l.dlg&&l.all&&!l.hiL&&l.left===0&&l.cd>0&&l.known===1);

  // 3. 문주전: 촛대 셋과 현판. 틀리면 화살·처음부터, 맞으면 서가 뒤 비밀 통로
  await p.evaluate(()=>{G.remn.danri.known=0;enterRegion('in_hq_danri_0',7.5,9.5)});await p.waitForTimeout(300);
  const m=await p.evaluate(()=>{const ms=nodes.filter(q=>q.t==='mech'),pl=nodes.find(q=>q.t==='plaque'),g0=REGION().gates.some(g=>g.tn);
    interact({node:pl});const want=tnOrder(SECTS.danri),turn=k=>{const n=ms.find(q=>q.k===k);interact({node:n});P.chan.fn();P.chan=null};
    P.hp=P.maxHp;P.inv=0;const R0=Math.random;Math.random=()=>.99;turn(want[1]);Math.random=R0;const hurt=P.hp<P.maxHp,seq=G.tn.danri.seq.length;
    want.forEach(turn);const g=REGION().gates.find(g=>g.tn==='danri');
    return{n:ms.length,pl:!!pl,g0,hurt,seq,open:G.tn.danri.open,g:!!g,to:g&&g.to,walk:g&&walk(Math.floor(g.x),Math.floor(g.y))}});
  ok(`문주전 촛대 ${m.n} · 현판 ${m.pl} · 처음엔 통로 안 보임 ${!m.g0} · 틀리면 화살 ${m.hurt} 처음부터 ${m.seq===0} · 맞으면 열림 ${m.open} → ${m.to} (걸을 칸 ${m.walk})`,m.n===3&&m.pl&&!m.g0&&m.hurt&&m.seq===0&&m.open===1&&m.to==='tn_danri'&&m.walk);

  // 4. 기관 지하도: 철침·화살 발판, 출구는 잔당이 숨은 맵으로
  await p.evaluate(()=>{const g=REGION().gates.find(g=>g.tn);enterRegion(g.to,g.tx,g.ty)});await p.waitForTimeout(300);
  const t=await p.evaluate(()=>{const tr=TN&&TN.traps||[],sp=tr.find(q=>q.k==='spike'),ar=tr.find(q=>q.k==='arrow'),ex=nodes.find(q=>q.t==='tnexit');
    P.hp=P.maxHp;P.inv=0;const R0=Math.random;Math.random=()=>.99;P.x=sp.x;P.y=sp.y;sp.ph=0;const t0=time;time=Math.ceil(time/2.6)*2.6+.1;runHooks('tick',.05);const hs=P.hp<P.maxHp;
    P.hp=P.maxHp;P.x=ar.x;P.y=ar.y;runHooks('tick',.05);const arm=ar.arm>0;runHooks('tick',.5);const ha=P.hp<P.maxHp;Math.random=R0;time=t0;
    const sn=new Set(),q=[[Math.floor(P.x),Math.floor(P.y)]];const g0=REGION().gates[0];q[0]=[Math.floor(g0.x),Math.floor(g0.y)-1];while(q.length){const[x,y]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=X+','+Y;if(!sn.has(k)&&walk(X,Y)){sn.add(k);q.push([X,Y])}}}
    const reach=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>sn.has((Math.floor(ex.x)+dx)+','+(Math.floor(ex.y)+dy)));
    return{reach,sp:tr.filter(q=>q.k==='spike').length,ar:tr.filter(q=>q.k==='arrow').length,hs,arm,ha,ex:!!ex,back:REGION().gates[0].to,name:REGION().name}});
  ok(`${t.name}: 철침 ${t.sp} 화살 ${t.ar} · 철침에 찔림 ${t.hs} · 발판 딸깍 ${t.arm} 화살 ${t.ha} · 출구 ${t.ex} 걸어서 닿음 ${t.reach} · 들어온 문 → ${t.back}`,t.sp>=6&&t.ar>=3&&t.hs&&t.arm&&t.ha&&t.ex&&t.reach&&t.back==='in_hq_danri_0');
  await p.evaluate(()=>{const n=nodes.find(q=>q.t==='tnexit');P.hp=P.maxHp;interact({node:n});P.chan.fn();P.chan=null});await p.waitForTimeout(900);
  for(let i=0;i<3;i++)await tick();
  const e=await p.evaluate(()=>{const r=G.remn.danri,rm=mobs.filter(m=>m.remn==='danri'),ld=rm.find(m=>m.remnLead);
    return{reg:REG,want:r.reg,known:r.known,walk:walkAt(P.x,P.y),n:rm.length,lead:ld&&ld.name,art:ld&&ARTS[ld.art].n,hostile:rm.every(m=>!peaceful(m))}});
  ok(`출구 → ${e.reg} (잔당 맵 ${e.want}) 알게 됨 ${e.known} 걸을 칸 ${e.walk} · 잔당 ${e.n}명 · ${e.lead} [${e.art}] · 모두 적 ${e.hostile}`,e.reg===e.want&&e.known===1&&e.walk&&e.n===4&&e.lead==='단리세가 최후의 전인'&&e.art==='단리파천도'&&e.hostile);

  // 5. 졸개를 다 쓰러뜨리면 전인이 달아난다. 놓치면 다른 곳으로 숨고, 달아나는 중에 쓰러뜨리면 그 자리에서 비전
  const f=await p.evaluate(()=>{for(const m of mobs.filter(m=>m.remn&&!m.remnLead)){m.hp=0;runHooks('kill',m)}const ld=mobs.find(m=>m.remnLead);runHooks('mobTick',ld,.05);const esc=ld.escT>0,reg0=REG;
    ld.escT=.01;runHooks('mobTick',ld,.05);const r=G.remn.danri;return{esc,gone:!mobs.includes(ld),moved:r.reg!==reg0,left:r.left,lead:r.lead,known:r.known}});
  ok(`전인 탈출 시도 ${f.esc} · 놓치면 사라짐 ${f.gone} 다른 맵으로 ${f.moved} · 다시 모은 잔당 ${f.left} 전인 ${f.lead} · 숨은 곳 모름 ${f.known===0}`,f.esc&&f.gone&&f.moved&&f.left===3&&f.lead===1&&f.known===0);
  await p.evaluate(()=>{const r=G.remn.danri;mobs=[];enterRegion(r.reg,(REGIONS[r.reg].size||40)/2,(REGIONS[r.reg].h||REGIONS[r.reg].size||40)/2);tnArrive.call(null)});await p.waitForTimeout(300);
  for(let i=0;i<3;i++)await tick();
  const k=await p.evaluate(()=>{P.tnArr=1;tnArrive();const rm=mobs.filter(m=>m.remn==='danri');for(const m of rm.filter(m=>!m.remnLead)){m.hp=0;runHooks('kill',m)}
    const ld=rm.find(m=>m.remnLead);runHooks('mobTick',ld,.05);const esc=ld.escT>0;ld.hp=0;runHooks('kill',ld);const it=P.bag.find(q=>q.slot==='lib'&&q.hi);
    P.vit=9999;const hi=libArts('danri',1)[0];P.arts[hi]={p:9999,f:ARTS[hi].forms.map(()=>false)};for(let i=0;i<9;i++)sectAct('libl',String(it.id),hi);
    return{n:rm.length,esc,it:it&&it.name,hi:allLearned(hi),gone:sectGone('danri'),remn:!!G.remn.danri,pop:sectPop('danri')}});
  ok(`다시 찾은 잔당 ${k.n}명 · 달아나는 전인을 쓰러뜨려 그 자리에서 [${k.it}] · 직접 전수 무공 모두 익힘 ${k.hi} · 절멸 ${k.gone} 잔당 기록 지움 ${!k.remn}`,k.n===3&&k.esc&&k.it==='단리세가 최후의 비전'&&k.hi&&k.gone&&!k.remn&&k.pop===0);

  // 6. 사라진 문파: 목록·역참·인원표에 없고, 세력이 바닥나 되살려도·시간이 지나도 돌아오지 않는다
  const g=await p.evaluate(()=>{const al=SECTS.danri.al,list=allianceDlg(al),post=postDlg(),card=popCard(),seats=maengSeats(al).some(x=>x.s.id==='danri');
    const f=alFac(SECTS.danri.al),w=wld();const pw=w.pow[f];w.pow[f]=0;setPow(f,pw||30);for(let i=0;i<3;i++)runHooks('newYear');popReset();
    remnSync();saveGame(true);applySave(loadGame());
    return{list:/단리세가/.test(list),post:/단리세가/.test(post),card:/단리세가/.test(card),seats,pop:sectPop('danri'),again:!!G.remn.danri,gone:sectGone('danri'),other:/남궁세가|모용세가|황보세가/.test(list)}});
  ok(`맹 목록 ${g.list} · 역참 ${g.post} · 인원표 ${g.card} · 맹 자리 ${g.seats} → 모두 없음 · 세력 되살리고 3년 뒤 인원 ${g.pop} 잔당 다시 안 생김 ${!g.again} · 저장 뒤 절멸 ${g.gone} · 다른 문파는 그대로 ${g.other}`,
    !g.list&&!g.post&&!g.card&&!g.seats&&g.pop===0&&!g.again&&g.gone&&g.other);
  // 절멸한 문파의 문주전엔 더 이상 촛대·통로가 없다
  await p.evaluate(()=>enterRegion('in_hq_danri_0',7.5,9.5));await p.waitForTimeout(300);
  const z=await p.evaluate(()=>({mech:nodes.some(q=>q.t==='mech'),gate:REGION().gates.some(g=>g.tn)}));
  ok(`절멸 뒤 문주전 촛대 ${z.mech} 통로 ${z.gate} → 없음`,!z.mech&&!z.gate);

  // 7. 살아 있는 문파: 직접 전수(고급) 말고는 장로에게 배우거나 장경각에서 열람해 익힌다 (제자만)
  const lv=await p.evaluate(()=>{const s=SECTS.hwasan,ids=libArts('hwasan',0),hi=libArts('hwasan',1)[0];P.sect=null;P.wis=99;P.vit=9999;
    const el=Object.keys(REGIONS).map(k=>(REGIONS[k].npcs||[]).find(n=>n.elder==='hwasan')).find(Boolean);
    const out=pNpc(el);P.sect='hwasan';P.srank={hwasan:0};const inn=pNpc(el);
    const id=ids[0];delete P.arts[id];sectAct('eteach','hwasan',hi);const vE=P.vit;sectAct('eteach','hwasan',id);const e1=!!(A(id)&&A(id).f[0]),free=P.vit===vE;P.arts[id].p=9999;for(let i=0;i<9;i++)sectAct('eteach','hwasan',id);const e2=allLearned(id);
    const vit0=P.vit;sectAct('eteach','hwasan',hi);const hiNo=!(A(hi)&&A(hi).f.some(Boolean));
    const id2=ids[1]||ids[0];if(id2!==id)delete P.arts[id2];const lib=sectLibDlg(s);sectAct('slibl','hwasan',id2);const l1=!!(A(id2)&&A(id2).f[0]);
    return{el:!!el,out:/장로의 가르침/.test(out),inn:/장로의 가르침/.test(inn)&&!new RegExp(ARTS[hi].n).test(inn.split('장로의 가르침')[1]),e1,e2,free,hiNo,lib:/장경각/.test(lib)&&!new RegExp(ARTS[hi].n).test(lib),l1,vit:P.vit<vit0,hall:libHall(s)}});
  await p.evaluate(h=>{P.sect='hwasan';enterRegion(h,7.5,9.5)},lv.hall);await p.waitForTimeout(300);
  const ln=await p.evaluate(()=>{const n=nodes.find(q=>q.t==='lib'&&q.live);if(!n)return{};interact({node:n});const t=document.body.innerText;closePanels();return{n:1,open:/열람/.test(t)}});
  ok(`화산 장로: 제자 아니면 가르침 없음 ${!lv.out} · 제자면 있음(직접 전수 빠짐) ${lv.inn} · 배움 ${lv.e1} 모두 ${lv.e2} 활력 안 듦 ${lv.free} · 고급은 장로가 못 가르침 ${lv.hiNo} · 장경각 열람(고급 없음) ${lv.lib} 익힘 ${lv.l1} 활력 듦 ${lv.vit} · 장경각 서가 ${ln.n} 열림 ${ln.open}`,
    lv.el&&!lv.out&&lv.inn&&lv.e1&&lv.e2&&lv.free&&lv.hiNo&&lv.lib&&lv.l1&&lv.vit&&ln.n&&ln.open);

  await p.screenshot({path:require('path').resolve(__dirname,'shots/t119_remnant.png')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// 문파 증축·후기지수·기재 (v239, 사용자 2026-11-03): 인원 + 절정 무공 조건으로 1년 증축 뒤 맵이 커지고, 불러오면 그 저장의 규모로 돌아간다.
// 후기지수는 세력마다 정원, 경지는 사건으로 무작위, 기재는 화경에 이르러 절정 무공을 창안한다. 문도는 장경각에 절정 비급을 바친다
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{window.yr=()=>{G.cal=Math.floor(G.cal)+1;runHooks('newYear')};
    window.check=s=>{const bad=[];for(const id of REGIONS[hqId(s)].chain||[hqId(s)]){loadRegion(id);for(const g of REGION().gates)if(!REGIONS[g.to])bad.push(id+'→'+g.to);else if(!g.door&&!walk(Math.floor(g.x),Math.floor(g.y)))bad.push(id+' 막힘 '+g.label);
      for(const h of REGION().halls||[])for(const f of[h.id,...(REGIONS[h.id].floorIds||[])])loadRegion(f);loadRegion(id)}return bad}});
  // 1. 소문파 언가: 인원만 차서는 안 크고, 절정 비급을 바치면 이듬해 증축 시작 → 1년 뒤 산문이 생긴 중견 규모
  const r1=await p.evaluate(()=>{const s=SECTS.eon;P.sect='eon';G.pop.eon=150;const pv=REGIONS.hq_eon.gates.find(g=>/^(pv_|lm_)/.test(g.to)).to;yr();const a0=!(G.sbuild&&G.sbuild.eon);
    const a=Object.values(ARTS).find(x=>x.grade>=3&&!x.gy&&!x.made&&!s.arts.some(q=>q.id===x.id)&&x.forms);const it=mkBook(a.id,0);P.bag.push(it);
    const h=sgDonHtml(s);sectAct('sgdon',String(it.id));const don=s.arts.some(q=>q.id===a.id&&q.dn)&&jeolN(s)>=1;G.pop.eon=150;yr();const st=G.sbuild&&G.sbuild.eon&&G.sbuild.eon.t;G.pop.eon=150;yr();
    const gate=REGIONS.hq_eon_gate,back=REGIONS[pv].gates.find(g=>g.to==='hq_eon_gate');return{a0,btn:/sgdon/.test(h),don,st,lt:G.slt&&G.slt.eon,gate:!!gate,back:!!back,tier:s.lt,bad:check(s),floors:(REGIONS.hq_eon.halls||[]).some(h=>(REGIONS[h.id].floorIds||[]).length)}});
  ok(`인원만으론 증축 없음 ${r1.a0} · 장경각 비급 바치기 ${r1.btn},${r1.don} → 증축 ${r1.st} → 규모 ${r1.lt}/${r1.tier}, 산문 ${r1.gate}, 바깥 길 ${r1.back}, 2층 전각 ${r1.floors}, 막힌 곳 ${r1.bad.join(',')||'없음'}`,
    r1.a0&&r1.btn&&r1.don&&r1.st==='mid'&&r1.lt==='mid'&&r1.tier==='mid'&&r1.gate&&r1.back&&r1.floors&&!r1.bad.length);
  // 2. 다른 저장을 불러오면(G.slt 없음) 처음 모습, 대문파 규모 저장이면 외원·후산까지
  const r2=await p.evaluate(()=>{const s=SECTS.eon;delete G.slt;sgSync(true);const a={gate:!!REGIONS.hq_eon_gate,lt:s.lt||null,halls:REGIONS.hq_eon.halls.length,bad:check(s)};
    G.slt={eon:'big'};sgSync(true);const c={outer:!!REGIONS.hq_eon_outer,back:!!REGIONS.hq_eon_back,chain:REGIONS.hq_eon.chain.length,bad:check(s),vault:!!REGIONS[REGIONS.hq_eon.vaultAt]};return{a,c}});
  ok(`되돌림: 산문 ${r2.a.gate}, 규모 ${r2.a.lt}, 전각 ${r2.a.halls}, 막힘 ${r2.a.bad.join(',')||'없음'} · 대문파 저장: 외원 ${r2.c.outer} 후산 ${r2.c.back} 맵 ${r2.c.chain} 금고 ${r2.c.vault} 막힘 ${r2.c.bad.join(',')||'없음'}`,
    !r2.a.gate&&!r2.a.lt&&r2.a.halls===3&&!r2.a.bad.length&&r2.c.outer&&r2.c.back&&r2.c.chain===4&&r2.c.vault&&!r2.c.bad.length);
  // 3. 후기지수: 세력마다 정원 (기재는 정원 밖: 1번에서 언가 인원 150이라 5% 확률로 기재가 나올 수 있다), 확률 배율 훅, 오르면 hugiUp
  const r3=await p.evaluate(()=>{G.slt={};sgSync(true);const n={};for(const h of hgLive())if(!h.prod)n[h.fac]=(n[h.fac]||0)+1;const h=hgLive().find(x=>!x.prod),rk0=h.rk;let up=null;
    hook("hugiMul",c=>{if(window._mul!=null)c.mul*=window._mul});hook('hugiUp',(x,f,t,c)=>{up=[x.id,f,t,c]});window._mul=0;let z=0;for(let i=0;i<50;i++)if(hugiRoll(h,'bm'))z++;
    window._mul=1e6;const ok1=hugiRoll(h,'bm');window._mul=null;return{n,zero:z,up,rk0,rk:h.rk,id:h.id}});
  ok(`후기지수 정원 ${JSON.stringify(r3.n)} · 배율 0이면 안 오름 (${r3.zero}) · 배율 크면 ${r3.rk0}→${r3.rk}, hugiUp ${JSON.stringify(r3.up)}`,
    r3.n['정']===3&&r3.n['사']===2&&r3.n['마']===2&&r3.n['관']===2&&r3.zero===0&&r3.rk===r3.rk0+1&&r3.up&&r3.up[0]===r3.id);
  // 4. 기재: 소문파 인원 150·절정 무공 없음 → 출현, 화경에 오르면 절정 무공 창안·문파 등록·장로
  const r4=await p.evaluate(()=>{const s=SECTS.ak;G.pop.ak=150;G.hgProdY=null;const sp=HUGI.prod.p;HUGI.prod.p=1;let h=null;for(let i=0;i<30&&!(h&&h.sid==='ak');i++){G.hgProdY=null;h=hugiProd()}HUGI.prod.p=sp;
    if(!h)return{};const j0=jeolN(SECTS[h.sid]);window._mul=1e6;for(let i=0;i<10&&!h.art;i++)hugiRoll(h,'gy');window._mul=null;const a=h.art&&ARTS[h.art],S=SECTS[h.sid];
    const again=hugiProd();return{sid:h.sid,j0,rk:h.rk,art:a&&a.n,grade:a&&a.grade,reg:S.arts.some(q=>q.id===h.art),j1:jeolN(S),elder:h.elder,gap:again===null,def:!!(G.made[h.art]&&G.made[h.art].sect===h.sid)}});
  ok(`기재 출현 ${r4.sid} (절정 ${r4.j0}) → 경지 ${r4.rk} · 창안 [${r4.art}] 등급 ${r4.grade} 등록 ${r4.reg} 절정 ${r4.j1} 장로 ${r4.elder} · 10년 안 다시 안 나옴 ${r4.gap}`,
    r4.sid&&r4.j0===0&&r4.rk>=5&&r4.art&&r4.grade===3&&r4.reg&&r4.def&&r4.j1===1&&r4.elder&&r4.gap);
  // 5. 본산 마당의 정식 NPC: 말 걸면 경지, 강제로 쓰러뜨리면 명단에서 죽음(후임 없음)
  const r5=await p.evaluate(()=>{const h=hgLive().find(x=>!x.prod&&REGIONS[hqId(SECTS[x.sid])]);const s=SECTS[h.sid];enterRegion(hqId(s),20.5,30);P.reg=REG;const n=REGION().npcs.find(q=>q.hugi===h.id);if(!n)return{n:false};
    const dlg=hugiDlg(n);forceAtk=true;const e=npcFight(n,true);forceAtk=false;const realm=e&&e.realm;runHooks('kill',e);mobs=mobs.filter(m=>m!==e);
    enterRegion(hqId(s),20.5,30);return{n:true,dlg:dlg.includes(RANKS[h.rk]),realm,rk:h.rk,dead:h.dead,dc:h.dc,gone:!REGION().npcs.some(q=>q.hugi===h.id),nd:!Object.keys(G.ndead||{}).some(k=>k.endsWith('/hg'+h.id))}});
  ok(`후기지수 NPC ${r5.n}, 대화에 경지 ${r5.dlg}, 무인 경지 ${r5.realm}=${r5.rk}, 쓰러뜨리면 죽음 ${r5.dead}/${r5.dc}, 맵에서 사라짐 ${r5.gone}, 후임 없음 ${r5.nd}`,
    r5.n&&r5.dlg&&r5.realm===r5.rk&&r5.dead&&r5.dc==='player'&&r5.gone&&r5.nd);
  // 6. 저장·불러오기: 명단·증축·바친 비급·창안 무공이 남는다
  const r6=await p.evaluate(()=>{G.slt={eon:'mid'};sgSync(true);saveGame(true);const n=G.hugi.length,art=Object.values(G.made).find(d=>d.hugi);location.reload();return{n,art:art&&art.id}});
  await p.waitForFunction(()=>typeof loadRegion==='function');await p.waitForTimeout(300);
  const r7=await p.evaluate(()=>{applySave(loadGame());return{n:(G.hugi||[]).length,gate:!!REGIONS.hq_eon_gate,lt:SECTS.eon.lt,don:SECTS.eon.arts.some(q=>q.dn)}});
  const r8=await p.evaluate(id=>({art:!!ARTS[id],reg:Object.values(SECTS).some(s=>s.arts.some(q=>q.id===id))}),r6.art);
  ok(`불러온 뒤: 명단 ${r7.n}=${r6.n}, 언가 산문 ${r7.gate} 규모 ${r7.lt}, 바친 비급 ${r7.don}, 기재 창안 무공 ${r8.art}/${r8.reg}`,r7.n===r6.n&&r7.gate&&r7.lt==='mid'&&r7.don&&r8.art&&r8.reg);
  console.log(errs.length?'ERRORS\n'+errs.slice(0,8).join('\n'):'오류 없음');await b.close()})();

// 창안 재료를 얻는 길 (사용자 2026-10-26): 견식(투학) · 비급 낱장 · 은거기인 (src/g_mkmat.js)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);

  // 1. 은거기인 무공: 열둘 × 셋 = 중승 36가지, 병기마다 여섯, 정사 공용, 이름이 겹치지 않는다
  const a=await p.evaluate(()=>{const L=Object.values(ARTS).filter(a=>a.rc),by={};L.forEach(a=>by[a.cls]=(by[a.cls]||0)+1);
    const names=Object.values(ARTS).map(a=>a.n);return{n:L.length,g:L.every(a=>a.grade===1&&a.side===null&&a.forms.length===5),by,dup:names.length-new Set(names).size,sectG1:Object.values(ARTS).filter(a=>a.grade===1&&!a.rc).length}});
  ok(`은거기인 무공 ${a.n}가지 (중승·공용·5초식 ${a.g}) 병기별 ${JSON.stringify(a.by)} · 이름 겹침 ${a.dup} · 다른 중승 ${a.sectG1}`,a.n===36&&a.g&&Object.values(a.by).every(v=>v===6)&&Object.keys(a.by).length===6&&a.dup===0);

  // 2. 견식: 맞고·보고·쓰러뜨리면 쌓이고, 아는 초식까지만, 정리하면 사본 비급
  const g=await p.evaluate(()=>{mobs=[];P.gs={};P.realm=1;const id=ARTS['사도1'].id,e=mkMob('산적',P.x+2,P.y);e.art=id;e.known=2;e.d={...e.d,elite:1};
    hurtP(3,e);const hit=P.gs[id]&&P.gs[id].p;mobFormCall(e);const see=P.gs[id].p-hit;
    const far=mkMob('산적',P.x+20,P.y);far.art=id;far.known=2;mobFormCall(far);const seeFar=P.gs[id].p-hit-see;
    for(let i=0;i<10;i++)runHooks('kill',e);const st={...P.gs[id]},need0=gsNeed(ARTS[id],0);
    openPanel('arts');const t=document.querySelector('#wbody')?document.querySelector('#wbody').innerText:document.body.innerText;
    return{id,hit,see,seeFar,p:st.p,k:st.k,need0,cap:st.p<=need0*GSIK.cap,ui:/창안 재료/.test(t)&&/견식/.test(t),btn:!!document.querySelector(`[data-act="gsw:${id}"]:not([disabled])`)}});
  ok(`견식: 맞으면 +${g.hit} 가까이서 보면 +${g.see} 멀면 +${g.seeFar} · 쓰러뜨려 ${g.p}/${g.need0} (상한 지킴 ${g.cap}) 본 초식 ${g.k} · 무공 창 칸 ${g.ui} 정리 단추 ${g.btn}`,g.hit===1&&g.see===4&&g.seeFar===0&&g.p>=g.need0&&g.cap&&g.k===2&&g.ui&&g.btn);
  const w=await p.evaluate(id=>{closePanels();sectAct('gsw',id);const ch=P.chan&&P.chan.label;P.chan.fn();P.chan=null;const bk=P.bag.find(it=>it.slot==='book'&&it.art===id);
    const blk=readBlock(bk),ev=P.evil;P.vit=999;readBook(bk);const s=A(id);
    // 두 초식을 다 적고 나면 세 번째는 그 적이 모르니 적을 수 없다
    P.gs[id].p=999;const n1=nextForm(id,P.gs[id].k);P.arts[id].f[1]=true;const n2=nextForm(id,P.gs[id].k);
    return{ch,tu:bk&&bk.tu,name:bk&&bk.name,form:bk&&bk.form,blk,learned:!!(s&&s.f[0]),evil:P.evil-ev,n1,n2}},g.id);
  ok(`정리 "${w.ch}" → ${w.name} (사본 ${w.tu}, ${w.form+1}초식) · 사파 무공이라도 읽힌다(${w.blk===null}) 익힘 ${w.learned} 악업 +${w.evil} · 다음 적을 초식 ${w.n1} → 둘째까지 익히면 ${w.n2}`,w.ch==='견식을 되새긴다'&&w.tu===1&&w.form===0&&w.blk===null&&w.learned&&w.evil===4&&w.n1===1&&w.n2===-1);
  // 사본이 아닌 다른 계열 비급은 여전히 못 읽는다
  const nb=await p.evaluate(()=>{const bk=mkBook(ARTS['사검2'].id,0);return readBlock(bk)});
  ok(`보통 다른 계열 비급은 그대로 막힘: ${nb}`,/계열 무공이라/.test(nb||''));

  // 3. 비급 낱장: 같은 무공끼리 쌓이고, 등급만큼 모으면 엮어 사본을 만든다
  const l=await p.evaluate(()=>{const hi=SECTS.hwasan.arts.find(q=>q.hi).id,A0=ARTS[hi];P.bag=P.bag.filter(it=>it.slot!=='leaf');
    giveLeaf(hi,2,'시험');giveLeaf(hi,2,'시험');const it=P.bag.find(i=>i.slot==='leaf'&&i.art===hi),n4=it.n,stack=P.bag.filter(i=>i.slot==='leaf').length,b4=readBlock(it),need=leafNeed(A0);
    giveLeaf(hi,need-4);openPanel('bag');const t=document.body.innerText,btn=/엮기/.test(t);closePanels();readBook(it);const bk=P.bag.find(i=>i.slot==='book'&&i.art===hi);
    return{g:A0.grade,need,n4,stack,b4,btn,left:P.bag.filter(i=>i.slot==='leaf').length,bk:bk&&bk.name,tu:bk&&bk.tu,form:bk&&bk.form,desc:itemDesc(it)}});
  ok(`낱장: 절정(${l.g}) ${l.need}장 필요 · 두 번 받아 한 칸 ${l.stack}, ${l.n4}장 (막힘 "${l.b4}") · 행낭 엮기 단추 ${l.btn} → ${l.bk} (사본 ${l.tu}) · 낱장 칸 ${l.left}`,l.g===3&&l.need===6&&l.stack===1&&l.n4===4&&/모자란다/.test(l.b4)&&l.btn&&l.tu===1&&l.form===0&&l.left===0);
  // 낱장이 나오는 곳: 폐허 잔해, 동굴 상자, 표국 행렬
  const src=await p.evaluate(()=>{P.bag=P.bag.filter(it=>it.slot!=='leaf');const R=Math.random;const out={};
    // 폐허: 표를 낱장만 남겨 뒤진다
    const keep=RUIN.rubbleLoot.slice();RUIN.rubbleLoot.splice(0,RUIN.rubbleLoot.length,{w:1,t:'leaf'});G.looted={};ruinLoot({sect:'hwasan',t:'rubble',key:'r0'});RUIN.rubbleLoot.splice(0,1,...keep);
    out.ruin=P.bag.filter(i=>i.slot==='leaf').map(i=>ARTS[i.art].sect).join();
    const CV0=CV.loot.slice();CV.loot.splice(0,CV.loot.length,{w:1,t:'leaf'});P.caveGot={};const cave=Object.keys(REGIONS).find(k=>REGIONS[k].cave);caveChestOpen({cave});CV.loot.splice(0,1,...CV0);
    out.cave=P.bag.filter(i=>i.slot==='leaf').map(i=>AGR[ARTS[i.art].grade]).join();
    cvLeaf('시험 행렬');out.cv=P.bag.filter(i=>i.slot==='leaf').length;
    return out});
  ok(`낱장 출처: 화산 폐허 잔해 → ${src.ruin} · 동굴 상자 → ${src.cave} · 표국 행렬 → 낱장 ${src.cv}칸`,src.ruin==='hwasan'&&/(상승|절정)$/.test(src.cave)&&src.cv>=2);

  // 4. 은거기인: 대별산 정상, 경지가 모자라면 돌려보내고, 부탁을 들어주면 은혜로 전수
  await p.evaluate(()=>{mobs=[];P.realm=0;enterRegion('lm_henan_6',10.5,10.5)});await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{mobs=[];const n=npcsHere().find(q=>q.rc);const at=n&&walk(Math.floor(n.x),Math.floor(n.y));const drawn=NPCF.some(f=>f.n===n.n);
    const d0=rcDlg(n);P.realm=1;const d1=rcDlg(n);P.quests=[];sectAct('rctake','rc_mokdong');const q=P.quests.find(q=>q.rc);
    const from=questFrom(q);q.have=q.cnt;act('qdone:'+P.quests.indexOf(q));const st=rcSt('rc_mokdong');
    const id='rc_mokdong_0';sectAct('rcteach','rc_mokdong','0');const bk=P.bag.find(i=>i.slot==='book'&&i.art===id);P.vit=999;readBook(bk);
    const again=st.tok;sectAct('rcteach','rc_mokdong','1');const none=!P.bag.some(i=>i.art==='rc_mokdong_1');
    return{n:n&&n.n,at,drawn,d0:/트이지 않았/.test(d0),d1:/부탁 듣기/.test(d1)&&/타구봉/.test(d1),q:q&&q.kind+':'+(q.mob||[]).join()+':'+q.cnt,from:from.n+'/'+from.at,tok:again,learned:!!(A(id)&&A(id).f[0]),none,met:!!G.rcMet.rc_mokdong,
      rum:rcRumor(),task2:rcTask(RC.rc_mokdong,st.k).what,task4:rcTask(RC.rc_mokdong,3).cnt}});
  ok(`${r.n} 대별산 정상(걸을 칸 ${r.at}, 그려짐 ${r.drawn}) · 삼류면 돌려보냄 ${r.d0} · 이류면 부탁·무공 ${r.d1} · 부탁 ${r.q} 보고 ${r.from} · 은혜로 타구봉 익힘 ${r.learned} → 남은 은혜 ${r.tok}, 은혜 없으면 못 받음 ${r.none} · 다음 부탁 ${r.task2} · 한 바퀴 돌면 ${r.task4}`,
    r.n==='은거기인 목동노인'&&r.at&&r.drawn&&r.d0&&r.d1&&r.q==='kill:늑대:5'&&/정상/.test(r.from)&&r.learned&&r.tok===0&&r.none&&r.met&&/보리/.test(r.task2)&&r.task4===8&&/꼭대기/.test(r.rum)&&!/대별산/.test(r.rum));
  // 은거기인 봉 무공 다섯을 숙련 100으로 모으면 중승 → 상승 창안 재료가 된다
  const m=await p.evaluate(()=>{P.wis=20;for(const id of['rc_mokdong_0','rc_mokdong_1','rc_mokdong_2','rc_namu_0','rc_namu_1'])P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};
    return mkGroups().map(g=>g.cls+g.g+':'+g.ids.length)});
  ok(`창안 재료 묶음 ${m.join()}`,m.includes('봉1:5'));
  // 저장·불러오기: 견식·은혜·만난 기인이 남는다
  const sv=await p.evaluate(()=>{saveGame(true);applySave(loadGame());return{gs:Object.keys(P.gs||{}).length,tok:P.rc&&P.rc.rc_mokdong&&P.rc.rc_mokdong.k,met:!!(G.rcMet&&G.rcMet.rc_mokdong)}});
  ok(`저장 뒤 견식 ${sv.gs} · 들어준 부탁 ${sv.tok} · 만난 기인 ${sv.met}`,sv.gs>=1&&sv.tok===1&&sv.met);
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t116_mkmat.png')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

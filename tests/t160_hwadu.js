// v248: 성장 상한(기본기·내공은 다음 경지 문턱까지) · 화두로 깨달음을 채워 벽 깨기 · 제작·농사가 활력을 쓴다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];P.vit=99999;const mv=maxVit;window._mv=mv});
  // 상한: 기본기 합이 다음 경지 문턱에 닿으면 수련이 막힌다
  const a=await p.evaluate(()=>{let n=0;const ks=['str','end','agi','qi'];for(let i=0;i<400;i++){const k=ks[i%4];const v=P.st[k];P.vit=99999;trainStat(k);if(P.st[k]>v)n++}
    return{oe:pillarVal('oe'),cap:capOf('oe'),n,why:capWhy('str')}});
  ok(`기본기 합 ${a.oe} = 상한 ${a.cap} (수련 ${a.n}번), 그 뒤 '${a.why}'`,a.oe===a.cap&&a.why==='벽에 막혔다');
  // 한 능력치 몰아 찍기: 문턱의 40%까지
  const s=await p.evaluate(()=>{for(const k of['str','end','agi','qi'])P.st[k]=P.base[k];for(let i=0;i<200;i++){P.vit=99999;trainStat('str')}return{str:P.st.str,cap:statCap1(),why:capWhy('str'),end:capWhy('end')}});
  ok(`근력만 올리면 ${s.str}에서 멈춘다 (끝 ${s.cap}): '${s.why}', 지구력은 '${s.end}'`,s.str<=s.cap&&s.why==='다른 기본기가 모자라다'&&s.end==='');
  const m=await p.evaluate(()=>{const ks=['end','agi','qi'];for(let i=0;i<300;i++){P.vit=99999;trainStat(ks[i%3])}return{oe:pillarVal('oe'),cap:capOf('oe'),min:statMin(),st:{...P.st}}});
  ok(`나머지를 채우면 합 ${m.oe}=${m.cap}, 넷 다 최소치 ${m.min} 이상 (${Object.values(m.st)})`,m.oe===m.cap&&Object.values(m.st).every(v=>v>=m.min));
  // 내공 상한
  const q=await p.evaluate(()=>{P.sim=P.sim;let n=0;for(let i=0;i<300;i++){P.vit=99999;const b0=baseQi();if(capWhy('ne'))break;const g=qiGain();qiAccAdd(g);P.qiN++;n++}recalc();return{q:baseQi(),cap:capOf('ne'),why:capWhy('ne')}});
  ok(`내공 ${q.q} ≥ 상한 ${q.cap} 이면 '${q.why}'`,q.q>=q.cap&&q.why==='벽에 막혔다');
  // 수련 창 단추도 막힌다
  await p.evaluate(()=>{const ks=['str','end','agi','qi'];for(let i=0;i<400;i++){P.vit=99999;trainStat(ks[i%4])}P.arts.base.p=60;P.arts[Object.keys(ARTS)[0]]={p:30,f:[true,false,false]};wallCheck();openTrain()});await p.waitForTimeout(400);
  const w=await p.evaluate(()=>({wall:atWall(),btn:[...TRN.querySelectorAll('[data-tr="str"],[data-tr="neigong"]')].map(x=>x.disabled+':'+x.textContent.trim()),hw:P.hw&&P.hw.l.length,txt:TRN.textContent.includes('화두'),why:pgWhy(),ch:pgChance(),cost:pgCost()}));
  ok(`벽에 닿음, 수련 단추 막힘: ${w.btn.join(' / ')}`,w.wall&&w.btn.every(x=>x.startsWith('true')&&x.includes('벽에 막혔다')));
  ok(`화두 ${w.hw}개가 열리고 수련 창에 보인다, 하나도 못 풀면 성공률 ${w.ch}, 활력 ${w.cost}`,w.hw===4&&w.txt&&w.ch===0&&w.cost===0);
  // 화두를 푼다: 비무 승리·의뢰·제작
  const h=await p.evaluate(()=>{const ids=P.hw.l.map(x=>x.id),out={ids};const one=id=>{const x=P.hw.l.find(q=>q.id===id);if(!x)return null;for(let i=0;i<x.g;i++){if(id==='duel')runHooks('duelWon',{});if(id==='quest')runHooks('questDone',{});if(id==='life')runHooks('lifeDone','craft');if(id==='giyeon')runHooks('giyeonDone',{});if(id==='peak')runHooks('peakSat',{});if(id==='mast')runHooks('mastDone',{id:'base',s:{p:50},before:49})}return x.c>=x.g};
    out.r=['duel','quest','life','giyeon','peak','mast'].map(one).filter(v=>v!=null);out.done=hwDone();out.rate=hwRate();return out});
  ok(`훅으로 화두가 풀린다: ${h.ids.join(',')} → ${h.done}개`,h.r.every(Boolean)&&h.done>=2&&h.rate===1);
  // 적 처치 화두
  const k=await p.evaluate(()=>{P.hw=null;const hh=hwGet();hh.l=[{id:'over',c:0,g:1},{id:'elite',c:0,g:5}];const e=mkMob('산적두목',P.x+1,P.y);e.realm=realmIdx()+1;scaleMob(e);e.d={...e.d,boss:1};runHooks('kill',e);return{d:hwDone(),l:hh.l.map(x=>x.c)}});
  ok(`한 경지 위 우두머리를 잡으면 월반·강적 화두가 함께 풀린다 (${k.l})`,k.d===2);
  // v266: 덜 풀면 그 비율, 다 풀어도 상한(이류 95%)까지
  const r=await p.evaluate(()=>{P.hw=null;hwGet();hwFill(1);const c1=pgChance();hwFill(1);const c2=pgChance();hwFill(3);const c3=pgChance();return{c1,c2,c3,top:hwTop(1)}});
  ok(`성공률 ${r.c1.toFixed(2)} → ${r.c2.toFixed(2)} → ${r.c3} (상한 ${r.top})`,r.c1>0&&r.c1<r.c2&&r.c2===r.top&&r.c3===r.top&&r.top<1);
  // v266: 경지별 차등 — 화두 하나의 몫은 줄고 필요한 수·열리는 수·목표는 늘고, 상한은 낮아진다. 세력: 사·마는 초절정까지 빠르고 화경부터 어렵다
  const t=await p.evaluate(()=>{const sc0=P.sim,ss0=P.sims;P.sims={...(P.sims||{})};row=()=>[1,2,3,4,5,6,7,8].map(r=>({n:hwNeedN(r),top:hwTop(r),open:hwAt('open',r),g:hwGoal(hwDef('elite'),r)}));const jeong=row();
    const sa=Object.keys(SIM).find(k=>SIM[k].sc==='사공'),ma=Object.keys(SIM).find(k=>SIM[k].sc==='마공');P.sims[sa]=P.sims[ma]={g:1};P.sim=sa;const sap=row();P.sim=ma;const map=row();P.sim=sc0;P.sims=ss0;return{jeong,sap,map}});
  const inc=(a,k)=>a.every((x,i)=>!i||x[k]>=a[i-1][k]),dec=(a,k)=>a.every((x,i)=>!i||x[k]<a[i-1][k]);
  ok(`정: 필요 화두 ${t.jeong.map(x=>x.n)}, 상한 ${t.jeong.map(x=>Math.round(x.top*100))}%, 강적 목표 ${t.jeong.map(x=>x.g)}`,inc(t.jeong,'n')&&inc(t.jeong,'open')&&inc(t.jeong,'g')&&dec(t.jeong,'top')&&t.jeong[7].n>=3*t.jeong[0].n);
  ok(`사공: 필요 ${t.sap.map(x=>x.n)} / 상한 ${t.sap.map(x=>Math.round(x.top*100))}%, 마공 상한 ${t.map.map(x=>Math.round(x.top*100))}%`,[0,1,2,3].every(i=>t.sap[i].n<=t.jeong[i].n)&&t.sap[3].n<t.jeong[3].n&&[4,5,6,7].every(i=>t.sap[i].n>t.jeong[i].n&&t.sap[i].top<t.jeong[i].top&&t.map[i].top<t.sap[i].top));
  // v266: 화경 이상은 같은 화두를 한 번 더 (목표가 커져서) 풀 수 있다
  const rp=await p.evaluate(()=>{const r0=P.realm;P.realm=4;P.hw={r:4,v:2,l:[{id:'quest',c:0,g:hwGoal(hwDef('quest'),5),k:0}]};const x=P.hw.l[0],g1=x.g;x.c=g1;hwSolve(x);const o={g1,k:x.k,g2:x.g,done:!!x.done};P.realm=r0;P.hw=null;return o});
  ok(`화경 벽: 강호행 ${rp.g1}건 풀면 다시 열리고 목표 ${rp.g2}`,rp.k===1&&!rp.done&&rp.g2>rp.g1);
  // v266: 옛 저장의 화두(셋이면 반드시 성공)는 푼 것을 남기고 새 규칙으로 맞춘다
  const mg=await p.evaluate(()=>{P.hw={r:realmIdx(),l:[{id:'duel',c:1,g:1},{id:'peak',c:1,g:1},{id:'life',c:2,g:5}]};const h=hwGet();return{v:h.v,n:hwSolved(),len:h.l.length,g:h.l.find(x=>x.id==='life').g}});
  ok(`옛 화두 이어받기: 푼 것 ${mg.n}, 열린 ${mg.len}, 평상심 목표 ${mg.g}`,mg.v===2&&mg.n===2&&mg.len===4&&mg.g>=5);
  await p.evaluate(()=>{P.hw=null;hwGet();hwFill()});
  // 호법·소환단: 실패해도 가볍다
  const d=await p.evaluate(()=>{const q0=P.qiN=20;P.qiAcc=20*qiGain();const st={...P.st};const R=Math.random;Math.random=()=>.0;qiDeviation(5,true);Math.random=R;const alive=P.hp>0,same=Object.keys(st).every(k=>P.st[k]===st[k]),inj=P.injS;P.inj=0;P.injS=0;return{alive,same,inj}});
  ok(`호법·소환단이면 주화입마가 가볍다 (죽지 않음 ${d.alive}, 기본기 그대로 ${d.same}, 후유증 ${d.inj})`,d.alive&&d.same&&d.inj===1);
  // 생활: 제작은 활력을 쓴다
  const cr=await p.evaluate(()=>{closeTrain();const r=RECIPES.find(x=>!x.at&&!x.min)||RECIPES[0];P.jobs[r.job].on=1;P.jobs[r.job].lv=Math.max(P.jobs[r.job].lv,r.min||0);for(const m in r.need)P.mats[m]=(P.mats[m]||0)+r.need[m]*3;
    if(r.at){const n=npcAt(r.at);if(n){P.x=n.x+1;P.y=n.y}}
    const reg=REG;P.vit=0;const lv0=P.jobs[r.job].lv,b0=P.bag.length,m0=JSON.stringify(P.mats);craft(r);const blocked=P.jobs[r.job].lv===lv0&&JSON.stringify(P.mats)===m0;
    const c=craftVit(r);P.vit=c+5;craft(r);return{blocked,c,vit:P.vit,up:P.jobs[r.job].lv>lv0,n:r.n,reg}});
  ok(`[${cr.n}] 활력 0이면 못 만들고, 만들면 활력 ${cr.c}이 든다 (남은 ${cr.vit}), 수련도가 오른다`,cr.blocked&&cr.vit===5&&cr.up);
  // 농사: 씨뿌리기 활력, 거둬도 활력은 오르지 않는다
  const f=await p.evaluate(()=>{const pl={x:P.x,y:P.y,crop:null,g:0};P.mats.볍씨=2;P.vit=0;plotAction(pl);const no=!pl.crop;P.vit=10;P.farm=0;plotAction(pl);const v1=P.vit,lv=P.farm;pl.g=1;plotAction(pl);return{no,v1,lv,v2:P.vit,crop:pl.crop}});
  ok(`활력 없으면 못 심고, 심으면 활력 -3 (${f.v1}), 농사 숙련 ${f.lv.toFixed(1)}, 거둬도 활력 그대로 (${f.v2})`,f.no&&f.v1===7&&f.lv>0&&f.v2===7&&!f.crop);
  // 문파를 키운다: 문도 지도·저술 (내 힘은 그대로, 문파 인원이 는다)
  const sg=await p.evaluate(()=>{const s=SECTS.hwasan;P.sect='hwasan';P.srank={hwasan:2};P.realm=2;G.pop.hwasan=popBase(s)*.5;const hq=hqId(s);P.reg=hq;loadRegion(hq);mobs=[];
    const id=s.arts[0].id;P.arts[id]={p:85,f:ARTS[id].forms.map(()=>true)};const a0=atk(),h0=P.maxHp,p0=sectPop('hwasan');
    P.vit=0;const w0=teachWhy(s);P.vit=500;sectAct('hwteach');const p1=sectPop('hwasan'),v1=P.vit;
    const can=jsArts(s).includes(id);sectAct('hwwrite',id);const p2=sectPop('hwasan'),v2=P.vit,again=jsArts(s).includes(id);
    const c={h:{sid:'hwasan'},mul:1};runHooks('hugiMul',c);openPanel('sect');const card=$('wbody').textContent.includes('문파를 키운다');closePanels();
    return{w0,p0,p1,v1,p2,v2,can,again,mul:c.mul,same:atk()===a0&&P.maxHp===h0,card,g:artGrade(id)}});
  ok(`문도 지도: 활력 없으면 '${sg.w0}', 가르치면 인원 ${sg.p0}→${sg.p1}, 활력 ${sg.v1}`,sg.w0.includes('활력')&&sg.p1===sg.p0+2&&sg.v1===440);
  ok(`저술: 인원 ${sg.p1}→${sg.p2}, 활력 ${sg.v2}, 같은 무공은 한 번만 (${!sg.again}), 후기지수 성장 ×${sg.mul}, 내 힘 그대로 ${sg.same}`,sg.can&&sg.p2>sg.p1&&sg.v2<sg.v1&&!sg.again&&sg.mul>1&&sg.same);
  if(errs.length){console.log('ERRORS');errs.slice(0,8).forEach(e=>console.log(' ',e))}
  await b.close();process.exit(0)})();

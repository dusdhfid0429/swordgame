// 기연동굴과 소문 (v157, 사용자 2026-10-20): 완전 새로 시작할 때만 배치, NPC 말풍선 소문, 세력전·세력 차지, 행낭 보상, 문파 기증·창안 전수 등록과 문파 무공 등급
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>{localStorage.clear();window.__noPrompt=1});
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(800);
  // 1. 배치: 다섯 곳, 서로 다른 성, 기연 무공 넷. 맵에 저절로 생기는 기연 터는 없다
  const r1=await p.evaluate(()=>{const L=G.gyc.list;G.gT=0;for(let i=0;i<20;i++)update(.1);
    return{n:L.length,prov:new Set(L.map(c=>REGIONS[c.host].prov)).size,arts:L.filter(c=>c.art).length,regs:L.every(c=>REGIONS['gyc_'+c.i]&&REGIONS[c.host].gates.some(g=>g.gyc===c.i)),spot:G.giyeon}});
  ok(`동굴 ${r1.n}곳 · 성 ${r1.prov}곳 · 기연 무공 ${r1.arts} · 지역·입구 ${r1.regs} · 기연 터 없음 ${r1.spot}`,r1.n===5&&r1.prov===5&&r1.arts===4&&r1.regs&&r1.spot==null);
  // 2. 입구: 호스트 맵을 열면 걸어 닿는 칸에 놓이고, 다시 열어도 같은 자리
  const r2=await p.evaluate(()=>{const c=G.gyc.list[0];enterRegion(c.host,arriveAt(c.host).x,arriveAt(c.host).y);const a=[c.x,c.y],w=walk(c.x,c.y);
    loadRegion('gaebong');loadRegion(c.host);const g=REGION().gates.find(g=>g.gyc===0);return{a,w,same:c.x===a[0]&&c.y===a[1],g:[g.x,g.y],d:Math.hypot(c.x-c.ax,c.y-c.ay)}});
  ok(`입구 ${r2.a} (목표에서 ${r2.d.toFixed(1)}칸) 걸을 수 있음 ${r2.w} · 다시 열어도 같음 ${r2.same}`,r2.w&&r2.same&&r2.g[0]===r2.a[0]+.5);
  // 3. 말풍선: 입구가 있는 맵 근처 성도 NPC 곁에 가면 소문을 흘리고 임무창에 남는다
  const r3=await p.evaluate(()=>{const c=G.gyc.list[0];c.rumor=65;for(const o of G.gyc.list)if(o!==c)o.rumor=0;loadRegion(c.host);P.reg=c.host;NPCF=[{n:'나무꾼',x:P.x+1,y:P.y,npc:1,d:{pal:'npc'}}];
    gycBT=0;gycBub.length=0;for(const k in gycTalked)delete gycTalked[k];   // 앞서 저절로 뜬 말풍선(다른 소문)이 남아 있으면 그것을 읽게 된다
    const R=Math.random;Math.random=()=>.1;update(.05);Math.random=R;openPanel('quest');
    return{bub:gycBub.length&&gycBub[0].txt,heard:c.heard,card:$('wbody').textContent,log:[...document.querySelectorAll('#log *')].map(e=>e.textContent).filter(t=>t.includes('[소문]')).length}});
  ok(`말풍선 "${r3.bub}" · 들은 단계 ${r3.heard} · 임무창 기연 소문 · 기록 ${r3.log}`,!!r3.bub&&r3.bub.includes(await p.evaluate(()=>REGIONS[G.gyc.list[0].host].name))&&/쪽에/.test(r3.bub)&&r3.heard===2&&r3.card.includes('기연 소문')&&r3.log>0);
  await p.waitForTimeout(200);await p.evaluate(()=>closePanels());await p.screenshot({path:shot('gyc_bubble')});
  // 멀리 있는 동굴은 소문이 작으면 들리지 않는다
  const r3b=await p.evaluate(()=>{const c=G.gyc.list[0];c.rumor=0;loadRegion('gaebong');REG='gaebong';const h=regHops('gaebong')[c.host];gycHopReg=null;for(const o of G.gyc.list)o.rumor=0;const none=gycRumorFor();
    const far=G.gyc.list.find(o=>(regHops('gaebong')[o.host]??30)>2);return{h,none,far:!!far}});
  ok(`소문 0이면 먼 동굴(${r3b.h}곳 건너)은 들리지 않는다`,r3b.none===null);
  // 4. 동굴 안: 수호자가 지키고, 쓰러뜨리면 상자. 보상은 행낭(비급·영약)에 들어오고 바로 익히지 않는다
  const r4=await p.evaluate(()=>{const c=G.gyc.list[0];enterRegion('gyc_0',22.5,40.3);const g=mobs.find(m=>m.gycGuard===0),box=nodes.find(n=>n.t==='gybox');
    P.x=box.x;P.y=box.y+.6;gycOpen(box);const blocked=!P.chan;g.hp=0;prune(mobs,m=>m.hp>0);gycOpen(box);P.chan.fn();
    const bk=P.bag.find(i=>i.art===c.art);return{dark:!!REGION().cave,guard:!!g,blocked,done:c.done,bk:!!bk,learned:!!P.arts[c.art],mats:['천년영지','청명단'].every(k=>P.mats[k]>0),again:(gycOpen(box),!P.chan||P.chan.fn===undefined)}});
  ok(`동굴(어둠 ${r4.dark}) 수호자 ${r4.guard} 막음 ${r4.blocked} → 열림 ${r4.done} · 비급 행낭 ${r4.bk}, 아직 안 익힘 ${!r4.learned} · 영약 행낭 ${r4.mats}`,r4.dark&&r4.guard&&r4.blocked&&r4.done&&r4.bk&&!r4.learned&&r4.mats);
  await p.screenshot({path:shot('gyc_cave')});
  const r5=await p.evaluate(()=>{const c=G.gyc.list[0],it=P.bag.find(i=>i.art===c.art);readBook(it);const w=P.wis;useCon('청명단');return{learned:!!P.arts[c.art],f0:P.arts[c.art]&&P.arts[c.art].f[0],wis:P.wis-w}});
  ok(`행낭에서 읽어 익힘 ${r5.learned} (첫 초식 ${r5.f0}) · 청명단 오성 +${r5.wis}`,r5.learned&&r5.f0&&r5.wis===1);
  // 5. 세력전: 소문이 다 퍼진 동굴 입구에 가면 두 세력 무사들이 싸운다. 다 퍼지면 한 세력이 차지해 그 문파 무공이 된다
  const r6=await p.evaluate(()=>{const c=G.gyc.list[1];c.rumor=80;c.facs=['정','사'];enterRegion(c.host,arriveAt(c.host).x,arriveAt(c.host).y);P.x=c.x+.5;P.y=c.y+6;gycBT=0;update(.05);
    const w=mobs.filter(m=>m.gycWar===1);return{n:w.length,facs:[...new Set(w.map(m=>alFac(SECTS[m.sect].al)))].sort().join(''),tgt:w.filter(m=>m.tgt).length}});
  ok(`세력전: 무사 ${r6.n}명 (${r6.facs}) 서로 겨눔 ${r6.tgt}`,r6.n>=6&&r6.facs.length===2&&r6.tgt>=r6.n-1);
  await p.waitForTimeout(300);await p.screenshot({path:shot('gyc_war')});
  const r7=await p.evaluate(()=>{const c=G.gyc.list[1];c.rumor=99;newYear();const s=SECTS[c.by];return{done:c.done,by:c.by,inList:!!s&&s.arts.some(q=>q.id===c.art),sect:ARTS[c.art].sect}});
  ok(`소문이 다 퍼져 ${r7.by}이(가) 차지 · 그 문파 목록에 ${r7.inList} (sect ${r7.sect})`,r7.done&&r7.inList&&r7.sect===r7.by);
  // 6. 기증: 문파 제자가 기연 무공 비급을 기증하면 그 문파 무공이 되고, 본래 최고 등급보다 높으면 문파 등급이 올라 세력 힘이 는다
  const r8=await p.evaluate(()=>{const c=G.gyc.list[2],s=SECTS.namgung;P.sect='namgung';P.mtot.namgung=0;G.W=G.W||wld();popSync();const f=alFac(s.al),pow0=G.W.pow[f],top0=sectTop0(s);
    P.bag.push(mkBook(c.art,0));const it=P.bag[P.bag.length-1];openPanel('npc',{sect:'namgung'});sectAct('gydon',String(it.id));
    return{top0,top:Math.max(...s.arts.map(q=>artGrade(q.id))),up:sectUp(s),pow0,pow:G.W.pow[f],inList:s.arts.some(q=>q.id===c.art),bag:P.bag.includes(it),merit:P.merit.namgung,html:gycSectHtml(s)}});
  ok(`남궁세가 기증: 목록 ${r8.inList} · 최고 등급 ${r8.top0}→${r8.top} · 세력 보정 +${r8.up} · 정파 힘 ${r8.pow0}→${r8.pow} · 공적 ${r8.merit}`,r8.inList&&!r8.bag&&r8.top===4&&r8.up>0&&r8.pow>r8.pow0&&r8.merit>0&&r8.html.includes('올랐다'));
  // 7. 창안 무공: 문파 제자가 창안해도 바로 등록되지 않고, 제자들에게 전수하면 등록된다
  const r9=await p.evaluate(()=>{for(let i=0;i<5;i++){const id='정검'+i;P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)}}P.realm=5;const a=mkCreate(mkGroups()[0]);P.arts[a.id]={p:30,f:a.forms.map(()=>true)};
    const s=SECTS.namgung,before=s.arts.some(q=>q.id===a.id),row=gycSectHtml(s).includes('mkteach:'+a.id);sectAct('mkteach',a.id);
    return{id:a.id,before,row,after:s.arts.some(q=>q.id===a.id),sect:ARTS[a.id].sect,def:G.made[a.id].sect,cost:meritCost({id:a.id},0)}});
  ok(`창안 ${r9.id}: 창안 직후 미등록 ${!r9.before} · 전수 단추 ${r9.row} → 등록 ${r9.after} (sect ${r9.sect}/${r9.def}, 비급 공적 ${r9.cost})`,!r9.before&&r9.row&&r9.after&&r9.sect==='namgung'&&r9.def==='namgung'&&r9.cost>0);
  // 8. 저장·불러오기 뒤에도 남고, 완전 새로 시작하면 동굴·기증·전수가 사라진다
  const r10=await p.evaluate(()=>{saveGame(true);const g=JSON.stringify(G.gyc);loadGame();const same=JSON.stringify(G.gyc)===g,kept=SECTS.namgung.arts.some(q=>q.gyd);
    G=G0();gycSync();return{same,kept,gone:!SECTS.namgung.arts.some(q=>q.gyd||q.made),gy:!Object.keys(GY_ARTS).some(id=>ARTS[id].sect),regs:!Object.keys(REGIONS).some(id=>id.startsWith('gyc_'))}});
  ok(`불러오기 뒤 그대로 ${r10.same}, 기증 남음 ${r10.kept} · 완전 새로: 등록 사라짐 ${r10.gone}·${r10.gy} · 동굴 지역 사라짐 ${r10.regs}`,r10.same&&r10.kept&&r10.gone&&r10.gy&&r10.regs);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

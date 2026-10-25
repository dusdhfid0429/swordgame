// 행낭이 안 열리던 버그 (사용자 2026-10-25): 수련동 기연으로 받은 천고 무공 비급(정사 공용, side 없음)의 설명 줄이 SIDES[null]에서 터져 행낭 전체가 안 열렸다.
// 물건은 저장에 그대로 있었다. 여기서는 그 장면을 그대로 다시 하고, 물건을 만드는 모든 길의 물건이 행낭·창고·장비 칸에서 오류 없이 그려지는지,
// 모르는 물건이 섞여도 창이 열리는지, 저장했다 불러와도 하나도 사라지지 않는지 본다.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>{localStorage.clear();window.__noPrompt=1});
  await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(800);
  // 1. 사용자 장면: 혈월광도 비급 · 천년영지 · 청명단 · 철골삼 · 풍령과를 받은 뒤 행낭을 연다
  const r1=await p.evaluate(()=>{const c=G.gyc.list.find(c=>c.art)||G.gyc.list[0];c.art='gy_do';enterRegion('gyc_'+c.i,22.5,40.3);
    for(const m of mobs)if(m.gycGuard!=null)m.hp=0;prune(mobs,m=>m.hp>0);const box=nodes.find(n=>n.t==='gybox');P.x=box.x;P.y=box.y+.6;
    const R=Math.random;let k=0;Math.random=()=>[.1,.5][k++%2];gycOpen(box);P.chan.fn();Math.random=R;
    let e=null;try{openPanel('bag')}catch(x){e=x.message}const t=$('wbody').textContent;
    return{e,open:!$('win').hidden&&panel==='bag',book:t.includes('혈월광도 비급'),mats:['천년영지','청명단'].every(m=>t.includes(m)&&P.mats[m]>0),fr:Object.keys(GYC.fruits).filter(m=>P.mats[m]>0).length,side:t.includes('정사 공용')}});
  ok(`기연동굴 보상 뒤 행낭 열림 ${r1.open} (오류 ${r1.e}) · 혈월광도 비급 ${r1.book} · 영약 ${r1.mats} · 영과 ${r1.fr}종 · '정사 공용' ${r1.side}`,!r1.e&&r1.open&&r1.book&&r1.mats&&r1.fr>=1&&r1.side);
  // 2. 물건을 만드는 모든 길: 모든 무공의 모든 초식 비급, 무기·장비, 패시브·보법·경공·기술서·특수무공·절세신공 잔결, 폐허 약탈품, 창안 무공
  const r2=await p.evaluate(()=>{closePanels();const bad=[],items=[];
    const t=(lab,f)=>{try{const it=f();if(!it)return;items.push(it);itemDesc0(it);itemCol(it);itemLabel(it);readBlock(it)}catch(e){bad.push(lab+': '+e.message)}};
    for(const id in ARTS)ARTS[id].forms.forEach((_,i)=>t('book '+id+':'+i,()=>mkBook(id,i)));
    for(const c of CLS)t('weapon '+c,()=>mkWeapon(c,1,0));
    t('armor',()=>mkGear('armor','무명 무복',1,{hp:24,def:2}));t('boots',()=>mkGear('boots','짚신',1,{spd:.12,hm:3}));t('acc',()=>mkGear('acc','옥패',1,{qi:24,hm:5}));
    for(const id in PAS)t('pbook '+id,()=>mkPBook(id));for(const id in BOBS)t('bbook '+id,()=>mkBBook(id));for(const id in GGS)t('gbook '+id,()=>mkGBook(id));
    for(const j in JOBS)t('tbook '+j,()=>mkTBook(j));for(const k of['암기','독공','점혈'])t('sbook '+k,()=>mkSBook(k));for(const n in SHINGONG)t('gpage '+n,()=>mkGPage(n,2));
    for(const id in SECTS){const s=SECTS[id];t('ruin relic '+id,()=>ruinRelic(s));t('ruin gear '+id,()=>ruinGear(s));t('ruin book '+id,()=>ruinBook(s,false));t('ruin hibook '+id,()=>ruinBook(s,true))}
    for(let i=0;i<30;i++)t('randomBook',()=>randomBook());
    // 창안 무공(side 없음)도 기연 무공처럼 정사 공용이다
    const mk={...ARTS.gy_geom,id:'mk_test',made:1,by:'시험',gy:0,side:null};ARTS.mk_test=mk;t('made book',()=>mkBook('mk_test',0));
    // 적 장비 전리품: 무작위 적 몇에게 실제 장비를 입혀 떨어뜨리는 물건
    for(const k of Object.keys(MOBS).slice(0,40)){try{const e=mkMob(k,P.x,P.y);if(e.eq)for(const v of Object.values(e.eq))if(v)t('mob gear '+k,()=>v)}catch(e){}}
    // 한꺼번에 행낭·상점 팔기·창고·장비 칸에 넣고 그린다
    const keep=P.bag;P.bag=items;let e=null;try{shopMode='x';openPanel('bag');closePanels();shopMode=null;G.storage.bag=items.slice(0,60);$('wbody').innerHTML=storageHtml()}catch(x){e=x.message}
    const n=items.length;P.bag=keep;G.storage.bag=[];delete ARTS.mk_test;return{n,bad:bad.slice(0,8),nb:bad.length,e}});
  ok(`물건 ${r2.n}가지 설명·색·읽기 검사 오류 ${r2.nb}건 ${r2.bad.join(' / ')} · 행낭·팔기·창고 그리기 ${r2.e||'정상'}`,r2.n>200&&!r2.nb&&!r2.e);
  // 3. 모르는 물건(지금 데이터에 없는 무공의 비급, 처음 보는 칸)이 섞여도 행낭이 열리고 그 물건도 이름과 버리기 단추로 남는다
  const r3=await p.evaluate(()=>{P.bag.push({id:++itemId,slot:'book',art:'zz_gone',form:2,name:'사라진 무공 비급',price:5},{id:++itemId,slot:'zz',name:'처음 보는 물건',price:1});
    let e=null;try{openPanel('bag')}catch(x){e=x.message}const t=$('wbody').textContent,rb=readBlock(P.bag.find(i=>i.art==='zz_gone'));
    const before=P.bag.length;readBook(P.bag.find(i=>i.art==='zz_gone'));const kept=P.bag.length===before;
    // 다른 창이 터져도 창은 열리고 안내가 뜬다
    closePanels();const f=pLife;pLife=()=>{throw Error('x')};let e2=null;try{openPanel('life')}catch(x){e2=x.message}const w2=!$('win').hidden&&$('wbody').textContent.includes('문제가 생겼습니다');pLife=f;closePanels();
    return{e,a:t.includes('사라진 무공 비급'),b:t.includes('처음 보는 물건'),rb:!!rb,kept,e2,w2}});
  ok(`모르는 물건 섞여도 행낭 열림 (오류 ${r3.e}) · 두 물건 보임 ${r3.a&&r3.b} · 읽기 막고 남김 ${r3.rb&&r3.kept} · 다른 창 오류도 창은 열림 ${r3.w2}`,!r3.e&&r3.a&&r3.b&&r3.rb&&r3.kept&&!r3.e2&&r3.w2);
  // 4. 저장했다 불러와도 물건이 하나도 사라지지 않고, 겹친 번호는 새 번호를 받는다
  const r4=await p.evaluate(()=>{const names=P.bag.map(i=>i.name).sort().join('|'),mats=JSON.stringify(P.mats);P.bag[1].id=P.bag[0].id;P.bag.push(null);saveGame(true);
    const d=loadSlot(SLOT);P.bag=[];P.mats={};applySave(d);
    const ids=P.bag.map(i=>i.id);return{same:P.bag.map(i=>i.name).sort().join('|')===names,mats:JSON.stringify(P.mats)===mats,uniq:new Set(ids).size===ids.length,top:itemId>=Math.max(...ids)}});
  ok(`저장·불러오기 뒤 행낭 물건 그대로 ${r4.same} · 재료 그대로 ${r4.mats} · 번호 겹침 없음 ${r4.uniq} · itemId ${r4.top}`,r4.same&&r4.mats&&r4.uniq&&r4.top);
  // 5. 행낭이 가득 차도 받은 물건은 사라지지 않는다 (무관 연습 무기로 바꿀 때 쓰던 무기, 졸업 증표 → 창고)
  const r5=await p.evaluate(()=>{while(P.bag.length<24)P.bag.push(mkGear('acc','돌',1,{}));G.storage.bag=[];const w=mkWeapon('검',1,0);const r=giveItem(w);const r2=(P.bag.length=30,G.storage.bag.length=0,null);
    G.storage.bag=Array.from({length:60},()=>mkGear('acc','돌',1,{}));const x=mkGear('acc','증표',1,{});const r3=giveItem(x);return{r,inStore:G.storage.bag.length===60,r3,inBag:P.bag.includes(x)}});
  ok(`행낭 가득: 창고로 ${r5.r} · 창고도 가득: 행낭에 넘치게 ${r5.r3==='bag'&&r5.inBag}`,r5.r==='store'&&r5.r3==='bag'&&r5.inBag);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close()})();

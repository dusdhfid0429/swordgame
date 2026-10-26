// 무공 잊기 (v184, 사용자 2026-10-26): 무공 창의 '잊기' → 한 번 더 묻고 → 숙련·초식이 사라지고 오성 칸이 빈다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);

  // 오성 칸을 꽉 채우고 하나를 펼친다
  const a=await p.evaluate(()=>{P.wis=0;const ids=Object.keys(ARTS).filter(k=>{const a=ARTS[k];return a.side===P.side&&!a.base&&!a.gy&&!a.made&&!a.hi}).slice(0,artCap());
    for(const id of ids)P.arts[id]={p:40,f:ARTS[id].forms.map((f,i)=>i<2)};setArt(ids[0]);
    const bk=Object.keys(ARTS).find(k=>ARTS[k].side===P.side&&!ARTS[k].base&&!ARTS[k].gy&&!ARTS[k].hi&&!P.arts[k]);const it=mkBook(bk,0);P.bag.push(it);P.vit=9999;
    return{ids,cap:artCap(),full:readBlock(it),bk,itId:it.id,mu:pillarVal('mu')}});
  ok(`칸이 차면 비급을 못 읽고 잊기를 알려 준다: ${a.full}`,/가지까지만/.test(a.full||'')&&/잊으면/.test(a.full||''));

  // 무공 창: 기본 무공엔 잊기 단추가 없고, 익힌 무공엔 있다. 누르면 묻는 칸이 뜬다
  await p.evaluate(()=>openPanel('arts'));await p.waitForTimeout(200);
  const btn=await p.evaluate(id=>({base:!!document.querySelector('[data-act="forget:base"]'),mine:!!document.querySelector(`[data-act="forget:${id}"]`)}),a.ids[0]);
  ok(`잊기 단추: 기본 무공 없음 ${!btn.base} · 익힌 무공 있음 ${btn.mine}`,!btn.base&&btn.mine);
  await p.click(`[data-act="forget:${a.ids[0]}"]`);await p.waitForTimeout(150);
  const ask=await p.evaluate(id=>{const q=document.getElementById('forgetask');return{q:q&&q.innerText,still:!!P.arts[id]}},a.ids[0]);
  ok(`묻는 칸: ${ask.q&&ask.q.slice(0,80)} · 아직 안 지움 ${ask.still}`,ask.q&&/잊을까요/.test(ask.q)&&/숙련 40/.test(ask.q)&&ask.still);
  await p.click('[data-act="forgetno"]');await p.waitForTimeout(150);
  const no=await p.evaluate(id=>({q:!!document.getElementById('forgetask'),still:!!P.arts[id]}),a.ids[0]);
  ok(`그만둔다 → 그대로 ${no.still} · 칸 닫힘 ${!no.q}`,no.still&&!no.q);

  // 잊는다 → 지워지고, 펼치던 무공이면 기본 무공으로, 칸이 비어 새 비급을 읽을 수 있다
  await p.click(`[data-act="forget:${a.ids[0]}"]`);await p.waitForTimeout(150);await p.click(`[data-act="forgetok:${a.ids[0]}"]`);await p.waitForTimeout(150);
  const r=await p.evaluate(([id,itId])=>{const it=P.bag.find(i=>i.id===itId);return{gone:!P.arts[id],cur:P.cur,n:capArts().length,cap:artCap(),can:!readBlock(it),mu:pillarVal('mu'),list:!document.querySelector(`[data-act="forget:${id}"]`)}},[a.ids[0],a.itId]);
  ok(`잊음 ${r.gone} · 펼치는 무공 ${r.cur} · ${r.n}/${r.cap} · 새 비급 읽기 가능 ${r.can} · 무리 ${a.mu}→${r.mu} · 창에서 사라짐 ${r.list}`,r.gone&&r.cur==='base'&&r.n===a.cap-1&&r.can&&r.mu<a.mu&&r.list);

  // 저장·불러오기 뒤에도 잊은 무공은 돌아오지 않는다
  const s=await p.evaluate(id=>{saveGame(true);const d=migrateSave(JSON.parse(localStorage.getItem(SAVE_KEY)));return{back:!!d.P.arts[id],cur:d.P.cur}},a.ids[0]);
  ok(`저장에도 없음 ${!s.back} · 펼치는 무공 ${s.cur}`,!s.back&&s.cur==='base');

  // 기본 무공·무관에서 닦는 무공은 잊을 수 없다
  const z=await p.evaluate(()=>{const b=forgetArt('base');P.acad={stage:2,c:{},done:{},cls:'검'};const m=acadMainArt();P.arts[m.id]=P.arts[m.id]||{p:0,f:m.forms.map((f,i)=>i===0)};
    const w=forgetWhy(m.id),f=forgetArt(m.id),has=!!P.arts[m.id];P.acad=null;return{b,base:!!P.arts.base,w,f,has}});
  ok(`기본 무공 못 잊음 ${!z.b&&z.base} · 무관 무공: ${z.w}`,!z.b&&z.base&&!z.f&&z.has&&/무관/.test(z.w||''));

  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');
  await b.close();
})();

// 쇠퇴한 문파의 장문인 (2026-10-13): 인원이 기준의 50% 이하거나 지난해보다 줄면 장문인이 싸우는 우두머리가 된다. 쓰러뜨리면 인원 10% 이탈·가입 불가, 회복 3년 뒤 새 장문인
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const t1=await p.evaluate(()=>{update(.1);const s=SECTS.hwasan,ids=[hqId(s),...((REGIONS[hqId(s)]||{}).halls||[]).map(h=>h.id)],mr=ids.find(id=>(REGIONS[id].npcs||[]).some(n=>n.hq===s.id));window.MR=mr;
    window.MOUT=REGIONS[mr].hall.out;const go=()=>{mobs=[];loadRegion(MOUT);P.reg=MOUT;return{npc:!!(REGIONS[mr].npcs||[]).find(n=>n.hq),boss:mobs.find(m=>m.master)}};   // v133: 우두머리는 바깥 맵 전각 앞에 선다
    G.pop.hwasan=300;G.popPrev=null;const a=go();G.pop.hwasan=150;const same=go();P.sect='cheonma';const bb=go();const boss=bb.boss;   // v133: 같은 편(정파)에게는 쇠퇴해도 NPC, 적대 진영(마)에게만 우두머리
    G.pop.hwasan=300;G.popPrev={hwasan:310};const c=go();G.popPrev={hwasan:290};const d=go();
    const door=(REGIONS[MOUT].halls||[]).find(h=>h.id===mr);return{mr,out:boss&&boss.x===door.x&&Math.abs(boss.y-(door.y+1.5))<.01,a:[a.npc,!!a.boss],same:[same.npc,!!same.boss],b:[bb.npc,!!bb.boss],name:boss&&boss.name,rank:boss&&boss.rank,hp:boss&&boss.maxHp,c:[c.npc,!!c.boss],d:[d.npc,!!d.boss],peace:boss&&peaceful(boss)}});
  ok(`장문인 맵 ${t1.mr}: 인원 300 → NPC ${t1.a[0]} 우두머리 ${t1.a[1]} / 150(50%) 같은 편 → NPC ${t1.same[0]} 우두머리 ${t1.same[1]} / 적대 진영 → NPC ${t1.b[0]} 우두머리 ${t1.b[1]} 전각 앞 ${t1.out} [${t1.name}, 직위 ${t1.rank}, 생명 ${t1.hp}]`,t1.a[0]&&!t1.a[1]&&t1.same[0]&&!t1.same[1]&&!t1.b[0]&&t1.b[1]&&t1.out===true&&t1.name==='화산파 장문인'&&t1.rank===4&&t1.hp>400);
  ok(`쇠퇴 추세(적대 진영): 지난해 310→300이면 출전 ${t1.c[1]}, 290→300이면 NPC ${t1.d[0]}`,t1.c[1]&&!t1.c[0]&&t1.d[0]&&!t1.d[1]);
  // 쓰러뜨리면 (v112: 장로급 처치 −15, v133부터 본산 바깥 맵에서 죽어 ×2 = −30 뒤 10% → 108)
  const t2=await p.evaluate(()=>{P.sect='cheonma';G.pop.hwasan=150;G.popPrev=null;mobs=[];loadRegion(MOUT);P.reg=MOUT;const e=mobs.find(m=>m.master);const f0=P.fame,p0=sectPop('hwasan');e.hp=1;damage(e,999,0,0,P);P.sect=null;
    return{dead:!!G.mdead.hwasan,pop:sectPop('hwasan'),p0,fame:P.fame-f0,join:joinBlock(SECTS.hwasan),log:$('log').textContent.includes('장문인을 쓰러뜨렸다'),rank4:(()=>{let c=0;for(let i=0;i<200;i++)if(popRank(SECTS.hwasan,true)===4)c++;return c})()}});
  ok(`격살: 공석 ${t2.dead}, 인원 ${t2.p0}→${t2.pop}, 명성 +${t2.fame}, 가입 "${t2.join}", 장로급 출현 ${t2.rank4}/200`,t2.dead&&t2.pop===108&&t2.fame===30&&/공석|비어/.test(t2.join)&&t2.log&&t2.rank4===0);
  // 회복: 인원이 돌아오고 3년 지나면 새 장문인, NPC 복귀
  const t3=await p.evaluate(()=>{P.sect=null;G.pop.hwasan=300;G.popPrev=null;for(let i=0;i<2;i++){P.age=9+i;G.cal=i+1;lastYear=8+i;update(.1)}const still=!!G.mdead.hwasan;P.age=11;G.cal=3;lastYear=10;update(.1);const back=!G.mdead.hwasan;mobs=[];loadRegion(MR);return{still,back,npc:!!(REGION().npcs||[]).find(n=>n.hq),log:$('log').textContent.includes('새 장문인')}});
  ok(`2년 뒤 공석 ${t3.still} → 3년 뒤 새 장문인 ${t3.back}, NPC 복귀 ${t3.npc}`,t3.still&&t3.back&&t3.npc&&t3.log);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

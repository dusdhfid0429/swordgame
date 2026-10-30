// 무림록 (v213, 사용자 2026-10-30 참고 영상 '구파일방과 오대세가'): 도감·이름 풀이·앙숙과 동맹·직계와 방계·비석·명소·음공·생마다 바뀌는 설정
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);

  // 7 음공: 형산파 넷째 무공, 퍼지는 꼴 초식, 다른 무공 초식 이름은 그대로(맨 끝에 만든다)
  const um=await p.evaluate(()=>{const s=SECTS.hyeongsan,m=s.arts.find(a=>a.n==='소상야우검'),a=m&&ARTS[m.id];
    return{n:s.arts.length,id:m&&m.id,um:a&&a.um,forms:a&&a.forms.length,shapes:a&&a.forms.map(f=>f.p),sect:a&&artSect(a.id).id,grade:a&&a.grade,first:ARTS[SECTS.shaolin.arts[0].id].forms[0].n}});
  ok(`음공 [소상야우검] ${um.id} · 초식 ${um.forms} ${um.shapes} · 문파 ${um.sect} · 등급 ${um.grade}`,um.n===4&&um.um&&um.forms===4&&um.sect==='hyeongsan'&&um.shapes.every(s=>['circle','arc','pull','rain'].includes(s))&&um.first===um.first);

  // 2 이름 풀이: 사전에 있는 무공, 조각으로 푸는 무공
  const mean=await p.evaluate(()=>{const f=n=>{const a=Object.values(ARTS).find(x=>x.n===n);return a?artMean(a):null};return{mh:f('매화검법'),dk:f('칠상권'),basic:f('열양신권'),gen:artMean({n:'곤륜혈영검법'})}});
  ok(`이름 풀이: 매화검법 "${mean.mh}" · 열양신권 "${mean.basic}" · 조각 "${mean.gen}"`,/매화/.test(mean.mh)&&/일곱/.test(mean.dk)&&/열양/.test(mean.basic||'')&&/곤륜/.test(mean.gen)&&/혈영/.test(mean.gen)&&/검법/.test(mean.gen));

  // 8 첫 생은 원래 설정: 구파 아홉째 곤륜, 오대세가 다섯째 제갈
  const v1=await p.evaluate(()=>{const v=loreVer();return{nine:v.nine,five:v.five,fj:isFive(SECTS.jegal),fh:isFive(SECTS.hwangbo),told:v.told}});
  ok(`첫 생: 구파 ${v1.nine} · 오대세가 ${v1.five} · 제갈 오대세가 ${v1.fj} · 황보 ${v1.fh} · 알림 ${v1.told}`,v1.nine==='kunlun'&&v1.five==='jegal'&&v1.fj&&!v1.fh&&v1.told===1);
  // 다른 생: 형산·황보가 자리에 들면 목록이 바뀌고 제자 공적이 15% 더 붙는다
  const v2=await p.evaluate(()=>{P.lifeNo=2;G.lore.ver={life:2,nine:'hyeongsan',five:'hwangbo',moyong:'강남 고소의 연자오',gaebang:'동정호 군산',told:1};
    const h=allianceDlg('jeong'),g9=h.split('오대세가')[0],gOut=h.includes('구파 자리를 다투는 문파')?h.split('구파 자리를 다투는 문파')[1].split('<h4')[0]:'';
    P.sect='hyeongsan';P.srank={hyeongsan:0};const a=addMerit('hyeongsan',100);G.lore.ver.nine='kunlun';const b2=addMerit('hyeongsan',100);G.lore.ver.nine='hyeongsan';P.sect=null;P.srank=null;
    return{in9:g9.includes('형산파'),outK:gOut.includes('곤륜파'),fh:isFive(SECTS.hwangbo),fj:isFive(SECTS.jegal),a,b:b2,txt:loreVerTxt(),note:loreVerNote('moyong')}});
  ok(`다른 생: 형산 9파 ${v2.in9} · 곤륜 밖 ${v2.outK} · 황보 오대세가 ${v2.fh} · 제갈 밖 ${!v2.fj} · 공적 ${v2.a} vs ${v2.b}`,v2.in9&&v2.outK&&v2.fh&&!v2.fj&&v2.a===115&&v2.b===100&&/고소/.test(v2.note));

  // 3 앙숙·동맹: 화산 제자에게 종남은 차갑고, 세가는 조금 멀다. 화산 임무를 해 주면 종남이 못마땅해한다
  const rel=await p.evaluate(()=>{P.sect='hwasan';const jn=relBase('jongnam'),ng=relBase('namgung'),md=relBase('mudang');P.sect='shaolin';const al=relBase('mudang');
    P.sect=null;P.rep=null;runHooks('questDone',{sect:'hwasan'});return{jn,ng,md,al,spill:repD().sect.jongnam||0,h:relHtml('hwasan')}});
  ok(`앙숙 종남 ${rel.jn} · 세가 남궁 ${rel.ng} · 무관 무당 ${rel.md} · 소림→무당 동맹 ${rel.al} · 화산 임무 뒤 종남 ${rel.spill}`,rel.jn===-15&&rel.ng===-5&&rel.md===0&&rel.al===10&&rel.spill<0&&/앙숙/.test(rel.h));

  // 4 직계·방계: 성이 다르면 방계, 고급 무공 직위 한 단 위, 마지막 초식은 직계만. 입적하면 풀린다
  const kin=await p.evaluate(()=>{P.name='김현';P.sect='namgung';P.srank={namgung:0};P.kin=null;runHooks('sectActDone',{a:'sjoin',x:'namgung'});
    const hi=ARTS[SECTS.namgung.arts.find(a=>a.hi).id],last=hi.forms.length-1,r0=artNeedRank(hi,0),blk=kinBlock(hi,last),base=Math.max(ART_RANK[Math.min(artGrade(hi.id),ART_RANK.length-1)]||0,HI_RANK[0]||0);
    const why0=kinWhy('namgung','adopt');P.srank.namgung=2;P.merit.namgung=500;sectAct('kadopt','namgung');
    const r1=artNeedRank(hi,0),blk2=kinBlock(hi,last),m=P.merit.namgung;
    P.name='남궁현';P.kin=null;runHooks('sectActDone',{a:'sjoin',x:'namgung'});const sur=kinOk('namgung');
    P.sect='shaolin';P.srank.shaolin=1;P.spouse=null;sectAct('kmonk','shaolin');const monk=P.monk;act('marry');
    return{r0,base,blk,why0,r1,blk2,m,sur,monk,sp:P.spouse}});
  ok(`방계: 직위 ${kin.base}→${kin.r0} · 마지막 초식 "${kin.blk}" · 입적 조건 "${kin.why0}" → 입적 뒤 직위 ${kin.r1} · 막힘 "${kin.blk2}" · 공적 ${kin.m} · 남궁씨 직계 ${kin.sur}`,
    kin.r0===kin.base+1&&kin.blk==='직계만'&&/이상/.test(kin.why0)&&kin.r1===kin.base&&!kin.blk2&&kin.m===100&&kin.sur);
  ok(`출가 ${kin.monk} · 출가 뒤 혼례 못 함 ${!kin.sp}`,kin.monk==='shaolin'&&!kin.sp);

  // 5·6 본산에 비석과 명소. 읽고 둘러보면 무림록에 실리고, 생마다 한 번 보상
  await p.evaluate(()=>{P.sect=null;loadRegion('hq_emei');P.reg='hq_emei';const st=nodes.find(n=>n.t==='stele');if(st){P.x=st.x+.6;P.y=st.y+.6}});await p.waitForTimeout(300);
  const nd=await p.evaluate(()=>{const st=nodes.find(n=>n.t==='stele'),sp=nodes.find(n=>n.t==='spot');return{st:!!st&&st.sect,sp:!!sp&&sp.sect,seen:G.lore.seen.emei,walk:st&&walk(Math.floor(st.x),Math.floor(st.y))}});
  ok(`아미 본산: 비석 ${nd.st} · 명소 ${nd.sp} · 본 적 ${nd.seen}`,nd.st==='emei'&&nd.sp==='emei'&&nd.seen===1);
  const lg=await p.evaluate(()=>{const f0=P.fame,leaf0=bagAll().filter(i=>i.slot==='leaf').reduce((a,i)=>a+i.n,0),st=nodes.find(n=>n.t==='stele');P.x=st.x+.6;P.y=st.y+.6;loreLeg(st);
    const f1=P.fame,leaf1=bagAll().filter(i=>i.slot==='leaf').reduce((a,i)=>a+i.n,0),t=document.getElementById('wbody').innerText;loreLeg(st);
    return{df:f1-f0,dl:leaf1-leaf0,again:P.fame-f1,card:/정월 사태/.test(t),leg:G.lore.leg.emei}});
  ok(`비석: 명성 +${lg.df} · 낱장 +${lg.dl} · 두 번째 +${lg.again} · 무림록 카드 ${lg.card}`,lg.df===3&&lg.dl===1&&lg.again===0&&lg.card&&lg.leg===1);
  await p.evaluate(()=>closePanels());await p.waitForTimeout(200);await p.screenshot({path:require('path').resolve(__dirname,'shots/t121_stele.png')}).catch(()=>{});
  const sp=await p.evaluate(()=>{const n=nodes.find(n=>n.t==='spot');P.vit=0;loreSpot(n);const v1=P.vit;loreSpot(n);return{v1,v2:P.vit,g:G.lore.spot.emei}});
  ok(`명소: 활력 ${sp.v1} · 두 번째 그대로 ${sp.v2===sp.v1} · 실림 ${sp.g}`,sp.v1>0&&sp.v2===sp.v1&&sp.g===1);

  // 1 무림록 창: 강호사 창의 단추 → 목록 → 카드
  await p.evaluate(()=>openPanel('hist'));await p.waitForTimeout(150);await p.click('[data-act="lore"]');await p.waitForTimeout(150);
  const L=await p.evaluate(()=>({t:document.getElementById('wtitle').innerText,rows:document.querySelectorAll('[data-act^="lsect:"]').length,txt:document.getElementById('wbody').innerText}));
  ok(`무림록 목록 "${L.t}" · ${L.rows}줄 · 이번 생 ${/구파일방의 아홉째/.test(L.txt)}`,/무림록/.test(L.t)&&L.rows>=18&&/구파일방의 아홉째/.test(L.txt));
  await p.click('[data-act="lsect:emei"]');await p.waitForTimeout(150);
  const C=await p.evaluate(()=>document.getElementById('wbody').innerText);
  ok(`아미 카드: 자리·인물·명소·이름 풀이·설정`,/아미산/.test(C)&&/정월 사태/.test(C)&&/금정 운해/.test(C)&&/금정검법/.test(C)&&/작품마다/.test(C)&&/앙숙/.test(C));
  await p.click('[data-act="lsect:"]');await p.waitForTimeout(100);await p.click('[data-act="lsect:hwasan"]');await p.waitForTimeout(100);
  const H=await p.evaluate(()=>document.getElementById('wbody').innerText);
  ok(`가 보지 않은 화산: 인물 ??? ${/\?\?\?/.test(H)} · 자리는 보임 ${/화음/.test(H)}`,/\?\?\?/.test(H)&&/화음/.test(H)&&!/청매 검선/.test(H));
  await p.evaluate(()=>closePanels());

  // 음공 적중: 음파 고리와 느려짐. 무공 창에 이름 풀이
  const hit=await p.evaluate(id=>{const e=mkMob('늑대',P.x+1,P.y);mobs.push(e);e.slow=0;const n0=fx.length;runHooks('hitDone',{X:{art:ARTS[id]},e});const r=fx.slice(n0).find(f=>f.t==='ring'&&f.um);
    P.arts[id]={p:10,f:ARTS[id].forms.map((f,i)=>i===0)};P.cur=id;openPanel('arts');const m=document.querySelector('.lmean');return{ring:!!r,slow:e.slow,mean:m&&m.innerText}},um.id);
  ok(`음공 적중: 고리 ${hit.ring} · 느려짐 ${hit.slow} · 무공 창 "${hit.mean}"`,hit.ring&&hit.slow>=1.4&&/소상/.test(hit.mean||''));
  await p.evaluate(()=>closePanels());

  // 문파 창에 앙숙·동맹과 무림록 단추
  const sd=await p.evaluate(()=>{const h=sectDetail(SECTS.namgung);return{rel:/앙숙/.test(h)&&/모용/.test(h),btn:/data-act="lore:namgung"/.test(h)}});
  ok(`문파 창: 앙숙 ${sd.rel} · 무림록 단추 ${sd.btn}`,sd.rel&&sd.btn);

  // 저장·불러오기 뒤에도 남는다
  const sv=await p.evaluate(()=>{saveGame(true);const d=migrateSave(JSON.parse(localStorage.getItem(SAVE_KEY)));return{leg:d.G.lore&&d.G.lore.leg.emei,kin:d.P.kin&&d.P.kin.namgung,monk:d.P.monk}});
  ok(`저장: 인물 ${sv.leg} · 직계 ${sv.kin} · 출가 ${sv.monk}`,sv.leg===1&&sv.kin===1&&sv.monk==='shaolin');

  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');
  await b.close();
})();

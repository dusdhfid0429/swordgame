// 패시브 무공: 공용(가입 없이) + 문파 고유(직위별), 같은 타입은 하위 무공 대성이 조건, 같은 타입 효과는 겹치지 않음
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const all=Object.values(PAS),com=all.filter(q=>!q.sect),sec=all.filter(q=>q.sect);
    const per=Object.values(SECTS).every(s=>{const l=pasOf(s.id);return l.length===3&&l[0].type===l[2].type&&l[0].tier===1&&l[2].tier===2&&l[0].rank<l[1].rank+1&&l[2].rank>l[0].rank});
    return{com:com.length,types:new Set(com.map(q=>q.type)).size,sec:sec.length,per,names:new Set(all.map(q=>q.n)).size===all.length,ex:pasOf('hwasan').map(q=>`${q.n}(${PTYPE[q.type].n}·${rankName('hwasan',q.rank)})`).join(', ')}});
  ok(`공용 패시브 ${r.com}개(버프 종류 ${r.types}가지), 문파 패시브 ${r.sec}개(문파마다 3개), 이름이 모두 다르다`,r.com===8&&r.types===8&&r.sec===150&&r.per&&r.names);
  ok(`화산파: ${r.ex}`,r.ex.includes('암향표')&&r.ex.includes('자하신공'));
  // 공용: 잡화점에서 비급을 사서 읽는다 (가입 없이)
  const s0=await p.evaluate(()=>{P.silver=500;const sp0=moveSpd();const i=SHOP.gen.findIndex(q=>q[0]==='pbook:P_spd');buy('gen',i);const it=P.bag.find(q=>q.slot==='pbook');readBook(it);
    return{sect:P.sect,has:!!P.pas.P_spd,bag:P.bag.some(q=>q.slot==='pbook'),sp0,sp1:moveSpd()}});
  ok(`문파 없이 공용 [팔보간섬] 익힘: 이동속도 ${s0.sp0.toFixed(2)} → ${s0.sp1.toFixed(2)}`,s0.sect==null&&s0.has&&!s0.bag&&s0.sp1>s0.sp0*1.012);
  // 숙련: 쓰러뜨리면 오른다, 효과도 커진다
  const s1=await p.evaluate(()=>{const v0=pv('spd');for(let i=0;i<20;i++)gainPas(2);return{p:P.pas.P_spd.p,v0,v1:pv('spd')}});
  ok(`숙련 ${s1.p.toFixed(1)}: 효과 ${(s1.v0*100).toFixed(1)}% → ${(s1.v1*100).toFixed(1)}%`,s1.p>5&&s1.v1>s1.v0);
  // 문파 패시브: 제자·직위·하위 무공 대성·공적
  const s2=await p.evaluate(()=>{const A2=PAS.PS_hwasan_0,B2=PAS.PS_hwasan_1,A3=PAS.PS_hwasan_2,out={};
    out.notMember=pasBlock(A2);P.sect='hwasan';P.mtot={hwasan:0};P.merit={hwasan:999};out.rank0=pasBlock(A2);
    P.mtot.hwasan=60;out.rank1low=pasBlock(A2);P.pas.P_spd.p=50;out.ok=pasBlock(A2);sectAct('plearn','PS_hwasan_0');out.learned=!!P.pas.PS_hwasan_0;out.merit=P.merit.hwasan;
    out.b2=pasBlock(B2);out.a3rank=pasBlock(A3);P.mtot.hwasan=400;out.a3low=pasBlock(A3);P.pas.PS_hwasan_0.p=50;out.a3=pasBlock(A3);
    const v=pv('spd');sectAct('plearn','PS_hwasan_2');out.stack=pv('spd')<=PTYPE.spd.v[2]+1e-9&&pv('spd')>=v;return out});
  ok(`가입 전 "${s2.notMember}", 속가제자 "${s2.rank0}"`,s2.notMember==='제자만'&&s2.rank0==='정식제자 이상');
  ok(`정식제자인데 공용 하위 무공 미대성 "${s2.rank1low}" → 대성하면 익힘 (공적 999→${s2.merit})`,s2.rank1low==='팔보간섬 대성 필요'&&s2.ok===null&&s2.learned&&s2.merit===939);
  ok(`다른 타입 2단계 "${s2.b2}", 3단계는 직위 "${s2.a3rank}", 호법이 되어도 2단계 미대성이면 "${s2.a3low}"`,s2.b2==="일대제자 이상"&&s2.a3rank==='호법 이상'&&s2.a3low==='이동속도 2단계 대성 필요'&&s2.a3===null);
  ok('같은 타입은 겹치지 않고 가장 센 것 하나',s2.stack);
  // 화면: 무공 창, 문파 창
  await p.evaluate(()=>openPanel('arts'));await p.waitForTimeout(200);
  ok('무공 창에 패시브 무공',await p.evaluate(()=>$('wbody').textContent.includes('패시브 무공')&&$('wbody').textContent.includes('암향표')));
  await p.evaluate(()=>{const c=[...document.querySelectorAll('#wbody .card')].find(e=>e.textContent.includes('패시브 무공'));c&&c.scrollIntoView()});await p.screenshot({path:shot('passive_arts')});
  await p.evaluate(()=>{closePanels();travel({to:'hq_hwasan',tx:20.5,ty:10.5})});await p.waitForTimeout(1800);
  await p.evaluate(()=>{const n=npcsHere().find(q=>q.id==='hq');openNpc(n)});await p.waitForTimeout(300);
  ok('본산 문파 창에 문파 패시브 셋',await p.evaluate(()=>['암향표','자하신공','매화비영보'].every(n=>$('wbody').textContent.includes(n))));
  await p.evaluate(()=>{const h=[...document.querySelectorAll('#wbody h4')].find(e=>e.textContent.includes('문파 패시브'));h&&h.scrollIntoView()});await p.screenshot({path:shot('passive_sect')});
  // 운기조식으로도 숙련
  const s3=await p.evaluate(()=>{closePanels();const a=P.pas.P_spd.p;P.medit=true;for(let i=0;i<60;i++)updateP(1/6);P.medit=false;return P.pas.P_spd.p>a});
  ok('운기조식하면 숙련이 오른다',s3);
  // 저장·불러오기
  const s4=await p.evaluate(()=>{saveGame(true);const d=loadGame();return!!(d.P.pas&&d.P.pas.PS_hwasan_0)});ok('저장에 패시브 무공',s4);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// 무공 등급: 대문파 무공이 군소문파 무공보다 등급이 높다
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const cnt={};let bad=[];for(const s of Object.values(SECTS))for(const a of s.arts){const g=ARTS[a.id].grade;cnt[AGR[g]]=(cnt[AGR[g]]||0)+1;
      const want=s.tier==='small'?(a.hi?2:1):(a.hi?3:2);if(g!==want)bad.push(a.n)}
    const gen=Object.values(ARTS).filter(a=>!a.sect&&!a.base&&!a.gy).every(a=>(a.grade||0)===0);
    // 같은 무기·같은 초식 자리의 위력 견주기: 화산 매화검법(대·일반) vs 남궁 창궁검법(소·일반), 이십사수매화검(대·고급) vs 제왕검형(소·고급)
    return{cnt,bad,gen,mul:[GMUL[artGrade('S_hwasan_0')],GMUL[artGrade('S_namgung_0')],GMUL[artGrade('S_hwasan_2')],GMUL[artGrade('S_namgung_1')]],
      cost:[meritCost({id:'S_hwasan_2'},0),meritCost({id:'S_namgung_1'},0),meritCost({id:'S_hwasan_0'},0),meritCost({id:'S_namgung_0'},0)],
      ult:[ARTS.S_hwasan_2.ult.steps[0].m,ARTS.S_namgung_1.ult.steps[0].m]}});
  ok(`등급 수: ${JSON.stringify(r.cnt)}, 어긋난 무공 ${r.bad.length}`,r.bad.length===0&&r.cnt['절정']>0&&r.cnt['상승']>0&&r.cnt['중승']>0);
  ok('문파 밖 무공은 하승',r.gen);
  ok(`위력 배수: 대·일반 ${r.mul[0]} > 소·일반 ${r.mul[1]}, 대·고급 ${r.mul[2]} > 소·고급 ${r.mul[3]}`,r.mul[0]>r.mul[1]&&r.mul[2]>r.mul[3]&&r.mul[3]===r.mul[0]);
  ok(`비급 공적(1초식): 절정 ${r.cost[0]}, 상승 ${r.cost[1]}/${r.cost[2]}, 중승 ${r.cost[3]}`,r.cost[0]>r.cost[1]&&r.cost[1]===r.cost[2]&&r.cost[2]>r.cost[3]);
  ok(`필살기 첫 타 배수 절정 ${r.ult[0]} > 상승 ${r.ult[1]}`,r.ult[0]>r.ult[1]);
  // 숙련은 높은 등급이 더디다
  const ms=await p.evaluate(()=>{P.arts.S_hwasan_2={p:10,f:[1]};P.arts.S_namgung_0={p:10,f:[1]};gainMast('S_hwasan_2',5);gainMast('S_namgung_0',5);return[P.arts.S_hwasan_2.p-10,P.arts.S_namgung_0.p-10]});
  ok(`숙련 오름: 절정 ${ms[0].toFixed(2)} < 중승 ${ms[1].toFixed(2)}`,ms[0]<ms[1]);
  // 화면: 문파 창과 연락관 목록에 등급
  await p.evaluate(()=>{travel({to:'hq_hwasan',tx:20.5,ty:10.5})});await p.waitForTimeout(1800);
  await p.evaluate(()=>{const n=npcsHere().find(q=>q.id==='hq');openNpc(n)});await p.waitForTimeout(300);
  ok('본산 창에 무공 등급(상승·절정)',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('절정')&&t.includes('상승')}));
  await p.screenshot({path:shot('grade_sect')});
  await p.evaluate(()=>{closePanels();sectView=null;openNpc(npcAt('jeong'))});await p.waitForTimeout(300);
  ok('정의맹 목록에 문파마다 무공 등급 범위',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('상승~절정 무공')&&t.includes('중승~상승 무공')}));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

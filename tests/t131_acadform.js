// v206 (사용자 2026-10-29): 졸업했거나 윤회 때 무관을 건너뛴 생도 무관 병기 교두에게 무관 무공의 남은 초식을 전수받는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const url='file://'+require('path').resolve(__dirname,'../dist/gangho.html');
  await p.goto(url);await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');
  await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const dlg=()=>{openNpc(npcsHere().find(n=>n.id==='ac_i1'));return $('wbody').textContent};
  // 1. 졸업생: 창법(열화창법)을 숙련 50까지 올리고 졸업 → 교두가 3초까지 전수, 4초(숙련 60)는 막힘
  const r1=await p.evaluate(dlg=>{dlg=eval(dlg);const id='정창0',a=ARTS[id];P.acad.cls='창';P.arts[id]={p:50,f:a.forms.map((f,i)=>i===0)};P.acad.grad=1;P.vit=1000;
    const t=dlg(),btn=!!document.querySelector('[data-act="acform:1"]');act('acform:1');act('acform:2');act('acform:3');closePanels();
    return{t,btn,f:P.arts[id].f.slice(),vit:P.vit,on:acadOn(),c:a.forms[1].cost+a.forms[2].cost}},dlg.toString());
  ok(`졸업 뒤 병기 교두 창에 초식 전수 (${r1.t.includes('초식 전수')&&r1.t.includes('졸업한 뒤에도')}), 2·3초 배움, 4초는 숙련 60이라 막힘 (${r1.f.join(',')}), 활력 ${1000-r1.vit} 씀`,
    !r1.on&&r1.btn&&r1.f[1]&&r1.f[2]&&!r1.f[3]&&r1.vit===1000-r1.c);
  // 2. 숙련이 오르면 알림 (졸업 뒤에는 무관 이름과 함께)
  const r2=await p.evaluate(()=>{P.arts['정창0'].p=61;logEl.innerHTML='';for(let i=0;i<3;i++)runHooks('tick',1.1);return logEl.textContent});
  ok(`졸업 뒤 숙련 60 → 알림 "${(r2.match(/[^.]*청운무관 병기 교두[^.]*/)||[''])[0].trim()}"`,r2.includes('청운무관 병기 교두'));
  // 3. 무관을 건너뛴 생: 고른 병기(봉)의 무관 무공 화운봉법
  const r3=await p.evaluate(dlg=>{dlg=eval(dlg);const id='정봉0',a=ARTS[id];P.acad=null;P.acadSkip=1;P.startCls='봉';P.arts[id]={p:25,f:a.forms.map((f,i)=>i===0)};P.vit=500;
    const t=dlg();act('acform:1');closePanels();return{t,f:P.arts[id].f.slice()}},dlg.toString());
  ok(`건너뛴 생도 전수 (${r3.t.includes('화운봉법 초식 전수')}), 2초 배움 (${r3.f[1]})`,r3.t.includes('화운봉법 초식 전수')&&r3.f[1]&&!r3.f[2]);
  // 4. 무관과 상관없는 생(옛 저장)은 전수 칸이 없다
  const r4=await p.evaluate(dlg=>{dlg=eval(dlg);P.acadSkip=0;const t=dlg();const f=P.arts['정봉0'].f[2];P.arts['정봉0'].p=99;act('acform:2');closePanels();return{t,f2:P.arts['정봉0'].f[2]}},dlg.toString());
  ok(`무관과 상관없는 생은 전수 없음`,!r4.t.includes('초식 전수')&&!r4.f2);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close();
})();

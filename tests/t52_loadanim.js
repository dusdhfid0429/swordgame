// 저장을 이어 할 때 지난 판의 시각이 적힌 연출 상태(회피 P.dA, 보법 P.bA, 경공 연타 P.ggc)가 남아 이동 모션이 안 나오던 문제 (사용자 보고 2026-10-12 "게임을 시작하면 이동 모션이 재생 안되는 이슈")
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[],warns=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text());if(m.type()==='warning')warns.push(m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  // 지난 판에서 900초쯤 놀다가 회피 직후·경공 연타 중·보법 도중에 저장
  await p.evaluate(()=>{time=900;P.dA=time;P.ggc={n:2,until:time+1};P.bA={seq:[100,101],t0:time,dur:.6,move:.3};saveGame()});
  await p.reload();await p.waitForFunction(()=>typeof loadRegion==='function');await p.click('[data-s="cont"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const st=await p.evaluate(()=>({dA:P.dA,bA:P.bA,ggc:P.ggc,next:ggNext(),t:+time.toFixed(1)}));
  ok(`이어 하기 뒤 회피 ${st.dA} 보법 ${st.bA} 연타 ${st.ggc} → 경공 1단부터(${st.next}) · 시계 ${st.t}`,st.dA===0&&st.bA===null&&st.ggc===null&&st.next===1);
  // 기초권각(맨손)이라 v123부터는 핸드오프 시트의 run 클립, 무기 무공이면 몸통 41~48
  await p.keyboard.down('ArrowRight');const fr=[];for(let i=0;i<8;i++){await p.waitForTimeout(70);fr.push(await p.evaluate(()=>{const f=heroFrame();return f[4]==='wuxia'?'w'+f[0]:f[0]}))}await p.keyboard.up('ArrowRight');
  const wxRun=await p.evaluate(()=>SHEETS.wuxia.clips.run.f),run=fr.every(i=>typeof i==='string'?wxRun.includes(+i.slice(1)):(i>=41&&i<=48)),uniq=new Set(fr).size;
  ok(`이동 중 장 ${fr.join(',')} → 달리기 장(시트 run 또는 41~48) ${run}, ${uniq}가지`,run&&uniq>=3);
  // 그래도 시계보다 뒤인 시각이 들어오면 도트 고르기가 스스로 걸러낸다
  const g=await p.evaluate(()=>{P.eq.weapon=null;P.dA=time+500;P.bA={seq:[100,101],t0:time+500,dur:.6,move:.3};const f=heroFrame()[0];const o={f,bA:P.bA};P.dA=0;return o});
  ok(`미래 시각의 회피·보법은 무시 (장 ${g.f}, 보법 ${g.bA})`,g.f>=0&&g.bA===null);
  const miss=warns.filter(w=>/hero frame missing/.test(w));
  ok(`장 번호 없음 경고 ${miss.length}개`,miss.length===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

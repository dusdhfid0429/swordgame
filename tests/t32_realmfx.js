// 경지 제안서 2·4·5번: 경지별 효과, 경지 차이 체감, 깨달음 계기, 갑자·영약·심법 계열·단전
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[]});
  // 갑자 표시, 심법 계열
  const g=await p.evaluate(()=>({a:gapja(60),b:gapja(120),c:gapja(300),d:gapja(1000),s:school(),sd:(P.side='사',school()),sh:(P.side='정',P.sect='hwasan',school()),sm:(P.sect='cheonma',school()),sx:(P.sect=null,school()),sp:(P.sect='mandok',school()),sk:(P.sect='podal',school()),z:(P.sect=null)}));
  ok(`갑자 ${g.a} / ${g.b} / ${g.c} / ${g.d}, 계열 ${g.s}·${g.sd}·${g.sh}·${g.sm}·만독문 ${g.sp}·포달랍궁 ${g.sk}`,g.b==='1갑자'&&g.c==='2갑자 반'&&g.d==='8갑자'&&g.s==='불가'&&g.sd==='사공'&&g.sh==='도가'&&g.sm==='마공'&&g.sp==='사공'&&g.sk==='사공');
  // 이류 소주천: 내공 회복 +30%, 경공 거리
  const r1=await p.evaluate(()=>{const q0=qiRegen(),l0=leapRange();P.realm=1;realmFxSync();return{q:qiRegen()/q0,l:leapRange()-l0}});
  ok(`이류 소주천: 회복 ×${r1.q.toFixed(2)}, 경공 +${r1.l.toFixed(1)}`,Math.abs(r1.q-1.3)<.01&&Math.abs(r1.l-.6)<.01);
  // 일류 검기: 방어 무시 + 피해 ↑
  const r2=await p.evaluate(()=>{const X=mkX('base');const run=()=>{const e=mkMob('강시',P.x+1,P.y);e.hp=e.maxHp=99999;mobs=[e];const R=Math.random;Math.random=()=>.5;hitE(X,e,1,0,0);Math.random=R;return 99999-e.hp};
    P.realm=0;const a=run();P.realm=2;realmFxSync();const b=run();return{a,b}});
  ok(`일류 검기: 강시에게 ${r2.a} → ${r2.b}`,r2.b>r2.a*1.2);
  // 절정 중단전: 최대 내공 +15%
  const r3=await p.evaluate(()=>{P.realm=2;recalc();const m0=P.maxQi;P.realm=3;realmFxSync();recalc();return{m0,m1:P.maxQi,dan:danName()}});
  ok(`절정 임독양맥: 최대 내공 ${r3.m0}→${r3.m1}, ${r3.dan}`,r3.m1===Math.round(r3.m0*1.15)&&r3.dan==='중단전');
  // 초절정 호신강기: 두 단계 아래 산적의 공격은 1/5
  const r4=await p.evaluate(()=>{P.realm=4;realmFxSync();const e=mkMob('산적',P.x+1,P.y);const R=Math.random;Math.random=()=>.99;P.inv=0;P.hp=P.maxHp;const h0=P.hp;hurtP(100,e);const d1=h0-P.hp;P.realm=1;P.hp=P.maxHp;hurtP(100,e);const d2=P.maxHp-P.hp;Math.random=R;P.realm=4;return{d1,d2,mr:mobRealm(e)}});
  ok(`호신강기: 산적(${r4.mr}) 공격 ${r4.d2} → ${r4.d1}`,r4.d1<=Math.ceil(r4.d2*.25));
  // 경지 차이: 하수 산적은 겁먹고 달아난다, 반박귀진(화경)이면 덤빈다
  const r5=await p.evaluate(()=>{P.realm=4;const e=mkMob('산적',P.x+2,P.y);mobs=[e];updateMob(e,.05);const f1=e.flee>0&&!e.aggro;
    P.realm=5;realmFxSync();const e2=mkMob('산적',P.x+2,P.y);mobs=[e2];updateMob(e2,.05);return{f1,f2:e2.flee>0,a2:e2.aggro,sense:senseText(mkMob('혈교장로',0,0))}});
  ok(`하수는 달아남 ${r5.f1}, 반박귀진이면 겁먹지 않음 ${!r5.f2}, 혈교장로 기도 '${r5.sense}'`,r5.f1&&!r5.f2);
  // 화경 환골탈태: 기본기 +2, 수명 +10 (한 번만)
  const r6=await p.evaluate(()=>{const s=P.st.str,l=P.life;realmFxSync();return{s:P.st.str-s,l:P.life-l,once:P.rfx[5]}});
  ok(`환골탈태 한 번만: 다시 맞춰도 근력 +${r6.s}, 수명 +${r6.l}`,r6.s===0&&r6.l===0&&r6.once);
  // 깨달음: 산 정상 운기조식, 일출 두 배, 산마다 한도
  await p.evaluate(()=>{P.realm=0;const m=REGIONS.pv_shandong?REGIONS.pv_shandong.marks.find(q=>q.n==='태산'):null;const mm=m||Object.values(REGIONS).find(R=>R.lm&&R.lm.t==='m');const id=m?m.gate:Object.keys(REGIONS).find(k=>REGIONS[k]===mm);
    P.reg=id;loadRegion(id);mobs=[];P.x=20.5;P.y=7.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;P.enl=0;P.peaks={};tod=.24;P.medit=true});
  await p.evaluate(()=>{for(let i=0;i<9*60;i++)trainTick(1/60)});
  const r7=await p.evaluate(()=>({enl:P.enl,name:REGION().name,mu:pillarVal('mu')}));
  ok(`${r7.name} 정상 일출 명상: 깨달음 ${r7.enl}, 무리에 더해짐 ${r7.mu}`,r7.enl===.2&&r7.mu>=.2);
  await p.evaluate(()=>{for(let i=0;i<200*60;i++)trainTick(1/60)});
  const cap=await p.evaluate(()=>P.enl);ok(`산마다 한도: ${cap}`,cap===2||cap===1);
  await p.screenshot({path:shot('realm_peak')});
  // 돈오 +1.5, 비무 고수 +1
  const r8=await p.evaluate(()=>{P.medit=false;const e0=P.enl;P.arts.base.p=99.99;gainMast('base',50);const a=P.enl-e0;
    P.duel=4;const e1=P.enl;P.realm=0;duelEnd(false);return{a,b:P.enl-e1}});
  ok(`돈오 깨달음 +${r8.a}, 높은 고수와 비무 +${r8.b}`,r8.a===1.5&&r8.b===1);
  // 영약: 공청석유 1갑자, 한 생에 한 번
  const r9=await p.evaluate(()=>{P.mats.공청석유=2;const q=baseQi();useCon('공청석유');const q1=baseQi();useCon('공청석유');return{d:q1-q,again:baseQi()-q1,left:P.mats.공청석유}});
  ok(`공청석유 +${r9.d}, 두 번째는 효험 없음 +${r9.again}`,r9.d===120&&r9.again===0&&r9.left===1);
  // 마공: 수련마다 내공 더, 악업
  const r10=await p.evaluate(()=>{P.sect='cheonma';const q=baseQi(),ev=P.evil;P.qiN++;qiTrained();const d=baseQi()-q;P.sect=null;return{d,ev:P.evil-ev}});
  ok(`마공 수련 1회 내공 +${r10.d}, 악업 +${r10.ev}`,r10.d>=12&&r10.ev===1);
  // 인물창: 갑자·단전·계열·깨달음·경지의 길
  await p.evaluate(()=>{P.realm=3;openPanel('char')});await p.waitForTimeout(300);
  ok('인물창 경지 카드',await p.evaluate(()=>{const t=$('wbody').textContent;return t.includes('갑자')&&t.includes('중단전')&&t.includes('심법 계열')&&t.includes('깨달음')&&t.includes('경지의 길')}));
  await p.evaluate(()=>{const d=$('wbody').querySelector('details');if(d)d.open=true;const c=[...$('wbody').querySelectorAll('.card')].find(x=>x.textContent.includes('경지의 길'));c&&c.scrollIntoView()});await p.waitForTimeout(200);
  await p.screenshot({path:shot('realm_fx_char')});
  // 본원진기 2점마다 수명 +1년, 깎이면 줄어든다
  const lf=await p.evaluate(()=>{const l0=P.life;P.st.qi+=4;recalc();const l1=P.life;P.st.qi-=2;recalc();return{up:l1-l0,down:P.life-l1}});
  ok(`본원진기 +4 → 수명 +${lf.up}년, -2 → ${lf.down}년`,lf.up===2&&lf.down===-1);
  // 예전 저장(v42): 경지 효과를 불러올 때 채운다
  const m=await p.evaluate(()=>{closePanels();P.realm=5;delete P.rfx;delete P.enl;saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));const l=P.life;applySave(d);return{rfx:Object.keys(P.rfx).length,enl:P.enl}});
  ok(`예전 저장: 경지 효과 ${m.rfx}개 채움, 깨달음 ${m.enl}`,m.rfx===5&&m.enl===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

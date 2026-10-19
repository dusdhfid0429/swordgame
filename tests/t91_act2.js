// v153: 두 번째 천하대전(첫 대전 승자별 2막), 경지별 처치 활력, 봉문·점령의 시간, 직위 상한, 결전 공로, 영약·호법·기부, 천하통일 세상
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];P.sect='hwasan';P.mtot={hwasan:0};P.merit={hwasan:0};P.quests=[]});
  // 1. 첫 대전을 마교 편이 이기면 2막 '어둠의 천하'가 열린다
  const r1=await p.evaluate(()=>{const s=PS();for(const e of SEV)s.pick[e.id]=SEV.length-1;P.age=29;
    G.war={life:P.lifeNo,y:Math.floor(G.cal),plan:{id:'t',n:'시험',d:'',sides:[['마'],['정','사']],notes:[]},round:3,rounds:[{win:0,sc:[1,0],me:'무'},{win:0,sc:[1,0],me:'무'},{win:0,sc:[1,0],me:'무'}],won:null};
    warEnd(true);warEnd===warEnd;const silentAct=PS().act;   // 조용한 끝(죽음)에는 2막을 열지 않는다
    G.war={life:P.lifeNo,y:Math.floor(G.cal),plan:{id:'t',n:'시험',d:'',sides:[['마'],['정','사']],notes:[]},round:3,rounds:[{win:0,sc:[1,0],me:'무'},{win:0,sc:[1,0],me:'무'},{win:0,sc:[1,0],me:'무'}],won:null};
    delete s.act;s.flag.warDone=false;warEnd();
    return{silentAct,act:s.act,br:s.br,rule:s.rule.join(''),ev:curEv().map(e=>e.id+'@'+e.age).join(','),warDone:s.flag.warDone,role:myRole(),age:warAge(),html:pStory().includes('어둠의 천하'),stage:lifeStage()}});
  ok(`2막 열림: act ${r1.act} 줄기 ${r1.br} 지배 ${r1.rule} 내 편 ${r1.role}, 사건 ${r1.ev}, 대전 ${r1.age}세, 정세창 ${r1.html}, 단계 ${r1.stage}`,r1.act===2&&r1.br==='마'&&r1.rule==='마'&&r1.role==='resist'&&r1.ev.startsWith('b2_마_0@36')&&!r1.warDone&&r1.age===48&&r1.html);
  // 2. 36세: 2막 첫 사건이 열리고, 맞서는 편 선택만 보이며 임무 적은 지배 편(마교) 무인이다
  const r2=await p.evaluate(()=>{P.age=36.1;runHooks('tick',.016);const s=PS(),e=evOf(s.open);const card=evCard(e);
    const ruleRefused=!pickChoice(e,0,false);const took=pickChoice(e,1,false);const q=P.quests.find(q=>q.story===e.id);
    return{open:e&&e.id,hasRes:card.includes('등불을 다시 켠다'),hasRule:card.includes('의식을 지킨다'),ruleRefused,took,mob:q&&q.mob.join('·'),due:storyDueIn(5)}});
  ok(`2막 사건 ${r2.open}: 저항 선택 보임 ${r2.hasRes}, 지배 선택 숨김 ${!r2.hasRule}·거부 ${r2.ruleRefused}, 임무 적 ${r2.mob}, 5년 안 다음 사건 ${r2.due}세`,r2.open==='b2_마_0'&&r2.hasRes&&!r2.hasRule&&r2.ruleRefused&&r2.took&&/마교/.test(r2.mob||'')&&r2.due===41);
  // 3. 마지막 사건을 고르면 제2차 천하대전: 마교 대 정·사 저항 연합
  const r3=await p.evaluate(()=>{P.quests=[];mobs=[];const s=PS();P.age=47.6;runHooks('tick',.016);const e=evOf(s.open);pickChoice(e,1,false);
    const w=G.war;const out={open:e&&e.id,on:warOn(),n:w&&w.plan.n,sides:w&&w.plan.sides.map(x=>x.join('')).join('|'),front:!!s.flag.front,lbl:storyCard().includes('제2차 천하대전')};
    G.war=null;s.flag.warDone=true;return out});
  ok(`제2차 천하대전 ${r3.on}: ${r3.n} (${r3.sides}), 앞장섬 ${r3.front}, 정세 줄 ${r3.lbl}`,r3.on&&/광명의 전쟁/.test(r3.n)&&r3.sides.startsWith('마|')&&r3.sides.includes('정')&&r3.front);
  // 4. 결전 공로 = 15 + 5×경지, 처치 활력은 적 경지마다 +40%
  const r4=await p.evaluate(()=>{P.realm=3;const m=warMerit();P.realm=0;const kill=r=>{mobs=[];const e=mkMob('산적',P.x+3,P.y);e.realm=r;mobs.push(e);const v0=P.vit;onKill(e);return P.vit-v0};
    P.vit=0;const a=kill(0);const b2=kill(2);return{m,a,b:b2}});
  ok(`결전 공로 절정 ${r4.m}, 처치 활력 경지0 ${r4.a} → 경지2 ${r4.b}`,r4.m===30&&r4.a>0&&Math.abs(r4.b/r4.a-1.8)<.15);
  // 5. 봉문은 10년 뒤 풀리고, 점령당한 문파는 재건을 시도한다 (확률을 1로)
  const r5=await p.evaluate(()=>{const y=Math.floor(G.cal);G.seal={mudang:{y:y-10},emei:{y:y-3}};G.occ={shaolin:{by:'마',y:y-5}};const rnd=Math.random;Math.random=()=>0;
    decayYear();Math.random=rnd;const out={mudang:!G.seal.mudang,emei:!!G.seal.emei,occ:!G.occ.shaolin};G.seal={};G.occ={};return out});
  ok(`봉문 10년 풀림 ${r5.mudang}, 3년은 그대로 ${r5.emei}, 점령 재건 ${r5.occ}`,r5.mudang&&r5.emei&&r5.occ);
  // 6. 직위 상한 = 경지+1. 경지가 오르면 막혀 있던 직위가 오른다
  const r6=await p.evaluate(()=>{P.realm=0;P.mtot={hwasan:99999};const a=rankIdx('hwasan');const cap=rankHtml(SECTS.hwasan).includes('이상');P.realm=1;P.rfx={};realmGain(1);const b2=rankIdx('hwasan');
    P.realm=6;const top=rankIdx('hwasan');P.realm=0;P.mtot={hwasan:0};return{a,cap,b:b2,top,mx:rankTop('hwasan')}});
  ok(`직위 삼류 ${r6.a}, 막힘 표시 ${r6.cap}, 이류 ${r6.b}, 현경 ${r6.top}/${r6.mx}`,r6.a===1&&r6.cap&&r6.b===2&&r6.top===r6.mx);
  // 7. 약방 영약: 경지가 모자라면 못 산다. 호법 고용, 문파 기부
  const r7=await p.evaluate(()=>{const i=SHOP.pharm.findIndex(x=>x[0]==='대환단');P.silver=5000;P.realm=0;const n0=P.mats.대환단||0;buy('pharm',i);const blocked=(P.mats.대환단||0)===n0;
    P.realm=2;buy('pharm',i);const got=(P.mats.대환단||0)===n0+1;const paid=5000-P.silver;
    const pp=pgPlace;pgPlace=()=>'시험';P.sect=null;const was=hobeop();P.silver=1000;hobHire();const hired=hobeop(),cost=1000-P.silver;pgPlace=pp;P.hob=0;P.sect='hwasan';P.realm=0;
    P.silver=1000;const m0=P.merit.hwasan||0,p0=sectPop('hwasan'),v0=sectVault('hwasan');donate('hwasan',1000);
    return{blocked,got,paid,was,hired,cost,merit:(P.merit.hwasan||0)-m0,pop:Math.round((sectPop('hwasan')-p0)*10)/10,vault:sectVault('hwasan')-v0,silver:P.silver}});
  ok(`대환단 삼류 막힘 ${r7.blocked}, 일류 삼 ${r7.got}(은자 ${r7.paid}), 호법 고용 ${!r7.was}→${r7.hired}(은자 ${r7.cost}), 기부 1000: 공적 +${r7.merit} 인원 +${r7.pop} 금고 +${r7.vault}`,
    r7.blocked&&r7.got&&r7.paid===400&&!r7.was&&r7.hired&&r7.cost===300&&r7.merit>=100&&r7.pop>0&&r7.vault===1000&&r7.silver===0);
  // 8. 천하통일 세상: 마교 천하면 하늘이 어둡고 물가가 오르며 정파 대문파가 봉문할 수 있다
  const r8=await p.evaluate(async()=>{G.unified={by:'마',y:Math.floor(G.cal),life:P.lifeNo};const dark=worldMul('dark',0),price=worldPrice(100),card=unifyCard().includes('어둠의 천하');
    const rnd=Math.random;Math.random=()=>0;G.seal={};runHooks('newYear');Math.random=rnd;const sealed=Object.keys(G.seal).length;
    await new Promise(r=>setTimeout(r,300));G.unified={by:'관'};const bp=worldMul('board');G.unified=null;return{dark,price,card,sealed,bp,plain:worldPrice(100)}});
  ok(`마교 천하: 어둠 ${r8.dark}, 물가 100→${r8.price}, 정세창 ${r8.card}, 봉문 ${r8.sealed}곳 · 관 천하 의뢰 ×${r8.bp} · 통일 없으면 ${r8.plain}`,r8.dark>0&&r8.price===110&&r8.card&&r8.sealed>=1&&r8.bp===1.3&&r8.plain===100);
  // 9. 옛 저장: 첫 대전을 마친 생은 불러오면 2막으로
  const r9=await p.evaluate(()=>{const s=PS();delete s.act;s.flag.warDone=true;G.wars.push({life:P.lifeNo,won:['정'],n:'시험'});runHooks('gLoaded');return{act:s.act,br:s.br}});
  ok(`옛 저장 → 2막 ${r9.act} (${r9.br})`,r9.act===2&&r9.br==='정');
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

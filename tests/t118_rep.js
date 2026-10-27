// v182 세력·문파 우호도 (g_rep.js): 바탕·단계, 같은 편 공격→경계→적대, 적 세력과 친해지기, 임무·행렬·예물, 해 넘김, 저장 v7, 윤회 초기화, 인물창
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await b.newPage({viewport:{width:420,height:820}});
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.evaluate(()=>{paused=true;window.sim=(sec)=>{for(let t=0;t<sec*30;t++){time+=1/30;for(const e of mobs)updateMob(e,1/30);mobs=mobs.filter(e=>e.hp>0)}};
    window.place=(fac,dx,dy,sid,el)=>{const e=mkFac(fac,el?1:0,P.x+dx,P.y+dy,sid);mobs.push(e);return e};loadRegion('pv_henan');P.sect=null;mobs=[];
    const t=[[0,0]].concat([...Array(30)].map((_,i)=>[i%6-3,Math.floor(i/6)-3]));for(let y=4;y<36;y++)for(let x=4;x<36;x++)if(walk(x,y)&&t.every(([a,c])=>walk(x+a,y+c))){P.x=x+.5;P.y=y+.5;return}});
  // 1) 바탕: 정파 낭인은 정파 30(내 세력), 관군 20, 사파·마교 -60(적대)
  const r1=await p.evaluate(()=>({j:repFac('정'),g:repFac('관'),s:repFac('사'),m:repFac('마'),gb:repSect('gaebang'),st:REP.names[repStageOf(repFac('사'))],rep:JSON.stringify(P.rep||null)}));
  ok(`바탕 우호도 정 ${r1.j} · 관 ${r1.g} · 사 ${r1.s}(${r1.st}) · 마 ${r1.m} · 개방 ${r1.gb}`,r1.j===30&&r1.g===20&&r1.s===-60&&r1.m===-60&&r1.gb===30&&r1.st==='적대');
  // 2) 같은 편 개방 무인을 치면: 악업, 개방 -10·정파 -4. 두 번째 무인(다른 개방 제자)은 아직 중립
  const r2=await p.evaluate(()=>{mobs=[];const a=place('정',2,0,'gaebang'),ev=P.evil;damage(a,1,0,0,P);const c=place('정',-2,0,'gaebang');
    return{ang:!!a.angry,evil:P.evil-ev,sect:P.rep.sect.gaebang,fac:P.rep.fac['정'],v:repSect('gaebang'),c:peaceful(c),hs:repSect('hwasan')}});
  ok(`개방 무인을 치면 개방 -10, 정파 -4, 악업 +${r2.evil} (개방 ${r2.v}, 화산 ${r2.hs}, 다른 개방 제자는 아직 덤비지 않음)`,r2.ang&&r2.evil>0&&r2.sect===-10&&r2.fac===-4&&r2.v===16&&r2.c&&r2.hs===26);
  // 3) 개방 무인을 죽이면 개방이 경계로: 새 개방 제자는 먼저 덤비지 않지만 곁에 머물면 칼을 뽑는다
  const r3=await p.evaluate(()=>{const a=mobs.find(m=>m.angry);a.hp=1;damage(a,5,0,0,P);mobs=mobs.filter(m=>m.hp>0);
    const v=repSect('gaebang'),st=REP.names[repStageOf(v)];mobs=[];const c=place('정',1.2,0,'gaebang'),pc=peaceful(c),stay=s=>{for(let t=0;t<s*30;t++){P.x=c.x+1.2;P.y=c.y;sim(1/30)}};stay(1);const early=!!c.angry;stay(3);
    return{v,st,pc,early,late:!!c.angry&&mobFoeP(c),join:joinBlock(SECTS.gaebang)}});
  ok(`개방 우호도 ${r3.v} → ${r3.st}: 처음엔 평화, 곁에 3초 넘게 있으면 칼을 뽑음`,r3.st==='경계'&&r3.pc&&!r3.early&&r3.late);
  ok(`원한이 깊어 개방이 가입을 거절: ${r3.join}`,/잊지 않았다/.test(r3.join||''));
  // 4) 더 치면 적대: 개방 제자는 보이는 대로 적이고, 그를 쳐도 배신(악업)이 아니다. 화산파는 그대로 중립
  const r4=await p.evaluate(()=>{repAdd('gaebang',0,-40);mobs=[];const c=place('정',3,0,'gaebang'),h=place('정',-3,0,'hwasan');const ev=P.evil;damage(c,1,0,0,P);
    return{st:REP.names[repStageOf(repSect('gaebang'))],foe:mobFoeP(c),evil:P.evil-ev,h:peaceful(h)}});
  ok(`개방 ${r4.st}: 개방 제자가 적, 쳐도 악업 ${r4.evil}, 화산파는 평화`,r4.st==='적대'&&r4.foe&&r4.evil===0&&r4.h);
  // 5) 적 세력과 친해지기: 사파 우호도를 올리면 경계(덤비지 않음), 그 사파 문파가 객원 임무를 준다. 천하대전 중 적 진영은 상관없이 적
  const r5=await p.evaluate(()=>{P.rep.fac['사']=25;mobs=[];const s=place('사',3,0,'noklim');const pc=peaceful(s);sim(.5);
    const html=sectDetail(SECTS.noklim,true);return{v:repSect('noklim'),pc,ag:!!s.aggro,hire:html.includes('객원 임무')&&html.includes('stake:noklim')}});
  ok(`사파 우호도 +25 → 녹림채 ${r5.v}(경계): 먼저 덤비지 않고 객원 임무를 준다`,r5.pc&&!r5.ag&&r5.hire);
  // 6) 적 처치는 그 적의 적에게 고마운 일: 마교도를 쓰러뜨리면 사파·관군 세력 값이 오른다
  const r6=await p.evaluate(()=>{const s0=P.rep.fac['사']||0,g0=P.rep.fac['관']||0;mobs=[];const m=place('마',2,0);m.hp=1;damage(m,5,0,0,P);return{s:(P.rep.fac['사']||0)-s0,g:(P.rep.fac['관']||0)-g0,c:P.rep.sect[m.sect]}});
  ok(`마교도 처치: 사파 +${r6.s}, 관군 +${r6.g}, 그 마교 문파 ${r6.c}`,r6.s>0&&r6.g>0&&r6.c<0);
  // 7) 임무 보고: 금군 임무(정파 낭인) → 금군 +10, 관군 +3. 내 문파 임무는 +6/+2
  const r7=await p.evaluate(()=>{const g0=repSect('geumgun'),f0=P.rep.fac['관']||0;P.quests.push({n:'[금군] 시험',kind:'kill',mob:['x'],cnt:1,have:1,sect:'geumgun',merit:10,silver:1,vit:0,fame:0,good:0,key:'geumgun:t'});
    panel=null;act('qdone:'+(P.quests.length-1));return{d:repSect('geumgun')-g0,f:(P.rep.fac['관']||0)-f0,mer:P.merit.geumgun}});
  ok(`금군 임무 보고: 금군 +${r7.d}, 관군 세력 +${r7.f}`,r7.d===13&&r7.f===3);
  // 8) 행렬: 털면 관군 -6, 구하면 +2
  const r8=await p.evaluate(()=>{const a=P.rep.fac['관']||0;runHooks('cvRob',{});const b2=P.rep.fac['관']||0;runHooks('cvSaved',{});return{rob:b2-a,save:(P.rep.fac['관']||0)-b2}});
  ok(`행렬 약탈 관군 ${r8.rob}, 구출 +${r8.save}`,r8.rob===-6&&r8.save===2);
  // 9) 예물: 은자 100, 한 해 한 번
  const r9=await p.evaluate(()=>{P.silver=500;const a=repSect('hwasan');act('rgift:hwasan');const b2=repSect('hwasan');act('rgift:hwasan');return{d:b2-a,again:repSect('hwasan')-b2,silver:P.silver,why:repGiftWhy(SECTS.hwasan)}});
  ok(`화산파 예물 +${r9.d}, 같은 해 다시는 안 됨 (${r9.why}), 은자 ${r9.silver}`,r9.d===6&&r9.again===0&&r9.silver===400);
  // 10) 해가 바뀌면 원한은 10%, 은혜는 5% 옅어진다
  const r10=await p.evaluate(()=>{P.rep.sect.gaebang=-50;P.rep.fac['사']=20;runHooks('newYear');return{g:P.rep.sect.gaebang,s:P.rep.fac['사']}});
  ok(`해 넘김: 개방 -50 → ${r10.g}, 사파 20 → ${r10.s}`,r10.g===-45&&r10.s===19);
  // 11) 인물창 카드, 우호 단계면 비급 공적 할인
  const r11=await p.evaluate(()=>{openPanel('char');const h=$('wbody').innerHTML;closePanels();const a=SECTS.hwasan.arts[0],c0=meritCost(a,0);P.rep.sect.hwasan=30;const c1=meritCost(a,0);
    return{card:h.includes('세력·문파 우호도')&&h.includes('개방')&&h.includes('적대'),c0,c1}});
  ok(`인물창에 우호도 카드, 우호 단계 비급 공적 ${r11.c0} → ${r11.c1}`,r11.card&&r11.c1<r11.c0);
  // 12) 저장 v7: 옛 저장(v6)은 빈 우호도를 받고, 지금 저장은 그대로 돌아온다
  const r12=await p.evaluate(()=>{const old=migrateSave({v:7,P:{sect:null}});saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));
    return{ver:SAVE_VER,old:JSON.stringify(old.P.rep),cur:d.P.rep&&d.P.rep.sect.gaebang}});
  ok(`저장 형식 ${r12.ver}: 옛 저장 rep ${r12.old}, 지금 저장 개방 ${r12.cur}`,r12.ver>=8&&r12.old==='{"fac":{},"sect":{},"gift":{}}'&&r12.cur===-45);
  // 13) 윤회: 새 생은 우호도가 비어 있다
  const r13=await p.evaluate(()=>{newLife({name:'윤회',side:'정',gg:0,wis:5,status:0,cls:'검'});return{rep:JSON.stringify(P.rep||null),gb:repSect('gaebang')}});
  ok(`윤회하면 우호도가 처음부터 (${r13.rep}, 개방 ${r13.gb})`,r13.gb===30);
  ok('오류 없음: '+errs.join(' | ').slice(0,300),errs.length===0);
  await b.close();
})();

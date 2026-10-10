// 적의 무공·장비 장착과 전리품: 비급은 그 적이 아는 초식, 장비는 차고 있던 것, 은자는 바로 들어온다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 사람 몹은 무공과 병기를, 짐승은 아무것도 갖지 않는다
  const k=await p.evaluate(()=>{const g=k=>{const e=mkMob(k,P.x+1,P.y);return{art:e.art,known:e.known,w:e.eq&&e.eq.weapon&&e.eq.weapon.cls,n:e.eq?Object.values(e.eq).filter(Boolean).length:0}};
    const f=mkFac('사',1,P.x+1,P.y);return{s:g('산적'),b:g('흑풍채주'),j:g('혈교장로'),w:g('늑대'),f:{art:f.art,ok:!!ARTS[f.art],known:f.known,n:Object.values(f.eq).filter(Boolean).length,sect:f.sect}}});
  ok(`산적 ${k.s.art}(초식 ${k.s.known}, ${k.s.w}) · 흑풍채주 ${k.b.art}(${k.b.known}, ${k.b.w}) · 혈교장로 ${k.j.art}(${k.j.known}) · 늑대 없음`,
    k.s.art==='사검3'&&k.s.known===1&&k.s.w==='검'&&k.b.art.startsWith('사도')&&k.b.known>=2&&k.b.n>=2&&k.j.known===5&&!k.w.art&&!k.w.n);
  ok(`문파 무인은 제 문파 무공을 쓴다: ${k.f.sect} ${k.f.art} (초식 ${k.f.known}, 장비 ${k.f.n})`,k.f.ok&&k.f.known>=1&&k.f.n>=1);
  // 2. 표적 줄에 무공·병기가 보인다
  const lb=await p.evaluate(()=>{const e=mkMob('흑풍채주',P.x+1,P.y);return mobKitLabel(e)});
  ok(`표적 줄: ${lb}`,/도법|도결|도$/.test(lb.split(' · ')[0])||lb.includes(' · '));
  // 3. 은자는 바닥에 떨어지지 않고 바로 들어오고, 비급·장비는 그 적의 것이다
  const r=await p.evaluate(()=>{mobs=[];drops=[];const s0=P.silver;let books=0,gear=0,bad=0;
    for(let i=0;i<300;i++){const e=mkMob('산적',P.x+1.5,P.y+.5);mobs.push(e);e.hp=0;onKill(e);
      for(const d of drops){const it=d.it.item;if(!it)continue;if(it.slot==='book'){books++;if(it.art!==e.art||it.form>=e.known)bad++}else if(it.slot!=='sbook'){gear++;if(!Object.values(e.eq).includes(it))bad++}}
      if(drops.some(d=>d.it.silver))bad+=100;drops=[]}
    return{gain:P.silver-s0,books,gear,bad}});
  ok(`산적 300명: 은자 +${r.gain} 바로 획득, 비급 ${r.books}개, 장비 ${r.gear}개, 엉뚱한 것 ${r.bad}`,r.gain>300&&r.books>5&&r.gear>5&&r.bad===0);
  // 4. 보스는 비급을 꼭 떨어뜨리고, 무공은 제 것이다
  const bs=await p.evaluate(()=>{mobs=[];drops=[];const e=mkMob('흑풍채주',P.x+1,P.y);mobs.push(e);e.hp=0;onKill(e);
    const bk=drops.filter(d=>d.it.item&&d.it.item.slot==='book');return{n:bk.length,ok:bk.every(d=>d.it.item.art===e.art),names:bk.map(d=>d.it.item.name)}});
  ok(`흑풍채주 비급 ${bs.n}개: ${bs.names.join(', ')}`,bs.n>=1&&bs.ok);
  // 5. 몹끼리 싸워 죽어도 은자 주머니가 떨어지지 않는다
  const mm=await p.evaluate(()=>{mobs=[];drops=[];for(let i=0;i<40;i++){const a=mkFac('정',0,P.x+1,P.y),t=mkFac('사',0,P.x+2,P.y);mobs.push(a,t);mobHurt(t,99999,a)}return drops.length});
  ok(`몹끼리 40번 죽여도 바닥 전리품 ${mm}개`,mm===0);
  // 6. 정예·보스가 큰 기술을 쓰면 초식 이름을 외친다
  await p.evaluate(()=>{mobs=[];drops=[];texts=[];loadRegion('sungsan');P.x=8.5;P.y=19.5;P.hp=P.maxHp=99999;const e=mkMob('흑풍채주',P.x+1.5,P.y);mobs.push(e);e.aggro=true;e.tgt=P;e.skT=.1;window._e=e});
  let call=null;for(let i=0;i<30&&!call;i++){await p.waitForTimeout(100);call=await p.evaluate(()=>{const t=texts.find(t=>t.call&&t.t.includes(ARTS[window._e.art].n));return t&&t.t})}
  ok(`초식 외침: ${call}`,!!call);
  await p.evaluate(()=>{P.hp=P.maxHp=130;mobs=[];loadRegion('gaebong')});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

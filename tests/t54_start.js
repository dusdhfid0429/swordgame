// 경공 특징 + 문파 입문공 세트 (2026-10-13, v86): 경공별 특징 데이터·적용(절감·비거리·질주·무흔·진각·연타), 가입하면 주력 무기 무공 + 보법 + 경공 + 심법 한 묶음
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing&&hero2Ok());await p.waitForTimeout(300);
  // 1. 데이터: 경공마다 특징이 있고 종류가 GG_TK에 있다. 문파마다 START가 있고 그 무공은 그 문파의 고급 아닌 무공, 보법·경공·심법이 실제로 있다
  const d=await p.evaluate(()=>{const bad=[];for(const[id,g]of Object.entries(GGS)){if(id!=='g_basic'&&!(g.tr&&g.tr.length))bad.push(id+' 특징 없음');for(const t of g.tr||[])if(!GG_TK[t.k])bad.push(id+' '+t.k)}
    let n=0;for(const s of Object.values(SECTS)){const st=START[s.id];if(!st){bad.push(s.id+' START 없음');continue}n++;const a=s.arts.find(a=>a.n===st.art);if(!a||a.hi)bad.push(s.id+' 무공 '+st.art);if(a&&a.cls!==st.w)bad.push(s.id+' 무기 '+st.w);
      if(!BOBS[st.bob]||BOBS[st.bob].g!==1)bad.push(s.id+' 보법 '+st.bob);if(!GGS[st.gg]||GGS[st.gg].g!==1)bad.push(s.id+' 경공 '+st.gg);if(!SIM['N_'+s.id+'_1'])bad.push(s.id+' 심법');
      const k=startSet(s);if(k.art.id!==a.id||ARTS[k.art.id].grade!==sectGrade(s,0))bad.push(s.id+' 등급')}
    return{n,bad}});
  ok(`데이터: 경공 특징 모두 있음, 입문공 세트 ${d.n}문파 (${d.bad.join(', ')||'문제 없음'})`,d.n===51&&!d.bad.length);
  // 2. 절감: 청풍답월은 내공 25% 덜 든다 (12 → 9). 비거리: 제운종은 15% 더 멀리
  const r2=await p.evaluate(()=>{mobs=[];P.gk.g_cheongpung=1;P.gkcur='g_cheongpung';P.qi=P.maxQi;const q0=P.qi;leap();const a=q0-P.qi,q9=ggQi(1);P.leap=null;P.ggc=null;
    P.gkcur='g_basic';P.qi=P.maxQi;const x0=P.x,y0=P.y;P.fx=0;P.fy=1;leap();const d0=Math.hypot(P.leap.ex-x0,P.leap.ey-y0);P.leap=null;P.ggc=null;
    P.gk.g_jeun=1;P.gkcur='g_jeun';P.qi=P.maxQi;leap();const d1=Math.hypot(P.leap.ex-x0,P.leap.ey-y0);P.leap=null;P.ggc=null;return{a,q9,d0,d1,r:d1/d0,m:ggLenMul()}});
  ok(`청풍답월 내공 ${r2.a} (ggQi ${r2.q9}), 제운종 비거리 ${r2.d0.toFixed(1)}→${r2.d1.toFixed(1)} (${r2.m}배)`,r2.a===9&&r2.q9===9&&r2.m===1.15*1&&r2.d1>r2.d0*1.3);
  // 3. 질주: 천리신행으로 내려서면 3초 동안 이동속도 +45%
  const r3=await p.evaluate(()=>{P.gk.g_cheolli=1;P.gkcur='g_cheolli';P.qi=P.maxQi;const s0=moveSpd();leap();return{s0,st:P.leap&&P.leap.st}});
  await p.waitForFunction(()=>!P.leap);
  const r3b=await p.evaluate(()=>({s1:moveSpd(),on:!!(P.ggSpd&&time<P.ggSpd.until),v:P.ggSpd&&P.ggSpd.v,s0:moveSpd()/ggSpdMul()}));
  ok(`천리신행 착지 후 질주: ${r3.s0.toFixed(2)} → ${r3b.s1.toFixed(2)} (+${r3b.v}%)`,r3b.on&&r3b.v===45&&Math.abs(r3b.s1/r3b.s0-1.45)<.01);
  // 4. 무흔: 답설무흔으로 내려서면 쫓던 적이 나를 놓친다. 진각: 제운종으로 내려서면 둘레의 적이 피해를 입는다
  const r4=await p.evaluate(()=>{P.ggSpd=null;P.gk.g_dapseol=1;P.gkcur='g_dapseol';P.qi=P.maxQi;const w=mkMob('늑대',P.x+2,P.y);w.aggro=true;w.tgt=P;mobs.push(w);window._w=w;leap();return P.leap&&P.leap.st});
  await p.waitForFunction(()=>!P.leap);
  const r4b=await p.evaluate(()=>({ag:_w.aggro,gu:_w.lost-time,inv:P.inv}));
  ok(`답설무흔 착지: 늑대가 놓침(aggro ${r4b.ag}, ${r4b.gu.toFixed(1)}초), 무적 연장 ${r4b.inv.toFixed(2)}`,r4b.ag===false&&r4b.gu>2.5&&r4b.inv>.3);
  const r5=await p.evaluate(()=>{mobs=[];P.gk.g_jeun=1;P.gkcur='g_jeun';P.qi=P.maxQi;P.fx=0;P.fy=1;leap();const L=P.leap;const w=mkMob('늑대',L.ex+.5,L.ey);mobs.push(w);window._w=w;window._h=w.hp;return 1});
  await p.waitForFunction(()=>!P.leap);
  const r5b=await p.evaluate(()=>({hp:_h-_w.hp,kb:!!_w.kb}));
  ok(`제운종 진각: 착지 둘레 늑대 피해 ${r5b.hp}, 밀침 ${r5b.kb}`,r5b.hp>0&&r5b.kb);
  // 5. 연타: 연운보는 이어 뛰기 여유 +1초, 숙련 1.5배
  const r6=await p.evaluate(()=>{mobs=[];P.gk.g_yeonun=1;P.gkcur='g_yeonun';P.ggm.g_yeonun=0;P.qi=P.maxQi;leap();return{win:P.ggc.until-time-P.leap.dur,m:ggMast()}});
  ok(`연운보: 이어 뛰기 여유 ${r6.win.toFixed(1)}초, 1단 한 번에 숙련 ${r6.m}`,Math.abs(r6.win-1.5)<.05&&r6.m===1.5);
  // 6. 무공창 경공 카드에 특징 글
  const r7=await p.evaluate(()=>{P.gkcur='g_basic';openPanel('arts');return $('wbody').textContent});
  ok('무공창 경공 카드에 특징 설명',r7.includes('연타')&&r7.includes('이어 뛰기 여유')&&r7.includes('내공 소모 -25%'));
  // 7. 가입: 화산파 본산 장문인 앞에서 가입하면 매화검법 첫 초식 + 섬전보 + 청풍답월 + 자하심법. 고급 무공은 안 받는다
  await p.evaluate(()=>{closePanels();P.gk={g_basic:1};P.gkcur='g_basic';P.bob={b_basic:1};P.bcur='b_basic';P.age=17;P.fame=0;P.evil=0;loadRegion('hq_hwasan');openNpc(hqNpc('hq_hwasan'))});await p.waitForTimeout(200);
  const t0=await p.evaluate(()=>$('wbody').textContent);
  ok('가입 창에 입문공 세트 안내',t0.includes('입문공 세트')&&t0.includes('매화검법')&&t0.includes('섬전보')&&t0.includes('청풍답월')&&t0.includes('자하심법')&&t0.includes('공적으로 받는다'));
  await p.click('[data-act="sjoin:hwasan"]');await p.waitForTimeout(250);
  const j=await p.evaluate(()=>{const s=SECTS.hwasan,hi=s.arts.find(a=>a.hi),k=startSet(s);return{sect:P.sect,w:k.w,art:k.art.n,f:P.arts[k.art.id]&&P.arts[k.art.id].f.filter(Boolean).length,hi:!!P.arts[hi.id],bob:P.bob.b_seom,bcur:P.bcur,gg:P.gk.g_cheongpung,gkcur:P.gkcur,sim:P.sim,known:simKnown('N_hwasan_1'),wpn:P.eq.weapon&&P.eq.weapon.cls}});
  ok(`화산파 가입: 주력 ${j.w} [${j.art}] 초식 ${j.f}개, 섬전보 ${j.bob}, 청풍답월 ${j.gg}, 심법 ${j.sim}, 고급 무공 ${j.hi?'받음':'안 받음'}`,j.sect==='hwasan'&&j.w==='검'&&j.art==='매화검법'&&j.f===1&&!j.hi&&j.bob===1&&j.bcur==='b_seom'&&j.gg===1&&j.gkcur==='g_cheongpung'&&j.sim==='N_hwasan_1'&&j.known&&j.wpn==='검');
  // 8. 권 문파(소림)는 수련용 병기를 안 주고, 도 문파(팽가)는 박도를 준다
  const r8=await p.evaluate(()=>{P.sect=null;P.arts={};P.bag=[];const got=giveStartSet(SECTS.paeng);const w=P.bag.find(it=>it.slot==='weapon');P.bag=[];P.sect=null;const got2=giveStartSet(SECTS.shaolin);return{got,w:w&&w.cls,n2:P.bag.filter(it=>it.slot==='weapon').length,got2}});
  ok(`팽가 입문공 ${r8.got.join('·')} (병기 ${r8.w}), 소림 입문공 ${r8.got2.join('·')} (병기 ${r8.n2}개)`,r8.w==='도'&&r8.got.some(n=>n.startsWith('오호단문도'))&&r8.n2===0&&r8.got2.some(n=>n.startsWith('나한권')));
  ok('오류 없음: '+errs.join(' | ').slice(0,200),errs.length===0);
  await b.close();
})();

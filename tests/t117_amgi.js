// 암기술 계열 (v181, 사용자 2026-10-26 "암기술 무공도 추가, 사천당가 같은 독과 암기 문파"): 일곱 번째 병기 계열 '암'
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  // 1. 데이터: 계열·기본 무공·문파 무공
  const d=await p.evaluate(()=>{const am=Object.values(ARTS).filter(a=>a.cls==='암');
    return{cls:CLS.includes('암'),basic:['정','사'].map(s=>ELS.map((e,i)=>ARTS[s+'암'+i]&&ARTS[s+'암'+i].cls).join('')).join('|'),
      dang:SECTS.dang.arts.filter(a=>a.cls==='암').map(a=>a.n),start:startSet(SECTS.dang).w,moved:['S_haomun_1','S_janggang_1'].map(k=>ARTS[k].cls).join(''),
      pj:[...new Set(am.flatMap(a=>a.forms.map(f=>f.pj).filter(Boolean)))].sort().join(','),psn:am.some(a=>a.forms.some(f=>f.psn)),
      w:mkWeapon('암',1,0).name,smith:SHOP.smith.some(r=>r[0]==='weapon:암'),bow:SECTS.jegal.arts.filter(a=>a.cls==='궁').length}});
  ok(`일곱 번째 계열 암기 (${d.cls})`,d.cls);
  ok(`정·사 기본 암기 무공 다섯씩 (${d.basic})`,d.basic==='암암암암암|암암암암암');
  ok(`사천당가 암기 무공 ${d.dang.join('·')}, 입문 병기 ${d.start}`,d.dang.length===2&&d.dang.includes('만천화우')&&d.start==='암');
  ok(`하오비도·수전비도도 암기 (${d.moved}), 제갈세가 궁술은 그대로 (${d.bow})`,d.moved==='암암'&&d.bow===2);
  ok(`날아가는 모양 셋 (${d.pj}), 독침 있음`,d.pj==='blade,needle,star'&&d.psn);
  ok(`병기 ${d.w}, 대장간에서 판다`,d.w==='유엽비도'&&d.smith);
  // 2. 싸움: 유엽비도를 차고 암기 무공 기본 공격은 비도가 날아가고, 독침은 중독시킨다
  const f=await p.evaluate(()=>{const id='사암1',a=ARTS[id];P.eq.weapon=mkWeapon('암',1,0);P.arts[id]={p:100,f:a.forms.map(()=>true)};P.cur=id;recalc();
    const e=mkMob('산적',P.x+2,P.y);e.hp=e.maxHp=99999;mobs.push(e);P.target=e;projs=[];P.bcd=P.gcd=0;basicStrike(e);const k0=projs.map(q=>q.kind).join(',');
    projs=[];const X=mkX(id);exec({p:'proj',cnt:1,spd:19,len:7,m:.8,pj:'needle',psn:4},e,X);const q=projs[0];face(e.x,e.y);
    for(let i=0;i<40&&projs.length;i++)updateProjs(1/60);return{k0,kind:q&&q.kind,psn:e.psn,reach:autoReach(),hero:heroCls(),...(heroAtk('flat'),{ssh:P.ssh,set:(P.sset||[]).length})}});
  ok(`기본 공격은 비도 (${f.k0})`,f.k0==='blade');
  ok(`독침은 비침 모양이고 맞으면 중독 (${f.kind}, 중독 ${f.psn&&f.psn.toFixed(1)}초)`,f.kind==='needle'&&f.psn>3);
  ok(`자동 초식 사거리는 암기 사거리 (${f.reach})`,f.reach===4.5);
  ok(`몸 동작은 검 없는 검객 공격 (${f.hero}, ${f.ssh}, ${f.set})`,f.hero==='암'&&f.ssh==='act'&&f.set>0);
  // 3. 옛 저장: 활 계열이던 당가비전암기를 익혔으면 유엽비도를 받는다
  const s=await p.evaluate(()=>{const m=migrateSave({v:6,G:{},P:{arts:{S_dang_0:{p:10,f:[true]}}}});return{v:m.v,gift:m.P.amgiGift,note:(m.notes||[]).join('')}});
  ok(`옛 저장 옮기기: 유엽비도 지급 표시 (${s.note})`,s.gift===1&&/암기술/.test(s.note));
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

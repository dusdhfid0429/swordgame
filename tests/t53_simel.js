// 오행·음양·뇌기는 운용 중인 심법의 것, 이펙트 색은 심법 계열 (사용자 요청 2026-10-13). 무공 표시에서 오행은 빠지고 상극 우선순위는 유지
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 모든 심법에 계열과 속성, 무공의 색·입자·뇌기는 getter (저장에 안 실림)
  const t=await p.evaluate(()=>{const all=Object.values(SIM),bad=all.filter(x=>!x.sc||!EL[x.el]).map(x=>x.id);const a=ARTS[P.cur];
    return{n:all.length,bad,base:SIM['N_base_정'].sc+SIM['N_base_정'].el,shop:SIM['N_shop_사'].sc+SIM['N_shop_사'].el,sl:SIM.N_shaolin_1.sc+SIM.N_shaolin_1.el,cm:SIM.N_cheonma_4.sc+SIM.N_cheonma_4.el,
      json:JSON.stringify(a).includes('"c"'),c:a.c,el:pEl(),beats:[elMul('양','음'),elMul('음','뇌'),elMul('뇌','양'),elMul('양','뇌'),elMul('화','금'),elMul('금','화')]}});
  console.log(JSON.stringify(t));
  ok(`심법 ${t.n}개 모두 계열·속성(없는 것 ${t.bad.length}) · 타고난 ${t.base} 잡화점 사 ${t.shop} 소림 ${t.sl} 천마 ${t.cm} · 색 getter(JSON에 없음 ${!t.json}) · 상극 ${t.beats.join(',')}`,
    t.bad.length===0&&t.base==='불가금'&&t.shop==='사공수'&&t.sl==='불가금'&&t.cm==='마공뇌'&&!t.json&&t.c==='255,214,120'&&t.el==='금'&&t.beats.join()==='1.3,1.3,1.3,0.8,1.3,0.8');
  // 2. 심법을 바꾸면 같은 무공의 색·속성·뇌기가 바뀐다 (무당 양=도가 파랑, 천마 뇌=마공 보라+뇌기)
  const sw=await p.evaluate(()=>{P.sims={N_mudang_2:1,N_cheonma_4:1,N_hwasan_1:1};const a=ARTS[P.cur],o={};P.sim='N_mudang_2';o.mu=[a.c,pEl(),a.elc,a.pt];P.sim='N_cheonma_4';o.cm=[a.c,pEl(),a.elc];
    P.sim='N_hwasan_1';o.hw=[a.c,pEl(),SCHOOL_FX[simSchoolOf('hwasan')]];const s=ARTS[SECTS.shaolin.arts[0].id];o.other=[s.c,artEl(s)];return o});
  ok(`무당 ${sw.mu.join('/')} · 천마 ${sw.cm.join('/')} · 화산 ${sw.hw.join('/')} · 남의 소림 무공은 소림 심법 색 ${sw.other.join('/')}`,
    sw.mu[0]==='150,220,255'&&sw.mu[1]==='양'&&sw.mu[2]===false&&sw.cm[0]==='190,70,255'&&sw.cm[1]==='뇌'&&sw.cm[2]===true&&sw.hw[0]===sw.hw[2]&&sw.hw[1]==='화'&&sw.other[0]==='255,214,120'&&sw.other[1]==='금');
  // 3. 적중 효과는 심법 속성: 무당(양)이면 화상+밀침, 천마(뇌)면 방어 무시, 화산(화)이면 화상, 금(기초)이면 치명타 가산
  const h=await p.evaluate(()=>{const mk=()=>({x:P.x+1,y:P.y,hp:5000,maxHp:5000,def:30,hm:0,el:null,burn:0,slow:0,d:{},isMob:true});const X=mkX(P.cur);window._rnd=Math.random;Math.random=()=>.5;
    const o={};P.sim='N_mudang_2';let e=mk();hitE(X,e,1,0,0);o.yang=[e.burn,!!e.kb,5000-e.hp];P.sim='N_cheonma_4';e=mk();hitE(X,e,1,0,0);o.noe=5000-e.hp;P.sim=null;e=mk();hitE(X,e,1,0,0);o.geum=5000-e.hp;
    P.sim='N_hwasan_1';e=mk();hitE(X,e,1,0,0);o.hwa=[e.burn,5000-e.hp];Math.random=window._rnd;return o});
  ok(`양: 화상 ${h.yang[0]} 밀침 ${h.yang[1]} 피해 ${h.yang[2]} · 뇌(방어 무시) ${h.noe} · 금(방어 무시) ${h.geum} · 화: 화상 ${h.hwa[0]} 피해 ${h.hwa[1]}(방어 30 적용)`,
    h.yang[0]===3&&h.yang[1]&&h.noe>h.hwa[1]+20&&h.geum>h.hwa[1]+20&&h.hwa[0]===3);
  // 4. 무공 창·문파 창에 오행 표시가 없고, 심법 창에는 계열·속성이 보인다
  const v=await p.evaluate(()=>{P.sim='N_mudang_2';closePanels();openPanel('arts');const w=$('win').innerText;closePanels();sectView='mudang';const s=allianceDlg('jeong');
    return{noEl:!/오행 [화수목금토]/.test(w)&&!/검법 · [화수목금토]/.test(w)&&!/권법 · [화수목금토]/.test(w),sim:w.includes('도가')&&w.includes('열양'),sect:!/오행/.test(s)}});
  ok(`무공 창 오행 표시 없음 ${v.noEl} · 심법 카드에 계열·속성 ${v.sim} · 문파 창 오행 없음 ${v.sect}`,v.noEl&&v.sim&&v.sect);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

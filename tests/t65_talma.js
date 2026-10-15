// 탈마·사공 한계 (2026-10-15 v105): 마공 화경·현경 = 극마·탈마. 탈마(현경)는 장로 이상 + 마성 20 미만 1년 유지 + 천마동 폐관. 탈마면 마성이 안 오르고 깨달음 ×1.
// 사공은 일류까지 수련 내공 +30%, 초절정부터 -30%(대문파 상승 심법 -15%), 초절정 이후 벽 -20%. 사파도 정종 잡화점 심법을 산다.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 경지 이름과 마성 단계 이름
  const n=await p.evaluate(()=>{const o={};P.sect='cheonma';P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.realm=5;o.r5=realmName();P.realm=6;o.r6=realmName();P.realm=0;o.tier=MARA_N.join('·');return o});
  ok(`마공 경지 ${n.r5}/${n.r6} · 마성 단계 ${n.tier}`,n.r5==='극마'&&n.r6==='탈마'&&n.tier==='평정·입마·심마·광마');
  // 2. 탈마 조건: 마성 20 미만 유지 기간, 장로, 천마동
  const c=await p.evaluate(()=>{const o={};P.realm=5;P.mara=50;P.maraLow=null;update(.1);o.high=P.maraLow==null;P.mara=10;update(.1);o.low=P.maraLow!=null;
    P.mtot={};o.w1=talmaWhy(6);P.mtot={cheonma:1e6};o.w2=talmaWhy(6);P.maraLow=G.cal-1.5;o.w3=talmaWhy(6);o.reg0=REG;
    loadRegion('hq_cheonma_8');o.reg=REG;o.w4=talmaWhy(6);o.b0=talmaBonus(6);P.maraLow=G.cal-3.2;o.b1=Math.round(talmaBonus(6)*100);o.b2=Math.round(talmaBonus(5)*100);P.mara=30;update(.1);o.reset=P.maraLow==null;return o});
  ok(`유지 추적: 마성 50 → 없음 ${c.high}, 10 → 시작 ${c.low}, 30 → 지움 ${c.reset} · 조건: "${c.w1}" / "${c.w2}" / "${c.w3}" / 천마동(${c.reg}) "${c.w4}" · 보너스 1.5년 ${c.b0} 3.2년 +${c.b1}% (화경 벽 ${c.b2})`,
    c.high&&c.low&&c.reset&&c.w1.includes('장로')&&c.w2.includes('유지')&&c.w3.includes('천마동')&&c.reg==='hq_cheonma_8'&&c.w4===''&&c.b0===0&&c.b1===10&&c.b2===0);
  // 3. 탈마 효과: 마성이 안 오르고, 공격 +8%만, 깨달음 ×1. 폐관 실패면 마성 60·유지 초기화
  const e=await p.evaluate(()=>{const o={};const R=Math.random;Math.random=()=>.5;const mk=()=>{const m=mkMob('늑대',P.x+1,P.y);m.def=0;m.hp=m.maxHp=5000;mobs.push(m);return m};
    const X={art:ARTS[P.cur],key:null,t:0,mul:1,combo:1};const hit=()=>{const m=mk();hitE(X,m,1,0,0);const d=5000-m.hp;mobs=[];return d};
    P.realm=5;P.mara=0;o.d5=hit();P.realm=6;talmaGain(6);o.tal=isTalma();o.d6=hit();maraAdd(30,'t');o.mara=P.mara;o.tier=maraTier();o.enl=enlMul();P.enl=0;gainEnl(1,'t');o.gain=P.enl;hud();o.hud=$('mat').textContent;
    P.realm=5;P.mara=10;P.maraLow=G.cal-2;talmaFail(6);o.fail=P.mara;o.fl=P.maraLow==null;Math.random=R;P.target=null;return o});
  ok(`탈마 ${e.tal}: 공격 ${e.d5} → ${e.d6} · 마성 +30 → ${e.mara}, 단계 ${e.tier}, 깨달음 ×${e.enl} (1 → ${e.gain}) · HUD "${e.hud}" · 폐관 실패 → 마성 ${e.fail}, 유지 지움 ${e.fl}`,
    e.tal&&e.d6>e.d5*1.05&&e.d6<e.d5*1.12&&e.mara===0&&e.tier===0&&e.enl===1&&e.gain===1&&e.hud.startsWith('탈마')&&e.fail===60&&e.fl);
  // 4. 사공 한계: 일류 +30%, 초절정 -30%, 대문파 상승 심법 -15%, 벽 -5%/-20%
  const s=await p.evaluate(()=>{const o={};loadRegion('gaebong');P.sect=null;P.mtot={};P.sims={N_shop_사:1};P.sim='N_shop_사';P.realm=2;P.qiX=0;const g=qiGain();qiTrained();o.lo=Math.round(P.qiX/g*100);
    P.realm=4;P.qiX=0;qiTrained();o.hi=Math.round(P.qiX/g*100);o.pg3=pgSchoolAdj(3);o.pg4=pgSchoolAdj(4);
    const big=Object.values(SECTS).find(x=>x.tier==='big'&&simSchoolOf(x.id)==='사공'),sim=big&&Object.values(SIM).find(x=>x.sect===big.id&&x.g>=2);o.big=big&&big.n;
    if(sim){P.sims[sim.id]=1;P.sim=sim.id;o.bq=qiWallMul('사공');o.bpg=pgSchoolAdj(4)}
    P.sims={N_shop_정:1};P.sim='N_shop_정';o.jq=qiWallMul('정종');o.jpg=pgSchoolAdj(4);P.sims={N_shop_사:1};P.sim='N_shop_사';return o});
  ok(`사공 수련 내공 일류 ${s.lo}% 초절정 ${s.hi}% · 벽 절정 ${s.pg3} 초절정 ${s.pg4} · ${s.big} 상승 심법 ${s.bq}/${s.bpg} · 정종 ${s.jq}/${s.jpg}`,
    s.lo===30&&s.hi===-30&&s.pg3===-.05&&s.pg4===-.2&&s.bq===-.15&&s.bpg===-.1&&s.jq===0&&s.jpg===0);
  // 5. 사파도 정종 잡화점 심법(소주천심법)을 산다. 정파는 사공 심법을 못 산다
  const sh=await p.evaluate(()=>{const o={};P.silver=9999;o.saJ=simBlock(SIM.N_shop_정);o.html=simShopHtml();o.both=o.html.includes(SIM.N_shop_정.n)&&o.html.includes(SIM.N_shop_사.n);
    sectAct('simshop','N_shop_정');o.learned=!!P.sims.N_shop_정&&P.sim==='N_shop_정';P.side='정';P.sims={};o.jS=simBlock(SIM.N_shop_사);P.side='사';return o});
  ok(`사파 → 정종 심법 "${sh.saJ}" 목록 둘 다 ${sh.both} 구입 ${sh.learned} · 정파 → 사공 심법 "${sh.jS}"`,sh.saJ===''&&sh.both&&sh.learned&&sh.jS==='성향이 다르다');
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

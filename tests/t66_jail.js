// 흑혈옥 (2026-10-15 v106): 죄값(같은 편 살해 +10, 추살조 도망 +5, 해마다 -5), 30이면 마교 땅에서 연행 → 흑혈옥, 출구 차단, 복역으로 형기 소화(직위 강등), 탈옥(옥주)은 배교
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 죄값: 마교도가 아니면 안 쌓인다. 같은 편 마교도 살해 +10 (3번 → 30), 추살조에게서 달아남 +5, 해마다 -5
  const a=await p.evaluate(()=>{const o={};const kill=()=>{const e=mkFac('마',0,P.x+1,P.y,'cheonma');mobs.push(e);e.hp=1;toggleForce(true);damage(e,5,0,0,P);toggleForce(false);mobs=[]};
    kill();o.noMg=(P.sin||0)===0;P.sect='cheonma';P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.mtot={cheonma:1e6};P.sin=0;P.evil=0;kill();o.one=P.sin;kill();kill();o.three=P.sin;o.due=jailDue();
    P.sin=0;const h=mkFac('정',0,P.x+3,P.y);h.hunt=1;mobs.push(h);runHooks('travel',{g:null});o.flee=P.sin;mobs=[];P.sin=12;runHooks('newYear');o.year=P.sin;P.sin=0;P.target=null;return o});
  ok(`죄값: 비마교도 ${a.noMg} · 같은 편 살해 ${a.one} → 3번 ${a.three} (연행 대상 ${a.due}) · 추살조 도망 +${a.flee} · 한 해 뒤 12 → ${a.year}`,a.noMg&&a.one===10&&a.three===30&&a.due&&a.flee===5&&a.year===7);
  // 2. 연행: 죄값 30으로 마교 땅에 들어서면 흑혈옥(형기 3년). 출구는 막힌다. 옥주·수감자 대화
  const j=await p.evaluate(async()=>{const o={};P.sin=30;loadRegion('hq_cheonma_3');P.reg='hq_cheonma_3';runHooks('regionLoaded','hq_cheonma_3');await new Promise(r=>setTimeout(r,900));
    o.reg=REG;o.jail=P.jail&&P.jail.t;o.gate=REGION().gates.find(g=>g.to==='hq_cheonma_8');o.need=o.gate&&o.gate.need();o.jailer=!!npcsHere().find(n=>n.jailer);
    openNpc(npcsHere().find(n=>n.jailer));o.dlg=$('win').innerText;o.btns=!!document.querySelector('[data-act="jserve"]')&&!!document.querySelector('[data-act="jbreak"]');closePanels();
    openNpc(npcsHere().find(n=>n.prisoner));o.pr=$('win').innerText.includes('사면');closePanels();openPanel('char');o.card=$('win').innerText.includes('흑혈옥 수감');closePanels();
    P.mara=20;P.medit=true;mobs=[];for(let i=0;i<10;i++)update(.1);o.medit=P.mara;P.medit=false;return o});
  ok(`연행: ${j.reg} 형기 ${j.jail}년 · 출구 "${j.need}" · 옥주 ${j.jailer} 단추 ${j.btns} · 수감자 ${j.pr} · 인물창 ${j.card} · 옥 안 운기 1초 마성 20 → ${j.medit.toFixed(1)}`,
    j.reg==='hq_cheonma_9'&&j.jail===3&&typeof j.need==='string'&&j.need.includes('옥주')&&j.jailer&&j.btns&&j.pr&&j.card&&j.medit<17.7&&j.medit>17.3);
  // 3. 복역: 3년이 지나고 죄값 0, 직위 한 단계 강등, 천마동으로 나온다
  const s=await p.evaluate(()=>{const o={};const age=Math.floor(P.age),r0=rankIdx('cheonma');sectAct('jserve');o.age=Math.floor(P.age)-age;o.jail=!P.jail;o.sin=P.sin;o.rank=r0-rankIdx('cheonma');o.reg=REG;return o});
  ok(`복역: ${s.age}년 지남, 출옥 ${s.jail}, 죄값 ${s.sin}, 직위 -${s.rank}, ${s.reg}`,s.age===3&&s.jail&&s.sin===0&&s.rank===1&&s.reg==='hq_cheonma_8');
  // 4. 탈옥: 옥주를 쓰러뜨리면 배교(하산, 죄값 50, 추살). 연행조에게 제압당하면 흑혈옥
  const e=await p.evaluate(async()=>{const o={};P.mtot={cheonma:1e6};P.sin=30;jailEnter('t');o.in=REG==='hq_cheonma_9'&&!!P.jail;sectAct('jbreak');const w=mobs.find(m=>m.jailer);o.boss=!!w&&!peaceful(w);
    w.hp=1;toggleForce(true);damage(w,5,0,0,P);toggleForce(false);o.out=!P.jail;o.sect=P.sect;o.sin=P.sin;o.esc=!!P.escaped;o.gate=REGION().gates.find(g=>g.to==='hq_cheonma_8').need();mobs=[];
    // 연행조
    P.sect='cheonma';P.escaped=0;P.sin=30;loadRegion('gaebong');P.reg='gaebong';o.sq=arrestSquad();o.n=mobs.filter(m=>m.arrest).length;o.foe=mobs.filter(m=>m.arrest).every(m=>!peaceful(m));
    const m=mobs.find(x=>x.arrest);P.hp=5;P.inv=0;hurtP(9999,m);o.alive=playing&&P.hp>0;await new Promise(r=>setTimeout(r,200));o.jailed=REG==='hq_cheonma_9'&&!!P.jail;mobs=[];P.target=null;return o});
  ok(`탈옥: 수감 ${e.in} 옥주 적 ${e.boss} → 출옥 ${e.out} 하산 ${e.sect===null} 죄값 ${e.sin} 배교자 ${e.esc} 출구 ${e.gate===null} · 연행조 ${e.sq} ${e.n}명 적 ${e.foe} 제압당해 생존 ${e.alive} 수감 ${e.jailed}`,
    e.in&&e.boss&&e.out&&e.sect===null&&e.sin===50&&e.esc&&e.gate===null&&e.sq&&e.n===4&&e.foe&&e.alive&&e.jailed);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

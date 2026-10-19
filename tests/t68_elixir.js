// 마교 영약 (2026-10-15 v106): 정혈 드롭(마공 운용 중 정·사 무인), 혈마단(공격 +30% → 끝나면 둔화)·흡정환(정혈+수련 5회분)·천마혈정(치명타 버팀+폭주), 4번째 복용 중독·갈증, 탈마면 마성 무시
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{GD.RANK_CAP.plus=9});   // v153 직위 상한(경지+1)은 t91에서 본다. 여기서는 공적만으로 직위를 본다
  // 1. 정혈: 마공 아닐 땐 안 떨어지고, 마공 운용 중 정파 무인을 죽이면 떨어진다. 양민은 안 나온다
  const d=await p.evaluate(()=>{const o={};const R=Math.random;Math.random=()=>.1;const kill=()=>{drops=[];const e=mkFac('정',0,P.x+1,P.y);mobs.push(e);e.hp=1;damage(e,5,0,0,P);mobs=[];return drops.filter(x=>x.it&&x.it.mat==='정혈').length};
    o.noMa=kill();P.sect='cheonma';P.sims={N_cheonma_1:1};P.sim='N_cheonma_1';P.mtot={cheonma:1e6};o.ma=kill();
    drops=[];const v=mkMob('양민',P.x+1,P.y);mobs.push(v);v.hp=1;damage(v,5,0,0,P);o.vil=drops.filter(x=>x.it&&x.it.mat==='정혈').length;mobs=[];drops=[];Math.random=R;P.target=null;return o});
  ok(`정혈 드롭: 마공 아님 ${d.noMa} · 마공 ${d.ma} · 양민 ${d.vil}`,d.noMa===0&&d.ma===1&&d.vil===0);
  // 2. 받기: 혈마당(공적+정혈), 암혈당, 교주(천마혈정, 장로·공적 100)
  const g=await p.evaluate(()=>{const o={};P.merit.cheonma=200;P.mats.정혈=5;o.w0=elixirWhy('혈마단');o.g1=elixirGet('혈마단');o.m=P.merit.cheonma;o.bl=P.mats.정혈;o.g2=elixirGet('흡정환');o.g3=elixirGet('천마혈정');o.m2=P.merit.cheonma;
    openNpc({id:'dang_hyeolma',dang:'hyeolma',n:'혈마당주',x:0,y:0});o.dlg=$('win').innerText.includes('혈마단');closePanels();openNpc(hqNpc('hq_cheonma')||{id:'x',hq:'cheonma',x:0,y:0});o.hq=$('win').innerText.includes('천마혈정');closePanels();return o});
  ok(`영약 받기 "${g.w0}" 혈마단 ${g.g1} (공적 200 → ${g.m}, 정혈 5 → ${g.bl}) 흡정환 ${g.g2} 천마혈정 ${g.g3} (공적 → ${g.m2}) · 혈마당 창 ${g.dlg} 교주 창 ${g.hq}`,
    g.w0===''&&g.g1&&g.m===185&&g.bl===2&&g.g2&&g.g3&&g.m2===75&&g.dlg&&g.hq);
  // 3. 혈마단: 공격 +30%, 마성 +25, 끝나면 둔화 30초. 마공이 아니면 못 먹는다
  const h=await p.evaluate(()=>{const o={};P.mara=0;const a0=atk();const sim=P.sim;P.sim=null;P.sims={};useCon('혈마단');o.noMa=P.mats.혈마단===1;P.sims={N_cheonma_1:1};P.sim=sim;
    useCon('혈마단');o.left=P.mats.혈마단;o.atk=atk()/a0;o.mara=P.mara;const sp0=moveSpd();P.hyeolT=.05;update(.1);o.weak=P.weakT>0&&P.buff.atkV<0;o.spd=moveSpd()/sp0;o.thirst=!!P.thirst;P.weakT=0;P.buff.atk=0;return o});
  ok(`마공 아닐 때 못 먹음 ${h.noMa} · 혈마단: 공격 ×${h.atk.toFixed(2)}, 마성 ${h.mara}, 끝난 뒤 둔화 ${h.weak} 이동 ×${h.spd.toFixed(2)}, 갈증 없음 ${!h.thirst}`,h.noMa&&h.left===0&&Math.abs(h.atk-1.3)<.03&&h.mara===25&&h.weak&&Math.abs(h.spd-.8)<.02&&!h.thirst);
  // 4. 흡정환: 정혈 1 + 수련 5회분, 마성 +15, 악업 +10. 4번째부터 중독·갈증(내공 회복 절반), 탈마면 중독 해제
  const s=await p.evaluate(()=>{const o={};P.mara=0;P.evil=0;P.qiN=0;P.qiAcc=0;P.mats.흡정환=4;P.mats.정혈=4;const q=qiRegen();useCon('흡정환');o.qiN=P.qiN;o.acc=Math.round(P.qiAcc);o.g=qiGain();o.mara=P.mara;o.evil=P.evil;o.bl=P.mats.정혈;
    useCon('흡정환');useCon('흡정환');o.noAdd=!P.addict;useCon('흡정환');o.add=!!(P.addict&&P.addict.흡정환);o.thirst=!!P.thirst;const q1=qiRegen();P.thirst=0;o.reg=q1/qiRegen();P.thirst=1;P.realm=6;talmaGain(6);o.cleared=!P.addict&&!P.thirst;P.realm=0;P.mara=0;return o});
  ok(`흡정환: 수련 ${s.qiN}회분 (내공 ${s.acc} = 5×${s.g}), 마성 ${s.mara}, 악업 ${s.evil}, 정혈 4 → ${s.bl} · 3번째까지 중독 없음 ${s.noAdd}, 4번째 중독 ${s.add} 갈증 ${s.thirst} 회복 ×${s.reg.toFixed(2)} · 탈마로 해제 ${s.cleared}`,
    s.qiN===5&&Math.abs(s.acc-5*s.g)<1&&s.mara===15&&s.evil===10&&s.bl===3&&s.noAdd&&s.add&&s.thirst&&Math.abs(s.reg-.5)<.02&&s.cleared);
  // 5. 천마혈정: 치명타를 한 번 버티고 생명 40%, 폭주. 두 번째 복용 불가
  const c=await p.evaluate(()=>{const o={};P.mara=0;P.mats.천마혈정=2;useCon('천마혈정');o.guard=!!P.chGuard;o.mara=P.mara;o.chj=!!P.chj;useCon('천마혈정');o.second=P.mats.천마혈정===1;
    const e=mkMob('늑대',P.x+1,P.y);mobs.push(e);P.hp=10;P.inv=0;toggleForce(false);hurtP(9999,e);o.alive=P.hp>0&&playing;o.hp=Math.round(P.hp/P.maxHp*100);o.burst=!!P.burst;o.used=!P.chGuard;
    for(let i=0;i<40;i++)update(.2);o.off=!P.burst;mobs=[];P.target=null;P.hp=P.maxHp;return o});
  ok(`천마혈정: 효력 ${c.guard} 마성 ${c.mara} · 두 번째 거부 ${c.second} · 치명타 뒤 생존 ${c.alive} 생명 ${c.hp}% 폭주 ${c.burst} 효력 소진 ${c.used} 끝남 ${c.off}`,c.guard&&c.mara===40&&c.chj&&c.second&&c.alive&&c.hp>=38&&c.hp<=40&&c.burst&&c.used&&c.off);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// 병기와 무공 종류: 검을 찬 채 권법을 못 쓰고, 권갑이나 맨손이면 쓴다. 다른 병기 무공도 그 병기가 있어야 한다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{
    const fist=Object.values(ARTS).find(a=>a.cls==='권'&&a.side==='정'),sw=P.cur;
    P.arts[fist.id]={p:0,f:fist.forms.map((f,i)=>i===0)};P.qi=P.maxQi=999;const e=mkMob('산적',P.x+.8,P.y);mobs.push(e);P.target=e;
    const out={w:P.eq.weapon.cls,sword:hasWeaponFor('검')};
    setArt(fist.id);out.fistWithSword=hasWeaponFor('권');out.readyWithSword=formReady(0);out.useWithSword=useForm(0,true);out.lbl=$('mst').textContent;
    out.ultWithSword=(()=>{const q=P.qi;ultimate();return P.qi<q})();
    act('uneq:weapon');out.bare=hasWeaponFor('권');out.useBare=useForm(0,true);
    P.fcd[0]=0;P.gcd=0;P.eq.weapon=mkWeapon('권',1,0);recalc();out.gauntlet=hasWeaponFor('권');out.useGauntlet=useForm(0,true);
    out.swordWithGauntlet=hasWeaponFor('검');setArt(sw);out.useSwordWithGauntlet=useForm(0,true);
    return out});
  ok(`검을 찬 채(${r.w}) 권법: 못 쓴다 (판정 ${r.fistWithSword}, 준비 ${r.readyWithSword}, 초식 ${r.useWithSword}, 필살 ${r.ultWithSword}) · 표시 "${r.lbl}"`,r.sword&&!r.fistWithSword&&!r.readyWithSword&&!r.useWithSword&&!r.ultWithSword&&r.lbl.includes('벗어야'));
  ok(`병기를 벗으면 권법을 쓴다 (${r.bare}, ${r.useBare})`,r.bare&&r.useBare);
  ok(`권갑을 차도 권법을 쓴다 (${r.gauntlet}, ${r.useGauntlet})`,r.gauntlet&&r.useGauntlet);
  ok(`권갑을 찬 채 검법은 못 쓴다 (${r.swordWithGauntlet}, ${r.useSwordWithGauntlet})`,!r.swordWithGauntlet&&!r.useSwordWithGauntlet);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

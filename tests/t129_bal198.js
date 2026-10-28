// v198 (설계 제안 2026-10-28): 졸개 생명 TIER.n.h 1.45, 보스 생명은 경지별 GROW.bs, 졸개 처치 활력 KILL_VIT.n배
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:900,height:700}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{const g=GD.GROW,mk=(boss,r)=>{const e=mkMob('산적',P.x+3,P.y);e.d={...e.d,boss:boss?1:0,elite:0};e.realm=r;scaleMob(e);mobs.splice(mobs.indexOf(e),1);return e.maxHp};
    const out={n:[],b:[],want:[]};for(let r=0;r<6;r++){const h=STD[r][1];out.n.push(mk(0,r)===Math.round(h*1.45*g.hs[r]));out.b.push(mk(1,r));out.want.push(Math.round(h*TIER.b.h*g.hs[r]*g.bs[r]))}
    // 졸개 처치 활력은 n배, 보스는 그대로
    const v0=P.vit,e=mkMob('산적',P.x+3,P.y);e.realm=0;e.hp=0;onKill(e);const dz=P.vit-v0,base=Math.round((e.d.xp||0)*(P.spouse?1.1:1)*(1+P.children.length*.03));
    return{...out,bsN:g.bs.length,dz,base,n13:GD.KILL_VIT.n}});
  ok(`졸개 생명 = 표준 × 1.45 × hs (${r.n.join(',')})`,r.n.every(Boolean));
  ok(`보스 생명 = 표준 × 9.5 × hs × bs (${r.b.join(',')})`,r.b.every((v,i)=>v===r.want[i])&&r.bsN===7);
  ok(`졸개 처치 활력 ${r.dz} = 기본 ${r.base} × ${r.n13}`,r.dz===Math.round(r.base*r.n13)||r.base===0);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

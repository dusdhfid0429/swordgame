// 경지 밸런스: 몹·NPC 경지, 경지 표준 능력치, 경지 차이 보정(플레이어·NPC끼리)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[]});
  // 몹 경지와 표준 능력치
  const m=await p.evaluate(()=>{const g=k=>{const e=mkMob(k,0,0);return[e.realm,e.hp,e.atk]};return{s:g('산적'),j:g('혈교장로'),w:g('늑대'),hh:g('흑풍채주')}});
  ok(`산적 ${m.s} · 흑풍채주 ${m.hh} · 혈교장로 ${m.j} · 늑대(짐승은 그대로) ${m.w}`,m.s[0]===0&&m.s[1]===91&&m.j[0]===4&&m.j[1]===3120&&m.w[1]===66&&m.hh[0]===2);
  // 문파 무인은 직위가 경지
  const f=await p.evaluate(()=>{const out={};for(let i=0;i<60;i++){const e=mkFac('정',i%2,10,10,'hwasan');out[e.rank]=[e.realm,e.hp,e.atk]}return out});
  ok(`문파 무인 직위→경지 ${JSON.stringify(f)}`,Object.entries(f).every(([r,v])=>v[0]===+r)&&f[3][1]>f[2][1]&&f[1][1]>f[0][1]);
  // 경지 차이: 같은 산적을 삼류·절정으로 때리고 맞는다
  const d=await p.evaluate(()=>{const X=mkX('base'),R=Math.random;Math.random=()=>.5;const out={};
    for(const r of[0,3]){P.realm=r;const e=mkMob('산적',P.x+1,P.y);e.hp=99999;e.def=0;mobs=[e];hitE(X,e,1,0,0);out['hit'+r]=99999-e.hp;
      Math.random=()=>.99;P.inv=0;P.hp=P.maxHp;hurtP(50,e);out['took'+r]=P.maxHp-P.hp;Math.random=()=>.5}
    P.realm=0;const boss=mkMob('혈교장로',P.x+1,P.y);Math.random=()=>.99;P.inv=0;P.hp=P.maxHp;hurtP(50,boss);out.bossTook=P.maxHp-P.hp;
    Math.random=R;P.realm=0;mobs=[];return out});
  ok(`경지 차이: 삼류 ${d.hit0}/${d.took0}, 절정 ${d.hit3}/${d.took3} (준 피해/받은 피해), 삼류가 혈교장로에게 ${d.bossTook}`,d.hit3>d.hit0*1.4&&d.took3<d.took0&&d.bossTook>d.took0*1.4);
  // NPC끼리: 높은 경지 무인이 더 세게 때린다
  const n=await p.evaluate(()=>{const a=mkFac('정',1,10,10,'hwasan'),lo=mkFac('사',0,11,10),R=Math.random;Math.random=()=>.5;a.realm=3;lo.realm=0;lo.hp=9999;lo.def=0;mobHurt(lo,30,a);const up=9999-lo.hp;
    const hi=mkFac('사',0,11,10);hi.realm=3;hi.hp=9999;hi.def=0;const lo2=mkFac('정',0,10,10);lo2.realm=0;mobHurt(hi,30,lo2);Math.random=R;return{up,down:9999-hi.hp}});
  ok(`NPC끼리: 절정→삼류 ${n.up}, 삼류→절정 ${n.down}`,n.up>n.down*2);
  // 지역 위험도: 개봉 근처는 낮고 변경·명산은 높다
  const dz=await p.evaluate(()=>{const at=id=>{P.reg=id;loadRegion(id);mobs=[];const s=mkMob('산적',5,5),w=mkMob('늑대',5,5),f=mkFac('사',0,5,5);return{d:danger(),s:s.realm,w:[w.realm,w.hp],f:[f.realm,f.name]}};
    const sx=Object.keys(REGIONS).find(k=>k.startsWith('pv_xinjiang')),sh=REGIONS.pv_xinjiang.marks.find(m=>m.n==='십만대산').gate;
    const out={henan:at(Object.keys(REGIONS).find(k=>k.startsWith('pv_henan'))),xj:at(sx),sm:at(sh),cave:danger('hq_cheonma_8')};P.reg='gaebong';loadRegion('gaebong');mobs=[];return out});
  ok(`지역 위험도: 하남 ${JSON.stringify(dz.henan)} / 신강 ${JSON.stringify(dz.xj)} / 십만대산 ${JSON.stringify(dz.sm)} / 천마동 ${dz.cave}`,
    dz.henan.s===0&&dz.xj.s===3&&dz.xj.w[0]===3&&dz.xj.w[1]>66&&dz.sm.d[0]===4&&dz.xj.f[0]>=3&&dz.xj.f[0]<=4&&dz.cave[0]===5);
  // 비무 사다리: 경지마다 한 명
  const du=await p.evaluate(()=>DUELISTS.map(o=>[o.n,o.realm,o.hp,o.atk]));
  ok(`비무 사다리 ${du.length}명: ${du.map(d=>d[0]+'('+d[1]+')').join(' · ')}`,du.length===7&&du.every((d,i)=>d[1]===i)&&du[6][2]>du[0][2]);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

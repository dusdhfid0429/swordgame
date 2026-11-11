// 무공별 초당 피해 재기 (t-테스트 아님, run.js 는 건너뛴다). 같은 몸(경지 R 벽 앞 균형, 숙련 PM, 이해도 가득)으로 모든 무공을 보스 하나/정예 셋에게 T초 쓴다.
//   PWPATH=$(npm root -g)/playwright node tests/sim_arts.js out.json [--raw]   (--raw: ARTK 보정 없이)
const {chromium}=require(process.env.PWPATH||'playwright');
const OUT=process.argv[2]||'arts.json',RAW=process.argv.includes('--raw'),R=+(process.env.R||4),PM=+(process.env.PM||90),T=+(process.env.T||20),REP=+(process.env.REP||4);   // 실제 보스전 길이(10~20초)로 여러 번 재서 평균: 내공은 저절로 차지 않아 오래 재면 평타 비중이 커진다
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const res=await p.evaluate(({R,PM,T,RAW,REP})=>{
    regionJump('war_field',20.5,24.5);mobs=[];allies=[];paused=true;saveGame=()=>{};showBanner=()=>{};ARTK_OFF=RAW;
    const h0=hurtP;hurtP=function(dm,src,s){h0(dm,src,s);if(P.hp<P.maxHp*.5)P.hp=P.maxHp};
    const out=[],ids=Object.keys(ARTS).filter(k=>{const a=ARTS[k];return !a.base&&!a.made&&a.forms&&a.forms.length&&CLASS[a.cls]});
    const foe=(kind,x,y)=>{const e=mkMob('산적',x,y);e.d={...e.d,[kind]:1};e.realm=R;scaleMob(e);e.maxHp=e.hp=1e9;e.aggro=true;e.home={x,y};return e};
    const avg=(id,g)=>{let t=0;for(let i=0;i<REP;i++)t+=run(id,g);return Math.round(t/REP)};const run=(id,group)=>{const a=ARTS[id],C=a.cls;P.realm=R;const hi=REALM_NEED.oe[Math.min(R+1,REALM_NEED.oe.length-1)];for(const k of['str','end','agi','qi'])P.st[k]=hi/4;
      P.qiBonus=Math.max(0,REALM_QI[R]-80);P.enl=0;P.inj=0;P.buff={atk:0,hm:0,crit:0,ult:0};P.pas={};P.mats={};P.eq.armor=P.eq.acc=P.eq.boots=null;
      AMGI_FREE=true;P.beltGift=P.dagGift=1;P.eq.weapon=C==='권'?null:C==='단'||C==='편'?mkWeapon(C,.85,0):mkWeapon(C,.85,0);
      P.arts={base:{p:PM,f:[true,true,true],ws:1}};P.arts[id]={p:PM,f:a.forms.map(()=>true),ws:1};P.cur=id;P.mode='auto';P.wu={[C]:wuCap(R)};
      recalc();P.hp=P.maxHp;P.qi=P.maxQi;P.fcd=[0,0,0,0,0,0];P.gcd=P.bcd=P.ucd=0;P.chain={last:-1,t:-9,sum:0,n:0};P.poison=0;P.inv=0;P.perch=null;P.leap=null;P.medit=false;P.chan=null;P.path=null;P.ride=null;P.run=false;
      G.diff=1;P.x=20.5;P.y=24.5;P.age=30;mobs=[];eprojs=[];projs=[];sched=[];fx=[];texts=[];drops=[];
      const es=group?[foe('elite',21.7,24.5),foe('elite',22.1,25.2),foe('elite',22.1,23.8)]:[foe('boss',21.7,24.5)];es.forEach(e=>mobs.push(e));P.target=es[0];let t=0;const dt=.05;
      while(t<T){update(dt);t+=dt;for(const e of es)if(mobs.indexOf(e)<0)mobs.push(e)}
      return Math.round(es.reduce((s,e)=>s+1e9-e.hp,0)/t)};
    for(const id of ids){const a=ARTS[id];try{out.push({id,n:a.n,cls:a.cls,g:a.grade||0,gy:!!a.gy,sect:a.sect||'',one:avg(id,false),grp:avg(id,true),cur:P.cur===id})}catch(err){out.push({id,n:a.n,cls:a.cls,err:err.message})}}
    return out},{R,PM,T,RAW,REP});
  require('fs').writeFileSync(OUT,JSON.stringify(res));console.log(res.length,'무공,',res.filter(x=>x.err).length,'오류',errs.slice(0,3));
  await b.close();process.exit(0)})();

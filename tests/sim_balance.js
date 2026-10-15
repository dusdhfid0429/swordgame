// 밸런스 시뮬 (2026-10-15 v110): 경지별 표준 플레이어가 같은 경지 졸개·정예·보스와 실제 전투 코드로 싸운다. 난이도마다 승률·체력 손실·걸린 시간을 뽑아 data/difficulty.json 계수를 맞춘다.
// 쓰는 법: PWPATH=$(npm root -g)/playwright node tests/sim_balance.js [-n 6] [-d 0,1,2,3,4] [-r 0,1,2,3,4] [--json 파일]
// 표준 플레이어: 정파 검객, 외공 합이 그 경지 문턱(32/42/54/68/84/102/122)에 막 닿은 맨몸(시작 무기만, 방어구·금창약 없음), 입문 검법 숙련·초식 수는 경지에 따라 [10·2초식, 30·3, 50·4, 70·5, 90·5]. 자동 초식.
// 적: 산적을 바탕으로 경지·등급(졸개/정예/보스)만 바꿔 scaleMob. 결전장(몹이 안 나오는 지역)에서 1.2칸 떨어져 시작. 90초 안에 못 끝내면 패배로 친다.
const {chromium}=require(process.env.PWPATH||'playwright');
const args=process.argv.slice(2),opt=(k,d)=>{const i=args.indexOf(k);return i<0?d:args[i+1]};
const RUNS=+opt('-n',6),DIFFS=opt('-d','0,1,2,3,4').split(',').map(Number),REALMS=opt('-r','0,1,2,3,4').split(',').map(Number),JSON_OUT=opt('--json',null),PROF=opt('-p','art'),PROBE=args.includes('--probe');   // --probe: 20초 동안 내 초당 피해·받는 피해만 잰다(계수 계산용)   // -p base: 기본 무공만(문서 기준) / art: 입문 검법
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate((PROF_)=>{
    // 시뮬 준비: 결전장으로, 죽지 않게 hurtP를 감싸고, 저장·연출은 끈다
    regionJump('war_field',20.5,24.5);mobs=[];allies=[];paused=true;P.mats={};P.eq.armor=P.eq.acc=P.eq.boots=null;
    window.SIM={dead:false,lost:0};const h0=hurtP;hurtP=function(dm,src){const hp=P.hp;P.hp=hp+1e6;h0(dm,src);const lost=hp+1e6-P.hp;SIM.lost+=lost;P.hp=hp-lost;if(P.hp<=0){SIM.dead=true;P.hp=1}};
    saveGame=()=>{};showBanner=()=>{};
    window.simProf=PROF_;window.simArt=Object.keys(ARTS).find(k=>ARTS[k].side==='정'&&ARTS[k].cls==='검'&&(ARTS[k].grade||0)===0&&k!=='base')||'정검0';
    window.simPlayer=function(r){const thr=[32,42,54,68,84,102,122][r],base=P.base,sum=base.str+base.end+base.agi+base.qi,add=(thr-sum)/4;
      for(const k of['str','end','agi','qi'])P.st[k]=base[k]+add;P.realm=r;P.qiBonus=Math.max(0,REALM_QI[r]-80);P.enl=0;P.inj=0;P.buff={atk:0,hm:0,crit:0,ult:0};P.pas={};
      const a=ARTS[simArt],n=[2,3,4,5,5,5,5][r],pm=[10,30,50,70,90,100,100][r];P.arts={base:{p:pm,f:[true,true,true]}};if(simProf==='base')P.cur='base';else{P.arts[simArt]={p:pm,f:a.forms.map((f,i)=>i<n)};P.cur=simArt}P.mode='auto';
      if(P.eq.weapon)P.eq.weapon.dur=P.eq.weapon.maxDur;recalc();P.hp=P.maxHp;P.qi=P.maxQi;P.fcd=[0,0,0,0,0,0];P.gcd=P.bcd=P.ucd=0;P.chain={last:-1,t:-9,sum:0,n:0};P.poison=0;P.inv=0;P.perch=null;P.leap=null;P.medit=false;P.chan=null;P.path=null;P.ride=null;P.run=false};
    window.simFight=function(diff,r,tier,cap=90,probe){G.diff=diff;simPlayer(r);SIM.lost=0;P.x=20.5;P.y=24.5;P.age=20;lastYear=20;G.cal=20;G.war=null;SIM.dead=false;mobs=[];eprojs=[];projs=[];sched=[];fx=[];texts=[];drops=[];
      const e=mkMob('산적',21.7,24.5),up=tier.endsWith('1')?1:0;e.d={...e.d,elite:tier[0]==='e'?1:0,boss:tier[0]==='b'?1:0};e.realm=Math.min(6,r+up);scaleMob(e);e.aggro=true;e.tgt=null;e.home={x:21.7,y:24.5};mobs.push(e);P.target=e;
      const hp0=P.hp,ehp=e.maxHp;let t=0,dt=.05;if(probe){e.hp=e.maxHp=1e9;while(t<cap){update(dt);t+=dt;if(P.hp<P.maxHp*.3)P.hp=P.maxHp}return{dps:+((1e9-e.hp)/cap).toFixed(1),lossRate:+(SIM.lost/cap/hp0).toFixed(4),pAtk:atk(),pHp:hp0,eAtk:e.atk,eHp:ehp,eDps:+(SIM.lost/cap).toFixed(1)}}
      while(t<cap&&e.hp>0&&!SIM.dead){update(dt);t+=dt;if(mobs.indexOf(e)<0&&e.hp>0)mobs.push(e)}
      return{win:e.hp<=0&&!SIM.dead,dead:SIM.dead,t:+t.toFixed(1),loss:+(Math.max(0,hp0-P.hp)/hp0).toFixed(2),ehp,pAtk:atk(),pHp:hp0,eAtk:e.atk,eLeft:+(Math.max(0,e.hp)/ehp).toFixed(2)}};
  },PROF);
  const out=[];
  if(PROBE){for(const d of DIFFS)for(const r of REALMS)for(const tier of['e','b']){const x=await p.evaluate(({d,r,tier})=>simFight(d,r,tier,20,true),{d,r,tier});
      console.log(`난이도 ${d} 경지 ${r} ${tier}: 내 초당 피해 ${x.dps} (공 ${x.pAtk}) · 적 초당 피해 ${x.eDps} = 내 생명(${x.pHp})의 ${(x.lossRate*100).toFixed(1)}%/s (적 공 ${x.eAtk}, 생명 ${x.eHp}) → 10초 싸움이면 적 생명 ${Math.round(x.dps*10)}, 손실 ${Math.round(x.lossRate*1000)}%`);out.push({d,r,tier,...x})}
    if(JSON_OUT)require('fs').writeFileSync(JSON_OUT,JSON.stringify(out,null,1));await b.close();process.exit(0)}
  for(const d of DIFFS)for(const r of REALMS)for(const tier of['n','e','b','e1']){
    const rows=await p.evaluate(({d,r,tier,n})=>{const a=[];for(let i=0;i<n;i++)a.push(simFight(d,r,tier));return a},{d,r,tier,n:RUNS});
    const win=rows.filter(x=>x.win).length/rows.length,loss=rows.reduce((s,x)=>s+x.loss,0)/rows.length,t=rows.reduce((s,x)=>s+x.t,0)/rows.length;
    const row={d,r,tier,win:+win.toFixed(2),loss:+loss.toFixed(2),t:+t.toFixed(1),pAtk:rows[0].pAtk,pHp:rows[0].pHp,eHp:rows[0].ehp,eAtk:rows[0].eAtk,eLeft:+(rows.reduce((s,x)=>s+x.eLeft,0)/rows.length).toFixed(2)};out.push(row);
    console.log(`난이도 ${d} 경지 ${r} ${tier}: 승 ${Math.round(win*100)}% 손실 ${Math.round(loss*100)}% ${row.t}s  (나 ${row.pAtk}/${row.pHp}, 적 ${row.eAtk}/${row.eHp}${win<1?` 적 남은 ${Math.round(row.eLeft*100)}%`:''})`);
  }
  if(JSON_OUT)require('fs').writeFileSync(JSON_OUT,JSON.stringify(out,null,1));
  if(errs.length){console.log('ERRORS');errs.slice(0,10).forEach(e=>console.log(' ',e))}
  await b.close();process.exit(0)})();

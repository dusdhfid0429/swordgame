// v244 쫓을 때 공격 동작으로 미끄러지지 않기 (동훈님 2026-11-10 "몹이 공격중 멀어지면 공격을하면서 따라가는게 아니라 이동후 붙어서 공격하게 해줘 … 아이스링크에서 스케이트 타는것 같아")
// 주인공: 적이 사거리 밖으로 빠지면 공격 동작(P.satk/P.swing)이 도는 동안은 움직이지 않고, 동작을 끝내거나 끊은 뒤 달리는 동작으로 붙어서 다시 친다
// 몹·동료: 휘두르는 동안(e.swing)은 서 있고, 그다음 쫓는다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{paused=true;spawnTick=()=>{};
    window.yard=()=>{for(const m of mobs)m.hp=0;mobs=[];allies=[];projs=[];sched=[];const cx=Math.floor(P.x),cy=Math.floor(P.y);
      for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++)if(objs[cy+j]&&cx+i>=0&&cx+i<N)objs[cy+j][cx+i]=null;
      P.x=cx+.5;P.y=cy+.5;P.path=null;P.target=null;P.chs=0;P.satk=P.swing=0;P.hp=P.maxHp=99999;P.qi=P.maxQi=99999;P.bcd=P.gcd=0;P.fcd=P.fcd.map(()=>0);return{cx,cy}};
    window.foe=(x,y)=>{const e=mkMob('산적',x,y);e.hp=e.maxHp=1e6;e.atk=0;e.def=0;e.hm=-999;e.d=Object.assign({},e.d,{sp:0});e.sp=0;e.stun=999;mobs.push(e);return e};
    window.learn=cls=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===cls&&!ARTS[k].side);P.arts[id]={p:0,f:ARTS[id].forms.map(()=>false)};P.cur=id;P.eq.weapon=cls==='권'?null:mkWeapon(cls,1,0);recalc();return id}});
  for(const cls of['검','권']){
    const r=await p.evaluate(cls=>{learn(cls);P.mode='basic';const{cx,cy}=yard();const e=foe(cx+1.3,cy+.5);P.target=e;
      let t=0;while(!(P.satk>0||P.swing>0)&&t<2){update(1/30);t+=1/30}
      const started=P.satk>0||P.swing>0;e.x=cx+4.5;   // 치자마자 적이 물러난다
      let slide=0,ran=0,h0=1e6-e.hp,hit2=false;
      for(let i=0;i<90;i++){const x0=P.x,y0=P.y,busy=P.satk>0||P.swing>0;update(1/30);const mv=Math.hypot(P.x-x0,P.y-y0);
        if(mv>1e-4&&(busy&&(P.satk>0||P.swing>0)))slide++;if(mv>1e-4&&P.moving)ran++;if(1e6-e.hp>h0)hit2=true}
      return{started,slide,ran,hit2,d:dist(e,P)}},cls);
    ok(`${cls}: 공격 동작 중엔 미끄러지지 않고 (미끄럼 ${r.slide}칸), 달려가서 (${r.ran}프레임) 다시 친다 (${r.hit2}, 거리 ${r.d.toFixed(2)})`,r.started&&r.slide===0&&r.ran>3&&r.hit2);
  }
  // 몹: 휘두르는 동안은 서 있고, 그다음 쫓는다
  let r=await p.evaluate(()=>{out:for(let y=6;y<N-6;y++)for(let x=8;x<N-8;x++)if(walk(x,y)&&!inTown(x,y)&&!inTown(x+4,y)){P.x=x+.5;P.y=y+.5;break out}const{cx,cy}=yard();P.hp=P.maxHp=1e9;const e=mkMob('산적',cx+3.5,cy+.5);e.atk=0;mobs.push(e);e.aggro=true;e.tgt=null;e.swing=.24;e.wind=0;e.stun=0;e.cd=5;
    let slide=0,moved=0;for(let i=0;i<30;i++){const x0=e.x,y0=e.y,sw=e.swing>0;update(1/30);const mv=Math.hypot(e.x-x0,e.y-y0)>1e-4;if(mv&&sw&&e.swing>0)slide++;if(mv)moved++}return{slide,moved}});
  ok(`몹: 휘두르는 동안 미끄러지지 않고 (${r.slide}) 그다음 쫓는다 (${r.moved}프레임)`,r.slide===0&&r.moved>5);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no errors');await b.close();
})();

// 무덤 던전: 죽은 자리에 무덤이 남고, 다음 생에 다가가면 전생의 망령이 깨어나며, 쓰러뜨리면 물건을 등급별 확률로 떨어뜨리고 무덤이 사라진다.
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await b.newPage({viewport:{width:1100,height:760}});
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="cls:도"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  // 마을 밖에서 장비를 갖추고 죽는다
  const before=await p.evaluate(()=>{{let best=null;for(let j=2;j<N-2;j++)for(let i=2;i<N-2;i++){if(inTown(i,j))continue;let f=0;for(let v=-3;v<=3;v++)for(let u=-3;u<=3;u++)if(walk(i+u,j+v))f++;const d=Math.hypot(i-21,j-21);if(f===49&&d>13&&(!best||d<best.d))best={i,j,d}}P.x=best.i+.5;P.y=best.j+.5}P.path=null;
    P.eq.weapon=mkWeapon('도',1.5,0);P.eq.armor=mkGear('armor','흑철갑',1.2,{hp:26,def:4});P.bag.push(mkGear('boots','짚신',.6,{spd:.12,hm:4}),mkGear('acc','옥패',.9,{qi:24,hm:5}));
    for(const m of mobs)if(dist(m,P)<12)m.hp=0;mobs=mobs.filter(m=>m.hp>0);
    P.children.push({name:'후계',age:3});die('전투');return{x:P.x,y:P.y,name:P.name,n:Object.values(P.eq).filter(Boolean).length+P.bag.length}});
  await p.waitForTimeout(1500);
  const t=await p.evaluate(()=>G.tombs[0]);
  ok(`죽은 자리에 무덤이 생긴다 (${t&&t.x},${t&&t.y})`,!!t&&Math.hypot(t.x-before.x,t.y-before.y)<4.5&&t.name===before.name);
  ok(`무덤에 그 생의 물건이 모두 담긴다 (${t&&t.items.length}/${before.n})`,t&&t.items.length===before.n);
  await p.click('[data-s="rebirth"]');await p.waitForTimeout(300);await p.click('[data-s="heir:0"]');await p.click('[data-s="start"]');await p.waitForTimeout(800);
  ok('다음 생에도 무덤이 남아 있다',await p.evaluate(()=>G.tombs.length===1&&playing));
  // 저장 후 불러와도 남는다
  await p.evaluate(()=>saveGame(true));await p.reload();await p.waitForTimeout(1500);await p.click('[data-s="cont"]');await p.waitForTimeout(600);
  ok('다시 불러와도 무덤이 남아 있다',await p.evaluate(()=>G.tombs.length===1));
  // 잠든 무덤 모습
  await p.evaluate(()=>{const t=G.tombs[0];P.x=t.x+5.5;P.y=t.y+3;P.path=null;spawnTick=()=>{};for(const m of mobs)if(dist(m,t)<8)m.hp=0;mobs=mobs.filter(m=>m.hp>0)});await p.waitForTimeout(500);
  await p.evaluate(()=>{const t=G.tombs[0],q=toScreen(t.x,t.y),r=C.getBoundingClientRect();window.__clip={x:r.left+(q.x-130)*S,y:r.top+(q.y-100)*S,width:260*S,height:150*S}});
  await p.screenshot({path:shot('tomb_sleep'),clip:await p.evaluate(()=>window.__clip)});
  // 다가가면 망령이 깨어난다
  await p.evaluate(()=>{const t=G.tombs[0];P.x=t.x+3;P.y=t.y+2;P.path=null;P.hp=P.maxHp=99999;spawnTick=()=>{}});await p.waitForTimeout(900);
  const boss=await p.evaluate(()=>{const e=mobs.find(m=>m.tomb);return e&&{name:e.name,hp:e.maxHp,atk:e.atk,guards:mobs.filter(m=>m.tombGuard&&m.hp>0).length}});
  ok(`다가가면 망령 보스가 깨어난다 (${boss&&boss.name}, 생명 ${boss&&boss.hp}, 공격 ${boss&&boss.atk}, 강시 ${boss&&boss.guards})`,!!boss&&boss.name.includes('망령')&&boss.guards===2);
  await p.waitForTimeout(2600);await p.evaluate(()=>{const t=G.tombs[0],q=toScreen(t.x,t.y),r=C.getBoundingClientRect();window.__clip={x:r.left+(q.x-170)*S,y:r.top+(q.y-150)*S,width:340*S,height:230*S}});
  await p.screenshot({path:shot('tomb_awake'),clip:await p.evaluate(()=>window.__clip)});
  // 쓰러뜨린다
  await p.evaluate(()=>{const e=mobs.find(m=>m.tomb);e.hp=0;onKill(e)});await p.waitForTimeout(500);
  const res=await p.evaluate(()=>({tombs:G.tombs.length,drops:drops.filter(d=>d.it.item).length,guards:mobs.filter(m=>m.tombGuard&&m.hp>0).length}));
  ok(`망령을 쓰러뜨리면 물건이 떨어지고 (${res.drops}개) 무덤이 사라진다`,res.tombs===0&&res.drops>=1&&res.guards===0);
  await p.waitForTimeout(400);await p.screenshot({path:shot('tomb_clear')});
  // 등급별 확률: 좋은 물건일수록 덜 나온다
  const pr=await p.evaluate(()=>[.6,.9,1.2,1.5].map(q=>{let n=0;for(let i=0;i<4000;i++)if(Math.random()<tombDropP({slot:'armor',q}))n++;return[QN(q),n/4000]}));
  ok(`좋은 물건일수록 덜 나온다 (${pr.map(([a,b])=>a+' '+Math.round(b*100)+'%').join(', ')})`,pr.every((x,i)=>!i||x[1]<pr[i-1][1]));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

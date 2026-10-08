// 지역 이동: 개봉 북쪽 출입구 → 숭산, 숭산에서 길이 이어지는지, 되돌아오면 밭·무덤이 지역별로 유지되는지 확인한다.
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await b.newPage({viewport:{width:1100,height:760}});
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{P.hp=P.maxHp=99999;P.mats['배추씨']=(P.mats['배추씨']||0)+1;const pl=plots[0];pl.crop=Object.keys(CROPS)[0];pl.g=.5});
  // 북쪽 출입구 앞에서 걸어 들어간다
  await p.evaluate(()=>{P.x=20.5;P.y=3.5;P.path=null;for(const m of mobs)if(dist(m,P)<10)m.hp=0;mobs=mobs.filter(m=>m.hp>0)});await p.waitForTimeout(300);
  await p.screenshot({path:shot('region_gate_gaebong')});
  await p.evaluate(()=>{P.path=[{x:20.5,y:1.2}]});
  await p.waitForFunction(()=>REG==='sungsan',null,{timeout:6000}).catch(()=>{});await p.waitForTimeout(700);
  const s=await p.evaluate(()=>({reg:REG,preg:P.reg,x:P.x,y:P.y,zone:$('zone').textContent,mobs:mobs.length,npc:pickAt?1:0}));
  ok(`북쪽 출입구로 숭산에 간다 (${s.zone}, ${s.x.toFixed(1)},${s.y.toFixed(1)}, 몹 ${s.mobs})`,s.reg==='sungsan'&&s.preg==='sungsan'&&s.y>35&&s.mobs>0);
  ok('도착하자마자 되돌아가지 않는다',await p.evaluate(()=>{const r=REG;return r==='sungsan'}));
  await p.screenshot({path:shot('region_sungsan_arrive')});
  // 산문에서 암자까지 걸어서 이어지는지 (막힌 길 없음)
  const path=await p.evaluate(()=>{const seen=new Set(),q=[[20,37]];seen.add('20,37');while(q.length){const[x,y]=q.shift();if(y<=7&&x>=17&&x<=23)return true;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(!seen.has(k)&&walk(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy])}}}return false});
  ok('산문에서 산정 암자까지 걸어서 갈 수 있다',path);
  for(const[n,y]of[['mid',24],['top',8]]){await p.evaluate(y=>{P.x=SS_PATH(y)+.5;P.y=y+.5;P.path=null;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y},y);await p.waitForTimeout(500);await p.screenshot({path:shot('region_sungsan_'+n)})}
  ok('암자 구역 이름',await p.evaluate(()=>$('zone').textContent.includes('암자')));
  // 숭산에서 죽으면 무덤은 숭산에만 있다
  await p.evaluate(()=>{P.x=SS_PATH(20)+.5;P.y=20.5;const tb=G.tombs.length;P.hp=1;makeTomb('전투')});
  const tomb=await p.evaluate(()=>G.tombs.at(-1).reg);ok(`숭산 무덤은 숭산 소속 (${tomb})`,tomb==='sungsan');
  // 되돌아간다
  await p.evaluate(()=>{P.x=20.5;P.y=37.4;P.path=[{x:20.5,y:38.6}];P.gateLock=0});
  await p.waitForFunction(()=>REG==='gaebong',null,{timeout:6000}).catch(()=>{});await p.waitForTimeout(600);
  const g=await p.evaluate(()=>({reg:REG,y:P.y,crop:plots[0].crop,gr:plots[0].g,npc:REG==='gaebong'&&NPCS.length,tombHere:G.tombs.filter(t=>(t.reg||'gaebong')===REG).length}));
  ok(`남쪽 출입구로 개봉에 돌아온다 (y ${g.y.toFixed(1)})`,g.reg==='gaebong'&&g.y<5);
  ok(`떠나 있는 동안에도 밭이 남고 자란다 (${g.gr.toFixed(2)})`,!!g.crop&&g.gr>=.5);
  ok('숭산 무덤은 개봉에 나타나지 않는다',g.tombHere===0);
  // 숭산에서 저장 후 이어하기 → 개봉 성내에서 시작
  await p.evaluate(()=>{P.reg='sungsan';saveGame(true)});await p.reload();await p.waitForTimeout(1500);await p.click('[data-s="cont"]');await p.waitForTimeout(800);
  ok('이어하기는 개봉 성내에서 시작',await p.evaluate(()=>REG==='gaebong'&&P.reg==='gaebong'&&inTown(Math.floor(P.x),Math.floor(P.y))));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

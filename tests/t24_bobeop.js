// 보법: 경공과 따로인 회피기. 직선·간파 두 타입, 등급별 범위, 배후 잡기, 성능
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  ok('처음부터 기초보법(하승·직선)을 안다, 터치 보법 버튼',await p.evaluate(()=>P.bob.b_basic&&bobOf().t==='line'&&!!$('t_step')));
  await p.evaluate(()=>{travel({to:'pv_henan',tx:24.5,ty:24.5})});await p.waitForTimeout(1500);
  // 탁 트인 자리 찾기
  const open=await p.evaluate(()=>{for(let j=6;j<N-6;j++)for(let i=6;i<N-6;i++){let f=true;for(let y=j-5;y<=j+5&&f;y++)for(let x=i-5;x<=i+5;x++)if(!walk(x,y)){f=false;break}if(f)return{x:i+.5,y:j+.5}}return null});
  const setup=o=>p.evaluate(o=>{mobs=[];P.x=o.x;P.y=o.y;P.leap=null;P.perch=null;P.z=0;P.qi=P.maxQi;P.bcd2=0;P.target=null;P.fx=1;P.fy=0;P.buff.crit=0;joy.on=false},o);
  await setup(open);
  // 직선: 바라보는 쪽으로, 늑대 사이를 빠져나간다
  const s1=await p.evaluate(()=>{const w1=mkMob('늑대',P.x+1.2,P.y-.4),w2=mkMob('늑대',P.x+1.2,P.y+.4);mobs.push(w1,w2);const x0=P.x,q0=P.qi;const r=bobeop();return{r,x0,q0,qi:P.qi,inv:P.inv}});
  await p.waitForTimeout(500);
  const s1b=await p.evaluate(()=>({x:P.x,again:bobeop(),cd:P.bcd2}));
  ok(`직선 보법: 늑대 둘 사이를 빠져 ${(s1b.x-s1.x0).toFixed(1)}칸, 무적 ${s1.inv}초, 내공 ${s1.q0-s1.qi}`,s1.r&&s1b.x-s1.x0>2&&s1.inv>0&&s1.q0-s1.qi===5);
  ok(`다시 쓰려면 기다린다 (${s1b.cd.toFixed(1)}초)`,!s1b.again&&s1b.cd>0);
  // 조이스틱 방향
  await setup(open);
  const s2=await p.evaluate(()=>{joy.on=true;joy.gx=0;joy.gy=1;const y0=P.y;bobeop();return y0});await p.waitForTimeout(500);
  ok('조이스틱을 기울이면 그쪽으로',await p.evaluate(y0=>{joy.on=false;return P.y-y0>2},s2));
  // 무적
  await setup(open);
  ok('보법 중에는 맞지 않는다',await p.evaluate(()=>{bobeop();const h=P.hp;hurtP(50,{hm:0});return P.hp===h}));
  await p.waitForTimeout(500);
  // 간파: 상대 등 뒤로
  await setup(open);
  const s3=await p.evaluate(()=>{P.bob.b_gugung=1;P.bcur='b_gugung';const T=mkMob('늑대',P.x+1.6,P.y);T.fx=-1;T.fy=0;mobs.push(T);P.target=T;bobeop();window._T=T;const L=P.leap,dx=L.ex-T.x,dy=L.ey-T.y,d=Math.hypot(dx,dy);window._bk={back:-(dx*T.fx+dy*T.fy)/d,d};return 1});
  await p.waitForTimeout(500);
  const s3b=await p.evaluate(()=>{const T=window._T,dx=P.x-T.x,dy=P.y-T.y,d=Math.hypot(dx,dy);return{back:window._bk.back,d:window._bk.d,crit:P.buff.crit>0,face:P.fx*(T.x-P.x)+P.fy*(T.y-P.y)>0}});
  ok(`간파 보법(구궁팔괘보): 상대 등 뒤(방향 일치 ${s3b.back.toFixed(2)})로 ${s3b.d.toFixed(1)}칸, 다음 일격 치명타, 상대를 바라본다`,s3b.back>.5&&s3b.d<2.6&&s3b.crit&&s3b.face);
  await p.screenshot({path:shot('bobeop_flank')});
  // 둘러싸이면 덜 둘러싸인 자리로
  await setup(open);
  const s4=await p.evaluate(()=>{for(const[a,bb]of[[1,0],[-1,0],[0,1],[0,-1],[.7,.7]])mobs.push(mkMob('늑대',P.x+a*1.1,P.y+bb*1.1));
    const cnt=()=>mobs.filter(e=>dist(e,P)<1.7).length;const c0=cnt();bobeop();window._c0=c0;return c0});
  await p.waitForTimeout(500);
  const c1=await p.evaluate(()=>{for(const e of mobs){e.x=e.x;}return mobs.filter(e=>dist(e,P)<1.7).length});
  ok(`둘러싸였을 때 (붙은 적 ${s4} → ${c1})`,c1<s4);
  // 등급이 높을수록 범위가 넓다
  const s5=await p.evaluate(()=>BG.rad.map((r,i)=>r).join('<')+' · '+BG.len.join('<'));
  ok(`등급별 범위 ${s5}`,await p.evaluate(()=>BG.rad.every((r,i)=>!i||r>BG.rad[i-1])&&BG.len.every((r,i)=>!i||r>BG.len[i-1])));
  // 성능: 절정 간파, 적 40명
  await setup(open);
  const perf=await p.evaluate(()=>{P.bob.b_neungpa=1;P.bcur='b_neungpa';mobs=[];for(let i=0;i<40;i++){const a=i*2.4,r=1+i%7;mobs.push(mkMob('늑대',P.x+Math.cos(a)*r,P.y+Math.sin(a)*r))}
    const b=BOBS.b_neungpa,t0=performance.now();for(let i=0;i<300;i++)bobFlank(b,0,0);return{ms:(performance.now()-t0)/300,tried:BOB_STAT.tried,foes:BOB_STAT.foes}});
  ok(`절정 능파미보, 적 40명: 한 번 살피는 데 ${perf.ms.toFixed(3)}ms (자리 ${perf.tried}곳, 적 ${perf.foes}명만 견줌)`,perf.ms<2&&perf.tried<=96&&perf.foes<=24);
  // 잡화점 비급과 문파 보법
  const s6=await p.evaluate(()=>{P.silver=999;const i=SHOP.gen.findIndex(q=>q[0]==='bbook:b_seom');buy('gen',i);const it=P.bag.find(q=>q.slot==='bbook');readBook(it);return{has:!!P.bob.b_seom,cur:P.bcur}});
  ok('잡화점에서 섬전보(중승) 비급을 사서 읽으면 익히고 바로 쓴다',s6.has&&s6.cur==='b_seom');
  const s7=await p.evaluate(()=>{delete P.bob.b_yuun;P.sect=null;const a=bobBlock('b_yuun',1);P.sect='hwasan';P.mtot={hwasan:0};P.merit={hwasan:500};const r0=bobBlock('b_yuun',1);
    P.mtot.hwasan=60;learnBob('b_yuun',1);const r1=bobBlock('b_ilwi',1);return{a,r0,learned:!!P.bob.b_yuun,merit:P.merit.hwasan,r1,shop:bobBlock('b_ilwi')}});
  ok(`상승·절정은 문파에서: "${s7.a}", "${s7.r0}" → 익힘(공적 500→${s7.merit}), 절정 "${s7.r1}", 상점으로는 "${s7.shop}"`,s7.a==='문파 제자만'&&s7.r0==='정식제자 이상'&&s7.learned&&s7.merit===400&&s7.r1==='호법 이상'&&s7.shop==='문파에서');
  await p.evaluate(()=>openPanel('arts'));await p.waitForTimeout(200);
  ok('무공 창에 보법 목록과 바꾸기',await p.evaluate(()=>$('wbody').textContent.includes('보법')&&!!document.querySelector('#wbody [data-act^="bsel:"]')));
  await p.evaluate(()=>act('bsel:b_basic'));ok('바꾸면 그 보법을 쓴다',await p.evaluate(()=>P.bcur==='b_basic'));
  await p.evaluate(()=>closePanels());
  // 경공은 따로
  await setup(open);
  ok('경공은 따로: 보법 대기와 상관없이 뛴다',await p.evaluate(()=>{P.bcd2=2;const q=P.qi;leap();return P.qi===q-12&&!!P.leap}));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

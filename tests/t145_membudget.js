// v225 개선 계획 7절: 메모리 한도. 결전장(16대20)에서 실제 화면으로 20초 싸우는 동안 렌더러 메모리(RSS)가 한도를 넘지 않는다
// 한도는 data/perf.json MEMB.mb (휴대폰 WebView가 꺼지지 않게). 리눅스 /proc로 이 테스트가 띄운 렌더러만 잰다
const {chromium}=require(process.env.PWPATH||'playwright');
const fs=require('fs'),path=require('path');
const PERF=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/perf.json'),'utf8')),LIM=PERF.MEMB;
function kids(){const by={};for(const d of fs.readdirSync('/proc')){if(!/^\d+$/.test(d))continue;try{const st=fs.readFileSync(`/proc/${d}/stat`,'utf8'),pp=+st.slice(st.lastIndexOf(')')+2).split(' ')[1];(by[pp]=by[pp]||[]).push(+d)}catch(e){}}
  const out=[],q=[process.pid];while(q.length){const p=q.shift();for(const c of by[p]||[]){out.push(c);q.push(c)}}return out}
function rendererMB(){let mx=0;for(const pid of kids()){try{const cmd=fs.readFileSync(`/proc/${pid}/cmdline`,'utf8');if(!cmd.includes('--type=renderer'))continue;
  const m=fs.readFileSync(`/proc/${pid}/status`,'utf8').match(/VmRSS:\s+(\d+)/);if(m)mx=Math.max(mx,+m[1]/1024)}catch(e){}}return mx}
(async()=>{
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const mb=fs.statSync(path.resolve(__dirname,'../dist/gangho.html')).size/1048576;ok(`게임 파일 ${mb.toFixed(2)}MB ≤ 한도 ${PERF.SIZE.mb}MB (목표 ${PERF.SIZE.goal}MB)`,mb<=PERF.SIZE.mb);
  if(!fs.existsSync('/proc/self/status')){ok('리눅스가 아니어서 건너뜀',true);return}
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:+(process.env.DPR||LIM.dpr),isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+path.resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(1500);
  const base=rendererMB();
  // 결전장: 내 편 16, 적 20 (v118 결전 규모), 실제 rAF로 싸운다
  await p.evaluate(({a,f})=>{regionJump('war_field',20.5,30);P.hp=P.maxHp=1e7;P.qi=P.maxQi=1e5;
    const pf=pfac(),foe=(FAC_FOE[pf]||['사'])[0],K={정:'정파 무인',사:'사파 무인',마:'마교도',관:'관군'};
    for(let i=0;i<a;i++){const e=mkMob(K[pf]||'정파 무인',14+i%8*1.5,26+Math.floor(i/8)*1.5);e.warAlly=1;e.hp=e.maxHp=1e6;mobs.push(e)}
    for(let i=0;i<f;i++){const e=mkMob(K[foe]||'사파 무인',13+i%10*1.5,12+Math.floor(i/10)*1.5);e.aggro=true;e.hp=e.maxHp=1e6;mobs.push(e)}},{a:LIM.ally,f:LIM.foe});
  let peak=0;const t0=Date.now();
  while(Date.now()-t0<LIM.sec*1000){await p.evaluate(()=>{const e=mobs.find(m=>m.hp>0&&m.aggro&&!m.warAlly);if(e){P.target=e;P.x=e.x+.9;P.y=e.y}P.fcd=P.fcd.map(()=>0);P.gcd=0;try{for(let i=0;i<6;i++)useForm(i)}catch(_){}});
    await p.waitForTimeout(500);peak=Math.max(peak,rendererMB())}
  const st=await p.evaluate(()=>({n:mobs.length,fx:fx.length}));
  console.log(`  시작 ${base.toFixed(0)}MB · 결전장 최고 ${peak.toFixed(0)}MB · 한도 ${LIM.mb}MB · 목표 ${LIM.goal}MB (무리 ${st.n}, 이펙트 ${st.fx})`);
  ok(`결전장 렌더러 메모리 ${peak.toFixed(0)}MB ≤ 한도 ${LIM.mb}MB`,peak>0&&peak<=LIM.mb);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

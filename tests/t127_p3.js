// v196 플레이 점검 P3: 정세 창 사건 카드가 맨 위, 업적 조사, 제목 화면 뒤 HUD, 무관의 잠긴 초식 문구, 95%면 소환단 단추 없음, 바로 전 지역 바닥은 버림
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  const hud0=await p.evaluate(()=>getComputedStyle(document.querySelector('.panel')).visibility);
  ok(`제목 화면에서는 HUD가 안 보임 (${hud0})`,hud0==='hidden');
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const hud1=await p.evaluate(()=>getComputedStyle(document.querySelector('.panel')).visibility);
  ok(`놀이 중에는 HUD가 보임 (${hud1})`,hud1==='visible');
  // 무관에서 잠긴 초식 키
  const lk=await p.evaluate(()=>{logEl.innerHTML='';const a=art(),s=A(a.id),i=s.f.findIndex(x=>!x);if(i<0)return'none';useForm(i);return logEl.textContent});
  ok(`무관에서 잠긴 초식: 교두 전수 안내 (${lk.slice(0,60)})`,lk==='none'||lk.includes('교두에게 전수'));
  // 업적 조사
  const ft=await p.evaluate(()=>{feat('[소양진기]을(를) 익혔다');feat('[천마검]을(를) 익혔다');return P.feats.slice(-2)});
  ok(`업적 조사 맞춤 (${ft.join(' / ')})`,ft[0].includes('소양진기]를')&&ft[1].includes('천마검]을')&&!ft.join('').includes('(를)'));
  // 정세 창: 사건 카드가 맨 위
  const st=await p.evaluate(()=>{P.age=21;const h=pStory(),i=h.indexOf('세 · ');return{first:h.slice(0,120),ev:curEv().length,top:curEv().length?h.indexOf(evCard(curEv()[0]))===0:true,i}});
  ok(`정세 창 첫 칸이 사건 카드 (사건 ${st.ev}) ${st.top?'':st.first}`,st.top);
  // 폐관 성공률이 이미 최대면 소환단 단추를 감춘다
  const pg=await p.evaluate(()=>{const o=pgChance,pw=pgWhy,st={...P.st},en=P.enl;for(const k in P.st)P.st[k]=999;P.enl=999;const qx=P.qiX;P.qiX=99999;P.mats.소환단=3;pgWhy=()=>'';pgChance=()=>.95;const w=atWall(),a=pgRow().includes('소환단 먹고');pgChance=x=>x?.6:.5;const c=pgRow().includes('소환단 먹고');pgChance=o;pgWhy=pw;P.st=st;P.enl=en;P.qiX=qx;return{a,c,w}});
  ok(`95%면 소환단 단추 없음 (${pg.a}), 오르면 있음 (${pg.c}) 벽 ${pg.w}`,!pg.a&&pg.c);
  // 바닥 그림은 지금 지역 것만 남는다
  const gk=await p.evaluate(()=>{loadRegion('gaebong');loadRegion('hq_hwasan');return Object.keys(GROUND)});
  ok(`바닥 그림은 지금 지역 것만 (${gk.join(',')})`,gk.length===1&&gk[0]==='hq_hwasan');
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

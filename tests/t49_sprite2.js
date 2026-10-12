// 무기별 공격·대기 도트와 경공 1단 (사용자 시트, 2026-10-12): 아틀라스 로드, 무기별 프레임, 경공 프레임, 궁도 도트, 그리기 오류 없음
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const shot=n=>require('path').resolve(__dirname,'shots',n+'.png');
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.waitForFunction(()=>hero2Ok());await p.waitForTimeout(300);
  // 1. 아틀라스: 13줄 112장, 줄마다 시작+장수가 이어진다
  const a=await p.evaluate(()=>{const rows=Object.values(A2).sort((x,y)=>x[0]-y[0]);let okc=true;for(let i=1;i<rows.length;i++)if(rows[i][0]!==rows[i-1][0]+rows[i-1][1])okc=false;
    return{n:HF2.length,rows:rows.length,okc,last:rows[rows.length-1][0]+rows[rows.length-1][1],w:HERO2.naturalWidth}});
  ok(`아틀라스 2: ${a.rows}줄 ${a.n}장 (폭 ${a.w})`,a.rows===13&&a.n===113&&a.okc&&a.last===113&&a.w>8000);
  // 2. 무기마다 대기·공격 프레임이 2번 아틀라스의 제 줄에서 나온다
  const r=await p.evaluate(()=>{const out={};const useCls=w=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===w);P.arts[id]=P.arts[id]||{p:0,f:[true,false,false]};P.cur=id;P.eq.weapon=w==='권'?null:mkWeapon(w,1,0);recalc()};window.useCls=useCls;
      for(const w of['도','봉','창','권','궁']){useCls(w);P.satk=0;P.sj=0;P.runT=0;
      const idle=heroFrame();heroAtk('flat');const atk=heroFrame();heroAtk('ult');const ult=heroFrame();P.satk=0;
      const inRow=(f,row)=>f[3]&&f[0]>=A2[row][0]&&f[0]<A2[row][0]+A2[row][1];
      out[w]={sprite:heroSprite(),idle:inRow(idle,'i'+w),atk:inRow(atk,w),ult:inRow(ult,w),ss2:P.ss2}}
    useCls('검');heroAtk('flat');const sw=heroFrame();P.satk=0;out.검={atk:!sw[3]&&HSET.flat.includes(sw[0]),ss2:P.ss2};return out});
  ok(`무기별 프레임: ${Object.entries(r).map(([k,v])=>k+(v.idle===undefined?'':v.idle?'·대기':'·대기X')+(v.atk?'·공격':'·공격X')).join(' ')}`,['도','봉','창','권','궁'].every(w=>r[w].sprite&&r[w].idle&&r[w].atk&&r[w].ult&&r[w].ss2===1)&&r.검.atk&&r.검.ss2===0);
  // 2b. 권 계열 발차기 초식은 각법 줄, 맨손 기본 공격은 권·각 줄을 오간다
  const k=await p.evaluate(()=>{useCls('권');heroAtk('flat',{n:'선풍각',p:'circle'});const a=heroFrame();heroAtk('flat',{n:'철권',p:'melee'});const b=heroFrame();
    heroAtk('vert');const c=heroFrame();P.satk=0;const inRow=(f,row)=>f[3]&&f[0]>=A2[row][0]&&f[0]<A2[row][0]+A2[row][1];return{kick:inRow(a,'각'),fist:inRow(b,'권'),basic:inRow(c,'각')}});
  ok(`발차기 초식은 각법 줄 ${k.kick}, 주먹은 권 줄 ${k.fist}, 맨손 기본기 ${k.basic}`,k.kick&&k.fist&&k.basic);
  // 3. 경공 1단: 0.6초 동안 j줄 9장을 차례로, 검도 같은 동작
  const j=await p.evaluate(()=>{const seq=[];for(const t of[.6,.45,.3,.15,.01]){P.sj=t;seq.push(heroFrame())}P.sj=0;const s=A2.j;
    return{first:seq[0][0]-s[0],last:seq[4][0]-s[0],asc:seq.every((f,i)=>i===0||f[0]>=seq[i-1][0]),all2:seq.every(f=>f[3]),n:s[1]}});
  ok(`경공 1단: ${j.n}장, ${j.first}→${j.last}`,j.n===9&&j.first===0&&j.last===8&&j.asc&&j.all2);
  // 4. 공격 중 그리기: 각 무기로 한 번씩 휘두르며 오류 없이 그려진다
  await p.evaluate(()=>{useCls('창');heroAtk('ult');mobs=[]});await p.waitForTimeout(250);await p.screenshot({path:shot('t49_spear')});
  await p.evaluate(()=>{useCls('궁');heroAtk('flat')});await p.waitForTimeout(150);await p.screenshot({path:shot('t49_bow')});
  await p.evaluate(()=>{useCls('권');P.sj=.6});await p.waitForTimeout(200);await p.screenshot({path:shot('t49_jump')});
  await p.evaluate(()=>{useCls('도');P.satk=0;P.sj=0});await p.waitForTimeout(300);await p.screenshot({path:shot('t49_idle')});
  ok('그리기 오류 없음',errs.length===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

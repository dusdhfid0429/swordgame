// 문파 보법·경공 (v187, 사용자 2026-10-27 "문파 경공과 보법의 이름 및 효과가 모든 문파가 같아 문파마다 다르게")
// 문파마다 고유 이름·특징, 등급별 같은 힘, 가입·본산 단계 올리기, 특징 효과, 옛 저장 옮기기
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);

  // 1. 문파마다 다른 이름, 등급별 같은 힘
  const d=await p.evaluate(()=>{const ids=Object.keys(SECTS),miss=ids.filter(s=>!SECT_MOVE[s]),bn=new Set(),gn=new Set();let dup=[],bad=[];
    for(const s of ids){const m=SECT_MOVE[s];if(!m)continue;if(bn.has(m.b.n)||gn.has(m.g.n))dup.push(s);bn.add(m.b.n);gn.add(m.g.n)}
    for(const id in BOBS){const x=BOBS[id];if(!x.sect)continue;if(x.tr.length!==Math.min(3,x.g+1)||x.tr.some(t=>t.v!==SM_BTK[t.k].v[x.g-1]))bad.push(id);
      if(x.t==='line'&&x.tr.some(t=>t.k==='fail'||t.k==='back'))bad.push(id);if(x.t==='flank'&&x.tr.some(t=>t.k==='cut'))bad.push(id)}
    for(const id in GGS){const x=GGS[id];if(!x.sect)continue;if(x.tr.length!==Math.min(3,x.g+1)||x.tr.some(t=>t.v!==SM_GTV[t.k][x.g-1]||!GG_TK[t.k]))bad.push(id)}
    const lg=[...Object.values(BOBS),...Object.values(GGS)].filter(x=>!x.sect).map(x=>x.n).filter(n=>bn.has(n)||gn.has(n));
    return{n:ids.length,miss,dup,bad,bn:bn.size,gn:gn.size,lg,top:{shaolin:smTop('shaolin'),cheonma:smTop('cheonma'),eon:smTop('eon'),hwangbo:smTop('hwangbo')}}});
  ok(`문파 ${d.n}곳 모두 보법 ${d.bn}·경공 ${d.gn}개, 이름이 겹치지 않는다 (빠짐 ${d.miss}, 겹침 ${d.dup}, 공용과 겹침 ${d.lg})`,!d.miss.length&&!d.dup.length&&d.bn===d.n&&d.gn===d.n&&!d.lg.length);
  ok(`같은 등급은 특징 수·값이 같다 (어긋남 ${d.bad.slice(0,5)})`,!d.bad.length);
  ok(`단계 상한: 대문파·마교 절정, 중견·소문파 상승 ${JSON.stringify(d.top)}`,d.top.shaolin===3&&d.top.cheonma===3&&d.top.eon===2&&d.top.hwangbo===2);

  // 2. 가입하면 내 문파 것 입문 단계, 본산에는 내 문파 것만
  const j=await p.evaluate(()=>{P.sect='hwasan';P.srank={hwasan:0};P.merit={hwasan:0};giveStartSet(SECTS.hwasan);const bh=bobSectHtml(SECTS.hwasan),gh=ggSectHtml(SECTS.hwasan);
    return{bob:!!P.bob.B_hwasan_1,bcur:P.bcur,gk:!!P.gk.G_hwasan_1,gkcur:P.gkcur,bn:BOBS[P.bcur].n,gn:GGS[P.gkcur].n,bh:bh.includes('매화보')&&!bh.includes('유운보')&&!bh.includes('태극보'),gh:gh.includes('암향표')&&!gh.includes('제운종')}});
  ok(`화산파 입문: 보법 [${j.bn}]·경공 [${j.gn}]을 받아 쓴다, 본산 목록은 화산 것만`,j.bob&&j.gk&&j.bcur==='B_hwasan_1'&&j.gkcur==='G_hwasan_1'&&j.bh&&j.gh);
  const k=await p.evaluate(()=>{const a=bobBlock('B_mudang_1',1),b=bobBlock('B_hwasan_3',1),c=bobBlock('b_yuun',1),r0=bobBlock('B_hwasan_2',1);
    P.srank.hwasan=3;P.merit.hwasan=500;const ok2=learnBob('B_hwasan_2',1);P.ggm.G_hwasan_1=55;const okg=learnGg('G_hwasan_2',1);
    return{a,b,c,r0,ok2,lo:!!P.bob.B_hwasan_1,cur:P.bcur,merit:P.merit.hwasan,okg,glo:!!P.gk.G_hwasan_1,gm:P.ggm.G_hwasan_2,gcur:P.gkcur}});
  ok(`남의 문파 "${k.a}", 건너뛰기 "${k.b}", 옛 공용 "${k.c}", 직위 "${k.r0}"`,k.a==='무당파 제자만'&&k.b==='상승 단계부터'&&k.c==='문파에서 익히지 않는다'&&/이상/.test(k.r0));
  ok(`상승으로 올리면 중승은 지우고 공적 100, 경공 숙련 ${k.gm} 이어짐`,k.ok2&&!k.lo&&k.cur==='B_hwasan_2'&&k.merit===300&&k.okg&&!k.glo&&k.gm===55&&k.gcur==='G_hwasan_2');

  // 3. 특징 효과
  await p.evaluate(()=>{travel({to:'pv_henan',tx:24.5,ty:24.5})});await p.waitForTimeout(1500);
  const open=await p.evaluate(()=>{for(let j=6;j<N-6;j++)for(let i=6;i<N-6;i++){let f=true;for(let y=j-5;y<=j+5&&f;y++)for(let x=i-5;x<=i+5;x++)if(!walk(x,y)){f=false;break}if(f)return{x:i+.5,y:j+.5}}
    for(let y=14;y<=26;y++)for(let x=14;x<=26;x++){objs[y][x]=null;map[y][x].g=0}return{x:20.5,y:20.5}});
  const setup=o=>p.evaluate(o=>{mobs=[];P.x=o.x;P.y=o.y;P.leap=null;P.perch=null;P.z=0;P.qi=P.maxQi;P.target=null;P.fx=1;P.fy=0;P.buff.crit=0;P.inv=0;P.smCtr=null;P.ggSpd=null;joy.on=false},o);
  await setup(open);
  // 공동파 칠상보(직선): 과검·반격·허영
  const c1=await p.evaluate(()=>{P.bob.B_kongtong_2=1;P.bcur='B_kongtong_2';const w=mkMob('늑대',P.x+1.2,P.y);w.def=0;mobs.push(w);const h=w.hp,q=P.qi;bobeop();
    return{hit:h-w.hp,ctr:!!P.smCtr,inv:P.inv,base:BG.inv[2],q:q-P.qi,col:smLeapCol(P.leap)}});
  ok(`칠상보: 지나가며 늑대를 벤다(${c1.hit}), 반격 준비, 무적 ${c1.inv.toFixed(2)}>${c1.base}, 잔상은 공동파 색 ${c1.col}`,c1.hit>0&&c1.ctr&&c1.inv>c1.base&&c1.col&&c1.col!=='190,220,255');
  await p.waitForTimeout(400);
  const c2=await p.evaluate(()=>{const w=mobs[0];w.hp=w.maxHp;const c={X:null,e:w,m:1};runHooks('hit',c);return{m:c.m,left:P.smCtr}});
  ok(`반격: 다음 일격 배율 ${c2.m} (한 번만)`,Math.abs(c2.m-1.35)<1e-9&&!c2.left);
  // 천산파 빙하보(간파): 전박(둔화)·혜안(실패율)
  await setup(open);
  const c3=await p.evaluate(()=>{P.bob.B_cheonsan_2=1;P.bcur='B_cheonsan_2';const T=mkMob('늑대',P.x+1.6,P.y);T.fx=-1;T.fy=0;mobs.push(T);P.target=T;const r0=Math.random;Math.random=()=>.999;const r=bobeop();Math.random=r0;
    return{r,slow:T.slow,fail:bobFail(bobOf()),base:BG.fail[2]}});
  ok(`빙하보: 내려선 자리 늑대 둔화 ${c3.slow}초, 간파 실패 ${c3.base}% → ${c3.fail}%`,c3.r&&c3.slow>=2&&c3.fail===c3.base-10);
  // 아미파 연화보(간파): 절기 → 내공 덜 든다
  await setup(open);
  const c4=await p.evaluate(()=>{P.bob.B_emei_2=1;P.bcur='B_emei_2';const q=P.qi;bobeop();return{q:q-P.qi,base:BG.qi[2]}});
  ok(`연화보: 내공 ${c4.base} → ${c4.q}`,c4.q<c4.base);
  // 섬영보(점창, 직선): 원보 → 더 멀리, 추풍 → 이동속도
  await setup(open);
  const c5=await p.evaluate(()=>{P.bob.B_jeomchang_2=1;P.bcur='B_jeomchang_2';const x0=P.x;bobeop();const L=P.leap;return{d:L.ex-x0,base:BG.len[2],spd:!!P.ggSpd}});
  ok(`섬영보: ${c5.d.toFixed(2)}칸(기본 ${c5.base}), 보법 뒤 질주 ${c5.spd}`,c5.d>c5.base+.2&&c5.spd);
  await p.waitForTimeout(400);
  // 경공: 화산 암향표 상승 = 질주·무흔·비거리
  const c6=await p.evaluate(()=>{const g=ggOf();return{n:g.n,tr:g.tr.map(t=>t.k).join(','),len:ggLenMul()}});
  ok(`암향표(상승): 특징 ${c6.tr}, 비거리 ×${c6.len}`,c6.n==='암향표'&&c6.tr==='spd,hide,len'&&c6.len>1);

  // 4. 옛 저장 옮기기 (v8 → v9)
  const m=await p.evaluate(()=>{const mk=(sect,bob,bcur,gk,ggm,gkcur)=>({v:8,P:{sect,bob,bcur,gk,ggm,gkcur},G:{},notes:[]});
    const a=migrateSave(mk('hwasan',{b_basic:1,b_seom:1,b_yuun:1,b_neungpa:1},'b_yuun',{g_basic:1,g_cheongpung:1,g_jeun:1},{g_jeun:80},'g_jeun'));
    const e=migrateSave(mk('eon',{b_basic:1,b_neungpa:1,b_yuun:1},'b_neungpa',{g_basic:1,g_cheongpung:1},{},'g_cheongpung'));
    const n=migrateSave(mk(null,{b_basic:1,b_yuun:1},'b_yuun',{g_basic:1},{},'g_basic'));
    return{a:a.P,an:a.notes.join(' '),e:e.P,n:n.P}});
  ok(`화산(대문파): 유운보·능파미보 → 매화보 절정, 보허등운(숙련 80) → 암향표 상승: ${m.an}`,m.a.bob.B_hwasan_3&&!m.a.bob.b_yuun&&!m.a.bob.b_neungpa&&m.a.bob.b_seom&&m.a.bcur==='B_hwasan_3'&&m.a.gk.G_hwasan_2&&!m.a.gk.g_jeun&&m.a.ggm.G_hwasan_2===80&&m.a.gkcur==='G_hwasan_2'&&/매화보/.test(m.an));
  ok('진주언가(소문파): 상한 상승, 절정 능파미보는 남기고 쓰던 것도 그대로, 경공은 입문 단계로',m.e.bob.B_eon_2&&m.e.bob.b_neungpa&&!m.e.bob.b_yuun&&m.e.bcur==='b_neungpa'&&m.e.gk.G_eon_1&&m.e.gkcur==='G_eon_1');
  ok('문파 없는 저장은 그대로',m.n.bob.b_yuun&&m.n.bcur==='b_yuun'&&!Object.keys(m.n.bob).some(k=>k.startsWith('B_')));

  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

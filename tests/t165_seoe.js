// 세외오궁 (사용자 2026-11-11 "세외 5궁을 대문파로", "세외오궁은 정파 사파 어느 세력도 아니야", "장백파는 조선 문파, 주무기 검·권·도")
// 야수궁·북해빙궁·만독문·포달랍궁·장백파: 대문파 등급, 따로 떨어진 세력(외, 먼저 공격하지 않음, 천하대전 밖), 본산 4장, 무공 넷, 장백파 조선풍
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{window.reach=id=>{loadRegion(id);const R=REGION(),g0=R.gates.find(g=>g.y>37)||R.gates[0],seen=new Set(),q=[[Math.floor(g0.x),Math.min(NH-1,Math.floor(g0.y))]],K=(x,y)=>x+','+y;
      // 아래 출입구(맵 가장자리 칸은 막혀 있어도 된다)에서 걸어서 닿는 칸
      while(q.length){const[x,y]=q.pop();if(seen.has(K(x,y)))continue;seen.add(K(x,y));for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(walk(nx,ny)&&!seen.has(K(nx,ny)))q.push([nx,ny])}}
      const near=(fx,fy)=>{const x=Math.floor(fx),y=Math.floor(fy);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen.has(K(x+dx,y+dy)))return true;return false};
      const bad=[];for(const g of R.gates)if(!near(g.x,g.y))bad.push('문 '+g.label);for(const n of R.npcs||[])if(!near(n.x,n.y))bad.push('사람 '+n.n);return bad}});
  const F=['yasu','bukhae','mandok','podal','jangbaek'];
  // 1. 등급·세력·무공
  const r1=await p.evaluate(F=>F.map(sid=>{const s=SECTS[sid];return{sid,tier:s.tier,al:s.al,fac:alFac(s.al),tn:tierName(s),n:s.arts.length,
    g:s.arts.map(a=>artGrade(a.id)),side:ARTS[s.arts[0].id].side,pop:popBase(s),chain:(REGIONS[hqId(s)].chain||[]).length,sims:Object.values(SIM).filter(x=>x.sect===sid).length}}),F);
  ok(`대문파 등급·무공 넷(하승·절정·중승·상승)·본산 4장·심법 3단: ${JSON.stringify(r1.map(x=>[x.sid,x.tier,x.tn,x.g.join(''),x.chain,x.sims,x.pop]))}`,
    r1.every(x=>x.tier==='big'&&x.tn==='세외오궁'&&x.n===4&&x.g.join('')==='0312'&&x.chain===4&&x.sims===3&&x.pop===300));
  ok(`정·사 어느 쪽도 아님: ${r1.map(x=>x.al+'/'+x.fac+'/'+x.side).join(' ')}`,r1.every(x=>x.al==='seoe'&&x.fac==='외'&&x.side==null));
  const r2=await p.evaluate(()=>({foe:['정','사','마','관'].some(f=>facFoe(f,'외')||facFoe('외',f)),pow:FAC4.includes('외'),join:sideOk('seoe'),kind:FAC_KIND['외'],rank:SRANK.seoe.length,mis:SMIS.seoe.length}));
  ok(`먼저 싸우지 않고 천하대전 밖, 정파도 들 수 있다: ${JSON.stringify(r2)}`,!r2.foe&&!r2.pow&&r2.join&&r2.kind.length===2&&r2.rank===5&&r2.mis>=5);
  // 2. 장백파: 조선 무공·주무기 검, 기와·홍살문·장승·솟대·장독대·천지 못, 갓
  const r3=await p.evaluate(()=>{const s=SECTS.jangbaek,o={arts:s.arts.map(a=>a.n+':'+a.cls),start:startSet(s).w,forms:{},props:{},water:0,bad:[]};
    for(const id of REGIONS[hqId(s)].chain){o.bad.push(...reach(id).map(x=>id+':'+x));for(const q of builds)if(q.form)o.forms[q.form]=(o.forms[q.form]||0)+1;
      for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const k=objs[y][x];if(k&&PROP[k])o.props[k]=(o.props[k]||0)+1;if(id.endsWith('_back')&&map[y][x].g===2)o.water++}}
    o.gat=!!PAL[sectPal('jangbaek',2,'검')].gat;o.hb=PAL[sectPal('jangbaek',2,'검')].hairband;return o});
  ok(`장백파 조선풍: ${r3.arts.join(' ')} · 주무기 ${r3.start} · ${JSON.stringify(r3.forms)} ${JSON.stringify(r3.props)} · 천지 ${r3.water}칸 · 갓 ${r3.gat} · 막힘 ${r3.bad.join(',')||'없음'}`,
    r3.arts.join()==='조선세법:예,사신예도:예,현무신권:권,수박권:권'&&r3.start==='예'&&r3.forms.giwa>=10&&r3.forms.hongsal>=2&&r3.props.jangseung>=2&&r3.props.sotdae>=2&&r3.props.onggi>=2&&r3.water>=20&&r3.gat&&!r3.hb&&!r3.bad.length);
  // 3. 다른 넷: 특색 모양이 4장으로, 길이 다 닿고, 장문인·금고·입문 담당이 있다
  const r4=await p.evaluate(F=>{const o={};for(const sid of F){const s=SECTS[sid],H=REGIONS[hqId(s)],forms={},props={},bad=[];
      for(const id of H.chain){bad.push(...reach(id).map(x=>id+':'+x));for(const q of builds)if(q.form)forms[q.form]=(forms[q.form]||0)+1;for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const k=objs[y][x];if(k&&k!=='B')props[k]=(props[k]||0)+1}}
      const all=H.chain.flatMap(id=>(REGIONS[id].halls||[]).flatMap(h=>[...REGIONS[h.id].npcs,...(REGIONS[h.id].floorIds||[]).flatMap(f=>REGIONS[f].npcs)]));
      o[sid]={forms,props,bad,master:all.some(q=>q.hq===sid),vault:!!H.vaultAt,jigak:all.some(q=>q.jigak)}}return o},F);
  const s4=k=>`${k} ${JSON.stringify(r4[k].forms)} ${JSON.stringify(r4[k].props)}`;
  ok(`야수궁 통나무·우리 / 만독문 움막·독 항아리·흙담 / 포달랍궁 궁전·탑 / 북해빙궁 얼음: ${['yasu','mandok','podal','bukhae'].map(s4).join(' · ')}`,
    r4.yasu.forms.loghall>=1&&r4.yasu.forms.log>=4&&r4.yasu.props.cage>=8&&r4.yasu.props.pal>40&&r4.mandok.forms.hut>=8&&r4.mandok.props.gpot>=8&&r4.mandok.props.mudw>40&&r4.mandok.props.herbbed>=8
    &&r4.podal.forms.potala>=8&&r4.podal.props.stupa>=10&&r4.bukhae.props.icep>=20);
  ok(`다섯 본산 길·사람: ${F.map(k=>`${k} 장문인 ${r4[k].master} 금고 ${r4[k].vault} 입문 ${r4[k].jigak} 막힘 ${r4[k].bad.join(',')||'없음'}`).join(' · ')}`,F.every(k=>r4[k].master&&r4[k].vault&&r4[k].jigak&&!r4[k].bad.length));
  // 4. 세외 무인은 정파 주인공에게 먼저 덤비지 않는다
  const r5=await p.evaluate(()=>{loadRegion('hq_mandok');for(let i=0;i<6;i++)spawnTick();const ds=mobs.filter(m=>m.sect==='mandok');return{n:ds.length,kind:ds[0]&&ds[0].kind,peace:ds.every(m=>peaceful(m))}});
  ok(`만독문 제자 ${r5.n}명(${r5.kind})은 정파 주인공에게 평화`,r5.n>=3&&r5.peace);
  // 5. 옛 저장: 인원을 새 기준 비율로, 증축 기록 지움, 장백파 초식 칸 맞춤
  const r6=await p.evaluate(()=>{const d={v:10,G:{pop:{yasu:30,bukhae:150,podal:0,hwasan:280},popPrev:{yasu:30},slt:{yasu:'mid'},sbuild:{mandok:{t:'mid',y:3}}},P:{arts:{S_jangbaek_0:{p:40,f:[1,1,0,0,0,0,0]}},eq:{weapon:{slot:'weapon',cls:'검',name:'철검'}},bag:[{slot:'book',art:'S_jangbaek_1',form:9}]},notes:[]};
    const o=migrateSave(d);return{v:o.v,pop:o.G.pop,prev:o.G.popPrev,slt:o.G.slt.yasu,sb:o.G.sbuild.mandok,f:o.P.arts.S_jangbaek_0.f,flen:ARTS.S_jangbaek_0.forms.length,bk:o.P.bag[0].form,bkn:o.P.bag[0].name,blen:ARTS.S_jangbaek_1.forms.length,yd:o.P.bag.some(w=>w.slot==='weapon'&&w.cls==='예')&&o.notes.some(n=>/예도/.test(n))}});
  ok(`옛 저장 옮기기: ${JSON.stringify(r6)}`,r6.v>=11&&r6.pop.yasu===150&&r6.pop.bukhae===300&&r6.pop.podal===0&&r6.pop.hwasan===280&&r6.prev.yasu===150&&!r6.slt&&!r6.sb&&r6.f.length===r6.flen&&r6.f.filter(Boolean).length===2&&r6.bk<r6.blen&&/사신예도/.test(r6.bkn)&&r6.yd);
  // 6. 예도 (사용자 2026-11-11 "무기 타입에 조선의 예도를 추가해줘", "주력 무기는 예도와 권이야"): 새 병기 계열, 위력은 등급 예산 안, 특색은 사거리·방어·현묘도
  const r7=await p.evaluate(()=>{const C=CLASS.예,o={cls:CLS.includes('예'),wund:WU.cls.includes('예'),reach:C.reach,dreach:CLASS.도.reach,greach:CLASS.검.reach,ad:C.atk*C.def,
      basic:['정','사'].flatMap(s=>[0,1,2,3,4].map(i=>ARTS[s+'예'+i]&&ARTS[s+'예'+i].forms.length)),four:SECTS.jangbaek.arts[1].id,
      fn:ARTS.S_jangbaek_1.forms.map(f=>f.n).join(','),wn:WNAME.예,sabu:(SABU.jangbaek||[]).map(x=>x.cls)};
    const w=mkWeapon('예',1);P.eq.weapon=w;P.arts.정예0={p:0,f:[1,0,0,0,0]};P.cur='정예0';o.has=hasWeaponFor('예');o.hc=heroCls();o.blade=BLADE.names.예[0];return o});
  ok(`예도 계열: ${JSON.stringify(r7)}`,r7.cls&&r7.wund&&r7.reach>r7.dreach&&r7.reach>r7.greach&&r7.ad<=1&&r7.basic.every(n=>n>=2)&&/청룡/.test(r7.fn)&&/현무/.test(r7.fn)&&r7.wn==='예도'&&r7.has&&r7.hc==='도'&&r7.blade==='예기');
  // 사진: 장백파 본산·후산, 다섯 장문인 옷
  for(const[id,y]of[['hq_jangbaek',14],['hq_jangbaek_back',12]]){await p.evaluate(([id,y])=>{loadRegion(id);P.x=20.5;P.y=y;mobs.length=0},[id,y]);await p.waitForTimeout(500);await p.screenshot({path:__dirname+`/shots/t165_${id}.png`})}
  console.log(errs.length?'ERRORS\n'+errs.slice(0,6).join('\n'):'no errors');await b.close()})();

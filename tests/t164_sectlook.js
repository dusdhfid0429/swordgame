// 문파 특색 본산 (v248, 사용자 2026-11-11 "개방은 거지고 녹림은 산적인데 기존 다른 문파의 전각 형태야"): 갈래별 건물 형태·소품·목책·직함
// 개방 움막촌·녹림채 목책 산채가 새 모양으로 서고, 모든 출입구·문·사람에 길이 닿고, 장문인·금고·입문 담당이 제자리에 있다
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
  // 1. 개방·녹림채: 모든 맵에 새 형태 건물, 목책·흙담·소품, 길이 다 닿는다
  const r1=await p.evaluate(()=>{const o={};for(const sid of['gaebang','noklim']){const s=SECTS[sid],ids=REGIONS[hqId(s)].chain,forms={},props={},bad=[];
      for(const id of ids){bad.push(...reach(id).map(x=>id+':'+x));for(const b of builds)if(b.form)forms[b.form]=(forms[b.form]||0)+1;
        for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const k=objs[y][x];if(k&&PROP[k])props[k]=(props[k]||0)+1}}
      o[sid]={forms,props,bad,look:!!smLook(s)}}return o});
  const g=r1.gaebang,n=r1.noklim;
  ok(`개방 움막촌: 형태 ${JSON.stringify(g.forms)} 소품 ${JSON.stringify(g.props)} 막힘 ${g.bad.join(',')||'없음'}`,g.look&&g.forms.ruin>=2&&g.forms.hut>=4&&g.forms.shack>=3&&g.props.mudw>10&&g.props.fire&&g.props.pot&&!g.props.pal&&!g.bad.length);
  ok(`녹림채 목책 산채: 형태 ${JSON.stringify(n.forms)} 소품 ${JSON.stringify(n.props)} 막힘 ${n.bad.join(',')||'없음'}`,n.look&&n.forms.loghall===1&&n.forms.watch>=8&&n.forms.cave>=2&&n.forms.tentB>=3&&n.props.pal>60&&n.props.fire&&n.props.cage&&!n.bad.length);
  // 2. 사람: 장문인은 취의청(1층) 안, 금고는 동굴 창고, 입문은 군사/접인 장로, 위층 사람도 모임
  const r2=await p.evaluate(()=>{const o={};for(const sid of['gaebang','noklim']){const s=SECTS[sid],H=REGIONS[hqId(s)],main=H.halls[0],M=REGIONS[main.id],V=REGIONS[H.vaultAt];
      const all=[hqId(s),`hq_${sid}_outer`,`hq_${sid}_back`].flatMap(id=>(REGIONS[id].halls||[]).flatMap(h=>[...REGIONS[h.id].npcs,...(REGIONS[h.id].floorIds||[]).flatMap(f=>REGIONS[f].npcs)]));
      o[sid]={master:M.npcs.some(q=>q.hq===sid),floors:(M.floorIds||[]).length,tower:!!M.tower,vault:!!V&&V.npcs.some(q=>q.srole==='vguard'),vin:V&&V.name,jigak:(M.npcs.find(q=>q.jigak)||{}).n,
        lib:all.filter(q=>q.srole==='lib').length,elders:all.filter(q=>q.elder).length,names:all.map(q=>q.n)}}return o});
  ok(`개방 사람: 방주 사당 안 ${r2.gaebang.master}(층 ${r2.gaebang.floors}) · 금고 ${r2.gaebang.vin} ${r2.gaebang.vault} · 입문 ${r2.gaebang.jigak} · 타구당 ${r2.gaebang.lib} · 장로 ${r2.gaebang.elders}`,
    r2.gaebang.master&&!r2.gaebang.floors&&r2.gaebang.vault&&/접인 장로/.test(r2.gaebang.jigak)&&r2.gaebang.lib===2&&r2.gaebang.elders===2&&r2.gaebang.names.some(x=>/타구당주/.test(x)));
  ok(`녹림채 사람: 채주 취의청 안 ${r2.noklim.master}(층 ${r2.noklim.floors}) · 금고 ${r2.noklim.vin} ${r2.noklim.vault} · 입문 ${r2.noklim.jigak} · 비고 ${r2.noklim.lib} · 두령 ${r2.noklim.elders}`,
    r2.noklim.master&&!r2.noklim.floors&&r2.noklim.vault&&/군사/.test(r2.noklim.jigak)&&r2.noklim.lib===2&&r2.noklim.elders===2&&r2.noklim.names.some(x=>/대두령/.test(x)));
  // 3. 산문: 녹림채는 목책 한 줄·망루, 개방은 흙담·판자집. 다른 문파(화산·장강수로채)는 예전 그대로
  const r3=await p.evaluate(()=>{const row=id=>{loadRegion(id);const c=REGION().stage,ks={};for(let x=1;x<N-1;x++){const k=objs[c.wall][x];if(k)ks[k]=(ks[k]||0)+1}return{ks,tw:builds.filter(b=>b.y===c.wall-1).map(b=>b.form||'')}};
    const a=row('hq_noklim_gate'),c=row('hq_gaebang_gate'),d=row('hq_hwasan_gate');loadRegion('hq_hwasan');const hw=builds.some(b=>b.form),hm=REGIONS[REGIONS.hq_hwasan.halls[0].id];
    loadRegion('hq_janggang');const jg=builds.some(b=>b.form);return{a,c,d,hw,hwT:hm.tower&&hm.tower.n,jg,gb:reach('hq_noklim_gate'),gg:reach('hq_gaebang_gate')}});
  ok(`산문: 녹림 ${JSON.stringify(r3.a)} 개방 ${JSON.stringify(r3.c)} 화산 ${JSON.stringify(r3.d)} · 화산 본산 새 형태 없음 ${!r3.hw} 장문전 ${r3.hwT}층 · 장강수로채 그대로 ${!r3.jg} · 막힘 ${[...r3.gb,...r3.gg].join(',')||'없음'}`,
    r3.a.ks.pal>20&&r3.a.tw.every(f=>f==='watch')&&r3.c.ks.mudw>20&&r3.c.tw.every(f=>f==='shack')&&r3.d.ks.rock>20&&r3.d.tw.every(f=>!f)&&!r3.hw&&r3.hwT===3&&!r3.jg&&!r3.gb.length&&!r3.gg.length);
  // 4. 그리기: 형태마다 오류 없이 그려지고 캐시 상자 안에 든다, 멸문 폐허에서도
  const r4=await p.evaluate(async()=>{const out=[];for(const id of['hq_noklim','hq_noklim_outer','hq_gaebang','hq_gaebang_outer']){enterRegion(id,20.5,14);await new Promise(r=>setTimeout(r,250));for(const b of builds)if(b.form){try{drawBuild(b,1)}catch(e){out.push(id+' '+b.form+' '+e.message)}}}
    const s=SECTS.noklim;REGIONS.hq_noklim.dead=1;enterRegion('hq_noklim',20.5,14);await new Promise(r=>setTimeout(r,250));delete REGIONS.hq_noklim.dead;return out});
  ok(`형태 그리기 오류 ${r4.join(',')||'없음'}`,!r4.length);
  // 5. 증축·되돌림: 규모가 바뀌어도 갈래 모양을 따른다 (중견 틀)
  const r5=await p.evaluate(()=>{const s=SECTS.heukpung,f0=(loadRegion(hqId(s)),builds.some(b=>b.form));G.slt={heukpung:'mid'};sgSync(true);const id=hqId(s);loadRegion(id);const f=builds.filter(b=>b.form).map(b=>b.form),bad=reach(id),gate=REGIONS[`hq_heukpung_gate`];
    let gk=null;if(gate){loadRegion(gate.stage?`hq_heukpung_gate`:id);gk=REGION().stage&&REGION().stage.wallK}G.slt={};sgSync(true);loadRegion(hqId(s));return{f0,f,bad,gk,lt:s.lt||null,back:builds.some(b=>b.form)}});
  ok(`흑풍채(소문파) 증축 → 중견: 처음 새 형태 ${r5.f0} → ${r5.f.join(',')} 산문 ${r5.gk} 막힘 ${r5.bad.join(',')||'없음'} · 되돌리면 ${r5.lt} ${r5.back}`,!r5.f0&&r5.f.includes('loghall')&&r5.f.includes('cave')&&r5.gk==='pal'&&!r5.bad.length&&!r5.lt&&!r5.back);
  await p.evaluate(()=>{enterRegion('hq_noklim',20.5,13)});await p.waitForTimeout(800);await p.screenshot({path:require('path').resolve(__dirname,'shots/t160_noklim.png')}).catch(()=>{});
  console.log(errs.length?'ERRORS\n'+errs.slice(0,8).join('\n'):'오류 없음');await b.close()})();

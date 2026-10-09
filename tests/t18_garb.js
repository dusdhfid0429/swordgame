// 문파 상징과 의복: 문파마다 마크와 옷, 직위마다 다른 옷, 가입하면 내 캐릭터도 문파 옷
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const S=Object.values(SECTS),miss=S.filter(s=>!LOOK[s.id]||!embCanvas(s.id)).map(s=>s.n);
    const sig=new Set(S.map(s=>{const L=lookOf(s.id);return L.glyph+L.shape+L.accent})),robes=new Set(S.map(s=>LOOK[s.id][2]));
    const pals=[0,1,2,3,4].map(r=>PAL[sectPal('hwasan',r,'검',{master:r===4})]);
    return{miss,uniq:sig.size,robes:robes.size,n:S.length,cape:pals.map(q=>q.capeLen||0).join(''),plain:pals[0].robe[0]!==pals[1].robe[0]&&!pals[0].hairband&&!!pals[1].hairband,emb:!pals[1].emb&&pals[2].emb==='hwasan',edge:!pals[2].capeEdge&&!!pals[4].capeEdge,master:pals[4].beard===1}});
  ok(`문파 ${r.n}곳 모두 마크가 있다 ${r.miss.join(',')}`,!r.miss.length);ok(`마크(글자·모양·색) ${r.uniq}가지가 모두 다르다, 옷 색 ${r.robes}가지`,r.uniq===r.n&&r.robes>=45);
  ok(`직위별 옷: 망토 길이 ${r.cape} (속가·정식 없음 → 일대 어깨 → 호법 허리 → 장로 땅까지)`,r.cape==='00123');
  ok('속가제자는 누른 색 수련복, 정식제자부터 문파 색과 머리끈',r.plain);ok('일대제자부터 망토에 문파 마크, 호법부터 금테, 장로는 수염',r.emb&&r.edge&&r.master);
  // 마크 모음
  await p.evaluate(()=>{const d=document.createElement('div');d.id='embs';d.style.cssText='position:fixed;inset:0;z-index:99;background:#1a1612;color:#e8dcc0;padding:8px;display:flex;flex-wrap:wrap;gap:4px;align-content:flex-start;font:11px sans-serif;overflow:auto';
    d.innerHTML=Object.values(SECTS).map(s=>`<div style="width:70px;text-align:center"><img src="${embUrl(s.id)}" width="44" height="44"><br>${s.n}</div>`).join('');document.body.appendChild(d)});
  await p.waitForTimeout(300);await p.screenshot({path:shot('garb_emblems')});await p.evaluate(()=>$('embs').remove());
  // 무인 몹: 문파 옷과 직위 이름
  const m=await p.evaluate(()=>{mobs=[];const a=[];for(let i=0;i<30;i++)a.push(mkFac('정',i%3===0,20,20,'hwasan'));
    return{names:[...new Set(a.map(e=>e.name.split(' ')[1]))].join('·'),pal:a.every(e=>e.pal.startsWith('garb_hwasan_')),rk:a.every(e=>e.d.elite?e.rank>=2:e.rank<=1)}});
  ok(`화산파 무인 이름에 직위: ${m.names}, 옷이 화산파 옷`,m.pal&&m.rk&&m.names.includes('정식제자'));
  // 가입: 본산 장문인에게 청하면 내 옷이 바뀐다
  await p.evaluate(()=>{travel({to:'hq_hwasan',tx:20.5,ty:10.5})});await p.waitForTimeout(1800);
  const before=await p.evaluate(()=>heroGarb());
  await p.evaluate(()=>{const n=hqNpc(REG);P.x=n.x+.8;P.y=n.y+.6;P.path=null;openNpc(n)});await p.waitForTimeout(400);
  const hasPrev=await p.evaluate(()=>!!document.querySelector('.garbprev')&&document.querySelector('.garbprev').naturalWidth===680);
  ok('본산 문파 창에 마크와 직위별 의복 미리보기',hasPrev);
  await p.screenshot({path:shot('garb_panel')});
  await p.waitForSelector('[data-act="sjoin:hwasan"]',{timeout:5000}).catch(()=>{});await p.evaluate(()=>{const b=document.querySelector('[data-act="sjoin:hwasan"]');b&&b.click()});await p.waitForTimeout(400);
  const g0=await p.evaluate(()=>{closePanels();const g=heroGarb();return{sect:P.sect,ok:!!g,rank:g&&g.rank,cape:g&&g.pal.capeLen,log:$('log').textContent.includes('수련복')}});
  ok(`가입 전엔 기본 옷(${before===null}), 가입하면 화산파 ${g0.rank}단계 옷`,before===null&&g0.sect==='hwasan'&&g0.ok&&g0.rank===0&&g0.cape===0&&g0.log);
  const pix=await p.evaluate(()=>{const g=heroGarb(),c=g.hero.getContext('2d').getImageData(0,0,95,155).data,h=document.createElement('canvas');h.width=95;h.height=155;const x=h.getContext('2d');x.drawImage(HERO,0,0);const o=x.getImageData(0,0,95,155).data;let d=0,same=0;for(let i=0;i<o.length;i+=4){if(o[i+3]<20)continue;if(o[i]!==c[i]||o[i+2]!==c[i+2])d++;else same++}return{d,same}});
  ok(`내 캐릭터 도트 그림의 겉옷 픽셀 ${pix.d}개가 문파 색, ${pix.same}개(얼굴·머리·흰 속옷)는 그대로`,pix.d>1500&&pix.same>1500);
  const shots=[];for(const[mt,nm]of[[0,'속가'],[60,'정식'],[180,'일대'],[400,'호법'],[800,'장로']]){
    await p.evaluate(mt=>{P.mtot.hwasan=mt;P.x=20.5;P.y=13.5;P.fx=1;P.fy=0;P.path=null;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y},mt);await p.waitForTimeout(250);
    const st=await p.evaluate(()=>{const g=heroGarb();return g.rank+':'+g.pal.capeLen});shots.push(st);
    await p.screenshot({path:shot('garb_hero_'+nm),clip:{x:120,y:250,width:150,height:260}})}
  ok(`직위가 오르면 내 옷도 바뀐다 (직위:망토) ${shots.join(' ')}`,shots.join(' ')==='0:0 1:0 2:1 3:2 4:3');
  const fl=await p.evaluate(()=>{let n=0;for(const r of objs)for(const o of r)if(o==='flag:hwasan')n++;return n});
  ok(`화산파 본산에 깃발 ${fl}개`,fl>=3);
  await p.evaluate(()=>{P.x=20.5;P.y=19.5;const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;for(let i=0;i<3;i++)spawnTick()});await p.waitForTimeout(600);await p.screenshot({path:shot('garb_hq')});
  // 하산하면 기본 옷
  const left=await p.evaluate(()=>{P.sect=null;return heroGarb()===null});ok('하산하면 기본 옷으로',left);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

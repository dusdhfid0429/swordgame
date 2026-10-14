// 오대세가(남궁·사천당가·하북팽가·모용·제갈)는 대문파 등급: 무공 등급·맵 4장·무공 3개·본산 인원 (2026-10-12 사용자 요청)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  const r=await p.evaluate(()=>FIVE.map(id=>{const s=SECTS[id],hi=s.arts.find(a=>a.hi),lo=s.arts.filter(a=>!a.hi);
    const maps=['_gate','_outer','','_back'].map(k=>REGIONS['hq_'+id+k]).filter(Boolean).length;
    const own=REGIONS['hq_'+id].spawns.filter(sp=>/무인|고수/.test(sp[0])&&sp[2]===inHQ).reduce((t,sp)=>t+sp[1],0);
    return {id,n:s.n,tier:s.tier,name:tierName(s),hiG:ARTS[hi.id].grade,loG:lo.map(a=>ARTS[a.id].grade),arts:s.arts.length,maps,own,base:sectStanding('jeong',s)>=300}}));
  console.log(r.map(x=>`${x.n} ${x.name} 무공${x.arts}(고급 ${AGRN(x.hiG)}·일반 ${x.loG.join('/')}) 맵${x.maps} 인원${x.own}`).join('\n'));
  function AGRN(g){return g}
  ok('오대세가 다섯은 대문파 등급으로 표시된다',r.length===5&&r.every(x=>x.tier==='big'&&x.name==='오대세가'));
  ok('무공 셋(입문공 하승·일반 상승·고급 절정), 맵 4장(산문·외원·본산·후산), 본산 인원 9, 입지 기본 300',r.every(x=>x.arts===3&&x.hiG===3&&x.loG.slice().sort().join()==='0,2'&&x.maps===4&&x.own===9&&x.base));
  const mid=await p.evaluate(()=>{const s=SECTS.hwangbo;return {tier:s.tier,own:REGIONS.hq_hwangbo.spawns.filter(sp=>/무인|고수/.test(sp[0])&&sp[2]===inHQ).reduce((t,sp)=>t+sp[1],0),maps:['_gate',''].map(k=>REGIONS['hq_hwangbo'+k]).filter(Boolean).length}});
  ok(`황보세가는 그대로 중견: 인원 ${mid.own}, 맵 ${mid.maps}`,mid.tier==='mid'&&mid.own===6&&mid.maps===2);
  const dlg=await p.evaluate(()=>{openPanel('npc',NPCS.find(n=>n.id==='jeong'));const t=document.body.innerText;const i=t.indexOf('9파1방'),j=t.indexOf('오대세가'),k=t.indexOf('중견문파');return {i,j,k,nam:t.indexOf('남궁세가')}});
  ok(`연락관 창: 9파1방 → 오대세가(남궁세가 포함) → 중견문파 순`,dlg.i>=0&&dlg.j>dlg.i&&dlg.k>dlg.j&&dlg.nam>dlg.j&&dlg.nam<dlg.k);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

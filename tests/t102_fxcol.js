// v169: 무공 특성 색 — 주색은 심법 색 + 무공 특성 물들임, 보조색은 무공 특성 색, 창안 무공은 재료 특성을 물려받는다 (g_fxcol.js, data/fxcolor.json)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:1280,height:760}});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{
    const L=Object.values(ARTS),trs=L.map(a=>artTr(a));
    const allTr=trs.every(t=>t.length>=1&&t.length<=FX_MIX.max&&t.every(k=>FX_TR[k]));
    const named=L.filter(a=>!artTr(a).includes(FX_TR_CLS[a.cls])||trOfName(a.n,a.cls).length>1).length/L.length;
    const nm=n=>trOfName(n,'검').join('+');
    const ex={매화:nm('이십사수매화검'),혈월:trOfName('혈월광랑도','도').join('+'),청풍:nm('청풍검법'),천마:nm('천마검법')};
    // 색 다양성: 같은 심법(지금 내 심법)으로 쓰는 무공들의 주색 가짓수
    const mine=L.filter(a=>!a.sect),mains=new Set(mine.map(a=>a.c)),subs=new Set(L.map(a=>a.c2));
    // 섞기는 회색으로 탁해지지 않는다: 빨강+파랑 중간의 채도
    const mid=toLch(mixCol('230,35,55','70,165,255',.5)),rgbAvg=toLch('150,100,155');
    // 마기: 주색은 검게 그대로, 심지는 보랏빛에 보조색이 섞인다
    const dark='28,6,40',art=L.find(a=>artTr(a)[0]==='꽃'),hiD=hiOf(dark,art.c2),hiL=hiOf('235,240,250',art.c2);
    // 그리기: 초식을 쓰면 효과에 c2 가 붙고 잔광·투사체 꼬리가 보조색
    const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&!ARTS[k].base&&!ARTS[k].sect),X=mkX(id);X.t=2;
    const e=mkMob('목인장',P.x+1,P.y,{hp:999,atk:0,def:0,hm:0,sp:0,pal:'villager'});mobs.push(e);
    fx=[];projs=[];exec({p:'arc',rad:1.5,spread:1.6,m:.1,hits:1},e,X);for(let i=0;i<6;i++)update(.03);
    const glow=fx.filter(f=>f.glow&&f.t==='arc'),c2ok=glow.length&&glow.every(f=>f.c2===ARTS[id].c2),after=glow.some(f=>f.col===ARTS[id].c2);
    exec({p:'proj',cnt:1,spd:6,len:5,m:.1},e,X);const pj=projs[0]&&projs[0].c2===ARTS[id].c2;for(let i=0;i<10;i++){update(.03);draw()}
    return{allTr,named,ex,mains:mains.size,subs:subs.size,midC:mid[1],avgC:rgbAvg[1],hiD,hiL,c2ok,after,pj,main:ARTS[id].c,base:fxCol(ARTS[id]),c2:ARTS[id].c2}});
  ok(`모든 무공에 특성 1~${2}개 (이름에서 찾은 비율 ${(r.named*100).toFixed(0)}%)`,r.allTr&&r.named>.6);
  ok(`이름 특성: 이십사수매화검=${r.ex.매화}, 혈월광랑도=${r.ex.혈월}, 청풍검법=${r.ex.청풍}, 천마검법=${r.ex.천마}`,r.ex.매화==='꽃'&&r.ex.혈월==='월+혈'&&r.ex.청풍==='풍');
  ok(`같은 심법이라도 주색 ${r.mains}가지, 보조색 ${r.subs}가지`,r.mains>=15&&r.subs>=20);
  ok(`OKLCH 섞기는 채도를 지킨다 (${r.midC.toFixed(3)} > RGB 평균 ${r.avgC.toFixed(3)})`,r.midC>r.avgC);
  ok(`주색 ${r.main} = 심법 ${r.base} 에 보조색 ${r.c2} 물들임`,r.main!==r.base&&r.main!==r.c2);
  ok(`마기 심지 ${r.hiD} (보랏빛+꽃), 밝은 심지 ${r.hiL}`,r.hiD!=='150,40,190'&&r.hiL!=='255,255,255');
  ok(`초식 효과에 보조색 ${r.c2ok}, 2단계 잔광은 보조색 ${r.after}, 투사체 ${r.pj}`,r.c2ok&&r.after&&r.pj);
  // 창안: 재료 다섯 무공의 특성을 세어 물려받는다
  const m=await p.evaluate(()=>{window.__noPrompt=1;
    const ids=Object.keys(ARTS).filter(k=>ARTS[k].cls==='검'&&!ARTS[k].sect&&!ARTS[k].gy&&!ARTS[k].base&&(ARTS[k].grade||0)===0).slice(0,5);
    for(const id of ids)P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};
    const want=trOfSrc(ids),a=mkCreate({ids,g:0,cls:'검'}),def=G.made[a.id];
    const saved=JSON.parse(JSON.stringify(def));delete saved.tr;delete ARTS[a.id];const b2=mkBuild(saved);
    return{want,tr:artTr(a),def:def.tr,re:artTr(b2),c2:a.c2,srcTr:ids.map(i=>artTr(ARTS[i]).join('+'))}});
  ok(`창안 무공 특성 ${m.tr} = 재료(${m.srcTr.join(', ')})에서 센 것 ${m.want}, 저장 ${m.def}`,m.tr.join()===m.want.join()&&m.def.join()===m.want.join()&&m.want.length>=1);
  ok(`예전 저장(특성 없음)도 재료에서 다시 센다 ${m.re}`,m.re.join()===m.want.join());
  await p.evaluate(()=>{openPanel&&openPanel('arts')}).catch(()=>{});
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

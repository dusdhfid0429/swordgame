// v249 무공 위력 위계 (g_artbal.js): 숙련 덤 1.3배, 무공별·경지별 보정값, 내 투사체도 hit 훅을 탄다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];paused=true});
  const m=await p.evaluate(()=>{const id=Object.keys(ARTS).find(k=>!ARTS[k].base&&ARTS[k].cls==='검');P.arts[id]={p:0,f:[true],ws:1};const a=mkX(id).mul;P.arts[id].p=30;const b=mkX(id).mul;P.arts[id].p=100;const c=mkX(id).mul;return{a,b,c}});
  ok(`숙련 덤: 0에서 ${m.a.toFixed(3)}, 30에서 ${m.b.toFixed(3)} (예전 1.3), 극성 ${m.c.toFixed(3)}, 극성/0 = ${(m.c/m.a).toFixed(2)}`,Math.abs(m.b-1.3)<.01&&Math.abs(m.c/m.a-1.3)<.001);
  const k=await p.evaluate(()=>{const ids=Object.keys(ARTS).filter(k=>{const a=ARTS[k];return !a.base&&!a.made&&a.forms&&a.forms.length&&CLASS[a.cls]});const miss=ids.filter(i=>!ARTK[i]||ARTK[i].length!==7);
    const all=ids.flatMap(i=>ARTK[i]||[]);P.realm=4;const id=ids[0],k4=artK(id);P.realm=1;const k1=artK(id);ARTK_OFF=true;const off=artK(id);ARTK_OFF=false;
    return{n:ids.length,miss:miss.length,min:Math.min(...all),max:Math.max(...all),k4,k1,w4:ARTK[id][4],w1:ARTK[id][1],off,base:artK('base'),fb:ARTBAL.fb.length}});
  ok(`무공 ${k.n}개 모두 경지 7칸 보정값 (빠진 것 ${k.miss}), 범위 ${k.min}~${k.max}, 경지 따라 고름 ${k.k1}/${k.k4}, 기본 무공 ${k.base}`,k.n>600&&k.miss===0&&k.min>=.3&&k.max<=3&&k.k4===k.w4&&k.k1===k.w1&&k.off===1&&k.base===1&&k.fb===7);
  const f=await p.evaluate(()=>{const id='__t';ARTS[id]={...ARTS[Object.keys(ARTS).find(k=>!ARTS[k].base&&ARTS[k].cls==='창')],id,made:1,grade:2};P.realm=3;const v=artK(id),w=ARTBAL.fb[3].창[2];delete ARTS[id];return{v,w}});
  ok(`잰 적 없는 창안 무공은 같은 병기·등급 가운데 값 ${f.v}`,f.v===f.w&&f.v>0);
  // 내 투사체도 경지 차·이해도·보정값을 받는다
  const h=await p.evaluate(()=>{const id=Object.keys(ARTK).find(k=>ARTS[k]&&ARTS[k].cls==='검'&&Math.abs(ARTK[k][0]-1)>.1);P.realm=0;P.arts[id]={p:50,f:ARTS[id].forms.map(()=>true),ws:1};P.cur=id;P.wu={검:wuCap()};recalc();
    const mk=()=>({x:P.x+1,y:P.y,hp:1e9,maxHp:1e9,def:0,hm:-999,d:{},burn:0,realm:0});const R=Math.random;Math.random=()=>.5;const X=mkX(id);
    const e1=mk();hitE(X,e1,1);const melee=1e9-e1.hp;const e2=mk();hitE(X,e2,1,0,0,{x:P.x-1,y:P.y});const proj=1e9-e2.hp;
    ARTK_OFF=true;const e3=mk();hitE(X,e3,1,0,0,{x:P.x-1,y:P.y});const raw=1e9-e3.hp;ARTK_OFF=false;
    let done=0;hook('hitDone',()=>done++);const e4=mk();hitE(X,e4,1,0,0,{x:P.x-1,y:P.y});const foe=mk();foe.d={n:'적'};const e5=mk();hitE(X,e5,1,0,0,foe);Math.random=R;
    return{melee,proj,raw,k:ARTK[id][0],done}});
  ok(`같은 한 방: 근접 ${h.melee} = 투사체 ${h.proj}, 보정값 ${h.k} 없이는 ${h.raw}. 내 투사체만 hitDone (${h.done})`,h.melee===h.proj&&Math.abs(h.proj/h.raw-h.k)<.03&&h.done===1);
  if(errs.length){console.log('ERRORS');errs.slice(0,8).forEach(e=>console.log(' ',e))}
  await b.close();process.exit(0)})();

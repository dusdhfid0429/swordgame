// v165: 무공 이펙트에 심법 속성 재질을 덧입힌다 (r_elfx.js, data/elfx.json EL_FX)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:1280,height:760}});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{
    const els=Object.keys(EL_FX),all=Object.keys(EL).every(k=>EL_FX[k]);
    const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&!ARTS[k].base),X=mkX(id);const e=mkMob('목인장',P.x+1,P.y,{hp:999,atk:0,def:0,hm:0,sp:0,pal:'villager'});mobs.push(e);
    const kinds={};let none=0;
    for(const el of els){fx=[];elFx({t:'arc',x:P.x,y:P.y,ang:0,r:1.2,spread:1.6,flip:0,life:.3,max:.3},X,el);elFx({t:'bolt',x:e.x,y:e.y,s:1,life:.5,max:.5},X,el);
      const L=fx.filter(f=>f.t==='el');kinds[el]=[...new Set(L.flatMap(f=>f.ps.map(q=>q.k)))].join('+');for(let i=0;i<40;i++){time+=.02;for(const f of fx)f.life-=.02;draw()}}
    // 실제 초식: GL 이 glFx 훅을 불러 재질이 붙고, X 없는 효과(경지 등)에는 붙지 않는다
    fx=[];exec({p:'circle',rad:1.5,m:.1,hits:1},e,X);for(let i=0;i<10;i++)update(.03);const viaGL=fx.some(f=>f.t==='el');
    fx=[];GL({t:'ring2',x:P.x,y:P.y,r:1,col:'255,255,255',w:3,life:.3});const plain=!fx.some(f=>f.t==='el');
    // 투사체는 날아가며 꼬리를 남긴다
    fx=[];projs=[];exec({p:'proj',cnt:1,spd:6,len:5,m:.1},e,X);for(let i=0;i<8;i++)update(.03);const trail=fx.some(f=>f.t==='el');
    // 같은 무공을 다시 쓰면 앞 시전의 이펙트는 흐려지며 빨리 거둔다, 다른 무공 이펙트는 그대로
    fx=[];const X1=mkX(id),X2=mkX(id),oid=Object.keys(ARTS).find(k=>k!==id&&ARTS[k].cls==='검'&&!ARTS[k].base),XO=mkX(oid);
    fArc(X1,1.2,1.6,'255,255,255',4,.3);fArc(XO,1.2,1.6,'255,255,255',4,.3);const nA=fx.length;fArc(X2,1.2,1.6,'255,255,255',4,.3);
    const old1=fx.filter(f=>f.cx===X1),oth=fx.filter(f=>f.cx===XO),fresh=fx.filter(f=>f.cx===X2);
    const fade=old1.length>0&&old1.every(f=>f.old&&f.life<=FX_OLD.life)&&oth.every(f=>!f.old)&&fresh.every(f=>!f.old)&&nA>0;
    // 재질 입자가 많으면 하나하나를 흐리게
    fx=[];for(let i=0;i<20;i++)elFx({t:'arc',x:P.x,y:P.y,ang:0,r:1.2,spread:1.6,flip:0,life:.3,max:.3},X,'화');time+=.001;const dk=elDense();
    return{n:els.length,all,kinds,viaGL,plain,trail,fade,dk}});
  ok(`속성 ${r.n}가지 모두 재질이 있다`,r.all&&r.n>=9);
  ok(`속성마다 다른 재질: ${Object.entries(r.kinds).map(([k,v])=>k+' '+v).join(', ')}`,new Set(Object.values(r.kinds)).size===r.n);
  ok(`화는 불, 수는 물, 뇌는 번개`,/flame/.test(r.kinds['화'])&&/drop/.test(r.kinds['수'])&&/spark/.test(r.kinds['뇌']));
  ok(`초식을 쓰면 재질이 붙는다 ${r.viaGL}, 무공 아닌 효과에는 안 붙는다 ${r.plain}, 투사체 꼬리 ${r.trail}`,r.viaGL&&r.plain&&r.trail);
  ok(`같은 무공을 이어 쓰면 앞 시전 이펙트는 흐려져 빨리 사라지고 다른 무공은 그대로 ${r.fade}`,r.fade);
  ok(`재질 입자가 몰리면 흐리게 그린다 (${r.dk.toFixed(2)})`,r.dk<.6);
  await p.screenshot({path:__dirname+'/shots/elfx.png'});
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

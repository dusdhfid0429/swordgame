// 마교 마기 (2026-10-14): 천마 심법은 오행·음양 대신 '마' 속성, 이펙트·운기조식은 검은 계열(보통 합성), 글자는 보랏빛
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:사"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(300);
  const t=await p.evaluate(()=>{const cm=Object.values(SIM).filter(x=>x.sect==='cheonma');P.sims={N_cheonma_1:1,N_cheonma_4:1};P.sim='N_cheonma_4';const a=ARTS[P.cur];
    return{n:cm.length,allMa:cm.every(x=>x.el==='마'&&x.sc==='마공'),el:pEl(),sc:pSchool(),c:a.c,dark:isDark(a.c),ct:a.ct,elc:a.elc,fx:EL['마'].fx,beats:[elMul('마','양'),elMul('양','마'),elMul('마','금'),elMul('마','마'),elMul('마',null),elMul('마','금','마공','불가'),elMul('금','마','불가','마공'),elMul('마','금','마공','도가')],html:simElHtml(simCur())}});
  ok(`천마 심법 ${t.n}개 모두 마공·마 ${t.allMa}, 운용 중 ${t.sc}/${t.el}, 무공 색 ${t.c} (어두움 ${t.dark}), 글자색 ${t.ct}, 뇌기 ${t.elc}, 상극 ${t.beats.join(',')}`,t.allMa&&t.el==='마'&&t.sc==='마공'&&t.c==='28,6,40'&&t.dark&&t.ct==='150,40,190'&&t.elc===false&&t.beats.join()==='1.3,0.8,1.3,1,1,0.8,1.3,1.3'&&t.html.includes('150,40,190'));
  // 적중: 느려짐 + 생명·내공 흡수
  const h=await p.evaluate(()=>{const e={x:P.x+1,y:P.y,hp:5000,maxHp:5000,def:0,hm:0,el:null,burn:0,slow:0,d:{},isMob:true};P.hp=10;P.qi=10;P.maxHp=200;P.maxQi=200;const X=mkX(P.cur);window._rnd=Math.random;Math.random=()=>.5;hitE(X,e,1,0,0);Math.random=window._rnd;
    return{slow:e.slow,d:5000-e.hp,hp:P.hp,qi:P.qi}});
  ok(`마기 적중: 느려짐 ${h.slow}초, 피해 ${h.d}, 생명 10→${h.hp.toFixed(1)} (흡혈 특색 포함), 내공 10→${h.qi.toFixed(1)}`,h.slow===1.5&&h.d>0&&h.hp-10>=h.d*.08-.01&&Math.abs(h.qi-10-h.d*.08)<.01);
  // 그리기: 초식·운기조식이 오류 없이 어두운 합성으로 그려진다
  const d=await p.evaluate(()=>{const e=mkMob('늑대',P.x+1,P.y);mobs.push(e);P.target=e;P.hp=P.maxHp;P.qi=P.maxQi;P.inv=9;const X=mkX(P.cur);fArc(X,1.05,1.4,ARTS[P.cur].c,2.5,.5);fx.push({t:'bolt',x:P.x,y:P.y,life:.5,max:.5,col:ARTS[P.cur].c,glow:true});
    let modes=[];const o=ctx.drawImage.bind(ctx);const orig=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'globalCompositeOperation');
    mobs=[];P.target=null;P.path=null;P.hp=P.maxHp;P.medit=true;for(let i=0;i<6;i++){update(.05);draw()}const dk=fx.filter(f=>f.glow&&isDark(f.col)).length;P.medit=false;return{dk,medK:MED.k>0}});
  ok(`어두운 글로우 이펙트 ${d.dk}개, 운기조식 그려짐 ${d.medK}, 오류 ${errs.length}`,d.dk>0&&d.medK&&errs.length===0);
  await p.evaluate(()=>{const t=iso(P.x,P.y);cam.x=t.x;cam.y=t.y;P.medit=true});await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/shots/magi_medit.png'});
  await p.evaluate(()=>{P.medit=false;P.qi=P.maxQi;const X=mkX(P.cur);fx.push({t:'spin',x:P.x,y:P.y,r:1.6,w:3,life:.6,max:.6,col:ARTS[P.cur].c,glow:true});fx.push({t:'bolt',x:P.x+1,y:P.y,life:.6,max:.6,col:ARTS[P.cur].c,glow:true,s:1})});await p.waitForTimeout(120);await p.screenshot({path:__dirname+'/shots/magi_fx.png'});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

// v224 개선 계획 5절 (동훈님 2026-11-01): 별호 · 은원 장부 · 대결 전 한마디 · 마당 사건 · 오의 외치기 · 병기 타격음
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{P.hp=P.maxHp=99999;for(const m of mobs)m.hp=0;mobs=[];window.mk=(k,dx)=>{const e=mkMob(k,P.x+dx,P.y);mobs.push(e);return e}});
  // 1. 별호: 명성·우두머리가 모자라면 없고, 채우면 병기·업보에 맞는 이름
  let r=await p.evaluate(()=>{const a=byhOf();P.fame=BYH.fame;P.bosses=BYH.bosses;P.kc={도:9,검:2};P.good=P.evil=0;const mid=byhOf();P.good=200;const good=byhOf();P.good=0;P.evil=200;const evil=byhOf();P.evil=0;
    byhCheck();return{a,mid,good,evil,byh:P.byh}});
  ok(`별호 없음 '${r.a}' → 도객 '${r.mid}', 협 '${r.good}', 흉 '${r.evil}', 붙음 '${r.byh}'`,r.a===''&&/도객$/.test(r.mid)&&/협객$/.test(r.good)&&/흉수$/.test(r.evil)&&r.byh===r.mid);
  // 2. 은원 장부: 정예를 쓰러뜨리면 적히고 인물창에 보인다
  r=await p.evaluate(()=>{const e=mk('산적두목',1.2);e.hp=1;e.aggro=true;hitE(mkX(P.cur,1),e,1,0,0);if(e.hp>0){e.hp=0;onKill(e)}
    ewAdd('save',null,'표물 행렬');openPanel('char');act('wtab:char:1');const c=document.querySelector('.ewc');return{n:(P.ew||[]).length,k:P.ew.map(r=>r.k).join(),t:c&&c.textContent}});
  ok(`은원 장부 ${r.n}줄 (${r.k}), 인물창 카드 '${(r.t||'').slice(0,40)}'`,r.n>=2&&r.k.includes('kill')&&r.k.includes('save')&&/산적두목/.test(r.t)&&/별호/.test(r.t));
  await p.evaluate(()=>closePanels());
  // 3. 대결 전 한마디: 정예가 덤비면 얼굴·두 줄. 그 문파 사람을 해쳤으면 원수 갈래
  r=await p.evaluate(()=>{vsAt=-99;for(const m of mobs)m.hp=0;mobs=[];const e=mk('정파 고수',3);e.aggro=true;e.tgt=null;update(.05);const el=document.getElementById('vsline');
    const o={on:!!el&&el.classList.contains('on'),t:el&&el.textContent,shown:!!e.vsl};
    const sid=e.sect||Object.keys(SECTS)[0];e.sect=sid;P.ew.push({k:'kill',n:'어느 제자',sect:sid,y:20});o.rev=vsLines(e).k;o.revT=vsLines(e).foe;return o});
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t144_vs.png')});
  ok(`대결 전 한마디 ${r.on} '${(r.t||'').slice(0,60)}', 원수 갈래 ${r.rev} '${r.revT}'`,r.on&&r.shown&&r.rev==='rev'&&/어느 제자|원수/.test(r.revT));
  // 4. 마당 사건: 천하비무대회가 열리면 사람들이 둘러서고 대사가 흐른 뒤 정세 창이 열린다
  r=await p.evaluate(()=>{for(const m of mobs)m.hp=0;mobs=[];closePanels();const e=evOf('ev3');PS();openEvent(e);update(.05);const el=document.getElementById('madang');
    const o={q:P.mdgQ,on:!!el&&el.classList.contains('on'),crowd:mobs.filter(m=>m.scene).length,foes:foes().length,line:el&&el.querySelector('.ms p').textContent};
    return o});
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t144_madang.png')});
  ok(`마당 '천하비무대회' 펼침 ${r.on}, 둘러선 이 ${r.crowd}명, 적으로 잡히는 이 ${r.foes}, 첫 대사 '${r.line}'`,r.on&&r.crowd>=8&&r.foes===0&&/비무대/.test(r.line));
  // 화면을 누르면 다음 대사, 끝나면 사람들은 흩어지고 정세 창
  r=await p.evaluate(()=>{for(let i=0;i<6&&mdg;i++)mdgNext();return{end:!mdg,crowd:mobs.filter(m=>m.scene).length,panel,open:!$('win').hidden}});
  ok(`대사 끝 ${r.end}, 남은 이 ${r.crowd}, 정세 창 ${r.panel} ${r.open}`,r.end&&r.crowd===0&&r.panel==='story'&&r.open);
  // 적이 곁에 있으면 기다린다
  r=await p.evaluate(()=>{closePanels();const e=mk('산적',2);e.aggro=true;e.tgt=P;e.atk=0;PS().open='ev8';P.mdgQ='ev8';update(.05);const w=!mdg&&P.mdgQ==='ev8';e.hp=0;mobs=[];update(.05);const s=!!mdg;mdgEnd(true);return{w,s}});
  ok(`적이 곁에 있으면 마당은 기다리고(${r.w}) 적이 사라지면 펼쳐진다(${r.s})`,r.w&&r.s);
  // 5. 필살기 이름 외치기 · 병기 타격음 함수
  r=await p.evaluate(()=>{for(const k in calloutAt)delete calloutAt[k];const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&ARTS[k].ult&&!ARTS[k].side);P.arts[id]={p:99,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.eq.weapon=mkWeapon('검',1,0);recalc();P.qi=P.maxQi=9999;P.ucd=0;
    const e=mk('산적',1);e.hp=e.maxHp=99999;P.target=e;ultimate();const c=document.getElementById('callout');return{t:c&&c.textContent,n:ARTS[id].ult.n,hc:typeof hitCls==='function'&&Object.keys(HITCLS).length}});
  ok(`오의 외치기 '${r.t}' (${r.n}), 병기 타격음 ${r.hc}가지`,r.t&&r.t.includes(r.n)&&r.hc>=8);
  ok('오류 없음 '+errs.slice(0,3).join(' | '),errs.length===0);
  await b.close();
})();

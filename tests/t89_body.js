// v151 몸의 변화: 환골탈태(화경·영약), 반로환동(몸의 나이만 젊어짐), 금강불괴(피해·독 면역, 등 뒤 조문)
const {chromium}=require(process.env.PWPATH||'playwright');
const shot=n=>__dirname+'/shots/'+n+'.png';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.tap('[data-s="new"]');await p.tap('[data-s="side:정"]');await p.tap('[data-s="cls:검"]');await p.tap('[data-s="start"]');await p.waitForTimeout(500);
  await p.evaluate(()=>{mobs=[];P.sect='namgung'});
  // 1. 영약 환골탈태: 절정 아래면 기다리고, 절정에 오르면 일어난다
  const r1=await p.evaluate(()=>{P.realm=2;realmFxSync();P.mats['공청석유']=1;P.inj=2;P.poison=5;const s0=P.st.str,c0=statCost('str');
    useCon('공청석유');const wait=!P.hgt&&!!P.hgWait;P.realm=3;realmFxSync();
    return{wait,hgt:P.hgt&&P.hgt.why,ds:P.st.str-s0,inj:P.inj,poison:P.poison,c0,c1:statCost('str')}});
  ok(`영약 환골탈태: 일류에선 기다림 ${r1.wait}, 절정에서 ${r1.hgt}, 근력 +${r1.ds}, 후유증 ${r1.inj}·독 ${r1.poison}, 수련 활력 ${r1.c0}→${r1.c1}`,
    r1.wait&&r1.hgt==='영약'&&r1.ds===2&&r1.inj===0&&r1.poison===0&&r1.c1<r1.c0);
  // 화경에 올라도 두 번 받지 않는다
  const r2=await p.evaluate(()=>{const s0=P.st.str;P.realm=5;realmFxSync();return{ds:P.st.str-s0,why:P.hgt.why}});
  ok(`화경: 이미 환골탈태한 몸이라 근력 +${r2.ds}`,r2.ds===0&&r2.why==='영약');
  // 2. 반로환동: 몸의 나이만 젊어지고 해(G.cal)·수명은 그대로, 노쇠 체력 감소가 풀린다
  const r3=await p.evaluate(()=>{P.age=78.4;lastYear=78;recalc();const hp0=P.maxHp,cal0=G.cal,life0=P.life;P.realm=6;realmFxSync();
    return{age:P.age,ban:P.ban,real:realAge(),cal:G.cal-cal0,life:P.life-life0,hp0,hp1:P.maxHp,ly:lastYear,ui:(openPanel&&openPanel('char'),document.body.innerText.includes('살아온 해'))}});
  ok(`반로환동 78→${Math.floor(r3.age)}세 (되돌린 해 ${r3.ban.yrs}, 살아온 해 ${Math.floor(r3.real)}), 달력 +${r3.cal}, 수명 +${r3.life}, 최대 체력 ${r3.hp0}→${r3.hp1}, 인물창 표시 ${r3.ui}`,
    Math.floor(r3.age)===28&&r3.ban.yrs===50&&Math.floor(r3.real)===78&&r3.cal===0&&r3.hp1>r3.hp0&&r3.ly===28&&r3.ui);
  await p.screenshot({path:shot('body_char')});
  // 해가 지나면 몸의 나이부터 다시 먹는다, 반로환동은 한 번만
  const r4=await p.evaluate(()=>{closePanels();const a0=P.age;for(let i=0;i<YEAR_SEC*1.05*10;i++)update(.1);const a1=P.age;delete P.rfx[6];realmFxSync();return{d:a1-a0,again:P.age-a1}});
  ok(`한 해 뒤 +${r4.d.toFixed(2)}세, 다시 맞춰도 ${r4.again.toFixed(2)}`,r4.d>.9&&Math.abs(r4.again)<.01);
  // 3. 금강불괴: 남궁(정종) 환골탈태 몸이 지구력 40에 이르면
  const r5=await p.evaluate(()=>{const g0=!!P.gang;P.st.end=40;recalc();const g1=P.gang&&P.gang.why;
    const R=Math.random;Math.random=()=>.99;const hit=(dx,gang)=>{const sv=P.gang;if(!gang)P.gang=null;P.fx=1;P.fy=0;P.inv=0;P.hp=P.maxHp;const e=mkMob('산적',P.x+dx,P.y);P.realm=0;hurtP(100,e);P.realm=6;P.gang=sv;return P.maxHp-P.hp};
    const plain=hit(1,0),front=hit(1,1),back=hit(-1,1);Math.random=R;return{g0,g1,plain,front,back}});
  ok(`금강불괴 ${r5.g0}→${r5.g1}: 맨몸 ${r5.plain}, 앞 ${r5.front}, 등 뒤 조문 ${r5.back}`,!r5.g0&&r5.g1==='외공'&&r5.front<r5.plain&&r5.back>r5.plain);
  // 독 면역 (앞에서 맞을 때)
  const r6=await p.evaluate(()=>{const R=Math.random;Math.random=()=>.0001;P.poison=0;P.fx=1;P.fy=0;P.inv=0;P.hp=P.maxHp;const e=mkMob('산적',P.x+1,P.y);e.d={...e.d,poison:1};hurtP(10,e);Math.random=R;return P.poison});
  ok(`금강불괴 독 면역: 독 ${r6}`,!(r6>0));
  // 불가 계열은 화경에서 바로 금강불괴
  const r7=await p.evaluate(()=>{P.gang=null;P.hgt=null;P.st.end=10;P.sect='shaolin';P.realm=4;realmFxSync();P.realm=5;delete P.rfx[5];realmFxSync();return P.gang&&P.gang.why});
  ok(`소림 화경 금강불괴: ${r7}`,r7==='금강경');
  // 5. 호신강기: 경지가 오를수록 더 막고, 막은 만큼 내공이 빠지며, 바닥나면 깨진다
  const r9=await p.evaluate(()=>{P.gang=null;P.sect='namgung';const R=Math.random;Math.random=()=>.99;
    const hit=r=>{P.realm=r;recalc();P.hsBrk=0;P.inv=0;P.hp=P.maxHp;P.qi=P.maxQi;const q0=P.qi,e=mkMob('혈교장로',P.x+1,P.y);e.realm=r;hurtP(100,e);return{took:P.maxHp-P.hp,qi:q0-P.qi,per:P.hsLast?(q0-P.qi)/P.hsLast:0}};P.hsLast=0;
    const o={r3:hit(3),r4:hit(4),r5:hit(5),r6:hit(6)};P.qi=P.maxQi*.15+.5;P.hp=P.maxHp;P.inv=0;{const e=mkMob('혈교장로',P.x+1,P.y);e.realm=6;hurtP(100,e)}o.brk=P.hsBrk;
    P.inv=0;P.hp=P.maxHp;const q1=P.qi;hurtP(100,mkMob('혈교장로',P.x+1,P.y));o.noQi=q1-P.qi;P.qi=P.maxQi;P.inv=0;hurtP(1,mkMob('혈교장로',P.x+1,P.y));o.back=P.hsBrk;Math.random=R;return o});
  ok(`호신강기 받은 피해 절정 ${r9.r3.took} · 초절정 ${r9.r4.took}(막은 피해 1당 내공 ${r9.r4.per.toFixed(2)}) · 화경 ${r9.r5.took} · 현경 ${r9.r6.took}(1당 ${r9.r6.per.toFixed(2)}), 바닥나면 깨짐 ${r9.brk}, 깨진 뒤 내공 소모 ${r9.noQi}, 차면 다시 ${!r9.back}`,
    r9.r3.qi===0&&r9.r4.qi>0&&r9.r6.per<r9.r5.per&&r9.r5.per<r9.r4.per&&r9.r6.took<r9.r5.took&&r9.r5.took<r9.r4.took&&r9.r4.took<r9.r3.took&&r9.brk===1&&r9.noQi===0&&r9.back===0);
  // 4. 예전 저장: 현경인데 P.ban이 없으면 불러올 때 젊어진다
  const r8=await p.evaluate(()=>{P.sect='namgung';P.realm=6;P.age=70;saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));delete d.P.ban;delete d.P.hgt;delete P.ban;delete P.hgt;applySave(d);return{age:Math.floor(P.age),ban:!!P.ban,hgt:P.hgt&&P.hgt.why}});
  ok(`예전 저장 현경: ${r8.age}세, 반로환동 ${r8.ban}, 환골탈태 ${r8.hgt}`,r8.age===25&&r8.ban&&r8.hgt==='화경');
  // 6. 문파 유래: 역사·중국 소설·한국 무협 색 구분
  const r10=await p.evaluate(()=>{const h=sectDetail(SECTS.hwasan),c=sectLoreHtml('cheonma');return{h:h.includes('유래')&&h.includes('서악'),c:['역사','중국 소설','한국 무협'].every(k=>c.includes(k)),none:sectLoreHtml('nope')===''}});
  ok(`문파 유래: 화산파 창 ${r10.h}, 천마신교 세 갈래 ${r10.c}, 없는 문파는 비움 ${r10.none}`,r10.h&&r10.c&&r10.none);
  ok(`오류 없음 ${errs.join(' | ')}`,errs.length===0);
  await b.close()})();

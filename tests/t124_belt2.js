// 요대 등록·시계방향 순환, 단검술, 문파 비전 암기와 설계도 (v191, 사용자 2026-10-27)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:420,height:820}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad&touch');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="slot:0"]');await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  const r=await p.evaluate(()=>{
    const o={};
    // 1. 문파 비전 암기: 주력 무공이 암기인 문파마다 10가지 이상, 서로 겹치지 않고, 대장간은 안 판다
    const ams=Object.keys(START).filter(s=>START[s].w==='암'&&SECTS[s]).sort();o.sects=Object.keys(ASECT).sort().join(',')===ams.join(',');
    const all=Object.values(ASECT).flat();o.counts=Object.values(ASECT).map(l=>l.length);o.uniq=new Set(all).size===all.length&&all.every(k=>AMMO[k]);
    o.notSmith=!SHOP.smith.some(x=>all.includes(x[0]));
    // 2. 암기 병기를 들면 요대·비도·단도·단검술
    P.beltGift=0;P.dagGift=0;delete P.arts.dag;delete P.arts.jeol;P.mats={};P.eq.weapon=mkWeapon('암',1,0);recalc();const B0=P.eq.weapon;
    o.gift=[B0.reg.join(','),B0.mw&&B0.mw.name,!!A('dag'),ARTS.dag.cls,B0.name,P.eq.belt===undefined];
    // 3. 암기를 얻으면 등록, 칸이 차면 더는 안 됨
    addMat('매화침',2);addMat('회선표',1);addMat('독사침',1);addMat('벽력자',5);o.reg=B0.reg.join(',');o.cap=beltCap(B0);
    // 4. 시계방향: 비도를 다 쓰면 매화침 → 회선표 → 독사침 → 벽력자
    const id='사암1';P.arts[id]={p:0,f:ARTS[id].forms.map(()=>true)};P.cur=id;P.fx=1;P.fy=0;P.mats.비도=1;B0.am='비도';
    const seq=[];for(let i=0;i<6;i++){const q={vx:1,vy:0,m:1,left:1,kb:0,size:1};seq.push(amgiLoad(q)?q.ammo:'-')}o.seq=seq.join(',');
    // 5. 고른 암기부터 쓰고, 고른 것이 다 떨어지면 다음 것
    P.mats.비도=2;P.mats.회선표=2;act('amk:회선표');const q5={vx:1,vy:0,m:1,left:1,kb:0,size:1};amgiLoad(q5);o.pick=[B0.am,q5.ammo];
    // 6. 암기가 모두 떨어지면 단검술(요대 단도), 단검 무기 공격력이 붙는다
    for(const k of B0.reg)P.mats[k]=0;runHooks('tick',1);o.out=[P.cur,P.amgiBack,hasWeaponFor('단'),weaponAtk()===B0.mw.atk];
    // 평타가 공짜 유엽비도를 던지지 않는다
    mobs=[];projs=[];const e6=mkMob('산적',P.x+1,P.y);e6.hp=e6.maxHp=1e6;mobs.push(e6);P.bcd=P.gcd=0;P.cur=id;basicStrike(e6);o.noFree=[projs.length,P.cur];
    // 7. 암기를 다시 얻으면 암기 무공으로
    addMat('비도',3);runHooks('tick',1);o.back=P.cur;
    // 8. 요대에 단검이 없으면 권각
    const mw=B0.mw;B0.mw=null;for(const k of B0.reg)P.mats[k]=0;runHooks('tick',1);o.fist=P.cur;B0.mw=mw;addMat('비도',1);runHooks('tick',1);
    // 9. 대장간 절편을 요대에 차면(「요대에 차기」) 암기가 떨어졌을 때 절편술 (v192)
    const si=SHOP.smith.findIndex(x=>x[0]==='weapon:편');P.silver=9999;buy('smith',si);const jp=P.bag[P.bag.length-1];o.jp=[jp.name,jp.cls];
    o.beqBtn=pBag().includes('beq:'+jp.id);act('beq:'+jp.id);for(const k of B0.reg)P.mats[k]=0;P.cur=id;runHooks('tick',1);o.jeol=[B0.mw.name,P.cur,ARTS.jeol&&ARTS.jeol.cls,P.bag.includes(mw)];
    o.shop=shopList('smith').includes('절편')&&shopList('smith').includes('단도')&&shopList('smith').includes('가죽 요대');
    addMat('비도',2);runHooks('tick',1);o.back2=P.cur;
    // 10. 등록 빼기·넣기
    act('amr:독사침');o.rm=B0.reg.includes('독사침');P.mats.독사침=4;act('ama:독사침');o.add=B0.reg.includes('독사침');
    // 9b. 단도를 무기 칸에 바로 들면 단검술을 바로 펼친다. 요대는 행낭으로
    act('eq:'+mw.id);act('setart:dag');o.direct=[P.eq.weapon.cls,P.cur,hasWeaponFor('단'),weaponAtk()===mw.atk,P.bag.includes(B0)];
    act('eq:'+B0.id);
    // 11. 문파 대장장이: 당문 외원 암기방, 문도에게만 비전 암기
    const O=REGIONS.hq_dang_outer,hl=(O.halls||[]).find(h=>/암기방/.test(h.n));o.hall=hl&&REGIONS[hl.id].npcs.some(n=>n.asmith==='dang');
    const n={id:'asmith',asmith:'dang',n:'당문 암기방 대장장이'};P.sect=null;let h=asmithDlg(n);o.locked=/문도에게만/.test(h);
    const m0=P.mats.폭우이화침||0;act('abuy:dang:폭우이화침');o.noBuy=(P.mats.폭우이화침||0)===m0;
    P.sect='dang';const s0=P.silver;act('abuy:dang:폭우이화침');o.buy=[(P.mats.폭우이화침||0)-m0,s0-P.silver];
    // 12. 하오문을 멸문시키면 설계도첩, 당문 대장장이에게 전하면 하오문 비전 암기를 판다
    popInit();G.pop.haomun=1;const e={sect:'haomun',d:{fac:1},rank:0};runHooks('kill',e);const bp=P.bag.find(i=>i.slot==='bp');o.bp=[G.pop.haomun,bp&&bp.name,bp&&bpDesc(bp).includes('사천당가')];
    runHooks('kill',e);o.once=P.bag.filter(i=>i.slot==='bp').length;
    h=asmithDlg(n);o.give=h.includes('bpgive:');act(`bpgive:${bp.id}:dang`);o.given=[G.bpAt.dang.length,P.bag.includes(bp)];
    P.sect=null;const y0=P.mats.유성추||0;act('abuy:dang:유성추');o.bpBuy=(P.mats.유성추||0)-y0;
    // 14. 옛 저장(v9) 옮기기
    {const d=migrateSave({v:9,P:{eq:{weapon:{slot:'weapon',cls:'암',name:'유엽비도',atk:12,q:1,dur:50,maxDur:60,id:5},belt:{slot:'belt',name:'쇠고리 요대',q:1.2,hm:4,reg:['비도'],am:'비도',mw:{slot:'weapon',cls:'단',name:'절편',atk:8,id:7},id:6}},bag:[{slot:'belt',name:'가죽 요대',q:1,hm:3,id:8}]},G:{}});
      const w=d.P.eq.weapon;o.mig=[w.cls,w.name,w.atk,w.reg.join(','),w.mw.cls,'belt' in d.P.eq,d.P.bag[0].cls,d.notes.some(n=>/무기 칸/.test(n))]}
    // 13. 적이 흘리는 암기는 대장간 암기만
    o.loot=AMMO_COMMON.length===5&&!AMMO_COMMON.some(k=>all.includes(k));
    return o});
  ok(`암기 문파 = 주력 무공 암기 (${r.sects}), 비전 암기 ${r.counts}가지, 겹침 없음 ${r.uniq}, 대장간에 없음 ${r.notSmith}`,r.sects&&r.counts.every(n=>n>=10)&&r.uniq&&r.notSmith);
  ok(`무기 칸 요대 ${r.gift[4]}(${r.gift[0]})·단도(${r.gift[1]})·단검술(${r.gift[2]}, ${r.gift[3]}), 요대 칸 없음 ${r.gift[5]}`,r.gift[0]==='비도'&&r.gift[1]==='단도'&&r.gift[2]&&r.gift[3]==='단'&&r.gift[4]==='가죽 요대'&&r.gift[5]);
  ok(`얻은 암기가 차례로 등록, 가죽 요대 ${r.cap}칸 (${r.reg})`,r.reg==='비도,매화침,회선표,독사침'&&r.cap===4);
  ok(`다 쓰면 시계방향 다음 암기 (${r.seq})`,r.seq==='비도,매화침,매화침,회선표,독사침,-');
  ok(`요대에서 고른 암기부터 (${r.pick})`,r.pick[0]==='회선표'&&r.pick[1]==='회선표');
  ok(`암기가 모두 떨어지면 단검술 (${r.out})`,r.out[0]==='dag'&&r.out[1]==='사암1'&&r.out[2]&&r.out[3]);
  ok(`평타가 공짜 비도를 던지지 않음 (${r.noFree})`,r.noFree[0]===0&&r.noFree[1]==='dag');
  ok(`암기를 다시 얻으면 암기 무공으로 (${r.back})`,r.back==='사암1');
  ok(`요대에 단검이 없으면 권각 (${r.fist})`,r.fist==='base');
  ok(`대장간 절편 (${r.jp}), 「요대에 차기」 ${r.beqBtn} → 암기가 떨어지면 절편술 (${r.jeol}), 진열 ${r.shop}, 암기 얻으면 돌아감 ${r.back2}`,r.jp[0]==='절편'&&r.jp[1]==='편'&&r.beqBtn&&r.jeol[0]==='절편'&&r.jeol[1]==='jeol'&&r.jeol[2]==='편'&&r.jeol[3]&&r.shop&&r.back2==='사암1');
  ok(`단도를 손에 들면 단검술 바로 (${r.direct})`,r.direct[0]==='단'&&r.direct[1]==='dag'&&r.direct[2]&&r.direct[3]&&r.direct[4]);
  ok(`옛 저장: 요대+유엽비도 → 무기 칸 요대 하나 (${r.mig})`,r.mig[0]==='암'&&r.mig[1]==='쇠고리 요대'&&r.mig[2]===12&&r.mig[3]==='비도'&&r.mig[4]==='편'&&r.mig[5]===false&&r.mig[6]==='암'&&r.mig[7]);
  ok(`요대 빼기·넣기 (${r.rm}→${r.add})`,r.rm===false&&r.add===true);
  ok(`당문 외원 암기방 대장장이 ${r.hall}, 문도 아니면 못 삼 (${r.locked},${r.noBuy}), 문도는 100개 (${r.buy})`,r.hall&&r.locked&&r.noBuy&&r.buy[0]===100&&r.buy[1]>0);
  ok(`하오문 멸문 → 설계도첩 (${r.bp}), 한 번만 (${r.once})`,r.bp[0]===0&&r.bp[1]==='하오문 비전 암기 설계도첩'&&r.bp[2]&&r.once===1);
  ok(`당문 대장장이에게 전함 (${r.give}, ${r.given}) → 문도 아니어도 하오문 암기 삼 (${r.bpBuy})`,r.give&&r.given[0]===12&&!r.given[1]&&r.bpBuy===100);
  ok(`적이 흘리는 암기는 대장간 것만 ${r.loot}`,r.loot);
  ok(`오류 없음 ${errs.slice(0,3).join(' | ')}`,errs.length===0);
  await b.close()})();

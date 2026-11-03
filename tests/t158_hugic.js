// 후기지수 경쟁 (v240, 사용자 2026-11-03): 순위표·은원·길 마주침 비무·생사결(진짜 죽음)·도전장·용봉지회·천하대전·경쟁 가중치
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  await p.evaluate(()=>{window.yr=()=>{G.cal=Math.floor(G.cal||0)+1;runHooks('newYear')};window.R1=Math.random;
    window.clearMobs=()=>{mobs=mobs.filter(m=>m.hgId);for(const m of mobs)m.hp=0;mobs=[]};window.winDuel=()=>{const e=mobs.find(m=>m.duel);e.hp=1;damage(e,5,0,0,P)}});
  // 1. 순위표: 해마다 꼽고 나도 오른다, 정세 창 카드
  const r1=await p.evaluate(()=>{yr();const R=hgRank();openPanel('story');const html=$('wbody').innerHTML;closePanels();
    return{n:R.length,me:R.some(x=>x.me),rk:P.hgRk,card:html.includes('후기지수')&&html.includes('hgt'),live:hgList().length}});
  ok(`순위표 ${r1.n}명 (후기지수 ${r1.live} + 나 ${r1.me}), 내 순위 ${r1.rk}, 정세 창 카드 ${r1.card}`,r1.n===r1.live+1&&r1.me&&r1.rk>0&&r1.card);
  // 2. 길에서 마주침 → 비무를 청해 이긴다: 은원·명성·패자 가중치
  const r2=await p.evaluate(()=>{clearMobs();const h=hgList().find(x=>!facFoe(x.fac,pfac()));const f0=P.fame,st=hgMeet(h),pn=panel,dlg=$('wbody').innerHTML.includes('비무를 청한다');
    sectAct('hgbm',String(h.id));const duel=G.duel&&!!G.hgDuel&&mobs.some(m=>m.duel&&m.hgId===h.id);winDuel();
    const r=hgRv(h.id),c={h,cause:'bm',mul:1};runHooks('hugiMul',c);return{st,pn,dlg,duel,end:!G.duel,f:r.f,w:r.w,fame:P.fame-f0,mul:c.mul,ew:(P.ew||[]).some(e=>e.k==='win'&&e.n.includes(h.n))}});
  ok(`마주침 ${r2.st}/${r2.pn} 창 ${r2.dlg} → 비무 ${r2.duel} → 끝 ${r2.end}, 겨룸 ${r2.f} 승 ${r2.w}, 명성 +${r2.fame}, 패자 가중치 ×${r2.mul}, 은원 장부 ${r2.ew}`,
    r2.st==='meet'&&r2.pn==='npc'&&r2.dlg&&r2.duel&&r2.end&&r2.f===1&&r2.w===1&&r2.fame>0&&r2.mul>=1.25&&r2.ew);
  // 3. 비무에서 지면 목숨은 남고 상대 전적이 오른다
  const r3=await p.evaluate(()=>{clearMobs();const h=hgList()[1];const bw=h.bw||0;hgDuel(h,'bm');P.hp=1;hurtP(999,mobs.find(m=>m.duel),true);return{alive:P.hp>0,bw:(h.bw||0)-bw,l:hgRv(h.id).l,duel:G.duel}});
  ok(`비무 패배: 살아 있음 ${r3.alive}, 상대 이김 +${r3.bw}, 내 패 ${r3.l}, 비무 끝 ${!r3.duel}`,r3.alive&&r3.bw===1&&r3.l===1&&!r3.duel);
  // 4. 생사결: 원수면 먼저 칼을 뽑는다, 쓰러뜨리면 고르기 → 벤다 = 명단에서 죽음, 그 문파 원한, 같은 문파 후기지수가 원수
  const r4=await p.evaluate(()=>{clearMobs();P.hp=P.maxHp;const L=hgList();const h=L.find(x=>L.some(o=>o!==x&&o.sid===x.sid))||L[0];const mate=L.find(o=>o!==h&&o.sid===h.sid);
    hgR(h.id).v=-90;const rep0=repSect(h.sid);const st=hgMeet(h),e=mobs.find(m=>m.hgId===h.id);const leth=!!(e&&e.hgLethal&&!e.duel&&!G.duel&&e.aggro);
    e.hp=3;damage(e,50,0,0,P);const down=e.hgDown&&e.hp>0&&panel==='npc'&&$('wbody').innerHTML.includes('hgkill');sectAct('hgkill');
    return{st,leth,down,dead:h.dead,dc:h.dc,gone:!mobs.includes(e),rep:repSect(h.sid)-rep0,mate:mate?hgRelK(mate):'foe',kill:(P.hgKill||[]).some(k=>k.id===h.id)}});
  ok(`생사결 ${r4.st}, 무인 ${r4.leth}, 쓰러뜨림 고르기 ${r4.down} → 벰: 죽음 ${r4.dead}/${r4.dc}, 맵에서 ${r4.gone}, 문파 우호 ${r4.rep}, 같은 문파 ${r4.mate}`,
    r4.st==='lethal'&&r4.leth&&r4.down&&r4.dead===1&&r4.dc==='player'&&r4.gone&&r4.rep<0&&r4.mate==='foe'&&r4.kill);
  // 5. 폐한다 / 살려 준다 / 고르지 않고 닫으면 살려 준 것
  const r5=await p.evaluate(()=>{clearMobs();P.hp=P.maxHp;const L=hgList();const a=L[0],c=L[1];
    const down=h=>{const e=hgLethal(h);e.hp=2;damage(e,50,0,0,P);return e};let e=down(a);sectAct('hgcrip');const crip=a.crip&&a.old&&!hgList().includes(a);
    e=down(c);sectAct('hgspare');const spare=hgRelK(c),alive=!c.dead;return{crip,spare,alive}});
  ok(`폐함: 후기지수에서 빠짐 ${r5.crip} · 살려 줌: ${r5.spare}, 살아 있음 ${r5.alive}`,r5.crip&&r5.spare==='friend'&&r5.alive);
  // 6. 생사결에서 지면 플레이어도 진짜 죽는다 (비무와 달리 G.duel 아님)
  const r6=await p.evaluate(()=>{clearMobs();P.hp=P.maxHp;const h=hgList().find(x=>hgRelK(x)!=='friend');const e=hgLethal(h);let died=null;const d0=die;die=c=>{died=c};for(let i=0;i<30&&!died;i++){P.inv=0;hurtP(P.maxHp*5,e,true)}die=d0;const bw=h.bw;mobs=mobs.filter(m=>m!==e);P.hp=P.maxHp;return{died,duel:G.duel}});
  ok(`생사결 패배 = 죽음 (${r6.died}), 비무 아님 ${!r6.duel}`,!!r6.died&&!r6.duel);
  // 7. 도전장: 순위 가까운 자가 보낸다 → 반년 지나면 명성 하락 / 받으면 비무 / 내가 보내기
  const r7=await p.evaluate(()=>{clearMobs();const sp=HGC.ch.p;HGC.ch.p=1;P.hgCh=null;hgChCheck(hgYear());HGC.ch.p=sp;const c=P.hgCh;openPanel('story');const card=$('wbody').innerHTML.includes('hgch');closePanels();
    const f0=P.fame=100;G.cal=c.until+.01;runHooks('tick',.016);const lost=f0-P.fame;
    HGC.ch.p=1;hgChCheck(hgYear());HGC.ch.p=sp;sectAct('hgch');const d1=!!G.hgDuel&&G.hgDuel.k==='ch';winDuel();const cleared=!P.hgCh;
    const R=hgRank(),i=R.findIndex(x=>x.me),up=R.slice(0,i).find(x=>!x.me);let sent=null;if(up){sectAct('hgsend',String(up.h.id));sent=!!G.hgDuel;winDuel()}
    return{c:!!c,card,lost,d1,cleared,sent,up:!!up}});
  ok(`도전장 ${r7.c}, 카드 단추 ${r7.card}, 기한 넘기면 명성 -${r7.lost}, 받으면 비무 ${r7.d1}·해소 ${r7.cleared}, 내가 보냄 ${r7.up?r7.sent:'(위 없음)'}`,r7.c&&r7.card&&r7.lost===10&&r7.d1&&r7.cleared&&(!r7.up||r7.sent));
  // 8. 용봉지회: 개봉에서 출전 → 세 판 이기면 우승, 플레이어 없는 해는 셈으로 우승자
  const r8=await p.evaluate(()=>{clearMobs();enterRegion('gaebong',ARENA.x,ARENA.y+2);P.reg=REG;hgTourOpen(hgYear());const T=G.hgTour;sectAct('hgtour');let n=0;
    for(let i=0;i<4&&G.hgDuel;i++){winDuel();n++;if(!T.done)sectAct('hgtnext')}const f=T.win==='P',tw=P.hgTw;
    hgTourOpen(hgYear());hgTourSim();const w2=G.hgTour.win,h2=hugiById(w2);return{n,f,tw,sim:!!h2&&(h2.tw||0)>=1}});
  ok(`용봉지회: ${r8.n}판 이겨 우승 ${r8.f} (우승 ${r8.tw}) · 셈으로 다른 해 우승자 ${r8.sim}`,r8.n===3&&r8.f&&r8.tw>=1&&r8.sim);
  // 9. 천하대전: 결전장에 적 후기지수(생사결)와 우리 편 후기지수
  const r9=await p.evaluate(()=>{clearMobs();for(const h of hgList())if(P.hgr&&P.hgr[h.id])P.hgr[h.id].v=0;G.war={life:P.lifeNo,round:1,plan:{sides:[['정','관'],['사','마']],n:'시험'},cur:{}};
    enterRegion(FIELD_ID,20.5,35.5);P.reg=REG;hgWar();const foe=mobs.filter(m=>m.hgId&&m.raid&&m.hgLethal).length,al=mobs.filter(m=>m.hgId&&m.warAlly).length;
    const L=hgList().filter(h=>warSideOf(h.fac)>=0).length;G.war.round=0;const sd=HGC.war.die;HGC.war.die=100;yr();HGC.war.die=sd;const died=(G.hugi||[]).filter(h=>h.dc==='전사').length;G.war=null;return{foe,al,L,died}});
  ok(`결전장 적 후기지수 ${r9.foe}, 우리 편 ${r9.al}, 대전 중 전사 ${r9.died}`,r9.foe>=1&&r9.al>=1&&r9.died>=1);
  // 10. 나이 40을 넘으면 순위표에서 빠진다, 수련기 동기가 명단에 오른다
  const r10=await p.evaluate(()=>{hugiFill();const a0=P.age;P.age=41;const out=!hgRank().some(x=>x.me);P.age=a0;P.sry={rival:{n:'시험동기',sect:hgList()[0].sid}};hgSryLink();const h=hugiById(P.sry.rival.hg);P.sry=null;return{out,link:!!h&&h.n==='시험동기'&&hgRv(h.id).f>=1}});
  ok(`41세 순위표에서 빠짐 ${r10.out}, 수련기 동기 명단 편입 ${r10.link}`,r10.out&&r10.link);
  // 11. 저장·불러오기: 은원·전적이 남는다
  const r11=await p.evaluate(()=>{saveGame(true);return{n:Object.keys(P.hgr||{}).length,w:P.hgW}});
  await p.evaluate(()=>location.reload());await p.waitForFunction(()=>typeof loadRegion==='function');await p.waitForTimeout(300);
  const r12=await p.evaluate(()=>{applySave(loadGame());return{n:Object.keys(P.hgr||{}).length,w:P.hgW}});
  ok(`불러온 뒤 은원 ${r12.n}=${r11.n}, 비무 승 ${r12.w}=${r11.w}`,r12.n===r11.n&&r12.w===r11.w&&r11.n>0);
  await p.screenshot({path:require('path').resolve(__dirname,'shots/t158_hugic.png')}).catch(()=>{});
  console.log(errs.length?'ERRORS\n'+errs.slice(0,8).join('\n'):'오류 없음');await b.close()})();

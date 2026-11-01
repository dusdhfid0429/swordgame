// v220 단계 2 (개선 계획 1·2절, 동훈님 2026-11-01): 세월 넘기기 카드, 인연 3갈래, 판 끝 결산
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 마디가 끝나기 전에는 왼쪽 위 줄이 없고, 끝나면(mdEnd) '세월 넘기기' 줄이 뜬다
  let r=await p.evaluate(()=>{qtrackKey='';questTrack();const a=!!document.querySelector('#qtrack [data-md]');mdEnd();qtrackKey='';questTrack();return{a,b:!!document.querySelector('#qtrack [data-md]'),y:mdYears().y}});
  ok(`세월 넘기기 줄: 마디 전 ${r.a} → 마디 끝 ${r.b}, ${r.y}년`,!r.a&&r.b&&r.y===4);
  await p.tap('#qtrack [data-md]');await p.waitForTimeout(150);
  r=await p.evaluate(()=>({panel,id:panelArg&&panelArg.id,ways:[...document.querySelectorAll('[data-act^="mdgo:"]')].map(b=>b.dataset.act.slice(5))}));
  ok(`누르면 카드 (${r.panel}/${r.id}), 길 ${r.ways}`,r.id==='madi'&&r.ways.join()==='pg,roam,work');
  r=await p.evaluate(()=>{P.simId=P.simId;const s0={age:P.age,oe:pillarVal('oe'),ne:baseQi(),silver:P.silver,lives:G.lives};act('mdgo:pg');return{s0,age:P.age,oe:pillarVal('oe'),ne:baseQi(),panel,id:panelArg&&panelArg.id,txt:$('wbody').textContent,feat:P.feats.some(f=>f.includes('폐관 수련'))}});
  ok(`폐관 수련으로 ${Math.floor(r.s0.age)}→${Math.floor(r.age)}세, 외공 ${r.s0.oe}→${r.oe}, 내공 ${r.s0.ne}→${r.ne}, 결과 카드 ${/그해 강호에서는/.test(r.txt)}, 행적 ${r.feat}`,Math.round(r.age-r.s0.age)===4&&r.oe>r.s0.oe&&/그해 강호에서는/.test(r.txt)&&r.feat&&r.id==='madi');
  await p.evaluate(()=>act('mdok'));r=await p.evaluate(()=>({panel,paused}));ok(`다시 길을 나선다 → 창 닫힘 ${r.panel===null}`,r.panel===null&&!r.paused);
  // 싸움 중·비무 중엔 못 넘긴다, 수련기 마디 과제가 남아도
  r=await p.evaluate(()=>{const m=mkMob('산적',P.x+1,P.y);m.aggro=true;mobs.push(m);const a=mdYears();mobs.pop();m.hp=0;return a});
  ok(`싸움 중: ${r.y}년 '${r.why}'`,r.y===0&&r.why==='싸움 중');
  r=await p.evaluate(()=>{P.age=19.6;return mdYears()});ok(`20세 출사 0.4년 앞: 못 넘김 '${r.why}'`,r.y===0);
  await p.evaluate(()=>{P.age=12.2;lastYear=12});
  // 2. 인연 3갈래: 줄 맨 위, 누르면 카드, 셋 중 하나
  r=await p.evaluate(()=>{inyOffer('grad');qtrackKey='';questTrack();const q=myIny().q[0];return{ks:q.ks,row:!!document.querySelector('#qtrack [data-iny]'),first:document.querySelector('#qtrack > h5').dataset.iny,y:mdYears().y,why:mdYears().why}});
  ok(`인연 줄 ${r.row} (맨 위 ${r.first}), 고를 것 ${r.ks}, 그동안 세월 넘기기 막힘 '${r.why}'`,r.row&&r.first==='1'&&r.ks.length===3&&r.y===0);
  await p.tap('#qtrack [data-iny]');await p.waitForTimeout(150);
  r=await p.evaluate(()=>({id:panelArg&&panelArg.id,n:document.querySelectorAll('[data-act^="inygo:"]').length}));ok(`인연 카드 ${r.id}, 갈래 ${r.n}`,r.id==='iny'&&r.n===3);
  // 넷 모두 확인: 사부·의형제·기연 비급·숙적
  r=await p.evaluate(()=>{const I=myIny();I.q=[{why:'t1',ks:['sabu','dong','book'],age:12}];inyGo('sabu');const m=inyMast();
    I.q=[{why:'t2',ks:['dong'],age:12}];inyGo('dong');const al=allies.find(a=>a.k==='의형제');
    I.q=[{why:'t3',ks:['book'],age:12}];const n0=P.bag.filter(i=>i.slot==='book').length;inyGo('book');const n1=P.bag.filter(i=>i.slot==='book').length;
    return{m,al:al&&al.name,books:n1-n0,log:I.log.map(l=>l.n)}});
  ok(`사부 숙련 ×${r.m}, 의형제 ${r.al}, 비급 +${r.books}, 기록 ${r.log}`,r.m===1.3&&!!r.al&&r.books===1&&r.log.length>=3);
  r=await p.evaluate(()=>{closePanels();const I=myIny();I.q=[{why:'t4',ks:['won'],age:12}];inyGo('won');const e=mobs.find(m=>m.mdRival);return{duel:G.duel,e:e&&e.name}});
  ok(`숙적 비무 시작 ${r.duel}, ${r.e}`,r.duel&&!!r.e);
  r=await p.evaluate(()=>{const e=mobs.find(m=>m.mdRival),f=P.fame,en=P.enl||0;damage(e,1e8,0,0,P);return new Promise(res=>setTimeout(()=>res({duel:G.duel,fame:P.fame-f,enl:(P.enl||0)-en,win:myIny().log.slice(-1)[0].win}),600))});
  ok(`숙적을 꺾음: 비무 끝 ${!r.duel}, 명성 +${r.fame}, 깨달음 +${r.enl.toFixed(2)}, 승 ${r.win}`,!r.duel&&r.fame>=8&&r.enl>.5&&r.win===1);
  // 3. 판 끝 결산
  await p.evaluate(()=>{P.lastFoe='흑풍채 두목';die('싸움')});await p.waitForTimeout(1300);
  r=await p.evaluate(()=>{const c=box.querySelector('.lifesum');return{has:!!c,t:c&&c.textContent,cells:c?c.querySelectorAll('.lsgrid div').length:0}});
  ok(`결산 카드 ${r.has}, 칸 ${r.cells}, 사인·인연 실림 "${(r.t||'').slice(0,80)}"`,r.has&&r.cells===6&&/흑풍채 두목에게 쓰러졌다/.test(r.t)&&/의형제/.test(r.t)&&/천하대전/.test(r.t));
  await p.screenshot({path:__dirname+'/shots/t140_lifesum.png'});
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

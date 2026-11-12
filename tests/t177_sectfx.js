// v262 문파마다 한 가지 손맛 (동훈님 2026-11-12, 적용 계획 3단계 H): 정파 여덟 문파 심법 특색 (공동 칠상·청성 송풍·점창 쾌검·곤륜 전초·형산 오신·해남 좌수·남궁 제왕·모용 두전)
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const p=await b.newPage({viewport:{width:1100,height:760}});p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForFunction(()=>typeof loadRegion==='function');await p.evaluate(()=>localStorage.clear());
  await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);await p.waitForTimeout(400);
  // 1. 여덟 문파 심법에 새 특색이 붙었다
  const r1=await p.evaluate(()=>{const want={kongtong:'chilsang',cheongseong:'songpung',jeomchang:'kwae',kunlun:'jeoncho',hyeongsan:'oshin',haenam:'jwasu',namgung:'jewang',moyong:'dujeon'};
    return Object.entries(want).map(([s,k])=>[s,[].concat(SIM_TRAIT[s]).includes(k)&&!!SIM_TK[k]]).filter(x=>!x[1]).map(x=>x[0])});
  ok(`특색 붙음 (빠진 문파: ${r1.join()||'없음'})`,!r1.length);
  // 2. 피해 배율: 특색 하나만 켜고 hit 훅의 c.m을 잰다 (simTv를 바꿔 낀다)
  const r2=await p.evaluate(()=>{const cur=simCur(),tr0=cur.tr;window.ONLY=k=>{cur.tr=[k];return simTv(k)};window.OFF=()=>{cur.tr=tr0};const run=e=>{const c={from:P,e,m:1,hm:20};runHooks('hit',c);return c};const m=(k,e)=>{cur.tr=[];const b=run(e);const v=ONLY(k);const c=run(e);OFF();return{m:Math.round(c.m/b.m*1000)/1000,hm:Math.round((20-(b.hm-c.hm))*10)/10,v}};
    const now=time,e={d:{fac:'사'},realm:0,hurtAt:now},em={d:{fac:'마'},realm:0,hurtAt:now},hi={d:{},realm:6,hurtAt:now},fresh={d:{},realm:0,hurtAt:now-10};
    P.realm=1;const o={};o.ch=m('chilsang',e).m;P.moving=true;o.sp=m('songpung',e).m;P.moving=false;o.sp0=m('songpung',e).m;o.kw=m('kwae',fresh).m;o.kw0=m('kwae',e).m;
    o.jc=m('jeoncho',em).m;o.jc0=m('jeoncho',e).m;o.jw=m('jewang',e).m;o.jw0=m('jewang',hi).m;const z=m('jwasu',e);o.zs=z.hm;o.zv=z.v;o.x={};for(const k of['chilsang','songpung','kwae','jeoncho','jewang'])o.x[k]=Math.round((1+ONLY(k)/100)*1000)/1000;OFF();return o});
  ok(`배율: 칠상 ${r2.ch} · 송풍 움직임 ${r2.sp}/멈춤 ${r2.sp0} · 쾌검 첫 일격 ${r2.kw}/이어 칠 때 ${r2.kw0} · 전초 마교 ${r2.jc}/사파 ${r2.jc0} · 제왕 아래 ${r2.jw}/위 ${r2.jw0} · 좌수 현묘도 20→${r2.zs}`,
    r2.ch===r2.x.chilsang&&r2.ch>1&&r2.sp===r2.x.songpung&&r2.sp0===1&&r2.kw===r2.x.kwae&&r2.kw0===1&&r2.jc===r2.x.jeoncho&&r2.jc0===1&&r2.jw===r2.x.jewang&&r2.jw0===1&&Math.abs(r2.zs-(20-r2.zv))<.11);
  // 3. 칠상: 내공 30% 밑이면 준 피해의 3%를 입는다 / 오신: 다섯 번째마다 치명타 버프 / 두전: 맞은 피해를 되돌린다
  const r3=await p.evaluate(()=>{const R=Math.random;const out={};ONLY("chilsang");P.hp=P.maxHp=1000;P.qi=1;P.maxQi=100;runHooks('hitDone',{e:{hp:0,d:{},x:P.x+1,y:P.y,maxHp:1000},hp0:1000});out.self=1000-P.hp;P.qi=100;P.hp=1000;runHooks('hitDone',{e:{hp:0,d:{},x:P.x+1,y:P.y,maxHp:1000},hp0:1000});out.self0=1000-P.hp;
    ONLY('oshin');P.oshin=0;P.buff.crit=0;const oe={hp:1,d:{},x:P.x+1,y:P.y,maxHp:2,realm:9,hurtAt:time};for(let i=0;i<4;i++)runHooks('hit',{from:P,e:oe,m:1,hm:0});out.c4=P.buff.crit;runHooks('hit',{from:P,e:oe,m:1,hm:0});out.c5=P.buff.crit;P.buff.crit=0;runHooks('hit',{from:P,e:oe,m:1,hm:0});out.c6=P.buff.crit;
    ONLY('dujeon');Math.random=()=>0;const src={d:{},hp:500,maxHp:500,x:P.x+1,y:P.y};P.hp=900;runHooks('hurtDone',{src,hp0:1000});out.back=500-src.hp;Math.random=R;OFF();P.hp=P.maxHp;return out});
  ok(`칠상 내공 낮음 -${r3.self}/넉넉 -${r3.self0} · 오신 4번째 ${r3.c4}/5번째 ${r3.c5}/6번째 ${r3.c6} · 두전 되돌린 피해 ${r3.back}`,r3.self===30&&r3.self0===0&&r3.c4===0&&r3.c5>0&&r3.c5<=.05&&r3.c6===0&&r3.back===100);
  // 4. v263 흡혈 상한: 한순간에 큰 피해를 여러 번 줘도 되찾는 생명은 초당 최대 생명의 1%
  const r4=await p.evaluate(()=>{P.hp=P.maxHp=1000;P.hp=500;P._lb=null;const cur=simCur(),tr0=cur.tr;cur.tr=['vamp'];
    for(let i=0;i<10;i++)runHooks('hitDone',{from:P,e:{hp:0,d:{},x:P.x+1,y:P.y,maxHp:1e5},hp0:1e5});const once=P.hp-500;
    const t0=time;time+=1;runHooks('hitDone',{from:P,e:{hp:0,d:{},x:P.x+1,y:P.y,maxHp:1e5},hp0:1e5});const after=P.hp-500-once;time=t0;
    P.qi=0;P.maxQi=1000;cur.tr=['drain'];for(let i=0;i<10;i++)runHooks('hitDone',{from:P,e:{hp:0,d:{},x:P.x+1,y:P.y,maxHp:1e5},hp0:1e5});const q=P.qi;cur.tr=tr0;P.hp=P.maxHp;return{once,after,q}});
  ok(`흡혈 상한: 한순간 열 번 +${r4.once} · 1초 뒤 +${r4.after} · 흡정 +${r4.q} (최대치 1000의 1% = 10)`,r4.once>0&&r4.once<=10.001&&r4.after<=10.001&&r4.after>0&&r4.q>0&&r4.q<=10.001);
  // 5. v263 큰 문파의 둘째 특색: 나한·태극·매화·불심·타구
  const r5=await p.evaluate(()=>{const cur=simCur(),tr0=cur.tr,m=(k,e,pre)=>{cur.tr=[k];if(pre)pre();const c={from:P,e,m:1,hm:0};runHooks('hit',c);cur.tr=tr0;return Math.round(c.m*1000)/1000};
    const hu=(k,pre)=>{cur.tr=[k];if(pre)pre();const c={src:{d:{}},dm:100};runHooks('hurt',c);cur.tr=tr0;return Math.round(c.dm*10)/10};
    const e={d:{fac:'정'},realm:0},b={d:{beast:1},realm:0},o={};
    o.tg0=m('taegeuk',e,()=>{P.tgkT=-9});o.tg=m('taegeuk',e,()=>{P.tgkT=time});o.tgUsed=m('taegeuk',e);
    P.mhE=null;o.mh1=m('maehwa',e);o.mh2=m('maehwa',e);o.tu=m('tagu',b);o.tu0=m('tagu',e);
    const sv=mobs;mobs=[1,2,3,4].map(i=>({hp:10,aggro:true,x:P.x+.5,y:P.y}));o.nh=hu('nahan');mobs=[];o.nh0=hu('nahan');mobs=sv;
    P.hp=P.maxHp*.4;o.bs=hu('bulsim');P.hp=P.maxHp;o.bs0=hu('bulsim');return o});
  ok(`태극 ${r5.tg0}/${r5.tg}/다시 ${r5.tgUsed} · 매화 ${r5.mh1}→${r5.mh2} · 타구 짐승 ${r5.tu}/정파 ${r5.tu0} · 나한 넷 ${r5.nh}/없음 ${r5.nh0} · 불심 ${r5.bs}/${r5.bs0}`,
    r5.tg>r5.tg0&&r5.tgUsed===r5.tg0&&r5.mh2>r5.mh1&&r5.tu>r5.tu0&&r5.nh<r5.nh0&&r5.bs<r5.bs0);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

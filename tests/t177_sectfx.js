// v261 문파마다 한 가지 손맛 (동훈님 2026-11-12, 적용 계획 3단계 H): 정파 여덟 문파 심법 특색 (공동 칠상·청성 송풍·점창 쾌검·곤륜 전초·형산 오신·해남 좌수·남궁 제왕·모용 두전)
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
    ONLY('oshin');P.oshin=0;P.buff.crit=0;for(let i=0;i<4;i++)runHooks('hitDone',{e:{hp:1,d:{},x:P.x+1,y:P.y,maxHp:2},hp0:2});out.c4=P.buff.crit;runHooks('hitDone',{e:{hp:1,d:{},x:P.x+1,y:P.y,maxHp:2},hp0:2});out.c5=P.buff.crit;
    ONLY('dujeon');Math.random=()=>0;const src={d:{},hp:500,maxHp:500,x:P.x+1,y:P.y};P.hp=900;runHooks('hurtDone',{src,hp0:1000});out.back=500-src.hp;Math.random=R;OFF();P.hp=P.maxHp;return out});
  ok(`칠상 내공 낮음 -${r3.self}/넉넉 -${r3.self0} · 오신 4번째 ${r3.c4}/5번째 ${r3.c5} · 두전 되돌린 피해 ${r3.back}`,r3.self===30&&r3.self0===0&&r3.c4===0&&r3.c5>=1.5&&r3.back===100);
  if(errs.length){console.log('ERRORS');console.log(errs.slice(0,8).join('\n'))}else console.log('no console errors');
  await b.close()})();

// v215 (사용자 2026-10-31 "무공에 속성 제거하고 심법에 속성으로 무공 이펙트 색상이랑 연출", "적 무공 이펙트는 오로지 심법에 영향"):
// 무공 특성·속성 없음 — 주색·보조색·재질은 펼치는 사람의 심법. 적은 foeX(e) (g_fxcol.js)
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:1280,height:760}});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1500);
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:검"]');await p.click('[data-s="start"]');await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{
    const gone=['artTr','trOfName','trOfSrc','trCol','artMain','trHtml','FX_TR','ART_TR'].filter(k=>typeof window[k]!=='undefined'||(()=>{try{return eval('typeof '+k)!=='undefined'}catch(e){return false}})());
    const mine=Object.values(ARTS).filter(a=>!artForeign(a)),mains=new Set(mine.map(a=>a.c)),subs=new Set(mine.map(a=>a.c2));
    const pair=pFxPair(),base={c:[...mains][0],c2:[...subs][0]};
    // 심법을 바꾸면 모든 내 무공의 색·재질이 따라 바뀐다
    const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검'&&!ARTS[k].base&&!ARTS[k].sect),A=ARTS[id],el0=artEl(A);
    const sid='mudang',sm=simOf(sid)[0];P.sims=P.sims||{};P.sims[sm.id]=1;P.sim=sm.id;
    const sw={c:A.c,c2:A.c2,el:artEl(A),want:SECT_FX[sid],simEl:sm.el};
    // 그리기: 초식 효과의 c2·잔광·재질이 심법 것
    const X=mkX(id);X.t=2;const e=mkMob('목인장',P.x+1,P.y,{hp:999,atk:0,def:0,hm:0,sp:0,pal:'villager'});mobs.push(e);
    fx=[];projs=[];exec({p:'arc',rad:1.5,spread:1.6,m:.1,hits:1},e,X);for(let i=0;i<6;i++)update(.03);
    const glow=fx.filter(f=>f.glow&&f.t==='arc'),c2ok=glow.length&&glow.every(f=>f.c2===SECT_FX[sid][1]),after=glow.some(f=>f.col===SECT_FX[sid][1]),elOk=fx.some(f=>f.t==='el'&&f.el===sm.el);
    // 남의 문파 무공은 그 문파 무인이 쓰므로 그 문파 심법
    const fa=Object.values(ARTS).find(a=>a.sect==='shaolin'&&!P.arts[a.id]);
    return{gone,mains:mains.size,subs:subs.size,pair,base,sw,el0,c2ok,after,elOk,fa:{c:fa.c,c2:fa.c2,el:artEl(fa),want:SECT_FX.shaolin,simEl:simSectEl('shaolin')}}});
  ok(`무공 특성 함수·표가 없다 (${r.gone.join(',')||'없음'})`,!r.gone.length);
  ok(`내 무공은 모두 같은 심법 색: 주색 ${r.mains}가지 ${r.base.c}, 보조색 ${r.subs}가지 ${r.base.c2} = 심법 짝 ${r.pair[1]}`,r.mains===1&&r.subs===1&&r.base.c2===r.pair[1]);
  ok(`심법을 무당 심법으로 바꾸면 색 ${r.sw.c}/${r.sw.c2} = 무당 ${r.sw.want}, 재질 ${r.el0}→${r.sw.el} (심법 ${r.sw.simEl})`,r.sw.c===r.sw.want[0]&&r.sw.c2===r.sw.want[1]&&r.sw.el===r.sw.simEl);
  ok(`초식 효과 보조색 ${r.c2ok}, 잔광 ${r.after}, 재질 ${r.elOk}`,r.c2ok&&r.after&&r.elOk);
  ok(`남의 문파(소림) 무공은 소림 심법 색 ${r.fa.c}/${r.fa.c2}·속성 ${r.fa.el}`,r.fa.c===r.fa.want[0]&&r.fa.c2===r.fa.want[1]&&r.fa.el===r.fa.simEl);
  // 적: 문파 무인은 문파 심법, 산적은 사파 기초 심법(음), 짐승은 없음
  const f=await p.evaluate(()=>{const o={};
    const w=mkFac('정',1,P.x+3,P.y,'emei');const Xw=foeX(w);o.fac={c:Xw.art.c,c2:Xw.art.c2,el:Xw.el,want:SECT_FX.emei,simEl:simSectEl('emei')};
    const s=mkMob('산적두목',P.x+3,P.y);const Xs=foeX(s);o.band={c:Xs.art.c,el:Xs.el,eel:s.el,want:SCHOOL_FX['사공']};
    o.beast=foeX(mkMob(Object.keys(MOBS).find(k=>MOBS[k].beast),P.x+3,P.y));
    // 마교 무인 = 마기, 검게
    const m=mkFac('마',1,P.x+3,P.y,'cheonma'),Xm=foeX(m);o.ma={c:Xm.art.c,el:Xm.el,dark:isDark(Xm.art.c)};
    // 내려찍기: 실제 적 행동 코드에서 고리·재질이 그 적 심법 것
    loadRegion('pv_henan');mobs=[];for(let y=6;y<34&&!o.at;y++)for(let x=6;x<34;x++)if([...Array(25)].every((_,i)=>walk(x+i%5-2,y+Math.floor(i/5)-2))){P.x=x+.5;P.y=y+.5;o.at=1;break}
    const run=n=>{for(let i=0;i<n;i++){time+=.03;for(const m of mobs)updateMob(m,.03);updateEprojs&&updateEprojs(.03);runHooks('tick',.03)}};
    mobs=[];P.hp=P.maxHp=99999;const e=mkFac('마',1,P.x+1.2,P.y,'cheonma');e.d={...e.d,elite:1};e.aggro=true;e.tgt=P;e.slam=.01;e.slamAt={x:P.x,y:P.y};mobs.push(e);fx=[];
    run(3);const ring=fx.find(q=>q.t==='ring2');o.slam={col:ring&&ring.col,c2:ring&&ring.c2,el:fx.some(q=>q.t==='el'&&q.el==='마'),want:SECT_FX.cheonma};
    // 초식 외침 글자색
    texts=[];w.known=1;mobFormCall(w);o.call=texts.length&&texts[texts.length-1].c;o.callWant=`rgb(${Xw.art.ct})`;
    // 연사(원거리 정예): 화살 색·재질 꼬리
    mobs=[];eprojs=[];fx=[];const g=mkMob('산적궁수',P.x+3,P.y);g.d={...g.d,elite:1};g.aggro=true;g.tgt=P;g.skT=0;mobs.push(g);
    run(4);draw();const Xg=foeX(g);o.vol={n:eprojs.length,c:eprojs.every(q=>q.c===Xg.art.c),trail:fx.some(q=>q.t==='el'&&q.el===Xg.el)};
    return o});
  ok(`아미 무인 이펙트 = 아미 심법 ${f.fac.c}/${f.fac.c2} 속성 ${f.fac.el}`,f.fac.c===f.fac.want[0]&&f.fac.c2===f.fac.want[1]&&f.fac.el===f.fac.simEl);
  ok(`산적은 사파 기초 심법: 색 ${f.band.c}, 속성 ${f.band.el} (적 속성 ${f.band.eel})`,f.band.c===f.band.want&&f.band.el===f.band.eel&&f.band.el);
  ok(`짐승은 심법 없음 ${f.beast}`,f.beast===null);
  ok(`천마신교 무인은 마기 ${f.ma.el}, 검은 색 ${f.ma.dark}`,f.ma.el==='마'&&f.ma.dark);
  ok(`천마신교 정예 내려찍기 고리 ${f.slam.col}/${f.slam.c2} = 천마신교 심법, 마기 재질 ${f.slam.el}`,f.slam.col===f.slam.want[0]&&f.slam.c2===f.slam.want[1]&&f.slam.el);
  ok(`초식 외침 글자 ${f.call}`,f.call===f.callWant);
  ok(`연사 ${f.vol.n}발 심법 색 ${f.vol.c}, 재질 꼬리 ${f.vol.trail}`,f.vol.n>=3&&f.vol.c&&f.vol.trail);
  // 재질 입자: 보조색 쪽으로 물들고, 마기 연기는 검게 그대로
  const h=await p.evaluate(()=>{const X=mkX(P.cur);fx=[];
    elFx({t:'arc',x:P.x,y:P.y,ang:0,r:1.2,spread:1.6,flip:0,life:.3,max:.3},X,'화');const f=fx.find(q=>q.t==='el'),raw=EL_FX['화'].parts.map(x=>x[2]);
    fx=[];elFx({t:'arc',x:P.x,y:P.y,ang:0,r:1.2,spread:1.6,flip:0,life:.3,max:.3},X,'마');const d=fx.find(q=>q.t==='el');
    return{tinted:f.ps.every(q=>!raw.includes(q.col)),c2:f.c2===X.art.c2,dark:d.ps.every(q=>q.col===EL_FX['마'].parts[0][2]),purple:mixCol(HI_DARK,'150,225,50',.5,1),hiD:hiOf('28,6,40','110,20,150')}});
  ok(`재질 색이 심법 보조색에 물든다 ${h.tinted}, 심지 ${h.c2}, 마기 연기는 검게 ${h.dark}, 마기 심지 ${h.hiD}`,h.tinted&&h.c2&&h.dark&&h.hiD!=='150,40,190');
  {const[r,g,bb]=h.purple.split(',').map(Number);ok(`보라+초록 테두리는 주황으로 새지 않는다 (${h.purple})`,!(r>g&&g>bb&&r>150))}
  // 창안 무공: 특성을 적지 않는다, 무공 창에 '특성' 글자 없음
  const m=await p.evaluate(()=>{window.__noPrompt=1;
    const ids=Object.keys(ARTS).filter(k=>ARTS[k].cls==='검'&&!ARTS[k].sect&&!ARTS[k].gy&&!ARTS[k].base&&(ARTS[k].grade||0)===0).slice(0,5);
    for(const id of ids)P.arts[id]={p:100,f:ARTS[id].forms.map(()=>true)};
    const a=mkCreate({ids,g:0,cls:'검'}),def=G.made[a.id];const old={...def,tr:['꽃']};delete ARTS[a.id];const b2=mkBuild(old);
    openPanel('arts');const html=document.body.innerHTML;return{tr:'tr' in def,c:a.c===fxCol(a),old:b2.c2===pFxPair()[1],word:/특성 <b/.test(html)}}).catch(e=>({err:String(e)}));
  ok(`창안 무공은 특성이 없고 심법 색 ${JSON.stringify(m)}`,!m.err&&!m.tr&&m.c&&m.old&&!m.word);
  ok(`오류 없음 ${errs.slice(0,5).join(' | ')}`,errs.length===0);
  await b.close()})();

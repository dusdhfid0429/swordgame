// 핸드오프 시트 (v123): assets/wuxia 아틀라스·클립이 묶여 들어오고, 맨손 공격·회피·운기조식·수련 동작이 그 시트의 장으로 그려진다
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];
  p.on('dialog',d=>d.accept());p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForFunction(()=>typeof loadRegion==='function');
  await p.evaluate(()=>localStorage.clear());await p.click('[data-s="new"]');await p.click('[data-s="side:정"]');await p.click('[data-s="cls:권"]');await p.click('[data-s="start"]');await p.waitForFunction(()=>playing);
  await p.waitForFunction(()=>typeof sheetOk==='function'&&sheetOk('wuxia'),null,{timeout:10000});await p.waitForTimeout(200);
  // 1. 시트가 묶여 들어왔다: 145장 22클립, 장마다 같은 캔버스(327×337)·발 기준점, 무기 클립엔 손 소켓
  const s=await p.evaluate(()=>{const S=SHEETS.wuxia,f=S.frames;return{n:f.length,clips:Object.keys(S.clips).length,canvas:f.every(x=>x.s[0]===327&&x.s[1]===337&&x.pv[1]===1),
    sock:S.clips.spear_1.f.filter(i=>f[i].sk.hand).length,noSock:S.clips.punches.f.every(i=>!f[i].sk.hand),white:!!S.white,k:sheetK('wuxia')}});
  ok(`시트 ${s.n}장 ${s.clips}클립 · 같은 캔버스 ${s.canvas} · 창 클립 손 소켓 ${s.sock}장 · 맨손 클립 소켓 없음 ${s.noSock} · 번쩍 그림 ${s.white} · 배율 ${s.k.toFixed(3)}`,
    s.n===145&&s.clips===22&&s.canvas&&s.sock>=5&&s.noSock&&s.white&&s.k>.4&&s.k<.55);
  // 2. 맨손 공격은 시트 클립(punches/kicks/combo/palm_strikes)을 쓰고 heroFrame이 시트 이름을 돌려준다. 발차기 무공은 각 줄(kicks)
  const a=await p.evaluate(()=>{P.satk=0;P.runT=0;P.sj=0;const r={};heroAtk('flat',null);r.flat=[P.ssh,P.sset.join(','),heroFrame()];heroAtk('vert',null);r.vert=P.sset.join(',');heroAtk('palm',null);r.palm=P.sset.join(',');
    heroAtk('flat',{n:'선풍각'});r.kick=P.sset.join(',');P.satk=0;const S=SHEETS.wuxia.clips;r.c={punches:S.punches.f.join(','),kicks:S.kicks.f.join(','),palm:S.palm_strikes.f.join(',')};r.after=heroFrame();return r});
  ok(`맨손 공격 ${a.flat[0]} ${a.flat[1]} (장 ${JSON.stringify(a.flat[2])}) · 세로 ${a.vert} · 장타 ${a.palm} · 발차기 무공 ${a.kick} · 공격 뒤 대기 ${JSON.stringify(a.after)}`,
    a.flat[0]==='wuxia'&&a.flat[1]===a.c.punches&&a.flat[2][4]==='wuxia'&&a.flat[2][0]===79&&a.vert===a.c.kicks&&a.palm===a.c.palm&&a.kick===a.c.kicks&&!a.after[4]);
  // 3. 운기조식·수련·피동 회피·달리기(맨손)는 시트 장. 검은 운기조식만 시트, 회피·달리기는 예전 그대로
  const st=await p.evaluate(()=>{const r={};P.satk=0;P.runT=0;P.medit=true;r.med=heroFrame();P.medit=false;trnBusy={k:'str',t:0,dur:9};r.str=heroFrame();trnBusy={k:'pg2',t:0,dur:9};r.pg=heroFrame();trnBusy=null;
    P.dA=time-.1;r.dodge=heroFrame();P.dA=0;P.runT=.3;P.runPh=.2;r.run=heroFrame();P.runT=0;
    const S=SHEETS.wuxia.clips;r.c={med:S.meditate.f,str:S.strength_1.f,pg:S.waterfall_stance.f,dodge:S.dodge.f,run:S.run.f};
    const id=Object.keys(ARTS).find(k=>ARTS[k].cls==='검');P.arts[id]=P.arts[id]||{p:0,f:[true,false,false]};P.cur=id;P.eq.weapon=mkWeapon('검',1,0);recalc();
    P.medit=true;r.swMed=heroFrame();P.medit=false;P.dA=time-.1;r.swDodge=heroFrame();P.dA=0;P.runT=.3;r.swRun=heroFrame();P.runT=0;return r});
  const inC=(f,c)=>f[4]==='wuxia'&&c.includes(f[0]);
  ok(`운기조식 ${JSON.stringify(st.med)} · 근력 수련 ${JSON.stringify(st.str)} · 폐관 ${JSON.stringify(st.pg)} · 회피 ${JSON.stringify(st.dodge)} · 달리기 ${JSON.stringify(st.run)} · 검: 운기 ${st.swMed[4]} 회피 ${st.swDodge[4]} 달리기 ${st.swRun[4]}`,
    inC(st.med,st.c.med)&&inC(st.str,st.c.str)&&inC(st.pg,st.c.pg)&&inC(st.dodge,st.c.dodge)&&inC(st.run,st.c.run)&&st.swMed[4]==='wuxia'&&!st.swDodge[4]&&!st.swRun[4]);
  // 4. 시트 장으로 그릴 때 오류 없고, 발 기준점이 맞다: 가부좌 장의 아래끝이 발(0) 근처, 위끝은 위로
  const d=await p.evaluate(()=>{P.medit=true;draw();P.medit=false;const S=SHEETS.wuxia,i=S.clips.meditate.f[0],f=S.frames[i],k=sheetK('wuxia'),[x,y]=sheetXY('wuxia',i,f.o[0],f.o[1],k);return{bottom:y+f.r[3]*k,top:sheetTop('wuxia',i,k),x}});
  ok(`그리기 오류 없음 · 가부좌 장 아래끝 ${d.bottom.toFixed(1)} 위끝 ${d.top.toFixed(1)} 왼끝 ${d.x.toFixed(1)}`,Math.abs(d.bottom-3)<1&&d.top<-50&&d.x<0&&d.x>-60);
  // 5. 아틀라스 파일: 검·도·창·봉 공격 클립 51장 모두 hand 소켓, 창·봉은 hand2, 검·도는 aim (v124 손으로 찍음)
  const atlas=require('../assets/wuxia/wuxia.atlas.json'),clips=require('../assets/wuxia/wuxia.clips.json').clips,FR=Object.values(atlas.frames);
  const has=(c,n)=>clips[c].frames.every(i=>FR[i].sockets.some(s=>s.name===n));
  const all=['sword_thrust','sword_slash','saber_heavy','saber_whirlwind','spear_1','spear_2','staff_1','staff_2'].every(c=>has(c,'hand')),pole=['spear_1','spear_2','staff_1','staff_2'].every(c=>has(c,'hand2')),one=['sword_thrust','sword_slash','saber_heavy','saber_whirlwind'].every(c=>has(c,'aim'));
  ok(`atlas.json 무기 클립 소켓: hand ${all} · 자루 hand2 ${pole} · 한손 aim ${one} · 소켓 있는 장 ${FR.filter(f=>f.sockets.length).length}`,all&&pole&&one&&FR.filter(f=>f.sockets.length).length===51);
  // 6. 검·도·창·봉 공격은 시트 클립 + 소켓 무기 선: 창은 두 손 가운데에서 뒷손→앞손 방향, 검은 hand→aim. 그리기 오류 없음
  const wp=await p.evaluate(()=>{const useCls=w=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===w);P.arts[id]=P.arts[id]||{p:0,f:[true,false,false]};P.cur=id;P.eq.weapon=mkWeapon(w,1,0);recalc()};const r={};
    for(const w of['검','도','창','봉']){useCls(w);heroAtk('flat',null);const f=heroFrame();r[w]={sheet:f[4],clip:ANIM.atk.wx[w].flat,inClip:SHEETS.wuxia.clips[ANIM.atk.wx[w].flat].f.includes(f[0]),line:sheetWeaponLine('wuxia',f[0],w)};P.satk=.3;draw();P.satk=0}
    const s=SHEETS.wuxia.frames[52].sk,l=sheetWeaponLine('wuxia',52,'창');r.spearMid=Math.abs(l[0]-(s.hand[0]+s.hand2[0])/2)<.01&&l[2]>l[0];const k=SHEETS.wuxia.frames[123].sk,l2=sheetWeaponLine('wuxia',123,'검');r.sword=l2[0]===k.hand[0]&&l2[2]===k.aim[0];r.none=sheetWeaponLine('wuxia',79,'검')===null;return r});
  ok(`무기 공격: ${['검','도','창','봉'].map(w=>w+' '+wp[w].clip+(wp[w].sheet==='wuxia'&&wp[w].inClip&&wp[w].line?' ✓':' ✗')).join(' · ')} · 창 가운데 ${wp.spearMid} · 검 hand→aim ${wp.sword} · 맨손 장 소켓 없음 ${wp.none}`,
    ['검','도','창','봉'].every(w=>wp[w].sheet==='wuxia'&&wp[w].inClip&&wp[w].line)&&wp.spearMid&&wp.sword&&wp.none);
  // 7. 무기 파츠 시트 (v125): 무기 5종 36장 + 검집·도집 14장, 장마다 grip·tip·butt 소켓, 각도에 가장 가까운 장을 골라 손에 붙인다. 코드 무기 대신 시트가 그려진다. 칼집은 허리춤에
  await p.waitForFunction(()=>sheetOk('wpn'),null,{timeout:10000});
  const wp2=await p.evaluate(()=>{const S=SHEETS.wpn,r={n:S.frames.length,clips:Object.keys(S.clips).sort().join(','),sock:S.frames.every(f=>f.sk.grip&&f.sk.tip&&f.sk.butt)};
    const fr=wpnFrames('검');r.swordAngs=fr.map(x=>Math.round(x.ang*180/Math.PI)).sort((a,b)=>a-b).join(',');r.spearLen=Math.round(wpnFrames('창')[0].len);
    // 그리기: 코드 무기 대신 시트가 그려지는지 (sheetWeaponDraw가 true를 돌려주고 drawImage가 불린다)
    let drawn=0;const od=ctx.drawImage;ctx.drawImage=function(){drawn++;return od.apply(this,arguments)};r.sword=sheetWeaponDraw('검',[0,0,30,0],'b',false);r.none=sheetWeaponDraw('권',[0,0,30,0],'b',false);r.sheath=drawSheath('검',150,260,false)&&drawSheath('도',150,260,false)&&drawSheath('창',150,260,false)===false;ctx.drawImage=od;r.drawn=drawn;
    draw();return r});
  ok(`무기 파츠 시트 ${wp2.n}장 [${wp2.clips}] 소켓 ${wp2.sock} · 검 장 각도 ${wp2.swordAngs} · 창 길이 ${wp2.spearLen}px · 시트로 그림 ${wp2.sword}(drawImage ${wp2.drawn}) · 맨손은 없음 ${wp2.none===false} · 칼집 ${wp2.sheath}`,
    wp2.n===50&&wp2.clips==='검,검집,궁,도,도집,봉,창'&&wp2.sock&&wp2.swordAngs.split(',').length===6&&wp2.spearLen>150&&wp2.sword&&wp2.drawn===3&&wp2.none===false&&wp2.sheath);
  // 8. (v126) 대기·달리기·공격·경공 어느 장에서도 몸 키와 무기 크기가 같은 기준: 무기를 든 대기 실루엣 높이가 핸드오프 공격 장과 같은 60~76px 안, 무기 배율은 WPN_K로 되돌려진다
  const sz=await p.evaluate(()=>{paused=true;const od=draw;draw=()=>{};mobs=[];const useCls=w=>{const id=Object.keys(ARTS).find(k=>ARTS[k].cls===w);P.arts[id]=P.arts[id]||{p:0,f:[true,false,false]};P.cur=id;P.eq.weapon=mkWeapon(w,1,0);recalc()};
    const o=toScreen(P.x,P.y),r={};for(const w of['검','창','봉']){useCls(w);P.runT=0;P.satk=0;P.sj=0;P.hit=0;P.inv=0;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.translate(300-o.x,400-o.y);P.fx=1;P.fy=.3;drawFighter(P,true);ctx.restore();
      const d=ctx.getImageData(0,0,600,420).data;let top=999;for(let y=0;y<398&&top===999;y++)for(let x=0;x<600;x++)if(d[(y*600+x)*4+3]>40){top=y;break}r[w]=400-top}
    // 무기 배율: 같은 무기 선을 K2 배율 장과 .47 배율 장에서 그릴 때 drawImage의 변환 배율이 같다
    const sc=[];const odi=ctx.drawImage;ctx.drawImage=function(){const t=ctx.getTransform();sc.push(Math.hypot(t.a,t.b));return odi.apply(this,arguments)};
    for(const k of[.47,K2]){ctx.setTransform(1,0,0,1,0,0);ctx.save();ctx.scale(k,k);WPN_K=k;sheetWeaponDraw('창',[0,0,30,0],'b',false);ctx.restore()}ctx.drawImage=odi;WPN_K=.47;r.wk=sc.map(v=>v.toFixed(2));draw=od;paused=false;return r});
  ok(`무기 든 대기 실루엣 높이 검 ${sz.검} 창 ${sz.창} 봉 ${sz.봉} px · 무기 배율 (.47 장 / K2 장) ${sz.wk.join(' / ')}`,[sz.검,sz.창,sz.봉].every(h=>h>=60&&h<=76)&&sz.wk[0]===sz.wk[1]);
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close()})();

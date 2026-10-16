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
  // 5. 아틀라스 파일 자체: 소켓은 자동 추정 표시(auto)
  const atlas=require('../assets/wuxia/wuxia.atlas.json'),hand=Object.values(atlas.frames).filter(f=>f.sockets.length);
  ok(`atlas.json 손 소켓 ${hand.length}장, 모두 auto 표시 ${hand.every(f=>f.sockets.every(s=>s.auto))}`,hand.length>=40&&hand.every(f=>f.sockets.every(s=>s.auto)));
  if(errs.length){console.log('ERRORS');console.log(errs.join('\n'))}
  await b.close()})();

// 저장 형식 번호: 옛 저장(v0, 번호 없음)을 불러오면 지금 형식으로 옮기고, 새 저장에는 번호가 붙는다.
// tests/fixtures/save_v0.json 은 v47 빌드로 만든 실제 저장에서 v42 이후 생긴 칸을 지우고 옛 문파(흑사방)·옛 무공 번호(S21_0)를 넣은 것이다.
const {chromium}=require(process.env.PWPATH||'playwright');
const fs=require('fs'),path=require('path');
const V0=fs.readFileSync(path.join(__dirname,'fixtures/save_v0.json'),'utf8');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+path.resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1200);
  // 옛 저장을 넣고 "이어하기"
  await p.evaluate(raw=>{localStorage.clear();localStorage.setItem(SAVE_KEY,raw)},V0);
  await p.reload();await p.waitForTimeout(1200);await p.click('[data-s="cont"]');await p.waitForTimeout(1000);
  const a=await p.evaluate(()=>({playing,name:P.name,silver:P.silver,sect:P.sect,merit:P.merit.sama,old:P.merit.heuksa,art:!!P.arts.S_sama_0,oldArt:!!P.arts.S21_0,
    realm:P.realm,qr:qiRealm(),inj:P.inj,enl:P.enl,peaks:typeof P.peaks,qiX:P.qiX,lifeQB:P.lifeQB,log:$('log').textContent}));
  ok(`옛 저장을 이어하기: ${a.name}, 은 ${a.silver}`,a.playing&&a.name==='옛저장'&&a.silver===321);
  ok(`옛 문파 흑사방 → ${a.sect} (공적 ${a.merit}), 알림`,a.sect==='sama'&&a.merit===50&&a.old==null&&/사마세가로 옮겨졌습니다/.test(a.log));
  ok('옛 무공 번호 S21_0 → S_sama_0',a.art&&!a.oldArt);
  ok(`경지는 내공으로 정함: ${a.realm} = ${a.qr}`,a.realm===a.qr&&a.realm>=1);
  ok(`새로 생긴 칸 채움: 부상 ${a.inj}, 깨달음 ${a.enl}, 명산 ${a.peaks}, 수명 보정 ${a.lifeQB}`,a.inj===0&&a.enl===0&&a.peaks==='object'&&a.qiX===0&&a.lifeQB===Math.floor(a.lifeQB)&&a.lifeQB>0);
  // 다시 저장하면 번호가 붙고, 옮긴 결과가 그대로 남는다
  const s=await p.evaluate(()=>{saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));return{v:d.v,ver:SAVE_VER,sect:d.P.sect,notes:(d.notes||[]).length}});
  ok(`새 저장에 형식 번호 v${s.v}`,s.v===s.ver&&s.sect==='sama'&&!s.notes);
  // 지금 형식은 옮기지 않는다 (여러 번 불러도 같다)
  const i=await p.evaluate(()=>{const raw=localStorage.getItem(SAVE_KEY),a=JSON.stringify(migrateSave(JSON.parse(raw))),b=JSON.stringify(migrateSave(migrateSave(JSON.parse(raw))));return a===b&&JSON.parse(a).P.sect==='sama'});
  ok('옮기기는 한 번만: 두 번 불러도 같음',i);
  // 옛 저장을 옮기는 것은 저장 자료만 고치고 게임 상태는 건드리지 않는다
  const pure=await p.evaluate(raw=>{const before=JSON.stringify(P);migrateSave(JSON.parse(raw));return JSON.stringify(P)===before},V0);
  ok('옮기기는 게임 상태를 건드리지 않음',pure);
  // 새것보다 새 형식(앞으로의 버전)은 그대로 두고 경고만
  const fut=await p.evaluate(()=>{const d={v:SAVE_VER+1,P:{x:1}};return migrateSave(d).v===SAVE_VER+1});
  ok('앞선 형식은 건드리지 않음',fut);
  console.log(errs.filter(e=>!/저장 형식/.test(e)).length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

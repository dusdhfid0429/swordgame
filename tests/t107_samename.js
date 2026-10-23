// 같은 이름 무공은 하나 (사용자 2026-10-23): 기본 무공 정도0(오호단문도)·정검0(양의검법)은 문파 무공을 가리키는 별칭이고,
// 옛 저장에서 두 번호로 따로 익힌 것은 하나로 합쳐진다 (숙련은 큰 쪽, 익힌 초식 수 유지)
const {chromium}=require(process.env.PWPATH||'playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch();const errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});p.on('dialog',d=>d.accept());
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  await p.goto('file://'+path.resolve(__dirname,'../dist/gangho.html')+'?noacad');await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{const seen={},dup=[];for(const a of Object.values(ARTS)){if(!a.side)continue;const k=a.side+a.cls+a.n;if(seen[k])dup.push(a.n);seen[k]=1}
    return{dup,o:ARTS['정도0'].id,y:ARTS['정검0'].id,yf:ARTS['정검0'].forms[0].n,t:ARTS['정검2'].n,enumO:Object.keys(ARTS).includes('정도0'),al:artAliases()}});
  ok(`이름 겹치는 무공 없음 ${r.dup.join(',')}`,!r.dup.length);
  ok(`정도0 → ${r.o}, 정검0 → ${r.y} (초식 ${r.yf}), 열거 안 됨`,r.o==='S_paeng_0'&&/^S_/.test(r.y)&&r.yf==='이지작검'&&!r.enumO);
  ok(`고급 무공과 겹치던 기본 검법 이름: ${r.t}`,r.t==='태청검법');
  // 새 판: 비급을 기본 번호로 읽어도 문파 무공으로 익힌다
  await p.click('[data-s="new"]');await p.waitForTimeout(300);await p.click('[data-s="start"]');await p.waitForTimeout(1200);
  const n=await p.evaluate(()=>{P.side='정';const it=mkBook('정도0',0);P.bag.push(it);P.vit=9999;const why=readBlock(it);if(why)return{why};readBook(it);return{has:!!P.arts.S_paeng_0,old:!!P.arts['정도0'],f:P.arts.S_paeng_0.f[0]}});if(n.why)console.log(n.why);
  ok('기본 번호 비급 → 문파 무공으로 익힘',n.has&&!n.old&&n.f);
  // 옛 저장: 정도0 숙련 17·초식 5개(필살기까지), S_paeng_0 숙련 0·초식 1개, 지금 펼치는 무공 정도0, 행낭에 정도0 다섯째 초식 비급
  const m=await p.evaluate(()=>{saveGame(true);const d=JSON.parse(localStorage.getItem(SAVE_KEY));d.v=4;
    d.P.arts['정도0']={p:17,f:[true,true,true,true,true]};d.P.arts.S_paeng_0={p:0,f:[true,false,false,false]};d.P.cur='정도0';
    d.P.bag.push({id:9991,slot:'book',art:'정도0',form:4,name:'오호단문도 비급 · 송학일섬',price:120});
    const x=migrateSave(d),a=x.P.arts;return{V:SAVE_VER,v:x.v,keys:Object.keys(a).filter(k=>k==='정도0'||k==='S_paeng_0'),pm:a.S_paeng_0.p,f:a.S_paeng_0.f,cur:x.P.cur,bk:x.P.bag.find(i=>i.id===9991),n:ARTS.S_paeng_0.forms.length}});
  ok(`저장 v${m.v}: 하나로 합침 ${m.keys}, 숙련 ${m.pm}, 초식 ${m.f}`,m.v===m.V&&m.keys.join()==='S_paeng_0'&&m.pm===17&&m.f.length===m.n&&m.f.every(Boolean));
  ok(`펼치는 무공 ${m.cur}, 비급 ${m.bk.art}·${m.bk.form} ${m.bk.name}`,m.cur==='S_paeng_0'&&m.bk.art==='S_paeng_0'&&m.bk.form===m.n-1&&!/송학일섬/.test(m.bk.name));
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');
  await b.close();
})();

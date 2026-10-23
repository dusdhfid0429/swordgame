// ================= 문파원 동원 (v171, 사용자 2026-10-23) =================
// 문파에 들어가 직위가 오르면 문파원을 불러 함께 싸운다. 직위가 높을수록 많이, 높은 경지로, 고수를 섞어 온다 (data/mobil.json MOBIL.rank).
// - 문파창에서 공적을 쓰고 해마다 한 번 부른다. 문파 인원 popPer명마다 한 명까지만 온다. 봉문·점령 중이면 못 부른다.
// - 문파원은 동료(allies, kind 'sect')로 따라다니며 싸우다 dur초 뒤 본산으로 돌아간다. 문파를 떠나도 돌아간다.
// - 쓰러지면 그만큼 문파 인원이 준다 (loss: 무인·고수). 동원 중인 문파원도 폐관 호법이 된다 (g_realm.js hobeop).
const MOBIL=GD.MOBIL;
function mobilRow(){const sid=P&&P.sect;if(!sid||!SECTS[sid])return null;const t=MOBIL.rank;return P.leader===sid?MOBIL.leader:t[Math.min(t.length-1,rankIdx(sid))]}
const mobilOut=()=>allies.filter(a=>a.kind==='sect'&&a.hp>0);
function mobilPlan(){const r=mobilRow();if(!r||!r.n)return null;const sid=P.sect,n=Math.max(0,Math.min(r.n,Math.floor(sectPop(sid)/MOBIL.popPer))),e=Math.min(r.e,n);
  return{sid,n,e,r:r.r,re:r.re,cost:(n-e)*MOBIL.merit[0]+e*MOBIL.merit[1]}}
function mobilWhy(){
  const s=P.sect&&SECTS[P.sect];if(!s)return'문파에 들어가야 문파원을 부를 수 있다';
  const p=mobilPlan();if(!p)return`${rankName(s.id,1)} 이상이 되어야 문파원을 부를 수 있다`;
  if(G.seal&&G.seal[s.id])return'봉문 중이라 문파원이 산문을 나서지 못한다';
  if(G.occ&&G.occ[s.id])return'본산이 점령당해 부를 문파원이 없다';
  if(p.n<=0)return'문파 인원이 너무 적어 보낼 사람이 없다';
  if(mobilOut().length)return'이미 문파원이 곁에 있다';
  if(P.mobY===Math.floor(realAge()))return'올해는 이미 문파원을 불렀다';
  if(G.duel||P.jail||(typeof inAcad==='function'&&inAcad()))return'지금은 문파원을 부를 수 없다';
  if((P.merit[s.id]||0)<p.cost)return`공적이 모자라다 (필요 ${p.cost})`;
  return''}
function mobilize(){
  const why=mobilWhy();if(why){log(why+'.','info');return false}
  const p=mobilPlan(),s=SECTS[p.sid],f=alFac(s.al),names=MOBIL.names.slice();P.merit[s.id]-=p.cost;P.mobY=Math.floor(realAge());
  for(let i=0;i<p.n;i++){const elite=i<p.e,realm=elite?p.re:p.r,ang=i/p.n*Math.PI*2;let x=P.x+Math.cos(ang)*1.1,y=P.y+Math.sin(ang)*1.1;if(!walkAt(x,y)){x=P.x;y=P.y}
    const m=mkFac(f,elite,x,y,s.id),rank=Math.min(realm,rankTop(s.id)),cls=(s.arts.find(q=>q.id===m.art)||{}).cls||'검';m.realm=realm;m.rank=rank;scaleMob(m);
    const nm=names.splice(Math.floor(Math.random()*names.length),1)[0]||pick(MOBIL.names),a=mkAlly('sect',`${rankName(s.id,rank)} ${nm}`,x,y);
    Object.assign(a,{k:rankName(s.id,rank),sect:s.id,rank,realm,elite:elite?1:0,pal:sectPal(s.id,rank,cls,{elite})||m.pal,hp:m.maxHp,maxHp:m.maxHp,atk:m.atk,def:m.def,reach:m.reach,sp:Math.max(2.6,m.sp||0),left:MOBIL.dur});
    a.d={pal:a.pal};allies.push(a);fx.push({t:'puff',x,y,life:.6})}
  log(`${s.n}의 문파원 ${p.n}명${p.e?`(고수 ${p.e})`:''}이(가) 달려왔습니다. 공적 ${p.cost}. ${MOBIL.dur}초 동안 함께 싸웁니다.`,'xp');
  showBanner(`${s.n} 동원`,`문파원 ${p.n}명`);return true}
function mobilBack(why){const l=mobilOut();if(!l.length)return;allies=allies.filter(a=>a.kind!=='sect');for(const a of l)fx.push({t:'puff',x:a.x,y:a.y,life:.6});
  log(`문파원 ${l.length}명이 본산으로 돌아갔습니다${why?` (${why})`:''}.`,'sys')}
hook('allyTick',(a,dt)=>{if(a.kind!=='sect')return;a.left-=dt;if(a.left<=0)mobilBack('동원 기한')});
hook('allyDown',a=>{if(a.kind!=='sect'||!a.sect)return;popLose(a.sect,MOBIL.loss[a.elite?1:0],'');log(`${SECTS[a.sect].n} 인원이 ${MOBIL.loss[a.elite?1:0]}명 줄었습니다.`,'dmg')});
hook('sectActDone',c=>{if(c.a==='sleave'&&!P.sect)mobilBack('하산')});
hook('sectAct',c=>{if(c.a==='mobil'){c.done=true;c.r=true;if(mobilize())closePanels()}else if(c.a==='mobback'){c.done=true;c.r=true;mobilBack('돌려보냄')}});
// 문파창 (g_sect.js membership)
function mobilHtml(s){if(P.sect!==s.id)return'';const p=mobilPlan(),out=mobilOut(),why=mobilWhy(),t=MOBIL.rank;
  const rows=t.map((r,i)=>r.n?`${rankName(s.id,i)} ${r.n}명${r.e?`(고수 ${r.e})`:''}`:null).filter(Boolean).join(' · ');
  return `<div class="card"><h4>문파원 동원 ${out.length?`<small class="dim">함께 있는 문파원 ${out.length}명 · ${Math.ceil(Math.max(...out.map(a=>a.left)))}초 남음</small>`:''}</h4>
    <p class="note">${p&&p.n?`지금 직위로 ${p.n}명${p.e?` (고수 ${p.e}명, ${RANKS[p.re]})`:''}, ${RANKS[p.r]} 무인 · 공적 ${p.cost} · ${MOBIL.dur}초 · 해마다 한 번. 쓰러지면 문파 인원이 준다.`:''}${why&&!out.length?` <b class="bad">${why}</b>`:''}</p>
    <p class="dim">${rows}</p>
    <div class="row2">${out.length?B('mobback','돌려보내기'):B('mobil',`문파원 부르기${p&&p.n?` · 공적 ${p.cost}`:''}`,{pri:1,d:!!why})}</div></div>`}

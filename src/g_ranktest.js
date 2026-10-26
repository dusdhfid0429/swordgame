// ================= 승급 시험 (v176, 사용자 2026-10-26) =================
// "문파 직위 상승도 자동 상승이 아니라 직접 신청하고 시험을 통과해 직위가 상승하게"
// - 직위는 P.srank[문파]에 적힌다 (본산에서 가입할 때 0). 누적 공적(RANK_PTS)과 경지 상한(RANK_CAP)은 시험을 청할 자격일 뿐이다.
// - 자격이 되면 알림이 한 번 뜨고, 본산의 문파 주인 창 직위 칸에 '승급 시험 청하기'가 켜진다. 본산 밖에서는 못 청한다.
// - 시험은 비무 틀(G.duel)을 빌린다: 그 자리에서 시험관(다음 직위에 걸맞은 경지, 생명 ×2.2·공격 ×0.6)과 겨룬다. 목숨은 걸지 않는다.
//   이기면 직위가 오르고, 지거나 RANK_TEST.ring칸 밖으로 나가면 떨어진다. 떨어지면 retry년(낮밤 세 바퀴쯤) 뒤에 다시 청할 수 있다.
// 데이터 data/ranktest.json, 테스트 tests/t112_ranktest.js
const RT=GD.RANK_TEST;
const rtNext=sid=>Math.min(rankIdx(sid)+1,rankTop(sid));
// 시험을 못 청하는 까닭 (없으면 ''). where=false면 본산에 있는지는 보지 않는다
function rtWhy(sid,where=true){const s=SECTS[sid];if(!s||P.sect!==sid||!P.srank)return'문파 제자만 청할 수 있다';
  const i=rankIdx(sid),to=i+1;if(i>=rankTop(sid))return'이미 가장 높은 직위다';
  if(rankRaw(sid)<to)return`누적 공적이 ${RANK_PTS[to]}이어야 ${rankName(sid,to)} 시험을 청할 수 있다 (지금 ${(P.mtot||{})[sid]||0})`;
  if(rankCap()<to)return`${rankName(sid,to)} 시험은 ${capNeed(to)} 이상이어야 청할 수 있다`;
  const c=(P.rtCool||{})[sid];if(c!=null&&P.age<c)return`지난 시험에 떨어져 조금 더 수련해야 한다 (${Math.max(1,Math.ceil((c-P.age)*12))}달 뒤)`;
  if(G.duel||P.jail||P.hp<=0)return'지금은 시험을 청할 수 없다';
  if(where&&!(panel==='npc'&&panelArg&&panelArg.hq===sid))return`본산 ${hqPlace(s)}에서 ${masterTitle(s)}에게 청한다`;
  return''}
// 자격이 새로 닿으면 한 번 알린다 (공적이 오를 때 g_faction.js addMerit, 경지가 오를 때 rankRealmUp이 부른다)
function rtNotice(sid){if(!P||!P.srank||P.sect!==sid||rtWhy(sid,false))return;const to=rtNext(sid);P.rtN=P.rtN||{};if(P.rtN[sid]===to)return;P.rtN[sid]=to;const s=SECTS[sid];
  log(`${s.n} ${rankName(sid,to)} 승급 시험을 청할 수 있습니다. 본산 ${hqPlace(s)}의 ${masterTitle(s)}에게 가세요.`,'xp')}
// 문파 창 직위 칸에 붙는 줄 (g_faction.js rankHtml)
function rtHtml(s){if(P.sect!==s.id)return'';const i=rankIdx(s.id);if(i>=rankTop(s.id))return'';const why=rtWhy(s.id),to=i+1;
  return `<div class="row2"><span class="note">다음 직위 <b>${rankName(s.id,to)}</b>는 승급 시험에 붙어야 오른다.${why?` <small class="dim">${why}</small>`:' 시험관과 비무해 이기면 된다.'}</span>${B('rtest:'+s.id,'승급 시험 청하기',{pri:!why,d:!!why})}</div>`}
function rtStart(sid){if(rtWhy(sid))return;const s=SECTS[sid],to=rtNext(sid),r=clamp(to-GD.RANK_CAP.plus,0,6),[a,h,m]=STD[r];
  const st=typeof startSet==='function'?startSet(s):null,cls=st&&st.w&&st.w!=='궁'?st.w:(s.arts.find(q=>q.cls!=='궁')||s.arts[0]).cls,ar=s.arts.find(q=>q.cls===cls&&!q.hi)||s.arts[0];
  const exr=Math.min(rankTop(sid),to+1),nm=`${s.n} 시험관`;
  log(`${masterTitle(s)}: "${josa(RT.say[s.al].replace('{rank}',rankName(sid,to)))}"`,'info');
  closePanels();G.duel=true;G.rtDuel={sid,to,x:P.x,y:P.y};for(const o of mobs)if(o.aggro){o.aggro=false;o.tgt=null}
  P.path=null;P.target=null;P.leap=null;P.hp=P.maxHp;P.qi=P.maxQi;
  let ex=P.x+2.4,ey=P.y;if(!walkAt(ex,ey)){ex=P.x-2.4;if(!walkAt(ex,ey)){ex=P.x;ey=P.y+2.4}}
  const e=mkMob(nm,ex,ey,{hp:Math.round(h*RT.hp),atk:Math.round(a*RT.atk),def:Math.round(2+r*1.5),hm:m,sp:2.2,reach:cls==='창'?1.8:cls==='봉'?1.6:1.4,el:ar.el,pal:'duelist',hostile:1,aggro:9,duelist:1,elite:1});
  const hp=Math.round(h*RT.hp);Object.assign(e,{hp,maxHp:hp,atk:Math.round(a*RT.atk),def:Math.round(2+r*1.5),hm:m,duel:1,aggro:true,realm:r,wcls:cls,art:ar.id,rtExam:1});
  e.d=Object.assign({},e.d,{pal:(typeof sectPal==='function'&&sectPal(sid,exr,cls,{elite:1}))||'duelist'});e.name=`${nm} · ${rankName(sid,exr)}`;
  mobs.push(e);P.target=e;showBanner('승급 시험',`${s.n} ${rankName(sid,to)}`);log(`승급 시험 시작: ${e.name} (${CLASS[cls].n}). ${RT.ring}칸 밖으로 나가면 떨어진다.`,'sys')}
function rtEnd(win,e){const t=G.rtDuel;G.duel=false;G.rtDuel=null;mobs=mobs.filter(m=>!m.duel);P.target=null;if(!t)return;const s=SECTS[t.sid];
  if(!win){P.hp=Math.max(1,Math.round(P.maxHp*.3));(P.rtCool=P.rtCool||{})[t.sid]=P.age+RT.retry;log(`${s.n} ${rankName(t.sid,t.to)} 승급 시험에 떨어졌습니다. 더 수련하고 다시 청하세요.`,'dmg');showBanner('시험 낙방',s.n);return}
  P.srank=P.srank||{};P.srank[t.sid]=t.to;const n=rankName(t.sid,t.to);
  showBanner(`${s.n} ${n}`,'승급 시험에 붙었습니다');log(`승급 시험에 붙어 ${s.n}의 ${n}(으)로 올랐습니다. ${rankPerk(t.to)}`,'xp');feat(`승급 시험에 붙어 ${s.n}의 ${n}이(가) 되었다`);
  log(`${n}의 의복으로 갈아입었습니다.`,'sys');if(typeof garbSync==='function')try{garbSync()}catch(err){}recalc()}
hook('sectAct',c=>{if(c.a!=='rtest')return;c.done=true;c.r=true;rtStart(c.x)});
// 시험 자리에서 멀어지면 떨어진다
hook('tick',()=>{const t=G.rtDuel;if(!t||!P||!playing)return;if(Math.hypot(P.x-t.x,P.y-t.y)>RT.ring){log('시험 자리를 벗어나 승급 시험에서 떨어졌습니다.','dmg');duelEnd(false)}});
// 시험 중에 기록된 저장을 불러오면 시험은 없던 것으로
hook('gLoaded',()=>{if(G.rtDuel){G.rtDuel=null;G.duel=false}});

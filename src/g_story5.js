// ================= 2막: 두 번째 천하대전 (사용자 2026-10-19 v153) =================
// "두번째 천하대전은 첫번째 천하대전의 승리한 세력에 따라 스토리가 다르게. 예: 마교가 통일한 경우 천하가 어둡고 정파가 어둠을 걷어내기 위한 스토리"
// - 첫 천하대전이 끝나면(warEnded 훅) P.story.act=2, br=승자 첫 세력(중재·무승부면 peace), rule=승자 편. data/story2.json STORY2.BR[br]
// - 사건 셋(T.ev 나이)은 '천하를 쥔 편(rule)'과 '맞서는 편(resist)'의 선택으로 갈리고, T.war 나이에 제2차 천하대전: 승자 편 대 저항 연합
// - 엔진은 g_story.js 그대로(curEv·warAge·lastEv가 막을 가린다). 결전·결전장·천하통일도 똑같이 돈다
// 이 파일에는 함께: 봉문·점령의 시간(DECAY), 결전 공로(MERIT), 천하통일 세상(WORLD)
const A2EV={};
function act2Ev(br){if(A2EV[br])return A2EV[br];const b=S2.BR[br]||S2.BR.peace;
  return A2EV[br]=b.ev.map((e,i)=>({...e,id:`b2_${br}_${i}`,age:S2.T.ev[i]}))}
function act2Find(id){const m=/^b2_(.+)_(\d+)$/.exec(id||'');if(!m||!S2.BR[m[1]])return null;return act2Ev(m[1])[+m[2]]||null}
const ruleFacs=()=>(P&&P.story&&P.story.rule)||[];
const resistFacs=()=>['정','사','마'].filter(f=>!ruleFacs().includes(f));
const myRole=()=>ruleFacs().includes(myFac())?'rule':'resist';
const act2Kinds=foe=>{const fs=foe==='rule'?ruleFacs():resistFacs(),out=[];for(const f of fs)out.push(...FAC_KIND[f]);return out.length?out:['혈교무인']};
// powRule·powResist: 그 편 세력들에 나눠 더한다
function act2Pow(fx,out){for(const[k,fs]of[['powRule',ruleFacs()],['powResist',resistFacs()]]){const v=fx[k];if(!v||!fs.length)continue;
  for(const f of fs)powAdd(f,Math.round(v/fs.length*10)/10);out.push(`${sideName(fs)} 힘 ${v>0?'+':''}${v}`)}}
// 제2차 천하대전 구도: 첫 대전의 승자 편 대 나머지. 관군은 정관 관계가 좋으면 정파 쪽에, 힘이 넘치면 따로 무림을 친다. 마교가 바닥이면 저항에서 빠진다
function act2Plan(){const s=PS(),b=S2.BR[s.br];if(!b||!b.war)return null;const w=wld(),R=STORY.RULES,notes=[];let rule=ruleFacs().slice(),resist=resistFacs();
  if(resist.includes('마')&&w.pow.마<R.magyoOut){resist=resist.filter(f=>f!=='마');notes.push('마교는 힘이 바닥나 물러선다')}
  const sides=[rule,resist];
  if(!rule.includes('관')){if(w.pow.관>=R.gunPunish){sides.push(['관']);notes.push('조정이 무림 전체를 토벌하러 나선다')}
    else if(w.rel.정관>=R.gunJoin){const t=rule.includes('정')?rule:resist.includes('정')?resist:null;if(t){t.push('관');notes.push('관군이 정파 편에 선다')}}}
  const ok=sides.filter(x=>x.length);
  return{id:'b2_'+s.br,n:ok.length<2?'중재 (싸울 상대가 없다)':`${b.war.n}: ${ok.map(sideName).join(' 대 ')}`,d:b.war.d,sides:ok,notes}}
function act2Begin(quiet){const s=PS(),last=G.wars[G.wars.length-1],won=last&&last.life===P.lifeNo&&last.won?last.won:null;
  s.act=2;s.br=won&&S2.BR[won[0]]?won[0]:'peace';s.rule=won?won.slice():[];s.open=null;s.flag.warDone=false;for(const k of['hide','front','mediate'])delete s.flag[k];
  if(quiet)return;const b=S2.BR[s.br];storyBanner(b.n,'2막 · 정세 창(N)','두 번째 천하대전까지');log(`[2막] ${b.n}: ${b.t} ${S2.T.war}세에 제2차 천하대전이 난다.`,'sys')}
hook('warEnded',c=>{if(!P||actOf()===2||c.silent)return;act2Begin()});
// 옛 저장(v152까지): 첫 대전을 마친 생은 곧바로 2막으로
hook('gLoaded',()=>{if(P&&P.story&&P.story.flag&&P.story.flag.warDone&&P.story.act!==2&&G.wars.some(x=>x.life===P.lifeNo))act2Begin(true)});
function act2Intro(){const s=PS(),b=S2.BR[s.br]||S2.BR.peace,role=myRole();
  return `<p><b class="gold">2막 · ${b.n}</b> ${b.t}</p><p class="note">${s.rule.length?`천하를 쥔 편 <b>${sideName(s.rule)}</b> · 당신은 <b>${role==='rule'?'천하를 쥔 편':'맞서는 편'}</b>. `:''}사건 ${S2.T.ev.length}개(${S2.T.ev.map(a=>Number.isInteger(a)?a+'세':Math.floor(a)+'세 하반기').join('·')}) 뒤 ${S2.T.war}세에 제2차 천하대전${b.war?`: ${b.war.n}`:''}.</p>`}

// ---- 결전 공로: 경지가 높을수록 결전 한 차례에 더하는 힘이 크다 (제안 5) ----
const warMerit=()=>S2.MERIT.base+S2.MERIT.per*realmIdx();

// ---- 봉문은 sealYrs 해가 지나면 풀린다. 점령당한 문파는 해마다 확률로 재건을 시도한다 (제안 3) ----
function decayYear(){const y=Math.floor(G.cal),D=S2.DECAY,RB=D.rebuild,w=wld();
  const up=Object.keys(G.seal||{}).filter(id=>SECTS[id]&&G.seal[id].y!=null&&y-G.seal[id].y>=D.sealYrs);if(up.length)unsealSects(up);
  for(const id of Object.keys(G.occ||{})){const o=G.occ[id],s=SECTS[id];if(!s||y-o.y<RB.after||sectPop(id)<=0||Math.random()>=RB.try)continue;
    const own=alFac(s.al),ch=clamp(RB.base+RB.k*((w.pow[own]||0)-(w.pow[o.by]||0)),RB.min,RB.max)*(G.unified&&G.unified.by===o.by?RB.ruler:1),mine=P&&P.sect===id;
    if(Math.random()<ch){delete G.occ[id];powAdd(own,2);log(`${s.n}이(가) 본산 재건에 나서 ${FAC4N[o.by]} 점령군을 몰아냈다. ${masterTitle(s)}이 돌아온다.`,mine?'xp':'info');if(mine)feat(`${s.n}이(가) 본산을 재건했다`);
      if(P&&REGIONS[P.reg]&&REGIONS[P.reg].hq===id){mobs=mobs.filter(m=>!m.chief);runHooks('regionLoaded',P.reg)}}
    else{popLose(id,sectPop(id)*RB.fail,'');log(`${s.n}이(가) 본산을 되찾으려다 ${FAC4N[o.by]} 점령군에 막혔다. 인원이 꺾였다.`,mine?'dmg':'info')}}}
hook('newYear',()=>{if(G.seal||G.occ)decayYear()});

// ---- 천하통일 세상: 통일한 세력의 성향에 따라 세상이 바뀐다 (제안 7). G.unified가 있는 동안 ----
const worldOf=()=>G.unified&&S2.WORLD[G.unified.by]||null;
const worldMul=(k,def=1)=>{const x=worldOf();return x&&x[k]!=null?x[k]:def};
const worldPrice=p=>Math.round(p*worldMul('price'));
hook('newYear',()=>{const x=worldOf();if(!x)return;for(const f in x.drift||{})powAdd(f,x.drift[f]);
  if(x.seal&&Math.random()<(x.sealCh||0))sealSects(x.seal,1,'big')});
function worldHtml(){const x=worldOf();return x?`<p><b style="color:${FACC[G.unified.by]}">${x.n}</b> <small>${x.d}</small></p>`:''}

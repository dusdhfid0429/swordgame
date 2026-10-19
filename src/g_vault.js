// 문파 재화·침투·전각 NPC 순환 (2026-10-15 v117, 사용자: "각 문파의 크기에 따라 해마다 재화가 누적되게, 멸문시키거나 몰래 침투하여 재화를 가져갈 수 있게,
// 전각 안 장로·당주 등 고정 NPC도 죽일 수 있게, 죽으면 시간이 지나 새 NPC가 배정되는 순환 구조")
// - G.vault[sid]: 금고 은자. 해마다 VAULT.income[규모] × 인원/기준 × (1+질×.5) 씩 쌓인다(봉문 ×.5, 점령·멸문 0). 처음엔 start 해치, 최대 cap 해치.
// - 금고 자리(node vault)는 장문인 전각 안. 멸문이면 '금고를 턴다'로 전부, 살아 있으면 '몰래 턴다'(3초)로 frac 만큼. 들키면 경비가 덮치고 악업·명성이 깎이며 그 해엔 다시 못 턴다.
// - 전각 NPC(elder·steward·dang_*·disc)는 강제공격으로 치면 싸우는 우두머리가 된다(npcOut). 죽으면 G.ndead[키]={y}, 인원은 직위대로 줄고(g_pop kill 훅), revive 해 뒤 새 이름의 후임이 선다.
const VAULT=GD.VAULT;
const vaultIncome=s=>{const p=sectPop(s.id);if(!(p>0)||(G.occ&&G.occ[s.id]))return 0;const inc=(VAULT.income[s.id]||VAULT.income[s.tier]||80)*Math.min(2.5,p/popBase(s))*(1+sectQ(s)*.5);return Math.round(inc*(G.seal&&G.seal[s.id]?VAULT.sealMul:1))};
function vaultInit(){if(G.vault)return;G.vault={};for(const s of Object.values(SECTS))G.vault[s.id]=vaultIncome(s)*VAULT.start}
const sectVault=sid=>{vaultInit();return Math.round(G.vault[sid]||0)};
hook('newYear',()=>{vaultInit();for(const s of Object.values(SECTS)){const inc=vaultIncome(s);if(inc<=0)continue;const cap=inc*VAULT.cap;G.vault[s.id]=Math.min(cap,(G.vault[s.id]||0)+inc)}});
// ---- 금고 자리: 장문인 전각(본산 첫 전각) 안 뒷벽 가까이 ----
function vaultHall(s){const M=REGIONS[hqId(s)];if(!M)return null;if(M.halls&&M.halls.length)return M.halls[0].id;return hqId(s)};
function vaultSpot(){for(let y=1;y<Math.min(5,NH-1);y++)for(let dx=0;dx<N;dx++){const x=Math.floor(N/2)+(dx%2?1:-1)*Math.ceil(dx/2);if(x>0&&x<N-1&&walk(x,y)&&!objs[y][x]&&!nodes.some(n=>Math.hypot(n.x-x-.5,n.y-y-.5)<1))return{x:x+.5,y:y+.5}}return null}
hook('regionLoaded',id=>{const s=ruinSect(REGIONS[id]);if(!s||vaultHall(s)!==id)return;const p=vaultSpot();if(!p)return;nodes.push({t:'vault',sect:s.id,x:p.x,y:p.y,cd:0})});
function vaultLabel(n){const s=SECTS[n.sect];return sectPop(s.id)<=0?'금고를 턴다':'몰래 턴다'}
function vaultOpen(n){const s=SECTS[n.sect];if(!s)return;vaultInit();const v=Math.round(G.vault[s.id]||0),y=Math.floor(G.cal);
  if(sectPop(s.id)<=0){if(v<=0){log('금고는 이미 비어 있다.','info');return}P.silver+=v;G.vault[s.id]=0;addText(P.x,P.y,`은자 ${v}`,'#e8c66e');log(`멸문한 ${s.n}의 금고에서 은자 ${v}을(를) 챙겼다.`,'xp');feat(`${s.n} 폐허의 금고를 털었다 (은자 ${v})`);return}
  G.vaultHit=G.vaultHit||{};if(G.vaultHit[s.id]===y){log(`${s.n}의 경비가 삼엄하다. 올해는 다시 손댈 수 없다.`,'info');return}
  const ST=VAULT.steal,here=npcsHere().length,det=clamp(ST.base+ST.perNpc*here+(sectWeak(s)?ST.weak:0)-ST.realm*(P.realm||0),ST.min,ST.max);G.vaultHit[s.id]=y;
  if(Math.random()<det){P.evil+=ST.evil;P.fame=Math.max(0,P.fame+ST.fame);log(`금고에 손대다 들켰다! ${s.n}의 경비가 들이닥친다. 악업 +${ST.evil}, 명성 ${ST.fame}.`,'dmg');showBanner('발각',`${s.n} 경비 출동`);
    const fac=alFac(s.al);for(let i=0;i<ST.guards;i++){const a=Math.PI*2*i/ST.guards,e=mkFac(fac,i<2?1:0,P.x+Math.cos(a)*2.2,P.y+Math.sin(a)*2.2,s.id);e.angry=1;e.aggro=true;e.tgt=null;e.guard=s.id;e.name=`${s.n} 경비 · ${e.name}`;mobs.push(e)}return}
  const take=Math.max(1,Math.round(v*ST.frac));if(v<=0){log('금고가 비어 있다.','info');return}P.silver+=take;G.vault[s.id]=v-take;addText(P.x,P.y,`은자 ${take}`,'#e8c66e');
  log(`${s.n}의 금고에서 은자 ${take}을(를) 몰래 챙겼다. (들킬 확률 ${Math.round(det*100)}%)`,'xp');feat(`${s.n} 금고에 몰래 들어 은자 ${take}을(를) 가져갔다`)}
// ---- 전각 NPC 처치와 순환 ----
const npcRole=n=>!n?null:n.elder?'elder':n.steward?'steward':n.disc?'disc':n.id&&n.id.startsWith('dang_')?'dang':null;
const npcSect=n=>n.elder||n.steward||n.disc||(n.id&&n.id.startsWith('dang_')?'cheonma':null);
const npcKey=n=>`${npcSect(n)}/${n.id}`;
const npcDead=n=>{const r=npcRole(n);if(!r)return false;return !!(G.ndead&&G.ndead[npcKey(n)])};
const npcCanOut=n=>!!n&&(!!n.hq||!!npcRole(n));
function npcOut(n){if(!n||!forceAtk)return null;if(n.hq)return masterOut(n);const r=npcRole(n);if(!r)return null;const s=SECTS[npcSect(n)];if(!s||npcDead(n))return null;const key=npcKey(n);
  const live=mobs.find(m=>m.npcKey===key&&m.hp>0);if(live)return live;const R=REGION(),c=VAULT.npc[r];(R._npcsO=R._npcsO||[]).push(n);R.npcs=R.npcs.filter(x=>x!==n);   // 맵을 나갔다 오면 npcSync 가 되돌린다
  const e=mkFac(alFac(s.al),c.rank>=2?1:0,n.x,n.y,s.id);e.rank=c.rank;e.realm=Math.min(4,c.rank);if(typeof scaleMob==='function')scaleMob(e);e.maxHp=Math.round(e.maxHp*c.hp);e.hp=e.maxHp;e.atk=Math.round(e.atk*c.atk);
  e.npcKey=key;e.npcRole=r;e.name=n.n;e.pal=n.pal||e.pal;e.home={x:n.x,y:n.y};mobs.push(e);refreshNPCF();log(`${n.n}에게 칼을 겨눴다. ${s.n} 전체가 적이 된다.`,'info');return e}
hook('kill',e=>{if(!e.npcKey)return;const[sid]=e.npcKey.split('/'),s=SECTS[sid],c=VAULT.npc[e.npcRole]||{fame:5,title:''};G.ndead=G.ndead||{};G.ndead[e.npcKey]={y:Math.floor(G.cal),life:P.lifeNo,n:e.name};
  P.fame+=c.fame;log(`${e.name}을(를) 쓰러뜨렸다. 명성 +${c.fame}. ${VAULT.revive}년 뒤 ${s?s.n:''}에 새 ${c.title}이(가) 선다.`,'xp');feat(`${e.name}을(를) 쓰러뜨렸다`)});
// 공석인 자리는 맵에서 비우고(g_pop masterCheck 뒤에 돈다), 멸문 폐허(R.dead)는 g_ruin 이 이미 비웠다
function npcSync(id){const R=REGIONS[id];if(!R||!R.npcs||R.dead)return;R._npcsD=R._npcsD||[];const back=[...R.npcs];for(const n of[...R._npcsD,...(R._npcsO||[])])if(!back.includes(n))back.push(n);R._npcsO=[];
  for(const n of back){const nm=G.nname&&G.nname[npcKey(n)];if(nm&&n.n!==nm)n.n=nm}
  R._npcsD=back.filter(npcDead);R.npcs=back.filter(n=>!npcDead(n));refreshNPCF()}
hook('regionLoaded',npcSync);
hook('newYear',()=>{if(!G.ndead)return;const y=Math.floor(G.cal);for(const key in G.ndead){const d=G.ndead[key];if(y-d.y<VAULT.revive)continue;const[sid,nid]=key.split('/'),s=SECTS[sid];if(!s||sectPop(sid)<=0)continue;
    const role=nid.startsWith('dang_')?'dang':nid,c=VAULT.npc[role]||{title:''},nm=`${s.n} ${c.title} ${pick(NAMES1)}${pick(NAMES2)}${pick(NAMES2)}`;G.nname=G.nname||{};G.nname[key]=nm;delete G.ndead[key];
    log(`${s.n}에 새 ${c.title} ${nm.split(' ').pop()}이(가) 배정되었다.`,'info');if(P&&REG)npcSync(REG)}});
// 문파 인원 카드에 금고·공석
{const pc=popCard;popCard=function(){vaultInit();let h=pc();for(const s of Object.values(SECTS)){const v=sectVault(s.id);if(v<=0)continue;const dead=Object.keys(G.ndead||{}).filter(k=>k.startsWith(s.id+'/')).length;
    h=h.replace(`${s.n} <small class="dim">`,`${s.n} <small class="gold">금고 ${v}</small>${dead?` <small class="bad">공석 ${dead}</small>`:''} <small class="dim">`)}return h}}
// ---- 문파 기부 (v153, 사용자): 은자를 금고에 넣으면 공적(직위)과 문파 인원·명성이 는다. STORY2.DONATE ----
function donateHtml(s){const D=S2.DONATE;return `<div class="row2"><span class="note">기부: 은자 100마다 공적 ${Math.round(100*D.merit)}, 인원 +${Math.round(100*D.pop*10)/10}. 금고 ${sectVault(s.id)}</span><span>${D.amt.map(a=>B(`sgive:${s.id}:${a}`,`은자 ${a}`,{d:P.silver<a})).join(' ')}</span></div>`}
function donate(sid,a){const s=SECTS[sid],D=S2.DONATE;if(!s||P.sect!==sid||!D.amt.includes(a)||P.silver<a)return;vaultInit();popInit();
  P.silver-=a;G.vault[sid]=(G.vault[sid]||0)+a;const m=addMerit(sid,Math.round(a*D.merit));G.pop[sid]=Math.min(popBase(s)*POP.max,Math.round(((G.pop[sid]||0)+a*D.pop)*10)/10);popSync();
  const f=Math.round(a*D.fame);P.fame+=f;log(`${s.n}에 은자 ${a}을(를) 기부했다. 공적 +${m}, 인원 +${Math.round(a*D.pop*10)/10}${f?`, 명성 +${f}`:''}.`,'xp');if(a>=1000)feat(`${s.n}에 은자 ${a}을(를) 기부했다`)}
hook('sectAct',c=>{if(c.a!=='sgive')return;c.done=true;c.r=true;donate(c.x,+c.y)});

// ================= v224 찐한 무협 장면 (개선 계획 5절, 동훈님 2026-11-01 '개선안의 3,4,5도 진행해') =================
//  1 별호: 명성·우두머리 처치가 쌓이면 강호가 이름을 붙인다. 앞말=가장 많이 쓴 병기, 뒷말=업보·마성·경지 (P.byh, 해마다 다시 본다)
//  2 은원 장부: 꺾은 정예·우두머리, 죽을 뻔한 상대, 비무 승패, 표물 구출·약탈 (P.ew). 인물창 카드
//  3 대결 전 한마디: 우두머리·정예·비무 상대가 처음 덤빌 때 낙관 얼굴 + 두 줄. 은원·별호·업보에 따라 말이 달라진다
//  4 마당 사건: 천하비무대회·본산 침공·결전 전야가 열리면 그 자리에 사람들이 둘러서고 대사가 흐른 뒤 정세 창에서 고른다
//  5 필살기 이름 외치기 (callout, g_open.js) · 병기마다 다른 타격음 (g_audio.js hit cls)
// 데이터 data/scene.json (BYH·EW·VS·MADANG), 테스트 tests/t144_scene.js
const BYH=GD.BYH,EW=GD.EW,VS=GD.VS,MADANG=GD.MADANG;
const fill=(s,o)=>josa(String(s).replace(/\{(\w+)\}/g,(_,k)=>o[k]!=null?o[k]:''));
const FACKIND={정:'정파 무인',사:'사파 무인',마:'마교도',관:'관군'};
// ---- 1 별호 ----
function byhOf(){if(!P)return'';const kc=P.kc||{},top=Object.keys(kc).sort((a,b)=>kc[b]-kc[a])[0]||curCls();
  if((P.fame||0)<BYH.fame||(P.bosses||0)<BYH.bosses)return'';
  const pre=BYH.pre[top]||BYH.pre['검'],seed=[...(P.name||'')].reduce((s,c)=>s+c.charCodeAt(0),0)+(P.lifeNo||0);
  const hi=realmIdx()>=BYH.realmUp?'hi':'lo',k=P.good-P.evil,mt=typeof maraTier==='function'?maraTier():0;
  const g=mt>=BYH.mara?'mara':k>=BYH.karma?'good':k<=-BYH.karma?'evil':'mid';
  const suf=(g==='mid'&&hi==='lo'&&BYH.sufCls[top]&&BYH.sufCls[top].mid)||BYH.suf[g][hi];
  return pre[seed%pre.length]+suf}
function byhCheck(quiet){const n=byhOf();if(!n||n===P.byh)return;const old=P.byh;P.byh=n;if(quiet)return;
  log(josa(old?`강호인들이 이제 당신을 「${n}」(으)로 부릅니다. (전에는 「${old}」)`:`강호인들이 당신을 「${n}」(으)로 부르기 시작했습니다.`),'xp');showBanner(`별호 · ${n}`,old?`「${old}」에서 바뀌었다`:'강호가 붙여 준 이름');feat(`별호 「${n}」을(를) 얻었다`)}
hook('kill',e=>{if(!P)return;const c=curCls();P.kc=P.kc||{};P.kc[c]=(P.kc[c]||0)+1;
  if(e.d&&(e.d.boss||e.d.elite)&&!e.acadSpar&&!e.scene){ewAdd('kill',e);byhCheck()}});
hook('newYear',()=>{if(P)byhCheck()});
// ---- 2 은원 장부 ----
function ewAdd(k,e,n){if(!P)return;P.ew=P.ew||[];const nm=n||(e&&e.name)||'';const r={k,n:nm,kind:e&&e.kind,sect:e&&e.sect||null,y:Math.floor(realAge())};
  const last=P.ew[P.ew.length-1];if(last&&last.k===k&&last.n===nm&&last.y===r.y)return;P.ew.push(r);if(P.ew.length>EW.max)P.ew.splice(0,P.ew.length-EW.max)}
hook('hurtDone',c=>{const e=c&&c.src;if(!P||!e||!e.d||!(e.d.boss||e.d.elite)||e.acadSpar||P.hp<=0||P.hp>P.maxHp*EW.near||e.ewLost)return;e.ewLost=1;ewAdd('lost',e)});
hook('duelEnd',c=>{if(c&&c.o)ewAdd(c.win?'win':'lose',c.e,c.o.n)});
hook('cvSaved',()=>ewAdd('save',null,'표물 행렬'));
hook('cvRob',()=>ewAdd('rob',null,'표물 행렬'));
function ewHtml(){const l=(P.ew||[]).slice(-EW.show).reverse();
  return `<div class="card ewc"><h4>은원 장부${P.byh?` <small class="gold">별호 「${esc(P.byh)}」</small>`:''}</h4>${l.length?`<ul class="ewl">${l.map(r=>`<li class="ew_${r.k}"><b>${EW.ic[r.k]||'·'}</b><span>${esc(fill(EW.txt[r.k]||r.k,{n:r.n}))}${r.sect&&SECTS[r.sect]?` <small class="dim">${esc(SECTS[r.sect].n)}</small>`:''}</span><small class="dim num">${r.y}세</small></li>`).join('')}</ul>`:`<p class="note">아직 강호에 맺은 은원이 없다.</p>`}
  ${P.byh?'':`<p class="note dim">명성 ${BYH.fame} 이상, 우두머리·정예 ${BYH.bosses}명을 꺾으면 강호가 별호를 붙인다.</p>`}</div>`}
// ---- 3 대결 전 한마디 ----
let vsAt=-99;
function vsBranch(e){const ew=P.ew||[];
  if(e.sect){const r=[...ew].reverse().find(r=>r.k==='kill'&&r.sect===e.sect&&r.n!==e.name);if(r)return{k:'rev',who:r.n,sect:SECTS[e.sect]?SECTS[e.sect].n:''}}
  if(ew.some(r=>r.k==='lost'&&r.kind===e.kind&&r.n===e.name))return{k:'again'};
  if(ew.some(r=>(r.k==='win'||r.k==='kill')&&r.n===e.name))return{k:'beat'};
  if(P.byh)return{k:'byh'};
  if(P.evil-P.good>=BYH.karma||(typeof maraTier==='function'&&maraTier()>=1))return{k:'evil'};
  return{k:'fac'}}
function vsLines(e){const b=vsBranch(e),o={n:e.name,me:P.name,byh:P.byh||'',sect:b.sect||'',who:b.who||''};
  const pool=b.k==='fac'?VS.foe.fac[e.d.fac]||VS.foe.fac._:VS.foe[b.k],seed=Math.floor((e.x*7+e.y*13+(e.hp||0)))%pool.length;
  return{k:b.k,foe:fill(pool[Math.abs(seed)],o),me:fill(VS.me[b.k]||VS.me.side[P.side]||VS.me.side['정'],o)}}
const vsOk=e=>e&&e.hp>0&&e.d&&(e.d.boss||e.d.elite||e.duel)&&!e.vsl&&!e.scene&&!e.acadSpar&&!e.dngDemo&&(e.aggro||e.duel)&&(!e.tgt||e.tgt===P)&&dist(e,P)<VS.r;
function vsShow(e){e.vsl=1;vsAt=time;const L=vsLines(e),col={정:'#7aa6d8',사:'#b58a4a',마:'#8b2e2e',관:'#6f8f5a'}[e.d.fac]||'#9a8f7a';
  let el=document.getElementById('vsline');if(!el){el=document.createElement('div');el.id='vsline';el.setAttribute('aria-live','polite');$('app').appendChild(el)}
  el.innerHTML=`<div class="vf"><i style="--sc:${col}">${esc(e.sect&&SECTS[e.sect]?SECTS[e.sect].n[0]:{정:'正',사:'邪',마:'魔',관:'官'}[e.d.fac]||'敵')}</i><div><b>${esc(e.name)}</b><p>${esc(L.foe)}</p></div></div><div class="vm"><div><b>${esc(P.name)}${P.byh?` <small>「${esc(P.byh)}」</small>`:''}</b><p>${esc(L.me)}</p></div></div>`;
  el.style.setProperty('--vd',VS.dur+'s');el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),VS.dur*1000);
  log(`${e.name}: "${L.foe}"`,'info');return L}
hook('tick',()=>{if(!P||!playing||time-vsAt<VS.gap||mdg)return;for(const e of mobs)if(vsOk(e)){vsShow(e);break}});
// ---- 4 마당 사건 ----
let mdg=null;   // {ev,lines,i,t,mobs}
function mdgSafe(){return P&&playing&&!paused&&$('win').hidden&&!G.duel&&!(typeof acadOn==='function'&&acadOn())&&!P.perch&&!P.leap&&P.hp>P.maxHp*.3&&!mobs.some(m=>m.hp>0&&!m.scene&&m.aggro&&dist(m,P)<MADANG.safe)}
hook('evOpen',e=>{if(MADANG.ev[e.id]&&P){P.mdgQ=e.id}});
function mdgKind(k){const pf=pfac();if(k==='own')return FACKIND[pf]||'정파 무인';if(k==='foe'){const f=(FAC_FOE[pf]||['사'])[0];return FACKIND[f]||'사파 무인'}return MOBS[k]?k:'양민'}
function mdgSpot(a,r){for(let t=0;t<6;t++){const rr=r+t*.4,x=P.x+Math.cos(a)*rr,y=P.y+Math.sin(a)*rr*.85;if(walkAt(x,y))return{x,y}}return{x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r}}
function mdgStart(id){const S=MADANG.ev[id];if(!S||mdg)return false;P.mdgQ=null;const list=[];
  const n=S.crowd.reduce((s,c)=>s+c[1],0);let i=0;
  for(const[k,c]of S.crowd)for(let j=0;j<c;j++){const a=-Math.PI/2+(i++)/n*Math.PI*2,p=mdgSpot(a,MADANG.r),kind=mdgKind(k);
    const e=mkMob(kind,p.x,p.y);e.d={...e.d,villager:true,passive:false,fac:undefined,boss:false,elite:false};e.sect=null;e.scene=1;e.hp=e.maxHp=1e9;e.aggro=false;e.fx=P.x<e.x?-1:1;list.push(e);mobs.push(e)}
  const groups=[];i=0;for(const[,c]of S.crowd){groups.push(list[i]);i+=c}
  mdg={id,S,i:-1,t:0,mobs:list,heads:groups};P.target=null;
  let el=document.getElementById('madang');if(!el){el=document.createElement('div');el.id='madang';$('app').appendChild(el);
    el.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();if(ev.target.closest('[data-mskip]'))mdgEnd(true);else mdgNext()})}
  el.style.setProperty('--night',S.night||0);el.innerHTML=`<div class="mn"></div><div class="mt"><small>강호의 사건</small><b>${esc(S.n)}</b><span>${esc(S.sub||'')}</span></div><div class="ms"><b></b><p></p><button type="button" class="btn" data-mskip>건너뛰기</button></div>`;
  el.classList.add('on');document.body.classList.add('mdg-on');if(typeof sfx==='function')sfx('ult');mdgNext();return true}
function mdgNext(){if(!mdg)return;mdg.i++;mdg.t=0;const L=mdg.S.lines[mdg.i];if(!L){mdgEnd(false);return}
  const who=L[0]==='me'?null:mdg.heads[L[0]]||mdg.mobs[0],el=document.getElementById('madang');
  el.querySelector('.ms b').textContent=who?who.name:P.name+(P.byh?` 「${P.byh}」`:'');el.querySelector('.ms p').textContent=L[1];mdg.who=who||P}
function mdgEnd(skip,keep){if(!mdg)return;mdg.closing=1;mobs=mobs.filter(m=>!m.scene);const id=mdg.id;mdg=null;const el=document.getElementById('madang');if(el)el.classList.remove('on');document.body.classList.remove('mdg-on');
  if(!keep&&playing&&P&&P.story&&P.story.open===id&&panel!=='story'){openPanel('story')}}
hook('tick',dt=>{if(!P||!playing)return;if(mdg){mdg.t+=dt;if(mdg.t>=MADANG.step)mdgNext();return}if(P.mdgQ&&mdgSafe()){if(P.story&&P.story.open===P.mdgQ)mdgStart(P.mdgQ);else P.mdgQ=null}});
hook('mobAct',c=>{if(c.e.scene){c.stop=true;const t=mdg&&mdg.who;if(t&&t!==c.e)c.e.fx=t.x<c.e.x?-1:1;else c.e.fx=P.x<c.e.x?-1:1}});
hook('loadRegion',()=>{if(mdg){mobs=mobs.filter(m=>!m.scene);mdg=null;const el=document.getElementById('madang');if(el)el.classList.remove('on');document.body.classList.remove('mdg-on')}});
hook('drawList',list=>{if(!mdg||!mdg.who)return;const w=mdg.who;list.push({L:LY.BACK,d:99001,f:()=>{const p=toScreen(w.x,w.y);ctx.save();ctx.globalAlpha=.55+.25*Math.sin(time*5);ctx.strokeStyle='#ffd77a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,.55*TW/2,.55*TH/2,0,0,7);ctx.stroke();ctx.restore()}})});
// 마당이 펼쳐지는 동안 Space·Enter는 다음 대사, Esc는 건너뛰기. 화면의 다른 단추는 그대로 눌린다
addEventListener('keydown',ev=>{if(!mdg||!['Escape',' ','Enter'].includes(ev.key))return;if(ev.key==='Escape')mdgEnd(true);else mdgNext();ev.stopPropagation();ev.preventDefault()},true);
// 마당 도중 창을 열면(정세 줄·N 키 등) 마당은 접고 그 창을 그대로 둔다
hook('panelDrawn',()=>{if(mdg&&!mdg.closing)mdgEnd(true,true)});
hook('died',()=>{mdgEnd(true,true);if(P)P.mdgQ=null});

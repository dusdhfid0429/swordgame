// ================= 무공 창안: 같은 병기·같은 등급의 대성 무공 다섯으로 한 등급 높은 무공을 만든다 =================
// 사용자 요청(2026-10-12): "대성한 무공, 같은 무기 타입, 같은 등급 5개를 이용하여 한 단계 높은 무공을 창안하는 컨텐츠. 소비값은 무협스럽게."
// - 재료: 같은 병기·같은 등급의 무공 다섯이 모두 숙련 100(사용자 2026-10-12: 대성 50 → 100). 기초권각·기연 무공은 재료가 못 된다. 창안한 무공은 다시 재료가 된다.
// - 값: 다섯 무공을 모두 잊고 심득만 남긴다. 폐관수련처럼 문파 본산·내 집·산 정상에서만, 세월(등급+2년)과 활력(100+등급×60)을 쓰고, 끝나면 내공이 바닥난다.
//   경지는 화경 이상(사용자 2026-10-12; 처음엔 등급마다 이류·일류·절정이었다). 성공 85%(호법 +10%, 경지 여유 +5%). 실패하면 세월과 활력만 잃고 기혈이 뒤틀려 보름 동안 힘을 다 쓰지 못한다(무공은 남는다).
// - 결과: 다섯 무공의 초식 가운데 가장 강한 여섯을 골라 새 이름을 붙이고 한 등급 높은 공력(GMUL)으로 올린다. 필살기는 가장 높은 재료의 것을 잇는다.
//   초식 여섯을 모두 아는 채로 시작하고(내가 지은 무공이다) 숙련 30(심득). 오성 가짓수에는 든다. 절정 위(천고)는 기연으로만 얻으므로 절정이 끝이다.
// - 저장: 정의는 G.made(여러 생에 남는다)에, 숙련은 P.arts에. 불러올 때 G.made 순서대로 다시 만든다(gLoaded 훅).
// - 등록(사용자 2026-10-12): 문파 제자가 창안하면 그 문파 무공 목록에 들어가(제자·무인이 쓰고 총관이 비급을 판다), 무소속이면 등급별 확률로 기연에서 만나는 무공이 된다.
//   이름만 다르고 구성(초식 출처·필살기)이 같은 무공이 이미 등록돼 있으면 새것이 그 자리를 갈음한다(옛것은 익힌 사람에게만 남는다).
// 설계: docs/세력_문파_설계.md 23장. 테스트: tests/t46_create.js
const MK_N=5,MK_TOP=3,MK_MAST=100,MK_REALM=5;   // 재료 수, 창안으로 닿는 최고 등급(절정), 재료 숙련(100), 경지(화경)
const MK_GYW=[0,1,.7,.45];   // 기연에서 만날 확률 = GY_P × 등급 가중(중승 1, 상승 .7, 절정 .45)
const MK_PRE={금:['파천','벽력','금강','섬광'],목:['청풍','유성','송학','춘뢰'],수:['한월','유수','창해','빙백'],화:['열양','적염','화룡','삼매'],토:['태산','반석','후토','황룡']};
const MK_SUF={검:'검법',도:'도법',창:'창법',봉:'봉법',권:'권법',궁:'궁술',암:'암기술'};
const mkMul=a=>a.sect||a.gy||a.made||a.rc?GMUL[a.grade||0]:(a.forms.length<=3?1.25:1);   // 초식 m에 이미 곱해진 등급 보정
const mkUltMul=a=>a.sect||a.gy||a.made||a.rc?GULT[a.grade||0][1]:1;
// 재료가 될 수 있는 무공 묶음: {cls,g,ids} (대성 이상 다섯 넘는 것만)
function mkGroups(){const by={};
  for(const id of learnedArts()){const a=ARTS[id],s=A(id);if(!a||a.base||a.gy||(a.grade||0)>=MK_TOP||s.p<MK_MAST)continue;
    const k=a.cls+':'+(a.grade||0);(by[k]=by[k]||[]).push(id)}
  return Object.entries(by).filter(([,ids])=>ids.length>=MK_N).map(([k,ids])=>{const[cls,g]=k.split(':');return{cls,g:+g,ids:ids.sort((x,y)=>A(y).p-A(x).p).slice(0,MK_N)}})}
const mkCost=g=>100+60*g,mkYears=g=>2+g,mkRealm=g=>MK_REALM;
function mkChance(g){let c=.85;if(hobeop())c+=.1;if(realmIdx()>mkRealm(g))c+=.05;return Math.min(.95,c)}
function mkWhy(g){if(inCombat())return'싸움 중';if(!pgPlace())return'문파·내 집·산 정상에서만';if(P.inj>0)return'경맥이 아직 상해 있다';
  if(realmIdx()<mkRealm(g))return`${rk(mkRealm(g))}의 경지 필요`;if(P.vit<mkCost(g))return`활력 ${mkCost(g)} 필요`;return''}
function mkRows(){return mkGroups().map(({cls,g,ids})=>{const k=`mk:${cls}:${g}`,why=mkWhy(g),busy=trnBusy&&trnBusy.k===k;
  return `<div class="trow"><div class="tname"><b>무공 창안</b> <span class="num gold">${AGR[g]} → ${AGR[g+1]}</span><small>숙련 100인 ${CLASS[cls].n} 다섯을 잊고 심득을 모은다 · ${ids.map(i=>ARTS[i].n).join('·')} · ${mkYears(g)}년 · 성공 ${Math.round(mkChance(g)*100)}%${hobeop()?' · 호법':''}</small></div>
    <button type="button" class="btn tbtn${busy?' busy':''}" data-tr="${k}"${why||trnBusy?' disabled':''}>${why||`창안 · 활력 ${mkCost(g)}`}<i class="tcd"></i></button></div>`}).join('')}
function mkStart(k){const[,cls,g]=k.split(':'),grp=mkGroups().find(q=>q.cls===cls&&q.g===+g);
  if(trnBusy||P.hp<=0||!grp)return;const why=mkWhy(+g);if(why){log(`무공을 창안할 수 없습니다: ${why}.`,'info');return}
  P.path=null;P.target=null;P.medit=false;P.chan=null;P.qiTraining=true;
  log(`${pgPlace()}에서 ${grp.ids.map(i=>ARTS[i].n).join('·')}의 심득을 모아 새 무공을 궁리합니다.`,'sys');trnBusy={k,t:0,dur:TRN_DUR.mk||3};renderTrain()}
function mkFinish(k){P.qiTraining=false;const[,cls,gs]=k.split(':'),g=+gs,grp=mkGroups().find(q=>q.cls===cls&&q.g===g);
  const why=grp?mkWhy(g):'재료가 모자라다';if(why){log(`무공 창안이 끊겼습니다: ${why}.`,'info');return}
  const yrs=mkYears(g),ch=mkChance(g);P.vit-=mkCost(g);if(!passYears(yrs))return;
  P.qi=0;
  if(Math.random()>=ch){P.inj=DAY_SEC*.5;P.injS=1;P.hp=Math.max(1,Math.round(P.hp*.5));fx.push({t:'ring',x:P.x,y:P.y,life:.6,max:.6,col:'220,60,60'});shake=Math.max(shake,.3);
    log(`${yrs}년을 궁리했지만 다섯 무공의 심득이 하나로 모이지 않았습니다. 기혈이 뒤틀려 보름 동안 힘을 다 쓰지 못합니다.`,'dmg');showBanner('창안 실패','심득이 모이지 않았다');
    feat(`${AGR[g+1]} ${CLASS[cls].n} 창안에 실패했다`);return}
  const a=mkCreate(grp);
  for(const id of grp.ids)delete P.arts[id];
  P.arts[a.id]={p:30,f:a.forms.map(()=>true)};if(!P.arts[P.cur])setArt(a.id);
  fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:2});shake=Math.max(shake,.25);recalc();
  log(`${yrs}년의 폐관 끝에 ${grp.ids.map(i=>ARTS[i].n).join('·')}의 심득을 하나로 모아 ${AGR[g+1]} 무공 [${a.n}]을(를) 창안했습니다. 다섯 무공은 잊었습니다.`,'xp');
  showBanner('무공 창안',a.n);feat(`${AGR[g+1]} 무공 ${a.n}을(를) 창안했다`);wallCheck()}
// 다섯 무공에서 새 무공의 정의를 뽑아 G.made에 적고 ARTS에 만든다
function mkCreate(grp){const srcs=grp.ids.map(i=>ARTS[i]),g=grp.g+1,n0=(G.madeN=(G.madeN||0)+1),id=`mk_${n0}`,r=rng(5000+n0*97+P.name.length);
  const cnt={};for(const a of srcs)cnt[a.el]=(cnt[a.el]||0)+1;const el=Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x])[0]||'금';
  const used=new Set(Object.values(ARTS).map(a=>a.n));let n=MK_PRE[el][Math.floor(r()*4)]+MK_SUF[grp.cls];for(let t=0;used.has(n)&&t<12;t++)n=MK_PRE[el][Math.floor(r()*4)]+NA[Math.floor(r()*NA.length)][0]+MK_SUF[grp.cls];
  if(typeof prompt==='function'&&!window.__noPrompt){const v=prompt(`창안한 ${AGR[g]} ${CLASS[grp.cls].n}의 이름 (2~8자)`,n);if(v&&/^\S{2,8}$/.test(v.trim())&&!used.has(v.trim()))n=v.trim()}
  // 초식: 다섯 무공의 초식을 등급 보정을 벗긴 공력으로 늘어놓고, 빠른 단타 하나 + 가장 강한 다섯(겹치는 무늬는 하나만)
  const all=[];srcs.forEach(a=>a.forms.forEach((f,i)=>all.push({a:a.id,i,f,base:f.m/((1+.06*i)*mkMul(a)),key:`${f.p}|${f.hits||0}|${f.rad||0}|${f.cnt||0}|${f.cd}`})));
  const seen=new Set(),uniq=all.filter(x=>!seen.has(x.key)&&seen.add(x.key));
  const fi=uniq.findIndex(x=>['melee','multi','line'].includes(x.f.p)||(x.f.p==='proj'&&!x.f.full&&x.f.cnt<=2)),first=uniq.splice(Math.max(0,fi),1)[0];
  const rest=uniq.sort((x,y)=>y.base-x.base).slice(0,5).sort((x,y)=>x.f.cd-y.f.cd),picks=[first,...rest];
  const names=new Set();const nm=()=>{let s;do{s=NA[Math.floor(r()*NA.length)]+NB[Math.floor(r()*NB.length)]}while(names.has(s));names.add(s);return s};
  const ua=srcs.slice().sort((x,y)=>(y.grade||0)-(x.grade||0)||(y.hi?1:0)-(x.hi?1:0))[0];
  const def={id,n,cls:grp.cls,el,grade:g,src:grp.ids.slice(),srcN:srcs.map(a=>a.n),forms:picks.map(x=>({a:x.a,i:x.i,n:nm()})),tr:trOfSrc(grp.ids),ult:{a:ua.id,n:UA[Math.floor(r()*UA.length)]+UB[Math.floor(r()*UB.length)]},by:P.name,life:P.lifeNo};
  // v157 (사용자 2026-10-20): 문파 제자라도 창안한 순간에는 등록하지 않는다. 문파 창에서 제자들에게 전수해야 그 문파 무공이 된다 (gycSectHtml, g_gyc.js). 무소속이면 예전처럼 기연에서 만나는 무공
  const member=P.sect&&P.sect!=='own'&&SECTS[P.sect];def.sect=null;def.key=mkKey(def);def.reg=member?0:1;
  G.made=G.made||{};for(const o of Object.values(G.made))if(o.reg&&o.key===def.key){o.reg=0;mkUnregister(o);log(`${o.n}은(는) 구성이 같아 ${n}(으)로 갈음합니다.`,'sys')}
  G.made[id]=def;const a=mkBuild(def);mkRegister(def);return a}
const mkKey=def=>def.forms.map(x=>x.a+':'+x.i).sort().join(',')+'|'+def.ult.a;
// 문파 무공 목록에 넣거나(문파 제자) 기연 무공으로 둔다(무소속)
function mkRegister(def){const a=ARTS[def.id];if(!a||!def.reg||a.reg)return;a.reg=1;
  if(def.sect&&SECTS[def.sect]){a.sect=def.sect;const L=SECTS[def.sect].arts;if(!L.some(q=>q.id===def.id))L.push({id:def.id,n:def.n,cls:def.cls,el:def.el,hi:false,made:1});a.d+=` ${SECTS[def.sect].n}에 전해진다.`}
  else{a.gyPool=1;a.d+=' 강호에 흘러 기연으로 만난다.'}}
function mkUnregister(def){const a=ARTS[def.id];if(a){a.gyPool=0;a.reg=0}if(def.sect&&SECTS[def.sect]){const L=SECTS[def.sect].arts,i=L.findIndex(q=>q.id===def.id);if(i>=0)L.splice(i,1)}}
// 기연: 무소속 창안 무공 가운데 아직 모르는 것 하나를 등급 가중 확률로
function mkGyRoll(src){const pool=Object.values(G.made||{}).filter(d=>d.reg&&!d.sect&&ARTS[d.id]&&!P.arts[d.id]);if(!pool.length)return null;
  const d=pick(pool);return Math.random()<(GY_P[src]||0)*(MK_GYW[d.grade]||0)?d.id:null}
function mkGyLearn(id){const a=ARTS[id];P.arts[id]={p:0,f:a.forms.map((f,i)=>i===0)};
  log(`기연: ${a.by}이(가) 창안한 ${AGR[a.grade]} 무공 [${a.n}]의 비급을 얻어 첫 초식 [${a.forms[0].n}]을(를) 깨쳤습니다. 나머지는 숙련이 차면 열립니다.`,'xp');if(hasWeaponFor(a.cls))setArt(id);return a}
{const r0=gyRoll,l0=gyLearn;gyRoll=src=>r0(src)||mkGyRoll(src);gyLearn=id=>ARTS[id]&&ARTS[id].made?mkGyLearn(id):l0(id)}
// 정의로 무공을 만든다 (창안할 때와 불러올 때). 재료 무공이 ARTS에 있어야 한다
function mkBuild(def){const g=def.grade,EC=EL[def.el];
  const forms=def.forms.map((x,i)=>{const a=ARTS[x.a],f=a&&a.forms[x.i];if(!f)return{...F(x.n,'melee',{m:1,cd:.4}),req:REQ[i],cost:0,bonus:BONUS[i],qp:GD.QSTAR.pct[i],m:1*(1+.06*i)*GMUL[g]};
    return{...f,n:x.n,req:REQ[i],cost:0,bonus:BONUS[i],qp:GD.QSTAR.pct[i],m:f.m/((1+.06*x.i)*mkMul(a))*(1+.06*i)*GMUL[g]}});
  const ua=ARTS[def.ult.a],steps=ua?ua.ult.steps.slice(1).map(x=>({...x,m:(x.m||1)/mkUltMul(ua)*GULT[g][1]})):[];
  // v169: 이펙트 보조색은 재료 무공들의 특성을 물려받는다 (g_fxcol.js). 예전 저장은 재료에서 다시 센다
  if(!def.tr)def.tr=trOfSrc(def.src||[]);
  ARTS[def.id]=artFx({id:def.id,side:null,cls:def.cls,el:def.el,n:def.n,forms,made:1,grade:g,tr0:def.tr.length?def.tr:null,
    ult:{n:def.ult.n,steps:[F('','circle',{rad:2.8,m:GULT[g][0],stun:.3}),...steps]},
    d:`${def.by}이(가) ${def.srcN.join('·')}의 심득을 모아 창안한 ${AGR[g]} 무공 · ${CLASS[def.cls].n}. 초식 ${forms.length}개와 필살기.`});
  return ARTS[def.id]}
function mkRebuild(){for(const def of Object.values(G.made||{})){if(!ARTS[def.id])mkBuild(def);mkRegister(def)}}
hook('gLoaded',()=>mkRebuild());
hook('trainTick',dt=>{const b=trnBusy;if(b&&b.k.startsWith('mk:')){b.t+=dt;const el=TRN.querySelector(`[data-tr="${b.k}"] .tcd`);if(el)el.style.width=Math.min(100,b.t/b.dur*100)+'%';
  if(b.t>=b.dur){trnBusy=null;mkFinish(b.k);renderTrain()}}});

// ================= 참오(參悟)·변초(變招)·자득(自得): 무공서를 배우는 것 말고도 쓰는 길 (v247) =================
// 동훈님 2026-11-11: "무공서를 배우는 용도 말고도 무공 창안에 조각으로 소모하면 어떨까. 다른 계열 무공이나 다른 무기를 쓰는 무공에 소모처가 없어"
//  "창안 재료 외에도 깨달음에 도움이 된다던지" "획득한 무공서의 등급에 따라 소모처를 선택적으로" "깨달은 돈오로 사용 중인 무공을 커스텀하게" "무협스러운 프로그래션"
// - 참오: 행낭의 무공서(초식 비급·사본)를 읽지 않고 이치만 얻는다(타산지석). 책은 사라진다. 등급이 높을수록 고를 쓰임이 는다(CHAMO.minG).
//   pc 창안 조각  : 모든 등급. P.mkp[등급]에 한 장. 같은 등급(또는 더 높은 등급) 조각 pcNeed[등급]장이 창안 재료 한 자리를 대신한다(완본과 합쳐 MK_SUB자리까지, g_create.js mkSubs).
//   ms 숙련       : 모든 등급. 지금 펼치는 무공의 숙련이 오른다(다른 무공의 이치를 빌려 내 무공을 비춘다).
//   en 깨달음     : 중승 이상. 무리에 더해진다(P.enl). 같은 무공 같은 초식은 한 번만(P.chm).
//   sd 심득       : 상승 이상. 변초에 쓴다. 무공 돈오(숙련 100)에도 donoSd가 생긴다.
// - 변초: 심득으로 익힌 초식을 내 것으로 고친다. 초식마다 3단, 단마다 위력(m)·빠르기(cd)·범위(rg, 반경·길이가 있는 초식만) 가운데 하나. 단별 숙련 bcReq.
//   P.bc[무공][초식] = 고른 순서 문자열 ('m','cd','rg'). 펼칠 때만 그 사람 몫으로 덧입힌다(ARTS는 그대로라 적·동료는 영향 없음).
// - 자득: 초식을 모두 익히고 모두 3단까지 고치고 숙련 100이면 그 무공은 초식에 얽매이지 않는다(무초승유초). 필살기 jdUlt배, 무공 창에 '자득'.
// 수치 data/mkmat.json CHAMO. 테스트 tests/t152_chamo.js
const CHM=GD.CHAMO,BC_N=CHM.bcReq.length,BC_NAME={m:'위력',cd:'빠르기',rg:'범위'};
const chG=a=>Math.min(3,a.grade||0);
const chOk=it=>it&&it.slot==='book'&&ARTS[it.art]&&ARTS[it.art].forms[it.form]&&!ARTS[it.art].base;
const chKey=it=>ARTS[it.art].id+':'+it.form;
// 고를 수 있는 쓰임: [{k,n,d,why}] (why가 있으면 못 고른다)
function chOpts(it){const a=ARTS[it.art],g=chG(a),L=[];
  if(g>=CHM.minG.pc)L.push({k:'pc',n:'창안 조각',d:`${AGR[g]} 조각 1장 (${AGR[g]} 창안 재료 한 자리 = ${CHM.pcNeed[Math.min(g,CHM.pcNeed.length-1)]}장)`,why:a.gy?'기연 무공은 창안 재료가 못 된다':''});
  if(g>=CHM.minG.ms){const c=ARTS[P.cur],s=A(P.cur);L.push({k:'ms',n:'숙련',d:`펼치는 [${c?c.n:'-'}]의 숙련이 오른다`,why:!s?'펼치는 무공이 없다':s.p>=100?'펼치는 무공이 이미 극성이다':typeof kyulCap==='function'&&s.p>=kyulCap(P.cur)?`구결이 없어 숙련이 ${kyulCap(P.cur)}에서 멈춰 있다`:''})}
  if(g>=CHM.minG.en)L.push({k:'en',n:'깨달음',d:`깨달음 +${CHM.en[g]} (무리에 더해진다)`,why:P.chm&&P.chm[chKey(it)]?'이 초식에서 얻을 깨달음은 이미 얻었다':''});
  if(g>=CHM.minG.sd)L.push({k:'sd',n:'심득',d:`심득 +${CHM.sd[g]} (변초에 쓴다)`,why:''});
  return L}
let chAsk=null;hook('panelOpen',()=>{chAsk=null});
function chBtn(it){return chOk(it)?B('chask:'+it.id,'참오'):''}
function chAskHtml(it){if(chAsk!==it.id||!chOk(it))return'';const a=ARTS[it.art],g=chG(a);
  const rows=chOpts(it).map(o=>`<div class="it"><div><b>${o.n}</b><span>${o.d}${o.why?` · <span class="bad">${o.why}</span>`:''}</span></div><div class="ib">${B(`chdo:${it.id}:${o.k}`,o.n,{d:!!o.why,pri:!o.why})}</div></div>`).join('');
  const more=g<CHM.minG.sd?` <small class="dim">${g<CHM.minG.en?'중승 이상이면 깨달음, ':''}상승 이상이면 심득도 고를 수 있다.</small>`:'';
  return `<div class="card" id="chask" style="flex:1 1 100%;width:100%;box-sizing:border-box"><p><b class="gold">참오</b> [${a.n} · ${a.forms[it.form].n}]을(를) 읽어 익히지 않고 이치만 얻는다. 책은 사라진다.${more}</p><div class="list">${rows}</div><div class="center">${B('chno','그만둔다')}</div></div>`}
function chDo(id,k){const it=P.bag.find(i=>i.id===id);if(!chOk(it))return false;const o=chOpts(it).find(q=>q.k===k);if(!o||o.why){if(o&&o.why)log(o.why+'.','info');return false}
  if(inCombat()){log('싸움 중에는 무공서를 참오할 수 없다.','info');return false}
  const a=ARTS[it.art],g=chG(a),f=a.forms[it.form];P.bag.splice(P.bag.indexOf(it),1);chAsk=null;
  const head=`[${a.n} · ${f.n}]을(를) 참오했다.`;
  if(k==='pc'){P.mkp=P.mkp||{};P.mkp[g]=(P.mkp[g]||0)+1;log(`${head} ${AGR[g]} 창안 조각 +1 (${P.mkp[g]}장)`,'xp')}
  else if(k==='ms'){const c=P.cur,b=A(c).p;gainMast(c,CHM.ms[g]);log(`${head} 그 이치로 [${ARTS[c].n}]을(를) 비추어 숙련 +${(A(c).p-b).toFixed(1)}`,'xp')}
  else if(k==='en'){(P.chm=P.chm||{})[chKey(it)]=1;gainEnl(CHM.en[g],`${head}`)}
  else if(k==='sd'){P.sd=(P.sd||0)+CHM.sd[g];log(`${head} 심득 +${CHM.sd[g]} (${P.sd}) · 무공 창에서 변초에 쓴다`,'xp')}
  return true}
// 돈오: 무공을 극성(숙련 100)까지 익히면 심득
hook('mastDone',({id,s,before})=>{if(before<100&&s.p>=100&&CHM.donoSd>0){P.sd=(P.sd||0)+CHM.donoSd;log(`돈오의 심득 +${CHM.donoSd} (${P.sd}) · 무공 창에서 변초에 쓴다`,'xp')}});

// ---- 창안 조각: g_create.js mkSubs가 부른다. 같은 등급부터, 모자라면 높은 등급 조각으로 한 자리씩 ----
function pcSlots(g,max){const pool={...(P.mkp||{})},need=CHM.pcNeed[Math.min(g,CHM.pcNeed.length-1)],out=[];
  while(out.length<max){let left=need;const take={};for(let h=g;h<=3&&left>0;h++){const n=Math.min(left,pool[h]||0);if(n>0){take[h]=n;left-=n}}
    if(left>0)break;for(const h in take)pool[h]-=take[h];out.push({pc:take,g})}
  return out}
const pcName=x=>Object.entries(x.pc).map(([h,n])=>`${AGR[h]} 조각 ${n}`).join('+');
function pcSpend(x){P.mkp=P.mkp||{};for(const h in x.pc)P.mkp[h]=Math.max(0,(P.mkp[h]||0)-x.pc[h])}

// ---- 변초 ----
const bcOf=(id,i)=>(P.bc&&P.bc[id]&&P.bc[id][i])||'';
const bcRg=f=>!!(f.rad||f.len);
// 펼칠 때 덧입힌 초식 (useForm이 부른다)
function bcForm(id,i,f){const s=bcOf(id,i);if(!s||!f)return f;const o={...f},K=CHM.bcK,parts=s.match(/cd|rg|m/g)||[];
  const cm=parts.filter(x=>x==='m').length,cc=parts.filter(x=>x==='cd').length,cr=parts.filter(x=>x==='rg').length;
  if(cm)o.m=f.m*(1+K.m*cm);if(cc)o.cd=f.cd*(1-K.cd*cc);if(cr){if(f.rad)o.rad=f.rad*(1+K.rg*cr);if(f.len)o.len=f.len*(1+K.rg*cr)}return o}
const bcSteps=(id,i)=>(bcOf(id,i).match(/cd|rg|m/g)||[]);
function bcWhy(id,i,k){const a=ARTS[id],s=A(id),f=a&&a.forms[i];if(!f||!s)return'익히지 않은 무공';if(!s.f[i])return'익히지 않은 초식';
  const st=bcSteps(id,i).length;if(st>=BC_N)return'3단까지 고쳤다';if(k==='rg'&&!bcRg(f))return'범위가 없는 초식';
  if(s.p<CHM.bcReq[st])return`숙련 ${CHM.bcReq[st]} 필요`;if((P.sd||0)<CHM.bcCost[st])return`심득 ${CHM.bcCost[st]} 필요`;if(inCombat())return'싸움 중';return''}
function bcDo(id,i,k){if(bcWhy(id,i,k)||!BC_NAME[k])return false;const st=bcSteps(id,i).length;P.sd-=CHM.bcCost[st];
  P.bc=P.bc||{};const L=P.bc[id]=P.bc[id]||[];L[i]=(L[i]||'')+(L[i]?',':'')+k;const a=ARTS[id];
  log(`[${a.n} · ${a.forms[i].n}]을(를) 내 몸에 맞게 고쳤다: ${BC_NAME[k]} (${st+1}단)`,'xp');jdCheck(id);return true}
// 자득: 초식을 모두 익히고 모두 3단, 숙련 100
const jdOn=id=>!!(P&&P.jd&&P.jd[id]);
function jdCheck(id){const a=ARTS[id],s=A(id);if(!a||!s||jdOn(id)||s.p<100||!allLearned(id))return;if(a.forms.some((f,i)=>bcSteps(id,i).length<BC_N))return;
  (P.jd=P.jd||{})[id]=1;showBanner('자득',`${a.n} · 초식에 얽매이지 않는다`);fx.push({t:'lvl',x:P.x,y:P.y,z:P.z||0,life:1.8});
  log(`[${a.n}]의 초식을 모두 내 것으로 고쳤다. 초식에 얽매이지 않는 자득의 경지: 필살기 위력 ×${CHM.jdUlt}`,'xp');feat(`${a.n}을(를) 자득했다`)}
hook('mastDone',({id})=>jdCheck(id));
const jdUlt=id=>jdOn(id)?CHM.jdUlt:1;
// 무공 창: 무공 카드 안의 변초 칸 (익힌 무공만, 심득이나 고친 초식이 있을 때)
let bcOpen=null;hook('panelOpen',()=>{bcOpen=null});
function bcTag(id,i){const st=bcSteps(id,i);return st.length?` <small class="gold">${st.map(k=>BC_NAME[k][0]).join('')}</small>`:''}
function bcHtml(id){const a=ARTS[id],s=A(id);if(!a||!s||a.base)return'';const any=a.forms.some((f,i)=>bcSteps(id,i).length);if(!any&&!(P.sd>0))return'';
  const head=`<div class="row2"><span class="note"><b>변초</b> 심득 <b class="gold">${P.sd||0}</b>${jdOn(id)?' · <b class="gold">자득</b>':''}</span>${B('bcopen:'+id,bcOpen===id?'접기':'초식 고치기')}</div>`;
  if(bcOpen!==id)return head;
  const rows=a.forms.map((f,i)=>{if(!s.f[i])return'';const st=bcSteps(id,i).length;
    const bs=Object.keys(BC_NAME).map(k=>{const w=bcWhy(id,i,k);return B(`bcdo:${id}:${i}|${k}`,BC_NAME[k],{d:!!w,t:w})}).join('');
    return `<div class="it"><div><b>${f.n}</b>${bcTag(id,i)}<span>${st}/${BC_N}단${st<BC_N?` · 다음 단 숙련 ${CHM.bcReq[st]} · 심득 ${CHM.bcCost[st]}`:' · 다 고쳤다'}</span></div><div class="ib">${st<BC_N?bs:''}</div></div>`}).join('');
  return head+`<p class="note dim">단마다 위력 +${Math.round(CHM.bcK.m*100)}% · 빠르기(재사용 -${Math.round(CHM.bcK.cd*100)}%) · 범위 +${Math.round(CHM.bcK.rg*100)}% 가운데 하나. 모든 초식을 ${BC_N}단까지 고치고 숙련 100이면 자득(필살기 ×${CHM.jdUlt}).</p><div class="list">${rows}</div>`}
hook('sectAct',c=>{
  if(c.a==='chask'){c.done=true;c.r=true;chAsk=chAsk===+c.x?null:+c.x;setTimeout(()=>{const q=$('chask');if(q&&q.scrollIntoView)q.scrollIntoView({block:'nearest'})},0);return}
  if(c.a==='chno'){c.done=true;c.r=true;chAsk=null;return}
  if(c.a==='chdo'){c.done=true;c.r=true;chDo(+c.x,c.y);return}
  if(c.a==='bcopen'){c.done=true;c.r=true;bcOpen=bcOpen===c.x?null:c.x;return}
  if(c.a==='bcdo'){c.done=true;c.r=true;const[i,k]=String(c.y).split('|');bcDo(c.x,+i,k);return}});
// 창안 재료 칸에 보일 한 줄
function chMatLine(){const m=P.mkp||{},pc=[0,1,2,3].filter(h=>m[h]>0).map(h=>`${AGR[h]} ${m[h]}`);
  return `<p class="note"><b>참오</b> 행낭의 무공서를 읽지 않고 이치만 얻는다. 하승부터 창안 조각·숙련, 중승부터 깨달음, 상승부터 심득(변초). 창안 조각 ${pc.length?pc.join(' · '):'없음'} · 심득 ${P.sd||0}</p>`}

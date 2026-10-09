// ================= 마교: 문파 하나로 세력 하나 =================
// 정의맹·사천맹은 문파 여럿이 모인 연합이고, 마교(천마신교)는 문파 하나가 그대로 세력이다. 설계: docs/세력_문파_설계.md 17장
// - 조직: 교주 천마 → 부교주 → 사대호법 → 장로원 → 오당(당주) → 향주 → 정예교도 → 교도. 직위는 일곱 단(g_faction.js SRANK.magyo).
// - 오당: 입교한 뒤 오당 광장에서 당 하나에 든다. 일반 무공은 당마다 하나씩이라 자기 당 무공만 익히고(공적 30% 싸다),
//   장로가 되면 다른 당 무공도 익힌다. 고급 무공(천마검법·천마신장)은 교 전체의 것. 마교는 바깥 사람에게 비급을 주지 않는다.
// - 본거지: 다른 문파 본산은 1~4맵이지만 마교는 신강 십만대산의 여덟 맵이 모두 마교 땅이다 (g_stage.js 틀).
//   협곡 → 천마관 → 마교 성읍 → 혈마연무장 → 오당 광장 → 장로원 → 천마신전(교주) → 천마동(장로 이상만).
//   전각은 검은 벽에 붉은 기와. 마교도가 관문부터 신전까지 지키고, 정·사 무인은 협곡까지만 쳐들어온다.
const MDANG={
  hyeolma:{n:'혈마당',art:'S_cheonma_0',cls:'권',d:'피를 끓여 쓰는 장법의 당. 마교의 선봉'},
  maryeong:{n:'마령당',art:'S_cheonma_1',cls:'도',d:'귀기 어린 도법으로 적진을 가르는 당'},
  hyeolyeong:{n:'혈영대',art:'S_cheonma_4',cls:'창',d:'붉은 그림자처럼 들이치는 창기병'},
  gwiryeong:{n:'귀령당',art:'S_cheonma_5',cls:'봉',d:'곤으로 관문과 신전을 지키는 수비의 당'},
  amhyeol:{n:'암혈당',art:'S_cheonma_6',cls:'궁',d:'어둠 속에서 독시를 날리는 암살과 척후의 당'}};
const MG_ELDER=4;   // 장로부터 다른 당 무공도 익힌다
const dangOfArt=id=>Object.keys(MDANG).find(k=>MDANG[k].art===id);
const dangDisc=id=>P&&P.sect==='cheonma'&&P.dang&&MDANG[P.dang].art===id?.7:1;
// 마교 무공을 익힐 수 없는 까닭 (없으면 '')
function mgArtBlock(a){
  if(!P||P.sect!=='cheonma')return '교도만';if(a.hi)return '';
  const d=dangOfArt(a.id);if(!d||d===P.dang)return '';
  if(!P.dang)return '당에 든 뒤';
  return rankIdx('cheonma')>=MG_ELDER?'':`${MDANG[d].n} 무공 · 장로부터`}
function mgJoinDang(k){const D=MDANG[k];if(!D||P.sect!=='cheonma'||P.dang)return false;
  P.dang=k;const a=ARTS[D.art];if(!P.arts[a.id])P.arts[a.id]={p:0,f:a.forms.map((f,i)=>i===0)};else P.arts[a.id].f[0]=true;
  log(`${D.n}에 들었습니다. 당의 무공 [${a.n}]의 첫 초식 [${a.forms[0].n}]을(를) 익혔습니다. 당 무공 비급은 공적이 30% 쌉니다.`,'xp');
  showBanner(D.n,'천마신교 오당');P.feats.push(`${Math.floor(P.age)}세에 천마신교 ${D.n}에 들었다`);return true}

// ---- 화면 ----
function mgOrgHtml(){const i=P.sect==='cheonma'?rankIdx('cheonma'):-1,R=SRANK.magyo;
  const al=k=>Object.values(SECTS).filter(s=>s.al===k).length;
  return `<div class="card"><h4>천마신교의 짜임 <small class="dim">문파 하나가 곧 세력</small></h4>
    <p>교주 천마 → ${R.slice(1).reverse().map((n,k)=>{const j=R.length-1-k;return j===i?`<b class="gold">${n}</b>`:n}).join(' → ')} → ${i===0?'<b class="gold">교도</b>':'교도'}</p>
    <p>오당: ${Object.entries(MDANG).map(([k,D])=>`${P.dang===k?`<b class="gold">${D.n}</b>`:D.n}(${CLASS[D.cls].n})`).join(' · ')}</p>
    <p class="note">정의맹 ${al('jeong')}문파, 사천맹 ${al('sacheon')}문파와 홀로 맞선다. 입교하면 오당 광장에서 당 하나에 든다. 자기 당 무공만 익히다가 장로가 되면 다른 당 무공도 익힌다. 직위는 다른 세력보다 두 단 높은 호법·부교주까지 오른다.</p></div>`}
function dangDlg(n){const D=MDANG[n.dang],a=ARTS[D.art],s=SECTS.cheonma,mine=P.dang===n.dang;
  const hi=P.sect!=='cheonma'?`"교도가 아니면 이 전각에 발을 들이지 마라."`:mine?`"${rankName('cheonma')}, ${D.n}의 이름을 높여라."`:P.dang?`"${MDANG[P.dang].n} 사람이 무슨 일인가."`:`"아직 당이 없군. ${D.n}에 들겠는가?"`;
  const st=A(a.id),blk=mgArtBlock({id:a.id});
  const join=P.sect==='cheonma'&&!P.dang?`<div class="row2"><span class="note">당은 한 번 고르면 바꿀 수 없다. 들면 [${a.n}]의 첫 초식을 바로 익힌다.</span>${B('mdang:'+n.dang,`${D.n} 입당`,{pri:1})}</div>`:'';
  return `<p class="note">${hi}</p><div class="row2"><span class="note">${embImg('cheonma',22)} <b>${D.n}</b> · 천마신교 오당${mine?' · <span class="good">내 당</span>':''}</span></div><p class="note">${D.d}.</p>${join}
    <div class="list"><div class="it"><div style="color:rgb(${a.c})">${a.n} ${gradeTag(a.grade)} <small class="dim">${D.n} 무공</small><span>${CLASS[a.cls].n}·${a.el} · 초식 ${a.forms.length}개${st?` · 익힌 초식 ${st.f.filter(Boolean).length}`:''}${blk?` · ${blk}`:mine?' · 비급 공적 30% 할인':''}</span></div></div></div>
    <p class="note">비급은 천마신전의 교주에게서 공적으로 받는다.</p>${mgOrgHtml()}`}
hook('hqDlg',c=>{if(c.n.hq==='cheonma')c.html+=mgOrgHtml()});
hook('npcDlg',c=>{if(c.html==null&&c.n.dang)c.html=dangDlg(c.n)});
hook('sectAct',c=>{if(c.a==='mdang'){mgJoinDang(c.x);c.done=true;c.r=true}});
hook('sectActDone',c=>{
  if(c.a==='sjoin'&&c.x==='cheonma'&&P.sect==='cheonma')setTimeout(()=>log('오당 광장의 다섯 전각 가운데 한 곳을 골라 당에 드세요.','sys'),80);
  if(P.sect!=='cheonma')P.dang=null});

// ---- 십만대산: 마교 여덟 맵 (g_stage.js 틀) ----
// 오당 광장의 다섯 전각 자리 (왼쪽 셋, 오른쪽 둘. 오른쪽 아래는 오당 회의청)
const MG_HALL={hyeolma:[7,9],maryeong:[7,17],hyeolyeong:[7,25],gwiryeong:[30,9],amhyeol:[30,17]};
// 협곡 → 천마관 → 마교 성읍 → 혈마연무장 → 오당 광장 → 장로원 → 천마신전(교주) → 천마동(장로 이상만)
{const s=SECTS.cheonma,th='dark',own=(n0,n1,area)=>ownSp(s,area,n0,n1),M=REGIONS.hq_cheonma,keep={gates:M.gates,prov:M.prov};
  const st=(k,c)=>stageRegion({id:k,s,th,mg:1,seed:9100+k.length*7+(c.seed||0),...c});
  st('hq_cheonma_1',{name:'십만대산 협곡',seed:1,top:1,nodes:{ore:8,herb:4},spawns:[...foeSp(s,y=>true,3),['늑대',3,(x,y)=>y>=8],['호랑이',1,(x,y)=>y<=20]]});
  st('hq_cheonma_2',{name:'천마관',seed:2,top:1,wall:[27,12],flags:[[16,29],[24,29],[16,14],[24,14]],lamps:[[17,25],[23,25],[17,10],[23,10]],
    zone:(x,y)=>y>=27?'천마관 외관':y>=12?'천마관 내관':'천마관 뒷길',spawns:[...own(5,1,(x,y)=>y>=13&&y<=26)]});
  st('hq_cheonma_3',{name:'마교 성읍',seed:3,top:1,yard:[10,13,30,30],
    builds:[{x:11,y:15,w:3,h:2,kind:'inn'},{x:26,y:15,w:3,h:2,kind:'smith'},{x:11,y:21,w:2,h:2},{x:27,y:21,w:2,h:2},{x:11,y:26,w:3,h:2},{x:26,y:26,w:3,h:2}],
    lamps:[[15,18],[25,18],[15,24],[25,24]],flags:[[16,31],[24,31]],
    npcs:[{id:'inn',n:'마교 객잔 주인',x:12.5,y:17.7,pal:'keeper'},{id:'smith',n:'병기당 대장장이',x:27.5,y:17.7,pal:'smithy'},
      {id:'pharm',n:'독약당 의원',x:12,y:23.7,pal:'keeper'},{id:'post',n:'역참 마부',x:23.5,y:34.4,pal:'keeper'}],spawns:[...own(4,0,(x,y)=>y>=13&&y<=30)]});
  st('hq_cheonma_4',{name:'혈마연무장',seed:4,top:1,yard:[7,8,33,30],
    builds:[{x:8,y:9,w:3,h:2,kind:'hall'},{x:30,y:9,w:3,h:2,kind:'hall'},{x:8,y:27,w:2,h:2},{x:31,y:27,w:2,h:2}],lamps:[[12,12],[28,12],[12,26],[28,26]],flags:[[15,31],[25,31]],
    npcs:[{id:'steward',steward:'cheonma',n:'혈마연무장 교두',x:9.5,y:11.7,pal:sectPal('cheonma',3,'도',{elite:1})}],spawns:[...own(7,2,(x,y)=>y>=8&&y<=30)]});
  st('hq_cheonma_5',{name:'오당 광장',seed:5,top:1,yard:[6,8,34,32],
    builds:[...Object.values(MG_HALL).map(([x,y])=>({x,y,w:3,h:2,kind:'hall'})),{x:30,y:25,w:3,h:2,kind:'hall'}],lamps:[[12,13],[28,13],[12,29],[28,29]],flags:[[15,33],[25,33]],
    npcs:Object.entries(MG_HALL).map(([k,[x,y]])=>({id:'dang_'+k,dang:k,n:`${MDANG[k].n}주`,x:x+1.5,y:y+2.7,pal:sectPal('cheonma',3,MDANG[k].cls,{elite:1})})),
    spawns:[...own(4,1,(x,y)=>y>=8&&y<=32)]});
  st('hq_cheonma_6',{name:'장로원',seed:6,top:1,yard:[11,8,29,26],builds:[{x:16,y:10,w:5,h:3,kind:'hall'},{x:12,y:18,w:2,h:2},{x:26,y:18,w:2,h:2}],lamps:[[14,14],[25,14]],flags:[[16,27],[24,27]],
    npcs:[{id:'elder',elder:'cheonma',n:'장로원 대장로',x:18.5,y:14.7,pal:sectPal('cheonma',4,'검',{master:1})}],spawns:[...own(2,1,(x,y)=>y>=8&&y<=26)]});
  // 천마신전: 장문인 맵 자리(hq_cheonma)를 새 틀로 바꾼다. 성(省)으로 나가는 출입구는 linkChain이 협곡으로 옮긴다
  st('hq_cheonma',{name:'천마신전',seed:7,top:1,topX:12,yard:[8,4,32,24],
    builds:[{x:17,y:5,w:7,h:3,kind:'temple'},{x:9,y:8,w:2,h:3},{x:29,y:8,w:2,h:3}],lamps:[[16,11],[25,11],[14,18],[26,18]],flags:[[17,25],[23,25],[15,9],[26,9]],
    npcs:[{id:'hq',hq:'cheonma',n:'천마신교 교주 천마',x:20.5,y:9.6,pal:masterPal(s)},{id:'post',n:'역참 마부',x:22.6,y:36.4,pal:'keeper'}],
    spawns:[...own(3,2,(x,y)=>y>=4&&y<=24)]});
  Object.assign(REGIONS.hq_cheonma,keep);
  st('hq_cheonma_8',{name:'천마동',seed:8,yard:[12,6,28,16],need:()=>P.sect==='cheonma'&&rankIdx('cheonma')>=MG_ELDER?null:'천마동은 마교 장로 이상만 든다.',
    builds:[{x:18,y:7,w:3,h:3,kind:'pavilion'}],lamps:[[15,9],[25,9]],nodes:{ore:14,herb:6,chest:[24,8]},spawns:[['강시',2,(x,y)=>y<=20]]});
  linkChain(s,['hq_cheonma_1','hq_cheonma_2','hq_cheonma_3','hq_cheonma_4','hq_cheonma_5','hq_cheonma_6','hq_cheonma','hq_cheonma_8'])}

// ================= 기연 무공: 기연으로만 얻는 천고의 무공 =================
// 설계: docs/세력_문파_설계.md 16장
// - 무기마다 하나씩 6가지. 등급은 절정 위의 천고(AGR[4]): 초식·필살기가 가장 세고 숙련은 가장 더디게 오른다.
// - 상점·문파·비급·떨굼 어디에서도 나오지 않는다. 기연 터(이따금 반짝이는 자리)와 보물상자의 기연에서만 만난다.
// - 비급이 없다. 만나는 순간 1초식을 깨치고, 나머지 초식은 기초권각처럼 숙련이 차면 저절로 열린다.
// - 정사 어느 쪽이든 익힐 수 있고, 오성이 정한 무공 가짓수에 들지 않는다. 제자에게 전수할 수 없다.
// - 한 생에 최대 GY_MAX가지. 보물상자 기연은 GY_P.chest, 기연 터는 GY_P.spot 확률로 이 무공이 나온다.
const GY_MAX=2,GY_P={chest:.4,spot:.15};
const GY_ARTS={
  gy_geom:{n:'천외비선검',cls:'검',el:'금',forms:['비선출운','유성낙월','천외일섬','선학귀소','만검귀종'],ult:'비선승천',d:'하늘 밖에서 내려온 신선이 남긴 검. 벼랑 끝 바위에 새겨져 전한다'},
  gy_do:{n:'혈월광도',cls:'도',el:'화',forms:['월하참','혈영단','광풍노도','적월만천','혈해귀원'],ult:'혈월천하',d:'붉은 달이 뜨는 밤에만 글자가 떠오르는 도보'},
  gy_chang:{n:'용음비창',cls:'창',el:'수',forms:['잠룡출수','용음일성','비룡재천','항룡유회','신룡파해'],ult:'용음만리',d:'깊은 못 밑 용의 뼈에 새겨진 창법'},
  gy_bong:{n:'항마금강봉',cls:'봉',el:'토',forms:['금강도','복호세','항마일봉','나한타산','금강부동'],ult:'대항마인',d:'무너진 옛 절터 불상 속에서 나온 봉법'},
  gy_gwon:{n:'태허무극권',cls:'권',el:'목',forms:['허실상생','태허일권','무극환','건곤역전','태극귀일'],ult:'태허무극',d:'이름 없는 노인이 꿈속에서 일러 준 권법'},
  gy_gung:{n:'사일신궁',cls:'궁',el:'화',forms:['낙일전','연주삼시','천랑사','관일장홍','구일낙천'],ult:'사일',d:'아홉 해를 쏘아 떨어뜨렸다는 옛 궁신의 활법'}};
// buildArts에서 부른다: 문파 무공과 같은 틀(초식 무늬 풀)로 만들되 등급은 천고(4)
function addGiyeonArts(arts,pool,ults){
  const g=4,mul=GMUL[g];
  Object.entries(GY_ARTS).forEach(([id,a],ai)=>{
    const r=rng(911+a.n.charCodeAt(0)*13+a.n.charCodeAt(1)*3+ai);
    const p=pool[a.cls].slice();for(let i=p.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
    const first=p.findIndex(f=>['melee','multi','line'].includes(f.p)||(f.p==='proj'&&!f.full&&f.cnt<=2));
    const pick=[p.splice(Math.max(0,first),1)[0],...p.slice(0,a.forms.length-1).sort((x,y)=>x.cd-y.cd)];
    const forms=pick.map((f,i)=>({...f,n:a.forms[i],req:REQ[i],cost:0,bonus:BONUS[i],qi:4+i*4,m:f.m*(1+.06*i)*mul}));
    const u=ults[a.cls][ai%ults[a.cls].length],EC=EL[a.el];
    arts[id]={id,side:null,cls:a.cls,el:a.el,n:a.n,c:EC.c,pt:EC.pt,elc:a.el==='금',forms,gy:1,grade:g,
      ult:{n:a.ult,steps:[F('','circle',{rad:3,m:GULT[g][0],stun:.4}),...u.steps.map(x=>({...x,m:(x.m||1)*GULT[g][1],delay:(x.delay||0)+.18}))]},
      d:`${a.d}. 천고 기연 무공 · ${CLASS[a.cls].n} · 오행 ${a.el}. 초식 ${forms.length}개는 숙련이 차면 저절로 열린다.`};
  });
}
const gyMine=()=>Object.keys(GY_ARTS).filter(id=>P.arts[id]);
// 이번 기연에서 무공을 만날 수 있으면 그 id. 지금 쥔 무기(맨손이면 펼치는 무공)의 무공을 반쯤 더 쳐 준다
function gyRoll(src){
  if(gyMine().length>=GY_MAX||Math.random()>=(GY_P[src]||0))return null;
  const left=Object.keys(GY_ARTS).filter(id=>!P.arts[id]);if(!left.length)return null;
  const w=P.eq.weapon,c=w?w.cls:curCls(),mine=left.find(id=>GY_ARTS[id].cls===c);
  return mine&&Math.random()<.5?mine:pick(left)}
function gyLearn(id){const a=ARTS[id];
  P.arts[id]={p:0,f:a.forms.map((f,i)=>i===0)};
  log(`기연: 천고의 무공 [${a.n}]을(를) 만나 첫 초식 [${a.forms[0].n}]을(를) 깨쳤습니다. 나머지 초식은 숙련이 차면 열립니다.`,'xp');
  if(!G.gyLog)G.gyLog=[];if(!G.gyLog.includes(id))G.gyLog.push(id);
  if(hasWeaponFor(a.cls))setArt(id);
  return a}
// 무공 창 맨 아래 한 줄: 강호에 전하는 기연 무공 중 몇 가지를 만났나 (여러 생에 걸쳐)
function gyNote(){const seen=G.gyLog||[];
  return `<p class="note">기연 무공 ${seen.length}/${Object.keys(GY_ARTS).length} · ${Object.entries(GY_ARTS).map(([id,a])=>seen.includes(id)?a.n:'???').join(' · ')}. 기연 터와 보물상자의 기연에서만 만나며, 한 생에 ${GY_MAX}가지까지.</p>`}

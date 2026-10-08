// ================= 세력 무인, 문파 직위, 문파 본산 =================
// 정파·사파·마교 무인 몹은 서로 적이다. 정파와 사파는 서로 싸우고, 마교는 정사 모두를 공격한다.
// 플레이어 편(문파의 세력, 없으면 정·사 성향)과 같은 무인은 먼저 덤비지 않는다.
// 문파마다 본산 지역맵(40×40)이 따로 있고, 개봉 역참에서 말을 타고 간다. 가입은 본산의 장문인에게만 청한다.
// 설계: docs/세력_문파_설계.md 8~10장
const alFac=al=>al==='magyo'?'마':ALLY[al].side;
const FACN={정:'정파',사:'사파',마:'마교'};
// 플레이어 편: 마교 제자면 '마', 문파가 있으면 그 세력, 없으면 타고난 성향
function pfac(){const s=P&&P.sect&&SECTS[P.sect];return s?alFac(s.al):P?P.side:'정'}
const facFoe=(a,b)=>!!a&&!!b&&a!==b;
// 이 무인이 플레이어에게 적인가: 다른 편이거나, 같은 편이라도 공격당해 등을 돌렸으면 적
const mobFoeP=e=>e.angry||facFoe(e.d.fac,pfac());
const peaceful=m=>!!m.d.fac&&!mobFoeP(m);
const FAC_KIND={정:['정파 무인','정파 고수'],사:['사파 무인','사파 고수'],마:['마교도','마교 고수']};
Object.assign(MOBS,{
  '정파 무인':{hp:95,atk:10,def:2,hm:14,sp:1.9,xp:18,silver:[3,9],fac:'정',hostile:1,aggro:6},
  '정파 고수':{hp:260,atk:17,def:4,hm:24,sp:2,xp:55,silver:[10,24],fac:'정',hostile:1,aggro:7,elite:1,big:1.06},
  '사파 무인':{hp:95,atk:11,def:2,hm:12,sp:1.9,xp:18,silver:[4,10],fac:'사',hostile:1,aggro:6,good:2},
  '사파 고수':{hp:260,atk:18,def:4,hm:22,sp:2,xp:55,silver:[12,26],fac:'사',hostile:1,aggro:7,elite:1,big:1.06,good:4},
  '마교도':{hp:110,atk:12,def:2,hm:16,sp:1.95,xp:22,silver:[4,11],fac:'마',hostile:1,aggro:6,good:3},
  '마교 고수':{hp:300,atk:20,def:5,hm:26,sp:2.05,xp:65,silver:[12,28],fac:'마',hostile:1,aggro:7,elite:1,big:1.08,good:5}});
// 옷 색: 정파 흰옷·청띠, 사파 갈색·자주띠, 마교 검은옷·붉은띠, 소림은 가사
const FAC_ROBE={
  정:{robe:['#e6e8ee','#8a96aa'],robeB:'#7a869a',inner:'#2b5a8b',sash:'#2b5a8b',hairband:'#2b5a8b',trim:'#c9a14a'},
  사:{robe:['#4a3a2e','#1a120c'],robeB:'#2e2218',inner:'#6a2a7a',sash:'#6a2a7a',hairband:'#8a3a9a',trim:'#8a6a40'},
  마:{robe:['#1a1414','#060404'],robeB:'#100a0a',inner:'#a01818',sash:'#a01818',hairband:'#c02020',trim:'#c9a14a',cape:'#4a0606'},
  소림:{robe:['#d88a2e','#7a3a10'],robeB:'#8a4a18',inner:'#a3271c',sash:'#a3271c',hairband:null,trim:'#e0b050',tail:0}};
function facPal(fac,cls,elite,sid){
  const look=sid==='shaolin'?'소림':fac,k=`fac_${look}_${cls}_${elite?1:0}`;
  if(!PAL[k])PAL[k]={...PAL.hero,...FAC_ROBE[look],weapon:CLASS[cls].draw,anim:CLASS[cls].anim,jade:0,beard:elite?1:0,armor:elite&&fac!=='정'?1:0};
  return k}
// 무인 하나를 만든다. sid를 주면 그 문파 제자, 없으면 그 세력의 아무 문파
function mkFac(fac,elite,x,y,sid){
  const s=SECTS[sid]||pick(Object.values(SECTS).filter(q=>alFac(q.al)===fac)),a=pick(s.arts.filter(q=>!q.hi)),cls=a.cls,kind=FAC_KIND[fac][elite?1:0];
  const e=mkMob(kind,x,y),bow=cls==='궁';
  e.d={...e.d,el:a.el,ranged:bow?1:0};e.el=a.el;e.reach=bow?5:cls==='창'?1.8:cls==='봉'?1.6:1.3;
  e.pal=facPal(fac,cls,elite,s.id);e.sect=s.id;e.name=`${s.n} ${elite?'고수':fac==='마'?'교도':'제자'}`;
  return e}
// 0.5초마다 주변의 적 세력 무인을 찾아 노린다
function facScan(e,dt){
  e.fscan=(e.fscan||0)-dt;if(e.fscan>0)return;e.fscan=.45+Math.random()*.2;
  if(e.tgt&&e.tgt.hp>0&&e.tgt.isMob&&dist(e,e.tgt)<12)return;
  if(e.aggro&&!e.tgt&&mobFoeP(e)&&dist(e,P)<4)return;   // 플레이어와 붙어 있으면 그대로
  let b=null,bd=(e.d.aggro||6)+1;
  for(const o of mobs)if(o!==e&&o.hp>0&&o.d.fac&&facFoe(o.d.fac,e.d.fac)){const q=dist(o,e);if(q<bd){bd=q;b=o}}
  if(b){e.tgt=b;e.aggro=true}
}
// 몹끼리의 타격. 쓰러져도 전리품은 없고, 가끔 은자 주머니가 떨어진다.
function mobHurt(t,dm,src){
  if(t.hp<=0)return;dm=Math.max(1,Math.round(dm*(.9+Math.random()*.2)-(t.def||0)));t.hp-=dm;t.hit=.12;
  if(dist(t,P)<14)addText(t.x,t.y,dm,'#c8b8a0');
  if(t.d.fac&&(!t.tgt||t.tgt.hp<=0||!t.tgt.isMob||Math.random()<.3)){t.tgt=src;t.aggro=true}
  if(t.hp<=0){t.hp=0;fx.push({t:'puff',x:t.x,y:t.y,life:.6});if(P.target===t)P.target=null;
    if(dist(t,P)<12)log(`${src.name}이(가) ${t.name}을(를) 쓰러뜨렸습니다.`,'info');
    if(Math.random()<.35)drops.push({x:t.x,y:t.y,it:{silver:R1(2,6)},t:Math.random()*6})}
}
// 같은 편 무인을 친 대가: 악업, 그 무인과 주변 동도가 등을 돌린다
function facBetray(e){
  if(e.angry)return;e.angry=1;e.aggro=true;e.tgt=null;P.evil+=P.side==='정'?6:2;
  for(const o of mobs)if(o!==e&&o.hp>0&&o.d.fac===e.d.fac&&dist(o,e)<6){o.angry=1;o.aggro=true;o.tgt=null}
  log(`같은 편인 ${e.name}을(를) 공격했습니다. 악업이 쌓이고 주변 동도가 등을 돌립니다.`,'dmg');
}
// 플레이어가 무인을 쓰러뜨렸을 때: 적 세력이면 문파 공적, 같은 편이면 악업
function facKill(e){
  if(!e.d.fac)return;
  if(facFoe(e.d.fac,pfac())){if(P.sect&&SECTS[P.sect]){const v=addMerit(P.sect,e.d.elite?6:2);log(`${SECTS[P.sect].n} 공적 +${v}`,'xp')}}
  else{P.evil+=P.side==='정'?10:4;log(`동도 ${e.name}을(를) 죽였습니다. 무거운 악업이 쌓였습니다.`,'dmg')}
}
// 세력 대립 임무 (기존 임무 풀에 더한다)
SMIS.jeong.push({n:'사파 무인 소탕',kind:'kill',mob:['사파 무인','사파 고수'],cnt:5,merit:20,silver:35},{n:'마교도 토벌',kind:'kill',mob:['마교도','마교 고수'],cnt:4,merit:25,silver:45});
SMIS.sacheon.push({n:'정파 무인 사냥',kind:'kill',mob:['정파 무인','정파 고수'],cnt:5,merit:20,silver:40},{n:'마교도 격퇴',kind:'kill',mob:['마교도','마교 고수'],cnt:4,merit:25,silver:45});
SMIS.magyo.push({n:'정파 척살',kind:'kill',mob:['정파 무인','정파 고수'],cnt:5,merit:22,silver:45},{n:'사파 척살',kind:'kill',mob:['사파 무인','사파 고수'],cnt:5,merit:22,silver:45});
// 개봉 남쪽 초원에서 정파와 사파 순찰대가 마주치고, 북쪽 숲에는 마교도가 숨어든다
SPAWNS.push(['정파 무인',3,(x,y)=>y>28&&x>=13&&x<=21&&!inBamboo(x,y),(x,y)=>mkFac('정',0,x,y)],['사파 무인',3,(x,y)=>y>28&&x>=22&&x<=31,(x,y)=>mkFac('사',0,x,y)],
  ['마교도',2,(x,y)=>y<RIV-1&&x>=12&&x<=26,(x,y)=>mkFac('마',0,x,y)]);

// ================= 문파 직위 =================
// 문파에 있는 동안 얻은 공적을 따로 누적(P.mtot)해 직위가 오른다. 비급에 공적을 써도 직위는 내려가지 않는다.
const SRANK={jeong:['속가제자','정식제자','일대제자','호법','장로'],sacheon:['졸개','정예','조장','당주','장로'],magyo:['교도','정예교도','향주','당주','장로']};
const RANK_PTS=[0,60,180,400,800];
const HI_RANK=[0,1,2,2,3,4];   // 고급 무공 n번째 초식 비급에 필요한 직위
function rankIdx(sid=P.sect){const t=(P.mtot||{})[sid]||0;let i=0;while(i<4&&t>=RANK_PTS[i+1])i++;return i}
const rankName=(sid=P.sect,i)=>{const s=SECTS[sid];return s?SRANK[s.al][i??rankIdx(sid)]:null};
function addMerit(sid,v){
  if(!sid||!SECTS[sid])return 0;const member=P.sect===sid;if(member)v=Math.round(v*(1+rankIdx(sid)*.1));
  P.merit[sid]=(P.merit[sid]||0)+v;
  if(member){P.mtot=P.mtot||{};const b=rankIdx(sid);P.mtot[sid]=(P.mtot[sid]||0)+v;const a=rankIdx(sid);
    if(a>b){const n=rankName(sid),s=SECTS[sid];showBanner(`${s.n} ${n}`,'직위가 올랐습니다');log(`${s.n}의 ${n}(으)로 올랐습니다. ${rankPerk(a)}`,'xp');P.feats.push(`${Math.floor(P.age)}세에 ${s.n}의 ${n}이(가) 되었다`)}}
  return v}
function rankPerk(i){return['','고급 무공 둘째 초식 비급을 받을 수 있습니다.','비급 공적 20% 할인, 고급 무공 셋째·넷째 초식.','고급 무공 다섯째 초식.','고급 무공 마지막 초식.'][i]||''}
const rankDisc=sid=>P.sect===sid&&rankIdx(sid)>=2?.8:1;
// 해마다 직위에 따른 녹봉
function rankStipend(){const s=P.sect&&SECTS[P.sect];if(!s)return;const i=rankIdx(),v=i*15;if(v>0){P.silver+=v;log(`${s.n} ${rankName()} 녹봉으로 은자 ${v}을(를) 받았습니다.`,'sys')}}
function rankHtml(s){
  const i=rankIdx(s.id),t=(P.mtot||{})[s.id]||0,nx=RANK_PTS[i+1];
  return `<div class="card"><h4>직위 <b>${rankName(s.id)}</b></h4><p>누적 공적 ${t}${nx?` / ${nx} (다음 ${rankName(s.id,i+1)})`:' · 최고 직위'} · 공적 획득 +${i*10}% · 녹봉 해마다 은자 ${i*15}${i>=2?' · 비급 공적 20% 할인':''}</p>
    <p class="dim">${SRANK[s.al].map((n,k)=>k===i?`<b>${n}</b>`:n).join(' → ')}</p></div>`}

// ================= 문파 본산 지역 =================
// [지형, 지명]. 지형: peak 산봉우리, snow 설산, forest 숲, lake 호수, manor 장원, swamp 늪, canyon 붉은 협곡, dark 검은 땅
const HQ_THEME={
  mudang:['peak','무당산'],hwasan:['peak','화산'],emei:['peak','아미산'],kunlun:['snow','곤륜산'],kongtong:['canyon','공동산'],
  jeomchang:['forest','점창산'],cheongseong:['forest','청성산'],jongnam:['peak','종남산'],gaebang:['lake','동정호 군산'],
  namgung:['manor','남궁세가'],moyong:['lake','연자오'],paeng:['manor','하북팽가'],jegal:['forest','와룡강'],hwangbo:['manor','황보세가'],
  dang:['manor','사천당가'],cheolgeom:['canyon','철검문'],sinchang:['manor','신창문'],cheongpung:['forest','청풍문'],geumgang:['peak','금강문'],
  hyeolrang:['canyon','혈랑곡'],heuksa:['swamp','흑사방 총타'],mandok:['swamp','만독곡'],gwiyeong:['dark','귀영문 은신처'],
  haomun:['manor','하오문 본거지'],noklim:['forest','녹림채'],janggang:['lake','장강수로채'],chilsal:['canyon','칠살문'],salsu:['dark','살수문 비처'],
  sahyeol:['canyon','사혈문'],eumyang:['swamp','음양교'],hyeolsu:['canyon','혈수문'],mayeong:['dark','마영방'],heukpung:['canyon','흑풍채 본채'],
  cheonma:['dark','천산 천마신교']};
const hqId=s=>s.id==='shaolin'?'sungsan':'hq_'+s.id;
const hqPlace=s=>s.id==='shaolin'?'숭산 소림사':HQ_THEME[s.id][1];
function masterTitle(s){const n=s.n;return s.id==='shaolin'?'방장':/파$/.test(n)?'장문인':/방$/.test(n)?'방주':/가$/.test(n)?'가주':/곡$/.test(n)?'곡주':/채$/.test(n)?'채주':/교$/.test(n)?'교주':'문주'}
const POST_FEE=20,POST_AT={x:16.5,y:20.6};
const arriveAt=id=>id==='gaebong'?POST_AT:id==='sungsan'?{x:20.5,y:36.4}:{x:20.5,y:36.2};
PAL.abbot={...PAL.hero,...FAC_ROBE.소림,jade:0,hair:'#3a2a20',beard:1,weapon:'staff',anim:'swing'};
function masterPal(s){const f=alFac(s.al),k='master_'+f;if(!PAL[k])PAL[k]={...PAL.hero,...FAC_ROBE[f],hair:'#cfcac0',beard:1,jade:0,weapon:'none',cape:f==='정'?null:FAC_ROBE[f].cape||'#2a1a10'};return s.id==='shaolin'?'abbot':k}
const hqNpcs=(s,mx,my)=>[{id:'hq',hq:s.id,n:`${s.n} ${masterTitle(s)}`,x:mx,y:my,pal:masterPal(s)},{id:'post',n:'역참 마부',x:22.6,y:36.4,pal:'keeper'}];
const HQ_BEAST={peak:[['늑대',3],['호랑이',1]],snow:[['늑대',4],['호랑이',1]],forest:[['늑대',2],['곰',1],['사슴',3]],lake:[['사슴',2],['멧돼지',2]],
  manor:[['토끼',3],['양',2]],swamp:[['늑대',2],['멧돼지',2]],canyon:[['늑대',3],['멧돼지',1]],dark:[['늑대',3],['호랑이',1]]};
const inHQ=(x,y)=>x>=12&&x<=28&&y>=3&&y<=18;
// 본산 몹: 제자 다섯과 고수 하나가 지키고, 아래 산길로 적 세력 무인이 쳐들어온다
function hqSpawns(s,th){
  const own=alFac(s.al),[k0,k1]=FAC_KIND[own],out=(x,y)=>y>=21&&y<=34&&!inHQ(x,y);
  const sp=[[k0,5,inHQ,(x,y)=>mkFac(own,0,x,y,s.id)],[k1,1,inHQ,(x,y)=>mkFac(own,1,x,y,s.id)]];
  for(const f of['정','사','마'])if(facFoe(f,own))sp.push([FAC_KIND[f][0],2,out,(x,y)=>mkFac(f,0,x,y)]);
  for(const[k,c]of HQ_BEAST[th])sp.push([k,c,(x,y)=>(y<20||x<10||x>30)&&!inHQ(x,y)]);
  return sp}
for(const s of Object.values(SECTS)){if(s.id==='shaolin')continue;const[th,place]=HQ_THEME[s.id];
  REGIONS['hq_'+s.id]={name:place,hq:s.id,theme:th,gen:()=>genHQ(s,th),bake:()=>bakeHQ(th),
    zone:(x,y)=>inHQ(x,y)&&y<=16?`${s.n} 본산`:y>=31?`${place} 어귀`:`${place} 산길`,
    spawns:hqSpawns(s,th),bosses:[],gates:[{x:20.5,y:38.6,to:'gaebong',tx:POST_AT.x,ty:POST_AT.y,label:'개봉'}],npcs:hqNpcs(s,20.5,8.7)}}
// 소림사는 숭산 꼭대기 암자를 본산으로 쓴다
Object.assign(REGIONS.sungsan,{name:'숭산 소림사',hq:'shaolin',npcs:hqNpcs(SECTS.shaolin,20.5,7.4),
  zone:(x,y)=>y>=31?'숭산 산문':y<=9&&x>=14&&x<=26?'소림사':y<=13?'숭산 설봉':'숭산 산중'});
REGIONS.sungsan.spawns.push(['정파 무인',4,(x,y)=>y>=3&&y<=10&&x>=15&&x<=25,(x,y)=>mkFac('정',0,x,y,'shaolin')],['정파 고수',1,(x,y)=>y>=3&&y<=10&&x>=15&&x<=25,(x,y)=>mkFac('정',1,x,y,'shaolin')],
  ['사파 무인',2,(x,y)=>y>=14&&y<=22,(x,y)=>mkFac('사',0,x,y)],['마교도',2,(x,y)=>y<=12&&x>27,(x,y)=>mkFac('마',0,x,y)]);
// 본산 산길: 아래 출입구(x=20)에서 굽이쳐 본산 앞마당(y=16)으로 오른다
const hqPath=(y,sd)=>20+Math.round(3*Math.sin(y*.23+sd)*Math.min(1,(38-y)/4));
// ground: 0 풀, 1 길, 2 물, 3 다리, 4 본산 마당, 6 바위, 7 흙, 8 눈, 9 늪 진흙, 10 붉은 바위, 11 검은 땅
const HQ_BASE={peak:0,snow:8,forest:0,lake:0,manor:0,swamp:9,canyon:10,dark:11};
function genHQ(s,th){
  const r=rng(7000+s.i*131),sd=s.i*.7,o1=s.i*1.7,o2=s.i*.9;map=[];objs=[];lamps=[];builds=[];rails=[];nodes=[];plots=[];tents=[];
  const lakes=th==='lake'?[{x:8+r()*3,y:25+r()*4,rx:5.5,ry:4},{x:32+r()*2,y:27+r()*3,rx:4,ry:3.5},{x:6,y:9+r()*3,rx:3.5,ry:3}]:[];
  const tree=th==='peak'||th==='snow'||th==='dark'?'pine':'tree';
  for(let y=0;y<N;y++){map[y]=[];objs[y]=[];for(let x=0;x<N;x++){
    const px=hqPath(y,sd),onPath=y>=16&&(x===px||x===px+1),comp=x>=13&&x<=27&&y>=4&&y<=16,hi=fbm(x*.17+o1,y*.17+o2),arrive=x>=18&&x<=24&&y>=34;
    let g=HQ_BASE[th];
    if(th==='peak'){if(hi>.62)g=6;if(y<=3)g=8}
    else if(th==='snow'){if(hi<.36)g=6}
    else if(th==='forest'){if(hi>.68)g=7}
    else if(th==='lake'){if(lakes.some(l=>((x-l.x)/l.rx)**2+((y-l.y)/l.ry)**2<1))g=2}
    else if(th==='manor'){if(hi>.66)g=7}
    else if(th==='swamp'){if(hi>.64)g=2;else if(hi<.3)g=0}
    else if(th==='canyon'){if(hi>.6)g=6}
    else if(th==='dark'){if(hi>.63)g=6;else if(hi<.28)g=8}
    if(comp)g=4;if(onPath)g=g===2?3:1;if(arrive&&g===2)g=1;
    let o=null;const edge=x<=1||y<=1||x>=N-2||y>=N-2;
    if(x===0||y===0||x===N-1||y===N-1)o=r()<.6?tree:'rock';
    else if(edge&&g!==2)o=r()<.75?(r()<.65?tree:'rock'):null;
    else if(!comp&&!onPath&&!arrive&&g!==2&&Math.abs(x-px)>1){const v=r(),cliff=fbm(x*.3+o2,y*.3+o1);
      if(th==='peak'||th==='snow')o=cliff>.67?'rock':v<.14?'pine':v<.18?'rock':null;
      else if(th==='forest')o=v<.16?'tree':v<.25?'pine':v<.3&&hi<.45?'bamboo':null;
      else if(th==='lake')o=v<.07?'tree':v<.1?'bamboo':v<.11?'rock':null;
      else if(th==='manor')o=v<.04?'tree':v<.05?'pine':v<.055?'rock':null;
      else if(th==='swamp')o=v<.07?'tree':v<.09?'rock':null;
      else if(th==='canyon')o=cliff>.62?'rock':v<.08?'rock':v<.1?'tree':null;
      else o=cliff>.66?'rock':v<.1?'pine':v<.17?'rock':null}
    map[y][x]={g,v:r()};objs[y][x]=o;
  }}
  // 본산: 본전과 좌우 전각, 마당 등롱. 장원 지형은 산길 옆에 집이 더 있다
  const bs=[{x:19,y:5,w:3,h:2,kind:'temple'},{x:14,y:8,w:2,h:2},{x:25,y:8,w:2,h:2}];
  if(th==='manor')bs.push({x:10,y:22,w:3,h:2},{x:27,y:24,w:3,h:2});
  for(const b of bs){for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++){objs[j][i]='B';if(map[j][i].g===2)map[j][i].g=4}builds.push(b)}
  for(const[x,y]of[[16,6],[24,6],[14,14],[26,14]]){objs[y][x]='lamp';lamps.push({x:x+.5,y:y+.5,p:r()*6})}
  for(let y=16;y<N;y++){const px=hqPath(y,sd);for(const x of[px,px+1])if(map[y][x].g===3)rails.push({x,y})}
  const put=(t,x,y)=>{if(walk(x,y)&&!inHQ(x,y)&&!nodes.some(n=>n.x===x+.5&&n.y===y+.5))nodes.push({t,x:x+.5,y:y+.5,cd:0})};
  const want=(t,n,ok)=>{for(let i=0;i<400&&nodes.filter(q=>q.t===t).length<n;i++){const x=2+Math.floor(r()*(N-4)),y=2+Math.floor(r()*(N-4));if(ok(map[y][x].g))put(t,x,y)}};
  want('herb',10,g=>g===0||g===7||g===9);want('ore',8,g=>g===6||g===8||g===10||g===11);want('wood',6,g=>g===0||g===9);
  if(th==='lake'||th==='swamp')want('fish',4,g=>g===0||g===9||g===1);
}
// 바닥 그림: 지형마다 풀빛을 바꾸고, 새 바닥(늪·붉은 바위·검은 땅)을 칠한다
const HQ_GRASS={peak:[44,80,46],snow:[58,76,60],forest:[32,64,32],lake:[52,88,52],manor:[60,86,46],swamp:[50,62,36],canyon:[86,80,46],dark:[38,44,38]};
function bakeHQ(th){
  const gw=N*TW,gh=N*TH,c=document.createElement('canvas');c.width=gw;c.height=gh;
  const g=c.getContext('2d'),img=g.createImageData(gw,gh),d=img.data,gc=HQ_GRASS[th],stair=th==='peak'||th==='snow';
  for(let py=0;py<gh;py++)for(let px=0;px<gw;px++){
    const a=(px-gw/2)/(TW/2),b=py/(TH/2),gx=(a+b)/2,gy=(b-a)/2;
    if(gx<0||gy<0||gx>=N||gy>=N)continue;
    const hard=tileG(gx,gy),soft=hard===1||hard===3||hard===4;
    const jx=soft?gx:gx+(vn(gx*2.3,gy*2.3)-.5)*.6,jy=soft?gy:gy+(vn(gx*2.3+9,gy*2.3+4)-.5)*.6;
    const t=soft?hard:tileG(jx,jy),n=fbm(gx*1.3,gy*1.3),grain=.92+hash(px,py)*.16;
    let R,G,B;
    if(t===2){const w=fbm(gx*2.5,gy*4);if(th==='swamp'){R=44+w*20;G=60+w*22;B=42+w*14}else{R=60+w*30;G=98+w*30;B=118+w*28}if(vn(gx*7,gy*7)>.8){R+=70;G+=70;B+=60}}
    else if(t===3){R=136;G=96;B=60;const gr=vn(gx*40,gy*4);R*=.8+gr*.35;G*=.8+gr*.35;B*=.8+gr*.3;if(frac(gx*4)<.1){R*=.45;G*=.45;B*=.45}}
    else if(t===1){if(stair){const st=frac(gy*2),h=hash(Math.floor(gx*2),Math.floor(gy*2));R=(126+n*22)*(.88+h*.2);G=(120+n*20)*(.88+h*.2);B=(110+n*18)*(.88+h*.2);if(st<.08){R*=.6;G*=.6;B*=.6}}
      else{const k=vn(gx*6,gy*6);R=122+n*24+k*10;G=102+n*20+k*8;B=74+n*14}}
    else if(t===4){const sx=gx*2+(Math.floor(gy*2)%2)*.5,sy=gy*2,f1=frac(sx),f2=frac(sy),h=hash(Math.floor(sx)*7,Math.floor(sy)*13),tone=.84+h*.22,m=Math.min(f1,1-f1,f2,1-f2);
      R=(th==='dark'?110:168)*tone;G=(th==='dark'?100:162)*tone;B=(th==='dark'?100:152)*tone;if(m<.05){R=80;G=76;B=72}}
    else if(t===6){const k=vn(gx*3,gy*3);R=96+n*30+k*14;G=94+n*28+k*12;B=90+n*26+k*12;if(vn(gx*9,gy*9)>.72){R*=.7;G*=.7;B*=.72}}
    else if(t===7){const k=vn(gx*4,gy*4);R=106+n*26+k*10;G=88+n*20+k*8;B=64+n*14}
    else if(t===8){const k=fbm(gx*.6,gy*.6);R=212+n*26-k*18;G=220+n*24-k*14;B=232+n*18-k*6;if(vn(gx*5+3,gy*5)>.8){R-=60;G-=56;B-=46}}
    else if(t===9){const k=vn(gx*3,gy*3);R=64+n*24+k*10;G=60+n*22+k*8;B=38+n*12;if(vn(gx*8,gy*8)>.76){R*=.7;G*=.8;B*=.7}}
    else if(t===10){const k=vn(gx*2.5,gy*2.5),band=Math.sin((gx+gy)*1.6+k*3)*.5+.5;R=128+n*34+band*20;G=70+n*20+band*10;B=46+n*12}
    else if(t===11){const k=vn(gx*3,gy*3);R=40+n*18+k*10;G=36+n*16+k*8;B=38+n*16+k*8;if(vn(gx*11,gy*11)>.82){R+=60;G+=14;B+=8}}
    else{const big=vn(gx*.2,gy*.2);R=gc[0]+n*34+big*16;G=gc[1]+n*40+big*14;B=gc[2]+n*20;const dirt=fbm(gx*.5+20,gy*.5);if(dirt>.64){const k=Math.min(1,(dirt-.64)*5);R+=(100-R)*k;G+=(94-G)*k;B+=(80-B)*k}}
    const fade=Math.min(1,Math.min(gx,gy,N-gx,N-gy)/1.6);
    const i=(py*gw+px)*4;d[i]=R*grain*fade;d[i+1]=G*grain*fade;d[i+2]=B*grain*fade;d[i+3]=255;
  }
  g.putImageData(img,0,0);
  const r=rng(57+th.length),sp=(gx,gy)=>[(gx-gy)*TW/2+gw/2,(gx+gy)*TH/2];g.lineCap='round';
  const hue=th==='canyon'?60:th==='swamp'?75:th==='dark'?100:105;
  for(let k=0;k<16000;k++){const gx=1+r()*(N-2),gy=1+r()*(N-2),t=tileG(gx,gy);if(t!==0&&!(t===9&&r()<.3))continue;const[x,y]=sp(gx,gy),l=r();
    g.strokeStyle=`hsla(${hue+r()*30},${20+r()*20}%,${l<.5?14+r()*10:30+r()*14}%,.7)`;g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*3,y-2-r()*4);g.stroke()}
  for(let k=0;k<900;k++){const gx=r()*N,gy=r()*N,t=tileG(gx,gy);if(t!==6&&t!==8&&t!==10&&t!==11)continue;const[x,y]=sp(gx,gy),s=1.5+r()*3.5;
    g.fillStyle=t===10?`hsl(14,40%,${30+r()*18}%)`:t===11?`hsl(0,4%,${14+r()*14}%)`:`hsl(210,6%,${t===8?62+r()*20:36+r()*22}%)`;g.beginPath();g.ellipse(x,y,s*1.4,s*.8,0,0,7);g.fill()}
  return c;
}
// ---- 역참: 은자를 내고 말을 타 개봉과 모든 본산을 오간다 ----
function postDlg(){
  const row=(id,n,sub,fee)=>`<div class="it"><div>${n}<span>${sub}</span></div><div class="ib">${REG===id?'<small class="dim">여기</small>':B('goto:'+id,`가기 · 은자 ${fee}`,{d:P.silver<fee})}</div></div>`;
  let h=`<p class="note">"어디로 모실까? 길은 멀어도 말은 빠르오."</p><div class="list">${row('gaebong','개봉','성내 역참',10)}</div>`;
  for(const al of['jeong','sacheon','magyo'])h+=`<h4 style="margin:0">${ALLY[al].n}</h4><div class="list">`+Object.values(SECTS).filter(s=>s.al===al)
    .map(s=>row(hqId(s),hqPlace(s),`${s.n} 본산${P.sect===s.id?' · 내 문파':''}${ALLY[al].side!==P.side?' · 다른 성향':''}`,POST_FEE)).join('')+'</div>';
  return h}
function postGo(id){
  if(!REGIONS[id]||REG===id)return;const fee=id==='gaebong'?10:POST_FEE;
  if(P.silver<fee){log('은자가 모자랍니다.','info');return}
  P.silver-=fee;const at=arriveAt(id);closePanels();log(`역참 말을 타고 ${REGIONS[id].name}(으)로 갑니다. (은자 -${fee})`,'sys');travel({to:id,tx:at.x,ty:at.y});
}
// 본산 장문인: 가입·직위·임무·비급을 모두 여기서 본다
function hqDlg(n){
  const s=SECTS[n.hq],same=P.side===ALLY[s.al].side,member=P.sect===s.id;
  const hi=member?`"${rankName(s.id)}, 수고가 많구나."`:same?`"${s.n}에 뜻이 있어 찾아왔는가."`:`"${FACN[pfac()]} 사람이 여기까지 무슨 일인가. 칼을 뽑기 전에 돌아가게."`;
  return `<p class="note">${hi}</p>${sectDetail(s,true)}`}

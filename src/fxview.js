// ================= 이펙트 뷰어 (dist/fxview.html 에만 들어간다) =================
// 사용자 요청(2026-10-21): "현재 게임에 있는 이펙트 연출들을 볼 수 있는 뷰어 툴"
// 게임 코드를 그대로 싣고, 연무장에 목인장을 세워 둔 채 게임의 이펙트 함수(exec·GL·fx·brkFx 등)를 직접 부른다.
// 그래서 r_fx.js 나 데이터가 바뀌면 python3 build.py 한 번으로 뷰어도 같이 바뀐다.
// 아직 없는 함수(다른 브랜치의 경지 돌파 연출 등)는 typeof 로 보고 있을 때만 단추를 낸다.
(()=>{
const V={el:'',shake:true,zoom:innerWidth<760?1:1.5,speed:1,loop:false,last:null,timer:null,night:false,tier:0,cls:'검',art:null,col:'140,205,255',realm:0,sect:''};
const HOME={x:15.5,y:17.5},DUMMY=[[15.5,14.6],[13.4,15.6],[17.6,15.6],[12.6,17.8],[18.4,17.8],[15.5,20.2]];
const PNAME={melee:'근접',multi:'연타',arc:'부채꼴',circle:'회전',line:'직선',proj:'투사체',drop:'낙하',rain:'비',pull:'끌어당김',chain:'연쇄',blink:'순보',blinkMulti:'연속 순보',dash:'돌진'};
const TIERN=['입문','소성','대성','극성'],TIERP=[0,25,60,100];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
saveGame=()=>{};   // 뷰어는 기록하지 않는다
spawnTick=()=>{};  // 목인장 말고는 아무도 나오지 않는다

// 연무장: 돌 마당 한가운데를 비워 둔 빈 지역 (사람·출입구 없음)
stageRegion({id:'fxv_arena',name:'연무장',s:{id:'fxv',n:'연무장'},th:'manor',w:30,h:30,seed:7,yard:[7,8,24,25],zone:()=>'연무장'});
hook('regionGen',id=>{if(id!=='fxv_arena')return;for(let y=0;y<NH;y++)for(let x=0;x<N;x++)if(Math.hypot(x+.5-HOME.x,y+.5-HOME.y)<8){objs[y][x]=null;map[y][x].g=4}
  builds=builds.filter(b=>Math.hypot(b.x+b.w/2-HOME.x,b.y+b.h/2-HOME.y)>9);lamps=lamps.filter(l=>Math.hypot(l.x-HOME.x,l.y-HOME.y)>6)});
// ---- 시작: 무관 없이 정파 검객으로 태어나 연무장에 선다 ----
function boot(){
  G=G0();showCreate();CR.side='정';CR.opts=rollGG('정');CR.gg=CR.opts[0];CR.cls='검';CR.name='시연';beginLife();
  closePanels();enterRegion('fxv_arena',HOME.x,HOME.y);arena();
  P.mode='manual';P.inv=1e9;P.maxQi=Math.max(P.maxQi,9999);P.qi=P.maxQi;
  setInterval(()=>{if(!P)return;P.hp=P.maxHp;P.qi=P.maxQi;P.inv=1e9;P.mode='manual';P.target=null;P.fcd=P.fcd.map(()=>0);P.gcd=0;P.bcd=0;P.ucd=0},200);
  render();resize();
}
function arena(){
  mobs=mobs.filter(m=>m.acadDummy&&DUMMY.some(([x,y])=>m.home.x===x&&m.home.y===y));
  for(const[x,y]of DUMMY){if(mobs.some(m=>m.home.x===x&&m.home.y===y))continue;
    const e=mkMob('목인장',x,y,{hp:99999,atk:0,def:0,hm:0,sp:0,pal:'villager',o:{acadDummy:1,fixed:'dummy'}});e.hp=e.maxHp=99999;e.atk=0;mobs.push(e)}
  allies=[];place();
}
function place(){P.x=HOME.x;P.y=HOME.y;P.z=0;P.leap=null;P.perch=null;P.path=null;P.goal=null;P.medit=false;P.qiTraining=false;face(DUMMY[0][0],DUMMY[0][1]);
  P.target=null;V.tg=mobs.find(m=>m.home.x===DUMMY[0][0]&&m.home.y===DUMMY[0][1])||null;const t=iso(HOME.x,HOME.y-1.2);cam.x=t.x;cam.y=t.y}
const tgt=()=>{if(!mobs.includes(V.tg))place();return V.tg};

// ---- 흐름: 속도, 시간 멈춤(나이·달력·낮밤), 다시 보기 ----
const upd0=update;
// 카메라는 연무장 한가운데에 고정한다 (사용자 2026-10-21: 재생마다 카메라가 따라가 눈이 아프다). 흔들림도 끌 수 있다
update=dt=>{const cal=G.cal,age=P&&P.age;upd0(dt*V.speed);G.cal=cal;if(P)P.age=age;tod=V.night?.92:.42;const ct=iso(HOME.x,HOME.y-1.2);cam.x=ct.x;cam.y=ct.y;if(!V.shake)shake=0;
  if(P&&!P.leap&&Math.hypot(P.x-HOME.x,P.y-HOME.y)>4)place()};
function play(fn,label){V.last={fn,label};clearTimeout(V.timer);try{fn()}catch(e){console.error(e);note('오류: '+e.message)}
  note(label);if(V.loop)V.timer=setTimeout(()=>{if(V.last&&V.last.fn===fn)play(fn,label)},2600/V.speed)}
function note(t){const el=$('fxvnow');if(el)el.textContent=t}

// ---- 확대: 게임의 resize 뒤에 배율을 곱한다 ----
const rs0=resize;resize=()=>{rs0();const r=C.getBoundingClientRect();S*=V.zoom;W=r.width/S;H=r.height/S};addEventListener('resize',()=>resize());

// ---- 속성: 심법 속성을 골라 무공의 재질(불·물·번개…)을 바꿔 본다 ----
const artEl0=artEl;artEl=a=>V.el||artEl0(a);
const elSel=()=>typeof EL_FX==='undefined'?'':`<h3>속성 (심법)</h3><select data-a="el"><option value="">심법 그대로 (${esc(artEl0({}))})</option>${Object.entries(EL_FX).map(([k,e])=>`<option value="${esc(k)}"${k===V.el?' selected':''}>${esc(k)} · ${esc(e.n)}</option>`).join('')}</select>${V.el&&EL_FX[V.el]?`<p class="dim">${esc(EL_FX[V.el].d)}</p>`:''}`;

// ---- 무공 초식 ----
function setWeapon(cls){const w=P.eq.weapon;if(cls==='권'){P.eq.weapon=null;return}if(!w||w.cls!==cls)P.eq.weapon=mkWeapon(cls,1,0)}
function useArtFx(id,i){const a=ARTS[id];setWeapon(a.cls);P.arts=P.arts||{};if(!P.arts[id])P.arts[id]={p:TIERP[V.tier],f:a.forms.map(()=>1)};
  P.cur=id;P.arts[id].p=TIERP[V.tier];place();const e=tgt(),X=mkX(id,1);X.t=V.tier;
  if(i==='ult'){heroAtk('ult');showBanner(a.ult.n,`${a.n} 필살기`);P.flash=.5;P.flashCol=a.c;shake=.35;
    a.ult.steps.forEach(st=>exec({...st},e,X));return}
  const f=a.forms[i];heroAtk(HKIND[f.p],f);texts.push({x:P.x,y:P.y,t:f.n,c:`rgb(${a.ct||'255,240,200'})`,life:.9,call:1});exec(f,e,X)}
function playAll(id){const a=ARTS[id],steps=[...a.forms.map((_,i)=>i),'ult'];let k=0;clearTimeout(V.timer);
  const go=()=>{if(k>=steps.length)return;const i=steps[k++];useArtFx(id,i);note(`${a.n} · ${i==='ult'?a.ult.n+' (필살기)':a.forms[i].n}`);V.timer=setTimeout(go,(i==='ult'?2200:1300)/V.speed)};go()}

// ---- 기본 이펙트 (r_fx.js 의 그림 함수 하나하나) ----
const at=k=>{const e=tgt();return k==='p'?{x:P.x,y:P.y}:{x:e.x,y:e.y}};
const PRIM=[
  ['기운 반달 (arc)',()=>{face(tgt().x,tgt().y);fArc({t:V.tier,art:{elc:0}},1.4,1.8,V.col,4,.3)}],
  ['회전 베기 (spin)',()=>GL({t:'spin',x:P.x,y:P.y,r:1.8,col:V.col,w:5,life:.4},{t:V.tier,art:{}})],
  ['충격파 고리 (ring2)',()=>GL({t:'ring2',...at(),r:1.6,col:V.col,w:4,life:.45},{t:V.tier,art:{}})],
  ['번개 고리 (ring2 · 뇌)',()=>GL({t:'ring2',...at(),r:1.6,col:V.col,w:4,life:.5},{t:V.tier,art:{elc:1}})],
  ['직선 기운 (line)',()=>{const e=tgt();GL({t:'line',x:P.x,y:P.y,ex:e.x,ey:e.y-1.5,col:V.col,w:8,life:.35},{t:V.tier,art:{}})}],
  ['물결 기운 (line · wavy)',()=>{const e=tgt();GL({t:'line',x:P.x,y:P.y,ex:e.x,ey:e.y-1.5,col:V.col,w:6,life:.4,wavy:1},{t:V.tier,art:{}})}],
  ['낙뢰 기둥 (bolt)',()=>GL({t:'bolt',...at(),col:V.col,s:1.2,life:.5},{t:V.tier,art:{}})],
  ['번개 낙뢰 (bolt · 뇌)',()=>GL({t:'bolt',...at(),col:V.col,s:1.2,life:.5},{t:V.tier,art:{elc:1}})],
  ['타격 별빛 (star)',()=>GL({t:'star',...at(),col:V.col,s:1.2,life:.3},{t:V.tier,art:{}})],
  ['발톱 자국 (claw)',()=>GL({t:'claw',...at(),col:V.col,life:.35,side:1},{t:V.tier,art:{}})],
  ['불티 (parts · dot)',()=>fParts({t:V.tier},at(),V.col,14,80,'dot',.8)],
  ['꽃잎 (parts · petal)',()=>fParts({t:V.tier},at(),V.col,14,60,'petal',1)],
  ['전기 튐 (crackle)',()=>GL({t:'crackle',...at(),col:V.col,life:.5},{t:V.tier,art:{}})],
  ['소용돌이 (vortex)',()=>GL({t:'vortex',x:P.x,y:P.y,r:2.6,col:V.col,w:3,life:.7},{t:V.tier,art:{}})],
  ['연쇄 번개 (zap)',()=>{let a={x:P.x,y:P.y};mobs.slice(0,5).forEach((m,i)=>{const s=a;later(i*.08,()=>GL({t:'zap',x:s.x,y:s.y,ex:m.x,ey:m.y,col:V.col,w:3,life:.3},{t:V.tier,art:{}}));a={x:m.x,y:m.y}})}],
];
const PROJ=['crescent','blade','arrow','spear','ring','orb'],PROJN={crescent:'검기 반달',blade:'비도',arrow:'화살',spear:'창기',ring:'기환',orb:'기공탄'};
function shoot(kind,elc){place();const e=tgt();face(e.x,e.y);heroAtk('flat');
  const X={art:{c:V.col,cls:'검',pt:'spark',elc:!!elc,el:null},key:null,t:V.tier,mul:1,combo:1};
  for(const d of[-.25,0,.25]){const a=Math.atan2(P.fy,P.fx)+d;projs.push({x:P.x,y:P.y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,left:6,m:0,kb:0,stun:0,pierce:1,size:1+.15*V.tier,hit:new Set,X,c:V.col,kind,trail:[],ph:Math.random()*6})}}
const BASIC=[
  ['먼지 (dust)',()=>fx.push({t:'dust',x:P.x-.1,y:P.y-.1,life:.45})],
  ['푸른 고리 (ring)',()=>fx.push({t:'ring',...at('p'),life:.6,max:.6})],
  ['칼 휘두름 (slash)',()=>fx.push({t:'slash',...at(),life:.2,side:1})],
  ['검은 연기 (puff)',()=>fx.push({t:'puff',...at(),life:.6})],
  ['잔상 (ghost)',()=>{for(let i=0;i<4;i++)fx.push({t:'ghost',x:P.x-.4*i,y:P.y+.4*i,life:.3+i*.06,col:V.col})}],
  ['금빛 상승 고리 (lvl)',()=>fx.push({t:'lvl',x:P.x,y:P.y,z:0,life:1.6})],
  ['경고 원 (warn)',()=>fx.push({t:'warn',...at(),r:2,life:1.1,max:1.1})],
];

// ---- 경지·몸·운기·수련·이동 ----
const RFX=['','','검기 (푸른 반달)','검사 (은빛 실)','검강 (금빛 두 겹)'];
function strike(){place();const e=tgt();P.realm=V.realm;P.bcd=0;P.gcd=0;basicStrike(e)}
// 경지 돌파 연출 (r_fx.js brkFx, data/brkfx.json): 이 빌드에 있을 때만
const BRK=()=>typeof brkFx==='function'&&typeof BRK_FX!=='undefined'?BRK_FX.map((d,i)=>d&&[i,d]).filter(Boolean):[];
function brk(i){place();P.realm=i;const d=brkFx(i);if(d&&d.n)showBanner(d.n,RANKS[i]||'')}
const FLOW=()=>[
  ['기본 공격 (경지에 따라 검기·검사·검강)',strike],
  ['경지 상승 (기본 금빛 고리)',()=>{place();fx.push({t:'lvl',x:P.x,y:P.y,z:0,life:2});shake=.25}],
  ['호신강기 막기',()=>{place();GL({t:'ring2',x:P.x,y:P.y,r:.7,col:'255,224,140',w:3,life:.25});addText(P.x,P.y-.6,'호신강기','#ffe7a0')}],
  ['환골탈태',()=>{place();bodyFx('255,236,190',1);showBanner('환골탈태','뼈와 살이 새로 태어났다')}],
  ['반로환동',()=>{place();bodyFx('255,250,225');showBanner('반로환동','')}],
  ['금강불괴',()=>{place();bodyFx('255,205,90');showBanner('금강불괴','칼이 들지 않는 몸')}],
  ['주화입마',()=>{place();fx.push({t:'ring',x:P.x,y:P.y,life:.6,max:.6,col:'220,60,60'});shake=.3}],
];
function medit(on,kind){place();P.medit=false;P.qiTraining=false;if(on){if(kind==='qi')P.qiTraining=true;else P.medit=true}}
const TRAIN=[['근력 수련','str'],['민첩 수련','agi'],['지구력 수련','end'],['본원진기 수련','qi']];
function setSect(id){V.sect=id;P.sect=id||null;recalc();if(typeof garbSync==='function')try{garbSync()}catch(e){}}
function leapFx(st){place();ggInit();P.gk=P.gk||{};for(const id in GGS)P.gk[id]=1;P.gkcur=Object.keys(GGS).sort((a,b)=>GGS[b].g-GGS[a].g)[0];
  P.ggm=P.ggm||{};P.ggm[P.gkcur]=100;face(P.x+(st===1?-1:1),P.y-1);if(st>1)P.ggc={n:st-1,until:time+2};else P.ggc=null;leap()}
function bobFx(t){place();bobInit();const id=Object.keys(BOBS).filter(k=>BOBS[k].t===t).sort((a,b)=>BOBS[b].g-BOBS[a].g)[0];if(!id)return;
  P.bob[id]=1;P.bcur=id;if(t==='flank'){const g=BG.fail[BOBS[id].g];BG.fail[BOBS[id].g]=0;P.target=tgt();bobeop();BG.fail[BOBS[id].g]=g}else{face(P.x-1,P.y);bobeop()}}
function spec(k){place();if(k==='점혈'){const e=tgt();P.x=e.x;P.y=e.y+1.4;P.target=e}P.sp=P.sp||{};P.sp[k]=1;P.scd[k]=0;P.mats.비도=9;special(k)}
const MOVE=[
  ['경공 1단',()=>leapFx(1)],['경공 2단',()=>leapFx(2)],['경공 3단',()=>leapFx(3)],
  ['보법 · 직선',()=>bobFx('line')],['보법 · 간파 (등 뒤)',()=>bobFx('flank')],
  ['암기 (비도)',()=>spec('암기')],['독공',()=>spec('독공')],['점혈',()=>spec('점혈')],
  ['두목 내려찍기',()=>{const c=at();fx.push({t:'warn',x:c.x,y:c.y,r:2,life:1.1,max:1.1});later(1.1,()=>{fx.push({t:'puff',x:c.x,y:c.y,life:.6});shake=.25;fRing(null,c,2,'255,120,80',4,.35)})}],
];

// ---- 색 고르기: 문파 색(SECT_FX)과 심법 계열 색(SCHOOL_FX) ----
function colors(){const o=[['검기','140,205,255'],['검강','255,212,105']];for(const[k,v]of Object.entries(SCHOOL_FX))o.push([k+' 계열',v]);
  for(const[id,v]of Object.entries(SECT_FX))if(SECTS[id])o.push([SECTS[id].n,v[0]]);return o}

// ---- 화면 ----
const css=document.createElement('style');css.textContent=`
body.fxv #app{flex-direction:row}body.fxv .panel,body.fxv #mini,body.fxv .zone,body.fxv #qtrack,body.fxv #chan,body.fxv [id^=t_],body.fxv #tui,body.fxv #tquick,body.fxv #tslots,body.fxv #joy,body.fxv .tjoy{display:none!important}
#fxv{width:340px;flex:none;display:flex;flex-direction:column;background:#15120f;border-left:1px solid #3a3128;color:#e9dfc8;font-size:13px;min-height:0}
#fxv header{padding:10px 12px 6px;border-bottom:1px solid #2c251e}#fxv h1{font-size:17px;margin:0 0 2px;font-family:var(--display,serif);color:#f3dfa8}#fxv header p{margin:0;color:#9d907a;font-size:12px}
#fxv .ctl{display:flex;flex-wrap:wrap;gap:4px;padding:6px 12px;border-bottom:1px solid #2c251e;align-items:center}
#fxv .tabs{display:flex;gap:2px;padding:6px 8px 0;flex-wrap:wrap}#fxv .tabs button{flex:1 1 auto}
#fxv .body{flex:1;overflow:auto;padding:8px 12px 16px;min-height:0;-webkit-overflow-scrolling:touch;touch-action:pan-y}
#fxv button,#fxv select{font:inherit;color:#e9dfc8;background:#231d17;border:1px solid #4a3e31;border-radius:6px;padding:5px 8px;cursor:pointer;min-height:30px}
#fxv button:hover{border-color:#a8875a}#fxv button[aria-pressed=true]{background:#5b4326;border-color:#d8a85a;color:#fff3d6}
#fxv select{max-width:100%;width:100%}
#fxv .grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}#fxv .grid button{text-align:left}
#fxv h3{font-size:12px;color:#c9a96a;margin:12px 0 5px;font-weight:600}#fxv .dim{color:#8d806b;font-size:11.5px;margin:4px 0}
#fxv .sw{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
#fxvnow{padding:6px 12px;border-top:1px solid #2c251e;color:#f3dfa8;min-height:18px;font-size:12.5px}
#fxv .form b{display:block}#fxv .form small{color:#9d907a}
@media (max-width:760px){body.fxv #app{flex-direction:column}#fxv{width:auto;height:46%;border-left:0;border-top:1px solid #3a3128}#fxv header p{display:none}}`;
document.head.appendChild(css);document.body.classList.add('fxv');
const box=document.createElement('div');box.id='fxv';$('app').appendChild(box);
let TAB='art';
function btn(label,act,pressed,extra=''){return `<button type="button" data-a="${esc(act)}"${pressed!=null?` aria-pressed="${!!pressed}"`:''} ${extra}>${label}</button>`}
function render(){if(!P)return;
  const arts=Object.values(ARTS).filter(a=>a.cls===V.cls&&!a.base);if(!V.art||!ARTS[V.art]||ARTS[V.art].cls!==V.cls)V.art=(arts[0]||{}).id;
  const a=ARTS[V.art];let h='';
  if(TAB==='art'){
    h+=`<h3>병기</h3><div class="ctl" style="padding:0;border:0">${Object.keys(CLASS).map(c=>btn(c,'cls:'+c,V.cls===c)).join('')}</div>
      <h3>무공 (${arts.length})</h3><select data-a="art">${['정','사','마','중'].map(s=>{const l=arts.filter(x=>(x.side||'중')===s);return l.length?`<optgroup label="${s==='중'?'기타':s+'파'}">${l.map(x=>`<option value="${esc(x.id)}"${x.id===V.art?' selected':''}>${esc(x.n)}${x.sect&&SECTS[x.sect]?' · '+esc(SECTS[x.sect].n):''}${x.grade!=null&&typeof AGR!=='undefined'?' · '+esc(AGR[x.grade]||''):''}</option>`).join('')}</optgroup>`:''}).join('')}</select>`;
    if(a){h+=`<p class="dim"><span class="sw" style="background:rgb(${a.c})"></span>${esc(a.d||'')} ${a.el?'· '+esc(a.el):''}${a.elc?' · 번개':''}</p>
      ${elSel()}<h3>초식</h3><div class="grid">${a.forms.map((f,i)=>btn(`<span class="form"><b>${esc(f.n)}</b><small>${PNAME[f.p]||f.p}${f.delay?' · 지연':''}${f.then?' → '+(PNAME[f.then.p]||''):''}</small></span>`,'form:'+i)).join('')}
      ${btn(`<span class="form"><b>${esc(a.ult.n)}</b><small>필살기 · ${a.ult.steps.map(s=>PNAME[s.p]||s.p).join('+')}</small></span>`,'form:ult')}</div>
      <div style="margin-top:6px">${btn('▶ 초식 전부 차례로','all')}</div>`}
  }else if(TAB==='realm'){
    h+=`<h3>경지</h3><select data-a="realm">${RANKS.map((r,i)=>`<option value="${i}"${i===V.realm?' selected':''}>${esc(r)}${RFX[Math.min(i,4)]?' · '+RFX[Math.min(i,4)]:''}</option>`).join('')}</select>
      <p class="dim">기본 공격은 경지에 따라 이류 검기, 일류 검사, 절정부터 검강이 덧붙는다.</p>
      <div class="grid">${FLOW().map(([n],i)=>btn(n,'flow:'+i)).join('')}</div>
      <h3>경지 돌파 연출</h3>${BRK().length?`<div class="grid">${BRK().map(([i,d])=>btn(`<span class="form"><b>${esc(d.n)}</b><small>${esc(RANKS[i]||'')}</small></span>`,'brk:'+i)).join('')}</div>`:'<p class="dim">경지 돌파 연출(작업 중인 PR)이 이 빌드에 합쳐지면 여기에 나온다.</p>'}`;
  }else if(TAB==='qi'){
    h+=`<h3>문파 (운기·무공 색)</h3><select data-a="sect"><option value="">문파 없음 (계열 색)</option>${Object.entries(SECTS).filter(([id])=>SECT_FX[id]).map(([id,s])=>`<option value="${esc(id)}"${id===V.sect?' selected':''}>${esc(s.n)}</option>`).join('')}</select>
      <h3>운기</h3><div class="grid">${btn('운기조식 켜기','med:1',P.medit)}${btn('내공 수련 켜기','med:qi',P.qiTraining)}${btn('끄기','med:0')}</div>
      <h3>기본기 수련 연출</h3><div class="grid">${TRAIN.map(([n,k])=>btn(n,'train:'+k)).join('')}</div>`;
  }else if(TAB==='prim'){
    h+=`${elSel()}<h3>색</h3><select data-a="col">${colors().map(([n,c])=>`<option value="${c}"${c===V.col?' selected':''}>${esc(n)}</option>`).join('')}</select>
      <p class="dim">무공 탭의 숙련(입문~극성)이 겹 수에 반영된다: 대성은 넓은 잔광, 극성은 금빛 심이 더해진다.</p>
      <h3>기운 그림 (r_fx.js)</h3><div class="grid">${PRIM.map(([n],i)=>btn(n,'prim:'+i)).join('')}</div>
      <h3>투사체</h3><div class="grid">${PROJ.map(k=>btn(PROJN[k],'proj:'+k)).join('')}${btn('기공탄 · 번개','proj:orb:1')}</div>
      <h3>기본 효과</h3><div class="grid">${BASIC.map(([n],i)=>btn(n,'basic:'+i)).join('')}</div>`;
  }else{
    h+=`<h3>이동·특수</h3><div class="grid">${MOVE.map(([n],i)=>btn(n,'move:'+i)).join('')}</div>`;
  }
  box.innerHTML=`<header><h1>이펙트 뷰어</h1><p>강호윤회록의 연출을 게임 코드 그대로 재생한다. 단추를 누르면 재생.</p></header>
    <div class="ctl">속도 ${[.25,.5,1].map(s=>btn(s+'×','spd:'+s,V.speed===s)).join('')} ${btn('반복','loop',V.loop)} 확대 ${[1,1.5,2].map(z=>btn(z+'×','zoom:'+z,V.zoom===z)).join('')} ${btn('밤','night',V.night)} ${btn('흔들림','shake',V.shake)}
      <select data-a="tier" style="width:auto">${TIERN.map((n,i)=>`<option value="${i}"${i===V.tier?' selected':''}>숙련 ${n}</option>`).join('')}</select> ${btn('다시','again')}</div>
    <div class="tabs">${[['art','무공 초식'],['realm','경지·몸'],['qi','운기·수련'],['prim','기본 이펙트'],['move','이동·특수']].map(([k,n])=>btn(n,'tab:'+k,TAB===k)).join('')}</div>
    <div class="body">${h}</div><div id="fxvnow">${esc(V.last?V.last.label:'')}</div>`;
}
box.addEventListener('change',ev=>{const s=ev.target.closest('select');if(!s)return;const k=s.dataset.a,v=s.value;
  if(k==='art')V.art=v;else if(k==='el')V.el=v;else if(k==='realm'){V.realm=+v;P.realm=V.realm}else if(k==='tier')V.tier=+v;else if(k==='col')V.col=v;else if(k==='sect')setSect(v);render()});
box.addEventListener('click',ev=>{const b=ev.target.closest('button[data-a]');if(!b||!P)return;const[k,v,w]=b.dataset.a.split(':');
  if(k==='tab'){TAB=v;render();return}
  if(k==='spd'){V.speed=+v;render();return}
  if(k==='zoom'){V.zoom=+v;resize();render();return}
  if(k==='loop'){V.loop=!V.loop;if(!V.loop)clearTimeout(V.timer);render();return}
  if(k==='shake'){V.shake=!V.shake;render();return}
  if(k==='night'){V.night=!V.night;render();return}
  if(k==='cls'){V.cls=v;V.art=null;setWeapon(v);render();return}
  if(k==='again'){if(V.last)play(V.last.fn,V.last.label);return}
  if(k==='all'){V.last=null;playAll(V.art);return}
  if(k==='form'){const a=ARTS[V.art],i=v==='ult'?'ult':+v;play(()=>useArtFx(V.art,i),`${a.n} · ${i==='ult'?a.ult.n+' (필살기)':a.forms[i].n}`);return}
  if(k==='brk'){const d=BRK_FX[+v];play(()=>brk(+v),`경지 돌파 · ${RANKS[+v]||''} ${d.n}`);return}
  if(k==='flow'){const[n,f]=FLOW()[+v];play(f,n);return}
  if(k==='med'){medit(v!=='0',v);note(v==='0'?'운기 멈춤':v==='qi'?'내공 수련 중':'운기조식 중');render();return}
  if(k==='train'){const t=TRAIN.find(x=>x[1]===v);play(()=>{place();trainFx(v)},t[0]);return}
  if(k==='prim'){const[n,f]=PRIM[+v];play(()=>{place();f()},n);return}
  if(k==='proj'){play(()=>shoot(v,w),PROJN[v]+(w?' · 번개':''));return}
  if(k==='basic'){const[n,f]=BASIC[+v];play(()=>{place();f()},n);return}
  if(k==='move'){const[n,f]=MOVE[+v];play(f,n);return}});
addEventListener('keydown',e=>{if(e.key===' '&&V.last){e.preventDefault();e.stopPropagation();play(V.last.fn,V.last.label)}},true);
window.FXV={V,play,useArtFx,render,boot};
setTimeout(boot,50);
})();

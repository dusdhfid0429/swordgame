// hero sprite atlas (user-supplied pixel art, 검): 0-5 idle, 6-11 walk, 12-16 편평 찌르기, 17-22 수직 베기, 23-30 사선 베기, 31-40 경공 공중 회전, 41-48 경공 주행(달리기)
const HF=[[0,95,155,52.4,0],[97,97,155,52.0,0],[196,97,155,54.1,0],[295,99,155,54.7,0],[396,95,155,54.0,0],[493,99,155,55.4,0],[594,99,139,49.7,0],[695,95,140,59.8,0],[792,99,139,58.6,0],[893,95,139,60.2,0],[990,99,139,56.2,0],[1091,99,139,53.9,0],[1192,94,146,52.3,0],[1288,96,146,66.2,0],[1386,186,149,46.2,0],[1574,124,147,50.5,0],[1700,101,150,48.2,0],[1803,96,138,49.1,0],[1901,81,138,63.0,0],[1984,89,155,55.5,0],[2075,95,135,56.0,0],[2172,127,138,57.6,0],[2301,102,137,50.6,0],[2405,139,123,88.3,0],[2546,126,128,69.2,0],[2674,101,128,51.2,0],[2777,138,128,47.0,0],[2917,119,142,60.0,0],[3038,159,128,53.0,0],[3199,126,128,52.6,0],[3327,108,128,12.5,0],[3437,83,106,43.4,3.1],[3522,80,123,15.2,4.1],[3604,82,113,38.3,13.4],[3688,83,117,39.1,10.3],[3773,83,92,40.0,23.7],[3858,87,92,43.2,23.7],[3947,83,113,41.8,6.2],[4032,81,122,40.4,0.0],[4115,88,122,45.5,0.0],[4205,136,128,60.8,0.0],[4343,97,125,52.2,0],[4442,91,139,51.0,0],[4535,113,134,61.8,0],[4650,106,132,57.6,0],[4758,101,132,56.8,0],[4861,134,114,73.0,0],[4997,104,110,49.3,0],[5103,110,118,51.5,0]];

// v226 (동훈님 2026-11-02): 옛 그림 HERO·HBODY·HERO2는 assets/legacy 시트 한 장으로 옮겼다 (tools/legacysheet.py). 장 번호는 그대로, 그리는 자리는 legDraw
// same frames with scabbard (and, on the attack frames below, the blade) painted out, for weapons drawn in code



// grip lines per frame in atlas pixels: s = scabbard (hand end first), b = blade (hand, tip)
const WL={"s":{"0":[29.5,97.0,8.7,106.3],"1":[30.3,96.6,8.6,106.2],"2":[29.7,97.6,9.5,105.9],"3":[31.8,97.4,10.7,106.3],"4":[94,74,3,112],"5":[31.6,97.4,11.0,106.1],"6":[32.2,83.4,10.0,91.1],"7":[29.9,83.7,7.9,91.6],"8":[35.9,82.6,11.5,90.6],"9":[35.0,82.1,9.7,91.1],"10":[37.1,82.3,12.3,90.9],"11":[32.3,82.7,10.0,91.0],"12":[28.4,91.9,6.9,100.9],"13":[67.2,32.9,61.5,14.8],"14":[31.2,94.4,8.5,104.9],"15":[38.4,88.1,6.9,100.9],"16":[30.3,93.8,6.4,104.0],"17":[32.4,81.2,8.9,89.6],"18":[36.1,80.4,10.0,90.0],"19":[33.9,98.7,7.9,107.7],"20":[31.4,77.0,7.7,86.3],"21":[34.2,80.5,8.0,89.9],"22":[32.2,80.5,7.8,89.4],"23":[128.9,74.3,100.1,63.7],"24":[117.0,80.0,85.0,67.9],"25":[89.3,79.2,64.2,69.6],"27":[116.1,63.2,101.8,70.5],"30":[37.9,64.2,14.7,55.7],"31":[80,50,2,82],"32":[70,52,2,92],"34":[76.3,52.0,58.9,56.5],"35":[31.4,50.9,12.7,38.5],"37":[26.9,52.2,5.7,40.5],"38":[98,57,3,92],"39":[31.6,62.9,14.0,55.0],"40":[125.3,79.3,99.8,69.5],"41":[25.9,79.8,8.1,86.2],"42":[27.0,83.1,9.1,88.4],"43":[39.1,65.4,7.7,58.4],"44":[40.1,60.5,12.3,54.6],"45":[39.7,63.2,7.8,56.0],"46":[42.7,45.6,22.6,35.8],"47":[23.3,34.5,8.4,24.9],"48":[30.6,41.6,15.1,31.3]},"b":{"13":[45,24,3,9],"14":[99,52,182,49],"21":[82,73,127,32],"26":[81,41,135,40],"27":[42,18,95,3],"28":[110,48,152,18],"29":[70,82,124,48]}};
const heroCls=()=>P&&hasWeaponFor(curCls())?curCls():'권';
// 옛 시트(assets/legacy): 0..HF-1 칼 든 원본(h), HF..2HF-1 몸통(b), 그 뒤 두 번째 아틀라스 HF2(a). 장마다 빈 테두리를 깎았으므로 o(깎은 왼쪽·위)만큼 옮겨 그린다
const legOk=()=>typeof sheetOk==='function'&&sheetOk('legacy');
const legFrame=(set,fi)=>SHEETS.legacy&&SHEETS.legacy.frames[(set==='a'?2*HF.length:set==='b'?HF.length:0)+fi];
// 원래 장 기준 (0,0)~(fw,높이)을 dx,dy에 k배로 그린다. fw는 창·봉 자루를 잘라낸 폭
function legDraw(set,fi,img,flash,fw,dx,dy,k){const f=legFrame(set,fi);if(!f)return;const ox=f.o[0],oy=f.o[1],sw=Math.min(f.r[2],fw-ox);if(sw<=0)return;
  drawPart(img,flash,f.r[0],f.r[1],sw,f.r[3],dx+ox*k,dy+oy*k,sw*k,f.r[3]*k)}
const hero2Ok=()=>legOk();
const heroSprite=()=>legOk();
// every attack set ends on a frame with the blade drawn, so the sword never blinks out mid-swing
const ANIM=GD.ANIM,CLIP=ANIM.clips;
// 공격 장 표는 data/anim.json ANIM.atk (v122). 아래 이름은 예전 코드·테스트 호환용 별칭
const HSET=ANIM.atk.sword,WSET=ANIM.atk.body,W2SET=ANIM.atk.a2,BIDLE=CLIP.idleBody.f;
const HKIND={proj:'flat',line:'flat',dash:'flat',blink:'flat',blinkMulti:'flat',drop:'vert',rain:'vert',chain:'vert',pull:'vert',arc:'diag',circle:'diag',multi:'diag'};
// other weapons reuse the swordsman's body: 도·창·봉 swing/thrust frames with the weapon redrawn on the blade line,
// 권 the open-hand strikes, 각 the leaping knee; idle/run frames carry 창·봉 along the scabbard line
// 사용자 시트(r_atlas2.js)의 무기별 공격 줄: 줄 안 번호. palm은 권 줄의 장타 두 장
// 줄 안 번호 -> HF2 절대 번호
const a2i=(row,i)=>A2[row][0]+Math.min(i,A2[row][1]-1);
// f: 쓰는 초식. 권 계열인데 이름이 발차기면 각법 줄을 쓴다 (각법 무공은 권 풀에 섞여 있다)
const isKick=f=>!!f&&/각|퇴|족|발/.test(f.n||'');
function heroAtk(kind,f){if(!kind){P.hc=((P.hc|0)+1)%3;kind=['flat','vert','diag'][P.hc]}
  const w=heroCls();P.ss2=0;const row=P.atkRow=w==='권'&&(isKick(f)||(!f&&kind==='vert'))?'각':w;
  // v123: 핸드오프 시트의 공격 클립이 그 줄에 바인딩돼 있고 시트가 읽혔으면 그 장 배열을 쓴다 (P.ssh = 시트 이름)
  // v167: 이펙트·무기 그림이 든 actfx 시트가 읽혔으면 그것, 아니면 act. v214: 내공이 바닥난 기본 공격(f 없음)은 이펙트 없는 act
  P.ssh=null;const wx=ANIM.atk.wx&&ANIM.atk.wx[row],sn=(wx&&wx.sheet?[wx.sheet]:ANIM.atk.wxSheet||[]).filter(n=>f||n!=='actfx'||!noQi()).find(n=>sheetOk(n)&&wx&&wx[kind]&&sheetClip(n,wx[kind]))||'act',wc=wx&&wx[kind]&&sheetClip(sn,wx[kind]);
  if(wc&&sheetOk(sn)){P.sset=wc.f;P.ssh=sn}
  else if(w!=='검'&&hero2Ok()&&W2SET[row]){const s=W2SET[row][kind]||(kind==='palm'?W2SET.권.palm.map(i=>a2i('권',i)):null);
    if(s){P.sset=kind==='palm'&&!W2SET[row].palm?s:s.map(i=>a2i(row,i));P.ss2=1}}
  if(!P.ss2&&!P.ssh)P.sset=w==='검'?HSET[kind]:(WSET[w]||WSET.권)[kind];
  P.satk=P.satkMax=kind==='ult'?.6:Math.max(.26,.1*P.sset.length)}
// 클립 도구 (v122): 클립의 장 배열, 장 단위 시간 u로 장 고르기 (pp 왕복 / once 끝에서 멈춤 / 그 외 순환)
function clipFrames(c){if(c.clip){const s=sheetClip(c.a,c.clip);return s?s.f:[]}if(c.f)return c.f;const r=A2[c.row],o=c.skip||0,n=c.max?Math.min(c.max,r[1]-o):r[1]-o,a=[];for(let i=0;i<n;i++)a.push(r[0]+o+i);return a}
function clipAt(c,u){const f=clipFrames(c),n=f.length;if(c.pp){const k=Math.floor(u)%(2*n-2);return f[k<n?k:2*n-2-k]}if(c.once)return f[Math.min(n-1,Math.floor(u))];return f[Math.floor(u)%n]}
// 무기 variant: 상태 이름 → 클립 이름. 무기에 바인딩이 없으면 base를 쓴다 (참고 게임의 AnimationGraphVariant와 같은 발상)
// 시트 클립(a=시트 이름)은 시트가 읽힌 뒤에만 쓴다. 안 읽혔으면 <이름>Nb → base 순서로 물러난다
const clipReady=c=>!!c&&(!SHEETS[c.a]||sheetOk(c.a));
function heroClip(name,w){const v=ANIM.hero[w]||{},b=ANIM.hero.base;for(const k of[v[name],v[name+'Nb'],b[name],b[name+'Nb']]){const c=k&&CLIP[k];if(clipReady(c))return c}return null}
// 수련 종류 → 클립. train2 시트가 아직 안 읽혔으면 trainNb (v159)
function trainClip(tk){const b=ANIM.hero.base;for(const k of[(b.train||{})[tk],(b.trainNb||{})[tk]]){const c=k&&CLIP[k];if(clipReady(c))return c}return null}
const clipOut=(c,u,lk)=>[clipAt(c,u),c.a==='body',c.lk||(c.a==='body'?lk:''),c.a==='a2',SHEETS[c.a]?c.a:null];
// returns [frame, use body atlas, weapon line kind ('b' blade, 's' scabbard, 'p' polearm, '' none), use atlas 2 (HF2)]
// 상태 우선순위: 경공 > 보법 > 피동 회피 > 위빙 > 공격 > 달리기 > 대기 (상태 하나, 클립은 무기 variant가 고른다)
function heroFrame(){
  const w=heroCls(),h2=hero2Ok(),v=ANIM.hero[w]||{},lk=v.lk||ANIM.hero.base.lk||'';
  // 경공 1~3단 (두 번째 시트). 시트가 없으면 variant의 jumpNb
  if(P.sj>0){const st=P.sjSt||1,u=1-P.sj/(P.sjMax||.6),c=h2?heroClip('jump'+st,w):null;if(c)return clipOut(c,u*clipFrames(c).length,lk);
    const b=CLIP[v.jumpNb||ANIM.hero.base.jumpNb];return clipOut(b,u*clipFrames(b).length,lk)}
  // v159 수련 동작 (사용자 시트 assets/train2): 내공 수련은 두 손 사이로 기운 모으기, 기본기는 근력 바위·민첩 장대·지구력 마보·본원진기 무릎에 손. span 클립은 진행도에 맞춰 한 번 훑는다
  if(P.satk<=0&&P.runT<=0&&typeof trnBusy!=='undefined'){const ng=typeof ngProg==='function'?ngProg():-1,b=trnBusy,tk=ng>=0?'neigong':b&&!/^(pg|mk)/.test(b.k)?b.k:null;
    if(tk){const c=trainClip(tk);if(c)return clipOut(c,c.span?Math.min(.999,ng>=0?ng:b.t/b.dur)*clipFrames(c).length:time*(c.fps||6),lk)}}
  // 운기조식·폐관·창안: 가부좌 (v159 train2 시트, 없으면 v123 핸드오프 시트)
  if((P.medit||P.qiTraining)&&P.satk<=0&&P.runT<=0){const c=heroClip('medit',w);if(c&&c.a!=='hero'&&c.a!=='body')return clipOut(c,time*(c.fps||6),lk)}
  // 폐관 폭포 자세, 창안 장대 위 (P.qiTraining이 아닐 때)
  if(typeof trnBusy!=='undefined'&&trnBusy&&P.satk<=0&&P.runT<=0){const tk=trnBusy.k.startsWith('pg')?'pg':trnBusy.k.startsWith('mk')?'mk':trnBusy.k,c=trainClip(tk);if(c)return clipOut(c,time*(c.fps||6),lk)}
  // 보법: g_bob이 만든 장 배열(seq). 미끄러지는 동안은 무조건, 수습 중에는 공격이 없을 때
  if(P.bA&&h2){const u=(time-P.bA.t0)/P.bA.dur;if(u<0||u>=1||(u*P.bA.dur>P.bA.move&&P.satk>0))P.bA=null;else{const s=P.bA.seq;return[s[Math.min(s.length-1,Math.floor(u*s.length))],false,'',true]}}
  // 피동 회피 (측면 회피 줄) 0.45초
  if(P.dA&&h2&&time>=P.dA&&P.satk<=0){const c=heroClip('dodge',w)||CLIP.dodge;if(time-P.dA<c.dur)return clipOut(c,(time-P.dA)/c.dur*clipFrames(c).length,lk)}
  // 맨손으로 상대를 마주 보고 서 있으면 위빙
  if(w==='권'&&h2&&P.satk<=0&&P.runT<=0&&P.target&&P.target.hp>0&&dist(P.target,P)<4){const c=CLIP.weave;return clipOut(c,time*c.fps,lk)}
  // 공격: heroAtk가 고른 장 배열(P.sset), 장 배분은 atkIdx
  if(P.satk>0){const s=P.sset,i=s[atkIdx(1-P.satk/P.satkMax,s.length)];if(P.ssh&&sheetOk(P.ssh))return[i,false,'',false,P.ssh];if(P.ss2&&h2)return[i,false,'',true];if(w==='검')return[i,false,''];
    return[i,true,WL.b[i]?(w==='권'||w==='각'?'':'b'):lk]}
  // 달리기: 몸통 아틀라스 41~48 + 코드 무기 (사용자 결정 2026-10-12, 새 도트 안 씀)
  if(P.runT>0){const c=heroClip('run',w)||CLIP.run;return clipOut(c,P.runPh*moveSpd()*3.6,lk)}
  // 대기: 두 번째 시트의 무기별 대기 줄 (창·봉은 자루 잘라내고 코드 자루, v119), 없으면 idleNb/base
  const c=h2&&v.idle?CLIP[v.idle]:CLIP[v.idleNb||ANIM.hero.base.idle];return clipOut(c,time*(c.fps||5),lk)}
// v124: 시트 장의 소켓(hand/hand2/aim)으로 무기 선 [손x,손y,방향x,방향y]. 양손 자루는 두 손 가운데를 잡고 뒷손→앞손 방향, 한손 무기는 hand→aim
function sheetWeaponLine(sh,fi,kind){const f=SHEETS[sh].frames[fi],sk=f&&f.sk;if(!sk||!sk.hand)return null;const h=sk.hand,pole=kind==='창'||kind==='봉';
  if(pole&&sk.hand2){const b=sk.hand2,m=[(h[0]+b[0])/2,(h[1]+b[1])/2];return[m[0],m[1],m[0]+(h[0]-b[0]),m[1]+(h[1]-b[1])]}
  const a=sk.aim||(sk.hand2?[h[0]+(h[0]-sk.hand2[0]),h[1]+(h[1]-sk.hand2[1])]:[h[0]+30,h[1]]);return[h[0],h[1],a[0],a[1]]}
// 창·봉 비스듬 양손 자세 (v119). f: 자루가 그려진 대기 장(아틀라스2), cut[frame]=[그릴 폭, 앞손 x, 앞손 y] — 폭 밖의 세로 자루·창날은 잘라낸다
const POLEI={'창':{cut:{69:[57,52,47],70:[66,61,47],71:[70,66,46],72:[65,61,47],73:[65,61,48]}},
  '봉':{cut:{60:[55,50,46],61:[64,59,46],62:[62,57,46]}}};
const POLE_U=[Math.cos(.96),-Math.sin(.96)];  // 자루 방향: 앞·위 55도 (창끝이 앞 위, 물미가 뒤 아래)
// h: 스프라이트의 손 위치(아틀라스 px). other=-1이면 뒷손을 자루 아래쪽에, +1이면 앞손을 자루 위쪽에 코드로 더 그린다
function drawPole(kind,h,other,flash){
  const u=POLE_U;drawWeapon(kind,[h[0],h[1],h[0]+u[0]*10,h[1]+u[1]*10],'p',flash)}   // v120: 덧그리던 둘째 손·소매는 뺐다 (사용자: 자루에 손이 달려 보임)
// 공격 장 배분 (v120, 키우기류 문법): 첫 장(예비) 30%, 가운데 장들 25%, 끝에서 둘째 장(멈춤) 30%, 마지막 장(복귀) 15%
function atkIdx(u,n){const W=ANIM.atkWeight;if(n<=2)return Math.min(n-1,Math.floor(u*n));if(u<W[0])return 0;if(u<W[0]+W[1])return 1+Math.min(n-3,Math.floor((u-W[0])/W[1]*(n-3)));if(u<1-W[3])return n-2;return n-1}
// weapons painted in atlas pixels on top of the body frame, flat colours with a dark outline like the sprite
function pxLine(a,b,w,col){ctx.lineCap='butt';ctx.strokeStyle='#14100c';ctx.lineWidth=w+2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
function drawWeapon(kind,ln,lk,flash){
  if(!ln)return;if(typeof sheetWeaponDraw==='function'&&sheetWeaponDraw(kind,ln,lk,flash))return;   // v125: 무기 파츠 시트가 있으면 그 그림을 손에 붙인다let h=[ln[0],ln[1]],t=[ln[2],ln[3]];const dx=t[0]-h[0],dy=t[1]-h[1],L=Math.hypot(dx,dy)||1,u=[dx/L,dy/L],n=[-u[1],u[0]];
  if(lk==='s'){u[0]=-u[0];u[1]=-u[1]}  // scabbard line runs hand -> back; weapons point forward from the hand
  const at=d=>[h[0]+u[0]*d,h[1]+u[1]*d],W=c=>flash?'#ffffff':c;
  if(kind==='창'){const back=lk==='s'?-95:lk==='p'?-64:-55,fwd=lk==='s'?40:lk==='p'?50:88,tip=at(fwd);pxLine(at(back),tip,4,W('#7b4a26'));
    ctx.fillStyle=W('#b3261e');ctx.beginPath();ctx.moveTo(...at(fwd-2));ctx.lineTo(tip[0]-u[0]*12+n[0]*5,tip[1]-u[1]*12+n[1]*5);ctx.lineTo(tip[0]-u[0]*12-n[0]*5,tip[1]-u[1]*12-n[1]*5);ctx.fill();
    const hd=at(fwd+22);ctx.fillStyle='#14100c';ctx.beginPath();ctx.moveTo(hd[0]+u[0]*2,hd[1]+u[1]*2);ctx.lineTo(tip[0]+n[0]*6,tip[1]+n[1]*6);ctx.lineTo(tip[0]-n[0]*6,tip[1]-n[1]*6);ctx.fill();
    ctx.fillStyle=W('#dfe6ea');ctx.beginPath();ctx.moveTo(...hd);ctx.lineTo(tip[0]+n[0]*4,tip[1]+n[1]*4);ctx.lineTo(tip[0]-n[0]*4,tip[1]-n[1]*4);ctx.fill();
    ctx.fillStyle=W('#8d98a3');ctx.beginPath();ctx.moveTo(...hd);ctx.lineTo(tip[0]-n[0]*4,tip[1]-n[1]*4);ctx.lineTo(...tip);ctx.fill()}
  else if(kind==='봉'){const ds=lk==='s'?[-80,50]:lk==='p'?[-56,58]:[-62,66],a=at(ds[0]),b=at(ds[1]);pxLine(a,b,5,W('#6b4423'));
    for(const d of ds){const c=at(d),e=at(d+(d<0?8:-8));pxLine(c,e,5,W('#c9a14a'))}}
  else if(kind==='궁'){const a=at(lk==='s'?-70:-60),b=at(lk==='s'?40:50),m=at(lk==='s'?-15:-5),bow=[m[0]-n[0]*14,m[1]-n[1]*14];
    ctx.strokeStyle='#14100c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo(bow[0],bow[1],...b);ctx.stroke();ctx.strokeStyle=W('#7b4a26');ctx.lineWidth=3;ctx.stroke();
    pxLine(a,b,1,W('#e8e2d0'))}
  else if(kind==='검'){const g=at(2),tip=at(74);pxLine(at(-8),g,3,W('#2a1a10'));pxLine([g[0]+n[0]*5,g[1]+n[1]*5],[g[0]-n[0]*5,g[1]-n[1]*5],3,W('#c9a14a'));pxLine(at(4),tip,3,W('#e4e9ec'));
    ctx.strokeStyle=W('#9aa5ae');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...at(6));ctx.lineTo(...at(70));ctx.stroke()}   // v124: 시트 장에 코드로 그리는 검 (원본 시트는 검이 그림에 있다)
  else if(kind==='도'){const g=at(3),tip=at(76),sp=k=>{const p=at(8+k*68);return[p[0]-n[0]*(1+k*1.5),p[1]-n[1]*(1+k*1.5)]},ed=k=>{const p=at(8+k*68),wd=4+k*6-(k>.85?(k-.85)*50:0);return[p[0]+n[0]*wd,p[1]+n[1]*wd]};
    ctx.fillStyle='#14100c';ctx.beginPath();for(let k=0;k<=1.001;k+=.1){const p=sp(k);ctx.lineTo(p[0]-n[0],p[1]-n[1])}ctx.lineTo(tip[0]+u[0]*2,tip[1]+u[1]*2);for(let k=1;k>=-.001;k-=.1){const p=ed(k);ctx.lineTo(p[0]+n[0],p[1]+n[1])}ctx.fill();
    ctx.fillStyle=W('#e4e9ec');ctx.beginPath();for(let k=0;k<=1.001;k+=.1)ctx.lineTo(...sp(k));ctx.lineTo(...tip);for(let k=1;k>=-.001;k-=.1)ctx.lineTo(...ed(k));ctx.fill();
    ctx.fillStyle=W('#9aa5ae');ctx.beginPath();for(let k=0;k<=1.001;k+=.1)ctx.lineTo(...sp(k));ctx.lineTo(...tip);for(let k=1;k>=-.001;k-=.1){const a=sp(k),b=ed(k);ctx.lineTo((a[0]+b[0])/2,(a[1]+b[1])/2)}ctx.fill();
    pxLine(at(-9),at(1),3,W('#2a1a10'));pxLine([g[0]+n[0]*6,g[1]+n[1]*6],[g[0]-n[0]*6,g[1]-n[1]*6],2,W('#c9a14a'))}
}

// ================= 시트 로더 (v123, 핸드오프 포맷) =================
// assets/<이름>/<이름>.png + .atlas.json + .clips.json 을 build.py가 <script id="sheets">로 묶어 넣는다.
// 장(frame): r=[x,y,w,h] 아틀라스 안 자리, o=[x,y] 트림 조각을 캔버스에 놓는 좌상단, s=[w,h] 캔버스 크기, pv=[0.5,1] 기준점(발), sk={이름:[x,y]} 소켓(캔버스 좌표)
// 클립: f=장 번호 배열, fps, loop. 같은 캔버스·같은 기준점이라 장마다 자리 보정이 필요 없다 (참고 게임의 SpriteFrame + AnimationClip 구조)
const SHEETS={};
{const el=document.getElementById('sheets'),J=el?JSON.parse(el.textContent):{};
  for(const n in J){const s=J[n],img=new Image();SHEETS[n]={img,frames:s.frames,clips:s.clips,white:null};
    img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);SHEETS[n].white=c};
    img.src=s.img}}
const sheetOk=n=>{const s=SHEETS[n];return!!s&&s.img.complete&&s.img.naturalWidth>0};
const sheetClip=(n,c)=>{const s=SHEETS[n];return s&&s.clips[c]||null};
// 시트의 서 있는 키를 원본 주인공(155px × .47)과 맞춘 배율
const SHEET_K={wuxia:.47*155/157};   // 서 있는 장(punches 첫 장 등)이 158px 안팎
const sheetK=n=>SHEET_K[n]||.5;
// 장의 캔버스 좌표 → 발(0,0) 기준 화면 좌표(배율 k). 발바닥은 원본과 같이 +3
const sheetXY=(n,i,x,y,k)=>{const f=SHEETS[n].frames[i];return[(x-f.s[0]*f.pv[0])*k,(y-f.s[1]*f.pv[1])*k+3]};
const sheetTop=(n,i,k)=>sheetXY(n,i,0,SHEETS[n].frames[i].o[1],k)[1];
const sheetSocket=(n,i,name,k)=>{const f=SHEETS[n].frames[i],p=f&&f.sk[name];return p?sheetXY(n,i,p[0],p[1],k):null};
// 장을 그린다. 발을 (0,0)에 두고 k배. 좌우 뒤집기는 부르는 쪽의 ctx.scale(side,1). img를 주면(문파 옷 색) 그 그림으로
function drawSheet(n,i,k,flash,img){const s=SHEETS[n],f=s&&s.frames[i];if(!f)return;const src=flash&&s.white?s.white:(img||s.img),[x,y]=sheetXY(n,i,f.o[0],f.o[1],k);
  ctx.drawImage(src,f.r[0],f.r[1],f.r[2],f.r[3],x,y,f.r[2]*k,f.r[3]*k)}

// ---- 무기 파츠 시트 (v125, 사용자 시트 2026-10-16: 초록 마커=손 자리) ----
// 클립 이름=무기 종류, 장=방향이 다른 같은 무기 그림. 소켓 grip(손)·tip(끝)·butt(반대 끝). 필요한 각도에 가장 가까운 장을 골라 나머지만 돌린다
// 길이는 코드 무기와 같게(아틀라스 px, 155px 주인공 기준) 맞춰 그린다
const WPN_LEN={'검':84,'도':86,'창':130,'봉':132,'궁':110,'검집':72,'도집':74};
function wpnFrames(kind){const s=SHEETS.wpn,c=s&&s.clips[kind];if(!c)return null;if(!c._fr){c._fr=c.f.map(i=>{const f=s.frames[i],g=f.sk.grip,t=f.sk.tip,b=f.sk.butt;return{f,i,ang:Math.atan2(t[1]-g[1],t[0]-g[0]),len:Math.hypot(t[0]-b[0],t[1]-b[1])}})}return c._fr}
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
// ln=[손x,손y,방향x,방향y] (아틀라스 px), lk 's'면 선이 손→등이라 뒤집는다. 그렸으면 true
function sheetWeaponDraw(kind,ln,lk,flash){if(!ln||!sheetOk('wpn'))return false;const fr=wpnFrames(kind);if(!fr)return false;
  let u=[ln[2]-ln[0],ln[3]-ln[1]];const L=Math.hypot(u[0],u[1])||1;u=[u[0]/L,u[1]/L];if(lk==='s')u=[-u[0],-u[1]];
  const ang=Math.atan2(u[1],u[0]);let best=fr[0],bd=9;for(const x of fr){const d=Math.abs(angDiff(ang,x.ang));if(d<bd){bd=d;best=x}}
  const s=SHEETS.wpn,f=best.f,sc=(WPN_LEN[kind]||100)/best.len,img=flash&&s.white?s.white:s.img;
  ctx.save();ctx.translate(ln[0],ln[1]);ctx.rotate(angDiff(ang,best.ang));ctx.scale(sc,sc);ctx.drawImage(img,f.r[0],f.r[1],f.r[2],f.r[3],-f.sk.grip[0],-f.sk.grip[1],f.r[2],f.r[3]);ctx.restore();return true}
// 허리춤 칼집 (v125, 사용자: 검집·도집은 허리춤에 비스듬히): 입(grip)을 허리 뒤쪽에 두고 아래·뒤로 60도. 몸보다 먼저 그려 몸 뒤에 걸린다
// 원본 검객 시트(검 대기·경공 장)는 그림에 칼집이 있어 부르지 않는다
const SHEATH_DIR=[-.5,.87];
function drawSheath(kind,wx,wy,flash){const c=kind==='검'?'검집':kind==='도'?'도집':null;if(!c||!sheetOk('wpn')||!SHEETS.wpn.clips[c])return false;return sheetWeaponDraw(c,[wx,wy,wx+SHEATH_DIR[0]*30,wy+SHEATH_DIR[1]*30],'b',flash)}

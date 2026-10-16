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

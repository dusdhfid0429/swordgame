// ================= 무공 이펙트 색·연출 = 심법 (v215) =================
// 사용자 요청(2026-10-31): "무공에 속성 제거하고 심법에 속성으로 무공 이펙트 색상이랑 연출 나오게 해줘" / "적 무공 이펙트는 오로지 심법에 영향을 받아"
// v169 의 무공 특성(이름에서 찾던 바람·꽃·불꽃… 23가지)과 그 물들임을 없앴다. 무공은 속성도 특성도 없다
// (arts.json·sects.json 의 el 은 초식 수를 정할 때만 쓰는 생성 번호로 남는다: 이미 익힌 초식이 바뀌지 않게. 화면·전투·이펙트에는 쓰지 않는다).
// - 주색(a.c)   = 펼치는 사람 심법의 색 (fxCol: 문파 심법이면 문파 색 SECT_FX[0], 아니면 계열 색 SCHOOL_FX)
// - 보조색(a.c2) = 그 심법의 보조색 (SECT_FX[1], 문파 없는 심법은 계열 짝 schoolPair)
// - 재질 연출(불·물·번개·서리·검은 연기…) = 그 심법의 속성 (artEl → r_elfx.js)
// - 적: foeSim(e) 이 적의 심법(문파 무인 = 문파 심법, 그 밖의 사람 = 정·사 기초 심법, 속성이 정해진 적은 그 속성, 짐승 = 없음)을 정하고,
//   foeX(e) 가 그 색·속성으로 내려찍기·연사 이펙트를 낸다 (g_life.js). 초식 외침 글자색도 그 심법 색.
// 테스트: tests/t102_fxcol.js
const FX_MIX=GD.FX_MIX;
// ---- OKLCH 섞기: RGB 평균은 회색으로 탁해지므로 밝기·채도·색상각을 따로 섞는다 ----
const s2l=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)},l2s=v=>{v=v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;return Math.max(0,Math.min(255,Math.round(v*255)))};
function toLch(c){const[r,g,b]=String(c).split(',').map(Number).map(s2l);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const L=.2104542553*l+.793617785*m-.0040720468*s,A=1.9779984951*l-2.428592205*m+.4505937099*s,B=.0259040371*l+.7827717662*m-.808675766*s;
  return[L,Math.hypot(A,B),Math.atan2(B,A)]}
function fromLch([L,C,H]){const A=C*Math.cos(H),B=C*Math.sin(H),l=(L+.3963377774*A+.2158037573*B)**3,m=(L-.1055613458*A-.0638541728*B)**3,s=(L-.0894841775*A-1.291485548*B)**3;
  return[l2s(4.0767416621*l-3.3077115913*m+.2309699292*s),l2s(-1.2684380046*l+2.6097574011*m-.3413193965*s),l2s(-.0041960863*l-.7034186147*m+1.707614701*s)].join(',')}
const MIXC=new Map();
function mixCol(a,b,t,lab){if(t<=0||!b)return a;if(t>=1||!a)return b;const key=a+'|'+b+'|'+t+(lab?'L':'');let r=MIXC.get(key);if(r)return r;
  const p=toLch(a),q=toLch(b);let h;if(p[1]<.03)h=q[2];else if(q[1]<.03)h=p[2];else{let d=q[2]-p[2];if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;
    // lab: 색상각이 120° 넘게 벌어지면(보라↔초록 등) 색상각을 돌릴 때 엉뚱한 셋째 색(주황)이 나온다 → Lab 에서 곧게 섞는다 (마기 테두리)
    if(lab&&Math.abs(d)>2.1){const A=[p[1]*Math.cos(p[2]),p[1]*Math.sin(p[2])],B=[q[1]*Math.cos(q[2]),q[1]*Math.sin(q[2])],x=A[0]+(B[0]-A[0])*t,y=A[1]+(B[1]-A[1])*t;
      r=fromLch([p[0]+(q[0]-p[0])*t,Math.hypot(x,y),Math.atan2(y,x)]);MIXC.set(key,r);return r}
    h=p[2]+d*t}
  r=fromLch([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,h]);MIXC.set(key,r);return r}
// 문파 없는 심법의 색 짝 [주, 보조]: 계열(마공·사파·정파)로
const schoolPair=(sc,side)=>sc==='마공'?['28,6,40','110,20,150']:sc==='사공'||sc==='사불'||side==='사'?['220,40,50','170,70,230']:['255,214,110','120,190,255'];
// 이 무공을 펼치는 사람이 다른 문파 무인인가 (내가 모르는 남의 문파 무공 = 그 문파 심법을 따른다)
const artForeign=a=>!!(a&&a.sect&&SECTS[a.sect]&&(!P||(P.sect!==a.sect&&!(P.arts&&P.arts[a.id]))));
// 보조색: 펼치는 사람 심법의 보조색
function simC2(a){if(artForeign(a))return SECT_FX[a.sect]?SECT_FX[a.sect][1]:schoolPair(simSchoolOf(a.sect))[1];return pFxPair()[1]}
// 심지 색: 밝은 이펙트는 흰 심지를 심법 보조색 쪽으로, 마기는 보랏빛 테두리에 보조색을
const hiOf=(c,c2)=>isDark(c)?(c2?mixCol(HI_DARK,c2,FX_MIX.darkRim,1):HI_DARK):(c2?mixCol('255,255,255',c2,FX_MIX.hi):'255,255,255');
// ---- 적의 심법 ----
function foeSim(e){if(!e||e===P||!e.d||e.d.beast||e.d.villager||e.d.passive)return null;
  const a=ARTS[e.art],sid=(e.remn&&SECTS[e.remn]?e.remn:null)||(a&&a.sect&&SECTS[a.sect]?a.sect:null);
  if(sid){const l=simOf(sid),s=l[l.length-1];return{sect:sid,sc:simSchoolOf(sid),el:e.el||(s&&s.el)||'금',n:s&&s.n}}
  const m=GD.MOB_ART[e.kind],side=m?m[0]:(e.side||(a&&a.side)||'사'),el=e.el||SIM_BASE_EL[side]||'금';
  return{sect:null,side,sc:el==='마'?'마공':side==='정'?'정종':'사공',el}}
const foePair=s=>s.sect&&SECT_FX[s.sect]?SECT_FX[s.sect]:[SCHOOL_FX[s.sc]||SCHOOL_FX['정종'],schoolPair(s.sc,s.side)[1]];
// 적이 펼치는 이펙트의 X: 색·보조색·속성이 모두 그 적의 심법 것. 정예·두목은 잔광이 붙는다
function foeX(e){const s=foeSim(e);if(!s)return null;const[c,c2]=foePair(s),a=ARTS[e.art];
  return{art:{c,c2,ct:textCol(c),cls:e.wcls||(a&&a.cls)||'검',pt:EL[s.el]?EL[s.el].pt:'spark',elc:s.el==='뇌'},el:s.el,key:null,t:e.d.boss?2:e.d.elite||e.duel?1:0,mul:1,combo:1,foe:e}}

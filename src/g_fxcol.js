// ================= 무공 특성 색 (v169) =================
// 사용자 요청(2026-10-21): "무공이나 심법이 가지는 특성 별로 색상을 부여하고, 특성의 조합에 따라 이펙트의 색상을 가지게" → 주색은 심법, 보조색은 무공 (결정 카드 A안)
// - 무공 특성(심상): data/fxcolor.json FX_TR. 무공 이름에서 kw 를 찾아 앞에 나온 것부터 FX_MIX.max 개. 없으면 병기 기본(FX_TR_CLS), ART_TR 이 이긴다.
//   창안 무공은 재료 무공들의 특성을 세어 많은 순서로 물려받아 def.tr 에 적는다(g_create.js).
// - 무공 색 trCol(a) = 특성 색을 FX_MIX.w 비중으로 OKLCH 에서 섞은 것 = 보조색(a.c2).
// - 주색(a.c) = 지금까지의 심법·문파 색(fxCol)에 무공 색을 FX_MIX.tint 만큼 OKLCH 로 물들인 것. 마기(어두운 색)는 물들이지 않고 검은색이 이긴다.
// - 그릴 때: 밝은 심지(HI)가 보조색 쪽으로 물들고(FX_MIX.hi), 숙련 2단계 잔광과 투사체 꼬리·흩어지는 입자 절반이 보조색이다.
//   마기는 보랏빛 테두리에 무공 색이 섞이고(darkRim), 2단계 잔광만 검은 기운 둘레에 옅게 보조색으로 번진다.
// - 색만 바뀌고 수치는 그대로다. 테스트: tests/t102_fxcol.js
const FX_TR=GD.FX_TR,FX_TR_CLS=GD.FX_TR_CLS,ART_TR=GD.ART_TR,FX_MIX=GD.FX_MIX;
// 이름에서 특성 찾기: 같은 특성의 더 긴 kw 안에 든 짧은 kw 는 버린다(예: 혈월 안의 월)
function trOfName(n,cls){if(ART_TR[n])return ART_TR[n].slice();const hits=[];
  for(const[k,t]of Object.entries(FX_TR))for(const w of t.kw){let i=n.indexOf(w);while(i>=0){hits.push({k,i,l:w.length});i=n.indexOf(w,i+1)}}
  const keep=hits.filter(h=>!hits.some(o=>o!==h&&o.k===h.k&&o.l>h.l&&o.i<=h.i&&o.i+o.l>=h.i+h.l)).sort((a,b)=>a.i-b.i||b.l-a.l);
  const out=[];for(const h of keep)if(!out.includes(h.k))out.push(h.k);
  return out.length?out.slice(0,FX_MIX.max):[FX_TR_CLS[cls]||'광']}
// 재료 무공들의 특성을 세어 많은 순서로 (같으면 먼저 나온 것)
function trOfSrc(ids){const cnt={},first={};let n=0;for(const id of ids){const a=ARTS[id];if(!a)continue;for(const k of artTr(a)){cnt[k]=(cnt[k]||0)+1;if(!(k in first))first[k]=n++}}
  return Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x]||first[x]-first[y]).slice(0,FX_MIX.max)}
const TRC=new WeakMap();   // 이름에서 찾은 특성 (창안 무공은 a.tr0 = def.tr)
function artTr(a){if(a.tr0)return a.tr0;let r=TRC.get(a);if(!r)TRC.set(a,r=trOfName(a.n||'',a.cls));return r}
const trName=k=>FX_TR[k]?FX_TR[k].n:k;
// ---- OKLCH 섞기: RGB 평균은 회색으로 탁해지므로 밝기·채도·색상각을 따로 섞는다 ----
const s2l=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)},l2s=v=>{v=v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;return Math.max(0,Math.min(255,Math.round(v*255)))};
function toLch(c){const[r,g,b]=String(c).split(',').map(Number).map(s2l);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const L=.2104542553*l+.793617785*m-.0040720468*s,A=1.9779984951*l-2.428592205*m+.4505937099*s,B=.0259040371*l+.7827717662*m-.808675766*s;
  return[L,Math.hypot(A,B),Math.atan2(B,A)]}
function fromLch([L,C,H]){const A=C*Math.cos(H),B=C*Math.sin(H),l=(L+.3963377774*A+.2158037573*B)**3,m=(L-.1055613458*A-.0638541728*B)**3,s=(L-.0894841775*A-1.291485548*B)**3;
  return[l2s(4.0767416621*l-3.3077115913*m+.2309699292*s),l2s(-1.2684380046*l+2.6097574011*m-.3413193965*s),l2s(-.0041960863*l-.7034186147*m+1.707614701*s)].join(',')}
const MIXC=new Map();
function mixCol(a,b,t){if(t<=0||!b)return a;if(t>=1||!a)return b;const key=a+'|'+b+'|'+t;let r=MIXC.get(key);if(r)return r;
  const p=toLch(a),q=toLch(b);let h;if(p[1]<.03)h=q[2];else if(q[1]<.03)h=p[2];else{let d=q[2]-p[2];if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;h=p[2]+d*t}
  r=fromLch([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,h]);MIXC.set(key,r);return r}
// 무공 색(보조색): 특성 색을 비중대로 섞는다
function trCol(a){const tr=artTr(a);let c=FX_TR[tr[0]]?FX_TR[tr[0]].c:'235,240,250';
  for(let i=1;i<tr.length;i++)if(FX_TR[tr[i]]){const w=FX_MIX.w,acc=w.slice(0,i).reduce((s,x)=>s+x,0);c=mixCol(c,FX_TR[tr[i]].c,w[i]/(acc+w[i]))}
  return c}
// 주색: 심법·문파 색(fxCol) + 무공 색 물들임. 마기는 그대로
function artMain(a){const base=fxCol(a);return isDark(base)?base:mixCol(base,trCol(a),FX_MIX.tint)}
// 심지 색: 밝은 이펙트는 흰 심지를 보조색 쪽으로, 마기는 보랏빛 테두리에 보조색을
const hiOf=(c,c2)=>isDark(c)?(c2?mixCol(HI_DARK,c2,FX_MIX.darkRim):HI_DARK):(c2?mixCol('255,255,255',c2,FX_MIX.hi):'255,255,255');
const trHtml=a=>artTr(a).map(k=>`<b style="color:rgb(${textCol(FX_TR[k]?FX_TR[k].c:'235,240,250')})">${trName(k)}</b>`).join('·');

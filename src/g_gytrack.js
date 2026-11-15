// ================= 기연 소문 길잡이 (v267, 동훈님 2026-11-15) =================
// "기연의 경우도 파악된 정보 기준으로는 천하지도나 맵에서 추적을 할 경우 화살표 등의 표시를 해 줄 순 없어?"
// 알아낸 만큼만 가리킨다. 모르는 단계의 자리는 드러내지 않는다:
// - 성만 앎(pv)            → 천하 지도에 그 성 표시·가는 길. 다른 성에 있으면 맵마다 그 성 쪽 출입구/가장자리. 그 성 안에 들어오면 화살표 없음(사람들에게 묻기)
// - 아는 사람(증인)을 들음   → 그 증인이 있는 맵까지 길, 그 맵에선 증인에게
// - 맵 이름을 앎(map)       → 그 맵까지 길. 방위(dir)도 알면 그 맵에서 그 방위 쪽(정확한 흔적 자리 아님)
// - 입구를 찾음(found)      → 입구까지
// 추적할 소문은 임무창 '기연 소문' 칸의 '길잡이' 단추로 고른다(P.gyTrk). 고르지 않으면 지금 자리에서 가장 가까운 소문.
// 표시는 무관 길잡이 그림(acadMarkDraw)을 하늘빛으로 쓴다(금빛 = 무관·대연무장 볼일과 구분). 미니맵에도 점.
// 테스트: tests/t181_gytrack.js
const GYT_RGB='140,214,255',GYT_HEX='#8cd6ff';
// 소문 하나가 지금 가리키는 곳: {reg} 맵 또는 {pv} 성, 그 맵 안에서 가리킬 자리 pt
function gytTarget(c){if(!c||c.done||!REGIONS[c.host])return null;gyclEnsure(c);const R=REGIONS[c.host];
  if(c.found){return{reg:c.host,pt:c.x!=null?{x:c.x+.5,y:c.y+.5,l:c.name}:null,why:'입구'}}
  const wi=gyclNextWit(c),w=wi>=0?c.wit[wi]:null;
  if(w&&w.kn&&REGIONS[w.r])return{reg:w.r,pt:w.x!=null?{x:w.x,y:w.y,l:w.n,npc:1}:null,why:'아는 사람'};
  if(c.k.map){let pt=null;if(c.k.dir&&c.ax!=null){const S=R.size||40,H=R.h||S,dx=c.ax-S/2,dy=c.ay-H/2,d=Math.hypot(dx,dy),r=Math.min(S,H)*.3,
      x=d<4?S/2:S/2+dx/d*r,y=d<4?H/2:H/2+dy/d*r,dn=gycDir(c);pt={x,y,l:dn==='한가운데'?'맵 한가운데':`${dn}쪽`,area:1}}
    return{reg:c.host,pt,why:'맵'}}
  if(c.k.pv){const pv=gyclProv(c.host);return pv&&PROV[pv]?{pv,why:'성'}:null}
  return null}
const gytPvOf=t=>t?(t.pv||gyclProv(t.reg)||(t.reg==='gaebong'?'gaebong':null)):null;
// 맵 사이 길 (너비 우선): 첫 걸음이 어느 출입구/가장자리인지
function gytNb(id){const R=REGIONS[id];if(!R)return[];const o=[];
  for(const g of R.gates||[]){if(g.gyc!=null)continue;let t=g.to;if(isPvFull(t))t=pvSplitAt(t,g.tx,g.ty).id;if(REGIONS[t])o.push({to:t,g})}
  for(const[s,e]of Object.entries(R.edges||{}))if(e&&REGIONS[e])o.push({to:e,side:s});return o}
function gytRoute(from,goal){if(!REGIONS[from])return null;if(goal(from))return{h:0};const first={},hop={[from]:0},q=[from];
  for(let i=0;i<q.length;i++){const c=q[i];for(const n of gytNb(c)){if(n.to in hop)continue;hop[n.to]=hop[c]+1;first[n.to]=c===from?n:first[c];
      if(goal(n.to)){const f=first[n.to];return{g:f.g||null,side:f.side||null,to:f.to,h:hop[n.to],dest:n.to}}q.push(n.to)}}
  return null}
const gytGoal=t=>t.reg?(id=>id===t.reg):(id=>!!REGIONS[id].win&&REGIONS[id].prov===t.pv);
// 같은 자리·같은 목표면 다시 찾지 않는다 (맵을 옮기거나 2초 지나면 다시)
const GYT_C={};
function gytRouteC(t){const k=REG+'|'+(t.reg||'pv:'+t.pv),C=GYT_C[k];if(C&&time-C.t<2)return C.r;const r=gytRoute(REG,gytGoal(t));GYT_C[k]={t:time,r};return r}
// 추적할 소문: 고른 것(P.gyTrk), 아니면 가장 가까운 것. -1이면 끔
function gytActive(){if(!G.gyc||!P)return[];return G.gyc.list.filter(c=>{gyclEnsure(c);return !c.done&&gytTarget(c)})}
function gytCur(){if(!G.gyc||!P||P.gyTrk===-1)return null;const L=gytActive();if(!L.length)return null;
  if(P.gyTrk!=null){const c=L.find(c=>c.i===P.gyTrk);if(c)return c}
  let best=null,bh=1e9;for(const c of L){const r=gytRouteC(gytTarget(c)),h=r?r.h:999;if(h<bh){bh=h;best=c}}return best}
// 이 맵에서 그릴 표시
function gytMarks(){if(!playing||!P||!REG||(typeof acadOn==='function'&&acadOn()))return[];const c=gytCur();if(!c)return[];const t=gytTarget(c),R=REGIONS[REG];if(!t||!R)return[];
  const tag='기연 · ';
  if(t.reg===REG||(t.pv&&gyclProv(REG)===t.pv&&!t.reg)){if(!t.pt)return[];const p=t.pt;if(p.area&&Math.hypot(p.x-P.x,p.y-P.y)<5)return[];
    return[{x:p.x,y:p.y,l:tag+p.l,h:p.npc?84:p.area?40:60,rgb:GYT_RGB,hex:GYT_HEX,gy:c.i}]}
  const r=gytRouteC(t);if(!r||!r.h)return[];
  if(r.g){const g=r.g,ty=typeof portalTagY==='function'?portalTagY(g):toScreen(g.x,g.y).y-60;
    const dup=typeof sfMarks==='function'&&sfMarks().some(m=>m.x===g.x&&m.y===g.y);
    return[{x:g.x,y:g.y,l:tag+(REGIONS[r.to]?REGIONS[r.to].name:g.label),h:toScreen(g.x,g.y).y-ty+14+(dup?24:0),tag:1,rgb:GYT_RGB,hex:GYT_HEX,gy:c.i}]}
  const S=N,H=NH,m=1.2,x=r.side==='w'?m:r.side==='e'?S-m:clamp(P.x,3,S-3),y=r.side==='n'?m:r.side==='s'?H-m:clamp(P.y,3,H-3);
  return[{x,y,l:tag+REGIONS[r.to].name,h:40,rgb:GYT_RGB,hex:GYT_HEX,gy:c.i,edge:1}]}
hook('drawList',list=>{if(!G.gyc||typeof acadMarkDraw!=='function')return;for(const m of gytMarks())list.push({L:LY.TOP,d:99991,f:()=>acadMarkDraw(m)})});
function gytMini(g){for(const m of gytMarks()){const[x,y]=miniXY(m.x,m.y),k=.6+.4*Math.sin(time*5);g.fillStyle=`rgba(${GYT_RGB},${k})`;g.beginPath();g.moveTo(x,y-3.5);g.lineTo(x+3.5,y);g.lineTo(x,y+3.5);g.lineTo(x-3.5,y);g.closePath();g.fill()}}
// 다음 할 일 한 줄 (임무 줄·지도 창)
function gytWhere(c){const t=gytTarget(c);if(!t)return'';const pv=gytPvOf(t),pn=pv&&typeof pvName==='function'?pvName(pv):'';
  if(t.reg){const rn=REGIONS[t.reg].name;return t.reg===REG?(t.pt?`이 맵 ${t.pt.l}`:'이 맵에서 찾아보자'):`${rn}${pn&&!rn.startsWith(pn)?` (${pn})`:''}`}
  return provOfReg(REG)===pv?`${pn} 안에서 사람들에게 묻자`:`${pn} 어딘가`}
// ---- 천하 지도: 소문의 성 표시, 추적하는 소문은 지금 성에서 가는 길 ----
function gytSvg(X,Y,cur0){if(!G.gyc||!P)return'';const L=gytActive();if(!L.length)return'';const on=gytCur();
  const P0=PROV.henan.map,pos=k=>k==='gaebong'?[X(P0[0])+18,Y(P0[1])]:PROV[k]?[X(PROV[k].map[0]),Y(PROV[k].map[1])]:null;
  let out='';const at={};
  for(const c of L){const pv=gytPvOf(gytTarget(c)),p=pv&&pos(pv);if(!p)continue;const n=at[pv]=(at[pv]||0)+1,me=on&&c.i===on.i;
    const x=p[0]+12+(n-1)*12,y=p[1]-2;out+=`<g class="gymk${me?' on':''}" data-act="gytrk:${c.i}"><circle class="hit" cx="${x}" cy="${y}" r="10"/><path d="M${x} ${y-8}L${x+7} ${y}L${x} ${y+8}L${x-7} ${y}Z"/></g>`}
  if(on){const pv=gytPvOf(gytTarget(on)),route=pv&&typeof pvRoute==='function'?pvRoute(cur0,pv):null;
    if(route&&route.length>1){const pts=route.map(pos).filter(Boolean);out=`<polyline class="gyroute" points="${pts.map(p=>p.join(',')).join(' ')}"/>`+out}
    const p=pv&&pos(pv);if(p)out+=`<circle class="gypulse" cx="${p[0]}" cy="${p[1]}" r="16"/>`}
  return out}
function gytPvHtml(k){if(!G.gyc||!P)return'';const on=gytCur(),L=gytActive().filter(c=>gytPvOf(gytTarget(c))===k);if(!L.length)return'';
  return `<h4 style="margin:6px 0 2px;color:${GYT_HEX}">기연 소문 ${L.length}</h4>`+L.map(c=>`<p class="note">◆ ${esc(gyclNext(c))} <small class="dim">· 아는 만큼: ${GYCL.slots.filter(([s])=>c.k[s]).map(([,n])=>n).join('·')||'성'}</small> ${on&&on.i===c.i?`<small style="color:${GYT_HEX}">길잡이 중</small>`:B('gytrk:'+c.i,'길잡이')}</p>`).join('')}
// 임무창 소문 칸의 단추
function gytBtn(c){if(c.done||!gytTarget(c))return'';const on=gytCur();
  return on&&on.i===c.i?`<span class="gytbtn"><small style="color:${GYT_HEX}">◆ 길잡이: ${esc(gytWhere(c))}</small> ${B('gytrk:-1','끄기')}</span>`:B('gytrk:'+c.i,'길잡이')}
hook('sectAct',x=>{if(x.a!=='gytrk')return;x.done=true;x.r=true;const i=+x.x;if(i===-1){P.gyTrk=-1;log('기연 길잡이를 껐다.','info');return}
  const c=G.gyc&&G.gyc.list.find(o=>o.i===i);if(!c||!gytTarget(c))return;P.gyTrk=i;log(`기연 길잡이: ${gytWhere(c)} 쪽을 하늘빛 화살표로 가리킨다.`,'info')});

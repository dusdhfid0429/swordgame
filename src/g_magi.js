// v252 마기 위압 (사용자 2026-11-11): 마기를 두른 적 앞에서 내공이 약하면 움츠러들고, 더 약하면 심마가 든다.
// 불가 심법은 면역이고 불가 아군이 곁에 있으면 가벼워진다. 내가 마기 심법이면 내공 약한 적이 움츠러든다. 수치는 data/magi.json
const MAGI=GD.MAGI;let MAGI_LV=0,MAGI_SRC=null,MAGI_T=0,MAGI_FIT=0,MAGI_SLOW=0,MAGI_SAID=-99;
const magiQi=e=>GD.QSTAR.ref[Math.min(GD.QSTAR.ref.length-1,mobRealm(e))]*(MAGI.tier[mobTier(e)]||1);
const magiImmune=()=>{const s=simCur();return!!(s&&s.sect&&s.sc==='불가')||pEl()==='마'};   // 불가 문파 심법(소림·아미·보타)만. 정파 기초 심법은 아니다
const magiFoe=e=>e&&e.d&&e.hp>0&&e.el==='마'&&e.aggro&&!e.ally&&!e.warAlly&&!e.cowed;
const magiMonk=()=>allies.some(a=>a.hp>0&&scOf(a)==='불가'&&dist(a,P)<=MAGI.ally)||mobs.some(e=>e.hp>0&&(e.ally||e.warAlly)&&scOf(e)==='불가'&&dist(e,P)<=MAGI.ally);
function magiLvOf(e){const r=P.maxQi/Math.max(1,magiQi(e));let lv=0;MAGI.st.forEach((s,i)=>{if(r<s.r)lv=i+1});return lv}
function magiScan(){if(!P||P.hp<=0||magiImmune()){MAGI_LV=0;MAGI_SRC=null;return}
  let lv=0,src=null;for(const e of mobs){if(!magiFoe(e)||dist(e,P)>MAGI.range)continue;const l=magiLvOf(e);if(l>lv){lv=l;src=e}}
  if(lv>0&&magiMonk())lv--;
  if(lv>MAGI_LV&&src){const s=MAGI.st[lv-1];addText(P.x,P.y-.9,s.n,'#b48cff');
    if(time-MAGI_SAID>MAGI.tell){MAGI_SAID=time;log(`${src.name}의 마기에 눌려 ${s.n}${lv===MAGI.st.length?'가 듭니다':'됩니다'}. 내공이 모자랍니다 (공격 -${Math.round(s.atk*100)}%, 이동 -${Math.round(s.spd*100)}%).`,'dmg')}}
  if(lv<MAGI.st.length)MAGI_FIT=0;MAGI_LV=lv;MAGI_SRC=lv?src:null}
const magiSt=()=>MAGI_LV>0?MAGI.st[MAGI_LV-1]:null;
const magiSpd=()=>{const s=magiSt();return(s?1-s.spd:1)*(MAGI_SLOW>0?MAGI.fit.spd:1)};
const magiTag=()=>{const s=magiSt();return s?' · '+s.n:''};
hook('tick',dt=>{if(!P||typeof playing!=='undefined'&&!playing)return;MAGI_T-=dt;if(MAGI_SLOW>0)MAGI_SLOW=Math.max(0,MAGI_SLOW-dt);
  if(MAGI_T<=0){MAGI_T=.3;magiScan()}
  if(MAGI_LV===MAGI.st.length){MAGI_FIT+=dt;if(MAGI_FIT>=MAGI.fit.every){MAGI_FIT=0;const q=Math.min(P.qi,Math.round(P.maxQi*MAGI.fit.qi));P.qi-=q;MAGI_SLOW=MAGI.fit.slow;
    addText(P.x,P.y-1.1,'심마!','#d07bff');log(`심마가 치밀어 내공 ${q}이 흩어지고 발이 묶입니다.`,'dmg')}}});
hook('hit',c=>{if(c.from!==P)return;const s=magiSt();if(s)c.m*=1-s.atk});
// 내가 마기 심법: 내공 약한 적이 움츠러든다
const magiCowed=e=>!!(e&&e.d&&P&&pEl()==='마'&&e.el!=='마'&&scOf(e)!=='불가'&&magiQi(e)<P.maxQi*MAGI.foe.r);
hook('hurt',c=>{const e=c.src;if(!magiCowed(e))return;c.dm*=1-MAGI.foe.atk*(e.d.boss?MAGI.foe.boss:1);
  if(!e.magiSaid){e.magiSaid=1;addText(e.x,e.y-.6,'움츠림','#b48cff')}});

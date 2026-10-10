// ================= 적의 무공·장비와 전리품 =================
// 사람 몹은 태어날 때 무공 하나와 병기·방어구를 갖춘다(e.art, e.eq). 장비는 능력치에 조금 보태고,
// 전리품은 그 적이 쓰던 무공의 비급(아는 초식 중에서)과 차고 있던 장비 중에서 확률로 떨어진다. 은자는 바닥에 떨어지지 않고 바로 들어온다.
const MOB_ART=GD.MOB_ART,KIT_ODDS=GD.KIT_ODDS;
const mobTier=e=>e.d.boss?'b':e.d.elite||MOB_TIER[e.kind]==='e'?'e':'n';
function mobArtId(e){const d=e.d;if(e.art&&ARTS[e.art])return e.art;
  const m=MOB_ART[e.kind];if(!m)return null;const[side,cls]=m,ei=Math.max(0,ELS.indexOf(d.el||e.el));return `${side}${cls}${ei}`}
// 아는 초식 수: 경지 하나에 초식 하나씩, 보스는 하나 더
function mobKnown(e){const a=ARTS[e.art];if(!a)return 0;return Math.min(a.forms.length,1+(e.realm||0)+(e.d.boss?1:0))}
function mobKit(e){
  const d=e.d;if(!d||d.beast||d.villager||d.passive||e.duel||e.eq)return e;
  const id=mobArtId(e);if(!id)return e;e.art=id;const a=ARTS[id];if(!e.el&&a.el)e.el=a.el;e.known=mobKnown(e);
  const t=mobTier(e),r=e.realm||0,q=()=>clamp(.55+r*.13+(t==='b'?.3:t==='e'?.12:0)+Math.random()*.2,.5,1.6),o=KIT_ODDS[t];
  e.eq={weapon:mkWeapon(a.cls,q(),0),armor:null,acc:null,boots:null};
  if(Math.random()<o.armor)e.eq.armor=mkGear('armor',pick(['마의','피갑','흑철갑']),q(),{hp:26,def:4});
  if(Math.random()<o.acc)e.eq.acc=mkGear('acc',pick(['옥패','호신부','염주']),q(),{qi:24,hm:5});
  if(Math.random()<o.boots)e.eq.boots=mkGear('boots',pick(['짚신','무혜','운리혜']),q(),{spd:.12,hm:4});
  // 장비가 능력치에 보태는 몫: 병기 공격력의 1/4, 갑옷 방어의 절반·생명의 절반, 장신구·신발의 현묘도
  const w=e.eq.weapon,ar=e.eq.armor;e.atk+=Math.round(w.atk*.25);
  if(ar){e.def+=Math.round(ar.def*.5);e.maxHp+=Math.round(ar.hp*.5);e.hp=e.maxHp}
  e.hm+=(e.eq.acc?e.eq.acc.hm:0)+(e.eq.boots?e.eq.boots.hm:0);
  return e}
hook('mobMade',(e,kind,extra)=>{if(!extra&&!e.d.fac)mobKit(e)});   // 세력 무인은 직위·경지가 정해진 뒤(facMade) 갖춘다
hook('facMade',e=>mobKit(e));
// 표적 이름 밑에 보이는 줄: 무공 · 병기 · 갑옷
function mobKitLabel(e){const a=ARTS[e.art];if(!a)return'';const q=e.eq&&e.eq.weapon;
  return `${a.n}${q?` · ${QN(q.q)} ${q.name}`:''}${e.eq&&e.eq.armor?` · ${e.eq.armor.name}`:''}`}
// 정예·보스가 큰 기술을 쓸 때 초식 이름을 외친다
function mobFormCall(e){const a=ARTS[e.art];if(!a||!e.known)return;const f=a.forms[Math.floor(Math.random()*e.known)];
  texts.push({x:e.x,y:e.y,t:`${a.n} · ${f.n}`,c:`rgb(${a.c})`,life:.9,call:1})}
// 전리품
function mobLoot(e){
  const d=e.d,out=[];
  if(d.silver){const s=R1(d.silver[0],d.silver[1]);if(s>0){P.silver+=s;addText(P.x,P.y-.3,`은자 +${s}`,'#e8c66e')}}
  if(d.meat)out.push({mat:'고기',n:d.meat});if(d.hide)out.push({mat:'가죽',n:d.hide});
  const a=ARTS[e.art];
  if(a&&e.known){
    // 비급: 그 적이 아는 초식 중에서, 앞 초식일수록 흔하다
    const bk=d.boss?1:d.elite?.3:e.kind==='혈교무인'?.3:e.kind==='강시'?.2:d.hostile?.07:0;
    const book=()=>{const w=[];for(let i=0;i<e.known;i++)w.push(1/(i+1));let r=Math.random()*w.reduce((x,y)=>x+y),i=0;while(r>w[i]){r-=w[i];i++}return mkBook(a.id,Math.min(i,e.known-1))};
    if(Math.random()<bk)out.push({item:book()});
    if(d.boss&&Math.random()<.6){let b2=book();for(let t=0;t<4&&out.some(o=>o.item&&o.item.form===b2.form);t++)b2=book();out.push({item:b2})}   // 둘째 권은 되도록 다른 초식
  }
  if(e.eq){
    // 장비: 차고 있던 것 중 하나. 병기는 싸우느라 날이 상해 있다
    const have=Object.values(e.eq).filter(Boolean),gq=d.boss?1:d.elite?.25:d.hostile?.07:0;
    const gear=()=>{const it=pick(have);if(it.slot==='weapon'&&it.maxDur)it.dur=Math.max(1,Math.round(it.maxDur*(.4+Math.random()*.5)));return it};
    if(have.length&&Math.random()<gq)out.push({item:gear()});
    if(d.boss&&have.length>1&&Math.random()<.5){const it=gear();if(!out.some(o=>o.item===it))out.push({item:it})}
  }
  if(d.hostile&&!d.beast&&Math.random()<.12)out.push({mat:pick(['금창약','소환단','비도']),n:1});
  if(d.boss&&realmIdx()>=5){const sg=P.sg.name||pick(Object.keys(SHINGONG));out.push({page:sg})}
  if(d.boss&&Math.random()<.25)out.push({item:mkSBook(pick(['암기','독공','점혈']))});
  out.forEach((it,i)=>drops.push({x:e.x+(i%3-1)*.3,y:e.y+Math.floor(i/3)*.3,it,t:Math.random()*6}));
}

// ================= 애니메이션 보강: 사망 쓰러짐, 피격 젖힘, 공격 예비·회복 =================
// 사용자 요청(2026-10-12): 스프라이트 애니메이션 리소스처럼 몬스터·NPC 동작을 키프레임답게. 그림은 코드 그대로, 동작만 보강한다.
// - 사망: 죽은 사람·짐승은 바로 사라지지 않고 corpses 로 옮겨 0.9초 동안 발을 축으로 쓰러지며(맞은 반대쪽) 흙먼지가 일고 흐려져 사라진다. 뒤로 넘어진 뒤 0.3초는 바닥에 누워 있다.
// - 피격: r_fighter.js 에서 e.hit 동안 몸이 젖혀지고(hitK 배율: 치명 1.6), drawBeast 에서 짐승은 눌린다.
// - 공격: 사람은 예비(창·주먹은 뒤로 당김) → 타격 → 회복(e.rec 0.22초, 마무리 자세에서 돌아옴). 짐승은 움츠렸다가 덮친다.
// - 대기: 가만히 서면 무게중심이 천천히 옮겨 간다. 설계: docs/세력_문파_설계.md 24장. 테스트: tests/t47_anim.js
let corpses=[];
const CORPSE_T=.9;
hook('kill',e=>{if(!e||e.ghost||e.d&&e.d.villager&&false)return;
  const side=(e.fx-e.fy)>=0?1:-1,k=P&&isFinite(P.x)?Math.sign((e.x-e.y)-(P.x-P.y))||side:side;   // 맞은 쪽(플레이어) 반대로 넘어진다
  corpses.push({x:e.x,y:e.y,t:0,e:{...e,hit:0,swing:0,wind:0,stun:0,moving:false,dead:1,kb:{x:0,y:0},rec:0},dir:k,beast:!!(e.d&&e.d.beast),sc:(e.d&&e.d.big)||e.big||1})});
hook('mobHurt',c=>{if(c.t&&c.dm>=c.t.maxHp*.25)c.t.hitK=1.6;else if(c.t)c.t.hitK=1});
hook('hitDone',c=>{const e=c.e;if(e)e.hitK=(c.hp0-e.hp)>=e.maxHp*.25?1.6:1});
function corpseTick(dt){if(!corpses.length)return;for(const c of corpses){c.t+=dt;if(!c.dusted&&c.t>=.3){c.dusted=1;fx.push({t:'dust',x:c.x-.1,y:c.y-.1,life:.45})}}corpses=corpses.filter(c=>c.t<CORPSE_T)}
hook('trainTick',dt=>{if(playing)corpseTick(dt)});
hook('loadRegion',()=>{corpses=[]});
// 발을 축으로 돌아 눕는다. 사람은 90°, 짐승은 옆으로 쓰러진다
function drawCorpse(c){const p=toScreen(c.x,c.y),fall=Math.min(1,c.t/.3),ease=1-Math.pow(1-fall,2),fade=c.t>.55?1-(c.t-.55)/(CORPSE_T-.55):1;
  ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=Math.max(0,fade);
  ctx.rotate(c.dir*ease*(c.beast?Math.PI*.42:Math.PI*.5));ctx.translate(-p.x,-p.y);
  const z=1+ease*.0;ctx.scale(1,1-ease*.05*z);
  if(c.beast)drawBeast(c.e);else drawFighter(c.e,false);
  ctx.restore()}

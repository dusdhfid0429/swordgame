// ================= v262 문파마다 한 가지 손맛 (동훈님 2026-11-12, 적용 계획 3단계 H) =================
// 계획 문서 https://claude.ai/artifact/VU941jxbdqewHx6KPT6EBz 의 H. 고파 「구파일방과 오대세가」에서 문파마다 하나씩 고른 특색을 심법 특색(SIM_TK)으로 더한다.
// 그 문파 심법을 운용하는 동안만 살아난다(simTv). 세기 = SIM_TK[k].v × SIM_TQ[심법 등급] (중승 1 · 상승 1.4 · 절정 1.8). 숫자는 data/simbeop.json SIM_TK·SIM_TRAIT
// - 공동 칠상(chilsang): 피해 +v%. 내공이 30% 밑이면 준 피해의 3%를 내가 입는다 (칠상권: 내공이 모자라면 자기 몸도 다친다)
// - 청성 송풍(songpung): 움직이며 칠 때 피해 +v% (소나무처럼 굳세고 바람처럼 가볍다)
// - 점창 쾌검(kwae): 3초 동안 맞지 않던 적에게 첫 일격 +v% (한 순간을 꿰뚫는 빠른 검)
// - 곤륜 전초(jeoncho): 마교 무인에게 피해 +v% (서역에서 마교를 먼저 막는 문파)
// - 형산 오신(oshin): 다섯 번째 공격마다 치명타 (형산 다섯 봉우리의 검)
// - 해남 좌수(jwasu): 칠 때 상대 현묘도 -v (왼손 검이라 읽기 어렵다)
// - 남궁 제왕(jewang): 나보다 경지가 같거나 낮은 적에게 피해 +v% (정면으로 압도하는 제왕검형)
// - 모용 두전(dujeon): 맞을 때 v% 확률로 그 피해를 고스란히 되돌린다 (이피지도 환시피신)
// 무공 보정값(ARTK)은 건드리지 않는다. 테스트 tests/t177_sectfx.js
hook('hit',c=>{if(c.from!==P||!c.e)return;const e=c.e;let m=0;
  m+=simTv('chilsang');
  if(P.moving)m+=simTv('songpung');
  const kw=simTv('kwae');if(kw&&(time-(e.hurtAt??-99))>3)m+=kw;
  const jc=simTv('jeoncho');if(jc&&e.d&&e.d.fac==='마')m+=jc;
  const jw=simTv('jewang');if(jw&&(e.realm??0)<=realmIdx())m+=jw;
  if(m)c.m*=1+m/100;
  const zs=simTv('jwasu');if(zs)c.hm=Math.max(0,(c.hm||0)-zs)});
hook('hitDone',c=>{if(!c.e)return;const d=Math.max(0,(c.hp0||0)-Math.max(0,c.e.hp));
  if(simTv('chilsang')&&P.qi<P.maxQi*.3&&d>0&&P.hp>1){const self=Math.min(P.hp-1,Math.max(1,Math.round(d*.03)));P.hp-=self;addText(P.x,P.y-.4,`칠상 -${self}`,'#e0675a')}
  if(simTv('oshin')){P.oshin=(P.oshin||0)+1;if(P.oshin>=5){P.oshin=0;P.buff.crit=Math.max(P.buff.crit||0,1.5)}}});   // 다음 공격(1.5초 안)이 치명타
hook('hurtDone',c=>{const v=simTv('dujeon'),src=c.src,d=c.hp0-Math.max(0,P.hp);if(!v||d<=0||!src||!src.d||src.hp<=0||Math.random()*100>=v)return;
  damage(src,Math.round(d),0,0,P);addText(src.x,src.y-.5,'두전성이','#c8b0ff')});

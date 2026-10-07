const F=(n,p,o={})=>({n,p,...o});
const PROTO={
 검:[
  {n:'청풍검법',d:'바람처럼 빠르고 가벼운 검법. 원격 검기와 팔방 공격을 고루 갖췄다.',c:'150,225,255',pt:'spark',forms:[
    F('청풍일섬','melee',{m:1,cd:.3}),F('풍운회류','arc',{spread:2.2,rad:1.6,m:.9,cd:.45}),F('송풍검기','proj',{cnt:1,spd:9,len:5,pierce:1,m:.9,cd:.5}),
    F('질풍삼연','multi',{hits:3,m:.45,cd:.6}),F('팔방청풍','proj',{full:1,cnt:8,spd:8,len:3,m:.6,cd:.8})],
   ult:{n:'청풍만리',steps:[F('','proj',{full:1,cnt:16,spd:9,len:5,pierce:1,m:1.2}),F('','circle',{rad:2.5,m:2})]}},
  {n:'낙화검법',d:'꽃잎이 지듯 흩어지는 검법. 넓은 곳에 여러 번 떨어지는 공격이 많다.',c:'255,165,205',pt:'petal',forms:[
    F('낙화일검','melee',{m:1.1,cd:.35}),F('화우분분','rain',{cnt:5,rad:.9,r:4,m:.5,cd:.8}),F('낙영검기','proj',{cnt:3,spread:.5,spd:8,len:4,m:.7,cd:.6}),
    F('비화연참','multi',{hits:4,m:.35,cd:.7}),F('만화난무','circle',{rad:2,hits:2,m:.6,cd:.8})],
   ult:{n:'천녀산화',steps:[F('','rain',{cnt:14,rad:3,self:1,m:.9})]}},
  {n:'유성검법',d:'별이 떨어지듯 멀리 꿰뚫는 검법. 직선 관통과 원격 낙하가 장기다.',c:'255,220,130',pt:'spark',forms:[
    F('유성일섬','line',{len:2.5,w:.5,m:1.2,cd:.45}),F('추성검','dash',{dist:1.6,then:F('','line',{len:2,w:.5,m:1.1}),cd:.7}),
    F('성광검기','proj',{cnt:1,spd:12,len:6,pierce:1,size:1.5,m:1.2,cd:.6}),F('쌍성참','proj',{cnt:2,spread:.25,spd:10,len:5,m:.8,cd:.55}),
    F('낙성','drop',{rad:1.2,r:4.5,stun:.6,m:1.3,cd:.9})],
   ult:{n:'유성우',steps:[F('','rain',{cnt:10,rad:2.5,r:5,stun:.4,m:1.1})]}}],
 도:[
  {n:'광풍도법',d:'광풍처럼 휩쓰는 도법. 넓은 부채꼴과 팔방 도기로 무리를 상대한다.',c:'255,140,50',pt:'spark',forms:[
    F('광풍참','arc',{spread:2.4,rad:1.7,m:1,cd:.5}),F('회풍도','circle',{rad:1.8,m:.9,cd:.6}),F('광풍도기','proj',{cnt:1,spd:7,len:4.5,pierce:1,size:1.8,m:1,cd:.65}),
    F('폭풍연참','multi',{hits:3,m:.5,cd:.65}),F('팔방광풍','proj',{full:1,cnt:8,spd:7,len:2.6,size:1.3,m:.7,cd:.85})],
   ult:{n:'천지광풍',steps:[F('','pull',{rad:3.5,m:.3}),F('','circle',{rad:3.2,m:2.2,delay:.25})]}},
  {n:'혈랑도법',d:'늑대처럼 물어뜯는 도법. 모든 초식이 입힌 피해의 일부를 체력으로 흡수한다.',c:'235,40,30',pt:'dot',heal:.12,forms:[
    F('혈랑일도','melee',{m:1.5,cd:.5}),F('랑아쌍참','multi',{hits:2,m:.8,cd:.6}),F('혈영돌','dash',{dist:2,then:F('','circle',{rad:1.3,m:1}),cd:.8}),
    F('혈조','arc',{spread:1.4,rad:1.5,m:1.1,cd:.55}),F('혈랑포효','pull',{rad:3,m:.6,cd:1})],
   ult:{n:'혈월랑무',steps:[F('','blinkMulti',{cnt:5,m:1.5})]}},
  {n:'회선도법',d:'몸을 돌려 베는 도법. 주변 전체를 여러 번 휩쓰는 연속 회전이 특기다.',c:'225,225,240',pt:'spark',forms:[
    F('회선일도','arc',{spread:1.8,rad:1.6,m:1,cd:.45}),F('선풍참','circle',{rad:1.8,m:.95,cd:.6}),F('회류도기','proj',{cnt:4,spread:1.2,spd:7,len:3.5,m:.6,cd:.7}),
    F('연환회선','circle',{rad:1.7,hits:3,m:.4,cd:.8}),F('팔방회선','proj',{full:1,cnt:8,spd:7,len:2.2,m:.6,cd:.8})],
   ult:{n:'만겁회선',steps:[F('','pull',{rad:3,m:.2}),F('','circle',{rad:2.6,hits:6,m:.5,delay:.2})]}}],
 창:[
  {n:'일섬창법',d:'한 점을 멀리 꿰뚫는 창법. 투창과 장거리 관통이 장기다.',c:'235,245,255',pt:'spark',forms:[
    F('일섬','line',{len:2.6,w:.45,m:1.15,cd:.45}),F('천공돌','dash',{dist:2,then:F('','line',{len:2,w:.5,m:1.2}),cd:.75}),
    F('투창','proj',{cnt:1,spd:11,len:6,pierce:1,m:1.1,cd:.6}),F('삼첨창','proj',{cnt:3,spread:.35,spd:10,len:3.5,m:.7,cd:.6}),F('관일','line',{len:4,w:.6,m:1.3,cd:.8})],
   ult:{n:'일섬천리',steps:[F('','line',{len:8,w:1,m:3})]}},
  {n:'이화창법',d:'배꽃처럼 흩뿌리는 창법. 빠른 연속 찌르기와 부채꼴 다발 공격이 많다.',c:'255,235,240',pt:'petal',forms:[
    F('이화일점','melee',{m:1,cd:.35}),F('이화연환','multi',{hits:5,m:.3,cd:.65}),F('화첨산','proj',{cnt:5,spread:1,spd:9,len:3,m:.45,cd:.6}),
    F('이화폭우','arc',{spread:1.4,rad:2.2,hits:3,m:.4,cd:.75}),F('팔방이화','proj',{full:1,cnt:8,spd:9,len:3,m:.55,cd:.8})],
   ult:{n:'이화만천',steps:[F('','proj',{full:1,cnt:24,spd:8,len:4,m:.7})]}},
  {n:'비룡창법',d:'용처럼 굽이쳐 나가는 창법. 휘어 나가는 용 기운이 적을 꿰뚫는다.',c:'90,225,165',pt:'spark',forms:[
    F('비룡출수','line',{len:2.4,w:.5,m:1.2,cd:.45,wavy:1}),F('용미소','circle',{rad:1.7,m:.9,cd:.6}),
    F('비룡승천','dash',{dist:2,then:F('','circle',{rad:1.3,stun:.5,m:1.1}),cd:.85}),
    F('창룡파','proj',{cnt:1,spd:8,len:6,pierce:1,wavy:1,size:1.5,m:1.2,cd:.7}),F('쌍룡출해','proj',{cnt:2,spread:.6,spd:8,len:5,wavy:1,m:.9,cd:.7})],
   ult:{n:'구룡파천',steps:[F('','proj',{cnt:9,spread:1.6,spd:8,len:6,pierce:1,wavy:1,size:1.4,m:1})]}}],
 봉:[
  {n:'소림곤법',d:'정직하고 묵직한 곤법. 적을 멀리 밀쳐내고 기절시킨다.',c:'215,170,95',pt:'dot',forms:[
    F('직타','melee',{m:1,kb:1.5,cd:.45}),F('횡소천군','arc',{spread:2.6,rad:1.9,m:.9,kb:1,cd:.6}),F('곤풍','proj',{cnt:1,spd:7,len:4.5,pierce:1,size:1.4,m:.8,cd:.6}),
    F('금강타','drop',{rad:1,r:1.8,stun:.6,m:1.2,cd:.8}),F('나한진','circle',{rad:2,kb:1.5,m:.9,cd:.8})],
   ult:{n:'달마항마',steps:[F('','drop',{rad:3,self:1,stun:1.2,m:2})]}},
  {n:'풍차봉법',d:'봉을 풍차처럼 돌리는 봉법. 사방과 팔방을 한꺼번에 친다.',c:'235,195,110',pt:'dot',forms:[
    F('풍차일타','circle',{rad:1.8,m:.8,cd:.5}),F('연환풍차','circle',{rad:1.7,hits:3,m:.4,cd:.75}),F('풍차비곤','proj',{cnt:1,spd:6,len:5,pierce:1,size:1.6,m:.9,cd:.7}),
    F('사방타','proj',{full:1,cnt:4,spd:7,len:2.6,m:.8,cd:.6}),F('팔방풍차','proj',{full:1,cnt:8,spd:7,len:3,m:.7,cd:.8})],
   ult:{n:'대풍차',steps:[F('','pull',{rad:3.5,m:.2}),F('','circle',{rad:2.5,hits:5,m:.5,delay:.2})]}},
  {n:'벽력봉법',d:'벼락을 부르는 봉법. 멀리 떨어진 적에게도 낙뢰와 연쇄 번개를 내린다.',c:'255,240,120',pt:'spark',forms:[
    F('벽력타','drop',{rad:.9,r:1.7,stun:.5,m:1.1,cd:.5}),F('뇌정곤','line',{len:2.5,w:.5,stun:.3,m:1,cd:.55}),F('낙뢰','drop',{rad:1,r:5,stun:.6,m:1,cd:.8}),
    F('연쇄뇌','chain',{cnt:3,r:3,m:.8,cd:.75}),F('뇌운','rain',{cnt:6,rad:2,r:4,m:.6,cd:.9})],
   ult:{n:'만뢰천벌',steps:[F('','rain',{cnt:18,rad:3.5,self:1,stun:.6,m:1})]}}],
 권:[
  {n:'금강권법',d:'단단한 주먹의 권법. 빠른 연타와 멀리 날아가는 권풍을 쓴다.',c:'255,255,255',pt:'spark',forms:[
    F('철권','melee',{m:.8,cd:.28}),F('쌍권','multi',{hits:2,m:.5,cd:.4}),F('권풍','proj',{cnt:1,spd:9,len:4.5,m:.9,cd:.5}),
    F('붕권','arc',{spread:1.2,rad:1.8,kb:1.4,m:1.3,cd:.7}),F('금강진각','circle',{rad:1.6,stun:.5,m:1,cd:.8})],
   ult:{n:'금강불괴권',steps:[F('','proj',{cnt:1,spd:6,len:7,pierce:1,size:3,m:3})]}},
  {n:'연환권법',d:'숨 쉴 틈 없는 연타 권법. 백보신권으로 멀리 있는 적도 친다.',c:'255,200,120',pt:'spark',forms:[
    F('연환일권','multi',{hits:2,m:.5,cd:.35}),F('연환사권','multi',{hits:4,m:.35,cd:.6}),F('백보신권','proj',{cnt:3,spread:.3,spd:10,len:5,m:.6,cd:.6}),
    F('팔방권','proj',{full:1,cnt:8,spd:8,len:2.5,m:.6,cd:.75}),F('연환폭권','multi',{hits:6,m:.3,cd:.85})],
   ult:{n:'천수권',steps:[F('','proj',{cnt:16,spread:1.2,spd:10,len:4.5,m:.5})]}},
  {n:'붕산권법',d:'산을 무너뜨리는 권법. 느리지만 한 방이 무겁고 땅을 울려 기절시킨다.',c:'255,195,60',pt:'dot',forms:[
    F('붕산일권','arc',{spread:1.3,rad:1.8,kb:1.4,m:1.5,cd:.7}),F('산붕','drop',{rad:1.5,r:1.3,stun:.4,m:1.2,cd:.8}),
    F('파산권강','proj',{cnt:1,spd:7,len:5,pierce:1,size:2,m:1.2,cd:.8}),F('진산','circle',{rad:2,kb:1,m:1,cd:.8}),F('개산','line',{len:3.5,w:.8,m:1.3,cd:.85})],
   ult:{n:'붕천열지',steps:[F('','circle',{rad:3.5,m:2.5}),F('','proj',{full:1,cnt:8,spd:8,len:4,size:1.6,m:.8,delay:.15})]}}],
 각:[
  {n:'선풍각법',d:'회오리 같은 발차기. 주변을 돌려 차고 각풍을 날린다.',c:'120,230,140',pt:'leaf',forms:[
    F('선풍각','circle',{rad:1.5,m:.9,cd:.5}),F('연환선풍','circle',{rad:1.5,hits:3,m:.4,cd:.7}),F('각풍','proj',{cnt:1,spd:9,len:4.5,m:.8,cd:.5}),
    F('팔방각풍','proj',{full:1,cnt:8,spd:8,len:3,m:.6,cd:.8}),F('회오리각','pull',{rad:2.5,m:.8,cd:.9})],
   ult:{n:'천풍선무',steps:[F('','circle',{rad:3,hits:6,m:.5}),F('','proj',{full:1,cnt:8,spd:8,len:4,m:.7,delay:.3})]}},
  {n:'무영각법',d:'그림자도 남지 않는 발차기. 순간이동해 적의 뒤를 친다.',c:'150,110,220',pt:'dot',forms:[
    F('무영일각','melee',{m:1,cd:.35}),F('무영삼각','multi',{hits:3,m:.5,cd:.6}),F('섬영각','blink',{r:4,m:1.3,cd:.7}),
    F('영각난무','blinkMulti',{cnt:3,m:1,cd:1}),F('잔영각','dash',{dist:2,then:F('','circle',{rad:1.3,m:.9}),cd:.75})],
   ult:{n:'무영천살',steps:[F('','blinkMulti',{cnt:8,m:1.4})]}},
  {n:'낙뢰각법',d:'벼락처럼 내려찍는 발차기. 기절과 연쇄 번개로 무리를 묶는다.',c:'190,130,255',pt:'spark',forms:[
    F('뇌각','melee',{stun:.3,m:1,cd:.4}),F('낙뢰각','drop',{rad:1.4,r:1.6,stun:.8,m:1.3,cd:.8}),F('천둥발','line',{len:2.5,w:.5,stun:.3,m:1,cd:.55}),
    F('뇌전각','chain',{cnt:3,r:3,m:.8,cd:.75}),F('뇌우각','rain',{cnt:6,rad:2,r:4,m:.6,cd:.9})],
   ult:{n:'구천뇌각',steps:[F('','rain',{cnt:16,rad:3.5,self:1,stun:.6,m:1}),F('','chain',{cnt:6,r:4,m:.8,delay:.3})]}}]
};

// ================= 성도와 도시: 개봉처럼 사람과 가게가 있는 성읍 =================
// 사용자 요청(2026-10-09): 각 성도에 개봉처럼 NPC를 두고 성도 느낌이 나게 건물을 배치한다.
// - 성도: 성마다 하나(PROV.cap, 무림전도의 첫 번째 주요도시. 하남성은 개봉). 객잔·대장간·잡화점·약방·포목점·창고·관아(의뢰판)·역참·세력 연락관·장터 좌판·양민 여덟.
// - 그 밖의 도시: 객잔·대장간·잡화점·역참·의뢰판.
// - 가게 주인은 건물 안에 있다(g_hall.js 전각 틀). 관아 앞에 의뢰판, 성문 밖에 역참 마부.
// - 역참 마부 창에 성도 목록이 붙어 성도끼리 말로 오간다(은자 15).
// 설계: docs/맵이동_설계.md 17장. 테스트: tests/t36_hall.js
const CITY_FEE=15;
for(const[k,p]of Object.entries(PROV)){const F=REGIONS[pvId(k)];if(!F||!F.marks)continue;
  const cities=F.marks.filter(m=>(m.t==='c'||m.town)&&m.gate);if(!cities.length)continue;
  p.cap=k==='henan'?null:(cities.find(m=>m.t==='c')||cities[0]).n;   // 하남성의 성도는 개봉 자체
  for(const m of cities){const id=m.gate,R=REGIONS[id],c=R.stage,cap=m.n===p.cap,bs=c.builds;R.city=cap?'cap':'town';
    // 건물: 0 객잔(9,9) 1 관아(28,9) 2 집(9,15) 3 집(29,15) 4 대장간(9,21) 5 사당(29,21) 6 집(13,26) 7 집(25,26)
    const npc=(id,n,x,y,pal,o={})=>({id,n,x,y,pal,...o});
    R.npcs.push(npc('inn',`${m.n} 객잔 주인`,0,0,'keeper'),npc('smith',`${m.n} 대장장이`,0,0,'smithy'),npc('gen',`${m.n} 잡화상`,0,0,'keeper'),
      npc('post','역참 마부',22.6,35.5,'keeper'),npc('board','의뢰판',31.5,12.4,null,{board:1}));
    hallAdd(id,0,bs[0],'객잔',['inn']);hallAdd(id,4,bs[4],'대장간',['smith']);hallAdd(id,2,bs[2],'잡화점',['gen']);
    if(cap){
      R.npcs.push(npc('pharm',`${m.n} 약방 의원`,0,0,'keeper'),npc('cloth',`${m.n} 포목점 주인`,0,0,'keeper'),npc('bank',`${m.n} 창고지기`,0,0,'keeper'),
        npc('jeong','정의맹 연락관',18.5,13.6,'taoist'),npc('sa','사천맹 연락관',22.5,13.6,'cultist'));
      hallAdd(id,3,bs[3],'약방',['pharm']);hallAdd(id,6,bs[6],'포목점',['cloth']);hallAdd(id,7,bs[7],'창고',['bank']);hallAdd(id,1,bs[1],'관아',[]);hallAdd(id,5,bs[5],'사당',[]);
      R.spawns=[['양민',8,(x,y)=>y>8&&y<31]];
      R.name=m.n==='성도'?'성도부':`${m.n} 성도`}
    else hallAdd(id,1,bs[1],'관아',[]);
    // 의뢰판 팻말과 장터 좌판은 맵을 만든 뒤에 놓는다
    const g0=R.gen;R.gen=()=>{g0();objs[12][31]='board';
      if(cap)[[17,19,'#a3271c'],[22,19,'#2f5f8f'],[17,23,'#c9a14a'],[22,23,'#3f7f4f']].forEach(([x,y,col])=>{if(!objs[y][x]&&map[y][x].g!==2){objs[y][x]='stall';map[y][x].cloth=col}})};
    R.zone=((z0)=>(x,y)=>{const z=z0(x,y);return cap&&/성내$/.test(z)?R.name:z})(R.zone)}}
// 역참: 성도끼리도 말로 간다
hook('npcDlg',c=>{if(c.html==null&&c.n.id==='post'){let h=postDlg();
  const caps=Object.entries(PROV).filter(([k,p])=>p.cap).map(([k,p])=>{const m=REGIONS[pvId(k)].marks.find(q=>q.n===p.cap);return[m.gate,p.cap,p.n]});
  const row=([id,n,pn])=>`<div class="it"><div>${n}<span>${pn} 성도</span></div><div class="ib">${REG===id?'<small class="dim">여기</small>':B('goto:'+id,`가기 · 은자 ${CITY_FEE}`,{d:P.silver<CITY_FEE})}</div></div>`;
  c.html=h.replace('</div><h4','</div><h4 style="margin:0">성도</h4><div class="list">'+caps.map(row).join('')+'</div><h4')}});

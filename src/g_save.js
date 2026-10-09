// ================= 저장 형식 번호와 옛 저장 옮기기 =================
// 저장에는 형식 번호 v가 붙는다. 번호가 없는 저장은 v0(2026-10-09까지의 모든 저장)이다.
// 옛 저장을 새 형식으로 옮기는 일은 모두 여기 MIGRATE에서, 번호 순서대로 한 번씩만 한다.
// 형식을 바꿀 때: SAVE_VER를 1 올리고 MIGRATE 끝에 "옛 번호 → 새 번호" 함수를 하나 더한다.
// 옮기는 함수는 저장 자료(d)만 고친다. 게임 상태(P, G)는 건드리지 않는다. 테스트: tests/t34_save.js
const SAVE_VER=1;
const MIGRATE=[
  // v0 → v1: 그동안 여러 파일에 흩어져 있던 옮기기를 한데 모음
  d=>{
    d=JSON.parse(migrateArtIds(JSON.stringify(d)));   // 예전 무공 번호 S0_1 → S_shaolin_1
    const p=d.P;if(!p)return d;
    migrateSect(p,d.notes);                             // 없어진 문파 → 옮겨 간 문파, 공적 합치기
    if(p.realm==null)p.realm=qiRealm(p);                // v42 이전: 경지는 내공으로 정했다
    const def={inj:0,injS:0,wallN:null,lifeQB:0,enl:0,peaks:{},qiX:0,gcs:0,mss:0,pas:{}};
    for(const k in def)if(p[k]===undefined)p[k]=def[k];
    return d},
];
// 저장 자료를 지금 형식으로 옮긴다. 이미 지금 형식이면 그대로 돌려준다(여러 번 불러도 같다).
function migrateSave(d){if(!d||typeof d!=='object')return d;
  let v=d.v||0;if(v>SAVE_VER){console.warn(`저장 형식 ${v}이 게임(${SAVE_VER})보다 새것입니다`);return d}
  d.notes=d.notes||[];
  while(v<SAVE_VER){d=MIGRATE[v](d)||d;d.v=++v}
  return d}
// 불러온 뒤 한 번: 옮기면서 생긴 알림을 띄우고, 경지 효과처럼 저장에서 다시 계산하는 것을 맞춘다
function afterLoad(d){realmFxSync();
  for(const n of d.notes||[])setTimeout(()=>log(n,'sys'),600);d.notes=[]}

// ================= 저장소: 기록을 어디에 두는가 =================
// 게임 코드는 STORE.get/set 만 쓴다. 기록은 먼저 기기 안(localStorage)에 바로 쓰고,
// 등록된 바깥 저장소(토스 저장소, 나중의 서버 등)에 뒤따라 올린다. 바깥 저장소가 없으면 기기 안에만 남는다.
//
// 바깥 저장소 붙이기:  storeAdd({name:'toss', pull:async key=>문자열|null, push:async (key,문자열)=>{}})
//  - pull/push 는 실패해도 된다(오류는 삼킨다). 실패한 올리기는 다음 storeSync 때 다시 올린다.
//  - 기록끼리 어느 쪽이 새것인지는 JSON 안의 t(저장한 시각, ms)로 정한다. t가 없으면 가장 옛것으로 친다.
// storeSync(key): 기기 안과 바깥 저장소를 견주어 가장 새 기록을 기기 안에 두고, 뒤처진 바깥 저장소에 올린다.
// 테스트: tests/t35_data.js
const STORE_BACKENDS=[];
const storeT=s=>{try{const d=JSON.parse(s);return d&&+d.t||0}catch(e){return-1}};
const STORE={
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,s,local){try{localStorage.setItem(k,s)}catch(e){}if(!local)for(const b of STORE_BACKENDS)storePush(b,k,s)},
  del(k){try{localStorage.removeItem(k)}catch(e){}},
};
function storePush(b,k,s){b.dirty=b.dirty||{};b.dirty[k]=s;
  return Promise.resolve().then(()=>b.push(k,s)).then(()=>{if(b.dirty[k]===s)delete b.dirty[k];return true},()=>false)}
function storeAdd(b){const i=STORE_BACKENDS.findIndex(x=>x.name===b.name);if(i>=0)STORE_BACKENDS[i]=b;else STORE_BACKENDS.push(b);return b}
async function storeSync(k){
  let best=STORE.get(k),bt=best==null?-2:storeT(best),from='local';const got=[];
  for(const b of STORE_BACKENDS){let s=null;try{s=await b.pull(k)}catch(e){continue}
    got.push([b,s]);if(s==null)continue;const t=storeT(s);if(t>bt){best=s;bt=t;from=b.name}}
  if(best==null)return'none';
  if(from!=='local')STORE.set(k,best,true);
  for(const [b,s] of got)if(s!==best)await storePush(b,k,best);
  // 읽지 못한 저장소는 올리다 실패한 것이 있을 때만 다시 올린다 (모르는 새 기록을 덮지 않게)
  for(const b of STORE_BACKENDS)if(!got.some(g=>g[0]===b)&&b.dirty&&b.dirty[k]!=null)await storePush(b,k,best);
  return from}

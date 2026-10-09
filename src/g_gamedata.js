// ================= 게임 데이터: data/*.json =================
// 무공·몹·문파·지도 같은 수치와 표는 코드가 아니라 data/*.json 에 있다. build.py 가 모두 묶어
// <script id="gamedata" type="application/json"> 에 넣고, 코드는 GD.이름 으로 읽는다.
//
// 데이터 업데이트 (앱 심사 없이 수치만 바꾸기):
//  - data/meta.json 의 rev 를 올려 빌드하면 dist/gamedata.json 과 dist/gamedata-version.json 이 나온다. 둘을 updateUrl 에 올린다.
//  - 게임은 시작할 때 updateUrl/gamedata-version.json 을 보고, rev 가 더 크고 schema 가 같으면 새 데이터를 받아 기기에 보관한다.
//  - 받은 데이터는 다음 실행부터 쓴다 (표로 무공·문파를 미리 만들어 두기 때문). 못 받거나 깨졌으면 묶인 데이터로 돈다.
//  - schema 는 코드가 기대하는 데이터 모양의 번호다. 표의 모양이 바뀌면 schema 를 올리고 앱을 새로 낸다.
const GD_CACHE_KEY='ganghoyunhoe-data';
const GD_BUNDLED=JSON.parse(document.getElementById('gamedata').textContent);
// 받아 둔 데이터가 쓸 만한가: 같은 schema, 더 새 rev, 묶인 데이터의 표가 모두 있음
function gdUsable(d,base=GD_BUNDLED){return !!d&&typeof d==='object'&&d._meta&&d._meta.schema===base._meta.schema&&d._meta.rev>base._meta.rev&&
  Object.keys(base).every(k=>k in d&&Array.isArray(d[k])===Array.isArray(base[k]))}
const GD=(()=>{try{const c=JSON.parse(localStorage.getItem(GD_CACHE_KEY)||'null');if(gdUsable(c))return c}catch(e){}return GD_BUNDLED})();
// 시작 뒤 조용히 새 데이터를 확인한다 (게임을 막지 않는다)
async function gdCheckUpdate(url=window.GD_URL||GD_BUNDLED._meta.updateUrl){
  if(!url)return'off';
  try{const base=url.replace(/\/?$/,'/'),v=await (await fetch(base+'gamedata-version.json',{cache:'no-store'})).json();
    if(!v||v.schema!==GD_BUNDLED._meta.schema||v.rev<=GD._meta.rev)return'current';
    const d=await (await fetch(base+'gamedata.json',{cache:'no-store'})).json();
    if(!gdUsable(d))return'bad';
    localStorage.setItem(GD_CACHE_KEY,JSON.stringify(d));return'saved'}catch(e){return'error'}}
setTimeout(()=>gdCheckUpdate().then(r=>{gdCheckUpdate.last=r}),3000);

// ================= 이펙트 뷰어 · 실시간 수정 (dist/fxview.html 에만 들어간다) =================
// 사용자 요청(2026-10-22): "뷰어에서 이펙트나 동작을 지정한 다음 Claude에게 글로 말해 실시간으로 수정"
// 고를 이펙트를 재생해 두고 요청을 쓰면, 페이지가 Claude(sample 능력)에게 묻고 Claude는 아래 도구로
// 살아 있는 게임 함수·데이터를 바로 바꿔 끼운다. 바꾼 것은 곧바로 다시 재생되고, 수정마다 되돌리기/다시 적용이 된다.
// '게임에 넣기'로 채택한 수정은 artifact db(fxpatch)에 남아 다음에 열 때도 다시 적용되고, Claude가 그걸 읽어 저장소에 옮긴다.
// build.py 가 FXV_FILES(조각 파일 시작 줄)·FXV_DATA(표 → data 파일)를 넣고, 맨 앞 칸 const 함수를 var 로 열어 둔다.
(()=>{
const F=window.FXV,V=F.V,gev=(0,eval);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const $$=id=>document.getElementById(id);

// ---- 게임 소스: 묶인 스크립트를 줄로 나눠 조각 파일과 줄 번호로 되짚는다 ----
const SRC=([...document.scripts].map(s=>s.textContent).find(t=>t.includes('const FXV_FILES='))||'').split('\n');
const END=SRC.findIndex(l=>l.startsWith('const FXV_FILES='))+1;   // 게임 코드가 끝난 다음 줄 (1부터)
const span=name=>{const i=FXV_FILES.findIndex(x=>x[0]===name);if(i<0)return null;return[FXV_FILES[i][1],i+1<FXV_FILES.length?FXV_FILES[i+1][1]:END]};
const fileOf=ln=>{let f=null;for(const[n,s]of FXV_FILES)if(s<=ln)f=[n,ln-s+1];return f};
const DEF=/^(?:async\s+)?function\s+([\w$]+)|^(?:var|let|const)\s+([\w$]+)\s*=/;
function defAt(ln){for(let i=ln-1;i>=0&&i>=ln-400;i--){const m=DEF.exec(SRC[i]);if(m)return m[1]||m[2]}return null}
function defFile(name){const re=new RegExp('^(?:async\\s+)?function\\s+'+name.replace(/\$/g,'\\$')+'\\s*\\(|^(?:var|let|const)\\s+'+name.replace(/\$/g,'\\$')+'\\s*=');
  for(let i=0;i<END;i++)if(re.test(SRC[i])){const f=fileOf(i+1);return f?f[0]:null}return null}
const fileText=name=>{const s=span(name);return s?SRC.slice(s[0]-1,s[1]-1).join('\n'):null};
const cut=(s,n)=>s.length>n?s.slice(0,n)+`\n…(${s.length-n}자 더 있음)`:s;
function json(v,n=24000){const seen=new WeakSet;let s;try{s=JSON.stringify(v,(k,x)=>typeof x==='function'?'[함수]':x instanceof Set?[...x]:(x&&typeof x==='object'?(seen.has(x)?'[순환]':(seen.add(x),x)):x),1)}catch(e){s=String(v)}return cut(s===undefined?'undefined':s,n)}

// ---- 경로 읽기·쓰기: GD.EL_FX.화.glow, ARTS["id"].forms[0].r ----
function toks(path){const t=[];String(path).replace(/\[\s*(["']?)(.*?)\1\s*\]|([^.[\]]+)/g,(_,q,b,a)=>{t.push(a!=null?a:b)});return t}
function getPath(path){const t=toks(path);if(!/^[A-Za-z_$][\w$]*$/.test(t[0]||''))throw Error('경로는 전역 이름으로 시작해야 한다: '+path);
  let o=gev(t[0]);for(let i=1;i<t.length;i++){if(o==null)throw Error(t.slice(0,i).join('.')+' 가 비어 있다');o=o[t[i]]}return o}
function setPath(path,val){const t=toks(path);if(t.length<2)throw Error('표 안의 값만 바꾼다 (예: GD.EL_FX.화.glow)');
  const o=getPath(t.slice(0,-1).map((x,i)=>i?`[${JSON.stringify(x)}]`:x).join(''));if(o==null||typeof o!=='object')throw Error('객체가 아님: '+path);
  const k=t[t.length-1];if(val===undefined)delete o[k];else o[k]=val}
const dataFile=path=>{const t=toks(path);const tb=t[0]==='GD'?t[1]:t[0];return FXV_DATA[tb]?'data/'+FXV_DATA[tb]:null};

// ---- 함수 바꿔 끼우기 ----
function getFn(name){if(!/^[A-Za-z_$][\w$]*$/.test(name||''))throw Error('함수 이름이 아님: '+name);let f;try{f=gev(name)}catch(e){throw Error(name+' 라는 전역 함수가 없다')}
  if(typeof f!=='function')throw Error(name+' 는 함수가 아니다 ('+typeof f+')');return f}
function putFn(name,f){window.__fxvNew=f;try{gev(name+'=window.__fxvNew')}catch(e){throw Error(name+' 는 바꿔 끼울 수 없는 이름이다 ('+e.message+'). 이 함수를 부르는 쪽 함수를 고쳐라')}finally{delete window.__fxvNew}}
function compile(src){let f;try{f=gev('('+src+'\n)')}catch(e){throw Error('문법 오류: '+e.message)}if(typeof f!=='function')throw Error('함수 식이 아니다');return f}

// 오류 감시: 게임 루프가 잡은 오류(recoverFromError)를 적어 둔다
const ERRS=[];{const rfe=recoverFromError;recoverFromError=e=>{ERRS.push({t:performance.now(),m:String(e&&e.message||e),w:((e&&e.stack||'').split('\n')[1]||'').trim()});if(ERRS.length>50)ERRS.shift();return rfe(e)}}
function clearFx(){try{gev("fx=[];projs=[];if(typeof TFX!=='undefined')TFX=[];if(typeof sched!=='undefined')sched=[]")}catch(e){}}
// 바꾼 직후 시험: 지금 고른 이펙트를 재생하고 몇 프레임을 바로 돌려 본다. 오류면 던진다
function trial(){if(!V.last)return{fx:0};clearFx();F.again();let err=null;
  try{for(let i=0;i<24;i++){update(1/30);draw()}}catch(e){err=e}
  const n=fx.length+projs.length;clearFx();F.again();if(err)throw Error('재생 중 오류: '+err.message+' @ '+(((err.stack||'').split('\n')[1]||'').trim()));return{fx:n}}

// 수정 하나(op)를 적용·되돌리기. fn: 함수 통째, set: 값 하나
function opApply(op){if(op.k==='fn'){op.oldF=op.oldF||getFn(op.name);op.newF=op.newF||compile(op.after);putFn(op.name,op.newF)}else setPath(op.path,op.after===undefined?undefined:JSON.parse(op.after))}
function opRevert(op){if(op.k==='fn')putFn(op.name,op.oldF||compile(op.before));else setPath(op.path,op.before===undefined?undefined:JSON.parse(op.before))}
function guarded(op,cur){opApply(op);try{const r=trial();cur.ops.push(op);return r}catch(e){try{opRevert(op)}catch(_){}throw Error(e.message+' — 이 수정은 되돌렸다')}}

// ---- 수정 기록 ----
const CH=[];let seq=0,busy=null,db=null,sample=null,tools=false;
function fnOp(name,after){const f=getFn(name);return{k:'fn',name,file:defFile(name),before:f.toString(),after,oldF:f}}
function setOp(path,value){let b;try{b=getPath(path)}catch(e){throw e}return{k:'set',path,file:dataFile(path),before:b===undefined?undefined:JSON.stringify(b),after:value===undefined?undefined:JSON.stringify(value)}}

// ---- Claude가 부르는 도구 ----
function mkTools(cur){return[
  {name:'search_code',description:'게임 소스(조각 파일 전부)에서 정규식을 찾는다. "파일:줄 [둘러싼 함수] 내용"을 최대 60줄 돌려준다.',
   inputSchema:{type:'object',properties:{pattern:{type:'string',description:'JavaScript 정규식'}},required:['pattern']},
   execute:({pattern})=>{let re;try{re=new RegExp(String(pattern))}catch(e){throw Error('정규식 오류: '+e.message)}const out=[];
     for(let i=0;i<END&&out.length<60;i++)if(re.test(SRC[i])){const f=fileOf(i+1);if(!f)continue;out.push(`${f[0]}:${f[1]} [${defAt(i+1)||'-'}] ${cut(SRC[i].trim(),220)}`)}
     return out.length?out.join('\n'):'찾지 못함'}},
  {name:'read_file',description:'조각 파일(예: r_fx.js, g_realmfx.js, r_anim.js)의 줄을 번호와 함께 읽는다. 바꿔 끼운 함수는 read_value로 지금 모습을 본다.',
   inputSchema:{type:'object',properties:{file:{type:'string'},from:{type:'number'},to:{type:'number'}},required:['file']},
   execute:({file,from,to})=>{const s=span(String(file));if(!s)throw Error('그런 파일 없음. 파일: '+FXV_FILES.map(x=>x[0]).join(', '));
     const a=Math.max(1,+from||1),b=Math.min(s[1]-s[0],+to||a+399);return cut(SRC.slice(s[0]-2+a,s[0]-1+b).map((l,i)=>(a+i)+'| '+l).join('\n'),28000)}},
  {name:'read_value',description:'전역 이름이나 경로(GD.EL_FX.화, ARTS["id"].forms[0])의 지금 값을 읽는다. 함수면 지금 소스(바꿔 끼운 뒤면 새 소스)를 돌려준다.',
   inputSchema:{type:'object',properties:{path:{type:'string'}},required:['path']},
   execute:({path})=>{const v=getPath(String(path));return typeof v==='function'?cut(v.toString(),28000):json(v)}},
  {name:'patch_function',description:'전역 함수의 지금 소스에서 find(정확히 한 번 나오는 글)를 replace로 바꿔 즉시 끼운다. 가장 작은 수정에 쓴다. 성공하면 이펙트를 다시 재생하고 남은 이펙트 수를 돌려준다. 오류면 자동으로 되돌린다.',
   inputSchema:{type:'object',properties:{name:{type:'string'},find:{type:'string'},replace:{type:'string'}},required:['name','find','replace']},
   execute:({name,find,replace})=>{name=String(name);const src=getFn(name).toString(),c=src.split(String(find)).length-1;
     if(c!==1)throw Error(`find가 ${c}번 나온다. 정확히 한 번 나오는 글로 (read_value로 지금 소스를 보라)`);
     return guarded(fnOp(name,src.replace(String(find),()=>String(replace))),cur)}},
  {name:'replace_function',description:'전역 함수를 새 소스(함수 선언이나 화살표 함수 전체)로 통째 바꿔 즉시 끼운다. 오류면 자동으로 되돌린다.',
   inputSchema:{type:'object',properties:{name:{type:'string'},source:{type:'string'}},required:['name','source']},
   execute:({name,source})=>guarded(fnOp(String(name),String(source)),cur)},
  {name:'set_value',description:'데이터 값 하나를 바꿔 즉시 적용한다. value는 JSON 값. 데이터 표는 GD.<표>... 경로가 저장소 data/*.json 과 바로 맞는다.',
   inputSchema:{type:'object',properties:{path:{type:'string'},value:{}},required:['path','value']},
   execute:({path,value})=>guarded(setOp(String(path),value),cur)},
  {name:'replay',description:'고른 이펙트를 다시 재생하고 1.5초 동안 게임 루프에서 난 오류를 돌려준다.',
   execute:async(_,ctx)=>{const t0=performance.now();clearFx();F.again();await new Promise(r=>setTimeout(r,1500));if(ctx.signal.aborted)return'';
     const e=ERRS.filter(x=>x.t>t0);return e.length?'오류 '+e.length+'번: '+e.slice(0,3).map(x=>x.m+' @ '+x.w).join(' | '):'오류 없음'}},
]}

// ---- 요청문 ----
const CORE=['r_exec.js','r_fx.js','r_elfx.js'];
function target(){const L=V.last;if(!L)return null;let s=`이름: ${L.label}\n재생 코드(뷰어): ${L.fn.toString()}`;const c=L.ctx;
  if(c&&c.art&&ARTS[c.art]){const a=ARTS[c.art];s+=`\n무공 ${c.art} (${a.n}), ${c.form==='ult'?'필살기':c.form+'번 초식'}, 숙련 단계 X.t=${c.tier}${c.el?', 속성 '+c.el:''}\n무공 데이터 ARTS["${c.art}"]: ${json(a,7000)}\n뷰어는 이걸 useArtFx 로 재생한다: ${F.useArtFx.toString()}`}
  return s}
function prompt(req,cur,withSrc){const prev=CH.filter(c=>c.target===cur.target&&c.on&&c!==cur).slice(-4);
  const extra=/동작|자세|모션|몸|손|팔|휘두|모양새|애니/.test(req)?['r_anim.js']:/경지|검기|검사|검강|돌파|환골|금강|반로|호신/.test(cur.target+req)?['g_realmfx.js']:[];
  return `너는 강호윤회록(2D 아이소메트릭 무협 게임, Canvas 2D)의 이펙트·동작을 고치는 도우미다. 지금 '이펙트 뷰어' 페이지 안에서 돌고 있고, 게임의 살아 있는 함수와 데이터를 바로 바꿔 끼운다. 바꾸면 사용자 화면에 곧바로 보인다.

[고른 대상]
${cur.targetInfo}

[사용자 요청]
${req}
${prev.length?`\n[같은 대상에 이미 적용된 수정 (지금 화면에 들어가 있다)]\n${prev.map(c=>'- '+c.req+' → '+(c.summary||'')).join('\n')}\n`:''}
[규칙]
- 요청한 것만 바꾼다. 다른 무공·이펙트도 같은 함수를 쓰면 조건(예: o.t, X.art.id, art id)으로 범위를 좁힌다. 사용자가 '전부'라고 했을 때만 공통으로 바꾼다.
- 2D 캔버스 그림만 쓴다. 3D·WebGL·three.js는 쓰지 않는다. 입자 수를 늘릴 땐 프레임 비용을 생각한다(번개는 짧은 꺾은선 몇 개로).
- 게임 전역 함수만 고친다(뷰어 코드 FXV·useArtFx·play 는 고치지 않는다). 소스에서 'var 이름=' 으로 보이는 것은 원래 const지만 바꿔 끼울 수 있다. 이미 다른 값에 붙잡힌 함수(hook으로 등록된 것)는 바꿔도 안 바뀌니, 그 함수가 부르는 쪽을 고친다.
- 숫자만 바꾸면 되는 건 set_value로 데이터 표(GD.<표>)를 바꾼다. 그 밖엔 patch_function(가장 작게), 크면 replace_function.
- 도구가 오류를 돌려주면 그 수정은 이미 되돌려졌다. 고쳐서 다시 한다. 수정이 끝나면 replay 로 한 번 확인해도 된다.
- 도구를 부르기 전에는 글을 쓰지 않는다. 다 끝나면 마지막에 한국어 1~3문장으로 무엇을 어떻게 바꿨는지만 쓴다(코드는 쓰지 않는다).
${withSrc?`\n[관련 코드 — 파일 전체. 다른 파일은 search_code·read_file 로 본다]\n${[...CORE,...extra].map(f=>`=== ${f} ===\n${fileText(f)}`).join('\n\n')}`:''}`}

// JSON 한 번으로 받는 길 (도구를 못 쓰는 화면)
function promptJson(req,cur){return prompt(req,cur,true).replace(/\[규칙\][\s\S]*?(?=\n\[관련 코드)/,`[규칙]
- 요청한 것만 바꾼다. 2D 캔버스만. 게임 전역 함수와 데이터 표(GD.<표>)만 고친다.
- 답은 JSON 하나: {"summary":"한국어 1~3문장","ops":[{"op":"patch","name":"함수","find":"지금 소스에 정확히 한 번 나오는 글","replace":"바꿀 글"},{"op":"set","path":"GD.EL_FX.화.glow","value":1.2},{"op":"replace","name":"함수","source":"function ...(){...}"}]}
`)}

// ---- 보내기 ----
async function send(){const req=$$('fxai_q').value.trim();if(!req||busy)return;
  if(!V.last){status('먼저 왼쪽에서 고칠 이펙트나 동작을 한 번 재생해 주세요.');return}
  if(!sample){status('이 화면에서는 Claude에게 물을 수 없어요.');return}
  const cur={id:++seq,target:V.last.label,targetInfo:target(),req,ops:[],on:true,kept:false,summary:'',at:Date.now(),replay:{fn:V.last.fn,label:V.last.label,ctx:V.last.ctx}};
  const ctl=new AbortController();busy=ctl;CH.push(cur);paint();status('Claude가 코드를 보는 중… (보통 20초~1분)',true);
  const tier=$$('fxai_tier').value;let text='';
  try{
    if(tools){const SAY={search_code:a=>'코드 찾는 중: '+a.pattern,read_file:a=>a.file+' 읽는 중',read_value:a=>a.path+' 보는 중',patch_function:a=>a.name+' 고치는 중',replace_function:a=>a.name+' 새로 쓰는 중',set_value:a=>a.path+' 값 바꾸는 중',replay:()=>'다시 재생해 확인하는 중'};
      const tl=mkTools(cur).map(t=>({...t,execute:(a,c)=>{status((SAY[t.name]||(()=>t.name))(a||{})+'…',true);return t.execute(a,c)}}));
      const r=await sample(prompt(req,cur,true),{tools:tl,modelTier:tier,signal:ctl.signal,onText:({text:t})=>{text=t;status(t,true)}});text=r.text}
    else{const r=await sample.json(promptJson(req,cur),{modelTier:tier,signal:ctl.signal,cache:false,onText:()=>status('Claude가 수정안을 쓰는 중…',true)});
      text=String(r&&r.summary||'');for(const o of(r&&Array.isArray(r.ops)?r.ops:[]))try{
        if(o.op==='set')guarded(setOp(String(o.path),o.value),cur);
        else if(o.op==='replace')guarded(fnOp(String(o.name),String(o.source)),cur);
        else{const src=getFn(String(o.name)).toString();if(src.split(String(o.find)).length!==2)throw Error(o.name+': 바꿀 자리를 못 찾음');guarded(fnOp(String(o.name),src.replace(String(o.find),()=>String(o.replace))),cur)}
      }catch(e){text+='\n(적용 못 함: '+e.message+')'}}
    cur.summary=text.trim().split(/\n\s*\n/).pop().trim();
    if(!cur.ops.length){CH.splice(CH.indexOf(cur),1);status(cur.summary||'바뀐 것이 없어요.')}
    else{const t0=performance.now();await new Promise(r=>setTimeout(r,2200));const e=ERRS.filter(x=>x.t>t0);
      if(e.length>=3){revert(cur);status('적용했더니 재생 중 오류가 나서 되돌렸어요: '+e[0].m)}else status('적용했어요. 마음에 들면 「게임에 넣기」, 아니면 「되돌리기」.')}
    $$('fxai_q').value='';
  }catch(e){if(cur.ops.length)status((e.code==='cancelled'?'멈췄어요. 그때까지 바뀐 것은 남아 있어요':'중간에 끊겼어요 ('+(e.code||e.message)+'). 그때까지 바뀐 것은 남아 있어요')+'.');
    else{CH.splice(CH.indexOf(cur),1);status(e.code==='cancelled'?'멈췄어요.':e.code==='not_granted'||e.code==='sampling_disabled'?'Claude 사용이 허락되지 않았어요.':e.code==='rate_limited'?'요청이 많아요. 잠시 뒤에 다시 보내 주세요.':'Claude가 답하지 못했어요 ('+(e.code||e.message)+').')}}
  finally{busy=null;paint()}}

// ---- 되돌리기·다시 적용·채택 ----
function revert(c){for(const op of[...c.ops].reverse())try{opRevert(op)}catch(e){console.error(e)}c.on=false;replayOf(c)}
function reapply(c){const done=[];try{for(const op of c.ops){opApply(op);done.push(op)}c.on=true}catch(e){for(const op of done.reverse())try{opRevert(op)}catch(_){}status('다시 적용하지 못했어요: '+e.message)}replayOf(c)}
function replayOf(c){if(c.replay&&c.replay.fn){clearFx();F.play(c.replay.fn,c.replay.label,c.replay.ctx)}}
const plain=op=>({k:op.k,name:op.name||null,path:op.path||null,file:op.file||null,before:op.before===undefined?null:op.before,after:op.after===undefined?null:op.after});
async function keep(c){if(!db){status('저장소에 연결되지 않아 채택을 남길 수 없어요.');return}
  try{if(!c.on)reapply(c);const ref=await db.collection('fxpatch').add({state:'kept',at:c.at,target:c.target,req:c.req,summary:c.summary,ops:c.ops.map(plain)});
    c.kept=true;c.doc=ref.id;status('게임에 넣을 목록에 올렸어요. 채팅에서 "뷰어 수정 반영해 줘"라고 하면 게임에 넣어요.')}
  catch(e){status('남기지 못했어요: '+(e.code||e.message))}paint()}
async function unkeep(c){try{if(db&&c.doc)await db.doc('fxpatch/'+c.doc).delete();c.kept=false;c.doc=null}catch(e){status('지우지 못했어요: '+(e.code||e.message))}paint()}
function undoLast(){const c=[...CH].reverse().find(x=>x.on);if(c){revert(c);paint();status('되돌렸어요: '+c.req)}}

// 다시 열 때: 채택해 두고 아직 게임에 안 들어간 수정을 다시 끼운다 (함수가 이미 같으면 건너뛴다)
async function restore(){if(!db)return;let snap;try{snap=await db.collection('fxpatch').where('state','==','kept').get()}catch(e){return}
  for(const d of snap.docs.slice().sort((a,b)=>(a.data().at||0)-(b.data().at||0))){const x=d.data(),c={id:++seq,target:x.target,req:x.req,summary:x.summary,at:x.at,kept:true,doc:d.id,on:false,ops:[],stale:false};
    try{for(const o of x.ops||[]){const op={k:o.k,name:o.name,path:o.path,file:o.file,before:o.before==null?undefined:o.before,after:o.after==null?undefined:o.after};
      if(op.k==='fn'){const now=getFn(op.name).toString();if(now===op.after){op.oldF=compile(op.before);op.newF=getFn(op.name)}else if(now!==op.before){c.stale=true;continue}}
      c.ops.push(op);opApply(op)}c.on=true}catch(e){c.stale=true}
    CH.push(c)}
  paint()}

// ---- 화면 ----
const css=document.createElement('style');css.textContent=`
#fxai{flex:none;border-top:1px solid #4a3e31;background:#191510;padding:8px 12px 10px;display:flex;flex-direction:column;gap:6px;max-height:52%;min-height:0}
#fxai .hd{display:flex;align-items:center;gap:6px}#fxai .hd b{color:#f3dfa8;font-size:13.5px;flex:1}
#fxai .tg{font-size:12px;color:#c9a96a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#fxai .tg.none{color:#8d806b}
#fxai textarea{font:inherit;color:#f1e8d4;background:#0f0d0a;border:1px solid #4a3e31;border-radius:6px;padding:6px 8px;resize:vertical;min-height:52px;width:100%;box-sizing:border-box}
#fxai textarea:focus{outline:none;border-color:#d8a85a}
#fxai .row{display:flex;gap:5px;align-items:center}#fxai .row select{width:auto;flex:none}#fxai .go{flex:1;background:#6b4b22;border-color:#d8a85a;color:#fff3d6;font-weight:600}
#fxai .st{font-size:12px;color:#d9ccb1;white-space:pre-wrap;max-height:84px;overflow:auto;line-height:1.45}#fxai .st.run{color:#9fc6e8}
#fxai .list{overflow:auto;min-height:0;display:flex;flex-direction:column;gap:5px}
#fxai .ch{border:1px solid #3a3128;border-radius:6px;padding:6px 8px;background:#211b15}#fxai .ch.off{opacity:.55}#fxai .ch.kept{border-color:#7d9a4f}
#fxai .ch p{margin:0 0 3px;font-size:12px}#fxai .ch .q{color:#f3dfa8}#fxai .ch .s{color:#b8ab92}#fxai .ch .w{color:#8d806b;font-size:11px}
#fxai .ch .bt{display:flex;gap:4px;flex-wrap:wrap}#fxai .ch button{min-height:26px;padding:3px 8px;font-size:12px}
#fxai .bd{display:flex;flex-direction:column;gap:6px;min-height:0}#fxai.shut .bd{display:none}#fxai.shut{padding-bottom:8px}
@media (max-width:760px){#fxai{max-height:60%}#fxai textarea{min-height:40px}}`;
document.head.appendChild(css);
const el=document.createElement('div');el.id='fxai';F.box.appendChild(el);
const narrow=innerWidth<760;if(narrow)el.classList.add('shut');   // 휴대폰은 접어 두고 시작 (이펙트 단추 자리를 남긴다)
el.innerHTML=`<div class="hd"><b>✦ Claude에게 고쳐 달라기</b><button type="button" id="fxai_undo" title="가장 최근 수정 되돌리기">되돌리기</button><button type="button" id="fxai_fold" aria-label="접기·펴기">${narrow?'펴기':'접기'}</button></div>
  <div class="bd">
  <div class="tg" id="fxai_tg"></div>
  <textarea id="fxai_q" rows="2" placeholder="예: 이 검기 반달을 더 크고 날카롭게, 끝에 불꽃이 튀게"></textarea>
  <div class="row"><select id="fxai_tier" title="Claude 모델"><option value="quick">빠름</option><option value="default" selected>보통</option><option value="complex">정밀</option></select>
    <button type="button" class="go" id="fxai_go">고쳐 줘</button><button type="button" id="fxai_stop" hidden>멈춤</button></div>
  <div class="st" id="fxai_st"></div><div class="list" id="fxai_list"></div></div>`;
function status(t,run){const s=$$('fxai_st');s.textContent=t||'';s.classList.toggle('run',!!run);s.scrollTop=s.scrollHeight}
function paint(){const tg=$$('fxai_tg');tg.textContent=V.last?'대상: '+V.last.label:'대상 없음 — 왼쪽에서 이펙트를 재생해 고르세요';tg.classList.toggle('none',!V.last);
  $$('fxai_go').disabled=!!busy||!sample;$$('fxai_stop').hidden=!busy;$$('fxai_undo').disabled=!CH.some(c=>c.on);
  const kept=CH.filter(c=>c.kept).length;
  $$('fxai_list').innerHTML=(kept?`<p class="dim" style="margin:0;color:#a9c27a;font-size:11.5px">게임에 넣을 수정 ${kept}개 — 채팅에서 "뷰어 수정 반영해 줘"라고 하면 게임에 넣어요.</p>`:'')+
    [...CH].reverse().map(c=>`<div class="ch${c.on?'':' off'}${c.kept?' kept':''}"><p class="q">${esc(c.req)}</p><p class="w">${esc(c.target)} · ${c.ops.map(o=>esc(o.k==='fn'?o.name+'()':o.path)).join(', ')||'바뀐 것 없음'}${c.stale?' · 게임 코드가 바뀌어 일부 못 끼움':''}</p>${c.summary?`<p class="s">${esc(c.summary)}</p>`:''}
      <div class="bt">${c.ops.length?(c.on?`<button type="button" data-x="off:${c.id}">되돌리기</button>`:`<button type="button" data-x="on:${c.id}">다시 적용</button>`):''}
      ${c.replay?`<button type="button" data-x="see:${c.id}">보기</button>`:''}
      ${c.ops.length?(c.kept?`<button type="button" data-x="unkeep:${c.id}">채택 취소</button>`:`<button type="button" data-x="keep:${c.id}"${db?'':' disabled'}>게임에 넣기</button>`):''}</div></div>`).join('')}
el.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
  if(b.id==='fxai_go')return send();if(b.id==='fxai_stop'){busy&&busy.abort();return}if(b.id==='fxai_undo')return undoLast();
  if(b.id==='fxai_fold'){el.classList.toggle('shut');b.textContent=el.classList.contains('shut')?'펴기':'접기';return}
  const[k,id]=(b.dataset.x||'').split(':'),c=CH.find(x=>x.id===+id);if(!c)return;
  if(k==='off'){revert(c);paint()}else if(k==='on'){reapply(c);paint()}else if(k==='see')replayOf(c);else if(k==='keep')keep(c);else if(k==='unkeep')unkeep(c)});
$$('fxai_q').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();send()}});
// 재생할 때마다 대상 줄을 고친다
F.box.addEventListener('click',()=>setTimeout(paint,0));
paint();status('왼쪽에서 이펙트나 동작을 재생해 고른 뒤, 바꾸고 싶은 점을 적어 보내세요. 바뀐 모습이 곧바로 재생돼요.');

// ---- 능력 연결: sample(Claude에게 묻기), db(채택한 수정 남기기) ----
(async()=>{if(!window.claude||!claude.use){status('이 화면은 claude.ai 밖이라 Claude에게 물을 수 없어요. 게시된 뷰어에서 열어 주세요.');paint();return}
  const [s,d]=await Promise.all([claude.use('sample').catch(()=>null),claude.use('db').catch(()=>null)]);
  sample=s;db=d;if(sample){try{const l=await sample.limits();tools=!!(l&&l.tools)}catch(e){tools=false}}
  else status('이 화면에서는 Claude에게 물을 수 없어요.');
  await new Promise(r=>setTimeout(r,300));await restore();paint()})();
window.FXAI={CH,ERRS,send,revert,reapply,mkTools,prompt,fileText,defFile,trial,get tools(){return tools},set tools(v){tools=v},set sample(v){sample=v;paint()},set db(v){db=v;paint()}};
})();

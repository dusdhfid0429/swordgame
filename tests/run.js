// 테스트 러너: tests/t*.js 를 몇 개씩 나란히 돌리고, 하나라도 실패하면 exit 1.
// 실패로 치는 것: 'FAIL '로 시작하는 줄, 'ERRORS' 줄(페이지 오류), 0이 아닌 종료 코드, 시간 초과.
// 쓰는 법: node tests/run.js [-j 4] [-t 300] [이름 조각...]   예) node tests/run.js realm balance
const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const args=process.argv.slice(2),opt=(k,d)=>{const i=args.indexOf(k);if(i<0)return d;const v=+args[i+1];args.splice(i,2);return v};
const J=opt('-j',Math.max(1,Math.min(4,require('os').cpus().length))),T=opt('-t',300)*1000;
const all=fs.readdirSync(__dirname).filter(f=>/^t\d+.*\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)));
const files=args.length?all.filter(f=>args.some(a=>f.includes(a))):all;
if(!files.length){console.error('맞는 테스트가 없습니다: '+args.join(' '));process.exit(1)}
if(!fs.existsSync(path.join(__dirname,'../dist/gangho.html'))){console.error('dist/gangho.html 이 없습니다. 먼저 python3 build.py');process.exit(1)}
fs.mkdirSync(path.join(__dirname,'shots'),{recursive:true});
function run(f){return new Promise(res=>{const t0=Date.now();let out='',timedOut=false;
  const c=spawn(process.execPath,[path.join(__dirname,f)],{env:process.env});
  c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>out+=d);
  const tm=setTimeout(()=>{timedOut=true;c.kill('SIGKILL')},T);
  c.on('close',code=>{clearTimeout(tm);const lines=out.split('\n');
    const fails=lines.filter(l=>l.startsWith('FAIL ')),pass=lines.filter(l=>l.startsWith('PASS ')).length,errs=lines.some(l=>l.trim()==='ERRORS');
    const ok=!timedOut&&code===0&&!fails.length&&!errs;
    res({f,ok,pass,fails,errs,code,timedOut,out,s:((Date.now()-t0)/1000).toFixed(0)})})})}
(async()=>{const q=[...files],res=[];
  await Promise.all(Array.from({length:Math.min(J,q.length)},async()=>{while(q.length){const r=await run(q.shift());res.push(r);
    console.log(`${r.ok?'ok  ':'FAIL'} ${r.f} (${r.pass} 통과, ${r.s}초)${r.timedOut?' 시간 초과':''}${r.code&&!r.timedOut?' 종료 코드 '+r.code:''}`);
    if(!r.ok){for(const l of r.fails)console.log('     '+l);if(r.errs||r.code||r.timedOut)console.log(r.out.split('\n').slice(-15).map(l=>'     | '+l).join('\n'))}}}));
  const bad=res.filter(r=>!r.ok);
  // GitHub Actions: 실패를 주석(annotation)으로 남겨 로그를 열지 않고도 보이게 한다
  if(process.env.GITHUB_ACTIONS)for(const r of bad){const why=[...r.fails,...(r.errs||r.code||r.timedOut?r.out.split('\n').filter(l=>l.trim()).slice(-6):[])].join('%0A').slice(0,3000);
    console.log(`::error file=tests/${r.f},title=${r.f} 실패::${why}`)}
  console.log(`\n${res.length}개 중 ${res.length-bad.length}개 통과${bad.length?', 실패: '+bad.map(r=>r.f).join(' '):''}`);
  process.exit(bad.length?1:0)})();

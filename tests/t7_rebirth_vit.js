// 윤회로 물려받은 활력: 다섯 몫으로 나눠 생일마다 한 몫씩. 가득 차면 다음 생일로 넘긴다.
const {chromium}=require(process.env.PWPATH||'playwright');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../dist/gangho.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>{localStorage.clear();G.bonusVit=103});await p.click('[data-s="new"]');await p.click('[data-s="start"]');await p.waitForTimeout(400);
  const ok=(name,v)=>console.log((v?'PASS ':'FAIL ')+name);
  const r=await p.evaluate(()=>{const o={start:P.vit,inst:[...P.vitInst],got:[]};
    for(let i=0;i<5;i++){P.vit=0;P.age=14+i;newYear();o.got.push(P.vit)}
    P.vit=0;P.age=19;newYear();o.after=P.vit;
    // 가득 찬 상태: 못 받은 몫은 다음 생일로
    P.vitInst=[50];P.vitCarry=0;P.vit=maxVit()-10;P.age=20;newYear();o.carry=P.vitCarry;o.full=P.vit===maxVit();
    P.vit=0;P.age=21;newYear();o.carryPaid=P.vit;o.carryLeft=P.vitCarry;return o});
  ok(`시작 활력은 신분 몫만 (${r.start})`,r.start===40);
  ok(`103을 다섯 몫으로 (${r.inst})`,r.inst.join()==='21,21,21,20,20');
  ok(`생일마다 한 몫씩 (${r.got})`,r.got.join()==='21,21,21,20,20'&&r.after===0);
  ok(`가득 차면 남는 몫을 넘긴다 (${r.carry})`,r.carry===40&&r.full);
  ok(`다음 생일에 넘긴 몫을 받는다 (${r.carryPaid})`,r.carryPaid===40&&r.carryLeft===0);
  console.log(errs.length?'ERRORS\n'+errs.join('\n'):'no console errors');await b.close();
})();

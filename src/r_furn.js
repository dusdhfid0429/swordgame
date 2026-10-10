// ---------- 전각 안 가구: 용도에 맞게 (2026-10-10 사용자: 건물 안에 용도에 어울리는 가구) ----------
// 한 칸짜리 물건을 그린다. 종류: table 탁자, jar 술독·약항아리, counter 계산대, forge 화로, anvil 모루, shelf 서가,
// cabinet 약장, bolts 포목 선반, chest 궤짝, rack 병기 걸이, altar 제단·향로, bed 침상, desk 서탁, seat 의자, kettle 가마솥
const FURN={table:1,jar:1,counter:1,forge:1,anvil:1,shelf:1,cabinet:1,bolts:1,chest:1,rack:1,altar:1,bed:1,desk:1,seat:1,kettle:1};
// 칸 (i,j) 안의 작은 상자: x0..x1, y0..y1 은 칸 안 비율, h 높이
function fbox(i,j,x0,y0,x1,y1,h,top,front,side){const a=scr(i+x0,j+y1),b=scr(i+x1,j+y1),c=scr(i+x1,j+y0),d=scr(i+x0,j+y0);
  quad([a,b,up(b,h),up(a,h)],front);quad([b,c,up(c,h),up(b,h)],side);quad([up(d,h),up(c,h),up(b,h),up(a,h)],top)}
function fshadow(i,j,rx=12,ry=6){const p=scr(i+.5,j+.5);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(p[0],p[1],rx,ry,0,0,7);ctx.fill()}
function drawFurn(kind,i,j,mg){const r=rng(i*31+j*17+kind.length),p=scr(i+.5,j+.5),dk=mg;
  const wood=dk?['#4a3028','#3a2420','#2e1c18']:['#8a6a44','#6e5234','#4e3824'];   // 윗면·앞면·옆면
  switch(kind){
  case'table':fshadow(i,j);fbox(i,j,.15,.2,.85,.8,14,wood[0],wood[1],wood[2]);
    for(const[dx,dy]of[[.1,.5],[.9,.5]]){const q=scr(i+dx,j+dy);ctx.fillStyle=wood[1];ctx.beginPath();ctx.ellipse(q[0],q[1]-4,5,2.5,0,0,7);ctx.fill();ctx.fillStyle=wood[0];ctx.beginPath();ctx.ellipse(q[0],q[1]-8,5,2.5,0,0,7);ctx.fill()}
    {const t=scr(i+.5,j+.5,14);ctx.fillStyle='#d8d0b8';ctx.beginPath();ctx.ellipse(t[0]-3,t[1]-1,4,2,0,0,7);ctx.fill();ctx.fillStyle='#b8402a';ctx.beginPath();ctx.ellipse(t[0]+5,t[1]+1,3,1.6,0,0,7);ctx.fill()}break;
  case'jar':{fshadow(i,j,9,4.5);const g=ctx.createLinearGradient(p[0]-9,0,p[0]+9,0);g.addColorStop(0,'#7a5a3a');g.addColorStop(.5,'#4e3420');g.addColorStop(1,'#2e1c10');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(p[0]-6,p[1]);ctx.bezierCurveTo(p[0]-13,p[1]-8,p[0]-12,p[1]-20,p[0]-5,p[1]-24);ctx.lineTo(p[0]+5,p[1]-24);ctx.bezierCurveTo(p[0]+12,p[1]-20,p[0]+13,p[1]-8,p[0]+6,p[1]);ctx.closePath();ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#1e120a';ctx.beginPath();ctx.ellipse(p[0],p[1]-24,5,2.2,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,230,200,.18)';ctx.fillRect(p[0]-7,p[1]-18,2,10);break}
  case'counter':fshadow(i,j,16,7);fbox(i,j,0,.3,1,.75,22,dk?'#3a2824':'#a07a4c',wood[1],wood[2]);
    {const a=scr(i+.1,j+.75,22),b=scr(i+.9,j+.75,22);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a[0],a[1]+3);ctx.lineTo(b[0],b[1]+3);ctx.stroke()}
    {const q=scr(i+.6,j+.5,22);ctx.fillStyle='#c9a14a';ctx.fillRect(q[0]-4,q[1]-6,8,5);ctx.fillStyle='#2a2a2a';ctx.fillRect(q[0]-10,q[1]-3,5,3)}break;
  case'forge':{fshadow(i,j,15,7);fbox(i,j,.1,.1,.9,.9,20,'#5a5650','#6e6a60','#4e4a44');const t=scr(i+.5,j+.5,20),k=.6+.4*Math.sin(time*7+i);
    ctx.fillStyle=`rgba(255,${120+k*80},30,.95)`;ctx.beginPath();ctx.ellipse(t[0],t[1],9,4.5,0,0,7);ctx.fill();ctx.fillStyle=`rgba(255,240,150,${.5+k*.4})`;ctx.beginPath();ctx.ellipse(t[0]-2,t[1]-1,4,2,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(60,60,60,.25)';for(let k2=0;k2<3;k2++){const q=t[1]-8-k2*8-((time*18+k2*5)%8);ctx.beginPath();ctx.ellipse(t[0]+Math.sin(time*2+k2)*3,q,4+k2,2.5,0,0,7);ctx.fill()}
    {const q=scr(i+.85,j+.85);ctx.fillStyle='#6a4a2a';ctx.fillRect(q[0]-3,q[1]-10,6,10);ctx.fillStyle='#c0c0c0';ctx.fillRect(q[0]-6,q[1]-14,12,4)}break}
  case'anvil':{fshadow(i,j,10,5);fbox(i,j,.25,.25,.75,.75,8,wood[0],wood[1],wood[2]);const t=scr(i+.5,j+.5,8);
    ctx.fillStyle='#3a3c40';ctx.beginPath();ctx.moveTo(t[0]-12,t[1]-4);ctx.lineTo(t[0]+10,t[1]-4);ctx.lineTo(t[0]+14,t[1]-9);ctx.lineTo(t[0]+8,t[1]-12);ctx.lineTo(t[0]-8,t[1]-12);ctx.lineTo(t[0]-14,t[1]-8);ctx.closePath();ctx.fill();ctx.strokeStyle=OUT;ctx.stroke();
    ctx.fillStyle='#8a8c90';ctx.fillRect(t[0]-8,t[1]-13,16,2);ctx.fillStyle='#2a2c30';ctx.fillRect(t[0]-6,t[1]-4,12,4);break}
  case'shelf':case'cabinet':case'bolts':{fshadow(i,j,14,6);const H=kind==='cabinet'?36:40;fbox(i,j,.05,.3,.95,.8,H,wood[0],wood[1],wood[2]);
    const a=scr(i+.05,j+.8),b=scr(i+.95,j+.8);
    if(kind==='shelf'){for(let s=1;s<4;s++){const y=H*s/4;ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a[0]+1,a[1]-y);ctx.lineTo(b[0]-1,b[1]-y);ctx.stroke();
        for(let k=0;k<6;k++){const t=.08+k*.15,q=lerp2(a,b,t);ctx.fillStyle=['#8a3a2a','#2f5f8f','#c9a14a','#3f6f4f','#6a4a7a','#d8d0b8'][(k+s+i)%6];ctx.fillRect(q[0]-2,q[1]-y+1,4,H/4-3)}}}
    else if(kind==='cabinet'){for(let s=0;s<4;s++)for(let k=0;k<3;k++){const q=lerp2(a,b,.17+k*.33),y=H*(s+.5)/4;ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.strokeRect(q[0]-6,q[1]-y-3,12,6);ctx.fillStyle='#c9a14a';ctx.fillRect(q[0]-1,q[1]-y-1,2,2)}}
    else{for(let s=0;s<5;s++){const y=H*(s+.5)/5,col=['#a3271c','#2f5f8f','#c9a14a','#3f7f4f','#f0e6cc','#6a4a7a'][(s+i*2+j)%6];ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a[0]+2,a[1]-y+3);ctx.lineTo(b[0]-2,b[1]-y+3);ctx.lineTo(b[0]-2,b[1]-y-3);ctx.lineTo(a[0]+2,a[1]-y-3);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(b[0]-2,b[1]-y,2,3,0,0,7);ctx.fill()}}
    break}
  case'chest':fshadow(i,j,12,6);fbox(i,j,.15,.25,.85,.8,14,'#5a3a22','#4a2e1a','#3a2212');
    {const a=scr(i+.15,j+.8,7),b=scr(i+.85,j+.8,7);ctx.strokeStyle='#8a8c90';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();const q=lerp2(a,b,.5);ctx.fillStyle='#c9a14a';ctx.fillRect(q[0]-3,q[1]-3,6,6)}break;
  case'rack':{fshadow(i,j,12,5);const a=scr(i+.15,j+.5),b=scr(i+.85,j+.5);seg([a,up(a,40)],3,wood[1]);seg([b,up(b,40)],3,wood[1]);seg([up(a,38),up(b,38)],3,wood[0]);seg([up(a,10),up(b,10)],2,wood[0]);
    for(let k=0;k<4;k++){const q=lerp2(a,b,.2+k*.2),sw=k%2;ctx.strokeStyle=sw?'#c0c4c8':'#8a6a44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q[0],q[1]-6);ctx.lineTo(q[0]+(k-1.5)*1.5,q[1]-(sw?34:46));ctx.stroke();if(!sw){ctx.fillStyle='#c0c4c8';ctx.beginPath();ctx.moveTo(q[0]+(k-1.5)*1.5-2,q[1]-46);ctx.lineTo(q[0]+(k-1.5)*1.5+2,q[1]-46);ctx.lineTo(q[0]+(k-1.5)*1.5,q[1]-54);ctx.closePath();ctx.fill()}else{ctx.fillStyle='#c9a14a';ctx.fillRect(q[0]-3,q[1]-12,6,3)}}break}
  case'altar':{fshadow(i,j,15,7);fbox(i,j,.05,.3,.95,.8,24,dk?'#3a1414':'#7a2a1c',dk?'#2a1010':'#5e2014',dk?'#1e0c0c':'#4a1810');const t=scr(i+.5,j+.55,24);
    ctx.fillStyle='#c9a14a';ctx.beginPath();ctx.ellipse(t[0],t[1]-4,7,3.5,0,0,7);ctx.fill();ctx.fillStyle='#8a6a1e';ctx.beginPath();ctx.ellipse(t[0],t[1]-1,7,3.5,0,0,7);ctx.fill();ctx.fillStyle='#c9a14a';ctx.fillRect(t[0]-7,t[1]-4,14,3);
    for(let k=-1;k<=1;k++){ctx.strokeStyle='#6a4a2a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(t[0]+k*3,t[1]-5);ctx.lineTo(t[0]+k*3,t[1]-16);ctx.stroke();ctx.fillStyle='rgba(255,120,60,.9)';ctx.fillRect(t[0]+k*3-.7,t[1]-17,1.4,1.4);
      ctx.strokeStyle='rgba(220,220,220,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(t[0]+k*3,t[1]-17);ctx.quadraticCurveTo(t[0]+k*3+Math.sin(time*1.5+k)*4,t[1]-26,t[0]+k*3+Math.sin(time+k)*3,t[1]-34);ctx.stroke()}
    for(const dx of[.2,.8]){const q=scr(i+dx,j+.3,24);ctx.fillStyle='#e8d8a0';ctx.fillRect(q[0]-1.5,q[1]-14,3,14);ctx.fillStyle='#ffb050';ctx.beginPath();ctx.ellipse(q[0],q[1]-16,2,3,0,0,7);ctx.fill()}break}
  case'bed':fshadow(i,j,15,7);fbox(i,j,.05,.1,.95,.9,12,'#e8e0cc',wood[1],wood[2]);
    {const a=scr(i+.15,j+.5,12);ctx.fillStyle='#d8c8a8';ctx.beginPath();ctx.ellipse(a[0]+2,a[1]-2,7,3.5,-.5,0,7);ctx.fill();const b=scr(i+.6,j+.55,13);ctx.fillStyle='#8a3a2a';ctx.beginPath();ctx.moveTo(b[0]-10,b[1]);ctx.lineTo(b[0]+10,b[1]-5);ctx.lineTo(b[0]+12,b[1]+1);ctx.lineTo(b[0]-8,b[1]+6);ctx.closePath();ctx.fill()}break;
  case'desk':fshadow(i,j,13,6);fbox(i,j,.1,.3,.9,.7,16,wood[0],wood[1],wood[2]);
    {const t=scr(i+.45,j+.5,16);ctx.fillStyle='#f0e8d0';ctx.beginPath();ctx.moveTo(t[0]-8,t[1]);ctx.lineTo(t[0]+2,t[1]-5);ctx.lineTo(t[0]+8,t[1]-2);ctx.lineTo(t[0]-2,t[1]+3);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.8;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(t[0]-5+k*2,t[1]+1-k);ctx.lineTo(t[0]+k*2,t[1]-2-k);ctx.stroke()}
      const q=scr(i+.8,j+.4,16);ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(q[0],q[1],3,1.8,0,0,7);ctx.fill();ctx.strokeStyle='#5a3a22';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q[0]+1,q[1]-1);ctx.lineTo(q[0]+4,q[1]-9);ctx.stroke()}break;
  case'seat':fshadow(i,j,10,5);fbox(i,j,.25,.35,.75,.7,18,dk?'#5e2420':'#8a3a2a',wood[1],wood[2]);
    {const a=scr(i+.25,j+.35,18),b=scr(i+.75,j+.35,18);quad([a,b,up(b,22),up(a,22)],dk?'#4a1a18':'#6e2e22');const t=scr(i+.5,j+.5,18);ctx.fillStyle='#c9a14a';ctx.beginPath();ctx.ellipse(t[0],t[1]+1,6,3,0,0,7);ctx.fill()}break;
  case'kettle':{fshadow(i,j,12,6);fbox(i,j,.15,.15,.85,.85,12,'#5a5650','#6e6a60','#4e4a44');const t=scr(i+.5,j+.5,12);ctx.fillStyle='#2a2c30';ctx.beginPath();ctx.ellipse(t[0],t[1]-2,10,5,0,0,7);ctx.fill();ctx.fillStyle='#3e4044';ctx.beginPath();ctx.ellipse(t[0],t[1]-8,11,5.5,0,0,7);ctx.fill();ctx.fillStyle='#1a1c20';ctx.beginPath();ctx.ellipse(t[0],t[1]-9,7,3.2,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(230,230,230,.3)';for(let k=0;k<3;k++){const y=t[1]-14-k*7-((time*14+k*4)%7);ctx.beginPath();ctx.ellipse(t[0]+Math.sin(time*2+k)*3,y,3+k,2,0,0,7);ctx.fill()}break}
  }}

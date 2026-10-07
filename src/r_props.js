// ---------- pre-rendered props ----------
function mkTree(seed){
  const c=document.createElement('canvas');c.width=120;c.height=150;const g=c.getContext('2d'),r=rng(seed);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(60,138,40,13,0,0,7);g.fill();
  const tg=g.createLinearGradient(52,0,68,0);tg.addColorStop(0,'#8a6a4a');tg.addColorStop(1,'#3a2a1c');
  g.fillStyle=tg;g.beginPath();g.moveTo(52,140);g.lineTo(56,74);g.lineTo(64,74);g.lineTo(69,140);g.closePath();g.fill();
  g.strokeStyle='#1e140c';g.lineWidth=1;g.stroke();
  const blobs=[];
  for(let i=0;i<95;i++){const a=r()*Math.PI*2,d=Math.sqrt(r());const x=60+Math.cos(a)*d*44,y=62+Math.sin(a)*d*36-r()*8;
    blobs.push({x,y,rad:6+r()*8,l:Math.max(0,Math.min(1,.6-(x-60)/100-(y-62)/70+(r()-.5)*.35)),h:78+r()*28})}
  blobs.sort((a,b)=>a.l-b.l);
  for(const o of blobs){const gr=g.createRadialGradient(o.x-o.rad*.35,o.y-o.rad*.35,1,o.x,o.y,o.rad);
    gr.addColorStop(0,`hsl(${o.h},${36+o.l*18}%,${24+o.l*30}%)`);gr.addColorStop(1,`hsl(${o.h+8},34%,${12+o.l*8}%)`);
    g.fillStyle=gr;g.beginPath();g.arc(o.x,o.y,o.rad,0,7);g.fill()}
  return c;
}
// Chinese pine: crooked trunk with flat, cloud-like needle pads
function mkPine(seed){
  const c=document.createElement('canvas');c.width=130;c.height=175;const g=c.getContext('2d'),r=rng(seed);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(64,163,36,12,0,0,7);g.fill();
  g.lineCap='round';const tr=[[64,166],[60,130],[68,96],[58,62],[64,30]];
  for(const[w,col]of[[11,'#24160e'],[8,'#7a4a2e']]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();tr.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke()}
  g.strokeStyle='rgba(255,220,180,.25)';g.lineWidth=2;g.beginPath();tr.forEach((p,i)=>i?g.lineTo(p[0]-2,p[1]):g.moveTo(p[0]-2,p[1]));g.stroke();
  const pads=[[64,30,34,12],[40,62,30,10],[88,80,32,11],[46,104,28,9],[82,52,22,8]];
  for(const[x,y,w]of pads){g.strokeStyle='#3a2416';g.lineWidth=3;g.beginPath();g.moveTo(64,y+6);g.lineTo(x,y+4);g.stroke()}
  for(const[x,y,w,h]of pads){for(let i=0;i<70;i++){const a=r()*Math.PI*2,d=Math.sqrt(r()),px=x+Math.cos(a)*d*w,py=y+Math.sin(a)*d*h,l=Math.max(0,Math.min(1,.65-(py-y)/h*.6-(px-x)/w*.2+(r()-.5)*.3));
    g.fillStyle=`hsl(${130+r()*20},${28+l*14}%,${14+l*28}%)`;g.beginPath();g.ellipse(px,py,4+r()*4,2+r()*2,0,0,7);g.fill()}}
  return c;
}
function mkBamboo(seed){
  const c=document.createElement('canvas');c.width=100;c.height=170;const g=c.getContext('2d'),r=rng(seed);
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(50,158,32,10,0,0,7);g.fill();
  const stalks=[];for(let i=0;i<7;i++)stalks.push({x:24+r()*52,h:110+r()*45,bend:(r()-.5)*14,l:r()});
  stalks.sort((a,b)=>a.l-b.l);
  for(const s of stalks){const top=160-s.h;
    for(let y=160;y>top;y-=13){const t=(160-y)/s.h,x=s.x+s.bend*t*t,x2=s.x+s.bend*Math.pow((160-y+12)/s.h,2);
      g.strokeStyle=`hsl(${85+s.l*15},${40+s.l*15}%,${30+s.l*18}%)`;g.lineWidth=3.2;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y-12);g.stroke();
      g.strokeStyle='rgba(30,50,20,.8)';g.lineWidth=3.6;g.beginPath();g.moveTo(x2-2,y-12);g.lineTo(x2+2,y-12);g.stroke()}
    for(let k=0;k<14;k++){const y=top+r()*s.h*.6,t=(160-y)/s.h,x=s.x+s.bend*t*t,dir=r()<.5?-1:1;
      g.strokeStyle=`hsla(${95+r()*20},45%,${22+r()*24}%,.9)`;g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dir*8,y-3,x+dir*(14+r()*6),y+3+r()*4);g.stroke()}}
  return c;
}
function mkRock(seed){
  const c=document.createElement('canvas');c.width=60;c.height=44;const g=c.getContext('2d'),r=rng(seed);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(30,34,22,8,0,0,7);g.fill();
  const pts=[];for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;pts.push([30+Math.cos(a)*(16+r()*6),34+Math.sin(a)*(18+r()*10)])}
  const gr=g.createLinearGradient(10,10,50,38);gr.addColorStop(0,'#c2bdb0');gr.addColorStop(.6,'#7d796f');gr.addColorStop(1,'#3a3833');
  g.fillStyle=gr;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();
  g.strokeStyle='#22201c';g.stroke();
  for(let i=0;i<40;i++){g.fillStyle=`rgba(${r()<.5?0:255},${r()<.5?0:255},${r()<.5?0:255},.08)`;g.fillRect(12+r()*36,14+r()*20,2,2)}
  g.fillStyle='rgba(100,130,60,.55)';g.beginPath();g.ellipse(22,18,7,3,-.3,0,7);g.fill();
  return c;
}
const TREES=[mkTree(11),mkTree(23),mkTree(47)],PINES=[mkPine(3),mkPine(19)],BAMBOO=[mkBamboo(2),mkBamboo(8),mkBamboo(31)],ROCKS=[mkRock(5),mkRock(9)];
const SPRITES={tree:TREES,pine:PINES,bamboo:BAMBOO,rock:ROCKS};

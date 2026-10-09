// ================= palettes for the cast =================
Object.assign(PAL,{
  archer:{...PAL.bandit,robe:['#6e7a4c','#33391f'],robeB:'#424a28',band:'#4a5a2a',weapon:'bow',anim:'punch'},
  chief:{...PAL.bandit,robe:['#6a3a2a','#2e140c'],robeB:'#40200f',armor:1,beard:1,mask:null,band:'#b8291f',short:0,weapon:'big'},
  cultist:{skin:['#e0c0a0','#8d6444'],hair:'#0e0c0b',robe:['#5a1414','#200606'],robeB:'#3a0c0c',inner:'#111',trim:'#c9a14a',sash:'#111',pants:'#1a1010',boot:'#100a08',mask:'#2a0a0a',weapon:'sword',tail:1},
  elder:{skin:['#e0c0a0','#8d6444'],hair:'#d8d4cc',robe:['#7a1010','#2a0404'],robeB:'#4a0808',inner:'#111',trim:'#e0b050',sash:'#e0b050',pants:'#1a1010',boot:'#100a08',beard:1,cape:'#2a0404',weapon:'staff',anim:'swing'},
  jiangshi:{skin:['#b8c4b0','#6a7a66'],hair:'#101010',robe:['#3a4a6a','#141c2c'],robeB:'#222c44',inner:'#7a1612',trim:'#c9a14a',sash:'#7a1612',pants:'#141c2c',boot:'#0c0c10',weapon:'fist',anim:'punch'},
  villager:{skin:['#ecc9a6','#a07850'],hair:'#2a1c12',robe:['#b9a888','#6e5e44'],robeB:'#7e6c50',inner:'#ddd',trim:'#7e6c50',sash:'#5a4a38',pants:'#5e523f',boot:'#3a2a1a',short:1,weapon:'none',tail:1},
  keeper:{skin:['#ecc9a6','#a07850'],hair:'#1a1210',robe:['#4a5a7a','#1e2638'],robeB:'#2c3650',inner:'#d8d0c0',trim:'#c9a14a',sash:'#8a2a1e',pants:'#2a2f3d',boot:'#2a1d14',weapon:'none',beard:1},
  smithy:{skin:['#d8a882','#7d5638'],hair:'#14100e',robe:['#5a4a3a','#221a12'],robeB:'#3a2e22',inner:'#8a6a4a',trim:'#2a1a10',sash:'#2a1a10',pants:'#3a2e22',boot:'#1a120a',short:1,weapon:'staff',beard:1},
  taoist:{skin:['#f2d6b6','#b88a64'],hair:'#d8d4cc',robe:['#e8e8f0','#9aa0b0'],robeB:'#8a90a0',inner:'#2b416b',trim:'#2b416b',sash:'#2b416b',pants:'#2a2f3d',boot:'#2a1d14',beard:1,weapon:'sword',tail:1},
  matron:{skin:['#f2d6b6','#b88a64'],hair:'#3a3030',robe:['#c24a6a','#6a1a30'],robeB:'#8a2a44',inner:'#f0d080',trim:'#f0d080',sash:'#f0d080',pants:'#5a1a2a',boot:'#2a1d14',weapon:'none',hairband:'#f0d080'},
  judge:{skin:['#e8c4a0','#9a7050'],hair:'#14100e',robe:['#2a2a2a','#0e0e0e'],robeB:'#1a1a1a',inner:'#a3271c',trim:'#c9a14a',sash:'#a3271c',pants:'#1a1614',boot:'#120d09',beard:1,weapon:'none'},
  disciple:{...PAL.hero,robe:['#d8e4d8','#8aa08a'],robeB:'#7a907a',sash:'#2e6a3e',inner:'#2e6a3e',hairband:'#2e6a3e',weapon:'sword',jade:0},
  duelist:{...PAL.hero,robe:['#3a3a4a','#121218'],robeB:'#22222c',sash:'#8a8aa0',inner:'#8a8aa0',hairband:'#e0e0f0',weapon:'sword',jade:0},
  tang:{...PAL.hero,robe:['#2e4a3a','#0e1a12'],robeB:'#1a2c20',sash:'#6abf7a',inner:'#6abf7a',hairband:'#6abf7a',weapon:'bow',anim:'punch',jade:0}});
PAL.spouse={...PAL.matron,robe:['#e8d0e0','#a07890'],robeB:'#906878',inner:'#c24a6a',trim:'#c24a6a',sash:'#c24a6a',hairband:'#c24a6a'};
// ================= props: tents, notice board, house lots =================
function drawTent(t){
  const x=t.x+.05,y=t.y+.05,X1=t.x+.95,Y1=t.y+.95,top=scr(t.x+.5,t.y+.5,40);
  quad([scr(x+.2,Y1+.2),scr(X1+.2,Y1+.2),scr(X1+.2,y+.2),scr(X1,y),scr(X1,Y1),scr(x,Y1)],'rgba(0,0,0,.25)',null);
  quad([scr(x,Y1),scr(X1,Y1),top],'#8a7458');quad([scr(X1,Y1),scr(X1,y),top],'#6a5840');
  const m=lerp2(scr(x,Y1),scr(X1,Y1),.5);quad([lerp2(m,scr(x,Y1),.3),lerp2(m,scr(X1,Y1),.3),lerp2(m,top,.55)],'#2a2016');
  ctx.strokeStyle='#3a2a18';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...top);ctx.lineTo(top[0],top[1]-10);ctx.stroke();
  ctx.fillStyle='#8f2a1e';ctx.beginPath();ctx.moveTo(top[0],top[1]-10);ctx.lineTo(top[0]+12,top[1]-7+Math.sin(time*3)*1.5);ctx.lineTo(top[0],top[1]-4);ctx.fill();
}
function drawBoard(i,j){
  const a=scr(i+.25,j+.5),b=scr(i+.75,j+.5);seg([a,up(a,34)],2.6,'#5a3a22');seg([b,up(b,34)],2.6,'#5a3a22');
  quad([up(a,36),up(b,36),up(b,18),up(a,18)],'#7a5a3a');
  const r=rng(i*13+j);for(let k=0;k<4;k++){const t=.15+k*.2,q=up(lerp2(a,b,t),31-(k%2)*6);ctx.fillStyle=k%2?'#efe6cc':'#e6d6b0';ctx.fillRect(q[0]-4,q[1]-1,8,8)}
}
// ================= beasts =================
const BP={rabbit:{L:5,rx:8,ry:5.5,hx:8,hy:-3,hr:4.2},sheep:{L:10,rx:15,ry:10,hx:15,hy:-2,hr:5},deer:{L:18,rx:15,ry:7,hx:20,hy:-16,hr:5,neck:1},horse:{L:21,rx:19,ry:8.5,hx:24,hy:-18,hr:6,neck:1},
  boar:{L:9,rx:16,ry:9,hx:17,hy:0,hr:7},wolf:{L:14,rx:16,ry:6.5,hx:18,hy:-4,hr:5.5},bear:{L:12,rx:19,ry:12,hx:19,hy:-3,hr:8},tiger:{L:14,rx:20,ry:8,hx:21,hy:-3,hr:7.5}};
function drawBeast(e){
  const d=e.d,b=BP[d.beast],p=toScreen(e.x,e.y),s=d.size,side=(e.fx-e.fy)>=0?1:-1,mv=e.moving,ph=time*(e.sp||2)*4.2+(e.bob||0),fl=e.hit>0;
  const c0=fl?'#fff':d.col[0],c1=fl?'#fff':d.col[1];
  if(e===P.ride)return;
  ctx.save();ctx.translate(p.x,p.y);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,0,b.rx*s*1.1,5*s,0,0,7);ctx.fill();
  if(e.wind>0){ctx.strokeStyle=`rgba(220,60,40,${.45+.4*Math.sin(time*30)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,TW/2*s,TH/2*s,0,0,7);ctx.stroke()}
  ctx.scale(side*s,s);
  const hop=d.beast==='rabbit'?(mv?Math.abs(Math.sin(ph*.8))*7:0):(mv?Math.abs(Math.sin(ph))*1.4:Math.sin(time*2+(e.bob||0))*.4);
  ctx.translate(0,-hop);
  const by=-b.L-b.ry*.5,leg=(x,o,col)=>{const a=mv?Math.sin(ph+o)*.55:0,f=[x+Math.sin(a)*b.L,-Math.cos(a)*b.L*.08];seg([[x,by+b.ry*.3],f],d.beast==='bear'?6:d.beast==='rabbit'?2.5:3.4,col)};
  leg(-b.rx*.55,Math.PI,c1);leg(b.rx*.55,0,c1);
  // tail
  if(d.beast==='wolf'||d.beast==='tiger')seg([[-b.rx,by-1],[-b.rx-8,by+4+Math.sin(time*3)*2],[-b.rx-13,by+(d.beast==='tiger'?-2:8)]],d.beast==='wolf'?5:3,c1);
  else if(d.beast==='horse')seg([[-b.rx,by-2],[-b.rx-5,by+6],[-b.rx-6,by+16+Math.sin(time*3)*1.5]],4,'#1a120a');
  else if(d.beast!=='bear'&&d.beast!=='sheep')seg([[-b.rx,by-1],[-b.rx-4,by-3]],2.5,c1);
  // body
  const g=ctx.createLinearGradient(0,by-b.ry,0,by+b.ry);g.addColorStop(0,c0);g.addColorStop(1,c1);
  if(d.beast==='sheep'){ctx.fillStyle=fl?'#fff':'#efe9dc';for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ctx.beginPath();ctx.arc(Math.cos(a)*b.rx*.65,by+Math.sin(a)*b.ry*.55,b.ry*.62,0,7);ctx.fill()}ctx.strokeStyle='rgba(120,110,90,.6)';ctx.lineWidth=1;ctx.stroke()}
  else{ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,by,b.rx,b.ry,0,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke()}
  if(d.stripes&&!fl){ctx.strokeStyle='#1a0e06';ctx.lineWidth=2;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*5,by-b.ry+1);ctx.quadraticCurveTo(i*5+3,by,i*5-1,by+b.ry*.6);ctx.stroke()}}
  if(d.beast==='boar'){ctx.strokeStyle=c1;ctx.lineWidth=1.5;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*4,by-b.ry+1);ctx.lineTo(i*4-2,by-b.ry-4);ctx.stroke()}}
  // neck and head
  const hx=b.hx,hy=by+b.hy;
  if(b.neck)seg([[b.rx*.6,by-2],[hx-3,hy+3]],d.beast==='horse'?8:6,c0);
  if(d.mane&&!fl)seg([[b.rx*.4,by-b.ry],[hx-6,hy-2]],3,'#1a120a');
  ctx.fillStyle=c0;ctx.beginPath();ctx.ellipse(hx,hy,b.hr*1.2,b.hr*.9,b.neck?.5:0,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle=c1;ctx.beginPath();ctx.ellipse(hx+b.hr*.9,hy+b.hr*.35,b.hr*.6,b.hr*.45,0,0,7);ctx.fill();
  ctx.fillStyle='#0c0806';ctx.beginPath();ctx.arc(hx+b.hr*.25,hy-b.hr*.25,1.1,0,7);ctx.fill();
  if(d.beast==='rabbit')for(const o of[-1.5,1.5])seg([[hx-1+o*.4,hy-3],[hx-3+o,hy-12]],2.6,c0);
  if(d.beast==='wolf'||d.beast==='tiger'||d.beast==='bear'){ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(hx-3,hy-b.hr*.6);ctx.lineTo(hx-2,hy-b.hr*.6-(d.beast==='wolf'?6:3.5));ctx.lineTo(hx+1,hy-b.hr*.7);ctx.fill()}
  if(d.antler&&!fl){ctx.strokeStyle='#d8c8a0';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(hx-1,hy-4);ctx.lineTo(hx-4,hy-14);ctx.moveTo(hx-3,hy-10);ctx.lineTo(hx-8,hy-13);ctx.moveTo(hx-4,hy-14);ctx.lineTo(hx-1,hy-18);ctx.stroke()}
  if(d.tusk){ctx.strokeStyle='#f0ead8';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(hx+b.hr*.9,hy+2);ctx.quadraticCurveTo(hx+b.hr*1.5,hy,hx+b.hr*1.3,hy-3);ctx.stroke()}
  leg(-b.rx*.35,Math.PI*.5,c0);leg(b.rx*.75,Math.PI*1.5,c0);
  ctx.restore();
  if(e.stun>0){for(let n=0;n<3;n++){const a=time*6+n*2.1;ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(p.x+Math.cos(a)*10,p.y-(b.L+b.ry)*s*2-6+Math.sin(a)*3,2,0,7);ctx.fill()}}
  const y=p.y-(b.L+b.ry*2+(b.neck?16:6))*s-6;
  if(e.hp<e.maxHp||P.target===e||e.ally){const w=26;ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(p.x-w/2-1,y-1,w+2,5);ctx.fillStyle=e.ally?'#6abf5a':'#c0261b';ctx.fillRect(p.x-w/2,y,w*Math.max(0,e.hp/e.maxHp),3)}
  if(P.target===e||e.ally){ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(e.name,p.x+1,y-4);ctx.fillStyle=e.ally?'#a6d47f':d.hostile?'#f0a080':'#f0e4c8';ctx.fillText(e.name,p.x,y-5)}
}
// hero on horseback: horse under the hero
function drawMount(){const h=P.ride;if(!h)return;const save=P.ride;P.ride=null;drawBeast({...h,x:P.x,y:P.y,fx:P.fx,fy:P.fy,moving:P.moving,ally:0,hp:1,maxHp:1});P.ride=save}
// ================= nodes, crops, drops, 기연 =================
function drawNode(n){
  const p=toScreen(n.x,n.y),ready=n.cd<=0;ctx.save();ctx.translate(p.x,p.y);
  if(n.t==='herb'){if(!ready){ctx.fillStyle='#4a6a2a';ctx.fillRect(-2,-3,4,3)}else{for(let i=0;i<5;i++){const a=-1.2+i*.6;seg([[0,0],[Math.sin(a)*9,-6-Math.cos(a)*6]],2.4,'#4f8a3a')}
    ctx.fillStyle='#e0506a';for(const[x,y]of[[-4,-11],[3,-13],[6,-8]]){ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill()}}}
  else if(n.t==='ore'){poly([[-11,0],[-8,-9],[0,-13],[9,-8],[11,0]],lg(-11,11,'#9a958a','#3a3833'));if(ready){ctx.strokeStyle=`rgba(255,220,140,${.6+.4*Math.sin(time*4+n.x)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-6,-4);ctx.lineTo(-1,-9);ctx.lineTo(4,-5);ctx.stroke()}}
  else if(n.t==='wood'){if(ready)for(let i=0;i<3;i++){const y=-3-i*4,x=(i%2)*3-1;poly([[-10+x,y+2],[8+x,y-2],[9+x,y+1],[-9+x,y+5]],'#7a5232');ctx.fillStyle='#c9a070';ctx.beginPath();ctx.ellipse(8.5+x,y-.5,2,2.6,0,0,7);ctx.fill()}else{ctx.fillStyle='#5a3a22';ctx.fillRect(-4,-2,8,2)}}
  else if(n.t==='fish'){const k=frac(time*.6+n.x);ctx.strokeStyle=`rgba(220,240,250,${(1-k)*.7})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-8,4+k*12,2+k*5,0,0,7);ctx.stroke();
    ctx.fillStyle='#e04030';ctx.beginPath();ctx.arc(0,-9+Math.sin(time*3)*1,2.2,0,7);ctx.fill()}
  else if(n.t==='chest'){if(!P.chest){const gl=ctx.createRadialGradient(0,-10,1,0,-10,30);gl.addColorStop(0,`rgba(255,220,120,${.35+.2*Math.sin(time*3)})`);gl.addColorStop(1,'rgba(255,200,80,0)');ctx.fillStyle=gl;ctx.fillRect(-30,-40,60,60)}
    poly([[-12,-2],[10,-2],[12,-14],[-10,-14]],lg(-12,12,'#8a5a30','#3a2210'));poly([[-10,-14],[12,-14],[10,-20],[-8,-20]],P.chest?'#3a2210':'#a06a38');ctx.fillStyle='#c9a14a';ctx.fillRect(-2,-12,4,4)}
  ctx.restore();
}
function drawPlot(pl){
  if(!pl.crop)return;const c=CROPS[pl.crop],g=pl.g,r=rng(pl.x*7+pl.y*13);
  for(let k=0;k<5;k++){const q=toScreen(pl.x+.2+r()*.6,pl.y+.2+r()*.6),h=4+g*16;ctx.strokeStyle=pl.dead>0?'#8a8a70':g>=1?'#b8a040':'#5a9a3a';ctx.lineWidth=1.6;
    for(const a of[-.4,0,.4]){ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.quadraticCurveTo(q.x+a*6,q.y-h*.6,q.x+a*10,q.y-h);ctx.stroke()}
    if(g>=.7){ctx.fillStyle=c.col;ctx.beginPath();ctx.arc(q.x,q.y-h,pl.crop==='배추'?5:2.6,0,7);ctx.fill()}}
  if(g>=1){const q=toScreen(pl.x+.5,pl.y+.5);ctx.fillStyle=`rgba(255,230,140,${.5+.4*Math.sin(time*4)})`;ctx.font='11px "Gowun Dodum"';ctx.textAlign='center';ctx.fillText('수확',q.x,q.y-28)}
}
function drawDrop(d){
  const it=d.it;if(!it||!(it.silver||it.mat||it.page||it.item))return;
  const p=toScreen(d.x,d.y),bob=Math.sin(time*3+d.t)*2;
  const col=it.silver?'#e8c66e':it.page?'#ffd36a':it.item?itemCol(it.item):'#d8d2c2';
  if(it.item||it.page){const h=46,g=ctx.createLinearGradient(0,p.y-h,0,p.y);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,col+'88');ctx.fillStyle=g;ctx.fillRect(p.x-4,p.y-h,8,h)}
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(p.x,p.y,8,3.5,0,0,7);ctx.fill();
  ctx.save();ctx.translate(p.x,p.y-6+bob);
  if(it.silver){ctx.fillStyle='#d8d8d8';ctx.beginPath();ctx.ellipse(0,0,6,3.5,0,0,7);ctx.fill();ctx.fillStyle='#bbb';ctx.beginPath();ctx.ellipse(0,-2,3,2,0,0,7);ctx.fill()}
  else if(it.item&&(it.item.slot==='book'||it.item.slot==='sbook'||it.item.slot==='tbook')||it.page){poly([[-6,-7],[6,-7],[6,5],[-6,5]],it.page?'#e8c66e':'#c8b48a');ctx.fillStyle='#5a3a22';ctx.fillRect(-6,-7,2,12)}
  else if(it.item){ctx.rotate(-.7);poly([[-1.5,-12],[1.5,-12],[1.5,10],[-1.5,10]],lg(-2,2,'#eeeeea','#7f8794'));ctx.fillStyle='#c9a14a';ctx.fillRect(-4,6,8,2)}
  else{ctx.fillStyle='#9a6a4a';ctx.beginPath();ctx.arc(0,0,4.5,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.stroke()}
  ctx.restore();
  const label=it.silver?`은자 ${it.silver}`:it.mat?`${it.mat} ${it.n}`:it.page?`신공 ${it.page}`:itemLabel(it.item);
  if(it.item||it.page||dist(d,P)<3){ctx.font='11px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(label,p.x+1,p.y-19);ctx.fillStyle=col;ctx.fillText(label,p.x,p.y-20)}
}
function drawGiyeon(g){const p=toScreen(g.x,g.y),k=.6+.4*Math.sin(time*5);glowDot(p.x,p.y-20,46,'255,225,140',k);
  ctx.strokeStyle=`rgba(255,240,190,${k})`;ctx.lineWidth=1.5;for(let i=0;i<5;i++){const a=time*2+i*1.26;ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*8,p.y-20+Math.sin(a)*5);ctx.lineTo(p.x+Math.cos(a)*16,p.y-30+Math.sin(a)*8);ctx.stroke()}}
function drawFx2(f){
  if(f.t==='warn'){const p=toScreen(f.x,f.y),k=1-f.life/f.max,[rx,ry]=isoR(f.r);ctx.fillStyle=`rgba(220,40,30,${.12+.2*k})`;ctx.beginPath();ctx.ellipse(p.x,p.y,rx*k,ry*k,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(255,80,60,${.5+.4*Math.sin(time*25)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,7);ctx.stroke();return}
  drawFx(f);
}
// ================= 운기조식: 주변의 기운이 소용돌이치며 몸으로 빨려든다 =================
// 기운 한 줄기는 몸 둘레 바깥에서 생겨 나선을 그리며 점점 빨라지고, 단전(몸 가운데)에 닿으면 사라진다.
// 닿을 때마다 몸의 빛이 조금씩 밝아진다. 정파는 금빛·푸른빛, 사파는 붉은빛·보랏빛.
const MED={k:0,parts:[],lt:0,pulse:0,spin:0};
function medSpawn(){const r0=50+Math.random()*60;return{r:r0,r0,a:Math.random()*7,w:(Math.random()<.5?-1:1)*(1.1+Math.random()*1.3),v:6+Math.random()*10,
  h:-14-Math.random()*50,s:1.3+Math.random()*1.5,c:Math.random()<.65?0:1,life:0}}
function medTick(){const dt=Math.min(.05,Math.max(0,time-MED.lt));MED.lt=time;
  MED.k=clamp(MED.k+((P.medit||P.qiTraining||P.chan&&P.chan.label==='내공 수련')&&P.hp>0?dt/.6:-dt/.35),0,1);MED.spin+=dt*1.6;MED.pulse=Math.max(0,MED.pulse-dt*1.4);
  if(MED.k<=0){MED.parts.length=0;return}
  const want=Math.round(54*MED.k);while(MED.parts.length<want)MED.parts.push(medSpawn());
  for(const q of MED.parts){const near=1-q.r/q.r0;q.v+=dt*(50+220*near*near);q.r-=q.v*dt;q.a+=q.w*dt*(1+near*3);q.life+=dt;
    if(q.r<4){MED.pulse=Math.min(1,MED.pulse+.07);if(MED.parts.length>want)q.dead=1;else Object.assign(q,medSpawn())}}
  MED.parts=MED.parts.filter(q=>!q.dead)}
function medPos(q,r,a,c){return[c.x+Math.cos(a)*r,c.y+Math.sin(a)*r*.48+q.h*(r/q.r0)]}
function drawMedit(front){
  if(!front)medTick();if(MED.k<=0)return;
  const p=toScreen(P.x,P.y),k=MED.k,col=P.side==='사'?['220,40,50','170,70,230']:['255,214,110','120,190,255'],c={x:p.x,y:p.y-30};
  ctx.save();
  if(!front){
    // 발밑: 천천히 도는 두 겹의 기운 고리
    for(const[rr,dir,al]of[[30,1,.7],[44,-1,.4]]){ctx.strokeStyle=`rgba(${col[0]},${al*k})`;ctx.lineWidth=1.8;ctx.setLineDash([7,5]);ctx.lineDashOffset=-MED.spin*14*dir;
      ctx.beginPath();ctx.ellipse(p.x,p.y,rr*k,rr*.5*k,0,0,7);ctx.stroke()}
    ctx.setLineDash([]);
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,40*k);g.addColorStop(0,`rgba(${col[0]},${.22*k})`);g.addColorStop(1,`rgba(${col[0]},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(p.x,p.y,40*k,20*k,0,0,7);ctx.fill();
  }else{
    // 기운 줄기: 지나온 나선을 꼬리로 남기며 단전으로. 색이 바래지 않게 줄기는 보통 합성, 머리만 밝게 더한다.
    ctx.globalCompositeOperation='source-over';
    for(const q of MED.parts){const near=1-q.r/q.r0,al=Math.min(1,q.life*3)*k*(.45+.55*near),cc=col[q.c],sw=q.w*(1+near*3);
      const pts=[];for(let j=0;j<7;j++)pts.push(medPos(q,q.r+q.v*.035*j,q.a-sw*.035*j,c));
      const[hx,hy]=pts[0],[ex,ey]=pts[6],gr=ctx.createLinearGradient(ex,ey,hx,hy);gr.addColorStop(0,`rgba(${cc},0)`);gr.addColorStop(1,`rgba(${cc},${al})`);
      ctx.strokeStyle=gr;ctx.lineWidth=q.s;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(ex,ey);for(let j=5;j>=0;j--)ctx.lineTo(pts[j][0],pts[j][1]);ctx.stroke()}
    ctx.globalCompositeOperation='lighter';
    for(const q of MED.parts){const near=1-q.r/q.r0,al=Math.min(1,q.life*3)*k*(.3+.7*near),[x,y]=medPos(q,q.r,q.a,c);
      ctx.fillStyle=`rgba(${col[q.c]},${al*.5})`;ctx.beginPath();ctx.arc(x,y,q.s*.9,0,7);ctx.fill()}
    // 단전의 빛: 기운이 닿을수록 밝아진다
    ctx.globalCompositeOperation='lighter';const pr=18+12*MED.pulse+2*Math.sin(time*5),g=ctx.createRadialGradient(c.x,c.y+6,0,c.x,c.y+6,pr*1.8);
    g.addColorStop(0,`rgba(255,250,230,${(.25+.35*MED.pulse)*k})`);g.addColorStop(.4,`rgba(${col[0]},${(.18+.25*MED.pulse)*k})`);g.addColorStop(1,`rgba(${col[0]},0)`);
    ctx.fillStyle=g;ctx.fillRect(c.x-pr*1.8,c.y+6-pr*1.8,pr*3.6,pr*3.6);
  }
  ctx.restore();
}
// ================= frame =================
function npcFighter(n){return{npc:1,n:n.n,x:n.x,y:n.y,d:{pal:n.pal},fx:0,fy:1,hp:1,maxHp:1,moving:false,bob:n.x,swing:0,wind:0,stun:0,hit:0,sp:0}}
let NPCF=NPCS.filter(n=>!n.board).map(npcFighter);
function draw(){
  const dpr=devicePixelRatio;
  ctx.setTransform(S*dpr,0,0,S*dpr,0,0);
  if(shake>0)ctx.translate((Math.random()-.5)*24*shake,(Math.random()-.5)*24*shake);
  ctx.fillStyle='#0b0a09';ctx.fillRect(-30,-30,W+60,H+60);
  const o=toScreen(0,0);if(ground.chunked)drawChunks(ground,o);else ctx.drawImage(ground,o.x-NH*TW/2,o.y,(N+NH)*TW/2,(N+NH)*TH/2);
  const sea=P?season():'봄';
  if(REGION().in){}else if(sea==='겨울'){ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba(240,245,255,.7)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
  else if(sea==='가을'){ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba(230,140,40,.35)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
  for(let j=RIV;j<=RIV+1;j++)for(let i=0;i<N;i++)if(map[j][i].g===2){for(let k=0;k<2;k++){const u=frac(time*.12+hash(i,j*3+k)),v=.2+hash(i*5+k,j)*.6,p=toScreen(i+u,j+v);if(p.x<-20||p.x>W+20||p.y<-20||p.y>H+20)continue;const a=Math.sin(u*Math.PI);
    ctx.strokeStyle=`rgba(225,240,245,${.35*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x-6,p.y-3);ctx.quadraticCurveTo(p.x,p.y-1,p.x+6,p.y+3);ctx.stroke()}}
  if(!P)return;
  if(P.path&&P.path.length){const l=P.path[P.path.length-1],p=toScreen(l.x,l.y),k=(time*2)%1;ctx.strokeStyle=`rgba(230,200,120,${1-k})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,6+k*10,3+k*5,0,0,7);ctx.stroke()}
  if(P.target&&P.target.hp>0){const p=toScreen(P.target.x,P.target.y);ctx.strokeStyle=P.target.d.hostile||P.target.aggro?'rgba(220,60,40,.85)':'rgba(230,200,120,.85)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,18,8,0,0,7);ctx.stroke()}
  const list=[],pp=toScreen(P.x,P.y),vis=(x,y,m=90)=>{const p=toScreen(x,y);return p.x>-m&&p.x<W+m&&p.y>-40&&p.y<H+200};
  // 큰 지역은 사람 둘레만 살핀다
  const vr=Math.ceil(W/TW+H/TH)+4,j0=Math.max(0,Math.floor(P.y)-vr),j1=Math.min(NH,Math.floor(P.y)+vr),i0=Math.max(0,Math.floor(P.x)-vr),i1=Math.min(N,Math.floor(P.x)+vr);
  for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++){const ob=objs[j][i];if(!ob||ob==='lamp'||ob==='B')continue;
    const p=toScreen(i+.5,j+.5);if(p.x<-90||p.x>W+90||p.y<-20||p.y>H+190)continue;
    if(ob==='stall'){list.push({d:i+j+1,f:()=>drawStall(i,j)});continue}
    if(ob==='tent'){list.push({d:i+j+1,f:()=>drawTent({x:i,y:j})});continue}
    if(ob==='board'){list.push({d:i+j+1,f:()=>drawBoard(i,j)});continue}
    if(ob==='wall'||ob==='pillar'||ob==='screen'){const mg=REGION().hall&&REGION().hall.mg,fn=ob==='wall'?drawWall:ob==='pillar'?drawPillar:drawScreen;list.push({d:i+j+1,f:()=>fn(i,j,mg)});continue}
    if(ob.startsWith('flag:')){list.push({d:i+j+1,f:()=>drawFlag(i,j,ob.slice(5))});continue}
    const set=SPRITES[ob],spr=set[(i*7+j*3)%set.length],tall=ob!=='rock';
    const fade=tall&&!(P.perch&&P.perch.i===i&&P.perch.j===j)&&i+j+1>P.x+P.y&&Math.abs(p.x-pp.x)<55&&p.y-pp.y<150&&p.y>pp.y;
    list.push({d:i+j+1,f:()=>{if(fade)ctx.globalAlpha=.4;ctx.drawImage(spr,p.x-spr.width/2,p.y-spr.height+(tall?12:10));ctx.globalAlpha=1}})}
  for(const b of builds){const d=b.x+b.w-1+b.y+b.h-1+1,l=scr(b.x,b.y+b.h)[0]-20,r=scr(b.x+b.w,b.y)[0]+20,bt=scr(b.x+b.w,b.y+b.h)[1];
    const hide=!(P.perch&&P.perch.b===b)&&!(P.leap&&P.leap.to&&P.leap.to.b===b)&&P.x+P.y<d&&pp.x>l&&pp.x<r&&pp.y<bt&&pp.y>bt-160;list.push({d,f:()=>drawBuild(b,hide?.45:1)})}
  for(const rl of rails)list.push({d:rl.x+rl.y+.5,f:()=>drawRail(rl)});
  for(const l of lamps)if(vis(l.x,l.y))list.push({d:l.x+l.y,f:()=>drawLamp(l)});
  for(const n of nodes)if(vis(n.x,n.y))list.push({d:n.x+n.y-.2,f:()=>drawNode(n)});
  for(const pl of plots)if(pl.crop&&vis(pl.x,pl.y))list.push({d:pl.x+pl.y+.9,f:()=>drawPlot(pl)});
  for(const t of tombs())if((t.reg||'gaebong')===REG&&vis(t.x,t.y))list.push({d:t.x+t.y-.3,f:()=>drawTomb(t)});
  for(const d of drops)list.push({d:d.x+d.y-.1,f:()=>drawDrop(d)});
  if(G.giyeon)list.push({d:G.giyeon.x+G.giyeon.y,f:()=>drawGiyeon(G.giyeon)});
  for(const g of REGION().gates)if(vis(g.x,g.y))list.push({d:g.x+g.y-.4,f:()=>drawGate(g)});
  for(const m of lmHints())list.push({d:9999,f:()=>drawLmName(m)});
  if(REGION().edges)for(const h of pvEdgeHints())list.push({d:h.x+h.y-.4,f:()=>drawEdgeHint(h)});
  for(const n of NPCF)if(vis(n.x,n.y))list.push({d:n.x+n.y,f:()=>drawFighter(n,false)});
  if(REG==='gaebong'&&P.spouse&&G.house&&G.house.built){const s=spousePos();list.push({d:s.x+s.y,f:()=>drawFighter({npc:1,n:P.spouse.name,...s,d:{pal:'spouse'},fx:0,fy:1,hp:1,maxHp:1,bob:3,swing:0,wind:0,stun:0,hit:0,sp:0},false)})}
  for(const e of mobs)if(vis(e.x,e.y))list.push({d:e.x+e.y,f:()=>e.d.beast?drawBeast(e):e.ghost?drawGhost(e):drawFighter(e,false)});
  for(const a of allies)if(a!==P.ride&&vis(a.x,a.y)){a.ally=1;list.push({d:a.x+a.y,f:()=>a.kind==='pet'?drawBeast(a):drawFighter(a,false)})}
  if(P.hp>0){const z=P.z||0,lt=P.leap&&P.leap.to;
    // 높은 곳에 있거나 그리로 뛰는 중이면 그 지붕·나무보다 나중에 그린다
    const pd=P.perch?perchD():lt&&P.leap.t/P.leap.dur>.45?(lt.k==='roof'?lt.b.x+lt.b.w+lt.b.y+lt.b.h-1+.6:lt.i+lt.j+1.1):P.leap&&P.leap.z0>0&&P.leap.t/P.leap.dur<.5?P.x+P.y+3:P.x+P.y;
    if(P.perch&&joy.on){const a=leapAim();if(a){const s=toScreen(a.x,a.y),az=a.q.z,k=(time*2)%1;list.push({d:99999,f:()=>{ctx.strokeStyle=`rgba(190,220,255,${.9-k*.6})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y-az,8+k*8,4+k*4,0,0,7);ctx.stroke()}})}}
    if(z>2){const g=toScreen(P.x,P.y);list.push({d:P.x+P.y-.05,f:()=>{ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(g.x,g.y,10,5,0,0,7);ctx.fill()}})}
    list.push({d:pd,f:()=>{ctx.save();ctx.translate(0,-z);drawMedit(0);drawTrainFx(0);if(P.ride){drawMount();ctx.save();ctx.translate(0,-16);drawFighter(P,true);ctx.restore()}else drawFighter(P,true);drawMedit(1);drawTrainFx(1);ctx.restore()}})}
  for(const f of fx)if(!f.glow)list.push({d:f.x+f.y+(f.t==='ring'||f.t==='warn'?-5:.1),f:()=>drawFx2(f)});
  list.sort((a,b)=>a.d-b.d).forEach(o=>o.f());
  // weather
  const w=G.weather;
  if(w==='비'){ctx.strokeStyle='rgba(170,190,220,.35)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<140;i++){const x=(hash(i,7)*W+time*60*hash(i,3))%W,y=(hash(i,11)*H+time*(500+hash(i,5)*200))%H;ctx.moveTo(x,y);ctx.lineTo(x-3,y+12)}ctx.stroke();ctx.fillStyle='rgba(20,30,50,.15)';ctx.fillRect(0,0,W,H)}
  else if(w==='눈'){ctx.fillStyle='rgba(245,248,255,.8)';for(let i=0;i<120;i++){const x=(hash(i,7)*W+Math.sin(time+i)*20+time*15)%W,y=(hash(i,11)*H+time*(40+hash(i,5)*30))%H;ctx.beginPath();ctx.arc(x,y,1+hash(i,2)*1.6,0,7);ctx.fill()}}
  else if(w==='흐림'){ctx.fillStyle='rgba(60,64,72,.18)';ctx.fillRect(0,0,W,H)}
  else if(w==='폭염'){ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba(255,170,60,.45)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
  // night and the cave: darkness with holes cut by the hero's aura, lanterns and qi bursts
  const cave=inCave(Math.floor(P.x),Math.floor(P.y));
  const dark=Math.max(cave?.55:0,darkLvl()),sunH=-Math.cos(tod*Math.PI*2),dusk=cave?0:Math.max(0,1-Math.abs(sunH)/.4);
  if(dusk>0){ctx.globalCompositeOperation='soft-light';ctx.fillStyle=`rgba(255,120,40,${.5*dusk})`;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
  if(dark>.01){
    lx.setTransform(S*dpr,0,0,S*dpr,0,0);lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);
    lx.fillStyle=`rgba(4,8,22,${dark})`;lx.fillRect(0,0,W,H);lx.globalCompositeOperation='destination-out';
    for(const b of builds)if(b.kind!=='pavilion'){const q=scr(b.x+b.w/2,b.y+b.h+.3,20);lightAt(q[0],q[1],110,.8)}
    lightAt(pp.x,pp.y-20,240,1);
    for(const l of lamps){const p=toScreen(l.x,l.y);lightAt(p.x,p.y-30,150+Math.sin(time*9+l.p)*8,.95)}
    for(const d of drops)if(d.it.item||d.it.page){const p=toScreen(d.x,d.y);lightAt(p.x,p.y-10,60,.8)}
    if(G.giyeon){const p=toScreen(G.giyeon.x,G.giyeon.y);lightAt(p.x,p.y-20,120,.9)}
    for(const f of fx)if(f.t==='ring'||f.t==='lvl'){const p=toScreen(f.x,f.y);lightAt(p.x,p.y,220,.8*f.life/(f.max||1.2))}
    for(const f of fx)if(f.glow&&!f.dim&&f.t!=='parts'){const p=toScreen(f.x,f.y);lightAt(p.x,p.y-20,f.t==='bolt'?200:120,.6*f.life/f.max)}
    for(const q of projs){const p=toScreen(q.x,q.y);lightAt(p.x,p.y-24,70*q.size,.7)}
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(L,0,0);ctx.setTransform(S*dpr,0,0,S*dpr,0,0);
    ctx.globalCompositeOperation='lighter';
    for(const l of lamps){const p=toScreen(l.x,l.y),g=ctx.createRadialGradient(p.x,p.y-30,0,p.x,p.y-30,120);g.addColorStop(0,`rgba(255,150,60,${.22*dark})`);g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(p.x-120,p.y-150,240,240)}
    ctx.globalCompositeOperation='source-over';
  }
  for(const f of fx)if(f.glow&&!f.dim&&DARKEN[f.t]){const p=toScreen(f.x,f.y),k=f.life/f.max,r=DARKEN[f.t]*(f.s||f.r||1);ctx.globalAlpha=.42*k;ctx.drawImage(glowSpr('dark'),p.x-r,p.y-30-r,r*2,r*2)}ctx.globalAlpha=1;
  ctx.globalCompositeOperation='lighter';for(const f of fx)if(f.glow)drawGlow2(f);for(const q of projs)drawProj(q);
  for(const q of eprojs){if(!q.trail)q.trail=[];q.trail.push({x:q.x,y:q.y});if(q.trail.length>6)q.trail.shift();drawProj({...q,X:{t:0,art:{elc:false}},size:1,kind:'arrow'})}
  if(P.flash>0){ctx.fillStyle=rgba(P.flashCol,P.flash*.5);ctx.fillRect(0,0,W,H)}
  ctx.globalCompositeOperation='source-over';
  ctx.textAlign='center';
  for(const t of texts){const p=toScreen(t.x,t.y),k=1-t.life/.9;ctx.globalAlpha=Math.min(1,t.life*2);
    const yy=t.call?p.y-98-k*8:p.y-74-k*22;ctx.font=t.call?'17px "Song Myung",serif':'15px "Song Myung",serif';ctx.fillStyle='#000';ctx.fillText(t.t,p.x+1,yy+1);ctx.fillStyle=t.c;ctx.fillText(t.t,p.x,yy)}
  ctx.globalAlpha=1;
  if(!REGION().in)for(const m of embers){m.y-=.0005*m.s;m.x+=.0003*Math.sin(time+m.p);if(m.y<0)m.y=1;
    const mx=((m.x%1)+1)%1*W,my=m.y*H;if(dark>.3){ctx.fillStyle=`rgba(210,255,140,${(.35+.35*Math.sin(time*3+m.p))*dark})`;ctx.fillRect(mx,my,1.8*m.s,1.8*m.s)}
    else if(sea==='봄'||sea==='가을'){ctx.fillStyle=sea==='봄'?'rgba(245,200,215,.7)':'rgba(220,130,50,.7)';ctx.beginPath();ctx.ellipse(mx,my,2.6*m.s,1.3*m.s,time*2+m.p,0,7);ctx.fill()}}
  const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
// minimap: baked terrain + live dots
const MINI=$('mini'),mctx=MINI.getContext('2d');let miniBase=null;
function bakeMini(){const c=document.createElement('canvas');c.width=150;c.height=84;const g=c.getContext('2d');const col=['#3e5a2a','#8a7454','#2a4a5a','#7a5a3a','#8a8678','#5a4430','#3a3634','#6a5a44','#d8dde4','#4a4a30','#8a4a32','#2a2626','#c8a870','#7a5a3a'];
  for(let y=0;y<NH;y++)for(let x=0;x<N;x++){const[px,py]=miniXY(x+.5,y+.5),ms=80/(N+NH);g.fillStyle=objs[y][x]&&objs[y][x]!=='lamp'?(objs[y][x]==='B'||objs[y][x]==='tent'?'#c9b48a':objs[y][x]==='wall'||objs[y][x]==='pillar'||objs[y][x]==='screen'||objs[y][x]==='stupa'?'#8a8678':objs[y][x]==='plum'?'#6a3a4a':objs[y][x]==='maple'?'#6a3a1a':'#26381a'):col[map[y][x].g];g.fillRect(px-1.5*ms,py-ms,3.2*ms,2.2*ms)}miniBase=c}
const miniXY=(x,y)=>[75+((x-y)-(N-NH)/2)*148/(N+NH),2+(x+y)*80/(N+NH)];   // 가로 N 세로 NH 마름모를 150×84 안에
function drawMini(){if(!P)return;if(!miniBase)bakeMini();mctx.clearRect(0,0,150,84);mctx.drawImage(miniBase,0,0);
  for(const m of mobs){const[x,y]=miniXY(m.x,m.y);mctx.fillStyle=m.d.boss?'#ff5040':m.d.fac&&peaceful(m)?'#7ab0e0':m.d.hostile?'#d06050':m.d.villager?'#c8c0a8':'#a0c080';mctx.fillRect(x-1,y-1,m.d.boss?3:2,m.d.boss?3:2)}
  for(const g of REGION().gates){const[x,y]=miniXY(g.x,g.y);mctx.fillStyle='#ffe2a0';mctx.fillRect(x-2,y-2,4,4)}
  for(const n of NPCF){const[x,y]=miniXY(n.x,n.y);mctx.fillStyle='#e8c66e';mctx.fillRect(x-1,y-1,2,2)}
  for(const t of tombs()){if((t.reg||'gaebong')!==REG)continue;const[x,y]=miniXY(t.x,t.y);mctx.fillStyle='#b8a8ff';mctx.fillRect(x-2,y-2,4,4)}
  if(G.giyeon){const[x,y]=miniXY(G.giyeon.x,G.giyeon.y);mctx.fillStyle='#fff3b0';mctx.fillRect(x-2,y-2,4,4)}
  const[x,y]=miniXY(P.x,P.y);mctx.fillStyle='#fff';mctx.beginPath();mctx.arc(x,y,2.4,0,7);mctx.fill()}

// ================= boot =================
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  try{if(playing&&!paused)update(dt);else time+=dt*.2;draw();if(playing){hud();drawMini()}}catch(err){console.error(err);if(!loop.err){loop.err=1;log('오류: '+err.message,'dmg')}}
  requestAnimationFrame(loop)}
loadRegion('gaebong');embers=Array.from({length:30},()=>({x:Math.random(),y:Math.random(),s:.4+Math.random(),p:Math.random()*6}));
buildBar();resize();{const t=iso(20.5,20.5);cam.x=t.x;cam.y=t.y}
showTitle();requestAnimationFrame(loop);

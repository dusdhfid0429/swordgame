// ---------- drawing ----------
const OUT='rgba(10,7,5,.9)';
function poly(pts,fill){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke()}
function lg(x0,x1,c0,c1){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,c0);g.addColorStop(1,c1);return g}
const PAL={
  hero:{skin:['#f2d6b6','#b88a64'],hair:'#14100e',robe:['#f1f2f4','#a3adbb'],robeB:'#8e98a8',inner:'#2b416b',trim:'#c9a14a',sash:'#2b416b',pants:'#2a2f3d',boot:'#2a1d14',hairband:'#b8291f',tail:1,jade:1,weapon:'sword'},
  bandit:{skin:['#dcae84','#8d6444'],hair:'#2a1c12',robe:['#8f6e4c','#4a3420'],robeB:'#5c4128',inner:'#5a4a38',trim:'#8f2a1e',sash:'#8f2a1e',pants:'#5e523f',boot:'#2a1d12',mask:'#3a332c',band:'#9a2a1e',short:1,weapon:'dao'},
  boss:{skin:['#c89e76','#7d5638'],hair:'#0e0c0b',robe:['#4e4640','#17120f'],robeB:'#2a231f',inner:'#7a1612',trim:'#a3271c',sash:'#a3271c',pants:'#1a1614',boot:'#120d09',cape:'#7a1612',armor:1,beard:1,weapon:'big'}
};
// thick outlined polyline: the "painted limb" used for legs, arms and sleeves
function seg(pts,w,col){
  ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
  ctx.strokeStyle=OUT;ctx.lineWidth=w+2;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();
}
const joint=(p,a,l)=>[p[0]+Math.sin(a)*l,p[1]+Math.cos(a)*l];
function weapon(kind){
  if(kind==='fist'){ctx.fillStyle='#e8e0cc';ctx.beginPath();ctx.arc(0,13,3.6,0,7);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.stroke();return}
  if(kind==='none')return;
  if(kind==='bow'){ctx.strokeStyle=OUT;ctx.lineWidth=4;ctx.beginPath();ctx.arc(-9,13,17,-1.15,1.15);ctx.stroke();ctx.strokeStyle='#8a5a30';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(-9,13,17,-1.15,1.15);ctx.stroke();
    ctx.strokeStyle='rgba(230,225,210,.8)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-9+Math.cos(-1.15)*17,13+Math.sin(-1.15)*17);ctx.lineTo(-9+Math.cos(1.15)*17,13+Math.sin(1.15)*17);ctx.stroke();return}
  if(kind==='spear'){poly([[-1.2,-6],[1.2,-6],[1.2,58],[-1.2,58]],lg(-1,1,'#8a6440','#3d2a18'));poly([[-3,58],[3,58],[0,74]],lg(-3,3,'#f2f2ee','#7f8794'));ctx.fillStyle='#a3271c';ctx.fillRect(-3,54,6,4);return}
  if(kind==='staff'){poly([[-1.7,-16],[1.7,-16],[1.7,52],[-1.7,52]],lg(-2,2,'#7a5532','#2e1e10'));ctx.fillStyle='#c9a14a';ctx.fillRect(-2,-16,4,4);ctx.fillRect(-2,48,4,4);return}
  ctx.fillStyle='#2a1a10';ctx.fillRect(-1.5,11,3,7);
  if(kind==='sword'){poly([[-4,17],[4,17],[4,19],[-4,19]],'#c9a14a');poly([[-1.6,19],[1.6,19],[1.2,50],[0,54],[-1.2,50]],lg(-2,2,'#f2f2ee','#7f8794'))}
  else if(kind==='dao'){poly([[-1.5,18],[2,18],[5,38],[3,44],[-2,40]],lg(-2,5,'#d9d6cc','#6d6a62'))}
  else{poly([[-2,18],[3,18],[8,52],[5,60],[-3,54]],lg(-3,8,'#c9c5ba','#4b4842'));poly([[-5,17],[6,17],[6,19.5],[-5,19.5]],'#6e1410')}
}

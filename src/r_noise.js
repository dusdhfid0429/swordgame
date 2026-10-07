// ---------- noise ----------
function rng(s){return()=>(s=(s*16807)%2147483647)/2147483647}
function hash(x,y){let h=(x|0)*374761393+(y|0)*668265263;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y)=>vn(x,y)*.5+vn(x*2.1+7,y*2.1)*.25+vn(x*4.3,y*4.3+3)*.15+vn(x*9,y*9)*.1;


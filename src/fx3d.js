// ================= 3D 카툰 이펙트 시범 (dist/fxview.html 에만 들어간다) =================
// 사용자 요청(2026-10-21): "귀멸의 칼날처럼 2D 게임에 3D 툰 렌더링 이펙트로 입체감을 줄 수 있어?" → 시범 3가지 (사용자 선택)
// 게임 캔버스(2D) 위에 투명한 WebGL 캔버스를 겹치고, 게임의 쿼터뷰 투영(iso)을 그대로 투영 행렬로 옮겨 같은 자리에 그린다.
// 좌표: x·y = 게임 타일 좌표, z = 높이(1 = 화면 32px). 툰: 3단 명암 + 뒤집은 껍데기(BackSide) 윤곽선.
// 한계: 3D 캔버스가 맨 위라 나무·지붕·인물에 가려지지 않는다. WebGL 이 없으면 탭에서 알리고 아무것도 하지 않는다.
(()=>{
if(typeof THREE==='undefined'||!window.FXV)return;
const F=window.FXV,V=F.V;
const C3=document.createElement('canvas');C3.id='fx3d';C3.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none';
let R=null;try{R=new THREE.WebGLRenderer({canvas:C3,alpha:true,antialias:true,premultipliedAlpha:false});R.setClearColor(0,0)}catch(e){R=null}
if(R)$('game').after(C3);
const scene=new THREE.Scene(),cam3=new THREE.Camera();
scene.add(new THREE.AmbientLight(0xffffff,.55));const sun=new THREE.DirectionalLight(0xffffff,.9);sun.position.set(-.6,-1.4,2.6);scene.add(sun);
// 3단 명암 (툰): 어두운 면 · 중간 · 밝은 면
const grad=new THREE.DataTexture(new Uint8Array([90,170,255]),3,1,THREE.RedFormat);grad.minFilter=grad.magFilter=THREE.NearestFilter;grad.needsUpdate=true;
const toon=(c,e=0,ei=.35)=>new THREE.MeshToonMaterial({color:c,gradientMap:grad,emissive:e,emissiveIntensity:ei,side:THREE.DoubleSide,transparent:true});
const ink=c=>new THREE.MeshBasicMaterial({color:c,side:THREE.FrontSide,transparent:true});   // 투영 행렬이 좌우를 뒤집어서 껍데기는 FrontSide 를 버린다(=BackSide 효과)
// 게임 화면 좌표와 같게: sx = 32(x-y) - cam.x + W/2, sy = 16(x+y) - 32z - cam.y + H/2. 깊이는 x+y(앞쪽이 가깝다)
function proj(){cam3.projectionMatrix.set(64/W,-64/W,0,-2*cam.x/W, -32/H,-32/H,64/H,2*cam.y/H, -1/60,-1/60,-.002,cam.y/16/60, 0,0,0,1);cam3.projectionMatrixInverse.copy(cam3.projectionMatrix).invert()}
function fit(){const c=$('game'),w=c.clientWidth,h=c.clientHeight;if(R.domElement.width!==Math.round(w*devicePixelRatio)||R.domElement.height!==Math.round(h*devicePixelRatio)){R.setPixelRatio(devicePixelRatio);R.setSize(w,h,false)}}

// ---- 굵기가 변하는 관(물줄기·불꽃 가닥): 몸통 + 윤곽선, setDrawRange 로 머리·꼬리를 움직인다 ----
const TS=120,RS=10;
function tube(curve,r,thick,col,em,line,ow=.045){
  const mk=(rr)=>{const g=new THREE.TubeGeometry(curve,TS,1,RS,false),p=g.attributes.position,c=new THREE.Vector3(),v=new THREE.Vector3();
    for(let j=0;j<=TS;j++){curve.getPointAt(j/TS,c);const k=rr(j/TS);for(let i=0;i<=RS;i++){const n=j*(RS+1)+i;v.fromBufferAttribute(p,n).sub(c).multiplyScalar(k).add(c);p.setXYZ(n,v.x,v.y,v.z)}}
    p.needsUpdate=true;g.computeVertexNormals();return g};
  const body=new THREE.Mesh(mk(u=>r*thick(u)),toon(col,em)),hull=new THREE.Mesh(mk(u=>r*thick(u)+ow),ink(line));
  const g=new THREE.Group();g.add(hull,body);g.range=(a,b)=>{a=Math.max(0,Math.min(1,a));b=Math.max(a,Math.min(1,b));const s=Math.floor(a*TS)*RS*6,n=Math.ceil((b-a)*TS)*RS*6;
    for(const m of[body,hull])m.geometry.setDrawRange(s,n)};g.range(0,0);return g}
function ball(r,col,em,line,ow=.04){const g=new THREE.Group(),geo=new THREE.IcosahedronGeometry(r,1);g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r+ow,1),ink(line)),new THREE.Mesh(geo,toon(col,em)));return g}
function fade(g,a){g.traverse(o=>{if(o.material)o.material.opacity=a})}
const live=[];
function add(fx){live.push(fx);scene.add(fx.g);F.note(fx.name)}
const lerp=(a,b,t)=>a+(b-a)*t,ez=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);

// ---- 1) 수: 몸을 휘감아 오르다 상대에게 내리꽂는 물줄기 (물보라·물결) ----
function water(){const P0={x:P.x,y:P.y},T=F.tgt(),pts=[];
  for(let i=0;i<=22;i++){const u=i/22,a=-1.2+u*Math.PI*3.2;pts.push(new THREE.Vector3(P0.x+Math.cos(a)*.95,P0.y+Math.sin(a)*.95,.15+u*1.5))}
  const m=new THREE.Vector3((P0.x+T.x)/2,(P0.y+T.y)/2,2.2);pts.push(m,new THREE.Vector3(T.x,T.y+.15,.9),new THREE.Vector3(T.x,T.y,.05));
  const curve=new THREE.CatmullRomCurve3(pts),g=new THREE.Group();
  const main=tube(curve,.26,u=>.35+.65*Math.sin(Math.min(1,u*1.15)*Math.PI*.5),0x3f8ff0,0x1a4fa0,0x0b2350);
  const foam=tube(curve,.11,u=>.5+.5*Math.sin(u*Math.PI),0xeaf6ff,0x9fd0ff,0x0b2350,.03);foam.position.z=.16;
  const head=ball(.3,0xd8efff,0x5aa0ff,0x0b2350);g.add(main,foam,head);
  const drops=[...Array(14)].map(()=>{const b=ball(.07+Math.random()*.06,0xbfe4ff,0x4a90e0,0x0b2350,.025);b.v=new THREE.Vector3((Math.random()-.5)*5,(Math.random()-.5)*5,2.5+Math.random()*3);b.visible=false;g.add(b);return b});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.06,6,40),toon(0xcfeaff,0x6ab0ff));ring.visible=false;g.add(ring);
  const ringI=new THREE.Mesh(new THREE.TorusGeometry(1,.1,6,40),ink(0x0b2350));ringI.visible=false;g.add(ringI);
  heroAtk('diag');
  add({name:'3D · 수: 휘감아 내리꽂는 물줄기',g,L:1.7,step(t){const hd=ez(t/.8),tl=Math.max(0,(t-.5)/.9);main.range(tl,hd);foam.range(Math.max(0,tl-.05),hd*.97);
    const hp=curve.getPointAt(Math.min(1,hd));head.position.copy(hp);head.visible=hd<1;
    if(t>.8){const k=t-.8;for(const b of drops){b.visible=k<.8;b.position.set(T.x+b.v.x*k*.35,T.y+b.v.y*k*.35,Math.max(0,b.v.z*k-6*k*k))}
      for(const r of[ring,ringI]){r.visible=true;r.position.set(T.x,T.y,.02);const s=.3+k*2.2;r.scale.set(s,s,s)}fade(ring,1-k/.9);fade(ringI,.8*(1-k/.9));if(!this.hit){this.hit=1;shake=Math.max(shake,.2)}}
    fade(main,t>1.3?1-(t-1.3)/.4:1);fade(foam,t>1.3?1-(t-1.3)/.4:1)}})}

// ---- 2) 화: 상대 발밑에서 솟아 휘도는 불기둥 (세 가닥 + 불꽃 혀 + 불티) ----
function fire(){const T=F.tgt(),g=new THREE.Group();g.position.set(T.x,T.y,0);
  const strands=[0,1,2].map(s=>{const pts=[];for(let i=0;i<=30;i++){const u=i/30,a=s*2.094+u*Math.PI*4,r=.25+u*.75;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,u*2.8))}
    const t=tube(new THREE.CatmullRomCurve3(pts),.2,u=>1-u*.75,s?0xff7a24:0xffc64a,s?0xd03a10:0xff9a30,0x4a0e04);g.add(t);return t});
  const core=tube(new THREE.CatmullRomCurve3([0,.6,1.2,1.8,2.4].map((z,i)=>new THREE.Vector3(Math.sin(i)*.08,Math.cos(i)*.08,z))),.3,u=>1-u*.6,0xfff0a8,0xffd060,0x4a0e04);g.add(core);
  const tongues=[...Array(9)].map((_,i)=>{const a=i/9*6.283,c=new THREE.Group(),h=.5+Math.random()*.4;
    c.add(new THREE.Mesh(new THREE.ConeGeometry(.17,h+.08,6),ink(0x4a0e04)),new THREE.Mesh(new THREE.ConeGeometry(.13,h,6),toon(i%2?0xff8a2a:0xffd04a,0xff5010)));
    c.children.forEach(m=>{m.rotation.x=Math.PI/2;m.position.z=h/2});c.position.set(Math.cos(a)*.75,Math.sin(a)*.75,0);g.add(c);return c});
  const embers=[...Array(16)].map(()=>{const b=ball(.05,0xffe08a,0xffa030,0x4a0e04,.02);b.a=Math.random()*6.283;b.r=.3+Math.random()*.8;b.s=1.5+Math.random()*2;g.add(b);return b});
  heroAtk('vert');
  add({name:'3D · 화: 휘도는 불기둥',g,L:1.8,step(t){const up=ez(t/.45),off=Math.max(0,(t-1.05)/.7);g.rotation.z=t*5;
    strands.forEach((s,i)=>s.range(off,up*(1-i*.06)));core.range(off,up*.85);
    tongues.forEach((c,i)=>{const k=Math.sin(Math.min(1,t/1.5)*Math.PI);c.scale.set(k,k,k*(1+.25*Math.sin(t*22+i)))});
    embers.forEach(b=>{const z=((t*b.s)%2.8);b.position.set(Math.cos(b.a+t*3)*b.r,Math.sin(b.a+t*3)*b.r,z);b.visible=t>.2&&t<1.6});
    if(t>.3&&!this.hit){this.hit=1;shake=Math.max(shake,.15)}fade(g,t>1.4?1-(t-1.4)/.4:1)}})}

// ---- 3) 입체 검기: 기울어진 면을 따라 휘도는 반달 날 (굵은 윤곽 + 3단 띠) ----
function blade(){const T=F.tgt(),ang=Math.atan2(T.y-P.y,T.x-P.x),g=new THREE.Group();g.position.set(P.x,P.y,.9);g.rotation.z=ang;
  const N=48,mk=(w,col,ord)=>{const pos=[],cols=[],idx=[],c0=new THREE.Color(col);
    for(let i=0;i<=N;i++){const u=i/N,a=-1.9+u*3.8,wd=w*Math.pow(Math.sin(u*Math.PI),.7)+.02,r1=1.55,r0=r1-wd;
      for(const[r,band]of[[r1,1],[r1-wd*.35,.8],[r0,.45]]){pos.push(Math.cos(a)*r,Math.sin(a)*r,0);const cc=ord?c0.clone():new THREE.Color(0xffffff).lerp(c0,1-band);cols.push(cc.r,cc.g,cc.b)}}
    for(let i=0;i<N;i++)for(let b=0;b<2;b++){const q=i*3+b;idx.push(q,q+3,q+1,q+1,q+3,q+4)}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.setIndex(idx);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,depthTest:false}));m.renderOrder=ord?1:2;return m};
  // 기울기 방향: 면의 법선이 시선(1,1,1)을 향하는 쪽으로 (반대로 기울이면 날이 옆으로 서서 거의 안 보인다)
  const vd=new THREE.Vector3(1,1,1).normalize(),tilt=s=>new THREE.Vector3(0,0,1).applyEuler(new THREE.Euler(s*.75,0,0)).applyAxisAngle(new THREE.Vector3(0,0,1),ang).dot(vd),sg=tilt(1)>=tilt(-1)?1:-1;
  const plane=new THREE.Group();plane.rotation.x=sg*.75;g.add(plane);
  const line=mk(.62,0x0a1830,1),core=mk(.5,0x6fb8ff,0);core.position.z=.001;line.scale.set(1.04,1.04,1);plane.add(line,core);
  heroAtk('diag');
  add({name:'3D · 입체 검기: 기울어진 반달 날',g,L:.9,step(t){const hd=ez(t/.28),tl=Math.max(0,(t-.18)/.55);
    for(const m of[line,core]){const s=Math.floor(tl*N)*12,n=Math.max(0,Math.ceil((hd-tl)*N))*12;m.geometry.setDrawRange(s,n)}
    plane.rotation.x=sg*(.75-t*.5);plane.rotation.y=Math.sin(t*4)*.15;fade(g,t>.6?1-(t-.6)/.3:1)}})}

let last=0,frames=[],fps=0;
function loop(now){requestAnimationFrame(loop);if(!R||!P)return;frames.push(now);while(frames.length&&now-frames[0]>1000)frames.shift();fps=frames.length;
  const t0=time;for(let i=live.length-1;i>=0;i--){const f=live[i];f.t0=f.t0??t0;const t=t0-f.t0;if(t>f.L){scene.remove(f.g);f.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});live.splice(i,1);continue}f.step(t)}
  if(!live.length&&!loop.dirty){return}loop.dirty=live.length>0;fit();proj();R.render(scene,cam3);
  if(live.length&&now-last>250){last=now;const el=$('fx3dfps');if(el)el.textContent=`${fps} fps · 3D 이펙트 ${live.length}개`}}
requestAnimationFrame(loop);
// [3D 함수, 이름, 2D 비교 때 속성, 2D 비교 때 고를 초식 모양]
const PLAY={water:[water,'수: 휘감아 내리꽂는 물줄기','수',['line','proj','arc']],fire:[fire,'화: 휘도는 불기둥','화',['drop','rain','circle']],blade:[blade,'입체 검기 (반달 날)','',['arc','melee','multi']]};
F.EXT.fx3d={n:'3D 시범',
  html:()=>R?`<p class="dim">게임 화면 위에 3D 화면을 겹쳐 툰 렌더링(3단 명암 + 굵은 윤곽선)으로 그린 시범이다. 옆 단추는 같은 자리의 지금 2D 이펙트.</p>
    <div class="grid">${Object.entries(PLAY).map(([k,[,n]])=>F.btn(`<span class="form"><b>3D · ${F.esc(n)}</b></span>`,'p3:'+k)+F.btn(`<span class="form"><b>2D로 비교</b><small>${F.esc(n.split(':')[0])} 속성 초식</small></span>`,'p2:'+k)).join('')}</div>
    <p class="dim" id="fx3dfps"></p><p class="dim">3D 화면이 맨 위에 겹쳐서 나무·지붕·인물 뒤로 숨지는 않는다. 휴대폰에서는 위 숫자(fps)가 50 아래로 떨어지는지 봐 주세요.</p>`
    :'<p class="dim">이 기기·브라우저에서는 WebGL 을 쓸 수 없어 3D 시범을 보여 줄 수 없다.</p>',
  act(k,v){const d=PLAY[v];if(!d)return;
    if(k==='p3')F.play(()=>{F.place();d[0]()},'3D · '+d[1]);
    if(k==='p2')F.play(()=>{const id=V.art||Object.keys(ARTS).find(i=>ARTS[i].cls==='검'&&!ARTS[i].base),fs=ARTS[id].forms,want=d[3],i=Math.max(0,fs.findIndex(f=>want.includes(f.p)));
      const el=V.el;V.el=d[2]||el;F.useArtFx(id,i);clearTimeout(PLAY.t);PLAY.t=setTimeout(()=>V.el=el,2500)},'2D · '+d[1])}};
window.FX3D={live,play:k=>PLAY[k][0](),ok:!!R};
F.render();
})();

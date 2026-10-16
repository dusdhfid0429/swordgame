import json,math,sys
from PIL import Image,ImageDraw
import numpy as np
SRC=sys.argv[1];OUT=sys.argv[2]
im=Image.open(SRC).convert('RGB');a=np.array(im).astype(int);H,W=a.shape[:2]
r,g,b=a[...,0],a[...,1],a[...,2]
bg=(r>140)&(b>140)&(g<r-50)&(g<b-50)          # 마젠타 (번진 테두리 포함)
green=(g>150)&(r<120)&(b<120)
fg=~bg
def label(mask,rad=2,minpx=1):
  Hh,Ww=mask.shape;lab=np.zeros((Hh,Ww),int);k=0;ys,xs=np.where(mask);comps=[]
  for y0,x0 in zip(ys,xs):
    if lab[y0,x0]:continue
    k+=1;st=[(y0,x0)];lab[y0,x0]=k;pts=[]
    while st:
      cy,cx=st.pop();pts.append((cy,cx))
      for ny in range(max(0,cy-rad),min(Hh,cy+rad+1)):
        for nx in range(max(0,cx-rad),min(Ww,cx+rad+1)):
          if mask[ny,nx] and not lab[ny,nx]:lab[ny,nx]=k;st.append((ny,nx))
    comps.append(pts)
  return lab,comps
# 마커
_,gc=label(green,2);markers=[(np.mean([p[1] for p in c]),np.mean([p[0] for p in c]),len(c)) for c in gc if len(c)>=50]
# 조각
lab,comps=label(fg,2)
pieces=[]
for pts in comps:
  if len(pts)<150:continue
  ys=[p[0] for p in pts];xs=[p[1] for p in pts];x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
  if y0>770:continue   # 권 장갑 줄은 아직 안 쓴다
  mk=[m for m in markers if x0-2<=m[0]<=x1+2 and y0-2<=m[1]<=y1+2]
  if not mk:
    if y1<300:pieces.append(dict(x0=x0,y0=y0,x1=x1,y1=y1,pts=pts,grip=None))   # 검집·도집: 마커 없는 조각 (1~2줄)
    continue
  mk=max(mk,key=lambda m:m[2])
  pieces.append(dict(x0=x0,y0=y0,x1=x1,y1=y1,pts=pts,grip=(mk[0],mk[1])))
# 칼집의 입(grip)은 같은 칸의 칼 손잡이(마커)에 가까운 쪽 끝
for pc in pieces:
  if pc['grip'] is None:
    cx,cy=(pc['x0']+pc['x1'])/2,(pc['y0']+pc['y1'])/2
    sw=min([q for q in pieces if q['grip'] is not None and abs((q['y0']+q['y1'])/2-cy)<120],key=lambda q:abs((q['x0']+q['x1'])/2-cx))
    pc['sheath']=True;pc['near']=sw['grip']
def kind(y):return '검' if y<160 else '도' if y<300 else '창' if y<450 else '봉' if y<600 else '궁'
frames=[];clips={}
for pc in pieces:
  x0,y0,x1,y1=pc['x0'],pc['y0'],pc['x1'],pc['y1'];w,h=x1-x0+1,y1-y0+1
  crop=a[y0:y1+1,x0:x1+1];m=np.zeros((h,w),bool)
  for p in pc['pts']:m[p[0]-y0,p[1]-x0]=True
  gm=green[y0:y1+1,x0:x1+1]&m
  # 마커 픽셀(둘레 2px 포함)은 가장 가까운 비마커 전경 픽셀로 메운다
  sheath=pc.get('sheath')
  gx,gy=(0,0) if sheath else (pc['grip'][0]-x0,pc['grip'][1]-y0)
  gd=np.zeros_like(gm)
  ys,xs=np.where(gm)
  for yy,xx in zip(ys,xs):gd[max(0,yy-2):yy+3,max(0,xx-2):xx+3]=True
  gd&=m
  rgba=np.zeros((h,w,4),np.uint8);rgba[...,:3]=crop;rgba[...,3]=np.where(m,255,0)
  # 마젠타 번짐(가장자리의 보랏빛) → 안쪽 깨끗한 픽셀 색으로
  cr,cg,cb=crop[...,0],crop[...,1],crop[...,2];fringe=m&(cr>cg+45)&(cb>cg+45)
  clean=m&~fringe;cs=np.where(clean)
  if len(cs[0]):
    for yy,xx in zip(*np.where(fringe)):
      d=(cs[0]-yy)**2+(cs[1]-xx)**2;j=int(np.argmin(d));rgba[yy,xx,:3]=crop[cs[0][j],cs[1][j]]
  src=np.where(m&~gd);
  if len(src[0]):
    for yy,xx in zip(*np.where(gd)):
      d=(src[0]-yy)**2+(src[1]-xx)**2;j=int(np.argmin(d));rgba[yy,xx,:3]=crop[src[0][j],src[1][j]]
  # 마젠타 번짐 제거: 전경 가장자리의 붉은 기 빼기
  axis_pts=np.array([(p[1]-x0,p[0]-y0) for p in pc['pts'] if not gd[p[0]-y0,p[1]-x0]],float)
  c=axis_pts.mean(0);cov=np.cov((axis_pts-c).T);ev,evec=np.linalg.eigh(cov);u=evec[:,np.argmax(ev)]
  proj=(axis_pts-c)@u;lo,hi=proj.min(),proj.max();e1=c+u*lo;e2=c+u*hi
  if sheath and hi-lo>=130:continue   # 마커가 없는 긴 조각 = 마커 못 찾은 칼. 버린다 (칼집은 130px보다 짧다)
  if sheath:   # 입=칼 손잡이 마커에 가까운 끝, 그 끝을 grip으로
    ref=np.array([pc['near'][0]-x0,pc['near'][1]-y0]);mouth,tip=(e1,e2) if np.linalg.norm(e1-ref)<np.linalg.norm(e2-ref) else (e2,e1);gx,gy=mouth;butt=mouth
  else:
    gpos=np.array([gx,gy]);tip,butt=(e2,e1) if np.linalg.norm(e2-gpos)>np.linalg.norm(e1-gpos) else (e1,e2)
  k=kind((y0+y1)/2)+('집' if sheath else '');idx=len(frames)
  frames.append(dict(img=Image.fromarray(rgba),w=w,h=h,grip=(gx,gy),tip=tuple(tip),butt=tuple(butt),kind=k,src=(x0,y0)))
  clips.setdefault(k,[]).append(idx)
print({k:len(v) for k,v in clips.items()},'pieces',len(frames))
# 아틀라스 packing (선반)
PAD=2;AW=1024;x=PAD;y=PAD;rowh=0;pos=[]
order=sorted(range(len(frames)),key=lambda i:-frames[i]['h'])
for i in order:
  f=frames[i]
  if x+f['w']+PAD>AW:x=PAD;y+=rowh+PAD;rowh=0
  pos.append((i,x,y));x+=f['w']+PAD;rowh=max(rowh,f['h'])
AH=int(((y+rowh+PAD+63)//64)*64)
atlas=Image.new('RGBA',(AW,AH),(0,0,0,0))
for i,px,py in pos:atlas.paste(frames[i]['img'],(px,py))
atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(OUT+'/wpn.png',optimize=True)
fr={}
for i,px,py in sorted(pos):
  f=frames[i];f["w"],f["h"]=int(f["w"]),int(f["h"]);px,py=int(px),int(py);fr[f'wpn_{i:03d}']=dict(index=i,rect=dict(x=px,y=py,w=f['w'],h=f['h']),offset=dict(x=0,y=0),sourceSize=dict(w=f['w'],h=f['h']),
    pivot=dict(x=round(float(f['grip'][0])/f['w'],4),y=round(float(f['grip'][1])/f['h'],4)),trimmed=True,kind=f['kind'],
    sockets=[dict(name='grip',x=round(float(f['grip'][0]),1),y=round(float(f['grip'][1]),1)),dict(name='tip',x=round(float(f['tip'][0]),1),y=round(float(f['tip'][1]),1)),dict(name='butt',x=round(float(f['butt'][0]),1),y=round(float(f['butt'][1]),1))])
json.dump(dict(atlas='wpn.png',size=dict(w=AW,h=AH),frames=fr,_doc='무기 파츠 시트 (사용자 제공 2026-10-16, 초록 마커=손 위치). sockets: grip=손, tip=끝, butt=반대 끝(주축 PCA). pivot=grip. kind=무기 종류'),open(OUT+'/wpn.atlas.json','w'),ensure_ascii=False,indent=0,separators=(',',':'))
json.dump(dict(atlas='wpn.png',clips={k:dict(frames=v,fps=0,loop=False,durations_ms=None,events=[],canvas=None) for k,v in clips.items()},_doc='클립 이름=무기 종류. 장은 방향이 다른 같은 무기 그림; 런타임이 필요한 각도에 가장 가까운 장을 골라 돌린다'),open(OUT+'/wpn.clips.json','w'),ensure_ascii=False,indent=1)
# 검증 그림: 조각 + grip(빨강) tip(노랑) butt(파랑)
sheet=Image.open(SRC).convert('RGB');d=ImageDraw.Draw(sheet)
for f in frames:
  ox,oy=f['src'];d.rectangle((ox,oy,ox+f['w'],oy+f['h']),outline=(0,0,255));gx,gy=f['grip'];d.ellipse((ox+gx-4,oy+gy-4,ox+gx+4,oy+gy+4),outline=(255,0,0),width=2)
  tx,ty=f['tip'];d.ellipse((ox+tx-4,oy+ty-4,ox+tx+4,oy+ty+4),outline=(255,255,0),width=2);bx,by=f['butt'];d.ellipse((ox+bx-4,oy+by-4,ox+bx+4,oy+by+4),outline=(0,160,255),width=2);d.text((ox,oy-10),f['kind'],fill=(0,0,0))
sheet.save(OUT+'/check.png')

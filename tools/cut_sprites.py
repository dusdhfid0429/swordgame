# 사용자 시트 -> src/r_atlas2.js 프레임 자르기 (2026-10-12). 입력 시트는 세션 업로드 경로(U)에 있어야 한다. 사용: python3 -I tools/cut_sprites.py <출력폴더> 뒤에 hero2.png/json을 base64로 r_atlas2.js에 넣는다 (docs/세력_문파_설계.md 25장)
import sys,json
from PIL import Image
import numpy as np
from collections import deque
U='/root/.claude/uploads/9490c289-fecb-5976-9395-b9af4b3f3d1e/'
CACHE={}
def mask_of(path,lab=78):
    if path in CACHE:return CACHE[path]
    im=Image.open(path);a=np.asarray(im.convert('RGB')).astype(int);bg=a[3,3]
    near=(np.abs(a-bg).sum(axis=2)<36)
    h,w=near.shape;bgm=np.zeros((h,w),bool);q=deque()
    for y in range(h):
        for x in (0,w-1):
            if near[y,x] and not bgm[y,x]:bgm[y,x]=True;q.append((y,x))
    for x in range(w):
        for y in (0,h-1):
            if near[y,x] and not bgm[y,x]:bgm[y,x]=True;q.append((y,x))
    while q:
        cy,cx=q.popleft()
        for ny,nx in((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
            if 0<=ny<h and 0<=nx<w and near[ny,nx] and not bgm[ny,nx]:bgm[ny,nx]=True;q.append((ny,nx))
    fg=~bgm;fg[:,:lab]=False
    CACHE[path]=(a,fg);return a,fg
def comps(m):
    h,w=m.shape;lab=np.zeros((h,w),np.int32);n=0;out=[]
    ys,xs=np.nonzero(m)
    for y,x in zip(ys,xs):
        if lab[y,x]:continue
        n+=1;lab[y,x]=n;q=deque([(y,x)]);pts=[(y,x)]
        while q:
            cy,cx=q.popleft()
            for dy in(-1,0,1):
                for dx in(-1,0,1):
                    ny,nx=cy+dy,cx+dx
                    if 0<=ny<h and 0<=nx<w and m[ny,nx] and not lab[ny,nx]:lab[ny,nx]=n;q.append((ny,nx));pts.append((ny,nx))
        pts=np.array(pts);out.append((n,pts))
    return lab,out
def valley(proj,nom,rad):
    lo=max(0,int(nom-rad));hi=min(len(proj)-1,int(nom+rad));seg=proj[lo:hi+1]
    i=int(np.argmin(seg));return lo+i
LCOMP={('도',1),('각',0),('fk',2)}|{('rj',i) for i in range(9)}
NAME=None
def cells(path,row,nrows,ncol,labw=78):
    a,fg=mask_of(path,labw);H,W=fg.shape;rh=H/nrows
    yp=fg.sum(axis=1);y0=0 if row==0 else valley(yp,row*rh,22);y1=H if row==nrows-1 else valley(yp,(row+1)*rh,22)
    band=fg[y0:y1];xp=band.sum(axis=0)
    runs=[];on=False
    for x in range(W):
        if xp[x]>0 and not on:on=True;s=x
        if xp[x]==0 and on:on=False;runs.append((s,x))
    if on:runs.append((s,W))
    runs=[r for r in runs if r[1]-r[0]>=14]
    ks=[1]*len(runs)
    while ncol and sum(ks)<ncol:
        i=max(range(len(runs)),key=lambda j:(runs[j][1]-runs[j][0])/(ks[j]+1));ks[i]+=1
    segs=[]
    for (s,e),k in zip(runs,ks):
        cuts=[s]+[valley(xp,s+(e-s)*j/k,18) for j in range(1,k)]+[e]
        segs+=[(cuts[j],cuts[j+1]) for j in range(k)]
    xb=segs;ncol=len(segs)
    out=[]
    for i in range(ncol):
        xs0,xs1=xb[i];sub=band[:,xs0:xs1]
        if sub.sum()<80:out.append(None);continue
        lab,cs=comps(sub)
        cs.sort(key=lambda c:-len(c[1]));main=cs[0][1];by0,by1,bx0,bx1=main[:,0].min()-12,main[:,0].max()+12,main[:,1].min()-12,main[:,1].max()+12
        keep=np.zeros(sub.shape,bool)
        if (NAME,i) in LCOMP:cs=cs[:1]
        for n,p in cs:
            if n==cs[0][0] or len(p)<400 and (p[:,0].min()<=by1 and p[:,0].max()>=by0 and p[:,1].min()<=bx1 and p[:,1].max()>=bx0) or len(p)>=400 and (p[:,0].min()<=by1 and p[:,0].max()>=by0 and p[:,1].min()<=bx1-12 and p[:,1].max()>=bx0+12):
                keep[p[:,0],p[:,1]]=True
        ys,xs=np.where(keep)
        ya,yb,xa,xc=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        rgba=np.zeros((yb-ya,xc-xa,4),np.uint8);rgba[...,:3]=a[y0+ya:y0+yb,xs0+xa:xs0+xc];rgba[...,3]=keep[ya:yb,xa:xc]*255
        p=rgba[...,:3].astype(int);al=rgba[...,3]>0
        navy=al&(p[...,2]>p[...,0]+8)&(p[...,0]<90)&(p[...,2]<130)
        hh=rgba.shape[0];tb=navy.copy();tb[:int(hh*.4)]=False;tb[int(hh*.78):]=False
        src=tb if tb.sum()>40 else navy
        ax=float(np.median(np.where(src)[1])) if src.sum()>20 else rgba.shape[1]/2
        out.append({'img':Image.fromarray(rgba),'bottom':int(y0+yb),'ax':round(ax,1)})
    return out
SPEC=[('도',U+'65b74e3d-image.png',0,5,8),('봉',U+'65b74e3d-image.png',1,5,9),('창',U+'65b74e3d-image.png',2,5,9),('권',U+'65b74e3d-image.png',3,5,9),('각',U+'65b74e3d-image.png',4,5,8),
 ('궁',U+'59d12423-image.png',4,5,8),
 ('i도',U+'41757732-image.png',1,5,9),('i봉',U+'41757732-image.png',2,5,9),('i창',U+'41757732-image.png',3,5,9),('i각',U+'41757732-image.png',4,5,8),
 ('i권',U+'da4febc0-image.png',0,5,9),('i궁',U+'da4febc0-image.png',3,5,9),
 ('j',U+'3d1e1a3a-image.png',0,3,9)]
all=[];meta={}
B1=U+'fa306127-image.png';B2=U+'e31ba2a0-image.png'
SPEC+=[('bd1',B1,0,4,0,200),('bd3',B1,2,4,0,200),('bd4',B1,3,4,0,200),('sd',B2,0,5,12,125),('fk',B2,1,5,0,125),('sp',B2,2,5,9,125),('wv',B2,3,5,9,125)]
B3=U+'5af20d99-image.png'

SPEC+=[('j2',U+'3d1e1a3a-image.png',1,3,9),('j3',U+'3d1e1a3a-image.png',2,3,7)]
SCALE={B1:round(102/156,3),B2:round(102/110,3),B3:None}
for sp in SPEC:
    name,path,row,nr,n=sp[:5];labw=sp[5] if len(sp)>5 else 78
    NAME=name;fr=[f for f in cells(path,row,nr,n,labw) if f]
    if n:fr=fr[:n]
    ground=max(f['bottom'] for f in fr)
    meta[name]=[len(all),len(fr)]
    sc=SCALE.get(path,1)
    if sc is None:sc=SCALE[path]=round(102/fr[0]['img'].height,3);print('scale',name,sc)
    for f in fr: f['yoff']=int(ground-f['bottom']);f['sc']=sc;all.append(f)
    print(name,len(fr),[(f['img'].width,f['img'].height,f['yoff']) for f in fr])
# 달리기 합성(R줄)은 사용자 요청으로 뺐다 (2026-10-12): 달리기는 기존 몸통 도트 + 코드 무기
H=max(f['img'].height for f in all);W=sum(f['img'].width+2 for f in all)
strip=Image.new('RGBA',(W,H));x=0;HF=[]
for f in all:
    strip.paste(f['img'],(x,0));HF.append([x,f['img'].width,f['img'].height,f['ax'],f['yoff'],f['sc']]);x+=f['img'].width+2
strip.save(sys.argv[1]+'/hero2.png',optimize=True)
json.dump({'HF':HF,'meta':meta},open(sys.argv[1]+'/hero2.json','w'))
print('strip',strip.size)

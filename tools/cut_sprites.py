# 사용자 시트 -> src/r_atlas2.js 프레임 자르기·달리기 합성 (2026-10-12). 입력 시트는 세션 업로드 경로(U)에 있어야 한다. 사용: python3 -I tools/cut_sprites.py <출력폴더> 뒤에 hero2.png/json을 base64로 r_atlas2.js에 넣는다 (docs/세력_문파_설계.md 25장)
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
SPEC+=[('rj',U+'3d1e1a3a-image.png',0,3,9)]
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
# ---- 달리기 합성: 경공 1단의 질주 두 장(반대 보폭)을 번갈아 쓰고 무기를 붙인다 (먼지는 뺀 rj 줄) ----
from PIL import ImageDraw
import math
def skin_hand(img):
    a=np.asarray(img).astype(int);al=a[...,3]>0;r,g,b=a[...,0],a[...,1],a[...,2]
    sk=al&(r>170)&(g>120)&(b>90)&(r>g+15)&(g>b+5);h=img.height;sk[:int(h*.38)]=False
    ys,xs=np.where(sk)
    if len(xs)<10:return (img.width*.7,h*.5)
    xm=xs.max();sel=xs>xm-14;return (float(xs[sel].mean()),float(ys[sel].mean()))
DK=(20,16,12)
def L(d,p,q,wd,col):d.line([p,q],fill=DK,width=wd+2);d.line([p,q],fill=col,width=wd)
def sheath_under(img,w,ax,sy):pass
def sheath_over(img,w,ax,sy):
    # 허리띠에 찬 집: 엉덩이에서 뒤로 비스듬히, 손잡이는 앞 위로. 몸 위에 그려 잘 보이게 한다
    d=ImageDraw.Draw(img);hip=(ax-1,sy-6);tip=(ax-46,sy+14);col=(36,32,50) if w=='검' else (86,54,30)
    L(d,hip,tip,6,col);d.line([(hip[0]-4,hip[1]+1),(tip[0]+4,tip[1]-1)],fill=(96,92,120) if w=='검' else (128,90,54),width=1)
    d.line([(tip[0]+6,tip[1]-3),tip],fill=(200,160,70),width=5)
    g=(ax+10,sy-16);L(d,hip,g,3,(62,42,28));d.line([(hip[0]-3,hip[1]+4),(hip[0]+3,hip[1]-4)],fill=(200,160,70),width=3);d.ellipse([g[0]-2,g[1]-2,g[0]+2,g[1]+2],fill=(200,160,70))
def pole(img,w,hand):
    d=ImageDraw.Draw(img);hx,hy=hand;ang=math.radians(-10);ux,uy=math.cos(ang),-math.sin(ang);hy+=5
    back=(hx-ux*78,hy-uy*78);fwd=(hx+ux*(44 if w=='창' else 56),hy+uy*(44 if w=='창' else 56))
    L(d,back,fwd,4,(108,70,38) if w=='봉' else (120,78,40))
    if w=='봉':
        d.line([back,(back[0]+ux*7,back[1]+uy*7)],fill=(200,160,70),width=4);d.line([fwd,(fwd[0]-ux*7,fwd[1]-uy*7)],fill=(200,160,70),width=4)
    else:
        tip=(fwd[0]+ux*24,fwd[1]+uy*24);nx,ny=-uy,ux
        d.polygon([(fwd[0]+nx*5,fwd[1]+ny*5),(fwd[0]-nx*5,fwd[1]-ny*5),tip],fill=DK)
        d.polygon([(fwd[0]+nx*3,fwd[1]+ny*3),(fwd[0]-nx*3,fwd[1]-ny*3),(tip[0]-ux*2,tip[1]-uy*2)],fill=(225,230,236))
        d.polygon([(fwd[0]-ux*2+nx*4,fwd[1]-uy*2+ny*4),(fwd[0]-ux*10+nx*7,fwd[1]-uy*10+ny*7),(fwd[0]-ux*12-nx*2,fwd[1]-uy*12-ny*2),(fwd[0]-ux*2-nx*3,fwd[1]-uy*2-ny*3)],fill=(180,40,30))
def bow(img,hand):
    d=ImageDraw.Draw(img);hx,hy=hand;top=(hx+1,hy-32);bot=(hx-1,hy+32);mid=(hx+8,hy)
    d.line([top,bot],fill=(230,225,205),width=1)
    pts=[(top[0]+(mid[0]-top[0])*t*2 if t<.5 else mid[0]+(bot[0]-mid[0])*(t-.5)*2, top[1]+(bot[1]-top[1])*t) for t in[i/16 for i in range(17)]]
    d.line(pts,fill=DK,width=4);d.line(pts,fill=(120,78,40),width=2)
def with_weapon(src,w,up):
    base=src['img'];pad=36;img=Image.new('RGBA',(base.width+pad*2,base.height+8),(0,0,0,0));img.alpha_composite(base,(pad,4+up))
    ax=src['ax']+pad;hand=skin_hand(base);hand=(hand[0]+pad,hand[1]+4+up);sy=int(base.height*.62)+4+up
    if w in('검','도'):
        under=Image.new('RGBA',img.size,(0,0,0,0));sheath_under(under,w,ax,sy);img=Image.alpha_composite(under,img);sheath_over(img,w,ax,sy)
    elif w in('봉','창'):pole(img,w,hand)
    elif w=='궁':bow(img,hand)
    a=np.asarray(img);ys,xs=np.where(a[...,3]>0);img=img.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    return {'img':img,'ax':round(ax-xs.min(),1),'bottom':src['bottom']-up,'sc':src['sc']}
_a=all[meta['rj'][0]+1];_b=all[meta['rj'][0]+2]
for _w in ['검','도','봉','창','권','궁']:
    _fr=[with_weapon(_a,_w,0),with_weapon(_a,_w,2),with_weapon(_b,_w,0),with_weapon(_b,_w,2)]
    _g=max(f['bottom'] for f in _fr);meta['R'+_w]=[len(all),len(_fr)]
    for f in _fr:f['yoff']=int(_g-f['bottom']);all.append(f)
    print('R'+_w,[(f['img'].width,f['img'].height,f['yoff']) for f in _fr])

H=max(f['img'].height for f in all);W=sum(f['img'].width+2 for f in all)
strip=Image.new('RGBA',(W,H));x=0;HF=[]
for f in all:
    strip.paste(f['img'],(x,0));HF.append([x,f['img'].width,f['img'].height,f['ax'],f['yoff'],f['sc']]);x+=f['img'].width+2
strip.save(sys.argv[1]+'/hero2.png',optimize=True)
json.dump({'HF':HF,'meta':meta},open(sys.argv[1]+'/hero2.json','w'))
print('strip',strip.size)

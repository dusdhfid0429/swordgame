#!/usr/bin/env python3
"""무공별 보정값 ARTK 를 다시 쓴다 (data/artbal.json). 경지마다 따로 잰다: 내공량·방어 깎임이 경지마다 달라 한 경지에서 맞춘 값이 다른 경지에서는 어긋난다.
  tools/art_budget.sh 가 경지 0~6 을 차례로 돌린다. 한 경지만:
  1) python3 build.py
  2) R=4 PWPATH=$(npm root -g)/playwright node tests/sim_arts.js /tmp/raw.json --raw
  3) python3 tools/art_budget.py /tmp/raw.json 4 && python3 build.py
  4) R=4 node tests/sim_arts.js /tmp/fix.json && python3 tools/art_budget.py /tmp/fix.json 4 --iter && python3 build.py   (두세 번)
점수 = sqrt(보스 하나 초당 피해 × 정예 셋 초당 피해 / 전체 가운데 비율): 한 명만 재면 범위 초식이 손해를 본다.
목표 = t0 × 등급 × 병기 × (같은 병기·등급 안에서의 상대 위치를 band 안으로 눌러 담은 값). t0 = 그 경지 하승 가운데 값 (하승은 평균적으로 그대로)."""
import json,sys,statistics as st,os,re
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(ROOT,'data','artbal.json');NR=7
raw=[x for x in json.load(open(sys.argv[1])) if 'one' in x];R=int(sys.argv[2]);ITER='--iter' in sys.argv
cfg=json.load(open(P));B=cfg['ARTBAL'];AK=cfg.get('ARTK') or {}
B.setdefault('t0',[0]*NR);B.setdefault('fb',[{} for _ in range(NR)])
old=lambda i:(AK.get(i) or [1]*NR)[R] if ITER else 1
gn=st.median(x['grp']/max(1,x['one']) for x in raw)
for x in raw:x['s']=(x['one']*x['grp']/gn)**.5;x['r']=x['s']/old(x['id'])
t0=B['t0'][R] if ITER else st.median(x['s']/B['cls'].get(x['cls'],1) for x in raw if x['g']==0);B['t0'][R]=round(t0)
grp={}
for x in raw:grp.setdefault((x['cls'],x['g']),[]).append(x['r'])
fb={}
for x in raw:
    rel=x['r']/st.median(grp[(x['cls'],x['g'])])
    pos=max(1-B['band'],min(1+B['band'],1+(rel-1)*.15))
    k=round(max(.3,min(3,t0*B['grade'][x['g']]*B['cls'].get(x['cls'],1)*pos/x['r'])),3)
    AK.setdefault(x['id'],[1]*NR)[R]=k;fb.setdefault(x['cls'],[[] for _ in B['grade']])[x['g']].append(k)
F={c:[round(st.median(v),3) if v else None for v in gs] for c,gs in fb.items()}   # 창안 무공처럼 잰 적 없는 무공이 쓰는 값: 같은 병기·등급의 가운데 보정값
for c,gs in F.items():
    for i,v in enumerate(gs):
        if v is None:gs[i]=next((u for u in reversed(gs[:i]) if u is not None),1)
B['fb'][R]=F;cfg['ARTK']=AK
head=json.dumps({k:v for k,v in cfg.items() if k!='ARTK'},ensure_ascii=False,indent=1)
body=',\n'.join('  "%s": %s'%(k,json.dumps(v)) for k,v in AK.items())
open(P,'w',encoding='utf8').write(head[:-2]+',\n "ARTK": {\n'+body+'\n }\n}\n')
ks=sorted(v[R] for v in AK.values());print('경지',R,'t0',round(t0),'무공',len(AK),'보정값 최소 %.2f 가운데 %.2f 최대 %.2f'%(ks[0],ks[len(ks)//2],ks[-1]))

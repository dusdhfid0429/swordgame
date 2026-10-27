"""v189 맨손 대기·달리기 (사용자 2026-10-27: 검을 들었을 때 동작에서 검과 검집만 지운 모양으로).
src/r_atlas.js 의 HBODY(검집을 지운 몸통 아틀라스) 대기 0~3·5장, 달리기 41~48장에 남아 있던 검 손잡이·검집 끝 조각을
tools/barehand.json 의 장별 영역으로 지운다. 이미 지운 그림에 다시 돌려도 바뀌는 것이 거의 없다(한 번만 쓴 도구).
  e: 다각형 안을 투명하게   c: [다각형, dx, dy] 다각형 안 불투명 칸을 (dx,dy) 떨어진 칸 색으로 메움(허리를 가로지른 손잡이)
  w: [x0,y0,x1,y1] 안의 밝은 칸만 지움(소매 옆 칼집 끝 쇠붙이)
지운 자리 옆 밝은 칸은 외곽선 색으로, 몸에서 떨어진 40칸 미만 부스러기는 지운다.
쓰기: python3 tools/barehand.py  (scipy, pillow 필요)"""
import re, json, io, os, base64
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AT = os.path.join(ROOT, 'src', 'r_atlas.js')
s = open(AT, encoding='utf8').read()
HF = json.loads(re.search(r"HF=(\[\[.*?\]\]);", s).group(1))
m = re.search(r"(HBODY\.src='data:image/png;base64,)([^']+)'", s)
B = np.array(Image.open(io.BytesIO(base64.b64decode(m.group(2)))).convert('RGBA'))
ER = json.load(open(os.path.join(ROOT, 'tools', 'barehand.json'), encoding='utf8'))

def poly(shape, p):
    im = Image.new('L', (shape[1], shape[0]), 0); ImageDraw.Draw(im).polygon([tuple(x) for x in p], fill=255); return np.array(im) > 0

for k, sp in ER.items():
    f = HF[int(k)]; a = B[:f[2], f[0]:f[0] + f[1]]          # 장 영역(뷰)
    was = a[..., 3] > 0; er = np.zeros(was.shape, bool)
    for p in sp.get('e', []): er |= poly(a.shape, p)
    a[er, 3] = 0
    for p, dx, dy in sp.get('c', []):
        mm = poly(a.shape, p); src = a.copy()
        for y, x in zip(*np.nonzero(mm)):
            sy, sx = y + dy, x + dx
            if 0 <= sy < a.shape[0] and 0 <= sx < a.shape[1] and src[y, x, 3] > 0: a[y, x] = src[sy, sx]
    for x0, y0, x1, y1 in sp.get('w', []):
        sub = a[y0:y1, x0:x1]; kk = (sub[..., :3].astype(int).sum(-1) > 330) & (sub[..., 3] > 0); sub[kk, 3] = 0; er[y0:y1, x0:x1] |= kk
    gone = er & was; op = a[..., 3] > 0; nb = np.zeros_like(gone)
    nb[1:] |= gone[:-1]; nb[:-1] |= gone[1:]; nb[:, 1:] |= gone[:, :-1]; nb[:, :-1] |= gone[:, 1:]
    a[nb & op & (a[..., :3].astype(int).sum(-1) > 150), :3] = [20, 16, 14]
    lab, n = ndimage.label(a[..., 3] > 0, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        for i, z in enumerate(sz):
            if z < 40: a[lab == i + 1, 3] = 0

# 원본처럼 팔레트 PNG로 (색이 256개 안쪽이라 그대로 담긴다)
flat = B.reshape(-1, 4); flat[flat[:, 3] == 0] = 0
cols, idx = np.unique(flat, axis=0, return_inverse=True); assert len(cols) <= 256, len(cols)
P = Image.fromarray(idx.reshape(B.shape[:2]).astype(np.uint8), 'P'); P.putpalette(cols[:, :3].astype(np.uint8).tobytes())
buf = io.BytesIO(); P.save(buf, 'PNG', optimize=True, transparency=cols[:, 3].astype(np.uint8).tobytes())
s = s[:m.start(2)] + base64.b64encode(buf.getvalue()).decode() + s[m.end(2):]
open(AT, 'w', encoding='utf8').write(s)
print('HBODY', len(m.group(2)), '->', len(base64.b64encode(buf.getvalue())))

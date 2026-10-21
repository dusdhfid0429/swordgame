"""v159: 칸이 같은 너비로 늘어선 사용자 시트(투명 배경, 발바닥 줄이 같음)를 핸드오프 포맷 시트 하나로 묶는다.
python tools/cellsheet.py assets/train2  → assets/train2/train2.{png,atlas.json,clips.json}
원본은 assets/train2/source_sheets/. 칸마다 SCALE배로 줄여 wuxia 시트와 같은 화면 배율(SHEET_K)로 그려지게 한다.
운기 시트는 기운(초록 고리·보라 구슬·반짝이)이 그려져 있어, 깨끗한 장(0·12·13·14)에 없는 색을 이웃 색으로 메워 지운다.
지운 장에는 손 사이 기운 자리를 소켓 qi로 남긴다 (초록 고리의 가운데). 기운은 코드가 심법 색으로 그린다."""
import json, os, sys
import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/train2'
NAME = os.path.basename(OUT.rstrip('/'))
SRC = os.path.join(OUT, 'source_sheets')
# 시트: 파일, 칸 수, 배율(wuxia 시트 px 기준), 발 가운데를 잴 장, 쓸 칸, 기운 지우기
SHEETS = [
    ('meditate_sheet.png', 15, 136 / 369, 0, [0, 1, 2, 11, 12, 13, 14], True),
    ('strength_sheet.png', 8, .41, 0, list(range(8)), False),
    ('agility_sheet.png', 10, .41, 5, list(range(10)), False),
    ('endurance_sheet.png', 11, .41, 6, list(range(11)), False),
]
# 클립: 이름 → (시트 번호, 칸 번호 배열). 같은 칸을 여러 번 써서 모았다 푸는 흐름을 만든다
CLIPS = {
    'medit': (0, [0, 1]),                                  # 운기조식: 결가부좌 숨쉬기
    'neigong': (0, [0, 1, 2, 11, 2, 11, 2, 11, 1, 0]),     # 내공 수련: 두 손 사이로 기운을 모았다 단전에 갈무리
    'origin': (0, [0, 12, 13, 14, 14, 14, 13, 12, 0]),     # 본원진기: 두 손을 무릎에 얹고 땅의 생기를 받는다
    'lift': (1, list(range(8))),                           # 근력: 바위 들어 올리기
    'vault': (2, list(range(10))),                         # 민첩: 장대 넘기
    'stance': (3, list(range(11))),                        # 지구력: 마보 버티기
}


def clean_qi(a, W, n):
    """깨끗한 장의 색에 없는 픽셀(기운)을 이웃 중앙값으로 메우고, 남는 것은 지운다. 손 사이 자리(초록 고리 가운데)를 돌려준다"""
    q = lambda x: (x[..., 0] // 12) * 10000 + (x[..., 1] // 12) * 100 + (x[..., 2] // 12)
    cols = np.unique(np.concatenate([a[:, i * W:(i + 1) * W][a[:, i * W:(i + 1) * W, 3] > 0][:, :3] for i in (0, 12, 13, 14)]), axis=0)
    pal = list(set(q(cols[None])[0].tolist()))
    out, socks = [], []
    for i in range(n):
        f = a[:, i * W:(i + 1) * W].copy()
        m = (f[..., 3] > 0) & ~np.isin(q(f), pal)
        green = m & (f[..., 1] > f[..., 0] + 15)
        ys, xs = np.nonzero(green & (f[..., 1] > 120))
        socks.append((float(xs.mean()), float(ys.mean())) if len(xs) > 30 else (socks[-1] if socks and 1 < i < 12 else None))   # 고리가 옅은 장은 앞 장 자리
        S = f[..., :3].sum(-1)
        hole = green | (m & (f[..., 2] > f[..., 1] + 25)) | ((f[..., 3] > 0) & (f[..., 0] > f[..., 1] + 10) & (f[..., 2] > f[..., 1] + 10) & (S > 110))
        for _ in range(12):
            if not hole.any():
                break
            for y, x in zip(*np.nonzero(hole)):
                good = [f[y + dy, x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                        if (dy or dx) and 0 <= y + dy < f.shape[0] and 0 <= x + dx < W and not hole[y + dy, x + dx] and f[y + dy, x + dx, 3] > 0]
                if len(good) >= 3:
                    f[y, x] = np.median(np.array(good), 0).astype(int)
                    hole[y, x] = False
        f[hole] = 0
        m2 = (f[..., 3] > 0) & ~np.isin(q(f), pal)
        ys, xs = np.nonzero(m2)
        if len(ys):
            px = f[ys, xs, :3]
            f[ys, xs, :3] = cols[((px[:, None, :] - cols[None]) ** 2).sum(-1).argmin(1)]
        if socks[-1]:   # 기운 빛에 씻겨 회색이 된 옷: 푸른 기를 되살려 문파 옷 색이 입혀지게 (v160)
            r, g, b = f[..., 0], f[..., 1], f[..., 2]
            l = r * .3 + g * .59 + b * .11
            w = (f[..., 3] > 0) & (abs(r - g) < 10) & (abs(g - b) < 10) & (l > 50) & (l < 85)
            f[..., 2] = np.where(w, np.minimum(255, b + 14), b)
            f[..., 0] = np.where(w, np.maximum(0, r - 4), r)
        out.append(f)
    return out, socks


cells = []   # (시트 번호, 칸 번호) → 그림, 캔버스, 기준점, 소켓
index = {}
for si, (fn, n, sc, footc, use, clean) in enumerate(SHEETS):
    a = np.array(Image.open(os.path.join(SRC, fn)).convert('RGBA')).astype(int)
    W, H = a.shape[1] // n, a.shape[0]
    if clean:
        frames, socks = clean_qi(a, W, n)
    else:
        frames, socks = [a[:, i * W:(i + 1) * W] for i in range(n)], [None] * n
    # 발바닥 줄과 발 가운데: 기준 장 아래 12줄의 불투명 너비 가운데
    al = frames[footc][..., 3] > 20
    bot = int(np.nonzero(al.any(1))[0][-1])
    xs = np.nonzero(al[bot - 12:bot + 1].any(0))[0]
    fx = (xs[0] + xs[-1]) / 2
    cw, ch = round(W * sc), round((bot + 1) * sc)
    for i in use:
        im = Image.fromarray(frames[i].astype(np.uint8)).crop((0, 0, W, bot + 1)).resize((cw, ch), Image.LANCZOS)
        b = im.getbbox()
        sk = []
        if socks[i]:
            sk.append({'name': 'qi', 'x': round(socks[i][0] * sc, 1), 'y': round(socks[i][1] * sc, 1)})
        index[(si, i)] = len(cells)
        cells.append({'img': im.crop(b), 'o': (b[0], b[1]), 's': (cw, ch), 'pv': (round(fx * sc / cw, 4), 1.0), 'sk': sk})

# 줄 단위로 채워 넣기
PAD, MAXW = 2, 2048
x = y = rowh = 0
for c in cells:
    w, h = c['img'].size
    if x + w > MAXW:
        x, y, rowh = 0, y + rowh + PAD, 0
    c['r'] = (x, y, w, h)
    x += w + PAD
    rowh = max(rowh, h)
atlas = Image.new('RGBA', (MAXW, y + rowh))
for c in cells:
    atlas.paste(c['img'], c['r'][:2])
atlas = atlas.crop((0, 0, max(c['r'][0] + c['r'][2] for c in cells), y + rowh))
atlas.save(os.path.join(OUT, NAME + '.png'), optimize=True)
fr = {}
for i, c in enumerate(cells):
    r, o, s, pv = c['r'], c['o'], c['s'], c['pv']
    fr[f'{NAME}_{i:03d}'] = {'index': i, 'rect': dict(zip('xywh', r)), 'offset': {'x': o[0], 'y': o[1]}, 'sourceSize': {'w': s[0], 'h': s[1]},
                             'pivot': {'x': pv[0], 'y': pv[1]}, 'trimmed': True, 'sockets': c['sk']}
json.dump({'atlas': NAME + '.png', 'size': {'w': atlas.width, 'h': atlas.height}, 'frames': fr,
           '_doc': 'tools/cellsheet.py 가 source_sheets 에서 만든다. 손으로 고치지 말 것'}, open(os.path.join(OUT, NAME + '.atlas.json'), 'w'), ensure_ascii=False, indent=1)
json.dump({'atlas': NAME + '.atlas.json', 'clips': {k: {'frames': [index[(s, i)] for i in f], 'fps': 10, 'loop': False} for k, (s, f) in CLIPS.items()}},
          open(os.path.join(OUT, NAME + '.clips.json'), 'w'), ensure_ascii=False, indent=1)
print(NAME, len(cells), '장', atlas.size, ', '.join(CLIPS))

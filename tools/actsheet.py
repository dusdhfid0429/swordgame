"""동작별 가로 스트립(사용자 action_sheets, 2026-10-21) → assets/act/ 핸드오프 포맷 시트 (v166).

입력: <스트립 폴더>/NN_이름.png + .json (공통 셀 186x348, 발 기준 (93,340), markers: green=손·그립, blue=타격점)
출력: assets/act/act.png + act.atlas.json + act.clips.json

클립 이름은 wuxia 시트와 같게 둔다(STRIPS 표). 검·도·창·봉 공격 장의 손 소켓(hand/hand2/aim)은
같은 클립·같은 번호의 wuxia 장(손으로 찍어 둔 소켓)을 이 장에 겹쳐 맞춘 뒤(배율·이동 탐색, 실루엣 IoU 최대) 옮겨 온다.
두 시트는 같은 원화에서 따로 잘라 낸 것이라 자세가 같다. 스트립의 green 마커는 검증용으로 _markers 에 남긴다.

    python3 tools/actsheet.py assets/act/source_strips
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'act')
WX = os.path.join(ROOT, 'assets', 'wuxia')

# (스트립 파일, 클립 이름, 스트립 안 장 범위 [시작, 끝) 또는 None=전부)
STRIPS = [
    ('01_검수련_쾌자', 'sword_thrust', None), ('02_검수련_참격', 'sword_slash', None),
    ('03_도수련_중참', 'saber_heavy', None), ('04_도수련_선풍', 'saber_whirlwind', None),
    ('05_창술_1단계', 'spear_1', None), ('06_창술_2단계', 'spear_2', None),
    ('07_봉술_1단계', 'staff_1', None), ('08_봉술_2단계', 'staff_2', None),
    ('09_권법_연속권', 'punches', None), ('10_장법', 'palm_strikes', None),
    ('11_발차기_연속', 'kicks', None), ('12_권격_충격', 'combo', None),
    ('13_대시', 'dash', None), ('14_달리기', 'run', None), ('15_점프', 'jump', None),
    ('16_내공', 'meditate', None), ('17_근력', 'strength_1', (0, 6)), ('17_근력', 'strength_2', (6, 13)),
    ('18_고속회피', 'dodge', None), ('19_통나무균형', 'pole_balance', None),
    ('20_폭포_기마자세', 'waterfall_stance', None), ('21_충격버티기', 'endurance', None),
]
CELL = (186, 348)
PIV = (93, 340)


def wx_frames():
    a = json.load(open(os.path.join(WX, 'wuxia.atlas.json'), encoding='utf8'))
    c = json.load(open(os.path.join(WX, 'wuxia.clips.json'), encoding='utf8'))['clips']
    im = Image.open(os.path.join(WX, 'wuxia.png')).convert('RGBA')
    fr = {v['index']: v for v in a['frames'].values()}
    out = {}
    for clip, v in c.items():
        lst = []
        for i in v['frames']:
            f = fr[i]; r, o, s = f['rect'], f['offset'], f['sourceSize']
            cv = Image.new('RGBA', (s['w'], s['h']))
            cv.alpha_composite(im.crop((r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h'])), (o['x'], o['y']))
            lst.append((cv, {k['name']: (k['x'], k['y']) for k in f.get('sockets', [])}, (s['w'] * f['pivot']['x'], s['h'] * f['pivot']['y'])))
        out[clip] = lst
    return out


def snap(m, g):
    """스트립의 초록 마커(손)를 믿는다. 창·봉(hand+hand2): 마커 둘이면 두 손을 마커로(자루 방향은 옮겨 온 소켓과 가까운 쪽),
    하나면 가까운 손만 마커로. 검·도(hand+aim): 손에 가까운 마커로 손을 옮기고 aim도 같이 옮겨 날 방향은 그대로"""
    if not g or 'hand' not in m:
        return m
    d2 = lambda a, b: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    m = dict(m)
    if 'hand2' in m:
        if len(g) >= 2:
            a, b = max(((p, q) for p in g for q in g if p != q), key=lambda t: d2(*t))
            u = (m['hand'][0] - m['hand2'][0], m['hand'][1] - m['hand2'][1])
            if (a[0] - b[0]) * u[0] + (a[1] - b[1]) * u[1] < 0:
                a, b = b, a
            m['hand'], m['hand2'] = a, b
        else:
            k = min(('hand', 'hand2'), key=lambda n: d2(m[n], g[0]))
            m[k] = g[0]
        return m
    p = min(g, key=lambda q: d2(q, m['hand']))
    dx, dy = p[0] - m['hand'][0], p[1] - m['hand'][1]
    for n in m:
        m[n] = (m[n][0] + dx, m[n][1] + dy)
    return m


# 마커·옮긴 소켓으로도 어긋난 장은 손으로 고친다: (클립, 클립 안 번호) → {소켓: (x, y)} (셀 좌표 186x348)
FIX = {('sword_slash', 3): {'hand': (63, 245), 'aim': (95, 262)},   # 내려 벤 뒤 두 손이 모인 자리
       ('staff_1', 4): {'hand2': (125, 319)}}   # 낮게 쓸 때 뒷손이 무릎 앞


def fit(wx_img, wx_piv, new_mask):
    """wx 장을 배율 s·이동 d로 새 셀에 놓았을 때 실루엣 IoU가 가장 큰 (s, dx, dy)"""
    wm = np.array(wx_img)[..., 3] > 40
    best = (-1, 1, 0, 0)
    for s in np.arange(.94, 1.125, .015):
        w, h = round(wm.shape[1] * s), round(wm.shape[0] * s)
        sm = np.array(Image.fromarray(wm.astype(np.uint8) * 255).resize((w, h), Image.NEAREST)) > 127
        # 기준점끼리 맞춘 위치에서 출발
        ox, oy = round(PIV[0] - wx_piv[0] * s), round(PIV[1] - wx_piv[1] * s)
        for dy in range(-10, 11):
            for dx in range(-14, 15):
                cv = np.zeros((CELL[1], CELL[0]), bool)
                x0, y0 = ox + dx, oy + dy
                xs, ys = max(0, x0), max(0, y0)
                xe, ye = min(CELL[0], x0 + w), min(CELL[1], y0 + h)
                if xe <= xs or ye <= ys:
                    continue
                cv[ys:ye, xs:xe] = sm[ys - y0:ye - y0, xs - x0:xe - x0]
                iou = (cv & new_mask).sum() / max(1, (cv | new_mask).sum())
                if iou > best[0]:
                    best = (iou, s, x0, y0)
    return best


def main(src):
    wx = wx_frames()
    tiles, clips, frames = [], {}, {}
    for fn, clip, rng in STRIPS:
        strip = Image.open(os.path.join(src, fn + '.png')).convert('RGBA')
        meta = json.load(open(os.path.join(src, fn + '.json'), encoding='utf8'))
        n = strip.width // CELL[0]
        idx = range(*rng) if rng else range(n)
        clips[clip] = []
        for j, si in enumerate(idx):
            cell = strip.crop((si * CELL[0], 0, (si + 1) * CELL[0], CELL[1]))
            bb = cell.getbbox()
            sk = []
            ref = wx.get(clip)
            if ref and j < len(ref) and ref[j][1]:
                wimg, wsk, wpiv = ref[j]
                iou, s, x0, y0 = fit(wimg, wpiv, np.array(cell)[..., 3] > 40)
                m = {name: (x0 + x * s, y0 + y * s) for name, (x, y) in wsk.items()}
                g = [(k['x'], k['y']) for k in meta['frames'][si].get('markers', []) if k['kind'] == 'green']
                m = snap(m, g)
                m.update(FIX.get((clip, j), {}))
                for name, (x, y) in m.items():
                    sk.append({'name': name, 'x': round(x, 1), 'y': round(y, 1)})
                print(f'{clip}[{j}] iou {iou:.2f} s {s:.2f} markers {len(g)}')
            gi = len(tiles)
            tiles.append(cell.crop(bb))
            frames[f'act_{gi:03d}'] = {'index': gi, 'offset': {'x': bb[0], 'y': bb[1]}, 'sourceSize': {'w': CELL[0], 'h': CELL[1]},
                                       'pivot': {'x': PIV[0] / CELL[0], 'y': PIV[1] / CELL[1]}, 'trimmed': True, 'sockets': sk,
                                       '_src': f'{fn}#{si}', '_markers': [m for m in meta['frames'][si].get('markers', []) if m['kind'] == 'green']}
            clips[clip].append(gi)
    # 줄 채우기 아틀라스 (폭 2048)
    W, x, y, rowh, pos = 2048, 0, 0, 0, []
    for t in tiles:
        if x + t.width > W:
            x, y, rowh = 0, y + rowh + 2, 0
        pos.append((x, y)); x += t.width + 2; rowh = max(rowh, t.height)
    atlas = Image.new('RGBA', (W, y + rowh))
    for t, (px, py) in zip(tiles, pos):
        atlas.paste(t, (px, py))
    for f in frames.values():
        t, (px, py) = tiles[f['index']], pos[f['index']]
        f['rect'] = {'x': px, 'y': py, 'w': t.width, 'h': t.height}
    os.makedirs(OUT, exist_ok=True)
    atlas.save(os.path.join(OUT, 'act.png'), optimize=True)
    json.dump({'_doc': 'v166 사용자 동작 스트립(2026-10-21)을 tools/actsheet.py로 묶음. 셀 186x348, 발 (93,340). sockets는 wuxia 같은 장에서 옮김, _markers는 스트립의 초록 마커(손)',
               'atlas': 'act.png', 'size': {'w': W, 'h': atlas.height}, 'frames': frames},
              open(os.path.join(OUT, 'act.atlas.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    json.dump({'clips': {k: {'frames': v, 'fps': 10, 'loop': False} for k, v in clips.items()}},
              open(os.path.join(OUT, 'act.clips.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('act', len(tiles), 'frames,', len(clips), 'clips, atlas', atlas.size)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT, 'source_strips'))

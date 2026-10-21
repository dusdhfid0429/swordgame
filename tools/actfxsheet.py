"""이펙트·무기·소품 포함판 동작 스트립(사용자 action_sheets_effects_all.zip, 2026-10-21) → assets/actfx/ 시트 (v167).

입력: <스트립 폴더>/NN_이름.png + .json (공통 셀 426x388, 발 (213,341), frames[].effectOnly = 캐릭터 없이 이펙트만 있는 칸)
출력: assets/actfx/actfx.png + actfx.atlas.json + actfx.clips.json

클립 이름은 act 시트(tools/actsheet.py STRIPS)와 같다. 근력은 바위 들기 전체 13장 'strength'도 만든다.
이펙트만 있는 칸은 캐릭터가 한 장 비어 깜빡이지 않도록 바로 앞 장(첫 장이면 다음 장) 위에 겹쳐 한 장으로 만든다.
무기는 그림에 들어 있어 소켓이 없다.

    python3 tools/actfxsheet.py assets/actfx/source_strips
"""
import json, os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from actsheet import STRIPS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'actfx')
CELL = (426, 388)
# 게임에서 쓰는 클립만 묶는다 (v167 사용자): 무기·맨손 공격(그림에 무기·이펙트), 근력=바위 들기, 민첩=통나무 위, 지구력=폭포, 본원진기=앉아 몸에 기운 원
USE = {'sword_thrust', 'sword_slash', 'saber_heavy', 'saber_whirlwind', 'spear_1', 'spear_2', 'staff_1', 'staff_2',
       'punches', 'palm_strikes', 'kicks', 'combo', 'meditate', 'strength', 'pole_balance', 'waterfall_stance'}
PIV = (213, 341)


def cells(src, fn):
    strip = Image.open(os.path.join(src, fn + '.png')).convert('RGBA')
    meta = json.load(open(os.path.join(src, fn + '.json'), encoding='utf8'))
    raw = [(strip.crop((i * CELL[0], 0, (i + 1) * CELL[0], CELL[1])), bool(f.get('effectOnly'))) for i, f in enumerate(meta['frames'])]
    ch = [f.get('character') for f in meta['frames']]
    out = []
    for i, (c, eo) in enumerate(raw):
        if not eo:
            out.append((c, f'{fn}#{i}', ch[i]))
            continue
        # 이펙트만 있는 칸: 앞 장 캐릭터 위에 겹친다 (첫 장이면 다음 장)
        j = i - 1 if i > 0 else i + 1
        m = raw[j][0].copy(); m.alpha_composite(c); out.append((m, f'{fn}#{i}+{j}', ch[j]))
    return out


def main(src):
    tiles, clips, frames, done = [], {}, {}, {}
    for fn, clip, rng in STRIPS:
        if clip not in USE and not (clip == 'strength_1' and 'strength' in USE):
            continue
        if fn not in done:
            done[fn] = []
            for c, tag, cb in cells(src, fn):
                bb = c.getbbox(); gi = len(tiles); tiles.append(c.crop(bb)); done[fn].append(gi)
                frames[f'actfx_{gi:03d}'] = {'index': gi, 'offset': {'x': bb[0], 'y': bb[1]}, 'sourceSize': {'w': CELL[0], 'h': CELL[1]},
                                             'pivot': {'x': PIV[0] / CELL[0], 'y': PIV[1] / CELL[1]}, 'trimmed': True, 'sockets': [], '_src': tag,
                                             'character': cb}
        ids = done[fn]
        if clip in USE:
            clips[clip] = ids[rng[0]:rng[1]] if rng else list(ids)
        if clip == 'strength_1' and 'strength' in USE:
            clips['strength'] = list(ids)
    # 폭포 맞기: 물줄기가 쏟아지는 가운데 4장만 (앞뒤 두 장씩은 들어서고 나오는 자세라 돌리면 물이 깜빡인다)
    clips['waterfall_hit'] = clips['waterfall_stance'][2:6]
    W, x, y, rowh, pos = 4096, 0, 0, 0, []
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
        # 캐릭터 몸 상자(아틀라스 좌표, 2px 여유): 문파 옷 색은 이 안만 칠한다 (푸른 이펙트가 옷으로 물들지 않게)
        cb = f.pop('character')
        if cb:
            f['charRect'] = {'x': px + cb['x'] - 2 - f['offset']['x'], 'y': py + cb['y'] - 2 - f['offset']['y'], 'w': cb['w'] + 4, 'h': cb['h'] + 4}
    os.makedirs(OUT, exist_ok=True)
    # 256색으로 줄여 묶음 크기를 1/4로 (도트·이펙트 모두 눈에 띄는 차이 없음)
    atlas.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(OUT, 'actfx.png'), optimize=True)
    json.dump({'_doc': 'v167 이펙트·무기·소품 포함판 동작 스트립을 tools/actfxsheet.py로 묶음. 셀 426x388, 발 (213,341). 무기가 그림에 있어 소켓 없음',
               'atlas': 'actfx.png', 'size': {'w': W, 'h': atlas.height}, 'frames': frames},
              open(os.path.join(OUT, 'actfx.atlas.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    json.dump({'clips': {k: {'frames': v, 'fps': 10, 'loop': False} for k, v in clips.items()}},
              open(os.path.join(OUT, 'actfx.clips.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('actfx', len(tiles), 'frames,', len(clips), 'clips, atlas', atlas.size, {k: len(v) for k, v in clips.items()})


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT, 'source_strips'))

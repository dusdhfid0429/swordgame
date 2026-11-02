"""v226 (동훈님 2026-11-02 "옛 그림 묶음을 아틀라스 시트로 만들고 거기에서 보법, 회피, 경공 동작 불러오게"):
옛 아틀라스 셋(src/r_atlas.js의 HERO·HBODY, src/r_atlas2.js의 HERO2)을 장마다 잘라 빈 테두리를 깎고, 가로 2048px 시트 한 장에 차곡차곡 담는다.
결과 assets/legacy/legacy.png(+무손실 .webp) + legacy.atlas.json + legacy.clips.json (핸드오프 형식, build.py가 다른 시트처럼 넣는다).
장 번호: 0..nH-1 = HERO(칼 든 원본), nH..2nH-1 = HBODY(칼·칼집 지운 몸통), 2nH.. = HERO2(무기별 공격·대기·경공·보법). 장의 o=[깎은 왼쪽, 깎은 위쪽], s=[원래 폭, 원래 높이].
옛 이미지를 다시 만들 일은 없다: 이 도구는 옛 base64가 src에 남아 있을 때 한 번 돌렸다 (그 뒤로 r_atlas*.js에는 장 표만 남는다). 다시 돌리려면 git에서 v225의 r_atlas*.js를 꺼낸다.
"""
import base64, io, json, os, re, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = lambda f: open(os.path.join(ROOT, 'src', f), encoding='utf8').read()

def arr_after(s, key):
    i = s.index(key) + len(key); d = 0
    for j in range(i, len(s)):
        if s[j] == '[': d += 1
        elif s[j] == ']':
            d -= 1
            if d == 0: return json.loads(s[i:j + 1])

def img_of(s, name):
    m = re.search(name + r"\.src='data:image/\w+;base64,([A-Za-z0-9+/=]+)'", s)
    return Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')

def main(a1=None, a2=None):
    s1 = a1 or SRC('r_atlas.js'); s2 = a2 or SRC('r_atlas2.js')
    HF = arr_after(s1, 'HF='); HF2 = arr_after(s2, 'HF2=')
    H, B, H2 = img_of(s1, 'HERO'), img_of(s1, 'HBODY'), img_of(s2, 'HERO2')
    cells = []   # (원래 장 그림, 원래 크기)
    for src, tab in ((H, HF), (B, HF), (H2, HF2)):
        for f in tab:
            x, w, h = int(f[0]), int(f[1]), int(f[2])
            cells.append(src.crop((x, 0, x + w, h)))
    W, pad = 2048, 1
    trims = []
    for c in cells:
        bb = c.getbbox() or (0, 0, 1, 1)
        trims.append((bb, c.crop(bb)))
    # 높이 순 선반 쌓기
    # 똑같은 장(칼이 안 보이는 장은 HERO와 HBODY가 같다)은 한 번만 담는다
    same, seen = {}, {}
    for i, (bb, t) in enumerate(trims):
        k = (t.size, t.tobytes())
        if k in seen: same[i] = seen[k]
        else: seen[k] = i
    order = sorted((i for i in range(len(cells)) if i not in same), key=lambda i: -trims[i][1].height)
    pos = [None] * len(cells); x = y = rowh = 0
    for i in order:
        t = trims[i][1]
        if x + t.width > W: x = 0; y += rowh + pad; rowh = 0
        pos[i] = (x, y); x += t.width + pad; rowh = max(rowh, t.height)
    for i, j in same.items(): pos[i] = pos[j]
    Ht = y + rowh
    sheet = Image.new('RGBA', (W, Ht), (0, 0, 0, 0))
    frames = {}
    for i, (bb, t) in enumerate(trims):
        px, py = pos[i]
        if i not in same: sheet.paste(t, (px, py))
        frames[f'f{i:03d}'] = {'index': i, 'rect': {'x': px, 'y': py, 'w': t.width, 'h': t.height}, 'offset': {'x': bb[0], 'y': bb[1]},
                               'sourceSize': {'w': cells[i].width, 'h': cells[i].height}, 'pivot': {'x': 0, 'y': 0}}
    d = os.path.join(ROOT, 'assets', 'legacy'); os.makedirs(d, exist_ok=True)
    sheet.save(os.path.join(d, 'legacy.png'), optimize=True)
    json.dump({'meta': {'note': 'v226 옛 아틀라스 HERO·HBODY·HERO2를 한 장으로 (tools/legacysheet.py)', 'nH': len(HF), 'nH2': len(HF2), 'size': [W, Ht]}, 'frames': frames},
              open(os.path.join(d, 'legacy.atlas.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({'clips': {}}, open(os.path.join(d, 'legacy.clips.json'), 'w', encoding='utf8'))
    old = H.width * H.height + B.width * B.height + H2.width * H2.height
    print(f'같은 장 {len(same)}개 합침; 장 {len(cells)} (HERO {len(HF)}, HBODY {len(HF)}, HERO2 {len(HF2)}) → {W}x{Ht}; 픽셀 {old/1e6:.2f}M → {W*Ht/1e6:.2f}M')

if __name__ == '__main__':
    main()

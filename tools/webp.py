"""v225 (개선 계획 7절 용량): 그림을 무손실 WebP로 바꾼다. 픽셀은 PNG와 똑같다 (옷 색 바꾸기가 색을 그대로 맞춰 보므로 손실 압축은 쓰지 않는다).
- assets/<이름>/<이름>.png → 같은 자리 <이름>.webp. build.py는 .webp가 있으면 그것을 넣는다 (PNG 원본은 그대로 둔다)
- src/r_atlas.js · r_atlas2.js 안의 옛 아틀라스 data:image/png → data:image/webp (작아질 때만)
PNG를 고친 뒤에는 이 도구를 다시 돌린다: python3 tools/webp.py   (Pillow 필요. CI는 이 도구를 돌리지 않고 커밋된 .webp를 쓴다)
"""
import base64, io, os, re, sys
from PIL import Image, ImageChops
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def webp(png_bytes):
    im = Image.open(io.BytesIO(png_bytes)); im.load()
    mode = 'RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB'
    src = im.convert(mode)
    if max(src.size) > 16383: return None   # WebP 한 변 한계 (HERO2는 16410px라 PNG로 남는다)
    b = io.BytesIO(); src.save(b, 'WEBP', lossless=True, quality=100, method=6, exact=True)
    out = b.getvalue()
    back = Image.open(io.BytesIO(out)).convert(mode)
    assert ImageChops.difference(src, back).getbbox() is None, '무손실이 아니다'
    return out

def main(only=None):
    saved = 0
    for name in sorted(os.listdir(os.path.join(ROOT, 'assets'))):
        if only and name not in only: continue
        p = os.path.join(ROOT, 'assets', name, name + '.png')
        if not os.path.isfile(p): continue
        raw = open(p, 'rb').read(); w = webp(raw); q = p[:-4] + '.webp'
        if w and len(w) < len(raw):
            open(q, 'wb').write(w); saved += len(raw) - len(w); print(f'{name}: {len(raw)//1024} → {len(w)//1024} KB')
        elif os.path.exists(q): os.remove(q)
    for f in ('r_atlas.js', 'r_atlas2.js'):
        if only and f not in only: continue
        p = os.path.join(ROOT, 'src', f); s = open(p, encoding='utf8').read()
        def rep(m):
            nonlocal saved
            raw = base64.b64decode(m.group(1)); w = webp(raw)
            if not w or len(w) >= len(raw): return m.group(0)
            saved += len(raw) - len(w); print(f'{f}: {len(raw)//1024} → {len(w)//1024} KB')
            return 'data:image/webp;base64,' + base64.b64encode(w).decode('ascii')
        s2 = re.sub(r'data:image/png;base64,([A-Za-z0-9+/=]+)', rep, s)
        if s2 != s: open(p, 'w', encoding='utf8').write(s2)
    print(f'줄어든 크기 {saved//1024} KB (base64 전)')

if __name__ == '__main__':
    main(set(sys.argv[1:]) or None)

#!/usr/bin/env python3
"""
autosheet — 격자 없이 자유 배치된 AI 생성 스프라이트 시트를 자동 분할
(배경 단색 감지 → 연결 성분 → 행 클러스터링 → 행별 클립)

  python autosheet.py sheet.png -o out --name hero --rows dodge,pole,horse,endure --preview
  python autosheet.py a.png b.png -o out --name hero --rows ... --rows ...   # 시트 여러 장 → 아틀라스 하나

spritify.py 와 같은 출력 형식(atlas.png / atlas.json / clips.json)을 만든다.
"""
import argparse, json, math, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def detect_bg(rgb: np.ndarray):
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    return np.median(border, axis=0)


MARKERS = {
    "green": lambda a: (a[:, :, 1] - np.maximum(a[:, :, 0], a[:, :, 2])) > 35,
    "lightblue": lambda a: (a[:, :, 2] >= 235) & (a[:, :, 1] > 80) & (a[:, :, 0] < 225) & (a[:, :, 2] - a[:, :, 0] > 20),
    "cyan":  lambda a: (a[:, :, 2] - a[:, :, 0] > 60) & (a[:, :, 1] - a[:, :, 0] > 40) & (a[:, :, 2] > 150),
}


def preprocess(rgb: np.ndarray, bg: np.ndarray):
    """격자선(배경과 같은 색조의 어두운 선) 제거, 마커 추출. 반환: (rgb, markers[(name,cx,cy)], sparkle_boxes)"""
    rgb = rgb.copy()
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    hue_like_bg = (np.abs(r - b) < 60) & (r > g + 30) & (b > g + 30)   # 마젠타 계열
    lines = hue_like_bg                                                 # 마젠타 계열 전부 = 격자선/번짐
    rgb[lines] = bg
    # 어두운 무채색 긴 직선(격자선): 행/열 단위로 어두운 픽셀이 길게 이어지면 제거
    dark = (rgb.max(axis=2) < 110) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 50)
    # 캐릭터 폭보다 훨씬 긴(>min_run) 연속 구간만 선으로 본다
    def long_runs(mask1d, min_run=150):
        out = np.zeros_like(mask1d); n = len(mask1d); i = 0
        while i < n:
            if mask1d[i]:
                j = i
                while j < n and mask1d[j]: j += 1
                if j - i >= min_run: out[i:j] = True
                i = j
            else: i += 1
        return out
    # 선은 1~3px 두께라 안티앨리어싱 포함 폭 넓게 잡음
    dark_w = ndi.binary_dilation(dark, structure=np.ones((3, 3)))
    line = np.zeros_like(dark)
    for y in range(dark.shape[0]):
        if dark_w[y].sum() > 150: line[y] |= long_runs(dark_w[y])
    for x in range(dark.shape[1]):
        if dark_w[:, x].sum() > 150: line[:, x] |= long_runs(dark_w[:, x])
    rgb[line & dark] = bg
    markers = []
    for name, fn in MARKERS.items():
        m = fn(rgb)
        m_raw = m
        m = ndi.binary_dilation(m, iterations=9)   # 십자/점선 마커를 한 덩어리로
        lab, n = ndi.label(m)
        for i, sl in enumerate(ndi.find_objects(lab)):
            if sl is None: continue
            ys, xs = np.nonzero(lab[sl] == i + 1)
            if len(ys) < 6: continue
            markers.append((name, float(xs.mean() + sl[1].start), float(ys.mean() + sl[0].start), sl))
        # 마커 픽셀 인페인트: 가장 가까운 비마커 픽셀 값으로
        m = ndi.binary_dilation(m_raw, iterations=4)
        if m.any():
            idx = ndi.distance_transform_edt(m, return_distances=False, return_indices=True)
            rgb[m] = rgb[idx[0][m], idx[1][m]]
    # 스파클(밝은 분홍 별) = 클립 끝 표시 → 배경으로
    sparkle = (r > 225) & (g > 170) & (b > 225)
    sparkle = ndi.binary_dilation(sparkle, iterations=6)
    rgb[sparkle] = bg
    return rgb, markers


def segment(img: Image.Image, tol=28, close=6, min_area=150, label_margin=0, row_gap=40, merge_gap=12):
    rgb = np.array(img.convert("RGB")).astype(int)
    bg = detect_bg(rgb)
    rgb, markers = preprocess(rgb, bg)
    dist = np.abs(rgb - bg).max(axis=2)
    fg = dist > tol
    # 알파: 배경과의 거리로 부드럽게 (안티앨리어스 경계 보존)
    alpha = np.clip((dist - tol * 0.5) / (tol * 1.0), 0, 1)
    alpha[fg] = np.maximum(alpha[fg], 0.6)
    alpha = (alpha * 255).astype(np.uint8)

    closed = ndi.binary_dilation(fg, iterations=close)
    lab, n = ndi.label(closed)
    objs = ndi.find_objects(lab)
    boxes = []
    for i, sl in enumerate(objs):
        if sl is None: continue
        area = int((lab[sl] == i + 1).sum())
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if area < min_area: continue
        if x1 <= label_margin: continue          # 왼쪽 텍스트 라벨 제외
        boxes.append([x0, y0, x1, y1])

    # 행 클러스터링: y 중심 정렬 후 간격으로 분리
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows, cur = [], []
    for b in boxes:
        if cur:
            # 현재 행의 y범위와 겹치면 같은 행
            ry0 = min(c[1] for c in cur); ry1 = max(c[3] for c in cur)
            overlap = min(ry1, b[3]) - max(ry0, b[1])
            if overlap > -row_gap:
                cur.append(b); continue
            rows.append(cur); cur = []
        cur.append(b)
    if cur: rows.append(cur)

    # 행 내: x정렬 후 x범위가 겹치거나 가까우면 병합 (캐릭터+발밑 기둥, 캐릭터+이펙트)
    out_rows = []
    for r in rows:
        r.sort(key=lambda b: b[0])
        merged = []
        for b in r:
            if merged and (b[0] <= merged[-1][2] + merge_gap or
                           (min(b[2], merged[-1][2]) - max(b[0], merged[-1][0])) > 0.5 * min(b[2] - b[0], merged[-1][2] - merged[-1][0])):
                m = merged[-1]
                m[0] = min(m[0], b[0]); m[1] = min(m[1], b[1]); m[2] = max(m[2], b[2]); m[3] = max(m[3], b[3])
            else:
                merged.append(list(b))
        out_rows.append(merged)
    return out_rows, alpha, bg, rgb, markers


def pack(sizes, max_w=2048, padding=2):
    order = sorted(range(len(sizes)), key=lambda i: -sizes[i][1])
    pos = [None] * len(sizes); x = y = shelf = used = 0
    for i in order:
        w, h = sizes[i]
        if x + w + padding > max_w and x > 0:
            y += shelf + padding; x = 0; shelf = 0
        pos[i] = (x, y); x += w + padding; shelf = max(shelf, h); used = max(used, x)
    p2 = lambda v: 1 << max(1, math.ceil(math.log2(max(1, v))))
    return pos, p2(min(max_w, used)), p2(y + shelf)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("-o", "--out", default="out")
    ap.add_argument("--name", default="sheet")
    ap.add_argument("--rows", action="append", help="시트별 행 클립 이름, 쉼표 구분 (입력 순서대로)")
    ap.add_argument("--fps", type=float, default=10)
    ap.add_argument("--tol", type=int, default=28, help="배경 판정 허용 오차")
    ap.add_argument("--close", type=int, default=5, help="성분 연결 팽창 픽셀")
    ap.add_argument("--min-area", type=int, default=320)
    ap.add_argument("--label-margin", type=int, default=0, help="이 x 이하에서 끝나는 성분은 라벨로 간주해 제외")
    ap.add_argument("--merge-gap", type=int, default=6, help="행 내 x 간격이 이 이하이면 한 프레임으로 병합")
    ap.add_argument("--row-gap", type=int, default=15)
    ap.add_argument("--max-width", type=int, default=2048)
    ap.add_argument("--padding", type=int, default=2)
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--row-canvas", action="store_true", help="행별 캔버스 유지 (기본: 전체 공통 캔버스)")
    ap.add_argument("--debug", action="store_true", help="검출 박스를 그린 이미지 저장")
    a = ap.parse_args()

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    pieces = []      # (RGBA crop, ox, oy, sw, sh)
    clips = {}
    sockets_by_piece = {}

    for si, src in enumerate(a.inputs):
        src = Path(src)
        img = Image.open(src)
        rows, alpha, bg, clean, markers = segment(img, a.tol, a.close, a.min_area, a.label_margin, a.row_gap, a.merge_gap)
        rgba = np.dstack([clean, alpha])
        names = a.rows[si].split(",") if a.rows and si < len(a.rows) else []
        print(f"[autosheet] {src.name}: bg={bg.astype(int).tolist()} rows={len(rows)} frames/row={[len(r) for r in rows]} markers={len(markers)}")

        # 행의 공통 캔버스: 행 안에서 가장 큰 h, 바닥선(y1 max) 기준 → 모든 프레임 발 위치 통일
        for ri, r in enumerate(rows):
            cname = names[ri] if ri < len(names) else f"{src.stem}_row{ri}"
            floor = max(b[3] for b in r)
            top = min(b[1] for b in r)
            sh = floor - top
            sw = max(b[2] - b[0] for b in r)
            idxs = []
            for b in r:
                x0, y0, x1, y1 = b
                crop = Image.fromarray(rgba[y0:y1, x0:x1].astype(np.uint8), "RGBA")
                # 캔버스 내 위치: 가로 중앙 정렬, 세로는 바닥선 맞춤
                ox = (sw - (x1 - x0)) // 2
                oy = (y1 - top) - (y1 - y0)
                pieces.append((crop, ox, oy, sw, sh))
                idxs.append(len(pieces) - 1)
                # 소켓: 이 프레임 bbox(여유 24px) 안의 마커 → 캔버스 좌표 + 정규화
                socks = []
                for (mn, mx, my, _) in markers:
                    if x0 - 24 <= mx <= x1 + 24 and top - 24 <= my <= floor + 24:
                        cx, cy = mx - x0 + ox, my - top
                        socks.append({"name": mn, "x": round(cx, 1), "y": round(cy, 1),
                                      "nx": round(cx / sw, 4), "ny": round(cy / sh, 4)})
                sockets_by_piece[len(pieces) - 1] = socks
            if cname in clips:   # 같은 이름이 반복되면 이어붙임 (줄바꿈된 긴 클립)
                clips[cname]["frames"] += idxs
            else:
                clips[cname] = {"frames": idxs, "fps": a.fps, "loop": False, "durations_ms": None,
                                "events": [], "source": src.name, "canvas": {"w": sw, "h": sh}}

        if a.debug:
            from PIL import ImageDraw
            d = img.convert("RGB"); dr = ImageDraw.Draw(d)
            for ri, r in enumerate(rows):
                for fi, b in enumerate(r):
                    dr.rectangle(b, outline=(255, 0, 0), width=2); dr.text((b[0] + 2, b[1] + 2), f"{ri}:{fi}", fill=(255, 0, 0))
            for (mn, mx, my, _) in markers:
                dr.ellipse((mx - 4, my - 4, mx + 4, my + 4), outline=(0, 0, 255), width=2)
            d.save(out / f"{src.stem}.debug.png")

    if not a.row_canvas:
        # 전 프레임 공통 캔버스(최대 폭/높이, 바닥 중앙 기준) → 모든 클립의 pivot이 같은 자리
        GW = max(p[3] for p in pieces); GH = max(p[4] for p in pieces)
        pieces = [(c, ox + (GW - sw) // 2, oy + (GH - sh), GW, GH) for (c, ox, oy, sw, sh) in pieces]
        for cl in clips.values(): cl["canvas"] = {"w": GW, "h": GH}
    sizes = [(p[0].width, p[0].height) for p in pieces]
    pos, aw, ah = pack(sizes, a.max_width, a.padding)
    atlas = Image.new("RGBA", (aw, ah), (0, 0, 0, 0)); table = {}
    for i, ((c, ox, oy, sw, sh), (x, y)) in enumerate(zip(pieces, pos)):
        atlas.paste(c, (x, y))
        table[f"{a.name}_{i:03d}"] = {"index": i, "rect": {"x": x, "y": y, "w": c.width, "h": c.height},
                                     "offset": {"x": ox, "y": oy}, "sourceSize": {"w": sw, "h": sh},
                                     "pivot": {"x": 0.5, "y": 1.0}, "trimmed": True,
                                     "sockets": sockets_by_piece.get(i, [])}
    atlas.save(out / f"{a.name}.png", optimize=True)
    json.dump({"atlas": f"{a.name}.png", "size": {"w": aw, "h": ah}, "frames": table},
              open(out / f"{a.name}.atlas.json", "w"), indent=2)
    json.dump({"atlas": f"{a.name}.atlas.json", "clips": clips},
              open(out / f"{a.name}.clips.json", "w"), indent=2, ensure_ascii=False)
    print(f"[autosheet] 아틀라스 {aw}x{ah}, 프레임 {len(pieces)}, 클립 {len(clips)}")

    if a.preview:
        for cname, clip in clips.items():
            frames = []
            for i in clip["frames"]:
                e = table[f"{a.name}_{i:03d}"]; r, o, s = e["rect"], e["offset"], e["sourceSize"]
                cv = Image.new("RGBA", (s["w"], s["h"]), (0, 0, 0, 0))
                cv.paste(atlas.crop((r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"])), (o["x"], o["y"]))
                frames.append(cv)
            frames[0].save(out / f"{a.name}.{cname}.preview.gif", save_all=True, append_images=frames[1:],
                           duration=1000 / a.fps, loop=0, disposal=2)
        print("[autosheet] 미리보기 생성")


if __name__ == "__main__":
    main()

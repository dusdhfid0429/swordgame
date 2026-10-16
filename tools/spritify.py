#!/usr/bin/env python3
"""
spritify — GIF/APNG/영상/이미지 시퀀스 → 스프라이트 아틀라스 + 프레임 테이블 + 클립 데이터

출력 구조 (Cocos 식 SpriteAtlas / SpriteFrame / AnimationClip 분리 패턴을 따름):
  <name>.png          아틀라스 (프레임 패킹된 PNG)
  <name>.atlas.json   프레임 테이블: name -> rect / offset / sourceSize / trimmed
  <name>.clips.json   클립: name -> frames(인덱스 배열) + fps + loop + events
  <name>.preview.gif  (옵션) 결과를 다시 재생해 본 미리보기

사용 예:
  python spritify.py walk.gif -o out/ --name hero_walk
  python spritify.py attack.mp4 -o out/ --fps 12 --clip attack
  python spritify.py frames_dir/ -o out/ --clip idle --key-color 255,0,255
  python spritify.py a.gif b.gif -o out/ --name hero   # 여러 입력 → 클립 여러 개, 아틀라스 하나
  python spritify.py sheet.png --grid 4x2 --key-color 255,0,255 --fps 10 --clip walk   # AI 생성 시트
"""
import argparse, json, math, os, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageSequence
import numpy as np


# ---------------------------------------------------------------- 입력 디코딩
def split_grid(im: Image.Image, cols: int, rows: int, count=None, cell=None):
    """스프라이트 시트(격자)를 셀 단위로 잘라 프레임 리스트로. 읽기 순서: 좌→우, 상→하."""
    if cell:
        cw, ch = cell
    else:
        cw, ch = im.width // cols, im.height // rows
    frames = []
    for r in range(rows):
        for c in range(cols):
            if count is not None and len(frames) >= count:
                break
            frames.append(im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)))
    return frames


def load_frames(src: Path, fps_override=None, grid=None, grid_count=None, cell=None):
    """(frames[RGBA PIL], durations_ms[]) 반환"""
    if grid and not src.is_dir():
        im = Image.open(src).convert("RGBA")
        cols, rows = grid
        frames = split_grid(im, cols, rows, grid_count, cell)
        d = 1000 / (fps_override or 12)
        return frames, [d] * len(frames)
    if src.is_dir():
        files = sorted(p for p in src.iterdir()
                       if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".bmp"))
        if not files:
            sys.exit(f"[spritify] 이미지가 없습니다: {src}")
        frames = [Image.open(p).convert("RGBA") for p in files]
        d = 1000 / (fps_override or 12)
        return frames, [d] * len(frames)

    ext = src.suffix.lower()
    if ext in (".gif", ".png", ".apng", ".webp"):
        im = Image.open(src)
        frames, durs = [], []
        for f in ImageSequence.Iterator(im):
            frames.append(f.convert("RGBA"))
            durs.append(f.info.get("duration", 100) or 100)
        if fps_override:
            durs = [1000 / fps_override] * len(frames)
        return frames, durs

    if ext in (".mp4", ".webm", ".mov", ".mkv", ".avi"):
        fps = fps_override or 12
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(
                ["ffmpeg", "-v", "error", "-i", str(src), "-vf", f"fps={fps}",
                 "-pix_fmt", "rgba", f"{td}/f_%05d.png"], check=True)
            files = sorted(Path(td).glob("f_*.png"))
            frames = [Image.open(p).convert("RGBA") for p in files]
            for f in frames:
                f.load()
        return frames, [1000 / fps] * len(frames)

    sys.exit(f"[spritify] 지원하지 않는 입력: {src}")


# ---------------------------------------------------------------- 전처리
def apply_key_color(frame: Image.Image, key, tol: int) -> Image.Image:
    """단색 배경(크로마키)을 투명 처리. 실사 사진에서 배경을 단색으로 찍었을 때 사용."""
    a = np.array(frame).astype(int)
    diff = np.abs(a[:, :, :3] - np.array(key)).sum(axis=2)
    a[:, :, 3] = np.where(diff <= tol, 0, a[:, :, 3])
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def trim(frame: Image.Image, pad: int):
    """투명 여백 제거. (cropped, offset_x, offset_y) — offset은 원본 좌상단 기준."""
    bbox = frame.getbbox()  # alpha 포함 bbox
    if bbox is None:
        return Image.new("RGBA", (1, 1)), 0, 0
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(frame.width, x1 + pad); y1 = min(frame.height, y1 + pad)
    return frame.crop((x0, y0, x1, y1)), x0, y0


def frame_hash(frame: Image.Image) -> bytes:
    return frame.tobytes()


# ---------------------------------------------------------------- 패킹 (shelf / MaxRects-lite)
def pack(sizes, max_w=2048, padding=2):
    """단순 shelf 패커. 높이순 정렬 후 행으로 채움. (positions[], atlas_w, atlas_h)"""
    order = sorted(range(len(sizes)), key=lambda i: -sizes[i][1])
    pos = [None] * len(sizes)
    x = y = shelf_h = 0
    used_w = 0
    for i in order:
        w, h = sizes[i]
        if x + w + padding > max_w and x > 0:
            y += shelf_h + padding
            x = 0; shelf_h = 0
        pos[i] = (x, y)
        x += w + padding
        shelf_h = max(shelf_h, h)
        used_w = max(used_w, x)
    atlas_w = min(max_w, used_w)
    atlas_h = y + shelf_h
    # 2의 거듭제곱으로 올림 (GPU 친화)
    p2 = lambda v: 1 << max(1, math.ceil(math.log2(max(1, v))))
    return pos, p2(atlas_w), p2(atlas_h)


# ---------------------------------------------------------------- 메인
def main():
    ap = argparse.ArgumentParser(description="GIF/영상/이미지 → 스프라이트 아틀라스")
    ap.add_argument("inputs", nargs="+", help="GIF/APNG/WEBP/MP4/WEBM 또는 이미지 폴더 (여러 개 가능)")
    ap.add_argument("-o", "--out", default="out", help="출력 폴더")
    ap.add_argument("--name", help="아틀라스 이름 (기본: 첫 입력 파일명)")
    ap.add_argument("--clip", action="append",
                    help="입력별 클립 이름. 입력 순서대로 매칭 (기본: 입력 파일명)")
    ap.add_argument("--fps", type=float, help="fps 강제 지정 (영상/폴더/격자는 기본 12)")
    ap.add_argument("--grid", help="스프라이트 시트 격자 분할 COLSxROWS (예: 4x2)")
    ap.add_argument("--grid-count", type=int, help="격자에서 실제 사용할 프레임 수 (빈 셀 제외)")
    ap.add_argument("--cell", help="셀 크기 WxH 고정 (시트에 여백이 있을 때)")
    ap.add_argument("--max-width", type=int, default=2048)
    ap.add_argument("--padding", type=int, default=2, help="프레임 간 여백(블리딩 방지)")
    ap.add_argument("--trim-pad", type=int, default=0, help="트림 후 남길 여백")
    ap.add_argument("--no-trim", action="store_true")
    ap.add_argument("--no-dedupe", action="store_true", help="중복 프레임 제거 끄기")
    ap.add_argument("--key-color", help="크로마키 배경색 R,G,B (예: 255,0,255)")
    ap.add_argument("--key-tol", type=int, default=60, help="크로마키 허용 오차")
    ap.add_argument("--scale", type=float, default=1.0, help="프레임 축소/확대 배율")
    ap.add_argument("--preview", action="store_true", help="결과 미리보기 GIF 생성")
    ap.add_argument("--loop", action="store_true", help="클립 loop 플래그 true로")
    a = ap.parse_args()

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    name = a.name or Path(a.inputs[0]).stem
    key = tuple(int(v) for v in a.key_color.split(",")) if a.key_color else None

    unique = []          # [(cropped_img, ox, oy, src_w, src_h)]
    hash_index = {}      # hash -> frame idx
    clips = {}

    for ci, src in enumerate(a.inputs):
        src = Path(src)
        clip_name = (a.clip[ci] if a.clip and ci < len(a.clip) else src.stem)
        grid = tuple(int(v) for v in a.grid.lower().split("x")) if a.grid else None
        cell = tuple(int(v) for v in a.cell.lower().split("x")) if a.cell else None
        frames, durs = load_frames(src, a.fps, grid, a.grid_count, cell)
        idx_seq, dur_seq = [], []
        for f, d in zip(frames, durs):
            if key: f = apply_key_color(f, key, a.key_tol)
            if a.scale != 1.0:
                f = f.resize((max(1, round(f.width * a.scale)),
                              max(1, round(f.height * a.scale))), Image.LANCZOS)
            sw, sh = f.size
            if a.no_trim:
                c, ox, oy = f, 0, 0
            else:
                c, ox, oy = trim(f, a.trim_pad)
            h = None if a.no_dedupe else frame_hash(c) + bytes([ox & 255, oy & 255])
            if h is not None and h in hash_index:
                i = hash_index[h]
            else:
                i = len(unique); unique.append((c, ox, oy, sw, sh))
                if h is not None: hash_index[h] = i
            idx_seq.append(i); dur_seq.append(d)

        # fps = 가장 흔한 딜레이 기준. 딜레이가 제각각이면 durations도 같이 기록
        common = max(set(dur_seq), key=dur_seq.count)
        fps = round(1000 / common, 3) if common else 12
        clips[clip_name] = {
            "frames": idx_seq,
            "fps": fps,
            "loop": a.loop,
            "durations_ms": dur_seq if len(set(dur_seq)) > 1 else None,
            "events": [],          # 예: {"frame": 3, "name": "hit"}
            "source": src.name,
        }
        print(f"[spritify] {clip_name}: {len(frames)}프레임 → 유니크 {len(set(idx_seq))}, fps≈{fps}")

    # ---- 패킹
    sizes = [(c.width, c.height) for c, *_ in unique]
    pos, aw, ah = pack(sizes, a.max_width, a.padding)
    atlas = Image.new("RGBA", (aw, ah), (0, 0, 0, 0))
    table = {}
    for i, ((c, ox, oy, sw, sh), (x, y)) in enumerate(zip(unique, pos)):
        atlas.paste(c, (x, y))
        fname = f"{name}_{i:03d}"
        table[fname] = {
            "index": i,
            "rect": {"x": x, "y": y, "w": c.width, "h": c.height},
            # offset: 트림된 조각을 원본 캔버스 어디에 놓을지 (좌상단 기준)
            "offset": {"x": ox, "y": oy},
            "sourceSize": {"w": sw, "h": sh},
            # pivot: 원본 캔버스 하단 중앙 (발 위치) — 캐릭터용 기본값
            "pivot": {"x": 0.5, "y": 1.0},
            "trimmed": (c.width, c.height) != (sw, sh),
        }
    atlas.save(out / f"{name}.png", optimize=True)

    json.dump({"atlas": f"{name}.png", "size": {"w": aw, "h": ah},
               "frames": table}, open(out / f"{name}.atlas.json", "w"), indent=2)
    json.dump({"atlas": f"{name}.atlas.json", "clips": clips},
              open(out / f"{name}.clips.json", "w"), indent=2, ensure_ascii=False)

    fill = sum(w * h for w, h in sizes) / (aw * ah) * 100
    print(f"[spritify] 아틀라스 {aw}x{ah}, 프레임 {len(unique)}개, 채움률 {fill:.1f}%")
    print(f"[spritify] 출력: {out / (name + '.png')}, {name}.atlas.json, {name}.clips.json")

    # ---- 미리보기: 아틀라스+테이블만으로 재구성 (데이터가 맞는지 검증 겸)
    if a.preview:
        for cname, clip in clips.items():
            frames = []
            for i in clip["frames"]:
                e = table[f"{name}_{i:03d}"]
                r, o, s = e["rect"], e["offset"], e["sourceSize"]
                canvas = Image.new("RGBA", (s["w"], s["h"]), (0, 0, 0, 0))
                piece = atlas.crop((r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]))
                canvas.paste(piece, (o["x"], o["y"]))
                frames.append(canvas)
            durs = clip["durations_ms"] or [1000 / clip["fps"]] * len(frames)
            frames[0].save(out / f"{name}.{cname}.preview.gif", save_all=True,
                           append_images=frames[1:], duration=durs, loop=0, disposal=2)
        print("[spritify] 미리보기 GIF 생성 완료")


if __name__ == "__main__":
    main()

# v248 문파 특색 본산: 세가 집안마다 배치 (사용자 2026-11-11 '2번으로 진행해')
# 이 스크립트가 data/sectmap.json 의 SECTMAP.look[문파 id]·look.clan 을 다시 쓴다. 손으로 고치지 말고 여기서 고친 뒤 돌린다:
#   python3 tools/sectlook_gen.py
# 맵 40×40, 길은 아래 가운데(x 20·21)로 들어와 마당 아랫줄(yard[3])에 닿는다. 담(cwall)은 마당을 두르고, 길이 닿는 곳에 문루(gatehouse, 가운데 두 칸은 지나간다).
# 건물 k 는 data/sectmap.json kinds 의 전각 종류(사람·층), form 은 r_bform.js 형태. 문 칸 = (x+w//2, y+h) 는 비워 둔다.
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'data', 'sectmap.json')

def ring(yd, gaps=()):  # 마당을 두르는 담: 위는 yard[1]-1, 아래는 yard[3] (문루 줄)
    return {"r": [yd[0]-1, yd[1]-1, yd[2]+1, yd[3]], "k": "cwall", "gaps": [list(g) for g in gaps]}
def wall(x0, y0, x1, y1, gaps=()):  # 안담 한 줄
    return {"r": [x0, y0, x1, y1], "k": "cwall", "gaps": [list(g) for g in gaps]}
def gate(yd, **o):
    return dict({"k": "dorm", "x": 19, "y": yd[3], "w": 4, "h": 1, "form": "gatehouse", "pass": [20, 21]}, **o)
def B(k, x, y, w, h, **o):
    return dict({"k": k, "x": x, "y": y, "w": w, "h": h}, **o)
def G(k, x, y, w, h, **o):  # 맞배 기와집채
    return B(k, x, y, w, h, form="giwa", **o)
def pts(kind, *xy):
    return [[x, y, kind] for x, y in xy]
def grid(kind, xs, ys):
    return [[x, y, kind] for x in xs for y in ys]

# ---------------- 남궁세가: 창궁(蒼穹) 대칭 사합원, 검 걸이 늘어선 안마당, 후산 검총 ----------------
def namgung():
    hq_y = [7, 4, 33, 25]
    hq = {"yard": hq_y, "topX": 15, "builds": [
        B("main", 17, 5, 6, 4, fl=3, door=1, kind="temple"),
        G("elders", 9, 10, 3, 6, fl=1, door=1), G("law", 28, 10, 3, 6, door=1),
        B("bell", 11, 20, 2, 2, fl=2), B("drum", 27, 20, 2, 2, fl=2), gate(hq_y)],
        "fence": [ring(hq_y), wall(7, 18, 33, 18, [(18, 18, 6, 1)])],
        "deco": grid("rack", [14, 25], [11, 13, 15]) + pts("well", (15, 21)),
        "lamps": [[15, 9], [24, 9], [15, 23], [25, 23]], "flags": [[17, 26], [24, 26]]}
    out_y = [6, 6, 34, 30]
    outer = {"yard": out_y, "builds": [
        G("treas", 24, 7, 5, 3, fl=1, door=1), G("medic", 8, 7, 4, 3, door=1),
        G("store", 31, 11, 3, 2), G("store", 31, 15, 3, 2), G("kitchen", 31, 19, 3, 2),
        G("dorm", 8, 22, 6, 2), G("dorm", 26, 23, 5, 2), G("guest", 8, 26, 4, 3, door=1), gate(out_y)],
        "fence": [ring(out_y, [(5, 19, 1, 3)])],
        "deco": grid("dummy", [13, 16, 25, 28], [14, 17]) + pts("rack", (12, 11), (28, 11)),
        "lamps": [[14, 12], [26, 12], [14, 27], [26, 27]], "flags": [[18, 31], [23, 31]], "arena": [2.6, 20.5]}
    bk_y = [12, 4, 28, 16]
    back = {"yard": bk_y, "builds": [
        B("lib", 18, 5, 4, 4, fl=3, door=1), G("shrine", 13, 8, 4, 3, door=1), B("pav", 25, 13, 2, 2, kind="pavilion"), gate(bk_y)],
        "fence": [ring(bk_y)], "deco": grid("stone", [23, 25, 27], [5, 7, 9]), "lamps": [[15, 7], [25, 11]]}
    return {"big": {"hq": hq, "outer": outer, "back": back}}

# ---------------- 모용세가: 고소 연자오(燕子塢) 물가 장원, 못 위 수각·다리, 섬 위 장경각 ----------------
def moyong():
    hq_y = [7, 4, 33, 25]
    hq = {"yard": hq_y, "topX": 15, "builds": [
        B("main", 17, 5, 6, 4, fl=3, door=1, kind="temple"),
        G("elders", 8, 5, 5, 3, fl=1, door=1), G("law", 27, 5, 5, 3, door=1),
        B("pav", 11, 15, 2, 2, kind="pavilion"), B("pav", 27, 15, 2, 2, kind="pavilion"), gate(hq_y)],
        "ground": [[8, 12, 16, 21, 2], [24, 12, 32, 21, 2], [13, 15, 13, 16, 3], [27, 17, 28, 17, 3]],
        "fence": [ring(hq_y)],
        "deco": pts("grock", (17, 13), (23, 19), (8, 23), (32, 23)) + pts("bamboo", (8, 10), (9, 10), (31, 10), (32, 10)),
        "lamps": [[17, 11], [23, 11], [17, 22], [24, 22]], "flags": [[17, 26], [24, 26]]}
    out_y = [6, 6, 34, 30]
    outer = {"yard": out_y, "builds": [
        G("treas", 25, 7, 5, 3, fl=1, door=1), G("medic", 8, 7, 4, 3, door=1),
        G("store", 31, 22, 3, 2), G("store", 8, 26, 3, 2), G("kitchen", 26, 26, 4, 2),
        G("dorm", 8, 15, 2, 5), G("dorm", 31, 12, 2, 6), G("guest", 13, 22, 4, 3, door=1),
        B("pav", 23, 17, 2, 2, kind="pavilion"), gate(out_y)],
        "ground": [[22, 13, 29, 21, 2]],
        "fence": [ring(out_y, [(5, 19, 1, 3)])],
        "deco": pts("grock", (14, 12), (16, 16), (27, 11)) + pts("bamboo", (11, 10), (12, 10), (11, 11)),
        "lamps": [[14, 27], [26, 24]], "flags": [[18, 31], [23, 31]], "arena": [2.6, 20.5]}
    bk_y = [12, 4, 28, 16]
    back = {"yard": bk_y, "builds": [
        B("lib", 18, 5, 4, 4, fl=3, door=1), G("shrine", 12, 12, 4, 3, door=1), B("pav", 25, 6, 2, 2, kind="pavilion"), gate(bk_y)],
        "ground": [[13, 4, 27, 11, 2], [17, 4, 23, 9, 7], [20, 10, 21, 11, 3], [25, 6, 26, 7, 4]],
        "fence": [ring(bk_y)], "deco": pts("grock", (24, 13), (27, 14)), "lamps": [[17, 13], [24, 15]]}
    return {"big": {"hq": hq, "outer": outer, "back": back}}

# ---------------- 하북팽가: 오호단문도의 가문, 마당 전체가 큰 연무장 · 건물은 가장자리 한 줄 ----------------
def paeng():
    hq_y = [6, 4, 34, 26]
    hq = {"yard": hq_y, "topX": 15, "builds": [
        B("main", 17, 4, 6, 4, fl=3, door=1, kind="temple"),
        G("elders", 7, 4, 5, 3, fl=1, door=1), G("law", 28, 4, 5, 3, door=1),
        G("bell", 6, 12, 2, 6), G("drum", 33, 12, 2, 6), gate(hq_y)],
        "fence": [ring(hq_y)],
        "deco": grid("dummy", [11, 14, 17, 24, 27, 30], [12, 15, 18, 21]) + pts("rack", (9, 9), (31, 9), (9, 23), (31, 23)),
        "lamps": [[14, 8], [26, 8]], "flags": [[16, 27], [25, 27], [11, 9], [29, 9]]}
    out_y = [6, 6, 34, 30]
    outer = {"yard": out_y, "builds": [
        G("treas", 7, 7, 5, 3, fl=1, door=1), G("medic", 28, 7, 4, 3, door=1),
        G("store", 13, 7, 3, 2), G("store", 24, 7, 3, 2), G("kitchen", 31, 13, 3, 2),
        G("dorm", 7, 24, 7, 2), G("dorm", 27, 24, 7, 2), G("guest", 28, 18, 4, 3, door=1), gate(out_y)],
        "fence": [ring(out_y, [(5, 19, 1, 3)])],
        "deco": grid("dummy", [10, 13, 16, 25], [13, 16, 19]) + pts("rack", (22, 12), (18, 12)),
        "lamps": [[14, 28], [26, 28]], "flags": [[18, 31], [23, 31]], "arena": [2.6, 20.5]}
    bk_y = [12, 4, 28, 16]
    back = {"yard": bk_y, "builds": [
        B("lib", 18, 4, 4, 4, fl=3, door=1), G("shrine", 12, 5, 4, 3, door=1), B("pav", 25, 5, 2, 2, kind="pavilion"), gate(bk_y)],
        "fence": [ring(bk_y)], "deco": grid("dummy", [14, 17, 23, 26], [11, 14]), "lamps": [[15, 9], [25, 9]]}
    return {"big": {"hq": hq, "outer": outer, "back": back}}

# ---------------- 제갈세가: 와룡의 후예, 대숲 속 장원 · 정문 앞 진법 돌밭(돌기둥 미로) ----------------
def jegal():
    hq_y = [8, 4, 32, 25]
    maze = []
    for y in (12, 16, 20):
        for x in range(10, 31):
            if x in (20, 21): continue
            if (y == 12 and x in (13, 27)) or (y == 16 and x in (10, 30)) or (y == 20 and x in (15, 25)): continue
            if x % 2 == 0 or y == 16: maze.append([x, y, "stone"])
    hq = {"yard": hq_y, "topX": 15, "builds": [
        B("main", 17, 5, 6, 4, fl=3, door=1, kind="temple"),
        G("elders", 9, 5, 4, 3, fl=1, door=1), G("law", 27, 5, 4, 3, door=1),
        B("bell", 9, 22, 2, 2, fl=2), B("drum", 30, 22, 2, 2, fl=2), gate(hq_y)],
        "fence": [ring(hq_y)], "deco": maze + pts("bamboo", (8, 10), (32, 10), (8, 14), (32, 14)),
        "lamps": [[15, 10], [25, 10]], "flags": [[17, 26], [24, 26]]}
    out_y = [6, 6, 34, 30]
    outer = {"yard": out_y, "builds": [
        G("treas", 24, 7, 5, 3, fl=1, door=1), G("medic", 9, 7, 4, 3, door=1),
        G("store", 31, 12, 3, 2), G("store", 7, 27, 3, 2), G("kitchen", 27, 26, 4, 2),
        G("dorm", 8, 13, 2, 6), G("dorm", 30, 17, 2, 6), G("guest", 13, 23, 4, 3, door=1), gate(out_y)],
        "fence": [ring(out_y, [(5, 19, 1, 3)])],
        "deco": grid("stone", [14, 17, 24, 27], [13, 17]) + pts("bamboo", (12, 11), (13, 11), (26, 21), (27, 21), (17, 27)) + pts("well", (24, 12)),
        "lamps": [[15, 12], [25, 12]], "flags": [[18, 31], [23, 31]], "arena": [2.6, 20.5]}
    bk_y = [12, 4, 28, 16]
    back = {"yard": bk_y, "builds": [
        B("lib", 18, 5, 4, 4, fl=3, door=1), G("shrine", 12, 6, 4, 3, door=1), B("pav", 25, 12, 2, 2, kind="pavilion"), gate(bk_y)],
        "fence": [ring(bk_y)], "deco": [[x, y, "stone"] for x, y in ((14, 12), (16, 11), (18, 12), (22, 12), (24, 11), (26, 9), (14, 14), (26, 15))] + pts("bamboo", (12, 4), (13, 4), (27, 4)),
        "lamps": [[16, 9], [24, 9]]}
    return {"big": {"hq": hq, "outer": outer, "back": back}}

# ---------------- 사천당가: 독과 암기의 가문, 높은 담 안 독초 밭 · 검푸른 독 연못 ----------------
def dang():
    hq_y = [7, 4, 33, 25]
    hq = {"yard": hq_y, "topX": 15, "builds": [
        B("main", 17, 5, 6, 4, fl=3, door=1, kind="temple"),
        G("elders", 8, 9, 3, 6, fl=1, door=1), G("law", 29, 9, 3, 6, door=1),
        B("bell", 12, 21, 2, 2, fl=2), B("drum", 27, 21, 2, 2, fl=2), gate(hq_y)],
        "ground": [[23, 12, 27, 17, 2]],
        "fence": [ring(hq_y), wall(7, 19, 33, 19, [(18, 19, 6, 1)])],
        "deco": grid("herbbed", [12, 13, 14, 15, 16], [11, 13, 15, 17]) + pts("grock", (28, 17)),
        "lamps": [[15, 9], [24, 9], [16, 22], [25, 22]], "flags": [[17, 26], [24, 26]]}
    out_y = [6, 6, 34, 30]
    outer = {"yard": out_y, "builds": [
        G("treas", 24, 7, 5, 3, fl=1, door=1), G("medic", 8, 7, 4, 3, door=1),
        G("store", 31, 12, 3, 2), G("store", 31, 16, 3, 2), G("kitchen", 31, 21, 3, 2),
        G("dorm", 8, 23, 6, 2), G("dorm", 24, 25, 5, 2), G("guest", 8, 14, 4, 3, door=1), gate(out_y)],
        "fence": [ring(out_y, [(5, 19, 1, 3)])],
        "deco": grid("herbbed", [14, 15, 16, 17], [12, 14, 16]) + grid("herbbed", [24, 25, 26, 27], [12, 14, 16]) + pts("rack", (14, 20), (27, 20)),
        "lamps": [[19, 12], [23, 12], [14, 27], [26, 23]], "flags": [[18, 31], [23, 31]], "arena": [2.6, 20.5]}
    bk_y = [12, 4, 28, 16]
    back = {"yard": bk_y, "builds": [
        B("lib", 18, 5, 4, 4, fl=3, door=1), G("shrine", 12, 6, 4, 3, door=1), B("pav", 25, 13, 2, 2, kind="pavilion"), gate(bk_y)],
        "ground": [[23, 5, 27, 10, 2]], "fence": [ring(bk_y)], "deco": grid("herbbed", [13, 14, 15, 16], [12, 14]), "lamps": [[16, 10], [24, 12]]}
    return {"big": {"hq": hq, "outer": outer, "back": back}}

# ---------------- 사마세가: 성채 같은 사파 세가, 겹담과 네 귀 누각 ----------------
def sama():
    hq_y = [7, 4, 33, 25]
    hq = {"yard": hq_y, "topX": 15, "builds": [
        B("main", 17, 6, 6, 4, fl=3, door=1, kind="temple"),
        G("elders", 9, 11, 4, 3, fl=1, door=1), G("law", 27, 11, 4, 3, door=1),
        B("bell", 8, 4, 2, 2, fl=2), B("drum", 31, 4, 2, 2, fl=2), B("bell", 8, 22, 2, 2, fl=2), B("drum", 31, 22, 2, 2, fl=2), gate(hq_y)],
        "fence": [ring(hq_y), wall(12, 17, 28, 17, [(18, 17, 6, 1)]), wall(12, 4, 12, 10), wall(28, 4, 28, 10)],
        "deco": pts("rack", (14, 20), (26, 20), (14, 22), (26, 22)) + pts("torch", (17, 12), (23, 12)),
        "lamps": [[15, 14], [25, 14]], "flags": [[17, 26], [24, 26], [16, 11], [24, 11]]}
    out_y = [6, 6, 34, 30]
    outer = {"yard": out_y, "builds": [
        G("treas", 24, 8, 5, 3, fl=1, door=1), G("medic", 9, 8, 4, 3, door=1),
        G("store", 31, 13, 3, 2), G("store", 7, 27, 3, 2), G("kitchen", 31, 17, 3, 2),
        G("dorm", 8, 15, 2, 6), G("dorm", 26, 25, 6, 2), G("guest", 13, 23, 4, 3, door=1),
        B("bell", 6, 6, 2, 2, fl=2), B("drum", 33, 6, 2, 2, fl=2), gate(out_y)],
        "fence": [ring(out_y, [(5, 19, 1, 3)])],
        "deco": grid("dummy", [15, 18, 23, 26], [14, 18]) + pts("torch", (17, 28), (24, 28)),
        "lamps": [[14, 12], [26, 12]], "flags": [[18, 31], [23, 31]], "arena": [2.6, 20.5]}
    bk_y = [12, 4, 28, 16]
    back = {"yard": bk_y, "builds": [
        B("lib", 18, 5, 4, 4, fl=3, door=1), G("shrine", 12, 6, 4, 3, door=1), B("pav", 25, 12, 2, 2, kind="pavilion"), gate(bk_y)],
        "fence": [ring(bk_y)], "deco": pts("grock", (14, 13), (26, 6)), "lamps": [[16, 10], [24, 10]]}
    return {"big": {"hq": hq, "outer": outer, "back": back}}

# ---------------- 황보세가(중견): 한 장 안에 앞마당 연무장 + 뒤 안채 사합원 ----------------
def hwangbo():
    yd = [8, 3, 32, 24]
    hq = {"yard": yd, "builds": [
        B("main2", 17, 3, 6, 4, fl=2, door=1, kind="temple"),
        G("lib2", 9, 4, 4, 3, fl=1, door=1), G("treas1", 27, 4, 4, 3, door=1),
        G("elders1", 9, 10, 3, 5, door=1), G("medic", 28, 10, 3, 5, door=1), G("dorm", 9, 20, 5, 2), gate(yd)],
        "fence": [ring(yd), wall(8, 16, 32, 16, [(18, 16, 6, 1)])],
        "deco": grid("dummy", [16, 25], [18, 21]) + pts("rack", (27, 19), (27, 21)) + pts("well", (15, 11)),
        "lamps": [[15, 8], [24, 8]], "flags": [[17, 25], [24, 25]]}
    return {"mid": {"hq": hq}}

CLAN_TITLES = {"지객 장로": "총관", "총관": "장방 집사", "장부 집사": "장부 하인", "호법": "호위무사", "장문 집사": "가주 시종",
               "전공 장로": "가문 어른", "대장로": "큰 어른", "장로": "가문 어른", "집법 장로": "가법 어른", "장경각주": "서고 어른",
               "장경각 서동": "서동", "장경각 관리 제자": "서고지기", "수묘 제자": "사당지기", "외원 집사": "객청 집사", "의원": "가문 의원"}

D = json.load(open(P, encoding='utf8'))
L = D['SECTMAP']['look']
L['clan'] = {"titles": CLAN_TITLES}
for f in (namgung, moyong, paeng, jegal, dang, sama, hwangbo):
    L[f.__name__] = f()
json.dump(D, open(P, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('ok', [f.__name__ for f in (namgung, moyong, paeng, jegal, dang, sama, hwangbo)])

# 나노바나나 → spritify 프롬프트 틀

공통 규칙 (툴이 바로 먹으려면 반드시 명시)
- 격자: `COLS x ROWS grid`, 셀 크기 고정, 셀 사이 여백/구분선 없음
- 기준점: 모든 셀에서 발(또는 중심)이 **같은 위치** → `feet at bottom center of every cell`
- 배경: 투명 대신 단색 `flat solid #FF00FF background` (툴에서 `--key-color 255,0,255`)
- 캐릭터 색에 마젠타가 섞이면 안 됨 → `no magenta in the character`
- 시점/스타일/크기 고정: `side view`, `same character scale in every cell`

실행
```
python spritify.py sheet.png --grid 4x2 --key-color 255,0,255 --fps 10 --clip walk --name hero -o out --preview --loop
```
생성 결과에 빈 셀이 있으면 `--grid-count 6`, 셀이 정확히 안 나뉘면 `--cell 256x256`.

---

## 1. 통짜 캐릭터 걷기 (먼저 이걸로 시작)
```
Pixel art sprite sheet of a wuxia martial artist character, side view facing right.
4 x 2 grid, 8 cells, each cell exactly 256x256 px, no gaps, no borders, no labels.
Walk cycle, 8 consecutive frames read left-to-right then top-to-bottom.
Character feet planted at the bottom center of every cell, identical scale in every cell.
Flat solid #FF00FF background, no shadow, no magenta on the character.
Clean pixel art, 1px outline, limited palette.
```

## 2. 같은 캐릭터, 다른 동작 (idle / attack)
이미지 편집 모드에 1번 시트를 넣고:
```
Using this exact character, same style, same scale, same cell layout (4x2, 256x256, #FF00FF),
replace the animation with a sword attack: 8 frames, wind-up → slash → recovery.
Feet at bottom center of every cell. Keep the face, hair and outfit identical.
```
→ `--clip attack` 로 아틀라스에 추가 (`spritify.py walk.png attack.png --grid 4x2 ... --clip walk --clip attack`)

## 3. 파츠 분리 (페이퍼돌) — 2단계
완성 시트가 마음에 들면, 같은 시트를 넣고 **빼기/남기기** 요청:
```
Using this exact sprite sheet, keep everything pixel-identical but REMOVE the hair completely,
leaving the scalp bare. Same 4x2 grid, same cells, same #FF00FF background.
```
```
Using this exact sprite sheet, keep ONLY the hair in each cell, exactly where it is.
Erase the body, clothes and weapon to flat #FF00FF. Same 4x2 grid, same cells.
```
같은 식으로 weapon / clothes 분리. 각 결과를 같은 옵션으로 돌리고 `sourceSize`·`pivot`이 전부 같은지 확인하면 겹쳐서 씀.

## 4. 실사풍이면
```
... photorealistic, consistent lighting from the left in every cell, no motion blur,
flat #00FF00 background (green screen) ...
```
→ `--key-color 0,255,0 --key-tol 80`. 머리카락 경계가 지저분하면 `rembg` 전처리 권장.

## 흔한 실패와 대처
- 셀마다 크기 들쭉날쭉 → "identical scale" 강조 + `--no-trim` 끄지 말 것(트림이 offset으로 보정)
- 격자가 7칸만 채워짐 → `--grid-count 7`
- 배경에 그라데이션/그림자 → "flat solid, no shadow, no gradient" 추가
- 프레임 간 얼굴/옷 변함 → 1번 시트를 레퍼런스로 넣는 편집 모드로 생성(새로 생성 X)

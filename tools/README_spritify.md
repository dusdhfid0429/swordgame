# spritify

GIF / APNG / WEBP / MP4 / WEBM / 이미지 폴더 → 스프라이트 아틀라스 PNG + 프레임 테이블 JSON + 클립 JSON

```
pip install pillow numpy      # 영상 입력은 ffmpeg 필요
python spritify.py walk.gif -o out --name hero --clip walk --preview --loop
python spritify.py walk.gif attack.gif -o out --name hero --clip walk --clip attack
python spritify.py shot.mp4 -o out --fps 12 --key-color 0,255,0      # 그린스크린 실사
```

출력
- `hero.png`           아틀라스
- `hero.atlas.json`    프레임: rect / offset / sourceSize / pivot / trimmed
- `hero.clips.json`    클립: frames(인덱스) / fps / loop / durations_ms / events
- `hero.<clip>.preview.gif`  (--preview) 아틀라스+JSON만으로 재조립한 검증용 GIF

옵션
- `--no-trim` 투명 여백 트림 끄기 / `--trim-pad N` 트림 후 여백
- `--no-dedupe` 동일 프레임 합치기 끄기
- `--key-color R,G,B --key-tol N` 단색 배경 제거
- `--scale 0.5` 축소 / `--max-width 4096` / `--padding 2`

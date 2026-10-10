# 앱인토스 포장

`dist/gangho.html`(게임 본체)에 토스 SDK 다리를 붙여 `.ait` 번들로 만든다.

```
cd toss
npm install
npm run dev      # 로컬 확인 (http://localhost:3000)
npm run build    # dist/ 와 .ait 번들 생성 → 앱인토스 콘솔에 올린다
```

- `apps-in-toss.config.ts` 의 `appName` 은 콘솔에 등록한 이름으로 바꿔야 한다. 한 번 정하면 못 바꾼다.
- 게임 카테고리로 등록해야 `getUserKeyForGame`(저장 키)이 동작한다.
- 게임 쪽 토스 대응 코드는 `src/g_toss.js`: 세로 고정, 안전 영역, 뒤로 가기 → 종료 확인 창, 화면을 내리면 멈춤, 토스 저장소에 기록.
- 브라우저에서 토스 화면 배치만 보려면 `dist/gangho.html#toss` 로 연다.
- 출시 요건 정리: `docs/앱인토스_출시_점검.md`

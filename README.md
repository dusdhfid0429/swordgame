# 강호윤회록

쿼터뷰 무협 브라우저 게임입니다. 엔진 없이 canvas 한 장으로 돌아가는 단일 HTML 파일입니다.

- 공개 버전: https://claude.ai/artifact/CFv5nS6GmLaCen2q9skDvA
- 그림은 모두 코드로 그렸고, 주인공 스프라이트는 직접 제공한 시트를 base64로 넣었습니다(`src/r_atlas.js`). 신영웅문 원작 에셋은 쓰지 않았습니다.

## 실행

`dist/gangho.html` 을 브라우저로 열면 바로 플레이됩니다. 저장은 브라우저 localStorage(`ganghoyunhoe-save-v1`)에 됩니다. 저장에는 형식 번호 `v`가 붙고, 옛 저장은 불러올 때 `src/g_save.js`의 `MIGRATE`가 순서대로 옮깁니다. 저장 형식을 바꾸면 `SAVE_VER`를 올리고 옮기는 함수를 하나 더하세요.

## 수정 후 빌드

```
python3 build.py        # src/ 조각을 이어 dist/gangho.html 생성
```

`src/` 파일은 한 스크립트로 이어 붙여지므로 전역 이름이 겹치지 않게 주의하세요. 순서는 `build.py` 의 `PARTS` 에 있습니다.

다른 파일의 함수에 규칙을 더할 때는 함수를 감싸 덮어쓰지 말고 `hook('이름', 함수)`로 등록하세요. 핵심 함수가 정해진 자리에서 `runHooks`로 부릅니다. 훅 이름과 넘기는 값은 `src/g_core.js`의 "훅" 주석에 있습니다. 소리(`g_audio.js`)만은 결과를 듣기만 하는 관찰자라 예외로 감싸기를 씁니다.

## 테스트

```
npm i -D playwright && npx playwright install chromium
python3 build.py
node tests/run.js              # tests/t*.js 전부, 4개씩 나란히. 하나라도 실패하면 exit 1
node tests/run.js realm touch  # 이름에 realm·touch가 든 것만
node tests/run.js -j 1 -t 600  # 하나씩, 파일마다 600초 제한
```

각 테스트는 `PASS …`/`FAIL …` 줄과 마지막에 `no console errors` 또는 `ERRORS`를 찍습니다. 러너는 `FAIL` 줄, `ERRORS`, 0이 아닌 종료 코드, 시간 초과를 실패로 셉니다. 스크린샷은 `tests/shots/`(커밋하지 않음)에 남습니다.
GitHub에 푸시하면 `.github/workflows/test.yml`이 빌드, dist 일치 확인, 전체 테스트를 돌립니다.

## 파일 구성

| 파일 | 내용 |
|---|---|
| `g_head.html` | CSS, 화면 DOM, 하단 패널 |
| `g_data.js` | 근골·신분·무기·오행·무공 생성·몬스터·직업·레시피 등 데이터 |
| `g_core.js` | 캐릭터 상태, 아이템, 전투 계산, 초식/연속기/필살기, 내공 수련, 길들이기 |
| `g_world.js` | 맵 생성(개봉 마을, 동굴, 산채, 농지, 집터), 좌표 변환, 바닥 굽기 |
| `g_life.js` | 갱신 루프, 이동/길찾기, 몹 AI, 상호작용, 농사·제작, 해 넘김, 죽음·윤회, 비무, 저장 |
| `g_ui.js` | 로그, HUD, 스킬 바, 각종 창(K/B/I/P/L/H), 상점·NPC 대화 |
| `g_screens.js` | 타이틀, 캐릭터 생성, 환생 화면, 입력 처리 |
| `g_touch.js` | 모바일 터치 조작: 조이스틱, 버튼 여섯 개, 메뉴 |
| `g_draw.js` | 그리기(날씨·계절·동굴 어둠), NPC·짐승·말, 미니맵, 메인 루프 |
| `r_*.js` | 이전 프로토타입 「흑풍채 토벌기」에서 가져와 고친 엔진 조각(초식 실행, 이펙트, 건물, 캐릭터 그리기) |

## 조작

휴대폰·태블릿에서는 터치 조작 화면이 자동으로 켜집니다. 왼쪽 아래를 끌어 이동하고, 오른쪽 아래의 공격·필살·경공·비기·약·상황 버튼과 ☰ 메뉴 하나로 모든 것을 합니다. 공격 버튼은 자동초식으로 익힌 초식을 차례로 잇습니다. 조작법 창에서 PC 조작과 서로 바꿀 수 있습니다 (`src/g_touch.js`).

PC: 클릭 이동·공격 / 초식 Q A Z E D C (넘버패드 7 4 1 9 6 3) / 필살기 S / 특수무공 1~3 / 신공 V / 물약 4~5 / 경공 Space / 운기 X / 창 K B I P L H / Esc 닫기

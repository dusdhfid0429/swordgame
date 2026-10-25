# 안드로이드 설치판 (직접 설치용 APK)

`dist/gangho.html` 을 웹뷰 하나에 담은 앱입니다. 플레이 스토어나 토스를 거치지 않고, 파일을 받아 직접 설치하게 해서 다른 사람에게 시험해 보게 할 때 씁니다. 토스 인앱 포장(`toss-ready` 가지)과는 따로입니다.

- 인터넷 없이 돕니다. 글꼴(Song Myung, Gowun Dodum, SIL OFL)도 게임에 쓰는 글자만 남겨 넣었습니다.
- 세로 화면 고정, 상태 표시줄·내비게이션 막대 숨김, 처음 켜면 터치 조작.
- 저장은 앱 안의 localStorage 에 남습니다. 같은 키로 서명한 새 판은 지우지 않고 덮어 깔 수 있어 기록이 이어지지만, 앱을 지우면 기록도 지워집니다.
- 뒤로 가기: 열린 창을 닫고, 닫을 창이 없으면 "강호를 떠날까요?" 를 묻습니다. 끝내기를 누르면 기록하고 닫습니다.
- 화면을 내리면 멈추고 기록합니다. 화면 켜 두기(v175 의 5분 규칙 포함)는 창 플래그로 이어 받습니다.

## 만들기

```sh
sudo apt install aapt dalvik-exchange zipalign apksigner android-sdk-platform-23   # 우분투
pip install fonttools brotli pillow                                               # 있으면 글꼴을 줄이고 아이콘을 그림
python3 android/build_apk.py --keystore <키 파일 경로>
node android/test_apk.js                                                          # 웹뷰 이음 점검 (Playwright)
```

결과는 `android/build/gangho.apk`. 키 파일이 없으면 새로 만들고 비밀번호를 `<키 파일>.pass` 에 적습니다.
**키 파일과 .pass 는 저장소에 넣지 않습니다.** 다음 판도 같은 키로 서명해야 덮어 깔 수 있습니다.
안드로이드 SDK 가 있으면 `BUILD_TOOLS=<sdk>/build-tools/<판> ANDROID_JAR=<sdk>/platforms/android-<판>/android.jar` 로 그 도구를 씁니다.

## 설치 (받는 사람)

1. 휴대폰에서 `.apk` 파일을 받습니다 (카카오톡·드라이브 등).
2. 파일을 누르면 "출처를 알 수 없는 앱" 경고가 뜹니다. **설정** → 이 출처(카카오톡, 내 파일, 크롬 등) **허용** 을 켭니다.
3. 돌아가서 **설치**. Play 프로텍트가 "확인되지 않은 앱" 이라고 하면 **세부정보 → 무시하고 설치** 를 누릅니다.
4. 새 판은 같은 방법으로 덮어 설치하면 기록이 그대로 남습니다.

안드로이드 7.0 이상. 아이폰은 이런 파일 설치가 없어서 TestFlight(애플 개발자 계정 필요)나 브라우저로 `gangho.html` 을 여는 방법을 씁니다.

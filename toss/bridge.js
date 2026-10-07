// 토스 SDK를 게임 코드(평범한 스크립트)에 넘겨준다. 게임 쪽은 src/g_toss.js 가 window.AIT 를 쓴다.
import * as sdk from '@apps-in-toss/web-framework';

window.AIT = sdk;
window.dispatchEvent(new Event('ait-ready'));

import { defineConfig } from '@apps-in-toss/web-framework/config';

// appName 은 앱인토스 콘솔에 등록한 이름과 같아야 하고, 한 번 정하면 바꿀 수 없다.
export default defineConfig({
  appName: 'ganghoyunhoe',
  brand: {
    primaryColor: '#C9A14A',
  },
  webView: {},
  permissions: [],
  webBundleDir: 'dist',
});

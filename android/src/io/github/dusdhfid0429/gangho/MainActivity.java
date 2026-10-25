package io.github.dusdhfid0429.gangho;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.util.HashMap;

// 게임 한 장을 띄우는 웹뷰 하나뿐인 화면. 그 앞에 시험판 잠금(Gate)과 뜯어 고치기 방지(Guard)가 선다.
// 게임 파일은 암호화되어 있어 https://gangho.local/ 로 요청이 오면 풀어서 건넨다(바깥 주소는 막는다).
// 뒤로 가기는 게임 쪽(apk_bridge.js 의 apkBack)에 넘기고, 화면 켜 두기·끝내기는 AndroidApp 으로 받는다.
public class MainActivity extends Activity {
    static final String ORIGIN = "https://gangho.local/";
    private WebView web;
    private final HashMap<String, byte[]> files = new HashMap<>();
    private int gen;   // 잠금 화면 ↔ 게임 전환 세대 (늦게 온 목록 확인 결과가 엉뚱한 화면을 바꾸지 않게)

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        Window w = getWindow();
        w.setStatusBarColor(Color.BLACK);
        w.setNavigationBarColor(Color.BLACK);
        if (Build.VERSION.SDK_INT >= 28) {  // 노치 쪽까지 그린다 (LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES = 1, API 28 필드라 리플렉션으로)
            try {
                WindowManager.LayoutParams lp = w.getAttributes();
                lp.getClass().getField("layoutInDisplayCutoutMode").setInt(lp, 1);
                w.setAttributes(lp);
            } catch (Exception e) {
            }
        }
        WebView.setWebContentsDebuggingEnabled(false);
        String bad = Guard.problem(this);
        if (bad != null) {
            showGate(null, bad, false);
            return;
        }
        Gate.Result r = Gate.full(this, Gate.saved(this));
        if (r.ok) startGame(r);
        else showGate(r, r.msg, true);
        refreshList();
    }

    // 온라인 목록을 받아 다시 따져 본다. 게임 중이면 막히면 잠금 화면으로, 잠금 화면이면 풀리면 게임으로
    private void refreshList() {
        if (Gate.LIST_URL.isEmpty() || Guard.problem(this) != null) return;
        final int g = gen;
        new Thread(new Runnable() {
            @Override
            public void run() {
                final String err = Gate.fetchList(MainActivity.this);
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (g != gen || isFinishing()) return;
                        Gate.Result r = Gate.full(MainActivity.this, Gate.saved(MainActivity.this));
                        if (web != null && !r.ok) showGate(r, r.msg, true);
                        else if (web == null && r.ok) startGame(r);
                        else if (web == null && err != null && r.needNet) showGate(r, r.msg + "\n(" + err + ")", true);
                    }
                });
            }
        }).start();
    }

    private TextView text(String s, float sp, int color) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        t.setGravity(Gravity.CENTER);
        t.setPadding(0, dp(6), 0, dp(6));
        return t;
    }

    private Button button(String s) {
        Button b = new Button(this);
        b.setText(s);
        b.setTextColor(0xffe8dcc0);
        b.setBackgroundColor(0xff3a2c1a);
        b.setAllCaps(false);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    // 잠금 화면: 기기 번호를 보여 주고 초대 코드를 받는다. allowCode=false 면 까닭만 보여 준다(고친 앱)
    private void showGate(Gate.Result r, String msg, boolean allowCode) {
        gen++;
        if (web != null) {
            web.evaluateJavascript("try{if(playing)saveGame(true);paused=true}catch(e){}", null);
            web.destroy();
            web = null;
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setPadding(dp(24), dp(48), dp(24), dp(24));
        col.setGravity(Gravity.CENTER_HORIZONTAL);
        TextView title = text("강호윤회록 시험판", 26, 0xffe8dcc0);
        title.setTypeface(Typeface.SERIF, Typeface.BOLD);
        col.addView(title);
        if (!allowCode) {
            col.addView(text(msg + "\n\n받은 곳에서 다시 받아 설치해 주세요.", 16, 0xffe0675a));
        } else {
            final String dev = Gate.deviceCode(this);
            col.addView(text("이 기기 번호를 보내고 초대 코드를 받아 붙여 넣어 주세요.", 15, 0xff9a8d72));
            TextView devT = text(dev, 30, 0xffc9a14a);
            devT.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
            devT.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    copy("기기 번호", dev);
                }
            });
            col.addView(devT);
            col.addView(text("(누르면 복사)", 12, 0xff9a8d72));
            final EditText in = new EditText(this);
            in.setHint("초대 코드");
            in.setHintTextColor(0xff6b5636);
            in.setTextColor(0xffe8dcc0);
            in.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            in.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_MULTI_LINE | InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS);
            in.setMinLines(3);
            in.setText(Gate.saved(this));
            col.addView(in, new LinearLayout.LayoutParams(-1, -2));
            final TextView st = text(msg == null ? "" : msg, 14, 0xffe0675a);
            LinearLayout row = new LinearLayout(this);
            row.setGravity(Gravity.CENTER);
            Button paste = button("붙여넣기"), ok = button("확인");
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1);
            lp.setMargins(dp(6), dp(10), dp(6), dp(4));
            row.addView(paste, lp);
            row.addView(ok, lp);
            col.addView(row, new LinearLayout.LayoutParams(-1, -2));
            col.addView(st);
            paste.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    ClipData cd = cm.getPrimaryClip();
                    if (cd != null && cd.getItemCount() > 0) in.setText(cd.getItemAt(0).coerceToText(MainActivity.this));
                }
            });
            ok.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    String code = Gate.norm(in.getText().toString());
                    Gate.Result c = Gate.check(MainActivity.this, code);
                    if (!c.ok) {
                        st.setText(c.msg.isEmpty() ? "초대 코드를 넣어 주세요." : c.msg);
                        return;
                    }
                    Gate.save(MainActivity.this, code);
                    Gate.Result f = Gate.full(MainActivity.this, code);
                    if (f.ok) startGame(f);
                    else {
                        st.setText(f.needNet ? "코드를 확인하는 중입니다…" : f.msg);
                        refreshList();
                    }
                }
            });
        }
        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(Color.rgb(11, 10, 9));
        sv.setFillViewport(true);
        sv.addView(col);
        setContentView(sv);
    }

    private void copy(String label, String s) {
        ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        cm.setPrimaryClip(ClipData.newPlainText(label, s));
        Toast.makeText(this, label + "를 복사했습니다", Toast.LENGTH_SHORT).show();
    }

    private void startGame(Gate.Result r) {
        gen++;
        if (r != null && r.daysLeft <= 3)
            Toast.makeText(this, "초대 코드 기한이 " + r.daysLeft + "일 남았습니다 (" + r.until + "까지)", Toast.LENGTH_LONG).show();
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(11, 10, 9));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage = 저장 칸
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                    // 기기 글꼴 크기 설정이 화면 배치를 깨지 않게
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest req) {
                return serve(req.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {   // API 24+ 판도 기본 구현이 이것을 부른다
                return !url.startsWith(ORIGIN);
            }
        });
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "AndroidApp");
        setContentView(web);
        hideBars();
        web.loadUrl(ORIGIN + "index.html");
    }

    // 웹뷰의 모든 요청이 여기로 온다 (웹뷰 스레드). 우리 주소면 풀어서, 아니면 빈 응답
    private WebResourceResponse serve(String url) {
        if (!url.startsWith(ORIGIN)) return new WebResourceResponse("text/plain", "utf-8", 403, "blocked", null, new ByteArrayInputStream(new byte[0]));
        String path = url.substring(ORIGIN.length());
        int q = path.indexOf('?');
        if (q >= 0) path = path.substring(0, q);
        String name = path.replace('/', '_') + ".bin";
        byte[] b;
        synchronized (files) {
            b = files.get(name);
            if (b == null) {
                try {
                    b = Guard.open(this, name);
                } catch (Exception e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "not found", null, new ByteArrayInputStream(new byte[0]));
                }
                files.put(name, b);
            }
        }
        String mime = path.endsWith(".html") ? "text/html" : path.endsWith(".woff2") ? "font/woff2" : path.endsWith(".ttf") ? "font/ttf" : "application/octet-stream";
        return new WebResourceResponse(mime, "utf-8", new ByteArrayInputStream(b));
    }

    private void hideBars() {
        View v = web != null ? web : getWindow().getDecorView();
        v.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    public void onWindowFocusChanged(boolean has) {
        super.onWindowFocusChanged(has);
        if (has && web != null) hideBars();
    }

    @Override
    public void onBackPressed() {
        if (web == null) {
            finish();
            return;
        }
        web.evaluateJavascript("window.apkBack?(apkBack(),1):0", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String v) {
                if (!"1".equals(v)) finish();
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web == null) return;
        Gate.Result r = Gate.full(this, Gate.saved(this));   // 켜 둔 채 기한이 지났으면 여기서 막는다
        if (!r.ok) {
            showGate(r, r.msg, true);
            return;
        }
        web.onResume();
        hideBars();
        refreshList();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private class Bridge {
        @JavascriptInterface
        public void keepScreen(final boolean on) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public void exit() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finish();
                }
            });
        }
    }
}

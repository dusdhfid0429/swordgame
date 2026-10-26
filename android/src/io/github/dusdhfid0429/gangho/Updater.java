package io.github.dusdhfid0429.gangho;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

// 켤 때 최신화: 서명된 목록(Gate)의 game 칸 {rev, url, sha256, shell} 이 들어 있는 판보다 새것이면
// 그 묶음을 받아 해시·복호화를 확인하고 files/game.bin 에 둔다. 다음에 게임을 띄울 때부터 그것을 쓴다.
// app 칸 {latest, min, url} 은 앱 자체(apk) 판: latest 보다 낮으면 받기 안내, min 보다 낮으면 실행을 막는다.
final class Updater {
    static final int BUILT_REV = @GAMEREV@;   // 이 apk 에 들어 있는 게임 판 (= versionCode)
    static final int SHELL = @SHELL@;         // 껍데기(AndroidApp 이음) 판. 묶음의 shell 이 이보다 크면 받지 않는다
    private static final String PREF = "update", K_REV = "rev";

    private static File file(Context c) {
        return new File(c.getFilesDir(), "game.bin");
    }

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREF, Context.MODE_PRIVATE);
    }

    static int rev(Context c) {
        int r = prefs(c).getInt(K_REV, 0);
        return r > BUILT_REV && file(c).exists() ? r : BUILT_REV;
    }

    // 받아 둔 새 판의 index.html. 없거나 망가졌으면 null (들어 있는 판을 쓴다)
    static byte[] game(Context c) {
        if (rev(c) <= BUILT_REV) return null;
        try {
            return Guard.decrypt(c, Guard.read(new FileInputStream(file(c))));
        } catch (Exception e) {
            file(c).delete();
            prefs(c).edit().remove(K_REV).apply();
            return null;
        }
    }

    // 네트워크. 새 판을 받아 두었으면 true
    static boolean fetch(Context c) {
        JSONObject l = Gate.list(c), g = l == null ? null : l.optJSONObject("game");
        if (g == null) return false;
        int r = g.optInt("rev");
        if (r <= rev(c) || g.optInt("shell", 1) > SHELL) return false;
        File tmp = new File(c.getFilesDir(), "game.tmp");
        try {
            HttpURLConnection h = (HttpURLConnection) new URL(g.getString("url")).openConnection();
            h.setConnectTimeout(10000);
            h.setReadTimeout(30000);
            if (h.getResponseCode() != 200) return false;
            InputStream in = h.getInputStream();
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) {
                o.write(buf, 0, n);
                if (o.size() > 64 << 20) return false;
            }
            in.close();
            byte[] b = o.toByteArray();
            if (!Guard.hex(MessageDigest.getInstance("SHA-256").digest(b)).equals(g.getString("sha256"))) return false;
            Guard.decrypt(c, b);   // 풀리는지 먼저 본다
            FileOutputStream f = new FileOutputStream(tmp);
            f.write(b);
            f.close();
            if (!tmp.renameTo(file(c))) return false;
            prefs(c).edit().putInt(K_REV, r).apply();
            return true;
        } catch (Exception e) {
            tmp.delete();
            return false;
        }
    }

    // 앱 판 안내: 0 = 괜찮음, 1 = 새 판 있음, 2 = 너무 오래되어 막음
    static int appState(Context c, int myCode) {
        JSONObject l = Gate.list(c), a = l == null ? null : l.optJSONObject("app");
        if (a == null) return 0;
        if (myCode < a.optInt("min")) return 2;
        return myCode < a.optInt("latest") ? 1 : 0;
    }

    static String appUrl(Context c) {
        JSONObject l = Gate.list(c), a = l == null ? null : l.optJSONObject("app");
        return a == null ? "" : a.optString("url", "");
    }
}

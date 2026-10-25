package io.github.dusdhfid0429.gangho;

import android.content.Context;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.util.Base64;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

// 시험판 잠금: 서버 없이 기한 있는 활성화 코드를 검사한다.
// 코드 = base64url("v1|기기 번호 또는 *|만료일 yyyy-MM-dd|이름") + "." + base64url(ECDSA P-256 서명).
// 서명 키는 저장소 밖에 있고(android/issue_code.py), 앱에는 공개 키만 들어간다(build_apk.py 가 PUBKEY 를 채운다).
// LIST_URL 이 있으면 같은 키로 서명한 온라인 목록({"t","off","msg","revoked":[코드 번호]})으로 코드를 끄거나 전체를 닫는다.
// 목록을 GRACE_DAYS 넘게 못 받으면 인터넷 연결을 요구한다.
final class Gate {
    static final String PUBKEY = "@PUBKEY@";
    static final String LIST_URL = "@LISTURL@";
    static final int GRACE_DAYS = 3;
    private static final String PREF = "gate", K_CODE = "code", K_SEEN = "seen", K_LIST = "list", K_LIST_T = "listT", K_LIST_OK = "listOk";
    private static final String B32 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // 헷갈리는 I·O·0·1 뺌

    static final class Result {
        final boolean ok;
        final String msg, name, until;
        final int daysLeft;
        boolean needNet;

        Result(boolean ok, String msg, String name, String until, int daysLeft) {
            this.ok = ok; this.msg = msg; this.name = name; this.until = until; this.daysLeft = daysLeft;
        }
    }

    static String norm(String code) {
        return code == null ? "" : code.replaceAll("\\s", "");
    }

    // 목록에 적는 코드 번호: 코드 전체의 SHA-256 앞 16자 (issue_code.py 와 같게)
    static String codeId(String code) {
        try {
            return Guard.hex(MessageDigest.getInstance("SHA-256").digest(norm(code).getBytes(StandardCharsets.UTF_8))).substring(0, 16);
        } catch (Exception e) {
            return "";
        }
    }

    // 서명 확인 후 본문을 돌려준다. 틀리면 null
    private static byte[] verified(String signed) {
        signed = norm(signed);
        int dot = signed.indexOf('.');
        if (dot < 1) return null;
        try {
            byte[] p = Base64.decode(signed.substring(0, dot), Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
            byte[] sig = Base64.decode(signed.substring(dot + 1), Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
            PublicKey pk = KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(Base64.decode(PUBKEY, Base64.DEFAULT)));
            Signature v = Signature.getInstance("SHA256withECDSA");
            v.initVerify(pk);
            v.update(p);
            return v.verify(sig) ? p : null;
        } catch (Exception e) {
            return null;
        }
    }

    // 온라인 목록을 받아 둔다 (네트워크, UI 스레드 밖에서). 성공이면 null
    static String fetchList(Context c) {
        if (LIST_URL.isEmpty()) return null;
        try {
            HttpURLConnection h = (HttpURLConnection) new URL(LIST_URL + (LIST_URL.contains("?") ? "&" : "?") + "n=" + System.currentTimeMillis()).openConnection();
            h.setConnectTimeout(8000);
            h.setReadTimeout(8000);
            h.setUseCaches(false);
            if (h.getResponseCode() != 200) return "목록 서버 응답 " + h.getResponseCode();
            InputStream in = h.getInputStream();
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0 && o.size() < 1 << 20) o.write(buf, 0, n);
            in.close();
            byte[] p = verified(new String(o.toByteArray(), StandardCharsets.UTF_8));
            if (p == null) return "목록 서명이 맞지 않습니다";
            String js = new String(p, StandardCharsets.UTF_8);
            long t = new JSONObject(js).getLong("t");
            SharedPreferences sp = prefs(c);
            if (t < sp.getLong(K_LIST_T, 0)) return "예전 목록입니다";   // 옛 목록을 되밀어 넣지 못하게
            sp.edit().putString(K_LIST, js).putLong(K_LIST_T, t).putLong(K_LIST_OK, Math.max(System.currentTimeMillis(), sp.getLong(K_SEEN, 0))).apply();
            return null;
        } catch (Exception e) {
            return "인터넷에 연결하지 못했습니다";
        }
    }

    // 코드 검사 + 받아 둔 목록 검사
    static Result full(Context c, String code) {
        Result r = check(c, code);
        if (!r.ok || LIST_URL.isEmpty()) return r;
        SharedPreferences sp = prefs(c);
        try {
            String js = sp.getString(K_LIST, null);
            if (js != null) {
                JSONObject o = new JSONObject(js);
                if (o.optBoolean("off")) {
                    String m = o.optString("msg", "");
                    return new Result(false, m.isEmpty() ? "시험판을 잠시 닫았습니다." : m, r.name, r.until, 0);
                }
                JSONArray rv = o.optJSONArray("revoked");
                String id = codeId(code);
                if (rv != null) for (int i = 0; i < rv.length(); i++)
                    if (id.equals(rv.optString(i))) return new Result(false, "사용이 중지된 코드입니다.", r.name, r.until, 0);
            }
        } catch (Exception e) {
        }
        long now = Math.max(System.currentTimeMillis(), sp.getLong(K_SEEN, 0)), ok = sp.getLong(K_LIST_OK, 0);
        if (now - ok > GRACE_DAYS * 86400000L) {
            Result x = new Result(false, "인터넷에 연결해 주세요. 며칠에 한 번은 코드를 확인합니다.", r.name, r.until, 0);
            x.needNet = true;
            return x;
        }
        return r;
    }

    // 기기 번호: ANDROID_ID(앱 서명 키·기기·사용자마다 다르고, 다시 깔아도 같다)를 줄여 XXXX-XXXX 로
    static String deviceCode(Context c) {
        String id = Settings.Secure.getString(c.getContentResolver(), Settings.Secure.ANDROID_ID);
        try {
            byte[] h = MessageDigest.getInstance("SHA-256").digest(("gangho:" + id).getBytes(StandardCharsets.UTF_8));
            StringBuilder s = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                if (i == 4) s.append('-');
                s.append(B32.charAt((h[i] & 0xff) % B32.length()));
            }
            return s.toString();
        } catch (Exception e) {
            return "????-????";
        }
    }

    static String saved(Context c) {
        return prefs(c).getString(K_CODE, "");
    }

    static void save(Context c, String code) {
        prefs(c).edit().putString(K_CODE, code).apply();
    }

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREF, Context.MODE_PRIVATE);
    }

    static Result check(Context c, String code) {
        code = norm(code);
        if (code.isEmpty()) return new Result(false, "", null, null, 0);
        if (code.indexOf('.') < 1) return new Result(false, "코드 모양이 맞지 않습니다.", null, null, 0);
        byte[] p = verified(code);
        if (p == null) return new Result(false, "올바른 코드가 아닙니다.", null, null, 0);
        String payload = new String(p, StandardCharsets.UTF_8);
        String[] f = payload.split("\\|", 4);
        if (f.length < 4 || !"v1".equals(f[0])) return new Result(false, "이 판에서 쓸 수 없는 코드입니다.", null, null, 0);
        if (!"*".equals(f[1]) && !f[1].equals(deviceCode(c)))
            return new Result(false, "다른 기기용 코드입니다. 이 기기 번호로 다시 받아 주세요.", f[3], f[2], 0);
        long end;
        try {
            SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            df.setLenient(false);
            Calendar cal = Calendar.getInstance();
            cal.setTime(df.parse(f[2]));
            cal.add(Calendar.DAY_OF_MONTH, 1);   // 만료일 하루 끝까지
            end = cal.getTimeInMillis();
        } catch (Exception e) {
            return new Result(false, "코드의 날짜가 잘못되었습니다.", null, null, 0);
        }
        // 시계를 되돌려 기한을 늘리지 못하게, 본 적 있는 가장 늦은 시각을 쓴다
        long now = System.currentTimeMillis(), seen = prefs(c).getLong(K_SEEN, 0);
        if (now > seen) prefs(c).edit().putLong(K_SEEN, now).apply();
        now = Math.max(now, seen);
        if (now >= end) return new Result(false, "기한이 지난 코드입니다 (" + f[2] + "까지).", f[3], f[2], 0);
        int left = (int) ((end - now + 86399999L) / 86400000L);
        return new Result(true, "", f[3], f[2], left);
    }
}

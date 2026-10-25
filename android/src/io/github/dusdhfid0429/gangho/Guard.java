package io.github.dusdhfid0429.gangho;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Base64;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.zip.GZIPInputStream;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

// 뜯어 고치기 방지: 앱을 고쳐 다시 포장하면 서명 키가 바뀐다. 서명 인증서가 우리 것인지 보고,
// 게임 파일(assets/g/*, gzip 후)은 그 인증서에 묶인 키로 AES-GCM 암호화해 두어 다른 키로 서명하면 풀리지 않게 한다.
// 마음먹고 기억 장치를 뜯는 사람까지 막지는 못한다. 그냥 풀어 보고 고쳐 퍼뜨리는 것을 막는 정도.
final class Guard {
    static final String CERT = "@CERTSHA@";   // 서명 인증서 SHA-256 (build_apk.py 가 채운다)
    static final String SALT = "@SALT@";

    static byte[] certSha(Context c) {
        try {
            PackageInfo pi = c.getPackageManager().getPackageInfo(c.getPackageName(), PackageManager.GET_SIGNATURES);
            Signature[] s = pi.signatures;
            if (s == null || s.length != 1) return null;
            return MessageDigest.getInstance("SHA-256").digest(s[0].toByteArray());
        } catch (Exception e) {
            return null;
        }
    }

    // 정상이면 null, 아니면 까닭
    static String problem(Context c) {
        if ((c.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) return "디버그용으로 고친 앱입니다.";
        byte[] h = certSha(c);
        if (h == null || !hex(h).equals(CERT)) return "고쳐서 다시 포장한 앱입니다.";
        return null;
    }

    static byte[] open(Context c, String name) throws Exception {
        byte[] h = certSha(c);
        if (h == null) throw new SecurityException("cert");
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(h);
        md.update(Base64.decode(SALT, Base64.DEFAULT));
        byte[] key = md.digest();
        byte[] all = read(c.getAssets().open("g/" + name));
        Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
        ci.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, all, 0, 12));
        return read(new GZIPInputStream(new ByteArrayInputStream(ci.doFinal(all, 12, all.length - 12))));
    }

    static String hex(byte[] b) {
        StringBuilder s = new StringBuilder();
        for (byte x : b) s.append(String.format("%02x", x & 0xff));
        return s.toString();
    }

    private static byte[] read(InputStream in) throws Exception {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
        in.close();
        return o.toByteArray();
    }
}

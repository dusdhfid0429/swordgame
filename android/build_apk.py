"""강호윤회록 안드로이드 설치판(APK)을 만든다. 직접 설치용(출처를 알 수 없는 앱)이라 자체 서명 키로 서명한다.

  python3 android/build_apk.py --keystore <키 파일 경로> [--issue-key <초대 코드 비밀 키>] [--out <apk 경로>]

키 파일이 없으면 새로 만들고, 비밀번호는 키 파일 옆 <키 파일>.pass 에 적는다. 키와 .pass 는 저장소에 넣지 않는다.
같은 키로 서명해야 이미 설치한 사람이 지우지 않고(=저장 기록을 잃지 않고) 새 판으로 덮어 깔 수 있다.
시험판 잠금: 초대 코드 비밀 키(기본은 키 파일 옆 gangho-issue.pem, 없으면 만든다)의 공개 키와 android/lock.json 의
list_url 을 앱에 넣는다. 게임 파일은 서명 인증서에 묶인 키로 암호화한다(Guard.java). 코드 발급은 issue_code.py.

필요한 것: JDK(javac·keytool), Python cryptography, 안드로이드 빌드 도구 aapt·dx(d8)·zipalign·apksigner, android.jar.
  우분투: apt install aapt dalvik-exchange zipalign apksigner android-sdk-platform-23
  안드로이드 SDK가 있으면 ANDROID_JAR, BUILD_TOOLS 환경 변수로 그 경로를 준다.
있으면 더 좋은 것: fontTools·brotli(글꼴을 게임에 쓰는 글자만 남겨 넣는다), Pillow(아이콘을 그린다).
"""
import argparse, base64, gzip, hashlib, json, os, re, secrets, shutil, subprocess, sys, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BUILD = os.path.join(HERE, 'build')
PKG = 'io.github.dusdhfid0429.gangho'
FONTS = {  # Google Fonts (SIL OFL). 웹뷰는 오프라인이라 게임 안에 넣는다
    'Song Myung': 'https://fonts.gstatic.com/s/songmyung/v23/1cX2aUDWAJH5-EIC7DIhr1E.ttf',
    'Gowun Dodum': 'https://fonts.gstatic.com/s/gowundodum/v12/3Jn5SD_00GqwlBnWc1TUJF0F.ttf',
}
BT = os.environ.get('BUILD_TOOLS', '/usr/lib/android-sdk/build-tools/debian')
AJAR = os.environ.get('ANDROID_JAR', '/usr/lib/android-sdk/platforms/android-23/android.jar')


def tool(name):
    p = os.path.join(BT, name)
    if os.path.exists(p):
        return p
    p = shutil.which(name)
    if not p:
        raise SystemExit(f'{name} 을(를) 찾지 못했습니다 (BUILD_TOOLS={BT})')
    return p


def run(*cmd, **kw):
    print('+', ' '.join(str(c) for c in cmd))
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def git(*a):
    return subprocess.run(['git', '-C', ROOT, *a], capture_output=True, text=True).stdout.strip()


def fonts(html, out):
    """글꼴을 내려받아(한 번만) 게임에 나오는 글자 + 한글 완성형 전부만 남긴 woff2 로 넣는다. 실패하면 기기 글꼴로 둔다."""
    cache = os.path.join(BUILD, 'cache')
    os.makedirs(cache, exist_ok=True)
    try:
        from fontTools import subset
        import brotli  # noqa: F401  (woff2)
    except ImportError:
        subset = None
    chars = set(html) | {chr(c) for c in range(0x20, 0x7f)} | {chr(c) for c in range(0xAC00, 0xD7A4)} | {chr(c) for c in range(0x3131, 0x3190)}
    css = []
    for fam, url in FONTS.items():
        src = os.path.join(cache, os.path.basename(url))
        if not os.path.exists(src):
            try:
                urllib.request.urlretrieve(url, src)
            except Exception as e:
                print(f'글꼴 {fam} 을(를) 받지 못해 기기 글꼴을 씁니다: {e}')
                continue
        name = fam.replace(' ', '')
        if subset:
            dst = name + '.woff2'
            o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']; o.name_IDs = ['*']
            f = subset.load_font(src, o)
            s = subset.Subsetter(o); s.populate(text=''.join(chars)); s.subset(f)
            subset.save_font(f, os.path.join(out, dst), o)
            fmt = 'woff2'
        else:
            dst = name + '.ttf'
            shutil.copy(src, os.path.join(out, dst))
            fmt = 'truetype'
        css.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/{dst}) format('{fmt}')}}")
    return '\n'.join(css)


def icon(res):
    """런처 아이콘: 어두운 바탕에 청동 테두리, 가운데 '劍'. Pillow 가 없으면 단색 아이콘."""
    sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        Image = None
    ttf = os.path.join(BUILD, 'cache', os.path.basename(FONTS['Song Myung']))
    for d, n in sizes.items():
        p = os.path.join(res, f'drawable-{d}')
        os.makedirs(p, exist_ok=True)
        if Image is None:
            import struct, zlib
            raw = b''.join(b'\0' + bytes([11, 10, 9]) * n for _ in range(n))
            ch = lambda t, b: struct.pack('>I', len(b)) + t + b + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)
            open(os.path.join(p, 'ic_launcher.png'), 'wb').write(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', n, n, 8, 2, 0, 0, 0)) + ch(b'IDAT', zlib.compress(raw)) + ch(b'IEND', b''))
            continue
        k = 4; N = n * k
        im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
        g = ImageDraw.Draw(im)
        g.rounded_rectangle([N * .04, N * .04, N * .96, N * .96], radius=N * .2, fill=(21, 17, 12, 255), outline=(168, 138, 85, 255), width=max(2, N // 24))
        txt = '劍'
        try:
            f = ImageFont.truetype(ttf, int(N * .62))
            if not f.getmask(txt).getbbox():
                raise OSError
        except OSError:
            txt = '강'
            f = ImageFont.truetype(ttf, int(N * .62)) if os.path.exists(ttf) else ImageFont.load_default()
        g.text((N / 2, N / 2 + N * .02), txt, font=f, fill=(232, 220, 192, 255), anchor='mm')
        im.resize((n, n), Image.LANCZOS).save(os.path.join(p, 'ic_launcher.png'))


def keystore(path):
    pw_file = path + '.pass'
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        pw = secrets.token_urlsafe(18)
        run('keytool', '-genkeypair', '-keystore', path, '-storetype', 'PKCS12', '-alias', 'gangho', '-keyalg', 'RSA', '-keysize', '3072',
            '-validity', '10000', '-storepass', pw, '-dname', 'CN=Gangho Yunhoe Rok, O=dusdhfid0429')
        open(pw_file, 'w').write(pw + '\n')
        os.chmod(pw_file, 0o600)
    return open(pw_file).read().strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--keystore', required=True)
    ap.add_argument('--issue-key')
    ap.add_argument('--out', default=os.path.join(BUILD, 'gangho.apk'))
    a = ap.parse_args()
    a.issue_key = a.issue_key or os.path.join(os.path.dirname(os.path.abspath(a.keystore)), 'gangho-issue.pem')
    sys.path.insert(0, HERE)
    import issue_code
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    run(sys.executable, os.path.join(ROOT, 'build.py'))
    shutil.rmtree(os.path.join(BUILD, 'stage'), ignore_errors=True)
    stage = os.path.join(BUILD, 'stage')
    assets, res, cls = (os.path.join(stage, x) for x in ('assets', 'res', 'classes'))
    os.makedirs(os.path.join(assets, 'fonts'))
    os.makedirs(cls)

    # 1) 게임 한 장 + 글꼴 + 안드로이드 이음 스크립트
    html = open(os.path.join(ROOT, 'dist', 'gangho.html'), encoding='utf8').read()
    css = fonts(html, os.path.join(assets, 'fonts'))
    html, n = re.subn(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\s*<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*">',
                      '<style>' + css + '</style>', html, count=1)
    if n != 1:
        raise SystemExit('g_head.html 의 Google Fonts 줄을 찾지 못했습니다')
    tail = '</body></html>'
    assert html.rstrip().endswith(tail)
    bridge = open(os.path.join(HERE, 'apk_bridge.js'), encoding='utf8').read()
    html = html.rstrip()[:-len(tail)] + '<script>\n' + bridge + '</script>\n' + tail + '\n'
    open(os.path.join(assets, 'index.html'), 'w', encoding='utf8').write(html)
    icon(res)

    # 2) 판 번호: versionCode 는 커밋 수(늘 커진다), versionName 은 마지막 vNNN + 커밋
    vcode = int(git('rev-list', '--count', 'HEAD') or 1)
    m = re.search(r'\bv(\d{2,4})\b', git('log', '-200', '--format=%s'))
    vname = (f'v{m.group(1)} ' if m else '') + (git('rev-parse', '--short', 'HEAD') or 'dev')
    man = open(os.path.join(HERE, 'AndroidManifest.xml'), encoding='utf8').read().replace('@VCODE@', str(vcode)).replace('@VNAME@', vname)
    open(os.path.join(stage, 'AndroidManifest.xml'), 'w', encoding='utf8').write(man)

    # 3) 잠금·암호화: 서명 인증서 SHA-256 에 묶인 키로 assets 를 assets/g/*.bin 으로 바꾼다
    pw = keystore(a.keystore)
    pem = subprocess.run(['keytool', '-exportcert', '-rfc', '-keystore', a.keystore, '-storepass', pw, '-alias', 'gangho'],
                         capture_output=True, text=True, check=True).stdout
    der = base64.b64decode(''.join(l for l in pem.splitlines() if l and not l.startswith('-----')))
    cert = hashlib.sha256(der).digest()
    salt = secrets.token_bytes(16)
    aead = AESGCM(hashlib.sha256(cert + salt).digest())
    enc = os.path.join(stage, 'enc', 'g')
    os.makedirs(enc)
    for dp, _, fs in os.walk(assets):
        for f in fs:
            rel = os.path.relpath(os.path.join(dp, f), assets).replace(os.sep, '/')
            nonce = secrets.token_bytes(12)
            raw = gzip.compress(open(os.path.join(dp, f), 'rb').read(), 9, mtime=0)   # 암호문은 안 줄어드니 먼저 줄인다
            open(os.path.join(enc, rel.replace('/', '_') + '.bin'), 'wb').write(nonce + aead.encrypt(nonce, raw, None))
    ik = issue_code.load_key(a.issue_key, create=True)
    lock = json.load(open(os.path.join(HERE, 'lock.json'))) if os.path.exists(os.path.join(HERE, 'lock.json')) else {}
    fill = {'@PUBKEY@': issue_code.pubkey_b64(ik), '@LISTURL@': lock.get('list_url', ''), '@CERTSHA@': cert.hex(), '@SALT@': base64.b64encode(salt).decode()}
    jsrc = os.path.join(stage, 'java')
    srcs = []
    for dp, _, fs in os.walk(os.path.join(HERE, 'src')):
        for f in fs:
            if f.endswith('.java'):
                t = open(os.path.join(dp, f), encoding='utf8').read()
                for k, v in fill.items():
                    t = t.replace(k, v)
                d = os.path.join(jsrc, os.path.relpath(dp, os.path.join(HERE, 'src')))
                os.makedirs(d, exist_ok=True)
                srcs.append(os.path.join(d, f))
                open(srcs[-1], 'w', encoding='utf8').write(t)
    print('잠금: 목록 주소', fill['@LISTURL@'] or '(없음: 초대 코드 기한만 검사)')

    # 4) 묶기 → 코드 → dex → 줄 맞춤 → 서명
    unsigned = os.path.join(stage, 'unsigned.apk')
    run(tool('aapt'), 'package', '-f', '-M', os.path.join(stage, 'AndroidManifest.xml'), '-S', res, '-A', os.path.join(stage, 'enc'), '-I', AJAR, '-F', unsigned)
    run('javac', '-g:none', '-source', '8', '-target', '8', '-encoding', 'UTF-8', '-Xlint:-options', '-bootclasspath', AJAR, '-d', cls, *srcs)
    dx = os.path.join(BT, 'd8')
    if os.path.exists(dx):
        run(dx, '--min-api', '24', '--lib', AJAR, '--output', stage, *[os.path.join(dp, f) for dp, _, fs in os.walk(cls) for f in fs])
    else:
        run(tool('dx'), '--dex', '--min-sdk-version=24', '--output=' + os.path.join(stage, 'classes.dex'), cls)
    with zipfile.ZipFile(unsigned, 'a') as z:
        z.write(os.path.join(stage, 'classes.dex'), 'classes.dex')
    aligned = os.path.join(stage, 'aligned.apk')
    run(tool('zipalign'), '-f', '-p', '4', unsigned, aligned)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    run(tool('apksigner'), 'sign', '--ks', a.keystore, '--ks-pass', 'pass:' + pw, '--v1-signing-enabled', 'true', '--v2-signing-enabled', 'true',
        '--out', a.out, aligned)
    run(tool('apksigner'), 'verify', '--print-certs', a.out)
    print(f'완성: {a.out} ({os.path.getsize(a.out) / 1e6:.1f} MB, {vname}, versionCode {vcode})')


if __name__ == '__main__':
    main()

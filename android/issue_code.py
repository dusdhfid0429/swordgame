"""시험판 초대 코드 발급과 온라인 목록 만들기. 비밀 키(--key)는 저장소 밖에 둔다.

  초대 코드:  python3 android/issue_code.py --key K code --name 홍길동 --until 2026-11-30 --device ABCD-EFGH
              (--device 대신 --any 면 아무 기기에서나 되는 코드. 퍼지면 막기 어려우니 되도록 기기 번호로)
  목록 만들기: python3 android/issue_code.py --key K list --out access.txt [--revoke 번호 ...] [--unrevoke 번호 ...] [--off "알림 글" | --on]

코드를 낼 때마다 키 옆 issued.csv 에 이름·기기·기한·코드 번호를 적는다. 코드를 끄려면 그 번호를 --revoke 로 넣고
나온 access.txt 를 목록 주소(android/lock.json 의 list_url)에 그대로 올린다. 목록도 같은 키로 서명되어 고칠 수 없다.
"""
import argparse, base64, csv, datetime, hashlib, json, os, re, sys, time

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec


def b64u(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode('ascii')


def load_key(path, create=False):
    if not os.path.exists(path):
        if not create:
            raise SystemExit(f'비밀 키 {path} 가 없습니다')
        k = ec.generate_private_key(ec.SECP256R1())
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        open(path, 'wb').write(k.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        os.chmod(path, 0o600)
    return serialization.load_pem_private_key(open(path, 'rb').read(), None)


def pubkey_b64(k):
    return base64.b64encode(k.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)).decode('ascii')


def sign(k, payload: bytes):
    return b64u(payload) + '.' + b64u(k.sign(payload, ec.ECDSA(hashes.SHA256())))


def code_id(code):
    return hashlib.sha256(re.sub(r'\s', '', code).encode()).hexdigest()[:16]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--key', required=True)
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('code')
    c.add_argument('--name', required=True)
    c.add_argument('--until', required=True, help='만료일 yyyy-mm-dd (그날 끝까지)')
    g = c.add_mutually_exclusive_group(required=True)
    g.add_argument('--device', help='잠금 화면의 기기 번호 XXXX-XXXX')
    g.add_argument('--any', action='store_true')
    l = sub.add_parser('list')
    l.add_argument('--out', required=True)
    l.add_argument('--revoke', nargs='*', default=[])
    l.add_argument('--unrevoke', nargs='*', default=[])
    l.add_argument('--off', metavar='알림글', help='시험판 전체를 닫는다')
    l.add_argument('--on', action='store_true', help='닫은 시험판을 다시 연다')
    a = ap.parse_args()
    k = load_key(a.key)
    home = os.path.dirname(os.path.abspath(a.key))

    if a.cmd == 'code':
        datetime.date.fromisoformat(a.until)
        dev = '*' if a.any else a.device.strip().upper()
        if dev != '*' and not re.fullmatch(r'[A-Z2-9]{4}-[A-Z2-9]{4}', dev):
            raise SystemExit('기기 번호는 XXXX-XXXX 모양입니다')
        if '|' in a.name:
            raise SystemExit('이름에 | 를 쓸 수 없습니다')
        code = sign(k, f'v1|{dev}|{a.until}|{a.name}'.encode())
        cid = code_id(code)
        led = os.path.join(home, 'issued.csv')
        new = not os.path.exists(led)
        with open(led, 'a', newline='', encoding='utf8') as f:
            w = csv.writer(f)
            if new:
                w.writerow(['발급일', '이름', '기기', '기한', '코드 번호'])
            w.writerow([datetime.date.today().isoformat(), a.name, dev, a.until, cid])
        print(code)
        print(f'코드 번호 {cid} ({a.name}, {dev}, {a.until}까지)', file=sys.stderr)
        return

    st_path = os.path.join(home, 'list_state.json')
    st = json.load(open(st_path)) if os.path.exists(st_path) else {'off': False, 'msg': '', 'revoked': []}
    rv = [x for x in st['revoked'] if x not in a.unrevoke] + [x for x in a.revoke if x not in st['revoked']]
    st['revoked'] = rv
    if a.off is not None:
        st['off'], st['msg'] = True, a.off
    if a.on:
        st['off'], st['msg'] = False, ''
    json.dump(st, open(st_path, 'w'), ensure_ascii=False, indent=1)
    body = json.dumps({'t': int(time.time() * 1000), **st}, ensure_ascii=False, separators=(',', ':'))
    open(a.out, 'w').write(sign(k, body.encode()) + '\n')
    print(f'{a.out}: 끈 코드 {len(rv)}개, 전체 {"닫힘" if st["off"] else "열림"}')


if __name__ == '__main__':
    main()

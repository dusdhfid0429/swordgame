"""TypeScript 검사기로 게임 JS를 검사한다 (코드는 JS 그대로, 2026-11-12).

build.py 의 PARTS 순서대로 src/ 조각을 한 파일로 이어 tsc --checkJs 로 본다.
지금 있는 오류는 tools/tsc_baseline.json 에 '기준선'으로 적어 두고, 기준선에 없는 새 오류만 실패로 센다.
오류 열쇠는 '파일|오류 번호|문구'라서 다른 줄을 고쳐 줄 번호가 밀려도 기준선이 깨지지 않는다.

  npm i --no-save typescript@5.6.3
  python3 tools/typecheck.py            # 새 오류가 있으면 exit 1
  python3 tools/typecheck.py --update   # 기준선을 지금 상태로 다시 쓴다 (오류를 고쳐 줄였을 때)
"""
import json, os, re, subprocess, sys, tempfile
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, 'tools', 'tsc_baseline.json')
PARTS = eval(re.search(r"PARTS = (\[.*?\])", open(os.path.join(ROOT, 'build.py'), encoding='utf8').read(), re.S).group(1))

def main():
    update = '--update' in sys.argv
    tmp = tempfile.mkdtemp(prefix='tsc_')
    starts, ln, chunks = [], 1, []
    for p in PARTS:
        t = open(os.path.join(ROOT, 'src', p), encoding='utf8').read()
        starts.append((ln, p)); chunks.append(t); ln += t.count('\n') + 1
    open(os.path.join(tmp, 'all.js'), 'w', encoding='utf8').write('\n'.join(chunks))
    json.dump({'compilerOptions': {'allowJs': True, 'checkJs': True, 'noEmit': True, 'target': 'es2022', 'lib': ['es2022', 'dom', 'dom.iterable'],
                                   'strict': False, 'skipLibCheck': True, 'types': []}, 'files': ['all.js']}, open(os.path.join(tmp, 'tsconfig.json'), 'w'))
    tsc = os.path.join(ROOT, 'node_modules', '.bin', 'tsc')
    cmd = [tsc] if os.path.exists(tsc) else ['npx', '--no-install', 'tsc']
    r = subprocess.run(cmd + ['-p', tmp, '--pretty', 'false'], capture_output=True, text=True, encoding='utf8')
    out = r.stdout + r.stderr
    errs = []
    for m in re.finditer(r'^(?:.*/)?all\.js\((\d+),(\d+)\): error (TS\d+): (.*)$', out, re.M):
        line = int(m.group(1)); f, s0 = next((p, s) for s, p in reversed(starts) if s <= line)
        errs.append((f, line - s0 + 1, m.group(3), m.group(4).strip()))
    if r.returncode not in (0, 2) or (r.returncode == 2 and not errs):
        print(out[-3000:]); raise SystemExit('tsc 실행 실패 (npm i --no-save typescript@5.6.3 를 했는지 확인)')
    now = Counter(f'{f}|{c}|{msg}' for f, _, c, msg in errs)
    if update:
        json.dump(dict(sorted(now.items())), open(BASE, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
        print(f'기준선을 다시 썼습니다: 오류 {sum(now.values())}건'); return
    base = Counter(json.load(open(BASE, encoding='utf8'))) if os.path.exists(BASE) else Counter()
    new = now - base
    gone = base - now
    if new:
        print(f'새 타입 오류 {sum(new.values())}건 (기준선 {sum(base.values())}건에 없던 것):')
        left = Counter(new)
        for f, l, c, msg in errs:
            k = f'{f}|{c}|{msg}'
            if left[k] > 0:
                left[k] -= 1; print(f'  src/{f}:{l}  {c}  {msg}')
        print('정말 괜찮은 것이면 고치는 대신 python3 tools/typecheck.py --update 로 기준선에 넣으세요.')
        raise SystemExit(1)
    msg = f'타입 검사 통과: 오류 {sum(now.values())}건, 모두 기준선 안'
    if gone:
        msg += f' (기준선보다 {sum(gone.values())}건 줄었습니다. --update 로 기준선을 줄여 두세요)'
    print(msg)

if __name__ == '__main__':
    main()

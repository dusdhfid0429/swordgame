"""src/ 의 조각들과 data/*.json 을 묶어 dist/gangho.html 한 파일로 만든다.
데이터 업데이트용으로 dist/gamedata.json(묶은 데이터)과 dist/gamedata-version.json(schema·rev)도 만든다."""
import os, json
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
PARTS = ['g_gamedata.js', 'r_sheet.js', 'g_store.js', 'r_noise.js', 'r_proto_arts.js', 'g_data.js', 'g_sect.js', 'g_giyeon.js', 'g_core.js', 'g_world.js', 'g_elev.js', 'r_props.js',
         'r_exec.js', 'g_life.js', 'g_ui.js', 'g_qstar.js', 'g_quest.js', 'g_story.js', 'g_pop.js', 'r_draw1.js', 'r_atlas.js', 'r_atlas2.js', 'r_fighter.js', 'r_anim.js',
         'r_build.js', 'r_furn.js', 'r_fx.js', 'r_elfx.js', 'g_screens.js', 'g_touch.js', 'g_train.js', 'g_realm.js', 'g_create.js', 'g_realmfx.js', 'g_blade.js', 'g_body.js', 'g_beyond.js', 'g_save.js', 'g_tomb.js', 'g_region.js', 'g_garb.js', 'g_passive.js', 'g_simbeop.js', 'g_fxcol.js', 'g_faction.js', 'g_landmark.js', 'g_province.js', 'g_height.js', 'g_stage.js', 'g_magyo.js', 'g_mara.js', 'g_magyo2.js', 'g_magyo3.js', 'g_lmmap.js', 'g_split.js', 'g_cliff.js', 'g_hall.js', 'g_city.js', 'g_gunbu.js', 'g_maeng.js', 'g_academy.js', 'g_bobeop.js', 'g_gyeong.js', 'g_balance.js', 'g_diff.js', 'g_loot.js', 'g_amgi.js', 'g_caravan.js', 'g_ranktest.js', 'g_story2.js', 'g_story3.js', 'g_story4.js', 'g_story5.js', 'g_ruin.js', 'g_vault.js', 'g_guard.js', 'g_mobil.js', 'g_rep.js', 'g_audio.js', 'g_terrain.js', 'g_season.js', 'g_cave.js', 'g_gyc.js', 'g_intel.js', 'g_mkmat.js', 'g_remnant.js', 'g_tower.js', 'g_danger.js', 'g_crash.js', 'g_power.js', 'g_draw.js']
rd = lambda p: open(os.path.join(SRC, p), encoding='utf8').read()
js = '\n'.join(rd(p) for p in PARTS)
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)

# data/*.json: 표 이름이 겹치면 멈춘다. meta.json 은 _meta 로 들어간다
DATA = os.path.join(ROOT, 'data')
gd = {'_meta': json.load(open(os.path.join(DATA, 'meta.json'), encoding='utf8'))}
for f in sorted(os.listdir(DATA)):
    if not f.endswith('.json') or f == 'meta.json':
        continue
    for k, v in json.load(open(os.path.join(DATA, f), encoding='utf8')).items():
        if k in gd:
            raise SystemExit(f'data/{f}: {k} 가 다른 데이터 파일에도 있습니다')
        gd[k] = v
packed = json.dumps(gd, ensure_ascii=False, separators=(',', ':'))
open(os.path.join(ROOT, 'dist', 'gamedata.json'), 'w', encoding='utf8').write(packed)
open(os.path.join(ROOT, 'dist', 'gamedata-version.json'), 'w', encoding='utf8').write(json.dumps({'schema': gd['_meta']['schema'], 'rev': gd['_meta']['rev']}))

# assets/<이름>/<이름>.atlas.json + .clips.json + .png → 시트 묶음 (v123, 핸드오프 포맷). 이미지는 base64로 넣는다
import base64
ASSETS = os.path.join(ROOT, 'assets')
sheets = {}
SKIP_SHEETS = {'wuxia'}   # v166: assets/act가 대신 그린다. wuxia는 act 소켓의 원본(tools/actsheet.py)으로만 남긴다
if os.path.isdir(ASSETS):
    for name in sorted(os.listdir(ASSETS)):
        d = os.path.join(ASSETS, name)
        if name in SKIP_SHEETS:
            continue
        aj = os.path.join(d, name + '.atlas.json')
        if not os.path.isfile(aj):
            continue
        atlas = json.load(open(aj, encoding='utf8'))
        clips = json.load(open(os.path.join(d, name + '.clips.json'), encoding='utf8'))['clips']
        png = base64.b64encode(open(os.path.join(d, name + '.png'), 'rb').read()).decode('ascii')
        frames = [None] * len(atlas['frames'])
        for fn, f in atlas['frames'].items():
            r, o, ss, pv = f['rect'], f['offset'], f['sourceSize'], f['pivot']
            frames[f['index']] = {'r': [r['x'], r['y'], r['w'], r['h']], 'o': [o['x'], o['y']], 's': [ss['w'], ss['h']], 'pv': [pv['x'], pv['y']],
                                  'sk': {k['name']: [k['x'], k['y']] for k in f.get('sockets', [])}}
            if 'charRect' in f:
                c = f['charRect']; frames[f['index']]['cb'] = [c['x'], c['y'], c['w'], c['h']]
        assert all(frames), f'assets/{name}: index 가 비었습니다'
        sheets[name] = {'img': 'data:image/png;base64,' + png, 'frames': frames,
                        'clips': {k: {'f': v['frames'], 'fps': v.get('fps', 10), 'loop': v.get('loop', False)} for k, v in clips.items()}}
sheets_js = json.dumps(sheets, ensure_ascii=False, separators=(',', ':'))

head = rd('g_head.html')
assert head.rstrip().endswith('<script>')
head = head.rstrip()[:-len('<script>')]
html = (head + '<script id="gamedata" type="application/json">' + packed.replace('</', '<\\/') + '</script>\n'
        + '<script id="sheets" type="application/json">' + sheets_js.replace('</', '<\\/') + '</script>\n<script>\n'
        + js + '\n</script>\n</body></html>\n')
open(os.path.join(ROOT, 'dist', 'gangho.html'), 'w', encoding='utf8').write(html)

# 이펙트 뷰어 (2026-10-21): 같은 게임 코드에 src/fxview.js 를 붙이고 무관 없이 시작한다
ACAD = 'const ACAD_OFF=/[?&#]noacad/.test(location.href);'
assert html.count(ACAD) == 1, 'g_academy.js 의 ACAD_OFF 줄이 바뀌었습니다 (fxview 빌드)'
tail = '\n</script>\n</body></html>\n'
assert html.endswith(tail)
# 실시간 수정 (2026-10-22): 뷰어 안에서 Claude가 게임 함수를 바꿔 끼울 수 있게, 맨 앞 칸의 const 함수만 var 로 연다 (줄 수·동작은 그대로)
import re
fv_js = re.sub(r'^const ([A-Za-z_$][\w$]*)=(?=\(|async\b|function\b|[A-Za-z_$][\w$]*=>)', r'var \1=', js, flags=re.M)
assert html.count(js) == 1
fv = html.replace(js, fv_js).replace(ACAD, 'const ACAD_OFF=true;').replace('<title>', '<title>이펙트 뷰어 · ', 1)
# 조각 파일마다 시작 줄 (스크립트 본문 기준, 맨 앞 빈 줄 다음이 1줄)과 데이터 표 → 파일 이름. Claude가 고친 곳을 저장소 파일로 되짚는다
starts, ln = [], 2
for p_ in PARTS:
    starts.append([p_, ln]); ln += rd(p_).count('\n') + 1
dfiles = {k: f for f in sorted(os.listdir(DATA)) if f.endswith('.json') and f != 'meta.json' for k in json.load(open(os.path.join(DATA, f), encoding='utf8'))}
fv = (fv[:-len(tail)] + '\nconst FXV_FILES=' + json.dumps(starts) + ',FXV_DATA=' + json.dumps(dfiles, ensure_ascii=False) + ';\n'
      + rd('fxview.js') + '\n' + rd('fxview_ai.js') + tail)
open(os.path.join(ROOT, 'dist', 'fxview.html'), 'w', encoding='utf8').write(fv)
print('dist/gangho.html', len(html), 'chars ·', len(gd) - 1, 'data tables, data rev', gd['_meta']['rev'], '· sheets', ', '.join(f'{k} {len(v["frames"])}장' for k, v in sheets.items()))

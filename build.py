"""src/ 의 조각들과 data/*.json 을 묶어 dist/gangho.html 한 파일로 만든다.
데이터 업데이트용으로 dist/gamedata.json(묶은 데이터)과 dist/gamedata-version.json(schema·rev)도 만든다."""
import os, json
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
PARTS = ['g_gamedata.js', 'g_store.js', 'r_noise.js', 'r_proto_arts.js', 'g_data.js', 'g_sect.js', 'g_giyeon.js', 'g_core.js', 'g_world.js', 'r_props.js',
         'r_exec.js', 'g_life.js', 'g_ui.js', 'r_draw1.js', 'r_atlas.js', 'r_fighter.js',
<<<<<<< HEAD
         'r_build.js', 'r_fx.js', 'g_screens.js', 'g_touch.js', 'g_train.js', 'g_realm.js', 'g_realmfx.js', 'g_save.js', 'g_tomb.js', 'g_region.js', 'g_garb.js', 'g_passive.js', 'g_faction.js', 'g_landmark.js', 'g_province.js', 'g_toss.js', 'g_height.js', 'g_stage.js', 'g_magyo.js', 'g_lmmap.js', 'g_split.js', 'g_hall.js', 'g_city.js', 'g_bobeop.js', 'g_balance.js', 'g_audio.js', 'g_draw.js']
=======
         'r_build.js', 'r_furn.js', 'r_fx.js', 'g_screens.js', 'g_touch.js', 'g_train.js', 'g_realm.js', 'g_realmfx.js', 'g_save.js', 'g_tomb.js', 'g_region.js', 'g_garb.js', 'g_passive.js', 'g_faction.js', 'g_landmark.js', 'g_province.js', 'g_height.js', 'g_stage.js', 'g_magyo.js', 'g_lmmap.js', 'g_split.js', 'g_hall.js', 'g_city.js', 'g_bobeop.js', 'g_balance.js', 'g_audio.js', 'g_draw.js']
>>>>>>> main
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

head = rd('g_head.html')
assert head.rstrip().endswith('<script>')
head = head.rstrip()[:-len('<script>')]
html = (head + '<script id="gamedata" type="application/json">' + packed.replace('</', '<\\/') + '</script>\n<script>\n'
        + js + '\n</script>\n</body></html>\n')
open(os.path.join(ROOT, 'dist', 'gangho.html'), 'w', encoding='utf8').write(html)
print('dist/gangho.html', len(html), 'chars ·', len(gd) - 1, 'data tables, data rev', gd['_meta']['rev'])

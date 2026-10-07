"""src/ 의 조각들을 이어 붙여 dist/gangho.html 한 파일로 만든다."""
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
PARTS = ['r_noise.js', 'r_proto_arts.js', 'g_data.js', 'g_core.js', 'g_world.js', 'r_props.js',
         'r_exec.js', 'g_life.js', 'g_ui.js', 'r_draw1.js', 'r_atlas.js', 'r_fighter.js',
         'r_build.js', 'r_fx.js', 'g_screens.js', 'g_touch.js', 'g_toss.js', 'g_draw.js']
rd = lambda p: open(os.path.join(SRC, p), encoding='utf8').read()
js = '\n'.join(rd(p) for p in PARTS)
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
html = rd('g_head.html') + js + '\n</script>\n</body></html>\n'
open(os.path.join(ROOT, 'dist', 'gangho.html'), 'w', encoding='utf8').write(html)
print('dist/gangho.html', len(html), 'chars')

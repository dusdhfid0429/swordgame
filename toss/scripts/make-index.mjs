// ../dist/gangho.html 에 SDK 다리(bridge.js)를 끼워 toss/index.html 을 만든다. vite 가 이걸 묶는다.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync(new URL('../../dist/gangho.html', import.meta.url), 'utf8');
const out = html.replace('</head>', '<script type="module" src="./bridge.js"></script>\n</head>');
if (out === html) throw new Error('</head> not found in dist/gangho.html');
writeFileSync(new URL('../index.html', import.meta.url), out);
console.log('toss/index.html', out.length, 'chars');

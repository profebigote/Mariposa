#!/usr/bin/env python3
"""Construit un fichier HTML autonome (aperçu / Artifact) : CSS, JS et modules inclus.
Usage : python3 tools/build_single.py sortie.html"""
import re, sys, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(ROOT, p), encoding='utf-8').read()
idx = rd('index.html')
scripts = re.findall(r'<script src="([^"]+)"></script>', idx)
css = rd('css/style.css') + '\n' + rd('css/mariposa.css')
man = json.loads(rd('modules/manifest.json'))
bundle = [json.loads(rd('modules/' + f)) for f in man['modules']]
body = re.search(r'<body>(.*?)<!-- noyau -->', idx, re.S).group(1)
font = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)">', idx).group(1)
js = 'window.ESP = window.ESP || {}; window.ESP.BUNDLE = ' + json.dumps(bundle, ensure_ascii=False).replace('</', '<\\/') + ';\n'
for s in scripts:
    code = rd(s)
    assert '</script' not in code.lower(), s
    js += '\n/* ===== ' + s + ' ===== */\n' + code
out = '<title>Proyecto Mariposa</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="stylesheet" href="%s">\n<style>\n%s\n</style>\n%s\n<script>\n%s\n</script>\n' % (font, css, body.strip(), js)
open(sys.argv[1], 'w', encoding='utf-8').write(out)
print('ok', len(out) // 1024, 'Ko')

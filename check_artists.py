with open('data/songsData.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
m = re.search(r'const POPULAR_ARTISTS = \[(.*?)\];', content, re.DOTALL)
if m:
    print(m.group(0)[:1200])

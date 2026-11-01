with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'youtubeSearchSection' in l or 'searchResultsSection' in l or 'youtubeResultsGrid' in l:
        print(f'{i+1}: {l.strip()[:100]}')

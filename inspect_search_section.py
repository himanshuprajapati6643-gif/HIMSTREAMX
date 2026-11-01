with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'id="searchResultsSection"' in l:
        print("".join(lines[i:min(len(lines), i+40)]))
        break

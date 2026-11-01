import asyncio
import sys
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

async def audit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        console_logs = []
        page.on('console', lambda m: console_logs.append(f"[{m.type}] {m.text}"))
        failed_requests = []
        page.on('requestfailed', lambda r: failed_requests.append(f"{r.url}: {r.failure}"))
        page.on('response', lambda res: failed_requests.append(f"HTTP {res.status} {res.url}") if res.status >= 400 else None)

        print("Opening http://127.0.0.1:8000/ ...")
        await page.goto("http://127.0.0.1:8000/", wait_until="networkidle")
        await page.wait_for_timeout(4000)

        # 1. Check all images in DOM
        img_report = await page.evaluate('''() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const broken = [];
            const ok = [];
            imgs.forEach(img => {
                const info = {
                    src: img.src,
                    alt: img.alt || '',
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    id: img.id,
                    className: img.className
                };
                if (img.complete && img.naturalWidth === 0) {
                    broken.push(info);
                } else {
                    ok.push(info);
                }
            });
            return { total: imgs.length, broken, okCount: ok.length };
        }''')
        print(f"\n1. Image Audit: Total={img_report['total']}, Loaded OK={img_report['okCount']}, Broken={len(img_report['broken'])}")
        for b in img_report['broken']:
            print(f"   BROKEN: src={b['src'][:80]} alt={b['alt']}")

        # 2. Check all Section IDs matching nav links
        nav_report = await page.evaluate('''() => {
            const links = Array.from(document.querySelectorAll('header nav a, .nav-links a'));
            return links.map(a => {
                const href = a.getAttribute('href');
                let targetExists = false;
                if (href && href.startsWith('#')) {
                    const el = document.querySelector(href);
                    targetExists = !!el;
                }
                return {
                    text: a.innerText.trim(),
                    href: href,
                    targetExists: targetExists
                };
            });
        }''')
        print(f"\n2. Nav Links Audit ({len(nav_report)} links):")
        for n in nav_report:
            print(f"   [{n['text']}] -> {n['href']} (Target Exists: {n['targetExists']})")

        # 3. Check Modals
        modals_report = await page.evaluate('''() => {
            const modalIds = [
                'movieDetailsModal', 'movieModal', 'youtubePlayerModal', 'authModal',
                'subscriptionModal', 'directorProfileModal', 'youtubeKeyModal', 'adminModal'
            ];
            return modalIds.map(id => ({ id, exists: !!document.getElementById(id) }));
        }''')
        print(f"\n3. Modals in DOM:")
        for m in modals_report:
            print(f"   Modal #{m['id']}: {'EXISTS' if m['exists'] else 'NOT FOUND'}")

        # 4. Check Console errors
        errors = [c for c in console_logs if '[error]' in c]
        print(f"\n4. Console Errors ({len(errors)}):")
        for e in errors:
            print(f"   {e}")

        # 5. Check Failed Requests
        print(f"\n5. Network Failures/404s ({len(failed_requests)}):")
        for f in failed_requests:
            print(f"   {f}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit())

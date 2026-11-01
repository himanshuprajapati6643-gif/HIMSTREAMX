import sys
import asyncio
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

async def run_audit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        console_errors = []
        console_warnings = []
        network_errors = []

        page.on('console', lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ['error'] else console_warnings.append(f"[{msg.type}] {msg.text}") if msg.type in ['warning'] else None)
        page.on('requestfailed', lambda req: network_errors.append(f"FAILED: {req.method} {req.url} - {req.failure}"))
        page.on('response', lambda res: network_errors.append(f"HTTP {res.status}: {res.request.method} {res.url}") if res.status >= 400 else None)

        print("Navigating to http://127.0.0.1:8000/ ...")
        await page.goto("http://127.0.0.1:8000/", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Check broken images on initial load
        broken_images = await page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => ({
                src: img.src,
                alt: img.alt,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete,
                visible: img.offsetWidth > 0 && img.offsetHeight > 0,
                id: img.id,
                className: img.className
            })).filter(info => info.complete && info.naturalWidth === 0);
        }""")

        total_images = await page.evaluate("""() => document.querySelectorAll('img').length""")

        print(f"\n--- AUDIT RESULTS ON INITIAL LOAD ---")
        print(f"Total images found: {total_images}")
        print(f"Broken images count: {len(broken_images)}")
        for b in broken_images:
            print(f"  Broken Image: src={b['src']}, alt={b['alt']}, class={b['className']}")

        print(f"\nConsole Errors ({len(console_errors)}):")
        for err in console_errors:
            print(f"  {err}")

        print(f"\nConsole Warnings ({len(console_warnings)}):")
        for w in console_warnings[:10]:
            print(f"  {w}")

        print(f"\nNetwork Errors ({len(network_errors)}):")
        for ne in network_errors:
            print(f"  {ne}")

        # Check Movies cards
        movie_cards_count = await page.evaluate("""() => document.querySelectorAll('.movie-card, .trending-card, .popular-card').length""")
        print(f"\nMovie/OTT cards in DOM: {movie_cards_count}")

        # Check Music cards
        music_cards_count = await page.evaluate("""() => document.querySelectorAll('.yt-media-card').length""")
        print(f"Music cards in DOM: {music_cards_count}")

        # Test clicking first Movie Card if any
        if movie_cards_count > 0:
            print("\nTesting click on first Movie card...")
            try:
                first_movie = page.locator('.movie-card, .trending-card').first
                await first_movie.click()
                await page.wait_for_timeout(1000)
                modal_visible = await page.evaluate("""() => {
                    const m = document.getElementById('movieDetailsModal') || document.getElementById('movieModal') || document.querySelector('.modal.show');
                    return m ? window.getComputedStyle(m).display !== 'none' : false;
                }""")
                print(f"Movie modal visible after click: {modal_visible}")
            except Exception as e:
                print(f"Error clicking movie card: {e}")

        # Test Music Player
        if music_cards_count > 0:
            print("\nTesting click on first Music card Play button...")
            try:
                play_btn = page.locator('.yt-media-card .play-btn, .yt-media-card button.play-button, .yt-media-card .yt-card-play-btn').first
                if await play_btn.count() > 0:
                    await play_btn.click()
                else:
                    await page.locator('.yt-media-card').first.click()
                await page.wait_for_timeout(2000)
                yt_modal_visible = await page.evaluate("""() => {
                    const m = document.getElementById('youtubePlayerModal');
                    return m ? window.getComputedStyle(m).display !== 'none' : false;
                }""")
                print(f"YouTube player modal visible: {yt_modal_visible}")
                iframe_src = await page.evaluate("""() => {
                    const ifr = document.querySelector('#youtubePlayerModal iframe, #ytIframeContainer iframe');
                    return ifr ? ifr.src : null;
                }""")
                print(f"Player iframe src: {iframe_src}")
            except Exception as e:
                print(f"Error testing music player: {e}")

        # Check Header Buttons & Modals
        print("\nChecking header and navigation elements...")
        header_elements = await page.evaluate("""() => {
            return {
                logo: !!document.querySelector('.logo, #logo'),
                searchWrapper: !!document.getElementById('searchWrapper'),
                searchInput: !!document.getElementById('searchInput'),
                authBtn: !!(document.getElementById('authBtn') || document.getElementById('loginBtn') || document.querySelector('.login-btn, .profile-btn')),
                navLinks: Array.from(document.querySelectorAll('header nav a, .nav-links a')).map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }))
            };
        }""")
        print(f"Header elements: {header_elements}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run_audit())

import asyncio
import sys
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

async def test_all_interactions():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        console_errors = []
        page.on('console', lambda m: console_errors.append(f"[{m.type}] {m.text}") if m.type == 'error' else None)

        print("1. Loading http://127.0.0.1:8000/ ...")
        await page.goto("http://127.0.0.1:8000/", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Interaction 1: Hero Carousel Next/Prev
        print("\n2. Testing Hero Carousel...")
        hero_next = page.locator('#heroNextBtn')
        if await hero_next.count() > 0:
            await hero_next.click()
            await page.wait_for_timeout(500)
            active_slide = await page.evaluate("() => document.querySelector('.hero-slide.active h1')?.innerText")
            print(f"   Active hero slide after Next: {active_slide}")

        # Interaction 2: Movie details modal
        print("\n3. Testing Movie Details Modal...")
        first_movie = page.locator('.movie-card').first
        if await first_movie.count() > 0:
            await first_movie.click()
            await page.wait_for_timeout(1000)
            modal_open = await page.evaluate("() => document.getElementById('movieModal')?.classList.contains('open') || window.getComputedStyle(document.getElementById('movieModal')).display !== 'none'")
            modal_title = await page.evaluate("() => document.getElementById('modalTitle')?.innerText")
            print(f"   Movie modal open: {modal_open}, Title: {modal_title}")

            # Close movie modal
            await page.evaluate("() => document.getElementById('closeModal')?.click()")
            await page.wait_for_timeout(500)
            print("   Closed movie modal successfully.")

        # Interaction 3: Category Switching
        print("\n4. Testing Category Switching...")
        test_cats = ['Bhojpuri', 'Hindi', 'Punjabi', 'DJ Remix']
        for cat in test_cats:
            pill = page.locator(f"#musicCategoryPillsBar button[data-category='{cat}']")
            if await pill.count() > 0:
                await pill.click()
                await page.wait_for_timeout(1500)
                cards_count = await page.evaluate("() => document.querySelectorAll('#musicLibraryGrid .yt-media-card').length")
                first_card_title = await page.evaluate("() => document.querySelector('#musicLibraryGrid .yt-media-card .yt-card-title')?.innerText")
                print(f"   Category [{cat}]: {cards_count} cards loaded. First: {first_card_title}")

        # Interaction 4: YouTube Playback
        print("\n5. Testing YouTube Playback from card...")
        first_card = page.locator("#musicLibraryGrid .yt-media-card").first
        if await first_card.count() > 0:
            play_btn = first_card.locator(".play-btn, button, .yt-card-play-btn").first
            if await play_btn.count() > 0:
                await play_btn.click()
            else:
                await first_card.click()
            await page.wait_for_timeout(2500)
            yt_modal_open = await page.evaluate("() => document.getElementById('youtubePlayerModal')?.classList.contains('open') || window.getComputedStyle(document.getElementById('youtubePlayerModal')).display !== 'none'")
            yt_title = await page.evaluate("() => document.getElementById('youtubeModalTitle')?.innerText")
            iframe_src = await page.evaluate("() => document.querySelector('#youtubePlayerModal iframe, #ytIframeContainer iframe')?.src")
            print(f"   YouTube Player Modal Open: {yt_modal_open}, Title: {yt_title}")
            print(f"   IFrame src: {iframe_src}")

            # Close YouTube Modal via direct click or evaluate
            await page.evaluate("() => document.getElementById('closeYouTubePlayerBtn')?.click()")
            await page.wait_for_timeout(1000)
            is_closed = await page.evaluate("() => !document.getElementById('youtubePlayerModal')?.classList.contains('open')")
            print(f"   Closed YouTube player modal: {is_closed}")

        # Interaction 5: Universal Search Bar
        print("\n6. Testing Universal Header Search...")
        # Activate search
        await page.evaluate("() => document.getElementById('searchWrapper')?.classList.add('active')")
        
        search_input = page.locator("#searchInput")
        await search_input.fill("Arijit Singh")
        await search_input.press("Enter")
        await page.wait_for_timeout(2500)

        search_results_visible = await page.evaluate("() => window.getComputedStyle(document.getElementById('youtubeSearchResultsSection')).display !== 'none'")
        search_cards_count = await page.evaluate("() => document.querySelectorAll('#youtubeResultsGrid .yt-media-card').length")
        first_search_title = await page.evaluate("() => document.querySelector('#youtubeResultsGrid .yt-media-card .yt-card-title')?.innerText")
        print(f"   Search Results Section Visible: {search_results_visible}, Results Count: {search_cards_count}, First: {first_search_title}")

        # Clear search
        await page.evaluate("() => document.getElementById('clearSearchBtn')?.click()")
        await page.wait_for_timeout(1000)
        print("   Search cleared.")

        # Interaction 6: VIP Pass Modal
        print("\n7. Testing VIP Pass Modal...")
        await page.evaluate("() => typeof openSubscriptionModal === 'function' && openSubscriptionModal()")
        await page.wait_for_timeout(1000)
        sub_open = await page.evaluate("() => document.getElementById('subscriptionModal')?.classList.contains('open') || window.getComputedStyle(document.getElementById('subscriptionModal')).display !== 'none'")
        print(f"   Subscription modal open: {sub_open}")
        await page.evaluate("() => typeof closeSubscriptionModal === 'function' && closeSubscriptionModal()")
        await page.wait_for_timeout(500)

        # Interaction 7: Admin Dashboard Modal Auth Flow
        print("\n8. Testing Admin Dashboard Modal Auth Flow...")
        await page.evaluate("() => typeof openAdminDashboard === 'function' && openAdminDashboard()")
        await page.wait_for_timeout(1000)
        auth_open = await page.evaluate("() => document.getElementById('authModal')?.classList.contains('open') || window.getComputedStyle(document.getElementById('authModal')).display !== 'none'")
        print(f"   Admin auth modal open: {auth_open}")
        await page.evaluate("() => typeof closeAuthModal === 'function' && closeAuthModal()")
        await page.wait_for_timeout(500)

        # Interaction 8: Nav Link Anchors
        print("\n9. Testing Navigation Links...")
        nav_anchors = await page.evaluate('''() => {
            return {
                music: !!document.getElementById('music'),
                bhojpuri: !!document.getElementById('bhojpuri'),
                hindi: !!document.getElementById('hindi'),
                punjabi: !!document.getElementById('punjabi'),
                haryanvi: !!document.getElementById('haryanvi'),
                english: !!document.getElementById('english'),
                discovery: !!document.getElementById('discovery')
            };
        }''')
        print(f"   Anchors present: {nav_anchors}")

        print(f"\n10. Total Console Errors during all interactions: {len(console_errors)}")
        for err in console_errors:
            print(f"    {err}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_all_interactions())

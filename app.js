// ==========================================================================
// HIMSTREAMX - MAIN APPLICATION CONTROLLER & ROUTER
// Developed by Himanshu Prajapati (2026)
// Seamless Single-Page OTT + Music Hub
// ==========================================================================

let currentViewMode = "home"; // 'home', 'movies', 'series', 'music', 'bhojpuri', 'hindi', 'punjabi', 'haryanvi', 'english', 'mylist'

function initAppNavigation() {
    const navLinks = document.querySelectorAll(".nav-link, .drawer-link, .dock-item");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) return;

            const target = href.substring(1);
            handleViewChange(target);
        });
    });

    // Handle initial hash on page load
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.replace("#", "") || "home";
        handleViewChange(hash);
    });

    // Language dropdown or quick buttons
    const langSelect = document.getElementById("languageSelect");
    if (langSelect) {
        langSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            showToast(`🌐 Language set to ${val === 'hi' ? 'हिन्दी (Hindi)' : 'English'}`);
        });
    }
}

function handleViewChange(viewName) {
    currentViewMode = viewName;

    // Update active state in navs
    document.querySelectorAll(".nav-link, .drawer-link, .dock-item").forEach(link => {
        const href = link.getAttribute("href");
        if (href === `#${viewName}`) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    const homeHero = document.getElementById("home");
    const genreBar = document.querySelector(".genre-bar-section");
    const continueWatchingSec = document.getElementById("continueWatchingSection");
    const continueListeningSec = document.getElementById("continueListeningSection");
    const top10Sec = document.getElementById("top10");
    const moviesSec = document.getElementById("movies");
    const latestMoviesSec = document.getElementById("latestMoviesSection");
    const trendingSec = document.getElementById("trending");
    const seriesSec = document.getElementById("series");
    const scifiSec = document.getElementById("scifi");
    const topRatedSec = document.getElementById("topRatedSection");
    const watchlistSec = document.getElementById("mylist");
    const musicSec = document.getElementById("musicSection");
    const trendingSongsSec = document.getElementById("trendingSongsSection");
    const recentlyAddedSongsSec = document.getElementById("recentlyAddedSongsSection");
    const recommendedSongsSec = document.getElementById("recommendedSongsSection");
    const popularArtistsSec = document.getElementById("popularArtistsSection");
    const musicGenresSec = document.getElementById("musicGenresSection");
    const searchResultsSec = document.getElementById("searchResultsSection");

    const becauseWatchedSec = document.getElementById("becauseYouWatchedSection");
    const becauseListenedSec = document.getElementById("becauseYouListenedSection");
    const discoverySec = document.getElementById("discoverySection");

    // Close mobile drawer if open
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");
    if (mobileDrawer) mobileDrawer.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("active");
    document.body.style.overflow = "";

    // If search was showing, hide it unless user navigated to it
    if (searchResultsSec && viewName !== "search") {
        searchResultsSec.style.display = "none";
    }

    if (discoverySec && viewName !== "discovery") {
        discoverySec.style.display = "none";
    }

    if (viewName === "home") {
        // Reset search view to clean home state if active
        if (typeof clearYouTubeSearchAndShowHome === "function") {
            clearYouTubeSearchAndShowHome();
        }
        // Show everything in balanced home overview
        if (homeHero) homeHero.style.display = "block";
        if (genreBar) genreBar.style.display = "block";
        if (continueListeningSec) continueListeningSec.style.display = "block";
        if (continueWatchingSec) continueWatchingSec.style.display = "block";
        if (top10Sec) top10Sec.style.display = "block";
        if (trendingSec) trendingSec.style.display = "block";
        if (becauseWatchedSec) becauseWatchedSec.style.display = "block";
        if (trendingSongsSec) trendingSongsSec.style.display = "block";
        if (moviesSec) moviesSec.style.display = "block";
        if (latestMoviesSec) latestMoviesSec.style.display = "block";
        if (seriesSec) seriesSec.style.display = "block";
        if (recentlyAddedSongsSec) recentlyAddedSongsSec.style.display = "block";
        if (popularArtistsSec) popularArtistsSec.style.display = "block";
        if (musicGenresSec) musicGenresSec.style.display = "block";
        if (recommendedSongsSec) recommendedSongsSec.style.display = "block";
        if (becauseListenedSec) becauseListenedSec.style.display = "block";
        if (musicSec) musicSec.style.display = "block";
        if (scifiSec) scifiSec.style.display = "block";
        if (topRatedSec) topRatedSec.style.display = "block";
        if (watchlistSec) watchlistSec.style.display = "block";
        if (discoverySec) discoverySec.style.display = "none";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (viewName === "discovery") {
        // Discovery Experience Hub
        if (homeHero) homeHero.style.display = "none";
        if (genreBar) genreBar.style.display = "none";
        if (continueWatchingSec) continueWatchingSec.style.display = "none";
        if (continueListeningSec) continueListeningSec.style.display = "none";
        if (top10Sec) top10Sec.style.display = "none";
        if (trendingSec) trendingSec.style.display = "none";
        if (becauseWatchedSec) becauseWatchedSec.style.display = "none";
        if (moviesSec) moviesSec.style.display = "none";
        if (latestMoviesSec) latestMoviesSec.style.display = "none";
        if (seriesSec) seriesSec.style.display = "none";
        if (trendingSongsSec) trendingSongsSec.style.display = "none";
        if (recentlyAddedSongsSec) recentlyAddedSongsSec.style.display = "none";
        if (recommendedSongsSec) recommendedSongsSec.style.display = "none";
        if (becauseListenedSec) becauseListenedSec.style.display = "none";
        if (popularArtistsSec) popularArtistsSec.style.display = "none";
        if (musicGenresSec) musicGenresSec.style.display = "none";
        if (musicSec) musicSec.style.display = "none";
        if (scifiSec) scifiSec.style.display = "none";
        if (topRatedSec) topRatedSec.style.display = "none";
        if (watchlistSec) watchlistSec.style.display = "none";

        if (discoverySec) {
            discoverySec.style.display = "block";
            if (typeof initDiscoveryEngine === "function") initDiscoveryEngine();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    } else if (viewName === "movies") {
        // Focus on movies
        if (homeHero) homeHero.style.display = "block";
        if (genreBar) genreBar.style.display = "block";
        if (continueWatchingSec) continueWatchingSec.style.display = "block";
        if (continueListeningSec) continueListeningSec.style.display = "none";
        if (top10Sec) top10Sec.style.display = "block";
        if (trendingSec) trendingSec.style.display = "block";
        if (moviesSec) moviesSec.style.display = "block";
        if (latestMoviesSec) latestMoviesSec.style.display = "block";
        if (seriesSec) seriesSec.style.display = "none";
        if (trendingSongsSec) trendingSongsSec.style.display = "none";
        if (recentlyAddedSongsSec) recentlyAddedSongsSec.style.display = "none";
        if (recommendedSongsSec) recommendedSongsSec.style.display = "none";
        if (popularArtistsSec) popularArtistsSec.style.display = "none";
        if (musicGenresSec) musicGenresSec.style.display = "none";
        if (musicSec) musicSec.style.display = "none";
        if (scifiSec) scifiSec.style.display = "block";
        if (topRatedSec) topRatedSec.style.display = "block";
        if (watchlistSec) watchlistSec.style.display = "none";

        if (moviesSec) moviesSec.scrollIntoView({ behavior: "smooth" });
    } else if (viewName === "series") {
        // Focus on Web Series
        if (homeHero) homeHero.style.display = "block";
        if (genreBar) genreBar.style.display = "block";
        if (continueWatchingSec) continueWatchingSec.style.display = "block";
        if (continueListeningSec) continueListeningSec.style.display = "none";
        if (top10Sec) top10Sec.style.display = "none";
        if (trendingSec) trendingSec.style.display = "none";
        if (moviesSec) moviesSec.style.display = "none";
        if (latestMoviesSec) latestMoviesSec.style.display = "none";
        if (seriesSec) seriesSec.style.display = "block";
        if (trendingSongsSec) trendingSongsSec.style.display = "none";
        if (recentlyAddedSongsSec) recentlyAddedSongsSec.style.display = "none";
        if (recommendedSongsSec) recommendedSongsSec.style.display = "none";
        if (popularArtistsSec) popularArtistsSec.style.display = "none";
        if (musicGenresSec) musicGenresSec.style.display = "none";
        if (musicSec) musicSec.style.display = "none";
        if (scifiSec) scifiSec.style.display = "block";
        if (topRatedSec) topRatedSec.style.display = "none";
        if (watchlistSec) watchlistSec.style.display = "none";

        if (seriesSec) seriesSec.scrollIntoView({ behavior: "smooth" });
    } else if (viewName === "music") {
        // Complete dedicated Music Page
        if (homeHero) homeHero.style.display = "none";
        if (genreBar) genreBar.style.display = "none";
        if (continueWatchingSec) continueWatchingSec.style.display = "none";
        if (continueListeningSec) continueListeningSec.style.display = "block";
        if (top10Sec) top10Sec.style.display = "none";
        if (trendingSec) trendingSec.style.display = "none";
        if (moviesSec) moviesSec.style.display = "none";
        if (latestMoviesSec) latestMoviesSec.style.display = "none";
        if (seriesSec) seriesSec.style.display = "none";
        if (trendingSongsSec) trendingSongsSec.style.display = "block";
        if (recentlyAddedSongsSec) recentlyAddedSongsSec.style.display = "block";
        if (popularArtistsSec) popularArtistsSec.style.display = "block";
        if (musicGenresSec) musicGenresSec.style.display = "block";
        if (recommendedSongsSec) recommendedSongsSec.style.display = "block";
        if (musicSec) musicSec.style.display = "block";
        if (scifiSec) scifiSec.style.display = "none";
        if (topRatedSec) topRatedSec.style.display = "none";
        if (watchlistSec) watchlistSec.style.display = "none";

        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast("🎵 HIMSTREAMX Music Streaming Station active", "info");
    } else if (["bhojpuri", "hindi", "punjabi", "haryanvi", "english"].includes(viewName)) {
        // Regional Hubs
        filterRegionalHub(viewName);
    } else if (viewName === "mylist") {
        if (watchlistSec) {
            watchlistSec.style.display = "block";
            watchlistSec.scrollIntoView({ behavior: "smooth" });
        }
    }
}

function filterRegionalHub(region) {
    const regionCapital = region.charAt(0).toUpperCase() + region.slice(1);
    showToast(`🌟 Loading ${regionCapital} Movies & Music Collection...`, "info");

    const searchSection = document.getElementById("searchResultsSection");
    const searchTitle = document.getElementById("searchResultsTitle");
    const searchCount = document.getElementById("searchResultsCount");
    const moviesGrid = document.getElementById("searchResultsGrid");
    const songsGrid = document.getElementById("searchSongsResultsGrid");
    const moviesWrap = document.getElementById("searchMoviesWrap");
    const songsWrap = document.getElementById("searchSongsWrap");

    const moviesDb = window.MOVIES_DATABASE || [];
    const songsDb = window.SONGS_DATABASE || [];

    const regMovies = moviesDb.filter(m =>
        (m.genres && m.genres.some(g => g.toLowerCase().includes(region))) ||
        (m.audio && m.audio.toLowerCase().includes(region))
    );

    const regSongs = songsDb.filter(s =>
        s.language.toLowerCase().includes(region)
    );

    if (searchSection) searchSection.style.display = "block";
    if (searchTitle) searchTitle.textContent = `${regionCapital} Cinema & Music Collection`;
    if (searchCount) searchCount.textContent = `${regMovies.length} movies & ${regSongs.length} songs in catalog`;

    if (moviesWrap) {
        moviesWrap.style.display = regMovies.length > 0 ? "block" : "none";
        if (moviesGrid) moviesGrid.innerHTML = regMovies.map(createMovieCardHTML).join("");
    }

    if (songsWrap) {
        songsWrap.style.display = regSongs.length > 0 ? "block" : "none";
        if (songsGrid) songsGrid.innerHTML = regSongs.map(song => createSongCardHTML(song, regSongs)).join("");
    }

    searchSection.scrollIntoView({ behavior: "smooth" });
}

function initNavbarInteractions() {
    const navbar = document.getElementById("navbar");
    const notificationsBtn = document.getElementById("notificationsBtn");
    const notificationsPanel = document.getElementById("notificationsPanel");
    const profileBtn = document.getElementById("profileBtn");
    const profilePanel = document.getElementById("profilePanel");

    // Glass effect on scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Toggle Notifications
    if (notificationsBtn && notificationsPanel) {
        notificationsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (profilePanel) profilePanel.classList.remove("show");
            notificationsPanel.classList.toggle("show");
        });
    }

    // Toggle Profile
    if (profileBtn && profilePanel) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (notificationsPanel) notificationsPanel.classList.remove("show");
            profilePanel.classList.toggle("show");
        });
    }

    // Close when clicking outside
    document.addEventListener("click", () => {
        if (notificationsPanel) notificationsPanel.classList.remove("show");
        if (profilePanel) profilePanel.classList.remove("show");
    });

    // Mobile Drawer
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const drawerOverlay = document.getElementById("drawerOverlay");

    function openDrawer() {
        mobileDrawer.classList.add("open");
        drawerOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
        mobileDrawer.classList.remove("open");
        drawerOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

    // Hero preview sound toggle
    const heroSoundBtn = document.getElementById("heroSoundToggle");
    const heroSoundIcon = document.getElementById("heroSoundIcon");
    if (heroSoundBtn) {
        heroSoundBtn.addEventListener("click", () => {
            isHeroMuted = !isHeroMuted;
            if (isHeroMuted) {
                if (heroSoundIcon) heroSoundIcon.className = "fa-solid fa-volume-xmark";
                showToast("Hero preview muted");
            } else {
                if (heroSoundIcon) heroSoundIcon.className = "fa-solid fa-volume-high";
                showToast("Hero audio active");
            }
        });
    }
}

// ==========================================================================
// MASTER DOM READY INITIALIZER
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Render all Movie Rows
    renderContinueWatchingRow();
    renderTop10Row();
    renderCategoryRows();
    renderWatchlistRow();
    updateWatchlistBadges();

    // 2. Initialize Music Engine
    initMusicEngine();

    // 3. Initialize Interactive Systems
    initHeroCarousel();
    initSearchEngine();
    initGenrePills();
    initModalHandlers();
    initCinemaPlayerControls();
    initNavbarInteractions();
    initUserAccountSystem();
    initAppNavigation();
    if (typeof initDiscoveryEngine === "function") initDiscoveryEngine();

    console.log("🎬 HIMSTREAMX OTT + Music Platform Initialized Successfully! Developed by Himanshu Prajapati.");
});

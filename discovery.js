// ==========================================================================
// HIMSTREAMX - UNIVERSAL ENTERTAINMENT DISCOVERY ENGINE
// Developed by Himanshu Prajapati (2026)
// Data-Driven Discovery Hub for Regional Music & Multilingual Cinema
// ==========================================================================

const DISCOVERY_CATEGORIES = [
    // 1. Music Languages (10)
    { id: "disc-hi", type: "music-lang", title: "Hindi & Bollywood", filterKey: "language", filterVal: "Hindi", icon: "fa-film", glow: "rgba(255, 51, 102, 0.4)", count: "50+ Tracks", desc: "Soulful Bollywood hits, romantic anthems & indie melodies" },
    { id: "disc-bhoj", type: "music-lang", title: "Bhojpuri Hits", filterKey: "language", filterVal: "Bhojpuri", icon: "fa-bolt", glow: "rgba(229, 9, 20, 0.4)", count: "40+ Tracks", desc: "Explosive dholak, energetic masti & desi dance chartbusters" },
    { id: "disc-punj", type: "music-lang", title: "Punjabi Beats", filterKey: "language", filterVal: "Punjabi", icon: "fa-guitar", glow: "rgba(255, 183, 3, 0.4)", count: "35+ Tracks", desc: "High octane Bhangra, urban trap & powerful dhol drops" },
    { id: "disc-har", type: "music-lang", title: "Haryanvi Ragni/DJ", filterKey: "language", filterVal: "Haryanvi", icon: "fa-drum", glow: "rgba(86, 226, 234, 0.4)", count: "30+ Tracks", desc: "Heavy bass ragni, energetic desi beats & folk dance" },
    { id: "disc-raj", type: "music-lang", title: "Rajasthani Folk", filterKey: "language", filterVal: "Rajasthani", icon: "fa-gem", glow: "rgba(236, 72, 153, 0.4)", count: "25+ Tracks", desc: "Traditional desert instruments, Ghoomar & heritage tunes" },
    { id: "disc-beng", type: "music-lang", title: "Bengali Melodies", filterKey: "language", filterVal: "Bengali", icon: "fa-music", glow: "rgba(168, 85, 247, 0.4)", count: "20+ Tracks", desc: "Sweet acoustic melodies, Rabindra Sangeet & modern pop" },
    { id: "disc-mar", type: "music-lang", title: "Marathi Beats", filterKey: "language", filterVal: "Marathi", icon: "fa-compact-disc", glow: "rgba(245, 158, 11, 0.4)", count: "20+ Tracks", desc: "Lavani rhythms, powada beats & energetic celebration" },
    { id: "disc-guj", type: "music-lang", title: "Gujarati Garba", filterKey: "language", filterVal: "Gujarati", icon: "fa-fire", glow: "rgba(16, 185, 129, 0.4)", count: "25+ Tracks", desc: "Festive Dandiya, Garba beats & upbeat Gujarati tracks" },
    { id: "disc-south", type: "music-lang", title: "South Indian Hits", filterKey: "language", filterVal: "South Indian", icon: "fa-radio", glow: "rgba(59, 130, 246, 0.4)", count: "35+ Tracks", desc: "Tamil, Telugu, Kannada & Malayalam chart toppers" },
    { id: "disc-eng", type: "music-lang", title: "English & Global", filterKey: "language", filterVal: "English", icon: "fa-headphones", glow: "rgba(99, 102, 241, 0.4)", count: "45+ Tracks", desc: "Global Billboard hits, pop, synthwave & indie rock" },

    // 2. Music Moods & Genres (9)
    { id: "disc-dev", type: "music-genre", title: "Devotional & Bhakti", filterKey: "genre", filterVal: "Devotional", icon: "fa-hands-praying", glow: "rgba(245, 158, 11, 0.4)", count: "20+ Tracks", desc: "Sacred bhajans, peaceful mantras & morning chants" },
    { id: "disc-rom", type: "music-genre", title: "Romantic & Love", filterKey: "genre", filterVal: "Romantic", icon: "fa-heart", glow: "rgba(255, 51, 102, 0.4)", count: "40+ Tracks", desc: "Warm acoustics, soulful ballads & tender melodies" },
    { id: "disc-sad", type: "music-genre", title: "Sad & Broken Heart", filterKey: "genre", filterVal: "Sad", icon: "fa-cloud-rain", glow: "rgba(148, 163, 184, 0.4)", count: "25+ Tracks", desc: "Poignant lyrics, bittersweet chords & emotional tracks" },
    { id: "disc-party", type: "music-genre", title: "Party & Club Anthems", filterKey: "genre", filterVal: "Party", icon: "fa-champagne-glasses", glow: "rgba(236, 72, 153, 0.4)", count: "35+ Tracks", desc: "Dancefloor bangers, club drops & weekend bops" },
    { id: "disc-dj", type: "music-genre", title: "DJ & Club Remixes", filterKey: "genre", filterVal: "DJ/Remix", icon: "fa-sliders", glow: "rgba(86, 226, 234, 0.4)", count: "30+ Tracks", desc: "Bass-boosted club flips & energetic EDM transitions" },
    { id: "disc-folk", type: "music-genre", title: "Folk & Desi Traditional", filterKey: "genre", filterVal: "Folk", icon: "fa-drum-steelpan", glow: "rgba(249, 115, 22, 0.4)", count: "25+ Tracks", desc: "Traditional regional instruments & earthy acoustic warmth" },
    { id: "disc-classic", type: "music-genre", title: "Classical & Raagas", filterKey: "genre", filterVal: "Classical", icon: "fa-scroll", glow: "rgba(168, 85, 247, 0.4)", count: "18+ Tracks", desc: "Hindustani, Carnatic, sitar, tabla & timeless ragas" },
    { id: "disc-lofi", type: "music-genre", title: "Lo-Fi & Chillhop", filterKey: "genre", filterVal: "Lo-fi", icon: "fa-mug-hot", glow: "rgba(14, 165, 233, 0.4)", count: "30+ Tracks", desc: "Late-night studying, calm vinyl crackles & aesthetic beats" },
    { id: "disc-inst", type: "music-genre", title: "Instrumental & Strings", filterKey: "genre", filterVal: "Instrumental", icon: "fa-guitar", glow: "rgba(20, 184, 166, 0.4)", count: "22+ Tracks", desc: "Acoustic strings, grand piano & ambient soundtracks" },

    // 3. Movie Categories (11)
    { id: "disc-m-bolly", type: "movie-genre", title: "Bollywood Hits", filterKey: "movie-genre", filterVal: "Hindi", icon: "fa-clapperboard", glow: "rgba(229, 9, 20, 0.4)", count: "50+ Movies", desc: "Grand cinematic blockbusters, dramas & masala hits" },
    { id: "disc-m-reg", type: "movie-genre", title: "Regional Indian Cinema", filterKey: "movie-genre", filterVal: "Regional", icon: "fa-globe-asia", glow: "rgba(255, 183, 3, 0.4)", count: "30+ Movies", desc: "Bhojpuri, South Indian & Marathi cinematic stories" },
    { id: "disc-m-intl", type: "movie-genre", title: "International Cinema 4K", filterKey: "movie-genre", filterVal: "English", icon: "fa-earth-americas", glow: "rgba(86, 226, 234, 0.4)", count: "40+ Movies", desc: "Hollywood critically acclaimed & global masterpieces" },
    { id: "disc-m-act", type: "movie-genre", title: "Action & Superhero", filterKey: "movie-genre", filterVal: "Action", icon: "fa-explosion", glow: "rgba(239, 68, 68, 0.4)", count: "35+ Movies", desc: "Adrenaline-fueled combat, car chases & heroic spectacles" },
    { id: "disc-m-com", type: "movie-genre", title: "Comedy & Fun", filterKey: "movie-genre", filterVal: "Comedy", icon: "fa-face-laugh-beam", glow: "rgba(234, 179, 8, 0.4)", count: "25+ Movies", desc: "Heartfelt laughs, situational humor & family entertainers" },
    { id: "disc-m-thrill", type: "movie-genre", title: "Thriller & Crime", filterKey: "movie-genre", filterVal: "Thriller", icon: "fa-eye", glow: "rgba(139, 92, 246, 0.4)", count: "28+ Movies", desc: "Mind-bending twists, murder mysteries & edge-of-seat drama" },
    { id: "disc-m-horror", type: "movie-genre", title: "Horror & Spooky", filterKey: "movie-genre", filterVal: "Horror", icon: "fa-ghost", glow: "rgba(100, 116, 139, 0.4)", count: "20+ Movies", desc: "Supernatural scares, haunted mysteries & dark atmosphere" },
    { id: "disc-m-rom", type: "movie-genre", title: "Romance & Passion", filterKey: "movie-genre", filterVal: "Romance", icon: "fa-heart", glow: "rgba(244, 63, 94, 0.4)", count: "30+ Movies", desc: "Heartwarming love stories & touching relationship tales" },
    { id: "disc-m-scifi", type: "movie-genre", title: "Sci-Fi & Cyberpunk", filterKey: "movie-genre", filterVal: "Sci-Fi", icon: "fa-rocket", glow: "rgba(6, 182, 212, 0.4)", count: "22+ Movies", desc: "Distant galaxies, futuristic tech & alternate dimensions" },
    { id: "disc-m-drama", type: "movie-genre", title: "Drama & True Stories", filterKey: "movie-genre", filterVal: "Drama", icon: "fa-masks-theater", glow: "rgba(168, 85, 247, 0.4)", count: "35+ Movies", desc: "Deeply moving narratives, biopics & human emotions" },
    { id: "disc-m-anim", type: "movie-genre", title: "Animation & Fantasy", filterKey: "movie-genre", filterVal: "Animation", icon: "fa-wand-magic", glow: "rgba(34, 197, 94, 0.4)", count: "18+ Movies", desc: "Magical family adventures & stunning visual animation" }
];

let currentDiscoveryFilter = "all";

function initDiscoveryEngine() {
    renderDiscoveryGrid(currentDiscoveryFilter);
}

function filterDiscoveryTab(filterType) {
    currentDiscoveryFilter = filterType;
    document.querySelectorAll(".discovery-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-disc") === filterType);
    });
    renderDiscoveryGrid(filterType);
}

function renderDiscoveryGrid(filterType = "all") {
    const grid = document.getElementById("discoveryGrid");
    if (!grid) return;

    let items = DISCOVERY_CATEGORIES;
    if (filterType !== "all") {
        items = DISCOVERY_CATEGORIES.filter(c => c.type === filterType);
    }

    grid.innerHTML = items.map(cat => `
        <div class="discovery-card" style="--card-glow: ${cat.glow};" onclick="handleDiscoveryTileClick('${cat.id}')" role="button" tabindex="0" aria-label="${cat.title}">
            <div class="discovery-card-top">
                <div class="discovery-card-icon" style="box-shadow: 0 4px 14px ${cat.glow};">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <span class="discovery-card-badge">${cat.count}</span>
            </div>
            <div class="discovery-card-bottom">
                <h4 class="discovery-card-title">${cat.title}</h4>
                <p class="discovery-card-desc">${cat.desc}</p>
            </div>
        </div>
    `).join("");
}

function handleDiscoveryTileClick(catId) {
    const cat = DISCOVERY_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;

    if (typeof showToast === "function") {
        showToast(`🧭 Exploring ${cat.title}...`, "success");
    }

    if (cat.type.startsWith("music")) {
        // Switch to Music view and filter
        if (typeof handleViewChange === "function") {
            handleViewChange("music");
        }
        window.location.hash = "#music";

        setTimeout(() => {
            if (cat.filterKey === "language") {
                if (typeof filterMusicByCategory === "function") {
                    filterMusicByCategory(cat.filterVal);
                }
            } else if (cat.filterKey === "genre") {
                if (typeof filterMusicByCategory === "function") {
                    filterMusicByCategory(cat.filterVal);
                }
            }
        }, 100);
    } else {
        // Switch to Movies view and filter
        if (typeof handleViewChange === "function") {
            handleViewChange("movies");
        }
        window.location.hash = "#movies";

        setTimeout(() => {
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                searchInput.value = cat.filterVal;
                if (typeof handleInstantSearch === "function") {
                    handleInstantSearch(cat.filterVal);
                }
            }
        }, 100);
    }
}

// Global hooks
window.initDiscoveryEngine = initDiscoveryEngine;
window.filterDiscoveryTab = filterDiscoveryTab;
window.handleDiscoveryTileClick = handleDiscoveryTileClick;
window.DISCOVERY_CATEGORIES = DISCOVERY_CATEGORIES;

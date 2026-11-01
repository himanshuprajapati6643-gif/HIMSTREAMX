// ==============================================================================
// HIMSTREAMX - OFFICIAL YOUTUBE DATA API V3 & IFRAME PLAYER CONTROLLER
// Developed by Himanshu Prajapati (2026)
//
// STRICT LEGAL & TECHNICAL COMPLIANCE:
// - Uses only official YouTube Data API v3 for search.
// - Uses only official YouTube IFrame Player API (https://www.youtube.com/iframe_api).
// - Zero scraping, zero MP3 extraction, zero audio ripping, zero unauthorized downloads.
// - Full video + original audio playback inside HIMSTREAMX.
// - Handles embed restrictions (error codes 101/150) gracefully.
// ==============================================================================
// ==============================================================================
// 1. CONFIGURATION (CLIENT-SIDE API KEY LOCATION)
// Enter your Google Cloud YouTube Data API v3 Key below if running frontend-only:
// (Or set YOUTUBE_API_KEY in backend/.env for backend-mediated searches)
// ==============================================================================
const YOUTUBE_CONFIG = {
    apiKey: "", // Enter your YouTube Data API v3 key here (e.g., "AIzaSy...")
};
function getEffectiveYouTubeKey() {
    return (localStorage.getItem("himstreamx_youtube_api_key") || YOUTUBE_CONFIG.apiKey || "").trim();
}
// Global YouTube State
let currentYouTubeVideo = null;
let activeYouTubeLanguageFilter = "all";
let currentYouTubePageToken = null;
let currentYouTubeSearchQuery = "";
let isYouTubeIframeApiReady = false;
let activeYTPlayer = null;
let pendingYouTubeVideo = null;
// ==============================================================================
// 2. OFFICIAL YOUTUBE IFRAME PLAYER API LIFECYCLE & ORIGIN SECURITY
// https://www.youtube.com/iframe_api
// ==============================================================================
// Helper: Validate 11-character alphanumeric YouTube Video ID
function isValidYouTubeId(id) {
    if (!id || typeof id !== "string") return false;
    return /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
}
// Helper: Ensure valid HTTP/HTTPS origin (avoids YouTube Error 153 configuration failure)
function getYouTubeOrigin() {
    try {
        if (window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("file:")) {
            return window.location.origin;
        }
    } catch (e) {}
    return "http://localhost:8000";
}
// Check protocol: If run via file://, warn user to launch local server
if (typeof window !== "undefined" && window.location.protocol === "file:") {
    console.warn("⚠️ HIMSTREAMX: Running on file:// protocol. Local HTTP server (http://localhost:8000) is required for YouTube IFrame Player without Error 153.");
    setTimeout(() => {
        if (typeof showToast === "function") {
            showToast("⚠️ YouTube embeds require http://localhost:8000 to prevent Error 153. Please run start_server.bat", "warning", 8000);
        }
    }, 2000);
}
// Ensure official YouTube IFrame API is loaded
(function ensureYouTubeIframeApiLoaded() {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) {
        isYouTubeIframeApiReady = true;
        return;
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(tag, firstScript);
        } else if (document.head) {
            document.head.appendChild(tag);
        }
    }
})();
window.onYouTubeIframeAPIReady = function() {
    isYouTubeIframeApiReady = true;
    console.log("✅ [HIMSTREAMX] Official YouTube IFrame Player API is ready.");
    if (pendingYouTubeVideo) {
        const v = pendingYouTubeVideo;
        pendingYouTubeVideo = null;
        loadYouTubeIframeVideo(v);
    }
};
function loadYouTubeIframeVideo(videoData) {
    const { videoId, title, channel } = videoData;
    const errorNotice = document.getElementById("youtubeEmbedErrorNotice");
    if (errorNotice) errorNotice.style.display = "none";
    // 11. Clear check: If the videoId is missing or invalid: do not call the player, log a clear warning
    if (!isValidYouTubeId(videoId)) {
        console.warn("⚠️ [HIMSTREAMX] Cannot load player: Missing or invalid 11-character YouTube Video ID:", videoId);
        if (errorNotice) {
            errorNotice.style.display = "block";
            errorNotice.innerHTML = `
                <div class="yt-embed-restricted-box">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: #ffb703; margin-bottom: 10px;"></i>
                    <h4 style="color: #fff; margin-bottom: 8px;">Invalid YouTube Video ID</h4>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">The selected item does not have a valid 11-character YouTube identifier (${videoId || 'none'}).</p>
                </div>
            `;
        }
        return;
    }
    const container = document.getElementById("youtubeIframeContainer");
    if (!container) {
        console.error("❌ [HIMSTREAMX] Container #youtubeIframeContainer not found in DOM");
        return;
    }
    const pageOrigin = getYouTubeOrigin();
    console.log(`🎬 [HIMSTREAMX] Loading YouTube Video ID: ${videoId} ("${title || ''}") on Origin: ${pageOrigin}`);
    // If official YT IFrame API is not ready yet, queue video and load API
    if (!window.YT || !window.YT.Player) {
        console.log("⏳ [HIMSTREAMX] YouTube IFrame API script not ready yet, queuing video:", videoId);
        pendingYouTubeVideo = videoData;
        if (typeof ensureYouTubeIframeApiLoaded === "function") ensureYouTubeIframeApiLoaded();
        return;
    }
    // 6 & 7 & 8: If player already exists and is initialized, reuse via loadVideoById()
    if (activeYTPlayer && typeof activeYTPlayer.loadVideoById === "function") {
        try {
            console.log("▶ [HIMSTREAMX] Existing YouTube Player found. Calling loadVideoById:", videoId);
            activeYTPlayer.loadVideoById({
                videoId: videoId,
                startSeconds: 0
            });
            return;
        } catch (e) {
            console.warn("⚠️ [HIMSTREAMX] Failed to reuse existing player instance. Re-initializing...", e);
            try {
                if (typeof activeYTPlayer.destroy === "function") activeYTPlayer.destroy();
            } catch (err) {}
            activeYTPlayer = null;
        }
    }
    // 8 & 9: Player does not exist yet. Initialize it first using official YouTube IFrame Player API
    container.innerHTML = '<div id="youtubePlayerTarget"></div>';
    try {
        console.log("🚀 [HIMSTREAMX] Initializing official YT.Player on #youtubePlayerTarget for:", videoId);
        activeYTPlayer = new YT.Player("youtubePlayerTarget", {
            videoId: videoId,
            width: "100%",
            height: "100%",
            playerVars: {
                autoplay: 1,
                origin: pageOrigin,
                enablejsapi: 1,
                playsinline: 1,
                rel: 0,
                modestbranding: 1
            },
            events: {
                onReady: function(event) {
                    console.log("✅ [HIMSTREAMX] YouTube IFrame Player is READY for video:", videoId);
                    try {
                        event.target.playVideo();
                    } catch (e) {
                        console.warn("Autoplay notice:", e);
                    }
                },
                onStateChange: function(event) {
                    const stateNames = {
                        "-1": "UNSTARTED",
                        "0": "ENDED",
                        "1": "PLAYING",
                        "2": "PAUSED",
                        "3": "BUFFERING",
                        "5": "CUED"
                    };
                    console.log(`ℹ️ [HIMSTREAMX] YouTube Player State: ${stateNames[event.data] || event.data} (${event.data})`);
                },
                onError: function(event) {
                    console.error(`🚨 HIMSTREAMX YouTube Player Error: Code ${event.data} for video: ${videoId}`);
                    handleYouTubePlayerError(event.data, videoId);
                }
            }
        });
        window.activeYTPlayer = activeYTPlayer;
    } catch (e) {
        console.error("❌ [HIMSTREAMX] Exception while creating YT.Player:", e);
    }
}
// ==============================================================================
// 3. EMBED RESTRICTION & ERROR HANDLING (CODES 101, 150, 153)
// ==============================================================================
function handleYouTubePlayerError(errorCode, videoId) {
    const errorNotice = document.getElementById("youtubeEmbedErrorNotice");
    if (!errorNotice) return;
    errorNotice.style.display = "block";
    const pageUrl = window.location.href;
    const pageOrigin = window.location.origin;
    const isFileProtocol = window.location.protocol === "file:";
    console.warn(`[HIMSTREAMX YouTube Error ${errorCode}] Video ID: ${videoId} | Page URL: ${pageUrl} | Origin: ${pageOrigin}`);
    if (errorCode === 153) {
        // Video player configuration error (YouTube Error 153)
        errorNotice.innerHTML = `
            <div class="yt-embed-restricted-box" style="padding: 24px 20px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: #ef4444; margin-bottom: 12px;"></i>
                <h4 style="color: #fff; margin-bottom: 8px; font-size: 1.15rem;">Video player configuration error - Error 153</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 540px; margin: 0 auto 12px; line-height: 1.5;">
                    ${isFileProtocol 
                        ? '<strong>Cause:</strong> You opened HIMSTREAMX directly via <code>file://</code> protocol. YouTube requires HTTP Origin and Referer headers to authenticate embeds.'
                        : 'YouTube requires HTTP Origin and Referer verification. Please run the application via local server <code>http://localhost:8000</code>.'}
                </p>
                <!-- Diagnostic Information (Development / Debug Mode) -->
                <div style="background: rgba(0, 0, 0, 0.45); border-radius: 8px; padding: 12px 14px; margin: 0 auto 16px; max-width: 520px; text-align: left; font-family: monospace; font-size: 0.8rem; color: #94a3b8; border: 1px solid rgba(255,255,255,0.08); line-height: 1.7;">
                    <div><strong>Error Code:</strong> <span style="color: #ef4444; font-weight: bold;">153</span></div>
                    <div><strong>Current Page URL:</strong> <span style="color: #38bdf8;">${pageUrl}</span></div>
                    <div><strong>Current Origin:</strong> <span style="color: #38bdf8;">${pageOrigin}</span></div>
                    <div><strong>Protocol:</strong> <span style="color: ${isFileProtocol ? '#ef4444' : '#22c55e'}; font-weight: bold;">${window.location.protocol}</span></div>
                    <div><strong>Video ID:</strong> <span style="color: #f1f5f9;">${videoId}</span></div>
                    <div><strong>YouTube API Ready:</strong> <span style="color: #22c55e;">${isYouTubeIframeApiReady}</span></div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    ${isFileProtocol ? `
                        <a href="http://localhost:8000" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-globe"></i> Open via http://localhost:8000
                        </a>
                    ` : ''}
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fa-brands fa-youtube"></i> Open on YouTube
                    </a>
                </div>
            </div>
        `;
    } else if (errorCode === 101 || errorCode === 150) {
        // Embed restricted by copyright owner / YouTube policy
        errorNotice.innerHTML = `
            <div class="yt-embed-restricted-box" style="padding: 24px 20px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; text-align: center;">
                <i class="fa-solid fa-ban" style="font-size: 2.2rem; color: #f59e0b; margin-bottom: 12px;"></i>
                <h4 style="color: #fff; margin-bottom: 8px; font-size: 1.15rem;">This video cannot be embedded. Open on YouTube</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 520px; margin: 0 auto 16px; line-height: 1.5;">
                    The owner or publisher has disabled third-party website embedding (Error code: ${errorCode}). You can watch this video with original audio directly on official YouTube.
                </p>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fa-brands fa-youtube"></i> Open on YouTube
                </a>
            </div>
        `;
    } else if (errorCode === 100) {
        errorNotice.innerHTML = `
            <div class="yt-embed-restricted-box" style="padding: 24px 20px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; text-align: center;">
                <i class="fa-solid fa-circle-xmark" style="font-size: 2.2rem; color: #ef4444; margin-bottom: 12px;"></i>
                <h4 style="color: #fff; margin-bottom: 8px;">Video Unavailable (Error 100)</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px;">This YouTube video has been removed or marked private by the creator.</p>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
                    <i class="fa-brands fa-youtube"></i> Search on YouTube
                </a>
            </div>
        `;
    } else {
        errorNotice.innerHTML = `
            <div class="yt-embed-restricted-box" style="padding: 24px 20px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: #f59e0b; margin-bottom: 12px;"></i>
                <h4 style="color: #fff; margin-bottom: 8px;">Playback Notice (Error code: ${errorCode})</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px;">Unable to embed this stream. You can watch it directly on YouTube.</p>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
                    <i class="fa-brands fa-youtube"></i> Open on YouTube
                </a>
            </div>
        `;
    }
}
// ==============================================================================
// 4. OPEN & CLOSE YOUTUBE PLAYER MODAL
// ==============================================================================
function openYouTubePlayerModal(videoId, title = "", channel = "", thumbnail = "") {
    // Validate 11-char YouTube ID
    if (!isValidYouTubeId(videoId)) {
        if (typeof showToast === "function") {
            showToast("⚠️ Invalid YouTube Video ID.", "warning");
        }
        return;
    }
    currentYouTubeVideo = { videoId, title, channel, thumbnail };
    // 1. Save to Recently Played in LocalStorage
    addYouTubeRecentlyPlayed(videoId, title, channel, thumbnail);
    const modal = document.getElementById("youtubePlayerModal");
    const titleEl = document.getElementById("youtubeModalTitle");
    const channelEl = document.getElementById("youtubeModalChannel");
    const errorNotice = document.getElementById("youtubeEmbedErrorNotice");
    if (!modal) return;
    if (titleEl) titleEl.textContent = title || "Official YouTube Stream";
    if (channelEl) channelEl.innerHTML = `<i class="fa-solid fa-circle-check text-cyan"></i> ${channel || "Official Artist Channel"}`;
    if (errorNotice) errorNotice.style.display = "none";
    // Pause background audio safely
    if (window.himstreamxPlayer) {
        try {
            if (typeof window.himstreamxPlayer.pause === "function") {
                window.himstreamxPlayer.pause();
            } else if (typeof window.himstreamxPlayer.stopPlayback === "function") {
                window.himstreamxPlayer.stopPlayback();
            } else if (window.himstreamxPlayer.isPlaying && typeof window.himstreamxPlayer.togglePlayPause === "function") {
                window.himstreamxPlayer.togglePlayPause();
            }
        } catch (e) {}
    }
    if (!modal.classList.contains("open")) {
        modal.classList.add("open");
    }
    document.body.style.overflow = "hidden";
    // Load and play video immediately without artificial delay
    loadYouTubeIframeVideo({ videoId, title, channel });
    // Sync with backend telemetry if available
    if (window.himstreamxAPI) {
        window.himstreamxAPI.recordWatchProgress(videoId, 50, 0, false).catch(() => {});
    }
}
// Universal Helper: Play ANY song or video by title/search query directly from YouTube online!
async function playYouTubeVideoOnline(query, defaultTitle = "", defaultArtist = "", defaultThumb = "") {
    if (!query || !query.trim()) return;
    try {
        if (typeof showToast === "function") {
            showToast(`🔍 Searching YouTube for "${defaultTitle || query}"...`, "info", 1800);
        }
        let res = null;
        if (window.himstreamxAPI) {
            res = await window.himstreamxAPI.searchYouTube(query, { limit: 1 });
        } else {
            const params = new URLSearchParams({ q: query, limit: 1 }).toString();
            const fetchRes = await fetch(`/api/youtube/search?${params}`);
            res = await fetchRes.json();
        }
        if (res && res.data && res.data.length > 0) {
            const item = res.data[0];
            openYouTubePlayerModal(item.videoId, item.title || defaultTitle, item.channelTitle || defaultArtist, item.thumbnail || defaultThumb);
        } else {
            if (typeof showToast === "function") {
                showToast(`No online video found for "${query}".`, "warning");
            }
        }
    } catch (e) {
        console.error("playYouTubeVideoOnline error:", e);
    }
}
// Pre-mapped high-definition official YouTube video IDs for popular database tracks
window.SONG_YOUTUBE_MAP = {
    "song-kesariya-lofi": "BddP6PYo2gs",
    "song-chaleya-groove": "VAdGW7QDJUI",
    "song-pehle-bhi-main": "2mu3rqv_7Z4",
    "song-tum-hi-ho-sad": "Umqb9KENgmk",
    "song-lollipop-lagelu-remix": "5gWvB1S_f8g",
    "song-raja-ji-ke-dil": "3WkJxG6y4uM",
    "song-chhalakata-jawaniya": "p9T5qC4GzP0",
    "song-excuses-urban": "vX2cDW8LUWk",
    "song-lover-diljit": "cl0a3i2wFcc",
    "song-brown-munde-trap": "VNs_cCtdbPc",
    "song-52-gaj-ka-daman": "CZt-rVn2BJs",
    "song-gypsy-balam": "7c3-Ge_3x2Y",
    "song-kesariya-balam": "k3eG3_5RrhE",
    "song-ami-je-tomar": "B_nF_x_7JjY",
    "song-zingaat-dhol": "1z8fG5m6l5w",
    "song-khalasi-coke-studio": "t7wSxhqWZEQ",
    "song-naatu-naatu": "OsU0HhybiDA",
    "song-arabic-kuthu": "KUN5Uf9mObQ",
    "song-blinding-lights-synthwave": "4NRXx6U8ABQ",
    "song-starboy-nightfall": "34Na4j8AVgA",
    "song-cyberpunk-synth-rain": "5qap5aO4i9A",
    "song-hanuman-chalisa-meditative": "AETFvQonfV8",
    "song-shiv-tandav-fusion": "y_y3tWv1mB8"
};
function closeYouTubePlayerModal() {
    const modal = document.getElementById("youtubePlayerModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
    // Stop playback immediately to cleanly silence audio without destroying player
    if (activeYTPlayer) {
        try {
            if (typeof activeYTPlayer.stopVideo === "function") {
                activeYTPlayer.stopVideo();
            } else if (typeof activeYTPlayer.pauseVideo === "function") {
                activeYTPlayer.pauseVideo();
            }
        } catch (e) {}
    }
    currentYouTubeVideo = null;
}
function openExternalYouTube(videoId) {
    if (!videoId && currentYouTubeVideo) videoId = currentYouTubeVideo.videoId;
    if (videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank", "noopener");
    }
}
function shareCurrentYouTubeVideo() {
    if (!currentYouTubeVideo) return;
    const url = `https://www.youtube.com/watch?v=${currentYouTubeVideo.videoId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast("🔗 YouTube video link copied to clipboard!");
    } else {
        prompt("Copy YouTube link:", url);
    }
}
// ==============================================================================
// 5. HIMSTREAMX MUSIC LIBRARY & DYNAMIC YOUTUBE ENGINE
// ==============================================================================
let currentActiveCategory = "Trending";
const _CATEGORY_CACHE = {};
// 1. Music Categories Mapping (Official Queries)
const MUSIC_CATEGORIES = {
    "Trending": { query: "Trending songs", label: "🎵 Trending Songs" },
    "Hindi": { query: "Hindi songs", label: "🎵 Hindi Songs" },
    "Punjabi": { query: "Punjabi songs", label: "🎵 Punjabi Songs" },
    "Haryanvi": { query: "Haryanvi songs", label: "🎵 Haryanvi Songs" },
    "Bhojpuri": { query: "Bhojpuri songs", label: "🎵 Bhojpuri Songs" },
    "Bollywood": { query: "Bollywood songs", label: "🎵 Bollywood Songs" },
    "New Songs": { query: "New songs 2026", label: "🎵 Latest & New Releases 2026" },
    "DJ / Remix": { query: "DJ remix songs", label: "🎵 DJ & Club Remix Songs" },
    "Old Songs": { query: "Old classic Hindi songs", label: "🎵 Evergreen Classic Retro Songs" },
    "Popular Artists": { query: "Arijit Singh Diljit Dosanjh hits", label: "🎵 Popular Artists & Legends" }
};
// Initialize Category Buttons
function initMusicCategoryButtons() {
    const pills = document.querySelectorAll("#musicCategoryPillsBar .music-lib-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            const cat = pill.getAttribute("data-category");
            if (cat) {
                loadMusicCategory(cat);
            }
        });
    });
}
// Load Multiple Real YouTube Songs for Category
async function loadMusicCategory(categoryName) {
    const config = MUSIC_CATEGORIES[categoryName] || { query: `${categoryName} songs`, label: `🎵 ${categoryName} Songs` };
    currentActiveCategory = categoryName;
    // Update active button state
    document.querySelectorAll("#musicCategoryPillsBar .music-lib-pill").forEach(pill => {
        pill.classList.toggle("active", pill.getAttribute("data-category") === categoryName);
    });
    // Update Label
    const labelEl = document.getElementById("musicLibraryCategoryLabel");
    if (labelEl) {
        labelEl.textContent = `${config.label} • Official YouTube Audio/Video Streams`;
    }
    const grid = document.getElementById("musicLibraryGrid");
    if (!grid) return;
    // If cached, display instantly
    if (_CATEGORY_CACHE[categoryName] && _CATEGORY_CACHE[categoryName].length > 0) {
        grid.innerHTML = _CATEGORY_CACHE[categoryName].map(item => createYouTubeMediaCardHTML(item)).join("");
        return;
    }
    // Show shimmering skeleton loading cards
    grid.innerHTML = Array(8).fill(0).map(() => `
        <div class="yt-skeleton-card"></div>
    `).join("");
    try {
        let res = null;
        if (window.himstreamxAPI) {
            res = await window.himstreamxAPI.searchYouTube(config.query, { limit: 20 });
        } else {
            const params = new URLSearchParams({ q: config.query, limit: 20 }).toString();
            const fetchRes = await fetch(`/api/youtube/search?${params}`);
            res = await fetchRes.json();
        }
        if (res && res.data && res.data.length > 0) {
            // Deduplicate items by videoId
            const seen = new Set();
            const unique = [];
            for (const item of res.data) {
                if (item.videoId && !seen.has(item.videoId)) {
                    seen.add(item.videoId);
                    unique.push(item);
                }
            }
            _CATEGORY_CACHE[categoryName] = unique;
            grid.innerHTML = unique.map(item => createYouTubeMediaCardHTML(item)).join("");
        } else {
            grid.innerHTML = `
                <div class="ud-empty-box" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
                    <i class="fa-solid fa-music" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <h3 style="color: #fff;">No tracks found for ${categoryName}</h3>
                    <p style="color: var(--text-muted); margin-top: 6px;">Please check back soon or try another category.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error(`Error loading category ${categoryName}:`, err);
        grid.innerHTML = `
            <div class="ud-empty-box" style="grid-column: 1 / -1; padding: 36px 20px; text-align: center;">
                <i class="fa-brands fa-youtube" style="font-size: 2.8rem; color: #e50914; margin-bottom: 12px;"></i>
                <h3 style="color: #fff;">Unable to load ${categoryName} songs</h3>
                <p style="color: var(--text-muted); margin: 6px auto 14px; max-width: 460px;">Please check your connection and try again.</p>
                <button class="btn btn-outline btn-sm" onclick="loadMusicCategory('${categoryName}')">
                    <i class="fa-solid fa-rotate-right"></i> Try Again
                </button>
            </div>
        `;
    }
}
// Safe suggestions & local history helpers
const SAFE_QUERY_SUGGESTIONS = [
    "Arijit Singh",
    "Bhojpuri remix",
    "Punjabi song",
    "Haryanvi DJ",
    "movie trailer",
    "comedy",
    "Bollywood hits",
    "Tum Hi Ho",
    "Kesariya",
    "DJ remix",
    "Diljit Dosanjh",
    "Sidhu Moose Wala",
    "Khesari Lal Yadav",
    "Pawan Singh",
    "Sapna Choudhary",
    "Hindi old songs",
    "Action movie trailer",
    "Kapil Sharma Show",
    "Zakir Khan standup",
    "Science documentary"
];

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getRecentSearches() {
    try {
        const stored = localStorage.getItem("himstreamx_recent_searches");
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        return [];
    }
}

function saveRecentSearch(query) {
    if (!query || !query.trim()) return;
    try {
        const clean = query.trim();
        const list = getRecentSearches().filter(q => q.toLowerCase() !== clean.toLowerCase());
        list.unshift(clean);
        localStorage.setItem("himstreamx_recent_searches", JSON.stringify(list.slice(0, 8)));
    } catch(e) {}
}

function renderHeaderSuggestions(query = "") {
    const box = document.getElementById("searchSuggestions");
    const listEl = document.getElementById("suggestionsList");
    const countEl = document.getElementById("suggestionCount");
    if (!box || !listEl) return;

    const clean = (query || "").trim().toLowerCase();
    const recents = getRecentSearches();
    let matches = [];

    if (!clean) {
        const recentItems = recents.map(r => ({ text: r, isRecent: true }));
        const popularItems = SAFE_QUERY_SUGGESTIONS.filter(s => !recents.includes(s)).slice(0, 5).map(s => ({ text: s, isRecent: false }));
        matches = [...recentItems, ...popularItems].slice(0, 6);
    } else {
        const matchingRecents = recents.filter(r => r.toLowerCase().includes(clean)).map(r => ({ text: r, isRecent: true }));
        const matchingSafe = SAFE_QUERY_SUGGESTIONS.filter(s => s.toLowerCase().includes(clean) && !recents.includes(s)).map(s => ({ text: s, isRecent: false }));
        matches = [...matchingRecents, ...matchingSafe].slice(0, 6);
    }

    if (matches.length === 0) {
        box.classList.remove("active");
        return;
    }

    if (countEl) countEl.textContent = `${matches.length} suggestions`;
    listEl.innerHTML = matches.map(m => `
        <div class="suggestion-item" data-query="${encodeURIComponent(m.text)}" style="display:flex; align-items:center; gap:10px; padding:9px 14px; cursor:pointer; color:#f1f1f1; font-size:0.88rem; transition:background 0.15s ease;">
            <i class="fa-solid ${m.isRecent ? 'fa-clock-rotate-left' : 'fa-magnifying-glass'}" style="color: ${m.isRecent ? '#56e2ea' : '#888888'}; font-size:0.82rem; width:16px;"></i>
            <span style="flex:1;">${escapeHTML(m.text)}</span>
            ${m.isRecent ? '<span style="font-size:0.7rem; color:#888;">Recent</span>' : ''}
        </div>
    `).join("");

    listEl.querySelectorAll(".suggestion-item").forEach(item => {
        item.addEventListener("mouseenter", () => { item.style.background = "rgba(255,255,255,0.08)"; });
        item.addEventListener("mouseleave", () => { item.style.background = "transparent"; });
        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            const q = decodeURIComponent(item.getAttribute("data-query") || "");
            if (q) {
                const navInput = document.getElementById("searchInput");
                if (navInput) navInput.value = q;
                box.classList.remove("active");
                handleUniversalYouTubeSearch(q);
            }
        });
    });

    box.classList.add("active");
}

// Compact Header Search Bar Setup: Normal state [ 🔍 ], Active state [ 🔍 Search ]
function initHeaderSearchBar() {
    const searchWrapper = document.getElementById("searchWrapper");
    const navInput = document.getElementById("searchInput");
    const navClearBtn = document.getElementById("clearSearchBtn");
    const navSearchBtn = document.getElementById("headerSearchIconBtn");
    const navSubmitBtn = document.getElementById("headerSearchSubmitBtn");
    const suggestionsBox = document.getElementById("searchSuggestions");

    function activateSearchInput() {
        if (searchWrapper) searchWrapper.classList.add("active");
        if (navInput) {
            navInput.focus();
            renderHeaderSuggestions(navInput.value);
        }
    }

    if (searchWrapper) {
        searchWrapper.addEventListener("click", (e) => {
            if (!searchWrapper.classList.contains("active")) {
                activateSearchInput();
            }
        });
    }

    if (navInput) {
        navInput.placeholder = "Search";
        navInput.addEventListener("focus", () => {
            if (searchWrapper) searchWrapper.classList.add("active");
            renderHeaderSuggestions(navInput.value);
        });
        navInput.addEventListener("input", () => {
            const val = navInput.value.trim();
            if (navClearBtn) navClearBtn.style.display = val ? "block" : "none";
            renderHeaderSuggestions(val);
        });
        navInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = navInput.value.trim();
                if (suggestionsBox) suggestionsBox.classList.remove("active");
                if (val) handleUniversalYouTubeSearch(val);
            } else if (e.key === "Escape") {
                if (suggestionsBox) suggestionsBox.classList.remove("active");
                if (!navInput.value.trim() && searchWrapper) {
                    searchWrapper.classList.remove("active");
                }
            }
        });
    }

    if (navSearchBtn) {
        navSearchBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!searchWrapper || !searchWrapper.classList.contains("active")) {
                activateSearchInput();
            } else {
                const val = navInput ? navInput.value.trim() : "";
                if (val) {
                    if (suggestionsBox) suggestionsBox.classList.remove("active");
                    handleUniversalYouTubeSearch(val);
                } else if (navInput) {
                    navInput.focus();
                }
            }
        });
    }

    if (navSubmitBtn) {
        navSubmitBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const val = navInput ? navInput.value.trim() : "";
            if (val) {
                if (suggestionsBox) suggestionsBox.classList.remove("active");
                handleUniversalYouTubeSearch(val);
            } else if (navInput) {
                navInput.focus();
            }
        });
    }

    if (navClearBtn) {
        navClearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (navInput) {
                if (navInput.value.trim()) {
                    navInput.value = "";
                    navClearBtn.style.display = "none";
                    navInput.focus();
                    renderHeaderSuggestions("");
                } else {
                    if (searchWrapper) searchWrapper.classList.remove("active");
                    if (suggestionsBox) suggestionsBox.classList.remove("active");
                    clearYouTubeSearchAndShowHome();
                }
            }
        });
    }

    // Collapse search control when clicking outside and input is empty
    document.addEventListener("click", (e) => {
        if (!searchWrapper) return;
        if (!searchWrapper.contains(e.target)) {
            const val = navInput ? navInput.value.trim() : "";
            if (!val) {
                searchWrapper.classList.remove("active");
            }
            if (suggestionsBox) suggestionsBox.classList.remove("active");
        }
    });
}
// Universal Search Handler (Real YouTube Data API v3)
async function handleUniversalYouTubeSearch(query, isAppend = false) {
    if (!query || !query.trim()) return;
    const cleanQ = query.trim();
    saveRecentSearch(cleanQ);
    currentYouTubeSearchQuery = cleanQ;
    const navInput = document.getElementById("searchInput");
    if (navInput && navInput.value !== cleanQ) navInput.value = cleanQ;
    const navClearBtn = document.getElementById("clearSearchBtn");
    if (navClearBtn) navClearBtn.style.display = "block";
    const resultsSection = document.getElementById("youtubeSearchResultsSection");
    const musicLibrarySection = document.getElementById("homeMusicLibrarySection");
    const headingEl = document.getElementById("youtubeSearchHeading");
    const subheadingEl = document.getElementById("youtubeSearchSubheading");
    const resultsGrid = document.getElementById("youtubeResultsGrid");
    const loadMoreBtn = document.getElementById("youtubeLoadMoreBtn");
    // UI: Show Search Results, Hide Home Music Library & Home Dynamic Shelves
    const dynamicShelvesSection = document.getElementById("homeDynamicYouTubeSections");
    if (resultsSection) resultsSection.style.display = "block";
    if (musicLibrarySection) musicLibrarySection.style.display = "none";
    if (dynamicShelvesSection) dynamicShelvesSection.style.display = "none";
    const oldSearchSection = document.getElementById("searchResultsSection");
    if (oldSearchSection) oldSearchSection.style.display = "none";
    const suggestionsBox = document.getElementById("searchSuggestions");
    if (suggestionsBox) suggestionsBox.classList.remove("active");

    if (headingEl) headingEl.textContent = `Search Results for: "${cleanQ}"`;
    if (subheadingEl) subheadingEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Searching YouTube...`;
    // Skeleton loading state
    if (!isAppend && resultsGrid) {
        currentYouTubePageToken = null;
        resultsGrid.innerHTML = Array(8).fill(0).map(() => `
            <div class="yt-skeleton-card"></div>
        `).join("");
    }
    try {
        let res = null;
        const options = { limit: 20 };
        if (isAppend && currentYouTubePageToken) {
            options.pageToken = currentYouTubePageToken;
        }
        // Query Backend REST API
        if (window.himstreamxAPI) {
            res = await window.himstreamxAPI.searchYouTube(cleanQ, options);
        } else {
            const params = new URLSearchParams({ q: cleanQ, limit: 20, ...options }).toString();
            const fetchRes = await fetch(`/api/youtube/search?${params}`);
            res = await fetchRes.json();
        }
        if (res && res.data && res.data.length > 0) {
            // Deduplicate by videoId
            const seen = new Set();
            const uniqueItems = [];
            for (const item of res.data) {
                if (item.videoId && !seen.has(item.videoId)) {
                    seen.add(item.videoId);
                    uniqueItems.push(item);
                }
            }
            currentYouTubePageToken = res.nextPageToken || null;
            if (subheadingEl) {
                subheadingEl.textContent = `Showing ${uniqueItems.length} real YouTube results • Click to stream`;
            }
            const cardsHTML = uniqueItems.map(item => createYouTubeMediaCardHTML(item)).join("");
            if (resultsGrid) {
                if (isAppend) {
                    resultsGrid.insertAdjacentHTML("beforeend", cardsHTML);
                } else {
                    resultsGrid.innerHTML = cardsHTML;
                }
            }
            if (loadMoreBtn) {
                loadMoreBtn.style.display = res.nextPageToken ? "inline-block" : "none";
            }
            if (!isAppend && resultsSection) {
                resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        } else {
            // Requirement 14: No results found
            if (subheadingEl) subheadingEl.textContent = "No results found. Try another search.";
            if (resultsGrid && !isAppend) {
                resultsGrid.innerHTML = `
                    <div class="ud-empty-box" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center;">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.8rem; color: var(--text-muted); margin-bottom: 14px;"></i>
                        <h3 style="color: #fff; font-size: 1.3rem;">No results found for "${cleanQ}"</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">No results found. Try another search.</p>
                        <button class="btn btn-secondary btn-sm" style="margin-top: 14px;" onclick="clearYouTubeSearchAndShowHome()">
                            <i class="fa-solid fa-arrow-left"></i> Back to Music Library
                        </button>
                    </div>
                `;
            }
            if (loadMoreBtn) loadMoreBtn.style.display = "none";
        }
    } catch (err) {
        console.error("YouTube search error:", err);
        if (subheadingEl) subheadingEl.textContent = "Unable to load YouTube results";
        if (resultsGrid && !isAppend) {
            resultsGrid.innerHTML = `
                <div class="ud-empty-box" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center;">
                    <i class="fa-brands fa-youtube" style="font-size: 3rem; color: #e50914; margin-bottom: 14px;"></i>
                    <h3 style="color: #fff; font-size: 1.3rem;">Unable to load YouTube results. Please try again.</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin: 8px auto 16px; max-width: 480px;">Please check your connection and try again.</p>
                    <button class="btn btn-outline btn-sm" onclick="handleUniversalYouTubeSearch('${cleanQ}')">
                        <i class="fa-solid fa-rotate-right"></i> Try Again
                    </button>
                </div>
            `;
        }
    }
}
function loadMoreYouTubeSearchResults() {
    if (currentYouTubeSearchQuery && currentYouTubePageToken) {
        handleUniversalYouTubeSearch(currentYouTubeSearchQuery, true);
    }
}
function clearYouTubeSearchAndShowHome() {
    const navInput = document.getElementById("searchInput");
    const navClearBtn = document.getElementById("clearSearchBtn");
    const resultsSection = document.getElementById("youtubeSearchResultsSection");
    const musicLibrarySection = document.getElementById("homeMusicLibrarySection");
    if (navInput) navInput.value = "";
    if (navClearBtn) navClearBtn.style.display = "none";
    const dynamicShelvesSection = document.getElementById("homeDynamicYouTubeSections");
    if (resultsSection) resultsSection.style.display = "none";
    if (musicLibrarySection) musicLibrarySection.style.display = "block";
    if (dynamicShelvesSection) dynamicShelvesSection.style.display = "block";
    currentYouTubeSearchQuery = "";
}
function filterYouTubeByLanguage(lang) {
    const query = `${lang} songs`;
    handleUniversalYouTubeSearch(query, false);
}
// Generate Individual YouTube Card HTML with Safe Data Attributes and Working Play Button
function createYouTubeMediaCardHTML(item) {
    const rawTitle = item.title || "";
    const safeTitleEscaped = rawTitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const rawChannel = item.channelTitle || "";
    const safeChannelEscaped = rawChannel.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const isFav = typeof isYouTubeFavorite === "function" ? isYouTubeFavorite(item.videoId) : false;
    const pubDate = item.publishedAt ? item.publishedAt.slice(0, 10) : "";
    const encTitle = encodeURIComponent(rawTitle);
    const encChannel = encodeURIComponent(rawChannel);
    const encThumb = encodeURIComponent(item.thumbnail || "");
    return `
        <div class="yt-media-card"
             data-video-id="${item.videoId}"
             data-title="${encTitle}"
             data-channel="${encChannel}"
             data-thumbnail="${encThumb}"
             onclick="playYouTubeCard(this)"
             role="button"
             tabindex="0">
            <div class="yt-thumb-wrapper">
                <img src="${item.thumbnail}" alt="${safeTitleEscaped}" loading="lazy" class="yt-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=640&q=80'">
                <div class="yt-play-overlay">
                    <div class="yt-play-circle"><i class="fa-solid fa-play"></i></div>
                </div>
                <span class="yt-badge-official"><i class="fa-brands fa-youtube"></i> Official Stream</span>
            </div>
            <div class="yt-card-info">
                <h4 class="yt-card-title" title="${safeTitleEscaped}">${safeTitleEscaped}</h4>
                <div class="yt-card-meta">
                    <span class="yt-channel-name"><i class="fa-solid fa-circle-check text-cyan" style="font-size: 0.75rem;"></i> ${safeChannelEscaped}</span>
                    ${pubDate ? `<span class="yt-publish-date"><i class="fa-regular fa-calendar"></i> ${pubDate}</span>` : ''}
                </div>
                <div class="yt-card-actions" onclick="event.stopPropagation()">
                    <button type="button" class="btn btn-primary btn-sm yt-card-play-btn" data-video-id="${item.videoId}" data-title="${encTitle}" data-channel="${encChannel}" data-thumbnail="${encThumb}" onclick="event.stopPropagation(); playYouTubeCard(this);" title="Play Video">
                        <i class="fa-solid fa-play"></i> Play
                    </button>
                    <button type="button" class="yt-action-btn ${isFav ? 'liked' : ''}" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" onclick="event.stopPropagation(); toggleYouTubeFavoriteFromCard(this);">
                        <i class="${isFav ? 'fa-solid fa-heart text-red' : 'fa-regular fa-heart'}"></i>
                    </button>
                    <button type="button" class="yt-action-btn" title="Open on YouTube" onclick="event.stopPropagation(); openExternalYouTubeFromCard(this);">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}
// Handler: Play Video for specific card (extracts exact videoId without string-quote syntax errors)
function playYouTubeCard(el) {
    if (!el) return;
    const card = el.closest(".yt-media-card") || el;
    const videoId = el.getAttribute("data-video-id") || card.getAttribute("data-video-id");
    // 5. When Play is clicked, console/debug should show the selected videoId
    console.log("▶ [HIMSTREAMX] Play clicked for Video ID:", videoId);
    // 11. Add a clear check: If the videoId is missing or invalid: do not call the player, log a clear warning
    if (!isValidYouTubeId(videoId)) {
        console.warn("⚠️ [HIMSTREAMX] Missing or invalid YouTube Video ID on clicked card:", videoId);
        return;
    }
    let title = "";
    let channel = "";
    let thumbnail = "";
    try {
        title = decodeURIComponent(el.getAttribute("data-title") || card.getAttribute("data-title") || "");
        channel = decodeURIComponent(el.getAttribute("data-channel") || card.getAttribute("data-channel") || "");
        thumbnail = decodeURIComponent(el.getAttribute("data-thumbnail") || card.getAttribute("data-thumbnail") || "");
    } catch (e) {
        title = el.getAttribute("data-title") || card.getAttribute("data-title") || "";
        channel = el.getAttribute("data-channel") || card.getAttribute("data-channel") || "";
        thumbnail = el.getAttribute("data-thumbnail") || card.getAttribute("data-thumbnail") || "";
    }
    openYouTubePlayerModal(videoId, title, channel, thumbnail);
}
// Handler: Toggle favorite from card
function toggleYouTubeFavoriteFromCard(btnEl) {
    const card = btnEl.closest(".yt-media-card");
    if (!card) return;
    const videoId = card.getAttribute("data-video-id");
    let title = "", channel = "", thumbnail = "";
    try {
        title = decodeURIComponent(card.getAttribute("data-title") || "");
        channel = decodeURIComponent(card.getAttribute("data-channel") || "");
        thumbnail = decodeURIComponent(card.getAttribute("data-thumbnail") || "");
    } catch (e) {}
    toggleYouTubeFavorite(videoId, title, channel, thumbnail, btnEl);
}
// Handler: Open external YouTube from card
function openExternalYouTubeFromCard(btnEl) {
    const card = btnEl.closest(".yt-media-card");
    if (!card) return;
    const videoId = card.getAttribute("data-video-id");
    openExternalYouTube(videoId);
}
// ==============================================================================
// 5B. 6 DYNAMIC HOME YOUTUBE SHELVES (Trending, Hindi, Punjabi, Haryanvi, Bhojpuri, Bollywood)
// ==============================================================================
const HOME_YOUTUBE_SHELVES = [
    {
        id: "trending",
        categoryKey: "Trending",
        title: "Trending Music Hits",
        subtitle: "India's hottest viral & trending songs right now",
        icon: '<i class="fa-solid fa-fire text-red"></i>',
        query: "Trending music songs 2026"
    },
    {
        id: "hindi",
        categoryKey: "Hindi",
        title: "Hindi Chartbusters",
        subtitle: "Superhit Hindi melodies, romantic & upbeat anthems",
        icon: '<i class="fa-solid fa-music text-red"></i>',
        query: "Hindi superhit songs"
    },
    {
        id: "punjabi",
        categoryKey: "Punjabi",
        title: "Punjabi Beats & Bhangra",
        subtitle: "High-energy Punjabi club tracks, folk & pop hits",
        icon: '<i class="fa-solid fa-bolt text-red"></i>',
        query: "Punjabi hits songs"
    },
    {
        id: "haryanvi",
        categoryKey: "Haryanvi",
        title: "Haryanvi Ragni & DJ Banger",
        subtitle: "Folk roots, heavy bass & energetic Haryanvi tunes",
        icon: '<i class="fa-solid fa-compact-disc text-red"></i>',
        query: "Haryanvi DJ songs"
    },
    {
        id: "bhojpuri",
        categoryKey: "Bhojpuri",
        title: "Bhojpuri Superhits",
        subtitle: "Massive chartbusters, folk dances & regional sensations",
        icon: '<i class="fa-solid fa-guitar text-red"></i>',
        query: "Bhojpuri superhit songs"
    },
    {
        id: "bollywood",
        categoryKey: "Bollywood",
        title: "Bollywood Blockbusters",
        subtitle: "Grand cinematic soundtracks and Bollywood classics",
        icon: '<i class="fa-solid fa-film text-red"></i>',
        query: "Bollywood superhit songs"
    }
];
async function initHomeYouTubeSections() {
    const container = document.getElementById("homeDynamicYouTubeSections");
    if (!container) return;
    // Render skeleton layout for the 6 shelves
    container.innerHTML = HOME_YOUTUBE_SHELVES.map(shelf => `
        <section class="movie-section home-yt-shelf" id="section-shelf-${shelf.id}">
            <div class="section-header">
                <div class="section-title-wrap">
                    <h2 class="section-title">${shelf.icon} ${shelf.title}</h2>
                    <span class="results-count">${shelf.subtitle}</span>
                </div>
                <button type="button" class="btn-text-action" onclick="loadMusicCategory('${shelf.categoryKey}')">
                    View All in Grid <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
            <div class="carousel-wrapper">
                <button type="button" class="slider-arrow left" onclick="scrollCarousel('carousel-yt-${shelf.id}', -1)" aria-label="Scroll left">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <div class="movie-container home-yt-carousel" id="carousel-yt-${shelf.id}">
                    ${Array(6).fill(0).map(() => '<div class="yt-skeleton-card" style="flex: 0 0 260px; min-width: 260px;"></div>').join("")}
                </div>
                <button type="button" class="slider-arrow right" onclick="scrollCarousel('carousel-yt-${shelf.id}', 1)" aria-label="Scroll right">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </section>
    `).join("");
    // Load each shelf asynchronously
    for (const shelf of HOME_YOUTUBE_SHELVES) {
        loadSingleShelf(shelf);
    }
}
async function loadSingleShelf(shelf) {
    const carouselEl = document.getElementById(`carousel-yt-${shelf.id}`);
    if (!carouselEl) return;
    // Reuse category cache if available
    if (_CATEGORY_CACHE[shelf.categoryKey] && _CATEGORY_CACHE[shelf.categoryKey].length > 0) {
        carouselEl.innerHTML = _CATEGORY_CACHE[shelf.categoryKey].map(item => createYouTubeMediaCardHTML(item)).join("");
        return;
    }
    try {
        let res = null;
        if (window.himstreamxAPI) {
            res = await window.himstreamxAPI.searchYouTube(shelf.query, { limit: 16 });
        } else {
            const params = new URLSearchParams({ q: shelf.query, limit: 16 }).toString();
            const fetchRes = await fetch(`/api/youtube/search?${params}`);
            res = await fetchRes.json();
        }
        if (res && res.data && res.data.length > 0) {
            const seen = new Set();
            const unique = [];
            for (const item of res.data) {
                if (item.videoId && !seen.has(item.videoId)) {
                    seen.add(item.videoId);
                    unique.push(item);
                }
            }
            _CATEGORY_CACHE[shelf.categoryKey] = unique;
            carouselEl.innerHTML = unique.map(item => createYouTubeMediaCardHTML(item)).join("");
        } else {
            carouselEl.innerHTML = `
                <div style="padding: 20px; color: var(--text-muted); font-size: 0.88rem;">
                    Official stream catalog loaded.
                </div>
            `;
        }
    } catch (e) {
        console.warn(`Could not load shelf ${shelf.id}:`, e);
    }
}
// 6. FAVORITES IN LOCALSTORAGE (videoId, title, thumbnail, channel)
// ==============================================================================
function getYouTubeFavorites() {
    try {
        return JSON.parse(localStorage.getItem("himstreamx_yt_favorites") || "[]");
    } catch (e) {
        return [];
    }
}
function isYouTubeFavorite(videoId) {
    const list = getYouTubeFavorites();
    return list.some(item => item.videoId === videoId);
}
function toggleYouTubeFavorite(videoId, title, channel, thumbnail, btnEl) {
    let list = getYouTubeFavorites();
    const idx = list.findIndex(item => item.videoId === videoId);
    let isNowFav = false;
    if (idx >= 0) {
        list.splice(idx, 1);
        isNowFav = false;
        showToast(`Removed from YouTube Favorites.`);
    } else {
        list.unshift({
            videoId,
            title,
            channel,
            thumbnail,
            savedAt: new Date().toISOString()
        });
        isNowFav = true;
        showToast(`❤️ Saved "${title.slice(0, 24)}..." to YouTube Favorites!`, "success");
    }
    localStorage.setItem("himstreamx_yt_favorites", JSON.stringify(list));
    if (btnEl) {
        btnEl.classList.toggle("liked", isNowFav);
        const icon = btnEl.querySelector("i");
        if (icon) {
            icon.className = isNowFav ? "fa-solid fa-heart text-red" : "fa-regular fa-heart";
        }
    }
}
// ==============================================================================
// 7. RECENTLY PLAYED IN LOCALSTORAGE
// ==============================================================================
function getYouTubeRecentlyPlayed() {
    try {
        return JSON.parse(localStorage.getItem("himstreamx_yt_recently_played") || "[]");
    } catch (e) {
        return [];
    }
}
function addYouTubeRecentlyPlayed(videoId, title, channel, thumbnail) {
    if (!videoId) return;
    let list = getYouTubeRecentlyPlayed();
    // Remove if already exists
    list = list.filter(item => item.videoId !== videoId);
    list.unshift({
        videoId,
        title: title || "YouTube Video",
        channel: channel || "Official Channel",
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        playedAt: new Date().toISOString()
    });
    // Keep top 50
    if (list.length > 50) list = list.slice(0, 50);
    localStorage.setItem("himstreamx_yt_recently_played", JSON.stringify(list));
}
// ==============================================================================
// 8. PLAYLISTS IN LOCALSTORAGE (CONTAINING VIDEO IDs & METADATA)
// ==============================================================================
function getYouTubePlaylists() {
    try {
        return JSON.parse(localStorage.getItem("himstreamx_yt_playlists") || "[]");
    } catch (e) {
        return [];
    }
}
function saveYouTubePlaylists(playlists) {
    localStorage.setItem("himstreamx_yt_playlists", JSON.stringify(playlists));
}
function promptAddYouTubeToPlaylist(videoId, title, channel, thumbnail) {
    let playlists = getYouTubePlaylists();
    if (playlists.length === 0) {
        const createNow = confirm(`No YouTube playlists found. Create a new playlist for "${title.slice(0, 24)}..."?`);
        if (createNow) {
            const plName = prompt("Enter Playlist Title:", "My Favorite Hits");
            if (plName && plName.trim()) {
                const newPl = {
                    id: "ytpl-" + Date.now(),
                    title: plName.trim(),
                    description: "Curated YouTube Collection",
                    createdAt: new Date().toISOString(),
                    videos: [
                        { videoId, title, channel, thumbnail, addedAt: new Date().toISOString() }
                    ]
                };
                playlists.push(newPl);
                saveYouTubePlaylists(playlists);
                showToast(`🎉 Created playlist "${plName}" with video added!`, "success");
            }
        }
        return;
    }
    const optionsText = playlists.map((p, idx) => `${idx + 1}. ${p.title} (${p.videos.length} videos)`).join("\n");
    const chosen = prompt(`Select playlist number to add this video:\n\n${optionsText}\n\n(Or enter "0" to create a new playlist)`);
    if (chosen === null) return;
    const choiceNum = parseInt(chosen.trim(), 10);
    if (choiceNum === 0) {
        const plName = prompt("Enter New Playlist Title:", "My Curated Hits");
        if (plName && plName.trim()) {
            playlists.push({
                id: "ytpl-" + Date.now(),
                title: plName.trim(),
                description: "Curated YouTube Collection",
                createdAt: new Date().toISOString(),
                videos: [
                    { videoId, title, channel, thumbnail, addedAt: new Date().toISOString() }
                ]
            });
            saveYouTubePlaylists(playlists);
            showToast(`🎉 Created playlist "${plName}"!`, "success");
        }
    } else if (choiceNum > 0 && choiceNum <= playlists.length) {
        const targetPl = playlists[choiceNum - 1];
        if (targetPl.videos.some(v => v.videoId === videoId)) {
            showToast(`Video is already in "${targetPl.title}".`, "info");
            return;
        }
        targetPl.videos.push({ videoId, title, channel, thumbnail, addedAt: new Date().toISOString() });
        saveYouTubePlaylists(playlists);
        showToast(`✅ Added to "${targetPl.title}"!`, "success");
    }
}
// ==============================================================================
// 9. YOUTUBE API KEY SETUP MODAL CONTROLLER
// ==============================================================================
function openYouTubeKeySetupModal() {
    const modal = document.getElementById("youtubeApiKeyModal");
    const input = document.getElementById("youtubeApiKeyInput");
    if (input) {
        input.value = getEffectiveYouTubeKey();
    }
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("open");
    }
    document.body.style.overflow = "hidden";
}
function closeYouTubeKeySetupModal() {
    const modal = document.getElementById("youtubeApiKeyModal");
    if (modal) {
        modal.classList.remove("open");
        modal.style.display = "none";
    }
    document.body.style.overflow = "";
}
async function saveYouTubeApiKeyFromModal() {
    const input = document.getElementById("youtubeApiKeyInput");
    const key = input ? input.value.trim() : "";
    localStorage.setItem("himstreamx_youtube_api_key", key);
    YOUTUBE_CONFIG.apiKey = key;
    // Persist to backend if available
    try {
        if (window.himstreamxAPI) {
            await fetch("/api/youtube/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: key })
            });
        }
    } catch (e) {
        console.warn("Backend key sync notice:", e);
    }
    closeYouTubeKeySetupModal();
    showToast(key ? "✅ YouTube Data API key configured successfully!" : "YouTube API key cleared.");
    // Re-run current search if query exists
    const q = currentYouTubeSearchQuery || "Bhojpuri song";
    handleUniversalYouTubeSearch(q, false);
}
// ==============================================================================
// 10. VIP SUBSCRIPTION & THEATRICAL PASS MODAL CONTROLLER
// ==============================================================================
function openSubscriptionModal(movieTitle = "") {
    const modal = document.getElementById("subscriptionModal");
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (movieTitle) {
        const noticeEl = document.getElementById("theatricalMovieVipNotice");
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.textContent = `🎬 VIP Cinema Hall Pass required to stream "${movieTitle}" in 4K UHD.`;
        }
    }
}
function closeSubscriptionModal() {
    const modal = document.getElementById("subscriptionModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}
function selectSubPlan(planId, planName, amount) {
    document.querySelectorAll(".sub-plan-card").forEach(c => c.classList.remove("selected"));
    const selected = document.getElementById(`sub-${planId}`);
    if (selected) selected.classList.add("selected");
    const planNameEl = document.getElementById("selectedPlanName");
    const planAmountEl = document.getElementById("selectedPlanAmount");
    if (planNameEl) planNameEl.textContent = planName;
    if (planAmountEl) planAmountEl.textContent = `₹${amount}`;
    const form = document.getElementById("subPaymentForm");
    if (form) form.scrollIntoView({ behavior: "smooth" });
    showToast(`Selected ${planName} (₹${amount}). Scan QR code to complete payment.`);
}
function copyUPIId() {
    const upi = "7084468661@pytes";
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upi);
        showToast("✅ UPI ID 7084468661@pytes copied to clipboard!");
    } else {
        prompt("Copy UPI ID:", upi);
    }
}
async function handlePaymentSubmit(e) {
    if (e) e.preventDefault();
    const utrInput = document.getElementById("paymentUtrInput");
    const mobileInput = document.getElementById("paymentMobileInput");
    const utr = utrInput ? utrInput.value.trim() : "";
    const mobile = mobileInput ? mobileInput.value.trim() : "";
    if (!utr) {
        showToast("Please enter your UPI transaction reference / UTR number.", "warning");
        return;
    }
    try {
        const planName = document.getElementById("selectedPlanName") ? document.getElementById("selectedPlanName").textContent : "VIP 4K Cinema Pass (Monthly)";
        const res = await window.himstreamxAPI.submitSubscriptionPayment(planName, 199, utr, mobile);
        showToast(res.message || "🎉 Payment reference submitted! Your VIP pass is active.", "success");
        if (utrInput) utrInput.value = "";
        setTimeout(closeSubscriptionModal, 1500);
    } catch (err) {
        showToast(`❌ Error: ${err.message}`, "warning");
    }
}
// ==============================================================================
// 11. DIRECTOR HIMANSHU PRAJAPATI PRIVATE VAULT (KEY: Him@90)
// ==============================================================================
function promptDirectorUnlock() {
    const modal = document.getElementById("directorUnlockModal");
    const keyInput = document.getElementById("directorSecretKey");
    if (keyInput) keyInput.value = "";
    if (modal) modal.classList.add("open");
    document.body.style.overflow = "hidden";
}
function closeDirectorUnlockModal() {
    const modal = document.getElementById("directorUnlockModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}
async function handleDirectorUnlockSubmit(e) {
    if (e) e.preventDefault();
    const keyInput = document.getElementById("directorSecretKey");
    const pass = keyInput ? keyInput.value.trim() : "";
    try {
        const res = await window.himstreamxAPI.unlockDirectorProfile(pass);
        if (res && res.director) {
            closeDirectorUnlockModal();
            renderDirectorProfile(res.director);
            showToast("👑 Director Master Vault Unlocked Successfully!", "success");
        }
    } catch (err) {
        showToast("❌ Access Denied: Incorrect Master Password. Reserved strictly for Himanshu Prajapati.", "warning");
        if (keyInput) keyInput.select();
    }
}
function renderDirectorProfile(director) {
    const modal = document.getElementById("directorProfileModal");
    if (!modal) return;
    const nameEl = document.getElementById("dirProfileName");
    const titleEl = document.getElementById("dirProfileTitle");
    const phoneEl = document.getElementById("dirProfilePhone");
    const emailEl = document.getElementById("dirProfileEmail");
    const photoEl = document.getElementById("dirProfilePhoto");
    const bioEl = document.getElementById("dirProfileBio");
    const graphContainer = document.getElementById("dirProfileGraphs");
    if (nameEl) nameEl.textContent = director.name;
    if (titleEl) titleEl.textContent = director.title;
    if (phoneEl) phoneEl.textContent = director.mobile;
    if (emailEl) emailEl.textContent = director.email;
    if (photoEl) photoEl.src = director.photoUrl || "/Himanshu%20photo.png";
    if (bioEl) bioEl.textContent = director.bio;
    if (graphContainer && director.metricsGraph) {
        const mg = director.metricsGraph;
        const maxVal = Math.max(...mg.streamingGrowthValues);
        graphContainer.innerHTML = `
            <div class="dir-graphs-grid">
                <div class="dir-graph-card">
                    <h4><i class="fa-solid fa-chart-line text-cyan"></i> Monthly Stream Growth Telemetry</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Active Streams Across 4K OTT & Music Engine</p>
                    <div class="dir-bar-chart">
                        ${mg.streamingGrowthMonths.map((m, idx) => {
                            const val = mg.streamingGrowthValues[idx];
                            const pct = Math.round((val / maxVal) * 100);
                            return `
                                <div class="dir-chart-col">
                                    <div class="dir-bar-fill" style="height: ${pct}%;" title="${val.toLocaleString()} streams"></div>
                                    <span class="dir-bar-val">${Math.round(val / 1000)}k</span>
                                    <span class="dir-bar-label">${m}</span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
                <div class="dir-graph-card">
                    <h4><i class="fa-solid fa-pie-chart text-red"></i> Regional Languages Catalog Share</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Multilingual Diversity Distribution</p>
                    <div class="dir-lang-bars">
                        ${mg.languageShare.map(item => `
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                                    <span style="color: #fff;">${item.label}</span>
                                    <span style="color: ${item.color}; font-weight: 700;">${item.percentage}%</span>
                                </div>
                                <div style="height: 6px; background: rgba(255,255,200,0.08); border-radius: 99px; overflow: hidden;">
                                    <div style="width: ${item.percentage}%; height: 100%; background: ${item.color}; border-radius: 99px;"></div>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
}
function closeDirectorProfileModal() {
    const modal = document.getElementById("directorProfileModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}
// Global Hooks & Exports
window.handleUniversalYouTubeSearch = handleUniversalYouTubeSearch;
window.filterYouTubeByLanguage = filterYouTubeByLanguage;
window.openYouTubePlayerModal = openYouTubePlayerModal;
window.closeYouTubePlayerModal = closeYouTubePlayerModal;
window.handleYouTubePlayerError = handleYouTubePlayerError;
window.openExternalYouTube = openExternalYouTube;
window.shareCurrentYouTubeVideo = shareCurrentYouTubeVideo;
window.toggleYouTubeFavorite = toggleYouTubeFavorite;
window.promptAddYouTubeToPlaylist = promptAddYouTubeToPlaylist;
window.getYouTubeFavorites = getYouTubeFavorites;
window.getYouTubeRecentlyPlayed = getYouTubeRecentlyPlayed;
window.getYouTubePlaylists = getYouTubePlaylists;
window.openYouTubeKeySetupModal = openYouTubeKeySetupModal;
window.closeYouTubeKeySetupModal = closeYouTubeKeySetupModal;
window.saveYouTubeApiKeyFromModal = saveYouTubeApiKeyFromModal;
window.openSubscriptionModal = openSubscriptionModal;
window.closeSubscriptionModal = closeSubscriptionModal;
window.selectSubPlan = selectSubPlan;
window.copyUPIId = copyUPIId;
window.handlePaymentSubmit = handlePaymentSubmit;
window.promptDirectorUnlock = promptDirectorUnlock;
window.closeDirectorUnlockModal = closeDirectorUnlockModal;
window.handleDirectorUnlockSubmit = handleDirectorUnlockSubmit;
window.closeDirectorProfileModal = closeDirectorProfileModal;
window.loadMusicCategory = loadMusicCategory;
window.clearYouTubeSearchAndShowHome = clearYouTubeSearchAndShowHome;
window.loadMoreYouTubeSearchResults = loadMoreYouTubeSearchResults;
window.playYouTubeCard = playYouTubeCard;
window.playYouTubeVideoOnline = playYouTubeVideoOnline;
window.toggleYouTubeFavoriteFromCard = toggleYouTubeFavoriteFromCard;
window.openExternalYouTubeFromCard = openExternalYouTubeFromCard;
window.initHomeYouTubeSections = initHomeYouTubeSections;
// Auto-initialize Header Search Bar, Category Buttons, Default Trending Category & 6 Dynamic Shelves
function initHIMSTREAMXMusicEngine() {
    initHeaderSearchBar();
    initMusicCategoryButtons();
    loadMusicCategory("Trending");
    initHomeYouTubeSections();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHIMSTREAMXMusicEngine);
} else {
    initHIMSTREAMXMusicEngine();
}

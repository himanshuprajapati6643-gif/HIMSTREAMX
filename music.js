// ==========================================================================
// HIMSTREAMX - PROFESSIONAL MUSIC STREAMING ENGINE
// Developed by Himanshu Prajapati (2026)
// Music Catalog Views, Categories, Artists & Continue Listening
// ==========================================================================

let activeMusicFilter = "all";

// ==========================================================================
// 1. SONG CARD GENERATOR
// ==========================================================================
function createSongCardHTML(song, contextList = null) {
    const isPlayingThis = window.himstreamxPlayer && window.himstreamxPlayer.currentSong && window.himstreamxPlayer.currentSong.id === song.id;
    const isPlayingState = isPlayingThis && window.himstreamxPlayer.isPlaying;
    const isLiked = window.himstreamxPlayer ? window.himstreamxPlayer.isSongLiked(song.id) : false;

    return `
        <div class="song-card ${isPlayingThis ? 'currently-playing' : ''}" data-song-id="${song.id}" onclick="handleSongCardClick('${song.id}')">
            <div class="song-card-thumb-wrap">
                <img class="song-card-thumb" src="${song.coverImage}" alt="${song.title}" loading="lazy">
                <div class="song-card-overlay">
                    <button class="song-play-btn" title="Play ${song.title}">
                        <i class="fa-solid ${isPlayingState ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                </div>
                <div class="song-equalizer-badge">
                    <span class="eq-bar"></span>
                    <span class="eq-bar"></span>
                    <span class="eq-bar"></span>
                </div>
            </div>
            <div class="song-card-info">
                <h4 class="song-card-title" title="${song.title}">${song.title}</h4>
                <p class="song-card-artist" title="${song.artist}">${song.artist}</p>
                <div class="song-card-meta">
                    <span class="song-lang-badge">${song.language}</span>
                    <span class="song-duration">${song.duration}</span>
                </div>
            </div>
            <div class="song-card-actions" onclick="event.stopPropagation()">
                <button class="song-action-btn ${isLiked ? 'liked' : ''}" title="${isLiked ? 'Unlike' : 'Like'}" onclick="handleSongLikeToggle('${song.id}', this)">
                    <i class="${isLiked ? 'fa-solid text-red' : 'fa-regular'} fa-heart"></i>
                </button>
                <button class="song-action-btn" title="Add to Queue" onclick="handleSongQueueAdd('${song.id}')">
                    <i class="fa-solid fa-list-ul"></i>
                </button>
            </div>
        </div>
    `;
}

function createSongRowHTML(song, index, contextList = null) {
    const isPlayingThis = window.himstreamxPlayer && window.himstreamxPlayer.currentSong && window.himstreamxPlayer.currentSong.id === song.id;
    const isPlayingState = isPlayingThis && window.himstreamxPlayer.isPlaying;
    const isLiked = window.himstreamxPlayer ? window.himstreamxPlayer.isSongLiked(song.id) : false;

    return `
        <div class="song-row-item ${isPlayingThis ? 'currently-playing' : ''}" data-song-id="${song.id}" onclick="handleSongCardClick('${song.id}')">
            <div class="song-row-index">
                ${isPlayingState ? '<div class="row-eq"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></div>' : (index + 1)}
            </div>
            <div class="song-row-main">
                <img class="song-row-thumb" src="${song.coverImage}" alt="${song.title}">
                <div class="song-row-titles">
                    <span class="song-row-title">${song.title}</span>
                    <span class="song-row-artist">${song.artist}</span>
                </div>
            </div>
            <div class="song-row-album">${song.album || 'Single'}</div>
            <div class="song-row-lang"><span class="song-lang-badge">${song.language}</span></div>
            <div class="song-row-duration">${song.duration}</div>
            <div class="song-row-actions" onclick="event.stopPropagation()">
                <button class="song-action-btn ${isLiked ? 'liked' : ''}" title="${isLiked ? 'Unlike' : 'Like'}" onclick="handleSongLikeToggle('${song.id}', this)">
                    <i class="${isLiked ? 'fa-solid text-red' : 'fa-regular'} fa-heart"></i>
                </button>
                <button class="song-action-btn" title="Add to Queue" onclick="handleSongQueueAdd('${song.id}')">
                    <i class="fa-solid fa-list-ul"></i>
                </button>
            </div>
        </div>
    `;
}

// ==========================================================================
// 2. SONG CLICK & PLAYBACK HANDLERS
// ==========================================================================
function handleSongCardClick(songId) {
    const db = window.SONGS_DATABASE || [];
    const song = db.find(s => s.id === songId);
    if (!song) return;

    // Check pre-mapped official YouTube Video ID
    const ytId = (window.SONG_YOUTUBE_MAP && window.SONG_YOUTUBE_MAP[songId]) || song.youtubeId || song.videoId;
    if (ytId && typeof openYouTubePlayerModal === "function") {
        openYouTubePlayerModal(ytId, song.title, song.artist, song.coverImage);
        return;
    }

    // Dynamic internet search & stream for any song
    if (typeof playYouTubeVideoOnline === "function") {
        playYouTubeVideoOnline(`${song.title} ${song.artist}`, song.title, song.artist, song.coverImage);
        return;
    }

    // Fallback to local audio player
    if (window.himstreamxPlayer) {
        if (window.himstreamxPlayer.currentSong && window.himstreamxPlayer.currentSong.id === songId) {
            window.himstreamxPlayer.togglePlayPause();
        } else {
            let contextList = db;
            if (activeMusicFilter && activeMusicFilter !== "all") {
                contextList = filterSongsByTag(activeMusicFilter);
            }
            window.himstreamxPlayer.playSong(song, true, contextList);
        }
    }
}

function handleSongLikeToggle(songId, btnEl) {
    if (window.himstreamxPlayer) {
        window.himstreamxPlayer.toggleLikeSong(songId);
        const isLiked = window.himstreamxPlayer.isSongLiked(songId);
        if (btnEl) {
            btnEl.classList.toggle("liked", isLiked);
            btnEl.innerHTML = `<i class="${isLiked ? 'fa-solid text-red' : 'fa-regular'} fa-heart"></i>`;
        }
    }
}

function handleSongQueueAdd(songId) {
    const db = window.SONGS_DATABASE || [];
    const song = db.find(s => s.id === songId);
    if (song && window.himstreamxPlayer) {
        window.himstreamxPlayer.addToQueue(song);
    }
}

// ==========================================================================
// 3. HOMEPAGE MUSIC ROWS RENDERING
// ==========================================================================
function renderTrendingSongsRow() {
    const container = document.getElementById("trendingSongsCarousel");
    if (!container) return;

    const db = window.SONGS_DATABASE || [];
    const trending = db.filter(s => s.isTrending);
    container.innerHTML = trending.map(song => createSongCardHTML(song, trending)).join("");
}

function renderRecentlyAddedSongsRow() {
    const container = document.getElementById("recentlyAddedSongsCarousel");
    if (!container) return;

    const db = window.SONGS_DATABASE || [];
    const recent = [...db].sort((a, b) => b.year - a.year);
    container.innerHTML = recent.slice(0, 10).map(song => createSongCardHTML(song, recent)).join("");
}

async function renderRecommendedSongsRow() {
    const container = document.getElementById("recommendedSongsCarousel");
    if (!container) return;

    let items = [];
    if (window.himstreamxAPI) {
        try {
            const rec = await window.himstreamxAPI.getMusicRecommendations();
            if (rec && rec.shelves) {
                // Populate Recommended for you
                if (rec.shelves.recommended_for_you) {
                    items = rec.shelves.recommended_for_you.items;
                }

                // Populate Because you listened to
                const becauseContainer = document.getElementById("becauseYouListenedCarousel");
                const becauseTitle = document.getElementById("becauseYouListenedTitle");
                const becauseSubtitle = document.getElementById("becauseYouListenedSubtitle");
                const becauseBadge = document.getElementById("becauseYouListenedBadge");

                if (becauseContainer && rec.shelves.because_you_listened_to) {
                    const shelf = rec.shelves.because_you_listened_to;
                    if (becauseTitle) becauseTitle.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-cyan"></i> Because You Listened To "${shelf.anchor ? shelf.anchor.title : 'Kesariya'}"`;
                    if (becauseSubtitle) becauseSubtitle.textContent = shelf.subtitle;
                    if (becauseBadge && shelf.anchor) becauseBadge.textContent = `${shelf.anchor.artist} • ${shelf.anchor.genre || 'Regional'}`;
                    becauseContainer.innerHTML = shelf.items.map(song => createSongCardHTML(song, shelf.items)).join("");
                }
            }
        } catch (e) {
            console.warn("Failed to load smart recommendations:", e);
        }
    }

    if (!items || items.length === 0) {
        const db = window.SONGS_DATABASE || [];
        items = db.filter(s => s.popularity >= 94);
    }

    container.innerHTML = items.map(song => createSongCardHTML(song, items)).join("");
}

function renderContinueListeningRow() {
    const container = document.getElementById("continueListeningCarousel");
    if (!container) return;

    try {
        const stored = localStorage.getItem("himstreamx_music_history_v2");
        const history = stored ? JSON.parse(stored) : [];
        const db = window.SONGS_DATABASE || [];

        // If history has items, render them; otherwise fallback to top popular tracks
        let displayList = [];
        if (history.length > 0) {
            displayList = history.map(item => db.find(s => s.id === item.id)).filter(Boolean);
        }

        if (displayList.length === 0) {
            displayList = db.slice(0, 5);
        }

        container.innerHTML = displayList.map(song => `
            <div class="continue-listening-card" onclick="handleSongCardClick('${song.id}')">
                <div class="continue-audio-thumb">
                    <img src="${song.coverImage}" alt="${song.title}">
                    <div class="audio-play-badge"><i class="fa-solid fa-play"></i></div>
                </div>
                <div class="continue-audio-info">
                    <h5 class="continue-audio-title">${song.title}</h5>
                    <span class="continue-audio-artist">${song.artist}</span>
                    <span class="continue-audio-tag"><i class="fa-solid fa-headphones"></i> Resume Listening</span>
                </div>
            </div>
        `).join("");
    } catch (e) {
        console.error("Continue listening render error:", e);
    }
}

function handleArtistClick(artistName, searchQuery) {
    const q = searchQuery || `${artistName} songs`;
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = q;

    if (typeof executeFullSearch === "function") {
        executeFullSearch(q);
    } else if (typeof handleUniversalYouTubeSearch === "function") {
        handleUniversalYouTubeSearch(q);
    }
}

function renderPopularArtistsRow() {
    const container = document.getElementById("popularArtistsCarousel");
    if (!container) return;

    const artists = window.POPULAR_ARTISTS || [];
    container.innerHTML = artists.map(artist => `
        <div class="artist-card" onclick="handleArtistClick('${artist.name.replace(/'/g, "\\'")}', '${(artist.searchQuery || artist.name + ' songs').replace(/'/g, "\\'")}')" role="button" tabindex="0">
            <div class="artist-avatar-wrap">
                <img class="artist-avatar" src="${artist.image || artist.avatar}" alt="${artist.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'">
                <div class="artist-play-hover"><i class="fa-solid fa-play"></i></div>
            </div>
            <h4 class="artist-name">${artist.name}</h4>
            <span class="artist-role">${artist.role}</span>
            <span class="artist-listeners"><i class="fa-solid fa-users"></i> ${artist.monthlyListeners}</span>
        </div>
    `).join("");
}

function renderMusicGenresRow() {
    const container = document.getElementById("musicGenresGrid");
    if (!container) return;

    const genres = window.MUSIC_GENRES || [];
    container.innerHTML = genres.map(g => `
        <div class="genre-card" style="background: ${g.color};" onclick="filterMusicByGenre('${g.name}')">
            <div class="genre-card-content">
                <i class="fa-solid ${g.icon} genre-card-icon"></i>
                <h3 class="genre-card-title">${g.name}</h3>
                <span class="genre-card-count">${g.count}</span>
            </div>
        </div>
    `).join("");
}

// ==========================================================================
// 4. DEDICATED MUSIC PAGE / VIEW ENGINE
// ==========================================================================
function initMusicCategories() {
    const pills = document.querySelectorAll(".music-category-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            const filter = pill.getAttribute("data-music-category");
            activeMusicFilter = filter;
            renderDedicatedMusicGrid(filter);

            // Requirement 9: Clicking a category executes a real YouTube search
            const ytQuery = (filter && filter !== "all") ? `${filter} songs` : "trending music";
            if (typeof handleUniversalYouTubeSearch === "function") {
                const searchSec = document.getElementById("searchResultsSection");
                if (searchSec) searchSec.style.display = "block";
                handleUniversalYouTubeSearch(ytQuery);
                const ytSec = document.getElementById("youtubeSearchSection");
                if (ytSec) ytSec.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

function filterSongsByTag(filter) {
    const db = window.SONGS_DATABASE || [];
    if (!filter || filter === "all") return db;

    const f = filter.toLowerCase();

    // Check language matches
    const byLang = db.filter(s => s.language.toLowerCase().includes(f));
    if (byLang.length > 0) return byLang;

    // Check genre matches
    const byGenre = db.filter(s => s.genre.toLowerCase().includes(f));
    if (byGenre.length > 0) return byGenre;

    // Check category matches
    const byCat = db.filter(s => s.category.toLowerCase().includes(f));
    if (byCat.length > 0) return byCat;

    // Check trending
    if (f === "trending") return db.filter(s => s.isTrending);

    return db;
}

function renderDedicatedMusicGrid(filter = "all") {
    const grid = document.getElementById("dedicatedMusicGrid");
    const countLabel = document.getElementById("musicSectionCount");
    const titleLabel = document.getElementById("musicSectionTitle");
    if (!grid) return;

    const songs = filterSongsByTag(filter);

    if (countLabel) countLabel.textContent = `${songs.length} track${songs.length === 1 ? '' : 's'} available`;
    if (titleLabel) {
        titleLabel.textContent = filter === "all" ? "All Tracks & Curated Playlists" : `${filter.toUpperCase()} Hits`;
    }

    if (songs.length === 0) {
        grid.innerHTML = `
            <div class="empty-music-state">
                <i class="fa-solid fa-music"></i>
                <h3>No Tracks Found</h3>
                <p>Try selecting another category or exploring Trending music.</p>
                <button class="btn btn-primary" onclick="filterMusicByCategory('Trending')">Explore Trending Hits</button>
            </div>
        `;
    } else {
        grid.innerHTML = songs.map(song => createSongCardHTML(song, songs)).join("");
    }
}

function filterMusicByCategory(catName) {
    const targetPill = document.querySelector(`.music-category-pill[data-music-category='${catName}']`);
    if (targetPill) {
        targetPill.click();
    } else {
        activeMusicFilter = catName;
        renderDedicatedMusicGrid(catName);
    }

    const musicSection = document.getElementById("musicSection");
    if (musicSection) {
        musicSection.scrollIntoView({ behavior: "smooth" });
    }
}

function filterMusicByGenre(genreName) {
    filterMusicByCategory(genreName);
}

function filterMusicByArtist(artistName) {
    const db = window.SONGS_DATABASE || [];
    const songs = db.filter(s => s.artist.toLowerCase().includes(artistName.toLowerCase()));

    const grid = document.getElementById("dedicatedMusicGrid");
    const titleLabel = document.getElementById("musicSectionTitle");
    const countLabel = document.getElementById("musicSectionCount");

    if (titleLabel) titleLabel.textContent = `Artist Spotlight: ${artistName}`;
    if (countLabel) countLabel.textContent = `${songs.length} hit tracks`;

    if (grid) {
        grid.innerHTML = songs.map(song => createSongCardHTML(song, songs)).join("");
    }

    const musicSection = document.getElementById("musicSection");
    if (musicSection) {
        musicSection.scrollIntoView({ behavior: "smooth" });
    }
}

function initMusicEngine() {
    renderTrendingSongsRow();
    renderRecentlyAddedSongsRow();
    renderRecommendedSongsRow();
    renderContinueListeningRow();
    renderPopularArtistsRow();
    renderMusicGenresRow();
    initMusicCategories();
    renderDedicatedMusicGrid("all");
}

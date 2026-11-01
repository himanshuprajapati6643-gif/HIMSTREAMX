// ==========================================================================
// HIMSTREAMX - MOVIE & WEB SERIES ENGINE
// Developed by Himanshu Prajapati (2026)
// Hero Carousel, Cinema Player, Watchlist & Details Modal
// ==========================================================================

const STORAGE_KEY_WATCHLIST = "himstreamx_watchlist_v2";
let currentHeroSlideIndex = 0;
let heroSlideTimer = null;
let currentActiveMovie = null;
let isHeroMuted = true;

// ==========================================================================
// 1. WATCHLIST LOCAL STORAGE HELPERS
// ==========================================================================
function getWatchlist() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_WATCHLIST);
        return stored ? JSON.parse(stored) : ["stranger-things", "oppenheimer"];
    } catch (e) {
        return ["stranger-things", "oppenheimer"];
    }
}

function saveWatchlist(list) {
    try {
        localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(list));
        updateWatchlistBadges();
        renderWatchlistRow();
    } catch (e) {
        console.error("Failed to save watchlist to localStorage", e);
    }
}

function isInWatchlist(movieId) {
    const list = getWatchlist();
    return list.includes(movieId);
}

function toggleWatchlist(movieId) {
    let list = getWatchlist();
    const movie = (window.MOVIES_DATABASE || []).find(m => m.id === movieId);
    const title = movie ? movie.title : "Title";

    // Sync with backend API if available
    if (window.himstreamxAPI) {
        window.himstreamxAPI.toggleWatchlist(movieId).catch(() => {});
    }

    if (list.includes(movieId)) {
        list = list.filter(id => id !== movieId);
        saveWatchlist(list);
        showToast(`❌ Removed "${title}" from My List`);
        return false;
    } else {
        list.push(movieId);
        saveWatchlist(list);
        showToast(`✅ Added "${title}" to My List`, "success");
        return true;
    }
}

function updateWatchlistBadges() {
    const list = getWatchlist();
    const count = list.length;
    const badge = document.getElementById("watchlistCountBadge");
    const countLabel = document.getElementById("watchlistCountLabel");
    const profileCount = document.getElementById("profileListCount");

    if (badge) badge.textContent = count;
    if (countLabel) countLabel.textContent = `${count} ${count === 1 ? 'title' : 'titles'} saved`;
    if (profileCount) profileCount.textContent = count;
}

function clearFullWatchlist() {
    if (confirm("Are you sure you want to clear your entire HIMSTREAMX watchlist?")) {
        saveWatchlist([]);
        showToast("Watchlist cleared successfully");
    }
}

// ==========================================================================
// 2. TOAST NOTIFICATION ENGINE
// ==========================================================================
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-solid fa-circle-info";
    if (type === "success") iconClass = "fa-solid fa-circle-check";
    if (type === "warning") iconClass = "fa-solid fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="${iconClass} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-exit");
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

// ==========================================================================
// 3. MOVIE CARD GENERATION & RENDERING
// ==========================================================================
function createMovieCardHTML(movie) {
    const inList = isInWatchlist(movie.id);
    const genreStr = movie.genres.slice(0, 2).join(" • ");

    return `
        <div class="movie-card" data-id="${movie.id}" onclick="openDetailsModal('${movie.id}')">
            <img class="card-poster" src="${movie.poster}" alt="${movie.title}" loading="lazy">
            <div class="card-badges">
                <span class="card-badge-rating"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
                <span class="card-badge-quality">${movie.quality && movie.quality.includes('4K') ? '4K' : 'HD'}</span>
            </div>
            <div class="card-overlay">
                <h4 class="card-title">${movie.title}</h4>
                <div class="card-genres">${genreStr}</div>
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="card-btn card-btn-play" title="Play trailer" onclick="playHeroMedia('${movie.id}')">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <button class="card-btn card-btn-sub ${inList ? 'active' : ''}" title="${inList ? 'Remove from list' : 'Add to list'}" onclick="handleCardWatchlistToggle('${movie.id}', this)">
                        <i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <button class="card-btn card-btn-sub" title="More info" onclick="openDetailsModal('${movie.id}')">
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function handleCardWatchlistToggle(movieId, btnElement) {
    const isNowInList = toggleWatchlist(movieId);
    if (btnElement) {
        if (isNowInList) {
            btnElement.classList.add("active");
            btnElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
            btnElement.title = "Remove from list";
        } else {
            btnElement.classList.remove("active");
            btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
            btnElement.title = "Add to list";
        }
    }
}

function renderContinueWatchingRow() {
    const container = document.getElementById("continueCarousel");
    if (!container) return;

    const db = window.MOVIES_DATABASE || [];
    const continueList = [
        { movie: db.find(m => m.id === "stranger-things"), percent: 74, left: "14m left" },
        { movie: db.find(m => m.id === "the-dark-knight"), percent: 45, left: "1h 15m left" },
        { movie: db.find(m => m.id === "breaking-bad"), percent: 90, left: "5m left" },
        { movie: db.find(m => m.id === "wednesday"), percent: 25, left: "38m left" }
    ].filter(item => item.movie);

    container.innerHTML = continueList.map(item => `
        <div class="continue-card" onclick="startPlayback('${item.movie.id}')">
            <div class="continue-thumb">
                <img src="${item.movie.backdrop || item.movie.poster}" alt="${item.movie.title}">
                <div class="continue-play-overlay">
                    <div class="continue-play-circle"><i class="fa-solid fa-play"></i></div>
                </div>
            </div>
            <div class="continue-progress-track">
                <div class="continue-progress-fill" style="width: ${item.percent}%;"></div>
            </div>
            <div class="continue-info">
                <span class="continue-title">${item.movie.title}</span>
                <span class="continue-left">${item.left}</span>
            </div>
        </div>
    `).join("");
}

function renderTop10Row() {
    const container = document.getElementById("top10Carousel");
    if (!container) return;

    const db = window.MOVIES_DATABASE || [];
    const top10Movies = db.filter(m => m.isTop10).sort((a, b) => a.isTop10 - b.isTop10);

    container.innerHTML = top10Movies.map(movie => `
        <div class="top10-card-wrapper">
            <span class="top10-rank-number">${movie.isTop10}</span>
            ${createMovieCardHTML(movie)}
        </div>
    `).join("");
}

function renderCategoryRows() {
    const db = window.MOVIES_DATABASE || [];
    const popularContainer = document.getElementById("popularMoviesCarousel");
    const trendingContainer = document.getElementById("trendingCarousel");
    const tvShowsContainer = document.getElementById("tvShowsCarousel");
    const sciFiContainer = document.getElementById("sciFiCarousel");
    const topRatedContainer = document.getElementById("topRatedCarousel");
    const latestContainer = document.getElementById("latestMoviesCarousel");

    // Popular Movies
    if (popularContainer) {
        const popular = db.filter(m => m.type === "movie" && m.isPopular);
        popularContainer.innerHTML = popular.map(createMovieCardHTML).join("");
    }

    // Latest Movies (2023 - 2024)
    if (latestContainer) {
        const latest = db.filter(m => m.year >= 2023).sort((a, b) => b.year - a.year);
        latestContainer.innerHTML = latest.map(createMovieCardHTML).join("");
    }

    // Trending
    if (trendingContainer) {
        const trending = db.filter(m => m.isTrending);
        trendingContainer.innerHTML = trending.map(createMovieCardHTML).join("");
    }

    // TV Shows & Web Series
    if (tvShowsContainer) {
        const series = db.filter(m => m.type === "series");
        tvShowsContainer.innerHTML = series.map(createMovieCardHTML).join("");
    }

    // Sci-Fi
    if (sciFiContainer) {
        const scifi = db.filter(m => m.genres && m.genres.includes("Sci-Fi"));
        sciFiContainer.innerHTML = scifi.map(createMovieCardHTML).join("");
    }

    // Top Rated (IMDb >= 8.7)
    if (topRatedContainer) {
        const topRated = db.filter(m => m.rating >= 8.7).sort((a, b) => b.rating - a.rating);
        topRatedContainer.innerHTML = topRated.map(createMovieCardHTML).join("");
    }

    // Smart Movie Recommendations (Because You Watched)
    const becauseContainer = document.getElementById("becauseYouWatchedCarousel");
    if (becauseContainer && window.himstreamxAPI) {
        window.himstreamxAPI.getMovieRecommendations().then(rec => {
            if (rec && rec.shelves && rec.shelves.because_you_watched) {
                const shelf = rec.shelves.because_you_watched;
                const becauseTitle = document.getElementById("becauseYouWatchedTitle");
                const becauseSubtitle = document.getElementById("becauseYouWatchedSubtitle");
                const becauseBadge = document.getElementById("becauseYouWatchedBadge");
                if (becauseTitle) becauseTitle.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-cyan"></i> Because You Watched "${shelf.anchor ? shelf.anchor.title : 'Stranger Things'}"`;
                if (becauseSubtitle) becauseSubtitle.textContent = shelf.subtitle;
                if (becauseBadge && shelf.anchor) becauseBadge.textContent = shelf.anchor.title;
                becauseContainer.innerHTML = shelf.items.map(createMovieCardHTML).join("");
            }
        }).catch(() => {});
    }
}

function renderWatchlistRow() {
    const grid = document.getElementById("watchlistGrid");
    if (!grid) return;

    const listIds = getWatchlist();
    const db = window.MOVIES_DATABASE || [];
    const watchlistMovies = db.filter(m => listIds.includes(m.id));

    if (watchlistMovies.length === 0) {
        grid.innerHTML = `
            <div class="empty-watchlist-box">
                <i class="fa-regular fa-bookmark empty-icon"></i>
                <h3>Your Watchlist is Empty</h3>
                <p>Explore popular movies and web series to add titles you want to watch later.</p>
                <button class="btn btn-primary" onclick="window.location.hash = '#trending'">Browse Trending Now</button>
            </div>
        `;
    } else {
        grid.innerHTML = watchlistMovies.map(createMovieCardHTML).join("");
    }
}

function scrollCarousel(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

// ==========================================================================
// 4. HERO CAROUSEL CONTROLLER
// ==========================================================================
function initHeroCarousel() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dots .dot");
    const prevBtn = document.getElementById("heroPrevBtn");
    const nextBtn = document.getElementById("heroNextBtn");
    const totalSlides = slides.length;

    if (!totalSlides) return;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove("active"));
        dots.forEach(d => d.classList.remove("active"));

        currentHeroSlideIndex = (index + totalSlides) % totalSlides;

        slides[currentHeroSlideIndex].classList.add("active");
        if (dots[currentHeroSlideIndex]) {
            dots[currentHeroSlideIndex].classList.add("active");
        }
    }

    function nextSlide() {
        goToSlide(currentHeroSlideIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentHeroSlideIndex - 1);
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => goToSlide(idx));
    });

    function startTimer() {
        heroSlideTimer = setInterval(nextSlide, 7000);
    }

    function stopTimer() {
        clearInterval(heroSlideTimer);
    }

    const heroSection = document.querySelector(".hero-carousel");
    if (heroSection) {
        heroSection.addEventListener("mouseenter", stopTimer);
        heroSection.addEventListener("mouseleave", startTimer);
    }

    startTimer();
}

function playHeroMedia(movieId) {
    startPlayback(movieId);
}

function toggleHeroWatchlist(movieId, btnElement) {
    const isNowInList = toggleWatchlist(movieId);
    if (btnElement) {
        if (isNowInList) {
            btnElement.classList.add("in-list");
            btnElement.innerHTML = `<i class="fa-solid fa-check"></i> In Watchlist`;
        } else {
            btnElement.classList.remove("in-list");
            btnElement.innerHTML = `<i class="fa-solid fa-plus"></i> My List`;
        }
    }
}

// ==========================================================================
// 5. RICH MOVIE DETAILS & TRAILER MODAL
// ==========================================================================
function openDetailsModal(movieId) {
    const db = window.MOVIES_DATABASE || [];
    const movie = db.find(m => m.id === movieId);
    if (!movie) return;

    currentActiveMovie = movie;
    const modal = document.getElementById("movieModal");

    const title = document.getElementById("modalTitle");
    const matchScore = document.getElementById("modalMatchScore");
    const year = document.getElementById("modalYear");
    const age = document.getElementById("modalAge");
    const duration = document.getElementById("modalDuration");
    const quality = document.getElementById("modalQuality");
    const rating = document.getElementById("modalRating");
    const desc = document.getElementById("modalDescription");
    const genres = document.getElementById("modalGenres");
    const director = document.getElementById("modalDirector");
    const cast = document.getElementById("modalCast");
    const videoContainer = document.getElementById("modalVideoContainer");
    const episodesTabBtn = document.getElementById("modalEpisodesTabBtn");
    const watchlistBtn = document.getElementById("modalWatchlistBtn");
    const playBtn = document.getElementById("modalPlayBtn");

    if (title) title.textContent = movie.title;
    if (matchScore) matchScore.textContent = `${movie.match || 98}% Match`;
    if (year) year.textContent = movie.year;
    if (age) age.textContent = movie.age;
    if (duration) duration.textContent = movie.duration;
    if (quality) quality.textContent = movie.quality;
    if (rating) rating.innerHTML = `<i class="fa-solid fa-star"></i> ${movie.rating}`;
    if (desc) desc.textContent = movie.description;
    if (genres) genres.textContent = movie.genres.join(", ");
    if (director) director.textContent = movie.director || "HIMSTREAMX Studios";
    if (cast) cast.textContent = movie.cast ? movie.cast.join(", ") : "Featured Ensemble";

    // Watchlist button state
    const inList = isInWatchlist(movie.id);
    if (watchlistBtn) {
        if (inList) {
            watchlistBtn.classList.add("active");
            watchlistBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
            watchlistBtn.title = "Remove from list";
        } else {
            watchlistBtn.classList.remove("active");
            watchlistBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
            watchlistBtn.title = "Add to list";
        }
        watchlistBtn.onclick = () => {
            const nowInList = toggleWatchlist(movie.id);
            if (nowInList) {
                watchlistBtn.classList.add("active");
                watchlistBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
            } else {
                watchlistBtn.classList.remove("active");
                watchlistBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
            }
        };
    }

    if (playBtn) {
        playBtn.onclick = () => {
            closeDetailsModal();
            startPlayback(movie.id);
        };
    }

    // Embed YouTube trailer with strict origin & referrer configuration
    if (videoContainer) {
        const pageOrigin = (window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("file:"))
            ? window.location.origin
            : "http://localhost:8000";

        videoContainer.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&mute=0&rel=0&controls=1&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(pageOrigin)}"
                title="${movie.title} Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>
        `;
    }

    // Episodes tab visibility & population
    if (movie.type === "series" && movie.episodes && movie.episodes.length > 0) {
        if (episodesTabBtn) episodesTabBtn.style.display = "block";
        const episodesContainer = document.getElementById("episodesListContainer");
        if (episodesContainer) {
            episodesContainer.innerHTML = movie.episodes.map(ep => `
                <div class="episode-item" onclick="startPlayback('${movie.id}', ${ep.num})">
                    <div class="episode-thumb-wrap">
                        <img src="${movie.backdrop || movie.poster}" alt="Episode ${ep.num}">
                        <div class="episode-play-icon"><i class="fa-solid fa-play"></i></div>
                    </div>
                    <div class="episode-info">
                        <div class="episode-title-row">
                            <span class="episode-title">${ep.num}. ${ep.title}</span>
                            <span class="episode-duration">${ep.duration}</span>
                        </div>
                        <p class="episode-desc">${ep.desc}</p>
                    </div>
                </div>
            `).join("");
        }
    } else {
        if (episodesTabBtn) episodesTabBtn.style.display = "none";
    }

    // Populate Cast Grid
    const castGrid = document.getElementById("modalCastGrid");
    if (castGrid && movie.cast) {
        castGrid.innerHTML = movie.cast.map(actor => `
            <div class="cast-card">
                <img class="cast-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="${actor}">
                <div class="cast-name">${actor}</div>
                <div class="cast-role">Lead Cast</div>
            </div>
        `).join("");
    }

    // Populate Similar Movies
    const similarGrid = document.getElementById("modalSimilarGrid");
    if (similarGrid) {
        const similar = db.filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g))).slice(0, 4);
        similarGrid.innerHTML = similar.map(createMovieCardHTML).join("");
    }

    // Reset Tabs to Overview
    document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    const overviewTab = document.querySelector(".modal-tab[data-tab='overview']");
    const overviewPane = document.getElementById("tabOverview");
    if (overviewTab) overviewTab.classList.add("active");
    if (overviewPane) overviewPane.classList.add("active");

    if (modal) modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeDetailsModal() {
    const modal = document.getElementById("movieModal");
    const videoContainer = document.getElementById("modalVideoContainer");

    if (modal) modal.classList.remove("open");
    if (videoContainer) videoContainer.innerHTML = "";
    document.body.style.overflow = "";
}

function initModalHandlers() {
    const closeBtn = document.getElementById("closeModal");
    const backdrop = document.getElementById("modalBackdrop");
    const shareBtn = document.getElementById("modalShareBtn");
    const likeBtn = document.getElementById("modalLikeBtn");

    if (closeBtn) closeBtn.addEventListener("click", closeDetailsModal);
    if (backdrop) backdrop.addEventListener("click", closeDetailsModal);

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast("🔗 Link copied to clipboard!", "success");
                });
            } else {
                showToast("🔗 Title link ready to share!");
            }
        });
    }

    if (likeBtn) {
        likeBtn.addEventListener("click", () => {
            likeBtn.classList.toggle("active");
            if (likeBtn.classList.contains("active")) {
                likeBtn.innerHTML = `<i class="fa-solid fa-thumbs-up"></i>`;
                showToast("👍 Added to your liked titles!", "success");
            } else {
                likeBtn.innerHTML = `<i class="fa-regular fa-thumbs-up"></i>`;
            }
        });
    }

    const tabs = document.querySelectorAll(".modal-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            const pane = document.getElementById("tab" + target.charAt(0).toUpperCase() + target.slice(1));
            if (pane) pane.classList.add("active");
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDetailsModal();
            closeCinemaPlayer();
        }
    });
}

// ==========================================================================
// 6. FULLSCREEN CINEMA PLAYER SIMULATION
// ==========================================================================
function startPlayback(movieId, episodeNum = 1) {
    const db = window.MOVIES_DATABASE || [];
    const movie = db.find(m => m.id === movieId);
    if (!movie) return;

    // Sync watch history to backend API
    if (window.himstreamxAPI) {
        window.himstreamxAPI.recordWatchProgress(movieId, 45, 900).catch(() => {});
    }

    const title = movie.title + (movie.type === "series" ? ` (S1:E${episodeNum})` : "");
    const channel = (movie.director || "HIMSTREAMX Cinema") + " • " + (movie.quality || "4K UHD");

    // Seamlessly stream via Official YouTube Video Player Modal
    if (typeof openYouTubePlayerModal === "function" && movie.trailerId) {
        openYouTubePlayerModal(movie.trailerId, title, channel, movie.backdrop || movie.poster);
        if (typeof showToast === "function") {
            showToast(`▶ Now Streaming: ${title} in 4K UHD`, "success");
        }
        return;
    }

    // Pause music player if currently playing
    if (window.himstreamxPlayer && window.himstreamxPlayer.isPlaying) {
        window.himstreamxPlayer.togglePlayPause();
    }

    const playerModal = document.getElementById("cinemaPlayerModal");
    const playerTitle = document.getElementById("cinemaPlayerTitle");
    const playerSub = document.getElementById("cinemaPlayerSubtitle");
    const videoScreen = document.getElementById("cinemaVideoScreen");

    if (playerTitle) playerTitle.textContent = movie.title;
    if (playerSub) {
        if (movie.type === "series") {
            playerSub.textContent = `S1:E${episodeNum} • Ultra HD 4K`;
        } else {
            playerSub.textContent = `${movie.year} • ${movie.duration} • Dolby Atmos 5.1`;
        }
    }

    if (videoScreen) {
        const pageOrigin = (window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("file:"))
            ? window.location.origin
            : "http://localhost:8000";

        videoScreen.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(pageOrigin)}"
                title="${movie.title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>
        `;
    }

    if (playerModal) playerModal.classList.add("active");
    document.body.style.overflow = "hidden";
    showToast(`▶ Now Streaming: ${movie.title} in 4K UHD`, "success");
}

function closeCinemaPlayer() {
    const playerModal = document.getElementById("cinemaPlayerModal");
    const videoScreen = document.getElementById("cinemaVideoScreen");

    if (playerModal) playerModal.classList.remove("active");
    if (videoScreen) videoScreen.innerHTML = "";
    document.body.style.overflow = "";
}

function initCinemaPlayerControls() {
    const backBtn = document.getElementById("cinemaBackBtn");
    const playPauseBtn = document.getElementById("cinemaPlayPauseBtn");
    const rewindBtn = document.getElementById("cinemaRewindBtn");
    const forwardBtn = document.getElementById("cinemaForwardBtn");
    const volumeBtn = document.getElementById("cinemaVolumeBtn");
    const speedBtn = document.getElementById("cinemaSpeedBtn");
    const fullscreenBtn = document.getElementById("cinemaFullscreenBtn");
    const speedLabel = document.getElementById("speedLabel");

    if (backBtn) backBtn.addEventListener("click", closeCinemaPlayer);

    if (playPauseBtn) {
        playPauseBtn.addEventListener("click", () => {
            const icon = document.getElementById("cinemaPlayIcon");
            if (icon.classList.contains("fa-play")) {
                icon.className = "fa-solid fa-pause";
                showToast("Playback Resumed");
            } else {
                icon.className = "fa-solid fa-play";
                showToast("Playback Paused");
            }
        });
    }

    if (rewindBtn) {
        rewindBtn.addEventListener("click", () => {
            showToast("⏪ Rewound 10 seconds");
        });
    }

    if (forwardBtn) {
        forwardBtn.addEventListener("click", () => {
            showToast("⏩ Skipped 10 seconds");
        });
    }

    if (volumeBtn) {
        volumeBtn.addEventListener("click", () => {
            const icon = document.getElementById("cinemaVolumeIcon");
            if (icon.classList.contains("fa-volume-high")) {
                icon.className = "fa-solid fa-volume-xmark";
                showToast("🔇 Audio Muted");
            } else {
                icon.className = "fa-solid fa-volume-high";
                showToast("🔊 Audio Unmuted");
            }
        });
    }

    let speeds = ["1.0x", "1.25x", "1.5x", "2.0x"];
    let speedIndex = 0;
    if (speedBtn) {
        speedBtn.addEventListener("click", () => {
            speedIndex = (speedIndex + 1) % speeds.length;
            if (speedLabel) speedLabel.textContent = speeds[speedIndex];
            showToast(`Playback Speed: ${speeds[speedIndex]}`);
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });
    }
}

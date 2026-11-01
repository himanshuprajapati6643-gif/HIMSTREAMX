// ==========================================================================
// HIMSTREAMX - UNIVERSAL SEARCH ENGINE (MOVIES + MUSIC)
// Developed by Himanshu Prajapati (2026)
// Real-Time Suggestions, Multi-Facet Filters & Sorting
// ==========================================================================

let activeSearchFilterType = "all"; // 'all', 'movies', 'music'
let activeSearchSort = "popularity"; // 'popularity', 'newest', 'title'
let currentSearchQuery = "";

function initSearchEngine() {
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const suggestionsBox = document.getElementById("searchSuggestions");
    const suggestionsList = document.getElementById("suggestionsList");
    const suggestionCount = document.getElementById("suggestionCount");

    const searchSection = document.getElementById("searchResultsSection");
    const searchTitle = document.getElementById("searchResultsTitle");
    const searchCount = document.getElementById("searchResultsCount");
    const resetFilterBtn = document.getElementById("resetSearchFilterBtn");

    if (!searchInput) return;

    let searchDebounceTimer = null;

    function handleSearchInput() {
        const query = searchInput.value.trim();
        currentSearchQuery = query;

        if (query.length > 0) {
            if (clearBtn) clearBtn.style.display = "block";
        } else {
            if (clearBtn) clearBtn.style.display = "none";
            if (suggestionsBox) suggestionsBox.classList.remove("active");
            return;
        }

        const safeQuery = query.replace(/"/g, '&quot;');
        const queryLower = query.toLowerCase();

        const moviesDb = window.MOVIES_DATABASE || [];
        const songsDb = window.SONGS_DATABASE || [];

        // Match Movies
        const matchingMovies = moviesDb.filter(m => {
            const titleMatch = m.title.toLowerCase().includes(queryLower);
            const genreMatch = m.genres && m.genres.some(g => g.toLowerCase().includes(queryLower));
            const castMatch = m.cast && m.cast.some(c => c.toLowerCase().includes(queryLower));
            const directorMatch = m.director && m.director.toLowerCase().includes(queryLower);
            return titleMatch || genreMatch || castMatch || directorMatch;
        });

        // Match Songs
        const matchingSongs = songsDb.filter(s => {
            const titleMatch = s.title.toLowerCase().includes(queryLower);
            const artistMatch = s.artist.toLowerCase().includes(queryLower);
            const albumMatch = s.album && s.album.toLowerCase().includes(queryLower);
            const langMatch = s.language.toLowerCase().includes(queryLower);
            const genreMatch = s.genre.toLowerCase().includes(queryLower);
            return titleMatch || artistMatch || albumMatch || langMatch || genreMatch;
        });

        if (suggestionsBox && suggestionsList) {
            suggestionsBox.classList.add("active");
            if (suggestionCount) suggestionCount.textContent = `YouTube Online Search`;

            let html = `
                <div class="suggestion-item search-online-highlight" onclick="executeFullSearch('${safeQuery}')" style="background: rgba(229, 9, 20, 0.15); border-left: 3px solid #e50914; cursor: pointer;">
                    <div style="font-size: 1.3rem; color: #e50914; margin-right: 4px;"><i class="fa-brands fa-youtube"></i></div>
                    <div class="suggestion-info">
                        <h5 style="color: #fff; font-weight: 700;">Search online for "<strong>${safeQuery}</strong>"</h5>
                        <div class="suggestion-meta">
                            <span class="badge-tag gold">YouTube Video & Audio</span>
                            <span>•</span>
                            <span>Press Enter or Click</span>
                        </div>
                    </div>
                    <button class="suggestion-play-btn" title="Search" style="background: #e50914; color: #fff;">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            `;

            // Matching songs with video playback
            if (matchingSongs.length > 0) {
                html += `
                    <div class="suggestion-group-label">
                        <i class="fa-solid fa-music"></i> Catalog Songs (${matchingSongs.length})
                    </div>
                `;
                html += matchingSongs.slice(0, 3).map(s => `
                    <div class="suggestion-item song-suggestion" onclick="handleSongCardClick('${s.id}')">
                        <img class="suggestion-thumb" src="${s.coverImage}" alt="${s.title}">
                        <div class="suggestion-info">
                            <h5>${s.title}</h5>
                            <div class="suggestion-meta">
                                <span class="badge-tag">${s.language}</span>
                                <span>•</span>
                                <span>${s.artist}</span>
                            </div>
                        </div>
                        <button class="suggestion-play-btn" title="Play Video">
                            <i class="fa-solid fa-play"></i>
                        </button>
                    </div>
                `).join("");
            }

            // Matching movies
            if (matchingMovies.length > 0) {
                html += `
                    <div class="suggestion-group-label">
                        <i class="fa-solid fa-film"></i> Movies & TV Series (${matchingMovies.length})
                    </div>
                `;
                html += matchingMovies.slice(0, 3).map(m => `
                    <div class="suggestion-item movie-suggestion" onclick="openDetailsModal('${m.id}')">
                        <img class="suggestion-thumb" src="${m.poster}" alt="${m.title}">
                        <div class="suggestion-info">
                            <h5>${m.title}</h5>
                            <div class="suggestion-meta">
                                <span class="rating"><i class="fa-solid fa-star"></i> ${m.rating}</span>
                                <span>•</span>
                                <span>${m.year}</span>
                            </div>
                        </div>
                        <span class="suggestion-badge-quality">${m.quality && m.quality.includes('4K') ? '4K' : 'HD'}</span>
                    </div>
                `).join("");
            }

            // Live YouTube Search Container
            html += `<div id="liveYTSuggestionsContainer"></div>`;

            html += `
                <div class="suggestion-footer" onclick="executeFullSearch('${safeQuery}')">
                    <span>View all online YouTube results for "${safeQuery}" <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            `;

            suggestionsList.innerHTML = html;

            // Live debounced fetch from official YouTube Data API
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(async () => {
                const liveContainer = document.getElementById("liveYTSuggestionsContainer");
                if (!liveContainer || searchInput.value.trim() !== query) return;

                try {
                    const params = new URLSearchParams({ q: query, limit: 3 }).toString();
                    const fetchRes = await fetch(`/api/youtube/search?${params}`);
                    const data = await fetchRes.json();

                    if (data && data.data && data.data.length > 0 && searchInput.value.trim() === query) {
                        const ytItems = data.data;
                        liveContainer.innerHTML = `
                            <div class="suggestion-group-label" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
                                <i class="fa-brands fa-youtube text-red"></i> Online YouTube Video Results
                            </div>
                            ${ytItems.map(item => `
                                <div class="suggestion-item" onclick="openYouTubePlayerModal('${item.videoId}', '${(item.title || '').replace(/'/g, "\'").replace(/"/g, '&quot;')}', '${(item.channelTitle || '').replace(/'/g, "\'").replace(/"/g, '&quot;')}', '${item.thumbnail}')" style="cursor: pointer;">
                                    <img class="suggestion-thumb" src="${item.thumbnail}" alt="${item.title}" style="border-radius: 4px;">
                                    <div class="suggestion-info">
                                        <h5 title="${item.title}">${item.title}</h5>
                                        <div class="suggestion-meta">
                                            <span style="color: var(--cyan);"><i class="fa-solid fa-circle-check"></i> ${item.channelTitle}</span>
                                        </div>
                                    </div>
                                    <button class="suggestion-play-btn" title="Stream Video">
                                        <i class="fa-solid fa-play"></i>
                                    </button>
                                </div>
                            `).join("")}
                        `;
                    }
                } catch (e) {}
            }, 300);
        }
    }

    searchInput.addEventListener("input", handleSearchInput);

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            executeFullSearch(searchInput.value.trim());
        }
        if (e.key === "Escape") {
            if (suggestionsBox) suggestionsBox.classList.remove("active");
            searchInput.blur();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearBtn.style.display = "none";
            if (suggestionsBox) suggestionsBox.classList.remove("active");
            if (searchSection) searchSection.style.display = "none";
            searchInput.focus();
        });
    }

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            searchInput.value = "";
            if (clearBtn) clearBtn.style.display = "none";
            if (searchSection) searchSection.style.display = "none";
            document.querySelectorAll(".genre-pill").forEach(p => p.classList.remove("active"));
            const allPill = document.querySelector(".genre-pill[data-genre='all']");
            if (allPill) allPill.classList.add("active");
        });
    }

    // Keyboard shortcut '/' to focus search
    document.addEventListener("keydown", (e) => {
        if (e.key === "/" && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#searchWrapper") && suggestionsBox) {
            suggestionsBox.classList.remove("active");
        }
    });
}

function executeFullSearch(query) {
    const suggestionsBox = document.getElementById("searchSuggestions");
    if (suggestionsBox) suggestionsBox.classList.remove("active");

    if (!query || !query.trim()) {
        if (typeof clearYouTubeSearchAndShowHome === "function") {
            clearYouTubeSearchAndShowHome();
        }
        return;
    }

    currentSearchQuery = query.trim();

    // Trigger YouTube official universal media search directly
    if (typeof handleUniversalYouTubeSearch === "function") {
        handleUniversalYouTubeSearch(currentSearchQuery);
    }
}

function renderFullSearchResults() {
    const query = currentSearchQuery.toLowerCase();
    const searchTitle = document.getElementById("searchResultsTitle");
    const searchCount = document.getElementById("searchResultsCount");
    const moviesGrid = document.getElementById("searchResultsGrid");
    const songsGrid = document.getElementById("searchSongsResultsGrid");
    const moviesWrap = document.getElementById("searchMoviesWrap");
    const songsWrap = document.getElementById("searchSongsWrap");

    const moviesDb = window.MOVIES_DATABASE || [];
    const songsDb = window.SONGS_DATABASE || [];

    // Filter Movies
    let matchesMovies = moviesDb.filter(m => {
        const titleMatch = m.title.toLowerCase().includes(query);
        const genreMatch = m.genres && m.genres.some(g => g.toLowerCase().includes(query));
        const castMatch = m.cast && m.cast.some(c => c.toLowerCase().includes(query));
        const directorMatch = m.director && m.director.toLowerCase().includes(query);
        return titleMatch || genreMatch || castMatch || directorMatch;
    });

    // Filter Songs
    let matchesSongs = songsDb.filter(s => {
        const titleMatch = s.title.toLowerCase().includes(query);
        const artistMatch = s.artist.toLowerCase().includes(query);
        const albumMatch = s.album && s.album.toLowerCase().includes(query);
        const langMatch = s.language.toLowerCase().includes(query);
        const genreMatch = s.genre.toLowerCase().includes(query);
        return titleMatch || artistMatch || albumMatch || langMatch || genreMatch;
    });

    // Apply Sorting
    if (activeSearchSort === "popularity") {
        matchesMovies.sort((a, b) => b.rating - a.rating);
        matchesSongs.sort((a, b) => b.popularity - a.popularity);
    } else if (activeSearchSort === "newest") {
        matchesMovies.sort((a, b) => b.year - a.year);
        matchesSongs.sort((a, b) => b.year - a.year);
    } else if (activeSearchSort === "title") {
        matchesMovies.sort((a, b) => a.title.localeCompare(b.title));
        matchesSongs.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (searchTitle) searchTitle.textContent = `Search: "${currentSearchQuery}"`;
    const totalFound = matchesMovies.length + matchesSongs.length;
    if (searchCount) searchCount.textContent = `${totalFound} total results (${matchesMovies.length} movies, ${matchesSongs.length} songs)`;

    // Check empty state
    if (totalFound === 0) {
        if (moviesWrap) moviesWrap.style.display = "none";
        if (songsWrap) songsWrap.style.display = "none";
        if (moviesGrid) {
            moviesGrid.parentElement.innerHTML = `
                <div class="empty-search-state">
                    <i class="fa-solid fa-magnifying-glass empty-icon"></i>
                    <h3>No Titles or Songs Found for "${currentSearchQuery}"</h3>
                    <p>Try searching with another keyword, artist name, language, or genre like "Lo-fi", "Action", or "Bhojpuri".</p>
                    <button class="btn btn-primary" onclick="clearSearchAndShowAll()">Clear Search</button>
                </div>
            `;
        }
        return;
    }

    // Render Movies
    if (moviesWrap) {
        if (activeSearchFilterType === "music") {
            moviesWrap.style.display = "none";
        } else {
            moviesWrap.style.display = matchesMovies.length > 0 ? "block" : "none";
            if (moviesGrid) {
                moviesGrid.innerHTML = matchesMovies.map(createMovieCardHTML).join("");
            }
        }
    }

    // Render Songs
    if (songsWrap) {
        if (activeSearchFilterType === "movies") {
            songsWrap.style.display = "none";
        } else {
            songsWrap.style.display = matchesSongs.length > 0 ? "block" : "none";
            if (songsGrid) {
                songsGrid.innerHTML = matchesSongs.map(song => createSongCardHTML(song, matchesSongs)).join("");
            }
        }
    }
}

function setSearchTypeFilter(type) {
    activeSearchFilterType = type;
    document.querySelectorAll(".search-tab-pill").forEach(pill => {
        pill.classList.toggle("active", pill.getAttribute("data-tab") === type);
    });
    renderFullSearchResults();
}

function setSearchSort(sort) {
    activeSearchSort = sort;
    renderFullSearchResults();
}

function clearSearchAndShowAll() {
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const searchSection = document.getElementById("searchResultsSection");

    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    if (searchSection) searchSection.style.display = "none";
}

// Genre Pills on Top Bar
function initGenrePills() {
    const pills = document.querySelectorAll(".genre-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            const genre = pill.getAttribute("data-genre");
            const searchSection = document.getElementById("searchResultsSection");
            const searchTitle = document.getElementById("searchResultsTitle");
            const searchCount = document.getElementById("searchResultsCount");
            const moviesGrid = document.getElementById("searchResultsGrid");
            const songsWrap = document.getElementById("searchSongsWrap");

            if (genre === "all") {
                if (searchSection) searchSection.style.display = "none";
                return;
            }

            const moviesDb = window.MOVIES_DATABASE || [];
            const matches = moviesDb.filter(m => m.genres && m.genres.includes(genre));

            if (searchSection) searchSection.style.display = "block";
            if (searchTitle) searchTitle.textContent = `${genre} Movies & Series`;
            if (searchCount) searchCount.textContent = `${matches.length} titles in catalog`;
            if (songsWrap) songsWrap.style.display = "none";

            if (moviesGrid) {
                moviesGrid.innerHTML = matches.map(createMovieCardHTML).join("");
            }

            searchSection.scrollIntoView({ behavior: "smooth" });
        });
    });
}

function filterByGenrePill(genreName) {
    const pill = document.querySelector(`.genre-pill[data-genre='${genreName}']`);
    if (pill) {
        pill.click();
    }
}

function filterByViewAll(type) {
    const searchSection = document.getElementById("searchResultsSection");
    const searchTitle = document.getElementById("searchResultsTitle");
    const searchCount = document.getElementById("searchResultsCount");
    const moviesGrid = document.getElementById("searchResultsGrid");
    const songsWrap = document.getElementById("searchSongsWrap");

    const db = window.MOVIES_DATABASE || [];
    let matches = [];

    if (type === "movie") {
        matches = db.filter(m => m.type === "movie");
        if (searchTitle) searchTitle.textContent = "All Blockbuster Movies";
    } else if (type === "series") {
        matches = db.filter(m => m.type === "series");
        if (searchTitle) searchTitle.textContent = "All TV Shows & Web Series";
    } else if (type === "trending") {
        matches = db.filter(m => m.isTrending);
        if (searchTitle) searchTitle.textContent = "Trending Worldwide";
    }

    if (searchSection) searchSection.style.display = "block";
    if (songsWrap) songsWrap.style.display = "none";
    if (searchCount) searchCount.textContent = `${matches.length} titles`;
    if (moviesGrid) moviesGrid.innerHTML = matches.map(createMovieCardHTML).join("");
    searchSection.scrollIntoView({ behavior: "smooth" });
}

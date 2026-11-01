// ==========================================================================
// HIMSTREAMX - FULL-STACK CLIENT API SERVICE
// Developed by Himanshu Prajapati (2026)
// Seamless REST Integration with SQLite Backend & Resilient Offline Fallback
// ==========================================================================

class HimstreamxAPI {
    constructor() {
        this.TOKEN_KEY = "himstreamx_jwt_token_v2";
        this.USER_KEY = "himstreamx_cached_user_v2";

        // Determine API Host
        const isLocalHttp = window.location.protocol.startsWith("http") && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        this.baseUrl = isLocalHttp ? window.location.origin : "http://localhost:8000";
        this.isBackendAvailable = isLocalHttp;

        this.healthPromise = this.checkBackendHealth();
    }

    async ensureBackend() {
        if (this.healthPromise) {
            try {
                await this.healthPromise;
            } catch (_) {}
        }
        return this.isBackendAvailable;
    }

    async checkBackendHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${this.baseUrl}/api/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                this.isBackendAvailable = true;
                console.log(` Connected to HIMSTREAMX Backend: ${data.platform} (${data.database})`);
                this.updateBackendStatusBadge(true);
                return true;
            }
        } catch (e) {
            this.isBackendAvailable = false;
            console.log("ℹ HIMSTREAMX Backend is offline or not started. Running in Client Mode with Local Storage persistence.");
            this.updateBackendStatusBadge(false);
            return false;
        }
    }

    updateBackendStatusBadge(isOnline) {
        const pill = document.getElementById("backendStatusPill");
        if (pill) {
            pill.className = `backend-status-pill ${isOnline ? 'online' : 'offline'}`;
            const text = pill.querySelector(".status-text");
            if (text) text.textContent = isOnline ? "Backend Online" : "Local Mode";
            pill.title = isOnline ? "Connected to FastAPI + SQLite Backend on localhost:8000" : "Offline - Running on frontend with localStorage persistence";
        }

        let badge = document.getElementById("backendStatusIndicator");
        if (!badge) {
            badge = document.createElement("div");
            badge.id = "backendStatusIndicator";
            badge.className = `backend-status-badge ${isOnline ? 'online' : 'offline'}`;
            document.body.appendChild(badge);
        } else {
            badge.className = `backend-status-badge ${isOnline ? 'online' : 'offline'}`;
        }

        badge.innerHTML = isOnline
            ? `<span class="status-dot green"></span> REST API Online`
            : `<span class="status-dot yellow"></span> Local Mode`;
        badge.title = isOnline ? "Connected to FastAPI + SQLite Backend on localhost:8000" : "Running on frontend with localStorage persistence";
    }

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    setToken(token) {
        if (token) {
            localStorage.setItem(this.TOKEN_KEY, token);
        } else {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }

    getCachedUser() {
        try {
            const stored = localStorage.getItem(this.USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    setCachedUser(user) {
        if (user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.USER_KEY);
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const res = await fetch(url, { ...options, headers });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || data.error || `HTTP error ${res.status}`);
            }
            return data;
        } catch (err) {
            throw err;
        }
    }

    // ======================================================================
    // 1. AUTHENTICATION & SESSIONS
    // ======================================================================
    async signup(name, email, password) {
        if (this.isBackendAvailable) {
            const res = await this.request("/api/auth/signup", {
                method: "POST",
                body: JSON.stringify({ name, email, password })
            });
            if (res.access_token) {
                this.setToken(res.access_token);
                this.setCachedUser(res.user);
            }
            return res;
        } else {
            // Local fallback simulation
            const user = {
                id: "usr-" + Date.now(),
                name,
                email,
                role: "USER",
                avatar: name.substring(0, 2).toUpperCase(),
                plan: "Standard 4K + Music Pass"
            };
            this.setToken("local_token_" + Date.now());
            this.setCachedUser(user);
            return { success: true, user, message: "Registered locally." };
        }
    }

    async login(email, password) {
        if (this.isBackendAvailable) {
            const res = await this.request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            if (res.access_token) {
                this.setToken(res.access_token);
                this.setCachedUser(res.user);
            }
            return res;
        } else {
            // Local fallback
            const role = (email.toLowerCase().includes("himanshu") || email.toLowerCase().includes("admin")) ? "ADMIN" : "USER";
            const user = {
                id: "usr-local-session",
                name: email.split("@")[0],
                email,
                role,
                avatar: email.substring(0, 2).toUpperCase(),
                plan: role === "ADMIN" ? "Platform Creator VIP" : "Standard Pass"
            };
            this.setToken("local_token_" + Date.now());
            this.setCachedUser(user);
            return { success: true, user, message: `Welcome back ${user.name}!` };
        }
    }

    async getMe() {
        if (this.isBackendAvailable && this.getToken()) {
            try {
                const res = await this.request("/api/auth/me");
                if (res.user) {
                    this.setCachedUser(res.user);
                }
                return res;
            } catch (e) {
                return { success: false, user: this.getCachedUser() };
            }
        }
        return { success: true, user: this.getCachedUser() };
    }

    async updateProfile(profileData) {
        if (this.isBackendAvailable && this.getToken()) {
            const res = await this.request("/api/auth/profile", {
                method: "PUT",
                body: JSON.stringify(profileData)
            });
            if (res.user) this.setCachedUser(res.user);
            return res;
        } else {
            const current = this.getCachedUser() || {};
            const updated = { ...current, ...profileData };
            this.setCachedUser(updated);
            return { success: true, user: updated, message: "Profile updated locally." };
        }
    }

    logout() {
        this.setToken(null);
        this.setCachedUser(null);
        if (this.isBackendAvailable) {
            this.request("/api/auth/logout", { method: "POST" }).catch(() => {});
        }
    }

    // ======================================================================
    // 2. MOVIES & SERIES
    // ======================================================================
    async getMovies(params = {}) {
        if (this.isBackendAvailable) {
            const query = new URLSearchParams(params).toString();
            return await this.request(`/api/movies?${query}`);
        }
        return { success: true, data: window.MOVIES_DATABASE || [] };
    }

    async getMovie(id) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/movies/${id}`);
        }
        const m = (window.MOVIES_DATABASE || []).find(item => item.id === id);
        return { success: true, data: m };
    }

    // ======================================================================
    // 3. SONGS & PLAYLISTS
    // ======================================================================
    async getSongs(params = {}) {
        if (this.isBackendAvailable) {
            const query = new URLSearchParams(params).toString();
            return await this.request(`/api/songs?${query}`);
        }
        return { success: true, data: window.SONGS_DATABASE || [] };
    }

    async recordSongPlay(songId) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/songs/${songId}/play`, { method: "POST" }).catch(() => {});
        }
    }

    async getPlaylists() {
        if (this.isBackendAvailable) {
            return await this.request("/api/playlists");
        }
        try {
            const stored = localStorage.getItem("himstreamx_playlists_v2");
            return { success: true, data: stored ? JSON.parse(stored) : [] };
        } catch (e) {
            return { success: true, data: [] };
        }
    }

    async createPlaylist(title, description = "") {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/playlists", {
                method: "POST",
                body: JSON.stringify({ title, description })
            });
        }
        const stored = localStorage.getItem("himstreamx_playlists_v2");
        const list = stored ? JSON.parse(stored) : [];
        const pl = { id: "pl-" + Date.now(), title, description, track_count: 0, songs: [] };
        list.push(pl);
        localStorage.setItem("himstreamx_playlists_v2", JSON.stringify(list));
        return { success: true, data: pl };
    }

    async deletePlaylist(playlistId) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request(`/api/playlists/${playlistId}`, { method: "DELETE" });
        }
        const stored = localStorage.getItem("himstreamx_playlists_v2");
        let list = stored ? JSON.parse(stored) : [];
        list = list.filter(p => p.id !== playlistId);
        localStorage.setItem("himstreamx_playlists_v2", JSON.stringify(list));
        return { success: true, message: "Playlist deleted." };
    }

    async addSongToPlaylist(playlistId, songId) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request(`/api/playlists/${playlistId}/songs`, {
                method: "POST",
                body: JSON.stringify({ song_id: songId })
            });
        }
        return { success: true, message: "Added song to playlist locally." };
    }

    async removeSongFromPlaylist(playlistId, songId) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request(`/api/playlists/${playlistId}/songs/${songId}`, { method: "DELETE" });
        }
        return { success: true, message: "Removed song." };
    }

    // ======================================================================
    // 4. USER LIBRARY: WATCHLIST & LIKED SONGS
    // ======================================================================
    async toggleWatchlist(movieId) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/library/watchlist/toggle", {
                method: "POST",
                body: JSON.stringify({ movie_id: movieId })
            });
        }
        return null;
    }

    async toggleLikedSong(songId) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/library/favourites/toggle", {
                method: "POST",
                body: JSON.stringify({ item_type: "song", item_id: songId })
            });
        }
        return null;
    }

    async getLikedSongs() {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/library/liked-songs");
        }
        return { success: true, data: [] };
    }

    async getWatchlist() {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/library/watchlist");
        }
        return { success: true, data: [] };
    }

    async recordWatchProgress(movieId, percent, seconds = 0, completed = false) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/library/history/watch", {
                method: "POST",
                body: JSON.stringify({
                    movie_id: movieId,
                    progress_percent: percent,
                    progress_seconds: seconds,
                    completed
                })
            }).catch(() => {});
        }
    }

    async submitReview(itemType, itemId, text, rating = 5.0) {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/library/reviews", {
                method: "POST",
                body: JSON.stringify({
                    item_type: itemType,
                    item_id: itemId,
                    review_text: text,
                    rating
                })
            });
        }
        return { success: true, message: "Review saved locally." };
    }

    // ======================================================================
    // 5. ADMIN OPERATIONS & ANALYTICS
    // ======================================================================
    async getAdminMetrics() {
        if (this.isBackendAvailable) {
            return await this.request("/api/admin/metrics");
        }
        return {
            success: true,
            metrics: {
                total_users: 3,
                total_movies: (window.MOVIES_DATABASE || []).filter(m => m.type === "movie").length,
                total_series: (window.MOVIES_DATABASE || []).filter(m => m.type === "series").length,
                total_songs: (window.SONGS_DATABASE || []).length,
                total_artists: (window.POPULAR_ARTISTS || []).length,
                total_playlists: 4,
                total_reviews: 12,
                bandwidth_peak: "98.4 GB/s",
                active_streams: "142,890"
            },
            popular_songs: (window.SONGS_DATABASE || []).slice(0, 5),
            popular_movies: (window.MOVIES_DATABASE || []).slice(0, 5),
            top_searches: [
                { query: "kesariya lofi", search_count: 1420 },
                { query: "stranger things", search_count: 1280 },
                { query: "oppenheimer 4k", search_count: 940 },
                { query: "bhojpuri edm", search_count: 870 },
                { query: "52 gaj ka daman", search_count: 730 }
            ]
        };
    }

    async getAdminUsers() {
        if (this.isBackendAvailable) {
            return await this.request("/api/admin/users");
        }
        return { success: true, data: [] };
    }

    async updateUserStatus(userId, status, role = null) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/admin/users/${userId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status, role })
            });
        }
        return { success: true, message: "User status updated." };
    }

    async createMovie(movieData) {
        if (this.isBackendAvailable) {
            return await this.request("/api/admin/movies", {
                method: "POST",
                body: JSON.stringify(movieData)
            });
        }
        return null;
    }

    async deleteMovie(movieId) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/admin/movies/${movieId}`, { method: "DELETE" });
        }
        return null;
    }

    async createSong(songData) {
        if (this.isBackendAvailable) {
            return await this.request("/api/admin/songs", {
                method: "POST",
                body: JSON.stringify(songData)
            });
        }
        return null;
    }

    async deleteSong(songId) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/admin/songs/${songId}`, { method: "DELETE" });
        }
        return null;
    }

    async getAllReviews() {
        if (this.isBackendAvailable) {
            return await this.request("/api/admin/reviews");
        }
        return { success: true, data: [] };
    }

    async moderateReview(reviewId, approve = true) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/admin/reviews/${reviewId}/moderate?approve=${approve}`, { method: "PUT" });
        }
        return { success: true, message: "Review updated." };
    }

    async deleteReview(reviewId) {
        if (this.isBackendAvailable) {
            return await this.request(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
        }
        return { success: true, message: "Review deleted." };
    }

    // ======================================================================
    // 6. SMART RECOMMENDATIONS ENGINE
    // ======================================================================
    async getMusicRecommendations() {
        if (this.isBackendAvailable) {
            try {
                return await this.request("/api/recommendations/music");
            } catch (e) {
                console.warn("Backend recommendations failed, falling back to local engine:", e);
            }
        }
        // Local Fallback Smart Engine
        const songs = window.SONGS_DATABASE || [];
        const storedHistory = localStorage.getItem("himstreamx_music_history_v2");
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        const storedLiked = localStorage.getItem("himstreamx_liked_songs_v2");
        const likedIds = storedLiked ? JSON.parse(storedLiked) : [];

        const anchor = history[0] || (songs.find(s => likedIds.includes(s.id))) || songs[0] || {};
        const genre = anchor.genre || "Romantic";
        const lang = anchor.language || "Hindi";

        return {
            success: true,
            anchor_track: anchor,
            dominant_genre: genre,
            dominant_language: lang,
            shelves: {
                recommended_for_you: {
                    title: "Recommended For You",
                    subtitle: "Handpicked tracks matching your listening taste",
                    items: songs.slice(0, 8).map(s => ({ ...s, recommendation_reason: "Recommended based on your taste" }))
                },
                because_you_listened_to: {
                    title: `Because You Listened To "${anchor.title || 'Kesariya'}"`,
                    subtitle: `Similar to ${anchor.artist || 'Arijit Singh'} & ${genre}`,
                    anchor: anchor,
                    items: songs.filter(s => s.id !== anchor.id && (s.genre === genre || s.language === lang)).slice(0, 8)
                },
                similar_songs: {
                    title: "Similar Songs & Soundtracks",
                    subtitle: `Acoustic matches for ${genre}`,
                    items: songs.filter(s => s.id !== anchor.id).slice(2, 10)
                },
                trending_near_you: {
                    title: "Trending Near You",
                    subtitle: "Most streamed regional and national tracks today",
                    items: [...songs].sort((a,b) => (b.popularity || 50) - (a.popularity || 50)).slice(0, 8)
                },
                popular_in_your_language: {
                    title: `Popular in ${lang}`,
                    subtitle: `Top chartbusters in ${lang}`,
                    items: songs.filter(s => s.language === lang).slice(0, 8)
                },
                discover_new_music: {
                    title: "Discover New Music",
                    subtitle: "Expand your horizon with fresh genres and eclectic beats",
                    items: songs.slice(-8)
                }
            }
        };
    }

    async getMovieRecommendations() {
        if (this.isBackendAvailable) {
            try {
                return await this.request("/api/recommendations/movies");
            } catch (e) {
                console.warn("Backend movie recommendations failed, falling back to local engine:", e);
            }
        }
        const movies = window.MOVIES_DATABASE || [];
        const anchor = movies[0] || {};
        const topRated = [...movies].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

        return {
            success: true,
            anchor_movie: anchor,
            dominant_genre: "Action",
            shelves: {
                recommended_movies: {
                    title: "Recommended For You",
                    subtitle: "Handpicked based on your viewing history and favorite genres",
                    items: movies.slice(0, 8).map(m => ({ ...m, recommendation_reason: `Critically acclaimed (${m.rating} IMDb)` }))
                },
                because_you_watched: {
                    title: `Because You Watched "${anchor.title || 'Stranger Things'}"`,
                    subtitle: "Similar themes, intense storytelling, and matching genres",
                    anchor: anchor,
                    items: movies.filter(m => m.id !== anchor.id).slice(0, 8)
                },
                similar_movies: {
                    title: "More Like This",
                    subtitle: `Deep cinematic connections to ${anchor.title || 'Stranger Things'}`,
                    items: movies.filter(m => m.id !== anchor.id).slice(1, 9)
                },
                trending_movies: {
                    title: "Trending Movies & Series",
                    subtitle: "What viewers are watching right now",
                    items: movies.filter(m => m.isTrending).slice(0, 8)
                },
                top_rated: {
                    title: "Critically Acclaimed & Top Rated",
                    subtitle: "Highest IMDb rating blockbusters",
                    items: topRated
                }
            }
        };
    }

    // ======================================================================
    // 7. YOUTUBE OFFICIAL MEDIA ENGINE
    // ======================================================================
    async searchYouTube(query, options = {}) {
        await this.ensureBackend();
        const params = new URLSearchParams({ q: query, ...options }).toString();
        if (this.isBackendAvailable) {
            try {
                return await this.request(`/api/youtube/search?${params}`);
            } catch (e) {
                console.warn("Backend YouTube search failed, falling back to direct fetch:", e);
            }
        }
        try {
            const direct = await fetch(`/api/youtube/search?${params}`);
            if (direct.ok) {
                this.isBackendAvailable = true;
                return await direct.json();
            }
        } catch (_) {}

        // Zero-mock fallback: Return clean empty data (never inject static mock songs)
        return {
            success: true,
            source: "offline_fallback",
            query,
            data: []
        };
    }

    async getYouTubeVideo(videoId) {
        if (this.isBackendAvailable) {
            try {
                return await this.request(`/api/youtube/video/${videoId}`);
            } catch (e) {}
        }
        return {
            success: true,
            data: {
                videoId,
                title: "Official YouTube Stream",
                channelTitle: "YouTube Official",
                embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=http://localhost:8000`
            }
        };
    }

    // ======================================================================
    // 8. SUBSCRIPTION & THEATRICAL CINEMA HALL GATEWAY
    // ======================================================================
    async getSubscriptionPlans() {
        if (this.isBackendAvailable) {
            try {
                return await this.request("/api/subscription/plans");
            } catch (e) {}
        }
        return {
            success: true,
            paymentDetails: {
                upiId: "7084468661@pytes",
                mobile: "+91 7084468661",
                name: "Himanshu Prajapati",
                qrCodeUrl: "/qr.png"
            },
            plans: []
        };
    }

    async getTheatricalMovies() {
        if (this.isBackendAvailable) {
            try {
                return await this.request("/api/subscription/theatrical-movies");
            } catch (e) {}
        }
        return { success: true, data: [] };
    }

    async submitSubscriptionPayment(planName, amount, utr, mobile = "") {
        if (this.isBackendAvailable && this.getToken()) {
            return await this.request("/api/subscription/submit-payment", {
                method: "POST",
                body: JSON.stringify({
                    plan_name: planName,
                    amount,
                    upi_transaction_id: utr,
                    user_mobile: mobile
                })
            });
        }
        return {
            success: true,
            message: `Reference ${utr} recorded! VIP status active on local pass.`
        };
    }

    // ======================================================================
    // 9. DIRECTOR SECRET PROFILE VAULT
    // ======================================================================
    async unlockDirectorProfile(password) {
        if (this.isBackendAvailable) {
            return await this.request("/api/director/unlock", {
                method: "POST",
                body: JSON.stringify({ password })
            });
        }
        // Local authentication check
        if (password === "Him@90") {
            return {
                success: true,
                director: {
                    name: "Himanshu Prajapati",
                    title: "Founder, Platform Architect & Director of HIMSTREAMX",
                    photoUrl: "/Himanshu%20photo.png",
                    mobile: "+91 7084468661",
                    email: "himanshuprajapati6643@gmail.com",
                    upiId: "7084468661@pytes"
                }
            };
        } else {
            throw new Error("Access Denied: Incorrect Director Master Key.");
        }
    }
}

// Global Singleton
window.himstreamxAPI = new HimstreamxAPI();

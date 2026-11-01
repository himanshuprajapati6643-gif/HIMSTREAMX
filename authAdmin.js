// ==========================================================================
// HIMSTREAMX - FULL-STACK USER ACCOUNT & ADMIN MANAGEMENT ENGINE
// Developed by Himanshu Prajapati (2026)
// Dashboard, Playlists, Reviews, History, Full Catalog CRUD & Analytics
// ==========================================================================

let currentActiveUser = {
    id: "usr-himanshu-admin",
    name: "Himanshu Prajapati",
    email: "himanshuprajapati6643@gmail.com",
    role: "ADMIN",
    avatar: "HP",
    plan: "Platform Creator VIP (4K UHD + Hi-Res Audio)",
    isAdmin: true
};

// ==========================================================================
// 1. INITIALIZATION & SESSION MANAGEMENT
// ==========================================================================
async function initUserAccountSystem() {
    // Check if API has cached or valid session
    if (window.himstreamxAPI) {
        const cached = window.himstreamxAPI.getCachedUser();
        if (cached) {
            currentActiveUser = {
                ...cached,
                isAdmin: cached.role === "ADMIN"
            };
        }

        // Try validating session with backend
        try {
            const res = await window.himstreamxAPI.getMe();
            if (res.success && res.user) {
                currentActiveUser = {
                    ...res.user,
                    isAdmin: res.user.role === "ADMIN"
                };
            }
        } catch (e) {}
    }

    updateUserProfileDisplay();

    // Bind profile menu events
    const profileBtn = document.getElementById("profileBtn");
    const userDashboardBtn = document.getElementById("userDashboardBtn");
    const profileMyListLink = document.getElementById("profileMyListLink");
    const switchProfileBtn = document.getElementById("switchProfileBtn");
    const signOutBtn = document.getElementById("signOutBtn");

    if (userDashboardBtn) {
        userDashboardBtn.addEventListener("click", () => openUserDashboard("profile"));
    }
    if (profileMyListLink) {
        profileMyListLink.addEventListener("click", () => openUserDashboard("watchlist"));
    }
    if (switchProfileBtn) {
        switchProfileBtn.addEventListener("click", () => openProfileSwitchModal());
    }
    if (signOutBtn) {
        signOutBtn.addEventListener("click", handleUserLogout);
    }
}

function updateUserProfileDisplay() {
    const nameEl = document.querySelector(".profile-name");
    const initialsEl = document.querySelectorAll(".avatar-initials");
    const drawerName = document.querySelector(".drawer-profile h4");
    const drawerPlan = document.querySelector(".drawer-profile span");
    const roleBadge = document.querySelector(".badge-vip");

    if (nameEl) nameEl.textContent = currentActiveUser.name;
    if (drawerName) drawerName.textContent = currentActiveUser.name;
    if (drawerPlan) drawerPlan.textContent = currentActiveUser.plan || "Standard Member";

    if (roleBadge) {
        roleBadge.innerHTML = currentActiveUser.isAdmin
            ? `<i class="fa-solid fa-crown"></i> Platform Creator & VIP`
            : `<i class="fa-solid fa-user-check"></i> Verified Member`;
    }

    initialsEl.forEach(el => {
        el.textContent = currentActiveUser.avatar || "HP";
    });

    // Update Admin link in navbar & drawer
    const adminLink = document.getElementById("adminNavLink");
    if (adminLink) {
        adminLink.style.display = currentActiveUser.isAdmin ? "inline-flex" : "none";
    }
}

function handleUserLogout() {
    if (window.himstreamxAPI) {
        window.himstreamxAPI.logout();
    }
    currentActiveUser = {
        id: "usr-guest",
        name: "Guest Listener",
        email: "guest@himstreamx.com",
        role: "USER",
        avatar: "GT",
        plan: "Standard Audio/Video Pass",
        isAdmin: false
    };
    updateUserProfileDisplay();
    showToast("👋 You have been signed out from HIMSTREAMX.");
    const profilePanel = document.getElementById("profilePanel");
    if (profilePanel) profilePanel.classList.remove("show");
}

// ==========================================================================
// 2. AUTHENTICATION MODAL (SIGN IN / SIGN UP)
// ==========================================================================
function openAuthModal(mode = "login") {
    const modal = document.getElementById("authModal");
    const title = document.getElementById("authModalTitle");
    const subtitle = document.getElementById("authModalSub");
    const submitBtn = document.getElementById("authSubmitBtn");
    const nameGroup = document.getElementById("authNameGroup");
    const switchText = document.getElementById("authSwitchText");

    if (mode === "login") {
        if (title) title.textContent = "Welcome Back to HIMSTREAMX";
        if (subtitle) subtitle.textContent = "Sign in to access your Watchlist, Liked Songs & VIP Streams.";
        if (submitBtn) submitBtn.textContent = "Sign In to HIMSTREAMX";
        if (nameGroup) nameGroup.style.display = "none";
        if (switchText) switchText.innerHTML = `Don't have an account? <a href="javascript:void(0)" onclick="openAuthModal('signup')">Sign Up Free</a>`;
    } else {
        if (title) title.textContent = "Create HIMSTREAMX Account";
        if (subtitle) subtitle.textContent = "Join millions streaming movies, series, and regional music in 4K.";
        if (submitBtn) submitBtn.textContent = "Start Streaming Free";
        if (nameGroup) nameGroup.style.display = "block";
        if (switchText) switchText.innerHTML = `Already registered? <a href="javascript:void(0)" onclick="openAuthModal('login')">Sign In</a>`;
    }

    if (modal) modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}

async function handleAuthSubmit(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById("authNameInput");
    const emailInput = document.getElementById("authEmailInput");
    const passInput = document.getElementById("authPasswordInput");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passInput ? passInput.value.trim() : "";
    const isSignup = document.getElementById("authNameGroup") && document.getElementById("authNameGroup").style.display !== "none";

    try {
        let res;
        if (isSignup) {
            const name = nameInput ? nameInput.value.trim() : email.split("@")[0];
            res = await window.himstreamxAPI.signup(name, email, password);
        } else {
            res = await window.himstreamxAPI.login(email, password);
        }

        if (res.user) {
            currentActiveUser = {
                ...res.user,
                isAdmin: res.user.role === "ADMIN"
            };
            updateUserProfileDisplay();
            closeAuthModal();
            showToast(res.message || `🎉 Welcome, ${currentActiveUser.name}!`, "success");
        }
    } catch (err) {
        showToast(`❌ ${err.message}`, "warning");
    }
}

// ==========================================================================
// 3. FULL USER DASHBOARD (PROFILE, WATCHLIST, LIKED SONGS, PLAYLISTS, REVIEWS)
// ==========================================================================


async function openUserDashboard(initialTab = "profile") {
    const modal = document.getElementById("userDashboardModal");
    if (!modal) return;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    // Set active tab
    switchDashboardTab(initialTab);
}

function closeUserDashboard() {
    const modal = document.getElementById("userDashboardModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}

function switchDashboardTab(tabName) {
    document.querySelectorAll(".ud-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });
    document.querySelectorAll(".ud-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === `udPane-${tabName}`);
    });

    // Populate tab contents
    if (tabName === "profile") renderDashboardOverview();
    else if (tabName === "watchlist") renderDashboardWatchlist();
    else if (tabName === "likedsongs") renderDashboardLikedSongs();
    else if (tabName === "playlists") renderDashboardPlaylists();
    else if (tabName === "watchhistory") renderDashboardWatchHistory();
    else if (tabName === "listeninghistory") renderDashboardListeningHistory();
    else if (tabName === "reviews") renderDashboardReviews();
    }

async function renderDashboardOverview() {
    const uState = window.himstreamxUserState ? window.himstreamxUserState.getCurrentUser() : currentActiveUser;
    const nameEl = document.getElementById("udProfileName");
    const emailEl = document.getElementById("udProfileEmail");
    const roleEl = document.getElementById("udProfileRole");
    const planEl = document.getElementById("udProfilePlan");
    const avatarEl = document.getElementById("udProfileAvatar");

    if (nameEl) nameEl.textContent = uState.name || currentActiveUser.name;
    if (emailEl) emailEl.textContent = uState.email || currentActiveUser.email;
    if (roleEl) roleEl.textContent = uState.role || currentActiveUser.role;
    if (planEl) planEl.textContent = uState.plan || currentActiveUser.plan || "Standard Member";
    if (avatarEl) avatarEl.textContent = uState.avatar || currentActiveUser.avatar || "HP";

    const setStat = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    // Calculate live counts from himstreamxUserState
    const watchlistCount = typeof getWatchlist === "function" ? getWatchlist().length : 0;
    const likedCount = window.himstreamxUserState ? window.himstreamxUserState.getLikedVideos().length : 0;
    const playlistsCount = window.himstreamxUserState ? window.himstreamxUserState.getPlaylists().length : 3;
    const reviewsCount = 5;

    setStat("udStatWatchlist", watchlistCount);
    setStat("udStatLikedSongs", likedCount);
    setStat("udStatPlaylists", playlistsCount);
    setStat("udStatReviews", reviewsCount);

    // Sync with backend API if available
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        try {
            const res = await window.himstreamxAPI.getMe();
            if (res.stats) {
                if (res.stats.watchlist_count) setStat("udStatWatchlist", Math.max(watchlistCount, res.stats.watchlist_count));
                if (res.stats.liked_songs_count) setStat("udStatLikedSongs", Math.max(likedCount, res.stats.liked_songs_count));
                if (res.stats.playlists_count) setStat("udStatPlaylists", Math.max(playlistsCount, res.stats.playlists_count));
            }
        } catch (e) {}
    }
}

async function renderDashboardWatchlist() {
    const container = document.getElementById("udWatchlistGrid");
    if (!container) return;

    let items = [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        const res = await window.himstreamxAPI.getWatchlist();
        items = res.data || [];
    } else {
        const listIds = typeof getWatchlist === "function" ? getWatchlist() : [];
        items = (window.MOVIES_DATABASE || []).filter(m => listIds.includes(m.id));
    }

    if (items.length === 0) {
        container.innerHTML = `
            <div class="ud-empty-box">
                <i class="fa-regular fa-bookmark"></i>
                <h4>Your Watchlist is empty</h4>
                <p>Browse movies and series to save them to your watchlist.</p>
            </div>
        `;
    } else {
        container.innerHTML = items.map(m => createMovieCardHTML(m)).join("");
    }
}

async function renderDashboardLikedSongs() {
    const container = document.getElementById("udLikedSongsList");
    if (!container) return;

    const ytLiked = window.himstreamxUserState ? window.himstreamxUserState.getLikedVideos() : [];

    if (ytLiked.length === 0) {
        container.innerHTML = `
            <div class="ud-empty-box" style="text-align: center; padding: 40px 20px;">
                <i class="fa-regular fa-heart" style="font-size: 2.5rem; color: #ff3366; margin-bottom: 12px;"></i>
                <h4>No liked songs yet</h4>
                <p style="color: var(--text-muted); max-width: 420px; margin: 8px auto;">Click the heart icon on any YouTube track or music card to save it here for instant 1-click playback.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="font-size: 0.9rem; color: #56e2ea; font-weight: 600;"><i class="fa-solid fa-heart text-red"></i> ${ytLiked.length} Liked YouTube Tracks</span>
            <button class="btn btn-glass btn-sm" onclick="playAllLikedVideos()" style="font-size: 0.8rem; padding: 5px 12px;"><i class="fa-solid fa-play"></i> Play First Track</button>
        </div>
        <div class="ud-liked-yt-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;">
            ${ytLiked.map(item => {
                const encTitle = encodeURIComponent(item.title || '');
                const encChannel = encodeURIComponent(item.channelTitle || '');
                const encThumb = encodeURIComponent(item.thumbnail || '');
                const safeTitle = (item.title || '').replace(/"/g, '&quot;');
                const safeChannel = (item.channelTitle || '').replace(/"/g, '&quot;');
                return `
                    <div class="yt-media-card"
                         data-video-id="${item.videoId}"
                         data-title="${encTitle}"
                         data-channel="${encChannel}"
                         data-thumbnail="${encThumb}"
                         onclick="playYouTubeCard(this)"
                         role="button"
                         tabindex="0"
                         style="background: rgba(255,255,255,0.04); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.2s ease;">
                        <div class="yt-thumb-wrapper" style="position: relative; aspect-ratio: 16/9; overflow: hidden;">
                            <img src="${item.thumbnail}" alt="${safeTitle}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                            <div class="yt-play-overlay">
                                <div class="yt-play-circle"><i class="fa-solid fa-play"></i></div>
                            </div>
                        </div>
                        <div class="yt-card-info" style="padding: 10px 12px;">
                            <h4 class="yt-card-title" title="${safeTitle}" style="font-size: 0.88rem; color: #fff; margin: 0 0 6px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeTitle}</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.78rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;">${safeChannel}</span>
                                <button class="yt-card-btn active" onclick="event.stopPropagation(); window.himstreamxUserState.toggleLike('${item.videoId}', '${safeTitle.replace(/'/g, "\\'")}', '${safeChannel.replace(/'/g, "\\'")}', '${item.thumbnail}'); renderDashboardLikedSongs();" title="Remove from Liked" style="background: none; border: none; color: #ff3366; cursor: pointer; font-size: 1rem;">
                                    <i class="fa-solid fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}



async function renderDashboardPlaylists() {
    const container = document.getElementById("udPlaylistsGrid");
    if (!container) return;

    let userPlaylists = window.himstreamxUserState ? window.himstreamxUserState.getPlaylists() : [];

    let html = `
        <div style="grid-column: 1 / -1; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 0.85rem; color: #56e2ea; font-weight: 700;"><i class="fa-solid fa-wand-magic-sparkles"></i> 1-Click Curated Presets:</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Auto-create customized YouTube playlists</span>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Morning Acoustic', 'Gentle melodies to kickstart your day')">☀️ Morning</button>
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Workout Power', 'High BPM party and energetic tracks')">🔥 Workout</button>
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Party Blast', 'Banger beats & club remixes')">🎉 Party</button>
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Relax & Lo-Fi', 'Calm chill beats to relax & study')">☕ Relax</button>
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Bhojpuri Hits', 'Top regional Bhojpuri chartbusters')">⚡ Bhojpuri Hits</button>
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Hindi Melodies', 'Golden Bollywood & indie songs')">✨ Hindi Hits</button>
                <button class="btn btn-glass" style="padding: 5px 12px; font-size: 0.8rem;" onclick="createPresetYouTubePlaylist('Punjabi Beats', 'Bhangra, Dhol & Urban Punjabi anthems')">🥁 Punjabi Hits</button>
            </div>
        </div>
        <div class="ud-create-playlist-card" onclick="promptCreatePlaylist()">
            <div class="create-pl-icon"><i class="fa-solid fa-plus"></i></div>
            <h4>Create Custom Playlist</h4>
            <span>Build your own tracklist</span>
        </div>
    `;

    if (userPlaylists.length > 0) {
        html += userPlaylists.map(p => {
            const count = (p.videos || []).length;
            const cover = (p.videos && p.videos.length > 0 && p.videos[0].thumbnail) ? p.videos[0].thumbnail : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80';
            const isStandard = ['pl_liked', 'pl_watchlater', 'pl_favorites'].includes(p.id);
            return `
                <div class="ud-playlist-card" onclick="viewUserPlaylistDetails('${p.id}')">
                    <img class="ud-playlist-cover" src="${cover}" alt="${p.name}">
                    <div class="ud-playlist-info">
                        <h4>${p.name}</h4>
                        <span>${count} Videos • ${p.description || 'Personal Playlist'}</span>
                    </div>
                    ${!isStandard ? `
                        <button class="ud-playlist-del" onclick="event.stopPropagation(); deleteUserPlaylistAction('${p.id}')" title="Delete Playlist">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    ` : ''}
                </div>
            `;
        }).join("");
    }

    container.innerHTML = html;
}









async function promptCreatePlaylist() {
    const title = prompt("Enter a title for your new playlist:");
    if (!title || !title.trim()) return;
    const desc = prompt("Enter an optional description:") || "";

    if (window.himstreamxUserState) {
        window.himstreamxUserState.createPlaylist(title.trim(), desc.trim());
        showToast(`🎉 Playlist "${title}" created successfully!`, "success");
        renderDashboardPlaylists();
    } else {
        showToast("Playlist created!", "success");
    }
}

async function deletePlaylistAction(playlistId) {
    if (confirm("Are you sure you want to delete this playlist?")) {
        try {
            await window.himstreamxAPI.deletePlaylist(playlistId);
            showToast("Playlist deleted successfully.");
            renderDashboardPlaylists();
        } catch (e) {
            showToast(`❌ Error: ${e.message}`, "warning");
        }
    }
}

async function viewPlaylistDetails(playlistId) {
    try {
        const res = await window.himstreamxAPI.request(`/api/playlists/${playlistId}`);
        if (res.data) {
            const p = res.data;
            const container = document.getElementById("udPlaylistsGrid");
            if (!container) return;

            let html = `
                <div class="ud-playlist-view-header">
                    <button class="btn btn-glass" onclick="renderDashboardPlaylists()"><i class="fa-solid fa-arrow-left"></i> Back to Playlists</button>
                    <div style="margin-top: 14px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                        <img src="${p.cover_image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=140&q=80'}" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover;">
                        <div style="flex: 1; min-width: 200px;">
                            <h3 style="color: #fff; font-size: 1.3rem;">${p.title}</h3>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">${p.description || 'Custom HIMSTREAMX playlist'} • ${p.track_count || 0} tracks</p>
                        </div>
                    </div>
                    <div class="playlist-actions-bar">
                        <button class="btn-playlist-play" onclick="playCurrentPlaylist('${p.id}')">
                            <i class="fa-solid fa-play"></i> Play Playlist
                        </button>
                        <button class="btn-playlist-shuffle" onclick="shuffleCurrentPlaylist('${p.id}')">
                            <i class="fa-solid fa-shuffle"></i> Shuffle
                        </button>
                        <button class="btn btn-glass" onclick="promptRenamePlaylist('${p.id}', '${p.title.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-pen"></i> Rename
                        </button>
                    </div>
                </div>
                <div class="song-rows-container" style="margin-top: 18px;">
            `;

            if (!p.songs || p.songs.length === 0) {
                html += `<div class="ud-empty-box"><p>No tracks added to this playlist yet. Browse songs to add them.</p></div>`;
            } else {
                html += p.songs.map((s, i) => createSongRowHTML(s, i, p.songs)).join("");
            }
            html += `</div>`;
            container.innerHTML = html;
        }
    } catch (e) {
        showToast("Error loading playlist.", "warning");
    }
}

async function playCurrentPlaylist(playlistId) {
    try {
        const res = await window.himstreamxAPI.request(`/api/playlists/${playlistId}`);
        if (res.data && res.data.songs && res.data.songs.length > 0) {
            if (window.himstreamxPlayer) {
                window.himstreamxPlayer.playPlaylist(res.data.songs, false);
            }
        } else {
            showToast("This playlist does not have any songs yet.", "warning");
        }
    } catch (e) {
        showToast("Failed to play playlist.", "warning");
    }
}

async function shuffleCurrentPlaylist(playlistId) {
    try {
        const res = await window.himstreamxAPI.request(`/api/playlists/${playlistId}`);
        if (res.data && res.data.songs && res.data.songs.length > 0) {
            if (window.himstreamxPlayer) {
                window.himstreamxPlayer.playPlaylist(res.data.songs, true);
            }
        } else {
            showToast("This playlist does not have any songs yet.", "warning");
        }
    } catch (e) {
        showToast("Failed to shuffle playlist.", "warning");
    }
}

async function promptRenamePlaylist(playlistId, currentTitle) {
    const newTitle = prompt("Enter new title for this playlist:", currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === currentTitle) return;

    try {
        if (window.himstreamxAPI) {
            await window.himstreamxAPI.request(`/api/playlists/${playlistId}`, {
                method: "PUT",
                body: JSON.stringify({ title: newTitle.trim() })
            });
        }
        showToast(`Playlist renamed to "${newTitle.trim()}"!`, "success");
        viewPlaylistDetails(playlistId);
    } catch (e) {
        showToast(`Failed to rename: ${e.message}`, "warning");
    }
}

async function createPresetPlaylist(presetName, description, filterType, filterVal) {
    try {
        let songs = window.SONGS_DATABASE || [];
        if (filterType === "genre") {
            songs = songs.filter(s => s.genre && s.genre.toLowerCase() === filterVal.toLowerCase());
        } else if (filterType === "language") {
            songs = songs.filter(s => s.language && s.language.toLowerCase() === filterVal.toLowerCase());
        }

        const res = await window.himstreamxAPI.createPlaylist(presetName, description);
        const plId = (res.data && res.data.id) || (res.playlist && res.playlist.id);

        if (plId && songs.length > 0) {
            // Add top 5 tracks to the preset
            for (const s of songs.slice(0, 5)) {
                await window.himstreamxAPI.addSongToPlaylist(plId, s.id);
            }
        }

        showToast(`🎉 Preset "${presetName}" created with curated tracks!`, "success");
        renderDashboardPlaylists();
    } catch (e) {
        showToast(`Failed to create preset: ${e.message}`, "warning");
    }
}

async function renderDashboardWatchHistory() {
    const container = document.getElementById("udWatchHistoryList");
    if (!container) return;

    let items = [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        const res = await window.himstreamxAPI.request("/api/library/history/watch");
        items = res.data || [];
    } else {
        items = (window.MOVIES_DATABASE || []).slice(0, 4);
    }

    if (items.length === 0) {
        container.innerHTML = `<div class="ud-empty-box"><p>No watch history recorded yet.</p></div>`;
    } else {
        container.innerHTML = items.map(m => `
            <div class="ud-history-item" onclick="startPlayback('${m.id}')">
                <img src="${m.backdrop || m.poster}" style="width: 100px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <h5 style="color: #fff; font-size: 0.95rem;">${m.title}</h5>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">${m.year} • ${m.duration}</span>
                    <div style="height: 4px; background: rgba(255,255,255,0.15); border-radius: 99px; margin-top: 6px; overflow: hidden;">
                        <div style="width: ${m.progress_percent || 65}%; height: 100%; background: #56e2ea;"></div>
                    </div>
                </div>
                <button class="btn btn-circle" style="width: 38px; height: 38px;" title="Resume playback"><i class="fa-solid fa-play"></i></button>
            </div>
        `).join("");
    }
}

async function renderDashboardListeningHistory() {
    const container = document.getElementById("udListeningHistoryList");
    if (!container) return;

    const historyItems = window.himstreamxUserState ? window.himstreamxUserState.getHistory() : [];

    if (historyItems.length === 0) {
        container.innerHTML = `
            <div class="ud-empty-box" style="text-align: center; padding: 40px 20px;">
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 2.5rem; opacity: 0.5; margin-bottom: 12px;"></i>
                <h4>No playback history recorded yet</h4>
                <p style="color: var(--text-muted);">Tracks and videos you play will automatically appear here with exact resume positions.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="font-size: 0.9rem; color: #56e2ea; font-weight: 600;">
                <i class="fa-solid fa-clock-rotate-left"></i> ${historyItems.length} Recently Streamed Videos
            </span>
            <button class="btn btn-glass btn-sm" onclick="clearAllHistoryFromDashboard()" style="color: #ff3366; font-size: 0.8rem; padding: 5px 12px;">
                <i class="fa-solid fa-trash-can"></i> Clear History
            </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${historyItems.map((item, index) => {
                const encTitle = encodeURIComponent(item.title || '');
                const encChannel = encodeURIComponent(item.channelTitle || '');
                const encThumb = encodeURIComponent(item.thumbnail || '');
                return `
                    <div class="ud-history-item" style="display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer;"
                         data-video-id="${item.videoId}"
                         data-title="${encTitle}"
                         data-channel="${encChannel}"
                         data-thumbnail="${encThumb}"
                         onclick="playYouTubeCard(this)">
                        <span style="font-size: 0.85rem; color: var(--text-muted); width: 24px;">#${index + 1}</span>
                        <img src="${item.thumbnail}" style="width: 80px; height: 50px; border-radius: 6px; object-fit: cover;">
                        <div style="flex: 1; min-width: 0;">
                            <h5 style="color: #fff; font-size: 0.92rem; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</h5>
                            <span style="font-size: 0.78rem; color: var(--text-muted);">${item.channelTitle || 'YouTube Stream'} • ${item.playedAt ? new Date(item.playedAt).toLocaleDateString() : 'Recently'}</span>
                        </div>
                        <button class="btn btn-circle" style="width: 36px; height: 36px;" title="Play Track">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <button class="btn btn-glass btn-sm" style="color: #ff3366; padding: 4px 8px;" onclick="event.stopPropagation(); window.himstreamxUserState.removeFromHistory('${item.videoId}'); renderDashboardListeningHistory();" title="Remove from history">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}



async function renderDashboardReviews() {
    const container = document.getElementById("udReviewsList");
    if (!container) return;

    let reviews = [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        const res = await window.himstreamxAPI.request("/api/library/reviews/my");
        reviews = res.data || [];
    }

    if (reviews.length === 0) {
        container.innerHTML = `<div class="ud-empty-box"><i class="fa-regular fa-comment-dots"></i><p>You haven't written any reviews yet. Leave a review on any movie or song details page!</p></div>`;
    } else {
        container.innerHTML = reviews.map(r => `
            <div class="ud-review-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="color: #fff; font-size: 1rem;">${r.item_title || 'Review'}</h4>
                        <div style="color: #ffb703; font-size: 0.85rem; margin: 4px 0;">
                            ${'★'.repeat(Math.round(r.rating || 5))}${'☆'.repeat(5 - Math.round(r.rating || 5))}
                        </div>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${r.created_at || 'Recently'}</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5; margin-top: 8px;">"${r.review_text}"</p>
            </div>
        `).join("");
    }
}

// ==========================================================================
// 4. ADMIN DASHBOARD & ADVANCED OPERATIONS
// ==========================================================================
async function openAdminDashboard(defaultTab = "metrics") {
    const token = window.himstreamxAPI ? window.himstreamxAPI.getToken() : null;
    if (!token) {
        if (typeof showToast === "function") {
            showToast("🔒 Admin sign-in required to access dashboard.", "info");
        }
        if (typeof openAuthModal === "function") {
            openAuthModal("signin");
        }
        return;
    }
    const modal = document.getElementById("adminDashboardModal");
    if (!modal) return;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    switchAdminTab(defaultTab);
}

function closeAdminDashboard() {
    const modal = document.getElementById("adminDashboardModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}

function switchAdminTab(tabName) {
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });
    document.querySelectorAll(".admin-tab-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === `adminPane-${tabName}`);
    });

    if (tabName === "metrics") loadAdminMetrics();
    else if (tabName === "movies") loadAdminMoviesTable();
    else if (tabName === "songs") loadAdminSongsTable();
    else if (tabName === "users") loadAdminUsersTable();
    else if (tabName === "reviews") loadAdminReviewsTable();
}

async function loadAdminMetrics() {
    if (!window.himstreamxAPI || !window.himstreamxAPI.getToken()) return;
    try {
        const res = await window.himstreamxAPI.getAdminMetrics();
        if (res.metrics) {
            const m = res.metrics;
            document.getElementById("adminMetricMovies").textContent = m.total_movies;
            document.getElementById("adminMetricSongs").textContent = m.total_songs;
            document.getElementById("adminMetricUsers").textContent = m.total_users;
            document.getElementById("adminMetricBandwidth").textContent = m.bandwidth_peak;
        }

        // Render Top Searches table
        const searchTable = document.getElementById("adminTopSearchesList");
        if (searchTable && res.top_searches) {
            searchTable.innerHTML = res.top_searches.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem;">
                    <span style="color: #fff;"><i class="fa-solid fa-magnifying-glass" style="color: #56e2ea; margin-right: 6px;"></i> ${item.query}</span>
                    <span style="color: var(--text-muted);">${item.search_count} searches</span>
                </div>
            `).join("");
        }
    } catch (e) {
        console.error("Failed to load metrics:", e);
    }
}

async function loadAdminMoviesTable() {
    const tbody = document.getElementById("adminMoviesTableBody");
    if (!tbody) return;

    let movies = window.MOVIES_DATABASE || [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        try {
            const res = await window.himstreamxAPI.getMovies({ limit: 100 });
            movies = res.data || movies;
        } catch (e) {}
    }

    tbody.innerHTML = movies.map(m => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${m.poster}" style="width: 32px; height: 44px; border-radius: 4px; object-fit: cover;">
                    <div>
                        <strong style="color: #fff; font-size: 0.88rem;">${m.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.year} • ${m.type}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge-tag">${Array.isArray(m.genres) ? m.genres.slice(0, 2).join(", ") : m.genres}</span></td>
            <td>⭐ ${m.rating}</td>
            <td><span class="badge-status ${m.isTrending ? 'active' : ''}">${m.isTrending ? 'Trending' : 'Standard'}</span></td>
            <td>
                <button class="table-action-btn text-red" onclick="deleteMovieAdminAction('${m.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
    `).join("");
}

async function deleteMovieAdminAction(movieId) {
    if (confirm(`Are you sure you want to delete movie "${movieId}" from the catalog?`)) {
        if (window.himstreamxAPI) {
            await window.himstreamxAPI.deleteMovie(movieId);
        }
        window.MOVIES_DATABASE = (window.MOVIES_DATABASE || []).filter(m => m.id !== movieId);
        showToast("Movie deleted successfully.");
        loadAdminMoviesTable();
        if (typeof renderCategoryRows === "function") renderCategoryRows();
    }
}

async function loadAdminSongsTable() {
    const tbody = document.getElementById("adminSongsTableBody");
    if (!tbody) return;

    let songs = window.SONGS_DATABASE || [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        try {
            const res = await window.himstreamxAPI.getSongs({ limit: 100 });
            songs = res.data || songs;
        } catch (e) {}
    }

    tbody.innerHTML = songs.map(s => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${s.coverImage}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;">
                    <div>
                        <strong style="color: #fff; font-size: 0.88rem;">${s.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${s.artist}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge-tag">${s.language}</span></td>
            <td>${s.genre}</td>
            <td>${s.duration}</td>
            <td>
                <button class="table-action-btn text-red" onclick="deleteSongAdminAction('${s.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
    `).join("");
}

async function deleteSongAdminAction(songId) {
    if (confirm(`Are you sure you want to delete track "${songId}"?`)) {
        if (window.himstreamxAPI) {
            await window.himstreamxAPI.deleteSong(songId);
        }
        window.SONGS_DATABASE = (window.SONGS_DATABASE || []).filter(s => s.id !== songId);
        showToast("Track deleted from library.");
        loadAdminSongsTable();
        if (typeof renderDedicatedMusicGrid === "function") renderDedicatedMusicGrid("all");
    }
}

async function loadAdminUsersTable() {
    const tbody = document.getElementById("adminUsersTableBody");
    if (!tbody) return;

    let users = [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        try {
            const res = await window.himstreamxAPI.getAdminUsers();
            users = res.data || [];
        } catch (e) {}
    } else {
        users = [
            { id: "usr-himanshu", name: "Himanshu Prajapati", email: "himanshuprajapati6643@gmail.com", role: "ADMIN", status: "active" },
            { id: "usr-demo", name: "Demo User", email: "user@himstreamx.com", role: "USER", status: "active" }
        ];
    }

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>
                <strong>${u.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
            </td>
            <td><span class="badge-tag ${u.role === 'ADMIN' ? 'gold' : ''}">${u.role}</span></td>
            <td><span class="badge-status ${u.status === 'active' ? 'active' : 'suspended'}">${u.status}</span></td>
            <td>
                <button class="table-action-btn" onclick="toggleUserStatusAdminAction('${u.id}', '${u.status}')" title="Toggle Active / Suspended">
                    <i class="fa-solid fa-ban"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

async function toggleUserStatusAdminAction(userId, currentStatus) {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    if (confirm(`Change user ${userId} status to ${newStatus}?`)) {
        if (window.himstreamxAPI) {
            await window.himstreamxAPI.updateUserStatus(userId, newStatus);
        }
        showToast(`User status updated to ${newStatus}.`, "success");
        loadAdminUsersTable();
    }
}

async function loadAdminReviewsTable() {
    const tbody = document.getElementById("adminReviewsTableBody");
    if (!tbody) return;

    let reviews = [];
    if (window.himstreamxAPI && window.himstreamxAPI.isBackendAvailable) {
        try {
            const res = await window.himstreamxAPI.getAllReviews();
            reviews = res.data || [];
        } catch (e) {}
    }

    if (reviews.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No reviews currently awaiting moderation.</td></tr>`;
        return;
    }

    tbody.innerHTML = reviews.map(r => `
        <tr>
            <td><strong>${r.user_name}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${r.user_email}</span></td>
            <td>${r.item_title || r.item_id}</td>
            <td>⭐ ${r.rating}</td>
            <td style="max-width: 250px; font-size: 0.85rem;">"${r.review_text}"</td>
            <td>
                <button class="table-action-btn text-red" onclick="deleteReviewAdminAction('${r.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
    `).join("");
}

async function deleteReviewAdminAction(reviewId) {
    if (confirm("Delete this review permanently?")) {
        if (window.himstreamxAPI) {
            await window.himstreamxAPI.deleteReview(reviewId);
        }
        showToast("Review deleted.");
        loadAdminReviewsTable();
    }
}

// Global hook
window.openUserDashboard = openUserDashboard;
window.openAdminDashboard = openAdminDashboard;
window.switchAdminTab = switchAdminTab;
window.switchDashboardTab = switchDashboardTab;
window.playCurrentPlaylist = playCurrentPlaylist;
window.shuffleCurrentPlaylist = shuffleCurrentPlaylist;
window.promptRenamePlaylist = promptRenamePlaylist;
window.createPresetPlaylist = createPresetPlaylist;

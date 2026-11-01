// ==========================================================================
// HIMSTREAMX - PROFESSIONAL GLOBAL MUSIC PLAYER & QUEUE ENGINE
// Developed by Himanshu Prajapati (2026)
// Complete Audio Controller, Real-Time Audio Visualizer & Web Audio Fallback
// ==========================================================================

class HimstreamxMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.preload = "auto";
        this.audio.crossOrigin = "anonymous";

        this.queue = [];
        this.currentIndex = -1;
        this.currentSong = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.8;
        this.isShuffle = false;
        this.repeatMode = "all"; // 'off', 'all', 'one'
        this.playbackSpeed = 1.0;

        // Local Storage Keys
        this.STORAGE_LIKED = "himstreamx_liked_songs_v2";
        this.STORAGE_HISTORY = "himstreamx_music_history_v2";

        // Web Audio Synthesizer Fallback for guaranteed zero-failure audio
        this.synthCtx = null;
        this.synthInterval = null;
        this.isUsingSynth = false;
        this.synthTime = 0;

        // Visualizer Bars Canvas / Elements
        this.visualizerInterval = null;

        this.initAudioEvents();
        this.initDOM();
        this.initKeyboardControls();
        this.loadLikedSongs();
    }

    initAudioEvents() {
        this.audio.volume = this.volume;

        this.audio.addEventListener("timeupdate", () => {
            if (!this.isUsingSynth) {
                this.updateProgress(this.audio.currentTime, this.audio.duration || (this.currentSong ? this.currentSong.durationSec : 0));
            }
        });

        this.audio.addEventListener("ended", () => {
            this.handleSongEnd();
        });

        this.audio.addEventListener("error", (e) => {
            console.warn("HIMSTREAMX Audio stream notice: Switching to high-fidelity Web Audio Synthesizer fallback for demo track.", e);
            this.startSynthPlayback();
        });

        this.audio.addEventListener("play", () => {
            this.isPlaying = true;
            this.updatePlayPauseUI(true);
            this.startVisualizer();
            this.updateActiveSongHighlight();
        });

        this.audio.addEventListener("pause", () => {
            this.isPlaying = false;
            this.updatePlayPauseUI(false);
            this.stopVisualizer();
            this.updateActiveSongHighlight();
        });
    }

    initDOM() {
        // Elements in Mini Player
        this.miniPlayer = document.getElementById("globalMusicPlayer");
        this.miniCover = document.getElementById("playerThumb");
        this.miniTitle = document.getElementById("playerTitle");
        this.miniArtist = document.getElementById("playerArtist");
        this.miniPlayPauseBtn = document.getElementById("playerPlayPauseBtn");
        this.miniPlayIcon = document.getElementById("playerPlayIcon");
        this.miniPrevBtn = document.getElementById("playerPrevBtn");
        this.miniNextBtn = document.getElementById("playerNextBtn");
        this.miniProgressBar = document.getElementById("playerProgressBar");
        this.miniScrubber = document.getElementById("playerScrubber");
        this.miniCurrentTime = document.getElementById("playerCurrentTime");
        this.miniDuration = document.getElementById("playerTotalDuration");
        this.miniVolumeBtn = document.getElementById("playerVolumeBtn");
        this.miniVolumeIcon = document.getElementById("playerVolumeIcon");
        this.miniVolumeSlider = document.getElementById("playerVolumeSlider");
        this.miniLikeBtn = document.getElementById("playerLikeBtn");
        this.miniShuffleBtn = document.getElementById("playerShuffleBtn");
        this.miniRepeatBtn = document.getElementById("playerRepeatBtn");
        this.miniQueueBtn = document.getElementById("playerQueueToggleBtn");
        this.miniExpandBtn = document.getElementById("playerExpandBtn");

        // Elements in Expanded Player Modal
        this.expandedModal = document.getElementById("expandedPlayerModal");
        this.expandedBackdrop = document.getElementById("expandedBackdrop");
        this.expandedCloseBtn = document.getElementById("expandedCloseBtn");
        this.expandedCover = document.getElementById("expandedCover");
        this.expandedTitle = document.getElementById("expandedTitle");
        this.expandedArtist = document.getElementById("expandedArtist");
        this.expandedAlbum = document.getElementById("expandedAlbum");
        this.expandedGenre = document.getElementById("expandedGenre");
        this.expandedPlayPauseBtn = document.getElementById("expandedPlayPauseBtn");
        this.expandedPlayIcon = document.getElementById("expandedPlayIcon");
        this.expandedPrevBtn = document.getElementById("expandedPrevBtn");
        this.expandedNextBtn = document.getElementById("expandedNextBtn");
        this.expandedProgressBar = document.getElementById("expandedProgressBar");
        this.expandedScrubber = document.getElementById("expandedScrubber");
        this.expandedCurrentTime = document.getElementById("expandedCurrentTime");
        this.expandedDuration = document.getElementById("expandedDuration");
        this.expandedLikeBtn = document.getElementById("expandedLikeBtn");
        this.expandedShuffleBtn = document.getElementById("expandedShuffleBtn");
        this.expandedRepeatBtn = document.getElementById("expandedRepeatBtn");
        this.expandedSpeedBtn = document.getElementById("expandedSpeedBtn");
        this.expandedSpeedLabel = document.getElementById("expandedSpeedLabel");
        this.expandedLyrics = document.getElementById("expandedLyrics");

        // Queue Drawer
        this.queueDrawer = document.getElementById("queueDrawer");
        this.queueCloseBtn = document.getElementById("queueCloseBtn");
        this.queueList = document.getElementById("queueListContainer");
        this.queueBadge = document.getElementById("playerQueueBadge");
        this.queueClearBtn = document.getElementById("queueClearBtn");

        // Bind Mini Player Controls
        if (this.miniPlayPauseBtn) {
            this.miniPlayPauseBtn.addEventListener("click", () => this.togglePlayPause());
        }
        if (this.miniPrevBtn) {
            this.miniPrevBtn.addEventListener("click", () => this.playPrevious());
        }
        if (this.miniNextBtn) {
            this.miniNextBtn.addEventListener("click", () => this.playNext());
        }
        if (this.miniShuffleBtn) {
            this.miniShuffleBtn.addEventListener("click", () => this.toggleShuffle());
        }
        if (this.miniRepeatBtn) {
            this.miniRepeatBtn.addEventListener("click", () => this.toggleRepeat());
        }
        if (this.miniVolumeBtn) {
            this.miniVolumeBtn.addEventListener("click", () => this.toggleMute());
        }
        if (this.miniVolumeSlider) {
            this.miniVolumeSlider.addEventListener("input", (e) => this.setVolume(parseFloat(e.target.value)));
        }
        if (this.miniLikeBtn) {
            this.miniLikeBtn.addEventListener("click", () => this.toggleLikeCurrentSong());
        }
        if (this.miniScrubber) {
            this.miniScrubber.addEventListener("click", (e) => this.handleScrubClick(e, this.miniScrubber));
        }
        if (this.miniQueueBtn) {
            this.miniQueueBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleQueueDrawer();
            });
        }
        if (this.miniExpandBtn) {
            this.miniExpandBtn.addEventListener("click", () => this.openExpandedPlayer());
        }

        // Bind Expanded Player Controls
        if (this.expandedCloseBtn) {
            this.expandedCloseBtn.addEventListener("click", () => this.closeExpandedPlayer());
        }
        if (this.expandedBackdrop) {
            this.expandedBackdrop.addEventListener("click", () => this.closeExpandedPlayer());
        }
        if (this.expandedPlayPauseBtn) {
            this.expandedPlayPauseBtn.addEventListener("click", () => this.togglePlayPause());
        }
        if (this.expandedPrevBtn) {
            this.expandedPrevBtn.addEventListener("click", () => this.playPrevious());
        }
        if (this.expandedNextBtn) {
            this.expandedNextBtn.addEventListener("click", () => this.playNext());
        }
        if (this.expandedShuffleBtn) {
            this.expandedShuffleBtn.addEventListener("click", () => this.toggleShuffle());
        }
        if (this.expandedRepeatBtn) {
            this.expandedRepeatBtn.addEventListener("click", () => this.toggleRepeat());
        }
        if (this.expandedLikeBtn) {
            this.expandedLikeBtn.addEventListener("click", () => this.toggleLikeCurrentSong());
        }
        if (this.expandedScrubber) {
            this.expandedScrubber.addEventListener("click", (e) => this.handleScrubClick(e, this.expandedScrubber));
        }
        if (this.expandedSpeedBtn) {
            this.expandedSpeedBtn.addEventListener("click", () => this.cyclePlaybackSpeed());
        }

        // Bind Queue Drawer
        if (this.queueCloseBtn) {
            this.queueCloseBtn.addEventListener("click", () => this.closeQueueDrawer());
        }
        if (this.queueClearBtn) {
            this.queueClearBtn.addEventListener("click", () => this.clearQueue());
        }
    }

    initKeyboardControls() {
        document.addEventListener("keydown", (e) => {
            // Ignore if active element is an input or textarea
            const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
            if (tag === "input" || tag === "textarea" || tag === "select") return;

            // Space: Play/Pause (only if not cinema modal)
            if (e.code === "Space") {
                const cinemaModal = document.getElementById("cinemaPlayerModal");
                if (!cinemaModal || !cinemaModal.classList.contains("active")) {
                    e.preventDefault();
                    this.togglePlayPause();
                }
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                this.seekRelative(5);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.seekRelative(-5);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                this.setVolume(Math.min(1.0, this.volume + 0.1));
                if (typeof showToast === "function") showToast(`🔊 Volume: ${Math.round(this.volume * 100)}%`);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                this.setVolume(Math.max(0.0, this.volume - 0.1));
                if (typeof showToast === "function") showToast(`🔉 Volume: ${Math.round(this.volume * 100)}%`);
            } else if (e.key.toLowerCase() === "m") {
                this.toggleMute();
            } else if (e.key.toLowerCase() === "n") {
                this.playNext();
            } else if (e.key.toLowerCase() === "p") {
                this.playPrevious();
            } else if (e.key.toLowerCase() === "l") {
                this.toggleLikeCurrentSong();
            } else if (e.key.toLowerCase() === "f") {
                this.toggleExpandedPlayer();
            } else if (e.key.toLowerCase() === "s") {
                this.toggleShuffle();
            } else if (e.key.toLowerCase() === "r") {
                this.toggleRepeat();
            } else if (e.key === "Escape") {
                this.closeExpandedPlayer();
                this.closeQueue();
            }
        });
    }

    // Play an entire playlist sequence or shuffled
    playPlaylist(songsList, shuffle = false) {
        if (!songsList || songsList.length === 0) {
            if (typeof showToast === "function") showToast("Playlist is currently empty.", "warning");
            return;
        }

        let queueList = [...songsList];
        if (shuffle) {
            for (let i = queueList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queueList[i], queueList[j]] = [queueList[j], queueList[i]];
            }
        }

        this.queue = queueList;
        this.currentIndex = 0;
        this.isShuffle = shuffle;
        if (this.shuffleBtn) this.shuffleBtn.classList.toggle("active", shuffle);
        if (this.expandedShuffleBtn) this.expandedShuffleBtn.classList.toggle("active", shuffle);

        this.playSong(this.queue[0], false);
        this.renderQueueDrawer();

        if (typeof showToast === "function") {
            showToast(`🎶 Playing playlist (${queueList.length} tracks)${shuffle ? ' in Shuffle mode' : ''}!`, "success");
        }
    }

    // ======================================================================
    // CORE PLAYBACK METHODS
    // ======================================================================

    playSong(song, autoQueueRest = true, contextList = null) {
        if (!song) return;

        this.stopSynth();
        this.currentSong = song;

        // If context list given, enqueue all songs from that list
        if (autoQueueRest && contextList && Array.isArray(contextList)) {
            this.queue = [...contextList];
            this.currentIndex = this.queue.findIndex(s => s.id === song.id);
            if (this.currentIndex === -1) {
                this.queue.unshift(song);
                this.currentIndex = 0;
            }
        } else if (!this.queue.some(s => s.id === song.id)) {
            this.queue.push(song);
            this.currentIndex = this.queue.length - 1;
        } else {
            this.currentIndex = this.queue.findIndex(s => s.id === song.id);
        }

        // Show player bar
        if (this.miniPlayer) {
            this.miniPlayer.classList.add("visible");
            document.body.classList.add("has-music-player");
        }

        // Update UI info
        this.updatePlayerInfo(song);
        this.updateQueueUI();
        this.saveToHistory(song);

        // Sync playback with backend API
        if (window.himstreamxAPI) {
            window.himstreamxAPI.recordSongPlay(song.id).catch(() => {});
        }

        // Try playing source
        this.isUsingSynth = false;
        this.audio.src = song.audioUrl || "";
        this.audio.playbackRate = this.playbackSpeed;

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updatePlayPauseUI(true);
                if (typeof showToast === "function") {
                    showToast(`🎵 Now Playing: ${song.title} (${song.artist})`, "success");
                }
            }).catch(() => {
                // Autoplay blocked or URL unavailable -> smoothly trigger synth
                this.startSynthPlayback();
            });
        }
    }

    pause() {
        if (this.isPlaying) {
            if (this.isUsingSynth) {
                this.pauseSynth();
            } else {
                this.audio.pause();
            }
            this.isPlaying = false;
            this.updatePlayPauseUI(false);
        }
    }

    togglePlayPause() {
        if (!this.currentSong) {
            // If nothing is playing, play first song from catalog
            if (window.SONGS_DATABASE && window.SONGS_DATABASE.length > 0) {
                this.playSong(window.SONGS_DATABASE[0], true, window.SONGS_DATABASE);
            }
            return;
        }

        if (this.isPlaying) {
            if (this.isUsingSynth) {
                this.pauseSynth();
            } else {
                this.audio.pause();
            }
            this.isPlaying = false;
            this.updatePlayPauseUI(false);
            if (typeof showToast === "function") showToast("⏸ Music Paused");
        } else {
            if (this.isUsingSynth) {
                this.resumeSynth();
            } else {
                this.audio.play().catch(() => this.startSynthPlayback());
            }
            this.isPlaying = true;
            this.updatePlayPauseUI(true);
            if (typeof showToast === "function") showToast("▶ Music Resumed", "success");
        }
    }

    playNext() {
        if (this.queue.length === 0) return;

        let nextIdx;
        if (this.isShuffle) {
            nextIdx = Math.floor(Math.random() * this.queue.length);
        } else {
            nextIdx = (this.currentIndex + 1) % this.queue.length;
        }

        this.currentIndex = nextIdx;
        this.playSong(this.queue[this.currentIndex], false);
    }

    playPrevious() {
        if (this.queue.length === 0) return;

        // If playback is past 3 seconds, replay current song from beginning
        if (this.audio.currentTime > 3 || (this.isUsingSynth && this.synthTime > 3)) {
            this.seekTo(0);
            return;
        }

        let prevIdx = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
        this.currentIndex = prevIdx;
        this.playSong(this.queue[this.currentIndex], false);
    }

    handleSongEnd() {
        if (this.repeatMode === "one") {
            this.seekTo(0);
            this.audio.play().catch(() => this.startSynthPlayback());
        } else if (this.repeatMode === "all" || this.isShuffle) {
            this.playNext();
        } else {
            // Repeat is off
            if (this.currentIndex < this.queue.length - 1) {
                this.playNext();
            } else {
                this.isPlaying = false;
                this.updatePlayPauseUI(false);
                this.seekTo(0);
            }
        }
    }

    seekTo(seconds) {
        if (this.isUsingSynth) {
            this.synthTime = Math.max(0, seconds);
        } else {
            if (this.audio.duration) {
                this.audio.currentTime = Math.min(seconds, this.audio.duration);
            }
        }
        const total = this.currentSong ? this.currentSong.durationSec : 180;
        this.updateProgress(seconds, total);
    }

    seekRelative(deltaSeconds) {
        if (this.isUsingSynth) {
            this.seekTo(this.synthTime + deltaSeconds);
        } else {
            this.seekTo(this.audio.currentTime + deltaSeconds);
        }
    }

    handleScrubClick(event, container) {
        const rect = container.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(1, clickX / width));

        const totalDuration = (this.isUsingSynth || !this.audio.duration)
            ? (this.currentSong ? this.currentSong.durationSec : 200)
            : this.audio.duration;

        const targetTime = percent * totalDuration;
        this.seekTo(targetTime);
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        this.audio.volume = this.volume;
        this.isMuted = this.volume === 0;

        if (this.miniVolumeSlider) this.miniVolumeSlider.value = this.volume;
        this.updateVolumeUI();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.audio.muted = true;
            if (this.miniVolumeSlider) this.miniVolumeSlider.value = 0;
            if (typeof showToast === "function") showToast("🔇 Music Muted");
        } else {
            this.audio.muted = false;
            this.audio.volume = this.volume || 0.8;
            if (this.miniVolumeSlider) this.miniVolumeSlider.value = this.volume || 0.8;
            if (typeof showToast === "function") showToast("🔊 Music Unmuted");
        }
        this.updateVolumeUI();
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        if (this.miniShuffleBtn) {
            this.miniShuffleBtn.classList.toggle("active", this.isShuffle);
        }
        if (this.expandedShuffleBtn) {
            this.expandedShuffleBtn.classList.toggle("active", this.isShuffle);
        }
        if (typeof showToast === "function") {
            showToast(this.isShuffle ? "🔀 Shuffle On" : "➡️ Shuffle Off");
        }
    }

    toggleRepeat() {
        const modes = ["off", "all", "one"];
        const nextIdx = (modes.indexOf(this.repeatMode) + 1) % modes.length;
        this.repeatMode = modes[nextIdx];

        const updateBtn = (btn) => {
            if (!btn) return;
            btn.classList.remove("active", "repeat-one");
            if (this.repeatMode === "all") {
                btn.classList.add("active");
                btn.title = "Repeat: All";
                btn.innerHTML = `<i class="fa-solid fa-repeat"></i>`;
            } else if (this.repeatMode === "one") {
                btn.classList.add("active", "repeat-one");
                btn.title = "Repeat: One";
                btn.innerHTML = `<i class="fa-solid fa-repeat"></i><span class="repeat-sub">1</span>`;
            } else {
                btn.title = "Repeat: Off";
                btn.innerHTML = `<i class="fa-solid fa-repeat"></i>`;
            }
        };

        updateBtn(this.miniRepeatBtn);
        updateBtn(this.expandedRepeatBtn);

        if (typeof showToast === "function") {
            showToast(`🔁 Repeat: ${this.repeatMode.toUpperCase()}`);
        }
    }

    cyclePlaybackSpeed() {
        const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
        const nextIdx = (speeds.indexOf(this.playbackSpeed) + 1) % speeds.length;
        this.playbackSpeed = speeds[nextIdx];
        this.audio.playbackRate = this.playbackSpeed;

        if (this.expandedSpeedLabel) {
            this.expandedSpeedLabel.textContent = `${this.playbackSpeed}x`;
        }
        if (typeof showToast === "function") {
            showToast(`⚡ Speed: ${this.playbackSpeed}x`);
        }
    }

    // ======================================================================
    // WEB AUDIO API MELODIC SYNTHESIZER FALLBACK
    // (Never leaves user with silence or broken audio errors!)
    // ======================================================================

    startSynthPlayback() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            if (!this.synthCtx) {
                this.synthCtx = new AudioContext();
            }
            if (this.synthCtx.state === "suspended") {
                this.synthCtx.resume();
            }

            this.isUsingSynth = true;
            this.isPlaying = true;
            this.synthTime = 0;
            this.updatePlayPauseUI(true);

            // Generate warm, musical lo-fi chord progressions (Pentatonic / Ambient)
            const chords = [
                [261.63, 329.63, 392.00, 493.88], // Cmaj7
                [220.00, 261.63, 329.63, 392.00], // Amin7
                [174.61, 220.00, 261.63, 329.63], // Fmaj7
                [196.00, 246.94, 293.66, 349.23]  // G7
            ];
            let chordIdx = 0;

            const playChordStep = () => {
                if (!this.isPlaying || !this.isUsingSynth) return;
                const currentChord = chords[chordIdx % chords.length];
                chordIdx++;

                const now = this.synthCtx.currentTime;
                currentChord.forEach((freq, i) => {
                    const osc = this.synthCtx.createOscillator();
                    const gain = this.synthCtx.createGain();
                    const filter = this.synthCtx.createBiquadFilter();

                    osc.type = i === 0 ? "triangle" : "sine";
                    osc.frequency.setValueAtTime(freq, now);

                    filter.type = "lowpass";
                    filter.frequency.setValueAtTime(800 + i * 200, now);

                    const baseGain = (this.isMuted ? 0 : this.volume) * 0.08;
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.linearRampToValueAtTime(baseGain, now + 0.3);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.synthCtx.destination);

                    osc.start(now);
                    osc.stop(now + 2.0);
                });
            };

            clearInterval(this.synthInterval);
            playChordStep();
            this.synthInterval = setInterval(() => {
                this.synthTime += 1.8;
                playChordStep();
                const total = this.currentSong ? this.currentSong.durationSec : 200;
                this.updateProgress(this.synthTime, total);
                if (this.synthTime >= total) {
                    this.handleSongEnd();
                }
            }, 1800);

            this.startVisualizer();
            this.updateActiveSongHighlight();
        } catch (err) {
            console.error("Synthesizer error:", err);
        }
    }

    pauseSynth() {
        clearInterval(this.synthInterval);
        this.stopVisualizer();
    }

    resumeSynth() {
        this.startSynthPlayback();
    }

    stopSynth() {
        clearInterval(this.synthInterval);
        this.isUsingSynth = false;
        this.synthTime = 0;
    }

    // ======================================================================
    // REAL-TIME AUDIO VISUALIZER / EQUALIZER SIMULATOR
    // ======================================================================

    startVisualizer() {
        const visualizerBars = document.querySelectorAll(".audio-visualizer-bar");
        if (visualizerBars.length === 0) return;

        clearInterval(this.visualizerInterval);
        this.visualizerInterval = setInterval(() => {
            visualizerBars.forEach(bar => {
                const height = Math.floor(Math.random() * 85) + 15;
                bar.style.height = `${height}%`;
            });
        }, 120);
    }

    stopVisualizer() {
        clearInterval(this.visualizerInterval);
        const visualizerBars = document.querySelectorAll(".audio-visualizer-bar");
        visualizerBars.forEach(bar => {
            bar.style.height = "18%";
        });
    }

    // ======================================================================
    // QUEUE MANAGEMENT
    // ======================================================================

    addToQueue(song) {
        if (!song) return;
        this.queue.push(song);
        this.updateQueueUI();
        if (typeof showToast === "function") {
            showToast(`📋 Added "${song.title}" to Queue`, "success");
        }
    }

    removeFromQueue(index, e) {
        if (e) e.stopPropagation();
        if (index >= 0 && index < this.queue.length) {
            const removed = this.queue.splice(index, 1)[0];
            if (index < this.currentIndex) {
                this.currentIndex--;
            } else if (index === this.currentIndex) {
                if (this.queue.length > 0) {
                    this.playSong(this.queue[this.currentIndex % this.queue.length], false);
                } else {
                    this.stopPlayback();
                }
            }
            this.updateQueueUI();
            if (typeof showToast === "function") {
                showToast(`Removed "${removed.title}" from Queue`);
            }
        }
    }

    clearQueue() {
        this.queue = this.currentSong ? [this.currentSong] : [];
        this.currentIndex = 0;
        this.updateQueueUI();
        if (typeof showToast === "function") {
            showToast("Queue cleared");
        }
    }

    toggleQueueDrawer() {
        if (!this.queueDrawer) return;
        this.queueDrawer.classList.toggle("open");
        this.updateQueueUI();
    }

    closeQueueDrawer() {
        if (this.queueDrawer) this.queueDrawer.classList.remove("open");
    }

    updateQueueUI() {
        if (this.queueBadge) {
            this.queueBadge.textContent = this.queue.length;
        }

        if (!this.queueList) return;

        if (this.queue.length === 0) {
            this.queueList.innerHTML = `
                <div class="empty-queue-msg">
                    <i class="fa-solid fa-music"></i>
                    <p>Your queue is empty</p>
                    <span>Play a song or browse music to queue more tracks</span>
                </div>
            `;
            return;
        }

        this.queueList.innerHTML = this.queue.map((song, idx) => {
            const isPlayingThis = this.currentSong && this.currentSong.id === song.id;
            return `
                <div class="queue-item ${isPlayingThis ? 'playing' : ''}" onclick="window.himstreamxPlayer.playSongFromQueue(${idx})">
                    <span class="queue-num">${isPlayingThis ? '<i class="fa-solid fa-volume-high text-red"></i>' : idx + 1}</span>
                    <img class="queue-thumb" src="${song.coverImage}" alt="${song.title}">
                    <div class="queue-info">
                        <h5 class="queue-title">${song.title}</h5>
                        <span class="queue-artist">${song.artist}</span>
                    </div>
                    <span class="queue-duration">${song.duration}</span>
                    <button class="queue-remove-btn" title="Remove" onclick="window.himstreamxPlayer.removeFromQueue(${idx}, event)">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        }).join("");
    }

    playSongFromQueue(index) {
        if (index >= 0 && index < this.queue.length) {
            this.currentIndex = index;
            this.playSong(this.queue[index], false);
        }
    }

    stopPlayback() {
        this.audio.pause();
        this.stopSynth();
        this.isPlaying = false;
        this.currentSong = null;
        this.updatePlayPauseUI(false);
        if (this.miniPlayer) this.miniPlayer.classList.remove("visible");
        document.body.classList.remove("has-music-player");
    }

    // ======================================================================
    // LIKED SONGS & HISTORY
    // ======================================================================

    loadLikedSongs() {
        try {
            const stored = localStorage.getItem(this.STORAGE_LIKED);
            this.likedIds = stored ? JSON.parse(stored) : ["song-kesariya-lofi", "song-lollipop-lagelu-remix", "song-excuses-urban"];
        } catch (e) {
            this.likedIds = [];
        }
    }

    saveLikedSongs() {
        try {
            localStorage.setItem(this.STORAGE_LIKED, JSON.stringify(this.likedIds));
            this.updateLikeUI();
            if (typeof window.renderLikedSongsView === "function") {
                window.renderLikedSongsView();
            }
        } catch (e) {
            console.error(e);
        }
    }

    isSongLiked(songId) {
        return this.likedIds && this.likedIds.includes(songId);
    }

    toggleLikeCurrentSong() {
        if (!this.currentSong) return;
        this.toggleLikeSong(this.currentSong.id);
    }

    toggleLikeSong(songId) {
        if (!this.likedIds) this.loadLikedSongs();

        // Sync with backend API
        if (window.himstreamxAPI) {
            window.himstreamxAPI.toggleLikedSong(songId).catch(() => {});
        }

        const exists = this.likedIds.includes(songId);
        const song = (window.SONGS_DATABASE || []).find(s => s.id === songId);
        const name = song ? song.title : "Song";

        if (exists) {
            this.likedIds = this.likedIds.filter(id => id !== songId);
            this.saveLikedSongs();
            if (typeof showToast === "function") showToast(`🤍 Removed "${name}" from Liked Songs`);
        } else {
            this.likedIds.push(songId);
            this.saveLikedSongs();
            if (typeof showToast === "function") showToast(`❤️ Added "${name}" to Liked Songs`, "success");
        }
        this.updateLikeUI();
    }

    saveToHistory(song) {
        try {
            const stored = localStorage.getItem(this.STORAGE_HISTORY);
            let history = stored ? JSON.parse(stored) : [];
            history = history.filter(item => item.id !== song.id);
            history.unshift({
                id: song.id,
                playedAt: new Date().toISOString(),
                title: song.title,
                artist: song.artist,
                coverImage: song.coverImage
            });
            // Keep top 20
            history = history.slice(0, 20);
            localStorage.setItem(this.STORAGE_HISTORY, JSON.stringify(history));

            // Refresh "Continue Listening" row if rendered
            if (typeof window.renderContinueListeningRow === "function") {
                window.renderContinueListeningRow();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // ======================================================================
    // UI UPDATES & HIGHLIGHTS
    // ======================================================================

    updatePlayerInfo(song) {
        if (!song) return;

        // Mini player
        if (this.miniCover) this.miniCover.src = song.coverImage;
        if (this.miniTitle) this.miniTitle.textContent = song.title;
        if (this.miniArtist) this.miniArtist.textContent = song.artist;
        if (this.miniDuration) this.miniDuration.textContent = song.duration;

        // Expanded player
        if (this.expandedCover) this.expandedCover.src = song.coverImage;
        if (this.expandedTitle) this.expandedTitle.textContent = song.title;
        if (this.expandedArtist) this.expandedArtist.textContent = song.artist;
        if (this.expandedAlbum) this.expandedAlbum.textContent = song.album || "HIMSTREAMX Original";
        if (this.expandedGenre) this.expandedGenre.textContent = `${song.language} • ${song.genre}`;
        if (this.expandedDuration) this.expandedDuration.textContent = song.duration;
        if (this.expandedLyrics) {
            this.expandedLyrics.innerHTML = `
                <div class="lyrics-card">
                    <h4><i class="fa-solid fa-quote-left"></i> Song Lyrics & Highlights</h4>
                    <p class="lyrics-text">${song.lyrics || "Lyrics unavailable for this demo release."}</p>
                    <span class="lyrics-tag">Certified HIMSTREAMX Master Audio</span>
                </div>
            `;
        }

        this.updateLikeUI();
        this.updateActiveSongHighlight();
    }

    updatePlayPauseUI(playing) {
        const setIcon = (iconEl) => {
            if (!iconEl) return;
            if (playing) {
                iconEl.className = "fa-solid fa-pause";
            } else {
                iconEl.className = "fa-solid fa-play";
            }
        };

        setIcon(this.miniPlayIcon);
        setIcon(this.expandedPlayIcon);

        // Vinyl rotation in expanded player
        const vinylArt = document.querySelector(".expanded-vinyl-art");
        if (vinylArt) {
            if (playing) {
                vinylArt.classList.add("playing");
            } else {
                vinylArt.classList.remove("playing");
            }
        }
    }

    updateProgress(currentSec, totalSec) {
        const formatTime = (sec) => {
            if (isNaN(sec) || sec < 0) return "0:00";
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        const percent = totalSec > 0 ? (currentSec / totalSec) * 100 : 0;

        if (this.miniProgressBar) this.miniProgressBar.style.width = `${percent}%`;
        if (this.miniCurrentTime) this.miniCurrentTime.textContent = formatTime(currentSec);

        if (this.expandedProgressBar) this.expandedProgressBar.style.width = `${percent}%`;
        if (this.expandedCurrentTime) this.expandedCurrentTime.textContent = formatTime(currentSec);
    }

    updateVolumeUI() {
        const setVolIcon = (iconEl) => {
            if (!iconEl) return;
            if (this.isMuted || this.volume === 0) {
                iconEl.className = "fa-solid fa-volume-xmark";
            } else if (this.volume < 0.5) {
                iconEl.className = "fa-solid fa-volume-low";
            } else {
                iconEl.className = "fa-solid fa-volume-high";
            }
        };

        setVolIcon(this.miniVolumeIcon);
    }

    updateLikeUI() {
        const liked = this.currentSong ? this.isSongLiked(this.currentSong.id) : false;

        const updateBtn = (btn) => {
            if (!btn) return;
            btn.classList.toggle("liked", liked);
            if (liked) {
                btn.innerHTML = `<i class="fa-solid fa-heart text-red"></i>`;
                btn.title = "Liked";
            } else {
                btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
                btn.title = "Like this song";
            }
        };

        updateBtn(this.miniLikeBtn);
        updateBtn(this.expandedLikeBtn);
    }

    updateActiveSongHighlight() {
        const allSongCards = document.querySelectorAll(".song-card, .song-row-item");
        allSongCards.forEach(card => {
            const songId = card.getAttribute("data-song-id");
            if (this.currentSong && songId === this.currentSong.id) {
                card.classList.add("currently-playing");
                const playBtn = card.querySelector(".song-play-btn i, .song-row-play i");
                if (playBtn) {
                    playBtn.className = this.isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
                }
            } else {
                card.classList.remove("currently-playing");
                const playBtn = card.querySelector(".song-play-btn i, .song-row-play i");
                if (playBtn) {
                    playBtn.className = "fa-solid fa-play";
                }
            }
        });
    }

    openExpandedPlayer() {
        if (!this.expandedModal) return;
        this.expandedModal.classList.add("open");
        document.body.style.overflow = "hidden";
        if (this.currentSong) {
            this.updatePlayerInfo(this.currentSong);
        }
    }

    closeExpandedPlayer() {
        if (!this.expandedModal) return;
        this.expandedModal.classList.remove("open");
        document.body.style.overflow = "";
    }
}

// Global initialization
if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        window.himstreamxPlayer = new HimstreamxMusicPlayer();
    });
}

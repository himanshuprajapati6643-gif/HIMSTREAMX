import sqlite3
from contextlib import contextmanager
from backend.config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DATABASE_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initializes the database schema with relational tables, foreign keys, and indexes."""
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Users Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            avatar TEXT DEFAULT 'HP',
            plan TEXT DEFAULT 'Standard 4K + Music',
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Movies & Series Catalog Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS movies (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'movie',
            genres TEXT NOT NULL,
            year INTEGER NOT NULL,
            rating REAL DEFAULT 8.0,
            match INTEGER DEFAULT 95,
            age TEXT DEFAULT '16+',
            duration TEXT DEFAULT '2h 00m',
            quality TEXT DEFAULT '4K Ultra HD',
            badge TEXT,
            is_trending INTEGER DEFAULT 0,
            is_popular INTEGER DEFAULT 1,
            is_top10 INTEGER DEFAULT 0,
            poster TEXT NOT NULL,
            backdrop TEXT,
            trailer_id TEXT,
            description TEXT,
            director TEXT,
            cast_list TEXT,
            audio TEXT,
            subtitles TEXT,
            stream_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Series Episodes Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS series_episodes (
            id TEXT PRIMARY KEY,
            movie_id TEXT NOT NULL,
            season_num INTEGER DEFAULT 1,
            episode_num INTEGER NOT NULL,
            title TEXT NOT NULL,
            duration TEXT,
            description TEXT,
            thumbnail_url TEXT,
            stream_url TEXT,
            FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
        );
        """)

        # 4. Songs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT,
            language TEXT NOT NULL,
            genre TEXT NOT NULL,
            year INTEGER NOT NULL,
            duration TEXT NOT NULL,
            duration_sec INTEGER NOT NULL,
            cover_image TEXT NOT NULL,
            audio_url TEXT NOT NULL,
            category TEXT DEFAULT 'Trending',
            popularity INTEGER DEFAULT 90,
            is_trending INTEGER DEFAULT 0,
            lyrics TEXT,
            play_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 5. Artists Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            role TEXT,
            language TEXT,
            monthly_listeners TEXT,
            avatar TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 6. Albums Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS albums (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist_id TEXT,
            release_year INTEGER,
            cover_image TEXT,
            genre TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE SET NULL
        );
        """)

        # 7. Genres Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS genres (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            type TEXT DEFAULT 'music',
            icon TEXT,
            color TEXT,
            track_count TEXT
        );
        """)

        # 8. Playlists Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS playlists (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            is_public INTEGER DEFAULT 1,
            cover_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 9. Playlist Songs Table (Many-to-Many with Order)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS playlist_songs (
            id TEXT PRIMARY KEY,
            playlist_id TEXT NOT NULL,
            song_id TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
            FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE,
            UNIQUE(playlist_id, song_id)
        );
        """)

        # 10. Watchlists Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS watchlists (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            movie_id TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
            UNIQUE(user_id, movie_id)
        );
        """)

        # 11. Favourites / Liked Songs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS favourites (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            item_type TEXT NOT NULL, -- 'song' or 'movie'
            item_id TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id, item_type, item_id)
        );
        """)

        # 12. Watch History Table (With Resume Position)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS watch_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            movie_id TEXT NOT NULL,
            progress_percent INTEGER DEFAULT 0,
            progress_seconds INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
        );
        """)

        # 13. Listening History Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS listening_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            song_id TEXT NOT NULL,
            duration_played_sec INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
        );
        """)

        # 14. Ratings Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ratings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            item_type TEXT NOT NULL, -- 'movie' or 'song'
            item_id TEXT NOT NULL,
            score REAL NOT NULL, -- 1.0 to 10.0
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id, item_type, item_id)
        );
        """)

        # 15. Reviews Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            item_type TEXT NOT NULL, -- 'movie' or 'song'
            item_id TEXT NOT NULL,
            review_text TEXT NOT NULL,
            rating REAL NOT NULL DEFAULT 5.0,
            is_approved INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 16. Search Logs Table (For Analytics)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            query TEXT NOT NULL,
            search_type TEXT DEFAULT 'all',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 17. System Announcements Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_announcements (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Indexes for High Performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_movies_type ON movies(type);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_movies_trending ON movies(is_trending);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_songs_lang ON songs(language);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id, item_type);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_watch_hist_user ON watch_history(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_listen_hist_user ON listening_history(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_type, item_id);")

        conn.commit()

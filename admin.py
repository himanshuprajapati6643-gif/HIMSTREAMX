import json
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.database import get_db
from backend.security import require_admin
from backend.models import (
    MovieCreateRequest,
    MovieUpdateRequest,
    SongCreateRequest,
    SongUpdateRequest,
    ArtistCreateRequest,
    ArtistUpdateRequest,
    UserStatusUpdateRequest,
    AnnouncementRequest
)
from backend.routes.movies import parse_movie_row
from backend.routes.songs import parse_song_row

router = APIRouter(prefix="/api/admin", tags=["Admin Operations & Analytics"])

# ==============================================================================
# 1. ADMIN ANALYTICS & DASHBOARD METRICS
# ==============================================================================
@router.get("/metrics")
def get_admin_metrics(admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM movies WHERE type = 'movie'")
        total_movies = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM movies WHERE type = 'series'")
        total_series = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM songs")
        total_songs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM artists")
        total_artists = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM playlists")
        total_playlists = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM reviews WHERE is_approved = 1")
        total_reviews = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM watch_history")
        total_watch_sessions = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM listening_history")
        total_listening_sessions = cursor.fetchone()[0]

        # Top 5 Popular Songs
        cursor.execute("""
        SELECT id, title, artist, play_count, popularity, cover_image as coverImage
        FROM songs ORDER BY play_count DESC, popularity DESC LIMIT 5
        """)
        popular_songs = [dict(r) for r in cursor.fetchall()]

        # Top 5 Popular Movies
        cursor.execute("""
        SELECT id, title, type, rating, year, poster
        FROM movies ORDER BY rating DESC, is_top10 ASC LIMIT 5
        """)
        popular_movies = [dict(r) for r in cursor.fetchall()]

        # Most Searched Queries
        cursor.execute("""
        SELECT query, COUNT(*) as search_count
        FROM search_logs
        GROUP BY query
        ORDER BY search_count DESC
        LIMIT 5
        """)
        top_searches = [dict(r) for r in cursor.fetchall()]

    return {
        "success": True,
        "metrics": {
            "total_users": total_users,
            "total_movies": total_movies,
            "total_series": total_series,
            "total_songs": total_songs,
            "total_artists": total_artists,
            "total_playlists": total_playlists,
            "total_reviews": total_reviews,
            "total_watch_sessions": total_watch_sessions,
            "total_listening_sessions": total_listening_sessions,
            "bandwidth_peak": "142.6 GB/s",
            "active_streams": "148,290"
        },
        "popular_songs": popular_songs,
        "popular_movies": popular_movies,
        "top_searches": top_searches
    }

# ==============================================================================
# 2. USER MANAGEMENT
# ==============================================================================
@router.get("/users")
def list_users(admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, name, email, role, avatar, plan, status, created_at
        FROM users ORDER BY created_at DESC
        """)
        users = [dict(r) for r in cursor.fetchall()]

    return {
        "success": True,
        "count": len(users),
        "data": users
    }

@router.put("/users/{user_id}/status")
def update_user_status(user_id: str, req: UserStatusUpdateRequest, admin: dict = Depends(require_admin)):
    if user_id == admin["id"] and req.role == "USER":
        raise HTTPException(status_code=400, detail="Cannot demote the primary administrator account.")

    with get_db() as conn:
        cursor = conn.cursor()
        updates = []
        params = []
        if req.status:
            updates.append("status = ?")
            params.append(req.status)
        if req.role:
            updates.append("role = ?")
            params.append(req.role)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", tuple(params))

    return {
        "success": True,
        "message": f"User {user_id} updated successfully."
    }

# ==============================================================================
# 3. MOVIES & SERIES MANAGEMENT
# ==============================================================================
@router.post("/movies")
def create_movie(req: MovieCreateRequest, admin: dict = Depends(require_admin)):
    movie_id = req.id or f"mov-{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO movies (
            id, title, type, genres, year, rating, match, age, duration, quality, badge,
            is_trending, is_popular, is_top10, poster, backdrop, trailer_id, description,
            director, cast_list, audio, subtitles, stream_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            movie_id, req.title.strip(), req.type, json.dumps(req.genres), req.year,
            req.rating, req.match, req.age, req.duration, req.quality, req.badge,
            int(req.is_trending or False), int(req.is_popular or True), req.is_top10 or 0,
            req.poster, req.backdrop or req.poster, req.trailer_id, req.description,
            req.director, json.dumps(req.cast or []), req.audio, req.subtitles, req.stream_url
        ))

    return {
        "success": True,
        "message": f"{req.type.capitalize()} '{req.title}' created successfully!",
        "movie_id": movie_id
    }

@router.put("/movies/{movie_id}")
def update_movie(movie_id: str, req: MovieUpdateRequest, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM movies WHERE id = ?", (movie_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Movie not found.")

        updates = []
        params = []
        if req.title is not None:
            updates.append("title = ?"); params.append(req.title.strip())
        if req.type is not None:
            updates.append("type = ?"); params.append(req.type)
        if req.genres is not None:
            updates.append("genres = ?"); params.append(json.dumps(req.genres))
        if req.year is not None:
            updates.append("year = ?"); params.append(req.year)
        if req.rating is not None:
            updates.append("rating = ?"); params.append(req.rating)
        if req.is_trending is not None:
            updates.append("is_trending = ?"); params.append(int(req.is_trending))
        if req.is_popular is not None:
            updates.append("is_popular = ?"); params.append(int(req.is_popular))
        if req.is_top10 is not None:
            updates.append("is_top10 = ?"); params.append(req.is_top10)
        if req.poster is not None:
            updates.append("poster = ?"); params.append(req.poster)
        if req.trailer_id is not None:
            updates.append("trailer_id = ?"); params.append(req.trailer_id)
        if req.description is not None:
            updates.append("description = ?"); params.append(req.description)

        if updates:
            params.append(movie_id)
            cursor.execute(f"UPDATE movies SET {', '.join(updates)} WHERE id = ?", tuple(params))

    return {
        "success": True,
        "message": "Title updated successfully."
    }

@router.delete("/movies/{movie_id}")
def delete_movie(movie_id: str, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    return {
        "success": True,
        "message": f"Movie/Series {movie_id} deleted."
    }

# ==============================================================================
# 4. SONGS & MUSIC MANAGEMENT
# ==============================================================================
@router.post("/songs")
def create_song(req: SongCreateRequest, admin: dict = Depends(require_admin)):
    song_id = req.id or f"song-{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO songs (
            id, title, artist, album, language, genre, year, duration, duration_sec,
            cover_image, audio_url, category, popularity, is_trending, lyrics
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            song_id, req.title.strip(), req.artist.strip(), req.album, req.language,
            req.genre, req.year, req.duration, req.duration_sec, req.cover_image,
            req.audio_url, req.category, req.popularity, int(req.is_trending or True), req.lyrics
        ))

    return {
        "success": True,
        "message": f"Song '{req.title}' by {req.artist} published to music library!",
        "song_id": song_id
    }

@router.put("/songs/{song_id}")
def update_song(song_id: str, req: SongUpdateRequest, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM songs WHERE id = ?", (song_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Song not found.")

        updates = []
        params = []
        if req.title is not None:
            updates.append("title = ?"); params.append(req.title.strip())
        if req.artist is not None:
            updates.append("artist = ?"); params.append(req.artist.strip())
        if req.album is not None:
            updates.append("album = ?"); params.append(req.album)
        if req.language is not None:
            updates.append("language = ?"); params.append(req.language)
        if req.genre is not None:
            updates.append("genre = ?"); params.append(req.genre)
        if req.year is not None:
            updates.append("year = ?"); params.append(req.year)
        if req.duration is not None:
            updates.append("duration = ?"); params.append(req.duration)
        if req.cover_image is not None:
            updates.append("cover_image = ?"); params.append(req.cover_image)
        if req.audio_url is not None:
            updates.append("audio_url = ?"); params.append(req.audio_url)
        if req.is_trending is not None:
            updates.append("is_trending = ?"); params.append(int(req.is_trending))
        if req.popularity is not None:
            updates.append("popularity = ?"); params.append(req.popularity)

        if updates:
            params.append(song_id)
            cursor.execute(f"UPDATE songs SET {', '.join(updates)} WHERE id = ?", tuple(params))

    return {
        "success": True,
        "message": "Song updated successfully."
    }

@router.delete("/songs/{song_id}")
def delete_song(song_id: str, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM songs WHERE id = ?", (song_id,))
    return {
        "success": True,
        "message": f"Song {song_id} deleted."
    }

# ==============================================================================
# 5. ARTISTS MANAGEMENT
# ==============================================================================
@router.post("/artists")
def create_artist(req: ArtistCreateRequest, admin: dict = Depends(require_admin)):
    artist_id = req.id or f"artist-{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO artists (id, name, role, language, monthly_listeners, avatar, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (artist_id, req.name.strip(), req.role, req.language, req.monthly_listeners, req.avatar, req.bio))

    return {
        "success": True,
        "message": f"Artist '{req.name}' added successfully!",
        "artist_id": artist_id
    }

@router.delete("/artists/{artist_id}")
def delete_artist(artist_id: str, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM artists WHERE id = ?", (artist_id,))
    return {
        "success": True,
        "message": f"Artist {artist_id} deleted."
    }

# ==============================================================================
# 6. REVIEWS MODERATION
# ==============================================================================
@router.get("/reviews")
def list_all_reviews(admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT r.*, u.name as user_name, u.email as user_email,
               CASE WHEN r.item_type = 'movie' THEN m.title ELSE s.title END as item_title
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN movies m ON r.item_type = 'movie' AND r.item_id = m.id
        LEFT JOIN songs s ON r.item_type = 'song' AND r.item_id = s.id
        ORDER BY r.created_at DESC
        LIMIT 100
        """)
        reviews = [dict(r) for r in cursor.fetchall()]

    return {
        "success": True,
        "count": len(reviews),
        "data": reviews
    }

@router.put("/reviews/{review_id}/moderate")
def moderate_review(review_id: str, approve: bool = True, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE reviews SET is_approved = ? WHERE id = ?", (int(approve), review_id))
    return {
        "success": True,
        "message": f"Review {'approved' if approve else 'hidden'}."
    }

@router.delete("/reviews/{review_id}")
def delete_review(review_id: str, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    return {
        "success": True,
        "message": "Review deleted."
    }

# ==============================================================================
# 7. SYSTEM ANNOUNCEMENTS
# ==============================================================================
@router.post("/announcements")
def create_announcement(req: AnnouncementRequest, admin: dict = Depends(require_admin)):
    ann_id = f"ann-{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO system_announcements (id, title, content, is_active)
        VALUES (?, ?, ?, ?)
        """, (ann_id, req.title.strip(), req.content.strip(), int(req.is_active)))
    return {
        "success": True,
        "message": "Announcement broadcasted successfully!",
        "announcement_id": ann_id
    }

@router.get("/announcements")
def list_announcements():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM system_announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5")
        announcements = [dict(r) for r in cursor.fetchall()]
    return {
        "success": True,
        "data": announcements
    }

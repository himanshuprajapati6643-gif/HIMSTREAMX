import uuid
from fastapi import APIRouter, HTTPException, Depends
from backend.database import get_db
from backend.models import (
    WatchlistToggleRequest,
    FavouriteToggleRequest,
    WatchHistoryRequest,
    ListeningHistoryRequest,
    RatingRequest,
    ReviewRequest
)
from backend.security import get_current_user
from backend.routes.movies import parse_movie_row
from backend.routes.songs import parse_song_row

router = APIRouter(prefix="/api/library", tags=["User Library, History & Reviews"])

# ==============================================================================
# 1. WATCHLIST
# ==============================================================================
@router.get("/watchlist")
def get_user_watchlist(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT m.*, w.added_at as watchlist_added_at
        FROM watchlists w
        JOIN movies m ON w.movie_id = m.id
        WHERE w.user_id = ?
        ORDER BY w.added_at DESC
        """, (user_id,))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [parse_movie_row(r) for r in rows]
    }

@router.post("/watchlist/toggle")
def toggle_watchlist(req: WatchlistToggleRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    movie_id = req.movie_id
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title FROM movies WHERE id = ?", (movie_id,))
        m_row = cursor.fetchone()
        if not m_row:
            raise HTTPException(status_code=404, detail="Movie not found.")
        title = m_row["title"]

        cursor.execute("SELECT id FROM watchlists WHERE user_id = ? AND movie_id = ?", (user_id, movie_id))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("DELETE FROM watchlists WHERE user_id = ? AND movie_id = ?", (user_id, movie_id))
            in_list = False
            msg = f"Removed '{title}' from My List."
        else:
            w_id = f"wl-{uuid.uuid4().hex[:10]}"
            cursor.execute("INSERT INTO watchlists (id, user_id, movie_id) VALUES (?, ?, ?)", (w_id, user_id, movie_id))
            in_list = True
            msg = f"Added '{title}' to My List!"

        cursor.execute("SELECT COUNT(*) FROM watchlists WHERE user_id = ?", (user_id,))
        total_count = cursor.fetchone()[0]

    return {
        "success": True,
        "in_list": in_list,
        "total_count": total_count,
        "message": msg
    }

# ==============================================================================
# 2. LIKED SONGS & FAVOURITES
# ==============================================================================
@router.get("/liked-songs")
def get_user_liked_songs(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT s.*, f.added_at as liked_at
        FROM favourites f
        JOIN songs s ON f.item_id = s.id
        WHERE f.user_id = ? AND f.item_type = 'song'
        ORDER BY f.added_at DESC
        """, (user_id,))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [parse_song_row(r) for r in rows]
    }

@router.post("/favourites/toggle")
def toggle_favourite(req: FavouriteToggleRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    item_type = req.item_type
    item_id = req.item_id

    with get_db() as conn:
        cursor = conn.cursor()

        if item_type == "song":
            cursor.execute("SELECT title FROM songs WHERE id = ?", (item_id,))
            item = cursor.fetchone()
        else:
            cursor.execute("SELECT title FROM movies WHERE id = ?", (item_id,))
            item = cursor.fetchone()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found.")
        title = item["title"]

        cursor.execute("SELECT id FROM favourites WHERE user_id = ? AND item_type = ? AND item_id = ?", (user_id, item_type, item_id))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("DELETE FROM favourites WHERE user_id = ? AND item_type = ? AND item_id = ?", (user_id, item_type, item_id))
            is_favourite = False
            msg = f"Removed '{title}' from favorites."
        else:
            fav_id = f"fav-{uuid.uuid4().hex[:10]}"
            cursor.execute("INSERT INTO favourites (id, user_id, item_type, item_id) VALUES (?, ?, ?, ?)", (fav_id, user_id, item_type, item_id))
            is_favourite = True
            msg = f"Saved '{title}' to your favorites!"

    return {
        "success": True,
        "is_favourite": is_favourite,
        "message": msg
    }

# ==============================================================================
# 3. WATCH & LISTENING HISTORY (WITH RESUME POSITION)
# ==============================================================================
@router.get("/history/watch")
def get_watch_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT m.*, wh.progress_percent, wh.progress_seconds, wh.completed, wh.watched_at
        FROM watch_history wh
        JOIN movies m ON wh.movie_id = m.id
        WHERE wh.user_id = ?
        ORDER BY wh.watched_at DESC
        LIMIT 20
        """, (user_id,))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [parse_movie_row(r) for r in rows]
    }

@router.post("/history/watch")
def record_watch_progress(req: WatchHistoryRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM watch_history WHERE user_id = ? AND movie_id = ?", (user_id, req.movie_id))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
            UPDATE watch_history
            SET progress_percent = ?, progress_seconds = ?, completed = ?, watched_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, (req.progress_percent, req.progress_seconds, int(req.completed), existing["id"]))
        else:
            wh_id = f"wh-{uuid.uuid4().hex[:10]}"
            cursor.execute("""
            INSERT INTO watch_history (id, user_id, movie_id, progress_percent, progress_seconds, completed)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (wh_id, user_id, req.movie_id, req.progress_percent, req.progress_seconds, int(req.completed)))

    return {
        "success": True,
        "message": "Playback progress saved."
    }

@router.get("/history/listening")
def get_listening_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT s.*, lh.listened_at, lh.duration_played_sec
        FROM listening_history lh
        JOIN songs s ON lh.song_id = s.id
        WHERE lh.user_id = ?
        ORDER BY lh.listened_at DESC
        LIMIT 30
        """, (user_id,))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [parse_song_row(r) for r in rows]
    }

@router.post("/history/listening")
def record_listening_history(req: ListeningHistoryRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        lh_id = f"lh-{uuid.uuid4().hex[:10]}"
        cursor.execute("""
        INSERT INTO listening_history (id, user_id, song_id, duration_played_sec, completed)
        VALUES (?, ?, ?, ?, ?)
        """, (lh_id, user_id, req.song_id, req.duration_played_sec, int(req.completed)))
        cursor.execute("UPDATE songs SET play_count = play_count + 1 WHERE id = ?", (req.song_id,))

    return {
        "success": True,
        "message": "Listening history saved."
    }

# ==============================================================================
# 4. REVIEWS & RATINGS
# ==============================================================================
@router.get("/reviews/my")
def get_my_reviews(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT r.*,
               CASE WHEN r.item_type = 'movie' THEN m.title ELSE s.title END as item_title,
               CASE WHEN r.item_type = 'movie' THEN m.poster ELSE s.cover_image END as item_cover
        FROM reviews r
        LEFT JOIN movies m ON r.item_type = 'movie' AND r.item_id = m.id
        LEFT JOIN songs s ON r.item_type = 'song' AND r.item_id = s.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [dict(r) for r in rows]
    }

@router.post("/reviews")
def submit_review(req: ReviewRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    rev_id = f"rev-{uuid.uuid4().hex[:10]}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO reviews (id, user_id, item_type, item_id, review_text, rating, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (rev_id, user_id, req.item_type, req.item_id, req.review_text.strip(), req.rating))

    return {
        "success": True,
        "message": "Your review has been submitted and published!",
        "review_id": rev_id
    }

@router.post("/ratings")
def submit_rating(req: RatingRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    rat_id = f"rat-{uuid.uuid4().hex[:10]}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO ratings (id, user_id, item_type, item_id, score)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, item_type, item_id) DO UPDATE SET score = excluded.score
        """, (rat_id, user_id, req.item_type, req.item_id, req.score))

    return {
        "success": True,
        "message": f"Rated {req.score}/10 successfully."
    }

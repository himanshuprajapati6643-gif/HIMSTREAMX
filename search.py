import uuid
from typing import Optional
from fastapi import APIRouter, Query, Depends
from backend.database import get_db
from backend.security import get_optional_current_user
from backend.routes.movies import parse_movie_row
from backend.routes.songs import parse_song_row

router = APIRouter(prefix="/api/search", tags=["Universal Search Engine"])

@router.get("")
def search_catalog(
    q: str = Query(..., min_length=1),
    type: str = Query("all", pattern="^(all|movies|music)$"),
    sort: str = Query("popularity", pattern="^(popularity|newest|title)$"),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    query_clean = q.strip().lower()
    q_like = f"%{query_clean}%"

    with get_db() as conn:
        cursor = conn.cursor()

        # Log search query
        log_id = f"slog-{uuid.uuid4().hex[:10]}"
        user_id = current_user["id"] if current_user else None
        cursor.execute("""
        INSERT INTO search_logs (id, user_id, query, search_type)
        VALUES (?, ?, ?, ?)
        """, (log_id, user_id, query_clean, type))

        movies = []
        songs = []

        if type in ("all", "movies"):
            if sort == "newest":
                m_order = "year DESC, rating DESC"
            elif sort == "title":
                m_order = "title ASC"
            else:
                m_order = "rating DESC, is_top10 ASC, year DESC"

            cursor.execute(f"""
            SELECT * FROM movies
            WHERE title LIKE ? OR director LIKE ? OR cast_list LIKE ? OR genres LIKE ?
            ORDER BY {m_order}
            LIMIT 30
            """, (q_like, q_like, q_like, q_like))
            movies = [parse_movie_row(r) for r in cursor.fetchall()]

        if type in ("all", "music"):
            if sort == "newest":
                s_order = "year DESC, popularity DESC"
            elif sort == "title":
                s_order = "title ASC"
            else:
                s_order = "popularity DESC, play_count DESC"

            cursor.execute(f"""
            SELECT * FROM songs
            WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? OR language LIKE ? OR genre LIKE ?
            ORDER BY {s_order}
            LIMIT 30
            """, (q_like, q_like, q_like, q_like, q_like))
            songs = [parse_song_row(r) for r in cursor.fetchall()]

    return {
        "success": True,
        "query": query_clean,
        "total_results": len(movies) + len(songs),
        "movies_count": len(movies),
        "songs_count": len(songs),
        "movies": movies,
        "songs": songs
    }

@router.get("/suggestions")
def search_suggestions(q: str = Query(..., min_length=1)):
    query_clean = q.strip().lower()
    q_like = f"%{query_clean}%"

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
        SELECT id, title, type, poster, rating, year FROM movies
        WHERE title LIKE ? OR director LIKE ? OR cast_list LIKE ? OR genres LIKE ?
        ORDER BY rating DESC LIMIT 4
        """, (q_like, q_like, q_like, q_like))
        movie_suggestions = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
        SELECT id, title, artist, language, duration, cover_image as coverImage, audio_url as audioUrl
        FROM songs
        WHERE title LIKE ? OR artist LIKE ? OR language LIKE ? OR genre LIKE ?
        ORDER BY popularity DESC LIMIT 4
        """, (q_like, q_like, q_like, q_like))
        song_suggestions = [dict(r) for r in cursor.fetchall()]

    return {
        "success": True,
        "movies": movie_suggestions,
        "songs": song_suggestions,
        "total": len(movie_suggestions) + len(song_suggestions)
    }

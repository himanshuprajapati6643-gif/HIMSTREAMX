import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.database import get_db

router = APIRouter(prefix="/api/movies", tags=["Movies & TV Series"])

def parse_movie_row(row):
    if not row:
        return None
    d = dict(row)
    if "genres" in d and d["genres"]:
        try:
            d["genres"] = json.loads(d["genres"])
        except Exception:
            d["genres"] = [g.strip() for g in d["genres"].split(",") if g.strip()]
    else:
        d["genres"] = []

    if "cast_list" in d and d["cast_list"]:
        try:
            d["cast"] = json.loads(d["cast_list"])
        except Exception:
            d["cast"] = [c.strip() for c in d["cast_list"].split(",") if c.strip()]
    else:
        d["cast"] = []

    d["isTrending"] = bool(d.get("is_trending", 0))
    d["isPopular"] = bool(d.get("is_popular", 0))
    d["isTop10"] = d.get("is_top10", 0)
    d["trailerId"] = d.get("trailer_id", "")
    return d

@router.get("")
def list_movies(
    type: Optional[str] = Query(None, pattern="^(movie|series)$"),
    genre: Optional[str] = None,
    trending: Optional[bool] = None,
    popular: Optional[bool] = None,
    top10: Optional[bool] = None,
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    with get_db() as conn:
        cursor = conn.cursor()
        conditions = []
        params = []

        if type:
            conditions.append("type = ?")
            params.append(type)
        if genre and genre != "all":
            conditions.append("genres LIKE ?")
            params.append(f"%{genre}%")
        if trending is True:
            conditions.append("is_trending = 1")
        if popular is True:
            conditions.append("is_popular = 1")
        if top10 is True:
            conditions.append("is_top10 > 0")
        if q:
            conditions.append("(title LIKE ? OR director LIKE ? OR cast_list LIKE ? OR genres LIKE ?)")
            q_like = f"%{q.strip()}%"
            params.extend([q_like, q_like, q_like, q_like])

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        order_clause = "ORDER BY is_top10 ASC, rating DESC, year DESC" if top10 else "ORDER BY is_trending DESC, rating DESC, year DESC"

        query = f"SELECT * FROM movies {where_clause} {order_clause} LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [parse_movie_row(r) for r in rows]
    }

@router.get("/{movie_id}")
def get_movie_details(movie_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM movies WHERE id = ?", (movie_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Movie or Series not found.")

        movie = parse_movie_row(row)

        # Fetch episodes if series
        if movie.get("type") == "series":
            cursor.execute("""
            SELECT season_num, episode_num, title, duration, description, thumbnail_url, stream_url
            FROM series_episodes WHERE movie_id = ? ORDER BY season_num ASC, episode_num ASC
            """, (movie_id,))
            movie["episodes"] = [dict(ep) for ep in cursor.fetchall()]
        else:
            movie["episodes"] = []

        # Fetch approved reviews
        cursor.execute("""
        SELECT r.id, r.review_text, r.rating, r.created_at, u.name as user_name, u.avatar as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.item_type = 'movie' AND r.item_id = ? AND r.is_approved = 1
        ORDER BY r.created_at DESC
        LIMIT 20
        """, (movie_id,))
        movie["reviews"] = [dict(rev) for rev in cursor.fetchall()]

    return {
        "success": True,
        "data": movie
    }

@router.get("/{movie_id}/similar")
def get_similar_movies(movie_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT genres FROM movies WHERE id = ?", (movie_id,))
        row = cursor.fetchone()
        if not row:
            return {"success": True, "data": []}

        try:
            genres = json.loads(row["genres"])
        except Exception:
            genres = []

        if not genres:
            cursor.execute("SELECT * FROM movies WHERE id != ? LIMIT 6", (movie_id,))
            rows = cursor.fetchall()
            return {"success": True, "data": [parse_movie_row(r) for r in rows]}

        first_genre = genres[0]
        cursor.execute("SELECT * FROM movies WHERE id != ? AND genres LIKE ? LIMIT 6", (movie_id, f"%{first_genre}%"))
        rows = cursor.fetchall()

    return {
        "success": True,
        "data": [parse_movie_row(r) for r in rows]
    }

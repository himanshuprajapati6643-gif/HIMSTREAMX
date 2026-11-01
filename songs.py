from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from backend.database import get_db
from backend.security import get_optional_current_user

router = APIRouter(prefix="/api/songs", tags=["Songs & Audio Tracks"])

def parse_song_row(row):
    if not row:
        return None
    d = dict(row)
    d["coverImage"] = d.get("cover_image", "")
    d["audioUrl"] = d.get("audio_url", "")
    d["durationSec"] = d.get("duration_sec", 200)
    d["isTrending"] = bool(d.get("is_trending", 0))
    d["playCount"] = d.get("play_count", 0)
    return d

@router.get("")
def list_songs(
    language: Optional[str] = None,
    genre: Optional[str] = None,
    category: Optional[str] = None,
    trending: Optional[bool] = None,
    q: Optional[str] = None,
    limit: int = 60,
    offset: int = 0
):
    with get_db() as conn:
        cursor = conn.cursor()
        conditions = []
        params = []

        if language and language != "all":
            conditions.append("language LIKE ?")
            params.append(f"%{language}%")
        if genre and genre != "all":
            conditions.append("genre LIKE ?")
            params.append(f"%{genre}%")
        if category and category != "all":
            conditions.append("category LIKE ?")
            params.append(f"%{category}%")
        if trending is True:
            conditions.append("is_trending = 1")
        if q:
            conditions.append("(title LIKE ? OR artist LIKE ? OR album LIKE ? OR language LIKE ? OR genre LIKE ?)")
            q_like = f"%{q.strip()}%"
            params.extend([q_like, q_like, q_like, q_like, q_like])

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        query = f"SELECT * FROM songs {where_clause} ORDER BY is_trending DESC, popularity DESC, play_count DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(rows),
        "data": [parse_song_row(r) for r in rows]
    }

@router.get("/{song_id}")
def get_song_details(song_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM songs WHERE id = ?", (song_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Song not found.")

        song = parse_song_row(row)

        cursor.execute("""
        SELECT r.id, r.review_text, r.rating, r.created_at, u.name as user_name, u.avatar as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.item_type = 'song' AND r.item_id = ? AND r.is_approved = 1
        ORDER BY r.created_at DESC
        LIMIT 20
        """, (song_id,))
        song["reviews"] = [dict(rev) for rev in cursor.fetchall()]

    return {
        "success": True,
        "data": song
    }

@router.post("/{song_id}/play")
def record_song_play(song_id: str, current_user: Optional[dict] = Depends(get_optional_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE songs SET play_count = play_count + 1 WHERE id = ?", (song_id,))

        if current_user:
            import uuid
            user_id = current_user["id"]
            hist_id = f"lh-{uuid.uuid4().hex[:10]}"
            cursor.execute("""
            INSERT INTO listening_history (id, user_id, song_id, duration_played_sec, completed)
            VALUES (?, ?, ?, 180, 0)
            """, (hist_id, user_id, song_id))

    return {
        "success": True,
        "message": "Playback logged."
    }

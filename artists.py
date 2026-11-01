from fastapi import APIRouter, HTTPException
from backend.database import get_db
from backend.routes.songs import parse_song_row

router = APIRouter(prefix="/api/artists", tags=["Artists & Musicians"])

@router.get("")
def list_artists():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM artists ORDER BY monthly_listeners DESC, name ASC")
        rows = cursor.fetchall()
        artists = []
        for r in rows:
            d = dict(r)
            d["monthlyListeners"] = d.get("monthly_listeners", "10M")
            artists.append(d)

    return {
        "success": True,
        "count": len(artists),
        "data": artists
    }

@router.get("/{artist_id}")
def get_artist(artist_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM artists WHERE id = ?", (artist_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Artist not found.")

        artist = dict(row)
        artist["monthlyListeners"] = artist.get("monthly_listeners", "10M")

    return {
        "success": True,
        "data": artist
    }

@router.get("/{artist_id}/songs")
def get_artist_songs(artist_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM artists WHERE id = ?", (artist_id,))
        artist_row = cursor.fetchone()
        if not artist_row:
            raise HTTPException(status_code=404, detail="Artist not found.")

        artist_name = artist_row["name"]
        cursor.execute("SELECT * FROM songs WHERE artist LIKE ? ORDER BY popularity DESC, year DESC", (f"%{artist_name}%",))
        song_rows = cursor.fetchall()

    return {
        "success": True,
        "count": len(song_rows),
        "data": [parse_song_row(s) for s in song_rows]
    }

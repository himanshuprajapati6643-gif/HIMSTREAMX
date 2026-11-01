import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from backend.database import get_db
from backend.models import PlaylistCreateRequest, PlaylistUpdateRequest, PlaylistAddSongRequest
from backend.security import get_current_user, get_optional_current_user
from backend.routes.songs import parse_song_row

router = APIRouter(prefix="/api/playlists", tags=["User & Curated Playlists"])

@router.get("")
def list_playlists(current_user: Optional[dict] = Depends(get_optional_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        if current_user:
            cursor.execute("""
            SELECT p.*, u.name as creator_name, COUNT(ps.song_id) as track_count
            FROM playlists p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
            WHERE p.is_public = 1 OR p.user_id = ?
            GROUP BY p.id
            ORDER BY p.updated_at DESC
            """, (current_user["id"],))
        else:
            cursor.execute("""
            SELECT p.*, u.name as creator_name, COUNT(ps.song_id) as track_count
            FROM playlists p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
            WHERE p.is_public = 1
            GROUP BY p.id
            ORDER BY p.updated_at DESC
            """)

        rows = cursor.fetchall()
        playlists = [dict(r) for r in rows]

    return {
        "success": True,
        "count": len(playlists),
        "data": playlists
    }

@router.get("/{playlist_id}")
def get_playlist_details(playlist_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT p.*, u.name as creator_name
        FROM playlists p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
        """, (playlist_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Playlist not found.")

        playlist = dict(row)

        # Fetch songs in order
        cursor.execute("""
        SELECT s.*, ps.added_at as playlist_added_at
        FROM playlist_songs ps
        JOIN songs s ON ps.song_id = s.id
        WHERE ps.playlist_id = ?
        ORDER BY ps.order_index ASC, ps.added_at ASC
        """, (playlist_id,))
        song_rows = cursor.fetchall()
        playlist["songs"] = [parse_song_row(s) for s in song_rows]
        playlist["track_count"] = len(playlist["songs"])

    return {
        "success": True,
        "data": playlist
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_playlist(req: PlaylistCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    playlist_id = f"pl-{uuid.uuid4().hex[:12]}"
    cover = req.cover_image or "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO playlists (id, user_id, title, description, is_public, cover_image)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (playlist_id, user_id, req.title.strip(), req.description, int(req.is_public), cover))

    return {
        "success": True,
        "message": f"Playlist '{req.title}' created successfully!",
        "data": {
            "id": playlist_id,
            "title": req.title.strip(),
            "description": req.description,
            "is_public": req.is_public,
            "cover_image": cover,
            "track_count": 0
        }
    }

@router.put("/{playlist_id}")
def update_playlist(playlist_id: str, req: PlaylistUpdateRequest, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM playlists WHERE id = ?", (playlist_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Playlist not found.")

        # Check ownership or admin
        if row["user_id"] != current_user["id"] and current_user.get("role") != "ADMIN":
            raise HTTPException(status_code=403, detail="Permission denied. You can only edit your own playlists.")

        updates = []
        params = []
        if req.title is not None:
            updates.append("title = ?")
            params.append(req.title.strip())
        if req.description is not None:
            updates.append("description = ?")
            params.append(req.description.strip())
        if req.is_public is not None:
            updates.append("is_public = ?")
            params.append(int(req.is_public))
        if req.cover_image is not None:
            updates.append("cover_image = ?")
            params.append(req.cover_image)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(playlist_id)
            cursor.execute(f"UPDATE playlists SET {', '.join(updates)} WHERE id = ?", tuple(params))

    return {
        "success": True,
        "message": "Playlist updated successfully."
    }

@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM playlists WHERE id = ?", (playlist_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Playlist not found.")

        if row["user_id"] != current_user["id"] and current_user.get("role") != "ADMIN":
            raise HTTPException(status_code=403, detail="Permission denied. You can only delete your own playlists.")

        cursor.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))

    return {
        "success": True,
        "message": "Playlist deleted successfully."
    }

@router.post("/{playlist_id}/songs")
def add_song_to_playlist(playlist_id: str, req: PlaylistAddSongRequest, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM playlists WHERE id = ?", (playlist_id,))
        p_row = cursor.fetchone()
        if not p_row:
            raise HTTPException(status_code=404, detail="Playlist not found.")
        if p_row["user_id"] != current_user["id"] and current_user.get("role") != "ADMIN":
            raise HTTPException(status_code=403, detail="Permission denied.")

        cursor.execute("SELECT id, title FROM songs WHERE id = ?", (req.song_id,))
        song_row = cursor.fetchone()
        if not song_row:
            raise HTTPException(status_code=404, detail="Song not found.")

        # Check if song already exists in playlist
        cursor.execute("SELECT id FROM playlist_songs WHERE playlist_id = ? AND song_id = ?", (playlist_id, req.song_id))
        if cursor.fetchone():
            return {
                "success": True,
                "message": f"'{song_row['title']}' is already in this playlist."
            }

        # Get max order index
        cursor.execute("SELECT COALESCE(MAX(order_index), 0) + 1 FROM playlist_songs WHERE playlist_id = ?", (playlist_id,))
        next_order = cursor.fetchone()[0]

        link_id = f"ps-{uuid.uuid4().hex[:10]}"
        cursor.execute("""
        INSERT INTO playlist_songs (id, playlist_id, song_id, order_index)
        VALUES (?, ?, ?, ?)
        """, (link_id, playlist_id, req.song_id, next_order))

        cursor.execute("UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (playlist_id,))

    return {
        "success": True,
        "message": f"Added '{song_row['title']}' to playlist!"
    }

@router.delete("/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(playlist_id: str, song_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM playlists WHERE id = ?", (playlist_id,))
        p_row = cursor.fetchone()
        if not p_row:
            raise HTTPException(status_code=404, detail="Playlist not found.")
        if p_row["user_id"] != current_user["id"] and current_user.get("role") != "ADMIN":
            raise HTTPException(status_code=403, detail="Permission denied.")

        cursor.execute("DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?", (playlist_id, song_id))
        cursor.execute("UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (playlist_id,))

    return {
        "success": True,
        "message": "Song removed from playlist."
    }

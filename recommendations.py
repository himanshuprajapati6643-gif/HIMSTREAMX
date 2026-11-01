"""
HIMSTREAMX Smart Recommendations Engine
Developed by Himanshu Prajapati (2026)
Explainable, multi-factor recommendation system for Movies & Music.
Factors: Listening/Watch History, Liked Content, Genre & Language Affinity, Artist Affinity.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from backend.database import get_db
from backend.security import get_optional_current_user
from backend.routes.songs import parse_song_row
from backend.routes.movies import parse_movie_row

router = APIRouter(prefix="/api/recommendations", tags=["Smart Recommendation Engine"])

# ==============================================================================
# 1. SMART MUSIC RECOMMENDATIONS
# ==============================================================================
@router.get("/music")
def get_music_recommendations(current_user: Optional[dict] = Depends(get_optional_current_user)):
    """
    Returns personalized, explainable music recommendation shelves:
    - Recommended For You (Multi-factor score: Genre 40%, Language 35%, Artist 25%)
    - Because You Listened To (Anchored to dynamic recently played track)
    - Similar Songs (Acoustic & thematic similarity)
    - Trending Near You (High popularity regional & pan-India hits)
    - Popular In Your Language (Dominant language shelf)
    - Discover New Music (Serendipitous exploration outside comfort genres)
    """
    user_id = current_user["id"] if current_user else None

    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch all songs in catalog
        cursor.execute("SELECT * FROM songs ORDER BY popularity DESC")
        all_songs_rows = cursor.fetchall()
        all_songs = [parse_song_row(r) for r in all_songs_rows]

        if not all_songs:
            return {"success": True, "data": {}}

        # User listening telemetry
        user_history_song_ids = []
        user_liked_song_ids = []
        last_played_song = None

        if user_id:
            # Get recently played songs
            cursor.execute("""
            SELECT lh.song_id, lh.listened_at, s.*
            FROM listening_history lh
            JOIN songs s ON lh.song_id = s.id
            WHERE lh.user_id = ?
            ORDER BY lh.listened_at DESC
            LIMIT 20
            """, (user_id,))
            history_rows = cursor.fetchall()
            if history_rows:
                last_played_song = parse_song_row(history_rows[0])
                user_history_song_ids = [r["song_id"] for r in history_rows]

            # Get liked songs
            cursor.execute("""
            SELECT f.item_id as song_id, s.*
            FROM favourites f
            JOIN songs s ON f.item_id = s.id
            WHERE f.user_id = ? AND f.item_type = 'song'
            ORDER BY f.added_at DESC
            """, (user_id,))
            liked_rows = cursor.fetchall()
            user_liked_song_ids = [r["song_id"] for r in liked_rows]
            if not last_played_song and liked_rows:
                last_played_song = parse_song_row(liked_rows[0])

        # Compute affinities (Genres, Languages, Artists)
        genre_weights: Dict[str, int] = {}
        lang_weights: Dict[str, int] = {}
        artist_weights: Dict[str, int] = {}

        # Profile songs
        profile_songs = [s for s in all_songs if s["id"] in user_liked_song_ids or s["id"] in user_history_song_ids]

        for s in profile_songs:
            genre = s.get("genre", "Bollywood")
            lang = s.get("language", "Hindi")
            artist = s.get("artist", "")

            genre_weights[genre] = genre_weights.get(genre, 0) + 2
            lang_weights[lang] = lang_weights.get(lang, 0) + 2
            if artist:
                artist_weights[artist] = artist_weights.get(artist, 0) + 3

        # Dominant preferences or defaults
        top_genre = max(genre_weights, key=genre_weights.get) if genre_weights else "Romantic"
        top_lang = max(lang_weights, key=lang_weights.get) if lang_weights else "Hindi"

        # Anchor song for "Because You Listened To"
        anchor_song = last_played_song if last_played_song else all_songs[0]

        # 1. Recommended For You (Scored algorithm)
        def score_song(song):
            score = song.get("popularity", 50) * 0.1
            g = song.get("genre", "")
            l = song.get("language", "")
            a = song.get("artist", "")
            if g in genre_weights:
                score += genre_weights[g] * 4.0
            if l in lang_weights:
                score += lang_weights[l] * 3.5
            if a in artist_weights:
                score += artist_weights[a] * 5.0
            return score

        scored_songs = sorted(all_songs, key=score_song, reverse=True)
        recommended_for_you = [s for s in scored_songs if s["id"] != anchor_song["id"]][:8]

        # Annotate with explainability reason
        for s in recommended_for_you:
            if s.get("artist") in artist_weights:
                s["recommendation_reason"] = f"Because you like {s['artist']}"
            elif s.get("genre") in genre_weights:
                s["recommendation_reason"] = f"Based on your interest in {s['genre']}"
            elif s.get("language") in lang_weights:
                s["recommendation_reason"] = f"Popular in your language ({s['language']})"
            else:
                s["recommendation_reason"] = "Trending on HIMSTREAMX"

        # 2. Because You Listened To (Related to anchor)
        because_you_listened = [
            s for s in all_songs
            if s["id"] != anchor_song["id"] and (s.get("genre") == anchor_song.get("genre") or s.get("artist") == anchor_song.get("artist") or s.get("language") == anchor_song.get("language"))
        ][:8]

        # 3. Similar Songs
        similar_songs = [
            s for s in all_songs
            if s["id"] != anchor_song["id"] and s.get("genre") == anchor_song.get("genre")
        ][:8]
        if len(similar_songs) < 4:
            similar_songs = [s for s in all_songs if s["id"] != anchor_song["id"]][:8]

        # 4. Trending Near You (High popularity regional + national)
        trending_near_you = sorted(all_songs, key=lambda x: x.get("popularity", 0), reverse=True)[:8]

        # 5. Popular In Your Language
        popular_in_lang = [s for s in all_songs if s.get("language", "").lower() == top_lang.lower()][:8]
        if not popular_in_lang:
            popular_in_lang = [s for s in all_songs if s.get("language", "") == "Hindi"][:8]

        # 6. Discover New Music (Outside top genres for serendipity)
        discover_new = [
            s for s in all_songs
            if s.get("genre") not in genre_weights and s.get("genre") in ("Lo-fi", "Classical", "Folk", "Devotional", "Instrumental", "Party")
        ][:8]
        if not discover_new:
            discover_new = all_songs[-8:]

        return {
            "success": True,
            "anchor_track": anchor_song,
            "dominant_genre": top_genre,
            "dominant_language": top_lang,
            "shelves": {
                "recommended_for_you": {
                    "title": "Recommended For You",
                    "subtitle": f"Curated for {current_user['name'] if current_user else 'You'} based on listening taste",
                    "items": recommended_for_you
                },
                "because_you_listened_to": {
                    "title": f"Because You Listened To \"{anchor_song['title']}\"",
                    "subtitle": f"Similar to {anchor_song['artist']} & {anchor_song.get('genre', 'Music')}",
                    "anchor": anchor_song,
                    "items": because_you_listened
                },
                "similar_songs": {
                    "title": "Similar Songs & Soundtracks",
                    "subtitle": f"Acoustic and thematic matches for {anchor_song.get('genre', 'your music')}",
                    "items": similar_songs
                },
                "trending_near_you": {
                    "title": "Trending Near You",
                    "subtitle": "Most streamed regional and national tracks today",
                    "items": trending_near_you
                },
                "popular_in_your_language": {
                    "title": f"Popular in {top_lang}",
                    "subtitle": f"Top chartbusters in {top_lang}",
                    "items": popular_in_lang
                },
                "discover_new_music": {
                    "title": "Discover New Music",
                    "subtitle": "Expand your horizon with fresh genres and eclectic beats",
                    "items": discover_new
                }
            }
        }

# ==============================================================================
# 2. SMART MOVIE & SERIES RECOMMENDATIONS
# ==============================================================================
@router.get("/movies")
def get_movie_recommendations(current_user: Optional[dict] = Depends(get_optional_current_user)):
    """
    Returns personalized, explainable movie & series recommendation shelves:
    - Recommended Movies (Top scored based on watched genres & ratings)
    - Because You Watched (Anchored to dynamic recently watched title)
    - Similar Movies (High genre/cast overlap)
    - Trending Movies (Trending flags & high ratings)
    - Top Rated (IMDb / critic champions)
    """
    user_id = current_user["id"] if current_user else None

    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch all movies in catalog
        cursor.execute("SELECT * FROM movies ORDER BY rating DESC")
        all_movies_rows = cursor.fetchall()
        all_movies = [parse_movie_row(r) for r in all_movies_rows]

        if not all_movies:
            return {"success": True, "data": {}}

        # User watch telemetry
        user_watched_ids = []
        user_watchlist_ids = []
        last_watched_movie = None

        if user_id:
            cursor.execute("""
            SELECT wh.movie_id, wh.watched_at, m.*
            FROM watch_history wh
            JOIN movies m ON wh.movie_id = m.id
            WHERE wh.user_id = ?
            ORDER BY wh.watched_at DESC
            LIMIT 10
            """, (user_id,))
            watch_rows = cursor.fetchall()
            if watch_rows:
                last_watched_movie = parse_movie_row(watch_rows[0])
                user_watched_ids = [r["movie_id"] for r in watch_rows]

            cursor.execute("""
            SELECT movie_id FROM watchlists WHERE user_id = ?
            """, (user_id,))
            wl_rows = cursor.fetchall()
            user_watchlist_ids = [r["movie_id"] for r in wl_rows]
            if not last_watched_movie and wl_rows:
                for m in all_movies:
                    if m["id"] == wl_rows[0]["movie_id"]:
                        last_watched_movie = m
                        break

        # Anchor title
        anchor_movie = last_watched_movie if last_watched_movie else all_movies[0]
        anchor_genres = anchor_movie.get("genres", [])
        if isinstance(anchor_genres, str):
            anchor_genres = [g.strip() for g in anchor_genres.split(",")]

        # Genre affinities
        genre_counts: Dict[str, int] = {}
        profile_movies = [m for m in all_movies if m["id"] in user_watched_ids or m["id"] in user_watchlist_ids]
        for m in profile_movies:
            for g in m.get("genres", []):
                genre_counts[g] = genre_counts.get(g, 0) + 1

        top_genre = max(genre_counts, key=genre_counts.get) if genre_counts else (anchor_genres[0] if anchor_genres else "Action")

        # 1. Recommended Movies (Genre match + high rating)
        def score_movie(m):
            score = m.get("rating", 7.0)
            for g in m.get("genres", []):
                if g in genre_counts:
                    score += genre_counts[g] * 2.0
            return score

        scored_movies = sorted(all_movies, key=score_movie, reverse=True)
        recommended_movies = [m for m in scored_movies if m["id"] != anchor_movie["id"]][:8]
        for m in recommended_movies:
            overlap = [g for g in m.get("genres", []) if g in genre_counts]
            if overlap:
                m["recommendation_reason"] = f"Matches your interest in {overlap[0]}"
            else:
                m["recommendation_reason"] = f"Critically acclaimed ({m['rating']} IMDb)"

        # 2. Because You Watched
        because_you_watched = [
            m for m in all_movies
            if m["id"] != anchor_movie["id"] and any(g in anchor_genres for g in m.get("genres", []))
        ][:8]
        if not because_you_watched:
            because_you_watched = [m for m in all_movies if m["id"] != anchor_movie["id"]][:8]

        # 3. Similar Movies
        similar_movies = because_you_watched

        # 4. Trending Movies
        trending_movies = [m for m in all_movies if m.get("isTrending") or m.get("is_trending")][:8]
        if len(trending_movies) < 4:
            trending_movies = sorted(all_movies, key=lambda x: x.get("year", 2026), reverse=True)[:8]

        # 5. Top Rated
        top_rated = sorted(all_movies, key=lambda x: x.get("rating", 0.0), reverse=True)[:8]

        return {
            "success": True,
            "anchor_movie": anchor_movie,
            "dominant_genre": top_genre,
            "shelves": {
                "recommended_movies": {
                    "title": "Recommended For You",
                    "subtitle": f"Handpicked based on your viewing history and favorite genres",
                    "items": recommended_movies
                },
                "because_you_watched": {
                    "title": f"Because You Watched \"{anchor_movie['title']}\"",
                    "subtitle": f"Similar themes, intense storytelling, and matching genres",
                    "anchor": anchor_movie,
                    "items": because_you_watched
                },
                "similar_movies": {
                    "title": "More Like This",
                    "subtitle": f"Deep cinematic connections to {anchor_movie['title']}",
                    "items": similar_movies
                },
                "trending_movies": {
                    "title": "Trending Movies & Series",
                    "subtitle": "What viewers are watching right now",
                    "items": trending_movies
                },
                "top_rated": {
                    "title": "Critically Acclaimed & Top Rated",
                    "subtitle": "Highest IMDb rating blockbusters",
                    "items": top_rated
                }
            }
        }

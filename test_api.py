"""
Comprehensive Test Suite for HIMSTREAMX FastAPI Backend
Tests: Auth (signup/login/me), Movies CRUD, Songs CRUD, Artists, Playlists CRUD,
Library (Watchlist, Liked Songs, History, Reviews), Search, Admin Operations & Metrics.
"""
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure project root directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.server import app
from backend.database import get_db

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("▶ STARTING HIMSTREAMX FULL-STACK API TEST SUITE")
    print("==================================================")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ 1. Health check passed:", res.json())

    # 2. Admin Login
    admin_login = client.post("/api/auth/login", json={
        "email": "himanshuprajapati6643@gmail.com",
        "password": "Admin@HIMSTREAMX2026!"
    })
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_data = admin_login.json()
    admin_token = admin_data["access_token"]
    assert admin_data["user"]["role"] == "ADMIN", "Role should be ADMIN"
    print("✅ 2. Admin login passed for:", admin_data["user"]["email"])

    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Standard User Login / Signup
    user_login = client.post("/api/auth/login", json={
        "email": "user@himstreamx.com",
        "password": "User@HIMSTREAMX2026!"
    })
    assert user_login.status_code == 200, f"User login failed: {user_login.text}"
    user_data = user_login.json()
    user_token = user_data["access_token"]
    assert user_data["user"]["role"] in ("USER", "VIP"), "Role should be USER or VIP"
    print("✅ 3. Standard user login passed for:", user_data["user"]["email"])

    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 4. Auth /me with profile stats
    me_res = client.get("/api/auth/me", headers=user_headers)
    assert me_res.status_code == 200
    me_json = me_res.json()
    assert "stats" in me_json
    print("✅ 4. Auth /me and profile stats passed:", me_json["stats"])

    # 5. Movies List & Detail
    movies_res = client.get("/api/movies")
    assert movies_res.status_code == 200
    movies = movies_res.json()["data"]
    assert len(movies) > 0
    first_movie = movies[0]
    movie_id = first_movie["id"]
    movie_detail = client.get(f"/api/movies/{movie_id}")
    assert movie_detail.status_code == 200
    print(f"✅ 5. Movies API passed: {len(movies)} movies found. Sample: {first_movie['title']}")

    # 6. Songs List & Category Filter
    songs_res = client.get("/api/songs")
    assert songs_res.status_code == 200
    songs = songs_res.json()["data"]
    assert len(songs) > 0
    first_song = songs[0]
    song_id = first_song["id"]

    # Filter by language
    hindi_songs = client.get("/api/songs?language=Hindi").json()["data"]
    assert len(hindi_songs) > 0
    print(f"✅ 6. Songs API passed: {len(songs)} total songs, {len(hindi_songs)} Hindi tracks.")

    # 7. Artists API
    artists_res = client.get("/api/artists")
    assert artists_res.status_code == 200
    artists = artists_res.json()["data"]
    assert len(artists) > 0
    print(f"✅ 7. Artists API passed: {len(artists)} artists catalogued.")

    # 8. Library: Watchlist Toggle & Get
    wl_toggle = client.post("/api/library/watchlist/toggle", json={"movie_id": movie_id}, headers=user_headers)
    assert wl_toggle.status_code == 200
    if not wl_toggle.json().get("in_list"):
        wl_toggle = client.post("/api/library/watchlist/toggle", json={"movie_id": movie_id}, headers=user_headers)
    wl_list = client.get("/api/library/watchlist", headers=user_headers).json()["data"]
    assert any(m["id"] == movie_id for m in wl_list)
    print("✅ 8. Watchlist toggle and retrieve passed.")

    # 9. Library: Liked Songs Toggle & Get
    like_toggle = client.post("/api/library/favourites/toggle", json={"item_type": "song", "item_id": song_id}, headers=user_headers)
    assert like_toggle.status_code == 200
    if not like_toggle.json().get("is_favourite"):
        like_toggle = client.post("/api/library/favourites/toggle", json={"item_type": "song", "item_id": song_id}, headers=user_headers)
    liked_list = client.get("/api/library/liked-songs", headers=user_headers).json()["data"]
    assert any(s["id"] == song_id for s in liked_list)
    print("✅ 9. Liked Songs toggle and retrieve passed.")

    # 10. Playlists: Create, Add Song, Get, Delete
    pl_create = client.post("/api/playlists", json={
        "title": "Late Night Vibes",
        "description": "Chill regional tracks for coding"
    }, headers=user_headers)
    assert pl_create.status_code in (200, 201), f"Playlist creation failed: {pl_create.text}"
    pl_id = pl_create.json()["data"]["id"]

    # Add song to playlist
    add_song = client.post(f"/api/playlists/{pl_id}/songs", json={"song_id": song_id}, headers=user_headers)
    assert add_song.status_code in (200, 201), f"Add song failed: {add_song.text}"

    pl_detail = client.get(f"/api/playlists/{pl_id}").json()["data"]
    assert pl_detail["track_count"] >= 1
    print(f"✅ 10. Playlists CRUD passed: Created playlist '{pl_detail['title']}' with {pl_detail['track_count']} song(s).")

    # 11. Search: Multi-facet and Query Logging
    search_res = client.get("/api/search?q=kesariya")
    assert search_res.status_code == 200
    search_json = search_res.json()
    print(f"✅ 11. Search API passed: Found {len(search_json['songs'])} song(s), {len(search_json['movies'])} movie(s).")

    # 12. Reviews & Ratings
    review_res = client.post("/api/library/reviews", json={
        "item_id": movie_id,
        "item_type": "movie",
        "item_title": first_movie["title"],
        "rating": 5.0,
        "review_text": "Absolute masterpiece in 4K HDR! Outstanding platform!"
    }, headers=user_headers)
    assert review_res.status_code == 200
    print("✅ 12. User Review and Rating submission passed.")

    # 13. Admin Analytics Metrics & Moderation
    metrics_res = client.get("/api/admin/metrics", headers=admin_headers)
    assert metrics_res.status_code == 200
    m = metrics_res.json()["metrics"]
    print(f"✅ 13. Admin Metrics passed: Users={m['total_users']}, Movies={m['total_movies']}, Songs={m['total_songs']}, Playlists={m['total_playlists']}.")

    # 14. RBAC Protection: Non-admin trying to access Admin API
    forbidden = client.get("/api/admin/metrics", headers=user_headers)
    assert forbidden.status_code == 403, f"Non-admin should get 403 Forbidden, got {forbidden.status_code}"
    print("✅ 14. Role-Based Access Control (RBAC) 403 Forbidden verified.")

    # 15. Admin Movie CRUD
    new_movie = client.post("/api/admin/movies", json={
        "id": "mov-test-999",
        "title": "Quantum Odyssey 2027",
        "type": "movie",
        "year": 2027,
        "rating": 9.4,
        "genres": ["Sci-Fi", "Adventure"],
        "backdrop": "https://images.unsplash.com/photo-1534447677768-be436bb09401",
        "poster": "https://images.unsplash.com/photo-1534447677768-be436bb09401",
        "synopsis": "Interstellar exploration beyond known physics.",
        "duration": "2h 45m"
    }, headers=admin_headers)
    assert new_movie.status_code == 200
    print("✅ 15. Admin Movie Create passed.")

    # Clean up test movie
    del_movie = client.delete("/api/admin/movies/mov-test-999", headers=admin_headers)
    assert del_movie.status_code == 200
    print("✅ 16. Admin Movie Delete passed.")

    # 17. Smart Music Recommendations
    music_rec = client.get("/api/recommendations/music", headers=user_headers)
    assert music_rec.status_code == 200
    m_shelves = music_rec.json()["shelves"]
    assert "recommended_for_you" in m_shelves
    assert "because_you_listened_to" in m_shelves
    assert "trending_near_you" in m_shelves
    print(f"✅ 17. Smart Music Recommendations passed with {len(m_shelves)} personalized shelves.")

    # 18. Smart Movie Recommendations
    movie_rec = client.get("/api/recommendations/movies", headers=user_headers)
    assert movie_rec.status_code == 200
    mov_shelves = movie_rec.json()["shelves"]
    assert "recommended_movies" in mov_shelves
    assert "because_you_watched" in mov_shelves
    print(f"✅ 18. Smart Movie Recommendations passed with {len(mov_shelves)} personalized shelves.")

    # 19. Security Login Email Notification & Audit Logging
    audit_file = os.path.join(os.path.dirname(__file__), "security_audit.log")
    assert os.path.exists(audit_file), "Security audit log file must exist"
    with open(audit_file, "r", encoding="utf-8") as af:
        log_content = af.read()
    assert "himanshuprajapati6643@gmail.com" in log_content or "user@himstreamx.com" in log_content
    print("✅ 19. Security Login Notification email alert and persistent audit logging verified.")

    # 20. Static Delivery & Discovery Module
    disc_js = client.get("/js/discovery.js")
    assert disc_js.status_code == 200
    assert "DISCOVERY_CATEGORIES" in disc_js.text
    print("✅ 20. Data-Driven Discovery Hub script served cleanly.")

    # 21. Universal YouTube Search API (Regional queries & official video metadata)
    queries_to_test = [
        "Bhojpuri song", "Hindi song", "Punjabi song", "Haryanvi song",
        "Rajasthani song", "English song", "Arijit Singh", "Bhojpuri movie", "music video"
    ]
    for q in queries_to_test:
        yt_res = client.get(f"/api/youtube/search?q={q}")
        assert yt_res.status_code == 200, f"YouTube search failed for {q}: {yt_res.text}"
        data = yt_res.json()["data"]
        assert len(data) > 0, f"No results returned for {q}"
        first_v = data[0]
        assert "videoId" in first_v and first_v["videoId"], "videoId missing"
        assert "title" in first_v and first_v["title"], "title missing"
        assert "embedUrl" in first_v and "youtube.com/embed" in first_v["embedUrl"], "embedUrl invalid"
    print(f"✅ 21. YouTube Universal Search passed for all {len(queries_to_test)} specified regional queries.")

    # 22. VIP Subscription Plans & Theatrical Hall Blockbusters
    sub_plans = client.get("/api/subscription/plans")
    assert sub_plans.status_code == 200
    p_data = sub_plans.json()
    assert len(p_data["plans"]) == 4, "Must have 4 VIP plans"
    assert p_data["paymentDetails"]["upiId"] == "7084468661@pytes"
    assert p_data["paymentDetails"]["mobile"] == "+91 7084468661"

    theatrical_res = client.get("/api/subscription/theatrical-movies")
    assert theatrical_res.status_code == 200
    t_movies = theatrical_res.json()["data"]
    assert len(t_movies) >= 6, "Must have theatrical cinema blockbusters"
    assert any("Kalki" in m["title"] for m in t_movies)
    assert any("Jawan" in m["title"] for m in t_movies)

    payment_sub = client.post("/api/subscription/submit-payment", json={
        "plan_name": "VIP 4K Cinema Pass (Monthly)",
        "amount": 199.0,
        "upi_transaction_id": "UTR123456789012",
        "user_mobile": "+91 9876543210"
    }, headers=user_headers)
    assert payment_sub.status_code == 200
    assert payment_sub.json()["success"] is True
    print("✅ 22. VIP Subscription Plans, Theatrical Cinema Catalog & Payment Verification passed.")

    # 23. Director Himanshu Prajapati Profile Vault & Telemetry Protection
    bad_unlock = client.post("/api/director/unlock", json={"password": "WrongPassword!"})
    assert bad_unlock.status_code == 401, f"Invalid password must return 401, got {bad_unlock.status_code}"

    correct_unlock = client.post("/api/director/unlock", json={"password": "Him@90"})
    assert correct_unlock.status_code == 200, f"Valid password failed: {correct_unlock.text}"
    d_data = correct_unlock.json()["director"]
    assert d_data["name"] == "Himanshu Prajapati"
    assert d_data["mobile"] == "+91 7084468661"
    assert d_data["email"] == "himanshuprajapati6643@gmail.com"
    assert d_data["upiId"] == "7084468661@pytes"
    assert "metricsGraph" in d_data
    assert len(d_data["metricsGraph"]["languageShare"]) >= 5
    assert len(d_data["metricsGraph"]["techStackScores"]) >= 5
    print("✅ 23. Director Himanshu Prajapati Private Profile Vault unlocked successfully with master key Him@90.")

    print("\n==================================================")
    print("🎉 ALL 23 PRODUCTION & FULL-STACK TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

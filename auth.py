import time
import uuid
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status, Depends, Request, BackgroundTasks
from backend.database import get_db
from backend.models import UserSignupRequest, UserLoginRequest, UserProfileUpdateRequest
from backend.security import hash_password, verify_password, create_access_token, get_current_user
from backend.notifications import send_login_notification
from backend.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication & User Session"])

# Simple thread-safe in-memory sliding window rate limiter
_RATE_LIMIT_STORE: Dict[str, List[float]] = {}

def check_auth_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window = 60.0 # 1 minute
    max_requests = settings.AUTH_RATE_LIMIT_PER_MINUTE

    # Filter timestamps within current window
    timestamps = [ts for ts in _RATE_LIMIT_STORE.get(client_ip, []) if now - ts < window]
    if len(timestamps) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please wait a moment before trying again."
        )
    timestamps.append(now)
    _RATE_LIMIT_STORE[client_ip] = timestamps

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(req: UserSignupRequest, request: Request, background_tasks: BackgroundTasks):
    check_auth_rate_limit(request)
    email = req.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please sign in.",
            )

        user_id = f"usr-{uuid.uuid4().hex[:12]}"
        password_hash = hash_password(req.password)
        avatar = req.name[:2].upper()

        cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, avatar, plan, status)
        VALUES (?, ?, ?, ?, 'USER', ?, 'Standard 4K + Music Pass', 'active')
        """, (user_id, req.name.strip(), email, password_hash, avatar))

        token = create_access_token({"sub": user_id, "email": email, "role": "USER"})

        # Dispatch background login/registration email notification to admin
        client_ip = request.client.host if request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "Unknown Browser")
        background_tasks.add_task(
            send_login_notification,
            user_id=user_id,
            user_name=req.name.strip(),
            user_email=email,
            role="USER",
            ip_address=client_ip,
            user_agent=user_agent,
            action="New Account Registration & Sign In"
        )

        return {
            "success": True,
            "message": "Account created successfully! Welcome to HIMSTREAMX.",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "name": req.name.strip(),
                "email": email,
                "role": "USER",
                "avatar": avatar,
                "plan": "Standard 4K + Music Pass"
            }
        }

@router.post("/login")
def login(req: UserLoginRequest, request: Request, background_tasks: BackgroundTasks):
    check_auth_rate_limit(request)
    email = req.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, name, email, password_hash, role, avatar, plan, status
        FROM users WHERE email = ?
        """, (email,))
        user_row = cursor.fetchone()

        if not user_row or not verify_password(req.password, user_row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password. Please check your credentials.",
            )

        user = dict(user_row)
        if user["status"] == "banned":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been suspended by the administrator.",
            )

        token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})

        # Dispatch background login email notification to admin
        client_ip = request.client.host if request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "Unknown Browser")
        background_tasks.add_task(
            send_login_notification,
            user_id=user["id"],
            user_name=user["name"],
            user_email=user["email"],
            role=user["role"],
            ip_address=client_ip,
            user_agent=user_agent,
            action="Login"
        )

        return {
            "success": True,
            "message": f"Welcome back, {user['name']}!",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "avatar": user["avatar"],
                "plan": user["plan"]
            }
        }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch live stats for user dashboard
        cursor.execute("SELECT COUNT(*) FROM watchlists WHERE user_id = ?", (user_id,))
        watchlist_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM favourites WHERE user_id = ? AND item_type = 'song'", (user_id,))
        liked_songs_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM playlists WHERE user_id = ?", (user_id,))
        playlists_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM reviews WHERE user_id = ?", (user_id,))
        reviews_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM ratings WHERE user_id = ?", (user_id,))
        ratings_count = cursor.fetchone()[0]

    return {
        "success": True,
        "user": current_user,
        "stats": {
            "watchlist_count": watchlist_count,
            "liked_songs_count": liked_songs_count,
            "playlists_count": playlists_count,
            "reviews_count": reviews_count,
            "ratings_count": ratings_count
        }
    }

@router.put("/profile")
def update_profile(req: UserProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        updates = []
        params = []

        if req.name is not None:
            updates.append("name = ?")
            params.append(req.name.strip())
        if req.avatar is not None:
            updates.append("avatar = ?")
            params.append(req.avatar.strip())
        if req.plan is not None:
            updates.append("plan = ?")
            params.append(req.plan.strip())

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(user_id)
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, tuple(params))

        cursor.execute("SELECT id, name, email, role, avatar, plan, status FROM users WHERE id = ?", (user_id,))
        updated_user = dict(cursor.fetchone())

    return {
        "success": True,
        "message": "Profile updated successfully.",
        "user": updated_user
    }

@router.post("/logout")
def logout():
    return {
        "success": True,
        "message": "Signed out successfully."
    }

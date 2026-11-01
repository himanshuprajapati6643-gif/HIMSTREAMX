import os
import hmac
import hashlib
import binascii
from datetime import datetime, timezone, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.config import settings

security_bearer = HTTPBearer(auto_error=False)

# ==============================================================================
# SECURE PASSWORD HASHING (PBKDF2-HMAC-SHA256, NIST Standard)
# ==============================================================================
def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with 120,000 iterations and 16-byte cryptographic salt."""
    salt = os.urandom(16)
    iterations = 120000
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    salt_hex = binascii.hexlify(salt).decode("ascii")
    dk_hex = binascii.hexlify(dk).decode("ascii")
    return f"pbkdf2:sha256:{iterations}${salt_hex}${dk_hex}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its hashed value using constant-time comparison."""
    try:
        header, salt_hex, dk_hex = hashed_password.split("$")
        iterations = int(header.split(":")[-1])
        salt = binascii.unhexlify(salt_hex.encode("ascii"))
        expected_dk = binascii.unhexlify(dk_hex.encode("ascii"))
        actual_dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual_dk, expected_dk)
    except Exception:
        return False

# ==============================================================================
# JSON WEB TOKENS (JWT)
# ==============================================================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

# ==============================================================================
# FASTAPI AUTHENTICATION DEPENDENCIES
# ==============================================================================
def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please sign in to HIMSTREAMX.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]

    # Verify user exists in database
    from backend.database import get_db
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, role, avatar, plan, status FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists.",
            )
        
        user_dict = dict(user_row)
        if user_dict.get("status") == "banned":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been suspended by the administrator.",
            )

    return user_dict

def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Optional[dict]:
    if not credentials or not credentials.credentials:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required. Access denied.",
        )
    return current_user

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ==============================================================================
# AUTHENTICATION & USER SCHEMAS
# ==============================================================================
class UserSignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=60)
    avatar: Optional[str] = Field(None, max_length=10)
    plan: Optional[str] = None

class UserStatusUpdateRequest(BaseModel):
    status: Optional[str] = Field(None, pattern="^(active|suspended|banned)$")
    role: Optional[str] = Field(None, pattern="^(USER|ADMIN)$")

# ==============================================================================
# MOVIE & SERIES SCHEMAS
# ==============================================================================
class MovieCreateRequest(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=1)
    type: str = Field("movie", pattern="^(movie|series)$")
    genres: List[str] = []
    year: int = Field(default=2026, ge=1900, le=2035)
    rating: float = Field(default=8.5, ge=0.0, le=10.0)
    match: Optional[int] = Field(default=95, ge=50, le=100)
    age: Optional[str] = "16+"
    duration: Optional[str] = "2h 15m"
    quality: Optional[str] = "4K Ultra HD"
    badge: Optional[str] = "NEW RELEASE"
    is_trending: Optional[bool] = False
    is_popular: Optional[bool] = True
    is_top10: Optional[int] = 0
    poster: str
    backdrop: Optional[str] = None
    trailer_id: Optional[str] = "b9EkMc79ZSU"
    description: Optional[str] = ""
    director: Optional[str] = "HIMSTREAMX Studios"
    cast: Optional[List[str]] = []
    audio: Optional[str] = "Hindi, English [Original]"
    subtitles: Optional[str] = "English, Hindi"
    stream_url: Optional[str] = None

class MovieUpdateRequest(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    genres: Optional[List[str]] = None
    year: Optional[int] = None
    rating: Optional[float] = None
    match: Optional[int] = None
    age: Optional[str] = None
    duration: Optional[str] = None
    quality: Optional[str] = None
    badge: Optional[str] = None
    is_trending: Optional[bool] = None
    is_popular: Optional[bool] = None
    is_top10: Optional[int] = None
    poster: Optional[str] = None
    backdrop: Optional[str] = None
    trailer_id: Optional[str] = None
    description: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[List[str]] = None
    audio: Optional[str] = None
    subtitles: Optional[str] = None
    stream_url: Optional[str] = None

# ==============================================================================
# SONG & MUSIC SCHEMAS
# ==============================================================================
class SongCreateRequest(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=1)
    artist: str = Field(..., min_length=1)
    album: Optional[str] = "Single"
    language: str = Field(..., min_length=1)
    genre: str = Field(..., min_length=1)
    year: int = Field(default=2026, ge=1900, le=2035)
    duration: str = Field("3:30")
    duration_sec: int = Field(default=210, ge=1)
    cover_image: str
    audio_url: str
    category: Optional[str] = "Trending"
    popularity: Optional[int] = Field(default=95, ge=0, le=100)
    is_trending: Optional[bool] = True
    lyrics: Optional[str] = None

class SongUpdateRequest(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    language: Optional[str] = None
    genre: Optional[str] = None
    year: Optional[int] = None
    duration: Optional[str] = None
    duration_sec: Optional[int] = None
    cover_image: Optional[str] = None
    audio_url: Optional[str] = None
    category: Optional[str] = None
    popularity: Optional[int] = None
    is_trending: Optional[bool] = None
    lyrics: Optional[str] = None

# ==============================================================================
# ARTIST SCHEMAS
# ==============================================================================
class ArtistCreateRequest(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    role: Optional[str] = "Music Artist"
    language: Optional[str] = "Multi-lingual"
    monthly_listeners: Optional[str] = "10M"
    avatar: str
    bio: Optional[str] = None

class ArtistUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    language: Optional[str] = None
    monthly_listeners: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None

# ==============================================================================
# PLAYLIST SCHEMAS
# ==============================================================================
class PlaylistCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = ""
    is_public: Optional[bool] = True
    cover_image: Optional[str] = None

class PlaylistUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    cover_image: Optional[str] = None

class PlaylistAddSongRequest(BaseModel):
    song_id: str

# ==============================================================================
# LIBRARY & USER ACTIONS SCHEMAS
# ==============================================================================
class WatchlistToggleRequest(BaseModel):
    movie_id: str

class FavouriteToggleRequest(BaseModel):
    item_type: str = Field(..., pattern="^(song|movie)$")
    item_id: str

class WatchHistoryRequest(BaseModel):
    movie_id: str
    progress_percent: int = Field(default=0, ge=0, le=100)
    progress_seconds: int = Field(default=0, ge=0)
    completed: bool = False

class ListeningHistoryRequest(BaseModel):
    song_id: str
    duration_played_sec: int = Field(default=0, ge=0)
    completed: bool = False

class RatingRequest(BaseModel):
    item_type: str = Field(..., pattern="^(movie|song)$")
    item_id: str
    score: float = Field(..., ge=1.0, le=10.0)

class ReviewRequest(BaseModel):
    item_type: str = Field(..., pattern="^(movie|song)$")
    item_id: str
    review_text: str = Field(..., min_length=3, max_length=2000)
    rating: float = Field(default=5.0, ge=1.0, le=5.0)

class AnnouncementRequest(BaseModel):
    title: str
    content: str
    is_active: bool = True

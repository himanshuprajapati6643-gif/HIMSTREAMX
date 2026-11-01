import sys
from pathlib import Path

# Safe Unicode output for Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from backend.config import settings
from backend.database import init_db
from backend.seed import seed_database
from backend.routes.auth import router as auth_router
from backend.routes.movies import router as movies_router
from backend.routes.songs import router as songs_router
from backend.routes.artists import router as artists_router
from backend.routes.playlists import router as playlists_router
from backend.routes.user_library import router as library_router
from backend.routes.search import router as search_router
from backend.routes.admin import router as admin_router
from backend.routes.recommendations import router as recommendations_router
from backend.routes.youtube import router as youtube_router
from backend.routes.subscription import router as subscription_router
from backend.routes.director import router as director_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise REST API for HIMSTREAMX OTT + Music Streaming Platform. Developed by Himanshu Prajapati.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
origins = settings.ALLOWED_ORIGINS
if "*" in origins:
    allow_origins = ["*"]
else:
    allow_origins = origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware (Guarantees YouTube Embed Referrer headers without Error 153)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

# Startup Hook: Initialize and Seed Database
@app.on_event("startup")
def on_startup():
    print(f"🚀 Initializing {settings.PROJECT_NAME} v{settings.VERSION}...")
    init_db()
    seed_database()
    print("✅ HIMSTREAMX API Ready and serving requests.")

# Global Exception Handler for Clean Errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ Internal Server Error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error occurred.",
            "detail": str(exc) if settings.DEBUG else "Please try again later."
        }
    )

# Include API Routers
app.include_router(auth_router)
app.include_router(movies_router)
app.include_router(songs_router)
app.include_router(artists_router)
app.include_router(playlists_router)
app.include_router(library_router)
app.include_router(search_router)
app.include_router(admin_router)
app.include_router(recommendations_router)
app.include_router(youtube_router)
app.include_router(subscription_router)
app.include_router(director_router)

# Health Check Endpoint
@app.get("/api/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "SQLite (Connected)"
    }

# Frontend Static Mount (Serving F:\HIMSTREAMX)
FRONTEND_DIR = Path(__file__).resolve().parent.parent

SECURITY_HEADERS = {
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff"
}

@app.get("/")
def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file, headers=SECURITY_HEADERS)
    return {"message": "HIMSTREAMX API running. Frontend index.html not found."}

# Mount static folders if present
app.mount("/data", StaticFiles(directory=str(FRONTEND_DIR / "data")), name="data")
app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")

# Serve root CSS, images, and static assets
@app.get("/{filename}")
def serve_root_file(filename: str):
    safe_extensions = {".css", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".js", ".html"}
    file_path = FRONTEND_DIR / filename
    if file_path.suffix.lower() in safe_extensions and file_path.exists() and file_path.is_file():
        media_types = {
            ".css": "text/css",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".js": "application/javascript",
            ".html": "text/html"
        }
        return FileResponse(file_path, media_type=media_types.get(file_path.suffix.lower()), headers=SECURITY_HEADERS)
    return JSONResponse(status_code=404, content={"error": "File not found"})

# Mount root directory files (CSS, images)
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.server:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

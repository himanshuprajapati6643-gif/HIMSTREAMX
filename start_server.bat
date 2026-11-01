@echo off
title HIMSTREAMX - Cinematic OTT + Music Platform (Local Server)
echo ==============================================================================
echo  HIMSTREAMX - CINEMATIC OTT + MULTILINGUAL MUSIC STREAMING PLATFORM
echo  Developed by Himanshu Prajapati (2026)
echo ==============================================================================
echo.
echo Starting local HTTP server on http://localhost:8000 ...
echo (Running on http://localhost:8000 prevents YouTube Error 153 configuration errors)
echo.
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"
python -m uvicorn backend.server:app --host 127.0.0.1 --port 8000
pause

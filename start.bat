@echo off
title Habie Train - Running

echo.
echo   Habie Train Voting
echo   ==================
echo.

cd /d "%~dp0"

echo   Starting server...
start "habie-server" /B npm start

echo   Waiting for server to be ready...
:waitloop
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto waitloop
)

echo   Server is ready!
echo.
echo   URL: http://localhost:3000

if exist "%~dp0cloudflared.exe" (
    echo   Starting public tunnel...
    echo.
    cloudflared.exe tunnel --url http://localhost:3000
) else (
    echo.
    echo   Press any key to close this window.
    echo   (The server will keep running in background)
    pause >nul
)

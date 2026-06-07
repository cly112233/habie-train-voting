@echo off
title Habie Train - Shutdown

echo.
echo   Stopping Habie Train Voting...
echo.

taskkill /fi "WINDOWTITLE eq habie-server" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq Habie*" /f >nul 2>&1
taskkill /im cloudflared.exe /f >nul 2>&1

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo   All services stopped.
echo.
pause

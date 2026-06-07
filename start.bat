@echo off
chcp 65001 >nul
title 哈比列车投票 - 运行中

echo.
echo   🎭 哈比列车投票网站
echo   =====================
echo.
echo   正在启动生产服务器...
echo.

cd /d "%~dp0"

:: 启动 Next.js 生产服务器
start "next-server" /B npm start

:: 等待服务器就绪
echo   等待服务器就绪...
:waitloop
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto waitloop
)

echo   服务器已就绪!
echo   正在启动 Cloudflare Tunnel...
echo.

:: 启动 Tunnel
cloudflared.exe tunnel --url http://localhost:3000

pause

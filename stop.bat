@echo off
chcp 65001 >nul
title 哈比列车投票 - 关闭

echo.
echo   🎭 关闭哈比列车投票网站
echo   ========================
echo.
echo   正在停止服务...

:: 结束 Next.js 服务器
taskkill /fi "WINDOWTITLE eq habie-server" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq 哈比列车*" /f >nul 2>&1

:: 结束 cloudflared（如果有）
taskkill /im cloudflared.exe /f >nul 2>&1

:: 释放 3000 端口
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo   已关闭所有服务。
echo.
pause

@echo off
chcp 65001 >nul
title 哈比列车投票 - 关闭

echo.
echo   🎭 关闭哈比列车投票网站
echo   ========================
echo.

echo   正在停止服务...

:: 结束 node 进程
taskkill /f /fi "WINDOWTITLE eq next-server" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq 哈比列车*" >nul 2>&1

:: 结束 cloudflared
taskkill /f /im cloudflared.exe >nul 2>&1

:: 释放可能占用的 3000 端口
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo   已关闭所有服务。
echo.
pause

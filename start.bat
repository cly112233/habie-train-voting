@echo off
chcp 65001 >nul
title 哈比列车投票 - 运行中

echo.
echo   🎭 哈比列车投票网站
echo   =====================

cd /d "%~dp0"

:: 启动 Next.js 生产服务器
echo   正在启动服务器...
start "habie-server" /B npm start

:: 等待服务器就绪
echo   等待服务器就绪...
:waitloop
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto waitloop
)

echo   服务器已就绪！
echo.
echo   🌐 访问地址:
echo      http://localhost:3000

:: 如果有 cloudflared 则启动隧道（本地环境）
if exist "%~dp0cloudflared.exe" (
    echo.
    echo   检测到 cloudflared，启动公网隧道...
    echo   公网地址将显示在下方:
    echo   ----------------------------------------
    cloudflared.exe tunnel --url http://localhost:3000
) else (
    echo.
    echo   服务器模式下直接通过 IP:3000 访问即可
    echo   （请确保防火墙已开放 3000 端口）
    echo.
    echo   按任意键关闭本窗口（服务将继续在后台运行）
    pause >nul
)

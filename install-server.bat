@echo off
chcp 65001 >nul
title 哈比列车 - 服务器安装

echo.
echo   ╔══════════════════════════════════╗
echo   ║  🎭 哈比列车投票 - 服务器安装  ║
echo   ╚══════════════════════════════════╝
echo.

:: Check admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] Right-click - Run as Administrator
    pause
    exit /b 1
)

set "INSTALL_DIR=C:\habie-train-voting"

:: ===== 1. Node.js =====
echo   [1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo        Installing Node.js (network required)...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --silent
    if %errorlevel% neq 0 (
        echo        [X] Node.js install failed. Please install manually:
        echo        https://nodejs.org
        pause
        exit /b 1
    )
    echo        Installed! Please re-run this script.
    pause
    exit /b 0
)
echo        Node.js OK

:: ===== 2. Copy files =====
echo.
echo   [2/5] Deploy to %INSTALL_DIR%...
if exist "%INSTALL_DIR%" (
    echo        Updating existing install (data preserved)...
    xcopy /E /Y /Q "%~dp0src" "%INSTALL_DIR%\src\" >nul
    xcopy /E /Y /Q "%~dp0public" "%INSTALL_DIR%\public\" >nul
    xcopy /Y /Q "%~dp0*.json" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.mjs" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.ts" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.bat" "%INSTALL_DIR%\" >nul
) else (
    mkdir "%INSTALL_DIR%"
    xcopy /E /Y /Q "%~dp0*" "%INSTALL_DIR%\" >nul
)

cd /d "%INSTALL_DIR%"

:: ===== 3. Install deps + Build =====
echo.
echo   [3/5] Installing dependencies (needs network, ~1-2 min)...
call npm install --omit=dev 2>&1 | findstr /V "audit funding idealTree"

echo.
echo   [4/5] Building project...
call npm run build 2>&1 | findstr /V "audit"

:: ===== 4. Firewall + Auto-start =====
echo.
echo   [5/5] Firewall + Auto-start...
netsh advfirewall firewall add rule name="HabieTrain-3000" dir=in action=allow protocol=tcp localport=3000 >nul 2>&1
echo        Firewall port 3000 opened

schtasks /delete /tn "HabieTrain" /f >nul 2>&1
schtasks /create /tn "HabieTrain" /tr "cmd /c cd /d %INSTALL_DIR% && npm start" /sc onstart /delay 0000:15 /ru SYSTEM /f >nul 2>&1
echo        Auto-start on boot configured

:: ===== 5. Start =====
echo.
echo   Starting server...
start "habie-server" /B npm start
timeout /t 4 >nul

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo   ╔══════════════════════════════════════╗
    echo   ║        SUCCESS!                      ║
    echo   ╚══════════════════════════════════════╝
    echo.
    echo   🌐 Access: http://localhost:3000
    echo        (If server has public IP, use http://YOUR-IP:3000)
    echo.
    echo   📌 Admin: guanli / yi2san4wu6
    echo.
    echo   📂 Folder: %INSTALL_DIR%
    echo   🟢 Start:  double-click start.bat
    echo   🔴 Stop:   double-click stop.bat
    echo   🔄 Auto-start on server reboot: YES
    echo.
) else (
    echo.
    echo   [X] Startup may have failed. Check manually:
    echo   cd /d %INSTALL_DIR% ^&^& npm start
    echo.
)

pause

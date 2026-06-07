@echo off
setlocal enabledelayedexpansion

:: 无论如何窗口都不要秒关
if not defined IS_RUNNING (
    set IS_RUNNING=1
    cmd /c "%~f0" %*
    exit /b
)

chcp 65001 >nul
title 哈比列车 - 服务器安装
cd /d "%~dp0"

echo.
echo   ╔══════════════════════════════════╗
echo   ║  🎭 哈比列车投票 - 服务器安装  ║
echo   ╚══════════════════════════════════╝
echo.

:: ===== Check admin =====
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo   ╔══════════════════════════════════╗
    echo   ║    注意：请右键以管理员身份运行  ║
    echo   ╚══════════════════════════════════╝
    echo.
    echo   当前不是管理员模式，将跳过防火墙和自启配置。
    echo   如果只想测试运行，可以继续。
    echo.
    choice /c yn /m "是否继续（无管理员权限）?"
    if !errorlevel! equ 2 ( pause & goto :end )
    set "NO_ADMIN=1"
)

set "INSTALL_DIR=C:\habie-train-voting"

:: ===== Step 1: Node.js =====
echo.
echo   [1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo   Node.js not found. Please install it first:
    echo   https://nodejs.org (download LTS version)
    echo.
    echo   After installing, run this script again.
    pause
    goto :end
)
for /f "tokens=*" %%a in ('node --version') do echo        Node.js %%a - OK

:: ===== Step 2: Copy files =====
echo.
echo   [2/5] Deploying to %INSTALL_DIR% ...
if exist "%INSTALL_DIR%" (
    echo        Updating (existing data preserved)...
    xcopy /E /Y /Q "%~dp0src" "%INSTALL_DIR%\src\" >nul
    xcopy /E /Y /Q "%~dp0public" "%INSTALL_DIR%\public\" >nul
    xcopy /Y /Q "%~dp0*.json" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.mjs" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.ts" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.bat" "%INSTALL_DIR%\" >nul
) else (
    mkdir "%INSTALL_DIR%" 2>nul
    xcopy /E /Y /Q "%~dp0*" "%INSTALL_DIR%\" >nul
)
echo        Done.

cd /d "%INSTALL_DIR%"

:: ===== Step 3: npm install =====
echo.
echo   [3/5] Installing dependencies (needs network, ~1-2 min)...
call npm install --omit=dev
if !errorlevel! neq 0 (
    echo   [X] npm install failed. Check network and try again.
    pause
    goto :end
)
echo        Done.

:: ===== Step 4: Build =====
echo.
echo   [4/5] Building project...
call npm run build
if !errorlevel! neq 0 (
    echo   [X] Build failed.
    pause
    goto :end
)
echo        Done.

:: ===== Step 5: Firewall + Auto-start =====
echo.
echo   [5/5] Firewall + Auto-start...
if not defined NO_ADMIN (
    netsh advfirewall firewall add rule name="HabieTrain-3000" dir=in action=allow protocol=tcp localport=3000 >nul 2>&1
    echo        Firewall port 3000 opened

    schtasks /delete /tn "HabieTrain" /f >nul 2>&1
    schtasks /create /tn "HabieTrain" /tr "cmd /c cd /d %INSTALL_DIR% && npm start" /sc onstart /delay 0000:15 /ru SYSTEM /f >nul 2>&1
    echo        Auto-start on boot configured
) else (
    echo        Skipped (no admin rights)
)

:: ===== Start Server =====
echo.
echo   Starting server...
start "habie-server" /B npm start
echo   Waiting for server to be ready...
timeout /t 5 >nul

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo   ╔══════════════════════════════════════╗
    echo   ║        ✅ INSTALL SUCCESS!           ║
    echo   ╚══════════════════════════════════════╝
    echo.
    echo   🌐 Local:  http://localhost:3000
    echo.
    echo   📌 Admin login:
    echo       ID:     guanli
    echo       Pass:   yi2san4wu6
    echo.
    echo   📂 Folder: %INSTALL_DIR%
    echo   🟢 start.bat  🔴 stop.bat
    echo   🔄 Auto-start on boot: YES
    echo.
) else (
    echo.
    echo   [X] Server may not be running. Start it manually:
    echo       cd /d %INSTALL_DIR%
    echo       npm start
    echo.
)

:end
pause

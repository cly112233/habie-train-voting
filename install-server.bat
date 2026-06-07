@echo off
setlocal enabledelayedexpansion

title Habie Train - Setup
cd /d "%~dp0"

echo.
echo   ======================================
echo     Habie Train Voting - Server Setup
echo   ======================================
echo.

:: Check admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo   NOTE: Not running as Administrator.
    echo   Firewall and auto-start will be skipped.
    echo.
    choice /c yn /m "Continue without admin rights?"
    if !errorlevel! equ 2 ( pause & goto :end )
    set "NO_ADMIN=1"
)

set "INSTALL_DIR=C:\habie-train-voting"

:: ===== 1. Node.js =====
echo.
echo   [1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo   Node.js not found!
    echo   Please download and install Node.js LTS from:
    echo   https://nodejs.org
    echo.
    echo   Then re-run this script.
    pause
    goto :end
)
for /f "tokens=*" %%a in ('node --version') do echo        Node.js %%a - OK

:: ===== 2. Copy files =====
echo.
echo   [2/5] Deploying files to %INSTALL_DIR% ...
if exist "%INSTALL_DIR%" (
    echo        Updating (keeping existing data)...
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

:: ===== 3. npm install =====
echo.
echo   [3/5] Installing dependencies (needs internet, ~1-2 min)...
call npm install --omit=dev
if !errorlevel! neq 0 (
    echo   [FAIL] npm install failed. Check internet connection.
    pause
    goto :end
)
echo        Done.

:: ===== 4. Build =====
echo.
echo   [4/5] Building project...
call npm run build
if !errorlevel! neq 0 (
    echo   [FAIL] Build failed.
    pause
    goto :end
)
echo        Done.

:: ===== 5. Firewall + Auto-start =====
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

:: ===== Start =====
echo.
echo   Starting server...
start "habie-server" /B npm start
echo   Waiting for server to be ready...
timeout /t 5 >nul

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo   ======================================
    echo          SETUP COMPLETE!
    echo   ======================================
    echo.
    echo   URL:      http://localhost:3000
    echo   Admin:    guanli / yi2san4wu6
    echo   Folder:   %INSTALL_DIR%
    echo.
    echo   Start:    double-click start.bat
    echo   Stop:     double-click stop.bat
    echo   Auto-run on boot: YES
    echo.
) else (
    echo.
    echo   [WARN] Server may not be running.
    echo   Try starting it manually:
    echo.
    echo       cd /d %INSTALL_DIR%
    echo       npm start
    echo.
)

:end
pause
